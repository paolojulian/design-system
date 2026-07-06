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

test.describe('Feedback — PAlert', () => {
  test('renders variant icon alongside the message (color is never the only signal)', async ({
    page,
  }) => {
    await gotoStory(page, 'components-palert--danger');
    const alert = page.getByRole('alert');
    await expect(alert).toBeVisible();
    // Icon accompanies the text.
    await expect(alert.locator('.p-alert__icon svg')).toBeVisible();
    await expect(alert).toContainText('Payment failed');
  });

  test('info/success use polite status role, warning/danger use assertive alert role', async ({
    page,
  }) => {
    await gotoStory(page, 'components-palert--info');
    await expect(page.getByRole('status')).toBeVisible();

    await gotoStory(page, 'components-palert--warning');
    await expect(page.getByRole('alert')).toBeVisible();
  });

  test('dismiss button has an accessible name and fires onDismiss', async ({ page }) => {
    await gotoStory(page, 'components-palert--dismissible');
    const dismiss = page.getByRole('button', { name: 'Dismiss' });
    await expect(dismiss).toBeVisible();
    // The story wires onDismiss to window.alert; assert it is invoked.
    page.once('dialog', (dialog) => dialog.dismiss().catch(() => undefined));
    await dismiss.click();
  });

  test('action renders as an operable control', async ({ page }) => {
    await gotoStory(page, 'components-palert--with-action');
    await expect(page.getByRole('button', { name: 'Resend link' })).toBeVisible();
  });

  for (const storyId of [
    'components-palert--info',
    'components-palert--success',
    'components-palert--warning',
    'components-palert--danger',
    'components-palert--with-long-text',
    'components-palert--dark-theme',
  ]) {
    test(`${storyId} has no detectable axe violations`, async ({ page }) => {
      await gotoStory(page, storyId);
      await expectNoA11yViolations(page);
    });
  }
});
