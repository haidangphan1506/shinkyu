import type { subscriptionStatuses } from '@/components/dashboard/mock-data';

export type SubscriptionStatus = (typeof subscriptionStatuses)[number];

export interface AppUser {
  id: string;
  username: string;
  email: string;
  affiliation: string;
  trainingDays: number;
  visionCheckDays: number;
  checkDays: number;
  registeredAt: string;
  expiresAt: string | null;
  subscriptionStatus: SubscriptionStatus;
}

export type SubscriptionStatusFilter = 'All' | SubscriptionStatus;
