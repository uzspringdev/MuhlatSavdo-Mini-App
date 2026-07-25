import { PageLayout } from '@/shared/ui/PageLayout';
import { ProductCard } from '@/shared/ui/ProductCard';
import { EmptyState } from '@/shared/ui/EmptyState';
import { useFavoritesStore } from '@/features/favorites/store/favoritesStore';
import { useT } from '@/shared/i18n';

export default function FavoritesPage() {
  const t = useT();
  const items = useFavoritesStore((s) => s.items);

  return (
    <PageLayout title={t('favorites.title')} showNav>
      {items.length === 0 ? (
        <EmptyState variant="favorites" />
      ) : (
        <div className="grid grid-cols-2 gap-3 pt-4 pb-6">
          {items.map(({ productId, product }) => (
            <ProductCard key={productId} product={product} />
          ))}
        </div>
      )}
    </PageLayout>
  );
}
