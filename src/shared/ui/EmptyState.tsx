import { type ReactNode } from 'react';
import { PackageOpen, Search, ShoppingBag, Frown } from 'lucide-react';

type EmptyVariant = 'products' | 'search' | 'cart' | 'generic';

interface EmptyStateProps {
  variant?: EmptyVariant;
  title?: string;
  description?: string;
  action?: ReactNode;
}

const VARIANTS: Record<EmptyVariant, { icon: ReactNode; title: string; desc: string }> = {
  products: {
    icon: <PackageOpen className="w-12 h-12 text-neutral-400" />,
    title: 'Товары не найдены',
    desc: 'В этой категории пока нет товаров',
  },
  search: {
    icon: <Search className="w-12 h-12 text-neutral-400" />,
    title: 'Ничего не найдено',
    desc: 'Попробуйте изменить поисковый запрос',
  },
  cart: {
    icon: <ShoppingBag className="w-12 h-12 text-neutral-400" />,
    title: 'Корзина пуста',
    desc: 'Добавьте товары, чтобы оформить заказ',
  },
  generic: {
    icon: <Frown className="w-12 h-12 text-neutral-400" />,
    title: 'Нет данных',
    desc: 'Попробуйте обновить страницу',
  },
};

export function EmptyState({ variant = 'generic', title, description, action }: EmptyStateProps) {
  const v = VARIANTS[variant];
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center space-y-4">
      <div className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-full">
        {v.icon}
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-neutral-800 dark:text-neutral-100">
          {title ?? v.title}
        </h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {description ?? v.desc}
        </p>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
