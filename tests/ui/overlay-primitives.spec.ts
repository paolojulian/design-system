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

/** Wait for the enter animation (opacity/scale/translate) to settle. */
async function waitForOverlaySettled(page: Page) {
  await expect(page.locator('.p-overlay__surface').first()).toHaveCSS('opacity', '1');
}

async function expectNoA11yViolations(page: Page) {
  await waitForOverlaySettled(page);
  const results = await new AxeBuilder({ page }).include('#storybook-root').analyze();
  expect(results.violations).toEqual([]);
}

test.describe('Overlay — PModal', () => {
  test('opens from the trigger, moves focus in, and restores it on Esc', async ({ page }) => {
    await gotoStory(page, 'pipz-pmodal--default');
    const trigger = page.getByRole('button', { name: 'Open modal' });

    await trigger.focus();
    await expect(trigger).toBeFocused();
    await trigger.press('Enter');

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await waitForOverlaySettled(page);

    // Focus moved into the dialog when it opened.
    const focusInsideOnOpen = await dialog.evaluate((node) => node.contains(document.activeElement));
    expect(focusInsideOnOpen).toBe(true);

    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeHidden();
    // Focus is restored to the trigger that opened the modal.
    await expect(trigger).toBeFocused();
  });

  test('traps focus inside the dialog while tabbing (native <dialog>)', async ({ page }) => {
    await gotoStory(page, 'pipz-pmodal--with-form');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await waitForOverlaySettled(page);

    // Native Chromium briefly parks focus on <body> at the wrap point before
    // re-entering; it never reaches page controls behind the scrim.
    for (let i = 0; i < 8; i += 1) {
      await page.keyboard.press('Tab');
      const stayedContained = await dialog.evaluate(
        (node) => node.contains(document.activeElement) || document.activeElement === document.body,
      );
      expect(stayedContained).toBe(true);
    }

    // Focus wraps back into the dialog rather than escaping to the page.
    const endsInside = await dialog.evaluate((node) => node.contains(document.activeElement));
    expect(endsInside).toBe(true);
  });

  test('closes via the close button', async ({ page }) => {
    await gotoStory(page, 'pipz-pmodal--with-form');
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page.getByRole('dialog')).toBeHidden();
  });

  test('closes on scrim click but not on surface click', async ({ page }) => {
    await gotoStory(page, 'pipz-pmodal--with-form');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Clicking the surface (on the title) must not close.
    await page.getByRole('heading', { name: 'Invite teammate' }).click();
    await expect(dialog).toBeVisible();

    // Clicking the scrim area (top-left corner of the full-viewport dialog) closes.
    await dialog.click({ position: { x: 4, y: 4 } });
    await expect(page.getByRole('dialog')).toBeHidden();
  });

  test('locks body scroll while open and restores it on close', async ({ page }) => {
    await gotoStory(page, 'pipz-pmodal--with-form');
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');

    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page.getByRole('dialog')).toBeHidden();
    await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  });

  test('renders as alertdialog for destructive confirms', async ({ page }) => {
    await gotoStory(page, 'pipz-pmodal--destructive-confirm');
    await expect(page.getByRole('alertdialog')).toBeVisible();
  });

  test('goes full-screen at mobile width for md/lg sizes', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoStory(page, 'pipz-pmodal--mobile-viewport');
    const surface = page.locator('.p-overlay__surface');
    await expect(surface).toBeVisible();
    await waitForOverlaySettled(page);
    await expect.poll(async () => (await surface.boundingBox())?.width).toBe(390);
    await expect.poll(async () => (await surface.boundingBox())?.height).toBe(844);
  });
});

test.describe('Overlay — PDrawer', () => {
  test('opens, closes on Esc, and is full-width on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoStory(page, 'pipz-pdrawer--default');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await waitForOverlaySettled(page);

    await expect
      .poll(async () => (await page.locator('.p-overlay__surface').boundingBox())?.width)
      .toBe(390);

    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeHidden();
  });
});

test.describe('Overlay — PSheet', () => {
  test('closes from the grab handle by keyboard', async ({ page }) => {
    await gotoStory(page, 'pipz-psheet--default');
    await expect(page.getByRole('dialog')).toBeVisible();

    // The handle is the first control (a real button), reachable and operable by keyboard.
    const handle = page.locator('.p-overlay__handle');
    await handle.focus();
    await expect(handle).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog')).toBeHidden();
  });
});

test.describe('Overlay — accessibility', () => {
  for (const storyId of [
    'pipz-pmodal--long-content',
    'pipz-pmodal--with-form',
    'pipz-pmodal--destructive-confirm',
    'pipz-pmodal--dark-theme',
    'pipz-pdrawer--default',
    'pipz-pdrawer--with-filters',
    'pipz-pdrawer--dark-theme',
    'pipz-psheet--default',
    'pipz-psheet--with-footer',
    'pipz-psheet--dark-theme',
  ]) {
    test(`${storyId} has no detectable axe violations`, async ({ page }) => {
      await gotoStory(page, storyId);
      await expectNoA11yViolations(page);
    });
  }
});
