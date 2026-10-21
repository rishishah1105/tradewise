import { Request, Response } from 'express';
import { prisma } from '../prisma.js';
import { extractSessionToken } from '../middleware/authMiddleware.js';
import { authService } from '../services/authService.js';
import { rewardService } from '../services/rewardService.js';

const XP_PER_LEVEL = 300;
const calculateLevel = (xp: number) => Math.floor(Math.max(0, xp) / XP_PER_LEVEL) + 1;

export const getOrCreateUser = async (req: Request, res: Response) => {
  try {
    // 1. Check if authenticated via session cookie / token
    const sessionToken = extractSessionToken(req);
    if (sessionToken) {
      const validated = await authService.validateSession(sessionToken);
      if (validated) {
        res.json({ success: true, data: validated.user });
        return;
      }
    }
    // 2. Allow automated test environment lookup
    if (process.env.NODE_ENV === 'test') {
      const headerUserId = req.headers['x-user-id'] as string;
      const testUser = headerUserId
        ? await prisma.user.findUnique({
            where: { id: headerUserId.trim() },
            include: {
              activityLogs: true,
              masteredConcepts: true,
              holdings: true,
              orders: { where: { status: 'PENDING' } },
              trades: { orderBy: { timestamp: 'desc' }, take: 50 },
              badges: true,
              dailyQuests: true,
              learningChallenges: true,
            },
          })
        : await prisma.user.findFirst({
            include: {
              activityLogs: true,
              masteredConcepts: true,
              holdings: true,
              orders: { where: { status: 'PENDING' } },
              trades: { orderBy: { timestamp: 'desc' }, take: 50 },
              badges: true,
              dailyQuests: true,
              learningChallenges: true,
            },
          });

      if (testUser) {
        res.json({ success: true, data: testUser });
        return;
      }
    }

    res.status(401).json({
      success: false,
      code: 'UNAUTHORIZED',
      message: 'Authentication session required. Please sign in with Google.',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Database error' });
  }
};

import { resolveUserId } from '../middleware/authMiddleware.js';

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const targetId = await resolveUserId(req);
    if (!targetId) {
      res.status(401).json({ success: false, message: 'Authentication required to update profile' });
      return;
    }

    const { name, handle, bio, institution, city, experienceLevel, avatarUrl, avatarColor, linkedin, github, twitter } = req.body;

    const updated = await prisma.user.update({
      where: { id: targetId },
      data: {
        ...(name && { name }),
        ...(handle !== undefined && { handle }),
        ...(bio !== undefined && { bio }),
        ...(institution !== undefined && { institution }),
        ...(city !== undefined && { city }),
        ...(experienceLevel && { experienceLevel }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(avatarColor && { avatarColor }),
        ...(linkedin !== undefined && { linkedin }),
        ...(github !== undefined && { github }),
        ...(twitter !== undefined && { twitter }),
      },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Database error' });
  }
};

export const logActivity = async (req: Request, res: Response) => {
  try {
    const targetUserId = await resolveUserId(req);
    if (!targetUserId) {
      res.status(401).json({ success: false, message: 'Authentication required to log activity' });
      return;
    }

    const { dateKey } = req.body;
    if (!dateKey) {
      res.status(400).json({ success: false, message: 'Missing dateKey' });
      return;
    }

    const existing = await prisma.activityLog.findUnique({
      where: {
        userId_dateKey: { userId: targetUserId, dateKey },
      },
    });

    const newCount = existing ? Math.min(4, existing.count + 1) : 1;

    const saved = await prisma.activityLog.upsert({
      where: {
        userId_dateKey: { userId: targetUserId, dateKey },
      },
      update: { count: newCount },
      create: { userId: targetUserId, dateKey, count: 1 },
    });

    res.json({ success: true, data: saved });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Database error' });
  }
};

export const claimDailyStreak = async (req: Request, res: Response) => {
  try {
    const targetId = await resolveUserId(req);
    if (!targetId) {
      res.status(401).json({ success: false, message: 'Authentication required to claim streak' });
      return;
    }

    const { todayKey } = req.body;
    const result = await rewardService.claimDailyStreak(targetId, todayKey);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Database error' });
  }
};

export const resetAllProgress = async (req: Request, res: Response) => {
  try {
    const targetUserId = await resolveUserId(req);
    if (!targetUserId) {
      res.status(401).json({ success: false, message: 'Authentication required to reset progress' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Delete related user data
    await prisma.$transaction([
      prisma.activityLog.deleteMany({ where: { userId: user.id } }),
      prisma.masteredConcept.deleteMany({ where: { userId: user.id } }),
      prisma.portfolioHolding.deleteMany({ where: { userId: user.id } }),
      prisma.tradeOrder.deleteMany({ where: { userId: user.id } }),
      prisma.tradeLog.deleteMany({ where: { userId: user.id } }),
      prisma.userBadge.deleteMany({ where: { userId: user.id } }),
      prisma.dailyQuestState.deleteMany({ where: { userId: user.id } }),
      prisma.xpLedgerEntry.deleteMany({ where: { userId: user.id } }),
      prisma.learningChallengeProgress.deleteMany({ where: { userId: user.id } }),
      prisma.user.update({
        where: { id: user.id },
        data: {
          xp: 0,
          level: 1,
          streak: 0,
          lastCheckInDate: null,
          cashBalance: 100000.0,
          startingBalance: 100000.0,
        },
      }),
    ]);

    res.json({ success: true, message: 'Account and portfolio progress reset successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Database error' });
  }
};





