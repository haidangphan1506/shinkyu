export function isBlank(value: string | null | undefined): boolean {
  return !value || value.trim() === '';
}

export function capitalize(value: string): string {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

export function truncate(value: string, maxLength: number, ellipsis = '…'): string {
  if (value.length <= maxLength) return value;
  return value.slice(0, Math.max(0, maxLength - ellipsis.length)).trimEnd() + ellipsis;
}

/** ASCII slug: strips diacritics, lowercases, joins words with `-`. */
export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Full-width ASCII (ＡＢＣ１２３) and ideographic space to half-width. */
export function toHalfWidth(value: string): string {
  return value
    .replace(/[！-～]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xfee0))
    .replace(/　/g, ' ');
}
