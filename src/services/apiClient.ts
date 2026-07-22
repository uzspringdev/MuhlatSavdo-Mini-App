import axios, { type AxiosError } from 'axios';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useToastStore } from '@/shared/store/toastStore';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.muhlatsavdo.uz';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request interceptor — attach JWT token ───────────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    // We read token directly from localStorage to avoid circular dep
    const token = localStorage.getItem('muhlatsavdo_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// ─── Response interceptor — handle errors globally ────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    const showToast = useToastStore.getState().show;

    if (error.response?.status === 401) {
      // Clear auth state on unauthorized
      localStorage.removeItem('muhlatsavdo_token');
      useAuthStore.getState().logout();
      showToast('Sessiya tugadi, qaytadan kiring', 'error');
    } else if (!error.response) {
      showToast('Internet aloqasi yo\'q. Qaytadan urinib ko\'ring', 'error');
    } else {
      const message = error.response?.data?.message || 'Xatolik yuz berdi. Qaytadan urinib ko\'ring';
      showToast(message, 'error');
    }

    return Promise.reject(error);
  },
);

/** Helper: resolve image URL from name returned by API */
export const resolveImageUrl = (name?: string): string => {
  if (!name) return '';
  if (name.startsWith('http')) return name;
  const cleanPath = name.startsWith('/') ? name : `/${name}`;
  if (!cleanPath.startsWith('/uploads/')) {
    return `${BASE_URL}/uploads/images${cleanPath}`;
  }
  return `${BASE_URL}${cleanPath}`;
};
