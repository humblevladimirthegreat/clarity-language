# clarity-language

Tooling for [Clarity Language](https://www.reddit.com/r/ClarityLanguage). TypeScript owns the ANTLR grammars; a web UI may come later.

## Setup

```bash
npm install
npm run generate
```

Or open the repo in a [Dev Container](.devcontainer/devcontainer.json) (Node 22 + post-create install/generate).

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run generate` | Generate TypeScript parsers from `grammar/*.g4` |
| `npm run build` | Generate + compile to `dist/` |
| `npm run typecheck` | Typecheck without emit |
| `npm run parse -- "..."` | Parse a sentence and print the tree |
| `npm run dev` | Run `src/index.ts` via tsx |

## Grammars

- `grammar/SentenceParser.g4` — current sentence grammar (used by the library)
- `grammar/WordParser.g4` — earlier / alternate grammar
- `grammar/FullParser.g4` — placeholder

Generated sources land in `src/generated/` (gitignored).

## Example

```bash
npm run parse -- "Hawolel bamol deram, bohuzel ram."
```
