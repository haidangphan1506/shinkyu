'use client';

import { forwardRef, useId, useState } from 'react';
import type { ChangeEvent, FocusEvent } from 'react';
import { inputText } from '@/constants';
import { findInputRuleError, resolveInputRules } from '@/validates/input';
import type { InputProps } from '@/types';

export type { InputProps } from '@/types';

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    className,
    containerClassName,
    label,
    hint,
    error,
    id,
    required,
    rules,
    value,
    defaultValue,
    onChange,
    onBlur,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [uncontrolledValue, setUncontrolledValue] = useState(String(defaultValue ?? ''));
  const [blurred, setBlurred] = useState(false);
  const currentValue = value === undefined ? uncontrolledValue : String(value);

  // Own the copy so `rules` is useful standalone, but let the caller win.
  const ruleError = findInputRuleError(currentValue, resolveInputRules(rules, required));
  const errorMessage = error ?? (blurred ? ruleError : undefined);
  const hasError = errorMessage != null;
  const hasHint = hint != null;
  const hintId = hasHint ? `${inputId}-hint` : undefined;
  const errorId = hasError ? `${inputId}-error` : undefined;
  const describedBy = [ariaDescribedBy, hintId, errorId].filter(Boolean).join(' ') || undefined;

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    if (value === undefined) setUncontrolledValue(event.target.value);
    onChange?.(event);
  }

  function handleBlur(event: FocusEvent<HTMLInputElement>) {
    setBlurred(true);
    onBlur?.(event);
  }

  return (
    <div className={['flex w-full flex-col gap-1.5', containerClassName].filter(Boolean).join(' ')}>
      {label != null ? (
        <div className="flex items-center gap-1">
          <label htmlFor={inputId} className="text-sm font-medium text-foreground">
            {label}
          </label>
          {required ? (
            <span aria-hidden="true" className="text-sm text-error">
              {inputText.requiredMark}
            </span>
          ) : null}
        </div>
      ) : null}
      <input
        ref={ref}
        id={inputId}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        onBlur={handleBlur}
        required={required}
        aria-required={required || undefined}
        aria-invalid={hasError ? true : ariaInvalid}
        aria-describedby={describedBy}
        className={[
          'h-10 w-full rounded-lg border bg-surface px-3 text-sm text-foreground outline-none transition-colors placeholder:text-input-placeholder disabled:cursor-not-allowed disabled:opacity-50',
          hasError
            ? 'border-error focus:border-error focus:ring-error/20'
            : 'border-border hover:border-primary focus:border-primary focus:ring-primary',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      />
      {hasHint ? (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {hasError ? (
        <p id={errorId} role="alert" className="text-xs text-error">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
