export interface Ground {
  id: string;
  name: string;
  address: string;
  mapLocationUrl?: string;
  description: string;
  images: string[];
  weekdayPrice: number;
  weekendPrice: number;
  morningPrice?: number;
  eveningPrice?: number;
  morningWeekendPrice?: number;
  eveningWeekendPrice?: number;
  timeSlots: string[];
  hasParking: boolean;
  hasCharging: boolean;
  hasFirstAid: boolean;
  hasDugout: boolean;
  hasWashroom: boolean;
  hasChangingRoom: boolean;
  contactName: string;
  contactPhone: string;
  rules: string;
  createdAt: string;
}

export interface BookingTicket {
  id: string;
  groundName: string;
  date: string;
  slot: string;
  price: number;
  isWeekend: boolean;
  dayName: string;
  contactName: string;
  contactPhone: string;
}

export interface DayTile {
  isoStr: string;
  dayNum: number;
  monthStr: string;
  dayName: string;
  isWeekend: boolean;
  fullLabel: string;
}
