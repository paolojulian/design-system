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

test.describe('PFormField — label / control association', () => {
  test('clicking the label focuses the control', async ({ page }) => {
    await gotoStory(page, 'pipz-pformfield--default');
    const input = page.getByLabel('Work email');
    await expect(input).not.toBeFocused();

    // The visible label text lives in the <label> associated via htmlFor.
    await page.getByText('Work email', { exact: true }).click();
    await expect(input).toBeFocused();
  });

  test('resolves the accessible name from the field label', async ({ page }) => {
    await gotoStory(page, 'pipz-pformfield--default');
    await expect(page.getByRole('textbox', { name: 'Work email' })).toBeVisible();
  });
});

test.describe('PFormField — error wiring', () => {
  test('marks the control invalid and references the error via aria-describedby', async ({
    page,
  }) => {
    await gotoStory(page, 'pipz-pformfield--with-error');
    const input = page.getByLabel('Work email');
    await expect(input).toHaveAttribute('aria-invalid', 'true');

    const alert = page.getByRole('alert');
    await expect(alert).toHaveText('Enter a valid email address.');

    const describedBy = await input.getAttribute('aria-describedby');
    const errorId = await alert.getAttribute('id');
    expect(describedBy).toBeTruthy();
    expect(errorId).toBeTruthy();
    expect(describedBy?.split(' ')).toContain(errorId);
  });

  test('no error message renders when there is only a hint', async ({ page }) => {
    await gotoStory(page, 'pipz-pformfield--with-hint');
    await expect(page.getByRole('alert')).toHaveCount(0);
    const input = page.getByLabel('Work email');
    const describedBy = await input.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    // aria-describedby must point at the hint element. Use an attribute
    // selector: generated ids contain ":" which is invalid in a #id selector.
    await expect(page.locator(`[id="${describedBy}"]`)).toHaveText(
      'We only use this to send workspace notifications.',
    );
  });
});

test.describe('PFormField — required and disabled', () => {
  test('communicates required in text and via aria-required', async ({ page }) => {
    await gotoStory(page, 'pipz-pformfield--required');
    const input = page.getByLabel('Work email');
    await expect(input).toHaveAttribute('aria-required', 'true');
    // Required is announced in text, not only by the asterisk color.
    await expect(page.getByText('(required)')).toBeAttached();
  });

  test('disables the wrapped control via the field', async ({ page }) => {
    await gotoStory(page, 'pipz-pformfield--disabled-control');
    await expect(page.getByLabel('Workspace URL')).toBeDisabled();
  });
});

test.describe('PFormField — works across control types', () => {
  test('wires select and textarea through the same contract', async ({ page }) => {
    await gotoStory(page, 'pipz-pformfield--wraps-any-control');
    await expect(page.getByRole('combobox', { name: 'Environment' })).toBeVisible();

    const notes = page.getByLabel('Notes');
    await expect(notes).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByRole('alert')).toHaveText('Notes cannot be empty.');
  });
});

test.describe('PFormGrid — responsive columns', () => {
  test('lays out two fields side by side on tablet and up', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 900 });
    await gotoStory(page, 'pipz-pformgrid--enterprise-form');

    const first = await page.getByLabel('First name').boundingBox();
    const last = await page.getByLabel('Last name').boundingBox();
    expect(first).not.toBeNull();
    expect(last).not.toBeNull();
    // Same row: tops align; distinct columns: different x.
    expect(Math.abs((first?.y ?? 0) - (last?.y ?? 0))).toBeLessThan(4);
    expect(last?.x ?? 0).toBeGreaterThan(first?.x ?? 0);
  });

  test('collapses to a single column at mobile width', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoStory(page, 'pipz-pformgrid--enterprise-form');

    const first = await page.getByLabel('First name').boundingBox();
    const last = await page.getByLabel('Last name').boundingBox();
    // Stacked: the second field sits below the first.
    expect(last?.y ?? 0).toBeGreaterThan((first?.y ?? 0) + (first?.height ?? 0) - 1);
  });

  test('a full-span field spans the whole row', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 900 });
    await gotoStory(page, 'pipz-pformgrid--enterprise-form');

    const grid = page.locator('.p-form-grid');
    const full = page.locator('.p-form-grid__item--full').first();
    const gridBox = await grid.boundingBox();
    const fullBox = await full.boundingBox();
    // The full-row item is wider than a single column (roughly the grid width).
    expect(fullBox?.width ?? 0).toBeGreaterThan((gridBox?.width ?? 0) * 0.8);
  });
});

test.describe('PFormField — dark theme', () => {
  test('applies the dark theme via story globals', async ({ page }) => {
    await gotoStory(page, 'pipz-pformfield--dark-theme');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });
});

test.describe('PFormField / PFormGrid — accessibility', () => {
  for (const storyId of [
    'pipz-pformfield--default',
    'pipz-pformfield--with-hint',
    'pipz-pformfield--with-error',
    'pipz-pformfield--required',
    'pipz-pformfield--disabled-control',
    'pipz-pformfield--long-label-and-error',
    'pipz-pformfield--wraps-any-control',
    'pipz-pformfield--dark-theme',
    'pipz-pformgrid--enterprise-form',
    'pipz-pformgrid--dark-theme',
  ]) {
    test(`${storyId} has no detectable axe violations`, async ({ page }) => {
      await gotoStory(page, storyId);
      await expectNoA11yViolations(page);
    });
  }
});
