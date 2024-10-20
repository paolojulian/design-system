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

## Tailwind Config
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
