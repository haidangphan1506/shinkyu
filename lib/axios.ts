import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import type { AuthTokens } from '@/types';
import type { ApiError } from '@/utils/api-validation-error';
import { createEmitter } from './emitter';
import { tokenStorage } from './token-storage';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
const LOGIN_PATH = '/login';

declare module 'axios' {
  interface AxiosRequestConfig {
    /** Do not count this request in `useAxiosLoading` (e.g. background polling). */
    skipLoading?: boolean;
    /** Do not attach the Authorization header. */
    skipAuth?: boolean;
  }
}

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };
type ErrorBody = { message?: string } | undefined;

class AxiosClient {
  private instance: AxiosInstance;
  /** Requests in flight. Loading is true while > 0, so parallel calls don't flicker it off. */
  private pending = 0;
  private refreshing: Promise<boolean> | null = null;
  private loading = createEmitter<boolean>();
  private session = createEmitter<boolean>();

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' },
    });

    this.setupInterceptors();
    this.syncAcrossTabs();
  }

  private setupInterceptors() {
    this.instance.interceptors.request.use(
      (config) => {
        this.startLoading(config);

        const accessToken = tokenStorage.getAccessToken();
        if (accessToken && !config.skipAuth) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error: AxiosError<ErrorBody>) => {
        this.stopLoading(error.config);
        return Promise.reject(this.toApiError(error));
      },
    );

    this.instance.interceptors.response.use(
      (response) => {
        this.stopLoading(response.config);
        return response;
      },
      async (error: AxiosError<ErrorBody>) => {
        this.stopLoading(error.config);

        const original = error.config as RetriableConfig | undefined;

        if (error.response?.status === 401 && original && !original._retry && !original.skipAuth) {
          original._retry = true;

          if (await this.refreshToken()) {
            return this.instance(original);
          }
          this.logout();
        }

        return Promise.reject(this.toApiError(error));
      },
    );
  }

  /** Keep `useAdminAuth` in sync when another tab logs in or out. */
  private syncAcrossTabs() {
    if (typeof window === 'undefined') return;
    window.addEventListener('storage', (event) => {
      if (event.key === tokenStorage.key || event.key === null) {
        this.session.emit(this.hasSession());
      }
    });
  }

  /** Single-flight: concurrent 401s share one refresh call. */
  private refreshToken(): Promise<boolean> {
    this.refreshing ??= this.doRefresh().finally(() => {
      this.refreshing = null;
    });
    return this.refreshing;
  }

  private async doRefresh(): Promise<boolean> {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const { data } = await axios.post<AuthTokens>(`${API_BASE_URL}/auth/refresh-token`, {
        refreshToken,
      });
      this.setSession(data);
      return true;
    } catch {
      return false;
    }
  }

  /** Normalizes to `ApiError`, the shape `utils/api-validation-error` and the hooks read. */
  private toApiError(error: AxiosError<ErrorBody>): ApiError {
    return {
      message: error.response?.data?.message || error.message || 'An error occurred',
      code: error.response?.status,
      data: error.response?.data,
    };
  }

  setSession(tokens: AuthTokens) {
    tokenStorage.set(tokens);
    this.session.emit(true);
  }

  clearSession() {
    tokenStorage.clear();
    this.session.emit(false);
  }

  hasSession(): boolean {
    return !!tokenStorage.getAccessToken();
  }

  private logout() {
    this.clearSession();
    if (typeof window !== 'undefined' && window.location.pathname !== LOGIN_PATH) {
      window.location.href = LOGIN_PATH;
    }
  }

  private startLoading(config?: { skipLoading?: boolean }) {
    if (config?.skipLoading) return;
    this.pending += 1;
    if (this.pending === 1) this.loading.emit(true);
  }

  private stopLoading(config?: { skipLoading?: boolean }) {
    if (config?.skipLoading || this.pending === 0) return;
    this.pending -= 1;
    if (this.pending === 0) this.loading.emit(false);
  }

  /** Used by `useAxiosLoading`. Returns an unsubscribe function. */
  onLoadingChange = (callback: (state: boolean) => void) => this.loading.subscribe(callback);

  /** Used by `useAdminAuth`. Fires on login, logout, forced logout and cross-tab changes. */
  onSessionChange = (callback: (authenticated: boolean) => void) =>
    this.session.subscribe(callback);

  getClient(): AxiosInstance {
    return this.instance;
  }

  isLoading(): boolean {
    return this.pending > 0;
  }
}

export const axiosClient = new AxiosClient();
export const axios_instance = axiosClient.getClient();
