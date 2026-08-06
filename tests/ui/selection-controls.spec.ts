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

/**
 * Waits for the backgrounds addon's background-color transition to settle.
 *
 * The dark-theme stories get their ground from that addon, which *animates* the
 * change. Sampled mid-transition the body reads as `rgba(17, 17, 17, 0.035)` —
 * near-transparent — so axe composites light-on-light and reports a contrast
 * failure against a color that is never actually painted. This is the same
 * class of bug as the toast fade-in flake: assert the settled state, not a
 * frame partway into it.
 */
async function waitForBackgroundSettled(page: Page) {
  await page.evaluate(() =>
    Promise.all(
      document.body.getAnimations().map((animation) => animation.finished.catch(() => undefined)),
    ),
  );
}

async function expectNoA11yViolations(page: Page) {
  await waitForBackgroundSettled(page);
  const results = await new AxeBuilder({ page }).include('#storybook-root').analyze();
  expect(results.violations).toEqual([]);
}

test.describe('Selection controls — checkbox', () => {
  test('toggles by click and by keyboard', async ({ page }) => {
    await gotoStory(page, 'components-pcheckbox--default');
    const checkbox = page.getByRole('checkbox', { name: 'Email me about account activity' });
    await expect(checkbox).not.toBeChecked();

    await checkbox.click();
    await expect(checkbox).toBeChecked();

    await checkbox.focus();
    await page.keyboard.press('Space');
    await expect(checkbox).not.toBeChecked();
  });

  test('exposes the native indeterminate state', async ({ page }) => {
    await gotoStory(page, 'components-pcheckbox--indeterminate');
    const checkbox = page.getByRole('checkbox', { name: 'Select all rows' });
    await expect(checkbox).toHaveJSProperty('indeterminate', true);

    // Toggling a click clears indeterminate, matching native behavior.
    await checkbox.click();
    await expect(checkbox).toHaveJSProperty('indeterminate', false);
    await expect(checkbox).toBeChecked();
  });

  test('announces errors and wires aria-describedby', async ({ page }) => {
    await gotoStory(page, 'components-pcheckbox--with-error');
    const checkbox = page.getByRole('checkbox', { name: 'Accept the terms and conditions' });
    await expect(checkbox).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByRole('alert')).toHaveText('You must accept the terms to continue.');
  });

  test('keeps a 44px touch target on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoStory(page, 'components-pcheckbox--mobile-viewport');
    const hitArea = page.locator('.p-checkbox__main').first();
    const box = await hitArea.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
  });
});

test.describe('Selection controls — radio group', () => {
  test('moves selection with arrow keys (native radiogroup)', async ({ page }) => {
    await gotoStory(page, 'components-pradiogroup--default');
    await expect(page.getByRole('radiogroup', { name: 'Deployment environment' })).toBeVisible();

    const staging = page.getByRole('radio', { name: 'Staging' });
    const development = page.getByRole('radio', { name: 'Development' });
    const production = page.getByRole('radio', { name: 'Production' });
    await expect(staging).toBeChecked();

    await staging.focus();
    await page.keyboard.press('ArrowDown');
    await expect(development).toBeChecked();
    await expect(staging).not.toBeChecked();

    await page.keyboard.press('ArrowDown');
    await expect(production).toBeChecked();
  });

  test('selects by click and shares a single name', async ({ page }) => {
    await gotoStory(page, 'components-pradiogroup--default');
    const production = page.getByRole('radio', { name: 'Production' });
    await production.click();
    await expect(production).toBeChecked();

    const names = await page
      .getByRole('radio')
      .evaluateAll((radios) => Array.from(new Set(radios.map((r) => (r as HTMLInputElement).name))));
    expect(names).toHaveLength(1);
  });

  test('disables every radio when the group is disabled', async ({ page }) => {
    await gotoStory(page, 'components-pradiogroup--disabled');
    for (const label of ['Production', 'Staging', 'Development']) {
      await expect(page.getByRole('radio', { name: label })).toBeDisabled();
    }
  });

  test('keeps a 44px touch target on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoStory(page, 'components-pradiogroup--mobile-viewport');
    const box = await page.locator('.p-radio').first().boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
  });
});

test.describe('Selection controls — switch', () => {
  test('has switch role and toggles by click and keyboard', async ({ page }) => {
    await gotoStory(page, 'components-pswitch--default');
    const toggle = page.getByRole('switch', { name: 'Enable desktop notifications' });
    await expect(toggle).not.toBeChecked();

    await toggle.click();
    await expect(toggle).toBeChecked();

    await toggle.focus();
    await page.keyboard.press('Space');
    await expect(toggle).not.toBeChecked();
  });

  test('keeps a 44px touch target on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoStory(page, 'components-pswitch--mobile-viewport');
    const box = await page.locator('.p-switch__main').first().boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
  });
});

test.describe('Selection controls — dark theme', () => {
  test('applies the dark theme via story globals', async ({ page }) => {
    await gotoStory(page, 'components-pcheckbox--dark-theme');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });
});

test.describe('Selection controls — accessibility', () => {
  for (const storyId of [
    'components-pcheckbox--default',
    'components-pcheckbox--checked',
    'components-pcheckbox--indeterminate',
    'components-pcheckbox--with-description',
    'components-pcheckbox--disabled',
    'components-pcheckbox--with-error',
    'components-pcheckbox--with-long-label',
    'components-pcheckbox--dark-theme',
    'components-pradiogroup--default',
    'components-pradiogroup--with-description',
    'components-pradiogroup--horizontal',
    'components-pradiogroup--disabled',
    'components-pradiogroup--with-error',
    'components-pradiogroup--with-long-label',
    'components-pradiogroup--dark-theme',
    'components-pswitch--default',
    'components-pswitch--on',
    'components-pswitch--with-description',
    'components-pswitch--disabled',
    'components-pswitch--with-error',
    'components-pswitch--with-long-label',
    'components-pswitch--dark-theme',
  ]) {
    test(`${storyId} has no detectable axe violations`, async ({ page }) => {
      await gotoStory(page, storyId);
      await expectNoA11yViolations(page);
    });
  }
});
