'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { axiosClient } from '@/lib/axios';

/**
 * Client-side session gate. `ready` flips true after the first check so pages can avoid
 * flashing protected UI. With `redirectTo`, unauthenticated visitors are sent there.
 */
export function useAdminAuth(redirectTo?: string) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const authed = axiosClient.hasSession();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsAuthenticated(authed);
    setReady(true);
    if (!authed && redirectTo) router.replace(redirectTo);

    return axiosClient.onSessionChange((next) => {
      setIsAuthenticated(next);
      if (!next && redirectTo) router.replace(redirectTo);
    });
  }, [redirectTo, router]);

  const logout = useCallback(() => {
    axiosClient.clearSession();
    router.replace('/login');
  }, [router]);

  return { isAuthenticated, ready, logout };
}
