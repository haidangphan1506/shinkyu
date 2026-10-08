import Link from 'next/link';
import { notFoundText, ROUTES } from '@/constants';

export function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-6 py-12 text-center text-foreground">
      <p className="text-sm font-semibold text-primary">{notFoundText.code}</p>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        {notFoundText.title}
      </h1>
      <p className="max-w-md text-sm text-muted-foreground">{notFoundText.description}</p>
      <Link
        href={ROUTES.HOME}
        className="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
      >
        {notFoundText.backHome}
      </Link>
    </main>
  );
}
