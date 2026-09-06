import { defineConfig } from 'vite';
import { copyFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [{
    name: 'static-product-routes',
    closeBundle() {
      const output = resolve(import.meta.dirname, 'dist');
      for (const route of ['demo', 'privacy', 'terms']) {
        const directory = resolve(output, route);
        mkdirSync(directory, { recursive: true });
        copyFileSync(resolve(output, 'index.html'), resolve(directory, 'index.html'));
      }
      copyFileSync(resolve(output, 'index.html'), resolve(output, '404.html'));
    },
  }],
  build: {
    target: 'es2022',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: (id) => id.includes('tesseract.js') ? 'ocr-engine' : undefined,
      },
    },
  },
});
