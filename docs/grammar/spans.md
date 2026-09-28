# Spans

When you set wording apart from the rest of the sentence (a quote, a parenthetical, a loan surface), Agalan packages that chunk in a **span fence**. In writing you put a role letter, then a pair of brackets around the interior. That first letter is the chunk’s role in the outer sentence (subject, object, verb, or adverb).

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

The whole `d[azawan]` is the direct object (who or what is acted on). If the interior is Agalan words in a clause, those inner words still start with their own role letters.

### Exact, paraphrase, proper
<a id="when-required"></a>

You can mark how faithful the quote is. Put the mark **after** the role letter, before the opening bracket.

Verbatim wording is **exact**: no extra mark (`d[azawan]`). When you mean the gist, not the exact words, write **`~`** (`d~[zazawan vezehel]`). When the chunk is the **work** that bears a **multi-word** title (the song, proverb, book — not the name-string), write **`@`** (`d@[onodan alahen]`). A one-word work or person is ordinary **-n** (`donodan`), not `d@[onodan]`, unless the role letter or the ending is **part of the title** you are packaging. **`@`** / spoken **-n** is on the **fence**; words inside keep their usual endings ([titled phrases](word-endings.md#titled-phrases)).

| Agalan | Use | English | Cue |
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

### Resume (`[=]`)

To point back at a prior span without repeating its interior, put **`=`** inside the same brackets: `d[=]`. The letter on the resume is the role this pointer plays in *this* sentence (here still the object of *said*).

> `yol zalahen d[=] vezebel.`
>
> y-question | z-Alahen | d-←cite | v-tell
>
> "Alahen said that?!"

### Mention (`{…}`)

A **mention** holds a **word or phrase** as that spelling, not a quote of speech. Write the role letter, then curly braces around it. English says *the word …* or *the phrase …* and keeps the Agalan interior (`odoga`, not *dog*). To quote what someone said, use [cite](#writing).

> `z{odoga} gamazam.`
>
> z-MENTION["odoga"] | g-small
>
> "The word “odoga” is small."

> `z{zazawan vezehel} gamazam.`
>
> z-MENTION["zazawan vezehel"] | g-small
>
> "The phrase “zazawan vezehel” is small."

With **`@`**, mention is the **name** (the title-string you could rename), even as **one word**: `d@{onodan}` is not `donodan`. Cite with **`@`** is the **work**; that span is for a **multi-word** title (`d@[onodan alahen]`). One-word *Onodan* as the work is ordinary **-n** (`donodan`).

> `zazawan d@[onodan alahen] vogozam.`
>
> z-Azawan | d-NAME.CITE[Onodan | Alahen] | v-rejection
>
> "Azawan dislikes Onodan Alahen." (the work)

> `zazawan d@{onodan} vogozam.`
>
> z-Azawan | d-NAME.MENTION["onodan"] | v-rejection
>
> "Azawan dislikes the name “onodan.”" (might still like the work)

**Compare with:** `donodan` is *Onodan* (the work or person). `d@{onodan}` is only the **name**.

### Opaque and loan words {#loans}

**Opaque** holds a foreign, code, or raw surface that is not ordinary Agalan words. Write the role letter, then angle brackets around that blob. Do not put an extra letter after `>`. Faithfulness uses the same marks as cite: none / **`~`** / **`@`**, and resume uses **`=`** inside (`d<=>`).

> <code>zazawan d&lt;kimchi&gt; vahahal.</code>
>
> z-Azawan | <code>d-&lt;kimchi&gt;</code> | v-see
>
> "Azawan saw kimchi." (opaque surface)

Keep the source’s **casing** inside `<>` when that writing system uses case (<code>d&lt;NaCl&gt;</code>, <code>d@&lt;iPhone&gt;</code>). Native Agalan letters stay [lowercase](phonology.md#beginner). **`@`** is the proper mark when that blob is a titled name.

When a published Agalan root already matches, write the ordinary word (`dagadal`, not a fence).

Outside a clause, a foreign name or word is a prefix-less fence with the same marks: [citation forms](word-endings.md#citation-forms) (<code>@&lt;Sam&gt;</code>). A span in a sentence still takes a role letter, because it fills a sentence slot (<code>z@&lt;Sam&gt;</code>).

### Asides (`th(…)`)
<a id="asides"></a>

An **aside** is a parenthetical comment. Package it as a [stance](clause.md#stance-th) word: write **`th(`** … **`)`**. Round parentheses mark the side comment. The fence may sit anywhere a stance word may sit.

The interior is ordinary Agalan: a fragment, or a clause body that keeps the **same speech act** as the outer sentence (the same statement, question, or command).

> `zazawan vowogal th(hazaham).`
>
> z-Azawan | v-walk | th-ASIDE[h-happy]
>
> "Azawan walks (happily)."

> `zazawan vowogal th(zalahen vezebal).`
>
> z-Azawan | v-walk | th-ASIDE[z-Alahen | v-sleep]
>
> "Azawan walks (Alahen sleeps)."

A one-word manner with nothing to package is a plain adverb: `zazawan vowogal hazaham.`

**For *because* / *if*, use:** [**`barl`**](dependents.md#dependent-clauses) dependents, not an aside.

**Compare with:** a second name for the same person uses [identity](predication.md#identity) (`goga` + `/b/`), not an aside.

### Outer slot {#pos}

The letter on the open is the role of the **entire span** in the outer sentence. Ask what that chunk is doing out there: object of *said*, subject of *is small*, and so on. A cite can be the **verb** when you echo the act as wording:

> `yul zalahen v[vazadal].`
>
> y-prohibition | z-Alahen | v-CITE[v-stop]
>
> "Don’t say “stop,” Alahen."

| Agalan | Use | English | Cue |
|--------|-----|---------|-----|
| `/d/` | object | *said / wrote / saw “…”* (`d[azawan]`, `d[=]`, <code>d&lt;kimchi&gt;</code>) | **d** ≈ done to |
| `/z/` | subject | the word or phrase **is** the subject (`z{odoga}`) | **z** ≈ star (who it is about) |
| `/v/` | verb | echo the act as wording (`v[vazadal]`) | **v** as in English *verb* |
| `/th/` | stance | asides (`th(…)`) | **th** ≈ *think* (your side comment) |

If the interior is Agalan words, those inner words still start with **their** role letters.

### Translation practice {#beginner-translation-practice}

Short drills for Beginner. Try each item before opening **Show answer**.

**Setting:** a rehearsal

**Roots used here:**

| English | Agalan | Same root as | Cue |
|---------|--------|--------------|-----|
| *Azawan* | `azawan` | | |
| *Alahen* | `alahen` | | |
| *Ahaben* | `ahaben` | | |
| *tell* | `vezebel` | | |
| *write* | `varadal` | | |
| *see* | `vahahal` | | |
| *sing* | `vezehel` | | |
| *stop* | `vazadal` | | |
| *Onodan* | `onodan` | | |
| *melody* | `onodal` | | |
| *small* | `gamazam` | `amazal` *mouse* | 🐁: a mouse is little |
| *happy* | `hazaham` | | |
| *kimchi* | <code>d&lt;kimchi&gt;</code> | | |
| *Sam* | <code>@&lt;Sam&gt;</code> | | |

#### English → Agalan {#beginner-english-to-agalan}

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

**3.** *The word “onoda” is small.*

::: details Show answer
`z{onoda} gamazam.`

z-MENTION["onoda"] | g-small
:::

**4.** *Azawan saw kimchi.* (foreign surface)

::: details Show answer
<code>zazawan d&lt;kimchi&gt; vahahal.</code>
:::

**5.** *Ahaben sang Onodan.* (one-word work: ordinary **-n**)

::: details Show answer
`zahaben donodan vezehel.`

z-Ahaben | d-Onodan | v-sing
:::

**6.** *Azawan sings (happily).*

::: details Show answer
`zazawan vezehel th(hazaham).`

z-Azawan | v-sing | th-ASIDE[h-happy]
:::

**7.** *Don’t say “stop,” Alahen.*

::: details Show answer
`yul zalahen v[vazadal].`

y-prohibition | z-Alahen | v-CITE[v-stop]
:::

**8.** *Alahen said that?!*

::: details Show answer
`yol zalahen d[=] vezebel.`

y-question | z-Alahen | d-←cite | v-tell
:::

**9.** *The phrase “zazawan vezehel” is small.*

::: details Show answer
`z{zazawan vezehel} gamazam.`

z-MENTION["zazawan vezehel"] | g-small
:::

#### Agalan → English {#beginner-agalan-to-english}

**1.** <code>zalahen d&lt;kimchi&gt; vahahal.</code>

::: details Show answer
*Alahen saw kimchi.* (opaque surface)
:::

**2.** `zazawan d{onoda} vahahal.`

::: details Show answer

z-Azawan | d-MENTION["onoda"] | v-see

*Azawan saw the word “onoda.”*
:::

**3.** `zahaben d@{onodan} varadal.`

::: details Show answer

z-Ahaben | d-NAME.MENTION["onodan"] | v-write

*Ahaben wrote the name “onodan.”*
:::

**4.** `z{onoda} gamazam.`

::: details Show answer

z-MENTION["onoda"] | g-small

*The word “onoda” is small.*
:::

**5.** <code>z@&lt;Sam&gt; d[azawan] vezebel.</code>

::: details Show answer
*Sam said “Azawan.”* (hello)
:::

**6.** <code>@&lt;Sam&gt;</code>

::: details Show answer
*Sam*
:::

**7.** `zalahen vezebel th(zazawan vezehel).`

::: details Show answer

z-Alahen | v-tell | th-ASIDE[z-Azawan | v-sing]

*Alahen tells (Azawan sings).*
:::

**8.** `yol zahaben d[=] vezebel.`

::: details Show answer

y-question | z-Ahaben | d-←cite | v-tell

*Ahaben said that?!*
:::

**9.** `z{zalahen vezebel} gamazam.`

::: details Show answer

z-MENTION["zalahen vezebel"] | g-small

*The phrase “zalahen vezebel” is small.*
:::

## Intermediate {#intermediate}

### Spoken word shape {#shape}

Beginner writing already packages a quote, mention, aside, or blob in brackets. Speech still has to say which slot the chunk fills, what kind of span it is, how far the open runs, and how faithful the wording is. The open is one word: role letter, then TYPE vowel, then mid-word **`x`**, then EDGE vowel, then the ending. That word stands where writing had `d[` or `th(`; a multi-token open still needs a close word later.

> `zazawan daxol azawan vezebel.`
>
> z-Azawan | d-CITE.atomic[Azawan] | v-tell
>
> "Azawan said “Azawan.”" (hello)

```text
{PoS}{TYPE}x{EDGE}{ENDING}
```

| Piece | Values | Use |
|-------|--------|-----|
| **PoS** | `z` `d` `b` `v` `g` `w` `h` `th` `y` `x` | slot the whole span fills |
| **TYPE** | **a** cite · **e** aside · **o** mention · **u** opaque | span kind |
| **`x`** | mid-word joiner | marks a span-fence form |
| **EDGE** | **a** · **e** · **o** · **u** | how far an open runs |
| **ENDING** | **-l** exact · **-m** paraphrase · **-n** proper · **-r** resume | fidelity, work vs name, or span resume |

**`daxal`** is `d` + `a` + `x` + `a` + `l`: open an exact multi-token cite as direct object (needs close).

### TYPE (vowels)
<a id="type"></a>
<a id="vowels"></a>

Beginner already used square, round, curly, and angle brackets for cite, aside, mention, and opaque. Speech puts that choice in the vowel **before** `x`.

| Agalan | Use | English | Cue |
|--------|------|---------|-----|
| **a** | **cite** (`[` … `]`); clausal interiors: outer speaker does **not** assert | quoted wording | **a** ≈ add (hold cited words) |
| **e** | **aside** (`th(` … `)`); `/th/` digression; outer speaker **does** assert; interior may be a fragment or a same-speech-act clause body | parenthetical | **e** ≈ else (an extra comment) |
| **o** | **mention** (`{` … `}`); with **`@`** / **-n**, the **name** | the word or phrase; proper = the name-string | **o** ≈ one (one word or phrase as the object) |
| **u** | **opaque** (`<` … `>`); interior is not native Agalan | foreign / code | **u** ≈ undo (not native Agalan) |

**Compare with:** a native office name uses ordinary **-n** (`zubugan`). Mention `{abogo}` is that **word**; opaque / loan is a **foreign** acronym’s surface (<code>z@&lt;FBI&gt;</code>).

### EDGE (extent) {#edge}

A pair of brackets can wrap one token or many, run to the end of the clause, or hold nothing. In speech, the vowel **after** `x` is **EDGE**: it says whether the open waits for an explicit close, ends at the next turn or clause join, takes exactly one following token, or has no interior.

> `zalahen daxal zazawan vezehel xuxul vezebel.`
>
> z-Alahen | d-CITE.multi[z-Azawan | v-sing] | v-tell
>
> "Alahen said “Azawan sings.”"

| Agalan | Use | English | Cue |
|--------|-----|---------|-----|
| **a** | **multi-token open** — stays open until an explicit close (default) | `d[…]` … `]` (needs close) | **a** ≈ add (push more tokens) |
| **e** | **clause-scoped** — ends before the next speech-act `/y/` or clause-level `/x/` join | `d[…` run to clause end (no close) | **e** ≈ order (this clause only) |
| **o** | **atomic** — exactly **one** following token | `d[azawan]`, <code>d&lt;kimchi&gt;</code> | **o** ≈ one |
| **u** | **empty / redacted** — no interior; also **resume** **-r** | `d[]`, `d[=]` | **u** ≈ undo (nothing inside) |

Resume **-r** always uses EDGE **`u`** (`daxur`).

EDGE **`a`** / **`e`** / **`o`** take **-l** / **-m** / **-n**. EDGE **`u`** takes exact **-l** (`daxul`) or resume **-r** (`daxur`).

### Endings on opens and span pronouns {#endings}

Beginner already used a bare open, **`~`**, **`@`**, and **`[=]`**. Speech puts the same jobs on **-l** / **-m** / **-n** / **-r**.

| Agalan | Use | English | Cue |
|--------|---------|---------|-----|
| **-l** | **exact** — verbatim / precise surface | bare open (no `@` / `~`) | **-l** stand behind the wording |
| **-m** | **paraphrase** — gist / non-verbatim rendering | **`~`** after the role letter (`d~[…]`) | **-m** leaves the hold open |
| **-n** | **proper** — cite: the **work**; mention: the **name** | **`@`** after the role letter (`d@[…]`, `d@{…}`) | **-n** titles the chunk; interior words keep their own endings |
| **-r** | **resume** — the **most recent span of this TYPE**; PoS = role **now** | `d[=]`, `th(=)`, `z{=}`, … | **-r** points back |

Hedged proper (`@~`) is written **`d@[…]`** only (spoken as the **proper** open with uncertain tone). **`@`** / **`~`** do not combine with resume **-r**.

**-r** resumes a prior span ([pronouns.md](pronouns.md)). `daxur` is *that (cite)* as object, matching the most recent **cite** (TYPE **a**). `thexur` / `th(=)` is *that (aside)*. The resume’s role letter need not match the earlier open’s (`zaxur` = that cite as subject). No interior; no close (EDGE **`u`**).

> `zazawan daxal zalahen varahal xuxul vezebel. zahaben daxur vezebel.`
>
> z-Azawan | d-CITE.multi[z-Alahen | v-run] | v-tell . z-Ahaben | d-←cite-x-multi | v-tell
>
> "Azawan says, 'Alahen runs.' Ahaben says that too."

### Writing ↔ speech map

Beginner brackets map to these spoken opens and closes.

| Writing | Speech (object slot) | Notes |
|---------|----------------------|-------|
| `d[…]` | `daxal` … `xuxul` | exact multi-token cite (EDGE **a**); matching close |
| `d~[…]` | `daxam` … `xuxul` | paraphrased multi-token cite |
| `d@[…]` | `daxan` … `xuxul` | proper multi-token cite; also spelling of hedged proper |
| `d{…}` / `d~{…}` / `d@{…}` | `doxal` / `doxam` / `doxan` … `xuxul` | mention |
| `th(…)` / `th~(…)` / `th@(…)` | `thexal` / `thexam` / `thexan` … `xuxul` | aside (open PoS is `/th/`) |
| `th(hazaham)` | `thexol hazaham` | atomic aside |
| `th(=)` | `thexur` | aside resume |
| `d<…>` / `d~<…>` / `d@<…>` | `duxal` / `duxam` / `duxan` … `xuxul` | opaque |
| `d[azawan]` | `daxol azawan` | atomic (EDGE **o**) |
| `d@[onodan alahen]` | `daxan onodan alahen xuxul` | proper multi-token cite (the work) |
| `d[…` … (to clause end) | `daxel` … | clause-scoped (EDGE **e**) |
| `d[]` | `daxul` | empty / redacted (EDGE **u**) |
| `d[=]` | `daxur` | resume (EDGE **u**) |

The close does not repeat PoS, TYPE, EDGE, or open fidelity. Explicit close for EDGE **a** is **`xuxul`**.

### Nesting {#nesting}

When one packaged chunk sits inside another (a quote that contains a parenthetical, or a cite wrapping a mention), each typed fence nests. A multi-token open starts a layer; **`xuxul`** closes the innermost layer. Atomic opens and resumes do not start a new layer. **`@`** / **`~`** apply only to the immediately following open.

> `zazawan d[ th(hazaham) azawan ] vezebel.`
>
> z-Azawan | d-CITE[th-ASIDE[h-happy] | Azawan] | v-tell
>
> "Azawan said “Azawan” (happily)." (hello)

The same nest works as `d[ z{…} ]` or `d~[ d<…> ]`.

### Scope islands {#scope-islands}

Sometimes *possibility* or a join should apply only to a multi-word chunk, not the whole clause. Writing marks that chunk with **`^ … ^`**. Speech has no open or close word for those edges: you hear a pause and one tight phrase. The binder **inside** does the work.

> `zazawan ^ hegewem zodogal geredal ^ vahahal.`
>
> z-Azawan | SCOPE[h-possibility | [z-dog | g-red]] | v-see
>
> "Azawan saw, as a possibility, the red dog." (*possibility* targets that chunk).

A [tone mark](speech-moves.md#tone-marks) written right before the opening `^` colors the whole island (`!^ hegewem zodogal geredal ^`).

**Compare with:** quoting, asides, mentions, and opaque blobs use typed [span fences](#writing) (`d[…]`, `th(…)`). Islands only group so a binder inside can target that chunk.

- No role letter on the edges.
- **At most one phrase.** After its binder, an island holds at most one phrase: a `/z/`, `/d/`, or `/b/` noun phrase, a `/v/` verb phrase, or a `/ɡ/` stack, with that phrase’s own adjectives, `/w/` detail, and join. An `/h/` word is a binder, never the phrase.
- **It may close early.** The island can stop partway through its phrase; the pause marks where. By the end of the phrase at the latest, it has closed: a new role letter or the outer join always comes after the island.
- **Hosts keep their `/b/`.** A host (`/ɡ/`, `/h/`, `/th/`) and its hosted `/b/` are both inside the island or both outside.
- **One island per clause.** Islands do not nest.
- Empty `^^` has no reading.
- **Binder required:** at least one scope-taking `/h/` or `/th/` and/or a [join](joins.md#scope-islands-join) particle **inside**.
- Prefer spaces inside: `^ hegewem zodogal geredal ^`.

| Binder | Use inside the island |
|--------|------------------------|
| Scope-taking **`/h/`** or **`/th/`** | frames that **chunk** (prefer first in the island; see the `/b/` exception below) |
| Prefixed **join** | joins **only** matching-role material **inside** — [scope islands](joins.md#scope-islands-join) |

`/h/` and a join may share one island (`^ hegewem zazawan zalahen zam ^`).

| Placement | Reading |
|-----------|---------|
| `/h/` or `/th/` **inside** | frames that chunk |
| `/h/` or `/th/` **outside** | ordinary floating word: frames the verb / clause |
| Join **inside** | joins only interior conjuncts |
| Join **outside** with island nearby | ordinary lookback (edges do not filter an outside join) |

> `zazawan ^ zalahen zal ^ zam vahahal.`
>
> [z-Azawan | SCOPE[z-Alahen | z-and] | z-and.open] | v-see
>
> "Azawan and (just Alahen) saw …."

A `/b/` right after an `/h/` word is hosted by it ([extra nouns](clause.md#extra-nouns)). To put a recipient `/b/` in an island, write it **before** the binder:

> `zazawan ^ balahen hegewem ^ vezebel.`
>
> z-Azawan | SCOPE[b-Alahen | h-possibility] | v-tell
>
> "Azawan tells, possibly, Alahen."

The word before the island must not be a `/ɡ/`, `/h/`, or `/th/` word either, or it would host that `/b/` across the edge.

An island can hold part of a phrase. Here only *not small* is grouped, so **`gul`** denies *small* alone and **`gal`** adds it to *red*:

> `zodogal geredal ^ gamazam gul ^ gal vowogal.`
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

| English | Agalan |
|---------|--------|
| *Azawan* | `azawan` |
| *Alahen* | `alahen` |
| *Ahaben* | `ahaben` |
| *tell* | `vezebel` |
| *see* | `vahahal` |
| *attest* | `vodul` |
| *lie* (verb) | `valahal` |
| *lie* (noun) | `alahal` |
| *scream* | `vezogel` |
| *punch* | `vabahel` |
| *Judge* | `ahahon` |
| *small* | `gamazam` |
| *happy* | `hazaham` |
| *possibility* | `hegewem` |
| *FBI* | <code>d&lt;FBI&gt;</code> |

#### English → Agalan {#intermediate-english-to-agalan}

**1.** *Azawan said “Azawan.”* (spoken atomic cite)

::: details Show answer
`zazawan daxol azawan vezebel.`

z-Azawan | d-CITE.atomic[Azawan] | v-tell
:::

**2.** *Alahen said “Azawan attests.”* (spoken multi-token cite)

::: details Show answer
`zalahen daxal zazawan vodul xuxul vezebel.`

z-Alahen | d-CITE.multi[z-Azawan | v-attest] | v-tell
:::

**3.** *Ahaben said that.* (spoken cite resume)

::: details Show answer
`zahaben daxur vezebel.`

z-Ahaben | d-←cite.spoken | v-tell
:::

**4.** *Azawan said \[redacted\].*

::: details Show answer
`zazawan daxul vezebel.`

z-Azawan | d-CITE.empty[] | v-tell
:::

**5.** *Alahen saw FBI.* (spoken atomic opaque)

::: details Show answer
`zalahen duxol FBI vahahal.`

z-Alahen | d-OPAQUE.atomic["FBI"] | v-see
:::

**6.** *Azawan said “Azawan” (happily).* (cite nesting an aside)

::: details Show answer
`zazawan d[ th(hazaham) azawan ] vezebel.`

z-Azawan | d-CITE[th-ASIDE[h-happy] | Azawan] | v-tell
:::

**7.** *Azawan saw, as a possibility, the lie.* (*possibility* targets that chunk)

::: details Show answer
`zazawan ^ hegewem dalahal ^ vahahal.`

z-Azawan | SCOPE[h-possibility | d-lie] | v-see
:::

**8.** *Alahen and (just Azawan) punched.*

::: details Show answer
`zalahen ^ zazawan zal ^ zam vabahel.`

[z-Alahen | SCOPE[z-Azawan | z-and] | z-and.open] | v-punch
:::

**9.** *The phrase “alahen vodul” is small.* (spoken multi-token mention)

::: details Show answer
`zoxal alahen vodul xuxul gamazam.`

z-MENTION.multi["alahen" | "vodul"] | g-small
:::

**10.** *Ahaben saw, as a possibility, the lie!* (strong feeling on that chunk)

::: details Show answer
`zahaben !^ hegewem dalahal ^ vahahal.`

z-Ahaben | !SCOPE[h-possibility | d-lie] | v-see
:::

#### Agalan → English {#intermediate-agalan-to-english}

**1.** `zazawan vezebel daxel azawan.`

::: details Show answer

z-Azawan | v-tell | d-CITE.clause[Azawan]

*Azawan said “Azawan.”* (hello; the cite runs to the clause end, so the verb comes first)
:::

**2.** `zazawan daxam zazawan vodul xuxul vezebel.`

::: details Show answer

z-Azawan | d-CITE.multi.about[z-Azawan | v-attest] | v-tell

*Azawan said something like “Azawan attests.”*
:::

**3.** `zaxur gamazam.`

::: details Show answer

z-←cite.spoken | g-small

*That (cite) is small.*
:::

**4.** `zahaben doxon ahahon vezebel.`

::: details Show answer

z-Ahaben | d-NAME.MENTION.atomic["ahahon"] | v-tell

*Ahaben said the name “Ujudun.”*
:::

**5.** `zazawan vezehel thexol hazaham.`

::: details Show answer

z-Azawan | v-sing | th-ASIDE.atomic[h-happy]

*Azawan sings (happily).*
:::

**6.** `zoxol ahahol gamazam.`

::: details Show answer

z-MENTION.atomic["ahahol"] | g-small

*The word “ahahol” is small.*
:::

**7.** `zalahen ^ hegewem dalahal ^ vahahal.`

::: details Show answer

z-Alahen | SCOPE[h-possibility | d-lie] | v-see

*Alahen saw, as a possibility, the lie.*
:::

**8.** `zazawan vezebel thexal zalahen valahal xuxul.`

::: details Show answer

z-Azawan | v-tell | th-ASIDE.multi[z-Alahen | v-lie]

*Azawan tells (Alahen lies).*
:::

**9.** `zoxal ahaben vezogel xuxul gamazam.`

::: details Show answer

z-MENTION.multi["ahaben" | "vezogel"] | g-small

*The phrase “ahaben vezogel” is small.*
:::

**10.** `zalahen ?^ zazawan zal ^ zam vabahel.`

::: details Show answer

[z-Alahen | ?SCOPE[z-Azawan | z-and] | z-and.open] | v-punch

*Alahen and (just Azawan?) punched.* (unsure about that chunk)
:::

## Advanced {#advanced}

### Close forms (complete / editorial / close-all)

You already close a multi-token span with **`xuxul`**, the spoken match for `]` / `}` / `)` / `>`. Two more close words: **`xuxur`** keeps the wording as written but marks that the span is cut off, trails off, or is defective; **`xuxum`** closes every still-open span at once.

> `zazawan daxal azawan xuxur vezebel.`
>
> z-Azawan | d-CITE.multi[Azawan]# | v-tell
>
> "Azawan said “Azawan…”" (hello, trailing off)

| Agalan | Use | English | Cue |
|--------|-----|---------|-----|
| **`xuxul`** | close **one** span, whole | matching closer `]` / `}` / `)` / `>` | **-l** exact: the span closes whole |
| **`xuxur`** | close **one** — **editorial** (wording kept as written: cut off, trail off, or defect noted) | `#]` / `#}` / `#)` / `#>` | **-r** resume: the wording stops short; resume may pick up |
| **`xuxum`** | close **all** open spans | optional close-all mark `\|` | **-m** soft: sweep everything |
| **`xuxur`** + **`xuxum`** | editorial innermost, then close all | `#\|` | |

```text
xuxul  =  x + u + x + u + l
xuxur  =  x + u + x + u + r
xuxum  =  x + u + x + u + m
```

An editorial span still counts as said: resume (`d[=]` / `daxur`) may point back to it. Combined `#\|` is two spoken closes in writing; write editorial first, then close-all. Bare `xuxur` closes one (editorial).

**Not the same job as:** a clause join (`xul` / `xum`, which go between clauses). Empty and resume forms are **opens** with a role letter (`daxul` redacted; `daxur` that cite). Closes are **`xuxul`** / **`xuxur`**.

| Writing | Speech | Notes |
|---------|--------|-------|
| `d[…#]` | `daxal` … `xuxur` | editorial close |
| `d[…#\|]` | `daxal` … <!-- lint: fragment -->`xuxur xuxum` | editorial + close-all |

For a cut-off cite, use EDGE **`a`** + **`xuxur`**. EDGE **`e`** already ends at the clause with a whole close.

### Translation practice {#advanced-translation-practice}
<a id="translation-practice-advanced"></a>

Short drills for Advanced. Try each item before opening **Show answer**.

**Setting:** a code review

**Roots used here:**

| English | Agalan |
|---------|--------|
| *Azawan* | `azawan` |
| *Alahen* | `alahen` |
| *Ahaben* | `ahaben` |
| *tell* | `vezebel` |
| *bug* | `abogam` |
| *happy* | `hazaham` |

#### English → Agalan {#advanced-english-to-agalan}

**1.** *Ahaben said “bug.”* (complete close of one span)

::: details Show answer
`zahaben daxal abogam xuxul vezebel.`

z-Ahaben | d-CITE.multi[flaw] | v-tell
:::

**2.** *Alahen said “bug…”* (the cite trails off)

::: details Show answer
`zalahen daxal abogam xuxur vezebel.`

z-Alahen | d-CITE.multi[flaw]# | v-tell
:::

**3.** *Azawan said “bug” (happily), then close every open span at once.*

::: details Show answer
`zazawan daxal thexol hazaham abogam xuxum vezebel.`

z-Azawan | d-CITE.multi[th-ASIDE.atomic[h-happy] | flaw]| | v-tell
:::

#### Agalan → English {#advanced-agalan-to-english}

**1.** `zazawan d[abogam#] vezebel.`

::: details Show answer

z-Azawan | d-CITE[flaw]# | v-tell

*Azawan said “bug…”*
:::

**2.** `zalahen daxal abogam xuxur xuxum vezebel.`

::: details Show answer

z-Alahen | d-CITE.multi[flaw]# | x-span-close-all | v-tell

*Alahen said “bug…”*
:::

**3.** `zahaben d[abogam#|] vezebel.`

::: details Show answer

z-Ahaben | d-CITE[flaw]#| | v-tell

*Ahaben said “bug…”*
:::

## Reference tables {#reference-tables}

Lookup grids that restate forms taught above; nothing here is new.

### Spoken inventory
<a id="inventory"></a>

The rest of the spoken open map (PoS shown as `…`; EDGE **a** unless noted).

| TYPE | exact multi **-l** | paraphrase **-m** | proper **-n** | resume **-r** (EDGE **u**) |
|------|--------------------|-------------------|---------------|------------------------------|
| cite **a** | `…axal` | `…axam` | `…axan` | `…axur` |
| aside **e** | `thexal` | `thexam` | `thexan` | `thexur` |
| mention **o** | `…oxal` | `…oxam` | `…oxan` | `…oxur` |
| opaque **u** | `…uxal` | `…uxam` | `…uxan` | `…uxur` |

Atomic (EDGE **o**): `…axol` / `…axom` / `…axon` (cite examples); aside atomic **`thexol`**. Clause-scoped (EDGE **e**): `…axel` / `…axem` / `…axen`. Empty exact (EDGE **u**): `…axul` / `thexul` / `…oxul` / `…uxul`. Aside **opens** use `/th/`; resume may recast the aside into another slot (`dexur`).

| Form | Use |
|------|-----|
| `xuxul` | close one — whole |
| `xuxur` | close one — editorial |
| `xuxum` | close all |
| <!-- lint: fragment -->`xuxur xuxum` | editorial + close all (writing `#\|`) |

## See also

- Scope islands: [joins.md](joins.md#scope-islands-join)
- Identity vs parenthetical comment: [predication.md](predication.md#identity)
- Phrasal proper names: [word-endings.md](word-endings.md#phrasal-proper-names)
- Titled phrases (hook / join / span): [word-endings.md](word-endings.md#titled-phrases)
- Prefix-less citation outside a clause: [word-endings.md](word-endings.md#citation-forms)
