/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowLeft } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-zinc-50 select-none">
      <header className="sticky top-0 z-40 bg-zinc-950 text-white border-b border-zinc-800">
        <div className="max-w-3xl mx-auto px-5 py-3.5 flex items-center gap-4">
          <Link to="/" className="p-2 hover:bg-zinc-800 rounded-full transition cursor-pointer">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <h1 className="font-display font-black tracking-tight text-lg">Terms of Service</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-7 text-sm text-zinc-700 leading-relaxed">
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
          <p>You may delete your account at any time via the <Link to="/data-deletion" className="text-emerald-600 underline hover:text-emerald-700">Data Deletion page</Link>. Sokos may suspend or terminate accounts for violation of these terms, with or without prior notice.</p>
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
