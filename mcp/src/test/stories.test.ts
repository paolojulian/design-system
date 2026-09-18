import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { toDocsUrl, toStoryId, toStoryUrl } from '../catalog/stories.js';
import { loadCatalog } from '../load-catalog.js';

test('story ids follow Storybook CSF rules', () => {
  assert.equal(toStoryId('Components/PButton', 'Primary'), 'components-pbutton--primary');
  assert.equal(toStoryId('Components/PButton', 'WithLeftIcon'), 'components-pbutton--with-left-icon');
  assert.equal(toStoryId('Components/PTypography', 'Heading1'), 'components-ptypography--heading-1');
  assert.equal(toStoryId('Components/PTable', 'AsHTMLTable'), 'components-ptable--as-html-table');
  assert.equal(toStoryId('Forms / Inputs', 'with_error'), 'forms-inputs--with-error');
});

test('urls tolerate a trailing slash on the Storybook base', () => {
  assert.equal(toStoryUrl('https://sb.test/', 'a--b'), 'https://sb.test/?path=/story/a--b');
  assert.equal(toDocsUrl('https://sb.test', 'Components/PCard'), 'https://sb.test/?path=/docs/components-pcard--docs');
});

// The real check: every link the MCP hands out must exist in an actual Storybook build.
const indexPath = fileURLToPath(new URL('../../../storybook-static/index.json', import.meta.url));
test(
  'every catalog story id exists in the built Storybook index',
  { skip: existsSync(indexPath) ? false : 'storybook-static/index.json not built' },
  () => {
    const index = JSON.parse(readFileSync(indexPath, 'utf8')) as { entries: Record<string, unknown> };
    const known = new Set(Object.keys(index.entries));
    const catalog = loadCatalog(new URL('../catalog.json', import.meta.url));
    const missing = catalog.components.flatMap((component) =>
      component.stories.filter((story) => !known.has(story.id)).map((story) => `${component.name}: ${story.id}`),
    );
    assert.deepEqual(missing, []);
    assert.ok(catalog.components.some((component) => component.stories.length > 0));
  },
);
