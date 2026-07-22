import { Link } from 'react-router-dom';
import { ShoppingCart, Zap } from 'lucide-react';
import { clsx } from 'clsx';
import type { ProductDto } from '@/shared/types';
import { formatPrice, resolveImage, getProductPriceInfo, getMonthlyInstalmentPrice, getCheapestInstalment } from '@/shared/utils';
import { useCartStore } from '@/features/orders/store/cartStore';
import { telegram } from '@/app/telegram/telegram';

interface ProductCardProps {
  product: ProductDto;
  className?: string;
  compact?: boolean;
}

export function ProductCard({ product, className, compact = false }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const items = useCartStore((s) => s.items);
  const inCart = items.some((i) => i.productId === product.id);

  const primaryImage =
    product.images?.[0]?.url ||
    product.images?.[0]?.name ||
    undefined;

  const { originalPrice, finalPrice, hasDiscount, discountPercent } = getProductPriceInfo(product);
  const cheapestInstalment = getCheapestInstalment(product.instalments);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    telegram.haptic.medium();
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className={clsx(
        'block bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 active:scale-95',
        className,
      )}
    >
      {/* Image */}
      <div className={clsx('relative overflow-hidden bg-neutral-50 dark:bg-neutral-900 p-4', compact ? 'aspect-square' : 'aspect-[4/5]')}>
        {primaryImage ? (
          <>
            {/* Soft "floor" shadow the product appears to rest on — adds depth instead of a flat cutout look */}
            <div className="absolute left-1/2 bottom-3 -translate-x-1/2 w-2/3 h-4 rounded-full bg-black/10 dark:bg-black/40 blur-md" />
            <img
              src={resolveImage(primaryImage)}
              alt={product.name}
              className="relative w-full h-full object-contain transition-transform duration-500 hover:scale-105"
              loading="lazy"
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingCart className="w-10 h-10 text-neutral-300" />
          </div>
        )}

        {/* Discount — corner ribbon instead of a plain chip, reads as "sale" at a glance */}
        {hasDiscount && (
          <div className="absolute -left-9 top-3 w-28 -rotate-45 bg-di-red text-white text-[10px] font-black text-center py-1 shadow-md shadow-black/20 z-10">
            -{discountPercent}%
          </div>
        )}

        {/* Hot badge — soft glow ring so it still feels distinct next to the ribbon */}
        {product.badges?.find((b) => b.displayName?.toLowerCase().includes('new')) && (
          <span className="absolute top-2 right-2 bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-md shadow-emerald-500/40 ring-1 ring-white/40 z-10">
            <Zap className="w-3 h-3" /> NEW
          </span>
        )}

        {/* Add to cart button */}
        <button
          onClick={handleAddToCart}
          className={clsx(
            'absolute bottom-2 right-2 w-9 h-9 rounded-xl flex items-center justify-center shadow-lg transition-all duration-200 active:scale-90',
            inCart
              ? 'bg-di-red text-white'
              : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-di-red hover:text-white',
          )}
          aria-label="Add to cart"
        >
          <ShoppingCart className="w-4 h-4" />
        </button>
      </div>

      {/* Info */}
      <div className="p-3 space-y-1.5">
        <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
          {product.brand?.name ?? product.category?.name ?? ''}
        </p>
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50 leading-tight line-clamp-2">
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-base font-bold text-di-red dark:text-di-red-light">
            {formatPrice(finalPrice, product.currency)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-neutral-400 line-through">
              {formatPrice(originalPrice, product.currency)}
            </span>
          )}
        </div>

        {/* Installment hint — eng arzon oylik to'lov ko'rsatiladi */}
        {cheapestInstalment && (
          <p className="text-[10px] text-neutral-400 dark:text-neutral-500">
            от {formatPrice(getMonthlyInstalmentPrice(cheapestInstalment), product.currency)}/мес
          </p>
        )}
      </div>
    </Link>
  );
}
