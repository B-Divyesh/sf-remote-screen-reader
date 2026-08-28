import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const config = JSON.parse(readFileSync(resolve(root, 'public/staticwebapp.config.json'), 'utf8'));
const headers = config.globalHeaders || {};
const csp = headers['Content-Security-Policy'] || '';

function assert(condition, message) {
  if (!condition) throw new Error(`Release configuration check failed: ${message}`);
}

assert(csp.includes("default-src 'self'"), 'CSP must default to same-origin resources');
assert(csp.includes("frame-ancestors 'none'"), 'CSP must prevent framing');
assert(csp.includes("worker-src 'self' blob:"), 'CSP must allow the local OCR worker only');
assert(csp.includes('https://api.sociobot.in'), 'CSP must permit only the documented license-verification origin');
assert(headers['Permissions-Policy']?.includes('camera=(self)'), 'Permissions-Policy must limit camera use to this app');
assert(config.mimeTypes?.['.webmanifest'] === 'application/manifest+json', 'web manifest must have its standard MIME type');
assert(config.routes?.some(route => route.route === '/assets/*' && route.headers?.['Cache-Control'] === 'public, max-age=31536000, immutable'), 'fingerprinted Vite assets must have immutable caching');

const androidIgnore = readFileSync(resolve(root, 'android/.gitignore'), 'utf8');
assert(!androidIgnore.includes('app/src/main/assets/public'), 'the Android web bundle must not be ignored');
assert(!androidIgnore.includes('capacitor.config.json'), 'the generated Android Capacitor config must not be ignored');

console.log('Release configuration checks passed.');
