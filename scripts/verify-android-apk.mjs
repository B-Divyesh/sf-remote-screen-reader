import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const apk = resolve(root, 'android/app/build/outputs/apk/debug/app-debug.apk');

if (!existsSync(apk)) throw new Error('Android package check failed: debug APK was not produced.');
const listing = execFileSync('unzip', ['-l', apk], { encoding: 'utf8' });
for (const asset of ['assets/public/index.html', 'assets/public/ocr/worker.min.js', 'assets/public/ocr/lang/eng.traineddata']) {
  if (!listing.includes(asset)) throw new Error(`Android package check failed: ${asset} is absent from the APK.`);
}
console.log(`Android package checks passed: ${apk}`);
