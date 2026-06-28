/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { apiFetch } from '../utils';

interface Props {
  onClose: () => void;
}

export default function DataDeletion({ onClose }: Props) {
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
      // Send deletion request to backend
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
    } catch (e) {
      setError('Network error. Please check your connection and try again.');
      setConfirming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex justify-center items-start p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl my-8 relative">
        <div className="sticky top-0 bg-white border-b border-zinc-100 px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
          <h1 className="text-lg font-black text-zinc-900 flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-rose-500" />
            Data Deletion Request
          </h1>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition cursor-pointer">
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>
        <div className="px-6 py-6 space-y-5 text-sm text-zinc-700 leading-relaxed">
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
              <button
                onClick={onClose}
                className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition cursor-pointer"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
