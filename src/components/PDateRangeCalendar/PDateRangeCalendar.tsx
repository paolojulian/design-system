import { forwardRef, useId, useMemo, useState, type HTMLAttributes } from 'react';
import { P_TOKEN_VALUES } from '../../constants/tokens';
import cn from '../../utils/cn';
import { useMediaQuery } from '../../utils/useMediaQuery';
import { PButton } from '../PButton';
import { DateRangeCalendar } from '../PDateRangePicker/DateRangeCalendar';
import { getRangeDates, getToday, normalizeRange, toIsoDate, toLocalDate } from '../PDateRangePicker/dateRangeUtils';
import type { DayRange } from '../PDateRangePicker/rangeSelection';
import type { PDateRangePickerSummaryUnit, PDateRangeValue } from '../PDateRangePicker/types';
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
  /** Months side by side from the `md` breakpoint. Defaults to 2; one month below it. */
  numberOfMonths?: 1 | 2;
  /** How the header counts a range: inclusive `days` (default) or `nights`. */
  summaryUnit?: PDateRangePickerSummaryUnit;
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
      numberOfMonths = 2,
      summaryUnit = 'days',
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
        className={cn('p-date-range-picker', 'p-date-range-picker--inline', className)}
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
          summaryUnit={summaryUnit}
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
