# Session — Overlay Primitives

## Decision: native `<dialog>` + `showModal()` (Task 1)

Chosen over a portal + custom focus-trap util.

**Why.** `showModal()` gives us, for free and correctly:
- top layer (renders above everything, no `z-index` bookkeeping),
- focus trap (Tab cycles inside the dialog),
- focus restore to the trigger on close (native behavior),
- `::backdrop` pseudo-element for dimming,
- `cancel` event on Esc,
- implicit `aria-modal` semantics.

**Browser support check.** `<dialog>`/`showModal` is Baseline (Chrome 37+, Firefox 98+,
Safari 15.4+ — widely available since 2022). The CSS entry/exit animation relies on
`@starting-style` + `transition-behavior: allow-discrete` on the `overlay`/`display`
properties (Chrome 117+, Safari 17.5+, Firefox 129+ — Baseline 2024). Where those are
unsupported the overlay simply appears/disappears without the transition — no functional
loss. The package declares no legacy browser targets (React 18/19, no browserslist), so
this baseline is acceptable. No portal fallback was needed.

## What the shared layer owns (Task 2)

`src/components/overlay/` (internal, not exported at package root):
- `scrollLock.ts` — ref-counted body scroll lock with scrollbar-width compensation
  (native `showModal` does not lock background scroll).
- `OverlayDialog.tsx` — the single base component. Owns the `<dialog>` element, `showModal`/
  `close` lifecycle, Esc policy (via `onCancel`, `preventDefault` so React state always
  drives close), overlay-click policy (target === dialog element), scroll lock, aria
  wiring (`aria-labelledby`/`aria-describedby`), and the header/body/footer shell.
- `overlay.css` — all shared + per-variant styling in one place.

PModal / PDrawer / PSheet are thin variant wrappers over `OverlayDialog`.

## Deviations / tradeoffs

- **Motion tokens.** The spec mentions `--p-motion-*` tokens; the established system uses
  `--p-duration-*` and `--p-ease-*` (see `theme.css`). Followed the established names for
  cohesion instead of inventing a parallel `--p-motion-*` namespace. Added a semantic
  `--p-color-overlay` token (light + dark) plus `--p-overlay-*` component tokens.
- **PSheet drag.** The handle is a real, keyboard-focusable close button styled as a
  grabber bar; snap-to-content is achieved with `height: auto; max-height`. Full
  pointer-drag-to-dismiss physics were intentionally left out to keep the component robust
  and avoid fragile gesture code — the accessibility requirement (keyboard close) is met.
  Pointer-drag is a documented future enhancement.

## Production note (dead ends + what was measured)

- **The bug that cost the most: `display` origin precedence.** First pass styled
  `.p-overlay { display: flex }` unconditionally. Author-origin `display` beats the UA
  `dialog:not([open]) { display: none }` rule regardless of specificity, so the closed,
  full-viewport (transparent) dialog kept covering the page and Playwright saw it as
  `visible` — 7 interaction tests failed with "expected hidden, received visible." Fix:
  gate `display: flex` on `[open]` and keep `transition: display/overlay … allow-discrete`
  so the exit animation still plays. This is the load-bearing line of the whole feature.
- **Exit animation without JS timers.** Chose `@starting-style` + `allow-discrete` on
  `overlay`/`display` so `showModal()`/`close()` alone drive both directions — no
  setTimeout-to-defer-unmount. Tradeoff: needs Baseline-2024 CSS; older browsers just skip
  the transition (no functional loss).
- **axe flake was real, not spurious.** Mid-enter (`opacity < 1`) the muted description
  (`#57534e`) blended over white to ~`#7c7975` → 4.33:1, below AA. Not a token bug — tests
  now wait for `.p-overlay__surface` `opacity: 1` before axe/geometry asserts.
- **Scrollable body needed `tabindex=0`** (axe `scrollable-region-focusable`): a
  keyboard-only user otherwise can't scroll the modal body. Added it on `.p-overlay__body`.
- **Native focus trap parks on `<body>` at the wrap point** (observed via diagnostic:
  after the last control, one Tab lands on `document.body`, the next re-enters). It never
  reaches controls behind the scrim, so the trap holds — the test allows the transient
  `<body>` and asserts focus ends back inside.
- Body scroll lock is ref-counted (stacked overlays) with scrollbar-width padding
  compensation, since `showModal()` does not lock background scroll.
