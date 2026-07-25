import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProductDto } from '@/shared/types';

interface FavoriteItem {
  productId: number;
  product: ProductDto;
  addedAt: string;
}

interface FavoritesState {
  items: FavoriteItem[];
  isFavorite: (productId: number) => boolean;
  toggle: (product: ProductDto) => void;
  remove: (productId: number) => void;
}

// Device-local only (decision Q3) — no account sync, no backend call.
export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      items: [],

      isFavorite: (productId) => get().items.some((i) => i.productId === productId),

      toggle: (product) => {
        set((state) => {
          const exists = state.items.some((i) => i.productId === product.id);
          if (exists) {
            return { items: state.items.filter((i) => i.productId !== product.id) };
          }
          return {
            items: [...state.items, { productId: product.id, product, addedAt: new Date().toISOString() }],
          };
        });
      },

      remove: (productId) => {
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) }));
      },
    }),
    { name: 'muhlatsavdo-favorites' },
  ),
);
