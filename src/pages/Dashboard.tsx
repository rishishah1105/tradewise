import React from 'react';
import { Compass, CandlestickChart, Award, Flame, ArrowRight, CheckCircle2, TrendingUp, BookOpen, Target } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MODULES_DATA } from '../data/modulesData';

export const Dashboard: React.FC<{
  onSelectConcept: (conceptId: string) => void;
  onNavigate: (tab: string) => void;
}> = ({ onSelectConcept, onNavigate }) => {
  const { user, masteredConceptIds, cashBalance, holdings, stocks, dailyQuestState, activeQuestConfig, formatMoney, claimDailyStreak } = useApp();

  const totalConcepts = MODULES_DATA.length;
  const masteryPercent = (masteredConceptIds.length / totalConcepts) * 100;
  const minPercent = 5;
  const displayPercent = masteryPercent === 0 ? 0 : Math.max(masteryPercent, minPercent);
  const circumference = 2 * Math.PI * 58;

  const today = new Date().toISOString().split('T')[0];
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

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner Greeting */}
      <div className="bg-brand-card border-none rounded-lg p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-brand-orange/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
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
              You are on Level {user.level} with {user.xp} XP. Master Indian market modules or trade NSE stocks to climb the leaderboard!
            </p>
          </div>

          {/* Daily Streak Card */}
          <div className="w-full lg:w-auto bg-brand-dark border-none p-4 rounded-lg flex items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-brand-orange/10 border border-brand-orange/30 flex items-center justify-center text-brand-orange">
                <Flame className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-xs font-bold text-brand-muted uppercase tracking-wider block">Daily Streak</span>
                <span className="text-xl font-black text-brand-light">{user.streak} Consecutive Days</span>
              </div>
            </div>
            <button
              onClick={claimDailyStreak}
              disabled={isStreakClaimed}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isStreakClaimed
                  ? 'bg-brand-card text-brand-muted cursor-not-allowed border-none'
                  : 'bg-brand-orange text-brand-black hover:scale-105 shadow-md shadow-brand-orange/20'
              }`}
            >
              {isStreakClaimed ? 'Claimed Today ✓' : 'Claim +50 XP'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Recommended Concept + Dynamic Mastery Ring + Daily Quests */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
              className="px-6 py-2.5 rounded-xl bg-brand-orange text-brand-black font-bold text-xs shadow-lg shadow-brand-orange/30 hover:scale-105 transition-all flex items-center gap-2"
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
              className="text-brand-light hover:underline font-semibold text-xs flex items-center gap-1 justify-center pt-1"
            >
              <Compass className="w-3.5 h-3.5" /> View Interactive Roadmap
            </button>
          </div>
        </div>
      </div>

      {/* Compact Daily Quest Row */}
      <div className="bg-brand-card border-none border-l-4 border-l-brand-orange rounded-lg p-4 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-brand-dark flex items-center justify-center text-brand-muted">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-brand-light">Daily Quest</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-orange text-brand-black">+{activeQuestConfig.reward} XP</span>
            </div>
            <p className="text-sm text-brand-muted">{activeQuestConfig.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {activeQuestConfig.target > 1 && (
            <div className="text-xs font-mono text-brand-muted">
              {dailyQuestState.progress} / {activeQuestConfig.target}
            </div>
          )}
          {dailyQuestState.completed ? (
            <div className="flex items-center gap-1.5 text-[#10b981] bg-brand-dark px-3 py-1.5 rounded-lg border-none">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Completed</span>
            </div>
          ) : (
            <div className="px-4 py-1.5 rounded-lg text-xs font-bold bg-brand-dark text-brand-muted border-none">
              In Progress
            </div>
          )}
        </div>
      </div>



      {/* Indian Paper Trading Terminal Snapshot */}
      <div className="bg-brand-card border-none rounded-lg p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-brand-dark pb-4">
          <div>
            <span className="text-xs font-bold text-brand-muted uppercase tracking-wider block">NSE Paper Trading Snapshot</span>
            <h3 className="text-lg font-semibold text-brand-light flex items-center gap-2">
              <CandlestickChart className="w-5 h-5 text-brand-muted" /> Portfolio Net Worth: {formatMoney(totalEquity)}
            </h3>
          </div>
          <button
            onClick={() => onNavigate('simulator')}
            className="px-5 py-2 rounded-lg bg-brand-dark hover:bg-brand-dark/80 text-brand-light text-xs font-bold border-none transition-all flex items-center gap-2"
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
