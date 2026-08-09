# Gloss guidelines

How to write **glosses** in Clarity docs and examples. Design authority for morphology stays in the linked grammar pages; this page standardizes the **reading aid** only.

## Goals

A gloss should answer: *what is each Clarity piece doing in the clause — in English labels?*

| Goal | Gloss does | Gloss does not |
|------|------------|----------------|
| Slot + sense | Show PoS letter and the **active English sense** | Quote Clarity phonology (`umogo`, `uze`, …) |
| Separate senses | Treat literal / metaphorical / proper / overlay as **different English roots** | Chain etymology (`microphone→speaker`) |
| Endings | Drop **-l** / **-m** / **-n** when they only pick which sense-root applies | Repeat those endings after a sense that already encodes them |
| Structure | Keep mid-word `x` pieces, **-sh**, and binding visible | Invent full English syntax for Clarity structure |
| Binding | Point **-r** (and span anaphors) at the antecedent when known | Collapse to English *he* / *she* / *it* |
| Underspecification | Keep vague Clarity vague (`someone`, bare joins) | Sharpen into a specific English claim |
| Separation | Stay word-aligned | Replace the free English line |

**Free English** (italic line / table “Gloss” in grammar pages) answers *what would you say naturally?* — idiomatic paraphrase, tone, and discourse flow. Do not merge free English into the morph gloss.

## Layers

| Layer | Where | Form |
|-------|--------|------|
| **Morph gloss** | Dialogue turns, worked examples, teaching lines | Word-aligned pieces joined with ` · ` (below) |
| **Free English** | Same places, under or beside the morph gloss | Natural paraphrase (*…*) |
| **Grammar-table gloss** | Inventory / contrast tables in grammar docs | Short free English (often *italic*); optional parenthetical notes |
| **Lexicon fields** | `lexicon-published.csv` / overlays | Literal / metaphorical / mnemonic / definition — **inputs** to morph glosses, not utterance glosses |

Grammar tables may keep a column named **Gloss** for free English. When a table needs morphology, use a **Morph** column or a separate morph line in the same format as dialogues.

## Senses are separate roots

Published strings share one phonological root, but **literal**, **metaphorical**, and **proper / overlay** readings are **different gloss roots**. Gloss only the English sense that is active. Do **not** write the Clarity letters, and do **not** write **-l** / **-m** / **-n** when that ending only selected this sense.

| Clarity | Morph gloss | Not |
|---------|-------------|-----|
| `zumogol` | `z-microphone` | `z-umogo(microphone)-l`, `z-microphone-l` |
| `zumogom` | `z-speaker` | `z-umogo(microphone→speaker)-m` |
| `zumogon` | `z-speaker` | `z-umogo(speaker)-n`, `z-speaker-n` |
| `guzel` | `g-smile` | `g-uze(smile)-l` |
| `guzem` | `g-happy` | `g-uze(smile→happy)-m`, `g-happy-m` |
| `huhunul` | `h-fishing` | `h-uhunu(fishing)-l` |
| `huhunum` | `h-witnessed` | `h-uhunu(fishing→witnessed)-m` |
| `gohuzem` | `g-home` | `g-ohuze(house→home)-m` |

Same English label for `zumogom` and `zumogon` is fine: both are the *speaker* sense-root; the written ending is recoverable from the Clarity line and from [reference-suffix.md](reference-suffix.md). The gloss’s job is the **sense**, not a second orthography.

**Closed overlays** ([sense-form](special-vocabulary.md#sense-form)): gloss the overlay reading for that `(sense_form, pos)`, not the ordinary lexicon literal. Prefer short stable labels (`witnessed`, `COMMENT`, `SAME`, `plan`, …).

**Special pronouns** ([pronouns.md](pronouns.md)): `zumogon` / `zehadon` / `zanan` / `zenun` / `…odo…` → `z-speaker` / `z-listener` / `z-interlocutors` / `z-someone` / `…-next-clause` — never emoji etymology.

## Morph gloss format

### Word shape

```
{PoS}-{english}(-x-{english|TAG})*[-sh]
```

- **PoS** — single letter matching the written prefix (`j` `z` `d` `b` `v` `g` `w` `h` `x`). Left-bound adjectives: `gl-…`.
- **english** — short English label for the **active** sense (hyphens OK inside a label: `next-clause`, `or-exactly-one`). **No** Clarity root letters.
- **`-x-`** — mid-word compound / stance / role / span hinge; each piece is English (or a stable TAG).
- **-l / -m / -n** — **omit** when they only choose which sense-root is in play (the usual content-word case).
- **-sh** — append `-sh` when the written word has associative / address-set / collective **-sh** (`z-speaker-sh`, `z-listener-sh`).
- **Prefix-less** revisers: English only — `instead`, `rather`, `additionally` (no fake PoS).

Separate words with ` · ` (space-middot-space). One morph gloss line per Clarity line (or per turn).

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
- Prefer **stable tags** for closed inventory (uppercase OK when the docs already use them): `COMMENT`, `SAME`, `WITNESSED`, `ABIL`.
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

Gloss each piece by **family** ([x-compounds.md](x-compounds.md)) — English only; drop sense-picking endings:

| Family | Example Clarity | Morph gloss |
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

| Clarity | Morph gloss |
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

| Clarity | Morph gloss | Free English (separate) |
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

### Dialogue turn (morph + free)

Clarity: `jael. zumogon zam zehadon zal guzem.`

```
gloss: `j-yes` · `z-speaker` · `z-and.open` · `z-listener` · `z-and` · `g-happy`

*Yes. I and you are happy.*
```

(Prefer **`zanan guzem`** when the point is interlocutor *we*, not an explicit two-name census.)

### Metaphor vs overlay vs literal

Clarity: `xezabel zuber huhunum zarunal.`

```
gloss: `x-however` · `z-←Ubenaxuzonun` · `h-witnessed` · `z-rain`

*However — that one (B), per memory — it rains.*
```

### Ability + value motive

Clarity: `juel. zumogon vawuxul hodoloxem.`

```
gloss: `j-no` · `z-speaker` · `v-walking-x-can't` · `h-competence-x-motive`

*No. I can't walk — for competence (motive).*
```

### Numbered alternative + unmet pleasure

Clarity: `x#e- zubezul g#1 zumogonsh hazedoxul.`

```
gloss: `x-starting-with` · `z-problem` · `g-first` · `z-speaker-sh` · `h-pleasure-x-unmet`

*Starting with: problem one — I and associates have unmet pleasure.*
```

### Inclusive *we* (interlocutors)

Clarity: `jael. xamalal zanan howarom vawul vul.`

```
gloss: `j-yes` · `x-therefore` · `z-interlocutors` · `h-plan` · `v-walking` · `v-not`

*Yes. Therefore we (you and I) plan not to walk.*
```

### Grammar-table gloss (free English only)

From comparative inventories — no morph line required:

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
| `z-umogo(speaker)-n` | Clarity letters + redundant ending | `z-speaker` |
| `z-microphone-l` | Ending already chose the literal root | `z-microphone` |
| `z-microphone→speaker` | Etymology chain | `z-speaker` |
| Morph line that is only idiomatic English | Confuses layers | Morph + separate free line |
| English *he* / *she* inside morph for **-r** | Hides Clarity binding | `z-←Antecedent` |
| New synonym every example for the same overlay | Unstable inventory | Fixed labels (`witnessed`, `COMMENT`, …) |

## Checklist

1. English senses only — no Clarity root spellings.
2. No `→` etymology chains.
3. No **-l** / **-m** / **-n** when they only selected the sense-root.
4. Compounds / stance / role / span `x` pieces are segmented in English.
5. **-r** uses `←…` (no trailing `-r`); **-sh** stays as `-sh`.
6. Free English is on its own line (or grammar-table Gloss column).

## See also

- [reference-suffix.md](reference-suffix.md) — **-l** / **-m** / **-n** / **-r**
- [special-vocabulary.md](special-vocabulary.md#sense-form) — overlays and closed labels
- [pronouns.md](pronouns.md) — **-r** and special pronouns
- [x-compounds.md](x-compounds.md) — mid-word `x` families
- [language-reference.md](language-reference.md#orthography) — written orthography
