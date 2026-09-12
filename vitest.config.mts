import path from "node:path";
import { defineConfig } from "vitest/config";

// .mts so Vite's native config loader treats it as ESM — a plain .ts config
// here is loaded as CommonJS and warns about the `import` syntax above.
export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname) },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
  },
});
