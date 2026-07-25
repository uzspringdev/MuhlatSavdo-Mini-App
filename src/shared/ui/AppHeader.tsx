import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronLeft, X } from 'lucide-react';
import { clsx } from 'clsx';
import { useT } from '@/shared/i18n';

interface AppHeaderProps {
  variant: 'brand' | 'title' | 'search';
  title?: string;
  onBack?: () => void;
  right?: ReactNode;
  /** Extra content rendered below the main row, inside the same sticky/scrolled surface (e.g. category chips) */
  children?: ReactNode;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onSearchClear?: () => void;
  searchAutoFocus?: boolean;
}

/** Tracks scroll position so the header only grows a border/shadow once the page has actually scrolled */
function useScrolled(threshold = 8) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > threshold);
    handler();
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, [threshold]);
  return scrolled;
}

/** Single sticky header used across every screen, so height and scroll behavior stay identical everywhere */
export function AppHeader({
  variant,
  title,
  onBack,
  right,
  children,
  searchValue,
  onSearchChange,
  onSearchClear,
  searchAutoFocus,
}: AppHeaderProps) {
  const scrolled = useScrolled();
  const t = useT();

  return (
    <div
      className={clsx(
        'sticky top-0 z-40 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl transition-shadow duration-300 border-b safe-top',
        scrolled ? 'border-neutral-100 dark:border-neutral-800 shadow-sm shadow-black/5' : 'border-transparent',
      )}
    >
      <div className="flex items-center gap-3 px-4 pt-3 pb-3 min-h-[44px]">
        {variant === 'brand' && (
          <>
            <div className="w-9 h-9 rounded-el bg-gradient-to-br from-di-red to-red-700 flex items-center justify-center shadow-md shadow-di-red/30 flex-shrink-0">
              <span className="text-sm font-black text-white">MS</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-di-red dark:text-di-red-light tracking-tight">MUHLAT</span>
                <span className="text-xl font-black text-neutral-900 dark:text-white tracking-tight">SAVDO</span>
              </div>
              <p className="text-caption text-neutral-500 dark:text-neutral-400 -mt-0.5 uppercase tracking-widest font-bold">
                {t('home.categorySubtitle')}
              </p>
            </div>
            <Link
              to="/search"
              aria-label={t('search.placeholder')}
              className="w-11 h-11 rounded-el bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors flex-shrink-0"
            >
              <Search className="w-4.5 h-4.5" />
            </Link>
          </>
        )}

        {(variant === 'title' || variant === 'search') && onBack && (
          <button
            onClick={onBack}
            aria-label={t('common.back')}
            className="w-11 h-11 -ml-2 rounded-el flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex-shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {variant === 'title' && title && (
          <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 flex-1 truncate">
            {title}
          </h1>
        )}

        {variant === 'search' && (
          <div className="flex-1 flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 rounded-el px-3 py-2.5 min-w-0 focus-within:ring-2 focus-within:ring-di-red/30 transition-shadow">
            <Search className="w-4 h-4 text-neutral-500 dark:text-neutral-400 flex-shrink-0" />
            <input
              type="search"
              placeholder={t('search.placeholder')}
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              autoFocus={searchAutoFocus}
              className="flex-1 min-w-0 bg-transparent text-sm text-neutral-800 dark:text-neutral-200 placeholder-neutral-500 dark:placeholder-neutral-400 outline-none"
            />
            {!!searchValue && (
              <button
                onClick={onSearchClear}
                aria-label={t('common.clear')}
                className="w-11 h-11 flex items-center justify-center flex-shrink-0"
              >
                <X className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
              </button>
            )}
          </div>
        )}

        {right && <div className="ml-auto flex-shrink-0">{right}</div>}
      </div>
      {children}
    </div>
  );
}
