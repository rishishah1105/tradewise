import React from 'react';
import { CandlestickChart } from 'lucide-react';
import { SITE } from '../config/site';
import { DatabaseStatusBadge } from './DatabaseStatusBadge';

export interface FooterProps {
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-brand-black border-t border-brand-card mt-12">
      <div className="w-full px-6 lg:px-8 py-8">
        {/* Top 4-Column Area */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand */}
          <div className="space-y-3">
            <div
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-2.5 cursor-pointer group w-fit"
            >
              <div className="w-8 h-8 rounded-lg bg-brand-card flex items-center justify-center group-hover:scale-105 transition-transform">
                <CandlestickChart className="w-4 h-4 text-brand-orange" />
              </div>
              <span className="font-extrabold text-xl text-brand-light tracking-tight">
                {SITE.name}
              </span>
            </div>
            <p className="text-sm text-brand-muted leading-relaxed max-w-xs">
              {SITE.tagline}
            </p>
          </div>

          {/* Col 2: Product */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-light">
              Product
            </h4>
            <ul className="space-y-2 flex flex-col items-start">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('dashboard')}
                  className="text-sm text-brand-muted hover:text-brand-light transition-colors cursor-pointer"
                >
                  Dashboard
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('roadmap')}
                  className="text-sm text-brand-muted hover:text-brand-light transition-colors cursor-pointer"
                >
                  Roadmap
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('simulator')}
                  className="text-sm text-brand-muted hover:text-brand-light transition-colors cursor-pointer"
                >
                  Simulator
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('leaderboard')}
                  className="text-sm text-brand-muted hover:text-brand-light transition-colors cursor-pointer"
                >
                  Leaderboard
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Company */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-light">
              Company
            </h4>
            <ul className="space-y-2 flex flex-col items-start">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('about')}
                  className="text-sm text-brand-muted hover:text-brand-light transition-colors cursor-pointer"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('contact')}
                  className="text-sm text-brand-muted hover:text-brand-light transition-colors cursor-pointer"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-light">
              Legal
            </h4>
            <ul className="space-y-2 flex flex-col items-start">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('privacy')}
                  className="text-sm text-brand-muted hover:text-brand-light transition-colors cursor-pointer"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('terms')}
                  className="text-sm text-brand-muted hover:text-brand-light transition-colors cursor-pointer"
                >
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('disclaimer')}
                  className="text-sm text-brand-muted hover:text-brand-light transition-colors cursor-pointer"
                >
                  Disclaimer
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-brand-card mt-8 pt-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <p className="text-xs text-brand-muted text-center md:text-left shrink-0">
              © {currentYear} {SITE.name}. All rights reserved.
            </p>
            <DatabaseStatusBadge />
          </div>
          <p className="text-brand-muted text-xs text-center md:text-right leading-relaxed max-w-2xl">
            TradeWise is an educational simulation platform. All content is for learning purposes only and does not constitute financial advice. Paper trading results do not reflect real market outcomes. Please consult a SEBI registered financial advisor before making any real investment decisions.
          </p>
        </div>
      </div>
    </footer>
  );
};
