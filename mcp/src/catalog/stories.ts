/**
 * Mirrors Storybook's own id derivation (`@storybook/csf`: `storyNameFromExport`
 * + `sanitize`) so catalog links resolve without needing a Storybook build.
 * `storybook-ids.test.ts` checks these against a real `index.json` when present.
 */
export function storyNameFromExport(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\./g, ' ')
    .replace(/([^\n])([A-Z])([a-z])/g, (_match, a: string, b: string, c: string) => `${a} ${b}${c}`)
    .replace(/([a-z])([A-Z])/g, (_match, a: string, b: string) => `${a} ${b}`)
    .replace(/([a-z])([0-9])/gi, (_match, a: string, b: string) => `${a} ${b}`)
    .replace(/([0-9])([a-z])/gi, (_match, a: string, b: string) => `${a} ${b}`)
    .replace(/(\s|^)(\w)/g, (_match, a: string, b: string) => `${a}${b.toUpperCase()}`)
    .replace(/ +/g, ' ')
    .trim();
}

export function sanitize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[ ’–—―′¿'`~!@#$%^&*()_|+\-=?;:'",.<>{}[\]\\/]/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export function toStoryId(title: string, exportName: string): string {
  return `${sanitize(title)}--${sanitize(storyNameFromExport(exportName))}`;
}

export function toStoryUrl(storybookUrl: string, storyId: string): string {
  return `${storybookUrl.replace(/\/$/, '')}/?path=/story/${storyId}`;
}

export function toDocsUrl(storybookUrl: string, title: string): string {
  return `${storybookUrl.replace(/\/$/, '')}/?path=/docs/${sanitize(title)}--docs`;
}
