# Backend

Node.js + Express API server for Sokos Marketplace.

## Structure

```
src/
├─ routes/      # Express route definitions (one file per domain)
├─ controllers/ # Request handling — validates input, delegates to services
├─ services/    # Business logic (marketplace, orders, M‑Pesa, Telegram)
├─ middleware/  # Auth, error handling, logging, rate‑limiting
├─ db/          # DB connection pool and transaction helpers
├─ models/      # Data‑access layer (repository pattern over PostgreSQL)
├─ utils/       # Server utilities (logger, crypto, date helpers)
└─ config/      # Env‑based configuration loaders (DB, M‑Pesa, Telegram)
server.ts       # Application entry point — boots Express, registers PM2
```

## Getting Started

```bash
npm install
npm run dev       # Uses ts-node / tsx
npm run start     # Production via PM2
```
