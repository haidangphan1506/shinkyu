export interface UseDataTableOptions<T> {
  /** Fields (as strings) the search query is matched against. May be an inline function. */
  searchFields: (row: T) => string[];
  /** Extra predicate, e.g. a status filter. List the primitive values it reads in `filterDeps`. */
  filter?: (row: T) => boolean;
  filterDeps?: readonly (string | number | boolean | null | undefined)[];
  pageSize?: number;
  debounce?: number;
}
