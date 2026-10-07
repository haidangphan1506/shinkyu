import type { AuthTokens } from '@/types';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

const isBrowser = () => typeof window !== 'undefined';

export const tokenStorage = {
  /** `storage` event key that signals a token change from another tab. */
  key: ACCESS_TOKEN_KEY,

  getAccessToken: (): string | null =>
    isBrowser() ? localStorage.getItem(ACCESS_TOKEN_KEY) : null,

  getRefreshToken: (): string | null =>
    isBrowser() ? localStorage.getItem(REFRESH_TOKEN_KEY) : null,

  set({ accessToken, refreshToken }: AuthTokens) {
    if (!isBrowser()) return;
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  clear() {
    if (!isBrowser()) return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};
