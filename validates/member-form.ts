import { findInputRuleError } from './input';
import {
  memberFormInputRules,
  memberFormNoteMaxLength,
  memberFormText,
} from '@/constants/member-form.constant';
import type { MemberFormErrors, MemberFormValues } from '@/types';

export function validateMemberForm(values: MemberFormValues): MemberFormErrors {
  const errors: MemberFormErrors = {};

  const usernameError = findInputRuleError(values.username, memberFormInputRules.username);
  if (usernameError != null) errors.username = usernameError;

  const emailError = findInputRuleError(values.email, memberFormInputRules.email);
  if (emailError != null) errors.email = emailError;

  const trainingDaysError = findInputRuleError(
    values.trainingDays,
    memberFormInputRules.trainingDays,
  );
  if (trainingDaysError != null) errors.trainingDays = trainingDaysError;

  // DatePicker and TextArea take no `rules` prop yet.
  if (!values.registeredAt) {
    errors.registeredAt = memberFormText.errors.registeredAtRequired;
  }
  // Keys are `yyyy-mm-dd`, so string order is date order.
  if (values.expiresAt && values.registeredAt && values.expiresAt < values.registeredAt) {
    errors.expiresAt = memberFormText.errors.expiresAtAfterRegister;
  }
  if (values.note.length > memberFormNoteMaxLength) {
    errors.note = memberFormText.errors.noteTooLong;
  }

  return errors;
}
