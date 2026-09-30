# `<p>` elements rely on the host page to reset margins

> Found on 2026-10-01 while fixing PAlert. Severity: medium · Effort: S

**Why this is debt:** the package ships no reset, and browsers give `<p>` about 1em of block margin. Storybook's docs pages add margins too. PAlert's title was a `<p>` with no margin rule, so on the docs page it sat about 30px below its icon, with a large gap before the body. The user reported it as "off". Apps that use Tailwind's preflight never see this, which is why it survived. It's the same root cause as `missing-box-sizing-reset.md`.

Fixed on 2026-10-01: `.p-alert__title`, `.p-toast__title` (`margin: 0`). The date range picker's summary title already had it. The regression test is in `tests/ui/feedback-toast-alert.spec.ts` ("title lines up with its icon").

## Checklist

- [ ] Field messages set only `margin-block-start`, so the UA bottom margin still applies below helper and error text: `p-date-picker__message`, `p-date-range-picker__message`, `p-select__message`, `p-combobox__message`, `p-checkbox__message`, `p-radio-group__message`, `p-switch__message`, `p-form-field__message`. Set `margin-block-end: 0`, or `margin: <top> 0 0`.
- [ ] `p-overlay__description`, `e-list__header`, `e-list__footer`: check each and add an explicit margin.
- [ ] Decide on the mechanism alongside the box-sizing debt, since both are "no reset" problems. A per-component explicit margin is safer than a global `p { margin: 0 }`, which would restyle consumer content.
