import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';
import { getClickedRange, getDragRange, spansBlockedDate } from '../../src/components/PDateRangePicker/rangeSelection';

const d = (day: number, month = 10) => new Date(2026, month, day); // month 10 = November
const nov1or2 = (date: Date) => date.getMonth() === 10 && (date.getDate() === 1 || date.getDate() === 2);

test.describe('blocked-date rules (pure)', () => {
  test('a range spanning a blocked day is detected', () => {
    expect(spansBlockedDate({ start: new Date(2026, 9, 30), end: d(3) }, nov1or2)).toBe(true);
    expect(spansBlockedDate({ start: d(3), end: d(9) }, nov1or2)).toBe(false);
  });

  test('clicks: a blocked day is ignored; spanning one starts a new range there', () => {
    const range = { start: new Date(2026, 9, 27), end: new Date(2026, 9, 30) };
    expect(getClickedRange(range, d(1), nov1or2)).toBeNull();
    expect(getClickedRange(range, d(5), nov1or2)).toEqual({ start: d(5), end: null });
    expect(getClickedRange(range, new Date(2026, 9, 31), nov1or2)).toEqual({
      start: new Date(2026, 9, 27),
      end: new Date(2026, 9, 31),
    });
  });

  test('drags stop at the last free day before a blocked one, in both directions', () => {
    expect(getDragRange(new Date(2026, 9, 29), d(5), nov1or2)).toEqual({ start: new Date(2026, 9, 29), end: new Date(2026, 9, 31) });
    expect(getDragRange(d(6), new Date(2026, 9, 28), nov1or2)).toEqual({ start: d(3), end: d(6) });
  });
});

const storyUrl = (id: string) => `/iframe.html?id=${id}&viewMode=story`;
const cell = (page: Page, label: string) => page.getByRole('gridcell', { name: label });
const NOV_1 = 'Sunday, November 1, 2026';
const NOV_2 = 'Monday, November 2, 2026';

async function expectBlocked(page: Page, label: string) {
  const day = cell(page, label);
  await expect(day).toHaveAttribute('aria-disabled', 'true');
  // Hatched: diagonal stripes over a tinted fill, readable without color.
  await expect(day).toHaveCSS('background-image', /repeating-linear-gradient/);
  await expect(day).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect(day).toHaveCSS('cursor', 'not-allowed');
}

test.describe('PDateRangePicker blocked dates', () => {
  test.use({ viewport: { width: 1280, height: 1000 } });

  async function open(page: Page) {
    await page.goto(storyUrl('pipz-pdaterangepicker--blocked-dates'));
    await page.getByRole('button', { name: /Check-in – Check-out/ }).click();
    await expect(page.getByRole('grid', { name: 'November 2026' })).toBeVisible();
  }
  const value = (page: Page) => page.locator('.p-date-range-picker__trigger-value');

  test('Nov 1 and Nov 2 look blocked (hatched) and clicks on them do nothing', async ({ page }) => {
    await open(page);
    await expectBlocked(page, NOV_1);
    await expectBlocked(page, NOV_2);
    await cell(page, NOV_1).click({ force: true });
    await expect(value(page)).toHaveText('Oct 27, 2026 - Oct 30, 2026');
  });

  test('a range cannot include a blocked day', async ({ page }) => {
    await open(page);
    await cell(page, 'Saturday, October 31, 2026').click();
    await expect(value(page)).toHaveText('Oct 27, 2026 - Oct 31, 2026');
    // Past the block: starts a new range instead of spanning Nov 1–2.
    await cell(page, 'Thursday, November 5, 2026').click();
    await expect(value(page)).toHaveText('Nov 5, 2026 -');
  });

  test('a drag across the block stops at the last free day', async ({ page }) => {
    await open(page);
    await page.getByRole('button', { name: 'Clear dates' }).click();
    const from = (await cell(page, 'Thursday, October 29, 2026').boundingBox())!;
    const to = (await cell(page, 'Wednesday, November 4, 2026').boundingBox())!;
    await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
    await page.mouse.down();
    await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 12 });
    await page.mouse.up();
    await expect(value(page)).toHaveText('Oct 29, 2026 - Oct 31, 2026');
  });

  test('the keyboard can reach a blocked day, and Enter on it does nothing', async ({ page }) => {
    await open(page);
    await cell(page, 'Saturday, October 31, 2026').focus();
    await page.keyboard.press('ArrowRight');
    await expect(cell(page, NOV_1)).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(value(page)).toHaveText('Oct 27, 2026 - Oct 30, 2026');
  });

  test('has no axe violations while open', async ({ page }) => {
    await open(page);
    const results = await new AxeBuilder({ page }).disableRules(['region']).analyze();
    expect(results.violations.map((violation) => violation.id)).toEqual([]);
  });
});

test.describe('Single-date and inline calendars with blocked dates', () => {
  test('PDatePicker: blocked days are hatched and cannot be picked', async ({ page }) => {
    await page.goto(storyUrl('pipz-pdatepicker--blocked-dates'));
    await page.getByRole('button', { name: /Delivery date/ }).click();
    await expectBlocked(page, NOV_2);
    await cell(page, NOV_2).click({ force: true });
    await expect(page.getByRole('dialog')).toBeVisible();
    await cell(page, 'Tuesday, November 3, 2026').click();
    await expect(page.getByRole('button', { name: 'Delivery date: Nov 3, 2026' })).toBeVisible();
  });

  test('PDateCalendar: blocked days are hatched and cannot be picked', async ({ page }) => {
    await page.goto(storyUrl('pipz-pdatecalendar--blocked-dates'));
    await expectBlocked(page, NOV_1);
    await cell(page, NOV_1).click({ force: true });
    await expect(page.locator('input[type="hidden"]')).toHaveValue('2026-11-04');
  });

  test('PDateRangeCalendar: blocked days are hatched', async ({ page }) => {
    await page.goto(storyUrl('pipz-pdaterangecalendar--blocked-dates'));
    await expectBlocked(page, NOV_1);
    await expectBlocked(page, NOV_2);
  });
});

test('neighboring blocked days join into one striped block in the range picker', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1000 });
  await page.goto(storyUrl('pipz-pdaterangepicker--blocked-dates'));
  await page.getByRole('button', { name: /Check-in – Check-out/ }).click();
  const first = (await cell(page, NOV_1).boundingBox())!;
  const second = (await cell(page, NOV_2).boundingBox())!;
  expect(Math.round(second.x)).toBe(Math.round(first.x + first.width));
  await expect(cell(page, NOV_1)).toHaveCSS('border-top-right-radius', '0px');
});
