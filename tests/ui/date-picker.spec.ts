import { expect, type Page, test } from '@playwright/test';

const storyUrl = (id: string) => `/iframe.html?id=${id}&viewMode=story`;

async function openStandard(page: Page) {
  await page.goto(storyUrl('pipz-pdatepicker--standard'));
  await page.getByRole('button', { name: /Due date/ }).click();
  await expect(page.getByRole('dialog', { name: 'Due date' })).toBeVisible();
}

test.describe('PDatePicker popover', () => {
  test('floats in the top layer without moving the page', async ({ page }) => {
    await page.goto(storyUrl('pipz-pdatepicker--standard'));
    const trigger = page.getByRole('button', { name: /Due date/ });
    const before = await trigger.boundingBox();
    await trigger.click();
    const panel = page.getByRole('dialog', { name: 'Due date' });
    expect(await panel.evaluate((element) => element.matches(':popover-open'))).toBe(true);
    expect(await trigger.boundingBox()).toEqual(before);
  });

  test('selecting a date closes and returns focus to the trigger', async ({ page }) => {
    await openStandard(page);
    await page.getByRole('gridcell', { name: 'Friday, May 15, 2026' }).click();
    await expect(page.getByRole('dialog')).toBeHidden();
    await expect(page.getByRole('button', { name: 'Due date: May 15, 2026' })).toBeFocused();
  });

  test('Escape and a press outside both close', async ({ page }) => {
    await openStandard(page);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeHidden();
    await expect(page.getByRole('button', { name: /Due date/ })).toBeFocused();
    await page.getByRole('button', { name: /Due date/ }).click();
    await page.mouse.click(5, 5);
    await expect(page.getByRole('dialog')).toBeHidden();
  });

  test('renders as a bottom sheet on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 740 });
    await openStandard(page);
    await expect(page.locator('dialog.p-overlay--sheet')).toBeVisible();
    await expect(page.getByRole('gridcell', { name: 'Sunday, May 10, 2026' })).toBeFocused();
    await page.getByRole('gridcell', { name: 'Friday, May 15, 2026' }).click();
    await expect(page.getByRole('dialog')).toBeHidden();
    await expect(page.getByRole('button', { name: 'Due date: May 15, 2026' })).toBeVisible();
  });
});
