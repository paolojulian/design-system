# Progress: Elle design language

Spec: FEATURE_SPEC.md · Design: FEATURE_DESIGN.md (read the design before
implementing — the spec is deliberately non-technical).
One phase per factory session. The factory completes the first phase with
unchecked tasks, checks tasks off as it commits them, and stops at the phase
boundary. Do not reorder phases or tasks.

## Phase 1: Land the theming
- [x] `src/theme-elle.css`: Elle re-valuation of `--p-*` (light, dark, `prefers-contrast: more`), order-independent selectors
- [x] Storybook: `design` global + `data-design` decorator in `.storybook/preview.ts`; `Components/*` → `Pipz/*`; `Elle/Theme` stories in `src/elle/`
- [x] `tests/ui/elle-theme.spec.ts` (toolbar, tokens, 40-pair contrast matrix × 2 modes, axe with Elle-applied guard, scoped regions, stylesheet contract); story ids updated to `pipz-*` across `tests/ui/` and `mcp/src/test/server.test.ts`
- [x] Ship it: `vite.config.ts` copies `dist/theme-elle.css`, `package.json` exports `./theme-elle.css`; `playwright.config.ts` honours `STORYBOOK_PORT`
- [x] Docs: README "Design languages", `docs/design-languages/elle.md`, `docs/tech-debts/scoped-theme-component-tokens.md`
- [x] Re-verify on the static build (`npm run build:storybook && STORYBOOK_PORT=6116 npx playwright test`, lint, `tsc`, `cd mcp && npm test`), restore `tsconfig.*.tsbuildinfo`, then commit all of the above as `feat(elle): add Elle design language theming` — it is currently uncommitted

## Phase 2: Elle entry + EButton + ESegmentedControl
- [x] Packaging: `src/elle/index.ts`, `elle` lib entry in `vite.config.ts`, `./elle` export in `package.json`, `src/elle` in `tsconfig.node.json`, `./elle` in MCP `ENTRIES` + catalog test for the `/elle` import path (design → Packaging)
- [x] `tests/ui/elle-helpers.ts`: move `gotoStory`/`resolveColors`/`expectElleApplied` out of `elle-theme.spec.ts` and reuse them there
- [x] `EButton` (`src/elle/EButton/`): tests, then component — 4 variants × 2 tones × 3 sizes × 2 shapes, loading, anchor mode, 44px hit area for `sm`; add the `gray` pairing to `PAIRS`; stories `Elle/EButton` (requirement 6)
- [x] `ESegmentedControl` (`src/elle/ESegmentedControl/`): tests, then component — radiogroup semantics, roving tabindex, arrows select, sliding thumb, form `name`, reduced motion; stories `Elle/ESegmentedControl` (requirement 7)

## Phase 3: Grouped list
- [x] `EList` + `EListRow` (`src/elle/EList/`): tests, then components — link / button / static rows, leading, subtitle, value, accessory, `trailing` control, destructive tone, inset separators, 44px rows, dev-time conflict warning (requirement 8)
- [x] Stories `Elle/EList`: default, with icons, with `PSwitch` trailing, destructive row, long text wrapping, edge-to-edge (`inset={false}`), mobile viewport; axe in light + dark

## Phase 4: Bars + example screen
- [x] `src/elle/elle-material.css` exactly as in the design, with a test for the opaque fallback under `prefers-reduced-transparency` / `prefers-contrast` (requirement 10)
- [x] `ENavigationBar` (`src/elle/ENavigationBar/`): tests, then component — single heading, large title block, leading/trailing, sticky; stories `Elle/ENavigationBar`
- [x] `ETabBar` (`src/elle/ETabBar/`): tests, then component — `<nav>`, `aria-current`, badges, link vs button items, safe-area padding, 2–5 guard; stories `Elle/ETabBar` (requirement 9)
- [ ] `Elle/Examples → Settings` story built only from Elle components + `PSwitch`; axe + Elle-applied guard at 1280px and 390px, light and dark; screenshot reviewed (requirements 11–12)
- [ ] Update `docs/design-languages/elle.md` (component list, remove "theming only"), README "Design languages", full static-build suite + `mcp` tests green

## Notes

**2026-09-19 — saved for later.** Phase 1 is built and passing (211/211 Playwright on the static build, 34/34 MCP,
lint + tsc clean) but **not committed**; its last task is the commit. Everything learned so far is in
`docs/design-languages/elle.md` — read it before resuming.

Parked on purpose (see spec "Not in this todo"): scoped-region component tokens
(`docs/tech-debts/scoped-theme-component-tokens.md`), Chromatic modes for Elle (doubles snapshot cost), Elle token
values in the MCP catalog, action sheets and other further Apple patterns.

Still unverified: the `[UIKIT]`-tagged values in `src/theme-elle.css` (grouped backgrounds, `#38383a` separator, dark
`secondaryLabel` alpha) came from memory, not a fetched source. They pass the contrast matrix; their fidelity to
Apple is unconfirmed.

Queue caveats: `scripts/run-todos.sh` processes folders in order, so this runs after 05–18 — run it directly with
`./scripts/dark-factory.sh docs/todos/20-elle-design-language` to jump the queue. `docs/todos/00-theming-infrastructure`
is a stale duplicate of `done/00-…` with no spec and will trip the queue runner.

**2026-09-30 — Phase 1 committed, Phase 2 built** (231/231 Playwright on the static build, 34/34 MCP, lint + tsc clean).
Deviations from the design, and why:
- `ESegmentedControl` thumb: the design's `surface-raised` thumb on a `surface-subtle` track is invisible in Elle
  dark (both are `neutral-800`). The thumb uses `light-dark(surface-raised, surface-raised mixed 20% toward text)`,
  guarded by `@supports`; a test asserts thumb ≠ track in dark. Alternatives rejected: a base-token (`neutral-0`)
  mix breaks the semantic-only rule; a border ring on the thumb was ~1.2:1 in dark.
- `name` submits through one `<input type="hidden">`, not hidden radios: same `FormData`, and no duplicate radio
  nodes for assistive tech to skip.
- Gray `EButton` and the segmented track use `surface-subtle`, which equals the grouped page background in Elle light.
  They are meant for white surfaces (cards, list rows); the stories show them on one and say so in the docs.
- Stories paint Elle's page background through `withElleCanvas` (`src/elle/ElleCanvas.tsx`): Storybook paints none,
  so the browser's default canvas (white / `#121212`) showed instead of `#f2f2f7` / `#000`.
- Dev warnings (`src/elle/devWarning.ts`) use `import.meta.env.DEV` as designed. Vite's library build replaces it
  statically, so the published package never warns; they only fire inside this repo (Storybook, tests).

**2026-09-30 — Phase 3.** Found and fixed a pre-existing Pipz bug on the way (own commit, `fix(switch)`): `PSwitch`
had no visible thumb in any theme, because `.p-switch` re-declared three tokens as `var()` of themselves. The
`EList` switch rows exposed it. The dev-time `EListRow` conflict warning is not asserted in Playwright: the static
build is a production build, so `import.meta.env.DEV` is false there; the test asserts the safe fallback instead.
A `PSwitch` in `trailing` keeps its label for assistive tech; `EList.css` hides it visually because the row title
already labels it.
