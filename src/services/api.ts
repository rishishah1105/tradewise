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

export const api = {
  // Auth & OAuth
  async loginWithGoogle(payload: { email: string; name?: string; avatarUrl?: string; credential?: string }) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (err) {
      console.warn('[API] loginWithGoogle error:', err);
    }
    return null;
  },

  // User Profile
  async getUserProfile(email?: string) {
    try {
      const url = email ? `${API_BASE_URL}/user/profile?email=${encodeURIComponent(email)}` : `${API_BASE_URL}/user/profile`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (err) {
      console.warn('[API] getUserProfile fallback to local state:', err);
    }
    return null;
  },

  async updateProfile(updates: Record<string, unknown>) {
    try {
      const res = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
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
};
