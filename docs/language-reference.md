# Clarity language reference (v0.7)

Hub for **core clause shape**: parts of speech, orthography, word order, utterance framing (`/j/` vs `/x/`), and basic **`odo`** dependents. Full inventories for pronouns, endings, joins, numbers, and the rest live in the linked grammar docs.

Why Clarity exists, grammar design goals, learning path, and feature criteria: **[introduction.md](introduction.md)**. Sections below are banded **Beginner** / **Intermediate** / **Advanced** ([learning-levels.md](meta/learning-levels.md); prose style: [grammar-docs.md](meta/grammar-docs.md)).

## Beginner

**Prerequisites:** none for this hub’s own Beginner sections. To read ordinary dialogue, also finish Beginner [reference-suffix](reference-suffix.md), [pronouns](pronouns.md), and related Beginner sections in the linked docs.

This band covers PoS prefixes, writing words, default word order, utterance framing, basic `/x/` continue and sentence linkers, and simple **`odo`** dependents. Examples use published Clarity roots and closed grammar forms; donor spelling and span packaging: [spans.md](spans.md#mentions-opaque-and-loan-words).

### Parts of speech

Each content word begins with a **prefix consonant** that marks its role. Roots do not change shape when they change role — the prefix does.

### Orthography
<a id="orthography"></a>
<a id="writing-words"></a>

Write **prefix + root + ending** as one token:

`zumogon` · `dehadon` · `glulebul`

Prefer a [published](../data/lexicon-published.csv) root when the English gloss matches (`dabebal` for *apple*). Use **-m** when the match is the published **metaphorical** gloss (`guzem` for *happy*). Donor roots and span packaging: [spans.md](spans.md#mentions-opaque-and-loan-words).

### Part-of-speech prefixes
<a id="part-of-speech-prefixes"></a>

| Prefix | Role |
|--------|------|
| `/z/` | subject (noun) |
| `/d/` | direct object (noun) |
| `/b/` | argument noun (of a complex adjective or adverb) |
| `/v/` | verb |
| `/ɡ/` | adjective |
| `/w/` | adjective adjunct (modifies the previous `/ɡ/`) |
| `/h/` | adverb (mood / tense / evidentiality, adjuncts) |
| `/x/` (`/ʒ/`) | discourse marker (sentence linkers, [span](spans.md) fences, …) |
| `/j/` (`/dʑ/`) | utterance marker (clause force, vocative, interjection) |

There is no dedicated indirect-object prefix. Recipients and beneficiaries (English *to* / *for*) use a complex adverb (`/h/` + `/b/`) plus an argument noun — the same pattern as other verb-level relational meanings.

### Default clause order

After the utterance opener (or an `/x/` continue that inherits force), the default order is **Subject – Direct Object – Verb**.

You may rearrange those core roles for style or **focus**, or to put a [next-clause pronoun](#dependent-clauses) **matrix-final** before a trailing dependent.

- **Adjectives** (`/ɡ/`) go **after** what they modify by default, or **before** when left-bound (`gl-` — [Adjectives](#adjectives-ɡ)).
- **Adverbs** (`/h/`) may appear anywhere in their clause except a next-clause `/h/`+`/b/` unit, which is matrix-final ([Adverbs](#adverbs-h)).

**Turn** vs **continue:** a new **turn** opens with `/j/` (vocatives, [polar stance](questions.md#yes-no-polarity), marked [clause force](#clause-force)) — including self-turns in monologue. **Same-force forward motion** uses `/x/` ([clause joins](#discourse-markers-x), sentence linkers): later material **inherits** force and does not re-stamp **`jal`**. Default assertoric force is **`jal`** and is **omissible** when recoverable ([Utterance markers](#utterance-markers-j)).

### Nouns and verbs

| Slot | Job |
|------|-----|
| `/z/` | subject — who or what acts |
| `/d/` | direct object — who or what is acted on |
| `/v/` | verb — the action |

There is **no** general *to-be* verb. [Classification](predication.md#classification) and absolute property claims are **zero-copula**: subject + predicative `/ɡ/`.

```
`zumogon gedagel.`

gloss: `z-speaker` · `g-teacher`

*I am a teacher.*
```

```
`zogodol gulebul.`

gloss: `z-dog` · `g-blue`

*A dog is blue.*
```

[Identity](predication.md#identity) (*same referent, two labels*) uses closed complex **`SAME`** (`oguno`) + `/b/`. Ability / incapability: [special-vocabulary.md](special-vocabulary.md#ability).

### Adjectives (`/ɡ/`)
<a id="adjectives-ɡ"></a>

`/ɡ/` marks adjectives (and noun-level relational phrases). Predicative use without `/v/` is [zero-copula](predication.md#zero-copula).

**Default (right-bound):** the adjective follows its host.

```
`zogodol gulebul.`

gloss: `z-dog` · `g-blue`

*a blue dog*
```

**Left-bound (`gl-`):** insert **l** as the second letter (`/ɡ/` + **l** + root + ending). The adjective precedes its host and binds the **next** eligible host.

```
`glulebul zogodol.`

gloss: `g-blue` · `z-dog`

*a blue dog*
```

Only `/ɡ/` takes this mid-word **l**. The contiguous unit is the same in both orders: simple `/ɡ/`, or complex `/ɡ/` + `/b/`, plus any following `/w/` stack. `/b/` and `/w/` still follow that `/ɡ/` (`glulebul wazebol zogodol` = *a loud-volume blue dog*).

Left-bound is optional style (meter, focus, L1 comfort). Prefer postposed order in neutral prose.

SHARED `/ɡ/` under phrase joins: [coordination.md](coordination.md), [comparatives.md](comparatives.md), [plurality.md](plurality.md), [numbers.md](numbers.md#ranges).

### Adjective adjuncts (`/w/`)

`/w/` modifies the **previous adjective** (`/ɡ/` unit) — not the verb or noun directly.

It sits on its host: normally right after the `/ɡ/` (or after that `/ɡ/`’s contiguous `/b/` if complex), including when the `/ɡ/` is left-bound. Unlike `/h/`, `/w/` does not float. Several `/w/` words may juxtapose on one `/ɡ/` (`guzem wazebol wazebel`); that is ordinary co-stacking, not a join fence. If a relation needs an argument, use complex `/ɡ/` + `/b/` instead.

Same root, different prefix → different scope: `/h/` frames the clause; `/w/` frames only the preceding adjective.

Default **values** reading: [values.md](values.md). Prefixed `/w/` joins as restrictors: [restrictors.md](restrictors.md).

### Adverbs (`/h/`)
<a id="adverbs-h"></a>

`/h/` marks adverbs: manner, time/place, recipients (*to* / *for*), topic/aboutness, mood/tense/evidentiality, and related closed subcategories. Clause force is `/j/`, not `/h/`.

Because `/h/` targets the clause’s verb, **position is free inside the clause** — except a next-clause `/h/`+`/b/` unit, which must be [matrix-final](#dependent-clauses). `/h/` material stays inside its own clause; it does not float into a following sentence or trailing dependent.

**Co-applying adverbs** juxtapose with no join: `hadal hozonol` → *hastily and still/quietly*.

**Topic** (*as for X*, *regarding X*) is complex `/h/` + `/b/` topic noun. There are no dedicated focus markers — highlight by rearranging free word order (and ordinary intensifiers if needed). Topic/focus are not `/x/`.

There is no fixed scope-band order among multiple `/h/` units. Each unit’s job comes from its lexicon role; spoken order is free. If two units share a role and need a ranking, left-to-right breaks the tie.

Default **values** reading: [values.md](values.md). Restrictors and evidential mood: [restrictors.md](restrictors.md), [special-vocabulary.md](special-vocabulary.md#evidentiality). Epistemic hedges (*apparently*, *allegedly*, …) are `/h/` or `/w/` — not `/x/`.

### Complex adjectives, complex adverbs, and argument nouns
<a id="complex-adjectives-complex-adverbs-and-argument-nouns"></a>

A **complex** adjective or adverb takes an extra participant: the `/ɡ/` or `/h/` word plus an **argument noun** (`/b/`) that immediately follows. The root carries the relation; `/b/` only marks “argument of that word.”

| Shape | Job | Example |
|-------|-----|---------|
| `/ɡ/` + `/b/` | complex adjective | **`SAME`**: `gogunol buzuzul` |
| `/h/` + `/b/` | complex adverb (*to*, *at*, *regarding*, *because* / *if* + **`odo`**) | `hurugul bodo` (*because* + next-clause) |

The `/h/` + `/b/` pair stays **contiguous**. Ordinary pairs may float together; a pair whose `/b/` is the next-clause pronoun is **[matrix-final](#dependent-clauses)**.

After a complex adjective or adverb, further simple `/ɡ/` describes the **argument**, not the original host. `/w/` after a `/ɡ/` (+ optional `/b/`) grades that adjective. You can chain complex units onto arguments; you cannot stack two complex adjectives on the same host noun in one go — split into another sentence. Multiple `/h/` units on one verb are fine (each simple `/h/` or contiguous `/h/`+`/b/` counts as one).

Complex adjectives and adverbs cover much of what other languages do with prepositional phrases.

### Utterance markers (`/j/`)
<a id="utterance-markers-j"></a>

`/j/` marks a **turn** — a speech-act move toward another person or toward yourself in monologue. It frames the **utterance**: **clause force**, **vocatives**, and **interjections** (greetings, [polar stance](questions.md#yes-no-polarity), and similar). **Forward motion** under the **same** illocution uses `/x/` — not a new `/j/` stamp. The dictionary lists which subclass each root belongs to.

#### Left-edge order and sentence boundaries
<a id="left-edge-order-and-sentence-boundaries"></a>

The left edge of a **new turn** is a `/j/` cluster in this order:

1. Optional **vocative**(s) — who is addressed (`jumogon`, `jehadon`, …)
2. Optional **interjection**(s) — greetings, polar stance particles, other expressives
3. Optional **discourse reviser** — prefix-less **`al` / `am` / `an` / `el` / …** (*additionally* / *in other words* / *instead* / *except*) immediately before force or before an omitted-default body — [revisers.md](revisers.md#discourse-revisers)
4. **Clause force** — when written; **last** in the cluster, immediately before the clause body

**Default force is `jal`.** Omit it when illocution is recoverable:

- Period-bounded assertoric body (writing `.`; speech terminal fall — [periods](#orthography-and-prosody-periods))
- [Polar stance](questions.md#yes-no-polarity) present (**`-l`** → **`jal`**; **`-m`** → **`jam`**)
- Non-initial conjunct under a [clause `/x/` join](#discourse-markers-x) (inherits opener force)
- [Dependent](#dependent-clauses) under **`odo`** with the **same** illocution as the matrix (different illocution still needs its own force)

When force is written, it closes the opener and does not reappear in the body. A new `/j/` turn starts a new utterance. `/x/` continues under inherited force — do not repeat **`jal`** on each conjunct.

**Vocatives and interjections appear only in this left-edge cluster** (or as bare utterances). They do not sit mid-clause or at the end of a sentence — a trailing `/j/` would be ambiguous between end-of-sentence and start-of-next. Mid-sentence asides use [aside fences](spans.md). Polar “tags” (*…, yes*) are a **second bare turn** after a period (`zumogon vawul. jael.`), not same-sentence final `/j/`.

Bare vocatives and exclamations with no clause use `/j/` without written force (polar **`-l`** still implies **`jal`** when a body follows).

#### Orthography and prosody (periods)
<a id="orthography-and-prosody-periods"></a>

Writing uses **periods** (and aligned **`?`** / **`!`**) as **body** boundaries. Speech matches. Force domains are not reset by every period:

| Writing | Prosody | Force |
|---------|---------|--------|
| `.` | Fall on last stress + short pause | Closes the prior **body**. Next stretch still defaults to **`jal`** unless a new `/j/` turn, marked force, or polar sets otherwise |
| Next `/j/` turn (polar, vocative, marked force) | Pitch **reset** into the turn | New turn; polar **`-l`** / **`-m`** imply **`jal`** / **`jam`** |
| Bare body or `REV BODY` after `.` | No full reset required | Implied **`jal`** (or **`jam`** only if a soft polar / written **`jam`** said so) |
| `?` | Rise or high level on last stress | Question (**`jol`** / **`jom`**) — force usually written |
| `!` | Sharp or clipped fall | Directive / prohibition — force usually written |
| Soft assert / soft polar **`-m`** | Lighter fall; boundary still clear | **`jam`** (implied or written) |
| `/x/` continue (clause join) | Dip or short pause; **no** full pitch reset | Inherit opener force; **no** period **inside** the fence; period after the **whole** joined stretch |
| `/x/` linker after `.` (`xamalal …`) | Dip into the linker; no turn reset | Inherit prior illocution; may start a new written sentence under that force |

Period marks **body closure**, not commitment strength and not automatic turn reset — **`jal`** vs **`jam`** and polar **`-l`** vs **`-m`** carry commitment; a new `/j/` cluster starts a new turn. Do not put a period **between** conjuncts of one [clause `/x/` fence](#discourse-markers-x) when they share one force.

When pauses are weak (singing, fast free order): [Advanced](#speech-song-left-cues).

#### Clause force
<a id="clause-force"></a>

Every utterance has exactly one **clause force** (written `/j/` or implied **`jal`** / **`jam`**). Forms are **`j` + join vowel + ending** (same letter jobs as [join series](coordination.md#join-type-vowel-series)): vowel = illocution frame; **-l** = closed / committed; **-m** = open / soft. Do not use **-n** or **-r** on force (**-r** on body joins is unspecified-member / fill-ask). Marked non-default forces are **written**; default assertoric **`jal`** is **omissible** under the recoverability rules above.

| Form | Force | Letter logic |
|------|--------|----------------|
| **jal** | **statement** — assertoric claim or description | **a** inventory / holds + **-l** stand behind |
| **jam** | **hedged statement** — tentative / provisional assert | **a** + **-m** open |
| **jol** | **question** — yes/no and content / fill-ask — [questions.md](questions.md) | **o** menu / pick-one + **-l** |
| **jom** | **soft question** — wonder, gentle ask, offer-like question | **o** + **-m** |
| **jel** | **imperative** — command / instruction | **e** ranked priority + **-l** |
| **jem** | **request** — soft directive (*please…*) | **e** + **-m** |
| **jul** | **prohibition** — *don’t…* (closed) | **u** negation + **-l** |
| **jum** | **soft prohibition** — *please don’t…* / *I’d rather you not…* | **u** + **-m** |

**Numbers are not clause force.** A `/j/` number word is an [interjection](numbers.md#number-as-interjection-by-marker) (*N more!*, deficit call, score call, place cheer). It may sit in the left-edge cluster before force, or stand alone as a bare utterance.

Interrogative grammar (yes/no vs fill-ask, multi-gap **fill-all**, focus/bare under **jol** / **jom**): [questions.md](questions.md).

#### Yes / no polarity (interjections)

Closed `/j/` [polar stance](questions.md#yes-no-polarity) particles (**`jael`** / *true*, **`juel`** / *false*, **`jaol`**, **`juol`**, **`jual`**, soft **-m** twins, …) — inventory and turn-taking: [questions.md § Yes / no polarity](questions.md#yes-no-polarity). Not clause force; left-edge or bare utterance. **`-l`** implies **`jal`**; **`-m`** implies **`jam`** — prefer **`jael …`** over **`jael jal …`** when a body follows.

### Discourse markers (`/x/`) — turn vs continue
<a id="discourse-markers-x"></a>

`/x/` carries **same-force forward motion**: [clause-level joins](coordination.md#clause-level-coordination) (conjuncts inherit opener force), **sentence linkers** (*however*, *therefore*, *meanwhile*, *but*, standalone *next*, …), and related fences. Do not re-stamp **`jal`** on each conjunct — only the first turn (or omitted-default opener) sets force. (*Additionally* / *in other words* / claim-level *instead* / *except* use prefix-less [revisers](revisers.md#discourse-revisers).)

`/x/` connects or fences discourse; it does **not** carry evidential or epistemic framing. Softeners for source-of-knowledge or claim strength stay `/h/` or `/w/` ([Adverbs](#adverbs-h)).

| Job | Form family |
|-----|-------------|
| Discourse glue (*however*, *therefore*, …) | `/x/` linkers (`xezabel`, `xamalal`, …) |
| Source / strength (*apparently*, *allegedly*, …) | `/h/` or `/w/` mood |

Span fences and numbered enumeration: [spans.md](spans.md), [numbers.md](numbers.md#number-as-discourse-marker-by-marker). Mid-word **x** vs word-initial **x**: [Intermediate](#mid-word-x-vs-discourse-x).

#### Sentence linkers
<a id="sentence-linkers"></a>

Asymmetric discourse glue (not clause joins, not revisers). Ending is ordinary [reference-suffix](reference-suffix.md) (**-l** default closed):

| Linker | Lexicon root | Metaphor | Example |
|--------|--------------|----------|---------|
| *therefore* | **`amala`** | ➡️ *right* → *progress* | `xamalal` |
| *however* | **`ezabe`** | 🦓 *zebra* → *contrast* | `xezabel` |
| *meanwhile* | **`ameno`** | 🕰️ *mantel-clock* → *passage* | `xamenol` |
| *next* | **`uvulu`** | 🎞️ *film* → *sequence* | `xuvulul` |
| *but* | **`onuzu`** | 🚧 *construction* → *blockage* | `xonuzul` |

*therefore* moves forward from the prior claim; *however* marks contrast; *meanwhile* is concurrent passage; *next* is the next frame; *but* blocks the expected continuation (harder adversative than *however*). Ordinary content readings of those roots stay available under other PoS. *Starting with* / *Finally* are **`x#e-`** / **`x#e`** — [numbers.md](numbers.md#number-as-discourse-marker-by-marker). Clause *because* / *if* stay `/h/` + **`odo`** — [causation](causation.md#if-vs-iff).

Phrase / VP / clause join fences are not these linkers — [coordination.md](coordination.md).

### Dependent clauses — basics
<a id="dependent-clauses"></a>

Dependent clauses use the [next-clause special pronoun](pronouns.md#special-pronouns) **`odo`**: it stands in the main clause for “whatever follows immediately.”

**Placement:** **`odo`** is **matrix-final** in its clause, and the dependent material **immediately follows** it — no host-clause words after that **`odo`**, and no gap between **`odo`** and the dependent. Rearrange free word order so that holds. For adverbial subordination, the whole contiguous `/h/` + `/b/` **`odo`** unit is matrix-final (**`odo`** last). That final **`odo`** is the **subordinating edge**.

The dependent is a **sentence** that may open with its own `/j/` cluster or **inherit** matrix force and omit `/j/` when illocution matches. Force marks the dependent’s illocution when written; the **boundary** is **`odo`**. Different illocution (embedded ask, directive, …) needs its own force.

**Complement / content clause** — usually a core argument, matrix-final:

```
`zumogon dehadon dodol vezabul.`

gloss: `z-speaker` · `d-listener` · `d-next-clause` · `v-tell`

*I tell you that…* (dependent sentence follows immediately)
```

Chaining and adverbial *because* / *if* / *iff*: [Intermediate](#dependent-clauses-chaining-and-adverbial).

## Intermediate

Subsystems that stack on the beginner core. Full inventories live in the linked docs.

### Ability on hosts
<a id="ability-on-hosts"></a>

Host + `xa` / `xu` ability / incapability, and hostless **`egera`**: [special-vocabulary.md § Ability](special-vocabulary.md#ability).

### Adjectives in SHARED fence slots
<a id="adjectives-in-shared-fence-slots"></a>

SHARED `/ɡ/` under phrase joins (distributive, equative, comparative, kind domain, numeric span, collective **-sh**): [coordination.md](coordination.md), [comparatives.md](comparatives.md), [plurality.md](plurality.md), [numbers.md § Ranges](numbers.md#ranges).

### Values and restrictors on `/w/` / `/h/`
<a id="values-and-restrictors-on-w-h"></a>

Ordinary `/w/` and `/h/` **default** to [values](values.md). Prefixed `hal` / `wal` / … are [restrictors](restrictors.md), not sibling *and*. Evidential and related mood roots: [special-vocabulary.md](special-vocabulary.md#evidentiality).

### Phrase-level, VP-level, and clause-level joins
<a id="phrase-level-vp-level-and-clause-level-joins"></a>

Same-slot joins use PoS + join vowel + ending with a **right-close fence** only (no left fence; no pure infix). Full vowel series, focus/bare, negation, invert, frame echo, and nesting: [coordination.md](coordination.md). Revisers (*including* / *rather* / *instead* / *except*): [revisers.md](revisers.md). `/h/` / `/w/` circumstance fences: [restrictors.md](restrictors.md).

### Mid-word **x** vs discourse **x**
<a id="mid-word-x-vs-discourse-x"></a>
<a id="discourse-markers-spans-and-enumeration"></a>

Word-initial **x** is discourse-marker PoS (linkers, clause joins, span closes). Mid-word **x** joins roots inside compounds (and inside span-fence *speech* opens). It is not an ordinary root consonant. Phonotactics: [phonology.md](phonology.md#phonotactics). Parser families: [x-compounds.md](x-compounds.md). Span fences: [spans.md](spans.md). Numbered enumeration (`x#e-` / `x#e`, …): [numbers.md](numbers.md#number-as-discourse-marker-by-marker).

### Dependent clauses — chaining and adverbial
<a id="dependent-clauses-chaining-and-adverbial"></a>

**Chaining:** each clause may have at most one matrix-final **`odo`**; a dependent may itself end in **`odo`** (right-branching only). **Adverbial** *because* / *if* / *iff* / … = `/h/` relation + `/b/` **`odo`** (contiguous, matrix-final). Core roots **`urugu`** / **`orodo`** / **`eluve`**: [causation.md § IF vs IFF](causation.md#if-vs-iff). Those subordinators are not `/x/`.

## Advanced

Rare or stylistic material on this hub. Most advanced inventory lives in linked grammar docs.

### Speech / song left cues
<a id="speech-song-left-cues"></a>

When pauses are weak (singing, fast free order), prefer an audible left cue after silence — polar, vocative, or marked force — rather than a bare body with only implied **`jal`**. Writing still uses `.` for body edges.

# Linked grammar

| Doc | Topic |
|-----|--------|
| [introduction.md](introduction.md) | Purpose; grammar design; feature criteria |
| [reference-suffix.md](reference-suffix.md) | **-l** / **-m** / **-n** / **-r**; [phrasal proper names](reference-suffix.md#phrasal-proper-names) |
| [plurality.md](plurality.md) | **-sh** associative / address-set / collective |
| [pronouns.md](pronouns.md) | Letter anaphors; **`umogo`** / **`ehado`** / **`ana`** / **`enu`** / **`odo`** |
| [meta/glosses.md](meta/glosses.md) | Morph glosses; [strict vs loose](meta/glosses.md#strict-vs-loose-free-english) free English |
| [meta/learning-levels.md](meta/learning-levels.md) | Beginner / intermediate / advanced banding |
| [meta/grammar-docs.md](meta/grammar-docs.md) | Learner-facing grammar prose style |
| [numbers.md](numbers.md) | Numerals, ranges, measures, `/x/` enumeration |
| [comparatives.md](comparatives.md) | Rank joins; equatives; judgment benchmarks |
| [predication.md](predication.md) | Zero-copula classification; **`SAME`** identity |
| [causation.md](causation.md) | Necessary / sufficient; *if* / *iff* / *because* |
| [coordination.md](coordination.md) | Phrase / VP / clause joins |
| [questions.md](questions.md) | **jol** / **jom**; [polar stance](questions.md#yes-no-polarity) |
| [spans.md](spans.md) | Cite / aside / mention / loan packaging; adjunct islands |
| [values.md](values.md) | Needs on `/h/` / `/w/` |
| [special-vocabulary.md](special-vocabulary.md) | Ability, roles, numeric derivation, moods, … |
| [phonology.md](phonology.md) | Phonology and phonotactics |
| [x-compounds.md](x-compounds.md) | Mid-word **`x`** parser families |
| [revisers.md](revisers.md) | Prefix-less revisers |
| [restrictors.md](restrictors.md) | `/h/` / `/w/` restrictor joins |
