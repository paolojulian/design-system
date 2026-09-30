import { expect, test } from '@playwright/test';
import { expectElleApplied, expectNoAxeViolations, gotoStory } from './elle-helpers';

const tabStops = (page: import('@playwright/test').Page) => page.locator('[role="radio"][tabindex="0"]');

test.describe('Elle ESegmentedControl', () => {
  test('is a labelled radiogroup with one checked radio and one tab stop', async ({ page }) => {
    await gotoStory(page, 'elle-esegmentedcontrol--default', undefined, 'light');
    const group = page.getByRole('radiogroup', { name: 'Calendar range' });
    await expect(group.getByRole('radio')).toHaveCount(3);
    await expect(group.getByRole('radio', { name: 'Day' })).toHaveAttribute('aria-checked', 'true');
    await expect(tabStops(page)).toHaveCount(1);
    await expect(tabStops(page)).toHaveAccessibleName('Day');
  });

  test('arrow keys move and select, wrap around, and Home/End jump', async ({ page }) => {
    await gotoStory(page, 'elle-esegmentedcontrol--default', undefined, 'light');
    const radio = (name: string) => page.getByRole('radio', { name });
    await page.keyboard.press('Tab');
    await expect(radio('Day')).toBeFocused();

    await page.keyboard.press('ArrowRight');
    await expect(radio('Week')).toBeFocused();
    await expect(radio('Week')).toHaveAttribute('aria-checked', 'true');
    await expect(radio('Day')).toHaveAttribute('aria-checked', 'false');

    await page.keyboard.press('ArrowDown');
    await expect(radio('Month')).toHaveAttribute('aria-checked', 'true');
    await page.keyboard.press('ArrowRight');
    await expect(radio('Day')).toHaveAttribute('aria-checked', 'true');
    await page.keyboard.press('ArrowLeft');
    await expect(radio('Month')).toBeFocused();

    await page.keyboard.press('Home');
    await expect(radio('Day')).toHaveAttribute('aria-checked', 'true');
    await page.keyboard.press('End');
    await expect(radio('Month')).toHaveAttribute('aria-checked', 'true');
    await expect(tabStops(page)).toHaveCount(1);
  });

  test('disabled options are skipped by keys and clicks', async ({ page }) => {
    await gotoStory(page, 'elle-esegmentedcontrol--with-disabled-option', undefined, 'light');
    const radio = (name: string) => page.getByRole('radio', { name });
    await expect(radio('Week')).toBeDisabled();
    await radio('Day').click();
    await page.keyboard.press('ArrowRight');
    await expect(radio('Month')).toHaveAttribute('aria-checked', 'true');
    await page.keyboard.press('ArrowLeft');
    await expect(radio('Day')).toHaveAttribute('aria-checked', 'true');
    await page.keyboard.press('End');
    await expect(radio('Year')).toHaveAttribute('aria-checked', 'true');
  });

  test('works controlled: the parent owns the value', async ({ page }) => {
    await gotoStory(page, 'elle-esegmentedcontrol--controlled', undefined, 'light');
    await expect(page.getByTestId('readout')).toHaveText('list');
    await page.getByRole('radio', { name: 'Map' }).click();
    await expect(page.getByTestId('readout')).toHaveText('map');
    await expect(page.getByRole('radio', { name: 'Map' })).toHaveAttribute('aria-checked', 'true');
  });

  test('with name, the value is submitted with its form', async ({ page }) => {
    await gotoStory(page, 'elle-esegmentedcontrol--in-form', undefined, 'light');
    await page.getByRole('radio', { name: 'Month' }).click();
    await page.getByRole('button', { name: 'Apply' }).click();
    await expect(page.getByTestId('submitted')).toHaveText('range=month');
  });

  test('the thumb slides under the selected segment and animates only without reduced motion', async ({ page }) => {
    await gotoStory(page, 'elle-esegmentedcontrol--default', undefined, 'light');
    const thumb = page.locator('.e-segmented__thumb');
    const month = page.getByRole('radio', { name: 'Month' });
    await month.click();
    await expect
      .poll(async () => {
        const [a, b] = [(await thumb.boundingBox())!, (await month.boundingBox())!];
        return Math.abs(Math.round(a.x + a.width / 2 - (b.x + b.width / 2)));
      })
      .toBe(0);
    expect(await thumb.evaluate((element) => getComputedStyle(element).transitionProperty)).toContain('transform');

    await page.emulateMedia({ reducedMotion: 'reduce' });
    expect(await thumb.evaluate((element) => getComputedStyle(element).transitionDuration)).toBe('0s');
  });

  test('every segment presents a 44px target', async ({ page }) => {
    await gotoStory(page, 'elle-esegmentedcontrol--sizes', undefined, 'light');
    for (const radio of await page.getByRole('radio').all()) {
      const box = (await radio.boundingBox())!;
      const [top, bottom] = await page.evaluate(
        ([x, y, h]) =>
          [y - 3, y + h + 3].map((pointY) => document.elementFromPoint(x, pointY)?.closest('[role="radio"]')?.id ?? ''),
        [box.x + box.width / 2, box.y, box.height],
      );
      const id = await radio.getAttribute('id');
      if (box.height < 44) {
        expect(top).toBe(id);
        expect(bottom).toBe(id);
      }
    }
  });

  for (const theme of ['light', 'dark'] as const) {
    for (const width of [1280, 390]) {
      test(`passes axe in ${theme} at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await gotoStory(page, 'elle-esegmentedcontrol--default', undefined, theme);
        await expectElleApplied(page, theme);
        await expectNoAxeViolations(page);
      });
    }
  }

  test('the thumb is distinguishable from the track in dark', async ({ page }) => {
    await gotoStory(page, 'elle-esegmentedcontrol--default', undefined, 'dark');
    const [thumb, track] = await Promise.all([
      page.locator('.e-segmented__thumb').evaluate((element) => getComputedStyle(element).backgroundColor),
      page.locator('.e-segmented').evaluate((element) => getComputedStyle(element).backgroundColor),
    ]);
    expect(thumb).not.toBe(track);
  });
});
