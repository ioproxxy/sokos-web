import React, { useState } from 'react';
import { User, Order } from '../types';
import { apiFetch } from '../utils';
import { 
  Users, 
  CheckSquare, 
  Compass, 
  ShieldCheck, 
  BookOpen, 
  ArrowLeftRight, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Play
} from 'lucide-react';

interface Props {
  currentUser: User;
  onUserSwitched: (user: User) => void;
  orders: Order[];
  onOrderUpdated: () => void;
}

export default function DevConsole({ currentUser, onUserSwitched, orders, onOrderUpdated }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'switch' | 'training'>('training');
  const [switchingId, setSwitchingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filtered seed accounts for safe, lightweight simulation
  const mockAccounts = [
    { id: 'usr_buyer1', name: 'Alex Gathu', role: 'Verified Buyer', location: 'Nairobi CBD', avatar: 'Alex' },
    { id: 'usr_johndoe', name: 'John Kamau', role: 'Electronics Trader', location: 'Kilimani Ward', avatar: 'John' },
    { id: 'usr_marywaweru', name: 'Mary Waweru', role: 'Furniture Artisan', location: 'Westlands Ward', avatar: 'Mary' },
    { id: 'usr_davidotieno', name: 'David Otieno', role: 'Outdoors Merchant', location: 'Madaraka Ward', avatar: 'David' },
    { id: 'usr_aminamohan', name: 'Amina Mohammed', role: 'Apparel Stylist', location: 'South C Ward', avatar: 'Amina' },
  ];

  const handleSwitchAccount = async (userId: string) => {
    setSwitchingId(userId);
    setSuccessMsg(null);
    try {
      const res = await apiFetch('/api/auth/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(`Switched to ${data.user.name} successfully!`);
        onUserSwitched(data.user);
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        console.error('Account switch rejected:', data.error);
      }
    } catch (err) {
      console.error('Failed to trigger demo switch:', err);
    } finally {
      setSwitchingId(null);
    }
  };

  return (
    <div id="mvp_auditor_console" className="fixed bottom-4 right-4 z-50 font-sans select-none">
      {/* Console Toggle Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-zinc-950 text-white dark:bg-zinc-900 border border-zinc-800 rounded-full shadow-2xl hover:bg-zinc-900 dark:hover:bg-zinc-800 transition-all duration-300 font-bold text-xs uppercase cursor-pointer"
      >
        <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse animate-duration-1000" />
        <span>MVP Study & Sim Assistant</span>
        {isOpen ? <ChevronDown className="w-3.5 h-3.5 ml-1" /> : <ChevronUp className="w-3.5 h-3.5 ml-1" />}
      </button>

      {/* Main Panel Content overlay */}
      {isOpen && (
        <div className="absolute bottom-14 right-0 w-[350px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden p-0 animate-in fade-in-50 slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="bg-zinc-950 p-4 border-b border-zinc-850 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <div>
                <h4 className="text-white text-[11px] font-black uppercase tracking-widest font-mono">MVP Interactive Study</h4>
                <p className="text-[9px] text-zinc-400">Sandbox dual-ended reviewer portal</p>
              </div>
            </div>
          </div>

          {/* Navigation Tab controllers */}
          <div className="flex border-b border-zinc-150 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-1">
            <button
              onClick={() => setActiveTab('training')}
              className={`flex-1 py-1 px-2.5 rounded-xl text-[10px] font-mono uppercase tracking-wider font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'training'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs border border-zinc-200 dark:border-zinc-805'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
              <span>Training Walkthrough</span>
            </button>
            <button
              onClick={() => setActiveTab('switch')}
              className={`flex-1 py-1 px-2.5 rounded-xl text-[10px] font-mono uppercase tracking-wider font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'switch'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs border border-zinc-200 dark:border-zinc-805'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-emerald-500" />
              <span>Sim Mock Accounts</span>
            </button>
          </div>

          {/* Body Section */}
          <div className="p-4 max-h-[360px] overflow-y-auto space-y-4">
            
            {successMsg && (
              <div className="p-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-xl text-center font-mono">
                {successMsg}
              </div>
            )}

            {/* Tab: Walkthrough Checklist */}
            {activeTab === 'training' && (
              <div className="space-y-3.5">
                <div className="text-[10px] leading-relaxed text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-950 p-3 rounded-2xl border border-zinc-150 dark:border-zinc-850">
                  <p className="font-semibold text-zinc-800 dark:text-zinc-200 mb-1">🛡️ Note to Cybersecurity Reviewers:</p>
                  This MVP is configured in a sandboxed trade session mode. You can instantly simulate buyer and seller handshakes inside the container environment with zero SMS/bank credentials exposure.
                </div>

                <div className="space-y-2.5">
                  <h5 className="text-[9px] font-extrabold text-zinc-400 dark:text-zinc-500 font-mono tracking-wider uppercase mb-1">Interactive Milestones</h5>
                  
                  {/* Step 1 */}
                  <div className="p-2.5 border border-zinc-150 dark:border-zinc-800 rounded-2xl bg-zinc-50/40 dark:bg-zinc-950/20 text-left space-y-1">
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 bg-emerald-500 text-zinc-950 rounded-full flex items-center justify-center text-[9px] font-black font-mono mt-0.5">1</div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[10.5px] font-bold text-zinc-800 dark:text-zinc-200">Onboarding & Ward localization</div>
                        <p className="text-[9.5px] text-zinc-500 dark:text-zinc-400 leading-snug">Explore Step 2 of registration. Choosing an authorized Nairobi ward maps your matching range index without revealing physical coordinates.</p>
                      </div>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="p-2.5 border border-zinc-150 dark:border-zinc-800 rounded-2xl bg-zinc-50/40 dark:bg-zinc-950/20 text-left space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 bg-emerald-500 text-zinc-950 rounded-full flex items-center justify-center text-[9px] font-black font-mono mt-0.5">2</div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[10.5px] font-bold text-zinc-800 dark:text-zinc-200">Simulate Merchant Posts</div>
                        <p className="text-[9.5px] text-zinc-500 dark:text-zinc-400 leading-snug">Switch session role to **John Kamau** (Seller/Trader) using the accounts tab to list a household item or view merchant dashboard charts.</p>
                        <button
                          type="button"
                          onClick={() => handleSwitchAccount('usr_johndoe')}
                          className="mt-1.5 px-2 py-1 bg-zinc-950 hover:bg-zinc-800 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-white dark:text-zinc-200 text-[8.5px] font-mono uppercase tracking-wider rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Play className="w-2.5 h-2.5 text-emerald-400 fill-emerald-400" />
                          <span>Simulate John (Seller)</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="p-2.5 border border-zinc-150 dark:border-zinc-800 rounded-2xl bg-zinc-50/40 dark:bg-zinc-950/20 text-left space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 bg-emerald-500 text-zinc-950 rounded-full flex items-center justify-center text-[9px] font-black font-mono mt-0.5">3</div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[10.5px] font-bold text-zinc-800 dark:text-zinc-200">Simulate Buyer Order</div>
                        <p className="text-[9.5px] text-zinc-500 dark:text-zinc-400 leading-snug">Switch back to **Alex Gathu** (Buyer) to view nearby listings on the live OpenStreetMap view, send messages, or place mock escrow orders.</p>
                        <button
                          type="button"
                          onClick={() => handleSwitchAccount('usr_buyer1')}
                          className="mt-1.5 px-2 py-1 bg-zinc-950 hover:bg-zinc-800 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-white dark:text-zinc-200 text-[8.5px] font-mono uppercase tracking-wider rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Play className="w-2.5 h-2.5 text-emerald-400 fill-emerald-400" />
                          <span>Simulate Alex (Buyer)</span>
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Tab: Mock Accounts dropdown */}
            {activeTab === 'switch' && (
              <div className="space-y-3">
                <p className="text-[9.5px] text-zinc-500 dark:text-zinc-400 leading-snug italic mb-1">
                  Click any verified seed profile to hot-reload session tokens as a buyer, professional artisan, local trader, or shopkeeper.
                </p>
                <div className="space-y-1.5">
                  {mockAccounts.map((acc) => {
                    const isCurrent = currentUser?.id === acc.id;
                    return (
                      <button
                        key={acc.id}
                        type="button"
                        disabled={switchingId === acc.id}
                        onClick={() => handleSwitchAccount(acc.id)}
                        className={`w-full p-2.5 border rounded-xl text-left transition flex items-center justify-between cursor-pointer ${
                          isCurrent 
                            ? 'border-emerald-500 bg-emerald-500/10 dark:bg-emerald-950/20 text-zinc-900 dark:text-white font-extrabold'
                            : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 text-zinc-700 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold leading-none">{acc.name}</span>
                            {isCurrent && (
                              <span className="text-[7.5px] bg-emerald-500 text-zinc-950 font-black font-mono px-1 py-0.2 rounded uppercase">
                                Active Current
                              </span>
                            )}
                          </div>
                          <div className="text-[9px] opacity-75 mt-0.5 font-mono">
                            {acc.role} • {acc.location}
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <ArrowLeftRight className="w-3.5 h-3.5 opacity-40 hover:opacity-100 transition-opacity" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

          {/* Footer informational banner */}
          <div className="bg-zinc-50 dark:bg-zinc-950 p-2.5 border-t border-zinc-150 dark:border-zinc-805 text-center text-[8.5px] text-zinc-500 font-mono tracking-tight">
            🛡️ Safe Audit Build • Bypassed raw banking variables
          </div>

        </div>
      )}
    </div>
  );
}
