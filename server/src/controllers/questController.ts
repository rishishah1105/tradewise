import { Request, Response } from 'express';
import { rewardService } from '../services/rewardService.js';
import { resolveUserId } from '../middleware/authMiddleware.js';

/**
 * Returns authoritative daily quests for the authenticated user.
 */
export const getDailyQuests = async (req: Request, res: Response) => {
  try {
    const userId = await resolveUserId(req);
    if (!userId) {
      res.status(401).json({
        success: false,
        code: 'UNAUTHORIZED',
        message: 'Authentication session required.',
      });
      return;
    }

    const dateKey = typeof req.query.dateKey === 'string' ? req.query.dateKey : undefined;
    const questData = await rewardService.getDailyQuestsForUser(userId, dateKey);

    res.json({
      success: true,
      data: questData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Database error',
    });
  }
};

/**
 * Authoritatively claims a completed daily quest and awards XP.
 */
export const claimQuest = async (req: Request, res: Response) => {
  try {
    const userId = await resolveUserId(req);
    if (!userId) {
      res.status(401).json({
        success: false,
        code: 'UNAUTHORIZED',
        message: 'Authentication session required.',
      });
      return;
    }

    const questId = req.params.id || req.body.questId;
    if (!questId) {
      res.status(400).json({
        success: false,
        message: 'Missing questId parameter',
      });
      return;
    }

    const dateKey = typeof req.body.dateKey === 'string' ? req.body.dateKey : undefined;
    const result = await rewardService.claimQuestReward(userId, questId, dateKey);

    if (!result.success) {
      res.status(result.code === 'ALREADY_CLAIMED' ? 200 : 400).json(result);
      return;
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Database error',
    });
  }
};

/**
 * Records an action (e.g. visiting leaderboard or custom trigger).
 */
export const recordQuestAction = async (req: Request, res: Response) => {
  try {
    const userId = await resolveUserId(req);
    if (!userId) {
      // Unauthenticated actions do not award quest progress
      res.json({ success: true, recorded: false });
      return;
    }

    const { actionType, amount = 1 } = req.body;
    if (!actionType) {
      res.status(400).json({ success: false, message: 'Missing actionType' });
      return;
    }

    const results = await rewardService.recordQuestProgress(userId, actionType, Number(amount));
    res.json({ success: true, recorded: true, updates: results });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Database error',
    });
  }
};
