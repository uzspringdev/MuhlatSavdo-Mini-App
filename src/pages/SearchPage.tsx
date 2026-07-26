import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { PageLayout } from '@/shared/ui/PageLayout';
import { AppHeader } from '@/shared/ui/AppHeader';
import { ProductCard } from '@/shared/ui/ProductCard';
import { LoadingSkeleton } from '@/shared/ui/LoadingSkeleton';
import { EmptyState } from '@/shared/ui/EmptyState';
import { useProductSearch, useCategoryHierarchy } from '@/features/products/hooks/useProducts';
import { useSearchHistoryStore } from '@/features/products/store/searchHistoryStore';
import { useT, type Lang, useLangStore } from '@/shared/i18n';
import { debounce } from '@/shared/utils';

const POPULAR_QUERIES: Record<Lang, string[]> = {
  ru: ['iPhone', 'Samsung', 'Наушники', 'Ноутбук', 'Телевизор', 'Xiaomi'],
  uz: ['iPhone', 'Samsung', 'Quloqchin', 'Noutbuk', 'Televizor', 'Xiaomi'],
};

export default function SearchPage() {
  const t = useT();
  const lang = useLangStore((s) => s.lang);
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const history = useSearchHistoryStore((s) => s.queries);
  const addHistory = useSearchHistoryStore((s) => s.add);
  const removeHistory = useSearchHistoryStore((s) => s.remove);
  const clearHistory = useSearchHistoryStore((s) => s.clear);

  const debouncedSet = useCallback(
    debounce((v: string) => setDebouncedQuery(v), 300),
    [],
  );

  const handleChange = (value: string) => {
    setQuery(value);
    debouncedSet(value);
  };

  const runQuery = (value: string) => {
    setQuery(value);
    setDebouncedQuery(value);
  };

  const { data: results, isLoading } = useProductSearch(
    debouncedQuery ? { name: debouncedQuery, isActive: true } : {},
  );
  const { data: categories } = useCategoryHierarchy();
  const rootCategories = (categories ?? []).filter((c) => !c.parentCategoryId);

  const products = results?.content ?? [];

  // Recording a search is a side effect on an external store, not local
  // render state, so it belongs in an effect rather than during render.
  useEffect(() => {
    if (debouncedQuery) addHistory(debouncedQuery);
  }, [debouncedQuery, addHistory]);

  return (
    <PageLayout showNav noPadding>
      <AppHeader
        variant="search"
        onBack={() => navigate(-1)}
        searchValue={query}
        onSearchChange={handleChange}
        onSearchClear={() => {
          setQuery('');
          setDebouncedQuery('');
        }}
        searchAutoFocus
      />

      <div className="px-4 py-4">
        {!debouncedQuery ? (
          <div className="space-y-6">
            {history.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 font-bold uppercase tracking-widest">
                    {t('search.recentSearches')}
                  </p>
                  <button
                    onClick={clearHistory}
                    className="text-xs font-bold text-di-red min-h-[36px] px-1"
                  >
                    {t('search.clearHistory')}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {history.map((q) => (
                    <div
                      key={q}
                      className="flex items-center gap-1 pl-3 pr-1 min-h-[36px] rounded-el bg-neutral-100 dark:bg-neutral-800"
                    >
                      <button
                        onClick={() => runQuery(q)}
                        className="text-sm text-neutral-700 dark:text-neutral-300"
                      >
                        {q}
                      </button>
                      <button
                        onClick={() => removeHistory(q)}
                        aria-label={t('common.clear')}
                        className="w-11 h-11 flex items-center justify-center text-neutral-400 dark:text-neutral-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-bold uppercase tracking-widest">
                {t('search.popularSearches')}
              </p>
              <div className="flex flex-wrap gap-2">
                {POPULAR_QUERIES[lang].map((q) => (
                  <button
                    key={q}
                    onClick={() => runQuery(q)}
                    className="px-3 min-h-[36px] rounded-el bg-neutral-100 dark:bg-neutral-800 text-sm text-neutral-700 dark:text-neutral-300"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : isLoading ? (
          <LoadingSkeleton variant="card" count={4} />
        ) : products.length === 0 ? (
          <div className="space-y-6">
            <EmptyState variant="search" description={t('search.noResultsFor', { query: debouncedQuery })} />
            {rootCategories.length > 0 && (
              <div className="space-y-2 px-2">
                <p className="text-xs text-neutral-500 dark:text-neutral-400 font-bold uppercase tracking-widest text-center">
                  {t('search.browseCategories')}
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {rootCategories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/catalog?category=${cat.id}`}
                      className="px-3 min-h-[36px] flex items-center rounded-el bg-neutral-100 dark:bg-neutral-800 text-sm text-neutral-700 dark:text-neutral-300"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
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
