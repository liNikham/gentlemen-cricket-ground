import { Ground } from '../types/ground.types';

export const calculateSlotPrice = (ground: Ground | null, dateStr: string, slotStr: string) => {
  if (!ground || !dateStr) {
    return { price: 0, isWeekend: false, dayName: '', slotType: 'Morning Slot' };
  }
  const parts = dateStr.split('-');
  const dateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  const day = dateObj.getDay();
  const isWeekend = day === 0 || day === 6;
  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  const isEvening =
    (ground.timeSlots && ground.timeSlots[1] && slotStr === ground.timeSlots[1]) ||
    slotStr.includes('2:30') ||
    slotStr.toLowerCase().includes('evening') ||
    slotStr.toLowerCase().includes('afternoon');

  let price = 0;
  if (isEvening) {
    if (isWeekend) {
      price = ground.eveningWeekendPrice ?? ground.weekendPrice ?? 2800;
    } else {
      price = ground.eveningPrice ?? ground.weekdayPrice ?? 1800;
    }
  } else {
    if (isWeekend) {
      price = ground.morningWeekendPrice ?? ground.weekendPrice ?? 2500;
    } else {
      price = ground.morningPrice ?? ground.weekdayPrice ?? 1500;
    }
  }

  return {
    price,
    isWeekend,
    dayName,
    slotType: isEvening ? 'Afternoon / Evening Slot' : 'Morning Slot',
  };
};
