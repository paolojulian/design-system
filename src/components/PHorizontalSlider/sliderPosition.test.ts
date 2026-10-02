import { describe, expect, it } from 'vitest';
import { nextIndex, scrollTargetFor, visibleIndex } from './sliderPosition';

// Eight 300px items with a 16px gap; three fit on screen, so the slider stops at item 5.
const targets = [0, 316, 632, 948, 1264, 1580, 1896, 2212];
const maxScroll = 1580;

describe('visibleIndex', () => {
  it('picks the item nearest the leading edge', () => {
    expect(visibleIndex({ scrollLeft: 0, maxScroll, targets })).toBe(0);
    expect(visibleIndex({ scrollLeft: 170, maxScroll, targets })).toBe(1);
    expect(visibleIndex({ scrollLeft: 632, maxScroll, targets })).toBe(2);
  });

  it('reports the last item once the slider cannot scroll further', () => {
    expect(visibleIndex({ scrollLeft: maxScroll, maxScroll, targets })).toBe(7);
  });

  it('handles items of different widths', () => {
    const mixed = [0, 516, 732, 1248];
    expect(visibleIndex({ scrollLeft: 600, maxScroll: 2000, targets: mixed })).toBe(1);
    expect(visibleIndex({ scrollLeft: 700, maxScroll: 2000, targets: mixed })).toBe(2);
  });

  it('returns 0 for an empty slider', () => {
    expect(visibleIndex({ scrollLeft: 100, maxScroll: 0, targets: [] })).toBe(0);
  });
});

describe('nextIndex', () => {
  it('steps one item from where the slider rests', () => {
    expect(nextIndex({ pending: null, scrollLeft: 316, maxScroll, targets, dir: 1 })).toBe(2);
    expect(nextIndex({ pending: null, scrollLeft: 316, maxScroll, targets, dir: -1 })).toBe(0);
  });

  it('steps from the pending target during a smooth scroll, so quick presses add up', () => {
    // Mid-animation the offset still reads as item 0; the pending target is item 1.
    expect(nextIndex({ pending: 1, scrollLeft: 120, maxScroll, targets, dir: 1 })).toBe(2);
  });

  it('does not queue targets past the end of the scroll range', () => {
    expect(nextIndex({ pending: 5, scrollLeft: 1500, maxScroll, targets, dir: 1 })).toBe(5);
  });

  it('steps back one position from the end, not from the last item', () => {
    // At the end the counter shows item 7, but the slider is resting on item 5's offset.
    expect(nextIndex({ pending: null, scrollLeft: maxScroll, maxScroll, targets, dir: -1 })).toBe(4);
  });

  it('stays inside the list', () => {
    expect(nextIndex({ pending: null, scrollLeft: 0, maxScroll, targets, dir: -1 })).toBe(0);
    expect(nextIndex({ pending: null, scrollLeft: 0, maxScroll: 0, targets: [], dir: 1 })).toBe(0);
  });
});

describe('scrollTargetFor', () => {
  it('clamps to the reachable scroll range', () => {
    expect(scrollTargetFor(7, { maxScroll, targets })).toBe(maxScroll);
    expect(scrollTargetFor(2, { maxScroll, targets })).toBe(632);
  });
});
