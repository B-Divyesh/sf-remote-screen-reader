import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'es2022',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => id.includes('tesseract.js') ? 'ocr-engine' : undefined,
      },
    },
  },
});
