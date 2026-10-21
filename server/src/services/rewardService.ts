/**
 * TradeWise Authoritative Reward & Daily Quest Service
 * Handles XP balances, XP ledger audit trails, daily quest progression & claiming,
 * daily streaks, and strict per-user data isolation.
 */

import { prisma } from '../prisma.js';
import type { Prisma } from '@prisma/client';

export interface DailyQuestDefinition {
  id: string;
  title: string;
  description: string;
  category: 'trading' | 'learning' | 'streak' | 'general';
  target: number;
  xpReward: number;
  actionType: 'TRADE' | 'LIMIT_ORDER' | 'LEARN' | 'STREAK' | 'LEADERBOARD';
}

export const CANONICAL_DAILY_QUESTS: DailyQuestDefinition[] = [
  {
    id: 'quest-first-trade',
    title: 'Make your first trade',
    description: 'Execute a paper order in the simulator to practice real-world risk management',
    category: 'trading',
    target: 1,
    xpReward: 50,
    actionType: 'TRADE',
  },
  {
    id: 'quest-trade-mastery',
    title: 'NSE Simulator Mastery',
    description: 'Execute 3 paper orders today to master execution flow',
    category: 'trading',
    target: 3,
    xpReward: 40,
    actionType: 'TRADE',
  },
  {
    id: 'quest-study',
    title: 'Complete 1 Study Module',
    description: 'Complete a concept study module or quiz with a passing score',
    category: 'learning',
    target: 1,
    xpReward: 50,
    actionType: 'LEARN',
  },
  // Supported pool quests & aliases
  {
    id: 'q-leaderboard',
    title: 'Visit the leaderboard today',
    description: "Today's featured financial challenge to boost market skills",
    category: 'general',
    target: 1,
    xpReward: 15,
    actionType: 'LEADERBOARD',
  },
  {
    id: 'q-limit-order',
    title: 'Place a limit order in the simulator',
    description: 'Set a target price limit order in the simulator',
    category: 'trading',
    target: 1,
    xpReward: 30,
    actionType: 'LIMIT_ORDER',
  },
  {
    id: 'q-study-1',
    title: 'Study any concept today',
    description: 'Study financial concepts to build investment literacy',
    category: 'learning',
    target: 1,
    xpReward: 30,
    actionType: 'LEARN',
  },
  {
    id: 'q-study-2',
    title: 'Study 2 concepts today',
    description: 'Study 2 financial concepts today to expand your market knowledge',
    category: 'learning',
    target: 2,
    xpReward: 50,
    actionType: 'LEARN',
  },
  {
    id: 'q-quiz-perfect',
    title: 'Pass a quiz with a perfect score',
    description: 'Achieve 100% on any concept quiz',
    category: 'learning',
    target: 1,
    xpReward: 40,
    actionType: 'LEARN',
  },
  {
    id: 'q-trade-3',
    title: 'Place 3 trades today',
    description: 'Execute multiple paper trades to diversify portfolio exposure',
    category: 'trading',
    target: 3,
    xpReward: 40,
    actionType: 'TRADE',
  },
  {
    id: 'quest-2',
    title: 'Place 1 Paper Trade in Simulator',
    description: 'Place your first buy or sell order in the simulator',
    category: 'trading',
    target: 1,
    xpReward: 50,
    actionType: 'TRADE',
  },
  {
    id: 'quest-1',
    title: 'Complete 1 Study Module',
    description: 'Complete 1 study module with a passing score',
    category: 'learning',
    target: 1,
    xpReward: 50,
    actionType: 'LEARN',
  },
  {
    id: 'quest-3',
    title: 'Achieve 100% on any Concept Quiz',
    description: 'Score 100% on any module quiz',
    category: 'learning',
    target: 1,
    xpReward: 75,
    actionType: 'LEARN',
  },
];

const XP_PER_LEVEL = 300;
export const calculateLevel = (xp: number) => Math.floor(Math.max(0, xp) / XP_PER_LEVEL) + 1;

/**
 * Authoritative Indian Standard Time (IST / Asia/Kolkata) date key formatter (YYYY-MM-DD).
 */
export function getDateKey(date: Date = new Date(), timeZone = 'Asia/Kolkata'): string {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone }).format(date);
  } catch {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'UTC' }).format(date);
  }
}

export class RewardService {
  /**
   * Centralized, atomic XP award operation.
   * Updates user total XP, recalculates level, and logs to xp_ledger_entries.
   */
  public async awardXp(
    userId: string,
    amount: number,
    source: 'QUEST' | 'STREAK' | 'QUIZ' | 'TRADING_CHALLENGE' | 'BONUS',
    referenceId: string | null,
    description: string,
    tx?: Prisma.TransactionClient
  ): Promise<{ newXp: number; newLevel: number }> {
    if (amount <= 0) {
      const user = await (tx || prisma).user.findUnique({
        where: { id: userId },
        select: { xp: true, level: true },
      });
      return { newXp: user?.xp || 0, newLevel: user?.level || 1 };
    }

    const client = tx || prisma;
    const user = await client.user.findUnique({
      where: { id: userId },
      select: { xp: true },
    });

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const newXp = (user.xp || 0) + amount;
    const newLevel = calculateLevel(newXp);

    await client.user.update({
      where: { id: userId },
      data: {
        xp: newXp,
        level: newLevel,
      },
    });

    await client.xpLedgerEntry.create({
      data: {
        userId,
        amount,
        balanceAfter: newXp,
        source,
        referenceId,
        description,
      },
    });

    return { newXp, newLevel };
  }

  /**
   * Returns current active daily quests for the authenticated user for the given date.
   */
  public async getDailyQuestsForUser(userId: string, customDateKey?: string) {
    const dateKey = customDateKey && /^\d{4}-\d{2}-\d{2}$/.test(customDateKey)
      ? customDateKey
      : getDateKey();

    // Default 3 daily featured quests for UI carousel
    const featuredQuestIds = ['quest-first-trade', 'quest-trade-mastery', 'quest-study'];

    const userStates = await prisma.dailyQuestState.findMany({
      where: {
        userId,
        dateKey,
      },
    });

    const stateMap = new Map<string, any>();
    for (const s of userStates) {
      stateMap.set(s.questId, s);
    }

    // Build the list of featured quests + any other completed/active quest for today
    const allRelevantDefs = CANONICAL_DAILY_QUESTS.filter(q =>
      featuredQuestIds.includes(q.id) || stateMap.has(q.id)
    );

    // Deduplicate by ID preserving order
    const seen = new Set<string>();
    const quests = [];

    for (const def of allRelevantDefs) {
      if (seen.has(def.id)) continue;
      seen.add(def.id);

      const state = stateMap.get(def.id);
      const progress = state ? state.progress : 0;
      const target = state?.target || def.target;
      const completed = state ? state.completed : false;
      const claimed = state ? state.claimed : false;

      quests.push({
        id: def.id,
        title: def.title,
        description: def.description,
        category: def.category,
        progress,
        target,
        completed,
        claimed,
        claimedAt: state?.claimedAt || null,
        xpReward: def.xpReward,
        isCompleted: completed,
        isClaimed: claimed,
      });
    }

    return {
      dateKey,
      quests,
    };
  }

  /**
   * Evaluates and records progress for daily quests matching the action type.
   * Marks quest completed if target is met, but DOES NOT claim or award XP automatically.
   */
  public async recordQuestProgress(
    userId: string,
    actionType: 'TRADE' | 'LIMIT_ORDER' | 'LEARN' | 'STREAK' | 'LEADERBOARD',
    amount = 1,
    options?: { isLimit?: boolean; isPerfectScore?: boolean; customDateKey?: string }
  ) {
    const dateKey = options?.customDateKey && /^\d{4}-\d{2}-\d{2}$/.test(options.customDateKey)
      ? options.customDateKey
      : getDateKey();

    // Matching criteria
    const matchingDefs = CANONICAL_DAILY_QUESTS.filter(q => {
      if (q.actionType === actionType) return true;
      if (actionType === 'LIMIT_ORDER' && q.actionType === 'TRADE') return true;
      if (actionType === 'TRADE' && options?.isLimit && q.actionType === 'LIMIT_ORDER') return true;
      if (actionType === 'LEARN' && options?.isPerfectScore && q.id === 'q-quiz-perfect') return true;
      return false;
    });

    const results = [];

    for (const def of matchingDefs) {
      try {
        const existing = await prisma.dailyQuestState.findUnique({
          where: {
            userId_dateKey_questId: { userId, dateKey, questId: def.id },
          },
        });

        if (existing?.claimed) {
          // Already claimed today, preserve claimed status
          results.push({
            id: def.id,
            progress: existing.progress,
            target: existing.target,
            completed: true,
            claimed: true,
          });
          continue;
        }

        const currentProgress = existing?.progress || 0;
        const newProgress = Math.min(def.target, currentProgress + amount);
        const isCompleted = newProgress >= def.target;

        const saved = await prisma.dailyQuestState.upsert({
          where: {
            userId_dateKey_questId: { userId, dateKey, questId: def.id },
          },
          update: {
            progress: newProgress,
            target: def.target,
            completed: isCompleted || (existing?.completed ?? false),
          },
          create: {
            userId,
            dateKey,
            questId: def.id,
            progress: newProgress,
            target: def.target,
            completed: isCompleted,
            claimed: false,
          },
        });

        results.push({
          id: def.id,
          title: def.title,
          description: def.description,
          progress: saved.progress,
          target: saved.target,
          completed: saved.completed,
          claimed: saved.claimed,
          xpReward: def.xpReward,
        });
      } catch (err) {
        console.warn(`[RewardService] Error updating quest ${def.id}:`, err);
      }
    }

    return results;
  }

  /**
   * Atomically and idempotently claims a completed daily quest.
   * Validates completion, ensures single claim per day, updates XP and XP ledger in a transaction.
   */
  public async claimQuestReward(
    userId: string,
    questId: string,
    customDateKey?: string
  ): Promise<{
    success: boolean;
    code?: string;
    message: string;
    quest?: any;
    xpAwarded?: number;
    newTotalXp?: number;
    newLevel?: number;
  }> {
    const dateKey = customDateKey && /^\d{4}-\d{2}-\d{2}$/.test(customDateKey)
      ? customDateKey
      : getDateKey();

    const def = CANONICAL_DAILY_QUESTS.find(q => q.id === questId);
    if (!def) {
      return {
        success: false,
        code: 'QUEST_NOT_FOUND',
        message: `Unknown daily quest ID: ${questId}`,
      };
    }

    return await prisma.$transaction(async (tx) => {
      const state = await tx.dailyQuestState.findUnique({
        where: {
          userId_dateKey_questId: { userId, dateKey, questId },
        },
      });

      if (!state) {
        return {
          success: false,
          code: 'QUEST_NOT_STARTED',
          message: 'Quest has not been completed yet.',
        };
      }

      if (state.claimed) {
        return {
          success: false,
          code: 'ALREADY_CLAIMED',
          message: 'This quest has already been claimed today.',
          quest: {
            id: questId,
            title: def.title,
            progress: state.progress,
            target: state.target,
            completed: state.completed,
            claimed: true,
            xpReward: def.xpReward,
          },
        };
      }

      if (!state.completed || state.progress < state.target) {
        return {
          success: false,
          code: 'QUEST_INCOMPLETE',
          message: `Quest requirements are not yet satisfied (${state.progress}/${state.target}).`,
        };
      }

      // Mark claimed atomically
      const updatedState = await tx.dailyQuestState.update({
        where: {
          userId_dateKey_questId: { userId, dateKey, questId },
        },
        data: {
          claimed: true,
          claimedAt: new Date(),
          xpAwarded: def.xpReward,
        },
      });

      // Award XP via centralized ledger within same transaction
      const { newXp, newLevel } = await this.awardXp(
        userId,
        def.xpReward,
        'QUEST',
        questId,
        `Daily Quest Claim: ${def.title}`,
        tx
      );

      return {
        success: true,
        message: `Claimed +${def.xpReward} XP for "${def.title}"!`,
        quest: {
          id: questId,
          title: def.title,
          description: def.description,
          progress: updatedState.progress,
          target: updatedState.target,
          completed: true,
          claimed: true,
          claimedAt: updatedState.claimedAt,
          xpReward: def.xpReward,
        },
        xpAwarded: def.xpReward,
        newTotalXp: newXp,
        newLevel,
      };
    });
  }

  /**
   * Authoritative daily login streak claim.
   * Atomically updates streak, activityLog, user XP, and records in xp_ledger_entries.
   */
  public async claimDailyStreak(
    userId: string,
    clientTodayKey?: string
  ): Promise<{
    success: boolean;
    alreadyClaimed?: boolean;
    message: string;
    data?: any;
    xpAwarded?: number;
  }> {
    const dateKey = clientTodayKey && /^\d{4}-\d{2}-\d{2}$/.test(clientTodayKey)
      ? clientTodayKey
      : getDateKey();

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { activityLogs: true },
    });

    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    // Idempotency: Prevent duplicate claim for the same date
    if (user.lastCheckInDate === dateKey) {
      return {
        success: true,
        alreadyClaimed: true,
        message: 'Streak already claimed for today',
        data: user,
        xpAwarded: 0,
      };
    }

    // Compute yesterday's dateKey in IST
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayKey = getDateKey(yesterday);

    let newStreak = 1;
    if (user.lastCheckInDate === yesterdayKey) {
      newStreak = (user.streak || 0) + 1;
    } else if (!user.lastCheckInDate) {
      newStreak = 1;
    } else {
      // Missed at least one day
      newStreak = user.streakFreezeAvailable ? (user.streak || 0) + 1 : 1;
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update activity log
      await tx.activityLog.upsert({
        where: {
          userId_dateKey: { userId, dateKey },
        },
        update: { count: { increment: 1 } },
        create: { userId, dateKey, count: 1 },
      });

      // 2. Award XP via centralized ledger
      const { newXp, newLevel } = await this.awardXp(
        userId,
        50,
        'STREAK',
        dateKey,
        `Daily Streak Check-in (${newStreak} consecutive days)`,
        tx
      );

      // 3. Update user streak and lastCheckInDate
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          streak: newStreak,
          lastCheckInDate: dateKey,
        },
        include: {
          activityLogs: true,
          masteredConcepts: true,
          holdings: true,
          orders: { where: { status: 'PENDING' } },
          trades: { orderBy: { timestamp: 'desc' }, take: 50 },
          badges: true,
          dailyQuests: true,
        },
      });

      return { updatedUser, newXp, newLevel };
    });

    return {
      success: true,
      alreadyClaimed: false,
      message: `+50 XP! You're on a ${newStreak}-day streak!`,
      data: result.updatedUser,
      xpAwarded: 50,
    };
  }
}

export const rewardService = new RewardService();
