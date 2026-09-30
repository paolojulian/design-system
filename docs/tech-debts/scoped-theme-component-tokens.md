# Scoped theming does not re-resolve component tokens

> Found while building the Elle design language on 2026-09-18. Severity: medium · Effort: M

**Why this is debt:** The README promises that `data-theme` "scopes to any container". It only half works. Custom properties that reference other tokens are substituted on the element where they are *declared*; descendants inherit the finished value. Every component-tier token (`--p-control-bg: var(--p-color-surface)`, …) and a few semantic ones (`--p-focus-ring-color`) are declared only in the `:root, [data-theme='light']` block, so inside `<aside data-theme="dark">` they keep their light values. The dark block re-declares ~35 tokens; the other ~90 component tokens never flip. The same limit applies to a scoped `data-design="elle"` region.

Document-level theming (attributes on `<html>`) is unaffected, which is why no test or snapshot has caught it.

## Checklist

- [ ] Split `theme.css`: keep base + semantic tokens under `:root, [data-theme='light']`, move everything after `/* Component tokens */` (and `--p-focus-ring-color`) into a rule that matches every theming boundary — `:root, [data-theme], [data-design]` — so the `var()` chains re-resolve there
- [ ] Keep the dark overrides of component tokens (`--p-control-bg-hover`, `--p-switch-track-off`) winning: same specificity, later in the file
- [ ] Check `mcp/src/catalog/tokens.ts` still finds the component tier (it keys off the `/* Component tokens */` heading inside the light block — the split moves that heading)
- [ ] Add a Playwright test: a `[data-theme='dark']` div inside a light page resolves `--p-control-bg` to the dark surface and `--p-focus-ring-color` to the dark focus color; same for a `[data-design='elle']` div
- [ ] Add one story rendering a dark region inside a light page with a `PTextInput` in it, so Chromatic sees it

## Evidence

Measured on the static Storybook build, light page, 2026-09-18:

| Region | `--p-color-surface` | `--p-control-bg` | `--p-focus-ring-color` |
| --- | --- | --- | --- |
| `<div data-theme="dark">` | `rgb(28, 25, 23)` ✓ dark | `rgb(255, 255, 255)` ✗ light | `rgb(182, 63, 76)` ✗ light |
| `<div data-design="elle">` | `rgb(255, 255, 255)` ✓ | `rgb(255, 255, 255)` (same in both) | `rgb(182, 63, 76)` ✗ Pipz red, Elle is blue |

- `src/theme.css:37-38` — single `:root, [data-theme='light']` block holds all three tiers
- `src/theme.css` dark block — overrides semantic colors only, plus two component tokens
- `README.md` "Applying a theme" — documents container scoping without this caveat
