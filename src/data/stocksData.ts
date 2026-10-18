export interface CandlestickPoint {
  time: number | string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockInstrument {
  symbol: string;
  name: string;
  yahooSymbol: string;
  category: 'Tech' | 'Index ETF' | 'Commodity' | 'Banking' | 'Auto' | 'Conglomerate' | 'Consumer';
  price: number;
  previousClose: number;
  change24h: number;
  change24hPercent: number;
  high24h: number;
  low24h: number;
  volume: string;
  peRatio?: number;
  marketCap: string;
  isSimulated?: boolean;
  description: string;
  history1D: CandlestickPoint[];
  history1W: CandlestickPoint[];
  history1M: CandlestickPoint[];
  history3M: CandlestickPoint[];
  history1Y: CandlestickPoint[];
  orderBook: {
    bids: { price: number; amount: number }[];
    asks: { price: number; amount: number }[];
  };
}

// Helper to generate realistic OHLC price series for fallback/seed

export const generateDailyHistory = (basePrice: number, daysCount: number, volatility = 0.02): CandlestickPoint[] => {
  const points: CandlestickPoint[] = [];
  let currentClose = basePrice * (1 - volatility * Math.sqrt(daysCount) * 0.35);
  const now = new Date();

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    // Use unix timestamp in seconds for lightweight charts
    const ts = Math.floor(d.getTime() / 1000);
    
    // Daily volatility
    const change = (Math.random() - 0.48) * volatility * currentClose;
    const open = currentClose;
    const close = Math.max(1, open + change);
    const high = Math.max(open, close) + Math.random() * volatility * currentClose * 0.8;
    const low = Math.min(open, close) - Math.random() * volatility * currentClose * 0.8;
    const volume = Math.floor(Math.random() * 500000 + 100000);

    points.push({
      time: ts,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume
    });

    currentClose = close;
  }
  return points;
};

export const generateHistory = (
  basePrice: number,
  pointsCount = 320,
  volatility = 0.012,
  intervalMinutes = 15
): CandlestickPoint[] => {
  const points: CandlestickPoint[] = [];
  let currentClose = basePrice * (1 - volatility * Math.sqrt(pointsCount) * 0.25);
  const now = new Date();

  for (let i = pointsCount - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * intervalMinutes * 60 * 1000);
    const ts = Math.floor(d.getTime() / 1000);
    const change = (Math.random() - 0.49) * volatility * currentClose;
    const open = currentClose;
    const close = Math.max(1, open + change);
    const high = Math.max(open, close) + Math.random() * volatility * currentClose * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * currentClose * 0.5;
    const volume = Math.floor(Math.random() * 50000 + 10000);

    points.push({
      time: ts,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume
    });

    currentClose = close;
  }
  return points;
};

// Helper to generate realistic bid/ask order book depth in INR
export const generateOrderBook = (currentPrice: number) => {
  const bids = [];
  const asks = [];
  for (let i = 1; i <= 5; i++) {
    bids.push({
      price: Number((currentPrice * (1 - i * 0.0012)).toFixed(2)),
      amount: Math.floor(Math.random() * 250 + 20)
    });
    asks.push({
      price: Number((currentPrice * (1 + i * 0.0012)).toFixed(2)),
      amount: Math.floor(Math.random() * 250 + 20)
    });
  }
  return { bids, asks };
};

export const INITIAL_STOCKS: StockInstrument[] = [
  {
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd.',
    yahooSymbol: 'RELIANCE.NS',
    category: 'Conglomerate',
    price: 2985.40,
    previousClose: 2950.10,
    change24h: 35.30,
    change24hPercent: 1.20,
    high24h: 2995.00,
    low24h: 2942.50,
    volume: '8.4M',
    peRatio: 28.4,
    marketCap: '₹20.2 Lakh Cr',
    description: 'India\'s largest multinational conglomerate operating in energy, petrochemicals, Jio telecom, and retail.',
    history1D: generateHistory(2985.40, 320, 0.008, 15),
    history1W: generateHistory(2985.40, 350, 0.015, 30),
    history1M: generateHistory(2985.40, 400, 0.025, 60),
    history3M: generateDailyHistory(2985.40, 120, 0.03),
    history1Y: generateDailyHistory(2985.40, 365, 0.04),
    orderBook: generateOrderBook(2985.40)
  },
  {
    symbol: 'TCS',
    name: 'Tata Consultancy Services',
    yahooSymbol: 'TCS.NS',
    category: 'Tech',
    price: 4210.50,
    previousClose: 4180.00,
    change24h: 30.50,
    change24hPercent: 0.73,
    high24h: 4235.00,
    low24h: 4175.20,
    volume: '2.8M',
    peRatio: 32.1,
    marketCap: '₹15.2 Lakh Cr',
    description: 'Global leader in IT services, consulting, and business solutions under Tata Group.',
    history1D: generateHistory(4210.50, 320, 0.007, 15),
    history1W: generateHistory(4210.50, 350, 0.012, 30),
    history1M: generateHistory(4210.50, 400, 0.02, 60),
    history3M: generateDailyHistory(4210.50, 120, 0.03),
    history1Y: generateDailyHistory(4210.50, 365, 0.04),
    orderBook: generateOrderBook(4210.50)
  },
  {
    symbol: 'INFY',
    name: 'Infosys Limited',
    yahooSymbol: 'INFY.NS',
    category: 'Tech',
    price: 1845.20,
    previousClose: 1815.00,
    change24h: 30.20,
    change24hPercent: 1.66,
    high24h: 1858.00,
    low24h: 1810.50,
    volume: '6.1M',
    peRatio: 27.8,
    marketCap: '₹7.6 Lakh Cr',
    description: 'Pioneer Indian multinational information technology company offering next-generation digital services.',
    history1D: generateHistory(1845.20, 320, 0.009, 15),
    history1W: generateHistory(1845.20, 350, 0.016, 30),
    history1M: generateHistory(1845.20, 400, 0.024, 60),
    history3M: generateDailyHistory(1845.20, 120, 0.03),
    history1Y: generateDailyHistory(1845.20, 365, 0.04),
    orderBook: generateOrderBook(1845.20)
  },
  {
    symbol: 'HDFCBANK',
    name: 'HDFC Bank Limited',
    yahooSymbol: 'HDFCBANK.NS',
    category: 'Banking',
    price: 1640.80,
    previousClose: 1630.00,
    change24h: 10.80,
    change24hPercent: 0.66,
    high24h: 1648.50,
    low24h: 1625.00,
    volume: '14.2M',
    peRatio: 19.5,
    marketCap: '₹12.5 Lakh Cr',
    description: 'India\'s largest private sector bank providing retail, wholesale, and corporate banking solutions.',
    history1D: generateHistory(1640.80, 320, 0.006, 15),
    history1W: generateHistory(1640.80, 350, 0.012, 30),
    history1M: generateHistory(1640.80, 400, 0.018, 60),
    history3M: generateDailyHistory(1640.80, 120, 0.03),
    history1Y: generateDailyHistory(1640.80, 365, 0.04),
    orderBook: generateOrderBook(1640.80)
  },
  {
    symbol: 'ICICIBANK',
    name: 'ICICI Bank Limited',
    yahooSymbol: 'ICICIBANK.NS',
    category: 'Banking',
    price: 1180.40,
    previousClose: 1165.20,
    change24h: 15.20,
    change24hPercent: 1.30,
    high24h: 1188.00,
    low24h: 1162.00,
    volume: '11.5M',
    peRatio: 18.2,
    marketCap: '₹8.3 Lakh Cr',
    description: 'Leading private bank in India with extensive digital branch network and high asset growth.',
    history1D: generateHistory(1180.40, 320, 0.008, 15),
    history1W: generateHistory(1180.40, 350, 0.014, 30),
    history1M: generateHistory(1180.40, 400, 0.022, 60),
    history3M: generateDailyHistory(1180.40, 120, 0.03),
    history1Y: generateDailyHistory(1180.40, 365, 0.04),
    orderBook: generateOrderBook(1180.40)
  },
  {
    symbol: 'SBIN',
    name: 'State Bank of India',
    yahooSymbol: 'SBIN.NS',
    category: 'Banking',
    price: 825.60,
    previousClose: 832.00,
    change24h: -6.40,
    change24hPercent: -0.77,
    high24h: 836.50,
    low24h: 821.00,
    volume: '18.4M',
    peRatio: 10.8,
    marketCap: '₹7.3 Lakh Cr',
    description: 'Largest public sector bank and financial services statutory body in India.',
    history1D: generateHistory(825.60, 320, 0.01, 15),
    history1W: generateHistory(825.60, 350, 0.018, 30),
    history1M: generateHistory(825.60, 400, 0.026, 60),
    history3M: generateDailyHistory(825.60, 120, 0.03),
    history1Y: generateDailyHistory(825.60, 365, 0.04),
    orderBook: generateOrderBook(825.60)
  },
  {
    symbol: 'TATAMOTORS',
    name: 'Tata Motors Limited',
    yahooSymbol: 'TATAMOTORS.NS',
    category: 'Auto',
    price: 1065.30,
    previousClose: 1040.00,
    change24h: 25.30,
    change24hPercent: 2.43,
    high24h: 1075.00,
    low24h: 1035.00,
    volume: '16.8M',
    peRatio: 16.4,
    marketCap: '₹3.9 Lakh Cr',
    description: 'Leading global automobile manufacturer of cars, utility vehicles, trucks, buses, and Jaguar Land Rover.',
    history1D: generateHistory(1065.30, 320, 0.015, 15),
    history1W: generateHistory(1065.30, 350, 0.025, 30),
    history1M: generateHistory(1065.30, 400, 0.035, 60),
    history3M: generateDailyHistory(1065.30, 120, 0.03),
    history1Y: generateDailyHistory(1065.30, 365, 0.04),
    orderBook: generateOrderBook(1065.30)
  },
  {
    symbol: 'ITC',
    name: 'ITC Limited',
    yahooSymbol: 'ITC.NS',
    category: 'Consumer',
    price: 492.50,
    previousClose: 488.10,
    change24h: 4.40,
    change24hPercent: 0.90,
    high24h: 495.00,
    low24h: 486.50,
    volume: '9.3M',
    peRatio: 29.1,
    marketCap: '₹6.1 Lakh Cr',
    description: 'Major consumer goods conglomerate in FMCG, hotels, paperboards, packaging, and agri-business.',
    history1D: generateHistory(492.50, 320, 0.006, 15),
    history1W: generateHistory(492.50, 350, 0.01, 30),
    history1M: generateHistory(492.50, 400, 0.016, 60),
    history3M: generateDailyHistory(492.50, 120, 0.03),
    history1Y: generateDailyHistory(492.50, 365, 0.04),
    orderBook: generateOrderBook(492.50)
  },
  {
    symbol: 'NIFTY50',
    name: 'NIFTY 50 Index',
    yahooSymbol: '^NSEI',
    category: 'Index ETF',
    price: 24540.20,
    previousClose: 24380.00,
    change24h: 160.20,
    change24hPercent: 0.66,
    high24h: 24610.00,
    low24h: 24340.00,
    volume: '220M',
    marketCap: 'Benchmark',
    description: 'NSE benchmark stock market index representing weighted average of 50 top Indian companies.',
    history1D: generateHistory(24540.20, 320, 0.004, 15),
    history1W: generateHistory(24540.20, 350, 0.008, 30),
    history1M: generateHistory(24540.20, 400, 0.012, 60),
    history3M: generateDailyHistory(24540.20, 120, 0.03),
    history1Y: generateDailyHistory(24540.20, 365, 0.04),
    orderBook: generateOrderBook(24540.20)
  },
  {
    symbol: 'SENSEX',
    name: 'BSE SENSEX Index',
    yahooSymbol: '^BSESN',
    category: 'Index ETF',
    price: 80435.80,
    previousClose: 79980.00,
    change24h: 455.80,
    change24hPercent: 0.57,
    high24h: 80600.00,
    low24h: 79850.00,
    volume: '150M',
    marketCap: 'Benchmark',
    description: 'BSE benchmark index tracking 30 established and financially sound companies listed on BSE.',
    history1D: generateHistory(80435.80, 320, 0.004, 15),
    history1W: generateHistory(80435.80, 350, 0.008, 30),
    history1M: generateHistory(80435.80, 400, 0.012, 60),
    history3M: generateDailyHistory(80435.80, 120, 0.03),
    history1Y: generateDailyHistory(80435.80, 365, 0.04),
    orderBook: generateOrderBook(80435.80)
  }
];

export const generateMockStock = (symbol: string, name: string): StockInstrument => {
  const basePrice = 100 + Math.random() * 900;
  return {
    symbol,
    name,
    yahooSymbol: symbol + '.NS',
    category: 'Tech',
    price: basePrice,
    previousClose: basePrice * 0.99,
    change24h: basePrice * 0.01,
    change24hPercent: 1.0,
    high24h: basePrice * 1.05,
    low24h: basePrice * 0.95,
    volume: '1M',
    marketCap: '10B',
    description: 'Simulated data for ' + name,
    isSimulated: true,
    history1D: generateHistory(basePrice, 320, 0.01, 15),
    history1W: generateHistory(basePrice, 350, 0.02, 30),
    history1M: generateHistory(basePrice, 400, 0.03, 60),
    history3M: generateDailyHistory(basePrice, 120, 0.03),
    history1Y: generateDailyHistory(basePrice, 365, 0.04),
    orderBook: generateOrderBook(basePrice)
  };
};
