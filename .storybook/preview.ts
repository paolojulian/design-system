/// <reference types="vite/client" />
import '../src/fonts.css';
import '../src/index.css';
import type { Decorator, Preview } from '@storybook/react';

const withTheme: Decorator = (Story, context) => {
  const theme = context.globals.theme === 'dark' ? 'dark' : 'light';
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme);
  }
  return Story();
};

const preview: Preview = {
  initialGlobals: {
    theme: 'light',
  },
  globalTypes: {
    theme: {
      description: 'Design-system theme applied via data-theme on <html>',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [withTheme],
  parameters: {
    chromatic: {
      viewports: [390, 768, 1024, 1440],
      // Snapshot every story in both themes so dark-mode regressions are caught.
      modes: {
        light: { theme: 'light' },
        dark: { theme: 'dark' },
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
