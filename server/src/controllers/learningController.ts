import { Request, Response } from 'express';
import { prisma } from '../prisma.js';

const XP_PER_LEVEL = 300;
const calculateLevel = (xp: number) => Math.floor(Math.max(0, xp) / XP_PER_LEVEL) + 1;

export const completeQuiz = async (req: Request, res: Response) => {
  try {
    const { conceptId, scorePercent, xpReward = 100, userId } = req.body;

    if (!conceptId || scorePercent === undefined) {
      res.status(400).json({ success: false, message: 'Missing conceptId or scorePercent' });
      return;
    }

    const user = await prisma.user.findFirst({
      include: { masteredConcepts: true, badges: true },
    });
    const targetUserId = userId || user?.id;

    if (!targetUserId) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const isFirstTime = !user?.masteredConcepts.some(c => c.conceptId === conceptId);
    const earnedXP = isFirstTime ? (xpReward + (scorePercent === 100 ? 50 : 0)) : (scorePercent === 100 ? 25 : 10);

    const newXP = (user?.xp || 0) + earnedXP;
    const newLevel = calculateLevel(newXP);

    const newBadgesUnlocked: string[] = [];

    await prisma.$transaction(async (tx) => {
      // 1. Record / update concept mastery
      await tx.masteredConcept.upsert({
        where: { userId_conceptId: { userId: targetUserId, conceptId } },
        update: { scorePercent: Math.max(scorePercent, user?.masteredConcepts.find(c => c.conceptId === conceptId)?.scorePercent || 0) },
        create: { userId: targetUserId, conceptId, scorePercent },
      });

      // 2. Check for Quiz Perfectionist Badge
      if (scorePercent === 100 && !user?.badges.some(b => b.badgeId === 'quiz-perfectionist')) {
        await tx.userBadge.create({
          data: { userId: targetUserId, badgeId: 'quiz-perfectionist', unlockedAt: 'Just now' },
        });
        newBadgesUnlocked.push('quiz-perfectionist');
      }

      // 3. Update user XP and Level
      await tx.user.update({
        where: { id: targetUserId },
        data: { xp: newXP, level: newLevel },
      });
    });

    res.json({
      success: true,
      data: {
        earnedXP,
        newXP,
        newLevel,
        newBadgesUnlocked,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Database error' });
  }
};
