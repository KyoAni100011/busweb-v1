import api from '@/lib/api';
import type { Trip, CreateTripDto, UpdateTripDto } from '@/types';

export const tripService = {
  async getAll(): Promise<Trip[]> {
    const response = await api.get<Trip[]>('/trips');
    return response.data;
  },

  async getById(id: string): Promise<Trip> {
    const response = await api.get<Trip>(`/trips/${id}`);
    return response.data;
  },

  async create(data: CreateTripDto): Promise<Trip> {
    const response = await api.post<Trip>('/trips', data);
    return response.data;
  },

  async update(id: string, data: UpdateTripDto): Promise<Trip> {
    const response = await api.put<Trip>(`/trips/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/trips/${id}`);
  },
};
