# Sokos Marketplace

A production-ready SaaS marketplace platform connecting buyers and sellers, with M‑Pesa payment integration and a Telegram bot notification layer.

---

## Monorepo Structure

```
sokos-web/
├─ frontend/                  # React 19 + Vite 6 + Tailwind CSS UI
│   ├─ src/
│   │   ├─ pages/             # Route-level components (React Router)
│   │   ├─ components/        # Reusable UI widgets
│   │   ├─ hooks/             # Custom React hooks
│   │   ├─ services/          # API client wrappers
│   │   ├─ contexts/          # React Context providers (auth, cart…)
│   │   ├─ types/             # UI-specific types (re-exports shared)
│   │   └─ utils/             # Formatters, validators, helpers
│   ├─ public/
│   ├─ package.json
│   ├─ tsconfig.json
│   └─ vite.config.ts
│
├─ backend/                   # Node.js + Express API server
│   ├─ src/
│   │   ├─ routes/            # Express route definitions
│   │   ├─ controllers/       # Request handling (validate → delegate)
│   │   ├─ services/          # Business logic
│   │   │   ├─ mpesa/         # M-Pesa STK Push payment service
│   │   │   └─ telegram/      # Telegram bot worker
│   │   ├─ middleware/        # Auth, error handling, logging
│   │   ├─ db/                # PostgreSQL connection pool
│   │   ├─ models/            # Repository pattern data-access layer
│   │   ├─ utils/             # Logger, crypto, date helpers
│   │   └─ config/            # Environment-based configuration
│   ├─ server.ts              # Application entry point
│   ├─ package.json
│   └─ tsconfig.json
│
├─ shared/                    # Pure TypeScript shared between front & back
│   ├─ types/                 # Core domain interfaces (User, Listing, Order…)
│   ├─ utils/                 # Pure helper functions
│   └─ tsconfig.json
│
├─ database/                  # PostgreSQL schema & migrations
│   ├─ schema.sql             # Baseline schema
│   ├─ migrations/            # Incremental Knex migration files
│   └─ README.md
│
├─ scripts/                   # Dev / build / migration / CI scripts
│   ├─ dev.bat / dev.sh       # Start both servers (uses concurrently)
│   ├─ build.bat / build.sh   # Production build
│   ├─ migrate.bat/migrate.sh # Run DB migrations
│   └─ ci/                    # GitHub Actions helper scripts
│
├─ logs/                      # PM2 log output (gitignored in production)
├─ ecosystem.config.js        # PM2 process definitions
├─ package.json               # Workspace root (npm workspaces)
└─ .env.example               # Environment variable template
```

---

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 14+
- npm 10+

### 1. Install all dependencies
```bash
npm install
```

### 2. Set up environment
```bash
cp .env.example .env
# Edit .env with your DB credentials, M-Pesa keys, Telegram token, etc.
```

### 3. Run database migrations
```bash
scripts\migrate.bat        # Windows
./scripts/migrate.sh       # Linux / macOS
```

### 4. Start in development mode
```bash
scripts\dev.bat            # Windows  (starts frontend + backend concurrently)
./scripts/dev.sh           # Linux / macOS
```

The frontend will be available at **http://localhost:5173** and the backend API at **http://localhost:3001**.

---

## Production Deployment (PM2)

```bash
# Build both packages
scripts\build.bat

# Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 6, Tailwind CSS 4, TypeScript |
| Backend | Node.js, Express 4, TypeScript |
| Database | PostgreSQL 14+ with Knex migrations |
| Payments | M-Pesa STK Push (Safaricom Daraja API) |
| Bot | Telegram Bot API (`node-telegram-bot-api`) |
| Process Manager | PM2 (cluster mode for API, fork for bot) |
| CI/CD | GitHub Actions |

---

## Contributing

1. Create a feature branch from `main`.
2. Make changes in the relevant workspace (`frontend/`, `backend/`, or `shared/`).
3. Run `npm run lint` to check types across all workspaces.
4. Open a pull request with a clear description.
