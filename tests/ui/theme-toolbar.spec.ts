import { expect, type Page, test } from '@playwright/test';

type ThemeGlobal = 'light' | 'dark' | 'system';

const storyUrl = (id: string, theme?: ThemeGlobal) =>
  `/iframe.html?id=${id}&viewMode=story${theme ? `&globals=theme:${theme}` : ''}`;

async function gotoStory(page: Page, id: string, theme?: ThemeGlobal) {
  await page.goto(storyUrl(id, theme));
  await expect(page.locator('#storybook-root')).toBeVisible();
  await expect(page.locator('#storybook-root')).not.toBeEmpty();
}

/**
 * Resolves a semantic color token to a concrete color by attaching a probe
 * element that inherits from `document.documentElement`, where the theme
 * decorator sets `data-theme`. Reading a raw custom property returns the
 * unresolved `var(...)` chain, so we let the browser compute it instead.
 */
async function resolveColorToken(page: Page, token: string) {
  return page.evaluate((cssVar) => {
    const probe = document.createElement('div');
    probe.style.backgroundColor = `var(${cssVar})`;
    document.documentElement.appendChild(probe);
    const color = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return color;
  }, token);
}

test.describe('Theme toolbar', () => {
  test('flips the background token between light and dark globals', async ({ page }) => {
    await gotoStory(page, 'components-pcard--default', 'light');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    const lightBackground = await resolveColorToken(page, '--p-color-background');
    // --p-color-neutral-50
    expect(lightBackground).toBe('rgb(250, 250, 249)');

    await gotoStory(page, 'components-pcard--default', 'dark');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    const darkBackground = await resolveColorToken(page, '--p-color-background');
    // --p-color-neutral-950
    expect(darkBackground).toBe('rgb(17, 17, 17)');
    expect(darkBackground).not.toBe(lightBackground);

    // Control hover must lighten (raise) in dark rather than flash the fixed
    // near-white light value; guards the dark override in theme.css.
    const darkControlHover = await resolveColorToken(page, '--p-control-bg-hover');
    // --p-color-neutral-800
    expect(darkControlHover).toBe('rgb(41, 37, 36)');
  });

  test('system follows the OS color scheme, including live changes', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await gotoStory(page, 'components-pcard--default', 'system');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    expect(await resolveColorToken(page, '--p-color-background')).toBe('rgb(17, 17, 17)');

    // No reload: the OS flipping while on `system` must re-resolve the attribute.
    await page.emulateMedia({ colorScheme: 'light' });
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    expect(await resolveColorToken(page, '--p-color-background')).toBe('rgb(250, 250, 249)');
  });

  test('defaults to system when no theme global is set', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await gotoStory(page, 'components-pcard--default');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('an explicit theme wins over the OS color scheme', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await gotoStory(page, 'components-pcard--default', 'light');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

    // An OS change must not override an explicit choice.
    await page.emulateMedia({ colorScheme: 'light' });
    await page.emulateMedia({ colorScheme: 'dark' });
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });
});
