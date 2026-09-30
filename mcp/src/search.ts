import type { Catalog, CatalogComponent, CatalogToken, TokenTier } from './catalog/types.js';

/**
 * Agents ask in generic UI vocabulary ("dropdown", "dialog"), not in this
 * system's names. Each alias expands the query with the words this system uses;
 * it never names a component directly, so it cannot go stale when one is renamed.
 */
const ALIASES: Record<string, string[]> = {
  dropdown: ['select', 'combobox'],
  autocomplete: ['combobox'],
  typeahead: ['combobox'],
  dialog: ['modal'],
  popup: ['modal'],
  sidebar: ['drawer'],
  panel: ['drawer', 'sheet'],
  bottomsheet: ['sheet'],
  notification: ['toast', 'alert'],
  snackbar: ['toast'],
  banner: ['alert'],
  message: ['alert', 'toast'],
  toggle: ['switch'],
  tickbox: ['checkbox'],
  input: ['text', 'input', 'textarea'],
  field: ['form', 'input'],
  textbox: ['input'],
  calendar: ['date', 'picker'],
  daterange: ['date', 'range'],
  grid: ['table', 'grid'],
  datagrid: ['table'],
  pager: ['pagination'],
  paging: ['pagination'],
  tag: ['badge'],
  chip: ['badge'],
  pill: ['badge'],
  label: ['badge', 'form'],
  heading: ['typography', 'section', 'header'],
  text: ['typography'],
  title: ['typography', 'section'],
  image: ['photo', 'media'],
  images: ['photo', 'gallery'],
  gallery: ['photo', 'video', 'mosaic'],
  carousel: ['slider', 'horizontal'],
  lightbox: ['lightbox', 'photo'],
  layout: ['row', 'stack', 'grid'],
  flex: ['row', 'stack'],
  cta: ['button'],
  link: ['button'],
  colour: ['color'],
  padding: ['space'],
  margin: ['space'],
  gap: ['space'],
  rounded: ['radius'],
  corner: ['radius'],
  elevation: ['shadow'],
  animation: ['duration', 'ease'],
  transition: ['duration', 'ease'],
  font: ['font', 'typography'],
  bg: ['background', 'surface'],
  background: ['background', 'surface'],
  foreground: ['text'],
  outline: ['focus', 'border'],
  error: ['danger', 'error'],
  brand: ['action', 'brand'],
  primary: ['action', 'primary'],
};

export function tokenize(text: string): string[] {
  return text
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    // Acronym boundary: without it `PSwitch` stays one word and never matches "switch".
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 1 || /\d/.test(word));
}

/** Query words plus alias expansions. Expansions score lower than what the user actually typed. */
function expandQuery(query: string): { word: string; weight: number }[] {
  const words = tokenize(query);
  const expanded = new Map<string, number>();
  for (const word of words) {
    expanded.set(word, 1);
    const singular = word.endsWith('s') ? word.slice(0, -1) : undefined;
    if (singular && singular.length > 2 && !expanded.has(singular)) expanded.set(singular, 0.9);
    for (const alias of [...(ALIASES[word] ?? []), ...((singular && ALIASES[singular]) || [])]) {
      if (!expanded.has(alias)) expanded.set(alias, 0.6);
    }
  }
  return [...expanded].map(([word, weight]) => ({ word, weight }));
}

type Field = { text: string; weight: number };

function score(query: string, fields: Field[]): number {
  let total = 0;
  for (const { word, weight: wordWeight } of expandQuery(query)) {
    let best = 0;
    for (const field of fields) {
      const words = tokenize(field.text);
      if (words.includes(word)) best = Math.max(best, field.weight);
      else if (words.some((candidate) => candidate.startsWith(word))) best = Math.max(best, field.weight * 0.6);
    }
    total += best * wordWeight;
  }
  return total;
}

export type Scored<T> = { item: T; score: number };

/**
 * Ties go to the shorter name: with equal scores it has fewer words beyond the
 * query, so it is the more general match ("date range" → PDateRangePicker over
 * PDateRangeCalendar and PDateRangePickerPresets). Then alphabetical, so the
 * order never depends on catalog order.
 */
function rank<T extends { name: string }>(
  items: T[],
  query: string,
  toFields: (item: T) => Field[],
  limit: number,
): Scored<T>[] {
  return items
    .map((item) => ({ item, score: score(query, toFields(item)) }))
    .filter((entry) => entry.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score || a.item.name.length - b.item.name.length || a.item.name.localeCompare(b.item.name),
    )
    .slice(0, limit);
}

export function searchComponents(catalog: Catalog, query: string, limit: number): Scored<CatalogComponent>[] {
  return rank(
    catalog.components,
    query,
    (component) => [
      { text: component.name, weight: 10 },
      { text: component.storybookTitle ?? '', weight: 4 },
      { text: component.description ?? '', weight: 3 },
      { text: component.props.map((prop) => prop.name).join(' '), weight: 2 },
      { text: component.stories.map((story) => story.name).join(' '), weight: 2 },
      { text: component.props.map((prop) => `${prop.type} ${prop.description ?? ''}`).join(' '), weight: 1 },
    ],
    limit,
  );
}

export function searchTokens(
  catalog: Catalog,
  query: string,
  options: { tier?: TokenTier; limit: number },
): Scored<CatalogToken>[] {
  const pool = options.tier ? catalog.tokens.filter((token) => token.tier === options.tier) : catalog.tokens;
  return rank(
    pool,
    query,
    (token) => [
      { text: token.name, weight: 10 },
      { text: token.group, weight: 3 },
      { text: `${token.light} ${token.dark}`, weight: 2 },
      // Lets "#b63f4c" find the tokens that resolve to it.
      { text: `${token.resolvedLight} ${token.resolvedDark}`, weight: 2 },
    ],
    options.limit,
  );
}

export function findComponent(catalog: Catalog, name: string): CatalogComponent | undefined {
  const wanted = name.trim().toLowerCase();
  return (
    catalog.components.find((component) => component.name.toLowerCase() === wanted) ??
    // Tolerate the unprefixed name ("Button" → "PButton").
    catalog.components.find((component) => component.name.toLowerCase() === `p${wanted}`)
  );
}

/** Closest names for a "did you mean" on a miss. */
export function suggestComponents(catalog: Catalog, name: string, limit = 3): string[] {
  return searchComponents(catalog, name, limit).map((entry) => entry.item.name);
}
