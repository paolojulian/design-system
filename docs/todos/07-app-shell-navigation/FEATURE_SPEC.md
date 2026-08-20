# App Shell + Navigation

Goal: the frame every enterprise app needs — sidebar, top bar, mobile nav, breadcrumbs — with the responsive strategy built in, not left to consumers.

## Components

- `PAppShell` — grid composing top bar, nav, content; owns the breakpoint switching.
- `PSidebarNav` — vertical nav with sections, icons, active state, badge counts; collapsible to icon rail.
- `PTopBar` — app title/logo slot, actions slot, menu button on mobile.
- `PBottomNav` — 3–5 items, mobile only.
- `PBreadcrumbs` — links + current page.

## Rules

- Nav components take items as data (`{ label, href, icon, badge }`) and a render-link prop so any router works. No router dependency.
- Active item: `--p-color-action-primary-subtle` background + primary text — the only colored element in the nav.
- Sidebar surface = `--p-color-surface`, single `--p-color-border-subtle` divider against content. No shadows.
- Shell content area provides the page gutter; pages don't add their own.

## Responsive

- Desktop (lg+): full sidebar, breadcrumbs in content.
- Tablet (md): icon rail (labels in tooltips) or drawer — rail is default.
- Mobile: top bar + drawer (PDrawer from 03) or PBottomNav; consumer picks per app. Bottom nav respects safe-area inset.
- Breadcrumbs on mobile: collapse middle items to an ellipsis menu; never wrap to 2 lines.

## Accessibility

- `nav` landmarks with labels; `aria-current="page"` for active items.
- Drawer nav: focus trap + esc (inherited from PDrawer).
- Icon rail items keep accessible names.

## Stories

Full shell at desktop/tablet/mobile viewports with realistic enterprise nav data, collapsed rail, drawer open, bottom-nav variant, deep breadcrumbs, dark theme.

## Tests

Playwright: layout switches at breakpoints, aria-current set, drawer keyboard behavior, breadcrumb collapse at mobile width, axe pass.
