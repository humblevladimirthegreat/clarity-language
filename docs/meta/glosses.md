# Gloss guidelines

How to write **glosses** in Ageben docs and examples. Design authority for morphology stays in the linked grammar pages; this page standardizes the **reading aid** only.

## Goals

A gloss should answer: *what is each Ageben piece doing in the clause — in English labels?*

| Goal | Gloss does | Gloss does not |
|------|------------|----------------|
| Slot + sense | Show PoS letter and the **active English sense** | Quote Ageben phonology (`uwe`, `ugowu`, …), except [opaque interiors](#span-interiors) |
| Separate senses | Treat concrete / abstract / proper / overlay as **different English roots** | Chain etymology (`microphone→speaker`) |
| Endings | Drop **-l** / **-m** / **-n** when they only pick which sense-root applies | Repeat those endings after a sense that already encodes them |
| Structure | Keep mid-word `x` pieces, **-x**, and binding visible | Invent full English syntax for Ageben structure; copy writing glyphs (`@` / `~`) into the gloss |
| Binding | Point **-r** at the antecedent when known | Collapse to English *he* / *she* / *it* |
| Underspecification | Keep vague Ageben vague (`someone`, bare joins) | Sharpen into a specific English claim |
| Separation | Stay word-aligned | Replace the free English line |

**Free English** (quoted line / table “Gloss” in grammar pages) answers *what would you say naturally?* — idiomatic paraphrase, tone, and discourse flow. Do not merge free English into the morph gloss. Free English is a **loose sentence plus an optional note** ([sentence and note](#free-english-sentence-and-note)).

## Layers

| Layer | Where | Form |
|-------|--------|------|
| **Morph gloss** | Dialogue turns, clause / phrase examples, teaching lines | Word-aligned pieces joined with spaced ` | `; one roman line (below). **Omit** when parser output is trivially redundant with in-block loose English ([when to skip](#example-block); `lint:ageben` enforces). |
| **Free English** | Same places, under the morph gloss; one line | Natural sentence in `"double quotes"`, then at most one plain-English note in parentheses after the closing quote for what Ageben marks and the sentence drops ([sentence and note](#free-english-sentence-and-note)). Checkpoint answers and prompts use italics in place of the quotes |
| **Grammar-table gloss** | Inventory / contrast tables in grammar docs | Short free English in **English** (often *italic* in table cells); a cell beside an Ageben phrase or sentence follows the [sentence and note](#free-english-sentence-and-note) shape ([grammar-table gloss](#grammar-table-gloss-free-english-only)). **Cue** is not a gloss ([cues](grammar-docs.md#cues-columns)). |
| **Lexicon fields** | `lexicon-published.csv` / overlays | Concrete / abstract / mnemonic / [role English](#role-english) / definition — **inputs** to morph glosses and lookup, not utterance glosses. Verb senses use the [uninflected lemma](#english-lemma). Concrete English in a **Cue** cell is still not the morph gloss. Morph does **not** take its english slot from role English. |

Grammar tables may keep a column named **Gloss** for free English. When a table needs morphology, use a **Morph** column or a separate morph line in the same format as dialogues.

## Example block layout
<a id="example-block"></a>

Worked examples in grammar pages use a **blockquote**, not a code fence (so Markdown can render). **Backticks mark Ageben only.**

**When the morph line earns its place** (PoS letters, several words, mid-word **`x`**, binding, …):

```markdown
> `zazozon godozel.`
>
> z-Azozon | g-dog
>
> "Azozon is a dog."
```

**When it would only repeat the quote**, omit it — typical of a simple [citation](/word-endings#citation-forms) whose sense *is* the English:

```markdown
> `azozol`
>
> "swan"
```

A **complex citation** still gets a gloss if the morph unpacks structure the quote does not. An `x`-compound name is one word in Ageben and one name in English; the gloss shows the pieces:

```markdown
> `aloxolowon`
>
> wish-x-guidance
>
> "Aloxolowon"
```

| Line | Markup | Why |
|------|--------|-----|
| Surface | `` `ageben.` `` | Copyable Ageben; the only code span |
| Morph | `z-dog | v-walk` | English labels; roman (no italics, no per-token backticks); spaced ` | ` between **words** |
| Free English | `"A dog walks."` | Straight double quotes. A [note](#free-english-sentence-and-note) goes **after** the closing quote: `"Ahelan sings the Sing."` (that titled performance). Parentheses inside the quotes only for an aside, a scope island, or a tag letter ([inside parentheses](#inside-parentheses)). |

Do **not** prefix the gloss with `gloss:`.

**Skip the morph line** when **`lint:ageben`** would treat it as redundant: single-segment parser morph whose English body matches the in-block loose line (same readable words, ignoring quotes and trailing `.?!`). That is a redundancy test, not “citation vs sentence.” Simple `azozol` / `"swan"` omits; `zazozon vowurol.` keeps `z-Azozon | v-walk` because that is not `"Azozon walks."`. Keep the line whenever it shows something the quote hides: role letters, several words, mid-word **`x`** pieces, binding, join jobs. No in-block loose line → omitting morph stays allowed.

### Word separator
<a id="gloss-separator"></a>

Join morph **words** with **space + `|` + space** (`z-Azozon | v-walk`). Type it on a US keyboard (shift-backslash). Do **not** use middot (`·`): it is not on the keyboard and looks like a bullet.

Do not use `/` (already means PoS in the docs, and reads as *or*), hyphen (already inside labels: `z-dog`, `that-clause`), or comma (already inside English). A spaced semicolon (` ; `) is a fine fallback if `|` is awkward in a table cell.

## Free English: sentence and note
<a id="free-english-sentence-and-note"></a>

A free English line is a loose sentence, then at most one note:

```
"<loose sentence>" (<note>)
```

| Part | Job |
|------|-----|
| **Morph** | Keeps Ageben structure (PoS, binding, join job, stance tags, …) |
| **Sentence** | What a fluent speaker would say. Drops distinctions English doesn’t mark ([drop](#drop-in-loose)), keeps what changes the claim ([keep](#keep-in-loose)) |
| **Note** | Optional, one parenthetical **after** the closing quote. States in plain English what Ageben marks and the sentence drops: whose clue or feeling it is, an open or closed list, cause versus blame, whose *left*, what a stand-in refers to, how firm a decision is |

The note is the careful reading written as a fact, not as an awkward second sentence. Do not add a second free English line.

<a id="inside-parentheses"></a>
**Parentheses inside the quotes** have three jobs and no others. Anything else is a note and goes after the closing quote.

| Job | Example | Allowed |
|-----|---------|---------|
| An [aside](/spans#asides) span | "Azozon walks (quietly)." | One group per aside. An aside may also come out as commas or *by the way* |
| A [scope island](/span-mention#scope-islands) | "Azozon and (just water)." | One group per island. English has no other way to fence a group, so the parentheses are the translation |
| A [tag](/tag-pronouns#tag-pronouns) letter, right after the noun it names | "A dog (A) sees a cookie (E). A cat sees A." | A single capital letter, once per tag the sentence sets; later sentences use the letter as a name |

Grouping that English can say does not use parentheses: *either Azozon walks or Alazun runs, and Ahelan sleeps*; *a challenging dog and a challenging cat*. A tone mark is English hedging or stress, not *(?)*: "Azozon saw a dog, I think." (unsure about just the dog).

**Alternative renderings.** When English has more than one natural rendering and the section teaches the range (polar answers, a sense that is *everything* or *everyone*), list them with ` / `: "Yes." / "True." / "Got it." A note, if any, goes after the last one and covers them all. Do not list alternatives that only vary wording.

**Dialogue turns.** A block with more than one speaker's turn writes one quote per turn, as English prints dialogue: "Did Azozon walk?" "Well… Azozon sat." A note, if any, goes after the last turn and names the turn it is about. Do not mix turns and alternatives on one line.

| Not this | This |
|----------|------|
| "tea or coffee (pick one)." | "tea or coffee." (pick one) |
| "You all (everyone I'm talking to) walk." | "You all walk." (everyone I'm talking to) |
| "Azozon walks if there is rain (as mechanism)." | "Azozon walks if it rains." (rain as the mechanism) |
| "You (Alazun) and your associates sit." | "You and your associates sit." (said to Alazun) |
| "Alazun left, so they say. Did Alazun run? Alazun sang (so they say)." | "Alazun left, so they say. Did Alazun run? Alazun sang." (the singing is hearsay too) |
| "Azozon walks (quietly)." with an aside span | Unchanged: the parentheses translate the aside |

**Several sentences on one line.** The note still goes after the closing quote and names which sentence it is about (*the singing is hearsay too*). Never put the note in the middle of the quote.

**Checkpoints.** Ageben → English answers and English → Ageben prompts are italic, not quoted. They follow the same shape with italics in place of the quotes: *Ahelan sees that Alazun sneaks.* (a note, when there is one). The sentence's period goes inside the italics, and nothing follows the note. Alternatives and turns are italic too: *No.* / *False.*; *Didn’t Azozon tell?* *True, Azozon didn’t.* (confirm the negative). An instruction to the learner is a note, not text between the italics. The learner's own name is the `SELF` slot, never *(Your name)*. A note is never required in a checkpoint answer; it is allowed when the checkpoint drills the marking ([translation exercises](translation-exercises.md)).

### When a note is required
<a id="note-required"></a>

| Case | Note |
|------|------|
| The example teaches the marking (the section’s new form) and the sentence drops it | **Required** |
| The sentence drops a marking that changes how a careful reader would take the claim (a holder that is not the speaker, a closed list, a pointer English would leave unclear) | **Required** |
| A marking the section does not teach and that English drops harmlessly (an open join in passing, an evidential tag on a non-evidence page) | Optional; leave it out on Beginner pages |
| Distinctions only the morph line carries: sense-picking endings, cast-letter scaffolding, fence shapes | **Never** |

When the sentence already says it (*as I remember*, *I gather*, *exactly one of*), add no note.

<a id="sentence-first"></a>
**Sentence first.** When English has a natural phrase for the marking, put it in the sentence and add no note: *I can see it*, *as I remember*, *it looks like*, *going by the pattern*, *by definition*, *used to*. Take the phrase from the English column of the owning table, and use the same phrase for the same marking across the page. A note is for what the sentence cannot say without turning awkward: *strong clues*, *the singing is hearsay too*, *not something else*.

- **Nothing the gloss lacks.** Neither the sentence nor the note adds a source, reason, or time the gloss does not have: a bare CLUES channel is *it looks like*, not *from the clouds*.
- **No restating.** Drop a note that repeats the sentence (*Maybe Azozon thinks Alazun left.* needs no *a guess about Azozon's view*).
- **Contrasts with another form** (*quitting for good is …*) are teaching, not translation. When a table just above already shows the other form, drop the contrast; otherwise move it to a prose line or a [Compare with](grammar-docs.md#compare-with) line.
- **A bare verb English cannot leave bare.** When the verb's sense list has an alias that stands alone, use it and leave the Ageben as it is: `v-tell` with nothing told is *talks* / *speaks*, not *tells*. Change the root only when the example needs a different act.
- **English → Ageben prompts** may use the note to pick between two correct answers, in plain English: *A sleepy Alazun stands.* (*sleepy* first), not *(adjective before the noun)*.

### What a note never contains
<a id="note-contents"></a>

A note is a translation, so it never contains:

- Ageben forms, backticks, or gloss labels (`th-CLUES`, `PATTERN`).
- Grammar terms (*holder*, *mirative*, */w/*). Say *the surprise is Azozon’s*, not *mirative with an Azozon holder*.
- Teaching commentary about how the form works (*whose-now and the event’s own time are separate*). That goes in a prose line under the block, or in a [Compare with](grammar-docs.md#compare-with) line.

Explanation that is not translation (*You name yourself rather than saying I.*) goes on its own line under the block, not after the quote.

### Drop in loose
<a id="drop-in-loose"></a>

The sentence drops these. A [note](#note-required) carries one only when it is required; the never row stays out of the note too.

| Ageben distinction | The sentence does |
|---------------------|-----------------|
| Cast resumes and role pointers (`zazozor`, `zwuzer` + “(A)”) | Ordinary *I / you / he / she / they*, or a **name** once known |
| Role metalanguage (`speaker`, `listener`, `interlocutors`) | *I / you / we* |
| Join packaging (open `zam` vs closed `zal`, exclusive `del`, fence shape) | Plain *and / or*; no “exactly ono”, no open-list footnotes |
| Sense-picking **-l / -m / -n** | Never (already omitted from morph when they only pick sense) |
| Values **time horizon / standing / invitation / changeability** | Keep only what changes English (*can't* vs unmet sake as content); drop “(motive, soft standing)”, … Prescription **`the`**: loose free keeps the warrant when it is the point (*invited* / *offered* / *worth a try*) — not *must* / *should* / *could* as a force grade |
| Emotion compose (locus / motion tail) | Ordinary emotion English (*we're glad*), not “pleasure met · internal” |
| Evidential **tags** | Fold in only if English wants it (*I hear…*, *usually*); else omit, or [note](#note-required) when required |
| Span fence labels | Quotes / parentheses; no “Cite:” / “aside:” |
| Role / SAME scaffolding | *the speaker* / *is* — not “agent of speech” / “identical to” |
| Associative **-x** spelled out | *you all* / *they* when English is enough |
| Numbered-alternative pedagogy | *First, …* / *Finally, …* is fine; drop “problem #1” metalabel unless teaching numbering |

### Keep in loose
<a id="keep-in-loose"></a>

- Who / what / polarity / negation
- Force English can say (*please*, *don’t*, *I wonder*)
- Stance that changes the verb (*can't* vs *ought not* vs unmet sake as content)
- Comparatives / equatives / causation / plan when they are the point of the turn
- Mention spans as *the word “odoze”* / *the phrase “…”* (Ageben spelling, not the English lemma) — [span interiors](#span-interiors)
- Opaque interiors as the same blob (`kimchi`, `FBI`)

### Example (same Ageben, sentence and note)

> `yel zawan dedudal dogudal del ven.`
>
> y-question | z-listener | [d-tea | d-coffee | d-or-exactly-one] | v-choose
>
> "Do you want tea or coffee?" (pick exactly one)

On a page teaching exclusive *or*, the note is required. Elsewhere it is optional, or the sentence can carry it (*"Tea or coffee, which one?"*). In a grammar table the same row reads:

| `ven` | `v-choose` | *choose* (exactly one) |

## Senses are separate roots

Published strings share one phonological root, but **concrete**, **abstract**, and **proper / overlay** readings are **different gloss roots**. Gloss only the English sense that is active. Do **not** write the Ageben letters, and do **not** write **-l** / **-m** / **-n** when that ending only selected this sense.

| Ageben | Morph gloss | Not |
|---------|-------------|-----|
| `zuwel` | `z-microphone` | `z-ugobo(microphone)-l`, `z-microphone-l` |
| `zuwem` | `z-speaker` | `z-ugobo(microphone→speaker)-m` |
| `zuwen` | `z-speaker` | `z-ugobo(speaker)-n`, `z-speaker-n` |
| `gugowul` | `g-quiet` | `g-uzumu(quiet)-l` |
| `gugowum` | `g-volume` | `g-uzumu(quiet→volume)-m`, `g-volume-m` |
| `hevul` | `h-fishing` | `h-uvuvu(fishing)-l` |
| `thevum` | `th-MEMORY` | `h-uvuvu(fishing→MEMORY)-m` |
| `goheham` | `g-home` | `g-ohohu(house→home)-m` |

Same English label for `zuwem` and `zuwen` is fine: both are the *speaker* sense-root; the written ending is recoverable from the Ageben line and from [word-endings.md](/word-endings). The gloss’s job is the **sense**, not a second orthography.

**Closed overlays** ([sense-form](../grammar/lexicon.md)): gloss the overlay reading for that `(sense_form, pos)`, not the ordinary lexicon literal. Prefer short stable **English** labels (`witnessed`, `MAY`, `SAME`, `plan`, `DECISION`, …). The Ageben letters themselves follow the [published host root](parser-pipeline.md#closed-forms-follow-lexicon), except vowel-only join stems (`an` / `en` / …).

**Special pronouns** ([pronouns.md](/pronouns)): `zuwen` / `zawan` / `zayan` / `zumen` → `z-speaker` / `z-listener` / `z-interlocutors` / `z-someone` — never emoji etymology. The topic pronoun and the generic pronoun gloss in capitals on `/z/` `/d/` `/b/` and as a holder (`zalen` → `z-TOPIC`, `zeyen` → `z-ONE`, `theyomalen` → `th-CLUES-TOPIC`); on any other slot they are ordinary names. A topic word glosses as its noun (`xazozon` → `x-Azozon`, `xazozor` → `x-←Azozon`), and `hehugom` as `h-as-for`. **Stand-ins** (`darl` / `derl` / …) gloss as `d-that-clause` / `d-whether-clause` / …, not as pronouns.

### Ordinary lexicon plus packed role English
<a id="no-lexicon-pos-specials"></a>

Morph uses the published **concrete** or **abstract** for that ending, unless `english_by_pos` lists a lemma for this role letter and sense ([role English](#role-english)). Do **not** invent a new English root just because the word is under `/v/`. Closed overlays, joins, hooks, speech-act vowels, and house names stay specials.

| Ageben | Morph | Free English |
|--------|--------|------------------------------|
| `vayebel` | `v-see` | *sees* |
| `vehohel` | `v-sit` | *sits* |
| `vezuyol` | `v-tell` | *tells* |
| `al bohehal` | `in | b-house` | *in a house* |
| `welazem` | `w-very` | *very* |
| `zayebel` | `z-eye` | *the eye* (no packing on `/z/`) |

The checkpoint **English** column and the quoted line may say *see* / *sit* / *tell*. Packed **role English** makes the morph line match that lemma when `english_by_pos` lists it for this role and sense (`vayebel` → `v-see`). Do not invent a lemma that is not in that cell.

### Role English (lookup and morph)
<a id="role-english"></a>

Published rows may pack **role English** in `english_by_pos` when the usual English lemma for a role is not a transparent conversion of the **active** sense-root. This is not an overlay and not a second Ageben meaning.

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
- **english** — short English label for the **active** sense (hyphens OK inside a label: `that-clause`, `or-exactly-one`). **Uninflected lemma** for verb senses ([english lemma](#english-lemma)). **No** Ageben root letters. **No** writing glyphs **`@`** / **`~`** (those mark **-n** / **-m** in Ageben spelling only: numbers, span fences).
- **`-x-`** — mid-word compound / stance / role / span hinge; each piece is English (or a stable TAG).
- **-l / -m / -n** — **omit**. They only choose which English sense-root is in play. Do not re-spell them as `-l` / `-m` / `-n` or as `@` / `~`.
- **Names** — the english slot is the **English name** (`z-Azozon`, `z-Hamlet`, `z-Ahelan`, `z-Abodun-x-Ezalan`), not the virtue or kind that formed the stem, and not `z-grace@`.
- **-x** — append `-x` when the written word has associative / address-set / collective **-x** (`z-Azozon-x`, `z-speaker-x`, `z-listener-x`).
- **Prefix-less** hooks: English only — `instead`, `rather`, `additionally`, `in`, `using` (no fake PoS).
- **Specials / overlays / joins** — still the overlay or join job (`z-speaker`, `v-and`), never `@` because the word happens to end in **-n**.

Separate **words** with spaced `|` (`z-dog | v-walk`). Group words into [phrase brackets](#phrase-brackets). One morph gloss line per Ageben line (or per turn). In an [example block](#example-block), leave that line **roman** (no italics, no backticks on pieces; tables may still put a morph cell in backticks). Mid-word **`x`** stays inside one piece (`wish-x-guidance`). See [word separator](#gloss-separator).

### Phrase brackets
<a id="phrase-brackets"></a>

The morph line shows **phrase structure**: which words form one unit and what modifies what. Wrap any unit of **two or more words** that fills one slot in `[ … ]`. Inside a bracket, words still use ` | `. A single word never gets brackets. Roles at clause level stay flat and unbracketed, because they are sisters under the verb: subject `z`, theme `d`, verb `v`, plain `h` / `th`, unhosted recipient `b`, linkers and `/y/`.

A dependent sits next to the word it modifies, in Ageben order. Nesting shows attachment:

| Unit | Morph gloss |
|------|-------------|
| Noun + trailing `/ɡ/` | `[z-dog \| g-blue]` |
| `gl-` adjective + noun | `[gl-blue \| z-dog]` |
| `/w/` + its host | `[w-loud \| g-blue]` |
| Host + hosted `/b/` | `[g-SAME \| b-Alazun]` |
| Hook + extra noun | `[in \| b-house]` |
| Adjective on the extra noun | `[z-dog \| [g-SAME \| [b-Azozon \| g-tall]]]` |
| Join fence (join last) | `[d-tea \| d-coffee \| d-or]` |
| Nested fences | `[[d-tea \| d-coffee \| d-or] \| d-water \| d-and]` |
| Shared `/ɡ/` after a join | `[z-Azozon \| z-Alazun \| z-and \| g-sleepy]` |

A **labeled bracket** `LABEL[ … ]` marks a package. The label is uppercase English with no glyphs. When the package has a role letter, it is the prefix: `d-CITE[…]`.

| Label | Package |
|-------|---------|
| `NAME[…]` | [Titled phrase](/proper-names#titled-phrases): **-n** on the hook, join, or span that packages it |
| `CITE[…]` / `ASIDE[…]` / `OPAQUE[…]` | Span (`d[…]` / `th(…)` / `d<…>`) |
| `CITE.about[…]` | Paraphrase **-m** span (`d~[…]`) |
| `NAME.CITE[…]` | Proper **-n** span (`d@[…]`) |
| `SCOPE[…]` | Scope island `{ … }` |

The closing bracket records the close: `]` complete, `]#` editorial (`#]`), `]|` close-all (`|`). A close-all ends every span open at that point.

The mention marker is a word, not a bracket: `glegol` → `gl-MENTION`, `glegon` → `gl-NAME.MENTION`, written before the span it marks.

### Round trip
<a id="round-trip"></a>

A morph line corresponds **one-to-one** with its Ageben. From the gloss alone you can rebuild the exact written words, so glosses must never merge two forms:

- **Every written word is glossed**, including a spoken **`yal`**. A `yal` that was left out is not added.
- **Sentence marks.** When one line holds several sentences, the mark between them stands alone with spaces: `z-Azozon | v-walk . z-←Azozon | v-judge`. A line-final period is implicit. A [tone mark](/tone-marks#tone-marks) is copied as written: attached to the glossed word or span it colors (`!z-Azozon`), or standing alone with spaces for sentence scope (`! z-Azozon | v-walk`).
- **One label per form.** Each (PoS, root, ending) maps to one English label. Two roots never share an English sense: when they would, reword one row in the lexicon. `npm run lint:lexicon` checks this, and `npm test` round-trips every glossed example in `docs/grammar/`.
- **Form suffixes** record surface choices the sense label does not: `.open` on open joins and hooks, and on number words `.about` (`~`, **-m**), `.named` (`@`, **-n**), `.again` (`=`, **-r**), and a surface mark when a number word is not in its [preferred writing](/number-markers#writing-style-numeric-vs-spelled): `.spelled` on a spelled-out word that prefers shorthand (`grabadol` → `g-twelve.spelled`; `g+12` → `g-twelve`), `.short` on shorthand that prefers spelling — no digit or one digit (`g+3` → `g-three.short`; `gragel` → `g-three`; `g+` → `g-more-than-one.short`).
- **Ordinals use digits** (`grodol` → `g-2nd`, `gruodol` → `g-2nd-from-end`), so they never share a label with a lexicon sense such as the time unit *second*.
- **Role words** gloss the scope after **`w`**, then the part, then the stem, joined with `-`: `zwuzeduyol` → `z-episode-agent-teach`, `gwozeduyol` → `g-role-agent-teach`, `hwozeduyol` → `h-role-agent-teach` (*as a teacher*), `dwubezuyol` → `d-episode-recipient-speech`, `dwuhowurol` → `d-episode-manner-walk`. Scope takes the label-scope labels (`episode`, `role`, `pair`, `type`, and the stacked labels); the part is `agent` (**`z`**), `patient` (**`d`**), `recipient` (**`b`**), or a quality of the event: `manner` (**`h`**), `state` (**`g`**), `stance` (**`th`**), `extent` (**`w`**), `move` (**`y`**), `outcome` (**`x`**), `event` (**`v`**, pointers only). A stem compound keeps its `-x-` (`zwuzodozexowurol` → `z-episode-agent-dog-x-walk`), and ability follows the stem (`gwozeduyoxal` → `g-role-agent-teach-able`).
- **Hook prefixes** gloss the hook as its extra-noun label, then `-x-`, then the stem: `guoxuvuvul` → `g-against-x-fight`, `guomxawulol` → `g-contrary-to-x-wind` (the **`mx`** frame is the hook's **-m** label), `guoxohehaxowurol` → `g-against-x-house-x-walk`. A hook-compound stem glosses as the fused verb (`guoxowurolul` → `g-against-x-leave`), and label scope keeps its `-th-` hinge (`zuoxuvuvuthol` → `z-against-x-fight-th-role`).
- **Hooked joins** gloss the hook's label from the [extra-noun grid](/extra-noun-hooks#extra-noun-intermediate) (the frame label on hook **-m**, the point-back label on hook **-r**), then `-x-`, then the join's label, with `.open` for join **-m**; the landmark rides in the bracket: `zexual blohehal` → `[z-at-x-everything | bl-house]`, `zemxuam bluwen` → `[z-near-x-everything.open | bl-speaker]`, `doxar` under a question → `d-for-x-wh`, `zerxual` → `z-there-x-everything`, `daorxar` → `d-on.it-x-something`. On `/h/`, a point-back names a time: `hurxal` → `h-since.then-x-never` (`ar` `within.then`, `er` `at.then`).
- **Numeric prefixes** gloss the number body's kind label, then `-x-`, then the stem in the sense its ending picks: `zrawaxolamal` → `z-infinity-x-love`, `zruwuxahuyayel` → `z-quasi-x-friend`, `zragexezuyol` → `z-three-x-speech`, `drobaxobewom` → `d-1st-x-draft`. The **`mx`** seam adds `.about` to the number (`dragemxezuyol` → `d-three.about-x-speech`).
- **Role-compound resumes** keep their scope and part: `dwuzaruyor` → `d-←episode-agent-write`, `dwudaruyor` → `d-←episode-patient-write`. A bare `d-←write` would merge the doer, undergoer, and extra party of one event.
- **Role pointers** gloss their scope, part, and pointer vowel, never the referent: `zwuzer` → `z-←episode-agent.same`, `dwudar` → `d-←episode-patient.other`, `dwuzor` → `d-←episode-agent.self`, `zwuzur` → `z-←episode-agent.unsaid`, `zwozer` → `z-←role-agent.same`, `dwuher` → `d-←episode-manner.same`, `dwuver` → `d-←episode-event.same`. **-l** adds `.new` and **-m** adds `.part` (`dwudel` → `d-←episode-patient.same.new`, `zwuzem` → `z-←episode-agent.same.part`, `zwubam` → `z-←episode-recipient.other.part`, `zwuzum` → `z-←episode-agent.unsaid.part`).
- **Say words** gloss scope, whose say, the answer, and the ending, joined with `-`: `hwuvam` → `h-episode-event-ALLOW-said`, `hwudum` → `h-episode-patient-FORBID-said`, `hwezal` → `h-pair-agent-ALLOW-rule`. Scope takes the label-scope labels; whose say is `agent` / `patient` / `recipient` / `event`; the answer is `ALLOW` / `FORBID` / `REQUIRE` / `CHOICE`; the ending is `rule` (**-l**), `said` (**-m**), or `tacit` (**-r**).
- **Unknown words fail.** A content word the lexicon cannot gloss has no morph line: a root missing from the lexicon, or **-m** on a root with no abstract sense (unless a closed overlay defines that **-m** form). `lint:ageben` reports it.
- **Quoted pass-through.** Raw payloads (opaque interiors, and a resume stem with no known antecedent) go in straight double quotes: `z-OPAQUE["kimchi"]`. A `"` inside the payload is written `""`.

### When an ending still appears in the gloss

Only when it is **not** already baked into the English sense-root:

| Keep in gloss | Why |
|---------------|-----|
| `-x` | Associative / collective ascription / collective doing / address-set — not a sense picker |
| `(←…)` binding for **-r** | Resume is not a lexicon sense; see below |
| Rare teaching callouts | If you must contrast two same-sense forms that differ only by ending, prefer distinct English labels (`and.open` / `and`, `y-question` / `y-soft-question`) over re-attaching `-m` / `-l` or `~` |

Do **not** write `-l` / `-m` / `-n`, **`@`**, or **`~`** after a sense. Named **-n** uses the English name (`z-Azozon`), not `-n` / `-proper` / `@`. [One of a name](/proper-names#name-instance--ln) (**-ln**) is the name plus `.instance` (`d-Azozon.instance`); on a span, **`^@`** is `NAME.<TYPE>.instance` (`d-NAME.OPAQUE.instance["iPhone"]`). Abstract **-m** uses the abstract word (`g-volume`), not `volume~`.

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

Ageben does not mark English tense or progressive aspect on the root. Conjugation belongs only in **free English** (`"Azozon walks."`, `"they are dancing."`). Morph stays `v-walk` / `v-dance` even when the quote uses *walks* / *dancing*.

**Tense in free English.** Write the present by default (*Azozon walks.*). Write the past when the Ageben puts the event before now (a past date or day offset, MEMORY, RESIDUE, FORMER, an as-of time in the past: *Azozon walked in 1962.*, *Azozon walked, I remember it.*), or when the sentence reports an event that is over: hearsay or clues about something that happened (*Alazun left, so they say.*, *It looks like Alazun fought.*) or a quote someone said (*Azozon said, “Alazun talks.”*). A forecast or a later date takes *will*. Tense never licenses a time word: write *walked*, not *walked yesterday*, unless the Ageben has the day.

**Keep *-ing*** only when that string is not a verb lemma — a kind English names that way (`hearing-aid`, `lightning`, `wedding`), a closed tag the grammar already froze, or when stripping it would collide with another published literal (`fishing` vs `fish`, `cooking` vs `cook`, `partying` vs `party`). Do not append *-ing* to mark “this row is used as `/v/`.”

When you retie a published literal (`dancing` → `dance`), morph lines that copied the old string follow (`v-walking` → `v-walk`, `v-walking-unable-temporary` → `v-walk-unable-temporary`).

**Lexicon CSV:** On each published row, **concrete** and **abstract** must not share a citation form on the **whole** hyphenated lemma (exact match or inflectional alternate such as `stressed` / `stress`). Reusing a **hyphen segment** alone (e.g. `credit-card` / `credit`, flag place name / demonym) is allowed. Checked by `npm run lint:lexicon`. Demonyms on **-m** are a listed exception to “unobservable,” not an exception to this collision rule.

### Anaphors (`-r`)
<a id="anaphors-r"></a>

The binder **is** the gloss root. No trailing `-r` (resume is already marked by `←`).

A [resume](/pronouns#resume-r) spells its antecedent's whole stem, so the antecedent's label rebuilds the exact word.

| Case | Ageben | Morph gloss |
|------|--------|-------------|
| Resume of a name | `zazozor` | `z-←Azozon` |
| Resume of a content word | `vezuver` | `v-←sleep` |
| Compound name | `zaboduxezalar` | `z-←Abodun-x-Ezalan` |
| Resume of one of a name (**-ln**) | `zazozor` after `dazozoln` | `z-←Azozon.instance` |
| Resume of a prior content word | | `z-←someone` / `d-←tea` |
| No antecedent, stem not in the lexicon | | `z-←"…"` (the stem itself) |
| Fill-ask / unspecified member | `zar` | `z-wh` / `z-something` (as the docs require for that form) |
| [Tag pronoun](/tag-pronouns#tag-pronouns) | `zwal` / `zwar` / `dwam` | `z-tag.A` (assign) / `z-←tag.A` (recall) / `d-←tag.A.part` (share) / `z-←tag.A.name` (**-n** recall of a name): the letter name, never the referent. An assigning tag rides in its phrase's bracket: `[z-dog \| z-tag.A]`, or after a fence's bracket for the whole group. A pair joins the letters with `+`: `z-←tag.A+E` |
| [Role pointer](/pronouns#role-pointers) | `zwuzer` / `zwuzar` / `dwuzor` | `z-←episode-agent.same` / `z-←episode-agent.other` / `d-←episode-agent.self` / `z-←episode-agent.unsaid` (scope, part, and event, never the person's name); `d-←episode-patient.same.new` (**-l**), `z-←episode-agent.same.part` (**-m**) |

Do not write `z-←microphone` for a speaker antecedent.

### House-cast given names
<a id="house-cast"></a>

Grammar examples use three single-root names ([grammar-docs.md](grammar-docs.md#house-cast)). Morph gloss is the **English name**. Free English is that same name, not the virtue word and not *I* / *you*. Resume uses that name (`z-←Azozon`). Plain *I* is `uwen`, glossed *speaker*. The learner's own name slot, used only where the name is the form (greeting, bid, introduction), glosses as a free-standing `SELF` (`SELF`, `SELF-presence`); the site renders *speaker* or the chosen English name ([first person](grammar-docs.md#house-cast)). Do not write `z-grace@`, `g-volume~`, or `z-grace-proper`.

| Ageben | Morph gloss | Free English | Resume |
|--------|-------------|--------------|--------|
| `zazozon` | `z-Azozon` | *Azozon* | `zazozor` → `z-←Azozon` |
| `zalazun` | `z-Alazun` | *Alazun* | `zalazur` → `z-←Alazun` |
| `zahelan` | `z-Ahelan` | *Ahelan* | `zahelar` → `z-←Ahelan` |

### Mid-word `x` families

Gloss each piece by **family** ([compounds.md](/compounds)) — English only. Drop sense-picking **-l / -m / -n**. On [values](/sakes), keep the stance **and** the ending table (contact / prescription warrant / time horizon / changeability): `thuwathom` → `th-competence-motive-any-term`, not `th-competence-th-motive`.

| Family | Example Ageben | Morph gloss |
|--------|-----------------|-------------|
| Ordinary / name compound | `yaboduxezalan` | `y-Abodun-x-Ezalan` |
| Ordinary (three roots) | `zogudaxedudaxowulan` | `z-Uguda-x-Ududa-x-Owulan` |
| Ability / values stance | `vowuroxol` | `v-walk-unable-temporary` |
| Values stance on need | `thuwathom` | `th-competence-motive-any-term` |
| Role compound | `zwuzuvuvul` | `z-episode-agent-fight` ([role words](#round-trip)) |
| Capacity | `hwozeduyol` | `h-role-agent-teach` ([role words](#round-trip)) |
| Hook prefix | `guoxuvuvul` / `guomxawulol` | `g-against-x-fight` / `g-contrary-to-x-wind` ([hook prefixes](#round-trip)) |
| Hooked join | `zexual blohehal` / `hurxal` | `[z-at-x-everything \| bl-house]` / `h-since.then-x-never` ([hooked joins](#round-trip)) |
| Numeric prefix | `zrawaxolamal` / `dragemxezuyol` | `z-infinity-x-love` / `d-three.about-x-speech` ([numeric prefixes](#round-trip)) |
| Span | `th(hugowul)` | `th-ASIDE[h-quiet]` ([labeled bracket](#phrase-brackets)) |
| Number / enumeration | `xrowul` | `x-starting-with` |

For **hyphenated names**, gloss each piece (`y-Abodun-x-Ezalan`, `z-Uguda-x-Ududa-x-Owulan`). Mid-word **`x`** stays visible as `-x-`. Do not put Ageben letters in the english slot, except [opaque interiors](#span-interiors).

### Mention marker and opaque interiors
<a id="span-interiors"></a>

A **mention** is a **word or phrase** as that spelling, not a quoted utterance and not the English lemma. The **mention marker** (`glegol` / `glegon`) is a `gl-` word before the span, glossed `MENTION` / `NAME.MENTION`. The span is a cite when the spelling is Ageben and opaque when it is foreign. A one-word cite passes its spelling through in quotes (`CITE["udozo"]`); a longer cite is glossed as usual; an opaque interior passes through in quotes. Free English says *the word …* or *the phrase …* and keeps that spelling.

| Kind | Ageben | Morph | Free English |
|------|--------|-------|--------------|
| Mention (one word) | `glegol z[odoze]` | `[gl-MENTION \| z-CITE["odoze"]]` | *The word “odoze” is small.* |
| Mention (phrase) | `glegol z[zazozon vozuyel]` | `[gl-MENTION \| z-CITE[z-Azozon \| v-sing]]` | *The phrase “zazozon vozuyel” is small.* |
| Mention name-string | `glegon d[onuren]` | `[gl-NAME.MENTION \| d-CITE[Onuren]]` | *the name “onuren”* (the title-string, not the work) |
| Mention (foreign) | <code>glegol z&lt;kimchi&gt;</code> | `[gl-MENTION \| z-OPAQUE["kimchi"]]` | *The word “kimchi” is small.* |
| Opaque | `d<kimchi>` | `d-OPAQUE["kimchi"]` | The same blob |
| Cite | `d[azozon]` | `d-CITE[Azozon]` | Translation of the **utterance** (*said “judge.”*) |
| Cite **`@`** | `d@[onuren alazun]` | `d-NAME.CITE[Onuren \| Alazun]` | The **work** (*dislikes Onuren Alazun*) |

Words inside a cite or aside are glossed as usual. They sit in a new clause, so they keep their own role letters and brackets. Opaque interiors are never glossed.

Speech/writing reports (*said “X,”* *sang “X,”* *don’t “halt”*) are **cite**, even when English says *the word X*. Do not mark that object with the mention marker. Sense-talk about a lexeme (*is a noun*, *is archaic*) is still mention; there is no extra “translate the lemma” rule — keep *the word/phrase “…”*.

> `glegol z[odoze] gamezem.`
>
> [gl-MENTION | z-CITE["odoze"]] | g-small
>
> "The word “odoze” is small."

### Underspecification and joins

Bake join / hook **job** into the English label (including open vs closed when it matters). Do not re-attach sense-picking endings:

| Ageben | Morph gloss |
|---------|-------------|
| `zam` | `z-and.open` |
| `zal` | `z-and` |
| `vam` | `v-and.open` |
| `del` | `d-or-exactly-one` |
| `zel` | `z-or-exactly-one` |
| `zol` | `z-rank/more` |
| `zoel` | `z-equal-rank` |
| `zoem` | `z-equal-rank.open` |
| `zar` | `z-wh` / `z-something` |
| `zarx` | `z-wh-x` / `z-something-x` |
| `zweyer` | `z-←pair-move.same` |
| `zul` / `gul` | `z-not` / `g-not` |
| `zual` | `z-everything-but` |
| `xan` | `x-and-then` |
| `xuon` | `x-and-before-that` |
| `el` | `instead` |
| `am` | `including.open` |
| `al` | `additionally` (discourse) / `including` (in-clause closed) |
| `ol` | `in.other.words` |
| `ul` | `except` |
| `hal` (listed) | `h-only-when` |
| `hal` (bare) | `h-never` |
| `hual` (bare) | `h-always` |
| `hor` (statement / fill-ask) | `h-preferred-time` |
| `ven` | `v-choose` |
| `gragel` | `g-three` |
| `grodol` | `g-2nd` |
| `g+3` (shorthand) | `g-three.short` |
| `g+12` | `g-twelve` |
| `g+e` | `g-plus-infinity` |
| `gral` | `g-more-than-one` |

## Worked examples

### Single words

| Ageben | Morph gloss | Free English (separate) |
|---------|-------------|-------------------------|
| `azozon.` | `Azozon` | *Azozon.* (hello) |
| `yalazuxon` | `y-Alazun-minutes` | *Alazun — a few minutes.* |
| `yaol` | `y-yes` | *Yes.* |
| `yel` | `y-question` | *(yes/no or fill-ask)* |
| `zuwel` | `z-microphone` | *a microphone* |
| `zuwen` | `z-speaker` | *I* / *the speaker* |
| `zawan` | `z-listener` | *you* / *the listener* |
| `zazozon` | `z-Azozon` | *Azozon* |
| `zayan` | `z-interlocutors` | *we* (speaker ∪ address set) |
| `zuwenx` | `z-speaker-x` | *I and associates* |
| `zawanx` | `z-listener-x` | *you-all* (address set) |
| `guzemel` | `g-sleepy` | *sleepy* |
| `thevum` | `th-MEMORY` | *per memory* |
| `thugem` | `th-LIVE` | *from the scene* |
| `thagor` | `th-plan-sketch` | *as a sketch plan* |
| `gorel` | `g-SAME` | *identical to* (identity host) |
| `ven` | `v-choose` | *chooses (exactly one)* |

### Dialogue turn (morph + loose free)

> `yaol zuwen zam zawan zal guzemel.`
>
> y-yes | [[z-speaker | z-and.open] | z-listener | z-and | g-sleepy]
>
> "Yes — you and I are sleepy."

(Prefer **`zayan guzemel`** when the point is interlocutor *we*, not an explicit two-name census.)

### Metaphor vs overlay vs literal

> `xezem thevum zerulal.`
>
> x-however | th-MEMORY | z-rain
>
> "Still, it's raining, as I remember."

No note: *as I remember* already says whose memory it is. Do not render the overlay literally (*per memory, rain*).

### Ability + value motive

> `yuol zuwen vowuroxol thuwathom.`
>
> y-no | z-speaker | v-walk-unable-temporary | th-competence-motive-any-term
>
> "No — I can't walk right now."

### Numbered alternative + unmet pleasure

> `xrowul zobevam grobal. zuwenx thodethur.`
>
> x-starting-with | [z-problem | g-1st] . z-speaker-x | th-pleasure-unmet-passing
>
> "First problem: we're not enjoying this."

### Inclusive *we* (interlocutors)

> `yaol xahom zayan thagor vowurol vul.`
>
> y-yes | x-therefore | z-interlocutors | th-plan-sketch | [v-walk | v-not]
>
> "Yes — so we're planning not to walk."

### Grammar-table gloss (free English only)

From comparative inventories — no morph line required (loose claim; parenthetical note OK when the row teaches packaging).

An italic English cell beside an Ageben phrase or sentence (an **Ageben**, **Example**, or **Form** column) is that phrase's free English, on grammar pages and [cheat sheets](grammar-docs.md#cheat-sheets) alike: `*sentence*` plus at most one (note) after it, alternatives with ` / `, and parentheses inside only as [above](#inside-parentheses). Several examples in one cell are split by ` · ` or `; `, each with its own note. A single word's senses (`*here*, *this*`), a template, a cell not in italics (a description), and an English column left of the Ageben (a lookup keyed by English job) are not free English. `lint:ageben` checks the shape and the parentheses.

| Example | Gloss |
|---------|-------|
| `z<Sam>n z<Lea>n zol g<big>l` | *Sam is bigger than Lea* (closed; Sam ≻ Lea on *big*) |

When teaching the join morphology in the same table, add morph:

| Example | Morph | Gloss |
|---------|-------|-------|
| `… zol g<big>l` | `[… \| z-rank/more \| g-big]` | *… is bigger …* |

Foreign `<>` roots: use the donor sense as the English label (`g-big`).

## Anti-patterns

| Avoid | Why | Prefer |
|-------|-----|--------|
| `z-ugobo(speaker)-n` | Ageben letters + redundant ending | `z-speaker` |
| `z-grace@` / `g-volume~` / `z-grace-proper` | Writing glyphs or the word *proper* in the gloss | `z-Azozon` / `g-sleepy` |
| `zam` / `hal` / `am` as the whole morph | Ageben letters where the job belongs | `z-and.open` / `h-only-when` / `including.open` |
| `z-microphone-l` | Ending already chose the literal root | `z-microphone` |
| `z-microphone→speaker` | Etymology chain | `z-speaker` |
| `v-see` for `vayebel` with no `v:see` cell | Invented PoS lemma | Fill `english_by_pos` first, then morph follows |
| Morph line that is only idiomatic English | Confuses layers | Morph + separate quoted free line |
| Morph gloss that matches the quoted English | Redundant; the quote already is the sense | Omit that line when `lint:ageben` agrees ([example block](#example-block)). Keep it when it unpacks **`x`**, PoS, several words, … |
| `gloss:` + per-token backticks inside a code fence | Markdown renders raw; Ageben and gloss look the same | Blockquote; backticks on Ageben only |
| Free English packed with cast letters / join footnotes / value endings | Duplicates morph; not “what you’d say” | Idiomatic sentence; a [note](#note-required) only for what a careful reader needs |
| A note inside the quotes, or a second free English line | Two places for the same job | `"sentence."` (note) |
| English *he* / *she* inside morph for **-r** | Hides Ageben binding | `z-←Antecedent` |
| New synonym every example for the same overlay | Unstable inventory | Fixed labels (`witnessed`, `MAY`, …) |

## Checklist

1. English senses only — no Ageben root spellings, except [mention / opaque interiors](#span-interiors). Verb senses are the uninflected lemma (`dance`, not `dancing`).
2. No `→` etymology chains.
3. No **-l** / **-m** / **-n**, and no **`@`** / **`~`**, when they only selected the sense-root. Named **-n** is the English name (`z-Azozon`), not `-n`, `@`, or `-proper`.
4. Compounds / stance / role / span `x` pieces are always hyphenated segments (`y-Abodun-x-Ezalan`). Do not fuse a name into one unsegmented English label.
5. **-r** uses `←…` (no trailing `-r`); **-x** stays as `-x`. Resume of a house name is `z-←Azozon`, not `z-r`. Fill-ask is `z-wh`, not `z-ar`. `wh` is role-neutral (*who*, *what*, *where*, …), so the gloss never contradicts the translation; `wh-else` for **u**.
6. Multi-word units are in [phrase brackets](#phrase-brackets), nested by attachment; packages use labeled brackets (`NAME[…]`, `CITE[…]`, `SCOPE[…]`). The line [round-trips](#round-trip) to the exact Ageben.
7. Free English is on its own **quoted** line (or grammar-table Gloss column, or italic in a checkpoint): a loose sentence (or [alternatives or dialogue turns](#inside-parentheses)) plus at most one note after the closing quote, required when the section teaches the marking the sentence drops ([sentence and note](#free-english-sentence-and-note)). Example blocks follow [example block layout](#example-block) (blockquote; skip a morph line only when `lint:ageben` treats parser output as redundant with that loose line).

## See also

- [spans.md](/spans) — mention / cite / opaque; interiors [above](#span-interiors)
- [word-endings.md](/word-endings) — **-l** / **-m** / **-n** / **-r**
- [lexicon.md](../grammar/lexicon.md) — overlays and closed labels
- [pronouns.md](/pronouns) — **-r** and special pronouns
- [compounds.md](/compounds) — mid-word `x` families
- [clause.md](/clause#role-letters) — role letters in a sentence
- [sakes.md](/sakes) — need stances and endings (morph keeps them; loose free usually drops channel / standing / force / changeability)
