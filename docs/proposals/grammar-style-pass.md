# Proposal: grammar style pass

**Status:** IN PROGRESS
**Design authority:** [doc-style.md](../meta/doc-style.md) for wording and voice; [grammar-docs.md](../meta/grammar-docs.md) for teaching policy. This pass changes **wording only**. It adds, removes, or changes no forms, readings, rules, or examples.

## Goal

Bring every stage page under `docs/grammar/` into line with [doc-style.md](../meta/doc-style.md), and make the explanations read naturally. Work goes in batches, one batch per session, in the [cross-doc path](../meta/learning-levels.md#cross-doc-path) order. Each later page can then assume that earlier pages already gloss their terms on first use.

## Scope

**In scope (27 pages):** `why-agazan`, `introduction`, `phonology`, `word-endings`, `clause`, `speech-moves`, `dependents`, `pronouns`, `plurality`, `predication`, `joins`, `questions`, `hooks`, `restrictors`, `relations`, `spans`, `numbers`, `comparatives`, `causation`, `sakes`, `intention`, `knowing`, `roles`, `x-compounds`, `join-across-roles`, `numbers-applied`, `numeric-derivation`.

**Out of scope (do not edit):** `english.md` and every `say-*.md` (recipe track), everything under `claritish/`, `terminology.md`, `exceptions-cheatsheet.md`, `index.md`, `lexicon.md`, `inspect.md`.

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

- [x] **Batch 1.1: mechanical sweep, all in-scope pages**
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

- [x] **Batch 2.1:** `why-agazan` (4.5k), `introduction` (1k), `phonology` (2k)
- [x] **Batch 2.2:** `word-endings` (3k), `clause` (3.5k)
- [x] **Batch 2.3:** `speech-moves` (2.5k), `dependents` (5.4k)
- [x] **Batch 2.4:** `pronouns` (7.3k)
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

### 2026-10-05: Batch 1.1 (mechanical sweep)

**Pages touched:** `causation`, `comparatives`, `dependents`, `hooks`, `intention`, `join-across-roles`, `joins`, `knowing`, `numbers`, `numbers-applied`, `numeric-derivation`, `plurality`, `questions`, `relations`, `restrictors`, `sakes`, `spans`, `word-endings`. The rest had no hits.

- **Em dashes:** a dash before a note after a quoted translation (`> "…" — note`) became parentheses. A dash before a link pointer became a parenthetical link. Dashes in table cells and in cues became a colon, semicolon, or comma. Headings with an em dash now use a colon, and every explicit id is unchanged. Two construction-registry anchors in `src/parse/constructions.ts` pointed at the old auto slugs of `numbers.md` headings, so they now use the new slugs. Kept: dashes inside quoted English translations, checkpoint prompts and answers, italic English glosses that quote a translation (`*may — who knows*`), and lone `—` empty-cell placeholders.
- **Agazan in italics:** prose spelled-number words in `numbers.md` (the `g=+` fill table, the shorthand intro, the ending note, the end-relative lead, the writing-style table) are now in backticks. `relations.md`: the English gloss typo *yar* became *jar*.
- **Maintainer *we*:** `joins.md` intro ("We call that …") rewritten as impersonal. Every other *we* / *I* hit is an English gloss or translation, or sits in the signed parts of `why-agazan` / `introduction`.
- **Throat-clearing:** dropped "This page covers those forms together." (`join-across-roles`). No other hits.
- **Jargon:** *predicative* (`dependents`), *matrix* (`questions`, `relations`), *adjunct* (`numeric-derivation` tables, now *extra detail* as in `clause`), *utterance* (`numbers`), *recoverable* (`join-across-roles`), and the bare *prescription deontic* (`sakes`).
- **`*a*/*b*`:** no hits.

**Deferred / kept:**
- The `🔊 *…*` pronunciation lines and the spelled column of the big shorthand-to-spelled table in `numbers.md` keep italics, because the test suite reads the spelled pronunciation from that italic slot ("missing pronunciation row"). See the question below.
- `relations.md` (as-of): "write it only after an introduce of that overlay" is awkward. Left for batch 2.9.
- `sakes.md` still uses *deontic* in the intro, the prescription lead, and the summary table, each glossed in the same breath. Phase 2 (batch 2.13) can decide whether the term earns its place.
- `pronouns.md` uses *pitch reset* without *prosody*. No change.

### 2026-10-05: Batch 2.1 (`why-agazan`, `introduction`, `phonology`)

- **`why-agazan`:** smoothed the Claritish teaser sentence, the anger/anxiety line in the Compassion overview, and the label-scope list (now parallel: *about this stretch… about one relationship…*). In *What still counts*, the weather cue moved next to FORMER (the rule it pictures), "an event said without it is closed" became plain English, and the *had … would* line now says the as-of moment is a placeholder. Fixed the broken `*[As if* as theater]` link italics. Reworded the Sapir-Whorf sentence, which named the doubt rather than the claim as the hypothesis.
- **`introduction`:** "proper **-n**" → "the name ending **-n**"; the arrow chain of aims became a list; the role-letter paragraph now says what English makes you guess (position) and why reordering is safe; *stem* glossed as in `pronouns`; *closed endings*, *interlinear*, *clause glue*, and *checkpoint people* replaced with plain English. Grammar fixes in How to learn ("every pages'", the skip sentence) and in the acknowledgments (book title italics, *scientifically validated*, *their feedback*).
- **`phonology`:** glossed *content word* at first use; rewrote the vowel lead, the voiced/unvoiced paragraph (glossed in the same sentence, with English examples), the garbled audio-credit line, and the number-word cluster lead (split into job, shape, consequence). Missing blank line before `## Intermediate`. "Closed vowels" → "close vowels" to match the singability table.

**Deferred / kept:**
- `phonology` Intermediate: the hook-compound sentence (*fused extra-noun hook compound … cited **-l** / **-m***) uses terms from much later on the path. It is a finish-the-series inventory note, so it stays; Phase 3 can check whether it should move to `hooks`.
- `phonology` lead previews the Advanced number-word exception with a link. Kept, since it qualifies the page's one-line job.
- `why-agazan` Purpose/feature tour uses capitalized labels (RESIDUE, FORMER, PLAN, DECISION, WITNESSED, LIVE), each glossed in place. No change.

### 2026-10-05: Batch 2.2 (`word-endings`, `clause`)

- **`word-endings`:** the lead and citation sentence no longer use *job* for "role in a sentence". The **-m** lead says what the abstract sense is (an idea you cannot point at, listed in the lexicon) instead of "a job … riding on the concrete picture". Cut the Beginner sentence that previewed the Intermediate countries section. Rewrote the **-n** lead (dropped "First cases are people and places"), the name-helper line, and the greeting lead (job, shape, then "no first letter added"). Practice intros: *nativized spelling*, *the point is*, *optional memory helper* replaced. Intermediate: split the title paragraph; "**Another exception:**" (with no first exception) became a plain statement; *sentence-content category* / *lexicalized* → plain English; *resume target*, *slot-filler*, *four last letters*, *nativized loan* glossed or reworded; the continue overview lead now matches its table (it said only **-n**); the number-word lead no longer says "as reference".
- **`clause`:** glossed *clause* in the page lead. Split the hosted-`/b/` paragraph into the rule (plus cue) and the position-not-meaning consequence. "Keep that `/b/` word away from" → "does not come right after". Missing blank line before Beginner translation practice. Complex chaining lead: one move per sentence. "Two stock adverbs work on `/h/` directly on the verb" reworded. Advanced word-order lead split into two paragraphs; *talk* → *conversation*.

**Deferred / kept:**
- `clause` Stance: the pointer to [stance as-of] on `relations` previews a later page, but it resolves a trap (a past stance) the learner hits now. Kept.
- `clause` role-letter table cue for `/d/`, "done to (sound of *acted on*)", is unclear, but cue wording was left alone.
- Resolved after review: `zohuxaluden` is now glossed *Ohuxaluden*, the capitalized citation (the stale *Odunaxalanen* in `meta/glosses.md` was fixed too). The real non-name **-n** families (special, generic, and topic pronouns; stand-ins; join words under `/v/` `/x/` `/ɡ/` `/h/`) moved out of `word-endings` into the new `exceptions-cheatsheet.md` (sidebar: Cheat Sheets), so the Proper name section no longer covers them.

### 2026-10-05: Batch 2.3 (`speech-moves`, `dependents`)

- **`speech-moves`:** the page lead no longer uses *turn* before its gloss or the stale *conventional call*. The Turn section glosses *body* and drops its preview of act words and calls. The speech-act lead says what a speech act is, glosses *act word*, and no longer uses the unglossed *setting*. The vowel-series sentence no longer lists later families with unglossed names (*sake and scope words*, *presence on a name*). Intermediate firm/soft lead now names the English job (*please*, *perhaps*) and says what **-l** / **-m** mean in plain words. Cut the **-r** link to *polar stance* (`questions`, later on the path). Speech manner lead now starts from *frankly* / *to be clear*. "Readings by marker" reworded.
- **`dependents`:** relative-clause lead no longer uses the *hangs* picture. Dependent-clause lead rewritten as job (a sentence fills a role), shape (stand-in **`darl`**), consequence (no wrapping); "last in its slot" became "last in the main sentence"; dropped *types it*, the early **`dorl`** / **`barl`** mentions, and the dangling "Resume **-r** is [pronouns]". *Pole* is now glossed at first use (a relation word that hosts **`barl`**). Dropped the re-gloss of **Same root as** / **Cue** columns. Rewrote the *despite*, *so that*, *in order to*, and *if X, do Y* leads; replaced *polar ignorance* and *standing moods* / *former climate*. Continue lead now gives the English job first and glosses *linker* plainly. Intermediate: *vocative* in the period table → *a call*; linker lead is a finish-the-series pointer; the topic-plus-linker sentence, the *so … that* lead, the stand-in-vowel lead (split into two paragraphs; *type*, *locks*, *filler* replaced), "Quotes of wording stay spans" (now its own sentence after the example), "Do not put this family on `/x/`" (*stays* fence), and the garbled "The verb's role letter…" sentence in Advanced. Advanced: *lexicalized* / *stacked vowel* replaced. Removed stray blank lines.

**Deferred / kept:**
- `speech-moves` Call someone: the [role compound](roles.md#role-compounds) pointer previews a later page, but it explains where *Doctor!* titles come from. Kept for Phase 3 to judge.
- `speech-moves` Intermediate: the hook sentence (`al` / `am` among the opening `/y/` words) and the *sentence linkers* / *scope island* bullets point at later pages; Intermediate assumes every Beginner page, so they stay.
- `dependents` Dependent clauses is still one long H3 (stand-ins, poles, time poles, *by*, *as soon as*, *so that*). Splitting it would rename or move anchors, so it is left for the editor.
- `dependents` Compare with after *so that* is a long list that previews `sakes`, `relations`, and `hooks`. Wording kept.
- Resolved after review: *by* (deadline) was **`homal`** / **`gomal`**, an **-l** pole that broke the all-**-m** rule. It moved to the 🏁 *finish-line* row as **`heveham`** / **`geveham`** (overlay rows, `dependents`, `knowing`, `say-amounts`, `english`, and `meta/syntax-test-results.md`). The Beginner subject exception now says the instruction stand-in includes *not to …* (**`durl`**).

### 2026-10-05: Batch 2.4 (`pronouns`)

- **Beginner:** the page lead calls **-r** the fourth ending and adds "then **-r**" to the shape. *the talk* → *the conversation* where it meant the conversation so far. The *the dog that walked* Compare-with now says what to do (say it as its own sentence, then resume), and drops the *hang* picture. The lexicon-**-r** fallback no longer says "open the talk". Themself and The other one now lead with the English job. Whoever it was: split the long paragraph. The yes/no question line under A new one now says what it means. Share glosses *share* at first use, and the "no reading" sentence pairs each reason with its form. Special pronouns gloss *closed roots* and replace "Person roles default to **-n**". *content **-r*** → *whole-stem **-r***. Generic pronoun: rewrote the "pronoun-sized" sentence.
- **Intermediate:** the **-r** table lead is a finish-the-series pointer; *too* with the same subject now matches its example (*sees a dog too*). Addressing several people: lead rewritten (job first; *vocative cluster* and *held as addressee* in plain words; *stays* fences dropped), and the stale **`edone…x`** became **`ehodonx`** (the only Agazan change). Ordinal pronouns no longer preview *topic stretch* in the lead. *referent*, "asserts nothing", the *buried* picture in Topic words and dependents, and the semicolon chain in Quotes and asides reworded.

**Deferred / kept:**
- Role pointers (Beginner): "Only a [topic change](#topic-resets) stops it" links forward to Intermediate, and the **-x** sentence previews `plurality`. Both state a limit a learner can hit now, so they stay for Phase 3 to judge.
- A new one: "none after a special pronoun" names a later H3 on the same page, and "after a joined list" previews `joins`. Kept as inventory.
- Asking about the topic uses *which X* and *join blank* from `joins` / `questions`, which come later on the path. Kept; Phase 3 can check.
- Special pronouns: the *here* / *there* deixis pointer to `hooks` is kept as a Compare-with for English the learner reaches for now.

## Questions for the editor

<!-- Suspected grammar problems found during the pass. Not fixed by the pass. One bullet each: page, section, issue. -->

- `numbers.md`, pronunciation rows and the shorthand-to-spelled table: spelled number words are in italics (`🔊 *grarel*`), and the test suite requires that. This conflicts with doc-style's "Agazan forms in backticks, not italics", and retie-safe writing says retie never rewrites italics. Spelled numbers contain no content roots, so retie risk is low. Should the pronunciation convention (and its check) move to backticks?
