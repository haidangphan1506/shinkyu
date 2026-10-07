'use client';

import { useEffect } from 'react';
import { CheckCircle2, CircleAlert, Info, TriangleAlert, X } from 'lucide-react';
import { toastText } from '@/constants';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { dismissToast } from '@/store';
import type { Toast, ToastTone, ToasterProps } from '@/types';
import { cn } from '@/utils';

const toneIcons: Record<ToastTone, typeof Info> = {
  success: CheckCircle2,
  error: CircleAlert,
  warning: TriangleAlert,
  info: Info,
};

const toneIconColors: Record<ToastTone, string> = {
  success: 'text-success',
  error: 'text-error',
  warning: 'text-warning',
  info: 'text-note',
};

const ToastItem = ({ toast }: { toast: Toast }) => {
  const dispatch = useAppDispatch();
  const Icon = toneIcons[toast.tone];

  useEffect(() => {
    const timer = setTimeout(() => dispatch(dismissToast(toast.id)), toast.duration);
    return () => clearTimeout(timer);
  }, [dispatch, toast.id, toast.duration]);

  return (
    <div
      role={toast.tone === 'error' ? 'alert' : 'status'}
      className="pointer-events-auto flex w-full items-start gap-3 rounded-lg border border-border bg-surface p-4 shadow-lg"
    >
      <Icon aria-hidden="true" className={cn('h-5 w-5 shrink-0', toneIconColors[toast.tone])} />
      <p className="min-w-0 flex-1 text-sm text-foreground">{toast.message}</p>
      <button
        type="button"
        aria-label={toastText.close}
        onClick={() => dispatch(dismissToast(toast.id))}
        className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <X aria-hidden="true" className="h-4 w-4" />
      </button>
    </div>
  );
};

export function Toaster({ className }: ToasterProps) {
  const toasts = useAppSelector((state) => state.toast.toasts);

  return (
    <div
      role="region"
      aria-label={toastText.region}
      className={cn(
        'pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2',
        className,
      )}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
