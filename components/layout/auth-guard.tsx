'use client';

import { authGuardText, ROUTES } from '@/constants';
import { useAdminAuth } from '@/hooks/auth';
import type { AuthGuardProps } from '@/types';

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { isAuthenticated, ready } = useAdminAuth(ROUTES.LOGIN);

  if (!ready || !isAuthenticated) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background text-foreground">
        <div role="status" className="text-sm text-muted-foreground">
          {authGuardText.loading}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
