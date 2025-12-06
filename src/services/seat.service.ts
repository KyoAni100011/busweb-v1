import api from '@/lib/api';
import type { Seat, CreateSeatDto, UpdateSeatDto } from '@/types';

export const seatService = {
  async getAll(): Promise<Seat[]> {
    const response = await api.get<Seat[]>('/seats');
    return response.data;
  },

  async getByBus(busId: string): Promise<Seat[]> {
    const response = await api.get<Seat[]>(`/buses/${busId}/seats`);
    return response.data;
  },

  async getById(id: string): Promise<Seat> {
    const response = await api.get<Seat>(`/seats/${id}`);
    return response.data;
  },

  async create(data: CreateSeatDto): Promise<Seat> {
    const response = await api.post<Seat>('/seats', data);
    return response.data;
  },

  async update(id: string, data: UpdateSeatDto): Promise<Seat> {
    const response = await api.put<Seat>(`/seats/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/seats/${id}`);
  },
};
