# Gloss guidelines

How to write **glosses** in Agazan docs and examples. Design authority for morphology stays in the linked grammar pages; this page standardizes the **reading aid** only.

## Goals

A gloss should answer: *what is each Agazan piece doing in the clause — in English labels?*

| Goal | Gloss does | Gloss does not |
|------|------------|----------------|
| Slot + sense | Show PoS letter and the **active English sense** | Quote Agazan phonology (`amu`, `agawa`, …), except [opaque interiors](#span-interiors) |
| Separate senses | Treat concrete / abstract / proper / overlay as **different English roots** | Chain etymology (`microphone→speaker`) |
| Endings | Drop **-l** / **-m** / **-n** when they only pick which sense-root applies | Repeat those endings after a sense that already encodes them |
| Structure | Keep mid-word `x` pieces, **-x**, and binding visible | Invent full English syntax for Agazan structure; copy writing glyphs (`@` / `~`) into the gloss |
| Binding | Point **-r** at the antecedent when known | Collapse to English *he* / *she* / *it* |
| Underspecification | Keep vague Agazan vague (`someone`, bare joins) | Sharpen into a specific English claim |
| Separation | Stay word-aligned | Replace the free English line |

**Free English** (quoted line / table “Gloss” in grammar pages) answers *what would you say naturally?* — idiomatic paraphrase, tone, and discourse flow. Do not merge free English into the morph gloss. Default free English is **loose** ([strict vs loose](#strict-vs-loose-free-english)).

## Layers

| Layer | Where | Form |
|-------|--------|------|
| **Morph gloss** | Dialogue turns, clause / phrase examples, teaching lines | Word-aligned pieces joined with spaced ` | `; one roman line (below). **Omit** when parser output is trivially redundant with in-block loose English ([when to skip](#example-block); `lint:agazan` enforces). |
| **Free English (loose)** | Same places, under the morph gloss — **default** when only one free line | Natural paraphrase in `"double quotes"`; drop Agazan packaging English doesn’t mark |
| **Free English (strict)** | Optional second quoted line (or alone when teaching packaging) | Keeps join packaging, value endings, evidential tags, cast letters, …; teaching dialogues may show **both** labeled `strict:` / `loose:` |
| **Grammar-table gloss** | Inventory / contrast tables in grammar docs | Short free English in **English** (often *italic* in table cells); optional parenthetical notes — loose unless the row teaches packaging. **Cue** is not a gloss ([cues](grammar-docs.md#cues-columns)). |
| **Lexicon fields** | `lexicon-published.csv` / overlays | Concrete / abstract / mnemonic / [role English](#role-english) / definition — **inputs** to morph glosses and lookup, not utterance glosses. Verb senses use the [uninflected lemma](#english-lemma). Concrete English in a **Cue** cell is still not the morph gloss. Morph does **not** take its english slot from role English. |

Grammar tables may keep a column named **Gloss** for free English. When a table needs morphology, use a **Morph** column or a separate morph line in the same format as dialogues.

## Example block layout
<a id="example-block"></a>

Worked examples in grammar pages use a **blockquote**, not a code fence (so Markdown can render). **Backticks mark Agazan only.**

**When the morph line earns its place** (PoS letters, several words, mid-word **`x`**, binding, …):

```markdown
> `zazawan godogal.`
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

A **complex citation** still gets a gloss if the morph unpacks structure the quote does not. An `x`-compound name is one word in Agazan and one name in English; the gloss shows the pieces:

```markdown
> `ohuxaluden`
>
> wish-x-guidance
>
> "Ohuxaluden"
```

| Line | Markup | Why |
|------|--------|-----|
| Surface | `` `agazan.` `` | Copyable Agazan; the only code span |
| Morph | `z-dog | v-walk` | English labels; roman (no italics, no per-token backticks); spaced ` | ` between **words** |
| Free English | `"A dog walks."` | Straight double quotes. Teaching notes stay **after** the quotes: `"Ahaben sings the Sing"` (that titled performance). |

Do **not** prefix the gloss with `gloss:`.

**Skip the morph line** when **`lint:agazan`** would treat it as redundant: single-segment parser morph whose English body matches the in-block loose line (same readable words, ignoring quotes and trailing `.?!`). That is a redundancy test, not “citation vs sentence.” Simple `azawal` / `"swan"` omits; `zazawan vowogal.` keeps `z-Azawan | v-walk` because that is not `"Azawan walks."`. Keep the line whenever it shows something the quote hides: role letters, several words, mid-word **`x`** pieces, binding, join jobs. No in-block loose line → omitting morph stays allowed.

### Word separator
<a id="gloss-separator"></a>

Join morph **words** with **space + `|` + space** (`z-Azawan | v-walk`). Type it on a US keyboard (shift-backslash). Do **not** use middot (`·`): it is not on the keyboard and looks like a bullet.

Do not use `/` (already means PoS in the docs, and reads as *or*), hyphen (already inside labels: `z-dog`, `that-clause`), or comma (already inside English). A spaced semicolon (` ; `) is a fine fallback if `|` is awkward in a table cell.

## Strict vs loose free English
<a id="strict-vs-loose-free-english"></a>

| Layer | Job |
|-------|-----|
| **Morph** | Keep Agazan structure (PoS, binding, join job, stance tags, …) |
| **Loose free** | Idiomatic English claim — default when a page shows one free line |
| **Strict free** | Same claim with Agazan packaging spelled out in English — use alone for packaging lessons, or **with** loose in teaching dialogues (e.g. [rainy evening](../examples/rainy-evening-dialogue.md)) |

**Loose** drops distinctions English doesn’t mark; morph already carries them. **Keep** in loose only what changes the English sentence (who / what / polarity / negation; force English can say; stance that changes the verb; comparative / causal / plan content when that is the point).

### Drop in loose

| Agazan distinction | Loose free does |
|---------------------|-----------------|
| Cast resumes and role pointers (`zazawar`, `zaxar` + “(A)”) | Ordinary *I / you / he / she / they*, or a **name** once known |
| Role metalanguage (`speaker`, `listener`, `interlocutors`) | *I / you / we* |
| Join packaging (open `zam` vs closed `zal`, exclusive `dol`, fence shape) | Plain *and / or*; no “exactly one”, no open-list footnotes |
| Sense-picking **-l / -m / -n** | Never (already omitted from morph when they only pick sense) |
| Values **time horizon / standing / invitation / changeability** | Keep only what changes English (*can't* vs unmet sake as content); drop “(motive, soft standing)”, … Prescription **`the`**: loose free keeps the warrant when it is the point (*invited* / *offered* / *worth a try*) — not *must* / *should* / *could* as a force grade |
| Emotion compose (locus / motion tail) | Ordinary emotion English (*we're glad*), not “pleasure met · internal” |
| Evidential **tags** | Fold in only if English wants it (*I hear…*, *usually*); else omit |
| Span fence labels | Quotes / parentheses; no “Cite:” / “aside:” |
| Role / SAME scaffolding | *the speaker* / *is* — not “agent of speech” / “identical to” |
| Associative **-x** spelled out | *you all* / *they* when English is enough |
| Numbered-alternative pedagogy | *First, …* / *Finally, …* is fine; drop “problem #1” metalabel unless teaching numbering |

### Keep in loose

- Who / what / polarity / negation
- Force English can say (*please*, *don’t*, *I wonder*)
- Stance that changes the verb (*can't* vs *ought not* vs unmet sake as content)
- Comparatives / equatives / causation / plan when they are the point of the turn
- Mention spans as *the word “odoga”* / *the phrase “…”* (Agazan spelling, not the English lemma) — [span interiors](#span-interiors)
- Opaque interiors as the same blob (`kimchi`, `FBI`)

### Example (same Agazan, three readings)

> `yol dabur dedehel dagavel dol von.`
>
> y-question | [d-←Ubune-x-Unowen | d-tea | d-coffee | d-or-exactly-one] | v-choose
>
> "Do you want tea or coffee?" ← loose (default)
>
> "Do you (B) choose tea or coffee — exactly one?" ← strict (teaching exclusive *or*)

## Senses are separate roots

Published strings share one phonological root, but **concrete**, **abstract**, and **proper / overlay** readings are **different gloss roots**. Gloss only the English sense that is active. Do **not** write the Agazan letters, and do **not** write **-l** / **-m** / **-n** when that ending only selected this sense.

| Agazan | Morph gloss | Not |
|---------|-------------|-----|
| `zamul` | `z-microphone` | `z-ugobo(microphone)-l`, `z-microphone-l` |
| `zamum` | `z-speaker` | `z-ugobo(microphone→speaker)-m` |
| `zamun` | `z-speaker` | `z-ugobo(speaker)-n`, `z-speaker-n` |
| `gagawal` | `g-quiet` | `g-uzumu(quiet)-l` |
| `gagawam` | `g-volume` | `g-uzumu(quiet→volume)-m`, `g-volume-m` |
| `hevol` | `h-fishing` | `h-uvuvu(fishing)-l` |
| `thevom` | `th-MEMORY` | `h-uvuvu(fishing→MEMORY)-m` |
| `gahazam` | `g-home` | `g-ohohu(house→home)-m` |

Same English label for `zamum` and `zamun` is fine: both are the *speaker* sense-root; the written ending is recoverable from the Agazan line and from [word-endings.md](../grammar/word-endings.md). The gloss’s job is the **sense**, not a second orthography.

**Closed overlays** ([sense-form](../grammar/lexicon.md)): gloss the overlay reading for that `(sense_form, pos)`, not the ordinary lexicon literal. Prefer short stable **English** labels (`witnessed`, `MAY`, `SAME`, `plan`, `DECISION`, …). The Agazan letters themselves follow the [published host root](parser-pipeline.md#closed-forms-follow-lexicon), except vowel-only join stems (`an` / `on` / …).

**Special pronouns** ([pronouns.md](../grammar/pronouns.md)): `zamun` / `zehon` / `zahan` / `zunan` → `z-speaker` / `z-listener` / `z-interlocutors` / `z-someone` — never emoji etymology. The topic pronoun and the generic pronoun gloss in capitals on `/z/` `/d/` `/b/` and as a holder (`zozan` → `z-TOPIC`, `zoben` → `z-ONE`, `thunemozan` → `th-CLUES-TOPIC`); on any other slot they are ordinary names. A topic word glosses as its noun (`xazawan` → `x-Azawan`, `xazawar` → `x-←Azawan`), and `hahehom` as `h-as-for`. **Stand-ins** (`darl` / `dorl` / …) gloss as `d-that-clause` / `d-whether-clause` / …, not as pronouns.

### Ordinary lexicon plus packed role English
<a id="no-lexicon-pos-specials"></a>

Morph uses the published **concrete** or **abstract** for that ending, unless `english_by_pos` lists a lemma for this role letter and sense ([role English](#role-english)). Do **not** invent a new English root just because the word is under `/v/`. Closed overlays, joins, hooks, speech-act vowels, and house names stay specials.

| Agazan | Morph | Free English |
|--------|--------|------------------------------|
| `vahahal` | `v-see` | *sees* |
| `vehahel` | `v-sit` | *sits* |
| `vezebel` | `v-tell` | *tells* |
| `al bahazal` | `in | b-house` | *in a house* |
| `welavam` | `w-very` | *very* |
| `zahahal` | `z-eye` | *the eye* (no packing on `/z/`) |

The checkpoint **English** column and the quoted line may say *see* / *sit* / *tell*. Packed **role English** makes the morph line match that lemma when `english_by_pos` lists it for this role and sense (`vahahal` → `v-see`). Do not invent a lemma that is not in that cell.

### Role English (lookup and morph)
<a id="role-english"></a>

Published rows may pack **role English** in `english_by_pos` when the usual English lemma for a role is not a transparent conversion of the **active** sense-root. This is not an overlay and not a second Agazan meaning.

Packed form: `v:see; m.v:intuit; m.h:inside`. Bare keys (`v:see`) are **concrete** mismatches only. `m.` keys are **abstract** mismatches only. Neither copies onto the other sense. Omit a piece when English already converts the sense lemma (`perception` as `/v/` → *perceive*).

Lexicon search indexes those lemmas. Morph uses the packed lemma for that role letter and ending (`v-see`, `w-very`); other roles still use the sense-root (`z-eye`).

### Search aliases (`english_aliases`)
<a id="english-aliases"></a>

`english_aliases` is a separate column of **search-only** English cues, `;`-separated and lowercase (`say; speak`). Lexicon search indexes them, so a learner who types *speak* finds the root glossed *tell*. They never reach a morph gloss, they carry no part of speech, and they do not claim a second meaning.

Aliases are consulted by the lexicon search page and `npm run lexicon-search` (shown as *synonyms*), by `find-english` (`--kind root`, marked as a lexicon synonym), and by `frequency-coverage.ts` (tag `alias`, separate from a real `root` sense match).

Do not use `english_by_pos` for this. That column is role English: one lemma per role letter per sense, used in glosses (`v-see`). A cue that repeats the concrete or abstract sense, repeats another cue on the row, or is empty is an error in the loader.

## Morph gloss format

### Word shape

```
{PoS}-{english}(-x-{english|TAG})*[-x]
```

- **PoS** — single letter matching the written prefix (`y` `z` `d` `b` `v` `g` `w` `h` `x`). Left-bound adjectives: `gl-…`.
- **english** — short English label for the **active** sense (hyphens OK inside a label: `that-clause`, `or-exactly-one`). **Uninflected lemma** for verb senses ([english lemma](#english-lemma)). **No** Agazan root letters. **No** writing glyphs **`@`** / **`~`** (those mark **-n** / **-m** in Agazan spelling only: numbers, span fences).
- **`-x-`** — mid-word compound / stance / role / span hinge; each piece is English (or a stable TAG).
- **-l / -m / -n** — **omit**. They only choose which English sense-root is in play. Do not re-spell them as `-l` / `-m` / `-n` or as `@` / `~`.
- **Names** — the english slot is the **English name** (`z-Azawan`, `z-Hamlet`, `z-Abogon`, `z-Uzuzu-x-Ogove`), not the virtue or kind that formed the stem, and not `z-grace@`.
- **-x** — append `-x` when the written word has associative / address-set / collective **-x** (`z-Azawan-x`, `z-speaker-x`, `z-listener-x`).
- **Prefix-less** hooks: English only — `instead`, `rather`, `additionally`, `in`, `using` (no fake PoS).
- **Specials / overlays / joins** — still the overlay or join job (`z-speaker`, `v-and`), never `@` because the word happens to end in **-n**.

Separate **words** with spaced `|` (`z-dog | v-walk`). Group words into [phrase brackets](#phrase-brackets). One morph gloss line per Agazan line (or per turn). In an [example block](#example-block), leave that line **roman** (no italics, no backticks on pieces; tables may still put a morph cell in backticks). Mid-word **`x`** stays inside one piece (`wish-x-guidance`). See [word separator](#gloss-separator).

### Phrase brackets
<a id="phrase-brackets"></a>

The morph line shows **phrase structure**: which words form one unit and what modifies what. Wrap any unit of **two or more words** that fills one slot in `[ … ]`. Inside a bracket, words still use ` | `. A single word never gets brackets. Roles at clause level stay flat and unbracketed, because they are sisters under the verb: subject `z`, theme `d`, verb `v`, plain `h` / `th`, unhosted recipient `b`, linkers and `/y/`.

A dependent sits next to the word it modifies, in Agazan order. Nesting shows attachment:

| Unit | Morph gloss |
|------|-------------|
| Noun + trailing `/ɡ/` | `[z-dog \| g-blue]` |
| `gl-` adjective + noun | `[gl-blue \| z-dog]` |
| `/w/` + its host | `[w-loud \| g-blue]` |
| Host + hosted `/b/` | `[g-SAME \| b-Alahen]` |
| Hook + extra noun | `[in \| b-house]` |
| Adjective on the extra noun | `[z-dog \| [g-SAME \| [b-Azawan \| g-tall]]]` |
| Join fence (join last) | `[d-tea \| d-coffee \| d-or]` |
| Nested fences | `[[d-tea \| d-coffee \| d-or] \| d-water \| d-and]` |
| Shared `/ɡ/` after a join | `[z-Azawan \| z-Alahen \| z-and \| g-sleepy]` |

A **labeled bracket** `LABEL[ … ]` marks a package. The label is uppercase English with no glyphs. When the package has a role letter, it is the prefix: `d-CITE[…]`.

| Label | Package |
|-------|---------|
| `NAME[…]` | [Titled phrase](../grammar/word-endings.md#titled-phrases): **-n** on the hook, join, or span that packages it |
| `CITE[…]` / `ASIDE[…]` / `OPAQUE[…]` | Span (`d[…]` / `th(…)` / `d<…>`) |
| `CITE.about[…]` | Paraphrase **-m** span (`d~[…]`) |
| `NAME.CITE[…]` | Proper **-n** span (`d@[…]`) |
| `SCOPE[…]` | Scope island `{ … }` |

The closing bracket records the close: `]` complete, `]#` editorial (`#]`), `]|` close-all (`|`). A close-all ends every span open at that point.

The mention marker is a word, not a bracket: `glelel` → `gl-MENTION`, `glelen` → `gl-NAME.MENTION`, written before the span it marks.

### Round trip
<a id="round-trip"></a>

A morph line corresponds **one-to-one** with its Agazan. From the gloss alone you can rebuild the exact written words, so glosses must never merge two forms:

- **Every written word is glossed**, including a spoken **`yal`**. A `yal` that was left out is not added.
- **Sentence marks.** When one line holds several sentences, the mark between them stands alone with spaces: `z-Azawan | v-walk . z-←Azawan | v-judge`. A line-final period is implicit. A [tone mark](../grammar/speech-moves.md#tone-marks) is copied as written: attached to the glossed word or span it colors (`!z-Azawan`), or standing alone with spaces for sentence scope (`! z-Azawan | v-walk`).
- **One label per form.** Each (PoS, root, ending) maps to one English label. Two roots never share an English sense: when they would, reword one row in the lexicon. `npm run lint:lexicon` checks this, and `npm test` round-trips every glossed example in `docs/grammar/`.
- **Form suffixes** record surface choices the sense label does not: `.open` on open joins and hooks, and on number words `.about` (`~`, **-m**), `.named` (`@`, **-n**), `.again` (`=`, **-r**), and a surface mark when a number word is not in its [preferred writing](../grammar/numbers.md#writing-style-numeric-vs-spelled): `.spelled` on a spelled-out word that prefers shorthand (`grawodul` → `g-twelve.spelled`; `g+12` → `g-twelve`), `.short` on shorthand that prefers spelling — no digit or one digit (`g+3` → `g-three.short`; `grarel` → `g-three`; `g+` → `g-more-than-one.short`).
- **Ordinals use digits** (`gredul` → `g-2nd`, `gruedul` → `g-2nd-from-end`), so they never share a label with a lexicon sense such as the time unit *second*.
- **Role-compound resumes** keep their role: `daexaradar` → `d-←instrument-x-write`, `duxaradar` → `d-←patient-x-write`. A bare `d-←write` would merge the doer, scene, undergoer, tool, … of one event.
- **Role pointers** gloss their role and pointer vowel, never the referent: `zaxar` → `z-←agent.same`, `duxor` → `d-←patient.other`, `daxer` → `d-←agent.self`, `zaxur` → `z-←agent.unsaid`. **-l** adds `.new` and **-m** adds `.part` (`duxal` → `d-←patient.same.new`, `zaxam` → `z-←agent.same.part`, `zoxom` → `z-←recipient.other.part`, `zaxum` → `z-←agent.unsaid.part`). The role label is the role-compound one (`recipient` for **`o`**, `instrument` for **`ae`**, …). A pointer inside a seam keeps the seam's host: holder `thunemaxar` → `th-CLUES-←agent.same`, lateral anchor `hewezathaxar` → `h-west-th-←agent.same`.
- **Unknown words fail.** A content word the lexicon cannot gloss has no morph line: a root missing from the lexicon, or **-m** on a root with no abstract sense (unless a closed overlay defines that **-m** form). `lint:agazan` reports it.
- **Quoted pass-through.** Raw payloads (opaque interiors, and a resume stem with no known antecedent) go in straight double quotes: `z-OPAQUE["odoga"]`. A `"` inside the payload is written `""`.

### When an ending still appears in the gloss

Only when it is **not** already baked into the English sense-root:

| Keep in gloss | Why |
|---------------|-----|
| `-x` | Associative / collective ascription / collective doing / address-set — not a sense picker |
| `(←…)` binding for **-r** | Resume is not a lexicon sense; see below |
| Rare teaching callouts | If you must contrast two same-sense forms that differ only by ending, prefer distinct English labels (`and.open` / `and`, `y-question` / `y-soft-question`) over re-attaching `-m` / `-l` or `~` |

Do **not** write `-l` / `-m` / `-n`, **`@`**, or **`~`** after a sense. Named **-n** uses the English name (`z-Azawan`), not `-n` / `-proper` / `@`. [One of a name](../grammar/word-endings.md#name-instance--ln) (**-ln**) is the name plus `.instance` (`d-Azawan.instance`); on a span, **`^@`** is `NAME.<TYPE>.instance` (`d-NAME.OPAQUE.instance["iPhone"]`). Abstract **-m** uses the abstract word (`g-volume`), not `volume~`.

### Sense labels

- Prefer lexicon / overlay wording when short (`tea`, `speaker`, `witnessed`). Packed role English overrides that wording for the listed role only (`v-see` vs `z-eye`).
- Prefer **stable tags** for closed inventory (uppercase OK when the docs already use them): `MAY`, `DECISION`, `SAME`, `MEMORY`, `LIVE`, `ABIL`.
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

Agazan does not mark English tense or progressive aspect on the root. Conjugation belongs only in **free English** (`"Azawan walks."`, `"they are dancing."`). Morph stays `v-walk` / `v-dance` even when the quote uses *walks* / *dancing*.

**Keep *-ing*** only when that string is not a verb lemma — a kind English names that way (`hearing-aid`, `lightning`, `wedding`), a closed tag the grammar already froze, or when stripping it would collide with another published literal (`fishing` vs `fish`, `cooking` vs `cook`, `partying` vs `party`). Do not append *-ing* to mark “this row is used as `/v/`.”

When you retie a published literal (`dancing` → `dance`), morph lines that copied the old string follow (`v-walking` → `v-walk`, `v-walking-unable-temporary` → `v-walk-unable-temporary`).

**Lexicon CSV:** On each published row, **concrete** and **abstract** must not share a citation form on the **whole** hyphenated lemma (exact match or inflectional alternate such as `stressed` / `stress`). Reusing a **hyphen segment** alone (e.g. `credit-card` / `credit`, flag place name / demonym) is allowed. Checked by `npm run lint:lexicon`. Demonyms on **-m** are a listed exception to “unobservable,” not an exception to this collision rule.

### Anaphors (`-r`)
<a id="anaphors-r"></a>

The binder **is** the gloss root. No trailing `-r` (resume is already marked by `←`).

A [resume](../grammar/pronouns.md#resume-r) spells its antecedent's whole stem, so the antecedent's label rebuilds the exact word.

| Case | Agazan | Morph gloss |
|------|--------|-------------|
| Resume of a name | `zazawar` | `z-←Azawan` |
| Resume of a content word | `vezebar` | `v-←sleep` |
| Compound name | `zubunexunower` | `z-←Ubune-x-Unowen` |
| Resume of one of a name (**-ln**) | `zazawar` after `dazawaln` | `z-←Azawan.instance` |
| Resume of a prior content word | | `z-←someone` / `d-←tea` |
| No antecedent, stem not in the lexicon | | `z-←"…"` (the stem itself) |
| Fill-ask / unspecified member | `zar` | `z-wh` / `z-something` (as the docs require for that form) |
| [Tag pronoun](../grammar/pronouns.md#tag-pronouns) | `zwal` / `zwar` / `dwam` | `z-tag.A` (assign) / `z-←tag.A` (recall) / `d-←tag.A.part` (share): the letter name, never the referent. An assigning tag rides in its phrase's bracket: `[z-dog \| z-tag.A]`, or after a fence's bracket for the whole group. A pair joins the letters with `+`: `z-←tag.A+E` |
| [Role pointer](../grammar/pronouns.md#role-pointers) | `zaxar` / `zaxor` / `daxer` | `z-←agent.same` / `z-←agent.other` / `d-←agent.self` / `z-←agent.unsaid` (role and event, never the person's name); `d-←patient.same.new` (**-l**), `z-←agent.same.part` (**-m**) |

Do not write `z-←microphone` for a speaker antecedent.

### House-cast given names
<a id="house-cast"></a>

Grammar examples use three single-root names ([grammar-docs.md](grammar-docs.md#house-cast)). Morph gloss is the **English name**. Free English is that same name, not the virtue word and not *I* / *you*. Resume uses that name (`z-←Azawan`). The learner's own name slot glosses as a free-standing `SELF` (`z-SELF`); the site renders *speaker* or the chosen English name ([first person](grammar-docs.md#house-cast)). Do not write `z-grace@`, `g-volume~`, or `z-grace-proper`.

| Agazan | Morph gloss | Free English | Resume |
|--------|-------------|--------------|--------|
| `zazawan` | `z-Azawan` | *Azawan* | `zazawar` → `z-←Azawan` |
| `zalahen` | `z-Alahen` | *Alahen* | `zalaher` → `z-←Alahen` |
| `zahaben` | `z-Ahaben` | *Ahaben* | `zahaber` → `z-←Ahaben` |

### Mid-word `x` families

Gloss each piece by **family** ([x-compounds.md](../grammar/x-compounds.md)) — English only. Drop sense-picking **-l / -m / -n**. On [values](../grammar/sakes.md), keep the stance **and** the ending table (contact / prescription warrant / time horizon / changeability): `thulothom` → `th-competence-motive-any-term`, not `th-competence-th-motive`.

| Family | Example Agazan | Morph gloss |
|--------|-----------------|-------------|
| Ordinary / name compound | `yabubaxazovan` | `y-Ubune-x-Unowen` |
| Ordinary (three roots) | `zagavexedehexowoden` | `z-Ogove-x-Adeda-x-Unuden` |
| Ability / values stance | `vowogaxel` | `v-walk-unable-temporary` |
| Values stance on need | `thulothom` | `th-competence-motive-any-term` |
| Role compound | `zaxavadal` | `z-agent-x-fight` |
| Span | `th(hagawal)` | `th-ASIDE[h-quiet]` ([labeled bracket](#phrase-brackets)) |
| Number / enumeration | `xrebul` | `x-starting-with` |

For **phrasal proper names**, gloss each piece (`y-Ubune-x-Unowen`, `z-Ogove-x-Adeda-x-Unuden`). Mid-word **`x`** stays visible as `-x-`. Do not put Agazan letters in the english slot, except [opaque interiors](#span-interiors).

### Mention marker and opaque interiors
<a id="span-interiors"></a>

A **mention** is a **word or phrase** as that spelling, not a quoted utterance and not the English lemma. The **mention marker** (`glelel` / `glelen`) is a `gl-` word before the span, glossed `MENTION` / `NAME.MENTION`. The morph line **passes the opaque interior through** in quotes inside a labeled bracket. Free English says *the word …* or *the phrase …* and keeps that spelling.

| Kind | Agazan | Morph | Free English |
|------|--------|-------|--------------|
| Mention (one word) | <code>glelel z&lt;odoga&gt;</code> | `[gl-MENTION \| z-OPAQUE["odoga"]]` | *The word “odoga” is small.* |
| Mention (phrase) | <code>glelel z&lt;zazawan vezehel&gt;</code> | `[gl-MENTION \| z-OPAQUE["zazawan vezehel"]]` | *The phrase “zazawan vezehel” is small.* |
| Mention name-string | <code>glelen d&lt;onodan&gt;</code> | `[gl-NAME.MENTION \| d-OPAQUE["onodan"]]` | *the name “onodan”* (the title-string, not the work) |
| Opaque | `d<kimchi>` | `d-OPAQUE["kimchi"]` | The same blob |
| Cite | `d[azawan]` | `d-CITE[Azawan]` | Translation of the **utterance** (*said “judge.”*) |
| Cite **`@`** | `d@[onodan alahen]` | `d-NAME.CITE[Onodan \| Alahen]` | The **work** (*dislikes Onodan Alahen*) |

Words inside a cite or aside are glossed as usual. They sit in a new clause, so they keep their own role letters and brackets. Opaque interiors are never glossed.

Speech/writing reports (*said “X,”* *sang “X,”* *don’t “halt”*) are **cite**, even when English says *the word X*. Do not mark that object with the mention marker. Sense-talk about a lexeme (*is a noun*, *is archaic*) is still mention; there is no extra “translate the lemma” rule — keep *the word/phrase “…”*.

> <code>glelel z&lt;odoga&gt; gamazam.</code>
>
> [gl-MENTION | z-OPAQUE["odoga"]] | g-small
>
> "The word “odoga” is small."

### Underspecification and joins

Bake join / hook **job** into the English label (including open vs closed when it matters). Do not re-attach sense-picking endings:

| Agazan | Morph gloss |
|---------|-------------|
| `zam` | `z-and.open` |
| `zal` | `z-and` |
| `vam` | `v-and.open` |
| `dol` | `d-or-exactly-one` |
| `zol` | `z-or-exactly-one` |
| `zel` | `z-rank/more` |
| `zoel` | `z-equal-rank` |
| `zoem` | `z-equal-rank.open` |
| `zar` | `z-wh` / `z-something` |
| `zul` / `gul` | `z-not` / `g-not` |
| `zual` | `z-everything-but` |
| `xan` | `x-and-then` |
| `xuen` | `x-and-before-that` |
| `ol` | `instead` |
| `am` | `including.open` |
| `al` | `additionally` (discourse) / `including` (in-clause closed) |
| `el` | `rather` |
| `ul` | `except` |
| `hal` (listed) | `h-only-when` |
| `hal` (bare) | `h-never` |
| `hual` (bare) | `h-always` |
| `her` (statement / fill-ask) | `h-preferred-time` / `h-when-best` |
| `von` | `v-choose` |
| `grarel` | `g-three` |
| `gredul` | `g-2nd` |
| `g+3` (shorthand) | `g-three.short` |
| `g+12` | `g-twelve` |
| `g+e` | `g-plus-infinity` |
| `gral` | `g-more-than-one` |

## Worked examples

### Single words

| Agazan | Morph gloss | Free English (separate) |
|---------|-------------|-------------------------|
| `azawan.` | `Azawan` | *Azawan.* (hello) |
| `yalahexen` | `y-Alahen-minutes` | *Alahen — a few minutes.* |
| `yael` | `y-yes` | *Yes.* |
| `yol` | `y-question` | *(yes/no or fill-ask)* |
| `zamul` | `z-microphone` | *a microphone* |
| `zamun` | `z-speaker` | *I* / *the speaker* |
| `zehon` | `z-listener` | *you* / *the listener* |
| `zazawan` | `z-Azawan` | *Azawan* |
| `zahan` | `z-interlocutors` | *we* (speaker ∪ address set) |
| `zamunx` | `z-speaker-x` | *I and associates* |
| `zehonx` | `z-listener-x` | *you-all* (address set) |
| `gezebul` | `g-sleepy` | *sleepy* |
| `thevom` | `th-MEMORY` | *per memory* |
| `thodom` | `th-LIVE` | *from the scene* |
| `thamar` | `th-plan-sketch` | *as a sketch plan* |
| `gugol` | `g-SAME` | *identical to* (identity host) |
| `von` | `v-choose` | *chooses (exactly one)* |

### Dialogue turn (morph + loose free)

> `yael zamun zam zehon zal gezebul.`
>
> y-yes | [[z-speaker | z-and.open] | z-listener | z-and | g-sleepy]
>
> "Yes — you and I are sleepy."

(Prefer **`zahan gezebul`** when the point is interlocutor *we*, not an explicit two-name census.)

### Metaphor vs overlay vs literal

> `xezom zabur thevom zerehel.`
>
> x-however | z-←Ubune-x-Unowen | th-MEMORY | z-rain
>
> "Still — it's raining, as I remember."

(Strict teaching line: *However — that one (B), per memory — it rains.*)

### Ability + value motive

> `yuel zamun vowogaxel thulothom.`
>
> y-no | z-speaker | v-walk-unable-temporary | th-competence-motive-any-term
>
> "No — I can't walk right now."

### Numbered alternative + unmet pleasure

> `xrebul zehegom grewol zamunx thozothur.`
>
> x-starting-with | [z-problem | g-1st] | z-speaker-x | th-pleasure-unmet-passing
>
> "First problem: we're not enjoying this."

### Inclusive *we* (interlocutors)

> `yael xodum zahan thamar vowogal vul.`
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
| `z-ugobo(speaker)-n` | Agazan letters + redundant ending | `z-speaker` |
| `z-grace@` / `g-volume~` / `z-grace-proper` | Writing glyphs or the word *proper* in the gloss | `z-Azawan` / `g-sleepy` |
| `zam` / `hal` / `am` as the whole morph | Agazan letters where the job belongs | `z-and.open` / `h-only-when` / `including.open` |
| `z-microphone-l` | Ending already chose the literal root | `z-microphone` |
| `z-microphone→speaker` | Etymology chain | `z-speaker` |
| `v-see` for `vahahal` with no `v:see` cell | Invented PoS lemma | Fill `english_by_pos` first, then morph follows |
| Morph line that is only idiomatic English | Confuses layers | Morph + separate quoted free line |
| Morph gloss that matches the quoted English | Redundant; the quote already is the sense | Omit that line when `lint:agazan` agrees ([example block](#example-block)). Keep it when it unpacks **`x`**, PoS, several words, … |
| `gloss:` + per-token backticks inside a code fence | Markdown renders raw; Agazan and gloss look the same | Blockquote; backticks on Agazan only |
| Loose free packed with cast letters / join footnotes / value endings | Duplicates morph; not “what you’d say” | Idiomatic claim; use **strict** free only for teaching |
| English *he* / *she* inside morph for **-r** | Hides Agazan binding | `z-←Antecedent` |
| New synonym every example for the same overlay | Unstable inventory | Fixed labels (`witnessed`, `MAY`, …) |

## Checklist

1. English senses only — no Agazan root spellings, except [mention / opaque interiors](#span-interiors). Verb senses are the uninflected lemma (`dance`, not `dancing`).
2. No `→` etymology chains.
3. No **-l** / **-m** / **-n**, and no **`@`** / **`~`**, when they only selected the sense-root. Named **-n** is the English name (`z-Azawan`), not `-n`, `@`, or `-proper`.
4. Compounds / stance / role / span `x` pieces are always hyphenated segments (`y-Ubune-x-Unowen`). Do not fuse a name into one unsegmented English label.
5. **-r** uses `←…` (no trailing `-r`); **-x** stays as `-x`. Resume of a house name is `z-←Azawan`, not `z-r`. Fill-ask is `z-wh`, not `z-ar`. `wh` is role-neutral (*who*, *what*, *where*, …), so the gloss never contradicts the translation; `wh-else` for **u**.
6. Multi-word units are in [phrase brackets](#phrase-brackets), nested by attachment; packages use labeled brackets (`NAME[…]`, `CITE[…]`, `SCOPE[…]`). The line [round-trips](#round-trip) to the exact Agazan.
7. Free English is on its own **quoted** line (or grammar-table Gloss column) — **loose** by default; **strict** only when teaching packaging. Example blocks follow [example block layout](#example-block) (blockquote; skip a morph line only when `lint:agazan` treats parser output as redundant with that loose line).

## See also

- [spans.md](../grammar/spans.md) — mention / cite / opaque; interiors [above](#span-interiors)
- [word-endings.md](../grammar/word-endings.md) — **-l** / **-m** / **-n** / **-r**
- [lexicon.md](../grammar/lexicon.md) — overlays and closed labels
- [pronouns.md](../grammar/pronouns.md) — **-r** and special pronouns
- [x-compounds.md](../grammar/x-compounds.md) — mid-word `x` families
- [clause.md](../grammar/clause.md#role-letters) — role letters in a sentence
- [sakes.md](../grammar/sakes.md) — need stances and endings (morph keeps them; loose free usually drops channel / standing / force / changeability)
