import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import confetti from 'canvas-confetti';
import { MODULES_DATA } from '../data/modulesData';
import { INITIAL_STOCKS, type StockInstrument, generateOrderBook, generateMockStock } from '../data/stocksData';
import { getLevelInfo } from '../utils/level';
import { toDateKey } from '../utils/dateKeys';
import { api, checkBackendHealth } from '../services/api';

export interface UserProfile {
  name: string;
  email?: string;
  xp: number;
  level: number;
  streak: number;
  lastCheckInDate: string;
  currency: 'INR';
  streakFreezeAvailable: boolean;
  activityLog: Record<string, number>;
  handle?: string;            // public username, e.g. "rishi_invests"
  bio?: string;               // max 160 chars
  institution?: string;       // college / company, max 60
  city?: string;              // max 40
  experienceLevel?: 'Beginner' | 'Intermediate' | 'Advanced';
  avatarUrl?: string;         // small JPEG data URL (see 4c), optional
  avatarColor?: string;       // hex used for initials avatar when no photo
  links?: { linkedin?: string; github?: string; twitter?: string };
  joinedAt?: string;          // YYYY-MM-DD (toDateKey); set once if missing
}


export const DAILY_QUEST_POOL = [
  { id: 'q-study-1', title: 'Study any concept today', reward: 30, target: 1 },
  { id: 'q-limit-order', title: 'Place a limit order in the simulator', reward: 30, target: 1 },
  { id: 'q-quiz-perfect', title: 'Pass a quiz with a perfect score', reward: 40, target: 1 },
  { id: 'q-study-2', title: 'Study 2 concepts today', reward: 50, target: 2 },
  { id: 'q-trade-3', title: 'Place 3 trades today', reward: 40, target: 3 },
  { id: 'q-streak', title: 'Claim your daily streak bonus', reward: 20, target: 1 },
  { id: 'q-leaderboard', title: 'Visit the leaderboard today', reward: 15, target: 1 },
];

export interface DailyQuestState {
  date: string;
  id: string;
  progress: number;
  completed: boolean;
}
export interface DailyQuest {
  id: string;
  title: string;
  target: number;
  current: number;
  completed: boolean;
  xpReward: number;
}

export interface PortfolioHolding {
  symbol: string;
  shares: number;
  avgCost: number;
}

export interface TradeOrder {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'MARKET' | 'LIMIT';
  shares: number;
  targetPrice: number;
  createdAt: string;
  status: 'PENDING' | 'FILLED' | 'CANCELLED';
}

export interface TradeLog {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  shares: number;
  price: number;
  total: number;
  timestamp: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  unlocked: boolean;
  unlockedAt?: string;
  category: 'learning' | 'trading' | 'streak';
}

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type?: 'xp' | 'trade' | 'badge' | 'streak' | 'info';
}

interface AppContextType {
  user: UserProfile;
  stocks: StockInstrument[];
  isMarketOpen: boolean;
  marketStatusText: string;
  masteredConceptIds: string[];
  completedQuizScores: Record<string, number>;
  cashBalance: number;
  startingBalance: number;
  holdings: Record<string, PortfolioHolding>;
  openOrders: TradeOrder[];
  tradeLog: TradeLog[];
  badges: Badge[];
  dailyQuestState: DailyQuestState;
  activeQuestConfig: typeof DAILY_QUEST_POOL[0];
  updateDailyQuestProgress: (actionId: string, amount?: number) => void;
  quests: DailyQuest[];
  toasts: ToastMessage[];
  
  // Helpers & Formatter
  formatMoney: (amount: number) => string;
  isConceptUnlocked: (moduleId: string) => boolean;
  
  // Database & Backend State
  backendStatus: 'connected' | 'offline' | 'checking';
  dbStatusText: string;
  recheckBackend: () => Promise<void>;

  // Auth & OAuth State
  isLoggedIn: boolean;
  loginWithGoogle: (payload: { email: string; name?: string; avatarUrl?: string; credential?: string }) => Promise<boolean>;
  logout: () => void;

  // User Actions
  completeModuleQuiz: (moduleId: string, scorePercent: number) => void;
  addMockStock: (symbol: string, name: string) => Promise<void>;
  placeOrder: (symbol: string, side: 'BUY' | 'SELL', type: 'MARKET' | 'LIMIT', shares: number, limitPrice?: number) => { success: boolean; message: string };
  cancelOrder: (orderId: string) => void;
  claimDailyStreak: () => void;
  claimQuest: (questId: string) => void;
  resetAllProgress: () => void;
  removeToast: (id: string) => void;
  addToast: (title: string, message: string, type?: 'xp' | 'trade' | 'badge' | 'streak' | 'info') => void;
  updateProfile: (updates: Partial<Pick<UserProfile,
    'name'|'handle'|'bio'|'institution'|'city'|'experienceLevel'|'avatarUrl'|'avatarColor'|'links'>>) => void;
}

const INITIAL_USER: UserProfile = {
  name: 'Rishi',
  xp: 150,
  level: 1,
  streak: 3,
  lastCheckInDate: toDateKey(),
  currency: 'INR',
  streakFreezeAvailable: true,
  activityLog: {},
  joinedAt: toDateKey()
};

const INITIAL_QUESTS: DailyQuest[] = [
  { id: 'quest-1', title: 'Complete 1 Study Module', target: 1, current: 1, completed: false, xpReward: 50 },
  { id: 'quest-2', title: 'Place 1 Paper Trade in Simulator', target: 1, current: 0, completed: false, xpReward: 50 },
  { id: 'quest-3', title: 'Achieve 100% on any Concept Quiz', target: 1, current: 0, completed: false, xpReward: 75 }
];

const INITIAL_BADGES: Badge[] = [
  { id: 'first-step', title: 'First Step', description: 'Complete your first concept study module', iconName: 'BookOpen', unlocked: true, unlockedAt: '2 days ago', category: 'learning' },
  { id: 'quiz-perfectionist', title: 'Quiz Perfectionist', description: 'Score 100% on any module quiz', iconName: 'Award', unlocked: false, category: 'learning' },
  { id: 'first-trade', title: 'First Paper Trade', description: 'Place your first buy or sell order in the simulator', iconName: 'TrendingUp', unlocked: false, category: 'trading' },
  { id: 'diversifier', title: 'The Diversifier', description: 'Hold 3 or more distinct instruments in your portfolio', iconName: 'PieChart', unlocked: false, category: 'trading' },
  { id: 'streak-5', title: '5-Day Streak', description: 'Maintain a study streak for 5 consecutive days', iconName: 'Zap', unlocked: false, category: 'streak' },
  { id: 'limit-master', title: 'Limit Order Master', description: 'Execute a limit order at a target price', iconName: 'Target', unlocked: false, category: 'trading' },
  { id: 'basics-master', title: 'Basics Master', description: 'Master all concepts in the Basics category', iconName: 'ShieldCheck', unlocked: false, category: 'learning' },
  { id: 'profit-maker', title: 'Profit Maker', description: 'Achieve a portfolio unrealized gain over +5%', iconName: 'DollarSign', unlocked: false, category: 'trading' }
];

const checkNseMarketStatus = (): { isOpen: boolean; text: string } => {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const istTime = new Date(utc + (3600000 * 5.5));

  const day = istTime.getDay();
  const hour = istTime.getHours();
  const minute = istTime.getMinutes();
  const timeInMinutes = hour * 60 + minute;

  const isWeekday = day >= 1 && day <= 5;
  const marketOpenMins = 9 * 60 + 15;
  const marketCloseMins = 15 * 60 + 30;

  if (isWeekday && timeInMinutes >= marketOpenMins && timeInMinutes <= marketCloseMins) {
    return { isOpen: true, text: 'NSE Market Open (9:15 - 15:30 IST)' };
  } else {
    return { isOpen: false, text: 'NSE Market Closed (Data Delayed ~15 min)' };
  }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  
  const getDayOfYear = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = (now.getTime() - start.getTime()) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
    return Math.floor(diff / 86400000);
  };

  const todayStr = toDateKey();
  const activeQuestConfig = DAILY_QUEST_POOL[getDayOfYear() % DAILY_QUEST_POOL.length];

  const [dailyQuestState, setDailyQuestState] = useState<DailyQuestState>(() => {
    const stored = localStorage.getItem('dailyQuest');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.date === todayStr) {
        return parsed;
      }
    }
    return { date: todayStr, id: activeQuestConfig.id, progress: 0, completed: false };
  });

  useEffect(() => {
    localStorage.setItem('dailyQuest', JSON.stringify(dailyQuestState));
  }, [dailyQuestState]);

  const updateDailyQuestProgress = (actionId: string, amount: number = 1) => {
    if (dailyQuestState.date !== todayStr) return;
    if (dailyQuestState.completed) return;
    if (activeQuestConfig.id !== actionId) return;

    setDailyQuestState(prev => {
      const newProgress = Math.min(activeQuestConfig.target, prev.progress + amount);
      if (newProgress >= activeQuestConfig.target && !prev.completed) {
        setUser(u => {
          const newXP = u.xp + activeQuestConfig.reward;
          return { ...u, xp: newXP, level: getLevelInfo(newXP).level };
        });
        addToast('Daily Quest Completed! 🎁', `+${activeQuestConfig.reward} XP for: ${activeQuestConfig.title}`, 'xp');
        confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
        return { ...prev, progress: newProgress, completed: true };
      }
      return { ...prev, progress: newProgress };
    });
  };

  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('tradewise_user');
    const merged: UserProfile = saved ? { ...INITIAL_USER, ...JSON.parse(saved) } : INITIAL_USER;
    if (!merged.joinedAt) {
      merged.joinedAt = toDateKey();
    }
    return {
      ...merged,
      level: getLevelInfo(merged.xp).level
    };
  });


  // Backend & PostgreSQL Database State
  const [backendStatus, setBackendStatus] = useState<'connected' | 'offline' | 'checking'>('checking');
  const [dbStatusText, setDbStatusText] = useState<string>('Checking database...');

  const applyRemoteUserData = (remote: any) => {
    if (!remote) return;
    setUser(prev => ({
      ...prev,
      name: remote.name || prev.name,
      email: remote.email || prev.email,
      handle: remote.handle || prev.handle,
      bio: remote.bio || prev.bio,
      institution: remote.institution || prev.institution,
      city: remote.city || prev.city,
      experienceLevel: remote.experienceLevel || prev.experienceLevel,
      avatarUrl: remote.avatarUrl || prev.avatarUrl,
      avatarColor: remote.avatarColor || prev.avatarColor,
      xp: remote.xp !== undefined ? remote.xp : prev.xp,
      level: remote.level !== undefined ? remote.level : prev.level,
      streak: remote.streak !== undefined ? remote.streak : prev.streak,
      lastCheckInDate: remote.lastCheckInDate || prev.lastCheckInDate,
      activityLog: remote.activityLogs?.reduce((acc: Record<string, number>, curr: { dateKey: string; count: number }) => {
        acc[curr.dateKey] = curr.count;
        return acc;
      }, { ...prev.activityLog }) || prev.activityLog,
      links: {
        linkedin: remote.linkedin || prev.links?.linkedin,
        github: remote.github || prev.links?.github,
        twitter: remote.twitter || prev.links?.twitter,
      }
    }));

    if (remote.masteredConcepts?.length) {
      setMasteredConceptIds(prev => Array.from(new Set([...prev, ...remote.masteredConcepts.map((m: any) => m.conceptId)])));
      setCompletedQuizScores(prev => {
        const scores = { ...prev };
        remote.masteredConcepts.forEach((m: any) => {
          scores[m.conceptId] = Math.max(scores[m.conceptId] || 0, m.scorePercent);
        });
        return scores;
      });
    }

    if (remote.cashBalance !== undefined) {
      setCashBalance(remote.cashBalance);
    }

    if (remote.holdings?.length) {
      setHoldings(() => {
        const hMap: Record<string, PortfolioHolding> = {};
        remote.holdings.forEach((h: any) => {
          hMap[h.symbol] = { symbol: h.symbol, shares: h.shares, avgCost: h.avgCost };
        });
        return hMap;
      });
    }

    if (remote.orders?.length) {
      setOpenOrders(remote.orders.map((o: any) => ({
        id: o.id,
        symbol: o.symbol,
        side: o.side,
        type: o.type,
        shares: o.shares,
        targetPrice: o.targetPrice,
        createdAt: new Date(o.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        status: o.status,
      })));
    }

    if (remote.trades?.length) {
      setTradeLog(remote.trades.map((t: any) => ({
        id: t.id,
        symbol: t.symbol,
        side: t.side,
        shares: t.shares,
        price: t.price,
        total: t.total,
        timestamp: new Date(t.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      })));
    }
  };

  const checkConnection = async () => {
    try {
      const health = await checkBackendHealth();
      if (health.isOnline) {
        setBackendStatus('connected');
        setDbStatusText(health.dbStatus);

        // Synchronize remote PostgreSQL data if available
        try {
          const savedEmail = localStorage.getItem('tradewise_logged_in_email');
          const remote = await api.getUserProfile(savedEmail || undefined);
          if (remote) {
            applyRemoteUserData(remote);
          }
        } catch {
          // Fallback to local storage silently
        }
      } else {
        setBackendStatus('offline');
        setDbStatusText('Offline (Local Storage Mode)');
      }
    } catch {
      setBackendStatus('offline');
      setDbStatusText('Offline (Local Storage Mode)');
    }
  };

  const loginWithGoogle = async (payload: { email: string; name?: string; avatarUrl?: string; credential?: string }): Promise<boolean> => {
    try {
      const remote = await api.loginWithGoogle(payload);
      if (remote) {
        applyRemoteUserData(remote);
        localStorage.setItem('tradewise_logged_in_email', remote.email || payload.email);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
        addToast('Signed In Successfully!', `Welcome back, ${remote.name || remote.email}!`, 'info');
        return true;
      }
    } catch (err) {
      console.error('[OAuth] Login failed:', err);
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('tradewise_logged_in_email');
    setUser(INITIAL_USER);
    addToast('Signed Out', 'You have been switched to Guest Mode.', 'info');
  };

  const isLoggedIn = Boolean(user.email || localStorage.getItem('tradewise_logged_in_email'));

  useEffect(() => {
    checkConnection();
  }, []);

  const logActivity = () => {
    const today = toDateKey();
    setUser(prev => {
      const currentScore = prev.activityLog[today] || 0;
      const newScore = Math.min(4, currentScore + 1);
      if (currentScore === newScore) return prev;
      return {
        ...prev,
        activityLog: {
          ...prev.activityLog,
          [today]: newScore
        }
      };
    });

    // Background sync to PostgreSQL
    api.logActivity(today).catch(() => {});
  };

  const addMockStock = async (symbol: string, name: string) => {
    setStocks(prev => {
      if (prev.find(s => s.symbol === symbol)) return prev;
      return [generateMockStock(symbol, name), ...prev];
    });

    try {
      const yahooSymbol = symbol + '.NS';
      const res1D = await fetch(`/api/finance/v8/finance/chart/${yahooSymbol}?interval=5m&range=1d`);
      const res1W = await fetch(`/api/finance/v8/finance/chart/${yahooSymbol}?interval=15m&range=5d`);
      const res1M = await fetch(`/api/finance/v8/finance/chart/${yahooSymbol}?interval=1d&range=1mo`);
      const res3M = await fetch(`/api/finance/v8/finance/chart/${yahooSymbol}?interval=1d&range=3mo`);
      const res1Y = await fetch(`/api/finance/v8/finance/chart/${yahooSymbol}?interval=1d&range=1y`);

      if (res1D.ok && res1W.ok && res1M.ok && res3M.ok && res1Y.ok) {
        const data1D = await res1D.json();
        const data1W = await res1W.json();
        const data1M = await res1M.json();
        const data3M = await res3M.json();
        const data1Y = await res1Y.json();

        const parseChartData = (data: any) => {
          const result = data.chart.result[0];
          const timestamps = result.timestamp;
          const quote = result.indicators.quote[0];
          if (!timestamps || !quote) return [];
          return timestamps.map((ts: number, i: number) => {
            return {
              time: ts,
              open: quote.open[i] || 0,
              high: quote.high[i] || 0,
              low: quote.low[i] || 0,
              close: quote.close[i] || 0,
              volume: quote.volume[i] || 0
            };
          }).filter((p: any) => p.open !== 0 && p.close !== 0);
        };

        const history1D = parseChartData(data1D);
        const history1W = parseChartData(data1W);
        const history1M = parseChartData(data1M);
        const history3M = parseChartData(data3M);
        const history1Y = parseChartData(data1Y);

        if (history1D.length > 0) {
          const lastCandle = history1D[history1D.length - 1];
          const prevCandle = history1D.length > 1 ? history1D[history1D.length - 2] : lastCandle;
          const livePrice = lastCandle.close;
          const prevClose = data1D.chart.result[0].meta.chartPreviousClose || prevCandle.close;
          const change = livePrice - prevClose;
          const changePct = (change / prevClose) * 100;
          
          const high24h = Math.max(...history1D.map((p: any) => p.high));
          const low24h = Math.min(...history1D.map((p: any) => p.low));

          setStocks(prev => prev.map(s => {
            if (s.symbol === symbol) {
              return {
                ...s,
                price: livePrice,
                previousClose: prevClose,
                change24h: change,
                change24hPercent: changePct,
                high24h,
                low24h,
                history1D,
                history1W: history1W.length > 0 ? history1W : history1D,
                history1M: history1M.length > 0 ? history1M : history1D,
                history3M: history3M.length > 0 ? history3M : history1D,
                history1Y: history1Y.length > 0 ? history1Y : history1D,
                isSimulated: false
              };
            }
            return s;
          }));
        }
      }
    } catch (e) {}
  };

  const [stocks, setStocks] = useState<StockInstrument[]>(INITIAL_STOCKS);
  const [{ isOpen: isMarketOpen, text: marketStatusText }, setMarketStatus] = useState(checkNseMarketStatus());

  const [masteredConceptIds, setMasteredConceptIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('tradewise_mastered');
    return saved ? JSON.parse(saved) : ['what-is-a-stock'];
  });

  const [completedQuizScores, setCompletedQuizScores] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('tradewise_scores');
    return saved ? JSON.parse(saved) : { 'what-is-a-stock': 100 };
  });

  const [cashBalance, setCashBalance] = useState<number>(() => {
    const saved = localStorage.getItem('tradewise_cash');
    return saved ? Number(saved) : 100000;
  });

  const startingBalance = 100000;

  const [holdings, setHoldings] = useState<Record<string, PortfolioHolding>>(() => {
    const saved = localStorage.getItem('tradewise_holdings');
    return saved ? JSON.parse(saved) : {
      'RELIANCE': { symbol: 'RELIANCE', shares: 5, avgCost: 2950.00 }
    };
  });

  const [openOrders, setOpenOrders] = useState<TradeOrder[]>(() => {
    const saved = localStorage.getItem('tradewise_open_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [tradeLog, setTradeLog] = useState<TradeLog[]>(() => {
    const saved = localStorage.getItem('tradewise_tradelog');
    return saved ? JSON.parse(saved) : [
      { id: 'initial-1', symbol: 'RELIANCE', side: 'BUY', shares: 5, price: 2950.00, total: 14750.00, timestamp: '1 day ago' }
    ];
  });

  const [badges, setBadges] = useState<Badge[]>(() => {
    const saved = localStorage.getItem('tradewise_badges');
    return saved ? JSON.parse(saved) : INITIAL_BADGES;
  });

  const [quests, setQuests] = useState<DailyQuest[]>(() => {
    const saved = localStorage.getItem('tradewise_quests');
    return saved ? JSON.parse(saved) : INITIAL_QUESTS;
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (title: string, message: string, type: 'xp' | 'trade' | 'badge' | 'streak' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const updateProfile = (updates: Partial<Pick<UserProfile,
    'name'|'handle'|'bio'|'institution'|'city'|'experienceLevel'|'avatarUrl'|'avatarColor'|'links'>>) => {
    setUser(prev => {
      const allowed: Partial<UserProfile> = {};
      if (updates.name !== undefined) allowed.name = updates.name;
      if (updates.handle !== undefined) allowed.handle = updates.handle;
      if (updates.bio !== undefined) allowed.bio = updates.bio;
      if (updates.institution !== undefined) allowed.institution = updates.institution;
      if (updates.city !== undefined) allowed.city = updates.city;
      if (updates.experienceLevel !== undefined) allowed.experienceLevel = updates.experienceLevel;
      if (updates.avatarUrl !== undefined) allowed.avatarUrl = updates.avatarUrl;
      if (updates.avatarColor !== undefined) allowed.avatarColor = updates.avatarColor;
      if (updates.links !== undefined) allowed.links = updates.links;
      return { ...prev, ...allowed };
    });

    // Background sync to PostgreSQL
    api.updateProfile({
      name: updates.name,
      handle: updates.handle,
      bio: updates.bio,
      institution: updates.institution,
      city: updates.city,
      experienceLevel: updates.experienceLevel,
      avatarUrl: updates.avatarUrl,
      avatarColor: updates.avatarColor,
      linkedin: updates.links?.linkedin,
      github: updates.links?.github,
      twitter: updates.links?.twitter,
    }).catch(() => {});
  };

  useEffect(() => {
    try {
      localStorage.setItem('tradewise_user', JSON.stringify(user));
    } catch {
      addToast('Could not save profile', 'Storage is full — try a smaller photo.', 'info');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('tradewise_mastered', JSON.stringify(masteredConceptIds));
  }, [masteredConceptIds]);

  useEffect(() => {
    localStorage.setItem('tradewise_scores', JSON.stringify(completedQuizScores));
  }, [completedQuizScores]);

  useEffect(() => {
    localStorage.setItem('tradewise_cash', cashBalance.toString());
  }, [cashBalance]);

  useEffect(() => {
    localStorage.setItem('tradewise_holdings', JSON.stringify(holdings));
  }, [holdings]);

  useEffect(() => {
    localStorage.setItem('tradewise_open_orders', JSON.stringify(openOrders));
  }, [openOrders]);

  useEffect(() => {
    localStorage.setItem('tradewise_tradelog', JSON.stringify(tradeLog));
  }, [tradeLog]);

  useEffect(() => {
    localStorage.setItem('tradewise_badges', JSON.stringify(badges));
  }, [badges]);

  useEffect(() => {
    localStorage.setItem('tradewise_quests', JSON.stringify(quests));
  }, [quests]);

  const formatMoney = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  };

  const isConceptUnlocked = (moduleId: string): boolean => {
    const mod = MODULES_DATA.find(m => m.id === moduleId);
    if (!mod) return false;
    if (mod.prerequisites.length === 0) return true;
    return mod.prerequisites.every(reqId => masteredConceptIds.includes(reqId));
  };

  // Fetch real market prices
  useEffect(() => {
    const fetchRealPrices = async () => {
      const updatedStatus = checkNseMarketStatus();
      setMarketStatus(updatedStatus);

      try {
        const fetchPromises = INITIAL_STOCKS.map(async (stock) => {
          try {
            const res = await fetch(`/api/finance/v8/finance/chart/${encodeURIComponent(stock.yahooSymbol)}?interval=15m&range=1d`);
            if (res.ok) {
              const data = await res.json();
              const meta = data?.chart?.result?.[0]?.meta;
              if (meta && meta.regularMarketPrice) {
                const livePrice = Number(meta.regularMarketPrice.toFixed(2));
                const prevClose = Number((meta.previousClose || meta.chartPreviousClose || stock.previousClose).toFixed(2));
                const change = Number((livePrice - prevClose).toFixed(2));
                const changePct = Number(((change / prevClose) * 100).toFixed(2));

                return {
                  symbol: stock.symbol,
                  price: livePrice,
                  previousClose: prevClose,
                  change24h: change,
                  change24hPercent: changePct,
                  high24h: Number((meta.regularMarketDayHigh || stock.high24h).toFixed(2)),
                  low24h: Number((meta.regularMarketDayLow || stock.low24h).toFixed(2))
                };
              }
            }
          } catch {
            // Silently fall back
          }
          return null;
        });

        const results = await Promise.all(fetchPromises);
        const updatesMap = new Map();
        results.forEach(res => {
          if (res) updatesMap.set(res.symbol, res);
        });

        if (updatesMap.size > 0) {
          setStocks(prev => prev.map(s => {
            const update = updatesMap.get(s.symbol);
            if (!update) return s;
            return {
              ...s,
              price: update.price,
              previousClose: update.previousClose,
              change24h: update.change24h,
              change24hPercent: update.change24hPercent,
              high24h: update.high24h,
              low24h: update.low24h,
              orderBook: generateOrderBook(update.price)
            };
          }));
        }
      } catch {
        // Fallback
      }
    };

    fetchRealPrices();
    const interval = setInterval(fetchRealPrices, 15000);
    return () => clearInterval(interval);
  }, []);

  // Limit Order Auto-Matching Engine
  useEffect(() => {
    if (openOrders.length === 0) return;

    openOrders.forEach(order => {
      const currentStock = stocks.find(s => s.symbol === order.symbol);
      if (!currentStock) return;

      let shouldFill = false;
      if (order.side === 'BUY' && currentStock.price <= order.targetPrice) {
        shouldFill = true;
      } else if (order.side === 'SELL' && currentStock.price >= order.targetPrice) {
        shouldFill = true;
      }

      if (shouldFill) {
        executeOrderFill(order, currentStock.price);
      }
    });
  }, [stocks, openOrders]);

  const executeOrderFill = (order: TradeOrder, fillPrice: number) => {
    const totalCost = fillPrice * order.shares;

    if (order.side === 'BUY') {
      setHoldings(prev => {
        const existing = prev[order.symbol] || { symbol: order.symbol, shares: 0, avgCost: 0 };
        const newShares = existing.shares + order.shares;
        const newAvgCost = (existing.shares * existing.avgCost + totalCost) / newShares;
        return {
          ...prev,
          [order.symbol]: { symbol: order.symbol, shares: newShares, avgCost: Number(newAvgCost.toFixed(2)) }
        };
      });
    } else {
      setCashBalance(prev => prev + totalCost);
    }

    setOpenOrders(prev => prev.filter(o => o.id !== order.id));

    const newLog: TradeLog = {
      id: Math.random().toString(36).substring(2, 9),
      symbol: order.symbol,
      side: order.side,
      shares: order.shares,
      price: fillPrice,
      total: totalCost,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };
    setTradeLog(prev => [newLog, ...prev]);

    addToast(
      `Limit Order Filled! 🎉`,
      `Executed ${order.side} ${order.shares} shares of ${order.symbol} at ${formatMoney(fillPrice)}`,
      'trade'
    );

    unlockBadge('limit-master');
    checkDiversifierBadge();
  };

  const unlockBadge = (badgeId: string) => {
    setBadges(prev => prev.map(b => {
      if (b.id === badgeId && !b.unlocked) {
        addToast(`New Badge Unlocked! 🏆`, b.title, 'badge');
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        return { ...b, unlocked: true, unlockedAt: 'Just now' };
      }
      return b;
    }));
  };

  const checkDiversifierBadge = () => {
    const distinctCount = Object.values(holdings).filter(h => h.shares > 0).length;
    if (distinctCount >= 3) {
      unlockBadge('diversifier');
    }
  };

  const completeModuleQuiz = (moduleId: string, scorePercent: number) => {
    const mod = MODULES_DATA.find(m => m.id === moduleId);
    if (!mod) return;

    setCompletedQuizScores(prev => ({ ...prev, [moduleId]: Math.max(prev[moduleId] || 0, scorePercent) }));

    const isFirstTimeMastered = !masteredConceptIds.includes(moduleId);
    if (scorePercent >= 70 && isFirstTimeMastered) {
      setMasteredConceptIds(prev => [...prev, moduleId]);

      const earnedXP = mod.xpReward + (scorePercent === 100 ? 50 : 0);
      setUser(prev => {
        const newXP = prev.xp + earnedXP;
        const newLevel = getLevelInfo(newXP).level;
        if (newLevel > prev.level) {
          addToast(`LEVEL UP! 🌟`, `You reached Level ${newLevel}!`, 'xp');
        }
        return { ...prev, xp: newXP, level: newLevel };
      });

      confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } });
      addToast(
        `Concept Mastered! +${earnedXP} XP`,
        `You unlocked ${mod.title}!`,
        'xp'
      );

      // Quest progress update
      updateQuestProgress('quest-1', 1);
      logActivity();
      updateDailyQuestProgress('q-study-1');
      updateDailyQuestProgress('q-study-2');

      if (scorePercent === 100) {
        unlockBadge('quiz-perfectionist');
        updateDailyQuestProgress('q-quiz-perfect');
        updateQuestProgress('quest-3', 1);
      }

      const basicsIds = MODULES_DATA.filter(m => m.category === 'Basics').map(m => m.id);
      const allBasicsDone = basicsIds.every(id => id === moduleId || masteredConceptIds.includes(id));
      if (allBasicsDone) {
        unlockBadge('basics-master');
      }

      // Background sync to PostgreSQL
      api.completeQuiz(moduleId, scorePercent, mod.xpReward).catch(() => {});
    }
  };

  const updateQuestProgress = (questId: string, progress: number) => {
    setQuests(prev => prev.map(q => {
      if (q.id === questId && !q.completed) {
        const nextVal = Math.min(q.target, q.current + progress);
        return { ...q, current: nextVal };
      }
      return q;
    }));
  };

  const claimQuest = (questId: string) => {
    const q = quests.find(item => item.id === questId);
    if (q && q.current >= q.target && !q.completed) {
      setQuests(prev => prev.map(item => item.id === questId ? { ...item, completed: true } : item));
      setUser(prev => {
        const newXP = prev.xp + q.xpReward;
        return { ...prev, xp: newXP, level: getLevelInfo(newXP).level };
      });
      addToast('Daily Quest Claimed! 🎯', `+${q.xpReward} XP for completing: ${q.title}`, 'xp');
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
    }
  };

  const placeOrder = (
    symbol: string,
    side: 'BUY' | 'SELL',
    type: 'MARKET' | 'LIMIT',
    shares: number,
    limitPrice?: number
  ): { success: boolean; message: string } => {
    const stock = stocks.find(s => s.symbol === symbol);
    if (!stock) return { success: false, message: 'Invalid instrument symbol.' };
    if (shares <= 0) return { success: false, message: 'Shares must be greater than 0.' };

    const executionPrice = type === 'MARKET' ? stock.price : (limitPrice || stock.price);
    const totalCost = executionPrice * shares;

    if (side === 'BUY') {
      if (cashBalance < totalCost) {
        return { success: false, message: `Insufficient cash balance. Required: ${formatMoney(totalCost)}, Available: ${formatMoney(cashBalance)}` };
      }

      if (type === 'MARKET') {
        setCashBalance(prev => prev - totalCost);
        setHoldings(prev => {
          const existing = prev[symbol] || { symbol, shares: 0, avgCost: 0 };
          const newShares = existing.shares + shares;
          const newAvgCost = (existing.shares * existing.avgCost + totalCost) / newShares;
          return {
            ...prev,
            [symbol]: { symbol, shares: newShares, avgCost: Number(newAvgCost.toFixed(2)) }
          };
        });

        const log: TradeLog = {
          id: Math.random().toString(36).substring(2, 9),
          symbol,
          side: 'BUY',
          shares,
          price: executionPrice,
          total: totalCost,
          timestamp: 'Just now'
        };
        setTradeLog(prev => [log, ...prev]);

        addToast(`Order Executed! 📈`, `Bought ${shares} shares of ${symbol} @ ${formatMoney(executionPrice)}`, 'trade');
        unlockBadge('first-trade');
        checkDiversifierBadge();
        updateQuestProgress('quest-2', 1);

        // Background sync to PostgreSQL
        api.placeOrder({
          symbol,
          side: 'BUY',
          type: 'MARKET',
          shares,
          currentPrice: stock.price,
        }).catch(() => {});

        return { success: true, message: `Successfully bought ${shares} shares of ${symbol}!` };
      } else {
        setCashBalance(prev => prev - totalCost);
        const order: TradeOrder = {
          id: Math.random().toString(36).substring(2, 9),
          symbol,
          side: 'BUY',
          type: 'LIMIT',
          shares,
          targetPrice: limitPrice || stock.price,
          createdAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          status: 'PENDING'
        };
        setOpenOrders(prev => [order, ...prev]);
        addToast(`Limit Order Placed`, `Buy Limit for ${shares} ${symbol} @ ${formatMoney(limitPrice || stock.price)}`, 'info');
        updateQuestProgress('quest-2', 1);

        // Background sync to PostgreSQL
        api.placeOrder({
          symbol,
          side: 'BUY',
          type: 'LIMIT',
          shares,
          limitPrice: limitPrice || stock.price,
          currentPrice: stock.price,
        }).catch(() => {});

        return { success: true, message: `Limit order placed for ${shares} shares of ${symbol}!` };
      }
    } else {
      const currentHolding = holdings[symbol];
      if (!currentHolding || currentHolding.shares < shares) {
        return { success: false, message: `Insufficient shares. You hold ${currentHolding ? currentHolding.shares : 0} shares.` };
      }

      if (type === 'MARKET') {
        setCashBalance(prev => prev + totalCost);
        setHoldings(prev => {
          const existing = prev[symbol];
          const remainingShares = existing.shares - shares;
          if (remainingShares <= 0) {
            const next = { ...prev };
            delete next[symbol];
            return next;
          }
          return {
            ...prev,
            [symbol]: { ...existing, shares: remainingShares }
          };
        });

        const log: TradeLog = {
          id: Math.random().toString(36).substring(2, 9),
          symbol,
          side: 'SELL',
          shares,
          price: executionPrice,
          total: totalCost,
          timestamp: 'Just now'
        };
        setTradeLog(prev => [log, ...prev]);

        addToast(`Order Executed! 📉`, `Sold ${shares} shares of ${symbol} @ ${formatMoney(executionPrice)}`, 'trade');
        unlockBadge('first-trade');
        updateQuestProgress('quest-2', 1);

        // Background sync to PostgreSQL
        api.placeOrder({
          symbol,
          side: 'SELL',
          type: 'MARKET',
          shares,
          currentPrice: stock.price,
        }).catch(() => {});

        return { success: true, message: `Successfully sold ${shares} shares of ${symbol}!` };
      } else {
        setHoldings(prev => {
          const existing = prev[symbol];
          const remainingShares = existing.shares - shares;
          if (remainingShares <= 0) {
            const next = { ...prev };
            delete next[symbol];
            return next;
          }
          return {
            ...prev,
            [symbol]: { ...existing, shares: remainingShares }
          };
        });

        const order: TradeOrder = {
          id: Math.random().toString(36).substring(2, 9),
          symbol,
          side: 'SELL',
          type: 'LIMIT',
          shares,
          targetPrice: limitPrice || stock.price,
          createdAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          status: 'PENDING'
        };
        setOpenOrders(prev => [order, ...prev]);
        addToast(`Limit Order Placed`, `Sell Limit for ${shares} ${symbol} @ ${formatMoney(limitPrice || stock.price)}`, 'info');
        updateQuestProgress('quest-2', 1);

        // Background sync to PostgreSQL
        api.placeOrder({
          symbol,
          side,
          type,
          shares,
          limitPrice,
          currentPrice: stock.price,
        }).catch(() => {});

        return { success: true, message: `Limit order placed for ${shares} shares of ${symbol}!` };
      }
    }
  };

  const cancelOrder = (orderId: string) => {
    const order = openOrders.find(o => o.id === orderId);
    if (!order) return;

    if (order.side === 'BUY') {
      const totalRefund = order.targetPrice * order.shares;
      setCashBalance(prev => prev + totalRefund);
    } else {
      setHoldings(prev => {
        const existing = prev[order.symbol] || { symbol: order.symbol, shares: 0, avgCost: order.targetPrice };
        return {
          ...prev,
          [order.symbol]: { ...existing, shares: existing.shares + order.shares }
        };
      });
    }

    setOpenOrders(prev => prev.filter(o => o.id !== orderId));
    addToast('Order Cancelled', `Limit order for ${order.symbol} was cancelled.`, 'info');

    // Background sync to PostgreSQL
    api.cancelOrder(orderId).catch(() => {});
  };

  const claimDailyStreak = () => {
    const today = toDateKey();
    if (user.lastCheckInDate !== today) {
      setUser(prev => {
        const newStreak = prev.streak + 1;
        const newXP = prev.xp + 50;
        addToast('Daily Streak Claimed! 🔥', `+50 XP! You're on a ${newStreak}-day streak!`, 'streak');
        if (newStreak >= 5) {
          unlockBadge('streak-5');
        }
        return { ...prev, streak: newStreak, xp: newXP, level: getLevelInfo(newXP).level, lastCheckInDate: today };
      });

      // Background sync to PostgreSQL
      api.claimStreak(today).catch(() => {});
    }
  };

  const resetAllProgress = () => {
    localStorage.clear();
    setUser(INITIAL_USER);
    setMasteredConceptIds(['what-is-a-stock']);
    setCompletedQuizScores({ 'what-is-a-stock': 100 });
    setCashBalance(100000);
    setHoldings({ 'RELIANCE': { symbol: 'RELIANCE', shares: 5, avgCost: 2950.00 } });
    setOpenOrders([]);
    setTradeLog([]);
    setBadges(INITIAL_BADGES);
    setQuests(INITIAL_QUESTS);
    addToast('Progress Reset', 'All user data and portfolio has been reset.', 'info');

    // Background sync to PostgreSQL
    api.resetProgress().catch(() => {});
  };

  return (
    <AppContext.Provider value={{
      user,
      stocks,
      isMarketOpen,
      marketStatusText,
      masteredConceptIds,
      completedQuizScores,
      cashBalance,
      startingBalance,
      holdings,
      openOrders,
      tradeLog,
      badges,
      quests,
      addMockStock,
      dailyQuestState,
      activeQuestConfig,
      updateDailyQuestProgress,
      toasts,
      formatMoney,
      isConceptUnlocked,
      completeModuleQuiz,
      placeOrder,
      cancelOrder,
      claimDailyStreak,
      claimQuest,
      resetAllProgress,
      removeToast,
      addToast,
      updateProfile,
      backendStatus,
      dbStatusText,
      recheckBackend: checkConnection,
      isLoggedIn,
      loginWithGoogle,
      logout
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
