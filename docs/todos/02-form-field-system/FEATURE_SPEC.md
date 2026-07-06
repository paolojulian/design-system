# Form Field System

Goal: one shared field contract (label, hint, error, required) so every input renders forms the same way, instead of each component reinventing it.

## Components

- `PFormField` — wraps any control; renders label, optional hint, error message, required marker; wires ids/aria automatically via context.
- `PFormGrid` — responsive form layout: 1 column mobile, 2 columns tablet+, full-width rows opt-in per field.

## Rules

- Existing inputs (PTextInput, PTextArea, PSelect, PCombobox, PDatePicker, PDateRangePicker) adopt the contract: they read id/aria-describedby/invalid from PFormField context when present.
- Do not duplicate label/error markup inside each input once PFormField owns it — deprecate the per-component label props in docs, keep them working.
- Error text uses `--p-color-danger`; hint uses muted text token; spacing rhythm from the spacing scale.
- No layout shift when an error appears/disappears is NOT required — but field height must be stable across focus/hover/disabled.

## Responsive

- Mobile: single column, labels above inputs, full-width controls.
- Tablet: `PFormGrid` 2 columns; a field can span both.
- Touch: error/hint text stays readable at body-sm, never viewport-scaled.

## Accessibility

- Label always associated (`htmlFor`/id).
- Error announced via `aria-describedby` + `aria-invalid` on the control.
- Required communicated in text/aria, not only an asterisk color.

## Stories

Field with hint, with error, required, disabled control, long label + long error, full enterprise form example (realistic data), mobile viewport, dark theme.

## Tests

Playwright: aria wiring (label click focuses input, error id referenced), grid collapses to 1 column at mobile width, axe pass.
