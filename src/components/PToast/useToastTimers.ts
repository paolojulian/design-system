import { useEffect, useRef } from 'react';
import { type PToastRecord } from './toastStore';

/**
 * Runs auto-dismiss timers for the visible toasts. Timers pause when `paused`
 * is set (hover/focus) and resume with the *remaining* time, so a toast is
 * never cut short by a hover. Toasts with `duration === null` never expire.
 */
export function useToastTimers(
  visible: PToastRecord[],
  paused: boolean,
  onExpire: (id: string) => void,
): void {
  const remaining = useRef(new Map<string, number>());
  const key = visible.map((toast) => `${toast.id}:${toast.duration ?? 'x'}`).join(',');

  useEffect(() => {
    const store = remaining.current;
    // Forget bookkeeping for toasts that are no longer visible.
    const liveIds = new Set(visible.map((toast) => toast.id));
    for (const id of store.keys()) {
      if (!liveIds.has(id)) store.delete(id);
    }

    if (paused) return undefined;

    const timers = visible
      .filter((toast) => toast.duration !== null)
      .map((toast) => {
        const ms = store.get(toast.id) ?? (toast.duration as number);
        const start = Date.now();
        const handle = window.setTimeout(() => onExpire(toast.id), ms);
        return { id: toast.id, handle, start, ms };
      });

    return () => {
      for (const { id, handle, start, ms } of timers) {
        window.clearTimeout(handle);
        store.set(id, Math.max(0, ms - (Date.now() - start)));
      }
    };
    // `key` captures the visible id/duration set; `visible` is read fresh inside.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, paused, onExpire]);
}
