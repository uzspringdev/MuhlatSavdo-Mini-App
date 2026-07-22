import { apiClient } from '@/services/apiClient';
import type { CustomerDto } from '@/shared/types';

export const customerService = {
  getAll: async (): Promise<CustomerDto[]> => {
    const res = await apiClient.get('/api/v1/customers/findAll');
    return res.data;
  },

  create: async (dto: CustomerDto): Promise<CustomerDto> => {
    const res = await apiClient.post('/api/v1/customers/create', dto);
    return res.data;
  },

  updatePhone: async (phoneNumber: string): Promise<CustomerDto> => {
    const res = await apiClient.patch('/api/v1/customers/phone', { phoneNumber });
    return res.data;
  },

  /** Joriy autentifikatsiyalangan mijozning to'liq (telefon bilan) profilini oladi */
  getMe: async (): Promise<CustomerDto> => {
    const res = await apiClient.get('/api/v1/customers/me');
    return res.data;
  },
};
