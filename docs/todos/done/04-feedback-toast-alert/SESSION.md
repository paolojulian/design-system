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

## Done — PToast (all remaining tasks)
- **Store** (`toastStore.ts`): module-level array + `useSyncExternalStore`; imperative
  `toast(input)` plus `toast.{info,success,warning,error,dismiss,clear}` (`error` → `danger`).
  `danger` defaults to `duration: null` (no auto-dismiss); others default 5000ms.
- **Provider** (`PToastProvider.tsx`): portals a `role=region` `aria-live=polite` landmark to
  `document.body`; shows first `max` (default 3), rest queue; pause on hover/focus via
  `onMouseEnter/Leave` + `onFocusCapture/BlurCapture`.
- **Timers** (`useToastTimers.ts`): per-toast setTimeout, pause banks *remaining* time so a
  hover never cuts a toast short; `duration===null` never expires.
- **PToast** (`PToast.tsx`): variant icon+accent (shared `feedback/statusIcons`), `role=alert`
  for warning/danger else `status`; pointer-based swipe-to-dismiss (64px threshold), skips
  drag when starting on a button/anchor.
- Mobile CSS: region flips to bottom, full-width minus gutter, `env(safe-area-inset-bottom)`,
  `column-reverse` so newest sits nearest the thumb.

## Dead end / gotcha (axe, this session)
- **Toast axe contrast flake:** `.p-toast__message` (muted `neutral-600 #57534e`) failed
  color-contrast intermittently — reported foreground `#7e7b77` is the muted text composited at
  ~0.77 opacity **mid `p-toast-in` fade-in**, not the settled color. Settled `#57534e` on
  `#fefefe` surface ≈ 7:1 (passes). Fix is in the *test helper*, not the component:
  `expectNoToastA11yViolations` now awaits `firstToast.getAnimations()[].finished` before
  running axe, so it asserts the settled state. Deterministic across `--repeat-each=3`.

## Result
- 18/18 in `tests/ui/feedback-toast-alert.spec.ts`; `tsc --noEmit` + `eslint .` clean.
- Exported from `src/components/index.ts`. Feature complete.
