import React, { useState } from 'react';
import { Award, Flame, Zap, ShieldCheck, TrendingUp, Target, RefreshCw, CheckCircle2, Lock, PieChart, DollarSign, BookOpen, Pencil } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { fromDateKey } from '../utils/dateKeys';
import { UserAvatar } from '../components/UserAvatar';
import { EditProfileModal } from '../components/EditProfileModal';
import { ActivityHeatmap } from '../components/ActivityHeatmap';

export const ProfilePage: React.FC = () => {
  const { user, badges, tradeLog, holdings, resetAllProgress, formatMoney } = useApp();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'BookOpen': return <BookOpen className="w-6 h-6 text-brand-light" />;
      case 'Award': return <Award className="w-6 h-6 text-brand-orange" />;
      case 'TrendingUp': return <TrendingUp className="w-6 h-6 text-brand-light" />;
      case 'PieChart': return <PieChart className="w-6 h-6 text-brand-light" />;
      case 'Zap': return <Zap className="w-6 h-6 text-brand-orange" />;
      case 'Target': return <Target className="w-6 h-6 text-brand-light" />;
      case 'ShieldCheck': return <ShieldCheck className="w-6 h-6 text-brand-light" />;
      case 'DollarSign': return <DollarSign className="w-6 h-6 text-brand-light" />;
      default: return <Award className="w-6 h-6 text-brand-light" />;
    }
  };

  const unlockedCount = badges.filter(b => b.unlocked).length;

  const joinedDate = user.joinedAt ? fromDateKey(user.joinedAt) : new Date();
  const joinedStr = joinedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const metaParts = [user.institution, user.city, `Member since ${joinedStr}`].filter(Boolean);
  const hasLinks = Boolean(user.links?.linkedin || user.links?.github || user.links?.twitter);

  return (
    <div className="w-full space-y-8 pb-16">
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

          {/* Edit Profile Button at top right */}
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="self-center sm:self-start px-3 py-1.5 rounded-lg bg-brand-dark text-brand-light hover:bg-brand-dark/70 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-white/5 shrink-0"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* Activity Heatmap */}
      <ActivityHeatmap />

      {/* Badge Case Showcase */}
      <div className="bg-brand-card border-none rounded-lg p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-brand-dark pb-3">
          <div>
            <h3 className="text-lg font-semibold text-brand-light flex items-center gap-2">
              <Award className="w-5 h-5 text-brand-orange" /> Achievement Badge Case
            </h3>
            <p className="text-sm text-brand-muted">Unlock milestone badges through learning modules and paper trades.</p>
          </div>
          <span className="text-xs font-bold text-brand-light">{unlockedCount} / {badges.length} Mastered</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {badges.map(badge => (
            <div
              key={badge.id}
              className={`p-5 rounded-2xl border-2 flex flex-col justify-between space-y-3 transition-all ${
                badge.unlocked
                  ? 'bg-brand-card border-brand-orange shadow-lg shadow-brand-orange/20 glow-orange'
                  : 'bg-brand-card border-brand-muted opacity-60 grayscale'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-lg bg-brand-dark flex items-center justify-center">
                  {getBadgeIcon(badge.iconName)}
                </div>
                {badge.unlocked ? (
                  <CheckCircle2 className="w-5 h-5 text-brand-orange" />
                ) : (
                  <Lock className="w-4 h-4 text-brand-muted" />
                )}
              </div>

              <div>
                <h4 className="font-semibold text-lg text-brand-light">{badge.title}</h4>
                <p className="text-[11px] text-brand-muted mt-1 leading-relaxed">{badge.description}</p>
              </div>

              <div className="pt-2 border-t border-brand-dark">
                <span className="text-[10px] font-bold text-brand-muted">
                  {badge.unlocked ? `Unlocked ${badge.unlockedAt || 'Recently'}` : 'Locked Milestone'}
                </span>
              </div>
            </div>
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
      <div className="bg-brand-card border-none rounded-lg p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-lg font-semibold text-brand-light">Reset Account & Portfolio Data</h4>
          <p className="text-sm text-brand-muted">Restart your learning path and restore virtual cash back to starting balance.</p>
        </div>
        <button
          onClick={resetAllProgress}
          className="px-5 py-2.5 rounded-lg bg-brand-dark hover:bg-brand-dark/80 text-brand-light text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reset All Progress</span>
        </button>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </div>
  );
};
