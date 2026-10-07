import type { AriaAttributes, ReactNode } from 'react';

export interface SelectOption {
  label: ReactNode;
  value: string;
  disabled?: boolean;
}

export type SelectSize = 'sm' | 'md';

/** Vị trí neo của menu so với trigger, chọn theo chỗ trống còn lại. */
export type SelectDropdownPlacement = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';

/** Kết quả đo trigger: placement kèm chiều cao khả dụng cho menu. */
export type SelectDropdownLayout = {
  placement: SelectDropdownPlacement;
  maxHeight: number;
};

export interface SelectProps extends Pick<
  AriaAttributes,
  'aria-label' | 'aria-labelledby' | 'aria-describedby' | 'aria-invalid'
> {
  options: readonly SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  placeholder?: ReactNode;
  id?: string;
  disabled?: boolean;
  size?: SelectSize;
  /** Size the control to its content instead of filling the container. */
  autoWidth?: boolean;
  className?: string;
  containerClassName?: string;
}
