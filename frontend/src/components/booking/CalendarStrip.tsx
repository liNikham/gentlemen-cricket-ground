import React from 'react';
import { DayTile } from '../../types/ground.types';

interface CalendarStripProps {
  days: DayTile[];
  selectedDate: string;
  onSelectDate: (isoStr: string) => void;
  dayNameLabel: string;
}

export const CalendarStrip: React.FC<CalendarStripProps> = ({
  days,
  selectedDate,
  onSelectDate,
  dayNameLabel,
}) => {
  return (
    <div className="flex flex-col gap-2 font-inter">
      <div className="flex items-center justify-between">
        <label className="font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1 text-xs">
          <span>📅 1. Select Date (Advance Booking - Next 30 Days)</span>
        </label>
        <span className="text-[11px] text-amber-400 font-mono font-bold">
          {dayNameLabel}
        </span>
      </div>

      {/* Interactive 30-Day Calendar Tiles Grid */}
      <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-1.5 max-h-48 overflow-y-auto p-2 bg-zinc-950 border border-zinc-800 rounded-2xl">
        {days.map((d) => {
          const isSelected = selectedDate === d.isoStr;
          return (
            <button
              key={d.isoStr}
              type="button"
              onClick={() => onSelectDate(d.isoStr)}
              className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer select-none text-center ${
                isSelected
                  ? 'bg-amber-500 text-zinc-950 font-bold border-amber-300 shadow-lg shadow-amber-500/20 scale-105 z-10'
                  : d.isWeekend
                    ? 'bg-amber-950/30 border-amber-800/40 text-amber-300 hover:bg-zinc-800'
                    : 'bg-zinc-900/80 border-zinc-800/80 text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              <span className="text-[9px] uppercase tracking-tighter opacity-80">{d.dayName}</span>
              <span className="text-xs font-bold font-mono my-0.5">{d.dayNum}</span>
              <span className="text-[8px] uppercase opacity-75">{d.monthStr}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
