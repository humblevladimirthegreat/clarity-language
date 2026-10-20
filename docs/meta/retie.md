# Lexicon retie: known issues

<!-- retie: skip -->

Editors only. What a lexicon retie still leaves to a person, and how to find each case. The procedure itself is in [lexicon editing § respelling a row](lexicon.md#respelling-a-row) and `AGENTS.md`; this page lists its limits.

The root-tails retie (2026-10-20: 1345 respelled roots, 17 of them closed roots) wrote without `--force`: 0 blocking, 1 warning (a proposal's coined form), 7 review items. Every build check on the docs and `grammar-check` passed afterwards; 17 tests failed, all of the kinds under [tests](#tests). IPA lines, syllable hints and words inside multi-sentence cites were fixed by hand; the retie now does all three ([docs](#docs)).

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
| `root-tails.md` | a dated record of the phase 1 run, spelled as it ran |
| [parser-pipeline.md](parser-pipeline.md) | tooling notes; its Egabon only illustrates a CLI call |
| this page | its examples name old and new spellings |
| `TODO.md` | planning notes (never retied) |
| [cool-features.md](cool-features.md) | a record of posts as they were made |
| [syntax-test-results.md](syntax-test-results.md) | a dated log of test runs, spelled as they ran |
| `tail-suffix.md` | a proposal whose coined stems are not listed words; rework them by hand after a retie |

A page opts out with `<!-- retie: skip -->` on a line of its own ([retie-safe writing](grammar-docs.md#retie-safe-writing)). Active proposals are retied.

## Docs: what to read after `--write` {#docs}

- **Review items** are text the retie could not classify: a CLI call in code, coined forms in a proposal (`named-handle-coinage.md` derives a handle from root pieces, so it must be rerun by hand, and its `abulo` can collide with a new root). Collisions found only in proposals are warnings, not blocks.
- **Examples that rest on a spelling coincidence** still parse and lint, so nothing reports them: two roots that shared a short stem, a full-root resume that was needed only because of a neighbor. Reread the [full-root resume](../grammar/pronouns.md#resume-r) examples after any retie.
- **Bare-resume warnings** (`zazawar` reads another root now) mean a resume in prose binds by its stem; the warning names the spelling that keeps the old reading when one exists.
- **Spans.** Every non-opaque span is Egabon and is retied word by word: a cite (`d[…]`, `d~[…]`), a nested cite, and each sentence inside one, punctuation and tone marks included. An opaque span (`d<kimchi>`) is foreign text and is never retied, its `OPAQUE["…"]` morph copy included, even after a mention marker. So a mention of an Egabon spelling is a cite (`glelel z[udozo]`), and `lint:egabon` fails an opaque payload spelled like Egabon (`native-opaque`).
- **Names.** A named word's English name follows its code in prose and morph lines, plural (*some Uzozens*) and shouted (*UZOZEN*) included. House-cast names follow from the closed roots, so they also move inside code (a morph example in backticks) and on a page with no code for them. Source comments are never retied: write the rule there, not a house name. `lint:egabon` fails a capitalised name spelled like root + **-n** whose root is not in the lexicon (`stale-name`), on grammar pages and in `docs/meta/`; it cannot see an old name whose root another row has since taken.
- **IPA lines, syllable hints and inline spellings** follow the page's word changes (`src/retie/derived.ts`): a whole-line IPA (`/ ˈzʉ.zä.zo̞n /`), an italic hint whose letters spell a moved word (*o-wo-re-lul*), and `` `word` is `e` `ga` … `` when the names spell the word's old letters. IPA inside a table or prose is not touched, and a hint or spelling that was already wrong stays wrong: read the fixes the dry run lists.
- **Letter names.** A line in a fence after `<!-- retie: letter-names -->` is respelled from its word ([phonology.md § letter names](../grammar/phonology.md#letter-names)); an inline spelling is the bullet above. Any other spelled-out word must be marked or fixed by hand.

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
