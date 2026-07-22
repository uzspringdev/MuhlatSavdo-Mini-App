import { apiClient } from '@/services/apiClient';
import type { CartItem, BuyingProductsDto, GuestDto } from '@/shared/types';

export const cartService = {
  getCart: async (): Promise<CartItem[]> => {
    const res = await apiClient.get('/api/v1/customers/cart');
    return res.data;
  },

  addItem: async (productId: number, quantity: number): Promise<void> => {
    await apiClient.post('/api/v1/carts/addItem', null, {
      params: { productId, quantity },
    });
  },

  purchase: async (dto: BuyingProductsDto): Promise<void> => {
    await apiClient.post('/api/v1/carts/purchase', dto);
  },

  buyNow: async (dto: GuestDto): Promise<void> => {
    await apiClient.post('/api/v1/carts/buyNow', dto);
  },
};
