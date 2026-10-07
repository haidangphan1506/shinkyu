import { isApiError } from './api-validation-error';

const MESSAGES_BY_STATUS: Record<number, string> = {
  400: '入力内容に誤りがあります。',
  401: 'ログインの有効期限が切れました。再度ログインしてください。',
  403: 'この操作を行う権限がありません。',
  404: '対象のデータが見つかりません。',
  409: 'データが競合しています。最新の情報を確認してください。',
  422: '入力内容に誤りがあります。',
  429: 'リクエストが多すぎます。しばらくしてからお試しください。',
  500: 'サーバーエラーが発生しました。',
};

export type UserAction = 'create' | 'update' | 'delete' | 'load';

const ACTION_FALLBACK: Record<UserAction, string> = {
  create: '作成に失敗しました。',
  update: '更新に失敗しました。',
  delete: '削除に失敗しました。',
  load: 'データの取得に失敗しました。',
};

/** User-facing message for a failed action; prefers a known status over the raw server text. */
export function getUserActionError(error: unknown, action: UserAction): string {
  if (isApiError(error)) {
    if (error.code && MESSAGES_BY_STATUS[error.code]) return MESSAGES_BY_STATUS[error.code];
    if (error.code && error.code >= 500) return MESSAGES_BY_STATUS[500];
  }
  return ACTION_FALLBACK[action];
}
