# Reading and searching Ageben

Editors only. How to parse an Ageben sentence, work out what it means, search the docs for a construction, and find a form from an English cue. Wrapped by the `read-ageben` skill.

## Parsing {#parsing}

Run **`node scripts/parse.mjs '<sentence>'`** directly (not `npm run parse` or `tsx src/parse/cli.ts`). It rebuilds automatically when `src/` changes, and each call takes a few seconds to start, so put every sentence in one call: several quoted inputs, or `-` for one input per line on stdin. For each input it prints the input, then its morph gloss or a one-line `ERROR`, then any word the lexicon does not know (a stem that only parses is not a lexicon word, and an unlisted compound shows its possible split). It exits 1 when any input does not parse. Add `--check-lexicon` to exit 1 on unknown words too, `--check-ambiguity` to report readings no grammar rule picks between, and `--constructions` to list the construction IDs. `--json` prints the parse tree instead, for debugging the parser. Unknown flags are rejected so they are not parsed as Ageben.

Run **`npm run -s reading -- '<sentence>'`** (or `node scripts/reading.mjs`; also `--file <path>`, `-` for stdin, one input per line) when you need to see what the interpreter reads rather than what a sentence means: each clause's frames in text order, the scope order it copies from the resolve stage (`order`, and any `unordered` pair), the claim (verb, `z`/`d`/`b`, predicate, details), links, and anything it could not place (`unread`). Nested readings print indented under their parent. `--json` prints the readings with each word reduced to its position and text. Use it for interpreter and host work and for checking a frame or a table row; use `parse.mjs --llm-prompt` (below) to work out what a sentence means.

## Translating to English {#translating}

Run **`node scripts/parse.mjs --llm-prompt '<sentence>'`** (several quoted inputs make one passage; `--loose` for no note) and follow the prompt it prints. It is self-contained: how to read the morph gloss, the tags and constructions that sentence uses, and the closest doc examples with their English. Use it instead of reading grammar pages to work out what a sentence means.

It is built from the docs, so where it and a grammar page disagree, the page wins: fix the prompt's source (core in [`src/parse/llm-prompt.ts`](../../../src/parse/llm-prompt.ts), `reader` notes in [`src/parse/constructions.ts`](../../../src/parse/constructions.ts)). `npm run llm-eval` scores it on doc pairs; it calls models and costs money, so run it only when asked.

## Searching examples by construction {#find}

Grep is fine for a fixed spelling. For grammar questions use **`node scripts/find.mjs`**. `--help` lists every key with sample values, every flag, and how a construction ID is built; `--values KEY` counts the values a key takes, and `--constructions` counts construction IDs, over the matching examples or all of them. A term is `key=regex[,…]`, each regex matching a whole value, and `key!=regex` negates: `--word role=v,ending=r`, `--word overlayKind=evidential` (any channel, by the overlay's kind rather than its sense form), `--word frame=stance/channel`, `--construction 'overlay.ubol*'` or `'/regex/'`.

**Output.** A listing prints the match count with the files that hold the most, then 10 hits spread over the files, then how many more. That is usually enough; `--count` prints only the count. Add `--all` only when you need every hit, and `--json` for a script: it lists every hit and gives each word its construction IDs, overlay kind, frames, reach, and clause number. `--map` dry runs and `--diff` cut the same way; `--values` and `--constructions` tallies print in full.

**Order and clause.** `--seq` matches neighboring words in order, and `...` between terms matches zero or more words. `--same-clause` requires every word of a `--seq` hit to sit in one clause: the innermost body clause, clause-join member, or dependent. Several query flags must all match, anywhere in the example, so two `--construction` flags can match across clauses; use `--seq … --same-clause` when they must share one. A channel after a binder or occasion word, in one clause: `--same-clause --seq 'frame=binder|occasion' ... overlayKind=evidential`.

**Frames.** `frame=` and the scope flags read the [reader's](../interpreter.md) readings, not the parse. `frame=` lists every frame on a word: a reading's whole-clause frames (members, dependents, islands, and verb-list items included), frames held inside another frame, and frames on a list, an adjective, a noun, or another describing word. `reach=` says which of those places it is: `clause`, `nested`, `list`, `adjective`, `noun`, or `word`. In one term, `frame=` and `reach=` hold of the same frame, so `--word frame=stance,reach=clause` gives only whole-clause stances. A tone mark's frame sits on no word; find tone marks by construction (`--construction 'tone.*'`).

**Scope order.** `--over F --under G` matches a reading whose frame order puts frame F over G, each a family or `family/member` as `--values frame` lists them; one side alone matches any partner. `--unordered` matches a reading with a frame pair no rule orders yet. Both look inside nested readings too.

**Measuring a scope decision.** `--diff REV` parses and reads the current docs twice, with the parser and reader at `REV` and with the current ones, and lists each example whose frame order differs: `-` pairs only at `REV`, `+` pairs only now. Run it after a scope change, before committing, with `--diff HEAD` to see what the change flipped, and use the count as the decision's cost; once the docs are rewritten, the same run checks that the rewrites landed. Other query flags narrow the examples compared. `REV` must be a13f294c or later, the first commit with the reader. A run takes about 18 s; `--jobs 4` brings it to about 14 s, at three times the CPU (`--jobs N` splits any pass across N threads, same output).

**Rewriting matches.** To rewrite matched letter slots, add `--map field=from:to,from:to` (dry run; several fields or flags apply on the original parse so `e:o,o:e` is a swap). `--write` patches Ageben spans and regenerates morph glosses; it needs `--map`. `--count` is matching examples with or without `--map`.

**Paths.** Default paths are `docs/grammar` and `docs/examples`; pass `src`, `scripts`, `docs/meta`, or a `.tsv` to walk string literals and TSV cells (`src/retie/` is skipped). `--write` patches docs, TSV, and non-test source; pass `--tests` to include `*.test.ts` (assertions next to a literal stay). `--write` leaves a span that does not reparse and still writes the rest of the file.

Series-letter examples are not a retie: use `find.mjs --map`; `retie-docs` still will not catch them.

## Finding a form from an English cue {#find-english}

Run **`node scripts/find-english.mjs '<phrase>'`** before logging a grammar gap, and log the phrases you tried in the gap row. It searches example English, word glosses, table rows, and practice in `docs/grammar/`, plus published-root senses and `english_aliases` synonyms (`--kind root`), grouped by owning section. Add `--stage`, `--kind`, `--json`, or `--count`.

To go further, from an English sentence to suggested roots and sections, use the English helper ([running the helper](english-helper.md#running)).

## One tree per sentence {#grammar-check}

After changing `src/parse/sentence-parser.ts` (rules or `markContext`), run **`npm run grammar-check`** (about a minute; not part of `npm test`). It fails on any `GATE`, LR(1) conflict, or doc sentence with two trees; turn a new choice into structure or a token mark, never a gate.
