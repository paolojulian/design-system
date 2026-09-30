import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';

type Theme = 'light' | 'dark';
type Design = 'pipz' | 'elle';
type Rgba = [number, number, number, number];

const storyUrl = (id: string, design: Design | undefined, theme: Theme) =>
  `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme}${design ? `;design:${design}` : ''}`;

async function gotoStory(page: Page, id: string, design: Design | undefined, theme: Theme) {
  await page.goto(storyUrl(id, design, theme));
  await expect(page.locator('#storybook-root')).not.toBeEmpty();
}

/** Resolves color tokens through the browser so `var()` chains and alpha come back as real colors. */
async function resolveColors(page: Page, tokens: string[]): Promise<Record<string, Rgba>> {
  return page.evaluate((names) => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const context = canvas.getContext('2d', { willReadFrequently: true })!;
    const out: Record<string, [number, number, number, number]> = {};
    for (const name of names) {
      const probe = document.createElement('div');
      probe.style.color = `var(${name})`;
      document.documentElement.appendChild(probe);
      // Painting normalises every CSS color syntax to RGBA bytes.
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = getComputedStyle(probe).color;
      context.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;
      out[name] = [r, g, b, a / 255];
      probe.remove();
    }
    return out;
  }, tokens);
}

const channel = (value: number) => {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const luminance = ([r, g, b]: number[]) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
/** Canvas returns premultiplied-then-unpremultiplied bytes, so alpha colors are composited here. */
const over = (fg: Rgba, bg: number[]) => fg.slice(0, 3).map((value, i) => value * fg[3] + bg[i] * (1 - fg[3]));

function contrast(foreground: Rgba, background: Rgba, page: Rgba): number {
  const bg = over(background, page.slice(0, 3));
  const fg = over(foreground, bg);
  const [lighter, darker] = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

const TEXT = 4.5;
const NON_TEXT = 3;
const STATUSES = ['danger', 'warning', 'success', 'info'] as const;

/**
 * [foreground, background, minimum ratio] — the pairings components actually
 * produce. Status surfaces are tints, so they are composited over `surface`.
 */
const PAIRS: [string, string, number][] = [
  ...['background', 'surface', 'surface-raised', 'surface-subtle'].flatMap((surface): [string, string, number][] => [
    ['--p-color-text', `--p-color-${surface}`, TEXT],
    ['--p-color-text-muted', `--p-color-${surface}`, TEXT],
    ['--p-color-text-subtle', `--p-color-${surface}`, TEXT],
  ]),
  // Filled buttons and solid badges.
  ['--p-color-text-inverse', '--p-color-action-primary', TEXT],
  ['--p-color-text-inverse', '--p-color-action-primary-hover', TEXT],
  ['--p-color-text-inverse', '--p-color-danger', TEXT],
  ['--p-color-text-inverse', '--p-color-surface-inverse', TEXT],
  // Tertiary buttons and links sit directly on the page or a card.
  ['--p-color-action-primary', '--p-color-background', TEXT],
  ['--p-color-action-primary', '--p-color-surface', TEXT],
  ['--p-color-action-primary', '--p-color-action-primary-subtle', TEXT],
  // Alerts: body and muted text on the status tint; the accent is an icon.
  ...STATUSES.flatMap((status): [string, string, number][] => [
    ['--p-color-text', `--p-color-${status}-surface`, TEXT],
    ['--p-color-text-muted', `--p-color-${status}-surface`, TEXT],
    [`--p-color-${status}`, `--p-color-${status}-surface`, NON_TEXT],
    [`--p-color-${status}`, '--p-color-surface', NON_TEXT],
  ]),
  // Subtle badges set the status color as text on its own tint.
  ['--p-color-danger-hover', '--p-color-danger-surface', TEXT],
  ['--p-color-success', '--p-color-success-surface', TEXT],
  ['--p-color-info', '--p-color-info-surface', TEXT],
  // WCAG 1.4.11: the focus indicator against what it is drawn on.
  ['--p-color-focus', '--p-color-background', NON_TEXT],
  ['--p-color-focus', '--p-color-surface', NON_TEXT],
];

const PIPZ_STORY = 'pipz-pcard--default';

/**
 * Asserts every tier landed, not just the colors. Base tokens and fonts come
 * from Elle's light block and dark-only colors from its dark block, so a
 * cascade problem can apply one without the other.
 */
async function expectElleApplied(page: Page, theme: Theme) {
  const colors = await resolveColors(page, ['--p-color-background', '--p-color-neutral-950']);
  expect(colors['--p-color-neutral-950']).toEqual([0, 0, 0, 1]);
  expect(colors['--p-color-background']).toEqual(theme === 'light' ? [242, 242, 247, 1] : [0, 0, 0, 1]);
  const font = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--p-font-family-sans'));
  expect(font.trim()).toMatch(/^-apple-system/);
}

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

const SRC = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'src');
const readCss = (file: string) => readFileSync(path.join(SRC, file), 'utf8');

/** Custom properties declared in the rule whose selector list contains `selector`. */
function declaredIn(css: string, selector: string): Set<string> {
  const index = css.indexOf(selector);
  if (index === -1) throw new Error(`Selector not found: ${selector}`);
  const open = css.indexOf('{', index);
  const close = css.indexOf('}', open);
  return new Set([...css.slice(open, close).matchAll(/(--p-[\w-]+)\s*:/g)].map((match) => match[1]));
}

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
