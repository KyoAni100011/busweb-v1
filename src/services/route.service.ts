import api from '@/lib/api';
import type { Route, CreateRouteDto, UpdateRouteDto } from '@/types';

export const routeService = {
  async getAll(): Promise<Route[]> {
    const response = await api.get<Route[]>('/routes');
    return response.data;
  },

  async getById(id: string): Promise<Route> {
    const response = await api.get<Route>(`/routes/${id}`);
    return response.data;
  },

  async create(data: CreateRouteDto): Promise<Route> {
    const response = await api.post<Route>('/routes', data);
    return response.data;
  },

  async update(id: string, data: UpdateRouteDto): Promise<Route> {
    const response = await api.put<Route>(`/routes/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/routes/${id}`);
  },
};
