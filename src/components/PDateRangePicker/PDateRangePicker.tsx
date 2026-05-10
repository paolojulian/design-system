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
import './PDateRangePicker.css';

export type PDateRangePickerRef = HTMLDivElement;
export type PDateRangePickerChangeSource = 'preset' | 'calendar';
export type PDateRangePickerPresetColumns = 2 | 3 | 4 | 'auto';
type FocusableElement = { focus: () => void };

export type PDateRangeValue = {
  start?: string;
  end?: string;
};

export type PDateRangePickerPreset = {
  label: string;
  value: PDateRangeValue | (() => PDateRangeValue);
};

export type PDateRangePickerProps = {
  label: string;
  value?: PDateRangeValue;
  defaultValue?: PDateRangeValue;
  onValueChange?: (
    value: PDateRangeValue,
    details: { startDate: Date | null; endDate: Date | null; source: PDateRangePickerChangeSource },
  ) => void;
  presets?: PDateRangePickerPreset[];
  customLabel?: string;
  showCustom?: boolean;
  presetColumns?: PDateRangePickerPresetColumns;
  placeholder?: string;
  helperText?: string;
  isError?: boolean;
  errorMessage?: string;
  min?: string;
  max?: string;
  nameStart?: string;
  nameEnd?: string;
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

function isSameDay(a: Date | null, b: Date | null) {
  return Boolean(a && b && toIsoDate(a) === toIsoDate(b));
}

function isBeforeDate(date: Date, minDate: Date | null) {
  return Boolean(minDate && date.getTime() < minDate.getTime());
}

function isAfterDate(date: Date, maxDate: Date | null) {
  return Boolean(maxDate && date.getTime() > maxDate.getTime());
}

function isInRange(date: Date, startDate: Date | null, endDate: Date | null) {
  return Boolean(startDate && endDate && date > startDate && date < endDate);
}

function normalizeRange(startDate: Date | null, endDate: Date | null): PDateRangeValue {
  if (!startDate && !endDate) {
    return {};
  }

  if (startDate && endDate && endDate < startDate) {
    return {
      start: toIsoDate(endDate),
      end: toIsoDate(startDate),
    };
  }

  return {
    start: toIsoDate(startDate),
    end: toIsoDate(endDate),
  };
}

function resolvePresetRange(preset: PDateRangePickerPreset) {
  return typeof preset.value === 'function' ? preset.value() : preset.value;
}

function getRangeDates(value: PDateRangeValue | undefined) {
  return {
    startDate: toLocalDate(value?.start),
    endDate: toLocalDate(value?.end),
  };
}

function isSameRange(a: PDateRangeValue | undefined, b: PDateRangeValue | undefined) {
  return Boolean(a?.start && a?.end && a.start === b?.start && a.end === b?.end);
}

function getRangeLabel(value: PDateRangeValue | undefined, placeholder: string, locale?: string) {
  const { startDate, endDate } = getRangeDates(value);

  if (startDate && endDate) {
    return `${getDateLabel(startDate, locale)} - ${getDateLabel(endDate, locale)}`;
  }

  if (startDate) {
    return `${getDateLabel(startDate, locale)} -`;
  }

  if (endDate) {
    return `- ${getDateLabel(endDate, locale)}`;
  }

  return placeholder;
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

export const PDateRangePicker = forwardRef<PDateRangePickerRef, PDateRangePickerProps>(
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
      placeholder = 'Select range',
      helperText,
      isError = false,
      errorMessage,
      min,
      max,
      nameStart,
      nameEnd,
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
    const [internalValue, setInternalValue] = useState<PDateRangeValue>(defaultValue ?? {});
    const [isOpen, setIsOpen] = useState(false);
    const selectedValue = isControlled ? value : internalValue;
    const { startDate, endDate } = getRangeDates(selectedValue);
    const today = useMemo(getToday, []);
    const minDate = toLocalDate(min);
    const maxDate = toLocalDate(max);
    const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(startDate ?? today));
    const [focusedDate, setFocusedDate] = useState(() => startDate ?? today);
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
            '--p-date-range-picker-preset-columns': String(presetColumns),
          } as CSSProperties);
    const hasCompleteRange = Boolean(selectedValue?.start && selectedValue?.end);
    const messageId = isError && errorMessage ? errorId : helperText ? helperId : undefined;
    const displayValue = getRangeLabel(selectedValue, placeholder, locale);
    const selectedMatchesPreset = hasPresets
      ? presets.some((preset) => isSameRange(resolvePresetRange(preset), selectedValue))
      : false;
    const isCustomActive = isOpen || Boolean(hasCompleteRange && !selectedMatchesPreset);

    useEffect(() => {
      if (!isOpen) {
        return;
      }

      dayRefs.current[toIsoDate(focusedDate)]?.focus();
    }, [focusedDate, isOpen, visibleMonth]);

    const setRangeValue = (range: PDateRangeValue, source: PDateRangePickerChangeSource) => {
      const { startDate: nextStartDate, endDate: nextEndDate } = getRangeDates(range);
      const normalizedRange = normalizeRange(nextStartDate, nextEndDate);

      if (!isControlled) {
        setInternalValue(normalizedRange);
      }

      const normalizedDates = getRangeDates(normalizedRange);

      if (normalizedDates.startDate) {
        setVisibleMonth(startOfMonth(normalizedDates.startDate));
      }

      onValueChange?.(normalizedRange, {
        startDate: normalizedDates.startDate,
        endDate: normalizedDates.endDate,
        source,
      });
    };

    const openCalendar = (trigger: HTMLButtonElement) => {
      if (disabled || readOnly) {
        return;
      }

      const nextFocusedDate = startDate ?? today;
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

    const handlePresetClick = (preset: PDateRangePickerPreset) => {
      if (disabled || readOnly) {
        return;
      }

      setRangeValue(resolvePresetRange(preset), 'preset');
      closeCalendar();
    };

    const handleDayClick = (date: Date) => {
      if (disabled || readOnly || isBeforeDate(date, minDate) || isAfterDate(date, maxDate)) {
        return;
      }

      if (!startDate || endDate) {
        setFocusedDate(date);
        setRangeValue({ start: toIsoDate(date), end: '' }, 'calendar');
        return;
      }

      setFocusedDate(date);
      setRangeValue({ start: toIsoDate(startDate), end: toIsoDate(date) }, 'calendar');
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
          'p-date-range-picker',
          hasPresets && 'p-date-range-picker--with-presets',
          isError && 'p-date-range-picker--error',
          disabled && 'p-date-range-picker--disabled',
          className,
        )}
      >
        <div id={labelId} className="p-date-range-picker__label">
          <span>{label}</span>
          <span
            className={cn(
              'p-date-range-picker__label-value',
              !hasCompleteRange && 'p-date-range-picker__label-value--empty',
            )}
          >
            {displayValue}
          </span>
        </div>

        {hasPresets ? (
          <div
            aria-describedby={messageId}
            aria-labelledby={labelId}
            className={cn(
              'p-date-range-picker__presets',
              presetColumns !== 'auto' && 'p-date-range-picker__presets--fixed',
            )}
            role="group"
          >
            {presets.map((preset) => {
              const presetRange = resolvePresetRange(preset);
              const isActive = isSameRange(presetRange, selectedValue);

              return (
                <button
                  key={preset.label}
                  type="button"
                  className={cn('p-date-range-picker__preset', isActive && 'p-date-range-picker__preset--active')}
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
                  'p-date-range-picker__preset',
                  isCustomActive && 'p-date-range-picker__preset--active',
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
            className={cn(
              'p-date-range-picker__trigger',
              !hasCompleteRange && 'p-date-range-picker__trigger--empty',
            )}
            disabled={disabled}
            aria-controls={panelId}
            aria-describedby={messageId}
            aria-expanded={isOpen}
            aria-haspopup="dialog"
            aria-labelledby={labelId}
            onClick={(event) => (isOpen ? closeCalendar(true) : openCalendar(event.currentTarget))}
          >
            <span>{displayValue}</span>
            <span className="p-date-range-picker__trigger-icon">
              <CalendarIcon />
            </span>
          </button>
        )}

        <input type="hidden" name={nameStart} value={selectedValue?.start ?? ''} required={required} />
        <input type="hidden" name={nameEnd} value={selectedValue?.end ?? ''} required={required} />

        {isOpen && (
          <div
            id={panelId}
            className="p-date-range-picker__panel"
            role="dialog"
            aria-labelledby={`${panelId}-title`}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                closeCalendar();
              }
            }}
          >
            <div className="p-date-range-picker__calendar-header">
              <button
                type="button"
                className="p-date-range-picker__nav"
                aria-label="Previous month"
                onClick={() => setVisibleMonth((date) => addMonths(date, -1))}
              >
                <ChevronLeftIcon />
              </button>
              <div id={`${panelId}-title`} className="p-date-range-picker__month">
                {getMonthLabel(visibleMonth, locale)}
              </div>
              <button
                type="button"
                className="p-date-range-picker__nav"
                aria-label="Next month"
                onClick={() => setVisibleMonth((date) => addMonths(date, 1))}
              >
                <ChevronRightIcon />
              </button>
            </div>

            <div className="p-date-range-picker__weekdays" aria-hidden="true">
              {weekdayLabels.map((weekday) => (
                <span key={weekday}>{weekday}</span>
              ))}
            </div>

            <div className="p-date-range-picker__grid" role="grid" aria-labelledby={`${panelId}-title`}>
              {calendarDays.map((date) => {
                const isoDate = toIsoDate(date);
                const isOutsideMonth = date.getMonth() !== visibleMonth.getMonth();
                const isRangeStart = isSameDay(date, startDate);
                const isRangeEnd = isSameDay(date, endDate);
                const isRangeMiddle = isInRange(date, startDate, endDate);
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
                      'p-date-range-picker__day',
                      isOutsideMonth && 'p-date-range-picker__day--outside',
                      isToday && 'p-date-range-picker__day--today',
                      isRangeMiddle && 'p-date-range-picker__day--in-range',
                      (isRangeStart || isRangeEnd) && 'p-date-range-picker__day--selected',
                    )}
                    disabled={isDisabled}
                    aria-label={getDayLabel(date, locale)}
                    aria-selected={isRangeStart || isRangeEnd}
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
          <p id={errorId} role="alert" className="p-date-range-picker__message p-date-range-picker__message--error">
            {errorMessage}
          </p>
        ) : null}

        {!isError && helperText ? (
          <p id={helperId} className="p-date-range-picker__message">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);

PDateRangePicker.displayName = 'PDateRangePicker';

export const PDateRangePickerPresets = {
  thisWeek: {
    label: 'This week',
    value: () => {
      const today = getToday();
      const weekStart = addDays(today, -today.getDay());

      return {
        start: toIsoDate(weekStart),
        end: toIsoDate(addDays(weekStart, 6)),
      };
    },
  },
  last7Days: {
    label: 'Last 7 days',
    value: () => {
      const today = getToday();
      return {
        start: toIsoDate(addDays(today, -6)),
        end: toIsoDate(today),
      };
    },
  },
  last14Days: {
    label: 'Last 14 days',
    value: () => {
      const today = getToday();
      return {
        start: toIsoDate(addDays(today, -13)),
        end: toIsoDate(today),
      };
    },
  },
  last30Days: {
    label: 'Last 30 days',
    value: () => {
      const today = getToday();
      return {
        start: toIsoDate(addDays(today, -29)),
        end: toIsoDate(today),
      };
    },
  },
  thisMonth: {
    label: 'This month',
    value: () => {
      const today = getToday();
      const start = startOfMonth(today);
      const end = endOfMonth(today);

      return {
        start: toIsoDate(start),
        end: toIsoDate(end),
      };
    },
  },
  lastMonth: {
    label: 'Last month',
    value: () => {
      const today = getToday();
      const lastMonth = addMonths(today, -1);

      return {
        start: toIsoDate(startOfMonth(lastMonth)),
        end: toIsoDate(endOfMonth(lastMonth)),
      };
    },
  },
  monthToDate: {
    label: 'Month to date',
    value: () => {
      const today = getToday();
      const start = startOfMonth(today);

      return {
        start: toIsoDate(start),
        end: toIsoDate(today),
      };
    },
  },
  yearToDate: {
    label: 'Year to date',
    value: () => {
      const today = getToday();

      return {
        start: toIsoDate(new Date(today.getFullYear(), 0, 1)),
        end: toIsoDate(today),
      };
    },
  },
} satisfies Record<string, PDateRangePickerPreset>;
