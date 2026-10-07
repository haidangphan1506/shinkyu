export type PaginationItem = number | 'ellipsis';

export interface UsePaginationResult<T> {
  /** Current page clamped to the valid range, 1-based. */
  page: number;
  pageSize: number;
  totalPages: number;
  pagedItems: T[];
  /** Matches `PaginationProps["onPageChange"]`. */
  onPageChange: (page: number, pageSize: number) => void;
  resetPage: () => void;
}

export interface PaginationProps {
  /** Total number of rows across all pages. */
  total: number;
  /** Current page, 1-based. */
  page?: number;
  /** Rows per page. */
  pageSize?: number;
  onPageChange: (page: number, pageSize: number) => void;
  /** Visible pages on each side of the current page. */
  siblingCount?: number;
  /** Show the "Showing x-y of z" summary. */
  showSummary?: boolean;
  /** Page size choices; the size selector is hidden when empty. */
  pageSizeOptions?: readonly number[];
  disabled?: boolean;
  className?: string;
}
