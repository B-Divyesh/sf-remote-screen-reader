import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const variant = process.argv[2] === 'release' ? 'release' : 'debug';
const apk = resolve(root, `android/app/build/outputs/apk/${variant}/app-${variant}.apk`);

if (!existsSync(apk)) throw new Error('Android package check failed: debug APK was not produced.');
const listing = execFileSync('unzip', ['-l', apk], { encoding: 'utf8' });
for (const asset of ['assets/public/index.html', 'assets/public/ocr/worker.min.js', 'assets/public/ocr/lang/eng.traineddata']) {
  if (!listing.includes(asset)) throw new Error(`Android package check failed: ${asset} is absent from the APK.`);
}

if (variant === 'release') {
  const sdk = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
  if (!sdk) throw new Error('Android release check failed: ANDROID_HOME or ANDROID_SDK_ROOT is required.');
  const versions = readdirSync(resolve(sdk, 'build-tools')).sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
  const apksigner = resolve(sdk, 'build-tools', versions[0], 'apksigner');
  const signature = execFileSync(apksigner, ['verify', '--verbose', '--print-certs', apk], { encoding: 'utf8' });
  if (!signature.includes('Verified using v2 scheme (APK Signature Scheme v2): true')) throw new Error('Android release check failed: APK v2 signature is missing.');
  if (/CN=Android Debug/i.test(signature)) throw new Error('Android release check failed: APK uses the Android debug certificate.');
}

const sha256 = createHash('sha256').update(readFileSync(apk)).digest('hex');
console.log(`Android ${variant} package checks passed: ${apk}`);
console.log(`SHA-256 ${sha256}`);
