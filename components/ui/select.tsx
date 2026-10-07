'use client';

import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type ForwardedRef,
  type KeyboardEvent,
  type MutableRefObject,
} from 'react';
import { Icon } from '@/components/shared';
import { useClickOutside } from '@/hooks/common';
import type {
  SelectDropdownLayout,
  SelectDropdownPlacement,
  SelectOption,
  SelectProps,
  SelectSize,
} from '@/types';

export type { SelectOption, SelectProps, SelectSize } from '@/types';

export const selectTriggerClassName =
  'flex w-full cursor-pointer items-center justify-between gap-1 rounded-lg border bg-surface px-3 text-foreground transition-colors focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50';

export const selectTriggerSizes: Record<SelectSize, string> = {
  sm: 'h-8 text-xs',
  md: 'h-10 text-sm',
};

/** Ring tracks focus and open state, matching Input. */
export const selectStateClassName = (hasError: boolean, open = false) => {
  if (hasError) {
    return `border-error focus:border-error focus:ring-error/20${open ? ' ring-error/20' : ''}`;
  }
  return open
    ? 'border-primary ring-0'
    : 'border-border hover:border-primary focus:border-primary focus:ring-0';
};

/** Gap between trigger and menu, matching the mt-1/mb-1 offset. */
const dropdownOffset = 4;
/** Same height budget as the menu max-h-60. */
const dropdownMaxHeight = 240;
const dropdownMinWidth = 160;

const dropdownPlacementClassNames: Record<SelectDropdownPlacement, string> = {
  'bottom-start': 'top-full mt-1 left-0',
  'bottom-end': 'top-full mt-1 right-0',
  'top-start': 'bottom-full mb-1 left-0',
  'top-end': 'bottom-full mb-1 right-0',
};

function resolvePlacement(
  rect: DOMRect,
  viewport: Pick<Window, 'innerWidth' | 'innerHeight'>,
  menuWidth: number,
): SelectDropdownLayout {
  const spaceBelow = viewport.innerHeight - rect.bottom - dropdownOffset;
  const spaceAbove = rect.top - dropdownOffset;
  const side = spaceBelow >= dropdownMaxHeight || spaceBelow >= spaceAbove ? 'bottom' : 'top';
  const available = side === 'bottom' ? spaceBelow : spaceAbove;
  const width = Math.max(menuWidth, dropdownMinWidth);
  const alignedToStart = rect.left + width <= viewport.innerWidth || rect.right - width < 0;

  return {
    placement: `${side}-${alignedToStart ? 'start' : 'end'}` as SelectDropdownPlacement,
    maxHeight: Math.max(80, Math.min(dropdownMaxHeight, available)),
  };
}

function cx(...classNames: (string | false | undefined)[]) {
  return classNames.filter(Boolean).join(' ');
}

function setRef<T>(ref: ForwardedRef<T>, node: T) {
  if (typeof ref === 'function') ref(node);
  else if (ref) (ref as MutableRefObject<T | null>).current = node;
}

function firstEnabledIndex(options: readonly SelectOption[]) {
  return options.findIndex((option) => !option.disabled);
}

function nextEnabledIndex(options: readonly SelectOption[], from: number, step: number) {
  const total = options.length;
  for (let offset = 1; offset <= total; offset += 1) {
    const index = (from + step * offset + total * Math.abs(step)) % total;
    if (!options[index]?.disabled) return index;
  }
  return from;
}

function lastEnabledIndex(options: readonly SelectOption[]) {
  for (let index = options.length - 1; index >= 0; index -= 1) {
    if (!options[index].disabled) return index;
  }
  return -1;
}

export const Select = forwardRef<HTMLButtonElement, SelectProps>(function Select(
  {
    className,
    containerClassName,
    error,
    hint,
    id,
    label,
    options,
    value,
    defaultValue,
    onChange,
    disabled,
    size = 'md',
    autoWidth = false,
    placeholder = 'Select',
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
  },
  ref,
) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const labelId = `${selectId}-label`;
  const listboxId = `${selectId}-listbox`;
  const hasHint = hint != null;
  const hasError = error != null;
  const hintId = hasHint ? `${selectId}-hint` : undefined;
  const errorId = hasError ? `${selectId}-error` : undefined;
  const describedBy = [ariaDescribedBy, hintId, errorId].filter(Boolean).join(' ') || undefined;

  const [open, setOpen] = useState(false);
  const [uncontrolledValue, setUncontrolledValue] = useState(
    defaultValue ?? options[0]?.value ?? '',
  );
  const [activeIndex, setActiveIndex] = useState(-1);
  const [placement, setPlacement] = useState<SelectDropdownPlacement>('bottom-start');
  const [menuMaxHeight, setMenuMaxHeight] = useState(dropdownMaxHeight);
  const [menuWidth, setMenuWidth] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);

  const selectedValue = value ?? uncontrolledValue;
  const selectedIndex = options.findIndex((option) => option.value === selectedValue);
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : null;
  const activeOptionId = open && activeIndex >= 0 ? `${selectId}-option-${activeIndex}` : undefined;

  useEffect(() => {
    if (!open) return;

    function updatePlacement() {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      // Full width selects get a menu as wide as the trigger; auto width
      // ones keep sizing to their content.
      const nextWidth = Math.round(
        autoWidth ? dropdownMinWidth : Math.max(rect.width, dropdownMinWidth),
      );
      const next = resolvePlacement(rect, window, nextWidth);
      setPlacement((current) => (current === next.placement ? current : next.placement));
      setMenuMaxHeight((current) => (current === next.maxHeight ? current : next.maxHeight));
      setMenuWidth((current) => (current === nextWidth ? current : nextWidth));
    }

    updatePlacement();
    listboxRef.current?.focus();
    window.addEventListener('resize', updatePlacement);
    window.addEventListener('scroll', updatePlacement, true);
    return () => {
      window.removeEventListener('resize', updatePlacement);
      window.removeEventListener('scroll', updatePlacement, true);
    };
  }, [open, autoWidth]);

  useClickOutside(
    () => {
      setOpen(false);
      setActiveIndex(-1);
    },
    open,
    rootRef,
  );

  function close(focusTrigger = true) {
    setOpen(false);
    setActiveIndex(-1);
    if (focusTrigger) triggerRef.current?.focus();
  }

  function selectOption(nextValue: string) {
    if (value === undefined) setUncontrolledValue(nextValue);
    onChange?.(nextValue);
    close();
  }

  function onTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;
    if (event.key === 'Escape' || event.key === 'Tab') {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }
    if (!['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(event.key)) return;
    event.preventDefault();
    setOpen(true);
    setActiveIndex(
      event.key === 'ArrowUp'
        ? lastEnabledIndex(options)
        : selectedIndex >= 0
          ? selectedIndex
          : firstEnabledIndex(options),
    );
  }

  function onListboxKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (['Escape', 'Tab'].includes(event.key)) {
      event.preventDefault();
      close(event.key === 'Escape');
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const option = options[activeIndex];
      if (option && !option.disabled) selectOption(option.value);
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex(nextEnabledIndex(options, activeIndex, event.key === 'ArrowDown' ? 1 : -1));
      return;
    }
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      setActiveIndex(event.key === 'Home' ? firstEnabledIndex(options) : lastEnabledIndex(options));
    }
  }

  return (
    <div
      ref={rootRef}
      className={['flex flex-col gap-1.5', autoWidth ? 'w-fit' : 'w-full', containerClassName]
        .filter(Boolean)
        .join(' ')}
    >
      {label != null ? (
        <span id={labelId} className="text-sm font-medium text-foreground">
          {label}
        </span>
      ) : null}
      <div className={['relative', autoWidth ? 'w-fit' : 'w-full'].join(' ')}>
        <button
          ref={(node) => {
            triggerRef.current = node;
            setRef(ref, node);
          }}
          id={selectId}
          type="button"
          disabled={disabled}
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-activedescendant={activeOptionId}
          aria-invalid={hasError ? true : ariaInvalid}
          aria-describedby={describedBy}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy ?? (label != null ? labelId : undefined)}
          onClick={() => {
            setOpen((current) => !current);
            setActiveIndex(selectedIndex >= 0 ? selectedIndex : -1);
          }}
          onKeyDown={onTriggerKeyDown}
          className={[
            selectTriggerClassName,
            autoWidth ? 'w-fit' : 'w-full',
            selectTriggerSizes[size],
            selectStateClassName(hasError, open),
            className,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <span className="flex-1 truncate text-left">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <Icon name="chevronDown" className="h-3 w-3 shrink-0" />
        </button>
        {open ? (
          <div
            ref={listboxRef}
            id={listboxId}
            role="listbox"
            tabIndex={-1}
            aria-activedescendant={activeOptionId}
            aria-labelledby={ariaLabelledBy}
            onKeyDown={onListboxKeyDown}
            onBlur={(event) => {
              if (rootRef.current?.contains(event.relatedTarget)) return;
              setOpen(false);
              setActiveIndex(-1);
            }}
            style={{
              maxHeight: menuMaxHeight,
              // Falls back to `w-full` until the trigger has been measured.
              width: autoWidth ? undefined : menuWidth || undefined,
            }}
            className={cx(
              'absolute z-100 overflow-auto rounded-lg border border-border bg-surface p-1 shadow-lg outline-none',
              autoWidth ? 'w-max min-w-40' : 'w-full',
              dropdownPlacementClassNames[placement],
            )}
          >
            {options.map((option, index) => (
              <div
                key={`${option.value}-${index}`}
                id={`${selectId}-option-${index}`}
                role="option"
                aria-selected={option.value === selectedValue}
                aria-disabled={option.disabled || undefined}
                data-active={index === activeIndex || undefined}
                data-selected={option.value === selectedValue || undefined}
                onClick={() => {
                  if (option.disabled) return;
                  selectOption(option.value);
                }}
                onMouseEnter={() => setActiveIndex(index)}
                className={[
                  'flex cursor-pointer items-center justify-between gap-3 rounded-md px-3 py-1.5 text-sm text-foreground',
                  'data-[active=true]:bg-primary/10',
                  'aria-disabled:cursor-not-allowed aria-disabled:opacity-50',
                ].join(' ')}
              >
                <span className="truncate">{option.label}</span>
                {option.value === selectedValue ? (
                  <Icon name="check" className="h-3.5 w-3.5 shrink-0 text-primary" />
                ) : null}
              </div>
            ))}
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

Select.displayName = 'Select';
