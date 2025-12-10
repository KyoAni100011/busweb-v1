import api from '@/lib/api';
import type { Trip, CreateTripDto, UpdateTripDto } from '@/types';

interface TripApi {
  id?: string;
  route_id?: string;
  routeId?: string;
  routeid?: string;
  bus_id?: string;
  busId?: string;
  busid?: string;
  route?: {
    id?: string;
    name?: string;
    origin_city?: string;
    destination_city?: string;
    distance_km?: number;
  };
  bus?: {
    id?: string;
    plate_number?: string;
    bus_type?: string;
    total_seats?: number;
    amenities?: string | null;
  };
  departure_time?: string;
  departureTime?: string;
  arrival_time?: string;
  arrivalTime?: string;
  base_price?: number;
  basePrice?: number;
  price?: number;
  status?: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'ACTIVE' | string;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
}

const pickFirst = <T>(...values: Array<T | null | undefined>) => {
  return values.find((value) => value !== undefined && value !== null);
};

const mapFromApi = (trip: TripApi): Trip => ({
  id: (trip.id ?? '') as string,
  routeId: (pickFirst(trip.route_id, trip.routeId, trip.routeid, trip.route?.id) ?? '') as string,
  busId: (pickFirst(trip.bus_id, trip.busId, trip.busid, trip.bus?.id) ?? '') as string,
  departureTime: (pickFirst(trip.departure_time, trip.departureTime) ?? '') as string,
  arrivalTime: (pickFirst(trip.arrival_time, trip.arrivalTime) ?? '') as string,
  basePrice: (pickFirst(trip.base_price, trip.basePrice, trip.price) ?? 0) as number,
  status: (trip.status ?? 'SCHEDULED') as Trip['status'],
  createdAt: pickFirst(trip.created_at, trip.createdAt),
  updatedAt: pickFirst(trip.updated_at, trip.updatedAt),
  route: trip.route
    ? {
        id: trip.route.id ?? '',
        name: trip.route.name ?? '',
        origin: pickFirst(trip.route.origin_city) ?? '',
        destination: pickFirst(trip.route.destination_city) ?? '',
        distance: pickFirst(trip.route.distance_km) ?? 0,
      }
    : undefined,
  bus: trip.bus
    ? {
        id: trip.bus.id ?? '',
        plateNumber: pickFirst(trip.bus.plate_number) ?? '',
        busType: pickFirst(trip.bus.bus_type) ?? '',
        totalSeats: pickFirst(trip.bus.total_seats) ?? 0,
        amenities: trip.bus.amenities ?? null,
      }
    : undefined,
});

const mapToApiPayload = (data: Partial<CreateTripDto>) => {
  const payload: Record<string, unknown> = {};

  if (data.routeId !== undefined) {
    payload.route_id = data.routeId;
    payload.routeId = data.routeId;
  }

  if (data.busId !== undefined) {
    payload.bus_id = data.busId;
    payload.busId = data.busId;
  }

  if (data.departureTime !== undefined) {
    payload.departure_time = data.departureTime;
    payload.departureTime = data.departureTime;
  }

  if (data.arrivalTime !== undefined) {
    payload.arrival_time = data.arrivalTime;
    payload.arrivalTime = data.arrivalTime;
  }

  if (data.basePrice !== undefined) {
    payload.base_price = data.basePrice;
    payload.basePrice = data.basePrice;
    payload.price = data.basePrice;
  }

  if (data.status !== undefined) {
    payload.status = data.status;
  }

  return payload;
};

export const tripService = {
  async getAll(): Promise<Trip[]> {
    const response = await api.get<TripApi[] | { data?: TripApi[]; items?: TripApi[] }>('/trips');
    const payload = response.data;
    const entries = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.items)
          ? payload.items
          : [];

    try {
      return entries.map(mapFromApi);
    } catch (error) {
      console.error('Failed to parse trips payload', error);
      return entries as unknown as Trip[];
    }
  },

  async getById(id: string): Promise<Trip> {
    const response = await api.get<TripApi>(`/trips/${id}`);

    try {
      return mapFromApi(response.data);
    } catch (error) {
      console.error('Failed to parse trip payload', error);
      return response.data as unknown as Trip;
    }
  },

  async create(data: CreateTripDto): Promise<Trip> {
    const response = await api.post<TripApi>('/trips', mapToApiPayload(data));

    return mapFromApi(response.data);
  },

  async update(id: string, data: UpdateTripDto): Promise<Trip> {
    const response = await api.put<TripApi>(`/trips/${id}`, mapToApiPayload(data));

    return mapFromApi(response.data);
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/trips/${id}`);
  },
};
