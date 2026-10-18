import React, { useState, useRef, useEffect } from 'react';
import { Lock, CheckCircle2, BookOpen, Award, Compass, ArrowRight, ShieldCheck, Heart, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MODULES_DATA } from '../data/modulesData';
import { findShortestPathToTopic, type PathResult } from '../utils/graphAlgorithms';

export const RoadmapPage: React.FC<{ onSelectConcept: (conceptId: string) => void }> = ({ onSelectConcept }) => {
  const { masteredConceptIds, isConceptUnlocked, user } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [targetTopicId, setTargetTopicId] = useState<string>('portfolio-allocation');
  const [shortestPathResult, setShortestPathResult] = useState<PathResult | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const categories = ['All', 'Basics', 'Risk & Diversification', 'Instruments', 'Trading Mechanics', 'Portfolio Strategy'];

  const total = MODULES_DATA.length;
  const masteredCount = masteredConceptIds.length;
  const progressPercent = Math.round((masteredCount / total) * 100);

  const effectiveLevel = Math.floor(user.xp / 300) + 1;
  const xpStart = (effectiveLevel - 1) * 300;
  const xpInCurrentLevel = user.xp - xpStart;
  const xpForNextLevel = 300;

  const handleCalculateShortestPath = () => {
    const res = findShortestPathToTopic(targetTopicId);
    setShortestPathResult(res);
  };

  const selectedModule = MODULES_DATA.find(m => m.id === targetTopicId) || MODULES_DATA[0];

  return (
    <div className="w-full space-y-8 pb-12">
      {/* Persistent HP Bar Header */}
      <div className="bg-brand-card border-none rounded-lg p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-dark flex items-center justify-center text-brand-muted">
              <Heart className="w-5 h-5 fill-brand-muted animate-pulse" />
            </div>
            <div>
              <span className="text-xs font-extrabold text-brand-muted uppercase tracking-wider block">Roadmap Mastery</span>
              <h2 className="text-2xl font-bold text-brand-light">{progressPercent}% Completed ({masteredCount}/{total} Nodes)</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-brand-dark border-none text-brand-light text-xs font-bold">
              Level {effectiveLevel}
            </span>
            <span className="px-3 py-1 rounded-full bg-brand-dark border-none text-brand-orange text-xs font-bold">
              {xpInCurrentLevel} / {xpForNextLevel} XP
            </span>
          </div>
        </div>

        {/* Animated Horizontal Game Health/HP Bar */}
        <div className="relative h-6 w-full bg-brand-dark rounded-lg overflow-hidden p-1 shadow-inner">
          <div
            style={{ width: `${progressPercent}%` }}
            className="h-full bg-brand-orange rounded-xl transition-all duration-700 ease-out relative flex items-center justify-end pr-2"
          >
            {progressPercent > 10 && (
              <span className="text-[10px] font-black text-brand-black uppercase drop-shadow">
                {progressPercent}% HP
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Fastest-Path-to-Topic Tool (BFS / Dijkstra Prerequisite Graph Finder) */}
      <div className="bg-brand-card border-none rounded-lg p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-brand-light">Fastest Path to Goal Topic</h3>
            <p className="text-sm text-brand-muted">Calculate the exact minimal set of prerequisites needed to reach any advanced concept.</p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto relative" ref={dropdownRef}>
            <div className="relative flex-1 sm:flex-none">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full sm:w-64 bg-brand-dark border-none rounded-lg px-3 py-2 text-xs text-brand-light font-semibold flex items-center justify-between gap-2 cursor-pointer hover:bg-brand-dark/80 transition-colors"
              >
                <span className="truncate">{selectedModule.title}</span>
                <ChevronDown className={`w-4 h-4 text-brand-muted shrink-0 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-full sm:w-80 z-50 bg-[#1e2030] border border-white/10 rounded-xl shadow-2xl max-h-64 overflow-y-auto p-1.5 space-y-0.5">
                  {MODULES_DATA.map((m) => {
                    const isSelected = m.id === targetTopicId;
                    const isMastered = masteredConceptIds.includes(m.id);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setTargetTopicId(m.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between gap-2.5 transition-colors cursor-pointer ${
                          isSelected ? 'bg-white/10 text-brand-light font-bold' : 'text-slate-300 hover:bg-white/5 font-medium'
                        }`}
                      >
                        <span className="truncate">{m.title}</span>
                        {isMastered && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981] shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              onClick={handleCalculateShortestPath}
              className="px-4 py-2 rounded-xl bg-brand-light text-brand-black hover:scale-105 font-bold text-xs shadow-md shadow-white/10 transition-all shrink-0 cursor-pointer"
            >
              Find Route
            </button>
          </div>
        </div>

        {shortestPathResult && (
          <div className="p-4 bg-brand-dark rounded-lg space-y-2 animate-fade-in text-xs">
            <div className="flex items-center justify-between text-brand-light">
              <strong className="font-bold font-mono">
                Shortest Sequence ({shortestPathResult.path.length} Total Steps / {shortestPathResult.prerequisitesCount} Prerequisites):
              </strong>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {shortestPathResult.path.map((mod, idx) => (
                <React.Fragment key={mod.id}>
                  <div
                    onClick={() => onSelectConcept(mod.id)}
                    className="px-3 py-1.5 rounded-lg bg-brand-card border-none text-brand-light font-bold cursor-pointer transition-all flex items-center gap-1.5"
                  >
                    <span className="w-4 h-4 rounded-full bg-brand-dark text-[10px] flex items-center justify-center font-mono">{idx + 1}</span>
                    <span>{mod.title}</span>
                  </div>
                  {idx < shortestPathResult.path.length - 1 && <ArrowRight className="w-3.5 h-3.5 text-brand-muted" />}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-brand-orange text-brand-black shadow-md shadow-brand-orange/30'
                : 'bg-brand-card text-brand-muted hover:bg-brand-dark border-none'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Interactive Node Graph List */}
      <div className="space-y-6">
        {categories.filter(c => c !== 'All' && (selectedCategory === 'All' || selectedCategory === c)).map(categoryName => {
          const categoryModules = MODULES_DATA.filter(m => m.category === categoryName);

          return (
            <div key={categoryName} className="space-y-4">
              <div className="flex items-center gap-3 border-b border-brand-card pb-2">
                <ShieldCheck className="w-5 h-5 text-brand-muted" />
                <h3 className="text-lg font-semibold text-brand-light">{categoryName}</h3>
                <span className="text-xs font-semibold text-brand-muted">
                  ({categoryModules.filter(m => masteredConceptIds.includes(m.id)).length}/{categoryModules.length} Mastered)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryModules.map(mod => {
                  const isMastered = masteredConceptIds.includes(mod.id);
                  const isUnlocked = isConceptUnlocked(mod.id);

                  let cardStyle = 'bg-brand-card border-brand-muted opacity-70 grayscale cursor-not-allowed';
                  let statusBadge = (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-dark text-brand-muted text-xs font-bold border border-brand-muted">
                      <Lock className="w-3.5 h-3.5 text-brand-muted" /> 🔒 Locked
                    </span>
                  );

                  if (isMastered) {
                    cardStyle = 'bg-brand-card border-brand-orange border-2 shadow-xl cursor-pointer relative';
                    statusBadge = (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-dark text-brand-muted text-xs font-bold border border-brand-muted">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-orange" /> Mastered
                      </span>
                    );
                  } else if (isUnlocked) {
                    cardStyle = 'bg-brand-card border-brand-orange border-2 cursor-pointer';
                    statusBadge = (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-dark text-brand-orange text-xs font-black">
                        <Compass className="w-3.5 h-3.5 text-brand-orange" /> 🧭 Ready to Start
                      </span>
                    );
                  }

                  return (
                    <div
                      key={mod.id}
                      onClick={() => {
                        if (isUnlocked) onSelectConcept(mod.id);
                      }}
                      className={`rounded-3xl p-5 border-2 flex flex-col justify-between transition-all duration-300 relative group ${cardStyle}`}
                    >
                      <div className="space-y-3">
                        {isMastered && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-brand-orange rounded-full flex items-center justify-center shadow-md z-10">
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          {statusBadge}
                          <span className="text-[11px] font-medium flex items-center gap-1 text-brand-muted">
                            <BookOpen className="w-3.5 h-3.5 text-brand-muted" /> {mod.estimatedMinutes}m
                          </span>
                        </div>

                        <div>
                          <h4 className="text-lg font-semibold text-brand-light">
                            {mod.title}
                          </h4>
                          <p className="text-sm mt-1 line-clamp-2 leading-relaxed text-brand-muted">
                            {mod.summary}
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 mt-4 border-t flex items-center justify-between border-brand-dark">
                        <span className="text-xs font-bold flex items-center gap-1 text-brand-orange">
                          <Award className="w-3.5 h-3.5" /> +{mod.xpReward} XP
                        </span>

                        {isUnlocked ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectConcept(mod.id);
                            }}
                            className="px-4 py-1.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-1 bg-brand-orange text-brand-black hover:scale-105"
                          >
                            <span>{isMastered ? 'Review' : 'Start'}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-[10px] text-brand-muted font-semibold">
                            Req: {mod.prerequisites.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
