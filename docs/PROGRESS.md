# Progress log

Newest entry on top. One entry per session.

## TypeScript concepts covered so far

_(running list for interview prep: add each new concept with the file where it first appears)_

- **Literal types / `const` inference**: `export const VERSION = "0.0.0"` has type `"0.0.0"`, not `string` (`packages/core/src/index.ts`)
- **Widening literal types**: that `"0.0.0"` widens to `string` when passed into a generic function (`packages/core/src/index.test.ts`)
- **`typeof` in a type position**: `typeof VERSION` gives the declared type of a value
- **Type-level tests**: `expectTypeOf<T>().toEqualTypeOf<U>()`, checked by `tsc`, not at runtime
- **Explicit return types**: `formatVersion(): string` (`packages/cli/src/index.ts`)
- **tsconfig strictness flags**: `strict`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax` (`tsconfig.base.json`)
- **Project references + `composite`**: `tsc -b` builds core before cli (`tsconfig.json`)
- **`types: []`**: controls which global type packages a project sees (`packages/core/tsconfig.json`)
- **Type-aware linting**: ESLint rules that use the TypeScript type checker, e.g. `switch-exhaustiveness-check` and `no-unsafe-member-access` (`eslint.config.js`)
- **`// @ts-check` in a JS file**: asks TypeScript to type-check a plain `.js` file (`eslint.config.js`)
- **`declare const`**: tells TypeScript a value exists without creating it; filled in at build time (`packages/cli/src/version.ts`)
- **`catch (error: unknown)` + `instanceof` narrowing**: caught errors are `unknown`, so you must narrow before reading fields (`packages/cli/src/index.test.ts`)
- **Inline object return types**: `function run(): { stdout: string; exitCode: number }` (`packages/cli/src/index.test.ts`)
- **`as` type assertions**: `JSON.parse(...) as { version: string }` tells TypeScript the shape and is _not_ checked at runtime (`packages/cli/tsup.config.ts`)

---

## Template (copy for each session)

### YYYY-MM-DD: <task id + title>

- **Done:**
- **TS concepts learned:**
- **Open questions:**
- **Next task:**

---

### 2026-11-16: 0.5 tsup build + `bin` entry

- **Done:** tsup 8.5 builds core (`platform: neutral`) and cli (`platform: node`, bundles core). commander 15 CLI with `--version`, `--help`, help on no args, and exit code 1 on unknown options. The version comes from `package.json` through a build-time `define`. `npx ejs2react --version` works locally. `npm pack --dry-run` ships only `dist/` + `package.json`. 8 tests pass; `npm run check` passes. See ADR-016.
- **Bugs found and fixed:** `.d.ts` files vanished on rebuild (stale tsbuildinfo outside `dist/`, then tsup's clean skipping dotfiles); tsup config files weren't covered by any tsconfig (lint errors).
- **TS concepts learned:** `declare const`, `unknown` in `catch` + `instanceof` narrowing, inline object return types, `as` assertions.
- **Not yet verified:** core being bundled into cli. The CLI doesn't import core yet; this gets tested in 1.29.
- **Open questions:** Upgrade to Node 24 LTS at some point, which unlocks tsup 9.
- **Next task:** 0.6 GitHub Actions CI (needs the GitHub repo to exist; check the username `ShehrozEdu`).

### 2026-11-16: 0.4 ESLint + Prettier + core boundary rule

- **Done:** ESLint 10 flat config with typescript-eslint `strictTypeChecked` and `switch-exhaustiveness-check`; Prettier 3.10 (defaults); `npm run lint`, `format`, `format:check` and `check`. Core boundary lint rule built from Node's `builtinModules` and verified with a probe file (3 errors). Prettier exposed broken Markdown lists in CLAUDE.md, now fixed. Dev Node minimum raised to 22.13 for ESLint 10. See ADR-015.
- **TS concepts learned:** type-aware linting, `// @ts-check`.
- **Open questions:** `npm audit` reports a moderate ReDoS in `minimatch` via typescript-eslint (dev-only, trusted input). The suggested fix downgrades typescript-eslint to 8.36, which lacks TS 6 support, so it was **not** applied. Recheck when typescript-eslint updates.
- **Next task:** 0.5 tsup build for core + cli with a proper `exports` field; `bin` entry for the CLI.

### 2026-11-16: 0.3 Vitest + first tests

- **Done:** Vitest 5.1 with one root config (colocated `*.test.ts`, alias `@ejs2react/core` → core source). Split each package into `tsconfig.json` (editor + tests) and `tsconfig.build.json` (emit, no tests); see ADR-014. `npm test` passes (2 files, 3 tests); `npm run typecheck` passes. Raised the minimum Node to 22.12 (ADR-013). Re-verified that core still rejects `process`.
- **TS concepts learned:** widening literal types, `typeof` in types, type-level tests with `expectTypeOf`.
- **Lesson:** the first version of the literal-type test failed `tsc`. The test caught a wrong mental model, which is exactly why we write type tests.
- **Open questions:** none.
- **Next task:** 0.4 ESLint (flat config, typescript-eslint) + Prettier; a rule blocking Node built-ins in `packages/core`.

### 2026-11-16: 0.2 TypeScript config + package skeletons

- **Done:** `tsconfig.base.json` (strict + extra checks), root solution `tsconfig.json` with project references, `packages/core` (`@ejs2react/core`, private, `types: []`) and `packages/cli` (`ejs2react`, Node types). TypeScript pinned to 6.0.3 (ADR-011); setup in ADR-012. `npm run typecheck` is green. Verified that core rejects `node:fs` and `process` (TS2591).
- **TS concepts learned:** literal types, explicit return types, strict flags, project references, `types: []`.
- **Open questions:** none.
- **Next task:** 0.3 Vitest in both packages + a first real test; `npm test` at the root.

### 2026-11-16: 0.1 Repo foundation

- **Done:** `git init` (branch `main`), `.gitignore`, `.editorconfig`, `.gitattributes`, root `package.json` with npm workspaces, MIT `LICENSE`, README stub. Recorded ADR-006 to ADR-010 (string printer, `ts.transpileModule`, React 19 first, v1 = Phase 1 + 2, real 0.0.1). npm name `ejs2react` checked: still free.
- **TS concepts learned:** none yet (no TypeScript in this task). Tooling concepts: npm workspaces, `"private": true`, `"type": "module"`, `engines`.
- **Open questions:** Confirm the GitHub username `ShehrozEdu` (inferred from the git email).
- **Next task:** 0.2 `tsconfig.base.json` + `packages/core` and `packages/cli` skeletons with project references.

### 2026-11-15: Project kickoff

- **Done:** Created the project folder, `CLAUDE.md`, `docs/PLAN.md`, `docs/PROGRESS.md`, `docs/DECISIONS.md`. No code yet.
- **TS concepts learned:** none yet
- **Open questions:** see the kickoff questions in the chat (repo host, npm name, scope pushbacks)
- **Next task:** Phase 0, task 0.1 (git init, workspaces, license, README stub)
