# Ink: an Airbnb-style look, near-black ink on warm white

## What and why
The design system has two looks: Pipz (Swiss, red brand) and Elle (Apple). Some products want the calm Airbnb feel
instead: a single near-black accent, soft corners, almost no shadows, and color only where it means something. The
planner app is the first. Ink is a third look beside the other two, so any product can switch to it with one setting
and keep everything already built.

## How it will behave
- A product switches its whole interface to Ink with one setting. Every existing component changes at once:
  - buttons, links, checkboxes, switches and focus rings turn from red to near-black ink;
  - buttons, inputs and cards get softer 8px corners, and sheets and modals get 16px;
  - cards lose their shadow; only things floating over the page (sheets, menus, toasts) keep one.
- Ink has light and dark modes on the same light/dark switch. In dark, the ink becomes an off-white accent with
  dark text on it.
- Grays, text colors, status colors, the font and spacing stay exactly as in Pipz.
- The Storybook toolbar can preview any component in Ink, next to Pipz and Elle. An `Ink/Theme` page shows the
  palette and a sample of components in light and dark.

## Decisions made for you
- **Ink, not pure black.** Airbnb uses a soft `#222222`, and pure black looked harsh next to the warm grays.
- **Keeps Pipz's warm stone grays and font.** They're already in Airbnb's family, and it means Ink changes only what
  it has to.
- **Cards are 8px, not Airbnb's 12px.** Cards can't take a different radius from buttons without extra component
  work, which is noted as a known gap. 8px still reads as soft.
- **Theming only for now.** No Ink-specific components. Grouped lists, bottom bars and the rest come from the
  product or from Elle's upcoming components.
- **Named "Ink"**, after the one color it's about. Easy to rename before it ships.

## Not in this todo
- Ink-only components.
- Showing Ink's values through the AI assistant connection (the MCP server), same as Elle.
- Visual-regression snapshots of every component in Ink.
- Making a small Ink region inside a Pipz page fully correct (the same known gap as Elle).

## Done when
- [x] Switching the Storybook toolbar to Ink re-styles any component in light and dark, with ink buttons and softer
      corners.
- [x] The `Ink/Theme` page shows the palette and components in both modes.
- [x] Every text/background pairing passes the automated contrast check in both modes, and the accessibility check
      passes.
- [x] The package ships the Ink stylesheet, and the README explains how to opt in.
- [ ] The planner app can drop its local overrides and use Ink instead.

*Implementation contract for the factory: FEATURE_DESIGN.md.*
