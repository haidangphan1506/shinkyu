'use client';

import { useEffect, useId, useRef, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@/components/shared';
import type { ModalProps, ModalSize } from '@/types';

export type { ModalProps, ModalSize } from '@/types';

const sizeClassNames: Record<ModalSize, string> = {
  sm: 'w-full max-w-sm',
  md: 'w-full max-w-md',
  lg: 'w-full max-w-lg',
  xl: 'w-full max-w-2xl',
  form: 'w-full h-[85dvh] sm:w-[448px] sm:h-[640px] lg:h-auto max-h-[85dvh]',
};

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

let scrollLockCount = 0;

function lockBodyScroll() {
  if (scrollLockCount === 0) document.body.style.overflow = 'hidden';
  scrollLockCount += 1;
}

function unlockBodyScroll() {
  scrollLockCount = Math.max(0, scrollLockCount - 1);
  if (scrollLockCount === 0) document.body.style.overflow = '';
}

const cx = (...classNames: (string | false | undefined)[]) => classNames.filter(Boolean).join(' ');

const emptySubscribe = () => () => undefined;

/** False while server-rendering, true in the browser; no setState in an effect. */
const useIsClient = () =>
  useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'lg',
  showCloseButton = false,
  closeOnOverlayClick = false,
  closeOnEscape = true,
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}: ModalProps) {
  const isClient = useIsClient();
  const generatedId = useId();
  const titleId = `${generatedId}-title`;
  const descriptionId = `${generatedId}-description`;
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    lockBodyScroll();
    const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(focusableSelector);
    (focusables?.[0] ?? dialogRef.current)?.focus();

    return () => {
      unlockBodyScroll();
      previouslyFocused?.focus?.();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') {
        if (closeOnEscape) {
          event.preventDefault();
          onClose();
        }
        return;
      }
      if (event.key !== 'Tab') return;

      const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(focusableSelector);
      if (!focusables || focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || active === dialogRef.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, closeOnEscape, onClose]);

  if (!isClient || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-200 flex items-end justify-center overflow-y-auto p-4 sm:items-center">
      <div
        data-testid="modal-overlay"
        aria-hidden="true"
        onClick={closeOnOverlayClick ? onClose : undefined}
        className="fixed inset-0 bg-foreground/50 backdrop-blur-sm"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        aria-label={title == null ? ariaLabel : undefined}
        aria-labelledby={ariaLabelledBy ?? (title != null ? titleId : undefined)}
        aria-describedby={description != null ? descriptionId : undefined}
        className={cx(
          'relative flex flex-col rounded-2xl border border-border bg-surface shadow-xl outline-none',
          sizeClassNames[size],
          className,
        )}
      >
        {title != null ? (
          <header className="flex items-start justify-between h-14 gap-4 p-4 border-b border-border">
            <div className="min-w-0 flex-1">
              <h2 id={titleId} className="text-lg font-semibold text-foreground truncate">
                {title}
              </h2>
              {description != null ? (
                <p
                  id={descriptionId}
                  className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-3"
                >
                  {description}
                </p>
              ) : null}
            </div>
            {showCloseButton ? (
              <button
                type="button"
                aria-label="Close dialog"
                onClick={onClose}
                className="rounded-md p-1 text-label transition-colors hover:bg-surface-muted hover:text-foreground"
              >
                <Icon name="close" className="h-4 w-4" />
              </button>
            ) : null}
          </header>
        ) : null}
        {children != null ? (
          <div className="min-h-0 flex-1 overflow-y-auto p-6 text-sm text-foreground">
            {children}
          </div>
        ) : null}
        {footer != null ? (
          <footer className="flex flex-wrap items-center justify-end gap-4 border-t border-border p-6">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
