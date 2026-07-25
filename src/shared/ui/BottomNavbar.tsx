import { NavLink } from 'react-router-dom';
import { Home, Grid3x3, Heart, ShoppingCart, User } from 'lucide-react';
import { useCartStore } from '@/features/orders/store/cartStore';
import { telegram } from '@/app/telegram/telegram';
import { useT } from '@/shared/i18n';
import { clsx } from 'clsx';

const NAV_ITEMS = [
  { to: '/', labelKey: 'nav.home', icon: Home, exact: true, isCart: false },
  { to: '/catalog', labelKey: 'nav.catalog', icon: Grid3x3, exact: false, isCart: false },
  { to: '/favorites', labelKey: 'nav.favorites', icon: Heart, exact: false, isCart: false },
  { to: '/cart', labelKey: 'nav.cart', icon: ShoppingCart, exact: false, isCart: true },
  { to: '/profile', labelKey: 'nav.profile', icon: User, exact: false, isCart: false },
] as const;

export function BottomNavbar() {
  const totalItems = useCartStore((s) => s.totalItems());
  const t = useT();

  const handleNavClick = () => {
    telegram.haptic.selection();
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-bottom bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border-t border-neutral-100 dark:border-neutral-800">
      <div className="flex items-center justify-around px-2 py-2">
        {NAV_ITEMS.map(({ to, labelKey, icon: Icon, exact, isCart }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            onClick={handleNavClick}
            aria-label={t(labelKey)}
            className={({ isActive }) =>
              clsx(
                'flex flex-col items-center gap-1 py-1.5 transition-all duration-200 min-w-[60px] min-h-[44px] justify-center',
                isActive
                  ? 'text-di-red dark:text-di-red-light'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300',
              )
            }
          >
            {({ isActive }) => (
              <>
                {/* Soft pill highlight behind the active icon */}
                <div
                  id={isCart ? 'cart-nav-icon' : undefined}
                  className={clsx(
                    'relative flex items-center justify-center w-11 h-8 rounded-full transition-colors duration-200',
                    isActive && 'bg-di-red/10 dark:bg-di-red-light/10',
                  )}
                >
                  <Icon
                    className={clsx(
                      'w-6 h-6 transition-transform duration-200',
                      isActive && 'scale-110',
                    )}
                    strokeWidth={isActive ? 2.5 : 1.75}
                  />
                  {/* Cart badge — remounted (via key) on every count change so
                      the pop animation replays instead of only playing once */}
                  {isCart && totalItems > 0 && (
                    <span
                      key={totalItems}
                      className="absolute top-0.5 right-1.5 bg-di-red text-white text-caption font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 leading-none animate-badge-pop"
                    >
                      {totalItems > 99 ? '99+' : totalItems}
                    </span>
                  )}
                </div>
                <span
                  className={clsx(
                    'text-caption font-medium transition-colors',
                    isActive && 'font-semibold',
                  )}
                >
                  {t(labelKey)}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
