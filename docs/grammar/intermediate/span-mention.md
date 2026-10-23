---
band: intermediate
---

# Mention and islands {#mention-and-scope-islands}

### Written only {#written-only}

A span has **no spoken form**: there is no word for its open or close, and no spoken resume for it. When you read a span aloud, you say the words inside it, and say its marks as words.

Apart from what is inside, `[…]` and <code>&lt;…&gt;</code> work the same way: the same role letters, the same slots, the same **`~`** / **`@`** marks, the same topic and `/y/` rules. The one difference is whether the inside is read as Agebon. Use `[…]` when the inside is Agebon, and <code>&lt;…&gt;</code> when it is foreign, code, or a name you do not want read as Agebon.

### Mention {#mention}

To talk about a word or phrase itself, as a spelling (*the word “odoze” is small*), put the **mention marker** before a span. That is a **mention**: it is about the letters, not what they mean, and not a quote of what someone said (for that, use a [cite](/spans#writing)). The marker is a [left-bound adjective](/left-bound-adjectives#left-bound-adjectives), so a listener hears *this is a word as spelling* before the span arrives. In English, write *the word …* or *the phrase …* and keep the Agebon spelling (`odoze`, not *dog*).

The marker is the *letters* root `ego` as a `gl-` adjective, on **-l** (`glegol`) or **-n** (`glegon`). (cue: 🔤 a word is its letters)

| Agebon | Reading |
|--------|---------|
| **`glegol`** | the word or phrase as spelling |
| **`glegon`** | the name-string: a name as spelling |

The span is a [cite](/spans#writing) `[…]` when the spelling is Agebon, and an [opaque](/spans#loans) <code>&lt;…&gt;</code> when it is not. Either way, the marker plus the span fills a slot like any noun:

> `glegol z[odoze] gamezem.`
>
> [gl-MENTION | z-CITE["odoze"]] | g-small
>
> "The word “odoze” is small."

> `glegol z[zazozon vozuyel] gamezem.`
>
> [gl-MENTION | z-CITE[z-Azozon | v-sing]] | g-small
>
> "The phrase “zazozon vozuyel” is small."

> <code>glegol z&lt;kimchi&gt; gamezem.</code>
>
> [gl-MENTION | z-OPAQUE["kimchi"]] | g-small
>
> "The word “kimchi” is small." (a foreign word)

With **-n**, the mention is a **name** as spelling (the title, which could be changed), even when it is **one word**: `glegon d[onuren]` is not `donuren`. A cite with **`@`** is the **work**, and that span is for a title of **several words** (`d@[onuren alazun]`). The one-word *Onuren* as the work is an ordinary **-n** word (`donuren`).

> `zazozon d@[onuren alazun] vuyugum.`
>
> z-Azozon | d-NAME.CITE[Onuren | Alazun] | v-rejection
>
> "Azozon dislikes Onuren Alazun." (the work)

> `zazozon glegon d[onuren] vuyugum.`
>
> z-Azozon | [gl-NAME.MENTION | d-CITE[Onuren]] | v-rejection
>
> "Azozon dislikes the name “onuren.”" (not the work)

**Compare with:** `donuren` is *Onuren* (the work or person). `glegon d[onuren]` is only the **name**.

The marker is read as a marker only when it stands **directly before a span**. Anywhere else the same spelling is the ordinary adjective *lettered*. A mention marker does not go under `/y/`: a call or a reaction is not about a spelling. A `/w/` word is never a marker either, because `/w/` grades a `/ɡ/`, `/h/`, or `/th/` word, never a noun.

A marker before a topic span works the same way:

> `glegol x[odoze] zalen gamezem.`
>
> [gl-MENTION | x-CITE["odoze"]] | z-TOPIC | g-small
>
> "Now, about the word “odoze”: it is small."

### A span is an ordinary noun {#span-noun}

A span fills a role like any noun, so a [role pointer](/pronouns#role-pointers) for that role can point back to it. After a cite, `dwuder` is *that quote*: the latest thing done to.

> `zalazun d[azozon] vezuyol. zahelan dwuder varuyol.`
>
> z-Alazun | d-CITE[Azozon] | v-tell . z-Ahelan | d-←episode-patient.same | v-write
>
> "Alazun said “Azozon.” Ahelan wrote that down."

The same holds for a loan word or any other span, and `dwudel` is [another one](/pronouns#a-new-one) of what the span holds.

An aside gives role pointers nothing to point back to. A [tag](tag-pronouns.md#tag-pronouns) assigned inside a cite or an aside does not hold outside it, and a pointer outside never reaches a word inside one.

A span in a `/v/` slot (`v[vezohul]`) has no resume pronoun.

### Spans before the noun (`gl`) {#gl-spans}

A span on `/ɡ/` can also come **before** its noun, the way a [`gl-` adjective](/left-bound-adjectives#left-bound-adjectives) does: write **`gl`** before the bracket. It describes the next noun, so a noun must follow it. A noun aside before the noun (`gl(…)`) keeps the spot after the noun free for a plain adjective that picks out which one.

> `gl(gerulol) zodozel gamezem vowurol.`
>
> [gl-ASIDE[g-red] | z-dog | g-small] | v-walk
>
> "The small dog (it is red) walks."

A loan adjective or a cite leans the same way:

> <code>gl&lt;rouge&gt; zodozel vowurol.</code>
>
> [gl-OPAQUE["rouge"] | z-dog] | v-walk
>
> "A rouge dog walks."

**Compare with:** the [mention](#mention) marker is a `gl-` **word** before a span (`glegol z[odoze]`), not `gl` on the span itself.

### One of a title (`^@`) {#one-of-a-title}

A span with **`@`** names the work or product itself: <code>d@&lt;iPhone&gt;</code> is the iPhone as a product. For one thing that name applies to (one phone, one copy of a book, one performance of a song), write **`^@`** in the mark slot instead. It is the span's form of the [**-ln**](proper-names.md#name-instance--ln) ending, and like **-ln** it brings a new thing into the conversation. (cue: **^** points up to the name the thing falls under)

> <code>zalazun d^@&lt;iPhone&gt; vayebel.</code>
>
> z-Alazun | d-NAME.OPAQUE.instance["iPhone"] | v-see
>
> "Alazun sees an iPhone."

| Agebon | Use | English |
|--------|-----|---------|
| <code>d@&lt;iPhone&gt;</code> | the named product | *the iPhone* |
| <code>d^@&lt;iPhone&gt;</code> | one unit of it | *an iPhone* |
| `d@[onuren alazun]` | the named work | *Onuren Alazun* |
| `d^@[onuren alazun]` | one copy or performance of it | *a copy of Onuren Alazun* |
| `d~^@[onuren alazun]` | one copy of a work titled roughly that | *a copy of something like Onuren Alazun* |

### Act words in a quote {#quote-acts}

A quoted question or command keeps its own [act word](/speech-moves#speech-act-statement-question-command) inside the cite, the same way it keeps a tone mark. The outer sentence is still your claim (*said*), and `yel` or `yol` belongs to the quoted talk.

> `zazozon d[yel zalazun vowurol] vezuyol.`
>
> z-Azozon | d-CITE[y-question | z-Alazun | v-walk] | v-tell
>
> "Azozon said, “Does Alazun walk?”"

### Topics in a quote {#topic-quotes}

A cite holds someone else's words, so a [topic](topic.md#topic) never carries into it or out of it. The inside of a cite starts with no topic, no [tags](tag-pronouns.md#tag-pronouns), and its own targets for [role pointers](/pronouns#role-pointers), and may open with a topic word of its own. When the cite ends, your own topic and tags are as they were.

A cite or opaque span can also be a topic word itself, under `/x/`: a titled work, a word as spelling (with the mention marker before it), or a foreign name.

> `x@[onuren alazun] dalen vozuyel.`
>
> x-NAME.CITE[Onuren | Alazun] | d-TOPIC | v-sing
>
> "Now, about Onuren Alazun: it is sung."

> <code>x@&lt;Sam&gt; zalen vowurol.</code>
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

> `zazozon { hogugem zodozel gerulol } vayebel.`
>
> z-Azozon | SCOPE[h-possibility | [z-dog | g-red]] | v-see
>
> "Azozon saw what was possibly a red dog."

Here **`hogugem`** reaches only *a red dog*, not the seeing.

A [tone mark](tone-marks.md#tone-marks) written right before the opening brace colors the whole island (`!{ hogugem zodozel gerulol }`).

**Compare with:** quoting, asides, mentions, and opaque blobs use [spans](/spans#writing) (`d[…]`, `th(…)`, <code>d&lt;…&gt;</code>). Islands only group so a binder inside can target that chunk.

- No role letter on the edges.
- **At most one phrase.** After its binder, an island holds at most one phrase: a `/z/`, `/d/`, or `/b/` noun phrase, a `/v/` verb phrase, or a `/ɡ/` stack, with that phrase’s own adjectives, `/w/` detail, and join. An `/h/` word is a binder, never the phrase.
- **It may close early.** The island can stop partway through its phrase; the pause marks where. By the end of the phrase at the latest, it has closed: a new role letter or the outer join always comes after the island.
- **Hosts keep their `bl-` word.** A host (`/ɡ/`, `/h/`, `/th/`) and its `bl-` word are both inside the island or both outside. A plain `/b/` is the recipient, not a host's partner, so it may sit on either side of an edge.
- **One island per clause.** Islands do not nest.
- Empty `{ }` has no reading.
- **Binder required:** at least one scope-taking `/h/` or `/th/` and/or a join particle **inside**. A [hook](/hooks) is never a binder. A hook already reaches its whole stretch: `/w/` right before it grades the whole span, and a hook after a noun belongs to that noun.
- Prefer spaces inside: `{ hogugem zodozel gerulol }`.

| Binder | Use inside the island |
|--------|------------------------|
| Scope-taking **`/h/`** or **`/th/`** | frames that **chunk** (prefer first in the island; see the `/b/` exception below) |
| Prefixed **join** | joins **only** matching-role material **inside** |

`/h/` and a join may share one island (`{ hogugem zazozon zalazun zam }`).

| Placement | Reading |
|-----------|---------|
| `/h/` or `/th/` **inside** | frames that chunk |
| `/h/` or `/th/` **outside** | ordinary floating word: frames the verb / clause |
| Join **inside** | joins only interior conjuncts |
| Join **outside** with island nearby | ordinary lookback (edges do not filter an outside join) |

> `zazozon { zalazun zal } zam vowurol.`
>
> [z-Azozon | SCOPE[z-Alazun | z-and] | z-and.open] | v-walk
>
> "Azozon and (just Alazun) walk."

A recipient is a plain `/b/` ([extra nouns](/clause#extra-nouns)), so it can share an island with an adverb:

> `zazozon { balazun hogugem } vezuyol.`
>
> z-Azozon | SCOPE[b-Alazun | h-possibility] | v-tell
>
> "Azozon talks, possibly to Alazun."

An island can hold part of a phrase. Here only *not small* is grouped, so **`gul`** denies *small* alone and **`gal`** adds it to *red*:

> `zodozel gerulol { gamezem gul } gal vowurol.`
>
> [z-dog | [g-red | SCOPE[g-small | g-not] | g-and]] | v-walk
>
> "A dog that is red and not small walks."

**Speech:** leave a **break** before the island (the next beat comes half a beat late), say it as one tight phrase, and leave another break after its last word. In singing, phrase it as its own short phrase. Because an island never runs past one phrase, a listener who misses the closing break is off by at most part of that phrase.

### Practice {#intermediate-practice}

Short drills for Intermediate. Try each item before opening **Show answer**.

**Setting:** a courtroom

**New words:**

| English | Agebon | Cue |
|---------|--------|-----|
| *Onuren* | `onuren` | 🎵 from *note*: a song's name |
| *rejection* | `vuyugum` | ❌ from *cross* |
| *possibility* | `hogugem` | ❓ from *question mark* |
| *letters* | `glegol` | 🔤: a word is its letters |

**Review:**

| English | Agebon |
|---------|--------|
| *Azozon* | `azozon` |
| *Alazun* | `alazun` |
| *Ahelan* | `ahelan` |
| *topic* | `alen` |
| *attest* | `vugel` |
| *lie* | `vulamul` |
| *small* | `gamezem` |
| *tell* | `vezuyol` |
| *write* | `varuyol` |
| *see* | `vayebel` |
| *punch* | `vabuvul` |
| *walk* | `vowurol` |

#### English → Agebon {#intermediate-english-to-agebon}

**1.** *Alazun said “Azozon attests.”*

::: details Show answer
`zalazun d[zazozon vugel] vezuyol.`

z-Alazun | d-CITE[z-Azozon | v-attest] | v-tell
:::

**2.** *Alazun said “Azozon.” Ahelan wrote that down.* (*that* is the quote)

::: details Show answer
`zalazun d[azozon] vezuyol. zahelan dwuder varuyol.`

z-Alazun | d-CITE[Azozon] | v-tell . z-Ahelan | d-←episode-patient.same | v-write
:::

**3.** *Now, about the word “alede”: it is small.*

::: details Show answer
`glegol x[alede] zalen gamezem.`

[gl-MENTION | x-CITE["alede"]] | z-TOPIC | g-small
:::

**4.** *Azozon said, “Does Alazun lie?”*

::: details Show answer
`zazozon d[yel zalazun vulamul] vezuyol.`

z-Azozon | d-CITE[y-question | z-Alazun | v-lie] | v-tell
:::

**5.** *Ahelan sees a copy of Onuren Alazun.*

::: details Show answer
`zahelan d^@[onuren alazun] vayebel.`

z-Ahelan | d-NAME.CITE.instance[Onuren | Alazun] | v-see
:::

**6.** *Alazun talks, possibly to Ahelan.*

::: details Show answer
`zalazun { bahelan hogugem } vezuyol.`

z-Alazun | SCOPE[b-Ahelan | h-possibility] | v-tell
:::

#### Agebon → English {#intermediate-agebon-to-english}

**1.** `zazozon glegon d[onuren] vuyugum.`

::: details Show answer
z-Azozon | [gl-NAME.MENTION | d-CITE[Onuren]] | v-rejection

*Azozon dislikes the name “onuren.”* (not the work)
:::

**2.** `x@[onuren alazun] zalazun dalen vuyugum.`

::: details Show answer
x-NAME.CITE[Onuren | Alazun] | z-Alazun | d-TOPIC | v-rejection

*Now, about Onuren Alazun: Alazun dislikes it.*
:::

**3.** `zahelan d~[zazozon vugel] vezuyol.`

::: details Show answer
z-Ahelan | d-CITE.about[z-Azozon | v-attest] | v-tell

*Ahelan said something like “Azozon attests.”*
:::

**4.** `zalazun { zazozon zal } zam vabuvul.`

::: details Show answer
[z-Alazun | SCOPE[z-Azozon | z-and] | z-and.open] | v-punch

*Alazun and (just Azozon) punched.*
:::


**5.** `zahelan !{ hogugem dulamul } vayebel.`

::: details Show answer
z-Ahelan | !SCOPE[h-possibility | d-lie] | v-see

*Ahelan saw what was possibly a lie!*
:::

**6.** `gl(gamezem) zalazun dazozon vabuvul.`

::: details Show answer
[gl-ASIDE[g-small] | z-Alazun] | d-Azozon | v-punch

*Alazun, who is small, punches Azozon.*
:::

#### Pick one {#intermediate-pick-one}

**1.** *Azozon dislikes Onuren Alazun.* (the work) `zazozon d@[onuren alazun] vuyugum.` or `zazozon d[onuren alazun] vuyugum.`

::: details Show answer
`zazozon d@[onuren alazun] vuyugum.`

z-Azozon | d-NAME.CITE[Onuren | Alazun] | v-rejection

**`@`** makes the span the work; bare brackets quote the words.
:::

**2.** *Azozon saw what was possibly a lie.* `zazozon { hogugem dulamul } vayebel.` or `zazozon hogugem dulamul vayebel.`

::: details Show answer
`zazozon { hogugem dulamul } vayebel.`

z-Azozon | SCOPE[h-possibility | d-lie] | v-see

Inside braces, **`hogugem`** reaches only that chunk; outside, it frames the whole seeing.
:::

#### Fix it {#intermediate-fix-it}

**1.** *Azozon said, “Does Alazun walk?”* <!-- lint: error -->`yel zazozon d[zalazun vowurol] vezuyol.`

::: details Show answer
`zazozon d[yel zalazun vowurol] vezuyol.`

z-Azozon | d-CITE[y-question | z-Alazun | v-walk] | v-tell

The quoted question keeps its act word inside the cite; **`yel`** outside asks whether Azozon said it.
:::
