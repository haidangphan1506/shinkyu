'use client';

import { useMemo, useState } from 'react';
import type { UseDataTableOptions } from '@/types';
import { matchesQuery } from '@/utils';
import { useDebounce } from '@/hooks/common';
import { usePagination } from './usePagination';
import { useSort } from './useSort';

/** Search + filter + sort + pagination over an in-memory list. */
export function useDataTable<T>(rows: readonly T[], options: UseDataTableOptions<T>) {
  const { filterDeps = [], pageSize = 10, debounce = 0 } = options;
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, debounce);

  // The memo re-runs when rows, query or `filterDeps` change; the callbacks may be inline.
  // Primitive filter values (status, flags) serialize into a stable key.
  const filterKey = JSON.stringify(filterDeps);

  const filtered = useMemo(() => {
    const { searchFields, filter } = options;
    return rows.filter(
      (row) => matchesQuery(debouncedQuery, searchFields(row)) && (filter ? filter(row) : true),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, debouncedQuery, filterKey]);

  const { sorted, sort, toggleSort } = useSort(filtered);
  const pagination = usePagination(sorted, pageSize);
  const { resetPage } = pagination;

  return {
    query,
    setQuery: (next: string) => {
      setQuery(next);
      resetPage();
    },
    total: sorted.length,
    sort,
    toggleSort,
    ...pagination,
  };
}
