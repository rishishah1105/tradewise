import { Request, Response } from 'express';
import { prisma } from '../prisma.js';

const XP_PER_LEVEL = 300;
const calculateLevel = (xp: number) => Math.floor(Math.max(0, xp) / XP_PER_LEVEL) + 1;

export const getOrCreateUser = async (req: Request, res: Response) => {
  try {
    const requestedEmail = typeof req.query.email === 'string' ? req.query.email.trim().toLowerCase() : undefined;
    let user = requestedEmail
      ? await prisma.user.findUnique({
          where: { email: requestedEmail },
          include: {
            activityLogs: true,
            masteredConcepts: true,
            holdings: true,
            orders: { where: { status: 'PENDING' } },
            trades: { orderBy: { timestamp: 'desc' }, take: 50 },
            badges: true,
            dailyQuests: true,
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
          },
        });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: 'Rishi',
          handle: 'rishi_invests',
          institution: 'SPIT Mumbai',
          city: 'Mumbai',
          experienceLevel: 'Intermediate',
          xp: 150,
          level: 1,
          streak: 3,
          cashBalance: 100000.0,
          startingBalance: 100000.0,
          badges: {
            create: [
              { badgeId: 'first-step', unlockedAt: '2 days ago' },
            ],
          },
        },
        include: {
          activityLogs: true,
          masteredConcepts: true,
          holdings: true,
          orders: true,
          trades: true,
          badges: true,
          dailyQuests: true,
        },
      });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Database error' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { id, name, handle, bio, institution, city, experienceLevel, avatarUrl, avatarColor, linkedin, github, twitter } = req.body;

    const user = await prisma.user.findFirst();
    const targetId = id || user?.id;

    if (!targetId) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

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
    const { dateKey, userId } = req.body;
    const targetUserId = userId || (await prisma.user.findFirst())?.id;

    if (!targetUserId || !dateKey) {
      res.status(400).json({ success: false, message: 'Missing userId or dateKey' });
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
    const { todayKey, userId } = req.body;
    const user = await prisma.user.findFirst();
    const targetId = userId || user?.id;

    if (!targetId || !todayKey) {
      res.status(400).json({ success: false, message: 'Missing userId or todayKey' });
      return;
    }

    const newXP = (user?.xp || 0) + 50;
    const newStreak = (user?.streak || 0) + 1;
    const newLevel = calculateLevel(newXP);

    const updated = await prisma.user.update({
      where: { id: targetId },
      data: {
        xp: newXP,
        level: newLevel,
        streak: newStreak,
        lastCheckInDate: todayKey,
      },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Database error' });
  }
};

export const resetAllProgress = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findFirst();
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
      prisma.user.update({
        where: { id: user.id },
        data: {
          xp: 150,
          level: 1,
          streak: 0,
          lastCheckInDate: null,
          cashBalance: 100000.0,
          startingBalance: 100000.0,
        },
      }),
      prisma.userBadge.create({
        data: {
          userId: user.id,
          badgeId: 'first-step',
          unlockedAt: 'Just now',
        },
      }),
    ]);

    res.json({ success: true, message: 'Account and portfolio progress reset successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Database error' });
  }
};

export const loginWithGoogle = async (req: Request, res: Response) => {
  try {
    let { email, name, avatarUrl, credential } = req.body;

    // Safely extract JWT payload if raw Google credential was sent
    if (credential && (!email || !name)) {
      try {
        const payloadBase64 = credential.split('.')[1];
        if (payloadBase64) {
          const decoded = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf8'));
          email = email || decoded.email;
          name = name || decoded.name;
          avatarUrl = avatarUrl || decoded.picture;
        }
      } catch (err) {
        console.warn('[OAuth] Could not parse Google JWT:', err);
      }
    }

    if (!email) {
      res.status(400).json({ success: false, error: 'Email or username is required' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanEmail },
          { handle: cleanEmail },
        ],
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

    if (!user) {
      const emailValue = cleanEmail.includes('@') ? cleanEmail : `${cleanEmail}@tradewise.internal`;
      const baseHandle = cleanEmail.includes('@') ? cleanEmail.split('@')[0].replace(/[^a-z0-9_]/g, '_') : cleanEmail.replace(/[^a-z0-9_]/g, '_');
      const uniqueHandle = `${baseHandle}_${Math.floor(100 + Math.random() * 900)}`;

      user = await prisma.user.create({
        data: {
          email: emailValue,
          name: name || baseHandle,
          handle: uniqueHandle,
          avatarUrl: avatarUrl || undefined,
          institution: 'TradeWise Learner',
          city: 'Mumbai',
          experienceLevel: 'Beginner',
          xp: 150,
          level: 1,
          streak: 1,
          cashBalance: 100000.0,
          startingBalance: 100000.0,
          badges: {
            create: [
              { badgeId: 'first-step', unlockedAt: 'Just now' },
            ],
          },
        },
        include: {
          activityLogs: true,
          masteredConcepts: true,
          holdings: true,
          orders: true,
          trades: true,
          badges: true,
          dailyQuests: true,
        },
      });
      console.log(`[OAuth] Created new Google user in Neon DB: ${cleanEmail}`);
    } else {
      if (avatarUrl && !user.avatarUrl) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { avatarUrl },
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
      }
      console.log(`[OAuth] Google user logged in from Neon DB: ${cleanEmail}`);
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('[OAuth] Google Auth Error:', error);
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Google authentication failed' });
  }
};

