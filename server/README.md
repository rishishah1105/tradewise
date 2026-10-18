# TradeWise Backend & PostgreSQL Integration Guide

This directory contains the production-ready Node.js + Express + Prisma ORM backend for TradeWise, fully integrated with **PostgreSQL**.

---

## 🏗 Architecture Overview

```
tradewise/
├── server/                     # Backend API & Database
│   ├── prisma/
│   │   └── schema.prisma       # Type-safe PostgreSQL Models & Relations
│   ├── src/
│   │   ├── controllers/        # Profile, Portfolio, Learning & Leaderboard logic
│   │   ├── routes/             # RESTful API route definitions (/api/...)
│   │   ├── index.ts            # Express server entry point & health check
│   │   └── prisma.ts           # PrismaClient connection singleton & health ping
│   ├── .env                    # Connection string config (PostgreSQL URL)
│   └── package.json
└── src/                        # React Frontend
    ├── services/api.ts         # Graceful fallback API client
    ├── components/
    │   └── DatabaseStatusBadge.tsx  # Live PostgreSQL connection indicator
    └── context/AppContext.tsx  # Automatic state synchronization
```

---

## 🗄 PostgreSQL Schema Models

The backend maps to the following Prisma models in `prisma/schema.prisma`:

| Model | Description |
|---|---|
| `User` | Profile info, XP, Level, Streak, Virtual Cash & Starting Balance |
| `PaperTradingAccount` | Dedicated virtual account isolated per user with currency & cash balance |
| `PaperTradingEpisode` | Simulation lifecycle versioning; resets start new episodes without destroying past audit history |
| `CashLedgerEntry` | Immutable, append-only cash ledger representing the official source of truth |
| `PaperPosition` | Long-only holdings with average acquisition cost, total cost basis & realized P&L |
| `PaperOrder` | Order definitions (MARKET / LIMIT) with state machine & client idempotency |
| `PaperOrderFill` | Executed fill audit record with slippage, fees, and market observation snapshot |
| `WatchlistItem` | Personal user watchlist of tracked NSE instruments |
| `MarketDataCache` | Cached Eulerpool quotes with fetch timestamps & delay status |
| `LearningChallengeProgress` | Progress tracking for educational portfolio challenges |
| `PortfolioHolding` | (Legacy) Phase 1 & 2 holding model for backward compatibility |
| `TradeOrder` | (Legacy) Phase 1 & 2 order model for backward compatibility |
| `TradeLog` | (Legacy) Phase 1 & 2 trade log for backward compatibility |

---

## ⚡ Phase 3: Paper Trading & Eulerpool Market Data Configuration

### Environment Variables (`server/.env`)

```env
# Database
PORT=5000
DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-xyz.us-east-2.aws.neon.tech/tradewise?sslmode=require"

# Eulerpool Market Data Adapter
EULERPOOL_API_KEY="your_api_key_here"
EULERPOOL_BASE_URL="https://api.eulerpool.com/api/1"
EULERPOOL_TIMEOUT_SECONDS=10
EULERPOOL_CACHE_TTL_SECONDS=60

# Paper Trading Simulation Engine
PAPER_TRADING_INITIAL_CASH_INR=100000
PAPER_TRADING_MAX_QUOTE_AGE_SECONDS=900
PAPER_TRADING_SLIPPAGE_BPS=5
PAPER_TRADING_FEE_MODEL="percentage_0.03"
```

---

## 🧪 Automated Testing

FinTrack includes a comprehensive automated test suite testing account initialization, market buy/sell, limit orders, slippage, fees, cash ledger reconciliation, episode resets, and Eulerpool adapter fallbacks:

```bash
# Run server test suite from root
npm run test:server

# Or inside server directory
cd server && npm test
```

---

## 🚀 Quick Setup Instructions

### 1. Configure PostgreSQL Connection String

Open `server/.env` (or create it from `server/.env.example`) and insert your PostgreSQL connection URL.

#### Option A: Neon Cloud PostgreSQL (Free & Instant)
1. Go to [https://neon.tech](https://neon.tech) and create a free project.
2. Copy the connection string from the Neon dashboard.
3. In `server/.env`:
```env
PORT=5000
DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-xyz-123456.us-east-2.aws.neon.tech/tradewise?sslmode=require"
```

---

### 2. Push Database Schema to PostgreSQL

From the root of the project:
```bash
npm run db:push
```
*Prisma will connect to your PostgreSQL database, automatically create all required tables, indexes, and foreign keys!*

---

### 3. Start the Backend Server

From the root of the project:
```bash
npm run server
```

The server will start at:
- **API URL:** `http://localhost:5000`
- **Health Check:** `http://localhost:5000/health`
- **Paper Trading Endpoints:** `http://localhost:5000/api/paper-trading/*`
- **Market Data Endpoints:** `http://localhost:5000/api/market-data/*`

---

### 4. Interactive Database GUI (Prisma Studio)

To inspect, edit, or test data directly in your PostgreSQL database through a visual web interface:
```bash
npm run db:studio
```
*Opens Prisma Studio at `http://localhost:5555`.*

---

## 🛡 Safe Offline Fallback

If the server or database is not yet running:
- TradeWise **automatically runs in offline local storage mode**.
- None of your progress, simulated trades, or streak data will be lost.
- When you start the backend, clicking **"Test Connection"** on the Database badge will seamlessly reconnect and sync your data with PostgreSQL.

