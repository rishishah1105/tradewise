import { Router } from 'express';
import {
  getPaperAccount,
  getPortfolio,
  getPositions,
  resetSimulation,
  getOrders,
  placeOrder,
  cancelOrder,
  getTransactions,
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  getChallenges,
  searchMarketData,
  getQuote,
  getCandles,
} from '../controllers/paperTradingController.js';

export const paperTradingRouter = Router();

// Account & Portfolio Lifecycle
paperTradingRouter.get('/paper-trading/account', getPaperAccount);
paperTradingRouter.post('/paper-trading/reset', resetSimulation);
paperTradingRouter.get('/paper-trading/portfolio', getPortfolio);
paperTradingRouter.get('/paper-trading/positions', getPositions);

// Orders & Executions
paperTradingRouter.get('/paper-trading/orders', getOrders);
paperTradingRouter.post('/paper-trading/orders', placeOrder);
paperTradingRouter.post('/paper-trading/orders/:id/cancel', cancelOrder);
paperTradingRouter.post('/paper-trading/orders/cancel', cancelOrder);

// Cash Ledger & Audit
paperTradingRouter.get('/paper-trading/transactions', getTransactions);

// Watchlist
paperTradingRouter.get('/paper-trading/watchlist', getWatchlist);
paperTradingRouter.post('/paper-trading/watchlist', addToWatchlist);
paperTradingRouter.delete('/paper-trading/watchlist/:id', removeFromWatchlist);

// Educational Learning Challenges
paperTradingRouter.get('/paper-trading/challenges', getChallenges);

// Market Data (Eulerpool Adapter Proxy)
paperTradingRouter.get('/market-data/search', searchMarketData);
paperTradingRouter.get('/market-data/quote/:symbol', getQuote);
paperTradingRouter.get('/market-data/history/:symbol', getCandles);
