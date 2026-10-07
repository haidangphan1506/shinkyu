'use client';

import { forgotPassSchema, type ForgotPassFormValues } from '@/validates/auth';
import { useZodForm } from '@/hooks/form';
import { usePost } from '@/hooks/api';
import type { ForgotPassPayload } from '@/types';

const defaultValues: ForgotPassFormValues = { email: '' };

export function useForgotPass() {
  const form = useZodForm(forgotPassSchema, defaultValues);
  const forgotPassword = usePost<void, ForgotPassPayload>('/auth/forgot-password');

  const onSubmit = form.handleSubmit((data) => forgotPassword.mutate(data));

  return {
    ...form,
    onSubmit,
    sent: forgotPassword.isSuccess,
    submitError: forgotPassword.error?.message ?? null,
  };
}
