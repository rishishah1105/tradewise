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
| `PortfolioHolding` | Portfolio positions with symbol, shares, and weighted average cost |
| `TradeOrder` | Pending & executed Limit/Market orders |
| `TradeLog` | Historical paper trade logs with timestamps & transaction values |
| `MasteredConcept` | Concept progression, quiz completion & scores |
| `UserBadge` | Milestone achievements & unlocked badges |
| `ActivityLog` | Daily activity frequency tracking (powers the Heatmap & LeetCode calendar) |
| `DailyQuestState` | Daily rotating quests and completion status |

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

#### Option B: Supabase Cloud PostgreSQL
1. Create a project at [https://supabase.com](https://supabase.com).
2. Go to **Project Settings** -> **Database** -> **Connection string** (URI).
3. In `server/.env`:
```env
PORT=5000
DATABASE_URL="postgresql://postgres.YOUR_PROJECT_REF:YOUR_PASSWORD@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require"
```

#### Option C: Local PostgreSQL
If you have PostgreSQL installed locally on your computer:
```env
PORT=5000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tradewise?schema=public"
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
