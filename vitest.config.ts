import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const cliPkg = JSON.parse(
  readFileSync(new URL("./packages/cli/package.json", import.meta.url), "utf8"),
) as { version: string };

export default defineConfig({
  // Same build-time constant tsup injects (see packages/cli/src/version.ts)
  define: {
    __CLI_VERSION__: JSON.stringify(cliPkg.version),
  },
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
