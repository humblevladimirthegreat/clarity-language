# Reading and searching Ageben

Editors only. How to parse an Ageben sentence, work out what it means, search the docs for a construction, and find a form from an English cue. Wrapped by the `read-ageben` skill.

## Parsing {#parsing}

Run **`node scripts/parse.mjs '<sentence>'`** directly (not `npm run parse` or `tsx src/parse/cli.ts`). It rebuilds automatically when `src/` changes, and each call takes a few seconds to start, so put every sentence in one call: several quoted inputs, or `-` for one input per line on stdin. For each input it prints the input, then its morph gloss or a one-line `ERROR`, then any word the lexicon does not know (a stem that only parses is not a lexicon word, and an unlisted compound shows its possible split). It exits 1 when any input does not parse. Add `--check-lexicon` to exit 1 on unknown words too, `--check-ambiguity` to report readings no grammar rule picks between, and `--constructions` to list the construction IDs. `--json` prints the parse tree instead, for debugging the parser. Unknown flags are rejected so they are not parsed as Ageben.

## Translating to English {#translating}

Run **`node scripts/parse.mjs --llm-prompt '<sentence>'`** (several quoted inputs make one passage; `--loose` for no note) and follow the prompt it prints. It is self-contained: how to read the morph gloss, the tags and constructions that sentence uses, and the closest doc examples with their English. Use it instead of reading grammar pages to work out what a sentence means.

It is built from the docs, so where it and a grammar page disagree, the page wins: fix the prompt's source (core in [`src/parse/llm-prompt.ts`](../../../src/parse/llm-prompt.ts), `reader` notes in [`src/parse/constructions.ts`](../../../src/parse/constructions.ts)). `npm run llm-eval` scores it on doc pairs; it calls models and costs money, so run it only when asked.

## Searching examples by construction {#find}

Grep is fine for a fixed spelling. For grammar questions use **`node scripts/find.mjs`**. `--help` lists every key with sample values, every flag, and how a construction ID is built; `--values KEY` counts the values a key takes, and `--constructions` counts construction IDs, over the matching examples or all of them. A term is `key=regex[,…]`, each regex matching a whole value, and `key!=regex` negates: `--word role=v,ending=r`, `--word overlayKind=evidential` (any channel, by the overlay's kind rather than its sense form), `--word frame=stance/channel`, `--construction 'overlay.ubol*'` or `'/regex/'`. Add `--count` or `--json`; `--json` gives each word its construction IDs, overlay kind, frames, and clause number.

**Order and clause.** `--seq` matches neighboring words in order, and `...` between terms matches zero or more words. `--same-clause` requires every word of a `--seq` hit to sit in one clause: the innermost body clause, clause-join member, or dependent. Several query flags must all match, anywhere in the example, so two `--construction` flags can match across clauses; use `--seq … --same-clause` when they must share one. A channel after a binder or occasion word, in one clause: `--same-clause --seq 'frame=binder|occasion' ... overlayKind=evidential`.

**Scope order.** `--over F --under G` matches a clause whose frame order (`resolve.scope`, [scope.ts](../../../src/parse/scope.ts)) puts frame F over G, each a family or `family/member` as `--values frame` lists them; one side alone matches any partner. `--unordered` matches a clause with a frame pair no rule orders yet.

**Measuring a scope decision.** `--diff REV` parses the current docs twice, with the parser at `REV` and with the current one, and lists each example whose frame order differs: `-` pairs only at `REV`, `+` pairs only now. Run it after a scope change, before committing, with `--diff HEAD` to see what the change flipped, and use the count as the decision's cost; once the docs are rewritten, the same run checks that the rewrites landed. Other query flags narrow the examples compared. `REV` must be ff43d91d or later, and a run takes about 20 s.

**Rewriting matches.** To rewrite matched letter slots, add `--map field=from:to,from:to` (dry run; several fields or flags apply on the original parse so `e:o,o:e` is a swap). `--write` patches Ageben spans and regenerates morph glosses; it needs `--map`. `--count` is matching examples with or without `--map`.

**Paths.** Default paths are `docs/grammar` and `docs/examples`; pass `src`, `scripts`, `docs/meta`, or a `.tsv` to walk string literals and TSV cells (`src/retie/` is skipped). `--write` patches docs, TSV, and non-test source; pass `--tests` to include `*.test.ts` (assertions next to a literal stay). `--write` leaves a span that does not reparse and still writes the rest of the file.

Series-letter examples are not a retie: use `find.mjs --map`; `retie-docs` still will not catch them.

## Finding a form from an English cue {#find-english}

Run **`node scripts/find-english.mjs '<phrase>'`** before logging a grammar gap, and log the phrases you tried in the gap row. It searches example English, word glosses, table rows, and practice in `docs/grammar/`, plus published-root senses and `english_aliases` synonyms (`--kind root`), grouped by owning section. Add `--stage`, `--kind`, `--json`, or `--count`.

To go further, from an English sentence to suggested roots and sections, use the English helper ([running the helper](english-helper.md#running)).

## One tree per sentence {#grammar-check}

After changing `src/parse/sentence-parser.ts` (rules or `markContext`), run **`npm run grammar-check`** (about a minute; not part of `npm test`). It fails on any `GATE`, LR(1) conflict, or doc sentence with two trees; turn a new choice into structure or a token mark, never a gate.
