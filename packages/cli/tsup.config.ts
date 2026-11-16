import { readFileSync } from "node:fs";
import { defineConfig } from "tsup";

const pkg = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf8"),
) as { version: string };

export default defineConfig({
  entry: {
    index: "src/index.ts", // library API
    cli: "src/cli.ts", // the `bin` (its #! line makes tsup mark it executable)
  },
  format: ["esm"],
  platform: "node",
  target: "node22",
  sourcemap: true,
  clean: true,
  dts: false, // .d.ts files come from `tsc -b` (ADR-012)
  // Bundle core into the CLI, so only `ejs2react` is published (ADR-012).
  // `dependencies` (like commander) stay external and npm installs them.
  noExternal: ["@ejs2react/core"],
  define: {
    __CLI_VERSION__: JSON.stringify(pkg.version),
  },
});
