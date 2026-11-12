---
band: intermediate
---

# Inside a quote {#inside-a-quote}

A cite holds someone else's words, with their own act word and their own topic. Your sentence around it keeps its own.

### Act words in a quote {#quote-acts}

A quoted question or command keeps its own [act word](/speech-moves#speech-act-statement-question-command) inside the cite, the same way it keeps a tone mark. The outer sentence is still your claim (*said*), and `yel` or `yol` belongs to the quoted talk.

> `zazozon d[yel zalazun vowurol] vezuyol.`
>
> z-Azozon | d-CITE[y-question | z-Alazun | v-walk] | v-tell
>
> "Azozon said, “Does Alazun walk?”"

### Topics in a quote {#topic-quotes}

A cite holds someone else's words, so a [topic](topic.md#topic) never carries into it or out of it. The inside of a cite starts with no topic, no [tags](tag-pronouns.md#tag-pronouns), and its own targets for [role pointers](/pronouns#role-pointers), and may open with a topic word of its own. When the cite ends, your own topic and tags are as they were.

A cite or opaque span can also be a topic word itself, under `/x/`: a titled work, a word as spelling (with the mention marker before it), or a foreign name.

> `x@[onuren alazun] dalen vozuyel.`
>
> x-NAME.CITE[Onuren | Alazun] | d-TOPIC | v-sing
>
> "Now, about Onuren Alazun: it is sung."

> <code>x@&lt;Sam&gt; zalen vowurol.</code>
>
> x-NAME.OPAQUE["Sam"] | z-TOPIC | v-walk
>
> "Now, about Sam: Sam walks."

| Span | Topic at the start | Topic words inside | Leaks out? |
|------|--------------------|--------------------|------------|
| Cite | none | allowed; the cite's own `/x/` word sets its topic | no |
| Aside | yours | not allowed | n/a |

A `-r` inside a cite cannot find a word outside it: the quoted words were said before the surrounding sentence existed.

### Practice {#intermediate-practice}

Short drills for Intermediate. Try each item before opening **Show answer**.

**Setting:** a hair salon

**New words:**

| English | Ageben | Cue |
|---------|--------|-----|
| *comb* | `ogebol` | 🪮 |
| *scissors* | `ozewul` | ✂️: scissors cut apart |

**Review:**

| English | Ageben |
|---------|--------|
| *Azozon* | `azozon` |
| *Alazun* | `alazun` |
| *Ahelan* | `ahelan` |
| *Onuren* | `onuren` |
| *topic* | `alen` |
| *letters* | `glegol` |
| *tell* | `vezuyol` |
| *sing* | `vozuyel` |
| *write* | `varuyol` |
| *small* | `gamezem` |
| *jar* | `adal` |
| *window* | `uwohel` |
| *open* | `vohel` |

#### English → Ageben {#intermediate-english-to-ageben}

**1.** *Azozon said, “Is the comb small?”*

::: details Show answer
`zazozon d[yel zogebol gamezem] vezuyol.`

z-Azozon | d-CITE[y-question | z-comb | g-small] | v-tell
:::

**2.** *Ahelan said, “Open the window!”*

::: details Show answer
`zahelan d[yol duwohel vohel] vezuyol.`

z-Ahelan | d-CITE[y-command | d-window | v-open] | v-tell
:::

**3.** *About Onuren Alazun: Azozon sings it.* (the song)

::: details Show answer
`x@[onuren alazun] zazozon dalen vozuyel.`

x-NAME.CITE[Onuren | Alazun] | z-Azozon | d-TOPIC | v-sing
:::

**4.** *Alazun said, “About the scissors: they are small.”*

::: details Show answer
`zalazun d[xozewul zalen gamezem] vezuyol.`

z-Alazun | d-CITE[x-scissors | z-TOPIC | g-small] | v-tell
:::

#### Ageben → English {#intermediate-ageben-to-english}

**1.** `zazozon d[yel zahelan dadal vohel] vezuyol.`

::: details Show answer
z-Azozon | d-CITE[y-question | z-Ahelan | d-jar | v-open] | v-tell

*Azozon said, “Does Ahelan open the jar?”*
:::

**2.** <code>x@&lt;Lola&gt; zalen dadal vohel.</code>

::: details Show answer
x-NAME.OPAQUE["Lola"] | z-TOPIC | d-jar | v-open

*Now, about Lola: Lola opens the jar.*
:::

**3.** `glegol x[ozewu] zalazun dalen varuyol.`

::: details Show answer
[gl-MENTION | x-CITE["ozewu"]] | z-Alazun | d-TOPIC | v-write

*About the word “ozewu”: Alazun writes it down.*
:::

#### Pick one {#intermediate-pick-one}

**1.** *Ahelan said, “Does Azozon sing?”* `zahelan d[yel zazozon vozuyel] vezuyol.` or `yel zahelan d[zazozon vozuyel] vezuyol.`

::: details Show answer
`zahelan d[yel zazozon vozuyel] vezuyol.`

z-Ahelan | d-CITE[y-question | z-Azozon | v-sing] | v-tell

The question is Ahelan's, so `yel` goes inside the cite; in front it asks whether Ahelan said it.
:::

#### Fix it {#intermediate-fix-it}

**1.** *Ahelan said, “About the jar: Alazun opens it.”* <!-- lint: error -->`xadal zahelan d[zalazun dalen vohel] vezuyol.`

::: details Show answer
`zahelan d[xadal zalazun dalen vohel] vezuyol.`

z-Ahelan | d-CITE[x-jar | z-Alazun | d-TOPIC | v-open] | v-tell

A topic never carries into a cite, so the quoted words set their own topic inside the brackets.
:::
