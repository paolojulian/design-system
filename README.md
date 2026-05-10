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

Theme switching is controlled with `data-theme="light"` or `data-theme="dark"`.
The main `style.css` import does not include font files; import `fonts.css` when you want the packaged AvantGarde and Merriweather faces.
Typed token references are also available from the constants entry:

```ts
import { P_TOKENS } from '@paolojulian.dev/design-system/constants';
```
