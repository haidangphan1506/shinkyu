import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { QueryProvider, StoreProvider } from '@/components/providers';
import { Toaster } from '@/components';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'Shinkyu',
    template: '%s | Shinkyu',
  },
  description: 'Manage your Shinkyu workspace.',
};

export const RootLayout = ({ children }: LayoutProps<'/'>) => {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-zinc-50 font-sans text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
        <StoreProvider>
          <QueryProvider>{children}</QueryProvider>
          <Toaster />
        </StoreProvider>
      </body>
    </html>
  );
};

export default RootLayout;
