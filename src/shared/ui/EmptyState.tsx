import { type ReactNode } from 'react';
import { PackageOpen, Search, ShoppingBag, Frown, Heart } from 'lucide-react';
import { useT } from '@/shared/i18n';

type EmptyVariant = 'products' | 'search' | 'cart' | 'generic' | 'favorites';

interface EmptyStateProps {
  variant?: EmptyVariant;
  title?: string;
  description?: string;
  action?: ReactNode;
}

const VARIANTS: Record<EmptyVariant, { icon: ReactNode; titleKey: string; descKey: string }> = {
  products: {
    icon: <PackageOpen className="w-12 h-12 text-neutral-400" />,
    titleKey: 'empty.productsTitle',
    descKey: 'empty.productsDesc',
  },
  search: {
    icon: <Search className="w-12 h-12 text-neutral-400" />,
    titleKey: 'empty.searchTitle',
    descKey: 'empty.searchDesc',
  },
  cart: {
    icon: <ShoppingBag className="w-12 h-12 text-neutral-400" />,
    titleKey: 'empty.cartTitle',
    descKey: 'empty.cartDesc',
  },
  generic: {
    icon: <Frown className="w-12 h-12 text-neutral-400" />,
    titleKey: 'empty.genericTitle',
    descKey: 'empty.genericDesc',
  },
  favorites: {
    icon: <Heart className="w-12 h-12 text-neutral-400" />,
    titleKey: 'empty.favoritesTitle',
    descKey: 'empty.favoritesDesc',
  },
};

export function EmptyState({ variant = 'generic', title, description, action }: EmptyStateProps) {
  const t = useT();
  const v = VARIANTS[variant];
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center space-y-4">
      <div className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-full">
        {v.icon}
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-neutral-800 dark:text-neutral-100">
          {title ?? t(v.titleKey)}
        </h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {description ?? t(v.descKey)}
        </p>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
