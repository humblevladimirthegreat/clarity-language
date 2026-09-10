# Grammar doc style (for learners)

How to write Agalan **grammar docs** under **`docs/grammar/`** so a learner can use them. Applies **only** to that folder (not to `meta/`, `examples/`, or `proposals/`). Design authority for morphology stays in those pages (core sentence grammar: [core.md](../grammar/core.md)); this page standardizes **pedagogy and prose** only.

Grammar pages must **not** link to or mention `meta/` or any other folder outside `grammar/` — only peer links inside `grammar/`. Editors follow this page, [learning-levels.md](learning-levels.md), and [translation-exercises.md](translation-exercises.md) privately.

Related meta:

| Page | Owns |
|------|------|
| [learning-levels.md](learning-levels.md) | **Beginner** / **Intermediate** / **Advanced** stage rubric and [cross-doc path](learning-levels.md#cross-doc-path) (for `docs/grammar/` only) |
| [glosses.md](glosses.md) | Morph glosses and free English ([example blocks](glosses.md#example-block); [house-name glosses](glosses.md#house-cast)) |
| [translation-exercises.md](translation-exercises.md) | Eng ↔ Agalan checkpoints (placement, principles including house-cast people, spoiler shape) |
| [drill-generation.md](drill-generation.md) | Path allowlist and execute procedure (one file per agent) |
| [language-name.md](language-name.md) | English name **Agalan** = glasses root **`agala`** + **-n** (editors only — not linked from grammar) |
| [unassigned-reserved.md](unassigned-reserved.md) | Unused-slot / unassigned-form inventory (editors only — not linked from grammar) |
| [proposals.md](proposals.md) | `docs/proposals/` layout; **do not link to** proposal pages (editors only — not linked from grammar) |

Learner English names for constructions live on [terminology.md](../grammar/terminology.md) (Tools). Teaching pages use those names in place; they do **not** link to terminology entries (How to learn may point at the page).

## Dual role

Each grammar page is both **source of truth** for its subsystem and **learner text**. Prefer teach-first structure over inventory-first dumps in **Beginner** ([Beginner stage shape](#beginner-stage-shape)). Later stages may complete a paradigm as a table ([later-stage shape](#later-stage-shape)); if Advanced dwarfs Beginner, split the file. Unassigned or unused-slot inventory stays in [unassigned-reserved.md](unassigned-reserved.md); rejected or speculative features stay in [TODO.md](../../TODO.md) — never in a grammar page appendix. Grammar pages teach **assigned readings only**. Do not ship a form as “reserved,” “not used,” or “or reserved,” and do not keep a **Reserved forms** heading whose job is to fence unused phonotactics. *This spelling already has job X* (e.g. a time-code host) is a positive rule — say the job, not “reserved.” If the learner must not build a shape, omit it; if they might invent it *now*, one [Compare with](#compare-with) sentence is enough — never a leftover-slot inventory.

On this page:

| Topic | Jump |
|-------|------|
| Current language / leftover | [Present the current language only](#present-the-current-language-only), [no process leftover](#no-process-or-corrective-leftover) |
| Mix-ups and negatives | [Which tool, not which owner](#which-tool-not-which-owner) |
| Page architecture | [Page skeleton](#page-skeleton), [Beginner](#beginner-stage-shape), [later stages](#later-stage-shape) |
| Memory aids | [Cues](#cues-columns), [when to state a scene cue](#when-to-state-a-scene-cue) |
| Voice | [Explain before you slogan](#explain-before-you-slogan), [plain language](#plain-language-no-assumed-linguistics) |
| Examples / tables | [House cast](#house-cast), [Tables](#tables) |
| Scope | [Cross-links](#cross-links-and-scope), [what belongs where](#what-belongs-where) |
| Ship check | [Stage checklist](#stage-checklist) |
| File format | [Markdown hygiene](#markdown-hygiene) (including [HTML comments](#html-comments)) |

## Present the current language only
<a id="present-the-current-language-only"></a>

Write as if this is the only version of Agalan the reader will ever see. There is **no** backwards-compatibility duty in learner-facing prose: not for English labels, not for Agalan spellings.

| Do | Don’t |
|----|--------|
| State the rule as it is now | Mention prior wordings, renamed labels, or “used to be called…” |
| Use the current term and the **current published spelling** | Keep a superseded root, hyphenated PoS, or dual spelling |
| Use the current term once, clearly | Add “formerly…” redirects in the prose |
| Fix outdated prose in place | Leave “correction trails,” changelogs, or former-name parentheticals |
| State the current pattern only | Deny a withdrawn shape (“not a matching word on the left,” “not a mid-chain `A zam B`,” “not a sixth marker”) |
| One current heading and one current `#id` | Keep an old heading as a silent `<a id="left-fence">` (or any retired slug) so old links still resolve |

The learner should never need the editing history of the docs or of the lexicon.

### One current heading, one current id
<a id="one-current-heading"></a>

When you rename a section, **change the heading and the id to the current name**, then retarget every in-repo link. Do **not** keep the old heading text, and do **not** leave a silent `<a id="old-slug">` so former URLs still work. There is no fragment-compatibility duty.

| Do | Don’t |
|----|--------|
| `### Right-close fence` plus `#right-close` (or the heading’s current slug) | Extra `<a id="left-fence">` under that heading |
| Fix `coordination.md#left-fence` (and editor notes) to the live id | Stack retired slugs “in case something still points here” |

**Test:** an unused `<a id="…">` whose name is a former heading is leftover. Delete it. One canonical id per concept, matching the **current** ordinary name (`speech-act`).

### Omit denials of former constructions
<a id="omit-former-construction-denials"></a>

If a pairing, slot, or word order existed only in an earlier draft of the docs or the language, **omit any sentence whose job is to say it is gone**. A new learner never saw that version. Naming the absence teaches the old system.

| Smell | Why it fails | Prefer |
|-------|--------------|--------|
| “on the right, not a matching word on the left”; “English *both A and B* still uses this one closer” | Only makes sense if they knew left fencing | Items, then the join (`A B zam`) |
| “not a mid-chain extender”; warning `A zam B` / `A vol B val C` | Only if they knew infix joins | The legal nest: `A B vol C val` |
| “still X; it is not a sixth marker / fourth umbrella / new vowel job” | Corrects a withdrawn proposal | Date is digit-string `_` + `oe`; **-n** names a titled frame |

**Test:** would a reader who never saw a previous version invent that wrong shape from *this page* and from English? If the only reason to mention the hole is an old doc, delete the sentence. Keep a [Compare with](#compare-with) beat only when the live sibling (or an English false friend they would type *now*) is the mix-up.

## No process or corrective leftover
<a id="no-process-or-corrective-leftover"></a>

Headings, leads, and asides must make sense to someone who never saw an earlier draft, agent note, or maintainer instruction.

**Strip or rewrite** anything whose job is to correct the *writer* rather than teach the *learner*:

| Smell | Why it fails | Prefer |
|-------|--------------|--------|
| Parentheticals like “(actual words)”, “(real orthography)”, “(not the hyphenated form)” | Corrects a past habit; empty for learners | The plain heading or rule |
| “Don’t write X anymore” / “agents must…” / “in examples we now…” | Process note | State the allowed form only |
| “Foreign roots are banned except…” as a lecture | Sounds like a policy fight | Show the loan / span pattern once, with an example |
| Apologies, changelog asides, “for historical reasons” | Meta about the doc | Current rule + example |
| Scare-quotes or scare-emphasis on the “real” way | Implies a fake competing system | Neutral wording |
| “House rules,” “metalanguage / inventory tables,” “parsers accept both” | Maintainer dialect; audience is tooling | Learner writing/speech preference in ordinary words |
| Titles or leads that name **parser families**, “the parser must…,” “parser cue” | Tooling is not the reader | How a *reader* tells the shapes apart |
| “Defined core” vs leftover cells; “or reserved” | Advertises unused inventory | Teach the forms that have readings; leave holes off the page |
| “**…0e0** is not used” as a taught row | Unused-slot dump on a public page | Assigned close / number only; holes stay in [unassigned-reserved.md](unassigned-reserved.md) |
| “X **stays on** Y” / “the job stays on that page / those joins” | Editor reminder that a reading was not moved; sounds like process, not teaching | [Which tool, not which owner](#which-tool-not-which-owner) |
| “not a matching word on the left” / “not a mid-chain…” / “not a sixth marker” | Corrects a retired design; the learner never met it | [Omit denials of former constructions](#omit-former-construction-denials) |

**Test:** if you delete the phrase and a new learner loses no meaning, delete it. If the only audience for a sentence is a future editor, keep it out of the visible body: [unassigned-reserved.md](unassigned-reserved.md), `TODO.md`, a PR, this meta page, or an [HTML comment](#html-comments) next to a local exception — not learner-facing prose.

## Which tool, not which owner
<a id="which-tool-not-which-owner"></a>
<a id="compare-with"></a>

State the **positive** rule: which form to use for which English job. A “not Y” spends attention on a shape they are told not to build; most of those exist to correct a writer habit, not teach a reading.

Do not say a reading **stays on** another section, page, or subsystem — that is fencing for writers (“don’t reassign this”), not a cue for readers. Same family as ownership fences (“this page owns / does not own X”) — [teach now; don’t preview later](#teach-now-dont-preview-later). This meta page may still use *stay* in editor English (*inventory stays in unassigned-reserved.md*). Grammar-page prose should not.

**A contrast earns a place only when all three hold:** the learner would use the wrong form for **this** English *now* (English false friend, or an Agalan sibling they already met — `-x` vs **`aha`**, classification vs **`SAME`**, free `g+e` vs `ROOTx+e`, join **-r** vs content **-r**); both forms appear with a real example; and the beat fits in one or two labeled sentences after this form’s example. Search, the sidebar, and **See also** already list related pages. Do **not** catalog siblings “in case they look them up,” expand a mix-up into a related-forms table, or restate the other doc.

**Skip the negative when:** they would not invent the wrong form (editor-hygiene pairs like hyphenated PoS, ~~`z-ugobo`~~); it only restates the positive (“write one token” already implies no hyphen); or a section would get a ritual **Not this** column with nothing decisive to say. A strong positive example is enough when there is no sibling to compare.

| Prefer | Avoid (unless the trap is real) |
|--------|----------------------------------|
| Write **prefix + root + ending** as one token: `zazawan` | “…as one token — **no hyphen** after the PoS letter” |
| Who you address sits at the start of the speech move, before the sentence body | “Vocatives **do not** appear mid-clause” *with no learner reason to try that yet* |

Mark the one mix-up so it is easy to scan. Use **one** of these four starters (bold, then a colon), then **use X for Y** and one peer link. Do not invent other labels (`Trap:`, *Near miss:*, “Do not confuse…”, “Not to be confused with…”). The body after the starter still teaches the split. Do not follow the label with a filename alone.

| Starter | When |
|---------|------|
| **Compare with:** | Default. The sibling they already met, and would reach for *now* for this English. |
| **For *X*, use:** | One English false friend. Put the English they typed in the *X* slot (*because / if*, *I think*). |
| **Related form:** | Same test, softer tone: they would pick the neighbor, but you are not stressing a clash. |
| **Not the same job as:** | Same slot or similar shape, different English job — they would treat them as interchangeable. |

| Prefer | Avoid |
|--------|--------|
| **Compare with:** *if* / *because* use the joins and clause poles above. | Sufficient / necessary / *if* / *because* **stay on** the joins. Exceptionlessness **stays on** universality. |
| **For *I think*, use:** [COMMENT](../grammar/commentary.md#comment) (`odoho`). This inventory is *how you know a world-claim*. | First-person *I think* **stays** COMMENT. |
| **Related form:** packaging a list uses [joins](../grammar/coordination.md) (`zal` / `val` / `xal`, …). | Phrase, VP, and clause **joins stay on** coordination.md. |
| **Not the same job as:** [PLAN](../grammar/plan-decision.md#plan-predict) (map grain). This mood marks **pick firmness**. | Intention map grain **stays PLAN**. |

Place the labeled beat **after** the worked example for this form, not in the page lead. The lead says what **this** form does. **At most two** labeled beats per teach block. A third sibling is not a table — omit it; the learner can open that page.

Do **not** add an **Agalan · Use** (or English-bundle) table whose rows are other subsystems. An **Agalan · Use** table is only for **this** form’s own cells (this mood’s endings, this join series, this page’s vowel map). Add a **Not this** column only when several rows of *this* table share real confusables — never by default, never as a peer catalog.

| Smell | Verdict |
|-------|---------|
| Boilerplate disclaimers: “X is a **root choice**, not `xa`/`xu` polarity”, “plural **-x** stays unused on `/h/` `/w/`”, “there is no dedicated root”, “not a fourth vowel/role/join”, “**Not won’t:** …” | Delete. State what the form does instead |
| Denials of a retired pairing or order: “not a matching word on the left”, “not a mid-chain extender”, “not a sixth marker identity” | Delete. The learner never saw that version — [omit denials of former constructions](#omit-former-construction-denials) |
| **Trap tables** (“Not this (real traps)”, “Traps worth one look”, “Keep these for other jobs”) and **related-form Agalan · Use** catalogs | Delete from body. One starter plus an example of each form they would mix up *now* |
| Inline **`Trap:`** / **“Trap:”** / *Near miss:* / “Do not confuse…” / “Not to be confused with…” | Punitive or quiz warning. Use one of the four starters |

## Cues live in tables
<a id="cues-live-in-tables"></a>

Do not append free-text `**Cue:**` or `**Mnemonic:**` paragraphs after a table (that leftover is editor layout). Put each row’s memory aid in a **Cue** column. For tables whose rows come from the [vowel series](../grammar/vowel-series.md), **Cue** shows how **`a`** / **`o`** / **`e`** / **`u`** maps to that row. Metaphor emoji may serve as the visual cue, consistent with published-root conventions.

If a page has several such tables, give each its own **Cue** column; never summarize the whole series once in prose and leave later tables bare. Column names and what may sit in **Cue**: [Cues](#cues-columns).

## Empty or pointless stages
<a id="empty-stages"></a>
<a id="empty-bands"></a>

**Omit** `## Advanced` (or `## Intermediate`) when the rubric’s third question is no: there is no new edge-case, stylistic, or rare inventory. Recap tables, unused-slot lists, “reminder” restatements of earlier stages, and Design-notes dumps do **not** earn a later stage. Fold anything still needed into the last stage that actually teaches, or drop it.

Do **not** keep a heading whose only job is to say there is nothing here. Learners skip missing stages on the [cross-doc path](learning-levels.md#cross-doc-path). Material that did not make a stage belongs in [unassigned-reserved.md](unassigned-reserved.md) or [TODO.md](../../TODO.md), not in a stub appendix on the page.

**Bounce notes are empty stages.** Do not open a page with `## Beginner` (or a lead before the first stage heading) that only says “nothing here / come back when you are ready for Intermediate / this page is Advanced.” Omit the unused stage heading. A page that starts at Intermediate or Advanced is fine; the sidebar path already skips missing stages. Do not duplicate the same recap (“house rules,” writing-style bullets) in a later stage just to fill Advanced.

## Punctuation

Prefer commas, colons, parentheses, or separate sentences over em dashes. An em dash is allowed only when a sentence genuinely needs a strong break; do not use it as default clause glue.

## Page skeleton
<a id="page-skeleton"></a>

1. **Title + one-line job** — the English job this page teaches (learner-facing). Sibling links only when the learner will reach for that form *now* — [Compare with](#compare-with), not “this page owns / does not own” fencing.
2. **Needs** (optional) — **rare.** Use only when the page is late and the dependency is not obvious from the [cross-doc path](learning-levels.md#cross-doc-path) (e.g. causation → joins + **`adoro`** from core Beginner; comparatives → rank joins). Label as `**Needs:**` with one short link line. Do **not** ritualize “core Beginner; reference-suffix Beginner” on every page.
3. **`## Beginner` / `## Intermediate` / `## Advanced`** — per [learning-levels.md](learning-levels.md). Include **Advanced** only when that page has rare inventory to teach ([empty or pointless stages](#empty-stages)).
4. Inside each stage: **concept → English job → Agalan shape → one consequence → 1–3 examples → (optional contrast) → full table if needed**. Cue in the same block or in the **Cue** column, not as the lead. Inside **Beginner**, H3 order is **dependency order for this page’s job** ([Beginner stage shape](#beginner-stage-shape)), not inventory order. On clause pages that is building a clause; citation notes are last (or already taught on [reference-suffix.md](../grammar/reference-suffix.md)). Later stages: [Intermediate and Advanced stage shape](#later-stage-shape). [Explain before you slogan](#explain-before-you-slogan).
5. Optional **See also** at the end — a few precise related forms only; no long link walls in the lead (and no lead preview of later peers — [teach now; don’t preview later](#teach-now-dont-preview-later)).

Front matter that orients (psychological purpose / limits / feature criteria / benefit tour — [why-agelan.md](../grammar/why-agelan.md); grammar design / how to learn — [introduction.md](../grammar/introduction.md)) is not a learning stage. Reading order lives in the path / sidebar — not repeated as Prerequisites.

## Teach in this order
<a id="teach-in-this-order"></a>

| Order | Content |
|-------|---------|
| 1 | What you can *do* (English job) |
| 2 | The Agalan shape (minimal pattern) |
| 3 | A **cue** so the form sticks (Beginner; [cues](#cues-columns)) |
| 4 | Worked example(s) |
| 5 | [Compare with](#compare-with) — **only the form they would use for this English** |
| 6 | Inventory / edge cases |

Do not open a **Beginner** section, or a later-stage H3 that teaches a **new English job**, with a complete paradigm table. Tables come after the pattern is usable. An H3 whose only job is to **finish a series already taught** may open with a short pointer and the table ([later-stage shape](#later-stage-shape)).

## Beginner stage shape
<a id="beginner-stage-shape"></a>
<a id="beginner-band-shape"></a>

**Grow one job at a time.** A Beginner stage opens with the **smallest form that does this page’s English job**. For clause pages that is a working sentence. For [phonology.md](../grammar/phonology.md) that is letters and cited word edges. For [reference-suffix.md](../grammar/reference-suffix.md) Beginner that is prefix-less **citation** (root + ending), not a sentence.

Each later H3 adds **one** job (or one letter) and a worked example.

Do **not** open Beginner with:

- a complete role / paradigm / letter table (except phonology’s sound charts)
- writing-system notes (unicase, citation / prefix-less forms, “outside a sentence”) on a **clause** page before a working sentence
- a form the stage’s **translation practice does not use**, unless that form is required to **parse** an example they do use (then **one sentence**, not its own H3)

**Writing meta last (or elsewhere).** How letters look (lowercase) may live on [phonology.md](../grammar/phonology.md). Citation (prefix-less root + ending) is taught on [reference-suffix.md](../grammar/reference-suffix.md) Beginner. [core.md](../grammar/core.md) Beginner adds the role letter to a citation they already write. Other pages do not re-teach citation.

**Do not preview this page’s later H3s.** A section must not name *turn* / *continue* / omit-`jal` (or any later job on the same page) before that section exists. Either teach the opener first, or state the current pattern as a **bare statement body** (a period already marks a statement) until Turn is taught.

**Same example, two English jobs:** if one Agalan string is both a full sentence and a noun phrase (or two readings), say that in the same block. Do not silently reuse the string under a new gloss.

**Inventory tables after one worked row.** A closed-form table with more than a few rows (subordinators, speech-act family, full PoS) follows **one** English job + example. Extra rows are “you can also say,” not equal first teaching.

**Drills as a check.** After drafting Beginner, walk the [translation practice](translation-exercises.md): every taught H3 should appear in a drill, or get cut / demoted. Setup that only exists so a later drill parses (`/h/` + `/b/` before **`adoro`**) stays as the **minimum** needed for that drill.

## Intermediate and Advanced stage shape
<a id="later-stage-shape"></a>
<a id="intermediate-stage-shape"></a>
<a id="advanced-stage-shape"></a>

Folder-wide hygiene still applies: [present the current language only](#present-the-current-language-only), [no process leftover](#no-process-or-corrective-leftover), [which tool, not which owner](#which-tool-not-which-owner), house cast, omit default **`jal`**, [empty stages](#empty-stages). A learner who opens Intermediate without rereading Beginner must not meet editor history, “stays on,” or denials of withdrawn constructions.

Do **not** rerun [Beginner stage shape](#beginner-stage-shape) on later stages. Completing a paradigm as a table is the job of Intermediate; rare or stylistic inventory is the job of Advanced. Forcing “grow one cell at a time” there fights the dual role.

**Kinds of later-stage H3.** Sort each heading, then write to that kind:

| Kind | When | Shape |
|------|------|--------|
| **New English job** | A construction they could not say after Beginner (soft speech acts, adjective before the noun, nested **`adoro`**) | Same lead order as Beginner: English job → Agalan shape → consequence, then **one** worked example, then the table or [Compare with](#compare-with). Cue last, not as the definition. Per-cell cues are optional. |
| **Finish the series** | The rest of a map they already use (full join single-item/standalone, remaining linkers, period/speech rhythm) | One short pointer (“Beginner already used *therefore*”) plus the inventory table. Do not unpack every row as its own H3. |
| **Rare / stylistic Advanced** | Edge, meter, singing, uncommon variants | Inventory plus one example or one preference sentence. Skip per-cell cues. |

| Apply | Do not apply |
|-------|----------------|
| Hygiene and [Compare with](#compare-with) starters | Smallest-clause-first page architecture |
| [Explain before you slogan](#explain-before-you-slogan) on **new-job** leads | Mandatory cue per inventory cell |
| [Plain language](#plain-language-no-assumed-linguistics) for **new** labels this stage introduces | Re-gloss house shorthand Beginner already unpacked (*job*, *point*, *setting*, *body*) |
| **Cue** column on vowel / ending maps | Two-to-four-sentence hard length on every lead |
| Intermediate must not teaser Advanced ([teach now](#teach-now-dont-preview-later)); naming a Beginner form by its taught name is fine | Kitchen-sink ban — later examples may stack subsystems |

**Slogan test on new-job leads only.** Cover the example: could they restate the new choice? Inventory H3s need not pass that test; the table is the teaching.

**Drills.** Intermediate checkpoints exist ([translation-exercises.md](translation-exercises.md)). They cover the **new jobs**, not every inventory row. A pointer-only H3 (number-as-interjection → [numbers.md](../grammar/numbers.md)) needs no drill on this page.

## Cues
<a id="cues-columns"></a>
<a id="cues"></a>

Every **Beginner** teaching gets a **cue** — something that makes the form memorable, not only grammatical. Intermediate / Advanced inventories need not invent a cue per cell. Learner-facing name is **Cue**; editors may still say *mnemonic* on this meta page.

Learner tables use these headers (omit a column when every cell would be empty or a duplicate of another column):

| Column | Binding? | Content |
|--------|----------|---------|
| **Agalan** | yes | The spelling (word, letter, or pattern). |
| **Use** | yes | What the form **does** in the clause (subject, command, continue). Not a pun. |
| **English** | yes | English the learner may **say or produce** (sense or free English). Not a pun. |
| **Cue** | no | Recall only: **why** the token maps. Cover this column: the rest must still be the language. ([rubric](#cue-rubric)) |

**Use** and **Cue** must not be the same string. If they would be (`add` / *add*), unpack **Use** (*hold / inventory*) and keep the slogan in **Cue**.

Do **not** use the heading **Mnemonic**. It reads like a second definition, and writers stuffed letter puns and real **-m** etymology into one cell.

### Cue rubric
<a id="cue-rubric"></a>

A cue is a **bridge**: one reason the visible token (letter, vowel, emoji) maps to **Use** / **English**. It is not a caption of the token.

| Test | Pass | Fail |
|------|------|------|
| **Cover** | Hide **Cue**. **Agalan** + **Use** / **English** still teach the language. | The pun is the only definition |
| **Bridge** | Hide the emoji, the *literal*, and the letter being punned. What remains still says *why* the token maps to this row. | 🧱 *brick* — leftover is the picture’s name |
| **Not a caption** | Cue ≠ Unicode/CLDR name, ≠ **Agalan** spelled in English, ≠ `from *smile*` with no why | *doorway*, *zebra*, *timer* alone |
| **Not the answer** | Cue is not a synonym of **English** / **Use** | *because* restated as *cause* / *foundation* as a second gloss cell |
| **One hop** | Token → **one** reason → the row | `brick → foundation → because` as three English labels |
| **Short** | One clause after the token | A second slogan system |

Scene shape: `{emoji} *{literal}*: {why that evokes this row}`. The *literal* is the lexicon **from**; the clause after the colon is the cue proper.

Letter / series: `{letter} ≈ {sound or series slogan} ({why that maps})`. `**d** ≈ done to` passes because *done to* is a **sound** bridge to *acted on*, not a caption of `d`. `**v** ≈ verb` fails unless the leftover explains the coincidence (*the English word for the job*).

`from *smile*` with no why fails the bridge test. Prefer `from *smile*: the face of *happy*`, or omit **Cue** when **-m** plus **English** is enough.

### Two kinds of cue

| Kind | What it is | Where it goes |
|------|-----------|----------------|
| Letter / series | Pun on the spelling (`**d** ≈ done to`, **`a`** *add*) plus why it maps | **Cue** only. Never **Use** or **English**. Linker is **`≈`** (“sounds like”), never `=` or `→`. |
| Scene | Published emoji + literal that licenses **-m**, then why that scene evokes the sense | **English** = metaphorical sense (*happy*, *because*). **Cue** = `emoji *literal*: why` |

A lexicon path is a real **-l** / **-m** choice; the *literal* English is still not what drills ask for. Write `*happy* (**-m**)` in **English** and `from *smile*: the face of *happy*` in **Cue** — never `smile → *happy*` as the only English.

Inline after the rule sentence: `(cue: …)`. Worked examples stay Agalan / morph / quoted free English ([example block](glosses.md#example-block)) — no cue line. Translation-practice answers are Agalan or loose English only; the root bank may add **Cue** beside **English · Agalan**.

### When to state a scene cue
<a id="when-to-state-a-scene-cue"></a>

A **scene** cue (`emoji *literal*: why`) is for remembering a published picture. State it only when that picture is doing **grammar** work, not when the page is merely using a dictionary metaphor.

**State it** on a **closed overlay**: a fixed special reading under one part of speech (COMMENT, SAME, CAUSE, ABIL, plan / DECISION, evidentials, NOTIONAL, emotion ACT / LOCUS, clause-pole **`adoro`**, special pronouns, universality moods, and the same class). The learner needs the scene to remember why *this* published root hosts that job. Put `(cue: …)` on the **rule sentence** (job, shape, consequence first), or in the inventory **Cue** column. One line that the same spelling is still ordinary content under other letters is fine.

**Do not state it** when the example is ordinary **lexicon metaphor** (content **-m**): `hogorem` *inside*, `welem` *size* / *very*, `hadazam` *hastily*. Do **not** add a following sentence of the form “**`ogore`** here is the published metaphor *inclusion* / *inside*. (cue: ⭕ *hollow circle*: …).” The morph gloss and quoted English already give the sense. **-m** as a system is taught on [reference-suffix.md](../grammar/reference-suffix.md#metaphor-m); that page (and drill **Cue** cells) may show `from *swan*: the glide of *grace*` because the lesson *is* the metaphor ending.

| Do | Don’t |
|----|--------|
| Overlay lead: **`odoho`** as COMMENT, then `(cue: 💭 *thought*: a balloon over the scene)` | After `hogorem bohohul`, a sentence that names the lexicon row and restates the hollow-circle cue |
| Overlay table **Cue** for SAME, ABIL, CAUSE, … | A post-example etymology footnote on ordinary *-inside* / *haste* / *size* |
| Cue last on the **rule**, before the first example | Cue as the paragraph *after* the worked examples |

Letter / series / ending cues (`**a** ≈ add`, **m** ≈ metaphor) are the other kind; they follow [two kinds of cue](#cue-rubric) and are not this overlay-vs-lexicon split.

Do not invent a second cue system beside metaphor, vowels, and endings when those already explain the form. **Do not use the cue as the definition:** teach **Use** and the Agalan shape first ([explain before you slogan](#explain-before-you-slogan)).

Do **not** paste a legend (“**Use** is the rule…”) on every grammar page. [How to learn](../grammar/introduction.md#how-to-learn) owns that explanation once.

Usual sources (prefer one; reuse the language’s own systems):

| Source | When |
|--------|------|
| **Metaphorical / lexicon sense** | Closed roots and overlays (**`SAME`**, **`COMMENT`**, ➡️ *east*: the sun’s path, so the talk moves on) |
| **Vowel series** | Join / speech act / polar stacks that share letter jobs |
| **Ending letters** | **-l** / **-m** / **-n** / **-r** (and stance endings) when the ending *is* the lesson |

## Voice and length

- Address the learner in second person (“use **-r** when…”, “prefer names when…”). That *you* is English pedagogy — not Agalan **`edone`**.
- Teaching stages do not use maintainer *we* (“we now write…”) or author *I*. Author *I* is allowed only on signed non-teaching prose in this folder (acknowledgments; the purpose / limits essay), not on rule pages.
- One idea per H2/H3. On a **new job**, the first paragraph should be one **complete** explanation: English job, Agalan shape, and what that lets the learner do ([explain before you slogan](#explain-before-you-slogan)). That is the same bar as the [easy-to-use feature criterion](../grammar/why-agelan.md#criterion-for-features) (roughly one paragraph plus a couple of examples), not a one-sentence aphorism. A later-stage H3 that only finishes a series may be a short pointer plus a table ([later-stage shape](#later-stage-shape)).
- Prefer short paragraphs plus a table over a wall of prose.
- Bold sparingly; put Agalan forms in backticks (`jal`, **-r**, `/ɡ/`).
- Always call the language **Agalan**. Community / project URLs that still use a legacy host path are fine when they are the real link; do not “fix” them in learner prose.

## Explain before you slogan
<a id="explain-before-you-slogan"></a>

Brevity means **no filler**, not **maximum claims per clause**. A Beginner lead may take **two to four short sentences** before the first example. One sentence is allowed only when job, shape, and consequence are already obvious from the previous H3. Later-stage **new-job** leads use the same unpacking (no hard sentence count). Later-stage **finish-the-series** leads may be one pointer sentence before the table.

**Teach in this order inside the lead** (same as [Teach in this order](#teach-in-this-order), enforced inside the first paragraph):

1. **English job** — what the learner is trying to say, in school-grammar English.
2. **Agalan shape** — which letter, ending, or slot does that job, and where it sits.
3. **Consequence** — what they may now do that English does not (reordering, omitting a word, attaching a clause).
4. **Cue last** — letter puns, emoji scenes, and [English pictures](#unpack-english-pictures) are **after the rule**, never the definition.

Do not merge (1)–(3) into a copula slogan (*X is Y*) or a packed imperative (*do A so that B*) until those three pieces have been said in ordinary English.

| Smell | Why it fails | Prefer |
|-------|--------------|--------|
| Copula slogan: “the role letter is the job” | Equates a letter with an abstract label; never says *what you read off the letter* | “The first letter of the word tells you its role (subject, verb, …). Change only that letter when the same meaning plays a different role.” |
| Packed prominence: “Put first what you want heard as the point” | “Point” is undefined; also smuggles free word order | First: roles stay on the letters, so order is free. Then: the leftmost content word is what you highlight (what the sentence is “about,” or the new information). |
| Cue as definition: “**d** = done to” in the rule sentence | The pun is memorable only after “acted on” is taught | Teach *direct object = who or what is acted on*, then `(cue: **d** ≈ done to)`. |
| Label = explanation: “The **boundary** is **`adoro`**.” | Names the form without saying what a boundary *does* | “The main sentence stops after **`adoro`**; the next full sentence is the content that **`adoro`** stands for.” |
| Omission as slogan: “**Leave `jal` out** when a period already marks a statement” | Assumes they know why `jal` exists | “A period already means ‘this is a statement,’ so you do not also write the statement word **`jal`**.” |

**Test (slogan test):** cover the example block. Could a careful adult who has never opened this repo restate the rule in their own words from the lead alone? If they would have to guess what “job,” “point,” “setting,” or “body” means, unpack those words in the lead. A cue in parentheses does not count as unpacking. On Intermediate / Advanced **new-job** leads, they may already know Beginner terms; they must still get the **new** choice from the lead. Skip this test on finish-the-series tables.

**Test (one new move):** the sentence that introduces a *new* choice (reorder, omit, attach) should not also introduce a new metaphor or a new technical noun. Split it.

Do **not** pad with throat-clearing (“In this section we will…”, “It is important to note…”). Extra sentences must add **mechanism or consequence**, not warmth.

Tables may stay telegraphic (**Agalan · Use · English · Cue**). Running prose may not.

### Unpack English pictures
<a id="unpack-english-pictures"></a>

A picture in the teaching English (weather, law, climate, theater, gears) is a **cue**, not the rule. State the English job in school words first. Then the picture may follow, in the same breath or in **Cue**.

Do **not** let the picture stand in for the contrast. Cover the image words: the leftover must still name both sides of the split.

| Smell | Why it fails | Prefer |
|-------|--------------|--------|
| “Habitual *always* stays a weather report rather than a law of nature.” | *Weather report* / *law of nature* are undefined vehicles; *stays* is writer fencing | “Habitual *always* is the usual pattern (exceptions expected), not something that must happen, and not an ought.” Then, if useful: `(cue: usual weather, not a law of nature).` |
| “Universal claims are **weather reports**.” as the first teaching sentence | Equates the mood with the picture before *usually* vs *by natural necessity* | Name COMMON vs NATURAL (or *usually* vs *must happen that way*) first; then the climate picture |
| New picture in the same sentence as a new choice | [one new move](#explain-before-you-slogan) | Split: job, then picture |

**Test (cover the picture):** delete the metaphor nouns. Could they still restate the split? If not, unpack first.

Allowed: published-root scenes in **Cue**; [conceptual metaphors](../grammar/why-agelan.md#conceptual-metaphors) after the job is named; one short `(cue: …)` after the plain rule.

### House shorthand needs a first-use gloss
<a id="house-shorthand"></a>

[Plain language](#plain-language-no-assumed-linguistics) already requires glossing invented labels (*turn*, *role letter*, *speech act*). The same rule applies to **house shorthand that looks like ordinary English**. If the heading or table column uses the short word, the first teaching sentence must still say it in longer English once.

| Short word | Unpack on first use as |
|------------|------------------------|
| **job** | role in the clause (subject, verb, …). Table header **Use** is the same idea; do not re-gloss the column name on every page ([How to learn](../grammar/introduction.md#cues)) |
| **Cue** | memory aid; defined once in How to learn — not unpacked in each table |
| **point** / **prominence** | what comes first for emphasis (what the sentence is “about,” or the new information) |
| **setting** | statement vs question vs command |
| **body** | the clause after any opening `/j/` words |
| **glue** / **linker** | sentence-to-sentence connective |

Intermediate / Advanced **finish-the-series** inventories may stay denser once Beginner has unpacked the terms. A later-stage **new job** still glosses any **new** label on first use.

## Plain language (no assumed linguistics)
<a id="plain-language-no-assumed-linguistics"></a>

Do **not** assume the reader knows linguistics jargon. Write for a motivated learner with ordinary school grammar (*subject*, *verb*, *adjective*), not for a linguistics seminar.

| Do | Don’t |
|----|--------|
| Prefer everyday English for the job (*statement*, *ask*, *main clause*, *at the end of…*) | Lead with bare terms like *assertoric*, *illocution*, *matrix-final*, *predicative*, *prosody*, *paradigm* |
| If a short technical label helps later cross-links, **define it in the same breath** on first use | Use the label alone and hope context teaches it |
| **Define invented or uncommon labels before using them** (*turn*, *continue*, *speech act*, *polar stance*, *role letter*, *citation*): everyday English in the **same sentence as first use**. Same for [house shorthand](#house-shorthand) (*job*, *point*, *setting*, *body*, *linker*) | Use the label in an earlier section or as a bare heading, then gloss later; rely on [terminology.md](../grammar/terminology.md) as the first definition |
| A heading may use that label only **after** the gloss, or the heading itself carries the gloss (*Turn (`/j/`): start a new speech move*) | Stack several undefined jargon words in one sentence (*recoverable*, *utterance*, *left-edge cluster* without a plain paraphrase) |
| School-grammar words (*subject*, *direct object*, *adverb*) are fine when the English job is clear | Pack morphosyntax shorthand (*classification* without *is a kind*, *right-bound*, *adjunct*, *complement clause*) without a plain gloss |

[terminology.md](../grammar/terminology.md) is a later lookup (via How to learn), not the first definition. Teaching pages do not assume the reader has opened it.

**Test:** would a careful reader who never took a linguistics class still get the rule from the first paragraph and the example? If you hide the rest of the page, does the first sentence that contains an invented word still teach what that English word means? If not, rewrite the lead in plain words and demote the technical term to a parenthetical or a later Intermediate note.

Section ids: [one current heading, one current id](#one-current-heading).

## Examples

| Do | Don’t |
|----|--------|
| Minimal clause that shows *only* the new point | Kitchen-sink showcases in Beginner |
| Published roots when the gloss matches; `PoS<…>ENDING` for donor spelling | Invented “lexicon-shaped” stems, a closed overlay with its own frozen spelling, or split/hyphenated PoS tokens in learner text |
| Named [house people](#house-cast) when the clause needs a person | Default *I* / *you* (`zugobon` / `zedonen`) as dummy subjects |
| Omit default **`jal`** when the page is not teaching the speech act | Leading every example with **`jal`** by habit |
| Morph gloss + **loose** free English by default ([glosses.md](glosses.md)) | Merging free English into the morph gloss |
| Strict free English only when teaching packaging | Strict-only Beginner pages |
| A negative only when the mix-up is expected ([Compare with](#compare-with)) | Listing “no X” or a **Not this** column by habit |

### House people
<a id="house-cast"></a>

When an example needs a **person**, use these nativized names (published root + **-n**). Free English keeps *Azawan*, not *Grace* / *I* / *you*. Do not cast abstract roots as participants (`jal zazawan godogol`, not “grace is more challenging than courage”). Keep abstract roots for the form being taught.

| Agalan | English | Root |
|--------|---------|------|
| `zazawan` | *Azawan* | `azawa` *grace* |
| `zululon` | *Ululon* | `ululo` *courage* |
| `zuhubun` | *Uhubun* | `uhubu` *beauty* |

**`ugobo` / `edone`** only when that page is teaching those specials, the point is the **discourse role** (name unavailable, address set, clusivity), or a closed construction is keyed to speaker/listener (*Mine* **`zugoboxrawon`**, viewpoint *my left* when the anchor is the role). Inclusive *we* stays **`aha`**; nonspecific *someone* stays **`enenu`**. Foreign `PoS<…>n` names only when teaching loans or spans. Checkpoints: [translation-exercises.md](translation-exercises.md#principles). Morph / resume: [glosses.md](glosses.md#house-cast).

Default example block ([layout](glosses.md#example-block)):

```markdown
> `zazawan godogol.`
>
> z-Azawan | g-dog
>
> "Azawan is a dog."
```

Omit the morph line when it would copy the quoted English (`azawal` / `"swan"`). Keep it when it shows structure the quote does not (role letters, several words, an `x`-compound citation, …).

Short Eng ↔ Agalan checkpoints: end of a page stage only — [translation-exercises.md](translation-exercises.md). Multi-turn practice belongs under [examples/](../examples/), not inside every grammar section.

## Tables
<a id="tables"></a>

- Contrast and decision tables beat encyclopedia dumps in Beginner. A decision table is **this** form’s own readings (endings, vowel series), not a list of other pages.
- Beginner may show a **partial** table (only letters / jobs taught so far). Completing the table is Intermediate, or a recap at the **end** of Beginner after those jobs have examples — not a dump at the top.
- Full inventories belong in Intermediate / Advanced, or after the teach block.
- Prefer columns **Agalan · Use · English · Cue** for **this** form ([cues](#cues-columns)). Add **Example** or a Morph column when endings are the point. **Not this** / related-subsystem **Agalan · Use**: [Compare with](#compare-with).
- A grammar-table **Gloss** column is short free English unless the row teaches morphology ([glosses.md](glosses.md)).

## Cross-links and scope
<a id="cross-links-and-scope"></a>

- Own your subsystem; link out for PoS, endings, joins, numbers, and so on — **only to other files in `docs/grammar/`**.
- Never link to or mention `meta/`, `examples/`, `proposals/`, `data/`, or repo-root files from a grammar page.
- One canonical anchor per concept (`<a id="…">`), matching the current heading. When a heading changes, retarget links; do not keep the old id — [one current heading, one current id](#one-current-heading).
- Do not dump the whole related-inventory into the lead paragraph.
- **IPA and pronunciation** belong in [phonology.md](../grammar/phonology.md) (letter table, teaching cues) and on the [Inspect](../grammar/inspect.md) tool (**Show IPA** transcribes the same spoken forms). Other grammar pages use orthographic letters (`j`, `x`, `/j/`, `/x/`) — never IPA transcriptions or sound cues in running examples. If a learner needs how a letter sounds, link once to phonology (peer in `grammar/`).

### Teach now; don’t preview later
<a id="teach-now-dont-preview-later"></a>

In each section, mention **only what that section is teaching**. Do not name, teaser, or deep-link subsystems the learner meets later on the [cross-doc path](learning-levels.md#cross-doc-path).

| Keep | Cut / demote |
|------|----------------|
| One peer link when the learner **already** met the form, or when a sibling they will reach for *now* needs a [Compare with](#compare-with) beat | “You’ll later learn…”, “full treatment in…”, ownership fences (“this page owns / does not own X”), and “X **stays on** Y” ([which tool, not which owner](#which-tool-not-which-owner)) |
| Rare **Needs:** when the dependency is not obvious from the path | Ritual prereq walls and long **See also** lists in the lead |
| Optional short **See also** at the **end** (a few precise related forms) | **Beginner naming Intermediate / Advanced** (“putting X before the noun is Intermediate”, “stacking is later”), closed mood inventories, this page’s later H3s before they are taught, peek-ahead to a **later peer’s** later stage, and link walls that restate the sidebar. A later heading is enough for people who keep reading |

**Test:** if the sentence’s only job is to name a topic the path has not reached yet, delete it. If it resolves a trap the learner will hit *now*, one link is enough — do not restate the other doc.

Pages stay dual-role (learner text + source of truth): Intermediate / Advanced inventories and precise end anchors are fine when the *lead and Beginner teach block* stay slim. Intermediate must not name Advanced as a teaser (“X is Advanced”); a later heading is enough. If an Advanced inventory dwarfs the Beginner teach block, split the file. Later-stage H3 shape: [Intermediate and Advanced](#later-stage-shape).

## What belongs where
<a id="what-belongs-where"></a>

| Material | Place |
|----------|--------|
| How to use the form | Grammar doc body under **`docs/grammar/`** (tagged **Beginner** / **Intermediate** / **Advanced**) |
| Gloss format | [glosses.md](glosses.md) |
| Level rubric / reading order | [learning-levels.md](learning-levels.md) ([cross-doc path](learning-levels.md#cross-doc-path)) |
| Doc prose / example style | This page ([Beginner stage shape](#beginner-stage-shape), [later-stage shape](#later-stage-shape), [cues](#cues-columns), [Compare with](#compare-with)) |
| Goals / feature criteria | [why-agelan.md](../grammar/why-agelan.md) (psych); [introduction.md](../grammar/introduction.md) (grammar design, [cue tables](../grammar/introduction.md#cues)) |
| Core sentence grammar | [core.md](../grammar/core.md) |
| IPA / pronunciation / phonotactics | [phonology.md](../grammar/phonology.md) (letter table); [inspect.md](../grammar/inspect.md) (**Show IPA** on spoken forms). Not in other grammar-page examples |
| Unassigned / unused-slot inventory | [unassigned-reserved.md](unassigned-reserved.md) — **never** a grammar-page row, drill, or “reserved” gloss |
| Parser / CLI / site implementation notes | Code and `docs/meta/` — not titles, leads, or “house rules” on grammar pages |
| Rejected or speculative features | [TODO.md](../../TODO.md) |
| Short Eng ↔ Agalan checkpoint | End of a page stage — [translation-exercises.md](translation-exercises.md); generate via [drill-generation.md](drill-generation.md) |
| Multi-turn practice | [examples/](../examples/) (not linked from grammar pages) |
| Editor pedagogy / migration notes | `docs/meta/` only — never from grammar pages |
| Why this file breaks a house style rule | [HTML comment](#html-comments) beside that spot (VitePress does not show it) |

## Stage checklist
<a id="stage-checklist"></a>

Before tagging a section **Beginner**, ask the [three questions](learning-levels.md#rubric-three-questions). Prefer the earlier stage when learners need the form to read ordinary examples. Dependency on another subsystem beats “feels hard.” Do not add Advanced for recap, unused-slot lists, bounce notes, or reminders — [empty or pointless stages](#empty-stages).

Before shipping a **Beginner** stage, also check [Beginner stage shape](#beginner-stage-shape), [plain language](#plain-language-no-assumed-linguistics), [cues](#cues-columns) ([rubric](#cue-rubric)), and [explain before you slogan](#explain-before-you-slogan): invented terms and house shorthand defined on first use; lead unpacks job, shape, and consequence (slogan test); [English pictures](#unpack-english-pictures) after the split, never as the split; cue last, never as the definition, and never a caption of the emoji; first H3 is a usable form for that page (a clause on clause pages; letters or a citation on phonology / reference-suffix Beginner), not a leftover inventory table; no Intermediate teasers; drills cover the H3s (or the H3 is one-sentence setup for a drill).

Before shipping **Intermediate** or **Advanced**, check [later-stage shape](#later-stage-shape): each H3 is a new job, a finished series, or rare Advanced; new-job leads unpack; inventory H3s are a pointer plus a table; hygiene and [Compare with](#compare-with) still hold; no Beginner teasers of this stage, and Intermediate does not teaser Advanced; drills cover new jobs, not every inventory row.

## Markdown hygiene
<a id="markdown-hygiene"></a>

After editing Markdown under `docs/` (or `AGENTS.md` / `TODO.md`), run **`npm run lint:md`**. It checks emphasis balance, slash-joined emphasis, internal links / anchors, and that Agalan words in `docs/grammar/` parse and use lexicon roots. Prefer spaces in slash-joined emphasis (`*a* / *b*`) over `*a*/*b*`. In bold headings or bullets, put forms in backticks only (`**Ranked (`e` / `ae`)**`), not nested bold inside bold.

### HTML comments
<a id="html-comments"></a>

VitePress does not render HTML comments. Use them for **editor-only** notes that must sit next to the grammar text — typically **why this spot is an exception** to a rule on this page (house cast, omit-`jal`, Compare-with quota, and so on). The learner never sees them; `lint:md` and `retie-docs` skip comment bodies.

```markdown
<!-- Exception to house-cast: this block teaches speaker/listener specials, so `zugobon` is the point. -->
```

Do **not** use `<!--@include: …-->` for notes — that is a VitePress include. Do not put the same note in visible parentheses, scare-quotes, or “for editors:” asides ([no process leftover](#no-process-or-corrective-leftover)). Folder-wide editor pedagogy still lives on this meta page; comments are for the **local** why, not a second style guide.
