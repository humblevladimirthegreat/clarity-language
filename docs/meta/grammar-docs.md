# Grammar doc style (for learners)

How to write Clarity **grammar docs** so a learner can use them. Design authority for morphology stays in those pages and [language-reference.md](../language-reference.md); this page standardizes **pedagogy and prose** only.

Related meta:

| Page | Owns |
|------|------|
| [learning-levels.md](learning-levels.md) | **Beginner** / **Intermediate** / **Advanced** banding rubric |
| [glosses.md](glosses.md) | Morph glosses and free English |

## Dual role

Each grammar page is both **source of truth** for its subsystem and **learner text**. Prefer teach-first structure over inventory-first dumps. Unassigned or rejected design stays in [TODO.md](../../TODO.md) or a short **Design notes** appendix — not in Beginner sections.

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

1. **Title + one-line job** — what this page owns (and what it does not).
2. **Prerequisites** — one to three links (“needs Beginner [reference-suffix](../reference-suffix.md) and [pronouns](../pronouns.md)”).
3. **`## Beginner` / `## Intermediate` / `## Advanced`** — per [learning-levels.md](learning-levels.md).
4. Inside each band: **concept → rule in one breath → 1–3 examples → (optional contrast) → full table if needed**.
5. Optional **See also** at the end — no long link walls in the lead.

Front matter that orients (goals, feature criteria on the language reference) is not a learning band.

## Teach in this order

| Order | Content |
|-------|---------|
| 1 | What you can *do* (English job) |
| 2 | The Clarity shape (minimal pattern) |
| 3 | Worked example(s) |
| 4 | Contrast with near-misses — **only when there is a real trap** (below) |
| 5 | Inventory / edge cases |

Do not open a section with a complete paradigm table. Tables come after the pattern is usable.

## Voice and length

- Address the learner in second person (“use **-r** when…”, “prefer names when…”).
- One idea per H2/H3; the first paragraph should be roughly one short explanation (same bar as the [easy-to-use feature criterion](../language-reference.md#criterion-for-features)).
- Prefer short paragraphs plus a table over a wall of prose.
- Bold sparingly; put Clarity forms in backticks (`jal`, **-r**, `/ɡ/`).
- Always call the language **Clarity**.

## Examples

| Do | Don’t |
|----|--------|
| Minimal clause that shows *only* the new point | Kitchen-sink showcases in Beginner |
| Published roots when the gloss matches; `PoS<…>ENDING` for donor spelling | Hyphen after the PoS letter (`zumogon`, not a split token) |
| Omit recoverable **`jal`** when the page is not teaching force | Lead every example with **`jal`** by habit |
| Morph gloss + **loose** free English by default ([glosses.md](glosses.md)) | Merge free English into the morph gloss |
| Strict free English only when teaching packaging | Strict-only Beginner pages |
| A **Not this** only for a documented confusable | A ritual counter-example (or **Not this** column) on every row |

Default example block:

```
`z<Sam>n gedagel.`

gloss: `z-Sam` · `g-teacher`

*Sam is a teacher.*
```

Multi-turn practice belongs under [examples/](../examples/), not inside every grammar section.

## Contrasts and boundaries

Counter-examples are **high value when they name a real trap**; **low value when they are mandatory padding**.

Clarity often earns them: many errors are “use the sibling subsystem” (`-sh` vs **`ana`**, classification vs **`SAME`**, free `g+e` vs `ROOTx+e`, join **-r** vs content **-r**). One decisive **Not this** with the right link often teaches faster than another positive example.

**Use a counter-example when** there is a documented confusable — an English false friend, or another Clarity construction learners will reach for. Cross-link once; do not restate the other doc.

**Skip them when:**

- The wrong form is something a learner would not invent yet (editor-hygiene pairs like ~~`z-umogo`~~ in Beginner).
- The negative line only restates the positive rule.
- A section would get a ritual **Not this** (or a permanent **Not this** table column) with nothing decisive to say.

Do **not** require a **Not this** column on every table, or a counter-example on every form. A strong positive example is enough when there is no near-miss.

## Tables

- Contrast and decision tables beat encyclopedia dumps in Beginner.
- Full inventories belong in Intermediate / Advanced, or after the teach block.
- Prefer columns **Form · Job · Example** (or **Reading**). Add a Morph column only when endings are the point. Add **Not this** only when several rows share real confusables — not by default.
- A grammar-table **Gloss** column is short free English unless the row teaches morphology ([glosses.md](glosses.md)).

## Cross-links and scope

- Own your subsystem; link out for PoS, endings, joins, numbers, and so on.
- One canonical anchor per concept (`<a id="…">`); keep ids stable.
- Do not dump the whole related-inventory into the lead paragraph.

## What belongs where

| Material | Place |
|----------|--------|
| How to use the form | Grammar doc body (banded) |
| Gloss format | [glosses.md](glosses.md) |
| Level rubric / reading order | [learning-levels.md](learning-levels.md) |
| Doc prose / example style | This page |
| Goals / feature criteria | [language-reference.md](../language-reference.md) |
| Unassigned or rejected design | [TODO.md](../../TODO.md) or **Design notes** |
| Multi-turn practice | [examples/](../examples/) |

## Banding checklist

Before tagging a section **Beginner**, ask the [three questions](learning-levels.md#rubric-three-questions). Prefer the earlier band when learners need the form to read ordinary examples. Dependency on another subsystem beats “feels hard.”

## Markdown hygiene

After editing Markdown under `docs/` (or `AGENTS.md` / `TODO.md`), run **`npm run lint:md`**. Prefer spaces in slash-joined emphasis (`*a* / *b*`) over `*a*/*b*`. In bold headings or bullets, put forms in backticks only (`**Ranked (`e` / `ae`)**`), not nested bold inside bold.
