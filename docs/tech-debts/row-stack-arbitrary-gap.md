# Row/Stack accept arbitrary spacing values

> Found by /tech-debt audit on 2026-07-06. Severity: low · Effort: S

**Why this is debt:** swiss-design.md §2 flags spacing values that bypass the spacing scale. `Stack`/`Row` take `gap?: CSSProperties['gap']` as inline style, so any consumer can write `gap="13px"`. Sibling `PCardGrid` already constrains gap with a `PCardGridGap` union — the container primitives are out of sync with that pattern. (Inferred convention — veto if free-form gap is intentional.)

## Checklist

- [ ] Define a shared gap union type mapped to spacing tokens (e.g. `'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'` → `var(--p-space-*)`), consistent with `PCardGridGap`
- [ ] Change `gap` in `src/components/PContainers/Stack/Stack.tsx` and `src/components/PContainers/Row/Row.tsx` to the union type; keep `alignItems`/`justifyContent` as-is (layout, not scale-bound). Breaking change for a published package — batch with the next major or accept both types with a deprecation note
- [ ] Verify: `tsc` rejects `gap="13px"` on Stack/Row; existing stories/usages compile with token-based gaps

## Evidence

- `src/components/PContainers/Stack/Stack.tsx:7,23-28` — `gap?: CSSProperties['gap']` applied via inline `style`
- `src/components/PContainers/Row/Row.tsx` — same pattern
- `src/components/PCardGrid/` — exports constrained `PCardGridGap` type (the existing convention)
