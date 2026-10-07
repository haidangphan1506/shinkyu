import type { ToastTone } from '@/types';

export const TOAST_DEFAULT_DURATION = 4000;
export const TOAST_DEFAULT_TONE: ToastTone = 'info';

export const toastText = {
  region: 'Notifications',
  close: 'Dismiss notification',
} as const;
