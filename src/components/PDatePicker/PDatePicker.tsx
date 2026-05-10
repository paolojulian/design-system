import {
  forwardRef,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
} from 'react';
import cn from '../../utils/cn';
import './PDatePicker.css';

export type PDatePickerRef = HTMLDivElement;
export type PDatePickerChangeSource = 'preset' | 'calendar';
export type PDatePickerPresetColumns = 2 | 3 | 4 | 'auto';
type FocusableElement = { focus: () => void };

export type PDatePickerPreset = {
  label: string;
  value: string | Date | (() => string | Date);
};

export type PDatePickerProps = {
  label: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (
    value: string,
    details: { date: Date | null; source: PDatePickerChangeSource },
  ) => void;
  presets?: PDatePickerPreset[];
  customLabel?: string;
  showCustom?: boolean;
  presetColumns?: PDatePickerPresetColumns;
  placeholder?: string;
  helperText?: string;
  isError?: boolean;
  errorMessage?: string;
  min?: string;
  max?: string;
  name?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  locale?: string;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'defaultValue' | 'onChange'>;

const dayFormatter = new Intl.DateTimeFormat(undefined, { weekday: 'short' });

function toLocalDate(value: string | Date | null | undefined) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime())
      ? null
      : new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  const parts = value.split('-').map(Number);

  if (parts.length !== 3 || parts.some(Number.isNaN)) {
    return null;
  }

  const [year, month, day] = parts;
  const date = new Date(year, month - 1, day);

  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }

  return date;
}

function toIsoDate(date: Date | null) {
  if (!date) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function addMonthsClamped(date: Date, months: number) {
  const monthStart = addMonths(date, months);
  const lastDay = endOfMonth(monthStart).getDate();

  return new Date(monthStart.getFullYear(), monthStart.getMonth(), Math.min(date.getDate(), lastDay));
}

function addDays(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function isSameDay(a: Date | null, b: Date | null) {
  return Boolean(a && b && toIsoDate(a) === toIsoDate(b));
}

function getToday() {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), today.getDate());
}

function getCalendarDays(monthDate: Date, weekStartsOn: number) {
  const monthStart = startOfMonth(monthDate);
  const offset = (monthStart.getDay() - weekStartsOn + 7) % 7;
  const gridStart = addDays(monthStart, -offset);

  return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
}

function resolvePresetDate(preset: PDatePickerPreset) {
  const value = typeof preset.value === 'function' ? preset.value() : preset.value;
  return toLocalDate(value);
}

function getMonthLabel(date: Date, locale?: string) {
  return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(date);
}

function getDateLabel(date: Date, locale?: string) {
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function getDayLabel(date: Date, locale?: string) {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function getWeekdayLabels(weekStartsOn: number, locale?: string) {
  const baseSunday = new Date(2024, 0, 7);

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(baseSunday, weekStartsOn + index);
    return dayFormatter.formatToParts(date).length
      ? new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date)
      : '';
  });
}

function isBeforeDate(date: Date, minDate: Date | null) {
  return Boolean(minDate && date.getTime() < minDate.getTime());
}

function isAfterDate(date: Date, maxDate: Date | null) {
  return Boolean(maxDate && date.getTime() > maxDate.getTime());
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <path d="M6 3v3" />
      <path d="M14 3v3" />
      <path d="M4 8h12" />
      <path d="M5 5h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <path d="m12 5-5 5 5 5" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <path d="m8 5 5 5-5 5" />
    </svg>
  );
}

export const PDatePicker = forwardRef<PDatePickerRef, PDatePickerProps>(
  (
    {
      label,
      value,
      defaultValue,
      onValueChange,
      presets = [],
      customLabel = 'Custom',
      showCustom = true,
      presetColumns = 'auto',
      placeholder = 'Select date',
      helperText,
      isError = false,
      errorMessage,
      min,
      max,
      name,
      disabled = false,
      readOnly = false,
      required = false,
      locale,
      weekStartsOn = 0,
      className,
      id,
      style,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const rootId = id ?? generatedId;
    const labelId = `${rootId}-label`;
    const panelId = `${rootId}-panel`;
    const helperId = `${rootId}-helper`;
    const errorId = `${rootId}-error`;
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState(defaultValue ?? '');
    const [isOpen, setIsOpen] = useState(false);
    const selectedValue = isControlled ? value : internalValue;
    const selectedDate = toLocalDate(selectedValue);
    const today = useMemo(getToday, []);
    const minDate = toLocalDate(min);
    const maxDate = toLocalDate(max);
    const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(selectedDate ?? today));
    const [focusedDate, setFocusedDate] = useState(() => selectedDate ?? today);
    const calendarTriggerRef = useRef<FocusableElement | null>(null);
    const dayRefs = useRef<Record<string, FocusableElement | null>>({});
    const calendarDays = getCalendarDays(visibleMonth, weekStartsOn);
    const weekdayLabels = getWeekdayLabels(weekStartsOn, locale);
    const hasPresets = presets.length > 0;
    const shouldRenderCustom = hasPresets ? showCustom : true;
    const presetColumnsStyle =
      presetColumns === 'auto'
        ? undefined
        : ({
            '--p-date-picker-preset-columns': String(presetColumns),
          } as CSSProperties);
    const messageId = isError && errorMessage ? errorId : helperText ? helperId : undefined;
    const displayValue = selectedDate ? getDateLabel(selectedDate, locale) : placeholder;
    const selectedMatchesPreset = hasPresets
      ? presets.some((preset) => isSameDay(resolvePresetDate(preset), selectedDate))
      : false;
    const isCustomActive = isOpen || Boolean(selectedDate && !selectedMatchesPreset);

    useEffect(() => {
      if (!isOpen) {
        return;
      }

      dayRefs.current[toIsoDate(focusedDate)]?.focus();
    }, [focusedDate, isOpen, visibleMonth]);

    const setDateValue = (date: Date | null, source: PDatePickerChangeSource) => {
      const nextValue = toIsoDate(date);

      if (!isControlled) {
        setInternalValue(nextValue);
      }

      if (date) {
        setVisibleMonth(startOfMonth(date));
      }

      onValueChange?.(nextValue, { date, source });
    };

    const openCalendar = (trigger: HTMLButtonElement) => {
      if (disabled || readOnly) {
        return;
      }

      const nextFocusedDate = selectedDate ?? today;
      calendarTriggerRef.current = trigger as unknown as FocusableElement;
      setFocusedDate(nextFocusedDate);
      setVisibleMonth(startOfMonth(nextFocusedDate));
      setIsOpen(true);
    };

    const closeCalendar = (restoreFocus = false) => {
      setIsOpen(false);

      if (restoreFocus) {
        calendarTriggerRef.current?.focus();
      }
    };

    const handlePresetClick = (preset: PDatePickerPreset) => {
      if (disabled || readOnly) {
        return;
      }

      const presetDate = resolvePresetDate(preset);
      setDateValue(presetDate, 'preset');
      closeCalendar();
    };

    const handleDayClick = (date: Date) => {
      if (disabled || readOnly || isBeforeDate(date, minDate) || isAfterDate(date, maxDate)) {
        return;
      }

      setFocusedDate(date);
      setDateValue(date, 'calendar');
      closeCalendar(true);
    };

    const focusCalendarDate = (date: Date) => {
      if (isBeforeDate(date, minDate) || isAfterDate(date, maxDate)) {
        return;
      }

      setFocusedDate(date);
      setVisibleMonth(startOfMonth(date));
    };

    const handleDayKeyDown =
      (date: Date): ButtonHTMLAttributes<HTMLButtonElement>['onKeyDown'] =>
      (event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          closeCalendar(true);
          return;
        }

        const weekOffset = (date.getDay() - weekStartsOn + 7) % 7;
        const nextDateByKey: Record<string, Date> = {
          ArrowLeft: addDays(date, -1),
          ArrowRight: addDays(date, 1),
          ArrowUp: addDays(date, -7),
          ArrowDown: addDays(date, 7),
          Home: addDays(date, -weekOffset),
          End: addDays(date, 6 - weekOffset),
          PageUp: addMonthsClamped(date, -1),
          PageDown: addMonthsClamped(date, 1),
        };
        const nextDate = nextDateByKey[event.key];

        if (!nextDate) {
          return;
        }

        event.preventDefault();
        focusCalendarDate(nextDate);
      };

    return (
      <div
        {...props}
        ref={ref}
        id={rootId}
        style={presetColumnsStyle ? { ...style, ...presetColumnsStyle } : style}
        className={cn(
          'p-date-picker',
          hasPresets && 'p-date-picker--with-presets',
          isError && 'p-date-picker--error',
          disabled && 'p-date-picker--disabled',
          className,
        )}
      >
        <div id={labelId} className="p-date-picker__label">
          <span>{label}</span>
          {hasPresets ? (
            <span className={cn('p-date-picker__label-value', !selectedDate && 'p-date-picker__label-value--empty')}>
              {displayValue}
            </span>
          ) : null}
        </div>

        {hasPresets ? (
          <div
            aria-describedby={messageId}
            aria-labelledby={labelId}
            className={cn(
              'p-date-picker__presets',
              presetColumns !== 'auto' && 'p-date-picker__presets--fixed',
            )}
            role="group"
          >
            {presets.map((preset) => {
              const presetDate = resolvePresetDate(preset);
              const isActive = isSameDay(presetDate, selectedDate);

              return (
                <button
                  key={preset.label}
                  type="button"
                  className={cn('p-date-picker__preset', isActive && 'p-date-picker__preset--active')}
                  disabled={disabled}
                  aria-pressed={isActive}
                  onClick={() => handlePresetClick(preset)}
                >
                  {preset.label}
                </button>
              );
            })}
            {shouldRenderCustom ? (
              <button
                type="button"
                className={cn(
                  'p-date-picker__preset',
                  isCustomActive && 'p-date-picker__preset--active',
                )}
                disabled={disabled}
                aria-controls={panelId}
                aria-expanded={isOpen}
                aria-pressed={isCustomActive}
                onClick={(event) => (isOpen ? closeCalendar(true) : openCalendar(event.currentTarget))}
              >
                {customLabel}
              </button>
            ) : null}
          </div>
        ) : (
          <button
            type="button"
            className={cn('p-date-picker__trigger', !selectedDate && 'p-date-picker__trigger--empty')}
            disabled={disabled}
            aria-controls={panelId}
            aria-describedby={messageId}
            aria-expanded={isOpen}
            aria-haspopup="dialog"
            aria-labelledby={labelId}
            onClick={(event) => (isOpen ? closeCalendar(true) : openCalendar(event.currentTarget))}
          >
            <span>{displayValue}</span>
            <span className="p-date-picker__trigger-icon">
              <CalendarIcon />
            </span>
          </button>
        )}

        <input type="hidden" name={name} value={selectedValue ?? ''} required={required} />

        {isOpen && (
          <div
            id={panelId}
            className="p-date-picker__panel"
            role="dialog"
            aria-labelledby={`${panelId}-title`}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                closeCalendar();
              }
            }}
          >
            <div className="p-date-picker__calendar-header">
              <button
                type="button"
                className="p-date-picker__nav"
                aria-label="Previous month"
                onClick={() => setVisibleMonth((date) => addMonths(date, -1))}
              >
                <ChevronLeftIcon />
              </button>
              <div id={`${panelId}-title`} className="p-date-picker__month">
                {getMonthLabel(visibleMonth, locale)}
              </div>
              <button
                type="button"
                className="p-date-picker__nav"
                aria-label="Next month"
                onClick={() => setVisibleMonth((date) => addMonths(date, 1))}
              >
                <ChevronRightIcon />
              </button>
            </div>

            <div className="p-date-picker__weekdays" aria-hidden="true">
              {weekdayLabels.map((weekday) => (
                <span key={weekday}>{weekday}</span>
              ))}
            </div>

            <div className="p-date-picker__grid" role="grid" aria-labelledby={`${panelId}-title`}>
              {calendarDays.map((date) => {
                const isoDate = toIsoDate(date);
                const isOutsideMonth = date.getMonth() !== visibleMonth.getMonth();
                const isSelected = isSameDay(date, selectedDate);
                const isToday = isSameDay(date, today);
                const isDisabled = isBeforeDate(date, minDate) || isAfterDate(date, maxDate);

                return (
                  <button
                    key={isoDate}
                    ref={(node) => {
                      dayRefs.current[isoDate] = node as unknown as FocusableElement | null;
                    }}
                    type="button"
                    role="gridcell"
                    data-date={isoDate}
                    className={cn(
                      'p-date-picker__day',
                      isOutsideMonth && 'p-date-picker__day--outside',
                      isToday && 'p-date-picker__day--today',
                      isSelected && 'p-date-picker__day--selected',
                    )}
                    disabled={isDisabled}
                    aria-label={getDayLabel(date, locale)}
                    aria-selected={isSelected}
                    tabIndex={isSameDay(date, focusedDate) ? 0 : -1}
                    onClick={() => handleDayClick(date)}
                    onKeyDown={handleDayKeyDown(date)}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {isError && errorMessage ? (
          <p id={errorId} role="alert" className="p-date-picker__message p-date-picker__message--error">
            {errorMessage}
          </p>
        ) : null}

        {!isError && helperText ? (
          <p id={helperId} className="p-date-picker__message">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);

PDatePicker.displayName = 'PDatePicker';

export const PDatePickerPresets = {
  today: { label: 'Today', value: () => getToday() },
  yesterday: { label: 'Yesterday', value: () => addDays(getToday(), -1) },
  tomorrow: { label: 'Tomorrow', value: () => addDays(getToday(), 1) },
  startOfMonth: { label: 'Start of month', value: () => startOfMonth(getToday()) },
  endOfMonth: {
    label: 'End of month',
    value: () => {
      const today = getToday();
      return new Date(today.getFullYear(), today.getMonth() + 1, 0);
    },
  },
} satisfies Record<string, PDatePickerPreset>;
