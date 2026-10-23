---
band: beginner
---

# Spans

Some parts of a sentence are not ordinary Agebon words: a quote of what someone said, a word from another language, a comment in parentheses. Agebon sets such a part apart as a **span**: a role letter, then a pair of brackets around the words. The role letter says what the whole bracketed chunk does in the sentence (subject, object, verb, adverb, and so on), so the rest of the sentence reads as usual. A span is written only: speech has no word for its open or close.


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

A span with no mark is **exact**: the words as they were said (`d[uzozen]`). Write **`~`** for a **paraphrase**, when you mean the gist, not the exact words (`d~[zuzozen vezuyol]`). Write **`@`** for a **proper** span: it names a work with a title of several words, such as a song, proverb, or book (`d@[enuron olazun]`). The span then means the work itself, not its title as a string of words.

A work or person with a one-word name is an ordinary **-n** word (`denuron`), not `d@[enuron]`, unless a role letter or an ending is part of the title itself. The mark belongs to the brackets; the words inside keep their usual endings.

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

> `zahelan d@[enuron olazun] vezuyol.`
>
> z-Ahelan | d-NAME.CITE[Enuron | Olazun] | v-sing
>
> "Ahelan sang Enuron Olazun."

**`~`** and **`@`** combine, `~` first: the span still names the work, but the title is only roughly that. Use it when you remember a title loosely.

> `zahelan d~@[enuron olazun] vezuyol.`
>
> z-Ahelan | d-NAME.CITE.about[Enuron | Olazun] | v-sing
>
> "Ahelan sang that song called something like Enuron Olazun."

### Opaque and loan words {#loans}

To use a word from another language, a bit of code, or any spelling that is not Agebon, write the role letter, then angle brackets around it. That span is **opaque**: the inside is taken exactly as spelled and is not read as Agebon words. Write no letter after the closing `>`. The faithfulness marks are the same as on a cite: none, **`~`**, or **`@`**.

> <code>zuzozen d&lt;kimchi&gt; vawebol.</code>
>
> z-Uzozen | d-OPAQUE["kimchi"] | v-see
>
> "Uzozen saw kimchi." (a foreign word)

Inside <code>&lt;&gt;</code>, keep the source’s capital letters when its writing system has them (<code>d&lt;NaCl&gt;</code>, <code>d@&lt;iPhone&gt;</code>). Agebon letters outside the brackets are always [lowercase](phonology.md). Use **`@`** when the bracketed word is a name or title.

When the lexicon already has a matching root, write the ordinary word (`dagozol`), not a span.

On its own, outside a sentence, a foreign name or word is written with no role letter: just the marks and the brackets (<code>@&lt;Sam&gt;</code>), like other [citation forms](word-endings.md#citation-forms). In a sentence the span fills a role, so it takes a role letter (<code>z@&lt;Sam&gt;</code>). A person’s or place’s name can also take an Agebon spelling that follows the English sound; type it in the [lexicon](lexicon.md#respell). Keep the span when the original spelling is the point.

### Calls and reactions (`/y/`) {#y-spans}

To call someone by a foreign name (*Sam!*) or react with a foreign word (*Wow!*), put a span under `/y/`. Only an opaque <code>&lt;…&gt;</code> or a cite `[…]` goes there, and it opens the turn, before the act word.

The **`@`** mark decides which, as **-n** does on a native word. With **`@`**, the span calls that person (<code>y@&lt;Sam&gt;</code>, *Sam!*); add **`~`** for a name you are not sure of (<code>y~@&lt;Sam&gt;</code>). Without **`@`**, the span is a foreign [interjection](speech-moves.md#interjections) (<code>y&lt;Wow&gt;</code>, *Wow!*), exact or given as the gist with **`~`** (<code>y~&lt;Wow&gt;</code>).

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

> `zuzozen vowurel th(hogowul).`
>
> z-Uzozen | v-walk | th-ASIDE[h-quiet]
>
> "Uzozen walks (quietly)."

> `zuzozen vowurel th(zolazun vezuvol).`
>
> z-Uzozen | v-walk | th-ASIDE[z-Olazun | v-sleep]
>
> "Uzozen walks (Olazun is asleep)."

A noun aside adds something about a noun the listener already has. It does not pick out which one, the way a plain adjective can:

> `zudozol g(gerulel) vowurel.`
>
> [z-dog | g-ASIDE[g-red]] | v-walk
>
> "The dog (it is red) walks."

> `zuzozen g(zuzozer vowurel) vezuyol.`
>
> [z-Uzozen | g-ASIDE[z-←Uzozen | v-walk]] | v-sing
>
> "Uzozen, who walks, sings."

A `/w/` aside narrows the comment to one word. Here only the color is what Uzozen says:

> `zudozol w(zuzozen vezuyel) gerulel vowurel.`
>
> [z-dog | [w-ASIDE[z-Uzozen | v-tell] | g-red]] | v-walk
>
> "A (so Uzozen says) red dog walks."

An `/h/` aside is a side detail about the action itself, not about your claim:

> `zuzozen vowurel h(al babohal).`
>
> z-Uzozen | v-walk | h-ASIDE[in | b-bank]
>
> "Uzozen walks (in a bank)."

A one-word comment with nothing to package is a plain word in that slot: `zuzozen vowurel hogowul.`

**For *because* / *if*, use:** [**`blarl`**](dependents.md#poles) dependents, not an aside.

**Compare with:** a second name for the same person uses [identity](predication.md#identity) (`goro` + `/b/`). To pick out **which** noun (*the guard who sits*), use a plain adjective or [another sentence](dependents.md#which-noun), not a noun aside.

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

> <code>zudozol g&lt;rouge&gt; vowurel.</code>
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
| *dance* | `vanurel` | 🕺 |
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
| *Ahelan* | `ahelan` |
| *tell* | `vezuyel` |
| *write* | `varayel` |
| *walk* | `vowurel` |
| *see* | `vawebol` |

#### English → Agebon {#beginner-english-to-agebon}

**1.** *Uzozen said “Uzozen.”* (hello)

::: details Show answer
`zuzozen d[uzozen] vezuyel.`

z-Uzozen | d-CITE[Uzozen] | v-tell
:::

**2.** *Olazun wrote something like “Ahelan dances.”*

::: details Show answer
`zolazun d~[zahelan vanurel] varayel.`

z-Olazun | d-CITE.about[z-Ahelan | v-dance] | v-write
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
<code>y@&lt;Sam&gt; yol zuzozen vanurel.</code>

y-NAME.OPAQUE["Sam"] | y-question | z-Uzozen | v-dance
:::

**6.** *Olazun walks (quietly).*

::: details Show answer
`zolazun vowurel th(hogowul).`

z-Olazun | v-walk | th-ASIDE[h-quiet]
:::

#### Agebon → English {#beginner-agebon-to-english}

**1.** `zolazun d@[ogoron olazun] vawebol.`

::: details Show answer
z-Olazun | d-NAME.CITE[Ogoron | Olazun] | v-see

*Olazun saw Ogoron Olazun.* (the work)
:::

**2.** <code>zolazun v&lt;google&gt; dogoron.</code>

::: details Show answer
z-Olazun | v-OPAQUE["google"] | d-Ogoron

*Olazun googled Ogoron.* (a borrowed word)
:::

**3.** `zahelan g(zahelar vanurel) vowurel.`

::: details Show answer
[z-Ahelan | g-ASIDE[z-←Ahelan | v-dance]] | v-walk

*Ahelan, who dances, walks.*
:::

**4.** <code>y&lt;Bravo&gt;.</code>

::: details Show answer
y-OPAQUE["Bravo"]

*Bravo!* (a foreign word)
:::

**5.** `zahelan d~@[ogoron olazun] vanurel.`

::: details Show answer
z-Ahelan | d-NAME.CITE.about[Ogoron | Olazun] | v-dance

*Ahelan danced the piece called something like Ogoron Olazun.*
:::

**6.** `zahelan d[vozohul] vezuyel.`

::: details Show answer
z-Ahelan | d-CITE[v-stop] | v-tell

*Ahelan said “stop.”*
:::

#### Pick one {#beginner-pick-one}

**1.** *Ahelan danced Ogoron Olazun.* (the dance) `zahelan d@[ogoron olazun] vanurel.` or `zahelan d[ogoron olazun] vanurel.`

::: details Show answer
`zahelan d@[ogoron olazun] vanurel.`

z-Ahelan | d-NAME.CITE[Ogoron | Olazun] | v-dance

**`@`** makes the span the work itself; bare brackets quote the words.
:::

**2.** *Uzozen said “Olazun stops.”* `zuzozen d[zolazun vozohul] vezuyel.` or `zuzozen vezuyel th(zolazun vozohul).`

::: details Show answer
`zuzozen d[zolazun vozohul] vezuyel.`

z-Uzozen | d-CITE[z-Olazun | v-stop] | v-tell

What was said is the object, so it is a cite in `/d/`; an aside only comments on the sentence.
:::

#### Fix it {#beginner-fix-it}

**1.** *Olazun danced Ogoron.* (a work with a one-word name) <!-- lint: error -->`zolazun d@[ogoron] vanurel.`

::: details Show answer
`zolazun dogoron vanurel.`

z-Olazun | d-Ogoron | v-dance

A one-word name is an ordinary **-n** word; **`@[…]`** is for titles of several words.
:::
## See also

- Scope islands: [joins.md](/join-islands#scope-islands-join)
- Identity vs parenthetical comment: [predication.md](predication.md#identity)
- Multipart names: [word-endings.md](/proper-names#multipart-names)
- Titled phrases (hook / join / span): [word-endings.md](/proper-names#titled-phrases)
- Prefix-less citation outside a clause: [word-endings.md](word-endings.md#citation-forms)
