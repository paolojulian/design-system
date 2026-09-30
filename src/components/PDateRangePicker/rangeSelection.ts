import { isSameDay } from './dateRangeUtils';

export type DayRange = {
  start: Date | null;
  end: Date | null;
};

function orderRange(a: Date, b: Date): DayRange {
  return a <= b ? { start: a, end: b } : { start: b, end: a };
}

/** Which end of the range the next click sets (Airbnb's focused Check-in / Check-out field). */
export type RangeEdge = 'start' | 'end';

export type ClickResult = {
  range: DayRange;
  nextEdge: RangeEdge;
};

const DAY_MS = 24 * 60 * 60 * 1000;

/** Whole days from `a` to `b`, immune to DST-length days. */
function dayDifference(a: Date, b: Date) {
  return Math.round(
    (Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) - Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) /
      DAY_MS,
  );
}

/**
 * Whether a day is blocked as an end because the stay would be too short.
 * Mirrors react-dates `doesNotMeetMinimumNights`: only while picking the end,
 * for days on or after the start but fewer than `minimumNights` after it.
 */
export function violatesMinimumNights(range: DayRange, date: Date, edge: RangeEdge, minimumNights: number) {
  if (edge !== 'end' || !range.start || minimumNights <= 0) {
    return false;
  }

  const difference = dayDifference(range.start, date);
  return difference >= 0 && difference < minimumNights;
}

/**
 * Where a click lands the selection, following Airbnb's `react-dates`
 * (`DayPickerRangeController#onDayClick`, calendar kept open). Returns `null`
 * for a click Airbnb ignores: a day that would break `minimumNights` (with
 * nights, picking the check-in day again as the check-out does nothing).
 *
 * - Picking the start: the click becomes the start. An end before it is
 *   cleared. Then the end is picked.
 * - Picking the end: a click on or after the start becomes the end and the
 *   end stays active, so later clicks move it. A click before the start
 *   becomes the new start and clears the end.
 */
export function getClickedRange(
  range: DayRange,
  date: Date,
  edge: RangeEdge,
  minimumNights = 0,
): ClickResult | null {
  const { start, end } = range;

  if (violatesMinimumNights(range, date, edge, minimumNights)) {
    return null;
  }

  if (edge === 'start' || !start) {
    return { range: { start: date, end: end && date > end ? null : end }, nextEdge: 'end' };
  }

  if (date >= start) {
    return { range: { start, end: date }, nextEdge: 'end' };
  }

  return { range: { start: date, end: null }, nextEdge: 'end' };
}

/**
 * The fixed end of a drag. Pressing an edge of a complete range drags that
 * edge while the opposite edge stays put; pressing anywhere else starts a new
 * range from the pressed date.
 */
export function getDragAnchor(range: DayRange, pressed: Date): Date {
  const { start, end } = range;

  if (start && end && !isSameDay(start, end)) {
    if (isSameDay(pressed, start)) {
      return end;
    }

    if (isSameDay(pressed, end)) {
      return start;
    }
  }

  return pressed;
}

export function getDragRange(anchor: Date, hover: Date): DayRange {
  return orderRange(anchor, hover);
}
