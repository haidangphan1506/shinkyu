export type SortDirection = 'asc' | 'desc';

export interface SortState<K> {
  key: K | null;
  direction: SortDirection;
}
