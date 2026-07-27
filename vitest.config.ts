import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: [
      'src/**/*.test.tsx',
      'src/features/chat/server/**/*.test.ts',
      'src/app/api/**/*.test.ts',
      'netlify/**/*.test.ts'
    ]
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
});
