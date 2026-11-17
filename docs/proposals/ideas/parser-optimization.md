# Parser startup optimization

**Status:** IDEA, written 2026-09-25, revised 2026-11-17. Shipped 2026-09-25: the `SpanAtom` category token, batch input, and the precompiled CLI (`scripts/parse.mjs`; usage in [reading Ageben](../../meta/procedures/read-ageben.md)).

**Related:** [sentence-parser.ts](../../../src/parse/sentence-parser.ts), [scripts/parse.mjs](../../../scripts/parse.mjs), [run-bundled.mjs](../../../scripts/lib/run-bundled.mjs), [src/find/pass.ts](../../../src/find/pass.ts), [VitePress config](../../grammar/.vitepress/config.ts).

## Problem

Every process that parses a sentence first builds the Chevrotain sentence parser, and since the switch to ALL(*) lookahead (2026-10-08) that build takes 4–5 s; it was about 55 ms before. So:

- one `node scripts/parse.mjs` call takes 4.6 s (0.57 s in September), even for one word
- a find pass takes about 9 s, half of it the build
- every test file and build check that parses pays it again

Worker threads do not help: each thread rebuilds the parser, and concurrent builds slow each other. In a trial on find (2026-11-17, commit message `find-improvements F1`), 11 workers took 28 s against 8.5 s on one thread, so find dropped them.

## Sketch

### A. A cheaper build (helps every process)

Where the build's 4.8 s goes is under [measurements](#measurements-2026-11-17). Two hot spots, each about 2 s:

- **`chevrotain-allstar`'s `firstSet`** takes 1.7 s on its own. That much time in one function suggests it recomputes rather than caches. Check a newer allstar release first. Failing that, memoize it through a subclass of the strategy or a `patch-package` patch.
- **Chevrotain's own LL(k) path building** (`possiblePathsFrom`, `remainingPathWith`, `lookAheadSequenceFromAlternatives`) still runs under the ALL(*) strategy, probably for its LL(1) fast path and `optionalHasFollowConflict`. Find out which of it the strategy needs.
- **Fallback: cache lookahead on disk**, keyed by a hash of the grammar, through a custom `lookaheadStrategy`. allstar's state is an ATN plus a DFA it fills lazily, and whether that serializes is unknown.

Target: a build under about 100 ms. A find pass would then take about 4.5 s. Worker threads would pay again: the 3.7 s scan split across threads brings a pass to about 1 s, the speed find's worker-thread trial aimed for.

`skipValidations: true` does not help (measured 2026-11-17: 4.3 s against 4.0 s).

### B. A warm process (helps where it runs)

Keep a built parser alive and send work to it. The launchers (`scripts/parse.mjs`, `scripts/find.mjs`) try the warm process **before** importing their bundle, since a check inside the bundle pays the import anyway. They use a short timeout (about 200 ms; a refused localhost connection fails at once) and fall back to the bundle. Pin the port or write a port file.

- **`/__parse`**: returns `parse()` JSON for a batch of inputs. A call would take about 0.1 s through `node`, against 4.6 s today.
- **`/__find`**: runs a whole find pass in the warm process, rather than sending each example to `/__parse`. Find needs more than the JSON: `classify`, construction traces and ambiguity on the live result, and `frame=` matches by `LexWord` identity, which JSON loses. The launcher sends its arguments and prints the records that come back. A pass would take about 4.5 s.
- **Warm workers**: the warm process keeps a few worker threads, each built once per process lifetime. That brings a find pass to about 1 s even before A. `--diff`'s old pass still builds cold, since it is a different parser.

The host is either a Vite plugin (`apply: 'serve'`, `configureServer`, `server.ssrLoadModule` reloading when `src/` changes) or a standalone daemon ([open questions](#open-questions)). The Vite plugin is dev only: nothing ships or bills, and Vite stays bound to localhost. Dev-only grammar-site components could use the same endpoint for live parses.

### C. Lazy lexicon load (low priority)

Skip the CSV reads when parse-only output needs no lexicon lookup. Tens of milliseconds at most.

## Open questions

1. **A or B first?** A helps every process, including tests and the cold shells subagents run in. B helps only where the warm process is running, but it also brings worker threads back.
   **Recommendation:** A first. Then B only if a pass of about 4.5 s still feels slow.
2. **Where does B live?** The options:
   - The Vite dev server: no new process to manage, but it works only while `npm run dev` runs.
   - A standalone daemon, started on first use, watching `src/` and exiting after an idle timeout: it works in any shell, but it needs lifetime and staleness handling.

   **Recommendation:** the daemon, since most parse and find calls come from agent shells where the dev server is not running. Settle it by checking how often `npm run dev` is up during agent sessions.
3. **Does a cached or patched strategy keep ambiguity reporting?** `--check-ambiguity` reads what the allstar strategy logs (`takeAmbiguityReports`). Any change under A must keep those reports byte-identical. Test that with a before-and-after run of `--check-ambiguity` over the doc examples.

## Measurements (2026-11-17)

Building the sentence parser alone (`sentenceGrammar()`) took 4.8 s under `--cpu-prof`. Self time by package: Chevrotain 2.5 s, chevrotain-allstar 1.9 s, `@chevrotain/gast` 0.3 s, native and GC 0.2 s. By function:

| Function | Self time |
|----------|-----------|
| allstar `firstSet` | 1720 ms |
| chevrotain `remainingPathWith` | 534 ms |
| chevrotain `possiblePathsFrom` | 498 ms |
| chevrotain `lookAheadSequenceFromAlternatives` | 469 ms |
| chevrotain `getAlternativesForProd` | 330 ms |
| chevrotain `getLookaheadPathsForOptionalProd` | 172 ms |
| chevrotain `isUniquePrefixHash` | 143 ms |
| allstar `optionalHasFollowConflict` | 94 ms |

find, `--construction join.ua --count`: 8.5 s on one thread. `--jobs` with workers, before F1 dropped them: 8.4 s with 2, 10.1 s with 4, 20.1 s with 8, 28 s with 11. One `node scripts/parse.mjs` call: 4.6 s.
