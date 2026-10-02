import { isSameDay } from './dateRangeUtils';

export type DayRange = {
  start: Date | null;
  end: Date | null;
};

function orderRange(a: Date, b: Date): DayRange {
  return a <= b ? { start: a, end: b } : { start: b, end: a };
}

/** The edge the next click completes, shown as the highlighted Start / End field. */
export type RangeEdge = 'start' | 'end';

export function getNextEdge(range: DayRange): RangeEdge | null {
  if (!range.start) {
    return 'start';
  }

  return range.end ? null : 'end';
}

/** Consumer rule for unavailable days (booked, holidays…). */
export type DateBlocker = (date: Date) => boolean;

/**
 * What a blocked date blocks. `day`: the whole day, so no range may include
 * it. `night`: the night that starts on it, as in a stay - the date can't
 * start or sit inside a range, but it can END one (a booking's first day is
 * the previous guest's checkout day).
 */
export type DateBlockerUnit = 'day' | 'night';

function addDay(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

/** The last date whose unit the range occupies: the end day, or the night before it. */
function lastOccupied(range: DayRange, unit: DateBlockerUnit) {
  const end = range.end ?? range.start!;
  return unit === 'night' && range.end ? addDay(end, -1) : end;
}

/** Whether the range occupies a blocked day (or, by night, a blocked night). */
export function spansBlockedDate(range: DayRange, isBlocked?: DateBlocker, unit: DateBlockerUnit = 'day') {
  if (!isBlocked || !range.start) {
    return false;
  }

  const last = lastOccupied(range, unit);
  for (let day = range.start; day <= last; day = addDay(day, 1)) {
    if (isBlocked(day)) {
      return true;
    }
  }

  return false;
}

/**
 * Whether `date` can end a range that starts at `range.start`, with no blocked
 * unit in between. Only meaningful by night, where a blocked date is still a
 * legal checkout: it reads `true` for the first blocked night after the start.
 */
export function canEndRangeOn(range: DayRange, date: Date, isBlocked?: DateBlocker, unit: DateBlockerUnit = 'day') {
  if (unit !== 'night' || !range.start || date <= range.start) {
    return false;
  }

  return !spansBlockedDate({ start: range.start, end: date }, isBlocked, unit);
}

/**
 * Whether a date is unavailable to the NEXT click, which is what the grid
 * hatches and marks `aria-disabled`. By day that is simply the blocker. By
 * night a blocked date is unavailable too, except while it would be a legal
 * end for the start already held - then it is offered as the checkout.
 */
export function isDateUnavailable(range: DayRange, date: Date, isBlocked?: DateBlocker, unit: DateBlockerUnit = 'day') {
  if (!isBlocked?.(date)) {
    return false;
  }

  return !canEndRangeOn(range, date, isBlocked, unit);
}

/**
 * Where a click lands the selection. Returns `null` when the click changes
 * nothing. A click before the start moves the start; any later click moves
 * the end:
 *
 * - Start only: another day completes the range (2 → 1 = 1–2). The start
 *   day again is ignored, so there is no zero-length range (as in Airbnb,
 *   whose minimum stay is one night).
 * - Before the start: extends the start (4–6, click 1 = 1–6).
 * - Inside the range: moves the end in (1–9, click 5 = 1–5).
 * - After the end: extends the end (4–6, click 8 = 4–8).
 * - The start or end day itself: ignored.
 *
 * With `isBlocked`: an unavailable day is ignored, and a range may not include
 * a blocked unit (as in Airbnb): a click that would span one starts a new
 * range at the clicked day instead. By night, the first blocked date after
 * the start is a legal end (see `isDateUnavailable`).
 */
export function getClickedRange(
  range: DayRange,
  date: Date,
  isBlocked?: DateBlocker,
  unit: DateBlockerUnit = 'day',
): DayRange | null {
  const start = range.start ?? range.end;
  const end = range.start ? range.end : null;

  if (isDateUnavailable(range, date, isBlocked, unit)) {
    return null;
  }

  if (!start) {
    return { start: date, end: null };
  }

  if (isSameDay(date, start) || isSameDay(date, end)) {
    return null;
  }

  const next = !end ? orderRange(start, date) : date < start ? { start: date, end } : { start, end: date };

  if (!spansBlockedDate(next, isBlocked, unit)) {
    return next;
  }

  // A fresh start on a blocked night is no start at all (its night is taken).
  return unit === 'night' && isBlocked?.(date) ? null : { start: date, end: null };
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

/**
 * The range a drag covers. With `isBlocked`, it stops at the last day it can
 * reach without occupying a blocked unit. By night a forward drag may land ON
 * the first blocked date (the checkout), and a backward one stops after it.
 */
export function getDragRange(anchor: Date, hover: Date, isBlocked?: DateBlocker, unit: DateBlockerUnit = 'day'): DayRange {
  if (!isBlocked) {
    return orderRange(anchor, hover);
  }

  const step = hover < anchor ? -1 : 1;
  // Dragging forward by night occupies the night BEFORE each day reached.
  const occupied = (day: Date) => (unit === 'night' && step > 0 ? addDay(day, -1) : day);
  let reach = anchor;
  for (let day = addDay(anchor, step); step > 0 ? day <= hover : day >= hover; day = addDay(day, step)) {
    if (isBlocked(occupied(day))) {
      break;
    }
    reach = day;
  }

  return orderRange(anchor, reach);
}
