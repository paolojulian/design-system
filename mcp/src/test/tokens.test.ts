import assert from 'node:assert/strict';
import { test } from 'node:test';
import { extractBlock, parseCssTokens, parseThemeCss, resolveValue } from '../catalog/tokens.js';

const THEME = `
@theme { --legacy: 1px; }
[data-theme='light'] {
  color-scheme: light;
  /* Base color tokens */
  --p-color-neutral-50: #fafaf9;
  --p-color-neutral-800: #292524;
  /* Semantic color tokens */
  --p-color-surface: var(--p-color-neutral-50);
  --p-color-raw-semantic: #123456;
  /* Explains the next token. Must not become a group. */
  --p-color-overlay: rgb(17 17 17 / 0.44);
  /* Spacing tokens */
  --p-space-1: 0.25rem;
  --p-focus-ring-color: var(--p-color-surface);
  /* Component tokens */
  --p-control-bg: var(--p-color-surface);
  /* Overlay primitives (PModal) */
  --p-overlay-width: 40rem;
  --p-multi: 0 1px 2px
    var(--p-color-neutral-800);
}
[data-theme='dark'] {
  color-scheme: dark;
  --p-color-surface: var(--p-color-neutral-800);
}
`;

const byName = (name: string) => {
  const token = parseThemeCss(THEME).find((candidate) => candidate.name === name);
  assert.ok(token, `${name} should be parsed`);
  return token;
};

test('only --p custom properties from the light block become tokens', () => {
  const names = parseThemeCss(THEME).map((token) => token.name);
  assert.ok(!names.includes('--legacy'), '@theme legacy block is not part of the token API');
  assert.equal(new Set(names).size, names.length, 'token names are unique');
  assert.equal(names.length, 10);
});

test('tier is derived from the file layout', () => {
  assert.equal(byName('--p-color-neutral-50').tier, 'base');
  assert.equal(byName('--p-space-1').tier, 'base');
  assert.equal(byName('--p-color-surface').tier, 'semantic');
  assert.equal(byName('--p-color-raw-semantic').tier, 'semantic', 'raw value under a Semantic heading stays semantic');
  assert.equal(byName('--p-focus-ring-color').tier, 'semantic', 'references another token, so it is a role');
  assert.equal(byName('--p-control-bg').tier, 'component');
  assert.equal(byName('--p-overlay-width').tier, 'component', 'everything after "Component tokens" is component-tier');
});

test('explanatory comments do not rename the group', () => {
  assert.equal(byName('--p-color-overlay').group, 'Semantic color tokens');
  assert.equal(byName('--p-overlay-width').group, 'Overlay primitives (PModal)');
});

test('dark overrides flow through var() chains', () => {
  const surface = byName('--p-color-surface');
  assert.equal(surface.light, 'var(--p-color-neutral-50)');
  assert.equal(surface.dark, 'var(--p-color-neutral-800)');
  assert.equal(surface.resolvedLight, '#fafaf9');
  assert.equal(surface.resolvedDark, '#292524');
  assert.equal(surface.changesInDark, true);

  // Not overridden itself, but depends on a token that is.
  const control = byName('--p-control-bg');
  assert.equal(control.dark, control.light);
  assert.equal(control.resolvedDark, '#292524');
  assert.equal(control.changesInDark, true);

  assert.equal(byName('--p-space-1').changesInDark, false);
});

test('multi-line values are normalised and resolved in place', () => {
  assert.equal(byName('--p-multi').light, '0 1px 2px var(--p-color-neutral-800)');
  assert.equal(byName('--p-multi').resolvedLight, '0 1px 2px #292524');
});

test('resolveValue uses fallbacks, leaves unknowns intact, and terminates on cycles', () => {
  const scope = new Map([
    ['--a', 'var(--b)'],
    ['--b', 'var(--a)'],
  ]);
  assert.equal(resolveValue('var(--missing, 4px)', scope), '4px');
  assert.equal(resolveValue('var(--missing)', scope), 'var(--missing)');
  assert.match(resolveValue('var(--a)', scope), /^var\(--[ab]\)$/);
});

test('a theme without a light block fails loudly', () => {
  assert.throws(() => parseThemeCss(':root { --p-x: 1; }'), /no \[data-theme='light'\] block/);
});

test('extractBlock honors nested braces', () => {
  assert.equal(extractBlock('a { b { c: d; } e: f; } g { }', 'a')?.trim(), 'b { c: d; } e: f;');
  assert.equal(extractBlock('a { }', 'missing'), undefined);
});

test('component stylesheets report the first (default) declaration of each token', () => {
  const tokens = parseCssTokens(`
    .p-button { --p-button-bg: var(--p-color-action-primary); --other: 1; }
    .p-button--danger { --p-button-bg: var(--p-color-danger); --p-button-text: white; }
  `);
  assert.deepEqual(tokens, [
    { name: '--p-button-bg', value: 'var(--p-color-action-primary)' },
    { name: '--p-button-text', value: 'white' },
  ]);
});
