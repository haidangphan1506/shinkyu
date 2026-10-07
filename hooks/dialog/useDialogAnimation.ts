'use client';

import { useEffect, useState } from 'react';

/**
 * Keeps a dialog mounted long enough to play its exit animation.
 * `mounted`: render the dialog. `visible`: apply the "open" styles/classes.
 */
export function useDialogAnimation(open: boolean, duration = 200) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMounted(true);
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    }
    setVisible(false);
    const timer = setTimeout(() => setMounted(false), duration);
    return () => clearTimeout(timer);
  }, [open, duration]);

  return { mounted, visible };
}
