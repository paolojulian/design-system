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
 */
export function getClickedRange(range: DayRange, date: Date): DayRange | null {
  const start = range.start ?? range.end;
  const end = range.start ? range.end : null;

  if (!start) {
    return { start: date, end: null };
  }

  if (isSameDay(date, start) || isSameDay(date, end)) {
    return null;
  }

  if (!end) {
    return orderRange(start, date);
  }

  return date < start ? { start: date, end } : { start, end: date };
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
