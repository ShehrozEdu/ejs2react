# Decisions (ADR log)

Short records: context, decision, alternatives, why. Newest at the bottom.

---

## ADR-001: Monorepo with npm workspaces

- **Date:** 2026-11-15
- **Decision:** One repo, npm workspaces: `packages/core`, `packages/cli`, `apps/playground`.
- **Alternatives:** pnpm workspaces; Turborepo/Nx; separate repos.
- **Why:** npm ships with Node, so there's nothing extra to learn or install, and it's enough for 3 packages. pnpm or Turbo can come later if build times hurt. Separate repos would make cross-package changes painful.

## ADR-002: `core` is browser-safe

- **Date:** 2026-11-15
- **Decision:** `packages/core` never imports Node-only modules (`fs`, `path`, `child_process`, `os`, `node:*`). File access is passed in as data or as callbacks (such as an include resolver). Enforced by an ESLint rule.
- **Alternatives:** One Node-only package; conditional exports with browser shims.
- **Why:** The playground has to run the real parser, generator and verifier in the browser. A clean boundary also makes core easier to test (pure functions in, data out).

## ADR-003: Keep the app's own CSS by default

- **Date:** 2026-11-15
- **Decision:** Converted components keep the original class names and stylesheets. No UI library is introduced by default.
- **Alternatives:** Convert to Tailwind / CSS modules / a component library.
- **Why:** Visual verification (screenshots) only works if styling is unchanged. Restyling is a separate project, and it would hide conversion bugs.

## ADR-004: React + Express is the default output

- **Date:** 2026-11-15
- **Decision:** When Express routes are found, the default target is Vite + React Router (web) plus Express as a JSON API (server). Next.js comes later.
- **Alternatives:** Next.js App Router as the default; React only.
- **Why:** "Move code, don't rewrite it": the existing Express middleware, sessions and models keep working nearly untouched. Next.js would force rewriting the backend into route handlers and Server Components, which is far riskier to verify.

## ADR-005: Claude writes all code; the developer learns by explanation + checks

- **Date:** 2026-11-15
- **Decision:** This replaces the original brief's "I write core, you teach" rule. Claude writes all code, core included, but always as concept → failing tests → small implementation pieces → line-by-line walkthrough → understanding questions. Small optional exercises now and then.
- **Alternatives:** Developer writes all core code (original brief); a split where the developer writes some core modules.
- **Why:** The developer's choice, made for speed and steady daily progress. The risk is reading without really learning. To counter it: questions before every commit, a running list of TS concepts in `PROGRESS.md`, and small hands-on exercises.

## ADR-006: Generate JSX with a string printer + Prettier, not `ts.factory`

- **Date:** 2026-11-16
- **Decision:** The generator builds TSX source as strings from the IR (a small, tested printer), then formats it with Prettier's standalone build. The TS compiler API is used only to **type-check** the generated code (`ts.createProgram`, cli side).
- **Alternatives:** Build the output AST with `ts.factory` and print it with `ts.createPrinter`.
- **Why:** `ts.factory` code for JSX is very verbose and hard to read, which makes it hard to explain in an interview. A string printer is easy to read and debug, and Prettier fixes the layout. Type-checking the output with the compiler API still demonstrates that skill, and it is the part that adds proof.

## ADR-007: Strip types with `ts.transpileModule`, not esbuild

- **Date:** 2026-11-16
- **Decision:** For JavaScript output (`.jsx`), strip types with `ts.transpileModule` (`jsx: Preserve`, target ESNext).
- **Alternatives:** esbuild (`loader: 'tsx', jsx: 'preserve'`), as in the original brief.
- **Why:** It's browser-safe with no WASM build, so the playground can use it. We already depend on `typescript`, so there's one dependency fewer.

## ADR-008: React 19 only in Phase 1; React 18 support in Phase 3

- **Date:** 2026-11-16
- **Decision:** Phase 1 generates and verifies React 19 output only. The `Record<ReactVersion, Emitter>` type exists from the start, but the React 18 emitter and the `react18` npm-alias renderer come with the `init` wizard in Phase 3.
- **Alternatives:** Support both versions from day one.
- **Why:** Running two React versions side by side through npm aliases makes the verifier much more complex just when it's being built. React 19 is the default anyway.

## ADR-009: Phase 1 + playground is "v1"; app mode (Phase 3) is "v2"

- **Date:** 2026-11-16
- **Decision:** The project counts as shippable (CV-ready) after Phase 2: a single-template converter that verifies its output, with a public playground. Phase 3 is the next major version.
- **Alternatives:** Treat the full app migration as the minimum product.
- **Why:** Phase 3 is about as big as Phases 0–2 combined. At 30–90 minutes a day, a demo-able v1 in about 2–3 months keeps motivation up and gives a working CV item early.

## ADR-010: Publish a minimal working 0.0.1, not an empty package

- **Date:** 2026-11-16
- **Decision:** The first npm publish is a real CLI that prints `--help` and `--version`.
- **Alternatives:** An empty placeholder package.
- **Why:** npm's policy discourages packages that only reserve a name. A minimal working CLI reserves the name properly and also tests the build + `bin` setup end to end.

## ADR-011: Pin TypeScript 6.0.x (not 7)

- **Date:** 2026-11-16
- **Decision:** Use `typescript@6.0.3`, pinned exactly.
- **Alternatives:** TypeScript 7 (the native Go port, `latest` on npm).
- **Why:** TS 7's main export is only a version string; its compiler API lives under `unstable/*` and talks to a native binary, so it can't run in a browser. We need a stable, browser-safe `ts.transpileModule` (ADR-007) and `ts.createProgram` (type-checking output). Revisit when TS 7 ships a stable JS API.

## ADR-012: Typecheck with `tsc -b` (types only); JS is built by tsup; one published package

- **Date:** 2026-11-16
- **Decision:**
  - The root `tsconfig.json` uses project references (`core` ← `cli`). Each package is `composite` with `emitDeclarationOnly`.
  - `tsc -b` type-checks and writes `.d.ts` files. tsup (task 0.5) will write the JS.
  - Both use `moduleResolution: "Bundler"`, so imports need no `.js` extensions.
  - `core` uses `"types": []`, so Node globals and `node:*` imports are type errors.
  - `core` is `private` for now. `cli` (npm name `ejs2react`) will bundle core, so it's a devDependency of cli and only one package is published.
- **Alternatives:** `NodeNext` resolution (needs `.js` extensions in every import); tsc for both types and JS; publishing `@ejs2react/core` separately (needs an npm org).
- **Why:** Bundler resolution matches how the code is actually consumed (tsup, Vite). `"types": []` turns ADR-002 into a compile error, not just a convention; this was verified by adding `node:fs` and `process` to core, which failed with TS2591. One published package keeps `npx ejs2react` simple.
- **Update (ADR-014):** composite/emit settings moved from each package's `tsconfig.json` into its `tsconfig.build.json`.

## ADR-013: Minimum Node version is 22.12 (not 20)

- **Date:** 2026-11-16
- **Decision:** `engines.node: ">=22.12"` for the repo and the published CLI. CI tests Node 22 and 24.
- **Alternatives:** Keep Node 20+ from the original brief; pin an older Vitest that still supports 20.
- **Why:** Node 20 reached end-of-life in April 2026, and Vitest 5 requires `^22.12.0 || ^24 || >=26`. Supporting an EOL runtime would mean old tooling for no real users.
- **Update (0.4):** ESLint 10 needs Node `^22.13`, so the repo root (dev tooling) requires `>=22.13`. The published CLI keeps `>=22.12`, because that is all its runtime needs.

## ADR-014: Tests live next to the code; two tsconfigs per package

- **Date:** 2026-11-16
- **Decision:**
  - Tests are colocated (`foo.ts` + `foo.test.ts`) and run by one root `vitest.config.ts`.
  - Each package has a `tsconfig.json` (src + tests, `noEmit`; VS Code uses it) and a `tsconfig.build.json` (src only, composite, emits `.d.ts`; `tsc -b` uses it).
  - `npm run typecheck` runs both: `tsc -b`, then `tsc -p` on each package.
  - In tests, `@ejs2react/core` is aliased to `packages/core/src/index.ts`, so `npm test` needs no build step.
- **Alternatives:** A separate `test/` folder per package; one tsconfig that includes tests (test `.d.ts` files would leak into `dist/`); a `tsconfig.test.json` (VS Code would ignore it and check tests with default, non-strict settings).
- **Why:** Tests stay type-checked with the same strict settings, the editor sees them, and `dist/` contains only real source declarations.
- **Note:** In the editor config, Vitest's types pull in Node's types, so the editor may not flag `process` in core source. The build config (`tsc -b`, no tests) still does; this was verified after the split. The ESLint rule in task 0.4 adds a second guard.

## ADR-015: ESLint strict type-checked + Prettier defaults; lint guards the core boundary

- **Date:** 2026-11-16
- **Decision:**
  - ESLint 10 flat config (`eslint.config.js`) with `typescript-eslint` `strictTypeChecked`, using `projectService` to find each file's tsconfig.
  - Extra rules: `switch-exhaustiveness-check` (for the IR), and `restrict-template-expressions` allowing numbers.
  - In `packages/core` (not tests), `no-restricted-imports` blocks every entry of Node's `builtinModules` plus the `node:*` pattern, and `no-restricted-globals` blocks `process`, `Buffer`, `require`, `__dirname`, `__filename` and `global`.
  - Prettier with default settings; `eslint-config-prettier` turns off conflicting style rules.
  - `npm run check` runs format, lint, typecheck and tests.
- **Alternatives:** `recommendedTypeChecked` (less strict); a hand-written list of Node modules; Biome instead of ESLint + Prettier.
- **Why:** The project's goal is learning strict TypeScript, so strict lint rules act as a second reviewer. Building the blocklist from `builtinModules` means it can't go stale. ESLint + Prettier is what most teams and job descriptions expect. Verified: a probe file in core importing `fs` and `node:path` and using `process` produced 3 boundary errors.
