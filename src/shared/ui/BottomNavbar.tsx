import { NavLink } from 'react-router-dom';
import { Home, Grid3x3, ShoppingCart, User } from 'lucide-react';
import { useCartStore } from '@/features/orders/store/cartStore';
import { telegram } from '@/app/telegram/telegram';
import { clsx } from 'clsx';

const NAV_ITEMS = [
  { to: '/', label: 'Главная', icon: Home, exact: true },
  { to: '/catalog', label: 'Каталог', icon: Grid3x3, exact: false },
  { to: '/cart', label: 'Корзина', icon: ShoppingCart, exact: false },
  { to: '/profile', label: 'Профиль', icon: User, exact: false },
];

export function BottomNavbar() {
  const totalItems = useCartStore((s) => s.totalItems());

  const handleNavClick = () => {
    telegram.haptic.selection();
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-bottom bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border-t border-neutral-100 dark:border-neutral-800">
      <div className="flex items-center justify-around px-2 py-2">
        {NAV_ITEMS.map(({ to, label, icon: Icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            onClick={handleNavClick}
            className={({ isActive }) =>
              clsx(
                'flex flex-col items-center gap-1 py-1.5 transition-all duration-200 min-w-[60px]',
                isActive
                  ? 'text-di-red dark:text-di-red-light'
                  : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300',
              )
            }
          >
            {({ isActive }) => (
              <>
                {/* Soft pill highlight behind the active icon */}
                <div
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
                  {/* Cart badge */}
                  {label === 'Корзина' && totalItems > 0 && (
                    <span className="absolute top-0.5 right-1.5 bg-di-red text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 leading-none">
                      {totalItems > 99 ? '99+' : totalItems}
                    </span>
                  )}
                </div>
                <span
                  className={clsx(
                    'text-[10px] font-medium transition-colors',
                    isActive && 'font-semibold',
                  )}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
