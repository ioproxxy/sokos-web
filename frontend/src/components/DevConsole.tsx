/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 

import React, { useState } from 'react';
import { User, Order } from '../types';
import { RefreshCw, Users, Server, Shield, Terminal, MessageSquare, Database, ExternalLink } from 'lucide-react';
import { apiFetch } from '../utils';

interface Props {
  currentUser: User;
  onUserSwitched: () => void;
  orders: Order[];
  onOrderUpdated: () => void;
}

export default function DevConsole({ currentUser, onUserSwitched, orders, onOrderUpdated }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'nginx' | 'mpesa' | 'docker' | 'database'>('users');
  const [loading, setLoading] = useState(false);

  // Hardcoded known database seed users
  const devUsers = [
    { id: 'usr_buyer1', name: 'Alex Gathu', role: 'Main Buyer', location: 'Nairobi CBD' },
    { id: 'usr_johndoe', name: 'John Kamau', role: 'Electronics Seller', location: 'Kilimani' },
    { id: 'usr_marywaweru', name: 'Mary Waweru', role: 'Furniture Seller', location: 'Westlands' },
    { id: 'usr_davidotieno', name: 'David Otieno', role: 'Outdoor Seller', location: 'Madaraka' },
    { id: 'usr_aminamohan', name: 'Amina Mohammed', role: 'Clothing Seller', location: 'South C' },
  ];

  const handleSwitchUser = async (userId: string) => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/auth/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        onUserSwitched();
        setIsOpen(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const simulateCallback = async (checkoutRequestId: string, success: boolean) => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/mpesa/simulate-callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkoutRequestId, success }),
      });
      if (res.ok) {
        onOrderUpdated();
        alert(`Daraja STK push callback simulated: ${success ? 'SUCCESS' : 'FAILED/CANCELLED'}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const mpesaPendingOrders = orders.filter(o => o.status === 'mpesa_pending');

  const nginxConfig = `server {
    listen 80;
    server_name sokos.co.ke www.sokos.co.ke;

    # Redirect non-SSL to SSL
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name sokos.co.ke;

    ssl_certificate /etc/letsencrypt/live/sokos.co.ke/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/sokos.co.ke/privkey.pem;

    # Reverse proxy secure configurations
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        cache_bypass $http_bypass_cache;
    }
}`;

  const dockerfileConfig = `FROM node:20-alpine

WORKDIR /app

# Copy lock and dependencies definitions
COPY package*.json ./

# Install pristine dependencies including production modules
RUN npm ci

# Copy full-stack application source
COPY . .

# Build Vite static assets and bundle backend server
RUN npm run build

# Expose port and launch application backend
EXPOSE 3000
ENV NODE_ENV=production

CMD ["npm", "start"]`;

  return (
    <>
      {/* Floating Toggle Button */}
    <!--      <button
        id="btn_dev_console_toggle"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 right-4 z-50 flex items-center gap-2 bg-slate-900 border border-slate-700 text-slate-100 hover:bg-slate-800 active:scale-95 px-3.5 py-2.5 rounded-full shadow-2xl transition duration-150 text-xs font-mono"
      >
        <Terminal className="w-4 h-4 text-emerald-400 animate-pulse" />
        <span>VPS & M-Pesa Panel</span>
      </button>

      {/* Slide-out Panel Overlay */}
      {isOpen && (
        <div id="dev_console_overlay" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex justify-end">
          <div
            id="dev_console_drawer"
            className="w-full max-w-lg bg-slate-950 border-l border-slate-800 text-slate-100 h-full flex flex-col shadow-2xl relative"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-mono text-sm font-semibold">
                <Terminal className="w-4 h-4 animate-bounce" />
                <span>SOKOS SEED & PRODUCTION HELPER</span>
              </div>
              <button
                id="btn_close_dev_console"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-100 text-xs font-bold bg-slate-905 border border-slate-800 rounded px-2.5 py-1"
              >
                CLOSE [Esc]
              </button>
            </div>

            {/* Active System Status Bar */}
            <div className="bg-slate-910 py-1.5 px-4 flex items-center justify-between border-b border-slate-800 text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>VPS LOCAL VPS SERVICE: UP</span>
              </span>
              <span>HOST: sokos.co.ke</span>
              <span>ACTIVE USER: <b className="text-emerald-400">{currentUser.name}</b></span>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-800 bg-slate-900/50">
              <button
                onClick={() => setActiveTab('users')}
                className={`flex-1 py-3 text-2xs font-mono border-b-2 text-center transition ${
                  activeTab === 'users' ? 'border-emerald-500 text-emerald-400 bg-slate-900' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-3.5 h-3.5 mx-auto mb-1" />
                Auth Trade Swap
              </button>
              <button
                onClick={() => setActiveTab('nginx')}
                className={`flex-1 py-3 text-2xs font-mono border-b-2 text-center transition ${
                  activeTab === 'nginx' ? 'border-emerald-500 text-emerald-400 bg-slate-900' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Server className="w-3.5 h-3.5 mx-auto mb-1" />
                Nginx Config
              </button>
              <button
                onClick={() => setActiveTab('mpesa')}
                className={`flex-1 py-3 text-2xs font-mono border-b-2 text-center transition ${
                  activeTab === 'mpesa' ? 'border-emerald-500 text-emerald-400 bg-slate-900' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="relative">
                  <Database className="w-3.5 h-3.5 mx-auto mb-1" />
                  {mpesaPendingOrders.length > 0 && (
                    <span className="absolute -top-1 right-8 bg-emerald-500 text-black text-[8px] font-bold px-1 rounded-full">{mpesaPendingOrders.length}</span>
                  )}
                </div>
                Daraja M-Pesa Sim
              </button>
              <button
                onClick={() => setActiveTab('docker')}
                className={`flex-1 py-3 text-2xs font-mono border-b-2 text-center transition ${
                  activeTab === 'docker' ? 'border-emerald-500 text-emerald-400 bg-slate-900' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Shield className="w-3.5 h-3.5 mx-auto mb-1" />
                Docker/VPS
              </button>
              <button
                onClick={() => setActiveTab('database')}
                className={`flex-1 py-3 text-2xs font-mono border-b-2 text-center transition ${
                  activeTab === 'database' ? 'border-emerald-500 text-emerald-400 bg-slate-900' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Database className="w-3.5 h-3.5 mx-auto mb-1" />
                DB Setup
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 font-sans text-xs">
              {activeTab === 'users' && (
                <div>
                  <h3 className="font-semibold text-sm mb-2 text-emerald-400 font-display">Simulate Multi-User Direct Trade</h3>
                  <p className="text-slate-400 text-2xs leading-relaxed mb-4">
                    Sokos is designed for direct vendor-buyer trading. Click any profile below to swap into their session. 
                    This allows you to <b>post listings as a Seller</b>, then switch to a <b>Buyer</b> to initiate chats, order via M-Pesa, 
                    and rate back and forth!
                  </p>
                  <div className="space-y-2">
                    {devUsers.map(user => {
                      const isActive = user.id === currentUser.id;
                      return (
                        <div
                          key={user.id}
                          className={`flex items-center justify-between p-3 rounded border transition ${
                            isActive ? 'border-emerald-500 bg-emerald-950/20' : 'border-slate-800 bg-slate-900/30 hover:bg-slate-900/80'
                          }`}
                        >
                          <div>
                            <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                              {user.name}
                              {isActive && <span className="bg-emerald-500 text-slate-950 text-[9px] font-bold px-1.5 py-0.2 rounded font-mono">Current Session</span>}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">{user.role} • 📍 {user.location}</div>
                          </div>
                          {!isActive && (
                            <button
                              onClick={() => handleSwitchUser(user.id)}
                              disabled={loading}
                              className="bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold px-3 py-1.5 rounded transition text-[10px]"
                            >
                              Login
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'nginx' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm text-emerald-400 font-display">Secure Nginx Reverse Proxy Config</h3>
                    <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded">sokos.co.ke</span>
                  </div>
                  <p className="text-slate-400 text-2xs leading-relaxed">
                    Nginx acts as your frontend secure layer in a VPS, performing SSL termination and routing requests smoothly to this Express + Node backend. Put this config in <code className="bg-slate-900 text-rose-400 px-1 py-0.5 rounded">/etc/nginx/sites-available/sokos</code>:
                  </p>
                  <pre className="p-3 bg-slate-900 border border-slate-800 rounded font-mono text-[9px] text-emerald-300 overflow-x-auto whitespace-pre leading-normal">
                    {nginxConfig}
                  </pre>
                </div>
              )}

              {activeTab === 'mpesa' && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm text-emerald-400 font-display">M-Pesa Daraja STK Webhook Simulator</h3>
                  <p className="text-slate-400 text-2xs leading-relaxed">
                    Safaricom STK payment results arrive asynchronously at the callback API endpoint (<code className="bg-slate-900 text-blue-400 px-1 font-mono">POST /api/mpesa/callback</code>). 
                    Simulate real-time subscriber handshake events below!
                  </p>

                  {mpesaPendingOrders.length === 0 ? (
                    <div className="p-6 text-center border border-dashed border-slate-800 rounded text-slate-500 text-2xs">
                      No active orders currently awaiting M-Pesa STK push. Try placing a trade order via M-Pesa payment format first.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-2xs font-semibold text-amber-500 font-mono">📍 ACTIONS REQUIRED FOR ACTIVE CODES:</div>
                      {mpesaPendingOrders.map(order => (
                        <div key={order.id} className="p-3 bg-slate-900 border border-slate-800 rounded space-y-2">
                          <div className="flex justify-between font-mono text-[10px]">
                            <span className="text-slate-300">Order: <b>{order.listingTitle}</b></span>
                            <span className="text-amber-400">-{order.price} KES</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono overflow-ellipsis overflow-hidden">
                            ID: {order.id} | Push CId: {order.mpesaCheckoutRequestId}
                          </div>
                          <div className="flex gap-2 pt-1 border-t border-slate-800/80">
                            <button
                              onClick={() => simulateCallback(order.mpesaCheckoutRequestId!, true)}
                              disabled={loading}
                              className="flex-1 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold py-1.5 rounded transition text-[10px]"
                            >
                              Simulate Cash Received
                            </button>
                            <button
                              onClick={() => simulateCallback(order.mpesaCheckoutRequestId!, false)}
                              disabled={loading}
                              className="flex-1 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 active:scale-95 text-rose-300 font-bold py-1.5 rounded transition text-[10px]"
                            >
                              User Cancel Payload
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'docker' && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-emerald-400 font-display">Containerized Production VPS Deployment</h3>
                  <p className="text-slate-400 text-2xs leading-relaxed">
                    Sokos is container-ready. Easily launch this multi-user Soko trade system on your VPS (Ubuntu, Debian, etc.) using Docker compose and standard remote environment file persistence.
                  </p>
                  <div>
                    <div className="flex justify-between items-center text-[10px] text-slate-300 font-mono bg-slate-900 border-b border-slate-800 p-2 rounded-t">
                      <span>Dockerfile Configuration</span>
                    </div>
                    <pre className="p-3 bg-slate-900 border border-t-0 border-slate-800 rounded-b font-mono text-[9px] text-slate-300 overflow-x-auto whitespace-pre leading-relaxed">
                      {dockerfileConfig}
                    </pre>
                  </div>
                  <div>
                    <div className="flex justify-between items-center text-[10px] text-slate-300 font-mono bg-slate-900 border-b border-slate-800 p-2 rounded-t">
                      <span>Remote DB config (.env)</span>
                    </div>
                    <pre className="p-3 bg-slate-900 border border-t-0 border-slate-800 rounded-b font-mono text-[9px] text-rose-300 overflow-x-auto whitespace-pre leading-relaxed">
                      {`# Configure a stable Postgres instance for production
DATABASE_URL="postgresql://sokos_user:secure_pwd@your-db-vps-server:5432/sokos_db"
GEMINI_API_KEY="AI_STUDIO_KEY"
APP_URL="https://sokos.co.ke"`}
                    </pre>
                  </div>
                </div>
              )}

              {activeTab === 'database' && (
                <div id="panel_vps_database_instructions" className="space-y-4 animate-fade-in text-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-xs text-emerald-400 font-mono uppercase tracking-wider">PostgreSQL Setup & Installation Guidelines</h3>
                    <span className="text-[9px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded">schema.sql</span>
                  </div>
                  <p className="text-slate-400 text-3xs leading-relaxed">
                    Sokos uses a relational PostgreSQL database to manage secure Nairobi merchant listings, order checkouts, Swahili chats, and custom user passwords. Follow these guidelines to install the DB on your VPS system:
                  </p>

                  <div className="space-y-3.5">
                    {/* Step 1 */}
                    <div className="border border-slate-800 rounded-xl bg-slate-900/30 overflow-hidden">
                      <div className="bg-slate-900/60 px-3.5 py-2 text-[10px] font-mono text-slate-200 font-bold border-b border-slate-800 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>STEP 1: INSTALL POSTGRESQL ON VPS</span>
                      </div>
                      <div className="p-3.5 space-y-2">
                        <div className="text-[10px] text-slate-400 font-bold font-mono uppercase">On Ubuntu / Debian:</div>
                        <pre className="p-2 bg-slate-950 rounded-lg font-mono text-[9px] text-emerald-400 overflow-x-auto">
{`sudo apt update
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql`}
                        </pre>
                        <div className="text-[10px] text-slate-400 font-bold font-mono uppercase mt-2.5">On macOS (Local test):</div>
                        <pre className="p-2 bg-slate-950 rounded-lg font-mono text-[9px] text-emerald-400 overflow-x-auto">
{`brew install postgresql@15
brew services start postgresql@15`}
                        </pre>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="border border-slate-800 rounded-xl bg-slate-900/30 overflow-hidden">
                      <div className="bg-slate-900/60 px-3.5 py-2 text-[10px] font-mono text-slate-200 font-bold border-b border-slate-800 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>STEP 2: PROVISION USER AND DATABASE</span>
                      </div>
                      <div className="p-3.5 space-y-2">
                        <p className="text-slate-400 text-3xs leading-relaxed">
                          Switch to the postgres superuser context and trigger the interactive SQL terminal CLI:
                        </p>
                        <pre className="p-2 bg-slate-950 rounded-lg font-mono text-[9px] text-emerald-400 overflow-x-auto">
{`sudo -i -u postgres psql`}
                        </pre>
                        <p className="text-slate-400 text-3xs leading-relaxed mt-2.5">
                          Execute these SQL statements inside the prompt to create the sandbox trades schema owner:
                        </p>
                        <pre className="p-2 bg-slate-950 rounded-lg font-mono text-[9px] text-amber-300 overflow-x-auto leading-normal">
{`CREATE DATABASE sokos_db;
CREATE USER soko_user WITH PASSWORD 'secure_merchant_password';
GRANT ALL PRIVILEGES ON DATABASE sokos_db TO soko_user;
ALTER DATABASE sokos_db OWNER TO soko_user;
\\q`}
                        </pre>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="border border-slate-800 rounded-xl bg-slate-900/30 overflow-hidden">
                      <div className="bg-slate-900/60 px-3.5 py-2 text-[10px] font-mono text-slate-200 font-bold border-b border-slate-800 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>STEP 3: RUN THE DATABASE SCHEMA DEFINITIONS</span>
                      </div>
                      <div className="p-3.5 space-y-2">
                        <p className="text-slate-400 text-3xs leading-relaxed">
                          Run our provided SQL file blueprint to generate listing indices and password columns:
                        </p>
                        <pre className="p-2 bg-slate-950 rounded-lg font-mono text-[9px] text-emerald-400 overflow-x-auto">
{`psql -U soko_user -d sokos_db -h localhost -f schema.sql`}
                        </pre>
                      </div>
                    </div>

                    {/* DDL Preview & Copy */}
                    <div className="border border-slate-800 rounded-xl bg-slate-900/30 overflow-hidden">
                      <div className="bg-slate-900/60 px-3.5 py-2 text-[10px] font-mono text-slate-200 font-bold border-b border-slate-800 flex justify-between items-center">
                        <span>SOKOS USERS TABLE DDL CODE</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`-- Users Table Schema
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(100) UNIQUE, -- Unique user login handle
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    avatar_url TEXT,
    password TEXT, -- Account authentication password
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    doc_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verification_doc_type VARCHAR(30) DEFAULT NULL,
    rating DECIMAL(3, 2) NOT NULL DEFAULT 0.00,
    reviews_count INT NOT NULL DEFAULT 0,
    location_name VARCHAR(150) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    onboarded BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);`);
                            alert('PostgreSQL Users table schema copied to clipboard!');
                          }}
                          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-2 py-0.5 rounded text-[8px] uppercase font-sans animate-pulse"
                        >
                          Copy SQL Schema
                        </button>
                      </div>
                      <div className="p-3.5">
                        <pre className="p-2 bg-slate-950 rounded-lg font-mono text-[9px] text-emerald-300 max-h-[160px] overflow-y-auto leading-relaxed">
{`CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(100) UNIQUE, -- Unique user login handle
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    avatar_url TEXT,
    password TEXT, -- Account authentication password
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    doc_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verification_doc_type VARCHAR(30) DEFAULT NULL,
    rating DECIMAL(3, 2) NOT NULL DEFAULT 0.00,
    reviews_count INT NOT NULL DEFAULT 0,
    location_name VARCHAR(150) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    onboarded BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);`}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-950 border-t border-slate-900 text-[10px] font-mono text-slate-500 text-center">
              Sokos Local Craigslist • Designed for VPS High-Availability
            </div>
          </div>
        </div>
      )}
    -->
    
  );

}
*/