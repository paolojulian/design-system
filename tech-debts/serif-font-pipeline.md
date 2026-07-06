# Serif font pipeline out of sync (Lora vs Merriweather)

> Found by /tech-debt audit on 2026-07-06. Severity: high · Effort: S

**Why this is debt:** Tokens declare `'Lora', serif` but no Lora file is loaded anywhere; `fonts.css` loads Merriweather, which no token references. The `PTypography` Serif variant silently falls back to the system serif font. Unused ITC `.otf` binaries also bloat the repo.

## Checklist

- [ ] Decide the canonical serif family (Lora or Merriweather) — whichever matches the intended `PTypography` Serif design
- [ ] If Merriweather: change `--font-serif` / `--p-font-family-serif` in `src/theme.css:27,107` and `typography.family.serif` in `src/constants/tokens.ts:53` to `'Merriweather', serif`
- [ ] If Lora: add Lora `.woff2` files under `src/assets/fonts/Lora/`, declare `@font-face` in `src/fonts.css`, and delete the Merriweather entries + `src/assets/fonts/Merriweather/`
- [ ] Convert the shipped serif font to `.woff2` to match the AvantGarde convention (drop `.ttf`)
- [ ] Delete the unreferenced `src/assets/fonts/ITC Avant Garde Gothic/` directory (3 `.otf` files, zero references)
- [ ] Verify: `grep -rn "Lora\|Merriweather" src/` shows one consistent family across `theme.css`, `tokens.ts`, and `fonts.css`; the PTypography `Serif` story renders the loaded font (check network panel: font file actually requested)

## Evidence

- `src/theme.css:27` — `--font-serif: 'Lora', serif;` (also line 107)
- `src/constants/tokens.ts:53` — `serif: "'Lora', serif"`
- `src/fonts.css:18-30` — only Merriweather `@font-face` declarations (`.ttf`)
- `src/assets/fonts/ITC Avant Garde Gothic/` — 3 tracked `.otf` files with no references
