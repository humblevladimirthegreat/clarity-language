# English terms — standardization plan

Editor plan to lock learner-facing English names in `docs/grammar/`. **Not** learner text. Grammar pages must **not** link here.

Companion to the keep-list: [english-terms.md](english-terms.md). That page is the standardized metalanguage. This file is the **pick** pass (historical after Phase 7).

**Do not implement until a phase is started on purpose.** One phase per change-set. No `replace_all` on homonyms (`bare`, `focus`, `overlay`, `span`, `topic`, `host`, `notional`, `force`).

## Why not one pass

A single sweep would mix three different operations (alias merge, homonym split, leftover drop) across ~20 grammar files. The high-collision strings cannot be globally replaced: **bare**, **focus**, **overlay**, **span**, **topic**, **force**, and **empty** each name more than one job. Drill *prompts* (English to translate) stay untouched; drill *instructions* and headings do not. Do not keep superseded Agalan spellings or “used to be called…” in learner prose ([present the current language only](grammar-docs.md#present-the-current-language-only)). Old HTML fragments were dropped in Phase 7.

Parser / TypeScript identifiers are out of this plan (`src/retie` `bare` is unrelated). Morphology does not change. SMALLCAPS tags, join-vowel English names (additive / cochoice / …), and span TYPE / EDGE letter names stay.

## Locked names

Decided in the collate follow-up. Later phases do not reopen these without an explicit edit to this table.

### Speech act (was *clause force*)

| Job | Name |
|-----|------|
| Utterance setting: statement / question / command / prohibition | **speech act** |
| Written `/j/` word (`jal` / `jol` / `jel` / `jul` and soft **-m**) | **act word** |
| Soft vs firm | stays on the ending (*firm question* `jol`, *soft question* `jom`) |

`/x/` already says *same speech act* — keep that. Do **not** use *mood*, *mode*, or *stance* for this job.

**Replace in this family:** *clause force*, *question force*, *interrogative force*, *force word*, *same-force*, *opener force*, *statement/ask force* (when it means this setting).

**Do not replace:** *prescription force* (values **`xo`**), *forced-choice*, polar *stance*.

### Join arity

| Count | Current | Locked |
|-------|---------|--------|
| 2+ | list | **list** (keep) |
| 1 | focus | **single-item** |
| 0 | bare | **standalone** |

Prose: *a single-item `zel`*, *a standalone `zal`*. Table headers may stay **list / single-item / standalone**.

**Do not use *empty* for arity 0.** *Empty* stays for span EDGE **u** (`d[]`, `…axul`) and for **empty-allowed** (`…om` *or none*). Standalone `zual` still means *everything* — the join has no items in front; the set is not empty.

**Do not replace** other *bare* or *focus* jobs in this phase (see [Remaining *bare*](#remaining-bare) and [Remaining *focus*](#remaining-focus)).

### Split (same English, different jobs)

| String | Keep for | Other job becomes |
|--------|----------|-------------------|
| **span** | Typed cite / aside / mention / opaque fences | Numeric from–to → **range**. Clock/date from–to → **clock/date range**. |
| **focus** | Retired as arity 1 (now **single-item**) | Word order → **prominence**. Values table column **Focus** → **contact**. Number *agenda focus* may stay informal. |
| **overlay** | Sense-form PoS reading (`hogegal` HIGH vs `zogegal` *wave*) | Number `/v/` `/h/` `/j/` `/x/` → **number as verb / adverb / interjection / discourse**. Metaphorical **-m** stays **metaphorical**. |
| **topic** | Bare need (values; no `x`) | `ahaza` → **as-for**. |
| **notional** | Mood **NOTIONAL** (`ahade`) | Free-number `-e-` → **imaginary**. Derivation `ROOTx-e-` → **quasi**. |
| **host** | Ability / values / numeric-derivation base of `x` | Measure → **unit**. Classification “host noun” → the classified noun / subject. |
| **resume** | Content / span / number **-r** pointing back | Join / restrictor **-r** stays **unspecified member**. Drop *anaphor* as the default learner word. |
| **-n** | Content **named** | Phrase join → **named list**. Clause join `xan` → **sequence** (not *soft -n*). Number **-n** → **conventional**. |
| **universal / every** | Join *every K* / **generic** | Mood → **universality** only. |
| **scale** | Comparative **SHARED scale** | Number → **order of magnitude** / **OoM band**. *Ambient scale* → **ambient magnitude**. |
| **mood** | Closed psychological `/h/` (COMMENT, CAUSE, PLAN, …) | Ordinary manner `/h/` → **adverb**. |
| **open** | List / restrictor / speech-act **-m** | Span opening word → **span open**. |
| **circumstance** | Drop as a term | Restrictor vs **clock/date** vs named `/h/` **-n** (*named standard*). |

Content / span / number ending tables stay **three tables**. Unify only **-r** → **resume**:

- content: **literal / metaphorical / named / resume**
- spans: **exact / paraphrase / proper / resume**
- numbers: **exact / about / conventional / resume**

### Combine (one job, one name)

| Keep | Drop as glossary keys |
|------|------------------------|
| **extra noun** (`/b/`) | *argument noun* |
| **role compound** | *participant compound* |
| **fill-ask** / **fill-all** | *content question*, *gap*, *multi-gap* |
| **yes/no** (question type) + **polar stance** (`jael` / …) | *polar question*, *yes/no polarity*, *reaction word* |
| **turn** (`/j/`) / **continue** (`/x/`) | *jump*, *extend*, *utterance framing*, *discourse marker* as the `/x/` name |
| **sentence linker** | keep as the *therefore / however* subclass of continue |
| **vocative** | *call* as a glossary key |
| **scope island** (`^ … ^`) | *adjunct-scope island*, *join scope island* |
| **associative** (`-sh`) | *associative group*, *associate set* (prose: *anchor and associates*) |
| **collective** | *collective doing*, *collective ascription* (distinguish `/v/` vs `/ɡ/` in the sentence) |
| **restrictor** + **occasion** | *when-frame*, *applicability*, *circumstance restriction* |
| **reviser** (in-clause vs discourse by placement) | *discourse glue*; **`REV`** as a learner word (editor tables may keep `REV`) |
| **ending**; **reference suffix** only for the content-word table | *word ending* |
| **classification** vs **identity** | *zero-copula*, *property pattern*, *kind ascription* |
| **ordinary compound** / **lexical compound** | *compound joiner*, *x-less kind*, *lexical kind* |
| **numeric derivation** | *number compound*, *numeric morph* |
| **named handle** | *handle coinage* as a term |
| **dependent clause** + **`adoro`** | *doorway* (keep as a one-shot mnemonic), *subordination*, *next-clause pronoun* |
| **clause pole** | keep on causation only (NP vs sentence) |
| **COMMENT** | *mindfulness noting*, *thought balloon*, *commentary* as glossary keys |
| **contact channel** | *savoring* as a term |
| **universality** (mood) vs **generic** / *every K* | *warrant*, *exceptionlessness* as extra names |
| **SHARED** + filler (*scale* / *continuum*) | *shared modifier* |
| **join** + **conjunct** | *coordination* as the learner word (filename may stay), *join word* except vs join-act |
| **role letter** | *first letter*, *PoS prefix* (Beginner heading may still say *parts of speech*) |
| **special pronoun** | *speech-role*, *discourse role (person)* |
| **vowel series** | *job map* |
| **numbered alternatives** | *ideation* |
| **digitless** | *zero-digit-group*, *unspecified magnitude* as extra names |
| **loan** vs **opaque span** | *compact foreign content word* |
| **sufficient / necessary / unique path** | *mechanism* as a fourth umbrella; *open inclusive* |
| **measure phrase** + **unit** | *stock measure host*, *unit morph*, *measure host* |
| **short resume** / **full-root resume** | *letter pronoun* / *full-root pronoun* |

Keep as terms (no better everyday name): **antecedent**, **arity**, **empty-allowed**, **clusivity**, **address set**, **complex adjective / adverb**, **left-bound adjective**, **hold**, **map resolution**, **factivity**, **epistemic *because***.

Intentional reuse (do **not** “fix”): **-l / -m** *closed / open* (and *firm / soft* on speech act), **stance** on values vs ability (always say *value stance* / *ability stance*), **changeability** on `xu` / DECISION / *can’t*, **vowel series**.

### Drop as metalanguage (one-shot pedagogy only)

*Doorway*, *jump*, *thought balloon*, *savoring* — fine once as a mnemonic, not as a cross-doc key. *How you know* stays purpose language on `why-agelan.md`; the grammar term is **evidentiality**. *Gloss overlay* is site tooling, not a construction. *Referential / semantic / syntactic* stay on `introduction.md` only.

### Remaining *bare*

After the arity rename, *bare* still correctly means “no extra piece” in:

- value **topic** (no `x`) — Phase 6 prefers **topic** in that section
- compass with no viewpoint
- **bare turn** / bare utterance (no body)
- **bare OoM**
- bare host / bare `hal` / bare calls

Do not globally delete *bare*.

### Remaining *focus*

After the arity rename, remaining *focus* is word-order **prominence**, the values **contact** column, and informal number *agenda focus*. Do not globally delete *focus* until those are renamed (Phase 6).

## Scope

| In | Out |
|----|-----|
| `docs/grammar/` learner prose, headings, tables, See also | Translation-practice *items* (object English) |
| `AGENTS.md` construction blurbs that use the old names | `docs/proposals/` and `rejected/` |
| [drill-generation.md](drill-generation.md) metalanguage | `docs/grammar/public/tts/` |
| [grammar-docs.md](grammar-docs.md) examples that cite old labels | Parser / code identifiers |
| [english-terms.md](english-terms.md) (keep-list after Phase 7) | House-cast names (do not turn dummy people into **`ugobo`** / **`edone`**) |

**Anchors:** add the new id (current English name) beside the old fragment through Phases 1–6 (`clause-force`, `focus-phrase`, `bare-phrase`, `unary-phrase`, `nullary-phrase`, `interrogative-force`, `zero-copula`, `participant-compounds`, `content-questions`, `yes-no-focus-bare`, `focus-bare-inventory`, `adverb-topic-and-free-order-ties`, `yes-no-polarity`, …). Visible link text uses the new names. **Phase 7** rewrites in-repo links to the new ids and deletes the silent aliases. Do not write “used to be called…” in learner prose ([grammar-docs.md](grammar-docs.md#present-the-current-language-only)).

**After each phase:** `npm run lint:md`. Do **not** run `retie-docs` (this is English metalanguage, not Agalan tokens).

---

## Phase 1 — Speech act

**Files:** `core.md`, `questions.md`, `vowel-series.md`, `spans.md`, `reference-suffix.md`, `numbers.md` (utterance-marker pointer), `revisers.md`, `causation.md`, `pronouns.md`, `coordination.md` (same-force / inherit opener), `AGENTS.md` (utterance framing blurb), `grammar-docs.md` (example that cites `clause force`), `drill-generation.md` (clause-force twins).

**Do:** *clause force* → **speech act**; *force word* → **act word**; *question force* / *interrogative force* → *question* / *under question*; *same-force* → *same speech act*. Beginner heading **Speech act**. New id `speech-act` beside `clause-force`.

**Don’t:** prescription force; *forced-choice*; polar stance; `/j/` mnemonic *jump* (that drop is Phase 4).

**Done when:** no learner-visible *clause force* / *question force* / *force word* for this job; `#clause-force` still resolves (drop in Phase 7).

## Phase 2 — Join arity (*single-item* / *standalone*)

Highest collision. Contextual edits only.

**Files:** `coordination.md` (home), `questions.md`, `comparatives.md`, `causation.md` (inclusive single-item `…aom`), `join-extras.md` (standalone `/b/` join), `numbers-applied.md` (threshold as single-item rank), `predication.md` if it says *focus packaging*, `AGENTS.md` (arity **bare** / **focus** / **list**; focus/bare under question), `drill-generation.md`.

**Do:** arity-1 *focus* → **single-item**; arity-0 *bare* → **standalone**. Headings: *Starter forms (single-item and standalone)*; *Yes/no with single-item / standalone*. New ids `single-item-phrase`, `standalone-phrase` beside the old ones.

**Don’t:** *bare need*, *bare turn*, *bare OoM*, *bare host*, *bare `hal`*, *empty-allowed*, span *empty*, word-order *focus*, values **Focus** column, *focused agenda*.

**Done when:** coordination arity table is list / single-item / standalone; questions and comparatives match; leftover *bare* / *focus* in those files are only the [kept jobs](#remaining-bare).

## Phase 3 — Span vs range; overlay split

**Files:** `spans.md`, `numbers-applied.md` (ranges still called *span*), `numbers.md` (`#number-overlays` and “overlays” in leads), `special-vocabulary.md` (keep **overlay** here), `lexicon.md` / `gloss.md` (sense-form overlay is correct), `numeric-derivation.md` (pointer to free-number overlays), `causation.md` (*clause-pole overlay* = hosted metaphorical reading; say **metaphorical** / sense-form, not a third *overlay* family), `commentary.md` (related-form pointer).

**Do:** numeric from–to → **range**; clock/date range not *span*. Number PoS uses → **number as verb / adverb / interjection / discourse** (those section titles already exist). Keep **overlay** for sense-form only. Drop *packaging* as a glossary key (informal prose is fine).

**Don’t:** span TYPE/EDGE letter names; *empty* EDGE.

## Phase 4 — Turn / continue; vocative; polar; resume

**Turn / continue:** `core.md` PoS table currently *utterance marker* / *discourse marker* → **turn** / **continue**. Drop *jump* / *extend* as names (mnemonics in the table may stay one line). Keep **sentence linker**. Drop *utterance framing* as a cluster name (`AGENTS.md`).

**Vocative:** drop *call* as the slot name in the left-edge list; keep *calling someone* in ordinary English.

**Polar:** **yes/no** for the question type; **polar stance** for `jael` / …. Drop *reaction word* as the left-edge slot (order: vocative → polar stance → act word). Drop *polar question*, *yes/no polarity* as extra keys. Keep `#yes-no-polarity` as a silent id if the heading text changes (drop in Phase 7).

**Resume:** default learner word **resume** on content, spans, and numbers. Join/restrictor **-r** = **unspecified member** only. Fill-ask stays fill-ask (that *is* unspecified member under question). *Letter pronoun* / *full-root pronoun* → **short resume** / **full-root resume**. Drop *anaphor* except a single linguist gloss if needed.

**Fill-ask:** delete *content question* if any leftover (already unused in grammar prose); drop *gap* / *multi-gap* as aliases of fill-ask / fill-all.

## Phase 5 — Alias sweep (same job)

Mechanical, still contextual. Group by home page:

| Cluster | Keep | Drop | Home |
|---------|------|------|------|
| `/b/` | extra noun | argument noun | `core.md`; one row in `numbers.md` |
| Roles | role compound | participant compound (anchor may stay until Phase 7) | `roles.md`, `x-compounds.md` |
| Predication | classification / identity | zero-copula, property pattern, kind ascription | `predication.md`; comparatives link |
| Compounds | ordinary compound, lexical compound | lexical kind, x-less kind, compound joiner | `x-compounds.md`, `phonology.md` |
| Numbers on ROOT | numeric derivation | number compound, numeric morph | `numeric-derivation.md` |
| Handles | named handle | handle coinage as a term | `reference-suffix.md` |
| Dependents | dependent clause, **`adoro`** | next-clause pronoun, subordination; *doorway* once | `core.md`, `pronouns.md`, `causation.md`, `restrictors.md` |
| Islands | scope island | adjunct-scope, join scope island | `spans.md`, `coordination.md` |
| Plural | associative; collective | associate set; collective doing/ascription as keys | `plurality.md` |
| Restrictors | restrictor, occasion | when-frame, applicability, circumstance restriction | `restrictors.md`, `questions.md` *When?* |
| Revisers | reviser | discourse glue | `revisers.md`; numbers `/x/` glue |
| Endings | ending; reference suffix for content | word ending | `reference-suffix.md` |
| PoS | role letter | first letter, PoS prefix | `core.md` beginner table |
| Joins | join, conjunct | coordination as learner word | `coordination.md` |
| SHARED | SHARED + scale/continuum | shared modifier | `coordination.md`, `comparatives.md`, `numbers-applied.md` |
| Causation jobs | sufficient / necessary / unique path | mechanism umbrella; open inclusive | `causation.md` |
| Universality | universality vs generic / every K | warrant, exceptionlessness as keys | `special-vocabulary.md`, `coordination.md` |
| COMMENT | COMMENT | thought balloon / commentary as keys | `commentary.md` |
| Values contact | contact channel | savoring as a term | `values.md`; `why-agelan.md` may keep purpose *savoring* |
| Measures | measure phrase, unit | measure host, unit morph, stock measure host | `numbers-applied.md` |
| Digitless | digitless | zero-digit-group as a second name | `numbers.md` |
| Loans | loan vs opaque span | compact foreign content word | `spans.md`, `core.md` |
| Specials | special pronoun | speech-role, discourse role | `pronouns.md` |
| Series | vowel series | job map | `vowel-series.md` |
| Ideation | numbered alternatives | ideation | `special-vocabulary.md` |

**Also in this phase — current spellings only.** In in-scope files (`docs/grammar/`, `AGENTS.md`, [english-terms.md](english-terms.md), [drill-generation.md](drill-generation.md), [grammar-docs.md](grammar-docs.md)), replace any **superseded Agalan spelling** with the published current root (same emoji / same job). Typical leftovers: special-pronoun citations that drifted from the lexicon (`ahage` / `ebone` vs current **`aha`** / **`edone`**). Do not leave the old spelling as an alias, parenthetical, or “also written…”. Do not mention that a spelling changed. House-cast dummy people stay names — that is not a spelling retie. HTML ids wait for Phase 7.

## Phase 6 — Remaining splits

Do these after Phases 2–3 so *focus* / *overlay* / *span* / *host* leftovers are the real remaining jobs.

| Split | Files |
|-------|--------|
| Word-order *focus* → **prominence**; values **Focus** column → **contact** | `core.md`, `values.md` |
| Value *topic* vs `ahaza` **as-for** | `values.md`, `core.md` `#adverb-topic-and-free-order-ties` (new id `as-for`; keep old id until Phase 7) |
| **NOTIONAL** vs **imaginary** vs **quasi** | `commentary.md`, `numbers.md`, `numeric-derivation.md` |
| *Host* only on `x`-attachment; measure **unit**; classification subject | `ability.md`, `values.md`, `numeric-derivation.md`, `numbers-applied.md`, `predication.md` |
| *Ambient scale* → **ambient magnitude**; OoM not *scale* | `numbers.md` |
| Drop *circumstance* as a term (restrictor / clock-date / named standard) | `restrictors.md`, `numbers-applied.md`, `reference-suffix.md`, `questions.md` |
| Clause join **-n** → **sequence**; phrase **-n** → **named list**; number **-n** → **conventional** | `coordination.md`, `reference-suffix.md`, `numbers.md` |
| Ordinary `/h/` not *mood* | floating-`/h/` pages |
| *Soft identity* → ordinary **open** SAME **-m** (no extra term) | `predication.md` |

Optional in this phase: value “bare need” → always **topic** in values.md, shrinking leftover *bare*.

## Phase 7 — Editor surfaces

Rewrite [english-terms.md](english-terms.md) from an as-used collate into a **keep-list**: one row per locked name, *Near* only for true other-jobs, clash table only for leftovers that Phase 6 did not kill. Change the lead: this page is now the standardized metalanguage, not a recommendation to rename.

Sync [grammar-docs.md](grammar-docs.md) (everyday-English examples still saying `clause force`; “omit recoverable `jal` when the page is not teaching speech act”). Sync [drill-generation.md](drill-generation.md) allowlist rows. Sync `AGENTS.md` construction table if any Phase 5–6 names remain.

**Drop old HTML ids:** grep the silent fragments listed under **Anchors**. Rewrite remaining in-repo links to the new id, then delete the alias. Confirm no superseded Agalan spellings remain in in-scope files.

## Per-phase checklist

1. Grep the **old** strings in `docs/grammar/` and confirm each hit is this phase’s job (or skip).
2. Edit visible prose, headings, tables, See also. Add the new section id; keep the old fragment until Phase 7.
3. Update `AGENTS.md` / drill-generation / grammar-docs lines that name this construction.
4. `npm run lint:md`.
5. Grep again: no learner-visible old name for this job; kept homonyms still present on purpose.
6. Tick the phase here (status line below) when merging.

| Phase | Status |
|-------|--------|
| 1 Speech act | done |
| 2 Join arity | done |
| 3 Span / range / overlay | done |
| 4 Turn, vocative, polar, resume | done |
| 5 Alias sweep | done |
| 6 Remaining splits | done |
| 7 Editor surfaces | done |
