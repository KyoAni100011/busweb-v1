import api from '@/lib/api';
import type { Bus, CreateBusDto, UpdateBusDto } from '@/types';

interface BusApi {
  id?: string;
  plate_number?: string;
  plateNumber?: string;
  bus_type?: string;
  busType?: string;
  total_seats?: number;
  totalSeats?: number;
  amenities?: string | null;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
}

const pickFirst = <T>(...values: Array<T | null | undefined>) => values.find((value) => value !== undefined && value !== null);

const mapFromApi = (bus: BusApi): Bus => ({
  id: (bus.id ?? '') as string,
  plateNumber: (pickFirst(bus.plate_number, bus.plateNumber) ?? '') as string,
  busType: (pickFirst(bus.bus_type, bus.busType) ?? '') as string,
  totalSeats: (pickFirst(bus.total_seats, bus.totalSeats) ?? 0) as number,
  amenities: bus.amenities ?? null,
  createdAt: pickFirst(bus.created_at, bus.createdAt),
  updatedAt: pickFirst(bus.updated_at, bus.updatedAt),
});

const mapToApiPayload = (data: Partial<CreateBusDto>) => {
  const payload: Record<string, unknown> = {};

  if (data.plateNumber !== undefined) {
    payload.plate_number = data.plateNumber;
    payload.plateNumber = data.plateNumber;
  }

  if (data.busType !== undefined) {
    payload.bus_type = data.busType;
    payload.busType = data.busType;
  }

  if (data.totalSeats !== undefined) {
    payload.total_seats = data.totalSeats;
    payload.totalSeats = data.totalSeats;
  }

  if (data.amenities !== undefined) {
    const amenities = typeof data.amenities === 'string'
      ? data.amenities.trim()
      : data.amenities;

    payload.amenities = amenities === '' ? null : amenities;
  }

  return payload;
};

export const busService = {
  async getAll(): Promise<Bus[]> {
    const response = await api.get<BusApi[] | { data?: BusApi[]; items?: BusApi[] }>('/buses');
    const payload = response.data;
    const entries = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.items)
          ? payload.items
          : [];

    return entries.map(mapFromApi);
  },

  async getById(id: string): Promise<Bus> {
    const response = await api.get<BusApi>(`/buses/${id}`);

    return mapFromApi(response.data);
  },

  async create(data: CreateBusDto): Promise<Bus> {
    const response = await api.post<BusApi>('/buses', mapToApiPayload(data));

    return mapFromApi(response.data);
  },

  async update(id: string, data: UpdateBusDto): Promise<Bus> {
    const response = await api.put<BusApi>(`/buses/${id}`, mapToApiPayload(data));

    return mapFromApi(response.data);
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/buses/${id}`);
  },
};
