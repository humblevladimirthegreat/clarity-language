# Proposal: grammar style pass

**Status:** IN PROGRESS
**Design authority:** [doc-style.md](../meta/doc-style.md) for wording and voice; [grammar-docs.md](../meta/grammar-docs.md) for teaching policy. This pass changes **wording only**. It adds, removes, or changes no forms, readings, rules, or examples.

## Goal

Bring every stage page under `docs/grammar/` into line with [doc-style.md](../meta/doc-style.md), and make the explanations read naturally. Work goes in batches, one batch per session, in the [cross-doc path](../meta/learning-levels.md#cross-doc-path) order. Each later page can then assume that earlier pages already gloss their terms on first use.

## Scope

**In scope (27 pages):** `why-agazan`, `introduction`, `phonology`, `word-endings`, `clause`, `speech-moves`, `dependents`, `pronouns`, `plurality`, `predication`, `joins`, `questions`, `hooks`, `restrictors`, `relations`, `spans`, `numbers`, `comparatives`, `causation`, `sakes`, `intention`, `knowing`, `roles`, `x-compounds`, `join-across-roles`, `numbers-applied`, `numeric-derivation`.

**Out of scope (do not edit):** `english.md` and every `say-*.md` (recipe track), everything under `claritish/`, `terminology.md`, `index.md`, `lexicon.md`, `inspect.md`.

## Session protocol

A session starts with something like "do the next batch." The session then:

1. Opens this file and takes the **first unchecked batch** below. It does only that batch.
2. Reads [doc-style.md](../meta/doc-style.md) in full, plus the sections of [grammar-docs.md](../meta/grammar-docs.md) that the batch touches ([teach in this order](../meta/grammar-docs.md#teach-in-this-order), [later-stage shape](../meta/grammar-docs.md#later-stage-shape), [retie-safe writing](../meta/grammar-docs.md#retie-safe-writing), [marking Agazan](../meta/grammar-docs.md#marking-agazan)).
3. For a Phase 2 batch, reads the whole page before editing it, and skims the Beginner sections of pages earlier in the path when it needs to know whether a term has already been glossed.
4. Edits the page(s), then runs `npm run build` from the repo root and fixes anything it reports.
5. Ticks the batch's checkbox, and appends a dated entry under [Batch log](#batch-log): pages touched, the main kinds of change, and anything deferred.
6. Records every suspected grammar problem (a rule that looks wrong, a missing form, a contradiction between pages) under [Questions for the editor](#questions-for-the-editor). It does **not** fix them.
7. Stops. It does not start the next batch and does not commit unless asked. If asked to commit, the message ends with `[skip-cd]`.

### Ground rules for every batch

- **Wording only.** Do not change Agazan in code spans, example sentences, morph glosses, tables' Agazan columns, or translation checkpoint answers. Do not add or drop examples. Rewording an English translation line is fine only when the meaning stays exactly the same.
- **Keep anchors.** Do not rename headings that carry `{#id}` or `<a id>` anchors, and do not change those ids. Other pages and the site link to them.
- **Retie-safe.** Do not hand-spell a content root in new prose where the page currently avoids it. Follow [retie-safe writing](../meta/grammar-docs.md#retie-safe-writing).
- **No new links into the recipe track or Claritish**, no links to `meta/` or proposals, and no preview links to pages later in the path ([teach now; don't preview later](../meta/grammar-docs.md#teach-now-dont-preview-later)).
- **Present the current language only** ([policy](../meta/grammar-docs.md#present-the-current-language-only)).
- Prefer the smallest edit that passes the tests in [doc-style.md](../meta/doc-style.md). Do not rewrite sections that already pass.

## Phase 1: mechanical sweep

One session across all 27 in-scope pages. These checks are grep-driven and need little judgment. Doing them first keeps the Phase 2 diffs focused on wording.

- [ ] **Batch 1.1: mechanical sweep, all in-scope pages**
  - **Em dashes in prose** → comma, colon, parentheses, or a separate sentence ([punctuation](../meta/doc-style.md#punctuation)). Leave quoted English example translations and checkpoint answers alone. In tables, replace a dash that joins two phrases, but keep a lone `—` used as an empty-cell placeholder.
  - **Agazan forms in italics** → backticks. English glosses stay in italics.
  - **Maintainer *we* or author *I*** in teaching prose → second person or impersonal. *We* inside an English translation of an Agazan example (inclusive *we*, and so on) is content, not voice. Leave it. Author *I* stays only in the signed essay parts of `why-agazan.md`.
  - **Throat-clearing** ("In this section we will…", "It is important to note…", "Note that…" used as filler) → delete or fold into the sentence.
  - **Bare linguistics jargon** from the [plain-language](../meta/doc-style.md#plain-language-no-assumed-linguistics) list (*assertoric*, *illocution*, *matrix*, *predicative*, *prosody*, *paradigm*, *adjunct*, *complement clause*, *right-bound*, *utterance*, *recoverable*): either give a plain gloss in the same sentence, or replace the term. If the right fix needs real rewriting, leave it for that page's Phase 2 batch and note it in the log.
  - **`*a*/*b*`** → `*a* / *b*`. In bold text, put forms in backticks only.

## Phase 2: judgment pass, one batch per session

These are the tests from [doc-style.md](../meta/doc-style.md), applied to every H2/H3 on each page:

- **New-job leads:** the first paragraph gives the English job, then the Agazan shape, then the consequence, with the cue last ([explain before you slogan](../meta/doc-style.md#explain-before-you-slogan)). Run the slogan test, the one-new-move test, and the cover-the-picture test ([unpack English pictures](../meta/doc-style.md#unpack-english-pictures)).
- **Finish-the-series sections** (Intermediate / Advanced) may stay a pointer sentence plus a table. Do not inflate them.
- **First-use glosses** for invented labels and [house shorthand](../meta/doc-style.md#house-shorthand) (*job*, *point*, *setting*, *body*, *linker*, *turn*, *role letter*, …), counted along the path order, not just within the page.
- **Shape:** one idea per H2/H3; short paragraphs plus a table rather than a wall of prose; bold used sparingly; no copula slogans; no filler.
- **Natural English:** fix awkward compression even where no rule names it ("use a longer sentence when the shorter version depends on awkward phrasing").

Batches are sized at about 10k words or less. Word counts are approximate.

- [ ] **Batch 2.1:** `why-agazan` (4.5k), `introduction` (1k), `phonology` (2k)
- [ ] **Batch 2.2:** `word-endings` (3k), `clause` (3.5k)
- [ ] **Batch 2.3:** `speech-moves` (2.5k), `dependents` (5.4k)
- [ ] **Batch 2.4:** `pronouns` (7.3k)
- [ ] **Batch 2.5:** `plurality` (2.9k), `predication` (3.8k)
- [ ] **Batch 2.6:** `joins` (8.5k)
- [ ] **Batch 2.7:** `questions` (5.2k)
- [ ] **Batch 2.8:** `hooks` (7.7k)
- [ ] **Batch 2.9:** `restrictors` (3.3k), `relations` (5.4k)
- [ ] **Batch 2.10:** `spans` (4.6k)
- [ ] **Batch 2.11:** `numbers` (10.9k)
- [ ] **Batch 2.12:** `comparatives` (5.5k), `causation` (2.9k)
- [ ] **Batch 2.13:** `sakes` (9.4k)
- [ ] **Batch 2.14:** `intention` (4.5k)
- [ ] **Batch 2.15:** `knowing` (10.6k)
- [ ] **Batch 2.16:** `roles` (6k), `x-compounds` (2.9k)
- [ ] **Batch 2.17:** `join-across-roles` (3.7k), `numbers-applied` (4.1k)
- [ ] **Batch 2.18:** `numeric-derivation` (3.7k)

## Phase 3: cross-page consistency

- [ ] **Batch 3.1: consistency check across all in-scope pages**
  - Each house-shorthand and invented label is glossed at its **first** use along the path, and later pages do not re-gloss it at length.
  - The same idea uses the same plain-English wording across pages (for example, how each page phrases "role letter" or "statement vs question vs command").
  - Re-run the Phase 1 greps to catch regressions.
  - Run `npm run build`.
  - Once [Questions for the editor](#questions-for-the-editor) is empty or every item has moved to `TODO.md`, delete this file ([proposals](../meta/proposals.md)).

## Batch log

<!-- One entry per batch: date, batch id, pages, main kinds of change, anything deferred. -->

## Questions for the editor

<!-- Suspected grammar problems found during the pass. Not fixed by the pass. One bullet each: page, section, issue. -->
