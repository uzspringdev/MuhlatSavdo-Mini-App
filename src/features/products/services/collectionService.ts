import { apiClient } from '@/services/apiClient';
import type { CollectionDto } from '@/shared/types';

export const collectionService = {
  getAll: async (): Promise<CollectionDto[]> => {
    const res = await apiClient.get('/api/v1/collections/findAll');
    return res.data;
  },

  getById: async (id: number): Promise<CollectionDto> => {
    const res = await apiClient.get(`/api/v1/collections/findById/${id}`);
    return res.data;
  },
};
