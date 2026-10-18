import { Request, Response } from 'express';
import { prisma } from '../prisma.js';

export const getPortfolio = async (_req: Request, res: Response) => {
  try {
    const user = await prisma.user.findFirst({
      select: {
        id: true,
        cashBalance: true,
        startingBalance: true,
        holdings: true,
        orders: { where: { status: 'PENDING' }, orderBy: { createdAt: 'desc' } },
        trades: { orderBy: { timestamp: 'desc' }, take: 50 },
      },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Database error' });
  }
};

export const placeOrder = async (req: Request, res: Response) => {
  try {
    const { symbol, side, type, shares, limitPrice, currentPrice } = req.body;

    if (!symbol || !side || !type || !shares || shares <= 0) {
      res.status(400).json({ success: false, message: 'Invalid order parameters' });
      return;
    }

    const user = await prisma.user.findFirst({
      include: { holdings: true },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const execPrice = type === 'MARKET' ? (currentPrice || limitPrice) : limitPrice;
    const totalCost = execPrice * shares;

    // BUY Validation
    if (side === 'BUY' && user.cashBalance < totalCost) {
      res.status(400).json({
        success: false,
        message: `Insufficient funds. Required: ₹${totalCost.toLocaleString('en-IN')}, Available: ₹${user.cashBalance.toLocaleString('en-IN')}`,
      });
      return;
    }

    // SELL Validation
    const existingHolding = user.holdings.find(h => h.symbol === symbol);
    if (side === 'SELL' && (!existingHolding || existingHolding.shares < shares)) {
      res.status(400).json({
        success: false,
        message: `Insufficient shares. You own ${existingHolding ? existingHolding.shares : 0} of ${symbol}.`,
      });
      return;
    }

    // Process MARKET Order (Immediate execution)
    if (type === 'MARKET') {
      await prisma.$transaction(async (tx) => {
        // 1. Update User Cash
        const newCash = side === 'BUY' ? user.cashBalance - totalCost : user.cashBalance + totalCost;
        await tx.user.update({
          where: { id: user.id },
          data: { cashBalance: newCash },
        });

        // 2. Update Holdings
        if (side === 'BUY') {
          if (existingHolding) {
            const newTotalShares = existingHolding.shares + shares;
            const newAvgCost = (existingHolding.shares * existingHolding.avgCost + totalCost) / newTotalShares;
            await tx.portfolioHolding.update({
              where: { id: existingHolding.id },
              data: { shares: newTotalShares, avgCost: newAvgCost },
            });
          } else {
            await tx.portfolioHolding.create({
              data: {
                userId: user.id,
                symbol,
                shares,
                avgCost: execPrice,
              },
            });
          }
        } else {
          // SELL
          const newShares = (existingHolding?.shares || 0) - shares;
          if (newShares <= 0) {
            await tx.portfolioHolding.delete({
              where: { id: existingHolding!.id },
            });
          } else {
            await tx.portfolioHolding.update({
              where: { id: existingHolding!.id },
              data: { shares: newShares },
            });
          }
        }

        // 3. Log executed trade
        await tx.tradeLog.create({
          data: {
            userId: user.id,
            symbol,
            side,
            shares,
            price: execPrice,
            total: totalCost,
          },
        });
      });

      res.json({
        success: true,
        message: `Executed MARKET ${side} for ${shares} shares of ${symbol} at ₹${execPrice.toFixed(2)}`,
      });
      return;
    }

    // Process LIMIT Order (Pending execution)
    const newOrder = await prisma.tradeOrder.create({
      data: {
        userId: user.id,
        symbol,
        side,
        type: 'LIMIT',
        shares,
        targetPrice: limitPrice,
        status: 'PENDING',
      },
    });

    res.json({
      success: true,
      message: `Limit order placed for ${shares} shares of ${symbol} at target ₹${limitPrice.toFixed(2)}`,
      data: newOrder,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Database error' });
  }
};

export const cancelOrder = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      res.status(400).json({ success: false, message: 'Missing orderId' });
      return;
    }

    const order = await prisma.tradeOrder.findUnique({
      where: { id: orderId },
    });

    if (!order || order.status !== 'PENDING') {
      res.status(404).json({ success: false, message: 'Order not found or already processed' });
      return;
    }

    await prisma.tradeOrder.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
    });

    res.json({ success: true, message: 'Order cancelled successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Database error' });
  }
};
