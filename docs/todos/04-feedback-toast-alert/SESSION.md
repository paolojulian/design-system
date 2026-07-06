# Session — Feedback: Toast + Alert

## Context
Branch `feature/theming-infrastructure` (0 commits behind origin/main — no rebase needed).
Testing is Playwright-against-storybook (no vitest). Specs live in `tests/ui/*.spec.ts`
and hit `storybook-static` via `scripts/serve-storybook.mjs`, so **a `build:storybook`
is required before any spec run reflects new stories/components.**

## Done
- **PAlert** (`src/components/PAlert/`): 4 variants, optional title, dismiss, action.
  - Status colors map 1:1 to `--p-color-{info,success,warning,danger}` + `-surface`/`-border`.
    Added a shared `--p-feedback-*` token block in `theme.css`; variant classes switch only
    the status triplet. No new hues.
  - Added 4 status icons to `src/icons` (info/check/warning-triangle/exclamation-circle).
  - Role: `status` (polite) for info/success, `alert` (assertive) for warning/danger. Overridable.
  - Spec + stories: `tests/ui/feedback-toast-alert.spec.ts`, `PAlert.stories.tsx`. 10/10 pass.

## Dead ends / gotchas (axe)
- **Action link color:** a vivid status hue as link text fails WCAG AA on its own light tint
  (danger `#dc2626` on `#fef2f2` = 4.41:1; amber/warning is far worse ~2.9:1). Fixed by coloring
  the action link with `--p-feedback-text` (full-contrast) + underline — underline carries the
  affordance so color isn't the sole signal. Robust across all 4 variants, both themes.
- **Dark-theme story:** translucent 14% status surfaces composite over the *iframe body*, which the
  storybook `backgrounds` addon does NOT reliably paint dark during the static-build axe run →
  near-white text on a light-composited tint = contrast fail. Fixed by painting
  `background: var(--p-color-background)` on the story's own wrapper. Opaque-surface components
  (overlay/modal) don't hit this; tinted-surface components do.

## Next
- PToastProvider + queue (max 3 visible, auto-dismiss ≥5s, pause on hover/focus, danger no auto-dismiss).
- PToast component + imperative `toast.{success,error,info,warning}` API, portaled, aria-live.
- Mobile: bottom, full-width minus gutter, safe-area inset, swipe-to-dismiss.
