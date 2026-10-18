import React, { useState } from 'react';
import { ArrowLeft, BookOpen, Award, CheckCircle2, ArrowRight, Sparkles, Lightbulb, PieChart } from 'lucide-react';
import { MODULES_DATA } from '../data/modulesData';
import { VisualAidRenderer } from '../components/VisualAids';
import { useApp } from '../context/AppContext';

export const StudyModulePage: React.FC<{
  conceptId: string;
  onBackToRoadmap: () => void;
  onStartQuiz: (conceptId: string) => void;
}> = ({ conceptId, onBackToRoadmap, onStartQuiz }) => {
  const { masteredConceptIds, holdings, stocks, formatMoney } = useApp();
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);

  const module = MODULES_DATA.find(m => m.id === conceptId) || MODULES_DATA[0];
  const isMastered = masteredConceptIds.includes(module.id);
  const activeChapter = module.chapters[activeChapterIndex] || module.chapters[0];

  // Calculate user's live portfolio sector distribution for "Apply Lesson to Portfolio" feature
  const holdingsList = Object.values(holdings);
  const sectorMap: Record<string, number> = {};
  let totalPortfolioValue = 0;

  holdingsList.forEach(h => {
    const stock = stocks.find(s => s.symbol === h.symbol);
    const price = stock ? stock.price : h.avgCost;
    const value = h.shares * price;
    const cat = stock ? stock.category : 'Other';

    sectorMap[cat] = (sectorMap[cat] || 0) + value;
    totalPortfolioValue += value;
  });

  return (
    <div className="w-full space-y-8 pb-16">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToRoadmap}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-card border-none hover:bg-brand-card/80 text-brand-muted text-xs font-semibold transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Roadmap</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-brand-card border-none text-brand-light text-xs font-bold">
            {module.category}
          </span>
          {isMastered && (
            <span className="px-3 py-1 rounded-full bg-brand-dark border-none text-brand-light text-xs font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-muted" /> Mastered
            </span>
          )}
        </div>
      </div>

      {/* Module Title Banner */}
      <div className="space-y-3">
        <h1 className="text-3xl sm:text-5xl font-bold text-brand-light tracking-tight">
          {module.title}
        </h1>
        <p className="text-sm sm:text-sm text-brand-muted leading-relaxed font-normal">
          {module.summary}
        </p>

        <div className="flex items-center gap-4 text-xs text-brand-muted font-medium pt-2">
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-brand-muted" /> {module.chapters.length} Chapters (~{module.estimatedMinutes}m read)
          </span>
          <span className="flex items-center gap-1.5 text-brand-orange font-bold">
            <Award className="w-4 h-4 text-brand-orange" /> Earn +{module.xpReward} XP
          </span>
        </div>
      </div>

      {/* Multi-Chapter Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-brand-dark pb-2 overflow-x-auto scrollbar-none">
        {module.chapters.map((ch, idx) => (
          <button
            key={ch.id}
            onClick={() => setActiveChapterIndex(idx)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeChapterIndex === idx
                ? 'bg-brand-orange text-brand-black shadow-md shadow-brand-orange/30'
                : 'bg-brand-card text-brand-muted hover:bg-brand-dark border-none'
            }`}
          >
            <span>{idx + 1}. {ch.title.split(':')[1] || ch.title}</span>
          </button>
        ))}
      </div>

      {/* Active Chapter Deep-Dive Content */}
      <div className="bg-brand-dark border border-brand-dark rounded-lg p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-brand-card pb-3">
          <h3 className="text-lg font-semibold text-brand-light flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-orange" />
            {activeChapter.title}
          </h3>
          <span className="text-xs text-brand-muted font-mono">Chapter {activeChapterIndex + 1} of {module.chapters.length}</span>
        </div>

        <div className="text-sm text-brand-light leading-relaxed whitespace-pre-line">
          {activeChapter.content}
        </div>

        {activeChapter.example && (
          <div className="p-4 bg-brand-card border-none rounded-lg space-y-1 text-xs">
            <strong className="text-brand-light font-bold font-mono flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
              <Lightbulb className="w-4 h-4 text-brand-orange" /> Real-World Example
            </strong>
            <p className="text-brand-muted leading-relaxed">{activeChapter.example}</p>
          </div>
        )}

        {activeChapter.keyPoint && (
          <div className="p-3 bg-brand-card border-none rounded-lg text-xs text-brand-light font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-brand-orange shrink-0" />
            <span><strong>Key Takeaway:</strong> {activeChapter.keyPoint}</span>
          </div>
        )}

        {activeChapter.keyTakeaways && activeChapter.keyTakeaways.length > 0 && (
          <div className="p-4 bg-brand-card border-none rounded-lg space-y-2 text-xs">
            <strong className="text-brand-light font-bold font-mono flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-brand-orange" /> Chapter Takeaways
            </strong>
            <ul className="space-y-1.5 text-brand-muted leading-relaxed">
              {activeChapter.keyTakeaways.map((takeaway, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-brand-orange font-bold select-none">•</span>
                  <span>{takeaway}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Apply Lesson to Your Live Paper Portfolio (Specific to Diversification module) */}
      {module.id === 'diversification' && (
        <div className="bg-brand-card border-none rounded-lg p-6 sm:p-8 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-brand-dark pb-3">
            <h3 className="text-lg font-semibold text-brand-light flex items-center gap-2">
              <PieChart className="w-5 h-5 text-brand-muted" /> Apply Lesson: Your Live Portfolio Sector Concentration
            </h3>
            <span className="text-xs text-brand-muted font-mono">Total Value: {formatMoney(totalPortfolioValue)}</span>
          </div>

          {holdingsList.length === 0 ? (
            <p className="text-sm text-brand-muted">You currently hold 0 stock positions in the simulator.</p>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {Object.entries(sectorMap).map(([cat, val]) => {
                  const pct = Math.round((val / totalPortfolioValue) * 100);
                  return (
                    <div key={cat} className="p-3 bg-brand-dark rounded-lg border-none">
                      <span className="text-[10px] text-brand-muted block uppercase font-bold">{cat}</span>
                      <strong className="text-sm font-bold font-mono text-brand-light">{pct}%</strong>
                      <span className="text-[11px] text-brand-muted block mt-0.5">{formatMoney(val)}</span>
                    </div>
                  );
                })}
              </div>

              {Object.keys(sectorMap).length < 3 ? (
                <div className="p-3 bg-brand-dark border-none rounded-lg text-xs text-brand-light font-medium">
                  💡 <strong>Diversification Tip:</strong> Your portfolio is currently concentrated in only {Object.keys(sectorMap).length} sector(s). Consider adding stocks from other industries to reduce unsystematic risk!
                </div>
              ) : (
                <div className="p-3 bg-brand-dark border-none rounded-lg text-xs text-brand-light font-medium">
                  ✅ <strong>Great Job:</strong> Your paper portfolio is well diversified across {Object.keys(sectorMap).length} distinct sectors!
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Interactive Visual Aid */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-brand-light uppercase tracking-wider px-2">Interactive Visual Aid</h3>
        <VisualAidRenderer type={module.visualAidType} />
      </div>

      {/* Module Key Takeaways Summary */}
      <div className="bg-brand-card border-none rounded-lg p-6 sm:p-8 space-y-4 shadow-xl">
        <h3 className="text-lg font-semibold text-brand-light flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-brand-muted" /> Module Key Takeaways
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {module.keyTakeaways.map((takeaway, tIdx) => (
            <div key={tIdx} className="p-4 bg-brand-dark rounded-lg border-none space-y-1">
              <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider block">Rule #{tIdx + 1}</span>
              <p className="text-sm text-brand-muted font-normal leading-relaxed">{takeaway}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Start Quiz Action Footer */}
      <div className="bg-brand-card border-none rounded-lg p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="text-lg font-semibold text-brand-light">Ready to test your understanding?</h4>
          <p className="text-sm text-brand-muted">Take the chapter-mapped quiz to master this concept and earn XP.</p>
        </div>
        <button
          onClick={() => onStartQuiz(module.id)}
          className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-brand-orange text-brand-black font-bold text-sm shadow-xl shadow-brand-orange/30 hover:scale-105 transition-all flex items-center justify-center gap-2 group"
        >
          <span>Take Quiz (+{module.xpReward} XP)</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};
