# Proposal: parse-aware find and replace

**Status:** PROPOSED. Nothing here is absorbed.  
**Related:** [`scripts/find.mjs`](../../scripts/find.mjs), [`src/find/`](../../src/find/), [`src/retie/`](../../src/retie/) (span walk and gloss follow, root maps only), [retie limits](../meta/retie.md), `vowel-series-realignment.md` (the first absorb that needs this; do not start that absorb before Phase 2).  
**Design authority:** none. This is a process for the tool. It does not add grammar.

## Problem

`node scripts/find.mjs` can *find* Agebon examples by parse, not spelling: `family=hook,raw=ol` is not join `zol`, `--construction join.e` is the rank join. Nothing will *rewrite* those hits.

The next large grammar absorb (`vowel-series-realignment.md`) is pairwise series swaps (`zel` ↔ `zol`, `yol` ↔ `yel`, hook `ol` ↔ `el`), number-marker speech `re` ↔ `ro`, plus a pointer three-cycle. A string replace crosses (digit `re` is 7, not the ordinal marker); a missed hit still parses, with the opposite English. `retie-docs` will not catch them: it only follows lexicon roots.

Find is also thinner than the parse it already holds. `joinMarker.series`, number `stem.marker` (and numeric-prefix `numberStem.marker`), say `scope` / `answer`, ability `stanceVowel`, and pointer `pointerVowel` sit on the word. Some have construction IDs (`join.e`, `force.o`, `pointer.vowel.a`, `hook.ol`, `number.marker.ordinalFwd`); polar stacks do not (`polar.starter` is *yes* and *sure* together). Ability is an overlay, not a vowel id. Construction `number.marker.*` names the **job** (`#` and `re` are both `ordinalFwd`); a letter map needs the stored marker. `--json` is example-level: file, line, text. It does not name the matched word or its fields.

Default paths are `docs/grammar` and `docs/examples`. Tests, `src/`, `docs/meta/`, the game, and `cases.tsv` are grep.

## Goals

1. **Query the fields the parse already has**, so an inventory is a construction or a series letter, not a regex over `raw`.
2. **Rewrite matched words from the original parse, in one pass.** Pairwise maps and cycles must not run as two replaces.
3. **Dry run by default.** Print `file:line  old → new` (and `--json`). `--write` patches Agebon spans and regenerates morph glosses the way retie does.
4. **Refuse a write that does not reparse** as one tree. A leftover opposite-English example is then a *missed query*, not a silent bad patch.
5. **Do not become a second retie.** Root respelling, the language name, and parser series sets stay where they are.

## Non-goals

- New grammar, or changing what the parser accepts.
- Root maps (`retie-docs`, `convert-word`).
- Rewriting cue English (*o ≈ one*), teaching maps, or generated cheat-sheet blocks. Those name the *job*, and a person still edits the owning page.
- Guessing unparsed text. If a span does not parse, skip it and list it.

## What exists

| Tool | Does | Limit |
|------|------|--------|
| `find.mjs` | Match parsed examples by `role` / `ending` / `root` / `family` / `overlay` / `unit` / `raw` and by construction id | Locate only; no `series` / say slots / stance; example-level JSON; docs Markdown only |
| Construction ids | `join.e`, `force.o`, `hook.ol`, `role.scope.a`, `pointer.vowel.a`, `word.family.say` | Polar grouped as starter/fuller; ability is an overlay, not a vowel; say scope and answer have no id |
| `retie-docs` | Walk the same Agebon spans the lint uses; splice roots; follow names, IPA, letter-name lines; `reglossMarkdown` | Root map only. `rewriteParsedWord` returns null on join / hook / say / tag |
| `parse.mjs` / `grammar-check` / `lint:agebon` | After a hand edit, fail unparsed or two-tree spans | A pairwise miss still parses |

## Design

One CLI, one query language. Replace is find plus a field map, not a sibling script.

```text
node scripts/find.mjs --word family=joinMarker,series=e
node scripts/find.mjs --word family=joinMarker,series=e --map series=e:o,o:e
node scripts/find.mjs --word family=joinMarker,series=e --map series=e:o,o:e --write
```

`--map` is one or more `field=from:to,from:to`. Applied to **matched words only**, from the pre-rewrite parse. Several `--word` / `--seq` / `--construction` flags still all have to match, as today.

Fields the map may set are the same keys Phase 1 adds to queries, plus hook `form` (the spelling `ol`, `ael`, `uem`). A vowel cycle is a chain: `pointer=a:o,o:e,e:a` leaves `u`.

Rebuild is splice-in-place, like retie's `spliceRoots`: replace the known `series` / `form` / `marker` / slot letters in `raw`, keep role, ending, hook prefix, overlay host, digits after a number marker. Do not invent a second word serializer. Number `marker` is the stored value (`re`, `#`, `rue`, `#-`): splice that slot only, never a `re` in the mantissa. Writing `#` / `_` / `#-` / `#_` stay on the job; a speech map `re:ro,ro:re,rue:ruo,ruo:rue` leaves them alone. Do not map `#:_`. Calendar `roe` is **oe** and stays unless the map names it.

Walk Markdown with retie's span gate (`rewriteMarkdown` / `walkAgebonSpans`). After `--write`, run `reglossMarkdown` on spans whose Agebon changed. Dry run lists review items for spans that matched but could not rebuild.

`--write` reparses each patched span against the **current** parser. Fail the file (no write) if the new text does not parse, or if `--check-ambiguity` is on and it has two trees. Parser membership is not this tool's job: if rank has already moved to **o** in `series.ts`, a leftover `zel` still parses as `join.e` (now *choice*). The map is on letters, not on jobs.

Default paths stay `docs/grammar` and `docs/examples`. Extra roots are as today (`find.mjs … docs/meta`). Phase 2 does not walk `src/`.

## Phases

A phase is one session. Several commits are expected. Do not start the next phase in the same session. `vowel-series-realignment.md` needs Phase 2 landed first.

### Phase 1 — Query keys and word JSON

Add find keys for fields already on `LexWord` / `MorphWordFamily`. Each value is still a whole-field regex.

| Key | Source | Example |
|-----|--------|---------|
| `series` | `joinMarker.series` | `--word family=joinMarker,series=e` |
| `form` | `hook.form` (and hook-compound / prefix hook) | `--word family=hook,form=ol\|em` |
| `marker` | number `stem.marker`, or numeric-prefix `numberStem.marker` | `--word marker=re` |
| `xFamily` | `family.xFamily` | `--word xFamily=ability` |
| `reading` | `word.reading` | `--word reading=restrictor,series=e` |
| `scope` | say `scope`, or `scopeVowel` on role / pointer / `th`-scope | `--word family=say,scope=a` |
| `answer` | say `answer` | `--word family=say,answer=e` |
| `stance` | ability / sake `stanceVowel` | `--word xFamily=ability,stance=e` |
| `pointer` | `pointerVowel` | `--word xFamily=pointer,pointer=a` |

`--json` includes, per hit: `file`, `line`, `index`, `text`, and `words`: `{ raw, role, family, series, form, marker, xFamily, reading, scope, answer, stance, pointer }`. Text output stays `file:line  [highlighted]`.

Pin the new keys in [`src/find/query.test.ts`](../../src/find/query.test.ts). Update the AGENTS.md find bullet and the `find.mjs` header comment when absorbed.

**Done when:** `find.mjs --word family=joinMarker,series=e --count` and `--word family=say,answer=e --json` work, polar *yes* is `--word family=joinMarker,role=y,series=ae` rather than `polar.starter`, and `--word marker=re --count` is spelled ordinals only (`gredol`, not `g#2`, not digit `re`).

**Not this phase:** `--map`, `--write`, `src/` walks.

### Phase 2 — Map and write on docs spans

`--map` / `--write` as in [Design](#design). Dry run is the default when `--map` is present; `--write` needs `--map`.

Reuse retie's Markdown walk and gloss follow. Add splice cases retie does not have: `joinMarker` series (including stacked `ae` / `yaol`), hook `form`, number `marker` (speech in the stem; the same field on `xFamily=numeric`), say `scope` and `answer` (two slots in one word; a map may name one or both), `scopeVowel` / `stanceVowel` / `pointerVowel` on `x` families. Soft endings and `-r` / `-m` / plural ride in `raw` after the spliced letters.

Several `--map` flags, or one comma-separated flag, apply together on the same original word so `series=e:o,o:e` is a swap.

Suggested commits: (1) splice helpers + unit tests on one word each of join, hook, act, say, role scope, pointer, ability, spelled number, shorthand number (no change), numeric prefix; (2) CLI `--map` dry run; (3) `--write` + gloss follow + reparse guard; (4) a pinned docs fixture (a tiny Markdown file in the test, not a grammar page).

**Done when:** a dry run of `--word family=joinMarker,series=e|o --map series=e:o,o:e` lists `zel` → `zol` and `zol` → `zel` and does not list hook `ol`; `--word marker=re|ro --map marker=re:ro,ro:re` lists `gredol` → `grodol` and not `g#2`; `--write` on a fixture swaps both, updates the morph line, and fails if the new span does not parse.

**Not this phase:** tests under `src/`, `cases.tsv`, the game, cue prose.

### Phase 3 — Tests and other corpora

Same queries and maps, on the files retie already knows how to walk as string literals (`src/`, `scripts/`, site tests) plus TSV columns that hold Agebon (`src/english-helper/cases.tsv`, `src/parse` corpora). Skip `src/retie/` fixtures, as retie does. `docs/meta/` is already a path you can pass; include it in the default when the query is `--write` only if the span gate classifies the text as Agebon (retie's review list covers the rest).

Game answer keys and `syntax-test-corpus.md` are in this phase if they parse as Agebon; otherwise they stay grep.

**Done when:** `--write` with an explicit `src` path rewrites a parse-test literal the same way a docs span does, and `src/retie/` is untouched.

This phase can wait until after a grammar absorb that still hand-edits tests, or run first so that absorb's test sweep is mechanical too.

## What a person still edits

Owning-page maps (*o* is now rank), cue columns, D-40 / D-44 / D-49 prose, cheat-sheet row English, and any example whose *English* must change because the letter was left on purpose (none of the pairwise swaps). The tool changes Agebon in spans. It does not teach.

## Absorb

Owning code: [`src/find/`](../../src/find/), [`scripts/find.mjs`](../../scripts/find.mjs). Splice helpers may live next to [`src/retie/rebuild.ts`](../../src/retie/rebuild.ts) if they share `peel` / `raw` structure; they must not take a root map. Parser construction ids can gain `say.scope.*` / `say.answer.*` / `ability.stance.*` in the same change as the find keys if that is cheaper than parallel keys; find keys still exist so a map can name the field.

After Phase 1: AGENTS.md find bullet. After Phase 2: the replace flags and the “series-letter examples are a hand edit” line (that line becomes “use `find.mjs --map`; retie still will not catch them”). No grammar-page links.

`vowel-series-realignment.md` Phase 1 (join) starts only once this Phase 2 is in. Its example sweep is then one `--map` per family, dry run, `--write`, leftover `--count`.
