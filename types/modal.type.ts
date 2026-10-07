import type { AriaAttributes, ReactNode } from 'react';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'form';

export interface ModalProps extends Pick<AriaAttributes, 'aria-label' | 'aria-labelledby'> {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /** Footer actions; omit for a body-only dialog. */
  footer?: ReactNode;
  size?: ModalSize;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
}
