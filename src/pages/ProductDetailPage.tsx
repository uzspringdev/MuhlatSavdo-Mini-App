import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Package, ChevronDown, Check, Heart } from 'lucide-react';
import DOMPurify from 'dompurify';
import { PageLayout } from '@/shared/ui/PageLayout';
import { InstalmentCalculator } from '@/features/products/ui/InstalmentCalculator';
import { ProductGallery } from '@/features/products/ui/ProductGallery';
import { RelatedProducts } from '@/features/products/ui/RelatedProducts';
import { useProductById, useProductVariantsByModel } from '@/features/products/hooks/useProducts';
import { useCartStore } from '@/features/orders/store/cartStore';
import { useFavoritesStore } from '@/features/favorites/store/favoritesStore';
import { formatPrice, getProductPriceInfo } from '@/shared/utils';
import { getMonthlyPayment } from '@/shared/utils/instalment';
import { flyToCart } from '@/shared/utils/flyToCart';
import { telegram } from '@/app/telegram/telegram';
import { useT, useLangStore } from '@/shared/i18n';
import { clsx } from 'clsx';

function Accordion({ title, children, defaultOpen = false }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-neutral-100 dark:border-neutral-800 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 text-left group"
      >
        <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200 group-active:text-di-red transition-colors">
          {title}
        </span>
        <ChevronDown className={clsx(
          "w-4 h-4 text-neutral-400 transition-transform duration-300",
          isOpen && "rotate-180 text-di-red"
        )} />
      </button>
      {/*
        Fixed max-height (e.g. max-h-[1000px]) clips any content taller than that —
        long product descriptions were getting cut off. This grid-rows trick animates
        smoothly to the content's real height, however long it is, with no fixed cap.
      */}
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-in-out"
        style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className={clsx(
            "pb-4 transition-opacity duration-300",
            isOpen ? "opacity-100" : "opacity-0"
          )}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  const t = useT();
  const lang = useLangStore((s) => s.lang);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [instalmentIdx, setInstalmentIdx] = useState(0);

  // Reset per-product selections when navigating between color variants.
  // (Adjusting state during render instead of an effect — see react.dev/learn/you-might-not-need-an-effect)
  // ProductGallery's own image-index state resets separately via `key={id}` below.
  const [prevId, setPrevId] = useState(id);
  if (id !== prevId) {
    setPrevId(id);
    setQty(1);
    setInstalmentIdx(0);
  }

  const { data: product, isLoading } = useProductById(Number(id));
  const { data: variantsData } = useProductVariantsByModel(product?.model?.id);
  const addItem = useCartStore((s) => s.addItem);
  const items = useCartStore((s) => s.items);
  const inCart = items.some((i) => i.productId === Number(id));
  const isFavorite = useFavoritesStore((s) => s.isFavorite(Number(id)));
  const toggleFavorite = useFavoritesStore((s) => s.toggle);

  // Color variants of the same model — one entry per distinct color
  const colorVariants = useMemo(() => {
    const seen = new Set<number>();
    const variants = [];
    for (const p of variantsData?.content ?? []) {
      if (p.color && !seen.has(p.color.id)) {
        seen.add(p.color.id);
        variants.push(p);
      }
    }
    return variants;
  }, [variantsData]);

  // Telegram BackButton
  useEffect(() => {
    const cleanup = telegram.showBackButton(() => navigate(-1));
    return () => {
      cleanup?.();
      telegram.hideBackButton();
    };
  }, [navigate]);

  // MainButton for "Add to cart"
  useEffect(() => {
    if (!product) return;
    const { finalPrice } = getProductPriceInfo(product);
    const label = inCart
      ? t('product.mainButtonInCart')
      : t('product.mainButtonAdd', { price: formatPrice(finalPrice * qty, product.currency, lang) });
    const cleanup = telegram.showMainButton(label, () => {
      if (product) {
        addItem(product, qty, product.instalments?.[instalmentIdx]?.months);
        telegram.haptic.success();
        navigate('/cart');
      }
    });
    return () => {
      cleanup?.();
      telegram.hideMainButton();
    };
  }, [product, qty, instalmentIdx, inCart, addItem, navigate, t, lang]);

  if (isLoading) {
    return (
      <PageLayout title={t('product.loadingTitle')} onBack={() => navigate(-1)} noPadding>
        <div className="space-y-4 p-4">
          <div className="aspect-square bg-neutral-200 dark:bg-neutral-800 rounded-2xl animate-pulse" />
          <div className="h-8 bg-neutral-100 dark:bg-neutral-800 rounded-lg w-3/4 animate-pulse" />
          <div className="h-6 bg-neutral-100 dark:bg-neutral-800 rounded-lg w-1/2 animate-pulse" />
          <div className="space-y-2 pt-4">
            <div className="h-20 bg-neutral-50 dark:bg-neutral-900 rounded-xl animate-pulse" />
            <div className="h-20 bg-neutral-50 dark:bg-neutral-900 rounded-xl animate-pulse" />
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!product) return null;

  const { originalPrice, finalPrice, hasDiscount, discountPercent } = getProductPriceInfo(product);
  const images = product.images ?? [];

  return (
    <PageLayout noPadding>
      <ProductGallery
        key={id}
        images={images}
        alt={product.name}
        onBack={!telegram.isInTelegram ? () => navigate(-1) : undefined}
        topRightSlot={
          <>
            <button
              onClick={() => {
                toggleFavorite(product);
                telegram.haptic.light();
              }}
              aria-label={isFavorite ? t('product.removeFromFavorites') : t('product.addToFavorites')}
              className="w-11 h-11 rounded-full bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm flex items-center justify-center shadow-sm"
            >
              <Heart
                className={clsx('w-5 h-5', isFavorite ? 'fill-di-red text-di-red' : 'text-neutral-700 dark:text-neutral-300')}
              />
            </button>
            {hasDiscount && (
              <span className="bg-di-red text-white text-xs font-black px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-lg shadow-di-red/30">
                {t('product.discount', { percent: discountPercent })}
              </span>
            )}
          </>
        }
      />

      {/* ── Product info ── */}
      <div className="px-4 pt-6 pb-32 space-y-6">
        {/* Brand + name */}
        <div className="space-y-1">
          {product.brand?.name && (
            <p className="text-xs font-black text-di-red uppercase tracking-[0.2em]">
              {product.brand.name}
            </p>
          )}
          <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-50 leading-tight tracking-tight">
            {product.name}
          </h1>
        </div>

        {/* Price + qty */}
        <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-900 p-4 rounded-card border border-neutral-100 dark:border-neutral-800">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-di-red dark:text-di-red-light tracking-tight">
                {formatPrice(finalPrice, product.currency, lang)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-neutral-500 dark:text-neutral-400 line-through font-bold">
                  {formatPrice(originalPrice, product.currency, lang)}
                </span>
              )}
            </div>
            {product.instalments?.[instalmentIdx] && (
              <p className="text-xs font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-widest mt-1">
                {t('product.perMonth', {
                  price: formatPrice(getMonthlyPayment(product.instalments[instalmentIdx]), product.currency, lang),
                })}
              </p>
            )}
          </div>

          {/* Qty selector */}
          <div className="flex items-center gap-2 bg-white dark:bg-neutral-800 rounded-el p-1 shadow-sm border border-neutral-100 dark:border-neutral-700">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              aria-label="−1"
              className="w-11 h-11 rounded-el bg-neutral-50 dark:bg-neutral-700 flex items-center justify-center font-bold text-neutral-700 dark:text-neutral-200 active:scale-90 transition-transform"
            >
              −
            </button>
            <span className="w-6 text-center text-sm font-black text-neutral-900 dark:text-neutral-100">
              {qty}
            </span>
            <button
              onClick={() => setQty((q) => Math.min(product.quantity, q + 1))}
              aria-label="+1"
              className="w-11 h-11 rounded-el bg-di-red flex items-center justify-center font-bold text-white shadow-md shadow-di-red/20 active:scale-90 transition-transform"
            >
              +
            </button>
          </div>
        </div>

        {/* Variations/Info Cards */}
        <div className="grid grid-cols-2 gap-3">
           {/* Color */}
          {product.color && (
            <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800">
              <div
                className="w-6 h-6 rounded-lg border-2 border-white dark:border-neutral-700 shadow-sm"
                style={{ backgroundColor: product.color.heh || '#ccc' }}
              />
              <div className="min-w-0">
                <p className="text-xs text-neutral-500 dark:text-neutral-400 font-bold uppercase tracking-widest">{t('product.color')}</p>
                <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200 truncate">{product.color.name}</p>
              </div>
            </div>
          )}

          {/* Stock — emerald tint signals a positive/in-stock status, distinct from discount red */}
          <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-100 dark:border-emerald-900/50">
            <Package className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <div className="min-w-0">
              <p className="text-xs text-emerald-700/70 dark:text-emerald-400/70 font-bold uppercase tracking-widest">{t('product.stock')}</p>
              <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 truncate">{t('product.stockCount', { count: product.quantity })}</p>
            </div>
          </div>
        </div>

        {/* Color variant switcher */}
        {colorVariants.length > 1 && (
          <div className="space-y-2">
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-bold uppercase tracking-widest">
              {t('product.selectColor')}
            </p>
            <div className="flex flex-wrap gap-3">
              {colorVariants.map((variant) => {
                const isActive = variant.id === product.id;
                return (
                  <button
                    key={variant.color!.id}
                    onClick={() => {
                      if (!isActive) {
                        telegram.haptic.selection();
                        navigate(`/product/${variant.id}`, { replace: true });
                      }
                    }}
                    aria-label={variant.color!.name}
                    className={clsx(
                      'relative w-11 h-11 rounded-full flex items-center justify-center transition-transform active:scale-90',
                      isActive
                        ? 'ring-2 ring-di-red ring-offset-2 ring-offset-white dark:ring-offset-neutral-950'
                        : '',
                    )}
                  >
                    <span
                      className="w-8 h-8 rounded-full border-2 border-white dark:border-neutral-700 shadow-sm flex items-center justify-center"
                      style={{ backgroundColor: variant.color!.heh || '#ccc' }}
                    >
                      {isActive && (
                        <Check
                          className="w-4 h-4"
                          style={{
                            color: variant.color!.heh?.toLowerCase() === '#ffffff' ? '#111' : '#fff',
                          }}
                        />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Instalment calculator */}
        {product.instalments && product.instalments.length > 0 && (
          <InstalmentCalculator
            instalments={product.instalments}
            selectedIndex={instalmentIdx}
            onSelect={setInstalmentIdx}
            currency={product.currency}
          />
        )}

        {/* Collapsible Sections (Accordions) */}
        <div className="bg-neutral-50 dark:bg-neutral-900 px-4 rounded-card border border-neutral-100 dark:border-neutral-800">
          {/* Description */}
          {product.description && (
            <Accordion title={t('product.description').toUpperCase()} defaultOpen>
              <div
                className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.description) }}
              />
            </Accordion>
          )}

          {/* Attributes */}
          {product.attributes && product.attributes.length > 0 && (
            <Accordion title={t('product.attributes').toUpperCase()}>
              <div className="space-y-3">
                {product.attributes.map((attr, i) => (
                  <div key={i} className="flex justify-between items-end gap-4 text-xs">
                    <span className="text-neutral-500 dark:text-neutral-400 font-medium uppercase tracking-wider flex-shrink-0">
                      {attr.name}
                    </span>
                    <div className="flex-1 border-b border-dotted border-neutral-200 dark:border-neutral-800 mb-1" />
                    <span className="font-bold text-neutral-800 dark:text-neutral-200 text-right">
                      {attr.value}
                    </span>
                  </div>
                ))}
              </div>
            </Accordion>
          )}
        </div>

        {/* Add to cart (fallback for non-Telegram) */}
        {!telegram.isInTelegram && (
          <button
            onClick={(e) => {
              addItem(product, qty, product.instalments?.[instalmentIdx]?.months);
              flyToCart(e.currentTarget);
              telegram.haptic.success();
            }}
            className={clsx(
              'w-full h-16 rounded-el font-black text-sm uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-3 shadow-xl active:scale-[0.98]',
              inCart
                ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                : 'bg-di-red text-white shadow-di-red/30',
            )}
          >
            <ShoppingCart className="w-5 h-5" />
            {inCart ? `✓ ${t('product.inCart')}` : t('product.addToCart')}
          </button>
        )}
      </div>

      <RelatedProducts
        currentProductId={product.id}
        categoryId={product.category?.id}
        brandId={product.brand?.id}
      />
    </PageLayout>
  );
}
