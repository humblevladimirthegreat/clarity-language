---
band: intermediate
---

# Scope islands {#scope-islands-sitting}

### Scope islands {#scope-islands}

Sometimes a word like *possibly*, or a join, should apply to only part of the sentence, a chunk of several words, not the whole clause. Put that chunk in braces **`{ … }`**, with the word that applies to it inside. That word is the island’s **binder**: it reaches only what the braces hold. Braces have no other use. Speech has no word for the edges: you hear a pause, then one tight phrase.

> `zazozon { hogugem zodozel gerulol } vayebel.`
>
> z-Azozon | SCOPE[h-possibility | [z-dog | g-red]] | v-see
>
> "Azozon saw what was possibly a red dog."

Here `hogugem` reaches only *a red dog*, not the seeing.

A [tone mark](tone-marks.md#tone-marks) written right before the opening brace colors the whole island (`!{ hogugem zodozel gerulol }`).

**Compare with:** quoting, asides, mentions, and opaque text use [spans](/spans#writing) (`d[…]`, `th(…)`, <code>d&lt;…&gt;</code>). Islands only group so a binder inside can target that chunk.

- No role letter on the edges.
- **At most one phrase.** After its binder, an island holds at most one phrase: a `/z/`, `/d/`, or `/b/` noun phrase, a `/v/` verb phrase, or a `/ɡ/` stack, with that phrase’s own adjectives, `/w/` detail, and join. An `/h/` word is a binder, never the phrase.
- **It may close early.** The island can stop partway through its phrase; the pause marks where. By the end of the phrase at the latest, it has closed: a new role letter or the outer join always comes after the island.
- **Hosts keep their `bl-` word.** A host (`/ɡ/`, `/h/`, `/th/`) and its `bl-` word are both inside the island or both outside. A plain `/b/` is the recipient, not a host's partner, so it may sit on either side of an edge.
- **One island per clause.** Islands do not nest.
- Empty `{ }` has no reading.
- **Binder required:** at least one scope-taking `/h/` or `/th/` (a word, like *possibly*, that frames what it reaches) and/or a join particle inside. A [hook](/hooks) is never a binder. A hook already reaches its whole stretch: `/w/` right before it grades the whole span, and a hook after a noun belongs to that noun.
- Prefer spaces inside: `{ hogugem zodozel gerulol }`.

| Binder | Use inside the island |
|--------|------------------------|
| Scope-taking `/h/` or `/th/` | frames that chunk (prefer first in the island; see the `/b/` exception below) |
| Prefixed join | joins only matching-role material inside |

`/h/` and a join may share one island (`{ hogugem zazozon zalazun zam }`).

| Placement | Reading |
|-----------|---------|
| `/h/` or `/th/` inside | frames that chunk |
| `/h/` or `/th/` outside | ordinary floating word: frames the verb / clause |
| Join inside | joins only interior conjuncts |
| Join outside with island nearby | ordinary lookback (edges do not filter an outside join) |

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

An island can hold part of a phrase. Here only *not small* is grouped, so `gul` denies *small* alone and `gal` adds it to *red*:

> `zodozel gerulol { gamezem gul } gal vowurol.`
>
> [z-dog | [g-red | SCOPE[g-small | g-not] | g-and]] | v-walk
>
> "A dog that is red and not small walks."

To say an island aloud, leave a break before the island (the next beat comes half a beat late), say it as one tight phrase, and leave another break after its last word. In singing, phrase it as its own short phrase. Because an island never runs past one phrase, a listener who misses the closing break is off by at most part of that phrase.

### Practice {#intermediate-practice}

Short drills for Intermediate. Try each item before opening **Show answer**.

**Setting:** a news ticker

**New words:**

| English | Ageben | Cue |
|---------|--------|-----|
| *possibility* | `hogugem` | ❓ from *question mark* |
| *newspaper* | `unonal` | 📰 |

**Review:**

| English | Ageben |
|---------|--------|
| *Azozon* | `azozon` |
| *Alazun* | `alazun` |
| *Ahelan* | `ahelan` |
| *untruth* | `dulamul` |
| *small* | `gamezem` |
| *tell* | `vezuyol` |
| *see* | `vayebel` |
| *red* | `gerulol` |

#### English → Ageben {#intermediate-english-to-ageben}

**1.** *Alazun talks, possibly to Ahelan.*

::: details Show answer
`zalazun { bahelan hogugem } vezuyol.`

z-Alazun | SCOPE[b-Ahelan | h-possibility] | v-tell
:::

**2.** *Azozon saw what was possibly a newspaper.*

::: details Show answer
`zazozon { hogugem dunonal } vayebel.`

z-Azozon | SCOPE[h-possibility | d-newspaper] | v-see
:::

**3.** *Alazun and (just Azozon) talk.*

::: details Show answer
`zalazun { zazozon zal } zam vezuyol.`

[z-Alazun | SCOPE[z-Azozon | z-and] | z-and.open] | v-tell
:::

#### Ageben → English {#intermediate-ageben-to-english}

**1.** `zahelan !{ hogugem dulamul } vayebel.`

::: details Show answer
z-Ahelan | !SCOPE[h-possibility | d-untruth] | v-see

*Ahelan saw what was possibly an untruth!*
:::

**2.** `zazozon { hogugem zunonal gerulol } vayebel.`

::: details Show answer
z-Azozon | SCOPE[h-possibility | [z-newspaper | g-red]] | v-see

*Azozon saw what was possibly a red newspaper.*
:::

**3.** `zahelan dunonal gerulol { gamezem gul } gal vayebel.`

::: details Show answer
z-Ahelan | [d-newspaper | [g-red | SCOPE[g-small | g-not] | g-and]] | v-see

*Ahelan sees a newspaper that is red and not small.*
:::

#### Pick one {#intermediate-pick-one}

**1.** *Azozon saw what was possibly an untruth.* `zazozon { hogugem dulamul } vayebel.` or `zazozon hogugem dulamul vayebel.`

::: details Show answer
`zazozon { hogugem dulamul } vayebel.`

z-Azozon | SCOPE[h-possibility | d-untruth] | v-see

Inside braces, **`hogugem`** reaches only that chunk; outside, it frames the whole seeing.
:::

#### Fix it {#intermediate-fix-it}

**1.** *Azozon talks, possibly to Alazun.* <!-- lint: error -->`zazozon hogugem balazun vezuyol.`

::: details Show answer
`zazozon { balazun hogugem } vezuyol.`

z-Azozon | SCOPE[b-Alazun | h-possibility] | v-tell

The binder sits **inside** the island with the recipient it frames.
:::

