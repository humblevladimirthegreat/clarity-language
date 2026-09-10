# Translation exercises (editor guidance)

How to place and write **short translation drills** in learner grammar pages under **`docs/grammar/`**. Applies **only** to that folder (not to `meta/`, `examples/`, or `proposals/`). Design authority for morphology stays in the grammar pages; this page is pedagogy only.

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

1. **One new stack per item** — recycle prior stage material; do not introduce a root or construction the section has not taught.
2. **Both directions** — English → Agalan (production) and Agalan → English (parsing). Production is harder; keep those items shorter / fewer if the set grows.
3. **Pure Agalan in early checkpoints** — published roots and closed specials only; `PoS<…>ENDING` / opaque spans only when the page is teaching loans or spans.
4. **Spoiler answers** — VitePress `::: details Show answer` (or a clear custom label). The answer is the Agalan sentence or **loose** free English — not a second grammar lecture. No morph-gloss wall inside the spoiler unless the drill is explicitly about packaging.
5. **Small sets** — about **6–12 items per direction** max per stage checkpoint. Prefer a tiny reused root bank over lexicon tourism. Put that bank in an **English · Agalan** table once above the drills (add **Same root as** for the everyday **-l** citation when **English** is not the citation kind: metaphor, overlay, or a role-marked use of the same root; **Cue** is optional memory helper — never the English to produce; never a mid-dot prose list).
6. **Test the decision, not the dictionary** — good items force a choice this stage taught (role letter, **-l** / **-m**, **`orodo` last**, omit recoverable **`jal`**, …).
7. **Single sentences** — leave multi-turn scenes to [`examples/`](../examples/).
8. **People are names** — default people use the [house cast](grammar-docs.md#house-cast) (`zazawan`, `zululon`, `zuhubun`) or a name already on the page, not **`ugobo`** / **`edone`**. English items use those names (*Azawan walks*). Speaker/listener specials only when the item is teaching those roots, or when the point is the discourse role (name unavailable, address set, clusivity). Inclusive *we* stays **`aha`**. Do not introduce foreign `PoS<…>n` names in early checkpoints.

## Shape (template)
<a id="template"></a>

Use a stable heading and anchor at the **end** of the stage (before the next `## Intermediate` / `## Advanced`):

```md
### Translation practice
<a id="translation-practice"></a>

Short drills for Beginner. Try each item before opening **Show answer**. …

**Roots used here** (**English** is what you produce; **Agalan** is the citation, or the in-clause word when a role letter is part of that English; **Same root as** is the everyday citation when that English is not the citation kind; **Cue** is optional memory helper):

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

Omit recoverable **`jal`** unless the drill is teaching speech act. Match role letters and sense endings to the grammar page ([core.md](../grammar/core.md#role-letters), [reference suffix](../grammar/reference-suffix.md)). English items that need a person use house names (*Azawan walks*), not *I* / *you*.

**Vocab table:** every checkpoint uses **English** then **Agalan** (plus **Same root as** / **Cue** when a row needs them), even when the bank is short. One sense per row (split house names `azawan` / `ululon` / `uhubun`). English is the learner gloss for this drill (*dog*, *happy*, *grace*, *see*) — not an ending tag (`(**-m**)`). House people may still note the nativized name (`*grace* (name **Azawan**)`). **Agalan** is a [citation](../grammar/reference-suffix.md#citation-forms) in backticks by default (`odogol`, `uzumum`, `azawan`) — ending already on, not a bare stem (`odogo`). Use the **in-clause** spelling when that English only matches with a role letter (`vejel` *see* / `` `ejel` *eye* ``; same pattern for *sit* / *tell* / *write*, and for `/x/` / `/h/` / `/w/` jobs such as `xezazal` *therefore*, `hadazam` *haste*, `wegelom` *volume*). Closed specials use their default ending (`ugobon`, not `ugobo`). Do not pack several pairs into one row, and do not add a second production row for the citation kind unless a drill asks for it. Inner **`x`** pieces and other table exceptions: [citation in tables](grammar-docs.md#citation-in-tables) (prefer the whole inflected word in the bank when the drill builds a compound).

## Related meta

| Page | Owns |
|------|------|
| [grammar-docs.md](grammar-docs.md) | Learner prose, teach order, worked examples, [house cast](grammar-docs.md#house-cast) |
| [learning-levels.md](learning-levels.md) | Beginner / Intermediate / Advanced stages and cross-doc path |
| [glosses.md](glosses.md) | Morph gloss and free English (for teaching lines, not required in spoilers); [house-name glosses](glosses.md#house-cast) |
| [drill-generation.md](drill-generation.md) | Path allowlist, root bank, and **execute** procedure (one file per agent) |
