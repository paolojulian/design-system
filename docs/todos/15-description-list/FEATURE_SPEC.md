# Description List

Goal: `PDescriptionList` — key/value detail views (order details, user profiles, audit records). The read-only counterpart of a form.

## Component

- `PDescriptionList` — items as data (`{ label, value, span? }`) or composable `PDescriptionList.Item`.
- Layouts: `stacked` (label above value) and `horizontal` (label column left, aligned).
- Value slot accepts nodes (PBadge status, PAvatar, links, copyable text).
- Optional per-item empty placeholder ("—") for missing values.

## Rules

- Semantic `dl/dt/dd`.
- Labels: muted text token, body-sm; values: `--p-color-text`, body-md. Same rhythm as PFormField labels so detail and edit views mirror each other.
- Horizontal layout aligns all labels on one shared axis (grid, fixed label column) — no per-row eyeballing.
- Row separation by whitespace first; `--p-color-border-subtle` divider is an opt-in prop.

## Responsive

- Mobile: horizontal collapses to stacked automatically below sm.
- Tablet+: horizontal keeps two-column grid; long values wrap, never truncate by default (truncate = opt-in with title).

## Accessibility

- `dl` semantics carry it; ensure custom value nodes keep readable text.
- Copy buttons (if used in value slot) have accessible names.

## Stories

Stacked, horizontal, mixed value nodes (badge/avatar/link), missing values, long values wrapping, with dividers, detail-page example with realistic data, mobile viewport, dark theme.

## Tests

Playwright: dl/dt/dd structure, horizontal → stacked collapse at mobile width, axe pass.
