import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';

const storyUrl = (id: string) => `/iframe.html?id=${id}&viewMode=story`;
const day = (page: Page, date: number) => page.getByRole('gridcell', { name: new RegExp(`May ${date}, 2026$`) });

async function open(page: Page, id: string) {
  await page.clock.setFixedTime(new Date('2026-05-10T12:00:00'));
  await page.goto(storyUrl(id));
  await expect(page.getByRole('grid').first()).toBeVisible();
}

test.describe('PDateRangeCalendar (inline)', () => {
  test('is on the page with two months, no trigger, and does not take focus', async ({ page }) => {
    await open(page, 'pipz-pdaterangecalendar--default');
    await expect(page.getByRole('group', { name: 'Stay dates' })).toBeVisible();
    await expect(page.getByRole('grid')).toHaveCount(2);
    await expect(page.locator('[aria-haspopup="dialog"]')).toHaveCount(0);
    expect(await page.evaluate(() => document.activeElement?.tagName)).toBe('BODY');
  });

  test('selects with the same rules as the picker and syncs the form inputs', async ({ page }) => {
    await open(page, 'pipz-pdaterangecalendar--empty');
    await day(page, 20).click();
    await day(page, 19).click();
    await day(page, 18).click();
    await day(page, 21).click();
    await expect(page.locator('.p-date-range-picker__summary')).toContainText('4 days');
    const inputs = page.locator('input[type="hidden"]');
    await expect(inputs.nth(0)).toHaveValue('2026-05-18');
    await expect(inputs.nth(1)).toHaveValue('2026-05-21');
  });

  test('drag selects and Clear dates empties', async ({ page }) => {
    await open(page, 'pipz-pdaterangecalendar--empty');
    const from = (await day(page, 5).boundingBox())!;
    const to = (await day(page, 12).boundingBox())!;
    await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
    await page.mouse.down();
    await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 8 });
    await page.mouse.up();
    await expect(page.locator('.p-date-range-picker__summary')).toContainText('8 days');
    await page.getByRole('button', { name: 'Clear dates' }).click();
    await expect(page.locator('.p-date-range-picker__summary')).toContainText('Select a start date');
  });

  test('nights: picking the check-in day again as the check-out is ignored, like Airbnb', async ({ page }) => {
    await open(page, 'pipz-pdaterangecalendar--nights');
    await page.getByRole('button', { name: 'Clear dates' }).click();
    await day(page, 1).click();
    await expect(day(page, 1)).toHaveAttribute('aria-disabled', 'true');
    // Playwright won't click aria-disabled targets; a real user can, and it must be ignored.
    await day(page, 1).click({ force: true });
    const checkIn = page.locator('.p-date-range-picker__edge').nth(0);
    const checkOut = page.locator('.p-date-range-picker__edge').nth(1);
    await expect(checkIn).toContainText('May 1, 2026');
    await expect(checkOut).toContainText('Add date');
    // Still picking the check-out; the next later day ends the stay.
    await day(page, 3).click();
    await expect(page.locator('.p-date-range-picker__summary')).toContainText('2 nights');
    // A day before the check-in still starts over.
    await page.getByRole('button', { name: /^Check-in/ }).click();
    await day(page, 2).click();
    await expect(checkIn).toContainText('May 2, 2026');
  });

  test('days: clicking the start again makes a one-day range', async ({ page }) => {
    await open(page, 'pipz-pdaterangecalendar--empty');
    await day(page, 4).click();
    await expect(day(page, 4)).not.toHaveAttribute('aria-disabled', 'true');
    await day(page, 4).click();
    await expect(page.locator('.p-date-range-picker__summary')).toContainText('1 day');
  });

  test('one month on a phone, filling the width without overflow', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await open(page, 'pipz-pdaterangecalendar--mobile-viewport');
    await expect(page.getByRole('grid')).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
  });

  test('has no axe violations', async ({ page }) => {
    await open(page, 'pipz-pdaterangecalendar--default');
    const results = await new AxeBuilder({ page }).include('#storybook-root').analyze();
    expect(results.violations.map((violation) => violation.id)).toEqual([]);
  });
});

test.describe('PDateCalendar (inline)', () => {
  test('selects on click, keeps the tab stop on the pick, and syncs the input', async ({ page }) => {
    await open(page, 'pipz-pdatecalendar--default');
    expect(await page.evaluate(() => document.activeElement?.tagName)).toBe('BODY');
    await day(page, 15).click();
    await expect(day(page, 15)).toHaveAttribute('aria-selected', 'true');
    await expect(day(page, 15)).toHaveAttribute('tabindex', '0');
    await expect(page.locator('input[type="hidden"]')).toHaveValue('2026-05-15');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Enter');
    await expect(day(page, 16)).toHaveAttribute('aria-selected', 'true');
  });

  test('respects bounds', async ({ page }) => {
    await open(page, 'pipz-pdatecalendar--with-bounds');
    await expect(day(page, 4)).toBeDisabled();
    await expect(day(page, 26)).toBeDisabled();
  });

  test('has no axe violations', async ({ page }) => {
    await open(page, 'pipz-pdatecalendar--default');
    const results = await new AxeBuilder({ page }).include('#storybook-root').analyze();
    expect(results.violations.map((violation) => violation.id)).toEqual([]);
  });
});
