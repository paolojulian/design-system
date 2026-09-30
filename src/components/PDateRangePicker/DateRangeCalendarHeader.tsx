import { useMemo, type ChangeEvent } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '../../icons';
import {
  addMonths,
  getMonthOptions,
  getYearOptions,
  isMonthDisabled,
} from './dateRangeUtils';

type DateRangeCalendarHeaderProps = {
  /** The first visible month; the selects and arrows move it. */
  visibleMonth: Date;
  /** Months on screen, so "Next" disables when the last one reaches the bound. */
  monthCount: number;
  minDate: Date | null;
  maxDate: Date | null;
  today: Date;
  locale?: string;
  onMonthChange: (month: Date) => void;
};

export function DateRangeCalendarHeader({
  visibleMonth,
  monthCount,
  minDate,
  maxDate,
  today,
  locale,
  onMonthChange,
}: DateRangeCalendarHeaderProps) {
  const monthOptions = useMemo(() => getMonthOptions(locale), [locale]);
  const yearOptions = getYearOptions(visibleMonth, minDate, maxDate, today);
  const previousMonth = addMonths(visibleMonth, -1);
  const nextMonth = addMonths(visibleMonth, 1);
  const monthAfterLast = addMonths(visibleMonth, monthCount);

  const handleMonthChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.currentTarget as unknown as { value: string };
    onMonthChange(new Date(visibleMonth.getFullYear(), Number(value), 1));
  };

  const handleYearChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.currentTarget as unknown as { value: string };
    onMonthChange(new Date(Number(value), visibleMonth.getMonth(), 1));
  };

  return (
    <div className="p-date-range-picker__calendar-header">
      <button
        type="button"
        className="p-date-range-picker__nav"
        aria-label="Previous month"
        disabled={isMonthDisabled(previousMonth, minDate, maxDate)}
        onClick={() => onMonthChange(previousMonth)}
      >
        <ChevronLeftIcon />
      </button>
      <div className="p-date-range-picker__month">
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
        disabled={isMonthDisabled(monthAfterLast, minDate, maxDate)}
        onClick={() => onMonthChange(nextMonth)}
      >
        <ChevronRightIcon />
      </button>
    </div>
  );
}
