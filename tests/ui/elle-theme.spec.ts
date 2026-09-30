import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { contrast, declaredIn, expectElleApplied, gotoStory, PAIRS, readCss, resolveColors } from './elle-helpers';

const PIPZ_STORY = 'pipz-pcard--default';

test.describe('Elle design language', () => {
  test('the design toolbar sets data-design and re-values tokens in both themes', async ({ page }) => {
    await gotoStory(page, PIPZ_STORY, 'elle', 'light');
    await expect(page.locator('html')).toHaveAttribute('data-design', 'elle');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    const light = await resolveColors(page, ['--p-color-action-primary', '--p-color-background', '--p-color-surface']);
    expect(light['--p-color-action-primary']).toEqual([0, 102, 204, 1]);
    expect(light['--p-color-background']).toEqual([242, 242, 247, 1]);
    expect(light['--p-color-surface']).toEqual([255, 255, 255, 1]);

    await gotoStory(page, PIPZ_STORY, 'elle', 'dark');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    const dark = await resolveColors(page, ['--p-color-action-primary', '--p-color-background', '--p-color-surface']);
    expect(dark['--p-color-action-primary']).toEqual([41, 151, 255, 1]);
    expect(dark['--p-color-background']).toEqual([0, 0, 0, 1]);
    expect(dark['--p-color-surface']).toEqual([28, 28, 30, 1]);
  });

  test('non-color tokens follow: system font, softer radius, semibold emphasis', async ({ page }) => {
    await gotoStory(page, PIPZ_STORY, 'elle', 'light');
    const tokens = await page.evaluate(() => {
      const style = getComputedStyle(document.documentElement);
      return Object.fromEntries(
        ['--p-font-family-sans', '--p-radius-sm', '--p-font-weight-medium', '--p-font-size-body-md', '--p-space-4'].map(
          (name) => [name, style.getPropertyValue(name).trim()],
        ),
      );
    });
    expect(tokens['--p-font-family-sans']).toMatch(/^-apple-system/);
    expect(tokens['--p-font-family-sans']).not.toContain('AvantGarde');
    // Compared as numbers: the production minifier rewrites `0.625rem` as `.625rem`.
    const rem = (name: string) => {
      expect(tokens[name]).toMatch(/rem$/);
      return Number.parseFloat(tokens[name]);
    };
    expect(rem('--p-radius-sm')).toBe(0.625);
    expect(tokens['--p-font-weight-medium']).toBe('600');
    expect(rem('--p-font-size-body-md')).toBe(1.0625);
    // Spacing is deliberately shared between the two languages.
    expect(rem('--p-space-4')).toBe(1);
  });

  test('Pipz is untouched when Elle is loaded but not selected', async ({ page }) => {
    for (const design of ['pipz', undefined] as const) {
      await gotoStory(page, PIPZ_STORY, design, 'light');
      await expect(page.locator('html')).not.toHaveAttribute('data-design', /.*/);
      const colors = await resolveColors(page, ['--p-color-action-primary', '--p-color-background']);
      expect(colors['--p-color-action-primary']).toEqual([182, 63, 76, 1]);
      expect(colors['--p-color-background']).toEqual([250, 250, 249, 1]);
    }
    await gotoStory(page, PIPZ_STORY, 'pipz', 'dark');
    expect((await resolveColors(page, ['--p-color-background']))['--p-color-background']).toEqual([17, 17, 17, 1]);
  });

  test('Elle stories pin the design regardless of the toolbar', async ({ page }) => {
    await gotoStory(page, 'elle-theme--tokens', 'pipz', 'light');
    await expect(page.locator('html')).toHaveAttribute('data-design', 'elle');
    await expect(page.getByText('--p-color-action-primary', { exact: true })).toBeVisible();
  });

  for (const theme of ['light', 'dark'] as const) {
    test(`every token pairing meets its WCAG contrast minimum in Elle ${theme}`, async ({ page }) => {
      await gotoStory(page, PIPZ_STORY, 'elle', theme);
      const names = [...new Set([...PAIRS.flatMap(([fg, bg]) => [fg, bg]), '--p-color-surface'])];
      const colors = await resolveColors(page, names);
      const surface = colors['--p-color-surface'];

      const failures = PAIRS.flatMap(([fg, bg, minimum]) => {
        const ratio = contrast(colors[fg], colors[bg], surface);
        return ratio < minimum ? [`${fg} on ${bg}: ${ratio.toFixed(2)} < ${minimum}`] : [];
      });
      expect(failures).toEqual([]);
    });

    test(`existing components pass axe in Elle ${theme}`, async ({ page }) => {
      await gotoStory(page, 'elle-theme--components', undefined, theme);
      const button = page.getByRole('button', { name: 'Continue' });
      await expect(button).toBeVisible();
      // Guard: without this, a stylesheet-order regression leaves the story in
      // Pipz and axe happily passes the wrong design language.
      await expectElleApplied(page, theme);
      await expect(button).toHaveCSS('background-color', theme === 'light' ? 'rgb(0, 102, 204)' : 'rgb(41, 151, 255)');
      await expect(button).toHaveCSS('border-radius', '10px');
      expect(await button.evaluate((element) => getComputedStyle(element).fontFamily)).toMatch(/^-apple-system/);
      const results = await new AxeBuilder({ page }).include('#storybook-root').analyze();
      expect(results.violations.map((violation) => `${violation.id}: ${violation.nodes.length} node(s)`)).toEqual([]);
    });
  }

  test('scoped regions: a dark region inside Elle, and an Elle region inside dark', async ({ page }) => {
    await gotoStory(page, PIPZ_STORY, 'elle', 'light');
    const resolved = await page.evaluate(() => {
      const read = (element: Element) => {
        const probe = document.createElement('div');
        probe.style.color = 'var(--p-color-background)';
        element.appendChild(probe);
        const color = getComputedStyle(probe).color;
        probe.remove();
        return color;
      };
      const darkInElle = document.createElement('div');
      darkInElle.setAttribute('data-theme', 'dark');
      document.body.appendChild(darkInElle);
      const result = { darkInElle: read(darkInElle), elleInDark: '', lightElleInDark: '' };

      // Flip the page to plain dark Pipz, then nest Elle regions in it.
      document.documentElement.removeAttribute('data-design');
      document.documentElement.setAttribute('data-theme', 'dark');
      const elleInDark = document.createElement('div');
      elleInDark.setAttribute('data-design', 'elle');
      const lightElleInDark = document.createElement('div');
      lightElleInDark.setAttribute('data-design', 'elle');
      lightElleInDark.setAttribute('data-theme', 'light');
      document.body.append(elleInDark, lightElleInDark);
      result.elleInDark = read(elleInDark);
      result.lightElleInDark = read(lightElleInDark);
      return result;
    });
    expect(resolved.darkInElle).toBe('rgb(0, 0, 0)');
    expect(resolved.elleInDark).toBe('rgb(0, 0, 0)');
    expect(resolved.lightElleInDark).toBe('rgb(242, 242, 247)');
  });
});

// ---------------------------------------------------------------------------
// Contract checks on the stylesheets themselves (no browser needed).
// ---------------------------------------------------------------------------

test.describe('Elle token contract', () => {
  const pipz = readCss('theme.css');
  const elle = readCss('theme-elle.css');
  const pipzLight = declaredIn(pipz, "[data-theme='light']");
  const pipzDark = declaredIn(pipz, "[data-theme='dark']");
  const elleLight = declaredIn(elle, "[data-design='elle'][data-design],");
  const elleDark = declaredIn(elle, "[data-design='elle'][data-theme='dark']");

  test('Elle introduces no tokens of its own', () => {
    expect(elleLight.size).toBeGreaterThan(80);
    expect([...elleLight, ...elleDark].filter((token) => !pipzLight.has(token))).toEqual([]);
  });

  test('Elle dark re-declares everything Pipz dark does, so Pipz dark can never leak through', () => {
    expect([...pipzDark].filter((token) => !elleDark.has(token))).toEqual([]);
  });

  test('every semantic color Pipz defines is re-valued by Elle', () => {
    const semantic = [...pipzLight].filter((token) => /^--p-color-(?!neutral|red|amber|green|blue|brand|accent)/.test(token));
    expect(semantic.length).toBeGreaterThan(25);
    expect(semantic.filter((token) => !elleLight.has(token))).toEqual([]);
  });
});
