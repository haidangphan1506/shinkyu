import type { ReactNode } from 'react';

export interface EmptyStateProps {
  /** Icon rendered inside the circular badge above the title. */
  icon?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  /** Call-to-action rendered below the description. */
  action?: ReactNode;
  className?: string;
}
