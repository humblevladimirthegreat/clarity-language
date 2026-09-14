# Translation exercises (editor guidance)

How to place and write **short translation drills** in learner grammar pages under **`docs/grammar/`**. Applies **only** to that folder (not to `meta/`, `examples/`, or `proposals/`). Design authority for morphology stays in the grammar pages; this page is pedagogy only.

Worked **examples** use the everyday [example root bank](drill-generation.md#root-bank). **Checkpoints** use a [setting](#checkpoint-setting) that climbs in tension; they do not recycle walk/sleep as the default plot.

Grammar pages must **not** link here or mention `meta/` — editors follow this privately. Prose / example style: [grammar-docs.md](grammar-docs.md). Learning stages: [learning-levels.md](learning-levels.md). Glosses in worked examples (not in spoiler answers): [glosses.md](glosses.md). Generating missing checkpoints: [drill-generation.md](drill-generation.md).

## Default placement
<a id="placement"></a>

**Prefer end-of-stage (or end-of-page-stage) checkpoints, not after every feature.**

Per-feature teaching already has its practice: rule → cue → 1–3 worked examples ([grammar-docs.md](grammar-docs.md#teach-in-this-order)). Another spoiler drill after every H3 turns the page into a worksheet and breaks the skim / teach rhythm.

| Where | Job |
|-------|-----|
| **Inside each feature** | Worked examples only (house style) |
| **End of a page stage** (e.g. [core.md Beginner](../grammar/core.md#beginner) → [translation practice](../grammar/core.md#translation-practice)) | Short checkpoint for *that page’s* stack |
| **End of whole Beginner / Intermediate / Advanced** (cross-doc) | Optional larger review — prefer [`examples/`](../examples/) or a dedicated practice page later; do **not** duplicate a full review on every grammar file |
| **After a real trap** | At most 1–2 items *if* English pulls the wrong Agalan shape (e.g. *because* as a verb, a general *to be*, opaque `<>` when the page is not teaching loans) |

**When to add a stage checkpoint:** if the learner can misuse the form in the *next* section’s examples, put drills at the **end of this stage**. If the form is mostly recognition (a small closed table), the worked example is enough.

**Covuzo:** every **productive** page stage gets a checkpoint. Orientation, phonology charts, and parser maps do not — skip list and path allowlist: [drill-generation.md](drill-generation.md#skip). Do **not** add a spoiler block after every H3.

**Status:** all **generate** checkpoints **exist** (see [allowlist](drill-generation.md#allowlist)). Invoke [drill-generation.md](drill-generation.md#execute) **one grammar file per agent** only to **replace** a checkpoint.

## What belongs where
<a id="what-belongs-where"></a>

| Material | Place |
|----------|--------|
| Rule + worked example | Grammar section body |
| Short Eng ↔ Agalan checkpoint | End of that page’s **Beginner** / **Intermediate** / **Advanced** stage |
| Multi-turn dialogue practice | [`examples/`](../examples/) — not inside every grammar section; grammar pages do not link there |
| Cross-doc “finish the whole level” review | Optional later; not required on each peer page |

## Drill principles
<a id="principles"></a>

1. **One new stack per item** — recycle prior stage **morphology**; do not introduce a *construction* the section has not taught. Setting **content** roots may be new (listed in the checkpoint table) if they are published; they do not have to appear in teaching examples.
2. **Both directions** — English → Agalan (production) and Agalan → English (parsing). Production is harder; keep those items shorter / fewer if the set grows.
3. **Directions are not mirrors** — no Agalan → English item may be the same proposition as any English → Agalan item on that checkpoint (same participants + same verb + same extra morph). Production tests this stage’s new morph in a short sentence. Parsing uses a **different packaging** of the same morph (legal order scramble, omitted recoverable **`jal`**, a denser nest, resume **-r**, an English false friend) or an **offset scene** (same setting, different who-does-what). Recognition-only traps (*because* as a verb, classification vs identity) belong in Agalan → English, not as production clones. Parsing may be one clause or one extra `/ɡ/` longer than production; do not invert the production list.
4. **Pure Agalan in early checkpoints** — published roots and closed specials only; `PoS<…>ENDING` / opaque spans only when the page is teaching loans or spans.
5. **Spoiler answers** — VitePress `::: details Show answer` (or a clear custom label). The answer is the Agalan sentence or **loose** free English — not a second grammar lecture. No morph-gloss wall inside the spoiler unless the drill is explicitly about packaging.
6. **Small sets** — about **6–12 items per direction** max per stage checkpoint. Put this checkpoint’s setting vocab in an **English · Agalan** table once above the drills (add **Same root as** for the everyday **-l** citation when **English** is not the citation kind: metaphor, overlay, or a role-marked use of the same root; **Cue** is optional memory helper — never the English to produce; never a mid-dot prose list). Do not repeat the How-to-learn column legend on later banks. Do not default that table to *walk* / *sleep* / *dog*.
7. **Setting vocab, not example glue** — the [example root bank](drill-generation.md#root-bank) is for **worked examples** on grammar pages (*walk*, *sleep*, *dog*, *house*, …). Each **checkpoint** names one [setting](#checkpoint-setting) and uses **setting** content roots (plus house names). Those roots need not match the example bank. Certify each new content root in [lexicon-published.csv](../../data/lexicon-published.csv) (or overlays / compounds when that English is a hosted overlay or lemma). Do **not** edit teaching examples just to seed drills. Do **not** invent stems.
8. **Test the decision, not the dictionary** — good items force a choice this stage taught (role letter, **-l** / **-m**, **`orodo` last**, omit recoverable **`jal`**, …). The setting is packaging; the morph is the test.
9. **Single sentences** — leave multi-turn scenes to [`examples/`](../examples/). Escalation is a sequence of **separate** items, not a dialogue.
10. **People are names** — default people use the [house cast](grammar-docs.md#house-cast) (`zazawan`, `zululon`, `zuhubun`) or a name already on the page, not **`ugobo`** / **`edone`**. English items use those names (*Azawan withdraws cash*). Speaker/listener specials only when the item is teaching those roots, or when the point is the discourse role (name unavailable, address set, clusivity). Inclusive *we* stays **`aha`**. Do not introduce foreign `PoS<…>n` names in early checkpoints. Cast and scene for checkpoints: [house scene](#house-scene).
11. **Plausible scenes** — every prompt is something a person or animal could actually do **in this setting**. Do **not** write surreal props-as-agents (*a book sleeps*, *the blue house sings*). Tension is rivalry, composure, and stakes in the setting — not cartoon physics. If the page’s stack is not a people scene (citation-only, number charts, span fences), keep items plausible for *that* decision; escalate *sense* (plain kind → titled handle → loaded name) rather than forcing a heist.
12. **Escalate tension** — each direction’s numbered list **climbs** inside the setting (ordinary errand → strain → peak). At least the last third of the items should be clearly higher-stakes than the first third. Every item still tests **this** stage’s decision. Do not make the peak a morph trap (English homograph, untaught overlay). Do not mock appearance. Do not lecture the plot in spoilers.

## Checkpoint setting
<a id="checkpoint-setting"></a>

One **setting** per `### Translation practice` block (each stage checkpoint is its own block). Name it in one short learner line under the heading (e.g. **Setting:** a bank). Do not write a story paragraph.

| Rule | Detail |
|------|--------|
| **Scope** | All items in **both** directions take place in that setting (same place, institution, or occasion). Parsing is not a different world; it is a different packaging / who-does-what in the **same** setting. |
| **Arc** | Item **1** is ordinary activity in that place. Later items raise tension. The last items are the peak (threat, betrayal, disaster, robbery, confession — still a single legal sentence). Example: bank → count cash / wait in line → an alarm / a lie → a robbery. |
| **Independent climbs** | English → Agalan and Agalan → English each climb on their own. They must not be the same propositions ([principle 3](#principles)), so they must not be the same heist beat-for-beat. |
| **New setting vs previous checkpoint** | Do not reuse the previous [sidebar](../grammar/.vitepress/config.ts) file’s checkpoint setting. House names do not count as a setting. Skip pages with no checkpoint when comparing. |
| **Vocab** | The **Roots used here** table is this setting’s lexicon (names + content used in the items). Closed morphs (`adoro`, **`jal`**, join vowels, …) appear in spoilers when taught; they need a table row only when the drill English is that word. |
| **Morph vs content** | Untaught **syntax** is still illegal. Untaught **content** roots are legal if published and in the table. Prefer a published **literal** that matches the English; **-m** only when the drill English is the metaphorical sense. |
| **Peak without gore** | Violence and crime are allowed as **acts people do** (punch, fight, rob, scream). Do not make death, torture, or sexual content the joke. Animals stay agents only when a real animal could do that act. |

Worked examples on the grammar page stay in the [example root bank](drill-generation.md#root-bank). Do not rewrite teach lines to match the checkpoint setting.

## House scene (checkpoints)
<a id="house-scene"></a>

Checkpoint English and Agalan **imply** this cast. Do not lecture it in spoilers or captions. Do not put this paragraph on grammar pages (those still use names only).

| Name | Root sense | Checkpoint stance |
|------|------------|-------------------|
| **Uhubun** (`uhubun`) | *beauty* (🌺 hibiscus) | A **woman**. She is the person Azawan and Ululon want to impress; in the setting she is often *seen*, *told*, or the one the stakes are *for* — the occasion, not the rival. |
| **Azawan** (`azawan`) | *grace* (🦢 swan) | **Non-binary**. Competes for Uhubun’s affection by staying too composed **in this setting**: waits, tells, sits, follows the ordinary procedure. Polite while Ululon escalates. |
| **Ululon** (`ululon`) | *courage* (🦁 lion) | A **man**. Competes by treating the setting as a dare: the one who runs the alarm, throws the punch, or attempts the robbery. Bravery that invents a threat. |

**English pronouns match Agalan pronouns only.** A name word (`zazawan`, `duhubun`, vocative `juhubun`) is *Azawan* / *Uhubun* in English — never *they* / *her*. Use *they* / *them* (Azawan), *he* / *him* (Ululon), or *she* / *her* (Uhubun) **only** when the Agalan form is a pronoun: letter or full-root **-r**, or the specials **`ugobo` / `edone` / `aha` / `enenu`**, and only on a checkpoint that is teaching those. Parentheticals follow the same rule (*calling Uhubun*, not *calling her*). Dummy *I* / *you* for untaught **`ugobo` / `edone`** stays forbidden.

**Love triangle:** Azawan and Ululon compete for Uhubun’s affection **inside the setting**. Imply it with who *sees* whom, who *tells* whom, who stays composed, who raises the stakes. Do not write “Azawan loves Uhubun” as a dictionary item unless that stage already taught a matching root. Do not use *Grace* / *Courage* / *Beauty* in free English — the names stay *Azawan* / *Ululon* / *Uhubun*.

When a drill needs only one person, prefer a beat that still fits the setting and the stance (Uhubun is seen at the counter; Ululon escalates; Azawan stays in line).

## Shape (template)
<a id="template"></a>

Use a stable heading and anchor at the **end** of the stage (before the next `## Intermediate` / `## Advanced`):

```md
### Translation practice
<a id="translation-practice"></a>

Short drills for Beginner. Try each item before opening **Show answer**. …

**Setting:** … (one place or occasion; items climb in tension)

**Roots used here:**

| English | Agalan |
|---------|--------|
| *…* | `…` |

#### English → Agalan

**1.** *…*

::: details Show answer
`…`
:::

#### Agalan → English

**1.** `…`

::: details Show answer
*…*
:::
```

Omit recoverable **`jal`** unless the drill is teaching speech act. Match role letters and sense endings to the grammar page ([core.md](../grammar/core.md#role-letters), [reference suffix](../grammar/reference-suffix.md)). English items that need a person use house names (*Azawan waits*), not *I* / *you*. English *they* / *he* / *she* only when the Agalan is a pronoun ([house scene](#house-scene)). The **Setting** line is required on new or replaced checkpoints; existing checkpoints may keep their old lead until replaced.

**Vocab table:** every checkpoint uses **English** then **Agalan** (plus **Same root as** / **Cue** when a row needs them), even when the bank is short. One sense per row (split house names `azawan` / `ululon` / `uhubun`). English is the learner gloss for this drill (*cash*, *alarm*, *Azawan*, *see*) — not an ending tag (`(**-m**)`). House people use the nativized name (`*Azawan*` / `*Ululon*` / `*Uhubun*`), matching prompts (*Azawan waits*). Sense-led *grace* (as a name) belongs only on [reference-suffix.md](../grammar/reference-suffix.md) Beginner, where the drill is pick **-n** from the sense. **Agalan** is a [citation](../grammar/reference-suffix.md#citation-forms) in backticks by default (`odogol`, `uzumum`, `azawan`) — ending already on, not a bare stem (`odogo`). Use the **in-clause** spelling when that English only matches with a role letter (`vejel` *see* / `` `ejel` *eye* ``; same pattern for *sit* / *tell*, and for `/x/` / `/h/` / `/w/` jobs such as `xezazal` *therefore*, `hadazam` *haste*, `wegelom` *volume*). Closed specials use their default ending (`ugobon`, not `ugobo`). Do not pack several pairs into one row, and do not add a second production row for the citation kind unless a drill asks for it. Inner **`x`** pieces and other table exceptions: [citation in tables](grammar-docs.md#citation-in-tables) (prefer the whole inflected word in the bank when the drill builds a compound).

**Caption:** later checkpoints use **`Roots used here:`** only. Spell **English** / **Agalan** / **Same root as** / **Cue** only in [How to learn](../grammar/introduction.md#cues) and the first learner banks ([core.md](../grammar/core.md#translation-practice) Beginner, [reference-suffix.md](../grammar/reference-suffix.md#translation-practice) Beginner).

## Related meta

| Page | Owns |
|------|------|
| [grammar-docs.md](grammar-docs.md) | Learner prose, teach order, worked examples, [house cast](grammar-docs.md#house-cast) |
| [learning-levels.md](learning-levels.md) | Beginner / Intermediate / Advanced stages and cross-doc path |
| [glosses.md](glosses.md) | Morph gloss and free English (for teaching lines, not required in spoilers); [house-name glosses](glosses.md#house-cast) |
| [drill-generation.md](drill-generation.md) | Path allowlist, [example root bank](drill-generation.md#root-bank), and **execute** procedure (one file per agent) — follow [principles](#principles), [checkpoint setting](#checkpoint-setting), and [house scene](#house-scene) when replacing a checkpoint |
