# Command Palette

Goal: `PCommandPalette` — ⌘K quick navigation/actions, the modern enterprise power-user pattern. Depends on 03 (PModal/PSheet) and 09 (PEmptyState).

## Component

- `PCommandPalette` — search input + grouped result list; items as data (`{ id, label, group, icon, keywords, onSelect }`).
- Opens on ⌘K / Ctrl+K (provider-level hook) or controlled `open` prop.
- Simple ranked filter: label prefix > label substring > keyword match. No fuzzy-match dependency.
- Optional recent-items section (consumer supplies; component stays stateless about persistence).

## Rules

- Desktop: top-aligned modal (~560px), list max ~8 visible rows then scroll.
- No-results uses PEmptyState `no-results` variant.
- Row anatomy: icon, label, group hint right-aligned in muted text. Selected row = `--p-color-action-primary-subtle`.
- Keep it dependency-free like the rest of the package.

## Responsive

- Mobile: full-screen PSheet; search input autofocused, keyboard-safe (input pinned top, list scrolls under it); rows ≥44px.
- Tablet: desktop modal behavior.

## Accessibility

- `role="combobox"` input + `role="listbox"` results, `aria-activedescendant` for the highlighted row.
- Arrow keys move highlight, enter selects, esc closes and restores focus.
- Group labels are announced (`role="group"` + label).

## Stories

Default with realistic enterprise commands (navigation + actions), groups, recents, no results, mobile full-screen, dark theme.

## Tests

Playwright: ⌘K open/close, filter ranking, keyboard select fires onSelect, focus restore, full-screen at mobile width, axe pass.
