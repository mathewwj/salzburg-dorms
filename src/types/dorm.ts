export interface Room {
  roomType: string;
  monthlyRentEur: number;
  [key: string]: unknown;
}

export interface BookingOption {
  provider: string;
  rooms?: Room[];
  [key: string]: unknown;
}

export interface Dormitory {
  dormitoryName: string;
  address: string;
  buildingAmenities: string[];
  bookingOptions: BookingOption[];
  [key: string]: unknown;
}
