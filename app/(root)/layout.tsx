import type { Metadata } from 'next';
import { AppShell } from '@/components/layout';

export const metadata: Metadata = {
  title: {
    default: 'Shinkyu',
    template: '%s | Shinkyu',
  },
  description: 'Manage your Shinkyu workspace.',
};

export const AuthenticatedLayout = ({ children }: LayoutProps<'/'>) => {
  return <AppShell>{children}</AppShell>;
};

export default AuthenticatedLayout;
