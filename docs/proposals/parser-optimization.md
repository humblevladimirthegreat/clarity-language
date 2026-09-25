# Parser startup optimization

Editors only. Follow-ups after lowering `maxLookahead` from 3 to 2 in `src/parse/sentence-parser.ts` (2026-09-25), which cut `npm run parse` from ~40s to ~5s.

## Where the time goes

Nearly all startup time is Chevrotain's `performSelfAnalysis()` — `lookAheadSequenceFromAlternatives` plus GC — building LL(k) lookahead tables for every `OR` / `OPTION` / `MANY`. Lexicon CSV loading and tsx startup are under a second. Every fresh process (CLI call, each build `tsx` script, test run) pays this again.

## 1. Replace the any-token alternation in `spanUnit`

The atomic span branch builds `OR2` with one alternative per token type (`ANY_TOKEN_ALTS`), so the analysis enumerates paths for every token type. Consume "any one token" another way (a shared token category, or a manual consume under a gate). Profile this after the `maxLookahead` change; it is likely the most expensive remaining decision.

## 2. Avoid up-front lookahead analysis

Chevrotain accepts a custom `lookaheadStrategy` (`ILookaheadStrategy` in `@chevrotain/types`).

- **2a. `chevrotain-allstar` (try first).** ALL(\*) lookahead computed lazily per decision and memoized — no up-front analysis, no cache to invalidate, no `maxLookahead` tradeoff. Adds a dependency; per-parse cost slightly higher (negligible). Ambiguity is resolved differently from LL(k), so run the full suite and `ambiguity.test.ts` / `--check-ambiguity` carefully.
- **2b. Disk-cached LL(k) paths (fallback).** Subclass `LLkLookaheadStrategy`, override `buildLookaheadForAlternation` / `buildLookaheadForOptional`, and cache the computed path arrays (token-type sequences, stored by token name) in e.g. `.cache/parser-lookahead.json`, keyed on a hash of `sentence-parser.ts`, `tokens.ts`, `maxLookahead`, and the Chevrotain version. Rebuild lookahead functions from cached paths via `buildAlternativesLookAheadFunc`. First run after a grammar edit pays the cost; later runs start at the ~1s tsx floor. Relies on semi-public helpers — add a test that cached paths equal freshly computed ones.

Either option also speeds up `npm run build`, where `npm test` and each `tsx scripts/lint-*.ts` rebuild the parser.

## 3. Warm parse endpoint on the dev server

Add a Vite plugin (`apply: 'serve'`) in `docs/grammar/.vitepress/config.ts` with `configureServer` registering `/__parse`. It loads the parser once via `server.ssrLoadModule('/src/parse/index.ts')` (re-evaluated automatically when `src/parse/` changes) and returns `parse()` JSON.

- Dev only: `configureServer` never runs under `vitepress build`, and Amplify serves static files, so nothing ships or bills.
- `src/parse/cli.ts` tries the endpoint with a short timeout (~200ms) and falls back to in-process parsing. Pin the port or have the server write a port file.
- Keep Vite bound to localhost.
- Only helps while `npm run dev` runs; build, tests, and cold shells still need item 2.
- Bonus: dev-only grammar-site components could call the same endpoint for live parses.

## 4. Batch input in the CLI

Let `cli.ts` accept several sentences (args or stdin, one per line) so a single process parses many.

## 5. Precompiled CLI

Run a bundled `dist/` CLI instead of `tsx` to drop on-the-fly TS compile (~0.5–1s). Only worth it after item 2.

## 6. Lazy lexicon load

Skip CSV reads when parse-only output needs no lexicon lookup. Tens of milliseconds; low priority.
