---
band: beginner
---

# Spans

Some parts of a sentence are not ordinary Ageben words: a quote of what someone said, a word from another language, a comment in parentheses. Ageben sets such a part apart as a **span**: a role letter, then a pair of brackets around the words. The role letter says what the whole bracketed chunk does in the sentence (subject, object, verb, adverb, and so on), so the rest of the sentence reads as usual. A span is written only: speech has no word for its open or close.


Start with a quote of what someone said.

### Cite (`[…]`) {#writing}
<a id="writing-vs-speech"></a>

To quote wording (what someone said, a title, a proverb as words), write the role letter, then square brackets around the quoted words. That span is a **cite**. The whole quote fills one role, so *said “…”* works like *said something*. (cue: `[…]` like quote marks)

Start with a one-word quote as the object of *said*. A [greeting](word-endings.md#greeting) is just your own name, so quoting Azozon’s hello means quoting that name:

> `zazozon d[azozon] vezuyol.`
>
> z-Azozon | d-CITE[Azozon] | v-tell
>
> "Azozon said “Azozon.”" (hello)

The whole `d[azozon]` is the direct object (who or what is acted on). When the quote is a whole Ageben sentence, each word inside starts with its own role letter, as in any sentence.

### Exact, paraphrase, proper
<a id="when-required"></a>

You can mark how faithful the quote is. Put the mark **after** the role letter, before the opening bracket.

A span with no mark is **exact**: the words as they were said (`d[azozon]`). Write **`~`** for a **paraphrase**, when you mean the gist, not the exact words (`d~[zazozon vozuyel]`). Write **`@`** for a **proper** span: it names a work with a title of several words, such as a song, proverb, or book (`d@[onuren alazun]`). The span then means the work itself, not its title as a string of words.

A work or person with a one-word name is an ordinary **-n** word (`donuren`), not `d@[onuren]`, unless a role letter or an ending is part of the title itself. The mark belongs to the brackets; the words inside keep their usual endings.

<!-- cheat-sheet: restrictors-spans -->
| Ageben | Use | English | Cue |
|--------|-----|---------|-----|
| *(none)* | exact | verbatim wording | bare brackets already quote; extra ink would hedge |
| **`~`** | paraphrase | the gist, not the exact words | **~** looks like “about / approximately” |
| **`@`** | proper | the work known by that title | **@** like a social media handle |

> `zalazun d~[zazozon vozuyel] varuyol.`
>
> z-Alazun | d-CITE.about[z-Azozon | v-sing] | v-write
>
> "Alazun wrote something like “Azozon sings.”"

> `zahelan d@[onuren alazun] vozuyel.`
>
> z-Ahelan | d-NAME.CITE[Onuren | Alazun] | v-sing
>
> "Ahelan sang Onuren Alazun."

**`~`** and **`@`** combine, `~` first: the span still names the work, but the title is only roughly that. Use it when you remember a title loosely.

> `zahelan d~@[onuren alazun] vozuyel.`
>
> z-Ahelan | d-NAME.CITE.about[Onuren | Alazun] | v-sing
>
> "Ahelan sang that song called something like Onuren Alazun."

### Opaque and loan words {#loans}

To use a word from another language, a bit of code, or any spelling that is not Ageben, write the role letter, then angle brackets around it. That span is **opaque**: the inside is taken exactly as spelled and is not read as Ageben words. Write no letter after the closing `>`. The faithfulness marks are the same as on a cite: none, **`~`**, or **`@`**.

> <code>zazozon d&lt;kimchi&gt; vayebel.</code>
>
> z-Azozon | d-OPAQUE["kimchi"] | v-see
>
> "Azozon saw kimchi." (a foreign word)

Inside <code>&lt;&gt;</code>, keep the source’s capital letters when its writing system has them (<code>d&lt;NaCl&gt;</code>, <code>d@&lt;iPhone&gt;</code>). Ageben letters outside the brackets are always [lowercase](phonology.md). Use **`@`** when the bracketed word is a name or title.

When the lexicon already has a matching root, write the ordinary word (`dogozel`), not a span.

On its own, outside a sentence, a foreign name or word is written with no role letter: just the marks and the brackets (<code>@&lt;Sam&gt;</code>), like other [citation forms](word-endings.md#citation-forms). In a sentence the span fills a role, so it takes a role letter (<code>z@&lt;Sam&gt;</code>). A person’s or place’s name can also take an Ageben spelling that follows the English sound; type it in the [lexicon](lexicon.md#respell). Keep the span when the original spelling is the point.

### Calls and reactions (`/y/`) {#y-spans}

To call someone by a foreign name (*Sam!*) or react with a foreign word (*Wow!*), put a span under `/y/`. Only an opaque <code>&lt;…&gt;</code> or a cite `[…]` goes there, and it opens the turn, before the act word.

The **`@`** mark decides which, as **-n** does on a native word. With **`@`**, the span calls that person (<code>y@&lt;Sam&gt;</code>, *Sam!*); add **`~`** for a name you are not sure of (<code>y~@&lt;Sam&gt;</code>). Without **`@`**, the span is a foreign [interjection](speech-moves.md#interjections) (<code>y&lt;Wow&gt;</code>, *Wow!*), exact or given as the gist with **`~`** (<code>y~&lt;Wow&gt;</code>).

### Asides (`th(…)`) {#asides-th}
<a id="asides"></a>

To add a side comment in parentheses, write a role letter, then **`(`** … **`)`**. That span is an **aside**. The role letter says what the comment is about, and the aside sits where a word with that letter sits. (cue: round parentheses, as in English)

| Ageben | Comments on | Sits |
|--------|-------------|------|
| `th(…)` | the whole sentence | anywhere a [stance](clause.md#stance-th) word may sit |
| `g(…)` | the noun before it | right after that noun, like an [adjective](clause.md#adjectives-ɡ) |
| `w(…)` | the next `/ɡ/`, `/h/`, or `/th/` word | right before that word, like [*very*](clause.md#adjective-detail-w) |
| `h(…)` | the action | anywhere an [adverb](clause.md#adverbs-h) may sit |

The inside is ordinary Ageben: a fragment, or a clause with the **same speech act** as the outer sentence (both statements, both questions, or both commands). An aside comments; it does not call anyone or react, so it never goes under `/y/`. It fills no slot of the verb either, so it never goes under `/z/`, `/d/`, `/b/`, or `/v/`.

> `zazozon vowurol th(hugowul).`
>
> z-Azozon | v-walk | th-ASIDE[h-quiet]
>
> "Azozon walks (quietly)."

> `zazozon vowurol th(zalazun vezuvel).`
>
> z-Azozon | v-walk | th-ASIDE[z-Alazun | v-sleep]
>
> "Azozon walks (Alazun is asleep)."

A noun aside adds something about a noun the listener already has. It does not pick out which one, the way a plain adjective can:

> `zodozel g(gerulol) vowurol.`
>
> [z-dog | g-ASIDE[g-red]] | v-walk
>
> "The dog (it is red) walks."

> `zazozon g(zazozor vowurol) vozuyel.`
>
> [z-Azozon | g-ASIDE[z-←Azozon | v-walk]] | v-sing
>
> "Azozon, who walks, sings."

A `/w/` aside narrows the comment to one word. Here only the color is what Azozon says:

> `zodozel w(zazozon vezuyol) gerulol vowurol.`
>
> [z-dog | [w-ASIDE[z-Azozon | v-tell] | g-red]] | v-walk
>
> "A (so Azozon says) red dog walks."

An `/h/` aside is a side detail about the action itself, not about your claim:

> `zazozon vowurol h(al babahal).`
>
> z-Azozon | v-walk | h-ASIDE[in | b-bank]
>
> "Azozon walks (in a bank)."

A one-word comment with nothing to package is a plain word in that slot: `zazozon vowurol hugowul.`

**For *because* / *if*, use:** [**`blarl`**](dependents.md#poles) dependents, not an aside.

**Compare with:** a second name for the same person uses [identity](predication.md#identity) (`gore` + `/b/`). To pick out **which** noun (*the guard who sits*), use a plain adjective or [another sentence](dependents.md#which-noun), not a noun aside.

### Outer slot {#pos}

A span can fill any role a word can, not only the object. The letter before the bracket is the role of the **whole span** in the outer sentence, so ask what that chunk does there: the object of *said*, the subject of *is small*, and so on. A cite can even be the **verb**, when you echo an act as wording:

> `yul zalazun v[vezohul].`
>
> y-prohibition | z-Alazun | v-CITE[v-stop]
>
> "Don’t say “stop,” Alazun."

<!-- cheat-sheet: restrictors-spans -->
| Ageben | Use | English | Cue |
|--------|-----|---------|-----|
| `/d/` | object | *said / wrote / saw “…”* (`d[azozon]`, <code>d&lt;kimchi&gt;</code>) | **d** ≈ done to |
| `/z/` | subject | a foreign name as the subject (<code>z@&lt;Sam&gt;</code>) | **z** ≈ star (who it is about) |
| `/b/` | extra party | a foreign name as the recipient (<code>b@&lt;Sam&gt;</code>) | **b** ≈ bolted on (the extra piece) |
| `/v/` | verb | echo the act as wording (`v[vezohul]`); a loan verb (<code>v&lt;google&gt;</code>) | **v** as in English *verb* |
| `/ɡ/` | adjective | a loan adjective (<code>g&lt;rouge&gt;</code>); an aside on the noun (`g(…)`) | **g** ≈ grade (a rating of the noun) |
| `/w/` | extra detail | a loan degree word (<code>w&lt;molto&gt;</code>); an aside on the next word (`w(…)`) | **w** ≈ with (stuck to that host) |
| `/h/` | adverb | a loan adverb (<code>h&lt;allegro&gt;</code>); an aside on the action (`h(…)`) | **h** starts *how* / *when* / *where* |
| `/th/` | stance | an aside on the sentence (`th(…)`) | **th** ≈ *think* (your side comment) |

Only an aside goes under `/th/`. An aside also goes under `/ɡ/`, `/w/`, or `/h/`, never under `/z/` `/d/` `/b/` `/v/`. A cite, mention, or opaque span fills any slot but `/th/`.

To use a foreign verb, adjective, adverb, or degree word (*googled*, *rouge*, *molto*), put an opaque span in that slot. That is a **loan word**: the role letter says how the foreign word is used, and the inside keeps its own spelling.

> <code>zalazun v&lt;google&gt; dazozon.</code>
>
> z-Alazun | v-OPAQUE["google"] | d-Azozon
>
> "Alazun googled Azozon." (a borrowed word)

> <code>zodozel g&lt;rouge&gt; vowurol.</code>
>
> [z-dog | g-OPAQUE["rouge"]] | v-walk
>
> "A rouge dog walks." (a borrowed word)

> <code>zazozon vezuyol b@&lt;Sam&gt;.</code>
>
> z-Azozon | v-tell | b-NAME.OPAQUE["Sam"]
>
> "Azozon talks to Sam." (a foreign name)

The letter before the bracket belongs to the whole span. Ageben words inside a cite start with **their own** role letters.

### Practice {#beginner-practice}

Short drills for Beginner. Try each item before opening **Show answer**.

**Setting:** a rehearsal

**New words:**

| English | Ageben | Cue |
|---------|--------|-----|
| *dance* | `vunurol` | 🕺 |
| *stop* | `vezohul` | 🛑 |
| *quiet* | `ugowul` | 🔈 |
| *Egoren* | `egoren` | 🎸 from *guitar*: a dance's name |
| *Sam* | <code>@&lt;Sam&gt;</code> | a foreign name |
| *google* | <code>v&lt;google&gt;</code> | a loan verb |
| *Bravo* | <code>&lt;Bravo&gt;</code> | a foreign word |

**Review:**

| English | Ageben |
|---------|--------|
| *Azozon* | `azozon` |
| *Alazun* | `alazun` |
| *Ahelan* | `ahelan` |
| *tell* | `vezuyol` |
| *write* | `varuyol` |
| *walk* | `vowurol` |
| *see* | `vayebel` |

#### English → Ageben {#beginner-english-to-ageben}

**1.** *Azozon said “Azozon.”* (hello)

::: details Show answer
`zazozon d[azozon] vezuyol.`

z-Azozon | d-CITE[Azozon] | v-tell
:::

**2.** *Alazun wrote something like “Ahelan dances.”*

::: details Show answer
`zalazun d~[zahelan vunurol] varuyol.`

z-Alazun | d-CITE.about[z-Ahelan | v-dance] | v-write
:::

**3.** *Alazun talks to Sam.* (a foreign name)

::: details Show answer
<code>zalazun vezuyol b@&lt;Sam&gt;.</code>

z-Alazun | v-tell | b-NAME.OPAQUE["Sam"]
:::

**4.** *Don’t say “stop,” Azozon.*

::: details Show answer
`yul zazozon v[vezohul].`

y-prohibition | z-Azozon | v-CITE[v-stop]
:::

**5.** *Sam, does Azozon dance?*

::: details Show answer
<code>y@&lt;Sam&gt; yel zazozon vunurol.</code>

y-NAME.OPAQUE["Sam"] | y-question | z-Azozon | v-dance
:::

**6.** *Alazun walks (quietly).*

::: details Show answer
`zalazun vowurol th(hugowul).`

z-Alazun | v-walk | th-ASIDE[h-quiet]
:::

#### Ageben → English {#beginner-ageben-to-english}

**1.** `zalazun d@[egoren alazun] vayebel.`

::: details Show answer
z-Alazun | d-NAME.CITE[Egoren | Alazun] | v-see

*Alazun saw Egoren Alazun.* (the work)
:::

**2.** <code>zalazun v&lt;google&gt; degoren.</code>

::: details Show answer
z-Alazun | v-OPAQUE["google"] | d-Egoren

*Alazun googled Egoren.* (a borrowed word)
:::

**3.** `zahelan g(zahelar vunurol) vowurol.`

::: details Show answer
[z-Ahelan | g-ASIDE[z-←Ahelan | v-dance]] | v-walk

*Ahelan, who dances, walks.*
:::

**4.** <code>y&lt;Bravo&gt;.</code>

::: details Show answer
y-OPAQUE["Bravo"]

*Bravo!* (a foreign word)
:::

**5.** `zahelan d~@[egoren alazun] vunurol.`

::: details Show answer
z-Ahelan | d-NAME.CITE.about[Egoren | Alazun] | v-dance

*Ahelan danced the piece called something like Egoren Alazun.*
:::

**6.** `zahelan d[vezohul] vezuyol.`

::: details Show answer
z-Ahelan | d-CITE[v-stop] | v-tell

*Ahelan said “stop.”*
:::

#### Pick one {#beginner-pick-one}

**1.** *Ahelan danced Egoren Alazun.* (the dance) `zahelan d@[egoren alazun] vunurol.` or `zahelan d[egoren alazun] vunurol.`

::: details Show answer
`zahelan d@[egoren alazun] vunurol.`

z-Ahelan | d-NAME.CITE[Egoren | Alazun] | v-dance

**`@`** makes the span the work itself; bare brackets quote the words.
:::

**2.** *Azozon said “Alazun stops.”* `zazozon d[zalazun vezohul] vezuyol.` or `zazozon vezuyol th(zalazun vezohul).`

::: details Show answer
`zazozon d[zalazun vezohul] vezuyol.`

z-Azozon | d-CITE[z-Alazun | v-stop] | v-tell

What was said is the object, so it is a cite in `/d/`; an aside only comments on the sentence.
:::

#### Fix it {#beginner-fix-it}

**1.** *Alazun danced Egoren.* (a work with a one-word name) <!-- lint: error -->`zalazun d@[egoren] vunurol.`

::: details Show answer
`zalazun degoren vunurol.`

z-Alazun | d-Egoren | v-dance

A one-word name is an ordinary **-n** word; **`@[…]`** is for titles of several words.
:::
## See also

- Scope islands: [joins.md](/join-islands#scope-islands-join)
- Identity vs parenthetical comment: [predication.md](predication.md#identity)
- Multipart names: [word-endings.md](/proper-names#multipart-names)
- Titled phrases (hook / join / span): [word-endings.md](/proper-names#titled-phrases)
- Prefix-less citation outside a clause: [word-endings.md](word-endings.md#citation-forms)
