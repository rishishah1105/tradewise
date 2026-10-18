import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import type { CandlestickPoint } from '../data/stocksData';
import { ZoomIn, ZoomOut, RotateCcw, Move, FastForward, Clock } from 'lucide-react';

interface TradingChartProps {
  data: CandlestickPoint[];
  type: 'candlestick' | 'line' | 'area' | 'bar' | 'step';
  showSMA: boolean;
  showEMA: boolean;
  showBollinger: boolean;
  showRSI: boolean;
  showMACD: boolean;
}

export const parsePointDate = (timeVal: number | string): Date | null => {
  if (typeof timeVal === 'number') {
    return new Date(timeVal * (timeVal < 10000000000 ? 1000 : 1));
  }
  if (!isNaN(Number(timeVal))) {
    const n = Number(timeVal);
    return new Date(n * (n < 10000000000 ? 1000 : 1));
  }
  const parsed = Date.parse(timeVal);
  if (!isNaN(parsed)) return new Date(parsed);
  return null;
};

export const formatTimeAxisLabel = (timeVal: number | string, visibleCount: number): string => {
  const d = parsePointDate(timeVal);
  if (!d) return String(timeVal);
  if (visibleCount <= 25) {
    return `${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} ${d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
  }
  if (visibleCount <= 75) {
    return `${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} ${d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
  }
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

export const formatDetailedTimestamp = (timeVal: number | string): string => {
  const d = parsePointDate(timeVal);
  if (!d) return String(timeVal);
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export const TradingChart: React.FC<TradingChartProps> = ({
  data,
  type,
  showSMA,
  showEMA,
  showBollinger,
  showRSI,
  showMACD,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Local chart points array allowing seamless historical prepending
  const [chartPoints, setChartPoints] = useState<CandlestickPoint[]>(data || []);
  const isPrependingRef = useRef(false);

  // Zoom & Pan state: { start, end } index in data array
  const [viewRange, setViewRange] = useState<{ start: number; end: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartXRef = useRef<number>(0);
  const dragStartRangeRef = useRef<{ start: number; end: number }>({ start: 0, end: 0 });

  // Hover crosshair state
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  // Reset view range when data array changes or timeframe changes
  useEffect(() => {
    if (data && data.length > 0) {
      setChartPoints(data);
      // Default to showing the most recent 45-50 candles so the current price is prominent
      // and plenty of historical candles exist to the left for the user to pan into
      const defaultVisible = Math.min(50, Math.max(25, Math.floor(data.length * 0.2)));
      setViewRange({
        start: Math.max(0, data.length - defaultVisible),
        end: data.length - 1,
      });
    }
  }, [data]);

  // Infinite Earlier History Prepend Handler
  const handlePrependOlderCandles = useCallback(() => {
    if (isPrependingRef.current || chartPoints.length === 0) return;
    isPrependingRef.current = true;

    const firstPoint = chartPoints[0];
    const secondPoint = chartPoints[1] || chartPoints[0];

    let intervalSeconds = 900;
    const t0 = parsePointDate(firstPoint.time)?.getTime();
    const t1 = parsePointDate(secondPoint.time)?.getTime();
    if (t0 && t1 && t0 !== t1) {
      intervalSeconds = Math.max(60, Math.round(Math.abs(t1 - t0) / 1000));
    }

    const countToPrepend = 50;
    const newOlderPoints: CandlestickPoint[] = [];
    let curPrice = firstPoint.open;
    const baseTimeMs = t0 || Date.now();

    for (let i = countToPrepend; i >= 1; i--) {
      const ts = Math.floor((baseTimeMs - i * intervalSeconds * 1000) / 1000);
      const change = (Math.random() - 0.49) * 0.012 * curPrice;
      const open = curPrice;
      const close = Math.max(1, open + change);
      const high = Math.max(open, close) + Math.random() * 0.006 * curPrice;
      const low = Math.min(open, close) - Math.random() * 0.006 * curPrice;
      const volume = Math.floor(Math.random() * 50000 + 10000);

      newOlderPoints.push({
        time: ts,
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2)),
        volume,
      });
      curPrice = close;
    }

    setChartPoints((prev) => [...newOlderPoints, ...prev]);
    setViewRange((prev) => {
      if (!prev) return null;
      return {
        start: prev.start + countToPrepend,
        end: prev.end + countToPrepend,
      };
    });

    setTimeout(() => {
      isPrependingRef.current = false;
    }, 400);
  }, [chartPoints]);

  // Compute effective visible range
  const totalPoints = chartPoints?.length || 0;
  const startIndex = viewRange ? Math.max(0, Math.min(totalPoints - 2, viewRange.start)) : 0;
  const endIndex = viewRange ? Math.max(startIndex + 1, Math.min(totalPoints - 1, viewRange.end)) : Math.max(0, totalPoints - 1);
  const visibleCount = Math.max(1, endIndex - startIndex + 1);
  const isZoomed = totalPoints > 0 && (startIndex > 0 || endIndex < totalPoints - 1);
  const isViewingPast = totalPoints > 0 && endIndex < totalPoints - 8;

  // Zoom In / Out handlers (programmatic & button)
  const handleZoom = useCallback((zoomIn: boolean, focusRatio = 0.5) => {
    if (!chartPoints || chartPoints.length < 5) return;
    const total = chartPoints.length;

    setViewRange((prev) => {
      const curStart = prev ? prev.start : 0;
      const curEnd = prev ? prev.end : total - 1;
      const curCount = curEnd - curStart + 1;

      const factor = zoomIn ? 0.75 : 1.35;
      let newCount = Math.round(curCount * factor);
      newCount = Math.max(6, Math.min(total, newCount));

      if (newCount === curCount) return prev;

      const diff = newCount - curCount;
      const leftChange = Math.round(diff * focusRatio);
      const rightChange = diff - leftChange;

      let newStart = curStart - leftChange;
      let newEnd = curEnd + rightChange;

      if (newStart < 0) {
        newEnd = Math.min(total - 1, newEnd + (0 - newStart));
        newStart = 0;
      }
      if (newEnd >= total) {
        newStart = Math.max(0, newStart - (newEnd - (total - 1)));
        newEnd = total - 1;
      }

      return {
        start: Math.max(0, Math.min(total - newCount, newStart)),
        end: Math.min(total - 1, Math.max(newCount - 1, newEnd)),
      };
    });
  }, [chartPoints]);

  const handleResetZoom = useCallback(() => {
    if (chartPoints && chartPoints.length > 0) {
      setViewRange({ start: 0, end: chartPoints.length - 1 });
    }
  }, [chartPoints]);

  // Quick Historical Horizon Jumpers
  const handleJumpToLive = useCallback(() => {
    if (chartPoints.length === 0) return;
    const count = 45;
    setViewRange({
      start: Math.max(0, chartPoints.length - count),
      end: chartPoints.length - 1,
    });
  }, [chartPoints]);

  const handleJumpToHistory = useCallback((barsAgo: number) => {
    if (chartPoints.length === 0) return;
    const total = chartPoints.length;
    const windowSize = Math.min(45, total);
    const targetEnd = Math.max(windowSize - 1, total - 1 - barsAgo);
    const targetStart = Math.max(0, targetEnd - windowSize + 1);
    setViewRange({
      start: targetStart,
      end: targetEnd,
    });
  }, [chartPoints]);

  const handleZoomFullHistory = useCallback(() => {
    if (chartPoints.length === 0) return;
    setViewRange({
      start: 0,
      end: chartPoints.length - 1,
    });
  }, [chartPoints]);

  // Mouse Wheel listener attached directly to canvas with passive: false to prevent document scroll
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const chartWidth = Math.max(1, rect.width - 75);
      const ratio = Math.max(0, Math.min(1, mouseX / chartWidth));

      const zoomIn = e.deltaY < 0;
      handleZoom(zoomIn, ratio);
    };

    canvas.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      canvas.removeEventListener('wheel', onWheel);
    };
  }, [handleZoom]);

  // Technical Indicators Calculation across entire dataset
  const indicators = useMemo(() => {
    if (!chartPoints || chartPoints.length === 0) {
      return { sma20: [], sma50: [], sma200: [], ema20: [], bbUpper: [], bbLower: [], rsi: [], macd: [] };
    }

    const closes = chartPoints.map(d => d.close);
    const len = chartPoints.length;

    const calcSMA = (period: number) => {
      const arr: (number | null)[] = new Array(len).fill(null);
      for (let i = period - 1; i < len; i++) {
        let sum = 0;
        for (let j = 0; j < period; j++) sum += closes[i - j];
        arr[i] = sum / period;
      }
      return arr;
    };

    const calcEMA = (period: number) => {
      const arr: (number | null)[] = new Array(len).fill(null);
      const k = 2 / (period + 1);
      let ema = closes[0];
      for (let i = 0; i < len; i++) {
        ema = (closes[i] - ema) * k + ema;
        if (i >= period - 1) arr[i] = ema;
      }
      return arr;
    };

    const sma20 = calcSMA(20);
    const bbUpper: (number | null)[] = new Array(len).fill(null);
    const bbLower: (number | null)[] = new Array(len).fill(null);
    for (let i = 19; i < len; i++) {
      const mean = sma20[i];
      if (mean !== null) {
        let sqSum = 0;
        for (let j = 0; j < 20; j++) sqSum += Math.pow(closes[i - j] - mean, 2);
        const std = Math.sqrt(sqSum / 20);
        bbUpper[i] = mean + 2 * std;
        bbLower[i] = mean - 2 * std;
      }
    }

    const rsi: (number | null)[] = new Array(len).fill(null);
    if (len > 14) {
      let gains = 0, losses = 0;
      for (let i = 1; i <= 14; i++) {
        const diff = closes[i] - closes[i - 1];
        if (diff >= 0) gains += diff;
        else losses -= diff;
      }
      let avgGain = gains / 14;
      let avgLoss = losses / 14;

      for (let i = 14; i < len; i++) {
        if (i > 14) {
          const diff = closes[i] - closes[i - 1];
          avgGain = (avgGain * 13 + (diff >= 0 ? diff : 0)) / 14;
          avgLoss = (avgLoss * 13 + (diff < 0 ? -diff : 0)) / 14;
        }
        const rs = avgGain / (avgLoss === 0 ? 1 : avgLoss);
        rsi[i] = 100 - (100 / (1 + rs));
      }
    }

    const ema12 = calcEMA(12);
    const ema26 = calcEMA(26);
    const macdLine: (number | null)[] = new Array(len).fill(null);
    for (let i = 25; i < len; i++) {
      if (ema12[i] !== null && ema26[i] !== null) {
        macdLine[i] = (ema12[i] as number) - (ema26[i] as number);
      }
    }

    const macdSignal: (number | null)[] = new Array(len).fill(null);
    const kSig = 2 / (9 + 1);
    let sigEma: number | null = null;
    for (let i = 25; i < len; i++) {
      const val = macdLine[i];
      if (val !== null) {
        if (sigEma === null) sigEma = val;
        else sigEma = (val - sigEma) * kSig + sigEma;
        if (i >= 25 + 8) macdSignal[i] = sigEma;
      }
    }

    const macdHist: (number | null)[] = new Array(len).fill(null);
    for (let i = 0; i < len; i++) {
      if (macdLine[i] !== null && macdSignal[i] !== null) {
        macdHist[i] = (macdLine[i] as number) - (macdSignal[i] as number);
      }
    }

    return {
      sma20,
      sma50: calcSMA(50),
      sma200: calcSMA(200),
      ema20: calcEMA(20),
      bbUpper,
      bbLower,
      rsi,
      macd: macdHist.map((h, i) => ({ line: macdLine[i], signal: macdSignal[i], hist: h })),
    };
  }, [chartPoints]);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !chartPoints || chartPoints.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.save();
    ctx.scale(dpr, dpr);

    // Margins
    const paddingRight = 75; // Price scale width
    const paddingBottom = 26; // Time scale height
    const paddingTop = 36; // Top HUD clearance

    const subPaneHeight = (showRSI || showMACD) ? (showRSI && showMACD ? 70 : 90) : 0;
    const chartHeight = Math.max(60, height - paddingTop - paddingBottom - subPaneHeight * (Number(showRSI) + Number(showMACD)));
    const chartWidth = Math.max(10, width - paddingRight);

    // Background
    ctx.fillStyle = '#0B0F17';
    ctx.fillRect(0, 0, width, height);

    // Dynamic Price Min/Max scaled exclusively to currently visible window
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let maxVolume = 0;

    for (let i = startIndex; i <= endIndex; i++) {
      const d = chartPoints[i];
      if (d) {
        minPrice = Math.min(minPrice, d.low);
        maxPrice = Math.max(maxPrice, d.high);
        maxVolume = Math.max(maxVolume, d.volume);

        if (showSMA) {
          if (indicators.sma20[i]) { minPrice = Math.min(minPrice, indicators.sma20[i]!); maxPrice = Math.max(maxPrice, indicators.sma20[i]!); }
          if (indicators.sma50[i]) { minPrice = Math.min(minPrice, indicators.sma50[i]!); maxPrice = Math.max(maxPrice, indicators.sma50[i]!); }
        }
        if (showBollinger) {
          if (indicators.bbUpper[i]) maxPrice = Math.max(maxPrice, indicators.bbUpper[i]!);
          if (indicators.bbLower[i]) minPrice = Math.min(minPrice, indicators.bbLower[i]!);
        }
      }
    }

    if (!isFinite(minPrice) || !isFinite(maxPrice) || minPrice === maxPrice) {
      minPrice = (chartPoints[0]?.close || 100) * 0.95;
      maxPrice = (chartPoints[0]?.close || 100) * 1.05;
    }

    const priceRange = maxPrice - minPrice || 1;
    minPrice -= priceRange * 0.02;
    maxPrice += priceRange * 0.02;
    const adjustedRange = maxPrice - minPrice;

    // Coordinate Mappers
    const candleSpacing = chartWidth / visibleCount;
    const candleWidth = Math.max(2, Math.min(32, candleSpacing * 0.72));

    const getX = (index: number) => (index - startIndex) * candleSpacing + candleSpacing / 2;
    const getY = (price: number) => paddingTop + chartHeight - ((price - minPrice) / adjustedRange) * chartHeight;

    // 1. Grid Lines
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#1e293b';
    ctx.setLineDash([]);

    // Horizontal Price Grid
    const gridSteps = 6;
    for (let i = 0; i <= gridSteps; i++) {
      const p = minPrice + (adjustedRange / gridSteps) * i;
      const y = getY(p);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(chartWidth, y);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(p.toFixed(2), chartWidth + 8, y + 3);
    }

    // Vertical Time Grid
    const timeSteps = Math.min(visibleCount, Math.max(3, Math.floor(chartWidth / 100)));
    for (let i = 0; i < timeSteps; i++) {
      const idx = Math.floor(startIndex + (visibleCount - 1) * (i / (timeSteps - 1)));
      const x = getX(idx);

      ctx.beginPath();
      ctx.moveTo(x, paddingTop);
      ctx.lineTo(x, paddingTop + chartHeight);
      ctx.stroke();

      const point = chartPoints[idx];
      if (point) {
        const timeLabel = formatTimeAxisLabel(point.time, visibleCount);
        ctx.fillStyle = '#64748b';
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(timeLabel, x, height - 8);
      }
    }

    // 2. Volume Histogram (bottom 18% of main chart)
    const volHeight = chartHeight * 0.18;
    for (let i = startIndex; i <= endIndex; i++) {
      const d = chartPoints[i];
      if (!d) continue;
      const x = getX(i);
      const isUp = d.close >= d.open;
      const barH = maxVolume > 0 ? (d.volume / maxVolume) * volHeight : 0;
      const y = paddingTop + chartHeight - barH;

      ctx.fillStyle = isUp ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)';
      ctx.fillRect(x - candleWidth / 2, y, candleWidth, barH);
    }

    // 3. Technical Indicator Overlays
    if (showBollinger) {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(147, 51, 234, 0.45)';
      ctx.lineWidth = 1;
      let first = true;
      for (let i = startIndex; i <= endIndex; i++) {
        const val = indicators.bbUpper[i];
        if (val !== null) {
          const x = getX(i);
          const y = getY(val);
          if (first) { ctx.moveTo(x, y); first = false; } else { ctx.lineTo(x, y); }
        }
      }
      ctx.stroke();

      ctx.beginPath();
      ctx.strokeStyle = 'rgba(147, 51, 234, 0.45)';
      first = true;
      for (let i = startIndex; i <= endIndex; i++) {
        const val = indicators.bbLower[i];
        if (val !== null) {
          const x = getX(i);
          const y = getY(val);
          if (first) { ctx.moveTo(x, y); first = false; } else { ctx.lineTo(x, y); }
        }
      }
      ctx.stroke();
    }

    if (showSMA) {
      // SMA 20 (Amber)
      ctx.beginPath();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      let first = true;
      for (let i = startIndex; i <= endIndex; i++) {
        const val = indicators.sma20[i];
        if (val !== null) {
          const x = getX(i);
          const y = getY(val);
          if (first) { ctx.moveTo(x, y); first = false; } else { ctx.lineTo(x, y); }
        }
      }
      ctx.stroke();

      // SMA 50 (Sky Blue)
      ctx.beginPath();
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.5;
      first = true;
      for (let i = startIndex; i <= endIndex; i++) {
        const val = indicators.sma50[i];
        if (val !== null) {
          const x = getX(i);
          const y = getY(val);
          if (first) { ctx.moveTo(x, y); first = false; } else { ctx.lineTo(x, y); }
        }
      }
      ctx.stroke();
    }

    if (showEMA) {
      // EMA 20 (Pink / Rose)
      ctx.beginPath();
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 1.5;
      let first = true;
      for (let i = startIndex; i <= endIndex; i++) {
        const val = indicators.ema20[i];
        if (val !== null) {
          const x = getX(i);
          const y = getY(val);
          if (first) { ctx.moveTo(x, y); first = false; } else { ctx.lineTo(x, y); }
        }
      }
      ctx.stroke();
    }

    // 4. Main Series Drawing
    if (type === 'candlestick' || type === 'bar') {
      for (let i = startIndex; i <= endIndex; i++) {
        const d = chartPoints[i];
        if (!d) continue;

        const x = getX(i);
        const isUp = d.close >= d.open;
        const color = isUp ? '#10b981' : '#ef4444';

        const openY = getY(d.open);
        const closeY = getY(d.close);
        const highY = getY(d.high);
        const lowY = getY(d.low);

        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 1.2;

        if (type === 'candlestick') {
          // Upper & Lower Wicks
          ctx.beginPath();
          ctx.moveTo(x, highY);
          ctx.lineTo(x, lowY);
          ctx.stroke();

          // Candle Body
          const top = Math.min(openY, closeY);
          const bodyH = Math.max(1.5, Math.abs(closeY - openY));
          ctx.fillRect(x - candleWidth / 2, top, candleWidth, bodyH);
        } else {
          // OHLC Bar
          ctx.beginPath();
          ctx.moveTo(x, highY);
          ctx.lineTo(x, lowY);
          ctx.stroke();

          // Left tick (Open)
          ctx.beginPath();
          ctx.moveTo(x - candleWidth / 2, openY);
          ctx.lineTo(x, openY);
          ctx.stroke();

          // Right tick (Close)
          ctx.beginPath();
          ctx.moveTo(x, closeY);
          ctx.lineTo(x + candleWidth / 2, closeY);
          ctx.stroke();
        }
      }
    } else if (type === 'line' || type === 'area') {
      ctx.beginPath();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;

      let first = true;
      for (let i = startIndex; i <= endIndex; i++) {
        const d = chartPoints[i];
        if (!d) continue;
        const x = getX(i);
        const y = getY(d.close);
        if (first) { ctx.moveTo(x, y); first = false; } else { ctx.lineTo(x, y); }
      }
      ctx.stroke();

      if (type === 'area') {
        const lastX = getX(endIndex);
        const firstX = getX(startIndex);
        const baseBottomY = paddingTop + chartHeight;

        ctx.lineTo(lastX, baseBottomY);
        ctx.lineTo(firstX, baseBottomY);
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, paddingTop, 0, baseBottomY);
        grad.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
        grad.addColorStop(1, 'rgba(56, 189, 248, 0.00)');
        ctx.fillStyle = grad;
        ctx.fill();
      }
    }

    // 5. RSI Sub-Pane
    let currentYOffset = paddingTop + chartHeight + 10;
    if (showRSI) {
      const rsiH = (showRSI && showMACD ? 60 : 80);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, currentYOffset, chartWidth, rsiH);
      ctx.strokeStyle = '#334155';
      ctx.strokeRect(0, currentYOffset, chartWidth, rsiH);

      // Overbought 70 & Oversold 30 levels
      const y70 = currentYOffset + rsiH * 0.3;
      const y30 = currentYOffset + rsiH * 0.7;
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = '#475569';

      ctx.beginPath(); ctx.moveTo(0, y70); ctx.lineTo(chartWidth, y70); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, y30); ctx.lineTo(chartWidth, y30); ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px JetBrains Mono, monospace';
      ctx.textAlign = 'left';
      ctx.fillText('RSI (14)', 6, currentYOffset + 12);
      ctx.fillText('70', chartWidth + 8, y70 + 3);
      ctx.fillText('30', chartWidth + 8, y30 + 3);

      // RSI Line
      ctx.beginPath();
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 1.5;
      let first = true;
      for (let i = startIndex; i <= endIndex; i++) {
        const val = indicators.rsi[i];
        if (val !== null) {
          const x = getX(i);
          const y = currentYOffset + rsiH - (val / 100) * rsiH;
          if (first) { ctx.moveTo(x, y); first = false; } else { ctx.lineTo(x, y); }
        }
      }
      ctx.stroke();
      currentYOffset += rsiH + 10;
    }

    // 6. MACD Sub-Pane
    if (showMACD) {
      const macdH = (showRSI && showMACD ? 60 : 80);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, currentYOffset, chartWidth, macdH);
      ctx.strokeStyle = '#334155';
      ctx.strokeRect(0, currentYOffset, chartWidth, macdH);

      let maxAbs = 0.5;
      for (let i = startIndex; i <= endIndex; i++) {
        const m = indicators.macd[i];
        if (m) {
          if (m.line !== null) maxAbs = Math.max(maxAbs, Math.abs(m.line));
          if (m.signal !== null) maxAbs = Math.max(maxAbs, Math.abs(m.signal));
          if (m.hist !== null) maxAbs = Math.max(maxAbs, Math.abs(m.hist));
        }
      }

      const zeroY = currentYOffset + macdH / 2;
      ctx.strokeStyle = '#334155';
      ctx.beginPath(); ctx.moveTo(0, zeroY); ctx.lineTo(chartWidth, zeroY); ctx.stroke();

      // Histogram
      for (let i = startIndex; i <= endIndex; i++) {
        const m = indicators.macd[i];
        if (m && m.hist !== null) {
          const x = getX(i);
          const h = (m.hist / maxAbs) * (macdH / 2);
          ctx.fillStyle = m.hist >= 0 ? '#10b981' : '#ef4444';
          ctx.fillRect(x - candleWidth / 2, zeroY - h, candleWidth, h);
        }
      }

      // MACD Line (Blue)
      ctx.beginPath();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.2;
      let first = true;
      for (let i = startIndex; i <= endIndex; i++) {
        const m = indicators.macd[i];
        if (m && m.line !== null) {
          const x = getX(i);
          const y = zeroY - (m.line / maxAbs) * (macdH / 2);
          if (first) { ctx.moveTo(x, y); first = false; } else { ctx.lineTo(x, y); }
        }
      }
      ctx.stroke();

      // Signal Line (Orange)
      ctx.beginPath();
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 1.2;
      first = true;
      for (let i = startIndex; i <= endIndex; i++) {
        const m = indicators.macd[i];
        if (m && m.signal !== null) {
          const x = getX(i);
          const y = zeroY - (m.signal / maxAbs) * (macdH / 2);
          if (first) { ctx.moveTo(x, y); first = false; } else { ctx.lineTo(x, y); }
        }
      }
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px JetBrains Mono, monospace';
      ctx.textAlign = 'left';
      ctx.fillText('MACD (12, 26, 9)', 6, currentYOffset + 12);
    }

    // 7. Interactive Crosshair Lines & Axis Badges
    if (hoverIndex !== null && mousePos) {
      const hoveredPoint = chartPoints[hoverIndex];
      if (hoveredPoint) {
        const hx = getX(hoverIndex);
        const hy = mousePos.y;

        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;

        // Vertical line
        ctx.beginPath();
        ctx.moveTo(hx, paddingTop);
        ctx.lineTo(hx, height - paddingBottom);
        ctx.stroke();

        // Horizontal line
        if (hy >= paddingTop && hy <= paddingTop + chartHeight) {
          ctx.beginPath();
          ctx.moveTo(0, hy);
          ctx.lineTo(chartWidth, hy);
          ctx.stroke();

          const cursorPrice = minPrice + ((paddingTop + chartHeight - hy) / chartHeight) * adjustedRange;
          ctx.fillStyle = '#334155';
          ctx.fillRect(chartWidth + 2, hy - 9, 68, 18);
          ctx.fillStyle = '#f8fafc';
          ctx.font = '10px JetBrains Mono, monospace';
          ctx.textAlign = 'left';
          ctx.fillText(cursorPrice.toFixed(2), chartWidth + 6, hy + 4);
        }
        ctx.setLineDash([]);

        // Time pill on bottom axis
        const timeStr = formatDetailedTimestamp(hoveredPoint.time);

        ctx.fillStyle = '#334155';
        const pillWidth = 140;
        const pillX = Math.max(pillWidth / 2, Math.min(chartWidth - pillWidth / 2, hx));
        ctx.fillRect(pillX - pillWidth / 2, height - paddingBottom + 2, pillWidth, 18);
        ctx.fillStyle = '#f8fafc';
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(timeStr, pillX, height - paddingBottom + 14);
      }
    }

    ctx.restore();
  }, [
    chartPoints,
    type,
    showSMA,
    showEMA,
    showBollinger,
    showRSI,
    showMACD,
    hoverIndex,
    mousePos,
    indicators,
    startIndex,
    endIndex,
    visibleCount,
    totalPoints,
  ]);

  // Mouse drag & move handlers for interactive panning & inspecting
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button !== 0 || !chartPoints || chartPoints.length === 0) return;
    setIsDragging(true);
    dragStartXRef.current = e.clientX;
    dragStartRangeRef.current = { start: startIndex, end: endIndex };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !chartPoints || chartPoints.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const chartWidth = Math.max(1, rect.width - 75);

    // Pan / Drag Shift
    if (isDragging) {
      const deltaX = e.clientX - dragStartXRef.current;
      const initialStart = dragStartRangeRef.current.start;
      const initialEnd = dragStartRangeRef.current.end;
      const count = initialEnd - initialStart + 1;
      const candleWidthPx = chartWidth / count;

      const candleShift = Math.round(deltaX / candleWidthPx);
      if (candleShift !== 0) {
        const total = chartPoints.length;
        let newStart = initialStart - candleShift;
        let newEnd = initialEnd - candleShift;

        // If panning left towards earlier history and reaching start of current buffer, prepend more older bars!
        if (newStart <= 0) {
          handlePrependOlderCandles();
          newStart = 0;
          newEnd = count - 1;
        }

        if (newEnd >= total) {
          newStart = Math.max(0, total - count);
          newEnd = total - 1;
        }

        setViewRange({
          start: Math.max(0, Math.min(total - count, newStart)),
          end: Math.min(total - 1, Math.max(count - 1, newEnd)),
        });
      }
    }

    // Crosshair index lookup
    if (mouseX >= 0 && mouseX <= chartWidth) {
      const idx = startIndex + Math.floor((mouseX / chartWidth) * visibleCount);
      const clamped = Math.max(0, Math.min(chartPoints.length - 1, idx));
      setHoverIndex(clamped);
      setMousePos({ x: mouseX, y: mouseY });
    } else {
      setHoverIndex(null);
      setMousePos(null);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setHoverIndex(null);
    setMousePos(null);
  };

  // Active hover point for the HUD header
  const activePoint = hoverIndex !== null && chartPoints[hoverIndex] ? chartPoints[hoverIndex] : (chartPoints && chartPoints[chartPoints.length - 1]);
  const isUp = activePoint ? activePoint.close >= activePoint.open : true;
  const changeVal = activePoint ? activePoint.close - activePoint.open : 0;
  const changePct = activePoint && activePoint.open > 0 ? (changeVal / activePoint.open) * 100 : 0;

  const formattedTimeHUD = activePoint ? formatDetailedTimestamp(activePoint.time) : '';

  // Calculate past range label for the floating indicator
  const pastRangeLabel = useMemo(() => {
    if (!chartPoints || chartPoints.length === 0 || !viewRange) return '';
    const sPoint = chartPoints[startIndex];
    const ePoint = chartPoints[endIndex];
    if (!sPoint || !ePoint) return '';
    const sd = parsePointDate(sPoint.time);
    const ed = parsePointDate(ePoint.time);
    if (!sd || !ed) return '';
    return `${sd.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – ${ed.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}`;
  }, [chartPoints, startIndex, endIndex, viewRange]);

  return (
    <div className="w-full h-full relative select-none bg-[#0B0F17] overflow-hidden" ref={containerRef}>
      {/* Top Left Floating HUD: OHLC & Exact Timestamp */}
      {activePoint && (
        <div className="absolute top-2 left-3 z-10 flex items-center gap-2.5 text-[10px] font-mono pointer-events-none bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-md border border-slate-800 text-slate-300 shadow-xl flex-wrap">
          <div className="text-amber-400 font-bold border-r border-slate-700 pr-2 flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>{formattedTimeHUD}</span>
          </div>
          <div><span className="text-slate-500 mr-1">O:</span><span className="font-semibold text-slate-200">₹{activePoint.open.toFixed(2)}</span></div>
          <div><span className="text-slate-500 mr-1">H:</span><span className="font-semibold text-slate-200">₹{activePoint.high.toFixed(2)}</span></div>
          <div><span className="text-slate-500 mr-1">L:</span><span className="font-semibold text-slate-200">₹{activePoint.low.toFixed(2)}</span></div>
          <div><span className="text-slate-500 mr-1">C:</span><span className="font-semibold text-slate-200">₹{activePoint.close.toFixed(2)}</span></div>
          <div><span className="text-slate-500 mr-1">VOL:</span><span className="text-slate-200">{(activePoint.volume / 1000).toFixed(1)}k</span></div>
          <div className={isUp ? 'text-[#10b981]' : 'text-[#ef4444]'}>
            <span>{isUp ? '+' : ''}{changeVal.toFixed(2)} ({isUp ? '+' : ''}{changePct.toFixed(2)}%)</span>
          </div>
        </div>
      )}

      {/* Top Right Floating Toolbar: Historical Jump, Zoom & Hint */}
      <div className="absolute top-2 right-4 z-10 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-800 px-2 py-1 rounded-md text-[10px] text-slate-300 font-mono shadow-xl flex-wrap">
        {/* Quick History Horizons */}
        <div className="flex items-center gap-1 pr-1.5 border-r border-slate-700">
          <button
            onClick={handleJumpToLive}
            title="Snap view to current live prices"
            className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase transition-colors ${
              !isViewingPast ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Live
          </button>
          <button
            onClick={() => handleJumpToHistory(96)}
            title="Jump back to yesterday (24 hours ago)"
            className="px-1.5 py-0.5 rounded text-[9px] font-bold text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
          >
            -24h
          </button>
          <button
            onClick={() => handleJumpToHistory(200)}
            title="Jump back to 3 days ago"
            className="px-1.5 py-0.5 rounded text-[9px] font-bold text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
          >
            -3d
          </button>
          <button
            onClick={handleZoomFullHistory}
            title="Zoom out to show entire historical range"
            className="px-1.5 py-0.5 rounded text-[9px] font-bold text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
          >
            All
          </button>
        </div>

        {/* Zoom Controls */}
        <button
          onClick={() => handleZoom(true, 0.5)}
          title="Zoom In (or scroll wheel up)"
          className="p-1 hover:bg-slate-800 text-slate-300 hover:text-brand-light rounded transition-colors"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => handleZoom(false, 0.5)}
          title="Zoom Out (or scroll wheel down)"
          className="p-1 hover:bg-slate-800 text-slate-300 hover:text-brand-light rounded transition-colors"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        {isZoomed && (
          <button
            onClick={handleResetZoom}
            title="Reset Zoom to Full View"
            className="flex items-center gap-1 px-1.5 py-0.5 hover:bg-slate-800 text-amber-400 rounded transition-colors font-bold text-[9px] uppercase border border-amber-500/30"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>Reset</span>
          </button>
        )}
        <div className="h-3 w-px bg-slate-700 mx-0.5 hidden sm:block" />
        <span className="text-slate-400 text-[9px] items-center gap-1 hidden sm:flex">
          <Move className="w-2.5 h-2.5 text-slate-500" />
          <span>Scroll to Zoom • Drag to Pan</span>
        </span>
      </div>

      {/* Floating Bottom-Right Pill: Past Data Alert with One-Click "Jump to Live" */}
      {isViewingPast && (
        <div className="absolute bottom-8 right-20 z-20 flex items-center gap-2.5 bg-slate-900/95 backdrop-blur-md border border-amber-500/40 px-3 py-1.5 rounded-full shadow-2xl font-mono text-[11px] animate-in fade-in">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
          </span>
          <span className="text-amber-300 font-medium">Viewing Past History</span>
          {pastRangeLabel && (
            <span className="text-slate-400 text-[10px] hidden md:inline">({pastRangeLabel})</span>
          )}
          <button
            onClick={handleJumpToLive}
            className="ml-1 px-2.5 py-0.5 bg-brand-orange text-brand-black hover:bg-amber-400 font-bold rounded-full transition-all text-[10px] flex items-center gap-1 shadow"
          >
            <span>Jump to Live</span>
            <FastForward className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* High-DPI Interactive Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onDoubleClick={handleResetZoom}
        className={`w-full h-full block ${isDragging ? 'cursor-grabbing' : 'cursor-crosshair'}`}
      />
    </div>
  );
};
