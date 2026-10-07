'use client';

import { useCallback, useRef, useState } from 'react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import type { ConfirmOptions, UseConfirmResult } from '@/types';

export function useConfirm(): UseConfirmResult {
  const [request, setRequest] = useState<ConfirmOptions | null>(null);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((options: ConfirmOptions = {}) => {
    resolverRef.current?.(false);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      setRequest({ ...options });
    });
  }, []);

  const close = useCallback((result: boolean) => {
    resolverRef.current?.(result);
    resolverRef.current = null;
    setRequest(null);
  }, []);

  const confirmDialog = request ? (
    <ConfirmDialog open {...request} onConfirm={() => close(true)} onCancel={() => close(false)} />
  ) : null;

  return { confirm, confirmDialog };
}
