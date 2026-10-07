export interface CookieOptions {
  /** Days until expiry. Omit for a session cookie. */
  days?: number;
  path?: string;
  sameSite?: 'Strict' | 'Lax' | 'None';
  secure?: boolean;
}

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const prefix = `${encodeURIComponent(name)}=`;
  const entry = document.cookie.split('; ').find((part) => part.startsWith(prefix));
  return entry ? decodeURIComponent(entry.slice(prefix.length)) : null;
}

export function setCookie(name: string, value: string, options: CookieOptions = {}): void {
  if (typeof document === 'undefined') return;
  const { days, path = '/', sameSite = 'Lax', secure = false } = options;
  let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=${path}; SameSite=${sameSite}`;
  if (days !== undefined)
    cookie += `; expires=${new Date(Date.now() + days * 864e5).toUTCString()}`;
  if (secure || sameSite === 'None') cookie += '; Secure';
  document.cookie = cookie;
}

export function removeCookie(name: string, path = '/'): void {
  setCookie(name, '', { days: -1, path });
}
