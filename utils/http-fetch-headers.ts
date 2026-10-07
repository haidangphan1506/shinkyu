export type HeaderRecord = Record<string, string>;

export const jsonHeaders: HeaderRecord = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

export function bearerHeader(token: string | null | undefined): HeaderRecord {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** Headers for `fetch` calls (e.g. server components) that bypass the axios client. */
export function buildFetchHeaders(token?: string | null, extra: HeaderRecord = {}): HeaderRecord {
  return { ...jsonHeaders, ...bearerHeader(token), ...extra };
}
