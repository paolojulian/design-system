# Pipz `text-subtle` misses AA on `surface-subtle`

> Found while building the Ink design language on 2026-09-30. Severity: low · Effort: S

**Why this is debt:** In Pipz light, `--p-color-text-subtle` (`neutral-500`, `#78716c`) on `--p-color-surface-subtle`
(`neutral-100`, `#f5f5f4`) measures **4.40:1**, below WCAG AA's 4.5:1 for text. It went unnoticed because the
token contrast matrix (`PAIRS` in `tests/ui/elle-helpers.ts`) only ever ran against Elle. Ink keeps Pipz's neutrals
by design, so Ink's run was the first to measure them. Ink's test exempts this one pair and points here.

No shipped component renders the pair today (no component CSS reads `text-subtle`). It is reachable through the
Tailwind `text-text-subtle` utility on a `bg-surface-subtle` element, and any future component that combines them.

## Checklist

- [ ] Decide the fix: darken `--p-color-text-subtle` in Pipz light, or keep it and forbid the pairing in docs
- [ ] If darkening: `#766f6a` (6% toward `neutral-600`) reaches 4.53:1 on `#f5f5f4` and is visually the same step;
      check it still reads as a step lighter than `text-muted` (`#57534e`)
- [ ] Run the `PAIRS` matrix against Pipz itself (light and dark), not just Elle and Ink, so Pipz regressions show
- [ ] Remove the exemption in `tests/ui/ink-theme.spec.ts` (`PIPZ_KNOWN_GAPS`)

## Evidence

Measured on the static Storybook build, 2026-09-30:

| Pair (Pipz light) | Ratio |
| --- | --- |
| `text-subtle` on `surface-subtle` | 4.40 ✗ |
| `text-subtle` on `surface` (`#ffffff`) | 4.80 ✓ |
| `text-subtle` on `background` (`#fafaf9`) | 4.59 ✓ |

Pipz dark passes every pair.
