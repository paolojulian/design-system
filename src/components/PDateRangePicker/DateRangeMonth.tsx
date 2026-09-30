import type { KeyboardEvent, MutableRefObject } from 'react';
import cn from '../../utils/cn';
import { getCalendarDays, getDayLabel, getMonthLabel, getWeekdayLabels, isSameDay, toIsoDate } from './dateRangeUtils';
import type { DayRange } from './rangeSelection';
import type { FocusableElement } from './types';

type DateRangeMonthProps = {
  month: Date;
  captionId: string;
  /** Hide the caption visually when the header selects already name the month. */
  isCaptionHidden: boolean;
  today: Date;
  locale?: string;
  weekStartsOn: number;
  range: DayRange;
  previewRange: DayRange | null;
  focusedDate: Date;
  isOutOfBounds: (date: Date) => boolean;
  /** Days that can't end the range yet (minimum stay). Clicks are ignored; they stay focusable. */
  isTooShort: (date: Date) => boolean;
  dayRefs: MutableRefObject<Record<string, FocusableElement | null>>;
  onDayClick: (date: Date) => void;
  onDayKeyDown: (date: Date, event: KeyboardEvent<HTMLButtonElement>) => void;
};

function getWeeks(days: Date[]) {
  return Array.from({ length: days.length / 7 }, (_, index) => days.slice(index * 7, index * 7 + 7));
}

function isWithin(date: Date, range: DayRange | null) {
  return Boolean(range?.start && range.end && date >= range.start && date <= range.end);
}

function getDayClassName(date: Date, today: Date, range: DayRange, preview: DayRange | null) {
  const isStart = isSameDay(date, range.start);
  const isEnd = isSameDay(date, range.end);
  const isSpan = Boolean(range.start && range.end && !isSameDay(range.start, range.end));

  return cn(
    'p-date-range-picker__day',
    isSameDay(date, today) && 'p-date-range-picker__day--today',
    isWithin(date, range) && !isStart && !isEnd && 'p-date-range-picker__day--in-range',
    (isStart || isEnd) && 'p-date-range-picker__day--selected',
    isSpan && isStart && 'p-date-range-picker__day--range-start',
    isSpan && isEnd && 'p-date-range-picker__day--range-end',
    isWithin(date, preview) && !isWithin(date, range) && 'p-date-range-picker__day--preview',
  );
}

/**
 * One month of days. Days from neighboring months render as empty cells, so
 * with several months on screen every date appears exactly once.
 */
export function DateRangeMonth({
  month,
  captionId,
  isCaptionHidden,
  today,
  locale,
  weekStartsOn,
  range,
  previewRange,
  focusedDate,
  isOutOfBounds,
  isTooShort,
  dayRefs,
  onDayClick,
  onDayKeyDown,
}: DateRangeMonthProps) {
  return (
    <div className="p-date-range-picker__month-block">
      <div
        id={captionId}
        className={cn('p-date-range-picker__month-caption', isCaptionHidden && 'p-date-range-picker__sr-only')}
      >
        {getMonthLabel(month, locale)}
      </div>
      <div className="p-date-range-picker__weekdays" aria-hidden="true">
        {getWeekdayLabels(weekStartsOn, locale).map((weekday) => (
          <span key={weekday}>{weekday}</span>
        ))}
      </div>
      <div className="p-date-range-picker__grid" role="grid" aria-labelledby={captionId}>
        {getWeeks(getCalendarDays(month, weekStartsOn)).map((week) => (
          // Rows satisfy the grid pattern; `display: contents` keeps the 7-column layout.
          // A week wholly in the next month stays as blank space (constant height) but is not a row.
          <div
            key={toIsoDate(week[0])}
            role={week.some((date) => date.getMonth() === month.getMonth()) ? 'row' : undefined}
            className="p-date-range-picker__week"
          >
            {week.map((date) => {
              const isoDate = toIsoDate(date);

              if (date.getMonth() !== month.getMonth()) {
                return <span key={isoDate} className="p-date-range-picker__day-placeholder" aria-hidden="true" />;
              }

              const isEdge = isSameDay(date, range.start) || isSameDay(date, range.end);

              return (
                <button
                  key={isoDate}
                  ref={(node) => {
                    dayRefs.current[isoDate] = node as unknown as FocusableElement | null;
                  }}
                  type="button"
                  role="gridcell"
                  data-date={isoDate}
                  className={getDayClassName(date, today, range, previewRange)}
                  disabled={isOutOfBounds(date)}
                  aria-disabled={isTooShort(date) || undefined}
                  aria-label={getDayLabel(date, locale)}
                  aria-selected={isEdge}
                  tabIndex={isSameDay(date, focusedDate) ? 0 : -1}
                  onClick={() => onDayClick(date)}
                  onKeyDown={(event) => onDayKeyDown(date, event)}
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
