import React, { useState, useRef, useEffect } from 'react';
import { Lock, CheckCircle2, Award, PlayCircle, ArrowRight, ShieldCheck, Heart, ChevronDown, BookOpen, X, ChevronRight, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MODULES_DATA } from '../data/modulesData';
import { findShortestPathToTopic, type PathResult } from '../utils/graphAlgorithms';

export const RoadmapPage: React.FC<{ onSelectConcept: (conceptId: string) => void }> = ({ onSelectConcept }) => {
  const { masteredConceptIds, isConceptUnlocked, user } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [targetTopicId, setTargetTopicId] = useState<string>('portfolio-allocation');
  const [shortestPathResult, setShortestPathResult] = useState<PathResult | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isChapterSidebarOpen, setIsChapterSidebarOpen] = useState(false);
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
    <div className="w-full space-y-3 pb-12">
      {/* Top Cards: Fastest Path (3 cols) & Roadmap Mastery (2 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 items-stretch">
        {/* Fastest-Path-to-Topic Tool */}
        <div className="lg:col-span-3 bg-brand-card border-none rounded-lg p-6 min-h-[215px] shadow-xl flex flex-col justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-brand-light leading-snug">
              Fastest Path <span className="block text-brand-light">to Goal Topic</span>
            </h3>
            <p className="text-sm text-brand-muted mt-2 leading-relaxed">
              Calculate the exact minimal set of prerequisites needed to reach any advanced concept.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full" ref={dropdownRef}>
            <div className="relative flex-1">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full bg-brand-dark border-none rounded-xl px-4 py-2.5 text-xs text-brand-light font-semibold flex items-center justify-between gap-2 cursor-pointer hover:bg-brand-dark/80 transition-colors"
              >
                <span className="truncate">{selectedModule.title}</span>
                <ChevronDown className={`w-4 h-4 text-brand-muted shrink-0 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-[#1e2030] border border-white/10 rounded-xl shadow-2xl max-h-64 overflow-y-auto p-1.5 space-y-0.5">
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
              className="px-5 py-2.5 rounded-xl bg-brand-light text-brand-black hover:scale-105 font-bold text-xs shadow-md shadow-white/10 transition-all shrink-0 cursor-pointer"
            >
              Find Route
            </button>
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

        {/* Roadmap Mastery Card with Circular Progress Wheel */}
        <div className="lg:col-span-2 bg-brand-card border-none rounded-lg p-6 min-h-[215px] shadow-xl flex flex-col justify-between gap-3">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-dark flex items-center justify-center shrink-0 mt-0.5">
                <Heart className="w-5 h-5 fill-brand-muted text-brand-muted animate-pulse" />
              </div>
              <div>
                <span className="text-xs font-extrabold text-brand-muted uppercase tracking-wider block">Roadmap Mastery</span>
                <h2 className="text-xl font-bold text-brand-light mt-0.5">
                  {progressPercent}% Complete <span className="text-xs font-medium text-brand-muted">({masteredCount}/{total} Nodes)</span>
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsChapterSidebarOpen(prev => !prev)}
              title={isChapterSidebarOpen ? "Close chapter syllabus" : "Open chapter syllabus"}
              aria-label={isChapterSidebarOpen ? "Close chapter syllabus" : "Open chapter syllabus"}
              className="p-2 rounded-lg bg-brand-dark hover:bg-brand-dark/80 text-brand-light border border-slate-700/60 transition-colors shrink-0 cursor-pointer flex items-center justify-center shadow-sm"
            >
              <BookOpen className="w-4 h-4 text-brand-orange" />
            </button>
          </div>

          {/* Middle: Prominent Circular Progress Wheel */}
          <div className="flex items-center justify-between gap-4 my-auto py-1">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-brand-dark border-none text-brand-light text-xs font-bold">
                  Level {effectiveLevel}
                </span>
                <span className="px-3 py-1 rounded-full bg-brand-dark border-none text-brand-orange text-xs font-bold">
                  {xpInCurrentLevel} / {xpForNextLevel} XP
                </span>
              </div>
              <p className="text-xs text-brand-muted">
                <strong>{masteredCount}</strong> of <strong>{total}</strong> concepts mastered
              </p>
            </div>

            {/* Circular Progress Wheel (indicates % progress done) */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {/* Background track */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  className="stroke-[#1A2232]"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Progress Wheel Arc */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  className="stroke-[#10b981] transition-all duration-700 ease-out"
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 38}
                  strokeDashoffset={2 * Math.PI * 38 * (1 - progressPercent / 100)}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-lg sm:text-xl font-black text-brand-light">{progressPercent}%</span>
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-brand-muted">Mastered</span>
              </div>
            </div>
          </div>

          {/* Bottom Linear HP Bar */}
          <div className="relative h-5 w-full bg-brand-dark rounded-xl overflow-hidden p-0.5 shadow-inner">
            <div
              style={{ width: `${progressPercent}%` }}
              className="h-full bg-brand-orange rounded-lg transition-all duration-700 ease-out relative flex items-center justify-end pr-2"
            >
              {progressPercent > 10 && (
                <span className="text-[9px] font-black text-brand-black uppercase drop-shadow">
                  {progressPercent}% HP
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter Tabs & Chapters Sidebar Toggle */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-0 scrollbar-none">
        <div className="flex items-center gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-brand-orange text-brand-black shadow-md shadow-brand-orange/30'
                  : 'bg-brand-card text-brand-muted hover:bg-brand-dark border-none'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setIsChapterSidebarOpen(prev => !prev)}
          title={isChapterSidebarOpen ? "Close chapter syllabus" : "Open chapter syllabus"}
          aria-label={isChapterSidebarOpen ? "Close chapter syllabus" : "Open chapter syllabus"}
          className="p-2.5 rounded-xl bg-brand-card hover:bg-brand-dark border border-slate-800 transition-all cursor-pointer shrink-0 flex items-center justify-center shadow-sm"
        >
          <BookOpen className="w-4 h-4 text-brand-orange" />
        </button>
      </div>

      {/* Interactive Node Graph List */}
      <div className="space-y-5">
        {categories.filter(c => c !== 'All' && (selectedCategory === 'All' || selectedCategory === c)).map(categoryName => {
          const categoryModules = MODULES_DATA.filter(m => m.category === categoryName);

          return (
            <div key={categoryName} className="space-y-3">
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
                      <Lock className="w-3.5 h-3.5 text-brand-muted" /> Locked
                    </span>
                  );

                  if (isMastered) {
                    cardStyle = 'bg-brand-card border-[#10b981] border-2 shadow-xl cursor-pointer relative';
                    statusBadge = (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-dark text-[#10b981] text-xs font-bold border border-[#10b981]/30">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" /> Mastered
                      </span>
                    );
                  } else if (isUnlocked) {
                    cardStyle = 'bg-brand-card border-brand-orange border-2 cursor-pointer';
                    statusBadge = (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-dark text-brand-orange text-xs font-black">
                        <PlayCircle className="w-3.5 h-3.5 text-brand-orange" /> Start
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
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#10b981] rounded-full flex items-center justify-center shadow-md z-10">
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <div className="flex items-center justify-between gap-2">
                          {statusBadge}
                          <span className="text-[11px] font-semibold text-brand-muted flex items-center gap-1.5 bg-brand-dark px-2.5 py-1 rounded-full border border-slate-800 shrink-0">
                            <Clock className="w-3 h-3 text-brand-orange" />
                            <span>~{mod.estimatedMinutes}m · {mod.chapters.length} chs</span>
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
                            className="px-4 py-1.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-1 bg-brand-orange text-brand-black hover:scale-105 cursor-pointer"
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

      {/* Chapters Navigation Sidebar Drawer (User can open and close) */}
      {isChapterSidebarOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end animate-in fade-in">
          <div className="w-full max-w-md bg-[#131926] border-l border-slate-800 shadow-2xl h-full flex flex-col p-6 animate-in slide-in-from-right duration-250">
            {/* Sidebar Header with Close Button */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-brand-orange/10 border border-brand-orange/30 flex items-center justify-center text-brand-orange">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-brand-light">Chapter Navigator</h3>
                  <p className="text-xs text-brand-muted">Select any chapter to start learning</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsChapterSidebarOpen(false)}
                title="Close sidebar"
                className="p-1.5 rounded-lg text-brand-muted hover:text-brand-light hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chapters List by Module */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {MODULES_DATA.map((mod, modIdx) => {
                const isMastered = masteredConceptIds.includes(mod.id);
                const isUnlocked = isConceptUnlocked(mod.id);

                return (
                  <div key={mod.id} className="bg-brand-dark/50 border border-slate-800/60 rounded-xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-bold text-brand-light truncate">
                        <span className="w-5 h-5 rounded-full bg-brand-dark text-slate-300 text-[10px] flex items-center justify-center shrink-0">
                          {modIdx + 1}
                        </span>
                        <span className="truncate">{mod.title}</span>
                      </div>
                      {isMastered && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full shrink-0">
                          <CheckCircle2 className="w-3 h-3" /> Done
                        </span>
                      )}
                    </div>

                    {/* Chapters list under this module */}
                    <div className="space-y-1 pl-2 border-l border-slate-800 ml-2.5">
                      {mod.chapters.map((ch, chIdx) => (
                        <button
                          key={ch.id}
                          type="button"
                          onClick={() => {
                            onSelectConcept(mod.id);
                            setIsChapterSidebarOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                            isUnlocked
                              ? 'text-slate-300 hover:bg-white/5 hover:text-brand-orange'
                              : 'text-slate-500 opacity-60'
                          }`}
                        >
                          <span className="truncate">
                            {chIdx + 1}. {ch.title.split(':')[1] || ch.title}
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-40" />
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sidebar Footer with Close Button */}
            <div className="pt-4 border-t border-slate-800/80 mt-2">
              <button
                type="button"
                onClick={() => setIsChapterSidebarOpen(false)}
                className="w-full py-2.5 rounded-xl bg-brand-dark hover:bg-brand-dark/80 text-brand-light text-xs font-bold transition-colors cursor-pointer text-center"
              >
                Close Sidebar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

