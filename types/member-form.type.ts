import type { ReactNode } from 'react';
import type { SubscriptionStatus } from './user.type';

export interface MemberFormValues {
  username: string;
  email: string;
  affiliation: string;
  trainingDays: string;
  registeredAt: string;
  expiresAt: string;
  subscriptionStatus: SubscriptionStatus;
  note: string;
}

export type MemberFormErrors = Partial<Record<keyof MemberFormValues, ReactNode>>;

export interface CreateMemberDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: MemberFormValues) => void | Promise<void>;
  className?: string;
}
