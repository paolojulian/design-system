# Progress — Selection Controls

- [x] Add component tokens for checkbox/radio/switch to `theme.css` (light + dark)
- [x] PCheckbox: tests, then component (checked, indeterminate, disabled, error, description)
- [x] PCheckbox stories (incl. dark theme + mobile viewport)
- [x] PRadio + PRadioGroup: tests, then components
- [x] PRadioGroup stories (incl. dark theme + mobile viewport)
- [x] PSwitch: tests, then component
- [x] PSwitch stories (incl. dark theme + mobile viewport)
- [x] 44px touch targets verified in mobile viewport test
- [x] Axe accessibility test passes for all three components
- [x] Export all from package root; typecheck + lint + full test run green

## Notes

- All 33 new Playwright tests (`tests/ui/selection-controls.spec.ts`) pass: click +
  keyboard toggle, native radiogroup arrow-key navigation, group-level disable,
  44px touch targets on mobile, and axe on every story (light + dark).
- Typecheck (`tsc --noEmit`) and lint (`eslint .`) are clean.
- Pre-existing, unrelated smoke-test failures remain on this branch (PSectionHeader
  em-dash mark, PBadge truncation width, date-picker/typography checks). Verified
  they reproduce with my changes stashed, so they are out of scope for this feature.
  See SESSION.md.
