export class CreateGroundDto {
  name: string;
  address: string;
  mapLocationUrl?: string;
  description: string;
  images?: string[];
  weekdayPrice: number;
  weekendPrice: number;
  morningPrice?: number;
  eveningPrice?: number;
  morningWeekendPrice?: number;
  eveningWeekendPrice?: number;
  timeSlots?: string[];

  // Facilities
  hasParking?: boolean;
  hasCharging?: boolean;
  hasFirstAid?: boolean;
  hasDugout?: boolean;
  hasWashroom?: boolean;
  hasChangingRoom?: boolean;

  // Responsible Contact Person
  contactName: string;
  contactPhone: string;

  // Rules & Guidelines
  rules: string;
}

export class UpdateGroundDto {
  name?: string;
  address?: string;
  mapLocationUrl?: string;
  description?: string;
  images?: string[];
  weekdayPrice?: number;
  weekendPrice?: number;
  morningPrice?: number;
  eveningPrice?: number;
  morningWeekendPrice?: number;
  eveningWeekendPrice?: number;
  timeSlots?: string[];

  hasParking?: boolean;
  hasCharging?: boolean;
  hasFirstAid?: boolean;
  hasDugout?: boolean;
  hasWashroom?: boolean;
  hasChangingRoom?: boolean;

  contactName?: string;
  contactPhone?: string;
  rules?: string;
}
