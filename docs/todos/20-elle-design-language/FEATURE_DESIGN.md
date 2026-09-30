# Design: Elle design language

Read together with FEATURE_SPEC.md (the intent). Implementation sessions follow this file exactly and do not
redesign it.

## Context for the implementer

**Read first:** `docs/design-languages/elle.md`. It records where every Elle value came from, the WCAG decision, the
dev-vs-build cascade bug, and the known limits. Do not re-derive any of it.

**State on 2026-09-19.** The theming (Phase 1) is implemented and verified but **uncommitted** in the working tree:

| Path | What it is |
| --- | --- |
| `src/theme-elle.css` | Elle tokens. `[data-design='elle'][data-design]` light block, three-selector dark block, `prefers-contrast: more` block |
| `src/elle/ElleTheme.stories.tsx`, `src/elle/ElleTheme.css` | `Elle/Theme` stories (`Tokens`, `Components`), pinned with `globals: { design: 'elle' }` |
| `.storybook/preview.ts` | `design` global (`pipz` \| `elle`) + decorator setting/removing `data-design` on `<html>`; imports `theme-elle.css` |
| `tests/ui/elle-theme.spec.ts` | Toolbar, token, contrast-matrix (40 pairs × 2 modes), axe, scoped-region, and stylesheet-contract tests |
| 30 `*.stories.tsx`, `src/icons/Icons.mdx` | Titles `Components/*` → `Pipz/*`; ids are now `pipz-<component>--<story>` |
| `tests/ui/*.spec.ts`, `mcp/src/test/server.test.ts` | Story ids updated to `pipz-*` |
| `playwright.config.ts` | `STORYBOOK_PORT` env override (default 6006) |
| `vite.config.ts`, `package.json` | Ship `dist/theme-elle.css`, export `./theme-elle.css` |
| `README.md`, `docs/design-languages/elle.md`, `docs/tech-debts/scoped-theme-component-tokens.md` | Docs |

**How to verify anything in this todo — this matters.** The owner usually has `npm run storybook` running on 6006 and
Playwright reuses it. The dev server orders CSS differently from the production build and has already hidden one
total failure. Always:

```bash
npm run build:storybook && STORYBOOK_PORT=6116 npx playwright test
```

Then take a screenshot of new stories from the static build (light + dark, 1100px and 390px) and look at it before
calling visual work done. Also run `npm run lint`, `npx tsc -p tsconfig.app.json --noEmit`, and `cd mcp && npm test`
(the MCP catalog is generated from `src/`; new exports change it). `tsc` rewrites the tracked `tsconfig.*.tsbuildinfo`
files — restore them with `git checkout -- tsconfig.app.tsbuildinfo tsconfig.node.tsbuildinfo` before committing.

**Conventions to copy** (from `src/components/PButton`, `PSwitch`, `PRadio`):
- One folder per component: `EName.tsx`, `EName.css`, `EName.stories.tsx`, `index.ts` (`export { EName, type ENameProps, type ENameRef } from './EName';`).
- `forwardRef`, named export, props type exported, `cn` from `src/utils/cn`, `className` always accepted and merged last.
- CSS inside `@layer components { … }`, BEM-ish classes (`.e-button`, `.e-button--filled`, `.e-button__label`).
- Focus ring, exactly as `PButton.css:83`: `box-shadow: 0 0 0 var(--p-focus-ring-width) <ring token>; outline: var(--p-focus-outline-width) solid transparent; outline-offset: var(--p-focus-ring-offset);` on `:focus-visible`.
- Every animation has a `@media (prefers-reduced-motion: reduce)` override, as in `PToast.css:186`.
- JSDoc on every prop (the MCP catalog serves these as prop descriptions).
- Tests are Playwright against Storybook stories in `tests/ui/`; copy `gotoStory` and `waitForBackgroundSettled` from `tests/ui/selection-controls.spec.ts` (the latter prevents a known axe contrast flake in dark).

**Rules that still apply to Elle** from `.claude/rules/swiss-design.md`: token discipline (no hex in components), 44px
touch targets, mobile as a first-class layout, all states defined, semantic HTML before ARIA. What does *not* apply:
its visual language (4px radius, AvantGarde, no pills). Elle's visual language is Apple's.

## Fixed interfaces

### Packaging
- All Elle components live in `src/elle/<EName>/`, prefix **`E`**.
- New entry `src/elle/index.ts`, built and exported as **`@paolojulian.dev/design-system/elle`**:
  - `vite.config.ts` → add `elle: path.resolve(__dirname, "src/elle/index.ts")` to `build.lib.entry`.
  - `package.json` → add `"./elle": { "types": "./dist/elle.d.ts", "import": "./dist/elle.es.js", "require": "./dist/elle.cjs.js" }`.
  - `tsconfig.node.json` → add `"src/elle"` to `include`.
  - `mcp/src/catalog/build.ts` → add `{ subpath: './elle', file: 'src/elle/index.ts' }` to `ENTRIES`. Nothing else in the MCP changes; assert in `mcp/src/test/catalog.test.ts` that `EButton` imports from `…/design-system/elle`.
- Elle components are **not** re-exported from the package root.
- Storybook titles: `Elle/EButton`, `Elle/ESegmentedControl`, `Elle/EList`, `Elle/ENavigationBar`, `Elle/ETabBar`, `Elle/Examples`. Every Elle stories `meta` sets `globals: { design: 'elle' }`.

### Tokens
- `src/theme-elle.css` stays a pure re-valuation of `--p-*`. **Never add a token there**; `tests/ui/elle-theme.spec.ts` ("Elle introduces no tokens of its own") fails if you do.
- Elle components declare their own component-tier tokens **in their own CSS**, prefix `--e-`, each defaulting to a `--p-*` semantic token (same pattern as `--p-button-bg` in `PButton.css`). No raw colors.
- Shared by bars, declared once in `src/elle/elle-material.css` and imported by `ENavigationBar.css` and `ETabBar.css`:

```css
@layer components {
  .e-material {
    --e-material-bg: color-mix(in srgb, var(--p-color-surface) 78%, transparent);
    --e-material-border: var(--p-color-border-subtle);
    background: var(--e-material-bg);
    -webkit-backdrop-filter: saturate(180%) blur(20px);
    backdrop-filter: saturate(180%) blur(20px);
  }
  @supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
    .e-material { --e-material-bg: var(--p-color-surface); }
  }
  @media (prefers-reduced-transparency: reduce), (prefers-contrast: more) {
    .e-material { --e-material-bg: var(--p-color-surface); -webkit-backdrop-filter: none; backdrop-filter: none; }
  }
}
```

### Components

```ts
// src/elle/EButton/EButton.tsx — HIG button styles. Renders <button>, or <a> when href is set (same union pattern as PButton).
export type EButtonVariant = 'filled' | 'tinted' | 'gray' | 'plain';
export type EButtonTone = 'default' | 'destructive';  // `tone`, not `role`: the native ARIA role prop stays untouched
export type EButtonSize = 'sm' | 'md' | 'lg';      // 2.25rem / --p-size-control-md / --p-size-control-lg
export type EButtonShape = 'capsule' | 'rounded';   // --p-radius-full / --p-radius-md
export type EButtonRef = HTMLButtonElement | HTMLAnchorElement;
type EButtonBaseProps = {
  variant?: EButtonVariant;   // default 'filled'
  tone?: EButtonTone;         // default 'default'; 'destructive' maps to --p-color-danger*
  size?: EButtonSize;         // default 'md'
  shape?: EButtonShape;       // default 'capsule'
  fullWidth?: boolean;
  isLoading?: boolean;        // spinner replaces leftIcon; label stays; width must not change
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
  className?: string;
};
export type EButtonProps = /* button | anchor union, exactly as PButtonProps */;
```
Color mapping: `filled` = `--p-color-action-primary` bg + `--p-color-text-inverse`; `tinted` = `--p-color-action-primary-subtle` bg + `--p-color-action-primary` text; `gray` = `--p-color-surface-subtle` bg (light) + `--p-color-action-primary` text; `plain` = transparent + `--p-color-action-primary` text. All four pairings are already in the contrast matrix except `gray`: **add `['--p-color-action-primary', '--p-color-surface-subtle', 4.5]` to `PAIRS`** in `tests/ui/elle-theme.spec.ts`. `sm` is 36px tall and must still present a 44px hit area (pseudo-element), per the 44px rule. Pressed state = opacity/darken via `color-mix`, no layout change.

```ts
// src/elle/ESegmentedControl/ESegmentedControl.tsx — single choice among 2–5 options.
export type ESegmentedOption<T extends string = string> = { value: T; label: ReactNode; disabled?: boolean; 'aria-label'?: string };
export type ESegmentedControlProps<T extends string = string> = {
  options: readonly ESegmentedOption<T>[];
  value?: T;                          // controlled
  defaultValue?: T;                   // uncontrolled; defaults to first enabled option
  onValueChange?: (value: T) => void;
  'aria-label'?: string;              // one of aria-label / aria-labelledby is required (dev-time console.error if both missing)
  'aria-labelledby'?: string;
  name?: string;                      // when set, renders hidden radio inputs so it submits in a <form>
  size?: 'sm' | 'md';                 // default 'md'
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
};
export type ESegmentedControlRef = HTMLDivElement;
```
Semantics: `role="radiogroup"` with `role="radio"` + `aria-checked` buttons, roving `tabindex`, Arrow keys move **and select** (radio behaviour), Home/End, disabled options skipped. The sliding thumb is one absolutely-positioned element moved with `transform` using the selected index (`--e-segmented-index`, `--e-segmented-count` set inline); `transition: transform var(--p-duration-normal) var(--p-ease-standard)`, removed under reduced motion. Track = `--p-color-surface-subtle`; thumb = `--p-color-surface-raised` + `--p-shadow-sm`. Throw (dev only, `console.error`) if `options.length` is outside 2–5.

```ts
// src/elle/EList/EList.tsx — inset grouped list (Settings style).
export type EListProps = {
  header?: ReactNode;       // caption above the group, rendered as a heading-less <p>; wires aria-labelledby on the <ul>
  footer?: ReactNode;       // explanatory caption below
  inset?: boolean;          // default true: rounded --p-radius-md group with side margins; false = edge-to-edge
  children: ReactNode;      // EListRow elements
  className?: string;
};
export type EListRef = HTMLUListElement;

// src/elle/EList/EListRow.tsx
export type EListRowAccessory = 'none' | 'chevron' | 'checkmark';
type EListRowBaseProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  leading?: ReactNode;               // icon/avatar slot, decorative (aria-hidden wrapper)
  value?: ReactNode;                 // trailing detail text, muted
  accessory?: EListRowAccessory;     // default: 'chevron' when interactive, else 'none'
  trailing?: ReactNode;              // custom trailing control (e.g. <PSwitch>); when set the row itself is NOT interactive
  tone?: 'default' | 'destructive';
  disabled?: boolean;
  className?: string;
};
export type EListRowProps =
  | (EListRowBaseProps & { href: string; onClick?: never })     // renders <li><a>
  | (EListRowBaseProps & { onClick: (event: MouseEvent<HTMLButtonElement>) => void; href?: never }) // <li><button>
  | (EListRowBaseProps & { href?: never; onClick?: never });    // static <li><div>
```
Rows are min 44px tall (`--p-size-touch-min`), separators are `--p-color-border-subtle` hairlines **inset to the title's left edge** (not under the leading icon) and absent after the last row. A row never nests an interactive control inside an interactive row: `trailing` and `href`/`onClick` together is a dev-time `console.error`, and `trailing` wins. Group surface = `--p-color-surface`; page behind it is `--p-color-background`.

```ts
// src/elle/ENavigationBar/ENavigationBar.tsx
export type ENavigationBarProps = {
  title: ReactNode;
  largeTitle?: boolean;          // default false. true = small bar + a large title block below it (heading-lg tokens)
  titleAs?: 'h1' | 'h2';         // default 'h1'; exactly one heading element is rendered even when largeTitle is true
  leading?: ReactNode;           // e.g. back EButton variant="plain"
  trailing?: ReactNode;
  sticky?: boolean;              // default true: position: sticky; top: 0
  className?: string;
};
export type ENavigationBarRef = HTMLElement;   // <header>

// src/elle/ETabBar/ETabBar.tsx — bottom navigation (links, not tabs: it changes pages, so it is <nav>, not role=tablist).
export type ETabBarItem = { id: string; label: string; icon: ReactNode; href?: string; badge?: number | string; disabled?: boolean };
export type ETabBarProps = {
  items: readonly ETabBarItem[];            // 2–5
  activeId: string;
  onSelect?: (id: string) => void;          // items without href render <button>
  'aria-label'?: string;                    // default 'Primary'
  position?: 'fixed' | 'static';            // default 'fixed' bottom; 'static' for embedding in stories/layouts
  className?: string;
};
export type ETabBarRef = HTMLElement;       // <nav>
```
Both bars use `.e-material` and a hairline `--e-material-border`. `ETabBar`: active item gets `aria-current="page"` and `--p-color-action-primary`; inactive = `--p-color-text-subtle`; labels are always visible (`--p-font-size-caption`); each item ≥ 44px; bottom padding adds `env(safe-area-inset-bottom)`. Large title is a plain static block in this todo — **no scroll-collapse behaviour**.

### Error handling
Match the codebase: components do not throw in production. Invalid usage (option count, missing accessible name,
conflicting row props) logs one `console.error` guarded by `import.meta.env.DEV`, then renders the safest fallback
described above.

## Requirements

1. With `data-design="elle"` on `<html>`, `--p-color-action-primary` resolves to `rgb(0, 102, 204)` (light) and `rgb(41, 151, 255)` (dark), on the **static build**, regardless of stylesheet order. *(done — `elle-theme.spec.ts`)*
2. Without the attribute, every Pipz token resolves exactly as before Elle existed. *(done)*
3. All 40 (+1 for `gray` buttons) token pairings meet their WCAG minimum in Elle light and dark. *(40 done)*
4. `theme-elle.css` declares no token that `theme.css` does not, and its dark block is a superset of Pipz's dark block. *(done)*
5. `import { EButton } from '@paolojulian.dev/design-system/elle'` type-checks and builds; the package root does not export any `E*` symbol.
6. `EButton`: every variant × tone renders with contrast ≥ 4.5:1 in both modes; `isLoading` does not change the button's width; `href` renders an anchor; `sm` has a ≥ 44px hit area.
7. `ESegmentedControl`: Arrow/Home/End move and select, skipping disabled options; exactly one option has `tabindex="0"`; works controlled and uncontrolled; with `name` it contributes its value to `FormData`.
8. `EList`/`EListRow`: renders `<ul>`/`<li>`; `href` rows are links, `onClick` rows are buttons, others are static; rows are ≥ 44px; a row with `trailing` contains no nested interactive-in-interactive (axe `nested-interactive` clean).
9. `ENavigationBar` renders exactly one heading; `ETabBar` is a `<nav>` whose active item has `aria-current="page"` and whose items are ≥ 44px.
10. Bars fall back to an opaque `--p-color-surface` when `backdrop-filter` is unsupported, or when the user prefers reduced transparency or more contrast.
11. Every Elle story passes axe in light and dark, at 1280px and 390px, with a guard asserting Elle is really applied (reuse `expectElleApplied` from `elle-theme.spec.ts` — export it from a shared `tests/ui/elle-helpers.ts`).
12. `Elle/Examples → Settings` composes a full screen from Elle components only (navigation bar, two grouped lists incl. a `PSwitch` row and a destructive row, segmented control, tab bar) and passes requirement 11.
13. `cd mcp && npm test` passes, and the catalog lists `EButton` with the `/elle` import path.
