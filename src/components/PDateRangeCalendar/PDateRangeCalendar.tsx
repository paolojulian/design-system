import { forwardRef, useId, useMemo, useState, type HTMLAttributes, type ReactNode } from 'react';
import { P_TOKEN_VALUES } from '../../constants/tokens';
import cn from '../../utils/cn';
import { useMediaQuery } from '../../utils/useMediaQuery';
import { PButton } from '../PButton';
import { DateRangeCalendar } from '../PDateRangePicker/DateRangeCalendar';
import {
  getRangeDates,
  getToday,
  normalizeRange,
  toDateBlocker,
  toIsoDate,
  toLocalDate,
} from '../PDateRangePicker/dateRangeUtils';
import type { DayRange } from '../PDateRangePicker/rangeSelection';
import type { DateBlockerUnit, PDateRangePickerSummaryUnit, PDateRangeValue } from '../PDateRangePicker/types';
import '../PDateRangePicker/PDateRangePicker.css';

export type PDateRangeCalendarRef = HTMLDivElement;

export type PDateRangeCalendarProps = {
  /** Accessible name for the calendar group. Defaults to "Date range". */
  label?: string;
  value?: PDateRangeValue;
  defaultValue?: PDateRangeValue;
  onValueChange?: (value: PDateRangeValue, details: { startDate: Date | null; endDate: Date | null }) => void;
  min?: string;
  max?: string;
  locale?: string;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** ISO dates (`YYYY-MM-DD`) that can't be picked, e.g. `['2026-11-01', '2026-11-02']`. */
  disabledDates?: string[];
  /**
   * A rule for unavailable days (every Sunday, holidays…), combined with
   * `disabledDates`. Blocked days are shown hatched, not selectable,
   * and no range may include one. Keep it cheap and stable (memoize); it runs per day.
   */
  isDateDisabled?: (date: Date) => boolean;
  /**
   * What a disabled date blocks. `day` (default): the whole day, so no range may
   * include it. `night`: the night that starts on it, for stays - the date can't
   * start or sit inside a range, but it can end one: a booked night's date is
   * the previous guest's checkout day, and is offered as such once a start is held.
   */
  disabledUnit?: DateBlockerUnit;
  /** The month to open on when nothing is selected, as an ISO date in it. Defaults to today's month. */
  defaultMonth?: string;
  /**
   * Extra content inside each day cell, after the number - a price, a marker.
   * Decorative: the cell's accessible name stays the date. Keep it cheap; it runs per visible day.
   */
  renderDayContent?: (date: Date) => ReactNode;
  /** Months side by side from the `md` breakpoint. Defaults to 2; one month below it. */
  numberOfMonths?: 1 | 2;
  /** How the header counts a range: inclusive `days` (default) or `nights`. */
  summaryUnit?: PDateRangePickerSummaryUnit;
  /**
   * Shows the Check-in / Check-out (Start date / End date) fields under the
   * summary title. Defaults to `true`. Turn it off when the form around the
   * calendar already shows the picked dates, so they are not printed twice;
   * the title ("Select a start date", "3 nights") stays.
   */
  showEdges?: boolean;
  /**
   * Stretch to the container's width instead of hugging the months, so the
   * day cells grow with the space - for a form column or a phone-wide sheet.
   * Defaults to `false`.
   */
  fullWidth?: boolean;
  /**
   * Let a month be as tall as its weeks. By default every month keeps six
   * rows so the calendar does not change height between months; off that
   * reserve where what follows the calendar should sit right under it.
   * Defaults to `false`.
   */
  trimWeeks?: boolean;
  /** Shows a "Clear dates" action under the calendar. Defaults to `true`. */
  showClear?: boolean;
  /** Form field names for the hidden start / end inputs. */
  nameStart?: string;
  nameEnd?: string;
  className?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'defaultValue' | 'onChange'>;

/**
 * The range calendar without a trigger or popover, always on the page (like
 * Airbnb's listing calendar). Same selection rules, drag, and summary header
 * as PDateRangePicker; it never moves focus on mount.
 */
export const PDateRangeCalendar = forwardRef<PDateRangeCalendarRef, PDateRangeCalendarProps>(
  (
    {
      label = 'Date range',
      value,
      defaultValue,
      onValueChange,
      min,
      max,
      locale,
      weekStartsOn = 0,
      disabledDates,
      isDateDisabled,
      disabledUnit,
      defaultMonth,
      renderDayContent,
      numberOfMonths = 2,
      summaryUnit = 'days',
      showEdges = true,
      fullWidth = false,
      trimWeeks = false,
      showClear = true,
      nameStart,
      nameEnd,
      className,
      id,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const rootId = id ?? generatedId;
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState<PDateRangeValue>(defaultValue ?? {});
    const selectedValue = isControlled ? value : internalValue;
    const { startDate, endDate } = getRangeDates(selectedValue);
    const today = useMemo(getToday, []);
    const dateBlocker = useMemo(() => toDateBlocker(disabledDates, isDateDisabled), [disabledDates, isDateDisabled]);
    const isWide = useMediaQuery(`(min-width: ${P_TOKEN_VALUES.breakpoint.md})`);
    const monthCount = isWide ? numberOfMonths : 1;

    const handleRangeChange = (range: DayRange) => {
      const normalized = normalizeRange(range.start, range.end);
      const dates = getRangeDates(normalized);

      if (!isControlled) {
        setInternalValue(normalized);
      }

      onValueChange?.(normalized, { startDate: dates.startDate, endDate: dates.endDate });
    };

    return (
      <div
        {...props}
        ref={ref}
        id={rootId}
        role="group"
        aria-label={label}
        className={cn(
          'p-date-range-picker',
          'p-date-range-picker--inline',
          fullWidth && 'p-date-range-picker--inline-full',
          trimWeeks && 'p-date-range-picker--inline-trim',
          className,
        )}
        data-month-count={monthCount}
      >
        <DateRangeCalendar
          id={`${rootId}-calendar`}
          layout={{ kind: 'columns', count: monthCount }}
          range={{ start: startDate, end: endDate }}
          today={today}
          minDate={toLocalDate(min)}
          maxDate={toLocalDate(max)}
          locale={locale}
          weekStartsOn={weekStartsOn}
          isDateDisabled={dateBlocker}
          disabledUnit={disabledUnit}
          initialMonth={toLocalDate(defaultMonth)}
          renderDayContent={renderDayContent}
          summaryUnit={summaryUnit}
          showEdges={showEdges}
          onRangeChange={handleRangeChange}
          autoFocus={false}
        />
        {showClear ? (
          <div className="p-date-range-picker__inline-footer">
            <PButton
              variant="ghost"
              size="sm"
              disabled={!startDate && !endDate}
              onClick={() => handleRangeChange({ start: null, end: null })}
            >
              Clear dates
            </PButton>
          </div>
        ) : null}
        <input type="hidden" name={nameStart} value={toIsoDate(startDate)} />
        <input type="hidden" name={nameEnd} value={toIsoDate(endDate)} />
      </div>
    );
  },
);

PDateRangeCalendar.displayName = 'PDateRangeCalendar';
