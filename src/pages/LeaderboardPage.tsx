import React, { useState, useMemo } from 'react';
import { Trophy, Flame, Award, CandlestickChart } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, LabelList, CartesianGrid } from 'recharts';
import { useApp } from '../context/AppContext';
import { getLevelInfo } from '../utils/level';
import { UserAvatar } from '../components/UserAvatar';
import { LEADERBOARD_POPULATION, type PopulationLearner } from '../data/leaderboardPopulation';

export interface LeaderboardItem extends PopulationLearner {
  rank: number;
  isCurrentUser?: boolean;
}

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const LeaderboardPage: React.FC = () => {
  const { user, cashBalance, holdings, stocks, startingBalance } = useApp();
  const [activeLeaderboard, setActiveLeaderboard] = useState<'learning' | 'trading'>('learning');

  // Real user trading return calculation
  const userTradingReturn = useMemo(() => {
    let holdingsValue = 0;
    Object.values(holdings).forEach(h => {
      const currentStock = stocks.find(s => s.symbol === h.symbol);
      const price = currentStock ? currentStock.price : h.avgCost;
      holdingsValue += h.shares * price;
    });
    const totalEquity = cashBalance + holdingsValue;
    if (startingBalance <= 0) return 0;
    return Math.round(((totalEquity - startingBalance) / startingBalance) * 10000) / 100;
  }, [cashBalance, holdings, stocks, startingBalance]);

  // Sorting, rank, beats and histogram calculation
  const {
    userRank,
    beatsPercent,
    histogramData,
    displayList,
    userEntry,
    isUserInTop10
  } = useMemo(() => {
    const isLearning = activeLeaderboard === 'learning';
    const totalCount = LEADERBOARD_POPULATION.length;

    // Beats calculation
    const popBelow = isLearning
      ? LEADERBOARD_POPULATION.filter(p => p.xp < user.xp).length
      : LEADERBOARD_POPULATION.filter(p => p.portfolioReturn < userTradingReturn).length;

    const beats = Number(((popBelow / totalCount) * 100).toFixed(2));

    // Full combined list sorted
    const userItem: LeaderboardItem = {
      name: `${user.name} (You)`,
      institution: user.institution || 'TradeWise Learner',
      xp: user.xp,
      portfolioReturn: userTradingReturn,
      streak: user.streak,
      level: getLevelInfo(user.xp).level,
      isCurrentUser: true,
      rank: 0
    };

    const combined: LeaderboardItem[] = [
      ...LEADERBOARD_POPULATION.map(p => ({ ...p, isCurrentUser: false, rank: 0 })),
      userItem
    ];

    combined.sort((a, b) => {
      if (isLearning) {
        return b.xp - a.xp;
      }
      return b.portfolioReturn - a.portfolioReturn;
    });

    const rankedCombined = combined.map((item, idx) => ({
      ...item,
      rank: idx + 1
    }));

    const trueUserItem = rankedCombined.find(item => item.isCurrentUser) || userItem;
    const trueUserRank = trueUserItem.rank;

    const top10 = rankedCombined.slice(0, 10);
    const inTop10 = trueUserRank <= 10;

    // Histogram 20 bins
    const binsCount = 20;
    let userBinIndex = -1;

    if (isLearning) {
      userBinIndex = Math.floor(user.xp / 150);
      if (userBinIndex < 0) userBinIndex = 0;
      if (userBinIndex >= binsCount) userBinIndex = binsCount - 1;
    } else {
      userBinIndex = Math.floor((userTradingReturn - (-20)) / 2.5);
      if (userBinIndex < 0) userBinIndex = 0;
      if (userBinIndex >= binsCount) userBinIndex = binsCount - 1;
    }

    const bins = Array.from({ length: binsCount }, (_, i) => {
      if (isLearning) {
        const binStart = i * 150;
        const binEnd = (i + 1) * 150;
        const count = LEADERBOARD_POPULATION.filter(p =>
          p.xp >= binStart && (i === binsCount - 1 ? p.xp <= binEnd : p.xp < binEnd)
        ).length;
        const pct = Number(((count / totalCount) * 100).toFixed(1));
        return {
          label: `${binStart}-${binEnd}`,
          binStart,
          binEnd,
          pct,
          isUser: i === userBinIndex
        };
      } else {
        const binStart = Number((-20 + i * 2.5).toFixed(1));
        const binEnd = Number((-20 + (i + 1) * 2.5).toFixed(1));
        const count = LEADERBOARD_POPULATION.filter(p =>
          p.portfolioReturn >= binStart && (i === binsCount - 1 ? p.portfolioReturn <= binEnd : p.portfolioReturn < binEnd)
        ).length;
        const pct = Number(((count / totalCount) * 100).toFixed(1));
        return {
          label: `${binStart}%`,
          binStart,
          binEnd,
          pct,
          isUser: i === userBinIndex
        };
      }
    });

    return {
      userRank: trueUserRank,
      beatsPercent: beats,
      histogramData: bins,
      displayList: top10,
      userEntry: trueUserItem,
      isUserInTop10: inTop10
    };
  }, [activeLeaderboard, user, userTradingReturn]);

  const renderCustomBarLabel = (props: any) => {
    const { x, y, width, index } = props;
    if (typeof index === 'number' && histogramData[index]?.isUser) {
      const numX = Number(x) || 0;
      const numY = Number(y) || 0;
      const numW = Number(width) || 0;
      return (
        <text
          x={numX + numW / 2}
          y={numY - 6}
          fill="#FFAE00"
          textAnchor="middle"
          fontSize={11}
          fontWeight="bold"
        >
          You
        </text>
      );
    }
    return null;
  };

  const CustomChartTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { binStart: number; binEnd: number; pct: number; isUser: boolean } }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#1e2030] border border-white/10 text-xs text-brand-light p-2.5 rounded-lg shadow-xl">
          <span className="font-semibold text-brand-light block">
            {activeLeaderboard === 'learning'
              ? `${data.binStart}–${data.binEnd} XP: ${data.pct}% of learners`
              : `${data.binStart}% to ${data.binEnd}%: ${data.pct}% of traders`}
          </span>
          {data.isUser && (
            <span className="text-brand-orange text-[11px] font-bold mt-1 block">
              You are in this bracket
            </span>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full space-y-4 pb-2">
      {/* Header Banner */}
      <div className="bg-brand-card border-none rounded-lg p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-dark border-none text-brand-orange text-xs font-semibold">
            <Trophy className="w-3.5 h-3.5 text-brand-orange" /> Student & Investor Ranks
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-brand-light tracking-tight">
            TradeWise Leaderboards
          </h1>
          <p className="text-sm text-brand-muted max-w-xl">
            Two distinct leaderboards: track your concept mastery XP or compete for the highest NSE paper trading returns!
          </p>
        </div>

        {/* Distinct Leaderboard Selector Switch */}
        <div className="w-full grid grid-cols-2 bg-brand-dark border-none p-1.5 rounded-lg text-xs font-bold shrink-0 md:max-w-md">
          <button
            onClick={() => setActiveLeaderboard('learning')}
            className={`px-3 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeLeaderboard === 'learning'
                ? 'bg-brand-orange text-brand-black shadow-md'
                : 'text-brand-muted hover:text-brand-light'
            }`}
          >
            <Award className={`w-4 h-4 shrink-0 ${activeLeaderboard === 'learning' ? 'text-brand-black' : 'text-brand-orange'}`} />
            <span className="truncate">Learning · XP</span>
          </button>
          <button
            onClick={() => setActiveLeaderboard('trading')}
            className={`px-3 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeLeaderboard === 'trading'
                ? 'bg-brand-orange text-brand-black shadow-md'
                : 'text-brand-muted hover:text-brand-light'
            }`}
          >
            <CandlestickChart className={`w-4 h-4 ${activeLeaderboard === 'trading' ? 'text-brand-black' : 'text-brand-muted'}`} />
            <span className="truncate">Trading · Returns</span>
          </button>
        </div>
      </div>

      {/* LeetCode Style "Beats" Distribution Card */}
      <div className="bg-brand-card rounded-lg p-6 shadow-xl grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        {/* Left Stat Block */}
        <div className="space-y-3 border-b lg:border-b-0 lg:border-r border-brand-dark pb-6 lg:pb-0 lg:pr-6">
          <span className="text-xs text-brand-muted uppercase font-bold tracking-wider block">
            {activeLeaderboard === 'learning' ? 'Your XP' : 'Your Return'}
          </span>

          <div className={`text-4xl font-black ${
            activeLeaderboard === 'trading' && userTradingReturn < 0
              ? 'text-[#ef4444]'
              : 'text-brand-light'
          }`}>
            {activeLeaderboard === 'learning'
              ? `${user.xp} XP`
              : `${userTradingReturn >= 0 ? `+${userTradingReturn.toFixed(2)}%` : `${userTradingReturn.toFixed(2)}%`}`}
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-[#10b981] text-lg font-bold">
              Beats {beatsPercent}%
            </span>
            <span className="text-brand-muted text-xs">
              {activeLeaderboard === 'learning' ? 'of learners' : 'of traders'}
            </span>
          </div>

          <div className="text-xs text-brand-muted">
            Rank #{userRank} of {LEADERBOARD_POPULATION.length + 1}
          </div>
        </div>

        {/* Right Histogram Chart */}
        <div className="lg:col-span-2 w-full h-[220px]">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={histogramData}
              margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid stroke="#2A2F3E" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: '#94A3B8', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                interval={activeLeaderboard === 'learning' ? 3 : 2}
              />
              <YAxis
                tick={{ fill: '#94A3B8', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `${v}%`}
              />
              <Tooltip content={<CustomChartTooltip />} />
              <Bar dataKey="pct" radius={[3, 3, 0, 0]}>
                <LabelList content={renderCustomBarLabel} />
                {histogramData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.isUser ? '#FFAE00' : '#4B5163'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Leaderboard Table List */}
      <div className="bg-brand-card border-none rounded-lg p-6 shadow-xl space-y-3">
        <h3 className="text-lg font-semibold text-brand-light uppercase tracking-wider border-b border-brand-dark pb-2">
          {activeLeaderboard === 'learning' ? 'XP Mastery Rankings' : 'NSE Paper Portfolio Return Rankings'}
        </h3>

        <div className="divide-y divide-brand-dark">
          {displayList.map(entry => (
            <div
              key={`${entry.name}-${entry.rank}`}
              className={`p-4 rounded-xl flex items-center justify-between transition-all ${
                entry.isCurrentUser
                  ? 'bg-brand-dark border border-white/10 text-brand-light'
                  : 'hover:bg-brand-dark/50 text-brand-light'
              }`}
            >
              <div className="flex items-center gap-4">
                <span
                  className={`w-8 text-center font-black text-sm font-mono ${
                    entry.rank === 1
                      ? 'text-[#FFAE00]'
                      : entry.rank === 2
                      ? 'text-[#94A3B8]'
                      : entry.rank === 3
                      ? 'text-[#78604A]'
                      : 'text-brand-muted'
                  }`}
                >
                  #{entry.rank}
                </span>

                {entry.isCurrentUser ? (
                  <UserAvatar size={40} />
                ) : (
                  <div className="w-10 h-10 rounded-full border border-brand-dark bg-brand-card flex items-center justify-center text-brand-light font-bold text-sm shrink-0">
                    {getInitials(entry.name)}
                  </div>
                )}

                <div>
                  <h4 className="font-semibold text-base sm:text-lg text-brand-light flex items-center gap-2">
                    <span>{entry.name}</span>
                    {entry.isCurrentUser && (
                      <span className="text-[10px] bg-brand-card text-brand-light px-2 py-0.5 rounded-full font-bold uppercase border border-white/10">
                        You
                      </span>
                    )}
                  </h4>
                  <span className="text-xs text-brand-muted block">{entry.institution}</span>
                </div>
              </div>

              <div className="flex items-center gap-6 text-right font-mono text-xs">
                <div className="hidden sm:block">
                  <span className="text-brand-muted font-medium flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-brand-orange" /> {entry.streak}d streak
                  </span>
                </div>
                <div>
                  <span className={`font-extrabold block text-sm ${
                    activeLeaderboard === 'trading' && entry.portfolioReturn < 0 ? 'text-[#ef4444]' : 'text-brand-light'
                  }`}>
                    {activeLeaderboard === 'learning'
                      ? `${entry.xp} XP`
                      : `${entry.portfolioReturn >= 0 ? `+${entry.portfolioReturn.toFixed(1)}%` : `${entry.portfolioReturn.toFixed(1)}%`}`}
                  </span>
                  <span className="text-[10px] text-brand-muted">Lvl {entry.level} Investor</span>
                </div>
              </div>
            </div>
          ))}

          {/* Separator and pinned user row if outside top 10 */}
          {!isUserInTop10 && (
            <>
              <div className="py-2 text-center text-brand-muted text-base font-mono tracking-widest">
                …
              </div>

              <div className="p-4 rounded-xl flex items-center justify-between bg-brand-dark border border-white/10 text-brand-light">
                <div className="flex items-center gap-4">
                  <span className="w-8 text-center font-black text-sm font-mono text-brand-muted">
                    #{userEntry.rank}
                  </span>

                  <UserAvatar size={40} />

                  <div>
                    <h4 className="font-semibold text-base sm:text-lg text-brand-light flex items-center gap-2">
                      <span>{userEntry.name}</span>
                      <span className="text-[10px] bg-brand-card text-brand-light px-2 py-0.5 rounded-full font-bold uppercase border border-white/10">
                        You
                      </span>
                    </h4>
                    <span className="text-xs text-brand-muted block">{userEntry.institution}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-right font-mono text-xs">
                  <div className="hidden sm:block">
                    <span className="text-brand-muted font-medium flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-brand-orange" /> {userEntry.streak}d streak
                    </span>
                  </div>
                  <div>
                    <span className={`font-extrabold block text-sm ${
                      activeLeaderboard === 'trading' && userEntry.portfolioReturn < 0 ? 'text-[#ef4444]' : 'text-brand-light'
                    }`}>
                      {activeLeaderboard === 'learning'
                        ? `${userEntry.xp} XP`
                        : `${userEntry.portfolioReturn >= 0 ? `+${userEntry.portfolioReturn.toFixed(1)}%` : `${userEntry.portfolioReturn.toFixed(1)}%`}`}
                    </span>
                    <span className="text-[10px] text-brand-muted">Lvl {userEntry.level} Investor</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
