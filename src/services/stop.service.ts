import api from '@/lib/api';
import type { Stop, CreateStopDto, UpdateStopDto } from '@/types';

interface StopApi {
  id: string;
  stop_name?: string;
  name?: string;
  order_index?: number;
  orderIndex?: number;
  routeid?: string;
  route_id?: string;
  routeId?: string;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
}

const resolveRouteId = (payload: StopApi): string => {
  return (
    payload.routeid ??
    payload.route_id ??
    payload.routeId ??
    ''
  );
};

const mapFromApi = (stop: StopApi): Stop => ({
  id: stop.id,
  name: stop.stop_name ?? stop.name ?? '',
  orderIndex: stop.order_index ?? stop.orderIndex ?? 0,
  routeId: resolveRouteId(stop),
  createdAt: stop.created_at ?? stop.createdAt,
  updatedAt: stop.updated_at ?? stop.updatedAt,
});

const mapToApiPayload = (data: Partial<CreateStopDto>) => {
  const payload: Record<string, unknown> = {};

  if (data.name !== undefined) {
    payload.stop_name = data.name;
  }

  if (data.orderIndex !== undefined) {
    payload.order_index = data.orderIndex;
  }

  return payload;
};

export const stopService = {
  async getByRoute(routeId: string): Promise<Stop[]> {
    const response = await api.get<StopApi[]>(`/routes/${routeId}/stops`);

    return response.data.map(mapFromApi);
  },

  async getById(id: string): Promise<Stop> {
    const response = await api.get<StopApi>(`/stops/${id}`);

    return mapFromApi(response.data);
  },

  async create(routeId: string, data: CreateStopDto): Promise<Stop> {
    const response = await api.post<StopApi>(`/routes/${routeId}/stops`, mapToApiPayload(data));

    return mapFromApi(response.data);
  },

  async update(id: string, data: UpdateStopDto): Promise<Stop> {
    const response = await api.put<StopApi>(`/stops/${id}`, mapToApiPayload(data));

    return mapFromApi(response.data);
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/stops/${id}`);
  },
};
