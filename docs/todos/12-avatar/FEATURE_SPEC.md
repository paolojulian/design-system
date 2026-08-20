# Avatar

Goal: `PAvatar` + `PAvatarGroup` — user identity in tables, nav, comments, and assignment controls.

## Components

- `PAvatar` — image with initials fallback (auto from name), sizes xs/sm/md/lg, optional status dot (online/away/offline).
- `PAvatarGroup` — overlapping row, max count with `+N` overflow chip.

## Rules

- Fallback background: deterministic pick from a small neutral-plus-brand token set (same name → same color); text uses caption type tokens.
- Circle shape only; border = `--p-color-surface` ring in groups so overlaps read cleanly.
- Status dot uses semantic status tokens and is never the only indicator (pair with text where it matters).
- Broken image falls back to initials, no broken-image icon.

## Responsive

- Sizes are fixed per token, not viewport-scaled.
- In groups on mobile, default max drops (e.g. 5 → 3) via prop, documented.

## Accessibility

- Image `alt` = person's name; initials fallback gets `aria-label`.
- `+N` chip has an accessible name ("and 4 more").
- Status dot has visually hidden text when rendered.

## Stories

Sizes, image vs initials, status dots, group with overflow, long names, table usage example, mobile viewport, dark theme.

## Tests

Playwright: fallback on broken image, deterministic initials color, group overflow count, axe pass.
