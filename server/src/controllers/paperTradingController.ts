/**
 * Paper Trading & Market Data Controller
 * Authenticated endpoints for account, portfolio, orders, transactions, watchlists, challenges, and Eulerpool market data.
 */

import { Request, Response } from 'express';
import { prisma } from '../prisma.js';
import { paperExecutionEngine } from '../services/paperExecutionEngine.js';
import { eulerpoolService } from '../services/eulerpoolService.js';

import { resolveUserId } from '../middleware/authMiddleware.js';

// -------------------------------------------------------------
// Paper Trading Account & Portfolio
// -------------------------------------------------------------

export const getPaperAccount = async (req: Request, res: Response) => {
  try {
    const userId = await resolveUserId(req);
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required. No user found.' });
      return;
    }

    const { account, activeEpisode } = await paperExecutionEngine.getOrCreateAccount(userId);
    res.json({
      success: true,
      data: {
        account,
        activeEpisode,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Database error' });
  }
};

export const getPortfolio = async (req: Request, res: Response) => {
  try {
    const userId = await resolveUserId(req);
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required. No user found.' });
      return;
    }

    const snapshot = await paperExecutionEngine.getPortfolioSnapshot(userId);
    res.json({
      success: true,
      data: snapshot,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Database error' });
  }
};

export const getPositions = async (req: Request, res: Response) => {
  try {
    const userId = await resolveUserId(req);
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const snapshot = await paperExecutionEngine.getPortfolioSnapshot(userId);
    res.json({
      success: true,
      data: snapshot.positions,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Database error' });
  }
};

export const resetSimulation = async (req: Request, res: Response) => {
  try {
    const userId = await resolveUserId(req);
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { confirm, reason } = req.body;
    if (confirm !== true) {
      res.status(400).json({
        success: false,
        message: 'Explicit confirmation required to reset virtual simulation. Set { confirm: true } in request body.',
      });
      return;
    }

    const result = await paperExecutionEngine.resetSimulation(userId, reason);
    res.json({
      success: true,
      message: `Simulation reset successfully. Initialized fresh episode #${result.newEpisodeNumber} with virtual capital.`,
      data: result,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Database error' });
  }
};

// -------------------------------------------------------------
// Orders & Executions
// -------------------------------------------------------------

export const getOrders = async (req: Request, res: Response) => {
  try {
    const userId = await resolveUserId(req);
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const snapshot = await paperExecutionEngine.getPortfolioSnapshot(userId);
    res.json({
      success: true,
      data: {
        openOrders: snapshot.openOrders,
        recentOrders: snapshot.recentOrders,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Database error' });
  }
};

export const placeOrder = async (req: Request, res: Response) => {
  try {
    const userId = await resolveUserId(req);
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { symbol, side, type, quantity, limitPrice, clientOrderId } = req.body;

    const result = await paperExecutionEngine.placeOrder({
      userId,
      symbol,
      side,
      type,
      quantity: Number(quantity),
      limitPrice: limitPrice ? Number(limitPrice) : undefined,
      clientOrderId,
    });

    if (!result.success) {
      res.status(400).json(result);
      return;
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Execution error' });
  }
};

export const cancelOrder = async (req: Request, res: Response) => {
  try {
    const userId = await resolveUserId(req);
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const rawOrderId = req.params.id || req.body.orderId;
    const orderId = Array.isArray(rawOrderId) ? rawOrderId[0] : (typeof rawOrderId === 'string' ? rawOrderId : undefined);
    if (!orderId) {
      res.status(400).json({ success: false, message: 'Missing orderId parameter.' });
      return;
    }

    const result = await paperExecutionEngine.cancelOrder(userId, orderId);
    if (!result.success) {
      res.status(400).json(result);
      return;
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Cancellation error' });
  }
};

export const getTransactions = async (req: Request, res: Response) => {
  try {
    const userId = await resolveUserId(req);
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const snapshot = await paperExecutionEngine.getPortfolioSnapshot(userId);
    res.json({
      success: true,
      data: snapshot.ledger,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Database error' });
  }
};

// -------------------------------------------------------------
// Watchlist
// -------------------------------------------------------------

export const getWatchlist = async (req: Request, res: Response) => {
  try {
    const userId = await resolveUserId(req);
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const items = await prisma.watchlistItem.findMany({
      where: { userId },
      orderBy: { addedAt: 'desc' },
    });

    // Enrich with latest market quote
    const enriched = await Promise.all(
      items.map(async (item) => {
        const quote = await eulerpoolService.getQuote(item.symbol);
        return {
          id: item.id,
          symbol: item.symbol,
          name: item.name,
          exchange: item.exchange,
          addedAt: item.addedAt,
          quote,
        };
      })
    );

    res.json({ success: true, data: enriched });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Database error' });
  }
};

export const addToWatchlist = async (req: Request, res: Response) => {
  try {
    const userId = await resolveUserId(req);
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { symbol, name, exchange = 'NSE' } = req.body;
    if (!symbol) {
      res.status(400).json({ success: false, message: 'Symbol is required' });
      return;
    }

    const item = await prisma.watchlistItem.upsert({
      where: {
        userId_symbol: { userId, symbol: symbol.toUpperCase() },
      },
      update: {
        name: name || symbol,
      },
      create: {
        userId,
        symbol: symbol.toUpperCase(),
        name: name || symbol,
        exchange,
      },
    });

    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Database error' });
  }
};

export const removeFromWatchlist = async (req: Request, res: Response) => {
  try {
    const userId = await resolveUserId(req);
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const rawParam = req.params.id;
    const symbolOrId = Array.isArray(rawParam) ? rawParam[0] : rawParam;
    if (!symbolOrId) {
      res.status(400).json({ success: false, message: 'Missing watchlist identifier' });
      return;
    }

    // Try deleting by ID or by symbol
    await prisma.watchlistItem.deleteMany({
      where: {
        userId,
        OR: [
          { id: symbolOrId },
          { symbol: symbolOrId.toUpperCase() },
        ],
      },
    });

    res.json({ success: true, message: `Removed from watchlist.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Database error' });
  }
};

// -------------------------------------------------------------
// Learning Mode Challenges
// -------------------------------------------------------------

export const DEFAULT_CHALLENGES = [
  {
    id: 'diversification_3_stocks',
    title: 'Diversification Starter',
    description: 'Hold at least 3 distinct equity instruments simultaneously in your paper portfolio.',
    category: 'risk',
    target: 3,
  },
  {
    id: 'max_holding_weight_40',
    title: 'Concentration Risk Master',
    description: 'Maintain your portfolio such that no single holding exceeds 40% of total portfolio equity.',
    category: 'portfolio',
    target: 1,
  },
  {
    id: 'place_limit_order',
    title: 'Precision Execution',
    description: 'Queue and experience a simulated LIMIT order below market price.',
    category: 'mechanics',
    target: 1,
  },
  {
    id: 'cost_impact_awareness',
    title: 'Friction & Drag Analysis',
    description: 'Review how simulated transaction costs and slippage affect net returns in your Cash Ledger.',
    category: 'accounting',
    target: 1,
  },
];

export const getChallenges = async (req: Request, res: Response) => {
  try {
    const userId = await resolveUserId(req);
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const recorded = await prisma.learningChallengeProgress.findMany({
      where: { userId },
    });

    // Check actual portfolio to auto-complete eligible challenges
    const snapshot = await paperExecutionEngine.getPortfolioSnapshot(userId);
    const holdingCount = snapshot.positions.length;
    const maxWeight = snapshot.positions.reduce((max, p) => Math.max(max, p.weightPercent), 0);
    const hasLimit = snapshot.recentOrders.some(o => o.type === 'LIMIT');
    const hasTrades = snapshot.ledger.length > 1;

    const challengesWithStatus = await Promise.all(
      DEFAULT_CHALLENGES.map(async (c) => {
        let isDone = recorded.some(r => r.challengeId === c.id && r.completed);
        let progress = 0;

        if (c.id === 'diversification_3_stocks') {
          progress = Math.min(3, holdingCount);
          if (progress >= 3) isDone = true;
        } else if (c.id === 'max_holding_weight_40') {
          progress = holdingCount >= 2 && maxWeight <= 40 ? 1 : 0;
          if (progress === 1) isDone = true;
        } else if (c.id === 'place_limit_order') {
          progress = hasLimit ? 1 : 0;
          if (progress === 1) isDone = true;
        } else if (c.id === 'cost_impact_awareness') {
          progress = hasTrades ? 1 : 0;
          if (progress === 1) isDone = true;
        }

        // Persist completion if newly achieved
        if (isDone && !recorded.some(r => r.challengeId === c.id && r.completed)) {
          await prisma.learningChallengeProgress.upsert({
            where: { userId_challengeId: { userId, challengeId: c.id } },
            update: { completed: true, progress: c.target, completedAt: new Date() },
            create: { userId, challengeId: c.id, completed: true, progress: c.target, target: c.target, completedAt: new Date() },
          });
        }

        return {
          ...c,
          completed: isDone,
          progress,
        };
      })
    );

    res.json({ success: true, data: challengesWithStatus });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Database error' });
  }
};

// -------------------------------------------------------------
// Market Data (Eulerpool Adapter Proxy)
// -------------------------------------------------------------

export const searchMarketData = async (req: Request, res: Response) => {
  try {
    const query = typeof req.query.query === 'string' ? req.query.query : '';
    const results = await eulerpoolService.searchInstruments(query);
    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Search error' });
  }
};

export const getQuote = async (req: Request, res: Response) => {
  try {
    const rawSymbol = req.params.symbol;
    const symbol = Array.isArray(rawSymbol) ? rawSymbol[0] : rawSymbol;
    if (!symbol) {
      res.status(400).json({ success: false, message: 'Symbol is required' });
      return;
    }

    const quote = await eulerpoolService.getQuote(symbol);
    res.json({ success: true, data: quote });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Quote error' });
  }
};

export const getCandles = async (req: Request, res: Response) => {
  try {
    const rawSymbol = req.params.symbol;
    const symbol = Array.isArray(rawSymbol) ? rawSymbol[0] : rawSymbol;
    const timeframe = (req.query.timeframe as any) || '1D';

    if (!symbol) {
      res.status(400).json({ success: false, message: 'Symbol is required' });
      return;
    }

    const candles = await eulerpoolService.getCandles(symbol, timeframe);
    res.json({ success: true, data: candles });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Candles error' });
  }
};
