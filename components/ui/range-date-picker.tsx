'use client';

import * as Popover from '@radix-ui/react-popover';
import { ja } from 'react-day-picker/locale';
import { useId, useRef, useState } from 'react';
import { DayPicker, type DateRange as DayPickerRange, type Matcher } from 'react-day-picker';
import { Icon } from '@/components/shared';
import { datePickerText } from '@/constants/date-picker.constant';
import type { DateRange, RangeDatePickerProps } from '@/types';
import { cn } from '@/utils/cn';
import { toDisplayDate } from '@/utils/slash-date';

export type { DateRange, RangeDatePickerProps } from '@/types';

const noop = () => undefined;
const emptyRange: DateRange = { from: '', to: '' };

function pad(value: number) {
  return String(value).padStart(2, '0');
}

/** `YYYY-MM-DD` from a local date. */
function formatDateKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Local date from `YYYY-MM-DD`; undefined for empty or invalid input. */
function parseDateKey(value?: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? '');
  if (!match) return undefined;
  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    ? date
    : undefined;
}

export function RangeDatePicker({
  label,
  hint,
  error,
  containerClassName,
  className,
  id,
  name,
  value,
  defaultValue,
  onChange,
  min,
  max,
  disabled,
  required,
  fromPlaceholder = 'yyyy/mm/dd',
  toPlaceholder = 'yyyy/mm/dd',
}: RangeDatePickerProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const calendarId = `${inputId}-calendar`;
  const hintId = hint != null ? `${inputId}-hint` : undefined;
  const errorId = error != null ? `${inputId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;
  const hasError = error != null;

  const [innerValue, setInnerValue] = useState<DateRange>(defaultValue ?? emptyRange);
  const current = value ?? innerValue;
  const fromDate = parseDateKey(current.from);
  const toDate = parseDateKey(current.to);

  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState<Date>(() => fromDate ?? new Date());
  // First click of an in-progress selection; null when no selection started.
  const [pendingStart, setPendingStart] = useState<Date | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const minDate = parseDateKey(min);
  const maxDate = parseDateKey(max);
  const disabledDays: Matcher[] = [];
  if (minDate) disabledDays.push({ before: minDate });
  if (maxDate) disabledDays.push({ after: maxDate });

  // DayPicker only flags range_start/range_end when both ends exist, so the
  // pending start is a one-day range. While hovering, preview the range to
  // the hovered day (either direction).
  const previewEnd = pendingStart ? (hoverDate ?? pendingStart) : null;
  const selected: DayPickerRange | undefined =
    pendingStart && previewEnd
      ? previewEnd < pendingStart
        ? { from: previewEnd, to: pendingStart }
        : { from: pendingStart, to: previewEnd }
      : fromDate
        ? { from: fromDate, to: toDate }
        : undefined;

  function commit(next: DateRange) {
    if (value === undefined) setInnerValue(next);
    onChange?.(next);
  }

  function handleOpenChange(next: boolean) {
    if (next) setMonth(fromDate ?? new Date());
    setPendingStart(null);
    setHoverDate(null);
    setOpen(next);
  }

  function handleDayClick(day: Date) {
    if (!pendingStart) {
      setPendingStart(day);
      return;
    }
    const [from, to] = day < pendingStart ? [day, pendingStart] : [pendingStart, day];
    commit({ from: formatDateKey(from), to: formatDateKey(to) });
    setPendingStart(null);
    setHoverDate(null);
    setOpen(false);
    triggerRef.current?.focus();
  }

  function handleClear() {
    commit(emptyRange);
    setPendingStart(null);
    setHoverDate(null);
    setOpen(false);
    triggerRef.current?.focus();
  }

  const hasValue = Boolean(fromDate && toDate);
  const displayText = hasValue
    ? `${toDisplayDate(current.from)} - ${toDisplayDate(current.to)}`
    : `${fromPlaceholder} - ${toPlaceholder}`;

  return (
    <div className={cn('flex w-full flex-col gap-1.5', containerClassName)}>
      {label != null ? (
        <div className="flex items-center gap-1">
          <label htmlFor={inputId} className="text-sm font-medium text-foreground">
            {label}
          </label>
          {required ? (
            <span aria-hidden="true" className="text-sm text-error">
              *
            </span>
          ) : null}
        </div>
      ) : null}

      <Popover.Root open={open} onOpenChange={handleOpenChange}>
        <Popover.Anchor asChild>
          <div className="relative w-full">
            <Popover.Trigger asChild>
              <button
                ref={triggerRef}
                id={inputId}
                type="button"
                disabled={disabled}
                aria-haspopup="dialog"
                aria-expanded={open}
                aria-controls={open ? calendarId : undefined}
                aria-required={required || undefined}
                aria-invalid={hasError || undefined}
                aria-describedby={describedBy}
                className={cn(
                  'flex h-10 w-full cursor-pointer items-center justify-between gap-2 rounded-lg border bg-surface px-3 text-left text-sm text-foreground outline-none transition-colors focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50',
                  hasError
                    ? 'border-error focus:border-error focus:ring-error/20'
                    : open
                      ? 'border-primary ring-0'
                      : 'border-border hover:border-primary focus:border-primary focus:ring-0',
                  className,
                )}
              >
                <span className={cn('truncate', !hasValue && 'text-muted-foreground')}>
                  {displayText}
                </span>
                <Icon name="calendar" className="h-4 w-4 shrink-0" />
              </button>
            </Popover.Trigger>
          </div>
        </Popover.Anchor>

        {name != null ? (
          <>
            <input type="hidden" name={`${name}From`} value={current.from} />
            <input type="hidden" name={`${name}To`} value={current.to} />
          </>
        ) : null}

        <Popover.Portal>
          <Popover.Content
            id={calendarId}
            role="dialog"
            aria-label={datePickerText.calendarLabel}
            align="start"
            sideOffset={4}
            collisionPadding={12}
            className="z-300 max-w-[calc(100vw-1.5rem)] overflow-auto rounded-lg border border-border bg-surface p-3 shadow-lg outline-none"
          >
            <DayPicker
              mode="range"
              locale={ja}
              numberOfMonths={2}
              month={month}
              onMonthChange={setMonth}
              selected={selected}
              // Controlled: without onSelect, DayPicker keeps its own range
              // state, ignoring `selected` and deselecting a same-day range.
              onSelect={noop}
              onDayClick={handleDayClick}
              onDayMouseEnter={(day) => setHoverDate(day)}
              onDayMouseLeave={() => setHoverDate(null)}
              disabled={disabledDays.length > 0 ? disabledDays : undefined}
              showOutsideDays
              classNames={{
                root: 'relative text-foreground',
                months: 'flex flex-col gap-4 sm:flex-row sm:gap-6',
                month: 'space-y-2',
                month_caption: 'flex h-8 items-center justify-center text-sm font-semibold',
                nav: 'absolute inset-x-0 top-0 flex items-center justify-between',
                button_previous:
                  'inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-label transition-colors hover:bg-surface-muted hover:text-foreground disabled:opacity-40',
                button_next:
                  'inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-label transition-colors hover:bg-surface-muted hover:text-foreground disabled:opacity-40',
                chevron: 'size-4 fill-current',
                month_grid: 'border-collapse',
                weekdays: 'flex',
                weekday: 'w-9 text-center text-xs font-medium text-muted-foreground',
                week: 'mt-1 flex w-full',
                day: 'relative p-0 text-center text-sm',
                day_button:
                  'inline-flex size-9 cursor-pointer items-center justify-center rounded-md font-normal disabled:cursor-not-allowed transition-colors hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none',
                today: 'font-semibold text-primary',
                selected: 'font-semibold',
                range_start:
                  '[&>button]:bg-primary [&>button]:text-primary-foreground [&>button:hover]:bg-primary',
                range_end:
                  '[&>button]:bg-primary [&>button]:text-primary-foreground [&>button:hover]:bg-primary',
                range_middle:
                  '[&>button]:rounded-none [&>button]:bg-primary/15 [&>button]:text-foreground',
                outside: 'opacity-40',
                disabled: 'cursor-not-allowed opacity-30',
              }}
            />
            {hasValue ? (
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleClear}
                  className="cursor-pointer rounded-md px-2 py-1 text-xs text-label transition-colors hover:bg-surface-muted hover:text-foreground"
                >
                  {datePickerText.clear}
                </button>
              </div>
            ) : null}
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      {hint != null ? (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {hasError ? (
        <p id={errorId} role="alert" className="text-xs text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
