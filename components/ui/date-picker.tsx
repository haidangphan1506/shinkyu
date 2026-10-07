'use client';

import {
  forwardRef,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ForwardedRef,
  type KeyboardEvent,
  type MutableRefObject,
} from 'react';
import { Icon } from '@/components/shared';
import { datePickerText, weekDayLabels } from '@/constants/date-picker.constant';
import { useClickOutside } from '@/hooks/common';
import type { DatePickerProps } from '@/types';
import { toDisplayDate } from '@/utils/slash-date';

export type { DatePickerProps } from '@/types';

export const dateInputClassName =
  'h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground outline-none transition-colors focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 scheme-dark';

export const dateInputStateClassName = (hasError: boolean, open = false) => {
  if (hasError) return 'border-error focus:border-error focus:ring-error/20';
  return open
    ? 'border-primary ring-0'
    : 'border-border hover:border-primary focus:border-primary focus:ring-0';
};

type CalendarPlacement = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';

/** Header + 6 week rows + footer, with a little slack. */
const calendarMaxHeight = 340;
/** Comfortable width for 7 day columns. */
const calendarMinWidth = 288;
/** Gap between trigger and calendar, matching the mt-1/mb-1 offset. */
const calendarOffset = 4;
const daysPerWeek = 7;
/** Fixed height: the grid never jumps between 5 and 6 week rows. */
const weekCount = 6;

const calendarPlacementClassNames: Record<CalendarPlacement, string> = {
  'bottom-start': 'top-full mt-1 left-0',
  'bottom-end': 'top-full mt-1 right-0',
  'top-start': 'bottom-full mb-1 left-0',
  'top-end': 'bottom-full mb-1 right-0',
};

function cx(...classNames: (string | false | undefined)[]) {
  return classNames.filter(Boolean).join(' ');
}

function pad(value: number) {
  return String(value).padStart(2, '0');
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function fromDateKey(key: string | null | undefined) {
  if (!key) return null;
  const [year, month, day] = key.split('-').map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/** Moves by whole months, clamping the day to the target month length. */
function shiftMonth(date: Date, months: number) {
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(date.getDate(), lastDay));
  return target;
}

function formatMonthLabel(date: Date) {
  return `${date.getFullYear()}年${date.getMonth() + 1}月`;
}

function formatDayLabel(date: Date) {
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

function resolvePlacement(
  rect: DOMRect,
  viewport: Pick<Window, 'innerWidth' | 'innerHeight'>,
): { placement: CalendarPlacement; maxHeight: number } {
  const spaceBelow = viewport.innerHeight - rect.bottom - calendarOffset;
  const spaceAbove = rect.top - calendarOffset;
  const side = spaceBelow >= calendarMaxHeight || spaceBelow >= spaceAbove ? 'bottom' : 'top';
  const available = side === 'bottom' ? spaceBelow : spaceAbove;
  const alignedToStart =
    rect.left + calendarMinWidth <= viewport.innerWidth || rect.right - calendarMinWidth < 0;

  return {
    placement: `${side}-${alignedToStart ? 'start' : 'end'}` as CalendarPlacement,
    maxHeight: Math.max(120, Math.min(calendarMaxHeight, available)),
  };
}

function setRef<T>(ref: ForwardedRef<T>, node: T) {
  if (typeof ref === 'function') ref(node);
  else if (ref) (ref as MutableRefObject<T | null>).current = node;
}

type CalendarCell = {
  key: string;
  day: number;
  outside: boolean;
  label: string;
};

/** Always renders 6 weeks so the popover height never jumps. */
function buildCalendar(view: Date): CalendarCell[][] {
  const first = startOfMonth(view);
  const gridStart = addDays(first, -first.getDay());
  const cells = Array.from({ length: weekCount * daysPerWeek }, (_, index) => {
    const date = addDays(gridStart, index);
    return {
      key: toDateKey(date),
      day: date.getDate(),
      outside: date.getMonth() !== view.getMonth(),
      label: formatDayLabel(date),
    } satisfies CalendarCell;
  });

  return Array.from({ length: weekCount }, (_, week) =>
    cells.slice(week * daysPerWeek, (week + 1) * daysPerWeek),
  );
}

export const DatePicker = forwardRef<HTMLButtonElement, DatePickerProps>(function DatePicker(
  {
    className,
    containerClassName,
    label,
    hint,
    error,
    id,
    name,
    min,
    max,
    placeholder,
    disabled,
    value,
    defaultValue,
    onChange,
    onBlur,
    onKeyDown,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const calendarId = `${inputId}-calendar`;
  const hasHint = hint != null;
  const hasError = error != null;
  const hintId = hasHint ? `${inputId}-hint` : undefined;
  const errorId = hasError ? `${inputId}-error` : undefined;
  const describedBy = [ariaDescribedBy, hintId, errorId].filter(Boolean).join(' ') || undefined;

  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue ?? '');
  const selectedValue = value ?? uncontrolledValue;
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState<Date>(() => new Date());
  const [focusedKey, setFocusedKey] = useState<string | null>(null);
  const [placement, setPlacement] = useState<CalendarPlacement>('bottom-start');
  const [menuMaxHeight, setMenuMaxHeight] = useState(calendarMaxHeight);

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const todayKey = toDateKey(new Date());
  const cells = useMemo(() => buildCalendar(viewDate), [viewDate]);

  function isOutOfRange(key: string) {
    return (min != null && key < min) || (max != null && key > max);
  }

  /** Keeps keyboard navigation inside the selectable window. */
  function clampRange(key: string) {
    if (min != null && key < min) return min;
    if (max != null && key > max) return max;
    return key;
  }

  function openCalendar() {
    const base = fromDateKey(selectedValue) ?? new Date();
    setViewDate(startOfMonth(base));
    setFocusedKey(clampRange(selectedValue || toDateKey(base)));
    setOpen(true);
  }

  function closeCalendar(focusTrigger = true) {
    setOpen(false);
    setFocusedKey(null);
    if (focusTrigger) triggerRef.current?.focus();
  }

  function selectDate(key: string) {
    if (isOutOfRange(key)) return;
    if (value === undefined) setUncontrolledValue(key);
    onChange?.(key);
    closeCalendar();
  }

  function moveFocus(key: string) {
    const clamped = clampRange(key);
    const date = fromDateKey(clamped);
    if (!date) return;
    setFocusedKey(clamped);
    setViewDate(startOfMonth(date));
  }

  function handleGridKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const current = fromDateKey(focusedKey) ?? fromDateKey(selectedValue) ?? new Date();

    switch (event.key) {
      case 'ArrowLeft':
        moveFocus(toDateKey(addDays(current, -1)));
        break;
      case 'ArrowRight':
        moveFocus(toDateKey(addDays(current, 1)));
        break;
      case 'ArrowUp':
        moveFocus(toDateKey(addDays(current, -daysPerWeek)));
        break;
      case 'ArrowDown':
        moveFocus(toDateKey(addDays(current, daysPerWeek)));
        break;
      case 'Home':
        moveFocus(toDateKey(addDays(current, -current.getDay())));
        break;
      case 'End':
        moveFocus(toDateKey(addDays(current, daysPerWeek - 1 - current.getDay())));
        break;
      case 'PageUp':
        moveFocus(toDateKey(shiftMonth(current, -1)));
        break;
      case 'PageDown':
        moveFocus(toDateKey(shiftMonth(current, 1)));
        break;
      case 'Enter':
      case ' ':
        selectDate(toDateKey(current));
        break;
      case 'Escape':
        // Keep the surrounding modal open; only the popover closes.
        event.nativeEvent.stopImmediatePropagation();
        closeCalendar();
        break;
      default:
        return;
    }

    event.preventDefault();
  }

  useEffect(() => {
    if (!open) return;

    function updatePlacement() {
      const trigger = triggerRef.current as HTMLButtonElement;
      const next = resolvePlacement(trigger.getBoundingClientRect(), window);
      setPlacement((current) => (current === next.placement ? current : next.placement));
      setMenuMaxHeight((current) => (current === next.maxHeight ? current : next.maxHeight));
    }

    updatePlacement();
    window.addEventListener('resize', updatePlacement);
    window.addEventListener('scroll', updatePlacement, true);
    return () => {
      window.removeEventListener('resize', updatePlacement);
      window.removeEventListener('scroll', updatePlacement, true);
    };
  }, [open]);

  useClickOutside(
    () => {
      setOpen(false);
      setFocusedKey(null);
    },
    open,
    rootRef,
  );

  useEffect(() => {
    if (!open || focusedKey == null) return;
    gridRef.current?.querySelector<HTMLElement>(`[data-date="${focusedKey}"]`)?.focus();
  }, [open, focusedKey]);

  return (
    <div
      ref={rootRef}
      className={['flex w-full flex-col gap-1.5', containerClassName].filter(Boolean).join(' ')}
    >
      {label != null ? (
        <label htmlFor={inputId} className="text-sm font-medium text-foreground">
          {label}
        </label>
      ) : null}
      <div className="relative w-full">
        <button
          ref={(node) => {
            triggerRef.current = node;
            setRef(ref, node);
          }}
          id={inputId}
          type="button"
          role="combobox"
          disabled={disabled}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={open ? calendarId : undefined}
          aria-invalid={hasError ? true : ariaInvalid}
          aria-describedby={describedBy}
          onClick={() => (open ? closeCalendar() : openCalendar())}
          onKeyDown={(event) => {
            onKeyDown?.(event);
            if (event.defaultPrevented) return;
            if (open) return;
            if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
              event.preventDefault();
              openCalendar();
            }
          }}
          onBlur={(event) => {
            onBlur?.(event);
            if (!open) return;
            // Focus moves into the calendar on open; only close when it
            // leaves the widget entirely.
            const nextTarget = event.relatedTarget as Node | null;
            if (nextTarget && rootRef.current?.contains(nextTarget)) return;
            setOpen(false);
            setFocusedKey(null);
          }}
          className={cx(
            dateInputClassName,
            'flex cursor-pointer items-center justify-between gap-2 text-left',
            dateInputStateClassName(hasError, open),
            className,
          )}
          {...props}
        >
          <span className={cx('truncate', selectedValue ? undefined : 'text-muted-foreground')}>
            {toDisplayDate(selectedValue) || placeholder || datePickerText.placeholder}
          </span>
          <Icon name="calendar" className="h-4 w-4 shrink-0" />
        </button>
        {name != null ? <input type="hidden" name={name} value={selectedValue} /> : null}
        {open ? (
          <div
            id={calendarId}
            role="dialog"
            aria-label={datePickerText.calendarLabel}
            style={{ maxHeight: menuMaxHeight }}
            className={cx(
              'absolute z-100 flex w-72 max-w-[calc(100vw-2rem)] flex-col overflow-auto rounded-lg border border-border bg-surface p-2 shadow-lg outline-none',
              calendarPlacementClassNames[placement],
            )}
          >
            <div className="flex items-center justify-between gap-1 pb-2">
              <button
                type="button"
                aria-label={datePickerText.previousMonth}
                onClick={() => setViewDate((current) => shiftMonth(current, -1))}
                className="cursor-pointer rounded-md p-1 text-label transition-colors hover:bg-surface-muted hover:text-foreground"
              >
                <Icon name="chevronLeft" className="h-4 w-4" />
              </button>
              <div aria-live="polite" className="text-sm font-semibold text-foreground">
                {formatMonthLabel(viewDate)}
              </div>
              <button
                type="button"
                aria-label={datePickerText.nextMonth}
                onClick={() => setViewDate((current) => shiftMonth(current, 1))}
                className="cursor-pointer rounded-md p-1 text-label transition-colors hover:bg-surface-muted hover:text-foreground"
              >
                <Icon name="chevronRight" className="h-4 w-4" />
              </button>
            </div>
            <div
              ref={gridRef}
              role="grid"
              aria-label={formatMonthLabel(viewDate)}
              onKeyDown={handleGridKeyDown}
            >
              <div role="row" className="grid grid-cols-7 pb-1">
                {weekDayLabels.map((weekDay) => (
                  <div
                    key={weekDay}
                    role="columnheader"
                    className="py-1 text-center text-[11px] font-medium text-muted-foreground"
                  >
                    {weekDay}
                  </div>
                ))}
              </div>
              {cells.map((week) => (
                <div role="row" key={week[0].key} className="grid grid-cols-7 gap-0.5">
                  {week.map((cell) => {
                    const isSelected = cell.key === selectedValue;
                    const isFocused = cell.key === focusedKey;
                    const isToday = cell.key === todayKey;
                    const isDisabled = isOutOfRange(cell.key);

                    return (
                      <button
                        key={cell.key}
                        type="button"
                        role="gridcell"
                        data-date={cell.key}
                        tabIndex={isFocused ? 0 : -1}
                        disabled={isDisabled}
                        aria-label={cell.label}
                        aria-selected={isSelected}
                        aria-current={isToday ? 'date' : undefined}
                        onClick={() => selectDate(cell.key)}
                        className={cx(
                          'h-9 cursor-pointer rounded-md text-sm transition-colors disabled:cursor-not-allowed',
                          isSelected
                            ? 'bg-primary font-semibold text-primary-foreground'
                            : isToday
                              ? 'font-semibold text-primary hover:bg-surface-muted'
                              : cell.outside
                                ? 'text-muted-foreground/60 hover:bg-surface-muted'
                                : 'text-foreground hover:bg-surface-muted',
                          isFocused && 'ring-2 ring-primary/40',
                          isDisabled && 'opacity-30',
                        )}
                      >
                        {cell.day}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="mt-2 flex items-center justify-between gap-2 border-t border-border pt-2">
              <button
                type="button"
                onClick={() => selectDate(todayKey)}
                disabled={isOutOfRange(todayKey)}
                className="cursor-pointer rounded-md px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {datePickerText.today}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (value === undefined) setUncontrolledValue('');
                  onChange?.('');
                  closeCalendar();
                }}
                className="cursor-pointer rounded-md px-2 py-1 text-xs font-medium text-label transition-colors hover:bg-surface-muted hover:text-foreground"
              >
                {datePickerText.clear}
              </button>
            </div>
          </div>
        ) : null}
      </div>
      {hasHint ? (
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
});

DatePicker.displayName = 'DatePicker';
