import React, { useState } from 'react';

import { useApp } from '../context/AppContext';
import { TradingChart } from '../components/TradingChart';
import nseSymbols from '../data/symbols.json';

export const SimulatorPage: React.FC = () => {
  const { stocks, isMarketOpen, marketStatusText, cashBalance, holdings, openOrders, tradeLog, placeOrder, cancelOrder, formatMoney, addMockStock } = useApp();

  const [selectedSymbol, setSelectedSymbol] = useState<string>('RELIANCE');
  const [chartType, setChartType] = useState<'candlestick' | 'line' | 'area' | 'bar' | 'step'>('candlestick');
  const [chartTimeframe, setChartTimeframe] = useState<'1D' | '1W' | '1M' | '3M' | '1Y'>('1D');
  const [showSMA, setShowSMA] = useState(false);
  const [showEMA, setShowEMA] = useState(false);
  const [showBollinger, setShowBollinger] = useState(false);
  const [showRSI, setShowRSI] = useState(false);
  const [showMACD, setShowMACD] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchIndex, setSearchIndex] = useState(-1);
  const searchResults = searchQuery.length >= 2 
    ? nseSymbols.filter(s => s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || s.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 8)
    : [];

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || searchResults.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSearchIndex(prev => (prev < searchResults.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSearchIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = searchIndex >= 0 ? searchResults[searchIndex] : searchResults[0];
      if (selected) {
        addMockStock(selected.symbol, selected.name);
        setSelectedSymbol(selected.symbol);
        setSearchQuery('');
        setShowDropdown(false);
        setSearchIndex(-1);
      }
    }
  };

  // Order Entry Form state
  const [orderSide, setOrderSide] = useState<'BUY' | 'SELL'>('BUY');
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [quantity, setQuantity] = useState<number>(1);
  const [limitPriceInput, setLimitPriceInput] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'holdings' | 'orders' | 'history'>('holdings');

  const currentStock = stocks.find(s => s.symbol === selectedSymbol) || stocks[0];
  const userHolding = holdings[selectedSymbol];

  const executionPrice = orderType === 'MARKET' ? currentStock.price : (Number(limitPriceInput) || currentStock.price);
  const estimatedCost = executionPrice * quantity;

  // Calculate portfolio totals in INR
  let holdingsValue = 0;
  let totalCost = 0;

  Object.values(holdings).forEach((h: any) => {
    const stock = stocks.find(s => s.symbol === h.symbol);
    const price = stock ? stock.price : h.avgCost;
    holdingsValue += h.shares * price;
    totalCost += h.shares * h.avgCost;
  });

  const totalEquity = cashBalance + holdingsValue;
  const totalPnL = holdingsValue - totalCost;
  const pnlPercent = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetLimit = orderType === 'LIMIT' ? Number(limitPriceInput) : undefined;
    placeOrder(selectedSymbol, orderSide, orderType, quantity, targetLimit);
  };

  const handleMaxQuantity = () => {
    if (orderSide === 'BUY') {
      const maxShares = Math.floor(cashBalance / executionPrice);
      setQuantity(Math.max(1, maxShares));
    } else {
      setQuantity(userHolding ? userHolding.shares : 0);
    }
  };

  const historyData = chartTimeframe === '1D' ? currentStock.history1D : (chartTimeframe === '1W' ? currentStock.history1W : (chartTimeframe === '1M' ? currentStock.history1M : (chartTimeframe === '3M' ? currentStock.history3M : currentStock.history1Y)));

  return (
    <div className="w-full flex flex-col h-[calc(100vh-48px)] bg-brand-black text-brand-light font-sans overflow-hidden border-t border-brand-dark">
      {/* Portfolio Summary Header Bar (Tight) */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-brand-dark border-b border-brand-card text-xs shrink-0">
        <div className="flex items-center gap-6 font-mono">
          <div className="flex items-center gap-2">
            <span className="text-brand-muted">CASH</span>
            <strong className="text-brand-light">{formatMoney(cashBalance)}</strong>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-brand-muted">EQUITY</span>
            <strong className="text-brand-light">{formatMoney(totalEquity)}</strong>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-brand-muted">UNREALIZED</span>
            <strong className={totalPnL >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}>
              {totalPnL >= 0 ? '+' : ''}{formatMoney(totalPnL)} ({pnlPercent.toFixed(2)}%)
            </strong>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`w-2 h-2 rounded-full ${isMarketOpen ? 'bg-[#10b981] animate-pulse' : 'bg-[#ef4444]'}`} />
          <span className="text-[10px] font-bold text-brand-muted">{marketStatusText}</span>
        </div>
      </div>

      {/* Main Terminal Grid */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT PANEL: Watchlist */}
        <div className="w-64 flex flex-col border-r border-brand-card bg-brand-dark shrink-0">
          <div className="p-2 border-b border-brand-card">
            <div className="relative">
              <input
                type="text"
                placeholder="Search NSE symbol..."
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                  setSearchIndex(-1);
                }}
                onKeyDown={handleSearchKeyDown}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                className="w-full bg-brand-card border border-brand-card rounded px-2 py-1 text-xs text-brand-light focus:outline-none focus:border-brand-orange font-mono"
              />
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-brand-card border border-brand-dark shadow-2xl z-50 max-h-60 overflow-y-auto">
                  {searchResults.map((res, i) => (
                    <div
                      key={res.symbol}
                      onMouseEnter={() => setSearchIndex(i)}
                      onClick={() => {
                        addMockStock(res.symbol, res.name);
                        setSelectedSymbol(res.symbol);
                        setSearchQuery('');
                        setShowDropdown(false);
                        setSearchIndex(-1);
                      }}
                      className={`px-2 py-1.5 cursor-pointer flex flex-col ${i === searchIndex ? 'bg-brand-dark' : 'hover:bg-brand-dark'}`}
                    >
                      <span className="font-bold text-brand-light text-xs font-mono">{res.symbol}</span>
                      <span className="text-brand-muted text-[10px] truncate">{res.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {stocks.map(s => {
              const isSelected = s.symbol === selectedSymbol;
              const isPositive = s.change24h >= 0;
              return (
                <div
                  key={s.symbol}
                  onClick={() => {
                    setSelectedSymbol(s.symbol);
                    if (orderType === 'LIMIT') setLimitPriceInput(s.price.toString());
                  }}
                  className={`px-3 py-2 cursor-pointer flex justify-between items-center border-b border-brand-card/50 ${
                    isSelected ? 'bg-brand-card' : 'hover:bg-brand-card/50'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-xs text-brand-light font-mono">{s.symbol}</span>
                    <span className="text-[10px] text-brand-muted max-w-[100px] truncate">{s.name}</span>
                  </div>
                  <div className="flex flex-col items-end font-mono">
                    <span className="text-xs text-brand-light">{s.price.toFixed(2)}</span>
                    <span className={`text-[10px] ${isPositive ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                      {isPositive ? '+' : ''}{s.change24hPercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CENTER PANEL: Chart */}
        <div className="flex-1 flex flex-col bg-brand-black">
          {/* OHLC Stats Bar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-brand-card bg-brand-dark">
            <div className="flex items-center gap-4">
              <div className="flex items-baseline gap-2">
                <h2 className="text-2xl font-bold text-brand-light font-mono">{currentStock.symbol}</h2>
                {currentStock.isSimulated && (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold bg-brand-orange/10 text-brand-muted border border-brand-orange/30 rounded uppercase tracking-wider">
                    Simulated Data
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 font-mono text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-brand-light font-bold text-lg">{currentStock.price.toFixed(2)}</span>
                  <span className={`${currentStock.change24h >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                    {currentStock.change24h >= 0 ? '+' : ''}{currentStock.change24h.toFixed(2)} ({currentStock.change24hPercent.toFixed(2)}%)
                  </span>
                </div>
                <div className="h-4 w-px bg-brand-card" />
                <div className="flex gap-3 text-[10px]">
                  <div><span className="text-brand-muted mr-1">O</span><span className="text-brand-light">{(historyData[historyData.length - 1]?.open || currentStock.price).toFixed(2)}</span></div>
                  <div><span className="text-brand-muted mr-1">H</span><span className="text-brand-light">{currentStock.high24h.toFixed(2)}</span></div>
                  <div><span className="text-brand-muted mr-1">L</span><span className="text-brand-light">{currentStock.low24h.toFixed(2)}</span></div>
                  <div><span className="text-brand-muted mr-1">C</span><span className="text-brand-light">{currentStock.previousClose.toFixed(2)}</span></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Chart Controls */}
          <div className="flex items-center gap-4 px-4 py-1.5 border-b border-brand-card bg-brand-dark text-[10px]">
            <div className="flex gap-0.5">
              {(['candlestick', 'line', 'area', 'bar'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setChartType(type)}
                  className={`px-2 py-1 rounded uppercase font-bold ${chartType === type ? 'bg-brand-card text-brand-light' : 'text-brand-muted hover:text-brand-light'}`}
                >
                  {type}
                </button>
              ))}
            </div>
            <div className="h-3 w-px bg-brand-card" />
            <div className="flex gap-0.5 font-bold">
              {(['1D', '1W', '1M', '3M', '1Y'] as const).map(tf => (
                <button
                  key={tf}
                  onClick={() => setChartTimeframe(tf as any)}
                  className={`px-2 py-1 rounded ${chartTimeframe === tf ? 'bg-brand-card text-brand-light' : 'text-brand-muted hover:text-brand-light'}`}
                >
                  {tf}
                </button>
              ))}
            </div>
            <div className="h-3 w-px bg-brand-card" />
            <div className="flex gap-0.5 font-bold">
              <button onClick={() => setShowSMA(!showSMA)} className={`px-2 py-1 rounded border ${showSMA ? 'bg-brand-card border-brand-muted text-brand-light' : 'border-transparent text-brand-muted'}`}>SMA</button>
              <button onClick={() => setShowEMA(!showEMA)} className={`px-2 py-1 rounded border ${showEMA ? 'bg-brand-card border-brand-muted text-brand-light' : 'border-transparent text-brand-muted'}`}>EMA</button>
              <button onClick={() => setShowBollinger(!showBollinger)} className={`px-2 py-1 rounded border ${showBollinger ? 'bg-brand-card border-brand-muted text-brand-light' : 'border-transparent text-brand-muted'}`}>BB</button>
              <button onClick={() => setShowRSI(!showRSI)} className={`px-2 py-1 rounded border ${showRSI ? 'bg-brand-card border-brand-muted text-brand-light' : 'border-transparent text-brand-muted'}`}>RSI</button>
              <button onClick={() => setShowMACD(!showMACD)} className={`px-2 py-1 rounded border ${showMACD ? 'bg-brand-card border-brand-muted text-brand-light' : 'border-transparent text-brand-muted'}`}>MACD</button>
            </div>
          </div>

          <div className="flex-1 w-full relative min-h-0">
            <TradingChart 
              data={historyData}
              type={chartType as any}
              showSMA={showSMA}
              showEMA={showEMA}
              showBollinger={showBollinger}
              showRSI={showRSI}
              showMACD={showMACD}
            />
          </div>
        </div>

        {/* RIGHT PANEL: Order Entry & Depth */}
        <div className="w-72 flex flex-col border-l border-brand-card bg-brand-dark shrink-0">
          {/* Order Entry */}
          <div className="p-3 border-b border-brand-card">
            <div className="flex font-bold text-xs mb-3 bg-brand-card rounded p-0.5">
              <button
                onClick={() => setOrderSide('BUY')}
                className={`flex-1 py-1.5 rounded-sm ${orderSide === 'BUY' ? 'bg-[#10b981] text-brand-black' : 'text-brand-muted hover:text-brand-light'}`}
              >BUY</button>
              <button
                onClick={() => setOrderSide('SELL')}
                className={`flex-1 py-1.5 rounded-sm ${orderSide === 'SELL' ? 'bg-[#ef4444] text-brand-black' : 'text-brand-muted hover:text-brand-light'}`}
              >SELL</button>
            </div>
            <form onSubmit={handleOrderSubmit} className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span className="text-brand-muted">TYPE</span>
                <div className="flex gap-2 text-brand-light">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="radio" checked={orderType === 'MARKET'} onChange={() => setOrderType('MARKET')} className="accent-brand-orange" /> MKT
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="radio" checked={orderType === 'LIMIT'} onChange={() => { setOrderType('LIMIT'); setLimitPriceInput(currentStock.price.toString()); }} className="accent-brand-orange" /> LMT
                  </label>
                </div>
              </div>
              {orderType === 'LIMIT' && (
                <div className="flex items-center bg-brand-card border border-brand-card rounded px-2">
                  <span className="text-brand-muted w-12 text-[10px]">PRICE</span>
                  <input type="number" step="0.05" required value={limitPriceInput} onChange={e => setLimitPriceInput(e.target.value)} className="w-full bg-transparent py-1.5 text-right text-brand-light focus:outline-none" />
                </div>
              )}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[9px] text-brand-muted">QUANTITY</span>
                  <button type="button" onClick={handleMaxQuantity} className="text-[9px] text-brand-orange hover:text-brand-orange/80 font-bold uppercase">MAX {orderSide}</button>
                </div>
                <div className="flex items-center bg-brand-card border border-brand-card rounded px-2">
                  <span className="text-brand-muted w-12 text-[10px]">QTY</span>
                  <input type="number" min="1" required value={quantity} onChange={e => setQuantity(Math.max(1, Number(e.target.value)))} className="w-full bg-transparent py-1.5 text-right text-brand-light focus:outline-none" />
                </div>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-brand-card text-[10px]">
                <span className="text-brand-muted">MARGIN REQ</span>
                <span className="text-brand-light">{formatMoney(estimatedCost)}</span>
              </div>
              <button type="submit" className={`w-full py-2 font-bold uppercase rounded text-brand-black ${orderSide === 'BUY' ? 'bg-[#10b981] hover:bg-[#059669]' : 'bg-[#ef4444] hover:bg-[#dc2626]'}`}>
                {orderSide} {quantity} {currentStock.symbol}
              </button>
            </form>
          </div>

          {/* Order Depth */}
          <div className="flex-1 flex flex-col min-h-0 border-b border-brand-card">
            <div className="px-3 py-1.5 bg-brand-dark border-b border-brand-card text-[10px] font-bold text-brand-muted uppercase flex justify-between">
              <span>Order Book</span>
              <span>Sprd: {(currentStock.price * 0.001).toFixed(2)}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 font-mono text-[10px]">
              <table className="w-full text-right">
                <thead>
                  <tr className="text-brand-muted">
                    <th className="font-normal pb-1 text-left">BID</th>
                    <th className="font-normal pb-1">QTY</th>
                    <th className="font-normal pb-1 text-left pl-2">ASK</th>
                    <th className="font-normal pb-1">QTY</th>
                  </tr>
                </thead>
                <tbody>
                  {currentStock.orderBook.bids.slice(0, 10).map((bid: any, i: number) => {
                    const ask = currentStock.orderBook.asks[i];
                    return (
                      <tr key={i} className="hover:bg-brand-card/50">
                        <td className="text-[#10b981] text-left py-0.5">{bid.price.toFixed(2)}</td>
                        <td className="text-brand-light">{bid.amount}</td>
                        <td className="text-[#ef4444] text-left pl-2 py-0.5">{ask.price.toFixed(2)}</td>
                        <td className="text-brand-light">{ask.amount}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Accordions (Open Orders, Holdings) */}
          <div className="flex flex-col h-1/3 bg-brand-black">
            <div className="flex bg-brand-dark border-b border-brand-card">
              <button onClick={() => setActiveTab('holdings')} className={`flex-1 py-1.5 text-[10px] font-bold uppercase transition-colors ${activeTab === 'holdings' ? 'text-brand-light border-b-2 border-brand-orange' : 'text-brand-muted hover:text-brand-light'}`}>Holdings</button>
              <button onClick={() => setActiveTab('orders')} className={`flex-1 py-1.5 text-[10px] font-bold uppercase transition-colors ${activeTab === 'orders' ? 'text-brand-light border-b-2 border-brand-orange' : 'text-brand-muted hover:text-brand-light'}`}>Orders</button>
              <button onClick={() => setActiveTab('history')} className={`flex-1 py-1.5 text-[10px] font-bold uppercase transition-colors ${activeTab === 'history' ? 'text-brand-light border-b-2 border-brand-orange' : 'text-brand-muted hover:text-brand-light'}`}>History</button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 font-mono text-[10px]">
              {activeTab === 'holdings' && (
                <div className="space-y-2">
                  {Object.values(holdings).length === 0 ? <div className="text-brand-muted text-center py-4">Empty</div> : 
                    Object.values(holdings).map((h: any) => {
                      const p = stocks.find(s => s.symbol === h.symbol)?.price || h.avgCost;
                      const val = h.shares * p;
                      return (
                        <div key={h.symbol} className="flex justify-between items-center p-1.5 bg-brand-card rounded cursor-pointer hover:bg-brand-card/80" onClick={() => { setSelectedSymbol(h.symbol); setOrderSide('SELL'); }}>
                          <div><span className="font-bold text-brand-light">{h.symbol}</span> <span className="text-brand-muted">x{h.shares}</span></div>
                          <div className={p >= h.avgCost ? 'text-[#10b981]' : 'text-[#ef4444]'}>{val.toFixed(2)}</div>
                        </div>
                      )
                    })
                  }
                </div>
              )}
              {activeTab === 'orders' && (
                <div className="space-y-2">
                  {openOrders.length === 0 ? <div className="text-brand-muted text-center py-4">Empty</div> : 
                    openOrders.map((o: any) => (
                      <div key={o.id} className="flex justify-between items-center p-1.5 bg-brand-card rounded">
                        <div>
                          <span className={o.side === 'BUY' ? 'text-[#10b981]' : 'text-[#ef4444]'}>{o.side}</span> <span className="font-bold text-brand-light">{o.symbol}</span>
                          <div className="text-brand-muted">{o.shares} @ {o.targetPrice.toFixed(2)}</div>
                        </div>
                        <button onClick={() => cancelOrder(o.id)} className="text-brand-muted hover:text-brand-light px-2">X</button>
                      </div>
                    ))
                  }
                </div>
              )}
              {activeTab === 'history' && (
                <div className="space-y-2">
                  {tradeLog.length === 0 ? <div className="text-brand-muted text-center py-4">Empty</div> : 
                    tradeLog.map((l: any) => (
                      <div key={l.id} className="p-1.5 bg-brand-card rounded flex justify-between">
                        <div><span className={l.side === 'BUY' ? 'text-[#10b981]' : 'text-[#ef4444]'}>{l.side}</span> <span className="font-bold text-brand-light">{l.symbol}</span></div>
                        <div className="text-right"><div className="text-brand-light">{l.total.toFixed(2)}</div><div className="text-brand-muted text-[9px]">{l.timestamp}</div></div>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
);
};
