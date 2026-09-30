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
};

/**
 * Places a floating element next to an anchor in viewport coordinates,
 * following Popper.js defaults:
 *
 * - flip: use the preferred side if it fits, else the opposite side if that
 *   fits, else stay on the preferred side.
 * - preventOverflow: shift along the cross axis only, to stay `padding` away
 *   from the viewport's left and right edges. Height is never capped; a
 *   popover taller than the space extends the page, which scrolls to it.
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

  const side =
    floating.height > space[preferredSide] && floating.height <= space[oppositeSide] ? oppositeSide : preferredSide;
  const top = side === 'bottom' ? anchorBottom + offset : anchor.top - offset - floating.height;

  const preferredLeft = align === 'start' ? anchor.left : anchor.left + anchor.width - floating.width;
  const maxLeft = viewport.width - padding - floating.width;
  // Wider than the viewport allows: pin to the start edge; CSS caps the width.
  const left = maxLeft < padding ? padding : Math.min(Math.max(preferredLeft, padding), maxLeft);

  return { top, left, placement: `${side}-${align}` };
}
