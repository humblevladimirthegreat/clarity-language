# Lexicon editing

Editors only. How root spellings are made and changed in the lexicon CSVs. What each CSV owns is in the `AGENTS.md` routing table; overlay kinds are in [parser pipeline](parser-pipeline.md#overlay-kinds).

## Root spellings come from `convert-word`

Never make up a root spelling by hand, whether for a new row, a respelling, or a shorter root for a row that gains an overlay. Generate it with:

```
npm run convert-word -- --lexicon --only LITERAL
```

`--only` takes a concrete literal, emoji, or root (repeatable or comma-separated) and limits the run to those published rows; every other row keeps its root. `--lexicon` alone is refused; `--lexicon --all` re-places the whole lexicon.

A hand-picked spelling bypasses the checks that placement runs. Placement:

- derives the root from the English pronunciation (CMU dictionary), so it sounds like its cue
- skips roots already held by other rows and stems used in [`lexicon-compounds.csv`](../../data/lexicon-compounds.csv)
- picks the root's length from the row's role (below)
- rewrites the overlay and compound rows that spell the old root, and writes `tmp/lexicon-retie-map.json` for `retie-docs`

`npm run convert-word -- <english>` (no `--lexicon`) only prints a candidate. Use it to explore, not as a source for a hand edit.

## Flag rows

A row whose emoji is a country or territory flag labels its concrete sense `<place>-flag` (`japan-flag`): **-l** is the flag, **-n** names the place, and the abstract is the demonym ([countries and traditions](../grammar/word-endings.md#countries-traditions)). Placement ignores the `-flag` suffix when it looks up the pronunciation, so a root is spelled from the place name. Use `stripFlagSuffix` from [`src/flag-label.ts`](../../src/flag-label.ts) rather than matching the suffix by hand.

Tradition and religion rows follow the same split (**-n** the tradition, **-m** an adherent or quality, **-l** the symbol), so each needs an abstract column that names the adherent.

## Placeholder spellings

When a root's spelling is not yet known (a proposal, a draft page, a planned overlay), write the row's **emoji** where the spelling would go, with any affixes around it (`gl🔤l`). Never invent a provisional spelling, even a plausible one: it would look real and could be copied. The emoji is replaced by the generated root when `convert-word` places the row, and the retie procedure below covers any page that already holds it.

## Root length

- **Three letters:** rows backed by an overlay, plus the marked pronouns. These are annealed so short roots stay apart from each other.
- **Five letters:** every other row, frequent senses first.

So a row that gains its first overlay needs a `convert-word --only` run to get a three-letter root. A row that loses its last overlay keeps its short root until the next full `--lexicon` run, which may lengthen it.

## Respelling a row

After `convert-word`, run the retie procedure in `AGENTS.md` (`retie-docs` dry run, then `--write`, then build and test). A retie changes the spelling of the same sense everywhere, and code never spells a root as a string literal; use [`src/closed-roots.ts`](../../src/closed-roots.ts).

## Moving an overlay to another row

Moving a sense (an overlay) from one published row to another is a **replacement**, not a retie. `retie-docs` follows a row's own respelling, so it never moves forms from the old row's root to the new one.

1. In [`lexicon-overlays.csv`](../../data/lexicon-overlays.csv), change each moved row's `emoji` to the target row and its `sense_form` to spell the target row's **current** root. Update `gloss`, `definition` and `mnemonic` to match.
2. Run `npm run convert-word -- --lexicon --only <target>`. If the target now needs a three-letter root, this respells it and rewrites the overlay `sense_form`s to match.
3. Run `retie-docs` for the target's respelling, as for any respelling.
4. By hand, replace every doc use of the **old** root in the moved sense with the new root, and fix the morph glosses and English wording. Leave uses of the old row's ordinary sense alone. Check with `node scripts/find.mjs` or grep for the old sense forms.
5. `npm run build` and `npm test`.
