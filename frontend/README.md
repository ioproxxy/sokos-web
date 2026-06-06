# Frontend

React + Vite client application for Sokos Marketplace.

## Structure

```
src/
├─ pages/       # Route‑level components (React Router)
├─ components/  # Reusable UI widgets
├─ hooks/       # Custom React hooks
├─ services/    # API client wrappers (REST calls to backend)
├─ contexts/    # React Context providers (auth, cart, etc.)
├─ types/       # UI‑specific types (re‑exports from shared/types)
└─ utils/       # Formatting, validation and other UI helpers
```

## Getting Started

```bash
npm install
npm run dev
```
