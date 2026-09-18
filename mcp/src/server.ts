import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import type { Catalog, CatalogComponent, CatalogToken } from './catalog/types.js';
import { findComponent, searchComponents, searchTokens, suggestComponents } from './search.js';

const MAX_EXAMPLES = 3;
const MAX_STORY_LINKS = 12;

const text = (value: string): CallToolResult => ({ content: [{ type: 'text', text: value }] });
const failure = (value: string): CallToolResult => ({ content: [{ type: 'text', text: value }], isError: true });

const READ_ONLY = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };

function formatComponentSummary(component: CatalogComponent): string {
  const lines = [`### ${component.name}${component.kind === 'component' ? '' : ` (${component.kind})`}`];
  if (component.description) lines.push(component.description);
  lines.push(`\`${component.importStatement}\``);
  if (component.signature) lines.push(`Signature: \`${component.signature}\``);
  if (component.props.length > 0) {
    const names = component.props.map((prop) => (prop.required ? `${prop.name}*` : prop.name));
    lines.push(`Props: ${names.join(', ')}`);
  }
  if (component.docsUrl) lines.push(`Storybook: ${component.docsUrl}`);
  return lines.join('\n');
}

function formatComponentDetail(component: CatalogComponent, includeExamples: boolean): string {
  const lines = [`# ${component.name}`, ''];
  if (component.description) lines.push(component.description, '');
  lines.push('```tsx', component.importStatement, '```', '');
  if (component.entry !== '.') {
    lines.push(`Imported from the \`${component.entry}\` entry, not the package root.`, '');
  }
  if (component.signature) lines.push(`Signature: \`${component.signature}\``, '');

  if (component.props.length > 0) {
    lines.push('## Props', '', '`*` = required', '');
    for (const prop of component.props) {
      const head = `- \`${prop.name}${prop.required ? '*' : ''}\`: \`${prop.type}\``;
      const defaultValue = prop.defaultValue ? ` (default \`${prop.defaultValue}\`)` : '';
      lines.push(`${head}${defaultValue}${prop.description ? ` — ${prop.description}` : ''}`);
    }
    lines.push('');
  }
  if (component.inheritedAttributes.length > 0) {
    lines.push(`Also accepts native attributes from: ${component.inheritedAttributes.join(', ')}.`, '');
  }

  if (component.cssTokens.length > 0) {
    lines.push(
      '## Component tokens',
      '',
      'Override these through a class on the component; do not hardcode colors.',
      '',
      ...component.cssTokens.map((token) => `- \`${token.name}\`: \`${token.value}\``),
      '',
    );
  }

  if (component.stories.length > 0) {
    lines.push('## Stories', '');
    if (component.docsUrl) lines.push(`Docs: ${component.docsUrl}`);
    lines.push(...component.stories.slice(0, MAX_STORY_LINKS).map((story) => `- ${story.name}: ${story.url}`));
    if (component.stories.length > MAX_STORY_LINKS) {
      lines.push(`- …and ${component.stories.length - MAX_STORY_LINKS} more in Storybook.`);
    }
    lines.push('');

    if (includeExamples) {
      lines.push('## Examples (story source)', '');
      for (const story of component.stories.slice(0, MAX_EXAMPLES)) {
        lines.push(`### ${story.name}`, '```tsx', story.source, '```', '');
      }
    }
  }

  lines.push(`Source: \`${component.sourcePath}\``);
  return lines.join('\n');
}

function formatToken(token: CatalogToken): string {
  const describe = (raw: string, resolved: string) => (raw === resolved ? `\`${raw}\`` : `\`${raw}\` → \`${resolved}\``);
  const values = token.changesInDark
    ? `light ${describe(token.light, token.resolvedLight)} · dark ${describe(token.dark, token.resolvedDark)}`
    : `${describe(token.light, token.resolvedLight)} (same in dark)`;
  return `- \`${token.name}\` [${token.tier} · ${token.group}] ${values}`;
}

export function createServer(catalog: Catalog): McpServer {
  const { name: packageName, version, storybookUrl } = catalog.package;
  const topics = catalog.guides.map((guide) => guide.topic);

  const server = new McpServer(
    { name: 'paolojulian-design-system', version },
    {
      instructions: [
        `Reference for ${packageName} v${version}, a React design system (Storybook: ${storybookUrl}).`,
        'Before writing UI with it: search_components to find the right component, then get_component for exact props and real usage.',
        'Never hardcode colors, spacing, or radii — use search_tokens and prefer semantic tokens over base tokens.',
        `For setup, theming (light/dark via data-theme), and branding, call get_guide (topics: ${topics.join(', ')}).`,
      ].join(' '),
    },
  );

  server.registerTool(
    'list_components',
    {
      title: 'List components',
      description: `Index of everything ${packageName} exports: components, hooks/functions, and icons. Use to see what exists before searching.`,
      inputSchema: {},
      annotations: READ_ONLY,
    },
    () => {
      const byKind = (kind: CatalogComponent['kind']) => catalog.components.filter((c) => c.kind === kind);
      const line = (component: CatalogComponent) =>
        `- ${component.name}${component.entry === '.' ? '' : ` (from \`${component.entry}\`)`}${
          component.description ? ` — ${component.description.split('\n')[0]}` : ''
        }`;
      return text(
        [
          `# ${packageName} v${version}`,
          '',
          `## Components (${byKind('component').length})`,
          ...byKind('component').map(line),
          '',
          '## Functions and hooks',
          ...byKind('function').map(line),
          '',
          '## Constants',
          ...byKind('constant').map(line),
          '',
          `## Icons — \`import { … } from '${packageName}/icons'\``,
          catalog.icons.join(', '),
        ].join('\n'),
      );
    },
  );

  server.registerTool(
    'search_components',
    {
      title: 'Search components',
      description:
        'Find components by what you need in plain language ("dropdown with search", "confirmation dialog", "date range"). Returns ranked matches with import, prop names, and Storybook link. Follow up with get_component.',
      inputSchema: {
        query: z.string().trim().min(1).max(200).describe('What you are trying to build or the component name.'),
        limit: z.number().int().min(1).max(20).default(5).describe('Maximum results.'),
      },
      annotations: READ_ONLY,
    },
    ({ query, limit }) => {
      const results = searchComponents(catalog, query, limit);
      if (results.length === 0) {
        return text(`No component matches "${query}". Call list_components to see everything available.`);
      }
      return text(results.map((result) => formatComponentSummary(result.item)).join('\n\n'));
    },
  );

  server.registerTool(
    'get_component',
    {
      title: 'Get component',
      description:
        'Full reference for one component: import, every prop with type/default/description, overridable component tokens, Storybook links, and real usage copied from its stories.',
      inputSchema: {
        name: z.string().trim().min(1).max(80).describe('Export name, e.g. "PButton". The "P" prefix is optional.'),
        includeExamples: z.boolean().default(true).describe('Include story source code as usage examples.'),
      },
      annotations: READ_ONLY,
    },
    ({ name, includeExamples }) => {
      const component = findComponent(catalog, name);
      if (!component) {
        const suggestions = suggestComponents(catalog, name);
        return failure(
          `No export named "${name}".${
            suggestions.length > 0 ? ` Did you mean: ${suggestions.join(', ')}?` : ' Call list_components to see what exists.'
          }`,
        );
      }
      return text(formatComponentDetail(component, includeExamples));
    },
  );

  server.registerTool(
    'search_tokens',
    {
      title: 'Search design tokens',
      description:
        'Find CSS custom properties (--p-*) by role, name, or value ("focus ring", "surface", "space", "#b63f4c"). Shows tier (base/semantic/component) and the light and dark values with var() chains resolved. Prefer semantic tokens in app code; base tokens are internal.',
      inputSchema: {
        query: z.string().trim().min(1).max(200).describe('Role, token name fragment, or a literal value.'),
        tier: z.enum(['base', 'semantic', 'component']).optional().describe('Restrict to one tier.'),
        limit: z.number().int().min(1).max(50).default(10).describe('Maximum results.'),
      },
      annotations: READ_ONLY,
    },
    ({ query, tier, limit }) => {
      const results = searchTokens(catalog, query, { tier, limit });
      if (results.length === 0) {
        return text(`No token matches "${query}"${tier ? ` in the ${tier} tier` : ''}. Try a broader role word such as "text", "surface", "border", "space", or "radius".`);
      }
      return text(
        [
          ...results.map((result) => formatToken(result.item)),
          '',
          'Use as `var(--token-name)`. Dark values apply under `[data-theme="dark"]`; see get_guide("theming").',
        ].join('\n'),
      );
    },
  );

  server.registerTool(
    'get_guide',
    {
      title: 'Get guide',
      description: `Prose documentation for the design system. Topics: ${topics.join(', ')}. "theming" covers light/dark and OS preference; "design-rules" covers the visual principles new UI must follow.`,
      inputSchema: {
        topic: z.string().trim().min(1).max(60).describe(`One of: ${topics.join(', ')}.`),
      },
      annotations: READ_ONLY,
    },
    ({ topic }) => {
      const wanted = topic.toLowerCase();
      const guide = catalog.guides.find((candidate) => candidate.topic === wanted);
      if (!guide) return failure(`Unknown topic "${topic}". Available topics: ${topics.join(', ')}.`);
      return text(`# ${guide.title}\n\n${guide.content}\n\n_Source: ${guide.source}_`);
    },
  );

  return server;
}
