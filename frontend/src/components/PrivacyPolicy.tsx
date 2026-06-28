/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Shield } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export default function PrivacyPolicy({ onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex justify-center items-start p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl my-8 relative">
        <div className="sticky top-0 bg-white border-b border-zinc-100 px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
          <h1 className="text-lg font-black text-zinc-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-500" />
            Privacy Policy
          </h1>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition cursor-pointer">
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>
        <div className="px-6 py-6 space-y-6 text-sm text-zinc-700 leading-relaxed">
          <p className="text-xs text-zinc-400 font-mono">Last updated: June 28, 2025</p>

          <section>
            <h2 className="font-black text-zinc-900 mb-2 text-base">1. Information We Collect</h2>
            <p>When you use Sokos, we collect the following categories of personal information:</p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li><strong>Account Information:</strong> Your full name, phone number (M-Pesa mobile), and email address when you register.</li>
              <li><strong>Location Data:</strong> Your GPS coordinates and neighborhood residence when you calibrate your location. This is used to match you with nearby vendors and buyers within a 5 km radius.</li>
              <li><strong>Transaction Data:</strong> Order history, M-Pesa payment records, and trade details including listing interactions.</li>
              <li><strong>Verification Documents:</strong> National ID, passport, or business permit images submitted for identity verification.</li>
              <li><strong>Communications:</strong> Chat messages exchanged between buyers and sellers on the platform.</li>
              <li><strong>Usage Data:</strong> Device information, browser type, pages visited, and interaction patterns.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-black text-zinc-900 mb-2 text-base">2. How We Use Your Information</h2>
            <ul className="list-disc ml-5 space-y-1">
              <li>To provide and operate the Sokos local trade marketplace.</li>
              <li>To match you with vendors and buyers within your 5 km neighborhood.</li>
              <li>To process M-Pesa STK push payments securely through Safaricom Daraja API.</li>
              <li>To verify seller identities and maintain trust ratings.</li>
              <li>To send order notifications, payment confirmations, and chat messages.</li>
              <li>To improve our services, prevent fraud, and enforce our Terms of Service.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-black text-zinc-900 mb-2 text-base">3. How We Share Your Information</h2>
            <ul className="list-disc ml-5 space-y-1">
              <li><strong>With Other Users:</strong> Your name, verified status, rating, and approximate neighborhood are visible to other users when you list items or engage in trade.</li>
              <li><strong>With Safaricom/Daraja:</strong> Payment processing data is shared with Safaricom's M-Pesa Daraja API to complete transactions.</li>
              <li><strong>With Google/Gemini AI:</strong> Listing descriptions and images may be analyzed by Gemini AI for pricing suggestions and category classification.</li>
              <li><strong>Legal Requirements:</strong> We may disclose information when required by Kenyan law, regulation, or legal process.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-black text-zinc-900 mb-2 text-base">4. Data Storage & Security</h2>
            <p>Your data is stored on secure servers. We implement industry-standard security measures including encrypted connections (TLS), hashed authentication tokens, and access controls. However, no system is completely secure, and we cannot guarantee absolute security of your data.</p>
          </section>

          <section>
            <h2 className="font-black text-zinc-900 mb-2 text-base">5. Location Data</h2>
            <p>Location data is central to Sokos' functionality. Your precise GPS coordinates are used to calculate distances to listings and to sort nearby trade opportunities. You may:</p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>Use preset neighborhood locations instead of live GPS.</li>
              <li>Disable browser geolocation permissions at any time.</li>
              <li>Update or change your residence location in your profile settings.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-black text-zinc-900 mb-2 text-base">6. Your Rights</h2>
            <p>In accordance with the Kenya Data Protection Act, 2019, you have the right to:</p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>Access your personal data held by Sokos.</li>
              <li>Request correction of inaccurate data.</li>
              <li>Request deletion of your personal data (see our Data Deletion page).</li>
              <li>Withdraw consent for data processing.</li>
              <li>Lodge a complaint with the Office of the Data Protection Commissioner.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-black text-zinc-900 mb-2 text-base">7. Cookies & Tracking</h2>
            <p>We use session cookies to maintain your logged-in state. We do not use third-party advertising trackers. Analytics may be collected to improve platform performance.</p>
          </section>

          <section>
            <h2 className="font-black text-zinc-900 mb-2 text-base">8. Children's Privacy</h2>
            <p>Sokos is not intended for individuals under the age of 18. We do not knowingly collect data from minors. If we become aware that a minor has registered, we will delete their account and data.</p>
          </section>

          <section>
            <h2 className="font-black text-zinc-900 mb-2 text-base">9. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. Material changes will be notified via the platform or email. Continued use of Sokos after changes constitutes acceptance.</p>
          </section>

          <section>
            <h2 className="font-black text-zinc-900 mb-2 text-base">10. Contact</h2>
            <p>For privacy inquiries, contact: <strong>privacy@sokos.co.ke</strong></p>
            <p className="mt-1">Sokos Payments Limited, Nairobi, Kenya</p>
          </section>
        </div>
      </div>
    </div>
  );
}
