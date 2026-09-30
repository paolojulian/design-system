import { useLayoutEffect, type RefObject } from 'react';
import { computeAnchoredPosition, type PPopoverPlacement } from './anchoredPosition';

type UseAnchoredPositionOptions = {
  enabled: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  floatingRef: RefObject<HTMLElement | null>;
  placement: PPopoverPlacement;
};

/**
 * Keeps an absolutely positioned element next to its anchor, in document
 * coordinates like Popper's default `absolute` strategy: page scroll moves
 * both together, and an element taller than the viewport extends the page.
 * Writes straight to the element's style, so updates never re-render React.
 */
export function useAnchoredPosition({ enabled, anchorRef, floatingRef, placement }: UseAnchoredPositionOptions) {
  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    const floating = floatingRef.current;

    if (!enabled || !anchor || !floating) {
      return;
    }

    const update = () => {
      const position = computeAnchoredPosition({
        anchor: anchor.getBoundingClientRect(),
        floating: { width: floating.offsetWidth, height: floating.offsetHeight },
        viewport: { width: document.documentElement.clientWidth, height: window.innerHeight },
        placement,
      });

      floating.style.top = `${position.top + window.scrollY}px`;
      floating.style.left = `${position.left + window.scrollX}px`;
      floating.dataset.placement = position.placement;
    };

    update();

    // Page scroll needs no update; capture it anyway for scrolling ancestors, whose
    // scroll moves the anchor without moving the document.
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
    observer?.observe(anchor);
    observer?.observe(floating);

    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
      observer?.disconnect();
    };
  }, [enabled, anchorRef, floatingRef, placement]);
}
