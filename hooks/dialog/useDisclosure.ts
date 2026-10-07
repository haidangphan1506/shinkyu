'use client';

import { useCallback, useState } from 'react';
import type { UseDisclosureResult } from '@/types';

export function useDisclosure(initial = false): UseDisclosureResult {
  const [isOpen, setIsOpen] = useState(initial);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((current) => !current), []);

  return { isOpen, open, close, toggle };
}
