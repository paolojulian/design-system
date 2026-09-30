import { expect, type Page, test } from '@playwright/test';
import {
  contrast,
  declaredIn,
  expectNoAxeViolations,
  gotoStory,
  PAIRS,
  readCss,
  resolveColors,
  type Theme,
} from './elle-helpers';

const PIPZ_BUTTON = 'pipz-pbutton--primary';
/**
 * Pairs that fail in Pipz itself; Ink inherits the neutrals by design. Tracked
 * in docs/tech-debts/pipz-text-subtle-contrast.md. Remove once Pipz is fixed.
 */
const PIPZ_KNOWN_GAPS = new Set(['light:--p-color-text-subtle on --p-color-surface-subtle']);
const INK = { light: [34, 34, 34, 1], dark: [245, 245, 244, 1] } as const;

/**
 * Asserts Ink really landed: its action color, its radius (from the light
 * block, which must also apply in dark) and Pipz's font. Runs first in every
 * Ink test, so a cascade failure can't let axe audit Pipz by mistake.
 */
async function expectInkApplied(page: Page, theme: Theme): Promise<void> {
  await expect(page.locator('html')).toHaveAttribute('data-design', 'ink');
  const colors = await resolveColors(page, ['--p-color-action-primary']);
  expect(colors['--p-color-action-primary']).toEqual(INK[theme]);
  const tokens = await page.evaluate(() => {
    const style = getComputedStyle(document.documentElement);
    return [style.getPropertyValue('--p-radius-sm').trim(), style.getPropertyValue('--p-font-family-sans').trim()];
  });
  // Compared as a number: the production minifier writes `.5rem`.
  expect(tokens[0]).toMatch(/rem$/);
  expect(Number.parseFloat(tokens[0])).toBe(0.5);
  expect(tokens[1]).toMatch(/^['"]?AvantGarde/);
}

test.describe('Ink design language', () => {
  for (const theme of ['light', 'dark'] as const) {
    test(`the toolbar turns a Pipz button into an 8px ink button in ${theme}`, async ({ page }) => {
      await gotoStory(page, PIPZ_BUTTON, 'ink', theme);
      await expectInkApplied(page, theme);
      const button = page.getByRole('button').first();
      await expect(button).toHaveCSS('background-color', `rgb(${INK[theme].slice(0, 3).join(', ')})`);
      await expect(button).toHaveCSS('border-radius', '8px');
    });

    test(`neutrals and status colors are Pipz's in ${theme}`, async ({ page }) => {
      const kept = ['--p-color-background', '--p-color-text', '--p-color-border', '--p-color-danger'];
      await gotoStory(page, PIPZ_BUTTON, 'pipz', theme);
      const pipz = await resolveColors(page, kept);
      await gotoStory(page, PIPZ_BUTTON, 'ink', theme);
      await expectInkApplied(page, theme);
      expect(await resolveColors(page, kept)).toEqual(pipz);
    });

    test(`in-page shadows are gone and floating ones remain in ${theme}`, async ({ page }) => {
      await gotoStory(page, PIPZ_BUTTON, 'ink', theme);
      await expectInkApplied(page, theme);
      const shadows = await page.evaluate(() =>
        ['sm', 'md', 'lg'].map((size) => {
          const probe = document.createElement('div');
          probe.style.boxShadow = `var(--p-shadow-${size})`;
          document.body.appendChild(probe);
          const value = getComputedStyle(probe).boxShadow;
          probe.remove();
          return value;
        }),
      );
      expect(shadows[0]).toMatch(/^rgba\(0, 0, 0, 0\) 0px 0px( 0px)*$/);
      expect(shadows[1]).toContain('6px 16px');
      expect(shadows[2]).toContain('8px 28px');
    });

    test(`every token pairing meets its WCAG minimum in Ink ${theme}`, async ({ page }) => {
      await gotoStory(page, PIPZ_BUTTON, 'ink', theme);
      await expectInkApplied(page, theme);
      const names = [...new Set([...PAIRS.flatMap(([fg, bg]) => [fg, bg]), '--p-color-surface'])];
      const colors = await resolveColors(page, names);
      const failures = PAIRS.flatMap(([fg, bg, minimum]) => {
        if (PIPZ_KNOWN_GAPS.has(`${theme}:${fg} on ${bg}`)) return [];
        const ratio = contrast(colors[fg], colors[bg], colors['--p-color-surface']);
        return ratio < minimum ? [`${fg} on ${bg}: ${ratio.toFixed(2)} < ${minimum}`] : [];
      });
      expect(failures).toEqual([]);
    });

    test(`the switch thumb stands out from its track in ${theme}`, async ({ page }) => {
      await gotoStory(page, PIPZ_BUTTON, 'ink', theme);
      await expectInkApplied(page, theme);
      const tokens = ['--p-switch-thumb', '--p-switch-track-on', '--p-switch-track-off', '--p-color-surface'];
      const colors = await resolveColors(page, tokens);
      const surface = colors['--p-color-surface'];
      // WCAG 1.4.11: the thumb position is the state. On an ink track a white thumb vanishes in dark (1.09:1).
      expect(contrast(colors['--p-switch-thumb'], colors['--p-switch-track-on'], surface)).toBeGreaterThanOrEqual(3);
      if (theme === 'dark') {
        expect(contrast(colors['--p-switch-thumb'], colors['--p-switch-track-off'], surface)).toBeGreaterThanOrEqual(3);
      }
    });

    for (const story of ['tokens', 'components']) {
      test(`Ink/Theme ${story} pins Ink and passes axe in ${theme}`, async ({ page }) => {
        // Toolbar on Pipz: the story's own globals must still win.
        await gotoStory(page, `ink-theme--${story}`, 'pipz', theme);
        await expectInkApplied(page, theme);
        await expectNoAxeViolations(page);
      });
    }
  }

  test('the sheet floats with the large shadow and 16px corners', async ({ page }) => {
    await gotoStory(page, 'ink-theme--components', undefined, 'light');
    await expectInkApplied(page, 'light');
    await page.getByRole('button', { name: 'Open sheet' }).click();
    const sheet = page.getByRole('dialog', { name: 'Trip details' });
    await expect(sheet).toBeVisible();
    const panel = await sheet.evaluate((dialog) => {
      const withRadius = [dialog, ...dialog.querySelectorAll('*')].find(
        (element) => getComputedStyle(element).borderTopLeftRadius !== '0px',
      );
      return withRadius ? getComputedStyle(withRadius).borderTopLeftRadius : '';
    });
    expect(panel).toBe('16px');
  });

  test('a Pipz page is untouched when Ink is loaded but not selected', async ({ page }) => {
    await gotoStory(page, PIPZ_BUTTON, 'pipz', 'light');
    await expect(page.locator('html')).not.toHaveAttribute('data-design', /.*/);
    expect((await resolveColors(page, ['--p-color-action-primary']))['--p-color-action-primary']).toEqual([
      182, 63, 76, 1,
    ]);
  });
});

test.describe('Ink token contract', () => {
  const pipz = readCss('theme.css');
  const ink = readCss('theme-ink.css');
  const pipzLight = declaredIn(pipz, "[data-theme='light']");
  const inkLight = declaredIn(ink, "[data-design='ink'][data-design],");
  const inkDark = declaredIn(ink, "[data-design='ink'][data-theme='dark']");

  test('Ink introduces no tokens of its own', () => {
    expect(inkLight.size).toBeGreaterThan(10);
    expect([...inkLight, ...inkDark].filter((token) => !pipzLight.has(token))).toEqual([]);
  });

  test('Ink leaves neutrals, text, borders and status colors to Pipz', () => {
    const touched = [...inkLight, ...inkDark].filter((token) =>
      /^--p-color-(neutral|background|surface|text|border|danger|warning|success|info)/.test(token),
    );
    expect(touched).toEqual([]);
  });
});
