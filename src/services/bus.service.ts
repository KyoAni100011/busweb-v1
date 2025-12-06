import api from '@/lib/api';
import type { Bus, CreateBusDto, UpdateBusDto } from '@/types';

export const busService = {
  async getAll(): Promise<Bus[]> {
    const response = await api.get<Bus[]>('/buses');
    return response.data;
  },

  async getById(id: string): Promise<Bus> {
    const response = await api.get<Bus>(`/buses/${id}`);
    return response.data;
  },

  async create(data: CreateBusDto): Promise<Bus> {
    const response = await api.post<Bus>('/buses', data);
    return response.data;
  },

  async update(id: string, data: UpdateBusDto): Promise<Bus> {
    const response = await api.put<Bus>(`/buses/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/buses/${id}`);
  },
};
