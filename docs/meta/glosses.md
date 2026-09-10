# Gloss guidelines

How to write **glosses** in Agalan docs and examples. Design authority for morphology stays in the linked grammar pages; this page standardizes the **reading aid** only.

## Goals

A gloss should answer: *what is each Agalan piece doing in the clause — in English labels?*

| Goal | Gloss does | Gloss does not |
|------|------------|----------------|
| Slot + sense | Show PoS letter and the **active English sense** | Quote Agalan phonology (`ugobo`, `uzumu`, …) |
| Separate senses | Treat literal / metaphorical / proper / overlay as **different English roots** | Chain etymology (`microphone→speaker`) |
| Endings | Drop **-l** / **-m** / **-n** when they only pick which sense-root applies | Repeat those endings after a sense that already encodes them |
| Structure | Keep mid-word `x` pieces, **-x**, and binding visible | Invent full English syntax for Agalan structure; copy writing glyphs (`@` / `~`) into the gloss |
| Binding | Point **-r** (and span anaphors) at the antecedent when known | Collapse to English *he* / *she* / *it* |
| Underspecification | Keep vague Agalan vague (`someone`, bare joins) | Sharpen into a specific English claim |
| Separation | Stay word-aligned | Replace the free English line |

**Free English** (quoted line / table “Gloss” in grammar pages) answers *what would you say naturally?* — idiomatic paraphrase, tone, and discourse flow. Do not merge free English into the morph gloss. Default free English is **loose** ([strict vs loose](#strict-vs-loose-free-english)).

## Layers

| Layer | Where | Form |
|-------|--------|------|
| **Morph gloss** | Dialogue turns, clause / phrase examples, teaching lines | Word-aligned pieces joined with spaced ` | `; one roman line (below). **Omit** when that line would match the quoted English ([when to skip](#example-block)). |
| **Free English (loose)** | Same places, under the morph gloss — **default** when only one free line | Natural paraphrase in `"double quotes"`; drop Agalan packaging English doesn’t mark |
| **Free English (strict)** | Optional second quoted line (or alone when teaching packaging) | Keeps join packaging, value endings, evidential tags, cast letters, …; teaching dialogues may show **both** labeled `strict:` / `loose:` |
| **Grammar-table gloss** | Inventory / contrast tables in grammar docs | Short free English in **English** (often *italic* in table cells); optional parenthetical notes — loose unless the row teaches packaging. **Cue** is not a gloss ([cues](grammar-docs.md#cues-columns)). |
| **Lexicon fields** | `lexicon-published.csv` / overlays | Literal / metaphorical / mnemonic / definition — **inputs** to morph glosses, not utterance glosses. Literal English in a **Cue** cell is still not the morph gloss. |

Grammar tables may keep a column named **Gloss** for free English. When a table needs morphology, use a **Morph** column or a separate morph line in the same format as dialogues.

## Example block layout
<a id="example-block"></a>

Worked examples in grammar pages use a **blockquote**, not a code fence (so Markdown can render). **Backticks mark Agalan only.**

**When the morph line earns its place** (PoS letters, several words, mid-word **`x`**, binding, …):

```markdown
> `zazawan godogol.`
>
> z-Azawan | g-dog
>
> "Azawan is a dog."
```

**When it would only repeat the quote**, omit it — typical of a simple [citation](../grammar/reference-suffix.md#citation-forms) whose sense *is* the English:

```markdown
> `azawal`
>
> "swan"
```

A **complex citation** still gets a gloss if the morph unpacks structure the quote does not. An `x`-compound name is one word in Agalan and one name in English; the gloss shows the pieces:

```markdown
> `odunaxalanen`
>
> wish-x-guidance
>
> "Odunaxalanen"
```

| Line | Markup | Why |
|------|--------|-----|
| Surface | `` `agelan.` `` | Copyable Agalan; the only code span |
| Morph | `z-dog | v-walk` | English labels; roman (no italics, no per-token backticks); spaced ` | ` between **words** |
| Free English | `"A dog walks."` | Straight double quotes. Teaching notes stay **after** the quotes: `"Uhubun sings the Sing"` (that titled performance). |

Do **not** prefix the gloss with `gloss:`.

**Skip the morph line** when it would be the same as the quoted English (same readable words, ignoring quotes). That is a redundancy test, not “citation vs sentence.” Simple `azawal` / `"swan"` omits; `zazawan vawalal.` keeps `z-Azawan | v-walk` because that is not `"Azawan walks."`. Keep the line whenever it shows something the quote hides: role letters, several words, mid-word **`x`** pieces, binding, join jobs.

### Word separator
<a id="gloss-separator"></a>

Join morph **words** with **space + `|` + space** (`z-Azawan | v-walk`). Type it on a US keyboard (shift-backslash). Do **not** use middot (`·`): it is not on the keyboard and looks like a bullet.

Do not use `/` (already means PoS in the docs, and reads as *or*), hyphen (already inside labels: `z-dog`, `next-clause`), or comma (already inside English). A spaced semicolon (` ; `) is a fine fallback if `|` is awkward in a table cell.

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
| Associative **-x** spelled out | *you all* / *they* when English is enough |
| Numbered-alternative pedagogy | *First, …* / *Finally, …* is fine; drop “problem #1” metalabel unless teaching numbering |

### Keep in loose

- Who / what / polarity / negation
- Force English can say (*please*, *don’t*, *I wonder*)
- Stance that changes the verb (*can't* vs *ought not* vs unmet need as content)
- Comparatives / equatives / causation / plan when they are the point of the turn

### Example (same Agalan, three readings)

> `jol dubur dadedal dogovel dol von.`
>
> j-question | d-←Ubunexunowen | d-tea | d-coffee | d-or-exactly-one | v-choose
>
> "Do you want tea or coffee?" ← loose (default)
>
> "Do you (B) choose tea or coffee — exactly one?" ← strict (teaching exclusive *or*)

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
| `huvuvum` | `h-WITNESSED` | `h-uvuvu(fishing→WITNESSED)-m` |
| `gohohum` | `g-home` | `g-ohohu(house→home)-m` |

Same English label for `zugobom` and `zugobon` is fine: both are the *speaker* sense-root; the written ending is recoverable from the Agalan line and from [reference-suffix.md](../grammar/reference-suffix.md). The gloss’s job is the **sense**, not a second orthography.

**Closed overlays** ([sense-form](../grammar/special-vocabulary.md#sense-form)): gloss the overlay reading for that `(sense_form, pos)`, not the ordinary lexicon literal. Prefer short stable **English** labels (`witnessed`, `COMMENT`, `SAME`, `plan`, `DECISION`, …). The Agalan letters themselves follow the [published host root](parser-pipeline.md#closed-forms-follow-lexicon), except vowel-only join stems (`an` / `on` / …).

**Special pronouns** ([pronouns.md](../grammar/pronouns.md)): `zugobon` / `zedonen` / `zahan` / `zenenun` / `…orodo…` → `z-speaker` / `z-listener` / `z-interlocutors` / `z-someone` / `…-next-clause` — never emoji etymology.

## Morph gloss format

### Word shape

```
{PoS}-{english}(-x-{english|TAG})*[-x]
```

- **PoS** — single letter matching the written prefix (`j` `z` `d` `b` `v` `g` `w` `h` `x`). Left-bound adjectives: `gl-…`.
- **english** — short English label for the **active** sense (hyphens OK inside a label: `next-clause`, `or-exactly-one`). **No** Agalan root letters. **No** writing glyphs **`@`** / **`~`** (those mark **-n** / **-m** in Agalan spelling only: numbers, span fences).
- **`-x-`** — mid-word compound / stance / role / span hinge; each piece is English (or a stable TAG).
- **-l / -m / -n** — **omit**. They only choose which English sense-root is in play. Do not re-spell them as `-l` / `-m` / `-n` or as `@` / `~`.
- **Names** — the english slot is the **English name** (`z-Azawan`, `z-Hamlet`, `z-Abogon`, `z-Sushi-Coffee`), not the virtue or kind that formed the stem, and not `z-grace@`.
- **-x** — append `-x` when the written word has associative / address-set / collective **-x** (`z-Azawan-x`, `z-speaker-x`, `z-listener-x`).
- **Prefix-less** revisers: English only — `instead`, `rather`, `additionally` (no fake PoS).
- **Specials / overlays / joins** — still the overlay or join job (`z-speaker`, `v-and`), never `@` because the word happens to end in **-n**.

Separate **words** with spaced `|` (`z-dog | v-walk`). One morph gloss line per Agalan line (or per turn). In an [example block](#example-block), leave that line **roman** (no italics, no backticks on pieces; tables may still put a morph cell in backticks). Mid-word **`x`** stays inside one piece (`wish-x-guidance`). See [word separator](#gloss-separator).

### When an ending still appears in the gloss

Only when it is **not** already baked into the English sense-root:

| Keep in gloss | Why |
|---------------|-----|
| `-x` | Associative / collective ascription / collective doing / address-set — not a sense picker |
| `(←…)` binding for **-r** | Resume is not a lexicon sense; see below |
| Rare teaching callouts | If you must contrast two same-sense forms that differ only by ending, prefer distinct English labels (`and.open` / `and`, `j-question` / `j-soft-question`) over re-attaching `-m` / `-l` or `~` |

Do **not** write `-l` / `-m` / `-n`, **`@`**, or **`~`** after a sense. Named **-n** uses the English name (`z-Azawan`), not `-n` / `-proper` / `@`. Metaphor **-m** uses the metaphor word (`g-happy`), not `happy~`.

### Sense labels

- Prefer lexicon / overlay wording when short (`tea`, `speaker`, `witnessed`).
- Prefer **stable tags** for closed inventory (uppercase OK when the docs already use them): `COMMENT`, `DECISION`, `SAME`, `WITNESSED`, `LIVE`, `ABIL`.
- Do **not** use arrows (`→`) or etymology chains.
- Do **not** put PoS names in the label (`noun`, `proper`). Named reference is the English name, not the word *proper*.

### Anaphors (`-r`)

The binder **is** the gloss root. No trailing `-r` (resume is already marked by `←`).

| Case | Morph gloss |
|------|-------------|
| Letter / full-root resume with known name | `z-←Ubunexunowen` |
| House-cast name (`zazawan`, …) | `z-←Azawan` / `z-←Ululon` / `z-←Uhubun` |
| Resume of a prior content word | `z-←someone` / `d-←tea` |
| Fill-ask / unspecified member | `z-who` / `z-something` (as the docs require for that form) |

Do not write `z-←microphone` for a speaker antecedent.

### House-cast given names
<a id="house-cast"></a>

Grammar examples use three single-root names ([grammar-docs.md](grammar-docs.md#house-cast)). Morph gloss is the **English name**. Free English is that same name, not the virtue word and not *I* / *you*. Resume uses that name (`z-←Azawan`). Do not write `z-grace@`, `g-happy~`, or `z-grace-proper`.

| Agalan | Morph gloss | Free English | Resume |
|--------|-------------|--------------|--------|
| `zazawan` | `z-Azawan` | *Azawan* | `zazar` → `z-←Azawan` |
| `zululon` | `z-Ululon` | *Ululon* | `zulur` → `z-←Ululon` |
| `zuhubun` | `z-Uhubun` | *Uhubun* | `zuhur` → `z-←Uhubun` |

### Mid-word `x` families

Gloss each piece by **family** ([x-compounds.md](../grammar/x-compounds.md)) — English only; drop sense-picking endings:

| Family | Example Agalan | Morph gloss |
|--------|-----------------|-------------|
| Ordinary / name compound | `jubunexunowen` | `j-Ubunexunowen` |
| Ordinary (three roots) | `zuzuzuxogovexadedan` | `z-Sushi-Coffee-Tea` |
| Ability / values stance | `vawalaxel` | `v-walking-unable-temporary` |
| Values stance on need | `holozoxem` | `h-competence-x-motive` |
| Role compound | `zaxezeher` | `z-agent-x-dialogue` |
| Span open / close | `hexal` … `xuxul` | `h-aside-x-multi` · … · `x-span-close` |
| Number / enumeration | `x#e-` | `x-starting-with` |

For **phrasal proper names**, gloss the English name (`j-Ubunexunowen`, `z-Sushi-Coffee`). Segment mid-word **`x`** only when the page is teaching the compound pieces, and still omit `@`. Do not put Agalan letters in the english slot.

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
| `zazawan` | `z-Azawan` | *Azawan* |
| `zahan` | `z-interlocutors` | *we* (speaker ∪ address set) |
| `zugobonx` | `z-speaker-x` | *I and associates* |
| `zedonenx` | `z-listener-x` | *you-all* (address set) |
| `guzumum` | `g-happy` | *happy* |
| `huvuvum` | `h-WITNESSED` | *per memory* |
| `hadezem` | `h-LIVE` | *from the scene* |
| `howoram` | `h-plan-sketch` | *as a sketch plan* |
| `gonunul` | `g-SAME` | *identical to* (identity host) |
| `von` | `v-choose` | *chooses (exactly one)* |

### Dialogue turn (morph + loose free)

> `jael zugobon zam zedonen zal guzumum.`
>
> j-yes | z-speaker | z-and.open | z-listener | z-and | g-happy
>
> "Yes — you and I are happy."

(Prefer **`zahan guzumum`** when the point is interlocutor *we*, not an explicit two-name census.)

### Metaphor vs overlay vs literal

> `xezebal zubur huvuvum zanunul.`
>
> x-however | z-←Ubunexunowen | h-WITNESSED | z-rain
>
> "Still — it's raining, as I remember."

(Strict teaching line: *However — that one (B), per memory — it rains.*)

### Ability + value motive

> `juel zugobon vawalaxel holozoxem.`
>
> j-no | z-speaker | v-walking-unable-temporary | h-competence-x-motive
>
> "No — I can't walk right now."

### Numbered alternative + unmet pleasure

> `x#e- zuzebul g#1 zugobonx haweroxur.`
>
> x-starting-with | z-problem | g-first | z-speaker-x | h-pleasure-x-unmet
>
> "First problem: we're not enjoying this."

### Inclusive *we* (interlocutors)

> `jael xezazal zahan howoram vawalal vul.`
>
> j-yes | x-therefore | z-interlocutors | h-plan | v-walking | v-not
>
> "Yes — so we're planning not to walk."

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
| `z-grace@` / `g-happy~` / `z-grace-proper` | Writing glyphs or the word *proper* in the gloss | `z-Azawan` / `g-happy` |
| `zam` / `hal` / `am` as the whole morph | Agalan letters where the job belongs | `z-and.open` / `h-only-when` / `including.open` |
| `z-microphone-l` | Ending already chose the literal root | `z-microphone` |
| `z-microphone→speaker` | Etymology chain | `z-speaker` |
| Morph line that is only idiomatic English | Confuses layers | Morph + separate quoted free line |
| Morph gloss that matches the quoted English | Redundant; the quote already is the sense | Omit that line ([example block](#example-block)). Keep it when it unpacks **`x`**, PoS, several words, … |
| `gloss:` + per-token backticks inside a code fence | Markdown renders raw; Agalan and gloss look the same | Blockquote; backticks on Agalan only |
| Loose free packed with cast letters / join footnotes / value endings | Duplicates morph; not “what you’d say” | Idiomatic claim; use **strict** free only for teaching |
| English *he* / *she* inside morph for **-r** | Hides Agalan binding | `z-←Antecedent` |
| New synonym every example for the same overlay | Unstable inventory | Fixed labels (`witnessed`, `COMMENT`, …) |

## Checklist

1. English senses only — no Agalan root spellings.
2. No `→` etymology chains.
3. No **-l** / **-m** / **-n**, and no **`@`** / **`~`**, when they only selected the sense-root. Named **-n** is the English name (`z-Azawan`), not `-n`, `@`, or `-proper`.
4. Compounds / stance / role / span `x` pieces are segmented in English when teaching the hinge; a used **name** may be one English label.
5. **-r** uses `←…` (no trailing `-r`); **-x** stays as `-x`. Resume of a house name is `z-←Azawan`, not `z-r` or `z-←Azawan`. Fill-ask is `z-who`, not `z-ar`.
6. Free English is on its own **quoted** line (or grammar-table Gloss column) — **loose** by default; **strict** only when teaching packaging. Example blocks follow [example block layout](#example-block) (blockquote; skip a morph line that would copy the quote).

## See also

- [reference-suffix.md](../grammar/reference-suffix.md) — **-l** / **-m** / **-n** / **-r**
- [special-vocabulary.md](../grammar/special-vocabulary.md#sense-form) — overlays and closed labels
- [pronouns.md](../grammar/pronouns.md) — **-r** and special pronouns
- [x-compounds.md](../grammar/x-compounds.md) — mid-word `x` families
- [core.md](../grammar/core.md#role-letters) — role letters in a sentence
- [values.md](../grammar/values.md) — need stances and endings (morph keeps them; loose free usually drops channel / standing / force / changeability)
