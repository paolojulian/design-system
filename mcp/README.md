# @paolojulian.dev/design-system-mcp

MCP server for [`@paolojulian.dev/design-system`](https://design-system.paolojulian.dev). Lets an AI agent look up
components, props, tokens, and theming guidance instead of guessing them.

Local stdio server. No network access, no auth, no configuration.

## Connect

```bash
# Claude Code
claude mcp add design-system --scope user -- npx -y @paolojulian.dev/design-system-mcp
```

```json
// Cursor, Claude Desktop, VS Code, and other JSON-configured clients
{
  "mcpServers": {
    "design-system": { "command": "npx", "args": ["-y", "@paolojulian.dev/design-system-mcp"] }
  }
}
```

Before the package is published (or to run your working copy), point at the build instead:

```bash
cd mcp && npm install && npm run build
claude mcp add design-system --scope user -- node "$(pwd)/dist/cli.js"
```

## Tools

| Tool | Use it to |
| --- | --- |
| `list_components` | See every export: components, hooks/functions, constants, icons. |
| `search_components` | Find a component in plain language — "searchable dropdown", "confirmation dialog". |
| `get_component` | Get one component's import, props (type, default, description), component tokens, Storybook links, and story source as usage examples. |
| `search_tokens` | Find `--p-*` tokens by role, name, or literal value. Shows tier and light/dark values with `var()` chains resolved. |
| `get_guide` | Read installation, design tokens, theming, galleries, or the Swiss design rules. |

All tools are read-only.

## How it stays correct

Nothing is hand-written. `npm run build` reads the design system source and writes `dist/catalog.json`:

| Catalog data | Source of truth |
| --- | --- |
| Exports, props, types, defaults | TypeScript compiler API over `src/components/index.ts` and `src/gallery/index.ts` |
| Prop descriptions | JSDoc, falling back to Storybook `argTypes` |
| Component tokens | `--p-*` declarations in each component's `.css` |
| Theme tokens, tiers, dark values | `src/theme.css` |
| Story links and examples | `*.stories.tsx` |
| Guides | `README.md` sections and `.claude/rules/swiss-design.md` |

The catalog is baked in at build time, so a published version always describes the design-system version it was
built from (reported in the server instructions). **Rebuild and republish after each design-system release.**

## Develop

```bash
npm test        # build, then unit + catalog + end-to-end (in-memory and real stdio) tests
npm start       # run the stdio server
```

If `storybook-static/` exists at the repo root, the tests also verify that every story link in the catalog exists
in the real Storybook build.
