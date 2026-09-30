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

/**
 * Where a click lands the selection, following Airbnb's `react-dates`
 * (`DayPickerRangeController#onDayClick`, calendar kept open, no minimum stay):
 *
 * - Picking the start: the click becomes the start. An end before it is
 *   cleared. Then the end is picked.
 * - Picking the end: a click on or after the start becomes the end and the
 *   end stays active, so later clicks move it. A click before the start
 *   becomes the new start and clears the end.
 */
export function getClickedRange(range: DayRange, date: Date, edge: RangeEdge): ClickResult {
  const { start, end } = range;

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
