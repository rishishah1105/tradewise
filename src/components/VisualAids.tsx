import React, { useState } from 'react';
import { TrendingUp, PieChart, ShieldAlert, DollarSign, BarChart2, Layers, Sliders, Info, CheckCircle2, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const VisualAidRenderer: React.FC<{ type: string }> = ({ type }) => {
  const { formatMoney } = useApp();

  switch (type) {
    case 'compounding-calculator':
      return <CompoundingCalculatorAid formatMoney={formatMoney} />;
    case 'sip-growth':
      return <SipGrowthAid formatMoney={formatMoney} />;
    case 'diversification-pie':
      return <DiversificationAid />;
    case 'risk-return-scatter':
      return <RiskReturnAid />;
    case 'candlestick-interactive':
      return <CandlestickAid />;
    case 'order-book-visualizer':
      return <OrderBookAid formatMoney={formatMoney} />;
    case 'bid-ask-margin':
      return <BidAskAid formatMoney={formatMoney} />;
    case 'pe-ratio-comparator':
      return <PeRatioAid formatMoney={formatMoney} />;
    case 'etf-breakdown':
      return <EtfBreakdownAid />;
    case 'stock-equity-visual':
      return <StockEquityAid formatMoney={formatMoney} />;
    case 'bond-yield-timeline':
      return <BondYieldAid formatMoney={formatMoney} />;
    case 'portfolio-allocation-slider':
      return <PortfolioAllocationAid />;
    case 'dca-simulator':
      return <DcaSimulatorAid formatMoney={formatMoney} />;
    default:
      return (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl text-center text-slate-400">
          Interactive diagram loading...
        </div>
      );
  }
};

// 1. COMPOUNDING CALCULATOR
const CompoundingCalculatorAid: React.FC<{ formatMoney: (n: number) => string }> = ({ formatMoney }) => {
  const [principal, setPrincipal] = useState(1000);
  const [rate, setRate] = useState(8);
  const [years, setYears] = useState(25);

  const calculateGrowth = () => {
    let compoundTotal = principal;
    const compoundData = [];
    let simpleTotal = principal;

    for (let yr = 0; yr <= years; yr++) {
      if (yr === 0) {
        compoundData.push({ year: 0, compound: principal, simple: principal });
      } else {
        compoundTotal = compoundTotal * (1 + rate / 100);
        simpleTotal += principal * (rate / 100);
        compoundData.push({
          year: yr,
          compound: Math.round(compoundTotal),
          simple: Math.round(simpleTotal)
        });
      }
    }
    return compoundData;
  };

  const data = calculateGrowth();
  const finalCompound = data[data.length - 1].compound;
  const finalSimple = data[data.length - 1].simple;
  const compoundMultiplier = (finalCompound / principal).toFixed(1);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
        <h4 className="font-semibold text-slate-100 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-brand-500" /> Interactive Compounding Growth Curve
        </h4>
        <span className="text-xs bg-brand-500/20 text-brand-400 px-2.5 py-1 rounded-full font-semibold border border-brand-500/30">
          {compoundMultiplier}x Principal Growth
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Starting Principal: {formatMoney(principal)}</label>
          <input
            type="range"
            min="100"
            max="10000"
            step="100"
            value={principal}
            onChange={e => setPrincipal(Number(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Annual Return Rate: {rate}%</label>
          <input
            type="range"
            min="3"
            max="15"
            step="0.5"
            value={rate}
            onChange={e => setRate(Number(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Time Horizon: {years} Years</label>
          <input
            type="range"
            min="5"
            max="40"
            step="1"
            value={years}
            onChange={e => setYears(Number(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Visual Bars Comparison */}
      <div className="h-44 flex items-end justify-between gap-1 border-b border-slate-700 pb-2 px-2">
        {data.filter((_, idx) => idx % Math.ceil(years / 8) === 0 || idx === years).map((d) => {
          const maxVal = finalCompound;
          const compoundHeight = Math.max(10, (d.compound / maxVal) * 100);
          const simpleHeight = Math.max(8, (d.simple / maxVal) * 100);

          return (
            <div key={d.year} className="flex-1 flex flex-col items-center gap-1 group relative">
              {/* Tooltip */}
              <div className="absolute -top-12 hidden group-hover:flex flex-col items-center bg-slate-800 text-xs text-white p-1.5 rounded border border-slate-700 whitespace-nowrap z-20 shadow-lg">
                <span>Yr {d.year}: {formatMoney(d.compound)}</span>
                <span className="text-slate-400 text-[10px]">Simple: {formatMoney(d.simple)}</span>
              </div>
              <div className="w-full flex items-end justify-center gap-1 h-32">
                <div
                  style={{ height: `${simpleHeight}%` }}
                  className="w-1.5 bg-slate-600 rounded-t transition-all duration-300"
                />
                <div
                  style={{ height: `${compoundHeight}%` }}
                  className="w-3 bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t transition-all duration-300 shadow-md shadow-indigo-500/20"
                />
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Yr {d.year}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-300 pt-2 bg-slate-800/50 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-indigo-500"></span>
            <span>Compound Total: <strong className="text-indigo-400">{formatMoney(finalCompound)}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-600"></span>
            <span>Simple Total: <strong className="text-slate-400">{formatMoney(finalSimple)}</strong></span>
          </div>
        </div>
        <span className="text-emerald-400 font-semibold">+{(finalCompound - finalSimple > 0 ? formatMoney(finalCompound - finalSimple) : '$0')} Compounding Magic</span>
      </div>
    </div>
  );
};

// 2. SIP GROWTH AID
const SipGrowthAid: React.FC<{ formatMoney: (n: number) => string }> = ({ formatMoney }) => {
  const [monthly, setMonthly] = useState(100);
  const [years, setYears] = useState(20);
  const [rate, setRate] = useState(10);

  const months = years * 12;
  const monthlyRate = rate / 100 / 12;
  let totalInvested = monthly * months;
  let totalValue = 0;

  for (let i = 1; i <= months; i++) {
    totalValue = (totalValue + monthly) * (1 + monthlyRate);
  }
  const wealthGained = Math.max(0, totalValue - totalInvested);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <h4 className="font-semibold text-slate-100 flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
        <DollarSign className="w-5 h-5 text-emerald-400" /> SIP Growth Calculator
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Monthly SIP: {formatMoney(monthly)}</label>
          <input
            type="range"
            min="25"
            max="1000"
            step="25"
            value={monthly}
            onChange={e => setMonthly(Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Years: {years} Years</label>
          <input
            type="range"
            min="3"
            max="30"
            step="1"
            value={years}
            onChange={e => setYears(Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Expected Return: {rate}%</label>
          <input
            type="range"
            min="5"
            max="15"
            step="0.5"
            value={rate}
            onChange={e => setRate(Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6 bg-slate-800/40 p-4 rounded-xl border border-slate-800">
        <div className="w-full sm:w-1/2 flex flex-col gap-3">
          <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
            <span className="text-slate-400">Total Invested (Out of pocket):</span>
            <strong className="text-slate-200">{formatMoney(Math.round(totalInvested))}</strong>
          </div>
          <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
            <span className="text-slate-400">Wealth Gained (Compound Return):</span>
            <strong className="text-emerald-400">+{formatMoney(Math.round(wealthGained))}</strong>
          </div>
          <div className="flex justify-between items-center text-base pt-1">
            <span className="font-semibold text-slate-200">Total Portfolio Value:</span>
            <strong className="text-indigo-400 font-bold font-mono text-lg">{formatMoney(Math.round(totalValue))}</strong>
          </div>
        </div>

        {/* Visual Stacked Progress Bar */}
        <div className="w-full sm:w-1/2 flex flex-col gap-2">
          <div className="text-xs text-slate-400 flex justify-between">
            <span>Invested ({Math.round((totalInvested / totalValue) * 100)}%)</span>
            <span>Returns ({Math.round((wealthGained / totalValue) * 100)}%)</span>
          </div>
          <div className="h-6 w-full bg-slate-800 rounded-lg overflow-hidden flex shadow-inner">
            <div
              style={{ width: `${(totalInvested / totalValue) * 100}%` }}
              className="bg-slate-600 transition-all duration-300"
            />
            <div
              style={{ width: `${(wealthGained / totalValue) * 100}%` }}
              className="bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// 3. DIVERSIFICATION AID
const DiversificationAid: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<'single' | 'diversified'>('diversified');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
        <h4 className="font-semibold text-slate-100 flex items-center gap-2">
          <PieChart className="w-5 h-5 text-indigo-400" /> Asset Allocation & Risk Reducer
        </h4>
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedScenario('single')}
            className={`px-3 py-1 text-xs rounded-lg font-semibold transition-all ${
              selectedScenario === 'single' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-slate-800 text-slate-400'
            }`}
          >
            Single Stock (High Risk)
          </button>
          <button
            onClick={() => setSelectedScenario('diversified')}
            className={`px-3 py-1 text-xs rounded-lg font-semibold transition-all ${
              selectedScenario === 'diversified' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
            }`}
          >
            Diversified Portfolio
          </button>
        </div>
      </div>

      {selectedScenario === 'single' ? (
        <div className="p-4 bg-rose-950/20 border border-rose-900/40 rounded-xl flex flex-col md:flex-row items-center gap-6">
          <div className="w-32 h-32 rounded-full border-4 border-rose-500 flex items-center justify-center bg-rose-500/10 text-rose-400 font-bold text-center p-2 text-xs">
            100% Tech Stock (1 Company)
          </div>
          <div className="flex-1 space-y-2 text-xs text-slate-300">
            <div className="flex justify-between font-semibold text-rose-400">
              <span>Risk Volatility Meter: EXTREME</span>
              <span>100% Unsystematic Risk</span>
            </div>
            <p className="text-slate-400">
              If this single company experiences a product recall, lawsuit, or missed earnings call, your entire portfolio can drop 40% overnight.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-slate-800/40 border border-slate-800 rounded-xl space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-medium">
            <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
              <span className="block font-bold text-sm">40% US Tech</span>
              <span>AAPL, MSFT, NVDA</span>
            </div>
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
              <span className="block font-bold text-sm">30% Index ETF</span>
              <span>S&P 500 (SPY)</span>
            </div>
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300">
              <span className="block font-bold text-sm">20% Bonds</span>
              <span>US Treasury Funds</span>
            </div>
            <div className="p-3 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-300">
              <span className="block font-bold text-sm">10% Commodities</span>
              <span>Gold ETF (GLD)</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-emerald-400 bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-900/40 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Company-Specific Risk Eliminated!
            </span>
            <span>Smooth, resilient long-term compounding</span>
          </div>
        </div>
      )}
    </div>
  );
};

// 4. RISK RETURN SCATTER AID
const RiskReturnAid: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<string>('Index Funds');

  const nodes = [
    { name: 'Savings Account', risk: 5, returnVal: 3, desc: 'Ultra safe, but barely keeps up with inflation.' },
    { name: 'Government Bonds', risk: 20, returnVal: 5, desc: 'Backed by government credit; predictable coupon interest.' },
    { name: 'Index Funds (S&P 500)', risk: 45, returnVal: 10, desc: 'Broad market coverage; optimal risk-adjusted historical return.' },
    { name: 'Bluechip Stocks', risk: 65, returnVal: 14, desc: 'Established giants like Apple/Microsoft; moderate growth & dividends.' },
    { name: 'Crypto & Options', risk: 90, returnVal: 28, desc: 'Extreme price swings; potential high gains or total principal loss.' },
  ];

  const active = nodes.find(n => n.name === selectedNode) || nodes[2];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <h4 className="font-semibold text-slate-100 flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
        <ShieldAlert className="w-5 h-5 text-amber-400" /> Risk vs. Return Spectrum
      </h4>

      <div className="relative h-48 border-l-2 border-b-2 border-slate-700 mb-4 p-4 flex items-end justify-around">
        <span className="absolute -left-7 top-0 text-[10px] text-slate-400 font-bold -rotate-90">Expected Return →</span>
        <span className="absolute bottom-1 right-2 text-[10px] text-slate-400 font-bold">Risk / Volatility →</span>

        {nodes.map(n => (
          <button
            key={n.name}
            onClick={() => setSelectedNode(n.name)}
            style={{ bottom: `${n.returnVal * 3}px` }}
            className={`flex flex-col items-center group transition-all transform hover:scale-110 ${
              selectedNode === n.name ? 'z-10' : ''
            }`}
          >
            <span className={`w-4 h-4 rounded-full border-2 transition-all ${
              selectedNode === n.name ? 'bg-indigo-500 border-white shadow-lg shadow-indigo-500/50 scale-125' : 'bg-slate-700 border-slate-500'
            }`} />
            <span className={`text-[10px] mt-1 font-semibold whitespace-nowrap ${
              selectedNode === n.name ? 'text-indigo-400' : 'text-slate-400'
            }`}>{n.name}</span>
          </button>
        ))}
      </div>

      <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-800 text-xs">
        <strong className="text-indigo-300 font-semibold block mb-1">{active.name}</strong>
        <p className="text-slate-300">{active.desc}</p>
      </div>
    </div>
  );
};

// 5. CANDLESTICK AID
const CandlestickAid: React.FC = () => {
  const [isBullish, setIsBullish] = useState(true);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
        <h4 className="font-semibold text-slate-100 flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-emerald-400" /> Candlestick Reader Diagram
        </h4>
        <div className="flex gap-2">
          <button
            onClick={() => setIsBullish(true)}
            className={`px-3 py-1 text-xs rounded-lg font-semibold ${
              isBullish ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
            }`}
          >
            Bullish (Green)
          </button>
          <button
            onClick={() => setIsBullish(false)}
            className={`px-3 py-1 text-xs rounded-lg font-semibold ${
              !isBullish ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-slate-800 text-slate-400'
            }`}
          >
            Bearish (Red)
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-around gap-6">
        <div className="relative flex flex-col items-center h-56 w-32 justify-center">
          {/* Upper Wick */}
          <div className="w-1 h-10 bg-slate-400" />
          <span className="text-[10px] text-slate-400 font-mono absolute top-2">High: $190</span>

          {/* Real Body */}
          <div className={`w-16 h-28 rounded-sm flex flex-col justify-between p-1.5 text-[10px] font-bold text-white shadow-lg transition-all ${
            isBullish ? 'bg-emerald-600 border border-emerald-400 shadow-emerald-600/30' : 'bg-rose-600 border border-rose-400 shadow-rose-600/30'
          }`}>
            <span>{isBullish ? 'Close: $188' : 'Open: $188'}</span>
            <span className="text-center font-mono uppercase text-[9px] opacity-80">Real Body</span>
            <span>{isBullish ? 'Open: $180' : 'Close: $180'}</span>
          </div>

          {/* Lower Wick */}
          <div className="w-1 h-10 bg-slate-400" />
          <span className="text-[10px] text-slate-400 font-mono absolute bottom-2">Low: $178</span>
        </div>

        <div className="space-y-3 text-xs text-slate-300 max-w-xs">
          <div className="p-2.5 bg-slate-800/40 rounded-lg border border-slate-800">
            <strong className="text-indigo-400 block mb-0.5">1. Open & Close (Real Body)</strong>
            <span>The rectangle shows the price movement between market open and close.</span>
          </div>
          <div className="p-2.5 bg-slate-800/40 rounded-lg border border-slate-800">
            <strong className="text-indigo-400 block mb-0.5">2. Upper & Lower Wicks</strong>
            <span>The thin lines show the maximum High and minimum Low prices reached during the period.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// 6. ORDER BOOK AID
const OrderBookAid: React.FC<{ formatMoney: (n: number) => string }> = ({ formatMoney }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <h4 className="font-semibold text-slate-100 flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
        <Layers className="w-5 h-5 text-indigo-400" /> Order Book Execution Visualizer
      </h4>

      <div className="grid grid-cols-2 gap-4 text-xs font-mono">
        <div className="bg-emerald-950/20 border border-emerald-900/40 p-3 rounded-xl">
          <h5 className="font-bold text-emerald-400 mb-2 uppercase font-sans">Bids (Buyers Want Low)</h5>
          <div className="space-y-1">
            <div className="flex justify-between text-slate-300"><span>{formatMoney(185.00)}</span><span>120 shares</span></div>
            <div className="flex justify-between text-slate-400"><span>{formatMoney(184.95)}</span><span>85 shares</span></div>
            <div className="flex justify-between text-slate-500"><span>{formatMoney(184.90)}</span><span>210 shares</span></div>
          </div>
        </div>

        <div className="bg-rose-950/20 border border-rose-900/40 p-3 rounded-xl">
          <h5 className="font-bold text-rose-400 mb-2 uppercase font-sans">Asks (Sellers Want High)</h5>
          <div className="space-y-1">
            <div className="flex justify-between text-slate-300"><span>{formatMoney(185.10)}</span><span>95 shares</span></div>
            <div className="flex justify-between text-slate-400"><span>{formatMoney(185.15)}</span><span>140 shares</span></div>
            <div className="flex justify-between text-slate-500"><span>{formatMoney(185.20)}</span><span>300 shares</span></div>
          </div>
        </div>
      </div>
      <p className="text-sm text-slate-400 mt-4 text-center">
        Market BUY orders match immediately against the lowest ASK ({formatMoney(185.10)}). Limit BUY orders wait until price reaches their set bid limit.
      </p>
    </div>
  );
};

// 7. BID ASK MARGIN AID
const BidAskAid: React.FC<{ formatMoney: (n: number) => string }> = ({ formatMoney }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <h4 className="font-semibold text-slate-100 flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
        <Sliders className="w-5 h-5 text-teal-400" /> The Bid-Ask Spread Gap
      </h4>

      <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-xl border border-slate-700">
        <div className="text-center">
          <span className="text-xs text-slate-400 block">Highest Buyer BID</span>
          <strong className="text-emerald-400 font-mono text-lg">{formatMoney(150.00)}</strong>
        </div>

        <div className="flex flex-col items-center px-4">
          <span className="text-[10px] text-amber-400 font-bold uppercase bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">Spread = {formatMoney(0.05)}</span>
          <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500 my-1 rounded" />
        </div>

        <div className="text-center">
          <span className="text-xs text-slate-400 block">Lowest Seller ASK</span>
          <strong className="text-rose-400 font-mono text-lg">{formatMoney(150.05)}</strong>
        </div>
      </div>
    </div>
  );
};

// 8. PE RATIO AID
const PeRatioAid: React.FC<{ formatMoney: (n: number) => string }> = ({ formatMoney }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <h4 className="font-semibold text-slate-100 flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
        <Info className="w-5 h-5 text-indigo-400" /> P/E Ratio Valuation Comparator
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700 space-y-2">
          <strong className="text-indigo-400 font-bold font-mono block text-sm">Company A (Growth Tech)</strong>
          <div className="flex justify-between"><span>Stock Price:</span><span>{formatMoney(200)}</span></div>
          <div className="flex justify-between"><span>Earnings (EPS):</span><span>{formatMoney(4)}</span></div>
          <div className="flex justify-between border-t border-slate-700 pt-2 font-bold text-slate-100">
            <span>P/E Ratio:</span>
            <span className="text-amber-400">50x</span>
          </div>
          <span className="inline-block text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">High Growth Expectation</span>
        </div>

        <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700 space-y-2">
          <strong className="text-emerald-400 font-bold font-mono block text-sm">Company B (Value Energy)</strong>
          <div className="flex justify-between"><span>Stock Price:</span><span>{formatMoney(60)}</span></div>
          <div className="flex justify-between"><span>Earnings (EPS):</span><span>{formatMoney(5)}</span></div>
          <div className="flex justify-between border-t border-slate-700 pt-2 font-bold text-slate-100">
            <span>P/E Ratio:</span>
            <span className="text-emerald-400">12x</span>
          </div>
          <span className="inline-block text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">Value Stock / Mature</span>
        </div>
      </div>
    </div>
  );
};

// 9. ETF BREAKDOWN AID
const EtfBreakdownAid: React.FC = () => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <h4 className="font-semibold text-slate-100 flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
        <PieChart className="w-5 h-5 text-indigo-400" /> S&P 500 ETF Basket (SPY)
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-center text-xs font-semibold">
        <div className="p-3 bg-indigo-500/20 border border-indigo-500/40 rounded-xl text-indigo-300">Apple (7%)</div>
        <div className="p-3 bg-indigo-500/20 border border-indigo-500/40 rounded-xl text-indigo-300">Microsoft (6.5%)</div>
        <div className="p-3 bg-indigo-500/20 border border-indigo-500/40 rounded-xl text-indigo-300">Nvidia (6.1%)</div>
        <div className="p-3 bg-indigo-500/20 border border-indigo-500/40 rounded-xl text-indigo-300">Amazon (3.8%)</div>
        <div className="p-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-400">495 Others (76.6%)</div>
      </div>
    </div>
  );
};

// 10. STOCK EQUITY AID
const StockEquityAid: React.FC<{ formatMoney: (n: number) => string }> = ({ formatMoney }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <h4 className="font-semibold text-slate-100 flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
        <TrendingUp className="w-5 h-5 text-emerald-400" /> Share Slice Ownership
      </h4>
      <div className="flex items-center justify-around bg-slate-800/40 p-4 rounded-xl border border-slate-800 text-xs">
        <div className="text-center">
          <span className="text-slate-400 block">Total Corporation Value</span>
          <strong className="text-indigo-400 font-bold font-mono text-base">$1,000,000</strong>
        </div>
        <ArrowRight className="w-5 h-5 text-slate-500" />
        <div className="text-center">
          <span className="text-slate-400 block">Total Shares Issued</span>
          <strong className="text-slate-200 font-bold font-mono text-base">100,000 Shares</strong>
        </div>
        <ArrowRight className="w-5 h-5 text-slate-500" />
        <div className="text-center">
          <span className="text-slate-400 block">Price Per Share</span>
          <strong className="text-emerald-400 font-bold font-mono text-base">{formatMoney(10)}</strong>
        </div>
      </div>
    </div>
  );
};

// 11. BOND YIELD TIMELINE
const BondYieldAid: React.FC<{ formatMoney: (n: number) => string }> = ({ formatMoney }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <h4 className="font-semibold text-slate-100 flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
        <ShieldAlert className="w-5 h-5 text-amber-400" /> Bond Coupon Payment Schedule
      </h4>
      <div className="flex items-center justify-between text-xs font-semibold bg-slate-800/50 p-4 rounded-xl border border-slate-700">
        <div className="text-center"><span className="text-slate-400 block">Year 0</span><strong>Lend {formatMoney(1000)}</strong></div>
        <div className="text-center"><span className="text-emerald-400 block">Year 1</span><strong>+ {formatMoney(50)} Coupon</strong></div>
        <div className="text-center"><span className="text-emerald-400 block">Year 2</span><strong>+ {formatMoney(50)} Coupon</strong></div>
        <div className="text-center"><span className="text-indigo-400 block">Year 3 (Maturity)</span><strong>Principal {formatMoney(1000)} + {formatMoney(50)}</strong></div>
      </div>
    </div>
  );
};

// 12. PORTFOLIO ALLOCATION AID
const PortfolioAllocationAid: React.FC = () => {
  const [age, setAge] = useState(22);
  const stockPercent = Math.max(10, 100 - age);
  const bondPercent = 100 - stockPercent;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <h4 className="font-semibold text-slate-100 flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
        <Sliders className="w-5 h-5 text-indigo-400" /> Rule of 100 Asset Allocation Slider
      </h4>

      <div className="mb-4">
        <label className="text-xs font-semibold text-slate-400 block mb-1">Your Age: {age} years old</label>
        <input
          type="range"
          min="18"
          max="70"
          value={age}
          onChange={e => setAge(Number(e.target.value))}
          className="w-full accent-indigo-500 cursor-pointer"
        />
      </div>

      <div className="flex h-8 w-full rounded-xl overflow-hidden font-bold text-xs shadow-inner">
        <div style={{ width: `${stockPercent}%` }} className="bg-indigo-600 flex items-center justify-center text-white">
          {stockPercent}% Stocks (Growth)
        </div>
        <div style={{ width: `${bondPercent}%` }} className="bg-amber-600 flex items-center justify-center text-white">
          {bondPercent}% Bonds (Safety)
        </div>
      </div>
    </div>
  );
};

// 13. DCA SIMULATOR AID
const DcaSimulatorAid: React.FC<{ formatMoney: (n: number) => string }> = ({ formatMoney }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <h4 className="font-semibold text-slate-100 flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
        <TrendingUp className="w-5 h-5 text-emerald-400" /> DCA vs Lump Sum in Market Dips
      </h4>
      <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
        <div className="flex justify-between font-semibold text-emerald-400">
          <span>DCA (Monthly $100)</span>
          <span>Average Cost: {formatMoney(85)} / share</span>
        </div>
        <div className="flex justify-between font-semibold text-rose-400"><span>Lump Sum ($1,000 at Peak)</span><span>Average Cost: {formatMoney(100)} / share</span></div>
        <p className="text-slate-400 text-[11px] pt-1">
          DCA automatically acquired extra shares during market dips, lowering average cost basis.
        </p>
      </div>
    </div>
  );
};
