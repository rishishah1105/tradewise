import React from 'react';
import { Award, Flame, Zap, ShieldCheck, TrendingUp, Target, RefreshCw, CheckCircle2, Lock, PieChart, DollarSign, BookOpen, Calendar, UserCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export interface HeatmapCell {
  dateStr: string;
  dayName: string;
  monthName: string;
  activityCount: number;
  activityText: string;
}

export const ProfilePage: React.FC = () => {
  const { user, badges, tradeLog, holdings, resetAllProgress, formatMoney } = useApp();

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

  // Generate GitHub/LeetCode Style 52-Week Heatmap Matrix (364 Days = 52 Columns x 7 Rows)
  const generateHeatmapMatrix = (): { columns: HeatmapCell[][]; monthLabels: string[] } => {
    const columns: HeatmapCell[][] = [];
    const today = new Date();
    const totalDays = 364; // 52 weeks
    const startDate = new Date(today.getTime() - (totalDays - 1) * 24 * 60 * 60 * 1000);

    const monthLabelsSet = new Set<string>();

    let currentDay = new Date(startDate);
    let currentWeek: HeatmapCell[] = [];

    for (let i = 0; i < totalDays; i++) {
      const dateStr = currentDay.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      const dayName = currentDay.toLocaleDateString('en-US', { weekday: 'short' });
      const monthName = currentDay.toLocaleDateString('en-US', { month: 'short' });

      monthLabelsSet.add(monthName);

      const isoDate = currentDay.toISOString().split('T')[0];
      const activityCount = user.activityLog?.[isoDate] || 0;
      const activityText = activityCount > 0 ? `${activityCount} activit${activityCount === 1 ? 'y' : 'ies'}` : 'No activity';

      currentWeek.push({
        dateStr,
        dayName,
        monthName,
        activityCount,
        activityText
      });

      if (currentWeek.length === 7) {
        columns.push(currentWeek);
        currentWeek = [];
      }

      currentDay.setDate(currentDay.getDate() + 1);
    }

    if (currentWeek.length > 0) {
      columns.push(currentWeek);
    }

    return { columns, monthLabels: Array.from(monthLabelsSet) };
  };

  const { columns, monthLabels } = generateHeatmapMatrix();

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* User Header Profile Card */}
      <div className="bg-brand-card border-none rounded-lg p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-brand-card border-2 border-brand-orange/30 flex items-center justify-center shrink-0 shadow-lg shadow-brand-orange/10">
          <UserCircle className="w-12 h-12 text-brand-orange" strokeWidth={1.5} />
        </div>
        <div className="space-y-2 text-center sm:text-left flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-brand-light">{user.name}</h1>
          <p className="text-sm text-brand-muted font-normal">Student Investor • Member since August 2026</p>

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

      {/* GitHub / LeetCode Style Contribution Heatmap */}
      <div className="bg-brand-card border-none rounded-lg p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-brand-dark pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand-light" />
            <h3 className="text-lg font-semibold text-brand-light">Study & Trading Activity Heatmap</h3>
          </div>
          <span className="text-xs font-bold text-brand-orange flex items-center gap-1">
            <Flame className="w-4 h-4 text-brand-orange animate-pulse" /> {user.streak}-Day Active Streak
          </span>
        </div>

        {/* Month Labels Header */}
        <div className="flex items-center justify-between px-8 text-[11px] font-bold text-brand-muted font-mono">
          {monthLabels.map(m => (
            <span key={m}>{m}</span>
          ))}
        </div>

        {/* 7-Row Column Matrix */}
        <div className="w-full pb-2">
          <div className="flex items-center gap-1 w-full px-2">
            {/* Days of week column label */}
            <div className="flex flex-col justify-between text-[8px] font-mono text-brand-muted h-full py-0.5 mr-1 shrink-0">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
            </div>

            {/* Matrix Columns */}
            <div className="flex gap-[2px] flex-1 w-full justify-between">
              {columns.map((col, cIdx) => (
                <div key={cIdx} className="flex flex-col gap-[2px] flex-1 max-w-[12px]">
                  {col.map((cell, rIdx) => {
                    let cellColor = 'bg-[#2A2F3E] border-none';
                    if (cell.activityCount === 1) {
                      cellColor = 'bg-[#7A5A00] border-none';
                    } else if (cell.activityCount === 2) {
                      cellColor = 'bg-[#A67500] border-none';
                    } else if (cell.activityCount === 3) {
                      cellColor = 'bg-[#D29200] border-none';
                    } else if (cell.activityCount >= 4) {
                      cellColor = 'bg-[#FFAE00] border-none shadow-md shadow-brand-orange/40 animate-pulse-slow';
                    }

                    let tooltipPosClass = 'top-6 left-1/2 -translate-x-1/2'; // Default: below and centered
                    
                    if (cIdx > 35) {
                      tooltipPosClass = tooltipPosClass.replace('left-1/2 -translate-x-1/2', 'right-0');
                    } else if (cIdx < 5) {
                      tooltipPosClass = tooltipPosClass.replace('left-1/2 -translate-x-1/2', 'left-0');
                    }
                    
                    if (rIdx > 3) {
                      tooltipPosClass = tooltipPosClass.replace('top-6', 'bottom-6');
                    }

                    return (
                      <div
                        key={rIdx}
                        className={`w-full aspect-square rounded-[1px] transition-all relative group ${cellColor}`}
                      >
                        {/* Hover Tooltip */}
                        <div className={`absolute ${tooltipPosClass} hidden group-hover:flex flex-col items-center bg-brand-black text-[10px] text-brand-light p-2 rounded-xl border border-brand-dark whitespace-nowrap z-30 shadow-2xl pointer-events-none`}>
                          <span className="font-bold text-brand-orange">{cell.dateStr}</span>
                          <span className="text-brand-light mt-0.5">{cell.activityText}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend Footer */}
        <div className="flex items-center justify-end gap-2 text-[10px] text-brand-muted font-mono pt-2 border-t border-brand-dark">
          <span>Less</span>
          <span className="w-3 h-3 rounded-sm bg-[#2A2F3E]" />
          <span className="w-3 h-3 rounded-sm bg-[#7A5A00]" />
          <span className="w-3 h-3 rounded-sm bg-[#A67500]" />
          <span className="w-3 h-3 rounded-sm bg-[#D29200]" />
          <span className="w-3 h-3 rounded-sm bg-[#FFAE00] shadow-sm" />
          <span>More</span>
        </div>
      </div>

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
          className="px-5 py-2.5 rounded-lg bg-brand-dark hover:bg-brand-dark/80 text-brand-light text-xs font-bold transition-all flex items-center gap-2 shrink-0"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reset All Progress</span>
        </button>
      </div>
    </div>
  );
};
