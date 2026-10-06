# Translation exercises (editor guidance)

How to place and write **short translation drills** in learner grammar pages under **`docs/grammar/`**. Applies **only** to that folder (not to `meta/`, `examples/`, or `proposals/`). Design authority for morphology stays in the grammar pages; this page is pedagogy only.

Worked **examples** use the everyday [example root bank](drill-generation.md#root-bank). **Checkpoints** use a [setting](#checkpoint-setting) that climbs in tension; they do not recycle walk/sleep as the default plot.

Grammar pages must **not** link here or mention `meta/` — editors follow this privately. Prose / example style: [grammar-docs.md](grammar-docs.md). Learning stages: [learning-levels.md](learning-levels.md). Visible morph glosses in worked examples and checkpoint spoilers: [glosses.md](glosses.md). Generating missing checkpoints: [drill-generation.md](drill-generation.md).

## Default placement
<a id="placement"></a>

**Prefer end-of-stage (or end-of-page-stage) checkpoints, not after every feature.**

Per-feature teaching already has its practice: rule → cue → 1–3 worked examples ([grammar-docs.md](grammar-docs.md#teach-in-this-order)). Another spoiler drill after every H3 turns the page into a worksheet and breaks the skim / teach rhythm.

| Where | Job |
|-------|-----|
| **Inside each feature** | Worked examples only (house style) |
| **End of a page stage** (e.g. [clause.md Beginner](../grammar/clause.md#beginner) → [translation practice](../grammar/clause.md#beginner-translation-practice)) | Short checkpoint for *that page’s* stack |
| **End of whole Beginner / Intermediate / Advanced** (cross-doc) | Optional larger review — prefer [`examples/`](../examples/) or a dedicated practice page later; do **not** duplicate a full review on every grammar file |
| **After a real trap** | At most 1–2 items *if* English pulls the wrong Agazan shape (e.g. *because* as a verb, a general *to be*, opaque `<>` when the page is not teaching loans) |

**When to add a stage checkpoint:** if the learner can misuse the form in the *next* section’s examples, put drills at the **end of this stage**. If the form is mostly recognition (a small closed table), the worked example is enough.

**Covuzo:** every **productive** page stage gets a checkpoint. Orientation, phonology charts, and parser maps do not — [allowlist](drill-generation.md#allowlist) **skip**. Do **not** add a spoiler block after every H3. Named settings in use: [settings](drill-generation.md#settings).

**Status:** all **generate** checkpoints **exist** (see [allowlist](drill-generation.md#allowlist)). Invoke [drill-generation.md](drill-generation.md#execute) **one grammar file per agent** only to **replace** a checkpoint.

## What belongs where
<a id="what-belongs-where"></a>

| Material | Place |
|----------|--------|
| Rule + worked example | Grammar section body |
| Short Eng ↔ Agazan checkpoint | End of that page’s **Beginner** / **Intermediate** / **Advanced** stage |
| Practice for a recipe | `## Practice` at the end of that `say-*.md` page ([recipe track](grammar-docs.md#recipe-track)); same principles, not a stage checkpoint |
| Multi-turn dialogue practice | [`examples/`](../examples/) — not inside every grammar section; grammar pages do not link there |
| Cross-doc “finish the whole level” review | Optional later; not required on each peer page |

## Drill principles
<a id="principles"></a>

1. **One new stack per item** — recycle prior stage **morphology**; do not introduce a *construction* the section has not taught. Setting **content** roots may be new (listed in the checkpoint table) if they are published; they do not have to appear in teaching examples.
2. **Both directions** — English → Agazan (production) and Agazan → English (parsing). Production is harder; keep those items shorter / fewer if the set grows.
3. **Directions are not mirrors** — no Agazan → English item may be the same proposition as any English → Agazan item on that checkpoint (same participants + same verb + same extra morph). Production tests this stage’s new morph in a short sentence. Parsing uses a **different packaging** of the same morph (legal order scramble, omitted recoverable **`yal`**, a denser nest, resume **-r**, an English false friend) or an **offset scene** (same setting, different who-does-what). Recognition-only traps (*because* as a verb, classification vs identity) belong in Agazan → English, not as production clones. Parsing may be one clause or one extra `/ɡ/` longer than production; do not invert the production list.
4. **Pure Agazan in early checkpoints** — published roots and closed specials only; `PoS<…>ENDING` / opaque spans only when the page is teaching loans or spans. Mention spans keep the **Agazan spelling** in morph; free English is *the word “…”* / *the phrase “…”* ([glosses.md](glosses.md#span-interiors)). *Said “X”* is **cite**, not mention. Cite **`@`** is the **work** (one-word work is ordinary **-n**, not `d@[onodan]`). The mention marker **`glelen`** is the **name**, including a one-word name (`glelen d<uzugon>`).
5. **Spoiler answers** — VitePress `::: details Show answer` (or a clear custom label). The answer is the Agazan sentence or **loose** free English, plus a **morph gloss** line when `lint:agazan` does not treat parser output as redundant with that loose line ([glosses.md](glosses.md#example-block) format — roman `z-Azawan | v-sit`, not `gloss:`). **English → Agazan:** Agazan line, blank line, morph (when required). **Agazan → English:** morph (when required), blank line, loose English (Agazan stays on the prompt). When a morph line is present, `lint:agazan` compares it to the [parser](glosses.md#role-english) (`v-see` when packed).
6. **Small sets** — about **6–12 items per direction** max per stage checkpoint. Put this checkpoint’s setting vocab in an **English · Agazan** table once above the drills. Whenever **Same root as** is empty, **Agazan** is the [citation](../grammar/word-endings.md#citation-forms) (`agayal` *climb*, not `vagayal`). Fill **Same root as** when this row’s **English** is not that citation’s lemma; then **Agazan** is still a citation of *this* sense (`agawam` *volume*, `abahem` *force*) unless the English only matches with a role letter (`vahahal` *see* / `` `ahahal` *eye* ``). **Cue** is optional memory helper — never the English to produce; never a mid-dot prose list. Do not repeat the How-to-learn column legend on later banks. Do not default that table to *walk* / *sleep* / *dog*.
7. **Setting vocab, not example glue** — the [example root bank](drill-generation.md#root-bank) is for **worked examples** on grammar pages (*walk*, *sleep*, *dog*, *house*, …). Each **checkpoint** names one [setting](#checkpoint-setting) and uses **setting** content roots (plus house names). Those roots need not match the example bank. Certify each new content root in [lexicon-published.csv](../../data/lexicon-published.csv) (or overlays / compounds when that English is a hosted overlay or lemma). Do **not** edit teaching examples just to seed drills. Do **not** invent stems.
8. **Test the decision, not the dictionary** — good items force a choice this stage taught (role letter, **-l** / **-m**, **`darl` last**, omit recoverable **`yal`**, …). The setting is packaging; the morph is the test.
9. **Single sentences** — leave multi-turn scenes to [`examples/`](../examples/). Escalation is a sequence of **separate** items, not a dialogue.
10. **People are names** — default people use the [house cast](grammar-docs.md#house-cast) (`zazawan`, `zalahen`, `zahaben`) or a name already on the page, not **`amu`** / **`eho`**. English items use those names (*Azawan withdraws cash*). Speaker/listener specials only when the item is teaching those roots, or when the point is the discourse role (name unavailable, address set, clusivity). Inclusive *we* stays **`aha`**. Do not introduce foreign `PoS<…>n` names in early checkpoints. Cast and scene for checkpoints: [house scene](#house-scene). When the learner is the speaker (*I*), use the **`SELF`** name slot (`zSELFn`, bank row `*your name*` / `` `SELFn` ``) from word-endings Beginner on ([first person](grammar-docs.md#house-cast)); keep it to items where the reader plausibly is the speaker.
11. **Plausible scenes** — every prompt is something a person or animal could actually do **in this setting**. Do **not** write surreal props-as-agents (*a book sleeps*, *the blue house sings*). Tension is rivalry, composure, and stakes in the setting — not cartoon physics. If the page’s stack is not a people scene (citation-only, number charts, span fences), keep items plausible for *that* decision; escalate *sense* (plain kind → titled handle → loaded name) rather than forcing a heist.
12. **Escalate tension** — each direction’s numbered list **climbs** inside the setting (ordinary errand → strain → peak). At least the last third of the items should be clearly higher-stakes than the first third. Every item still tests **this** stage’s decision. Do not make the peak a morph trap (English homograph, untaught overlay). Do not mock appearance. Do not lecture the plot in spoilers.

## Checkpoint setting
<a id="checkpoint-setting"></a>

One **setting** per `### Translation practice` block (each stage checkpoint is its own block). Name it in one short learner line under the heading (e.g. **Setting:** a bank). Do not write a story paragraph.

| Rule | Detail |
|------|--------|
| **Scope** | All items in **both** directions take place in that setting (same place, institution, or occasion). Parsing is not a different world; it is a different packaging / who-does-what in the **same** setting. |
| **Arc** | Item **1** is ordinary activity in that place. Later items raise tension. The last items are the peak (threat, betrayal, disaster, robbery, confession — still a single legal sentence). Example: bank → count cash / wait in line → an alarm / a lie → a robbery. |
| **Independent climbs** | English → Agazan and Agazan → English each climb on their own. They must not be the same propositions ([principle 3](#principles)), so they must not be the same heist beat-for-beat. |
| **Unique setting** | Each checkpoint’s **Setting** line must be a place or occasion **not used on any other checkpoint**. Check the inventory in [settings](drill-generation.md#settings) before picking; write the chosen phrase into that table when you replace. Same occasion under a different article or synonym counts as reuse (*a bank* / *the bank* / *a teller line*). House names are not a setting. Allowlist **skip** rows and **unset** cells do not occupy a name. |
| **Vocab** | The **Roots used here** table is exactly this setting’s lexicon: every content root the items use (house names included), and nothing they do not use. `build` checks both directions. Closed morphs and overlays (`darl`, **`yal`**, join vowels, `thovum`, …) appear in spoilers when taught; they need a table row only when the drill English is that word, and such a row must still be used. |
| **Morph vs content** | Untaught **syntax** is still illegal. Untaught **content** roots are legal if published and in the table. Prefer a published **concrete** that matches the English; **-m** only when the drill English is the abstract sense. |
| **Peak without gore** | Violence and crime are allowed as **acts people do** (punch, fight, rob, scream). Do not make death, torture, or sexual content the joke. Animals stay agents only when a real animal could do that act. |

Worked examples on the grammar page stay in the [example root bank](drill-generation.md#root-bank). Do not rewrite teach lines to match the checkpoint setting.

## House scene (checkpoints)
<a id="house-scene"></a>

Checkpoint English and Agazan **imply** this cast. Do not lecture it in spoilers or captions. Do not put this paragraph on grammar pages (those still use names only).

| Name | Root sense | Checkpoint stance |
|------|------------|-------------------|
| **Ahaben** (`ahaben`) | *beauty* (🌺 hibiscus) | A **womahan**. She is the person Azawan and Alahen want to impress; in the setting she is often *seen*, *told*, or the one the stakes are *for* — the occasion, not the rival. |
| **Azawan** (`azawan`) | *grace* (🦢 swan) | **Non-binary**. Competes for Ahaben’s affection by staying too composed **in this setting**: waits, tells, sits, follows the ordinary procedure. Polite while Alahen escalates. |
| **Alahen** (`alahen`) | *courage* (🦁 lion) | A **man**. Competes by treating the setting as a dare: the one who runs the alarm, throws the punch, or attempts the robbery. Bravery that invents a threat. |

**English pronouns match Agazan pronouns only.** A name word (`zazawan`, `dahaben`, vocative `yahaben`) is *Azawan* / *Ahaben* in English — never *they* / *her*. Use *they* / *them* (Azawan), *he* / *him* (Alahen), or *she* / *her* (Ahaben) **only** when the Agazan form is a pronoun: a resume **-r**, a role pointer, or the specials **`amu` / `eho` / `aha` / `una`**, and only on a checkpoint that is teaching those. Parentheticals follow the same rule (*calling Ahaben*, not *calling her*). Dummy *I* / *you* for untaught **`amu` / `eho`** stays forbidden; *I* for the **`SELF`** slot is the learner, not a dummy.

**Love triangle:** Azawan and Alahen compete for Ahaben’s affection **inside the setting**. Imply it with who *sees* whom, who *tells* whom, who stays composed, who raises the stakes. Do not write “Azawan loves Ahaben” as a dictionary item unless that stage already taught a matching root. Do not use *Grace* / *Courage* / *Beauty* in free English — the names stay *Azawan* / *Alahen* / *Ahaben*.

When a drill needs only one person, prefer a beat that still fits the setting and the stance (Ahaben is seen at the counter; Alahen escalates; Azawan stays in line).

## Shape (template)
<a id="template"></a>

Use a stable heading and anchor at the **end** of the stage (before the next `## Intermediate` / `## Advanced`). The heading text repeats on every stage, so pin a stage-prefixed id on each of the three headings (`{#beginner-…}`, `{#intermediate-…}`, `{#advanced-…}`); ids must be unique on a page ([one id per heading](grammar-docs.md#unique-ids)). Each stage has **one** checkpoint: when a stage teaches several topics, fold their items into that one section (the lint fails on a second `Translation practice` heading in a stage).

```md
### Translation practice {#beginner-translation-practice}

Short drills for Beginner. Try each item before opening **Show answer**. …

**Setting:** … (one place or occasion; items climb in tension)

**Roots used here:**

| English | Agazan |
|---------|--------|
| *…* | `…` |

#### English → Agazan {#beginner-english-to-agazan}

**1.** *…*

::: details Show answer
`…`

z-… | v-…

:::

#### Agazan → English {#beginner-agazan-to-english}

**1.** `…`

::: details Show answer
z-… | v-…

*…*
:::
```

Omit recoverable **`yal`** unless the drill is teaching speech act. Match role letters and sense endings to the grammar page ([clause.md](../grammar/clause.md#role-letters), [word ending](../grammar/word-endings.md)). English items that need a person use house names (*Azawan waits*), not *I* / *you*. English *they* / *he* / *she* only when the Agazan is a pronoun ([house scene](#house-scene)). The **Setting** line is required on new or replaced checkpoints; existing checkpoints may keep their old lead until replaced.

**Vocab table:** every checkpoint uses **English** then **Agazan** (plus **Same root as** / **Cue** when a row needs them), even when the bank is short. One sense per row (split house names `azawan` / `alahen` / `ahaben`). **English** is the published lemma for that spelling (literal, metaphor, or packed role English) — `build` checks **Roots used here** against the lexicon. Do not put an inflected English word in the bank (*running*, *hasty*, *the lie*) when the lemma is *run* / *haste* / *lie*; prompts may still use the obvious related form. SI nicknames (*gram*, *liter*) stay in **Cue** until that unit has its own published lemma. English is not an ending tag (`(**-m**)`). House people use the nativized name (`*Azawan*` / `*Alahen*` / `*Ahaben*`), matching prompts (*Azawan waits*). Sense-led *grace* (as a name) belongs only on [word-endings.md](../grammar/word-endings.md) Beginner, where the drill is pick **-n** from the sense. **Agazan** is a [citation](../grammar/word-endings.md#citation-forms) in backticks whenever **Same root as** is empty (`odogal`, `azawan`, `agayal`) — ending already on, not a bare stem (`odoga`), and not a role-marked copy of that citation (`vagayal`). When **Same root as** is filled, **Agazan** is still the citation of *this* sense (`agawam` *volume*) unless the English only matches with a role letter (`vahahal` *see* / `` `ahahal` *eye* ``; same pattern for *sit* / *tell*, and for `/x/` / `/h/` / `/w/` jobs such as `xodum` *therefore*, `hadehum` *haste*, `wagawam` *volume`). Closed specials use their default ending (`ugobon`, not `ugobo`). Do not pack several pairs into one row, and do not add a second production row for the citation kind unless a drill asks for it. Inner **`x`** pieces and other table exceptions: [citation in tables](grammar-docs.md#citation-in-tables) (prefer the whole inflected word in the bank when the drill builds a compound). Overlay **English** is the overlay gloss (`*MEMORY*`, `*COMMON*`, `*HIGH*`). Role compounds use the morph sense (`*agent-building*`). Named **`x`** stems use the hyphenated host lemmas (`*hospital-bed*`). Speaker/listener specials use *speaker* / *listener*, not *I* / *you*.

**Caption:** later checkpoints use **`Roots used here:`** only. Spell **English** / **Agazan** / **Same root as** / **Cue** only in [How to learn](../grammar/introduction.md#cues) and the first learner banks ([clause.md](../grammar/clause.md#beginner-translation-practice) Beginner, [word-endings.md](../grammar/word-endings.md#beginner-translation-practice) Beginner).

## Related meta

| Page | Owns |
|------|------|
| [grammar-docs.md](grammar-docs.md) | Learner prose, teach order, worked examples, [house cast](grammar-docs.md#house-cast) |
| [learning-levels.md](learning-levels.md) | Beginner / Intermediate / Advanced stages and cross-doc path |
| [glosses.md](glosses.md) | Morph gloss and free English (for teaching lines and checkpoint spoilers); [house-name glosses](glosses.md#house-cast) |
| [drill-generation.md](drill-generation.md) | Path allowlist, [settings](drill-generation.md#settings) inventory, [example root bank](drill-generation.md#root-bank), and **execute** procedure (one file per agent) — follow [principles](#principles), [checkpoint setting](#checkpoint-setting), and [house scene](#house-scene) when replacing a checkpoint |
