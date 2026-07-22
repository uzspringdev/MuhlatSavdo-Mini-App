import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowLeft } from 'lucide-react';
import { PageLayout } from '@/shared/ui/PageLayout';
import { ProductCard } from '@/shared/ui/ProductCard';
import { LoadingSkeleton } from '@/shared/ui/LoadingSkeleton';
import { EmptyState } from '@/shared/ui/EmptyState';
import { useProductSearch } from '@/features/products/hooks/useProducts';
import { debounce } from '@/shared/utils';

export default function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const debouncedSet = useCallback(
    debounce((v: string) => setDebouncedQuery(v), 500),
    [],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    debouncedSet(val);
  };

  const { data: results, isLoading } = useProductSearch(
    debouncedQuery ? { name: debouncedQuery, isActive: true } : {},
  );

  const products = results?.content ?? [];

  return (
    <PageLayout showNav noPadding>
      {/* Search bar */}
      <div className="sticky top-0 z-40 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border-b border-neutral-100 dark:border-neutral-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-neutral-600 dark:text-neutral-300"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl px-3 py-2.5">
            <Search className="w-4 h-4 text-neutral-400 flex-shrink-0" />
            <input
              type="search"
              placeholder="Поиск товаров..."
              value={query}
              onChange={handleChange}
              autoFocus
              className="flex-1 bg-transparent text-sm text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 outline-none"
            />
            {query && (
              <button onClick={() => { setQuery(''); setDebouncedQuery(''); }}>
                <X className="w-4 h-4 text-neutral-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        {!debouncedQuery ? (
          <div className="text-center py-16 text-neutral-400 text-sm">
            Введите название товара для поиска
          </div>
        ) : isLoading ? (
          <LoadingSkeleton variant="card" count={4} />
        ) : products.length === 0 ? (
          <EmptyState variant="search" description={`По запросу «${debouncedQuery}» ничего не найдено`} />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
