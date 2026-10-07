import type { InputHTMLAttributes, ReactNode } from 'react';

interface InputRuleBase {
  /** Error copy rendered when this rule fails. */
  message: ReactNode;
}

/** Fails when the value is empty or whitespace only. */
export interface InputRequiredRule extends InputRuleBase {
  label: 'required';
}

export interface InputEmailRule extends InputRuleBase {
  label: 'email';
}

export interface InputMinLengthRule extends InputRuleBase {
  label: 'minLength';
  minLength: number;
}

export interface InputMaxLengthRule extends InputRuleBase {
  label: 'maxLength';
  maxLength: number;
}

export interface InputPatternRule extends InputRuleBase {
  label: 'pattern';
  pattern: RegExp;
}

/** Digits only, e.g. a non-negative integer. */
export interface InputNumericRule extends InputRuleBase {
  label: 'numeric';
}

export type InputRule =
  | InputRequiredRule
  | InputEmailRule
  | InputMinLengthRule
  | InputMaxLengthRule
  | InputPatternRule
  | InputNumericRule;

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  containerClassName?: string;
  /** Renders an asterisk, marks the field `required`, and fails on an empty value. */
  required?: boolean;
  /** Checked in order once blurred, then on every change; the first failure wins. */
  rules?: readonly InputRule[];
}
