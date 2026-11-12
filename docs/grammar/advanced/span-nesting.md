---
band: advanced
---

# Closing and nesting spans {#closing-and-nesting-spans}

Two marks written just inside a span's closing bracket change how it closes: one keeps faulty wording as said, and one closes every open span at once. Spans can also sit inside one another, each closed by its own bracket.

### Editorial close and close-all {#close-forms-complete-editorial-close-all}

When you quote someone whose words were cut off or faulty, as in *Azozon said “bug…”*, you want to keep the words as said and show that they are flawed. A closing bracket normally ends one span, with its wording complete. Two written marks, placed just inside the closing bracket, change that. **`#`** keeps the wording as written but shows that it is cut off, trails off, or is faulty. **`|`** closes every span still open around it at once, so you need not write one closing bracket for each.

> `zazozon d[abezum#] vezuyol.`
>
> z-Azozon | d-CITE[flaw]# | v-tell
>
> "Azozon said “bug…”"

| Writing | Use | English | Cue |
|---------|-----|---------|-----|
| `d[…]` | close one span, whole | the matching closer | the bracket closes it |
| `d[…#]` | **editorial**: wording kept as written, cut off or defective | trailing off | `#` a note on the text |
| `d[…|]` | close all open spans | sweep everything | `\|` one bar through every bracket |
| `d[…#|]` | editorial, then close all | | write `#` first, then `\|` |

An editorial span still counts as quoted: a role pointer can reach it as it reaches any cite.

### Nesting {#nesting}

When one span sits inside another (a quote that contains a parenthetical, or a cite wrapping an opaque blob), the spans nest, and each one closes with its own bracket.

> `zazozon d[ th(hugowul) azozon ] vezuyol.`
>
> z-Azozon | d-CITE[th-ASIDE[h-quiet] | Azozon] | v-tell
>
> "Azozon said “(quietly) Azozon.”" (hello)

The same nest works as <code>d[ z&lt;…&gt; ]</code> or <code>d~[ d&lt;…&gt; ]</code>.

### Practice {#advanced-practice}

Short drills for Advanced. Try each item before opening **Show answer**.

**Setting:** a code review

**New words:**

| English | Ageben | Cue |
|---------|--------|-----|
| *flaw* | `abezum` | 🐛 from *bug* |

**Review:**

| English | Ageben |
|---------|--------|
| *Azozon* | `azozon` |
| *Alazun* | `alazun` |
| *Ahelan* | `ahelan` |
| *page* | `obonol` |
| *tell* | `vezuyol` |
| *write* | `varuyol` |
| *see* | `vayebel` |

#### English → Ageben {#advanced-english-to-ageben}

**1.** *Alazun said “flaw…”* (the quote trails off)

::: details Show answer
`zalazun d[abezum#] vezuyol.`

z-Alazun | d-CITE[flaw]# | v-tell
:::

**2.** *Azozon wrote “(quietly) flaw.”*

::: details Show answer
`zazozon d[ th(hugowul) abezum ] varuyol.`

z-Azozon | d-CITE[th-ASIDE[h-quiet] | flaw] | v-write
:::

**3.** *Ahelan said “flaw…”* (the quote trails off; close every open bracket at once)

::: details Show answer
`zahelan d[abezum#|] vezuyol.`

z-Ahelan | d-CITE[flaw]#| | v-tell
:::

**4.** *Azozon sees “flaw…” on the page.*

::: details Show answer
`zazozon d[abezum#] vayebel ael bobonol.`

z-Azozon | d-CITE[flaw]# | v-see | [on | b-page]
:::

#### Ageben → English {#advanced-ageben-to-english}

**1.** `zahelan d[abezum] varuyol.`

::: details Show answer
z-Ahelan | d-CITE[flaw] | v-write

*Ahelan wrote “flaw.”*
:::

**2.** `zalazun d[ th(hugowul) zazozon varuyol ] vezuyol.`

::: details Show answer
z-Alazun | d-CITE[th-ASIDE[h-quiet] | z-Azozon | v-write] | v-tell

*Alazun said, “(quietly) Azozon writes.”*
:::

**3.** `zazozon d[zalazun varuyol#] vezuyol.`

::: details Show answer
z-Azozon | d-CITE[z-Alazun | v-write]# | v-tell

*Azozon said “Alazun writes…”*
:::

**4.** `zalazun d[abezum#] vezuyol. zahelan dwuder varuyol.`

::: details Show answer
z-Alazun | d-CITE[flaw]# | v-tell . z-Ahelan | d-←episode-patient.same | v-write

*Alazun said “flaw…” Ahelan wrote that down.*
:::

#### Pick one {#advanced-pick-one}

**1.** *Ahelan said “flaw…”* (the quote trails off) `zahelan d[abezum#] vezuyol.` or `zahelan d[abezum] vezuyol.`

::: details Show answer
`zahelan d[abezum#] vezuyol.`

z-Ahelan | d-CITE[flaw]# | v-tell

**`#`** inside the closer keeps the wording but marks it cut off; a plain closer says it is complete.
:::

#### What changes {#advanced-what-changes}

**1.** `zazozon d[abezum#] vezuyol.` / `zazozon d[abezum#|] vezuyol.`

::: details Show answer
z-Azozon | d-CITE[flaw]# | v-tell

z-Azozon | d-CITE[flaw]#| | v-tell

Both quotes trail off; with **`|`**, the closer also shuts every span still open.
:::
