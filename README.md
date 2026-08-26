# clarity-language

Tooling and design docs for [Agelan](https://www.reddit.com/r/ClarityLanguage). Language design lives under `docs/` (see [AGENTS.md](AGENTS.md)); this package holds lexicon helpers and related scripts. A web UI may come later.

## Setup

```bash
npm install
```

Or open the repo in a [Dev Container](.devcontainer/devcontainer.json) (Node 22 + post-create install).

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run generate:word` | Generate the Stage-1 Peggy word parser from `grammar/word.peggy` |
| `npm run build` | Regenerate the word parser, then compile TypeScript to `dist/` |
| `npm run typecheck` | Typecheck without emit |
| `npm run lint:md` | Check Markdown emphasis balance and internal links under `docs/` |
| `npm run dev` | VitePress local preview of grammar docs (served under `/grammar/`) |
| `npm run docs:build` | Build static grammar site to `dist/grammar/` (Amplify publishes `dist/`) |
| `npm run docs:preview` | Preview the production docs build |
| `npm run lexicon-search` | Lexicon search CLI |
| `npm run web` | Serve the standalone lexicon page (`web/`; also on the docs site at `/grammar/lexicon`) |

Design authority is **`docs/grammar/why-agelan.md`** (psychological purpose / limits / feature criteria), **`docs/grammar/introduction.md`** (grammar design), **`docs/grammar/core.md`**, and the other pages under **`docs/grammar/`** — not obsolete parsers. Learner banding and reading order live in `docs/meta/` (editors only). The public grammar site is VitePress (`docs/grammar/.vitepress/`); Amplify uses [`amplify.yml`](amplify.yml) with site root **`/grammar/`**.
