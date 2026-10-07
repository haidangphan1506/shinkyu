import { inputEmailPattern, inputNumericPattern, inputText } from '@/constants/input.constant';
import type { InputRule } from '@/types';

type FormatRule = Exclude<InputRule, { label: 'required' }>;

function isFailing(rule: FormatRule, value: string): boolean {
  switch (rule.label) {
    case 'email':
      return !inputEmailPattern.test(value);
    case 'minLength':
      return value.length < rule.minLength;
    case 'maxLength':
      return value.length > rule.maxLength;
    case 'pattern':
      return !rule.pattern.test(value);
    case 'numeric':
      return !inputNumericPattern.test(value);
  }
}

/**
 * Prepends a default `required` rule so `required` alone still reports copy,
 * while an explicit rule of the same kind keeps the caller's message.
 */
export function resolveInputRules(
  rules: readonly InputRule[] | undefined,
  required: boolean | undefined,
): readonly InputRule[] {
  if (!required) return rules ?? [];
  const cases = rules ?? [];
  if (cases.some((rule) => rule.label === 'required')) return cases;
  const requiredRule: InputRule = {
    label: 'required',
    message: inputText.required,
  };
  return [requiredRule, ...cases];
}

/**
 * Message of the first failing rule, or `undefined` when the value passes.
 * Rules see the trimmed value, matching what a form submits.
 */
export function findInputRuleError(
  value: string,
  rules: readonly InputRule[],
): InputRule['message'] | undefined {
  // Whitespace-only counts as empty, and an empty optional field has nothing
  // to validate yet — so only `required` can report here.
  const normalized = value.trim();
  if (normalized === '') {
    return rules.find((rule) => rule.label === 'required')?.message;
  }
  for (const rule of rules) {
    if (rule.label === 'required') continue;
    if (isFailing(rule, normalized)) return rule.message;
  }
  return undefined;
}
