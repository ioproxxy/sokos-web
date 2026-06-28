/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowLeft, Shield } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

export default function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-800 transition cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-emerald-500" />
            <h1 className="text-2xl font-display font-bold">Privacy Policy</h1>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 p-6 md:p-8 space-y-6 text-sm leading-relaxed text-slate-700 dark:text-zinc-300">
          <p className="text-xs text-slate-400 dark:text-zinc-500">Last updated: June 28, 2026</p>

          <section>
            <h2 className="text-lg font-display font-bold text-slate-900 dark:text-zinc-100 mb-2">1. Introduction</h2>
            <p>
              Sokos ("we", "our", "us") operates the sokos.co.ke platform, a local marketplace connecting vendors and buyers within Nairobi neighborhoods. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform. By using Sokos, you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-slate-900 dark:text-zinc-100 mb-2">2. Information We Collect</h2>
            <h3 className="font-semibold text-slate-800 dark:text-zinc-200 mt-3">2.1 Personal Information</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Full name and username</li>
              <li>Phone number (required for M-Pesa payments and verification)</li>
              <li>Email address</li>
              <li>Profile photograph / avatar</li>
              <li>Kenya National ID, Passport, or Business Permit number (for seller verification only — we do not store document images)</li>
            </ul>

            <h3 className="font-semibold text-slate-800 dark:text-zinc-200 mt-3">2.2 Location Data</h3>
            <p>
              Sokos uses your device's GPS or manually-set neighborhood to show listings within a 5 km radius. Your approximate coordinates are stored to power proximity-based discovery. You may manually set your location instead of enabling GPS.
            </p>

            <h3 className="font-semibold text-slate-800 dark:text-zinc-200 mt-3">2.3 Transaction Data</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Listing details you post (title, description, price, images, category)</li>
              <li>Chat messages between buyers and sellers</li>
              <li>Order history and M-Pesa payment receipts</li>
              <li>Reviews and ratings you give or receive</li>
            </ul>

            <h3 className="font-semibold text-slate-800 dark:text-zinc-200 mt-3">2.4 Usage & Device Data</h3>
            <p>We automatically collect device type, browser, IP address, and general usage patterns to improve platform performance and detect fraud.</p>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-slate-900 dark:text-zinc-100 mb-2">3. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To provide and operate the Sokos marketplace (listing, search, messaging, payments)</li>
              <li>To verify seller identity and build trust (verification badges)</li>
              <li>To process M-Pesa STK push payments via Safaricom Daraja API</li>
              <li>To send order status notifications (payment confirmed, delivery updates)</li>
              <li>To power AI-assisted listing descriptions and price suggestions via Google Gemini</li>
              <li>To prevent fraud, spam, and unauthorized access</li>
              <li>To comply with Kenyan legal and regulatory requirements (Data Protection Act, 2019)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-slate-900 dark:text-zinc-100 mb-2">4. Data Sharing</h2>
            <p>We do not sell your personal data. We share data only with:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Safaricom (M-Pesa Daraja):</strong> Phone number and payment amount to process STK push transactions</li>
              <li><strong>Google (Gemini API):</strong> Listing title and description text for AI-generated suggestions — no personal identifiers are sent</li>
              <li><strong>Law enforcement:</strong> When required by Kenyan law or court order</li>
              <li><strong>Other Sokos users:</strong> Your public profile (name, rating, verified status, neighborhood) is visible to other users. Chat messages are visible only to conversation participants.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-slate-900 dark:text-zinc-100 mb-2">5. Data Retention</h2>
            <p>We retain your data for as long as your account is active. If you request account deletion, we will permanently remove your personal data within 30 days, except where retention is required by law (e.g., transaction records for tax purposes under KRA regulations, retained for 7 years).</p>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-slate-900 dark:text-zinc-100 mb-2">6. Data Security</h2>
            <p>We implement appropriate technical and organizational measures to protect your data, including encrypted HTTPS transport, secure session management, and access controls. However, no system is completely secure, and we cannot guarantee absolute security.</p>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-slate-900 dark:text-zinc-100 mb-2">7. Your Rights Under the Data Protection Act, 2019</h2>
            <p>As a data subject in Kenya, you have the right to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Access your personal data held by Sokos</li>
              <li>Rectify inaccurate or incomplete data</li>
              <li>Object to processing of your data</li>
              <li>Request deletion of your data (see our <a href="#data-deletion" className="text-emerald-600 dark:text-emerald-400 underline">Data Deletion</a> page)</li>
              <li>Lodge a complaint with the Office of the Data Protection Commissioner (ODPC)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-slate-900 dark:text-zinc-100 mb-2">8. Cookies</h2>
            <p>Sokos uses a minimal session cookie (<code className="bg-slate-100 dark:bg-zinc-800 px-1 rounded text-xs">soko_user_id</code>) to maintain your login state. We do not use third-party tracking cookies.</p>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-slate-900 dark:text-zinc-100 mb-2">9. Children's Privacy</h2>
            <p>Sokos is not intended for persons under 18 years of age. We do not knowingly collect data from minors.</p>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-slate-900 dark:text-zinc-100 mb-2">10. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of material changes via the platform or email. Continued use after changes constitutes acceptance.</p>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-slate-900 dark:text-zinc-100 mb-2">11. Contact Us</h2>
            <p>For privacy inquiries or data requests, contact:</p>
            <p className="mt-1">
              <strong>Sokos Data Protection Officer</strong><br />
              Email: privacy@sokos.co.ke<br />
              Phone: +254 700 000 000<br />
              Address: Nairobi, Kenya
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
