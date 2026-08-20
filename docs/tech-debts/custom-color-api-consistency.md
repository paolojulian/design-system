# Two competing custom-color patterns (PHighlight vs inputs)

> Found by /tech-debt audit on 2026-07-06. Severity: medium · Effort: M

**Why this is debt:** swiss-design.md §7 says component APIs expose intent, not styling internals. `PHighlight` takes free-form `color`/`textColor` CSS props (stories pass raw hex), while `PTextInput`/`PTextArea` customize via component-token overrides (`[--p-input-ring:var(--p-color-info)]`). Two patterns for the same concern fragment the system; the free-form one bypasses token discipline entirely.

## Checklist

- [ ] Adopt the token-override pattern as the system contract for color customization (document it in the component docs/stories)
- [ ] Replace `PHighlight`'s `color`/`textColor` props (`src/components/PHighlight/PHighlight.tsx:21-23,42,53`) with documented component tokens (`--p-highlight-bg`, `--p-highlight-text`) overridable via className — deprecate the props first if consumers exist (this is a published package; plan a major or a deprecation release)
- [ ] Update `src/components/PHighlight/PHighlight.stories.tsx` `CustomColor`/`CustomBackground` stories (lines 79, 96-97) to override tokens with semantic values instead of raw hex `#111111`/`#ffffff`
- [ ] Verify: `grep -rn "CSSProperties\['color'\]" src/components/` returns nothing; PHighlight custom stories render identically via token overrides (Chromatic diff)

## Evidence

- `src/components/PHighlight/PHighlight.tsx:21-23` — `color?: CSSProperties['color']; textColor?: CSSProperties['color']`
- `src/components/PHighlight/PHighlight.stories.tsx:79,96-97` — raw hex passed as props
- `src/components/PTextInput/PTextInput.stories.tsx:147-154` — `Custom Colors (token override)` story using `[--p-input-ring:var(--p-color-info)]`
