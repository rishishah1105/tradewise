import React, { useState, useRef, useEffect } from 'react';
import { Compass, CandlestickChart, Award, Flame, ArrowRight, CheckCircle2, TrendingUp, BookOpen, Target, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MODULES_DATA } from '../data/modulesData';
import { getLevelInfo } from '../utils/level';
import { toDateKey } from '../utils/dateKeys';

export const Dashboard: React.FC<{
  onSelectConcept: (conceptId: string) => void;
  onNavigate: (tab: string) => void;
}> = ({ onSelectConcept, onNavigate }) => {
  const { user, masteredConceptIds, cashBalance, holdings, stocks, dailyQuestState, activeQuestConfig, formatMoney, claimDailyStreak } = useApp();

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    };
    if (isCalendarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCalendarOpen]);

  // Calendar calculations for current month
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const currentMonthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const todayDateStr = toDateKey(currentDate);

  const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonthRaw = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday
  const startDayOffset = (firstDayOfMonthRaw + 6) % 7; // Monday = 0, ..., Sunday = 6

  const calendarDays = [];
  for (let i = 0; i < startDayOffset; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInCurrentMonth; day++) {
    const dayStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const activityCount = user.activityLog?.[dayStr] || 0;
    const isToday = dayStr === todayDateStr;
    const hasActivity = activityCount > 0 || (isToday && user.lastCheckInDate === todayDateStr);
    calendarDays.push({ day, dayStr, hasActivity, isToday });
  }

  const activeDaysThisMonth = calendarDays.filter(d => d && d.hasActivity).length;

  const totalConcepts = MODULES_DATA.length;
  const masteryPercent = (masteredConceptIds.length / totalConcepts) * 100;
  const minPercent = 5;
  const displayPercent = masteryPercent === 0 ? 0 : Math.max(masteryPercent, minPercent);
  const circumference = 2 * Math.PI * 58;

  const today = toDateKey();
  const isStreakClaimed = user.lastCheckInDate === today;

  const nextRecommended = MODULES_DATA.find(m => !masteredConceptIds.includes(m.id)) || MODULES_DATA[0];

  let holdingsValue = 0;
  let totalCost = 0;

  Object.values(holdings).forEach(h => {
    const currentStock = stocks.find(s => s.symbol === h.symbol);
    const price = currentStock ? currentStock.price : h.avgCost;
    holdingsValue += h.shares * price;
    totalCost += h.shares * h.avgCost;
  });

  const totalEquity = cashBalance + holdingsValue;
  const totalPnL = holdingsValue - totalCost;
  const pnlPercent = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;

  // 3 Quest tiles for Carousel
  const questTiles = [
    {
      id: 'quest-checkin',
      title: 'Daily Streak Bonus',
      description: 'Maintain your momentum and claim daily streak rewards',
      reward: 50,
      progress: isStreakClaimed ? 1 : 0,
      target: 1,
      isCompleted: isStreakClaimed,
      isActive: false,
      isUpcoming: false,
      icon: Flame,
    },
    {
      id: activeQuestConfig.id,
      title: activeQuestConfig.title,
      description: 'Today\'s featured financial challenge to boost market skills',
      reward: activeQuestConfig.reward,
      progress: dailyQuestState.progress,
      target: activeQuestConfig.target,
      isCompleted: dailyQuestState.completed,
      isActive: true,
      isUpcoming: false,
      icon: Target,
    },
    {
      id: 'quest-upcoming',
      title: 'NSE Simulator Mastery',
      description: 'Execute paper orders to practice real-world risk management',
      reward: 40,
      progress: 0,
      target: 3,
      isCompleted: false,
      isActive: false,
      isUpcoming: true,
      icon: CandlestickChart,
    },
  ];

  return (
    <div className="w-full space-y-4 pb-12">
      {/* Top Banner Greeting */}
      <div className="bg-brand-card border-none rounded-lg p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-brand-orange/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-dark border-none text-brand-light text-xs font-semibold">
                Welcome
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold text-brand-light tracking-tight">
              Ready to grow your financial IQ today?
            </h1>
            <p className="text-sm sm:text-sm text-brand-muted max-w-xl">
              You are on Level {getLevelInfo(user.xp).level} with {user.xp} XP. Master Indian market modules or trade NSE stocks to climb the leaderboard!
            </p>
          </div>

          {/* Daily Streak Card with Clickable Calendar Dropdown */}
          <div className="relative" ref={calendarRef}>
            <div className="w-full lg:w-auto bg-brand-dark border-none p-4 rounded-lg flex items-center justify-between gap-4 shadow-lg">
              <div
                onClick={() => setIsCalendarOpen(prev => !prev)}
                className="flex items-center gap-3 cursor-pointer group"
                title="Click to view monthly activity calendar"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-orange/10 border border-brand-orange/30 flex items-center justify-center text-brand-orange group-hover:scale-105 transition-transform">
                  <Flame className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <span className="text-xs font-bold text-brand-muted uppercase tracking-wider block">Daily Streak</span>
                  <span className="text-xl font-black text-brand-light group-hover:text-brand-orange transition-colors flex items-center gap-1.5">
                    {user.streak} Consecutive Days
                    <Calendar className="w-4 h-4 text-brand-muted group-hover:text-brand-orange transition-colors" />
                  </span>
                </div>
              </div>
              <button
                onClick={claimDailyStreak}
                disabled={isStreakClaimed}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isStreakClaimed
                    ? 'bg-brand-card text-brand-muted cursor-not-allowed border-none'
                    : 'bg-brand-orange text-brand-black hover:scale-105 shadow-md shadow-brand-orange/20 cursor-pointer'
                }`}
              >
                {isStreakClaimed ? 'Claimed Today ✓' : 'Claim +50 XP'}
              </button>
            </div>

            {/* Monthly Calendar Popover */}
            {isCalendarOpen && (
              <div className="absolute right-0 top-full mt-2 z-50 bg-brand-card border border-brand-dark rounded-xl p-4 shadow-2xl w-72 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-brand-dark pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-brand-orange" />
                    <span className="text-xs font-bold text-brand-light">{currentMonthName}</span>
                  </div>
                  <span className="text-[10px] font-bold text-brand-orange bg-brand-dark px-2 py-0.5 rounded-full">
                    {activeDaysThisMonth} active {activeDaysThisMonth === 1 ? 'day' : 'days'}
                  </span>
                </div>

                {/* Weekday headers: Mon - Sun */}
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-brand-muted mb-2">
                  <span>Mo</span>
                  <span>Tu</span>
                  <span>We</span>
                  <span>Th</span>
                  <span>Fr</span>
                  <span>Sa</span>
                  <span>Su</span>
                </div>

                {/* Day grid */}
                <div className="grid grid-cols-7 gap-1.5 justify-items-center">
                  {calendarDays.map((item, idx) => {
                    if (!item) {
                      return <div key={`empty-${idx}`} className="w-7 h-7" />;
                    }
                    return (
                      <div
                        key={item.dayStr}
                        title={`${item.dayStr}: ${item.hasActivity ? 'Activity logged' : 'No activity'}`}
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] transition-all relative ${
                          item.hasActivity
                            ? 'bg-brand-orange text-brand-black font-extrabold shadow-sm shadow-brand-orange/40'
                            : 'bg-brand-dark text-slate-400 border border-slate-600/40'
                        } ${
                          item.isToday
                            ? 'ring-2 ring-brand-light ring-offset-1 ring-offset-brand-card font-bold'
                            : ''
                        }`}
                      >
                        {item.day}
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-brand-dark text-[9px] text-brand-muted">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-orange inline-block" />
                    <span>Active</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-dark border border-slate-600/50 inline-block" />
                    <span>No Activity</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full ring-2 ring-brand-light inline-block" />
                    <span>Today</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Recommended Concept + Dynamic Mastery Ring */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recommended Concept Card */}
        <div className="lg:col-span-2 bg-brand-card border-none rounded-lg p-6 shadow-xl flex flex-col justify-between relative overflow-hidden group transition-all">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand-muted uppercase tracking-wider bg-brand-dark px-3 py-1 rounded-full border-none">
                Continue Where You Left Off
              </span>
              <span className="text-xs font-semibold text-brand-muted flex items-center gap-1">
                <BookOpen className="w-4 h-4 text-brand-muted" /> ~{nextRecommended.estimatedMinutes} min read
              </span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-brand-light">
                {nextRecommended.title}
              </h2>
              <p className="text-sm sm:text-sm text-brand-muted mt-2 leading-relaxed">
                {nextRecommended.summary}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {nextRecommended.keyTakeaways.slice(0, 2).map((takeaway, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-xs text-brand-light bg-brand-dark px-3 py-1.5 rounded-lg border-none">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-muted shrink-0" />
                  <span>{takeaway}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-brand-dark mt-6 flex items-center justify-between">
            <span className="text-xs font-bold text-brand-muted flex items-center gap-1">
              <Award className="w-4 h-4 text-brand-muted" /> Reward: +{nextRecommended.xpReward} XP
            </span>
            <button
              onClick={() => onSelectConcept(nextRecommended.id)}
              className="px-6 py-2.5 rounded-xl bg-brand-orange text-brand-black font-bold text-xs shadow-lg shadow-brand-orange/30 hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Start Module</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic Animated Mastery Progress Ring */}
        <div className="bg-brand-card border-none rounded-lg p-6 shadow-xl flex flex-col items-center justify-center text-center space-y-4">
          <h3 className="text-lg font-semibold text-brand-light uppercase tracking-wider">Concept Mastery Map</h3>

          {/* SVG Proportional Progress Ring with CSS Arc Transition */}
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg viewBox="0 0 144 144" className="w-full h-full">
              {/* Background track — always full circle */}
              <circle
                cx="72"
                cy="72"
                r="58"
                fill="transparent"
                stroke="#292C38"
                strokeWidth="10"
              />
              {/* Progress arc — fills proportionally */}
              <circle
                cx="72"
                cy="72"
                r="58"
                fill="transparent"
                stroke="#FFAE00"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - displayPercent / 100)}
                transform="rotate(-90 72 72)"
                style={{ transition: 'stroke-dashoffset 0.6s ease' }}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-black text-brand-light">{Math.round(masteryPercent)}%</span>
              <span className="text-[10px] text-brand-muted uppercase font-bold tracking-wider">Mastered</span>
            </div>
          </div>

          <div className="text-xs text-brand-muted space-y-1">
            <p><strong>{masteredConceptIds.length}</strong> of <strong>{totalConcepts}</strong> concepts completed</p>
            <button
              onClick={() => onNavigate('roadmap')}
              className="text-brand-light hover:underline font-semibold text-xs flex items-center gap-1 justify-center pt-1 cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5" /> View Interactive Roadmap
            </button>
          </div>
        </div>
      </div>

      {/* Redesigned Daily Quests Section with 3-Card Carousel */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-brand-orange" />
            <h3 className="text-lg font-semibold text-brand-light">Daily Quests</h3>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-dark border border-brand-orange/30 text-brand-orange shadow-sm flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-brand-orange" />
            +{activeQuestConfig.reward} XP Available
          </span>
        </div>

        {/* 3 Quest Cards Horizontal Carousel / Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {questTiles.map(quest => {
            const Icon = quest.icon;
            const progressPercent = Math.min(100, Math.round((quest.progress / quest.target) * 100));

            return (
              <div
                key={quest.id}
                className={`bg-brand-card rounded-lg p-5 shadow-lg flex flex-col justify-between relative overflow-hidden transition-all ${
                  quest.isActive
                    ? 'border-2 border-brand-orange shadow-brand-orange/10'
                    : 'border border-brand-dark'
                } ${quest.isUpcoming ? 'opacity-50 select-none' : ''}`}
              >
                {/* Completed Green Checkmark Overlay */}
                {quest.isCompleted && (
                  <div className="absolute inset-0 bg-brand-black/75 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center gap-1 text-[#10b981] animate-in fade-in">
                    <CheckCircle2 className="w-7 h-7 text-[#10b981]" />
                    <span className="text-xs font-bold uppercase tracking-wider">Completed</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-brand-dark flex items-center justify-center text-brand-orange">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-1 rounded text-[11px] font-bold bg-brand-dark text-brand-orange border border-brand-orange/20">
                      +{quest.reward} XP
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-brand-light leading-snug mb-1">
                    {quest.title}
                  </h4>
                  <p className="text-xs text-brand-muted leading-relaxed mb-4">
                    {quest.description}
                  </p>
                </div>

                {/* Progress Indicator */}
                <div className="space-y-1.5 pt-2 border-t border-brand-dark/50">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-brand-muted">
                      {quest.isUpcoming ? 'Locked until tomorrow' : (quest.isCompleted ? 'Goal reached' : 'Progress')}
                    </span>
                    <strong className="text-brand-light font-bold">
                      {quest.progress} / {quest.target}
                    </strong>
                  </div>
                  <div className="h-1.5 w-full bg-brand-dark rounded-full overflow-hidden">
                    <div
                      style={{ width: `${progressPercent}%` }}
                      className={`h-full rounded-full transition-all duration-500 ${
                        quest.isCompleted ? 'bg-[#10b981]' : 'bg-brand-orange'
                      }`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Indian Paper Trading Terminal Snapshot */}
      <div className="bg-brand-card border-none rounded-lg p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-brand-dark pb-4">
          <div>
            <span className="text-xs font-bold text-brand-muted uppercase tracking-wider block">NSE Paper Trading Snapshot</span>
            <h3 className="text-lg font-semibold text-brand-light flex items-center gap-2">
              <CandlestickChart className="w-5 h-5 text-brand-muted" /> Portfolio Net Worth: {formatMoney(totalEquity)}
            </h3>
          </div>
          <button
            onClick={() => onNavigate('simulator')}
            className="px-5 py-2 rounded-lg bg-brand-dark hover:bg-brand-dark/80 text-brand-light text-xs font-bold border-none transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>Open NSE Terminal</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-brand-dark rounded-lg border-none">
            <span className="text-xs text-brand-muted block font-medium">Virtual Cash Balance</span>
            <strong className="text-lg font-bold font-mono text-brand-light">{formatMoney(cashBalance)}</strong>
          </div>
          <div className="p-4 bg-brand-dark rounded-lg border-none">
            <span className="text-xs text-brand-muted block font-medium">Holdings Market Value</span>
            <strong className="text-lg font-bold font-mono text-brand-light">{formatMoney(holdingsValue)}</strong>
          </div>
          <div className="p-4 bg-brand-dark rounded-lg border-none">
            <span className="text-xs text-brand-muted block font-medium">Total Unrealized P&L</span>
            <strong className={`text-lg font-extrabold flex items-center gap-1 ${
              totalPnL >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'
            }`}>
              <TrendingUp className="w-4 h-4" />
              {totalPnL >= 0 ? '+' : ''}{formatMoney(totalPnL)} ({pnlPercent.toFixed(2)}%)
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};
