import React, { useState, useEffect, useMemo } from 'react';
import {
  AlertTriangle,
  RotateCcw,
  Star,
  CheckCircle2,
  BookOpen,
  ShieldCheck,
  Search,
  X,
  Award
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TradingChart } from '../components/TradingChart';
import nseSymbols from '../data/symbols.json';
import { api } from '../services/api';

interface BackendPosition {
  id: string;
  symbol: string;
  companyName?: string;
  quantity: number;
  avgCost: number;
  totalCostBasis: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  realizedPnl: number;
  weightPercent: number;
  quoteFreshness?: string;
  quoteSource?: string;
  quoteTimestamp?: string;
}

interface BackendOrder {
  id: string;
  symbol: string;
  companyName?: string;
  side: 'BUY' | 'SELL';
  type: 'MARKET' | 'LIMIT';
  quantity: number;
  limitPrice?: number;
  status: string;
  createdAt: string;
  fills?: Array<{
    id: string;
    fillPrice: number;
    slippageBps: number;
    fee: number;
    grossAmount: number;
    netAmount: number;
    executedAt: string;
    marketObservation?: string;
  }>;
}

interface BackendLedgerEntry {
  id: string;
  entryType: string;
  amount: number;
  balanceAfter: number;
  description: string;
  timestamp: string;
  referenceId?: string;
}

interface LearningChallenge {
  id: string;
  title: string;
  description: string;
  category: string;
  progress: number;
  target: number;
  completed: boolean;
}

export const SimulatorPage: React.FC = () => {
  const {
    stocks,
    isMarketOpen,
    marketStatusText,
    cashBalance,
    holdings,
    openOrders,
    tradeLog,
    placeOrder: localPlaceOrder,
    cancelOrder: localCancelOrder,
    formatMoney,
    addMockStock,
    addToast,
    refreshDailyQuests,
  } = useApp();

  // Selection & Chart State
  const [selectedSymbol, setSelectedSymbol] = useState<string>('RELIANCE');
  const [chartType, setChartType] = useState<'candlestick' | 'line' | 'area' | 'bar' | 'step'>('candlestick');
  const [chartTimeframe, setChartTimeframe] = useState<'1D' | '1W' | '1M' | '3M' | '1Y'>('1D');
  const [showSMA, setShowSMA] = useState(false);
  const [showEMA, setShowEMA] = useState(false);
  const [showBollinger, setShowBollinger] = useState(false);
  const [showRSI, setShowRSI] = useState(false);
  const [showMACD, setShowMACD] = useState(false);

  // Search & Watchlist state
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchIndex, setSearchIndex] = useState(-1);
  const [watchlistSymbols, setWatchlistSymbols] = useState<string[]>(['RELIANCE', 'TCS', 'HDFCBANK', 'INFY']);
  const [watchlistOnly, setWatchlistOnly] = useState(false);

  // Order Entry Form State
  const [orderSide, setOrderSide] = useState<'BUY' | 'SELL'>('BUY');
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [quantity, setQuantity] = useState<number>(1);
  const [limitPriceInput, setLimitPriceInput] = useState<string>('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Bottom Desk Navigation Tab
  const [activeTab, setActiveTab] = useState<'holdings' | 'orders' | 'history' | 'ledger'>('holdings');

  // Modals & Panels
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [showLearningDrawer, setShowLearningDrawer] = useState(false);
  const [learningStep, setLearningStep] = useState(1);

  // Backend Sync State (Phase 3)
  const [backendPortfolio, setBackendPortfolio] = useState<{
    account?: {
      currentCash: number;
      startingCash: number;
      portfolioEquity: number;
      investedCapital: number;
      marketValue: number;
      totalUnrealizedPnl: number;
      totalRealizedPnl: number;
      overallReturnPercent: number;
      activeEpisodeNumber: number;
      activeEpisodeStartedAt: string;
    };
    positions?: BackendPosition[];
    openOrders?: BackendOrder[];
    recentOrders?: BackendOrder[];
    ledger?: BackendLedgerEntry[];
  } | null>(null);

  const [challenges, setChallenges] = useState<LearningChallenge[]>([]);
  const [liveQuote, setLiveQuote] = useState<{
    price: number;
    change: number;
    changePercent: number;
    dataSource: string;
    freshnessStatus: string;
    delayDescription: string;
    providerTimestamp: string | null;
    receivedTimestamp: string;
  } | null>(null);

  // Load backend portfolio & sync
  const fetchBackendPortfolio = async () => {
    try {
      const data = await api.getPaperPortfolio();
      if (data && data.account) {
        setBackendPortfolio(data);
      }
      const ch = await api.getPaperChallenges();
      if (ch && Array.isArray(ch)) {
        setChallenges(ch);
      }
      const wl = await api.getWatchlist();
      if (wl && Array.isArray(wl) && wl.length > 0) {
        setWatchlistSymbols(wl.map((w: any) => w.symbol));
      }
    } catch (e) {
      console.warn('Failed to fetch backend paper portfolio snapshot:', e);
    }
  };

  useEffect(() => {
    fetchBackendPortfolio();
    const interval = setInterval(fetchBackendPortfolio, 10000);
    return () => clearInterval(interval);
  }, []);

  // Fetch live quote for currently selected symbol
  useEffect(() => {
    let isCancelled = false;
    const fetchQuote = async () => {
      try {
        const q = await api.getMarketQuote(selectedSymbol);
        if (q && !isCancelled) {
          setLiveQuote({
            price: q.price,
            change: q.change,
            changePercent: q.changePercent,
            dataSource: q.dataSource,
            freshnessStatus: q.freshnessStatus,
            delayDescription: q.delayDescription,
            providerTimestamp: q.providerTimestamp,
            receivedTimestamp: q.receivedTimestamp,
          });
        }
      } catch (err) {
        console.warn('Quote fetch error:', err);
      }
    };
    fetchQuote();
    const qInterval = setInterval(fetchQuote, 15000);
    return () => {
      isCancelled = true;
      clearInterval(qInterval);
    };
  }, [selectedSymbol]);

  // Dynamic historical candles from server or deep local fallback
  const [serverCandles, setServerCandles] = useState<any[] | null>(null);

  useEffect(() => {
    let isCancelled = false;
    const fetchCandles = async () => {
      try {
        const candles = await api.getMarketCandles(selectedSymbol, chartTimeframe);
        if (candles && Array.isArray(candles) && candles.length > 0 && !isCancelled) {
          setServerCandles(candles);
          return;
        }
      } catch (err) {
        console.warn('Failed to load server candles:', err);
      }
      if (!isCancelled) {
        setServerCandles(null);
      }
    };
    fetchCandles();
    return () => { isCancelled = true; };
  }, [selectedSymbol, chartTimeframe]);

  // Fallback stock lookup from stocks array
  const currentStock = stocks.find(s => s.symbol === selectedSymbol) || stocks[0];
  const activePrice = liveQuote?.price || currentStock.price;

  // Search results
  const searchResults = searchQuery.length >= 2
    ? nseSymbols.filter(s =>
        s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 8)
    : [];

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || searchResults.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSearchIndex(prev => (prev < searchResults.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSearchIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = searchIndex >= 0 ? searchResults[searchIndex] : searchResults[0];
      if (selected) {
        addMockStock(selected.symbol, selected.name);
        setSelectedSymbol(selected.symbol);
        setSearchQuery('');
        setShowDropdown(false);
        setSearchIndex(-1);
      }
    }
  };

  // Watchlist toggle
  const isWatched = watchlistSymbols.includes(selectedSymbol);
  const toggleWatchlist = async (symbolToToggle: string) => {
    const isCurrentlyWatched = watchlistSymbols.includes(symbolToToggle);
    if (isCurrentlyWatched) {
      setWatchlistSymbols(prev => prev.filter(s => s !== symbolToToggle));
      await api.removeFromWatchlist(symbolToToggle);
      addToast('Removed from Watchlist', `${symbolToToggle} removed from your personal watchlist`, 'info');
    } else {
      setWatchlistSymbols(prev => [...prev, symbolToToggle]);
      await api.addToWatchlist(symbolToToggle, currentStock.name);
      addToast('Added to Watchlist ⭐', `${symbolToToggle} added to your personal watchlist`, 'info');
    }
  };

  // Financial calculations
  const effectiveCash = backendPortfolio?.account?.currentCash ?? cashBalance;
  const positionsList: BackendPosition[] = backendPortfolio?.positions && backendPortfolio.positions.length > 0
    ? backendPortfolio.positions
    : Object.values(holdings).map((h: any) => {
        const stock = stocks.find(s => s.symbol === h.symbol);
        const p = stock ? stock.price : h.avgCost;
        const mv = h.shares * p;
        const cost = h.shares * h.avgCost;
        const unPnl = mv - cost;
        return {
          id: h.symbol,
          symbol: h.symbol,
          companyName: stock?.name || `${h.symbol} Ltd`,
          quantity: h.shares,
          avgCost: h.avgCost,
          totalCostBasis: cost,
          currentPrice: p,
          marketValue: mv,
          unrealizedPnl: unPnl,
          unrealizedPnlPercent: cost > 0 ? (unPnl / cost) * 100 : 0,
          realizedPnl: 0,
          weightPercent: 0,
        };
      });

  const totalHoldingsValue = positionsList.reduce((acc, p) => acc + p.marketValue, 0);
  const totalCostBasis = positionsList.reduce((acc, p) => acc + p.totalCostBasis, 0);
  const totalEquity = effectiveCash + totalHoldingsValue;
  const totalUnrealizedPnL = totalHoldingsValue - totalCostBasis;
  const unrealizedPnLPercent = totalCostBasis > 0 ? (totalUnrealizedPnL / totalCostBasis) * 100 : 0;
  const totalRealizedPnL = backendPortfolio?.account?.totalRealizedPnl ?? 0;
  const startingCapital = backendPortfolio?.account?.startingCash ?? 100000.0;
  const overallReturnPercent = startingCapital > 0 ? ((totalEquity - startingCapital) / startingCapital) * 100 : 0;
  const activeEpisodeNumber = backendPortfolio?.account?.activeEpisodeNumber ?? 1;

  // Concentration Risk metric: Find max weight
  const maxPositionWeight = useMemo(() => {
    if (totalEquity <= 0) return 0;
    return positionsList.reduce((max, p) => Math.max(max, (p.marketValue / totalEquity) * 100), 0);
  }, [positionsList, totalEquity]);

  const currentHolding = positionsList.find(p => p.symbol === selectedSymbol);
  const executionPrice = orderType === 'MARKET' ? activePrice : (Number(limitPriceInput) || activePrice);
  const estimatedNotional = executionPrice * quantity;
  const estimatedSlippage = estimatedNotional * 0.0005; // 5 bps
  const estimatedFee = estimatedNotional * 0.0003; // 0.03%
  const totalEstimatedCost = orderSide === 'BUY' ? estimatedNotional + estimatedFee : estimatedNotional - estimatedFee;

  const handleMaxQuantity = () => {
    if (orderSide === 'BUY') {
      const maxShares = Math.floor(effectiveCash / (executionPrice * 1.0005));
      setQuantity(Math.max(1, maxShares));
    } else {
      setQuantity(currentHolding ? currentHolding.quantity : 0);
    }
  };

  // Submit order flow with explicit confirmation
  const initiateOrderConfirmation = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) {
      addToast('Invalid Quantity', 'Share quantity must be a positive integer', 'info');
      return;
    }
    if (orderSide === 'BUY' && totalEstimatedCost > effectiveCash) {
      addToast('Insufficient Virtual Cash', `Required: ${formatMoney(totalEstimatedCost)}, Available: ${formatMoney(effectiveCash)}`, 'info');
      return;
    }
    if (orderSide === 'SELL' && (!currentHolding || currentHolding.quantity < quantity)) {
      addToast('Insufficient Shares', `You only hold ${currentHolding?.quantity || 0} shares of ${selectedSymbol}.`, 'info');
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmAndPlaceOrder = async () => {
    setIsSubmittingOrder(true);
    setShowConfirmModal(false);

    try {
      const res = await api.placePaperOrder({
        symbol: selectedSymbol,
        side: orderSide,
        type: orderType,
        quantity,
        limitPrice: orderType === 'LIMIT' ? Number(limitPriceInput) : undefined,
        clientOrderId: `cl_${Date.now()}`,
      });

      if (res && res.success) {
        addToast(
          `${orderSide} Order ${res.status === 'FILLED' ? 'Executed! 🚀' : 'Queued! ⏳'}`,
          res.message || `Placed ${orderSide} for ${quantity} ${selectedSymbol}`,
          'trade'
        );
        await Promise.all([fetchBackendPortfolio(), refreshDailyQuests()]);
      } else {
        // Fallback to local context execution if backend order failed or returned offline
        const localResult = localPlaceOrder(
          selectedSymbol,
          orderSide,
          orderType,
          quantity,
          orderType === 'LIMIT' ? Number(limitPriceInput) : undefined
        );
        if (localResult && localResult.success) {
          await api.recordQuestAction(orderType === 'LIMIT' ? 'LIMIT_ORDER' : 'TRADE', 1);
          await refreshDailyQuests();
        } else if (res && !res.success && res.message) {
          addToast('Order Rejected', res.message, 'info');
        }
      }
    } catch (err) {
      console.warn('Order submission error:', err);
      const localResult = localPlaceOrder(
        selectedSymbol,
        orderSide,
        orderType,
        quantity,
        orderType === 'LIMIT' ? Number(limitPriceInput) : undefined
      );
      if (localResult && localResult.success) {
        await api.recordQuestAction(orderType === 'LIMIT' ? 'LIMIT_ORDER' : 'TRADE', 1);
        await refreshDailyQuests();
      }
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Cancel limit order
  const handleCancelOrder = async (orderId: string) => {
    const res = await api.cancelPaperOrder(orderId);
    if (res && res.success) {
      addToast('Order Cancelled', res.message, 'info');
      await fetchBackendPortfolio();
    } else {
      localCancelOrder(orderId);
    }
  };

  // Reset simulation handler
  const handleResetSimulation = async () => {
    if (resetConfirmText.trim().toUpperCase() !== 'RESET') {
      addToast('Confirmation Mismatch', 'Type RESET to confirm simulation reset', 'info');
      return;
    }

    setIsResetting(true);
    try {
      const res = await api.resetPaperSimulation('Learner initiated reset from terminal');
      if (res && res.success) {
        addToast('Simulation Reset Complete 🔄', 'Fresh virtual capital of ₹1,00,000 allocated. History preserved for audit.', 'info');
        setShowResetModal(false);
        setResetConfirmText('');
        await fetchBackendPortfolio();
      } else {
        addToast('Reset Failed', res.message || 'Could not reset simulation', 'info');
      }
    } catch (err) {
      addToast('Reset Error', 'An error occurred while resetting episode', 'info');
    } finally {
      setIsResetting(false);
    }
  };

  const fallbackData = chartTimeframe === '1D'
    ? currentStock.history1D
    : (chartTimeframe === '1W'
      ? currentStock.history1W
      : (chartTimeframe === '1M'
        ? currentStock.history1M
        : (chartTimeframe === '3M' ? currentStock.history3M : currentStock.history1Y)));

  const historyData = (serverCandles && serverCandles.length > 0) ? serverCandles : fallbackData;

  return (
    <div className="w-full flex flex-col h-[calc(100vh-48px)] bg-brand-black text-brand-light font-sans overflow-hidden border-t border-brand-dark">

      {/* PORTFOLIO SUMMARY HEADER BAR */}
      <div className="flex items-center justify-between px-4 py-2 bg-brand-dark border-b border-brand-card text-xs shrink-0">
        <div className="flex items-center gap-6 font-mono flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-brand-muted text-[10px] uppercase tracking-wider">Virtual Cash</span>
            <strong className="text-brand-light text-sm">{formatMoney(effectiveCash)}</strong>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-brand-muted text-[10px] uppercase tracking-wider">Portfolio Equity</span>
            <strong className="text-brand-light text-sm">{formatMoney(totalEquity)}</strong>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-brand-muted text-[10px] uppercase tracking-wider">Unrealized P&L</span>
            <strong className={totalUnrealizedPnL >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}>
              {totalUnrealizedPnL >= 0 ? '+' : ''}{formatMoney(totalUnrealizedPnL)} ({unrealizedPnLPercent.toFixed(2)}%)
            </strong>
          </div>
          <div className="flex items-center gap-2 hidden lg:flex">
            <span className="text-brand-muted text-[10px] uppercase tracking-wider">Realized P&L</span>
            <strong className={totalRealizedPnL >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}>
              {totalRealizedPnL >= 0 ? '+' : ''}{formatMoney(totalRealizedPnL)}
            </strong>
          </div>
          <div className="flex items-center gap-2 hidden xl:flex">
            <span className="text-brand-muted text-[10px] uppercase tracking-wider">Total Return</span>
            <strong className={overallReturnPercent >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}>
              {overallReturnPercent >= 0 ? '+' : ''}{overallReturnPercent.toFixed(2)}%
            </strong>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
            Episode #{activeEpisodeNumber}
          </span>
          <button
            onClick={() => setShowLearningDrawer(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold bg-brand-orange/20 text-brand-orange hover:bg-brand-orange/30 border border-brand-orange/40 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Learning Mode</span>
          </button>
          <button
            onClick={() => setShowResetModal(true)}
            title="Reset Virtual Portfolio Simulation"
            className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-bold text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 border border-slate-700 hover:border-rose-500/40 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
          <div className="flex items-center gap-2 pl-2 border-l border-brand-card">
            <span className={`w-2 h-2 rounded-full ${isMarketOpen ? 'bg-[#10b981] animate-pulse' : 'bg-[#ef4444]'}`} />
            <span className="text-[10px] font-bold text-brand-muted hidden sm:inline">{marketStatusText}</span>
          </div>
        </div>
      </div>

      {/* 3. MAIN TERMINAL WORKSPACE */}
      <div className="flex-1 flex overflow-hidden">

        {/* LEFT PANEL: Watchlist & Stock Discovery */}
        <div className="w-64 flex flex-col border-r border-brand-card bg-brand-dark shrink-0">
          <div className="p-2 border-b border-brand-card space-y-1.5">
            <div className="relative">
              <input
                type="text"
                placeholder="Search NSE symbol or name..."
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                  setSearchIndex(-1);
                }}
                onKeyDown={handleSearchKeyDown}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                className="w-full bg-brand-card border border-brand-card rounded px-2.5 py-1.5 text-xs text-brand-light focus:outline-none focus:border-brand-orange font-mono pl-7"
              />
              <Search className="w-3.5 h-3.5 text-brand-muted absolute left-2 top-2.5" />

              {showDropdown && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-brand-card border border-brand-dark shadow-2xl z-50 max-h-60 overflow-y-auto rounded-b">
                  {searchResults.map((res, i) => (
                    <div
                      key={res.symbol}
                      onMouseEnter={() => setSearchIndex(i)}
                      onClick={() => {
                        addMockStock(res.symbol, res.name);
                        setSelectedSymbol(res.symbol);
                        setSearchQuery('');
                        setShowDropdown(false);
                        setSearchIndex(-1);
                      }}
                      className={`px-3 py-1.5 cursor-pointer flex flex-col ${i === searchIndex ? 'bg-brand-dark' : 'hover:bg-brand-dark'}`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-brand-light text-xs font-mono">{res.symbol}</span>
                        <span className="text-[9px] text-brand-orange uppercase">NSE</span>
                      </div>
                      <span className="text-brand-muted text-[10px] truncate">{res.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-[10px] pt-1">
              <button
                onClick={() => setWatchlistOnly(false)}
                className={`font-bold uppercase tracking-wider pb-0.5 border-b-2 ${!watchlistOnly ? 'border-brand-orange text-brand-light' : 'border-transparent text-brand-muted'}`}
              >
                Top NSE
              </button>
              <button
                onClick={() => setWatchlistOnly(true)}
                className={`font-bold uppercase tracking-wider pb-0.5 border-b-2 ${watchlistOnly ? 'border-brand-orange text-brand-light' : 'border-transparent text-brand-muted'}`}
              >
                My Watchlist ({watchlistSymbols.length})
              </button>
            </div>
          </div>

          {/* Stock list */}
          <div className="flex-1 overflow-y-auto">
            {stocks
              .filter(s => !watchlistOnly || watchlistSymbols.includes(s.symbol))
              .map(s => {
                const isSelected = s.symbol === selectedSymbol;
                const isPositive = s.change24h >= 0;
                return (
                  <div
                    key={s.symbol}
                    onClick={() => {
                      setSelectedSymbol(s.symbol);
                      if (orderType === 'LIMIT') setLimitPriceInput(s.price.toString());
                    }}
                    className={`px-3 py-2 cursor-pointer flex justify-between items-center border-b border-brand-card/50 transition-colors ${
                      isSelected ? 'bg-brand-card border-l-2 border-l-brand-orange' : 'hover:bg-brand-card/50'
                    }`}
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-brand-light font-mono">{s.symbol}</span>
                        {watchlistSymbols.includes(s.symbol) && (
                          <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                        )}
                      </div>
                      <span className="text-[10px] text-brand-muted max-w-[110px] truncate">{s.name}</span>
                    </div>
                    <div className="flex flex-col items-end font-mono">
                      <span className="text-xs text-brand-light font-medium">₹{s.price.toFixed(2)}</span>
                      <span className={`text-[10px] ${isPositive ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                        {isPositive ? '+' : ''}{s.change24hPercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* CENTER PANEL: Chart & Stats */}
        <div className="flex-1 flex flex-col bg-brand-black min-w-0">
          {/* OHLC Header Stats */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-brand-card bg-brand-dark flex-wrap gap-2">
            <div className="flex items-center gap-4">
              <div className="flex items-baseline gap-2">
                <h2 className="text-2xl font-bold text-brand-light font-mono">{currentStock.symbol}</h2>
                <span className="text-xs text-brand-muted max-w-[200px] truncate hidden md:inline">{currentStock.name}</span>
                <button
                  onClick={() => toggleWatchlist(currentStock.symbol)}
                  title={isWatched ? 'Remove from Watchlist' : 'Add to Watchlist'}
                  className="p-1 rounded hover:bg-slate-800 transition-colors"
                >
                  <Star className={`w-4 h-4 ${isWatched ? 'text-amber-400 fill-amber-400' : 'text-slate-500 hover:text-amber-400'}`} />
                </button>
              </div>

              <div className="flex items-center gap-3 font-mono text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-brand-light font-bold text-lg">₹{activePrice.toFixed(2)}</span>
                  <span className={`${currentStock.change24h >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                    {currentStock.change24h >= 0 ? '+' : ''}{currentStock.change24h.toFixed(2)} ({currentStock.change24hPercent.toFixed(2)}%)
                  </span>
                </div>
                <div className="h-4 w-px bg-brand-card hidden sm:block" />
                <div className="flex gap-3 text-[10px] hidden sm:flex">
                  <div><span className="text-brand-muted mr-1">O</span><span className="text-brand-light">{(historyData[historyData.length - 1]?.open || activePrice).toFixed(2)}</span></div>
                  <div><span className="text-brand-muted mr-1">H</span><span className="text-brand-light">{currentStock.high24h.toFixed(2)}</span></div>
                  <div><span className="text-brand-muted mr-1">L</span><span className="text-brand-light">{currentStock.low24h.toFixed(2)}</span></div>
                  <div><span className="text-brand-muted mr-1">C</span><span className="text-brand-light">{currentStock.previousClose.toFixed(2)}</span></div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                NSE: EQ
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950/40 text-indigo-300 border border-indigo-700/40">
                INR (₹)
              </span>
            </div>
          </div>

          {/* Chart Controls */}
          <div className="flex items-center gap-4 px-4 py-1.5 border-b border-brand-card bg-brand-dark text-[10px] flex-wrap">
            <div className="flex gap-0.5">
              {(['candlestick', 'line', 'area', 'bar'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setChartType(type)}
                  className={`px-2 py-1 rounded uppercase font-bold transition-colors ${chartType === type ? 'bg-brand-card text-brand-light' : 'text-brand-muted hover:text-brand-light'}`}
                >
                  {type}
                </button>
              ))}
            </div>
            <div className="h-3 w-px bg-brand-card" />
            <div className="flex gap-0.5 font-bold">
              {(['1D', '1W', '1M', '3M', '1Y'] as const).map(tf => (
                <button
                  key={tf}
                  onClick={() => setChartTimeframe(tf as any)}
                  className={`px-2 py-1 rounded transition-colors ${chartTimeframe === tf ? 'bg-brand-card text-brand-light' : 'text-brand-muted hover:text-brand-light'}`}
                >
                  {tf}
                </button>
              ))}
            </div>
            <div className="h-3 w-px bg-brand-card" />
            <div className="flex gap-0.5 font-bold">
              <button onClick={() => setShowSMA(!showSMA)} className={`px-2 py-1 rounded border ${showSMA ? 'bg-brand-card border-brand-muted text-brand-light' : 'border-transparent text-brand-muted'}`}>SMA</button>
              <button onClick={() => setShowEMA(!showEMA)} className={`px-2 py-1 rounded border ${showEMA ? 'bg-brand-card border-brand-muted text-brand-light' : 'border-transparent text-brand-muted'}`}>EMA</button>
              <button onClick={() => setShowBollinger(!showBollinger)} className={`px-2 py-1 rounded border ${showBollinger ? 'bg-brand-card border-brand-muted text-brand-light' : 'border-transparent text-brand-muted'}`}>BB</button>
              <button onClick={() => setShowRSI(!showRSI)} className={`px-2 py-1 rounded border ${showRSI ? 'bg-brand-card border-brand-muted text-brand-light' : 'border-transparent text-brand-muted'}`}>RSI</button>
              <button onClick={() => setShowMACD(!showMACD)} className={`px-2 py-1 rounded border ${showMACD ? 'bg-brand-card border-brand-muted text-brand-light' : 'border-transparent text-brand-muted'}`}>MACD</button>
            </div>
          </div>

          {/* Chart Canvas */}
          <div className="flex-1 w-full relative min-h-0">
            <TradingChart
              data={historyData}
              type={chartType as any}
              showSMA={showSMA}
              showEMA={showEMA}
              showBollinger={showBollinger}
              showRSI={showRSI}
              showMACD={showMACD}
            />
          </div>
        </div>

        {/* RIGHT PANEL: Order Ticket & Execution Desk */}
        <div className="w-80 flex flex-col border-l border-brand-card bg-brand-dark shrink-0">
          {/* Order Ticket Header */}
          <div className="p-3 border-b border-brand-card">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">Simulated Order Ticket</span>
              <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                LONG-ONLY
              </span>
            </div>

            <div className="flex font-bold text-xs mb-3 bg-brand-card rounded p-0.5">
              <button
                type="button"
                onClick={() => setOrderSide('BUY')}
                className={`flex-1 py-1.5 rounded-sm transition-all ${orderSide === 'BUY' ? 'bg-[#10b981] text-brand-black shadow' : 'text-brand-muted hover:text-brand-light'}`}
              >
                BUY
              </button>
              <button
                type="button"
                onClick={() => setOrderSide('SELL')}
                className={`flex-1 py-1.5 rounded-sm transition-all ${orderSide === 'SELL' ? 'bg-[#ef4444] text-brand-black shadow' : 'text-brand-muted hover:text-brand-light'}`}
              >
                SELL
              </button>
            </div>

            <form onSubmit={initiateOrderConfirmation} className="space-y-2.5 font-mono text-xs">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-brand-muted uppercase">Order Type</span>
                <div className="flex gap-2 text-brand-light">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="orderType"
                      checked={orderType === 'MARKET'}
                      onChange={() => setOrderType('MARKET')}
                      className="accent-brand-orange"
                    />
                    <span>MARKET</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="orderType"
                      checked={orderType === 'LIMIT'}
                      onChange={() => {
                        setOrderType('LIMIT');
                        setLimitPriceInput(activePrice.toString());
                      }}
                      className="accent-brand-orange"
                    />
                    <span>LIMIT</span>
                  </label>
                </div>
              </div>

              {orderType === 'LIMIT' && (
                <div className="flex items-center bg-brand-card border border-brand-card rounded px-2">
                  <span className="text-brand-muted w-14 text-[10px]">LIMIT (₹)</span>
                  <input
                    type="number"
                    step="0.05"
                    required
                    value={limitPriceInput}
                    onChange={e => setLimitPriceInput(e.target.value)}
                    className="w-full bg-transparent py-1.5 text-right text-brand-light focus:outline-none"
                    placeholder="0.00"
                  />
                </div>
              )}

              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[9px] text-brand-muted">QUANTITY (SHARES)</span>
                  <button
                    type="button"
                    onClick={handleMaxQuantity}
                    className="text-[9px] text-brand-orange hover:text-brand-orange/80 font-bold uppercase"
                  >
                    MAX {orderSide}
                  </button>
                </div>
                <div className="flex items-center bg-brand-card border border-brand-card rounded px-2">
                  <span className="text-brand-muted w-14 text-[10px]">SHARES</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={quantity}
                    onChange={e => setQuantity(Math.max(1, Math.floor(Number(e.target.value))))}
                    className="w-full bg-transparent py-1.5 text-right text-brand-light focus:outline-none"
                  />
                </div>
              </div>

              {/* Cost & Slippage Breakdown */}
              <div className="bg-brand-card/50 rounded p-2 text-[10px] space-y-1 border border-brand-card">
                <div className="flex justify-between text-brand-muted">
                  <span>Gross Value:</span>
                  <span className="text-brand-light">{formatMoney(estimatedNotional)}</span>
                </div>
                <div className="flex justify-between text-brand-muted">
                  <span>Est. Slippage (5 bps):</span>
                  <span className="text-amber-400">±{formatMoney(estimatedSlippage)}</span>
                </div>
                <div className="flex justify-between text-brand-muted">
                  <span>Est. Fee (0.03%):</span>
                  <span className="text-brand-light">{formatMoney(estimatedFee)}</span>
                </div>
                <div className="flex justify-between font-bold pt-1 border-t border-brand-card text-brand-light">
                  <span>Total Margin Required:</span>
                  <span className="text-brand-orange">{formatMoney(totalEstimatedCost)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingOrder}
                className={`w-full py-2 font-bold uppercase rounded text-brand-black transition-all ${
                  orderSide === 'BUY'
                    ? 'bg-[#10b981] hover:bg-[#059669]'
                    : 'bg-[#ef4444] hover:bg-[#dc2626]'
                }`}
              >
                {orderSide} {quantity} {currentStock.symbol}
              </button>
            </form>
          </div>

          {/* Simulated Order Book Depth */}
          <div className="flex-1 flex flex-col min-h-0 border-b border-brand-card">
            <div className="px-3 py-1.5 bg-brand-dark border-b border-brand-card text-[10px] font-bold text-brand-muted uppercase flex justify-between">
              <span>Order Depth Ladder</span>
              <span>Sprd: {(activePrice * 0.0008).toFixed(2)}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 font-mono text-[10px]">
              <table className="w-full text-right">
                <thead>
                  <tr className="text-brand-muted">
                    <th className="font-normal pb-1 text-left">BID</th>
                    <th className="font-normal pb-1">QTY</th>
                    <th className="font-normal pb-1 text-left pl-2">ASK</th>
                    <th className="font-normal pb-1">QTY</th>
                  </tr>
                </thead>
                <tbody>
                  {currentStock.orderBook.bids.slice(0, 6).map((bid: any, i: number) => {
                    const ask = currentStock.orderBook.asks[i];
                    return (
                      <tr key={i} className="hover:bg-brand-card/50">
                        <td className="text-[#10b981] text-left py-0.5">{bid.price.toFixed(2)}</td>
                        <td className="text-brand-light">{bid.amount}</td>
                        <td className="text-[#ef4444] text-left pl-2 py-0.5">{ask?.price.toFixed(2) || '—'}</td>
                        <td className="text-brand-light">{ask?.amount || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Desk Tabs: Holdings | Orders | Fills | Cash Ledger */}
          <div className="flex flex-col h-2/5 bg-brand-black">
            <div className="flex bg-brand-dark border-b border-brand-card text-[10px] font-bold uppercase">
              <button
                onClick={() => setActiveTab('holdings')}
                className={`flex-1 py-1.5 transition-colors ${activeTab === 'holdings' ? 'text-brand-light border-b-2 border-brand-orange' : 'text-brand-muted hover:text-brand-light'}`}
              >
                Holdings ({positionsList.length})
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`flex-1 py-1.5 transition-colors ${activeTab === 'orders' ? 'text-brand-light border-b-2 border-brand-orange' : 'text-brand-muted hover:text-brand-light'}`}
              >
                Orders ({(backendPortfolio?.openOrders || openOrders).length})
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex-1 py-1.5 transition-colors ${activeTab === 'history' ? 'text-brand-light border-b-2 border-brand-orange' : 'text-brand-muted hover:text-brand-light'}`}
              >
                Fills
              </button>
              <button
                onClick={() => setActiveTab('ledger')}
                className={`flex-1 py-1.5 transition-colors ${activeTab === 'ledger' ? 'text-brand-light border-b-2 border-brand-orange' : 'text-brand-muted hover:text-brand-light'}`}
              >
                Ledger
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 font-mono text-[10px]">
              {/* TAB 1: HOLDINGS */}
              {activeTab === 'holdings' && (
                <div className="space-y-1.5">
                  {positionsList.length === 0 ? (
                    <div className="text-brand-muted text-center py-6">
                      <p>No open positions in Episode #{activeEpisodeNumber}.</p>
                      <span className="text-[9px] text-slate-500">Place your first buy order above to start building your portfolio.</span>
                    </div>
                  ) : (
                    positionsList.map((pos) => {
                      const isProfit = pos.unrealizedPnl >= 0;
                      return (
                        <div
                          key={pos.symbol}
                          className="p-1.5 bg-brand-card rounded flex justify-between items-center cursor-pointer hover:bg-brand-card/80 border border-brand-dark"
                          onClick={() => {
                            setSelectedSymbol(pos.symbol);
                            setOrderSide('SELL');
                          }}
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-brand-light">{pos.symbol}</span>
                              <span className="text-brand-muted">x{pos.quantity}</span>
                            </div>
                            <div className="text-[9px] text-brand-muted">
                              Avg ₹{pos.avgCost.toFixed(2)} | Val ₹{pos.marketValue.toFixed(2)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-bold ${isProfit ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                              {isProfit ? '+' : ''}₹{pos.unrealizedPnl.toFixed(2)}
                            </div>
                            <div className={`text-[9px] ${isProfit ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                              ({isProfit ? '+' : ''}{pos.unrealizedPnlPercent.toFixed(2)}%)
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* TAB 2: OPEN ORDERS */}
              {activeTab === 'orders' && (
                <div className="space-y-1.5">
                  {((backendPortfolio?.openOrders || openOrders).length === 0) ? (
                    <div className="text-brand-muted text-center py-6">No open queued orders.</div>
                  ) : (
                    (backendPortfolio?.openOrders || openOrders).map((o: any) => (
                      <div key={o.id} className="p-1.5 bg-brand-card rounded flex justify-between items-center border border-brand-dark">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className={o.side === 'BUY' ? 'text-[#10b981] font-bold' : 'text-[#ef4444] font-bold'}>{o.side}</span>
                            <span className="font-bold text-brand-light">{o.symbol}</span>
                            <span className="text-[9px] text-brand-muted">({o.type})</span>
                          </div>
                          <div className="text-[9px] text-brand-muted">
                            {o.quantity || o.shares} shares @ ₹{(o.limitPrice || o.targetPrice || 0).toFixed(2)}
                          </div>
                        </div>
                        <button
                          onClick={() => handleCancelOrder(o.id)}
                          className="px-2 py-0.5 rounded bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 border border-rose-800/40 text-[9px] font-bold uppercase"
                        >
                          Cancel
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 3: ORDER HISTORY / FILLS */}
              {activeTab === 'history' && (
                <div className="space-y-1.5">
                  {((backendPortfolio?.recentOrders || tradeLog).length === 0) ? (
                    <div className="text-brand-muted text-center py-6">No executed trade logs yet.</div>
                  ) : (
                    (backendPortfolio?.recentOrders || tradeLog).map((l: any) => {
                      const fill = l.fills && l.fills[0];
                      return (
                        <div key={l.id} className="p-1.5 bg-brand-card rounded flex justify-between items-center border border-brand-dark">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className={l.side === 'BUY' ? 'text-[#10b981] font-bold' : 'text-[#ef4444] font-bold'}>{l.side}</span>
                              <span className="font-bold text-brand-light">{l.symbol}</span>
                              <span className="text-[9px] text-slate-400">x{l.quantity || l.shares}</span>
                            </div>
                            <div className="text-[9px] text-brand-muted">
                              {fill ? `Fill ₹${fill.fillPrice.toFixed(2)} | Fee ₹${fill.fee.toFixed(2)}` : `Price ₹${l.price || 0}`}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-brand-light font-bold">
                              ₹{(fill ? fill.netAmount : (l.total || 0)).toFixed(2)}
                            </span>
                            <div className="text-[8px] text-brand-muted">
                              {new Date(l.createdAt || l.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* TAB 4: CASH LEDGER (SOURCE OF TRUTH) */}
              {activeTab === 'ledger' && (
                <div className="space-y-1.5">
                  {(!backendPortfolio?.ledger || backendPortfolio.ledger.length === 0) ? (
                    <div className="text-brand-muted text-center py-6">
                      <p>Virtual Cash: {formatMoney(effectiveCash)}</p>
                      <span className="text-[9px] text-slate-500">Transactions will record to this auditable ledger.</span>
                    </div>
                  ) : (
                    backendPortfolio.ledger.map((entry) => (
                      <div key={entry.id} className="p-1.5 bg-brand-card rounded border border-brand-dark">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-brand-light uppercase text-[9px]">{entry.entryType}</span>
                          <span className={`font-bold ${entry.amount >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                            {entry.amount >= 0 ? '+' : ''}₹{entry.amount.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-[9px] text-brand-muted truncate">{entry.description}</div>
                        <div className="flex justify-between items-center text-[8px] text-slate-500 pt-0.5 border-t border-brand-dark mt-0.5">
                          <span>Balance: ₹{entry.balanceAfter.toFixed(2)}</span>
                          <span>{new Date(entry.timestamp).toLocaleDateString('en-IN')}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* 4. ORDER CONFIRMATION MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-brand-orange" />
                <h3 className="font-bold text-slate-100 text-base">Confirm Simulated Order</h3>
              </div>
              <button onClick={() => setShowConfirmModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700 space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>Instrument:</span>
                  <span className="text-slate-100 font-bold">{currentStock.symbol} (NSE)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Action & Type:</span>
                  <span className={orderSide === 'BUY' ? 'text-[#10b981] font-bold' : 'text-[#ef4444] font-bold'}>
                    {orderSide} {orderType}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Shares:</span>
                  <span className="text-slate-100">{quantity}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Ref Price:</span>
                  <span className="text-slate-100">₹{executionPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Est. Slippage (5 bps):</span>
                  <span className="text-amber-400">₹{estimatedSlippage.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Simulated Fee (0.03%):</span>
                  <span className="text-slate-100">₹{estimatedFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-200 font-bold pt-2 border-t border-slate-700">
                  <span>Total Net Debit/Credit:</span>
                  <span className="text-brand-orange text-sm">{formatMoney(totalEstimatedCost)}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 font-sans">
                ⚠️ This is a simulated educational trade using virtual funds. No real exchange transaction will take place.
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold font-sans transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmAndPlaceOrder}
                disabled={isSubmittingOrder}
                className={`flex-1 py-2 rounded-lg text-xs font-bold font-sans text-brand-black transition-colors ${
                  orderSide === 'BUY' ? 'bg-[#10b981] hover:bg-[#059669]' : 'bg-[#ef4444] hover:bg-[#dc2626]'
                }`}
              >
                {isSubmittingOrder ? 'Placing...' : `Confirm ${orderSide}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. SIMULATION RESET MODAL (EPISODE ISOLATION) */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-lg text-slate-100">Reset Virtual Simulation</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              Resetting starts a fresh simulation episode with <strong className="text-emerald-400">₹1,00,000 virtual capital</strong>.
            </p>
            <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700 text-[11px] text-slate-400 space-y-1 mb-4">
              <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Historical Audit Safety Guarantee</span>
              </div>
              <p>
                Your past trade orders, fills, and ledger transactions in Episode #{activeEpisodeNumber} will NOT be destroyed. They remain archived for analytical comparison.
              </p>
            </div>

            <div className="space-y-1.5 mb-5">
              <label className="text-[11px] text-slate-400 font-mono">
                Type <span className="font-bold text-rose-400">RESET</span> to confirm:
              </label>
              <input
                type="text"
                value={resetConfirmText}
                onChange={e => setResetConfirmText(e.target.value)}
                placeholder="RESET"
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-rose-500 uppercase"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowResetModal(false);
                  setResetConfirmText('');
                }}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-colors"
              >
                Keep Current Episode
              </button>
              <button
                type="button"
                onClick={handleResetSimulation}
                disabled={isResetting || resetConfirmText.trim().toUpperCase() !== 'RESET'}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isResetting ? 'Resetting...' : 'Confirm Reset'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. GUIDED LEARNING MODE & CHALLENGES DRAWER */}
      {showLearningDrawer && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col p-6 overflow-y-auto">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-brand-orange" />
              <h3 className="font-bold text-slate-100 text-base">Portfolio Learning & Risk Guide</h3>
            </div>
            <button onClick={() => setShowLearningDrawer(false)} className="text-slate-400 hover:text-slate-200">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Concentration Risk Meter */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 mb-5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-200">Concentration Risk Radar</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${maxPositionWeight > 40 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'}`}>
                {maxPositionWeight > 40 ? 'HIGH RISK (>40%)' : 'BALANCED (≤40%)'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-2">
              Holding too much capital in a single stock exposes your portfolio to firm-specific shocks. Top holding currently accounts for <strong className="text-brand-orange">{maxPositionWeight.toFixed(1)}%</strong> of your equity.
            </p>
            <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${maxPositionWeight > 40 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                style={{ width: `${Math.min(100, maxPositionWeight)}%` }}
              />
            </div>
          </div>

          {/* 8-Step Progressive Learning Path */}
          <div className="mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
              <span>8-Step Investor Path</span>
              <span className="text-brand-orange font-mono">Step {learningStep} / 8</span>
            </h4>

            <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 space-y-3">
              {learningStep === 1 && (
                <div>
                  <h5 className="font-bold text-slate-100 text-sm mb-1">1. Virtual Cash vs. Portfolio Equity</h5>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Your <strong>Cash Balance</strong> is available liquidity to purchase stocks. <strong>Equity</strong> represents total net worth (Cash + current market value of all held stocks).
                  </p>
                </div>
              )}
              {learningStep === 2 && (
                <div>
                  <h5 className="font-bold text-slate-100 text-sm mb-1">2. Stock Watchlists</h5>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Watchlists let you monitor price action and delayed market quotes without committing capital. Toggle the star ⭐ icon beside any stock to track it.
                  </p>
                </div>
              )}
              {learningStep === 3 && (
                <div>
                  <h5 className="font-bold text-slate-100 text-sm mb-1">3. Market vs. Limit Orders</h5>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong>Market orders</strong> fill immediately at the current available market price with slippage. <strong>Limit orders</strong> queue until the price reaches your exact target.
                  </p>
                </div>
              )}
              {learningStep === 4 && (
                <div>
                  <h5 className="font-bold text-slate-100 text-sm mb-1">4. Cash Ledger & Friction Drag</h5>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Every trade incurs simulated transaction fees (0.03%) and slippage (5 bps). Review your <strong>Cash Ledger</strong> tab to see how friction affects long-term compounding.
                  </p>
                </div>
              )}
              {learningStep === 5 && (
                <div>
                  <h5 className="font-bold text-slate-100 text-sm mb-1">5. Realized vs. Unrealized P&L</h5>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong>Unrealized P&L</strong> is paper profit/loss on open holdings (subject to market fluctuations). <strong>Realized P&L</strong> is locked in permanently only when you sell.
                  </p>
                </div>
              )}
              {learningStep === 6 && (
                <div>
                  <h5 className="font-bold text-slate-100 text-sm mb-1">6. Diversification & Unsystematic Risk</h5>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Spreading capital across multiple uncorrelated sectors (e.g. IT, Banking, Energy) reduces volatility and guards against single-company failures.
                  </p>
                </div>
              )}
              {learningStep === 7 && (
                <div>
                  <h5 className="font-bold text-slate-100 text-sm mb-1">7. Portfolio Drawdowns</h5>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    A drawdown measures peak-to-trough decline. Practicing disciplined position sizing in paper trading builds emotional resilience for real market cycles.
                  </p>
                </div>
              )}
              {learningStep === 8 && (
                <div>
                  <h5 className="font-bold text-slate-100 text-sm mb-1">8. Historical Simulation Episodes</h5>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    When you reset your simulation, TradeWise archives all prior orders and ledger entries into numbered episodes so you can measure your learning progress over time.
                  </p>
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t border-slate-700">
                <button
                  onClick={() => setLearningStep(s => Math.max(1, s - 1))}
                  disabled={learningStep === 1}
                  className="px-3 py-1 rounded bg-slate-800 disabled:opacity-40 text-xs font-bold text-slate-300 hover:bg-slate-700"
                >
                  Previous
                </button>
                <button
                  onClick={() => setLearningStep(s => Math.min(8, s + 1))}
                  disabled={learningStep === 8}
                  className="px-3 py-1 rounded bg-brand-orange text-brand-black disabled:opacity-40 text-xs font-bold hover:bg-brand-orange/90"
                >
                  Next Step
                </button>
              </div>
            </div>
          </div>

          {/* Active Learning Challenges */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-brand-orange" />
              <span>Learning Challenges</span>
            </h4>

            <div className="space-y-2.5">
              {challenges.map(c => (
                <div key={c.id} className="bg-slate-800/60 border border-slate-700 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-xs text-slate-100">{c.title}</span>
                    {c.completed ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" /> Done
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-400">
                        {c.progress} / {c.target}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight mb-2">{c.description}</p>
                  <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-brand-orange h-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (c.progress / c.target) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
