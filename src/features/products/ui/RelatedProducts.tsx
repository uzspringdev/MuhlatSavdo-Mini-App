import { ProductCard } from '@/shared/ui/ProductCard';
import { useProductSearch } from '@/features/products/hooks/useProducts';
import { useT } from '@/shared/i18n';

interface RelatedProductsProps {
  currentProductId: number;
  categoryId?: number;
  brandId?: number;
}

export function RelatedProducts({ currentProductId, categoryId, brandId }: RelatedProductsProps) {
  const t = useT();
  const { data: similarData } = useProductSearch(categoryId ? { categoryId, isActive: true } : {});
  const { data: brandData } = useProductSearch(brandId ? { brandIds: [brandId], isActive: true } : {});

  const similar = (similarData?.content ?? []).filter((p) => p.id !== currentProductId).slice(0, 10);
  const sameBrand = (brandData?.content ?? []).filter((p) => p.id !== currentProductId).slice(0, 10);

  if (similar.length === 0 && sameBrand.length === 0) return null;

  return (
    <div className="space-y-6 pb-6">
      {similar.length > 0 && (
        <section className="space-y-3">
          <h2 className="px-4 text-sm font-black text-neutral-900 dark:text-neutral-50 uppercase tracking-wide">
            {t('product.similarProducts')}
          </h2>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar px-4 pb-1">
            {similar.map((p) => (
              <ProductCard key={p.id} product={p} compact className="w-36 flex-shrink-0" />
            ))}
          </div>
        </section>
      )}
      {sameBrand.length > 0 && (
        <section className="space-y-3">
          <h2 className="px-4 text-sm font-black text-neutral-900 dark:text-neutral-50 uppercase tracking-wide">
            {t('product.fromThisBrand')}
          </h2>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar px-4 pb-1">
            {sameBrand.map((p) => (
              <ProductCard key={p.id} product={p} compact className="w-36 flex-shrink-0" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
