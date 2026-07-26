import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, SlidersHorizontal } from 'lucide-react';
import { PageLayout } from '@/shared/ui/PageLayout';
import { AppHeader } from '@/shared/ui/AppHeader';
import { CategorySlider } from '@/shared/ui/CategorySlider';
import { ProductCard } from '@/shared/ui/ProductCard';
import { EmptyState } from '@/shared/ui/EmptyState';
import { LoadingSkeleton } from '@/shared/ui/LoadingSkeleton';
import { FilterSheet, type FilterValues } from '@/features/products/ui/FilterSheet';
import {
  useCategoryHierarchy,
  useInfiniteProductsByCategory,
  useInfiniteProductSearch,
} from '@/features/products/hooks/useProducts';
import type { CategoryDto, ProductSearchCriteria } from '@/shared/types';
import { useT } from '@/shared/i18n';
import { clsx } from 'clsx';

// Helper to find a category anywhere in the hierarchy
function findCategory(id: number, list: CategoryDto[]): CategoryDto | undefined {
  for (const cat of list) {
    if (cat.id === id) return cat;
    if (cat.children) {
      const found = findCategory(id, cat.children);
      if (found) return found;
    }
  }
  return undefined;
}

// Top-level ancestor id — used to keep the root category chip highlighted
// even after drilling into one of its subcategories.
function findRootId(id: number, roots: CategoryDto[]): number {
  for (const root of roots) {
    if (root.id === id) return root.id;
    if (root.children?.some((c) => c.id === id)) return root.id;
  }
  return id;
}

export default function CatalogPage() {
  const t = useT();
  const [searchParams, setSearchParams] = useSearchParams();
  const observerRef = useRef<HTMLDivElement>(null);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  const initialCategoryId = Number(searchParams.get('category')) || 0;
  const [activeCategoryId, setActiveCategoryId] = useState(initialCategoryId);

  const { data: categories } = useCategoryHierarchy();
  const rootCategories = categories ?? []; // hierarchy endpoint returns roots

  const activeCategory = findCategory(activeCategoryId, rootCategories);
  const activeRootId = findRootId(activeCategoryId, rootCategories);
  const rootCategory = findCategory(activeRootId, rootCategories);
  // Stable chip row: always the root's children, so it doesn't disappear once
  // the user drills into one of them (that child usually has no children of
  // its own, which used to make the whole row vanish).
  const subCategories = rootCategory?.children ?? [];
  // Whether the category actually being searched/filtered has children of its
  // own — POST /products/search matches categoryId exactly and won't include
  // those children's products, so filtering only makes sense on a leaf.
  const childrenOfActive = activeCategory?.children ?? [];
  const isLeaf = childrenOfActive.length === 0;

  // Filters, persisted in the URL
  const minPriceParam = searchParams.get('minPrice');
  const maxPriceParam = searchParams.get('maxPrice');
  const brandsParam = searchParams.get('brands');
  const colorParam = searchParams.get('color');
  const hasActiveFilters = !!(minPriceParam || maxPriceParam || brandsParam || colorParam);
  const filtersApplicable = hasActiveFilters && isLeaf;
  const activeFilterCount = [!!(minPriceParam || maxPriceParam), !!brandsParam, !!colorParam].filter(
    Boolean,
  ).length;

  // Base (unfiltered, subcategory-inclusive) category listing — also the
  // source for the price slider's ceiling, so it stays stable across filter
  // changes instead of shrinking every time a narrower filter is applied.
  const categoryQuery = useInfiniteProductsByCategory(activeCategoryId, 10);
  const ceilingSource = categoryQuery.data?.pages.flatMap((page) => page.content) ?? [];
  const priceCeiling = Math.max(1_000_000, ...ceilingSource.map((p) => p.basePrice || 0));

  const searchCriteria: ProductSearchCriteria = {
    categoryId: activeCategoryId,
    isActive: true,
    minPrice: minPriceParam ? Number(minPriceParam) : 0,
    maxPrice: maxPriceParam ? Number(maxPriceParam) : priceCeiling,
    brandIds: brandsParam ? brandsParam.split(',').map(Number) : undefined,
    colorId: colorParam ? Number(colorParam) : undefined,
  };
  const searchQuery = useInfiniteProductSearch(searchCriteria, 10, { enabled: filtersApplicable });

  const activeQuery = filtersApplicable ? searchQuery : categoryQuery;
  const { isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = activeQuery;
  const products = activeQuery.data?.pages.flatMap((page) => page.content) ?? [];
  const totalProducts = activeQuery.data?.pages[0]?.totalElements ?? 0;

  const filterValues: FilterValues = {
    minPrice: minPriceParam ? Number(minPriceParam) : 0,
    maxPrice: maxPriceParam ? Number(maxPriceParam) : priceCeiling,
    brandIds: brandsParam ? brandsParam.split(',').map(Number) : [],
    colorId: colorParam ? Number(colorParam) : undefined,
  };

  // Sync active category from URL
  useEffect(() => {
    const idFromUrl = Number(searchParams.get('category'));
    if (idFromUrl && idFromUrl !== activeCategoryId) {
      setActiveCategoryId(idFromUrl);
    }
  }, [searchParams]);

  // Set default category if none active
  useEffect(() => {
    if (!activeCategoryId && rootCategories.length > 0) {
      setActiveCategoryId(rootCategories[0].id);
      const next = new URLSearchParams(searchParams);
      next.set('category', String(rootCategories[0].id));
      setSearchParams(next);
    }
  }, [rootCategories, activeCategoryId, searchParams, setSearchParams]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Changing category never wipes an already-applied filter (decision B3-2) —
  // only `category` is touched, every other query param is preserved.
  const handleCategorySelect = (cat: CategoryDto) => {
    setActiveCategoryId(cat.id);
    const next = new URLSearchParams(searchParams);
    next.set('category', String(cat.id));
    setSearchParams(next);
  };

  const applyFilters = (values: FilterValues) => {
    const next = new URLSearchParams(searchParams);
    next.set('minPrice', String(values.minPrice));
    next.set('maxPrice', String(values.maxPrice));
    if (values.brandIds.length) next.set('brands', values.brandIds.join(','));
    else next.delete('brands');
    if (values.colorId) next.set('color', String(values.colorId));
    else next.delete('color');
    setSearchParams(next);
  };

  const clearFilters = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('minPrice');
    next.delete('maxPrice');
    next.delete('brands');
    next.delete('color');
    setSearchParams(next);
  };

  return (
    <PageLayout showNav noPadding>
      <AppHeader
        variant="title"
        title={t('catalog.title')}
        right={
          <button
            onClick={() => setFilterSheetOpen(true)}
            aria-label={t('filter.title')}
            className="relative w-11 h-11 rounded-el bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-300"
          >
            <SlidersHorizontal className="w-5 h-5" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-di-red text-white text-xs font-bold flex items-center justify-center leading-none">
                {activeFilterCount}
              </span>
            )}
          </button>
        }
      >
        <div className="px-4 pb-2">
          <CategorySlider
            categories={rootCategories}
            activeId={activeRootId}
            onSelect={handleCategorySelect}
          />
        </div>

        {/* Breadcrumb — tells the user where they are once the chip row alone
            no longer does (e.g. deep inside a subcategory). */}
        {activeCategory && (
          <p className="px-4 pb-2 text-xs text-neutral-500 dark:text-neutral-400 truncate">
            {rootCategory && rootCategory.id !== activeCategory.id
              ? `${rootCategory.name} › ${activeCategory.name}`
              : activeCategory.name}
          </p>
        )}

        {/* Subcategories (if any) */}
        {subCategories.length > 0 && (
          <div className="px-4 pb-3 flex gap-2 overflow-x-auto hide-scrollbar">
            {rootCategory && (
              <button
                onClick={() => handleCategorySelect(rootCategory)}
                className={clsx(
                  'flex-shrink-0 px-4 py-1.5 min-h-[44px] rounded-full text-xs font-medium transition-all border uppercase tracking-wider',
                  activeCategoryId === rootCategory.id
                    ? 'bg-di-red border-di-red text-white shadow-md shadow-di-red/20'
                    : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400',
                )}
              >
                {t('catalog.all')}
              </button>
            )}
            {subCategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => handleCategorySelect(sub)}
                className={clsx(
                  'flex-shrink-0 px-4 py-1.5 min-h-[44px] rounded-full text-xs font-medium transition-all border uppercase tracking-wider',
                  activeCategoryId === sub.id
                    ? 'bg-di-red border-di-red text-white shadow-md shadow-di-red/20'
                    : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
                )}
              >
                {sub.name}
              </button>
            ))}
          </div>
        )}
      </AppHeader>

      <div className="px-4 pt-4 pb-12 space-y-4">
        {/* Results count */}
        {!isLoading && products.length > 0 && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400 font-bold uppercase tracking-widest">
            {t('catalog.found', { count: totalProducts })}
          </p>
        )}

        {/* Products grid */}
        {isLoading && products.length === 0 ? (
          <div className="grid grid-cols-2 gap-3">
            <LoadingSkeleton variant="card" count={4} />
          </div>
        ) : products.length === 0 ? (
          <EmptyState variant="products" />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

            {/* Load More Sentinel */}
            <div ref={observerRef} className="py-8 flex justify-center">
              {isFetchingNextPage ? (
                <div className="flex items-center gap-2 text-di-red font-bold uppercase tracking-widest text-xs">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('common.loading')}
                </div>
              ) : hasNextPage ? (
                <div className="h-10 w-full" />
              ) : (
                <p className="text-xs text-neutral-500 dark:text-neutral-400 font-bold uppercase tracking-widest italic py-4">
                  {t('catalog.noMore')}
                </p>
              )}
            </div>
          </>
        )}
      </div>

      <FilterSheet
        isOpen={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        categoryId={activeCategoryId}
        priceCeiling={priceCeiling}
        initialValues={filterValues}
        onApply={applyFilters}
        onClear={clearFilters}
        subCategories={childrenOfActive}
        onPickSubCategory={handleCategorySelect}
      />
    </PageLayout>
  );
}
