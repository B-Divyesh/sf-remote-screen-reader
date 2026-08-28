import { copyFile, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const worker = require.resolve('tesseract.js/dist/worker.min.js');
const core = require.resolve('tesseract.js-core/tesseract-core-simd-lstm.wasm.js');
const coreWasm = join(dirname(core), 'tesseract-core-simd-lstm.wasm');
await mkdir('public/ocr', { recursive: true });
await Promise.all([
  copyFile(worker, 'public/ocr/worker.min.js'),
  copyFile(core, 'public/ocr/tesseract-core.wasm.js'),
  copyFile(coreWasm, 'public/ocr/tesseract-core-simd-lstm.wasm'),
]);

// English traineddata is checked in under public/ocr/lang after first download.
