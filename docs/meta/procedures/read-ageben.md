# Reading and searching Ageben

Editors only. How to parse an Ageben sentence, work out what it means, search the docs for a construction, and find a form from an English cue. Wrapped by the `read-ageben` skill.

## Parsing {#parsing}

Run **`node scripts/parse.mjs '<sentence>'`** directly (not `npm run parse` or `tsx src/parse/cli.ts`). It rebuilds automatically when `src/` changes. Pass several quoted inputs in one call (JSON array out), or `-` for one input per line on stdin. There is no `--json` flag; unknown flags are rejected so they are not parsed as Ageben. Add `--check-ambiguity` as needed, and `--check-lexicon` to list words the lexicon does not know (a stem that only parses is not a lexicon word, and an unlisted compound shows its possible split).

## Translating to English {#translating}

Run **`node scripts/parse.mjs --llm-prompt '<sentence>'`** (several quoted inputs make one passage; `--loose` for no note) and follow the prompt it prints. It is self-contained: how to read the morph gloss, the tags and constructions that sentence uses, and the closest doc examples with their English. Use it instead of reading grammar pages to work out what a sentence means.

It is built from the docs, so where it and a grammar page disagree, the page wins: fix the prompt's source (core in [`src/parse/llm-prompt.ts`](../../../src/parse/llm-prompt.ts), `reader` notes in [`src/parse/constructions.ts`](../../../src/parse/constructions.ts)). `npm run llm-eval` scores it on doc pairs; it calls models and costs money, so run it only when asked.

## Searching examples by construction {#find}

Grep is fine for a fixed spelling. For grammar questions use **`node scripts/find.mjs`** with `key=value[,…]` terms (`role`, `ending`, `root`, `family`, `overlay`, `unit`, `raw`, `series`, `form`, `marker`, `xFamily`, `reading`, `scope`, `answer`, `stance`, `pointer`, `locus`). Each value is a regex that must match the whole field, and `key!=value` negates: e.g. `--word role=v,ending=r`, `--seq 'role!=[zdb]' family=hook,raw=em role=b`, `--word 'raw=.*em'`, `--word family=joinMarker,series=e`, `--word marker=re`, `--construction 'overlay.<form>*'` or `'/regex/'`. Add `--count` or `--json`. Number `marker` treats writing and speech twins as the same job (`#` / `re`).

**Rewriting matches.** To rewrite matched letter slots, add `--map field=from:to,from:to` (dry run; several fields or flags apply on the original parse so `e:o,o:e` is a swap). `--write` patches Ageben spans and regenerates morph glosses; it needs `--map`. `--count` is matching examples with or without `--map`.

**Paths.** Default paths are `docs/grammar` and `docs/examples`; pass `src`, `scripts`, `docs/meta`, or a `.tsv` to walk string literals and TSV cells (`src/retie/` is skipped). `--write` patches docs, TSV, and non-test source; pass `--tests` to include `*.test.ts` (assertions next to a literal stay). `--write` leaves a span that does not reparse and still writes the rest of the file.

Series-letter examples are not a retie: use `find.mjs --map`; `retie-docs` still will not catch them.

## Finding a form from an English cue {#find-english}

Run **`node scripts/find-english.mjs '<phrase>'`** before logging a grammar gap, and log the phrases you tried in the gap row. It searches example English, word glosses, table rows, and practice in `docs/grammar/`, plus published-root senses and `english_aliases` synonyms (`--kind root`), grouped by owning section. Add `--stage`, `--kind`, `--json`, or `--count`.

To go further, from an English sentence to suggested roots and sections, use the English helper ([running the helper](english-helper.md#running)).

## One tree per sentence {#grammar-check}

After changing `src/parse/sentence-parser.ts` (rules or `markContext`), run **`npm run grammar-check`** (about a minute; not part of `npm test`). It fails on any `GATE`, LR(1) conflict, or doc sentence with two trees; turn a new choice into structure or a token mark, never a gate.
