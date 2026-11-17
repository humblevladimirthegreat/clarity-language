# Parser startup optimization

**Status:** IDEA, written 2026-09-25, revised 2026-11-17. Shipped 2026-09-25: the `SpanAtom` category token, batch input, and the precompiled CLI (`scripts/parse.mjs`; usage in [reading Ageben](../../meta/procedures/read-ageben.md)). Shipped 2026-11-17: a cheaper parser build (formerly sketch A), with the ALL(*) strategy vendored in [src/parse/allstar/](../../../src/parse/allstar/) and its first-token work memoized ([fast-first.ts](../../../src/parse/allstar/fast-first.ts)). Shipped 2026-11-17: worker threads in find, opt-in with `--jobs N` (default inline; [pool.ts](../../../src/find/pool.ts)), after they measured too small a gain to be the default.

**Related:** [sentence-parser.ts](../../../src/parse/sentence-parser.ts), [scripts/parse.mjs](../../../scripts/parse.mjs), [run-bundled.mjs](../../../scripts/lib/run-bundled.mjs), [src/find/pass.ts](../../../src/find/pass.ts), [VitePress config](../../grammar/.vitepress/config.ts).

## Problem

Building the sentence parser now takes about 0.25 s per process (4.4 s before 2026-11-17). What is left is the work after the build:

- one `node scripts/parse.mjs` call takes 0.42 s
- a find pass takes about 5 s, nearly all of it the scan over the doc examples on one thread
- worker threads barely shorten it: each spends 1.2 s or more getting ready, and the scan shrinks far less than the share of files each gets ([measurements](#measurements-2026-11-17))

## Sketch

### A warm process

Keep a built parser alive and send work to it. The launchers (`scripts/parse.mjs`, `scripts/find.mjs`) try the warm process **before** importing their bundle, with a short timeout (about 200 ms), and fall back to the bundle.

- **`/__parse`**: returns `parse()` JSON for a batch of inputs, about 0.1 s a call.
- **`/__find`**: runs a whole find pass in the warm process; find needs the live result (`classify`, traces, `frame=` by `LexWord` identity), which JSON loses.
- **Warm workers**: the warm process keeps a few worker threads built once.

The host is a Vite plugin (dev only, `configureServer`) or a standalone daemon started on first use.

### Lazy lexicon load (low priority)

Skip the CSV reads when parse-only output needs no lexicon lookup. Tens of milliseconds at most.

## Open questions

1. **Is any of this still worth it?** A parse call at 0.42 s may be fast enough, and a find pass is about 5 s. Worker threads did not bring it near 1 s. **Recommendation:** first profile one worker: what its 1.2 s of startup is (bundle import, lexicon tables, parser build), and why three threads each take 2.1 s for a third of the files that one thread scans in 3.6 s. Build a warm process only if a pass still feels slow and the profile says warm workers would fix it.
2. **Where does a warm process live?** The Vite dev server works only while `npm run dev` runs; a daemon works in any shell but needs lifetime and staleness handling. **Recommendation:** the daemon, since most parse and find calls come from agent shells.

## Measurements (2026-11-17)

Before the cheaper build, building the sentence parser took 4.4 s. Of that, 4.1 s was the strategy's lookahead for 2,338 optional productions: 2.7 s in chevrotain's `getLookaheadPaths` (each call walks its whole rule and enumerates paths through the rest of it), 1.4 s in allstar's `firstSet` (each exit check walked up to 9.5k of 16k ATN states). The memoized versions return the same tokens for every decision; `fast-first.test.ts` checks them against the originals.

After: build 0.25 s, of which chevrotain's grammar validations about 50 ms and GC about 60 ms. `skipValidations` was not tried at the new size. One `node scripts/parse.mjs` call: 0.42 s (4.6 s before). find, `--construction join.ua --count`: 5.2 s (8.5 s before).

find with worker threads, same query, on a 12-thread WSL2 machine: `--jobs 1` 5.1 s wall (7.3 s CPU); 3 jobs 3.8 s (14 s CPU); 4 jobs 3.6–6.3 s (17 s CPU); 6 jobs 3.8 s (22 s CPU); 11 jobs 8.5 s. A worker gets ready in 1.2 s alone and 4–6 s with 11 starting at once. `--diff HEAD --count`, both passes sharing one pool: 12.6 s with `--jobs 1`, 7.7 s with 4.
