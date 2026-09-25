# Parser startup optimization

**Status:** items 1, 4, 5 **shipped** (2026-09-25); item 3 (warm dev-server endpoint) is the **next candidate**, deferred; items 2 and 6 **not worth doing** at current numbers.

Editors only. Follow-ups after lowering `maxLookahead` from 3 to 2 in `src/parse/sentence-parser.ts` (2026-09-25).

## Where the time goes (measured 2026-09-25)

| Step | Time |
|------|------|
| Chevrotain `performSelfAnalysis()` | ~55 ms |
| Import of `src/parse/index.ts` (parser + lexicon CSVs) | ~200 ms |
| First parse | ~15 ms |
| `npm` startup overhead | ~250 ms |
| `tsx` startup + on-the-fly TS compile (before item 5) | ~1.5 s |

Parser self-analysis is no longer the bottleneck. Before this work, `npm run parse` took ~2.0 s per call, and nearly all of that was process startup and `tsx`, not the grammar.

## 1. Replace the any-token alternation in `spanUnit` (shipped, no speedup)

The atomic span branch used `OR2` with one alternative per token type (`ANY_TOKEN_ALTS`). Now every token type except `IslandEdge` / `Period` / `QMark` / `Bang` carries the category token `SpanAtom` (`src/parse/tokens.ts`), and the branch is one `CONSUME5(SpanAtom, { LABEL: "atom" })`. The CST label is unchanged; all tests pass.

Profiled before and after: `performSelfAnalysis` stayed at 50–59 ms, and module import at ~195 ms. The change is kept only because it is simpler code.

## 2. Avoid up-front lookahead analysis (not worth doing)

Options were `chevrotain-allstar` (lazy ALL(\*) lookahead) or a disk cache of LL(k) paths through a custom `lookaheadStrategy`. Either could save at most the ~55 ms of `performSelfAnalysis` per process. Revisit only if grammar growth pushes self-analysis back into seconds.

## 3. Warm parse endpoint on the dev server (next, deferred)

Add a Vite plugin (`apply: 'serve'`) in `docs/grammar/.vitepress/config.ts` with `configureServer` registering `/__parse`. It loads the parser once via `server.ssrLoadModule('/src/parse/index.ts')` (re-evaluated automatically when `src/parse/` changes) and returns `parse()` JSON.

- Estimated per call with the server warm: ~70–100 ms with `node` directly (Node startup ~40–50 ms + localhost round trip + parse), ~0.3–0.35 s through `npm run parse`. Compare ~0.57 s / ~0.8 s today.
- The client must be a thin launcher (`scripts/parse.mjs`) that tries the endpoint **before** importing the bundle; putting the check inside the bundle pays the ~200 ms parser import anyway.
- Short timeout (~200 ms worst case; a refused localhost connection fails almost instantly), then fall back to the bundle. Pin the port or have the server write a port file.
- Dev only: `configureServer` never runs under `vitepress build`, and Amplify serves static files, so nothing ships or bills. Keep Vite bound to localhost.
- Only helps while `npm run dev` runs; build, tests, and cold shells are unaffected.
- Bonus: dev-only grammar-site components could call the same endpoint for live parses.

## 4. Batch input in the CLI (shipped)

Each quoted argument to `scripts/parse.mjs` is one input; `-` (or no arguments with piped stdin) reads one input per line. One input prints the same JSON as before; several print an array of `{ input, result }` / `{ input, error }`. A failing input (sentence- or word-level) does not stop the batch; the exit code is 1 if any failed.

## 5. Precompiled CLI (shipped)

`npm run parse` runs `scripts/parse.mjs`, which executes an esbuild bundle at `dist/parse/cli.bundle.mjs` (kept in `dist/parse/` so `index.ts` still finds `data/` at `../..`). Before running it:

- regenerates `src/generated/word-parser.js` via `npm run -s generate:word` when `src/parse/word.peggy` is newer (output to stderr so JSON stays clean);
- rebuilds the bundle when any file under `src/` is newer than it.

Timings: ~0.57 s calling `node scripts/parse.mjs` directly, ~0.8 s via `npm run parse` (down from ~2.0 s); a bundle rebuild adds ~0.25 s once, a Peggy regenerate ~0.8 s once. `AGENTS.md` tells agents to call `node` directly.

## 6. Lazy lexicon load (low priority)

Skip CSV reads when parse-only output needs no lexicon lookup. Tens of milliseconds at most; part of the ~200 ms import.
