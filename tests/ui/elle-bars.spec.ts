import { expect, type Page, test } from '@playwright/test';
import { expectElleApplied, expectNoAxeViolations, gotoStory, resolveColors } from './elle-helpers';

/** Playwright has no option for prefers-reduced-transparency; Chromium's DevTools protocol does. */
async function emulateReducedTransparency(page: Page) {
  const session = await page.context().newCDPSession(page);
  await session.send('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-transparency', value: 'reduce' }],
  });
}

const opaqueSurface = async (page: Page) => {
  const { '--p-color-surface': [r, g, b] } = await resolveColors(page, ['--p-color-surface']);
  return `rgb(${r}, ${g}, ${b})`;
};

test.describe('Elle bar material', () => {
  test('is translucent and blurred by default', async ({ page }) => {
    await gotoStory(page, 'elle-etabbar--default', undefined, 'light');
    const bar = page.locator('.e-tabbar');
    expect(await bar.evaluate((element) => getComputedStyle(element).backdropFilter)).toContain('blur(20px)');
    expect(await bar.evaluate((element) => getComputedStyle(element).backgroundColor)).toMatch(/^(rgba|color)\(/);
  });

  test('falls back to the opaque surface under reduced transparency', async ({ page }) => {
    await gotoStory(page, 'elle-etabbar--default', undefined, 'light');
    await emulateReducedTransparency(page);
    const bar = page.locator('.e-tabbar');
    await expect(bar).toHaveCSS('background-color', await opaqueSurface(page));
    await expect(bar).toHaveCSS('backdrop-filter', 'none');
  });

  test('falls back to the opaque surface under more contrast, in dark too', async ({ page }) => {
    await page.emulateMedia({ contrast: 'more' });
    await gotoStory(page, 'elle-enavigationbar--default', undefined, 'dark');
    const bar = page.locator('.e-navbar');
    await expect(bar).toHaveCSS('background-color', await opaqueSurface(page));
    await expect(bar).toHaveCSS('backdrop-filter', 'none');
  });
});

test.describe('Elle ENavigationBar', () => {
  for (const [story, largeTitle] of [
    ['default', false],
    ['large-title', true],
  ] as const) {
    test(`${story}: exactly one heading, in a sticky header`, async ({ page }) => {
      await gotoStory(page, `elle-enavigationbar--${story}`, undefined, 'light');
      const header = page.locator('header.e-navbar');
      await expect(header.getByRole('heading')).toHaveCount(1);
      await expect(header.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(header).toHaveCSS('position', 'sticky');
      await expect(header.locator('.e-navbar__large-title')).toHaveCount(largeTitle ? 1 : 0);
    });
  }

  test('titleAs and sticky={false} are honoured', async ({ page }) => {
    await gotoStory(page, 'elle-enavigationbar--section-heading', undefined, 'light');
    const header = page.locator('header.e-navbar');
    await expect(header.getByRole('heading', { level: 2, name: 'Inbox' })).toBeVisible();
    await expect(header).toHaveCSS('position', 'static');
  });

  test('stays at the top while the page scrolls', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 300 });
    await gotoStory(page, 'elle-enavigationbar--default', undefined, 'light');
    await page.mouse.wheel(0, 400);
    await expect.poll(async () => (await page.locator('header.e-navbar').boundingBox())!.y).toBe(0);
  });

  test('a long title truncates in the bar instead of pushing the actions off', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 400 });
    await gotoStory(page, 'elle-enavigationbar--long-title', undefined, 'light');
    const share = (await page.getByRole('button', { name: 'Share' }).boundingBox())!;
    expect(share.x + share.width).toBeLessThanOrEqual(390);
    await expect(page.getByRole('link', { name: 'Lists' })).toBeVisible();
  });
});

test.describe('Elle ETabBar', () => {
  test('is a named nav; the active item has aria-current and the action color', async ({ page }) => {
    await gotoStory(page, 'elle-etabbar--default', undefined, 'light');
    const nav = page.getByRole('navigation', { name: 'Primary' });
    await expect(nav.getByRole('tablist')).toHaveCount(0);
    const home = nav.getByRole('button', { name: 'Home' });
    await expect(home).toHaveAttribute('aria-current', 'page');
    await expect(home).toHaveCSS('color', 'rgb(0, 102, 204)');
    await expect(nav.locator('[aria-current]')).toHaveCount(1);
  });

  test('button items call onSelect; the badge is part of the name', async ({ page }) => {
    await gotoStory(page, 'elle-etabbar--default', undefined, 'light');
    const inbox = page.getByRole('button', { name: 'Inbox, 3' });
    await inbox.click();
    await expect(page.getByTestId('active')).toHaveText('inbox');
    await expect(inbox).toHaveAttribute('aria-current', 'page');
    await expect(inbox.locator('.e-tabbar__badge')).toHaveText('3');
  });

  test('href items are links; disabled links cannot be followed', async ({ page }) => {
    await gotoStory(page, 'elle-etabbar--links', undefined, 'light');
    const nav = page.getByRole('navigation', { name: 'Primary' });
    await expect(nav.getByRole('link', { name: 'Search' })).toHaveAttribute('aria-current', 'page');
    await expect(nav.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '#home');
    const settings = nav.getByRole('link', { name: 'Settings' });
    await expect(settings).toHaveAttribute('aria-disabled', 'true');
    await expect(settings).not.toHaveAttribute('href', /.*/);
  });

  test('every item is at least 44px; fixed bars pin to the viewport bottom', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoStory(page, 'elle-etabbar--fixed-on-mobile', undefined, 'light');
    for (const item of await page.locator('.e-tabbar__item').all()) {
      const box = (await item.boundingBox())!;
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.width).toBeGreaterThanOrEqual(44);
    }
    const bar = (await page.locator('.e-tabbar').boundingBox())!;
    expect(bar.y + bar.height).toBeCloseTo(844, 0);
    expect(bar.width).toBe(390);
  });
});

test.describe('Elle bars and Settings example: axe', () => {
  const STORIES = [
    'elle-enavigationbar--default',
    'elle-enavigationbar--large-title',
    'elle-etabbar--default',
    'elle-etabbar--links',
    'elle-examples--settings',
  ];
  for (const theme of ['light', 'dark'] as const) {
    for (const width of [1280, 390]) {
      for (const id of STORIES) {
        test(`${id} in ${theme} at ${width}px`, async ({ page }) => {
          await page.setViewportSize({ width, height: 900 });
          await gotoStory(page, id, undefined, theme);
          await expectElleApplied(page, theme);
          await expectNoAxeViolations(page);
        });
      }
    }
  }

  test('Settings composes the full screen from Elle parts', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoStory(page, 'elle-examples--settings', undefined, 'light');
    await expect(page.getByRole('heading', { level: 1, name: 'Settings' })).toBeVisible();
    await expect(page.getByRole('radiogroup', { name: 'Appearance' })).toBeVisible();
    await expect(page.getByRole('switch', { name: 'Airplane Mode' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign Out' })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Primary' })).toBeVisible();
    // The last row is reachable above the fixed tab bar.
    await page.getByRole('button', { name: 'Sign Out' }).scrollIntoViewIfNeeded();
    const signOut = (await page.getByRole('button', { name: 'Sign Out' }).boundingBox())!;
    const bar = (await page.locator('.e-tabbar').boundingBox())!;
    await page.mouse.wheel(0, 2000);
    const settled = (await page.getByRole('button', { name: 'Sign Out' }).boundingBox())!;
    expect(settled.y + settled.height).toBeLessThanOrEqual(bar.y);
    expect(signOut.height).toBeGreaterThanOrEqual(44);
  });
});
