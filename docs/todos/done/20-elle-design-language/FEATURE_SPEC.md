# Elle — an Apple-style look and component set

## What and why
The design system has one look today: Pipz, the original Swiss style with the red brand. Some products want the calm,
familiar feel of Apple's interfaces instead. Elle is a second look that lives beside Pipz, so a product can choose
either one without switching libraries or losing accessibility.

Elle arrives in two steps. Step one, the **look** (colors, type, corners, light and dark), is already built and
waiting to be saved. Step two is a small set of **Apple-pattern components** that Pipz has no equivalent for.

## How it will behave
- A product switches its whole interface to Elle with one setting. Everything already built with the design system
  changes look at once: Apple blue, the system font, softer corners, a gray page with white cards.
- Elle has its own light and dark modes, and they follow the same light/dark switch Pipz uses.
- People who ask their device for more contrast get stronger borders and darker secondary text.
- In Storybook, the sidebar has two folders: **Pipz** (everything that exists today) and **Elle**. A toolbar switch
  previews any Pipz component in the Elle look.
- New Elle components, each usable on phone and desktop, in light and dark:
  - **Button** — Apple's four button styles (filled, tinted, gray, plain), pill-shaped or rounded.
  - **Segmented control** — the sliding two-to-five option switch.
  - **Grouped list** — the Settings-style inset list: rows with an icon, title, detail, and a chevron or a switch.
  - **Navigation bar** — a top bar with a large title and actions.
  - **Tab bar** — the bottom navigation bar for phones.

## Decisions made for you
- **Accessibility beats exact Apple colors.** Apple's standard blue, red, and green are too pale to read as text on
  white. Elle uses the darker blues Apple uses on its own website, and slightly darkened status colors. It looks like
  Apple; it is not a pixel copy.
- **No Apple font is shipped.** Apple does not allow it. Elle uses each device's system font, so it looks most like
  Apple on Apple devices and looks native elsewhere.
- **Elle changes the look, not the vocabulary.** It adds no new design tokens, so the two looks can never drift apart
  in what they support.
- **Elle components are Apple patterns, not re-skins.** Inputs, tables, alerts, and the rest already take the Elle
  look for free, so they are not rebuilt. Only patterns Pipz lacks get an Elle component.
- **The five components above are the first batch.** Chosen because together they are enough to build a
  recognisable Apple-style settings or list screen.
- **Renaming the Storybook folder to "Pipz" changed every story's web address.** Old links to the public Storybook
  will stop working, once.

## Not in this todo
- Action sheets, context menus, date wheels, and other Apple patterns beyond the first five.
- The frosted "Liquid Glass" material beyond a simple translucent bar.
- Making a small Elle region inside a Pipz page look fully correct (a known gap that also affects dark regions; it
  has its own note).
- Visual-regression snapshots of every existing component in the Elle look (it would double the snapshot bill).
- Teaching the AI assistant connection (the MCP server) Elle's color values.

## Done when
- [x] The Elle look is saved in the project history, not just sitting on one machine.
- [x] Switching the Storybook toolbar to Elle re-styles any Pipz component, in light and dark.
- [x] The Elle folder in Storybook shows the theme pages plus the five components.
- [x] Each Elle component works with keyboard only, passes the automated accessibility check, and is comfortable to
      tap on a phone.
- [x] A short example screen (a settings page) is built only from Elle components and looks right in light and dark.

*Implementation contract for the factory: FEATURE_DESIGN.md.*
