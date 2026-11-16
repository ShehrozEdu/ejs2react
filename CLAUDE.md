# ejs2react: rules for every session

## Project summary

**ejs2react** is an open-source TypeScript CLI that migrates Express + EJS apps to React (plus a Node API) and **proves** that the converted pages render the same as the originals.

- `npx ejs2react file views/x.ejs --data sample.json` converts one template (Level 1).
- `npx ejs2react convert --out app.zip` converts the whole app into a runnable zip with a migration report (Level 2).
- What makes it different: **"AI rewrites it, the tool proves it."** It renders the old EJS and the new React with the same test data, normalizes both HTML outputs and diffs the DOM trees.
- Monorepo: `packages/core` (browser-safe), `packages/cli` (Node only), `apps/playground` (Vite site).
- Full product spec and roadmap: `docs/PLAN.md`. Progress log: `docs/PROGRESS.md`. Decisions: `docs/DECISIONS.md`.

## About the developer

- Full-stack developer (React, Node, Express, MongoDB, 3.5 years). Migrated a production EJS app to a React SPA by hand at work.
- **New to TypeScript.** A main goal is to learn TypeScript well enough to put it on a CV and explain every line in an interview.
- Works **30–90 minutes a day**. Every session ends with something small that works and is committed.

## The learning rule (updated 2026-11-15, see ADR-005)

**Claude writes all the code, core included. The developer learns it and must be able to explain it.**

For core code (`packages/core/src/ir/`, `parsers/`, `classify/`, `generate/`, `verify/diff*`, type inference):

1. **Concept first.** Before writing, explain the idea briefly with a tiny example.
2. **Tests first.** Write the failing Vitest tests, show them, and explain what "done" means.
3. **Small pieces.** Write the implementation in small steps (one function or concept at a time), not one big dump.
4. **Walk through it.** After each piece, explain the important lines: why this type, why this shape, which edge case it handles.
5. **Check understanding.** Ask 1–2 questions about the piece before moving on. If the answer is wrong, re-explain and ask again.
6. **Optional hands-on.** Now and then, give a tiny exercise (such as "add the case for `<%#`" or "fix this failing test") so the developer writes some TypeScript too. Keep it small and skippable.

For non-core code (repo setup, tsconfig, build, CI, fixtures, CLI wiring, README, zip and file glue): write it and explain it in a few lines. Answer any "why" properly.

**Always:**

- Before each commit, ask 1–2 quick questions about the code in it. If the developer can't answer, go over it first.
- When a TypeScript feature shows up for the first time (unions, narrowing, generics, `never`, mapped types, `satisfies`, `infer`, etc.), stop and give a ~5-line explanation with an example from _this_ codebase.
- Teaching style: short and direct. No long lectures.
- Keep a running list of the TS concepts covered in `docs/PROGRESS.md` (interview prep).

## Hard rules

- **Never** use, copy or reference code or templates from the developer's employer (GeniusMesh). Build from scratch. Test fixtures come only from **open-source** EJS projects (record the repo URL and license in `fixtures/SOURCES.md`) or templates we write ourselves.
- TypeScript `strict: true` plus `noUncheckedIndexedAccess`. No `any` without a comment explaining why. Prefer `unknown` + narrowing.
- `packages/core` must **never** import Node-only modules (`fs`, `path`, `child_process`, `os`, `node:*`). It has to run in a browser for the playground. Anything Node-only lives in `packages/cli`.
- Errors are values inside core: use `Result<T, Issue>` with coded `Issue`s instead of throwing.
- Never invent results. If a test is skipped or something isn't verified, say so.
- Small commits with conventional messages (`feat(parser): …`, `test(ir): …`, `chore: …`, `docs: …`).
- Every `switch` on an IR `kind` ends with a `never` exhaustiveness check.
- Version 1 of `init` implements only setup questions 1–3 (output target, React version, language). Don't build the later questions early.

## How every session goes

**Start**

1. Read `docs/PROGRESS.md` and `docs/PLAN.md`.
2. Say in 3–5 lines where we are, then propose **one** task for today that fits 30–90 minutes.

**During**

3. Core: concept → failing tests → Claude implements in small pieces with explanations → understanding check. Non-core: Claude implements and explains briefly.

**End**

4. Run `npm run check` (format, lint, typecheck, tests). Commit only when green, or say clearly what isn't.
5. Update `docs/PROGRESS.md`: date, what was done, TS concepts learned (by name), open questions, next task.
6. Ask one quick recap question about today's code.

Record every real decision (alternatives + why) in `docs/DECISIONS.md`, ADR-style and short.
