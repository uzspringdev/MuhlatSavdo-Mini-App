import { type ReactNode } from 'react';
import { BottomNavbar } from '@/shared/ui/BottomNavbar';

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  showNav?: boolean;
  noPadding?: boolean;
  headerRight?: ReactNode;
  onBack?: () => void;
}

export function PageLayout({
  children,
  title,
  showNav = true,
  noPadding = false,
  headerRight,
  onBack,
}: PageLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* ── Header ── */}
      {(title || onBack) && (
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-100 dark:border-neutral-800 safe-top">
          <div className="flex items-center gap-3 px-4 py-3">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 -ml-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                aria-label="Back"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
            {title && (
              <h1 className="text-base font-semibold text-neutral-900 dark:text-neutral-50 flex-1 truncate">
                {title}
              </h1>
            )}
            {headerRight && <div className="ml-auto">{headerRight}</div>}
          </div>
        </header>
      )}

      {/* ── Main content ── */}
      <main
        className={
          noPadding
            ? 'flex-1'
            : 'flex-1 px-4'
        }
        style={{ paddingBottom: showNav ? 'calc(4.5rem + env(safe-area-inset-bottom))' : '0' }}
      >
        {children}
      </main>

      {/* ── Bottom nav ── */}
      {showNav && <BottomNavbar />}
    </div>
  );
}
