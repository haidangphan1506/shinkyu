import type { Key, ReactNode } from 'react';

export type TableAlign = 'left' | 'center' | 'right';

export type TableColumn<T> = {
  key: string;
  header: ReactNode;
  /** Custom cell renderer; falls back to `row[key]` when omitted. */
  render?: (row: T, index: number) => ReactNode;
  align?: TableAlign;
  className?: string;
  headerClassName?: string;
  /** Giới hạn chiều ngang của ô (px); nội dung thừa bị cắt thành dấu "…". */
  width?: number;
  /** Ghim cột vào mép trái khi bảng cuộn ngang. */
  fixed?: boolean;
};

export interface TableDataProps<T> {
  columns: readonly TableColumn<T>[];
  data: readonly T[];
  rowKey: keyof T | ((row: T, index: number) => Key);
  loading?: boolean;
  emptyText?: ReactNode;
  onRowClick?: (row: T, index: number) => void;
  className?: string;
  tableClassName?: string;
  rowClassName?: string | ((row: T, index: number) => string);
}
