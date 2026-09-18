#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { loadCatalog } from './load-catalog.js';
import { createServer } from './server.js';

// stdout carries the JSON-RPC stream; anything human-readable must go to stderr.
const log = (message: string) => process.stderr.write(`[design-system-mcp] ${message}\n`);

async function main() {
  const catalog = loadCatalog();
  const server = createServer(catalog);

  let closing = false;
  const shutdown = async (reason: string) => {
    if (closing) return;
    closing = true;
    log(`shutting down (${reason})`);
    try {
      await server.close();
    } finally {
      process.exit(0);
    }
  };
  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  // The client owns our lifetime: when it closes the pipe, exit instead of lingering.
  process.stdin.on('end', () => void shutdown('stdin closed'));

  await server.connect(new StdioServerTransport());
  log(`serving ${catalog.package.name} v${catalog.package.version} (${catalog.components.length} exports, ${catalog.tokens.length} tokens)`);
}

main().catch((error: unknown) => {
  log(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
