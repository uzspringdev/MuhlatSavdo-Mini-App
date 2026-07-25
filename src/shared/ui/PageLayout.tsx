import { type ReactNode } from 'react';
import { BottomNavbar } from '@/shared/ui/BottomNavbar';
import { AppHeader } from '@/shared/ui/AppHeader';

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
        <AppHeader variant="title" title={title} onBack={onBack} right={headerRight} />
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
