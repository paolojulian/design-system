export type PPopoverPlacement = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';

export type Box = { top: number; left: number; width: number; height: number };
export type Size = { width: number; height: number };

export type AnchoredPositionInput = {
  /** The anchor's viewport rect (`getBoundingClientRect()`). */
  anchor: Box;
  /** The floating element's natural size. */
  floating: Size;
  viewport: Size;
  placement?: PPopoverPlacement;
  /** Gap between anchor and floating element. */
  offset?: number;
  /** Minimum distance kept from every viewport edge. */
  padding?: number;
};

export type AnchoredPosition = {
  top: number;
  left: number;
  /** The side actually used, after flipping. */
  placement: PPopoverPlacement;
  /** Set only when the element is taller than the viewport: the height it must scroll within. */
  maxHeight?: number;
};

/**
 * Places a floating element next to an anchor in viewport coordinates, like
 * Popper.js with `flip` and `preventOverflow` (including `altAxis`):
 *
 * - flip: the preferred side if it fits, else the opposite side if it fits,
 *   else the side with more room.
 * - preventOverflow: the element always stays inside the viewport (minus
 *   `padding`). When neither side fits it slides back on screen, overlapping
 *   the anchor if it must, instead of running off the edge. This matters in
 *   scroll-locked contexts such as modals, where the page cannot scroll to it.
 * - Only an element taller than the whole viewport gets `maxHeight`, and
 *   scrolls inside.
 */
export function computeAnchoredPosition({
  anchor,
  floating,
  viewport,
  placement = 'bottom-start',
  offset = 8,
  padding = 8,
}: AnchoredPositionInput): AnchoredPosition {
  const [preferredSide, align] = placement.split('-') as ['bottom' | 'top', 'start' | 'end'];
  const anchorBottom = anchor.top + anchor.height;
  const space = {
    bottom: viewport.height - anchorBottom - offset - padding,
    top: anchor.top - offset - padding,
  };
  const oppositeSide = preferredSide === 'bottom' ? 'top' : 'bottom';

  let side = preferredSide;
  if (floating.height > space[preferredSide]) {
    side =
      floating.height <= space[oppositeSide] || space[oppositeSide] > space[preferredSide]
        ? oppositeSide
        : preferredSide;
  }

  const available = viewport.height - 2 * padding;
  const maxHeight = floating.height > available ? Math.max(0, available) : undefined;
  const height = maxHeight ?? floating.height;
  const idealTop = side === 'bottom' ? anchorBottom + offset : anchor.top - offset - height;
  // Keep the whole element on screen (Popper's preventOverflow on the main axis).
  const top = Math.min(Math.max(idealTop, padding), viewport.height - padding - height);

  const preferredLeft = align === 'start' ? anchor.left : anchor.left + anchor.width - floating.width;
  const maxLeft = viewport.width - padding - floating.width;
  // Wider than the viewport allows: pin to the start edge; CSS caps the width.
  const left = maxLeft < padding ? padding : Math.min(Math.max(preferredLeft, padding), maxLeft);

  return { top, left, placement: `${side}-${align}`, maxHeight };
}
