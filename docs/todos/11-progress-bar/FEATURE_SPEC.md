# Progress Bar

Goal: `PProgressBar` — determinate progress for uploads, imports, and long jobs. Complements the indeterminate PSpinner (09).

## Component

- `PProgressBar` — value 0–100, optional label + value text, sizes sm/md.
- Variants: default (action primary), success, danger (failed job).
- Optional indeterminate mode for unknown duration (reuses the same bar, animated).

## Rules

- Track = `--p-color-surface-subtle`; fill = `--p-color-action-primary`; status variants use semantic status tokens.
- Height from spacing scale; no rounded-pill styling beyond `--p-radius-sm`.
- Value changes animate with motion tokens; `prefers-reduced-motion` jumps instantly.
- Label + percentage aligned on one axis above the bar; both optional.

## Responsive

- Full-width by default; identical at all viewports.
- Value text stays outside the bar so it never clips at small widths.

## Accessibility

- `role="progressbar"` + `aria-valuenow/min/max`, `aria-label` or labelledby.
- Indeterminate omits `aria-valuenow`.

## Stories

Sizes, with label + value, success/danger, indeterminate, animating value, mobile viewport, dark theme.

## Tests

Playwright: aria values track prop, reduced-motion behavior, axe pass.
