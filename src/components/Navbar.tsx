import React from 'react';
import { LayoutDashboard, Compass, CandlestickChart, Trophy, User, Flame } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getLevelInfo } from '../utils/level';
import { UserAvatar } from './UserAvatar';
import { LeetCodeDailyProgressCalendar } from './LeetCodeDailyProgressCalendar';

export interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, openAuthModal }) => {
  const { user, claimDailyStreak, isLoggedIn } = useApp();
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
              const isActive = item.id === 'roadmap'
                ? (activeTab === 'roadmap' || activeTab === 'module' || activeTab === 'quiz')
                : activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-brand-orange text-brand-black shadow-md shadow-brand-orange/20 font-bold'
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
            {/* Daily Streak Flame with LeetCode Calendar Popover */}
            <div className="relative group">
              <button
                onClick={claimDailyStreak}
                title="Click to claim daily streak bonus or view calendar"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-orange/10 border border-brand-orange/30 text-brand-orange rounded-xl text-xs font-bold hover:bg-brand-orange/20 transition-all cursor-pointer"
              >
                <Flame className="w-4 h-4 text-brand-orange group-hover:scale-110 transition-transform animate-pulse" />
                <span>{user.streak}d</span>
              </button>

              {/* Hover Popover showing LeetCode Month Chart */}
              <div className="absolute right-0 top-full pt-2 z-50 hidden group-hover:block group-focus-within:block">
                <LeetCodeDailyProgressCalendar onClaimStreak={claimDailyStreak} />
              </div>
            </div>

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

            {/* User Avatar & Google Auth */}
            {!isLoggedIn ? (
              <button
                onClick={openAuthModal}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white hover:bg-gray-100 text-gray-900 font-bold text-xs shadow-md shadow-white/5 transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span className="hidden sm:inline">Sign In</span>
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('profile')}
                className="relative p-0.5 rounded-full bg-brand-card hover:scale-105 transition-transform cursor-pointer"
                title={user.email ? `Signed in as ${user.email}` : user.name}
              >
                <UserAvatar size={32} />
                <span className="absolute -bottom-1 -right-1 bg-brand-orange text-brand-black text-[9px] font-extrabold px-1 rounded-full border border-brand-black">
                  L{levelInfo.level}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-brand-black/95 backdrop-blur-lg border-t border-brand-black px-2 py-2 flex items-center justify-around">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = item.id === 'roadmap'
            ? (activeTab === 'roadmap' || activeTab === 'module' || activeTab === 'quiz')
            : activeTab === item.id;
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
