'use client';

import { useCallback, useMemo, useState } from 'react';
import type { SortState } from '@/types';

/** Click cycle per key: asc → desc → none. */
export function useSort<T, K extends keyof T = keyof T>(
  items: readonly T[],
  initial?: SortState<K>,
) {
  const [sort, setSort] = useState<SortState<K>>(initial ?? { key: null, direction: 'asc' });

  const toggleSort = useCallback((key: K) => {
    setSort((current) => {
      if (current.key !== key) return { key, direction: 'asc' };
      if (current.direction === 'asc') return { key, direction: 'desc' };
      return { key: null, direction: 'asc' };
    });
  }, []);

  const sorted = useMemo(() => {
    const { key, direction } = sort;
    if (key === null) return items as T[];
    const factor = direction === 'asc' ? 1 : -1;
    return [...items].sort((a, b) => {
      const left = a[key];
      const right = b[key];
      if (left == null) return 1;
      if (right == null) return -1;
      if (typeof left === 'number' && typeof right === 'number') return (left - right) * factor;
      return String(left).localeCompare(String(right), undefined, { numeric: true }) * factor;
    });
  }, [items, sort]);

  return { sorted, sort, toggleSort };
}
