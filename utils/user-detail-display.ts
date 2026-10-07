import type { AppUser } from '@/types';
import { formatNumber } from './format';

export const EMPTY_PLACEHOLDER = '-';

export function displayValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return EMPTY_PLACEHOLDER;
  const text = String(value).trim();
  return text === '' ? EMPTY_PLACEHOLDER : text;
}

export function formatDays(days: number): string {
  return `${formatNumber(days)}日`;
}

export interface UserDetailRow {
  label: string;
  value: string;
}

/** Label/value rows for a member detail view. */
export function getUserDetailRows(user: AppUser): UserDetailRow[] {
  return [
    { label: 'ID', value: displayValue(user.id) },
    { label: 'ユーザー名', value: displayValue(user.username) },
    { label: 'メールアドレス', value: displayValue(user.email) },
    { label: '所属', value: displayValue(user.affiliation) },
    { label: 'トレーニング', value: formatDays(user.trainingDays) },
    { label: '視力確認', value: formatDays(user.visionCheckDays) },
    { label: 'チェック', value: formatDays(user.checkDays) },
    { label: '登録日', value: displayValue(user.registeredAt) },
    { label: '有効期限', value: displayValue(user.expiresAt) },
    { label: 'サブスク状態', value: displayValue(user.subscriptionStatus) },
  ];
}
