# Translation exercises (editor guidance)

How to place and write **stage checkpoints** (short translation drills plus a few decision items) in learner grammar pages under **`docs/grammar/`**. Applies **only** to that folder (not to `meta/`, `examples/`, or `proposals/`). Design authority for morphology stays in the grammar pages; this page is pedagogy only.

Worked **examples** use the everyday [example root bank](drill-generation.md#root-bank). **Checkpoints** use a [setting](#checkpoint-setting) and the [core vocabulary](#core-vocabulary); they do not recycle walk/sleep as the default plot.

Grammar pages must **not** link here or mention `meta/` — editors follow this privately. Prose / example style: [grammar-docs.md](grammar-docs.md). Learning stages: [learning-levels.md](learning-levels.md). Visible morph glosses in worked examples and checkpoint spoilers: [glosses.md](glosses.md). Generating missing checkpoints: [drill-generation.md](drill-generation.md).

## Default placement
<a id="placement"></a>

**Prefer end-of-stage (or end-of-page-stage) checkpoints, not after every feature.**

Per-feature teaching already has its practice: rule → cue → 1–3 worked examples ([grammar-docs.md](grammar-docs.md#teach-in-this-order)). Another spoiler drill after every H3 turns the page into a worksheet and breaks the skim / teach rhythm.

| Where | Job |
|-------|-----|
| **Inside each feature** | Worked examples only (house style) |
| **End of a page stage** (e.g. [clause.md Beginner](/clause) → [practice](/clause#beginner-practice)) | Short checkpoint for *that page’s* stack |
| **End of whole Beginner / Intermediate / Advanced** (cross-doc) | Required [level review](#level-reviews) last in each sidebar group; do **not** duplicate a review on every grammar file |
| **After a real trap** | At most 1–2 items *if* English pulls the wrong Agebon shape (e.g. *because* as a verb, a general *to be*, opaque `<>` when the page is not teaching loans) |

**When to add a stage checkpoint:** if the learner can misuse the form in the *next* section’s examples, put drills at the **end of this stage**. If the form is mostly recognition (a small closed table), the worked example is enough.

**Coverage:** every **productive** page stage gets a checkpoint. Orientation, phonology charts, and parser maps do not — [allowlist](drill-generation.md#allowlist) **skip**. Every construction family taught in that band, parser-built or data, needs at least one practice item in the same-band checkpoint (either direction). Do **not** add a spoiler block after every H3. Named settings in use: [settings](drill-generation.md#settings).

**Status:** all **generate** checkpoints **exist** (see [allowlist](drill-generation.md#allowlist)). All are converted to this page's standard; none is [legacy](#legacy-checkpoints). Invoke [drill-generation.md](drill-generation.md#execute) **one grammar file per agent** only to **replace** a checkpoint, which converts it to this page's standard. All three [level reviews](#level-reviews) exist ([Beginner](/review), [Intermediate](/review-intermediate), [Advanced](/review-advanced)); procedure in [drill-generation.md](drill-generation.md#level-review).

## What belongs where
<a id="what-belongs-where"></a>

| Material | Place |
|----------|--------|
| Rule + worked example | Grammar section body |
| Stage checkpoint (translation plus [decision items](#item-types)) | End of that page’s **Beginner** / **Intermediate** / **Advanced** stage |
| Practice for a recipe | `## Practice` at the end of that `say-*.md` page ([recipe track](grammar-docs.md#recipe-track)); same principles, not a stage checkpoint |
| Multi-turn dialogue practice | [`examples/`](../examples/) — not inside every grammar section; grammar pages do not link there |
| Cross-doc “finish the whole level” review | [Level review](#level-reviews): the level's band on [review.md](/review); not on each peer page |

## Drill principles
<a id="principles"></a>

1. **One new stack per item** — recycle prior stage **morphology**; do not introduce a *construction* the section has not taught. **Content** roots follow the [core vocabulary](#core-vocabulary): at most 5 new, at least 3 review. They do not have to appear in teaching examples.
2. **Both directions** — English → Agebon (production) and Agebon → English (parsing). Production is harder; keep those items shorter / fewer if the set grows.
3. **Directions are not mirrors** — no Agebon → English item may be the same proposition as any English → Agebon item on that checkpoint (same participants + same verb + same extra morph), and no [decision item](#item-types) may repeat a translation item's proposition. Production tests this stage’s new morph in a short sentence. Parsing uses a **different packaging** of the same morph (legal order scramble, omitted recoverable **`yal`**, a denser nest, resume **-r**, an English false friend) or an **offset scene** (same setting, different who-does-what). Recognition-only traps (*because* as a verb, classification vs identity) belong in Agebon → English, not as production clones. Parsing may be one clause or one extra `/ɡ/` longer than production; do not invert the production list.
4. **Pure Agebon in early checkpoints** — published roots and closed specials only; `PoS<…>ENDING` / opaque spans only when the page is teaching loans or spans. Mention spans keep the **Agebon spelling** in morph; free English is *the word “…”* / *the phrase “…”* ([glosses.md](glosses.md#span-interiors)). *Said “X”* is **cite**, not mention. Cite **`@`** is the **work** (one-word work is ordinary **-n**, not `d@[onuren]`). The mention marker **`glegon`** is the **name**, including a one-word name (`glegon d<uzugon>`).
5. **Spoiler answers** — VitePress `::: details Show answer` (or a clear custom label). The answer is the Agebon sentence or free English, plus a **morph gloss** line when `lint:agebon` does not treat parser output as redundant with that loose line ([glosses.md](glosses.md#example-block) format — roman `z-Azozon | v-sit`, not `gloss:`). **English → Agebon:** Agebon line, blank line, morph (when required). **Agebon → English:** morph (when required), blank line, italic English (Agebon stays on the prompt). Italic English in answers and in English → Agebon prompts follows the [sentence and note](glosses.md#free-english-sentence-and-note) shape with italics in place of quotes: `*sentence.* (note)`. A note is never required in a checkpoint; add one only when the checkpoint drills the marking the sentence drops. When a morph line is present, `lint:agebon` compares it to the [parser](glosses.md#role-english) (`v-see` when packed).
6. **Small sets, one bank** — item counts scale with how many sections the band teaches ([drill-generation.md](drill-generation.md#execute)); the cap is room, not a target. Translation is about two thirds of a checkpoint. Put the checkpoint's words once above the drills, split into **New words** and **Review** ([vocab table](#vocab-table)). Do not default the bank to *walk* / *sleep* / *dog*.
7. **Setting vocab, not example glue** — the [example root bank](drill-generation.md#root-bank) is for **worked examples** on grammar pages (*walk*, *sleep*, *dog*, *house*, …). Each **checkpoint** names one [setting](#checkpoint-setting) and uses **setting** content roots (plus house names). Those roots need not match the example bank. Certify each new content root in [lexicon-published.csv](../../data/lexicon-published.csv) (or overlays / compounds when that English is a hosted overlay or lemma). Do **not** edit teaching examples just to seed drills. Do **not** invent stems.
8. **Test the decision, not the dictionary** — good items force a choice this stage taught (role letter, **-l** / **-m**, **`darl` last**, omit recoverable **`yal`**, …). The setting is packaging; the morph is the test. A translation item also tests vocabulary recall; the [decision items](#item-types) isolate the choice, so aim them at the stage's main decision.
9. **Single sentences** — leave multi-turn scenes to [`examples/`](../examples/). Escalation is a sequence of **separate** items, not a dialogue.
10. **People are names** — default people use the [house cast](grammar-docs.md#house-cast) (`zazozon`, `zalazun`, `zahelan`) or a name already on the page, not **`uwe`** / **`awa`**. English items use those names (*Azozon withdraws cash*). For third persons, speaker/listener specials only when the item is teaching those roots, or when the point is the discourse role (name unavailable, address set, clusivity). Inclusive *we* stays **`aya`**. Do not introduce foreign `PoS<…>n` names in early checkpoints. Cast and scene for checkpoints: [house scene](#house-scene). When the learner is the speaker (*I*), use **`uwen`** from pronouns.md Beginner on; before that, no *I* except a greeting. The **`SELF`** name slot (bank row `*your name*` / `` `SELFn` ``) is for greetings, bids, and self-introduction ([first person](grammar-docs.md#house-cast)). Keep first person to items where the reader plausibly is the speaker.
11. **Plausible scenes** — every prompt is something a person or animal could actually do **in this setting**. Do **not** write surreal props-as-agents (*a book sleeps*, *the blue house sings*). If the page’s stack is not a people scene (citation-only, number charts, span fences), keep items plausible for *that* decision.
12. **Settings that show** — at least half the items in each translation direction use a root or a situation that belongs to the setting (*withdraw*, *teller*, a queue at the counter for a bank). Review roots from other settings may fill the rest. Optional flavor: a list that climbs in tension (ordinary errand → strain → peak) and the [love triangle](#house-scene). When you climb, do not make the peak a morph trap (English homograph, untaught overlay), do not mock appearance, and do not lecture the plot in spoilers.
13. **Decision items** — add [decision items](#item-types) in the range in [drill-generation.md](drill-generation.md#execute). Every form in them follows the same recycle and leak rules as the translation items.
14. **Accepted alternatives** — when a learner is likely to write a legal variant of an English → Agebon answer, list it on an **Also correct:** line ([template](#template)). Likely variants: a legal reordering, an omitted recoverable word, a pointer for a resume of the same one. Each variant has the same morph reading as the main answer; a variant that reads differently is not an alternative. Do not list every legal permutation.

## Decision items
<a id="item-types"></a>

Three item types aimed straight at the stage's decision. Each sits under its own H4 after the two translation directions.

| Type | Prompt | Answer |
|------|--------|--------|
| **Pick one** | English sentence and two Agebon forms that differ only in this stage's decision | The right form, its morph line, and one line on why |
| **Fix it** | English meaning and an Agebon sentence with one error an English speaker would make | The corrected sentence, its morph line, and one line naming the error |
| **What changes** | Two Agebon sentences that differ in one morph | A morph line for each, then the difference in meaning in plain English |

- Both **Pick one** forms are legal and parse. The wrong one is wrong for *this* English, not ill-formed.
- The **Fix it** correction parses. The error is a real learner error (English word order, a missing role letter, the wrong ending), not a random spelling. When the error is a spelling the parser rejects, [unassigned-reserved.md](unassigned-reserved.md) must not list a reading for it.
- **What changes** uses only taught morphs on both sides, and both sentences parse.
- `lint:agebon` checks the item shapes in the [template](#template) and these rules: both **Pick one** forms parse, read differently, and use the same content roots; the answer is one of them. The **Fix it** wrong form carries `<!-- lint: error -->` and may fail to parse, but when it parses it must read differently from the correction. The two **What changes** sentences differ in exactly one word. Each **Also correct:** variant must have the same morph reading as the main answer: clause order, an explicit or omitted **`yal`**, and a pointer in place of a resume of the same one do not count as differences. A hook moves with its `/b/`, `/h/` words keep their order, and a fresh noun is a new one, so a resume in place of a repeated noun, **-r** against **-l** or **-m**, a role compound against the event's own **-r**, swapped hook sides, and reordered `/h/` words all read differently. It also checks item counts ([drill-generation.md](drill-generation.md#execute)) and H4 order. Whether a form is a real learner error, or the right decision, stays with the author.
- Use whichever types fit the stage; a checkpoint need not have all three.

## Core vocabulary
<a id="core-vocabulary"></a>

The `core` column of the lexicon CSVs orders the learner's content roots by the checkpoint that introduces each one ([core vocabulary column](lexicon.md#core-vocabulary-column)). `npm run core-vocabulary` prints the current report; `npm run core-vocabulary -- --for <page>.md:<band>` lists one checkpoint's choices: roots it may introduce, later roots to pull forward, and review roots unused longest first.

| Rule | Detail |
|------|--------|
| **New per checkpoint** | At most **5** content roots whose `core` cell names this checkpoint. House names, the `SELF` slot, specials, the nine sake roots, and closed overlay words do not count |
| **Review per checkpoint** | At least **3** content roots introduced at earlier checkpoints, preferring ones unused for the longest stretch of the path |
| **Source** | New roots come from the core list in order. A setting may pull a later core root forward; then move its `core` cell to this checkpoint, which owns its introduction |
| **Non-core roots** | A content root with an empty `core` cell that the setting needs becomes core here: set its cell to this checkpoint, and it counts as new |

`lint:agebon` checks these rules on `### Practice` checkpoints in path order: each **New words** root has its `core` cell on this checkpoint and each **Review** root an earlier one, the cap, the review minimum (fewer only when fewer than 3 core roots come before), and no `core` cell naming this checkpoint for a root its **New words** leaves out. House names, the `SELF` slot, specials, and sake roots go under **New words** only on the first checkpoint whose bank lists them. Whether a new root is the next in core order stays with the author.

### Look-alikes
<a id="look-alikes"></a>

Root spellings are placed without regard to learning order ([root tails](lexicon.md#root-tails)), so two roots that differ only in the middle vowel can both be core. A learner who meets them before the tails are taught sees look-alikes, whatever their kinds. The vocabulary choice keeps them apart, not the spelling.

| Rule | Detail |
|------|--------|
| **Gap** | Two core roots that differ only in the middle vowel (same odd length, only the center letter differs, a vowel in both: `owuvu` / `abuvu`), of any kind, introduced in the same level are at least **3** checkpoints apart in that level's page order: their `core` cells never name the same checkpoint or checkpoints of one level 1 to 2 apart. Introductions in different levels are never compared |
| **Fix** | Pick another word for one of the checkpoints, or move one root's introduction: drop it from the banks before a later checkpoint that uses it, and move its `core` cell there. A swapped word must fit every item it lands in, so don't just replace the word. Reread each item and rewrite any that the new word makes false or odd: a facing that only a vehicle or a person has, a manner the subject can't have, or an *although* with no contrast. A rewrite may change other words in the item, and the bank changes to match |
| **Scope** | Every core root and listed compound stem with a `core` cell; review use is free, since only introductions are spaced |

`lint:agebon` checks the gap (`look-alike`), and `npm run build` fails on it. `npm run core-vocabulary -- --look-alikes` lists each pair with fix options: the checkpoints that use each root, where each could be introduced instead (with that checkpoint's new count and any new look-alike there), and substitutes of the same kind that clash with no core root near the checkpoint (`--limit` sets how many).

## Checkpoint setting
<a id="checkpoint-setting"></a>

One **setting** per `### Practice` block (each stage checkpoint is its own block). Name it in one short learner line under the heading (e.g. **Setting:** a bank). Do not write a story paragraph.

| Rule | Detail |
|------|--------|
| **Scope** | All items in **both** directions take place in that setting (same place, institution, or occasion). Parsing is not a different world; it is a different packaging / who-does-what in the **same** setting. |
| **Shows** | At least half the items in each translation direction use a root or situation of the setting ([principle 12](#principles)). |
| **Arc (optional)** | Item **1** is ordinary activity in that place; later items raise tension to a peak (threat, betrayal, robbery, confession — still a single legal sentence). When both directions climb, they climb on their own, never the same propositions ([principle 3](#principles)). |
| **Unique setting** | Each checkpoint’s **Setting** line must be a place or occasion **not used on any other checkpoint**. Check the inventory in [settings](drill-generation.md#settings) before picking; write the chosen phrase into that table when you replace. Same occasion under a different article or synonym counts as reuse (*a bank* / *the bank* / *a teller line*). House names are not a setting. Allowlist **skip** rows and **unset** cells do not occupy a name. |
| **Vocab** | **New words** and **Review** together are exactly the content roots the items use (house names included), and nothing they do not use. The setting picks which core roots come forward; it does not force a fresh vocabulary ([core vocabulary](#core-vocabulary)). Closed morphs and overlays (`darl`, **`yal`**, join vowels, `thomam`, …) appear in spoilers when taught; they need a row only when the drill English is that word, and such a row must still be used. |
| **Morph vs content** | Untaught **syntax** is still illegal. Untaught **content** roots are legal if published and in the table. Prefer a published **concrete** that matches the English; **-m** only when the drill English is the abstract sense. |
| **Peak without gore** | Violence and crime are allowed as **acts people do** (punch, fight, rob, scream). Do not make death, torture, or sexual content the joke. Animals stay agents only when a real animal could do that act. |

Worked examples on the grammar page stay in the [example root bank](drill-generation.md#root-bank). Do not rewrite teach lines to match the checkpoint setting.

## House scene (checkpoints)
<a id="house-scene"></a>

Checkpoint English and Agebon **imply** this cast. Do not lecture it in spoilers or captions. Do not put this paragraph on grammar pages (those still use names only).

| Name | Root sense | Checkpoint stance |
|------|------------|-------------------|
| **Ahelan** (`ahelan`) | *beauty* (🌺 hibiscus) | A **woman**. She is the person Azozon and Alazun want to impress; in the setting she is often *seen*, *told*, or the one the stakes are *for* — the occasion, not the rival. |
| **Azozon** (`azozon`) | *grace* (🦢 swan) | **Non-binary**. Competes for Ahelan’s affection by staying too composed **in this setting**: waits, tells, sits, follows the ordinary procedure. Polite while Alazun escalates. |
| **Alazun** (`alazun`) | *courage* (🦁 lion) | A **man**. Competes by treating the setting as a dare: the one who runs the alarm, throws the punch, or attempts the robbery. Bravery that invents a threat. |

**English pronouns match Agebon pronouns only.** A name word (`zazozon`, `dahelan`, vocative `yahelan`) is *Azozon* / *Ahelan* in English — never *they* / *her*. Use *they* / *them* (Azozon), *he* / *him* (Alazun), or *she* / *her* (Ahelan) **only** when the Agebon form is a pronoun: a resume **-r**, a role pointer, or the specials **`uwe` / `awa` / `aya` / `ume`**, and only on a checkpoint that is teaching those. Parentheticals follow the same rule (*calling Ahelan*, not *calling her*). *I* / *you* through **`uwen`** / **`awan`** are allowed from pronouns.md Beginner on; before that, no *I* except a greeting with the **`SELF`** slot.

**Love triangle (optional flavor):** Azozon and Alazun compete for Ahelan’s affection **inside the setting**. Imply it with who *sees* whom, who *tells* whom, who stays composed, who raises the stakes. Do not write “Azozon loves Ahelan” as a dictionary item unless that stage already taught a matching root. Do not use *Grace* / *Courage* / *Beauty* in free English — the names stay *Azozon* / *Alazun* / *Ahelan*.

When a drill needs only one person, prefer a beat that still fits the setting and the stance (Ahelan is seen at the counter; Alazun escalates; Azozon stays in line).

## Shape (template)
<a id="template"></a>

Use a stable heading and anchor at the **end** of the sitting (before `## See also` / end of file). The heading text repeats on every sitting, so pin a stage-prefixed id on each heading (`{#beginner-…}`, `{#intermediate-…}`, `{#advanced-…}`); ids must be unique on a page ([one id per heading](grammar-docs.md#unique-ids)). Each sitting has **one** checkpoint: when a sitting teaches several topics, fold their items into that one section (the lint fails on a second checkpoint heading in a sitting).

````md
### Practice {#beginner-practice}

Short drills for Beginner. Try each item before opening **Show answer**. …

**Setting:** … (one place or occasion)

**New words:**

| English | Agebon | Cue |
|---------|--------|-----|
| *…* | `…` | … |

**Review:**

| English | Agebon |
|---------|--------|
| *…* | `…` |

#### English → Agebon {#beginner-english-to-agebon}

**1.** *…*

::: details Show answer
`…`

z-… | v-…

**Also correct:** `…`
:::

#### Agebon → English {#beginner-agebon-to-english}

**1.** `…`

::: details Show answer
z-… | v-…

*…*
:::

#### Pick one {#beginner-pick-one}

**1.** *…* `…` or `…`

::: details Show answer
`…`

z-… | v-…

One line on why.
:::

#### Fix it {#beginner-fix-it}

**1.** *…* <!-- lint: error -->`…`

::: details Show answer
`…`

z-… | v-…

One line naming the error.
:::

#### What changes {#beginner-what-changes}

**1.** `…` / `…`

::: details Show answer
z-… | v-…

z-… | v-…

The difference in plain English.
:::
````

Number items from **1** under each H4. Keep the two translation directions first; the decision-item H4s follow in this order and appear only when used. **Also correct:** comes last in an English → Agebon answer, with variants comma-separated; omit the line when no likely variant exists. Omit **Review** on a checkpoint with no earlier core roots.

Omit recoverable **`yal`** unless the drill is teaching speech act. Match role letters and sense endings to the grammar page ([clause.md](/clause#role-letters), [word ending](/word-endings)). English items that need a person use house names (*Azozon waits*), not *I* / *you*. English *they* / *he* / *she* only when the Agebon is a pronoun ([house scene](#house-scene)).

### Vocab table
<a id="vocab-table"></a>

| Group | Columns | Rows |
|-------|---------|------|
| **New words** | English · Agebon · Cue | Roots this checkpoint introduces ([core vocabulary](#core-vocabulary)), plus house names and the `SELF` row on their first checkpoint |
| **Review** | English · Agebon | Every other content root the items use, house names included. No cue |

- One sense per row (split house names `azozon` / `alazun` / `ahelan`). Do not pack several pairs into one row.
- **English** is the published lemma for that spelling (literal, metaphor, or packed role English); `build` checks it against the lexicon. Do not put an inflected English word in the bank (*running*, *hasty*, *the lie*) when the lemma is *run* / *haste* / *lie*; prompts may still use the obvious related form. SI nicknames (*gram*, *liter*) stay in **Cue** until that unit has its own published lemma. English is not an ending tag (`(**-m**)`). House people use the nativized name (`*Azozon*`). Overlay **English** is the overlay gloss (`*MEMORY*`). Role compounds use the morph sense (`*agent-building*`). Named **`x`** stems use the hyphenated host lemmas (`*hospital-bed*`). Speaker/listener specials use *I* / *you* or *speaker* / *listener*.
- **Agebon** is the [citation](/word-endings#citation-forms) of the English sense (`odozel`, `ugowum` *volume*), ending on, not a bare stem (`odoze`). It is the in-clause word only when the English matches only with a role or `/x/` / `/h/` / `/w/` letter (`vayebel` *see*, `vehohel` *sit*, `vezuyol` *tell*, `xahom` *therefore*, `hadurom` *haste*). Closed specials use their default ending (`ugobon`). Inner **`x`** pieces and other exceptions: [citation in tables](grammar-docs.md#citation-in-tables).
- Every **New words** row has a **Cue**. When **Agebon** is not the citation of the English, the cue names the citation sense (`👁️ from *eye*`, `🔈 from *quiet*`). When a root has no useful cue, give the emoji alone. A cue is never the English to produce, and never a mid-dot prose list.
- `lint:agebon` checks the columns of each group, the English, a cue on every **New words** row, one row per root across both groups, and that the bank lists exactly the content roots the drills use. The **Fix it** wrong form is not a use.

**Caption and legend:** the captions are **`New words:`** and **`Review:`**. Spell out what the columns mean only on the first converted banks ([clause.md](/clause#beginner-practice) Beginner, [word-endings.md](/word-endings#beginner-practice) Beginner), and update the [How to learn](../grammar/introduction.md#cues) legend when the first page converts.

## Level reviews
<a id="level-reviews"></a>

Each level ends with a review: [review.md](/review) for Beginner, [review-intermediate.md](/review-intermediate), [review-advanced.md](/review-advanced), last in that sidebar group, outside the stage pages. The docs lint reads each review after every sitting of its band: the learning-order check and the [core vocabulary](#core-vocabulary) rules see it at the end of its level. Stage pages do not link to it. A review follows the [template](#template) and every drill principle except where this table differs.

| Rule | Detail |
|------|--------|
| **Coverage** | One item per stage checkpoint of the level, aimed at that page's main decision (its allowlist **Introduces** cell). Up to 3 extra items may revisit a page |
| **Mix** | Mostly **Pick one** and short translation: **Pick one** at least a third of the items, at least 3 items per translation direction, **Fix it** + **What changes** at most a quarter |
| **Rule link** | Every answer ends with `**Rule:** [Section title](page.md#id)` after **Also correct:**, linking the stage section that teaches the decision (not its checkpoint), in the same level |
| **Vocabulary** | **Review** only (English · Agebon): no **New words**, house names and `SELF` included. Prefer roots unused longest (`npm run core-vocabulary -- --for review.md:beginner`) |
| **Setting** | None: the items range over every page, so there is no **Setting:** line. House cast, plausible scenes, and *I* as `uwen` (or `SELF` in a greeting or bid) still apply |
| **No copies** | No item repeats a stage checkpoint item's proposition. A review revisits the same decision with other words or another packaging |

`lint:agebon` checks the **Rule:** line and its target, that every stage checkpoint of the band has an item linking its page, the item counts and mix, and (with the core rules) that the bank has no **New words**. Whether an item hits the page's main decision, and the no-copy rule, stay with the author.

## Legacy checkpoints
<a id="legacy-checkpoints"></a>

A checkpoint headed `### Translation practice {#<band>-translation-practice}` predates this standard. It has one **Roots used here** bank (English · Agebon, with **Same root as** / **Cue** where a row needs them) and translation items only. The **Roots used here** bank checks run only on legacy checkpoints; checks for this standard run only on `### Practice` sections. Morph lines and drill coverage are checked on both.

- Do not write a new legacy checkpoint.
- A drill-coverage fix on a legacy checkpoint adds 1–3 translation items in its existing format and bank.
- **Replace** converts the whole checkpoint to `### Practice`. Retarget its `core` cells (`page.md#beginner-translation-practice` → `page.md#beginner-practice`) and any links to the old anchor in the same change; `npm test` fails on a `core` cell that names no checkpoint.

## Related meta

| Page | Owns |
|------|------|
| [grammar-docs.md](grammar-docs.md) | Learner prose, teach order, worked examples, [house cast](grammar-docs.md#house-cast) |
| [learning-levels.md](learning-levels.md) | Band gates and cross-doc path |
| [glosses.md](glosses.md) | Morph gloss and free English (for teaching lines and checkpoint spoilers); [house-name glosses](glosses.md#house-cast) |
| [drill-generation.md](drill-generation.md) | Path allowlist, [settings](drill-generation.md#settings) inventory, [example root bank](drill-generation.md#root-bank), and **execute** procedure (one file per agent) — follow [principles](#principles), [checkpoint setting](#checkpoint-setting), and [house scene](#house-scene) when replacing a checkpoint |
