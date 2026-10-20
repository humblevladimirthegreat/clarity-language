# Spans

Some parts of a sentence are not ordinary Egabon words: a quote of what someone said, a word from another language, a comment in parentheses. Egabon sets such a part apart as a **span**: a role letter, then a pair of brackets around the words. The role letter says what the whole bracketed chunk does in the sentence (subject, object, verb, adverb, and so on), so the rest of the sentence reads as usual. A span is written only: speech has no word for its open or close.

## Beginner {#beginner}

Start with a quote of what someone said.

### Cite (`[…]`) {#writing}
<a id="writing-vs-speech"></a>

To quote wording (what someone said, a title, a proverb as words), write the role letter, then square brackets around the quoted words. That span is a **cite**. The whole quote fills one role, so *said “…”* works like *said something*. (cue: `[…]` like quote marks)

Start with a one-word quote as the object of *said*. A [greeting](word-endings.md#greeting) is just your own name, so quoting Uzazon’s hello means quoting that name:

> `zuzazon d[uzazon] vezeyel.`
>
> z-Uzazon | d-CITE[Uzazon] | v-tell
>
> "Uzazon said “Uzazon.”" (hello)

The whole `d[uzazon]` is the direct object (who or what is acted on). When the quote is a whole Egabon sentence, each word inside starts with its own role letter, as in any sentence.

### Exact, paraphrase, proper
<a id="when-required"></a>

You can mark how faithful the quote is. Put the mark **after** the role letter, before the opening bracket.

A span with no mark is **exact**: the words as they were said (`d[uzazon]`). Write **`~`** for a **paraphrase**, when you mean the gist, not the exact words (`d~[zuzazon vezeyol]`). Write **`@`** for a **proper** span: it names a work with a title of several words, such as a song, proverb, or book (`d@[onoron olozun]`). The span then means the work itself, not its title as a string of words.

A work or person with a one-word name is an ordinary **-n** word (`donoron`), not `d@[onoron]`, unless a role letter or an ending is part of the title itself. The mark belongs to the brackets; the words inside keep their usual endings ([titled phrases](word-endings.md#titled-phrases)).

<!-- cheat-sheet: restrictors-spans -->
| Egabon | Use | English | Cue |
|--------|-----|---------|-----|
| *(none)* | exact | verbatim wording | bare brackets already quote; extra ink would hedge |
| **`~`** | paraphrase | the gist, not the exact words | **~** looks like “about / approximately” |
| **`@`** | proper | the work known by that title | **@** like a social media handle |

> `zolozun d~[zuzazon vezeyol] vuruyel.`
>
> z-Olozun | d-CITE.about[z-Uzazon | v-sing] | v-write
>
> "Olozun wrote something like “Uzazon sings.”"

> `zehalon d@[onoron olozun] vezeyol.`
>
> z-Ehalon | d-NAME.CITE[Onoron | Olozun] | v-sing
>
> "Ehalon sang Onoron Olozun."

**`~`** and **`@`** combine, `~` first: the span still names the work, but the title is only roughly that. Use it when you remember a title loosely.

> `zehalon d~@[onoron olozun] vezeyol.`
>
> z-Ehalon | d-NAME.CITE.about[Onoron | Olozun] | v-sing
>
> "Ehalon sang that song called something like Onoron Olozun."

### Opaque and loan words {#loans}

To use a word from another language, a bit of code, or any spelling that is not Egabon, write the role letter, then angle brackets around it. That span is **opaque**: the inside is taken exactly as spelled and is not read as Egabon words. Write no letter after the closing `>`. The faithfulness marks are the same as on a cite: none, **`~`**, or **`@`**.

> <code>zuzazon d&lt;kimchi&gt; vanobol.</code>
>
> z-Uzazon | d-OPAQUE["kimchi"] | v-see
>
> "Uzazon saw kimchi." (a foreign word)

Inside <code>&lt;&gt;</code>, keep the source’s capital letters when its writing system has them (<code>d&lt;NaCl&gt;</code>, <code>d@&lt;iPhone&gt;</code>). Egabon letters outside the brackets are always [lowercase](phonology.md#beginner). Use **`@`** when the bracketed word is a name or title.

When the lexicon already has a matching root, write the ordinary word (`degazol`), not a span.

On its own, outside a sentence, a foreign name or word is written with no role letter: just the marks and the brackets (<code>@&lt;Sam&gt;</code>), like other [citation forms](word-endings.md#citation-forms). In a sentence the span fills a role, so it takes a role letter (<code>z@&lt;Sam&gt;</code>).

### Calls and reactions (`/y/`) {#y-spans}

To call someone by a foreign name (*Sam!*) or react with a foreign word (*Amen!*), put a span under `/y/`. Only an opaque <code>&lt;…&gt;</code> or a cite `[…]` goes there, and it opens the turn, before the act word.

The **`@`** mark decides which, as **-n** does on a native word. With **`@`**, the span calls that person (<code>y@&lt;Sam&gt;</code>, *Sam!*); add **`~`** for a name you are not sure of (<code>y~@&lt;Sam&gt;</code>). Without **`@`**, the span is a foreign [interjection](speech-moves.md#interjections) (<code>y&lt;Amen&gt;</code>, *Amen!*), exact or given as the gist with **`~`** (<code>y~&lt;Amen&gt;</code>).

### Asides (`th(…)`) {#asides-th}
<a id="asides"></a>

To add a side comment in parentheses, write a role letter, then **`(`** … **`)`**. That span is an **aside**. The role letter says what the comment is about, and the aside sits where a word with that letter sits. (cue: round parentheses, as in English)

| Egabon | Comments on | Sits |
|--------|-------------|------|
| `th(…)` | the whole sentence | anywhere a [stance](clause.md#stance-th) word may sit |
| `g(…)` | the noun before it | right after that noun, like an [adjective](clause.md#adjectives-ɡ) |
| `w(…)` | the next `/ɡ/`, `/h/`, or `/th/` word | right before that word, like [*very*](clause.md#adjective-detail-w) |
| `h(…)` | the action | anywhere an [adverb](clause.md#adverbs-h) may sit |

The inside is ordinary Egabon: a fragment, or a clause with the **same speech act** as the outer sentence (both statements, both questions, or both commands). An aside comments; it does not call anyone or react, so it never goes under `/y/`. It fills no slot of the verb either, so it never goes under `/z/`, `/d/`, `/b/`, or `/v/`.

> `zuzazon voworel th(hogawol).`
>
> z-Uzazon | v-walk | th-ASIDE[h-quiet]
>
> "Uzazon walks (quietly)."

> `zuzazon voworel th(zolozun vuzevol).`
>
> z-Uzazon | v-walk | th-ASIDE[z-Olozun | v-sleep]
>
> "Uzazon walks (Olozun is asleep)."

A noun aside adds something about a noun the listener already has. It does not pick out which one, the way a plain adjective can:

> `zodozol g(gerolol) voworel.`
>
> [z-dog | g-ASIDE[g-red]] | v-walk
>
> "The dog (it is red) walks."

> `zuzazon g(zuzazor voworel) vezeyol.`
>
> [z-Uzazon | g-ASIDE[z-←Uzazon | v-walk]] | v-sing
>
> "Uzazon, who walks, sings."

A `/w/` aside narrows the comment to one word. Here only the color is what Uzazon says:

> `zodozol w(zuzazon vezeyel) gerolol voworel.`
>
> [z-dog | [w-ASIDE[z-Uzazon | v-tell] | g-red]] | v-walk
>
> "A (so Uzazon says) red dog walks."

An `/h/` aside is a side detail about the action itself, not about your claim:

> `zuzazon voworel h(al bebahal).`
>
> z-Uzazon | v-walk | h-ASIDE[in | b-bank]
>
> "Uzazon walks (in a bank)."

A one-word comment with nothing to package is a plain word in that slot: `zuzazon voworel hogawol.`

**For *because* / *if*, use:** [**`barl`**](dependents.md#poles) dependents, not an aside.

**Compare with:** a second name for the same person uses [identity](predication.md#identity) (`gugo` + `/b/`). To pick out **which** noun (*the guard who sits*), use a plain adjective or [another sentence](dependents.md#which-noun), not a noun aside.

### Outer slot {#pos}

A span can fill any role a word can, not only the object. The letter before the bracket is the role of the **whole span** in the outer sentence, so ask what that chunk does there: the object of *said*, the subject of *is small*, and so on. A cite can even be the **verb**, when you echo an act as wording:

> `yul zolozun v[vuzahul].`
>
> y-prohibition | z-Olozun | v-CITE[v-stop]
>
> "Don’t say “stop,” Olozun."

<!-- cheat-sheet: restrictors-spans -->
| Egabon | Use | English | Cue |
|--------|-----|---------|-----|
| `/d/` | object | *said / wrote / saw “…”* (`d[uzazon]`, <code>d&lt;kimchi&gt;</code>) | **d** ≈ done to |
| `/z/` | subject | a foreign name as the subject (<code>z@&lt;Sam&gt;</code>) | **z** ≈ star (who it is about) |
| `/b/` | extra party | a foreign name as the recipient (<code>b@&lt;Sam&gt;</code>) | **b** ≈ bolted on (the extra piece) |
| `/v/` | verb | echo the act as wording (`v[vuzahul]`); a loan verb (<code>v&lt;google&gt;</code>) | **v** as in English *verb* |
| `/ɡ/` | adjective | a loan adjective (<code>g&lt;rouge&gt;</code>); an aside on the noun (`g(…)`) | **g** ≈ grade (a rating of the noun) |
| `/w/` | extra detail | a loan degree word (<code>w&lt;molto&gt;</code>); an aside on the next word (`w(…)`) | **w** ≈ with (stuck to that host) |
| `/h/` | adverb | a loan adverb (<code>h&lt;allegro&gt;</code>); an aside on the action (`h(…)`) | **h** starts *how* / *when* / *where* |
| `/th/` | stance | an aside on the sentence (`th(…)`) | **th** ≈ *think* (your side comment) |

Only an aside goes under `/th/`. An aside also goes under `/ɡ/`, `/w/`, or `/h/`, never under `/z/` `/d/` `/b/` `/v/`. A cite, mention, or opaque span fills any slot but `/th/`.

To use a foreign verb, adjective, adverb, or degree word (*googled*, *rouge*, *molto*), put an opaque span in that slot. That is a **loan word**: the role letter says how the foreign word is used, and the inside keeps its own spelling.

> <code>zolozun v&lt;google&gt; duzazon.</code>
>
> z-Olozun | v-OPAQUE["google"] | d-Uzazon
>
> "Olozun googled Uzazon." (a borrowed word)

> <code>zodozol g&lt;rouge&gt; voworel.</code>
>
> [z-dog | g-OPAQUE["rouge"]] | v-walk
>
> "A rouge dog walks." (a borrowed word)

> <code>zuzazon vezeyel b@&lt;Sam&gt;.</code>
>
> z-Uzazon | v-tell | b-NAME.OPAQUE["Sam"]
>
> "Uzazon talks to Sam." (a foreign name)

The letter before the bracket belongs to the whole span. Egabon words inside a cite start with **their own** role letters.

### Practice {#beginner-practice}

Short drills for Beginner. Try each item before opening **Show answer**.

**Setting:** a rehearsal

**New words:**

| English | Egabon | Cue |
|---------|--------|-----|
| *sing* | `vezeyol` | 🧑‍🎤 |
| *stop* | `vuzahul` | 🛑 |
| *quiet* | `ogawol` | 🔈 |
| *Onoron* | `onoron` | 🎵 from *note*: a song's name |
| *Sam* | <code>@&lt;Sam&gt;</code> | a foreign name |
| *google* | <code>v&lt;google&gt;</code> | a loan verb |
| *Bravo* | <code>&lt;Bravo&gt;</code> | a foreign word |

**Review:**

| English | Egabon |
|---------|--------|
| *Uzazon* | `uzazon` |
| *Olozun* | `olozun` |
| *Ehalon* | `ehalon` |
| *tell* | `vezeyel` |
| *write* | `vuruyel` |
| *walk* | `voworel` |

#### English → Egabon {#beginner-english-to-egabon}

**1.** *Uzazon said “Uzazon.”* (hello)

::: details Show answer
`zuzazon d[uzazon] vezeyel.`

z-Uzazon | d-CITE[Uzazon] | v-tell
:::

**2.** *Olozun wrote something like “Ehalon sings.”*

::: details Show answer
`zolozun d~[zehalon vezeyol] vuruyel.`

z-Olozun | d-CITE.about[z-Ehalon | v-sing] | v-write
:::

**3.** *Olozun talks to Sam.* (a foreign name)

::: details Show answer
<code>zolozun vezeyel b@&lt;Sam&gt;.</code>

z-Olozun | v-tell | b-NAME.OPAQUE["Sam"]
:::

**4.** *Don’t say “stop,” Uzazon.*

::: details Show answer
`yul zuzazon v[vuzahul].`

y-prohibition | z-Uzazon | v-CITE[v-stop]
:::

**5.** *Sam, does Uzazon sing?*

::: details Show answer
<code>y@&lt;Sam&gt; yol zuzazon vezeyol.</code>

y-NAME.OPAQUE["Sam"] | y-question | z-Uzazon | v-sing
:::

**6.** *Olozun walks (quietly).*

::: details Show answer
`zolozun voworel th(hogawol).`

z-Olozun | v-walk | th-ASIDE[h-quiet]
:::

#### Egabon → English {#beginner-egabon-to-english}

**1.** `zolozun d@[onoron olozun] vuruyel.`

::: details Show answer
z-Olozun | d-NAME.CITE[Onoron | Olozun] | v-write

*Olozun wrote Onoron Olozun.* (the work)
:::

**2.** <code>zolozun v&lt;google&gt; donoron.</code>

::: details Show answer
z-Olozun | v-OPAQUE["google"] | d-Onoron

*Olozun googled Onoron.* (a borrowed word)
:::

**3.** `zehalon g(zehalor vezeyol) voworel.`

::: details Show answer
[z-Ehalon | g-ASIDE[z-←Ehalon | v-sing]] | v-walk

*Ehalon, who sings, walks.*
:::

**4.** <code>y&lt;Bravo&gt;.</code>

::: details Show answer
y-OPAQUE["Bravo"]

*Bravo!* (a foreign word)
:::

**5.** `zehalon d~@[onoron olozun] vezeyol.`

::: details Show answer
z-Ehalon | d-NAME.CITE.about[Onoron | Olozun] | v-sing

*Ehalon sang the song called something like Onoron Olozun.*
:::

**6.** `zehalon d[vuzahul] vezeyel.`

::: details Show answer
z-Ehalon | d-CITE[v-stop] | v-tell

*Ehalon said “stop.”*
:::

#### Pick one {#beginner-pick-one}

**1.** *Ehalon sang Onoron Olozun.* (the song) `zehalon d@[onoron olozun] vezeyol.` or `zehalon d[onoron olozun] vezeyol.`

::: details Show answer
`zehalon d@[onoron olozun] vezeyol.`

z-Ehalon | d-NAME.CITE[Onoron | Olozun] | v-sing

**`@`** makes the span the work itself; bare brackets quote the words.
:::

**2.** *Uzazon said “Olozun stops.”* `zuzazon d[zolozun vuzahul] vezeyel.` or `zuzazon vezeyel th(zolozun vuzahul).`

::: details Show answer
`zuzazon d[zolozun vuzahul] vezeyel.`

z-Uzazon | d-CITE[z-Olozun | v-stop] | v-tell

What was said is the object, so it is a cite in `/d/`; an aside only comments on the sentence.
:::

#### Fix it {#beginner-fix-it}

**1.** *Olozun sang Onoron.* (a work with a one-word name) <!-- lint: error -->`zolozun d@[onoron] vezeyol.`

::: details Show answer
`zolozun donoron vezeyol.`

z-Olozun | d-Onoron | v-sing

A one-word name is an ordinary **-n** word; **`@[…]`** is for titles of several words.
:::

## Intermediate {#intermediate}

### Written only {#written-only}

A span has **no spoken form**: there is no word for its open or close, and no spoken resume for it. When you read a span aloud, you say the words inside it, and say its marks as words.

Apart from what is inside, `[…]` and <code>&lt;…&gt;</code> work the same way: the same role letters, the same slots, the same **`~`** / **`@`** marks, the same topic and `/y/` rules. The one difference is whether the inside is read as Egabon. Use `[…]` when the inside is Egabon, and <code>&lt;…&gt;</code> when it is foreign, code, or a name you do not want read as Egabon.

### Mention {#mention}

To talk about a word or phrase itself, as a spelling (*the word “odozo” is small*), put the **mention marker** before a span. That is a **mention**: it is about the letters, not what they mean, and not a quote of what someone said (for that, use a [cite](#writing)). The marker is a [left-bound adjective](clause.md#left-bound-adjectives), so a listener hears *this is a word as spelling* before the span arrives. In English, write *the word …* or *the phrase …* and keep the Egabon spelling (`odozo`, not *dog*).

The marker is the *letters* root `ele` as a `gl-` adjective, on **-l** (`glelel`) or **-n** (`glelen`). (cue: 🔤 a word is its letters)

| Egabon | Reading |
|--------|---------|
| **`glelel`** | the word or phrase as spelling |
| **`glelen`** | the name-string: a name as spelling |

The span itself is an ordinary [opaque](#loans) <code>&lt;…&gt;</code> (or a cite `[…]`), so the marker plus the span fills a slot like any noun:

> <code>glelel z&lt;odoga&gt; gumazom.</code>
>
> [gl-MENTION | z-OPAQUE["odoga"]] | g-small
>
> "The word “odozo” is small."

> <code>glelel z&lt;zazawan vezehel&gt; gumazom.</code>
>
> [gl-MENTION | z-OPAQUE["zazawan vezehel"]] | g-small
>
> "The phrase “zuzazon vezeyol” is small."

With **-n**, the mention is a **name** as spelling (the title, which could be changed), even when it is **one word**: <code>glelen d&lt;onodan&gt;</code> is not `donoron`. A cite with **`@`** is the **work**, and that span is for a title of **several words** (`d@[onoron olozun]`). The one-word *Onoron* as the work is an ordinary **-n** word (`donoron`).

> `zuzazon d@[onoron olozun] vogegum.`
>
> z-Uzazon | d-NAME.CITE[Onoron | Olozun] | v-rejection
>
> "Uzazon dislikes Onoron Olozun." (the work)

> <code>zuzazon glelen d&lt;onodan&gt; vogegum.</code>
>
> z-Uzazon | [gl-NAME.MENTION | d-OPAQUE["onodan"]] | v-rejection
>
> "Uzazon dislikes the name “onoron.”" (not the work)

**Compare with:** `donoron` is *Onoron* (the work or person). <code>glelen d&lt;onodan&gt;</code> is only the **name**.

The marker is read as a marker only when it stands **directly before a span**. Anywhere else the same spelling is the ordinary adjective *lettered*. A mention marker does not go under `/y/`: a call or a reaction is not about a spelling. A `/w/` word is never a marker either, because `/w/` grades a `/ɡ/`, `/h/`, or `/th/` word, never a noun.

A marker before a [topic span](#topic-quotes) works the same way:

> <code>glelel x&lt;odoga&gt; zozan gumazom.</code>
>
> [gl-MENTION | x-OPAQUE["odoga"]] | z-TOPIC | g-small
>
> "Now, about the word “odozo”: it is small."

### A span is an ordinary noun {#span-noun}

A span fills a role like any noun, so a [role pointer](pronouns.md#role-pointers) for that role can point back to it. After a cite, `duxar` is *that quote*: the latest thing done to.

> `zolozun d[uzazon] vezeyel. zehalon duxar vuruyel.`
>
> z-Olozun | d-CITE[Uzazon] | v-tell . z-Ehalon | d-←patient.same | v-write
>
> "Olozun said “Uzazon.” Ehalon wrote that down."

The same holds for a loan word or any other span, and `duxal` is [another one](pronouns.md#a-new-one) of what the span holds.

An aside gives role pointers nothing to point back to. A [tag](pronouns.md#tag-pronouns) assigned inside a cite or an aside does not hold outside it, and a pointer outside never reaches a word inside one.

A span in a `/v/` slot (`v[vuzahul]`) has no resume pronoun.

### Spans before the noun (`gl`) {#gl-spans}

A span on `/ɡ/` can also come **before** its noun, the way a [`gl-` adjective](clause.md#left-bound-adjectives) does: write **`gl`** before the bracket. It describes the next noun, so a noun must follow it. A noun aside before the noun (`gl(…)`) keeps the spot after the noun free for a plain adjective that picks out which one.

> `gl(gerolol) zodozol gumazom voworel.`
>
> [gl-ASIDE[g-red] | z-dog | g-small] | v-walk
>
> "The small dog (it is red) walks."

A loan adjective or a cite leans the same way:

> <code>gl&lt;rouge&gt; zodozol voworel.</code>
>
> [gl-OPAQUE["rouge"] | z-dog] | v-walk
>
> "A rouge dog walks."

**Compare with:** the [mention](#mention) marker is a `gl-` **word** before a span (<code>glelel z&lt;onoda&gt;</code>), not `gl` on the span itself.

### One of a title (`^@`) {#one-of-a-title}

A span with **`@`** names the work or product itself: <code>d@&lt;iPhone&gt;</code> is the iPhone as a product. For one thing that name applies to (one phone, one copy of a book, one performance of a song), write **`^@`** in the mark slot instead. It is the span's form of the [**-ln**](word-endings.md#name-instance--ln) ending, and like **-ln** it brings a new thing into the conversation. (cue: **^** points up to the name the thing falls under)

> <code>zolozun d^@&lt;iPhone&gt; vanobol.</code>
>
> z-Olozun | d-NAME.OPAQUE.instance["iPhone"] | v-see
>
> "Olozun sees an iPhone."

| Egabon | Use | English |
|--------|-----|---------|
| <code>d@&lt;iPhone&gt;</code> | the named product | *the iPhone* |
| <code>d^@&lt;iPhone&gt;</code> | one unit of it | *an iPhone* |
| `d@[onoron olozun]` | the named work | *Onoron Olozun* |
| `d^@[onoron olozun]` | one copy or performance of it | *a copy of Onoron Olozun* |
| `d~^@[onoron olozun]` | one copy of a work titled roughly that | *a copy of something like Onoron Olozun* |

### Act words in a quote {#quote-acts}

A quoted question or command keeps its own [act word](speech-moves.md#speech-act-statement-question-command) inside the cite, the same way it keeps a tone mark. The outer sentence is still your claim (*said*), and `yol` or `yel` belongs to the quoted talk.

> `zuzazon d[yol zolozun voworel] vezeyel.`
>
> z-Uzazon | d-CITE[y-question | z-Olozun | v-walk] | v-tell
>
> "Uzazon said, “Does Olozun walk?”"

### Topics in a quote {#topic-quotes}

A cite holds someone else's words, so a [topic](pronouns.md#topic) never carries into it or out of it. The inside of a cite starts with no topic, no [tags](pronouns.md#tag-pronouns), and its own targets for [role pointers](pronouns.md#role-pointers), and may open with a topic word of its own. When the cite ends, your own topic and tags are as they were.

A cite or opaque span can also be a topic word itself, under `/x/`: a titled work, a word as spelling (with the mention marker before it), or a foreign name.

> `x@[onoron olozun] dozan vezeyol.`
>
> x-NAME.CITE[Onoron | Olozun] | d-TOPIC | v-sing
>
> "Now, about Onoron Olozun: it is sung."

> <code>x@&lt;Sam&gt; zozan voworel.</code>
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

> `zuzazon { hegegom zodozol gerolol } vanobol.`
>
> z-Uzazon | SCOPE[h-possibility | [z-dog | g-red]] | v-see
>
> "Uzazon saw what was possibly a red dog."

Here **`hegegom`** reaches only *a red dog*, not the seeing.

A [tone mark](speech-moves.md#tone-marks) written right before the opening brace colors the whole island (`!{ hegegom zodozol gerolol }`).

**Compare with:** quoting, asides, mentions, and opaque blobs use [spans](#writing) (`d[…]`, `th(…)`, <code>d&lt;…&gt;</code>). Islands only group so a binder inside can target that chunk.

- No role letter on the edges.
- **At most one phrase.** After its binder, an island holds at most one phrase: a `/z/`, `/d/`, or `/b/` noun phrase, a `/v/` verb phrase, or a `/ɡ/` stack, with that phrase’s own adjectives, `/w/` detail, and join. An `/h/` word is a binder, never the phrase.
- **It may close early.** The island can stop partway through its phrase; the pause marks where. By the end of the phrase at the latest, it has closed: a new role letter or the outer join always comes after the island.
- **Hosts keep their `/b/`.** A host (`/ɡ/`, `/h/`, `/th/`) and its hosted `/b/` are both inside the island or both outside.
- **One island per clause.** Islands do not nest.
- Empty `{ }` has no reading.
- **Binder required:** at least one scope-taking `/h/` or `/th/` and/or a [join](joins.md#scope-islands-join) particle **inside**. A [hook](hooks.md) is never a binder. A hook already reaches its whole stretch: `/w/` right before it grades the [whole span](hooks.md#spans), and a hook after a noun belongs to that noun.
- Prefer spaces inside: `{ hegegom zodozol gerolol }`.

| Binder | Use inside the island |
|--------|------------------------|
| Scope-taking **`/h/`** or **`/th/`** | frames that **chunk** (prefer first in the island; see the `/b/` exception below) |
| Prefixed **join** | joins **only** matching-role material **inside** ([scope islands](joins.md#scope-islands-join)) |

`/h/` and a join may share one island (`{ hegegom zuzazon zolozun zam }`).

| Placement | Reading |
|-----------|---------|
| `/h/` or `/th/` **inside** | frames that chunk |
| `/h/` or `/th/` **outside** | ordinary floating word: frames the verb / clause |
| Join **inside** | joins only interior conjuncts |
| Join **outside** with island nearby | ordinary lookback (edges do not filter an outside join) |

> `zuzazon { zolozun zal } zam voworel.`
>
> [z-Uzazon | SCOPE[z-Olozun | z-and] | z-and.open] | v-walk
>
> "Uzazon and (just Olozun) walk."

A `/b/` right after an `/h/` word is hosted by it ([extra nouns](clause.md#extra-nouns)). To put a recipient `/b/` in an island, write it **before** the binder:

> `zuzazon { bolozun hegegom } vezeyel.`
>
> z-Uzazon | SCOPE[b-Olozun | h-possibility] | v-tell
>
> "Uzazon talks, possibly to Olozun."

The word before the island must not be a `/ɡ/`, `/h/`, or `/th/` word either, or it would host that `/b/` across the edge.

An island can hold part of a phrase. Here only *not small* is grouped, so **`gul`** denies *small* alone and **`gal`** adds it to *red*:

> `zodozol gerolol { gumazom gul } gal voworel.`
>
> [z-dog | [g-red | SCOPE[g-small | g-not] | g-and]] | v-walk
>
> "A dog that is red and not small walks."

**Speech:** reset your pitch briefly as the island starts, say it as one tight phrase, and pause after its last word. In singing, shape it like any other phrase. Because an island never runs past one phrase, a listener who misses the closing pause is off by at most part of that phrase.

### Practice {#intermediate-practice}

Short drills for Intermediate. Try each item before opening **Show answer**.

**Setting:** a courtroom

**New words:**

| English | Egabon | Cue |
|---------|--------|-----|
| *rejection* | `vogegum` | ❌ from *cross* |
| *possibility* | `hegegom` | ❓ from *question mark* |
| *letters* | `glelel` | 🔤: a word is its letters |

**Review:**

| English | Egabon |
|---------|--------|
| *Uzazon* | `uzazon` |
| *Olozun* | `olozun` |
| *Ehalon* | `ehalon` |
| *topic* | `ozan` |
| *Onoron* | `onoron` |
| *attest* | `vodol` |
| *lie* | `vulamul` |
| *small* | `gumazom` |
| *tell* | `vezeyel` |
| *write* | `vuruyel` |
| *see* | `vanobol` |
| *punch* | `vabavul` |
| *walk* | `voworel` |

#### English → Egabon {#intermediate-english-to-egabon}

**1.** *Olozun said “Uzazon attests.”*

::: details Show answer
`zolozun d[zuzazon vodol] vezeyel.`

z-Olozun | d-CITE[z-Uzazon | v-attest] | v-tell
:::

**2.** *Olozun said “Uzazon.” Ehalon wrote that down.* (*that* is the quote)

::: details Show answer
`zolozun d[uzazon] vezeyel. zehalon duxar vuruyel.`

z-Olozun | d-CITE[Uzazon] | v-tell . z-Ehalon | d-←patient.same | v-write
:::

**3.** *The word “onoda” is small.*

::: details Show answer
<code>glelel z&lt;onoda&gt; gumazom.</code>

[gl-MENTION | z-OPAQUE["onoda"]] | g-small
:::

**4.** *Uzazon said, “Does Olozun lie?”*

::: details Show answer
`zuzazon d[yol zolozun vulamul] vezeyel.`

z-Uzazon | d-CITE[y-question | z-Olozun | v-lie] | v-tell
:::

**5.** *Ehalon sees a copy of Onoron Olozun.*

::: details Show answer
`zehalon d^@[onoron olozun] vanobol.`

z-Ehalon | d-NAME.CITE.instance[Onoron | Olozun] | v-see
:::

**6.** *Olozun talks, possibly to Ehalon.*

::: details Show answer
`zolozun { behalon hegegom } vezeyel.`

z-Olozun | SCOPE[b-Ehalon | h-possibility] | v-tell
:::

#### Egabon → English {#intermediate-egabon-to-english}

**1.** <code>zuzazon glelen d&lt;onodan&gt; vogegum.</code>

::: details Show answer
z-Uzazon | [gl-NAME.MENTION | d-OPAQUE["onoron"]] | v-rejection

*Uzazon dislikes the name “onoron.”* (not the work)
:::

**2.** `x@[onoron olozun] zolozun dozan vogegum.`

::: details Show answer
x-NAME.CITE[Onoron | Olozun] | z-Olozun | d-TOPIC | v-rejection

*Now, about Onoron Olozun: Olozun dislikes it.*
:::

**3.** `zehalon d~[zuzazon vodol] vezeyel.`

::: details Show answer
z-Ehalon | d-CITE.about[z-Uzazon | v-attest] | v-tell

*Ehalon said something like “Uzazon attests.”*
:::

**4.** `zolozun { zuzazon zal } zam vabavul.`

::: details Show answer
[z-Olozun | SCOPE[z-Uzazon | z-and] | z-and.open] | v-punch

*Olozun and (just Uzazon) punched.*
:::


**5.** `zehalon !{ hegegom dulamul } vanobol.`

::: details Show answer
z-Ehalon | !SCOPE[h-possibility | d-lie] | v-see

*Ehalon saw what was possibly a lie!*
:::

**6.** `gl(gumazom) zolozun duzazon vabavul.`

::: details Show answer
[gl-ASIDE[g-small] | z-Olozun] | d-Uzazon | v-punch

*Olozun, who is small, punches Uzazon.*
:::

#### Pick one {#intermediate-pick-one}

**1.** *Uzazon dislikes Onoron Olozun.* (the work) `zuzazon d@[onoron olozun] vogegum.` or `zuzazon d[onoron olozun] vogegum.`

::: details Show answer
`zuzazon d@[onoron olozun] vogegum.`

z-Uzazon | d-NAME.CITE[Onoron | Olozun] | v-rejection

**`@`** makes the span the work; bare brackets quote the words.
:::

**2.** *Uzazon saw what was possibly a lie.* `zuzazon { hegegom dulamul } vanobol.` or `zuzazon hegegom dulamul vanobol.`

::: details Show answer
`zuzazon { hegegom dulamul } vanobol.`

z-Uzazon | SCOPE[h-possibility | d-lie] | v-see

Inside braces, **`hegegom`** reaches only that chunk; outside, it frames the whole seeing.
:::

#### Fix it {#intermediate-fix-it}

**1.** *Uzazon said, “Does Olozun walk?”* <!-- lint: error -->`yol zuzazon d[zolozun voworel] vezeyel.`

::: details Show answer
`zuzazon d[yol zolozun voworel] vezeyel.`

z-Uzazon | d-CITE[y-question | z-Olozun | v-walk] | v-tell

The quoted question keeps its act word inside the cite; **`yol`** outside asks whether Uzazon said it.
:::

## Advanced {#advanced}

### Editorial close and close-all {#close-forms-complete-editorial-close-all}

A closing bracket normally ends one span, with its wording complete. Two written marks, placed just **inside** the closing bracket, change that. **`#`** keeps the wording as written but shows that it is cut off, trails off, or is faulty (*Uzazon said “bug…”*). **`|`** closes every span still open around it at once.

> `zuzazon d[ubazom#] vezeyel.`
>
> z-Uzazon | d-CITE[flaw]# | v-tell
>
> "Uzazon said “bug…”"

| Writing | Use | English | Cue |
|---------|-----|---------|-----|
| `d[…]` | close **one** span, whole | the matching closer | the bracket closes it |
| `d[…#]` | **editorial**: wording kept as written, cut off or defective | trailing off | **#** a note on the text |
| `d[…|]` | close **all** open spans | sweep everything | **\|** one bar through every bracket |
| `d[…#|]` | editorial, then close all | | write `#` first, then `\|` |

An editorial span still counts as quoted: a role pointer can reach it as it reaches any cite.

### Nesting {#nesting}

When one packaged chunk sits inside another (a quote that contains a parenthetical, or a cite wrapping an opaque blob), the spans nest, and each one closes with its own bracket.

> `zuzazon d[ th(hogawol) uzazon ] vezeyel.`
>
> z-Uzazon | d-CITE[th-ASIDE[h-quiet] | Uzazon] | v-tell
>
> "Uzazon said “(quietly) Uzazon.”" (hello)

The same nest works as <code>d[ z&lt;…&gt; ]</code> or <code>d~[ d&lt;…&gt; ]</code>.

### Practice {#advanced-practice}

Short drills for Advanced. Try each item before opening **Show answer**.

**Setting:** a code review

**New words:**

| English | Egabon | Cue |
|---------|--------|-----|
| *flaw* | `ubazom` | 🐛 from *bug* |

**Review:**

| English | Egabon |
|---------|--------|
| *Uzazon* | `uzazon` |
| *Olozun* | `olozun` |
| *Ehalon* | `ehalon` |
| *page* | `ebogol` |
| *tell* | `vezeyel` |
| *write* | `vuruyel` |
| *see* | `vanobol` |

#### English → Egabon {#advanced-english-to-egabon}

**1.** *Olozun said “flaw…”* (the quote trails off)

::: details Show answer
`zolozun d[ubazom#] vezeyel.`

z-Olozun | d-CITE[flaw]# | v-tell
:::

**2.** *Uzazon wrote “(quietly) flaw.”*

::: details Show answer
`zuzazon d[ th(hogawol) ubazom ] vuruyel.`

z-Uzazon | d-CITE[th-ASIDE[h-quiet] | flaw] | v-write
:::

**3.** *Ehalon said “flaw…”* (the quote trails off; close every open bracket at once)

::: details Show answer
`zehalon d[ubazom#|] vezeyel.`

z-Ehalon | d-CITE[flaw]#| | v-tell
:::

**4.** *Uzazon sees “flaw…” on the page.*

::: details Show answer
`zuzazon d[ubazom#] vanobol aol bebogol.`

z-Uzazon | d-CITE[flaw]# | v-see | [on | b-page]
:::

#### Egabon → English {#advanced-egabon-to-english}

**1.** `zehalon d[ubazom] vuruyel.`

::: details Show answer
z-Ehalon | d-CITE[flaw] | v-write

*Ehalon wrote “flaw.”*
:::

**2.** `zolozun d[ th(hogawol) zuzazon vuruyel ] vezeyel.`

::: details Show answer
z-Olozun | d-CITE[th-ASIDE[h-quiet] | z-Uzazon | v-write] | v-tell

*Olozun said, “(quietly) Uzazon writes.”*
:::

**3.** `zuzazon d[zolozun vuruyel#] vezeyel.`

::: details Show answer
z-Uzazon | d-CITE[z-Olozun | v-write]# | v-tell

*Uzazon said “Olozun writes…”*
:::

**4.** `zolozun d[ubazom#] vezeyel. zehalon duxar vuruyel.`

::: details Show answer
z-Olozun | d-CITE[flaw]# | v-tell . z-Ehalon | d-←patient.same | v-write

*Olozun said “flaw…” Ehalon wrote that down.*
:::

#### Pick one {#advanced-pick-one}

**1.** *Ehalon said “flaw…”* (the quote trails off) `zehalon d[ubazom#] vezeyel.` or `zehalon d[ubazom] vezeyel.`

::: details Show answer
`zehalon d[ubazom#] vezeyel.`

z-Ehalon | d-CITE[flaw]# | v-tell

**`#`** inside the closer keeps the wording but marks it cut off; a plain closer says it is complete.
:::

#### What changes {#advanced-what-changes}

**1.** `zuzazon d[ubazom#] vezeyel.` / `zuzazon d[ubazom#|] vezeyel.`

::: details Show answer
z-Uzazon | d-CITE[flaw]# | v-tell

z-Uzazon | d-CITE[flaw]#| | v-tell

Both quotes trail off; with **`|`**, the closer also shuts every span still open.
:::

## See also

- Scope islands: [joins.md](joins.md#scope-islands-join)
- Identity vs parenthetical comment: [predication.md](predication.md#identity)
- Multipart names: [word-endings.md](word-endings.md#multipart-names)
- Titled phrases (hook / join / span): [word-endings.md](word-endings.md#titled-phrases)
- Prefix-less citation outside a clause: [word-endings.md](word-endings.md#citation-forms)
