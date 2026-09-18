# Production notes — design-system MCP server

What the diff does not show. Newest first.

## 2026-09-18 — initial build

### Reference: how Mobbin's MCP is put together
Hosted Streamable HTTP endpoint (`api.mobbin.com/mcp`), OAuth with dynamic client registration because access is
paid, and only three tools (`search_screens`, `search_flows`, `search_sections`). Each result is a small preview plus
a link to the full asset. What we copied: few, search-first tools in plain language, and every result linking out to
the real thing (our Storybook, the way theirs links to a screen). What we did not: hosting and OAuth — this package is
public, so there is nothing to protect.

### Decisions
- **Local stdio via `npx`, not hosted.** Chosen by the owner. No deployment or domain to maintain, works offline, and
  the catalog is frozen to the design-system version it was built from. Cost: no claude.ai web / ChatGPT access, and a
  republish per release. `createServer(catalog)` is transport-agnostic, so an HTTP entrypoint can be added later
  without touching the tools.
- **Separate package, not a `bin` in the main one.** `@modelcontextprotocol/sdk` pulls in express, hono, jose, ajv and
  more. Consumers of React components should not install a web server.
- **Catalog generated with the TypeScript compiler API, not `react-docgen-typescript`.** `typescript` was already a
  devDependency; the filter we need ("declared outside node_modules") is ~10 lines. One less dependency to vet.
- **No MCP resources or prompts, tools only.** Many clients still ignore resources; guides are served by `get_guide`.
- **Text results, no `structuredContent`/`outputSchema`.** The consumer is a model reading markdown. Add schemas if a
  programmatic client appears.
- **Token tier comes from `theme.css` layout** (headings + whether the value references another token), not a name
  list, so new tokens classify themselves. It depends on the `/* Component tokens */` heading staying put — a test
  pins this on a fixture, and `catalog.test.ts` pins `--p-control-bg-hover` as component-tier on the real file.
- **Alias table in `search.ts` maps generic words to this system's *words* ("dropdown" → select, combobox), never to
  component names**, so a rename cannot leave it pointing at nothing.

### Failures along the way
- **`node --test dist/test/` → `Cannot find module …/dist/test`.** Node treats a directory argument as a module path.
  Native globs only exist from Node 21 and CI runs Node 20, so the script uses a shell-expanded
  `dist/test/*.test.js`, which behaves the same on both.
- **Search ranked `PVideoGallery` above `PSwitch` for "toggle" (2.0 vs 0.6).** Not a weighting problem: `tokenize`
  only split lower→Upper boundaries, so `PSwitch` stayed `pswitch` and component *names never matched at all*. Other
  queries had been passing through weaker fields (titles, props), which hid it. Fixed with an acronym-boundary split;
  regression test asserts `tokenize('PSwitch')` is `['switch']`.
- **`PDatePickerPresets` / `PDateRangePickerPresets` reported as components with 0 props.** They are plain objects.
  Classification now uses call signatures, not capitalisation → `kind: 'constant'`.
- **`sed -i ''` failed in this shell** (GNU sed on PATH, not BSD). Use an editor/tool rather than in-place sed.

### Surprising behaviour worth knowing
- Discriminated-union props (`href?: undefined`, `type?: never` on `PButton`) would surface as props typed
  `undefined`. They are dropped; a prop is `required` only if every union variant requires it.
- TypeScript prints an alias (`PButtonVariant`), which is useless to an agent. Literal unions are expanded to their
  values; `true | false` is folded back to `boolean`.
- Storybook story ids are derived with a port of `@storybook/csf`'s `storyNameFromExport` + `sanitize`, so the build
  needs no Storybook. It is verified, not trusted: when `storybook-static/index.json` exists the tests check every one
  of the catalog's story ids against it (all matched; CI runs this after the Storybook build).
- The README's `## MCP server` and `## Development` sections are excluded from guides — they are not design guidance.

### Measurements
- Catalog: 41 exports, 13 icons, 214 tokens (92 base / 31 semantic / 91 component; 73 change in dark), 5 guides.
  `catalog.json` 282 kB, of which story source is the bulk. Tarball 50.7 kB, 9 files.
- Two tool calls over real stdio: 3.7 ms total. Linear scan over ~40 components / ~200 tokens; no index needed.
- 34 tests, including in-memory client, real stdio subprocess (also asserts the process exits when the client
  disconnects), and input-validation rejections.

### Not done
- **Not published to npm.** Until it is, clients must point at `mcp/dist/cli.js` (see README).
- MCP package version (0.1.0) is independent of the design-system version; the server reports the latter.
  No release automation ties the two together yet.
- `constants` and `utils` entries (`cn`, `P_TOKEN_VALUES`) are not catalogued. `tokens.ts` duplicating `theme.css`
  is existing debt (`docs/tech-debts/token-source-of-truth.md`); the MCP reads `theme.css` only, the rendered truth.
