import { expect, test } from '@playwright/test';
import { computeAnchoredPosition } from '../../src/components/PPopover/anchoredPosition';

// Pure positioning rules; no page needed.
const viewport = { width: 1000, height: 800 };
const anchor = { top: 100, left: 200, width: 300, height: 40 };
const floating = { width: 400, height: 300 };

test.describe('computeAnchoredPosition', () => {
  test('places below the anchor, aligned to its start edge', () => {
    expect(computeAnchoredPosition({ anchor, floating, viewport })).toEqual({
      top: 148,
      left: 200,
      placement: 'bottom-start',
      maxHeight: undefined,
    });
  });

  test('end alignment lines up the right edges', () => {
    const position = computeAnchoredPosition({ anchor, floating, viewport, placement: 'bottom-end' });
    expect(position.left).toBe(100);
  });

  test('flips above when there is no room below but room above', () => {
    const low = { ...anchor, top: 600 };
    expect(computeAnchoredPosition({ anchor: low, floating, viewport })).toMatchObject({
      top: 292,
      placement: 'top-start',
    });
  });

  test('flips below when top is preferred but there is no room above', () => {
    expect(computeAnchoredPosition({ anchor, floating, viewport, placement: 'top-start' })).toMatchObject({
      top: 148,
      placement: 'bottom-start',
    });
  });

  test('neither side fits: uses the roomier side and slides fully on screen (preventOverflow altAxis)', () => {
    const tall = { width: 400, height: 700 };
    const middle = { ...anchor, top: 380 };
    // Below: 800-420-16 = 364. Above: 380-16 = 364... tie keeps the preferred side.
    expect(computeAnchoredPosition({ anchor: middle, floating: tall, viewport })).toEqual({
      top: 92,
      left: 200,
      placement: 'bottom-start',
      maxHeight: undefined,
    });
    // More room above: flips, then slides down so nothing leaves the top edge.
    const low = { ...anchor, top: 600 };
    expect(computeAnchoredPosition({ anchor: low, floating: tall, viewport })).toEqual({
      top: 8,
      left: 200,
      placement: 'top-start',
      maxHeight: undefined,
    });
  });

  test('only an element taller than the viewport is capped', () => {
    const huge = { width: 400, height: 900 };
    expect(computeAnchoredPosition({ anchor, floating: huge, viewport })).toEqual({
      top: 8,
      left: 200,
      placement: 'bottom-start',
      maxHeight: 784,
    });
  });

  test('shifts left to stay inside the right viewport edge', () => {
    const right = { ...anchor, left: 800 };
    expect(computeAnchoredPosition({ anchor: right, floating, viewport }).left).toBe(592);
  });

  test('shifts right to stay inside the left viewport edge', () => {
    const left = { ...anchor, left: 50 };
    expect(computeAnchoredPosition({ anchor: left, floating, viewport, placement: 'bottom-end' }).left).toBe(8);
  });

  test('pins to the start padding when wider than the viewport', () => {
    const wide = { width: 1200, height: 300 };
    expect(computeAnchoredPosition({ anchor, floating: wide, viewport }).left).toBe(8);
  });
});
