# Time Picker

Goal: `PTimePicker` — completes the date/time set next to PDatePicker and PDateRangePicker.

## Component

- `PTimePicker` — text input with dropdown of time options; controlled `value` (HH:mm string) + `onChange`.
- Props: `step` (default 30 min), `min`/`max`, 12h/24h display (value stays 24h internally).
- Typing parses loose input ("9", "9:5 pm", "0930") to the nearest valid time; invalid → error state.
- Optional pairing helper with PDatePicker documented (datetime pattern), not a new component.

## Rules

- Visual frame, dropdown, and option styling identical to PSelect/PCombobox (`--p-control-*` tokens, same list surface).
- Follow existing PDatePicker file/API conventions — check its source first and mirror naming.
- Works inside PFormField (02).

## Responsive

- Mobile: dropdown becomes the same pattern PCombobox uses on mobile (match it; don't invent). Options ≥44px rows.
- Tablet/desktop: standard dropdown.

## Accessibility

- Combobox pattern: `role=combobox` + listbox, `aria-activedescendant`, arrow keys, home/end.
- Parsed value announced on blur correction (`aria-live` hint).
- Error state via `aria-invalid` + PFormField error text.

## Stories

Default, 12h vs 24h, step variants, min/max, typed parsing, error, disabled, in a form beside PDatePicker, mobile viewport, dark theme.

## Tests

Playwright: parsing table (unit-style via Playwright or story asserts), keyboard nav, min/max clamping, axe pass.
