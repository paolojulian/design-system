# Tag Input

Goal: `PTagInput` — multi-value entry (emails, labels, filters) as removable chips. Builds on PCombobox patterns and the form-field contract (02).

## Component

- `PTagInput` — controlled `value: string[]` + `onChange`; free text entry committed on Enter/comma/blur.
- Optional suggestions list (PCombobox-style) for constrained values.
- Per-tag remove button; backspace on empty input removes last tag.
- Optional `validateTag` (e.g. email) — invalid tags render in danger style, reported via callback.
- Max tags prop with count hint.

## Rules

- Chip style: `--p-color-surface-subtle` background, `--p-radius-sm`, caption/body-sm type — align with PBadge language, don't invent a new chip look.
- Field frame reuses `--p-control-*` tokens so it matches PTextInput/PCombobox exactly.
- Works inside PFormField (label/hint/error wiring from context).

## Responsive

- Chips wrap to multiple lines; field grows, surrounding layout must tolerate it (document).
- Touch: remove targets ≥ 44px hit area (padding, not visual size); suggestions behave like PCombobox on mobile.

## Accessibility

- Input labeled via PFormField; chips are a labeled list.
- Remove buttons named ("Remove {tag}").
- Arrow keys move between chips; delete/backspace removes focused chip.
- Invalid tag communicated in text, not color alone.

## Stories

Empty, with tags, wrapping many tags, suggestions, invalid tags, max reached, disabled, inside a form, mobile viewport, dark theme.

## Tests

Playwright: enter/comma/blur commit, backspace removal, chip keyboard nav, validate flow, axe pass.
