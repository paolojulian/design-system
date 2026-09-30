import { getDateLabel } from './dateRangeUtils';
import cn from '../../utils/cn';
import type { DayRange, RangeEdge } from './rangeSelection';
import type { PDateRangePickerSummaryUnit } from './types';

type DateRangeSummaryProps = {
  range: DayRange;
  unit: PDateRangePickerSummaryUnit;
  locale?: string;
  /** The edge the next click completes, if any; its field is highlighted. */
  nextEdge: RangeEdge | null;
};

const DAY_MS = 24 * 60 * 60 * 1000;

/** Whole calendar days between two local dates, immune to DST-length days. */
function getDayDifference(start: Date, end: Date) {
  const utcStart = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const utcEnd = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.round((utcEnd - utcStart) / DAY_MS);
}

function getRangeLength(range: DayRange, unit: PDateRangePickerSummaryUnit) {
  if (!range.start || !range.end) {
    return null;
  }

  const difference = getDayDifference(range.start, range.end);
  const count = unit === 'nights' ? difference : difference + 1;
  const noun = unit === 'nights' ? 'night' : 'day';

  return `${count} ${count === 1 ? noun : `${noun}s`}`;
}

const EDGE_LABELS: Record<PDateRangePickerSummaryUnit, Record<RangeEdge, string>> = {
  days: { start: 'Start date', end: 'End date' },
  nights: { start: 'Check-in', end: 'Check-out' },
};

/**
 * Selection status above the calendar: the range length, then one read-only
 * field per edge like Airbnb's Check-in / Check-out. The field the next click
 * completes is highlighted.
 */
export function DateRangeSummary({ range, unit, locale, nextEdge }: DateRangeSummaryProps) {
  const title = getRangeLength(range, unit) ?? (nextEdge === 'end' ? 'Select an end date' : 'Select a start date');

  return (
    <div className="p-date-range-picker__summary">
      <p className="p-date-range-picker__summary-title" aria-live="polite">
        {title}
      </p>
      <dl className="p-date-range-picker__edges">
        {(['start', 'end'] as const).map((edge) => {
          const date = range[edge];

          return (
            <div
              key={edge}
              className={cn('p-date-range-picker__edge', nextEdge === edge && 'p-date-range-picker__edge--active')}
            >
              <dt className="p-date-range-picker__edge-label">{EDGE_LABELS[unit][edge]}</dt>
              <dd
                className={cn('p-date-range-picker__edge-value', !date && 'p-date-range-picker__edge-value--empty')}
              >
                {date ? getDateLabel(date, locale) : 'Add date'}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
