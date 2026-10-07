'use client';

import { Button } from './button';
import { Select } from './select';
import { Icon } from '@/components/shared';
import type { PaginationItem, PaginationProps } from '@/types';

export type { PaginationItem, PaginationProps } from '@/types';

const buttonClassName = 'h-8 min-w-8 px-2';

const defaultPageSizeOptions = [10, 20, 50, 100] as const;

function buildItems(page: number, totalPages: number, siblingCount: number): PaginationItem[] {
  const start = Math.max(1, page - siblingCount);
  const end = Math.min(totalPages, page + siblingCount);
  const items: PaginationItem[] = [];

  if (start > 1) {
    items.push(1);
    if (start > 2) items.push('ellipsis');
  }

  for (let current = start; current <= end; current += 1) {
    items.push(current);
  }

  if (end < totalPages) {
    if (end < totalPages - 1) items.push('ellipsis');
    items.push(totalPages);
  }

  return items;
}

export function Pagination({
  total,
  page = 1,
  pageSize = 10,
  onPageChange,
  siblingCount = 1,
  showSummary = true,
  pageSizeOptions = defaultPageSizeOptions,
  disabled = false,
  className,
}: PaginationProps) {
  if (total <= 0) return null;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const firstRow = (currentPage - 1) * pageSize + 1;
  const lastRow = Math.min(currentPage * pageSize, total);
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  function goTo(nextPage: number) {
    onPageChange(nextPage, pageSize);
  }

  function changePageSize(nextPageSize: number) {
    onPageChange(1, nextPageSize);
  }

  return (
    <nav
      aria-label="Pagination"
      className={[
        'flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex flex-wrap items-center gap-3">
        {pageSizeOptions.length > 0 ? (
          <Select
            aria-label="Rows per page"
            size="sm"
            autoWidth
            options={pageSizeOptions.map((size) => ({
              label: `${size}件/ページ`,
              value: String(size),
            }))}
            value={String(pageSize)}
            onChange={(value) => changePageSize(Number(value))}
            disabled={disabled}
            containerClassName="shrink-0"
          />
        ) : null}
        {showSummary ? (
          <p className="text-sm text-muted-foreground truncate">
            Showing{' '}
            <span className="text-foreground">
              {firstRow}-{lastRow}
            </span>{' '}
            of <span className="text-foreground">{total}</span>
          </p>
        ) : null}
      </div>
      <ul className="flex flex-wrap items-center gap-1">
        <li>
          <Button
            variant="outline"
            size="sm"
            className={buttonClassName}
            disabled={disabled || isFirstPage}
            aria-label="Previous page"
            onClick={() => goTo(currentPage - 1)}
          >
            <Icon name="chevronLeft" className="h-4 w-4" />
          </Button>
        </li>
        {buildItems(currentPage, totalPages, siblingCount).map((item, index) =>
          item === 'ellipsis' ? (
            <li
              key={`ellipsis-${index}`}
              aria-hidden="true"
              className="px-1 text-sm text-muted-foreground"
            >
              &hellip;
            </li>
          ) : (
            <li key={item}>
              <Button
                variant={item === currentPage ? 'primary' : 'outline'}
                size="sm"
                className={buttonClassName}
                aria-label={`Page ${item}`}
                aria-current={item === currentPage ? 'page' : undefined}
                disabled={disabled}
                onClick={() => goTo(item)}
              >
                {item}
              </Button>
            </li>
          ),
        )}
        <li>
          <Button
            variant="outline"
            size="sm"
            className={buttonClassName}
            disabled={disabled || isLastPage}
            aria-label="Next page"
            onClick={() => goTo(currentPage + 1)}
          >
            <Icon name="chevronRight" className="h-4 w-4" />
          </Button>
        </li>
      </ul>
    </nav>
  );
}
