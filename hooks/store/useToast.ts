import { useCallback } from 'react';
import { dismissToast, pushToast } from '@/store';
import type { ToastInput } from '@/types';
import { useAppDispatch } from './useAppDispatch';

/** Dispatch helpers for pushing and dismissing toasts. */
export function useToast() {
  const dispatch = useAppDispatch();

  const toast = useCallback(
    (input: ToastInput) => {
      dispatch(pushToast(input));
    },
    [dispatch],
  );

  const dismiss = useCallback(
    (id: string) => {
      dispatch(dismissToast(id));
    },
    [dispatch],
  );

  return { toast, dismiss };
}
