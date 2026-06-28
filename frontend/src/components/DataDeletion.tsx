/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { apiFetch } from '../utils';

export default function DataDeletion() {
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!confirming) {
      setConfirming(true);
      return;
    }

    setError(null);
    try {
      const res = await apiFetch('/api/data-deletion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, reason }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to submit deletion request. Please try again.');
        setConfirming(false);
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
      setConfirming(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 select-none">
      <header className="sticky top-0 z-40 bg-zinc-950 text-white border-b border-zinc-800">
        <div className="max-w-3xl mx-auto px-5 py-3.5 flex items-center gap-4">
          <Link to="/" className="p-2 hover:bg-zinc-800 rounded-full transition cursor-pointer">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-rose-400" />
            <h1 className="font-display font-black tracking-tight text-lg">Data Deletion Request</h1>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-6 py-8 space-y-6 text-sm text-zinc-700 leading-relaxed">
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl text-rose-900 text-xs flex gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold mb-1">This action is permanent and irreversible.</p>
            <p>Submitting a data deletion request will permanently erase your account, listings, messages, order history, verification documents, and all associated personal data within 30 days, in compliance with the Kenya Data Protection Act, 2019.</p>
          </div>
        </div>

        {!submitted ? (
          <>
            <section>
              <h2 className="font-black text-zinc-900 mb-2 text-base">What will be deleted</h2>
              <ul className="list-disc ml-5 space-y-1 text-xs">
                <li>Your account profile (name, phone, email, location data)</li>
                <li>All active and past listings</li>
                <li>Chat messages and conversation history</li>
                <li>Order and payment records</li>
                <li>Verification documents (ID, passport, business permit images)</li>
                <li>Ratings and reviews (yours and those left for you)</li>
                <li>Notification history</li>
                <li>GPS coordinates and location preferences</li>
              </ul>
            </section>

            <section>
              <h2 className="font-black text-zinc-900 mb-2 text-base">What may be retained</h2>
              <ul className="list-disc ml-5 space-y-1 text-xs">
                <li>Anonymized transaction records required by Kenyan financial regulations.</li>
                <li>M-Pesa payment records held by Safaricom (contact Safaricom separately).</li>
              </ul>
            </section>

            <div className="space-y-4 pt-2 border-t border-zinc-100">
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1.5 uppercase tracking-wider font-mono">Email Address *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(null); }}
                  placeholder="Enter the email associated with your account"
                  className="w-full text-sm border border-zinc-200 rounded-xl px-4 py-3 focus:border-rose-400 focus:ring-1 focus:ring-rose-300 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1.5 uppercase tracking-wider font-mono">Reason (optional)</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  placeholder="Tell us why you're deleting your data (helps us improve)"
                  className="w-full text-sm border border-zinc-200 rounded-xl px-4 py-3 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-300 outline-none transition resize-none"
                />
              </div>

              {confirming && (
                <div className="bg-rose-50 border border-rose-300 p-4 rounded-xl space-y-3">
                  <p className="text-rose-800 font-bold text-xs">
                    ⚠️ Final Confirmation: Are you sure you want to permanently delete all your data?
                  </p>
                  <p className="text-rose-700 text-xs">
                    This cannot be undone. Your account and all associated data will be queued for permanent deletion within 30 days.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirming(false)}
                      className="flex-1 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-50 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black transition cursor-pointer"
                    >
                      Yes, Delete My Data
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <p className="text-rose-600 text-xs font-medium">{error}</p>
              )}

              {!confirming && (
                <button
                  onClick={handleSubmit}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black py-3 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Request Data Deletion
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <h2 className="font-black text-zinc-900 text-lg">Deletion Request Received</h2>
              <p className="text-zinc-500 text-xs mt-2 leading-relaxed">
                Your data deletion request has been submitted. All your personal data will be permanently erased within <strong>30 days</strong>. You will receive a confirmation at <strong>{email}</strong> once the process is complete.
              </p>
              <p className="text-zinc-400 text-xs mt-3">
                You may continue using your account until the deletion is processed. Logging out will not cancel the deletion.
              </p>
            </div>
            <Link
              to="/"
              className="inline-block bg-zinc-900 hover:bg-zinc-800 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition cursor-pointer"
            >
              Back to Sokos
            </Link>
          </div>
        )}
      </main>

      <footer className="bg-zinc-950 border-t border-zinc-800 text-zinc-400 px-6 py-6 mt-8">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[10px] font-mono tracking-wider text-zinc-500">
            &copy; {new Date().getFullYear()} Sokos Payments Limited &middot; Nairobi, Kenya
          </p>
          <div className="flex items-center gap-4 text-[10px] font-mono tracking-wider">
            <Link to="/privacy" className="hover:text-emerald-400 transition cursor-pointer">Privacy Policy</Link>
            <span className="text-zinc-700">&middot;</span>
            <Link to="/terms" className="hover:text-emerald-400 transition cursor-pointer">Terms of Service</Link>
            <span className="text-zinc-700">&middot;</span>
            <Link to="/data-deletion" className="hover:text-rose-400 transition cursor-pointer">Data Deletion</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
