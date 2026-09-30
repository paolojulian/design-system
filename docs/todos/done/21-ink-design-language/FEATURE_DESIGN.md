# Design: Ink design language

Read together with FEATURE_SPEC.md (the intent). Implementation sessions follow this file exactly and do not
redesign it.

## Context for the implementer

**Read first:** `docs/design-languages/ink.md` (every value, its source tag, the contrast numbers and what was
rejected) and `docs/design-languages/elle.md` (the dev-vs-build cascade bug and how to verify). Do not re-derive
either.

**Prerequisite:** Elle's phase 1 (`docs/todos/20-elle-design-language`) must be **committed** first. Ink reuses:
- the `design` Storybook global and the `data-design` decorator in `.storybook/preview.ts`;
- the `Pipz/*` story ids;
- `tests/ui/elle-theme.spec.ts`'s `PAIRS`, `resolveColors` and `gotoStory` (Elle's phase 2 moves those into
  `tests/ui/elle-helpers.ts`; if that hasn't happened yet, do that move here first, exactly as Elle's phase 2
  describes).

If Elle's phase 1 is still uncommitted, **stop** and write that in the Notes of FEATURE_PROGRESS.md. Don't commit
Elle's work as part of this todo.

**Verify on the static build, never the dev server** (see elle.md):
`npm run build:storybook && STORYBOOK_PORT=6116 npx playwright test`, then `npm run lint`,
`npx tsc -p tsconfig.app.json --noEmit`, and `cd mcp && npm test`. Restore
`tsconfig.app.tsbuildinfo tsconfig.node.tsbuildinfo` before committing. Screenshot `Ink/Theme` from the static build
(light and dark, 1100px and 390px) and look at it before calling visual work done.

## Fixed interfaces

### `src/theme-ink.css`
A pure re-valuation of existing `--p-*` tokens. **No new tokens.** Copy Elle's selector structure exactly:

```css
/* header comment: what Ink is, the selector-specificity reason (copy Elle's paragraph), source tags
   [AIRBNB] / [DERIVED] / [BY EYE] as in docs/design-languages/ink.md */

[data-design='ink'][data-design],
[data-design='ink'] [data-theme='light'] {
  color-scheme: light;
  /* Brand scale → ink, so anything that reads brand directly follows. [DERIVED] */
  --p-color-brand-50: #f5f5f4;
  --p-color-brand-100: #e7e5e4;
  --p-color-brand-600: #222222;   /* [AIRBNB] ink */
  --p-color-brand-700: #000000;
  --p-color-action-primary: var(--p-color-brand-600);
  --p-color-action-primary-hover: var(--p-color-brand-700);
  --p-color-action-primary-subtle: var(--p-color-brand-50);
  --p-color-focus: var(--p-color-brand-600);

  /* [AIRBNB] 8px controls/buttons/cards (via radius-sm), 12px md; [BY EYE] 16px overlays (via radius-lg) */
  --p-radius-xs: 0.25rem;
  --p-radius-sm: 0.5rem;
  --p-radius-md: 0.75rem;
  --p-radius-lg: 1rem;

  /* [AIRBNB] one shadow tier for floating things; nothing in-page. `0 0 #0000`, not `none`, so it composes in lists. */
  --p-shadow-sm: 0 0 #0000;
  --p-shadow-md: 0 6px 16px rgb(0 0 0 / 0.12);
  --p-shadow-lg: 0 8px 28px rgb(0 0 0 / 0.28);   /* [BY EYE] */
}

[data-design='ink'][data-theme='dark'],
[data-design='ink'] [data-theme='dark'],
[data-theme='dark'] [data-design='ink']:not([data-theme='light']) {
  color-scheme: dark;
  --p-color-action-primary: #f5f5f4;              /* [DERIVED] stone-100; text-inverse #111 on it = 17.31:1 */
  --p-color-action-primary-hover: #ffffff;
  --p-color-action-primary-subtle: rgb(245 245 244 / 0.08);
  --p-color-focus: #f5f5f4;
  --p-shadow-sm: 0 0 #0000;
  --p-shadow-md: 0 6px 16px rgb(0 0 0 / 0.48);    /* [BY EYE] dark needs a heavier shadow to register */
  --p-shadow-lg: 0 8px 28px rgb(0 0 0 / 0.6);
}
```
Radius tokens don't change between modes, so they appear only in the light block, which also applies in dark because
it matches `[data-design='ink'][data-design]`. Confirm this in the token test.

No `prefers-contrast: more` block: the ink pairs already exceed 14:1. State that in the header comment.

### Storybook
- `.storybook/preview.ts`: extend the `design` global's items to `pipz | elle | ink` (title "Ink"). The decorator
  sets `data-design` to the value, or removes it for `pipz`. Import `../src/theme-ink.css` next to Elle's.
- `src/ink/InkTheme.stories.tsx` + `src/ink/InkTheme.css`: title `Ink/Theme`, `meta.globals: { design: 'ink' }`.
  Two stories, mirroring `Elle/Theme`:
  - `Tokens`: action swatches, radius scale and shadow scale.
  - `Components`: `PButton` (all variants), `PTextInput` with `PFormField`, `PCard`, `PCheckbox`, `PSwitch`, `PBadge`,
    `PAlert` (all statuses) and a `PSheet` trigger.
  Styles only through `--p-*` tokens; no hex in `InkTheme.css`.

### Packaging
- `vite.config.ts`: copy `src/theme-ink.css` → `dist/theme-ink.css` (same plugin entry as Elle's).
- `package.json` `exports`: `"./theme-ink.css": "./dist/theme-ink.css"`.
- README "Design languages": add Ink (one paragraph + the two-line opt-in), linking `docs/design-languages/ink.md`.

### Tests: `tests/ui/ink-theme.spec.ts`
Reuse the shared helpers (`gotoStory`, `resolveColors`, `PAIRS`). Define:

```ts
async function expectInkApplied(page: Page, theme: 'light' | 'dark'): Promise<void>;
  // --p-color-action-primary resolves to [34,34,34,1] (light) / [245,245,244,1] (dark);
  // --p-radius-sm resolves to '0.5rem' in BOTH modes; --p-font-family-sans still starts with 'AvantGarde' (Pipz font kept).
```

## Requirements
1. With the toolbar on Ink, `pipz-pbutton--primary` renders a button whose computed background is `rgb(34, 34, 34)`
   (light) / `rgb(245, 245, 244)` (dark) and whose border radius is `8px`.
2. `expectInkApplied` passes on `ink-theme--tokens` and `ink-theme--components` in light and dark. It runs first in
   every Ink test, so a cascade failure can't let later tests audit Pipz by mistake (the Elle lesson).
3. Every pair in `PAIRS` meets its minimum under Ink, light and dark (alpha composited over `--p-color-surface`, as
   Elle's test does).
4. axe reports no violations on both `Ink/Theme` stories in light and dark.
5. **Ink introduces no tokens**: every custom property declared in `src/theme-ink.css` also exists in
   `src/theme.css` (same contract test as Elle's).
6. **Order independence**: the static build applies Ink even though `theme.css` is emitted in a later chunk (covered by
   running 1–4 against `STORYBOOK_PORT=6116`).
7. Neutrals are untouched: under Ink, `--p-color-background`, `--p-color-text`, `--p-color-border` and
   `--p-color-danger` resolve to the same values as under Pipz.
8. `dist/theme-ink.css` exists after `npm run build`, and `package.json` exports it.
9. Lint, `tsc`, `mcp` tests, and the full static-build Playwright suite pass.
