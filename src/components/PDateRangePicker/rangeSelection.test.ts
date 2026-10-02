import { describe, expect, it } from 'vitest';
import {
  canEndRangeOn,
  getClickedRange,
  getDragRange,
  isDateUnavailable,
  spansBlockedDate,
  type DayRange,
} from './rangeSelection';

const d = (day: number) => new Date(2026, 9, day); // October 2026
const iso = (date: Date | null) => (date ? `${date.getMonth() + 1}/${date.getDate()}` : null);
const show = (range: DayRange | null) => (range ? `${iso(range.start)}–${iso(range.end)}` : null);

// A stay occupies the nights of Oct 20, 21 and 22; Oct 23 is its checkout day.
const booked = new Set([20, 21, 22]);
const isBlocked = (date: Date) => booked.has(date.getDate());
const byDay = [isBlocked, 'day'] as const;
const byNight = [isBlocked, 'night'] as const;

describe('by day (the default)', () => {
  it('blocks the day for any role in a range', () => {
    expect(isDateUnavailable({ start: null, end: null }, d(20), ...byDay)).toBe(true);
    expect(isDateUnavailable({ start: d(17), end: null }, d(20), ...byDay)).toBe(true);
    expect(canEndRangeOn({ start: d(17), end: null }, d(20), ...byDay)).toBe(false);
  });

  it('restarts at the clicked day when the range would include a blocked day', () => {
    expect(show(getClickedRange({ start: d(17), end: null }, d(25), ...byDay))).toBe('10/25–null');
  });

  it('stops a drag at the last free day before a blocked one', () => {
    expect(show(getDragRange(d(17), d(25), ...byDay))).toBe('10/17–10/19');
  });
});

describe('by night', () => {
  it('blocks a booked night as a start', () => {
    expect(isDateUnavailable({ start: null, end: null }, d(20), ...byNight)).toBe(true);
    expect(getClickedRange({ start: null, end: null }, d(20), ...byNight)).toBeNull();
  });

  it('offers the first booked date as the checkout once a start is held', () => {
    const held = { start: d(17), end: null };
    expect(isDateUnavailable(held, d(20), ...byNight)).toBe(false);
    expect(isDateUnavailable(held, d(21), ...byNight)).toBe(true);
    expect(show(getClickedRange(held, d(20), ...byNight))).toBe('10/17–10/20');
  });

  it('leaves the checkout day of a stay free to start the next one', () => {
    expect(isDateUnavailable({ start: null, end: null }, d(23), ...byNight)).toBe(false);
    expect(show(getClickedRange({ start: null, end: null }, d(23), ...byNight))).toBe('10/23–null');
  });

  it('does not let a range cross the stay', () => {
    const held = { start: d(17), end: null };
    expect(spansBlockedDate({ start: d(17), end: d(20) }, ...byNight)).toBe(false);
    expect(spansBlockedDate({ start: d(17), end: d(21) }, ...byNight)).toBe(true);
    // A free day past the stay restarts the range there, as by day.
    expect(show(getClickedRange(held, d(25), ...byNight))).toBe('10/25–null');
    // A booked date past it is nothing: it can neither end this range nor start one.
    expect(getClickedRange(held, d(21), ...byNight)).toBeNull();
  });

  it('moves the start back only over free nights', () => {
    const held = { start: d(25), end: d(27) };
    expect(show(getClickedRange(held, d(23), ...byNight))).toBe('10/23–10/27');
    // Oct 22's night is taken: that click starts over on a free day.
    expect(show(getClickedRange(held, d(19), ...byNight))).toBe('10/19–null');
  });

  it('drags forward onto the checkout day and no further', () => {
    expect(show(getDragRange(d(17), d(20), ...byNight))).toBe('10/17–10/20');
    expect(show(getDragRange(d(17), d(25), ...byNight))).toBe('10/17–10/20');
  });

  it('drags backward to the day after the stay and no further', () => {
    expect(show(getDragRange(d(27), d(23), ...byNight))).toBe('10/23–10/27');
    expect(show(getDragRange(d(27), d(18), ...byNight))).toBe('10/23–10/27');
  });

  it('never lets the clicked range occupy a booked night', () => {
    // Every start/click pair over the month: a non-null result must be free.
    for (let s = 1; s <= 31; s += 1) {
      for (let c = 1; c <= 31; c += 1) {
        const held = { start: d(s), end: null };
        const next = getClickedRange(held, d(c), ...byNight);
        if (next) {
          expect(spansBlockedDate(next, ...byNight)).toBe(false);
        }
      }
    }
  });
});
