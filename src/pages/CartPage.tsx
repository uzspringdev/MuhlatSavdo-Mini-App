import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { PageLayout } from '@/shared/ui/PageLayout';
import { EmptyState } from '@/shared/ui/EmptyState';
import { useCartStore } from '@/features/orders/store/cartStore';
import { useAuthStore } from '@/features/auth/store/authStore';
import { formatPrice, resolveImage, getProductPriceInfo, isRealUzPhone } from '@/shared/utils';
import { telegram } from '@/app/telegram/telegram';
import { cartService } from '@/features/orders/services/cartService';
import { clsx } from 'clsx';

export default function CartPage() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
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
  const [phone, setPhone] = useState(isRealUzPhone(customer?.phoneNumber) ? customer!.phoneNumber! : '');
  const [ordering, setOrdering] = useState(false);
  const [success, setSuccess] = useState(false);

  const currency = items[0]?.product?.currency ?? 'UZS';

  const handleOrder = async () => {
    if (!name || !phone) {
      telegram.haptic.error();
      return;
    }
    setOrdering(true);
    telegram.setMainButtonLoading(true);
    try {
      await cartService.purchase({
        name,
        phoneNumber: phone,
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
    } finally {
      setOrdering(false);
      telegram.setMainButtonLoading(false);
    }
  };

  if (success) {
    return (
      <PageLayout title="Корзина" showNav>
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
            <span className="text-4xl">🎉</span>
          </div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
            Заказ оформлен!
          </h2>
          <p className="text-sm text-neutral-500 max-w-xs">
            Наш менеджер свяжется с вами в ближайшее время
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-di-red text-white px-6 py-3 rounded-2xl font-bold mt-4"
          >
            На главную
          </button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Корзина" showNav>
      {items.length === 0 ? (
        <EmptyState
          variant="cart"
          action={
            <button
              onClick={() => navigate('/catalog')}
              className="bg-di-red text-white px-6 py-3 rounded-2xl font-bold"
            >
              Перейти в каталог
            </button>
          }
        />
      ) : (
        <div className="space-y-4 pt-4 pb-6">
          {/* Items */}
          {items.map(({ product, quantity, productId }) => {
            if (!product) return null;
            const imgUrl = product.images?.[0]?.url || product.images?.[0]?.name;
            return (
              <div
                key={productId}
                className="flex gap-3 bg-white dark:bg-neutral-900 rounded-2xl p-3 shadow-sm"
              >
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex-shrink-0">
                  {imgUrl ? (
                    <img
                      src={resolveImage(imgUrl)}
                      alt={product.name}
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
                  
                  {(() => {
                    const { originalPrice, finalPrice, hasDiscount } = getProductPriceInfo(product);
                    return (
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
                    );
                  })()}

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl p-0.5">
                      <button
                        onClick={() => {
                          updateQuantity(productId, quantity - 1);
                          telegram.haptic.light();
                        }}
                        className="w-7 h-7 rounded-lg bg-white dark:bg-neutral-700 flex items-center justify-center text-neutral-700 dark:text-neutral-200 font-bold shadow-sm text-sm"
                      >
                        −
                      </button>
                      <span className="w-5 text-center text-sm font-semibold">{quantity}</span>
                      <button
                        onClick={() => {
                          updateQuantity(productId, quantity + 1);
                          telegram.haptic.light();
                        }}
                        className="w-7 h-7 rounded-lg bg-di-red flex items-center justify-center text-white font-bold shadow-sm text-sm"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        removeItem(productId);
                        telegram.haptic.medium();
                      }}
                      className="ml-auto p-1.5 text-neutral-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Order form */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
              Данные для заказа
            </h3>
            <input
              type="text"
              placeholder="Ваше имя"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-3 text-sm text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-di-red/30 focus:border-di-red"
            />
            <input
              type="tel"
              placeholder="+998 XX XXX XX XX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-3 text-sm text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-di-red/30 focus:border-di-red"
            />
          </div>

          {/* Total + order */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">Итого</span>
              <span className="text-lg font-black text-di-red dark:text-di-red-light">
                {formatPrice(totalPrice, currency)}
              </span>
            </div>
            <button
              onClick={handleOrder}
              disabled={ordering || !name || !phone}
              className={clsx(
                'w-full py-4 rounded-2xl font-bold text-base transition-all duration-200 flex items-center justify-center gap-2',
                ordering || !name || !phone
                  ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-400 cursor-not-allowed'
                  : 'bg-di-red text-white hover:bg-red-700 active:scale-95',
              )}
            >
              {ordering ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Оформить заказ <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
