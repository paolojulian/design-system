# Progress — Form Field System

- [x] Define field context (id, describedby, invalid, required) + tests
- [x] PFormField: tests, then component (label, hint, error, required marker)
- [x] PFormGrid: tests, then component (1-col mobile / 2-col tablet+, span prop)
- [x] PTextInput + PTextArea consume field context
- [x] PSelect + PCombobox consume field context
- [x] PDatePicker + PDateRangePicker consume field context
- [x] Stories: hint/error/required/disabled/long-text states
- [x] Story: realistic enterprise form (mobile viewport + dark theme variants)
- [x] Axe pass; label/error aria wiring verified in Playwright
- [x] Export from package root; typecheck + lint + full test run green

## Notes

- No unit-test runner exists in this repo; behavior is verified with Playwright
  against Storybook stories (same convention as the selection-controls feature).
  Context + PFormField wiring is exercised through `tests/ui/form-field.spec.ts`.
- All 21 new form-field tests pass. See SESSION.md for the field-context design,
  the "bare mode" decision for wrapped controls, and pre-existing test notes.
