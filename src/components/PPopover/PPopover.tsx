import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import cn from '../../utils/cn';
import { useMediaQuery } from '../../utils/useMediaQuery';
import { PSheet } from '../PSheet';
import type { PPopoverPlacement } from './anchoredPosition';
import { POPOVER_SHEET_QUERY } from './mediaQueries';
import { useAnchoredPosition } from './useAnchoredPosition';
import './PPopover.css';

export type PPopoverCloseReason = 'escape' | 'outside' | 'focus-out';

export type PPopoverProps = {
  /** Whether the popover is open. The consumer owns this state. */
  open: boolean;
  /**
   * Called on Escape, a press outside the popover and its anchor, or focus
   * moving outside both. Focus returns to `returnFocusRef` on Escape.
   */
  onClose: (reason: PPopoverCloseReason) => void;
  /** The element the popover is positioned against. Presses on it never close the popover. */
  anchorRef: RefObject<HTMLElement | null>;
  /** Receives focus on Escape. Defaults to `anchorRef`. */
  returnFocusRef?: RefObject<HTMLElement | null>;
  /** Accessible name. Visible as the sheet title on mobile; visually hidden in the popover. */
  title: ReactNode;
  /** Preferred side and alignment. Flips when the viewport is too short. Defaults to `bottom-start`. */
  placement?: PPopoverPlacement;
  /** Actions pinned under the content; the sheet keeps them reachable while the body scrolls. */
  footer?: ReactNode;
  /** On viewports up to the `sm` breakpoint, render as a bottom sheet (default) or keep the popover. */
  mobile?: 'sheet' | 'popover';
  id?: string;
  className?: string;
  children?: ReactNode;
};

function isInside(target: EventTarget | null, ...refs: Array<RefObject<HTMLElement | null> | undefined>) {
  return target instanceof Node && refs.some((ref) => ref?.current?.contains(target));
}

/**
 * Anchored, non-modal panel for pickers, filters, and help. Desktop renders in
 * the top layer (`popover="manual"`) so no ancestor's overflow or z-index can
 * clip it; dismissal is handled here so React state stays the source of truth.
 * Mobile renders a `PSheet` instead.
 */
export function PPopover({
  open,
  onClose,
  anchorRef,
  returnFocusRef,
  title,
  placement = 'bottom-start',
  footer,
  mobile = 'sheet',
  id,
  className,
  children,
}: PPopoverProps) {
  const isSheet = useMediaQuery(POPOVER_SHEET_QUERY) && mobile === 'sheet';
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = `${useId()}-title`;
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const isPopoverOpen = open && !isSheet;

  // Layout effect: the panel must be shown before children's effects move focus into it.
  useLayoutEffect(() => {
    const panel = panelRef.current;

    if (isPopoverOpen && panel && typeof panel.showPopover === 'function' && !panel.matches(':popover-open')) {
      panel.showPopover();
    }
  }, [isPopoverOpen]);

  useAnchoredPosition({ enabled: isPopoverOpen, anchorRef, floatingRef: panelRef, placement });

  useEffect(() => {
    if (!isPopoverOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!isInside(event.target, panelRef, anchorRef, returnFocusRef)) {
        onCloseRef.current('outside');
      }
    };

    document.addEventListener('pointerdown', handlePointerDown, true);
    return () => document.removeEventListener('pointerdown', handlePointerDown, true);
  }, [isPopoverOpen, anchorRef, returnFocusRef]);

  if (!open) {
    return null;
  }

  if (isSheet) {
    return (
      <PSheet open onClose={() => onClose('escape')} title={title} footer={footer} className={className}>
        <div id={id} className="p-popover__sheet-body">
          {children}
        </div>
      </PSheet>
    );
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      onClose('escape');
      (returnFocusRef ?? anchorRef).current?.focus();
    }
  };

  return (
    <div
      ref={panelRef}
      id={id}
      // Top layer without light dismiss; see the component doc comment.
      popover="manual"
      role="dialog"
      aria-labelledby={titleId}
      className={cn('p-popover', className)}
      onKeyDown={handleKeyDown}
      onBlur={(event) => {
        // A null relatedTarget is a click on non-focusable content, not a leave.
        if (event.relatedTarget && !isInside(event.relatedTarget, panelRef, anchorRef, returnFocusRef)) {
          onClose('focus-out');
        }
      }}
    >
      <span id={titleId} className="p-popover__title">
        {title}
      </span>
      <div className="p-popover__body">{children}</div>
      {footer ? <div className="p-popover__footer">{footer}</div> : null}
    </div>
  );
}

PPopover.displayName = 'PPopover';
