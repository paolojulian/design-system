---
paths:
  - "src/**/*.{ts,tsx,css,mdx}"
  - ".storybook/**/*.{ts,tsx,js,jsx,mdx}"
  - "README.md"
---

# Swiss Design Rules

Use Swiss / International Typographic Style as the visual operating system for this design system. These rules apply to tokens, components, layouts, Storybook examples, and documentation.

The standard is not "minimal-looking." The standard is: clear hierarchy, strict alignment, functional contrast, disciplined spacing, and no visual move that cannot be explained by usability, structure, or state.

---

## 1. Primary Rule: Function Before Expression

Every visual decision must serve one of these purposes:

- Improve comprehension
- Clarify hierarchy
- Identify state
- Support navigation
- Increase touch or keyboard usability
- Improve accessibility

If a color, shadow, border, animation, icon, or layout treatment does not serve one of those purposes, remove it.

---

## 2. Token Discipline

Tokens are the foundation. Do not hard-code visual values inside components unless there is no existing token and the change also adds the missing token.

Use this hierarchy:

- Base tokens: raw values such as color scales, spacing, type sizes, radius, elevation, motion, and breakpoints
- Semantic tokens: product roles such as background, surface, text, border, focus, primary, danger, warning, success, and info
- Component tokens: component-specific roles such as input border, button background, modal shadow, and table row hover

Required token coverage:

- Color roles for light and dark themes
- Typography size, line-height, weight, and letter-spacing
- Spacing scale
- Radius scale
- Focus ring width, offset, and color
- Touch target sizes, with 44px minimum for mobile controls
- Breakpoints for mobile, tablet, desktop, and wide layouts
- Motion duration and easing for state changes

Anti-patterns:

- One-off hex values inside components
- Arbitrary Tailwind spacing values that bypass the spacing scale
- Component styles depending directly on brand colors instead of semantic roles
- Adding component variants before the semantic token contract exists

---

## 3. Grid And Alignment

Layouts must feel engineered, not arranged by eye.

- Use grid, column, stack, or inline primitives for alignment.
- Align related labels, values, actions, and controls on shared axes.
- Prefer left-aligned content for enterprise workflows and dense information.
- Use whitespace as the primary separator before adding borders or backgrounds.
- Keep component dimensions stable across hover, active, error, loading, and disabled states.

Challenge any layout where:

- Elements appear visually centered but are not aligned to a grid or shared axis.
- Spacing changes without meaning.
- Cards are nested inside cards.
- Sections are styled as decorative floating containers.
- A state change causes layout shift.

---

## 4. Typography

Typography carries most of the design.

- Use a clean sans-serif foundation for UI text.
- Use restrained type scales with clear hierarchy.
- Set letter spacing to `0` unless a named type token intentionally says otherwise.
- Pair every font size with an explicit line-height token.
- Reserve display-scale type for true page-level or brand-level moments.
- Use compact, readable type for tables, forms, navigation, and operational surfaces.

Anti-patterns:

- Viewport-based font sizing
- Decorative type choices for core UI
- More than 2-3 weights in one interface
- Heading levels chosen for appearance instead of document structure
- Text that clips, wraps badly, or overlaps at mobile widths

---

## 5. Color And Contrast

Swiss design does not mean colorless. It means color is controlled and meaningful.

- Start with neutral surfaces, readable text, and clear borders.
- Use brand color as an accent for action, selection, or emphasis.
- Use status colors only for status meaning.
- Maintain accessible contrast for text, icons, focus states, and important boundaries.
- Provide semantic color roles before component-specific color rules.

Challenge any screen or component where:

- A single hue family dominates the interface without functional reason.
- Color is the only indicator of state.
- Brand color is used for passive decoration.
- Borders are too faint to communicate structure.
- Focus states are less visible than hover states.

---

## 6. Component Behavior

Components must be quiet, precise, and complete.

Every interactive component should define applicable states:

- Default
- Hover
- Active
- Focus-visible
- Disabled
- Loading
- Error or invalid
- Selected or expanded

Rules:

- Prefer semantic HTML before ARIA.
- Use ARIA only to complete a known accessibility pattern.
- Icons must clarify scanning or action; they are not decoration.
- Component APIs should expose intent, not styling internals.
- Variants must represent meaningful hierarchy, purpose, or state.

Anti-patterns:

- Visual variants that differ only because they "look nice"
- Buttons or controls without visible focus states
- Disabled controls that remove necessary context
- Loading states that resize the component
- Icons without accessible names when they perform actions

---

## 7. Mobile And Touch

Mobile is a separate layout problem, not a smaller desktop.

- Use touch targets of at least 44px.
- Prefer stacked, single-column flows for forms and task screens.
- Use mobile-specific navigation patterns where appropriate: top app bar, bottom navigation, drawer, sheet, and action sheet.
- Convert desktop data tables into mobile lists, summary rows, or drill-in detail views.
- Keep primary actions reachable and visually stable.

Challenge any mobile implementation where:

- Desktop tables are squeezed horizontally.
- Controls are too dense to tap reliably.
- Important actions move unpredictably between breakpoints.
- Text becomes clipped, overlapped, or dependent on viewport-scaled sizing.
- The layout relies on hover behavior.

---

## 8. Enterprise Usage

Enterprise UI should be calm, dense enough for work, and fast to scan.

- Prioritize forms, tables, filters, navigation, and status surfaces over marketing-style composition.
- Use realistic data in examples.
- Show empty, loading, error, permission, and success states.
- Keep actions close to the objects they affect.
- Make destructive and high-risk actions visually distinct without making the entire screen loud.

Anti-patterns:

- Oversized hero sections in operational tools
- Decorative cards for every section
- Status colors used as general decoration
- Empty states that explain the obvious but do not provide a useful next action

---

## 9. Storybook And Documentation

Storybook is part of the design system contract.

Each component should document:

- Purpose and usage guidance
- Props and variants
- Token dependencies
- Accessibility notes
- Responsive behavior
- Keyboard behavior when interactive
- Realistic enterprise examples

Required stories where applicable:

- Default
- All meaningful variants
- Disabled
- Loading
- Error
- With long text
- Mobile viewport
- Dark theme

---

## 10. Challenger Review Checklist

Before finishing a design-system change, challenge it with these questions:

- What token owns each visual value?
- What grid or alignment rule explains the layout?
- What hierarchy does the typography create?
- What state, action, or meaning does each color communicate?
- Does keyboard and touch interaction work without hidden assumptions?
- Does the component hold up with long text, loading, error, empty, disabled, and mobile states?
- What decorative element can be removed without reducing usability?

If the answer is unclear, tighten the implementation before shipping.

