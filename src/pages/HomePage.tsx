import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronRight, Loader2 } from 'lucide-react';
import { PageLayout } from '@/shared/ui/PageLayout';
import { ProductCard } from '@/shared/ui/ProductCard';
import { CategoryCard } from '@/shared/ui/CategoryCard';
import { LoadingSkeleton } from '@/shared/ui/LoadingSkeleton';
import { EmptyState } from '@/shared/ui/EmptyState';
import { 
  useCategoryHierarchy, 
  useInfiniteProductsByCategory, 
  useBanners 
} from '@/features/products/hooks/useProducts';
import type { CategoryDto, ProductDto } from '@/shared/types';
import { resolveImage } from '@/shared/utils';
import { clsx } from 'clsx';

export default function HomePage() {
  const [activeRootCategory, setActiveRootCategory] = useState<CategoryDto | null>(null);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);
  const productsSectionRef = useRef<HTMLDivElement>(null);

  // Header border/shadow only appears once the page is actually scrolled —
  // keeps the top of the page seamless with the banner instead of a static line.
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
  const products: ProductDto[] = productsData?.pages.flatMap((page: any) => page.content) ?? [];

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
      {/* ── App Header ── */}
      <div
        className={clsx(
          'sticky top-0 z-40 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl transition-shadow duration-300 border-b',
          isScrolled
            ? 'border-neutral-100 dark:border-neutral-800 shadow-sm shadow-black/5'
            : 'border-transparent',
        )}
      >
        <div className="flex items-center gap-3 px-4 pt-3 pb-3">
          {/* Brand monogram — matches the boot splash mark for a consistent identity */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-di-red to-red-700 flex items-center justify-center shadow-md shadow-di-red/30 flex-shrink-0">
            <span className="text-sm font-black text-white">MS</span>
          </div>

          <div className="flex-1">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-di-red dark:text-di-red-light tracking-tight">MUHLAT</span>
              <span className="text-xl font-black text-neutral-900 dark:text-white tracking-tight">SAVDO</span>
            </div>
            <p className="text-[10px] text-neutral-400 -mt-0.5 uppercase tracking-widest font-bold">Электроника</p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/search"
              className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 transition-colors"
            >
              <Search className="w-4.5 h-4.5" />
            </Link>
          </div>
        </div>
      </div>

      <div className="space-y-10 pt-4 pb-16">
        {/* ── Hero Banner ── */}
        <section className="px-4">
          {bannersLoading ? (
            <div className="aspect-[2.2/1] bg-neutral-200 dark:bg-neutral-800 rounded-3xl animate-pulse" />
          ) : bannerList.length > 0 ? (
            <div className="relative aspect-[2.2/1] rounded-3xl overflow-hidden shadow-2xl ring-1 ring-black/5">
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
                    {imgUrl ? (
                      <img
                        src={resolveImage(imgUrl)}
                        alt={banner.name}
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
            <div className="aspect-[2.2/1] rounded-3xl overflow-hidden bg-gradient-to-br from-di-red via-red-600 to-orange-500 flex items-center justify-center shadow-lg shadow-di-red/20 relative">
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
               <div className="text-center text-white px-4 relative z-10">
                <h2 className="text-2xl font-black tracking-tighter">MUHLAT SAVDO</h2>
                <p className="text-xs font-bold uppercase opacity-80 tracking-[0.3em]">Premium Store</p>
              </div>
            </div>
          )}
        </section>

        {/* ── Parent Categories (2-Column Vertical Grid) ── */}
        <section className="px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-1">
              <h2 className="text-xl font-black text-neutral-900 dark:text-neutral-50 tracking-tight uppercase">
                Категории
              </h2>
              <div className="h-1.5 w-10 bg-di-red rounded-full" />
            </div>
            <Link
              to="/catalog"
              className="group flex items-center gap-1.5 text-[10px] text-neutral-500 font-black uppercase tracking-widest hover:text-di-red transition-colors"
            >
              Каталог <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {catsLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-3xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
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
                  {activeRootCategory?.name ?? 'Товары'}
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
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Загрузка...</span>
                  </>
                ) : hasNextPage ? (
                  <div className="h-20 w-full" />
                ) : (
                  <div className="flex flex-col items-center gap-2 py-4">
                    <div className="h-px w-20 bg-neutral-200 dark:bg-neutral-800" />
                    <p className="text-[10px] text-neutral-400 font-black uppercase tracking-[0.2em]">
                      Все товары загружены
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
