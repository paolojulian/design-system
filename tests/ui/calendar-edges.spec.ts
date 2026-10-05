import { expect, test } from '@playwright/test';

const storyUrl = (id: string) => `/iframe.html?id=${id}&viewMode=story`;

test.describe('PDateRangeCalendar showEdges', () => {
  test('the default calendar prints the Check-in / Check-out fields', async ({ page }) => {
    await page.goto(storyUrl('pipz-pdaterangecalendar--nights'));
    await expect(page.getByText('Check-in', { exact: true })).toBeVisible();
    await expect(page.getByText('5 nights')).toBeVisible();
  });

  test('showEdges={false} drops the fields and keeps the title', async ({ page }) => {
    await page.goto(storyUrl('pipz-pdaterangecalendar--without-edges'));
    await expect(page.getByText('5 nights')).toBeVisible();
    await expect(page.getByText('Check-in', { exact: true })).toHaveCount(0);
    await expect(page.locator('.p-date-range-picker__edges')).toHaveCount(0);
    // Still a working calendar: a later click moves the end and the title follows.
    await page.getByRole('gridcell', { name: 'Monday, May 25, 2026' }).click();
    await expect(page.getByText('7 nights')).toBeVisible();
  });
});

test.describe('PDateRangeCalendar fullWidth', () => {
  test('the default calendar hugs its month', async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 900 });
    await page.goto(storyUrl('pipz-pdaterangecalendar--one-month'));
    const root = page.locator('.p-date-range-picker--inline');
    const width = (await root.boundingBox())!.width;
    expect(width).toBeLessThan(400);
  });

  test('fullWidth takes the whole container', async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 900 });
    await page.goto(storyUrl('pipz-pdaterangecalendar--full-width'));
    const root = page.locator('.p-date-range-picker--inline');
    const container = root.locator('xpath=..');
    const rootBox = (await root.boundingBox())!;
    const containerBox = (await container.boundingBox())!;
    expect(Math.round(rootBox.width)).toBe(Math.round(containerBox.width));
    expect(rootBox.width).toBeGreaterThan(500);
    const grid = page.getByRole('grid');
    expect(Math.round((await grid.boundingBox())!.width)).toBe(Math.round(rootBox.width));
  });
});
