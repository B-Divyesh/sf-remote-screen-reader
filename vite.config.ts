import { defineConfig } from 'vite';

export default defineConfig({
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
