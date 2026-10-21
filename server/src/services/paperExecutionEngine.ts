/**
 * Paper Trading Simulated Execution Engine
 * Deterministic, transactional, auditable order matching and portfolio accounting.
 * Strictly educational: zero real-money deposits, withdrawals, or brokerage execution.
 */

import { prisma } from '../prisma.js';
import { eulerpoolService, type NormalizedQuote } from './eulerpoolService.js';
import { rewardService } from './rewardService.js';

// Configuration
const DEFAULT_INITIAL_CASH = 100000.0;
const INITIAL_CASH_INR = parseFloat(process.env.PAPER_TRADING_INITIAL_CASH_INR || String(DEFAULT_INITIAL_CASH));
const SLIPPAGE_BPS = parseFloat(process.env.PAPER_TRADING_SLIPPAGE_BPS || '5'); // 5 bps = 0.05%
const FEE_RATE = 0.0003; // 0.03% simulated transaction fee (STT, exchange turnover, broker fee simulation)
const MAX_STALE_QUOTE_AGE_SECONDS = parseInt(process.env.PAPER_TRADING_MAX_QUOTE_AGE_SECONDS || '900', 10);

const round2 = (num: number): number => Math.round((num + Number.EPSILON) * 100) / 100;

export interface PlaceOrderInput {
  userId: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'MARKET' | 'LIMIT';
  quantity: number;
  limitPrice?: number;
  clientOrderId?: string;
}

export interface ExecutionResult {
  success: boolean;
  orderId?: string;
  status: 'FILLED' | 'OPEN' | 'REJECTED';
  fillPrice?: number;
  shares?: number;
  slippageBps?: number;
  fee?: number;
  grossAmount?: number;
  netAmount?: number;
  cashRemaining?: number;
  message: string;
}

export class PaperExecutionEngine {
  /**
   * Ensure user has an initialized PaperTradingAccount and an active Episode
   */
  public async getOrCreateAccount(userId: string) {
    let account = await prisma.paperTradingAccount.findUnique({
      where: { userId },
      include: {
        episodes: { where: { status: 'ACTIVE' }, take: 1 },
      },
    });

    if (!account) {
      // Create new account + initial episode + initial cash ledger entry
      account = await prisma.$transaction(async (tx) => {
        const newAccount = await tx.paperTradingAccount.create({
          data: {
            userId,
            currency: 'INR',
            initialCash: INITIAL_CASH_INR,
            currentCash: INITIAL_CASH_INR,
          },
        });

        const initialEpisode = await tx.paperTradingEpisode.create({
          data: {
            accountId: newAccount.id,
            episodeNumber: 1,
            startingCash: INITIAL_CASH_INR,
            status: 'ACTIVE',
          },
        });

        await tx.paperTradingAccount.update({
          where: { id: newAccount.id },
          data: { activeEpisodeId: initialEpisode.id },
        });

        await tx.cashLedgerEntry.create({
          data: {
            accountId: newAccount.id,
            episodeId: initialEpisode.id,
            entryType: 'INITIAL_CAPITAL',
            amount: INITIAL_CASH_INR,
            balanceAfter: INITIAL_CASH_INR,
            description: `Virtual sandbox capital initialized (₹${INITIAL_CASH_INR.toLocaleString('en-IN')})`,
          },
        });

        return tx.paperTradingAccount.findUnique({
          where: { id: newAccount.id },
          include: { episodes: { where: { status: 'ACTIVE' } } },
        });
      });
    }

    // Ensure active episode exists
    let activeEpisode = account!.episodes[0];
    if (!activeEpisode) {
      const episodeCount = await prisma.paperTradingEpisode.count({ where: { accountId: account!.id } });
      activeEpisode = await prisma.$transaction(async (tx) => {
        const ep = await tx.paperTradingEpisode.create({
          data: {
            accountId: account!.id,
            episodeNumber: episodeCount + 1,
            startingCash: account!.currentCash,
            status: 'ACTIVE',
          },
        });
        await tx.paperTradingAccount.update({
          where: { id: account!.id },
          data: { activeEpisodeId: ep.id },
        });
        return ep;
      });
    }

    return { account: account!, activeEpisode };
  }

  /**
   * Reset simulation for a user
   * Preserves historical episodes, orders, fills, and ledger records for auditing
   */
  public async resetSimulation(userId: string, reason = 'User requested simulation reset'): Promise<{ success: boolean; newEpisodeNumber: number }> {
    const { account, activeEpisode } = await this.getOrCreateAccount(userId);

    const episodeCount = await prisma.paperTradingEpisode.count({ where: { accountId: account.id } });

    await prisma.$transaction(async (tx) => {
      // 1. Mark current episode as RESET
      await tx.paperTradingEpisode.update({
        where: { id: activeEpisode.id },
        data: {
          status: 'RESET',
          endingCash: account.currentCash,
          resetReason: reason,
          endedAt: new Date(),
        },
      });

      // 2. Create new active episode with fresh initial capital
      const newEpisode = await tx.paperTradingEpisode.create({
        data: {
          accountId: account.id,
          episodeNumber: episodeCount + 1,
          startingCash: INITIAL_CASH_INR,
          status: 'ACTIVE',
        },
      });

      // 3. Update account state
      await tx.paperTradingAccount.update({
        where: { id: account.id },
        data: {
          currentCash: INITIAL_CASH_INR,
          activeEpisodeId: newEpisode.id,
        },
      });

      // 4. Log initial capital entry in cash ledger for new episode
      await tx.cashLedgerEntry.create({
        data: {
          accountId: account.id,
          episodeId: newEpisode.id,
          entryType: 'INITIAL_CAPITAL',
          amount: INITIAL_CASH_INR,
          balanceAfter: INITIAL_CASH_INR,
          description: `Simulation reset to fresh episode #${episodeCount + 1} with ₹${INITIAL_CASH_INR.toLocaleString('en-IN')}`,
        },
      });
    });

    return { success: true, newEpisodeNumber: episodeCount + 1 };
  }

  /**
   * Place an order (MARKET or LIMIT)
   */
  public async placeOrder(input: PlaceOrderInput): Promise<ExecutionResult> {
    const { userId, symbol, side, type, quantity, limitPrice, clientOrderId } = input;

    // 1. Validate inputs
    if (!symbol || !side || !type || !quantity) {
      return { success: false, status: 'REJECTED', message: 'Missing required order parameters (symbol, side, type, quantity).' };
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return { success: false, status: 'REJECTED', message: `Invalid share quantity (${quantity}). Must be a positive integer.` };
    }
    if (type === 'LIMIT' && (!limitPrice || limitPrice <= 0)) {
      return { success: false, status: 'REJECTED', message: 'A valid positive limit price is required for LIMIT orders.' };
    }

    // 2. Get user account and active episode
    const { account, activeEpisode } = await this.getOrCreateAccount(userId);

    // 3. Check idempotency if clientOrderId is provided
    if (clientOrderId) {
      const existing = await prisma.paperOrder.findFirst({
        where: { accountId: account.id, clientOrderId },
        include: { fills: true },
      });
      if (existing) {
        return {
          success: existing.status === 'FILLED' || existing.status === 'OPEN',
          orderId: existing.id,
          status: existing.status as any,
          message: `Duplicate order detected (clientOrderId: ${clientOrderId}). Returning existing order state.`,
        };
      }
    }

    // 4. Fetch latest market quote from Eulerpool adapter
    const quote = await eulerpoolService.getQuote(symbol);

    // Verify quote freshness
    if (quote.freshnessStatus === 'stale') {
      const providerAge = quote.providerTimestamp ? (Date.now() - new Date(quote.providerTimestamp).getTime()) / 1000 : null;
      if (providerAge && providerAge > MAX_STALE_QUOTE_AGE_SECONDS) {
        return {
          success: false,
          status: 'REJECTED',
          message: `Execution rejected: market quote for ${symbol} is stale (${Math.round(providerAge / 60)} minutes old). Simulated trading safeguards require recent quote data.`,
        };
      }
    }

    // 5. Check user position if SELL order
    if (side === 'SELL') {
      const position = await prisma.paperPosition.findUnique({
        where: {
          accountId_episodeId_symbol: {
            accountId: account.id,
            episodeId: activeEpisode.id,
            symbol: quote.symbol,
          },
        },
      });

      const ownedShares = position ? position.quantity : 0;
      if (ownedShares < quantity) {
        return {
          success: false,
          status: 'REJECTED',
          message: `Insufficient shares. You own ${ownedShares} shares of ${quote.symbol}, but attempted to sell ${quantity}. Short selling is disabled.`,
        };
      }
    }

    // 6. Handle MARKET Orders
    let result: ExecutionResult;
    if (type === 'MARKET') {
      result = await this.executeMarketOrder({
        account,
        activeEpisode,
        quote,
        side,
        quantity,
        clientOrderId,
      });
    } else {
      // 7. Handle LIMIT Orders
      result = await this.queueLimitOrder({
        account,
        activeEpisode,
        quote,
        side,
        quantity,
        limitPrice: limitPrice!,
        clientOrderId,
      });
    }

    if (result.success) {
      await rewardService.recordQuestProgress(
        userId,
        type === 'LIMIT' ? 'LIMIT_ORDER' : 'TRADE',
        1,
        { isLimit: type === 'LIMIT' }
      );
    }

    return result;
  }

  /**
   * Execute immediate MARKET order
   */
  private async executeMarketOrder(params: {
    account: any;
    activeEpisode: any;
    quote: NormalizedQuote;
    side: 'BUY' | 'SELL';
    quantity: number;
    clientOrderId?: string;
  }): Promise<ExecutionResult> {
    const { account, activeEpisode, quote, side, quantity, clientOrderId } = params;

    // Calculate slippage and execution price
    // BUY slips UP by slippageBps, SELL slips DOWN by slippageBps
    const slippageMultiplier = side === 'BUY' ? (1 + SLIPPAGE_BPS / 10000) : (1 - SLIPPAGE_BPS / 10000);
    const fillPrice = round2(quote.price * slippageMultiplier);
    const grossAmount = round2(fillPrice * quantity);
    const fee = round2(grossAmount * FEE_RATE);
    const netAmount = side === 'BUY' ? round2(grossAmount + fee) : round2(grossAmount - fee);

    // BUY Validation: Check cash balance
    if (side === 'BUY' && account.currentCash < netAmount) {
      return {
        success: false,
        status: 'REJECTED',
        message: `Insufficient cash for BUY. Required: ₹${netAmount.toLocaleString('en-IN')} (incl. ₹${fee.toFixed(2)} fee), Available: ₹${account.currentCash.toLocaleString('en-IN')}.`,
      };
    }

    // ATOMIC TRANSACTION: Order -> Fill -> Ledger -> Account Cash -> Position
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create PaperOrder
      const order = await tx.paperOrder.create({
        data: {
          accountId: account.id,
          episodeId: activeEpisode.id,
          symbol: quote.symbol,
          companyName: quote.companyName,
          side,
          type: 'MARKET',
          quantity,
          status: 'FILLED',
          clientOrderId,
        },
      });

      // 2. Create PaperOrderFill
      const fill = await tx.paperOrderFill.create({
        data: {
          orderId: order.id,
          shares: quantity,
          fillPrice,
          slippageBps: SLIPPAGE_BPS,
          fee,
          grossAmount,
          netAmount,
          marketObservation: JSON.stringify({
            price: quote.price,
            dataSource: quote.dataSource,
            providerTimestamp: quote.providerTimestamp,
            receivedTimestamp: quote.receivedTimestamp,
            freshnessStatus: quote.freshnessStatus,
          }),
        },
      });

      // 3. Update Account Cash
      const newCash = side === 'BUY' ? round2(account.currentCash - netAmount) : round2(account.currentCash + netAmount);
      await tx.paperTradingAccount.update({
        where: { id: account.id },
        data: { currentCash: newCash },
      });

      // 4. Record Cash Ledger Entry (Source of Truth)
      await tx.cashLedgerEntry.create({
        data: {
          accountId: account.id,
          episodeId: activeEpisode.id,
          entryType: side === 'BUY' ? 'TRADE_BUY' : 'TRADE_SELL',
          amount: side === 'BUY' ? -netAmount : netAmount,
          balanceAfter: newCash,
          referenceId: fill.id,
          description: `${side} ${quantity} ${quote.symbol} @ ₹${fillPrice.toFixed(2)} (Fee: ₹${fee.toFixed(2)})`,
        },
      });

      // 5. Update Position
      const existingPos = await tx.paperPosition.findUnique({
        where: {
          accountId_episodeId_symbol: {
            accountId: account.id,
            episodeId: activeEpisode.id,
            symbol: quote.symbol,
          },
        },
      });

      if (side === 'BUY') {
        if (existingPos) {
          const newQty = existingPos.quantity + quantity;
          const newTotalCostBasis = round2(existingPos.totalCostBasis + netAmount);
          const newAvgCost = round2(newTotalCostBasis / newQty);

          await tx.paperPosition.update({
            where: { id: existingPos.id },
            data: {
              quantity: newQty,
              avgCost: newAvgCost,
              totalCostBasis: newTotalCostBasis,
              companyName: quote.companyName,
            },
          });
        } else {
          await tx.paperPosition.create({
            data: {
              accountId: account.id,
              episodeId: activeEpisode.id,
              symbol: quote.symbol,
              companyName: quote.companyName,
              quantity,
              avgCost: round2(netAmount / quantity),
              totalCostBasis: netAmount,
              realizedPnl: 0,
            },
          });
        }
      } else {
        // SELL: Calculate Realized P&L
        const remainingQty = existingPos!.quantity - quantity;
        const costBasisAllocated = round2(existingPos!.avgCost * quantity);
        const realizedPnlOnTrade = round2(netAmount - costBasisAllocated);
        const newAccumulatedRealized = round2(existingPos!.realizedPnl + realizedPnlOnTrade);

        if (remainingQty <= 0) {
          // Position fully closed
          await tx.paperPosition.delete({
            where: { id: existingPos!.id },
          });
        } else {
          const remainingCostBasis = round2(existingPos!.totalCostBasis - costBasisAllocated);
          await tx.paperPosition.update({
            where: { id: existingPos!.id },
            data: {
              quantity: remainingQty,
              totalCostBasis: remainingCostBasis,
              realizedPnl: newAccumulatedRealized,
            },
          });
        }
      }

      return { order, fill, newCash };
    });

    return {
      success: true,
      orderId: result.order.id,
      status: 'FILLED',
      fillPrice,
      shares: quantity,
      slippageBps: SLIPPAGE_BPS,
      fee,
      grossAmount,
      netAmount,
      cashRemaining: result.newCash,
      message: `Executed MARKET ${side} for ${quantity} shares of ${quote.symbol} at ₹${fillPrice.toFixed(2)} (Slippage: ${SLIPPAGE_BPS} bps, Fee: ₹${fee.toFixed(2)})`,
    };
  }

  /**
   * Queue a LIMIT order
   */
  private async queueLimitOrder(params: {
    account: any;
    activeEpisode: any;
    quote: NormalizedQuote;
    side: 'BUY' | 'SELL';
    quantity: number;
    limitPrice: number;
    clientOrderId?: string;
  }): Promise<ExecutionResult> {
    const { account, activeEpisode, quote, side, quantity, limitPrice, clientOrderId } = params;

    // Reserve check for BUY: Ensure user has sufficient cash for the limit order
    const estimatedCost = round2(limitPrice * quantity);
    const estimatedFee = round2(estimatedCost * FEE_RATE);
    const totalRequired = round2(estimatedCost + estimatedFee);

    if (side === 'BUY' && account.currentCash < totalRequired) {
      return {
        success: false,
        status: 'REJECTED',
        message: `Insufficient cash for limit BUY order. Required limit reserve: ₹${totalRequired.toLocaleString('en-IN')}, Available: ₹${account.currentCash.toLocaleString('en-IN')}.`,
      };
    }

    // Immediate fill condition check:
    // If BUY and quote.price <= limitPrice -> Can execute immediately
    // If SELL and quote.price >= limitPrice -> Can execute immediately
    const canFillImmediately = (side === 'BUY' && quote.price <= limitPrice) ||
                               (side === 'SELL' && quote.price >= limitPrice);

    if (canFillImmediately) {
      return this.executeMarketOrder({
        account,
        activeEpisode,
        quote,
        side,
        quantity,
        clientOrderId,
      });
    }

    // Otherwise, queue as OPEN order
    const order = await prisma.paperOrder.create({
      data: {
        accountId: account.id,
        episodeId: activeEpisode.id,
        symbol: quote.symbol,
        companyName: quote.companyName,
        side,
        type: 'LIMIT',
        quantity,
        limitPrice,
        status: 'OPEN',
        clientOrderId,
      },
    });

    return {
      success: true,
      orderId: order.id,
      status: 'OPEN',
      shares: quantity,
      message: `Limit order placed: ${side} ${quantity} ${quote.symbol} @ target ₹${limitPrice.toFixed(2)}. (Currently queued pending market price).`,
    };
  }

  /**
   * Cancel an open limit order
   */
  public async cancelOrder(userId: string, orderId: string): Promise<{ success: boolean; message: string }> {
    const { account } = await this.getOrCreateAccount(userId);

    const order = await prisma.paperOrder.findFirst({
      where: { id: orderId, accountId: account.id },
    });

    if (!order) {
      return { success: false, message: 'Order not found or unauthorized.' };
    }
    if (order.status !== 'OPEN' && order.status !== 'PENDING') {
      return { success: false, message: `Cannot cancel order in state ${order.status}. Only OPEN or PENDING orders can be cancelled.` };
    }

    await prisma.paperOrder.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
    });

    return { success: true, message: `Order #${orderId.slice(0, 8)} cancelled successfully.` };
  }

  /**
   * Evaluate open limit orders against current market observations
   */
  public async evaluateOpenOrders(userId: string): Promise<number> {
    const { account, activeEpisode } = await this.getOrCreateAccount(userId);

    const openOrders = await prisma.paperOrder.findMany({
      where: {
        accountId: account.id,
        episodeId: activeEpisode.id,
        status: 'OPEN',
      },
    });

    let filledCount = 0;
    for (const order of openOrders) {
      if (!order.limitPrice) continue;
      try {
        const quote = await eulerpoolService.getQuote(order.symbol);
        const shouldFill = (order.side === 'BUY' && quote.price <= order.limitPrice) ||
                           (order.side === 'SELL' && quote.price >= order.limitPrice);

        if (shouldFill) {
          const res = await this.executeMarketOrder({
            account,
            activeEpisode,
            quote,
            side: order.side as 'BUY' | 'SELL',
            quantity: order.quantity,
          });
          if (res.success) {
            // Update the original order to FILLED
            await prisma.paperOrder.update({
              where: { id: order.id },
              data: { status: 'FILLED' },
            });
            filledCount++;
          }
        }
      } catch (err) {
        console.warn(`[ExecutionEngine] Error evaluating open order ${order.id}:`, err);
      }
    }

    return filledCount;
  }

  /**
   * Get full portfolio snapshot with current valuations, P&L, and portfolio weights
   */
  public async getPortfolioSnapshot(userId: string) {
    const { account, activeEpisode } = await this.getOrCreateAccount(userId);

    // Run open order evaluation in background
    this.evaluateOpenOrders(userId).catch(() => {});

    // Fetch positions for active episode
    const positions = await prisma.paperPosition.findMany({
      where: { accountId: account.id, episodeId: activeEpisode.id },
      orderBy: { symbol: 'asc' },
    });

    // Fetch open orders
    const openOrders = await prisma.paperOrder.findMany({
      where: { accountId: account.id, episodeId: activeEpisode.id, status: 'OPEN' },
      orderBy: { createdAt: 'desc' },
    });

    // Fetch recent order history (last 50)
    const recentOrders = await prisma.paperOrder.findMany({
      where: { accountId: account.id, episodeId: activeEpisode.id },
      include: { fills: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Fetch cash ledger entries (last 50)
    const ledger = await prisma.cashLedgerEntry.findMany({
      where: { accountId: account.id, episodeId: activeEpisode.id },
      orderBy: { timestamp: 'desc' },
      take: 50,
    });

    // Compute live positions with quotes
    let totalInvestedCost = 0;
    let totalMarketValue = 0;
    let totalRealizedPnl = 0;

    const enrichedPositions = await Promise.all(
      positions.map(async (pos) => {
        const quote = await eulerpoolService.getQuote(pos.symbol);
        const currentPrice = quote.price;
        const marketValue = round2(pos.quantity * currentPrice);
        const unrealizedPnl = round2(marketValue - pos.totalCostBasis);
        const unrealizedPnlPercent = pos.totalCostBasis > 0 ? round2((unrealizedPnl / pos.totalCostBasis) * 100) : 0;

        totalInvestedCost += pos.totalCostBasis;
        totalMarketValue += marketValue;
        totalRealizedPnl += pos.realizedPnl;

        return {
          id: pos.id,
          symbol: pos.symbol,
          companyName: pos.companyName || quote.companyName,
          quantity: pos.quantity,
          avgCost: pos.avgCost,
          totalCostBasis: pos.totalCostBasis,
          currentPrice,
          marketValue,
          unrealizedPnl,
          unrealizedPnlPercent,
          realizedPnl: pos.realizedPnl,
          quoteFreshness: quote.freshnessStatus,
          quoteSource: quote.dataSource,
          quoteTimestamp: quote.providerTimestamp || quote.receivedTimestamp,
        };
      })
    );

    const portfolioEquity = round2(account.currentCash + totalMarketValue);
    const totalUnrealizedPnl = round2(totalMarketValue - totalInvestedCost);
    const startingCash = activeEpisode.startingCash || INITIAL_CASH_INR;
    const overallReturnPercent = startingCash > 0 ? round2(((portfolioEquity - startingCash) / startingCash) * 100) : 0;

    // Attach portfolio weights
    const positionsWithWeights = enrichedPositions.map((pos) => ({
      ...pos,
      weightPercent: portfolioEquity > 0 ? round2((pos.marketValue / portfolioEquity) * 100) : 0,
    }));

    return {
      account: {
        id: account.id,
        userId: account.userId,
        currency: account.currency,
        currentCash: account.currentCash,
        startingCash,
        portfolioEquity,
        investedCapital: round2(totalInvestedCost),
        marketValue: round2(totalMarketValue),
        totalUnrealizedPnl,
        totalRealizedPnl: round2(totalRealizedPnl),
        overallReturnPercent,
        activeEpisodeNumber: activeEpisode.episodeNumber,
        activeEpisodeStartedAt: activeEpisode.startedAt,
      },
      positions: positionsWithWeights,
      openOrders,
      recentOrders,
      ledger,
    };
  }
}

export const paperExecutionEngine = new PaperExecutionEngine();
