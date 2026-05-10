import {
  forwardRef,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ChangeEvent,
  type CSSProperties,
  type HTMLAttributes,
} from 'react';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '../../icons';
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

function getMonthOptions(locale?: string) {
  return Array.from({ length: 12 }, (_, month) => ({
    label: new Intl.DateTimeFormat(locale, { month: 'long' }).format(new Date(2024, month, 1)),
    value: month,
  }));
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

function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function isMonthDisabled(monthDate: Date, minDate: Date | null, maxDate: Date | null) {
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);

  return Boolean((minDate && monthEnd < minDate) || (maxDate && monthStart > maxDate));
}

function clampVisibleMonth(monthDate: Date, minDate: Date | null, maxDate: Date | null) {
  if (minDate && endOfMonth(monthDate) < minDate) {
    return startOfMonth(minDate);
  }

  if (maxDate && startOfMonth(monthDate) > maxDate) {
    return startOfMonth(maxDate);
  }

  return startOfMonth(monthDate);
}

function getFocusableDateInMonth(monthDate: Date, preferredDate: Date, minDate: Date | null, maxDate: Date | null) {
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);
  let nextDate = new Date(
    monthStart.getFullYear(),
    monthStart.getMonth(),
    Math.min(preferredDate.getDate(), monthEnd.getDate()),
  );

  if (minDate && nextDate < minDate) {
    nextDate = isSameMonth(minDate, monthStart) ? minDate : monthStart;
  }

  if (maxDate && nextDate > maxDate) {
    nextDate = isSameMonth(maxDate, monthStart) ? maxDate : monthEnd;
  }

  return nextDate;
}

function getYearOptions(visibleMonth: Date, minDate: Date | null, maxDate: Date | null, today: Date) {
  const visibleYear = visibleMonth.getFullYear();
  const defaultStartYear = Math.min(visibleYear, today.getFullYear() - 100);
  const defaultEndYear = Math.max(visibleYear, today.getFullYear() + 20);
  const startYear = minDate?.getFullYear() ?? defaultStartYear;
  const endYear = maxDate?.getFullYear() ?? defaultEndYear;
  const firstYear = Math.min(startYear, endYear, visibleYear);
  const lastYear = Math.max(startYear, endYear, visibleYear);

  return Array.from({ length: lastYear - firstYear + 1 }, (_, index) => firstYear + index);
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
    const shouldFocusCalendarDateRef = useRef(false);
    const calendarDays = getCalendarDays(visibleMonth, weekStartsOn);
    const weekdayLabels = getWeekdayLabels(weekStartsOn, locale);
    const monthOptions = useMemo(() => getMonthOptions(locale), [locale]);
    const yearOptions = getYearOptions(visibleMonth, minDate, maxDate, today);
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
    const previousMonth = addMonths(visibleMonth, -1);
    const nextMonth = addMonths(visibleMonth, 1);
    const isPreviousMonthDisabled = isMonthDisabled(previousMonth, minDate, maxDate);
    const isNextMonthDisabled = isMonthDisabled(nextMonth, minDate, maxDate);

    useEffect(() => {
      if (!isOpen) {
        return;
      }

      if (shouldFocusCalendarDateRef.current) {
        dayRefs.current[toIsoDate(focusedDate)]?.focus();
        shouldFocusCalendarDateRef.current = false;
      }
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
      shouldFocusCalendarDateRef.current = true;
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

    const updateVisibleMonth = (nextMonth: Date) => {
      const clampedMonth = clampVisibleMonth(nextMonth, minDate, maxDate);

      setVisibleMonth(clampedMonth);
      setFocusedDate(getFocusableDateInMonth(clampedMonth, focusedDate, minDate, maxDate));
    };

    const handleMonthChange = (event: ChangeEvent<HTMLSelectElement>) => {
      const { value: nextMonth } = event.currentTarget as unknown as { value: string };

      updateVisibleMonth(new Date(visibleMonth.getFullYear(), Number(nextMonth), 1));
    };

    const handleYearChange = (event: ChangeEvent<HTMLSelectElement>) => {
      const { value: nextYear } = event.currentTarget as unknown as { value: string };

      updateVisibleMonth(new Date(Number(nextYear), visibleMonth.getMonth(), 1));
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

      shouldFocusCalendarDateRef.current = true;
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
        {hasPresets ? (
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
        ) : null}

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
              hasCompleteRange && 'p-date-range-picker__trigger--filled',
              isOpen && 'p-date-range-picker__trigger--open',
            )}
            disabled={disabled}
            aria-controls={panelId}
            aria-describedby={messageId}
            aria-expanded={isOpen}
            aria-haspopup="dialog"
            aria-label={`${label}: ${displayValue}`}
            onClick={(event) => (isOpen ? closeCalendar(true) : openCalendar(event.currentTarget))}
          >
            <span
              id={labelId}
              className={cn(
                'p-date-range-picker__trigger-label p-date-range-picker__trigger-floating-label',
                isError && 'p-date-range-picker__trigger-label--error',
              )}
              aria-hidden="true"
            >
              {label}
            </span>
            <span
              className={cn(
                'p-date-range-picker__trigger-label p-date-range-picker__trigger-placeholder-label',
                isError && 'p-date-range-picker__trigger-label--error',
              )}
              aria-hidden="true"
            >
              {label}
            </span>
            <span className="p-date-range-picker__trigger-value">{displayValue}</span>
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
                disabled={isPreviousMonthDisabled}
                onClick={() => updateVisibleMonth(previousMonth)}
              >
                <ChevronLeftIcon />
              </button>
              <div className="p-date-range-picker__month">
                <span id={`${panelId}-title`} className="p-date-range-picker__month-label">
                  {getMonthLabel(visibleMonth, locale)}
                </span>
                <select
                  className="p-date-range-picker__month-select p-date-range-picker__calendar-select"
                  aria-label="Month"
                  value={visibleMonth.getMonth()}
                  onChange={handleMonthChange}
                >
                  {monthOptions.map((month) => (
                    <option
                      key={month.value}
                      value={month.value}
                      disabled={isMonthDisabled(new Date(visibleMonth.getFullYear(), month.value, 1), minDate, maxDate)}
                    >
                      {month.label}
                    </option>
                  ))}
                </select>
                <select
                  className="p-date-range-picker__year-select p-date-range-picker__calendar-select"
                  aria-label="Year"
                  value={visibleMonth.getFullYear()}
                  onChange={handleYearChange}
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                className="p-date-range-picker__nav"
                aria-label="Next month"
                disabled={isNextMonthDisabled}
                onClick={() => updateVisibleMonth(nextMonth)}
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
