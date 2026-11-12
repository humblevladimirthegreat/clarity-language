---
band: intermediate
---

# Spans as words {#spans-as-words}

A span is written only, with no spoken form of its own. In a sentence it can stand like a word: a word as spelling, a noun, an adjective before the noun, or one thing a title names.

### Written only {#written-only}

When you read a sentence aloud, a span has no spoken form of its own: there is no word for its open or close, and no spoken resume for it. You say the words inside it, and say its marks as words.

Apart from what is inside, `[…]` and <code>&lt;…&gt;</code> work the same way: the same role letters in the same places, the same `~` / `@` marks, the same topic and `/y/` rules. The one difference is whether the inside is read as Ageben. Use `[…]` when the inside is Ageben, and <code>&lt;…&gt;</code> when it is foreign, code, or a name you do not want read as Ageben.

### Mention {#mention}

To talk about a word or phrase itself, as a spelling (*the word “odoze” is small*), put the **mention marker** before a span. That is a **mention**: it is about the letters, not what they mean, and not a quote of what someone said (for that, use a [cite](/spans#writing)). The marker is a [left-bound adjective](/left-bound-adjectives#left-bound-adjectives), so a listener hears *this is a word as spelling* before the span arrives. In English, write *the word …* or *the phrase …* and keep the Ageben spelling (`odoze`, not *dog*).

The marker is the *letters* root `ego` as a `gl-` adjective, on `-l` (`glegol`) or `-n` (`glegon`). (cue: 🔤 a word is its letters)

| Ageben | Reading |
|--------|---------|
| **`glegol`** | the word or phrase as spelling |
| **`glegon`** | the name-string: a name as spelling |

The span is a [cite](/spans#writing) `[…]` when the spelling is Ageben, and an [opaque](/spans#loans) <code>&lt;…&gt;</code> when it is not. Either way, the marker plus the span fills a role like any noun:

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

With `-n`, the mention is a name as spelling (the title, which could be changed), even when the name is one word: `glegon d[onuren]` is not `donuren`. A cite with `@` is the work itself, and that span is for a title of several words (`d@[onuren alazun]`). The one-word *Onuren* as the work is an ordinary `-n` word (`donuren`).

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

**Compare with:** `donuren` is *Onuren* (the work or person). `glegon d[onuren]` is only the name.

The marker is read as a marker only when it stands directly before a span. Anywhere else the same spelling is the ordinary adjective *lettered*. A mention marker does not go under `/y/`: a call or a reaction is not about a spelling. A `/w/` word is never a marker either, because `/w/` grades a `/ɡ/`, `/h/`, or `/th/` word, never a noun.

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

A span on `/v/` (`v[vezohul]`) has no resume pronoun.

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

**Compare with:** the [mention](#mention) marker is a `gl-` word before a span (`glegol z[odoze]`), not `gl` on the span itself.

### One of a title (`^@`) {#one-of-a-title}

A span with `@` names the work or product itself: <code>d@&lt;iPhone&gt;</code> is the iPhone as a product. For one thing that name applies to (one phone, one copy of a book, one performance of a song), write **`^@`** where the `@` goes instead. It is the span's form of the [`-ln`](proper-names.md#name-instance--ln) ending, and like `-ln` it brings a new thing into the conversation. (cue: `^` points up to the name the thing falls under)

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
| *misstate* | `vulamul` |
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

**3.** *Ahelan sees a copy of Onuren Alazun.*

::: details Show answer
`zahelan d^@[onuren alazun] vayebel.`

z-Ahelan | d-NAME.CITE.instance[Onuren | Alazun] | v-see
:::

**4.** *About the word “vowurol”: Ahelan writes it down.*

::: details Show answer
`glegol x[vowurol] zahelan dalen varuyol.`

[gl-MENTION | x-CITE[v-walk]] | z-Ahelan | d-TOPIC | v-write
:::

#### Ageben → English {#intermediate-ageben-to-english}

**1.** `zazozon glegon d[onuren] vuyugum.`

::: details Show answer
z-Azozon | [gl-NAME.MENTION | d-CITE[Onuren]] | v-rejection

*Azozon dislikes the name “onuren.”* (not the work)
:::

**2.** `zahelan d~[zazozon vugel] vezuyol.`

::: details Show answer
z-Ahelan | d-CITE.about[z-Azozon | v-attest] | v-tell

*Ahelan said something like “Azozon attests.”*
:::

**3.** `gl(gamezem) zalazun dazozon vabuvul.`

::: details Show answer
[gl-ASIDE[g-small] | z-Alazun] | d-Azozon | v-punch

*Alazun, who is small, punches Azozon.*
:::

**4.** `zazozon d[zalazun vulamul] vugel.`

::: details Show answer
z-Azozon | d-CITE[z-Alazun | v-misstate] | v-attest

*Azozon attests, “Alazun says something untrue.”*
:::

#### Pick one {#intermediate-pick-one}

**1.** *Azozon dislikes Onuren Alazun.* (the work) `zazozon d@[onuren alazun] vuyugum.` or `zazozon d[onuren alazun] vuyugum.`

::: details Show answer
`zazozon d@[onuren alazun] vuyugum.`

z-Azozon | d-NAME.CITE[Onuren | Alazun] | v-rejection

**`@`** makes the span the work; bare brackets quote the words.
:::

#### Fix it {#intermediate-fix-it}

**1.** *Ahelan dislikes the name “alazun.”* <!-- lint: error -->`zahelan glegol d[alazun] vuyugum.`

::: details Show answer
`zahelan glegon d[alazun] vuyugum.`

z-Ahelan | [gl-NAME.MENTION | d-CITE[Alazun]] | v-rejection

A name as spelling takes the **-n** marker `glegon`; `glegol` is a word as spelling.
:::
