'use client';

import { forwardRef, useId, useState, type ChangeEvent } from 'react';
import type { TextAreaProps } from '@/types';

export type { TextAreaProps } from '@/types';

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  {
    className,
    containerClassName,
    label,
    hint,
    error,
    showCount,
    id,
    rows = 4,
    maxLength,
    value,
    defaultValue,
    onChange,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const textAreaId = id ?? generatedId;
  const hasHint = hint != null;
  const hasError = error != null;
  const hintId = hasHint ? `${textAreaId}-hint` : undefined;
  const errorId = hasError ? `${textAreaId}-error` : undefined;
  const describedBy = [ariaDescribedBy, hintId, errorId].filter(Boolean).join(' ') || undefined;

  const [uncontrolledLength, setUncontrolledLength] = useState(String(defaultValue ?? '').length);
  const length = value !== undefined ? String(value).length : uncontrolledLength;

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    if (value === undefined) {
      setUncontrolledLength(event.target.value.length);
    }
    onChange?.(event);
  }

  return (
    <div className={['flex w-full flex-col gap-1.5', containerClassName].filter(Boolean).join(' ')}>
      {label != null ? (
        <label htmlFor={textAreaId} className="text-sm font-medium text-foreground">
          {label}
        </label>
      ) : null}
      <textarea
        ref={ref}
        id={textAreaId}
        rows={rows}
        maxLength={maxLength}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        aria-invalid={hasError ? true : ariaInvalid}
        aria-describedby={describedBy}
        className={[
          'w-full resize-y rounded-lg border bg-surface px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-input-placeholder focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50',
          hasError
            ? 'border-error focus:border-error focus:ring-error/20'
            : 'border-border focus:border-primary focus:ring-0',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      />
      {hasHint || showCount ? (
        <div className="flex items-start justify-between gap-3">
          {hasHint ? (
            <p id={hintId} className="text-xs text-muted-foreground">
              {hint}
            </p>
          ) : (
            <span />
          )}
          {showCount ? (
            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
              {maxLength != null ? `${length}/${maxLength}` : length}
            </span>
          ) : null}
        </div>
      ) : null}
      {hasError ? (
        <p id={errorId} role="alert" className="text-xs text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
});

TextArea.displayName = 'TextArea';
