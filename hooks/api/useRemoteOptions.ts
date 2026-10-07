'use client';

import { useMemo } from 'react';
import { useQuery, type QueryKey } from '@tanstack/react-query';
import type { RemoteOptionItem, SelectOption } from '@/types';

/** Loads `{ id, name }` items (cached by `queryKey`) and maps them to `SelectOption`s. */
export function useRemoteOptions(queryKey: QueryKey, fetcher: () => Promise<RemoteOptionItem[]>) {
  const { data, isPending, error } = useQuery({ queryKey, queryFn: fetcher });

  const options = useMemo<SelectOption[]>(
    () => (data ?? []).map((item) => ({ label: item.name, value: item.id })),
    [data],
  );

  return { options, loading: isPending, error: error?.message ?? null };
}
