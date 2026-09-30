import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import cn from '../../utils/cn';
import { PButton } from '../PButton';
import {
  addDays,
  addMonths,
  addMonthsClamped,
  clampVisibleMonth,
  getFocusableDateInMonth,
  isAfterDate,
  isBeforeDate,
  isMonthDisabled,
  startOfMonth,
  toIsoDate,
} from './dateRangeUtils';
import { DateRangeCalendarHeader } from './DateRangeCalendarHeader';
import { DateRangeMonth } from './DateRangeMonth';
import { DateRangeSummary } from './DateRangeSummary';
import { getClickedRange, violatesMinimumNights, type DayRange, type RangeEdge } from './rangeSelection';
import type { FocusableElement, PDateRangePickerSummaryUnit } from './types';
import { useDayRangeDrag } from './useDayRangeDrag';

/** Months side by side (popover) or a vertical stack that grows on demand (sheet). */
export type DateRangeCalendarLayout = { kind: 'columns'; count: 1 | 2 } | { kind: 'stack' };

type DateRangeCalendarProps = {
  id: string;
  layout: DateRangeCalendarLayout;
  range: DayRange;
  today: Date;
  minDate: Date | null;
  maxDate: Date | null;
  locale?: string;
  weekStartsOn: number;
  summaryUnit: PDateRangePickerSummaryUnit;
  onRangeChange: (range: DayRange) => void;
  /** Focus the active day on mount. On for popovers; off for inline calendars. */
  autoFocus?: boolean;
};

const STACK_BATCH = 12;

function monthIndex(date: Date) {
  return date.getFullYear() * 12 + date.getMonth();
}

export function DateRangeCalendar({
  id,
  layout,
  range,
  today,
  minDate,
  maxDate,
  locale,
  weekStartsOn,
  summaryUnit,
  onRangeChange,
  autoFocus = true,
}: DateRangeCalendarProps) {
  const initialDate = range.start ?? today;
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(initialDate));
  const [focusedDate, setFocusedDate] = useState(initialDate);
  const [stackCount, setStackCount] = useState(STACK_BATCH);
  // Opens on the start, like focusing Airbnb's Check-in field; on the end when only a start is set.
  const [edge, setEdge] = useState<RangeEdge>(range.start && !range.end ? 'end' : 'start');
  // Without a start (e.g. after Clear dates) the next click always sets it.
  const activeEdge: RangeEdge = range.start ? edge : 'start';
  // Stays need at least one night (Airbnb's default); a days range may be a single day.
  const minimumNights = summaryUnit === 'nights' ? 1 : 0;
  const dayRefs = useRef<Record<string, FocusableElement | null>>({});
  // Focus the active day on open and after keyboard moves, not after clicks.
  const shouldFocusDateRef = useRef(autoFocus);
  const isStacked = layout.kind === 'stack';
  const monthCount = isStacked ? stackCount : layout.count;
  const months = Array.from({ length: monthCount }, (_, index) => addMonths(visibleMonth, index)).filter(
    // The stack never renders months that are wholly past `max`.
    (month, index) => !isStacked || index === 0 || !isMonthDisabled(month, minDate, maxDate),
  );
  const { displayRange, previewRange, isDragging, gridProps } = useDayRangeDrag({
    range,
    activeEdge,
    minimumNights,
    // Touch drags would fight the sheet's vertical scroll; taps still select.
    allowTouchDrag: !isStacked,
    onCommit: (nextRange) => {
      if (nextRange.end) {
        setFocusedDate(nextRange.end);
      }
      setEdge('end');
      onRangeChange(nextRange);
    },
  });
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

  const updateVisibleMonth = (nextMonth: Date) => {
    const clampedMonth = clampVisibleMonth(nextMonth, minDate, maxDate);
    setVisibleMonth(clampedMonth);
    setFocusedDate(getFocusableDateInMonth(clampedMonth, focusedDate, minDate, maxDate));
  };

  /** Moves focus to a date, shifting the visible months only when it falls outside them. */
  const focusDate = (date: Date) => {
    const offset = monthIndex(date) - monthIndex(visibleMonth);

    if (offset < 0) {
      setVisibleMonth(startOfMonth(date));
    } else if (offset >= monthCount) {
      setVisibleMonth(addMonths(startOfMonth(date), -(monthCount - 1)));
    }

    shouldFocusDateRef.current = true;
    setFocusedDate(date);
  };

  const handleDayClick = (date: Date) => {
    if (!isOutOfBounds(date)) {
      const result = getClickedRange(range, date, activeEdge, minimumNights);
      setFocusedDate(date);

      if (!result) {
        return;
      }

      const { range: nextRange, nextEdge } = result;
      setEdge(nextEdge);
      onRangeChange(nextRange);
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

    if (nextDate) {
      event.preventDefault();

      if (!isOutOfBounds(nextDate)) {
        focusDate(nextDate);
      }
    }
  };

  return (
    <div id={id} className={cn('p-date-range-picker__calendar', isStacked && 'p-date-range-picker__calendar--stack')}>
      <DateRangeSummary
        range={displayRange}
        unit={summaryUnit}
        locale={locale}
        activeEdge={activeEdge}
        onEdgeChange={setEdge}
      />
      <DateRangeCalendarHeader
        visibleMonth={visibleMonth}
        monthCount={isStacked ? 1 : monthCount}
        minDate={minDate}
        maxDate={maxDate}
        today={today}
        locale={locale}
        onMonthChange={updateVisibleMonth}
      />
      <div
        className={cn(
          'p-date-range-picker__months',
          isDragging && 'p-date-range-picker__months--dragging',
          !isStacked && 'p-date-range-picker__months--touch-drag',
        )}
        data-month-count={isStacked ? undefined : monthCount}
        {...gridProps}
      >
        {months.map((month, index) => (
          <DateRangeMonth
            key={toIsoDate(month)}
            month={month}
            captionId={`${id}-month-${index}`}
            isCaptionHidden={monthCount === 1}
            today={today}
            locale={locale}
            weekStartsOn={weekStartsOn}
            range={displayRange}
            previewRange={previewRange}
            focusedDate={focusedDate}
            isOutOfBounds={isOutOfBounds}
            isTooShort={(date) => violatesMinimumNights(range, date, activeEdge, minimumNights)}
            dayRefs={dayRefs}
            onDayClick={handleDayClick}
            onDayKeyDown={handleDayKeyDown}
          />
        ))}
      </div>
      {isStacked && !isMonthDisabled(addMonths(visibleMonth, stackCount), minDate, maxDate) ? (
        <PButton variant="secondary" size="sm" fullWidth onClick={() => setStackCount((count) => count + STACK_BATCH)}>
          Show more months
        </PButton>
      ) : null}
    </div>
  );
}
