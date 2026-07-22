import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/authStore';
import { authService } from '@/features/auth/services/authService';
import { customerService } from '@/features/profile/services/customerService';
import { telegram } from '@/app/telegram/telegram';

export const QUERY_KEYS = {
  telegramAuth: ['auth', 'telegram'] as const,
};

/**
 * Auto-authenticate with Telegram initData on app start.
 * Har doim haqiqiy backend orqali autentifikatsiya qiladi (avval Telegram foydalanuvchisi
 * bo'lganda frontendda soxta customer/tokenlar yasalar edi — backend bilan hech qachon
 * gaplashmas edi, shu sababli mijoz ma'lumotlari, jumladan telefon raqami, hech qachon
 * to'g'ri yuklanmas edi).
 */
export function useTelegramAuth() {
  const { setToken, setCustomer, setLoading } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      const authData = await authService.telegramAuth();
      if (!authData?.token) {
        throw new Error('Telegram authentication failed: token missing in response');
      }
      setToken(authData.token);

      // To'liq (telefon raqami bilan) profilni alohida so'raymiz — login javobida
      // faqat token va Telegram profilidan olingan asosiy ma'lumotlar bor, xolos.
      const customer = await customerService.getMe();
      setCustomer(customer);

      return { authData, customer };
    },
    onMutate: () => setLoading(true),
    onSuccess: () => {
      telegram.haptic.success();
      setLoading(false);
    },
    onError: () => {
      setLoading(false);
    },
  });
}

/** OTP flow: send OTP */
export function useSendOTP() {
  return useMutation({
    mutationFn: (phoneNumber: string) => authService.sendOTP(phoneNumber),
  });
}

/** OTP flow: verify and login */
export function useLoginWithOTP() {
  const { setToken, setCustomer } = useAuthStore();

  return useMutation({
    mutationFn: async ({ phoneNumber, otp }: { phoneNumber: string; otp: string }) => {
      const authData = await authService.loginWithOTP(phoneNumber, otp);
      if (!authData?.token) {
        throw new Error('OTP authentication failed: token missing in response');
      }
      setToken(authData.token);

      const customer = await customerService.getMe();
      setCustomer(customer);

      return { authData, customer };
    },
    onSuccess: () => {
      telegram.haptic.success();
    },
  });
}
