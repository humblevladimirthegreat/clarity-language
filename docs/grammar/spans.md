# Spans

Some parts of a sentence are not ordinary Agazan words: a quote of what someone said, a word from another language, a comment in parentheses. Agazan sets such a part apart as a **span**: a role letter, then a pair of brackets around the words. The role letter says what the whole bracketed chunk does in the sentence (subject, object, verb, adverb, and so on), so the rest of the sentence reads as usual. A span is written only: speech has no word for its open or close.

## Beginner {#beginner}

Start with a quote of what someone said.

### Cite (`[…]`) {#writing}
<a id="writing-vs-speech"></a>

To quote wording (what someone said, a title, a proverb as words), write the role letter, then square brackets around the quoted words. That span is a **cite**. The whole quote fills one role, so *said “…”* works like *said something*. (cue: `[…]` like quote marks)

Start with a one-word quote as the object of *said*. A [greeting](word-endings.md#greeting) is just your own name, so quoting Azawan’s hello means quoting that name:

> `zazawan d[azawan] vezebel.`
>
> z-Azawan | d-CITE[Azawan] | v-tell
>
> "Azawan said “Azawan.”" (hello)

The whole `d[azawan]` is the direct object (who or what is acted on). When the quote is a whole Agazan sentence, each word inside starts with its own role letter, as in any sentence.

### Exact, paraphrase, proper
<a id="when-required"></a>

You can mark how faithful the quote is. Put the mark **after** the role letter, before the opening bracket.

A span with no mark is **exact**: the words as they were said (`d[azawan]`). Write **`~`** for a **paraphrase**, when you mean the gist, not the exact words (`d~[zazawan vezehel]`). Write **`@`** for a **proper** span: it names a work with a title of several words, such as a song, proverb, or book (`d@[onodan alahen]`). The span then means the work itself, not its title as a string of words.

A work or person with a one-word name is an ordinary **-n** word (`donodan`), not `d@[onodan]`, unless a role letter or an ending is part of the title itself. The mark belongs to the brackets; the words inside keep their usual endings ([titled phrases](word-endings.md#titled-phrases)).

<!-- cheat-sheet: restrictors-spans -->
| Agazan | Use | English | Cue |
|--------|-----|---------|-----|
| *(none)* | exact | verbatim wording | bare brackets already quote; extra ink would hedge |
| **`~`** | paraphrase | the gist, not the exact words | **~** looks like “about / approximately” |
| **`@`** | proper | the work known by that title | **@** like a social media handle |

> `zalahen d~[zazawan vezehel] varadal.`
>
> z-Alahen | d-CITE.about[z-Azawan | v-sing] | v-write
>
> "Alahen wrote something like “Azawan sings.”"

> `zahaben d@[onodan alahen] vezehel.`
>
> z-Ahaben | d-NAME.CITE[Onodan | Alahen] | v-sing
>
> "Ahaben sang Onodan Alahen."

**`~`** and **`@`** combine, `~` first: the span still names the work, but the title is only roughly that. Use it when you remember a title loosely.

> `zahaben d~@[onodan alahen] vezehel.`
>
> z-Ahaben | d-NAME.CITE.about[Onodan | Alahen] | v-sing
>
> "Ahaben sang that song called something like Onodan Alahen."

### Opaque and loan words {#loans}

To use a word from another language, a bit of code, or any spelling that is not Agazan, write the role letter, then angle brackets around it. That span is **opaque**: the inside is taken exactly as spelled and is not read as Agazan words. Write no letter after the closing `>`. The faithfulness marks are the same as on a cite: none, **`~`**, or **`@`**.

> <code>zazawan d&lt;kimchi&gt; vahahal.</code>
>
> z-Azawan | d-OPAQUE["kimchi"] | v-see
>
> "Azawan saw kimchi." (a foreign word)

Inside <code>&lt;&gt;</code>, keep the source’s capital letters when its writing system has them (<code>d&lt;NaCl&gt;</code>, <code>d@&lt;iPhone&gt;</code>). Agazan letters outside the brackets are always [lowercase](phonology.md#beginner). Use **`@`** when the bracketed word is a name or title.

When the lexicon already has a matching root, write the ordinary word (`dagadul`), not a span.

On its own, outside a sentence, a foreign name or word is written with no role letter: just the marks and the brackets (<code>@&lt;Sam&gt;</code>), like other [citation forms](word-endings.md#citation-forms). In a sentence the span fills a role, so it takes a role letter (<code>z@&lt;Sam&gt;</code>).

### Calls and reactions (`/y/`) {#y-spans}

To call someone by a foreign name (*Sam!*) or react with a foreign word (*Amen!*), put a span under `/y/`. Only an opaque <code>&lt;…&gt;</code> or a cite `[…]` goes there, and it opens the turn, before the act word.

The **`@`** mark decides which, as **-n** does on a native word. With **`@`**, the span calls that person (<code>y@&lt;Sam&gt;</code>, *Sam!*); add **`~`** for a name you are not sure of (<code>y~@&lt;Sam&gt;</code>). Without **`@`**, the span is a foreign [interjection](speech-moves.md#interjections) (<code>y&lt;Amen&gt;</code>, *Amen!*), exact or given as the gist with **`~`** (<code>y~&lt;Amen&gt;</code>).

### Asides (`th(…)`)
<a id="asides"></a>

To add a side comment in parentheses, write **`th(`** … **`)`**. That span is an **aside**. The `th` makes it a [stance](clause.md#stance-th) word, so it may sit anywhere a stance word may sit. (cue: round parentheses, as in English)

The inside is ordinary Agazan: a fragment, or a clause with the **same speech act** as the outer sentence (both statements, both questions, or both commands). An aside comments on the sentence; it does not call anyone or react, so it never goes under `/y/`.

> `zazawan vowogal th(hagawal).`
>
> z-Azawan | v-walk | th-ASIDE[h-quiet]
>
> "Azawan walks (quietly)."

> `zazawan vowogal th(zalahen vezebal).`
>
> z-Azawan | v-walk | th-ASIDE[z-Alahen | v-sleep]
>
> "Azawan walks (Alahen sleeps)."

A one-word manner with nothing to package is a plain adverb: `zazawan vowogal hagawal.`

**For *because* / *if*, use:** [**`barl`**](dependents.md#poles) dependents, not an aside.

**Compare with:** a second name for the same person uses [identity](predication.md#identity) (`gugo` + `/b/`), not an aside.

### Outer slot {#pos}

A span can fill any role a word can, not only the object. The letter before the bracket is the role of the **whole span** in the outer sentence, so ask what that chunk does there: the object of *said*, the subject of *is small*, and so on. A cite can even be the **verb**, when you echo an act as wording:

> `yul zalahen v[vazadal].`
>
> y-prohibition | z-Alahen | v-CITE[v-stop]
>
> "Don’t say “stop,” Alahen."

<!-- cheat-sheet: restrictors-spans -->
| Agazan | Use | English | Cue |
|--------|-----|---------|-----|
| `/d/` | object | *said / wrote / saw “…”* (`d[azawan]`, <code>d&lt;kimchi&gt;</code>) | **d** ≈ done to |
| `/z/` | subject | a foreign name as the subject (<code>z@&lt;Sam&gt;</code>) | **z** ≈ star (who it is about) |
| `/b/` | extra party | a foreign name as the recipient (<code>b@&lt;Sam&gt;</code>) | **b** ≈ bolted on (the extra piece) |
| `/v/` | verb | echo the act as wording (`v[vazadal]`); a loan verb (<code>v&lt;google&gt;</code>) | **v** as in English *verb* |
| `/ɡ/` | adjective | a loan adjective (<code>g&lt;rouge&gt;</code>) | **g** ≈ grade (a rating of the noun) |
| `/h/` | adverb | a loan adverb (<code>h&lt;allegro&gt;</code>) | **h** starts *how* / *when* / *where* |
| `/th/` | stance | asides (`th(…)`) | **th** ≈ *think* (your side comment) |

Only an aside goes under `/th/`, and every other span fills a content slot: `/z/` `/d/` `/b/` `/v/` `/ɡ/` `/h/`. A degree word (`/w/`) is never a span.

To use a foreign verb, adjective, or adverb (*googled*, *rouge*), put an opaque span in that slot. That is a **loan word**: the role letter says how the foreign word is used, and the inside keeps its own spelling.

> <code>zalahen v&lt;google&gt; dazawan.</code>
>
> z-Alahen | v-OPAQUE["google"] | d-Azawan
>
> "Alahen googled Azawan." (loan verb)

> <code>zodogal g&lt;rouge&gt; vowogal.</code>
>
> [z-dog | g-OPAQUE["rouge"]] | v-walk
>
> "A rouge dog walks." (loan adjective)

> <code>zazawan b@&lt;Sam&gt; vezebel.</code>
>
> z-Azawan | b-NAME.OPAQUE["Sam"] | v-tell
>
> "Azawan tells Sam." (a foreign name as the recipient)

The letter before the bracket belongs to the whole span. Agazan words inside a cite start with **their own** role letters.

### Practice {#beginner-practice}

Short drills for Beginner. Try each item before opening **Show answer**.

**Setting:** a rehearsal

**New words:**

| English | Agazan | Cue |
|---------|--------|-----|
| *sing* | `vezehel` | 🧑‍🎤 |
| *stop* | `vazadal` | 🛑 |
| *quiet* | `agawal` | 🔈 |
| *Onodan* | `onodan` | 🎵 from *note*: a song's name |
| *Sam* | <code>@&lt;Sam&gt;</code> | a foreign name |
| *google* | <code>v&lt;google&gt;</code> | a loan verb |
| *Bravo* | <code>&lt;Bravo&gt;</code> | a foreign word |

**Review:**

| English | Agazan |
|---------|--------|
| *Azawan* | `azawan` |
| *Alahen* | `alahen` |
| *Ahaben* | `ahaben` |
| *tell* | `vezebel` |
| *write* | `varadal` |
| *walk* | `vowogal` |

#### English → Agazan {#beginner-english-to-agazan}

**1.** *Azawan said “Azawan.”* (hello)

::: details Show answer
`zazawan d[azawan] vezebel.`

z-Azawan | d-CITE[Azawan] | v-tell
:::

**2.** *Alahen wrote something like “Ahaben sings.”*

::: details Show answer
`zalahen d~[zahaben vezehel] varadal.`

z-Alahen | d-CITE.about[z-Ahaben | v-sing] | v-write
:::

**3.** *Alahen tells Sam.* (a foreign name as the recipient)

::: details Show answer
<code>zalahen b@&lt;Sam&gt; vezebel.</code>

z-Alahen | b-NAME.OPAQUE["Sam"] | v-tell
:::

**4.** *Don’t say “stop,” Azawan.*

::: details Show answer
`yul zazawan v[vazadal].`

y-prohibition | z-Azawan | v-CITE[v-stop]
:::

**5.** *Sam, does Azawan sing?*

::: details Show answer
<code>y@&lt;Sam&gt; yol zazawan vezehel.</code>

y-NAME.OPAQUE["Sam"] | y-question | z-Azawan | v-sing
:::

**6.** *Alahen walks (quietly).*

::: details Show answer
`zalahen vowogal th(hagawal).`

z-Alahen | v-walk | th-ASIDE[h-quiet]
:::

#### Agazan → English {#beginner-agazan-to-english}

**1.** `zalahen d@[onodan alahen] varadal.`

::: details Show answer
z-Alahen | d-NAME.CITE[Onodan | Alahen] | v-write

*Alahen wrote Onodan Alahen.* (the work)
:::

**2.** <code>zalahen v&lt;google&gt; donodan.</code>

::: details Show answer
z-Alahen | v-OPAQUE["google"] | d-Onodan

*Alahen googled Onodan.* (a loan verb)
:::

**3.** `zazawan vezehel th(zalahen vazadal).`

::: details Show answer
z-Azawan | v-sing | th-ASIDE[z-Alahen | v-stop]

*Azawan sings (Alahen stops).*
:::

**4.** <code>y&lt;Bravo&gt;.</code>

::: details Show answer
y-OPAQUE["Bravo"]

*Bravo!* (a foreign reaction)
:::

**5.** `zahaben d~@[onodan alahen] vezehel.`

::: details Show answer
z-Ahaben | d-NAME.CITE.about[Onodan | Alahen] | v-sing

*Ahaben sang the song called something like Onodan Alahen.*
:::

**6.** `zahaben d[vazadal] vezebel.`

::: details Show answer
z-Ahaben | d-CITE[v-stop] | v-tell

*Ahaben said “stop.”*
:::

#### Pick one {#beginner-pick-one}

**1.** *Ahaben sang Onodan Alahen.* (the song) `zahaben d@[onodan alahen] vezehel.` or `zahaben d[onodan alahen] vezehel.`

::: details Show answer
`zahaben d@[onodan alahen] vezehel.`

z-Ahaben | d-NAME.CITE[Onodan | Alahen] | v-sing

**`@`** makes the span the work itself; bare brackets quote the words.
:::

**2.** *Azawan said “Alahen stops.”* `zazawan d[zalahen vazadal] vezebel.` or `zazawan vezebel th(zalahen vazadal).`

::: details Show answer
`zazawan d[zalahen vazadal] vezebel.`

z-Azawan | d-CITE[z-Alahen | v-stop] | v-tell

What was said is the object, so it is a cite in `/d/`; an aside only comments on the sentence.
:::

#### Fix it {#beginner-fix-it}

**1.** *Alahen sang Onodan.* (a work with a one-word name) <!-- lint: error -->`zalahen d@[onodan] vezehel.`

::: details Show answer
`zalahen donodan vezehel.`

z-Alahen | d-Onodan | v-sing

A one-word name is an ordinary **-n** word; **`@[…]`** is for titles of several words.
:::

## Intermediate {#intermediate}

### Written only {#written-only}

A span has **no spoken form**: there is no word for its open or close, and no spoken resume for it. When you read a span aloud, you say the words inside it, and say its marks as words.

Apart from what is inside, `[…]` and <code>&lt;…&gt;</code> work the same way: the same role letters, the same slots, the same **`~`** / **`@`** marks, the same topic and `/y/` rules. The one difference is whether the inside is read as Agazan. Use `[…]` when the inside is Agazan, and <code>&lt;…&gt;</code> when it is foreign, code, or a name you do not want read as Agazan.

### Mention {#mention}

To talk about a word or phrase itself, as a spelling (*the word “odoga” is small*), put the **mention marker** before a span. That is a **mention**: it is about the letters, not what they mean, and not a quote of what someone said (for that, use a [cite](#writing)). The marker is a [left-bound adjective](clause.md#left-bound-adjectives), so a listener hears *this is a word as spelling* before the span arrives. In English, write *the word …* or *the phrase …* and keep the Agazan spelling (`odoga`, not *dog*).

The marker is the *letters* root `ele` as a `gl-` adjective, on **-l** (`glelel`) or **-n** (`glelen`). (cue: 🔤 a word is its letters)

| Agazan | Reading |
|--------|---------|
| **`glelel`** | the word or phrase as spelling |
| **`glelen`** | the name-string: a name as spelling |

The span itself is an ordinary [opaque](#loans) <code>&lt;…&gt;</code> (or a cite `[…]`), so the marker plus the span fills a slot like any noun:

> <code>glelel z&lt;odoga&gt; gamazam.</code>
>
> [gl-MENTION | z-OPAQUE["odoga"]] | g-small
>
> "The word “odoga” is small."

> <code>glelel z&lt;zazawan vezehel&gt; gamazam.</code>
>
> [gl-MENTION | z-OPAQUE["zazawan vezehel"]] | g-small
>
> "The phrase “zazawan vezehel” is small."

With **-n**, the mention is a **name** as spelling (the title, which could be changed), even when it is **one word**: <code>glelen d&lt;onodan&gt;</code> is not `donodan`. A cite with **`@`** is the **work**, and that span is for a title of **several words** (`d@[onodan alahen]`). The one-word *Onodan* as the work is an ordinary **-n** word (`donodan`).

> `zazawan d@[onodan alahen] vogozam.`
>
> z-Azawan | d-NAME.CITE[Onodan | Alahen] | v-rejection
>
> "Azawan dislikes Onodan Alahen." (the work)

> <code>zazawan glelen d&lt;onodan&gt; vogozam.</code>
>
> z-Azawan | gl-NAME.MENTION | d-OPAQUE["onodan"] | v-rejection
>
> "Azawan dislikes the name “onodan.”" (might still like the work)

**Compare with:** `donodan` is *Onodan* (the work or person). <code>glelen d&lt;onodan&gt;</code> is only the **name**.

The marker is read as a marker only when it stands **directly before a span**. Anywhere else the same spelling is the ordinary adjective *lettered*. A mention marker does not go under `/y/`: a call or a reaction is not about a spelling. A `/w/` word is never a marker either, because `/w/` grades a `/ɡ/`, `/h/`, or `/th/` word, never a noun.

A marker before a [topic span](#topic-quotes) works the same way:

> <code>glelel x&lt;odoga&gt; zozan gamazam.</code>
>
> [gl-MENTION | x-OPAQUE["odoga"]] | z-TOPIC | g-small
>
> "Now, about the word “odoga”: it is small."

### A span is an ordinary noun {#span-noun}

A span fills a role like any noun, so a [role pointer](pronouns.md#role-pointers) for that role can point back to it. After a cite, `duxar` is *that quote*: the latest thing done to.

> `zalahen d[azawan] vezebel. zahaben duxar vahahal.`
>
> z-Alahen | d-CITE[Azawan] | v-tell . z-Ahaben | d-←patient.same | v-see
>
> "Alahen said “Azawan.” Ahaben saw that."

The same holds for a loan word or any other span, and `duxal` is [another one](pronouns.md#a-new-one) of what the span holds.

An aside gives role pointers nothing to point back to. A [tag](pronouns.md#tag-pronouns) assigned inside a cite or an aside does not hold outside it, and a pointer outside never reaches a word inside one.

A span in a `/v/` slot (`v[vazadal]`) has no resume pronoun.

### One of a title (`^@`) {#one-of-a-title}

A span with **`@`** names the work or product itself: <code>d@&lt;iPhone&gt;</code> is the iPhone as a product. For one thing that name applies to (one phone, one copy of a book, one performance of a song), write **`^@`** in the mark slot instead. It is the span's form of the [**-ln**](word-endings.md#name-instance--ln) ending, and like **-ln** it brings a new thing into the conversation. (cue: **^** points up to the name the thing falls under)

> <code>zalahen d^@&lt;iPhone&gt; vahahal.</code>
>
> z-Alahen | d-NAME.OPAQUE.instance["iPhone"] | v-see
>
> "Alahen sees an iPhone." (one phone)

| Agazan | Use | English |
|--------|-----|---------|
| <code>d@&lt;iPhone&gt;</code> | the named product | *the iPhone* |
| <code>d^@&lt;iPhone&gt;</code> | one unit of it | *an iPhone* |
| `d@[onodan alahen]` | the named work | *Onodan Alahen* |
| `d^@[onodan alahen]` | one copy or performance of it | *a copy of Onodan Alahen* |
| `d~^@[onodan alahen]` | one copy of a work titled roughly that | *a copy of something like Onodan Alahen* |

### Act words in a quote {#quote-acts}

A quoted question or command keeps its own [act word](speech-moves.md#speech-act-statement-question-command) inside the cite, the same way it keeps a tone mark. The outer sentence is still your claim (*said*), and `yol` or `yel` belongs to the quoted talk.

> `zazawan d[yol zalahen vowogal] vezebel.`
>
> z-Azawan | d-CITE[y-question | z-Alahen | v-walk] | v-tell
>
> "Azawan said, “Does Alahen walk?”"

### Topics in a quote {#topic-quotes}

A cite holds someone else's words, so a [topic](pronouns.md#topic) never carries into it or out of it. The inside of a cite starts with no topic, no [tags](pronouns.md#tag-pronouns), and its own targets for [role pointers](pronouns.md#role-pointers), and may open with a topic word of its own. When the cite ends, your own topic and tags are as they were.

A cite or opaque span can also be a topic word itself, under `/x/`: a titled work, a word as spelling (with the mention marker before it), or a foreign name.

> `x@[onodan alahen] dozan vezehel.`
>
> x-NAME.CITE[Onodan | Alahen] | d-TOPIC | v-sing
>
> "Now, about Onodan Alahen: it is sung."

> <code>x@&lt;Sam&gt; zozan vowogal.</code>
>
> x-NAME.OPAQUE["Sam"] | z-TOPIC | v-walk
>
> "Now, about Sam: Sam walks."

| Span | Topic at the start | Topic words inside | Leaks out? |
|------|--------------------|--------------------|------------|
| Cite | none | allowed; the cite's own `/x/` word sets its topic | no |
| Aside | yours | not allowed | n/a |

A **-r** inside a cite cannot find a word outside it: the quoted words were said before the surrounding sentence existed.

### Scope islands {#scope-islands}

Sometimes a word like *possibly*, or a join, should apply to only part of the sentence, a chunk of several words, not the whole clause. Put that chunk in braces **`{ … }`**, with the word that applies to it **inside**. That word is the island’s **binder**: it reaches only what the braces hold. Braces have no other use. Speech has no word for the edges: you hear a pause, then one tight phrase.

> `zazawan { hegewem zodogal geredal } vahahal.`
>
> z-Azawan | SCOPE[h-possibility | [z-dog | g-red]] | v-see
>
> "Azawan saw, as a possibility, the red dog." (*possibility* targets that chunk).

A [tone mark](speech-moves.md#tone-marks) written right before the opening brace colors the whole island (`!{ hegewem zodogal geredal }`).

**Compare with:** quoting, asides, mentions, and opaque blobs use [spans](#writing) (`d[…]`, `th(…)`, <code>d&lt;…&gt;</code>). Islands only group so a binder inside can target that chunk.

- No role letter on the edges.
- **At most one phrase.** After its binder, an island holds at most one phrase: a `/z/`, `/d/`, or `/b/` noun phrase, a `/v/` verb phrase, or a `/ɡ/` stack, with that phrase’s own adjectives, `/w/` detail, and join. An `/h/` word is a binder, never the phrase.
- **It may close early.** The island can stop partway through its phrase; the pause marks where. By the end of the phrase at the latest, it has closed: a new role letter or the outer join always comes after the island.
- **Hosts keep their `/b/`.** A host (`/ɡ/`, `/h/`, `/th/`) and its hosted `/b/` are both inside the island or both outside.
- **One island per clause.** Islands do not nest.
- Empty `{ }` has no reading.
- **Binder required:** at least one scope-taking `/h/` or `/th/` and/or a [join](joins.md#scope-islands-join) particle **inside**. A [hook](hooks.md) is never a binder. A hook already reaches its whole stretch: `/w/` right before it grades the [whole span](hooks.md#spans), and a hook after a noun belongs to that noun.
- Prefer spaces inside: `{ hegewem zodogal geredal }`.

| Binder | Use inside the island |
|--------|------------------------|
| Scope-taking **`/h/`** or **`/th/`** | frames that **chunk** (prefer first in the island; see the `/b/` exception below) |
| Prefixed **join** | joins **only** matching-role material **inside** ([scope islands](joins.md#scope-islands-join)) |

`/h/` and a join may share one island (`{ hegewem zazawan zalahen zam }`).

| Placement | Reading |
|-----------|---------|
| `/h/` or `/th/` **inside** | frames that chunk |
| `/h/` or `/th/` **outside** | ordinary floating word: frames the verb / clause |
| Join **inside** | joins only interior conjuncts |
| Join **outside** with island nearby | ordinary lookback (edges do not filter an outside join) |

> `zazawan { zalahen zal } zam vahahal.`
>
> [z-Azawan | SCOPE[z-Alahen | z-and] | z-and.open] | v-see
>
> "Azawan and (just Alahen) saw …."

A `/b/` right after an `/h/` word is hosted by it ([extra nouns](clause.md#extra-nouns)). To put a recipient `/b/` in an island, write it **before** the binder:

> `zazawan { balahen hegewem } vezebel.`
>
> z-Azawan | SCOPE[b-Alahen | h-possibility] | v-tell
>
> "Azawan tells, possibly, Alahen."

The word before the island must not be a `/ɡ/`, `/h/`, or `/th/` word either, or it would host that `/b/` across the edge.

An island can hold part of a phrase. Here only *not small* is grouped, so **`gul`** denies *small* alone and **`gal`** adds it to *red*:

> `zodogal geredal { gamazam gul } gal vowogal.`
>
> [z-dog | [g-red | SCOPE[g-small | g-not] | g-and]] | v-walk
>
> "A dog that is red and not small walks."

**Speech:** reset your pitch briefly as the island starts, say it as one tight phrase, and pause after its last stressed syllable. In singing, shape it like any other phrase. Because an island never runs past one phrase, a listener who misses the closing pause is off by at most part of that phrase.

### Practice {#intermediate-practice}
<a id="translation-practice-intermediate"></a>

Short drills for Intermediate. Try each item before opening **Show answer**.

**Setting:** a courtroom

**New words:**

| English | Agazan | Cue |
|---------|--------|-----|
| *rejection* | `vogozam` | ❌ from *cross* |
| *possibility* | `hegewem` | ❓ from *question mark* |
| *letters* | `glelel` | 🔤: a word is its letters |

**Review:**

| English | Agazan |
|---------|--------|
| *Azawan* | `azawan` |
| *Alahen* | `alahen` |
| *Ahaben* | `ahaben` |
| *topic* | `ozan` |
| *Onodan* | `onodan` |
| *attest* | `vodol` |
| *lie* | `valahal` |
| *small* | `gamazam` |
| *tell* | `vezebel` |
| *see* | `vahahal` |
| *punch* | `vabahel` |
| *walk* | `vowogal` |

#### English → Agazan {#intermediate-english-to-agazan}

**1.** *Alahen said “Azawan attests.”*

::: details Show answer
`zalahen d[zazawan vodol] vezebel.`

z-Alahen | d-CITE[z-Azawan | v-attest] | v-tell
:::

**2.** *Alahen said “Azawan.” Ahaben saw that.* (a pointer to the quote)

::: details Show answer
`zalahen d[azawan] vezebel. zahaben duxar vahahal.`

z-Alahen | d-CITE[Azawan] | v-tell . z-Ahaben | d-←patient.same | v-see
:::

**3.** *The word “onoda” is small.*

::: details Show answer
<code>glelel z&lt;onoda&gt; gamazam.</code>

[gl-MENTION | z-OPAQUE["onoda"]] | g-small
:::

**4.** *Azawan said, “Does Alahen lie?”*

::: details Show answer
`zazawan d[yol zalahen valahal] vezebel.`

z-Azawan | d-CITE[y-question | z-Alahen | v-lie] | v-tell
:::

**5.** *Ahaben sees a copy of Onodan Alahen.*

::: details Show answer
`zahaben d^@[onodan alahen] vahahal.`

z-Ahaben | d-NAME.CITE.instance[Onodan | Alahen] | v-see
:::

**6.** *Alahen tells, possibly, Ahaben.*

::: details Show answer
`zalahen { bahaben hegewem } vezebel.`

z-Alahen | SCOPE[b-Ahaben | h-possibility] | v-tell
:::

#### Agazan → English {#intermediate-agazan-to-english}

**1.** <code>zazawan glelen d&lt;onodan&gt; vogozam.</code>

::: details Show answer
z-Azawan | gl-NAME.MENTION | d-OPAQUE["onodan"] | v-rejection

*Azawan dislikes the name “onodan.”* (not the work)
:::

**2.** `x@[onodan alahen] zalahen dozan vogozam.`

::: details Show answer
x-NAME.CITE[Onodan | Alahen] | z-Alahen | d-TOPIC | v-rejection

*Now, about Onodan Alahen: Alahen dislikes it.*
:::

**3.** `zahaben d~[zazawan vodol] vezebel.`

::: details Show answer
z-Ahaben | d-CITE.about[z-Azawan | v-attest] | v-tell

*Ahaben said something like “Azawan attests.”*
:::

**4.** `zalahen { zazawan zal } zam vabahel.`

::: details Show answer
[z-Alahen | SCOPE[z-Azawan | z-and] | z-and.open] | v-punch

*Alahen and (just Azawan) punched.*
:::

**5.** `zazawan vowogal th(zalahen valahal).`

::: details Show answer
z-Azawan | v-walk | th-ASIDE[z-Alahen | v-lie]

*Azawan walks (Alahen lies).*
:::

**6.** `zahaben !{ hegewem dalahal } vahahal.`

::: details Show answer
z-Ahaben | !SCOPE[h-possibility | d-lie] | v-see

*Ahaben saw, as a possibility, the lie!*
:::

#### Pick one {#intermediate-pick-one}

**1.** *Azawan dislikes Onodan Alahen* (the work). `zazawan d@[onodan alahen] vogozam.` or `zazawan d[onodan alahen] vogozam.`

::: details Show answer
`zazawan d@[onodan alahen] vogozam.`

z-Azawan | d-NAME.CITE[Onodan | Alahen] | v-rejection

**`@`** makes the span the work; bare brackets quote the words.
:::

**2.** *Azawan saw, as a possibility, the lie.* (only the lie is a possibility) `zazawan { hegewem dalahal } vahahal.` or `zazawan hegewem dalahal vahahal.`

::: details Show answer
`zazawan { hegewem dalahal } vahahal.`

z-Azawan | SCOPE[h-possibility | d-lie] | v-see

Inside braces, **`hegewem`** reaches only that chunk; outside, it frames the whole seeing.
:::

#### Fix it {#intermediate-fix-it}

**1.** *Azawan said, “Does Alahen walk?”* <!-- lint: error -->`yol zazawan d[zalahen vowogal] vezebel.`

::: details Show answer
`zazawan d[yol zalahen vowogal] vezebel.`

z-Azawan | d-CITE[y-question | z-Alahen | v-walk] | v-tell

The quoted question keeps its act word inside the cite; **`yol`** outside asks whether Azawan said it.
:::

## Advanced {#advanced}

### Editorial close and close-all {#close-forms-complete-editorial-close-all}

A closing bracket normally ends one span, with its wording complete. Two written marks, placed just **inside** the closing bracket, change that. **`#`** keeps the wording as written but shows that it is cut off, trails off, or is faulty (*Azawan said “bug…”*). **`|`** closes every span still open around it at once.

> `zazawan d[abogam#] vezebel.`
>
> z-Azawan | d-CITE[flaw]# | v-tell
>
> "Azawan said “bug…”" (trailing off)

| Writing | Use | English | Cue |
|---------|-----|---------|-----|
| `d[…]` | close **one** span, whole | the matching closer | the bracket closes it |
| `d[…#]` | **editorial**: wording kept as written, cut off or defective | trailing off | **#** a note on the text |
| `d[…|]` | close **all** open spans | sweep everything | **\|** one bar through every bracket |
| `d[…#|]` | editorial, then close all | | write `#` first, then `\|` |

An editorial span still counts as quoted: a role pointer can reach it as it reaches any cite.

### Nesting {#nesting}

When one packaged chunk sits inside another (a quote that contains a parenthetical, or a cite wrapping an opaque blob), the spans nest, and each one closes with its own bracket.

> `zazawan d[ th(hagawal) azawan ] vezebel.`
>
> z-Azawan | d-CITE[th-ASIDE[h-quiet] | Azawan] | v-tell
>
> "Azawan said “Azawan” (quietly)." (hello)

The same nest works as <code>d[ z&lt;…&gt; ]</code> or <code>d~[ d&lt;…&gt; ]</code>.

### Practice {#advanced-practice}
<a id="translation-practice-advanced"></a>

Short drills for Advanced. Try each item before opening **Show answer**.

**Setting:** a code review

**New words:**

| English | Agazan | Cue |
|---------|--------|-----|
| *flaw* | `abogam` | 🐛 from *bug* |

**Review:**

| English | Agazan |
|---------|--------|
| *Azawan* | `azawan` |
| *Alahen* | `alahen` |
| *Ahaben* | `ahaben` |
| *page* | `abehel` |
| *tell* | `vezebel` |
| *write* | `varadal` |
| *see* | `vahahal` |

#### English → Agazan {#advanced-english-to-agazan}

**1.** *Alahen said “flaw…”* (the quote trails off)

::: details Show answer
`zalahen d[abogam#] vezebel.`

z-Alahen | d-CITE[flaw]# | v-tell
:::

**2.** *Azawan wrote “flaw” (quietly).* (the aside is inside the quote)

::: details Show answer
`zazawan d[ th(hagawal) abogam ] varadal.`

z-Azawan | d-CITE[th-ASIDE[h-quiet] | flaw] | v-write
:::

**3.** *Ahaben said “flaw…”, closing every open span.*

::: details Show answer
`zahaben d[abogam#|] vezebel.`

z-Ahaben | d-CITE[flaw]#| | v-tell
:::

**4.** *Azawan sees “flaw…” on the page.*

::: details Show answer
`zazawan d[abogam#] vahahal aol babehel.`

z-Azawan | d-CITE[flaw]# | v-see | [on | b-page]
:::

#### Agazan → English {#advanced-agazan-to-english}

**1.** `zahaben d[abogam] varadal.`

::: details Show answer
z-Ahaben | d-CITE[flaw] | v-write

*Ahaben wrote “flaw.”*
:::

**2.** `zalahen d[ th(hagawal) zazawan varadal ] vezebel.`

::: details Show answer
z-Alahen | d-CITE[th-ASIDE[h-quiet] | z-Azawan | v-write] | v-tell

*Alahen said, “(quietly) Azawan writes.”*
:::

**3.** `zazawan d[zalahen varadal#] vezebel.`

::: details Show answer
z-Azawan | d-CITE[z-Alahen | v-write]# | v-tell

*Azawan said “Alahen writes…”* (trailing off)
:::

**4.** `zalahen d[abogam#] vezebel. zahaben duxar varadal.`

::: details Show answer
z-Alahen | d-CITE[flaw]# | v-tell . z-Ahaben | d-←patient.same | v-write

*Alahen said “flaw…”. Ahaben wrote that down.*
:::

#### Pick one {#advanced-pick-one}

**1.** *Ahaben said “flaw…”* (the quote trails off) `zahaben d[abogam#] vezebel.` or `zahaben d[abogam] vezebel.`

::: details Show answer
`zahaben d[abogam#] vezebel.`

z-Ahaben | d-CITE[flaw]# | v-tell

**`#`** inside the closer keeps the wording but marks it cut off; a plain closer says it is complete.
:::

#### What changes {#advanced-what-changes}

**1.** `zazawan d[abogam#] vezebel.` / `zazawan d[abogam#|] vezebel.`

::: details Show answer
z-Azawan | d-CITE[flaw]# | v-tell

z-Azawan | d-CITE[flaw]#| | v-tell

Both quotes trail off; with **`|`**, the closer also shuts every span still open.
:::

## See also

- Scope islands: [joins.md](joins.md#scope-islands-join)
- Identity vs parenthetical comment: [predication.md](predication.md#identity)
- Phrasal proper names: [word-endings.md](word-endings.md#phrasal-proper-names)
- Titled phrases (hook / join / span): [word-endings.md](word-endings.md#titled-phrases)
- Prefix-less citation outside a clause: [word-endings.md](word-endings.md#citation-forms)
