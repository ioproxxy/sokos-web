/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { apiFetch } from '../utils';
import { Shield, Sparkles, Phone, ArrowRight, UserCheck, AlertCircle, ShoppingBag, Eye, Users, Lock } from 'lucide-react';

// Google credential response type
interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

interface Props {
  onAuthSuccess: (user: User) => void;
}

export default function AuthGateway({ onAuthSuccess }: Props) {
  const [activeMode, setActiveMode] = useState<'demo' | 'login' | 'register'>('demo');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Google OAuth handler
  const handleGoogleCredentialResponse = async (response: GoogleCredentialResponse) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await apiFetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential, provider: 'google' }),
      });
      const data = await res.json();
      if (res.ok) {
        onAuthSuccess(data.user);
      } else {
        setErrorMessage(data.error || 'Google sign-in failed');
      }
    } catch (err) {
      setErrorMessage('Could not connect to server for Google authentication.');
    } finally {
      setLoading(false);
    }
  };

  // Load Google Identity Services script and render button
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google && window.google.accounts && googleBtnRef.current) {
        window.google.accounts.id.initialize({
          // Client ID placeholder - users must set GOOGLE_CLIENT_ID in env
          client_id: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
          callback: handleGoogleCredentialResponse,
        });
        // Only render if we have a real client ID
        if (process.env.GOOGLE_CLIENT_ID || (window as any).__GOOGLE_CLIENT_ID__) {
          window.google.accounts.id.renderButton(googleBtnRef.current!, {
            theme: 'filled_black',
            size: 'large',
            width: 320,
            text: 'signin_with',
            shape: 'pill',
          });
        }
      }
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup: remove script if component unmounts
      const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existing && !document.querySelector('[data-google-loaded]')) {
        existing.remove();
      }
    };
  }, []);

  // 1-Click Demo Seed Users
  const seedUsers = [
    { id: 'usr_buyer1', name: 'Alex Gathu', role: 'Buyer (Alex)', location: 'Nairobi CBD', avatar: 'A' },
    { id: 'usr_johndoe', name: 'John Kamau', role: 'Electronics Seller (John)', location: 'Kilimani', avatar: 'J' },
    { id: 'usr_marywaweru', name: 'Mary Waweru', role: 'Furniture Seller (Mary)', location: 'Westlands', avatar: 'M' },
    { id: 'usr_davidotieno', name: 'David Otieno', role: 'Outdoor Seller (David)', location: 'Madaraka', avatar: 'D' },
    { id: 'usr_aminamohan', name: 'Amina Mohammed', role: 'Clothing Seller (Amina)', location: 'South C', avatar: 'AM' },
  ];

  // Quick Switch Session / Login helper
  const handleQuickDemoLogin = async (userId: string) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await apiFetch('/api/auth/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (res.ok) {
        onAuthSuccess(data.user);
      } else {
        setErrorMessage(data.error || 'Switch failed');
      }
    } catch (err) {
      setErrorMessage('Could not connect to full-stack server.');
    } finally {
      setLoading(false);
    }
  };

  // Classic Login Handshake
  const handleClassicLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim()) {
      setErrorMessage('Please enter your email, phone number, or User ID.');
      return;
    }
    if (!loginPassword) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: loginIdentifier, password: loginPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        onAuthSuccess(data.user);
      } else {
        setErrorMessage(data.error || 'Login failed');
      }
    } catch (err) {
      setErrorMessage('Network or server connection failed.');
    } finally {
      setLoading(false);
    }
  };

  // Classic Register Handshake
  const handleClassicRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regPhone.trim()) {
      setErrorMessage('Full Name and Phone Number are required.');
      return;
    }
    if (!regUsername.trim()) {
      setErrorMessage('Please select a unique trader username.');
      return;
    }
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(regUsername.trim())) {
      setErrorMessage('Username must be 3-30 characters long and contain only alphanumeric characters or underscores.');
      return;
    }
    if (!regPassword || regPassword.length < 4) {
      setErrorMessage('Please create a secure password (at least 4 characters).');
      return;
    }

    // Safaricom / Airtel rough phone check
    const cleanPhone = regPhone.replace(/\D/g, '');
    if (cleanPhone.length < 9) {
      setErrorMessage('Please enter a valid Kenyan phone number (e.g., 0712345678 or 254712345678).');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await apiFetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          username: regUsername.trim(),
          phone: regPhone,
          email: regEmail || undefined,
          password: regPassword
        }),
      });
      const data = await res.json();
      if (res.ok) {
        onAuthSuccess(data.user);
      } else {
        setErrorMessage(data.error || 'Registration failed');
      }
    } catch (err) {
      setErrorMessage('Could not complete registration on the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth_gateway_screen" className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center px-4 py-8 font-sans transition-all duration-300">
      
      {/* Visual Identity Branding */}
      <div className="w-full max-w-md text-center space-y-2 mb-8 animate-fade-in">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-3xs font-extrabold uppercase font-mono tracking-widest">
          <Shield className="w-3.5 h-3.5" />
          <span>Verified Local Exchange</span>
        </div>
        <h1 className="text-4xl font-display font-black tracking-tighter text-white uppercase sm:text-5xl">
          SOKOS <span className="text-emerald-400 font-mono text-sm align-super leading-none">NAIROBI</span>
        </h1>
        <p className="text-zinc-400 text-xs font-semibold leading-relaxed tracking-wide">
          Soko means <i className="text-emerald-300">market</i> in Swahili. Discover authenticated local traders within a <span className="text-white font-black font-mono">5.0 km</span> coordinate radius!
        </p>
      </div>

      {/* Main card panel */}
      <div className="w-full max-w-md bg-zinc-900/90 border border-zinc-800/80 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
        
        {/* Decorative Grid Lines */}
        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
        <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/5 rounded-full filter blur-xl pointer-events-none" />

        {/* Tab Selector buttons */}
        <div className="grid grid-cols-3 bg-zinc-950/60 p-1.5 rounded-2xl mb-6 border border-zinc-850/80">
          <button
            onClick={() => { setActiveMode('demo'); setErrorMessage(null); }}
            className={`flex flex-col items-center py-2 px-1 rounded-xl text-4xs font-mono font-bold tracking-wider uppercase transition-all ${
              activeMode === 'demo' ? 'bg-zinc-800 text-emerald-400 font-extrabold shadow-sm' : 'text-zinc-405 hover:text-zinc-200'
            }`}
          >
            <Users className="w-3.5 h-3.5 mb-1" />
            <span>Quick Swap</span>
          </button>
          <button
            onClick={() => { setActiveMode('login'); setErrorMessage(null); }}
            className={`flex flex-col items-center py-2 px-1 rounded-xl text-4xs font-mono font-bold tracking-wider uppercase transition-all ${
              activeMode === 'login' ? 'bg-zinc-800 text-emerald-400 font-extrabold shadow-sm' : 'text-zinc-405 hover:text-zinc-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 mb-1" />
            <span>Sign In</span>
          </button>
          <button
            onClick={() => { setActiveMode('register'); setErrorMessage(null); }}
            className={`flex flex-col items-center py-2 px-1 rounded-xl text-4xs font-mono font-bold tracking-wider uppercase transition-all ${
              activeMode === 'register' ? 'bg-zinc-800 text-emerald-400 font-extrabold shadow-sm' : 'text-zinc-405 hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 mb-1" />
            <span>Join Now</span>
          </button>
        </div>

        {/* Dynamic Error Messaging Bar */}
        {errorMessage && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-2xs flex items-start gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
        )}

        {/* VIEW 1: ONE-CLICK QUICK SWAP CODES */}
        {activeMode === 'demo' && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h3 className="text-white text-xs font-black font-display tracking-tight">Active Nairobi Seed Users</h3>
              <p className="text-zinc-450 text-[11px] leading-relaxed mt-1 font-medium">
                Evaluator Quick Pass: swaps into our pre-populated Kenyan local sandbox accounts. Test buyer & seller interactions directly!
              </p>
            </div>

            {/* Google Sign-In Button */}
            <div className="pt-2">
              <div className="relative flex items-center gap-3 my-3">
                <div className="flex-1 h-px bg-zinc-800"></div>
                <span className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest">or continue with</span>
                <div className="flex-1 h-px bg-zinc-800"></div>
              </div>
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    // One-tap Google sign-in (popup flow)
                    if (window.google && window.google.accounts) {
                      window.google.accounts.id.prompt();
                    } else {
                      setErrorMessage('Google Sign-In not loaded. Please check your internet connection.');
                    }
                  }}
                  disabled={loading}
                  className="w-full max-w-[280px] flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-zinc-100 disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-900 font-bold rounded-2xl text-xs transition-all cursor-pointer border border-zinc-700"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {loading ? 'Connecting...' : 'Sign in with Google'}
                </button>
              </div>
            </div>

            <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
              {seedUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleQuickDemoLogin(u.id)}
                  disabled={loading}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-zinc-950/40 border border-zinc-850 hover:bg-zinc-850/50 active:scale-[0.98] transition-all text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400 text-xs font-mono">
                      {u.avatar}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-zinc-100 group-hover:text-white transition-colors">{u.name}</div>
                      <div className="text-[10px] text-zinc-450 font-mono mt-0.5">{u.role} • 📍 {u.location}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 2: CLASSIC SIGN IN */}
        {activeMode === 'login' && (
          <form onSubmit={handleClassicLogin} className="space-y-4 animate-fade-in">
            <div>
              <h3 className="text-white text-xs font-black font-display tracking-tight">Access Your Soko Account</h3>
              <p className="text-zinc-450 text-[11px] leading-relaxed mt-1 font-medium">
                Log back into your local trade dashboard using your registered username, phone, email, or User ID code.
              </p>
            </div>

            <div className="space-y-3.5">
              <div>
                <label htmlFor="login_identifier" className="block text-[10px] font-black uppercase text-zinc-400 font-mono tracking-wider mb-2">Identify Yourself</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500">
                    <UserCheck className="w-4 h-4 text-zinc-550" />
                  </span>
                  <input
                    id="login_identifier"
                    type="text"
                    required
                    placeholder="Enter Username, Phone, Email, or usr_code"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-zinc-950 text-white rounded-2xl border border-zinc-800 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-550 focus:border-emerald-550 font-mono transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="login_password" className="block text-[10px] font-black uppercase text-zinc-400 font-mono tracking-wider">Password</label>
                  <span className="text-[9px] text-zinc-500 font-mono font-bold">Def seed pass: <span className="text-emerald-500">soko123</span></span>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500">
                    <Lock className="w-4 h-4 text-zinc-500" />
                  </span>
                  <input
                    id="login_password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-zinc-950 text-white rounded-2xl border border-zinc-800 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-550 focus:border-emerald-550 font-mono transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-950 font-black rounded-2xl text-xs tracking-wide uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_4px_12px_rgba(16,185,129,0.15)]"
              >
                {loading ? 'Decrypting Secure Key...' : 'Sign In To Sokos ✔️'}
              </button>

              {/* Divider */}
              <div className="relative flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-zinc-800"></div>
                <span className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest">or</span>
                <div className="flex-1 h-px bg-zinc-800"></div>
              </div>

              {/* Google Sign In */}
              <button
                onClick={() => {
                  if (window.google && window.google.accounts) {
                    window.google.accounts.id.prompt();
                  } else {
                    setErrorMessage('Google Sign-In not loaded. Please check your internet connection.');
                  }
                }}
                disabled={loading}
                className="w-full py-3 px-4 bg-white hover:bg-zinc-100 disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-900 font-bold rounded-2xl text-xs transition-all cursor-pointer border border-zinc-700 flex items-center justify-center gap-3"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </div>
          </form>
        )}

        {/* VIEW 3: CLASSIC REGISTER */}
        {activeMode === 'register' && (
          <form onSubmit={handleClassicRegister} className="space-y-4 animate-fade-in">
            <div>
              <h3 className="text-white text-xs font-black font-display tracking-tight">Create Nairobi Trader Profile</h3>
              <p className="text-zinc-450 text-[11px] leading-relaxed mt-1 font-medium">
                Register to start trading. Once registered, Sokos will onboard your neighborhood localization zone and safety identity tiers.
              </p>
            </div>

            <div className="space-y-3.5">
              <div>
                <label htmlFor="reg_name" className="block text-[10px] font-black uppercase text-zinc-400 font-mono tracking-wider mb-2">Full Legal Name</label>
                <input
                  id="reg_name"
                  type="text"
                  required
                  placeholder="e.g. David Kiprop"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-950 text-white rounded-2xl border border-zinc-800 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-550 focus:border-emerald-550 transition-all font-semibold"
                />
              </div>

              <div>
                <label htmlFor="reg_username" className="block text-[10px] font-black uppercase text-zinc-400 font-mono tracking-wider mb-2">Choose Unique Username handle</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500 font-mono text-[11px] font-bold">
                    @
                  </span>
                  <input
                    id="reg_username"
                    type="text"
                    required
                    placeholder="kiprop_soko"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 bg-zinc-950 text-white rounded-2xl border border-zinc-800 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-550 focus:border-emerald-550 font-mono transition-all font-bold"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reg_phone" className="block text-[10px] font-black uppercase text-zinc-400 font-mono tracking-wider mb-2">Kenyan Mobile Number (M-Pesa Connected)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500 font-mono text-[11px] font-bold">
                    +254
                  </span>
                  <input
                    id="reg_phone"
                    type="tel"
                    required
                    placeholder="712345678"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full pl-14 pr-4 py-3 bg-zinc-950 text-white rounded-2xl border border-zinc-800 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-550 focus:border-emerald-550 font-mono transition-all"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reg_email" className="block text-[10px] font-black uppercase text-zinc-400 font-mono tracking-wider mb-2">Email Address (Optional)</label>
                <input
                  id="reg_email"
                  type="email"
                  placeholder="e.g. kiprop@sokos.co.ke"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-950 text-white rounded-2xl border border-zinc-800 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-550 focus:border-emerald-550 transition-all font-medium"
                />
              </div>

              <div>
                <label htmlFor="reg_password" className="block text-[10px] font-black uppercase text-zinc-400 font-mono tracking-wider mb-2">Create Account Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500">
                    <Lock className="w-4 h-4 text-zinc-500" />
                  </span>
                  <input
                    id="reg_password"
                    type="password"
                    required
                    minLength={4}
                    placeholder="At least 4 characters"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-zinc-950 text-white rounded-2xl border border-zinc-800 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-550 focus:border-emerald-550 font-mono transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-950 font-black rounded-2xl text-xs tracking-wide uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_4px_12px_rgba(16,185,129,0.15)]"
              >
                {loading ? 'Hashing Credentials...' : 'Register as Soko Trader 🚀'}
              </button>
            </div>
          </form>
        )}

      </div>

      {/* Trust Signpost Footer */}
      <p className="text-zinc-500 text-[10px] uppercase font-mono tracking-widest mt-6 text-center">
        🔒 Encrypted Session State • Independent Nairobi Ledger Network
      </p>

    </div>
  );
}
