# Translation exercises (editor guidance)

How to place and write **short translation drills** in learner grammar pages under **`docs/grammar/`**. Applies **only** to that folder (not to `meta/`, `examples/`, or `proposals/`). Design authority for morphology stays in the grammar pages; this page is pedagogy only.

Grammar pages must **not** link here or mention `meta/` — editors follow this privately. Prose / example style: [grammar-docs.md](grammar-docs.md). Banding: [learning-levels.md](learning-levels.md). Glosses in worked examples (not in spoiler answers): [glosses.md](glosses.md). Generating missing checkpoints: [drill-generation.md](drill-generation.md).

## Default placement
<a id="placement"></a>

**Prefer end-of-band (or end-of-page-band) checkpoints, not after every feature.**

Per-feature teaching already has its practice: rule → mnemonic → 1–3 worked examples ([grammar-docs.md](grammar-docs.md#teach-in-this-order)). Another spoiler drill after every H3 turns the page into a worksheet and breaks the skim / teach rhythm.

| Where | Job |
|-------|-----|
| **Inside each feature** | Worked examples only (house style) |
| **End of a page band** (e.g. [core.md Beginner](../grammar/core.md#beginner) → [translation practice](../grammar/core.md#translation-practice)) | Short checkpoint for *that page’s* stack |
| **End of whole Beginner / Intermediate / Advanced** (cross-doc) | Optional larger review — prefer [`examples/`](../examples/) or a dedicated practice page later; do **not** duplicate a full review on every grammar file |
| **After a real trap** | At most 1–2 items *if* English pulls the wrong Agelan shape (e.g. *because* as a verb, a general *to be*, opaque `<>` when the page is not teaching loans) |

**When to add a band checkpoint:** if the learner can misuse the form in the *next* section’s examples, put drills at the **end of this band**. If the form is mostly recognition (a small closed table), the worked example is enough.

**Coverage:** every **productive** page-band gets a checkpoint. Orientation, phonology charts, and parser maps do not — skip list and path allowlist: [drill-generation.md](drill-generation.md#skip). Do **not** add a spoiler block after every H3.

**Status:** all **generate** checkpoints **exist** (see [allowlist](drill-generation.md#allowlist)). Invoke [drill-generation.md](drill-generation.md#execute) **one grammar file per agent** only to **replace** a checkpoint.

## What belongs where
<a id="what-belongs-where"></a>

| Material | Place |
|----------|--------|
| Rule + worked example | Grammar section body |
| Short Eng ↔ Agelan checkpoint | End of that page’s **Beginner** / **Intermediate** / **Advanced** band |
| Multi-turn dialogue practice | [`examples/`](../examples/) — not inside every grammar section; grammar pages do not link there |
| Cross-doc “finish the whole level” review | Optional later; not required on each peer page |

## Drill principles
<a id="principles"></a>

1. **One new stack per item** — recycle prior band material; do not introduce a root or construction the section has not taught.
2. **Both directions** — English → Agelan (production) and Agelan → English (parsing). Production is harder; keep those items shorter / fewer if the set grows.
3. **Pure Agelan in early checkpoints** — published roots and closed specials only; `PoS<…>ENDING` / opaque spans only when the page is teaching loans or spans.
4. **Spoiler answers** — VitePress `::: details Show answer` (or a clear custom label). The answer is the Agelan sentence or **loose** free English — not a second grammar lecture. No morph-gloss wall inside the spoiler unless the drill is explicitly about packaging.
5. **Small sets** — about **6–12 items per direction** max per band checkpoint. Prefer a tiny reused root bank over lexicon tourism. List the roots used once above the drills.
6. **Test the decision, not the dictionary** — good items force a choice the band taught (role letter, **-l** / **-m**, **`odo` last**, omit recoverable **`jal`**, …).
7. **Single sentences** — leave multi-turn scenes to [`examples/`](../examples/).
8. **People are names** — default people use the [house cast](grammar-docs.md#house-cast) (`zazawan`, `zulonun`, `zubuzun`) or a name already on the page, not **`umogo`** / **`ehado`**. English items use those names (*Azawan walks*). Speaker/listener specials only when the item is teaching those roots, or when the point is the discourse role (name unavailable, address set, clusivity). Inclusive *we* stays **`ana`**. Do not introduce foreign `PoS<…>n` names in early checkpoints.

## Shape (template)
<a id="template"></a>

Use a stable heading and anchor at the **end** of the band (before the next `## Intermediate` / `## Advanced`):

```md
### Translation practice
<a id="translation-practice"></a>

Short drills on this Beginner band. Try each item before opening **Show answer**. …

**Roots used here:** `…`

#### English → Agelan

**1.** *…*

::: details Show answer
`…`
:::

#### Agelan → English

**1.** `…`

::: details Show answer
*…*
:::
```

Omit recoverable **`jal`** unless the drill is teaching force. Match orthography and sense endings to the grammar page ([core.md § Orthography](../grammar/core.md#orthography)). English items that need a person use house names (*Azawan walks*), not *I* / *you*.

## Related meta

| Page | Owns |
|------|------|
| [grammar-docs.md](grammar-docs.md) | Learner prose, teach order, worked examples, [house cast](grammar-docs.md#house-cast) |
| [learning-levels.md](learning-levels.md) | Beginner / Intermediate / Advanced bands and cross-doc path |
| [glosses.md](glosses.md) | Morph gloss and free English (for teaching lines, not required in spoilers); [house-name glosses](glosses.md#house-cast) |
| [drill-generation.md](drill-generation.md) | Path allowlist, root bank, and **execute** procedure (one file per agent) |
