# Stepper / Wizard

Goal: `PStepper` — multi-step flows (onboarding, checkout, complex record creation). Depends on 02 (forms live inside steps).

## Components

- `PStepper` — step indicator; states per step: complete, current, upcoming, error; optional description per step.
- `PStepperPanel` — content region wired to the active step.
- Navigation is owned by the consumer (their buttons call `onStepChange`); component enforces nothing about validation.

## Rules

- Indicator: number in a circle → check icon when complete; connector line between steps. Complete/current use `--p-color-action-primary`; upcoming neutral; error uses danger tokens.
- Linear by default (future steps not clickable); `nonLinear` prop enables jumping to visited steps.
- No progress-percent text; the indicator is the progress.
- Step content region keeps stable width; step change must not shift the indicator.

## Responsive

- Desktop/tablet: horizontal indicator, labels below markers.
- Mobile: compact pattern — "Step 2 of 5: Shipping" line + thin progress track (reuses PProgressBar, 11). Full horizontal indicator never squeezed.
- Vertical orientation prop for settings-style flows on desktop.

## Accessibility

- Indicator is a labeled `ol`; current step `aria-current="step"`.
- Step change moves focus to the new panel heading.
- Error step announced in text ("Step 3 has errors"), not color alone.

## Stories

Linear 4-step with realistic form content, non-linear, error step, vertical, mobile compact mode, long step labels, dark theme.

## Tests

Playwright: aria-current tracking, focus moves on step change, mobile compact rendering, non-linear click rules, axe pass.
