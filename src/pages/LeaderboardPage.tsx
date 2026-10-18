import React, { useState } from 'react';
import { Trophy, Flame, Crown, CandlestickChart, Award } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getLevelInfo } from '../utils/level';
import { UserAvatar } from '../components/UserAvatar';

export interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  university: string;
  xp: number;
  streak: number;
  portfolioReturn: number;
  level: number;
  isCurrentUser?: boolean;
}

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
};

export const LeaderboardPage: React.FC = () => {
  const { user } = useApp();
  const [activeLeaderboard, setActiveLeaderboard] = useState<'learning' | 'trading'>('learning');

  const baseEntries: LeaderboardEntry[] = [
    { rank: 1, name: 'Elena Rostova', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250', university: 'IIT Bombay FinTech', xp: 2450, streak: 14, portfolioReturn: 18.4, level: 8 },
    { rank: 2, name: 'Marcus Chen', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250', university: 'IIM Ahmedabad', xp: 1980, streak: 11, portfolioReturn: 14.2, level: 7 },
    { rank: 3, name: 'Priya Sharma', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250', university: 'Delhi School of Economics', xp: 1720, streak: 9, portfolioReturn: 12.8, level: 6 },
    { rank: 4, name: 'David Kim', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250', university: 'BITS Pilani Finance', xp: 1410, streak: 7, portfolioReturn: 9.5, level: 5 },
    { rank: 5, name: 'Sarah Jenkins', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=250', university: 'SRCC Delhi', xp: 1150, streak: 6, portfolioReturn: 7.1, level: 4 },
  ];

  const currentUserEntry: LeaderboardEntry = {
    rank: 4,
    name: `${user.name} (You)`,
    avatar: '',
    university: user.institution || 'TradeWise Learner',
    xp: user.xp,
    streak: user.streak,
    portfolioReturn: 6.2,
    level: getLevelInfo(user.xp).level,
    isCurrentUser: true
  };

  const allEntries = [...baseEntries, currentUserEntry];

  // Learning Leaderboard (Sorted by XP)
  const learningRanked = [...allEntries]
    .sort((a, b) => b.xp - a.xp)
    .map((e, i) => ({ ...e, rank: i + 1 }));

  // Trading Leaderboard (Sorted by Portfolio Return %)
  const tradingRanked = [...allEntries]
    .sort((a, b) => b.portfolioReturn - a.portfolioReturn)
    .map((e, i) => ({ ...e, rank: i + 1 }));

  const currentRankedList = activeLeaderboard === 'learning' ? learningRanked : tradingRanked;

  const top1 = currentRankedList[0];
  const top2 = currentRankedList[1];
  const top3 = currentRankedList[2];

  return (
    <div className="w-full space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-brand-card border-none rounded-lg p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-dark border-none text-brand-orange text-xs font-semibold">
            <Trophy className="w-3.5 h-3.5 text-brand-orange" /> Student & Investor Ranks
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-brand-light tracking-tight">
            TradeWise Leaderboards
          </h1>
          <p className="text-sm sm:text-sm text-brand-muted max-w-xl">
            Two distinct leaderboards: track your concept mastery XP or compete for the highest NSE paper trading returns!
          </p>
        </div>

        {/* Distinct Leaderboard Selector Switch */}
        <div className="w-full grid grid-cols-2 bg-brand-dark border-none p-1.5 rounded-lg text-xs font-bold shrink-0 md:max-w-md">
          <button
            onClick={() => setActiveLeaderboard('learning')}
            className={`px-2 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeLeaderboard === 'learning' ? 'bg-brand-orange text-brand-black shadow-md' : 'text-brand-muted hover:text-brand-light'
            }`}
          >
            <Award className={`w-4 h-4 shrink-0 ${activeLeaderboard === 'learning' ? 'text-brand-black' : 'text-brand-orange'}`} />
            <span className="truncate">Learning (by XP)</span>
          </button>
          <button
            onClick={() => setActiveLeaderboard('trading')}
            className={`px-2 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeLeaderboard === 'trading' ? 'bg-brand-orange text-brand-black shadow-md' : 'text-brand-muted hover:text-brand-light'
            }`}
          >
            <CandlestickChart className={`w-4 h-4 ${activeLeaderboard === 'trading' ? 'text-brand-black' : 'text-brand-muted'}`} />
            <span>Trading (by Return %)</span>
          </button>
        </div>
      </div>

      {/* Top 3 Podium Showcase for Active Leaderboard */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-brand-light uppercase tracking-wider px-2">
          {activeLeaderboard === 'learning' ? '🎓 Learning Mastery Top 3 Podium' : '📈 NSE Paper Trading Return % Top 3 Podium'}
        </h2>

        <div className="grid grid-cols-3 gap-3 sm:gap-6 items-end pt-2">
          {/* 2nd Place Silver */}
          {top2 && (
            <div className="bg-brand-card border-none rounded-lg p-4 sm:p-6 text-center space-y-3 shadow-xl order-1 flex flex-col items-center">
              <div className="relative">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-4 border-brand-muted bg-brand-card flex items-center justify-center text-brand-light font-bold text-lg">{getInitials(top2.name)}</div>
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-brand-muted text-brand-black font-black text-xs px-2 py-0.5 rounded-full">
                  #2
                </span>
              </div>
              <div>
                <h4 className="font-semibold text-brand-light text-lg sm:text-lg truncate max-w-[120px]">{top2.name}</h4>
                <span className="text-[10px] text-brand-muted block">{top2.university}</span>
              </div>
              <div className="text-xs font-bold text-brand-light font-mono">
                {activeLeaderboard === 'learning' ? `${top2.xp} XP` : `+${top2.portfolioReturn}% ROI`}
              </div>
            </div>
          )}

          {/* 1st Place Gold */}
          {top1 && (
            <div className="bg-brand-dark border-2 border-brand-orange rounded-lg p-5 sm:p-7 text-center space-y-3 shadow-2xl order-2 flex flex-col items-center scale-105 relative z-10 glow-orange">
              <Crown className="w-6 h-6 text-brand-orange animate-bounce" />
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-brand-orange shadow-xl bg-brand-card flex items-center justify-center text-brand-light font-bold text-xl">{getInitials(top1.name)}</div>
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-brand-orange text-brand-black font-black text-xs px-2.5 py-0.5 rounded-full shadow-lg">
                  #1
                </span>
              </div>
              <div>
                <h4 className="font-semibold text-brand-light text-lg sm:text-lg truncate max-w-[140px]">{top1.name}</h4>
                <span className="text-[10px] text-brand-orange font-semibold block">{top1.university}</span>
              </div>
              <div className="text-sm font-extrabold text-brand-orange font-mono">
                {activeLeaderboard === 'learning' ? `${top1.xp} XP` : `+${top1.portfolioReturn}% ROI`}
              </div>
            </div>
          )}

          {/* 3rd Place Bronze */}
          {top3 && (
            <div className="bg-brand-card border-none rounded-lg p-4 sm:p-6 text-center space-y-3 shadow-xl order-3 flex flex-col items-center">
              <div className="relative">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-4 border-[#78604A] bg-brand-card flex items-center justify-center text-brand-light font-bold text-lg">{getInitials(top3.name)}</div>
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#78604A] text-brand-light font-black text-xs px-2 py-0.5 rounded-full">
                  #3
                </span>
              </div>
              <div>
                <h4 className="font-semibold text-brand-light text-lg sm:text-lg truncate max-w-[120px]">{top3.name}</h4>
                <span className="text-[10px] text-brand-muted block">{top3.university}</span>
              </div>
              <div className="text-xs font-bold text-brand-light font-mono">
                {activeLeaderboard === 'learning' ? `${top3.xp} XP` : `+${top3.portfolioReturn}% ROI`}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Leaderboard Table List */}
      <div className="bg-brand-card border-none rounded-lg p-6 shadow-xl space-y-3">
        <h3 className="text-lg font-semibold text-brand-light uppercase tracking-wider border-b border-brand-dark pb-2">
          {activeLeaderboard === 'learning' ? 'XP Mastery Rankings' : 'NSE Paper Portfolio Return Rankings'} ({currentRankedList.length})
        </h3>

        <div className="divide-y divide-brand-dark">
          {currentRankedList.map(entry => (
            <div
              key={entry.name}
              className={`p-4 rounded-2xl flex items-center justify-between transition-all ${
                entry.isCurrentUser
                  ? 'bg-brand-dark border border-brand-orange text-brand-light shadow-lg'
                  : 'hover:bg-brand-dark/50 text-brand-light'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className={`w-8 text-center font-black text-sm font-mono ${
                  entry.rank === 1 ? 'text-brand-orange' : (entry.rank === 2 ? 'text-brand-muted' : (entry.rank === 3 ? 'text-[#78604A]' : 'text-brand-muted'))
                }`}>
                  #{entry.rank}
                </span>

                {entry.isCurrentUser ? (
                  <UserAvatar size={40} />
                ) : (
                  <div className="w-10 h-10 rounded-full border border-brand-dark bg-brand-card flex items-center justify-center text-brand-light font-bold text-sm shrink-0">{getInitials(entry.name)}</div>
                )}

                <div>
                  <h4 className="font-semibold text-lg sm:text-lg text-brand-light flex items-center gap-1.5">
                    <span>{entry.name}</span>
                    {entry.isCurrentUser && (
                      <span className="text-[9px] bg-brand-orange text-brand-black px-2 py-0.5 rounded-full font-bold uppercase">You</span>
                    )}
                  </h4>
                  <span className="text-[11px] text-brand-muted block">{entry.university}</span>
                </div>
              </div>

              <div className="flex items-center gap-6 text-right font-mono text-xs">
                <div className="hidden sm:block">
                  <span className="text-brand-orange font-bold flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-brand-orange" /> {entry.streak}d streak
                  </span>
                </div>
                <div>
                  <span className="font-extrabold text-brand-light block text-sm">
                    {activeLeaderboard === 'learning' ? `${entry.xp} XP` : `+${entry.portfolioReturn}% ROI`}
                  </span>
                  <span className="text-[10px] text-brand-muted">Lvl {entry.level} Investor</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
