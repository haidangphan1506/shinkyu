'use client';

import { useEffect, useRef, type RefObject } from 'react';

/**
 * Calls `handler` when a pointer press lands outside the ref's element.
 * Pass your own `ref` to reuse an existing one; otherwise the returned ref is used.
 */
export function useClickOutside<T extends HTMLElement>(
  handler: (event: PointerEvent) => void,
  enabled = true,
  externalRef?: RefObject<T | null>,
): RefObject<T | null> {
  const ownRef = useRef<T>(null);
  const ref = externalRef ?? ownRef;
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    if (!enabled) return;

    function onPress(event: PointerEvent) {
      const node = ref.current;
      if (!node || node.contains(event.target as Node)) return;
      handlerRef.current(event);
    }

    document.addEventListener('pointerdown', onPress);
    return () => document.removeEventListener('pointerdown', onPress);
  }, [enabled, ref]);

  return ref;
}
