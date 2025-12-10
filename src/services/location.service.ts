import axios from 'axios';
import api from '@/lib/api';
import type { CitySuggestion } from '@/types';

const DEFAULT_LIMIT = 10;

interface SearchParams {
  query: string;
  limit?: number;
}

export const locationService = {
  async searchCities({ query, limit = DEFAULT_LIMIT }: SearchParams): Promise<CitySuggestion[]> {
    if (!query.trim()) {
      return [];
    }

    const response = await api.get<CitySuggestion[]>('/cities', {
      params: {
        query,
        limit,
      },
    });

    return response.data;
  },

  async getPopularCities(limit = DEFAULT_LIMIT): Promise<CitySuggestion[]> {
    try {
      const response = await api.get<CitySuggestion[]>('/cities', {
        params: { limit },
      });

      return response.data;
    } catch (error) {
      console.warn('Popular cities fetch failed, returning empty list');

      return [];
    }
  },

  async getCityById(id: string): Promise<CitySuggestion | null> {
    if (!id) {
      return null;
    }

    try {
      const response = await api.get<CitySuggestion>(`/cities/${id}`);

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }

      throw error;
    }
  },
};
