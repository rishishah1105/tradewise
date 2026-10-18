import React, { useState } from 'react';
import { Flame, TrendingUp, RefreshCw, Pencil, AlertTriangle, X, LogIn, LogOut } from 'lucide-react';
import { useApp, type Badge } from '../context/AppContext';
import { fromDateKey } from '../utils/dateKeys';
import { UserAvatar } from '../components/UserAvatar';
import { EditProfileModal } from '../components/EditProfileModal';
import { ActivityHeatmap } from '../components/ActivityHeatmap';
import { BadgeMedallion } from '../components/BadgeMedallion';
import { BadgeModal } from '../components/BadgeModal';
import { AuthModal } from './AuthModal';

export const ProfilePage: React.FC = () => {
  const { user, badges, tradeLog, holdings, resetAllProgress, formatMoney, addToast, isLoggedIn, logout } = useApp();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetInput, setResetInput] = useState('');

  const unlockedCount = badges.filter(b => b.unlocked).length;

  const joinedDate = user.joinedAt ? fromDateKey(user.joinedAt) : new Date();
  const joinedStr = joinedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const metaParts = [user.institution, user.city, `Member since ${joinedStr}`].filter(Boolean);
  const hasLinks = Boolean(user.links?.linkedin || user.links?.github || user.links?.twitter);

  return (
    <div className="w-full space-y-8 pb-2">
      {/* User Header Profile Card */}
      <div className="bg-brand-card border-none rounded-lg p-6 sm:p-8 shadow-xl relative">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left flex-1">
            <UserAvatar size={96} className="shadow-lg border-2 border-white/10" />

            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-bold text-brand-light">{user.name}</h1>
                {user.handle && (
                  <span className="text-sm text-brand-muted font-medium">@{user.handle}</span>
                )}
                {user.experienceLevel && (
                  <span className="px-2.5 py-0.5 rounded-full bg-brand-dark text-[11px] font-semibold text-brand-muted border border-white/5">
                    {user.experienceLevel}
                  </span>
                )}
              </div>

              {user.bio && (
                <p className="text-sm text-brand-light/90 max-w-xl leading-relaxed">{user.bio}</p>
              )}

              <p className="text-xs text-brand-muted font-normal">
                {metaParts.join(' • ')}
              </p>

              {/* Links */}
              {hasLinks && (
                <div className="flex items-center justify-center sm:justify-start gap-3 pt-1">
                  {user.links?.linkedin && (
                    <a
                      href={user.links.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-brand-dark text-brand-muted hover:text-brand-light hover:bg-brand-dark/80 transition-colors cursor-pointer"
                      title="LinkedIn"
                      aria-label="LinkedIn Profile"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.62 1.62 0 1 0 0-3.25 1.62 1.62 0 0 0 0 3.25m1.39 9.74v-8.37H5.07v8.37h2.78z" />
                      </svg>
                    </a>
                  )}
                  {user.links?.github && (
                    <a
                      href={user.links.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-brand-dark text-brand-muted hover:text-brand-light hover:bg-brand-dark/80 transition-colors cursor-pointer"
                      title="GitHub"
                      aria-label="GitHub Profile"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
                      </svg>
                    </a>
                  )}
                  {user.links?.twitter && (
                    <a
                      href={user.links.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-brand-dark text-brand-muted hover:text-brand-light hover:bg-brand-dark/80 transition-colors cursor-pointer"
                      title="X (Twitter)"
                      aria-label="X Profile"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </a>
                  )}
                </div>
              )}

              {/* Stats Chips */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2">
                <span className="px-3 py-1 rounded-full bg-brand-dark border-none text-brand-orange text-xs font-bold flex items-center gap-1">
                  {user.xp} <span className="text-brand-muted font-normal">Total XP</span>
                </span>
                <span className="px-3 py-1 rounded-full bg-brand-dark border-none text-brand-orange text-xs font-bold flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-brand-orange" /> {user.streak} <span className="text-brand-muted font-normal">Streak</span>
                </span>
                <span className="px-3 py-1 rounded-full bg-brand-dark border-none text-brand-light text-xs font-bold flex items-center gap-1">
                  {unlockedCount} <span className="text-brand-muted font-normal">Badges Unlocked</span>
                </span>
              </div>
            </div>
          </div>

          {/* User Account & Edit Profile Buttons at top right */}
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2.5 self-center sm:self-start shrink-0">
            {!isLoggedIn ? (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-gray-100 text-gray-900 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
              >
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Sign In with Google</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-brand-dark hover:bg-brand-dark/70 text-brand-light text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-white/5"
                  title={user.email ? `Signed in as ${user.email}` : user.name}
                >
                  <LogIn className="w-3.5 h-3.5 text-brand-orange" />
                  <span>Switch Account</span>
                </button>
                <button
                  onClick={logout}
                  className="px-2.5 py-1.5 rounded-lg bg-brand-dark hover:bg-rose-500/20 text-brand-muted hover:text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-white/5"
                  title="Sign out from TradeWise"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Log Out</span>
                </button>
              </>
            )}

            <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-brand-dark text-brand-light hover:bg-brand-dark/70 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-white/5"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* Activity Heatmap */}
      <ActivityHeatmap />

      {/* Achievement Badges Showcase */}
      <div className="bg-brand-card border-none rounded-lg p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-brand-dark pb-3">
          <div>
            <h3 className="text-lg font-semibold text-brand-light">
              Achievement Badges
            </h3>
            <p className="text-sm text-brand-muted">Unlock milestone badges through learning modules and paper trades.</p>
          </div>
          <span className="text-xs font-bold text-brand-light">{unlockedCount} / {badges.length}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {badges.map(badge => (
            <button
              key={badge.id}
              onClick={() => setSelectedBadge(badge)}
              aria-label={`${badge.title} badge: ${badge.unlocked ? `Unlocked ${badge.unlockedAt || 'Recently'}` : 'Locked'}`}
              className="flex flex-col items-center text-center p-3 rounded-xl hover:bg-brand-dark/40 transition-all hover:scale-105 cursor-pointer group space-y-2 border border-transparent hover:border-white/5"
            >
              <BadgeMedallion badge={badge} size={88} />
              <div className="w-full">
                <span className="text-xs font-semibold text-brand-light block truncate">
                  {badge.title}
                </span>
                <span className="text-[10px] text-brand-muted block truncate mt-0.5">
                  {badge.unlocked ? (badge.unlockedAt || 'Unlocked') : 'Locked'}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Trading Performance Stats */}
      <div className="bg-brand-card border-none rounded-lg p-6 shadow-xl space-y-4">
        <h3 className="text-lg font-semibold text-brand-light flex items-center gap-2 border-b border-brand-dark pb-3">
          <TrendingUp className="w-5 h-5 text-brand-light" /> Paper Simulator Statistics
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-4 bg-brand-dark rounded-lg border-none">
            <span className="text-xs text-brand-muted block">Total Executed Trades</span>
            <strong className="text-xl font-bold font-mono text-brand-light">{tradeLog.length}</strong>
          </div>
          <div className="p-4 bg-brand-dark rounded-lg border-none">
            <span className="text-xs text-brand-muted block">Active Stock Positions</span>
            <strong className="text-xl font-bold font-mono text-brand-light">{Object.keys(holdings).length}</strong>
          </div>
          <div className="p-4 bg-brand-dark rounded-lg border-none">
            <span className="text-xs text-brand-muted block">Win Rate %</span>
            <strong className="text-xl font-bold font-mono text-brand-light">100%</strong>
          </div>
          <div className="p-4 bg-brand-dark rounded-lg border-none">
            <span className="text-xs text-brand-muted block">Best Trade Profit</span>
            <strong className="text-xl font-bold font-mono text-brand-light">+{formatMoney(45.50)}</strong>
          </div>
        </div>
      </div>

      {/* Reset Account Settings */}
      <div className="bg-brand-card border border-red-500/20 rounded-lg p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-lg font-semibold text-brand-light flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span>Reset Account & Portfolio Data</span>
          </h4>
          <p className="text-sm text-brand-muted">Restart your learning path and restore virtual cash back to starting balance.</p>
        </div>
        <button
          onClick={() => {
            setIsResetModalOpen(true);
            setResetInput('');
          }}
          className="px-5 py-2.5 rounded-lg bg-red-500/10 hover:bg-red-600 border border-red-500/30 text-red-400 hover:text-white text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer shadow-sm shadow-red-500/10"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reset All Progress</span>
        </button>
      </div>

      {/* Confirmation Modal to type 'reset' */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#131926] border border-red-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5 text-left relative animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-brand-light">Reset All Progress?</h3>
                  <p className="text-xs text-red-400 font-medium">This action cannot be undone.</p>
                </div>
              </div>
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="text-brand-muted hover:text-brand-light p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-brand-muted leading-relaxed">
              All your study modules, quiz scores, unlocked badges, trading logs, and simulator portfolio will be permanently reset to factory defaults.
            </p>

            <div className="space-y-2">
              <label className="text-xs text-brand-light font-semibold block">
                To confirm, type <span className="font-mono text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20 font-bold">reset</span> below:
              </label>
              <input
                type="text"
                autoFocus
                value={resetInput}
                onChange={(e) => setResetInput(e.target.value)}
                placeholder="Type 'reset'"
                className="w-full bg-[#1A2232] border border-slate-700 focus:border-red-500 rounded-lg px-3 py-2 text-sm text-brand-light font-mono outline-none transition-colors placeholder:text-slate-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-brand-dark hover:bg-brand-dark/80 text-brand-light text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={resetInput.trim().toLowerCase() !== 'reset'}
                onClick={() => {
                  resetAllProgress();
                  setIsResetModalOpen(false);
                  addToast('Progress Reset', 'Your account and portfolio have been restored to defaults.', 'info');
                }}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  resetInput.trim().toLowerCase() === 'reset'
                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30 cursor-pointer'
                    : 'bg-red-600/30 text-red-300/40 cursor-not-allowed border border-red-500/20'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Confirm Reset</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />

      {/* Badge Detail & 3D Spin Modal */}
      <BadgeModal
        badge={selectedBadge}
        isOpen={Boolean(selectedBadge)}
        onClose={() => setSelectedBadge(null)}
      />

      {/* Google OAuth & Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};
