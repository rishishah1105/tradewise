import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { toDateKey } from '../utils/dateKeys';

interface DayCell {
  day: number;
  dateKey: string;
  dateLabel: string;
  count: number;
  isToday: boolean;
  isFuture: boolean;
}

interface MonthBlock {
  year: number;
  month: number;
  monthName: string;
  weeks: (DayCell | null)[][];
}

const CELL_COLORS = [
  '#222B3A', // 0: Sleek dark graphite (seamless blend)
  '#14532d', // 1: Forest green
  '#16a34a', // 2: Medium emerald
  '#22c55e', // 3: Vibrant green
  '#4ade80', // >= 4: Bright mint green (LeetCode style)
];

const getCellColor = (count: number): string => {
  if (count <= 0) return CELL_COLORS[0];
  if (count === 1) return CELL_COLORS[1];
  if (count === 2) return CELL_COLORS[2];
  if (count === 3) return CELL_COLORS[3];
  return CELL_COLORS[4];
};

export const ActivityHeatmap: React.FC = () => {
  const { user } = useApp();
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

  const { monthBlocks, totalActivities, activeDays, maxStreak } = useMemo(() => {
    const activityLog = user.activityLog || {};
    const today = new Date();
    const todayKey = toDateKey(today);

    // Build the 12 month blocks ending with the current month
    const blocks: MonthBlock[] = [];
    const earliestDate = new Date(today.getFullYear(), today.getMonth() - 11, 1);

    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const year = monthDate.getFullYear();
      const month = monthDate.getMonth();
      const monthName = monthDate.toLocaleString('en-US', { month: 'short' });

      const daysInMonth = new Date(year, month + 1, 0).getDate();
      // Monday is 0, Sunday is 6
      const firstDayWeekday = (new Date(year, month, 1).getDay() + 6) % 7;

      const weeks: (DayCell | null)[][] = [];
      let currentWeek: (DayCell | null)[] = [];

      // Add leading empty placeholders for week 0
      for (let p = 0; p < firstDayWeekday; p++) {
        currentWeek.push(null);
      }

      for (let day = 1; day <= daysInMonth; day++) {
        const d = new Date(year, month, day);
        const dateKey = toDateKey(d);
        const isFuture = d > today;
        const count = isFuture ? 0 : (activityLog[dateKey] || 0);
        const dateLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        currentWeek.push({
          day,
          dateKey,
          dateLabel,
          count,
          isToday: dateKey === todayKey,
          isFuture
        });

        if (currentWeek.length === 7) {
          weeks.push(currentWeek);
          currentWeek = [];
        }
      }

      if (currentWeek.length > 0) {
        while (currentWeek.length < 7) {
          currentWeek.push(null);
        }
        weeks.push(currentWeek);
      }

      blocks.push({
        year,
        month,
        monthName,
        weeks
      });
    }

    // Calculate stats in the 12-month window
    let total = 0;
    let active = 0;
    let currentStreak = 0;
    let maxStrk = 0;

    for (let d = new Date(earliestDate); d <= today; d.setDate(d.getDate() + 1)) {
      const key = toDateKey(d);
      const c = activityLog[key] || 0;
      total += c;
      if (c > 0) {
        active++;
        currentStreak++;
        if (currentStreak > maxStrk) {
          maxStrk = currentStreak;
        }
      } else {
        currentStreak = 0;
      }
    }

    return {
      monthBlocks: blocks,
      totalActivities: total,
      activeDays: active,
      maxStreak: maxStrk
    };
  }, [user.activityLog]);

  const handleCellMouseEnter = (
    e: React.MouseEvent<HTMLDivElement>,
    cell: DayCell
  ) => {
    if (!containerRef.current) return;
    const cellRect = e.currentTarget.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();

    const x = cellRect.left - containerRect.left + cellRect.width / 2;
    const y = cellRect.top - containerRect.top;

    const text =
      cell.count > 0
        ? `${cell.count} ${cell.count === 1 ? 'activity' : 'activities'} on ${cell.dateLabel}`
        : `No activity on ${cell.dateLabel}`;

    setTooltip({ text, x, y });
  };

  const handleCellMouseLeave = () => {
    setTooltip(null);
  };

  return (
    <div
      ref={containerRef}
      className="bg-brand-card border border-slate-800/80 rounded-xl p-6 shadow-xl space-y-5 relative"
    >
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="text-sm">
          <strong className="text-brand-light font-bold text-base mr-1">{totalActivities}</strong>
          <span className="text-brand-muted">activities in the past one year</span>
        </div>
        <div className="text-xs text-brand-muted">
          Total active days: <strong className="text-brand-light font-semibold">{activeDays}</strong> · Max streak: <strong className="text-brand-light font-semibold">{maxStreak}</strong>
        </div>
      </div>

      {/* Grid Container */}
      <div className="overflow-x-auto py-2 flex justify-center w-full">
        <div className="min-w-max flex items-start gap-2.5">
          {monthBlocks.map((block) => (
            <div key={`${block.year}-${block.month}`} className="flex flex-col items-center">
              {/* Month Weeks Grid */}
              <div className="flex gap-[3.5px]">
                {block.weeks.map((week, wIdx) => (
                  <div key={wIdx} className="flex flex-col gap-[3.5px]">
                    {week.map((cell, dIdx) => {
                      if (!cell || cell.isFuture) {
                        return (
                          <div
                            key={dIdx}
                            className="w-[14px] h-[14px] opacity-0 pointer-events-none"
                          />
                        );
                      }

                      return (
                        <div
                          key={cell.dateKey}
                          onMouseEnter={(e) => handleCellMouseEnter(e, cell)}
                          onMouseLeave={handleCellMouseLeave}
                          style={{ backgroundColor: getCellColor(cell.count) }}
                          className={`w-[14px] h-[14px] rounded-[3.5px] cursor-pointer transition-transform hover:scale-110 ${
                            cell.isToday ? 'outline outline-1 outline-white/70 ring-1 ring-emerald-400/40' : ''
                          }`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Month Label */}
              <span className="text-[11px] text-brand-muted text-center pt-2.5 font-medium tracking-tight">
                {block.monthName}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Tooltip */}
      {tooltip && (
        <div
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y - 8}px`,
            transform: 'translate(-50%, -100%)',
          }}
          className="absolute z-50 bg-[#0E131F] border border-slate-700/80 text-[11px] text-brand-light px-2.5 py-1.5 rounded-lg shadow-2xl pointer-events-none whitespace-nowrap"
        >
          {tooltip.text}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-end gap-1.5 text-xs text-brand-muted pt-3 border-t border-slate-800/80">
        <span className="mr-1 text-[11px]">Less</span>
        {CELL_COLORS.map((color, idx) => (
          <div
            key={idx}
            style={{ backgroundColor: color }}
            className="w-[14px] h-[14px] rounded-[3.5px]"
          />
        ))}
        <span className="ml-1 text-[11px]">More</span>
      </div>
    </div>
  );
};
