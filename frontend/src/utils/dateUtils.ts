import { DayTile } from '../types/ground.types';

export const getTodayDateStr = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const getMaxBookingDateStr = (): string => {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().split('T')[0];
};

export const getNext30Days = (): DayTile[] => {
  const days: DayTile[] = [];
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const dayStr = String(d.getDate()).padStart(2, '0');
    const isoStr = `${year}-${month}-${dayStr}`;
    const dayNum = d.getDate();
    const monthStr = d.toLocaleDateString('en-US', { month: 'short' });
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    days.push({
      isoStr,
      dayNum,
      monthStr,
      dayName,
      isWeekend,
      fullLabel: `${dayName}, ${monthStr} ${dayNum}`,
    });
  }
  return days;
};
