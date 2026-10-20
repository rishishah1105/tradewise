/**
 * TradeWise Backend API Client
 * Connects to Node.js + Express + PostgreSQL Backend
 * Provides graceful fallback when backend is offline
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface BackendHealthResponse {
  status: string;
  service: string;
  database: string;
  timestamp: string;
}

export const checkBackendHealth = async (): Promise<{ isOnline: boolean; dbStatus: string }> => {
  try {
    const res = await fetch('http://localhost:5000/health', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      const data: BackendHealthResponse = await res.json();
      return {
        isOnline: true,
        dbStatus: data.database,
      };
    }
    return { isOnline: false, dbStatus: 'Offline' };
  } catch {
    return { isOnline: false, dbStatus: 'Offline' };
  }
};

export const getAuthHeaders = (extraHeaders: Record<string, string> = {}) => {
  const token = localStorage.getItem('tradewise_session_token');
  const headers: Record<string, string> = { ...extraHeaders };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    headers['x-session-token'] = token;
  }
  return headers;
};

export const api = {
  // Auth & OAuth
  async getAuthConfig() {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/config`);
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (err) {
      console.warn('[API] getAuthConfig error:', err);
    }
    return null;
  },

  async getGoogleAuthUrl(destination = 'dashboard') {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/google/url?destination=${encodeURIComponent(destination)}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('[API] getGoogleAuthUrl error:', err);
    }
    return { success: false, isConfigured: false };
  },

  async verifyGoogleCredential(credential: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/google/verify`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        credentials: 'include',
        body: JSON.stringify({ credential }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.token) {
          localStorage.setItem('tradewise_session_token', json.token);
        }
        return json.data;
      }
    } catch (err) {
      console.warn('[API] verifyGoogleCredential error:', err);
    }
    return null;
  },

  async loginWithGoogle(credential: string) {
    return this.verifyGoogleCredential(credential);
  },


  async getSession() {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/session`, {
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      if (res.ok) {
        const json = await res.json();
        return json;
      }
    } catch (err) {
      console.warn('[API] getSession error:', err);
    }
    return null;
  },

  async logout() {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
    } catch (err) {
      console.warn('[API] logout error:', err);
    } finally {
      localStorage.removeItem('tradewise_session_token');
      localStorage.removeItem('tradewise_logged_in_email');
    }
  },

  // User Profile
  async getUserProfile() {
    try {
      const res = await fetch(`${API_BASE_URL}/user/profile`, {
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (err) {
      console.warn('[API] getUserProfile fallback:', err);
    }
    return null;
  },

  async updateProfile(updates: Record<string, unknown>) {
    try {
      const res = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'PUT',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        credentials: 'include',
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (err) {
      console.warn('[API] updateProfile fallback to local state:', err);
    }
    return null;
  },

  async logActivity(dateKey: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/user/activity`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        credentials: 'include',
        body: JSON.stringify({ dateKey }),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (err) {
      console.warn('[API] logActivity fallback to local state:', err);
    }
    return null;
  },

  async claimStreak(todayKey: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/user/streak`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        credentials: 'include',
        body: JSON.stringify({ todayKey }),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (err) {
      console.warn('[API] claimStreak fallback to local state:', err);
    }
    return null;
  },

  async resetProgress() {
    try {
      const res = await fetch(`${API_BASE_URL}/user/reset`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        credentials: 'include',
      });
      if (res.ok) {
        const json = await res.json();
        return json.success;
      }
    } catch (err) {
      console.warn('[API] resetProgress fallback to local state:', err);
    }
    return false;
  },

  // Portfolio
  async getPortfolio() {
    try {
      const res = await fetch(`${API_BASE_URL}/portfolio`);
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (err) {
      console.warn('[API] getPortfolio fallback to local state:', err);
    }
    return null;
  },

  async placeOrder(orderData: {
    symbol: string;
    side: 'BUY' | 'SELL';
    type: 'MARKET' | 'LIMIT';
    shares: number;
    limitPrice?: number;
    currentPrice?: number;
  }) {
    try {
      const res = await fetch(`${API_BASE_URL}/portfolio/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      const json = await res.json();
      return json;
    } catch (err) {
      console.warn('[API] placeOrder fallback to local state:', err);
      return { success: false, message: 'Server offline' };
    }
  },

  async cancelOrder(orderId: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/portfolio/order/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      return await res.json();
    } catch (err) {
      console.warn('[API] cancelOrder fallback to local state:', err);
      return { success: false, message: 'Server offline' };
    }
  },

  // Learning & Quiz
  async completeQuiz(conceptId: string, scorePercent: number, xpReward: number) {
    try {
      const res = await fetch(`${API_BASE_URL}/learning/quiz`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        credentials: 'include',
        body: JSON.stringify({ conceptId, scorePercent, xpReward }),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (err) {
      console.warn('[API] completeQuiz fallback to local state:', err);
    }
    return null;
  },

  async getLearningProgress() {
    try {
      const res = await fetch(`${API_BASE_URL}/learning/progress`, {
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (err) {
      console.warn('[API] getLearningProgress fallback:', err);
    }
    return null;
  },

  // Leaderboard
  async getLeaderboard(type: 'learning' | 'trading') {
    try {
      const res = await fetch(`${API_BASE_URL}/leaderboard?type=${type}`);
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (err) {
      console.warn('[API] getLeaderboard fallback to local population:', err);
    }
    return null;
  },

  // ========================================================
  // PHASE 3: AUDITABLE PAPER TRADING & EULERPOOL MARKET DATA
  // ========================================================

  async getPaperAccount(userId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/paper-trading/account`, {
        headers: userId ? { 'x-user-id': userId } : undefined,
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (err) {
      console.warn('[API] getPaperAccount fallback:', err);
    }
    return null;
  },

  async getPaperPortfolio(userId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/paper-trading/portfolio`, {
        headers: userId ? { 'x-user-id': userId } : undefined,
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (err) {
      console.warn('[API] getPaperPortfolio fallback:', err);
    }
    return null;
  },

  async resetPaperSimulation(reason = 'User requested simulation reset', userId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/paper-trading/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(userId ? { 'x-user-id': userId } : {}),
        },
        body: JSON.stringify({ confirm: true, reason }),
      });
      return await res.json();
    } catch (err) {
      console.warn('[API] resetPaperSimulation error:', err);
      return { success: false, message: 'Server offline' };
    }
  },

  async placePaperOrder(orderData: {
    symbol: string;
    side: 'BUY' | 'SELL';
    type: 'MARKET' | 'LIMIT';
    quantity: number;
    limitPrice?: number;
    clientOrderId?: string;
    userId?: string;
  }) {
    try {
      const { userId, ...body } = orderData;
      const res = await fetch(`${API_BASE_URL}/paper-trading/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(userId ? { 'x-user-id': userId } : {}),
        },
        body: JSON.stringify(body),
      });
      return await res.json();
    } catch (err) {
      console.warn('[API] placePaperOrder error:', err);
      return { success: false, message: 'Server offline' };
    }
  },

  async cancelPaperOrder(orderId: string, userId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/paper-trading/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(userId ? { 'x-user-id': userId } : {}),
        },
      });
      return await res.json();
    } catch (err) {
      console.warn('[API] cancelPaperOrder error:', err);
      return { success: false, message: 'Server offline' };
    }
  },

  async getPaperTransactions(userId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/paper-trading/transactions`, {
        headers: userId ? { 'x-user-id': userId } : undefined,
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (err) {
      console.warn('[API] getPaperTransactions error:', err);
    }
    return [];
  },

  async getWatchlist(userId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/paper-trading/watchlist`, {
        headers: userId ? { 'x-user-id': userId } : undefined,
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (err) {
      console.warn('[API] getWatchlist error:', err);
    }
    return [];
  },

  async addToWatchlist(symbol: string, name?: string, userId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/paper-trading/watchlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(userId ? { 'x-user-id': userId } : {}),
        },
        body: JSON.stringify({ symbol, name }),
      });
      return await res.json();
    } catch (err) {
      console.warn('[API] addToWatchlist error:', err);
      return { success: false };
    }
  },

  async removeFromWatchlist(idOrSymbol: string, userId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/paper-trading/watchlist/${encodeURIComponent(idOrSymbol)}`, {
        method: 'DELETE',
        headers: userId ? { 'x-user-id': userId } : undefined,
      });
      return await res.json();
    } catch (err) {
      console.warn('[API] removeFromWatchlist error:', err);
      return { success: false };
    }
  },

  async getPaperChallenges(userId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/paper-trading/challenges`, {
        headers: userId ? { 'x-user-id': userId } : undefined,
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (err) {
      console.warn('[API] getPaperChallenges error:', err);
    }
    return [];
  },

  async searchMarketData(query: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/market-data/search?query=${encodeURIComponent(query)}`);
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (err) {
      console.warn('[API] searchMarketData error:', err);
    }
    return [];
  },

  async getMarketQuote(symbol: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/market-data/quote/${encodeURIComponent(symbol)}`);
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (err) {
      console.warn('[API] getMarketQuote error:', err);
    }
    return null;
  },

  async getMarketCandles(symbol: string, timeframe = '1D') {
    try {
      const res = await fetch(`${API_BASE_URL}/market-data/history/${encodeURIComponent(symbol)}?timeframe=${timeframe}`);
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (err) {
      console.warn('[API] getMarketCandles error:', err);
    }
    return [];
  },
};

