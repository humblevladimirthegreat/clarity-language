# Gloss guidelines

How to write **glosses** in Agalan docs and examples. Design authority for morphology stays in the linked grammar pages; this page standardizes the **reading aid** only.

## Goals

A gloss should answer: *what is each Agalan piece doing in the clause — in English labels?*

| Goal | Gloss does | Gloss does not |
|------|------------|----------------|
| Slot + sense | Show PoS letter and the **active English sense** | Quote Agalan phonology (`ugobo`, `uzumu`, …) |
| Separate senses | Treat literal / metaphorical / proper / overlay as **different English roots** | Chain etymology (`microphone→speaker`) |
| Endings | Drop **-l** / **-m** / **-n** when they only pick which sense-root applies | Repeat those endings after a sense that already encodes them |
| Structure | Keep mid-word `x` pieces, named **`@`**, **-sh**, and binding visible | Invent full English syntax for Agalan structure |
| Binding | Point **-r** (and span anaphors) at the antecedent when known | Collapse to English *he* / *she* / *it* |
| Underspecification | Keep vague Agalan vague (`someone`, bare joins) | Sharpen into a specific English claim |
| Separation | Stay word-aligned | Replace the free English line |

**Free English** (italic line / table “Gloss” in grammar pages) answers *what would you say naturally?* — idiomatic paraphrase, tone, and discourse flow. Do not merge free English into the morph gloss. Default free English is **loose** ([strict vs loose](#strict-vs-loose-free-english)).

## Layers

| Layer | Where | Form |
|-------|--------|------|
| **Morph gloss** | Dialogue turns, worked examples, teaching lines | Word-aligned pieces joined with ` · ` (below) |
| **Free English (loose)** | Same places, under or beside the morph gloss — **default** when only one free line | Natural paraphrase (*…*); drop Agalan packaging English doesn’t mark |
| **Free English (strict)** | Optional second free line (or alone when teaching packaging) | Keeps join packaging, value endings, evidential tags, cast letters, …; teaching dialogues may show **both** labeled `strict:` / `loose:` |
| **Grammar-table gloss** | Inventory / contrast tables in grammar docs | Short free English (often *italic*); optional parenthetical notes — loose unless the row teaches packaging |
| **Lexicon fields** | `lexicon-published.csv` / overlays | Literal / metaphorical / mnemonic / definition — **inputs** to morph glosses, not utterance glosses |

Grammar tables may keep a column named **Gloss** for free English. When a table needs morphology, use a **Morph** column or a separate morph line in the same format as dialogues.

## Strict vs loose free English
<a id="strict-vs-loose-free-english"></a>

| Layer | Job |
|-------|-----|
| **Morph** | Keep Agalan structure (PoS, binding, join job, stance tags, …) |
| **Loose free** | Idiomatic English claim — default when a page shows one free line |
| **Strict free** | Same claim with Agalan packaging spelled out in English — use alone for packaging lessons, or **with** loose in teaching dialogues (e.g. [rainy evening](../examples/rainy-evening-dialogue.md)) |

**Loose** drops distinctions English doesn’t mark; morph already carries them. **Keep** in loose only what changes the English sentence (who / what / polarity / negation; force English can say; stance that changes the verb; comparative / causal / plan content when that is the point).

### Drop in loose

| Agalan distinction | Loose free does |
|---------------------|-----------------|
| Cast / short resumes (`zuzur` + “(A)”) | Ordinary *I / you / he / she / they*, or a **name** once known |
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

### Example (same Agalan, three readings)

Agalan: `jol dubur dadedal dogovel dol von.`

```
gloss: `j-question` · `d-←Ubunexunowen` · `d-tea` · `d-coffee` · `d-or-exactly-one` · `v-choose`

*Do you want tea or coffee?*                          ← loose (default)
*Do you (B) choose tea or coffee — exactly one?*      ← strict (teaching exclusive *or*)
```

## Senses are separate roots

Published strings share one phonological root, but **literal**, **metaphorical**, and **proper / overlay** readings are **different gloss roots**. Gloss only the English sense that is active. Do **not** write the Agalan letters, and do **not** write **-l** / **-m** / **-n** when that ending only selected this sense.

| Agalan | Morph gloss | Not |
|---------|-------------|-----|
| `zugobol` | `z-microphone` | `z-ugobo(microphone)-l`, `z-microphone-l` |
| `zugobom` | `z-speaker` | `z-ugobo(microphone→speaker)-m` |
| `zugobon` | `z-speaker` | `z-ugobo(speaker)-n`, `z-speaker-n` |
| `guzumul` | `g-smile` | `g-uzumu(smile)-l` |
| `guzumum` | `g-happy` | `g-uzumu(smile→happy)-m`, `g-happy-m` |
| `huvuvul` | `h-fishing` | `h-uvuvu(fishing)-l` |
| `huvuvum` | `h-witnessed` | `h-uvuvu(fishing→witnessed)-m` |
| `gohohum` | `g-home` | `g-ohohu(house→home)-m` |

Same English label for `zugobom` and `zugobon` is fine: both are the *speaker* sense-root; the written ending is recoverable from the Agalan line and from [reference-suffix.md](../grammar/reference-suffix.md). The gloss’s job is the **sense**, not a second orthography.

**Closed overlays** ([sense-form](../grammar/special-vocabulary.md#sense-form)): gloss the overlay reading for that `(sense_form, pos)`, not the ordinary lexicon literal. Prefer short stable **English** labels (`witnessed`, `COMMENT`, `SAME`, `plan`, `DECISION`, …). The Agalan letters themselves follow the [published host root](parser-pipeline.md#closed-forms-follow-lexicon), except vowel-only join stems (`an` / `on` / …).

**Special pronouns** ([pronouns.md](../grammar/pronouns.md)): `zugobon` / `zedonen` / `zahan` / `zenenun` / `…orodo…` → `z-speaker` / `z-listener` / `z-interlocutors` / `z-someone` / `…-next-clause` — never emoji etymology.

## Morph gloss format

### Word shape

```
{PoS}-{english}(-x-{english|TAG})*[@][-sh]
```

- **PoS** — single letter matching the written prefix (`j` `z` `d` `b` `v` `g` `w` `h` `x`). Left-bound adjectives: `gl-…`.
- **english** — short English label for the **active** sense (hyphens OK inside a label: `next-clause`, `or-exactly-one`). **No** Agalan root letters.
- **`-x-`** — mid-word compound / stance / role / span hinge; each piece is English (or a stable TAG).
- **-l / -m / -n** — **omit** when they only choose which sense-root is in play (the usual content-word case). Named reference **-n** is **`@`**, not the letters `-n`.
- **`@`** — append when **-n** is **named reference** (house-cast, office handles, `PoS<…>n`, phrasal names). Do **not** add `@` when **-n** only selected a special or overlay sense (`zugobon` → `z-speaker`, `zahan` → `z-interlocutors`) or when join **-n** is a join ending (`van`, `xan`).
- **-sh** — append `-sh` after `@` if both apply (`z-grace@-sh`). Use `-sh` when the written word has associative / address-set / collective **-sh** (`z-speaker-sh`, `z-listener-sh`).
- **Prefix-less** revisers: English only — `instead`, `rather`, `additionally` (no fake PoS).

Separate words with ` · ` (space-middot-space). One morph gloss line per Agalan line (or per turn).

### When an ending still appears in the gloss

Only when it is **not** already baked into the English sense-root:

| Keep in gloss | Why |
|---------------|-----|
| `@` | Named reference **-n** — the sense (`grace`) is not the job; the job is *this is a name* |
| `-sh` | Associative / collective ascription / collective doing / address-set — not a sense picker |
| `(←…)` binding for **-r** | Resume is not a lexicon sense; see below |
| Rare teaching callouts | If you must contrast two same-sense forms that differ only by ending, prefer distinct English labels (`and.open` / `and`) over re-attaching `-m` / `-l` |

Do **not** write `-l` / `-m` / `-n` after a sense that already is the literal / metaphorical / overlay root. Named **-n** uses **`@`**, not `-n` / `-proper`.

### Sense labels

- Prefer lexicon / overlay wording when short (`tea`, `speaker`, `witnessed`).
- Prefer **stable tags** for closed inventory (uppercase OK when the docs already use them): `COMMENT`, `DECISION`, `SAME`, `WITNESSED`, `ABIL`.
- Do **not** use arrows (`→`) or etymology chains.
- Do **not** put PoS names in the label (`noun`, `proper`). Named reference is **`@`**, not the word *proper*.

### Anaphors (`-r`)

The binder **is** the gloss root. No trailing `-r` (resume is already marked by `←`).

| Case | Morph gloss |
|------|-------------|
| Letter / full-root resume with known name | `z-←Ubunexunowen` |
| House-cast name (`zazawan`, …) | `z-←grace` / `z-←courage` / `z-←beauty` (resume is **-r**, so no `@`) |
| Resume of a prior content word | `z-←someone` / `d-←tea` |
| Fill-ask / unspecified member | `z-who` / `z-something` (as the docs require for that form) |

Do not write `z-←microphone` for a speaker antecedent.

### House-cast given names
<a id="house-cast"></a>

Grammar examples use three single-root names ([grammar-docs.md](grammar-docs.md#house-cast)). Morph gloss is the published sense that formed the label, plus **`@`** because **-n** is named reference; free English is the name, not the virtue word and not *I* / *you*. Resume uses that same sense (`z-←grace`) with no `@` (**-r** is not a name). Do not write `z-Azawan` or `z-grace-proper`.

| Agalan | Morph gloss | Free English | Resume |
|--------|-------------|--------------|--------|
| `zazawan` | `z-grace@` | *Azawan* | `zazar` → `z-←grace` |
| `zululon` | `z-courage@` | *Ululon* | `zulur` → `z-←courage` |
| `zuhubun` | `z-beauty@` | *Uhubun* | `zuhur` → `z-←beauty` |

### Mid-word `x` families

Gloss each piece by **family** ([x-compounds.md](../grammar/x-compounds.md)) — English only; drop sense-picking endings:

| Family | Example Agalan | Morph gloss |
|--------|-----------------|-------------|
| Ordinary / name compound | `jubunexunowen` | `j-hospitality-x-optimism@` |
| Ordinary (three roots) | `zuzuzuxogovexadedan` | `z-sushi-x-coffee-x-tea@` |
| Ability / values stance | `vawalaxel` | `v-walking-unable-temporary` |
| Values stance on need | `holozoxem` | `h-competence-x-motive` |
| Role compound | `zaxezeher` | `z-agent-x-dialogue` |
| Span open / close | `hexal` … `xuxul` | `h-aside-x-multi` · … · `x-span-close` |
| Number / enumeration | `x#e-` | `x-starting-with` |

For **phrasal proper names**, gloss each root with the sense **chosen for the label** (why those roots were picked), then **`@`**. Do not put the Agalan clip in the english slot (`z-Azawan`).

### Underspecification and joins

Bake join / reviser **job** into the English label (including open vs closed when it matters). Do not re-attach sense-picking endings:

| Agalan | Morph gloss |
|---------|-------------|
| `zam` | `z-and.open` |
| `zal` | `z-and` |
| `vam` | `v-and.open` |
| `dol` | `d-or-exactly-one` |
| `zol` | `z-or-exactly-one` |
| `zel` | `z-rank/more` |
| `zael` | `z-as…as` |
| `zaem` | `z-as…as.open` |
| `zar` | `z-who` / `z-something` |
| `zul` / `gul` | `z-not` / `g-not` |
| `zual` | `z-everything-but` |
| `xan` | `x-and-then` |
| `ol` | `instead` |
| `am` | `including.open` |
| `al` | `additionally` (discourse) / `including` (in-clause closed) |
| `el` | `rather` |
| `ul` | `except` |
| `hal` (listed) | `h-only-when` |
| `hal` (bare) | `h-never` |
| `hual` (bare) | `h-always` |
| `von` | `v-choose` |
| `g+3` | `g-three` |
| `g#2` | `g-second` |
| `g+` | `g-more-than-one` |

## Worked examples

### Single words

| Agalan | Morph gloss | Free English (separate) |
|---------|-------------|-------------------------|
| `jawavel` | `j-greeting` | *Hello.* |
| `jael` | `j-yes` | *Yes.* |
| `jol` | `j-question` | *(yes/no or fill-ask)* |
| `zugobol` | `z-microphone` | *a microphone* |
| `zugobon` | `z-speaker` | *I* / *the speaker* |
| `zedonen` | `z-listener` | *you* / *the listener* |
| `zazawan` | `z-grace@` | *Azawan* |
| `zahan` | `z-interlocutors` | *we* (speaker ∪ address set) |
| `zugobonsh` | `z-speaker-sh` | *I and associates* |
| `zedonensh` | `z-listener-sh` | *you-all* (address set) |
| `guzumum` | `g-happy` | *happy* |
| `huvuvum` | `h-witnessed` | *per memory* |
| `howoram` | `h-plan-sketch` | *as a sketch plan* |
| `gonunul` | `g-SAME` | *identical to* (identity host) |
| `von` | `v-choose` | *chooses (exactly one)* |

### Dialogue turn (morph + loose free)

Agalan: `jael zugobon zam zedonen zal guzumum.`

```
gloss: `j-yes` · `z-speaker` · `z-and.open` · `z-listener` · `z-and` · `g-happy`

*Yes — you and I are happy.*
```

(Prefer **`zahan guzumum`** when the point is interlocutor *we*, not an explicit two-name census.)

### Metaphor vs overlay vs literal

Agalan: `xezebal zubur huvuvum zanunul.`

```
gloss: `x-however` · `z-←Ubunexunowen` · `h-witnessed` · `z-rain`

*Still — it’s raining, as I remember.*
```

(Strict teaching line: *However — that one (B), per memory — it rains.*)

### Ability + value motive

Agalan: `juel zugobon vawalaxel holozoxem.`

```
gloss: `j-no` · `z-speaker` · `v-walking-unable-temporary` · `h-competence-x-motive`

*No — I can't walk right now.*
```

### Numbered alternative + unmet pleasure

Agalan: `x#e- zuzebul g#1 zugobonsh haweroxur.`

```
gloss: `x-starting-with` · `z-problem` · `g-first` · `z-speaker-sh` · `h-pleasure-x-unmet`

*First problem: we're not enjoying this.*
```

### Inclusive *we* (interlocutors)

Agalan: `jael xezazal zahan howoram vawalal vul.`

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
| `z-ugobo(speaker)-n` | Agalan letters + redundant ending | `z-speaker` |
| `z-Azawan` / `z-grace-proper` | Name or the word *proper* in the english slot | `z-grace@` |
| `zam` / `hal` / `am` as the whole morph | Agalan letters where the job belongs | `z-and.open` / `h-only-when` / `including.open` |
| `z-microphone-l` | Ending already chose the literal root | `z-microphone` |
| `z-microphone→speaker` | Etymology chain | `z-speaker` |
| Morph line that is only idiomatic English | Confuses layers | Morph + separate free line |
| Loose free packed with cast letters / join footnotes / value endings | Duplicates morph; not “what you’d say” | Idiomatic claim; use **strict** free only for teaching |
| English *he* / *she* inside morph for **-r** | Hides Agalan binding | `z-←Antecedent` |
| New synonym every example for the same overlay | Unstable inventory | Fixed labels (`witnessed`, `COMMENT`, …) |

## Checklist

1. English senses only — no Agalan root spellings.
2. No `→` etymology chains.
3. No **-l** / **-m** / **-n** when they only selected the sense-root. Named **-n** is **`@`** (`z-grace@`), not `-n` or `-proper`.
4. Compounds / stance / role / span `x` pieces are segmented in English.
5. **-r** uses `←…` (no trailing `-r`); **-sh** stays as `-sh`; named **-n** stays as `@`. Resume is `z-←grace`, not `z-r`. Fill-ask is `z-who`, not `z-ar`.
6. Free English is on its own line (or grammar-table Gloss column) — **loose** by default; **strict** only when teaching packaging.

## See also

- [reference-suffix.md](../grammar/reference-suffix.md) — **-l** / **-m** / **-n** / **-r**
- [special-vocabulary.md](../grammar/special-vocabulary.md#sense-form) — overlays and closed labels
- [pronouns.md](../grammar/pronouns.md) — **-r** and special pronouns
- [x-compounds.md](../grammar/x-compounds.md) — mid-word `x` families
- [core.md](../grammar/core.md#orthography) — written orthography
- [values.md](../grammar/values.md) — need stances and endings (morph keeps them; loose free usually drops channel / standing / force / changeability)
