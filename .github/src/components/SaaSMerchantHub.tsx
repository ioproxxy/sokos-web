import React, { useState, useEffect } from 'react';
import { 
  BarChart2, 
  Coins, 
  Sparkles, 
  TrendingUp, 
  Eye, 
  ShoppingBag, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle, 
  Phone, 
  ChevronRight, 
  Zap, 
  Store, 
  Building, 
  Check, 
  RefreshCw,
  Search,
  MessageSquare,
  PlusCircle
} from 'lucide-react';
import { User, Listing } from '../types';
import { apiFetch } from '../utils';

interface SaasMerchantHubProps {
  currentUser: User;
  onUpdateUser: (user: User) => void;
  onRefreshData: () => void;
}

export default function SaasMerchantHub({ currentUser, onUpdateUser, onRefreshData }: SaasMerchantHubProps) {
  const [activeSubTab, setActiveSubTab] = useState<'analytics' | 'subscription' | 'branding' | 'copywriter'>('analytics');
  
  // Analytics State
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  // AI Copywriter State
  const [aiTitleInput, setAiTitleInput] = useState('');
  const [aiPriceInput, setAiPriceInput] = useState('');
  const [aiCategoryInput, setAiCategoryInput] = useState('Electronics');
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);
  const [generatedCopy, setGeneratedCopy] = useState<any>(null);

  // Store Customizer State
  const [storeName, setStoreName] = useState(currentUser.storeName || '');
  const [storeTagline, setStoreTagline] = useState(currentUser.storeTagline || '');
  const [storeBanner, setStoreBanner] = useState(currentUser.storeBanner || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || '');
  const [isSavingStore, setIsSavingStore] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Subscription Checkout State
  const [selectedPlan, setSelectedPlan] = useState<'bronze' | 'silver' | 'gold' | null>(null);
  const [mpesaPhone, setMpesaPhone] = useState(currentUser.phone || '');
  const [paymentStep, setPaymentStep] = useState<'idle' | 'pushing' | 'awaiting' | 'success'>('idle');
  const [pushTimer, setPushTimer] = useState(20);
  const [isBoostingId, setIsBoostingId] = useState<string | null>(null);
  const [boostSuccessMsg, setBoostSuccessMsg] = useState<string | null>(null);

  // Load Analytics
  const loadAnalytics = async () => {
    setIsLoadingAnalytics(true);
    try {
      const res = await apiFetch('/api/saas/vendor/analytics');
      if (res.ok) {
        setAnalytics(await res.json());
      }
    } catch (e) {
      console.error('Error fetching analytics:', e);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  // Handle Plan Upgrade
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    setPaymentStep('pushing');
    
    // Simulate Kenya Daraja STK Push trigger
    setTimeout(() => {
      setPaymentStep('awaiting');
      setPushTimer(10);
    }, 1500);
  };

  // Keep countdown timer active during STK prompt
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (paymentStep === 'awaiting' && pushTimer > 0) {
      interval = setInterval(() => {
        setPushTimer(p => p - 1);
      }, 1000);
    } else if (paymentStep === 'awaiting' && pushTimer === 0) {
      // Auto-confirm
      triggerActivation();
    }
    return () => clearInterval(interval);
  }, [paymentStep, pushTimer]);

  const triggerActivation = async () => {
    try {
      const res = await apiFetch('/api/saas/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan, phone: mpesaPhone })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          onUpdateUser(data.user);
          setPaymentStep('success');
          loadAnalytics();
          onRefreshData();
        }
      }
    } catch (e) {
      console.error('Subscription error:', e);
    }
  };

  // Handle Storefront Branding Updates
  const handleSaveStorefront = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingStore(true);
    setSaveSuccess(false);

    try {
      const res = await apiFetch('/api/saas/storefront', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeName, storeTagline, storeBanner, avatarUrl })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          onUpdateUser(data.user);
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 3000);
          onRefreshData();
        }
      }
    } catch (err) {
      console.error('Error saving branding:', err);
    } finally {
      setIsSavingStore(false);
    }
  };

  // Generate Swahili AI Listings Description
  const handleGenerateCopy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiTitleInput) return;

    setIsGeneratingCopy(true);
    try {
      const res = await apiFetch('/api/saas/gemini/generate-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: aiTitleInput,
          category: aiCategoryInput,
          price: aiPriceInput
        })
      });
      if (res.ok) {
        setGeneratedCopy(await res.json());
      }
    } catch (e) {
      console.error('Copywriter went offline', e);
    } finally {
      setIsGeneratingCopy(false);
    }
  };

  // Premium Listing Boosting trigger
  const handleBoostListing = async (listingId: string) => {
    setIsBoostingId(listingId);
    setBoostSuccessMsg(null);

    try {
      const res = await apiFetch(`/api/saas/listings/${listingId}/boost`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setBoostSuccessMsg(`Listing boosted successfully! It now sits at the absolute top of search ranks! 🚀`);
          loadAnalytics();
          onRefreshData();
          setTimeout(() => setBoostSuccessMsg(null), 5000);
        }
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to boost listing.');
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsBoostingId(null);
    }
  };

  return (
    <div id="saas_merchant_portal" className="space-y-6">
      {/* SaaS Welcome Title & Summary Banner */}
      <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-emerald-950 text-white rounded-3xl p-6 border border-zinc-850 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-8 translate-x-8">
          <Store className="w-64 h-64 text-emerald-400" />
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full font-black">
                Soko Merchant SaaS Suite
              </span>
              {currentUser.subscriptionPlan && currentUser.subscriptionPlan !== 'free' && (
                <span className="bg-gradient-to-r from-amber-500 to-yellow-400 text-zinc-955 font-mono text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-full font-black">
                  🛡️ {currentUser.subscriptionPlan} Member
                </span>
              )}
            </div>
            <h1 className="font-display font-black text-2xl tracking-tight text-white">
              {currentUser.storeName || `${currentUser.name}'s Shop`}
            </h1>
            <p className="text-xs text-zinc-400 mt-1 font-medium font-sans">
              {currentUser.storeTagline || "Manage items, track real-time Nairobi visitor views, and boost sales."}
            </p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setActiveSubTab('analytics')}
              className={`flex-1 md:flex-initial px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeSubTab === 'analytics'
                  ? 'bg-white text-zinc-950 font-black shadow-md'
                  : 'bg-zinc-900/50 hover:bg-zinc-850/55 text-zinc-300 font-sans'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Metrics</span>
            </button>
            <button
              onClick={() => setActiveSubTab('branding')}
              className={`flex-1 md:flex-initial px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeSubTab === 'branding'
                  ? 'bg-white text-zinc-950 font-black shadow-md'
                  : 'bg-zinc-900/50 hover:bg-zinc-850/55 text-zinc-300 font-sans'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Identity</span>
            </button>
            <button
              onClick={() => setActiveSubTab('copywriter')}
              className={`flex-1 md:flex-initial px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeSubTab === 'copywriter'
                  ? 'bg-white text-zinc-950 font-black shadow-md'
                  : 'bg-zinc-900/50 hover:bg-zinc-850/55 text-zinc-300 font-sans'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Copy</span>
            </button>
            <button
              onClick={() => setActiveSubTab('subscription')}
              className={`flex-1 md:flex-initial px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeSubTab === 'subscription'
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950'
                  : 'bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-900/30 text-emerald-400 font-sans'
              }`}
            >
              <Coins className="w-3.5 h-3.5 animate-pulse" />
              <span>Billing</span>
            </button>
          </div>
        </div>
      </div>

      {boostSuccessMsg && (
        <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold animate-bounce duration-1000">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 animate-spin animate-duration-1000" />
          <span>{boostSuccessMsg}</span>
        </div>
      )}

      {/* RENDER ACTIVE TAB */}
      
      {/* 1. ANALYTICS METRICS */}
      {activeSubTab === 'analytics' && (
        <div id="saas_analytics_pane" className="space-y-6">
          {isLoadingAnalytics && !analytics ? (
            <div className="py-24 text-center">
              <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-2" />
              <p className="text-xs text-zinc-500 font-mono font-bold">CALCULATING VISITOR ENGAGEMENTS...</p>
            </div>
          ) : (
            <>
              {/* Stat Bento Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border select-none border-zinc-200/80 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-zinc-400 font-mono uppercase font-black">Monthly Reach</span>
                    <h2 className="text-2xl font-display font-black text-zinc-900 mt-1">
                      {(analytics?.summary?.totalViews || 0).toLocaleString()}
                    </h2>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-650 font-bold mt-2 font-sans">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                    <span>+18.4% this week</span>
                  </div>
                </div>

                <div className="bg-white border select-none border-zinc-200/80 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-zinc-400 font-mono uppercase font-black font-semibold">Store Orders</span>
                    <h2 className="text-2xl font-display font-black text-zinc-900 mt-1">
                      {analytics?.summary?.totalOrdersCount || 0}
                    </h2>
                  </div>
                  <div className="text-[9px] text-zinc-400 font-mono font-bold mt-3 uppercase tracking-wider">
                    SaaS order compliance rate 100%
                  </div>
                </div>

                <div className="bg-white border select-none border-zinc-200/80 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-zinc-400 font-mono uppercase font-black">Direct Sales (KES)</span>
                    <h2 className="text-2xl font-display font-black text-emerald-600 mt-1">
                      KES {(analytics?.summary?.totalEarned || 0).toLocaleString()}
                    </h2>
                  </div>
                  <div className="text-[9px] text-zinc-500 font-mono mt-3 uppercase tracking-widest flex items-center gap-1.5 font-bold">
                    <span className="w-1.5 h-1.5 bg-zinc-900 rounded-full animate-ping"></span>
                    <span>Pending escrow: KES {analytics?.summary?.totalPending || 0}</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 text-white rounded-2xl p-4 border border-zinc-850 shadow flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-zinc-400 font-mono uppercase font-black">Premium Boosts</span>
                    <h2 className="text-xl font-display font-black text-white mt-1">
                      {currentUser?.subscriptionPlan === 'gold' ? '∞ Unlimited' : `${analytics?.summary?.remainingQuotas || 0} left`}
                    </h2>
                  </div>
                  <button 
                    onClick={() => setActiveSubTab('subscription')}
                    className="mt-3 w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-lg text-[9px] uppercase tracking-wider font-mono transition inline-flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <PlusCircle className="w-3 h-3" />
                    <span>Purchase Quota</span>
                  </button>
                </div>
              </div>

              {/* Graphic Chart representation via handcrafted high fidelity responsive SVGs */}
              <div className="bg-white border border-zinc-200/80 rounded-3xl p-5 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-xs font-mono text-zinc-400 font-black uppercase tracking-wider">WEEKLY CONVERSIONS & TRAFFIC</h2>
                    <p className="text-lg font-display font-black text-zinc-900 mt-0.5">Nairobi Radar Visages</p>
                  </div>
                  <div className="flex gap-4 text-[9px] font-mono font-bold uppercase tracking-wider">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block"></span>
                      <span>Visitor Views</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-zinc-900 rounded-full inline-block"></span>
                      <span>Revenue (KES / 100)</span>
                    </div>
                  </div>
                </div>

                {/* Handcrafted precise responsive SVG chart */}
                <div className="w-full h-56 pt-2 select-none">
                  <svg className="w-full h-full" viewBox="0 0 700 200" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartViewsGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="chartRevGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#18181B" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#18181B" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* horizontal helper grid lines */}
                    <line x1="0" y1="40" x2="700" y2="40" stroke="#E4E4E7" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="0" y1="100" x2="700" y2="100" stroke="#E4E4E7" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="0" y1="160" x2="700" y2="160" stroke="#E4E4E7" strokeWidth="1" strokeDasharray="4 4" />

                    {/* Chart curves - calculate responsive coordinates dynamically */}
                    {analytics?.chartData && (
                      <>
                        {/* Views Area Path */}
                        <path
                          d={`M 15 ${160 - analytics.chartData[0].views * 1.5} 
                             L 115 ${160 - analytics.chartData[1].views * 1.5} 
                             L 215 ${160 - analytics.chartData[2].views * 1.5} 
                             L 315 ${160 - analytics.chartData[3].views * 1.5} 
                             L 415 ${160 - analytics.chartData[4].views * 1.5} 
                             L 515 ${160 - analytics.chartData[5].views * 1.5} 
                             L 615 ${160 - analytics.chartData[6].views * 1.5}
                             L 615 190 L 15 190 Z`}
                          fill="url(#chartViewsGlow)"
                        />
                        {/* Views Path Line */}
                        <path
                          d={`M 15 ${160 - analytics.chartData[0].views * 1.5} 
                             Q 115 ${160 - analytics.chartData[1].views * 1.5} 215 ${160 - analytics.chartData[2].views * 1.5} 
                             T 415 ${160 - analytics.chartData[4].views * 1.5} 
                             T 615 ${160 - analytics.chartData[6].views * 1.5}`}
                          fill="none"
                          stroke="#10B981"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                        />

                        {/* Revenue Lines */}
                        <path
                          d={`M 15 ${160 - (analytics.chartData[0].revenue / 100) * 1.1} 
                             L 115 ${160 - (analytics.chartData[1].revenue / 100) * 1.1} 
                             L 215 ${160 - (analytics.chartData[2].revenue / 100) * 1.1} 
                             L 315 ${160 - (analytics.chartData[3].revenue / 100) * 1.1} 
                             L 415 ${160 - (analytics.chartData[4].revenue / 100) * 1.1} 
                             L 515 ${160 - (analytics.chartData[5].revenue / 100) * 1.1} 
                             L 615 ${160 - (analytics.chartData[6].revenue / 100) * 1.1}`}
                          fill="none"
                          stroke="#18181B"
                          strokeWidth="2.5"
                          strokeDasharray="4 2"
                        />

                        {/* Node indicators */}
                        {analytics.chartData.map((d: any, idx: number) => {
                          const cx = 15 + idx * 100;
                          const cyViews = 160 - d.views * 1.5;
                          return (
                            <g key={idx}>
                              <circle cx={cx} cy={cyViews} r="5.5" fill="#10B981" />
                              <circle cx={cx} cy={cyViews} r="2.5" fill="#FFFFFF" />
                              <text x={cx - 10} y={190} fill="#A1A1AA" fontSize="9" fontWeight="bold" fontFamily="monospace">
                                {d.name}
                              </text>
                            </g>
                          );
                        })}
                      </>
                    )}
                  </svg>
                </div>
              </div>

              {/* Storefront Products Performance leaderboard */}
              <div className="bg-white border border-zinc-200/80 rounded-3xl p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-3 mb-4">
                  <div>
                    <h3 className="text-xs font-mono text-zinc-400 font-extrabold uppercase">Product Analytics Leaderboard</h3>
                    <p className="text-sm font-sans font-black text-zinc-900 mt-0.5">Top performing trade listings in 5km radar</p>
                  </div>
                  <span className="text-[10px] font-mono bg-zinc-100 text-zinc-650 px-3 py-1.5 rounded-full font-extrabold uppercase tracking-widest leading-none">
                    Sorted by Reach
                  </span>
                </div>

                {analytics?.popularProducts?.length === 0 ? (
                  <div className="p-8 text-center text-zinc-400 text-xs font-semibold font-sans">
                     You haven't posted any active listings yet! Head to "Post Trade Item" to launch your store on Sokos.
                  </div>
                ) : (
                  <div className="overflow-x-auto select-none">
                    <table className="w-full text-left text-xs font-sans">
                      <thead>
                        <tr className="text-[10px] text-zinc-400 font-mono uppercase border-b border-zinc-100 pb-2">
                          <th className="py-2.5 font-bold">Item Title</th>
                          <th className="py-2.5 font-bold">Price (KES)</th>
                          <th className="py-2.5 font-bold">Status</th>
                          <th className="py-2.5 font-bold">Visitor Reach</th>
                          <th className="py-2.5 font-bold text-right">Instant Launch Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 font-medium">
                        {analytics?.popularProducts?.map((p: any) => (
                          <tr key={p.id} className="hover:bg-zinc-50/50 transition">
                            <td className="py-3 font-sans font-black text-zinc-900 flex items-center gap-2">
                              {p.isBoosted && (
                                <span className="bg-amber-400 text-zinc-950 text-[7px] font-black uppercase px-2 rounded font-mono animate-pulse">
                                  ⚡ BOOSTED
                                </span>
                              )}
                              <span>{p.title}</span>
                            </td>
                            <td className="py-3 font-mono font-bold text-zinc-700">
                              KES {p.price.toLocaleString()}
                            </td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase font-mono tracking-wider ${
                                p.status === 'active' 
                                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                                  : 'bg-zinc-100 text-zinc-500'
                              }`}>
                                {p.status}
                              </span>
                            </td>
                            <td className="py-3 flex items-center gap-1 font-mono text-zinc-600">
                              <Eye className="w-3.5 h-3.5 text-zinc-400" />
                              <span>{p.views || 0}</span>
                            </td>
                            <td className="py-3 text-right">
                              {p.isBoosted ? (
                                <button className="text-[10px] text-amber-500 font-bold font-mono uppercase pr-2 pointer-events-none flex items-center gap-1 ml-auto">
                                  <Check className="w-3 h-3 text-emerald-500" />
                                  <span>Active Rank Booster</span>
                                </button>
                              ) : (
                                <button
                                  disabled={isBoostingId !== null}
                                  onClick={() => handleBoostListing(p.id)}
                                  className="py-1 px-3 bg-gradient-to-r from-zinc-900 to-zinc-950 text-emerald-400 border border-zinc-850 hover:text-white rounded-lg font-bold font-mono text-[9px] uppercase tracking-wider transition-all cursor-pointer inline-flex items-center gap-1 hover:shadow-sm"
                                >
                                  {isBoostingId === p.id ? (
                                    <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                                  ) : (
                                    <Zap className="w-2.5 h-2.5 text-amber-500 animate-pulse" />
                                  )}
                                  <span>Boost to Top</span>
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* 2. CUSTOM BRANDING BRAND IDENTITY */}
      {activeSubTab === 'branding' && (
        <div id="saas_branding_pane" className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-xs font-mono text-zinc-400 font-extrabold uppercase">STORE BRAND CUSTOMIZATION</h2>
            <p className="text-base font-display font-black text-zinc-900 mt-0.5">Define Your Premium Front</p>
            <p className="text-xs text-zinc-500 mt-1">Configure your storefront name, tagline, background banners, and logo to capture safe client trust matching verification rules.</p>
          </div>

          <form onSubmit={handleSaveStorefront} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider text-zinc-500 font-bold mb-1.5">Premium Store Name</label>
                <input
                  type="text"
                  placeholder="e.g. Kamau Tech Hub"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full text-xs font-bold text-zinc-800 bg-zinc-50/50 hover:bg-zinc-50 focus:bg-white border border-zinc-200 focus:border-zinc-900 rounded-xl px-4 py-3 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider text-zinc-500 font-bold mb-1.5">Slogan / Store Sells Tagline</label>
                <input
                  type="text"
                  placeholder="e.g. Genuine Electronics with 6-Month Nairobi Warranty"
                  value={storeTagline}
                  onChange={(e) => setStoreTagline(e.target.value)}
                  className="w-full text-xs font-bold text-zinc-800 bg-zinc-50/50 hover:bg-zinc-50 focus:bg-white border border-zinc-200 focus:border-zinc-900 rounded-xl px-4 py-3 outline-none transition"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] uppercase font-mono tracking-wider text-zinc-500 font-bold mb-1.5">Branded Backdrop Banner URL</label>
                <input
                  type="text"
                  placeholder="Paste Unsplash image URL or use our default backdrop"
                  value={storeBanner}
                  onChange={(e) => setStoreBanner(e.target.value)}
                  className="w-full text-xs font-mono text-zinc-600 bg-zinc-50/50 border border-zinc-200 focus:border-zinc-900 rounded-xl px-4 py-3 outline-none transition"
                />
              </div>
            </div>

            {/* Live Storefront Preview */}
            <div className="border border-zinc-100 rounded-2xl p-4 bg-zinc-50/40 select-none">
              <span className="text-[9px] font-mono font-extrabold uppercase text-zinc-400 tracking-widest block mb-2">Live Real-time Preview:</span>
              <div className="relative rounded-xl overflow-hidden h-32 bg-zinc-100 border text-white flex items-end">
                <img src={storeBanner} alt="" className="absolute inset-0 w-full h-full object-cover brightness-50" />
                <div className="relative p-4 z-10">
                  <div className="bg-emerald-500 text-zinc-950 font-black text-[7px] uppercase px-1.5 py-0.5 rounded font-mono w-max mb-1">
                    Verified Merchant Outlet
                  </div>
                  <h3 className="font-display font-black text-sm">{storeName || currentUser.name}</h3>
                  <p className="text-[10px] text-zinc-300 font-medium">{storeTagline || "Local Trade Radar verified distributor."}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSavingStore}
                className="px-6 py-3 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs font-black uppercase tracking-wider font-mono cursor-pointer transition flex items-center justify-center gap-1.5"
              >
                {isSavingStore ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Store className="w-3.5 h-3.5" />}
                <span>Save Store Brand Identity</span>
              </button>
            </div>

            {saveSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-xs font-bold text-center">
                Storefront banner, tagline, and details updated on public listings! 🌸
              </div>
            )}
          </form>
        </div>
      )}

      {/* 3. IMAGINATIVE AI LISTINGS WRITER */}
      {activeSubTab === 'copywriter' && (
        <div id="saas_copywriter_pane" className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-xs font-mono text-zinc-400 font-extrabold uppercase">SMART MERCHANT COPYWRITER</h2>
            <p className="text-base font-display font-black text-zinc-900 mt-0.5">Sokos Swahili AI Ad Generator</p>
            <p className="text-xs text-zinc-500 mt-1">Leverage customized Gemini-3.5-Flash copywriting parameters to rewrite rough product outlines into highly converting Nairobi marketplace adverts loaded with Swahili hype keywords.</p>
          </div>

          <form onSubmit={handleGenerateCopy} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-[10px] uppercase font-mono tracking-wider text-zinc-500 font-bold mb-1.5">Trade Item Name</label>
                <input
                  type="text"
                  placeholder="e.g. iPhone 13 Pro Max 256GB"
                  value={aiTitleInput}
                  onChange={(e) => setAiTitleInput(e.target.value)}
                  className="w-full text-xs font-bold text-zinc-800 bg-zinc-50/50 border border-zinc-200 focus:border-zinc-900 rounded-xl px-4 py-3 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider text-zinc-500 font-bold mb-1.5">Trade Value Price (KES)</label>
                <input
                  type="number"
                  placeholder="e.g. 52000"
                  value={aiPriceInput}
                  onChange={(e) => setAiPriceInput(e.target.value)}
                  className="w-full text-xs font-mono text-zinc-700 bg-zinc-50/50 border border-zinc-200 focus:border-zinc-900 rounded-xl px-4 py-3 outline-none"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-[10px] uppercase font-mono tracking-wider text-zinc-500 font-bold mb-1.5">Radar Product Category</label>
                <select
                  value={aiCategoryInput}
                  onChange={(e) => setAiCategoryInput(e.target.value)}
                  className="w-full text-xs font-sans font-bold text-zinc-800 bg-zinc-50/50 border border-zinc-200 focus:border-zinc-900 rounded-xl px-4 py-3 outline-none"
                >
                  <option value="Electronics">Electronics</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Clothing & Fashion">Clothing & Fashion</option>
                  <option value="Food & Groceries">Food & Groceries</option>
                  <option value="Vehicles">Vehicles</option>
                  <option value="Local Services">Local Services</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isGeneratingCopy}
                className="px-6 py-3 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs font-black uppercase tracking-wider font-mono cursor-pointer transition flex items-center justify-center gap-1.5"
              >
                {isGeneratingCopy ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>Generate High-Converting Ad</span>
              </button>
            </div>
          </form>

          {/* Result Card */}
          {generatedCopy && (
            <div className="bg-emerald-50/10 border-2 border-emerald-500/20 rounded-2xl p-4 space-y-4 animate-in fade-in transition duration-300">
              <div className="flex justify-between items-center bg-zinc-950 text-white p-3.5 rounded-xl text-xs font-extrabold border border-zinc-850">
                <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider text-emerald-400">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Soko Copywriter Output Received
                </span>
                {generatedCopy.fallback && (
                  <span className="text-[8px] font-mono bg-zinc-900 border border-zinc-850 text-zinc-400 px-2 rounded-full">
                    DEMO SIMULATION
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <div className="text-[10px] uppercase font-mono font-bold text-zinc-400 pb-1 border-b">Suggested Swahili Search Keywords:</div>
                <div className="flex flex-wrap gap-2 pt-1 font-sans">
                  {generatedCopy.swahiliKeywords?.map((keyword: string, idx: number) => (
                    <span key={idx} className="bg-emerald-400 text-zinc-950 font-black text-[9px] uppercase px-3 py-1.5 rounded-full border border-emerald-555">
                      🔥 {keyword}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="text-[10px] uppercase font-mono font-bold text-zinc-400 pb-1 border-b">Optimized SEO Display Title:</div>
                <div className="text-sm font-display font-black text-zinc-900 mt-1">
                  {generatedCopy.optimizedTitle}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="text-[10px] uppercase font-mono font-bold text-zinc-400 pb-1 border-b">Compelling Body Copy:</div>
                <div className="text-xs text-zinc-700 leading-relaxed font-semibold whitespace-pre-line bg-white rounded-xl p-3.5 border border-zinc-150">
                  {generatedCopy.description}
                </div>
              </div>

              <div className="text-[9px] text-zinc-400 font-mono text-center">
                Copy text boxes above to replace or paste in your main listings form! Let searchers recognize your premium branding.
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. BILLING PLANS SUBSCRIPTION SELECTION */}
      {activeSubTab === 'subscription' && (
        <div id="saas_subscription_pane" className="space-y-6">
          <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-sm">
            <h2 className="text-xs font-mono text-zinc-400 font-extrabold uppercase">MERCHANT SAAS TARIFF PACKAGES</h2>
            <p className="text-base font-display font-black text-zinc-900 mt-0.5">Choose Plan, Unlock Revenue potential</p>
            <p className="text-xs text-zinc-500 mt-1">Sokos subscription tiers provide access to verification badges, premium listing boosts (stay at top of 5km searches of clients), and complete analytics logs.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 select-none">
            {/* Bronze Card */}
            <div className="bg-white border-2 border-zinc-200 rounded-3xl p-5 shadow-sm relative flex flex-col justify-between group">
              <div>
                <span className="bg-zinc-100 text-zinc-800 text-[8px] font-black uppercase px-2.5 py-1 rounded-full font-mono">
                  🥉 BRONZE BUSINESS
                </span>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-2xl font-display font-black text-zinc-900">KES 999</span>
                  <span className="text-[10px] text-zinc-400 font-bold font-mono">/ Month</span>
                </div>
                <p className="text-[10px] text-zinc-500 font-semibold font-sans mt-1">Designed for casual local sellers to establish verified trade reputation.</p>
                
                <ul className="mt-5 space-y-2 border-t pt-4 text-[10px] font-bold text-zinc-650 font-sans">
                  <li className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span><b>5</b> Premium Listing Boosts</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Blue Verification Badge</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Basic Page View Tracking</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => { setSelectedPlan('bronze'); setPaymentStep('idle'); }}
                className="mt-6 w-full py-3 bg-zinc-900 hover:bg-zinc-850 text-white font-black text-xs uppercase tracking-wider font-mono rounded-xl transition cursor-pointer"
              >
                Upgrade to Bronze
              </button>
            </div>

            {/* Silver Plan */}
            <div className="bg-white border-2 border-emerald-500 rounded-3xl p-5 shadow-md relative flex flex-col justify-between group transform scale-102">
              <div className="absolute -top-3.5 right-6 bg-emerald-500 text-zinc-950 text-[8px] font-black uppercase px-3 py-1 rounded-full font-mono shadow animate-bounce">
                🌟 HOT SELLER DEAL
              </div>
              <div>
                <span className="bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase px-2.5 py-1 rounded-full font-mono border border-emerald-200">
                  🥈 SILVER PRO MARKET
                </span>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-display font-black text-zinc-900">KES 2,499</span>
                  <span className="text-[10px] text-zinc-400 font-bold font-mono">/ Month</span>
                </div>
                <p className="text-[10px] text-zinc-500 font-semibold font-sans mt-1">Ideal for home businesses, side-hustles, and active Nairobi merchants.</p>
                
                <ul className="mt-5 space-y-2 border-t pt-4 text-[10px] font-bold text-zinc-650 font-sans">
                  <li className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span><b>15</b> Premium Listing Boosts</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Blue Verification Badge</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Complete Bento Analytics Charts</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Custom Brand Store Slogan & Backdrops</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => { setSelectedPlan('silver'); setPaymentStep('idle'); }}
                className="mt-6 w-full py-3 bg-emerald-555 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs uppercase tracking-wider font-mono rounded-xl transition cursor-pointer shadow-lg shadow-emerald-500/10"
              >
                Upgrade to Silver
              </button>
            </div>

            {/* Gold Plan */}
            <div className="bg-gradient-to-b from-zinc-950 to-zinc-90 w-full border-2 border-amber-400 text-white rounded-3xl p-5 shadow-lg flex flex-col justify-between group">
              <div>
                <span className="bg-amber-400 text-zinc-950 text-[8px] font-black uppercase px-2.5 py-1 rounded-full font-mono">
                  👑 GOLD ENTERPRISE
                </span>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-2xl font-display font-black text-white">KES 4,999</span>
                  <span className="text-[10px] text-zinc-400 font-bold font-mono">/ Month</span>
                </div>
                <p className="text-[10px] text-zinc-400 font-semibold font-sans mt-1">Maximum visibility. Dominate trade maps in all Nairobi sub-locations.</p>
                
                <ul className="mt-5 space-y-2 border-t border-zinc-800 pt-4 text-[10px] font-bold text-zinc-300 font-sans">
                  <li className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-amber-400" />
                    <span className="text-white"><b>Unlimited</b> Premium Boosts</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-amber-400" />
                    <span className="text-white">Gold Verified Seller Badge</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-amber-400" />
                    <span>Unrestricted Gemini Copywriter API</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-amber-400" />
                    <span>Priority Daraja webhook order settlement</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => { setSelectedPlan('gold'); setPaymentStep('idle'); }}
                className="mt-6 w-full py-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-zinc-950 font-black text-xs uppercase tracking-wider font-mono rounded-xl transition cursor-pointer hover:brightness-110 active:scale-99 shadow-lg shadow-amber-400/10"
              >
                Upgrade to Gold
              </button>
            </div>
          </div>

          {/* ACTIVE CHECKOUT DIALOG */}
          {selectedPlan && (
            <div className="bg-white border-2 border-zinc-900 rounded-3xl p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center pb-3 border-b mb-4">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-emerald-500 animate-bounce" />
                  <h3 className="font-display font-black text-zinc-900 text-sm">
                    Soko SaaS Checkout: {selectedPlan.toUpperCase()} TIER
                  </h3>
                </div>
                <button 
                  onClick={() => setSelectedPlan(null)} 
                  className="text-zinc-400 hover:text-zinc-650 font-black text-xs font-mono uppercase bg-zinc-100 h-6 px-1.5 rounded-lg border cursor-pointer"
                >
                  cancel
                </button>
              </div>

              {paymentStep === 'idle' && (
                <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                  <div className="p-4 bg-emerald-50/20 border border-emerald-100 rounded-2xl flex items-start gap-3">
                    <Phone className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-black text-emerald-950">Daraja M-Pesa Integration Active</p>
                      <p className="text-zinc-600 mt-0.5">Please provide your Safaricom active mobile number. Clicking Trigger will issue a safe dynamic API STK simulation prompt inside your sandbox.</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-mono tracking-wider text-zinc-500 font-bold mb-1.5">Safaricom Active Line</label>
                    <input
                      type="text"
                      placeholder="e.g. 0712345678"
                      value={mpesaPhone}
                      onChange={(e) => setMpesaPhone(e.target.value)}
                      className="w-full text-xs font-mono font-bold text-zinc-800 bg-zinc-50 border focus:border-zinc-900 focus:bg-white rounded-xl px-4 py-3 outline-none transition"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs uppercase tracking-wider font-mono rounded-xl cursor-pointer transition shadow-[0_4px_12px_rgba(52,211,153,0.25)] flex items-center justify-center gap-1"
                  >
                    <span>Trigger M-Pesa Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {paymentStep === 'pushing' && (
                <div className="py-10 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
                  <p className="text-xs font-mono font-black text-zinc-900 uppercase">CONTACTING SAFARICOM DARAJA SERVER...</p>
                  <p className="text-[11px] text-zinc-500 font-medium">Sending STK Push notification request over webhook logs.</p>
                </div>
              )}

              {paymentStep === 'awaiting' && (
                <div className="py-8 text-center space-y-4">
                  <div className="w-14 h-14 bg-zinc-950 text-white rounded-full flex items-center justify-center font-black font-mono text-lg border-2 border-emerald-400 shadow animate-pulse mx-auto">
                    {pushTimer}s
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-mono font-black text-zinc-905 uppercase">🔑 PIN DIALOG OPEN IN YOUR RESIDENCE FORUM</p>
                    <p className="text-[11px] text-emerald-600 font-bold">Checkout Request: ws_CO_{Date.now().toString().slice(-4)}_PRX</p>
                    <p className="text-[11px] text-zinc-500 px-8 text-center leading-normal">Confirm the transaction by checking your mobile screen for the popup, or wait for Soko custom autocommit to resolve.</p>
                  </div>
                  <button
                    onClick={triggerActivation}
                    className="py-2.5 px-6 bg-zinc-950 hover:bg-zinc-850 text-emerald-400 hover:text-white rounded-xl font-bold font-mono text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Simulate PIN OK Checkout
                  </button>
                </div>
              )}

              {paymentStep === 'success' && (
                <div className="py-10 text-center space-y-4 animate-in fade-in duration-300">
                  <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
                  <div className="space-y-1.5 px-6">
                    <h4 className="font-display font-black text-zinc-900 text-base">Subscription Successfully Provisioned! 🎉</h4>
                    <p className="text-xs text-zinc-555 font-medium leading-relaxed">
                      Safaricom Webhook returned Success Code 0. Soko Premium {selectedPlan.toUpperCase()} services are running! Your Storefront verified badge is active.
                    </p>
                  </div>
                  <button
                    onClick={() => { setSelectedPlan(null); setPaymentStep('idle'); }}
                    className="py-2 px-6 bg-zinc-950 text-white hover:bg-zinc-800 rounded-xl text-xs font-black uppercase font-mono tracking-wider cursor-pointer"
                  >
                    Enter Merchant Panel
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
