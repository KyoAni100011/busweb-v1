import api from '@/lib/api';
import type { Route, CreateRouteDto, UpdateRouteDto } from '@/types';

interface RouteApi {
  id?: string;
  name?: string;
  origin_city?: string;
  origin?: string;
  destination_city?: string;
  destination?: string;
  distance_km?: number;
  distance?: number;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
}

const pickFirst = <T>(...values: Array<T | null | undefined>) => values.find((value) => value !== undefined && value !== null);

const mapFromApi = (route: RouteApi): Route => ({
  id: (route.id ?? '') as string,
  name: (route.name ?? '') as string,
  origin: (pickFirst(route.origin_city, route.origin) ?? '') as string,
  destination: (pickFirst(route.destination_city, route.destination) ?? '') as string,
  distance: (pickFirst(route.distance_km, route.distance) ?? 0) as number,
  createdAt: pickFirst(route.created_at, route.createdAt),
  updatedAt: pickFirst(route.updated_at, route.updatedAt),
});

const mapToApiPayload = (data: Partial<CreateRouteDto>) => {
  const payload: Record<string, unknown> = {};

  if (data.name !== undefined) {
    payload.name = data.name;
  }

  if (data.origin !== undefined) {
    payload.origin_city = data.origin;
    payload.origin = data.origin;
  }

  if (data.destination !== undefined) {
    payload.destination_city = data.destination;
    payload.destination = data.destination;
  }

  if (data.distance !== undefined) {
    payload.distance_km = data.distance;
    payload.distance = data.distance;
  }

  return payload;
};

export const routeService = {
  async getAll(): Promise<Route[]> {
    const response = await api.get<RouteApi[] | { data?: RouteApi[]; items?: RouteApi[] }>('/routes');
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

  async getById(id: string): Promise<Route> {
    const response = await api.get<RouteApi>(`/routes/${id}`);

    return mapFromApi(response.data);
  },

  async create(data: CreateRouteDto): Promise<Route> {
    const response = await api.post<RouteApi>('/routes', mapToApiPayload(data));

    return mapFromApi(response.data);
  },

  async update(id: string, data: UpdateRouteDto): Promise<Route> {
    const response = await api.put<RouteApi>(`/routes/${id}`, mapToApiPayload(data));

    return mapFromApi(response.data);
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/routes/${id}`);
  },
};
