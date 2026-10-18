import React, { useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  CandlestickChart,
  Trophy,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  PieChart,
  ListPlus,
  BarChart3,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Lock,
  Layers,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export interface LandingPageProps {
  onStart: () => void;
  onOpenAuth: () => void;
  onNavigate: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, onOpenAuth, onNavigate }) => {
  const { formatMoney, isLoggedIn, startGoogleOAuthRedirect } = useApp();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(prev => (prev === index ? null : index));
  };

  const handleGoogleCTA = async () => {
    if (isLoggedIn) {
      onStart();
    } else {
      const redirected = await startGoogleOAuthRedirect('dashboard');
      if (!redirected) {
        onOpenAuth();
      }
    }
  };


  const scrollToFeatures = () => {
    const el = document.getElementById('features-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const operationalFeatures = [
    {
      id: 'market-insights',
      title: 'Market Insights',
      badge: 'Live NSE & BSE Quotes',
      description: 'Explore leading Indian instruments (Reliance, TCS, HDFC Bank, Infosys) with interactive candlestick and line charts across 1D, 1W, 1M, 3M, and 1Y timeframes.',
      disclosure: 'NSE / BSE quotes reflect delayed market data (~15m delay). For simulation only.',
      icon: TrendingUp,
      color: 'from-amber-500/20 to-orange-500/20',
      border: 'border-orange-500/30',
      iconColor: 'text-brand-orange'
    },
    {
      id: 'paper-trading',
      title: 'Paper Trading Terminal',
      badge: 'Zero Risk Virtual Orders',
      description: 'Simulate Market & Limit buy/sell executions with real-time slippage (5 bps) and fee friction (0.03%). Experience execution psychology without putting a single rupee at risk.',
      disclosure: 'Orders are executed in an internal simulation engine and never sent to real exchanges.',
      icon: CandlestickChart,
      color: 'from-emerald-500/20 to-teal-500/20',
      border: 'border-emerald-500/30',
      iconColor: 'text-emerald-400'
    },
    {
      id: 'portfolio-tracking',
      title: 'Portfolio Tracking',
      badge: 'Live Equity & P&L',
      description: 'Monitor your total portfolio valuation, weighted average cost basis, unrealized capital gains, daily P&L, and available cash balance in real time.',
      disclosure: 'Calculations update dynamically based on live virtual position marks.',
      icon: PieChart,
      color: 'from-blue-500/20 to-indigo-500/20',
      border: 'border-blue-500/30',
      iconColor: 'text-blue-400'
    },
    {
      id: 'portfolio-learning',
      title: 'Portfolio Learning Path',
      badge: '13 Visual Modules',
      description: 'Master the financial universe step-by-step: Stocks, Compounding, SIP Calculators, Order Types, Candlesticks, Fundamental Analysis, and Behavioral Risk.',
      disclosure: 'Designed with interactive calculators and visual diagrammatic aids.',
      icon: BookOpen,
      color: 'from-purple-500/20 to-violet-500/20',
      border: 'border-purple-500/30',
      iconColor: 'text-purple-400'
    },
    {
      id: 'risk-analysis',
      title: 'Risk Analysis & Health Score',
      badge: 'Concentration Metrics',
      description: 'Evaluate individual asset weighting, sector concentration risks, and portfolio diversification metrics to prevent overexposure to single-stock volatility.',
      disclosure: 'Calculated using holdings weights relative to total account equity.',
      icon: ShieldCheck,
      color: 'from-cyan-500/20 to-blue-500/20',
      border: 'border-cyan-500/30',
      iconColor: 'text-cyan-400'
    },
    {
      id: 'watchlists',
      title: 'Custom Watchlists',
      badge: 'Real-time Organization',
      description: 'Curate your favorite equities, add new symbols on the fly, track day-over-day price movements, and jump straight into simulated order placement.',
      disclosure: 'Supports dynamic symbol addition with automatic price history fetching.',
      icon: ListPlus,
      color: 'from-rose-500/20 to-pink-500/20',
      border: 'border-rose-500/30',
      iconColor: 'text-rose-400'
    },
    {
      id: 'performance-analytics',
      title: 'Performance Analytics',
      badge: 'Trade Audit Logs',
      description: 'Inspect complete order execution histories, fill timestamps, slippage records, and trade summaries stored persistently in PostgreSQL.',
      disclosure: 'All transactions are linked securely to your authenticated user account.',
      icon: BarChart3,
      color: 'from-yellow-500/20 to-amber-500/20',
      border: 'border-yellow-500/30',
      iconColor: 'text-amber-400'
    }
  ];

  const faqs = [
    {
      q: 'Is TradeWise completely free, and is any real money involved?',
      a: 'TradeWise is 100% free for educational use. Every registered learner is provided with ₹1,00,000 in virtual simulation money. You never deposit, transfer, or risk real money at any point.'
    },
    {
      q: 'What market data sources power the paper trading terminal?',
      a: 'Quotes and historical price movements are retrieved from public market APIs (including NSE-listed Indian equities). Data is delayed by approximately 15 minutes and is intended strictly for educational simulation, strategy testing, and learning.'
    },
    {
      q: 'How does Google Sign-In work, and is my data secure?',
      a: 'We use genuine Google OAuth 2.0 / OpenID Connect. Your identity is verified using Google\'s trusted cryptographic tokens, and your virtual portfolio, study streaks, and quiz badges are stored securely in a dedicated PostgreSQL database linked to your verified identity.'
    },
    {
      q: 'Will my virtual portfolio survive browser refreshes or device changes?',
      a: 'Yes. Once signed in with Google, an authenticated session is established. Your holdings, orders, XP, daily quests, and learning milestones are persisted in the cloud database and synced seamlessly across sessions.'
    },
    {
      q: 'Can I reset my virtual capital if my trades go poorly?',
      a: 'Absolutely. A learner can reset their simulated portfolio balance back to the starting ₹1,00,000 at any time from their profile settings to test new risk management strategies.'
    },
    {
      q: 'Is TradeWise a registered broker or investment advisor?',
      a: 'No. TradeWise is purely a financial literacy and educational technology platform. It is not affiliated with SEBI, FINRA, or any stock exchange, and does not provide financial or investment advice.'
    }
  ];

  return (
    <div className="w-full min-h-screen bg-[#0B0F17] text-slate-100 selection:bg-brand-orange selection:text-brand-black">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-brand-orange/10 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[110px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-brand-orange text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-brand-orange" />
            <span>Interactive Financial Education Platform</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            TradeWise — Learn the Markets.{' '}
            <span className="block mt-2 bg-gradient-to-r from-brand-orange via-amber-400 to-emerald-400 bg-clip-text text-transparent">
              Build Your Strategy.
            </span>
          </h1>

          {/* Supporting Description */}
          <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
            Explore market information, practise portfolio building with virtual money, understand investment risk, and learn through an interactive financial education platform.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={handleGoogleCTA}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-base shadow-xl shadow-white/10 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer group"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{isLoggedIn ? 'Launch Dashboard' : 'Continue with Google'}</span>
              <ArrowRight className="w-4 h-4 text-slate-600 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={scrollToFeatures}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-slate-200 font-semibold text-base hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Explore Features</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* Trust & Spec Highlights */}
          <div className="pt-10 flex flex-wrap justify-center gap-6 text-slate-400 text-xs font-medium">
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{formatMoney(100000)} Virtual Starting Cash</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <span>13 Interactive Learning Modules</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
              <span>Realistic Market Slippage & Fees</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
              <CheckCircle2 className="w-4 h-4 text-purple-400" />
              <span>Cloud PostgreSQL Session Sync</span>
            </div>
          </div>
        </div>
      </section>

      {/* Terminal UI Preview Card */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto -mt-6 mb-24 relative z-20">
        <div className="rounded-2xl border border-white/10 bg-[#111622]/90 backdrop-blur-xl p-4 sm:p-6 shadow-2xl overflow-hidden relative">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="font-mono text-slate-300 ml-2 font-semibold">TradeWise Simulation Terminal v3.2</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[11px] font-bold">
                Virtual Balance: ₹1,00,000.00
              </span>
              <span className="hidden sm:inline px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono text-[11px]">
                Feed: NSE Delayed ~15m
              </span>
            </div>
          </div>

          {/* Terminal Mock Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-4">
            {/* Chart Column */}
            <div className="lg:col-span-2 space-y-3 bg-[#0B0F17]/80 rounded-xl p-4 border border-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    RELIANCE INDUSTRIES <span className="text-[11px] font-mono text-slate-400">RELIANCE.NS</span>
                  </div>
                  <div className="text-xl font-extrabold text-emerald-400 font-mono mt-0.5">
                    ₹2,984.45 <span className="text-xs font-semibold text-emerald-400">(+1.85%)</span>
                  </div>
                </div>
                <div className="flex gap-1 bg-white/5 p-1 rounded-lg text-[11px] font-semibold text-slate-300">
                  <span className="px-2 py-0.5 bg-brand-orange text-brand-black rounded font-bold">1D</span>
                  <span className="px-2 py-0.5 hover:text-white cursor-pointer">1W</span>
                  <span className="px-2 py-0.5 hover:text-white cursor-pointer">1M</span>
                  <span className="px-2 py-0.5 hover:text-white cursor-pointer">1Y</span>
                </div>
              </div>

              {/* Decorative Chart SVG Wave */}
              <div className="h-44 w-full flex items-end pt-4 pb-2">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 500 120" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,80 Q50,90 100,60 T200,65 T300,40 T400,25 T500,10 L500,120 L0,120 Z"
                    fill="url(#chartGradient)"
                  />
                  <path
                    d="M0,80 Q50,90 100,60 T200,65 T300,40 T400,25 T500,10"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                  />
                </svg>
              </div>

              <div className="flex justify-between text-[11px] text-slate-400 font-mono pt-1 border-t border-white/5">
                <span>09:15 AM</span>
                <span>11:30 AM</span>
                <span>01:45 PM</span>
                <span>03:30 PM (Close)</span>
              </div>
            </div>

            {/* Quick Order Panel Preview */}
            <div className="bg-[#0B0F17]/80 rounded-xl p-4 border border-white/5 flex flex-col justify-between space-y-3">
              <div>
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Simulated Order Pad</div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button className="py-2 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-xs border border-emerald-500/40">
                    BUY
                  </button>
                  <button className="py-2 rounded-lg bg-white/5 text-slate-400 font-bold text-xs hover:bg-white/10">
                    SELL
                  </button>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-white/5 text-slate-300">
                    <span className="text-slate-400">Order Type</span>
                    <span className="font-semibold text-white">MARKET</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5 text-slate-300">
                    <span className="text-slate-400">Simulated Quantity</span>
                    <span className="font-mono font-bold text-white">10 Shares</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5 text-slate-300">
                    <span className="text-slate-400">Est. Total Cost</span>
                    <span className="font-mono font-bold text-brand-orange">₹29,844.50</span>
                  </div>
                </div>
              </div>

              <button
                onClick={onStart}
                className="w-full py-2.5 rounded-lg bg-brand-orange text-brand-black font-extrabold text-xs shadow-lg shadow-brand-orange/20 hover:scale-[1.01] transition-all cursor-pointer"
              >
                Execute in Simulator
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* The 3-Step Mastery Loop (How It Works) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0D121C] border-y border-white/5">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <div className="text-xs font-bold text-brand-orange uppercase tracking-wider">Educational Architecture</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">The 3-Step Mastery Loop</h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
              How TradeWise transforms financial novices into disciplined, data-driven market participants.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-[#111622] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4 hover:border-brand-orange/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-brand-orange/10 border border-brand-orange/30 flex items-center justify-center text-brand-orange group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-brand-orange uppercase tracking-wider block">Step 1: Conceptual Study</span>
              <h3 className="text-lg font-bold text-white">Interactive Modules</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Short, bite-sized lessons with visual compound interest curves, SIP growth projections, and candlestick diagrams. Zero walls of dry textbook theory.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#111622] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4 hover:border-emerald-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <CandlestickChart className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">Step 2: Paper Execution</span>
              <h3 className="text-lg font-bold text-white">Realistic Trading Simulator</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Apply concepts using ₹1,00,000 virtual capital. Execute market and limit orders with realistic slippage and transaction costs without risking actual money.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#111622] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4 hover:border-purple-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                <Trophy className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider block">Step 3: Gamified Mastery</span>
              <h3 className="text-lg font-bold text-white">Quizzes, XP & Streaks</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Reinforce retention with chapter quizzes. Earn experience points (XP), maintain daily study streaks, unlock achievement badges, and climb student leaderboards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Overview: 7 Genuine Operational Features */}
      <section id="features-section" className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-16">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-slate-300">
            <Layers className="w-3.5 h-3.5 text-brand-orange" />
            <span>Operational Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Built for Genuine Financial Comprehension
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
            Every feature below is implemented and active in the TradeWise engine. No marketing placeholders.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {operationalFeatures.map(feat => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                className="bg-[#111622] border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-white/20 transition-all hover:shadow-xl hover:-translate-y-1 group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${feat.color} border ${feat.border} flex items-center justify-center ${feat.iconColor}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-slate-300">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-brand-orange transition-colors">
                    {feat.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-white/5 flex items-start gap-1.5 text-[11px] text-slate-500">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-slate-500 mt-0.5" />
                  <span>{feat.disclosure}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0D121C] border-t border-white/5">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 text-xs text-brand-orange font-semibold">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Questions & Transparency</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white">Frequently Asked Questions</h2>
            <p className="text-slate-400 text-sm">Clear answers regarding simulation, virtual funds, and authentication.</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-[#111622] border border-white/10 rounded-xl overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between text-sm sm:text-base font-semibold text-white hover:text-brand-orange transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-brand-orange shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-4 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-white/5 pt-3 animate-fade-in">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Financial Education Disclaimer Banner */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex flex-col sm:flex-row items-start gap-4">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-xs text-slate-400 leading-relaxed">
            <span className="font-bold text-amber-300 block text-sm">Educational Platform & Data Disclosure</span>
            <p>
              TradeWise is an educational simulation platform developed to impart foundational financial literacy. It is not a brokerage firm, financial advisor, or SEBI/FINRA-regulated entity. Virtual cash and simulated balances have no real cash value and cannot be withdrawn or converted to fiat currency. Market price quotes are subject to exchange delays (~15 minutes). No real trading execution takes place.
            </p>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Ready to Build Your Strategy?
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
            Join students and early career professionals mastering the market with zero financial risk.
          </p>
          <div className="pt-2">
            <button
              onClick={handleGoogleCTA}
              className="px-8 py-4 rounded-xl bg-brand-orange hover:bg-amber-400 text-brand-black font-extrabold text-base shadow-xl shadow-brand-orange/20 hover:scale-[1.02] active:scale-[0.98] transition-all inline-flex items-center gap-3 cursor-pointer"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{isLoggedIn ? 'Launch TradeWise Dashboard' : 'Continue with Google'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer Navigation */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-white/5 bg-[#080B11] text-xs text-slate-400">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-orange/10 border border-brand-orange/30 flex items-center justify-center text-brand-orange font-bold">
              <CandlestickChart className="w-4 h-4" />
            </div>
            <span className="text-white font-extrabold text-sm tracking-tight">TradeWise</span>
            <span className="text-slate-600">|</span>
            <span>Virtual Market Education</span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors cursor-pointer">
              About
            </button>
            <button onClick={() => onNavigate('contact')} className="hover:text-white transition-colors cursor-pointer">
              Contact
            </button>
            <button onClick={() => onNavigate('privacy')} className="hover:text-white transition-colors cursor-pointer">
              Privacy Policy (Draft)
            </button>
            <button onClick={() => onNavigate('terms')} className="hover:text-white transition-colors cursor-pointer">
              Terms of Service (Draft)
            </button>
            <button onClick={() => onNavigate('disclaimer')} className="hover:text-white transition-colors cursor-pointer">
              Legal Disclaimer
            </button>
          </div>

          <p className="text-slate-500 text-[11px]">
            © {new Date().getFullYear()} TradeWise. Simulated Paper Trading & Learning.
          </p>
        </div>
      </footer>
    </div>
  );
};
