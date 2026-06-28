/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, FileText } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export default function TermsOfService({ onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex justify-center items-start p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl my-8 relative">
        <div className="sticky top-0 bg-white border-b border-zinc-100 px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
          <h1 className="text-lg font-black text-zinc-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-500" />
            Terms of Service
          </h1>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition cursor-pointer">
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>
        <div className="px-6 py-6 space-y-6 text-sm text-zinc-700 leading-relaxed">
          <p className="text-xs text-zinc-400 font-mono">Last updated: June 28, 2025</p>

          <section>
            <h2 className="font-black text-zinc-900 mb-2 text-base">1. Acceptance of Terms</h2>
            <p>By accessing or using Sokos (sokos.co.ke), you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use the platform. These terms constitute a legally binding agreement between you and Sokos Payments Limited.</p>
          </section>

          <section>
            <h2 className="font-black text-zinc-900 mb-2 text-base">2. Description of Service</h2>
            <p>Sokos is a hyperlocal marketplace platform that connects vendors and buyers within a 5 km radius in Kenya. The platform provides:</p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>Listing and discovery of goods and services by location.</li>
              <li>In-app messaging between buyers and sellers.</li>
              <li>M-Pesa STK push payment processing via Safaricom Daraja API.</li>
              <li>Seller identity verification and rating system.</li>
              <li>AI-powered listing analysis via Google Gemini.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-black text-zinc-900 mb-2 text-base">3. User Accounts</h2>
            <ul className="list-disc ml-5 space-y-1">
              <li>You must provide accurate and complete registration information including a valid M-Pesa phone number.</li>
              <li>You are responsible for maintaining the confidentiality of your account.</li>
              <li>You must be at least 18 years old to create an account.</li>
              <li>Each person may maintain only one active account.</li>
              <li>Sokos reserves the right to suspend or terminate accounts that violate these terms.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-black text-zinc-900 mb-2 text-base">4. Listing Rules</h2>
            <ul className="list-disc ml-5 space-y-1">
              <li>All listings must accurately describe the item or service being offered.</li>
              <li>Prices must be listed in Kenya Shillings (KES) and be the actual price the seller intends to charge.</li>
              <li>Prohibited items include: illegal substances, weapons, counterfeit goods, stolen property, and any items restricted under Kenyan law.</li>
              <li>Sellers must physically possess the items they list for sale.</li>
              <li>Sokos may remove listings that violate these rules without prior notice.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-black text-zinc-900 mb-2 text-base">5. Payments & M-Pesa</h2>
            <ul className="list-disc ml-5 space-y-1">
              <li>M-Pesa payments are processed through Safaricom's Daraja API. Sokos acts as a facilitator and does not hold funds.</li>
              <li>Payment disputes should be directed to Safaricom through their standard dispute resolution channels.</li>
              <li>Cash-on-pickup transactions are conducted at the users' own risk. Sokos recommends meeting in well-lit public spaces.</li>
              <li>Sokos is not liable for failed, delayed, or disputed M-Pesa transactions.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-black text-zinc-900 mb-2 text-base">6. Identity Verification</h2>
            <p>Sokos offers voluntary identity verification through National ID, Passport, or County Business Permit submission. Verified status increases buyer trust but does not constitute an endorsement by Sokos. Falsifying verification documents is a criminal offense under Kenyan law.</p>
          </section>

          <section>
            <h2 className="font-black text-zinc-900 mb-2 text-base">7. User Conduct</h2>
            <p>You agree not to:</p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>Use the platform for any unlawful purpose.</li>
              <li>Harass, threaten, or intimidate other users.</li>
              <li>Post false, misleading, or deceptive listings.</li>
              <li>Attempt to circumvent payment systems or defraud other users.</li>
              <li>Impersonate another person or use a false identity.</li>
              <li>Interfere with the platform's operation or security.</li>
              <li>Collect other users' personal information without consent.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-black text-zinc-900 mb-2 text-base">8. Ratings & Reviews</h2>
            <p>Users may rate and review trading partners after completed orders. Ratings must be honest and based on actual trade experiences. Sokos reserves the right to remove fraudulent or abusive reviews.</p>
          </section>

          <section>
            <h2 className="font-black text-zinc-900 mb-2 text-base">9. Safety Disclaimer</h2>
            <p className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-900">
              <strong>Important:</strong> Sokos facilitates connections between local buyers and sellers but does not guarantee the safety of any in-person meeting. Users are solely responsible for their personal safety during meetups. Always meet in well-lit public spaces, inspect items before payment, and do not share financial PINs outside the M-Pesa prompt.
            </p>
          </section>

          <section>
            <h2 className="font-black text-zinc-900 mb-2 text-base">10. Intellectual Property</h2>
            <p>The Sokos name, logo, and platform design are the intellectual property of Sokos Payments Limited. Users retain ownership of their listing content but grant Sokos a non-exclusive license to display and distribute it on the platform.</p>
          </section>

          <section>
            <h2 className="font-black text-zinc-900 mb-2 text-base">11. Limitation of Liability</h2>
            <p>Sokos provides the platform "as is" and is not responsible for the quality, safety, legality, or delivery of items listed. Sokos is not liable for any losses arising from transactions between users, including but not limited to: failed payments, misrepresentation, theft, or personal injury during meetups.</p>
          </section>

          <section>
            <h2 className="font-black text-zinc-900 mb-2 text-base">12. Termination</h2>
            <p>You may delete your account at any time via the Data Deletion page. Sokos may suspend or terminate accounts for violation of these terms, with or without prior notice.</p>
          </section>

          <section>
            <h2 className="font-black text-zinc-900 mb-2 text-base">13. Governing Law</h2>
            <p>These terms are governed by the laws of Kenya. Any disputes shall be resolved in the courts of Nairobi, Kenya.</p>
          </section>

          <section>
            <h2 className="font-black text-zinc-900 mb-2 text-base">14. Changes to Terms</h2>
            <p>Sokos may modify these terms at any time. Material changes will be communicated via the platform or email. Continued use after changes constitutes acceptance.</p>
          </section>

          <section>
            <h2 className="font-black text-zinc-900 mb-2 text-base">15. Contact</h2>
            <p>For legal inquiries: <strong>legal@sokos.co.ke</strong></p>
            <p className="mt-1">Sokos Payments Limited, Nairobi, Kenya</p>
          </section>
        </div>
      </div>
    </div>
  );
}
