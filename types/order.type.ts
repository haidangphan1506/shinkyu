import type { orderCategories, orderStatuses } from '@/components/dashboard/mock-data';

export type OrderStatus = (typeof orderStatuses)[number];

export type OrderCategory = (typeof orderCategories)[number];

export interface Order {
  id: string;
  customer: string;
  email: string;
  initials: string;
  avatarClass: string;
  product: string;
  category: OrderCategory;
  date: string;
  amount: number;
  status: OrderStatus;
}

export type StatusFilter = 'All' | OrderStatus;

export type CategoryFilter = 'All' | OrderCategory;
