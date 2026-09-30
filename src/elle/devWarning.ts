/// <reference types="vite/client" />

/**
 * Logs invalid Elle component usage once per message, in development only.
 * Components never throw for misuse: they log, then render the safest fallback.
 */
const warned = new Set<string>();

export function devWarning(condition: boolean, message: string): void {
  if (!import.meta.env.DEV || !condition || warned.has(message)) return;
  warned.add(message);
  console.error(`[Elle] ${message}`);
}
