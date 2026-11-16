import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      // Tests import core's TypeScript source directly, so `npm test`
      // works without building core first.
      "@ejs2react/core": fileURLToPath(
        new URL("./packages/core/src/index.ts", import.meta.url),
      ),
    },
  },
  test: {
    // Tests live next to the code they test: foo.ts + foo.test.ts
    include: ["packages/*/src/**/*.test.ts"],
    environment: "node",
  },
});
