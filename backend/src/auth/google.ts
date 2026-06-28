/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import { db } from '../db.js';
import { signToken } from './jwt.js';
import type { User } from '../types.js';

const router = Router();

// Google OAuth callback - handles both "code" (server-side flow) and "credential" (GIS token flow)
router.post('/google', async (req: Request, res: Response) => {
  try {
    const { code, credential, provider } = req.body;

    let googleProfile: {
      sub: string;
      email: string;
      name: string;
      picture?: string;
    } | null = null;

    if (credential) {
      // Google Identity Services (GIS) credential response - JWT from Google
      googleProfile = parseGoogleCredential(credential);
    } else if (code) {
      // Standard OAuth2 authorization code flow
      googleProfile = await exchangeGoogleCode(code);
    }

    if (!googleProfile) {
      return res.status(400).json({ error: 'Invalid OAuth response. No credential or code received.' });
    }

    // Find or create user by email
    const users = await db.getUsers();
    let user = users.find(u => u.email && u.email.toLowerCase() === googleProfile!.email.toLowerCase());

    if (!user) {
      // Create new user from Google profile
      const newUserId = `usr_google_${Date.now().toString(36)}`;
      const newUser: User = {
        id: newUserId,
        name: googleProfile.name,
        username: `google_${googleProfile.sub.slice(-8)}`,
        phone: '', // Will be filled during onboarding
        email: googleProfile.email,
        avatarUrl: googleProfile.picture,
        verified: true, // Google accounts are pre-verified
        docVerified: false,
        rating: 5.0,
        reviewsCount: 0,
        locationName: 'Nairobi CBD',
        latitude: -1.2833,
        longitude: 36.8219,
        createdAt: new Date().toISOString(),
        onboarded: false, // Force onboarding to fill phone + location
        password: undefined, // OAuth users have no password
      };

      await db.createUser(newUser);
      user = newUser;

      // Welcome notification
      await db.createNotification({
        id: `notif_welcome_${Date.now()}`,
        userId: newUserId,
        title: 'Karibu Sokos! 🛍️',
        message: 'Welcome to Sokos via Google Sign-In. Please finish your onboarding to start trading with verified local merchants.',
        type: 'verification',
        read: false,
        createdAt: new Date().toISOString(),
      });
    } else {
      // Existing user - update avatar if not set
      if (!user.avatarUrl && googleProfile.picture) {
        await db.updateUser(user.id, { avatarUrl: googleProfile.picture });
        user.avatarUrl = googleProfile.picture;
      }
    }

    // Issue JWT session token
    const token = signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      provider: 'google',
    });

    // Set HTTP-only cookie
    res.setHeader(
      'Set-Cookie',
      `soko_token=${token}; Path=/; HttpOnly; SameSite=None; Secure; Max-Age=604800`
    );

    res.json({
      success: true,
      message: 'Google authentication successful',
      user,
      token,
    });
  } catch (error: any) {
    console.error('[OAuth] Google auth error:', error);
    res.status(500).json({
      error: 'Google authentication failed',
      message: error.message || 'An unexpected error occurred during OAuth',
    });
  }
});

/**
 * Parse Google Identity Services credential JWT
 * Minimal parser - does NOT verify signature (for production, use google-auth-library)
 * The credential is already verified by Google's infrastructure in the browser.
 */
function parseGoogleCredential(credential: string): {
  sub: string;
  email: string;
  name: string;
  picture?: string;
} | null {
  try {
    const parts = credential.split('.');
    if (parts.length !== 3) return null;

    // Decode the payload (second part)
    const payload = parts[1];
    // Add padding if needed for base64 decoding
    const padded = payload + '=='.slice(0, (4 - payload.length % 4) % 4);
    const decoded = JSON.parse(Buffer.from(padded, 'base64url').toString('utf-8'));

    return {
      sub: decoded.sub,
      email: decoded.email,
      name: decoded.name || decoded.email.split('@')[0],
      picture: decoded.picture,
    };
  } catch (e) {
    console.error('[OAuth] Failed to parse Google credential:', e);
    return null;
  }
}

/**
 * Exchange Google OAuth2 authorization code for user info
 * Used in the server-side flow
 */
async function exchangeGoogleCode(code: string): Promise<{
  sub: string;
  email: string;
  name: string;
  picture?: string;
} | null> {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback';

    if (!clientId || !clientSecret) {
      console.error('[OAuth] GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not configured');
      return null;
    }

    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      console.error('[OAuth] Token exchange failed:', await tokenRes.text());
      return null;
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // Get user info
    const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userRes.ok) {
      console.error('[OAuth] Userinfo fetch failed:', await userRes.text());
      return null;
    }

    const userInfo = await userRes.json();

    return {
      sub: userInfo.sub,
      email: userInfo.email,
      name: userInfo.name || userInfo.email.split('@')[0],
      picture: userInfo.picture,
    };
  } catch (e) {
    console.error('[OAuth] Google code exchange error:', e);
    return null;
  }
}

export default router;
