import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';

const storyUrl = (id: string) => `/iframe.html?id=${id}&viewMode=story`;

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

  test('renders the critical typography stories', async ({ page }) => {
    await gotoStory(page, 'ptypography--body-wide');
    await expect(page.getByText('AVANT GARDE')).toBeVisible();

    await gotoStory(page, 'ptypography--heading');
    await expect(page.getByText('This is a heading')).toBeVisible();

    await gotoStory(page, 'ptypography--serif');
    await expect(page.getByText(/Lorem ipsum dolor sit amet/).first()).toBeVisible();
  });

  test('keeps the Serif variant on the enterprise serif contract', async ({ page }) => {
    await gotoStory(page, 'ptypography--serif');

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
});

test.describe('Storybook accessibility checks', () => {
  for (const storyId of [
    'ptypography--body-wide',
    'components-pbutton--primary',
    'components-pbutton--secondary',
    'components-pbutton--danger',
    'components-pbutton--loading',
    'components-pbutton--active',
    'components-pbutton--mobile',
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
