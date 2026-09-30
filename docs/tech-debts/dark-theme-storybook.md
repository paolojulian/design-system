# Dark theme is defined but unverifiable in Storybook

> Found by /tech-debt audit on 2026-07-06. Severity: high · Effort: M

**Why this is debt:** `theme.css` ships a full `[data-theme='dark']` token block, but nothing in Storybook ever sets `data-theme`, so dark theme can't be reviewed, has zero stories (swiss-design.md §10 requires them), and Chromatic only snapshots light. Dark-theme regressions ship blind.

## Checklist

- [x] Add a theme global toolbar to `.storybook/preview.ts` (globalTypes `theme: light | dark`) with a decorator that sets `data-theme` on `document.documentElement`
- [x] Add a `Dark` story (or a dark mode via Chromatic `modes`) for the token-heavy components first: `PCard`, `PButton`, `PBadge`, `PTable`, `PTextInput` — covered by global `chromatic.modes` (every story snapshots in both themes; no per-component `Dark` stories needed)
- [x] Extend dark coverage to the remaining components with stories (`PCombobox`, `PSelect`, `PDatePicker`, `PDateRangePicker`, `PPagination`, `PHighlight`, `PSectionHeader`, `PTextArea`, `PTypography`, `PCardGrid`, `PHorizontalSlider`) — same global `modes` config covers all
- [x] Configure Chromatic to snapshot both themes (`chromatic: { modes: { light, dark } }` in preview parameters) so dark is visually regression-tested
- [x] Fix any dark-theme issues the new snapshots surface (file follow-ups per component; do not batch-fix blindly) — fixed `--p-control-bg-hover` (near-white flash on control hover) and `--p-table-bg-muted` (white fade at header bottom); left `--p-badge/-button-ping-shadow` hex to its own debt (`ping-shadow-hardcoded-hex.md`)
- [x] Verify: Storybook toolbar switches every component to dark without unstyled/illegible surfaces (Playwright `theme-toolbar.spec.ts` asserts `data-theme` and the background/control-hover tokens flip). Chromatic dark snapshots require an authenticated `test:visual` run in CI — config is in place; run it there to capture the baseline.

## Evidence

- `src/theme.css:203` — `[data-theme='dark'] { color-scheme: dark; … }` full token block
- `.storybook/preview.ts` — no globalTypes/decorator; only chromatic viewports and control matchers
- 16 `*.stories.tsx` files — zero dark-theme stories

## Update 2026-09-30

- The "zero dark-theme stories" evidence above is out of date: about ten components now have `Dark Theme` stories that use `globals: { theme: 'dark' }`.
- Those stories used to turn their whole docs page dark. A docs page renders every story in one iframe, and the theme decorator writes `data-theme` on the shared `<html>`. So the Dark story repainted every story on the page with dark tokens over the light docs canvas.
- Fixed in `.storybook/preview.ts`: in docs view mode the decorator follows the toolbar (`userGlobals.theme`), not the story's own globals.
- Tradeoff: on a docs page, a Dark Theme story now renders in the toolbar theme. Open it in story view to see it dark.
- Covered by `tests/ui/theme-toolbar.spec.ts`.
