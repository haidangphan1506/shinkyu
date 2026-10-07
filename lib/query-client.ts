import { QueryClient, isServer } from '@tanstack/react-query';
import type { ApiError } from '@/utils/api-validation-error';

declare module '@tanstack/react-query' {
  interface Register {
    /** `lib/axios` rejects with `ApiError`. */
    defaultError: ApiError;
  }
}

const NO_RETRY_STATUS = new Set([400, 401, 403, 404, 422]);

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
        // Don't retry client errors; retry transient ones up to 2 times.
        retry: (failureCount, error) => !NO_RETRY_STATUS.has(error.code ?? 0) && failureCount < 2,
      },
    },
  });
}

let browserClient: QueryClient | undefined;

/** New client per request on the server; a singleton in the browser. */
export function getQueryClient(): QueryClient {
  if (isServer) return makeQueryClient();
  return (browserClient ??= makeQueryClient());
}
