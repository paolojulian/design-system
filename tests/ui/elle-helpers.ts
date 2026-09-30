/**
 * Shared helpers for design-language tests (Elle, and any later language that
 * re-values the same `--p-*` contract). Kept out of the spec files so each
 * language's suite asserts the same contrast matrix the same way.
 */
import AxeBuilder from '@axe-core/playwright';
import { expect, type Page } from '@playwright/test';

export type Theme = 'light' | 'dark';
export type Design = 'pipz' | 'elle';
export type Rgba = [number, number, number, number];

const storyUrl = (id: string, design: Design | undefined, theme: Theme) =>
  `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme}${design ? `;design:${design}` : ''}`;

export async function gotoStory(page: Page, id: string, design: Design | undefined, theme: Theme) {
  await page.goto(storyUrl(id, design, theme));
  await expect(page.locator('#storybook-root')).not.toBeEmpty();
}

/** Resolves color tokens through the browser so `var()` chains and alpha come back as real colors. */
export async function resolveColors(page: Page, tokens: string[]): Promise<Record<string, Rgba>> {
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

export function contrast(foreground: Rgba, background: Rgba, page: Rgba): number {
  const bg = over(background, page.slice(0, 3));
  const fg = over(foreground, bg);
  const [lighter, darker] = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

export const TEXT = 4.5;
export const NON_TEXT = 3;
const STATUSES = ['danger', 'warning', 'success', 'info'] as const;

/**
 * [foreground, background, minimum ratio] — the pairings components actually
 * produce. Status surfaces are tints, so they are composited over `surface`.
 */
export const PAIRS: [string, string, number][] = [
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


/**
 * Asserts every tier landed, not just the colors. Base tokens and fonts come
 * from Elle's light block and dark-only colors from its dark block, so a
 * cascade problem can apply one without the other.
 */
export async function expectElleApplied(page: Page, theme: Theme) {
  const colors = await resolveColors(page, ['--p-color-background', '--p-color-neutral-950']);
  expect(colors['--p-color-neutral-950']).toEqual([0, 0, 0, 1]);
  expect(colors['--p-color-background']).toEqual(theme === 'light' ? [242, 242, 247, 1] : [0, 0, 0, 1]);
  const font = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--p-font-family-sans'));
  expect(font.trim()).toMatch(/^-apple-system/);
}

/**
 * Waits for the backgrounds addon's background-color transition to settle.
 * Sampled mid-transition, dark stories read as near-transparent and axe reports
 * contrast failures against a color that is never painted (see
 * selection-controls.spec.ts).
 */
export async function waitForBackgroundSettled(page: Page) {
  await page.evaluate(() =>
    Promise.all(document.body.getAnimations().map((animation) => animation.finished.catch(() => undefined))),
  );
}

export async function expectNoAxeViolations(page: Page) {
  await waitForBackgroundSettled(page);
  const results = await new AxeBuilder({ page }).include('#storybook-root').analyze();
  expect(results.violations.map((violation) => `${violation.id}: ${violation.nodes.length} node(s)`)).toEqual([]);
}
