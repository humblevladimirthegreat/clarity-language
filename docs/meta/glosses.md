# Gloss guidelines

How to write **glosses** in Agalan docs and examples. Design authority for morphology stays in the linked grammar pages; this page standardizes the **reading aid** only.

## Goals

A gloss should answer: *what is each Agalan piece doing in the clause — in English labels?*

| Goal | Gloss does | Gloss does not |
|------|------------|----------------|
| Slot + sense | Show PoS letter and the **active English sense** | Quote Agalan phonology (`ugobo`, `uzumu`, …), except [mention / opaque interiors](#span-interiors) |
| Separate senses | Treat concrete / abstract / proper / overlay as **different English roots** | Chain etymology (`microphone→speaker`) |
| Endings | Drop **-l** / **-m** / **-n** when they only pick which sense-root applies | Repeat those endings after a sense that already encodes them |
| Structure | Keep mid-word `x` pieces, **-x**, and binding visible | Invent full English syntax for Agalan structure; copy writing glyphs (`@` / `~`) into the gloss |
| Binding | Point **-r** (and span anaphors) at the antecedent when known | Collapse to English *he* / *she* / *it* |
| Underspecification | Keep vague Agalan vague (`someone`, bare joins) | Sharpen into a specific English claim |
| Separation | Stay word-aligned | Replace the free English line |

**Free English** (quoted line / table “Gloss” in grammar pages) answers *what would you say naturally?* — idiomatic paraphrase, tone, and discourse flow. Do not merge free English into the morph gloss. Default free English is **loose** ([strict vs loose](#strict-vs-loose-free-english)).

## Layers

| Layer | Where | Form |
|-------|--------|------|
| **Morph gloss** | Dialogue turns, clause / phrase examples, teaching lines | Word-aligned pieces joined with spaced ` | `; one roman line (below). **Omit** when parser output is trivially redundant with in-block loose English ([when to skip](#example-block); `lint:agalan` enforces). |
| **Free English (loose)** | Same places, under the morph gloss — **default** when only one free line | Natural paraphrase in `"double quotes"`; drop Agalan packaging English doesn’t mark |
| **Free English (strict)** | Optional second quoted line (or alone when teaching packaging) | Keeps join packaging, value endings, evidential tags, cast letters, …; teaching dialogues may show **both** labeled `strict:` / `loose:` |
| **Grammar-table gloss** | Inventory / contrast tables in grammar docs | Short free English in **English** (often *italic* in table cells); optional parenthetical notes — loose unless the row teaches packaging. **Cue** is not a gloss ([cues](grammar-docs.md#cues-columns)). |
| **Lexicon fields** | `lexicon-published.csv` / overlays | Concrete / abstract / mnemonic / [role English](#role-english) / definition — **inputs** to morph glosses and lookup, not utterance glosses. Verb senses use the [uninflected lemma](#english-lemma). Concrete English in a **Cue** cell is still not the morph gloss. Morph does **not** take its english slot from role English. |

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

**When it would only repeat the quote**, omit it — typical of a simple [citation](../grammar/word-endings.md#citation-forms) whose sense *is* the English:

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

**Skip the morph line** when **`lint:agalan`** would treat it as redundant: single-segment parser morph whose English body matches the in-block loose line (same readable words, ignoring quotes and trailing `.?!`). That is a redundancy test, not “citation vs sentence.” Simple `azawal` / `"swan"` omits; `zazawan vawalal.` keeps `z-Azawan | v-walk` because that is not `"Azawan walks."`. Keep the line whenever it shows something the quote hides: role letters, several words, mid-word **`x`** pieces, binding, join jobs. No in-block loose line → omitting morph stays allowed.

### Word separator
<a id="gloss-separator"></a>

Join morph **words** with **space + `|` + space** (`z-Azawan | v-walk`). Type it on a US keyboard (shift-backslash). Do **not** use middot (`·`): it is not on the keyboard and looks like a bullet.

Do not use `/` (already means PoS in the docs, and reads as *or*), hyphen (already inside labels: `z-dog`, `that-clause`), or comma (already inside English). A spaced semicolon (` ; `) is a fine fallback if `|` is awkward in a table cell.

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
| Values **time horizon / standing / invitation / changeability** | Keep only what changes English (*can't* vs unmet interest as content); drop “(motive, soft standing)”, … Prescription **`the`**: loose free keeps the warrant when it is the point (*invited* / *offered* / *worth a try*) — not *must* / *should* / *could* as a force grade |
| Emotion compose ACT / LOCUS / activation | Ordinary emotion English (*we're glad*), not “pleasure met · internal” |
| Evidential / universality **tags** | Fold in only if English wants it (*I hear…*, *usually*); else omit |
| Span fence labels | Quotes / parentheses; no “Cite:” / “aside:” |
| Role / SAME scaffolding | *the speaker* / *is* — not “agent of speech” / “identical to” |
| Associative **-x** spelled out | *you all* / *they* when English is enough |
| Numbered-alternative pedagogy | *First, …* / *Finally, …* is fine; drop “problem #1” metalabel unless teaching numbering |

### Keep in loose

- Who / what / polarity / negation
- Force English can say (*please*, *don’t*, *I wonder*)
- Stance that changes the verb (*can't* vs *ought not* vs unmet interest as content)
- Comparatives / equatives / causation / plan when they are the point of the turn
- Mention interiors as *the word “odogo”* / *the phrase “…”* (Agalan spelling, not the English lemma) — [span interiors](#span-interiors)
- Opaque interiors as the same blob (`kimchi`, `FBI`)

### Example (same Agalan, three readings)

> `yol dubur dadedal dogovel dol von.`
>
> y-question | [d-←Ubune-x-Unowen | d-tea | d-coffee | d-or-exactly-one] | v-choose
>
> "Do you want tea or coffee?" ← loose (default)
>
> "Do you (B) choose tea or coffee — exactly one?" ← strict (teaching exclusive *or*)

## Senses are separate roots

Published strings share one phonological root, but **concrete**, **abstract**, and **proper / overlay** readings are **different gloss roots**. Gloss only the English sense that is active. Do **not** write the Agalan letters, and do **not** write **-l** / **-m** / **-n** when that ending only selected this sense.

| Agalan | Morph gloss | Not |
|---------|-------------|-----|
| `zugobol` | `z-microphone` | `z-ugobo(microphone)-l`, `z-microphone-l` |
| `zugobom` | `z-speaker` | `z-ugobo(microphone→speaker)-m` |
| `zugobon` | `z-speaker` | `z-ugobo(speaker)-n`, `z-speaker-n` |
| `guzumul` | `g-smile` | `g-uzumu(smile)-l` |
| `guzumum` | `g-happy` | `g-uzumu(smile→happy)-m`, `g-happy-m` |
| `huvuvul` | `h-fishing` | `h-uvuvu(fishing)-l` |
| `thuvuvum` | `th-WITNESSED` | `h-uvuvu(fishing→WITNESSED)-m` |
| `gohohum` | `g-home` | `g-ohohu(house→home)-m` |

Same English label for `zugobom` and `zugobon` is fine: both are the *speaker* sense-root; the written ending is recoverable from the Agalan line and from [word-endings.md](../grammar/word-endings.md). The gloss’s job is the **sense**, not a second orthography.

**Closed overlays** ([sense-form](../grammar/lexicon.md)): gloss the overlay reading for that `(sense_form, pos)`, not the ordinary lexicon literal. Prefer short stable **English** labels (`witnessed`, `MAY`, `SAME`, `plan`, `DECISION`, …). The Agalan letters themselves follow the [published host root](parser-pipeline.md#closed-forms-follow-lexicon), except vowel-only join stems (`an` / `on` / …).

**Special pronouns** ([pronouns.md](../grammar/pronouns.md)): `zugobon` / `zedonen` / `zahan` / `zenenun` → `z-speaker` / `z-listener` / `z-interlocutors` / `z-someone` — never emoji etymology. **Stand-ins** (`darl` / `dorl` / …) gloss as `d-that-clause` / `d-whether-clause` / …, not as pronouns.

### Ordinary lexicon plus packed role English
<a id="no-lexicon-pos-specials"></a>

Morph uses the published **concrete** or **abstract** for that ending, unless `english_by_pos` lists a lemma for this role letter and sense ([role English](#role-english)). Do **not** invent a new English root just because the word is under `/v/`. Closed overlays, joins, hooks, speech-act vowels, and house names stay specials.

| Agalan | Morph | Free English |
|--------|--------|------------------------------|
| `vejel` | `v-see` | *sees* |
| `vajul` | `v-sit` | *sits* |
| `vezehel` | `v-tell` | *tells* |
| `al bohohul` | `in | b-house` | *in a house* |
| `welem` | `w-very` | *very* |
| `zejel` | `z-eye` | *the eye* (no packing on `/z/`) |

The checkpoint **English** column and the quoted line may say *see* / *sit* / *tell*. Packed **role English** makes the morph line match that lemma when `english_by_pos` lists it for this role and sense (`vejel` → `v-see`). Do not invent a lemma that is not in that cell.

### Role English (lookup and morph)
<a id="role-english"></a>

Published rows may pack **role English** in `english_by_pos` when the usual English lemma for a role is not a transparent conversion of the **active** sense-root. This is not an overlay and not a second Agalan meaning.

Packed form: `v:see; m.v:intuit; m.h:inside`. Bare keys (`v:see`) are **concrete** mismatches only. `m.` keys are **abstract** mismatches only. Neither copies onto the other sense. Omit a piece when English already converts the sense lemma (`perception` as `/v/` → *perceive*).

Lexicon search indexes those lemmas. Morph uses the packed lemma for that role letter and ending (`v-see`, `w-very`); other roles still use the sense-root (`z-eye`).

## Morph gloss format

### Word shape

```
{PoS}-{english}(-x-{english|TAG})*[-x]
```

- **PoS** — single letter matching the written prefix (`y` `z` `d` `b` `v` `g` `w` `h` `x`). Left-bound adjectives: `gl-…`.
- **english** — short English label for the **active** sense (hyphens OK inside a label: `that-clause`, `or-exactly-one`). **Uninflected lemma** for verb senses ([english lemma](#english-lemma)). **No** Agalan root letters. **No** writing glyphs **`@`** / **`~`** (those mark **-n** / **-m** in Agalan spelling only: numbers, span fences).
- **`-x-`** — mid-word compound / stance / role / span hinge; each piece is English (or a stable TAG).
- **-l / -m / -n** — **omit**. They only choose which English sense-root is in play. Do not re-spell them as `-l` / `-m` / `-n` or as `@` / `~`.
- **Names** — the english slot is the **English name** (`z-Azawan`, `z-Hamlet`, `z-Abogon`, `z-Uzuzu-x-Ogove`), not the virtue or kind that formed the stem, and not `z-grace@`.
- **-x** — append `-x` when the written word has associative / address-set / collective **-x** (`z-Azawan-x`, `z-speaker-x`, `z-listener-x`).
- **Prefix-less** hooks: English only — `instead`, `rather`, `additionally`, `in`, `using` (no fake PoS).
- **Specials / overlays / joins** — still the overlay or join job (`z-speaker`, `v-and`), never `@` because the word happens to end in **-n**.

Separate **words** with spaced `|` (`z-dog | v-walk`). Group words into [phrase brackets](#phrase-brackets). One morph gloss line per Agalan line (or per turn). In an [example block](#example-block), leave that line **roman** (no italics, no backticks on pieces; tables may still put a morph cell in backticks). Mid-word **`x`** stays inside one piece (`wish-x-guidance`). See [word separator](#gloss-separator).

### Phrase brackets
<a id="phrase-brackets"></a>

The morph line shows **phrase structure**: which words form one unit and what modifies what. Wrap any unit of **two or more words** that fills one slot in `[ … ]`. Inside a bracket, words still use ` | `. A single word never gets brackets. Roles at clause level stay flat and unbracketed, because they are sisters under the verb: subject `z`, theme `d`, verb `v`, plain `h` / `th`, unhosted recipient `b`, linkers and `/y/`.

A dependent sits next to the word it modifies, in Agalan order. Nesting shows attachment:

| Unit | Morph gloss |
|------|-------------|
| Noun + trailing `/ɡ/` | `[z-dog \| g-blue]` |
| `gl-` adjective + noun | `[gl-blue \| z-dog]` |
| `/w/` + its host | `[w-loud \| g-blue]` |
| Host + hosted `/b/` | `[g-SAME \| b-Ululon]` |
| Hook + extra noun | `[in \| b-house]` |
| Adjective on the extra noun | `[z-dog \| [g-SAME \| [b-Azawan \| g-tall]]]` |
| Join fence (join last) | `[d-tea \| d-coffee \| d-or]` |
| Nested fences | `[[d-tea \| d-coffee \| d-or] \| d-water \| d-and]` |
| Shared `/ɡ/` after a join | `[z-Azawan \| z-Ululon \| z-and \| g-happy]` |

A **labeled bracket** `LABEL[ … ]` marks a package. The label is uppercase English with no glyphs. When the package has a role letter, it is the prefix: `d-CITE[…]`.

| Label | Package |
|-------|---------|
| `NAME[…]` | [Titled phrase](../grammar/word-endings.md#titled-phrases): **-n** on the hook, join, or span that packages it |
| `CITE[…]` / `MENTION[…]` / `ASIDE[…]` / `OPAQUE[…]` | Written span (`d[…]` / `d{…}` / `th(…)` / `d<…>`) |
| `CITE.multi[…]` / `.clause` / `.atomic` / `.empty` | Spoken span. The suffix is the open word's EDGE (`daxal … xuxul` → `d-CITE.multi[…]`) |
| `CITE.about[…]` | Paraphrase **-m** span (`d~[…]`, `daxam`) |
| `NAME.CITE[…]` | Proper **-n** span (`d@[…]`, `daxan`) |
| `SCOPE[…]` | Scope island `^ … ^` |

Written and spoken spans stay distinct: a written span label has no EDGE suffix, and a spoken span label always has one. The closing bracket records the close: `]` complete, `]#` editorial (`#]`, `xuxur`), `]|` close-all (`|`, `xuxum`). A close-all ends every span open at that point.

### Round trip
<a id="round-trip"></a>

A morph line corresponds **one-to-one** with its Agalan. From the gloss alone you can rebuild the exact written words, so glosses must never merge two forms:

- **Every written word is glossed**, including a spoken **`yal`**. A `yal` that was left out is not added.
- **Sentence marks.** When one line holds several sentences, the mark between them stands alone with spaces: `z-Azawan | v-walk . z-←Azawan | v-judge`. A line-final period is implicit. A [tone mark](../grammar/speech-moves.md#tone-marks) is copied as written: attached to the glossed word or span it colors (`!z-Azawan`), or standing alone with spaces for sentence scope (`! z-Azawan | v-walk`).
- **One label per form.** Each (PoS, root, ending) maps to one English label. Two roots never share an English sense: when they would, reword one row in the lexicon. `npm run lint:lexicon` checks this, and `npm test` round-trips every glossed example in `docs/grammar/`.
- **Form suffixes** record surface choices the sense label does not: `.open` on open joins and hooks, `.full` on a [full-root resume](#anaphors-r), and on number words `.about` (`~`, **-m**), `.named` (`@`, **-n**), `.again` (`=`, **-r**), and `.spelled` on a spelled-out number word (`grarel` → `g-three.spelled`; `g+3` → `g-three`).
- **Ordinals use digits** (`g#2` → `g-2nd`, `g#-2` → `g-2nd-from-end`), so they never share a label with a lexicon sense such as the time unit *second*.
- **Span resumes** gloss by type: written `d[=]` → `d-←cite`, spoken `daxur` → `d-←cite.spoken`.
- **Unknown words fail.** A content word the lexicon cannot gloss has no morph line: a root missing from the lexicon, or **-m** on a root with no abstract sense (unless a closed overlay defines that **-m** form). `lint:agalan` reports it.
- **Quoted pass-through.** Raw payloads (mention and opaque interiors, and a resume stem with no known antecedent) go in straight double quotes: `z-MENTION["odogo"]`. A `"` inside the payload is written `""`.

### When an ending still appears in the gloss

Only when it is **not** already baked into the English sense-root:

| Keep in gloss | Why |
|---------------|-----|
| `-x` | Associative / collective ascription / collective doing / address-set — not a sense picker |
| `(←…)` binding for **-r** | Resume is not a lexicon sense; see below |
| Rare teaching callouts | If you must contrast two same-sense forms that differ only by ending, prefer distinct English labels (`and.open` / `and`, `y-question` / `y-soft-question`) over re-attaching `-m` / `-l` or `~` |

Do **not** write `-l` / `-m` / `-n`, **`@`**, or **`~`** after a sense. Named **-n** uses the English name (`z-Azawan`), not `-n` / `-proper` / `@`. Abstract **-m** uses the abstract word (`g-happy`), not `happy~`.

### Sense labels

- Prefer lexicon / overlay wording when short (`tea`, `speaker`, `witnessed`). Packed role English overrides that wording for the listed role only (`v-see` vs `z-eye`).
- Prefer **stable tags** for closed inventory (uppercase OK when the docs already use them): `MAY`, `DECISION`, `SAME`, `WITNESSED`, `LIVE`, `ABIL`.
- Verb senses: [uninflected lemma](#english-lemma) (`walk`, not `walking`).
- Do **not** use arrows (`→`) or etymology chains.
- Do **not** put PoS names in the label (`noun`, `proper`). Named reference is the English name, not the word *proper*.

### English lemma (no *-ing* / *-s* / *-ed*)
<a id="english-lemma"></a>

The lexicon **concrete** and **abstract** fields, overlay **definition** labels used as senses, and the morph **english** slot all use the same **citation lemma**: the form you would look up in an English dictionary, not a conjugated or gerund form.

| Sense is a verb (or a verb used as any PoS) | Write | Not |
|---------------------------------------------|-------|-----|
| dance, run, walk, climb, swim | `dance`, `run`, `walk`, … | `dancing`, `running`, `walking`, … |
| choose, think, sing | `choose`, `think`, `sing` | `choosing`, `thinks`, `sang` |

Agalan does not mark English tense or progressive aspect on the root. Conjugation belongs only in **free English** (`"Azawan walks."`, `"they are dancing."`). Morph stays `v-walk` / `v-dance` even when the quote uses *walks* / *dancing*.

**Keep *-ing*** only when that string is not a verb lemma — a kind English names that way (`hearing-aid`, `lightning`, `wedding`), a closed tag the grammar already froze, or when stripping it would collide with another published literal (`fishing` vs `fish`, `cooking` vs `cook`, `partying` vs `party`). Do not append *-ing* to mark “this row is used as `/v/`.”

When you retie a published literal (`dancing` → `dance`), morph lines that copied the old string follow (`v-walking` → `v-walk`, `v-walking-unable-temporary` → `v-walk-unable-temporary`).

**Lexicon CSV:** On each published row, **concrete** and **abstract** must not share a citation form on the **whole** hyphenated lemma (exact match or inflectional alternate such as `stressed` / `stress`). Reusing a **hyphen segment** alone (e.g. `credit-card` / `credit`, flag place name / demonym) is allowed. Checked by `npm run lint:lexicon`. Demonyms on **-m** are a listed exception to “unobservable,” not an exception to this collision rule.

### Anaphors (`-r`)
<a id="anaphors-r"></a>

The binder **is** the gloss root. No trailing `-r` (resume is already marked by `←`).

A [short resume](../grammar/pronouns.md#resume-r) (root cut after its 2nd vowel) is unmarked. A **full-root resume** (entire root + **-r**) adds `.full`. The antecedent's label names its root, and the suffix gives the cut, so the gloss rebuilds the exact word.

| Case | Agalan | Morph gloss |
|------|--------|-------------|
| Short resume | `zazar` | `z-←Azawan` |
| Full-root resume | `zazawar` | `z-←Azawan.full` |
| Full-root resume of a content word | `veleber` | `v-←sleep.full` |
| Compound name | `zubur` | `z-←Ubune-x-Unowen` |
| Resume of a prior content word | | `z-←someone` / `d-←tea` |
| No antecedent, stem not in the lexicon | | `z-←"…"` (the stem itself) |
| Fill-ask / unspecified member | `zar` | `z-who` / `z-something` (as the docs require for that form) |

Do not write `z-←microphone` for a speaker antecedent.

### House-cast given names
<a id="house-cast"></a>

Grammar examples use three single-root names ([grammar-docs.md](grammar-docs.md#house-cast)). Morph gloss is the **English name**. Free English is that same name, not the virtue word and not *I* / *you*. Resume uses that name (`z-←Azawan`). The learner's own name slot glosses as a free-standing `SELF` (`z-SELF`); the site renders *speaker* or the chosen English name ([first person](grammar-docs.md#house-cast)). Do not write `z-grace@`, `g-happy~`, or `z-grace-proper`.

| Agalan | Morph gloss | Free English | Resume |
|--------|-------------|--------------|--------|
| `zazawan` | `z-Azawan` | *Azawan* | `zazar` → `z-←Azawan` |
| `zululon` | `z-Ululon` | *Ululon* | `zulur` → `z-←Ululon` |
| `zuhubun` | `z-Uhubun` | *Uhubun* | `zuhur` → `z-←Uhubun` |

### Mid-word `x` families

Gloss each piece by **family** ([x-compounds.md](../grammar/x-compounds.md)) — English only. Drop sense-picking **-l / -m / -n**. On [values](../grammar/interests.md), keep the stance **and** the ending table (contact / prescription warrant / preference standing / changeability): `tholozothom` → `th-competence-motive-internal`, not `th-competence-th-motive`.

| Family | Example Agalan | Morph gloss |
|--------|-----------------|-------------|
| Ordinary / name compound | `yubunexunowen` | `y-Ubune-x-Unowen` |
| Ordinary (three roots) | `zogovexadedaxunuden` | `z-Ogove-x-Adeda-x-Unuden` |
| Ability / values stance | `vawalaxel` | `v-walk-unable-temporary` |
| Values stance on need | `tholozothom` | `th-competence-motive-internal` |
| Role compound | `zaxuvugul` | `z-agent-x-fight` |
| Span open / close | `thexal` … `xuxul` | `th-ASIDE.multi[…]` ([labeled bracket](#phrase-brackets)) |
| Number / enumeration | `x#e-` | `x-starting-with` |

For **phrasal proper names**, gloss each piece (`y-Ubune-x-Unowen`, `z-Ogove-x-Adeda-x-Unuden`). Mid-word **`x`** stays visible as `-x-`. Do not put Agalan letters in the english slot, except [mention interiors](#span-interiors).

### Mention and opaque interiors
<a id="span-interiors"></a>

**Mention** (`{…}` / spoken TYPE **o**) is a **word or phrase** as that spelling, not a quoted utterance and not the English lemma. The morph line **passes the interior through** in quotes inside a labeled bracket. Free English says *the word …* or *the phrase …* and keeps that spelling.

| Kind | Agalan | Morph | Free English |
|------|--------|-------|--------------|
| Mention (one word) | `z{odogo}` | `z-MENTION["odogo"]` | *The word “odogo” is small.* |
| Spoken mention | `zoxol odogol` | `z-MENTION.atomic["odogol"]` | same |
| Mention (phrase) | `z{zazawan vuzunul}` | `z-MENTION["zazawan vuzunul"]` | *The phrase “zazawan vuzunul” is small.* |
| Mention **`@`** | `d@{uzugon}` | `d-NAME.MENTION["uzugon"]` | *the name “uzugon”* (the title-string, not the work) |
| Opaque | `d<kimchi>` | `d-OPAQUE["kimchi"]` | The same blob |
| Cite | `d[azawan]` | `d-CITE[Azawan]` | Translation of the **utterance** (*said “judge.”*) |
| Spoken cite | `daxol ujudul` | `d-CITE.atomic[judge]` | same |
| Cite **`@`** | `d@[uzugon ululon]` | `d-NAME.CITE[Uzugon \| Ululon]` | The **work** (*dislikes Uzugon Ululon*) |

Words inside a cite or aside are glossed as usual. They sit in a new clause, so they keep their own role letters and brackets. Mention and opaque interiors are never glossed.

Speech/writing reports (*said “X,”* *sang “X,”* *don’t “halt”*) are **cite**, even when English says *the word X*. Do not wrap that object in `{…}`. Sense-talk about a lexeme (*is a noun*, *is archaic*) is still mention; there is no extra “translate the lemma” rule — keep *the word/phrase “…”*.

> `z{odogo} gumuzem.`
>
> z-MENTION["odogo"] | g-small
>
> "The word “odogo” is small."

### Underspecification and joins

Bake join / hook **job** into the English label (including open vs closed when it matters). Do not re-attach sense-picking endings:

| Agalan | Morph gloss |
|---------|-------------|
| `zam` | `z-and.open` |
| `zal` | `z-and` |
| `vam` | `v-and.open` |
| `dol` | `d-or-exactly-one` |
| `zol` | `z-or-exactly-one` |
| `zel` | `z-rank/more` |
| `zael` | `z-equal-rank` |
| `zaem` | `z-equal-rank.open` |
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
| `g#2` | `g-2nd` |
| `grarel` (spelled `g+3`) | `g-three.spelled` |
| `g+e` | `g-plus-infinity` |
| `g+` | `g-more-than-one` |

## Worked examples

### Single words

| Agalan | Morph gloss | Free English (separate) |
|---------|-------------|-------------------------|
| `azawan.` | `Azawan` | *Azawan.* (hello) |
| `yululoxen` | `y-Ululon-minutes` | *Ululon — a few minutes.* |
| `yael` | `y-yes` | *Yes.* |
| `yol` | `y-question` | *(yes/no or fill-ask)* |
| `zugobol` | `z-microphone` | *a microphone* |
| `zugobon` | `z-speaker` | *I* / *the speaker* |
| `zedonen` | `z-listener` | *you* / *the listener* |
| `zazawan` | `z-Azawan` | *Azawan* |
| `zahan` | `z-interlocutors` | *we* (speaker ∪ address set) |
| `zugobonx` | `z-speaker-x` | *I and associates* |
| `zedonenx` | `z-listener-x` | *you-all* (address set) |
| `guzumum` | `g-happy` | *happy* |
| `thuvuvum` | `th-WITNESSED` | *per memory* |
| `thadezem` | `th-LIVE` | *from the scene* |
| `themabar` | `th-plan-sketch` | *as a sketch plan* |
| `gonunul` | `g-SAME` | *identical to* (identity host) |
| `von` | `v-choose` | *chooses (exactly one)* |

### Dialogue turn (morph + loose free)

> `yael zugobon zam zedonen zal guzumum.`
>
> y-yes | [[z-speaker | z-and.open] | z-listener | z-and | g-happy]
>
> "Yes — you and I are happy."

(Prefer **`zahan guzumum`** when the point is interlocutor *we*, not an explicit two-name census.)

### Metaphor vs overlay vs literal

> `xezebal zubur thuvuvum zanunul.`
>
> x-however | z-←Ubune-x-Unowen | th-WITNESSED | z-rain
>
> "Still — it's raining, as I remember."

(Strict teaching line: *However — that one (B), per memory — it rains.*)

### Ability + value motive

> `yuel zugobon vawalaxel tholozothom.`
>
> y-no | z-speaker | v-walk-unable-temporary | th-competence-motive-internal
>
> "No — I can't walk right now."

### Numbered alternative + unmet pleasure

> `x#e- zuzebum g#1 zugobonx thawerothur.`
>
> x-starting-with | [z-problem | g-1st] | z-speaker-x | th-pleasure-unmet-temporary
>
> "First problem: we're not enjoying this."

### Inclusive *we* (interlocutors)

> `yael xezazam zahan themabar vawalal vul.`
>
> y-yes | x-therefore | z-interlocutors | th-plan-sketch | [v-walk | v-not]
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
| `… zel g<big>l` | `[… \| z-rank/more \| g-big]` | *… is bigger …* |

Foreign `<>` roots: use the donor sense as the English label (`g-big`).

## Anti-patterns

| Avoid | Why | Prefer |
|-------|-----|--------|
| `z-ugobo(speaker)-n` | Agalan letters + redundant ending | `z-speaker` |
| `z-grace@` / `g-happy~` / `z-grace-proper` | Writing glyphs or the word *proper* in the gloss | `z-Azawan` / `g-happy` |
| `zam` / `hal` / `am` as the whole morph | Agalan letters where the job belongs | `z-and.open` / `h-only-when` / `including.open` |
| `z-microphone-l` | Ending already chose the literal root | `z-microphone` |
| `z-microphone→speaker` | Etymology chain | `z-speaker` |
| `v-see` for `vejel` with no `v:see` cell | Invented PoS lemma | Fill `english_by_pos` first, then morph follows |
| Morph line that is only idiomatic English | Confuses layers | Morph + separate quoted free line |
| Morph gloss that matches the quoted English | Redundant; the quote already is the sense | Omit that line when `lint:agalan` agrees ([example block](#example-block)). Keep it when it unpacks **`x`**, PoS, several words, … |
| `gloss:` + per-token backticks inside a code fence | Markdown renders raw; Agalan and gloss look the same | Blockquote; backticks on Agalan only |
| Loose free packed with cast letters / join footnotes / value endings | Duplicates morph; not “what you’d say” | Idiomatic claim; use **strict** free only for teaching |
| English *he* / *she* inside morph for **-r** | Hides Agalan binding | `z-←Antecedent` |
| New synonym every example for the same overlay | Unstable inventory | Fixed labels (`witnessed`, `MAY`, …) |

## Checklist

1. English senses only — no Agalan root spellings, except [mention / opaque interiors](#span-interiors). Verb senses are the uninflected lemma (`dance`, not `dancing`).
2. No `→` etymology chains.
3. No **-l** / **-m** / **-n**, and no **`@`** / **`~`**, when they only selected the sense-root. Named **-n** is the English name (`z-Azawan`), not `-n`, `@`, or `-proper`.
4. Compounds / stance / role / span `x` pieces are always hyphenated segments (`y-Ubune-x-Unowen`). Do not fuse a name into one unsegmented English label.
5. **-r** uses `←…` (no trailing `-r`), with `.full` on a full-root resume; **-x** stays as `-x`. Resume of a house name is `z-←Azawan`, not `z-r`. Fill-ask is `z-who`, not `z-ar`.
6. Multi-word units are in [phrase brackets](#phrase-brackets), nested by attachment; packages use labeled brackets (`NAME[…]`, `CITE[…]`, `SCOPE[…]`). The line [round-trips](#round-trip) to the exact Agalan.
7. Free English is on its own **quoted** line (or grammar-table Gloss column) — **loose** by default; **strict** only when teaching packaging. Example blocks follow [example block layout](#example-block) (blockquote; skip a morph line only when `lint:agalan` treats parser output as redundant with that loose line).

## See also

- [spans.md](../grammar/spans.md) — mention / cite / opaque; interiors [above](#span-interiors)
- [word-endings.md](../grammar/word-endings.md) — **-l** / **-m** / **-n** / **-r**
- [lexicon.md](../grammar/lexicon.md) — overlays and closed labels
- [pronouns.md](../grammar/pronouns.md) — **-r** and special pronouns
- [x-compounds.md](../grammar/x-compounds.md) — mid-word `x` families
- [clause.md](../grammar/clause.md#role-letters) — role letters in a sentence
- [interests.md](../grammar/interests.md) — need stances and endings (morph keeps them; loose free usually drops channel / standing / force / changeability)
