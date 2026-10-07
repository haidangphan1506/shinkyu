import { axios_instance } from '@/lib/axios';
import type { AuthTokens, ForgotPassPayload, LoginPayload } from '@/types';

// NOTE: endpoints are assumed; adjust to the real backend contract.
export const authService = {
  async login(payload: LoginPayload): Promise<AuthTokens> {
    const { data } = await axios_instance.post<AuthTokens>('/auth/login', payload);
    return data;
  },

  async forgotPassword(payload: ForgotPassPayload): Promise<void> {
    await axios_instance.post('/auth/forgot-password', payload);
  },
};
