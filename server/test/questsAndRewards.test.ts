/**
 * Comprehensive Automated Regression Test Suite for TradeWise & FinTrack:
 * - Daily Quest Lifecycles (Completion & Claiming)
 * - Trading Execution & Paper Order Quest Hooks
 * - Centralized XP Ledger & Authoritative Balances
 * - Leaderboard Synchronization
 * - Strict Per-User Data Isolation (Account A vs Account B)
 * - Daily Period Boundaries & Rollover Idempotency
 */

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { prisma } from '../src/prisma.js';
import { authService } from '../src/services/authService.js';
import { rewardService, getDateKey } from '../src/services/rewardService.js';
import { paperExecutionEngine } from '../src/services/paperExecutionEngine.js';

describe('Daily Quests, Trading Rewards, Leaderboard XP & Account Isolation Test Suite', () => {
  let userA: any;
  let userB: any;
  let sessionTokenA: string;
  let sessionTokenB: string;

  const timestamp = Date.now();
  const emailA = `trader.quest.a.${timestamp}@tradewise.internal`;
  const emailB = `trader.quest.b.${timestamp}@tradewise.internal`;
  const googleSubA = `sub-quest-a-${timestamp}`;
  const googleSubB = `sub-quest-b-${timestamp}`;

  const todayKey = getDateKey();
  const tomorrowKey = '2026-10-21';

  before(async () => {
    // Create User A
    userA = await authService.findOrCreateGoogleUser({
      sub: googleSubA,
      email: emailA,
      name: 'Alpha Trader',
      avatarUrl: 'https://example.com/alpha.jpg',
      emailVerified: true,
    });
    sessionTokenA = await authService.createSession(userA.id);

    // Create User B
    userB = await authService.findOrCreateGoogleUser({
      sub: googleSubB,
      email: emailB,
      name: 'Beta Investor',
      avatarUrl: 'https://example.com/beta.jpg',
      emailVerified: true,
    });
    sessionTokenB = await authService.createSession(userB.id);
  });

  after(async () => {
    try {
      const userIds = [userA?.id, userB?.id].filter(Boolean);
      for (const uid of userIds) {
        await prisma.xpLedgerEntry.deleteMany({ where: { userId: uid } });
        await prisma.dailyQuestState.deleteMany({ where: { userId: uid } });
        await prisma.tradeOrder.deleteMany({ where: { userId: uid } });
        await prisma.paperOrderFill.deleteMany({ where: { order: { account: { userId: uid } } } });
        await prisma.paperOrder.deleteMany({ where: { account: { userId: uid } } });
        await prisma.paperPosition.deleteMany({ where: { account: { userId: uid } } });
        await prisma.cashLedgerEntry.deleteMany({ where: { account: { userId: uid } } });
        await prisma.paperTradingEpisode.deleteMany({ where: { account: { userId: uid } } });
        await prisma.paperTradingAccount.deleteMany({ where: { userId: uid } });
        await prisma.session.deleteMany({ where: { userId: uid } });
        await prisma.user.delete({ where: { id: uid } }).catch(() => {});
      }
    } catch (err) {
      console.warn('[Test Cleanup] Warning during teardown:', err);
    }
  });

  // --------------------------------------------------------------------------
  // 1. Initial State & Unclaimed Quests
  // --------------------------------------------------------------------------

  test('1. Newly authenticated user has 0 XP and canonical uncompleted daily quests', async () => {
    const questsResponse = await rewardService.getDailyQuestsForUser(userA.id);
    assert.ok(questsResponse?.quests?.length >= 3, 'User should have at least 3 featured quests');

    const firstTradeQuest = questsResponse.quests.find((q: any) => q.id === 'quest-first-trade');
    assert.ok(firstTradeQuest, 'First trade quest must be present');
    assert.strictEqual(firstTradeQuest.progress, 0, 'Initial progress must be 0');
    assert.strictEqual(firstTradeQuest.completed, false, 'Initial quest status must be incomplete');
    assert.strictEqual(firstTradeQuest.claimed, false, 'Initial quest must not be claimed');
    assert.strictEqual(firstTradeQuest.target, 1, 'Target should be 1 trade');

    const userRecord = await prisma.user.findUnique({ where: { id: userA.id } });
    assert.strictEqual(userRecord?.xp, 0, 'Initial XP must be 0');
  });

  // --------------------------------------------------------------------------
  // 2. Failed Trades Do Not Advance Quests
  // --------------------------------------------------------------------------

  test('2. A failed trade (e.g. selling unowned stock) is rejected and does NOT complete quest', async () => {
    // Attempt to sell stock that user doesn't own
    const rejectedRes = await paperExecutionEngine.placeOrder({
      userId: userA.id,
      symbol: 'RELIANCE',
      side: 'SELL',
      type: 'MARKET',
      quantity: 10,
    });

    assert.strictEqual(rejectedRes.success, false, 'Short selling without shares must fail');
    assert.strictEqual(rejectedRes.status, 'REJECTED');

    // Verify quest progress remains 0
    const questsResponse = await rewardService.getDailyQuestsForUser(userA.id);
    const firstTradeQuest = questsResponse.quests.find((q: any) => q.id === 'quest-first-trade');
    assert.strictEqual(firstTradeQuest?.progress, 0, 'Failed trade must not increment progress');
    assert.strictEqual(firstTradeQuest?.completed, false, 'Failed trade must not complete quest');
  });

  // --------------------------------------------------------------------------
  // 3. Successful First Trade Completes Quest Separately From Claiming
  // --------------------------------------------------------------------------

  test('3. Successful first paper trade completes "quest-first-trade" without auto-claiming XP', async () => {
    // Execute a valid market buy order of 1 share of TCS
    const tradeResult = await paperExecutionEngine.placeOrder({
      userId: userA.id,
      symbol: 'TCS',
      side: 'BUY',
      type: 'MARKET',
      quantity: 1,
    });

    assert.strictEqual(tradeResult.success, true, 'Trade order should execute successfully');
    assert.strictEqual(tradeResult.status, 'FILLED');

    // Check user quest status from backend
    const questsResponse = await rewardService.getDailyQuestsForUser(userA.id);
    const firstTradeQuest = questsResponse.quests.find((q: any) => q.id === 'quest-first-trade');

    assert.ok(firstTradeQuest, 'First trade quest must exist');
    assert.strictEqual(firstTradeQuest.progress, 1, 'Progress must now be 1');
    assert.strictEqual(firstTradeQuest.completed, true, 'Quest must be completed');
    assert.strictEqual(firstTradeQuest.claimed, false, 'Quest must NOT be auto-claimed');

    // User XP should remain 0 until manually claimed
    const userRecord = await prisma.user.findUnique({ where: { id: userA.id } });
    assert.strictEqual(userRecord?.xp, 0, 'XP must not be awarded before manual claim');
  });

  // --------------------------------------------------------------------------
  // 4. Repeated Trades Advance Cumulative Quests Without Corrupting Single-Trade Quests
  // --------------------------------------------------------------------------

  test('4. Repeated trade advances "quest-trade-mastery" (target: 3) without double-completing "quest-first-trade"', async () => {
    // Execute second trade
    const trade2 = await paperExecutionEngine.placeOrder({
      userId: userA.id,
      symbol: 'INFY',
      side: 'BUY',
      type: 'MARKET',
      quantity: 2,
    });
    assert.strictEqual(trade2.success, true);

    const questsResponse = await rewardService.getDailyQuestsForUser(userA.id);
    const firstTradeQuest = questsResponse.quests.find((q: any) => q.id === 'quest-first-trade');
    const masteryQuest = questsResponse.quests.find((q: any) => q.id === 'quest-trade-mastery');

    assert.strictEqual(firstTradeQuest?.progress, 1, 'First trade progress capped at target 1');
    assert.strictEqual(firstTradeQuest?.completed, true);
    assert.strictEqual(masteryQuest?.progress, 2, 'Mastery quest progress should be 2 of 3');
    assert.strictEqual(masteryQuest?.completed, false, 'Mastery quest requires 3 trades to complete');
  });

  // --------------------------------------------------------------------------
  // 5. Incomplete Quest Claim Is Safely Rejected
  // --------------------------------------------------------------------------

  test('5. Attempting to claim an incomplete quest is rejected safely with error code', async () => {
    const claimRes = await rewardService.claimQuestReward(userA.id, 'quest-trade-mastery');
    assert.strictEqual(claimRes.success, false);
    assert.ok(
      claimRes.code === 'QUEST_INCOMPLETE' || claimRes.code === 'QUEST_NOT_STARTED',
      `Unexpected code: ${claimRes.code}`
    );

    // Verify no XP awarded
    const userRecord = await prisma.user.findUnique({ where: { id: userA.id } });
    assert.strictEqual(userRecord?.xp, 0);
  });

  // --------------------------------------------------------------------------
  // 6. Claiming Completed Quest Updates XP & Writes Ledger Entry
  // --------------------------------------------------------------------------

  test('6. Claiming completed quest awards XP and writes audit entry into xp_ledger_entries', async () => {
    const claimRes = await rewardService.claimQuestReward(userA.id, 'quest-first-trade');
    assert.strictEqual(claimRes.success, true);
    assert.strictEqual(claimRes.xpAwarded, 50);
    assert.strictEqual(claimRes.newTotalXp, 50);

    // Verify user balance in database
    const userRecord = await prisma.user.findUnique({ where: { id: userA.id } });
    assert.strictEqual(userRecord?.xp, 50);

    // Verify audit row in xp_ledger_entries
    const ledgerEntries = await prisma.xpLedgerEntry.findMany({
      where: { userId: userA.id, source: 'QUEST', referenceId: 'quest-first-trade' },
    });
    assert.strictEqual(ledgerEntries.length, 1);
    assert.strictEqual(ledgerEntries[0].amount, 50);
    assert.strictEqual(ledgerEntries[0].balanceAfter, 50);

    // Verify quest state now reflects claimed
    const questState = await prisma.dailyQuestState.findUnique({
      where: {
        userId_dateKey_questId: { userId: userA.id, dateKey: todayKey, questId: 'quest-first-trade' },
      },
    });
    assert.strictEqual(questState?.claimed, true);
    assert.ok(questState?.claimedAt !== null);
  });

  // --------------------------------------------------------------------------
  // 7. Repeated or Concurrent Claims Are Idempotent (No Double XP)
  // --------------------------------------------------------------------------

  test('7. Repeated or concurrent claim requests return ALREADY_CLAIMED and never award double XP', async () => {
    // Attempt second claim
    const secondClaim = await rewardService.claimQuestReward(userA.id, 'quest-first-trade');
    assert.strictEqual(secondClaim.success, false);
    assert.strictEqual(secondClaim.code, 'ALREADY_CLAIMED');

    // Run 5 concurrent claims in parallel
    const parallelClaims = await Promise.all([
      rewardService.claimQuestReward(userA.id, 'quest-first-trade'),
      rewardService.claimQuestReward(userA.id, 'quest-first-trade'),
      rewardService.claimQuestReward(userA.id, 'quest-first-trade'),
      rewardService.claimQuestReward(userA.id, 'quest-first-trade'),
      rewardService.claimQuestReward(userA.id, 'quest-first-trade'),
    ]);

    for (const res of parallelClaims) {
      assert.strictEqual(res.success, false);
      assert.strictEqual(res.code, 'ALREADY_CLAIMED');
    }

    // Verify total XP is STILL exactly 50
    const userRecord = await prisma.user.findUnique({ where: { id: userA.id } });
    assert.strictEqual(userRecord?.xp, 50, 'XP must never duplicate');

    const totalLedger = await prisma.xpLedgerEntry.findMany({ where: { userId: userA.id } });
    assert.strictEqual(totalLedger.length, 1, 'Only one ledger entry should exist');
  });

  // --------------------------------------------------------------------------
  // 8. Leaderboard Score Consistency
  // --------------------------------------------------------------------------

  test('8. Leaderboard query reads authoritative XP directly matching user profile', async () => {
    const topUsers = await prisma.user.findMany({
      where: { id: userA.id },
      select: { id: true, xp: true, level: true },
    });
    assert.strictEqual(topUsers[0].xp, 50, 'Leaderboard data must match authoritative user XP');
  });

  // --------------------------------------------------------------------------
  // 9. Account Isolation (Account A vs Account B)
  // --------------------------------------------------------------------------

  test('9. Account B has independent quest states and is NOT affected by Account A\'s claimed status', async () => {
    // Fetch quests for Account B
    const questsB = await rewardService.getDailyQuestsForUser(userB.id);
    const firstTradeB = questsB.quests.find((q: any) => q.id === 'quest-first-trade');

    assert.ok(firstTradeB);
    assert.strictEqual(firstTradeB.progress, 0, 'Account B must have 0 progress');
    assert.strictEqual(firstTradeB.completed, false, 'Account B must be incomplete');
    assert.strictEqual(firstTradeB.claimed, false, 'Account B must NOT be claimed');

    // Verify Account B XP is 0
    const userBRecord = await prisma.user.findUnique({ where: { id: userB.id } });
    assert.strictEqual(userBRecord?.xp, 0);

    // Account B places a trade
    const tradeB = await paperExecutionEngine.placeOrder({
      userId: userB.id,
      symbol: 'HDFCBANK',
      side: 'BUY',
      type: 'MARKET',
      quantity: 5,
    });
    assert.strictEqual(tradeB.success, true);

    // Account B now completes first-trade quest
    const updatedQuestsB = await rewardService.getDailyQuestsForUser(userB.id);
    const updatedFirstTradeB = updatedQuestsB.quests.find((q: any) => q.id === 'quest-first-trade');
    assert.strictEqual(updatedFirstTradeB?.completed, true);
    assert.strictEqual(updatedFirstTradeB?.claimed, false);

    // Account B claims its reward
    const claimResB = await rewardService.claimQuestReward(userB.id, 'quest-first-trade');
    assert.strictEqual(claimResB.success, true);
    assert.strictEqual(claimResB.xpAwarded, 50);

    // Verify Account A state remained completely untouched
    const userARecord = await prisma.user.findUnique({ where: { id: userA.id } });
    assert.strictEqual(userARecord?.xp, 50, 'Account A XP must remain 50');

    const questsA = await rewardService.getDailyQuestsForUser(userA.id);
    const firstTradeA = questsA.quests.find((q: any) => q.id === 'quest-first-trade');
    assert.strictEqual(firstTradeA?.claimed, true, 'Account A remains claimed');
  });

  // --------------------------------------------------------------------------
  // 10. Daily Rollover & Historical Integrity
  // --------------------------------------------------------------------------

  test('10. Daily rollover creates new eligible period without erasing lifetime XP or historical ledger', async () => {
    // Tomorrow's date key
    const tomorrowQuestsA = await rewardService.getDailyQuestsForUser(userA.id, tomorrowKey);
    const tomorrowFirstTrade = tomorrowQuestsA.quests.find((q: any) => q.id === 'quest-first-trade');

    // On tomorrow's date, quest is clean/unclaimed for the new day
    assert.strictEqual(tomorrowFirstTrade?.progress, 0);
    assert.strictEqual(tomorrowFirstTrade?.completed, false);
    assert.strictEqual(tomorrowFirstTrade?.claimed, false);

    // User A executes a trade on tomorrow's date
    await rewardService.recordQuestProgress(userA.id, 'TRADE', 1, { customDateKey: tomorrowKey });

    // Tomorrow's quest is completed and can be claimed
    const claimTomorrow = await rewardService.claimQuestReward(userA.id, 'quest-first-trade', tomorrowKey);
    assert.strictEqual(claimTomorrow.success, true);
    assert.strictEqual(claimTomorrow.newTotalXp, 100, 'Lifetime XP accumulates across days (50 + 50 = 100)');

    // Verify today's historical claim row is still present in database
    const historicalTodayState = await prisma.dailyQuestState.findUnique({
      where: {
        userId_dateKey_questId: { userId: userA.id, dateKey: todayKey, questId: 'quest-first-trade' },
      },
    });
    assert.strictEqual(historicalTodayState?.claimed, true, 'Today\'s historical record preserved');

    // Verify total ledger has both entries
    const allLedgerEntries = await prisma.xpLedgerEntry.findMany({
      where: { userId: userA.id },
      orderBy: { createdAt: 'asc' },
    });
    assert.strictEqual(allLedgerEntries.length, 2, 'Both XP ledger entries must be preserved');
    assert.strictEqual(allLedgerEntries[0].balanceAfter, 50);
    assert.strictEqual(allLedgerEntries[1].balanceAfter, 100);
  });
});
