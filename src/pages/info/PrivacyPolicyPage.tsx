import React from 'react';
import { SITE } from '../../config/site';
import { InfoPageLayout } from './InfoPageLayout';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <InfoPageLayout title="Privacy Policy" showLastUpdated={true}>
      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-brand-light mt-4 mb-2">1. Overview</h2>
        <p className="text-sm text-brand-muted leading-relaxed">
          TradeWise is committed to transparency and respecting your digital privacy. This policy explains what information is collected, where it resides, and how it is handled while you use TradeWise.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-brand-light mt-8 mb-2">2. Information We Store</h2>
        <p className="text-sm text-brand-muted leading-relaxed">
          TradeWise operates as a client-side application. The following information is stored directly on your device:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-sm text-brand-muted">
          <li>Profile details you provide (display name, username handle, biography, educational institution, city, social links, and optional custom avatar photo/color).</li>
          <li>Learning progress, completed concept IDs, and quiz scores.</li>
          <li>Gamification data including earned experience points (XP), calculated level, active daily check-in streaks, daily quest status, and unlocked achievement badges.</li>
          <li>Simulated trading logs, open limit orders, virtual cash balance, and paper portfolio holdings.</li>
          <li>Local calendar activity history keys used to generate the activity heatmap.</li>
        </ul>
        <p className="text-sm text-brand-muted leading-relaxed mt-2">
          <strong className="text-brand-light">Local Storage Only:</strong> All this information is stored exclusively in your browser’s <code className="text-brand-light bg-brand-dark px-1.5 py-0.5 rounded text-xs font-mono">localStorage</code> on your physical device. TradeWise currently maintains no remote user accounts, authentication servers, or cloud user databases.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-brand-light mt-8 mb-2">3. Market Data Requests</h2>
        <p className="text-sm text-brand-muted leading-relaxed">
          To provide real-time indicative pricing and chart data for Indian equities (NSE), TradeWise fetches public financial data from third-party data endpoints (Yahoo Finance). These network requests transmit only stock market symbols and query intervals (e.g., RELIANCE.NS, TATAMOTORS.NS). They do not transmit your name, profile details, or personal portfolio.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-brand-light mt-8 mb-2">4. Data Sharing & Third Parties</h2>
        <p className="text-sm text-brand-muted leading-relaxed">
          We do not sell, rent, monetize, or transmit your personal information to third parties.
        </p>
        <p className="text-sm text-brand-muted leading-relaxed">
          Badge image generation and sharing occurs entirely within your browser via HTML canvas rasterization. When you use the "Share Badge" feature, your badge card image is passed solely to your device’s native system share sheet or opened directly in a new tab to the social platform you actively select (such as WhatsApp, LinkedIn, or X).
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-brand-light mt-8 mb-2">5. Cookies and Analytics</h2>
        <p className="text-sm text-brand-muted leading-relaxed">
          TradeWise does not deploy tracking cookies, advertising beacons, or third-party behavioral analytics scripts. All session states are maintained locally via modern HTML5 web storage.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-brand-light mt-8 mb-2">6. Your Rights and Data Control</h2>
        <p className="text-sm text-brand-muted leading-relaxed">
          Because your data resides on your own browser, you maintain total ownership and control:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-sm text-brand-muted">
          <li>You may view and edit your profile details at any time using the "Edit Profile" dialog on the Profile page.</li>
          <li>You can permanently erase all learning progress, quiz scores, simulator trades, and saved profile data by clicking "Reset All Progress" at the bottom of the Profile page.</li>
          <li>Clearing your web browser’s cookies and site data for TradeWise immediately deletes all stored information from your device.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-brand-light mt-8 mb-2">7. Children’s Privacy</h2>
        <p className="text-sm text-brand-muted leading-relaxed">
          TradeWise is intended for users aged 18 and older seeking financial literacy. Younger users should access and use the platform under the supervision of a parent, educator, or legal guardian.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-brand-light mt-8 mb-2">8. Legal Basis (India DPDP Act 2023)</h2>
        <p className="text-sm text-brand-muted leading-relaxed">
          This Privacy Policy is designed in accordance with the principles of data minimization and purpose limitation under India's Digital Personal Data Protection Act, 2023 (DPDP Act). Since personal data is neither processed on external servers nor collected by TradeWise administrators, the privacy of your learning journey is fundamentally protected by architecture.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-brand-light mt-8 mb-2">9. Changes and Contact</h2>
        <p className="text-sm text-brand-muted leading-relaxed">
          We may update this policy occasionally as new educational features are developed. Any revisions will be reflected here with an updated revision date.
        </p>
        <p className="text-sm text-brand-muted leading-relaxed">
          For any questions concerning this Privacy Policy, please contact our team at{' '}
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
