# Lexicon retie: known issues

<!-- retie: skip -->

Editors only. What a lexicon retie still leaves to a person, and how to find each case. The procedure itself is in [lexicon editing § respelling a row](lexicon.md#respelling-a-row) and `AGENTS.md`; this page lists its limits.

The root-tails retie (2026-10-20: 1345 respelled roots, 17 of them closed roots) wrote without `--force`: 0 blocking, 1 warning (a proposal's coined form), 7 review items. Every build check on the docs and `grammar-check` passed afterwards; 17 tests failed, all of the kinds under [tests](#tests). IPA lines, syllable hints and words inside multi-sentence cites were fixed by hand; the retie now does all three ([docs](#docs)).

## Before the retie {#before}

- **Seams the new spellings open.** After `convert-word --lexicon` and before the retie, run `npm test`: it runs the holder check (`src/root-tails.test.ts`), listed compounds (`check-compounds`), and `glossCollisions` over the whole lexicon (`lexicon-published-lint.test.ts`). A seam no rule names yet shows there as two forms with one gloss label (`thuguromalerol` / `thuguromalerom`, which was the holder seam). Fix it in placement, then rerun `convert-word --lexicon`.
- **Spelling-rule passes** (`j` → `y`) go before `convert-word --lexicon` or after the retie, never between: the map's old spellings must still parse.
- **Run the dry run first** and read every line marked `blocking`, `warning` and `review` before `--write`.
- **Only lexicon respellings retie.** A map that was already applied stops the run with `nothing to retie`, before any collision check. A respelling of closed grammar in `src/` (the digit syllables, closed forms) makes no map. Series-letter examples (join vowels, hook forms, number-marker speech, say slots, scope / stance / pointer / locus) are not a retie: use `find.mjs --map`; `retie-docs` still will not catch them.

## The language name {#language-name}

The name is the 👓 root + **-n**. `retie-docs` never respells it: not `ageben`, not *Ageben*, not the `ageben` fence tag, `lint:ageben`, file names or URLs. When 👓 moves, the dry run prints `language name 👓 old → new`. Then run **`npm run rename-language`** (dry run), then **`npm run rename-language -- --write`**, in the same change as the retie: `introduction.md` names the root beside the name, so until then it shows the new root beside the old name. The script reads the old name from the `package.json` name and the new one from 👓 + **-n** (`--from` / `--to` override), and:

- Respells the name in every tracked text file in its own casing (`Ageben`, `ageben`, `AGEBEN`): English prose, headings, word-bank headers (`| English | Ageben | Cue |`), the fence info string, lint kinds (`ageben-in-text-fence`), identifiers, the package name. Any other casing is listed for review.
- Respells the old root only in [language-name.md](language-name.md); elsewhere that spelling may now be another row's root.
- Moves every tracked path that carries the name **except published grammar pages** (Markdown under `docs/grammar/` outside `.vitepress/`). Those slugs stay name-stable (`purpose.md`, `claritish/learn.md`, `cheat-sheets/to-english.md`); a grammar page whose path still carries the name is a block. Other paths (`lint-ageben-docs.ts`, `AgebenInspect.vue`) still move. Adds a `pageMoves` row to `scripts/site-redirects.json` for each moved grammar page, retargeting older rows so redirects never chain (`from` URLs and existing notes stay as written). Paste the new Amplify JSON afterward ([site redirects](site-redirects.md)).
- Refuses `--write` on a dirty tree, or when the new name already occurs, unless `--force`. After the rename, `npm run rename-language -- --from <old> --force` catches stragglers (edits merged later).

## Pages the retie skips {#skipped}

These keep their spellings on purpose and go stale after every retie. Never copy an example from one into a grammar page.

| Page | Why |
|------|-----|
| `docs/proposals/rejected/` | a past design, spelled as it was |
| [parser-pipeline.md](parser-pipeline.md) | tooling notes; its Ageben only illustrates a CLI call |
| this page | its examples name old and new spellings |
| `TODO.md` | planning notes (never retied) |
| [cool-features.md](cool-features.md) | a record of posts as they were made |
| [syntax-test-results.md](syntax-test-results.md) | a dated log of test runs, spelled as they ran |

A page opts out with `<!-- retie: skip -->` on a line of its own ([retie-safe writing](grammar-docs.md#retie-safe-writing)). Active proposals are retied.

## Docs: what to read after `--write` {#docs}

- **Review items** are text the retie could not classify: a CLI call in code, coined forms in a proposal. Collisions found only in proposals are warnings, not blocks.
- **Initials** ([initials.md § Initials](/initials#initials)) copy each title root's first consonant into a code the retie never touches. `src/lint/initials-docs.test.ts` fails when a title root moves; respell the handle and its 🔊 lines by hand.
- **Examples that rest on a spelling coincidence** still parse and lint, so nothing reports them: two roots that shared a short stem, a full-root resume that was needed only because of a neighbor. Reread the [full-root resume](/pronouns#resume-r) examples after any retie.
- **Bare-resume warnings** (`zazawar` reads another root now) mean a resume in prose binds by its stem; the warning names the spelling that keeps the old reading when one exists.
- **Spans.** Every non-opaque span is Ageben and is retied word by word: a cite (`d[…]`, `d~[…]`), a nested cite, and each sentence inside one, punctuation and tone marks included. An opaque span (`d<kimchi>`) is foreign text and is never retied, its `OPAQUE["…"]` morph copy included, even after a mention marker. So a mention of an Ageben spelling is a cite (`glelel z[udozo]`), and `lint:ageben` fails an opaque payload spelled like Ageben (`native-opaque`).
- **Names.** A named word's English name follows its code in prose and morph lines, plural (*some Uzozens*) and shouted (*UZOZEN*) included. House-cast names follow from the closed roots, so they also move inside code (a morph example in backticks) and on a page with no code for them. Source comments are never retied: write the rule there, not a house name. `lint:ageben` fails a capitalised name spelled like root + **-n** whose root is not in the lexicon (`stale-name`), on grammar pages and in `docs/meta/`; it cannot see an old name whose root another row has since taken.
- **IPA lines, syllable hints and inline spellings** follow the page's word changes (`src/retie/derived.ts`): a whole-line IPA (`/ ˈzʉ.zä.zo̞n /`), an italic hint whose letters spell a moved word (*o-wo-re-lul*), and `` `word` is `e` `ga` … `` when the names spell the word's old letters. IPA inside a table or prose is not touched, and a hint or spelling that was already wrong stays wrong: read the fixes the dry run lists.
- **Letter names.** A line in a fence after `<!-- retie: letter-names -->` is respelled from its word ([phonology.md § letter names](/phonotactics#letter-names)); an inline spelling is the bullet above. Any other spelled-out word must be marked or fixed by hand.

## Tests {#tests}

`retie-docs` rewrites string literals, template pieces and regex literals under `src/`, `scripts/` and the site, and tests that read the real lexicon move as a whole (fixture rows with their uses). These still need a hand pass after `npm test`:

| What | Where (2026-10-19) | Why it cannot follow |
|------|--------------------|----------------------|
| IPA expectations | `src/tts/phonemes.test.ts`, `src/tts/plan.test.ts` | IPA is derived from the spelling, not a copy of it |
| A spelling that must stay unknown | `src/lint/ageben-docs.test.ts` (`ezuzo`) | the new lexicon may publish it |
| Lexicon coincidences | `src/find/query.test.ts`, `src/parse/lexicon-check.test.ts`, `src/parse/inspect.test.ts` (possible compound splits) | the expected match exists only in the old lexicon |
| Tests of the retie tool on real roots | `src/retie/drift.test.ts`, parts of `src/retie/retie-tokens.test.ts` | `src/retie/` is never retied, so its own fixtures stay put |

The `--write` run also lists test literals it only reports (`string literal … spells old root`): a bare root in a test is read as that file's own fixture, so words on it stay as written. When the file means the real root, name it through `CLOSED` (`assert.equal(root, CLOSED.walk)`); then the next retie moves it.

A new test of this kind should build its expectation from the lexicon (`CLOSED`, `loadDefaultTables()`) or use its own tables (`createClassifyTablesFromRows`), so the next retie leaves it passing.

## After the retie {#after}

1. `npm run build`, `npm test`, `npm run grammar-check`. `--write` already regenerated the cheat-sheet blocks and the English-helper WordNet index.
2. Read the review list and warnings from the `--write` run.
3. Run `npm run rename-language` if 👓 moved ([language name](#language-name)), and do the [tests](#tests) pass.
