import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, ChevronLeft, ChevronRight, Package, ChevronDown, Check } from 'lucide-react';
import DOMPurify from 'dompurify';
import { PageLayout } from '@/shared/ui/PageLayout';
import { useProductById, useProductVariantsByModel } from '@/features/products/hooks/useProducts';
import { useCartStore } from '@/features/orders/store/cartStore';
import { formatPrice, resolveImage, getProductPriceInfo, getMonthlyInstalmentPrice } from '@/shared/utils';
import { telegram } from '@/app/telegram/telegram';
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
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentImg, setCurrentImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [instalmentIdx, setInstalmentIdx] = useState(0);

  // Reset per-product selections when navigating between color variants.
  // (Adjusting state during render instead of an effect — see react.dev/learn/you-might-not-need-an-effect)
  const [prevId, setPrevId] = useState(id);
  if (id !== prevId) {
    setPrevId(id);
    setCurrentImg(0);
    setQty(1);
    setInstalmentIdx(0);
  }

  const { data: product, isLoading } = useProductById(Number(id));
  const { data: variantsData } = useProductVariantsByModel(product?.model?.id);
  const addItem = useCartStore((s) => s.addItem);
  const items = useCartStore((s) => s.items);
  const inCart = items.some((i) => i.productId === Number(id));

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
    const label = inCart ? '✓ В корзине' : `В корзину — ${formatPrice(finalPrice * qty, product.currency)}`;
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
  }, [product, qty, instalmentIdx, inCart, addItem, navigate]);

  if (isLoading) {
    return (
      <PageLayout title="Товар" onBack={() => navigate(-1)} noPadding>
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
      {/* ── Image carousel ── */}
      <div className="relative bg-neutral-50 dark:bg-neutral-900">
        <div className="aspect-square overflow-hidden">
          {images.length > 0 ? (
            <img
              src={resolveImage(images[currentImg]?.url || images[currentImg]?.name)}
              alt={product.name}
              className="w-full h-full object-cover transition-opacity duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-20 h-20 text-neutral-300" />
            </div>
          )}
        </div>

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-9 h-9 rounded-xl bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm flex items-center justify-center shadow-sm z-10"
        >
          <ChevronLeft className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
        </button>

        {/* Image navigation */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setCurrentImg((p) => (p - 1 + images.length) % images.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow z-10"
            >
              <ChevronLeft className="w-4 h-4 text-neutral-800" />
            </button>
            <button
              onClick={() => setCurrentImg((p) => (p + 1) % images.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow z-10"
            >
              <ChevronRight className="w-4 h-4 text-neutral-800" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImg(i)}
                  className={clsx(
                    'h-1.5 rounded-full transition-all',
                    i === currentImg ? 'w-4 bg-di-red' : 'w-1.5 bg-neutral-400/50',
                  )}
                />
              ))}
            </div>
          </>
        )}

        {hasDiscount && (
          <span className="absolute top-4 right-4 bg-di-red text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-lg shadow-di-red/30 z-10">
            Скидка {discountPercent}%
          </span>
        )}
      </div>

      {/* ── Product info ── */}
      <div className="px-4 pt-6 pb-32 space-y-6">
        {/* Brand + name */}
        <div className="space-y-1">
          {product.brand?.name && (
            <p className="text-[10px] font-black text-di-red uppercase tracking-[0.2em]">
              {product.brand.name}
            </p>
          )}
          <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-50 leading-tight tracking-tight">
            {product.name}
          </h1>
        </div>

        {/* Price + qty */}
        <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-900 p-4 rounded-[2rem] border border-neutral-100 dark:border-neutral-800">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-di-red dark:text-di-red-light tracking-tight">
                {formatPrice(finalPrice, product.currency)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-neutral-400 line-through font-bold">
                  {formatPrice(originalPrice, product.currency)}
                </span>
              )}
            </div>
            {product.instalments?.[instalmentIdx] && (
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mt-1">
                {formatPrice(getMonthlyInstalmentPrice(product.instalments[instalmentIdx]), product.currency)} / мес
              </p>
            )}
          </div>

          {/* Qty selector */}
          <div className="flex items-center gap-2 bg-white dark:bg-neutral-800 rounded-2xl p-1 shadow-sm border border-neutral-100 dark:border-neutral-700">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="w-8 h-8 rounded-xl bg-neutral-50 dark:bg-neutral-700 flex items-center justify-center font-bold text-neutral-700 dark:text-neutral-200 active:scale-90 transition-transform"
            >
              −
            </button>
            <span className="w-6 text-center text-sm font-black text-neutral-900 dark:text-neutral-100">
              {qty}
            </span>
            <button
              onClick={() => setQty((q) => Math.min(product.quantity, q + 1))}
              className="w-8 h-8 rounded-xl bg-di-red flex items-center justify-center font-bold text-white shadow-md shadow-di-red/20 active:scale-90 transition-transform"
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
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Цвет</p>
                <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200 truncate">{product.color.name}</p>
              </div>
            </div>
          )}

          {/* Stock — emerald tint signals a positive/in-stock status, distinct from discount red */}
          <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-100 dark:border-emerald-900/50">
            <Package className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <div className="min-w-0">
              <p className="text-[10px] text-emerald-700/70 dark:text-emerald-400/70 font-bold uppercase tracking-widest">Склад</p>
              <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 truncate">{product.quantity} шт.</p>
            </div>
          </div>
        </div>

        {/* Color variant switcher */}
        {colorVariants.length > 1 && (
          <div className="space-y-2">
            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">
              Выберите цвет
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
                      'relative w-10 h-10 rounded-full flex items-center justify-center transition-transform active:scale-90',
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

        {/* Instalment plans */}
        {product.instalments && product.instalments.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">
              Рассрочка
            </p>
            <div className="flex flex-wrap gap-2">
              {product.instalments.map((plan, i) => (
                <button
                  key={plan.months}
                  onClick={() => setInstalmentIdx(i)}
                  className={clsx(
                    'flex-1 min-w-[90px] px-3 py-2.5 rounded-2xl border text-center transition-colors',
                    // Amber, not red — rassrochka is a different kind of signal than a discount
                    i === instalmentIdx
                      ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-400 dark:border-amber-600 text-amber-700 dark:text-amber-400'
                      : 'bg-neutral-50 dark:bg-neutral-900 border-neutral-100 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400',
                  )}
                >
                  <p className="text-xs font-black">{plan.months} мес</p>
                  <p className="text-[10px] font-bold mt-0.5">
                    {formatPrice(getMonthlyInstalmentPrice(plan), product.currency)}/мес
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Collapsible Sections (Accordions) */}
        <div className="bg-neutral-50 dark:bg-neutral-900 px-4 rounded-[2rem] border border-neutral-100 dark:border-neutral-800">
          {/* Description */}
          {product.description && (
            <Accordion title="ОПИСАНИЕ" defaultOpen>
              <div
                className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.description) }}
              />
            </Accordion>
          )}

          {/* Attributes */}
          {product.attributes && product.attributes.length > 0 && (
            <Accordion title="ХАРАКТЕРИСТИКИ">
              <div className="space-y-3">
                {product.attributes.map((attr, i) => (
                  <div key={i} className="flex justify-between items-end gap-4 text-xs">
                    <span className="text-neutral-400 font-medium uppercase tracking-wider flex-shrink-0">
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
            onClick={() => {
              addItem(product, qty, product.instalments?.[instalmentIdx]?.months);
              telegram.haptic.success();
            }}
            className={clsx(
              'w-full h-16 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-3 shadow-xl active:scale-[0.98]',
              inCart
                ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                : 'bg-di-red text-white shadow-di-red/30',
            )}
          >
            <ShoppingCart className="w-5 h-5" />
            {inCart ? '✓ В КОРЗИНЕ' : 'ДОБАВИТЬ В КОРЗИНU'}
          </button>
        )}
      </div>
    </PageLayout>
  );
}
