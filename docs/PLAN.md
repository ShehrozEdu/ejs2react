# ejs2react: plan

## 1. The product

**In one sentence:** `npx ejs2react` scans an Express + EJS project, converts each template to a typed React component, turns `res.render()` routes into a JSON API, checks the old output against the new, and produces one zip that runs with `npm install && npm run dev`, plus a migration report.

**What's new:** "AI rewrites it, the tool proves it." Existing HTML-to-JSX converters only fix syntax and don't understand EJS logic. Our edge is **verification**: render the old template and the new component with the same test data, normalize both HTML outputs, then diff the DOM trees. At the app level, Playwright compares real pages.

### Commands (final shape)
```bash
npx ejs2react init                       # scan + questions, saves ejs2react.config.ts
npx ejs2react convert --out app.zip      # whole app → zip
npx ejs2react file views/x.ejs --data sample.json   # one template (Level 1)
npx ejs2react verify ./converted-app     # re-run checks only
```
Settings are layered: defaults → `ejs2react.config.ts` (validated with zod, `defineConfig()` helper) → CLI flags.

### Setup questions (`init`, via @clack/prompts)
The tool scans first, then asks each question with a recommended default already selected:
1. **Output:** React + Express (default when Express routes are found) · Next.js (App Router) · React only
2. **React version:** 19 (default) · 18
3. **Language:** TypeScript (default, `.tsx`) · JavaScript (`.jsx`)
4. Styling: keep existing CSS (default) · modernize (later)
5. Bootstrap JS: keep bundle · react-bootstrap
6. jQuery plugins: replace known ones · keep as legacy
7. Raw HTML `<%- %>`: sanitize with DOMPurify (default) · dangerouslySetInnerHTML · leave TODO
8. AI fixer: off · ollama · openai-compatible (Groq, Gemini, OpenRouter) · handoff
9. Package manager: detected from the lockfile

**v1 implements only questions 1–3.**

### Pipeline (6 stages)
1. **Scan** (cli): read the Express files with acorn; resolve `app.use('/prefix', router)` mount paths; map each URL to its `res.render(view, data)`; detect libraries from `<link>`/`<script>` tags, CDN URLs and `package.json`.
2. **Parse** (core): EJS text → IR tree.
3. **Classify** (core): sort each piece of code into one of four groups. **View logic** becomes JSX. **Helpers** move to `utils/`. **Server data** is lifted into props, and the call moves to an API route or a Server Component. **Side effects** become a TODO and are never converted. Detection works on the AST and flags `require`, `import`, `await`, `process`, `fs`, `req`/`res`, `session`, model-like calls (`User.find`) and anything not on a safe list (`Math`, `JSON`, `Date`, array methods). The server list is configurable.
4. **Generate** (core): IR → TSX using the chosen strategies (React 18 vs 19, Vite vs Next). Always generate TSX with a string printer (ADR-006); for JS output, strip the types with `ts.transpileModule` (ADR-007). Format with Prettier (standalone build, browser-safe). Phase 1 supports React 19 only (ADR-008).
5. **Verify** (core + cli):
   - The test-data maker builds inputs from the inferred types so that every branch runs (empty arrays, `null`, strings with `<&'"`).
   - Render the old template with `ejs.render` and the new component with `react-dom/server` `renderToStaticMarkup`, using the matching React version through npm aliases (`"react18": "npm:react@18"`).
   - Normalize both outputs: whitespace, attribute order, entity encoding (`&#39;` vs `&#x27;`), boolean attributes, self-closing tags.
   - Parse both with parse5 and diff them node by node.
   - At the app level, Playwright compares the DOM and a screenshot for each route.
6. **Build and zip** (cli): run `npm install`, `tsc --noEmit` and `vite build`; start the old and new apps and compare their routes; write `MIGRATION_REPORT.html`; zip with `archiver`. Never include `.env`, `.git` or `node_modules`.

**AI fixer (later phase):** used only for snippets the rules couldn't convert. It sends **one small snippet** plus context. The result goes back through the verifier, with at most 3 retries before it becomes a TODO.
```ts
interface AiProvider { fix(req: { snippet: string; context: string; diff?: string }): Promise<string> }
```
`ollama` and `openai-compatible` share one client; only the base URL and model differ. `handoff` mode writes `ejs2react-fixes.md` for the user's own AI tool, and `verify` checks the result. Never hard-code free-tier limits. Handle 429 with backoff. Never send secrets.

### Output zip (React + Express target)
```
converted-app.zip
├─ README.md
├─ MIGRATION_REPORT.html   ← per page: verified / TODO, diffs, screenshots
├─ package.json            ← npm workspaces, "dev" runs both
├─ .env.example            ← names only
├─ apps/web/               ← Vite + React Router
│  ├─ src/App.tsx, pages/, components/ (from partials), layouts/, lib/api.ts, utils/, legacy/
│  └─ public/              ← from express.static
├─ apps/server/            ← Express as API: res.render → res.json under /api
│  └─ routes/, middleware/ (kept), models/ services/ db/ (copied untouched)
└─ packages/shared/types.ts
```

**Backend rule: move code, don't rewrite it.**

| From (Express + EJS) | To (React + API) |
|---|---|
| `res.render(view, data)` | `res.json(data)` under `/api` |
| View-engine setup | Removed |
| `res.redirect` after a POST | `{ redirect }`, and React navigates |
| Validation re-render | `422` JSON |
| `app.locals` / `res.locals` | `/api/bootstrap` + React context |
| Auth redirect | `401` + route guard |
| Flash messages | Toast |
| `404.ejs` / `500.ejs` | NotFound route + error boundary |
| CSRF token | `/api/csrf` + header |
| Inline `<script>` / jQuery DOM code | `legacy/`, loaded in `useEffect`, flagged |
| `process.env` printed in a template | Stop and ask; never move secrets to the browser |

Session cookies keep working because the app stays same-origin: the Vite proxy handles this in dev, and in production Express serves the build.

**Styling:** keep the app's own CSS and class names by default (no UI library), so screenshots can match. Known libraries map through a JSON **library registry**:

| Library | Replacement |
|---|---|
| Chart.js | react-chartjs-2 |
| DataTables | TanStack Table |
| select2 | react-select |
| datepicker | react-day-picker |
| toastr | react-hot-toast |

Unknown plugins get a `legacy/` wrapper.

### Honest limits (these go in the README)
- This is proof by testing, not mathematical proof: the pages are shown equal for the tested inputs.
- The verifier proves the view. Moved server code is listed as "moved, please review".
- Some EJS can't become JSX, such as an element opened inside one `if` and closed in another. Detect it and flag it; never guess.
- Routes built at runtime can't be resolved statically. Flag them.

## 2. Architecture

npm workspaces monorepo:
```
packages/
  core/          ← browser-safe: ir/, parsers/, classify/, generate/, verify/ (render + diff), testdata/
  cli/           ← commander + @clack/prompts, scanner, fs, Playwright, zip
apps/
  playground/    ← Vite site: paste EJS → see TSX + HTML diff, runs fully in the browser
fixtures/        ← input .ejs + sample data + expected output, SOURCES.md
docs/            ← PLAN.md, PROGRESS.md, DECISIONS.md
```
**Stack:** TypeScript, Node 20+, Vitest, tsup (ESM + `.d.ts`), acorn (+ `@types/estree`), parse5, ejs, react/react-dom (18 and 19 via aliases), prettier, zod, commander, @clack/prompts, Playwright, archiver.

### The IR (everything depends on it)
```ts
type Node =
  | { kind: "element"; tag: string; attrs: Attr[]; children: Node[]; loc: Loc }
  | { kind: "text"; value: string; loc: Loc }
  | { kind: "expr"; code: string; escaped: boolean; loc: Loc }   // <%= %> vs <%- %>
  | { kind: "if"; test: string; then: Node[]; else?: Node[]; loc: Loc }
  | { kind: "loop"; list: string; item: string; index?: string; body: Node[]; loc: Loc }
  | { kind: "include"; path: string; args?: string; loc: Loc }
  | { kind: "code"; code: string; loc: Loc };                     // unclassified scriptlet
```
Every `switch` on `kind` ends with a `never` exhaustiveness check. Source locations are kept so the report can point at the original line.

### Parser notes
- EJS tags: `<%=` escaped, `<%-` raw, `<%` scriptlet, `<%#` comment, `<%_ … _%>` and `-%>` whitespace trimming, `<%%` literal. Tokenize into text and tag tokens first.
- Block structure (suggested approach, to be discussed before we commit to it):
  1. Join the scriptlets in order into one JS source, replacing each text/output chunk between them with a marker call such as `__chunk(3)`.
  2. Parse that source with acorn.
  3. Walk the AST (`IfStatement`, `for…of`, `.forEach(function(item){…})`, `.map`) to recover the nesting.
  4. Put each chunk where its marker sits.
- HTML can be split across chunks (`<ul>` in one, `</ul>` in another). Tokenize the HTML, then build the element tree with a stack across the control-flow structure. If an element opens in one branch and closes outside it, emit an `UNBALANCED_HTML` issue.

### TypeScript skills this project must exercise
- Discriminated unions + `never` checks
- A typed tree walker using mapped types and `Extract<Node, { kind: K }>`
- Inferred types represented as data and merged (`Inferred = string | number | array of | object with fields | unknown`, plus optional), then printed as `type Props`
- zod `z.infer` + `defineConfig()`
- `Record<ReactVersion, Emitter>` strategies
- `satisfies` for the library registry
- `Result<T, Issue>`
- The TypeScript compiler API: `ts.createProgram` to type-check generated code as another layer of proof, and `ts.transpileModule` for JS output (ADR-006, ADR-007)
- Project references, tsup, a proper `exports` field

## 3. Roadmap (checklist of daily tasks, 30–90 min each)

Each task ends with a passing test (or a green check) and a commit.

### Phase 0: setup
- [x] 0.1 `git init`, `.gitignore`, `.editorconfig`, root `package.json` with npm workspaces, MIT `LICENSE`, README stub
- [ ] 0.2 `tsconfig.base.json` (strict, `noUncheckedIndexedAccess`, ESM, `NodeNext`/`Bundler`) + `packages/core` and `packages/cli` skeletons with project references
- [ ] 0.3 Vitest in both packages + one trivial passing test; `npm test` and `npm run typecheck` at the root
- [ ] 0.4 ESLint (flat config, typescript-eslint) + Prettier; a rule that blocks Node built-ins in `packages/core`
- [ ] 0.5 tsup build for core + cli with a proper `exports` field; `bin` entry for the CLI
- [ ] 0.6 GitHub Actions CI: install, lint, typecheck, test on Node 20 + 22
- [ ] 0.7 Check the npm name again (free on 2026-11-16), then publish a minimal working `ejs2react@0.0.1` (`--version`/`--help` only, ADR-010)
- **Gate:** `npm test` is green in CI.

### Phase 1: Level 1 core (single template)
**IR**
- [ ] 1.1 `Loc`, `Attr`, `Node` union in `ir/types.ts`; `assertNever` helper
- [ ] 1.2 `Result<T, E>`, `ok()`/`err()`, `Issue` with a code union (`UNBALANCED_HTML`, `UNCLOSED_TAG`, …)
- [ ] 1.3 Typed tree walker / visitor using a mapped type over `Node["kind"]` and `Extract`

**EJS tokenizer**
- [ ] 1.4 Tokenize text + `<%= %>` / `<%- %>` / `<% %>` with line/column locations
- [ ] 1.5 `<%#` comments, `<%%` literals, unclosed-tag issue
- [ ] 1.6 Whitespace trimming: `-%>`, `<%_`, `_%>`

**Block structure**
- [ ] 1.7 Design spike: marker-chunk + acorn vs. hand-written brace matcher; write an ADR
- [ ] 1.8 Build the marker JS source and parse it with acorn; map errors back to EJS locations
- [ ] 1.9 `if` / `else if` / `else` → `if` nodes
- [ ] 1.10 `for…of`, `forEach(function…)`, arrow `forEach`, `for (let i…)` → `loop` nodes; others → `code` + issue

**HTML across chunks**
- [ ] 1.11 Small HTML tokenizer for text chunks (tags, attrs, void elements, comments)
- [ ] 1.12 Stack-based element tree across the control flow; `UNBALANCED_HTML`
- [ ] 1.13 EJS inside attribute values (`class="<%= x %>"`) → dynamic attrs

**Includes**
- [ ] 1.14 `include('partial', { ... })` and the legacy `<% include x %>` → `include` nodes

**Generator**
- [ ] 1.15 IR → JSX string printer: elements, text escaping, `{expr}`
- [ ] 1.16 Attribute mapping: `className`, `htmlFor`, event names, boolean attrs, style string → object
- [ ] 1.17 `if` → ternary (never `&&`); `loop` → `.map` with `key`
- [ ] 1.18 Raw `<%- %>` → `dangerouslySetInnerHTML` (v1 default) + flag
- [ ] 1.19 Component wrapper, imports for includes, Prettier formatting
- [ ] 1.20 `Record<ReactVersion, Emitter>` strategy type (React 19 emitter only; 18 comes in Phase 3, see ADR-008)

**Type inference**
- [ ] 1.21 `Inferred` type as data; infer from member access, loops, comparisons
- [ ] 1.22 Merge rules (optional, unions, arrays of objects)
- [ ] 1.23 Print `type Props`; type-check generated TSX with `ts.createProgram` (cli side)

**Verifier**
- [ ] 1.24 Render the old template with `ejs.render` (custom include resolver, browser-safe)
- [ ] 1.25 Render the new component: transpile the TSX in memory → `renderToStaticMarkup`
- [ ] 1.26 Normalizer: whitespace, attribute order, entities, boolean attrs, self-closing
- [ ] 1.27 parse5 DOM diff node by node, with readable diff output

**Test-data maker**
- [ ] 1.28 Generate inputs from `Inferred` that hit every branch (empty/non-empty, null, `<&'"`)

**CLI**
- [ ] 1.29 `ejs2react file <path> --data <json>` with commander; writes `.tsx` + prints the verify result
- [ ] 1.30 Collect 10 open-source fixtures into `fixtures/` + `SOURCES.md`; a snapshot test per fixture
- **Gate:** 10 open-source templates convert and verify, or fail with a clear issue.

### Phase 2: playground
- [ ] 2.1 Vite + React app in `apps/playground` importing `core`
- [ ] 2.2 Editor (EJS + sample JSON) → TSX output pane
- [ ] 2.3 Live HTML diff view
- [ ] 2.4 Deploy to Vercel; demo link + GIF in the README
- **Gate:** a public demo link in the README, plus a GIF.

### Phase 3: Level 2 app mode (= v2, see ADR-009)
- [ ] 3.0 React 18 emitter + `react18` npm-alias renderer in the verifier (ADR-008)
- [ ] 3.1 Route scanner: find `res.render` calls with acorn
- [ ] 3.2 Mount-path resolution for `app.use('/prefix', router)`; flag dynamic routes
- [ ] 3.3 Code classifier (view logic / helper / server data / side effect) + configurable server list
- [ ] 3.4 Lift server data into props; `res.render` → `res.json` under `/api`
- [ ] 3.5 Router + layout generation (React Router)
- [ ] 3.6 Vite proxy + Express serving the build
- [ ] 3.7 Config: zod schema, `defineConfig()`, layering defaults → file → flags
- [ ] 3.8 `init` wizard (questions 1–3) with @clack/prompts
- [ ] 3.9 Build step: `npm install`, `tsc --noEmit`, `vite build`
- [ ] 3.10 Playwright route comparison (DOM + screenshot)
- [ ] 3.11 `MIGRATION_REPORT.html`
- [ ] 3.12 Zip with archiver (exclude `.env`, `.git`, `node_modules`)
- **Gate:** one real open-source Express + EJS app migrates and runs, and its report shows which routes passed.

### Phase 4: later
- [ ] AI fixer: handoff first, then ollama / openai-compatible
- [ ] Wizard questions 4–9
- [ ] Library registry (`satisfies`)
- [ ] Next.js target
- [ ] Handlebars parser (a new parser producing the same IR)
- [ ] Page-by-page migration mode (old and new apps side by side)
