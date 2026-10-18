import { Router } from 'express';
import {
  getOrCreateUser,
  updateProfile,
  logActivity,
  claimDailyStreak,
  resetAllProgress,
  loginWithGoogle,
} from '../controllers/userController.js';
import {
  getPortfolio,
  placeOrder,
  cancelOrder,
} from '../controllers/portfolioController.js';
import { completeQuiz } from '../controllers/learningController.js';
import { getLeaderboard } from '../controllers/leaderboardController.js';

export const apiRouter = Router();

// Auth & User Profile
apiRouter.post('/auth/google', loginWithGoogle);
apiRouter.get('/user/profile', getOrCreateUser);
apiRouter.put('/user/profile', updateProfile);
apiRouter.post('/user/activity', logActivity);
apiRouter.post('/user/streak', claimDailyStreak);
apiRouter.post('/user/reset', resetAllProgress);

// Portfolio & Trading
apiRouter.get('/portfolio', getPortfolio);
apiRouter.post('/portfolio/order', placeOrder);
apiRouter.post('/portfolio/order/cancel', cancelOrder);

// Learning & Quizzes
apiRouter.post('/learning/quiz', completeQuiz);

// Leaderboard
apiRouter.get('/leaderboard', getLeaderboard);
