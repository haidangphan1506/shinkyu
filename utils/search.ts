/** Case-insensitive "contains" match across any of `fields`. Empty query matches all. */
export function matchesQuery(query: string, fields: readonly string[]): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  return fields.some((field) => field.toLowerCase().includes(normalized));
}
