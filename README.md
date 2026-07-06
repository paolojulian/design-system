# Paolo Julian —Design System

This is my own personal design system used across my websites.
The design system can be accessed here:

- Storybook: [https://design-system.paolojulian.dev]

## Development

This design system is made with Vite, React and TailwindCSS

## Installation
```bash
npm install @paolojulian.dev/design-system
```

### Tailwind Config
```js
// tailwind.config.js
import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';

const config: Pick<Config, 'content' | 'presets' | 'theme'> = {
  presets: [
    require('@paolojulian.dev/design-system/tailwind-config/tailwind.config.js'),
  ],
  content: ['./src/**/*.tsx'],
  theme: {
    extend: {
      // Your custom styles
    },
  },
};

export default config;
```

### Styles
```css
@import '@paolojulian.dev/design-system/style.css';
@import '@paolojulian.dev/design-system/fonts.css';
```

## Design Tokens

The runtime token contract is published through CSS custom properties in `theme.css`.
Use semantic tokens for product UI, then component tokens for focused overrides.

```css
@import '@paolojulian.dev/design-system/theme.css';

.surface {
  background: var(--p-color-surface);
  color: var(--p-color-text);
  border-color: var(--p-color-border);
}
```

The main `style.css` import does not include font files; import `fonts.css` when you want the packaged AvantGarde and Merriweather faces.
Typed token references are also available from the constants entry:

```ts
import { P_TOKENS } from '@paolojulian.dev/design-system/constants';
```

## Theming

Light and dark themes ship as CSS custom-property sets in `theme.css`. Theming
is pure CSS driven by a `data-theme` attribute — the package has no JavaScript
theme provider by design.

### Applying a theme

Set `data-theme` on `<html>` to theme the whole page:

```html
<html data-theme="dark">
```

`data-theme` also scopes to any container, so you can theme a single region
without affecting the rest of the page:

```html
<aside data-theme="dark">
  <!-- dark surfaces, buttons, and inputs inside here only -->
</aside>
```

Supported values are `light` (default) and `dark`.

### Following the OS preference

The package stays CSS-only, so it does not read `prefers-color-scheme` for you —
doing so would fight an explicit `data-theme`. Wire it up on the consumer side:
resolve the stored choice and the OS preference, then write the attribute.

```ts
const stored = localStorage.getItem('theme'); // 'light' | 'dark' | null
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

document.documentElement.setAttribute('data-theme', stored ?? (prefersDark ? 'dark' : 'light'));

// Keep following the OS until the user makes an explicit choice.
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
  if (localStorage.getItem('theme')) return; // stored choice wins
  document.documentElement.setAttribute('data-theme', event.matches ? 'dark' : 'light');
});
```

### Custom branding

The supported override surface is the semantic action and focus tokens. Override
them at `:root` (or any container) and every component follows:

```css
:root {
  --p-color-action-primary: #2563eb;
  --p-color-action-primary-hover: #1d4ed8;
  --p-color-action-primary-subtle: #eff6ff;
  --p-color-focus: #2563eb;
}
```

Do not override base tokens (`--p-color-neutral-*`, `--p-color-brand-*`,
`--p-color-red-*`, and the other raw scales). They are internal inputs to the
semantic layer, not a stable API. For a single component, override that
component's tokens through a class (for example `--p-highlight-bg`) rather than
reaching for base values.

