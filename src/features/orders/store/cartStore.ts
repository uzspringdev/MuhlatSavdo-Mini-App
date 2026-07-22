import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, ProductDto } from '@/shared/types';
import { getProductPriceInfo } from '@/shared/utils';

interface CartState {
  items: CartItem[];
  addItem: (product: ProductDto, quantity?: number, instalmentMonths?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1, instalmentMonths) => {
        set((state) => {
          const existing = state.items.find((i) => i.productId === product.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === product.id
                  ? { ...i, quantity: i.quantity + quantity, selectedInstalmentMonths: instalmentMonths }
                  : i,
              ),
            };
          }
          return {
            items: [
              ...state.items,
              { productId: product.id, product, quantity, selectedInstalmentMonths: instalmentMonths },
            ],
          };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i,
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () =>
        get().items.reduce((sum, i) => {
          if (!i.product) return sum;
          const { finalPrice } = getProductPriceInfo(i.product);
          return sum + finalPrice * i.quantity;
        }, 0),
    }),
    {
      name: 'muhlatsavdo-cart',
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
