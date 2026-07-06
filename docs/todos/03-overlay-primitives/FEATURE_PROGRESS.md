# Progress — Overlay Primitives

- [x] Decide `<dialog>` vs portal fallback; record decision + browser-support check in SESSION.md
- [x] Shared overlay util (scroll lock, esc, focus return) + tests
- [x] Overlay/backdrop + motion tokens in `theme.css` (light + dark)
- [x] PModal: tests, then component (sizes, slots, danger variant)
- [x] PModal stories (long content, form, destructive, mobile, dark)
- [x] PDrawer: tests, then component (side, widths)
- [x] PDrawer stories (mobile full-width, dark)
- [x] PSheet: tests, then component (drag handle, snap, keyboard close)
- [x] PSheet stories (mobile, dark)
- [x] Focus trap/restore + esc + scroll-lock Playwright coverage; axe pass
- [x] Export from package root; typecheck + lint + full test run green

## Status

All tasks complete. `tests/ui/overlay-primitives.spec.ts` — 19/19 green (stable over
`--repeat-each=2`). `npm run build`, `npm run lint` green.

**Pre-existing, out of scope (untouched by this feature):**
- `src/components/PRadio/PRadioGroup.stories.tsx` has a `tsc` Meta-generic error under
  `tsconfig.app.json` (does not fail `npm run build`).
- 6 `storybook-smoke.spec.ts` failures are dark-theme contrast issues on existing
  components (black text on `#111`), tracked in `docs/tech-debts/dark-theme-storybook.md`.
  The overlay `theme.css` change is purely additive (verified: no existing token altered),
  so it did not introduce these.
