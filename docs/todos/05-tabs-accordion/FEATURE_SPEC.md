# Tabs + Accordion

Goal: content organization for settings pages, detail views, and dense enterprise screens.

## Components

- `PTabs` — tab list + panels; controlled or uncontrolled; optional badge/count per tab.
- `PAccordion` — single or multiple open; header + panel; chevron indicator.

## Rules

- Underline-style active tab using `--p-color-action-primary`; inactive tabs neutral. No pill/card tabs.
- Panel has no decorative frame — whitespace separates, per Swiss rules.
- Accordion dividers use `--p-color-border-subtle`; header is a real button.
- Stable dimensions: switching tabs must not shift surrounding layout.

## Responsive

- Mobile: tab list scrolls horizontally with momentum; active tab scrolled into view; ≥44px touch targets. No wrapping, no squeezing.
- Tablet: same as desktop.
- Document the pattern choice: many-section settings on mobile → prefer PAccordion over PTabs.

## Accessibility

- Tabs: `role=tablist/tab/tabpanel`, roving tabindex, arrow-key navigation, home/end.
- Accordion: `aria-expanded` on header button, `aria-controls` to panel.
- Focus-visible ring on both, from shared focus tokens.

## Stories

Default, many tabs (overflow scroll), with badges, disabled tab, accordion single/multiple, long content, mobile viewport, dark theme.

## Tests

Playwright: keyboard nav (arrows, home/end), overflow scroll at mobile width, expanded state toggling, axe pass.
