# Spans

When you set wording apart from the rest of the sentence (a quote, a parenthetical, a loan surface), Agazan packages that chunk in a **span**. You write a role letter, then a pair of brackets around the interior. That first letter is the chunk’s role in the outer sentence (subject, object, verb, or adverb). A span is a written form: it has no spoken open or close.

## Beginner {#beginner}

Start with a quote of what someone said.

### Cite (`[…]`) {#writing}
<a id="writing-vs-speech"></a>

A **cite** holds wording you are quoting: what someone said, a title string, or a proverb **as wording**. Write the role letter, then square brackets around the quoted text. (cue: `[…]` like quote marks)

Start with one quoted token as the object of *said*. A [greeting](word-endings.md#greeting) is the named citation, so the quoted hello is that same name:

> `zazawan d[azawan] vezebel.`
>
> z-Azawan | d-CITE[Azawan] | v-tell
>
> "Azawan said “Azawan.”" (hello)

The whole `d[azawan]` is the direct object (who or what is acted on). If the interior is Agazan words in a clause, those inner words still start with their own role letters.

### Exact, paraphrase, proper
<a id="when-required"></a>

You can mark how faithful the quote is. Put the mark **after** the role letter, before the opening bracket.

Verbatim wording is **exact**: no extra mark (`d[azawan]`). When you mean the gist, not the exact words, write **`~`** (`d~[zazawan vezehel]`). When the chunk is the **work** that bears a **multi-word** title (the song, proverb, book — not the name-string), write **`@`** (`d@[onodan alahen]`). A one-word work or person is ordinary **-n** (`donodan`), not `d@[onodan]`, unless the role letter or the ending is **part of the title** you are packaging. The mark is on the **fence**; words inside keep their usual endings ([titled phrases](word-endings.md#titled-phrases)).

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

**Opaque** holds a foreign, code, or raw surface that is not ordinary Agazan words. Write the role letter, then angle brackets around that blob. Do not put an extra letter after `>`. Faithfulness uses the same marks as cite: none / **`~`** / **`@`**.

> <code>zazawan d&lt;kimchi&gt; vahahal.</code>
>
> z-Azawan | d-OPAQUE["kimchi"] | v-see
>
> "Azawan saw kimchi." (opaque surface)

Keep the source’s **casing** inside <code>&lt;&gt;</code> when that writing system uses case (<code>d&lt;NaCl&gt;</code>, <code>d@&lt;iPhone&gt;</code>). Native Agazan letters stay [lowercase](phonology.md#beginner). **`@`** is the proper mark when that blob is a titled name.

When a published Agazan root already matches, write the ordinary word (`dagadul`, not a fence).

A span is an ordinary noun for a [role pointer](pronouns.md#role-pointers): `duxar` is that span again, and `duxal` is [another one](pronouns.md#a-new-one) of what the span holds.

Outside a clause, a foreign name or word is a prefix-less fence with the same marks: [citation forms](word-endings.md#citation-forms) (<code>@&lt;Sam&gt;</code>). A span in a sentence still takes a role letter, because it fills a sentence slot (<code>z@&lt;Sam&gt;</code>).

### Calls and reactions (`/y/`) {#y-spans}

Under `/y/`, a span calls someone or reacts, so only an opaque <code>&lt;…&gt;</code> or a cite `[…]` goes there, and it opens the turn, before the act word. The **`@`** mark decides the job, as **-n** does on a native word: a named span calls that person (<code>y@&lt;Sam&gt;</code>, *Sam!*; with **`~`**, <code>y~@&lt;Sam&gt;</code>, by a name you are not sure of), and a span without **`@`** is a foreign [interjection](speech-moves.md#interjections) (<code>y&lt;Amen&gt;</code>, *Amen!*), exact or given as the gist with **`~`** (<code>y~&lt;Amen&gt;</code>). A mention talks about a word and an aside `(…)` comments on the sentence, so neither one calls or reacts: there is no `/y/` mention or aside.

### Asides (`th(…)`)
<a id="asides"></a>

An **aside** is a parenthetical comment. Package it as a [stance](clause.md#stance-th) word: write **`th(`** … **`)`**. Round parentheses mark the side comment. The fence may sit anywhere a stance word may sit.

The interior is ordinary Agazan: a fragment, or a clause body that keeps the **same speech act** as the outer sentence (the same statement, question, or command).

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

**For *because* / *if*, use:** [**`barl`**](dependents.md#dependent-clauses) dependents, not an aside.

**Compare with:** a second name for the same person uses [identity](predication.md#identity) (`gugo` + `/b/`), not an aside.

### Outer slot {#pos}

The letter before the bracket is the role of the **entire span** in the outer sentence. Ask what that chunk is doing out there: object of *said*, subject of *is small*, and so on. A cite can be the **verb** when you echo the act as wording:

> `yul zalahen v[vazadal].`
>
> y-prohibition | z-Alahen | v-CITE[v-stop]
>
> "Don’t say “stop,” Alahen."

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

An opaque span in a verb, adjective or adverb slot is a **loan word**: the role letter says what part of speech the foreign word plays, and the blob keeps its own spelling.

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

If the interior is Agazan words, those inner words still start with **their** role letters.

### Translation practice {#beginner-translation-practice}

Short drills for Beginner. Try each item before opening **Show answer**.

**Setting:** a rehearsal

**Roots used here:**

| English | Agazan | Same root as | Cue |
|---------|--------|--------------|-----|
| *Azawan* | `azawan` | | |
| *Alahen* | `alahen` | | |
| *Ahaben* | `ahaben` | | |
| *tell* | `vezebel` | | |
| *write* | `varadal` | | |
| *see* | `vahahal` | | |
| *sing* | `vezehel` | | |
| *walk* | `vowogal` | | |
| *stop* | `vazadal` | | |
| *Onodan* | `onodan` | | |
| *dog* | `odogal` | | |
| *quiet* | `agawal` | | |
| *kimchi* | <code>d&lt;kimchi&gt;</code> | | |
| *Sam* | <code>@&lt;Sam&gt;</code> | | |
| *google* (verb) | <code>v&lt;google&gt;</code> | | |

#### English → Agazan {#beginner-english-to-agazan}

**1.** *Azawan said “Azawan.”* (hello)

::: details Show answer
`zazawan d[azawan] vezebel.`

z-Azawan | d-CITE[Azawan] | v-tell
:::

**2.** *Alahen wrote something like “Azawan sings.”*

::: details Show answer
`zalahen d~[zazawan vezehel] varadal.`

z-Alahen | d-CITE.about[z-Azawan | v-sing] | v-write
:::

**3.** *Azawan sang Onodan Alahen.* (the work, a multi-word title)

::: details Show answer
`zazawan d@[onodan alahen] vezehel.`

z-Azawan | d-NAME.CITE[Onodan | Alahen] | v-sing
:::

**4.** *Azawan saw kimchi.* (foreign surface)

::: details Show answer
<code>zazawan d&lt;kimchi&gt; vahahal.</code>

z-Azawan | d-OPAQUE["kimchi"] | v-see
:::

**5.** *Ahaben sang Onodan.* (one-word work: ordinary **-n**)

::: details Show answer
`zahaben donodan vezehel.`

z-Ahaben | d-Onodan | v-sing
:::

**6.** *Azawan sings (quietly).*

::: details Show answer
`zazawan vezehel th(hagawal).`

z-Azawan | v-sing | th-ASIDE[h-quiet]
:::

**7.** *Don’t say “stop,” Alahen.*

::: details Show answer
`yul zalahen v[vazadal].`

y-prohibition | z-Alahen | v-CITE[v-stop]
:::

**8.** *Sam, does Azawan walk?*

::: details Show answer
<code>y@&lt;Sam&gt; yol zazawan vowogal.</code>

y-NAME.OPAQUE["Sam"] | y-question | z-Azawan | v-walk
:::

**9.** *Azawan tells Sam.* (a foreign name as the recipient)

::: details Show answer
<code>zazawan b@&lt;Sam&gt; vezebel.</code>

z-Azawan | b-NAME.OPAQUE["Sam"] | v-tell
:::

**10.** *Alahen googled Azawan.* (a loan verb)

::: details Show answer
<code>zalahen v&lt;google&gt; dazawan.</code>

z-Alahen | v-OPAQUE["google"] | d-Azawan
:::

#### Agazan → English {#beginner-agazan-to-english}

**1.** <code>zalahen d&lt;kimchi&gt; vahahal.</code>

::: details Show answer

z-Alahen | d-OPAQUE["kimchi"] | v-see

*Alahen saw kimchi.* (opaque surface)
:::

**2.** `zahaben d~[zalahen vezehel] varadal.`

::: details Show answer

z-Ahaben | d-CITE.about[z-Alahen | v-sing] | v-write

*Ahaben wrote something like “Alahen sings.”*
:::

**3.** `zahaben d@[onodan alahen] varadal.`

::: details Show answer

z-Ahaben | d-NAME.CITE[Onodan | Alahen] | v-write

*Ahaben wrote Onodan Alahen.* (the work)
:::

**4.** `zalahen vezebel th(zazawan vezehel).`

::: details Show answer

z-Alahen | v-tell | th-ASIDE[z-Azawan | v-sing]

*Alahen tells (Azawan sings).*
:::

**5.** <code>z@&lt;Sam&gt; d[azawan] vezebel.</code>

::: details Show answer

z-NAME.OPAQUE["Sam"] | d-CITE[Azawan] | v-tell

*Sam said “Azawan.”* (hello)
:::

**6.** <code>@&lt;Sam&gt;</code>

::: details Show answer
*Sam*
:::

**7.** `yol zahaben d[azawan] vezebel.`

::: details Show answer

y-question | z-Ahaben | d-CITE[Azawan] | v-tell

*Did Ahaben say “Azawan”?*
:::

**8.** <code>zodogal g&lt;rouge&gt; vowogal.</code>

::: details Show answer

[z-dog | g-OPAQUE["rouge"]] | v-walk

*A rouge dog walks.* (a loan adjective)
:::

**9.** <code>y@&lt;Sam&gt; yel zazawan vowogal.</code>

::: details Show answer

y-NAME.OPAQUE["Sam"] | y-command | z-Azawan | v-walk

*Sam, let Azawan walk.*
:::

**10.** <code>zazawan b@&lt;Sam&gt; vezebel.</code>

::: details Show answer

z-Azawan | b-NAME.OPAQUE["Sam"] | v-tell

*Azawan tells Sam.*
:::

## Intermediate {#intermediate}

### Written only {#written-only}

A span has **no spoken form**: there is no open word, no close word, and no spoken resume for it. Read aloud, you say the words inside the span and the marks as words.

`[…]` and <code>&lt;…&gt;</code> are **one span** in every other way: the same role letters, the same slots, the same **`~`** / **`@`** marks, the same topic and `/y/` rules. The only difference is whether the parser reads the inside. Use `[…]` when the inside is Agazan, and <code>&lt;…&gt;</code> when it is foreign, code, or a name you do not want read. A mention marker (`glelel`) goes before either one.

### Mention {#mention}

A **mention** talks about a **word or phrase as that spelling**, not a quote of speech. Put the **mention marker** before the span. The marker is a [left-bound adjective](clause.md#left-bound-adjectives), so a listener hears *this is a word as spelling* before the whole span arrives. English says *the word …* or *the phrase …* and keeps the Agazan interior (`odoga`, not *dog*). To quote what someone said, use [cite](#writing).

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

With **-n** the mention is the **name** (the title-string you could rename), even as **one word**: <code>glelen d&lt;onodan&gt;</code> is not `donodan`. A cite with **`@`** is the **work**; that span is for a **multi-word** title (`d@[onodan alahen]`). One-word *Onodan* as the work is ordinary **-n** (`donodan`).

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

The marker is read only when it stands **directly before a span**. Anywhere else the same spelling is the ordinary adjective *lettered*. A mention marker does not go under `/y/` (a call or a reaction is not about a spelling), and `/w/` grades a `/ɡ/`, `/h/` or `/th/` word, never a noun, so it is not a marker either.

A marker before a [topic span](#topic-quotes) works the same way:

> <code>glelel x&lt;odoga&gt; zozan gamazam.</code>
>
> [gl-MENTION | x-OPAQUE["odoga"]] | z-TOPIC | g-small
>
> "Now, about the word “odoga”: it is small."

### A span is an ordinary noun {#span-noun}

A span fills a role slot and anchors [role pointers](pronouns.md#role-pointers) for that role like any noun. After a cite, `duxar` is *that quote*: the latest thing done to.

> `zalahen d[azawan] vezebel. zahaben duxar vahahal.`
>
> z-Alahen | d-CITE[Azawan] | v-tell . z-Ahaben | d-←patient.same | v-see
>
> "Alahen said “Azawan.” Ahaben saw that."

An aside adds no anchors. Names inside a cite or an aside never count toward an [ordinal](pronouns.md#ordinal-pronouns) outside it, and a pointer never reaches into one.

A span in a `/v/` slot (`v[vazadal]`) has no resume pronoun, and this page deliberately defines none.

### One of a title (`^@`) {#one-of-a-title}

A span with **`@`** names the work or product itself: <code>d@&lt;iPhone&gt;</code> is the iPhone as a product. For one thing that name applies to (one phone, one copy of a book, one performance of a song), write **`^@`** in the mark slot instead. It is the span's form of the [**-ln**](word-endings.md#name-instance--ln) ending, and like **-ln** it brings a new thing into the talk. (cue: **^** points up to the name the thing falls under)

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

A cite is someone else's talk, so a [topic](pronouns.md#topic) never carries into it or out of it. The inside of a cite starts with no topic, counts [ordinals](pronouns.md#ordinal-pronouns) and anchors [role pointers](pronouns.md#role-pointers) from scratch, and may open with a topic word of its own. Your own topic and count are untouched when the cite ends. A cite or opaque span under `/x/` is a topic word: a titled work, a word as spelling (with the mention marker before it), or a foreign name.

> `x@[onodan alahen] zozan vezehel.`
>
> x-NAME.CITE[Onodan | Alahen] | z-TOPIC | v-sing
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

Sometimes *possibility* or a join should apply only to a multi-word chunk, not the whole clause. Braces **`{ … }`** mark that chunk. They are the only use of braces. Speech has no open or close word for those edges: you hear a pause and one tight phrase. The binder **inside** does the work.

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
| Prefixed **join** | joins **only** matching-role material **inside** — [scope islands](joins.md#scope-islands-join) |

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

**Speech:** brief reset into the island, one tight phrase, boundary on the last island stress. In singing, use an ordinary phrase bow. Because an island never runs past one phrase, a listener who misses the closing pause is off by at most part of that phrase.

### Translation practice {#intermediate-translation-practice}
<a id="translation-practice-intermediate"></a>

Short drills for Intermediate. Try each item before opening **Show answer**.

**Setting:** a courtroom

**Roots used here:**

| English | Agazan |
|---------|--------|
| *Azawan* | `azawan` |
| *Alahen* | `alahen` |
| *Ahaben* | `ahaben` |
| *tell* | `vezebel` |
| *see* | `vahahal` |
| *attest* | `vodol` |
| *lie* (verb) | `valahal` |
| *lie* (noun) | `alahal` |
| *punch* | `vabahel` |
| *walk* | `vowogal` |
| *rejection* | `vogozam` |
| *small* | `gamazam` |
| *topic* | `ozan` |
| *possibility* | `hegewem` |
| *letters* (mention marker) | `glelel` |
| *Onodan* (a titled work) | `onodan` |

#### English → Agazan {#intermediate-english-to-agazan}

**1.** *Alahen said “Azawan attests.”* (a multi-word cite)

::: details Show answer
`zalahen d[zazawan vodol] vezebel.`

z-Alahen | d-CITE[z-Azawan | v-attest] | v-tell
:::

**2.** *Alahen said “Azawan.” Ahaben saw that.* (a pointer to the quote)

::: details Show answer
`zalahen d[azawan] vezebel. zahaben duxar vahahal.`

z-Alahen | d-CITE[Azawan] | v-tell . z-Ahaben | d-←patient.same | v-see
:::

**3.** *Azawan said “Azawan” (quietly).* (a cite nesting an aside)

::: details Show answer
`zazawan d[ th(hagawal) azawan ] vezebel.`

z-Azawan | d-CITE[th-ASIDE[h-quiet] | Azawan] | v-tell
:::

**4.** *The word “onoda” is small.*

::: details Show answer
<code>glelel z&lt;onoda&gt; gamazam.</code>

[gl-MENTION | z-OPAQUE["onoda"]] | g-small
:::

**5.** *Azawan dislikes the name “onodan.”* (the name-string, not the work)

::: details Show answer
<code>zazawan glelen d&lt;onodan&gt; vogozam.</code>

z-Azawan | gl-NAME.MENTION | d-OPAQUE["onodan"] | v-rejection
:::

**6.** *Azawan said, “Does Alahen walk?”* (the question keeps its act word)

::: details Show answer
`zazawan d[yol zalahen vowogal] vezebel.`

z-Azawan | d-CITE[y-question | z-Alahen | v-walk] | v-tell
:::

**7.** *Now, about the word “odoga”: it is small.*

::: details Show answer
<code>glelel x&lt;odoga&gt; zozan gamazam.</code>

[gl-MENTION | x-OPAQUE["odoga"]] | z-TOPIC | g-small
:::

**8.** *Azawan saw, as a possibility, the lie.* (*possibility* targets that chunk)

::: details Show answer
`zazawan { hegewem dalahal } vahahal.`

z-Azawan | SCOPE[h-possibility | d-lie] | v-see
:::

**9.** *Alahen and (just Azawan) punched.*

::: details Show answer
`zalahen { zazawan zal } zam vabahel.`

[z-Alahen | SCOPE[z-Azawan | z-and] | z-and.open] | v-punch
:::

**10.** *Ahaben saw, as a possibility, the lie!* (strong feeling on that chunk)

::: details Show answer
`zahaben !{ hegewem dalahal } vahahal.`

z-Ahaben | !SCOPE[h-possibility | d-lie] | v-see
:::

**11.** *Alahen sees a copy of Onodan Alahen.* (one copy of the titled work)

::: details Show answer
`zalahen d^@[onodan alahen] vahahal.`

z-Alahen | d-NAME.CITE.instance[Onodan | Alahen] | v-see
:::

#### Agazan → English {#intermediate-agazan-to-english}

**1.** `zazawan d[zalahen vodol] vezebel.`

::: details Show answer

z-Azawan | d-CITE[z-Alahen | v-attest] | v-tell

*Azawan said “Alahen attests.”*
:::

**2.** `zahaben d~[zazawan vodol] vezebel.`

::: details Show answer

z-Ahaben | d-CITE.about[z-Azawan | v-attest] | v-tell

*Ahaben said something like “Azawan attests.”*
:::

**3.** `zalahen d[azawan] vezebel. zahaben duxar vahahal.`

::: details Show answer

z-Alahen | d-CITE[Azawan] | v-tell . z-Ahaben | d-←patient.same | v-see

*Alahen said “Azawan.” Ahaben saw that.*
:::

**4.** <code>zahaben glelen d&lt;ahahun&gt; vezebel.</code>

::: details Show answer

z-Ahaben | gl-NAME.MENTION | d-OPAQUE["ahahun"] | v-tell

*Ahaben said the name “ahahun.”*
:::

**5.** <code>glelel z&lt;ahahul&gt; gamazam.</code>

::: details Show answer

[gl-MENTION | z-OPAQUE["ahahul"]] | g-small

*The word “ahahul” is small.*
:::

**6.** <code>glelel z&lt;ahaben vodol&gt; gamazam.</code>

::: details Show answer

[gl-MENTION | z-OPAQUE["ahaben vodol"]] | g-small

*The phrase “ahaben vodol” is small.*
:::

**7.** `zalahen { hegewem dalahal } vahahal.`

::: details Show answer

z-Alahen | SCOPE[h-possibility | d-lie] | v-see

*Alahen saw, as a possibility, the lie.*
:::

**8.** `zazawan vowogal th(zalahen valahal).`

::: details Show answer

z-Azawan | v-walk | th-ASIDE[z-Alahen | v-lie]

*Azawan walks (Alahen lies).*
:::

**9.** <code>zahaben glelel d&lt;ahahul&gt; vezebel.</code>

::: details Show answer

z-Ahaben | gl-MENTION | d-OPAQUE["ahahul"] | v-tell

*Ahaben said the word “ahahul.”*
:::

**10.** `zalahen ?{ zazawan zal } zam vabahel.`

::: details Show answer

[z-Alahen | ?SCOPE[z-Azawan | z-and] | z-and.open] | v-punch

*Alahen and (just Azawan?) punched.* (unsure about that chunk)
:::

**11.** <code>zazawan d^@&lt;iPhone&gt; vahahal.</code>

::: details Show answer

z-Azawan | d-NAME.OPAQUE.instance["iPhone"] | v-see

*Azawan sees an iPhone.* (one phone, not the product)
:::

## Advanced {#advanced}

### Editorial close and close-all {#close-forms-complete-editorial-close-all}

A span closes whole with its closing bracket. Two written marks go **inside** the closing bracket. **`#`** keeps the wording as written but marks that the span is cut off, trails off, or is defective. **`|`** closes every span still open around it at once.

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

### Translation practice {#advanced-translation-practice}
<a id="translation-practice-advanced"></a>

Short drills for Advanced. Try each item before opening **Show answer**.

**Setting:** a code review

**Roots used here:**

| English | Agazan |
|---------|--------|
| *Azawan* | `azawan` |
| *Alahen* | `alahen` |
| *Ahaben* | `ahaben` |
| *tell* | `vezebel` |
| *bug* | `abogam` |

#### English → Agazan {#advanced-english-to-agazan}

**1.** *Ahaben said “bug.”* (complete close of one span)

::: details Show answer
`zahaben d[abogam] vezebel.`

z-Ahaben | d-CITE[flaw] | v-tell
:::

**2.** *Alahen said “bug…”* (the cite trails off)

::: details Show answer
`zalahen d[abogam#] vezebel.`

z-Alahen | d-CITE[flaw]# | v-tell
:::

**3.** *Azawan said “bug…” and that closes every open span.*

::: details Show answer
`zazawan d[abogam#|] vezebel.`

z-Azawan | d-CITE[flaw]#| | v-tell
:::

#### Agazan → English {#advanced-agazan-to-english}

**1.** `zazawan d[abogam#] vezebel.`

::: details Show answer

z-Azawan | d-CITE[flaw]# | v-tell

*Azawan said “bug…”*
:::

**2.** `zalahen d[abogam] vezebel.`

::: details Show answer

z-Alahen | d-CITE[flaw] | v-tell

*Alahen said “bug.”*
:::

**3.** `zahaben d[abogam#|] vezebel.`

::: details Show answer

z-Ahaben | d-CITE[flaw]#| | v-tell

*Ahaben said “bug…”*
:::

## See also

- Scope islands: [joins.md](joins.md#scope-islands-join)
- Identity vs parenthetical comment: [predication.md](predication.md#identity)
- Phrasal proper names: [word-endings.md](word-endings.md#phrasal-proper-names)
- Titled phrases (hook / join / span): [word-endings.md](word-endings.md#titled-phrases)
- Prefix-less citation outside a clause: [word-endings.md](word-endings.md#citation-forms)
