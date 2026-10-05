import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const storyUrl = (id: string) => `/iframe.html?id=${id}&viewMode=story`;
const radio = (page: import('@playwright/test').Page, name: string) => page.getByRole('radio', { name, exact: true });

test.describe('PSegmentedControl', () => {
  test('is a labelled radiogroup: first option checked, one tab stop, no axe violations', async ({ page }) => {
    await page.goto(storyUrl('pipz-psegmentedcontrol--default'));
    const group = page.getByRole('radiogroup', { name: 'Paid so far' });
    await expect(group.getByRole('radio')).toHaveCount(4);
    await expect(radio(page, '0')).toHaveAttribute('aria-checked', 'true');
    await expect(page.locator('[role="radio"][tabindex="0"]')).toHaveCount(1);
    // The component only: the Storybook frame itself has no landmarks.
    const results = await new AxeBuilder({ page }).include('#storybook-root').analyze();
    expect(results.violations).toEqual([]);
  });

  test('a click selects; arrows move and select; a disabled option is skipped', async ({ page }) => {
    await page.goto(storyUrl('pipz-psegmentedcontrol--one-disabled-option'));
    await radio(page, 'Custom').click();
    await expect(radio(page, 'Custom')).toHaveAttribute('aria-checked', 'true');
    await expect(radio(page, '0')).toHaveAttribute('aria-checked', 'false');

    await page.keyboard.press('ArrowLeft');
    // 50% is disabled, so the move lands on 0.
    await expect(radio(page, '0')).toHaveAttribute('aria-checked', 'true');
    await expect(radio(page, '0')).toBeFocused();
    await page.keyboard.press('End');
    await expect(radio(page, 'Full')).toHaveAttribute('aria-checked', 'true');
  });

  test('fills the chosen segment and takes the form control height', async ({ page }) => {
    await page.goto(storyUrl('pipz-psegmentedcontrol--selected'));
    const checked = radio(page, '50%');
    await expect(checked).toHaveCSS('color', 'rgb(255, 255, 255)');
    const box = (await page.getByRole('radiogroup').boundingBox())!;
    expect(Math.round(box.height)).toBe(44);
  });

  test('posts the value under name, and nothing while disabled', async ({ page }) => {
    await page.goto(storyUrl('pipz-psegmentedcontrol--in-a-form'));
    await expect(page.locator('input[name="paid"]')).toHaveValue('full');
    await radio(page, '50%').click();
    await expect(page.locator('input[name="paid"]')).toHaveValue('half');

    await page.goto(storyUrl('pipz-psegmentedcontrol--disabled'));
    await expect(page.getByRole('radiogroup')).toHaveAttribute('aria-disabled', 'true');
    await expect(radio(page, 'Full')).toBeDisabled();
  });

  test('shows the error under the control and marks it invalid', async ({ page }) => {
    await page.goto(storyUrl('pipz-psegmentedcontrol--with-error'));
    await expect(page.getByRole('alert')).toHaveText("Paid can't be more than the total.");
    await expect(page.getByRole('radiogroup')).toHaveAttribute('aria-invalid', 'true');
  });
});
