import { forwardRef } from 'react';
import type { ButtonProps, ButtonSize, ButtonVariant } from '@/types';

export type { ButtonProps, ButtonSize, ButtonVariant } from '@/types';

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-primary-foreground hover:bg-brand-600 dark:bg-brand-400 dark:text-brand-950 dark:hover:bg-brand-300',
  secondary: 'border border-primary bg-primary/10 text-primary hover:bg-primary/20',
  outline: 'border border-primary text-primary hover:bg-primary/10',
  ghost: 'text-primary hover:bg-primary/10',
  danger: 'bg-error text-error-foreground hover:bg-error/90',
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 min-w-30 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
};

const spinnerSizes: Record<ButtonSize, string> = {
  sm: 'h-3.5 w-3.5 border-2',
  md: 'h-4 w-4 border-2',
  lg: 'h-5 w-5 border-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant = 'primary',
    size = 'md',
    type = 'button',
    loading = false,
    disabled,
    children,
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
        buttonVariants[variant],
        buttonSizes[size],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {loading ? (
        <span
          role="status"
          aria-live="polite"
          data-testid="button-spinner"
          className={[
            'animate-spin rounded-full border-current border-t-transparent',
            spinnerSizes[size],
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <span className="sr-only">Loading</span>
        </span>
      ) : null}
      {children}
    </button>
  );
});

Button.displayName = 'Button';
