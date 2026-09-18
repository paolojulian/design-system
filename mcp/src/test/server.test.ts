import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { loadCatalog } from '../load-catalog.js';
import { createServer } from '../server.js';

const catalog = loadCatalog(new URL('../catalog.json', import.meta.url));
const client = new Client({ name: 'test-client', version: '0.0.0' });

type ToolText = { isError?: boolean; content: { type: string; text: string }[] };
const call = async (name: string, args: Record<string, unknown> = {}) => {
  const result = (await client.callTool({ name, arguments: args })) as ToolText;
  return { isError: Boolean(result.isError), text: result.content.map((block) => block.text).join('\n') };
};

before(async () => {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await createServer(catalog).connect(serverTransport);
  await client.connect(clientTransport);
});
after(() => client.close());

test('exposes the five read-only tools', async () => {
  const { tools } = await client.listTools();
  assert.deepEqual(tools.map((tool) => tool.name).sort(), [
    'get_component',
    'get_guide',
    'list_components',
    'search_components',
    'search_tokens',
  ]);
  for (const tool of tools) {
    assert.equal(tool.annotations?.readOnlyHint, true, `${tool.name} is read-only`);
    assert.ok((tool.description ?? '').length > 40, `${tool.name} explains when to use it`);
  }
});

test('server instructions tell the agent how to start', () => {
  assert.match(client.getInstructions() ?? '', /search_components/);
  assert.match(client.getInstructions() ?? '', /data-theme/);
});

test('get_component returns props, tokens, links, and examples', async () => {
  const { text, isError } = await call('get_component', { name: 'PButton' });
  assert.equal(isError, false);
  assert.match(text, /import \{ PButton \} from '@paolojulian\.dev\/design-system';/);
  assert.match(text, /`variant`: `[^`]*'primary'[^`]*` \(default `'primary'`\)/);
  assert.match(text, /`children\*`/);
  assert.match(text, /--p-button-bg/);
  assert.match(text, /\?path=\/story\/components-pbutton--primary/);
  assert.match(text, /## Examples/);

  const lean = await call('get_component', { name: 'PButton', includeExamples: false });
  assert.doesNotMatch(lean.text, /## Examples/);
});

test('a gallery component says it needs the subpath import', async () => {
  const { text } = await call('get_component', { name: 'PPhotoLightbox' });
  assert.match(text, /design-system\/gallery'/);
  assert.match(text, /not the package root/);
});

test('an unknown component is an error with suggestions', async () => {
  const { text, isError } = await call('get_component', { name: 'Dropdown' });
  assert.equal(isError, true);
  assert.match(text, /Did you mean: .*P(Select|Combobox)/);
});

test('search tools answer and handle no-match without erroring', async () => {
  assert.match((await call('search_components', { query: 'modal dialog' })).text, /### PModal/);
  const tokens = await call('search_tokens', { query: 'control hover', tier: 'component' });
  assert.match(tokens.text, /--p-control-bg-hover/);
  assert.match(tokens.text, /light .* dark /);

  const none = await call('search_components', { query: 'zzzqqq' });
  assert.equal(none.isError, false);
  assert.match(none.text, /list_components/);
});

test('input is validated at the boundary', async () => {
  for (const [name, args] of [
    ['search_components', { query: '' }],
    ['search_components', { query: 'x'.repeat(201) }],
    ['search_components', { query: 'button', limit: 999 }],
    ['search_tokens', { query: 'text', tier: 'primitive' }],
    ['get_component', {}],
  ] as const) {
    const outcome = await call(name, args).catch((error: Error) => ({ isError: true, text: error.message }));
    assert.equal(outcome.isError, true, `${name} ${JSON.stringify(args).slice(0, 40)} should be rejected`);
  }
});

test('get_guide serves theming and rejects unknown topics with the valid list', async () => {
  assert.match((await call('get_guide', { topic: 'Theming' })).text, /data-theme/);
  const unknown = await call('get_guide', { topic: 'pricing' });
  assert.equal(unknown.isError, true);
  assert.match(unknown.text, /theming/);
});

test('list_components includes components, functions, and icons', async () => {
  const { text } = await call('list_components');
  assert.match(text, /- PButton/);
  assert.match(text, /- toast/);
  assert.match(text, /design-system\/icons/);
});

test('the stdio binary speaks MCP and exits when the client disconnects', async () => {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [fileURLToPath(new URL('../cli.js', import.meta.url))],
    stderr: 'pipe',
  });
  const stdioClient = new Client({ name: 'stdio-test', version: '0.0.0' });
  await stdioClient.connect(transport);
  const pid = transport.pid;
  assert.ok(pid);

  const { tools } = await stdioClient.listTools();
  assert.equal(tools.length, 5);
  const result = (await stdioClient.callTool({ name: 'search_tokens', arguments: { query: 'focus' } })) as ToolText;
  assert.match(result.content[0].text, /--p-color-focus/);

  await stdioClient.close();
  await new Promise((resolve) => setTimeout(resolve, 500));
  assert.throws(() => process.kill(pid, 0), 'server process should be gone after the client closes');
});
