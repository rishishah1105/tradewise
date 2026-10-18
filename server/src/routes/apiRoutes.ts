import { Router } from 'express';
import {
  getOrCreateUser,
  updateProfile,
  logActivity,
  claimDailyStreak,
  resetAllProgress,
} from '../controllers/userController.js';
import {
  getGoogleAuthUrl,
  handleGoogleCallback,
  verifyGoogleCredential,
  getSession,
  logout,
  getAuthConfig,
} from '../controllers/authController.js';
import {
  getPortfolio,
  placeOrder,
  cancelOrder,
} from '../controllers/portfolioController.js';
import { completeQuiz } from '../controllers/learningController.js';
import { getLeaderboard } from '../controllers/leaderboardController.js';
import { paperTradingRouter } from './paperTradingRoutes.js';

export const apiRouter = Router();

// Phase 3 Paper Trading & Market Data Routes
apiRouter.use(paperTradingRouter);

// Google OAuth & Session Management
apiRouter.get('/auth/config', getAuthConfig);
apiRouter.get('/auth/google/url', getGoogleAuthUrl);
apiRouter.get('/auth/google/callback', handleGoogleCallback);
apiRouter.post('/auth/google/verify', verifyGoogleCredential);
apiRouter.post('/auth/google', verifyGoogleCredential); // backward compatible alias
apiRouter.get('/auth/session', getSession);
apiRouter.get('/auth/me', getSession);
apiRouter.post('/auth/logout', logout);

// User Profile & Gamification
apiRouter.get('/user/profile', getOrCreateUser);
apiRouter.put('/user/profile', updateProfile);
apiRouter.post('/user/activity', logActivity);
apiRouter.post('/user/streak', claimDailyStreak);
apiRouter.post('/user/reset', resetAllProgress);

// Portfolio & Trading (Backward compatible Phase 1 & 2 routes)
apiRouter.get('/portfolio', getPortfolio);
apiRouter.post('/portfolio/order', placeOrder);
apiRouter.post('/portfolio/order/cancel', cancelOrder);

// Learning & Quizzes
apiRouter.post('/learning/quiz', completeQuiz);

// Leaderboard
apiRouter.get('/leaderboard', getLeaderboard);

