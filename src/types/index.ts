export interface Route {
  id: string;
  name: string;
  origin: string;
  destination: string;
  distance: number;
  duration: number;
  price: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface Bus {
  id: string;
  busNumber: string;
  plateNumber: string;
  capacity: number;
  type: string;
  status: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface Stop {
  id: string;
  routeId: string;
  name: string;
  location: string;
  order: number;
  arrivalTime: string;
  departureTime: string;
  createdAt: string;
  updatedAt: string;
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
  price: number;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  availableSeats: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRouteDto {
  name: string;
  origin: string;
  destination: string;
  distance: number;
  duration: number;
  price: number;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface UpdateRouteDto extends Partial<CreateRouteDto> {}

export interface CreateBusDto {
  busNumber: string;
  plateNumber: string;
  capacity: number;
  type: string;
  status?: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';
}

export interface UpdateBusDto extends Partial<CreateBusDto> {}

export interface CreateStopDto {
  name: string;
  location: string;
  order: number;
  arrivalTime: string;
  departureTime: string;
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
  price: number;
  status?: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

export interface UpdateTripDto extends Partial<CreateTripDto> {}
