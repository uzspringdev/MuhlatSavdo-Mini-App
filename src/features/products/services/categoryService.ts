import { apiClient } from '@/services/apiClient';
import type {
  CategoryDto,
  CategorySearchCriteria,
  PaginatedResponse,
} from '@/shared/types';

export const categoryService = {
  getHierarchy: async (): Promise<CategoryDto[]> => {
    const res = await apiClient.get('/api/v1/categories/hierarchy');
    return res.data;
  },

  getAll: async (page = 0, size = 50): Promise<PaginatedResponse<CategoryDto>> => {
    const res = await apiClient.get('/api/v1/categories/findAll', {
      params: { page, size },
    });
    return res.data;
  },

  getById: async (id: number): Promise<CategoryDto> => {
    const res = await apiClient.get(`/api/v1/categories/findById/${id}`);
    return res.data;
  },

  search: async (
    criteria: CategorySearchCriteria,
    page = 0,
    size = 20,
  ): Promise<PaginatedResponse<CategoryDto>> => {
    const res = await apiClient.post('/api/v1/categories/search', criteria, {
      params: { page, size },
    });
    return res.data;
  },

  getHierarchyChild: async (categoryId: number): Promise<CategoryDto[]> => {
    const res = await apiClient.get(
      `/api/v1/categories/hierarchy-child/${categoryId}`,
    );
    return res.data;
  },
};
