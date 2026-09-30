import assert from 'node:assert/strict';
import { test } from 'node:test';
import { loadCatalog } from '../load-catalog.js';
import { findComponent, searchComponents, searchTokens, tokenize } from '../search.js';

const catalog = loadCatalog(new URL('../catalog.json', import.meta.url));
const get = (name: string) => {
  const component = findComponent(catalog, name);
  assert.ok(component, `${name} should be in the catalog`);
  return component;
};
const prop = (componentName: string, propName: string) => get(componentName).props.find((p) => p.name === propName);

test('names are unique', () => {
  const components = catalog.components.map((c) => c.name);
  const tokens = catalog.tokens.map((t) => t.name);
  assert.equal(new Set(components).size, components.length);
  assert.equal(new Set(tokens).size, tokens.length);
});

test('props expose literal values, defaults, and descriptions', () => {
  const variant = prop('PButton', 'variant');
  assert.ok(variant);
  assert.match(variant.type, /'primary'/);
  assert.match(variant.type, /'danger'/);
  assert.equal(variant.required, false);
  assert.equal(variant.defaultValue, "'primary'");
  assert.ok(variant.description);
  assert.equal(prop('PButton', 'isLoading')?.type, 'boolean');
  assert.equal(prop('PButton', 'children')?.required, true);
});

test('native DOM attributes are summarised, not listed', () => {
  const button = get('PButton');
  for (const native of ['onClick', 'aria-label', 'id', 'ref', 'key']) {
    assert.equal(prop('PButton', native), undefined, `${native} comes from React's types`);
  }
  assert.deepEqual(button.inheritedAttributes, ['AnchorHTMLAttributes', 'ButtonHTMLAttributes']);
});

test('union discriminators do not leak as props', () => {
  // `href?: undefined` on the button variant must not make href read as "undefined | string".
  assert.equal(prop('PButton', 'href')?.type, 'string');
  assert.equal(prop('PButton', 'href')?.required, false);
  assert.equal(prop('PButton', 'type'), undefined);
});

test('entries map to the right import path', () => {
  assert.equal(get('PButton').importStatement, "import { PButton } from '@paolojulian.dev/design-system';");
  assert.equal(get('PPhotoLightbox').entry, './gallery');
  assert.equal(
    get('PPhotoLightbox').importStatement,
    "import { PPhotoLightbox } from '@paolojulian.dev/design-system/gallery';",
  );
  assert.equal(get('EButton').entry, './elle');
  assert.equal(get('EButton').importStatement, "import { EButton } from '@paolojulian.dev/design-system/elle';");
  assert.equal(get('EButton').storybookTitle, 'Elle/EButton');
});

test('non-component exports are classified', () => {
  assert.equal(get('toast').kind, 'function');
  assert.match(get('toast').signature ?? '', /^toast\(/);
  assert.equal(get('PDatePickerPresets').kind, 'constant');
  assert.match(get('PDatePickerPresets').signature ?? '', /today/);
  assert.equal(get('PRadioGroup').kind, 'component');
  assert.ok(get('PRadioGroup').stories.length > 0, 'shares the PRadio stories file');
});

test('the P prefix is optional on lookup', () => {
  assert.equal(findComponent(catalog, 'button')?.name, 'PButton');
  assert.equal(findComponent(catalog, ' pbutton ')?.name, 'PButton');
  assert.equal(findComponent(catalog, 'nope'), undefined);
});

test('the P prefix does not hide a component name from search', () => {
  assert.deepEqual(tokenize('PSwitch'), ['switch']);
  assert.deepEqual(tokenize('PDateRangePicker'), ['date', 'range', 'picker']);
  assert.deepEqual(tokenize('--p-color-neutral-50'), ['color', 'neutral', '50']);
});

test('generic UI vocabulary finds the right component', () => {
  const top = (query: string, n = 3) => searchComponents(catalog, query, n).map((r) => r.item.name);
  assert.ok(top('dropdown').includes('PSelect'));
  assert.ok(top('searchable dropdown').includes('PCombobox'));
  assert.equal(top('confirmation dialog')[0], 'PModal');
  assert.ok(top('notification').includes('PToast'));
  assert.equal(top('toggle')[0], 'PSwitch');
  assert.equal(top('date range')[0], 'PDateRangePicker');
  assert.equal(top('PTable')[0], 'PTable');
  assert.deepEqual(top('zzzqqq'), []);
});

test('tokens are searchable by role, tier, and literal value', () => {
  const names = (query: string, tier?: 'base' | 'semantic' | 'component') =>
    searchTokens(catalog, query, { tier, limit: 10 }).map((r) => r.item.name);

  assert.ok(names('focus').includes('--p-color-focus'));
  assert.ok(names('surface', 'semantic').every((name) => !/neutral-\d/.test(name)));

  const focus = catalog.tokens.find((t) => t.name === '--p-color-focus');
  assert.ok(focus);
  assert.ok(names(focus.resolvedLight).includes('--p-color-focus'), 'a hex value finds tokens resolving to it');
});

test('dark theme regressions fixed in todo 00 are visible through the catalog', () => {
  const hover = catalog.tokens.find((t) => t.name === '--p-control-bg-hover');
  assert.ok(hover);
  assert.equal(hover.tier, 'component');
  assert.equal(hover.changesInDark, true);
  assert.notEqual(hover.resolvedDark, hover.resolvedLight);
});

test('guides cover theming and design rules', () => {
  const topics = catalog.guides.map((g) => g.topic);
  for (const topic of ['installation', 'theming', 'design-tokens', 'design-rules']) assert.ok(topics.includes(topic), topic);
  for (const meta of ['development', 'mcp-server']) assert.ok(!topics.includes(meta), `${meta} is not design guidance`);
  assert.match(catalog.guides.find((g) => g.topic === 'theming')?.content ?? '', /data-theme/);
});
