# Filter Bar

Goal: `PFilterBar` — the standard companion above the enterprise table (08): active filters as chips, add-filter menu, clear all.

## Components

- `PFilterBar` — layout row: search slot, filter chips, "Add filter" trigger, "Clear all".
- `PFilterChip` — applied filter ("Status: Active"), removable; click opens its editor in a PPopover (06) with the matching control (PSelect, PDateRangePicker, PCheckbox group…).
- State is controlled: `filters` + `onFiltersChange`; the bar renders, consumers own semantics.

## Rules

- Chips reuse the PTagInput/PBadge chip language — same radius, surface, type. One chip look across the system.
- "Clear all" appears only when ≥1 filter is active; text button, not a danger style.
- Bar aligns to the table's left edge and shares its border rhythm; no card wrapper.
- Filter editors are normal design-system controls inside PPopover — nothing custom.

## Responsive

- Mobile: chips collapse into a single "Filters (3)" button opening a PSheet (03) with all filters as a stacked form + apply/clear; search stays visible.
- Tablet: chips wrap to a second row before collapsing.

## Accessibility

- Chip remove buttons named ("Remove filter Status: Active").
- Filter count changes announced politely (`aria-live`).
- Sheet/popover editors inherit their focus behavior from 03/06.

## Stories

Empty, several chips, chip editor popover open, overflow wrapping, mobile sheet mode with realistic filters, paired with PTable example, dark theme.

## Tests

Playwright: add/remove/clear flows, editor popover opens with control focused, mobile sheet at mobile width, axe pass.
