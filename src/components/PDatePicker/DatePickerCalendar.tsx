import { useEffect, useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '../../icons';
import cn from '../../utils/cn';
import {
  addDays,
  addMonths,
  addMonthsClamped,
  clampVisibleMonth,
  getCalendarDays,
  getDayLabel,
  getFocusableDateInMonth,
  getMonthLabel,
  getMonthOptions,
  getWeekdayLabels,
  getYearOptions,
  isAfterDate,
  isBeforeDate,
  isMonthDisabled,
  isSameDay,
  startOfMonth,
  toIsoDate,
} from '../calendar/dateUtils';

type FocusableElement = { focus: () => void };

type DatePickerCalendarProps = {
  id: string;
  selectedDate: Date | null;
  today: Date;
  minDate: Date | null;
  maxDate: Date | null;
  locale?: string;
  weekStartsOn: number;
  onSelect: (date: Date) => void;
  /** Focus the active day on mount. On for popovers; off for inline calendars. */
  autoFocus?: boolean;
  /** Unavailable days: focusable (so the grid stays navigable) but not selectable. */
  isDateDisabled?: (date: Date) => boolean;
};

function getWeeks(days: Date[]) {
  return Array.from({ length: days.length / 7 }, (_, index) => days.slice(index * 7, index * 7 + 7));
}

/** One-month calendar. Mounted per open, so it starts on the selected date's month. */
export function DatePickerCalendar({
  id,
  selectedDate,
  today,
  minDate,
  maxDate,
  locale,
  weekStartsOn,
  onSelect,
  autoFocus = true,
  isDateDisabled,
}: DatePickerCalendarProps) {
  const initialDate = selectedDate ?? today;
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(initialDate));
  const [focusedDate, setFocusedDate] = useState(initialDate);
  const dayRefs = useRef<Record<string, FocusableElement | null>>({});
  // Focus the active day on open and after keyboard moves.
  const shouldFocusDateRef = useRef(autoFocus);
  const monthOptions = useMemo(() => getMonthOptions(locale), [locale]);
  const titleId = `${id}-title`;
  const previousMonth = addMonths(visibleMonth, -1);
  const nextMonth = addMonths(visibleMonth, 1);
  const isOutOfBounds = (date: Date) => isBeforeDate(date, minDate) || isAfterDate(date, maxDate);

  useEffect(() => {
    if (!shouldFocusDateRef.current) {
      return;
    }

    shouldFocusDateRef.current = false;
    const focus = () => dayRefs.current[toIsoDate(focusedDate)]?.focus();
    focus();
    // A sheet opens its dialog after this effect runs; retry once it is shown.
    const frame = requestAnimationFrame(focus);
    return () => cancelAnimationFrame(frame);
  }, [focusedDate, visibleMonth]);

  const updateVisibleMonth = (month: Date) => {
    const clampedMonth = clampVisibleMonth(month, minDate, maxDate);
    setVisibleMonth(clampedMonth);
    setFocusedDate(getFocusableDateInMonth(clampedMonth, focusedDate, minDate, maxDate));
  };

  const handleSelectChange = (part: 'month' | 'year') => (event: ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.currentTarget as unknown as { value: string };
    updateVisibleMonth(
      part === 'month'
        ? new Date(visibleMonth.getFullYear(), Number(value), 1)
        : new Date(Number(value), visibleMonth.getMonth(), 1),
    );
  };

  const handleDayClick = (date: Date) => {
    if (!isOutOfBounds(date) && !isDateDisabled?.(date)) {
      // Keeps the roving tab stop on the picked day when the calendar stays open (inline).
      setFocusedDate(date);
      onSelect(date);
    }
  };

  const handleDayKeyDown = (date: Date, event: KeyboardEvent<HTMLButtonElement>) => {
    const weekOffset = (date.getDay() - weekStartsOn + 7) % 7;
    const nextDate = (
      {
        ArrowLeft: addDays(date, -1),
        ArrowRight: addDays(date, 1),
        ArrowUp: addDays(date, -7),
        ArrowDown: addDays(date, 7),
        Home: addDays(date, -weekOffset),
        End: addDays(date, 6 - weekOffset),
        PageUp: addMonthsClamped(date, -1),
        PageDown: addMonthsClamped(date, 1),
      } as Record<string, Date>
    )[event.key];

    if (!nextDate) {
      return;
    }

    event.preventDefault();

    if (!isOutOfBounds(nextDate)) {
      shouldFocusDateRef.current = true;
      setFocusedDate(nextDate);
      setVisibleMonth(startOfMonth(nextDate));
    }
  };

  return (
    <div id={id} className="p-date-picker__calendar">
      <div className="p-date-picker__calendar-header">
        <button
          type="button"
          className="p-date-picker__nav"
          aria-label="Previous month"
          disabled={isMonthDisabled(previousMonth, minDate, maxDate)}
          onClick={() => updateVisibleMonth(previousMonth)}
        >
          <ChevronLeftIcon />
        </button>
        <div className="p-date-picker__month">
          <span id={titleId} className="p-date-picker__month-label">
            {getMonthLabel(visibleMonth, locale)}
          </span>
          <select
            className="p-date-picker__month-select p-date-picker__calendar-select"
            aria-label="Month"
            value={visibleMonth.getMonth()}
            onChange={handleSelectChange('month')}
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
            className="p-date-picker__year-select p-date-picker__calendar-select"
            aria-label="Year"
            value={visibleMonth.getFullYear()}
            onChange={handleSelectChange('year')}
          >
            {getYearOptions(visibleMonth, minDate, maxDate, today).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className="p-date-picker__nav"
          aria-label="Next month"
          disabled={isMonthDisabled(nextMonth, minDate, maxDate)}
          onClick={() => updateVisibleMonth(nextMonth)}
        >
          <ChevronRightIcon />
        </button>
      </div>

      <div className="p-date-picker__weekdays" aria-hidden="true">
        {getWeekdayLabels(weekStartsOn, locale).map((weekday) => (
          <span key={weekday}>{weekday}</span>
        ))}
      </div>

      <div className="p-date-picker__grid" role="grid" aria-labelledby={titleId}>
        {getWeeks(getCalendarDays(visibleMonth, weekStartsOn)).map((week) => (
          // Rows satisfy the grid pattern; `display: contents` keeps the 7-column layout.
          <div key={toIsoDate(week[0])} role="row" className="p-date-picker__week">
            {week.map((date) => {
              const isoDate = toIsoDate(date);
              const isSelected = isSameDay(date, selectedDate);

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
                    date.getMonth() !== visibleMonth.getMonth() && 'p-date-picker__day--outside',
                    isSameDay(date, today) && 'p-date-picker__day--today',
                    isSelected && 'p-date-picker__day--selected',
                    isDateDisabled?.(date) && 'p-date-picker__day--blocked',
                  )}
                  disabled={isOutOfBounds(date)}
                  aria-disabled={isDateDisabled?.(date) || undefined}
                  aria-label={getDayLabel(date, locale)}
                  aria-selected={isSelected}
                  tabIndex={isSameDay(date, focusedDate) ? 0 : -1}
                  onClick={() => handleDayClick(date)}
                  onKeyDown={(event) => handleDayKeyDown(date, event)}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
