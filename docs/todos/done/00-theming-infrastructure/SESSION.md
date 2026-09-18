# Session — Theming Infrastructure

Branch: `feature/theming-infrastructure` (based on `origin/main`, which equalled local `main`).

## What shipped

- **Theme toolbar + decorator** (`.storybook/preview.ts`): `globalTypes.theme` (light/dark)
  with a decorator that sets `data-theme` on `document.documentElement`. `initialGlobals`
  defaults to light. The decorator reads `context.globals.theme`, so it drives both the
  interactive toolbar and Chromatic modes (modes set globals).
- **Chromatic modes** (`.storybook/preview.ts`): `chromatic.modes = { light, dark }`.
  Every story snapshots in both themes, so no per-component `Dark` stories were needed.
  Legacy `chromatic.viewports` kept alongside.
- **Dark token fixes** (token-level only, light kept pixel-identical):
  - `theme.css` — added `--p-control-bg-hover: var(--p-color-neutral-800)` to the dark block.
    The light value is `var(--p-color-neutral-50)` (near-white), a *fixed base* that does not
    flip; in dark it flashed near-white on control hover (PSelect/PCombobox/PDatePicker/
    PDateRangePicker). Dark now lightens correctly.
  - `PTable.css` — `--p-table-bg-muted` changed from `var(--p-color-neutral-50)` to
    `var(--p-color-background)`. It feeds `linear-gradient(..., --p-table-bg, --p-table-bg-muted)`
    on header cells; the fixed near-white base produced a white fade at the header bottom in
    dark. `--p-color-background` is neutral-50 in light (identical) and neutral-950 in dark
    (subtle dark fade).
- **README** — new `## Theming` section: `data-theme` on `<html>` and scoped containers,
  a consumer-side `prefers-color-scheme` + storage snippet (package stays CSS-only by design),
  and the supported branding surface (`--p-color-action-*`, `--p-color-focus`; base tokens
  are not the API). Cross-checked against `custom-color-api-consistency.md` — consistent
  (token-override is the contract).
- **Test** — `tests/ui/theme-toolbar.spec.ts`: one smoke test loading a story under
  `globals=theme:light|dark`, asserting `data-theme` on `<html>` and that `--p-color-background`
  flips (250,250,249 ↔ 17,17,17) plus `--p-control-bg-hover` resolves to neutral-800 in dark
  (guards the fix).

## Decisions / tradeoffs

- **Global `modes` over per-component `Dark` stories.** The tech-debt allowed either. Global
  modes cover all 16 components with one config and no story sprawl; the toolbar covers manual
  review. Alternative (a `Dark` story each) was rejected as redundant given modes.
- **Kept `chromatic.viewports` next to `modes`.** Removing it would drop responsive snapshot
  coverage — an unrelated change. Followed the spec's literal `modes: { light, dark }`.
- **Left `--p-*-ping-shadow` hex alone.** Those are decorative pulse glows tracked by a
  separate debt (`ping-shadow-hardcoded-hex.md`); not illegible surfaces. "Do not batch-fix
  blindly."
- **PHighlight/PBadge `neutral-950` text on the warning variant is intentional** (dark text on
  bright amber, correct in both themes) — not a dark bug.

## Not runnable here

- **Chromatic dark snapshots** need an authenticated `test:visual` run (project token / network).
  Config is in place; the baseline must be captured in CI.

## Pre-existing failures (NOT caused by this work)

Full `playwright test` has 6 failures. Verified by stashing my changes and rebuilding: they
fail identically on the baseline and touch files I didn't modify. All are light-theme
assertions, unrelated to theming:

- `storybook-smoke.spec.ts:101` PSectionHeader — expects mark `"-"`, component renders `"—"`
  (em dash; likely stale after commit `81c8d78 style: improve PSectionHeader indexed`).
- `storybook-smoke.spec.ts:470` PTextInput mobile — input width 394 > 390 (4px overflow).
- `storybook-smoke.spec.ts:623` PTypography body-wide — axe contrast violation.
- `:70` PBadge, `:335` PDatePicker, `:394` PDateRangePicker — pre-existing.

Left for their own todos to avoid unrelated modifications.

---

# Follow-up (2026-09-18) — align theme switching with Mobbin

Reference: how mobbin.com's app applies its theme, read from the public HTML of
`/login` and `/discover/...` (the marketing homepage is a separate Framer site and is
not representative). It is `next-themes` with:
`attribute="class"`, `storageKey="mobbin:theme"`, `defaultTheme="system"`,
`enableSystem`, `enableColorScheme` — injected as a blocking inline script at the top of
`<body>`, with the `localStorage` read wrapped in `try/catch`.

## Gaps found vs. what shipped above, and what changed

- **Two-state → three-state.** Mobbin's preference is `light | dark | system`, default
  `system`. Storybook toolbar gained a `System` item and `initialGlobals.theme` is now
  `system`. `system` is resolved to `light|dark` before writing `data-theme`; theme.css
  still only knows two values (no new tokens, no package JS — spec rules intact).
- **No-flash application.** README snippet now says *where* to run: inline blocking script
  in `<head>`. The old snippet was silent on this; run post-hydration it flashes light.
- **Guarded, namespaced storage.** `try/catch` + `my-app:theme` key, unknown stored values
  fall back to light.
- **Already better than Mobbin, left alone:** `color-scheme` is declared in theme.css per
  `data-theme` value, so it also works for scoped containers. Mobbin sets it from JS on
  `<html>` only.

## Decisions / tradeoffs

- **Kept `data-theme`, did not move to Mobbin's `class`.** The attribute selector is what
  makes scoped theming (`<aside data-theme="dark">`) work and is already public API;
  switching would be a breaking change for zero user-visible gain. README documents the
  `next-themes attribute="data-theme"` bridge instead.
- **Did not add `@media (prefers-color-scheme)` to theme.css** (still a spec non-goal).
  A CSS-only system fallback would need every dark token duplicated under the media query
  and would still fight an explicit attribute on a scoped container.
- **Storybook default is `system`, not `light`.** Risk considered: non-deterministic
  snapshots. Chromatic `modes` pin the theme explicitly, and Playwright's default
  `colorScheme` is `light`, so both stay deterministic. Full suite: 199/199 passing.

## Surprises

- `matchMedia` `change` fires asynchronously after `page.emulateMedia()`. Reading
  `data-theme` on the next line gives the stale value — a false failure, not a bug. Assert
  with a polling matcher (`toHaveAttribute` / `waitForFunction`).
- The 6 "pre-existing failures" listed above no longer reproduce on `main` (199 passed).
- Mobbin's official MCP (`https://api.mobbin.com/mcp`, OAuth, Pro plan+) returns *screens*,
  not implementation — it cannot answer "how does Mobbin switch themes". That came from
  reading their HTML. The MCP is useful for the visual side (dark palettes, theme pickers).
