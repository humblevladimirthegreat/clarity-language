# Grammar doc style (for learners)

How to write Agalan **grammar docs** under **`docs/grammar/`** so a learner can use them. Applies **only** to that folder (not to `meta/`, `examples/`, or `proposals/`). Design authority for morphology stays in those pages (core sentence grammar: [core.md](../grammar/core.md)); this page standardizes **pedagogy and prose** only.

Grammar pages must **not** link to or mention `meta/` or any other folder outside `grammar/` — only peer links inside `grammar/`. Editors follow this page, [learning-levels.md](learning-levels.md), and [translation-exercises.md](translation-exercises.md) privately.

Related meta:

| Page | Owns |
|------|------|
| [learning-levels.md](learning-levels.md) | **Beginner** / **Intermediate** / **Advanced** banding rubric and [cross-doc path](learning-levels.md#cross-doc-path) (for `docs/grammar/` only) |
| [glosses.md](glosses.md) | Morph glosses and free English ([house-name glosses](glosses.md#house-cast)) |
| [translation-exercises.md](translation-exercises.md) | Eng ↔ Agalan checkpoints (placement, principles including house-cast people, spoiler shape) |
| [drill-generation.md](drill-generation.md) | Path allowlist and execute procedure (one file per agent) |
| [language-name.md](language-name.md) | English name **Agalan** = glasses root **`agala`** + **-n** (editors only — not linked from grammar) |
| [unassigned-reserved.md](unassigned-reserved.md) | Unused-slot / unassigned-form inventory (editors only — not linked from grammar) |
| [english-terms.md](english-terms.md) | Collate of English names for grammatical features as `docs/grammar/` currently uses them (editors only — not linked from grammar) |
| [english-terms-plan.md](english-terms-plan.md) | Locked names and phased rename of that collate (editors only — not linked from grammar) |
| [proposals.md](proposals.md) | `docs/proposals/` layout; **do not link to** proposal pages (editors only — not linked from grammar) |

## Dual role

Each grammar page is both **source of truth** for its subsystem and **learner text**. Prefer teach-first structure over inventory-first dumps in **Beginner**. **Advanced may be inventory-first**; if Advanced dwarfs Beginner, split the file. Unassigned or unused-slot inventory stays in [unassigned-reserved.md](unassigned-reserved.md); rejected or speculative features stay in [TODO.md](../../TODO.md) — never in a grammar page appendix. Grammar pages teach **assigned readings only**. Do not ship a form as “reserved,” “not used,” or “or reserved,” and do not keep a **Reserved forms** heading whose job is to fence unused phonotactics. *This spelling already has job X* (e.g. a time-code host) is a positive rule — say the job, not “reserved.” If the learner must not build a shape, omit it; if they might invent it *now*, one [Compare with](#compare-with) sentence is enough — never a leftover-slot inventory.

## Present the current language only
<a id="present-the-current-language-only"></a>

Write as if this is the only version of Agalan the reader will ever see. There is **no** backwards-compatibility duty in learner-facing prose: not for English labels, not for Agalan spellings.

| Do | Don’t |
|----|--------|
| State the rule as it is now | Mention prior wordings, renamed labels, or “used to be called…” |
| Use the current term and the **current published spelling** | Keep a superseded root, hyphenated PoS, or dual spelling |
| Use the current term once, clearly | Add “formerly…” redirects in the prose |
| Fix outdated prose in place | Leave “correction trails,” changelogs, or former-name parentheticals |

The learner should never need the editing history of the docs or of the lexicon. Silent HTML fragment aliases (old `#…` still resolving) are invisible to readers; they are not a second name on the page.

## No process or corrective leftover

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

**Test:** if you delete the phrase and a new learner loses no meaning, delete it. If the only audience for a sentence is a future editor, move it to [unassigned-reserved.md](unassigned-reserved.md), `TODO.md`, a PR, or this meta page — not the grammar body.

### Which tool, not which owner
<a id="which-tool-not-which-owner"></a>
<a id="compare-with"></a>

When two constructions split a job, tell the learner **which form to use for which English job**. Do not say a reading **stays on** another section, page, or subsystem — that is fencing for writers (“don’t reassign this”), not a cue for readers.

A contrast earns a place only when the learner would **use the wrong form for this English** while reading this section. Search, the sidebar, and **See also** already list related pages. Do **not** catalog siblings “in case they look them up.”

Mark that one mix-up so it is easy to scan. Use **one** of these four starters (bold, then a colon), then **use X for Y** and one peer link. Do not invent other labels (`Trap:`, *Near miss:*, “Do not confuse…”, “Not to be confused with…”).

| Starter | When |
|---------|------|
| **Compare with:** | Default. The sibling they already met, and would reach for *now* for this English. |
| **For *X*, use:** | One English false friend. Put the English they typed in the *X* slot (*because / if*, *I think*). |
| **Related form:** | Same test, softer tone: they would pick the neighbor, but you are not stressing a clash. |
| **Not the same job as:** | Same slot or similar shape, different English job — they would treat them as interchangeable. |

The body after the starter still teaches the split. Do not follow the label with a filename alone.

| Prefer | Avoid |
|--------|--------|
| **Compare with:** *if* / *because* use the joins and clause poles above. | Sufficient / necessary / *if* / *because* **stay on** the joins. Exceptionlessness **stays on** universality. |
| **For *I think*, use:** [COMMENT](../grammar/commentary.md#comment) (`odoho`). This inventory is *how you know a world-claim*. | First-person *I think* **stays** COMMENT. |
| **Related form:** packaging a list uses [joins](../grammar/coordination.md) (`zal` / `val` / `xal`, …). | Phrase, VP, and clause **joins stay on** coordination.md. |
| **Not the same job as:** [PLAN](../grammar/plan-decision.md#plan-predict) (map grain). This mood marks **pick firmness**. | Intention map grain **stays PLAN**. |

Place the labeled beat **after** the worked example for this form, not in the page lead. The lead says what **this** form does. **At most two** labeled beats per teach block (two equally likely mix-ups). A third sibling is not a table — omit it; the learner can open that page.

Do **not** add a **Form · Job** (or English-bundle) table whose rows are other subsystems. Those tables are related-form inventories. A **Form · Job** table is only for **this** form’s own cells (this mood’s endings, this join series, this page’s vowel map).

Same family as ownership fences (“this page owns / does not own X”) — [teach now; don’t preview later](#teach-now-dont-preview-later).

This page may still use *stay* in editor English (*inventory stays in unassigned-reserved.md*). Grammar-page prose should not.

## Contrastive negatives (“X, not Y”)

Default to stating only the allowed form. A contrastive negative spends the learner’s attention on a form they are told *not* to build; most of them exist to correct a writer habit, not teach a reading.

| Smell | Verdict |
|-------|---------|
| Boilerplate disclaimers: “X is a **root choice**, not `xa`/`xu` polarity”, “plural **-sh** stays unused on `/h/` `/w/`”, “there is no dedicated root”, “not a fourth vowel/role/join”, “**Not won’t:** …” | Delete. State what the form does instead |
| **Trap tables** (“Not this (real traps)”, “Traps worth one look”, “Keep these for other jobs”) and **related-form Form · Job** catalogs | Delete from body. If the learner would use the wrong form *now*, one [Compare with](#compare-with) starter plus an example of each — not a table of every peer |
| Inline **`Trap:`** / **“Trap:”** / *Near miss:* | Punitive or editor hygiene. Use one of the four [starters](#compare-with) |
| “Do not confuse X with Y” / “Not to be confused with…” | Quiz warning; does not teach the job split. Use **Compare with:** / **For *X*, use:** / **Related form:** / **Not the same job as:** |

**When a contrast earns its place** (all three must hold): the learner can plausibly use the sibling for **this** English *now*; both forms appear with a real example; and the contrast fits in one or two labeled sentences after this form’s example. Otherwise cut it. Do not expand a mix-up into a related-forms table.

## Mnemonics live in tables

Do not append free-text `**Mnemonic:**` paragraphs after a table (that leftover is editor layout, not a learner cue). Put mnemonics in a dedicated column of that table so each row carries its own memory hook. For tables whose rows come from the [vowel series](../grammar/vowel-series.md), the mnemonic column shows how **`a`** / **`o`** / **`e`** / **`u`** maps to that row’s meaning. Metaphor emoji may serve as the visual hook, consistent with published-root conventions.

If a page has several such tables, give each its own mnemonic column; never summarize the whole series once in prose and leave later tables bare.

## Empty or pointless bands
<a id="empty-bands"></a>

**Omit** `## Advanced` (or `## Intermediate`) when the rubric’s third question is no: there is no new edge-case, stylistic, or rare inventory. Recap tables, unused-slot lists, “reminder” restatements of earlier bands, and Design-notes dumps do **not** earn a later band. Fold anything still needed into the last band that actually teaches, or drop it.

Do **not** keep a heading whose only job is to say there is nothing here. Learners skip missing bands on the [cross-doc path](learning-levels.md#cross-doc-path). Material that did not make a band belongs in [unassigned-reserved.md](unassigned-reserved.md) or [TODO.md](../../TODO.md), not in a stub appendix on the page.

**Bounce notes are empty bands.** Do not open a page with `## Beginner` (or a pre-band lead) that only says “nothing here / come back when you are ready for Intermediate / this page is Advanced.” Omit the unused band heading. A page that starts at Intermediate or Advanced is fine; the sidebar path already skips missing bands. Do not duplicate the same recap (“house rules,” writing-style bullets) in a later band just to fill Advanced.

## Examples use the house cast
<a id="house-cast"></a>

Example sentences name their people with the [house cast](glosses.md#house-cast): **`zazawan`** / **`zululon`** / **`zuhubun`** (three single-root names). Do not cast abstract roots as participants (`jal zazawan godogol`, not “grace is more challenging than courage”). Keep abstract roots for the form being taught.

## Punctuation

Prefer commas, colons, parentheses, or separate sentences over em dashes. An em dash is allowed only when a sentence genuinely needs a strong break; do not use it as default clause glue.

## Page skeleton

1. **Title + one-line job** — the English job this page teaches (learner-facing). Sibling links only when the learner will reach for that form *now* — [Compare with](#compare-with), not “this page owns / does not own” fencing.
2. **Needs** (optional) — **rare.** Use only when the page is late and the dependency is not obvious from the [cross-doc path](learning-levels.md#cross-doc-path) (e.g. causation → joins + **`orodo`** from core Beginner; comparatives → rank joins). Label as `**Needs:**` with one short link line. Do **not** ritualize “core Beginner; reference-suffix Beginner” on every page.
3. **`## Beginner` / `## Intermediate` / `## Advanced`** — per [learning-levels.md](learning-levels.md). Include **Advanced** only when that page has rare inventory to teach ([empty or pointless bands](#empty-bands)).
4. Inside each band: **concept → rule in one breath → 1–3 examples → (optional contrast) → full table if needed**.
5. Optional **See also** at the end — a few precise related forms only; no long link walls in the lead (and no lead preview of later peers — [teach now; don’t preview later](#teach-now-dont-preview-later)).

Front matter that orients (psychological purpose / limits / feature criteria / benefit tour — [why-agelan.md](../grammar/why-agelan.md); grammar design / how to learn — [introduction.md](../grammar/introduction.md)) is not a learning band. Reading order lives in the path / sidebar — not repeated as Prerequisites.

## Teach in this order

| Order | Content |
|-------|---------|
| 1 | What you can *do* (English job) |
| 2 | The Agalan shape (minimal pattern) |
| 3 | A **mnemonic** so the form sticks (Beginner; below) |
| 4 | Worked example(s) |
| 5 | [Compare with](#compare-with) — **only the form they would use for this English** |
| 6 | Inventory / edge cases |

Do not open a section with a complete paradigm table. Tables come after the pattern is usable.

## Mnemonics

Every **Beginner** teaching gets a **mnemonic** — something that makes the form memorable, not only grammatical. Intermediate / Advanced inventories need not invent a cue per cell.

Usual sources (prefer one; reuse the language’s own systems):

| Source | When |
|--------|------|
| **Metaphorical / lexicon sense** | Closed roots and overlays (`amala` ➡️ *east* → *therefore*; **`SAME`**, **`COMMENT`**, …) |
| **Vowel series** | Join / speech act / polar stacks that share letter jobs (`a` inventory, `o` menu, `e` rank, `u` negation, …) |
| **Ending letters** | **-l** / **-m** / **-n** / **-r** (and stance endings) when the ending *is* the lesson |

One short cue is enough (table column, parenthetical, or a line under the rule). Do not invent a second mnemonic system beside metaphor, vowels, and endings when those already explain the form.

## Voice and length

- Address the learner in second person (“use **-r** when…”, “prefer names when…”). That *you* is English pedagogy — not Agalan **`ebone`**.
- Teaching bands do not use maintainer *we* (“we now write…”) or author *I*. Author *I* is allowed only on signed non-teaching prose in this folder (acknowledgments; the purpose / limits essay), not on rule pages.
- One idea per H2/H3; the first paragraph should be roughly one short explanation (same bar as the [easy-to-use feature criterion](../grammar/why-agelan.md#criterion-for-features)).
- Prefer short paragraphs plus a table over a wall of prose.
- Bold sparingly; put Agalan forms in backticks (`jal`, **-r**, `/ɡ/`).
- Always call the language **Agalan**. Community / project URLs that still use a legacy host path are fine when they are the real link; do not “fix” them in learner prose.

## Plain language (no assumed linguistics)

Do **not** assume the reader knows linguistics jargon. Write for a motivated learner with ordinary school grammar (*subject*, *verb*, *adjective*), not for a linguistics seminar.

| Do | Don’t |
|----|--------|
| Prefer everyday English for the job (*statement*, *ask*, *main clause*, *at the end of…*) | Lead with bare terms like *assertoric*, *illocution*, *matrix-final*, *predicative*, *prosody*, *paradigm* |
| If a short technical label helps later cross-links, **define it in the same breath** on first use | Use the label alone and hope context teaches it |
| Keep Agalan-invented labels that the page is teaching (`speech act`, *turn* vs *continue*) and gloss them once | Stack several undefined jargon words in one sentence |
| School-grammar words (*subject*, *direct object*, *adverb*) are fine when the English job is clear | Pack morphosyntax shorthand (*zero-copula*, *right-bound*, *adjunct*, *complement clause*) without a plain gloss |

**Test:** would a careful reader who never took a linguistics class still get the rule from the first paragraph and the example? If not, rewrite the lead in plain words and demote the technical term to a parenthetical or a later Intermediate note.

Section ids should match the **current** ordinary name (`speech-act`). A silent extra id on the same heading is fine until an editor pass removes it; do not mention the old fragment in prose.

## Examples

| Do | Don’t |
|----|--------|
| Minimal clause that shows *only* the new point | Kitchen-sink showcases in Beginner |
| Published roots when the gloss matches; `PoS<…>ENDING` for donor spelling | Invented “lexicon-shaped” stems, a closed overlay with its own frozen spelling, or split/hyphenated PoS tokens in learner text |
| Named [house people](#house-cast) when the clause needs a person | Default *I* / *you* (`zugobon` / `zebonen`) as dummy subjects |
| Omit recoverable **`jal`** when the page is not teaching the speech act | Leading every example with **`jal`** by habit |
| Morph gloss + **loose** free English by default ([glosses.md](glosses.md)) | Merging free English into the morph gloss |
| Strict free English only when teaching packaging | Strict-only Beginner pages |
| A negative / **Not this** only for an **expected** learner mistake | Listing “no X” or a counter-example column by habit |

### House people
<a id="house-cast"></a>

When an example needs a **person**, use these nativized names (published root + **-n**). Free English keeps *Azawan*, not *Grace* / *I* / *you*.

| Agalan | English | Root |
|--------|---------|------|
| `zazawan` | *Azawan* | `azawa` *grace* |
| `zululon` | *Ululon* | `ululo` *courage* |
| `zuhubun` | *Uhubun* | `uhubu` *beauty* |

**`ugobo` / `ebone`** only when that page is teaching those specials, the point is the **discourse role** (name unavailable, address set, clusivity), or a closed construction is keyed to speaker/listener (*Mine* **`zugoboxrawon`**, viewpoint *my left* when the anchor is the role). Inclusive *we* stays **`ahage`**; nonspecific *someone* stays **`enenu`**. Foreign `PoS<…>n` names only when teaching loans or spans. Checkpoints: [translation-exercises.md](translation-exercises.md#principles). Morph / resume: [glosses.md](glosses.md#house-cast).

Default example block:

```
`zazawan godogol.`

gloss: `z-grace` · `g-dog`

*Azawan is a dog.*
```

Short Eng ↔ Agalan checkpoints: end of a page band only — [translation-exercises.md](translation-exercises.md). Multi-turn practice belongs under [examples/](../examples/), not inside every grammar section.

## Contrasts and boundaries

State the **positive** rule. Do **not** list negatives by default — neither a **Not this** column nor inline “no X / don’t Y / never Z.”

| Prefer | Avoid (unless the trap is real) |
|--------|----------------------------------|
| Write **prefix + root + ending** as one token: `zazawan` | “…as one token — **no hyphen** after the PoS letter” |
| Vocatives sit in the left-edge cluster | “Vocatives **do not** appear mid-clause” *with no learner reason to try that yet* |

**Negatives earn their keep only when** a learner is expected to make that mistake — typically an English false friend, or another Agalan construction they will reach for. Then one decisive contrast (sentence or table cell) with the right link is enough. Cross-link once; do not restate the other doc.

Agalan often earns them: sibling-subsystem swaps (`-sh` vs **`ahage`**, classification vs **`SAME`**, free `g+e` vs `ROOTx+e`, join **-r** vs content **-r**). Label those with [Compare with](#compare-with), not *Trap* / *Near miss* / “do not confuse,” and not a table of every neighbor.

**Skip negatives when:**

- The wrong form is something a learner would not invent (editor-hygiene pairs like hyphenated PoS, ~~`z-ugobo`~~).
- The negative only restates the positive rule (“write one token” already implies no hyphen).
- A section would get a ritual **Not this** (or a permanent **Not this** column) with nothing decisive to say.

Do **not** require a **Not this** column on every table, or a counter-example on every form. A strong positive example is enough when there is no sibling to compare.

## Tables

- Contrast and decision tables beat encyclopedia dumps in Beginner. A decision table is **this** form’s own readings (endings, vowel series), not a list of other pages.
- Full inventories belong in Intermediate / Advanced, or after the teach block.
- Prefer columns **Form · Job · Example** (or **Reading**) for **this** form. Add a Morph column only when endings are the point. Add **Not this** only when several rows share real confusables — not by default. Do not add a **Form · Job** table of related subsystems.
- A grammar-table **Gloss** column is short free English unless the row teaches morphology ([glosses.md](glosses.md)).

## Cross-links and scope

- Own your subsystem; link out for PoS, endings, joins, numbers, and so on — **only to other files in `docs/grammar/`**.
- Never link to or mention `meta/`, `examples/`, `proposals/`, `data/`, or repo-root files from a grammar page.
- One canonical anchor per concept (`<a id="…">`); keep ids stable.
- Do not dump the whole related-inventory into the lead paragraph.
- **IPA and pronunciation** belong only in [phonology.md](../grammar/phonology.md). Grammar docs use orthographic letters (`j`, `x`, `/j/`, `/x/`) — never IPA transcriptions or sound cues. If a learner needs how a letter sounds, link once to phonology (peer in `grammar/`).

### Teach now; don’t preview later
<a id="teach-now-dont-preview-later"></a>

In each section, mention **only what that section is teaching**. Do not name, teaser, or deep-link subsystems the learner meets later on the [cross-doc path](learning-levels.md#cross-doc-path).

| Keep | Cut / demote |
|------|----------------|
| One peer link when the learner **already** met the form, or when a sibling they will reach for *now* needs a [Compare with](#compare-with) beat | “You’ll later learn…”, “full treatment in…”, ownership fences (“this page owns / does not own X”), and “X **stays on** Y” ([which tool, not which owner](#which-tool-not-which-owner)) |
| Rare **Needs:** when the dependency is not obvious from the path | Ritual prereq walls and long **See also** lists in the lead |
| Same-page deferrals (“X is Intermediate ([…])”) | Peek-ahead to a **later peer’s** Intermediate / Advanced in Beginner prose |
| Optional short **See also** at the **end** (a few precise related forms) | Link walls that restate the sidebar path or dump every related peer |

**Test:** if the sentence’s only job is to name a topic the path has not reached yet, delete it. If it resolves a trap the learner will hit *now*, one link is enough — do not restate the other doc.

Pages stay dual-role (learner text + source of truth): Intermediate / Advanced inventories and precise end anchors are fine when the *lead and Beginner teach block* stay slim. If an Advanced inventory dwarfs the Beginner teach block, split the file.

## What belongs where

| Material | Place |
|----------|--------|
| How to use the form | Grammar doc body under **`docs/grammar/`** (banded **Beginner** / **Intermediate** / **Advanced**) |
| Gloss format | [glosses.md](glosses.md) |
| Level rubric / reading order | [learning-levels.md](learning-levels.md) ([cross-doc path](learning-levels.md#cross-doc-path)) |
| Doc prose / example style | This page |
| Goals / feature criteria | [why-agelan.md](../grammar/why-agelan.md) (psych); [introduction.md](../grammar/introduction.md) (grammar design) |
| Core sentence grammar | [core.md](../grammar/core.md) |
| IPA / pronunciation / phonotactics | [phonology.md](../grammar/phonology.md) (only page that may use IPA) |
| Unassigned / unused-slot inventory | [unassigned-reserved.md](unassigned-reserved.md) — **never** a grammar-page row, drill, or “reserved” gloss |
| Parser / CLI / site implementation notes | Code and `docs/meta/` — not titles, leads, or “house rules” on grammar pages |
| Rejected or speculative features | [TODO.md](../../TODO.md) |
| Short Eng ↔ Agalan checkpoint | End of a page band — [translation-exercises.md](translation-exercises.md); generate via [drill-generation.md](drill-generation.md) |
| Multi-turn practice | [examples/](../examples/) (not linked from grammar pages) |
| Editor pedagogy / migration notes | `docs/meta/` only — never from grammar pages |

## Banding checklist

Before tagging a section **Beginner**, ask the [three questions](learning-levels.md#rubric-three-questions). Prefer the earlier band when learners need the form to read ordinary examples. Dependency on another subsystem beats “feels hard.” Do not add Advanced for recap, unused-slot lists, bounce notes, or reminders — [empty or pointless bands](#empty-bands).

## Markdown hygiene

After editing Markdown under `docs/` (or `AGENTS.md` / `TODO.md`), run **`npm run lint:md`**. It checks emphasis balance, slash-joined emphasis, and internal links / anchors. Prefer spaces in slash-joined emphasis (`*a* / *b*`) over `*a*/*b*`. In bold headings or bullets, put forms in backticks only (`**Ranked (`e` / `ae`)**`), not nested bold inside bold.

# Open style questions
- consolidate final word shape into a single place instead of a bunch of places where it is either incomplete or uses unlearned forms