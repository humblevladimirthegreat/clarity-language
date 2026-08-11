# Gloss guidelines

How to write **glosses** in Agelan docs and examples. Design authority for morphology stays in the linked grammar pages; this page standardizes the **reading aid** only.

## Goals

A gloss should answer: *what is each Agelan piece doing in the clause — in English labels?*

| Goal | Gloss does | Gloss does not |
|------|------------|----------------|
| Slot + sense | Show PoS letter and the **active English sense** | Quote Agelan phonology (`umogo`, `uze`, …) |
| Separate senses | Treat literal / metaphorical / proper / overlay as **different English roots** | Chain etymology (`microphone→speaker`) |
| Endings | Drop **-l** / **-m** / **-n** when they only pick which sense-root applies | Repeat those endings after a sense that already encodes them |
| Structure | Keep mid-word `x` pieces, **-sh**, and binding visible | Invent full English syntax for Agelan structure |
| Binding | Point **-r** (and span anaphors) at the antecedent when known | Collapse to English *he* / *she* / *it* |
| Underspecification | Keep vague Agelan vague (`someone`, bare joins) | Sharpen into a specific English claim |
| Separation | Stay word-aligned | Replace the free English line |

**Free English** (italic line / table “Gloss” in grammar pages) answers *what would you say naturally?* — idiomatic paraphrase, tone, and discourse flow. Do not merge free English into the morph gloss. Default free English is **loose** ([strict vs loose](#strict-vs-loose-free-english)).

## Layers

| Layer | Where | Form |
|-------|--------|------|
| **Morph gloss** | Dialogue turns, worked examples, teaching lines | Word-aligned pieces joined with ` · ` (below) |
| **Free English (loose)** | Same places, under or beside the morph gloss — **default** when only one free line | Natural paraphrase (*…*); drop Agelan packaging English doesn’t mark |
| **Free English (strict)** | Optional second free line (or alone when teaching packaging) | Keeps join packaging, value endings, evidential tags, cast letters, …; teaching dialogues may show **both** labeled `strict:` / `loose:` |
| **Grammar-table gloss** | Inventory / contrast tables in grammar docs | Short free English (often *italic*); optional parenthetical notes — loose unless the row teaches packaging |
| **Lexicon fields** | `lexicon-published.csv` / overlays | Literal / metaphorical / mnemonic / definition — **inputs** to morph glosses, not utterance glosses |

Grammar tables may keep a column named **Gloss** for free English. When a table needs morphology, use a **Morph** column or a separate morph line in the same format as dialogues.

## Strict vs loose free English
<a id="strict-vs-loose-free-english"></a>

| Layer | Job |
|-------|-----|
| **Morph** | Keep Agelan structure (PoS, binding, join job, stance tags, …) |
| **Loose free** | Idiomatic English claim — default when a page shows one free line |
| **Strict free** | Same claim with Agelan packaging spelled out in English — use alone for packaging lessons, or **with** loose in teaching dialogues (e.g. [rainy evening](../examples/rainy-evening-dialogue.md)) |

**Loose** drops distinctions English doesn’t mark; morph already carries them. **Keep** in loose only what changes the English sentence (who / what / polarity / negation; force English can say; stance that changes the verb; comparative / causal / plan content when that is the point).

### Drop in loose

| Agelan distinction | Loose free does |
|---------------------|-----------------|
| Cast / letter anaphors (`zuzur` + “(A)”) | Ordinary *I / you / he / she / they*, or a **name** once known |
| Role metalanguage (`speaker`, `listener`, `interlocutors`) | *I / you / we* |
| Join packaging (open `zam` vs closed `zal`, exclusive `dol`, fence shape) | Plain *and / or*; no “exactly one”, no open-list footnotes |
| Sense-picking **-l / -m / -n** | Never (already omitted from morph when they only pick sense) |
| Values **channel / standing / force / changeability** | Keep only what changes English (*can't* vs *shouldn't* vs unmet need as content); drop “(motive, soft standing)”, “commit force”, … |
| Emotion compose ACT / LOCUS / activation | Ordinary emotion English (*we're glad*), not “pleasure met · internal” |
| Evidential / universality **tags** | Fold in only if English wants it (*I hear…*, *usually*); else omit |
| Span fence labels | Quotes / parentheses; no “Cite:” / “aside:” |
| Role / SAME scaffolding | *the speaker* / *is* — not “agent of speech” / “identical to” |
| Associative **-sh** spelled out | *you all* / *they* when English is enough |
| Numbered-alternative pedagogy | *First, …* / *Finally, …* is fine; drop “problem #1” metalabel unless teaching numbering |

### Keep in loose

- Who / what / polarity / negation
- Force English can say (*please*, *don’t*, *I wonder*)
- Stance that changes the verb (*can't* vs *ought not* vs unmet need as content)
- Comparatives / equatives / causation / plan when they are the point of the turn

### Example (same Agelan, three readings)

Agelan: `jol duber dadedal dogevel dol von.`

```
gloss: `j-question` · `d-←Ubenaxuzonun` · `d-tea` · `d-coffee` · `d-or-exactly-one` · `v-choose`

*Do you want tea or coffee?*                          ← loose (default)
*Do you (B) choose tea or coffee — exactly one?*      ← strict (teaching exclusive *or*)
```

## Senses are separate roots

Published strings share one phonological root, but **literal**, **metaphorical**, and **proper / overlay** readings are **different gloss roots**. Gloss only the English sense that is active. Do **not** write the Agelan letters, and do **not** write **-l** / **-m** / **-n** when that ending only selected this sense.

| Agelan | Morph gloss | Not |
|---------|-------------|-----|
| `zumogol` | `z-microphone` | `z-umogo(microphone)-l`, `z-microphone-l` |
| `zumogom` | `z-speaker` | `z-umogo(microphone→speaker)-m` |
| `zumogon` | `z-speaker` | `z-umogo(speaker)-n`, `z-speaker-n` |
| `guzel` | `g-smile` | `g-uze(smile)-l` |
| `guzem` | `g-happy` | `g-uze(smile→happy)-m`, `g-happy-m` |
| `huhunul` | `h-fishing` | `h-uhunu(fishing)-l` |
| `huhunum` | `h-witnessed` | `h-uhunu(fishing→witnessed)-m` |
| `gohuzem` | `g-home` | `g-ohuze(house→home)-m` |

Same English label for `zumogom` and `zumogon` is fine: both are the *speaker* sense-root; the written ending is recoverable from the Agelan line and from [reference-suffix.md](../grammar/reference-suffix.md). The gloss’s job is the **sense**, not a second orthography.

**Closed overlays** ([sense-form](../grammar/special-vocabulary.md#sense-form)): gloss the overlay reading for that `(sense_form, pos)`, not the ordinary lexicon literal. Prefer short stable labels (`witnessed`, `COMMENT`, `SAME`, `plan`, `DECISION`, …).

**Special pronouns** ([pronouns.md](../grammar/pronouns.md)): `zumogon` / `zehadon` / `zanan` / `zenun` / `…odo…` → `z-speaker` / `z-listener` / `z-interlocutors` / `z-someone` / `…-next-clause` — never emoji etymology.

## Morph gloss format

### Word shape

```
{PoS}-{english}(-x-{english|TAG})*[-sh]
```

- **PoS** — single letter matching the written prefix (`j` `z` `d` `b` `v` `g` `w` `h` `x`). Left-bound adjectives: `gl-…`.
- **english** — short English label for the **active** sense (hyphens OK inside a label: `next-clause`, `or-exactly-one`). **No** Agelan root letters.
- **`-x-`** — mid-word compound / stance / role / span hinge; each piece is English (or a stable TAG).
- **-l / -m / -n** — **omit** when they only choose which sense-root is in play (the usual content-word case).
- **-sh** — append `-sh` when the written word has associative / address-set / collective **-sh** (`z-speaker-sh`, `z-listener-sh`).
- **Prefix-less** revisers: English only — `instead`, `rather`, `additionally` (no fake PoS).

Separate words with ` · ` (space-middot-space). One morph gloss line per Agelan line (or per turn).

### When an ending still appears in the gloss

Only when it is **not** already baked into the English sense-root:

| Keep in gloss | Why |
|---------------|-----|
| `-sh` | Associative / collective / address-set — not a sense picker |
| `(←…)` binding for **-r** | Resume is not a lexicon sense; see below |
| Rare teaching callouts | If you must contrast two same-sense forms that differ only by ending, prefer distinct English labels (`and.open` / `and`) over re-attaching `-m` / `-l` |

Do **not** write `-l` / `-m` / `-n` after a sense that already is the literal / metaphorical / proper / overlay root.

### Sense labels

- Prefer lexicon / overlay wording when short (`tea`, `speaker`, `witnessed`).
- Prefer **stable tags** for closed inventory (uppercase OK when the docs already use them): `COMMENT`, `DECISION`, `SAME`, `WITNESSED`, `ABIL`.
- Do **not** use arrows (`→`) or etymology chains.
- Do **not** put PoS names in the label (`noun`, `proper`).

### Anaphors (`-r`)

The binder **is** the gloss root. No trailing `-r` (resume is already marked by `←`).

| Case | Morph gloss |
|------|-------------|
| Letter / full-root resume with known name | `z-←Ubenaxuzonun` |
| Resume of a prior content word | `z-←someone` / `d-←tea` |
| Fill-ask / unspecified member | `z-who` / `z-something` (as the docs require for that form) |

Do not write `z-←microphone` for a speaker antecedent.

### Mid-word `x` families

Gloss each piece by **family** ([x-compounds.md](../grammar/x-compounds.md)) — English only; drop sense-picking endings:

| Family | Example Agelan | Morph gloss |
|--------|-----------------|-------------|
| Ordinary / name compound | `jubenaxuzonun` | `j-hospitality-x-optimism` |
| Ability / values stance | `vawuxul` | `v-walking-x-can't` |
| Values stance on need | `hodoloxem` | `h-competence-x-motive` |
| Role compound | `zaxezeber` | `z-agent-x-dialogue` |
| Span open / close | `hexal` … `xuxul` | `h-aside-x-multi` · … · `x-span-close` |
| Number / enumeration | `x#e-` | `x-starting-with` |

For **phrasal proper names**, gloss each root with the sense **chosen for the label** (why those roots were picked). Proper **-n** is not written.

### Underspecification and joins

Bake join / reviser **job** into the English label (including open vs closed when it matters). Do not re-attach sense-picking endings:

| Agelan | Morph gloss |
|---------|-------------|
| `zam` | `z-and.open` |
| `zal` | `z-and` |
| `dol` | `d-or-exactly-one` |
| `zel` | `z-rank/more` |
| `zael` | `z-as…as` |
| `zar` | `z-who` / `z-something` |
| `xan` | `x-and-then` |
| `ol` | `instead` |
| `von` | `v-choose` |

## Worked examples

### Single words

| Agelan | Morph gloss | Free English (separate) |
|---------|-------------|-------------------------|
| `jawel` | `j-greeting` | *Hello.* |
| `jael` | `j-yes` | *Yes.* |
| `jol` | `j-question` | *(yes/no or fill-ask)* |
| `zumogol` | `z-microphone` | *a microphone* |
| `zumogon` | `z-speaker` | *I* / *the speaker* |
| `zehadon` | `z-listener` | *you* / *the listener* |
| `zanan` | `z-interlocutors` | *we* (speaker ∪ address set) |
| `zumogonsh` | `z-speaker-sh` | *I and associates* |
| `zehadonsh` | `z-listener-sh` | *you-all* (address set) |
| `guzem` | `g-happy` | *happy* |
| `huhunum` | `h-witnessed` | *per memory* |
| `howarom` | `h-plan` | *as a plan* |
| `gogunol` | `g-SAME` | *identical to* (identity host) |
| `von` | `v-choose` | *chooses (exactly one)* |

### Dialogue turn (morph + loose free)

Agelan: `jael zumogon zam zehadon zal guzem.`

```
gloss: `j-yes` · `z-speaker` · `z-and.open` · `z-listener` · `z-and` · `g-happy`

*Yes — you and I are happy.*
```

(Prefer **`zanan guzem`** when the point is interlocutor *we*, not an explicit two-name census.)

### Metaphor vs overlay vs literal

Agelan: `xezabel zuber huhunum zarunal.`

```
gloss: `x-however` · `z-←Ubenaxuzonun` · `h-witnessed` · `z-rain`

*Still — it’s raining, as I remember.*
```

(Strict teaching line: *However — that one (B), per memory — it rains.*)

### Ability + value motive

Agelan: `juel zumogon vawuxul hodoloxem.`

```
gloss: `j-no` · `z-speaker` · `v-walking-x-can't` · `h-competence-x-motive`

*No — I can't walk right now.*
```

### Numbered alternative + unmet pleasure

Agelan: `x#e- zubezul g#1 zumogonsh hazedoxul.`

```
gloss: `x-starting-with` · `z-problem` · `g-first` · `z-speaker-sh` · `h-pleasure-x-unmet`

*First problem: we're not enjoying this.*
```

### Inclusive *we* (interlocutors)

Agelan: `jael xamalal zanan howarom vawul vul.`

```
gloss: `j-yes` · `x-therefore` · `z-interlocutors` · `h-plan` · `v-walking` · `v-not`

*Yes — so we're planning not to walk.*
```

### Grammar-table gloss (free English only)

From comparative inventories — no morph line required (loose claim; parenthetical note OK when the row teaches packaging):

| Example | Gloss |
|---------|-------|
| `z<Sam>n z<Lea>n zel g<big>l` | *Sam is bigger than Lea* (closed; Sam ≻ Lea on *big*) |

When teaching the join morphology in the same table, add morph:

| Example | Morph | Gloss |
|---------|-------|-------|
| `… zel g<big>l` | `z-rank/more` · `g-big` | *… is bigger …* |

Foreign `<>` roots: use the donor sense as the English label (`g-big`).

## Anti-patterns

| Avoid | Why | Prefer |
|-------|-----|--------|
| `z-umogo(speaker)-n` | Agelan letters + redundant ending | `z-speaker` |
| `z-microphone-l` | Ending already chose the literal root | `z-microphone` |
| `z-microphone→speaker` | Etymology chain | `z-speaker` |
| Morph line that is only idiomatic English | Confuses layers | Morph + separate free line |
| Loose free packed with cast letters / join footnotes / value endings | Duplicates morph; not “what you’d say” | Idiomatic claim; use **strict** free only for teaching |
| English *he* / *she* inside morph for **-r** | Hides Agelan binding | `z-←Antecedent` |
| New synonym every example for the same overlay | Unstable inventory | Fixed labels (`witnessed`, `COMMENT`, …) |

## Checklist

1. English senses only — no Agelan root spellings.
2. No `→` etymology chains.
3. No **-l** / **-m** / **-n** when they only selected the sense-root.
4. Compounds / stance / role / span `x` pieces are segmented in English.
5. **-r** uses `←…` (no trailing `-r`); **-sh** stays as `-sh`.
6. Free English is on its own line (or grammar-table Gloss column) — **loose** by default; **strict** only when teaching packaging.

## See also

- [reference-suffix.md](../grammar/reference-suffix.md) — **-l** / **-m** / **-n** / **-r**
- [special-vocabulary.md](../grammar/special-vocabulary.md#sense-form) — overlays and closed labels
- [pronouns.md](../grammar/pronouns.md) — **-r** and special pronouns
- [x-compounds.md](../grammar/x-compounds.md) — mid-word `x` families
- [core.md](../grammar/core.md#orthography) — written orthography
- [values.md](../grammar/values.md) — need stances and endings (morph keeps them; loose free usually drops channel / standing / force / changeability)
