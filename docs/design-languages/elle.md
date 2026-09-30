# Elle — Apple-inspired design language

Elle is the second design language in this system. **Pipz** is the original (Swiss, AvantGarde, red brand) and stays
the default. Elle is opt-in and has two parts:

1. **Theming.** It re-values the existing `--p-*` token contract, so every current component renders in Elle
   without code changes.
2. **Apple-pattern components** that Pipz has no equivalent for, from `@paolojulian.dev/design-system/elle`:
   `EButton` (filled / tinted / gray / plain), `ESegmentedControl`, `EList` + `EListRow` (inset grouped list),
   `ENavigationBar`, `ETabBar`. They live under `Elle/` in Storybook, with an `Elle/Examples → Settings` screen.
   They add no global tokens: each declares `--e-*` component tokens that default to `--p-*` semantic tokens.

```ts
import '@paolojulian.dev/design-system/theme.css';
import '@paolojulian.dev/design-system/theme-elle.css'; // opt-in, ~11 kB
import { EList, EListRow, ENavigationBar } from '@paolojulian.dev/design-system/elle'; // optional components
```

```html
<html data-design="elle" data-theme="light">  <!-- or "dark" -->
```

`data-design` is a second axis, independent of `data-theme`. No attribute (or any other value) means Pipz.

## Where the values come from

Every value in `src/theme-elle.css` carries one of these tags.

| Tag | Source | Used for |
| --- | --- | --- |
| `[HIG]` | Apple Human Interface Guidelines, Specifications tables (fetched 2026-09-18) | Gray ramp, increased-contrast system colors, iOS text styles (Large Title 34/41 … Caption 1 12/16), Semibold as the emphasized weight, 44pt targets, 50pt large buttons |
| `[WEB]` | apple.com production CSS (fetched 2026-09-18) | `#0071e3` fill + focus, `#0066cc` link, `#2997ff` dark link, `cubic-bezier(.4,0,.6,1)` |
| `[UIKIT]` | UIKit dynamic colors, from memory — **not re-verified against a live source** | Grouped backgrounds, `#38383a` dark separator, dark `secondaryLabel` alpha |
| `[DERIVED]` | Apple's increased-contrast hue mixed with 7–8% black | Status colors used as *text on their own tint*. Apple publishes nothing for that role |

Not from Apple at all, and chosen by eye: the radius scale (6/10/14/20px — the HIG specifies shape families, not
numbers), shadows, durations, and the three type sizes above Large Title.

## The decision that shaped the palette: Apple's default colors fail WCAG AA

The HIG system colors are tuned for native rendering, not WCAG. Measured as text on white:

| Color | Default (light) | Increased contrast (light) | On gray `#f2f2f7` (IC) |
| --- | --- | --- | --- |
| Blue | 3.52 | 4.57 | 4.10 |
| Red | 3.57 | 4.56 | 4.08 |
| Green | 2.22 | 4.54 | 4.07 |
| Orange | 2.31 | 4.55 | 4.08 |
| Yellow | 1.51 | 4.59 | 4.11 |
| `secondaryLabel` (60 60 67 / .6) | 3.44 | — | 3.30 |

So the rule is: **the default system colors are never used for text or fills.** Even the increased-contrast column
fails once the background is Apple's own gray, which is Elle's page color. Hence:

- Action color rests on `#0066cc` (5.57 on white, 4.99 on gray) and *lightens* to `#0071e3` on hover. This is
  apple.com's own pairing — the palette Apple uses in the one place it is held to WCAG.
- Status colors start from the increased-contrast column and are darkened 7–8% to clear 4.5:1 on their own 8% tint.
- Muted text is opaque `#636366` / `#6c6c70` in light. In dark, Apple's real `secondaryLabel` alpha passes everywhere
  (≥ 5.27:1) and is used as-is.
- `prefers-contrast: more` goes further: opaque, darker separators and the strongest label grays.

The alternative — ship Apple's defaults for fidelity — was rejected: this repo runs axe on its stories and lists
accessibility as a working priority, and a theme that cannot pass the repo's own checks is not usable.

`tests/ui/elle-theme.spec.ts` enforces 40 foreground/background pairings per mode, resolved through the browser with
alpha composited. It earned its keep immediately: it caught dark `#2997ff` on its own 16% tint at 4.47:1 (now 12%).

## Fonts

The HIG says not to embed San Francisco, so Elle ships no font files: `-apple-system, BlinkMacSystemFont, 'SF Pro
Text', …, system-ui`. On Apple devices that is SF with automatic optical sizing and per-size tracking — which is why
Elle sets letter-spacing to ~0 instead of porting the HIG tracking table. On Windows/Android it is Segoe/Roboto.
**Elle does not look like Apple on non-Apple devices, by licence, not by accident.**

## Failure worth remembering: it worked in dev and was broken in the build

First version used a bare `[data-design='elle']` selector with a comment saying "import after theme.css". Every test
passed. Screenshots showed Pipz.

- Cause: that selector ties with theme.css's `:root` at (0,1,0), so source order decides. Vite's **production** build
  emits `theme.css` in its own chunk (`index-*.css`) loaded *after* the chunk holding Elle (`preview-*.css`); Vite's
  **dev** server injects in import order. Dark half-worked (its selector is (0,2,0)), which made it look like a
  colour bug rather than a cascade bug.
- Why tests missed it: `playwright.config.ts` has `reuseExistingServer`, and `npm run storybook` was running on 6006.
  The suite was testing the dev server, not the static build CI tests and deploys.
- Fix: `[data-design='elle'][data-design]` — the attribute repeated purely for specificity (0,2,0). Load order no
  longer matters. Dark still beats light by source order *within one file*, which a bundler cannot reorder.
- Guard: the axe tests now first assert Elle really applied (base tokens + font + rendered button colour/radius), so
  they can never again pass by auditing the wrong design language. Verified: 6 of 12 fail against the pre-fix build.
- Tooling: `STORYBOOK_PORT=6116 npx playwright test` targets the static build regardless of what is on 6006.
  Second dev/build difference found the same way: the minifier emits `.625rem`, dev serves `0.625rem`.

## Known limits

- **Scoped regions are partial.** `<div data-design="elle">` inside a Pipz page re-values base and semantic tokens but
  not component tokens. Pre-existing limitation that also affects scoped `data-theme`; see
  `docs/tech-debts/scoped-theme-component-tokens.md`. Document-level use is fully supported.
- **No Chromatic modes for Elle.** Adding `elle-light`/`elle-dark` globally would double snapshot count (and cost) for
  30 story files. Only the two `Elle/Theme` stories render Elle today, in the existing light/dark modes.
- **Renaming `Components/*` to `Pipz/*` changed every story id** (`components-pbutton--primary` →
  `pipz-pbutton--primary`). Old deep links to the public Storybook break, and Chromatic will treat the stories as new
  and ask for baselines to be re-accepted once.
- The MCP catalog serves Pipz token values only; it does not know Elle yet. It does list the `E*` components with
  their `/elle` import path.
- **Gray fills equal the page in light.** `surface-subtle` is the grouped page background in Elle light, so gray
  `EButton`s and the `ESegmentedControl` track only read on white surfaces (cards, list rows), which is where Apple
  uses them.
- **`ESegmentedControl` needs `light-dark()` for its dark thumb** (Chrome 123, Safari 17.5, Firefox 120). Elle dark
  gives `surface-raised` and `surface-subtle` the same gray; older browsers fall back to the raised surface, where
  the thumb shows only by its shadow and the selected label's weight.
- **The large title does not collapse on scroll.** `ENavigationBar largeTitle` is a static block inside the sticky
  header.
- **Dev-time misuse warnings never reach consumers.** They are guarded by `import.meta.env.DEV`, which Vite's
  library build replaces with `false`, so they only fire inside this repo.
