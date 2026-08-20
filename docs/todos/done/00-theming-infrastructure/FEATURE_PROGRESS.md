# Progress — Theming Infrastructure

- [x] Theme toolbar + `data-theme` decorator in `.storybook/preview.ts`
- [x] Chromatic `modes` for light + dark in preview parameters
- [x] Dark stories/modes for token-heavy components (PCard, PButton, PBadge, PTable, PTextInput) — via global `chromatic.modes` (all stories snapshot in both themes)
- [x] Dark coverage for remaining existing components — same global `modes`
- [x] Fix dark-theme issues surfaced by snapshots (token-level only) — `--p-control-bg-hover`, `--p-table-bg-muted`
- [x] README theming section (attribute, scoped, OS-preference snippet, brand override surface)
- [x] Playwright smoke test: story background token flips with toolbar theme (`tests/ui/theme-toolbar.spec.ts`)
- [x] Check off completed items in `docs/tech-debts/dark-theme-storybook.md`
- [x] Typecheck + lint green; theming tests green (see SESSION.md re: 6 pre-existing, unrelated smoke failures)
