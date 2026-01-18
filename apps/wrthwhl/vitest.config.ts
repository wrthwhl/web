import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['**/*.test.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@wrthwhl/content': resolve(__dirname, '../../.contentlayer/generated'),
    },
  },
});
