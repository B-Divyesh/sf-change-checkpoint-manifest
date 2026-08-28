import { defineConfig } from 'vite';
export default defineConfig({
  root: new URL('.', import.meta.url).pathname,
  publicDir: 'public',
  build: { outDir: '../dist/site', emptyOutDir: true, target: 'es2022', cssCodeSplit: false, rollupOptions: { input: new URL('index.html', import.meta.url).pathname } }
});
