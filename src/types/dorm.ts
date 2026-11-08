export interface Coordinates {
  lat: number;
  lng: number;
}

export interface WalkBikeRoute {
  durationMin: number;
  distanceKm: number;
}

export interface TransitRoute {
  durationMin: number;
  transfers: number;
  lines: string[];
}

export interface DestinationCommute {
  walk: WalkBikeRoute;
  bike: WalkBikeRoute;
  transit: TransitRoute;
}

export interface DormCommute {
  queriedAt: string;
  faculty: DestinationCommute;
  trainStation: DestinationCommute;
}

export interface Room {
  roomType: string;
  monthlyRentEur: number;
  depositEur?: number;
  utilitiesIncluded?: boolean;
  internetInfrastructure?: string;
  cleaningServices?: string;
  bathroomSetup?: string;
  kitchenSetup?: string;
  roomEquipment?: string[];
  [key: string]: unknown;
}

export interface SourceLinks {
  applicationPortal?: string;
  roomsAndPricing?: string;
  contractAndCancellation?: string;
  houseRules?: string;
}

export interface Logistics {
  acceptsSummerSemester?: boolean;
  moveInRules?: string | null;
  guestPolicy?: string | null;
}

export interface BookingOption {
  provider: string;
  primaryUrl?: string;
  sourceLinks?: SourceLinks;
  logistics?: Logistics;
  specialNotes?: string[];
  mandatoryExtraFees?: string[];
  rooms?: Room[];
  [key: string]: unknown;
}

export interface Dormitory {
  dormitoryName: string;
  address: string;
  buildingAmenities: string[];
  bikeStorage?: string;
  laundryFacilities?: string;
  photos?: string[];
  bookingOptions: BookingOption[];
  coordinates?: Coordinates;
  commute?: DormCommute;
  [key: string]: unknown;
}

export interface DestinationPOI {
  id: string;
  name: string;
  shortName: string;
  address: string;
  category: 'faculty' | 'station';
  lat: number;
  lng: number;
}

export interface SupermarketPOI {
  id: string;
  name: string;
  brand: 'Spar' | 'Billa' | 'Hofer' | 'Lidl' | 'Penny' | 'Bio' | 'Supermarket';
  category: 'supermarket';
  lat: number;
  lng: number;
}

export interface POIsData {
  destinations: DestinationPOI[];
  supermarkets: SupermarketPOI[];
}

export type RoomCategory = 'single' | 'shared';
export type CommuteMode = 'bike' | 'transit' | 'walk';

export interface FilterState {
  search: string;
  maxRent: number;
  includeUnlistedPrice: boolean;
  commuteMode: CommuteMode;
  maxCommuteMin: number | null;
  providerFilter: string;
  roomCategories: RoomCategory[];
  privateBathroomOnly: boolean;
  privateKitchenOnly: boolean;
  summerSemesterOnly: boolean;
  amenities: string[];
  showSupermarkets: boolean;
}
