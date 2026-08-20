# Selection Controls

Goal: add the missing form primitives — PCheckbox, PRadio, PSwitch — matching the existing `--p-control-*` token language.

## Components

- `PCheckbox` — label, checked, indeterminate, disabled, error, description.
- `PRadio` + `PRadioGroup` — group owns name/value/onChange; radios are dumb children.
- `PSwitch` — on/off with label; for instant-effect settings only (checkbox = needs submit).

## Rules

- Files follow the existing pattern: `src/components/PCheckbox/{PCheckbox.tsx,PCheckbox.css,PCheckbox.stories.tsx,index.ts}`.
- Native inputs (`input type=checkbox/radio`, switch = checkbox + `role="switch"`). No div-buttons.
- Reuse semantic tokens: `--p-color-action-primary` for checked, `--p-color-border` default, shared focus ring tokens. New component tokens go in `theme.css`, both themes.
- Export from the package root like the other components.

## Responsive

- Touch target ≥ 44px on all viewports (padding, not visual size).
- Label is part of the hit area.
- Stacked group layout is the default; horizontal is an opt-in prop.

## Accessibility

- Real label elements, `aria-describedby` for description/error.
- `PRadioGroup` uses `role="radiogroup"` + arrow-key movement (native behavior — verify, don't rebuild).
- Error state uses `aria-invalid`, not color alone.

## Stories

Default, checked, indeterminate (checkbox), disabled, error, with long label, group layouts, dark theme, mobile viewport.

## Tests

Playwright: toggle by click and keyboard, group arrow-key nav, axe pass on all stories.
