import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface DatePickerProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'value' | 'defaultValue' | 'onChange' | 'type' | 'children'
> {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  containerClassName?: string;
  /** Date string in `YYYY-MM-DD` format. */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Shown while no date is selected; defaults to `yyyy/mm/dd`. */
  placeholder?: string;
  /** Earliest selectable date, `YYYY-MM-DD`. Days before it are disabled. */
  min?: string;
  /** Latest selectable date, `YYYY-MM-DD`. Days after it are disabled. */
  max?: string;
  /** Submitted with the surrounding form when set. */
  name?: string;
}

export type DateRange = {
  /** Date string in `YYYY-MM-DD` format, empty when unset. */
  from: string;
  to: string;
};

export interface RangeDatePickerProps {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  containerClassName?: string;
  className?: string;
  id?: string;
  name?: string;
  value?: DateRange;
  defaultValue?: DateRange;
  onChange?: (value: DateRange) => void;
  min?: string;
  max?: string;
  disabled?: boolean;
  required?: boolean;
  fromPlaceholder?: string;
  toPlaceholder?: string;
}
