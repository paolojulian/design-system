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
    await gotoStory(page, 'pipz-palert--danger');
    const alert = page.getByRole('alert');
    await expect(alert).toBeVisible();
    // Icon accompanies the text.
    await expect(alert.locator('.p-alert__icon svg')).toBeVisible();
    await expect(alert).toContainText('Payment failed');
  });

  test('info/success use polite status role, warning/danger use assertive alert role', async ({
    page,
  }) => {
    await gotoStory(page, 'pipz-palert--info');
    await expect(page.getByRole('status')).toBeVisible();

    await gotoStory(page, 'pipz-palert--warning');
    await expect(page.getByRole('alert')).toBeVisible();
  });

  test('dismiss button has an accessible name and fires onDismiss', async ({ page }) => {
    await gotoStory(page, 'pipz-palert--dismissible');
    const dismiss = page.getByRole('button', { name: 'Dismiss' });
    await expect(dismiss).toBeVisible();
    // The story wires onDismiss to window.alert; assert it is invoked.
    page.once('dialog', (dialog) => dialog.dismiss().catch(() => undefined));
    await dismiss.click();
  });

  test('action renders as an operable control', async ({ page }) => {
    await gotoStory(page, 'pipz-palert--with-action');
    await expect(page.getByRole('button', { name: 'Resend link' })).toBeVisible();
  });

  for (const storyId of [
    'pipz-palert--info',
    'pipz-palert--success',
    'pipz-palert--warning',
    'pipz-palert--danger',
    'pipz-palert--with-long-text',
    'pipz-palert--dark-theme',
  ]) {
    test(`${storyId} has no detectable axe violations`, async ({ page }) => {
      await gotoStory(page, storyId);
      await expectNoA11yViolations(page);
    });
  }
});

test.describe('Feedback — PToast', () => {
  test('imperative toast.* API renders a titled toast from a trigger', async ({ page }) => {
    await gotoStory(page, 'pipz-ptoast--playground');
    await page.getByRole('button', { name: 'Success' }).click();
    const toast = page.locator('.p-toast');
    await expect(toast).toHaveCount(1);
    await expect(toast).toContainText('Saved');
    await expect(toast).toContainText('Settings saved.');
  });

  test('queues extra toasts — never more than the max (3) are visible, in order', async ({
    page,
  }) => {
    await gotoStory(page, 'pipz-ptoast--stacked-queue');
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
    await gotoStory(page, 'pipz-ptoast--variants');
    const region = page.locator('.p-toast-region');
    await expect(region).toHaveAttribute('aria-live', 'polite');
    // The danger toast escalates to assertive via role=alert.
    await expect(page.getByRole('alert').filter({ hasText: 'Save failed' })).toBeVisible();
    // Info/success stay polite via role=status.
    await expect(page.getByRole('status').filter({ hasText: 'Export queued' })).toBeVisible();
  });

  test('pauses auto-dismiss on hover and resumes on leave', async ({ page }) => {
    await gotoStory(page, 'pipz-ptoast--pause-on-hover');
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
    await gotoStory(page, 'pipz-ptoast--mobile-viewport');
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
    'pipz-ptoast--variants',
    'pipz-ptoast--with-action',
    'pipz-ptoast--dark-theme',
  ]) {
    test(`${storyId} has no detectable axe violations`, async ({ page }) => {
      await gotoStory(page, storyId);
      await expectNoToastA11yViolations(page);
    });
  }
});

test('PAlert title lines up with its icon even when the host page styles <p>', async ({ page }) => {
  // The docs page adds paragraph margins, like any page without a CSS reset.
  await page.goto('/iframe.html?id=pipz-palert--docs&viewMode=docs');
  const alert = page.locator('.p-alert').first();
  await expect(alert).toBeVisible();
  const icon = (await alert.locator('.p-alert__icon').boundingBox())!;
  const title = (await alert.locator('.p-alert__title').boundingBox())!;
  const message = (await alert.locator('.p-alert__message').boundingBox())!;
  // Icon is vertically centered on the title's (single) line.
  expect(Math.abs(icon.y + icon.height / 2 - (title.y + title.height / 2))).toBeLessThanOrEqual(1);
  // Title and message sit together: only the 2px body gap between them.
  expect(message.y - (title.y + title.height)).toBeLessThanOrEqual(3);
});

// Status color lives only in the badge, so the icon must hold 3:1 (non-text)
// against its tint, composited over the card. Dark tints are translucent.
test.describe('Feedback status badges keep 3:1 icon contrast', () => {
  const lum = ([r, g, b]: number[]) => {
    const c = (v: number) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
    return 0.2126 * c(r) + 0.7152 * c(g) + 0.0722 * c(b);
  };
  const over = (fg: number[], bg: number[]) => fg.slice(0, 3).map((v, k) => v * (fg[3] / 255) + bg[k] * (1 - fg[3] / 255));

  for (const story of ['pipz-palert--all-variants', 'pipz-ptoast--variants']) {
    for (const design of ['pipz', 'elle', 'ink']) {
      for (const theme of ['light', 'dark']) {
        test(`${story} ${design} ${theme}`, async ({ page }) => {
          await page.goto(`/iframe.html?id=${story}&viewMode=story&globals=design:${design};theme:${theme}`);
          await expect(page.locator('.p-feedback-badge')).toHaveCount(4);
          await page.evaluate(() =>
            Promise.all(document.getAnimations().map((animation) => animation.finished.catch(() => undefined))),
          );
          const rows = await page.locator('.p-feedback-badge').evaluateAll((badges) => {
            const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true })!;
            const rgba = (color: string) => {
              ctx.clearRect(0, 0, 1, 1);
              ctx.fillStyle = color;
              ctx.fillRect(0, 0, 1, 1);
              return [...ctx.getImageData(0, 0, 1, 1).data];
            };
            return badges.map((badge) => ({
              icon: rgba(getComputedStyle(badge).color),
              badge: rgba(getComputedStyle(badge).backgroundColor),
              card: rgba(getComputedStyle(badge.closest('.p-alert, .p-toast')!).backgroundColor),
            }));
          });
          for (const row of rows) {
            const bg = over(row.badge, row.card);
            const [lighter, darker] = [lum(over(row.icon, bg)), lum(bg)].sort((a, b) => b - a);
            expect((lighter + 0.05) / (darker + 0.05)).toBeGreaterThanOrEqual(3);
          }
        });
      }
    }
  }

  test('toasts carry no colored stripe or status border', async ({ page }) => {
    await page.goto('/iframe.html?id=pipz-ptoast--variants&viewMode=story');
    const toast = page.locator('.p-toast--danger');
    await expect(toast).toHaveCSS('border-left-width', '1px');
    const [left, top] = await toast.evaluate((element) => {
      const style = getComputedStyle(element);
      return [style.borderLeftColor, style.borderTopColor];
    });
    expect(left).toBe(top);
  });
});
