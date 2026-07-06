import {
  useCallback,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import './PToast.css';
import { PToast } from './PToast';
import { useToastTimers } from './useToastTimers';
import { dismissToast, getSnapshot, subscribe } from './toastStore';

export type PToastProviderProps = {
  children?: ReactNode;
  /** Maximum number of toasts visible at once; the rest queue. */
  max?: number;
  /** Accessible label for the toast region landmark. */
  regionLabel?: string;
};

const EMPTY: ReturnType<typeof getSnapshot> = [];

export function PToastProvider({
  children,
  max = 3,
  regionLabel = 'Notifications',
}: PToastProviderProps) {
  const toasts = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
  const [paused, setPaused] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const visible = toasts.slice(0, max);
  const onExpire = useCallback((id: string) => dismissToast(id), []);
  useToastTimers(visible, paused, onExpire);

  const pause = useCallback(() => setPaused(true), []);
  const resume = useCallback(() => setPaused(false), []);

  return (
    <>
      {children}
      {mounted &&
        createPortal(
          <div
            className="p-toast-region"
            role="region"
            aria-label={regionLabel}
            aria-live="polite"
            aria-relevant="additions"
            onMouseEnter={pause}
            onMouseLeave={resume}
            onFocusCapture={pause}
            onBlurCapture={resume}
          >
            {visible.map((toast) => (
              <PToast key={toast.id} toast={toast} onDismiss={dismissToast} />
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}

PToastProvider.displayName = 'PToastProvider';
