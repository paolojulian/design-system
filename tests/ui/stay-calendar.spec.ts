import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';

const storyUrl = (id: string) => `/iframe.html?id=${id}&viewMode=story`;
const cell = (page: Page, label: string) => page.getByRole('gridcell', { name: label });
const hidden = (page: Page) => page.locator('input[type="hidden"]');

// The Stay Calendar story: Oct 20–22 (and Nov 5) are booked NIGHTS.
const OCT_17 = 'Saturday, October 17, 2026';
const OCT_19 = 'Monday, October 19, 2026';
const OCT_20 = 'Tuesday, October 20, 2026';
const OCT_21 = 'Wednesday, October 21, 2026';
const OCT_23 = 'Friday, October 23, 2026';
const OCT_25 = 'Sunday, October 25, 2026';
const NOV_10 = 'Tuesday, November 10, 2026';

test.describe('PDateRangeCalendar by night (disabledUnit="night")', () => {
  test.use({ viewport: { width: 1280, height: 1000 } });

  async function open(page: Page) {
    await page.goto(storyUrl('pipz-pdaterangecalendar--stay-calendar'));
    await expect(page.getByRole('grid', { name: 'October 2026' })).toBeVisible();
  }

  test('a booked night cannot start a stay, but its checkout day can', async ({ page }) => {
    await open(page);
    await expect(cell(page, OCT_20)).toHaveAttribute('aria-disabled', 'true');
    await expect(cell(page, OCT_20)).toHaveCSS('background-image', /repeating-linear-gradient/);
    await expect(cell(page, OCT_23)).not.toHaveAttribute('aria-disabled', 'true');
    await cell(page, OCT_20).click({ force: true });
    await expect(hidden(page).first()).toHaveValue('');
  });

  test('once a start is held, the first booked night is offered as the checkout', async ({ page }) => {
    await open(page);
    await cell(page, OCT_17).click();
    await expect(cell(page, OCT_20)).not.toHaveAttribute('aria-disabled', 'true');
    await expect(cell(page, OCT_21)).toHaveAttribute('aria-disabled', 'true');
    // Days past the stay stay ordinary - not hatched.
    await expect(cell(page, NOV_10)).not.toHaveAttribute('aria-disabled', 'true');
    await cell(page, OCT_20).click();
    await expect(page.getByText('3 nights')).toBeVisible();
    await expect(hidden(page).nth(0)).toHaveValue('2026-10-17');
    await expect(hidden(page).nth(1)).toHaveValue('2026-10-20');
  });

  test('a click past the stay starts over there instead of spanning it', async ({ page }) => {
    await open(page);
    await cell(page, OCT_17).click();
    await cell(page, OCT_25).click();
    await expect(hidden(page).nth(0)).toHaveValue('2026-10-25');
    await expect(hidden(page).nth(1)).toHaveValue('');
  });

  test('a drag across the stay stops on the checkout day', async ({ page }) => {
    await open(page);
    const from = (await cell(page, OCT_17).boundingBox())!;
    const to = (await cell(page, OCT_25).boundingBox())!;
    await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
    await page.mouse.down();
    await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 12 });
    await page.mouse.up();
    await expect(hidden(page).nth(0)).toHaveValue('2026-10-17');
    await expect(hidden(page).nth(1)).toHaveValue('2026-10-20');
  });

  test('renderDayContent prints under the number without touching the accessible name', async ({ page }) => {
    await open(page);
    await expect(cell(page, OCT_17)).toContainText('5,200');
    await expect(cell(page, OCT_19)).toContainText('4,500');
    await expect(cell(page, OCT_17).locator('.p-date-range-picker__day-content')).toBeVisible();
  });

  test('has no axe violations', async ({ page }) => {
    await open(page);
    // Page-structure rules describe the Storybook iframe, not the calendar.
    const results = await new AxeBuilder({ page }).disableRules(['region', 'landmark-one-main', 'page-has-heading-one']).analyze();
    expect(results.violations.map((violation) => violation.id)).toEqual([]);
  });
});

test('defaultMonth opens the calendar on that month with nothing selected', async ({ page }) => {
  await page.goto(storyUrl('pipz-pdaterangecalendar--default-month'));
  await expect(page.getByRole('grid', { name: 'March 2027' })).toBeVisible();
  await expect(hidden(page).first()).toHaveValue('');
});
