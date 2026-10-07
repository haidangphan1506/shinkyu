'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export function useCopy(resetAfter = 2000) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        setCopied(false);
        return false;
      }
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), resetAfter);
      return true;
    },
    [resetAfter],
  );

  return { copied, copy };
}
