---
band: advanced
---

# Span nesting {#editorial-close-and-nesting}

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
| *Ahelan* | `ahelan` |
| *page* | `ebonel` |
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

**3.** *Ahelan said “flaw…”* (the quote trails off; close every open bracket at once)

::: details Show answer
`zahelan d[abezum#|] vezuyel.`

z-Ahelan | d-CITE[flaw]#| | v-tell
:::

**4.** *Uzozen sees “flaw…” on the page.*

::: details Show answer
`zuzozen d[abezum#] vawebol ael bebonel.`

z-Uzozen | d-CITE[flaw]# | v-see | [on | b-page]
:::

#### Agebon → English {#advanced-agebon-to-english}

**1.** `zahelan d[abezum] varayel.`

::: details Show answer
z-Ahelan | d-CITE[flaw] | v-write

*Ahelan wrote “flaw.”*
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

**4.** `zolazun d[abezum#] vezuyel. zahelan dwuder varayel.`

::: details Show answer
z-Olazun | d-CITE[flaw]# | v-tell . z-Ahelan | d-←episode-patient.same | v-write

*Olazun said “flaw…” Ahelan wrote that down.*
:::

#### Pick one {#advanced-pick-one}

**1.** *Ahelan said “flaw…”* (the quote trails off) `zahelan d[abezum#] vezuyel.` or `zahelan d[abezum] vezuyel.`

::: details Show answer
`zahelan d[abezum#] vezuyel.`

z-Ahelan | d-CITE[flaw]# | v-tell

**`#`** inside the closer keeps the wording but marks it cut off; a plain closer says it is complete.
:::

#### What changes {#advanced-what-changes}

**1.** `zuzozen d[abezum#] vezuyel.` / `zuzozen d[abezum#|] vezuyel.`

::: details Show answer
z-Uzozen | d-CITE[flaw]# | v-tell

z-Uzozen | d-CITE[flaw]#| | v-tell

Both quotes trail off; with **`|`**, the closer also shuts every span still open.
:::
