# Spans

When you set wording apart from the rest of the sentence (a quote, a parenthetical, a loan surface), Agalan packages that chunk in a **span fence**. In writing you put a role letter, then a pair of brackets around the interior. That first letter is the chunk’s role in the outer sentence (subject, object, verb, or adverb).

## Beginner {#beginner}

Start with a quote of what someone said.

### Cite (`[…]`) {#writing}
<a id="writing-vs-speech"></a>

A **cite** holds wording you are quoting: what someone said, a title string, or a proverb **as wording**. Write the role letter, then square brackets around the quoted text. (cue: `[…]` like quote marks)

Start with one quoted token as the object of *said*. A [greeting](word-endings.md#greeting) is the named citation, so the quoted hello is that same name:

> `zazawan d[azawan] vezehel.`
>
> z-Azawan | d-CITE[Azawan] | v-tell
>
> "Azawan said “Azawan.”" (hello)

The whole `d[azawan]` is the direct object (who or what is acted on). If the interior is Agalan words in a clause, those inner words still start with their own role letters.

### Exact, paraphrase, proper
<a id="when-required"></a>

You can mark how faithful the quote is. Put the mark **after** the role letter, before the opening bracket.

Verbatim wording is **exact**: no extra mark (`d[azawan]`). When you mean the gist, not the exact words, write **`~`** (`d~[zazawan vuzunul]`). When the chunk is the **work** that bears a **multi-word** title (the song, proverb, book — not the name-string), write **`@`** (`d@[uzugon ululon]`). A one-word work or person is ordinary **-n** (`duzugon`), not `d@[uzugon]`, unless the role letter or the ending is **part of the title** you are packaging. **`@`** / spoken **-n** is on the **fence**; words inside keep their usual endings ([titled phrases](word-endings.md#titled-phrases)).

| Agalan | Use | English | Cue |
|--------|-----|---------|-----|
| *(none)* | exact | verbatim wording | bare brackets already quote; extra ink would hedge |
| **`~`** | paraphrase | the gist, not the exact words | **~** looks like “about / approximately” |
| **`@`** | proper | the work known by that title | **@** like a social media handle |

> `zululon d~[zazawan vuzunul] vuwurul.`
>
> z-Ululon | d-CITE.about[z-Azawan | v-sing] | v-write
>
> "Ululon wrote something like “Azawan sings.”"

> `zuhubun d@[uzugon ululon] vuzunul.`
>
> z-Uhubun | d-NAME.CITE[Uzugon | Ululon] | v-sing
>
> "Uhubun sang Uzugon Ululon."

### Resume (`[=]`)

To point back at a prior span without repeating its interior, put **`=`** inside the same brackets: `d[=]`. The letter on the resume is the role this pointer plays in *this* sentence (here still the object of *said*).

> `yol zululon d[=] vezehel.`
>
> y-question | z-Ululon | d-←cite | v-tell
>
> "Ululon said that?!"

### Mention (`{…}`)

A **mention** holds a **word or phrase** as that spelling, not a quote of speech. Write the role letter, then curly braces around it. English says *the word …* or *the phrase …* and keeps the Agalan interior (`odogo`, not *dog*). To quote what someone said, use [cite](#writing).

> `z{odogo} gumuzem.`
>
> z-MENTION["odogo"] | g-small
>
> "The word “odogo” is small."

> `z{zazawan vuzunul} gumuzem.`
>
> z-MENTION["zazawan vuzunul"] | g-small
>
> "The phrase “zazawan vuzunul” is small."

With **`@`**, mention is the **name** (the title-string you could rename), even as **one word**: `d@{uzugon}` is not `duzugon`. Cite with **`@`** is the **work**; that span is for a **multi-word** title (`d@[uzugon ululon]`). One-word *Uzugon* as the work is ordinary **-n** (`duzugon`).

> `zazawan d@[uzugon ululon] vogozom.`
>
> z-Azawan | d-NAME.CITE[Uzugon | Ululon] | v-rejection
>
> "Azawan dislikes Uzugon Ululon." (the work)

> `zazawan d@{uzugon} vogozom.`
>
> z-Azawan | d-NAME.MENTION["uzugon"] | v-rejection
>
> "Azawan dislikes the name “uzugon.”" (might still like the work)

**Compare with:** `duzugon` is *Uzugon* (the work or person). `d@{uzugon}` is only the **name**.

### Opaque and loan words {#loans}

**Opaque** holds a foreign, code, or raw surface that is not ordinary Agalan words. Write the role letter, then angle brackets around that blob. Do not put an extra letter after `>`. Faithfulness uses the same marks as cite: none / **`~`** / **`@`**, and resume uses **`=`** inside (`d<=>`).

> <code>zazawan d&lt;kimchi&gt; vejel.</code>
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

> `zazawan vawalal th(huzumum).`
>
> z-Azawan | v-walk | th-ASIDE[h-happy]
>
> "Azawan walks (happily)."

> `zazawan vawalal th(zululon velebel).`
>
> z-Azawan | v-walk | th-ASIDE[z-Ululon | v-sleep]
>
> "Azawan walks (Ululon sleeps)."

A one-word manner with nothing to package is a plain adverb: `zazawan vawalal huzumum.`

**For *because* / *if*, use:** [**`barl`**](dependents.md#dependent-clauses) dependents, not an aside.

**Compare with:** a second name for the same person uses [identity](predication.md#identity) (`gonunu` + `/b/`), not an aside.

### Outer slot {#pos}

The letter on the open is the role of the **entire span** in the outer sentence. Ask what that chunk is doing out there: object of *said*, subject of *is small*, and so on. A cite can be the **verb** when you echo the act as wording:

> `yul zululon v[vozodol].`
>
> y-prohibition | z-Ululon | v-CITE[v-stop]
>
> "Don’t say “stop,” Ululon."

| Agalan | Use | English | Cue |
|--------|-----|---------|-----|
| `/d/` | object | *said / wrote / saw “…”* (`d[azawan]`, `d[=]`, <code>d&lt;kimchi&gt;</code>) | **d** ≈ done to |
| `/z/` | subject | the word or phrase **is** the subject (`z{odogo}`) | **z** ≈ star (who it is about) |
| `/v/` | verb | echo the act as wording (`v[vozodol]`) | **v** as in English *verb* |
| `/th/` | stance | asides (`th(…)`) | **th** ≈ *think* (your side comment) |

If the interior is Agalan words, those inner words still start with **their** role letters.

### Translation practice {#beginner-translation-practice}

Short drills for Beginner. Try each item before opening **Show answer**.

**Setting:** a rehearsal

**Roots used here:**

| English | Agalan | Same root as | Cue |
|---------|--------|--------------|-----|
| *Azawan* | `azawan` | | |
| *Ululon* | `ululon` | | |
| *Uhubun* | `uhubun` | | |
| *tell* | `vezehel` | | |
| *write* | `vuwurul` | | |
| *see* | `vejel` | | |
| *sing* | `vuzunul` | | |
| *stop* | `vozodol` | | |
| *Uzugon* | `uzugon` | | |
| *melody* | `uzugol` | | |
| *small* | `gumuzem` | `umuzel` *mouse* | 🐁: a mouse is little |
| *happy* | `huzumum` | | |
| *kimchi* | <code>d&lt;kimchi&gt;</code> | | |
| *Sam* | <code>@&lt;Sam&gt;</code> | | |

#### English → Agalan {#beginner-english-to-agalan}

**1.** *Azawan said “Azawan.”* (hello)

::: details Show answer
`zazawan d[azawan] vezehel.`

z-Azawan | d-CITE[Azawan] | v-tell
:::

**2.** *Ululon wrote something like “Azawan sings.”*

::: details Show answer
`zululon d~[zazawan vuzunul] vuwurul.`

z-Ululon | d-CITE.about[z-Azawan | v-sing] | v-write
:::

**3.** *The word “uzugo” is small.*

::: details Show answer
`z{uzugo} gumuzem.`

z-MENTION["uzugo"] | g-small
:::

**4.** *Azawan saw kimchi.* (foreign surface)

::: details Show answer
<code>zazawan d&lt;kimchi&gt; vejel.</code>
:::

**5.** *Uhubun sang Uzugon.* (one-word work: ordinary **-n**)

::: details Show answer
`zuhubun duzugon vuzunul.`

z-Uhubun | d-Uzugon | v-sing
:::

**6.** *Azawan sings (happily).*

::: details Show answer
`zazawan vuzunul th(huzumum).`

z-Azawan | v-sing | th-ASIDE[h-happy]
:::

**7.** *Don’t say “stop,” Ululon.*

::: details Show answer
`yul zululon v[vozodol].`

y-prohibition | z-Ululon | v-CITE[v-stop]
:::

**8.** *Ululon said that?!*

::: details Show answer
`yol zululon d[=] vezehel.`

y-question | z-Ululon | d-←cite | v-tell
:::

**9.** *The phrase “zazawan vuzunul” is small.*

::: details Show answer
`z{zazawan vuzunul} gumuzem.`

z-MENTION["zazawan vuzunul"] | g-small
:::

#### Agalan → English {#beginner-agalan-to-english}

**1.** <code>zululon d&lt;kimchi&gt; vejel.</code>

::: details Show answer
*Ululon saw kimchi.* (opaque surface)
:::

**2.** `zazawan d{uzugo} vejel.`

::: details Show answer

z-Azawan | d-MENTION["uzugo"] | v-see

*Azawan saw the word “uzugo.”*
:::

**3.** `zuhubun d@{uzugon} vuwurul.`

::: details Show answer

z-Uhubun | d-NAME.MENTION["uzugon"] | v-write

*Uhubun wrote the name “uzugon.”*
:::

**4.** `z{uzugo} gumuzem.`

::: details Show answer

z-MENTION["uzugo"] | g-small

*The word “uzugo” is small.*
:::

**5.** <code>z@&lt;Sam&gt; d[azawan] vezehel.</code>

::: details Show answer
*Sam said “Azawan.”* (hello)
:::

**6.** <code>@&lt;Sam&gt;</code>

::: details Show answer
*Sam*
:::

**7.** `zululon vezehel th(zazawan vuzunul).`

::: details Show answer

z-Ululon | v-tell | th-ASIDE[z-Azawan | v-sing]

*Ululon tells (Azawan sings).*
:::

**8.** `yol zuhubun d[=] vezehel.`

::: details Show answer

y-question | z-Uhubun | d-←cite | v-tell

*Uhubun said that?!*
:::

**9.** `z{zululon vezehel} gumuzem.`

::: details Show answer

z-MENTION["zululon vezehel"] | g-small

*The phrase “zululon vezehel” is small.*
:::

## Intermediate {#intermediate}

### Spoken word shape {#shape}

Beginner writing already packages a quote, mention, aside, or blob in brackets. Speech still has to say which slot the chunk fills, what kind of span it is, how far the open runs, and how faithful the wording is. The open is one word: role letter, then TYPE vowel, then mid-word **`x`**, then EDGE vowel, then the ending. That word stands where writing had `d[` or `th(`; a multi-token open still needs a close word later.

> `zazawan daxol azawan vezehel.`
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

**Compare with:** a native office name uses ordinary **-n** (`zabogon`) — [named handles](word-endings.md#named-handles). Mention `{abogo}` is that **word**; opaque / loan is a **foreign** acronym’s surface (<code>z@&lt;FBI&gt;</code>).

### EDGE (extent) {#edge}

A pair of brackets can wrap one token or many, run to the end of the clause, or hold nothing. In speech, the vowel **after** `x` is **EDGE**: it says whether the open waits for an explicit close, ends at the next turn or clause join, takes exactly one following token, or has no interior.

> `zululon daxal zazawan vuzunul xuxul vezehel.`
>
> z-Ululon | d-CITE.multi[z-Azawan | v-sing] | v-tell
>
> "Ululon said “Azawan sings.”"

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

> `zazawan daxal zululon vurunul xuxul vezehel. zuhubun daxur vezehel.`
>
> z-Azawan | d-CITE.multi[z-Ululon | v-run] | v-tell . z-Uhubun | d-←cite-x-multi | v-tell
>
> "Azawan says, 'Ululon runs.' Uhubun says that too."

### Writing ↔ speech map

Beginner brackets map to these spoken opens and closes.

| Writing | Speech (object slot) | Notes |
|---------|----------------------|-------|
| `d[…]` | `daxal` … `xuxul` | exact multi-token cite (EDGE **a**); matching close |
| `d~[…]` | `daxam` … `xuxul` | paraphrased multi-token cite |
| `d@[…]` | `daxan` … `xuxul` | proper multi-token cite; also spelling of hedged proper |
| `d{…}` / `d~{…}` / `d@{…}` | `doxal` / `doxam` / `doxan` … `xuxul` | mention |
| `th(…)` / `th~(…)` / `th@(…)` | `thexal` / `thexam` / `thexan` … `xuxul` | aside (open PoS is `/th/`) |
| `th(huzumum)` | `thexol huzumum` | atomic aside |
| `th(=)` | `thexur` | aside resume |
| `d<…>` / `d~<…>` / `d@<…>` | `duxal` / `duxam` / `duxan` … `xuxul` | opaque |
| `d[azawan]` | `daxol azawan` | atomic (EDGE **o**) |
| `d@[uzugon ululon]` | `daxan uzugon ululon xuxul` | proper multi-token cite (the work) |
| `d[…` … (to clause end) | `daxel` … | clause-scoped (EDGE **e**) |
| `d[]` | `daxul` | empty / redacted (EDGE **u**) |
| `d[=]` | `daxur` | resume (EDGE **u**) |

The close does not repeat PoS, TYPE, EDGE, or open fidelity. Explicit close for EDGE **a** is **`xuxul`**.

### Nesting {#nesting}

When one packaged chunk sits inside another (a quote that contains a parenthetical, or a cite wrapping a mention), each typed fence nests. A multi-token open starts a layer; **`xuxul`** closes the innermost layer. Atomic opens and resumes do not start a new layer. **`@`** / **`~`** apply only to the immediately following open.

> `zazawan d[ th(huzumum) azawan ] vezehel.`
>
> z-Azawan | d-CITE[th-ASIDE[h-happy] | Azawan] | v-tell
>
> "Azawan said “Azawan” (happily)." (hello)

The same nest works as `d[ z{…} ]` or `d~[ d<…> ]`.

### Scope islands {#scope-islands}

Sometimes *possibility* or a join should apply only to a multi-word chunk, not the whole clause. Writing marks that chunk with **`^ … ^`**. Speech has no open or close word for those edges: you hear a pause and one tight phrase. The binder **inside** does the work.

> `zazawan ^ huzurem zodogol garedel ^ vejel.`
>
> z-Azawan | SCOPE[h-possibility | [z-dog | g-red]] | v-see
>
> "Azawan saw, as a possibility, the red dog." (*possibility* targets that chunk).

A [tone mark](speech-moves.md#tone-marks) written right before the opening `^` colors the whole island (`!^ huzurem zodogol garedel ^`).

**Compare with:** quoting, asides, mentions, and opaque blobs use typed [span fences](#writing) (`d[…]`, `th(…)`). Islands only group so a binder inside can target that chunk.

- No role letter on the edges.
- **One island per clause.** Islands do not nest.
- Empty `^^` has no reading.
- **Binder required:** at least one scope-taking `/h/` or `/th/` and/or a [join](joins.md#scope-islands-join) particle **inside**.
- Prefer spaces inside: `^ huzurem zodogol garedel ^`.

| Binder | Use inside the island |
|--------|------------------------|
| Scope-taking **`/h/`** or **`/th/`** | frames that **chunk** (prefer first in the island) |
| Prefixed **join** | joins **only** matching-role material **inside** — [scope islands](joins.md#scope-islands-join) |

`/h/` and a join may share one island (`^ huzurem zazawan zululon zam ^`).

| Placement | Reading |
|-----------|---------|
| `/h/` or `/th/` **inside** | frames that chunk |
| `/h/` or `/th/` **outside** | ordinary floating word: frames the verb / clause |
| Join **inside** | joins only interior conjuncts |
| Join **outside** with island nearby | ordinary lookback (edges do not filter an outside join) |

> `zazawan ^ zululon zal ^ zam vejel.`
>
> [z-Azawan | SCOPE[z-Ululon | z-and] | z-and.open] | v-see
>
> "Azawan and (just Ululon) saw …."

**Speech:** brief reset into the island, one tight phrase, boundary on the last island stress. In singing, use an ordinary phrase bow.

### Translation practice {#intermediate-translation-practice}
<a id="translation-practice-intermediate"></a>

Short drills for Intermediate. Try each item before opening **Show answer**.

**Setting:** a courtroom

**Roots used here:**

| English | Agalan |
|---------|--------|
| *Azawan* | `azawan` |
| *Ululon* | `ululon` |
| *Uhubun* | `uhubun` |
| *tell* | `vezehel` |
| *see* | `vejel` |
| *attest* | `vadezel` |
| *lie* (verb) | `vululel` |
| *lie* (noun) | `ululel` |
| *scream* | `vazagal` |
| *punch* | `vubunul` |
| *Judge* | `ujudun` |
| *small* | `gumuzem` |
| *happy* | `huzumum` |
| *possibility* | `huzurem` |
| *FBI* | <code>d&lt;FBI&gt;</code> |

#### English → Agalan {#intermediate-english-to-agalan}

**1.** *Azawan said “Azawan.”* (spoken atomic cite)

::: details Show answer
`zazawan daxol azawan vezehel.`

z-Azawan | d-CITE.atomic[Azawan] | v-tell
:::

**2.** *Ululon said “Azawan attests.”* (spoken multi-token cite)

::: details Show answer
`zululon daxal zazawan vadezel xuxul vezehel.`

z-Ululon | d-CITE.multi[z-Azawan | v-attest] | v-tell
:::

**3.** *Uhubun said that.* (spoken cite resume)

::: details Show answer
`zuhubun daxur vezehel.`

z-Uhubun | d-←cite.spoken | v-tell
:::

**4.** *Azawan said \[redacted\].*

::: details Show answer
`zazawan daxul vezehel.`

z-Azawan | d-CITE.empty[] | v-tell
:::

**5.** *Ululon saw FBI.* (spoken atomic opaque)

::: details Show answer
`zululon duxol FBI vejel.`

z-Ululon | d-OPAQUE.atomic["FBI"] | v-see
:::

**6.** *Azawan said “Azawan” (happily).* (cite nesting an aside)

::: details Show answer
`zazawan d[ th(huzumum) azawan ] vezehel.`

z-Azawan | d-CITE[th-ASIDE[h-happy] | Azawan] | v-tell
:::

**7.** *Azawan saw, as a possibility, the lie.* (*possibility* targets that chunk)

::: details Show answer
`zazawan ^ huzurem dululel ^ vejel.`

z-Azawan | SCOPE[h-possibility | d-lie] | v-see
:::

**8.** *Ululon and (just Azawan) punched.*

::: details Show answer
`zululon ^ zazawan zal ^ zam vubunul.`

[z-Ululon | SCOPE[z-Azawan | z-and] | z-and.open] | v-punch
:::

**9.** *The phrase “ululon vadezel” is small.* (spoken multi-token mention)

::: details Show answer
`zoxal ululon vadezel xuxul gumuzem.`

z-MENTION.multi["ululon" | "vadezel"] | g-small
:::

**10.** *Uhubun saw, as a possibility, the lie!* (strong feeling on that chunk)

::: details Show answer
`zuhubun !^ huzurem dululel ^ vejel.`

z-Uhubun | !SCOPE[h-possibility | d-lie] | v-see
:::

#### Agalan → English {#intermediate-agalan-to-english}

**1.** `zazawan vezehel daxel azawan.`

::: details Show answer

z-Azawan | v-tell | d-CITE.clause[Azawan]

*Azawan said “Azawan.”* (hello; the cite runs to the clause end, so the verb comes first)
:::

**2.** `zazawan daxam zazawan vadezel xuxul vezehel.`

::: details Show answer

z-Azawan | d-CITE.multi.about[z-Azawan | v-attest] | v-tell

*Azawan said something like “Azawan attests.”*
:::

**3.** `zaxur gumuzem.`

::: details Show answer

z-←cite.spoken | g-small

*That (cite) is small.*
:::

**4.** `zuhubun doxon ujudun vezehel.`

::: details Show answer

z-Uhubun | d-NAME.MENTION.atomic["ujudun"] | v-tell

*Uhubun said the name “Ujudun.”*
:::

**5.** `zazawan vuzunul thexol huzumum.`

::: details Show answer

z-Azawan | v-sing | th-ASIDE.atomic[h-happy]

*Azawan sings (happily).*
:::

**6.** `zoxol ujudul gumuzem.`

::: details Show answer

z-MENTION.atomic["ujudul"] | g-small

*The word “ujudul” is small.*
:::

**7.** `zululon ^ huzurem dululel ^ vejel.`

::: details Show answer

z-Ululon | SCOPE[h-possibility | d-lie] | v-see

*Ululon saw, as a possibility, the lie.*
:::

**8.** `zazawan vezehel thexal zululon vululel xuxul.`

::: details Show answer

z-Azawan | v-tell | th-ASIDE.multi[z-Ululon | v-lie]

*Azawan tells (Ululon lies).*
:::

**9.** `zoxal uhubun vazagal xuxul gumuzem.`

::: details Show answer

z-MENTION.multi["uhubun" | "vazagal"] | g-small

*The phrase “uhubun vazagal” is small.*
:::

**10.** `zululon ?^ zazawan zal ^ zam vubunul.`

::: details Show answer

[z-Ululon | ?SCOPE[z-Azawan | z-and] | z-and.open] | v-punch

*Ululon and (just Azawan?) punched.* (unsure about that chunk)
:::

## Advanced {#advanced}

### Close forms (complete / editorial / close-all)

You already close a multi-token span with **`xuxul`**, the spoken match for `]` / `}` / `)` / `>`. Two more close words: **`xuxur`** keeps the wording as written but marks that the span is cut off, trails off, or is defective; **`xuxum`** closes every still-open span at once.

> `zazawan daxal azawan xuxur vezehel.`
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

**Not the same job as:** a negating clause join (`xul` / `xum`). Empty and resume forms are **opens** with a role letter (`daxul` redacted; `daxur` that cite). Closes are **`xuxul`** / **`xuxur`**.

| Writing | Speech | Notes |
|---------|--------|-------|
| `d[…#]` | `daxal` … `xuxur` | editorial close |
| `d[…#\|]` | `daxal` … <!-- lint: fragment -->`xuxur xuxum` | editorial + close-all |

For a cut-off cite, use EDGE **`a`** + **`xuxur`**. EDGE **`e`** already ends at the clause with a whole close.

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

### Literal content (fence words / fence marks)
<a id="literal-content"></a>
<a id="escape"></a>

When a span-marker word or a fence glyph (`[` / `]` / `{` / `}` / `(` / `)` / `<` / `>` / `=` / `|` / `#` / `^`) or a [tone mark](speech-moves.md#tone-marks) (`!` / `?`) must appear **as content**, wrap that token in **atomic opaque**. Writing and speech use the same vehicle. The outer span’s wording is the opaque **interior** (the wrapper is packaging, not extra cited words).

```agalan
d[ vuwurul d<]> ]
d[ d<xuxul> ]
d[ d<|> ]
d[ vezehel d<#> ]
```

Speech for a fence **word**:

```agalan
daxal duxol xuxul xuxul
```

`d[ vezehel d<#> ]` is a whole cite whose last content character is `#` (a bare `#]` would be editorial close). A hyphen before a closer is ordinary content.

Writing opaque `d<…>` closes on the first `>`. If the blob **contains** `>`, use the spoken opaque (EDGE **a** + **`xuxul`**):

```agalan
duxal code > 1 xuxul
```

**For *ordinals*, use:** [number words](numbers.md) with `#`. Inside a span, `#` is an editorial closer only when it sits immediately before `]` / `}` / `)` / `>` / `|`. `|` is close-all.

### Translation practice {#advanced-translation-practice}
<a id="translation-practice-advanced"></a>

Short drills for Advanced. Try each item before opening **Show answer**.

**Setting:** a code review

**Roots used here:**

| English | Agalan |
|---------|--------|
| *Azawan* | `azawan` |
| *Ululon* | `ululon` |
| *Uhubun* | `uhubun` |
| *tell* | `vezehel` |
| *write* | `vuwurul` |
| *bug* | `abugum` |
| *happy* | `huzumum` |

#### English → Agalan {#advanced-english-to-agalan}

**1.** *Uhubun said “bug.”* (complete close of one span)

::: details Show answer
`zuhubun daxal abugum xuxul vezehel.`

z-Uhubun | d-CITE.multi[flaw] | v-tell
:::

**2.** *Ululon said “bug…”* (the cite trails off)

::: details Show answer
`zululon daxal abugum xuxur vezehel.`

z-Ululon | d-CITE.multi[flaw]# | v-tell
:::

**3.** *Azawan said “bug” (happily), then close every open span at once.*

::: details Show answer
`zazawan daxal thexol huzumum abugum xuxum vezehel.`

z-Azawan | d-CITE.multi[th-ASIDE.atomic[h-happy] | flaw]| | v-tell
:::

**4.** *Azawan said “write ]”.*

::: details Show answer
<code>zazawan d[ vuwurul d&lt;]&gt; ] vezehel.</code>
:::

**5.** *Uhubun said “code > 1.”* (spoken opaque, because a writing angle-bracket fence would close on the first greater-than)

::: details Show answer
`zuhubun duxal code > 1 xuxul vezehel.`

z-Uhubun | d-OPAQUE.multi["code" | ">" | "1"] | v-tell
:::

#### Agalan → English {#advanced-agalan-to-english}

**1.** `zazawan d[abugum#] vezehel.`

::: details Show answer

z-Azawan | d-CITE[flaw]# | v-tell

*Azawan said “bug…”*
:::

**2.** `zululon daxal abugum xuxur xuxum vezehel.`

::: details Show answer

z-Ululon | d-CITE.multi[flaw]# | x-span-close-all | v-tell

*Ululon said “bug…”*
:::

**3.** `zazawan daxal duxol xuxul xuxul vezehel.`

::: details Show answer

z-Azawan | d-CITE.multi[d-OPAQUE.atomic["xuxul"]] | v-tell

*Azawan said “xuxul.”*
:::

**4.** <code>zululon d[ vuwurul d&lt;#&gt; ] vezehel.</code>

::: details Show answer
*Ululon said “write #.”*
:::

**5.** `zuhubun d[abugum#|] vezehel.`

::: details Show answer

z-Uhubun | d-CITE[flaw]#| | v-tell

*Uhubun said “bug…”*
:::

## See also

- Scope islands: [joins.md](joins.md#scope-islands-join)
- Identity vs parenthetical comment: [predication.md](predication.md#identity)
- Phrasal proper names: [word-endings.md](word-endings.md#phrasal-proper-names)
- Titled phrases (hook / join / span): [word-endings.md](word-endings.md#titled-phrases)
- Native office handles: [word-endings.md](word-endings.md#named-handles)
- Prefix-less citation outside a clause: [word-endings.md](word-endings.md#citation-forms)
