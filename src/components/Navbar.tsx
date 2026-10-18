import React from 'react';
import { LayoutDashboard, Compass, CandlestickChart, Trophy, User, Flame } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getLevelInfo } from '../utils/level';
import { UserAvatar } from './UserAvatar';

export interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { user, claimDailyStreak } = useApp();
  const levelInfo = getLevelInfo(user.xp);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'roadmap', label: 'Roadmap', icon: Compass },
    { id: 'simulator', label: 'Simulator', icon: CandlestickChart },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <header className="sticky top-0 z-40 bg-brand-black/60 backdrop-blur-md border-b border-brand-card pt-1">
      <div className="w-full px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Logo & Wordmark */}
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-brand-card flex items-center justify-center group-hover:scale-105 transition-transform">
              <CandlestickChart className="w-4 h-4 text-brand-orange" />
            </div>
            <span className="font-extrabold text-xl text-brand-light tracking-tight flex items-center gap-1">
              TradeWise
            </span>
          </div>

          {/* Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 bg-brand-dark p-1 rounded-lg border border-brand-dark">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-brand-orange text-brand-black shadow-md shadow-brand-orange/20'
                      : 'text-brand-muted hover:text-brand-light hover:bg-brand-card'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Gamification Pills & Avatar */}
          <div className="flex items-center gap-3">
            {/* Daily Streak Flame */}
            <button
              onClick={claimDailyStreak}
              title="Click to claim daily streak bonus!"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-orange/10 border border-brand-orange/30 text-brand-orange rounded-xl text-xs font-bold hover:bg-brand-orange/20 transition-all cursor-pointer group"
            >
              <Flame className="w-4 h-4 text-brand-orange group-hover:scale-110 transition-transform animate-pulse" />
              <span>{user.streak}d</span>
            </button>

            {/* XP Pill with Hover & Focus Popover */}
            <div className="relative group hidden lg:block">
              <div
                tabIndex={0}
                aria-label={`Level ${levelInfo.level}, ${levelInfo.xpIntoLevel} of ${levelInfo.xpForLevel} XP. ${levelInfo.xpToNext} XP to level ${levelInfo.nextLevel}`}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-brand-card border border-white/5 text-brand-light focus:outline-none focus:ring-1 focus:ring-white/20 cursor-default"
              >
                <span className="text-[10px] font-extrabold bg-brand-dark px-1.5 py-0.5 rounded-md text-brand-light">
                  Lv {levelInfo.level}
                </span>
                <div className="w-16 h-1.5 bg-brand-dark rounded-full overflow-hidden">
                  <div
                    style={{ width: `${levelInfo.progressPercent}%` }}
                    className="h-full bg-brand-orange transition-all duration-500"
                  />
                </div>
                <span className="text-[11px] font-mono text-brand-muted">
                  {levelInfo.xpIntoLevel}/{levelInfo.xpForLevel}
                </span>
              </div>

              {/* Hover and focus popover */}
              <div className="absolute right-0 top-full pt-2 w-60 z-50 hidden group-hover:block group-focus-within:block">
                <div className="bg-[#1e2030] border border-white/10 rounded-xl shadow-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-brand-light">Level {levelInfo.level}</span>
                    <span className="text-brand-muted font-normal">Level {levelInfo.nextLevel}</span>
                  </div>
                  <div className="w-full h-2 bg-brand-dark rounded-full overflow-hidden">
                    <div
                      style={{ width: `${levelInfo.progressPercent}%` }}
                      className="h-full bg-brand-orange transition-all duration-500"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-brand-muted">
                    <span className="font-mono">{levelInfo.xpIntoLevel} / {levelInfo.xpForLevel} XP</span>
                    <span>{levelInfo.progressPercent}%</span>
                  </div>
                  <div className="text-xs text-brand-light font-semibold pt-1 border-t border-white/5">
                    {levelInfo.xpToNext} XP to Level {levelInfo.nextLevel}
                  </div>
                  <div className="text-[11px] text-brand-muted">
                    Total XP earned: {levelInfo.totalXp}
                  </div>
                </div>
              </div>
            </div>

            {/* User Avatar */}
            <button
              onClick={() => setActiveTab('profile')}
              className="relative p-0.5 rounded-full bg-brand-card hover:scale-105 transition-transform cursor-pointer"
            >
              <UserAvatar size={32} />
              <span className="absolute -bottom-1 -right-1 bg-brand-orange text-brand-black text-[9px] font-extrabold px-1 rounded-full border border-brand-black">
                L{levelInfo.level}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-brand-black/95 backdrop-blur-lg border-t border-brand-black px-2 py-2 flex items-center justify-around">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 text-[10px] font-semibold py-2 px-3 rounded-xl transition-all cursor-pointer ${
                isActive ? 'text-brand-orange font-bold' : 'text-brand-muted'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
