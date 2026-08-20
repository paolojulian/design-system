# Feedback: Toast + Alert

Goal: system-wide status communication — inline (PAlert) and transient (PToast).

## Components

- `PAlert` — inline banner; variants info/success/warning/danger; optional title, dismiss, action link.
- `PToast` + `PToastProvider` — imperative `toast()` API; queue (max 3 visible), auto-dismiss with timeout, pause on hover/focus.

## Rules

- Variants map 1:1 to existing semantic tokens (`--p-color-info/success/warning/danger` + their `-surface`/`-border` pairs). No new hues.
- Icon per variant from `src/icons`; icon communicates state alongside color, never color alone.
- Toast danger variant does not auto-dismiss by default.
- Provider renders in a portal; consumers get `toast.success/error/info/warning`.

## Responsive

- Desktop/tablet: toasts top-right, fixed width.
- Mobile: toasts bottom, full-width minus gutter, above safe-area inset; swipe-to-dismiss.
- PAlert: content wraps, action drops below text at narrow widths — no truncation.

## Accessibility

- Toast region `aria-live="polite"`; danger uses `assertive`.
- Dismiss buttons have accessible names.
- Auto-dismiss timing ≥ 5s; pauses on hover/focus.

## Stories

All variants for both, with/without title, with action, long message, stacked queue, mobile viewport, dark theme.

## Tests

Playwright: queue order + max, pause-on-hover, aria-live present, swipe dismiss at mobile width, axe pass.
