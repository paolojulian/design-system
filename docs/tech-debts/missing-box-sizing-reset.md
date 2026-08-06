# Package ships no box-sizing reset, so `width: 100%` overflows by the padding

> Found while fixing the failing UI suite on 2026-08-05. Severity: high · Effort: M

**Why this is debt:** the published stylesheet is `theme.css` plus the component CSS — there is no preflight and no global `box-sizing` rule, so the browser default of `content-box` applies. Any component that combines an explicit width with padding or a border renders *wider than its declared width*. Consumers who also load Tailwind never see it, because Tailwind's preflight sets `*{box-sizing:border-box}` globally; consumers who use the package standalone get silently broken layouts. That difference is the dangerous part — the bug is invisible in the most common setup.

Two components already patched this locally (`PCard.css:22`, `PTable.css:127`), which is the tell that it should have been systemic.

Two more were fixed on 2026-08-05 because they had failing tests proving real breakage:

- `.p-badge` — with `width: 100%` in a 120px container it measured **138px** (120 + 2×8px padding + 2×1px border).
- `.p-text-input__control` — at a 390px viewport it measured **394px** and pushed `document.scrollWidth` to **410px**, i.e. a horizontal scrollbar on every mobile page using a text input.

The remaining files below have the same shape (`width: 100%` + padding, no `box-sizing`) and are latent, not proven broken. They were left alone deliberately: flipping box-sizing across ~30 components at once risks silent layout regressions in components whose tests do not measure width, and that is a change worth making deliberately with Chromatic baselines in hand — not as a side effect of a test fix.

## Checklist

- [ ] Decide the mechanism. A blanket `[class^="p-"]` selector is **not** safe — it collides with Tailwind's `p-4`/`px-2` padding utilities in consumer apps. Prefer either (a) `box-sizing: border-box` added to each component's root and padded child rules, or (b) a flat, explicit selector list of DS roots plus their descendants (`.p-badge, .p-badge *, …`) in one shared stylesheet.
- [ ] Apply to the remaining files: `PAlert.css`, `PButton.css`, `PCardGrid.css`, `PCombobox.css`, `PDatePicker.css`, `PDateRangePicker.css`, `PHorizontalSlider.css`, `PPagination.css`, `PPhotoGrid.css`, `PPhotoMosaic.css`, `PSelect.css`, `PTextArea.css`, `PToast.css`, `overlay/overlay.css`
- [ ] Capture Chromatic baselines **before** the change, then diff — this is exactly the kind of edit that shifts padding-dependent layouts by a few pixels everywhere at once
- [ ] Add a regression test that asserts `document.documentElement.scrollWidth <= viewport width` on the mobile stories, so a reintroduced overflow fails loudly instead of being noticed by eye
- [ ] Verify: `for f in src/components/*/*.css; do grep -lq "width: 100%" "$f" && ! grep -q box-sizing "$f" && echo "$f"; done` returns nothing

## Evidence

- `src/index.css` — the whole file is `@import "./theme.css"`; no reset is shipped
- `src/tailwind.css` — v3 `@tailwind` directives, unused and unimported (see `dead-config-artifacts.md`), so the utility/preflight layer never loads in Storybook either
- `src/components/PCard/PCard.css:22`, `src/components/PTable/PTable.css:127` — pre-existing local patches for the same root cause
- `tests/ui/storybook-smoke.spec.ts` — the badge truncation and mobile-viewport assertions are what surfaced it
