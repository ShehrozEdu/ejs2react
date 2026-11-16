# Progress log

Newest entry on top. One entry per session.

## TypeScript concepts covered so far
_(running list for interview prep: add each new concept with the file where it first appears)_

- **Literal types / `const` inference**: `export const VERSION = "0.0.0"` has type `"0.0.0"`, not `string` (`packages/core/src/index.ts`)
- **Explicit return types**: `formatVersion(): string` (`packages/cli/src/index.ts`)
- **tsconfig strictness flags**: `strict`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax` (`tsconfig.base.json`)
- **Project references + `composite`**: `tsc -b` builds core before cli (`tsconfig.json`)
- **`types: []`**: controls which global type packages a project sees (`packages/core/tsconfig.json`)

---

## Template (copy for each session)

### YYYY-MM-DD: <task id + title>
- **Done:**
- **TS concepts learned:**
- **Open questions:**
- **Next task:**

---

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
