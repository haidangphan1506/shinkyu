import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'メールアドレスを入力してください')
    .pipe(z.email('メールアドレスの形式が正しくありません')),
  password: z.string().min(1, 'パスワードを入力してください'),
});

export const forgotPassSchema = loginSchema.pick({ email: true });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type ForgotPassFormValues = z.infer<typeof forgotPassSchema>;
