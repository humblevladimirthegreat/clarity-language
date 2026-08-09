# clarity-language

Tooling and design docs for [Clarity Language](https://www.reddit.com/r/ClarityLanguage). Language design lives under `docs/` (see [AGENTS.md](AGENTS.md)); this package holds lexicon helpers and related scripts. A web UI may come later.

## Setup

```bash
npm install
```

Or open the repo in a [Dev Container](.devcontainer/devcontainer.json) (Node 22 + post-create install).

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run typecheck` | Typecheck without emit |
| `npm run lint:md` | Check Markdown emphasis balance and internal links under `docs/` |
| `npm run lexicon-search` | Lexicon search CLI |
| `npm run web` | Serve the lexicon search page |
| `npm run dev` | Run `src/index.ts` via tsx |

Design authority is **`docs/grammar/introduction.md`**, **`docs/grammar/core.md`**, and the linked docs — not obsolete parsers.
