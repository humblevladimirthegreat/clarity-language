# Agalan core grammar

How to read and write an Agalan **sentence**: word roles, word shape, default order, how a turn starts (`/j/` vs `/x/`), and dependent sentences with **`adoro`**.

## Beginner
<a id="beginner"></a>

### Parts of speech

Each content word starts with a **first letter** that marks its job in the sentence. The root stays the same when the job changes. Only that first letter changes.

#### Writing words
<a id="orthography"></a>
<a id="writing-words"></a>

Write **role letter + root + ending** as one word:

`zazawan` · `dululon` · `glelulul`

Prefer a published root when the English meaning matches (`dabelel` for *apple*). Use **-m** when the match is the published **metaphorical** sense (`guzumum` for *happy*).

The last letter of the word says how the root enters the talk ([reference-suffix.md](reference-suffix.md)). For now, read the whole word as its plain meaning.

##### Capitalization
<a id="capitalization"></a>

Agalan writing is **unicase**: use **lowercase** for every native letter. Capital letters appear only inside quoted foreign spelling that keeps another writing system’s casing.

#### Outside a sentence (citation)
<a id="citation-forms"></a>
<a id="prefix-less-citation"></a>

When you are **not** filling a sentence slot (lexicon head, list, title line, or a freestanding line with no clause), you may write the **root** with **no** role letter:

`odogol.` · `uzumum.` · `azawan.` · `ululon.`

#### Role letters (parts of speech)
<a id="part-of-speech-prefixes"></a>

| First letter | Job | Mnemonic |
|--------------|-----|----------|
| `/z/` | subject (who or what the sentence is about as actor) | **z** = the star of the sentence |
| `/d/` | direct object (who or what is acted on) | **d** = done to |
| `/b/` | extra noun tied to a complex adjective or adverb | **b** = bolted-on extra |
| `/v/` | verb (the action) | **v** = the verb itself |
| `/ɡ/` | adjective (property or kind label) | **ɡ** = grade / property label |
| `/w/` | extra detail on the previous adjective | **w** = with that adjective |
| `/h/` | adverb (how / when / where / to whom, and similar) | **h** = how, when, where |
| `/x/` | discourse marker (link sentences, continue under the same speech act) | **x** = e**x**tend the speech act |
| `/j/` | utterance marker (start a turn: statement / question / command, call someone, *yes* / *no*, …) | **j** = jump to a new act |

English *to* / *for* (recipient) uses a complex adverb (`/h/` + `/b/`) plus that extra noun. The same pattern covers other “relation + who/what” meanings on the verb.

### Default sentence order

After you open a turn (or continue with `/x/` under the same speech act), the default order is **Subject – Direct Object – Verb**.

You may rearrange those core roles for style or to put something in **focus** (what you want heard as the point).

- **Adjectives** (`/ɡ/`) go **after** what they describe by default ([Adjectives](#adjectives-ɡ)). Putting them before is Intermediate ([before the noun](#left-bound-adjectives)).
- **Adverbs** (`/h/`) may sit anywhere in their sentence except a “next sentence” `/h/`+`/b/` unit, which must come **last in the main sentence** ([Adverbs](#adverbs-h); [Dependent clauses](#dependent-clauses)).

**Turn** vs **continue:** a new **turn** opens with `/j/` (calling someone, *yes* / *no* words, written [statement / question / command](#speech-act-beginner)), including turns you take with yourself. **Continuing under the same speech act** uses `/x/` ([discourse markers](#discourse-markers-x)): what follows **keeps** that speech act. Default statement **`jal`** may be **left out** when it is already clear ([Utterance markers](#utterance-markers-j)).

`/j/` = **jump** to a new speech act; `/x/` = **extend** under the same act.

### Nouns and verbs

Use `/z/` for who acts, `/d/` for who is acted on, and `/v/` for the action.

To say someone *is* a kind or has a property, put the property on the subject as an adjective **label**. There is no separate *to be* verb for this job.

```
`zazawan godogol.`

gloss: `z-Azawan` · `g-dog`

*Azawan is a dog.*
```

```
`zodogol gelulul.`

gloss: `z-dog` · `g-blue`

*A dog is blue.*
```

### Adjectives (`/ɡ/`)
<a id="adjectives-ɡ"></a>

`/ɡ/` marks adjectives (and “related to…” phrases on a noun). Using an adjective as the property label, with no `/v/`, is how *is a dog* / *is blue* work (above).

**Default (after the noun):** the adjective follows the word it describes.

```
`zodogol gelulul.`

gloss: `z-dog` · `g-blue`

*a blue dog*
```

### Adjective extras (`/w/`)

`/w/` adds detail to the **previous adjective** (`/ɡ/` unit): intensity, manner of the property, and similar.

It sits on that adjective: normally right after the `/ɡ/` (or after that `/ɡ/`’s attached `/b/` if complex). Several `/w/` words may sit in a row on one `/ɡ/` (`guzumum wazebol wazebel` = *happy, loudly, very loudly*). If the relation needs an extra noun, use complex `/ɡ/` + `/b/` instead.

`/w/` = **with** the adjective (narrow); `/h/` = the **whole** sentence. Same root, different first letter, different reach.

### Adverbs (`/h/`)
<a id="adverbs-h"></a>

`/h/` marks adverbs: how, when, where, *to* / *for*, mood / tense / “how you know,” and related closed kinds.

Because `/h/` talks about the sentence’s verb, **you may place it anywhere in that sentence**, except a “next sentence” `/h/`+`/b/` unit, which must sit **last in the main sentence** ([Dependent clauses](#dependent-clauses)). `/h/` material stays inside its own sentence.

**Several adverbs at once** just sit next to each other: `hadazal hozowol` → *hastily and still/quietly*.

### Complex adjectives, complex adverbs, and extra nouns
<a id="complex-adjectives-complex-adverbs-and-argument-nouns"></a>

A **complex** adjective or adverb needs an extra participant: the `/ɡ/` or `/h/` word plus an **extra noun** (`/b/`) right after it. The root names the relation; `/b/` only marks “noun of that word.”

| Shape | Job | Example | Mnemonic |
|-------|-----|---------|----------|
| `/ɡ/` + `/b/` | complex adjective | `gonunul buzuzul` (*same as…*) | **`onunu`** 🪙 *coin* → two faces, one substance |
| `/h/` + `/b/` | complex adverb (*to*, *at*, *regarding*, *because* / *if* + **`adoro`**) | `hurugum badoro` (*because* + next sentence) | relation word + bound extra noun |

Keep the `/h/` + `/b/` pair **together with no gap**. Ordinary pairs may move as a unit; a pair whose `/b/` is the next-sentence pronoun must sit **[last in the main sentence](#dependent-clauses)**.

This pattern covers much of what other languages do with little words like *to*, *at*, *because*. Stacking more detail on the extra noun is Intermediate ([complex chaining](#complex-chaining)).

### Utterance markers (`/j/`)
<a id="utterance-markers-j"></a>

`/j/` starts a **turn**: a speech move toward someone else, or toward yourself when you talk alone. It frames what you are doing: **statement / question / command**, **calling someone**, and **short reaction words** (greetings, *yes* / *no*, and similar).

#### Opening a turn (left edge)
<a id="left-edge-order-and-sentence-boundaries"></a>

The start of a **new turn** is a `/j/` cluster in this order:

1. Optional **call**(s): who you address (`jazawan`, `jululon`, …)
2. Optional **reaction / greeting word**(s): greetings, *yes* / *no* particles, other expressives
3. **Act word**, when written: **last** in the cluster, immediately before the sentence body

**Default speech act is `jal` (statement).** Leave it out when that is already clear:

- A period-ended statement body (writing `.`; speech falls at the end)
- A *yes* / *no* particle is present (**`-l`** → statement **`jal`**; **`-m`** → soft statement **`jam`**)
- A later piece under a clause `/x/` continue ([discourse markers](#discourse-markers-x))
- A [dependent sentence](#dependent-clauses) under **`adoro`** with the **same** speech act as the main sentence (a different speech act still needs its own act word)

When the act word is written, it closes the opener. A new `/j/` turn starts a new utterance.

**Calls and reaction words** sit in this left-edge cluster (or stand alone). A `/j/` after a finished body starts the **next** turn. A *…, yes?* style tag is a **second bare turn** after a period (`zazawan vawalal. jael.`).

Bare calls and exclamations with no sentence body use `/j/` without a written act word (a firm *yes* / *no* **-l** still implies statement **`jal`** when a body follows).

#### Speech act
<a id="clause-force-beginner"></a>
<a id="speech-act-beginner"></a>

Every utterance has exactly one **speech act**: the setting (statement, question, command, …). Default statement **`jal`** may be **left out** when recoverable (above). Other settings write a `/j/` act word **last** in the left-edge cluster, before the body.

Forms you need for ordinary dialogue:

| Form | Job | Mnemonic |
|------|-----|----------|
| **jal** | statement (often omitted) | **j**ump + **a** hold: stand behind the claim |
| **jol** | question: yes/no and “fill in the blank” ask | **j**ump + **o** menu: pick an answer |
| **jel** | command / instruction | **j**ump + **e** rank: do this |
| **jul** | prohibition: *don’t…* | **j**ump + **u** undo: don’t do this |

Closed `/j/` words such as **`jael`** (*yes* / *true*) and **`juel`** (*no* / *false*) are **reaction words**. They sit at the left edge or as a bare turn. Firm **-l** implies statement **`jal`**; soft **-m** implies soft statement **`jam`**. Prefer **`jael …`** over **`jael jal …`** when a body follows.

### Discourse markers (`/x/`) — turn vs continue
<a id="discourse-markers-x"></a>

`/x/` means **keep going under the same speech act**: continue a joined stretch that inherits the opener’s speech act, and **sentence linkers** (*however*, *therefore*, …). Only the first turn (or a default statement body) sets the speech act.

Word-initial **x** = discourse role (**eXtend** the talk).

| Job | Form family | Mnemonic |
|-----|-------------|----------|
| Glue between sentences (*however*, *therefore*, …) | `/x/` linkers (`xezebal`, `xamalal`, …) | **x** keeps the same speech act while the next sentence starts |

### Dependent clauses
<a id="dependent-clauses"></a>

A dependent sentence uses the special next-sentence pronoun **`adoro`**: in the main sentence it stands for “whatever follows right away.”

**`adoro`** 🚪 *doorway* → *what follows*. The main sentence ends at the doorway; the dependent walks through.

**Placement:** put **`adoro` last** in its main-sentence slot, and put the dependent material **immediately after** it. Rearrange free word order so that holds. For *because* / *if* style, the whole `/h/` + `/b/` **`adoro`** unit sits last in the main sentence (**`adoro`** last). That final **`adoro`** is where the dependent begins.

The dependent is a **full sentence**. It may open with its own `/j/` cluster, or **keep** the main sentence’s speech act and omit `/j/` when that matches. The **boundary** is **`adoro`**. A different speech act (embedded ask, command, …) needs its own act word.

**That-clause / content** is often a core object, with **`adoro` last** in the main sentence:

```
`zazawan dululon vezehel dadorol.`

gloss: `z-Azawan` · `d-Ululon` · `v-tell` · `d-next-clause`

*Azawan tells Ululon that…* (dependent sentence follows immediately)
```

**Because / if / …** = `/h/` relation + `/b/` **`adoro`** (together, last in the main sentence). Overlay ending is always **-m** (metaphorical sense).

| English | Form | Lexicon | Metaphor |
|---------|------|---------|----------|
| *because* | **`hurugum badorol`** | **`urugu`** | 🧱 *brick* → *foundation* |
| *if* | **`hadorom badorol`** | **`adoro`** | 🚪 *door* → *opportunity* |
| *if and only if* | **`hezazem badorol`** | **`ezaze`** | ↔️ *left-right* → *reciprocity* |
| *although* / *even though* | **`hezebam badorol`** | **`ezeba`** | 🦓 *zebra* → *contrast* |
| *while* (concurrent) | **`hegemum badorol`** | **`egemu`** | ♊ *gemini* → *duality* |
| *until* | **`hudumem badorol`** | **`udume`** | ⏲️ *timer* → *deadline* |
| *before* | **`hababam badorol`** | **`ababa`** | 🎒 *backpack* → *preparation* |
| *after* | **`horanem badorol`** | **`orane`** | ⌛ *hourglass-done* → *recency* |

### Translation practice
<a id="translation-practice"></a>

Short drills on this Beginner band. Try each item before opening **Show answer**. Use **published roots** only.

**Roots used here:** `azawa` *grace* (name **Azawan**) · `ululo` *courage* (name **Ululon**) · `uhubu` *beauty* (name **Uhubun**) · `odogo` *dog* · `agada` *cat* · `abogo` *book* · `ohohu` *house* · `elulu` *blue* · `arede` *red* · `ele` *size* · `uzumu` smile → *happy* (**-m**) · `awala` *walk* · `urunu` *run* · `elebe` *sleep* · `ezehe` *tell* · `uwuru` *write* · `uzunu` *sing* · `eje` *perception* (*see*) · `aju` *sit* · `adaza` *haste* · `adoro` *next clause* · `urugu` *because* (**-m** on `/h/`)

#### English → Agalan

**1.** *Azawan is a dog.*

::: details Show answer
`zazawan godogol.`
:::

**2.** *A dog is blue.*

::: details Show answer
`zodogol gelulul.`
:::

**3.** *Azawan walks.*

::: details Show answer
`zazawan vawalal.`
:::

**4.** *Azawan sees a cat.*

::: details Show answer
`zazawan dagadal vejel.`
:::

**5.** *Ululon is happy.*

::: details Show answer
`zululon guzumum.`
:::

**6.** *Azawan writes a book.*

::: details Show answer
`zazawan dabogol vuwurul.`
:::

**7.** *Walk!*

::: details Show answer
`jel vawalal.`
:::

**8.** *Don’t run.*

::: details Show answer
`jul vurunul.`
:::

**9.** *Is Ululon a cat?*

::: details Show answer
`jol zululon gagadal.`
:::

**10.** *Azawan tells Ululon that the dog runs.*

::: details Show answer
`zazawan dululon dadorol vezehel zodogol vurunul.`
:::

**11.** *Azawan is happy because Ululon walks.*

::: details Show answer
`zazawan guzumum hurugum badorol zululon vawalal.`
:::

#### Agalan → English

**1.** `zazawan gagadal.`

::: details Show answer
*Azawan is a cat.*
:::

**2.** `zagadal garedel.`

::: details Show answer
*A cat is red.*
:::

**3.** `zululon vurunul.`

::: details Show answer
*Ululon runs.*
:::

**4.** `zodogol gelel.`

::: details Show answer
*A dog is big.*
:::

**5.** `zazawan vajul.`

::: details Show answer
*Azawan sits.*
:::

**6.** `jel vuzunul.`

::: details Show answer
*Sing!*
:::

**7.** `jol zululon guzumum.`

::: details Show answer
*Is Ululon happy?*
:::

**8.** `zazawan hadazal vawalal.`

::: details Show answer
*Azawan walks hastily.* / *Azawan hurries on foot.*
:::

**9.** `zohohul gelulul.`

::: details Show answer
*A house is blue.* / *a blue house*
:::

**10.** `zazawan dululon dadorol vezehel zuhubun velebel.`

::: details Show answer
*Azawan tells Ululon that Uhubun sleeps.*
:::

**11.** `zazawan vawalal hurugum badorol zululon velebel.`

::: details Show answer
*Azawan walks because Ululon sleeps.*
:::

## Intermediate
<a id="intermediate"></a>

### Speech act
<a id="clause-force"></a>
<a id="speech-act"></a>

Every utterance has exactly one **speech act** (written `/j/` or implied **`jal`** / **`jam`**). Shape is **`j` + vowel + ending`**: the vowel picks the speech-act family; **-l** = firm / closed; **-m** = soft / open. Non-default speech acts are **written**; default statement **`jal`** may be omitted under the Beginner rules.

The vowels match the [vowel-series](vowel-series.md) jobs: **a** add / hold, **o** one / menu, **e** order / rank, **u** undo.

| Form | Speech act | Mnemonic |
|------|--------|----------|
| **jal** | **statement**: claim or description | **a** + **-l** stand behind |
| **jam** | **soft statement**: tentative / provisional | **a** + **-m** open |
| **jol** | **question**: yes/no and fill-in ask | **o** menu + **-l** |
| **jom** | **soft question**: wonder, gentle ask, offer-like | **o** + **-m** |
| **jel** | **command**: instruction | **e** rank + **-l** |
| **jem** | **request**: soft directive (*please…*) | **e** + **-m** |
| **jul** | **prohibition**: *don’t…* (firm) | **u** undo + **-l** |
| **jum** | **soft prohibition**: *please don’t…* / *I’d rather you not…* | **u** + **-m** |

Prefix-less revisers (**`al`** / **`am`** / …) may sit in the left-edge cluster **right before** the act word, or before a body that defaults to a statement. Full table: [revisers.md](revisers.md).

### Adjectives before the noun (`gl-`)
<a id="left-bound-adjectives"></a>

Insert **l** as the second letter (`/ɡ/` + **l** + root + ending). The adjective comes **before** the noun it describes and attaches to the **next** eligible noun.

```
`glelulul zodogol.`

gloss: `g-blue` · `z-dog`

*a blue dog*
```

Mid-word **l** = **lean left**: look ahead to the next host. Only `/ɡ/` takes this **l**.

The package is the same as after-the-noun order: plain `/ɡ/`, or complex `/ɡ/` + `/b/`, plus any following `/w/` stack. `/b/` and `/w/` still follow that `/ɡ/` (`glelulul wazebol zodogol` = *a loud-volume blue dog*). Before-the-noun order is optional style (meter, focus, comfort from your first language).

### Adverb topic and free-order ties
<a id="adverb-topic-and-free-order-ties"></a>

**Topic** (*as for X*, *regarding X*) is complex `/h/` + `/b/` naming the topic noun. Published **`ahaza`** *topic* is the dedicated host: `hahazal bazawan` = *as for Azawan*. Highlight focus by rearranging free word order (and ordinary *very*-type words if needed).

There is no fixed order among several `/h/` units. Each unit’s job comes from its dictionary role; spoken order is free. If two units share a role and need a ranking, left-to-right breaks the tie.

### Complex chaining
<a id="complex-chaining"></a>

After a complex adjective or adverb, a further plain `/ɡ/` describes the **extra noun**, not the original host. `/w/` after a `/ɡ/` (+ optional `/b/`) grades that adjective. You can chain complex units onto those extra nouns; two complex adjectives on the same host noun need another sentence. Multiple `/h/` units on one verb are fine (each plain `/h/` or together `/h/`+`/b/` counts as one).

### Writing and speech rhythm (periods)
<a id="orthography-and-prosody-periods"></a>

Writing uses **periods** (and matching **`?`** / **`!`**) as **body** boundaries. Speech matches:

| Writing | Speech | Speech act | Mnemonic |
|---------|--------|--------|----------|
| `.` | Fall on last stress + short pause | Closes the prior **body**. Next stretch still defaults to **`jal`** unless a new `/j/` turn, a written act word, or *yes* / *no* particle sets otherwise | Period closes the **body** |
| Next `/j/` turn (*yes* / *no*, call, written act word) | Pitch **reset** into the turn | New turn; firm **-l** / soft **-m** imply **`jal`** / **`jam`** | New `/j/` cluster = new turn |
| Bare body or reviser + body after `.` | No full reset required | Implied **`jal`** (or **`jam`** only if a soft particle / written **`jam`** said so) | Same statement unless marked |
| `?` | Rise or high level on last stress | Question (**`jol`** / **`jom`**); act word usually written | Rise asks |
| `!` | Sharp or clipped fall | Command / prohibition; act word usually written | Sharp fall directs |
| Soft statement / soft *yes* / *no* **-m** | Lighter fall; boundary still clear | **`jam`** (implied or written) | **-m** = open / soft |
| `/x/` continue (clause join) | Dip or short pause; **no** full pitch reset | Keep opener speech act; period after the **whole** joined stretch | **x** extends; no new jump |
| `/x/` linker after `.` (`xamalal …`) | Dip into the linker; no turn reset | Keep prior speech act; may start a new written sentence under that speech act | Linker stays in the same act |

**-l** vs **-m** on the act word / *yes* / *no* carries **commitment** (stand behind vs soft / open).

### Sentence linkers
<a id="sentence-linkers"></a>

One-way glue between sentences (ordinary ending; **-l** default closed):

| Linker | Lexicon root | Metaphor | Example |
|--------|--------------|----------|---------|
| *therefore* | **`amala`** | ➡️ *east* → *progress* | `xamalal` |
| *however* | **`ezeba`** | 🦓 *zebra* → *contrast* | `xezebal` |
| *meanwhile* | **`ameno`** | 🕰️ *mantel-clock* → *passage* | `xamenol` |
| *next* | **`uvulu`** | 🎞️ *film* → *sequence* | `xuvulul` |
| *but* | **`onuzu`** | 🚧 *construction* → *blockage* | `xonuzul` |

*therefore* moves forward from the prior claim; *however* marks contrast; *meanwhile* is concurrent passage; *next* is the next frame; *but* blocks the expected continuation (harder push-back than *however*). Ordinary content readings of those roots stay available under other role letters.

Discourse **`xezebal`** (*however*) / **`xamenol`** (*meanwhile*) glue a **prior** sentence to the next one. Subordinating **`hezebam badorol`** (*although*) / **`hegemum badorol`** (*while*) attach a **dependent** under **`adoro`** ([dependent clauses](#dependent-clauses)).

### Nested dependents
<a id="nested-dependents"></a>

Each clause may have at most one main-sentence-final **`adoro`**; a dependent may itself end in **`adoro`** (branching only to the right).

### Number as interjection
<a id="number-as-interjection"></a>

A `/j/` **number** word is a call-out (*N more!*, score call, …). It may sit in the left-edge cluster before the act word, or stand alone as a bare turn. Readings by marker: [numbers.md](numbers.md#number-as-interjection-by-marker).

### Translation practice
<a id="translation-practice-intermediate"></a>

Short drills on this Intermediate band. Try each item before opening **Show answer**.

**Roots used here:** `azawa` *grace* (name **Azawan**) · `ululo` *courage* (name **Ululon**) · `uhubu` *beauty* (name **Uhubun**) · `odogo` *dog* · `agada` *cat* · `elulu` *blue* · `arede` *red* · `uzumu` smile → *happy* (**-m**) · `awala` *walk* · `urunu` *run* · `elebe` *sleep* · `eje` *perception* (*see*) · `uzunu` *sing* · `aju` *sit* · `azebo` *loud volume* · `amala` *therefore* · `ezeba` *however* / *although* · `ameno` *meanwhile* · `adoro` *next clause* · `urugu` *because* (**-m** on `/h/`)

#### English → Agalan

**1.** *Maybe Azawan walks.*

::: details Show answer
`jam zazawan vawalal.`
:::

**2.** *Is Ululon happy, perhaps?*

::: details Show answer
`jom zululon guzumum?`
:::

**3.** *Please sing.*

::: details Show answer
`jem vuzunul!`
:::

**4.** *Please don’t run.*

::: details Show answer
`jum vurunul!`
:::

**5.** *A blue dog walks.* (adjective before the noun)

::: details Show answer
`glelulul zodogol vawalal.`
:::

**6.** *Azawan sees a loud blue dog.* (adjective before the noun)

::: details Show answer
`zazawan glelulul wazebol dodogol vejel.`
:::

**7.** *Azawan walks. Therefore Ululon runs.*

::: details Show answer
`zazawan vawalal. xamalal zululon vurunul.`
:::

**8.** *Azawan is happy because Ululon walks because Uhubun sleeps.*

::: details Show answer
`zazawan guzumum hurugum badorol zululon vawalal hurugum badorol zuhubun velebel.`
:::

#### Agalan → English

**1.** `jam zuhubun velebel.`

::: details Show answer
*Maybe Uhubun sleeps.*
:::

**2.** `jom zazawan gagadal?`

::: details Show answer
*Is Azawan a cat, perhaps?*
:::

**3.** `jem vajul!`

::: details Show answer
*Please sit.*
:::

**4.** `jum vawalal!`

::: details Show answer
*Please don’t walk.*
:::

**5.** `glaredel zagadal vurunul.`

::: details Show answer
*A red cat runs.*
:::

**6.** `zululon vawalal. xezebal zazawan velebel.`

::: details Show answer
*Ululon walks. However Azawan sleeps.*
:::

**7.** `zazawan vawalal. xamenol zululon velebel.`

::: details Show answer
*Azawan walks. Meanwhile Ululon sleeps.*
:::

**8.** `zazawan vawalal hurugum badorol zululon guzumum hezebam badorol zuhubun velebel.`

::: details Show answer
*Azawan walks because Ululon is happy although Uhubun sleeps.*
:::

## Advanced
<a id="advanced"></a>

### Weak-pause left cues
<a id="weak-pause-left-cues"></a>

When pauses are weak (singing, fast free order), prefer an audible left cue after silence: *yes* / *no*, a call, or a written act word, rather than a bare body that only implies **`jal`**. Writing still uses `.` for body edges.
