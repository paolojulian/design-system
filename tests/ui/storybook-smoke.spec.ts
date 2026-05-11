import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';

const storyUrl = (id: string) => `/iframe.html?id=${id}&viewMode=story`;
const lightControlTextColor = 'rgb(17, 17, 17)';

function getCurrentMonthRangeLabel() {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return `${formatter.format(start)} - ${formatter.format(end)}`;
}

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

async function expectGridColumnCount(page: Page, selector: string, count: number) {
  const columns = await page
    .locator(selector)
    .first()
    .evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(' ').length);

  expect(columns).toBe(count);
}

async function expectElementWidthAtLeast(page: Page, selector: string, width: number) {
  const box = await page.locator(selector).first().boundingBox();
  expect(box?.width).toBeGreaterThanOrEqual(width);
}

test.describe('Storybook smoke tests', () => {
  test('renders button actions and link semantics', async ({ page }) => {
    await gotoStory(page, 'components-pbutton--primary');
    await expect(page.getByRole('button', { name: 'Button' })).toBeVisible();

    await gotoStory(page, 'components-pbutton--loading');
    const loadingButton = page.getByRole('button', { name: 'Saving' });
    await expect(loadingButton).toBeDisabled();
    await expect(loadingButton).toHaveAttribute('aria-busy', 'true');

    await gotoStory(page, 'components-pbutton--active');
    await expect(page.getByRole('button', { name: 'Current view' })).toHaveAttribute(
      'data-active',
      'true',
    );

    await gotoStory(page, 'components-pbutton--pinging');
    await expect(page.getByRole('button', { name: 'Review now' })).toHaveClass(/p-button--pinging/);

    await gotoStory(page, 'components-pbutton--link');
    await expect(page.getByRole('link', { name: 'Open details' })).toBeVisible();
  });

  test('renders badge variants, icons, and truncation', async ({ page }) => {
    await gotoStory(page, 'components-pbadge--default');
    await expect(page.getByText('Active')).toBeVisible();

    const badge = page.locator('.p-badge').first();
    await expect(badge).toHaveCSS('display', 'inline-flex');

    await gotoStory(page, 'components-pbadge--with-icon');
    await expect(page.getByText('Online')).toBeVisible();
    await expect(page.locator('.p-badge__icon')).toHaveCount(1);

    await gotoStory(page, 'components-pbadge--pinging');
    await expect(page.locator('.p-badge', { hasText: 'Live' })).toHaveClass(/p-badge--pinging/);

    await gotoStory(page, 'components-pbadge--truncated');
    const truncatedBadge = page.locator('.p-badge').first();
    const truncatedBox = await truncatedBadge.boundingBox();
    expect(truncatedBox?.width).toBeLessThanOrEqual(120);
  });

  test('renders the critical typography stories', async ({ page }) => {
    await gotoStory(page, 'components-ptypography--body-wide');
    await expect(page.getByText('AVANT GARDE')).toBeVisible();

    await gotoStory(page, 'components-ptypography--heading');
    await expect(page.getByText('This is a heading')).toBeVisible();

    await gotoStory(page, 'components-ptypography--serif');
    await expect(page.getByText(/Lorem ipsum dolor sit amet/).first()).toBeVisible();
  });

  test('renders section header indexed hierarchy', async ({ page }) => {
    await gotoStory(page, 'components-psectionheader--indexed');

    await expect(page.getByText('01')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Portfolio Health' })).toBeVisible();
    await expect(page.locator('.p-section-header__mark')).toHaveText('-');
    await expect(page.locator('.p-section-header__divider')).toHaveText('\\');
  });

  test('keeps the Serif variant on the enterprise serif contract', async ({ page }) => {
    await gotoStory(page, 'components-ptypography--serif');

    const serifText = page.getByText(/Lorem ipsum dolor sit amet/).first();
    await expect(serifText).toBeVisible();

    const fontFamily = await serifText.evaluate((element) => getComputedStyle(element).fontFamily);
    expect(fontFamily).toContain('Lora');
  });

  test('renders text input states and announces errors', async ({ page }) => {
    await gotoStory(page, 'components-ptextinput--with-helper-text');
    const textInputBox = await page.getByLabel('Email').boundingBox();
    const placeholderLabelBox = await page.locator('.p-text-input__placeholder-label').boundingBox();
    const inputCenter = (textInputBox?.y ?? 0) + (textInputBox?.height ?? 0) / 2;
    const placeholderCenter = (placeholderLabelBox?.y ?? 0) + (placeholderLabelBox?.height ?? 0) / 2;
    expect(Math.abs(inputCenter - placeholderCenter)).toBeLessThanOrEqual(1);

    await page.getByLabel('Email').focus();
    await expect(page.locator('.p-text-input__floating-label')).toHaveCSS('color', lightControlTextColor);

    await gotoStory(page, 'components-ptextinput--with-error');

    await expect(page.getByLabel('Label')).toBeVisible();
    await expect(page.getByRole('alert')).toHaveText('This field is required.');

    await gotoStory(page, 'components-ptextinput--disabled');
    await expect(page.getByLabel('Label')).toBeDisabled();
  });

  test('keeps floating select labels neutral on focus', async ({ page }) => {
    await gotoStory(page, 'components-pselect--default');

    await page.locator('.p-select__control').focus();
    await expect(page.locator('.p-select__floating-label')).toHaveCSS('color', lightControlTextColor);
  });

  test('renders combobox search, selection, and mobile flow', async ({ page }) => {
    await gotoStory(page, 'components-pcombobox--standard');

    const combobox = page.getByRole('combobox', { name: 'Account owner' });
    await expect(combobox).toBeVisible();
    await expectElementWidthAtLeast(page, '.p-combobox', 350);

    await combobox.click();
    await expect(page.locator('.p-combobox__floating-label')).toHaveCSS('color', lightControlTextColor);
    await expect(page.getByRole('listbox', { name: 'Account owner' })).toBeVisible();
    const desktopPanelBox = await page.locator('.p-combobox__panel').boundingBox();
    const desktopMessageBox = await page.locator('.p-combobox__message').boundingBox();
    expect(desktopPanelBox?.y).toBeLessThan(desktopMessageBox?.y ?? 0);
    await combobox.fill('security');
    await expect(page.getByRole('option', { name: /Samuel Lee/ })).toBeVisible();
    await page.getByRole('option', { name: /Samuel Lee/ }).click();
    await expect(combobox).toHaveValue('Samuel Lee');

    await combobox.click();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(combobox).not.toHaveValue('');

    await page.setViewportSize({ width: 390, height: 844 });
    await gotoStory(page, 'components-pcombobox--standard');
    const mobileCombobox = page.getByRole('combobox', { name: 'Account owner', exact: true });
    await mobileCombobox.click();
    await expect(page.getByRole('listbox', { name: 'Account owner' })).toBeVisible();
    await expect(mobileCombobox).not.toBeFocused();
    await expect(page.getByRole('dialog', { name: 'Account owner' })).toBeVisible();
    await expect(page.getByRole('combobox', { name: 'Search Account owner' })).toBeFocused();

    const panelPosition = await page
      .locator('.p-combobox__panel')
      .evaluate((element) => getComputedStyle(element).position);
    expect(panelPosition).toBe('fixed');
    const mobilePanelBox = await page.locator('.p-combobox__panel').boundingBox();
    const mobileInputBox = await mobileCombobox.boundingBox();
    expect(mobilePanelBox?.height).toBeGreaterThanOrEqual(422);
    expect(mobilePanelBox?.y ?? 0).toBeLessThan(mobileInputBox?.y ?? 0);
    await expect(page.getByRole('button', { name: 'Close Account owner' })).toBeVisible();

    await page.setViewportSize({ width: 768, height: 1024 });
    await gotoStory(page, 'components-pcombobox--standard');
    const tabletCombobox = page.getByRole('combobox', { name: 'Account owner', exact: true });
    await tabletCombobox.click();
    const tabletPanelPosition = await page
      .locator('.p-combobox__panel')
      .evaluate((element) => getComputedStyle(element).position);
    expect(tabletPanelPosition).toBe('fixed');
    const tabletPanelBox = await page.locator('.p-combobox__panel').boundingBox();
    const tabletInputBox = await tabletCombobox.boundingBox();
    expect(tabletPanelBox?.height).toBeGreaterThanOrEqual(510);
    expect(tabletPanelBox?.y ?? 0).toBeLessThan(tabletInputBox?.y ?? 0);
    await expect(tabletCombobox).not.toBeFocused();
    await expect(page.getByRole('dialog', { name: 'Account owner' })).toBeVisible();
    await expect(page.getByRole('combobox', { name: 'Search Account owner' })).toBeFocused();
  });

  test('renders combobox remote loading and pagination flow', async ({ page }) => {
    await gotoStory(page, 'components-pcombobox--async-infinite-loading');

    const combobox = page.getByRole('combobox', { name: 'Account API' });
    await combobox.click();
    await expect(page.getByRole('option', { name: /Loading accounts/ })).toBeVisible();
    await expect(page.getByRole('option', { name: /Northstar 1/ })).toBeVisible();

    await combobox.fill('account');
    await expect(page.getByRole('option', { name: /Loading accounts/ })).toBeVisible();
    await expect(page.getByRole('option', { name: /Security review/ }).first()).toBeVisible();

    await page.getByRole('button', { name: 'Load next page' }).click();
    await expect(page.getByText('Loading more accounts...')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Load next page' })).toBeVisible();
    await page.getByRole('button', { name: 'Load next page' }).click();
    await expect(page.getByText('Loading more accounts...')).toBeVisible();
  });

  test('keeps combobox selection and form validity tied to committed values', async ({ page }) => {
    await gotoStory(page, 'components-pcombobox--selected-option-mismatch');
    await expect(page.getByRole('combobox', { name: 'Mismatched owner' })).toHaveValue('Nina Patel');

    await gotoStory(page, 'components-pcombobox--required-form-field');
    const invalidBeforeSelection = await page
      .locator('input[name="approvalOwner"]')
      .evaluate((element) => (element as HTMLInputElement).checkValidity());
    expect(invalidBeforeSelection).toBe(false);
  });

  test('renders responsive enterprise table states', async ({ page }) => {
    await gotoStory(page, 'components-ptable--standard');
    await expect(page.getByRole('table', { name: 'Enterprise accounts' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Account' })).toHaveAttribute(
      'aria-sort',
      'ascending',
    );
    await expect(page.getByRole('cell', { name: 'Acme Industrial' })).toBeVisible();
    const accountHeaderBox = await page.getByRole('columnheader', { name: 'Account' }).boundingBox();
    const accountCellBox = await page.getByRole('cell', { name: 'Acme Industrial' }).boundingBox();
    expect(Math.abs((accountHeaderBox?.x ?? 0) - (accountCellBox?.x ?? 0))).toBeLessThanOrEqual(1);
    await expect(page.locator('.p-table__viewport')).toHaveCSS('overflow-x', 'auto');

    await page.setViewportSize({ width: 768, height: 1024 });
    await gotoStory(page, 'components-ptable--standard');
    await expect(page.locator('.p-table__viewport')).toBeVisible();
    await expect(page.locator('.p-table__mobile-list')).toBeHidden();
    await expect(page.getByRole('columnheader', { name: 'Risk' })).toBeAttached();
    const tabletViewportBox = await page.locator('.p-table__viewport').boundingBox();
    const tabletTableBox = await page.locator('.p-table__table').boundingBox();
    expect(tabletTableBox?.width).toBeGreaterThan(tabletViewportBox?.width ?? 0);
    await expect(page.locator('.p-table__scroll-shadow')).toHaveCount(0);
    const documentWidth = await page.evaluate(() =>
      Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
    );
    expect(documentWidth).toBeLessThanOrEqual(768);
    const tabletAccountHeaderBox = await page.getByRole('columnheader', { name: 'Account' }).boundingBox();
    const tabletAccountCellBox = await page.getByRole('cell', { name: 'Acme Industrial' }).boundingBox();
    expect(Math.abs((tabletAccountHeaderBox?.x ?? 0) - (tabletAccountCellBox?.x ?? 0))).toBeLessThanOrEqual(1);

    await page.setViewportSize({ width: 390, height: 844 });
    await gotoStory(page, 'components-ptable--standard');
    await expect(page.locator('.p-table__viewport')).toBeHidden();
    await expect(page.locator('.p-table__mobile-list')).toBeVisible();
    await expect(page.locator('.p-table__mobile-row').first()).toContainText('Acme Industrial');
    await expect(page.locator('.p-table__mobile-field').first()).toContainText('Owner');

    await gotoStory(page, 'components-ptable--loading');
    await expect(page.locator('.p-table__mobile-state').getByText('Loading table data...')).toBeVisible();

    await gotoStory(page, 'components-ptable--empty');
    await expect(page.locator('.p-table__mobile-state').getByText('No matching accounts')).toBeVisible();

    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoStory(page, 'components-ptable--interactive-rows');
    const accountRow = page.getByRole('row', { name: /Acme Industrial/ });
    await accountRow.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByText('Selected Acme Industrial')).toBeVisible();
    const firstReviewAction = page.getByRole('button', { name: 'Review' }).first();
    await expect(firstReviewAction).toBeVisible();
    const firstReviewActionBox = await firstReviewAction.boundingBox();
    const firstActionCellBox = await page.locator('.p-table__actions-cell').first().boundingBox();
    expect(firstReviewActionBox?.width).toBeGreaterThan(100);
    expect(firstActionCellBox?.width).toBeGreaterThan(180);
    await firstReviewAction.click();
    await expect(page.getByText('Reviewing Acme Industrial')).toBeVisible();
  });

  test('renders pagination controls and responsive card grids', async ({ page }) => {
    await gotoStory(page, 'components-ppagination--standard');
    await expect(page.getByRole('navigation', { name: 'Pagination' })).toBeVisible();
    await expect(page.getByText('Showing 101-120 of 476 records')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Go to page 6' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(page.getByRole('combobox', { name: 'Rows per page' })).toBeVisible();
    await page.getByRole('button', { name: 'Go to next page' }).click();
    await expect(page.getByText('Showing 121-140 of 476 records')).toBeVisible();
    await page.getByRole('combobox', { name: 'Rows per page' }).selectOption('50');
    await expect(page.getByText('Showing 1-50 of 476 records')).toBeVisible();

    await page.setViewportSize({ width: 390, height: 844 });
    await gotoStory(page, 'components-ppagination--standard');
    const paginationControls = await page.locator('.p-pagination__controls').boundingBox();
    const previousButton = await page.getByRole('button', { name: 'Go to previous page' }).boundingBox();
    expect(paginationControls?.width).toBeLessThanOrEqual(390);
    expect(previousButton?.height).toBeGreaterThanOrEqual(44);

    await gotoStory(page, 'components-ppagination--without-rows-per-page');
    await expect(page.getByRole('combobox', { name: 'Rows per page' })).toHaveCount(0);

    await page.setViewportSize({ width: 1024, height: 768 });
    await gotoStory(page, 'components-pcardgrid--four-cards');
    await expect(page.locator('.p-card-grid')).toBeVisible();
    await expectGridColumnCount(page, '.p-card-grid', 2);
    await expect(page.locator('.p-card')).toHaveCount(4);
    await expect(page.locator('.p-card-grid')).toHaveCSS('column-gap', '1px');
    await expect(page.locator('.p-card-grid')).toHaveCSS('border-top-width', '1px');
    await expect(page.locator('.p-card-grid')).toHaveCSS('border-top-left-radius', '4px');
    await expect(page.locator('.p-card').first()).toHaveCSS('border-top-width', '0px');
    await expect(page.locator('.p-card').first()).toHaveCSS('border-top-left-radius', '0px');

    await page.setViewportSize({ width: 390, height: 844 });
    await gotoStory(page, 'components-pcardgrid--four-cards');
    await expectGridColumnCount(page, '.p-card-grid', 1);
  });

  test('renders date picker standard and preset flows', async ({ page }) => {
    await gotoStory(page, 'components-pdatepicker--standard');
    await expect(page.getByLabel('Due date')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Due date: May 10, 2026' })).toBeVisible();
    await expect(page.locator('.p-date-picker__label')).toHaveCount(0);
    await expect(page.locator('.p-date-picker__trigger-floating-label')).toHaveText('Due date');
    await expectElementWidthAtLeast(page, '.p-date-picker', 350);
    await page.getByLabel('Due date').click();
    await expect(page.locator('.p-date-picker__trigger-floating-label')).toHaveCSS('color', lightControlTextColor);
    await expect(page.getByRole('dialog', { name: 'May 2026' })).toBeVisible();
    const selectedDueDate = page.getByRole('gridcell', { name: 'Sunday, May 10, 2026' });
    await expect(selectedDueDate).toHaveAttribute('aria-selected', 'true');
    await expect(selectedDueDate).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('gridcell', { name: 'Monday, May 11, 2026' })).toBeFocused();
    await page.getByRole('combobox', { name: 'Month' }).selectOption('6');
    await expect(page.getByRole('dialog', { name: 'July 2026' })).toBeVisible();
    await page.getByRole('combobox', { name: 'Year' }).selectOption('2027');
    await expect(page.getByRole('dialog', { name: 'July 2027' })).toBeVisible();

    await gotoStory(page, 'components-pdatepicker--with-presets');
    await expect(page.getByRole('group', { name: 'Report date' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Today' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Yesterday' })).toBeVisible();
    await expectGridColumnCount(page, '.p-date-picker__presets', 3);
    await expectElementWidthAtLeast(page, '.p-date-picker', 350);
    await page.getByRole('button', { name: 'Custom' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('gridcell', { name: 'Friday, May 15, 2026' }).click();
    await expect(page.getByRole('button', { name: 'Custom' })).toBeVisible();
    await expect(page.locator('.p-date-picker__label-value')).toHaveText('May 15, 2026');

    await gotoStory(page, 'components-pdatepicker--sample-with-other-fields');
    const ownerBefore = await page.getByLabel('Owner').boundingBox();
    await page.getByRole('button', { name: 'Custom' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    const ownerAfter = await page.getByLabel('Owner').boundingBox();
    expect(ownerAfter?.y).toBeGreaterThan(ownerBefore?.y ?? 0);

    await gotoStory(page, 'components-pdatepicker--with-bounds');
    await page.getByLabel(/Booking date/).click();
    await expect(page.getByRole('button', { name: 'Previous month' })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Next month' })).toBeDisabled();
    const disabledMonthOptions = await page
      .getByRole('combobox', { name: 'Month' })
      .evaluate((element) =>
        Array.from((element as HTMLSelectElement).options).filter((option) => option.disabled).length,
      );
    expect(disabledMonthOptions).toBe(11);

    await gotoStory(page, 'components-pdatepicker--alternate-presets');
    await expect(page.getByRole('button', { name: 'Yesterday' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Tomorrow' })).toBeVisible();

    await gotoStory(page, 'components-pdatepicker--presets-only');
    await expect(page.getByRole('button', { name: 'End of month' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Custom' })).toHaveCount(0);
  });

  test('renders date range picker selection and presets', async ({ page }) => {
    await gotoStory(page, 'components-pdaterangepicker--standard');
    await expect(page.getByRole('button', { name: /Report range/ })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Report range: May 1, 2026 - May 10, 2026' })).toBeVisible();
    await expect(page.locator('.p-date-range-picker__label')).toHaveCount(0);
    await expect(page.locator('.p-date-range-picker__trigger-floating-label')).toHaveText('Report range');
    await expectElementWidthAtLeast(page, '.p-date-range-picker', 350);
    await page.getByRole('button', { name: /Report range/ }).click();
    await expect(page.locator('.p-date-range-picker__trigger-floating-label')).toHaveCSS(
      'color',
      lightControlTextColor,
    );
    await expect(page.getByRole('dialog', { name: 'May 2026' })).toBeVisible();
    const rangeStart = page.getByRole('gridcell', { name: 'Friday, May 1, 2026' });
    await expect(rangeStart).toHaveAttribute('aria-selected', 'true');
    await expect(rangeStart).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('gridcell', { name: 'Friday, May 8, 2026' })).toBeFocused();
    await expect(page.getByRole('gridcell', { name: 'Sunday, May 10, 2026' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await page.getByRole('combobox', { name: 'Month' }).selectOption('6');
    await expect(page.getByRole('dialog', { name: 'July 2026' })).toBeVisible();
    await page.getByRole('combobox', { name: 'Year' }).selectOption('2027');
    await expect(page.getByRole('dialog', { name: 'July 2027' })).toBeVisible();

    await gotoStory(page, 'components-pdaterangepicker--empty');
    await page.getByRole('button', { name: /Booking range/ }).click();
    await page.getByRole('gridcell', { name: 'Monday, May 4, 2026' }).click();
    await page.getByRole('gridcell', { name: 'Friday, May 15, 2026' }).click();
    await expect(page.locator('.p-date-range-picker__label')).toHaveCount(0);
    await expect(page.locator('.p-date-range-picker__trigger-value')).toHaveText(
      'May 4, 2026 - May 15, 2026',
    );

    await gotoStory(page, 'components-pdaterangepicker--with-presets');
    await expect(page.getByRole('group', { name: /Analytics range/ })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Last 7 days' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'This month' })).toBeVisible();
    await expectGridColumnCount(page, '.p-date-range-picker__presets', 3);
    await expectElementWidthAtLeast(page, '.p-date-range-picker', 350);
    await page.getByRole('button', { name: 'This month' }).click();
    await expect(page.locator('.p-date-range-picker__label-value')).toHaveText(
      getCurrentMonthRangeLabel(),
    );
    await page.getByRole('button', { name: 'Custom' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await gotoStory(page, 'components-pdaterangepicker--with-bounds');
    await page.getByLabel(/Booking window/).click();
    await expect(page.getByRole('button', { name: 'Previous month' })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Next month' })).toBeDisabled();
    const disabledRangeMonthOptions = await page
      .getByRole('combobox', { name: 'Month' })
      .evaluate((element) =>
        Array.from((element as HTMLSelectElement).options).filter((option) => option.disabled).length,
      );
    expect(disabledRangeMonthOptions).toBe(11);

    await gotoStory(page, 'components-pdaterangepicker--presets-only');
    await expect(page.getByRole('button', { name: 'Year to date' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Custom' })).toHaveCount(0);
  });

  test('renders textarea states and announces errors', async ({ page }) => {
    await gotoStory(page, 'components-ptextarea--with-helper-text');
    await page.getByLabel('Bio').focus();
    await expect(page.locator('.p-text-area__floating-label')).toHaveCSS('color', lightControlTextColor);

    await gotoStory(page, 'components-ptextarea--with-error');

    await expect(page.getByLabel('Label')).toBeVisible();
    await expect(page.getByRole('alert')).toHaveText('This field is required.');
  });

  test('loads core controls on a mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoStory(page, 'components-ptextinput--default');

    const input = page.getByLabel('Label');
    await expect(input).toBeVisible();

    const box = await input.boundingBox();
    expect(box?.width).toBeLessThanOrEqual(390);
  });

  test('keeps mobile buttons within the viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoStory(page, 'components-pbutton--mobile');

    const button = page.getByRole('button', { name: 'Review and continue' });
    await expect(button).toBeVisible();

    const box = await button.boundingBox();
    expect(box?.width).toBeLessThanOrEqual(320);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  });

  test('renders a keyboard-focusable horizontal slider with overflow content', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoStory(page, 'components-phorizontalslider--default');

    const scroller = page.getByRole('region', { name: 'Featured content' });
    await expect(scroller).toBeVisible();
    await scroller.focus();
    await expect(scroller).toBeFocused();

    const metrics = await scroller.evaluate((element) => ({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
    }));

    expect(metrics.scrollWidth).toBeGreaterThan(metrics.clientWidth);
    await expect(page.getByRole('listitem')).toHaveCount(6);
  });

  test('renders highlight variants and custom colors', async ({ page }) => {
    await gotoStory(page, 'components-phighlight--hero-use-case');
    await expect(page.getByText('SIMPLE')).toBeVisible();

    const heroHighlight = page.locator('.p-highlight').first();
    await expect(heroHighlight).toHaveCSS('display', 'inline');
    await expect(heroHighlight).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');

    await gotoStory(page, 'components-phighlight--custom-color');
    const customHighlight = page.locator('.p-highlight').first();
    await expect(customHighlight).toHaveText('CUSTOM');
    await expect(customHighlight).toHaveCSS('color', 'rgb(17, 17, 17)');

    await gotoStory(page, 'components-phighlight--custom-background');
    const customBackgroundHighlight = page.locator('.p-highlight').first();
    await expect(customBackgroundHighlight).toHaveText('CUSTOM');
    await expect(customBackgroundHighlight).toHaveCSS('background-color', 'rgb(17, 17, 17)');
    await expect(customBackgroundHighlight).toHaveCSS('color', 'rgb(255, 255, 255)');
  });

  test('renders cards with metadata, description, and interactive semantics', async ({ page }) => {
    await gotoStory(page, 'components-pcard--default');
    await expect(page.getByText('01')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Pipeline overview' })).toBeVisible();
    await expect(page.getByText('A compact summary card for scanning enterprise workflows.')).toBeVisible();

    await gotoStory(page, 'components-pcard--with-metadata');
    await expect(page.getByText('Operations')).toBeVisible();

    await gotoStory(page, 'components-pcard--without-description');
    await expect(page.getByRole('heading', { name: 'Title-only card' })).toBeVisible();
    await expect(page.getByText('A compact summary card for scanning enterprise workflows.')).toHaveCount(0);

    await gotoStory(page, 'components-pcard--custom-width');
    const customWidthCard = await page.locator('.p-card').boundingBox();
    expect(customWidthCard?.width).toBeGreaterThanOrEqual(799);
    expect(customWidthCard?.width).toBeLessThanOrEqual(801);

    await gotoStory(page, 'components-pcard--custom-height');
    const customHeightCard = await page.locator('.p-card').boundingBox();
    expect(customHeightCard?.height).toBeGreaterThanOrEqual(239);
    expect(customHeightCard?.height).toBeLessThanOrEqual(241);

    await gotoStory(page, 'components-pcard--min-sizing');
    const minSizingCard = await page.locator('.p-card').boundingBox();
    expect(minSizingCard?.width).toBeGreaterThanOrEqual(360);
    expect(minSizingCard?.height).toBeGreaterThanOrEqual(220);

    await gotoStory(page, 'components-pcard--interactive');
    await expect(page.getByText('Operations')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Open account summary' })).toBeVisible();
  });
});

test.describe('Storybook accessibility checks', () => {
  for (const storyId of [
    'components-ptypography--body-wide',
    'components-pbadge--default',
    'components-pbadge--variants',
    'components-pbadge--appearances',
    'components-pbadge--with-icon',
    'components-pbadge--pinging',
    'components-pbutton--primary',
    'components-pbutton--secondary',
    'components-pbutton--danger',
    'components-pbutton--loading',
    'components-pbutton--active',
    'components-pbutton--pinging',
    'components-pbutton--mobile',
    'components-psectionheader--default',
    'components-psectionheader--indexed',
    'components-phighlight--default',
    'components-phighlight--hero-use-case',
    'components-phighlight--custom-color',
    'components-phighlight--custom-background',
    'components-ppagination--standard',
    'components-ppagination--cursor-based',
    'components-ppagination--loading',
    'components-pcardgrid--two-across',
    'components-pcardgrid--four-cards',
    'components-pcardgrid--auto-fit',
    'components-pcombobox--standard',
    'components-pcombobox--async-infinite-loading',
    'components-pcombobox--required-form-field',
    'components-pcombobox--with-error',
    'components-ptable--standard',
    'components-ptable--loading',
    'components-ptable--empty',
    'components-ptable--error-state',
    'components-ptable--interactive-rows',
    'components-pdatepicker--standard',
    'components-pdatepicker--with-presets',
    'components-pdatepicker--many-presets',
    'components-pdatepicker--presets-only',
    'components-pdatepicker--with-error',
    'components-pdaterangepicker--standard',
    'components-pdaterangepicker--with-presets',
    'components-pdaterangepicker--many-presets',
    'components-pdaterangepicker--presets-only',
    'components-pdaterangepicker--with-error',
    'components-pcard--default',
    'components-pcard--without-description',
    'components-pcard--custom-width',
    'components-pcard--custom-height',
    'components-pcard--min-sizing',
    'components-pcard--interactive',
    'components-phorizontalslider--default',
    'components-ptextinput--default',
    'components-ptextinput--with-error',
    'components-ptextarea--default',
    'components-ptextarea--with-error',
  ]) {
    test(`${storyId} has no detectable axe violations`, async ({ page }) => {
      await gotoStory(page, storyId);
      await expectNoA11yViolations(page);
    });
  }
});
