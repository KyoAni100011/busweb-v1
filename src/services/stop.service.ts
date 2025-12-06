import api from '@/lib/api';
import type { Stop, CreateStopDto, UpdateStopDto } from '@/types';

export const stopService = {
  async getByRoute(routeId: string): Promise<Stop[]> {
    const response = await api.get<Stop[]>(`/routes/${routeId}/stops`);
    return response.data;
  },

  async getById(id: string): Promise<Stop> {
    const response = await api.get<Stop>(`/stops/${id}`);
    return response.data;
  },

  async create(routeId: string, data: CreateStopDto): Promise<Stop> {
    const response = await api.post<Stop>(`/routes/${routeId}/stops`, data);
    return response.data;
  },

  async update(id: string, data: UpdateStopDto): Promise<Stop> {
    const response = await api.put<Stop>(`/stops/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/stops/${id}`);
  },
};
