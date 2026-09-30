import { defineConfig, devices } from '@playwright/test';

// Overridable so a run can target the static build on its own port instead of
// silently reusing whatever already listens on 6006 (e.g. `npm run storybook`,
// whose dev server orders CSS differently from the production build).
const port = process.env.STORYBOOK_PORT ?? '6006';
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './tests/ui',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'node scripts/serve-storybook.mjs',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
