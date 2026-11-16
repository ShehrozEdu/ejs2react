// @ts-check
import { builtinModules } from "node:module";
import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import prettier from "eslint-config-prettier/flat";
import tseslint from "typescript-eslint";

const CORE_IS_BROWSER_SAFE =
  "packages/core must run in the browser (ADR-002). Move Node-only code to packages/cli, or pass the data in.";

export default defineConfig([
  globalIgnores(["**/dist/", "**/coverage/"]),

  // Base rules for every JS/TS file
  js.configs.recommended,

  // Strict, type-aware TypeScript rules (they use our tsconfig files)
  tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        // Finds the nearest tsconfig.json for each file automatically.
        // Root config files aren't in any tsconfig, so they get a default one.
        projectService: {
          allowDefaultProject: ["*.js", "*.ts"],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Every `switch` over a union (like IR `kind`) must handle every case.
      "@typescript-eslint/switch-exhaustiveness-check": "error",
      // Numbers in template strings are fine: `line ${loc.line}`
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        { allowNumber: true },
      ],
    },
  },

  // The browser-safe boundary for core (second guard next to `types: []`)
  {
    files: ["packages/core/**/*.ts"],
    ignores: ["**/*.test.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: builtinModules.map((name) => ({
            name,
            message: CORE_IS_BROWSER_SAFE,
          })),
          patterns: [{ group: ["node:*"], message: CORE_IS_BROWSER_SAFE }],
        },
      ],
      "no-restricted-globals": [
        "error",
        ...[
          "process",
          "Buffer",
          "require",
          "__dirname",
          "__filename",
          "global",
        ].map((name) => ({ name, message: CORE_IS_BROWSER_SAFE })),
      ],
    },
  },

  // Plain JS files (like this one) skip the type-aware rules
  {
    files: ["**/*.js"],
    extends: [tseslint.configs.disableTypeChecked],
  },

  // Must be last: turns off rules that would fight with Prettier's formatting
  prettier,
]);
