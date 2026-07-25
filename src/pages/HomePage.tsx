import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Loader2, Wallet, CalendarDays, ShieldCheck } from 'lucide-react';
import { PageLayout } from '@/shared/ui/PageLayout';
import { AppHeader } from '@/shared/ui/AppHeader';
import { ProductCard } from '@/shared/ui/ProductCard';
import { CategoryCard } from '@/shared/ui/CategoryCard';
import { LoadingSkeleton } from '@/shared/ui/LoadingSkeleton';
import { EmptyState } from '@/shared/ui/EmptyState';
import {
  useCategoryHierarchy,
  useInfiniteProductsByCategory,
  useBanners
} from '@/features/products/hooks/useProducts';
import type { CategoryDto, PaginatedResponse, ProductDto } from '@/shared/types';
import { resolveImage } from '@/shared/utils';
import { useT } from '@/shared/i18n';
import { clsx } from 'clsx';

export default function HomePage() {
  const t = useT();
  const [activeRootCategory, setActiveRootCategory] = useState<CategoryDto | null>(null);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [failedBannerIds, setFailedBannerIds] = useState<Set<number>>(new Set());
  const observerRef = useRef<HTMLDivElement>(null);
  const productsSectionRef = useRef<HTMLDivElement>(null);

  const { data: categories, isLoading: catsLoading } = useCategoryHierarchy();
  const { data: banners, isLoading: bannersLoading } = useBanners();
  
  // Products for the selected category ONLY (as requested)
  const { 
    data: productsData, 
    isLoading: productsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteProductsByCategory(activeRootCategory?.id ?? 0, 12);

  const rootCategories = categories?.filter((c) => !c.parentCategoryId) ?? [];
  const products: ProductDto[] =
    productsData?.pages.flatMap((page: PaginatedResponse<ProductDto>) => page.content) ?? [];

  // Auto-select first root category only if none selected
  useEffect(() => {
    if (rootCategories.length > 0 && !activeRootCategory) {
      setActiveRootCategory(rootCategories[0]);
    }
  }, [rootCategories, activeRootCategory]);

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

  // Banner auto-scroll
  useEffect(() => {
    const bannerList = banners?.content ?? [];
    if (bannerList.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentBanner((p) => (p + 1) % bannerList.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [banners]);

  const handleCategoryClick = (cat: CategoryDto) => {
    setActiveRootCategory(cat);
    // Smooth scroll to products section
    productsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const bannerList = banners?.content ?? [];

  return (
    <PageLayout showNav noPadding>
      <AppHeader variant="brand" />

      <div className="space-y-10 pt-4 pb-16">
        {/* ── Hero Banner ── */}
        <section className="px-4">
          {bannersLoading ? (
            <div className="aspect-[2.2/1] bg-neutral-200 dark:bg-neutral-800 rounded-card animate-pulse" />
          ) : bannerList.length > 0 ? (
            <div className="relative aspect-[2.2/1] rounded-card overflow-hidden shadow-2xl ring-1 ring-black/5">
              {bannerList.map((banner, i) => {
                const imgUrl =
                  banner.mobImageDto?.url ||
                  banner.mobImageDto?.name ||
                  banner.pcImageDto?.url;
                return (
                  <div
                    key={banner.id}
                    className={clsx(
                      'absolute inset-0 transition-opacity duration-1000',
                      i === currentBanner ? 'opacity-100' : 'opacity-0',
                    )}
                  >
                    {imgUrl && !failedBannerIds.has(banner.id) ? (
                      <img
                        src={resolveImage(imgUrl)}
                        alt={banner.name}
                        width={880}
                        height={400}
                        loading={i === 0 ? undefined : 'lazy'}
                        onError={() => setFailedBannerIds((prev) => new Set(prev).add(banner.id))}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-di-red via-red-600 to-red-800 flex items-center justify-center">
                        <span className="text-2xl font-black text-white uppercase tracking-tighter italic">{banner.name}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="aspect-[2.2/1] rounded-card overflow-hidden bg-gradient-to-br from-di-red via-red-600 to-orange-500 flex items-center justify-center shadow-lg shadow-di-red/20 relative">
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
               <div className="text-center text-white px-4 relative z-10">
                <h2 className="text-2xl font-black tracking-tighter">MUHLAT SAVDO</h2>
                <p className="text-xs font-bold uppercase opacity-80 tracking-[0.3em]">{t('home.bannerPremium')}</p>
              </div>
            </div>
          )}
        </section>

        {/* ── Instalment terms — the store's actual value proposition, stated
            up front so a first-time visitor understands the offer immediately ── */}
        <section className="px-4">
          <div className="grid grid-cols-3 gap-2 bg-white dark:bg-neutral-900 rounded-card p-3 shadow-sm">
            {[
              { icon: Wallet, textKey: 'home.termFirstPayment' },
              { icon: CalendarDays, textKey: 'home.termDuration' },
              { icon: ShieldCheck, textKey: 'home.termNoDocs' },
            ].map(({ icon: Icon, textKey }) => (
              <div key={textKey} className="flex flex-col items-center text-center gap-1.5 px-1">
                <Icon className="w-5 h-5 text-di-red dark:text-di-red-light" />
                <p className="text-caption text-neutral-600 dark:text-neutral-400 font-medium leading-tight">
                  {t(textKey)}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Parent Categories (2-Column Vertical Grid) ── */}
        <section className="px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-1">
              <h2 className="text-xl font-black text-neutral-900 dark:text-neutral-50 tracking-tight uppercase">
                {t('home.categories')}
              </h2>
              <div className="h-1.5 w-10 bg-di-red rounded-full" />
            </div>
            <Link
              to="/catalog"
              className="group flex items-center gap-1.5 min-h-[44px] text-caption text-neutral-600 dark:text-neutral-400 font-black uppercase tracking-widest hover:text-di-red transition-colors"
            >
              {t('home.catalogLink')} <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {catsLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-card bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
              ))
            ) : (
              rootCategories.map((cat) => (
                <CategoryCard 
                  key={cat.id}
                  category={cat} 
                  isActive={activeRootCategory?.id === cat.id}
                  onClick={() => handleCategoryClick(cat)}
                />
              ))
            )}
          </div>
        </section>

        {/* ── Products Section ── */}
        <section ref={productsSectionRef} className="px-4 scroll-mt-24">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-8 bg-di-red rounded-full" />
                <h2 className="text-xl font-black text-neutral-900 dark:text-neutral-50 tracking-tight uppercase">
                  {activeRootCategory?.name ?? t('home.productsFallback')}
                </h2>
              </div>
            </div>
          </div>

          {productsLoading && products.length === 0 ? (
            <div className="grid grid-cols-2 gap-4">
              <LoadingSkeleton variant="card" count={4} />
            </div>
          ) : products.length === 0 ? (
            <EmptyState variant="products" />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              
              {/* Load More Sentinel */}
              <div ref={observerRef} className="py-12 flex flex-col items-center gap-3">
                {isFetchingNextPage ? (
                  <>
                    <Loader2 className="w-8 h-8 animate-spin text-di-red" />
                    <span className="text-caption font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                      {t('common.loading')}
                    </span>
                  </>
                ) : hasNextPage ? (
                  <div className="h-20 w-full" />
                ) : (
                  <div className="flex flex-col items-center gap-2 py-4">
                    <div className="h-px w-20 bg-neutral-200 dark:bg-neutral-800" />
                    <p className="text-caption text-neutral-500 dark:text-neutral-400 font-black uppercase tracking-[0.2em]">
                      {t('home.allLoaded')}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </PageLayout>
  );
}
