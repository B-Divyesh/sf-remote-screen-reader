import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';

const root = resolve(import.meta.dirname, '..', 'dist');
const portIndex = process.argv.indexOf('--port');
const hostIndex = process.argv.indexOf('--host');
const port = portIndex >= 0 ? Number(process.argv[portIndex + 1]) : 4173;
const host = hostIndex >= 0 && process.argv[hostIndex + 1] && !process.argv[hostIndex + 1].startsWith('--') ? process.argv[hostIndex + 1] : '127.0.0.1';
const types = new Map([
  ['.css', 'text/css; charset=utf-8'], ['.html', 'text/html; charset=utf-8'], ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'], ['.png', 'image/png'], ['.svg', 'image/svg+xml'], ['.webp', 'image/webp'],
  ['.woff', 'font/woff'], ['.woff2', 'font/woff2'], ['.wasm', 'application/wasm'], ['.webmanifest', 'application/manifest+json'],
  ['.xml', 'application/xml; charset=utf-8'], ['.txt', 'text/plain; charset=utf-8'], ['.gz', 'application/gzip'],
]);

createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url || '/', 'http://preview').pathname);
  const relative = pathname.replace(/^\/+/, '');
  const candidate = resolve(root, relative || 'index.html');
  if (!candidate.startsWith(`${root}${sep}`) && candidate !== root) {
    response.writeHead(400).end('Invalid path');
    return;
  }
  const directoryIndex = resolve(candidate, 'index.html');
  const file = existsSync(candidate) && statSync(candidate).isFile() ? candidate : existsSync(directoryIndex) ? directoryIndex : resolve(root, '404.html');
  const status = file.endsWith(`${sep}404.html`) ? 404 : 200;
  response.setHeader('Content-Type', types.get(extname(file)) || 'application/octet-stream');
  response.setHeader('Cache-Control', 'no-store');
  response.writeHead(status);
  if (request.method === 'HEAD') response.end();
  else createReadStream(file).pipe(response);
}).listen(port, host, () => console.log(`Static preview: http://${host}:${port}`));
