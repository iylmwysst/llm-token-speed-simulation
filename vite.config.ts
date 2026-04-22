import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const html = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  plugins: [react()],
  base: '/llm-token-speed-simulation/',
  build: {
    rollupOptions: {
      input: [
        html('index.html'),
        html('about/index.html'),
        html('what-is-token-per-second/index.html'),
        html('how-fast-is-40-tokens-per-second/index.html'),
        html('compare-llm-speed-across-languages/index.html'),
        html('tokens-per-second-vs-words-per-minute/index.html'),
      ],
    },
  },
});
