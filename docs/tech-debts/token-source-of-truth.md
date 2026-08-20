# Token values duplicated between tokens.ts and theme.css

> Found by /tech-debt audit on 2026-07-06. Severity: medium · Effort: M

**Why this is debt:** `P_TOKEN_VALUES` in `src/constants/tokens.ts` hand-duplicates every hex/typography value already declared in `src/theme.css`, with no generator or sync check. Nothing prevents silent drift between the TS constants consumers import and the CSS custom properties components render with (the serif-font drift shows the ecosystem already drifts — see `serif-font-pipeline.md`).

## Checklist

- [ ] Pick a sync strategy: (a) generate `theme.css` base-token block from `tokens.ts` at build time, or (b) keep both hand-written and add an automated equality check. Option (b) is the smaller step and doesn't touch the build
- [ ] If (b): add a test that parses `[data-theme='light']` base tokens from `src/theme.css` and asserts each `--p-color-*`, font-family, weight, and size value equals its `P_TOKEN_VALUES` counterpart
- [ ] Wire the check into CI (`.github/workflows/ci.yml`) so drift fails the build
- [ ] Verify: intentionally change one hex in `tokens.ts` locally → the check fails; revert → passes

## Evidence

- `src/constants/tokens.ts` — 314 lines; `color.neutral/brand/red/…` hex values duplicating `theme.css`
- `src/theme.css:38-70` — same hex values as `--p-color-*` custom properties
- No script or test references both files
