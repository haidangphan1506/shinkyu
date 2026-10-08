'use client';

import type { ReactNode } from 'react';
import { Icon } from '@/components/shared';
import { AuthGuard } from './auth-guard';
import { Header } from './header';
import { Sidebar } from './sidebar/sidebar';

export const AppShell = ({ children }: { children: ReactNode }) => {
  return (
    <AuthGuard>
      <div className="flex min-h-dvh bg-background text-foreground">
        <Sidebar
          isOpen={false}
          onClose={() => {}}
          renderIcon={(name, className) => <Icon name={name} className={className} />}
        />
        <div className="min-w-0 flex-1">
          <Header />
          <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
};
