import { defineConfig } from "vite";
import { buildId } from "./scripts/build-id.mjs";

export default defineConfig({
  root: new URL(".", import.meta.url).pathname,
  publicDir: "public",
  define: { __BUILD_ID__: JSON.stringify(buildId()) },
  build: {
    outDir: "../dist/site",
    emptyOutDir: true,
    target: "es2022",
    cssCodeSplit: false,
    assetsInlineLimit: 0,
    rollupOptions: { input: new URL("index.html", import.meta.url).pathname },
  },
});
