/**
 * Ref-counted body scroll lock.
 *
 * Native `<dialog>.showModal()` does NOT prevent the page behind it from
 * scrolling, so overlays lock the body themselves. Locks are ref-counted so
 * that stacked overlays (e.g. a drawer opening a confirm modal) don't unlock
 * the body until the last one closes. Scrollbar width is compensated with
 * padding to avoid a layout shift when the scrollbar disappears.
 */
let lockCount = 0;
let previousOverflow = '';
let previousPaddingRight = '';

export function lockBodyScroll(): void {
  if (typeof document === 'undefined') {
    return;
  }

  if (lockCount === 0) {
    const { body } = document;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    previousOverflow = body.style.overflow;
    previousPaddingRight = body.style.paddingRight;

    body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      const currentPadding = Number.parseFloat(getComputedStyle(body).paddingRight) || 0;
      body.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
    }
  }

  lockCount += 1;
}

export function unlockBodyScroll(): void {
  if (typeof document === 'undefined' || lockCount === 0) {
    return;
  }

  lockCount -= 1;

  if (lockCount === 0) {
    document.body.style.overflow = previousOverflow;
    document.body.style.paddingRight = previousPaddingRight;
  }
}
