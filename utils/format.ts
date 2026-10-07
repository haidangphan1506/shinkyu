const DEFAULT_LOCALE = 'ja-JP';

export function formatNumber(value: number, locale = DEFAULT_LOCALE): string {
  return Number.isFinite(value) ? new Intl.NumberFormat(locale).format(value) : '-';
}

export function formatCurrency(value: number, currency = 'JPY', locale = DEFAULT_LOCALE): string {
  return Number.isFinite(value)
    ? new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value)
    : '-';
}

export function formatPercent(ratio: number, fractionDigits = 0, locale = DEFAULT_LOCALE): string {
  return Number.isFinite(ratio)
    ? new Intl.NumberFormat(locale, {
        style: 'percent',
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
      }).format(ratio)
    : '-';
}

export function formatBytes(bytes: number, fractionDigits = 1): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '-';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return `${unit === 0 ? size : size.toFixed(fractionDigits)} ${units[unit]}`;
}

/** ISO 8601 in UTC, e.g. 2026-10-05T03:04:05.000Z. */
export function formatDateTime(value: Date | string | number): string {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toISOString();
}
