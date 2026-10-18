import React from 'react';
import { SITE } from '../../config/site';
import { InfoPageLayout } from './InfoPageLayout';

export const TermsPage: React.FC = () => {
  return (
    <InfoPageLayout title="Terms & Conditions" showLastUpdated={true}>
      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-brand-light mt-4 mb-2">1. Acceptance of Terms</h2>
        <p className="text-sm text-brand-muted leading-relaxed">
          By accessing or using the TradeWise web application ("Service"), you agree to be bound by these Terms & Conditions. If you do not agree with any portion of these terms, please discontinue use of the platform immediately.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-brand-light mt-8 mb-2">2. Educational Purpose Only</h2>
        <p className="text-sm text-brand-muted leading-relaxed">
          TradeWise is strictly an academic, gamified financial literacy learning tool. All interactive roadmaps, quizzes, stock simulators, and gamified challenges are built solely to explain stock market mechanics, equity fundamentals, and portfolio concepts.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-brand-light mt-8 mb-2">3. Virtual Money & Paper Trading</h2>
        <p className="text-sm text-brand-muted leading-relaxed">
          All currency denominations displayed across the platform—including the initial ₹1,00,000 cash balance, order values, and portfolio equity—represent simulated, virtual tokens. Under no circumstances can virtual balances be withdrawn, exchanged, transferred, or converted into real legal tender or monetary value. No real monetary transactions or actual securities orders are ever placed with any broker or exchange.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-brand-light mt-8 mb-2">4. Not Financial or Investment Advice</h2>
        <p className="text-sm text-brand-muted leading-relaxed">
          TradeWise and its creators are not registered with the Securities and Exchange Board of India (SEBI) as Investment Advisers (RIA) or Research Analysts (RA). None of the educational content, module texts, quiz explanations, or algorithmic portfolio statistics constitute financial advice, investment recommendations, endorsements, or solicitations to buy or sell real securities.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-brand-light mt-8 mb-2">5. Market Data Accuracy and Delays</h2>
        <p className="text-sm text-brand-muted leading-relaxed">
          Stock quotations and historical charts are fetched from public third-party endpoints on an "as-is" and "as-available" basis. Market prices may be delayed (typically ~15 minutes or more), incomplete, simulated, or subject to upstream service interruptions. You must never rely on TradeWise prices for actual live securities trading.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-brand-light mt-8 mb-2">6. Acceptable Use</h2>
        <p className="text-sm text-brand-muted leading-relaxed">
          You agree to use TradeWise solely for lawful personal educational activities. You shall not attempt to reverse engineer, disrupt network calls, abuse public data endpoints, scrape excessive requests, or interfere with other users’ browser experiences.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-brand-light mt-8 mb-2">7. Intellectual Property</h2>
        <p className="text-sm text-brand-muted leading-relaxed">
          All original interface designs, custom visual aids, curriculum modules, software code, and graphics are the intellectual property of the TradeWise project team and its institutional creators. Third-party brand names or ticker symbols (e.g., NSE, Reliance, Tata) remain the property of their respective trademark holders.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-brand-light mt-8 mb-2">8. Limitation of Liability</h2>
        <p className="text-sm text-brand-muted leading-relaxed">
          In no event shall the TradeWise project team, contributors, or affiliated institution be held liable for any direct, indirect, consequential, or punitive damages—including financial losses in real-world trading—arising out of the use of or inability to use this platform.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-brand-light mt-8 mb-2">9. Modifications to Terms</h2>
        <p className="text-sm text-brand-muted leading-relaxed">
          We reserve the right to revise these Terms & Conditions as the project evolves. Continuous use of TradeWise following any revisions implies full acceptance of the updated terms.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-brand-light mt-8 mb-2">10. Governing Law & Jurisdiction</h2>
        <p className="text-sm text-brand-muted leading-relaxed">
          These Terms shall be governed by and construed in accordance with the laws of the Republic of India. Any legal disputes arising in connection with the project shall be subject to the exclusive jurisdiction of the competent courts in Mumbai, Maharashtra, India.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-brand-light mt-8 mb-2">11. Contact Information</h2>
        <p className="text-sm text-brand-muted leading-relaxed">
          For inquiries or notices related to these Terms & Conditions, please contact us at{' '}
          <a href={`mailto:${SITE.contactEmail}`} className="text-brand-orange hover:underline">
            {SITE.contactEmail}
          </a>.
        </p>
      </section>

      <div className="pt-6 border-t border-brand-dark">
        <p className="text-xs text-brand-muted/70 italic">
          This document is a general template for an educational project and is not legal advice.
        </p>
      </div>
    </InfoPageLayout>
  );
};
