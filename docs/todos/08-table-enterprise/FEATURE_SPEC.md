# Enterprise Table

Goal: upgrade PTable from a display table to an enterprise data table: sorting, selection, sticky header, density, and a real mobile strategy.

## Additions to PTable

- Sortable columns — controlled `sort` + `onSortChange`; sorted header shows direction icon.
- Row selection — checkbox column (uses PCheckbox from 01), select-all with indeterminate, selected-count bar with bulk actions slot.
- Sticky header inside a scroll container.
- Density prop: `comfortable` (default) / `compact` — row height + padding from spacing tokens.
- Built-in states: `loading` (skeleton rows, no height jump), `empty` (PEmptyState slot), `error`.
- Pagination slot that composes existing PPagination with shared border rhythm.

## Rules

- Table stays presentational: sorting/selection are controlled from outside; no data fetching or client-side sort logic in the component.
- Keep existing PTable API working; new features are additive props.
- Selected row background = `--p-color-action-primary-subtle`; hover stays the existing hover token.
- Audit border language against PCard/PPagination after changes (cohesion contract).

## Responsive

- Two modes, chosen by prop:
  - `overflow` — horizontal scroll with sticky first column and visible scroll affordance.
  - `stack` — below md, rows become label/value stacked cards with the primary cell as the title; row actions become a PMenu.
- Never squeeze columns to fit mobile. Default = `overflow`.
- Tablet: full table, compact density recommended in docs.

## Accessibility

- Sort buttons in `th` with `aria-sort`.
- Select-all announces state; row checkboxes labeled by the row's primary cell.
- Stacked mode keeps a semantic list structure; scrollable container is keyboard-focusable (`tabindex=0` + label).

## Stories

Sortable + selectable with realistic enterprise data (50 rows), compact density, loading/empty/error, overflow mode with sticky column, stack mode at mobile viewport, dark theme.

## Tests

Playwright: sort callbacks + aria-sort, select-all/indeterminate, sticky header on scroll, stack mode at mobile width, no layout shift entering loading state, axe pass.
