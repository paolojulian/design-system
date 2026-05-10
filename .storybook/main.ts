import type { StorybookConfig } from '@storybook/react-vite';
import tailwindcss from '@tailwindcss/vite';
import { mergeConfig, type PluginOption } from 'vite';

const STORYBOOK_EXCLUDED_PLUGIN_NAMES = new Set([
  'p-copy-static-assets',
  'vite:dts',
  'vite-plugin-static-copy:build',
  'vite-plugin-static-copy:serve',
]);

function removeLibraryBuildPlugins(plugins: PluginOption[] = []): PluginOption[] {
  return plugins.flatMap((plugin) => {
    if (!plugin) {
      return [];
    }

    if (Array.isArray(plugin)) {
      return removeLibraryBuildPlugins(plugin);
    }

    if (
      typeof plugin === 'object' &&
      'name' in plugin &&
      STORYBOOK_EXCLUDED_PLUGIN_NAMES.has(plugin.name)
    ) {
      return [];
    }

    return [plugin];
  });
}

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-onboarding',
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@chromatic-com/storybook',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal: async (config) => {
    return mergeConfig({
      ...config,
      plugins: removeLibraryBuildPlugins(config.plugins),
    }, {
      plugins: [tailwindcss()],
    });
  },
};
export default config;
