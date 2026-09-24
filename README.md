# clarity-language

Tooling and design docs for [Agalan](https://www.reddit.com/r/ClarityLanguage). Language design lives under `docs/` (see [AGENTS.md](AGENTS.md)); this package holds lexicon helpers and related scripts. A web UI may come later.

## Setup

```bash
npm install
```

Or open the repo in a [Dev Container](.devcontainer/devcontainer.json) (Node 22 + post-create install).

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run generate:word` | Generate the Stage-1 Peggy word parser from `src/parse/word.peggy` |
| `npm run build` | Regenerate the word parser, typecheck and compile TypeScript, run tests and docs checks, then build the production docs into `dist/` |
| `npm run typecheck` | Typecheck without emit |
| `npm run lint:agalan` | Check Agalan words in `docs/grammar/` code spans and morph-gloss pairs (also run by `build`) |
| `npm run dev` | VitePress local preview of grammar docs (served under `/grammar/`) |
| `npm run docs:publish` | Production docs build: fetch TTS if missing, VitePress build, Amplify extras (`dist/`) — what Amplify runs |
| `npm run docs:preview` | Preview the production docs build |
| `npm run convert-word` | Convert English to an Agalan root; `--lexicon` rewrites the CSVs and dumps `tmp/lexicon-retie-map.json` (`--only` limits rows) |
| `npm run retie-docs` | Dry-run retie of Agalan tokens in `docs/grammar/`, `docs/examples/`, `docs/meta/`, and `lexicon-compounds.csv` from that map (`--write` to apply) |
| `npm run lexicon-search` | Lexicon search CLI |
| `npm run web` | Serve the standalone lexicon page (`web/`; also on the docs site at `/grammar/lexicon`) |

Design authority is **`docs/grammar/why-agelan.md`** (psychological purpose / limits / feature criteria), **`docs/grammar/introduction.md`** (grammar design), **`docs/grammar/clause.md`**, and the other pages under **`docs/grammar/`** — not obsolete parsers. Learner banding and reading order live in `docs/meta/` (editors only). The public grammar site is VitePress (`docs/grammar/.vitepress/`); Amplify uses [`amplify.yml`](amplify.yml) with site root **`/grammar/`**. Old public paths (`coordination.html` → `joins.html`) and the hosted 404 live in [`scripts/site-redirects.json`](scripts/site-redirects.json); paste `dist/amplify-redirects.json` into Amplify **Rewrites and redirects** ([site-redirects.md](docs/meta/site-redirects.md)).

## License

Software and tooling are under the [Apache License 2.0](LICENSE). Grammar, pedagogy, and lexicon data are under [CC BY 4.0](LICENSE-DOCS). Path map, Agalan credit, and name rules are in [NOTICE](NOTICE).
