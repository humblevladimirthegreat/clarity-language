# Spans

Some parts of a sentence are not ordinary Agebon words: a quote of what someone said, a word from another language, a comment in parentheses. Agebon sets such a part apart as a **span**: a role letter, then a pair of brackets around the words. The role letter says what the whole bracketed chunk does in the sentence (subject, object, verb, adverb, and so on), so the rest of the sentence reads as usual. A span is written only: speech has no word for its open or close.

## Beginner {#beginner}

Start with a quote of what someone said.

### Cite (`[…]`) {#writing}
<a id="writing-vs-speech"></a>

To quote wording (what someone said, a title, a proverb as words), write the role letter, then square brackets around the quoted words. That span is a **cite**. The whole quote fills one role, so *said “…”* works like *said something*. (cue: `[…]` like quote marks)

Start with a one-word quote as the object of *said*. A [greeting](word-endings.md#greeting) is just your own name, so quoting Uzozen’s hello means quoting that name:

> `zuzozen d[uzozen] vezuyel.`
>
> z-Uzozen | d-CITE[Uzozen] | v-tell
>
> "Uzozen said “Uzozen.”" (hello)

The whole `d[uzozen]` is the direct object (who or what is acted on). When the quote is a whole Agebon sentence, each word inside starts with its own role letter, as in any sentence.

### Exact, paraphrase, proper
<a id="when-required"></a>

You can mark how faithful the quote is. Put the mark **after** the role letter, before the opening bracket.

A span with no mark is **exact**: the words as they were said (`d[uzozen]`). Write **`~`** for a **paraphrase**, when you mean the gist, not the exact words (`d~[zuzozen vezuyol]`). Write **`@`** for a **proper** span: it names a work with a title of several words, such as a song, proverb, or book (`d@[onuron olazun]`). The span then means the work itself, not its title as a string of words.

A work or person with a one-word name is an ordinary **-n** word (`donuron`), not `d@[onuron]`, unless a role letter or an ending is part of the title itself. The mark belongs to the brackets; the words inside keep their usual endings ([titled phrases](word-endings.md#titled-phrases)).

<!-- cheat-sheet: restrictors-spans -->
| Agebon | Use | English | Cue |
|--------|-----|---------|-----|
| *(none)* | exact | verbatim wording | bare brackets already quote; extra ink would hedge |
| **`~`** | paraphrase | the gist, not the exact words | **~** looks like “about / approximately” |
| **`@`** | proper | the work known by that title | **@** like a social media handle |

> `zolazun d~[zuzozen vezuyol] varayel.`
>
> z-Olazun | d-CITE.about[z-Uzozen | v-sing] | v-write
>
> "Olazun wrote something like “Uzozen sings.”"

> `zuhelan d@[onuron olazun] vezuyol.`
>
> z-Uhelan | d-NAME.CITE[Onuron | Olazun] | v-sing
>
> "Uhelan sang Onuron Olazun."

**`~`** and **`@`** combine, `~` first: the span still names the work, but the title is only roughly that. Use it when you remember a title loosely.

> `zuhelan d~@[onuron olazun] vezuyol.`
>
> z-Uhelan | d-NAME.CITE.about[Onuron | Olazun] | v-sing
>
> "Uhelan sang that song called something like Onuron Olazun."

### Opaque and loan words {#loans}

To use a word from another language, a bit of code, or any spelling that is not Agebon, write the role letter, then angle brackets around it. That span is **opaque**: the inside is taken exactly as spelled and is not read as Agebon words. Write no letter after the closing `>`. The faithfulness marks are the same as on a cite: none, **`~`**, or **`@`**.

> <code>zuzozen d&lt;kimchi&gt; vawebol.</code>
>
> z-Uzozen | d-OPAQUE["kimchi"] | v-see
>
> "Uzozen saw kimchi." (a foreign word)

Inside <code>&lt;&gt;</code>, keep the source’s capital letters when its writing system has them (<code>d&lt;NaCl&gt;</code>, <code>d@&lt;iPhone&gt;</code>). Agebon letters outside the brackets are always [lowercase](phonology.md#beginner). Use **`@`** when the bracketed word is a name or title.

When the lexicon already has a matching root, write the ordinary word (`dagozol`), not a span.

On its own, outside a sentence, a foreign name or word is written with no role letter: just the marks and the brackets (<code>@&lt;Sam&gt;</code>), like other [citation forms](word-endings.md#citation-forms). In a sentence the span fills a role, so it takes a role letter (<code>z@&lt;Sam&gt;</code>).

### Calls and reactions (`/y/`) {#y-spans}

To call someone by a foreign name (*Sam!*) or react with a foreign word (*Amen!*), put a span under `/y/`. Only an opaque <code>&lt;…&gt;</code> or a cite `[…]` goes there, and it opens the turn, before the act word.

The **`@`** mark decides which, as **-n** does on a native word. With **`@`**, the span calls that person (<code>y@&lt;Sam&gt;</code>, *Sam!*); add **`~`** for a name you are not sure of (<code>y~@&lt;Sam&gt;</code>). Without **`@`**, the span is a foreign [interjection](speech-moves.md#interjections) (<code>y&lt;Amen&gt;</code>, *Amen!*), exact or given as the gist with **`~`** (<code>y~&lt;Amen&gt;</code>).

### Asides (`th(…)`) {#asides-th}
<a id="asides"></a>

To add a side comment in parentheses, write a role letter, then **`(`** … **`)`**. That span is an **aside**. The role letter says what the comment is about, and the aside sits where a word with that letter sits. (cue: round parentheses, as in English)

| Agebon | Comments on | Sits |
|--------|-------------|------|
| `th(…)` | the whole sentence | anywhere a [stance](clause.md#stance-th) word may sit |
| `g(…)` | the noun before it | right after that noun, like an [adjective](clause.md#adjectives-ɡ) |
| `w(…)` | the next `/ɡ/`, `/h/`, or `/th/` word | right before that word, like [*very*](clause.md#adjective-detail-w) |
| `h(…)` | the action | anywhere an [adverb](clause.md#adverbs-h) may sit |

The inside is ordinary Agebon: a fragment, or a clause with the **same speech act** as the outer sentence (both statements, both questions, or both commands). An aside comments; it does not call anyone or react, so it never goes under `/y/`. It fills no slot of the verb either, so it never goes under `/z/`, `/d/`, `/b/`, or `/v/`.

> `zuzozen vewurel th(hogowul).`
>
> z-Uzozen | v-walk | th-ASIDE[h-quiet]
>
> "Uzozen walks (quietly)."

> `zuzozen vewurel th(zolazun vezuvol).`
>
> z-Uzozen | v-walk | th-ASIDE[z-Olazun | v-sleep]
>
> "Uzozen walks (Olazun is asleep)."

A noun aside adds something about a noun the listener already has. It does not pick out which one, the way a plain adjective can:

> `zudozol g(gerulel) vewurel.`
>
> [z-dog | g-ASIDE[g-red]] | v-walk
>
> "The dog (it is red) walks."

> `zuzozen g(zuzozer vewurel) vezuyol.`
>
> [z-Uzozen | g-ASIDE[z-←Uzozen | v-walk]] | v-sing
>
> "Uzozen, who walks, sings."

A `/w/` aside narrows the comment to one word. Here only the color is what Uzozen says:

> `zudozol w(zuzozen vezuyel) gerulel vewurel.`
>
> [z-dog | [w-ASIDE[z-Uzozen | v-tell] | g-red]] | v-walk
>
> "A (so Uzozen says) red dog walks."

An `/h/` aside is a side detail about the action itself, not about your claim:

> `zuzozen vewurel h(al babohal).`
>
> z-Uzozen | v-walk | h-ASIDE[in | b-bank]
>
> "Uzozen walks (in a bank)."

A one-word comment with nothing to package is a plain word in that slot: `zuzozen vewurel hogowul.`

**For *because* / *if*, use:** [**`barl`**](dependents.md#poles) dependents, not an aside.

**Compare with:** a second name for the same person uses [identity](predication.md#identity) (`gugo` + `/b/`). To pick out **which** noun (*the guard who sits*), use a plain adjective or [another sentence](dependents.md#which-noun), not a noun aside.

### Outer slot {#pos}

A span can fill any role a word can, not only the object. The letter before the bracket is the role of the **whole span** in the outer sentence, so ask what that chunk does there: the object of *said*, the subject of *is small*, and so on. A cite can even be the **verb**, when you echo an act as wording:

> `yul zolazun v[vozohul].`
>
> y-prohibition | z-Olazun | v-CITE[v-stop]
>
> "Don’t say “stop,” Olazun."

<!-- cheat-sheet: restrictors-spans -->
| Agebon | Use | English | Cue |
|--------|-----|---------|-----|
| `/d/` | object | *said / wrote / saw “…”* (`d[uzozen]`, <code>d&lt;kimchi&gt;</code>) | **d** ≈ done to |
| `/z/` | subject | a foreign name as the subject (<code>z@&lt;Sam&gt;</code>) | **z** ≈ star (who it is about) |
| `/b/` | extra party | a foreign name as the recipient (<code>b@&lt;Sam&gt;</code>) | **b** ≈ bolted on (the extra piece) |
| `/v/` | verb | echo the act as wording (`v[vozohul]`); a loan verb (<code>v&lt;google&gt;</code>) | **v** as in English *verb* |
| `/ɡ/` | adjective | a loan adjective (<code>g&lt;rouge&gt;</code>); an aside on the noun (`g(…)`) | **g** ≈ grade (a rating of the noun) |
| `/w/` | extra detail | a loan degree word (<code>w&lt;molto&gt;</code>); an aside on the next word (`w(…)`) | **w** ≈ with (stuck to that host) |
| `/h/` | adverb | a loan adverb (<code>h&lt;allegro&gt;</code>); an aside on the action (`h(…)`) | **h** starts *how* / *when* / *where* |
| `/th/` | stance | an aside on the sentence (`th(…)`) | **th** ≈ *think* (your side comment) |

Only an aside goes under `/th/`. An aside also goes under `/ɡ/`, `/w/`, or `/h/`, never under `/z/` `/d/` `/b/` `/v/`. A cite, mention, or opaque span fills any slot but `/th/`.

To use a foreign verb, adjective, adverb, or degree word (*googled*, *rouge*, *molto*), put an opaque span in that slot. That is a **loan word**: the role letter says how the foreign word is used, and the inside keeps its own spelling.

> <code>zolazun v&lt;google&gt; duzozen.</code>
>
> z-Olazun | v-OPAQUE["google"] | d-Uzozen
>
> "Olazun googled Uzozen." (a borrowed word)

> <code>zudozol g&lt;rouge&gt; vewurel.</code>
>
> [z-dog | g-OPAQUE["rouge"]] | v-walk
>
> "A rouge dog walks." (a borrowed word)

> <code>zuzozen vezuyel b@&lt;Sam&gt;.</code>
>
> z-Uzozen | v-tell | b-NAME.OPAQUE["Sam"]
>
> "Uzozen talks to Sam." (a foreign name)

The letter before the bracket belongs to the whole span. Agebon words inside a cite start with **their own** role letters.

### Practice {#beginner-practice}

Short drills for Beginner. Try each item before opening **Show answer**.

**Setting:** a rehearsal

**New words:**

| English | Agebon | Cue |
|---------|--------|-----|
| *dance* | `vayurel` | 🕺 |
| *stop* | `vozohul` | 🛑 |
| *quiet* | `ogowul` | 🔈 |
| *Ogoron* | `ogoron` | 🎸 from *guitar*: a dance's name |
| *Sam* | <code>@&lt;Sam&gt;</code> | a foreign name |
| *google* | <code>v&lt;google&gt;</code> | a loan verb |
| *Bravo* | <code>&lt;Bravo&gt;</code> | a foreign word |

**Review:**

| English | Agebon |
|---------|--------|
| *Uzozen* | `uzozen` |
| *Olazun* | `olazun` |
| *Uhelan* | `uhelan` |
| *tell* | `vezuyel` |
| *write* | `varayel` |
| *walk* | `vewurel` |

#### English → Agebon {#beginner-english-to-agebon}

**1.** *Uzozen said “Uzozen.”* (hello)

::: details Show answer
`zuzozen d[uzozen] vezuyel.`

z-Uzozen | d-CITE[Uzozen] | v-tell
:::

**2.** *Olazun wrote something like “Uhelan dances.”*

::: details Show answer
`zolazun d~[zuhelan vayurel] varayel.`

z-Olazun | d-CITE.about[z-Uhelan | v-dance] | v-write
:::

**3.** *Olazun talks to Sam.* (a foreign name)

::: details Show answer
<code>zolazun vezuyel b@&lt;Sam&gt;.</code>

z-Olazun | v-tell | b-NAME.OPAQUE["Sam"]
:::

**4.** *Don’t say “stop,” Uzozen.*

::: details Show answer
`yul zuzozen v[vozohul].`

y-prohibition | z-Uzozen | v-CITE[v-stop]
:::

**5.** *Sam, does Uzozen dance?*

::: details Show answer
<code>y@&lt;Sam&gt; yol zuzozen vayurel.</code>

y-NAME.OPAQUE["Sam"] | y-question | z-Uzozen | v-dance
:::

**6.** *Olazun walks (quietly).*

::: details Show answer
`zolazun vewurel th(hogowul).`

z-Olazun | v-walk | th-ASIDE[h-quiet]
:::

#### Agebon → English {#beginner-agebon-to-english}

**1.** `zolazun d@[ogoron olazun] varayel.`

::: details Show answer
z-Olazun | d-NAME.CITE[Ogoron | Olazun] | v-write

*Olazun wrote Ogoron Olazun.* (the work)
:::

**2.** <code>zolazun v&lt;google&gt; dogoron.</code>

::: details Show answer
z-Olazun | v-OPAQUE["google"] | d-Ogoron

*Olazun googled Ogoron.* (a borrowed word)
:::

**3.** `zuhelan g(zuhelar vayurel) vewurel.`

::: details Show answer
[z-Uhelan | g-ASIDE[z-←Uhelan | v-dance]] | v-walk

*Uhelan, who dances, walks.*
:::

**4.** <code>y&lt;Bravo&gt;.</code>

::: details Show answer
y-OPAQUE["Bravo"]

*Bravo!* (a foreign word)
:::

**5.** `zuhelan d~@[ogoron olazun] vayurel.`

::: details Show answer
z-Uhelan | d-NAME.CITE.about[Ogoron | Olazun] | v-dance

*Uhelan danced the piece called something like Ogoron Olazun.*
:::

**6.** `zuhelan d[vozohul] vezuyel.`

::: details Show answer
z-Uhelan | d-CITE[v-stop] | v-tell

*Uhelan said “stop.”*
:::

#### Pick one {#beginner-pick-one}

**1.** *Uhelan danced Ogoron Olazun.* (the dance) `zuhelan d@[ogoron olazun] vayurel.` or `zuhelan d[ogoron olazun] vayurel.`

::: details Show answer
`zuhelan d@[ogoron olazun] vayurel.`

z-Uhelan | d-NAME.CITE[Ogoron | Olazun] | v-dance

**`@`** makes the span the work itself; bare brackets quote the words.
:::

**2.** *Uzozen said “Olazun stops.”* `zuzozen d[zolazun vozohul] vezuyel.` or `zuzozen vezuyel th(zolazun vozohul).`

::: details Show answer
`zuzozen d[zolazun vozohul] vezuyel.`

z-Uzozen | d-CITE[z-Olazun | v-stop] | v-tell

What was said is the object, so it is a cite in `/d/`; an aside only comments on the sentence.
:::

#### Fix it {#beginner-fix-it}

**1.** *Olazun danced Ogoron.* (a work with a one-word name) <!-- lint: error -->`zolazun d@[ogoron] vayurel.`

::: details Show answer
`zolazun dogoron vayurel.`

z-Olazun | d-Ogoron | v-dance

A one-word name is an ordinary **-n** word; **`@[…]`** is for titles of several words.
:::

## Intermediate {#intermediate}

### Written only {#written-only}

A span has **no spoken form**: there is no word for its open or close, and no spoken resume for it. When you read a span aloud, you say the words inside it, and say its marks as words.

Apart from what is inside, `[…]` and <code>&lt;…&gt;</code> work the same way: the same role letters, the same slots, the same **`~`** / **`@`** marks, the same topic and `/y/` rules. The one difference is whether the inside is read as Agebon. Use `[…]` when the inside is Agebon, and <code>&lt;…&gt;</code> when it is foreign, code, or a name you do not want read as Agebon.

### Mention {#mention}

To talk about a word or phrase itself, as a spelling (*the word “udozo” is small*), put the **mention marker** before a span. That is a **mention**: it is about the letters, not what they mean, and not a quote of what someone said (for that, use a [cite](#writing)). The marker is a [left-bound adjective](clause.md#left-bound-adjectives), so a listener hears *this is a word as spelling* before the span arrives. In English, write *the word …* or *the phrase …* and keep the Agebon spelling (`udozo`, not *dog*).

The marker is the *letters* root `ele` as a `gl-` adjective, on **-l** (`glelel`) or **-n** (`glelen`). (cue: 🔤 a word is its letters)

| Agebon | Reading |
|--------|---------|
| **`glelel`** | the word or phrase as spelling |
| **`glelen`** | the name-string: a name as spelling |

The span is a [cite](#writing) `[…]` when the spelling is Agebon, and an [opaque](#loans) <code>&lt;…&gt;</code> when it is not. Either way, the marker plus the span fills a slot like any noun:

> `glelel z[udozo] gamezom.`
>
> [gl-MENTION | z-CITE["udozo"]] | g-small
>
> "The word “udozo” is small."

> `glelel z[zuzozen vezuyol] gamezom.`
>
> [gl-MENTION | z-CITE[z-Uzozen | v-sing]] | g-small
>
> "The phrase “zuzozen vezuyol” is small."

> <code>glelel z&lt;kimchi&gt; gamezom.</code>
>
> [gl-MENTION | z-OPAQUE["kimchi"]] | g-small
>
> "The word “kimchi” is small." (a foreign word)

With **-n**, the mention is a **name** as spelling (the title, which could be changed), even when it is **one word**: `glelen d[onuron]` is not `donuron`. A cite with **`@`** is the **work**, and that span is for a title of **several words** (`d@[onuron olazun]`). The one-word *Onuron* as the work is an ordinary **-n** word (`donuron`).

> `zuzozen d@[onuron olazun] vegugum.`
>
> z-Uzozen | d-NAME.CITE[Onuron | Olazun] | v-rejection
>
> "Uzozen dislikes Onuron Olazun." (the work)

> `zuzozen glelen d[onuron] vegugum.`
>
> z-Uzozen | [gl-NAME.MENTION | d-CITE[Onuron]] | v-rejection
>
> "Uzozen dislikes the name “onuron.”" (not the work)

**Compare with:** `donuron` is *Onuron* (the work or person). `glelen d[onuron]` is only the **name**.

The marker is read as a marker only when it stands **directly before a span**. Anywhere else the same spelling is the ordinary adjective *lettered*. A mention marker does not go under `/y/`: a call or a reaction is not about a spelling. A `/w/` word is never a marker either, because `/w/` grades a `/ɡ/`, `/h/`, or `/th/` word, never a noun.

A marker before a [topic span](#topic-quotes) works the same way:

> `glelel x[udozo] zozan gamezom.`
>
> [gl-MENTION | x-CITE["udozo"]] | z-TOPIC | g-small
>
> "Now, about the word “udozo”: it is small."

### A span is an ordinary noun {#span-noun}

A span fills a role like any noun, so a [role pointer](pronouns.md#role-pointers) for that role can point back to it. After a cite, `duxar` is *that quote*: the latest thing done to.

> `zolazun d[uzozen] vezuyel. zuhelan duxar varayel.`
>
> z-Olazun | d-CITE[Uzozen] | v-tell . z-Uhelan | d-←patient.same | v-write
>
> "Olazun said “Uzozen.” Uhelan wrote that down."

The same holds for a loan word or any other span, and `duxal` is [another one](pronouns.md#a-new-one) of what the span holds.

An aside gives role pointers nothing to point back to. A [tag](pronouns.md#tag-pronouns) assigned inside a cite or an aside does not hold outside it, and a pointer outside never reaches a word inside one.

A span in a `/v/` slot (`v[vozohul]`) has no resume pronoun.

### Spans before the noun (`gl`) {#gl-spans}

A span on `/ɡ/` can also come **before** its noun, the way a [`gl-` adjective](clause.md#left-bound-adjectives) does: write **`gl`** before the bracket. It describes the next noun, so a noun must follow it. A noun aside before the noun (`gl(…)`) keeps the spot after the noun free for a plain adjective that picks out which one.

> `gl(gerulel) zudozol gamezom vewurel.`
>
> [gl-ASIDE[g-red] | z-dog | g-small] | v-walk
>
> "The small dog (it is red) walks."

A loan adjective or a cite leans the same way:

> <code>gl&lt;rouge&gt; zudozol vewurel.</code>
>
> [gl-OPAQUE["rouge"] | z-dog] | v-walk
>
> "A rouge dog walks."

**Compare with:** the [mention](#mention) marker is a `gl-` **word** before a span (`glelel z[udozo]`), not `gl` on the span itself.

### One of a title (`^@`) {#one-of-a-title}

A span with **`@`** names the work or product itself: <code>d@&lt;iPhone&gt;</code> is the iPhone as a product. For one thing that name applies to (one phone, one copy of a book, one performance of a song), write **`^@`** in the mark slot instead. It is the span's form of the [**-ln**](word-endings.md#name-instance--ln) ending, and like **-ln** it brings a new thing into the conversation. (cue: **^** points up to the name the thing falls under)

> <code>zolazun d^@&lt;iPhone&gt; vawebol.</code>
>
> z-Olazun | d-NAME.OPAQUE.instance["iPhone"] | v-see
>
> "Olazun sees an iPhone."

| Agebon | Use | English |
|--------|-----|---------|
| <code>d@&lt;iPhone&gt;</code> | the named product | *the iPhone* |
| <code>d^@&lt;iPhone&gt;</code> | one unit of it | *an iPhone* |
| `d@[onuron olazun]` | the named work | *Onuron Olazun* |
| `d^@[onuron olazun]` | one copy or performance of it | *a copy of Onuron Olazun* |
| `d~^@[onuron olazun]` | one copy of a work titled roughly that | *a copy of something like Onuron Olazun* |

### Act words in a quote {#quote-acts}

A quoted question or command keeps its own [act word](speech-moves.md#speech-act-statement-question-command) inside the cite, the same way it keeps a tone mark. The outer sentence is still your claim (*said*), and `yol` or `yel` belongs to the quoted talk.

> `zuzozen d[yol zolazun vewurel] vezuyel.`
>
> z-Uzozen | d-CITE[y-question | z-Olazun | v-walk] | v-tell
>
> "Uzozen said, “Does Olazun walk?”"

### Topics in a quote {#topic-quotes}

A cite holds someone else's words, so a [topic](pronouns.md#topic) never carries into it or out of it. The inside of a cite starts with no topic, no [tags](pronouns.md#tag-pronouns), and its own targets for [role pointers](pronouns.md#role-pointers), and may open with a topic word of its own. When the cite ends, your own topic and tags are as they were.

A cite or opaque span can also be a topic word itself, under `/x/`: a titled work, a word as spelling (with the mention marker before it), or a foreign name.

> `x@[onuron olazun] dozan vezuyol.`
>
> x-NAME.CITE[Onuron | Olazun] | d-TOPIC | v-sing
>
> "Now, about Onuron Olazun: it is sung."

> <code>x@&lt;Sam&gt; zozan vewurel.</code>
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

> `zuzozen { hegugom zudozol gerulel } vawebol.`
>
> z-Uzozen | SCOPE[h-possibility | [z-dog | g-red]] | v-see
>
> "Uzozen saw what was possibly a red dog."

Here **`hegugom`** reaches only *a red dog*, not the seeing.

A [tone mark](speech-moves.md#tone-marks) written right before the opening brace colors the whole island (`!{ hegugom zudozol gerulel }`).

**Compare with:** quoting, asides, mentions, and opaque blobs use [spans](#writing) (`d[…]`, `th(…)`, <code>d&lt;…&gt;</code>). Islands only group so a binder inside can target that chunk.

- No role letter on the edges.
- **At most one phrase.** After its binder, an island holds at most one phrase: a `/z/`, `/d/`, or `/b/` noun phrase, a `/v/` verb phrase, or a `/ɡ/` stack, with that phrase’s own adjectives, `/w/` detail, and join. An `/h/` word is a binder, never the phrase.
- **It may close early.** The island can stop partway through its phrase; the pause marks where. By the end of the phrase at the latest, it has closed: a new role letter or the outer join always comes after the island.
- **Hosts keep their `/b/`.** A host (`/ɡ/`, `/h/`, `/th/`) and its hosted `/b/` are both inside the island or both outside.
- **One island per clause.** Islands do not nest.
- Empty `{ }` has no reading.
- **Binder required:** at least one scope-taking `/h/` or `/th/` and/or a [join](joins.md#scope-islands-join) particle **inside**. A [hook](hooks.md) is never a binder. A hook already reaches its whole stretch: `/w/` right before it grades the [whole span](hooks.md#spans), and a hook after a noun belongs to that noun.
- Prefer spaces inside: `{ hegugom zudozol gerulel }`.

| Binder | Use inside the island |
|--------|------------------------|
| Scope-taking **`/h/`** or **`/th/`** | frames that **chunk** (prefer first in the island; see the `/b/` exception below) |
| Prefixed **join** | joins **only** matching-role material **inside** ([scope islands](joins.md#scope-islands-join)) |

`/h/` and a join may share one island (`{ hegugom zuzozen zolazun zam }`).

| Placement | Reading |
|-----------|---------|
| `/h/` or `/th/` **inside** | frames that chunk |
| `/h/` or `/th/` **outside** | ordinary floating word: frames the verb / clause |
| Join **inside** | joins only interior conjuncts |
| Join **outside** with island nearby | ordinary lookback (edges do not filter an outside join) |

> `zuzozen { zolazun zal } zam vewurel.`
>
> [z-Uzozen | SCOPE[z-Olazun | z-and] | z-and.open] | v-walk
>
> "Uzozen and (just Olazun) walk."

A `/b/` right after an `/h/` word is hosted by it ([extra nouns](clause.md#extra-nouns)). To put a recipient `/b/` in an island, write it **before** the binder:

> `zuzozen { bolazun hegugom } vezuyel.`
>
> z-Uzozen | SCOPE[b-Olazun | h-possibility] | v-tell
>
> "Uzozen talks, possibly to Olazun."

The word before the island must not be a `/ɡ/`, `/h/`, or `/th/` word either, or it would host that `/b/` across the edge.

An island can hold part of a phrase. Here only *not small* is grouped, so **`gul`** denies *small* alone and **`gal`** adds it to *red*:

> `zudozol gerulel { gamezom gul } gal vewurel.`
>
> [z-dog | [g-red | SCOPE[g-small | g-not] | g-and]] | v-walk
>
> "A dog that is red and not small walks."

**Speech:** reset your pitch briefly as the island starts, say it as one tight phrase, and pause after its last word. In singing, shape it like any other phrase. Because an island never runs past one phrase, a listener who misses the closing pause is off by at most part of that phrase.

### Practice {#intermediate-practice}

Short drills for Intermediate. Try each item before opening **Show answer**.

**Setting:** a courtroom

**New words:**

| English | Agebon | Cue |
|---------|--------|-----|
| *Onuron* | `onuron` | 🎵 from *note*: a song's name |
| *rejection* | `vegugum` | ❌ from *cross* |
| *possibility* | `hegugom` | ❓ from *question mark* |
| *letters* | `glelel` | 🔤: a word is its letters |

**Review:**

| English | Agebon |
|---------|--------|
| *Uzozen* | `uzozen` |
| *Olazun* | `olazun` |
| *Uhelan* | `uhelan` |
| *topic* | `ozan` |
| *attest* | `vodol` |
| *lie* | `valamul` |
| *small* | `gamezom` |
| *tell* | `vezuyel` |
| *write* | `varayel` |
| *see* | `vawebol` |
| *punch* | `vanuvul` |
| *walk* | `vewurel` |

#### English → Agebon {#intermediate-english-to-agebon}

**1.** *Olazun said “Uzozen attests.”*

::: details Show answer
`zolazun d[zuzozen vodol] vezuyel.`

z-Olazun | d-CITE[z-Uzozen | v-attest] | v-tell
:::

**2.** *Olazun said “Uzozen.” Uhelan wrote that down.* (*that* is the quote)

::: details Show answer
`zolazun d[uzozen] vezuyel. zuhelan duxar varayel.`

z-Olazun | d-CITE[Uzozen] | v-tell . z-Uhelan | d-←patient.same | v-write
:::

**3.** *The word “oledo” is small.*

::: details Show answer
`glelel z[oledo] gamezom.`

[gl-MENTION | z-CITE["oledo"]] | g-small
:::

**4.** *Uzozen said, “Does Olazun lie?”*

::: details Show answer
`zuzozen d[yol zolazun valamul] vezuyel.`

z-Uzozen | d-CITE[y-question | z-Olazun | v-lie] | v-tell
:::

**5.** *Uhelan sees a copy of Onuron Olazun.*

::: details Show answer
`zuhelan d^@[onuron olazun] vawebol.`

z-Uhelan | d-NAME.CITE.instance[Onuron | Olazun] | v-see
:::

**6.** *Olazun talks, possibly to Uhelan.*

::: details Show answer
`zolazun { buhelan hegugom } vezuyel.`

z-Olazun | SCOPE[b-Uhelan | h-possibility] | v-tell
:::

#### Agebon → English {#intermediate-agebon-to-english}

**1.** `zuzozen glelen d[onuron] vegugum.`

::: details Show answer
z-Uzozen | [gl-NAME.MENTION | d-CITE[Onuron]] | v-rejection

*Uzozen dislikes the name “onuron.”* (not the work)
:::

**2.** `x@[onuron olazun] zolazun dozan vegugum.`

::: details Show answer
x-NAME.CITE[Onuron | Olazun] | z-Olazun | d-TOPIC | v-rejection

*Now, about Onuron Olazun: Olazun dislikes it.*
:::

**3.** `zuhelan d~[zuzozen vodol] vezuyel.`

::: details Show answer
z-Uhelan | d-CITE.about[z-Uzozen | v-attest] | v-tell

*Uhelan said something like “Uzozen attests.”*
:::

**4.** `zolazun { zuzozen zal } zam vanuvul.`

::: details Show answer
[z-Olazun | SCOPE[z-Uzozen | z-and] | z-and.open] | v-punch

*Olazun and (just Uzozen) punched.*
:::


**5.** `zuhelan !{ hegugom dalamul } vawebol.`

::: details Show answer
z-Uhelan | !SCOPE[h-possibility | d-lie] | v-see

*Uhelan saw what was possibly a lie!*
:::

**6.** `gl(gamezom) zolazun duzozen vanuvul.`

::: details Show answer
[gl-ASIDE[g-small] | z-Olazun] | d-Uzozen | v-punch

*Olazun, who is small, punches Uzozen.*
:::

#### Pick one {#intermediate-pick-one}

**1.** *Uzozen dislikes Onuron Olazun.* (the work) `zuzozen d@[onuron olazun] vegugum.` or `zuzozen d[onuron olazun] vegugum.`

::: details Show answer
`zuzozen d@[onuron olazun] vegugum.`

z-Uzozen | d-NAME.CITE[Onuron | Olazun] | v-rejection

**`@`** makes the span the work; bare brackets quote the words.
:::

**2.** *Uzozen saw what was possibly a lie.* `zuzozen { hegugom dalamul } vawebol.` or `zuzozen hegugom dalamul vawebol.`

::: details Show answer
`zuzozen { hegugom dalamul } vawebol.`

z-Uzozen | SCOPE[h-possibility | d-lie] | v-see

Inside braces, **`hegugom`** reaches only that chunk; outside, it frames the whole seeing.
:::

#### Fix it {#intermediate-fix-it}

**1.** *Uzozen said, “Does Olazun walk?”* <!-- lint: error -->`yol zuzozen d[zolazun vewurel] vezuyel.`

::: details Show answer
`zuzozen d[yol zolazun vewurel] vezuyel.`

z-Uzozen | d-CITE[y-question | z-Olazun | v-walk] | v-tell

The quoted question keeps its act word inside the cite; **`yol`** outside asks whether Uzozen said it.
:::

## Advanced {#advanced}

### Editorial close and close-all {#close-forms-complete-editorial-close-all}

A closing bracket normally ends one span, with its wording complete. Two written marks, placed just **inside** the closing bracket, change that. **`#`** keeps the wording as written but shows that it is cut off, trails off, or is faulty (*Uzozen said “bug…”*). **`|`** closes every span still open around it at once.

> `zuzozen d[abezum#] vezuyel.`
>
> z-Uzozen | d-CITE[flaw]# | v-tell
>
> "Uzozen said “bug…”"

| Writing | Use | English | Cue |
|---------|-----|---------|-----|
| `d[…]` | close **one** span, whole | the matching closer | the bracket closes it |
| `d[…#]` | **editorial**: wording kept as written, cut off or defective | trailing off | **#** a note on the text |
| `d[…|]` | close **all** open spans | sweep everything | **\|** one bar through every bracket |
| `d[…#|]` | editorial, then close all | | write `#` first, then `\|` |

An editorial span still counts as quoted: a role pointer can reach it as it reaches any cite.

### Nesting {#nesting}

When one packaged chunk sits inside another (a quote that contains a parenthetical, or a cite wrapping an opaque blob), the spans nest, and each one closes with its own bracket.

> `zuzozen d[ th(hogowul) uzozen ] vezuyel.`
>
> z-Uzozen | d-CITE[th-ASIDE[h-quiet] | Uzozen] | v-tell
>
> "Uzozen said “(quietly) Uzozen.”" (hello)

The same nest works as <code>d[ z&lt;…&gt; ]</code> or <code>d~[ d&lt;…&gt; ]</code>.

### Practice {#advanced-practice}

Short drills for Advanced. Try each item before opening **Show answer**.

**Setting:** a code review

**New words:**

| English | Agebon | Cue |
|---------|--------|-----|
| *flaw* | `abezum` | 🐛 from *bug* |

**Review:**

| English | Agebon |
|---------|--------|
| *Uzozen* | `uzozen` |
| *Olazun* | `olazun` |
| *Uhelan* | `uhelan` |
| *page* | `ebogel` |
| *tell* | `vezuyel` |
| *write* | `varayel` |
| *see* | `vawebol` |

#### English → Agebon {#advanced-english-to-agebon}

**1.** *Olazun said “flaw…”* (the quote trails off)

::: details Show answer
`zolazun d[abezum#] vezuyel.`

z-Olazun | d-CITE[flaw]# | v-tell
:::

**2.** *Uzozen wrote “(quietly) flaw.”*

::: details Show answer
`zuzozen d[ th(hogowul) abezum ] varayel.`

z-Uzozen | d-CITE[th-ASIDE[h-quiet] | flaw] | v-write
:::

**3.** *Uhelan said “flaw…”* (the quote trails off; close every open bracket at once)

::: details Show answer
`zuhelan d[abezum#|] vezuyel.`

z-Uhelan | d-CITE[flaw]#| | v-tell
:::

**4.** *Uzozen sees “flaw…” on the page.*

::: details Show answer
`zuzozen d[abezum#] vawebol aol bebogel.`

z-Uzozen | d-CITE[flaw]# | v-see | [on | b-page]
:::

#### Agebon → English {#advanced-agebon-to-english}

**1.** `zuhelan d[abezum] varayel.`

::: details Show answer
z-Uhelan | d-CITE[flaw] | v-write

*Uhelan wrote “flaw.”*
:::

**2.** `zolazun d[ th(hogowul) zuzozen varayel ] vezuyel.`

::: details Show answer
z-Olazun | d-CITE[th-ASIDE[h-quiet] | z-Uzozen | v-write] | v-tell

*Olazun said, “(quietly) Uzozen writes.”*
:::

**3.** `zuzozen d[zolazun varayel#] vezuyel.`

::: details Show answer
z-Uzozen | d-CITE[z-Olazun | v-write]# | v-tell

*Uzozen said “Olazun writes…”*
:::

**4.** `zolazun d[abezum#] vezuyel. zuhelan duxar varayel.`

::: details Show answer
z-Olazun | d-CITE[flaw]# | v-tell . z-Uhelan | d-←patient.same | v-write

*Olazun said “flaw…” Uhelan wrote that down.*
:::

#### Pick one {#advanced-pick-one}

**1.** *Uhelan said “flaw…”* (the quote trails off) `zuhelan d[abezum#] vezuyel.` or `zuhelan d[abezum] vezuyel.`

::: details Show answer
`zuhelan d[abezum#] vezuyel.`

z-Uhelan | d-CITE[flaw]# | v-tell

**`#`** inside the closer keeps the wording but marks it cut off; a plain closer says it is complete.
:::

#### What changes {#advanced-what-changes}

**1.** `zuzozen d[abezum#] vezuyel.` / `zuzozen d[abezum#|] vezuyel.`

::: details Show answer
z-Uzozen | d-CITE[flaw]# | v-tell

z-Uzozen | d-CITE[flaw]#| | v-tell

Both quotes trail off; with **`|`**, the closer also shuts every span still open.
:::

## See also

- Scope islands: [joins.md](joins.md#scope-islands-join)
- Identity vs parenthetical comment: [predication.md](predication.md#identity)
- Multipart names: [word-endings.md](word-endings.md#multipart-names)
- Titled phrases (hook / join / span): [word-endings.md](word-endings.md#titled-phrases)
- Prefix-less citation outside a clause: [word-endings.md](word-endings.md#citation-forms)
