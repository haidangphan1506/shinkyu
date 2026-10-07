export interface PaginatedTableResult<T> {
  rows: T[];
  total: number;
}

/**
 * Normalizes list responses into `{ rows, total }`. Accepts a bare array, or an object with
 * rows under `data | items | results | rows` and a total under `total | count | meta.total`.
 */
export function coercePaginatedTableResult<T>(payload: unknown): PaginatedTableResult<T> {
  if (Array.isArray(payload)) return { rows: payload as T[], total: payload.length };
  if (!payload || typeof payload !== 'object') return { rows: [], total: 0 };

  const source = payload as Record<string, unknown>;
  const rows = [source.data, source.items, source.results, source.rows].find(Array.isArray) as
    T[] | undefined;
  const meta = source.meta as Record<string, unknown> | undefined;
  const total = [source.total, source.count, meta?.total].find(
    (value): value is number => typeof value === 'number' && Number.isFinite(value),
  );

  const safeRows = rows ?? [];
  return { rows: safeRows, total: total ?? safeRows.length };
}
