import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// base './' — сайт работает и на username.github.io/repo/, и на кастомном домене.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    target: 'es2020',
    cssCodeSplit: false,
    assetsInlineLimit: 0,
    sourcemap: false,
  },
  test: {
    include: ['src/**/*.test.ts'],
  },
});
