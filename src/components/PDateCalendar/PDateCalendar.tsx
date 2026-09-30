import { forwardRef, useId, useMemo, useState, type HTMLAttributes } from 'react';
import cn from '../../utils/cn';
import { getToday, toDateBlocker, toIsoDate, toLocalDate } from '../calendar/dateUtils';
import { DatePickerCalendar } from '../PDatePicker/DatePickerCalendar';
import '../PDatePicker/PDatePicker.css';

export type PDateCalendarRef = HTMLDivElement;

export type PDateCalendarProps = {
  /** Accessible name for the calendar group. Defaults to "Date". */
  label?: string;
  /** Controlled ISO date (`YYYY-MM-DD`). */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string, details: { date: Date }) => void;
  min?: string;
  max?: string;
  locale?: string;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** ISO dates (`YYYY-MM-DD`) that can't be picked, e.g. `['2026-11-01', '2026-11-02']`. */
  disabledDates?: string[];
  /**
   * A rule for unavailable days (every Sunday, holidays…), combined with
   * `disabledDates`. Blocked days are shown struck through and not
   * selectable. Keep it cheap and stable (memoize); it runs per day.
   */
  isDateDisabled?: (date: Date) => boolean;
  /** Form field name for the hidden input. */
  name?: string;
  className?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'defaultValue' | 'onChange'>;

/**
 * The single-date calendar without a trigger or popover, always on the page.
 * Same keyboard model as PDatePicker; it never moves focus on mount.
 */
export const PDateCalendar = forwardRef<PDateCalendarRef, PDateCalendarProps>(
  (
    {
      label = 'Date',
      value,
      defaultValue,
      onValueChange,
      min,
      max,
      locale,
      weekStartsOn = 0,
      disabledDates,
      isDateDisabled,
      name,
      className,
      id,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const rootId = id ?? generatedId;
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState(defaultValue ?? '');
    const selectedDate = toLocalDate(isControlled ? value : internalValue);
    const today = useMemo(getToday, []);
    const dateBlocker = useMemo(() => toDateBlocker(disabledDates, isDateDisabled), [disabledDates, isDateDisabled]);

    const handleSelect = (date: Date) => {
      const nextValue = toIsoDate(date);

      if (!isControlled) {
        setInternalValue(nextValue);
      }

      onValueChange?.(nextValue, { date });
    };

    return (
      <div
        {...props}
        ref={ref}
        id={rootId}
        role="group"
        aria-label={label}
        className={cn('p-date-picker', 'p-date-picker--inline', className)}
      >
        <DatePickerCalendar
          id={`${rootId}-calendar`}
          selectedDate={selectedDate}
          today={today}
          minDate={toLocalDate(min)}
          maxDate={toLocalDate(max)}
          locale={locale}
          weekStartsOn={weekStartsOn}
          isDateDisabled={dateBlocker}
          onSelect={handleSelect}
          autoFocus={false}
        />
        <input type="hidden" name={name} value={toIsoDate(selectedDate)} />
      </div>
    );
  },
);

PDateCalendar.displayName = 'PDateCalendar';
