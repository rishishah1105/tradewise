import { Request, Response } from 'express';
import { prisma } from '../prisma.js';

export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const { type = 'learning' } = req.query; // 'learning' | 'trading'

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        handle: true,
        institution: true,
        avatarUrl: true,
        avatarColor: true,
        xp: true,
        level: true,
        streak: true,
        cashBalance: true,
        startingBalance: true,
        holdings: true,
      },
      take: 100,
    });

    const enriched = users.map((u) => {
      // Calculate return %
      const returnPct = ((u.cashBalance - u.startingBalance) / u.startingBalance) * 100;
      return {
        id: u.id,
        name: u.name,
        handle: u.handle,
        institution: u.institution || 'TradeWise Learner',
        avatarUrl: u.avatarUrl,
        avatarColor: u.avatarColor,
        xp: u.xp,
        level: u.level,
        streak: u.streak,
        portfolioReturn: Number(returnPct.toFixed(2)),
      };
    });

    if (type === 'trading') {
      enriched.sort((a, b) => b.portfolioReturn - a.portfolioReturn);
    } else {
      enriched.sort((a, b) => b.xp - a.xp);
    }

    res.json({
      success: true,
      data: enriched.map((entry, index) => ({
        rank: index + 1,
        ...entry,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Database error' });
  }
};
