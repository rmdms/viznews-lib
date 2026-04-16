import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({ fallback: "index.html" }),
  },
  package: {
    source: "src/lib",
    exports: (filepath) =>
      filepath === "index.ts" || filepath === "core/schemas/index.ts",
  },
};

export default config;
