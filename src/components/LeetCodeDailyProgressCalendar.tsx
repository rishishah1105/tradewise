import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { toDateKey } from '../utils/dateKeys';

interface LeetCodeDailyProgressCalendarProps {
  onClaimStreak?: () => void;
  className?: string;
  isCompact?: boolean;
}

export const LeetCodeDailyProgressCalendar: React.FC<LeetCodeDailyProgressCalendarProps> = ({
  onClaimStreak,
  className = '',
  isCompact = false,
}) => {
  const { user } = useApp();
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [timeLeftStr, setTimeLeftStr] = useState<string>('00:00:00');

  // Live countdown to midnight (local time)
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
      const diffMs = Math.max(0, midnight.getTime() - now.getTime());

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      setTimeLeftStr(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const today = new Date();
  const todayKey = toDateKey(today);
  const isViewingCurrentMonth =
    currentDate.getFullYear() === today.getFullYear() &&
    currentDate.getMonth() === today.getMonth();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed
  const monthNum = month + 1;
  const monthShort = currentDate.toLocaleString('en-US', { month: 'short' }).toUpperCase();

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Generate calendar days for Sunday-first (0=Sun, 1=Mon, ..., 6=Sat)
  const calendarDays = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday

    const days: ({
      day: number;
      dateKey: string;
      isToday: boolean;
      isPast: boolean;
      isFuture: boolean;
      hasActivity: boolean;
    } | null)[] = [];

    // Empty cells for leading days
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }

    const activityLog = user.activityLog || {};

    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      const dateKey = toDateKey(dateObj);
      const isToday = dateKey === todayKey;
      const isPast = dateObj < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const isFuture = dateObj > new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const hasActivity = (activityLog[dateKey] || 0) > 0;

      days.push({
        day: d,
        dateKey,
        isToday,
        isPast,
        isFuture,
        hasActivity,
      });
    }

    return days;
  }, [year, month, todayKey, user.activityLog]);

  const activeDaysCount = useMemo(() => {
    return calendarDays.reduce((acc, cell) => {
      if (cell && cell.hasActivity) return acc + 1;
      return acc;
    }, 0);
  }, [calendarDays]);

  const isTodayClaimed = Boolean(user.lastCheckInDate && user.lastCheckInDate === todayKey);

  return (
    <div
      className={`bg-[#141A26] border border-slate-800 rounded-2xl shadow-2xl p-4 select-none ${
        isCompact ? 'w-72' : 'w-80'
      } ${className}`}
    >
      {/* Header matching LeetCode screenshot */}
      <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-baseline gap-2">
          <span className="text-base font-bold text-brand-light">
            Day {today.getDate()}
          </span>
          {isViewingCurrentMonth && (
            <span className="text-[11px] font-mono text-brand-muted/90">
              {timeLeftStr} left
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Month Navigation Chevrons */}
          <div className="flex items-center gap-1 text-brand-muted">
            <button
              type="button"
              onClick={handlePrevMonth}
              title="Previous Month"
              className="p-1 rounded-md hover:bg-slate-800/80 hover:text-brand-light transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              title="Next Month"
              className="p-1 rounded-md hover:bg-slate-800/80 hover:text-brand-light transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Month Badge e.g. 10 OCT (LeetCode style) */}
          <div className="px-2 py-0.5 rounded-md bg-[#1B2333] border border-blue-500/30 text-blue-400 font-extrabold text-[10px] tracking-wider flex items-center gap-1 shadow-inner">
            <span className="text-blue-300 font-bold">{monthNum}</span>
            <span className="text-[9px] text-slate-300">{monthShort}</span>
          </div>
        </div>
      </div>

      {/* Weekday row: S M T W T F S */}
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400 mb-2">
        <span>S</span>
        <span>M</span>
        <span>T</span>
        <span>W</span>
        <span>T</span>
        <span>F</span>
        <span>S</span>
      </div>

      {/* Month Days Grid */}
      <div className="grid grid-cols-7 gap-y-2 gap-x-1 justify-items-center items-center">
        {calendarDays.map((cell, idx) => {
          if (!cell) {
            return <div key={`empty-${idx}`} className="w-7 h-7" />;
          }

          // Case 1: Today -> Green circle badge with white number
          if (cell.isToday) {
            return (
              <div
                key={cell.dateKey}
                title={`Today (${cell.dateKey}): ${cell.hasActivity ? 'Active' : 'Not yet active'}`}
                className="w-7 h-7 rounded-full bg-[#10b981] text-white font-extrabold flex items-center justify-center text-xs shadow-md shadow-emerald-500/30 scale-105"
              >
                {cell.day}
              </div>
            );
          }

          // Case 2: Past or Present Active Day -> Circular blue checkmark icon
          if (cell.hasActivity) {
            return (
              <div
                key={cell.dateKey}
                title={`${cell.dateKey}: Activity completed ✓`}
                className="w-7 h-7 rounded-full border-2 border-[#1E88E5] text-[#1E88E5] flex items-center justify-center hover:bg-blue-500/10 transition-colors"
              >
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
            );
          }

          // Case 3: Past day with no activity -> gray number with red dot below
          if (cell.isPast) {
            return (
              <div
                key={cell.dateKey}
                title={`${cell.dateKey}: Missed / No activity`}
                className="w-7 h-7 flex flex-col items-center justify-center relative text-slate-400 text-xs font-medium"
              >
                <span>{cell.day}</span>
                <span className="w-1 h-1 rounded-full bg-[#ef4444] absolute bottom-0.5" />
              </div>
            );
          }

          // Case 4: Future day -> muted gray number
          return (
            <div
              key={cell.dateKey}
              className="w-7 h-7 flex items-center justify-center text-slate-600 text-xs font-normal"
            >
              {cell.day}
            </div>
          );
        })}
      </div>

      {/* Footer / Summary */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-brand-light">{activeDaysCount}</span> active {activeDaysCount === 1 ? 'day' : 'days'}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-amber-400 font-bold">🔥 {user.streak}d streak</span>
          {onClaimStreak && !isTodayClaimed && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClaimStreak();
              }}
              className="px-2 py-0.5 rounded-md bg-brand-orange text-brand-black text-[10px] font-bold hover:bg-brand-orange/90 transition-all cursor-pointer"
            >
              Claim
            </button>
          )}
          {isTodayClaimed && (
            <span className="text-emerald-400 font-bold text-[10px] flex items-center gap-1">
              <Check className="w-3 h-3" /> Claimed
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
