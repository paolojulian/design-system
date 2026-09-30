/// <reference types="vite/client" />
import '../src/fonts.css';
import '../src/index.css';
// After index.css: Elle and Ink re-value the tokens theme.css declares.
import '../src/theme-elle.css';
import '../src/theme-ink.css';
import type { Decorator, Preview } from '@storybook/react';

type ThemePreference = 'light' | 'dark' | 'system';

const DARK_QUERY = '(prefers-color-scheme: dark)';
let themePreference: ThemePreference = 'system';
let isFollowingSystem = false;

const toThemePreference = (value: unknown): ThemePreference =>
  value === 'light' || value === 'dark' ? value : 'system';

// `system` is a preference, never an attribute value: theme.css only knows
// `light` and `dark`, so the OS setting is resolved before it is written.
const applyTheme = () => {
  const theme =
    themePreference === 'system'
      ? window.matchMedia(DARK_QUERY).matches
        ? 'dark'
        : 'light'
      : themePreference;
  document.documentElement.setAttribute('data-theme', theme);
};

const withTheme: Decorator = (Story, context) => {
  themePreference = toThemePreference(context.globals.theme);
  if (typeof document !== 'undefined') {
    // Design language is a second axis, independent of light/dark. Pipz is the
    // default and needs no attribute, so its stories render exactly as before.
    const design = context.globals.design;
    if (design === 'elle' || design === 'ink') {
      document.documentElement.setAttribute('data-design', design);
    } else {
      document.documentElement.removeAttribute('data-design');
    }
    if (!isFollowingSystem) {
      // Registered once; re-resolves live when the OS flips while on `system`.
      window.matchMedia(DARK_QUERY).addEventListener('change', applyTheme);
      isFollowingSystem = true;
    }
    applyTheme();
  }
  return Story();
};

const preview: Preview = {
  initialGlobals: {
    theme: 'system',
    design: 'pipz',
  },
  globalTypes: {
    design: {
      description: 'Design language applied via data-design on <html>',
      toolbar: {
        title: 'Design',
        icon: 'paintbrush',
        items: [
          { value: 'pipz', title: 'Pipz' },
          { value: 'elle', title: 'Elle' },
          { value: 'ink', title: 'Ink' },
        ],
        dynamicTitle: true,
      },
    },
    theme: {
      description: 'Design-system theme applied via data-theme on <html>; System follows the OS',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'system', title: 'System', icon: 'browser' },
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
