/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { MapPin, ZoomIn, ZoomOut, Eye, Compass, Search } from 'lucide-react';
import { Listing, User } from '../types';

interface Props {
  listings: Listing[];
  currentUser: User | null;
  maxDistance: number;
  onSelectListing: (l: Listing) => void;
}

export default function MarketMap({ listings, currentUser, maxDistance, onSelectListing }: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);
  const userCircleRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const [collapsed, setCollapsed] = useState(false);

  // Default coordinate set (Nairobi CBD)
  const userLat = currentUser ? currentUser.latitude : -1.2833;
  const userLon = currentUser ? currentUser.longitude : 36.8219;

  const [isDark, setIsDark] = useState(() => 
    typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDark(e.matches);
    };
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  useEffect(() => {
    // If collapsed, don't attempt to initialize or update
    if (collapsed) {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      return;
    }

    const L = (window as any).L;
    if (!L || !mapContainerRef.current) return;

    const layerUrl = isDark
      ? 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    // Initialize leaflet map in container
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: false, // Turn off default zoom to custom place it neatly
        attributionControl: false,
      }).setView([userLat, userLon], 13);

      // Add high-quality OpenStreetMap tiles (CartoDB Positron/Dark Matter - matching theme)
      mapRef.current.tileLayerRef = L.tileLayer(layerUrl, {
        maxZoom: 19,
      }).addTo(mapRef.current);

      // Add custom scale/attribution container in the corner
      L.control.attribution({
        prefix: 'Leaflet | © OpenStreetMap contributors'
      }).addTo(mapRef.current);

      // Create layers groups
      markersGroupRef.current = L.layerGroup().addTo(mapRef.current);
    } else {
      // Update tile layer url dynamically if theme changed
      if (mapRef.current.tileLayerRef) {
        mapRef.current.tileLayerRef.setUrl(layerUrl);
      }
      // If map exists, pan to the user's updated localization
      mapRef.current.setView([userLat, userLon]);
    }

    const activeMap = mapRef.current;
    const markersGroup = markersGroupRef.current;

    // Clear old elements
    markersGroup.clearLayers();
    if (userCircleRef.current) {
      userCircleRef.current.remove();
    }
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }

    // Place active user home/residence circle & marker
    const maxRadiusMeters = maxDistance * 1000;
    userCircleRef.current = L.circle([userLat, userLon], {
      color: '#10b981', // emerald-500
      fillColor: '#10b981',
      fillOpacity: 0.1,
      weight: 1.5,
      dashArray: '5, 5'
    }).addTo(activeMap);

    // Beautiful custom pulse dot for active user using pure CSS
    const userMarkerHtml = `
      <div class="relative flex items-center justify-center w-8 h-8">
        <span class="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-30 animate-ping"></span>
        <div class="relative rounded-full h-4.5 w-4.5 bg-emerald-500 border-2 border-white shadow-md flex items-center justify-center">
          <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
        </div>
      </div>
    `;

    const userIcon = L.divIcon({
      html: userMarkerHtml,
      className: 'custom-user-pin',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    userMarkerRef.current = L.marker([userLat, userLon], { icon: userIcon })
      .addTo(activeMap)
      .bindPopup(`
        <div class="p-2 font-sans text-xs">
          <strong class="text-zinc-900 block font-black text-2xs uppercase tracking-wider">My Current Residence</strong>
          <span class="text-zinc-500 block leading-tight mt-1 text-[11px]">${currentUser?.locationName || 'Nairobi CBD'}</span>
        </div>
      `);

    // Add listings markers
    listings.forEach((l) => {
      // Calculate distance from user manually
      const dy = (l.latitude - userLat) * 111.0;
      const dx = (l.longitude - userLon) * 111.0;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > maxDistance) return; // outside specified range

      const categoryColors: Record<string, string> = {
        Electronics: '#3b82f6',
        Furniture: '#f59e0b',
        'Clothing & Fashion': '#ec4899',
        'Food & Groceries': '#10b981',
        'Sports & Outdoors': '#8b5cf6',
        Vehicles: '#ef4444',
        'Local Services': '#0d9488',
      };
      
      const themeColor = categoryColors[l.category] || '#27272a';

      // Custom Listing Pin (Subtle teardrop style indicating product categories)
      const listingIconHtml = `
        <div class="relative flex items-center justify-center" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.15));">
          <div class="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white font-extrabold text-[10px]" style="background-color: ${themeColor}; transition: all 0.2s;">
            KES
          </div>
          <div class="absolute -bottom-1 w-2 h-2 rotate-45 border-r border-b border-white" style="background-color: ${themeColor};"></div>
        </div>
      `;

      const listingIcon = L.divIcon({
        html: listingIconHtml,
        className: 'custom-listing-pin',
        iconSize: [32, 36],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
      });

      const popupHtml = `
        <div class="p-2.5 font-sans" style="min-width: 180px;">
          <div class="flex gap-2">
            <img src="${l.images[0]}" class="w-10 h-10 object-cover rounded-lg border border-zinc-100" />
            <div style="flex: 1; min-width: 0;">
              <span class="text-[8px] font-bold text-white px-1.5 py-0.5 rounded uppercase tracking-wider font-mono block text-center" style="background-color: ${themeColor}; width: fit-content; margin-bottom: 2px;">
                ${l.category}
              </span>
              <strong class="text-xs font-black text-zinc-900 block truncate" style="max-width: 140px;">${l.title}</strong>
            </div>
          </div>
          <div class="mt-2 pt-2 border-t border-zinc-100 flex items-center justify-between">
            <span class="font-mono text-zinc-800 font-extrabold text-xs">${l.price.toLocaleString()} KES</span>
            <span class="text-[10px] font-mono text-zinc-500 font-bold">📍 ${distance.toFixed(1)} km</span>
          </div>
          <button 
            id="map_view_detail_${l.id}" 
            class="w-full mt-2.5 bg-zinc-950 hover:bg-zinc-850 text-white font-black text-[10px] py-1.5 px-3 rounded-lg font-mono text-center cursor-pointer border-0"
            style="display: block; width: 100%;"
          >
            VIEW TRADE OFFER
          </button>
        </div>
      `;

      const marker = L.marker([l.latitude, l.longitude], { icon: listingIcon })
        .addTo(markersGroup)
        .bindPopup(popupHtml);

      // Listen to click buttons in popup
      marker.on('popupopen', () => {
        const btn = document.getElementById(`map_view_detail_${l.id}`);
        if (btn) {
          btn.addEventListener('click', () => {
            onSelectListing(l);
          });
        }
      });
    });

    // Auto fit search bounds if listings are valid
    if (listings.length > 0 && mapRef.current) {
      try {
        const bounds = L.latLngBounds([userLat, userLon]);
        listings.forEach(l => {
          const dy = (l.latitude - userLat) * 111.0;
          const dx = (l.longitude - userLon) * 111.0;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist <= maxDistance) {
            bounds.extend([l.latitude, l.longitude]);
          }
        });
        activeMap.fitBounds(bounds, { padding: [40, 40], maxZoom: 14, animate: true });
      } catch (e) {
        console.warn("Could not calculate bounds auto-fit:", e);
      }
    }

  }, [listings, currentUser, maxDistance, collapsed, userLat, userLon, isDark]);

  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  };

  const handleRecenter = () => {
    if (mapRef.current) {
      mapRef.current.setView([userLat, userLon], 13);
    }
  };

  return (
    <div id="open_street_map_card" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-3xl p-5 border border-zinc-200/80 dark:border-zinc-800 shadow-[0_2px_12px_rgba(0,0,0,0.02)] relative overflow-hidden">
      
      {/* Header Controller */}
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-805 pb-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl">
            <Compass className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest font-mono text-zinc-800 dark:text-zinc-200">INTERACTIVE NEIGHBORHOOD MAP</h3>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold">Powered by OpenStreetMap • Real-time coordinate projections</p>
          </div>
        </div>
        <button
          id="btn_map_collapse"
          onClick={() => setCollapsed(!collapsed)}
          className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition rounded-xl text-[9px] font-mono uppercase tracking-wider border border-zinc-200 dark:border-zinc-700 text-zinc-650 dark:text-zinc-300 font-bold cursor-pointer"
        >
          {collapsed ? '🗺️ Expand Live Map' : 'Hide Live Map'}
        </button>
      </div>

      {!collapsed && (
        <div className="space-y-4">
          <div className="relative w-full h-[320px] rounded-2xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 z-10">
            
            {/* Map Canvas */}
            <div ref={mapContainerRef} className="w-full h-full" />

            {/* Custom Interactive Floating Map Buttons */}
            <div className="absolute right-3.5 top-3.5 flex flex-col gap-1.5 z-[500] pointer-events-auto">
              <button
                type="button"
                onClick={handleZoomIn}
                className="p-1.8 bg-white/95 dark:bg-zinc-800/95 hover:bg-white dark:hover:bg-zinc-700 text-zinc-850 dark:text-zinc-100 shadow-md border border-zinc-100 dark:border-zinc-700 rounded-xl transition cursor-pointer flex items-center justify-center"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleZoomOut}
                className="p-1.8 bg-white/95 dark:bg-zinc-800/95 hover:bg-white dark:hover:bg-zinc-700 text-zinc-850 dark:text-zinc-100 shadow-md border border-zinc-100 dark:border-zinc-700 rounded-xl transition cursor-pointer flex items-center justify-center"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleRecenter}
                className="p-1.8 bg-white/95 dark:bg-zinc-800/95 hover:bg-white dark:hover:bg-zinc-700 text-emerald-600 dark:text-emerald-400 shadow-md border border-emerald-100 dark:border-emerald-900/30 rounded-xl transition cursor-pointer flex items-center justify-center font-bold"
                title="Recenter Map"
              >
                <MapPin className="w-4 h-4 text-emerald-500" />
              </button>
            </div>

            {/* Overlay Indicator of Active Scanned Listings */}
            <div className="absolute left-3.5 bottom-3.5 bg-zinc-950/90 text-white font-mono text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full z-[500] shadow-xl backdrop-blur-sm border border-zinc-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Scanned Range: <strong className="text-emerald-300 font-extrabold">{listings.filter(l => Math.sqrt(Math.pow((l.latitude - userLat) * 111.0, 2) + Math.pow((l.longitude - userLon) * 111.0, 2)) <= maxDistance).length} units</strong></span>
            </div>

          </div>

          {/* Location Safety Alert */}
          <div className="p-3 bg-emerald-50/40 dark:bg-emerald-950/10 rounded-2xl border border-emerald-100/60 dark:border-emerald-900/20 leading-relaxed text-[10px] text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <p>
              Your listings scope is live in the browser view. Coordinates in <strong className="text-zinc-800 dark:text-zinc-200 font-extrabold">OpenStreetMap</strong> align on true geographic metrics. Home coordinates slightly fuzzy inside ±150 meters to safeguard private trader estates.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
