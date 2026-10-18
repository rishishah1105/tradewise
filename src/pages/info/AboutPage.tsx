import React from 'react';
import { BookOpen, CandlestickChart, Trophy } from 'lucide-react';
import { SITE } from '../../config/site';
import { InfoPageLayout } from './InfoPageLayout';

export interface AboutPageProps {
  onNavigate: (tab: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <InfoPageLayout title="About TradeWise">
      {/* Mission */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-brand-light mt-4 mb-2">Our Mission</h2>
        <p className="text-sm text-brand-muted leading-relaxed">
          Making financial literacy accessible, structured, and practical for Indian students and first-time retail investors.
          TradeWise bridges the gap between theoretical market concepts and real execution without risking hard-earned money.
        </p>
      </section>

      {/* What TradeWise is */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-brand-light mt-8 mb-2">What is TradeWise?</h2>
        <p className="text-sm text-brand-muted leading-relaxed">
          TradeWise is an adaptive financial-literacy and paper-trading platform designed for Indian markets (NSE).
          It combines an interactive visual learning roadmap of bite-sized concept modules and mastery quizzes with a live simulated trading engine loaded with virtual ₹1,00,000.
          Gamified milestones—experience points (XP), daily study streaks, verifiable achievement badges, and distribution-based leaderboards—keep learners engaged throughout their financial education journey.
        </p>
      </section>

      {/* 3-Step Grid: Learn -> Practise -> Track */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-brand-light mt-8 mb-2">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Step 1 */}
          <div className="bg-brand-dark p-5 rounded-xl border border-white/5 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-brand-light">1. Learn</h3>
            <p className="text-xs text-brand-muted leading-relaxed">
              Explore bite-sized modules on equity fundamentals, risk management, and order types with instant-feedback concept quizzes.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('roadmap')}
              className="text-xs font-semibold text-brand-orange hover:underline cursor-pointer inline-block"
            >
              Explore Roadmap →
            </button>
          </div>

          {/* Step 2 */}
          <div className="bg-brand-dark p-5 rounded-xl border border-white/5 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CandlestickChart className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-brand-light">2. Practise</h3>
            <p className="text-xs text-brand-muted leading-relaxed">
              Place market and limit orders on simulated NSE stocks using virtual ₹1,00,000 cash balance in real market conditions.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('simulator')}
              className="text-xs font-semibold text-brand-orange hover:underline cursor-pointer inline-block"
            >
              Try Simulator →
            </button>
          </div>

          {/* Step 3 */}
          <div className="bg-brand-dark p-5 rounded-xl border border-white/5 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-brand-light">3. Track</h3>
            <p className="text-xs text-brand-muted leading-relaxed">
              Accumulate XP, unlock 3D achievement badges, maintain check-in streaks, and benchmark yourself on the learner distribution.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('leaderboard')}
              className="text-xs font-semibold text-brand-orange hover:underline cursor-pointer inline-block"
            >
              View Leaderboard →
            </button>
          </div>
        </div>
      </section>

      {/* Built At Institution */}
      <section className="space-y-3 pt-4 border-t border-brand-dark">
        <h2 className="text-lg font-semibold text-brand-light mt-4 mb-2">Institutional Origin</h2>
        <p className="text-sm text-brand-muted leading-relaxed">
          TradeWise was developed as an educational capstone project at <strong className="text-brand-light">{SITE.institution}</strong>.
          It is crafted to foster responsible, data-backed investment habits among college students and future investors.
        </p>
      </section>

      {/* Team Members Section (rendered only if SITE.teamMembers is non-empty) */}
      {SITE.teamMembers && SITE.teamMembers.length > 0 && (
        <section className="space-y-4 pt-4 border-t border-brand-dark">
          <h2 className="text-lg font-semibold text-brand-light mt-4 mb-2">Project Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {SITE.teamMembers.map(member => (
              <div key={member.name} className="bg-brand-dark p-4 rounded-xl border border-white/5">
                <span className="text-sm font-bold text-brand-light block">{member.name}</span>
                <span className="text-xs text-brand-muted block mt-0.5">{member.role}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </InfoPageLayout>
  );
};
