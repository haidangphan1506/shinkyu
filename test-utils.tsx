import { useState, type ReactElement, type ReactNode } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/** App-level providers. Fresh QueryClient per render, no retries, so tests stay isolated. */
function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } }),
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

/** `render` wrapped in app providers, plus a ready `user` from user-event. */
export function renderWithProviders(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: Providers, ...options }),
  };
}

export * from '@testing-library/react';
export { userEvent };
