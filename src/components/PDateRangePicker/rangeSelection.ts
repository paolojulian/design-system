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

function addDay(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

/** Whether any day from `start` to `end` (inclusive) is blocked. */
export function spansBlockedDate(range: DayRange, isBlocked?: DateBlocker) {
  if (!isBlocked || !range.start) {
    return false;
  }

  const end = range.end ?? range.start;
  for (let day = range.start; day <= end; day = addDay(day, 1)) {
    if (isBlocked(day)) {
      return true;
    }
  }

  return false;
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
 * With `isBlocked`: a blocked day is ignored, and a range may not include
 * one (as in Airbnb): a click that would span a blocked day starts a new
 * range at the clicked day instead.
 */
export function getClickedRange(range: DayRange, date: Date, isBlocked?: DateBlocker): DayRange | null {
  const start = range.start ?? range.end;
  const end = range.start ? range.end : null;

  if (isBlocked?.(date)) {
    return null;
  }

  if (!start) {
    return { start: date, end: null };
  }

  if (isSameDay(date, start) || isSameDay(date, end)) {
    return null;
  }

  const next = !end ? orderRange(start, date) : date < start ? { start: date, end } : { start, end: date };
  return spansBlockedDate(next, isBlocked) ? { start: date, end: null } : next;
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
 * The range a drag covers. With `isBlocked`, it stops at the last free day
 * before a blocked one, so a drag can never span an unavailable day.
 */
export function getDragRange(anchor: Date, hover: Date, isBlocked?: DateBlocker): DayRange {
  if (!isBlocked) {
    return orderRange(anchor, hover);
  }

  const step = hover < anchor ? -1 : 1;
  let reach = anchor;
  for (let day = addDay(anchor, step); step > 0 ? day <= hover : day >= hover; day = addDay(day, step)) {
    if (isBlocked(day)) {
      break;
    }
    reach = day;
  }

  return orderRange(anchor, reach);
}
