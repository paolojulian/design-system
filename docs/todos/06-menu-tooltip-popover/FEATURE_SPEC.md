# Menu, Tooltip, Popover

Goal: contextual actions and hints. Depends on 03-overlay-primitives (PSheet reuse on mobile).

## Components

- `PMenu` — dropdown action menu; items, separators, destructive item style, icons; trigger = any button.
- `PTooltip` — short text hint on hover/focus; never holds essential-only info.
- `PPopover` — small anchored panel for filters/help; click-triggered, dismissible.

## Rules

- Positioning: one shared anchored-positioning util (flip on viewport edge, offset from spacing scale). Evaluate CSS anchor positioning first; JS fallback if support is insufficient — record the decision.
- Menu destructive items use `--p-color-danger`; everything else neutral.
- Tooltip delay ~300ms in, no delay between adjacent triggers.
- Popover surface = `--p-color-surface-raised` + `--p-color-border`; shadow from an elevation token, not ad-hoc.

## Responsive

- Mobile: PMenu renders as a PSheet action sheet (44px rows, destructive last, cancel row). PPopover becomes a PSheet.
- Tooltip on touch: suppressed; the underlying control must not depend on it.
- Tablet: desktop behavior.

## Accessibility

- Menu: `role=menu/menuitem`, arrow keys, esc closes, focus returns to trigger, typeahead optional.
- Tooltip: `role=tooltip` + `aria-describedby`; shows on focus, hides on esc.
- Popover: focus moves in, esc closes, focus returns.

## Stories

Menu with icons/separators/destructive, long menu (scrolling), tooltip on icon button, popover with form, mobile viewport (sheet mode), dark theme.

## Tests

Playwright: keyboard menu nav, esc/focus-return, edge flip positioning, sheet mode at mobile width, axe pass.
