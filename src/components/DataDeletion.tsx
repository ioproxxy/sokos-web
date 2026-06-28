/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ArrowLeft, Trash2, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { apiFetch } from '../utils';
import { User } from '../types';

interface DataDeletionProps {
  onBack: () => void;
  currentUser: User | null;
  onAccountDeleted: () => void;
}

export default function DataDeletion({ onBack, currentUser, onAccountDeleted }: DataDeletionProps) {
  const [step, setStep] = useState<'confirm' | 'deleting' | 'done' | 'error'>('confirm');
  const [confirmText, setConfirmText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleDelete = async () => {
    if (!currentUser) return;
    setStep('deleting');
    setErrorMsg('');

    try {
      const res = await apiFetch(`/api/users/${currentUser.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        // Clear local session
        localStorage.removeItem('sokos_user_id');
        setStep('done');
        setTimeout(() => {
          onAccountDeleted();
        }, 3000);
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error || 'Failed to delete account. Please try again or contact privacy@sokos.co.ke.');
        setStep('error');
      }
    } catch (e) {
      setErrorMsg('Network error. Please check your connection and try again.');
      setStep('error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-800 transition cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Trash2 className="w-6 h-6 text-red-500" />
            <h1 className="text-2xl font-display font-bold">Delete Your Data</h1>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 p-6 md:p-8 space-y-6 text-sm leading-relaxed text-slate-700 dark:text-zinc-300">
          {/* Info section */}
          <section className="space-y-3">
            <h2 className="text-lg font-display font-bold text-slate-900 dark:text-zinc-100">Request Account & Data Deletion</h2>
            <p>
              Under the Kenya Data Protection Act, 2019, you have the right to request deletion of your personal data. This action will permanently:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Delete your account profile (name, phone, email, avatar)</li>
              <li>Remove all your listings from the marketplace</li>
              <li>Delete all your chat messages</li>
              <li>Remove your reviews and ratings</li>
              <li>Delete all your notifications</li>
              <li>Cancel any pending orders associated with your account</li>
            </ul>
          </section>

          {/* Retention notice */}
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 space-y-1">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-semibold text-xs">
              <AlertTriangle className="w-4 h-4" />
              <span>DATA RETENTION NOTICE</span>
            </div>
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Completed payment records may be retained for up to 7 years as required by the Kenya Revenue Authority (KRA) for tax compliance. This data will be anonymized and cannot be linked back to you personally.
            </p>
          </div>

          {/* Timeline */}
          <section>
            <h3 className="font-semibold text-slate-800 dark:text-zinc-200 mb-2">Deletion Timeline</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <span className="bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded font-mono font-bold">0-24h</span>
                <span>Account deactivated — you cannot log in or be contacted</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded font-mono font-bold">1-7d</span>
                <span>Personal data purged from primary database and search index</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded font-mono font-bold">1-30d</span>
                <span>All backups and caches fully overwritten and removed</span>
              </div>
            </div>
          </section>

          {/* Confirmation step */}
          {step === 'confirm' && (
            <div className="border-t border-slate-200 dark:border-zinc-700 pt-6 space-y-4">
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <div className="flex items-center gap-2 text-red-800 dark:text-red-300 font-semibold text-xs mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>THIS ACTION IS IRREVERSIBLE</span>
                </div>
                <p className="text-xs text-red-700 dark:text-red-400">
                  Once deleted, your account and all associated data cannot be recovered. You will need to create a new account to use Sokos again.
                </p>
              </div>

              {currentUser ? (
                <>
                  <div className="bg-slate-50 dark:bg-zinc-800 rounded-lg p-3 space-y-1 text-xs">
                    <div className="text-slate-400 dark:text-zinc-500">Account to delete:</div>
                    <div className="font-semibold text-slate-900 dark:text-zinc-100">{currentUser.name}</div>
                    <div className="text-slate-500 dark:text-zinc-400">{currentUser.phone} · {currentUser.email || 'No email'}</div>
                    <div className="text-slate-400 dark:text-zinc-500">User ID: {currentUser.id}</div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1">
                      Type <span className="font-mono text-red-600 dark:text-red-400">DELETE</span> to confirm:
                    </label>
                    <input
                      type="text"
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      placeholder="Type DELETE here"
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm font-mono focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:text-white"
                    />
                  </div>

                  <button
                    onClick={handleDelete}
                    disabled={confirmText !== 'DELETE'}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition cursor-pointer ${
                      confirmText === 'DELETE'
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-slate-200 dark:bg-zinc-800 text-slate-400 dark:text-zinc-600 cursor-not-allowed'
                    }`}
                  >
                    Permanently Delete My Account & Data
                  </button>
                </>
              ) : (
                <div className="text-center py-4 text-slate-500 dark:text-zinc-400">
                  You must be logged in to delete your account.
                  <button onClick={onBack} className="block mx-auto mt-2 text-emerald-600 dark:text-emerald-400 underline">
                    Go back to log in
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Deleting in progress */}
          {step === 'deleting' && (
            <div className="border-t border-slate-200 dark:border-zinc-700 pt-6">
              <div className="flex flex-col items-center gap-3 py-8">
                <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
                <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Deleting your data...</p>
                <p className="text-xs text-slate-500 dark:text-zinc-400">This may take a few moments. Please do not close this page.</p>
              </div>
            </div>
          )}

          {/* Success */}
          {step === 'done' && (
            <div className="border-t border-slate-200 dark:border-zinc-700 pt-6">
              <div className="flex flex-col items-center gap-3 py-8">
                <CheckCircle className="w-10 h-10 text-emerald-500" />
                <h3 className="text-lg font-display font-bold text-emerald-700 dark:text-emerald-400">Account Deleted Successfully</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 text-center max-w-sm">
                  Your account and personal data have been scheduled for permanent deletion. You will be redirected shortly.
                </p>
                <p className="text-xs text-slate-400 dark:text-zinc-500">
                  A confirmation has been sent to your email if one was on file.
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {step === 'error' && (
            <div className="border-t border-slate-200 dark:border-zinc-700 pt-6 space-y-3">
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <p className="text-xs text-red-700 dark:text-red-400">{errorMsg}</p>
              </div>
              <button
                onClick={() => setStep('confirm')}
                className="w-full py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-lg text-sm font-semibold text-slate-700 dark:text-zinc-300 transition cursor-pointer"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Alternative: Email request */}
          <section className="border-t border-slate-200 dark:border-zinc-700 pt-6">
            <h3 className="font-semibold text-slate-800 dark:text-zinc-200 mb-2">Alternative: Request by Email</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              If you cannot access your account, you may request data deletion by sending an email to:
            </p>
            <div className="bg-slate-50 dark:bg-zinc-800 rounded-lg p-3 mt-2 text-xs font-mono">
              <div className="text-slate-400 dark:text-zinc-500">To:</div>
              <div className="text-emerald-600 dark:text-emerald-400 font-bold">privacy@sokos.co.ke</div>
              <div className="text-slate-400 dark:text-zinc-500 mt-2">Subject:</div>
              <div className="text-slate-700 dark:text-zinc-300">Data Deletion Request — [Your Phone Number]</div>
              <div className="text-slate-400 dark:text-zinc-500 mt-2">Include:</div>
              <div className="text-slate-700 dark:text-zinc-300">Full name, registered phone number, and a copy of your ID for verification</div>
            </div>
            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-2">
              Email deletion requests are processed within 14 business days.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
