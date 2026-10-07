import type { InputRule, MemberFormValues, SelectOption } from '@/types';
import { subscriptionStatuses } from '@/components/dashboard/mock-data';

export const memberFormAffiliations = ['個人申込', '法人申込', '団体申込'] as const;

export const memberFormStatusOptions: SelectOption[] = subscriptionStatuses.map((status) => ({
  label: status,
  value: status,
}));

export const memberFormAffiliationOptions: SelectOption[] = memberFormAffiliations.map(
  (affiliation) => ({
    label: affiliation,
    value: affiliation,
  }),
);

export const memberFormNoteMaxLength = 200;

export const memberFormText = {
  title: 'メンバーを新規登録',
  description: '登録する会員情報を入力してください。',
  submit: '登録する',
  cancel: 'キャンセル',
  labels: {
    username: 'ユーザー名',
    email: 'メールアドレス',
    affiliation: '所属',
    trainingDays: 'トレーニング日数',
    registeredAt: '登録日',
    expiresAt: '有効期限',
    subscriptionStatus: 'サブスク状態',
    note: '備考',
  },
  demoTargetPeriod: {
    label: '対象期間',
    hint: 'RangeDatePicker のデモ用フィールド。送信対象には含まれません。',
  },
  placeholders: {
    username: '例: yamada_taro',
    email: '例: yamada@example.com',
    trainingDays: '0',
    expiresAt: '未入力で無期限',
  },
  rangePlaceholders: {
    from: 'yyyy/mm/dd',
    to: 'yyyy/mm/dd',
  },
  hints: {
    trainingDays: '0 以上の半角数字で入力してください。',
    expiresAt: '未入力の場合は「-」として扱います。',
    note: '社内メモ用。会員には公開されません。',
  },
  errors: {
    usernameRequired: 'ユーザー名を入力してください。',
    emailRequired: 'メールアドレスを入力してください。',
    emailInvalid: 'メールアドレスの形式が正しくありません。',
    trainingDaysInvalid: 'トレーニング日数は 0 以上の半角数字で入力してください。',
    trainingDaysMin: 'トレーニング日数は 0 以上で入力してください。',
    trainingDaysInteger: 'トレーニング日数は整数で入力してください。',
    registeredAtRequired: '登録日を入力してください。',
    expiresAtAfterRegister: '有効期限は登録日以降の日付を入力してください。',
    noteTooLong: `備考は ${memberFormNoteMaxLength} 文字以内で入力してください。`,
  },
} as const;

export const emptyMemberFormValues: MemberFormValues = {
  username: '',
  email: '',
  affiliation: memberFormAffiliations[0],
  trainingDays: '',
  registeredAt: '',
  expiresAt: '',
  subscriptionStatus: subscriptionStatuses[1],
  note: '',
};

/**
 * Validation cases for the `Input` fields, keyed by form field. Shared by the
 * inputs themselves and by `validateMemberForm` so both report the same copy.
 */
export const memberFormInputRules: Record<
  'username' | 'email' | 'trainingDays',
  readonly InputRule[]
> = {
  username: [{ label: 'required', message: memberFormText.errors.usernameRequired }],
  email: [
    { label: 'required', message: memberFormText.errors.emailRequired },
    { label: 'email', message: memberFormText.errors.emailInvalid },
  ],
  // Most specific first: `-1` reads as below the minimum and `1.5` as a fraction
  // before the catch-all digits-only check.
  trainingDays: [
    { label: 'pattern', pattern: /^(?!-)/, message: memberFormText.errors.trainingDaysMin },
    {
      label: 'pattern',
      pattern: /^(?!\d+\.\d+$)/,
      message: memberFormText.errors.trainingDaysInteger,
    },
    { label: 'numeric', message: memberFormText.errors.trainingDaysInvalid },
  ],
};
