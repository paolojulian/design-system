# Session — Selection Controls

## Outcome

Implemented PCheckbox, PRadio + PRadioGroup, and PSwitch end-to-end: tokens,
components, stories (light + dark + mobile), package-root exports, and Playwright
tests. `tsc --noEmit`, `eslint .`, and the 33 new tests are green.

## Decisions & tradeoffs

- **Token layer**: added a shared `--p-selection-*` group plus switch-specific
  `--p-switch-*` tokens, mirroring how `PTextInput` maps `--p-control-*` →
  `--p-input-*`. Checked fill reuses `--p-color-action-primary`; the checkmark/dot
  uses `--p-color-text-inverse`, which contrasts in both themes (white mark on dark
  red in light, near-black mark on pink in dark). Only one dark override was needed:
  `--p-switch-track-off` (the light base token would read as a bright bar on dark).
- **Hit target**: the 44px touch target is delivered via `min-height` + block padding
  on the label row (`padding, not visual size`, per spec), so the visual box stays 20px.
- **Native-first**: real `<input type=checkbox/radio>`; switch = checkbox + `role="switch"`.
  Radio arrow-key nav is native (shared `name`), not rebuilt — the group only owns
  `name`/`value`/`onChange` via context; radios are dumb children. Chose a `<fieldset>`/
  `<legend>` + `role="radiogroup"` for the group name.
- **Accessible name hygiene**: description/error live *outside* the `<label>` and are
  wired via `aria-describedby`, so they don't pollute the control's accessible name.
  Alternative (everything inside the label) was rejected for that reason.

## Dead ends / failures hit

- **Switch click timed out in Playwright (30s actionability wait).** Root cause: the
  decorative track/thumb are siblings rendered *after* the transparent `<input>` in the
  DOM, so they painted on top and intercepted pointer events; the input was never the
  hit target. PCheckbox passed only by geometry luck. Fix: `z-index: 1` on all three
  hidden inputs so the transparent overlay is the top-most hit target (standard hidden-
  input pattern). Hover styles are keyed off `.__main:hover`, so this didn't regress them.
- **Story id mismatch**: used `--horizontal-layout` in a test; Storybook derives the id
  from the *export name* (`Horizontal` → `--horizontal`), not the display `name`.

## Out of scope — pre-existing branch failures

6 smoke tests fail independently of this work (verified by stashing my tracked edits and
re-running): `PSectionHeader` renders `—` while the test expects `-` (from commits
`81c8d78`/`f578862`), `PBadge` truncation width, and date-picker/typography checks.
Left untouched to avoid modifying unrelated features.
