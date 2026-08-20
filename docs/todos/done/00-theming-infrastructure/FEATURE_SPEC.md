# Theming Infrastructure

Goal: make the existing light/dark theming reviewable and documented. Runs first — every later todo requires dark-theme stories, which Storybook can't render today.

Absorbs `docs/tech-debts/dark-theme-storybook.md` (its checklist is the source of truth for the Storybook work).

## Scope

1. **Storybook theme toolbar** — `globalTypes` theme switcher in `.storybook/preview.ts` + decorator setting `data-theme` on `document.documentElement`.
2. **Chromatic dark snapshots** — `modes: { light, dark }` in preview parameters so dark is regression-tested.
3. **Dark coverage for existing components** — per the tech-debt checklist; fix illegible/unstyled surfaces it surfaces.
4. **README theming section** documenting:
   - `data-theme="light|dark"` on `<html>`, and scoped theming on any container.
   - Following the OS: short snippet wiring `prefers-color-scheme` + storage to the attribute (consumer-side; the package stays CSS-only by design — state that).
   - Custom branding: which semantic tokens (`--p-color-action-*`, `--p-color-focus`) are the supported override surface; base tokens are not.

## Rules

- No new tokens, no JS theme provider in the package — this is tooling + docs, not API.
- Dark fixes change token values or token usage only; no component-specific hex.
- Cross-check `docs/tech-debts/custom-color-api-consistency.md` before writing the branding docs so the two don't contradict.

## Non-goals

`prefers-color-scheme` auto-switching inside theme.css (would fight the explicit attribute; documented consumer snippet instead).

## Tests

Playwright: one smoke test asserting a story renders with correct `--p-color-background` under both toolbar themes. Chromatic build shows both modes.
