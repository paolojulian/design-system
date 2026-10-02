import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';

const storyUrl = (id: string) => `/iframe.html?id=${id}&viewMode=story`;

async function openStory(page: Page, id: string) {
  await page.goto(storyUrl(id));
  await expect(page.locator('#storybook-root')).not.toBeEmpty();
}

const scroller = (page: Page, name = 'Featured reports') => page.getByRole('region', { name });
const previous = (page: Page) => page.getByRole('button', { name: 'Previous' });
const next = (page: Page) => page.getByRole('button', { name: 'Next' });
const counter = (page: Page) => page.locator('.p-horizontal-slider__counter');

/** Left edge of an item relative to the scroller's snap line. */
async function itemOffset(page: Page, index: number, name?: string) {
  return scroller(page, name).evaluate((element, i) => {
    const item = element.querySelectorAll('li')[i];
    const padding = parseFloat(getComputedStyle(element).scrollPaddingInlineStart) || 0;
    return item.getBoundingClientRect().left - element.getBoundingClientRect().left - padding;
  }, index);
}

test.describe('PHorizontalSlider', () => {
  test('has no controls unless asked for', async ({ page }) => {
    await openStory(page, 'pipz-phorizontalslider--default');
    await expect(page.locator('.p-horizontal-slider__controls')).toHaveCount(0);
  });

  test('starts on the first item with Previous disabled', async ({ page }) => {
    await openStory(page, 'pipz-phorizontalslider--with-controls');
    await expect(counter(page)).toHaveText('1 / 6');
    await expect(previous(page)).toBeDisabled();
    await expect(next(page)).toBeEnabled();
  });

  test('Next brings the following item to the leading edge', async ({ page }) => {
    await openStory(page, 'pipz-phorizontalslider--with-controls');
    await next(page).click();
    await expect(counter(page)).toHaveText('2 / 6');
    await expect.poll(() => itemOffset(page, 1)).toBeLessThan(2);
    await expect(previous(page)).toBeEnabled();
  });

  test('quick presses add up instead of restarting mid-scroll', async ({ page }) => {
    await openStory(page, 'pipz-phorizontalslider--with-controls');
    await next(page).click();
    await next(page).click();
    await expect(counter(page)).toHaveText('3 / 6');
  });

  test('reaching the end shows the last item and disables Next', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openStory(page, 'pipz-phorizontalslider--with-controls');
    for (let i = 0; i < 5; i += 1) {
      await next(page).click();
      await expect(counter(page)).toHaveText(`${i + 2} / 6`);
    }
    await expect(next(page)).toBeDisabled();
    await previous(page).click();
    await expect(next(page)).toBeEnabled();
  });

  test('controls meet the 44px touch target on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openStory(page, 'pipz-phorizontalslider--with-controls');
    const box = (await next(page).boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
  });

  test('steps through items of different widths', async ({ page }) => {
    await openStory(page, 'pipz-phorizontalslider--mixed-content');
    await next(page).click();
    await expect(counter(page)).toHaveText('2 / 7');
    await expect.poll(() => itemOffset(page, 1, 'Stories')).toBeLessThan(2);
    await next(page).click();
    await expect.poll(() => itemOffset(page, 2, 'Stories')).toBeLessThan(2);
  });

  test('passes axe', async ({ page }) => {
    await openStory(page, 'pipz-phorizontalslider--mixed-content');
    const results = await new AxeBuilder({ page }).include('#storybook-root').analyze();
    expect(results.violations).toEqual([]);
  });
});
