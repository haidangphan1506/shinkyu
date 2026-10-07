'use client';

import { useId, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  Button,
  DatePicker,
  Input,
  Modal,
  RangeDatePicker,
  Select,
  TextArea,
} from '@/components/ui';
import {
  emptyMemberFormValues,
  memberFormAffiliationOptions,
  memberFormInputRules,
  memberFormNoteMaxLength,
  memberFormStatusOptions,
  memberFormText,
} from '@/constants/member-form.constant';
import { validateMemberForm } from '@/validates';
import type {
  CreateMemberDialogProps,
  DateRange,
  MemberFormErrors,
  MemberFormValues,
  SubscriptionStatus,
} from '@/types';

export type { CreateMemberDialogProps, MemberFormErrors, MemberFormValues } from '@/types';

type MemberTextField = 'username' | 'email' | 'trainingDays' | 'note';

const emptyTargetPeriod: DateRange = { from: '', to: '' };

export function CreateMemberDialog({
  open,
  onClose,
  onSubmit,
  className,
}: CreateMemberDialogProps) {
  const formId = useId();
  const [values, setValues] = useState<MemberFormValues>(emptyMemberFormValues);
  const [errors, setErrors] = useState<MemberFormErrors>({});
  const [pending, setPending] = useState(false);
  const [targetPeriod, setTargetPeriod] = useState<DateRange>(emptyTargetPeriod);

  const fieldId = (name: keyof MemberFormValues) => `${formId}-${name}`;

  function updateValue<Key extends keyof MemberFormValues>(key: Key, value: MemberFormValues[Key]) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (current[key] === undefined) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function handleTextChange(key: MemberTextField) {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      updateValue(key, event.target.value);
  }

  function resetForm() {
    setValues(emptyMemberFormValues);
    setErrors({});
    setTargetPeriod(emptyTargetPeriod);
  }

  function handleClose() {
    if (pending) return;
    resetForm();
    onClose();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const nextErrors = validateMemberForm(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      const [firstError] = Object.keys(nextErrors) as (keyof MemberFormValues)[];
      document.getElementById(fieldId(firstError))?.focus();
      return;
    }

    setPending(true);
    try {
      await onSubmit({
        ...values,
        username: values.username.trim(),
        email: values.email.trim(),
        trainingDays: values.trainingDays.trim(),
        note: values.note.trim(),
      });
      resetForm();
      onClose();
    } finally {
      setPending(false);
    }
  }

  const { labels, placeholders, hints, rangePlaceholders } = memberFormText;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={memberFormText.title}
      // description={memberFormText.description}
      size="form"
      showCloseButton
      className={className}
      footer={
        <>
          <Button variant="outline" size="md" onClick={handleClose} disabled={pending}>
            {memberFormText.cancel}
          </Button>
          <Button type="submit" form={formId} size="md" loading={pending}>
            {memberFormText.submit}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col gap-4 w-100">
          <Input
            id={fieldId('username')}
            label={labels.username}
            placeholder={placeholders.username}
            value={values.username}
            onChange={handleTextChange('username')}
            error={errors.username}
            rules={memberFormInputRules.username}
            required
            autoComplete="off"
            className="w-full"
          />
          <Input
            id={fieldId('email')}
            type="email"
            label={labels.email}
            placeholder={placeholders.email}
            value={values.email}
            onChange={handleTextChange('email')}
            error={errors.email}
            rules={memberFormInputRules.email}
            required
            autoComplete="off"
            className="w-full"
          />
          <Select
            id={fieldId('affiliation')}
            label={labels.affiliation}
            options={memberFormAffiliationOptions}
            value={values.affiliation}
            onChange={(value) => updateValue('affiliation', value)}
            disabled={pending}
          />
          <Input
            id={fieldId('trainingDays')}
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            label={labels.trainingDays}
            placeholder={placeholders.trainingDays}
            hint={hints.trainingDays}
            value={values.trainingDays}
            onChange={handleTextChange('trainingDays')}
            error={errors.trainingDays}
            rules={memberFormInputRules.trainingDays}
            disabled={pending}
            className="w-full"
          />
          <DatePicker
            id={fieldId('registeredAt')}
            label={labels.registeredAt}
            value={values.registeredAt}
            onChange={(value) => updateValue('registeredAt', value)}
            error={errors.registeredAt}
            disabled={pending}
          />
          <DatePicker
            id={fieldId('expiresAt')}
            label={labels.expiresAt}
            hint={hints.expiresAt}
            value={values.expiresAt}
            onChange={(value) => updateValue('expiresAt', value)}
            error={errors.expiresAt}
            disabled={pending}
          />
          <RangeDatePicker
            id={`${formId}-targetPeriod`}
            label={memberFormText.demoTargetPeriod.label}
            hint={memberFormText.demoTargetPeriod.hint}
            fromPlaceholder={rangePlaceholders.from}
            toPlaceholder={rangePlaceholders.to}
            value={targetPeriod}
            onChange={setTargetPeriod}
            disabled={pending}
          />
          <Select
            id={fieldId('subscriptionStatus')}
            label={labels.subscriptionStatus}
            options={memberFormStatusOptions}
            value={values.subscriptionStatus}
            onChange={(value) => updateValue('subscriptionStatus', value as SubscriptionStatus)}
            disabled={pending}
          />
          <TextArea
            id={fieldId('note')}
            label={labels.note}
            hint={hints.note}
            rows={3}
            maxLength={memberFormNoteMaxLength}
            showCount
            value={values.note}
            onChange={handleTextChange('note')}
            error={errors.note}
            disabled={pending}
          />
        </div>
      </form>
    </Modal>
  );
}
