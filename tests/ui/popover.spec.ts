import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';

const storyUrl = (id: string) => `/iframe.html?id=${id}&viewMode=story`;

async function openStory(page: Page, id: string) {
  await page.goto(storyUrl(id));
  await expect(page.locator('#storybook-root')).not.toBeEmpty();
}

const trigger = (page: Page) => page.getByRole('button', { name: 'Filter orders' });
const popover = (page: Page) => page.getByRole('dialog', { name: 'Filter orders' });

test.describe('PPopover', () => {
  test('opens in the top layer, below and start-aligned to its trigger', async ({ page }) => {
    await openStory(page, 'pipz-ppopover--default');
    await expect(popover(page)).toBeVisible();
    expect(await popover(page).evaluate((element) => element.matches(':popover-open'))).toBe(true);

    const anchor = (await trigger(page).boundingBox())!;
    const panel = (await popover(page).boundingBox())!;
    expect(panel.y).toBeGreaterThanOrEqual(anchor.y + anchor.height);
    expect(Math.round(panel.x)).toBe(Math.round(anchor.x));
  });

  test('end alignment lines up the right edges', async ({ page }) => {
    await openStory(page, 'pipz-ppopover--end-aligned');
    const anchor = (await trigger(page).boundingBox())!;
    const panel = (await popover(page).boundingBox())!;
    expect(Math.round(panel.x + panel.width)).toBe(Math.round(anchor.x + anchor.width));
  });

  test('flips above the trigger near the bottom edge', async ({ page }) => {
    await openStory(page, 'pipz-ppopover--flips-above');
    const anchor = (await trigger(page).boundingBox())!;
    const panel = (await popover(page).boundingBox())!;
    expect(panel.y + panel.height).toBeLessThanOrEqual(anchor.y);
    await expect(popover(page)).toHaveAttribute('data-placement', 'top-start');
  });

  test('Escape closes and returns focus to the trigger', async ({ page }) => {
    await openStory(page, 'pipz-ppopover--default');
    await page.getByRole('checkbox', { name: 'Paid' }).focus();
    await page.keyboard.press('Escape');
    await expect(popover(page)).toBeHidden();
    await expect(trigger(page)).toBeFocused();
  });

  test('a press outside closes; a press inside does not', async ({ page }) => {
    await openStory(page, 'pipz-ppopover--default');
    await page.getByRole('checkbox', { name: 'Refunded' }).click();
    await expect(popover(page)).toBeVisible();
    await page.mouse.click(5, 5);
    await expect(popover(page)).toBeHidden();
  });

  test('the trigger toggles instead of closing then reopening', async ({ page }) => {
    await openStory(page, 'pipz-ppopover--default');
    await trigger(page).click();
    await expect(popover(page)).toBeHidden();
    await trigger(page).click();
    await expect(popover(page)).toBeVisible();
  });

  test('tabbing out of the popover closes it', async ({ page }) => {
    await openStory(page, 'pipz-ppopover--default');
    await page.getByRole('button', { name: 'Apply' }).focus();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Export' })).toBeFocused();
    await expect(popover(page)).toBeHidden();
  });

  test('renders as a bottom sheet on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 700 });
    await openStory(page, 'pipz-ppopover--mobile-sheet');
    await expect(popover(page)).toBeVisible();
    await expect(page.locator('dialog.p-overlay--sheet')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Filter orders' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(popover(page)).toBeHidden();
  });

  for (const id of ['pipz-ppopover--default', 'pipz-ppopover--default&globals=theme:dark']) {
    test(`${id} has no axe violations`, async ({ page }) => {
      await openStory(page, id);
      await expect(popover(page)).toBeVisible();
      await page.evaluate(() =>
        Promise.all(document.body.getAnimations().map((animation) => animation.finished.catch(() => undefined))),
      );
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations).toEqual([]);
    });
  }
});

test('when neither side fits it slides fully into the viewport, with nothing scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 300 });
  await page.goto(storyUrl('pipz-ppopover--default'));
  const panel = page.getByRole('dialog', { name: 'Filter orders' });
  await expect(panel).toBeVisible();
  const box = (await panel.boundingBox())!;
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.y + box.height).toBeLessThanOrEqual(300);
  // Fits once shifted, so it is not capped: nothing inside scrolls.
  expect(await panel.evaluate((element) => element.scrollHeight <= element.clientHeight)).toBe(true);
  await expect(page.getByRole('button', { name: 'Apply' })).toBeInViewport();
});

test('taller than the viewport: capped, the body scrolls and the footer stays visible', async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 180 });
  await page.goto(storyUrl('pipz-ppopover--default'));
  const panel = page.getByRole('dialog', { name: 'Filter orders' });
  await expect(panel).toBeVisible();
  const box = (await panel.boundingBox())!;
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.y + box.height).toBeLessThanOrEqual(180);
  await expect(page.getByRole('button', { name: 'Apply' })).toBeInViewport();
});
