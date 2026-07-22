import { apiClient } from '@/services/apiClient';
import type { BannerDto, PaginatedResponse } from '@/shared/types';

export const bannerService = {
  search: async (
    criteria: BannerSearchCriteria = {},
    page = 0,
    size = 10,
  ): Promise<PaginatedResponse<BannerDto>> => {
    const res = await apiClient.post('/api/v1/banners/search', criteria, {
      params: { page, size },
    });
    return res.data;
  },

  getById: async (id: number): Promise<BannerDto> => {
    const res = await apiClient.get(`/api/v1/banners/findById/${id}`);
    return res.data;
  },
};

export interface BannerSearchCriteria {
  description?: string;
}
