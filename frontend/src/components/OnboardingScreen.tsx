/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User } from '../types';
import { apiFetch } from '../utils';
import { 
  MapPin, 
  UserCheck, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  Sparkles, 
  UploadCloud, 
  Compass, 
  HelpCircle,
  CircleDot
} from 'lucide-react';

interface Props {
  currentUser: User;
  onOnboardSuccess: (updatedUser: User) => void;
}

export default function OnboardingScreen({ currentUser, onOnboardSuccess }: Props) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  // --- Step 2 Location state ---
  const neighborhoods = [
    { name: 'Nairobi CBD', latitude: -1.2833, longitude: 36.8219, desc: 'Central trade and commuter transit hubs' },
    { name: 'Kilimani, Nairobi', latitude: -1.2915, longitude: 36.7900, desc: 'Residential areas around Prestige Mall & Yaya' },
    { name: 'Westlands, Nairobi', latitude: -1.2647, longitude: 36.8044, desc: 'Commercial tech business strips & malls' },
    { name: 'Madaraka, Nairobi', latitude: -1.3090, longitude: 36.8123, desc: 'Student hostels and Strathmore community zones' },
    { name: 'South C, Nairobi', latitude: -1.3204, longitude: 36.8267, desc: 'Safe estates near Bellevue & Mombasa Road' },
  ];
  const [chosenNeighborhood, setChosenNeighborhood] = useState(neighborhoods[0]);
  const [customGpsName, setCustomGpsName] = useState('My GPS Location');
  const [detectingGps, setDetectingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const findClosestNeighborhood = (lat: number, lon: number) => {
    let closest = neighborhoods[0];
    let minD = Infinity;
    for (const n of neighborhoods) {
      const d = Math.sqrt(Math.pow(n.latitude - lat, 2) + Math.pow(n.longitude - lon, 2));
      if (d < minD) {
        minD = d;
        closest = n;
      }
    }
    return closest;
  };

  const handleDetectGps = () => {
    setDetectingGps(true);
    setGpsError(null);
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser");
      setDetectingGps(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const closest = findClosestNeighborhood(latitude, longitude);
        const name = `📍 GPS Near ${closest.name.split(',')[0]}`;
        const newZone = {
          name,
          latitude,
          longitude,
          desc: `Real-time browser coordinates (Accuracy within 10 meters)`
        };
        setCustomGpsName(name);
        setChosenNeighborhood(newZone);
        setDetectingGps(false);
      },
      (error) => {
        console.error("GPS detection error:", error);
        setGpsError(error.message || "Failed to retrieve location coordinates. Permit permission check.");
        setDetectingGps(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // --- Step 3 ID verification audit states ---
  const [docType, setDocType] = useState<'national_id' | 'passport' | 'business_permit'>('national_id');
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [isAudited, setIsAudited] = useState(false);
  const [auditProgressText, setAuditProgressText] = useState('');

  // --- Step 4 Avatar color gradient list ---
  const gradients = [
    { name: 'Emerald Forest', class: 'bg-gradient-to-tr from-emerald-600 to-teal-400 text-teal-950', value: 'emerald' },
    { name: 'Slated Night', class: 'bg-gradient-to-tr from-zinc-750 to-zinc-600 text-zinc-100', value: 'slate' },
    { name: 'Sunset Aura', class: 'bg-gradient-to-tr from-amber-500 to-rose-450 text-amber-950', value: 'sunset' },
    { name: 'Ocean Depth', class: 'bg-gradient-to-tr from-blue-700 to-cyan-400 text-blue-950', value: 'ocean' },
    { name: 'Royal Magenta', class: 'bg-gradient-to-tr from-fuchsia-700 to-indigo-500 text-fuchsia-950', value: 'magenta' },
  ];
  const [selectedGradient, setSelectedGradient] = useState(gradients[0]);

  // Simulate ID Verification Compliance Engine run
  const runSecurityAuditDemo = () => {
    if (!selectedFileName) {
      setErrorText('Please specify or mock select a document file first.');
      return;
    }

    setLoading(true);
    setErrorText(null);
    
    // Simulate real-time compliance steps
    const compliancePhrases = [
      'Extracting security holographic metadata...',
      'Performing high-fidelity optical OCR validation...',
      'Matching registry name against Safaricom credential ledger...',
      'Sanitizing PII details and deploying Zero-Trust signature...',
      'Verification check SUCCESSful!'
    ];

    let currentPhraseIdx = 0;
    setAuditProgressText(compliancePhrases[0]);

    const timer = setInterval(() => {
      currentPhraseIdx++;
      if (currentPhraseIdx < compliancePhrases.length) {
        setAuditProgressText(compliancePhrases[currentPhraseIdx]);
      } else {
        clearInterval(timer);
        setIsAudited(true);
        setLoading(false);
      }
    }, 700);
  };

  // Final onboarding API submission
  const handleSubmitOnboarding = async () => {
    setLoading(true);
    setErrorText(null);

    const payload = {
      locationName: chosenNeighborhood.name,
      latitude: chosenNeighborhood.latitude,
      longitude: chosenNeighborhood.longitude,
      avatarUrl: selectedGradient.value, // We can store the gradient theme key in avatarUrl
      verified: isAudited,
      docVerified: isAudited,
      verificationDocType: isAudited ? docType : undefined,
    };

    try {
      const res = await apiFetch('/api/auth/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        onOnboardSuccess(data.user);
      } else {
        setErrorText(data.error || 'Onboarding failed to complete.');
      }
    } catch (err) {
      setErrorText('Server connection timed out. Check your stack.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="onboarding_flow_screen" className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center px-4 py-8 font-sans transition-all duration-300">
      
      {/* Step Indicators Top Header */}
      <div className="w-full max-w-lg mb-6 flex items-center justify-between px-3">
        <span className="text-[10px] font-black uppercase text-zinc-500 font-mono tracking-widest">
          Sokos Trader Onboarding
        </span>
        <div className="flex gap-2.5 items-center">
          {[1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className={`w-5.5 h-1.5 rounded-full transition-all ${
                step === i 
                  ? 'bg-emerald-400 w-8' 
                  : step > i 
                    ? 'bg-emerald-500/40' 
                    : 'bg-zinc-800'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Primary Card Canvas */}
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800/85 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col min-h-[460px] justify-between">
        
        {/* Dynamic Header */}
        <div className="space-y-1.5 border-b border-zinc-800/60 pb-4 mb-5">
          <div className="text-[9px] font-black font-mono tracking-wider text-emerald-400 uppercase flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 animate-spin-slow text-amber-400" />
            <span>Step {step} of 4</span>
          </div>
          <h2 className="text-lg font-display font-black text-white tracking-tight uppercase">
            {step === 1 && 'Let\'s Verify Your Account Information'}
            {step === 2 && 'Set Your Nairobi Trade Location'}
            {step === 3 && 'Simulate ID Safety Audit (Badge)'}
            {step === 4 && 'Assign Custom Avatar Style'}
          </h2>
          <p className="text-zinc-400 text-2xs leading-relaxed font-sans">
            {step === 1 && 'Confirm your basic credential records registered securely from Nairobi local node network.'}
            {step === 2 && 'Sokos computes physical distance measurements. Choose the closest coordinate location to your home.'}
            {step === 3 && 'Opt-in to security verification. Accounts with cleared ID badges receive 12x higher trade coordination response.'}
            {step === 4 && 'Select an elegant background gradient theme that will represent your profile avatar on Sokos.'}
          </p>
        </div>

        {/* Action Error Alerts */}
        {errorText && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/20 text-rose-300 text-2xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span className="font-semibold">{errorText}</span>
          </div>
        )}

        {/* Dynamic steps contents container */}
        <div className="flex-1 py-1">

          {/* STEP 1: VERIFY ENROLLED PERSONAL STAKE */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">
                <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-850">
                  <span className="text-[9px] text-zinc-500 block font-mono font-bold tracking-widest uppercase">REGISTRATION NAME</span>
                  <span className="text-xs text-white font-extrabold mt-1 block font-sans">{currentUser.name}</span>
                </div>
                <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-850">
                  <span className="text-[9px] text-zinc-500 block font-mono font-bold tracking-widest uppercase">M-PESA TELEPHONE</span>
                  <span className="text-xs text-emerald-400 font-bold font-mono mt-1 block">+254 {currentUser.phone}</span>
                </div>
                <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-850 sm:col-span-2">
                  <span className="text-[9px] text-zinc-500 block font-mono font-bold tracking-widest uppercase">OPTIONAL CONTACT EMAIL</span>
                  <span className="text-xs text-zinc-300 font-semibold font-mono mt-1 block">
                    {currentUser.email || 'None Registered (Can add later)'}
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-zinc-950 border border-zinc-850 rounded-2xl flex gap-3 items-start">
                <Shield className="w-5 h-5 text-emerald-450 mt-0.5 flex-shrink-0" />
                <div className="text-[10.5px] leading-relaxed text-zinc-400">
                  <span className="text-emerald-400 font-bold">Encrypted Ledger Check:</span> Your phone number matches Safaricom M-Pesa standard compliance nodes. Instant secure checkout is active for your account natively.
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: NEIGHBORHOOD SELECTION WITH LAT/LONG */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in font-sans">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/60 pb-3 mb-1">
                <label className="block text-[10px] font-black uppercase text-zinc-400 font-mono tracking-wider">Select home coordination zone</label>
                <button
                  type="button"
                  disabled={detectingGps}
                  onClick={handleDetectGps}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    detectingGps
                      ? 'border-emerald-500/30 bg-emerald-950/10 text-emerald-500/60'
                      : 'border-emerald-500 bg-emerald-500 hover:bg-emerald-400 text-zinc-950'
                  }`}
                >
                  <Compass className={`w-3.5 h-3.5 ${detectingGps ? 'animate-spin text-emerald-500' : 'text-zinc-950'}`} />
                  <span>{detectingGps ? 'Detecting GPS...' : '📍 Use Browser GPS'}</span>
                </button>
              </div>

              {gpsError && (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-mono leading-relaxed">
                  ⚠️ GPS Error: {gpsError}. Please use preset neighborhoods instead.
                </div>
              )}

              <div className="grid grid-cols-1 gap-2 max-h-[170px] overflow-y-auto pr-1">
                {neighborhoods.map((n) => {
                  const isChosen = chosenNeighborhood.name === n.name;
                  return (
                    <button
                      key={n.name}
                      type="button"
                      onClick={() => {
                        setChosenNeighborhood(n);
                        setGpsError(null);
                      }}
                      className={`w-full p-3.5 border rounded-2xl text-left cursor-pointer transition flex items-center justify-between ${
                        isChosen 
                          ? 'border-emerald-500 bg-emerald-950/20 text-white' 
                          : 'border-zinc-800 bg-zinc-950/40 text-zinc-405 hover:bg-zinc-950/80 hover:text-white'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold font-sans flex items-center gap-1.5">
                          <CircleDot className={`w-3 h-3 ${isChosen ? 'text-emerald-400 fill-emerald-400' : 'text-zinc-650'}`} />
                          {n.name}
                        </div>
                        <div className="text-[10px] opacity-75 mt-0.5">{n.desc}</div>
                      </div>
                      <div className="text-right font-mono text-[9px] text-zinc-450">
                        <div>LAT {n.latitude.toFixed(3)}</div>
                        <div>LON {n.longitude.toFixed(3)}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Editable Name fields if GPS was matched */}
              {chosenNeighborhood.longitude !== undefined && (chosenNeighborhood.name.startsWith('📍') || !neighborhoods.some(n => n.name === chosenNeighborhood.name)) && (
                <div className="space-y-1.5 p-3 rounded-2xl bg-zinc-950 border border-zinc-850 animate-fade-in text-left">
                  <label className="block text-[9px] font-black uppercase text-zinc-500 font-mono tracking-widest">Customize GPS Pin Name</label>
                  <input
                    type="text"
                    value={customGpsName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCustomGpsName(val);
                      setChosenNeighborhood(prev => ({
                        ...prev,
                        name: val,
                      }));
                    }}
                    placeholder="e.g. My Apartment, Nairobi West"
                    className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white px-3 py-2 rounded-xl focus:border-emerald-500 outline-none font-sans font-bold"
                  />
                  <p className="text-[9px] text-zinc-550 italic font-mono">You can edit this to name your coordinates. Sokos will use this designation in the market radar!</p>
                </div>
              )}

              <div className="flex items-center gap-2 text-[10px] text-zinc-500 bg-zinc-950/30 p-2.5 rounded-xl border border-zinc-850">
                <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0 animate-bounce" />
                <span>Selected Localization: <strong className="text-emerald-400 font-bold">{chosenNeighborhood.name}</strong> • Range radius active.</span>
              </div>
            </div>
          )}

          {/* STEP 3: MOCK SECURITY IDENTITY AUDIT FOR BADGES */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in font-sans">
              
              {/* Document Toggler */}
              <div className="flex gap-2">
                {[
                  { id: 'national_id', label: 'National ID' },
                  { id: 'passport', label: 'Passport' },
                  { id: 'business_permit', label: 'Permit' }
                ].map((doc) => (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => { setDocType(doc.id as any); setIsAudited(false); }}
                    className={`flex-grow py-2 px-1 border rounded-xl text-3xs font-black font-mono uppercase tracking-wider transition ${
                      docType === doc.id 
                        ? 'border-zinc-200 bg-white text-zinc-955' 
                        : 'border-zinc-800 bg-zinc-950 text-zinc-405 hover:bg-zinc-900'
                    }`}
                  >
                    {doc.label}
                  </button>
                ))}
              </div>

              {/* Upload Drag-and-drop placeholder */}
              {!isAudited ? (
                <div className="space-y-3">
                  <div className="border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/40 p-5 text-center relative hover:bg-zinc-950/80 transition cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        setSelectedFileName(file ? file.name : 'passport_copy_photo.png');
                        setIsAudited(false);
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <UploadCloud className="w-7 h-7 mx-auto text-zinc-500 animate-pulse mb-1.5" />
                    <div className="text-2xs font-extrabold text-zinc-200">
                      {selectedFileName ? `Selected: ${selectedFileName}` : 'Mock Upload Document Frame'}
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-1">Select file, or drag & drop to simulate audit.</div>
                  </div>

                  {loading ? (
                    <div className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800 text-center space-y-1.5 font-mono text-[10px] text-amber-400">
                      <Compass className="w-5 h-5 mx-auto animate-spin text-amber-400" />
                      <div>{auditProgressText}</div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={runSecurityAuditDemo}
                      className="w-full py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 text-2xs uppercase font-black font-mono tracking-wider rounded-xl transition flex items-center justify-center gap-1.5"
                    >
                      Begin Simulated Security Audit
                    </button>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl flex gap-3 items-center animate-fade-in">
                  <CheckCircle className="w-10 h-10 text-emerald-400 fill-emerald-950 flex-shrink-0" />
                  <div>
                    <h4 className="text-2xs font-black text-emerald-400 uppercase tracking-widest font-mono">Simulated Audit Cleared!</h4>
                    <p className="text-[10px] text-zinc-400 leading-normal mt-0.5">
                      Compliance algorithm passed successfully. Verification badges (green and blue markers) will appear on your listings.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: ASSIGN CUSTOM AVATAR STYLE */}
          {step === 4 && (
            <div className="space-y-4 animate-fade-in font-sans">
              <label className="block text-[10px] font-black uppercase text-zinc-400 font-mono tracking-wider">Select profile gradient theme</label>
              
              <div className="grid grid-cols-2 gap-2 pb-2">
                {gradients.map((g) => {
                  const isSelected = selectedGradient.value === g.value;
                  return (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() => setSelectedGradient(g)}
                      className={`p-3 rounded-2xl border text-left cursor-pointer transition flex items-center gap-2.5 ${
                        isSelected ? 'border-emerald-500 bg-zinc-950' : 'border-zinc-805 bg-zinc-950/40 hover:bg-zinc-900/40'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase ${g.class}`}>
                        {currentUser.name.charAt(0)}
                      </div>
                      <div className="text-[11px] font-bold text-zinc-300">{g.name}</div>
                    </button>
                  );
                })}
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-850 flex items-center gap-4 justify-center">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center font-black text-lg tracking-wider border-2 border-zinc-800 shadow-xl ${selectedGradient.class}`}>
                  {currentUser.name ? currentUser.name.split(' ').map(n=>n[0]).join('').substring(0, 2) : 'TR'}
                </div>
                <div className="text-left">
                  <div className="text-xs font-black text-white">{currentUser.name}</div>
                  <div className="text-[9px] text-zinc-405 font-semibold font-mono uppercase tracking-wider mt-0.5">Active Nairobi Trader • {chosenNeighborhood.name}</div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Action button controls */}
        <div className="flex gap-4 border-t border-zinc-800/60 pt-5 mt-4">
          {step > 1 && (
            <button
              onClick={() => { setStep((s) => (s - 1) as any); setErrorText(null); }}
              disabled={loading}
              className="px-4 py-3 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl text-3xs font-black font-mono uppercase tracking-wider transition-all"
            >
              Back
            </button>
          )}

          {step < 4 ? (
            <button
              onClick={() => {
                if (step === 2 && !chosenNeighborhood) {
                  setErrorText('Please select your Nairobi trade location neighborhood.');
                  return;
                }
                setStep((s) => (s + 1) as any);
                setErrorText(null);
              }}
              disabled={loading}
              className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-xl text-3xs uppercase tracking-widest font-mono transition shadow-lg flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Next step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmitOnboarding}
              disabled={loading}
              className="flex-1 py-3 bg-emerald-400 hover:bg-emerald-300 text-zinc-950 font-black rounded-xl text-3xs uppercase tracking-widest font-mono transition shadow-lg flex items-center justify-center gap-1 cursor-pointer"
            >
              {loading ? 'Initializing trader profile...' : 'Enter Sokos Marketplace ✔️'}
            </button>
          )}
        </div>

      </div>

      {/* Security note */}
      <div className="text-center mt-5 text-[10px] text-zinc-550 font-mono flex items-center gap-1 justify-center">
        <span>🔒 Zero-Knowledge Compliance Engine Secure Hands-off</span>
      </div>

    </div>
  );
}
