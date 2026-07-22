import { apiClient } from '@/services/apiClient';
import type {
  ProductDto,
  ProductSearchCriteria,
  PaginatedResponse,
  BrandDto,
  ColorDto,
} from '@/shared/types';

export const productService = {
  getById: async (id: number): Promise<ProductDto> => {
    const res = await apiClient.get(`/api/v1/products/findById/${id}`);
    return res.data;
  },

  search: async (
    criteria: ProductSearchCriteria,
    page = 0,
    size = 10,
  ): Promise<PaginatedResponse<ProductDto>> => {
    const res = await apiClient.post('/api/v1/products/search', criteria, {
      params: { page, size },
    });
    return res.data;
  },

  getByCategoryId: async (
    id: number,
    page = 0,
    size = 10,
  ): Promise<PaginatedResponse<ProductDto>> => {
    const res = await apiClient.get(
      `/api/v1/products/findAllProductsByCategoryId/${id}`,
      { params: { page, size } },
    );
    return res.data;
  },

  getByParentCategory: async (
    id: number,
    page = 0,
    size = 10,
  ): Promise<PaginatedResponse<ProductDto>> => {
    const res = await apiClient.get(
      `/api/v1/products/findAllProductsByParentCategoryAndSubcategories/${id}`,
      { params: { page, size } },
    );
    return res.data;
  },

  getByCollectionId: async (collectionId: number): Promise<ProductDto[]> => {
    const res = await apiClient.get(
      `/api/v1/products/findAllByCollectionId/${collectionId}`,
    );
    return res.data;
  },

  getBrandsByCategory: async (id: number): Promise<BrandDto[]> => {
    const res = await apiClient.get(
      `/api/v1/products/findAllBrandsByCategory/${id}`,
    );
    return res.data;
  },

  getColorsByCategoryId: async (id: number): Promise<ColorDto[]> => {
    const res = await apiClient.get(
      `/api/v1/products/findAllColorsByCategoryId/${id}`,
    );
    return res.data;
  },

  getModelsByCategoryId: async (id: number): Promise<string[]> => {
    const res = await apiClient.get(
      `/api/v1/products/findAllModelsByCategoryId/${id}`,
    );
    return res.data;
  },

  countByCategoryId: async (id: number): Promise<number> => {
    const res = await apiClient.get(`/api/v1/products/countByCategoryId/${id}`);
    return res.data;
  },
};
