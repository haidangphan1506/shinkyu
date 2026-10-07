import type { ReactNode } from 'react';
import type { ModalSize } from './modal.type';

export type ConfirmTone = 'default' | 'danger';

export interface ConfirmOptions {
  title?: ReactNode;
  message?: ReactNode;
  confirmLabel?: ReactNode;
  cancelLabel?: ReactNode;
  tone?: ConfirmTone;
}

export interface ConfirmProps extends ConfirmOptions {
  open: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  size?: ModalSize;
  /** Disables both actions, e.g. while `onConfirm` is pending. */
  loading?: boolean;
  className?: string;
}

export interface UseConfirmResult {
  /** Opens the confirm dialog and resolves with the user's answer. */
  confirm: (options?: ConfirmOptions) => Promise<boolean>;
  /** Render this once, next to the trigger that calls `confirm`. */
  confirmDialog: ReactNode;
}
