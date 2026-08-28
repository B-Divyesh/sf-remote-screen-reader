import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { gunzipSync } from 'node:zlib';

const root = resolve(import.meta.dirname, '..');
const languageDir = resolve(root, 'android/app/src/main/assets/public/ocr/lang');
const compressed = resolve(languageDir, 'eng.traineddata.gz');
const uncompressed = resolve(languageDir, 'eng.traineddata');
const webOnlyReleaseMetadata = resolve(root, 'android/app/src/main/assets/public/android-release.json');

writeFileSync(uncompressed, gunzipSync(readFileSync(compressed)));
rmSync(compressed);
rmSync(webOnlyReleaseMetadata, { force: true });
console.log('Prepared uncompressed English OCR data for the Android asset server.');
