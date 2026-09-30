import { useLayoutEffect, type RefObject } from 'react';
import { computeAnchoredPosition, type PPopoverPlacement } from './anchoredPosition';

type UseAnchoredPositionOptions = {
  enabled: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  floatingRef: RefObject<HTMLElement | null>;
  placement: PPopoverPlacement;
};

/**
 * Keeps a fixed-position element next to its anchor and inside the viewport.
 * Fixed, not absolute: the element never relies on page scroll to be seen, so
 * it works the same in scroll-locked modals. Writes straight to the element's
 * style, so scrolling and resizing never re-render React.
 */
export function useAnchoredPosition({ enabled, anchorRef, floatingRef, placement }: UseAnchoredPositionOptions) {
  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    const floating = floatingRef.current;

    if (!enabled || !anchor || !floating) {
      return;
    }

    const update = () => {
      // Measure the natural height, not one capped by a previous update.
      floating.style.maxHeight = '';
      const position = computeAnchoredPosition({
        anchor: anchor.getBoundingClientRect(),
        floating: { width: floating.offsetWidth, height: floating.offsetHeight },
        viewport: { width: document.documentElement.clientWidth, height: window.innerHeight },
        placement,
      });

      floating.style.top = `${position.top}px`;
      floating.style.left = `${position.left}px`;
      floating.style.maxHeight = position.maxHeight === undefined ? '' : `${position.maxHeight}px`;
      floating.dataset.placement = position.placement;
    };

    update();

    // Capture scrolls from any scrolling ancestor, not just the window.
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
