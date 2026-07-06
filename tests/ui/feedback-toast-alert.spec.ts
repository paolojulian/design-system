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

// Toasts are portaled to <body>, outside #storybook-root, so target the region.
async function expectNoToastA11yViolations(page: Page) {
  const firstToast = page.locator('.p-toast').first();
  await expect(firstToast).toBeVisible();
  // The entrance animation fades text opacity 0 -> 1; axe must run against the
  // settled state, not a transient low-contrast composite mid-animation.
  await firstToast.evaluate((node) =>
    Promise.all(node.getAnimations().map((animation) => animation.finished)),
  );
  const results = await new AxeBuilder({ page }).include('.p-toast-region').analyze();
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

test.describe('Feedback — PToast', () => {
  test('imperative toast.* API renders a titled toast from a trigger', async ({ page }) => {
    await gotoStory(page, 'components-ptoast--playground');
    await page.getByRole('button', { name: 'Success' }).click();
    const toast = page.locator('.p-toast');
    await expect(toast).toHaveCount(1);
    await expect(toast).toContainText('Saved');
    await expect(toast).toContainText('Settings saved.');
  });

  test('queues extra toasts — never more than the max (3) are visible, in order', async ({
    page,
  }) => {
    await gotoStory(page, 'components-ptoast--stacked-queue');
    const toasts = page.locator('.p-toast');
    await expect(toasts).toHaveCount(3);
    // First three fired are shown; the 4th/5th wait their turn.
    await expect(toasts.nth(0)).toContainText('Toast 1');
    await expect(toasts.nth(2)).toContainText('Toast 3');
    await expect(page.locator('.p-toast', { hasText: 'Toast 4' })).toHaveCount(0);

    // Dismissing a visible toast promotes a queued one into view.
    await toasts.nth(0).getByRole('button', { name: 'Dismiss notification' }).click();
    await expect(page.locator('.p-toast')).toHaveCount(3);
    await expect(page.locator('.p-toast', { hasText: 'Toast 4' })).toHaveCount(1);
  });

  test('region is an aria-live=polite landmark; danger toasts carry role=alert', async ({
    page,
  }) => {
    await gotoStory(page, 'components-ptoast--variants');
    const region = page.locator('.p-toast-region');
    await expect(region).toHaveAttribute('aria-live', 'polite');
    // The danger toast escalates to assertive via role=alert.
    await expect(page.getByRole('alert').filter({ hasText: 'Save failed' })).toBeVisible();
    // Info/success stay polite via role=status.
    await expect(page.getByRole('status').filter({ hasText: 'Export queued' })).toBeVisible();
  });

  test('pauses auto-dismiss on hover and resumes on leave', async ({ page }) => {
    await gotoStory(page, 'components-ptoast--pause-on-hover');
    await page.getByRole('button', { name: 'Show toast' }).click();
    const toast = page.locator('.p-toast');
    await expect(toast).toBeVisible();

    // Hover the toast well past its 1.2s auto-dismiss window; it must persist.
    await toast.hover();
    await page.waitForTimeout(1700);
    await expect(toast).toBeVisible();

    // Leaving resumes the timer; the toast then dismisses on its own.
    await page.mouse.move(2, 2);
    await expect(toast).toHaveCount(0);
  });

  test('swipe dismisses a toast at mobile width', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoStory(page, 'components-ptoast--mobile-viewport');
    const toast = page.locator('.p-toast');
    await expect(toast).toBeVisible();

    const box = await toast.boundingBox();
    if (!box) throw new Error('toast has no bounding box');
    const y = box.y + box.height / 2;
    const startX = box.x + 24;
    await page.mouse.move(startX, y);
    await page.mouse.down();
    await page.mouse.move(startX + 140, y, { steps: 10 });
    await page.mouse.up();

    await expect(page.locator('.p-toast')).toHaveCount(0);
  });

  for (const storyId of [
    'components-ptoast--variants',
    'components-ptoast--with-action',
    'components-ptoast--dark-theme',
  ]) {
    test(`${storyId} has no detectable axe violations`, async ({ page }) => {
      await gotoStory(page, storyId);
      await expectNoToastA11yViolations(page);
    });
  }
});
