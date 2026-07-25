/**
 * Yangi mijoz yaratilganda backend `phoneNumber`ni vaqtincha Telegram username bilan
 * to'ldiradi (haqiqiy telefon emas). Shu qiymatni haqiqiy O'zbekiston raqami sifatida
 * ko'rsatib/ishlatib qo'ymaslik uchun tekshiruv.
 */
export function isRealUzPhone(phone?: string | null): boolean {
  return !!phone && /^\+998\d{9}$/.test(phone);
}

/** Format price with currency. `lang` only affects the UZS unit label ("сум" vs "so'm"). */
export function formatPrice(
  price: number,
  currency: 'UZS' | 'USD' | 'RUB' = 'UZS',
  lang: 'ru' | 'uz' = 'ru',
): string {
  if (currency === 'USD') {
    return `$${price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
  }
  if (currency === 'RUB') {
    return `${price.toLocaleString('ru-RU')} ₽`;
  }
  // UZS
  const unit = lang === 'uz' ? "so'm" : 'сум';
  return `${price.toLocaleString('uz-UZ')} ${unit}`;
}

/** Truncate text to n chars */
export function truncate(text: string, n: number): string {
  if (text.length <= n) return text;
  return text.slice(0, n) + '…';
}

/** Resolve image URL from backend response */
export function resolveImage(
  urlOrName?: string,
  baseUrl?: string,
): string {
  if (!urlOrName) return '/placeholder.png';
  if (urlOrName.startsWith('http')) return urlOrName;
  
  const base = baseUrl || import.meta.env.VITE_IMAGE_BASE_URL || import.meta.env.VITE_API_BASE_URL || 'https://api.muhlatsavdo.uz';
  const cleanBase = base.replace(/\/+$/, '');
  const cleanPath = urlOrName.startsWith('/') ? urlOrName : `/${urlOrName}`;
  
  if (cleanBase.endsWith('/uploads/images') && cleanPath.startsWith('/uploads/images')) {
    return cleanBase.replace('/uploads/images', '') + cleanPath;
  }
  
  if (!cleanPath.startsWith('/uploads/')) {
    return `${cleanBase}/uploads/images${cleanPath}`;
  }

  return `${cleanBase}${cleanPath}`;
}

/** Calculate discount percentage and final prices */
import type { ProductDto } from '@/shared/types';

/**
 * Ko'rsatiladigan narx har doim basePrice'dan hisoblanadi. `product.price` maydoni
 * admin panelda ba'zan noto'g'ri/test qiymat bilan qolib ketishi mumkin (masalan
 * price=10 bo'lib, basePrice=1090 turgan holatlar uchraydi) — shuning uchun uni
 * "chegirma" sifatida talqin qilmaymiz. Chegirma FAQAT haqiqiy `discount` obyekti
 * (isActive + value) mavjud bo'lgandagina qo'llanadi.
 */
export function getProductPriceInfo(product: ProductDto) {
  const originalPrice = product.basePrice || product.price || 0;
  let finalPrice = originalPrice;
  let discountPercent = 0;
  let hasDiscount = false;

  if (product.discount?.isActive && product.discount.value > 0) {
    hasDiscount = true;
    discountPercent = product.discount.value;
    finalPrice = originalPrice - (originalPrice * (discountPercent / 100));
  }

  return {
    originalPrice,
    finalPrice,
    hasDiscount,
    discountPercent,
  };
}

import type { Instalment } from '@/shared/types';
import { getMonthlyPayment } from '@/shared/utils/instalment';

/** Barcha muddatlar orasidan eng arzon oylik to'lovni beruvchi variantni topadi ("dan" belgisi uchun) */
export function getCheapestInstalment(instalments?: Instalment[]): Instalment | undefined {
  if (!instalments || instalments.length === 0) return undefined;
  return instalments.reduce((cheapest, current) =>
    getMonthlyPayment(current) < getMonthlyPayment(cheapest) ? current : cheapest,
  );
}

/** Debounce helper */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- unknown[] breaks call-site inference for narrower function signatures
export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
