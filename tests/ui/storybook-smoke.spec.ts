import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';

const storyUrl = (id: string) => `/iframe.html?id=${id}&viewMode=story`;

function getCurrentMonthRangeLabel() {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return `${formatter.format(start)} - ${formatter.format(end)}`;
}

async function gotoStory(page: Page, id: string) {
  await page.goto(storyUrl(id));
  await expect(page.locator('#storybook-root')).toBeVisible();
  await expect(page.locator('#storybook-root')).not.toBeEmpty();
  await expect(page.locator('.sb-nopreview')).toBeHidden();
  await expect(page.locator('.sb-errordisplay')).toBeHidden();
}

async function expectNoA11yViolations(page: Page) {
  const results = await new AxeBuilder({ page }).include('#storybook-root').analyze();
  expect(results.violations).toEqual([]);
}

async function expectGridColumnCount(page: Page, selector: string, count: number) {
  const columns = await page
    .locator(selector)
    .first()
    .evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(' ').length);

  expect(columns).toBe(count);
}

async function expectElementWidthAtLeast(page: Page, selector: string, width: number) {
  const box = await page.locator(selector).first().boundingBox();
  expect(box?.width).toBeGreaterThanOrEqual(width);
}

test.describe('Storybook smoke tests', () => {
  test('renders button actions and link semantics', async ({ page }) => {
    await gotoStory(page, 'components-pbutton--primary');
    await expect(page.getByRole('button', { name: 'Button' })).toBeVisible();

    await gotoStory(page, 'components-pbutton--loading');
    const loadingButton = page.getByRole('button', { name: 'Saving' });
    await expect(loadingButton).toBeDisabled();
    await expect(loadingButton).toHaveAttribute('aria-busy', 'true');

    await gotoStory(page, 'components-pbutton--active');
    await expect(page.getByRole('button', { name: 'Current view' })).toHaveAttribute(
      'data-active',
      'true',
    );

    await gotoStory(page, 'components-pbutton--link');
    await expect(page.getByRole('link', { name: 'Open details' })).toBeVisible();
  });

  test('renders badge variants, icons, and truncation', async ({ page }) => {
    await gotoStory(page, 'components-pbadge--default');
    await expect(page.getByText('Active')).toBeVisible();

    const badge = page.locator('.p-badge').first();
    await expect(badge).toHaveCSS('display', 'inline-flex');

    await gotoStory(page, 'components-pbadge--with-icon');
    await expect(page.getByText('Online')).toBeVisible();
    await expect(page.locator('.p-badge__icon')).toHaveCount(1);

    await gotoStory(page, 'components-pbadge--truncated');
    const truncatedBadge = page.locator('.p-badge').first();
    const truncatedBox = await truncatedBadge.boundingBox();
    expect(truncatedBox?.width).toBeLessThanOrEqual(120);
  });

  test('renders the critical typography stories', async ({ page }) => {
    await gotoStory(page, 'components-ptypography--body-wide');
    await expect(page.getByText('AVANT GARDE')).toBeVisible();

    await gotoStory(page, 'components-ptypography--heading');
    await expect(page.getByText('This is a heading')).toBeVisible();

    await gotoStory(page, 'components-ptypography--serif');
    await expect(page.getByText(/Lorem ipsum dolor sit amet/).first()).toBeVisible();
  });

  test('keeps the Serif variant on the enterprise serif contract', async ({ page }) => {
    await gotoStory(page, 'components-ptypography--serif');

    const serifText = page.getByText(/Lorem ipsum dolor sit amet/).first();
    await expect(serifText).toBeVisible();

    const fontFamily = await serifText.evaluate((element) => getComputedStyle(element).fontFamily);
    expect(fontFamily).toContain('Lora');
  });

  test('renders text input states and announces errors', async ({ page }) => {
    await gotoStory(page, 'components-ptextinput--with-error');

    await expect(page.getByLabel('Label')).toBeVisible();
    await expect(page.getByRole('alert')).toHaveText('This field is required.');

    await gotoStory(page, 'components-ptextinput--disabled');
    await expect(page.getByLabel('Label')).toBeDisabled();
  });

  test('renders date picker standard and preset flows', async ({ page }) => {
    await gotoStory(page, 'components-pdatepicker--standard');
    await expect(page.getByLabel('Due date')).toBeVisible();
    await expectElementWidthAtLeast(page, '.p-date-picker', 350);
    await page.getByLabel('Due date').click();
    await expect(page.getByRole('dialog', { name: 'May 2026' })).toBeVisible();
    const selectedDueDate = page.getByRole('gridcell', { name: 'Sunday, May 10, 2026' });
    await expect(selectedDueDate).toHaveAttribute('aria-selected', 'true');
    await expect(selectedDueDate).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('gridcell', { name: 'Monday, May 11, 2026' })).toBeFocused();

    await gotoStory(page, 'components-pdatepicker--with-presets');
    await expect(page.getByRole('group', { name: 'Report date' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Today' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Yesterday' })).toBeVisible();
    await expectGridColumnCount(page, '.p-date-picker__presets', 3);
    await expectElementWidthAtLeast(page, '.p-date-picker', 350);
    await page.getByRole('button', { name: 'Custom' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('gridcell', { name: 'Friday, May 15, 2026' }).click();
    await expect(page.getByRole('button', { name: 'Custom' })).toBeVisible();
    await expect(page.locator('.p-date-picker__label-value')).toHaveText('May 15, 2026');

    await gotoStory(page, 'components-pdatepicker--sample-with-other-fields');
    const ownerBefore = await page.getByLabel('Owner').boundingBox();
    await page.getByRole('button', { name: 'Custom' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    const ownerAfter = await page.getByLabel('Owner').boundingBox();
    expect(ownerAfter?.y).toBeGreaterThan(ownerBefore?.y ?? 0);

    await gotoStory(page, 'components-pdatepicker--alternate-presets');
    await expect(page.getByRole('button', { name: 'Yesterday' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Tomorrow' })).toBeVisible();

    await gotoStory(page, 'components-pdatepicker--presets-only');
    await expect(page.getByRole('button', { name: 'End of month' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Custom' })).toHaveCount(0);
  });

  test('renders date range picker selection and presets', async ({ page }) => {
    await gotoStory(page, 'components-pdaterangepicker--standard');
    await expect(page.getByRole('button', { name: /Report range/ })).toBeVisible();
    await expectElementWidthAtLeast(page, '.p-date-range-picker', 350);
    await page.getByRole('button', { name: /Report range/ }).click();
    await expect(page.getByRole('dialog', { name: 'May 2026' })).toBeVisible();
    const rangeStart = page.getByRole('gridcell', { name: 'Friday, May 1, 2026' });
    await expect(rangeStart).toHaveAttribute('aria-selected', 'true');
    await expect(rangeStart).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('gridcell', { name: 'Friday, May 8, 2026' })).toBeFocused();
    await expect(page.getByRole('gridcell', { name: 'Sunday, May 10, 2026' })).toHaveAttribute(
      'aria-selected',
      'true',
    );

    await gotoStory(page, 'components-pdaterangepicker--empty');
    await page.getByRole('button', { name: /Booking range/ }).click();
    await page.getByRole('gridcell', { name: 'Monday, May 4, 2026' }).click();
    await page.getByRole('gridcell', { name: 'Friday, May 15, 2026' }).click();
    await expect(page.locator('.p-date-range-picker__label-value')).toHaveText(
      'May 4, 2026 - May 15, 2026',
    );

    await gotoStory(page, 'components-pdaterangepicker--with-presets');
    await expect(page.getByRole('group', { name: /Analytics range/ })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Last 7 days' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'This month' })).toBeVisible();
    await expectGridColumnCount(page, '.p-date-range-picker__presets', 3);
    await expectElementWidthAtLeast(page, '.p-date-range-picker', 350);
    await page.getByRole('button', { name: 'This month' }).click();
    await expect(page.locator('.p-date-range-picker__label-value')).toHaveText(
      getCurrentMonthRangeLabel(),
    );
    await page.getByRole('button', { name: 'Custom' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await gotoStory(page, 'components-pdaterangepicker--presets-only');
    await expect(page.getByRole('button', { name: 'Year to date' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Custom' })).toHaveCount(0);
  });

  test('renders textarea states and announces errors', async ({ page }) => {
    await gotoStory(page, 'components-ptextarea--with-error');

    await expect(page.getByLabel('Label')).toBeVisible();
    await expect(page.getByRole('alert')).toHaveText('This field is required.');
  });

  test('loads core controls on a mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoStory(page, 'components-ptextinput--default');

    const input = page.getByLabel('Label');
    await expect(input).toBeVisible();

    const box = await input.boundingBox();
    expect(box?.width).toBeLessThanOrEqual(390);
  });

  test('keeps mobile buttons within the viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoStory(page, 'components-pbutton--mobile');

    const button = page.getByRole('button', { name: 'Review and continue' });
    await expect(button).toBeVisible();

    const box = await button.boundingBox();
    expect(box?.width).toBeLessThanOrEqual(320);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  });

  test('renders a keyboard-focusable horizontal slider with overflow content', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoStory(page, 'components-phorizontalslider--default');

    const scroller = page.getByRole('region', { name: 'Featured content' });
    await expect(scroller).toBeVisible();
    await scroller.focus();
    await expect(scroller).toBeFocused();

    const metrics = await scroller.evaluate((element) => ({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
    }));

    expect(metrics.scrollWidth).toBeGreaterThan(metrics.clientWidth);
    await expect(page.getByRole('listitem')).toHaveCount(6);
  });

  test('renders highlight variants and custom colors', async ({ page }) => {
    await gotoStory(page, 'components-phighlight--hero-use-case');
    await expect(page.getByText('SIMPLE')).toBeVisible();

    const heroHighlight = page.locator('.p-highlight').first();
    await expect(heroHighlight).toHaveCSS('display', 'inline');
    await expect(heroHighlight).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');

    await gotoStory(page, 'components-phighlight--custom-color');
    const customHighlight = page.locator('.p-highlight').first();
    await expect(customHighlight).toHaveText('CUSTOM');
    await expect(customHighlight).toHaveCSS('color', 'rgb(17, 17, 17)');

    await gotoStory(page, 'components-phighlight--custom-background');
    const customBackgroundHighlight = page.locator('.p-highlight').first();
    await expect(customBackgroundHighlight).toHaveText('CUSTOM');
    await expect(customBackgroundHighlight).toHaveCSS('background-color', 'rgb(17, 17, 17)');
    await expect(customBackgroundHighlight).toHaveCSS('color', 'rgb(255, 255, 255)');
  });

  test('renders cards with metadata, description, and interactive semantics', async ({ page }) => {
    await gotoStory(page, 'components-pcard--default');
    await expect(page.getByText('01')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Pipeline overview' })).toBeVisible();
    await expect(page.getByText('A compact summary card for scanning enterprise workflows.')).toBeVisible();

    await gotoStory(page, 'components-pcard--with-metadata');
    await expect(page.getByText('Operations')).toBeVisible();

    await gotoStory(page, 'components-pcard--without-description');
    await expect(page.getByRole('heading', { name: 'Title-only card' })).toBeVisible();
    await expect(page.getByText('A compact summary card for scanning enterprise workflows.')).toHaveCount(0);

    await gotoStory(page, 'components-pcard--custom-width');
    const customWidthCard = await page.locator('.p-card').boundingBox();
    expect(customWidthCard?.width).toBeGreaterThanOrEqual(799);
    expect(customWidthCard?.width).toBeLessThanOrEqual(801);

    await gotoStory(page, 'components-pcard--custom-height');
    const customHeightCard = await page.locator('.p-card').boundingBox();
    expect(customHeightCard?.height).toBeGreaterThanOrEqual(239);
    expect(customHeightCard?.height).toBeLessThanOrEqual(241);

    await gotoStory(page, 'components-pcard--min-sizing');
    const minSizingCard = await page.locator('.p-card').boundingBox();
    expect(minSizingCard?.width).toBeGreaterThanOrEqual(360);
    expect(minSizingCard?.height).toBeGreaterThanOrEqual(220);

    await gotoStory(page, 'components-pcard--interactive');
    await expect(page.getByText('Operations')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Open account summary' })).toBeVisible();
  });
});

test.describe('Storybook accessibility checks', () => {
  for (const storyId of [
    'components-ptypography--body-wide',
    'components-pbadge--default',
    'components-pbadge--variants',
    'components-pbadge--appearances',
    'components-pbadge--with-icon',
    'components-pbutton--primary',
    'components-pbutton--secondary',
    'components-pbutton--danger',
    'components-pbutton--loading',
    'components-pbutton--active',
    'components-pbutton--mobile',
    'components-phighlight--default',
    'components-phighlight--hero-use-case',
    'components-phighlight--custom-color',
    'components-phighlight--custom-background',
    'components-pdatepicker--standard',
    'components-pdatepicker--with-presets',
    'components-pdatepicker--many-presets',
    'components-pdatepicker--presets-only',
    'components-pdatepicker--with-error',
    'components-pdaterangepicker--standard',
    'components-pdaterangepicker--with-presets',
    'components-pdaterangepicker--many-presets',
    'components-pdaterangepicker--presets-only',
    'components-pdaterangepicker--with-error',
    'components-pcard--default',
    'components-pcard--without-description',
    'components-pcard--custom-width',
    'components-pcard--custom-height',
    'components-pcard--min-sizing',
    'components-pcard--interactive',
    'components-phorizontalslider--default',
    'components-ptextinput--default',
    'components-ptextinput--with-error',
    'components-ptextarea--default',
    'components-ptextarea--with-error',
  ]) {
    test(`${storyId} has no detectable axe violations`, async ({ page }) => {
      await gotoStory(page, storyId);
      await expectNoA11yViolations(page);
    });
  }
});
