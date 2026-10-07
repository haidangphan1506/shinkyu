'use client';

import type { CSSProperties, Key, ReactNode } from 'react';
import { EmptyState } from './empty-state';
import type { TableAlign, TableColumn, TableDataProps } from '@/types';

export type { TableAlign, TableColumn, TableDataProps } from '@/types';

const alignClassNames: Record<TableAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

const borderClassName = 'border-border';
const defaultColumnWidth = 320;
const fixedThClassName = 'sticky z-20 bg-surface-muted';
const fixedTdClassName = 'sticky z-10';

const cx = (...classNames: (string | false | undefined)[]) => {
  return classNames.filter(Boolean).join(' ');
};

function getFixedOffsets<T>(columns: readonly TableColumn<T>[]): Record<string, number> {
  const offsets: Record<string, number> = {};
  let runningLeft = 0;
  for (const column of columns) {
    if (column.fixed) {
      offsets[column.key] = runningLeft;
    }
    runningLeft += column.width ?? defaultColumnWidth;
  }
  return offsets;
}

function getHeaderStyle<T>(column: TableColumn<T>, offsets: Record<string, number>): CSSProperties {
  const width = column.width ?? defaultColumnWidth;
  return column.fixed ? { width, maxWidth: width, left: offsets[column.key] } : { maxWidth: width };
}

function getCellStyle<T>(
  column: TableColumn<T>,
  offsets: Record<string, number>,
): CSSProperties | undefined {
  return column.fixed
    ? { maxWidth: column.width ?? defaultColumnWidth, left: offsets[column.key] }
    : { maxWidth: column.width ?? defaultColumnWidth };
}

export function TableData<T>({
  columns,
  data,
  rowKey,
  loading = false,
  emptyText,
  onRowClick,
  className,
  tableClassName,
  rowClassName,
}: TableDataProps<T>) {
  function getRowKey(row: T, index: number): Key {
    return typeof rowKey === 'function' ? rowKey(row, index) : (row[rowKey] as Key);
  }

  const fixedOffsets = getFixedOffsets(columns);

  return (
    <div
      className={cx(
        `relative overflow-x-auto rounded-xl border ${borderClassName} bg-surface`,
        className,
      )}
    >
      <table className={cx('w-full text-left text-sm', tableClassName)}>
        <thead className="bg-surface-muted text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          <tr className={`border-b ${borderClassName}`}>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                style={getHeaderStyle(column, fixedOffsets)}
                className={cx(
                  'px-4 py-3.5 first:pl-6 last:pr-6 truncate',
                  alignClassNames[column.align ?? 'left'],
                  column.fixed && fixedThClassName,
                  column.headerClassName,
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr
                key={getRowKey(row, rowIndex)}
                onClick={onRowClick ? () => onRowClick(row, rowIndex) : undefined}
                className={cx(
                  'transition-colors hover:bg-surface-muted',
                  onRowClick !== undefined && 'cursor-pointer',
                  typeof rowClassName === 'function' ? rowClassName(row, rowIndex) : rowClassName,
                )}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    style={getCellStyle(column, fixedOffsets)}
                    className={cx(
                      'px-4 py-4 text-foreground first:pl-6 last:pr-6 truncate',
                      alignClassNames[column.align ?? 'left'],
                      column.fixed && fixedTdClassName,
                      column.className,
                    )}
                  >
                    {column.render
                      ? column.render(row, rowIndex)
                      : ((row as Record<string, unknown>)[column.key] as ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className={cx(
                  'text-center text-sm text-muted-foreground',
                  emptyText === undefined ? undefined : 'px-6 py-12',
                )}
              >
                {loading ? null : emptyText === undefined ? <EmptyState /> : emptyText}
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {loading ? (
        <div
          role="status"
          aria-live="polite"
          className="absolute inset-0 flex items-center justify-center bg-surface/60"
        >
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="sr-only">Loading</span>
        </div>
      ) : null}
    </div>
  );
}
