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
6. Records every suspected grammar problem (a rule that looks wrong, a missing form, a contradiction between pages) under [Questions for the editor](#questions-for-the-editor), each with a **recommendation**: the fix it would make and why, judged by the effect on learners. It does **not** apply the fix.
7. Stops. It does not start the next batch and does not commit unless asked. If asked to commit, the message ends with `[skip-cd]`.

### Ground rules for every batch

- **Wording only.** Do not change Agazan in code spans, example sentences, morph glosses, tables' Agazan columns, or translation checkpoint answers. Do not add or drop examples. Rewording an English translation line is fine only when the meaning stays exactly the same.
- **Obvious errors may be fixed.** When a mismatch is plainly a slip, with only one possible correct reading (a translation or checkpoint answer that names the wrong person, a typo in an English gloss, a morph line that disagrees with its example), fix it in place and note it in the batch log. Anything that needs a design judgment, such as which of two forms is right or whether a rule is wrong, still goes under [Questions for the editor](#questions-for-the-editor).
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
- [x] **Batch 2.5:** `plurality` (2.9k), `predication` (3.8k)
- [x] **Batch 2.6:** `joins` (8.5k)
- [x] **Batch 2.7:** `questions` (5.2k)
- [x] **Batch 2.8:** `hooks` (7.7k)
- [x] **Batch 2.9:** `restrictors` (3.3k), `relations` (5.4k)
- [x] **Batch 2.10:** `spans` (4.6k)
- [x] **Batch 2.11:** `numbers` (10.9k)
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

### 2026-10-05: Batch 2.5 (`plurality`, `predication`)

- **`plurality`:** the **-lx** / **-mx** lead now gives the English job (*some cats*) first. *referent* in the summary table → *someone already mentioned*. Person-role **-x** lead split: *clusivity* glossed in plain words, speaker **-x** and listener **-x** each get their own sentence, and the inclusive **`aha`** note became its own paragraph. "Not the same job as" (a second compare block) became a plain sentence. Intermediate: *the talk* → *the conversation*; *this turn's vocatives* → *called by name at the start of this turn*. Verb and adjective collective leads replace *singular verb*, *set host*, and "how the doing is structured" with plain English, and gloss *collective*. The joins sentence that used unglossed *SHARED* / *scale* (joins comes next on the path) now says what a plain vs **-x** adjective after a joined list means. The *red books* line now says why the color stays plain. *vocative* glossed as the call word.
- **`predication`:** *second predicate* (arrived tired), *proper **-n***, *published abstract*, *time of the clause*, *a resume on **-r***, *packages*, *characterizing*, *seam*, *predicates of*, *the office*, and *frozen units* replaced with plain English. Cut the redundant nationality restatement ("Nationality stays on **-m**…"). Kind / role lead merged into one job-shape paragraph plus a sentence naming *classification* (the old second paragraph was a fragment). Existence lead now starts from *there is*. Label scope lead: the vowel list reads naturally; the scope-vs-restrictor copula slogan is spelled out. **`tho`** H4 gets a one-line lead. Stacked scope lead says what a **`u`**-initial pair does. Added the missing blank line after the Commands to be ADJ heading. The In-progress Compare-with no longer opens with "Later,".

**Deferred / kept:**
- `predication` Existence: the *someone's* (`hooks`), *every K* / *kind itself* (`joins`), and extra-noun hook pointers preview later pages. Each answers an English sentence the learner will try now (*my dog is big*, *there is a dog in the yard*), so they stay for Phase 3.
- `predication` In progress: the [role word] Compare-with points at `roles` (late on the path). Kept as the form for *a walker*.
- `predication` Label scope: the sake-roots sentence and the [FORMER] / [mention] pointers preview later pages; kept as inventory.
- `plurality` Associate-set resolution uses the *except* hook **`ul`** from `hooks`; kept, since the example needs it.
- Resolved after review: `predication` Intermediate Agazan → English #2 answered *Alahen* for `zazawan`; now *Azawan is always a craftsperson.*

### 2026-10-05: Batch 2.6 (`joins`)

- **Beginner:** the intro no longer says the vowel series was "just mapped"; it now says the join vowel uses the same cues as the speech-act words. And-lists glosses closed **-l** / open **-m** (the page used *closed* / *open* later without a gloss) and drops "**-l** is ordinary English". "A joined slot is one filler" now says the list fills one role. Right-close fence: "One join finishes the row" became plain English, and a stray blank line went. The Everything (`ua`) and Unspecified member (`-r`) leads were rewritten (job first; *single-vowel* → *one vowel*, with **ua** as the counterexample). Recap table: *inventory join* → *add the items*. Beginner forms lead reworded. The Clause joins grouping paragraph was split into three (flat vs grouped, putting a group last, after a stand-in). The clause-standalone `xal` / `xar` forms are no longer called *stand-ins*, which `dependents` uses for `darl` / `barl`.
- **Intermediate:** the Rank joins lead is now one paragraph naming the tie **ae**. Invert: *invert map* replaced, and *SHARED* is glossed at its first use on the path (the old line was telegraphic: "Optional is only **`…om`**"). Respectively: the *row* picture is gone. Rank standalone: "Neither says why" and "a shrug" spelled out. Distribution lead now says how to write the denial. *the talk* → *the conversation*. The **`SAME`** sentence was reworded. *Not the same job as* became a plain sentence (as in `plurality`). People in general lead: "sit between …" and "pronoun-sized" replaced. SHARED after the join now names SHARED, and *every member together* became *each member* (*together* is the collective **-x** reading). "Further matching-role heads", "stays an extra noun", and "one join after every member" (fence nesting) reworded.
- **Advanced:** the Scope islands lead now gives the job and names the island. *bound only join and `/h/` scope*, *titles the package*, *Join vowels stack at most two letters*, *Floating `/h/`*, *Verb-chain `/h/` scope:*, and *clause body* replaced. Removed two doubled blank lines.
- **Obvious slip fixed:** Intermediate Agazan → English #7 (`… zel`, a rank join) answered *wine first, then the flower, then the ring*, which is the sequence (**oe**) reading. It now reads *wine matters more than the flower, and the flower more than the ring*.
- **Resolved after review:** single-item `zel` no longer has *X first* as a second answer in Beginner English → Agazan #7 and Agazan → English #6. *X first* belongs to `…em` (and stock `…en`), as the Intermediate table says.
- **Resolved after review:** a **u** join after a closed list now denies the list as a whole (single-item *not X* with the list as X). `val vul` is *not both* and `vol vul` is *not exactly one*. Before, it denied each item and kept the list's vowel, which duplicated plain *neither* and made `vol vul` say the same as `vol`. The section is retitled *Exclusivity and denying a whole list* (no links pointed at the old slug) and gains a three-row contrast table. Intermediate Agazan → English #5 now answers *not both kiss and punch*. The parser already nested the joins and glosses each one as *not*, so no code changed. `AGENTS.md` (the `joins.md` row) and `meta/design-decisions.md` (Denying a list) are updated.

**Deferred / kept:**
- Clause joins: the except-hook pointer (`hooks`) previews a later page; kept, since it answers *everything except that …*.
- Universals: the [role compound] pointer for *whoever* (`roles`), the [channel] pointer (`knowing`), and the [cause] note on `zuan` (`causation`) preview later pages. Kept as inventory for Phase 3.
- SHARED after the join: the [sakes] Compare-with previews `sakes`. Kept.
- Invert and Respectively use SHARED before its own H3 later on the page. It is now glossed at first use; moving the H3 earlier would be a structural change, left for Phase 3.
- Reference tables lead "Most other phrase joins need two or more items" is unclear next to the single-item and standalone tables. Left alone, because rewording it would mean guessing which joins it means.

### 2026-10-05: Batch 2.7 (`questions`)

- **Beginner:** the page lead is no longer "This page is how you ask". The Ask lead now gives the English job (word order moves in English), the Agazan shape (**`yol`** + an unchanged body), and the consequence (nothing moves); the unglossed *setting* is gone. *job letter* → *role letter* in the fill answer. Fill-ask table Use column: *fill the add-inventory* / *fill what remains* → *ask for who or what (else)*. The resume Compare-with says *whole-stem* (as in `pronouns`) and splits the length test into two sentences. Fill-all lead starts from *who sees what?*. The `?` bullet no longer says the mark *colors* the sentence. Polar stance: *receipt* → *got it*; the one-polar-word rule reworded. The confirm paragraphs now say plainly that bare **`yael.`** backs up your own claim and **`yol yael.`** asks the listener, and the word *tag* is glossed there (Intermediate's Tags section relies on it). *Not the same job as* became a plain sentence. Embedded *whether* and its Compare-with were rewritten job-first (*whole stretch*, *outer turn*, *inner `yol`* removed).
- **Intermediate:** the polar inventory lead is now two sentences for the two vowels, the map items are italics instead of bold, and the first-vowel cue says *add* (to match the table). *option uptake* / *receipt* in the table reworded. *the but… of a premise* (`yuar`), *read as compliance*, *stance-plus-body beat*, *solo run of thought*, *a point you lock*, *polarity said twice*, *unbound*, *queried slot*, *occasion word under `/h/`*, *live with*, and *genitive* were replaced with plain English. Tags lead split into two paragraphs. Fill-ask arity lead and the *Length* column header (now *Items listed*) say what the length counts. Where / Whose / How / Why leads now start with "To ask *X?*" and gloss *extra-noun hook* in passing. A blank inside a dependent now leads with the English pair (*Do you know who walks?* / *Who do you think walks?*). The yes/no single-item lead says what *confirm that singleton* means.
- **Obvious slip fixed:** the Rhetorical question Compare-with said a bare `…. yael.` tag asks the listener to confirm. Beginner says bare **`yael.`** confirms your own claim and **`yol yael.`** asks the listener, so it now shows `…. yol yael.` and links to the Tags section.
- Missing blank lines between morph and English in Beginner Agazan → English #6 and Intermediate Agazan → English #6.

**Deferred / kept:**
- *How many?* (`numbers`), the Three endings pointer to *time horizon* (`sakes`), the extra-noun / genitive / stacked-vowel hook links (`hooks`), `humum` (`relations`), the condition-word links (`causation`), `thar` (`join-across-roles`), and *anytime?* (`restrictors`) all point at later pages. Each answers a question form the learner reaches for on this page, so they stay for Phase 3 to judge.
- Resolved after review: the fill-ask blank now glosses as role-neutral *wh* (`z-wh`, `b-wh`, `g-wh`) and *wh-else*, not *who* / *who-else*, so the morph line no longer contradicts *what* / *where* translations. Changed in `src/parse/morph-gloss.ts` and its test, `meta/glosses.md`, and the morph lines in `questions`, `hooks`, `pronouns`, `say-questions`, and `meta/syntax-test-corpus.md`. The Beginner Fill-ask section now says what *wh* means in the word-by-word line.
- Intermediate English → Agazan #1 puts the answer `yael.` on the line after the morph line with no blank line. It renders inside the same paragraph; left as is.

### 2026-10-05: Batch 2.8 (`hooks`)

- **Beginner:** the page lead now starts from the English job (*including*, *instead*, *in*, *for*), says what a hook is (no role letter, a vowel or two plus an ending), and names the three places it can sit; "the grammar still finds the edge" is plain English. Including / Rather / Instead / Except leads are job-first; *hooks B onto A* (circular) is gone, *Rather* now says how it differs from *including* and *instead*, and *Instead* says the order is the reverse of English *B instead of A*. *Except* no longer calls `xual` a *stand-in clause* (it is the clause standalone, as in `joins`). The `am` example that sat under the *including* Compare-with, before **-m** was taught, moved down into Closed and open endings. That lead drops *unmarked*. The discourse-hook lead starts from *Additionally* / *In other words* and glosses *glue*; its table rows (*further committed point*, *rephrase prior*, *exception to the prior frame*) are plain English. Extra-noun lead: job first, *landmark* glossed at first use, the trigger (`/b/` after, no recipient before) is its own sentence rather than a pseudo-cue, *simplex* and *intended get* replaced, and the "Frame **-m** waits for Intermediate" teaser is cut.
- **Intermediate:** hook **-n** is now a plain how-to sentence; removed a doubled blank line. Extra noun: *simplex* / *stacked* → one-vowel / two-vowel; *frame extra* is glossed in the same sentence. The *several extras* and extra-noun **-n** sentences and the *with* / *without* / *like* / *between* / *so that* Compare-with sat under Somewhere, nowhere, everywhere; they moved to the extra-noun section they describe, and the *stays* / *still* fences went. Whose: the long "em never takes…" paragraph is split in two. Stacked discourse lead is job-first (cue moved last). Place indefinites lead names *somewhere* / *nowhere* / *everywhere*. Deixis: *viewpoint laterals* no longer stands as an unglossed label; "when the conversation role is the point" reworded. Point back lead is job-first and drops its preview of the span-hook **-r** (Spans says it later). Parallel chains, Discourse placements, Detail on the hook, and Spans: *binds last*, *in-clause chains stay inside the body*, *scopes the linker+body stretch*, *grades*, *host*, *window*, *glue*, *Scope stays flat*, and *a path in spoken order* replaced with plain English. *(vocative, then discourse hook)* → *(a call, then a discourse hook)*.
- **Advanced:** hook-compound lead is job-first (*enter*, *leave*, *oppose*); *lemma* → *dictionary form*; *the same hook job* reworded.

**Deferred / kept:**
- Compare-with pointers to later pages are kept, since each answers an English form the learner reaches for here: proxy (`relations`), role compounds (`roles`), emotion compose and sakes (`sakes`), viewpoint laterals (`roles`), cite spans (`spans`), join-relations (`join-across-roles`), ranges (`numbers-applied`), and the `/w/` restrictor link (`restrictors`).
- Resolved after review: the Discourse **-m** grid said only *… and maybe more*. It now has a one-line lead (**-m** marks this sentence as one of several you could say there) and a concrete English reading per row: `am …` *Among other things*, `em …` *To put it one way*, `om …` *Instead, for instance*, `um …` *Except, among other exceptions*. No other page used these forms, and the morph glosses (`additionally.open`, …) are unchanged.
- Parallel chains also carries the verb-pair example (*walk instead of run*), which is about same-role hooks generally, not chains. Moving it would split the section's examples; left for Phase 3.

### 2026-10-05: Batch 2.9 (`restrictors`, `relations`)

- **`restrictors`:** the *only when* lead is job-first (*only when raining*, then occasions + **`hal`**), and *the row from the right* became "the way a join word ends a list". Bare **`hal`** no longer leans on an undefined *inventory*; its cue says what it pictures. The first Compare-with now ends on *quickly and quietly*, right before that example, and drops "still both apply". *Always* now gives bare **`hual`**, then exceptions, then open **`huam`** (it opened with the open form). *Sometimes* lead: *member of the time inventory* and *not a separate "many times" count* became plain English. **`hur`** paragraph split into the with-occasions and no-occasions readings. `/w/` lead is job-first (*never sleepy*); *host* and the "`/h/` still" fence are gone. The `/w/` Compare-with spells out the scope-vs-restrictor slogan. Open **`ham`** lead is job-first. Intermediate: *Occasions vs a dependent when* no longer contrasts *phrase* times; the complex-unit sentence, the "one restrictor chain" sentence, and the ranked **`hel`** lead are plain English.
- **`relations`:** the page lead says what a relation word is (a preposition with its own root, on `/h/` / `/ɡ/`, completed by `/b/`). The Beginner *like* material had no H3 under the H2; it now sits under **Like (*resembles*)** `{#like-resembles}` (the `similative` and `like` ids are unchanged). Every "Ordinary `zX` is still …" became "As a plain noun …", and every "unhosted `/b/` is still the recipient" became "a `/b/` word with no relation word before it is the recipient". Replaced *theme*, *consideration*, *whose agency*, *finished pair*, *figure*, *layer*, *host*, *of-complement*, *off the real tally*, *shared height*, *meronymy*, and *token from*. The *of relations* Compare-with (one long paragraph) is now a bullet list. *crafts of wood* → *crafts out of wood*. Advanced *as-of*: the lead now names the two times and glosses *whose-now* and *speech-now* at first use; the `/b/` options and the "once whose-now is set" effects are lists; *a new host*, *the same overlay*, *with no warrant*, *spare `h_#22,7`*, *stays event-when*, *scores against*, and the *books* / *climate* / *bookmark* pictures in running prose are replaced (the 📒 / 🔖 cues stay). The deferred "write it only after an introduce of that overlay" (batch 1.1) now says to write `huhur` only after a clause that set whose-now with `huhum` and a `/b/`. Removed stray blank lines.

**Deferred / kept:**
- `relations` *like*: the [kin](numbers-applied.md#kin-generations) pointer, the *exclusively for* [join-relation](join-across-roles.md#join-relations) Compare-with, the [role compound](roles.md#role-compounds) for *the other party* in Social relations, and the many `knowing` / `intention` / `causation` links in *as-of* all point later on the path. The first three answer an English form the learner reaches for here; *as-of* is Advanced and is built from those moods. Kept for Phase 3.
- `relations` As-of translations keep *had still left* and *— same books* (quoted English translations).
- `restrictors` tables keep *time inventory* in the Use column (telegraphic tables are allowed).
- Resolved after review: the *as-of* `/b/` list now says what extra-noun **-r** looks like on a date (`=`, so `b=_#22,7` is *that 22 July again*) and points at the example that uses it. No form changed.
- Resolved after review: `restrictors` Intermediate Agazan → English #9 (`hazahol huem`) answered *would rather not climb when there is ice*. It now reads *Alahen climbs as a last resort when there is ice, among other occasions*, matching the table.
- `say-amounts.md` (out of scope) links `restrictors.md#sometimes--anytime--some-other-time` with a double dash; the build accepts it, so no change.

### 2026-10-05: Batch 2.10 (`spans`)

- **Beginner:** the page lead now names the three kinds of chunk first (a quote, a foreign word, a comment in parentheses), then the shape, then what the role letter does; *packages* and *loan surface* are gone. Cite lead is job-first and says the quote fills one role; *quoted token* and "the greeting is the named citation" became "a greeting is just your own name". The exact / paraphrase / proper paragraph is split in two, glosses each mark in plain words, and drops *fence*, *name-string*, and *packaging*. Opaque lead is job-first; *surface*, *blob*, *casing*, and *fence* replaced, and the checkpoint / example notes *(opaque surface)* / *(foreign surface)* now read *(a foreign word)*. The prefix-less citation sentence says "no role letter" instead of *prefix-less fence*. Calls and reactions split into job + shape and an **`@`** / no-**`@`** paragraph; its closing sentence previewed *mention* (Intermediate), so the aside half moved into Asides and the mention half was already in Mention. Asides lead is job-first, cue last. Outer slot lead says a span can fill any role; loan-word lead is job-first. The duplicated "inner words still start with their role letters" line under Outer slot now separates the span's letter from the inner letters.
- **Intermediate:** Written only no longer says *the parser reads the inside*, and drops its preview of the mention marker (the next H3). Mention lead is job-first; *Agazan interior*, *title-string*, and the long **`/w/`** sentence reworded. *anchors role pointers*, *adds no anchors*, and the owner fence "this page deliberately defines none" replaced. *the talk* → *the conversation*. Topics in a quote: *someone else's talk*, *from scratch*, *untouched* reworded, and the `/x/` topic-span sentence is its own paragraph. Scope islands lead now glosses *binder* in the lead (it was used undefined in the bullets and table). The **Speech** line is full sentences; the unglossed *phrase bow* is gone.
- **Advanced:** Editorial close lead says what a plain closing bracket does before the two marks, and gives the English job (*said “bug…”*).

**Deferred / kept:**
- Beginner forward links kept as inventory: [left-bound adjective] (`clause`, earlier), the [role pointer] / [another one] sentence in Opaque (it repeats the Intermediate *A span is an ordinary noun* H3; Phase 3 can decide whether Beginner needs it), and the scope-islands links to `joins` and `hooks`.
- Scope islands example translation *Azawan and (just Alahen) saw ….* keeps its trailing ellipsis (quoted translation).
- Resolved after review: the Topics in a quote example `x@[onodan alahen] zozan vezehel.` (topic as subject) was translated *it is sung*. It is now `x@[onodan alahen] dozan vezehel.` (morph `d-TOPIC`), so the topic is what gets sung. The parser tests that use the old string only check parsing, so they are unchanged.

### 2026-10-05: Batch 2.11 (`numbers`)

- **Beginner:** Counts no longer says a number word is "built like any other word". The `r` sentence and the **-x** vs **`gral`** sentence in More than one are plain English.
- **Intermediate:** Word shape glosses *free number* and *PoS* at first use. "**No groups** is digitless of that marker, or digitless **-r** resume" said a digitless **-r** is a resume, which the endings section denies; it now says a word with no groups is [digitless]. *full CV form* / *spelled CV* → *fully spelled*. Parts of speech and the number-as-role sections drop *referential prefixes*, *identity*, and *inherits the marker's identity* for plain statements of what the marker decides on each role letter. The Marker vowel lead said Beginner used **`+`** / **`#`**; Beginner used **`ra`** / **`re`**, so it now names those and says the table gives the shorthand symbol. "One word, one identity" and "**`=`** stands alone" (twice) are spelled out. *second-slot mark after PoS*, *Match the marker to the resumed identity*, *member of an inventory*, *Under question*, *job letter*, *referents*, and *place the identity symbol* reworded. The *Other prefixes use the same empty payload* line (How big) now says what it means: other role letters take the same blank, and **`har`** is a restrictor, not that blank. Exponents gloss *exponent*; Bare OoM lead is job-first (*hundreds*, *thousands*) and glosses *OoM*. Number as discourse lead is job-first (number the points of a list), and the separate *Independence framing* slogan paragraph is folded into it. The *Write free numbers … consistently* and *Not the same job as: derived `NUM`* lines are one plain paragraph. Removed stray blank lines.
- **Advanced:** the Digitless exponents, Zero × exponent, and Hyperbole leads are job-first (*infinitely many*, *absolutely nothing*, *a gazillion*), with the *Related form* pointer moved after the Zero × exponent lead. *No-mantissa digitless-exp under …*, *inherit freely*, *Same under other referential PoS*, *Mantissa = …*, *cohort*, *decade*, and *Named `e0` asserts OoM 0* replaced. The *just short* Compare-with lists the role-letter forms first and the unrelated *as if* second.
- **Obvious slips fixed:** the Digitless Compare-with illustrated digitless **`ra`** with `zagadulx grarel` (a count); it now uses `zagadulx gral`, as in Beginner. The Advanced practice intro said "forms with a digit use shorthand (`grawobal`)", but every answer is spelled (one digit or none); it now says so.
- **Editor question applied (pronunciation in backticks):** every `🔊` row and **Spoken** table cell on `numbers`, `numbers-applied`, and `say-amounts` now puts the spoken form in backticks, so the build parses and lexicon-checks it. `src/lint/number-speech-docs.ts` reads the backtick slot (tests updated). `src/lint/morph-gloss-docs.ts` no longer pairs a spoken → written prompt (``**1.** 🔊 `…` ``) with the answer's morph line; the answer in the details is the example (new test).

**Deferred / kept:**
- Marker vowel, Number endings, and Digitless tables show shorthand (`g+3`, `g=+`) before the Writing (preferred shorthand) H3 explains it. The Marker vowel lead now says the symbols are shorthand and links ahead; moving the shorthand H3 earlier is structural, left for Phase 3.
- Advanced tables keep their dense labels (*telos landmark*, *ultimate-descendant pole*, *totalized null quantity*, *hostless total null as act*, *kind morph*): telegraphic tables are allowed.
- Forward links kept as inventory: [forecasts] and [dated channel] (`knowing`), [superlative] and [factor] (`comparatives`), [measure phrases] / [percent] / [time] / [generation] (`numbers-applied`), [numeric derivation].

## Questions for the editor

<!-- Suspected grammar problems found during the pass. Not fixed by the pass. One bullet each: page, section, issue, then **Recommendation:** the suggested fix and why. -->
