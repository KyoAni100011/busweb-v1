export interface Route {
  id: string;
  name: string;
  origin: string;
  destination: string;
  distance: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Bus {
  id: string;
  plateNumber: string;
  busType: string;
  totalSeats: number;
  amenities?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Stop {
  id: string;
  routeId: string;
  name: string;
  orderIndex: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Seat {
  id: string;
  busId: string;
  seatNumber: string;
  type: 'STANDARD' | 'VIP' | 'SLEEPER';
  position: string;
  status: 'AVAILABLE' | 'UNAVAILABLE';
  createdAt: string;
  updatedAt: string;
}

export interface Trip {
  id: string;
  routeId: string;
  busId: string;
  departureTime: string;
  arrivalTime: string;
  basePrice: number;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'ACTIVE';
  route?: Route;
  bus?: Bus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRouteDto {
  name: string;
  origin: string;
  destination: string;
  distance: number;
}

export interface UpdateRouteDto extends Partial<CreateRouteDto> {}

export interface CreateBusDto {
  plateNumber: string;
  busType: string;
  totalSeats: number;
  amenities?: string | null;
}

export interface UpdateBusDto extends Partial<CreateBusDto> {}

export interface CreateStopDto {
  name: string;
  orderIndex: number;
}

export interface UpdateStopDto extends Partial<CreateStopDto> {}

export interface CreateSeatDto {
  busId: string;
  seatNumber: string;
  type: 'STANDARD' | 'VIP' | 'SLEEPER';
  position: string;
  status?: 'AVAILABLE' | 'UNAVAILABLE';
}

export interface UpdateSeatDto extends Partial<CreateSeatDto> {}

export interface CreateTripDto {
  routeId: string;
  busId: string;
  departureTime: string;
  arrivalTime: string;
  basePrice: number;
  status?: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

export interface UpdateTripDto extends Partial<CreateTripDto> {}

export interface CitySuggestion {
  id: string;
  name: string;
  region?: string;
  country?: string;
}

export interface TripSearchQuery {
  originCityId: string;
  destinationCityId: string;
  travelDate: string;
  passengers?: number;
}

export interface TripSearchFilters {
  departureStart?: string;
  departureEnd?: string;
  minPrice?: number;
  maxPrice?: number;
  busTypes?: string[];
  amenities?: string[];
  sortBy?: 'PRICE' | 'DEPARTURE' | 'DURATION';
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  pageSize?: number;
}

export interface TripSummary {
  id: string;
  routeId: string;
  routeName: string;
  originCity: string;
  destinationCity: string;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  price: number;
  currency: string;
  busType: string;
  availableSeats: number;
  amenities: string[];
}

export interface TripSearchResponse {
  trips: TripSummary[];
  totalItems: number;
  totalPages: number;
  page: number;
  pageSize: number;
  facets?: {
    busTypes?: string[];
    amenities?: string[];
    priceRange?: {
      min: number;
      max: number;
    };
    departureBuckets?: Array<{
      label: string;
      start: string;
      end: string;
      count: number;
    }>;
  };
}

export type SeatAvailabilityStatus = 'AVAILABLE' | 'HELD' | 'BOOKED';

export interface SeatMapSeat {
  id: string;
  seatNumber: string;
  row: number;
  column: number;
  deck?: number;
  type: 'STANDARD' | 'VIP' | 'SLEEPER';
  status: SeatAvailabilityStatus;
  price: number;
  currency: string;
}

export interface SeatMapSnapshot {
  layoutId: string;
  tripId: string;
  busType: string;
  totalRows: number;
  totalColumns: number;
  deckCount: number;
  seats: SeatMapSeat[];
  refreshedAt: string;
}

export interface PassengerFormValue {
  seatId: string;
  fullName: string;
  phone: string;
  email: string;
  documentId?: string;
}

export interface BookingContactDetails {
  fullName: string;
  phone: string;
  email: string;
}

export interface BookingQuote {
  trip: TripSummary;
  seats: SeatMapSeat[];
  passengers: PassengerFormValue[];
  contact: BookingContactDetails;
  subtotal: number;
  fees: number;
  total: number;
  currency: string;
  expiresAt?: string;
}

export interface BookingConfirmation extends BookingQuote {
  bookingId: string;
  referenceCode: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  issuedAt: string;
  ticketUrls?: string[];
}

export interface BookingHistoryItem {
  bookingId: string;
  referenceCode: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  bookedAt: string;
  totalPaid: number;
  currency: string;
  trip: TripSummary;
  seats: string[];
}

export interface GuestLookupRequest {
  referenceCode: string;
  email?: string;
  phone?: string;
}

export interface GuestLookupResponse {
  booking?: BookingConfirmation;
}
