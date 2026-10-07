'use client';

import { useRouter } from 'next/navigation';
import { axiosClient } from '@/lib/axios';
import { loginSchema, type LoginFormValues } from '@/validates/auth';
import { useZodForm } from '@/hooks/form';
import { usePost } from '@/hooks/api';
import type { AuthTokens, LoginPayload } from '@/types';

const defaultValues: LoginFormValues = { email: '', password: '' };

export function useLogin(redirectTo = '/') {
  const router = useRouter();
  const form = useZodForm(loginSchema, defaultValues);
  const login = usePost<AuthTokens, LoginPayload>('/auth/login', {
    onSuccess: (tokens) => {
      axiosClient.setSession(tokens);
      router.replace(redirectTo);
    },
  });

  const onSubmit = form.handleSubmit((data) => login.mutate(data));

  return { ...form, onSubmit, submitError: login.error?.message ?? null };
}
