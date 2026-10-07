/** Next sequential id like `U-0007`, based on the highest numeric part in `ids`. */
export function nextPrefixedId(ids: readonly string[], prefix = 'U', width = 4): string {
  const max = ids.reduce((acc, id) => {
    const numeric = Number.parseInt(id.replace(/\D/g, ''), 10);
    return Number.isNaN(numeric) ? acc : Math.max(acc, numeric);
  }, 0);

  return `${prefix}-${String(max + 1).padStart(width, '0')}`;
}
