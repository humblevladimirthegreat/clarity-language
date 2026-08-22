# Agelan core grammar

How to read and write an Agelan **sentence**: word roles, word shape, default order, how a turn starts (`/j/` vs `/x/`), and dependent sentences with **`odo`**.

## Beginner
<a id="beginner"></a>

### Parts of speech

Each content word starts with a **first letter** that marks its job in the sentence. The root stays the same when the job changes — only that first letter changes.

#### Writing words
<a id="orthography"></a>
<a id="writing-words"></a>

Write **role letter + root + ending** as one word:

`zazawan` · `dulonun` · `glulebul`

Prefer a published root when the English meaning matches (`dabebal` for *apple*). Use **-m** when the match is the published **metaphorical** sense (`guzem` for *happy*).

Final letters (**-l** / **-m** / **-n** / **-r**) say how the root enters the talk — full list in [reference-suffix.md](reference-suffix.md).

**Mnemonic (endings):** **-l** literal kind, **-m** metaphorical sense, **-n** proper / named, **-r** resume (point back).
[TODO: don't mention ending letters yet. only use literal words for now]

##### Capitalization
<a id="capitalization"></a>

Agelan writing is **unicase**: use **lowercase** for every native letter. Capital letters appear only when writing foreign words (you learn how to write foreign content later).

#### Outside a sentence (citation)
<a id="citation-forms"></a>
<a id="prefix-less-citation"></a>

When you are **not** filling a clause slot — lexicon head, list, title line, or a freestanding non-clausal turn — you may write the **root** with **no** role letter:

`godol.` · `uzem.` · `azawan.` · `ulonun.`

#### Role letters (parts of speech)
<a id="part-of-speech-prefixes"></a>

| First letter | Job |
|--------------|-----|
| `/z/` | subject (who or what the sentence is about as actor) |
| `/d/` | direct object (who or what is acted on) |
| `/b/` | extra noun tied to a complex adjective or adverb |
| `/v/` | verb (the action) |
| `/ɡ/` | adjective (property or kind label) |
| `/w/` | extra detail on the previous adjective |
| `/h/` | adverb (how / when / where / to whom, and similar) |
| `/x/` | discourse marker (link sentences, continue under the same speech act) |
| `/j/` | utterance marker (start a turn: statement / question / command, call someone, *yes* / *no*, …) |

English *to* / *for* (recipient) uses a complex adverb (`/h/` + `/b/`) plus that extra noun — the same pattern as other “relation + who/what” meanings on the verb.

[TODO: mnemonic column so users can remember letter-job assignments]

### Default sentence order

After you open a turn (or continue with `/x/` under the same speech act), the default order is **Subject – Direct Object – Verb**.

You may rearrange those core roles for style or to put something in **focus** (what you want heard as the point).

- **Adjectives** (`/ɡ/`) go **after** what they describe by default ([Adjectives](#adjectives-ɡ)). Putting them before is Intermediate ([before the noun](#left-bound-adjectives)).
- **Adverbs** (`/h/`) may sit anywhere in their sentence except a “next sentence” `/h/`+`/b/` unit, which must come **last in the main sentence** ([Adverbs](#adverbs-h); [Dependent clauses](#dependent-clauses)).

**Turn** vs **continue:** a new **turn** opens with `/j/` (calling someone, *yes* / *no* words, written [statement / question / command](#clause-force-beginner)) — including turns you take with yourself. **Continuing under the same speech act** uses `/x/` ([discourse markers](#discourse-markers-x)): what follows **keeps** that speech act. Default statement force is **`jal`**, and you may **leave it out** when it is already clear ([Utterance markers](#utterance-markers-j)).

**Mnemonic:** `/j/` = **jump** to a new speech act; `/x/` = **extend** under the same act.

[TODO: clarify what a "turn" is. Might be unnecessary to mention turns here.]

### Nouns and verbs

| Slot | Job |
|------|-----|
| `/z/` | subject — who or what acts |
| `/d/` | direct object — who or what is acted on |
| `/v/` | verb — the action |

To say someone *is* a kind or has a property, use subject + adjective — there is **no** separate *to be* verb here.

**Mnemonic:** the property is an adjective **label** on the subject — no linking verb.

```
`zazawan gedagel.`

gloss: `z-grace` · `g-teacher`

*Azawan is a teacher.*
```
[TODO: change example, we haven't introduced proper names yet]

```
`zogodol gulebul.`

gloss: `z-dog` · `g-blue`

*A dog is blue.*
```

### Adjectives (`/ɡ/`)
<a id="adjectives-ɡ"></a>

`/ɡ/` marks adjectives (and noun-level “related to…” phrases). Using an adjective as the property label, with no `/v/`, is how *is a teacher* / *is blue* work (above).

**Default (after the noun):** the adjective follows the word it describes.

```
`zogodol gulebul.`

gloss: `z-dog` · `g-blue`

*a blue dog*
```

### Adjective extras (`/w/`)

`/w/` adds detail to the **previous adjective** (`/ɡ/` unit) — intensity, manner of the property, and similar.

It sits on that adjective: normally right after the `/ɡ/` (or after that `/ɡ/`’s attached `/b/` if complex). Several `/w/` words may sit in a row on one `/ɡ/` (`guzem wazebol wazebel`). If the relation needs an extra noun, use complex `/ɡ/` + `/b/` instead.
[TODO: give translation of this example]

**Mnemonic:** `/w/` = **with** the adjective (narrow); `/h/` = the **whole** sentence. Same root, different first letter → different reach.

### Adverbs (`/h/`)
<a id="adverbs-h"></a>

`/h/` marks adverbs: how, when, where, *to* / *for*, mood / tense / “how I know,” and related closed kinds.

Because `/h/` talks about the sentence’s verb, **you may place it anywhere in that sentence** — except a “next sentence” `/h/`+`/b/` unit, which must sit **last in the main sentence** ([Dependent clauses](#dependent-clauses)). `/h/` material stays inside its own sentence.

**Several adverbs at once** just sit next to each other: `hadal hozonol` → *hastily and still/quietly*.

### Complex adjectives, complex adverbs, and extra nouns
<a id="complex-adjectives-complex-adverbs-and-argument-nouns"></a>

A **complex** adjective or adverb needs an extra participant: the `/ɡ/` or `/h/` word plus an **extra noun** (`/b/`) right after it. The root names the relation; `/b/` only marks “noun of that word.”

| Shape | Job | Example | Mnemonic |
|-------|-----|---------|----------|
| `/ɡ/` + `/b/` | complex adjective | `gogunol buzuzul` (*same as…*) | **`oguno`** 🪙 *coin* → two faces, one substance |
| `/h/` + `/b/` | complex adverb (*to*, *at*, *regarding*, *because* / *if* + **`odo`**) | `hurugum bodo` (*because* + next sentence) | relation word + bound extra noun |

Keep the `/h/` + `/b/` pair **together with no gap**. Ordinary pairs may move as a unit; a pair whose `/b/` is the next-sentence pronoun must sit **[last in the main sentence](#dependent-clauses)**.

This pattern covers much of what other languages do with little words like *to*, *at*, *because*. Stacking more detail on the extra noun is Intermediate ([complex chaining](#complex-chaining)).

### Utterance markers (`/j/`)
<a id="utterance-markers-j"></a>

`/j/` starts a **turn** — a speech move toward someone else, or toward yourself when you talk alone. It frames what you are doing: **statement / question / command**, **calling someone**, and **short reaction words** (greetings, *yes* / *no*, and similar).

#### Opening a turn (left edge)
<a id="left-edge-order-and-sentence-boundaries"></a>

The start of a **new turn** is a `/j/` cluster in this order:

1. Optional **call**(s) — who you address (`jazawan`, `julonun`, …)
2. Optional **reaction / greeting word**(s) — greetings, *yes* / *no* particles, other expressives
3. Optional **reviser** — prefix-less **`al` / `am` / …** right before force or before a body that defaults to a statement ([revisers.md](revisers.md))
4. **Clause force** — when written; **last** in the cluster, immediately before the sentence body

**Default force is `jal` (statement).** Leave it out when that is already clear:

- A period-ended statement body (writing `.`; speech falls at the end)
- A *yes* / *no* particle is present (**`-l`** → statement **`jal`**; **`-m`** → soft statement **`jam`**)
- A later piece under a clause `/x/` continue ([discourse markers](#discourse-markers-x))
- A [dependent sentence](#dependent-clauses) under **`odo`** with the **same** speech act as the main sentence (a different speech act still needs its own force word)

When force is written, it closes the opener. A new `/j/` turn starts a new utterance.

**Calls and reaction words** sit in this left-edge cluster (or stand alone). A `/j/` after a finished body starts the **next** turn. A *…, yes?* style tag is a **second bare turn** after a period (`zazawan vawul. jael.`).

Bare calls and exclamations with no sentence body use `/j/` without a written force word (a firm *yes* / *no* **-l** still implies statement **`jal`** when a body follows).

#### Clause force (Beginner)
<a id="clause-force-beginner"></a>

Every utterance has exactly one **clause force** — the speech-act setting (statement, question, command, …). Default statement **`jal`** may be **left out** when recoverable (above). Other settings write a `/j/` force word **last** in the left-edge cluster, before the body.

Forms you need for ordinary dialogue:

| Form | Job |
|------|-----|
| **jal** | statement (often omitted) |
| **jol** | question — yes/no and “fill in the blank” ask ([questions.md](questions.md)) |
| **jel** | command / instruction |
| **jul** | prohibition — *don’t…* |

#### *Yes* / *no* particles (pointer)

Closed `/j/` words such as **`jael`** (*yes* / *true*), **`juel`** (*no* / *false*), **`jaol`** (*sure*), and soft **-m** twins are **reaction words** — left-edge or bare turn, not clause force. Full list: [questions.md § Polar stance](questions.md#yes-no-polarity).

**Mnemonic tip:** firm **-l** implies statement **`jal`**; soft **-m** implies soft statement **`jam`**. Prefer **`jael …`** over **`jael jal …`** when a body follows.

### Discourse markers (`/x/`) — turn vs continue
<a id="discourse-markers-x"></a>

`/x/` means **keep going under the same speech act**: continue a joined stretch that inherits the opener’s force, and **sentence linkers** (*however*, *therefore*, …). Only the first turn (or a default statement body) sets the speech act.

**Mnemonic:** word-initial **x** = discourse role (**eXtend** the talk).

| Job | Form family |
|-----|-------------|
| Glue between sentences (*however*, *therefore*, …) | `/x/` linkers (`xezabel`, `xamalal`, …) |
| Source / strength (*apparently*, *allegedly*, …) | `/h/` or `/w/` mood |

### Dependent clauses
<a id="dependent-clauses"></a>

A dependent sentence uses the special next-sentence pronoun **`odo`**: in the main sentence it stands for “whatever follows right away.”

**Mnemonic:** **`odo`** 🚪 *doorway* → *what follows* — the main sentence ends at the doorway; the dependent walks through.

**Placement:** put **`odo` last** in its main-sentence slot, and put the dependent material **immediately after** it. Rearrange free word order so that holds. For *because* / *if* style, the whole `/h/` + `/b/` **`odo`** unit sits last in the main sentence (**`odo`** last). That final **`odo`** is where the dependent begins.

The dependent is a **full sentence**. It may open with its own `/j/` cluster, or **keep** the main sentence’s speech act and omit `/j/` when that matches. The **boundary** is **`odo`**. A different speech act (embedded ask, command, …) needs its own force word.

**That-clause / content** — often a core object, with **`odo` last** in the main sentence:

```
`zazawan dulonun vezabul dodol.`

gloss: `z-Azawan` · `d-Ulonun` · `v-tell` · `d-next-clause`

*Azawan tells Ulonun that…* (dependent sentence follows immediately)
```

**Because / if / …** = `/h/` relation + `/b/` **`odo`** (together, last in the main sentence). Overlay ending is always **-m** (metaphorical sense).

| English | Form | Lexicon | Metaphor |
|---------|------|---------|----------|
| *because* | **`hurugum bodol`** | **`urugu`** | 🧱 *brick* → *foundation* |
| *if* | **`horodom bodol`** | **`orodo`** | 🚪 *door* → *opportunity* |
| *if and only if* | **`heluvem bodol`** | **`eluve`** | ↔️ *left-right* → *reciprocity* |
| *although* / *even though* | **`hezabem bodol`** | **`ezabe`** | 🦓 *zebra* → *contrast* |
| *while* (concurrent) | **`hegumum bodol`** | **`egumu`** | ♊ *gemini* → *duality* |
| *until* | **`hudemum bodol`** | **`udemu`** | ⏲️ *timer* → *deadline* |
| *before* | **`hagagam bodol`** | **`agaga`** | 🎒 *backpack* → *preparation* |
| *after* | **`hohuram bodol`** | **`ohura`** | ⌛ *hourglass-done* → *recency* |

### Translation practice
<a id="translation-practice"></a>

Short drills on this Beginner band. Try each item before opening **Show answer**. Use **published roots** only — no opaque `<>` loans.

**Roots used here:** `azawa` *grace* (name **Azawan**) · `ulonu` *courage* (name **Ulonun**) · `ubuzu` *beauty* (name **Ubuzun**) · `edage` *teacher* · `uzedu` *student* · `ogodo` *dog* · `agada` *cat* · `ogobo` *book* · `ohuze` *house* · `ulebu` *blue* · `edeje` *red* · `eleba` *size* · `uze` smile → *happy* (**-m**) · `awu` *walk* · `urunu` *run* · `ezele` *sleep* · `ezabu` *tell* · `uwa` *write* · `egu` *sing* · `ejo` *perception* (*see*) · `ahura` *sit* · `ada` *haste* · `odo` *next clause* · `urugu` *because* (**-m** on `/h/`)

#### English → Agelan

**1.** *Azawan is a teacher.*

::: details Show answer
`zazawan gedagel.`
:::

**2.** *A dog is blue.*

::: details Show answer
`zogodol gulebul.`
:::

**3.** *Azawan walks.*

::: details Show answer
`zazawan vawul.`
:::

**4.** *Azawan sees a cat.*

::: details Show answer
`zazawan dagadal vejol.`
:::

**5.** *Ulonun is happy.*

::: details Show answer
`zulonun guzem.`
:::

**6.** *Azawan writes a book.*

::: details Show answer
`zazawan dogobol vuwal.`
:::

**7.** *Walk!*

::: details Show answer
`jel vawul.`
:::

**8.** *Don’t run.*

::: details Show answer
`jul vurunul.`
:::

**9.** *Is Ulonun a student?*

::: details Show answer
`jol zulonun gezedul.`
:::

**10.** *Azawan tells Ulonun that the dog runs.*

::: details Show answer
`zazawan dulonun dodol vezabul zogodol vurunul.`
:::

**11.** *Azawan is happy because Ulonun walks.*

::: details Show answer
`zazawan guzem hurugum bodol zulonun vawul.`
:::

#### Agelan → English

**1.** `zazawan gezedul.`

::: details Show answer
*Azawan is a student.*
:::

**2.** `zagadal gedejel.`

::: details Show answer
*A cat is red.*
:::

**3.** `zulonun vurunul.`

::: details Show answer
*Ulonun runs.*
:::

**4.** `zogodol gelebal.`

::: details Show answer
*A dog is big.*
:::

**5.** `zazawan vahural.`

::: details Show answer
*Azawan sits.*
:::

**6.** `jel vegul.`

::: details Show answer
*Sing!*
:::

**7.** `jol zulonun guzem.`

::: details Show answer
*Is Ulonun happy?*
:::

**8.** `zazawan hadal vawul.`

::: details Show answer
*Azawan walks hastily.* / *Azawan hurries on foot.*
:::

**9.** `zohuzel gulebul.`

::: details Show answer
*A house is blue.* / *a blue house*
:::

**10.** `zazawan dulonun dodol vezabul zubuzun vezelel.`

::: details Show answer
*Azawan tells Ulonun that Ubuzun sleeps.*
:::

**11.** `zazawan vawul hurugum bodol zulonun vezelel.`

::: details Show answer
*Azawan walks because Ulonun sleeps.*
:::

## Intermediate
<a id="intermediate"></a>

### Clause force
<a id="clause-force"></a>

Prerequisite: Beginner [join vowel series](coordination.md#join-type-vowel-series) (**a** / **o** / **e** / **u**).

Every utterance has exactly one **clause force** (written `/j/` or implied **`jal`** / **`jam`**). Shape is **`j` + vowel + ending`**: the vowel picks the speech-act family; **-l** = firm / closed; **-m** = soft / open. Non-default forces are **written**; default statement **`jal`** may be omitted under the Beginner rules.

**Mnemonic:** same **vowel series** as joins — **a** inventory / holds, **o** menu / pick, **e** ranked priority, **u** negation — plus ending **-l** / **-m**.

| Form | Force | Letter logic |
|------|--------|----------------|
| **jal** | **statement** — claim or description | **a** + **-l** stand behind |
| **jam** | **soft statement** — tentative / provisional | **a** + **-m** open |
| **jol** | **question** — yes/no and fill-in ask | **o** menu + **-l** |
| **jom** | **soft question** — wonder, gentle ask, offer-like | **o** + **-m** |
| **jel** | **command** — instruction | **e** rank + **-l** |
| **jem** | **request** — soft directive (*please…*) | **e** + **-m** |
| **jul** | **prohibition** — *don’t…* (firm) | **u** negation + **-l** |
| **jum** | **soft prohibition** — *please don’t…* / *I’d rather you not…* | **u** + **-m** |

### Adjectives before the noun (`gl-`)
<a id="left-bound-adjectives"></a>

Insert **l** as the second letter (`/ɡ/` + **l** + root + ending). The adjective comes **before** the noun it describes and attaches to the **next** eligible noun.

```
`glulebul zogodol.`

gloss: `g-blue` · `z-dog`

*a blue dog*
```

**Mnemonic:** mid-word **l** = **lean left** — look ahead to the next host. Only `/ɡ/` takes this **l**.

The package is the same as after-the-noun order: plain `/ɡ/`, or complex `/ɡ/` + `/b/`, plus any following `/w/` stack. `/b/` and `/w/` still follow that `/ɡ/` (`glulebul wazebol zogodol` = *a loud-volume blue dog*). Before-the-noun order is optional style (meter, focus, comfort from your first language).

### Adverb topic and free-order ties
<a id="adverb-topic-and-free-order-ties"></a>

**Topic** (*as for X*, *regarding X*) is complex `/h/` + `/b/` naming the topic noun. Highlight focus by rearranging free word order (and ordinary *very*-type words if needed).

[TODO: confirm that the h roots for this is actually defined]

There is no fixed order among several `/h/` units. Each unit’s job comes from its dictionary role; spoken order is free. If two units share a role and need a ranking, left-to-right breaks the tie.

### Complex chaining
<a id="complex-chaining"></a>

After a complex adjective or adverb, a further plain `/ɡ/` describes the **extra noun**, not the original host. `/w/` after a `/ɡ/` (+ optional `/b/`) grades that adjective. You can chain complex units onto those extra nouns; two complex adjectives on the same host noun need another sentence. Multiple `/h/` units on one verb are fine (each plain `/h/` or together `/h/`+`/b/` counts as one).

Spatial *left* / *right* need a [viewpoint compound](roles.md#viewpoint-laterals) on the direction word; `/b/` only adds the landmark (`gevedexazawan beredel` = *on Azawan’s-left of the tree*). Bare lateral hosts are illegal in space. Discourse **`xamalal`** (*therefore*) stays the metaphorical linker — not spatial right.

### Writing and speech rhythm (periods)
<a id="orthography-and-prosody-periods"></a>

Writing uses **periods** (and matching **`?`** / **`!`**) as **body** boundaries. Speech matches:

| Writing | Speech | Force |
|---------|--------|--------|
| `.` | Fall on last stress + short pause | Closes the prior **body**. Next stretch still defaults to **`jal`** unless a new `/j/` turn, marked force, or *yes* / *no* particle sets otherwise |
| Next `/j/` turn (*yes* / *no*, call, marked force) | Pitch **reset** into the turn | New turn; firm **-l** / soft **-m** imply **`jal`** / **`jam`** |
| Bare body or `REV BODY` after `.` | No full reset required | Implied **`jal`** (or **`jam`** only if a soft particle / written **`jam`** said so) |
| `?` | Rise or high level on last stress | Question (**`jol`** / **`jom`**) — force usually written |
| `!` | Sharp or clipped fall | Command / prohibition — force usually written |
| Soft statement / soft *yes* / *no* **-m** | Lighter fall; boundary still clear | **`jam`** (implied or written) |
| `/x/` continue (clause join) | Dip or short pause; **no** full pitch reset | Keep opener force; period after the **whole** joined stretch |
| `/x/` linker after `.` (`xamalal …`) | Dip into the linker; no turn reset | Keep prior speech act; may start a new written sentence under that force |

**Mnemonic (endings):** period closes the **body**; **-l** vs **-m** on force / *yes* / *no* carries **commitment** (stand behind vs soft / open). A new `/j/` cluster starts a new turn.

### Sentence linkers
<a id="sentence-linkers"></a>

One-way glue between sentences (ordinary ending; **-l** default closed):

| Linker | Lexicon root | Metaphor | Example |
|--------|--------------|----------|---------|
| *therefore* | **`amala`** | ➡️ *right* → *progress* | `xamalal` |
| *however* | **`ezabe`** | 🦓 *zebra* → *contrast* | `xezabel` |
| *meanwhile* | **`ameno`** | 🕰️ *mantel-clock* → *passage* | `xamenol` |
| *next* | **`uvulu`** | 🎞️ *film* → *sequence* | `xuvulul` |
| *but* | **`onuzu`** | 🚧 *construction* → *blockage* | `xonuzul` |

*therefore* moves forward from the prior claim; *however* marks contrast; *meanwhile* is concurrent passage; *next* is the next frame; *but* blocks the expected continuation (harder push-back than *however*). Ordinary content readings of those roots stay available under other role letters.

**Not the same as clause poles:** discourse **`xezabel`** (*however*) / **`xamenol`** (*meanwhile*) glue prior sentences; subordinating **`hezabem bodol`** (*although*) / **`hegumum bodol`** (*while*) attach a dependent under **`odo`** — [dependent clauses](#dependent-clauses).

### Nested dependents
<a id="nested-dependents"></a>

Each clause may have at most one main-sentence-final **`odo`**; a dependent may itself end in **`odo`** (branching only to the right).

### Number as interjection
<a id="number-as-interjection"></a>

A `/j/` **number** word is a call-out (*N more!*, score call, …), not clause force. It may sit in the left-edge cluster before force, or stand alone as a bare turn. Readings by marker: [numbers.md](numbers.md#number-as-interjection-by-marker).

### Translation practice
<a id="translation-practice-intermediate"></a>

Short drills on this Intermediate band. Try each item before opening **Show answer**.

**Roots used here:** `azawa` *grace* (name **Azawan**) · `ulonu` *courage* (name **Ulonun**) · `ubuzu` *beauty* (name **Ubuzun**) · `uzedu` *student* · `ogodo` *dog* · `agada` *cat* · `ulebu` *blue* · `edeje` *red* · `uze` smile → *happy* (**-m**) · `awu` *walk* · `urunu` *run* · `ezele` *sleep* · `ejo` *perception* (*see*) · `egu` *sing* · `ahura` *sit* · `azebo` *loud volume* · `amala` *therefore* · `ezabe` *however* / *although* · `ameno` *meanwhile* · `odo` *next clause* · `urugu` *because* (**-m** on `/h/`)

#### English → Agelan

**1.** *Maybe Azawan walks.*

::: details Show answer
`jam zazawan vawul.`
:::

**2.** *Is Ulonun happy, perhaps?*

::: details Show answer
`jom zulonun guzem?`
:::

**3.** *Please sing.*

::: details Show answer
`jem vegul!`
:::

**4.** *Please don’t run.*

::: details Show answer
`jum vurunul!`
:::

**5.** *A blue dog walks.* (adjective before the noun)

::: details Show answer
`glulebul zogodol vawul.`
:::

**6.** *Azawan sees a loud blue dog.* (adjective before the noun)

::: details Show answer
`zazawan glulebul wazebol dogodol vejol.`
:::

**7.** *Azawan walks. Therefore Ulonun runs.*

::: details Show answer
`zazawan vawul. xamalal zulonun vurunul.`
:::

**8.** *Azawan is happy because Ulonun walks because Ubuzun sleeps.*

::: details Show answer
`zazawan guzem hurugum bodol zulonun vawul hurugum bodol zubuzun vezelel.`
:::

#### Agelan → English

**1.** `jam zubuzun vezelel.`

::: details Show answer
*Maybe Ubuzun sleeps.*
:::

**2.** `jom zazawan gezedul?`

::: details Show answer
*Is Azawan a student, perhaps?*
:::

**3.** `jem vahural!`

::: details Show answer
*Please sit.*
:::

**4.** `jum vawul!`

::: details Show answer
*Please don’t walk.*
:::

**5.** `gledejel zagadal vurunul.`

::: details Show answer
*A red cat runs.*
:::

**6.** `zulonun vawul. xezabel zazawan vezelel.`

::: details Show answer
*Ulonun walks. However Azawan sleeps.*
:::

**7.** `zazawan vawul. xamenol zulonun vezelel.`

::: details Show answer
*Azawan walks. Meanwhile Ulonun sleeps.*
:::

**8.** `zazawan vawul hurugum bodol zulonun guzem hezabem bodol zubuzun vezelel.`

::: details Show answer
*Azawan walks because Ulonun is happy although Ubuzun sleeps.*
:::

## Advanced
<a id="advanced"></a>

### Weak-pause left cues
<a id="weak-pause-left-cues"></a>

When pauses are weak (singing, fast free order), prefer an audible left cue after silence — *yes* / *no*, a call, or a written force word — rather than a bare body that only implies **`jal`**. Writing still uses `.` for body edges.
