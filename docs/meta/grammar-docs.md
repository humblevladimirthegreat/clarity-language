# Grammar doc style (for learners)

How to write Agelan **grammar docs** under **`docs/grammar/`** so a learner can use them. Applies **only** to that folder (not to `meta/`, `examples/`, or `proposals/`). Design authority for morphology stays in those pages (core sentence grammar: [core.md](../grammar/core.md)); this page standardizes **pedagogy and prose** only.

Grammar pages must **not** link to or mention `meta/` or any other folder outside `grammar/` — only peer links inside `grammar/`. Editors follow this page, [learning-levels.md](learning-levels.md), and [translation-exercises.md](translation-exercises.md) privately.

Related meta:

| Page | Owns |
|------|------|
| [learning-levels.md](learning-levels.md) | **Beginner** / **Intermediate** / **Advanced** banding rubric and [cross-doc path](learning-levels.md#cross-doc-path) (for `docs/grammar/` only) |
| [glosses.md](glosses.md) | Morph glosses and free English ([house-name glosses](glosses.md#house-cast)) |
| [translation-exercises.md](translation-exercises.md) | Eng ↔ Agelan checkpoints (placement, principles including house-cast people, spoiler shape) |
| [drill-generation.md](drill-generation.md) | Path allowlist and execute procedure (one file per agent) |

## Dual role

Each grammar page is both **source of truth** for its subsystem and **learner text**. Prefer teach-first structure over inventory-first dumps in **Beginner**. **Advanced may be inventory-first**; if Advanced dwarfs Beginner, split the file. Unassigned or rejected design stays in [TODO.md](../../TODO.md) or a short **Design notes** appendix — not in Beginner sections.

## Present the current language only

Write as if this is the only version the reader will ever see.

| Do | Don’t |
|----|--------|
| State the rule as it is now | Mention prior wordings, renamed labels, or “used to be called…” |
| Use the current term once, clearly | Add redirects for superseded names |
| Fix outdated prose in place | Leave “correction trails” that only make sense to editors |

The learner should never need the editing history of the docs.

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

**Test:** if you delete the phrase and a new learner loses no meaning, delete it. If the only audience for a sentence is a future editor, move it to `TODO.md`, a PR, or this meta page — not the grammar body.

## Page skeleton

1. **Title + one-line job** — the English job this page teaches (learner-facing). Sibling links only for real near-misses — not “this page owns / does not own” fencing.
2. **Needs** (optional) — **rare.** Use only when the page is late and the dependency is not obvious from the [cross-doc path](learning-levels.md#cross-doc-path) (e.g. causation → joins + **`odo`** from core Beginner; comparatives → rank joins). Label as `**Needs:**` with one short link line. Do **not** ritualize “core Beginner; reference-suffix Beginner” on every page.
3. **`## Beginner` / `## Intermediate` / `## Advanced`** — per [learning-levels.md](learning-levels.md).
4. Inside each band: **concept → rule in one breath → 1–3 examples → (optional contrast) → full table if needed**.
5. Optional **See also** at the end — a few precise near-misses only; no long link walls in the lead (and no lead preview of later peers — [teach now; don’t preview later](#teach-now-dont-preview-later)).

Front matter that orients (psychological purpose / limits / feature criteria / benefit tour — [why-agelan.md](../grammar/why-agelan.md); grammar design / how to learn — [introduction.md](../grammar/introduction.md)) is not a learning band. Reading order lives in the path / sidebar — not repeated as Prerequisites.

## Teach in this order

| Order | Content |
|-------|---------|
| 1 | What you can *do* (English job) |
| 2 | The Agelan shape (minimal pattern) |
| 3 | A **mnemonic** so the form sticks (Beginner; below) |
| 4 | Worked example(s) |
| 5 | Contrast with near-misses — **only when there is a real trap** (below) |
| 6 | Inventory / edge cases |

Do not open a section with a complete paradigm table. Tables come after the pattern is usable.

## Mnemonics

Every **Beginner** teaching gets a **mnemonic** — something that makes the form memorable, not only grammatical. Intermediate / Advanced inventories need not invent a cue per cell.

Usual sources (prefer one; reuse the language’s own systems):

| Source | When |
|--------|------|
| **Metaphorical / lexicon sense** | Closed roots and overlays (`amala` ➡️ *right* → *therefore*; **`SAME`**, **`COMMENT`**, …) |
| **Vowel series** | Join / force / polar stacks that share letter jobs (`a` inventory, `o` menu, `e` rank, `u` negation, …) |
| **Ending letters** | **-l** / **-m** / **-n** / **-r** (and stance endings) when the ending *is* the lesson |

One short cue is enough (table column, parenthetical, or a line under the rule). Do not invent a second mnemonic system beside metaphor, vowels, and endings when those already explain the form.

## Voice and length

- Address the learner in second person (“use **-r** when…”, “prefer names when…”). That *you* is English pedagogy — not Agelan **`ehado`**.
- One idea per H2/H3; the first paragraph should be roughly one short explanation (same bar as the [easy-to-use feature criterion](../grammar/why-agelan.md#criterion-for-features)).
- Prefer short paragraphs plus a table over a wall of prose.
- Bold sparingly; put Agelan forms in backticks (`jal`, **-r**, `/ɡ/`).
- Always call the language **Agelan**.

## Plain language (no assumed linguistics)

Do **not** assume the reader knows linguistics jargon. Write for a motivated learner with ordinary school grammar (*subject*, *verb*, *adjective*), not for a linguistics seminar.

| Do | Don’t |
|----|--------|
| Prefer everyday English for the job (*statement*, *ask*, *main clause*, *at the end of…*) | Lead with bare terms like *assertoric*, *illocution*, *matrix-final*, *predicative*, *prosody*, *paradigm* |
| If a short technical label helps later cross-links, **define it in the same breath** on first use | Use the label alone and hope context teaches it |
| Keep Agelan-invented labels that the page is teaching (`clause force`, *turn* vs *continue*) and gloss them once | Stack several undefined jargon words in one sentence |
| School-grammar words (*subject*, *direct object*, *adverb*) are fine when the English job is clear | Pack morphosyntax shorthand (*zero-copula*, *right-bound*, *adjunct*, *complement clause*) without a plain gloss |

**Test:** would a careful reader who never took a linguistics class still get the rule from the first paragraph and the example? If not, rewrite the lead in plain words and demote the technical term to a parenthetical or a later Intermediate note.

Stable section ids and cross-doc anchor names may keep older technical wording (`matrix-final`, `clause-force`); the **prose the learner reads** still has to explain the idea in ordinary English.

## Examples

| Do | Don’t |
|----|--------|
| Minimal clause that shows *only* the new point | Kitchen-sink showcases in Beginner |
| Published roots when the gloss matches; `PoS<…>ENDING` for donor spelling | Split or hyphenated PoS tokens in learner text |
| Named [house people](#house-cast) when the clause needs a person | Default *I* / *you* (`zumogon` / `zehadon`) as dummy subjects |
| Omit recoverable **`jal`** when the page is not teaching force | Leading every example with **`jal`** by habit |
| Morph gloss + **loose** free English by default ([glosses.md](glosses.md)) | Merging free English into the morph gloss |
| Strict free English only when teaching packaging | Strict-only Beginner pages |
| A negative / **Not this** only for an **expected** learner mistake | Listing “no X” or a counter-example column by habit |

### House people
<a id="house-cast"></a>

When an example needs a **person**, use these nativized names (published root + **-n**). Free English keeps *Azawan*, not *Grace* / *I* / *you*.

| Agelan | English | Root |
|--------|---------|------|
| `zazawan` | *Azawan* | `azawa` *grace* |
| `zulonun` | *Ulonun* | `ulonu` *courage* |
| `zubuzun` | *Ubuzun* | `ubuzu` *beauty* |

**`umogo` / `ehado`** only when that page is teaching those specials, the point is the **discourse role** (name unavailable, address set, clusivity), or a closed construction is keyed to speaker/listener (*Mine* **`zumogoxrawon`**, viewpoint *my left* when the anchor is the role). Inclusive *we* stays **`ana`**; nonspecific *someone* stays **`enu`**. Foreign `PoS<…>n` names only when teaching loans or spans. Checkpoints: [translation-exercises.md](translation-exercises.md#principles). Morph / resume: [glosses.md](glosses.md#house-cast).

Default example block:

```
`zazawan gedagel.`

gloss: `z-grace` · `g-teacher`

*Azawan is a teacher.*
```

Short Eng ↔ Agelan checkpoints: end of a page band only — [translation-exercises.md](translation-exercises.md). Multi-turn practice belongs under [examples/](../examples/), not inside every grammar section.

## Contrasts and boundaries

State the **positive** rule. Do **not** list negatives by default — neither a **Not this** column nor inline “no X / don’t Y / never Z.”

| Prefer | Avoid (unless the trap is real) |
|--------|----------------------------------|
| Write **prefix + root + ending** as one token: `zazawan` | “…as one token — **no hyphen** after the PoS letter” |
| Vocatives sit in the left-edge cluster | “Vocatives **do not** appear mid-clause” *with no learner reason to try that yet* |

**Negatives earn their keep only when** a learner is expected to make that mistake — typically an English false friend, or another Agelan construction they will reach for. Then one decisive contrast (sentence or table cell) with the right link is enough. Cross-link once; do not restate the other doc.

Agelan often earns them: sibling-subsystem swaps (`-sh` vs **`ana`**, classification vs **`SAME`**, free `g+e` vs `ROOTx+e`, join **-r** vs content **-r**).

**Skip negatives when:**

- The wrong form is something a learner would not invent (editor-hygiene pairs like hyphenated PoS, ~~`z-umogo`~~).
- The negative only restates the positive rule (“write one token” already implies no hyphen).
- A section would get a ritual **Not this** (or a permanent **Not this** column) with nothing decisive to say.

Do **not** require a **Not this** column on every table, or a counter-example on every form. A strong positive example is enough when there is no near-miss.

## Tables

- Contrast and decision tables beat encyclopedia dumps in Beginner.
- Full inventories belong in Intermediate / Advanced, or after the teach block.
- Prefer columns **Form · Job · Example** (or **Reading**). Add a Morph column only when endings are the point. Add **Not this** only when several rows share real confusables — not by default.
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
| One peer link when the learner **already** met the form, or when resolving a **real near-miss** they will invent *now* | “You’ll later learn…”, “full treatment in…”, and ownership fences (“this page owns / does not own X”) |
| Rare **Needs:** when the dependency is not obvious from the path | Ritual prereq walls and long **See also** lists in the lead |
| Same-page deferrals (“X is Intermediate ([…])”) | Peek-ahead to a **later peer’s** Intermediate / Advanced in Beginner prose |
| Optional short **See also** at the **end** (a few precise near-misses) | Link walls that restate the sidebar path or dump every related peer |

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
| Unassigned or rejected design | [TODO.md](../../TODO.md) or a short **Design notes** appendix on the grammar page |
| Short Eng ↔ Agelan checkpoint | End of a page band — [translation-exercises.md](translation-exercises.md); generate via [drill-generation.md](drill-generation.md) |
| Multi-turn practice | [examples/](../examples/) (not linked from grammar pages) |
| Editor pedagogy / migration notes | `docs/meta/` only — never from grammar pages |

## Banding checklist

Before tagging a section **Beginner**, ask the [three questions](learning-levels.md#rubric-three-questions). Prefer the earlier band when learners need the form to read ordinary examples. Dependency on another subsystem beats “feels hard.”

## Markdown hygiene

After editing Markdown under `docs/` (or `AGENTS.md` / `TODO.md`), run **`npm run lint:md`**. It checks emphasis balance, slash-joined emphasis, and internal links / anchors. Prefer spaces in slash-joined emphasis (`*a* / *b*`) over `*a*/*b*`. In bold headings or bullets, put forms in backticks only (`**Ranked (`e` / `ae`)**`), not nested bold inside bold.

# Style guidance notes
- reduce stating negatives "it's X, not Y" "X is done this way. Y is a different form". Decide rules for determining whether we should state contrastive negatives
- avoid em dash
-analyze the manual changes from git to detect patterns
- avoid mentioning something comes in a later stage
- consolidate final word shape into a single place instead of a bunch of places where it is either incomplete or uses unlearned forms
- if there is a TODO item, then try to resolve that item is there is a clear action. If it says to consider doing something, then present options to the user in the chat window (leave the TODO unchanged in the doc)