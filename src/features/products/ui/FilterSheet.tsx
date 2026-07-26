import { useState } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import type { CategoryDto } from '@/shared/types';
import { formatPrice } from '@/shared/utils';
import { useBrandsByCategory, useColorsByCategory } from '@/features/products/hooks/useProducts';
import { useT, useLangStore } from '@/shared/i18n';

export interface FilterValues {
  minPrice: number;
  maxPrice: number;
  brandIds: number[];
  colorId?: number;
}

interface FilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  /** Leaf category the filter will run against — brand/color lists load from here */
  categoryId: number;
  priceCeiling: number;
  initialValues: FilterValues;
  onApply: (values: FilterValues) => void;
  onClear: () => void;
  /**
   * Non-empty when the currently selected category has children — `POST
   * /products/search` matches categoryId exactly and won't include those
   * children's products, so we ask the user to pick a leaf first instead of
   * silently returning a filtered list that's missing most of the category.
   */
  subCategories: CategoryDto[];
  onPickSubCategory: (category: CategoryDto) => void;
}

export function FilterSheet({
  isOpen,
  onClose,
  categoryId,
  priceCeiling,
  initialValues,
  onApply,
  onClear,
  subCategories,
  onPickSubCategory,
}: FilterSheetProps) {
  const t = useT();
  const lang = useLangStore((s) => s.lang);
  const [values, setValues] = useState(initialValues);

  // Re-seed the local draft from the persisted URL values every time the
  // sheet transitions from closed to open (adjusting state during render
  // instead of an effect — same pattern as ProductDetailPage's variant reset).
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) setValues(initialValues);
  }

  const { data: brands } = useBrandsByCategory(categoryId);
  const { data: colors } = useColorsByCategory(categoryId);

  if (!isOpen) return null;

  const needsSubCategory = subCategories.length > 0;

  const toggleBrand = (id: number) => {
    setValues((v) => ({
      ...v,
      brandIds: v.brandIds.includes(id) ? v.brandIds.filter((b) => b !== id) : [...v.brandIds, id],
    }));
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full bg-white dark:bg-neutral-900 rounded-t-card max-h-[85vh] overflow-y-auto safe-bottom">
        <div className="sticky top-0 bg-white dark:bg-neutral-900 px-4 pt-4 pb-3 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between z-10">
          <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-50">
            {needsSubCategory ? t('filter.chooseSubcategory') : t('filter.title')}
          </h3>
          <button
            onClick={onClose}
            aria-label={t('common.close')}
            className="w-11 h-11 -mr-2 flex items-center justify-center text-neutral-500 dark:text-neutral-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {needsSubCategory ? (
          <div className="px-4 py-4 space-y-2">
            {subCategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => onPickSubCategory(sub)}
                className="w-full min-h-[44px] px-4 py-2.5 rounded-el bg-neutral-50 dark:bg-neutral-800 text-left text-sm font-medium text-neutral-800 dark:text-neutral-200"
              >
                {sub.name}
              </button>
            ))}
          </div>
        ) : (
          <div className="px-4 py-4 space-y-6">
            {/* Price range */}
            <div className="space-y-3">
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-bold uppercase tracking-widest">
                {t('filter.priceRange')}
              </p>
              <div className="flex items-center justify-between text-sm font-bold text-neutral-800 dark:text-neutral-200">
                <span>{formatPrice(values.minPrice, 'UZS', lang)}</span>
                <span>{formatPrice(values.maxPrice, 'UZS', lang)}</span>
              </div>
              <div className="relative h-5 flex items-center">
                <div className="absolute inset-x-0 h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                <div
                  className="absolute h-1.5 rounded-full bg-di-red"
                  style={{
                    left: `${(values.minPrice / priceCeiling) * 100}%`,
                    right: `${100 - (values.maxPrice / priceCeiling) * 100}%`,
                  }}
                />
                <input
                  type="range"
                  className="range-slider"
                  min={0}
                  max={priceCeiling}
                  value={values.minPrice}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, minPrice: Math.min(Number(e.target.value), v.maxPrice) }))
                  }
                />
                <input
                  type="range"
                  className="range-slider"
                  min={0}
                  max={priceCeiling}
                  value={values.maxPrice}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, maxPrice: Math.max(Number(e.target.value), v.minPrice) }))
                  }
                />
              </div>
            </div>

            {/* Brand */}
            {!!brands?.length && (
              <div className="space-y-2">
                <p className="text-xs text-neutral-500 dark:text-neutral-400 font-bold uppercase tracking-widest">
                  {t('filter.brand')}
                </p>
                <div className="space-y-1">
                  {brands.map((brand) => (
                    <label
                      key={brand.id}
                      className="flex items-center gap-3 min-h-[44px] px-1 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={values.brandIds.includes(brand.id)}
                        onChange={() => toggleBrand(brand.id)}
                        className="w-5 h-5 accent-di-red flex-shrink-0"
                      />
                      <span className="text-sm text-neutral-800 dark:text-neutral-200">{brand.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Color — backend only accepts a single colorId, so this is a
                single-select control, not a checkbox list. */}
            {!!colors?.length && (
              <div className="space-y-2">
                <p className="text-xs text-neutral-500 dark:text-neutral-400 font-bold uppercase tracking-widest">
                  {t('filter.color')}
                </p>
                <div className="flex flex-wrap gap-3">
                  {colors.map((color) => {
                    const isActive = values.colorId === color.id;
                    return (
                      <button
                        key={color.id}
                        onClick={() =>
                          setValues((v) => ({ ...v, colorId: isActive ? undefined : color.id }))
                        }
                        aria-label={color.name}
                        className={clsx(
                          'relative w-11 h-11 rounded-full flex items-center justify-center transition-transform active:scale-90',
                          isActive && 'ring-2 ring-di-red ring-offset-2 ring-offset-white dark:ring-offset-neutral-900',
                        )}
                      >
                        <span
                          className="w-8 h-8 rounded-full border-2 border-white dark:border-neutral-700 shadow-sm"
                          style={{ backgroundColor: color.heh || '#ccc' }}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  onClear();
                  onClose();
                }}
                className="flex-1 min-h-[44px] rounded-el bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-sm font-bold"
              >
                {t('filter.clear')}
              </button>
              <button
                onClick={() => {
                  onApply(values);
                  onClose();
                }}
                className="flex-1 min-h-[44px] rounded-el bg-di-red text-white text-sm font-bold"
              >
                {t('filter.apply')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
