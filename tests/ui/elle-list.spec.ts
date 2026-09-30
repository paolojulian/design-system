import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { expectElleApplied, expectNoAxeViolations, gotoStory } from './elle-helpers';

test.describe('Elle EList', () => {
  test('renders a list named by its header, one listitem per row', async ({ page }) => {
    await gotoStory(page, 'elle-elist--default', undefined, 'light');
    const list = page.getByRole('list', { name: 'Account' });
    await expect(list).toBeVisible();
    await expect(list.getByRole('listitem')).toHaveCount(3);
    await expect(list.locator('> li')).toHaveCount(3);
  });

  test('href rows are links, onClick rows are buttons, others are static', async ({ page }) => {
    await gotoStory(page, 'elle-elist--row-kinds', undefined, 'light');
    const list = page.getByRole('list', { name: 'Row kinds' });
    await expect(list.getByRole('link', { name: /Privacy/ })).toHaveAttribute('href', '#privacy');
    const button = list.getByRole('button', { name: /Sign out/ });
    await button.click();
    await expect(page.getByTestId('clicks')).toHaveText('1');
    const staticRow = list.getByRole('listitem').filter({ hasText: 'Version' });
    await expect(staticRow.getByRole('link')).toHaveCount(0);
    await expect(staticRow.getByRole('button')).toHaveCount(0);
    await expect(staticRow).toContainText('4.6.6');
  });

  test('interactive rows get a chevron by default; static rows get none', async ({ page }) => {
    await gotoStory(page, 'elle-elist--row-kinds', undefined, 'light');
    const rows = page.getByRole('listitem');
    await expect(rows.filter({ hasText: 'Privacy' }).locator('.e-list-row__chevron')).toHaveCount(1);
    await expect(rows.filter({ hasText: 'Version' }).locator('.e-list-row__chevron')).toHaveCount(0);
  });

  test('every row is at least 44px tall, including at phone width', async ({ page }) => {
    for (const width of [1280, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await gotoStory(page, 'elle-elist--with-icons', undefined, 'light');
      for (const row of await page.locator('.e-list-row__content').all()) {
        expect((await row.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test('separators are inset to the title and absent after the last row', async ({ page }) => {
    await gotoStory(page, 'elle-elist--with-icons', undefined, 'light');
    const bodies = page.locator('.e-list-row__body');
    const count = await bodies.count();
    for (let index = 0; index < count; index += 1) {
      const body = bodies.nth(index);
      const width = await body.evaluate((element) => getComputedStyle(element).borderBottomWidth);
      expect(width, `row ${index}`).toBe(index === count - 1 ? '0px' : '1px');
    }
    const first = page.locator('.e-list-row').first();
    const [bodyBox, titleBox, leadingBox] = await Promise.all([
      first.locator('.e-list-row__body').boundingBox(),
      first.locator('.e-list-row__title').boundingBox(),
      first.locator('.e-list-row__leading').boundingBox(),
    ]);
    expect(bodyBox!.x).toBeCloseTo(titleBox!.x, 0);
    expect(bodyBox!.x).toBeGreaterThan(leadingBox!.x + leadingBox!.width);
  });

  test('a row with a trailing switch is not itself interactive, and the switch works', async ({ page }) => {
    await gotoStory(page, 'elle-elist--with-switch', undefined, 'light');
    const row = page.getByRole('listitem').filter({ hasText: 'Airplane Mode' });
    await expect(row.getByRole('button')).toHaveCount(0);
    await expect(row.getByRole('link')).toHaveCount(0);
    const toggle = row.getByRole('switch', { name: 'Airplane Mode' });
    await expect(toggle).not.toBeChecked();
    await toggle.click();
    await expect(toggle).toBeChecked();
    const results = await new AxeBuilder({ page }).include('#storybook-root').withRules(['nested-interactive']).analyze();
    expect(results.violations).toEqual([]);
  });

  // The dev-time console.error is stripped here: the static build is a production
  // build (import.meta.env.DEV is false), which is also what consumers get.
  test('conflicting trailing + onClick renders the safe static row', async ({ page }) => {
    await gotoStory(page, 'elle-elist--conflicting-props', undefined, 'light');
    const row = page.getByRole('listitem').filter({ hasText: 'Bluetooth' });
    await expect(row.getByRole('switch')).toBeVisible();
    await expect(row.getByRole('button')).toHaveCount(0);
  });

  test('destructive rows use the danger color; disabled rows cannot be activated', async ({ page }) => {
    await gotoStory(page, 'elle-elist--row-kinds', undefined, 'light');
    const destructive = page.getByRole('button', { name: /Sign out/ }).locator('.e-list-row__title');
    await expect(destructive).toHaveCSS('color', 'rgb(214, 19, 41)');
    await expect(page.getByRole('button', { name: /Export data/ })).toBeDisabled();
  });

  test('inset={false} runs edge to edge without a radius', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await gotoStory(page, 'elle-elist--edge-to-edge', undefined, 'light');
    const group = page.locator('.e-list__group');
    await expect(group).toHaveCSS('border-radius', '0px');
    expect((await group.boundingBox())!.width).toBe(390);
  });

  for (const theme of ['light', 'dark'] as const) {
    for (const story of ['with-icons', 'with-switch', 'row-kinds', 'long-text']) {
      test(`${story} passes axe in ${theme}`, async ({ page }) => {
        await gotoStory(page, `elle-elist--${story}`, undefined, theme);
        await expectElleApplied(page, theme);
        await expectNoAxeViolations(page);
      });
    }
  }
});
