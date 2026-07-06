# Dark theme is defined but unverifiable in Storybook

> Found by /tech-debt audit on 2026-07-06. Severity: high · Effort: M

**Why this is debt:** `theme.css` ships a full `[data-theme='dark']` token block, but nothing in Storybook ever sets `data-theme`, so dark theme can't be reviewed, has zero stories (swiss-design.md §10 requires them), and Chromatic only snapshots light. Dark-theme regressions ship blind.

## Checklist

- [ ] Add a theme global toolbar to `.storybook/preview.ts` (globalTypes `theme: light | dark`) with a decorator that sets `data-theme` on `document.documentElement`
- [ ] Add a `Dark` story (or a dark mode via Chromatic `modes`) for the token-heavy components first: `PCard`, `PButton`, `PBadge`, `PTable`, `PTextInput`
- [ ] Extend dark coverage to the remaining components with stories (`PCombobox`, `PSelect`, `PDatePicker`, `PDateRangePicker`, `PPagination`, `PHighlight`, `PSectionHeader`, `PTextArea`, `PTypography`, `PCardGrid`, `PHorizontalSlider`)
- [ ] Configure Chromatic to snapshot both themes (e.g. `chromatic: { modes: { light, dark } }` in preview parameters) so dark is visually regression-tested
- [ ] Fix any dark-theme issues the new snapshots surface (file follow-ups per component; do not batch-fix blindly)
- [ ] Verify: Storybook toolbar switches every component to dark without unstyled/illegible surfaces, and a Chromatic build shows dark snapshots

## Evidence

- `src/theme.css:203` — `[data-theme='dark'] { color-scheme: dark; … }` full token block
- `.storybook/preview.ts` — no globalTypes/decorator; only chromatic viewports and control matchers
- 16 `*.stories.tsx` files — zero dark-theme stories
