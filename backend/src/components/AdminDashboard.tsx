import React, { useState, useEffect } from 'react';
import { User, Listing } from '../types';
import { 
  Check, 
  Trash2, 
  ShieldCheck, 
  Sparkles, 
  Star, 
  RefreshCw, 
  Search, 
  AlertCircle, 
  Filter, 
  Clock, 
  ShieldAlert,
  ThumbsDown,
  ThumbsUp,
  MapPin
} from 'lucide-react';
import { apiFetch } from '../utils';

interface Props {
  currentUser: User;
  onListingModerated: () => void;
}

export default function AdminDashboard({ currentUser, onListingModerated }: Props) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'pending' | 'moderation'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [actioningId, setActioningId] = useState<string | null>(null);

  // Statistics calculation
  const totalCount = listings.length;
  const pendingCount = listings.filter(l => !l.isApproved).length;
  const activeCount = listings.filter(l => l.isApproved && !l.isSpam).length;
  const spamCount = listings.filter(l => l.isSpam).length;
  const featuredCount = listings.filter(l => l.isFeatured).length;

  const fetchAdminListings = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/admin/listings');
      if (res.ok) {
        const data = await res.json();
        setListings(data);
      }
    } catch (err) {
      console.error('Error fetching admin moderation directory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminListings();
  }, []);

  const handleApprove = async (listingId: string) => {
    setActioningId(listingId);
    try {
      const res = await apiFetch(`/api/listings/${listingId}/approve`, {
        method: 'POST'
      });
      if (res.ok) {
        // Optimistic update
        setListings(prev => prev.map(l => l.id === listingId ? { ...l, isApproved: true } : l));
        onListingModerated();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActioningId(null);
    }
  };

  const handleToggleSpam = async (listingId: string, currentSpamStatus: boolean) => {
    setActioningId(listingId);
    try {
      const res = await apiFetch(`/api/listings/${listingId}/spam`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isSpam: !currentSpamStatus })
      });
      if (res.ok) {
        setListings(prev => prev.map(l => l.id === listingId ? { ...l, isSpam: !currentSpamStatus } : l));
        onListingModerated();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActioningId(null);
    }
  };

  const handleToggleFeature = async (listingId: string, currentFeatureStatus: boolean) => {
    setActioningId(listingId);
    try {
      const res = await apiFetch(`/api/listings/${listingId}/feature`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: !currentFeatureStatus })
      });
      if (res.ok) {
        setListings(prev => prev.map(l => l.id === listingId ? { ...l, isFeatured: !currentFeatureStatus } : l));
        onListingModerated();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActioningId(null);
    }
  };

  // Filter listings based on sub-tab and search terms
  const categories = ['All', ...Array.from(new Set(listings.map(l => l.category)))];

  const processedListings = listings.filter(l => {
    // Tab filtering
    if (activeSubTab === 'pending') {
      if (l.isApproved) return false;
    } else {
      // Show approved or spam listings in general moderation
    }

    // Search term filter
    const matchesSearch = l.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          l.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          l.vendorName.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Category filter
    const matchesCategory = categoryFilter === 'All' || l.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      
      {/* 🛡️ Header section */}
      <div className="bg-zinc-950 text-white rounded-3xl p-6 border border-zinc-800 shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="bg-rose-500 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full font-mono">
              SYSTEM MODIFIER ACTIVE
            </span>
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              Admin Authorization Verified
            </span>
          </div>
          <h2 className="text-lg md:text-xl font-display font-black tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-rose-500" />
            <span>Nairobi Soko Safety Admin Hub</span>
          </h2>
          <p className="text-zinc-400 text-2xs leading-relaxed max-w-xl">
            Authorize new coordinate-pinned marketplace listings, block deceptive patterns, flag spam listings, and promote local vendor showcases!
          </p>
        </div>
        <button
          onClick={fetchAdminListings}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 self-start md:self-auto bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-3xs font-mono font-bold tracking-wider uppercase text-zinc-300 transition duration-150 cursor-pointer"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Queue</span>
        </button>
      </div>

      {/* 📊 Minimalist KPI Stats Rows */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 flex flex-col justify-between">
          <div className="text-[9px] font-mono font-black text-zinc-400 uppercase tracking-widest">Awaiting Approval</div>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-black font-mono text-amber-500">{pendingCount}</span>
            <Clock className="w-3.5 h-3.5 text-amber-500" />
          </div>
        </div>
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 flex flex-col justify-between">
          <div className="text-[9px] font-mono font-black text-zinc-400 uppercase tracking-widest">Active Live Directory</div>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-black font-mono text-emerald-600">{activeCount}</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
          </div>
        </div>
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 flex flex-col justify-between">
          <div className="text-[9px] font-mono font-black text-zinc-400 uppercase tracking-widest">Marked Trash / Spam</div>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-black font-mono text-rose-600">{spamCount}</span>
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
          </div>
        </div>
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 flex flex-col justify-between">
          <div className="text-[9px] font-mono font-black text-zinc-400 uppercase tracking-widest">Featured Listings</div>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-black font-mono text-amber-500">{featuredCount}</span>
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          </div>
        </div>
      </div>

      {/* 🧭 Queue Navigation Tabs & Filters */}
      <div className="bg-white border border-zinc-200/80 rounded-3xl p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-150 pb-2 gap-2">
          
          {/* Sub-tab selection */}
          <div className="flex gap-1 bg-zinc-100 p-1 rounded-xl self-start">
            <button
              onClick={() => { setActiveSubTab('pending'); setSearchTerm(''); }}
              className={`px-4 py-1.5 text-2xs font-extrabold rounded-lg tracking-wide transition-all cursor-pointer ${
                activeSubTab === 'pending'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-550 hover:text-zinc-900'
              }`}
            >
              Approval Queue ({pendingCount})
            </button>
            <button
              onClick={() => { setActiveSubTab('moderation'); setSearchTerm(''); }}
              className={`px-4 py-1.5 text-2xs font-extrabold rounded-lg tracking-wide transition-all cursor-pointer ${
                activeSubTab === 'moderation'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-550 hover:text-zinc-900'
              }`}
            >
              All Directory Listings ({totalCount})
            </button>
          </div>

          {/* Quick instructions indicator */}
          <span className="text-[9.5px] font-mono text-zinc-400 self-end">
            Session: <span className="text-zinc-700 font-bold font-sans">{currentUser.name} (Admin)</span>
          </span>
        </div>

        {/* Filters Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          
          {/* Search Box */}
          <div className="relative col-span-2">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, description or seller name..."
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-9 py-2 text-2xs focus:border-zinc-900 outline-none font-medium text-zinc-800"
            />
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <Filter className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-8 pr-3 py-2 text-2xs focus:border-zinc-900 outline-none font-bold text-zinc-700 appearance-none"
            >
              {categories.map(c => (
                <option key={c} value={c}>Category: {c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Listings Display Queue */}
        {loading ? (
          <div className="py-12 text-center text-xs font-mono text-zinc-400 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-zinc-300" />
            <span>Loading admin moderation matrix...</span>
          </div>
        ) : processedListings.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-zinc-100 rounded-2xl text-zinc-450 space-y-1.5">
            <AlertCircle className="w-6 h-6 text-zinc-300 mx-auto" />
            <div className="text-xs font-bold text-zinc-700">No Listings Found</div>
            <p className="text-[10px] text-zinc-400 max-w-xs mx-auto">
              {activeSubTab === 'pending' 
                ? "Perfect! All Soko listings are verified and approved. No item is currently pending approval."
                : "No listing entries match your search criteria or category filter in the system directory."}
            </p>
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            {processedListings.map(listing => {
              const isPending = !listing.isApproved;
              const isActioning = actioningId === listing.id;

              return (
                <div 
                  key={listing.id}
                  id={`admin_listing_card_${listing.id}`}
                  className={`flex flex-col md:flex-row md:items-center gap-4 p-4 border border-zinc-150 rounded-2xl hover:bg-zinc-50/50 transition duration-150 ${
                    listing.isSpam ? 'bg-rose-50/30' : ''
                  }`}
                >
                  {/* Photo thumbnail */}
                  <img 
                    src={listing.images[0] || 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=300&q=80'} 
                    alt="" 
                    className="w-16 h-16 rounded-xl object-cover border border-zinc-200 self-start md:self-auto"
                  />

                  {/* Information block */}
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="bg-zinc-100 text-zinc-700 font-mono text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                        {listing.category}
                      </span>
                      {listing.isSpam && (
                        <span className="bg-rose-500 text-white font-mono text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-0.5">
                          <ThumbsDown className="w-2.5 h-2.5" /> Blocked Spam
                        </span>
                      )}
                      {listing.isFeatured && (
                        <span className="bg-amber-100 text-amber-800 font-mono text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500 border-none" /> Featured Top
                        </span>
                      )}
                      {!listing.isApproved && (
                        <span className="bg-amber-500 text-zinc-950 font-mono text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md animate-pulse">
                          Awaiting Approval
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-extrabold text-zinc-900 leading-tight">{listing.title}</h4>
                    <p className="text-[10px] text-zinc-450 line-clamp-1 max-w-lg leading-relaxed">{listing.description}</p>
                    
                    <div className="flex items-center gap-3.5 text-[9.5px] font-mono text-zinc-450">
                      <span>Price: <b className="text-rose-600 font-sans text-2xs">KES {listing.price.toLocaleString()}</b></span>
                      <span>Owner: <b className="text-zinc-600">{listing.vendorName}</b></span>
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-3 h-3 text-emerald-500" />
                        LAT: {listing.latitude?.toFixed(4)}
                      </span>
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div className="flex gap-1.5 self-end md:self-auto">
                    {isPending ? (
                      <button
                        onClick={() => handleApprove(listing.id)}
                        disabled={isActioning}
                        className="flex items-center justify-center gap-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-sans font-black text-xs px-3.5 py-1.5 rounded-xl cursor-pointer transition active:scale-95 shadow-sm shadow-emerald-500/10"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    ) : (
                      <>
                        {/* Feature Toggle */}
                        <button
                          onClick={() => handleToggleFeature(listing.id, !!listing.isFeatured)}
                          disabled={isActioning}
                          title={listing.isFeatured ? "Remove from Featured" : "Promote to Featured Showcase"}
                          className={`flex items-center justify-center gap-1 border text-xs px-3 py-1.5 rounded-xl transition cursor-pointer active:scale-95 ${
                            listing.isFeatured
                              ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                              : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
                          }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${listing.isFeatured ? 'fill-zinc-950 text-zinc-950' : ''}`} />
                          <span className="text-[10px] font-bold">{listing.isFeatured ? 'Featured' : 'Feature'}</span>
                        </button>
                        
                        {/* Spam Flag Toggle */}
                        <button
                          onClick={() => handleToggleSpam(listing.id, !!listing.isSpam)}
                          disabled={isActioning}
                          title={listing.isSpam ? "Unblock from directory" : "Flag as deceptive / spam"}
                          className={`flex items-center justify-center gap-1 border text-xs px-3 py-1.5 rounded-xl transition cursor-pointer active:scale-95 ${
                            listing.isSpam
                              ? 'bg-rose-500 text-white border-rose-450 font-bold'
                              : 'bg-white text-rose-500 border-rose-100 hover:bg-rose-50/50'
                          }`}
                        >
                          {listing.isSpam ? <ThumbsUp className="w-3.5 h-3.5" /> : <ThumbsDown className="w-3.5 h-3.5" />}
                          <span className="text-[10px] font-bold">{listing.isSpam ? 'Mark Legitimate' : 'Flag Spam'}</span>
                        </button>
                      </>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
