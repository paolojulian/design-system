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

  test('stays on the preferred side, uncapped, when neither side fits (Popper flip)', () => {
    const tall = { width: 400, height: 900 };
    const nearBottom = { ...anchor, top: 500 };
    expect(computeAnchoredPosition({ anchor: nearBottom, floating: tall, viewport })).toEqual({
      top: 548,
      left: 200,
      placement: 'bottom-start',
    });
    // Preferring top keeps top, extending above the viewport like Popper does.
    expect(computeAnchoredPosition({ anchor: nearBottom, floating: tall, viewport, placement: 'top-start' })).toEqual({
      top: -408,
      left: 200,
      placement: 'top-start',
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
