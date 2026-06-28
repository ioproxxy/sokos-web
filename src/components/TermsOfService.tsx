/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowLeft, FileText } from 'lucide-react';

interface TermsOfServiceProps {
  onBack: () => void;
}

export default function TermsOfService({ onBack }: TermsOfServiceProps) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-800 transition cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-500" />
            <h1 className="text-2xl font-display font-bold">Terms of Service</h1>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 p-6 md:p-8 space-y-6 text-sm leading-relaxed text-slate-700 dark:text-zinc-300">
          <p className="text-xs text-slate-400 dark:text-zinc-500">Last updated: June 28, 2026</p>

          <section>
            <h2 className="text-lg font-display font-bold text-slate-900 dark:text-zinc-100 mb-2">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the Sokos platform at sokos.co.ke ("Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree, do not use the Platform. These Terms constitute a legally binding agreement between you and Sokos Payments Limited ("Sokos", "we", "us", "our").
            </p>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-slate-900 dark:text-zinc-100 mb-2">2. Eligibility</h2>
            <p>You must be at least 18 years old and a resident of Kenya to use Sokos. By creating an account, you represent that you meet these requirements.</p>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-slate-900 dark:text-zinc-100 mb-2">3. Account Registration</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>You must provide accurate and complete registration information (name, phone number, location).</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li>You may not create multiple accounts for fraudulent purposes.</li>
              <li>Sokos reserves the right to suspend or terminate accounts that violate these Terms.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-slate-900 dark:text-zinc-100 mb-2">4. Marketplace Rules</h2>
            <h3 className="font-semibold text-slate-800 dark:text-zinc-200 mt-3">4.1 Listings</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>All listings must accurately describe the product or service being offered.</li>
              <li>Prices must be in Kenya Shillings (KES) and may not be misleading.</li>
              <li>Prohibited items include: illegal substances, weapons, counterfeit goods, stolen property, and adult content.</li>
              <li>Sokos reserves the right to remove any listing that violates these rules without prior notice.</li>
            </ul>

            <h3 className="font-semibold text-slate-800 dark:text-zinc-200 mt-3">4.2 Transactions</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Buyers and sellers negotiate and agree on terms through the in-app messaging system.</li>
              <li>M-Pesa payments processed through Sokos are facilitated via Safaricom's Daraja API.</li>
              <li>Cash transactions are the responsibility of the parties involved — Sokos provides no escrow or dispute resolution for cash payments.</li>
              <li>Meet-ups for item exchange should occur in safe, public locations within the agreed neighborhood.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-slate-900 dark:text-zinc-100 mb-2">5. Payments & M-Pesa</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>M-Pesa STK push payments are processed by Safaricom. Sokos acts as a payment facilitator and does not hold customer funds.</li>
              <li>Payment confirmation is subject to Safaricom's processing times and network availability.</li>
              <li>Refunds for M-Pesa payments, where applicable, will be processed within 7 business days.</li>
              <li>Sokos may charge a platform facilitation fee on transactions as disclosed at the time of payment.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-slate-900 dark:text-zinc-100 mb-2">6. Verification & Trust</h2>
            <p>
              Sellers may submit identification documents (National ID, Passport, or Business Permit) for verification. Verification badges indicate that a seller has provided valid documentation — they do not constitute an endorsement or guarantee by Sokos. Sokos is not liable for the actions of verified or unverified users.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-slate-900 dark:text-zinc-100 mb-2">7. Ratings & Reviews</h2>
            <p>
              Users may rate and review transaction counterparts. Ratings must be honest and based on actual transaction experiences. Sokos reserves the right to remove reviews that are defamatory, fraudulent, or otherwise violate these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-slate-900 dark:text-zinc-100 mb-2">8. Prohibited Conduct</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Post false, misleading, or fraudulent listings</li>
              <li>Harass, threaten, or intimidate other users</li>
              <li>Attempt to circumvent M-Pesa payments by soliciting off-platform transactions</li>
              <li>Use automated scripts or bots to scrape data or manipulate listings</li>
              <li>Impersonate another person or entity</li>
              <li>Exploit platform vulnerabilities or attempt unauthorized access</li>
              <li>Use the platform for any unlawful purpose under Kenyan law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-slate-900 dark:text-zinc-100 mb-2">9. Intellectual Property</h2>
            <p>
              The Sokos name, logo, and platform design are the intellectual property of Sokos Payments Limited. Users retain ownership of content they post (listing images, descriptions) but grant Sokos a non-exclusive, royalty-free license to display and distribute such content on the platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-slate-900 dark:text-zinc-100 mb-2">10. Limitation of Liability</h2>
            <p>
              Sokos is a marketplace platform and is not a party to transactions between users. We do not guarantee the quality, safety, or legality of items listed, nor the ability of buyers to pay or sellers to deliver. To the maximum extent permitted by Kenyan law, Sokos shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-slate-900 dark:text-zinc-100 mb-2">11. Indemnification</h2>
            <p>
              You agree to indemnify and hold Sokos harmless from any claims, damages, or expenses (including legal fees) arising from your use of the platform, your violations of these Terms, or your infringement of any third-party rights.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-slate-900 dark:text-zinc-100 mb-2">12. Account Termination</h2>
            <p>
              You may delete your account at any time via our <a href="#data-deletion" className="text-emerald-600 dark:text-emerald-400 underline">Data Deletion</a> page. Sokos may suspend or terminate accounts that violate these Terms, with or without notice.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-slate-900 dark:text-zinc-100 mb-2">13. Governing Law</h2>
            <p>
              These Terms are governed by the laws of the Republic of Kenya. Any disputes shall be resolved in the courts of Nairobi, Kenya.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-slate-900 dark:text-zinc-100 mb-2">14. Modifications</h2>
            <p>
              Sokos may modify these Terms at any time. Material changes will be communicated via the platform or email. Continued use after modifications constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-slate-900 dark:text-zinc-100 mb-2">15. Contact</h2>
            <p>For questions about these Terms, contact:</p>
            <p className="mt-1">
              <strong>Sokos Payments Limited</strong><br />
              Email: legal@sokos.co.ke<br />
              Phone: +254 700 000 000<br />
              Address: Nairobi, Kenya
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
