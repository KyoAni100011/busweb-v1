import api from '@/lib/api';
import type {
  TripSearchQuery,
  TripSearchFilters,
  TripSearchResponse,
  TripSummary,
  SeatMapSnapshot,
  SeatMapSeat,
  Trip,
} from '@/types';

const mapTripSummary = (trip: any): TripSummary => {
  const departure = trip.departure_time ?? trip.departureTime ?? trip.departure ?? trip.departureAt;
  const arrival = trip.arrival_time ?? trip.arrivalTime ?? trip.arrival ?? trip.arrivalAt;
  const departureDate = departure ? new Date(departure) : null;
  const arrivalDate = arrival ? new Date(arrival) : null;
  const durationMinutes = departureDate && arrivalDate
    ? Math.max(1, Math.round((arrivalDate.getTime() - departureDate.getTime()) / 60000))
    : 0;
  const route = trip.route ?? {};
  const bus = trip.bus ?? {};
  const amenities = typeof bus.amenities === 'string'
    ? bus.amenities.split(',').map((x: string) => x.trim()).filter(Boolean)
    : Array.isArray(bus.amenities)
      ? bus.amenities
      : [];

  return {
    id: trip.id ?? '',
    routeId: trip.routeId ?? trip.route_id ?? route.id ?? '',
    routeName: route.name ?? `${route.origin_city ?? ''} → ${route.destination_city ?? ''}`.trim(),
    originCity: route.origin_city ?? trip.originCity ?? '',
    destinationCity: route.destination_city ?? trip.destinationCity ?? '',
    departureTime: departureDate ? departureDate.toISOString() : '',
    arrivalTime: arrivalDate ? arrivalDate.toISOString() : '',
    durationMinutes,
    price: trip.base_price ?? trip.price ?? 0,
    currency: trip.currency ?? 'USD',
    busType: bus.bus_type ?? bus.busType ?? trip.busType ?? 'Bus',
    availableSeats: trip.availableSeats ?? bus.total_seats ?? 0,
    amenities,
  };
};

const buildSearchParams = (query: TripSearchQuery, filters?: TripSearchFilters) => {
  const params: Record<string, string | number | undefined> = {
    originCityId: query.originCityId,
    destinationCityId: query.destinationCityId,
    travelDate: query.travelDate,
  };

  if (query.passengers) {
    params.passengers = query.passengers;
  }

  if (!filters) {
    return params;
  }

  const assignIfDefined = (key: string, value?: string | number) => {
    if (value !== undefined) {
      params[key] = value;
    }
  };

  assignIfDefined('departureStart', filters.departureStart);
  assignIfDefined('departureEnd', filters.departureEnd);
  assignIfDefined('minPrice', filters.minPrice);
  assignIfDefined('maxPrice', filters.maxPrice);
  assignIfDefined('sortBy', filters.sortBy);
  assignIfDefined('sortOrder', filters.sortOrder);
  assignIfDefined('page', filters.page);
  assignIfDefined('pageSize', filters.pageSize);

  if (filters.busTypes?.length) {
    params.busTypes = filters.busTypes.join(',');
  }

  if (filters.amenities?.length) {
    params.amenities = filters.amenities.join(',');
  }

  return params;
};

const fetchSeatsForBus = async (busId: string) => {
  const endpoint = `/seats/by-bus/${busId}`;

  try {
    const response = await api.get<any[]>(endpoint);

    if (Array.isArray(response.data)) {
      return response.data;
    }
  } catch (error: any) {
    const status = error?.response?.status;

    if (status === 404) {
      return [];
    }

    if (!status || status !== 404) {
      throw error;
    }
  }

  throw new Error(`Unable to load seats for bus ${busId}. Endpoint ${endpoint} returned an unexpected response.`);
};

export const publicTripService = {
  async searchTrips(query: TripSearchQuery, filters?: TripSearchFilters): Promise<TripSearchResponse> {
    const response = await api.get<TripSearchResponse | { data?: any[]; total?: number; total_pages?: number; page?: number; limit?: number }>('/trips', {
      params: buildSearchParams(query, filters),
    });

    const payload = response.data as any;
    const items: any[] = Array.isArray(payload?.trips)
      ? payload.trips
      : Array.isArray(payload?.data)
        ? payload.data
        : [];

    const trips = items.map(mapTripSummary);

    return {
      trips,
      totalItems: payload.totalItems ?? payload.total ?? trips.length,
      totalPages: payload.totalPages ?? payload.total_pages ?? 1,
      page: payload.page ?? filters?.page ?? 1,
      pageSize: payload.pageSize ?? payload.limit ?? filters?.pageSize ?? 10,
      facets: payload.facets,
    } as TripSearchResponse;
  },

  async getTripById(id: string): Promise<TripSummary> {
    const response = await api.get<any>(`/trips/${id}`);
    const payload = response.data as any;
    const tripPayload = payload?.trip ?? payload;

    return mapTripSummary(tripPayload);
  },

  async getSeatMap(tripId: string): Promise<SeatMapSnapshot> {
    const tripResponse = await api.get<Trip>(`/trips/${tripId}`);
    const busId = tripResponse.data.busId || tripResponse.data.bus?.id || (tripResponse.data as any)?.bus?.busId;

    if (!busId) {
      throw new Error('Trip is missing busId; cannot load seat map');
    }

    const seatsRaw = await fetchSeatsForBus(busId);
    const totalSeats = tripResponse.data.bus?.totalSeats ?? (tripResponse.data as any)?.bus?.total_seats;

    const normalizedSeats = seatsRaw.length || !totalSeats
      ? seatsRaw
      : Array.from({ length: totalSeats }).map((_, index) => ({
          id: `auto-${busId}-${index + 1}`,
          seatNumber: `${index + 1}`,
          type: 'STANDARD',
          status: 'AVAILABLE',
        }));

    const seats: SeatMapSeat[] = normalizedSeats.map((seat, index) => {
      const seatNumber = seat.seatNumber
        ?? seat.seat_number
        ?? seat.number
        ?? seat.code
        ?? seat.label
        ?? seat.seat_no
        ?? seat.seatNo
        ?? `${index + 1}`;

      const rawStatus = (seat.status ?? '').toString().toUpperCase();
      const status: SeatMapSeat['status'] = rawStatus === 'BOOKED' || rawStatus === 'UNAVAILABLE'
        ? 'BOOKED'
        : rawStatus === 'HELD' || rawStatus === 'LOCKED'
          ? 'HELD'
          : 'AVAILABLE';

      const priceFactor = seat.price_factor ?? 1;
      const price = (seat.price ?? seat.cost ?? seat.amount ?? seat.rate ?? tripResponse.data.basePrice ?? 0) * priceFactor;
      const currency = seat.currency ?? seat.curr ?? seat.isoCurrency ?? tripResponse.data.currency ?? 'USD';
      const seatType = seat.type ?? seat.seat_type ?? 'STANDARD';

      return {
        id: seat.id ?? seat.seatId ?? seat.seat_id ?? seatNumber,
        seatNumber,
        row: seat.row ?? undefined,
        column: seat.column ?? undefined,
        deck: seat.deck ?? 0,
        type: seatType,
        status,
        price,
        currency,
      };
    });

    const totalRows = seats.some((s) => s.row !== undefined)
      ? Math.max(...seats.map((s) => (s.row ?? 0))) + 1
      : Math.max(1, Math.ceil(seats.length / 4));
    const totalColumns = seats.some((s) => s.column !== undefined)
      ? Math.max(...seats.map((s) => (s.column ?? 0))) + 1
      : 5;

    return {
      layoutId: `${busId}-layout`,
      tripId,
      busType: tripResponse.data.bus?.busType ?? 'Bus',
      totalRows,
      totalColumns,
      deckCount: 1,
      seats,
      refreshedAt: new Date().toISOString(),
    };
  },

  async refreshSeatStatuses(tripId: string): Promise<SeatMapSeat[]> {
    const availableResponse = await api.get<string[] | { availableSeatIds?: string[]; availableSeatCodes?: string[] }>(`/seat-lock/available/${tripId}`);
    const availableIds = Array.isArray(availableResponse.data)
      ? availableResponse.data
      : Array.isArray((availableResponse.data as any)?.availableSeatIds)
        ? (availableResponse.data as any).availableSeatIds
        : Array.isArray((availableResponse.data as any)?.availableSeatCodes)
          ? (availableResponse.data as any).availableSeatCodes
          : [];

    return availableIds.map((id) => ({
      id,
      seatNumber: id,
      row: undefined,
      column: undefined,
      type: 'STANDARD',
      status: 'AVAILABLE',
      price: 0,
      currency: 'USD',
    }));
  },

  async holdSeats(tripId: string, seatIds: string[], seatCodes?: string[]): Promise<{ expiresAt: string }>
  {
    const payloadSeatCodes = (seatCodes?.length ? seatCodes : seatIds).filter(Boolean);
    const primarySeatCode = payloadSeatCodes[0];

    const response = await api.post<{ expiresAt?: string }>('/seat-lock', {
      trip_id: tripId,
      seat_code: primarySeatCode,
      seatCodes: payloadSeatCodes,
      seatIds,
    });

    return { expiresAt: response.data.expiresAt ?? new Date(Date.now() + 5 * 60_000).toISOString() };
  },

  async releaseSeats(tripId: string, seatIds: string[]): Promise<void> {
    // Backend has no release endpoint; rely on expiry. No-op to avoid 404s.
    console.info('releaseSeats not supported by API; skipping release for', seatIds);
  },
};
