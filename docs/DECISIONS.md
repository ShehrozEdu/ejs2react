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
