import type { CatalogCssToken, CatalogToken, TokenTier } from './types.js';

type RawDeclaration = { name: string; value: string; group: string; afterComponentHeading: boolean };

const COMPONENT_HEADING = /^component tokens$/i;
const MAX_VAR_DEPTH = 12;

/** Returns the body of the first `selector { ... }` block, honoring nested braces. */
export function extractBlock(css: string, selector: string): string | undefined {
  const start = css.indexOf(selector);
  if (start === -1) return undefined;
  const open = css.indexOf('{', start);
  if (open === -1) return undefined;

  let depth = 0;
  for (let index = open; index < css.length; index += 1) {
    if (css[index] === '{') depth += 1;
    if (css[index] === '}') depth -= 1;
    if (depth === 0) return css.slice(open + 1, index);
  }
  return undefined;
}

/**
 * A comment is a group heading when it is a short single-line label
 * ("Spacing tokens"). Explanatory comments end in a period or span lines and
 * must not rename the group of the declarations that follow them.
 */
function toHeading(comment: string): string | undefined {
  const text = comment.trim();
  if (text.includes('\n') || text.endsWith('.') || text.length > 80) return undefined;
  return text;
}

function parseDeclarations(block: string): RawDeclaration[] {
  const declarations: RawDeclaration[] = [];
  const pattern = /\/\*([\s\S]*?)\*\/|(--[\w-]+)\s*:\s*([^;{}]+);/g;
  let group = 'Ungrouped';
  let afterComponentHeading = false;

  for (const match of block.matchAll(pattern)) {
    if (match[1] !== undefined) {
      const heading = toHeading(match[1]);
      if (heading) {
        group = heading;
        if (COMPONENT_HEADING.test(heading)) afterComponentHeading = true;
      }
      continue;
    }
    declarations.push({
      name: match[2],
      value: match[3].replace(/\s+/g, ' ').trim(),
      group,
      afterComponentHeading,
    });
  }
  return declarations;
}

/**
 * Tier follows the file's own layout rather than a name list, so new tokens
 * classify themselves: everything after the "Component tokens" heading is
 * component-tier; before it, raw values are base scales and anything that
 * references another token (or sits under a "Semantic" heading) is semantic.
 */
function toTier(declaration: RawDeclaration): TokenTier {
  if (declaration.afterComponentHeading) return 'component';
  if (/semantic/i.test(declaration.group)) return 'semantic';
  return declaration.value.includes('var(') ? 'semantic' : 'base';
}

export function resolveValue(value: string, scope: Map<string, string>, depth = 0): string {
  if (depth > MAX_VAR_DEPTH || !value.includes('var(')) return value;
  const next = value.replace(
    /var\(\s*(--[\w-]+)\s*(?:,\s*([^()]*(?:\([^()]*\))?[^()]*))?\)/g,
    (whole, name: string, fallback: string | undefined) => scope.get(name) ?? fallback?.trim() ?? whole,
  );
  return next === value ? value : resolveValue(next, scope, depth + 1);
}

export function parseThemeCss(css: string): CatalogToken[] {
  const lightBlock = extractBlock(css, "[data-theme='light']");
  if (!lightBlock) {
    throw new Error("theme.css: no [data-theme='light'] block found; cannot build the token catalog.");
  }
  const light = parseDeclarations(lightBlock);
  const darkOverrides = new Map(
    parseDeclarations(extractBlock(css, "[data-theme='dark']") ?? '').map((d) => [d.name, d.value]),
  );

  const lightScope = new Map(light.map((d) => [d.name, d.value]));
  const darkScope = new Map([...lightScope, ...darkOverrides]);

  return light.map((declaration) => {
    const dark = darkOverrides.get(declaration.name) ?? declaration.value;
    const resolvedLight = resolveValue(declaration.value, lightScope);
    const resolvedDark = resolveValue(dark, darkScope);
    return {
      name: declaration.name,
      tier: toTier(declaration),
      group: declaration.group,
      light: declaration.value,
      dark,
      resolvedLight,
      resolvedDark,
      changesInDark: resolvedLight !== resolvedDark,
    };
  });
}

/** First declaration of each `--p-*` custom property in a component stylesheet. */
export function parseCssTokens(css: string): CatalogCssToken[] {
  const seen = new Map<string, string>();
  for (const match of css.matchAll(/(--p-[\w-]+)\s*:\s*([^;{}]+);/g)) {
    if (!seen.has(match[1])) seen.set(match[1], match[2].replace(/\s+/g, ' ').trim());
  }
  return [...seen].map(([name, value]) => ({ name, value }));
}
