import { type PointerEvent as ReactPointerEvent, useRef, useState } from 'react';
import cn from '../../utils/cn';
import { CloseIcon } from '../../icons';
import { FEEDBACK_ICONS, FEEDBACK_ROLE } from '../feedback/statusIcons';
import { type PToastRecord } from './toastStore';

export type PToastProps = {
  toast: PToastRecord;
  onDismiss: (id: string) => void;
  /** Accessible name for the dismiss button. */
  dismissLabel?: string;
  /** Enables horizontal swipe-to-dismiss (used on touch/mobile). */
  swipeToDismiss?: boolean;
};

/** Horizontal travel (px) past which a swipe commits to dismissal. */
const SWIPE_THRESHOLD = 64;

export function PToast({
  toast,
  onDismiss,
  dismissLabel = 'Dismiss notification',
  swipeToDismiss = true,
}: PToastProps) {
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);

  const role = FEEDBACK_ROLE[toast.variant];

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!swipeToDismiss || event.button !== 0) return;
    // Don't hijack interactions with the action/dismiss controls.
    if ((event.target as HTMLElement).closest('button, a')) return;
    startX.current = event.clientX;
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    setDragX(event.clientX - startX.current);
  };

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (Math.abs(dragX) >= SWIPE_THRESHOLD) {
      onDismiss(toast.id);
      return;
    }
    setDragX(0);
  };

  const opacity =
    dragX === 0 ? undefined : Math.max(0, 1 - Math.abs(dragX) / (SWIPE_THRESHOLD * 3));

  return (
    <div
      role={role}
      className={cn('p-toast', `p-toast--${toast.variant}`, dragging && 'p-toast--dragging')}
      style={{ transform: dragX ? `translateX(${dragX}px)` : undefined, opacity }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <span className="p-toast__icon p-feedback-badge" aria-hidden="true">
        {FEEDBACK_ICONS[toast.variant]}
      </span>

      <div className="p-toast__body">
        {toast.title && <p className="p-toast__title">{toast.title}</p>}
        {toast.message && <div className="p-toast__message">{toast.message}</div>}
        {toast.action && (
          <button
            type="button"
            className="p-toast__action"
            onClick={() => {
              toast.action?.onClick?.();
              onDismiss(toast.id);
            }}
          >
            {toast.action.label}
          </button>
        )}
      </div>

      <button
        type="button"
        className="p-toast__dismiss"
        aria-label={dismissLabel}
        onClick={() => onDismiss(toast.id)}
      >
        <CloseIcon />
      </button>
    </div>
  );
}

PToast.displayName = 'PToast';
