import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { PageLayout } from '@/shared/ui/PageLayout';
import { CategorySlider } from '@/shared/ui/CategorySlider';
import { ProductCard } from '@/shared/ui/ProductCard';
import { EmptyState } from '@/shared/ui/EmptyState';
import { LoadingSkeleton } from '@/shared/ui/LoadingSkeleton';
import { 
  useCategoryHierarchy, 
  useInfiniteProductsByCategory 
} from '@/features/products/hooks/useProducts';
import type { CategoryDto } from '@/shared/types';
import { clsx } from 'clsx';

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const observerRef = useRef<HTMLDivElement>(null);

  const initialCategoryId = Number(searchParams.get('category')) || 0;
  const [activeCategoryId, setActiveCategoryId] = useState(initialCategoryId);

  const { data: categories } = useCategoryHierarchy();
  const rootCategories = categories ?? []; // hierarchy endpoint returns roots

  // Products with infinite scroll (using Category endpoint as requested)
  const { 
    data: productsData, 
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteProductsByCategory(activeCategoryId, 10);

  const products = productsData?.pages.flatMap((page) => page.content) ?? [];

  // Helper to find category in hierarchy
  const findCategory = (id: number, list: any[]): CategoryDto | undefined => {
    for (const cat of list) {
      if (cat.id === id) return cat;
      if (cat.children) {
        const found = findCategory(id, cat.children);
        if (found) return found;
      }
    }
    return undefined;
  };

  const activeCategory = findCategory(activeCategoryId, rootCategories);
  const subCategories = activeCategory?.children ?? [];

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
      setSearchParams({ category: String(rootCategories[0].id) });
    }
  }, [rootCategories, activeCategoryId, setSearchParams]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleCategorySelect = (cat: CategoryDto) => {
    setActiveCategoryId(cat.id);
    setSearchParams({ category: String(cat.id) });
  };

  return (
    <PageLayout showNav noPadding>
      {/* ── Top bar ── */}
      <div className="sticky top-0 z-40 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border-b border-neutral-100 dark:border-neutral-800">
        <div className="px-4 pt-3 pb-2">
          <h1 className="text-lg font-bold text-neutral-900 dark:text-neutral-50 mb-3">
            Каталог
          </h1>
          <CategorySlider
            categories={rootCategories}
            activeId={activeCategoryId}
            onSelect={handleCategorySelect}
          />
        </div>

        {/* Subcategories (if any) */}
        {subCategories.length > 0 && (
          <div className="px-4 pb-3 flex gap-2 overflow-x-auto hide-scrollbar">
            {subCategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => handleCategorySelect(sub)}
                className={clsx(
                  'flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-all border uppercase tracking-wider',
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
      </div>

      <div className="px-4 pt-4 pb-12 space-y-4">
        {/* Results count */}
        {!isLoading && products.length > 0 && (
          <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">
            Найдено {products.length} товаров
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
                <div className="flex items-center gap-2 text-di-red font-bold uppercase tracking-widest text-[10px]">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Загрузка...
                </div>
              ) : hasNextPage ? (
                <div className="h-10 w-full" />
              ) : (
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest italic py-4">
                  Больше товаров нет
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </PageLayout>
  );
}
