import { apiClient } from '@/services/apiClient';
import type { AuthResponse } from '@/shared/types';
import { telegram } from '@/app/telegram/telegram';

export const authService = {
  /**
   * Authenticate via Telegram initData.
   * Backend: POST /api/v1/auth/customers/telegram?telegramData=...
   */
  async telegramAuth(): Promise<AuthResponse> {
    const telegramData = telegram.parseInitData();
    const params = new URLSearchParams(telegramData);
    const response = await apiClient.post<AuthResponse>(
      `/api/v1/auth/customers/telegram?${params.toString()}`,
    );
    return response.data;
  },

  /**
   * Authenticate via OTP (phone number).
   * Step 1: send OTP to phone
   */
  async sendOTP(phoneNumber: string): Promise<void> {
    await apiClient.get('/api/v1/auth/sendOTP', { params: { phoneNumber } });
  },

  /**
   * Step 2: verify OTP and get JWT
   */
  async loginWithOTP(phoneNumber: string, otp: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/v1/auth/customers', {
      phoneNumber,
      otp,
    });
    return response.data;
  },
};
