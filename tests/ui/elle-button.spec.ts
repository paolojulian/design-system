import { expect, type Locator, test } from '@playwright/test';
import { expectElleApplied, expectNoAxeViolations, gotoStory, TEXT } from './elle-helpers';

const VARIANTS = ['filled', 'tinted', 'gray', 'plain'] as const;
const TONES = ['default', 'destructive'] as const;

/**
 * Contrast of the label against what is actually painted behind it: the
 * button's own background composited over every ancestor until an opaque one.
 * Measured on rendered elements, not tokens, so a wrong token mapping fails.
 */
async function renderedContrast(button: Locator): Promise<number> {
  return button.evaluate((element) => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const context = canvas.getContext('2d', { willReadFrequently: true })!;
    const rgba = (color: string) => {
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = color;
      context.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;
      return [r, g, b, a / 255];
    };
    const over = (fg: number[], bg: number[]) => fg.slice(0, 3).map((value, i) => value * fg[3] + bg[i] * (1 - fg[3]));

    const layers: number[][] = [];
    for (let node: Element | null = element; node; node = node.parentElement) {
      const color = rgba(getComputedStyle(node).backgroundColor);
      if (color[3] > 0) layers.push(color);
      if (color[3] === 1) break;
    }
    let background = [255, 255, 255];
    for (const layer of layers.reverse()) background = over(layer, background);
    const label = element.querySelector('.e-button__label')!;
    const foreground = over(rgba(getComputedStyle(label).color), background);

    const channel = (value: number) => {
      const c = value / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    };
    const luminance = ([r, g, b]: number[]) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
    const [lighter, darker] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
    return (lighter + 0.05) / (darker + 0.05);
  });
}

test.describe('Elle EButton', () => {
  for (const theme of ['light', 'dark'] as const) {
    test(`every variant × tone reaches 4.5:1 and passes axe in ${theme}`, async ({ page }) => {
      await gotoStory(page, 'elle-ebutton--variants', undefined, theme);
      await expectElleApplied(page, theme);
      for (const variant of VARIANTS) {
        for (const tone of TONES) {
          const button = page.getByTestId(`${variant}-${tone}`);
          await expect(button).toHaveClass(new RegExp(`e-button--${variant}`));
          const ratio = await renderedContrast(button);
          expect(ratio, `${variant}/${tone} in ${theme}`).toBeGreaterThanOrEqual(TEXT);
        }
      }
      await expectNoAxeViolations(page);
    });
  }

  test('filled maps to the action token; destructive maps to danger', async ({ page }) => {
    await gotoStory(page, 'elle-ebutton--variants', undefined, 'light');
    await expect(page.getByTestId('filled-default')).toHaveCSS('background-color', 'rgb(0, 102, 204)');
    await expect(page.getByTestId('filled-default')).toHaveCSS('border-radius', '9999px');
    await expect(page.getByTestId('filled-destructive')).toHaveCSS('background-color', 'rgb(233, 21, 45)');
    await expect(page.getByTestId('plain-default')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  });

  test('isLoading keeps the width, keeps the accessible name, and disables the button', async ({ page }) => {
    await gotoStory(page, 'elle-ebutton--loading', undefined, 'light');
    for (const pair of ['label', 'icon']) {
      const idle = await page.getByTestId(`${pair}-idle`).boundingBox();
      const loading = page.getByTestId(`${pair}-loading`);
      const busy = await loading.boundingBox();
      expect(busy!.width).toBeCloseTo(idle!.width, 0);
      await expect(loading).toBeDisabled();
      await expect(loading).toHaveAttribute('aria-busy', 'true');
      await expect(loading).toHaveAccessibleName('Save changes');
      await expect(loading.locator('.e-button__spinner')).toBeVisible();
    }
  });

  test('href renders an anchor with button styling', async ({ page }) => {
    await gotoStory(page, 'elle-ebutton--link', undefined, 'light');
    const link = page.getByRole('link', { name: 'Open settings' });
    await expect(link).toHaveAttribute('href', '#settings');
    await expect(link).toHaveClass(/e-button/);
  });

  test('sm is 36px tall but presents a 44px hit area', async ({ page }) => {
    await gotoStory(page, 'elle-ebutton--sizes', undefined, 'light');
    const small = page.getByRole('button', { name: 'Small' });
    const box = (await small.boundingBox())!;
    expect(box.height).toBeCloseTo(36, 0);
    // 3px above and below the visible box is still inside the 44px target.
    for (const y of [box.y - 3, box.y + box.height + 3]) {
      const hit = await page.evaluate(
        ([x, pointY]) => document.elementFromPoint(x, pointY)?.closest('.e-button')?.textContent,
        [box.x + box.width / 2, y],
      );
      expect(hit).toBe('Small');
    }
    for (const name of ['Medium', 'Large']) {
      expect((await page.getByRole('button', { name }).boundingBox())!.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('keyboard focus shows the ring', async ({ page }) => {
    await gotoStory(page, 'elle-ebutton--variants', undefined, 'light');
    await page.keyboard.press('Tab');
    const first = page.getByTestId('filled-default');
    await expect(first).toBeFocused();
    expect(await first.evaluate((element) => getComputedStyle(element).boxShadow)).toMatch(/rgb\(0, 113, 227\)/);
  });

  test('passes axe at phone width in dark', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoStory(page, 'elle-ebutton--variants', undefined, 'dark');
    await expectElleApplied(page, 'dark');
    await expectNoAxeViolations(page);
  });
});
