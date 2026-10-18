import React from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { InfoPageLayout } from './InfoPageLayout';

export const DisclaimerPage: React.FC = () => {
  return (
    <InfoPageLayout title="Disclaimer" showLastUpdated={true}>
      {/* Risk Notice Callout */}
      <div className="p-5 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2">
        <div className="flex items-center gap-2.5 text-amber-400 font-bold text-sm">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>Statutory Risk Warning</span>
        </div>
        <p className="text-sm font-semibold text-brand-light leading-relaxed">
          Investments in securities market are subject to market risks. Read all the related documents carefully before investing.
        </p>
      </div>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-brand-light mt-4 mb-2">1. Educational Simulation Platform</h2>
        <p className="text-sm text-brand-muted leading-relaxed">
          TradeWise is strictly a simulated academic environment created to teach financial literacy, investing concepts, and market order dynamics. No actual capital is ever deposited, traded, or withdrawn. All trading accounts and stock portfolios are purely fictitious simulations created with virtual currency tokens.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-brand-light mt-8 mb-2">2. Not SEBI Registered</h2>
        <p className="text-sm text-brand-muted leading-relaxed">
          TradeWise, its creators, authors, developers, and affiliated educational institutions are <strong className="text-brand-light">not registered</strong> with the Securities and Exchange Board of India (SEBI) as Investment Advisers, Research Analysts, Portfolio Managers, or Brokers under any SEBI regulations.
        </p>
        <p className="text-sm text-brand-muted leading-relaxed">
          The content on this website does not constitute financial, legal, tax, or investment advice. Nothing published here should be considered a recommendation, tip, or solicitation to purchase, hold, or sell any security, derivative contract, or financial asset.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-brand-light mt-8 mb-2">3. Hypothetical Performance Limitations</h2>
        <p className="text-sm text-brand-muted leading-relaxed">
          Past performance, simulated returns, and virtual portfolio gains calculated in TradeWise paper trading do not reflect real-world market outcomes. Virtual paper trading does not account for critical live-market factors including slippage, liquidity constraints, exchange transaction charges, securities transaction tax (STT), brokerage fees, or psychological pressures inherent in real capital allocation.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-brand-light mt-8 mb-2">4. Third-Party Market Data Delays</h2>
        <p className="text-sm text-brand-muted leading-relaxed">
          Market prices, order book quotes, and charts presented on TradeWise are obtained from third-party public endpoints and may be delayed by approximately 15 minutes or more. TradeWise cannot warrant the completeness, accuracy, timeliness, or sequencing of any price feeds. You should not use TradeWise price displays to make real trading decisions.
        </p>
      </section>

      <section className="space-y-3 pt-2">
        <div className="p-5 bg-brand-dark rounded-xl border border-white/5 space-y-2">
          <div className="flex items-center gap-2 text-brand-light text-sm font-bold">
            <ShieldAlert className="w-4 h-4 text-brand-orange" />
            <span>Consult a Professional</span>
          </div>
          <p className="text-xs text-brand-muted leading-relaxed">
            Before investing actual money in Indian stock exchanges or mutual funds, please consult a qualified, SEBI-registered financial advisor to assess your individual risk tolerance, investment horizon, and financial objectives.
          </p>
        </div>
      </section>

      <div className="pt-6 border-t border-brand-dark">
        <p className="text-xs text-brand-muted/70 italic">
          This document is a general template for an educational project and is not legal advice.
        </p>
      </div>
    </InfoPageLayout>
  );
};
