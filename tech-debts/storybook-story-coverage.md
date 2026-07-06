# Storybook required-story coverage gaps

> Found by /tech-debt audit on 2026-07-06. Severity: medium · Effort: M

**Why this is debt:** swiss-design.md §10 defines required stories (Default, variants, Disabled, Loading, Error, long text, mobile viewport, dark theme). `Row`/`Stack` are publicly exported with no stories at all, and only `PButton` has an explicit mobile story — undocumented states rot first. (Dark theme is tracked separately in `dark-theme-storybook.md`.)

## Checklist

- [ ] Add `Row.stories.tsx` and `Stack.stories.tsx` under `src/components/PContainers/` covering gap/alignment variants with realistic content
- [ ] Add mobile-viewport stories for the mobile-sensitive components: `PTable` (list/priority-column behavior), `PCombobox`, `PDatePicker`, `PDateRangePicker`, `PPagination`
- [ ] Add long-text stress stories where missing: `PCard` (title/description overflow), `PCardGrid`, `PSectionHeader`, `PSelect` (long option labels)
- [ ] Add missing state stories: `PHorizontalSlider` disabled/loading, `PSectionHeader` long-text and level variants
- [ ] Verify: each component's stories cover every §10-required state that applies to it (walk the list per component); `npm run test:ui` passes with the new stories included in the smoke/axe sweep

## Evidence

- `src/components/PContainers/Row/`, `src/components/PContainers/Stack/` — no `.stories.tsx`; exported from `src/components/index.ts:1`
- `src/components/PButton/PButton.stories.tsx` — only component with an explicit `Mobile` story
- `src/components/PSectionHeader/PSectionHeader.stories.tsx` — only `Default` and `Indexed`
- `src/components/PHorizontalSlider/PHorizontalSlider.stories.tsx` — only `Default`, `Compact`, `FreeScroll`
