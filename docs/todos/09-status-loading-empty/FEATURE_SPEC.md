# Status: Skeleton, Spinner, Empty State

Goal: standard loading and empty patterns so every product surface handles "no data yet" the same way.

## Components

- `PSkeleton` — text/line, rect, circle shapes; sized by the type/spacing scale so it matches what it replaces.
- `PSpinner` — sizes sm/md/lg; for inline and button loading; respects `prefers-reduced-motion` (fades instead of spins).
- `PEmptyState` — icon, title, description, primary action slot; variants: no-data, no-results (with clear-filters action), error, no-permission.

## Rules

- Skeleton color = `--p-color-surface-subtle` with a subtle pulse from motion tokens; no shimmer gradients.
- Skeletons must match the dimensions of the loaded content — no height jump on load.
- Empty state is quiet: muted icon, body text, one clear action. No illustration blobs.
- PButton gains/verifies a `loading` prop using PSpinner without resizing.

## Responsive

- PEmptyState: paddings tighten on mobile; action button full-width below sm.
- Spinner sizes unchanged across viewports.

## Accessibility

- Loading regions: `aria-busy` + visually hidden "Loading" text; skeletons `aria-hidden`.
- Empty-state action reachable and ≥44px on touch.

## Stories

Skeleton composition mimicking a card and a table row, spinner sizes, all four empty-state variants with realistic copy, button loading, mobile viewport, dark theme.

## Tests

Playwright: reduced-motion behavior, aria-busy present, no dimension change between skeleton and loaded story, axe pass.
