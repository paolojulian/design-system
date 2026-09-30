# Ink: Airbnb/Apple/Swiss design language

Ink is the third design language in this system, beside **Pipz** (the default: Swiss, AvantGarde, red brand) and
**Elle** (Apple). It was researched for the planner app (`~/development/personal/planner`, `docs/design-direction.md`)
and saved here so any product can opt in:

```ts
import '@paolojulian.dev/design-system/theme.css';
import '@paolojulian.dev/design-system/theme-ink.css'; // opt-in
```

```html
<html data-design="ink" data-theme="light">  <!-- or "dark" -->
```

Status: **built** (`docs/todos/21-ink-design-language`). Storybook: `Ink/Theme` (`Tokens`, `Components`), and the
**Design → Ink** toolbar item previews any Pipz component in Ink. Tests: `tests/ui/ink-theme.spec.ts`.

## The idea in one line

Near-black ink on warm white, with soft corners and almost no shadows. **Color means something or it isn't there.** Ink
is the only action color. Red, green and amber appear only for status. Photos and user content are the only other
color on screen.

## Three references, each with one job

| Reference | What Ink takes | What Ink leaves |
| --- | --- | --- |
| **Swiss / International Typographic Style** | The grid, flush-left ragged-right text, one sans-serif, hierarchy from size and weight alone, whitespace as the main separator. Pipz already does this, so Ink inherits it unchanged. | Poster-scale asymmetry and display type. |
| **Apple HIG** | Clarity, deference (the UI never competes with the content), depth only through layers (sheets over content), 44px targets, no light weights, grouped lists and bottom sheets as patterns. | Blue accent, glass materials, the system font. Elle already covers those. |
| **Airbnb DLS** | Restraint: one typeface, one accent, soft rounded corners, near-zero shadows, soft ink `#222222` instead of pure black, a sticky bottom action bar, bordered inputs grouped into one block. | Rausch red. Ink's accent is ink. |

Airbnb's own principles, as published: **Unified** (no isolated features or outliers), **Universal** (welcoming and
accessible worldwide), **Iconic** (bold, clear focus), **Conversational** (motion that communicates). Ink's rules are
consistent with all four. Only "Conversational" motion is left to Pipz's existing duration and easing tokens.

## What Ink changes, and what it keeps

Ink is **theming only**, like Elle's phase 1: it re-values existing `--p-*` tokens and adds none.

| Area | Pipz | Ink | Tag |
| --- | --- | --- | --- |
| Action (light) | brand red `#b63f4c` / hover `#96313c` / subtle `#fdf2f3` | `#222222` / hover `#000000` / subtle `#f5f5f4` | `[AIRBNB]` ink |
| Action (dark) | `#f07f8b` / `#f4a1aa` / `rgb(240 127 139 / .14)` | `#f5f5f4` / hover `#ffffff` / `rgb(245 245 244 / .08)` | `[DERIVED]` |
| Brand scale | red | `brand-50 #f5f5f4`, `brand-100 #e7e5e4`, `brand-600 #222222`, `brand-700 #000000`, so anything reading brand directly also follows | `[DERIVED]` |
| Focus | brand red | same as action | `[DERIVED]` |
| Radius | xs 2 / sm 4 / md 6 / lg 8 px | xs 4 / sm 8 / md 12 / lg 16 px | `[AIRBNB]` 8px buttons, 12px cards; `[BY EYE]` 16px overlays |
| Shadows | sm / md / lg all visible | sm **none** (`0 0 #0000`, not `none`, so it still composes in shadow lists), md `0 6px 16px rgb(0 0 0 / .12)`, lg `0 8px 28px rgb(0 0 0 / .28)` | `[AIRBNB]` md is Airbnb's one shadow tier; `[BY EYE]` lg |
| Neutrals, text, borders | warm stone | **unchanged** | Airbnb's soft grays and Pipz's stone are the same family. The owner picked stone. |
| Status colors | Pipz | **unchanged** | AA-verified by the Ink contrast test. |
| Switch (dark only) | white thumb, `neutral-700` off track | `neutral-950` thumb, `neutral-500` off track | `[DERIVED]`: the white thumb vanished on the ink track |
| Font | AvantGarde | **unchanged** | Geometric, close to Airbnb Cereal (which is proprietary). |
| Type scale, spacing, motion | Pipz | **unchanged** | The 4px grid matches Airbnb's. |

What follows from the radius change without touching components: controls, buttons and cards (`--p-control-radius`,
`--p-button-radius`, `--p-card-radius` all resolve to `--p-radius-sm`) become 8px, and overlays (`--p-overlay-radius`
= `--p-radius-lg`) become 16px. Badges and checkboxes (`--p-radius-xs`) become 4px.

**Cards stay 8px, not Airbnb's 12px.** `PCard` binds to `--p-radius-sm`, and component tokens are declared on the
component class, so a theme can't re-value `--p-card-radius` without the same component-token work noted in
`docs/tech-debts/scoped-theme-component-tokens.md`. Accepted: 8px cards next to 8px buttons still read as Airbnb-soft.

## Contrast (measured)

| Pair | Ratio |
| --- | --- |
| `#ffffff` on `#222222` (primary button, light) | 15.91 |
| `#ffffff` on `#000000` (primary hover, light) | 21.00 |
| `#222222` on `#fafaf9` (link on page, light) | 15.2 |
| `#222222` on `#f5f5f4` (action on subtle, light) | 14.6 |
| `#111111` on `#f5f5f4` (primary button, dark) | 17.31 |
| `#f5f5f4` on `#111111` (link on page, dark) | 17.31 |

The Elle contrast matrix (`PAIRS` in `tests/ui/elle-helpers.ts`) is reused as-is for Ink, and every ink pair has
large headroom. The risky pair is **dark** `action-primary-subtle` (8% ink over surface) under `action-primary` text,
and it still passes.

Found while building (2026-09-30):
- **Dark switch thumb.** `PSwitch`'s white thumb on the off-white ink track measured 1.09:1, so the thumb vanished.
  Ink's dark block re-values two existing switch tokens: the thumb goes `neutral-950` (17.31:1 on the track) and
  the off track lifts to `neutral-500` so the dark thumb still reads there (3.94:1). Tested.
- **One inherited Pipz gap.** Pipz light `text-subtle` on `surface-subtle` is 4.40:1. Ink keeps Pipz's neutrals, so
  it inherits this; the Ink test exempts only that pair. The owner chose to fix it in Pipz later, not in Ink:
  `docs/tech-debts/pipz-text-subtle-contrast.md`. No shipped component renders the pair.

Rejected on the way:
- **Pure black `#000` text and action.** Too harsh next to the stone neutrals, and not what Airbnb does. The owner
  rejected it: "it's not really black but dark stone grays".
- **A faint `#DDDDDD` input border.** 1.36:1 fails WCAG 1.4.11 for control boundaries. Pipz's existing
  `--p-color-border` is kept.
- **Amber `#B4690E`.** It was 4.23:1, failing AA. Pipz's status colors are kept.

## Patterns that go with Ink (guidance for products, not built here)

- A large title, then inset grouped lists: hairline dividers, and never a card inside a card.
- One primary (ink) action per screen, often in a sticky bottom bar. Everything else is `secondary`/`tertiary`.
- Bottom sheets on mobile and modals from 768px. Toasts for confirmations.
- Avatars are initials on `--p-color-surface-inverse`. No color-coding, because the name is always shown.
- Photos and tickets carry the color. A ticket or QR viewer forces a white background even in dark mode, so scanners
  can read it.
- Empty states are one line saying what's missing, plus the action that fixes it. No illustrations.

## Sources

- Apple principles and type scale: [Superdesign: Apple](https://www.superdesign.dev/blog/apple-design-system),
  [Uxcel: Apple platform principles](https://uxcel.com/lessons/design-principles-of-apple-platforms-037)
- Airbnb values and principles: [Superdesign: Airbnb](https://superdesign.dev/blog/airbnb-design-system),
  [Airbnb design principles](https://www.designprinciplesftw.com/collections/airbnbs-design-principles),
  [AIGA Eye on Design: Cereal](https://eyeondesign.aiga.org/airbnbs-new-typeface-is-a-case-study-in-unified-accessible-design/)
- Swiss style: [Wikipedia: International Typographic Style](https://en.wikipedia.org/wiki/International_Typographic_Style),
  [UX Planet: Swiss style web design](https://uxplanet.org/swiss-style-web-design-everything-you-need-to-know-2b128fd327b9)

Airbnb hex values are community-measured, not an official spec (fetched 2026-09-30). `[AIRBNB]`-tagged values are
starting points that were then checked for contrast. `[BY EYE]` values have no source.
