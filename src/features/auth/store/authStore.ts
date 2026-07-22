import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CustomerDto } from '@/shared/types';

interface AuthState {
  token: string | null;
  customer: CustomerDto | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setToken: (token: string) => void;
  setCustomer: (customer: CustomerDto) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      customer: null,
      isAuthenticated: false,
      isLoading: false,

      setToken: (token) => {
        localStorage.setItem('muhlatsavdo_token', token);
        set({ token, isAuthenticated: true });
      },

      setCustomer: (customer) => set({ customer }),

      logout: () => {
        localStorage.removeItem('muhlatsavdo_token');
        set({ token: null, customer: null, isAuthenticated: false });
      },

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'muhlatsavdo-auth',
      partialize: (state) => ({
        token: state.token,
        customer: state.customer,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
