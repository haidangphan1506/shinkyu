'use client';

import { useId, useState } from 'react';
import { Button } from './button';
import { Modal } from './modal';
import { Icon } from '@/components/shared';
import type { ConfirmProps, ConfirmTone } from '@/types';
import type { IconName } from '@/types/dashboard.type';

export type { ConfirmOptions, ConfirmProps, ConfirmTone } from '@/types';

const toneVariants: Record<ConfirmTone, 'primary' | 'danger'> = {
  default: 'primary',
  danger: 'danger',
};

const toneIcons: Record<ConfirmTone, IconName> = {
  default: 'help',
  danger: 'warning',
};

const toneIconColors: Record<ConfirmTone, string> = {
  default: 'text-blue-500',
  danger: 'text-red-500',
};

export function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'default',
  size = 'lg',
  loading = false,
  className,
}: ConfirmProps) {
  const titleId = useId();
  const [pending, setPending] = useState(false);
  const isBusy = loading || pending;

  async function handleConfirm() {
    const result = onConfirm();
    if (result instanceof Promise) {
      setPending(true);
      try {
        await result;
      } finally {
        setPending(false);
      }
    }
  }

  return (
    <Modal
      open={open}
      onClose={onCancel}
      aria-labelledby={titleId}
      size={size}
      className={`w-97.5! ${className}`}
    >
      <div className="flex flex-col items-center justify-between gap-4 text-center">
        <div
          className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-surface-muted ${toneIconColors[tone]}`}
        >
          <Icon name={toneIcons[tone]} className="h-6 w-6" />
        </div>
        <div className="flex w-full flex-col gap-2 overflow-hidden">
          <h2 id={titleId} className="text-base font-bold text-foreground truncate">
            {title}
          </h2>
          {message && (
            <p className="min-h-0 text-sm leading-relaxed text-muted-foreground line-clamp-3 overflow-hidden text-ellipsis">
              {message}
            </p>
          )}
        </div>
        <div className="w-full grid grid-cols-2 gap-3 flex-shrink-0">
          <Button
            variant="outline"
            size="md"
            onClick={onCancel}
            disabled={isBusy}
            className="w-full"
          >
            {cancelLabel}
          </Button>
          <Button
            variant="primary"
            size="md"
            type="submit"
            loading={isBusy}
            onClick={handleConfirm}
            className="w-full"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
