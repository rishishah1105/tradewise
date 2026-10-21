import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Compass, CandlestickChart, Award, Flame, ArrowRight, CheckCircle2, TrendingUp, BookOpen, Target, Calendar, RotateCw, Trophy } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MODULES_DATA } from '../data/modulesData';
import { getLevelInfo } from '../utils/level';
import { toDateKey } from '../utils/dateKeys';
import { LeetCodeDailyProgressCalendar } from '../components/LeetCodeDailyProgressCalendar';

export const Dashboard: React.FC<{
  onSelectConcept: (conceptId: string) => void;
  onNavigate: (tab: string) => void;
}> = ({ onSelectConcept, onNavigate }) => {
  const {
    user,
    masteredConceptIds,
    cashBalance,
    holdings,
    stocks,
    formatMoney,
    claimDailyStreak,
    quests,
    claimQuest,
    isClaimingQuest,
    refreshDailyQuests,
  } = useApp();

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

  const totalConcepts = MODULES_DATA.length;
  const masteredCount = masteredConceptIds.length;
  const masteryPercent = totalConcepts > 0 ? (masteredCount / totalConcepts) * 100 : 0;
  const displayPercent = masteryPercent;
  const circumference = 2 * Math.PI * 58;

  const today = toDateKey();
  const isStreakClaimed = Boolean(user.lastCheckInDate && user.lastCheckInDate === today);

  const hasLearningActivity = masteredCount > 0;
  const firstModule = MODULES_DATA[0];
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

  useEffect(() => {
    refreshDailyQuests().catch(() => {});
  }, []);

  const displayQuests = useMemo(() => {
    if (quests && quests.length > 0) {
      return quests;
    }
    return [
      {
        id: 'quest-first-trade',
        title: 'Make your first trade',
        description: 'Execute a paper order in the simulator to practice real-world risk management',
        category: 'trading',
        progress: 0,
        target: 1,
        completed: false,
        claimed: false,
        xpReward: 50,
      },
      {
        id: 'quest-trade-mastery',
        title: 'NSE Simulator Mastery',
        description: 'Execute 3 paper orders today to master execution flow',
        category: 'trading',
        progress: 0,
        target: 3,
        completed: false,
        claimed: false,
        xpReward: 40,
      },
      {
        id: 'quest-study',
        title: 'Complete 1 Study Module',
        description: 'Complete a concept study module or quiz with a passing score',
        category: 'learning',
        progress: 0,
        target: 1,
        completed: false,
        claimed: false,
        xpReward: 50,
      },
    ];
  }, [quests]);

  const unclaimedXpAvailable = displayQuests
    .filter(q => !q.claimed && !q.isClaimed)
    .reduce((sum, q) => sum + (q.xpReward || q.reward || 0), 0);

  const getQuestIcon = (quest: any) => {
    if (quest.category === 'trading' || quest.id?.includes('trade') || quest.id?.includes('order')) {
      return CandlestickChart;
    }
    if (quest.category === 'learning' || quest.id?.includes('study') || quest.id?.includes('quiz')) {
      return BookOpen;
    }
    if (quest.id?.includes('leaderboard')) {
      return Trophy;
    }
    if (quest.id?.includes('streak')) {
      return Flame;
    }
    return Target;
  };

  const getQuestAction = (quest: any) => {
    if (quest.category === 'trading' || quest.id?.includes('trade') || quest.id?.includes('order')) {
      return { label: 'Go to Simulator', tab: 'simulator' };
    }
    if (quest.category === 'learning' || quest.id?.includes('study') || quest.id?.includes('quiz')) {
      return { label: 'Start Lesson', tab: 'learn' };
    }
    if (quest.id?.includes('leaderboard')) {
      return { label: 'View Leaderboard', tab: 'leaderboard' };
    }
    return { label: 'Go to Simulator', tab: 'simulator' };
  };

  return (
    <div className="w-full space-y-4 pb-2">
      {/* Top Banner Greeting */}
      <div className="bg-brand-card border-none rounded-lg p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-brand-orange/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-dark border-none text-brand-light text-xs font-semibold">
                {hasLearningActivity ? 'Welcome Back' : 'Welcome'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold text-brand-light tracking-tight">
              {hasLearningActivity
                ? 'Ready to grow your financial IQ today?'
                : 'Welcome! Start your learning journey with Chapter 1'}
            </h1>
            <p className="text-sm sm:text-sm text-brand-muted max-w-xl">
              {hasLearningActivity
                ? `You are on Level ${getLevelInfo(user.xp).level} with ${user.xp} XP across ${masteredCount} mastered concept(s). Master Indian market modules or trade NSE stocks to climb the leaderboard!`
                : 'Begin your journey into Indian capital markets with the fundamentals of equity investing and smart portfolio building.'}
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

            {/* Monthly Calendar Popover (LeetCode style) */}
            {isCalendarOpen && (
              <div className="absolute right-0 top-full mt-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <LeetCodeDailyProgressCalendar onClaimStreak={claimDailyStreak} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Recommended Concept + Dynamic Mastery Ring */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recommended Concept / Onboarding Card */}
        <div className="lg:col-span-2 bg-brand-card border-none rounded-lg p-6 shadow-xl flex flex-col justify-between relative overflow-hidden group transition-all">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                hasLearningActivity
                  ? 'bg-brand-dark text-brand-muted border-none'
                  : 'bg-brand-orange/10 text-brand-orange border border-brand-orange/30'
              }`}>
                {hasLearningActivity ? 'Continue Where You Stopped' : 'Starting Point • Chapter 1'}
              </span>
              <span className="text-xs font-semibold text-brand-muted flex items-center gap-1">
                <BookOpen className="w-4 h-4 text-brand-muted" /> ~{(hasLearningActivity ? nextRecommended : firstModule).estimatedMinutes} min read
              </span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-brand-light">
                {(hasLearningActivity ? nextRecommended : firstModule).title}
              </h2>
              <p className="text-sm sm:text-sm text-brand-muted mt-2 leading-relaxed">
                {hasLearningActivity
                  ? nextRecommended.summary
                  : 'Welcome! Start your learning journey with Chapter 1. Discover how buying a share makes you a real part-owner of an Indian corporation.'}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {(hasLearningActivity ? nextRecommended : firstModule).keyTakeaways.slice(0, 2).map((takeaway, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-white font-medium bg-[#1E293B] border border-amber-500/30 px-3.5 py-1.5 rounded-lg shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{takeaway}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-brand-dark mt-6 flex items-center justify-between">
            <span className="text-xs font-bold text-brand-muted flex items-center gap-1">
              <Award className="w-4 h-4 text-brand-muted" /> Reward: +{(hasLearningActivity ? nextRecommended : firstModule).xpReward} XP
            </span>
            <button
              onClick={() => onSelectConcept((hasLearningActivity ? nextRecommended : firstModule).id)}
              className="px-6 py-2.5 rounded-xl bg-brand-orange text-brand-black font-bold text-xs shadow-lg shadow-brand-orange/30 hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>{hasLearningActivity ? 'Resume Lesson' : 'Start Learning Chapter 1'}</span>
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

      {/* Redesigned Daily Quests Section with Server-Confirmed Lifecycle */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-brand-orange" />
            <h3 className="text-lg font-semibold text-brand-light">Daily Quests</h3>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-dark border border-brand-orange/30 text-brand-orange shadow-sm flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-brand-orange" />
            {unclaimedXpAvailable > 0 ? `+${unclaimedXpAvailable} XP Available` : 'All Claimed Today ✓'}
          </span>
        </div>

        {/* Quest Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {displayQuests.map(quest => {
            const Icon = getQuestIcon(quest);
            const action = getQuestAction(quest);
            const isClaimed = Boolean(quest.claimed || quest.isClaimed);
            const isCompleted = Boolean(quest.completed || quest.isCompleted);
            const isReadyToClaim = isCompleted && !isClaimed;
            const isClaiming = isClaimingQuest(quest.id);
            const progress = quest.progress ?? quest.current ?? 0;
            const target = quest.target || 1;
            const reward = quest.xpReward ?? quest.reward ?? 50;
            const progressPercent = Math.min(100, Math.round((progress / target) * 100));

            return (
              <div
                key={quest.id}
                className={`bg-brand-card rounded-lg p-5 shadow-lg flex flex-col justify-between relative overflow-hidden transition-all min-h-[220px] ${
                  isClaimed
                    ? 'border border-emerald-500/30'
                    : isReadyToClaim
                    ? 'border-2 border-brand-orange shadow-brand-orange/10'
                    : 'border border-brand-dark hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isClaimed
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : isReadyToClaim
                        ? 'bg-brand-orange/20 text-brand-orange'
                        : 'bg-brand-dark text-brand-orange'
                    }`}>
                      {isClaimed ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    {isClaimed ? (
                      <span className="px-2.5 py-1 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Claimed
                      </span>
                    ) : isReadyToClaim ? (
                      <span className="px-2.5 py-1 rounded text-[11px] font-bold bg-brand-orange/20 text-brand-orange border border-brand-orange/40 animate-pulse">
                        +{reward} XP Ready!
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded text-[11px] font-bold bg-brand-dark text-brand-orange border border-brand-orange/20">
                        +{reward} XP
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-sm text-brand-light leading-snug mb-1">
                    {quest.title}
                  </h4>
                  <p className="text-xs text-brand-muted leading-relaxed mb-4 line-clamp-2">
                    {quest.description}
                  </p>
                </div>

                <div className="space-y-3 pt-2 border-t border-brand-dark/50">
                  {/* Progress Indicator */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className={isClaimed ? 'text-emerald-400 font-semibold' : 'text-brand-muted'}>
                        {isClaimed ? 'Completed & Claimed' : isReadyToClaim ? 'Goal Reached!' : 'Progress'}
                      </span>
                      <strong className={`font-bold ${isClaimed ? 'text-emerald-400' : 'text-brand-light'}`}>
                        {progress} / {target}
                      </strong>
                    </div>
                    <div className="h-1.5 w-full bg-brand-dark rounded-full overflow-hidden">
                      <div
                        style={{ width: `${isClaimed || isCompleted ? 100 : progressPercent}%` }}
                        className={`h-full rounded-full transition-all duration-500 ${
                          isClaimed ? 'bg-emerald-500' : isReadyToClaim ? 'bg-brand-orange' : 'bg-brand-orange'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Dynamic Action Button based on Server-Confirmed State */}
                  {isClaimed ? (
                    <div className="w-full py-2 px-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Claimed today (+{reward} XP)</span>
                    </div>
                  ) : isReadyToClaim ? (
                    <button
                      id={`claim-quest-${quest.id}`}
                      onClick={() => claimQuest(quest.id)}
                      disabled={isClaiming}
                      className="w-full py-2 px-3 rounded-lg bg-brand-orange hover:bg-brand-orange/90 text-brand-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-brand-orange/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                    >
                      {isClaiming ? (
                        <>
                          <RotateCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Claiming Reward...</span>
                        </>
                      ) : (
                        <>
                          <Award className="w-3.5 h-3.5" />
                          <span>Claim +{reward} XP</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => onNavigate(action.tab)}
                      className="w-full py-2 px-3 rounded-lg bg-brand-dark hover:bg-brand-dark/80 text-brand-light text-xs font-semibold flex items-center justify-between border border-white/5 transition-all group/btn cursor-pointer"
                    >
                      <span className="text-brand-muted group-hover/btn:text-brand-light transition-colors">{action.label}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-brand-muted group-hover/btn:text-brand-orange group-hover/btn:translate-x-0.5 transition-all" />
                    </button>
                  )}
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
