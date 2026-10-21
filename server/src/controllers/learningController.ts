import { Request, Response } from 'express';
import { prisma } from '../prisma.js';
import { resolveUserId } from '../middleware/authMiddleware.js';
import { rewardService } from '../services/rewardService.js';

const XP_PER_LEVEL = 300;
const calculateLevel = (xp: number) => Math.floor(Math.max(0, xp) / XP_PER_LEVEL) + 1;

export const completeQuiz = async (req: Request, res: Response) => {
  try {
    const targetUserId = await resolveUserId(req);
    if (!targetUserId) {
      res.status(401).json({ success: false, message: 'Authentication required to save quiz progress' });
      return;
    }

    const { conceptId, scorePercent, xpReward = 100 } = req.body;

    if (!conceptId || scorePercent === undefined) {
      res.status(400).json({ success: false, message: 'Missing conceptId or scorePercent' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: { masteredConcepts: true, badges: true },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const isFirstTime = !user.masteredConcepts.some(c => c.conceptId === conceptId);
    const isPassed = scorePercent >= 70;
    const earnedXP = isPassed
      ? (isFirstTime ? (xpReward + (scorePercent === 100 ? 50 : 0)) : (scorePercent === 100 ? 25 : 10))
      : 0;

    const newXP = (user.xp || 0) + earnedXP;
    const newLevel = calculateLevel(newXP);

    const newBadgesUnlocked: string[] = [];

    await prisma.$transaction(async (tx) => {
      if (isPassed) {
        // 1. Record / update concept mastery
        await tx.masteredConcept.upsert({
          where: { userId_conceptId: { userId: targetUserId, conceptId } },
          update: { scorePercent: Math.max(scorePercent, user.masteredConcepts.find(c => c.conceptId === conceptId)?.scorePercent || 0) },
          create: { userId: targetUserId, conceptId, scorePercent },
        });

        // 2. Check for 'first-step' Badge (earned genuinely on first completed module)
        if (user.masteredConcepts.length === 0 && !user.badges.some(b => b.badgeId === 'first-step')) {
          await tx.userBadge.create({
            data: { userId: targetUserId, badgeId: 'first-step', unlockedAt: 'Just now' },
          });
          newBadgesUnlocked.push('first-step');
        }

        // 3. Check for Quiz Perfectionist Badge
        if (scorePercent === 100 && !user.badges.some(b => b.badgeId === 'quiz-perfectionist')) {
          await tx.userBadge.create({
            data: { userId: targetUserId, badgeId: 'quiz-perfectionist', unlockedAt: 'Just now' },
          });
          newBadgesUnlocked.push('quiz-perfectionist');
        }

        // 4. Update user XP, Level, and mark onboardingCompleted via centralized rewardService
        if (earnedXP > 0) {
          await rewardService.awardXp(
            targetUserId,
            earnedXP,
            'QUIZ',
            conceptId,
            `Completed concept quiz: ${conceptId} (${scorePercent}%)`,
            tx
          );
        }
        await tx.user.update({
          where: { id: targetUserId },
          data: { onboardingCompleted: true },
        });

        // 5. Record activity log entry for calendar & activity persistence
        const todayKey = new Date().toISOString().split('T')[0];
        await tx.activityLog.upsert({
          where: { userId_dateKey: { userId: targetUserId, dateKey: todayKey } },
          update: { count: { increment: 1 } },
          create: { userId: targetUserId, dateKey: todayKey, count: 1 },
        });
      }
    });

    if (isPassed) {
      await rewardService.recordQuestProgress(targetUserId, 'LEARN', 1, {
        isPerfectScore: scorePercent === 100,
      });
    }

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

export const getLearningProgress = async (req: Request, res: Response) => {
  try {
    const targetUserId = await resolveUserId(req);
    if (!targetUserId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: {
        masteredConcepts: { orderBy: { completedAt: 'desc' } },
        badges: true,
        activityLogs: true,
        learningChallenges: true,
      },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const totalConcepts = 14;
    const masteredCount = user.masteredConcepts.length;
    const roadmapProgress = Math.round((masteredCount / totalConcepts) * 100);
    const lastLearned = user.masteredConcepts[0] || null;
    const hasAnyActivity = masteredCount > 0 || user.activityLogs.length > 0 || (user.xp || 0) > 0 || (user.streak || 0) > 0;

    res.json({
      success: true,
      data: {
        totalXp: user.xp,
        level: user.level,
        streak: user.streak,
        roadmapProgress,
        completedLessons: masteredCount,
        completedChapters: masteredCount,
        quizzesCompleted: masteredCount,
        challengesCompleted: user.learningChallenges.filter(c => c.completed).length,
        badges: user.badges,
        lastLearnedConceptId: lastLearned?.conceptId || null,
        hasActivity: hasAnyActivity,
        onboardingCompleted: user.onboardingCompleted,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Database error' });
  }
};
