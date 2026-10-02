import { defineConfig } from 'vitest/config';

// Standalone: the Vite build config carries dts, Tailwind and asset-copy
// plugins that have no business in a unit run.
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    environment: 'node',
  },
});
