'use client';

import { useCallback, useState, type FormEvent } from 'react';
import type { ZodType } from 'zod';
import type { FormErrors } from '@/types';

/** Minimal schema-validated form state: values, per-field errors (first issue wins), submit handler. */
export function useZodForm<T extends Record<string, unknown>>(
  schema: ZodType<T>,
  defaultValues: T,
) {
  const [values, setValues] = useState<T>(defaultValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (current[key] === undefined) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }, []);

  const validate = useCallback(
    (input: T): T | null => {
      const result = schema.safeParse(input);
      if (result.success) {
        setErrors({});
        return result.data;
      }
      const next: FormErrors<T> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof T | undefined;
        if (key !== undefined && next[key] === undefined) next[key] = issue.message;
      }
      setErrors(next);
      return null;
    },
    [schema],
  );

  const handleSubmit = useCallback(
    (onValid: (data: T) => void | Promise<void>) => async (event?: FormEvent) => {
      event?.preventDefault();
      if (isSubmitting) return;
      const data = validate(values);
      if (!data) return;
      setIsSubmitting(true);
      try {
        await onValid(data);
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, validate, values],
  );

  const reset = useCallback(() => {
    setValues(defaultValues);
    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { values, errors, isSubmitting, setValue, setErrors, handleSubmit, reset };
}
