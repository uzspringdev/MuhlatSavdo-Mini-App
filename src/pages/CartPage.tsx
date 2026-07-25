import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { PageLayout } from '@/shared/ui/PageLayout';
import { EmptyState } from '@/shared/ui/EmptyState';
import { PhoneInput } from '@/shared/ui/PhoneInput';
import { useCartStore } from '@/features/orders/store/cartStore';
import { useAuthStore } from '@/features/auth/store/authStore';
import { formatPrice, resolveImage, getProductPriceInfo, isRealUzPhone } from '@/shared/utils';
import { getMonthlyPayment } from '@/shared/utils/instalment';
import { telegram } from '@/app/telegram/telegram';
import { cartService } from '@/features/orders/services/cartService';
import { toast } from '@/shared/store/toastStore';
import { useT, useLangStore } from '@/shared/i18n';
import { clsx } from 'clsx';

export default function CartPage() {
  const t = useT();
  const lang = useLangStore((s) => s.lang);
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const updateInstalment = useCartStore((s) => s.updateInstalment);
  const clearCart = useCartStore((s) => s.clearCart);
  const totalPrice = useCartStore((s) => s.totalPrice());
  const { customer } = useAuthStore();
  const tgUser = telegram.user;

  const [name, setName] = useState(() => {
    if (customer?.firstName) return `${customer.firstName} ${customer.lastname ?? ''}`.trim();
    if (tgUser?.first_name) return `${tgUser.first_name} ${tgUser.last_name ?? ''}`.trim();
    return '';
  });
  // customer.phoneNumber yangi mijozlarda vaqtincha Telegram username bilan to'ldirilgan
  // bo'lishi mumkin — buni haqiqiy telefon sifatida maydonga tushirmaymiz.
  const [phoneDigits, setPhoneDigits] = useState(
    isRealUzPhone(customer?.phoneNumber) ? customer!.phoneNumber!.slice(4) : '',
  );
  const [phoneError, setPhoneError] = useState('');
  const [ordering, setOrdering] = useState(false);
  const [success, setSuccess] = useState(false);
  const [failedImageIds, setFailedImageIds] = useState<Set<number>>(new Set());

  const currency = items[0]?.product?.currency ?? 'UZS';
  const fullPhone = `+998${phoneDigits}`;

  // "Muhlat bilan jami" va "Bugun to'lanadi" — tanlangan muhlat bo'lmagan tovarlar
  // uchun naqd narx bugun to'liq to'lanadi deb hisoblanadi.
  const hasAnyInstalment = items.some((i) => i.selectedInstalmentMonths);
  const totalWithInstalment = items.reduce((sum, i) => {
    if (!i.product) return sum;
    const instalment = i.product.instalments?.find((p) => p.months === i.selectedInstalmentMonths);
    if (instalment) return sum + instalment.price * i.quantity;
    return sum + getProductPriceInfo(i.product).finalPrice * i.quantity;
  }, 0);
  const payToday = items.reduce((sum, i) => {
    if (!i.product) return sum;
    const instalment = i.product.instalments?.find((p) => p.months === i.selectedInstalmentMonths);
    if (instalment) return sum + getMonthlyPayment(instalment) * i.quantity;
    return sum + getProductPriceInfo(i.product).finalPrice * i.quantity;
  }, 0);

  const handleOrder = async () => {
    if (!isRealUzPhone(fullPhone)) {
      setPhoneError(t('cart.phoneIncomplete'));
      telegram.haptic.error();
      return;
    }
    if (!name) {
      telegram.haptic.error();
      return;
    }
    setPhoneError('');
    setOrdering(true);
    telegram.setMainButtonLoading(true);
    try {
      await cartService.purchase({
        name,
        phoneNumber: fullPhone,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          instalmentMonths: i.selectedInstalmentMonths,
        })),
      });
      clearCart();
      setSuccess(true);
      telegram.haptic.success();
    } catch {
      telegram.haptic.error();
      toast.error(t('cart.orderError'));
    } finally {
      setOrdering(false);
      telegram.setMainButtonLoading(false);
    }
  };

  if (success) {
    return (
      <PageLayout title={t('cart.title')} showNav>
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
            <span className="text-4xl">🎉</span>
          </div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
            {t('cart.orderPlaced')}
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-xs">
            {t('cart.orderPlacedDesc')}
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-di-red text-white px-6 py-3 min-h-[44px] rounded-el font-bold mt-4"
          >
            {t('cart.toHome')}
          </button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={t('cart.title')} showNav>
      {items.length === 0 ? (
        <EmptyState
          variant="cart"
          action={
            <button
              onClick={() => navigate('/catalog')}
              className="bg-di-red text-white px-6 py-3 min-h-[44px] rounded-el font-bold"
            >
              {t('cart.goToCatalog')}
            </button>
          }
        />
      ) : (
        <div className="space-y-4 pt-4 pb-6">
          {/* Items */}
          {items.map(({ product, quantity, productId, selectedInstalmentMonths }) => {
            if (!product) return null;
            const imgUrl = product.images?.[0]?.url || product.images?.[0]?.name;
            const selectedInstalment = product.instalments?.find((p) => p.months === selectedInstalmentMonths);
            return (
              <div
                key={productId}
                className="flex gap-3 bg-white dark:bg-neutral-900 rounded-card p-3 shadow-sm"
              >
                <div className="w-20 h-20 rounded-el overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex-shrink-0">
                  {imgUrl && !failedImageIds.has(productId) ? (
                    <img
                      src={resolveImage(imgUrl)}
                      alt={product.name}
                      width={80}
                      height={80}
                      loading="lazy"
                      onError={() => setFailedImageIds((prev) => new Set(prev).add(productId))}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="w-8 h-8 text-neutral-300" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-50 line-clamp-2 leading-tight">
                    {product.name}
                  </p>

                  {selectedInstalment ? (
                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-bold text-di-red dark:text-di-red-light">
                        {t('product.perMonth', {
                          price: formatPrice(getMonthlyPayment(selectedInstalment), product.currency, lang),
                        })}
                      </span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        {t('product.instalmentSummary', {
                          months: selectedInstalment.months,
                          total: formatPrice(selectedInstalment.price, product.currency, lang),
                        })}
                      </span>
                    </div>
                  ) : (
                    (() => {
                      const { originalPrice, finalPrice, hasDiscount } = getProductPriceInfo(product);
                      return (
                        <div className="flex items-baseline gap-2">
                          <span className="text-base font-bold text-di-red dark:text-di-red-light">
                            {formatPrice(finalPrice, product.currency, lang)}
                          </span>
                          {hasDiscount && (
                            <span className="text-xs text-neutral-500 dark:text-neutral-400 line-through">
                              {formatPrice(originalPrice, product.currency, lang)}
                            </span>
                          )}
                        </div>
                      );
                    })()
                  )}

                  {/* Change instalment plan right in the cart — the plan chosen on
                      the product page carries over, but isn't locked in. */}
                  {product.instalments && product.instalments.length > 0 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar py-0.5">
                      <button
                        onClick={() => updateInstalment(productId, undefined)}
                        className={clsx(
                          'flex-shrink-0 px-3 min-h-[36px] rounded-el text-caption font-bold border transition-colors',
                          !selectedInstalment
                            ? 'bg-di-red border-di-red text-white'
                            : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400',
                        )}
                      >
                        {t('cart.cash')}
                      </button>
                      {product.instalments.map((plan) => (
                        <button
                          key={plan.months}
                          onClick={() => updateInstalment(productId, plan.months)}
                          className={clsx(
                            'flex-shrink-0 px-3 min-h-[36px] rounded-el text-caption font-bold border transition-colors',
                            selectedInstalment?.months === plan.months
                              ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-400 dark:border-amber-600 text-amber-700 dark:text-amber-400'
                              : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400',
                          )}
                        >
                          {t('product.instalmentMonths', { months: plan.months })}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-el p-0.5">
                      <button
                        onClick={() => {
                          updateQuantity(productId, quantity - 1);
                          telegram.haptic.light();
                        }}
                        aria-label="−1"
                        className="w-11 h-11 rounded-el bg-white dark:bg-neutral-700 flex items-center justify-center text-neutral-700 dark:text-neutral-200 font-bold shadow-sm text-sm"
                      >
                        −
                      </button>
                      <span className="w-5 text-center text-sm font-semibold">{quantity}</span>
                      <button
                        onClick={() => {
                          updateQuantity(productId, quantity + 1);
                          telegram.haptic.light();
                        }}
                        aria-label="+1"
                        className="w-11 h-11 rounded-el bg-di-red flex items-center justify-center text-white font-bold shadow-sm text-sm"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        removeItem(productId);
                        telegram.haptic.medium();
                      }}
                      aria-label={t('cart.removeItem')}
                      className="ml-auto w-11 h-11 flex items-center justify-center text-neutral-500 dark:text-neutral-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Order form */}
          <div className="bg-white dark:bg-neutral-900 rounded-card p-4 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
              {t('cart.orderData')}
            </h3>
            <input
              type="text"
              placeholder={t('cart.namePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-el px-4 py-3 text-sm text-neutral-800 dark:text-neutral-200 placeholder-neutral-500 dark:placeholder-neutral-400 outline-none transition-colors focus:border-di-red"
            />
            <PhoneInput
              value={phoneDigits}
              onChange={(digits) => {
                setPhoneDigits(digits);
                if (phoneError) setPhoneError('');
              }}
              error={phoneError}
            />
          </div>

          {/* Total + order */}
          <div className="bg-white dark:bg-neutral-900 rounded-card p-4 shadow-sm space-y-3">
            {hasAnyInstalment ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">{t('cart.totalCash')}</span>
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    {formatPrice(totalPrice, currency, lang)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">{t('cart.totalWithInstalment')}</span>
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    {formatPrice(totalWithInstalment, currency, lang)}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1.5 border-t border-neutral-100 dark:border-neutral-800">
                  <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{t('cart.payToday')}</span>
                  <span className="text-lg font-black text-di-red dark:text-di-red-light">
                    {formatPrice(payToday, currency, lang)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">{t('cart.total')}</span>
                <span className="text-lg font-black text-di-red dark:text-di-red-light">
                  {formatPrice(totalPrice, currency, lang)}
                </span>
              </div>
            )}
            <button
              onClick={handleOrder}
              disabled={ordering || !name || phoneDigits.length < 9}
              className={clsx(
                'w-full py-4 min-h-[44px] rounded-el font-bold text-base transition-all duration-200 flex items-center justify-center gap-2',
                ordering || !name || phoneDigits.length < 9
                  ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-400 cursor-not-allowed'
                  : 'bg-di-red text-white hover:bg-red-700 active:scale-95',
              )}
            >
              {ordering ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {t('cart.placeOrder')} <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
