# Ping shadows use hardcoded hex instead of tokens

> Found by /tech-debt audit on 2026-07-06. Severity: medium · Effort: S

**Why this is debt:** swiss-design.md §2 forbids one-off hex values inside components. `PBadge.css` and `PButton.css` derive ping shadows from raw 8-digit hex (base color + alpha suffix) instead of tokens, so they can't adapt to dark theme, and `PButton`'s `#f59e0b` doesn't exist in the token scale at all.

## Checklist

- [ ] Replace each `--p-badge-ping-shadow*` raw hex in `src/components/PBadge/PBadge.css` (lines 6-7, 89-90, 98-99, 107-108, 117-118, 126-127, 135-136) with `color-mix(in srgb, var(--p-color-…) 30%, transparent)` using the matching base token (`#57534e`→neutral-600, `#b63f4c`→brand-600, `#dc2626`→red-600, `#d97706`→amber-600, `#15803d`→green-700, `#1d4ed8`→blue-700)
- [ ] Fix `src/components/PButton/PButton.css:8-9` — `#f59e0b` has no token; either use the existing amber-600 token or add the missing base token to `theme.css` first, then reference it
- [ ] Check the ping shadows under dark theme once tokens are referenced (pairs with `dark-theme-storybook.md`)
- [ ] Verify: `grep -rnE '#[0-9a-fA-F]{3,8}' src/components/` returns no hits; `Pinging` stories for PBadge and PButton look unchanged in light theme (Chromatic diff)

## Evidence

- `src/components/PBadge/PBadge.css:6-7,89-136` — 7 pairs of `--p-badge-ping-shadow(-transparent)` raw hex values
- `src/components/PButton/PButton.css:8-9` — `--p-button-ping-shadow: #f59e0b4d` (color absent from token scale)
