/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { db, getDistance } from './src/server/db.js'; // Use ESM extension if Node requires, or just import from ts/js
import { triggerStkPush } from './src/server/mpesa.js';
import { User, Listing, Message, Order, Notification, Review } from './src/types';

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Initialize Gemini Client
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Mock Active User ID on server (simplifies local preview, client can configure or override)
let activeUserId = ''; // Default unauthenticated guest session

// Dynamically resolve active user ID on a per-request basis
function getRequestUserId(req: express.Request): string {
  // 1. Check custom HTTP Header
  const headerId = req.headers['x-soko-user-id'];
  if (headerId && typeof headerId === 'string' && headerId.trim()) {
    return headerId.trim();
  }

  // 2. Check Cookie Header
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const cookies = cookieHeader.split(';');
    for (const cookie of cookies) {
      const [name, ...valueParts] = cookie.trim().split('=');
      if (name === 'soko_user_id') {
        const val = valueParts.join('=');
        if (val && val.trim()) return val.trim();
      }
    }
  }

  // 3. Fallback to original server-wide session
  return activeUserId;
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    activeUser: getRequestUserId(req),
    geminiActive: !!ai,
    message: 'Sokos Local Trade API is alive. Nginx reverse proxy supported.'
  });
});

// --- Comprehensive Active User Auth & Onboarding Gateways ---

// Retrieve current logged in session
app.get('/api/auth/me', async (req, res) => {
  const reqUserId = getRequestUserId(req);
  if (!reqUserId) {
    return res.status(401).json({ error: 'No active session' });
  }
  const user = await db.getUserById(reqUserId);
  if (!user) {
    return res.status(401).json({ error: 'User profile not found' });
  }
  // Ensure seed users are marked as onboarded by default
  const isSeed = ['usr_buyer1', 'usr_johndoe', 'usr_marywaweru', 'usr_davidotieno', 'usr_aminamohan'].includes(user.id);
  if (isSeed && user.onboarded === undefined) {
    user.onboarded = true;
  }
  res.json(user);
});

// Switch active user session directly (demo quick swap)
app.post('/api/auth/switch', async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }
  const user = await db.getUserById(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found in system storage' });
  }
  activeUserId = userId;
  res.setHeader('Set-Cookie', `soko_user_id=${userId}; Path=/; HttpOnly; SameSite=None; Secure`);
  res.json({ message: 'Switched user successfully', user });
});

// Authenticate via identifier (username, email, or phone number) and custom password
app.post('/api/auth/login', async (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier) {
    return res.status(400).json({ error: 'Username, email, or phone is required' });
  }
  if (!password) {
    return res.status(400).json({ error: 'Password is required to authenticate.' });
  }

  const cleanId = identifier.trim().toLowerCase();
  
  // Search users list for matches
  const users = await db.getUsers();
  const matchedUser = users.find(u => 
    u.id.toLowerCase() === cleanId || 
    (u.username && u.username.toLowerCase() === cleanId) || 
    (u.email && u.email.toLowerCase() === cleanId) || 
    u.phone === cleanId || 
    u.phone.replace(/\s+/g, '') === cleanId.replace(/\s+/g, '')
  );

  if (!matchedUser) {
    return res.status(404).json({ error: 'No account matching this credential was found on Sokos. Try registering!' });
  }

  // Validate the password setting (seed users fallback to 'soko123' if empty)
  const officialPassword = matchedUser.password || 'soko123';
  if (password.trim() !== officialPassword) {
    return res.status(401).json({ error: 'Incorrect password. Please verify your credentials and try again.' });
  }

  activeUserId = matchedUser.id;
  res.setHeader('Set-Cookie', `soko_user_id=${matchedUser.id}; Path=/; HttpOnly; SameSite=None; Secure`);
  res.json({ message: 'Welcome back to Sokos!', user: matchedUser });
});

// Register a new native Sokos user (starts onboarding state)
app.post('/api/auth/register', async (req, res) => {
  const { name, username, phone, email, password } = req.body;
  
  if (!name || !phone) {
    return res.status(400).json({ error: 'Full Name and Kenyan Mobile Number are required.' });
  }
  if (!username) {
    return res.status(400).json({ error: 'Username is required to establish identification handle.' });
  }
  
  const cleanUsername = username.trim().toLowerCase();
  if (!/^[a-zA-Z0-9_]{3,30}$/.test(cleanUsername)) {
    return res.status(400).json({ error: 'Username must be 3-30 characters long and contain only letters, numbers, and underscores.' });
  }

  if (!password) {
    return res.status(400).json({ error: 'A secure password is required to protect your merchant account.' });
  }
  if (password.length < 4) {
    return res.status(400).json({ error: 'Your password must be at least 4 characters long.' });
  }

  // Double check duplicates
  const users = await db.getUsers();
  
  // Check duplicate username
  const usernameDup = users.find(u => u.username && u.username.toLowerCase() === cleanUsername);
  if (usernameDup) {
    return res.status(400).json({ error: 'This username is already taken. Please choose another one!' });
  }

  const duplicate = users.find(u => u.phone === phone || (email && u.email && u.email.toLowerCase() === email.toLowerCase()));
  if (duplicate) {
    return res.status(400).json({ error: 'An account has already been registered with this mobile number or email address.' });
  }

  // Create a clean new state with default unonboarded indicators
  const newUserId = `usr_${Date.now().toString(36)}`;
  const newUser: User = {
    id: newUserId,
    name: name.trim(),
    username: cleanUsername,
    phone: phone.trim(),
    email: email ? email.trim() : undefined,
    password: password.trim(),
    verified: false,
    docVerified: false,
    rating: 5.0,
    reviewsCount: 0,
    locationName: 'Nairobi CBD', // Default unconfigured location representation
    latitude: -1.2833,
    longitude: 36.8219,
    createdAt: new Date().toISOString(),
    onboarded: false // Force the onboarding wizard on first load
  };

  await db.createUser(newUser);
  activeUserId = newUserId;
  res.setHeader('Set-Cookie', `soko_user_id=${newUserId}; Path=/; HttpOnly; SameSite=None; Secure`);

  // Dispatch initial welcoming system notification
  await db.createNotification({
    id: `notif_welcome_${Date.now()}`,
    userId: newUserId,
    title: 'Karibu Sokos! 🛍️',
    message: 'Welcome to the safest local merchant trade coordinate exchange in Nairobi. Please finish your onboarding to discover close-proximity goods!',
    type: 'verification',
    read: false,
    createdAt: new Date().toISOString()
  });

  res.status(201).json({ message: 'Account registered successfully.', user: newUser });
});

// Handle the interactive onboarding steps
app.post('/api/auth/onboard', async (req, res) => {
  const reqUserId = getRequestUserId(req);
  if (!reqUserId) {
    return res.status(401).json({ error: 'Unauthorized. Please sign up or login first.' });
  }

  const { locationName, latitude, longitude, avatarUrl, verified, docVerified, verificationDocType } = req.body;

  if (!locationName || latitude === undefined || longitude === undefined) {
    return res.status(400).json({ error: 'Please choose or search your Nairobi neighborhood to compute coordinate matching distance filters.' });
  }

  try {
    const updated = await db.updateUser(reqUserId, {
      locationName,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      avatarUrl: avatarUrl || undefined,
      verified: !!verified,
      docVerified: !!docVerified,
      verificationDocType: verificationDocType || undefined,
      onboarded: true // onboarding successfully concluded
    });

    res.json({ message: 'Onboarding complete! Enjoy direct safe trading.', user: updated });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Clear active session to show auth gateway screen
app.post('/api/auth/logout', (req, res) => {
  activeUserId = '';
  res.setHeader('Set-Cookie', `soko_user_id=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=None; Secure`);
  res.json({ success: true, message: 'Logged out successfully' });
});

app.get('/api/users', async (req, res) => {
  res.json(await db.getUsers());
});

app.get('/api/users/:id', async (req, res) => {
  const user = await db.getUserById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// Update user profile details (e.g. name, location details, etc.)
app.post('/api/users/:id', async (req, res) => {
  const { name, locationName, latitude, longitude, avatarUrl, email, phone } = req.body;
  try {
    const updated = await db.updateUser(req.params.id, {
      ...(name !== undefined && { name }),
      ...(locationName !== undefined && { locationName }),
      ...(latitude !== undefined && { latitude: parseFloat(latitude) }),
      ...(longitude !== undefined && { longitude: parseFloat(longitude) }),
      ...(avatarUrl !== undefined && { avatarUrl }),
      ...(email !== undefined && { email }),
      ...(phone !== undefined && { phone }),
    });
    res.json(updated);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// --- User Profile verification ---
app.post('/api/users/:id/verify', async (req, res) => {
  const { docType } = req.body;
  if (!docType) {
    return res.status(400).json({ error: 'Identity document type is required' });
  }

  try {
    const updated = await db.updateUser(req.params.id, {
      verified: true,
      docVerified: true,
      verificationDocType: docType
    });

    // Create system notification
    await db.createNotification({
      id: `notif_verify_${Date.now()}`,
      userId: req.params.id,
      title: 'Profile Verified Successfully ✔️',
      message: `Your account has been fully verified using your ${docType}. Willing buyers can now trade with absolute confidence!`,
      type: 'verification',
      read: false,
      createdAt: new Date().toISOString()
    });

    res.json(updated);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// --- Listings API ---
app.get('/api/listings', async (req, res) => {
  const { query, category, maxDistance, latitude, longitude, sortBy } = req.query;

  const filters = {
    query: query as string,
    category: category as string,
    maxDistance: maxDistance ? parseFloat(maxDistance as string) : 5.0, // Default 5km
    latitude: latitude ? parseFloat(latitude as string) : undefined,
    longitude: longitude ? parseFloat(longitude as string) : undefined,
    sortBy: sortBy as string
  };

  const listings = await db.getListings(filters);
  res.json(listings);
});

app.get('/api/listings/:id', async (req, res) => {
  const listing = await db.getListingById(req.params.id);
  if (!listing) return res.status(404).json({ error: 'Listing not found' });
  res.json(listing);
});

app.post('/api/listings', async (req, res) => {
  const { title, description, price, category, condition, latitude, longitude, imageUrl } = req.body;

  if (!title || !description || !price || !category || !condition || !latitude || !longitude) {
    return res.status(400).json({ error: 'Missing required listing fields' });
  }

  const reqUserId = getRequestUserId(req);
  const user = await db.getUserById(reqUserId);
  if (!user) return res.status(401).json({ error: 'User not authenticated' });

  const newListing: Listing = {
    id: `lst_${Date.now()}`,
    title,
    description,
    price: parseFloat(price),
    category,
    images: [imageUrl || 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=600&q=80'],
    vendorId: user.id,
    vendorName: user.name,
    vendorVerified: user.verified,
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude),
    createdAt: new Date().toISOString(),
    status: 'active',
    condition
  };

  const saved = await db.createListing(newListing);
  res.status(201).json(saved);
});

// Mark listing as sold
app.post('/api/listings/:id/sold', async (req, res) => {
  try {
    const listing = await db.getListingById(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    
    const reqUserId = getRequestUserId(req);
    if (listing.vendorId !== reqUserId) {
      return res.status(403).json({ error: 'Unauthorized to update this listing' });
    }

    const updated = await db.updateListing(req.params.id, { status: 'sold' });
    res.json(updated);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// --- Messaging API ---
app.get('/api/conversations', async (req, res) => {
  const reqUserId = getRequestUserId(req);
  res.json(await db.getConversationsForUser(reqUserId));
});

app.get('/api/messages/:otherUserId/:listingId', async (req, res) => {
  const reqUserId = getRequestUserId(req);
  res.json(await db.getMessagesBetween(reqUserId, req.params.otherUserId, req.params.listingId));
});

app.post('/api/messages', async (req, res) => {
  const { receiverId, listingId, text } = req.body;
  if (!receiverId || !listingId || !text) {
    return res.status(400).json({ error: 'Missing receiverId, listingId, or text' });
  }

  const reqUserId = getRequestUserId(req);
  if (!reqUserId) {
    return res.status(401).json({ error: 'User must be authenticated to send messages.' });
  }

  const newMessage: Message = {
    id: `msg_${Date.now()}`,
    senderId: reqUserId,
    receiverId,
    listingId,
    text,
    createdAt: new Date().toISOString()
  };

  const saved = await db.createMessage(newMessage);

  // Send real-time notification to receiver
  await db.createNotification({
    id: `notif_msg_${Date.now()}`,
    userId: receiverId,
    title: `New message on Soko`,
    message: `You received a message: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`,
    type: 'message',
    read: false,
    link: `/messages?listingId=${listingId}&userId=${reqUserId}`,
    createdAt: new Date().toISOString()
  });

  res.status(201).json(saved);
});

// --- Orders & M-Pesa Integration API ---
app.get('/api/orders', async (req, res) => {
  const reqUserId = getRequestUserId(req);
  res.json(await db.getOrdersForUser(reqUserId));
});

app.post('/api/orders', async (req, res) => {
  const { listingId, paymentMethod } = req.body;
  if (!listingId || !paymentMethod) {
    return res.status(400).json({ error: 'Missing listingId or paymentMethod' });
  }

  const listing = await db.getListingById(listingId);
  if (!listing) return res.status(404).json({ error: 'Listing not found' });

  const reqUserId = getRequestUserId(req);
  const buyer = await db.getUserById(reqUserId);
  if (!buyer) return res.status(401).json({ error: 'Buyer not verified' });

  const newOrder: Order = {
    id: `ord_${Date.now()}`,
    buyerId: buyer.id,
    buyerName: buyer.name,
    sellerId: listing.vendorId,
    sellerName: listing.vendorName,
    listingId: listing.id,
    listingTitle: listing.title,
    listingImage: listing.images[0],
    price: listing.price,
    status: paymentMethod === 'mpesa' ? 'mpesa_pending' : 'pending',
    paymentMethod,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const saved = await db.createOrder(newOrder);

  // Create notifications
  await db.createNotification({
    id: `notif_order_seller_${Date.now()}`,
    userId: listing.vendorId,
    title: 'New Offer Received 🛍️',
    message: `${buyer.name} placed an order on your listing: "${listing.title}". Payment method: ${paymentMethod.toUpperCase()}`,
    type: 'order_update',
    read: false,
    link: '/orders',
    createdAt: new Date().toISOString()
  });

  res.status(201).json(saved);
});

// M-Pesa STK Push Trigger Route
app.post('/api/orders/:id/stkpush', async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ error: 'M-Pesa phone number is required (Format: 07xxxxxxxx or 2547xxxxxxxx)' });
  }

  const order = await db.getOrderById(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  // Validate Safaricom phone format roughly
  const cleanPhone = phone.replace(/\D/g, '');
  if (!/^((254)|(0))?((7)|(1))[0-9]{8}$/.test(cleanPhone)) {
    return res.status(400).json({ error: 'Invalid Safaricom M-Pesa mobile number' });
  }

  const isRealMpesaEnabled = !!(process.env.MPESA_CONSUMER_KEY && process.env.MPESA_CONSUMER_SECRET);

  if (isRealMpesaEnabled) {
    try {
      console.log(`[M-PESA / DARAJA] Triggering real STK Push to ${phone} for Order ID: ${order.id}...`);
      const result = await triggerStkPush({
        phoneNumber: phone,
        amount: order.price,
        orderId: order.id
      });

      console.log('[M-PESA / DARAJA] Gateway response:', result);

      if (result.ResponseCode === '0') {
        const checkoutRequestId = result.CheckoutRequestID;

        await db.updateOrder(order.id, {
          status: 'mpesa_pending',
          mpesaPhone: phone,
          mpesaCheckoutRequestId: checkoutRequestId,
          updatedAt: new Date().toISOString()
        });

        // System notification
        await db.createNotification({
          id: `notif_stk_sent_${Date.now()}`,
          userId: order.buyerId,
          title: 'M-Pesa STK Push Sent 📱',
          message: `Safaricom Lipa Na M-Pesa STK payment prompt of KES ${order.price.toLocaleString()} was pushed to your phone ${phone}. Please enter your M-Pesa PIN on your phone handset screen to authorize payment.`,
          type: 'order_update',
          read: false,
          createdAt: new Date().toISOString()
        });

        return res.json({
          success: true,
          realPush: true,
          message: 'STK Push successfully triggered on subscriber handset.',
          checkoutRequestId
        });
      } else {
        return res.status(400).json({
          error: `Safaricom responded with error: ${result.ResponseDescription || result.CustomerMessage}`
        });
      }
    } catch (e: any) {
      console.error('[M-PESA / DARAJA] Error during real push trigger:', e);
      return res.status(500).json({
        error: `Daraja API execution failed: ${e.message}. Check integration credentials inside VPS configuration.`
      });
    }
  } else {
    // Simulate an STK Push trigger
    const checkoutRequestId = `ws_CO_${Date.now()}_${Math.floor(100000 + Math.random() * 900000)}`;

    await db.updateOrder(order.id, {
      status: 'mpesa_pending',
      mpesaPhone: phone,
      mpesaCheckoutRequestId: checkoutRequestId,
      updatedAt: new Date().toISOString()
    });

    // System notification
    await db.createNotification({
      id: `notif_stk_sent_${Date.now()}`,
      userId: order.buyerId,
      title: 'M-Pesa STK Push Prompt Sent 📱',
      message: `[SIMULATION] M-Pesa PIN prompt of KES ${order.price.toLocaleString()} sent to ${phone}. Enter your PIN to complete the transaction secure.`,
      type: 'order_update',
      read: false,
      createdAt: new Date().toISOString()
    });

    res.json({
      success: true,
      realPush: false,
      message: 'STK Push successfully triggered on subscriber handset (SIMULATED).',
      checkoutRequestId
    });
  }
});

/**
 * M-Pesa Daraja Callback Endpoint Webhook
 * Safaricom calls this URL asynchronously after subscriber inputs PIN or cancels prompt.
 * This handles parsing M-Pesa feedback and updating the order database.
 */
app.post('/api/mpesa/callback', async (req, res) => {
  console.log('M-Pesa Daraja STKCallback Received:', JSON.stringify(req.body, null, 2));

  const body = req.body;
  if (!body || !body.Body || !body.Body.stkCallback) {
    return res.status(400).json({ error: 'Invalid callback format' });
  }

  const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = body.Body.stkCallback;

  // Search for order with matching CheckoutRequestID
  const order = await db.getOrderByMpesaCheckoutRequestId(CheckoutRequestID);

  if (!order) {
    console.error(`M-Pesa Callback: No matching order found for CheckoutRequestID: ${CheckoutRequestID}`);
    return res.json({ ResultCode: 1, ResultDesc: 'No matching order details found' });
  }

  if (ResultCode === 0) {
    // Payment Successful! Extract Transaction details
    let receiptNumber = 'MPESA_MOCK_' + Math.floor(100000 + Math.random() * 900000);
    if (CallbackMetadata && CallbackMetadata.Item) {
      const receiptItem = CallbackMetadata.Item.find((item: any) => item.Name === 'MpesaReceiptNumber');
      if (receiptItem && receiptItem.Value) {
        receiptNumber = receiptItem.Value;
      }
    }

    db.updateOrder(order.id, {
      status: 'paid',
      mpesaReceiptNumber: receiptNumber,
      updatedAt: new Date().toISOString()
    });

    // Notify buyer
    db.createNotification({
      id: `notif_pay_success_buyer_${Date.now()}`,
      userId: order.buyerId,
      title: 'M-Pesa Payment Received 💸',
      message: `KES ${order.price.toLocaleString()} for order on "${order.listingTitle}" cleared successfully. Receipt: ${receiptNumber}.`,
      type: 'payment_received',
      read: false,
      link: '/orders',
      createdAt: new Date().toISOString()
    });

    // Notify seller
    db.createNotification({
      id: `notif_pay_success_seller_${Date.now()}`,
      userId: order.sellerId,
      title: 'Payment Confirmed! 💰',
      message: `${order.buyerName} has completed M-Pesa payment for "${order.listingTitle}". Receipt: ${receiptNumber}. Release the item!`,
      type: 'payment_received',
      read: false,
      link: '/orders',
      createdAt: new Date().toISOString()
    });

    console.log(`M-Pesa Payment SUCCESS for Order ${order.id}. Reference receipt: ${receiptNumber}`);
  } else {
    // Payment failed or cancelled
    db.updateOrder(order.id, {
      status: 'cancelled',
      updatedAt: new Date().toISOString()
    });

    db.createNotification({
      id: `notif_pay_fail_${Date.now()}`,
      userId: order.buyerId,
      title: 'M-Pesa Payment Failed ⚠️',
      message: `M-Pesa transaction failed/cancelled: ${ResultDesc}`,
      type: 'order_update',
      read: false,
      createdAt: new Date().toISOString()
    });

    console.log(`M-Pesa Payment FAILED/CANCELLED for Order ${order.id}. Code: ${ResultCode}, Desc: ${ResultDesc}`);
  }

  res.json({ ResultCode: 0, ResultDesc: "Callback parsed successfully and database updated." });
});

// Simulate webhook callback trigger in dev UI panel
app.post('/api/mpesa/simulate-callback', (req, res) => {
  const { checkoutRequestId, success } = req.body;
  if (!checkoutRequestId) {
    return res.status(400).json({ error: 'checkoutRequestId is required for simulation' });
  }

  const payload = {
    Body: {
      stkCallback: {
        MerchantRequestID: 'sh_req_mock_123',
        CheckoutRequestID: checkoutRequestId,
        ResultCode: success ? 0 : 1032,
        ResultDesc: success ? 'The service request is processed successfully.' : 'Request cancelled by the user.',
        CallbackMetadata: success ? {
          Item: [
            { Name: 'Amount', Value: 1.00 },
            { Name: 'MpesaReceiptNumber', Value: 'QSF9' + Math.random().toString(36).substr(2, 6).toUpperCase() },
            { Name: 'TransactionDate', Value: 20260601181511 },
            { Name: 'PhoneNumber', Value: 254712345678 }
          ]
        } : undefined
      }
    }
  };

  // Dispatch mock callback internally
  try {
    // Call our callback route internally
    const dbCache = (db as any).cache;
    const order = dbCache.orders.find((o: Order) => o.mpesaCheckoutRequestId === checkoutRequestId);
    
    if (!order) {
      return res.status(404).json({ error: 'No order matched this checkout ID for simulation' });
    }

    // Process callback values directly in Database
    if (success) {
      const receipt = 'QSF' + Math.floor(100000 + Math.random() * 900000);
      db.updateOrder(order.id, {
        status: 'paid',
        mpesaReceiptNumber: receipt,
        updatedAt: new Date().toISOString()
      });

      // Notifications
      db.createNotification({
        id: `notif_pay_success_buyer_${Date.now()}`,
        userId: order.buyerId,
        title: 'M-Pesa Payment Confirmed KES ' + order.price,
        message: `Your payment was successfully received. Receipt: ${receipt}.`,
        type: 'payment_received',
        read: false,
        createdAt: new Date().toISOString()
      });

      db.createNotification({
        id: `notif_pay_success_seller_${Date.now()}`,
        userId: order.sellerId,
        title: 'M-Pesa Cash Received KES ' + order.price,
        message: `${order.buyerName} paid via M-Pesa. Prepare packaging and release the item.`,
        type: 'payment_received',
        read: false,
        createdAt: new Date().toISOString()
      });
    } else {
      db.updateOrder(order.id, {
        status: 'cancelled',
        updatedAt: new Date().toISOString()
      });

      db.createNotification({
        id: `notif_pay_fail_${Date.now()}`,
        userId: order.buyerId,
        title: 'STK Payment Cancelled',
        message: 'M-Pesa transaction was cancelled or timed out.',
        type: 'order_update',
        read: false,
        createdAt: new Date().toISOString()
      });
    }

    res.json({ success: true, message: 'Daraja Callback simulated successfully!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update order status (mark complete / cancel)
app.post('/api/orders/:id/status', async (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Status is required' });

  try {
    const order = await db.getOrderById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const reqUserId = getRequestUserId(req);

    // Validate permission (only seller/buyer can progress statuses)
    if (status === 'completed' && order.sellerId !== reqUserId) {
      return res.status(403).json({ error: 'Only the vendor can mark direct trades as completed' });
    }

    const updated = await db.updateOrder(order.id, {
      status,
      updatedAt: new Date().toISOString()
    });

    // Notify other party
    const targetUserId = (reqUserId === order.buyerId) ? order.sellerId : order.buyerId;
    await db.createNotification({
      id: `notif_status_update_${Date.now()}`,
      userId: targetUserId,
      title: 'Order Status Updated 📦',
      message: `Your order for "${order.listingTitle}" has been marked as ${status.toUpperCase()} by the system.`,
      type: 'order_update',
      read: false,
      link: '/orders',
      createdAt: new Date().toISOString()
    });

    res.json(updated);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// --- Rating system Seller Reviews ---
app.get('/api/users/:id/reviews', async (req, res) => {
  res.json(await db.getReviewsForUser(req.params.id));
});

app.post('/api/ratings', async (req, res) => {
  const { targetUserId, rating, text } = req.body;
  if (!targetUserId || !rating || !text) {
    return res.status(400).json({ error: 'Missing targetUserId, rating, or review text' });
  }

  const reqUserId = getRequestUserId(req);
  const buyer = await db.getUserById(reqUserId);
  if (!buyer) return res.status(401).json({ error: 'User must be logged in' });

  try {
    const newReview: Review = {
      id: `rev_${Date.now()}`,
      targetUserId,
      reviewerId: buyer.id,
      reviewerName: buyer.name,
      rating: parseInt(rating),
      text,
      createdAt: new Date().toISOString()
    };

    const saved = await db.createReview(newReview);

    // Notify vendor of rating
    await db.createNotification({
      id: `notif_review_${Date.now()}`,
      userId: targetUserId,
      title: 'New Rating Received ⭐',
      message: `${buyer.name} left you a ${rating}-star review: "${text.substring(0, 30)}..."`,
      type: 'verification',
      read: false,
      createdAt: new Date().toISOString()
    });

    res.status(201).json(saved);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// --- Notifications API ---
app.get('/api/notifications', async (req, res) => {
  const reqUserId = getRequestUserId(req);
  res.json(await db.getNotificationsForUser(reqUserId));
});

app.post('/api/notifications/read-all', async (req, res) => {
  const reqUserId = getRequestUserId(req);
  await db.markAllNotificationsRead(reqUserId);
  res.json({ message: 'Notifications cleared.' });
});

app.post('/api/notifications/:id/read', async (req, res) => {
  await db.markNotificationRead(req.params.id);
  res.json({ message: 'Notification marked read.' });
});

// --- Gemini AI Trade Smart Insights ---
app.post('/api/gemini/analyze', async (req, res) => {
  if (!ai) {
    return res.status(200).json({
      fallback: true,
      analysis: "Gemini API key not configured yet. AI smart insights will emerge once active in settings.",
      suggestedPrice: req.body.price ? `${req.body.price} KES` : "Market Average",
      swahiliKeywords: ["Mali safi", "Inafanya kazi vizuri", "Bei nafuu", "Usiikose"],
      safetyLevel: "High"
    });
  }

  const { title, description, price, category } = req.body;

  try {
    const prompt = `Analyze this local trade listing for Nairobi marketplace Sokos:
Product Name: "${title}"
Category: "${category}"
Listed Price: "${price} KES"
Description: "${description}"

Generate a trade advice sheet. Please return a raw JSON with the following schema:
{
  "optimizedTitle": "A concise, catchy title maximized for Swahili search traffic",
  "swahiliKeywords": ["3-4 Swahili selling catchphrases (like 'Mali safi', 'Bei poa', 'Inafanya kazi')", ...],
  "marketPriceValidation": "Is this price fair in current Kenyan marketplace? Suggest a standard KES price range for comparison",
  "buyerSafetyTips": ["2 quick safety tips specific to this product category for physical trade coordinate meets", ...],
  "riskScore": "Low | Medium | High"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, ...parsed });
  } catch (err: any) {
    console.error('Gemini Smart Insight exception:', err);
    res.status(500).json({ error: 'AI advisor went offline. Try listing again.' });
  }
});


// Start custom server & Vite middleware
async function startServer() {
  // Vite integration
  if (process.env.DISABLE_HMR === 'true') {
    console.log('Developing with Watch/HMR settings adjusted.');
  }

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Sokos Full-Stack Server running on port ${PORT}`);
  });
}

startServer();
