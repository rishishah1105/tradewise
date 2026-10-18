import React from 'react';
import { ArrowRight, BookOpen, CandlestickChart, Trophy, Sparkles, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LandingPage: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  const { formatMoney } = useApp();

  return (
    <div className="w-full min-h-screen bg-brand-dark text-brand-light selection:bg-brand-orange selection:text-brand-black">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 px-4 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-orange/5 rounded-full blur-3xl pointer-events-none" />
        <div className="w-full text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-card border border-brand-card text-brand-muted text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-brand-muted" /> Designed for College Students & Early Professionals
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-brand-light leading-tight">
            Master the stock market with <br />
            <span className="text-brand-light font-extrabold">
              Zero Risk & Maximum Confidence
            </span>
          </h1>

          <p className="text-sm md:text-xl text-brand-muted max-w-2xl mx-auto font-normal">
            TradeWise blends bite-sized interactive visual lessons with a live paper-trading simulator and a quiz-based mastery loop. Learn, practice, and compete.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={onStart}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-brand-orange text-brand-black font-bold text-base shadow-xl shadow-brand-orange/30 hover:scale-105 transition-all flex items-center justify-center gap-2 group"
            >
              <span>Start Learning Free</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={onStart}
              className="w-full sm:w-auto px-8 py-4 rounded-lg bg-brand-card border border-brand-card text-brand-muted font-semibold text-base hover:bg-brand-card/80 transition-all flex items-center justify-center gap-2"
            >
              <CandlestickChart className="w-5 h-5 text-brand-muted" />
              <span>Explore Paper Terminal</span>
            </button>
          </div>

          {/* Key Metrics Pill */}
          <div className="pt-10 flex flex-wrap justify-center gap-8 text-brand-muted text-xs font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-muted" />
              <span>13 Visual Concept Modules</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-muted" />
              <span>{formatMoney(10000)} Virtual Cash Trading</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-muted" />
              <span>Adaptive Quiz Mastery Loop</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Loop Grid: Learn -> Practice -> Compete */}
      <section className="py-16 px-4 bg-brand-card/50 border-y border-brand-card">
        <div className="w-full space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold text-brand-light">The 3-Step Mastery Loop</h2>
            <p className="text-brand-muted text-sm">How TradeWise turns complete beginners into confident investors.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-brand-card border border-brand-card rounded-lg p-6 shadow-xl space-y-4 hover:border-brand-muted/50 transition-all group">
              <div className="w-12 h-12 rounded-lg bg-brand-dark border border-brand-dark flex items-center justify-center text-brand-muted group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-brand-muted uppercase tracking-wider block">Step 1: Learn</span>
              <h3 className="text-lg font-semibold text-brand-light">Interactive Visual Modules</h3>
              <p className="text-sm text-brand-muted leading-relaxed">
                Short, digestible explanations paired with dynamic compounding calculators, SIP simulators, and candlestick diagrams. No walls of jargon text.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-brand-card border border-brand-card rounded-lg p-6 shadow-xl space-y-4 hover:border-brand-muted/50 transition-all group">
              <div className="w-12 h-12 rounded-lg bg-brand-dark border border-brand-dark flex items-center justify-center text-brand-muted group-hover:scale-110 transition-transform">
                <CandlestickChart className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-brand-muted uppercase tracking-wider block">Step 2: Practice</span>
              <h3 className="text-lg font-semibold text-brand-light">Paper-Trading Terminal</h3>
              <p className="text-sm text-brand-muted leading-relaxed">
                Execute market & limit orders in real-time on sample stocks like Apple, Nvidia, Tesla, and S&P 500 ETFs with virtual funds.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-brand-card border border-brand-card rounded-lg p-6 shadow-xl space-y-4 hover:border-brand-muted/50 transition-all group">
              <div className="w-12 h-12 rounded-lg bg-brand-dark border border-brand-dark flex items-center justify-center text-brand-muted group-hover:scale-110 transition-transform">
                <Trophy className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-brand-muted uppercase tracking-wider block">Step 3: Compete</span>
              <h3 className="text-lg font-semibold text-brand-light">Gamified Mastery & Ranks</h3>
              <p className="text-sm text-brand-muted leading-relaxed">
                Earn XP, maintain daily study streaks, unlock milestone badges, and climb global student leaderboards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-brand-card text-center text-xs text-brand-muted">
        <p>© 2026 TradeWise Financial Literacy Platform. Educational Paper-Trading Simulation.</p>
      </footer>
    </div>
  );
};
