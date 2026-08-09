# Clarity language reference (v0.7)

Core grammar for reading and writing a **sentence**: parts of speech, word shape, default order, utterance framing (`/j/` vs `/x/`), and **`odo`** dependents.

Why Clarity exists and how to learn from the docs: **[introduction.md](introduction.md)**. This whole page is **Beginner** ([learning-levels.md](meta/learning-levels.md)).

## Parts of speech

Each content word begins with a **prefix consonant** that marks its role. The root stays the same when the role changes — the prefix changes.

**Mnemonic:** the **first letter is the role stamp** — read it before the root.

### Orthography
<a id="orthography"></a>
<a id="writing-words"></a>

Write **prefix + root + ending** as one token:

`zumogon` · `dehadon` · `glulebul`

Prefer a [published](../data/lexicon-published.csv) root when the English gloss matches (`dabebal` for *apple*). Use **-m** when the match is the published **metaphorical** gloss (`guzem` for *happy*).

**Mnemonic (endings):** **-l** literal kind, **-m** metaphorical sense, **-n** proper / named, **-r** resume — the last letter picks how the root enters discourse.

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
| `/x/` | discourse marker (sentence linkers, clause continue, …) |
| `/j/` | utterance marker (clause force, vocative, interjection) |

Recipients and beneficiaries (English *to* / *for*) use a complex adverb (`/h/` + `/b/`) plus an argument noun — the same pattern as other verb-level relational meanings.

**Mnemonic:** `/b/` is **bound** to the preceding `/ɡ/` or `/h/` (the pair stays together).

## Default clause order

After the utterance opener (or an `/x/` continue that inherits force), the default order is **Subject – Direct Object – Verb**.

You may rearrange those core roles for style or **focus**, or to put a [next-clause pronoun](#dependent-clauses) **matrix-final** before a trailing dependent.

- **Adjectives** (`/ɡ/`) go **after** what they modify by default, or **before** when left-bound (`gl-` — [Adjectives](#adjectives-ɡ)).
- **Adverbs** (`/h/`) may appear anywhere in their clause except a next-clause `/h/`+`/b/` unit, which is matrix-final ([Adverbs](#adverbs-h)).

**Turn** vs **continue:** a new **turn** opens with `/j/` (vocatives, polar stance particles, marked [clause force](#clause-force)) — including self-turns in monologue. **Same-force forward motion** uses `/x/` ([discourse markers](#discourse-markers-x)): later material **inherits** force. Default assertoric force is **`jal`** and is **omissible** when recoverable ([Utterance markers](#utterance-markers-j)).

**Mnemonic:** `/j/` = **jump** to a new speech act; `/x/` = **extend** under the same act.

## Nouns and verbs

| Slot | Job |
|------|-----|
| `/z/` | subject — who or what acts |
| `/d/` | direct object — who or what is acted on |
| `/v/` | verb — the action |

Property and kind claims use **zero-copula**: subject + predicative `/ɡ/` (English *to be* is not a `/v/` here).

**Mnemonic:** the property is an adjective **label** on the subject — no linking verb.

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

## Adjectives (`/ɡ/`)
<a id="adjectives-ɡ"></a>

`/ɡ/` marks adjectives (and noun-level relational phrases). Predicative use without `/v/` is zero-copula (above).

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

**Mnemonic:** mid-word **l** = **lean left** — look ahead to the next host. Only `/ɡ/` takes this **l**.

The contiguous unit is the same in both orders: simple `/ɡ/`, or complex `/ɡ/` + `/b/`, plus any following `/w/` stack. `/b/` and `/w/` still follow that `/ɡ/` (`glulebul wazebol zogodol` = *a loud-volume blue dog*).

Left-bound is optional style (meter, focus, L1 comfort). Prefer postposed order in neutral prose.

## Adjective adjuncts (`/w/`)

`/w/` modifies the **previous adjective** (`/ɡ/` unit).

It sits on its host: normally right after the `/ɡ/` (or after that `/ɡ/`’s contiguous `/b/` if complex), including when the `/ɡ/` is left-bound. Several `/w/` words may juxtapose on one `/ɡ/` (`guzem wazebol wazebel`); that is ordinary co-stacking. If a relation needs an argument, use complex `/ɡ/` + `/b/` instead.

**Mnemonic:** `/w/` = **with** the adjective (narrow); `/h/` = the **whole** clause. Same root, different prefix → different scope.

## Adverbs (`/h/`)
<a id="adverbs-h"></a>

`/h/` marks adverbs: manner, time/place, recipients (*to* / *for*), topic/aboutness, mood/tense/evidentiality, and related closed subcategories. Clause force is `/j/`.

Because `/h/` targets the clause’s verb, **position is free inside the clause** — except a next-clause `/h/`+`/b/` unit, which must be [matrix-final](#dependent-clauses). `/h/` material stays inside its own clause.

**Co-applying adverbs** juxtapose: `hadal hozonol` → *hastily and still/quietly*.

**Topic** (*as for X*, *regarding X*) is complex `/h/` + `/b/` topic noun. Highlight focus by rearranging free word order (and ordinary intensifiers if needed).

There is no fixed scope-band order among multiple `/h/` units. Each unit’s job comes from its lexicon role; spoken order is free. If two units share a role and need a ranking, left-to-right breaks the tie.

**Mnemonic (trap):** source / strength (*apparently*, *allegedly*) stays `/h/` or `/w/`; discourse glue (*however*, *therefore*) is `/x/` ([below](#discourse-markers-x)).

## Complex adjectives, complex adverbs, and argument nouns
<a id="complex-adjectives-complex-adverbs-and-argument-nouns"></a>

A **complex** adjective or adverb takes an extra participant: the `/ɡ/` or `/h/` word plus an **argument noun** (`/b/`) that immediately follows. The root carries the relation; `/b/` only marks “argument of that word.”

| Shape | Job | Example | Mnemonic |
|-------|-----|---------|----------|
| `/ɡ/` + `/b/` | complex adjective | `gogunol buzuzul` (*same as…*) | **`oguno`** 🪙 *coin* → two faces, one substance |
| `/h/` + `/b/` | complex adverb (*to*, *at*, *regarding*, *because* / *if* + **`odo`**) | `hurugul bodo` (*because* + next-clause) | relation word + bound argument |

The `/h/` + `/b/` pair stays **contiguous**. Ordinary pairs may float together; a pair whose `/b/` is the next-clause pronoun is **[matrix-final](#dependent-clauses)**.

After a complex adjective or adverb, further simple `/ɡ/` describes the **argument**, not the original host. `/w/` after a `/ɡ/` (+ optional `/b/`) grades that adjective. You can chain complex units onto arguments; two complex adjectives on the same host noun need another sentence. Multiple `/h/` units on one verb are fine (each simple `/h/` or contiguous `/h/`+`/b/` counts as one).

Complex adjectives and adverbs cover much of what other languages do with prepositional phrases.

## Utterance markers (`/j/`)
<a id="utterance-markers-j"></a>

`/j/` marks a **turn** — a speech-act move toward another person or toward yourself in monologue. It frames the **utterance**: **clause force**, **vocatives**, and **interjections** (greetings, polar stance particles, and similar). **Forward motion** under the **same** illocution uses `/x/`.

**Mnemonic:** `/j/` opens a **turn**; `/x/` **continues** it.

### Left-edge order and sentence boundaries
<a id="left-edge-order-and-sentence-boundaries"></a>

The left edge of a **new turn** is a `/j/` cluster in this order:

1. Optional **vocative**(s) — who is addressed (`jumogon`, `jehadon`, …)
2. Optional **interjection**(s) — greetings, polar stance particles, other expressives
3. Optional **discourse reviser** — prefix-less **`al` / `am` / `an` / `el` / …** immediately before force or before an omitted-default body
4. **Clause force** — when written; **last** in the cluster, immediately before the clause body

**Mnemonic (reviser vowels):** **a** *additionally*, **e** *in other words* / *rather*, **o** *instead*, **u** *except* — same series as joins; endings **-l** closed / **-m** open / **-n** named frame.

**Default force is `jal`.** Omit it when illocution is recoverable:

- Period-bounded assertoric body (writing `.`; speech terminal fall — [periods](#orthography-and-prosody-periods))
- Polar stance particle present (**`-l`** → **`jal`**; **`-m`** → **`jam`**)
- Non-initial conjunct under a clause `/x/` continue ([discourse markers](#discourse-markers-x))
- [Dependent](#dependent-clauses) under **`odo`** with the **same** illocution as the matrix (different illocution still needs its own force)

When force is written, it closes the opener. A new `/j/` turn starts a new utterance. `/x/` continues under inherited force.

**Vocatives and interjections** sit in this left-edge cluster (or as bare utterances). A trailing `/j/` after a body starts the **next** turn. Polar “tags” (*…, yes*) are a **second bare turn** after a period (`zumogon vawul. jael.`).

Bare vocatives and exclamations with no clause use `/j/` without written force (polar **`-l`** still implies **`jal`** when a body follows).

### Orthography and prosody (periods)
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
| `/x/` continue (clause join) | Dip or short pause; **no** full pitch reset | Inherit opener force; period after the **whole** joined stretch |
| `/x/` linker after `.` (`xamalal …`) | Dip into the linker; no turn reset | Inherit prior illocution; may start a new written sentence under that force |

**Mnemonic (endings):** period closes the **body**; **-l** vs **-m** on force / polar carries **commitment** (stand behind vs soft / open). A new `/j/` cluster starts a new turn.

When pauses are weak (singing, fast free order), prefer an audible left cue after silence — polar, vocative, or marked force — rather than a bare body with only implied **`jal`**. Writing still uses `.` for body edges.

### Clause force
<a id="clause-force"></a>

Every utterance has exactly one **clause force** (written `/j/` or implied **`jal`** / **`jam`**). Forms are **`j` + vowel + ending`**: vowel = illocution frame; **-l** = closed / committed; **-m** = open / soft. Marked non-default forces are **written**; default assertoric **`jal`** is **omissible** under the recoverability rules above.

**Mnemonic:** same **vowel series** as joins — **a** inventory / holds, **o** menu / pick, **e** ranked priority, **u** negation — plus ending **-l** / **-m**.

| Form | Force | Letter logic |
|------|--------|----------------|
| **jal** | **statement** — assertoric claim or description | **a** + **-l** stand behind |
| **jam** | **hedged statement** — tentative / provisional assert | **a** + **-m** open |
| **jol** | **question** — yes/no and content / fill-ask | **o** menu + **-l** |
| **jom** | **soft question** — wonder, gentle ask, offer-like question | **o** + **-m** |
| **jel** | **imperative** — command / instruction | **e** rank + **-l** |
| **jem** | **request** — soft directive (*please…*) | **e** + **-m** |
| **jul** | **prohibition** — *don’t…* (closed) | **u** negation + **-l** |
| **jum** | **soft prohibition** — *please don’t…* / *I’d rather you not…* | **u** + **-m** |

A `/j/` **number** word is an interjection (*N more!*, score call, …), not clause force. It may sit in the left-edge cluster before force, or stand alone as a bare utterance.

### Polar stance (interjections)

Closed `/j/` particles such as **`jael`** (*yes* / *true*), **`juel`** (*no* / *false*), **`jaol`** (*sure* / uptake), and soft **-m** twins mark stance as interjections — left-edge or bare utterance, not clause force.

**Mnemonic (vowels + endings):** **ae** match / *true*, **ue** flip / *false*, **ao** menu uptake / *sure*; **-l** committed, **-m** soft. **-l** implies **`jal`**; **-m** implies **`jam`**. Prefer **`jael …`** over **`jael jal …`** when a body follows.

## Discourse markers (`/x/`) — turn vs continue
<a id="discourse-markers-x"></a>

`/x/` carries **same-force forward motion**: clause continues that inherit opener force, and **sentence linkers** (*however*, *therefore*, *meanwhile*, *but*, standalone *next*, …). Only the first turn (or omitted-default opener) sets force.

**Mnemonic:** word-initial **x** = discourse PoS (**eXtend** the talk). Mid-word **x** joins roots inside a compound (`zuzuzuxogeven`) — a different job.

| Job | Form family |
|-----|-------------|
| Discourse glue (*however*, *therefore*, …) | `/x/` linkers (`xezabel`, `xamalal`, …) |
| Source / strength (*apparently*, *allegedly*, …) | `/h/` or `/w/` mood |

### Sentence linkers
<a id="sentence-linkers"></a>

Asymmetric discourse glue between sentences (ordinary reference ending; **-l** default closed):

| Linker | Lexicon root | Metaphor | Example |
|--------|--------------|----------|---------|
| *therefore* | **`amala`** | ➡️ *right* → *progress* | `xamalal` |
| *however* | **`ezabe`** | 🦓 *zebra* → *contrast* | `xezabel` |
| *meanwhile* | **`ameno`** | 🕰️ *mantel-clock* → *passage* | `xamenol` |
| *next* | **`uvulu`** | 🎞️ *film* → *sequence* | `xuvulul` |
| *but* | **`onuzu`** | 🚧 *construction* → *blockage* | `xonuzul` |

*therefore* moves forward from the prior claim; *however* marks contrast; *meanwhile* is concurrent passage; *next* is the next frame; *but* blocks the expected continuation (harder adversative than *however*). Ordinary content readings of those roots stay available under other PoS.

## Dependent clauses
<a id="dependent-clauses"></a>

Dependent clauses use the next-clause special pronoun **`odo`**: it stands in the main clause for “whatever follows immediately.”

**Mnemonic:** **`odo`** 🚪 *doorway* → *what follows* — the matrix ends at the doorway; the dependent walks through.

**Placement:** **`odo`** is **matrix-final** in its clause, and the dependent material **immediately follows** it. Rearrange free word order so that holds. For adverbial subordination, the whole contiguous `/h/` + `/b/` **`odo`** unit is matrix-final (**`odo`** last). That final **`odo`** is the **subordinating edge**.

The dependent is a **sentence** that may open with its own `/j/` cluster or **inherit** matrix force and omit `/j/` when illocution matches. The **boundary** is **`odo`**. Different illocution (embedded ask, directive, …) needs its own force.

**Complement / content clause** — usually a core argument, matrix-final:

```
`zumogon dehadon dodol vezabul.`

gloss: `z-speaker` · `d-listener` · `d-next-clause` · `v-tell`

*I tell you that…* (dependent sentence follows immediately)
```

**Chaining:** each clause may have at most one matrix-final **`odo`**; a dependent may itself end in **`odo`** (right-branching only).

**Adverbial** *because* / *if* / *iff* / … = `/h/` relation + `/b/` **`odo`** (contiguous, matrix-final), e.g. `hurugul bodo` … (**`urugu`** 🧱 *brick* / *foundation* → *because*).
