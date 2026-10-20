# Lexicon retie: known issues

<!-- retie: skip -->

Editors only. What a lexicon retie still leaves to a person, and how to find each case. The procedure itself is in [lexicon editing § respelling a row](lexicon.md#respelling-a-row) and `AGENTS.md`; this page lists its limits.

The root-tails retie (2026-10-20: 1345 respelled roots, 17 of them closed roots) wrote without `--force`: 0 blocking, 1 warning (a proposal's coined form), 7 review items. Every build check on the docs and `grammar-check` passed afterwards; 17 tests failed, all of the kinds under [tests](#tests), and a few italic syllable hints (*o-wo-re-lul*) needed a hand respelling ([docs](#docs)).

## Before the retie {#before}

- **Seams the new spellings open.** After `convert-word --lexicon` and before the retie, run `npm test`: it checks the hook and holder checks (`src/root-tails.test.ts`), listed compounds (`check-compounds`), and `glossCollisions` over the whole lexicon (`lexicon-published-lint.test.ts`). A seam no rule names yet shows there as two forms with one gloss label (`thuguromalerol` / `thuguromalerom`, which was the holder seam). Fix it in placement, then rerun `convert-word --lexicon`.
- **Spelling-rule passes** (`j` → `y`) go before `convert-word --lexicon` or after the retie, never between: the map's old spellings must still parse.
- **Run the dry run first** and read every line marked `blocking`, `warning` and `review` before `--write`.

## The language name {#language-name}

The name is the 👓 root + **-n**. `retie-docs` never respells it: not `egabon`, not *Egabon*, not the `egabon` fence tag, `lint:egabon`, file names or URLs. When 👓 moves, the dry run prints `language name 👓 old → new`, and the rename is a separate hand pass:

- [language-name.md](language-name.md), [introduction.md](../grammar/introduction.md) (the name and its root), and the house rule in `AGENTS.md`.
- English prose, headings and word-bank headers (`| English | Egabon | Cue |`, which the word-bank lint reads).
- Identifiers: the fence info string, lint kinds (`egabon-in-text-fence`), component and file names, the package name, `scripts/site-redirects.json` for any moved URL.
- `introduction.md` names the root beside the name, so after the retie it shows the new root beside the old name until this pass: do it in the same change as the retie.

## Pages the retie skips {#skipped}

These keep their spellings on purpose and go stale after every retie. Never copy an example from one into a grammar page.

| Page | Why |
|------|-----|
| `docs/proposals/rejected/` | a past design, spelled as it was |
| `root-tails.md` | holds phase 1 spellings that are not live, some equal to other rows' old roots |
| [parser-pipeline.md](parser-pipeline.md) | tooling notes; its Egabon only illustrates a CLI call |
| this page | its examples name old and new spellings |
| `TODO.md` | planning notes (never retied) |

A page opts out with `<!-- retie: skip -->` on a line of its own ([retie-safe writing](grammar-docs.md#retie-safe-writing)). Active proposals are retied.

## Docs: what to read after `--write` {#docs}

- **Review items** are text the retie could not classify: a CLI call in code, coined forms in a proposal (`named-handle-coinage.md` derives a handle from root pieces, so it must be rerun by hand, and its `abulo` can collide with a new root). Collisions found only in proposals are warnings, not blocks.
- **Examples that rest on a spelling coincidence** still parse and lint, so nothing reports them: two roots that shared a short stem, a full-root resume that was needed only because of a neighbor. Reread the [full-root resume](../grammar/pronouns.md#resume-r) examples after any retie.
- **Bare-resume warnings** (`zazawar` reads another root now) mean a resume in prose binds by its stem; the warning names the spelling that keeps the old reading when one exists.
- **Opaque loans** (`d<kimchi>`) are never retied, even when a loan happens to spell an old root. A span after a mention marker (`glelel z<odoga>`) is Egabon and does move.
- **IPA lines and syllable hints** come from a spelling but are not one, so they stay put: the phonology try-it lines, the at-a-glance IPA in `why-egabon.md`, and italic hints like *o-wo-re-lul* (`hooks.md`, `phonology.md`, the sounds cheat sheet). Search the grammar for `/ˈ`, `ä.` and italic hyphenated syllables, and rebuild each IPA line with `previewPhonemes` (`src/tts/plan.ts`) or the [Inspect](../grammar/inspect.md) page.
- **Letter names.** Only a line in a fence after `<!-- retie: letter-names -->` is respelled from its word ([phonology.md § letter names](../grammar/phonology.md#letter-names)). Any other spelled-out word must be marked or fixed by hand. The sounds cheat sheet's *Pause between names* line is one such word.

## Tests {#tests}

`retie-docs` rewrites string literals, template pieces and regex literals under `src/`, `scripts/` and the site, and tests that read the real lexicon move as a whole (fixture rows with their uses). These still need a hand pass after `npm test`:

| What | Where (2026-10-19) | Why it cannot follow |
|------|--------------------|----------------------|
| IPA expectations | `src/tts/phonemes.test.ts`, `src/tts/plan.test.ts` | IPA is derived from the spelling, not a copy of it |
| A spelling that must stay unknown | `src/lint/egabon-docs.test.ts` (`ezuzo`) | the new lexicon may publish it |
| Lexicon coincidences | `src/find/query.test.ts`, `src/parse/lexicon-check.test.ts`, `src/parse/inspect.test.ts` (possible compound splits) | the expected match exists only in the old lexicon |
| Tests of the retie tool on real roots | `src/retie/drift.test.ts`, parts of `src/retie/retie-tokens.test.ts` | `src/retie/` is never retied, so its own fixtures stay put |

The `--write` run also lists test literals it only reports (`string literal … spells old root`): a bare root in a test is read as that file's own fixture, so words on it stay as written. When the file means the real root, name it through `CLOSED` (`assert.equal(root, CLOSED.walk)`); then the next retie moves it.

A new test of this kind should build its expectation from the lexicon (`CLOSED`, `loadDefaultTables()`) or use its own tables (`createClassifyTablesFromRows`), so the next retie leaves it passing.

## After the retie {#after}

1. `npm run build`, `npm test`, `npm run grammar-check`. `--write` already regenerated the cheat-sheet blocks and the English-helper WordNet index.
2. Read the review list and warnings from the `--write` run.
3. Do the [language name](#language-name) pass if 👓 moved, and the [tests](#tests) pass.
