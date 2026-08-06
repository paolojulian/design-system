import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';

const storyUrl = (id: string) => `/iframe.html?id=${id}&viewMode=story`;

/**
 * The other specs in this suite gate on `#storybook-root` not being empty. That
 * check is unusable here: Playwright's `toBeEmpty` tests for *text* content, and
 * a photo gallery is by definition all imagery — every story would read as empty.
 * Storybook's own `sb-show-main` body class is the honest mount signal, and it
 * also works for the lightbox stories, which portal outside the root entirely.
 */
async function gotoStory(page: Page, id: string) {
  await page.goto(storyUrl(id));
  await expect(page.locator('body.sb-show-main')).toBeAttached();
  await expect(page.locator('.sb-nopreview')).toBeHidden();
  await expect(page.locator('.sb-errordisplay')).toBeHidden();
}

async function expectNoA11yViolations(page: Page) {
  const results = await new AxeBuilder({ page }).include('#storybook-root').analyze();
  expect(results.violations).toEqual([]);
}

test.describe('PPhotoMosaic', () => {
  test('renders a lead tile plus a row, with the rest summarised on the last one', async ({
    page,
  }) => {
    await gotoStory(page, 'components-pphotomosaic--default');

    await expect(page.locator('.p-photo-mosaic__tile--hero')).toHaveCount(1);
    await expect(page.locator('.p-photo-mosaic__tile--row')).toHaveCount(3);

    // 60 photos, 4 preview tiles.
    const overflow = page.locator('.p-photo-mosaic__overflow');
    await expect(overflow).toHaveCount(1);
    await expect(overflow).toHaveText('+56');

    // The count belongs on the last visible tile, not floating anywhere else.
    const lastTile = page.locator('.p-photo-mosaic__tile--row').last();
    await expect(lastTile.locator('.p-photo-mosaic__overflow')).toBeVisible();
  });

  test('tiles paint the preview source, never the full-size file', async ({ page }) => {
    await gotoStory(page, 'components-pphotomosaic--default');

    // The fixtures label the two variants differently, so the rendered src says
    // outright which one the tile reached for.
    const sources = await page.locator('.p-photo-mosaic__image').evaluateAll((nodes) =>
      nodes.map((node) => decodeURIComponent((node as HTMLImageElement).src)),
    );

    expect(sources).toHaveLength(4);
    for (const src of sources) {
      expect(src).not.toContain('— full');
    }
  });

  test('every tile is a labelled button and reports its own index', async ({ page }) => {
    await gotoStory(page, 'components-pphotomosaic--reports-the-tapped-index');
    const readout = page.getByTestId('opened-index');
    await expect(readout).toHaveText('No tile opened yet');

    // Third tile in the row is index 3 — the row starts at 1, after the hero.
    await page.locator('.p-photo-mosaic__tile--row').nth(2).click();
    await expect(readout).toHaveText('Opened index 3');

    await page.locator('.p-photo-mosaic__tile--hero').click();
    await expect(readout).toHaveText('Opened index 0');
  });

  test('the overflow tile opens at its own index rather than jumping to the end', async ({
    page,
  }) => {
    await gotoStory(page, 'components-pphotomosaic--reports-the-tapped-index');

    // 12 photos, 4 tiles: the last tile carries "+8" and is still index 3.
    await expect(page.locator('.p-photo-mosaic__overflow')).toHaveText('+8');
    await page.locator('.p-photo-mosaic__tile--row').last().click();
    await expect(page.getByTestId('opened-index')).toHaveText('Opened index 3');
  });

  test('the overflow tile is named for what it does, not for the photo behind it', async ({
    page,
  }) => {
    await gotoStory(page, 'components-pphotomosaic--default');

    await expect(
      page.getByRole('button', { name: 'Open the gallery — 56 more photos' }),
    ).toBeVisible();

    // The scrim hides the photo, so its alt text would describe something
    // nobody can see.
    const overflowAlt = await page
      .locator('.p-photo-mosaic__tile--row')
      .last()
      .locator('img')
      .getAttribute('alt');
    expect(overflowAlt).toBe('');
  });

  test('renders nothing interactive without onPhotoClick', async ({ page }) => {
    await gotoStory(page, 'components-pphotomosaic--static');

    await expect(page.locator('.p-photo-mosaic__tile')).toHaveCount(4);
    await expect(page.locator('#storybook-root button')).toHaveCount(0);
  });

  test('a single photo collapses to the lead tile with no row', async ({ page }) => {
    await gotoStory(page, 'components-pphotomosaic--single-photo');

    await expect(page.locator('.p-photo-mosaic__tile--hero')).toHaveCount(1);
    await expect(page.locator('.p-photo-mosaic__row')).toHaveCount(0);
    await expect(page.locator('.p-photo-mosaic__overflow')).toHaveCount(0);
  });

  test('exactly previewCount photos means no overflow tile', async ({ page }) => {
    await gotoStory(page, 'components-pphotomosaic--exact-fit');

    await expect(page.locator('.p-photo-mosaic__tile')).toHaveCount(4);
    await expect(page.locator('.p-photo-mosaic__overflow')).toHaveCount(0);
  });

  test('with one preview tile the lead tile carries the count', async ({ page }) => {
    await gotoStory(page, 'components-pphotomosaic--hero-only-with-overflow');

    await expect(page.locator('.p-photo-mosaic__row')).toHaveCount(0);
    await expect(
      page.locator('.p-photo-mosaic__tile--hero .p-photo-mosaic__overflow'),
    ).toHaveText('+59');
  });

  test('the preview row follows previewCount', async ({ page }) => {
    await gotoStory(page, 'components-pphotomosaic--five-tiles');

    await expect(page.locator('.p-photo-mosaic__tile--row')).toHaveCount(4);
    await expect(page.locator('.p-photo-mosaic__overflow')).toHaveText('+55');
  });

  test('is keyboard reachable and shows a focus ring', async ({ page }) => {
    await gotoStory(page, 'components-pphotomosaic--reports-the-tapped-index');

    await page.keyboard.press('Tab');
    const hero = page.locator('.p-photo-mosaic__tile--hero');
    await expect(hero).toBeFocused();
    await expect(hero).toHaveCSS('outline-style', 'solid');

    await hero.press('Enter');
    await expect(page.getByTestId('opened-index')).toHaveText('Opened index 0');
  });

  test('has no accessibility violations', async ({ page }) => {
    await gotoStory(page, 'components-pphotomosaic--default');
    await expectNoA11yViolations(page);
  });
});

test.describe('PPhotoGrid', () => {
  test('renders a list of tiles with nothing focusable by default', async ({ page }) => {
    await gotoStory(page, 'components-pphotogrid--default');

    await expect(page.locator('.p-photo-grid__item')).toHaveCount(12);
    await expect(page.locator('.p-photo-grid__button')).toHaveCount(0);
    await expect(page.locator('.p-photo-grid')).toHaveRole('list');
  });

  test('tiles become labelled buttons with onPhotoClick', async ({ page }) => {
    await gotoStory(page, 'components-pphotogrid--interactive');

    await expect(page.locator('.p-photo-grid__button')).toHaveCount(12);
    await expect(page.getByRole('button', { name: 'Open Ceremony, photo 1' })).toBeVisible();
  });

  test('derives a sizes attribute from the column configuration', async ({ page }) => {
    await gotoStory(page, 'components-pphotogrid--six-columns');

    // 3 / 4 / 6 columns → 33vw / 25vw / 17vw, largest breakpoint first.
    const sizes = await page.locator('.p-photo-grid__image').first().getAttribute('sizes');
    expect(sizes).toBe('(min-width: 64rem) 17vw, (min-width: 48rem) 25vw, 33vw');
  });

  test('renders nothing for an empty set', async ({ page }) => {
    await gotoStory(page, 'components-pphotogrid--empty');
    await expect(page.locator('.p-photo-grid')).toHaveCount(0);
  });

  test('has no accessibility violations', async ({ page }) => {
    await gotoStory(page, 'components-pphotogrid--interactive');
    await expectNoA11yViolations(page);
  });
});

test.describe('PVideoGallery', () => {
  test('shows posters only — no video element until a clip is played', async ({ page }) => {
    await gotoStory(page, 'components-pvideogallery--default');

    await expect(page.locator('.p-video-gallery__poster')).toHaveCount(6);
    // The whole point of the component: nothing has touched the network for
    // video yet.
    await expect(page.locator('video')).toHaveCount(0);
  });

  test('mounts a player in place of the poster that was clicked', async ({ page }) => {
    await gotoStory(page, 'components-pvideogallery--default');

    await page.getByRole('button', { name: 'Play Ceremony clip 1' }).click();

    await expect(page.locator('video')).toHaveCount(1);
    await expect(page.locator('.p-video-gallery__poster')).toHaveCount(5);
    await expect(page.locator('video')).toHaveAttribute('preload', 'none');
  });

  test('plays one clip at a time', async ({ page }) => {
    await gotoStory(page, 'components-pvideogallery--default');

    await page.getByRole('button', { name: 'Play Ceremony clip 1' }).click();
    await expect(page.locator('video')).toHaveCount(1);

    await page.getByRole('button', { name: 'Play Speeches clip 3' }).click();
    // Starting a second replaces the first rather than stacking soundtracks.
    await expect(page.locator('video')).toHaveCount(1);
    await expect(page.locator('video')).toHaveAttribute(
      'src',
      'https://example.invalid/clips/clip-3.mp4',
    );
  });

  test('the toggle expands the set and is wired to the list it controls', async ({ page }) => {
    await gotoStory(page, 'components-pvideogallery--default');

    // Located by class, not by accessible name: the name is the thing under
    // test and flips to "Show fewer" the moment it is clicked.
    const toggle = page.locator('.p-video-gallery__toggle');
    await expect(toggle).toHaveText('Show all 9 clips');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');

    const listId = await page.locator('.p-video-gallery__list').getAttribute('id');
    expect(await toggle.getAttribute('aria-controls')).toBe(listId);

    await toggle.click();
    await expect(page.locator('.p-video-gallery__poster')).toHaveCount(9);
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(toggle).toHaveText('Show fewer');

    await toggle.click();
    await expect(page.locator('.p-video-gallery__poster')).toHaveCount(6);
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('renders no toggle when nothing is hidden', async ({ page }) => {
    await gotoStory(page, 'components-pvideogallery--without-toggle');

    await expect(page.locator('.p-video-gallery__poster')).toHaveCount(3);
    await expect(page.locator('.p-video-gallery__toggle')).toHaveCount(0);
  });

  test('has no accessibility violations', async ({ page }) => {
    await gotoStory(page, 'components-pvideogallery--default');
    await expectNoA11yViolations(page);
  });
});

test.describe('PPhotoLightbox', () => {
  test('opens from a mosaic tile at the index that was clicked', async ({ page }) => {
    await gotoStory(page, 'components-pphotolightbox--default');
    await expect(page.locator('.yarl__portal_open')).toHaveCount(0);

    await page.locator('.p-photo-mosaic__tile--row').nth(1).click();

    const portal = page.locator('.yarl__portal_open');
    await expect(portal).toBeVisible();
    // Counter is 1-based; tile index 2 is the third photo.
    await expect(page.locator('.yarl__counter')).toHaveText('3 / 24');
  });

  test('does not wrap past the last photo', async ({ page }) => {
    await gotoStory(page, 'components-pphotolightbox--open-at-index');
    await expect(page.locator('.yarl__portal_open')).toBeVisible();

    const previous = page.getByRole('button', { name: 'Previous photo' });
    for (let i = 0; i < 3; i += 1) {
      await previous.click();
    }

    await expect(page.locator('.yarl__counter')).toHaveText('1 / 24');
    // `finite` — the first photo does not silently loop round to the last.
    await expect(previous).toBeDisabled();
  });

  test('closes on the X button but not on the letterboxed backdrop', async ({ page }) => {
    await gotoStory(page, 'components-pphotolightbox--open-at-index');
    const portal = page.locator('.yarl__portal_open');
    await expect(portal).toBeVisible();

    // Photos are letterboxed, so the dead bands beside a portrait shot read as
    // part of the viewer. Tapping there is for looking, not for leaving.
    await page.locator('.yarl__container').click({ position: { x: 4, y: 4 } });
    await expect(portal).toBeVisible();

    await page.getByRole('button', { name: 'Close the Jose Albin — Day 1 gallery' }).click();
    await expect(page.locator('.yarl__portal_open')).toHaveCount(0);
  });

  test('adds a whole-set download only when an archive URL is given', async ({ page }) => {
    await gotoStory(page, 'components-pphotolightbox--open-at-index');

    const archive = page.getByRole('link', {
      name: 'Download all 24 photos from Jose Albin — Day 1 as a ZIP file',
    });
    await expect(archive).toBeVisible();
    // A plain anchor, not a scripted download: no CORS, no fetch, no memory spike.
    await expect(archive).toHaveAttribute('href', /\.zip$/);
    await expect(archive).toHaveAttribute('download', 'jose-albin-day-1.zip');
  });

  test('omits the whole-set download when there is no archive', async ({ page }) => {
    await gotoStory(page, 'components-pphotolightbox--unlabelled');

    await expect(page.locator('.yarl__portal_open')).toBeVisible();
    await expect(page.locator('.p-photo-lightbox__action')).toHaveCount(0);
    // Without a label the announcements drop the set prefix rather than
    // rendering a dangling "from ".
    await expect(page.getByRole('button', { name: 'Close gallery' })).toBeVisible();
  });

  test('themes the backdrop through a design-system token', async ({ page }) => {
    await gotoStory(page, 'components-pphotolightbox--open-at-index');

    // The library's stylesheet is unlayered and would beat a layered override,
    // so the variable is set inline and reads our token.
    await expect(page.locator('.yarl__container')).toHaveCSS(
      'background-color',
      'rgba(0, 0, 0, 0.92)',
    );
  });
});
