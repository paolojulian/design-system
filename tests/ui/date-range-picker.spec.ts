import { expect, type Page, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { contrast, type Design, gotoStory, type Rgba, TEXT, type Theme } from './elle-helpers';

const storyUrl = (id: string) => `/iframe.html?id=${id}&viewMode=story`;

async function openStory(page: Page, id: string, trigger: RegExp) {
  // Stories without a defaultValue open on the current month; pin it to May 2026.
  await page.clock.setFixedTime(new Date('2026-05-10T12:00:00'));
  await page.goto(storyUrl(id));
  await page.getByRole('button', { name: trigger }).click();
  await expect(page.getByRole('grid', { name: 'May 2026' })).toBeVisible();
}

const day = (page: Page, date: number) =>
  page.getByRole('gridcell', { name: new RegExp(`May ${date}, 2026$`) });

async function clickDays(page: Page, dates: number[]) {
  for (const date of dates) {
    await day(page, date).click();
  }
}

async function dragDays(page: Page, from: number, to: number) {
  const start = await day(page, from).boundingBox();
  const end = await day(page, to).boundingBox();

  if (!start || !end) {
    throw new Error('Day cell is not visible');
  }

  await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2);
  await page.mouse.down();
  await page.mouse.move(end.x + end.width / 2, end.y + end.height / 2, { steps: 8 });
  await page.mouse.up();
}

const value = (page: Page) => page.locator('.p-date-range-picker__trigger-value');

test.describe('PDateRangePicker selection', () => {
  // Tall enough that the popover is not height-capped, so every day is on screen to drag across.
  test.use({ viewport: { width: 1280, height: 1000 } });

  // Airbnb's react-dates rules: after the start, clicks set the end; a click
  // before the start becomes the new start and clears the end.
  const cases: Array<{ clicks: number[]; expected: string }> = [
    { clicks: [1, 2, 3], expected: 'May 1, 2026 - May 3, 2026' },
    { clicks: [20, 19, 18, 21], expected: 'May 18, 2026 - May 21, 2026' },
    { clicks: [2, 3, 1], expected: 'May 1, 2026 -' },
    { clicks: [2, 1], expected: 'May 1, 2026 -' },
    { clicks: [1, 5, 3], expected: 'May 1, 2026 - May 3, 2026' },
    { clicks: [4, 4], expected: 'May 4, 2026 - May 4, 2026' },
  ];

  for (const { clicks, expected } of cases) {
    test(`clicking ${clicks.join(', ')} selects ${expected}`, async ({ page }) => {
      await openStory(page, 'pipz-pdaterangepicker--empty', /Booking range/);
      await clickDays(page, clicks);
      await expect(value(page)).toHaveText(expected);
      // The calendar stays open so the range can keep growing.
      await expect(page.getByRole('dialog')).toBeVisible();
    });
  }

  test('the Start date field makes the next click move the start', async ({ page }) => {
    await openStory(page, 'pipz-pdaterangepicker--empty', /Booking range/);
    await clickDays(page, [1, 5]);
    const startField = page.getByRole('button', { name: /Start date/ });
    await startField.click();
    await expect(startField).toHaveAttribute('aria-pressed', 'true');
    await day(page, 3).click();
    await expect(value(page)).toHaveText('May 3, 2026 - May 5, 2026');
    // Picking the start hands over to the end.
    await expect(page.getByRole('button', { name: /End date/ })).toHaveAttribute('aria-pressed', 'true');

    // A new start after the end clears the end.
    await startField.click();
    await day(page, 8).click();
    await expect(value(page)).toHaveText('May 8, 2026 -');
  });

  test('reopening a complete range starts on the start date, like Check-in', async ({ page }) => {
    await openStory(page, 'pipz-pdaterangepicker--standard', /Report range/);
    await expect(page.getByRole('button', { name: /Start date/ })).toHaveAttribute('aria-pressed', 'true');
    await day(page, 5).click();
    await expect(value(page)).toHaveText('May 5, 2026 - May 10, 2026');
  });

  test('the End date field waits for a start', async ({ page }) => {
    await openStory(page, 'pipz-pdaterangepicker--empty', /Booking range/);
    await expect(page.getByRole('button', { name: /End date/ })).toBeDisabled();
    await expect(page.getByRole('button', { name: /End date/ })).toContainText('Add date');
  });

  test('dragging across days selects the span', async ({ page }) => {
    await openStory(page, 'pipz-pdaterangepicker--empty', /Booking range/);
    await dragDays(page, 5, 12);
    await expect(value(page)).toHaveText('May 5, 2026 - May 12, 2026');
    await expect(page.locator('.p-date-range-picker__day--in-range')).toHaveCount(6);
  });

  test('dragging backwards selects the same span', async ({ page }) => {
    await openStory(page, 'pipz-pdaterangepicker--empty', /Booking range/);
    await dragDays(page, 12, 5);
    await expect(value(page)).toHaveText('May 5, 2026 - May 12, 2026');
  });

  test('dragging a range edge moves only that edge', async ({ page }) => {
    await openStory(page, 'pipz-pdaterangepicker--standard', /Report range/);
    await dragDays(page, 10, 14);
    await expect(value(page)).toHaveText('May 1, 2026 - May 14, 2026');
    await dragDays(page, 1, 4);
    await expect(value(page)).toHaveText('May 4, 2026 - May 14, 2026');
  });

  test('hovering previews the range a click would select', async ({ page }) => {
    await openStory(page, 'pipz-pdaterangepicker--empty', /Booking range/);
    await day(page, 4).click();
    await day(page, 7).hover();
    await expect(page.locator('.p-date-range-picker__day--preview')).toHaveCount(4);
    await page.mouse.move(0, 0);
    await expect(page.locator('.p-date-range-picker__day--preview')).toHaveCount(0);
  });

  test('Clear dates empties the selection and Done closes', async ({ page }) => {
    await openStory(page, 'pipz-pdaterangepicker--standard', /Report range/);
    await page.getByRole('button', { name: 'Clear dates' }).click();
    await expect(page.locator('.p-date-range-picker__day--selected')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Clear dates' })).toBeDisabled();
    await page.getByRole('button', { name: 'Done' }).click();
    await expect(page.getByRole('dialog')).toBeHidden();
    await expect(page.getByRole('button', { name: /Report range/ })).toBeFocused();
  });

  test('keyboard selection extends the range the same way', async ({ page }) => {
    await openStory(page, 'pipz-pdaterangepicker--empty', /Booking range/);
    // Opens focused on today, May 10.
    await page.keyboard.press('Enter');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Enter');
    await expect(value(page)).toHaveText('May 10, 2026 - May 11, 2026');
    // Before the start: a new start, end cleared.
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('Enter');
    await expect(value(page)).toHaveText('May 4, 2026 -');
  });
});

/** Reads an element's text and background as sRGB through a canvas, so any color syntax compares. */
async function readDayColors(page: Page, date: number): Promise<{ text: Rgba; fill: Rgba; panel: Rgba }> {
  return day(page, date).evaluate((element) => {
    const style = getComputedStyle(element);
    const panel = getComputedStyle(element.closest('.p-popover')!);
    const context = document.createElement('canvas').getContext('2d', { willReadFrequently: true })!;
    const toRgba = (color: string) => {
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = color;
      context.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;
      return [r, g, b, a / 255] as [number, number, number, number];
    };
    return {
      text: toRgba(style.color),
      fill: toRgba(style.backgroundColor),
      panel: toRgba(panel.backgroundColor),
    };
  });
}

test.describe('PDateRangePicker hover keeps day text readable', () => {
  const designs: Design[] = ['pipz', 'elle', 'ink'];
  const themes: Theme[] = ['light', 'dark'];

  for (const design of designs) {
    for (const theme of themes) {
      test(`${design} ${theme}: selected and in-range days on hover`, async ({ page }) => {
        await gotoStory(page, 'pipz-pdaterangepicker--standard', design, theme);
        await page.getByRole('button', { name: /Report range/ }).click();

        // May 1 is a range edge, May 5 sits inside the band.
        for (const date of [1, 5]) {
          await day(page, date).hover();
          await page.waitForTimeout(250); // let the color transition settle
          // Dark themes use a translucent band, so composite over the panel.
          const { text, fill, panel } = await readDayColors(page, date);
          expect(contrast(text, fill, panel), `May ${date} on hover`).toBeGreaterThanOrEqual(TEXT);
        }
      });
    }
  }
});

const grid = (page: Page, name: string) => page.getByRole('grid', { name });
const summary = (page: Page) => page.locator('.p-date-range-picker__summary');

test.describe('PDateRangePicker popover layout', () => {
  test('shows two months side by side on wide screens', async ({ page }) => {
    await openStory(page, 'pipz-pdaterangepicker--empty', /Booking range/);
    await expect(page.getByRole('dialog', { name: 'Booking range' })).toBeVisible();
    const may = (await grid(page, 'May 2026').boundingBox())!;
    const june = (await grid(page, 'June 2026').boundingBox())!;
    expect(june.x).toBeGreaterThan(may.x + may.width);
    expect(Math.round(june.y)).toBe(Math.round(may.y));
    // Days from neighboring months are blank, so each date exists once.
    await expect(page.getByRole('gridcell', { name: 'Monday, June 1, 2026' })).toHaveCount(1);
  });

  test('shows one month between the sm and md breakpoints', async ({ page }) => {
    await page.setViewportSize({ width: 700, height: 800 });
    await openStory(page, 'pipz-pdaterangepicker--empty', /Booking range/);
    await expect(page.getByRole('grid')).toHaveCount(1);
  });

  test('numberOfMonths={1} keeps one month on wide screens', async ({ page }) => {
    await page.goto(storyUrl('pipz-pdaterangepicker--one-month'));
    await page.getByRole('button', { name: /Report range/ }).click();
    await expect(page.getByRole('grid')).toHaveCount(1);
  });

  test('floats over the page inside the viewport', async ({ page }) => {
    await openStory(page, 'pipz-pdaterangepicker--standard', /Report range/);
    const helper = page.locator('.p-date-range-picker__message');
    const before = await helper.boundingBox();
    const panel = (await page.getByRole('dialog', { name: 'Report range' }).boundingBox())!;
    const viewport = page.viewportSize()!;
    expect(panel.x).toBeGreaterThanOrEqual(0);
    expect(panel.x + panel.width).toBeLessThanOrEqual(viewport.width);
    // Opening did not push the content below it down.
    await page.keyboard.press('Escape');
    expect(await helper.boundingBox()).toEqual(before);
  });

  test('a range can span both visible months without the view jumping', async ({ page }) => {
    await openStory(page, 'pipz-pdaterangepicker--empty', /Booking range/);
    await clickDays(page, [30]);
    await page.getByRole('gridcell', { name: /June 2, 2026$/ }).click();
    await expect(value(page)).toHaveText('May 30, 2026 - Jun 2, 2026');
    await expect(grid(page, 'May 2026')).toBeVisible();
  });

  test('keyboard focus shifts the months only past the last visible one', async ({ page }) => {
    await openStory(page, 'pipz-pdaterangepicker--empty', /Booking range/);
    await page.keyboard.press('PageDown');
    await expect(page.getByRole('gridcell', { name: /June 10, 2026$/ })).toBeFocused();
    await expect(grid(page, 'May 2026')).toBeVisible();
    await page.keyboard.press('PageDown');
    await expect(page.getByRole('gridcell', { name: /July 10, 2026$/ })).toBeFocused();
    await expect(grid(page, 'June 2026')).toBeVisible();
    await expect(grid(page, 'July 2026')).toBeVisible();
  });

  test('the summary counts days, updating as the range changes', async ({ page }) => {
    await openStory(page, 'pipz-pdaterangepicker--empty', /Booking range/);
    await expect(summary(page)).toContainText('Select a start date');
    await day(page, 18).click();
    await expect(summary(page)).toContainText('Select an end date');
    await expect(page.getByRole('button', { name: /Start date/ })).toContainText('May 18, 2026');
    await day(page, 21).click();
    await expect(summary(page)).toContainText('4 days');
    await expect(page.getByRole('button', { name: /End date/ })).toContainText('May 21, 2026');
  });

  test('summaryUnit="nights" counts nights', async ({ page }) => {
    await page.goto(storyUrl('pipz-pdaterangepicker--stay'));
    await page.getByRole('button', { name: /Check-in – Check-out/ }).click();
    await expect(summary(page)).toContainText('5 nights');
    await expect(page.getByRole('button', { name: /^Check-in May 18/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Check-out May 23/ })).toBeVisible();
  });

  test('Escape closes and returns focus; a press outside closes', async ({ page }) => {
    await openStory(page, 'pipz-pdaterangepicker--empty', /Booking range/);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeHidden();
    await expect(page.getByRole('button', { name: /Booking range/ })).toBeFocused();
    await page.getByRole('button', { name: /Booking range/ }).click();
    await page.mouse.click(5, 5);
    await expect(page.getByRole('dialog')).toBeHidden();
  });
});

test.describe('PDateRangePicker mobile sheet', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 740 });
  });

  test('opens a bottom sheet of stacked months that selects by tap', async ({ page }) => {
    await openStory(page, 'pipz-pdaterangepicker--empty', /Booking range/);
    await expect(page.locator('dialog.p-overlay--sheet')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Booking range' })).toBeVisible();
    await expect(page.getByRole('grid')).toHaveCount(12);
    // Measure after the sheet's slide-in, not mid-transition.
    await page.evaluate(() =>
      Promise.all(document.getAnimations().map((animation) => animation.finished.catch(() => undefined))),
    );
    const may = (await grid(page, 'May 2026').boundingBox())!;
    const june = (await grid(page, 'June 2026').boundingBox())!;
    expect(june.y).toBeGreaterThan(may.y + may.height);

    await clickDays(page, [20, 19, 18, 21]);
    await expect(value(page)).toHaveText('May 18, 2026 - May 21, 2026');
    await expect(summary(page)).toContainText('4 days');
  });

  test('keeps vertical scrolling and loads more months', async ({ page }) => {
    await openStory(page, 'pipz-pdaterangepicker--empty', /Booking range/);
    await expect(page.locator('.p-date-range-picker__months')).toHaveCSS('touch-action', 'pan-y');
    await page.getByRole('button', { name: 'Show more months' }).click();
    await expect(page.getByRole('grid')).toHaveCount(24);
  });

  test('Done closes the sheet', async ({ page }) => {
    await openStory(page, 'pipz-pdaterangepicker--empty', /Booking range/);
    await page.getByRole('button', { name: 'Done' }).click();
    await expect(page.getByRole('dialog')).toBeHidden();
  });
});

test.describe('Open calendars have no axe violations', () => {
  const cases = [
    { name: 'range popover', id: 'pipz-pdaterangepicker--standard', trigger: /Report range/, width: 1280 },
    // Dark via the Theme toolbar global, as everywhere else in this Storybook.
    { name: 'range popover, dark', id: 'pipz-pdaterangepicker--standard&globals=theme:dark', trigger: /Report range/, width: 1280 },
    { name: 'range sheet', id: 'pipz-pdaterangepicker--mobile-viewport', trigger: /Booking range/, width: 375 },
    { name: 'date popover', id: 'pipz-pdatepicker--standard', trigger: /Due date/, width: 1280 },
    { name: 'date sheet', id: 'pipz-pdatepicker--standard', trigger: /Due date/, width: 375 },
  ];

  for (const { name, id, trigger, width } of cases) {
    test(name, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(storyUrl(id));
      await page.getByRole('button', { name: trigger }).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.evaluate(() =>
        Promise.all(document.getAnimations().map((animation) => animation.finished.catch(() => undefined))),
      );
      // `region` audits the Storybook page (loose helper text), not the component.
      const results = await new AxeBuilder({ page }).disableRules(['region']).analyze();
      expect(results.violations.map((violation) => `${violation.id}: ${violation.nodes[0]?.target}`)).toEqual([]);
    });
  }
});
