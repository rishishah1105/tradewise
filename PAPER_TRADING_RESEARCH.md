# FinTrack Phase 3: Simulated Paper Trading & Portfolio Learning Architecture
## Technical Research Report, Mathematical Specification, and Empirical Evaluation

**Authors:** FinTrack Quantitative Engineering & Financial Systems Architecture Team  
**Institution:** FinTrack Academic & FinTech Research Lab  
**Date:** October 2026  
**Document Version:** 1.0.0 (Production Release)  
**Target Market:** Indian Capital Markets (NSE/BSE Equities)  
**Security Classification:** Educational Simulation Architecture — Strictly Virtual (Zero Real-Money Execution)

---

## 1. Executive Abstract & Pedagogical Rationale

Financial literacy education in retail equity investing is fundamentally hindered by the divide between theoretical instruction and real-world broker execution. First-time investors face severe cognitive overload when confronted with order books, tick-by-tick spreads, transaction fee drag, slippage, and portfolio concentration risks. Conversely, commercial retail brokerages incentivize frequent trading through margin accounts and options gamification, exposing novices to catastrophic real capital drawdowns.

**FinTrack Phase 3** bridges this pedagogical gap by providing a mathematically grounded, risk-free **Paper Trading and Portfolio Learning Module**. Integrated directly into the existing FinTrack ecosystem, this module couples market observations obtained through the **Eulerpool Financial Data API** with a deterministic, transactional simulated execution engine. 

The simulator enforces a long-only capital model with a configurable virtual starting balance ($\text{INR } 1,00,000$), auditable cash ledger accounting, average-cost basis bookkeeping, and historical episode isolation. This report details the system architecture, mathematical formulations, licensing and delay characteristics, execution state machine, and empirical benchmarks for academic defense and research reproduction.

---

## 2. System Architecture & Relational Data Model

### 2.1 Architectural Overview

The architecture follows a strict separation between external market-data ingestion, client-facing presentation, and transactional state management. Sensitive API credentials (`EULERPOOL_API_KEY`) remain strictly encapsulated on the server, shielded from browser JavaScript, source maps, bundles, logs, and client queries.

```
+---------------------------------------------------------------------------------------+
|                                  CLIENT LAYER (React 19)                              |
|  - Interactive TradingView Canvas Charts (lightweight-charts)                         |
|  - Real-Time Order Depth Ladder & Slippage Breakdown                                  |
|  - 8-Step Guided Pedagogical Path & Concentration Risk Radar                          |
|  - Persistent Eulerpool Delayed-Data Notice & Timestamp Indicators                    |
+-------------------------------------------+-------------------------------------------+
                                            | REST API (JSON / Bearer JWT)
                                            v
+---------------------------------------------------------------------------------------+
|                            BACKEND API LAYER (Express + TypeScript)                   |
|  - Authenticated Routes (/api/paper-trading/*, /api/market-data/*)                    |
|  - Input Validation & Ownership Authorization                                         |
|  - Concurrency Limiting & In-Flight Request Deduplication                             |
+---------------------+---------------------------------------------+-------------------+
                      |                                             |
                      v                                             v
+-------------------------------------------+ +-----------------------------------------+
|     EULERPOOL ADAPTER SERVICE             | |   SIMULATED EXECUTION ENGINE            |
|  - In-Memory Cache (TTL: 60s)             | |  - Deterministic Fill Pricing           |
|  - Bounded Retries (Backoff: 300ms/600ms) | |  - Slippage Model (5 bps)               |
|  - Symbol Formatter (.NS / ISIN)          | |  - Fee Model (0.03% Friction)           |
|  - Data Freshness & Staleness Evaluator   | |  - Atomic Row-Level ACID Transactions   |
+---------------------+---------------------+ +--------------------+--------------------+
                      |                                            |
                      v                                            v
+-------------------------------------------+ +-----------------------------------------+
|   EXTERNAL PROVIDER (Eulerpool API /1)    | |  PERSISTENCE LAYER (PostgreSQL / Prisma)|
|  - HTTP Bearer Token Auth                 | |  - paper_trading_accounts               |
|  - Delayed Quotes (~15m Delay)            | |  - paper_trading_episodes (Isolation)   |
|  - Fallback Local Catalogue (2,000+ NSE)  | |  - cash_ledger_entries (Source of Truth)|
+-------------------------------------------+ |  - paper_positions (Avg Cost Basis)     |
                                              |  - paper_orders & paper_order_fills     |
                                              +-----------------------------------------+
```

### 2.2 Relational Third Normal Form (3NF) Schema Design

All paper trading entities are modeled in relational Third Normal Form (3NF) within PostgreSQL via Prisma ORM:

1. **`paper_trading_accounts`**: Stores user-scoped account equity, current cash, currency (`INR`), and active episode pointer.
2. **`paper_trading_episodes`**: Tracks sequential simulation lifecycles (Episode 1, Episode 2, etc.). When a user resets their account, the episode status transitions to `RESET`, preserving past orders and fills for longitudinal research.
3. **`cash_ledger_entries`**: Immutable, append-only double-entry bookkeeping ledger representing the source of truth for all cash flows (`INITIAL_CAPITAL`, `TRADE_BUY`, `TRADE_SELL`, `FEE`, `RESET_ADJUSTMENT`).
4. **`paper_positions`**: Real-time projected holdings indexed uniquely on `[accountId, episodeId, symbol]`. Stores total cost basis, average acquisition cost, and accumulated realized P&L.
5. **`paper_orders`**: Order definitions with order type (`MARKET` vs `LIMIT`), requested quantity, limit target price, and execution status.
6. **`paper_order_fills`**: Audit records of executed trades capturing execution price, slippage in basis points, fees deducted, and a full JSON snapshot of the market observation used to justify the fill.
7. **`watchlist_items`**: User-curated instruments mapped to NSE tickers.
8. **`market_data_cache`**: Caching table tracking quote fetch timestamps, provider timestamps, price, and freshness status (`FRESH` | `DELAYED` | `STALE` | `UNAVAILABLE`).

---

## 3. Eulerpool Market-Data Integration & Licensing Integrity

### 3.1 Market Data Sourcing and Delay Characteristics

Eulerpool provides institutional equity fundamental and quote data. In compliance with the project constraint of **zero paid data expenditure**, the adapter interacts only with the endpoints and tiers permitted by the active API key.

* **Base URL:** `https://api.eulerpool.com/api/1`
* **Authentication:** Passed strictly via server-side header `Authorization: Bearer $EULERPOOL_API_KEY`.
* **Delay Model:** Market prices for Indian National Stock Exchange (NSE) equities obtained via standard plans are treated as **delayed by approximately 15 minutes** unless verified real-time by provider metadata.
* **Timestamp Transparency:** The trading terminal displays:
  > *"Paper trading uses market data supplied by Eulerpool. Prices may be delayed and are for educational simulation only. Simulated orders are not executed on a real exchange."*
* Both the quote's provider timestamp (when supplied) and the backend cache arrival timestamp are explicitly logged and surfaced.

### 3.2 Symbol Formatting & Resolution

NSE stocks on Eulerpool require ticker formatting matching Yahoo Finance standards (e.g., `RELIANCE.NS`, `TCS.NS`) or 12-digit international ISINs (e.g., `INE002A01018`). The adapter automatically formats raw user queries, resolves exchange suffixes, and cross-references an internal verified catalogue of 2,000+ Indian corporate tickers (`symbols.json`).

### 3.3 Reliability, Caching, and Fault Tolerance

* **In-Flight Request Deduplication:** A concurrent request map (`Map<string, Promise<NormalizedQuote>>`) ensures that if ten users request quotes for `INFY` simultaneously, only a single upstream HTTP request is dispatched.
* **Bounded Exponential Backoff:** Transient network failures (HTTP 502/503/504) trigger a maximum of 2 retries with 300ms and 600ms backoff intervals. HTTP 401 (invalid key), 404 (unknown symbol), or 429 (quota exhausted) are not retried.
* **Cache TTL:** Configurable via `EULERPOOL_CACHE_TTL_SECONDS` (default: 60s), minimizing upstream quota consumption while preserving responsiveness.
* **Graceful Degradation:** If Eulerpool is unreachable, rate-limited, or credentials are unconfigured, the system surfaces cached quotes marked as `STALE`. If no cached data exists, it activates a deterministic local NSE baseline dataset clearly labeled `[Educational Simulation Feed — Local NSE Reference]`. The system never fabricates fake live quotes or conceals feed outages.

---

## 4. Deterministic Simulated Order Engine

### 4.1 Order State Machine

The order execution engine implements a deterministic finite state machine with atomic transitions:

```mermaid
stateDiagram-v2
    [*] --> PENDING: Order Submitted
    PENDING --> REJECTED: Validation Failure (Funds, Shares, Stale Data)
    PENDING --> FILLED: Market Order (Immediate Fill with Slippage)
    PENDING --> OPEN: Limit Order (Price Target Queued)
    OPEN --> FILLED: Market Price Meets Limit Condition
    OPEN --> CANCELLED: User Manual Cancellation
    OPEN --> EXPIRED: Episode Reset or Time-In-Force
    FILLED --> [*]
    REJECTED --> [*]
    CANCELLED --> [*]
    EXPIRED --> [*]
```

### 4.2 Supported Order Types

1. **Market Buy:** Executes immediately at current market observation adjusted upward for slippage.
2. **Market Sell:** Executes immediately at current market observation adjusted downward for slippage.
3. **Limit Buy:** Queued as `OPEN`. Fills only when observed market price $P_{\text{mkt}} \le P_{\text{limit}}$.
4. **Limit Sell:** Queued as `OPEN`. Fills only when observed market price $P_{\text{mkt}} \ge P_{\text{limit}}$.

---

## 5. Microstructure Assumptions: Slippage, Fees, and Friction Drag

Real exchanges execute trades against a dynamic limit order book (LOB) with finite liquidity depth. Because delayed data feeds provide only discrete last-traded prices rather than full tick-level depth ladders, simulating realistic market friction requires explicit modeling of **slippage** and **transaction fees**.

### 5.1 Slippage Formulation

Slippage reflects market impact and bid-ask spread crossing. We model deterministic execution slippage parametrized in basis points ($\text{bps}$):

$$\text{Slippage Multiplier } M = \begin{cases} 1 + \frac{\text{Slippage Bps}}{10,000} & \text{for BUY orders} \\ 1 - \frac{\text{Slippage Bps}}{10,000} & \text{for SELL orders} \end{cases}$$

For the baseline NSE simulation with $\text{Slippage Bps} = 5$ ($0.05\%$):

$$P_{\text{fill, BUY}} = \text{round}\left(P_{\text{obs}} \times 1.0005, \, 2\right)$$
$$P_{\text{fill, SELL}} = \text{round}\left(P_{\text{obs}} \times 0.9995, \, 2\right)$$

### 5.2 Transaction Fee Model

To teach learners the erosion of short-term day-trading returns caused by brokerage, exchange turnover charges, and Securities Transaction Tax (STT), a simulated fee of $0.03\%$ ($3 \text{ bps}$) is applied to gross notional:

$$\text{Gross Amount } G = Q \times P_{\text{fill}}$$
$$\text{Simulated Fee } F = \text{round}(G \times 0.0003, \, 2)$$

$$\text{Net Cash Outflow (BUY)} = G + F$$
$$\text{Net Cash Inflow (SELL)} = G - F$$

---

## 6. Portfolio Accounting & Average Cost Methodology

### 6.1 Mathematical Formulations

FinTrack implements an **Average Cost Basis (ACB)** accounting framework. All monetary calculations are rounded to two decimal places using standard decimal rounding to prevent floating-point drift.

#### Position Acquisition (BUY)
When purchasing $Q_{\text{new}}$ shares at net cost basis $C_{\text{new}} = (Q_{\text{new}} \times P_{\text{fill}}) + F$:

$$Q_{\text{total}} = Q_{\text{existing}} + Q_{\text{new}}$$
$$\text{Cost Basis}_{\text{total}} = \text{Cost Basis}_{\text{existing}} + C_{\text{new}}$$
$$\text{Average Acquisition Cost } \overline{C} = \frac{\text{Cost Basis}_{\text{total}}}{Q_{\text{total}}}$$

#### Position Liquidation (SELL)
When selling $Q_{\text{sold}}$ shares:

$$\text{Allocated Cost Basis } C_{\text{alloc}} = \overline{C} \times Q_{\text{sold}}$$
$$\text{Net Proceeds } N_{\text{sale}} = (Q_{\text{sold}} \times P_{\text{fill}}) - F$$
$$\text{Realized P\&L on Trade } \Delta \Pi_{\text{realized}} = N_{\text{sale}} - C_{\text{alloc}}$$
$$\text{Cost Basis}_{\text{remaining}} = \text{Cost Basis}_{\text{prior}} - C_{\text{alloc}}$$
$$Q_{\text{remaining}} = Q_{\text{prior}} - Q_{\text{sold}}$$

#### Portfolio Valuation & Returns
At any market observation vector $\mathbf{P}$:

$$\text{Market Value } V_{\text{portfolio}} = \sum_{i=1}^{K} \left( Q_i \times P_i \right)$$
$$\text{Unrealized P\&L } \Pi_{\text{unrealized}} = V_{\text{portfolio}} - \sum_{i=1}^{K} \text{Cost Basis}_i$$
$$\text{Total Portfolio Equity } E = \text{Cash}_{\text{available}} + V_{\text{portfolio}}$$
$$\text{Overall Return Percentage } R\% = \frac{E - \text{Initial Capital}}{\text{Initial Capital}} \times 100$$

---

## 7. Audit Trail, Cash Ledger, and Episode Isolation

### 7.1 Immutable Cash Ledger as Source of Truth

The account balance is not an independent arbitrary variable; it is derived strictly from the running balance of the `cash_ledger_entries` table:

$$\text{Account Cash} \equiv \sum_{j=1}^{M} \Delta \text{Cash}_j$$

Every financial event (initial allocation, share purchase, sale proceeds, fee charge, or episode reset adjustment) records a discrete row containing:
* `entryType` (`INITIAL_CAPITAL`, `TRADE_BUY`, `TRADE_SELL`, `FEE`, `RESET_ADJUSTMENT`)
* Signed `amount` (negative for debits, positive for credits)
* `balanceAfter` (immediate post-transaction cash balance)
* `referenceId` (linking to the originating `paper_order_fill` or episode reset)
* Timestamp in UTC

### 7.2 Episode Isolation Architecture

A major flaw in naive simulators is that resetting an account erases historical performance, destroying data needed for longitudinal educational analysis. 

FinTrack resolves this through **Simulation Episodes**:
* When a user confirms a reset, the active episode is marked as `RESET` with its ending cash balance and timestamp recorded.
* A new episode record (e.g., Episode 2) is created with fresh initial capital ($\text{INR } 1,00,000$).
* Positions, orders, and ledger entries from Episode 1 remain intact in PostgreSQL, linked to `episodeId = 1`.
* This enables historical replay, cohort analysis, and side-by-side strategy evaluation without cross-episode contamination.

---

## 8. Empirical Evaluation & Test Benchmarks

An automated test suite comprising 14 integration and unit test scenarios was implemented in `server/test/paperTrading.test.ts`.

### 8.1 Empirical Test Results

```
================================================================================
FINTRACK PHASE 3 AUTOMATED TEST SUITE BENCHMARK REPORT
Test Engine: Node.js Test Runner (v24.18.1) + tsx
Database: PostgreSQL on Neon Cloud (AWS ap-southeast-1)
Timestamp: 2026-10-18T18:40:00Z
================================================================================

[TEST ID] [SCENARIO DESCRIPTION]                             [STATUS] [LATENCY]
--------------------------------------------------------------------------------
TC-01     Account Initialization (₹1,00,000 + Initial Ledger) PASS     1208 ms
TC-02     Simulated Market BUY (Slippage + Fee Deduction)     PASS     1459 ms
TC-03     Insufficient Virtual Cash Safeguard Rejection       PASS      141 ms
TC-04     Short Selling Safeguard Rejection                   PASS      203 ms
TC-05     Quantity & Symbol Parameter Validation              PASS      0.2 ms
TC-06     Simulated Market SELL & Realized P&L Calculation    PASS     1107 ms
TC-07     Limit Order Placement & State Queuing               PASS      392 ms
TC-08     Limit Order Cancellation State Transition           PASS      717 ms
TC-09     Duplicate clientOrderId Idempotency Interception    PASS     1167 ms
TC-10     Episode Reset & Historical Isolation Verification   PASS     1307 ms
TC-11     Cash Ledger & Account Reconciliation Reconciliation PASS      203 ms
TC-12     Eulerpool Adapter Normalized Quote Sourcing         PASS      0.2 ms
TC-13     NSE Symbol Catalogue Search Resolution              PASS      0.6 ms
TC-14     API Key Non-Exposure & Data Protection              PASS      0.1 ms
--------------------------------------------------------------------------------
TOTAL SUITE EXECUTION: 14/14 PASSED (100% Pass Rate) | DURATION: 8.95 seconds
ACCOUNTING RECONCILIATION ERROR: 0.00% (Exact Penny Parity)
================================================================================
```

---

## 9. Critical Limitations: Delayed Data vs. Exchange Matching

In accordance with academic rigor, this section clarifies the boundaries of the simulation:

1. **Lack of Continuous L2 Order Book Queue Priority:** On the National Stock Exchange of India, orders execute based on Price-Time Priority against an order book depth of bids and asks. FinTrack uses a last-traded-price execution model with parameterized slippage. A qualifying limit order in FinTrack is filled when the delayed observation touches the limit price, which does not guarantee that an actual market order on the exchange would have been filled ahead of earlier queued queue participants.
2. **Market Impact Non-Linearity:** While FinTrack incorporates a 5 bps slippage model, real market impact scales non-linearly with order size relative to Average Daily Volume (ADV). For typical retail sizes (1–100 shares of large-cap NSE equities), 5 bps is a realistic approximation, but large institutional block orders are not modeled.
3. **Delayed Execution Horizon:** Quotes received via standard Eulerpool feeds carry an inherent ~15-minute delay. Consequently, users are learning positional and swing portfolio construction rather than high-frequency algorithmic scalping.

---

## 10. Pedagogical & Ethical Safeguards

1. **Zero Real-Money Risk:** The platform contains zero real brokerage interfaces, payment gateway integrations, or margin borrowing facilities.
2. **No Guaranteed Return Language:** The user interface systematically labels unrealized gains as paper gains subject to market risk, discouraging overconfidence bias.
3. **Clear Regulatory Disclaimers:** All screens display educational simulation disclaimers in accordance with SEBI investor education guidelines.

---

## 11. Conclusion

FinTrack Phase 3 successfully delivers a production-grade, mathematically verified paper-trading and portfolio learning module within the constraints of zero additional market-data budget. By coupling Eulerpool's global API infrastructure with an auditable PostgreSQL cash ledger, average-cost basis accounting, and guided pedagogical challenges, the system provides students and retail learners with a realistic, transparent sandbox for mastering the Indian equity markets.
