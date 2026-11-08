import type {
  BookingOption,
  Dormitory,
  FilterState,
  Room,
  RoomCategory,
} from '../types/dorm';

export const DEFAULT_FILTERS: FilterState = {
  search: '',
  maxRent: 900,
  includeUnlistedPrice: true,
  commuteMode: 'bike',
  maxCommuteMin: null,
  providerFilter: 'ALL',
  roomCategories: [],
  privateBathroomOnly: false,
  privateKitchenOnly: false,
  summerSemesterOnly: false,
  amenities: [],
  showSupermarkets: true,
};

export interface PriceTier {
  label: string;
  rangeText: string;
  bgHex: string;
  borderHex: string;
  textHex: string;
  badgeClass: string;
}

export const PRICE_TIERS: Record<string, PriceTier> = {
  budget: {
    label: 'Budget',
    rangeText: '≤ €375/mo',
    bgHex: '#10b981', // emerald-500
    borderHex: '#6ee7b7',
    textHex: '#022c22',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  },
  moderate: {
    label: 'Moderate',
    rangeText: '€376 – €450/mo',
    bgHex: '#f59e0b', // amber-500
    borderHex: '#fcd34d',
    textHex: '#451a03',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  },
  midHigh: {
    label: 'Mid-High',
    rangeText: '€451 – €550/mo',
    bgHex: '#f97316', // orange-500
    borderHex: '#fdba74',
    textHex: '#431407',
    badgeClass: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
  },
  expensive: {
    label: 'Premium',
    rangeText: '> €550/mo',
    bgHex: '#f43f5e', // rose-500
    borderHex: '#fda4af',
    textHex: '#4c0519',
    badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  },
  unlisted: {
    label: 'On Request',
    rangeText: 'Unlisted',
    bgHex: '#64748b', // slate-500
    borderHex: '#94a3b8',
    textHex: '#f8fafc',
    badgeClass: 'bg-slate-700/60 text-slate-300 border-slate-600',
  },
};

export function getPriceTier(price: number | null): PriceTier {
  if (price === null || !Number.isFinite(price)) {
    return PRICE_TIERS.unlisted;
  }
  if (price <= 375) return PRICE_TIERS.budget;
  if (price <= 450) return PRICE_TIERS.moderate;
  if (price <= 550) return PRICE_TIERS.midHigh;
  return PRICE_TIERS.expensive;
}

export function classifyRoomCategory(roomType: string): RoomCategory {
  const lower = roomType.toLowerCase();
  if (lower.includes('twin') || lower.includes('zweibett') || lower.includes('double')) {
    return 'twin';
  }
  if (lower.includes('wg') || lower.includes('living community')) {
    return 'wg';
  }
  if (lower.includes('garconniere') || lower.includes('apartment')) {
    return 'studio';
  }
  return 'single';
}

export function isPrivateBathroom(setup?: string): boolean {
  if (!setup) return false;
  const lower = setup.toLowerCase();
  return lower.includes('private') && !lower.includes('shared with roommate');
}

export function isPrivateKitchen(setup?: string): boolean {
  if (!setup) return false;
  const lower = setup.toLowerCase();
  return lower.includes('private') && !lower.includes('shared with roommate');
}

export function matchesProviderFilter(booking: BookingOption, providerFilter: string): boolean {
  if (providerFilter === 'ALL') return true;
  const p = booking.provider.toLowerCase();
  if (providerFilter === 'OEAD') return p.includes('oead');
  if (providerFilter === 'STUDENTENWERK') return p.includes('studentenwerk');
  if (providerFilter === 'WIST') return p.includes('wist');
  if (providerFilter === 'HOME4STUDENTS') return p.includes('home4students');
  if (providerFilter === 'OEJAB') return p.includes('öjab') || p.includes('oejab');
  if (providerFilter === 'AKADEMIKERHILFE') return p.includes('akademikerhilfe');
  if (providerFilter === 'INDEPENDENT') {
    return p.includes('independent') || p.includes('private') || p.includes('katholisches');
  }
  return true;
}

export function roomMatchesFilters(room: Room, filters: FilterState): boolean {
  if (room.monthlyRentEur != null && room.monthlyRentEur > filters.maxRent) {
    return false;
  }
  if (filters.roomCategories.length > 0) {
    const cat = classifyRoomCategory(room.roomType);
    if (!filters.roomCategories.includes(cat)) {
      return false;
    }
  }
  if (filters.privateBathroomOnly && !isPrivateBathroom(room.bathroomSetup)) {
    return false;
  }
  if (filters.privateKitchenOnly && !isPrivateKitchen(room.kitchenSetup)) {
    return false;
  }
  return true;
}

export function dormHasAmenityCategory(dorm: Dormitory, amenityKey: string): boolean {
  const allText = [
    ...(dorm.buildingAmenities || []),
    dorm.bikeStorage || '',
    dorm.laundryFacilities || '',
  ]
    .join(' ')
    .toLowerCase();

  switch (amenityKey) {
    case 'gym':
      return allText.includes('fitness') || allText.includes('gym') || allText.includes('volleyball');
    case 'music':
      return allText.includes('music');
    case 'outdoor':
      return (
        allText.includes('terrace') ||
        allText.includes('garden') ||
        allText.includes('park') ||
        allText.includes('courtyard') ||
        allText.includes('green')
      );
    case 'social':
      return (
        allText.includes('party') ||
        allText.includes('lounge') ||
        allText.includes('bar') ||
        allText.includes('table football') ||
        allText.includes('billiards') ||
        allText.includes('common') ||
        allText.includes('community')
      );
    case 'study':
      return (
        allText.includes('library') ||
        allText.includes('reading') ||
        allText.includes('seminar')
      );
    case 'parking':
      return allText.includes('parking') || allText.includes('garage');
    default:
      return true;
  }
}

export interface EvaluatedDorm {
  dorm: Dormitory;
  matches: boolean;
  effectiveMinPrice: number | null;
  effectiveMaxPrice: number | null;
  matchingRoomsCount: number;
  priceTier: PriceTier;
}

export function evaluateDorm(dorm: Dormitory, filters: FilterState): EvaluatedDorm {
  // 1. Text search
  if (filters.search.trim()) {
    const q = filters.search.trim().toLowerCase();
    const hay = `${dorm.dormitoryName} ${dorm.address}`.toLowerCase();
    if (!hay.includes(q)) {
      return {
        dorm,
        matches: false,
        effectiveMinPrice: null,
        effectiveMaxPrice: null,
        matchingRoomsCount: 0,
        priceTier: PRICE_TIERS.unlisted,
      };
    }
  }

  // 2. Commute time to Faculty filter
  if (filters.maxCommuteMin !== null && dorm.commute?.faculty) {
    const route = dorm.commute.faculty[filters.commuteMode];
    if (route && route.durationMin > filters.maxCommuteMin) {
      return {
        dorm,
        matches: false,
        effectiveMinPrice: null,
        effectiveMaxPrice: null,
        matchingRoomsCount: 0,
        priceTier: PRICE_TIERS.unlisted,
      };
    }
  }

  // 3. Building amenities filter
  for (const amenityKey of filters.amenities) {
    if (!dormHasAmenityCategory(dorm, amenityKey)) {
      return {
        dorm,
        matches: false,
        effectiveMinPrice: null,
        effectiveMaxPrice: null,
        matchingRoomsCount: 0,
        priceTier: PRICE_TIERS.unlisted,
      };
    }
  }

  // 4. Booking options & rooms evaluation
  const matchingBookings = (dorm.bookingOptions || []).filter((b) => {
    if (!matchesProviderFilter(b, filters.providerFilter)) return false;
    if (filters.summerSemesterOnly && !b.logistics?.acceptsSummerSemester) return false;
    return true;
  });

  if (matchingBookings.length === 0) {
    return {
      dorm,
      matches: false,
      effectiveMinPrice: null,
      effectiveMaxPrice: null,
      matchingRoomsCount: 0,
      priceTier: PRICE_TIERS.unlisted,
    };
  }

  // Check if the dorm has any listed rooms at all across matching bookings
  const allListedRooms = matchingBookings.flatMap((b) => b.rooms || []);
  if (allListedRooms.length === 0) {
    // Unlisted price dorm (e.g., Wolf-Dietrich-Heim, Thomas-Michels-Heim)
    const hasStrictRoomFilter =
      filters.roomCategories.length > 0 ||
      filters.privateBathroomOnly ||
      filters.privateKitchenOnly;
    const matches = filters.includeUnlistedPrice && !hasStrictRoomFilter;
    return {
      dorm,
      matches,
      effectiveMinPrice: null,
      effectiveMaxPrice: null,
      matchingRoomsCount: 0,
      priceTier: PRICE_TIERS.unlisted,
    };
  }

  const matchingRooms = allListedRooms.filter((r) => roomMatchesFilters(r, filters));
  if (matchingRooms.length === 0) {
    return {
      dorm,
      matches: false,
      effectiveMinPrice: null,
      effectiveMaxPrice: null,
      matchingRoomsCount: 0,
      priceTier: PRICE_TIERS.unlisted,
    };
  }

  const prices = matchingRooms
    .map((r) => r.monthlyRentEur)
    .filter((p): p is number => typeof p === 'number' && Number.isFinite(p));

  const effectiveMinPrice = prices.length > 0 ? Math.min(...prices) : null;
  const effectiveMaxPrice = prices.length > 0 ? Math.max(...prices) : null;

  return {
    dorm,
    matches: true,
    effectiveMinPrice,
    effectiveMaxPrice,
    matchingRoomsCount: matchingRooms.length,
    priceTier: getPriceTier(effectiveMinPrice),
  };
}
