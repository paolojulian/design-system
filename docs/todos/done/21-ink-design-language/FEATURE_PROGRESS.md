# Progress: Ink design language

Spec: FEATURE_SPEC.md · Design: FEATURE_DESIGN.md (read the design before
implementing — the spec is deliberately non-technical).
One phase per factory session. The factory completes the first phase with
unchecked tasks, checks tasks off as it commits them, and stops at the phase
boundary. Do not reorder phases or tasks.

## Phase 1: Ink theming
- [x] Check the prerequisite: Elle's phase 1 is committed (`git log --oneline | grep "feat(elle)"`). If not, stop and note it below. If `tests/ui/elle-helpers.ts` doesn't exist, move `gotoStory`/`resolveColors`/`PAIRS` out of `elle-theme.spec.ts` into it and reuse them there (Elle's suite stays green).
- [x] `src/theme-ink.css` exactly as in the design; `.storybook/preview.ts` `design` global gains `ink` and imports `theme-ink.css`. `tests/ui/ink-theme.spec.ts` with `expectInkApplied` and requirements 1, 5 and 7.
- [x] `Ink/Theme` stories (`src/ink/InkTheme.stories.tsx`, `InkTheme.css`: `Tokens`, `Components`); tests for requirements 2–4 on the static build. Screenshot light and dark at 1100px and 390px and look at them.
- [x] Ship it: `vite.config.ts` copies `dist/theme-ink.css`, `package.json` exports `./theme-ink.css` (requirement 8); README "Design languages" gains Ink; mark `docs/design-languages/ink.md` status as built. Full verification (requirement 9), restore `tsconfig.*.tsbuildinfo`, commit as `feat(ink): add Ink design language theming`.

## Notes

**2026-09-30: created from the planner app's design research** (`~/development/personal/planner/docs/design-direction.md`).
Once this ships, the planner should replace its local `:root` action/focus overrides and `.app` radius overrides with
`theme-ink.css` + `data-design="ink"` (its cards then also get Ink's flatter shadows).

Queue caveat: `scripts/run-todos.sh` runs folders in order, so this runs after 05–20. Run it directly with
`./scripts/dark-factory.sh docs/todos/21-ink-design-language` once Elle's phase 1 is committed.

**2026-09-30: built** (300/300 Playwright on the static build, 34/34 MCP, lint + tsc + lib build clean; `Ink/Theme`
screenshots reviewed light/dark at 1100px and 390px). Prerequisite met: Elle phase 1 was committed first
(`feat(elle): add Elle design language theming`); `tests/ui/elle-helpers.ts` already existed from Elle's phase 2.

Deviations from the design, and why:
- **Dark `PSwitch` tokens added to Ink's dark block** (`--p-switch-thumb`, `--p-switch-track-off`): the white thumb
  on the off-white ink track measured 1.09:1 and disappeared in the screenshot. Both tokens already exist in
  `theme.css`, so "no new tokens" still holds. Test: "the switch thumb stands out from its track".
- **One contrast pair exempted**: Pipz's own `text-subtle` on `surface-subtle` is 4.40:1 in light. Ink keeps
  Pipz's neutrals by design, so requirement 3 could not hold without changing them. The owner chose to exempt it in
  Ink and log it against Pipz: `docs/tech-debts/pipz-text-subtle-contrast.md`.
- **No duplicated doc page code**: `TokenValue` and the doc styles moved from `src/elle/` to `src/storybook/`
  (`TokenValue.tsx`, `design-language-doc.css`, classes `dl-doc*`) and both theme pages use them. `src/ink/InkTheme.css`
  holds only the shadow-swatch additions.
- The stylesheet-contract helpers (`readCss`, `declaredIn`) moved into `tests/ui/elle-helpers.ts` beside the others.
