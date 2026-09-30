# Session: Menu, Tooltip, Popover

Done on 2026-09-30: the positioning util and `PPopover`. Both date pickers render in it. `PMenu` and `PTooltip` are still open.

## Decision: JS positioning, not CSS anchor positioning

CSS anchor positioning (`anchor-name`, `position-try-fallbacks`) isn't supported in every browser the package targets, and this package declares no browser floor. So positioning is a pure function (`PPopover/anchoredPosition.ts`), tested without a page in `tests/ui/anchored-position.spec.ts`, plus a hook that writes `top`/`left` straight to the element. Revisit when anchor positioning is Baseline. The flip rules would then move to `position-try-fallbacks`.

The popover uses `popover="manual"`, so it renders in the top layer and no ancestor's `overflow` or `z-index` can clip it. It uses `manual`, not `auto`, on purpose. With `auto`, light dismiss fires on the trigger's pointerdown and the trigger's click then reopens the popover. Dismissal (Escape, press outside, focus leaving) is handled in the component, so React state stays the only source of truth.

## Positioning follows Popper.js defaults

- flip: use the preferred side if it fits, else the opposite side if that fits, else stay on the preferred side.
- preventOverflow: shift along the cross axis only.
- `position: absolute` in document coordinates: a popover taller than the space below extends the page, which then scrolls.

## Dead ends

- **Capping height and scrolling inside the popover.** The first version followed the roomier side and set `max-height`, so the calendar scrolled inside itself. The user rejected it: a cut-off calendar with an inner scrollbar. `position: fixed` also can't grow the page's scroll area, so the rest of the popover could never be scrolled into view. Switched to Popper's approach. Checked in Chromium: an absolutely positioned top-layer element *does* extend the document's scrollable overflow (`scrollTo` goes past the reported `scrollHeight`). Other browsers are not verified yet.
- **Author `display` vs the UA `:not(:popover-open)` rule.** This is the same trap as `<dialog>` in 03's notes. `.p-popover { display: flex }` would keep the closed popover visible, so the hidden state is restated with a more specific selector.
- **Axe on the open calendars found an existing grid bug.** Both pickers put `gridcell`s directly in the `grid`, without `row`s. The old tests only audited the closed state. Weeks are now `role="row"` with `display: contents`. A week made entirely of next-month blank cells gets no row role, because an empty row fails `aria-required-children`.
- **A scripted CSS insert split a selector group** (`.a, .b, .day {` → a new rule inserted before `.day {`). That silently stripped the date-picker trigger's styles (browser-default gray button). The `--with-error` axe contrast checks caught it, and the user saw it too. Anchor scripted CSS edits on a blank line plus the rule's first property.

## Tradeoffs

- **Mobile:** up to the `sm` breakpoint, `PPopover` renders a `PSheet` (`mobile="popover"` opts out). The range picker then stacks months vertically in batches of 12 and turns off touch-drag, so swiping scrolls the sheet.
- **Focus:** a child moving focus on mount runs before `PSheet`'s `showModal()`, so the calendars retry the focus once on the next animation frame.
