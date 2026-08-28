import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { join, relative, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist');
const bundled = resolve(root, 'android/app/src/main/assets/public');

function assert(condition, message) {
  if (!condition) throw new Error(`Android bundle check failed: ${message}`);
}

function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? files(path) : [path];
  });
}

assert(existsSync(join(dist, 'index.html')), 'dist/index.html is missing; run the web build first');
assert(existsSync(join(bundled, 'index.html')), 'the checked-in Android web bundle is missing');

const androidLanguageGzip = 'ocr/lang/eng.traineddata.gz';
const distFiles = files(dist).filter(path => !['staticwebapp.config.json', androidLanguageGzip].includes(relative(dist, path)));
for (const source of distFiles) {
  const target = join(bundled, relative(dist, source));
  assert(existsSync(target), `missing bundled file ${relative(dist, source)}`);
  assert(statSync(source).size === statSync(target).size, `size differs for ${relative(dist, source)}`);
  assert(readFileSync(source).equals(readFileSync(target)), `content differs for ${relative(dist, source)}`);
}

for (const required of ['ocr/worker.min.js', 'ocr/tesseract-core.wasm.js', 'ocr/lang/eng.traineddata', 'manifest.webmanifest', 'sw.js']) {
  assert(existsSync(join(bundled, required)), `required offline asset ${required} is missing`);
}
assert(
  readFileSync(join(bundled, 'ocr/lang/eng.traineddata')).equals(gunzipSync(readFileSync(join(dist, androidLanguageGzip)))),
  'Android language data must match the web model after decompression',
);

for (const config of ['capacitor.config.json', 'capacitor.plugins.json']) {
  assert(existsSync(resolve(root, 'android/app/src/main/assets', config)), `generated Capacitor file ${config} is missing`);
}

console.log(`Android bundle checks passed (${distFiles.length} files match dist).`);
