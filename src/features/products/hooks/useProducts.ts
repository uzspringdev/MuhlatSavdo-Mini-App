import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { categoryService } from '@/features/products/services/categoryService';
import { productService } from '@/features/products/services/productService';
import { collectionService } from '@/features/products/services/collectionService';
import type { ProductSearchCriteria, BannerDto, PaginatedResponse } from '@/shared/types';

// ─── Query key factory ─────────────────────────────────────────────────────────
export const productKeys = {
  all: ['products'] as const,
  byId: (id: number) => [...productKeys.all, id] as const,
  search: (criteria: ProductSearchCriteria) =>
    [...productKeys.all, 'search', criteria] as const,
  byCategory: (id: number) => [...productKeys.all, 'category', id] as const,
  byCollection: (id: number) => [...productKeys.all, 'collection', id] as const,
};

export const categoryKeys = {
  all: ['categories'] as const,
  hierarchy: () => [...categoryKeys.all, 'hierarchy'] as const,
  byId: (id: number) => [...categoryKeys.all, id] as const,
};

// ─── Category hooks ────────────────────────────────────────────────────────────

export function useCategoryHierarchy() {
  return useQuery({
    queryKey: categoryKeys.hierarchy(),
    queryFn: categoryService.getHierarchy,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCategoryById(id: number) {
  return useQuery({
    queryKey: categoryKeys.byId(id),
    queryFn: () => categoryService.getById(id),
    enabled: !!id,
  });
}

export function useCategoryHierarchyChild(categoryId: number) {
  return useQuery({
    queryKey: [...categoryKeys.all, 'hierarchy-child', categoryId],
    queryFn: () => categoryService.getHierarchyChild(categoryId),
    enabled: !!categoryId,
  });
}

// ─── Product hooks ─────────────────────────────────────────────────────────────

export function useProductById(id: number) {
  return useQuery({
    queryKey: productKeys.byId(id),
    queryFn: () => productService.getById(id),
    enabled: !!id,
  });
}

export function useProductSearch(criteria: ProductSearchCriteria, page = 0) {
  return useQuery({
    queryKey: [...productKeys.search(criteria), page],
    queryFn: () => productService.search(criteria, page),
    enabled: Object.keys(criteria).length > 0,
  });
}

/** Fetches sibling products sharing the same model (i.e. color variants) */
export function useProductVariantsByModel(modelId?: number) {
  return useQuery({
    queryKey: [...productKeys.all, 'model', modelId],
    queryFn: () =>
      productService.search({ modelIds: [modelId!], isActive: true }, 0, 20),
    enabled: !!modelId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useProductsByCategory(categoryId: number, page = 0) {
  return useQuery({
    queryKey: [...productKeys.byCategory(categoryId), page],
    queryFn: () => productService.getByCategoryId(categoryId, page),
    enabled: !!categoryId,
  });
}

export function useInfiniteProductsByCategory(categoryId: number, size = 12) {
  return useInfiniteQuery({
    queryKey: [...productKeys.byCategory(categoryId), 'infinite', size],
    queryFn: ({ pageParam = 0 }) => productService.getByCategoryId(categoryId, pageParam, size),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.last || lastPage.content.length < size) {
        return undefined;
      }
      return allPages.length;
    },
    enabled: !!categoryId,
  });
}

export function useInfiniteProductsByParentCategory(categoryId: number, size = 12) {
  return useInfiniteQuery({
    queryKey: [...productKeys.byCategory(categoryId), 'parent', 'infinite', size],
    queryFn: ({ pageParam = 0 }) => productService.getByParentCategory(categoryId, pageParam, size),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.last || lastPage.content.length < size) {
        return undefined;
      }
      return allPages.length;
    },
    enabled: !!categoryId,
  });
}

export function useProductsByCollection(collectionId: number) {
  return useQuery({
    queryKey: productKeys.byCollection(collectionId),
    queryFn: () => productService.getByCollectionId(collectionId),
    enabled: !!collectionId,
  });
}

export function useProductsByParentCategory(
  categoryId: number,
  page = 0,
  size = 12,
) {
  return useQuery({
    queryKey: [...productKeys.byCategory(categoryId), 'parent', page],
    queryFn: () =>
      productService.getByParentCategory(categoryId, page, size),
    enabled: !!categoryId,
  });
}

// ─── Banner hooks ──────────────────────────────────────────────────────────────

export function useBanners() {
  return useQuery({
    queryKey: ['banners'],
    queryFn: async (): Promise<PaginatedResponse<BannerDto>> => {
      // Temporarily mock the response to avoid API calls for banners
      return { content: [], totalElements: 0, totalPages: 0 } as any;
    },
    staleTime: 10 * 60 * 1000,
  });
}

// ─── Collection hooks ──────────────────────────────────────────────────────────

export function useCollections() {
  return useQuery({
    queryKey: ['collections'],
    queryFn: collectionService.getAll,
    staleTime: 5 * 60 * 1000,
  });
}
