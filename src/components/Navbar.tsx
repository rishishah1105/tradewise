import React, { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard,
  Compass,
  CandlestickChart,
  Trophy,
  User,
  Flame,
  LogOut,
  Settings,
  ChevronDown,
  Sparkles
} from 'lucide-react';
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
  const { user, claimDailyStreak, isLoggedIn, logout, startGoogleOAuthRedirect } = useApp();
  const levelInfo = getLevelInfo(user.xp);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  // Close account menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const authenticatedNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'roadmap', label: 'Roadmap', icon: Compass },
    { id: 'simulator', label: 'Simulator', icon: CandlestickChart },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const unauthenticatedNavItems = [
    { id: 'landing', label: 'Home' },
    { id: 'features', label: 'Features' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'about', label: 'About' },
  ];

  const handleUnauthenticatedNav = (id: string) => {
    if (id === 'landing') {
      setActiveTab('landing');
    } else if (id === 'features') {
      if (activeTab !== 'landing') {
        setActiveTab('landing');
        setTimeout(() => {
          document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (id === 'how-it-works') {
      if (activeTab !== 'landing') {
        setActiveTab('landing');
      } else {
        window.scrollTo({ top: 600, behavior: 'smooth' });
      }
    } else if (id === 'about') {
      setActiveTab('about');
    }
  };

  const handleContinueWithGoogle = async () => {
    const redirected = await startGoogleOAuthRedirect('dashboard');
    if (!redirected) {
      openAuthModal();
    }
  };


  return (
    <header className="sticky top-0 z-40 bg-[#0B0F17]/90 backdrop-blur-md border-b border-white/10 pt-1">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo & Brand Identity */}
          <div
            onClick={() => setActiveTab(isLoggedIn ? 'dashboard' : 'landing')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-105 group-hover:border-brand-orange/40 transition-all">
              <CandlestickChart className="w-4 h-4 text-brand-orange" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg text-white tracking-tight flex items-center gap-1 leading-none">
                TradeWise
              </span>
              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest leading-none mt-0.5">
                FinTrack Engine
              </span>
            </div>
          </div>

          {/* Navigation Links (Desktop) */}
          {isLoggedIn ? (
            <nav className="hidden md:flex items-center gap-1 bg-[#111622] p-1 rounded-xl border border-white/10">
              {authenticatedNavItems.map(item => {
                const Icon = item.icon;
                const isActive =
                  item.id === 'roadmap'
                    ? activeTab === 'roadmap' || activeTab === 'module' || activeTab === 'quiz'
                    : activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-brand-orange text-brand-black shadow-md shadow-brand-orange/20 font-bold'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          ) : (
            <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-400">
              {unauthenticatedNavItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleUnauthenticatedNav(item.id)}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </nav>
          )}

          {/* Right Action Bar */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                {/* Daily Streak Flame Popover */}
                <div className="relative group">
                  <button
                    onClick={claimDailyStreak}
                    title="Daily learning streak"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-orange/10 border border-brand-orange/30 text-brand-orange rounded-xl text-xs font-bold hover:bg-brand-orange/20 transition-all cursor-pointer"
                  >
                    <Flame className="w-4 h-4 text-brand-orange group-hover:scale-110 transition-transform animate-pulse" />
                    <span>{user.streak}d</span>
                  </button>

                  <div className="absolute right-0 top-full pt-2 z-50 hidden group-hover:block group-focus-within:block">
                    <LeetCodeDailyProgressCalendar onClaimStreak={claimDailyStreak} />
                  </div>
                </div>

                {/* Level / XP Pill */}
                <div className="relative group hidden lg:block">
                  <div
                    tabIndex={0}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#111622] border border-white/10 text-white focus:outline-none cursor-default"
                  >
                    <span className="text-[10px] font-extrabold bg-white/10 px-1.5 py-0.5 rounded-md text-brand-orange">
                      Lv {levelInfo.level}
                    </span>
                    <div className="w-14 h-1.5 bg-black/40 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${levelInfo.progressPercent}%` }}
                        className="h-full bg-brand-orange transition-all duration-500"
                      />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      {levelInfo.xpIntoLevel}/{levelInfo.xpForLevel}
                    </span>
                  </div>

                  <div className="absolute right-0 top-full pt-2 w-56 z-50 hidden group-hover:block group-focus-within:block">
                    <div className="bg-[#111622] border border-white/10 rounded-xl shadow-2xl p-3.5 space-y-2 text-xs">
                      <div className="flex justify-between font-bold text-white">
                        <span>Level {levelInfo.level}</span>
                        <span className="text-slate-400 font-normal">Next: Lv {levelInfo.nextLevel}</span>
                      </div>
                      <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${levelInfo.progressPercent}%` }}
                          className="h-full bg-brand-orange"
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>{levelInfo.xpIntoLevel} / {levelInfo.xpForLevel} XP</span>
                        <span>{levelInfo.progressPercent}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Authenticated Account Menu */}
                <div className="relative" ref={accountMenuRef}>
                  <button
                    onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                    className="flex items-center gap-2 p-1 pl-1.5 rounded-full bg-[#111622] border border-white/10 hover:border-white/20 transition-all cursor-pointer group"
                    title={user.email ? `Signed in as ${user.email}` : user.name}
                  >
                    <div className="relative">
                      <UserAvatar size={28} />
                      <span className="absolute -bottom-1 -right-1 bg-brand-orange text-brand-black text-[8px] font-extrabold px-1 rounded-full border border-black">
                        L{levelInfo.level}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white mr-1 transition-transform" />
                  </button>

                  {/* Dropdown Menu */}
                  {isAccountMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-[#111622] border border-white/10 rounded-2xl shadow-2xl p-2 z-50 animate-fade-in space-y-1">
                      {/* User Info Header */}
                      <div className="p-3 border-b border-white/10 space-y-1">
                        <div className="font-bold text-sm text-white truncate">
                          {user.name || 'TradeWise Learner'}
                        </div>
                        <div className="text-xs text-slate-400 truncate font-mono">
                          {user.email || 'Google Account Connected'}
                        </div>
                        <div className="pt-1.5 flex items-center justify-between text-[11px] text-slate-400">
                          <span className="flex items-center gap-1 text-brand-orange font-semibold">
                            <Sparkles className="w-3 h-3" /> Level {levelInfo.level}
                          </span>
                          <span>{levelInfo.totalXp} Total XP</span>
                        </div>
                      </div>

                      {/* Menu Options */}
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setActiveTab('profile');
                            setIsAccountMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors text-left cursor-pointer"
                        >
                          <User className="w-4 h-4 text-slate-400" />
                          <span>Profile & Achievements</span>
                        </button>

                        <button
                          onClick={() => {
                            setActiveTab('profile');
                            setIsAccountMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors text-left cursor-pointer"
                        >
                          <Settings className="w-4 h-4 text-slate-400" />
                          <span>Simulation Settings</span>
                        </button>
                      </div>

                      {/* Sign Out Action */}
                      <div className="pt-1 border-t border-white/10">
                        <button
                          onClick={async () => {
                            setIsAccountMenuOpen(false);
                            await logout();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-left cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Unauthenticated Visitor Action Buttons */
              <div className="flex items-center gap-2">
                <button
                  onClick={openAuthModal}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Sign In
                </button>

                <button
                  onClick={handleContinueWithGoogle}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-md shadow-white/5 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span className="hidden sm:inline">Continue with Google</span>
                  <span className="sm:hidden">Google</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation (Authenticated) */}
      {isLoggedIn && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B0F17]/95 backdrop-blur-lg border-t border-white/10 px-2 py-2 flex items-center justify-around">
          {authenticatedNavItems.map(item => {
            const Icon = item.icon;
            const isActive =
              item.id === 'roadmap'
                ? activeTab === 'roadmap' || activeTab === 'module' || activeTab === 'quiz'
                : activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1 text-[10px] font-semibold py-1.5 px-3 rounded-xl transition-all cursor-pointer ${
                  isActive ? 'text-brand-orange font-bold' : 'text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
