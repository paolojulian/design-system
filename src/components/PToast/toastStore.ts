import { type ReactNode } from 'react';
import { type FeedbackVariant } from '../feedback/statusIcons';

export type PToastVariant = FeedbackVariant;

export type PToastAction = {
  label: ReactNode;
  onClick?: () => void;
};

/** Options accepted by the `toast.*` shorthand methods. */
export type PToastOptions = {
  /** Bold lead-in shown above the message. */
  title?: ReactNode;
  /**
   * Auto-dismiss delay in ms. `null` keeps the toast until dismissed.
   * Defaults to 5000ms, except `danger`, which defaults to `null`.
   */
  duration?: number | null;
  action?: PToastAction;
};

export type PToastInput = PToastOptions & {
  variant?: PToastVariant;
  /** Primary message line. */
  message?: ReactNode;
};

export type PToastRecord = {
  id: string;
  variant: PToastVariant;
  title?: ReactNode;
  message: ReactNode;
  duration: number | null;
  action?: PToastAction;
  createdAt: number;
};

/** Minimum auto-dismiss timing per the spec (>= 5s). */
export const DEFAULT_TOAST_DURATION = 5000;

let toasts: PToastRecord[] = [];
const listeners = new Set<() => void>();
let counter = 0;

function emit() {
  for (const listener of listeners) listener();
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSnapshot(): PToastRecord[] {
  return toasts;
}

function resolveDuration(variant: PToastVariant, duration: number | null | undefined): number | null {
  if (duration !== undefined) return duration;
  // Danger toasts do not auto-dismiss by default — the user must acknowledge them.
  return variant === 'danger' ? null : DEFAULT_TOAST_DURATION;
}

export function addToast(input: PToastInput): string {
  const variant = input.variant ?? 'info';
  counter += 1;
  const id = `p-toast-${counter}`;
  const record: PToastRecord = {
    id,
    variant,
    title: input.title,
    message: input.message,
    duration: resolveDuration(variant, input.duration),
    action: input.action,
    createdAt: Date.now(),
  };
  toasts = [...toasts, record];
  emit();
  return id;
}

export function dismissToast(id: string): void {
  const next = toasts.filter((toast) => toast.id !== id);
  if (next.length === toasts.length) return;
  toasts = next;
  emit();
}

export function clearToasts(): void {
  if (toasts.length === 0) return;
  toasts = [];
  emit();
}

type ToastMethod = (message: ReactNode, options?: PToastOptions) => string;

export type ToastApi = {
  (input: PToastInput): string;
  info: ToastMethod;
  success: ToastMethod;
  warning: ToastMethod;
  error: ToastMethod;
  dismiss: (id: string) => void;
  clear: () => void;
};

function method(variant: PToastVariant): ToastMethod {
  return (message, options) => addToast({ ...options, variant, message });
}

/**
 * Imperative toast API. Call from anywhere (event handlers, services) — the
 * mounted `PToastProvider` subscribes and renders. `error` maps to `danger`.
 */
export const toast: ToastApi = Object.assign(
  (input: PToastInput) => addToast(input),
  {
    info: method('info'),
    success: method('success'),
    warning: method('warning'),
    error: method('danger'),
    dismiss: dismissToast,
    clear: clearToasts,
  },
);
