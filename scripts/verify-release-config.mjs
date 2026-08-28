import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const config = JSON.parse(readFileSync(resolve(root, 'public/staticwebapp.config.json'), 'utf8'));
const androidRelease = JSON.parse(readFileSync(resolve(root, 'public/android-release.json'), 'utf8'));
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
assert(config.routes?.some(route => route.route === '/android-release.json' && route.headers?.['Cache-Control'] === 'no-store'), 'Android release metadata must never be served stale');
assert(androidRelease.version === '1.0.1', 'the published Android release version must be explicit');
assert(androidRelease.downloadUrl === 'https://github.com/B-Divyesh/sf-remote-screen-reader/releases/download/v1.0.1/anywhere-reader-1.0.1.apk', 'the APK must use the immutable public release URL');
assert(/^[a-f0-9]{64}$/.test(androidRelease.sha256) && !/^0+$/.test(androidRelease.sha256), 'the Android release needs a real SHA-256');
assert(readFileSync(resolve(root, 'release/anywhere-reader-1.0.1.apk.sha256'), 'utf8').startsWith(androidRelease.sha256), 'the downloadable checksum must match release metadata');

const androidIgnore = readFileSync(resolve(root, 'android/.gitignore'), 'utf8');
assert(!androidIgnore.includes('app/src/main/assets/public'), 'the Android web bundle must not be ignored');
assert(!androidIgnore.includes('capacitor.config.json'), 'the generated Android Capacitor config must not be ignored');

console.log('Release configuration checks passed.');
