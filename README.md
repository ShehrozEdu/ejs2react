# ejs2react

[![CI](https://github.com/ShehrozEdu/ejs2react/actions/workflows/ci.yml/badge.svg)](https://github.com/ShehrozEdu/ejs2react/actions/workflows/ci.yml)

> Migrate Express + EJS apps to React, and **prove** the converted pages render the same.

**Status: early development. Nothing works yet.** Follow progress in [docs/PROGRESS.md](docs/PROGRESS.md).

## The idea

Tools that turn HTML into JSX only fix syntax. They don't understand EJS logic (`<% if %>`, loops, includes), and they can't tell you whether the result is correct.

ejs2react converts each EJS template into a typed React component. It then **verifies** the result: it renders the old template and the new component with the same test data, normalizes both HTML outputs and diffs the DOM trees.

_AI rewrites it, the tool proves it._

## Planned usage

```bash
npx ejs2react file views/page.ejs --data sample.json   # one template
npx ejs2react init                                     # scan an app, choose options
npx ejs2react convert --out app.zip                    # whole app → runnable React + Express zip
npx ejs2react verify ./converted-app                   # re-run the checks
```

## Honest limits

- This is proof by testing, not mathematical proof: the pages are shown to match for the tested inputs.
- The verifier proves the view. Server code that gets moved is listed as "moved, please review".
- Some EJS can't become JSX, such as an element opened inside one `if` and closed in another. The tool flags these cases and never guesses.
- Routes built at runtime can't be resolved statically, so they are flagged.

## Docs

- [Plan and roadmap](docs/PLAN.md)
- [Design decisions](docs/DECISIONS.md)

## License

[MIT](LICENSE)
