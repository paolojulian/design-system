import { readFileSync } from 'node:fs';
import type { Catalog } from './catalog/types.js';

const CATALOG_URL = new URL('./catalog.json', import.meta.url);

export function loadCatalog(url: URL = CATALOG_URL): Catalog {
  let raw: string;
  try {
    raw = readFileSync(url, 'utf8');
  } catch (error) {
    throw new Error(`Catalog not found at ${url.pathname}. Run \`npm run build\` in mcp/ to generate it.`, {
      cause: error,
    });
  }

  const catalog = JSON.parse(raw) as Partial<Catalog>;
  const sections = ['components', 'icons', 'tokens', 'guides'] as const;
  const broken = sections.filter((section) => !Array.isArray(catalog[section]));
  if (!catalog.package || broken.length > 0) {
    throw new Error(`Catalog at ${url.pathname} is malformed (bad: ${['package', ...broken].join(', ')}). Rebuild it.`);
  }
  return catalog as Catalog;
}
