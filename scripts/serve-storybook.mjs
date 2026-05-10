import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';

const root = resolve(process.cwd(), 'storybook-static');
const port = Number(process.env.STORYBOOK_PORT ?? 6006);
const host = process.env.STORYBOOK_HOST ?? '127.0.0.1';

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.otf': 'font/otf',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

if (!existsSync(root)) {
  console.error('storybook-static does not exist. Run npm run build:storybook first.');
  process.exit(1);
}

function resolveFilePath(url) {
  const pathname = decodeURIComponent(new URL(url, `http://${host}:${port}`).pathname);
  const candidate = normalize(join(root, pathname));

  if (!candidate.startsWith(root + sep) && candidate !== root) {
    return null;
  }

  if (existsSync(candidate) && statSync(candidate).isFile()) {
    return candidate;
  }

  const indexCandidate = join(candidate, 'index.html');
  if (existsSync(indexCandidate) && statSync(indexCandidate).isFile()) {
    return indexCandidate;
  }

  return join(root, 'index.html');
}

const server = createServer((request, response) => {
  const filePath = resolveFilePath(request.url ?? '/');

  if (!filePath || !existsSync(filePath)) {
    response.writeHead(404);
    response.end('Not found');
    return;
  }

  response.writeHead(200, {
    'Content-Type': contentTypes[extname(filePath)] ?? 'application/octet-stream',
  });

  createReadStream(filePath).pipe(response);
});

server.listen(port, host, () => {
  console.log(`Serving Storybook at http://${host}:${port}`);
});
