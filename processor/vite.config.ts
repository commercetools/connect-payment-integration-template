import { resolve } from "node:path";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";

import { LibraryFormats, defineConfig } from "vite";

const path = __dirname;
const root = resolve(path, "src/client");
const outDir = resolve(path, "dist/client");
const entry = resolve(path, "src/client/entry.ts");

export default defineConfig(({ mode }) => ({
  root,
  plugins: [
    cssInjectedByJsPlugin(),
  ],
  build: {
    outDir,
    emptyOutDir: mode == "dev",
    lib:
      mode != "dev"
        ? {
            entry,
            formats: ["systemjs"] as unknown as LibraryFormats[],
            fileName: (format) => `connector.${format}.js`,
          }
        : undefined,
  },
}));
