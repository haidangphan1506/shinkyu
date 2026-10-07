'use client';

import { useCallback, useEffect, useState } from 'react';

/** JSON-backed state persisted in localStorage. SSR-safe: starts at `initial`, hydrates in an effect. */
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw !== null) setValue(JSON.parse(raw) as T);
    } catch {
      /* ignore corrupt or blocked storage */
    }
  }, [key]);

  const set = useCallback(
    (next: T | ((current: T) => T)) => {
      setValue((current) => {
        const resolved = next instanceof Function ? next(current) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          /* ignore quota or blocked storage */
        }
        return resolved;
      });
    },
    [key],
  );

  const remove = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
    setValue(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return [value, set, remove] as const;
}
