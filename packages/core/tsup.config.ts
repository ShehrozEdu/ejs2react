import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  // "neutral" = no Node or browser assumptions, so the output runs in both (ADR-002)
  platform: "neutral",
  target: "es2022",
  sourcemap: true,
  clean: true,
  dts: false, // .d.ts files come from `tsc -b` (ADR-012)
});
