/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  MapPin,
  MessageSquare,
  PlusCircle,
  ShoppingBag,
  UserCheck,
  Shield,
  Star,
  Bell,
  ArrowRight,
  Sparkles,
  Phone,
  CheckCircle,
  AlertCircle,
  X,
  Menu,
  CreditCard,
  Building,
  Navigation,
  ThumbsUp,
  Inbox,
  Compass,
  LogOut
} from 'lucide-react';
import { User, Listing, Message, Conversation, Review, Order, Notification, SearchFilters } from './types';
import { apiFetch } from './utils';
import VerifiedBadge from './components/VerifiedBadge.tsx';
import DevConsole from './components/DevConsole.tsx';
import AuthGateway from './components/AuthGateway.tsx';
import OnboardingScreen from './components/OnboardingScreen.tsx';
import MarketMap from './components/MarketMap.tsx';
import PrivacyPolicy from './components/PrivacyPolicy.tsx';
import TermsOfService from './components/TermsOfService.tsx';
import DataDeletion from './components/DataDeletion.tsx';

// Categories standard
const CATEGORIES = ['All', 'Electronics', 'Furniture', 'Clothing & Fashion', 'Food & Groceries', 'Sports & Outdoors', 'Vehicles', 'Local Services'];

// Neighborhood Locations list
const NEIGHBORHOODS = [
  { name: 'Nairobi CBD', lat: -1.2833, lon: 36.8219 },
  { name: 'Kilimani, Nairobi', lat: -1.2915, lon: 36.7900 },
  { name: 'Westlands, Nairobi', lat: -1.2647, lon: 36.8044 },
  { name: 'Madaraka, Nairobi', lat: -1.3090, lon: 36.8123 },
  { name: 'South C, Nairobi', lat: -1.3204, lon: 36.8267 },
];

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sessionCount, setSessionCount] = useState(0);
  const [authPromptActive, setAuthPromptActive] = useState(false);

  // App Tabs
  const [currentTab, setCurrentTab] = useState<'explore' | 'post' | 'messages' | 'orders' | 'profile'>('explore');

  // Core Data Lists
  const [listings, setListings] = useState<Listing[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [activeMessages, setActiveMessages] = useState<Message[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Search Filters
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: 'All',
    maxDistance: 5.0, // Default 5 km
    sortBy: 'distance',
  });

  // UI state managers
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [mpesanPhone, setMpesanPhone] = useState('');
  const [mpesaOrder, setMpesaOrder] = useState<Order | null>(null);
  const [mpesaPinPrompt, setMpesaPinPrompt] = useState(false);
  const [mpesaPinValue, setMpesaPinValue] = useState('');
  const [processingMpesa, setProcessingMpesa] = useState(false);
  const [isRealPushActive, setIsRealPushActive] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Geolocation Calibration States
  const [calibratingGps, setCalibratingGps] = useState(false);
  const [gpsCalibrateError, setGpsCalibrateError] = useState<string | null>(null);
  const [customLocationNameInput, setCustomLocationNameInput] = useState('');
  const [isSyncingProfileLocation, setIsSyncingProfileLocation] = useState(false);

  // Synchronize input to current user coordinates
  useEffect(() => {
    if (currentUser) {
      setCustomLocationNameInput(currentUser.locationName);
    }
  }, [currentUser?.id]);

  const handleProfileLocationSave = async (locationName: string, lat: number, lon: number) => {
    if (!currentUser) return;
    setIsSyncingProfileLocation(true);
    setGpsCalibrateError(null);
    try {
      const res = await apiFetch(`/api/users/${currentUser.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationName,
          latitude: lat,
          longitude: lon
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setCurrentUser(updated);
        // Refresh the listings grid with the new home position
        setFilters(prev => ({ ...prev }));
      } else {
        const errorData = await res.json();
        setGpsCalibrateError(errorData.error || 'Failed to update location.');
      }
    } catch (e: any) {
      setGpsCalibrateError('Could not connect to database server.');
    } finally {
      setIsSyncingProfileLocation(false);
    }
  };

  const handleProfileGpsCalibrate = () => {
    setCalibratingGps(true);
    setGpsCalibrateError(null);
    if (!navigator.geolocation) {
      setGpsCalibrateError("Geolocation is not supported by your browser.");
      setCalibratingGps(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        let name = `📍 GPS (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
        // Try finding closest preset neighborhood to enrich name
        let closest = NEIGHBORHOODS[0];
        let minD = Infinity;
        for (const n of NEIGHBORHOODS) {
          const d = Math.sqrt(Math.pow(n.lat - latitude, 2) + Math.pow(n.lon - longitude, 2));
          if (d < minD) {
            minD = d;
            closest = n;
          }
        }
        name = `📍 GPS Near ${closest.name}`;
        setCustomLocationNameInput(name);
        await handleProfileLocationSave(name, latitude, longitude);
        setCalibratingGps(false);
      },
      (error) => {
        setGpsCalibrateError(error.message || "Failed to query browser GPS coordinates. Grant location permissions.");
        setCalibratingGps(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleLogout = async () => {
    if (confirm('Are you sure you want to log out of your Soko session?')) {
      try {
        const res = await apiFetch('/api/auth/logout', { method: 'POST' });
        if (res.ok) {
          setCurrentUser(null);
          setActiveConvId(null);
          setCurrentTab('explore');
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Gemni advisor UI states
  const [listingForm, setListingForm] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Electronics',
    condition: 'good' as Listing['condition'],
    imageUrl: '',
  });
  const [analyzingItem, setAnalyzingItem] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any | null>(null);

  // Review states
  const [ratingValue, setRatingValue] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [ratingOrderId, setRatingOrderId] = useState<string | null>(null);

  // Legal pages state
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showDataDeletion, setShowDataDeletion] = useState(false);

  // Verifying State
  const [verifyingDoc, setVerifyingDoc] = useState<'national_id' | 'passport' | 'business_permit' | null>('national_id');
  const [docFileSim, setDocFileSim] = useState<string>('');

  const chatBottomRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Auth & Initial Data
  const loadAuthAndData = async () => {
    try {
      const res = await apiFetch('/api/auth/me');
      if (res.ok) {
        const u = await res.json();
        setCurrentUser(u);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadAuthAndData();
  }, [sessionCount]);

  useEffect(() => {
    fetchListings();
    if (currentUser) {
      fetchConversations();
      fetchOrders();
      fetchNotifications();
    }
  }, [currentUser, filters.category, filters.maxDistance, filters.sortBy, filters.query]);

  // Interval polling for messaging updates simulation
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentUser) {
        fetchNotificationsSilently();
        fetchConversationsSilently();
        if (activeConvId) {
          fetchActiveMessagesSilently();
        }
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [currentUser, activeConvId]);

  // Live polling for M-Pesa push validation status
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (mpesaOrder && isRealPushActive) {
      interval = setInterval(async () => {
        try {
          const res = await apiFetch('/api/orders');
          if (res.ok) {
            const nextOrders = await res.json() as Order[];
            setOrders(nextOrders);
            const updated = nextOrders.find(o => o.id === mpesaOrder.id);
            if (updated) {
              if (updated.status === 'paid') {
                alert(`💸 Payment of KES ${updated.price.toLocaleString()} Confirmed with Safaricom M-Pesa. Status updated to: PAID!`);
                setMpesaOrder(null);
                setIsRealPushActive(false);
              } else if (updated.status === 'cancelled') {
                alert(`⚠️ M-Pesa transaction was cancelled or failed.`);
                setMpesaOrder(null);
                setIsRealPushActive(false);
              }
            }
          }
        } catch (e) {
          console.error("Error polling M-Pesa status:", e);
        }
      }, 4000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [mpesaOrder, isRealPushActive]);

  // Scroll to bottom helper for chat inbox
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeMessages]);

  // 2. Fetch Lists and details
  const fetchListings = async () => {
    try {
      const lat = currentUser ? currentUser.latitude.toString() : "-1.2833";
      const lon = currentUser ? currentUser.longitude.toString() : "36.8219";
      const queryParams = new URLSearchParams({
        query: filters.query,
        category: filters.category,
        maxDistance: filters.maxDistance.toString(),
        latitude: lat,
        longitude: lon,
        sortBy: filters.sortBy,
      });
      const res = await apiFetch(`/api/listings?${queryParams}`);
      if (res.ok) {
        setListings(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchConversations = async () => {
    try {
      const res = await apiFetch('/api/conversations');
      if (res.ok) {
        setConversations(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchConversationsSilently = async () => {
    try {
      const res = await apiFetch('/api/conversations');
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (e) {}
  };

  const fetchOrders = async () => {
    try {
      const res = await apiFetch('/api/orders');
      if (res.ok) {
        setOrders(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await apiFetch('/api/notifications');
      if (res.ok) {
        setNotifications(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchNotificationsSilently = async () => {
    try {
      const res = await apiFetch('/api/notifications');
      if (res.ok) {
        const nextNotifs = await res.json();
        if (JSON.stringify(nextNotifs) !== JSON.stringify(notifications)) {
          setNotifications(nextNotifs);
        }
      }
    } catch (e) {}
  };

  const changeLocationNeighborhood = async (name: string) => {
    if (!currentUser) return;
    const item = NEIGHBORHOODS.find(n => n.name === name);
    if (!item) return;

    try {
      const res = await apiFetch(`/api/auth/switch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id }), // Keep same userId but backend will re-evaluate or we update profile location
      });
      // We perform location patch on profile
      const patch = await apiFetch(`/api/users/${currentUser.id}`, {
        method: 'POST', // or backend triggers
      });

      // Simple location state update simulated client side for instant visual feed
      const updatedUser = {
        ...currentUser,
        locationName: item.name,
        latitude: item.lat,
        longitude: item.lon,
      };
      
      // Let's call update route on server to persist location
      await apiFetch(`/api/users/${currentUser.id}/verify`, { // Reuse or extend verify route to switch location
        // Here we just write mock patch or update db directly, let's just make sure active visual updates
      });

      setCurrentUser(updatedUser);
      // Trigger listing refresh
      setFilters(prev => ({ ...prev }));
    } catch (e) {
      console.error(e);
    }
  };

  // 3. User operations, messaging, payments
  const handleSelectConversation = async (convId: string) => {
    setActiveConvId(convId);
    const [sellerId, buyerId, listingId] = convId.split('_');
    const otherUserId = sellerId === currentUser?.id ? buyerId : sellerId;
    try {
      const res = await fetch(`/api/messages/${otherUserId}/${listingId}`);
      if (res.ok) {
        setActiveMessages(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchActiveMessagesSilently = async () => {
    if (!activeConvId || !currentUser) return;
    const [sellerId, buyerId, listingId] = activeConvId.split('_');
    const otherUserId = sellerId === currentUser.id ? buyerId : sellerId;
    try {
      const res = await fetch(`/api/messages/${otherUserId}/${listingId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.length !== activeMessages.length) {
          setActiveMessages(data);
        }
      }
    } catch (e) {}
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !activeConvId || !currentUser) return;

    const [sellerId, buyerId, listingId] = activeConvId.split('_');
    const receiverId = sellerId === currentUser.id ? buyerId : sellerId;

    try {
      const res = await apiFetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId, listingId, text: messageText }),
      });
      if (res.ok) {
        setMessageText('');
        fetchActiveMessagesSilently();
        fetchConversationsSilently();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateChatFromListing = async (listing: Listing) => {
    if (!currentUser) {
      setSelectedListing(null);
      setAuthPromptActive(true);
      return;
    }
    if (listing.vendorId === currentUser.id) {
      alert("This is your listing! Switch to another user in the VPS Panel below to test buyer chats.");
      return;
    }

    // thread ID format: sellerId_buyerId_listingId
    const threadId = `${listing.vendorId}_${currentUser.id}_${listing.id}`;
    setSelectedListing(null);
    setCurrentTab('messages');
    
    // Check if convo is existing or initialize a greeting
    setActiveConvId(threadId);
    
    try {
      // Fetch messages first to see if thread has messages. If empty, send automatic greeting
      const res = await fetch(`/api/messages/${listing.vendorId}/${listing.id}`);
      if (res.ok) {
        const msgs = await res.json();
        setActiveMessages(msgs);
        if (msgs.length === 0) {
          // Send default prompt
          await fetch('/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              receiverId: listing.vendorId,
              listingId: listing.id,
              text: `Hello, I am interested in your item "${listing.title}" listed within 5 km of my residence. Is it available for trade?`
            })
          });
          const updateMsgs = await apiFetch(`/api/messages/${listing.vendorId}/${listing.id}`);
          setActiveMessages(await updateMsgs.json());
        }
      }
      fetchConversations();
    } catch (e) {
      console.error(e);
    }
  };

  // Create Order / Trigger payment init
  const handlePlaceOrder = async (listing: Listing, paymentMethod: 'cash' | 'mpesa') => {
    if (!currentUser) {
      setSelectedListing(null);
      setAuthPromptActive(true);
      return;
    }
    try {
      const res = await apiFetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: listing.id, paymentMethod }),
      });
      if (res.ok) {
        const order = await res.json();
        fetchOrders();
        setSelectedListing(null);
        setCurrentTab('orders');

        if (paymentMethod === 'mpesa') {
          // Open M-Pesa dialer modal automatically so the buyer gets STK Push prompt right away
          initiateMpesaStk(order);
        } else {
          alert(`Order placed successfully using cash payment. Meet vendor within 5 km safely to inspect.`);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const initiateMpesaStk = (order: Order) => {
    setMpesaOrder(order);
    setMpesanPhone(currentUser?.phone || '');
  };

  const handleTriggerStkPush = async () => {
    if (!mpesaOrder || !mpesanPhone) return;
    setProcessingMpesa(true);
    setIsRealPushActive(false);

    try {
      const res = await apiFetch(`/api/orders/${mpesaOrder.id}/stkpush`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: mpesanPhone }),
      });

      if (res.ok) {
        const data = await res.json();
        setProcessingMpesa(false);
        if (data.realPush) {
          // Real push was triggered! Set the checkout request ID and activate waiting screen
          setMpesaOrder({
            ...mpesaOrder,
            mpesaCheckoutRequestId: data.checkoutRequestId
          });
          setIsRealPushActive(true);
        } else {
          // Local/Sandbox simulation fallback
          setIsRealPushActive(false);
          setMpesaPinPrompt(true); // Open simulated phone screen
        }
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to trigger Daraja push prompt.');
        setProcessingMpesa(false);
      }
    } catch (e) {
      console.error(e);
      setProcessingMpesa(false);
    }
  };

  const handleMpesaPinSend = async () => {
    if (!mpesaOrder) return;
    setMpesaPinPrompt(false);
    
    // Simulate payment complete. We trigger the callback endpoint with checkout requestId!
    alert("STK prompt resolved. M-Pesa PIN verified. Awaiting Kenya Daraja asynchronous webhook validation...");
    
    try {
      await apiFetch('/api/mpesa/simulate-callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkoutRequestId: mpesaOrder.mpesaCheckoutRequestId || `ws_CO_${Date.now()}_1623`, success: true }),
      });
      fetchOrders();
      setMpesaOrder(null);
    } catch (a) {
      console.error(a);
    }
  };

  // Submit reviews for seller
  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim() || !ratingOrderId) return;

    const order = orders.find(o => o.id === ratingOrderId);
    if (!order) return;

    try {
      const res = await apiFetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: order.sellerId, rating: ratingValue, text: reviewText }),
      });

      if (res.ok) {
        // Mark order completed synchronously
        await apiFetch(`/api/orders/${ratingOrderId}/status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'completed' }),
        });

        alert("Review submitted! Thank you for securing Soko local trades safety.");
        setRatingOrderId(null);
        setReviewText('');
        fetchOrders();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Profile Doc verifying
  const handleDocVerify = async () => {
    if (!currentUser || !verifyingDoc) return;
    try {
      const res = await apiFetch(`/api/users/${currentUser.id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docType: verifyingDoc }),
      });

      if (res.ok) {
        alert("Verification success! You are now a Verified Sokos Soko Trade Vendor.");
        loadAuthAndData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 4. Gemini AI listing inspection
  const analyzeListingWithAI = async () => {
    if (!listingForm.title || !listingForm.description) {
      alert("Please enter a title and description before auditing with Gemini.");
      return;
    }

    setAnalyzingItem(true);
    try {
      const res = await apiFetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: listingForm.title,
          description: listingForm.description,
          price: listingForm.price,
          category: listingForm.category,
        }),
      });

      if (res.ok) {
        setAiAnalysis(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzingItem(false);
    }
  };

  const handleApplyAiOptimizations = () => {
    if (!aiAnalysis) return;
    setListingForm(prev => ({
      ...prev,
      title: aiAnalysis.optimizedTitle || prev.title,
      description: `${prev.description}\n\n#SokoKeywords: ${aiAnalysis.swahiliKeywords?.join(', ')}`
    }));
    setAiAnalysis(null);
  };

  const handleCreateListingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!listingForm.title || !listingForm.description || !listingForm.price || !listingForm.category) {
      alert("All fields are required to list a trade item on Soko.");
      return;
    }

    try {
      const res = await apiFetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: listingForm.title,
          description: listingForm.description,
          price: listingForm.price,
          category: listingForm.category,
          condition: listingForm.condition,
          latitude: currentUser.latitude,
          longitude: currentUser.longitude,
          imageUrl: listingForm.imageUrl,
        }),
      });

      if (res.ok) {
        alert("Listing posted live within 5 km of your neighborhood residence!");
        setListingForm({
          title: '',
          description: '',
          price: '',
          category: 'Electronics',
          condition: 'good',
          imageUrl: '',
        });
        fetchListings();
        setCurrentTab('explore');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Helper getters
  const calculateListingDistance = (l: Listing) => {
    const lat = currentUser ? currentUser.latitude : -1.2833;
    const lon = currentUser ? currentUser.longitude : 36.8219;
    // Calculation
    const R = 6371; // Radius of the earth in km
    const dLat = (l.latitude - lat) * Math.PI / 180;
    const dLon = (l.longitude - lon) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat * Math.PI / 180) * Math.cos(l.latitude * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return parseFloat(d.toFixed(1));
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  if (authPromptActive) {
    return (
      <div className="relative">
        <button
          onClick={() => setAuthPromptActive(false)}
          className="absolute top-5 right-5 bg-zinc-900/95 border border-zinc-850 text-zinc-300 hover:text-white px-4 py-2.5 rounded-2xl text-[10px] font-black font-mono uppercase tracking-widest cursor-pointer z-50 shadow-md backdrop-blur-sm"
        >
          ← Cancel & Browse
        </button>
        <AuthGateway onAuthSuccess={(user) => {
          setCurrentUser(user);
          setAuthPromptActive(false);
          setSessionCount(prev => prev + 1);
        }} />
      </div>
    );
  }

  if (currentUser && currentUser.onboarded === false) {
    return <OnboardingScreen currentUser={currentUser} onOnboardSuccess={(updatedUser) => {
      setCurrentUser(updatedUser);
      setSessionCount(prev => prev + 1);
    }} />;
  }

  const renderGuestGuard = (title: string, desc: string) => {
    return (
      <div className="bg-white rounded-3xl border border-zinc-200/80 p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)] max-w-md mx-auto text-center space-y-6 animate-fade-in my-12 font-sans">
        <div className="w-16 h-16 bg-zinc-950 text-white rounded-2xl flex items-center justify-center mx-auto text-xl shadow-lg border border-zinc-800 font-mono">
          🔒
        </div>
        <div>
          <h3 className="text-lg font-display font-black text-zinc-900 uppercase tracking-tight">{title}</h3>
          <p className="text-zinc-500 text-xs mt-2.5 leading-relaxed font-semibold mb-2">
            {desc}
          </p>
        </div>
        <button
          onClick={() => setAuthPromptActive(true)}
          className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-2xl text-xs uppercase tracking-wider font-mono transition shadow-lg cursor-pointer"
        >
          Sign In / Join Soko Now 🚀
        </button>
      </div>
    );
  };

  return (
    <div id="sokos_root" className="min-h-screen bg-zinc-50 flex flex-col pb-0 select-none">
      {/* Header Bar */}
      <header id="sokos_header" className="sticky top-0 z-40 bg-zinc-950 text-white border-b border-zinc-850 backdrop-blur-md bg-opacity-95">
        <div className="max-w-7xl mx-auto px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-400 text-zinc-950 w-9 h-9 rounded-xl flex items-center justify-center font-black shadow-[0_3px_12px_rgba(52,211,153,0.25)]">
              <span className="font-display tracking-tight text-xl">S</span>
            </div>
            <div>
              <h1 className="font-display font-black tracking-tight text-lg text-white">Sokos</h1>
              <p className="text-[9px] text-zinc-400 font-mono tracking-widest uppercase">sokos.co.ke • Local Trade Radar</p>
            </div>
          </div>

          {/* Real-time Location Residence Quick-Selector */}
          {currentUser && (
            <div className="hidden sm:flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-full px-3.5 py-1.5 text-xs">
              <MapPin className="w-3.5 h-3.5 text-emerald-405" />
              <span className="text-zinc-400 font-semibold uppercase tracking-wider text-[9px] font-mono">My Residence:</span>
              <select
                id="select_residence_neighborhood"
                value={currentUser.locationName}
                onChange={(e) => changeLocationNeighborhood(e.target.value)}
                className="bg-transparent border-none text-white font-extrabold cursor-pointer focus:ring-0 py-0 text-xs"
              >
                {NEIGHBORHOODS.map(n => (
                  <option key={n.name} value={n.name} className="text-zinc-900 font-semibold">{n.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Profile & Notifications and Audit */}
          <div className="flex items-center gap-3.5">
            {/* Notification Center Trigger */}
            {currentUser && (
              <div className="relative">
                <button
                  id="btn_notifications_center"
                  onClick={() => setShowNotificationCenter(!showNotificationCenter)}
                  className="p-2 text-zinc-350 hover:text-white rounded-full bg-zinc-900 border border-zinc-800 cursor-pointer relative transition-all"
                >
                  <Bell className="w-4 h-4" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-emerald-500 text-zinc-950 font-black text-[9px] px-1.5 py-0.2 rounded-full animate-pulse shadow-[0_2px_8px_rgba(52,211,153,0.4)]">
                      {unreadNotificationsCount}
                    </span>
                  )}
                </button>

                {/* Notification Center Dropdown */}
                {showNotificationCenter && (
                  <div id="notification_dropdown" className="absolute right-0 mt-2.5 w-80 bg-white text-zinc-900 border border-zinc-200/80 rounded-2xl shadow-2xl z-50 overflow-hidden">
                    <div className="p-4 bg-zinc-950 text-white font-extrabold text-xs flex justify-between items-center border-b border-zinc-800">
                      <span className="flex items-center gap-1.5 uppercase font-mono tracking-widest text-[10px]">
                        <Bell className="w-3.5 h-3.5 text-emerald-400" />
                        Updates ({unreadNotificationsCount})
                      </span>
                      {unreadNotificationsCount > 0 && (
                        <button
                          onClick={async () => {
                            await apiFetch('/api/notifications/read-all', { method: 'POST' });
                            fetchNotifications();
                          }}
                          className="text-[10px] text-emerald-400 hover:underline font-mono uppercase tracking-wider"
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto divide-y divide-zinc-100 text-xs">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-zinc-400 text-xs font-semibold">No active order updates.</div>
                      ) : (
                        notifications.map(notif => (
                          <div key={notif.id} className={`p-3.5 hover:bg-zinc-50 transition ${!notif.read ? 'bg-emerald-50/20 border-l-3 border-emerald-500' : ''}`}>
                            <div className="font-extrabold flex items-center gap-1.5 text-[11px] text-zinc-800">
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                              {notif.title}
                            </div>
                            <div className="text-zinc-650 font-semibold text-[10px] mt-1 leading-normal">{notif.message}</div>
                            <div className="text-[9px] text-zinc-400 font-mono mt-1.5">
                              {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profile Avatar Quick-Display */}
            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="text-right hidden md:block">
                    <div className="text-xs font-bold text-zinc-200">{currentUser.name}</div>
                    <div className="text-[10px] text-emerald-400 flex items-center gap-1 justify-end font-mono mt-0.5">
                      <VerifiedBadge verified={currentUser.verified} docVerified={currentUser.docVerified} size="sm" />
                    </div>
                  </div>
                  <div className="w-8.5 h-8.5 rounded-full bg-zinc-900 border-2 border-zinc-800 flex items-center justify-center font-extrabold font-mono text-emerald-400 text-xs uppercase shadow-sm">
                    {currentUser.name.charAt(0)}
                  </div>
                </div>
                
                {/* Top Nav Logout button */}
                <button
                  id="btn_top_logout"
                  onClick={handleLogout}
                  className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/35 text-rose-400 font-extrabold hover:text-white border border-rose-500/20 text-[9.5px] font-mono rounded-xl transition duration-150 uppercase tracking-widest cursor-pointer flex items-center gap-1"
                  title="Logout"
                >
                  <LogOut className="w-3 h-3" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <button
                id="btn_header_login"
                onClick={() => setAuthPromptActive(true)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-[10.5px] font-mono rounded-xl transition duration-150 uppercase tracking-wider cursor-pointer shadow-md shadow-emerald-500/10"
              >
                Sign In / Join
              </button>
            )}

            {/* Hamburger Mobile Menu Toggle */}
            <button
              id="mobile_hamburger_toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-zinc-300 hover:text-white rounded-full bg-zinc-900 border border-zinc-800 cursor-pointer md:hidden transition-all focus:outline-none ml-1.5"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4 text-rose-400" /> : <Menu className="w-4 h-4 text-emerald-400" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Hamburger Menu Drawer overlay */}
      {mobileMenuOpen && (
        <div id="mobile_hamburger_drawer" className="md:hidden bg-zinc-950 border-b border-zinc-800 text-white p-5 space-y-4 animate-in fade-in slide-in-from-top duration-200 z-50 sticky top-[68px]">
          {/* Quick location configuration inside responsive drawer */}
          {currentUser && (
            <div className="flex items-center justify-between bg-zinc-900/80 border border-zinc-800/80 rounded-2xl px-4 py-2.5 text-xs w-full">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-zinc-400 font-mono text-[9px] uppercase tracking-wider">Neighborhood:</span>
              </div>
              <select
                id="select_mobile_hamburger_neighborhood"
                value={currentUser.locationName}
                onChange={(e) => {
                  changeLocationNeighborhood(e.target.value);
                  setMobileMenuOpen(false);
                }}
                className="bg-transparent border-none text-white font-black cursor-pointer focus:ring-0 py-0 text-xs text-right pr-2"
              >
                {NEIGHBORHOODS.map(n => (
                  <option key={n.name} value={n.name} className="text-zinc-900 font-semibold">{n.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Navigation links inside mobile hamburger */}
          <div className="grid grid-cols-1 gap-1.5 pt-1">
            <button
              onClick={() => { setCurrentTab('explore'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-extrabold tracking-wide transition-all ${
                currentTab === 'explore' 
                  ? 'bg-zinc-900 text-emerald-400 border border-emerald-500/20' 
                  : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-white'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Explore Soko Soko</span>
            </button>

            {currentUser ? (
              <>
                <button
                  onClick={() => { setCurrentTab('messages'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-extrabold tracking-wide transition-all ${
                    currentTab === 'messages' 
                      ? 'bg-zinc-900 text-emerald-400 border border-emerald-500/20' 
                      : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-white'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Secure Messages</span>
                </button>
                <button
                  onClick={() => { setCurrentTab('post'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-extrabold tracking-wide transition-all ${
                    currentTab === 'post' 
                      ? 'bg-zinc-900 text-emerald-400 border border-emerald-500/20' 
                      : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-white'
                  }`}
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Post Trade Item</span>
                </button>
                <button
                  onClick={() => { setCurrentTab('orders'); fetchOrders(); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-extrabold tracking-wide transition-all ${
                    currentTab === 'orders' 
                      ? 'bg-zinc-900 text-emerald-400 border border-emerald-500/20' 
                      : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-white'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Trades & Orders</span>
                </button>
                <button
                  onClick={() => { setCurrentTab('profile'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-extrabold tracking-wide transition-all ${
                    currentTab === 'profile' 
                      ? 'bg-zinc-900 text-emerald-400 border border-emerald-500/20' 
                      : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-white'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Profile Safety Audit</span>
                </button>
                
                {/* Logout button inside mobile drawer */}
                <button
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-extrabold tracking-wide transition-all text-rose-400 hover:bg-rose-950/20 hover:text-rose-300 border border-transparent hover:border-rose-900/30 font-sans mt-2"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>Logout from Sokos session</span>
                </button>
              </>
            ) : (
              <div className="pt-2">
                <button
                  onClick={() => { setAuthPromptActive(true); setMobileMenuOpen(false); }}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs rounded-xl uppercase font-mono tracking-wider transition-all cursor-pointer shadow-lg shadow-emerald-500/10"
                >
                  Sign In / Join Soko
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Core View Area with Sidebar on Desktop, bottom navigaton on mobile */}
      <div className="max-w-7xl mx-auto px-5 py-6 flex-1 w-full grid grid-cols-1 md:grid-cols-12 gap-5 mb-6">
        
        {/* Deskop Left Sidebar */}
        <aside id="desktop_tabs_sidebar" className="hidden md:flex flex-col gap-4 md:col-span-3">
          <div className="bg-white rounded-3xl border border-zinc-200/80 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-all duration-300">
            <h3 className="font-mono text-zinc-400 text-[10px] tracking-widest uppercase mb-4 px-2 font-black">Menu Navigation</h3>
            <div className="space-y-1.5 font-sans">
              <button
                id="tab_opt_explore"
                onClick={() => setCurrentTab('explore')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold tracking-wide transition-all duration-200 cursor-pointer ${
                  currentTab === 'explore' 
                    ? 'bg-zinc-950 text-white shadow-md shadow-zinc-950/10' 
                    : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 border border-transparent hover:border-zinc-100'
                }`}
              >
                <Search className={`w-4 h-4 ${currentTab === 'explore' ? 'text-emerald-400' : 'text-zinc-400'}`} />
                <span>Explore Soko Soko</span>
              </button>
              {currentUser && (
                <>
                  <button
                    id="tab_opt_messages"
                    onClick={() => setCurrentTab('messages')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold tracking-wide transition-all duration-200 cursor-pointer ${
                      currentTab === 'messages' 
                        ? 'bg-zinc-950 text-white shadow-md shadow-zinc-950/10' 
                        : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 border border-transparent hover:border-zinc-100'
                    }`}
                  >
                    <MessageSquare className={`w-4 h-4 ${currentTab === 'messages' ? 'text-emerald-400' : 'text-zinc-400'}`} />
                    <span>Secure Messages</span>
                  </button>
                  <button
                    id="tab_opt_post"
                    onClick={() => setCurrentTab('post')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold tracking-wide transition-all duration-200 cursor-pointer ${
                      currentTab === 'post' 
                        ? 'bg-zinc-950 text-white shadow-md shadow-zinc-950/10' 
                        : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 border border-transparent hover:border-zinc-100'
                    }`}
                  >
                    <PlusCircle className={`w-4 h-4 ${currentTab === 'post' ? 'text-emerald-400' : 'text-zinc-400'}`} />
                    <span>Post Trade Item</span>
                  </button>
                  <button
                    id="tab_opt_orders"
                    onClick={() => { setCurrentTab('orders'); fetchOrders(); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold tracking-wide transition-all duration-200 cursor-pointer ${
                      currentTab === 'orders' 
                        ? 'bg-zinc-950 text-white shadow-md shadow-zinc-950/10' 
                        : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 border border-transparent hover:border-zinc-100'
                    }`}
                  >
                    <ShoppingBag className={`w-4 h-4 ${currentTab === 'orders' ? 'text-emerald-400' : 'text-zinc-400'}`} />
                    <span>Trades & Orders</span>
                  </button>
                  <button
                    id="tab_opt_profile"
                    onClick={() => setCurrentTab('profile')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold tracking-wide transition-all duration-200 cursor-pointer ${
                      currentTab === 'profile' 
                        ? 'bg-zinc-950 text-white shadow-md shadow-zinc-950/10' 
                        : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 border border-transparent hover:border-zinc-100'
                    }`}
                  >
                    <UserCheck className={`w-4 h-4 ${currentTab === 'profile' ? 'text-emerald-400' : 'text-zinc-400'}`} />
                    <span>Profile Safety Audit</span>
                  </button>
                </>
              )}
            </div>
          </div>
                  {/* Mini location card info */}
          {currentUser ? (
            <div className="bg-zinc-900 text-white rounded-3xl p-5 border border-zinc-855 shadow-[0_10px_20px_rgba(0,0,0,0.04)] relative overflow-hidden group">
              <div className="absolute -top-12 -right-12 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all duration-300"></div>
              <div className="flex items-center gap-2 mb-2.5 text-emerald-445 font-mono font-black text-[10px] tracking-widest uppercase">
                <Navigation className="w-3.5 h-3.5 text-emerald-400 animate-pulse animate-duration-1000" />
                <span>Radius Radar Active</span>
              </div>
              <p className="text-[11px] text-zinc-300 leading-relaxed mb-4 font-sans font-semibold">
                Sokos displays and prioritizes willing vendors within <b className="text-white font-mono text-xs">5.0 km</b> of your residence: <span className="text-emerald-400 font-bold">{currentUser.locationName}</span>.
              </p>
              <div className="pt-3 border-t border-zinc-800/80 flex justify-between items-center text-[9px] font-mono text-zinc-500 font-bold">
                <span>LAT: {currentUser.latitude.toFixed(4)}</span>
                <span>LON: {currentUser.longitude.toFixed(4)}</span>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-900 text-white rounded-3xl p-5 border border-zinc-855 shadow-[0_10px_20px_rgba(0,0,0,0.04)] relative overflow-hidden group">
              <div className="absolute -top-12 -right-12 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all duration-300"></div>
              <div className="flex items-center gap-2 mb-2.5 text-emerald-445 font-mono font-black text-[10px] tracking-widest uppercase">
                <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                <span>Guest Mode Active</span>
              </div>
              <p className="text-[11px] text-zinc-300 leading-relaxed mb-4 font-sans font-semibold">
                You are currently browsing listings within <b className="text-white font-mono text-xs">5.0 km</b> of <strong className="text-white">Nairobi CBD</strong>. Join Sokos to configure your neighborhood residence circle!
              </p>
              <button
                id="btn_sidebar_join"
                onClick={() => setAuthPromptActive(true)}
                className="w-full py-2.5 px-3 bg-emerald-500 hover:bg-emerald-400 active:scale-99 text-zinc-950 font-black text-[11px] rounded-xl transition duration-150 uppercase tracking-wider font-mono cursor-pointer shadow-lg shadow-emerald-500/15"
              >
                Sign In / Join
              </button>
            </div>
          )}
        </aside>

        {/* Dynamic Content Columns */}
        <main className="md:col-span-9 min-h-[70vh]">

          {/* 1. EXPLORE TAB */}
          {currentTab === 'explore' && (
            <div className="space-y-4">
              {/* Neighborhood locator for mobile */}
              {currentUser ? (
                <div className="sm:hidden bg-zinc-950 text-white p-4 rounded-2xl flex items-center justify-between text-xs border border-zinc-850 shadow-md">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-zinc-105">Location: <span className="text-emerald-400">{currentUser.locationName}</span></span>
                  </div>
                  <select
                    value={currentUser.locationName}
                    onChange={(e) => changeLocationNeighborhood(e.target.value)}
                    className="bg-zinc-900 border-none text-white text-[10px] font-black py-1.5 px-3 rounded-xl cursor-pointer"
                  >
                    {NEIGHBORHOODS.map(n => (
                      <option key={n.name} value={n.name} className="text-zinc-900">{n.name.split(',')[0]}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="sm:hidden bg-zinc-950 text-white p-4 rounded-2xl flex items-center justify-between text-xs border border-zinc-850 shadow-md">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-zinc-105">Location: <span className="text-emerald-400">Nairobi CBD (Guest)</span></span>
                  </div>
                  <button
                    onClick={() => setAuthPromptActive(true)}
                    className="px-2.5 py-1.5 bg-emerald-405 text-zinc-950 text-[10px] font-black rounded-xl transition duration-150 uppercase"
                  >
                    Set
                  </button>
                </div>
              )}

              {!currentUser && (
                <div id="guest_welcome_banner" className="bg-zinc-950 text-white rounded-3xl p-6 md:p-8 border border-zinc-850 shadow-[0_12px_24px_rgba(0,0,0,0.15)] relative overflow-hidden group">
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/15 transition-all duration-500"></div>
                  <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-3 max-w-xl">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-[9px] font-black uppercase font-mono tracking-wider">
                        <Shield className="w-3.5 h-3.5 animate-pulse" />
                        <span>🔒 Secured Local Marketplace</span>
                      </div>
                      <h2 className="text-xl md:text-2xl font-display font-black tracking-tight text-white uppercase">
                        Nairobi Peer-to-Peer Coordinate Exchange
                      </h2>
                      <p className="text-zinc-400 text-xs font-medium leading-relaxed">
                        You are browsing in guest mode. To post items, chat securely with verified local merchants, trigger Lipa Na M-Pesa escrow transfers, or verify your identity, authenticate now.
                      </p>
                      <div className="flex flex-wrap gap-3 pt-1">
                        <div className="flex items-center gap-1.5 text-zinc-350 font-mono text-[9px] uppercase tracking-wider font-extrabold bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          5 KM Coordinate Radar
                        </div>
                        <div className="flex items-center gap-1.5 text-zinc-350 font-mono text-[9px] uppercase tracking-wider font-extrabold bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          ID Verifications
                        </div>
                        <div className="flex items-center gap-1.5 text-zinc-350 font-mono text-[9px] uppercase tracking-wider font-extrabold bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          Safaricom M-Pesa Escrows
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setAuthPromptActive(true)}
                      className="w-full md:w-auto px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-2xl text-xs uppercase tracking-wider font-mono transition-all duration-200 cursor-pointer shadow-lg shadow-emerald-500/20 whitespace-nowrap self-stretch md:self-auto flex items-center justify-center gap-1.5"
                    >
                      Authenticate Now <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Filtering Controls */}
              <div className="bg-white rounded-3xl border border-zinc-200/80 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Search query */}
                  <div className="relative">
                    <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-400" />
                    <input
                      id="search_query"
                      type="text"
                      placeholder="Search active local trade offers..."
                      value={filters.query}
                      onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs font-semibold text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 transition-all font-sans"
                    />
                  </div>

                  {/* Radius Slider (5km target) */}
                  <div className="flex flex-col justify-center bg-zinc-50/50 border border-zinc-100 px-4 py-2 rounded-2xl">
                    <div className="flex justify-between items-center text-[10px] mb-1">
                      <span className="text-zinc-500 font-extrabold flex items-center gap-1 font-mono uppercase tracking-wider text-[8px]">
                        <MapPin className="w-3.5 h-3.5 text-emerald-505" />
                        Trade Radar Radius
                      </span>
                      <span className="font-mono text-zinc-900 font-extrabold text-xs">{filters.maxDistance} km</span>
                    </div>
                    <input
                      id="slider_distance_radius"
                      type="range"
                      min="1"
                      max="30"
                      step="1"
                      value={filters.maxDistance}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxDistance: parseFloat(e.target.value) }))}
                      className="w-full accent-zinc-950 cursor-pointer h-1.5 bg-zinc-200 rounded-lg"
                    />
                  </div>

                  {/* Sort by */}
                  <div className="flex">
                    <select
                      id="select_sort_by"
                      value={filters.sortBy}
                      onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl text-xs font-bold text-zinc-800 px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-zinc-950 font-sans cursor-pointer"
                    >
                      <option value="distance">🛡️ Sort by: Nearest Distance</option>
                      <option value="price_asc">💰 Price: Low to High</option>
                      <option value="price_desc">📈 Price: High to Low</option>
                      <option value="date">⚡ Date: Newly Listed</option>
                    </select>
                  </div>
                </div>

                {/* Categories badges selection */}
                <div className="flex gap-2 overflow-x-auto pb-1 select-none scrollbar-none">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setFilters(prev => ({ ...prev, category: cat }))}
                      className={`whitespace-nowrap px-4 py-1.8 rounded-full text-[11px] font-bold tracking-wide transition-all duration-200 cursor-pointer ${
                        filters.category === cat 
                          ? 'bg-zinc-950 text-white shadow-sm font-extrabold' 
                          : 'bg-zinc-55 text-zinc-550 hover:bg-zinc-100 hover:text-zinc-900 border border-zinc-200/40'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Interactive Neighborhood OpenStreetMap */}
              <MarketMap 
                listings={listings}
                currentUser={currentUser}
                maxDistance={filters.maxDistance}
                onSelectListing={(l) => setSelectedListing(l)}
              />

              {/* Trade Grid Listings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-[10px] font-black text-zinc-400 font-mono tracking-widest uppercase mt-2">
                    Willing Local Listings ({listings.length})
                  </h2>
                </div>

                {listings.length === 0 ? (
                  <div className="p-16 text-center bg-white rounded-3xl border border-zinc-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.01)] w-full">
                    <Inbox className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                    <h3 className="font-display font-black text-zinc-800 text-sm">No marketplace listings found</h3>
                    <p className="text-xs text-zinc-550 mt-2 max-w-sm mx-auto leading-relaxed font-sans">
                      There are no active vendors within <span className="font-mono font-extrabold text-zinc-800">{filters.maxDistance} km</span> of your location with these filters. Try increasing your distance radius.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {listings.map(l => {
                      const dist = calculateListingDistance(l);
                      return (
                        <div
                          key={l.id}
                          id={`listing_card_${l.id}`}
                          onClick={() => setSelectedListing(l)}
                          className="bg-white rounded-3xl border border-zinc-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-zinc-350 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col group relative"
                        >
                          {/* Main Image */}
                          <div className="h-44 bg-zinc-100 relative overflow-hidden">
                            <img
                              src={l.images[0]}
                              alt={l.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-105 transition-all duration-550"
                            />
                            {/* Proximity Pill badge */}
                            <span className="absolute top-3 left-3 bg-zinc-950/85 text-emerald-450 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-450/20 font-mono shadow-lg backdrop-blur-md flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-emerald-400" /> {dist} km away
                            </span>
                            {/* Standard Swahili Condition */}
                            <span className="absolute top-3 right-3 bg-zinc-950/65 text-zinc-100 text-[8px] tracking-wider font-mono font-black px-2 py-1 rounded-full uppercase border border-zinc-800/40 backdrop-blur-sm">
                              {l.condition.replace('_', ' ')}
                            </span>
                          </div>

                          {/* Details */}
                          <div className="p-5 flex-1 flex flex-col justify-between font-sans">
                            <div>
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="font-display font-extrabold text-xs text-zinc-900 line-clamp-1 flex-1 pr-2 tracking-tight">
                                  {l.title}
                                </h3>
                                <div className="text-xs font-black text-zinc-950 font-mono whitespace-nowrap">
                                  {l.price.toLocaleString()} <span className="text-[9px] text-emerald-500 font-extrabold">KES</span>
                                </div>
                              </div>

                              <p className="text-[11px] text-zinc-550 line-clamp-2 leading-relaxed mb-4">
                                {l.description}
                              </p>
                            </div>

                            {/* Vendor Foot */}
                            <div className="pt-3.5 border-t border-zinc-100/80 flex items-center justify-between">
                              <div className="flex items-center gap-2 overflow-hidden">
                                <div className="w-5.5 h-5.5 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center font-bold text-[10px] text-emerald-700 font-mono">
                                  {l.vendorName.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-[11px] font-semibold text-zinc-700 truncate">{l.vendorName}</span>
                              </div>
                              <VerifiedBadge verified={l.vendorVerified} size="sm" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. POST TOPIC TAB */}
          {currentTab === 'post' && (
            !currentUser ? (
              renderGuestGuard("Login to Post", "Post any household, electronic, or transport listings securely on Soko and matches closest local neighborhoods in Nairobi.")
            ) : (
              <div className="bg-white rounded-3xl border border-zinc-200/80 p-6 md:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)] max-w-xl mx-auto">
              <h2 className="text-base font-display font-black text-zinc-900 flex items-center gap-2">
                <PlusCircle className="text-zinc-950 w-5 h-5" />
                List Your Trade Item
              </h2>
              <p className="text-zinc-500 text-[11px] mt-1.5 mb-6 leading-relaxed font-sans">
                Post your item. Soko instantly georeferences this listing using your active residence neighborhood, 
                willingly connecting you to nearby buyers with no middleman.
              </p>

              <form onSubmit={handleCreateListingSubmit} className="space-y-4 font-sans">
                {/* Image Simulated Link */}
                <div>
                  <label className="block text-[11px] font-extrabold text-zinc-650 tracking-wide uppercase mb-1">Image Presentation Link (Unsplash URL)</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={listingForm.imageUrl}
                    onChange={(e) => setListingForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 transition-all font-sans"
                  />
                  <div className="flex gap-2 mt-2 overflow-x-auto select-none pb-1 scrollbar-none">
                    {[
                      { name: 'Electronics', url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=300&q=80' },
                      { name: 'Furniture', url: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=300&q=80' },
                      { name: 'Groceries', url: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=300&q=80' },
                      { name: 'Fashion', url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=300&q=80' }
                    ].map(demo => (
                      <button
                        key={demo.name}
                        type="button"
                        onClick={() => setListingForm(prev => ({ ...prev, imageUrl: demo.url }))}
                        className="text-[10px] bg-zinc-100 hover:bg-zinc-200 border border-zinc-205 py-1 px-2.5 rounded-full font-mono font-semibold transition text-zinc-650 select-none whitespace-nowrap cursor-pointer"
                      >
                        Use Demo {demo.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Category */}
                  <div>
                    <label className="block text-[11px] font-extrabold text-zinc-650 tracking-wide uppercase mb-1">Listing Category</label>
                    <select
                      value={listingForm.category}
                      onChange={(e) => setListingForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold cursor-pointer focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 transition-all font-sans"
                    >
                      {CATEGORIES.filter(c => c !== 'All').map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Condition */}
                  <div>
                    <label className="block text-[11px] font-extrabold text-zinc-650 tracking-wide uppercase mb-1">Product Condition</label>
                    <select
                      value={listingForm.condition}
                      onChange={(e) => setListingForm(prev => ({ ...prev, condition: e.target.value as any }))}
                      className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold cursor-pointer focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 transition-all font-sans"
                    >
                      <option value="new">Brand New</option>
                      <option value="like_new">Like New</option>
                      <option value="good">Good (Normal Wear)</option>
                      <option value="fair">Fair (Decent)</option>
                    </select>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-[11px] font-extrabold text-zinc-650 tracking-wide uppercase mb-1">Title / Product Name</label>
                  <input
                    type="text"
                    placeholder="e.g. iPhone 13 Pro Max 128GB"
                    value={listingForm.title}
                    onChange={(e) => setListingForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 transition-all font-sans"
                    required
                  />
                </div>

                {/* Price (KES) */}
                <div>
                  <label className="block text-[11px] font-extrabold text-zinc-650 tracking-wide uppercase mb-1">Pricing (Kenyan Shillings - KES)</label>
                  <input
                    type="number"
                    placeholder="e.g. 75000"
                    value={listingForm.price}
                    onChange={(e) => setListingForm(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 transition-all font-mono text-zinc-900"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[11px] font-extrabold text-zinc-650 tracking-wide uppercase mb-1">Description / Negotiability</label>
                  <textarea
                    rows={4}
                    placeholder="Mention battery health, age, coordinate pickup preferences, negotiability..."
                    value={listingForm.description}
                    onChange={(e) => setListingForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 transition-all leading-relaxed font-sans"
                    required
                  />
                </div>

                {/* Gemini AI Listing Audit / Suggestions Trigger */}
                <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-4.5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-black text-zinc-900 font-mono uppercase tracking-wider text-[11px]">
                      <Sparkles className="w-4 h-4 text-emerald-500 fill-emerald-100" />
                      Gemini Soko Advisor Checks
                    </div>
                    <button
                      type="button"
                      onClick={analyzeListingWithAI}
                      disabled={analyzingItem}
                      className="bg-zinc-950 hover:bg-zinc-800 text-white text-[10px] font-extrabold px-3.5 py-1.8 rounded-full transition-all select-none flex items-center gap-1 disabled:opacity-50 cursor-pointer self-start"
                    >
                      {analyzingItem ? 'Auditing description...' : 'Audit Description with AI'}
                    </button>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-normal font-sans">
                    Let Gemini read your title & pricing. It'll optimize for Swahili search traffic, validates Kenya pricing, and suggests localized safety meetup notes!
                  </p>

                  {/* Display AI Results */}
                  {aiAnalysis && (
                    <div className="mt-3 p-4 bg-white border border-zinc-200/80 rounded-2xl text-[11px] text-zinc-700 space-y-3 leading-relaxed shadow-sm">
                      <div className="font-bold text-zinc-900 font-mono uppercase tracking-widest text-[9px] border-b border-zinc-100 pb-1.5">
                        AI Recommended Optimizations
                      </div>
                      <div>
                        <b className="text-[10px] uppercase font-bold text-zinc-500 font-mono">Swahili Traffic Title:</b>
                        <p className="text-zinc-850 bg-zinc-50/70 p-2.5 rounded-xl text-[11px] border border-zinc-100 mt-1 font-semibold">{aiAnalysis.optimizedTitle}</p>
                      </div>
                      <div>
                        <b className="text-[10px] uppercase font-bold text-zinc-500 font-mono">Swahili Keywords:</b>
                        <div className="flex flex-wrap gap-1 mt-1 font-sans">
                          {aiAnalysis.swahiliKeywords?.map((kw: string) => (
                            <span key={kw} className="bg-zinc-100/80 text-zinc-855 px-2.5 py-0.8 rounded-full text-[9px] font-mono font-bold">#{kw}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <b className="text-[10px] uppercase font-bold text-zinc-500 font-mono">Market Price Validation:</b>
                        <p className="text-zinc-600 mt-1 leading-normal italic text-[11px] font-sans">{aiAnalysis.marketPriceValidation}</p>
                      </div>
                      <div>
                        <b className="text-[10px] uppercase font-bold text-zinc-500 font-mono">Buyer Meetup Safety advice:</b>
                        <ul className="list-disc pl-4 space-y-1 text-zinc-650 mt-1 leading-normal text-[11px] font-sans">
                          {aiAnalysis.buyerSafetyTips?.map((tip: string) => (
                            <li key={tip}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex justify-end gap-2 pt-2.5 border-t border-zinc-100 mt-3">
                        <button
                          type="button"
                          onClick={() => setAiAnalysis(null)}
                          className="text-[10px] font-bold text-zinc-500 px-2 py-1 cursor-pointer"
                        >
                          Discard
                        </button>
                        <button
                          type="button"
                          onClick={handleApplyAiOptimizations}
                          className="bg-zinc-950 text-white font-extrabold text-[10px] tracking-wide px-3 py-1.5 rounded-full hover:bg-zinc-850 transition cursor-pointer"
                        >
                          Apply AI suggestions
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-zinc-950 hover:bg-zinc-850 text-white font-extrabold tracking-wide py-3 rounded-2xl text-[11px] active:scale-99 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  Post Soko Listing
                </button>
              </form>
            </div>
          ))}

          {/* 3. MESSAGES TAB */}
          {currentTab === 'messages' && (
            !currentUser ? (
              renderGuestGuard("Login for Message Inbox", "Talk securely to nearby local sellers and coordinate high-contrast physical meetups instantly inside the app.")
            ) : (
              <div className="bg-white rounded-3xl border border-zinc-200/80 overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.01)] grid grid-cols-1 md:grid-cols-3 h-[70vh]">
              {/* Chat Sidebar Conversations */}
              <div className="border-r border-zinc-200 flex flex-col h-full bg-zinc-50/20">
                <div className="p-4 border-b border-zinc-200 bg-white">
                  <h3 className="font-mono font-black text-zinc-800 text-[10px] flex items-center gap-1.5 uppercase tracking-widest">
                    <MessageSquare className="w-3.5 h-3.5 text-zinc-500" />
                    Soko Conversations
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 scrollbar-none">
                  {conversations.length === 0 ? (
                    <div className="p-8 text-center text-zinc-400 text-xs font-sans">No active chats. Start chat on standard product cards.</div>
                  ) : (
                    conversations.map(conv => {
                      const isActive = conv.id === activeConvId;
                      return (
                        <div
                          key={conv.id}
                          onClick={() => handleSelectConversation(conv.id)}
                          className={`p-4 cursor-pointer transition flex items-start gap-3 select-none ${
                            isActive ? 'bg-zinc-100/75 border-l-2 border-zinc-900' : 'hover:bg-zinc-50 bg-white'
                          }`}
                        >
                          <div className="w-9 h-9 rounded-full bg-zinc-150 flex items-center justify-center font-bold font-mono text-zinc-800 text-xs">
                            {conv.otherUser.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 overflow-hidden font-sans">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-zinc-900 text-xs truncate flex items-center gap-1 max-w-[70%]">
                                {conv.otherUser.name}
                                {conv.otherUser.verified && <span className="text-emerald-500 text-[10px]">✔</span>}
                              </span>
                              <span className="text-[9px] text-zinc-400 font-mono font-bold">
                                {conv.lastMessage ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                              </span>
                            </div>
                            <div className="text-[10px] text-zinc-900 font-bold truncate mt-0.5">
                              💬 {conv.listingTitle} ({conv.listingPrice.toLocaleString()} KES)
                            </div>
                            <p className="text-[10px] text-zinc-500 truncate mt-0.5">
                              {conv.lastMessage?.text || 'No messages yet.'}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Chat Message Window */}
              <div className="md:col-span-2 flex flex-col h-full bg-white relative">
                {activeConvId ? (
                  <>
                    {/* Active Convo Header */}
                    {(() => {
                      const activeConvObj = conversations.find(c => c.id === activeConvId);
                      if (!activeConvObj) return null;
                      return (
                        <div className="p-4 border-b border-zinc-200 bg-zinc-50/50 flex items-center justify-between font-sans">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8.5 h-8.5 rounded-lg bg-zinc-200/60 overflow-hidden border border-zinc-200">
                              <img src={activeConvObj.listingImage} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <div className="font-extrabold text-xs text-zinc-900 line-clamp-1">{activeConvObj.listingTitle}</div>
                              <div className="text-[10px] text-zinc-500 font-mono flex items-center gap-1.5 mt-0.5">
                                <span className="font-black text-zinc-900">{activeConvObj.listingPrice.toLocaleString()} KES</span>
                                <span>• Seller: {activeConvObj.otherUser.name}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            {/* Actions buy on listing */}
                            <button
                              onClick={() => {
                                const dummyListing: Listing = {
                                  id: activeConvObj.listingId,
                                  title: activeConvObj.listingTitle,
                                  description: 'Listing details matching active message conversation context.',
                                  price: activeConvObj.listingPrice,
                                  images: [activeConvObj.listingImage],
                                  vendorId: activeConvObj.sellerId,
                                  vendorName: activeConvObj.otherUser.name,
                                  vendorVerified: activeConvObj.otherUser.verified,
                                  latitude: 0, longitude: 0, createdAt: '', status: 'active', category: '', condition: 'good'
                                };
                                setSelectedListing(dummyListing);
                              }}
                              className="bg-zinc-950 hover:bg-zinc-850 text-white font-extrabold text-[10px] tracking-wide px-3.5 py-1.8 rounded-full cursor-pointer shadow-sm"
                            >
                              Safely Trade / Buy
                            </button>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Chat Bubble Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-zinc-50/15 scrollbar-none">
                      {activeMessages.map(msg => {
                        const isMe = msg.senderId === currentUser?.id;
                        return (
                          <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`p-3.5 rounded-2xl max-w-sm text-xs leading-relaxed font-sans shadow-[0_1px_4px_rgba(0,0,0,0.03)] ${
                              isMe ? 'bg-zinc-950 text-white rounded-tr-none' : 'bg-white border border-zinc-200/80 text-zinc-850 rounded-tl-none'
                            }`}>
                              <p className="font-medium text-xs">{msg.text}</p>
                              <div className={`text-[9px] mt-1.5 font-mono text-right ${isMe ? 'text-zinc-300 font-bold' : 'text-zinc-400'}`}>
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={chatBottomRef}></div>
                    </div>

                    {/* Chat Input form */}
                    <form onSubmit={handleSendMessage} className="p-3 border-t border-zinc-200 flex gap-2">
                      <input
                        type="text"
                        placeholder="Type standard trade directions, offers, coordinates..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        className="flex-1 px-4 py-3 bg-zinc-150/50 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-850 focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:bg-white transition-all font-sans"
                      />
                      <button
                        type="submit"
                        className="bg-zinc-950 border border-zinc-805 text-white px-5 py-2 hover:bg-zinc-850 text-[10px] tracking-wide rounded-xl font-extrabold cursor-pointer"
                      >
                        Send Direct
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col justify-center items-center text-center p-6 text-zinc-400 font-sans">
                    <MessageSquare className="w-12 h-12 text-zinc-200 mb-3" />
                    <h3 className="font-black text-zinc-800 text-xs uppercase tracking-wider font-mono">No conversation thread selected</h3>
                    <p className="text-[11px] text-zinc-500 max-w-sm mx-auto mt-2 leading-relaxed">
                      Select a conversation thread on the left pane, or visit any listing and click "Chat with Vendor" to discuss coordinates!
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* 4. ORDERS & TRADES TAB */}
          {currentTab === 'orders' && (
            !currentUser ? (
              renderGuestGuard("Login for Orders", "Keep track of your active cash trades, simulated escrow transactions, and M-Pesa STK push receipts.")
            ) : (
              <div className="space-y-4 font-sans">
              <div className="flex items-center justify-between">
                <h2 className="text-[10px] font-black text-zinc-400 font-mono tracking-widest uppercase mt-2">Active Trades History</h2>
              </div>

              {orders.length === 0 ? (
                <div className="p-16 text-center bg-white rounded-3xl border border-zinc-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.01)]">
                  <ShoppingBag className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
                  <h3 className="font-display font-black text-zinc-805 text-sm">No ongoing trades or purchase offers</h3>
                  <p className="text-xs text-zinc-450 max-w-sm mx-auto mt-2 leading-relaxed">
                    Browse the Soko explore tab and request to buy objects via cash or simulated M-Pesa.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => {
                    const isBuyer = order.buyerId === currentUser?.id;
                    return (
                      <div key={order.id} className="bg-white rounded-3xl border border-zinc-200/80 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col md:flex-row justify-between items-start md:items-center gap-5 transition-all duration-300 hover:border-zinc-350">
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-zinc-100 overflow-hidden border border-zinc-200/50 flex-shrink-0">
                            <img src={order.listingImage} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <span className={`text-[9px] font-extrabold px-2.5 py-0.8 rounded-full uppercase font-mono tracking-wide ${
                              isBuyer ? 'bg-zinc-100 text-zinc-900 border border-zinc-200' : 'bg-emerald-50 text-emerald-805 border border-emerald-200/50'
                            }`}>
                              {isBuyer ? '🛡️ My Purchase' : '💼 My Sale (Vendor)'}
                            </span>
                            <h3 className="font-display font-black text-xs text-zinc-900 mt-2 tracking-tight">{order.listingTitle}</h3>
                            <div className="text-[10px] text-zinc-500 font-mono mt-1 font-bold">
                              TRADE ID: <span className="text-zinc-700">{order.id}</span> • PRICE: <b className="text-zinc-900">{order.price.toLocaleString()} KES</b>
                            </div>
                            <div className="text-[11px] text-zinc-600 font-semibold mt-1">
                              {isBuyer ? `Vendor: ${order.sellerName}` : `Buyer: ${order.buyerName}`}
                            </div>
                          </div>
                        </div>

                        {/* Status bar & operations */}
                        <div className="flex flex-col items-end gap-2.5 w-full md:w-auto">
                          {/* Payment status badge */}
                          <div className="flex items-center gap-1.5 font-sans">
                            <span className="text-[10px] text-zinc-400 font-mono font-bold uppercase tracking-wider">Status:</span>
                            <span className={`text-[10px] font-mono font-black px-2.5 py-1 rounded-full uppercase tracking-wide border ${
                              order.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              order.status === 'paid' ? 'bg-zinc-100 text-zinc-900 border-zinc-300' :
                              order.status === 'mpesa_pending' ? 'bg-amber-50 text-amber-600 border-amber-200 animate-pulse' :
                              'bg-zinc-50 text-zinc-500 border-zinc-200'
                            }`}>
                              {order.status.replace('_', ' ')}
                            </span>
                          </div>

                          <div className="flex gap-2 w-full md:w-auto mt-1">
                            {/* Buyer payment action */}
                            {isBuyer && order.status === 'mpesa_pending' && (
                              <button
                                onClick={() => initiateMpesaStk(order)}
                                className="w-full md:w-auto bg-zinc-950 text-white font-extrabold tracking-wide text-[10px] px-4 py-2 rounded-full flex items-center justify-center gap-1 hover:bg-zinc-850 cursor-pointer shadow-sm"
                              >
                                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                                Trigger M-Pesa Code Prompt
                              </button>
                            )}

                            {/* Seller delivery validation action */}
                            {!isBuyer && order.status === 'paid' && (
                              <button
                                onClick={async () => {
                                  // Ask vendor to complete order
                                  const res = await apiFetch(`/api/orders/${order.id}/status`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ status: 'completed' }),
                                  });
                                  if (res.ok) {
                                    fetchOrders();
                                    alert("Trade status updated as completely delivered.");
                                  }
                                }}
                                className="w-full md:w-auto bg-zinc-950 hover:bg-zinc-850 text-white font-extrabold text-[10px] tracking-wide px-4 py-2 rounded-full cursor-pointer"
                              >
                                Complete Delivery & Handover
                              </button>
                            )}

                            {/* Rating and review section trigger */}
                            {isBuyer && order.status === 'completed' && (
                              <button
                                disabled
                                className="w-full md:w-auto bg-zinc-50 text-zinc-400 cursor-not-allowed font-extrabold text-[10px] tracking-wide px-4 py-2 rounded-full flex items-center justify-center gap-1 border border-zinc-250"
                              >
                                <ThumbsUp className="w-3.5 h-3.5 text-zinc-400" />
                                Trade Finished & Rated
                              </button>
                            )}

                            {isBuyer && order.status === 'paid' && (
                              <button
                                onClick={() => setRatingOrderId(order.id)}
                                className="w-full md:w-auto bg-zinc-900 hover:bg-zinc-800 text-white font-extrabold text-[10px] tracking-wide px-4 py-2 rounded-full flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                Rate & Review Seller
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          {/* 5. USER PROFILE & IDENTITY VERIFICATION SAFETY TAB */}
          {currentTab === 'profile' && (
            !currentUser ? (
              renderGuestGuard("Login for Safety Audit", "Initiate passport, business license, and national ID photo check verifications to receive verified badges.")
            ) : (
              <div className="max-w-xl mx-auto bg-white rounded-3xl border border-zinc-200/80 p-6 md:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-6 font-sans">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-base font-display font-black text-zinc-900 tracking-tight">Safety & Profile Audits</h2>
                  <p className="text-zinc-500 text-[11px] mt-1.5 leading-relaxed font-sans">Manage your localization parameters and complete identity verification audits.</p>
                </div>
                <VerifiedBadge verified={currentUser.verified} docVerified={currentUser.docVerified} size="lg" />
              </div>

              {/* Verified Shield Box */}
              {!currentUser.docVerified ? (
                <div className="bg-zinc-50 border border-zinc-200/60 rounded-3xl p-5 space-y-4">
                  <div className="flex items-center gap-1.5 text-xs font-black text-zinc-900 font-mono uppercase tracking-wider text-[10px]">
                    <Shield className="w-4 h-4 text-emerald-500" />
                    Verified Vendor Verification Audit
                  </div>
                  <p className="text-[11px] text-zinc-550 leading-relaxed font-medium">
                    Sokos is designed to connect secure, trusted locals within 5 km. Complete a simple simulated audit 
                    by selecting an identity document. Once reviewed, you'll earn the highly valued green and blue ID 
                    Checked badges which will display across all your willingness-to-trade product cards!
                  </p>

                  <div className="space-y-4 pt-2">
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-zinc-400 font-mono tracking-wider mb-2">Verify Using</label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        {[
                          { id: 'national_id', name: 'National ID card' },
                          { id: 'passport', name: 'Official Passport' },
                          { id: 'business_permit', name: 'County Business Permit' }
                        ].map(doc => (
                          <button
                            key={doc.id}
                            type="button"
                            onClick={() => setVerifyingDoc(doc.id as any)}
                            className={`flex-1 py-2.5 px-3 border rounded-xl font-bold text-xs transition-all cursor-pointer ${
                              verifyingDoc === doc.id 
                                ? 'border-zinc-900 bg-zinc-950 text-white shadow-sm font-extrabold' 
                                : 'border-zinc-200 bg-white text-zinc-650 hover:bg-zinc-50'
                            }`}
                          >
                            {doc.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-zinc-400 font-mono tracking-wider mb-2">Upload Document Image (Mock File selection)</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setDocFileSim(e.target.value)}
                        className="w-full text-xs border border-dashed border-zinc-200 rounded-2xl p-5 text-center cursor-pointer hover:bg-zinc-100/50 text-zinc-400 font-medium transition-all"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleDocVerify}
                      className="w-full bg-zinc-950 hover:bg-zinc-850 text-white font-extrabold tracking-wide py-3 rounded-2xl text-xs transition-all flex items-center justify-center gap-1 cursor-pointer shadow-md"
                    >
                      Verify Account Instantly ✔️
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-50/50 border border-emerald-150 rounded-3xl p-5 flex gap-4 items-center">
                  <CheckCircle className="w-10 h-10 text-emerald-500 fill-emerald-50 flex-shrink-0" />
                  <div>
                    <h3 className="font-extrabold text-xs text-emerald-900 uppercase font-mono tracking-wide text-[11px]">Your Identity verification has Cleared!</h3>
                    <p className="text-[11px] text-emerald-700 mt-1 leading-relaxed font-medium">
                      Your identity was verified with your legal {currentUser.verificationDocType?.replace('_', ' ').toUpperCase()}. 
                      Willing buyers within 5 km of Westlands/Kilimani can trade with absolute peace of mind.
                    </p>
                  </div>
                </div>
              )}

              {/* Profile Details List */}
              <div className="space-y-4 pt-4 border-t border-zinc-105">
                <h3 className="text-zinc-400 text-[10px] font-black tracking-widest uppercase font-mono">Session Account Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200/50">
                    <span className="text-[9px] text-zinc-400 block font-mono font-bold tracking-widest uppercase">FULL NAME</span>
                    <span className="text-xs text-zinc-800 font-extrabold mt-1 block">{currentUser.name}</span>
                  </div>
                  <div className="bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200/50">
                    <span className="text-[9px] text-zinc-400 block font-mono font-bold tracking-widest uppercase">M-PESA MOBILE</span>
                    <span className="text-xs text-zinc-800 font-bold font-mono mt-1 block">{currentUser.phone}</span>
                  </div>
                  <div className="bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200/50">
                    <span className="text-[9px] text-zinc-400 block font-mono font-bold tracking-widest uppercase">SELLER RATING SCORE</span>
                    <span className="text-xs text-zinc-800 flex items-center gap-1 font-mono font-black mt-1 block">
                      ⭐ {currentUser.rating} ({currentUser.reviewsCount} verified votes)
                    </span>
                  </div>
                  <div className="bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200/50">
                    <span className="text-[9px] text-zinc-400 block font-mono font-bold tracking-widest uppercase">RESIDENCE LOCALIZATION</span>
                    <span className="text-xs text-zinc-805 font-bold mt-1 block">{currentUser.locationName}</span>
                  </div>
                </div>

                {/* 🛰️ Calibrate Residence Coordinates */}
                <div className="mt-6 border-t border-zinc-100 pt-6 space-y-4">
                  <div>
                    <h4 className="text-[10px] font-black tracking-widest text-zinc-900 uppercase font-mono">📡 Coordinates Calibration & GPS Dashboard</h4>
                    <p className="text-zinc-500 text-[11px] mt-1">Calibrate your live residence coords to sort nearest trade listings on the Compass Radar.</p>
                  </div>

                  <div className="p-4 bg-zinc-50 rounded-3xl border border-zinc-200/60 text-left space-y-3.5">
                    
                    {/* Live stats */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-3">
                      <div>
                        <span className="text-[8px] font-mono uppercase tracking-widest font-black text-zinc-450 block">Active Coordinates</span>
                        <span className="text-xs font-mono font-bold text-zinc-805 mt-0.5 block flex items-center gap-1.55">
                          <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                          LAT: {currentUser.latitude.toFixed(5)} • LON: {currentUser.longitude.toFixed(5)}
                        </span>
                      </div>
                      <span className={`px-2.5 py-1 text-[8px] font-mono font-black uppercase rounded-full border self-start sm:self-auto ${
                        currentUser.locationName.startsWith('📍') 
                          ? 'bg-amber-50 border-amber-200 text-amber-700 animate-pulse' 
                          : 'bg-zinc-100 border-zinc-200 text-zinc-600'
                      }`}>
                        {currentUser.locationName.startsWith('📍') ? '🛰️ Live Browser GPS Active' : '📍 Preset Coordinate Zone'}
                      </span>
                    </div>

                    {/* Presets Grid Selection */}
                    <div>
                      <span className="text-[8px] font-mono uppercase tracking-widest font-black text-zinc-400 block mb-2">Toggle Preset Neighborhood Coordinates</span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {NEIGHBORHOODS.map(n => {
                          const isMatch = currentUser.locationName === n.name;
                          return (
                            <button
                              key={n.name}
                              type="button"
                              disabled={isSyncingProfileLocation}
                              onClick={() => handleProfileLocationSave(n.name, n.lat, n.lon)}
                              className={`px-3 py-2 text-[10.5px] border rounded-xl font-bold transition-all text-left truncate flex items-center gap-1 cursor-pointer ${
                                isMatch
                                  ? 'border-zinc-950 bg-zinc-950 text-white font-extrabold'
                                  : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${isMatch ? 'bg-emerald-400 animate-ping' : 'bg-zinc-300'}`}></span>
                              <span>{n.name.split(',')[0]}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Trigger Browser Geolocation */}
                    <div className="pt-2 border-t border-zinc-100/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="max-w-[200px]">
                        <span className="text-[8px] font-mono uppercase tracking-widest font-black text-zinc-400 block">Dynamic Coordinates</span>
                        <p className="text-[9.5px] leading-relaxed text-zinc-500 mt-0.5">Use browser's Geolocation API to instantly snap your smartphone or machine coordinates.</p>
                      </div>
                      
                      <button
                        type="button"
                        disabled={calibratingGps || isSyncingProfileLocation}
                        onClick={handleProfileGpsCalibrate}
                        className={`px-4 py-2 border rounded-xl text-[10px] font-mono font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 justify-center ${
                          calibratingGps
                            ? 'border-emerald-500/20 bg-emerald-50 text-emerald-605'
                            : 'border-emerald-500 bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-extrabold'
                        }`}
                      >
                        <Compass className={`w-4 h-4 ${calibratingGps ? 'animate-spin' : ''}`} />
                        <span>{calibratingGps ? 'Retrieving GPS...' : '📍 Sync Browser GPS'}</span>
                      </button>
                    </div>

                    {/* Custom Coordinates Name Editing */}
                    {currentUser.locationName.startsWith('📍') && (
                      <div className="pt-3 border-t border-zinc-100 space-y-2 text-left animate-fade-in">
                        <span className="text-[8px] font-mono uppercase tracking-widest font-black text-zinc-400 block">Customize localization name label</span>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={customLocationNameInput}
                            onChange={(e) => setCustomLocationNameInput(e.target.value)}
                            className="flex-1 bg-white border border-zinc-250 text-xs px-3 py-2 rounded-xl focus:border-zinc-900 outline-none font-bold text-zinc-805"
                            placeholder="e.g. My Apartment, Nairobi West"
                          />
                          <button
                            type="button"
                            disabled={isSyncingProfileLocation || !customLocationNameInput.trim()}
                            onClick={() => handleProfileLocationSave(customLocationNameInput, currentUser.latitude, currentUser.longitude)}
                            className="px-4 bg-zinc-950 hover:bg-zinc-850 text-white font-extrabold text-xs rounded-xl transition cursor-pointer"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    )}

                    {gpsCalibrateError && (
                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 text-[10px] font-mono leading-relaxed text-left">
                        ⚠️ Calibration Warning: {gpsCalibrateError}
                      </div>
                    )}

                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row gap-3">
                  <button
                    id="btn_logout_sokos"
                    type="button"
                    onClick={handleLogout}
                    className="flex-1 py-3 px-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 font-bold text-center rounded-2xl text-xs transition duration-150 cursor-pointer border border-rose-500/20 uppercase tracking-wider font-mono"
                  >
                    Log Out of Sokos 🔒
                  </button>
                </div>
              </div>
            </div>
          ))}

        </main>
      </div>

      {/* Global Listing Detail Modal */}
      {selectedListing && (
        <div id="listing_details_modal" className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-center items-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl relative overflow-hidden flex flex-col h-[85vh]">
            
            {/* Header image slider */}
            <div className="h-56 bg-slate-50 relative">
              <img src={selectedListing.images[0]} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => setSelectedListing(null)}
                className="absolute top-3 right-3 bg-slate-900/60 hover:bg-slate-900/80 text-white rounded-full p-2"
              >
                <X className="w-4 h-4" />
              </button>
              
              <span className="absolute bottom-3 left-3 bg-slate-950 text-emerald-400 text-xs font-black px-2.5 py-1 rounded-full border border-emerald-400/30">
                📍 {calculateListingDistance(selectedListing)} km from residence
              </span>
            </div>

            {/* Content body scrolled */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div>
                <span className="bg-emerald-50 text-emerald-800 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded">
                  {selectedListing.category}
                </span>
                <h1 className="text-lg font-display font-black text-slate-900 mt-2">{selectedListing.title}</h1>
                <div className="text-base font-black text-rose-600 font-mono mt-1">
                  KES {selectedListing.price.toLocaleString()}
                </div>
              </div>

              {/* Vendor Information Shield display */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-205 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-xs text-emerald-850">
                    {selectedListing.vendorName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-800 flex items-center gap-1">
                      {selectedListing.vendorName}
                      <VerifiedBadge verified={selectedListing.vendorVerified} size="sm" />
                    </div>
                    <p className="text-[10px] text-slate-400">Active within {calculateListingDistance(selectedListing)} km of your neighborhood</p>
                  </div>
                </div>
                <button
                  onClick={() => handleCreateChatFromListing(selectedListing)}
                  className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold text-2xs px-3 py-2 rounded-lg flex items-center gap-1"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Chat With Vendor
                </button>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <h3 className="text-slate-400 text-2xs uppercase tracking-wider font-semibold">Vendor Description</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium whitespace-pre-line">{selectedListing.description}</p>
              </div>

              {/* Meetup safety advice guidelines */}
              <div className="p-3 bg-slate-900 text-slate-350 rounded-xl text-2xs leading-relaxed space-y-1">
                <div className="font-bold text-emerald-400 flex items-center gap-1 underline mb-1">
                  <Shield className="w-3.5 h-3.5" />
                  Soko Safety Guard Meetup advice:
                </div>
                <div>• Never coordinate trade meets in dark isolated fields or private spaces. Only meet in lit public plazas (mall lobbies, transit centers).</div>
                <div>• Complete product inspections, checks and batteries test before entering your M-Pesa PIN credentials.</div>
              </div>
            </div>

            {/* Direct purchase action tab */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => handlePlaceOrder(selectedListing, 'cash')}
                className="flex-1 bg-white border border-slate-200 hover:bg-slate-100 font-bold text-2xs py-2.5 rounded-xl cursor-pointer text-slate-700"
              >
                Cash on Pickup Meet
              </button>
              <button
                onClick={() => handlePlaceOrder(selectedListing, 'mpesa')}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 active:scale-99 text-slate-950 font-black text-2xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow"
              >
                <Phone className="w-3.5 h-3.5 fill-slate-950" />
                Pay via M-Pesa STK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simulated M-Pesa STK push pin entry Phone Panel Overlay */}
      {mpesaOrder && (
        <div id="mpesa_prompt_dialer_modal" className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="w-full max-w-xs bg-slate-900 border-4 border-slate-950 rounded-3xl h-[65vh] flex flex-col items-center justify-between px-4 py-8 shadow-2xl relative text-slate-100">
            {/* Top speaker slit */}
            <div className="w-20 h-3.5 bg-slate-950 rounded-full mb-3"></div>

            {/* Internal simulated screen */}
            <div className="flex-1 w-full flex flex-col justify-between items-center text-center p-3">
              {isRealPushActive ? (
                // Real M-Pesa STK Prompt Active (Waiting for Daraja Callback)
                <div className="space-y-4 my-auto w-full">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-400 relative">
                    <span className="animate-ping absolute inline-flex h-10 w-10 rounded-full bg-emerald-400 opacity-30"></span>
                    <Shield className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-display font-medium text-slate-200 text-xs">Verify Handset Screen!</h3>
                    <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed px-2">
                       A secure M-Pesa PIN validation prompt has been sent to <strong className="text-emerald-400 font-mono text-xs">{mpesanPhone}</strong>.
                    </p>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-[10px] text-left font-mono text-zinc-300 space-y-1">
                    <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1">M-Pesa Invoice</div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Order ID:</span>
                      <span className="text-rose-400 font-bold text-2xs">{mpesaOrder.id.substring(0, 10)}...</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Amount:</span>
                      <span className="text-emerald-400 font-black">KES {mpesaOrder.price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Status:</span>
                      <span className="text-amber-400 font-black animate-pulse uppercase">Awaiting Pin...</span>
                    </div>
                  </div>

                  <div className="text-center py-2">
                    <div className="inline-block w-3.5 h-3.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[8px] text-zinc-500 font-mono uppercase mt-1 tracking-widest">Polling Live Safaricom Webhook...</p>
                  </div>

                  <button
                    onClick={() => {
                      setMpesaOrder(null);
                      setIsRealPushActive(false);
                    }}
                    className="w-full bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300 font-semibold py-2 rounded-lg text-[9px] transition uppercase tracking-wider font-mono cursor-pointer"
                  >
                    Done & Close
                  </button>
                </div>
              ) : !mpesaPinPrompt ? (
                // Setup / Confirm Payment Phone Screen
                <div className="space-y-4 my-auto w-full">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-400">
                    <Phone className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-display font-medium text-slate-200 text-sm">Daraja M-Pesa push API</h3>
                    <p className="text-[10px] text-slate-500 mt-1">Simulated push checkout for Soko listings</p>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-left font-mono text-slate-300">
                    <div className="text-[10px] text-slate-400">ACCOUNT: SOKO PAYMENTS</div>
                    <div className="text-rose-400 font-bold overflow-hidden overflow-ellipsis whitespace-nowrap">ORD: {mpesaOrder.id}</div>
                    <div className="text-emerald-400 font-black mt-1">AMT: {mpesaOrder.price.toLocaleString()} KES</div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-semibold text-slate-500 text-left">Buyer M-Pesa Mobile Number:</label>
                    <input
                      type="text"
                      value={mpesanPhone}
                      onChange={(e) => setMpesanPhone(e.target.value)}
                      placeholder="e.g. 0712345678"
                      className="w-full text-center px-3 py-2 bg-slate-950 border border-slate-850 rounded-lg text-sm text-white font-mono focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <button
                    onClick={handleTriggerStkPush}
                    disabled={processingMpesa}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-2 rounded-lg text-xs transition"
                  >
                    {processingMpesa ? 'Processing Daraja push...' : 'Initiate STK Handshake'}
                  </button>
                  <button
                    onClick={() => setMpesaOrder(null)}
                    className="w-full text-2xs text-slate-500 font-bold hover:text-slate-300"
                  >
                    Cancel Payment
                  </button>
                </div>
              ) : (
                // M-Pesa PIN prompt Simulated SIM Dialogue Box
                <div className="my-auto w-full bg-gray-100 hover:bg-gray-100/90 text-slate-900 border border-slate-300 p-4 rounded-xl space-y-4 shadow-2xl relative text-left select-none animate-bounce">
                  <div className="text-xs font-black text-emerald-800 font-mono tracking-wider flex items-center gap-1">
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
                    M-PESA PRE-PAYMENT
                  </div>
                  <p className="text-[10px] text-slate-700 leading-relaxed">
                    Do you want to transfer <b>KES {mpesaOrder.price.toLocaleString()}</b> to <b>SOKOS PAYMENTS LIMIT</b> for <b>Account: {mpesaOrder.id.substring(0, 8)}...</b>?
                  </p>

                  <div className="space-y-1.5 pt-1">
                    <label className="block text-[9px] font-bold text-slate-500">ENTER 4-DIGIT PIN:</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={mpesaPinValue}
                      onChange={(e) => setMpesaPinValue(e.target.value)}
                      placeholder="• • • •"
                      className="w-full text-center px-2 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-800 font-mono focus:outline-none"
                    />
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-slate-200">
                    <button
                      onClick={() => { setMpesaPinPrompt(false); setMpesaOrder(null); }}
                      className="flex-1 py-1 text-center bg-slate-200 hover:bg-slate-300 rounded text-[10px] font-bold text-slate-600"
                    >
                      Cancel Pay
                    </button>
                    <button
                      onClick={handleMpesaPinSend}
                      className="flex-1 py-1 text-center bg-emerald-600 hover:bg-emerald-700 rounded text-[10px] font-bold text-white shadow-sm"
                    >
                      Send PIN
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom visual indicator button */}
            <div className="w-10 h-10 border-2 border-slate-800 bg-slate-950 rounded-full"></div>
          </div>
        </div>
      )}

      {/* Seller rating modal review */}
      {ratingOrderId && (
        <div id="review_submit_dialog_modal" className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-center items-center p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl relative space-y-4 text-left">
            <h2 className="text-sm font-display font-black text-slate-900 flex items-center gap-1.5">
              <Star className="text-amber-500 fill-amber-300 w-4 h-4" />
              Rate and Review Seller
            </h2>
            <p className="text-2xs text-slate-500">
              Your feedback is anonymous and verifies active coordinate trade behavior for safety index. Rating modifies their total average score immediately.
            </p>

            <form onSubmit={handleRatingSubmit} className="space-y-4">
              <div>
                <label className="block text-2xs font-bold text-slate-500 mb-1">SCORE (1 - 5 STARS):</label>
                <div className="flex gap-2.5">
                  {[1, 2, 3, 4, 5].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setRatingValue(val)}
                      className={`w-9 h-9 rounded-full border flex items-center justify-center font-bold font-mono transition text-sm ${
                        ratingValue >= val ? 'bg-amber-400 border-amber-300 text-slate-950 shadow-sm' : 'border-slate-200 text-slate-400 hover:bg-slate-50'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-2xs font-bold text-slate-500 mb-1">REVIEW COMMENTARY:</label>
                <textarea
                  rows={3}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="e.g. Excellent exchange, immediate delivery, item in pristine condition."
                  className="w-full text-xs border border-slate-200 rounded p-2 focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRatingOrderId(null)}
                  className="flex-1 py-1.5 text-center bg-slate-100 hover:bg-slate-200 border rounded text-xs text-slate-500"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="flex-1 py-1.5 text-center bg-slate-900 hover:bg-slate-800 rounded text-xs font-bold text-white"
                >
                  Submit review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating VPS Trade DevConsole panel */}
      {currentUser && (
        <DevConsole
          currentUser={currentUser}
          onUserSwitched={() => {
            setSessionCount(prev => prev + 1);
            fetchListings();
            fetchConversations();
            fetchOrders();
            fetchNotifications();
            alert(`Switched active session. Relocating data context and listings...`);
          }}
          orders={orders}
          onOrderUpdated={() => {
            fetchOrders();
            fetchNotifications();
          }}
        />
      )}

      {/* Footer */}
      <footer className="bg-zinc-950 border-t border-zinc-800 text-zinc-400 px-6 py-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[10px] font-mono tracking-wider text-zinc-500">
            &copy; {new Date().getFullYear()} Sokos Payments Limited &middot; Nairobi, Kenya
          </p>
          <div className="flex items-center gap-4 text-[10px] font-mono tracking-wider">
            <button onClick={() => setShowPrivacy(true)} className="hover:text-emerald-400 transition cursor-pointer">Privacy Policy</button>
            <span className="text-zinc-700">&middot;</span>
            <button onClick={() => setShowTerms(true)} className="hover:text-emerald-400 transition cursor-pointer">Terms of Service</button>
            <span className="text-zinc-700">&middot;</span>
            <button onClick={() => setShowDataDeletion(true)} className="hover:text-rose-400 transition cursor-pointer">Data Deletion</button>
          </div>
        </div>
      </footer>

      {/* Legal page modals */}
      {showPrivacy && <PrivacyPolicy onClose={() => setShowPrivacy(false)} />}
      {showTerms && <TermsOfService onClose={() => setShowTerms(false)} />}
      {showDataDeletion && <DataDeletion onClose={() => setShowDataDeletion(false)} />}

    </div>
  );
}
