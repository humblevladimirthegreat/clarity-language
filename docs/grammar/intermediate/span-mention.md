---
band: intermediate
---

# Mention {#mention-sitting}

### Written only {#written-only}

A span has **no spoken form**: there is no word for its open or close, and no spoken resume for it. When you read a span aloud, you say the words inside it, and say its marks as words.

Apart from what is inside, `[…]` and <code>&lt;…&gt;</code> work the same way: the same role letters, the same slots, the same **`~`** / **`@`** marks, the same topic and `/y/` rules. The one difference is whether the inside is read as Ageben. Use `[…]` when the inside is Ageben, and <code>&lt;…&gt;</code> when it is foreign, code, or a name you do not want read as Ageben.

### Mention {#mention}

To talk about a word or phrase itself, as a spelling (*the word “odoze” is small*), put the **mention marker** before a span. That is a **mention**: it is about the letters, not what they mean, and not a quote of what someone said (for that, use a [cite](/spans#writing)). The marker is a [left-bound adjective](/left-bound-adjectives#left-bound-adjectives), so a listener hears *this is a word as spelling* before the span arrives. In English, write *the word …* or *the phrase …* and keep the Ageben spelling (`odoze`, not *dog*).

The marker is the *letters* root `ego` as a `gl-` adjective, on **-l** (`glegol`) or **-n** (`glegon`). (cue: 🔤 a word is its letters)

| Ageben | Reading |
|--------|---------|
| **`glegol`** | the word or phrase as spelling |
| **`glegon`** | the name-string: a name as spelling |

The span is a [cite](/spans#writing) `[…]` when the spelling is Ageben, and an [opaque](/spans#loans) <code>&lt;…&gt;</code> when it is not. Either way, the marker plus the span fills a slot like any noun:

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

| Ageben | Use | English |
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

### Practice {#intermediate-practice}

Short drills for Intermediate. Try each item before opening **Show answer**.

**Setting:** a courtroom

**New words:**

| English | Ageben | Cue |
|---------|--------|-----|
| *Onuren* | `onuren` | 🎵 from *note*: a song's name |
| *rejection* | `vuyugum` | ❌ from *cross* |
| *letters* | `glegol` | 🔤: a word is its letters |

**Review:**

| English | Ageben |
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

#### English → Ageben {#intermediate-english-to-ageben}

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

#### Ageben → English {#intermediate-ageben-to-english}

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

**4.** `gl(gamezem) zalazun dazozon vabuvul.`

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

#### Fix it {#intermediate-fix-it}

**1.** *Azozon said, “Does Alazun walk?”* <!-- lint: error -->`yel zazozon d[zalazun vowurol] vezuyol.`

::: details Show answer
`zazozon d[yel zalazun vowurol] vezuyol.`

z-Azozon | d-CITE[y-question | z-Alazun | v-walk] | v-tell

The quoted question keeps its act word inside the cite; **`yel`** outside asks whether Azozon said it.
:::
