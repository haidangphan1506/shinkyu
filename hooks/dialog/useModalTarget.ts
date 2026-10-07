'use client';

import { useCallback, useState } from 'react';
import type { UseModalTargetResult } from '@/types';

/** Open/close state for a modal that operates on one row (edit, delete, ...). */
export function useModalTarget<T>(): UseModalTargetResult<T> {
  const [target, setTarget] = useState<T | null>(null);

  const open = useCallback((next: T) => setTarget(next), []);
  const close = useCallback(() => setTarget(null), []);

  return { isOpen: target !== null, target, open, close };
}
