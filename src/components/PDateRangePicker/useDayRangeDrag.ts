import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { isSameDay, toLocalDate } from './dateRangeUtils';
import { getClickedRange, getDragAnchor, getDragRange, type DayRange, type RangeEdge } from './rangeSelection';

type DragState = {
  anchor: Date;
  origin: Date;
  hover: Date;
};

type UseDayRangeDragOptions = {
  range: DayRange;
  /** The edge a click would set, for the hover preview. */
  activeEdge: RangeEdge;
  minimumNights: number;
  /** When false, touch presses never start a drag, leaving the gesture to scrolling. */
  allowTouchDrag?: boolean;
  onCommit: (range: DayRange) => void;
};

/** Reads the enabled day button under a pointer event, if any. */
function getEventDay(target: EventTarget | null) {
  if (!(target instanceof Element)) {
    return null;
  }

  const day = target.closest<HTMLButtonElement>('[data-date]');

  return day && !day.disabled ? toLocalDate(day.dataset.date) : null;
}

/**
 * Drag-to-select and hover preview for the day grid.
 *
 * A drag commits on release only when it ended on a different day than it
 * started. A press and release on the same day is left to the button's own
 * click, so taps, mouse clicks, and keyboard activation share one path
 * (`getClickedRange`) and a click is never applied twice.
 */
export function useDayRangeDrag({
  range,
  activeEdge,
  minimumNights,
  allowTouchDrag = true,
  onCommit,
}: UseDayRangeDragOptions) {
  const [drag, setDrag] = useState<DragState | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const onCommitRef = useRef(onCommit);
  onCommitRef.current = onCommit;

  const updateDrag = (next: DragState | null) => {
    dragRef.current = next;
    setDrag(next);
  };

  useEffect(() => {
    if (!drag) {
      return;
    }

    // Listen on window: the pointer may be released outside the grid.
    const finish = (event: globalThis.PointerEvent) => {
      const current = dragRef.current;
      updateDrag(null);

      if (event.type === 'pointerup' && current && !isSameDay(current.hover, current.origin)) {
        onCommitRef.current(getDragRange(current.anchor, current.hover));
      }
    };

    window.addEventListener('pointerup', finish);
    window.addEventListener('pointercancel', finish);

    return () => {
      window.removeEventListener('pointerup', finish);
      window.removeEventListener('pointercancel', finish);
    };
    // Re-subscribe only when a drag starts or ends, not on every hover change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Boolean(drag)]);

  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    if (event.button !== 0 || (event.pointerType === 'touch' && !allowTouchDrag)) {
      return;
    }

    const day = getEventDay(event.target);

    if (!day) {
      return;
    }

    // Touch implicitly captures the pointer to the pressed day; release it so
    // move events target the day under the finger.
    if (event.target instanceof Element && event.target.hasPointerCapture(event.pointerId)) {
      event.target.releasePointerCapture(event.pointerId);
    }

    updateDrag({ anchor: getDragAnchor(range, day), origin: day, hover: day });
  };

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    const day = getEventDay(event.target);
    const current = dragRef.current;

    if (current) {
      if (day && !isSameDay(day, current.hover)) {
        updateDrag({ ...current, hover: day });
      }
      return;
    }

    if (event.pointerType === 'mouse' && !isSameDay(day, hoverDate)) {
      setHoverDate(day);
    }
  };

  const onPointerLeave = () => setHoverDate(null);

  const dragRange = drag ? getDragRange(drag.anchor, drag.hover) : null;
  const hoverRange =
    !drag && hoverDate ? (getClickedRange(range, hoverDate, activeEdge, minimumNights)?.range ?? null) : null;

  return {
    /** The range to render as selected: the live drag, else the value. */
    displayRange: dragRange ?? range,
    /** What a click on the hovered day would select, when it is a span. */
    previewRange: hoverRange?.end ? hoverRange : null,
    isDragging: Boolean(drag),
    gridProps: { onPointerDown, onPointerMove, onPointerLeave },
  };
}
