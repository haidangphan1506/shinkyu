import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Shinkyu Authentication',
    template: '%s | Shinkyu',
  },
  description: 'Sign in or create your Shinkyu account.',
};

export const UnauthenticatedLayout = ({ children }: LayoutProps<'/'>) => {
  return <main className="grid min-h-dvh place-items-center px-4 py-12">{children}</main>;
};

export default UnauthenticatedLayout;
