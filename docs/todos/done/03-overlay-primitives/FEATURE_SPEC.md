# Overlay Primitives

Goal: PModal, PDrawer, PSheet — the overlay layer everything else (menus, command palette, mobile nav) builds on.

## Components

- `PModal` — centered dialog; sizes sm/md/lg; header/body/footer slots; danger variant for destructive confirms.
- `PDrawer` — side panel (right default, left option) for detail views and filters.
- `PSheet` — bottom sheet, mobile-first; drag handle, snap to content height.

## Rules

- Build on native `<dialog>` (showModal) — free focus trap, esc, top layer. Verify browser support matches package targets before committing; fall back to a shared portal + focus trap util if not.
- Shared behavior in one place: scroll lock, esc to close, overlay click policy (prop), focus return to trigger.
- Backdrop uses a semantic overlay token (add to `theme.css`, both themes). Motion uses `--p-motion-*` tokens; respect `prefers-reduced-motion`.
- No nested-card styling inside modal bodies; surface = `--p-color-surface`.

## Responsive

- Mobile: PModal ≤ sm stays centered; md/lg become full-screen. PDrawer becomes full-width. PSheet is the preferred mobile pattern — document when to use which.
- Tablet: PDrawer max-width ~480px; PModal unchanged.
- Footer actions stay reachable (sticky footer when body scrolls).

## Accessibility

- `aria-labelledby` from header, `aria-modal`, focus trapped, focus restored on close.
- PSheet drag handle is decorative-plus-button: closable by keyboard too.

## Stories

Each: default, long scrolling content, with form, destructive confirm (modal), mobile viewport, dark theme.

## Tests

Playwright: focus trap + restore, esc close, scroll lock, full-screen behavior at mobile width, axe pass.
