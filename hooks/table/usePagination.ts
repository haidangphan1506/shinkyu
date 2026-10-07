'use client';

import { useCallback, useMemo, useState } from 'react';
import type { UsePaginationResult } from '@/types';

export function usePagination<T>(
  items: readonly T[],
  initialPageSize = 10,
): UsePaginationResult<T> {
  const [rawPage, setRawPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const page = Math.min(rawPage, totalPages);

  const pagedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  const onPageChange = useCallback((nextPage: number, nextPageSize: number) => {
    setRawPage(nextPage);
    setPageSize(nextPageSize);
  }, []);

  const resetPage = useCallback(() => setRawPage(1), []);

  return { page, pageSize, totalPages, pagedItems, onPageChange, resetPage };
}
