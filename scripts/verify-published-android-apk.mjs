import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { tmpdir } from 'node:os';

const root = resolve(import.meta.dirname, '..');
const metadata = JSON.parse(readFileSync(resolve(root, 'public/android-release.json'), 'utf8'));

function assert(condition, message) {
  if (!condition) throw new Error(`Published Android APK check failed: ${message}`);
}

function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? files(path) : [path];
  });
}

assert(/^[a-f0-9]{64}$/.test(metadata.sha256), 'release metadata has no SHA-256');
const response = await fetch(metadata.downloadUrl, { redirect: 'follow', cache: 'no-store' });
assert(response.ok, `APK download returned ${response.status}`);
const apk = Buffer.from(await response.arrayBuffer());
assert(createHash('sha256').update(apk).digest('hex') === metadata.sha256, 'downloaded APK does not match the published checksum');

const temporary = mkdtempSync(join(tmpdir(), 'anywhere-reader-apk-'));
const artifact = join(temporary, 'release.apk');
writeFileSync(artifact, apk);

try {
  const listing = execFileSync('unzip', ['-Z1', artifact], { encoding: 'utf8' });
  const bundled = resolve(root, 'android/app/src/main/assets/public');
  const expected = files(bundled).filter(path => statSync(path).isFile());
  for (const source of expected) {
    const entry = `assets/public/${relative(bundled, source)}`;
    assert(listing.split('\n').includes(entry), `${entry} is missing`);
    const published = execFileSync('unzip', ['-p', artifact, entry]);
    assert(published.equals(readFileSync(source)), `${entry} differs from the current Android candidate`);
  }
} finally {
  rmSync(temporary, { recursive: true, force: true });
}

console.log(`Published Android APK matches the current bundled reader (${metadata.version}, ${metadata.sha256}).`);
