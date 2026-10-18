/**
 * Automated Test Suite for FinTrack Phase 3 Paper Trading & Portfolio Learning Module
 * Tests account initialization, order lifecycle, risk safeguards, slippage, fees,
 * cash ledger reconciliation, P&L calculations, episode reset isolation, and mock Eulerpool adapter.
 */

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { prisma } from '../src/prisma.js';
import { paperExecutionEngine } from '../src/services/paperExecutionEngine.js';
import { eulerpoolService } from '../src/services/eulerpoolService.js';

describe('FinTrack Phase 3 Paper Trading Engine Tests', () => {
  let testUserId: string;

  before(async () => {
    // Create a dedicated clean test user
    const testUser = await prisma.user.create({
      data: {
        name: 'Unit Tester',
        email: `tester_${Date.now()}@fintrack.local`,
        handle: `tester_${Date.now()}`,
        cashBalance: 100000.0,
      },
    });
    testUserId = testUser.id;
  });

  after(async () => {
    // Cleanup test user and related records
    if (testUserId) {
      await prisma.user.delete({ where: { id: testUserId } });
    }
  });

  test('1. Account Initialization: creates account with ₹100,000 INR and initial ledger entry', async () => {
    const { account, activeEpisode } = await paperExecutionEngine.getOrCreateAccount(testUserId);
    assert.equal(account.userId, testUserId);
    assert.equal(account.currency, 'INR');
    assert.equal(account.currentCash, 100000.0);
    assert.equal(activeEpisode.episodeNumber, 1);
    assert.equal(activeEpisode.status, 'ACTIVE');

    const ledgerEntries = await prisma.cashLedgerEntry.findMany({
      where: { accountId: account.id, episodeId: activeEpisode.id },
    });
    assert.equal(ledgerEntries.length, 1);
    assert.equal(ledgerEntries[0].entryType, 'INITIAL_CAPITAL');
    assert.equal(ledgerEntries[0].amount, 100000.0);
    assert.equal(ledgerEntries[0].balanceAfter, 100000.0);
  });

  test('2. Successful Simulated BUY: fills at market price with slippage and fee deduction', async () => {
    const res = await paperExecutionEngine.placeOrder({
      userId: testUserId,
      symbol: 'RELIANCE',
      side: 'BUY',
      type: 'MARKET',
      quantity: 10,
    });

    assert.equal(res.success, true);
    assert.equal(res.status, 'FILLED');
    assert.equal(res.shares, 10);
    assert.ok(res.fillPrice! > 0);
    assert.ok(res.fee! > 0);
    assert.ok(res.slippageBps! >= 0);
    assert.ok(res.cashRemaining! < 100000.0);

    // Verify position exists and cost basis is correct
    const { account, activeEpisode } = await paperExecutionEngine.getOrCreateAccount(testUserId);
    const pos = await prisma.paperPosition.findUnique({
      where: {
        accountId_episodeId_symbol: {
          accountId: account.id,
          episodeId: activeEpisode.id,
          symbol: 'RELIANCE',
        },
      },
    });
    assert.ok(pos);
    assert.equal(pos.quantity, 10);
    assert.ok(pos.avgCost > 0);
    assert.equal(pos.totalCostBasis, res.netAmount);

    // Verify cash ledger was updated
    const ledger = await prisma.cashLedgerEntry.findMany({
      where: { accountId: account.id, episodeId: activeEpisode.id },
      orderBy: { timestamp: 'desc' },
    });
    assert.equal(ledger[0].entryType, 'TRADE_BUY');
    assert.equal(ledger[0].amount, -res.netAmount!);
    assert.equal(ledger[0].balanceAfter, account.currentCash);
  });

  test('3. Insufficient Virtual Cash Safeguard: rejects orders exceeding cash balance', async () => {
    const res = await paperExecutionEngine.placeOrder({
      userId: testUserId,
      symbol: 'RELIANCE',
      side: 'BUY',
      type: 'MARKET',
      quantity: 10000, // Requires ~3 crore, user has < 1 lakh
    });

    assert.equal(res.success, false);
    assert.equal(res.status, 'REJECTED');
    assert.match(res.message, /Insufficient cash/i);
  });

  test('4. Short Selling Safeguard: rejects selling more shares than owned', async () => {
    const res = await paperExecutionEngine.placeOrder({
      userId: testUserId,
      symbol: 'RELIANCE',
      side: 'SELL',
      type: 'MARKET',
      quantity: 50, // User only owns 10
    });

    assert.equal(res.success, false);
    assert.equal(res.status, 'REJECTED');
    assert.match(res.message, /Insufficient shares/i);
  });

  test('5. Invalid Quantities & Symbols Validation: rejects non-positive or non-integer amounts', async () => {
    const res1 = await paperExecutionEngine.placeOrder({
      userId: testUserId,
      symbol: 'RELIANCE',
      side: 'BUY',
      type: 'MARKET',
      quantity: -5,
    });
    assert.equal(res1.success, false);

    const res2 = await paperExecutionEngine.placeOrder({
      userId: testUserId,
      symbol: 'RELIANCE',
      side: 'BUY',
      type: 'MARKET',
      quantity: 2.5 as any,
    });
    assert.equal(res2.success, false);
  });

  test('6. Successful Simulated SALE & Realized P&L Calculation', async () => {
    // Sell 5 of the 10 RELIANCE shares
    const res = await paperExecutionEngine.placeOrder({
      userId: testUserId,
      symbol: 'RELIANCE',
      side: 'SELL',
      type: 'MARKET',
      quantity: 5,
    });

    assert.equal(res.success, true);
    assert.equal(res.status, 'FILLED');
    assert.equal(res.shares, 5);

    // Check remaining position
    const { account, activeEpisode } = await paperExecutionEngine.getOrCreateAccount(testUserId);
    const pos = await prisma.paperPosition.findUnique({
      where: {
        accountId_episodeId_symbol: {
          accountId: account.id,
          episodeId: activeEpisode.id,
          symbol: 'RELIANCE',
        },
      },
    });
    assert.ok(pos);
    assert.equal(pos.quantity, 5);
    // Realized P&L is recorded
    assert.notEqual(pos.realizedPnl, undefined);

    // Check ledger entry
    const latestLedger = await prisma.cashLedgerEntry.findFirst({
      where: { accountId: account.id, episodeId: activeEpisode.id },
      orderBy: { timestamp: 'desc' },
    });
    assert.equal(latestLedger?.entryType, 'TRADE_SELL');
    assert.ok(latestLedger!.amount > 0);
  });

  test('7. Limit Order Placement & Queuing', async () => {
    // Place a buy limit well below market price so it stays queued
    const res = await paperExecutionEngine.placeOrder({
      userId: testUserId,
      symbol: 'TCS',
      side: 'BUY',
      type: 'LIMIT',
      quantity: 2,
      limitPrice: 2000.0, // Market is ~4180
    });

    assert.equal(res.success, true);
    assert.equal(res.status, 'OPEN');
    assert.ok(res.orderId);

    // Verify order is persisted in OPEN state
    const order = await prisma.paperOrder.findUnique({
      where: { id: res.orderId },
    });
    assert.equal(order?.status, 'OPEN');
    assert.equal(order?.limitPrice, 2000.0);
  });

  test('8. Order Cancellation: cancels OPEN limit order', async () => {
    const { account, activeEpisode } = await paperExecutionEngine.getOrCreateAccount(testUserId);
    const openOrder = await prisma.paperOrder.findFirst({
      where: { accountId: account.id, episodeId: activeEpisode.id, status: 'OPEN' },
    });
    assert.ok(openOrder);

    const cancelRes = await paperExecutionEngine.cancelOrder(testUserId, openOrder.id);
    assert.equal(cancelRes.success, true);

    const updated = await prisma.paperOrder.findUnique({ where: { id: openOrder.id } });
    assert.equal(updated?.status, 'CANCELLED');
  });

  test('9. Idempotency Check: duplicate clientOrderId is intercepted', async () => {
    const clientOrderId = `idempotent_${Date.now()}`;
    const first = await paperExecutionEngine.placeOrder({
      userId: testUserId,
      symbol: 'INFY',
      side: 'BUY',
      type: 'MARKET',
      quantity: 1,
      clientOrderId,
    });
    assert.equal(first.success, true);

    const duplicate = await paperExecutionEngine.placeOrder({
      userId: testUserId,
      symbol: 'INFY',
      side: 'BUY',
      type: 'MARKET',
      quantity: 1,
      clientOrderId,
    });
    assert.equal(duplicate.orderId, first.orderId);
    assert.match(duplicate.message, /Duplicate order detected/i);
  });

  test('10. Simulation Reset & Historical Episode Isolation: resets capital to ₹100,000 without erasing history', async () => {
    const { account: initialAccount, activeEpisode: initialEpisode } = await paperExecutionEngine.getOrCreateAccount(testUserId);
    const initialEpisodeNum = initialEpisode.episodeNumber;

    // Trigger reset
    const resetRes = await paperExecutionEngine.resetSimulation(testUserId, 'Testing audit reset');
    assert.equal(resetRes.success, true);
    assert.equal(resetRes.newEpisodeNumber, initialEpisodeNum + 1);

    // Verify account balance is restored to 100,000
    const { account: resetAccount, activeEpisode: newActiveEpisode } = await paperExecutionEngine.getOrCreateAccount(testUserId);
    assert.equal(resetAccount.currentCash, 100000.0);
    assert.equal(newActiveEpisode.episodeNumber, initialEpisodeNum + 1);
    assert.equal(newActiveEpisode.status, 'ACTIVE');

    // Verify previous episode still exists in database with status RESET
    const oldEpisode = await prisma.paperTradingEpisode.findUnique({
      where: { id: initialEpisode.id },
    });
    assert.equal(oldEpisode?.status, 'RESET');

    // Verify previous episode orders and ledger entries are still preserved for audit
    const oldOrders = await prisma.paperOrder.findMany({
      where: { accountId: initialAccount.id, episodeId: initialEpisode.id },
    });
    assert.ok(oldOrders.length > 0);
  });

  test('11. Cash Ledger & Position Reconciliation: ledger balance matches account current cash', async () => {
    const { account, activeEpisode } = await paperExecutionEngine.getOrCreateAccount(testUserId);
    const latestLedger = await prisma.cashLedgerEntry.findFirst({
      where: { accountId: account.id, episodeId: activeEpisode.id },
      orderBy: { timestamp: 'desc' },
    });

    assert.ok(latestLedger);
    assert.equal(latestLedger.balanceAfter, account.currentCash);
  });

  test('12. Market Data Adapter: returns normalized quotes with proper data source and delay notice', async () => {
    const quote = await eulerpoolService.getQuote('RELIANCE');
    assert.equal(quote.symbol, 'RELIANCE');
    assert.equal(quote.exchange, 'NSE');
    assert.equal(quote.currency, 'INR');
    assert.ok(quote.price > 0);
    assert.ok(['Eulerpool', 'Local NSE Reference'].includes(quote.dataSource));
    assert.ok(['fresh', 'delayed', 'stale', 'unavailable'].includes(quote.freshnessStatus));
    assert.ok(quote.receivedTimestamp);
  });

  test('13. Market Data Search: searches supported NSE symbols catalog', async () => {
    const results = await eulerpoolService.searchInstruments('TATA');
    assert.ok(results.length > 0);
    const tataMotors = results.find(r => r.symbol.includes('TATA'));
    assert.ok(tataMotors);
  });

  test('14. Security: API key is not leaked in market quotes or errors', async () => {
    const quote = await eulerpoolService.getQuote('HDFCBANK');
    const quoteStr = JSON.stringify(quote);
    if (process.env.EULERPOOL_API_KEY) {
      assert.equal(quoteStr.includes(process.env.EULERPOOL_API_KEY), false);
    }
  });
});
