# Proposal: kind indefinites (`PwV` + kind + join)

**Status:** PROPOSED (not current language).  
**Related:** [joins.md § unspecified member](../grammar/joins.md#unspecified-member-r-phrase), [§ how many items](../grammar/joins.md#standalone-phrase), [§ standalone inventories](../grammar/joins.md#full-single-item-and-standalone-inventories), [§ universals, domains, and generics](../grammar/joins.md#universals-domains-generics); [questions.md § fill-ask](../grammar/questions.md#fill-ask), [§ fill-all](../grammar/questions.md#fill-all), [§ fill-ask arity](../grammar/questions.md#fill-ask-arity), [§ where?](../grammar/questions.md#where), [§ rhetorical question](../grammar/questions.md#rhetorical); [hooks.md § somewhere, nowhere, everywhere](../grammar/hooks.md#place-indefinites); [restrictors.md](../grammar/restrictors.md); [knowing.md § source](../grammar/knowing.md#source), [§ holder](../grammar/knowing.md#holder); [pronouns.md § special pronouns](../grammar/pronouns.md#special-pronouns), [§ generic pronoun](../grammar/pronouns.md#generic-pronoun), [§ tag pronouns](../grammar/pronouns.md#tag-pronouns), [§ resume](../grammar/pronouns.md#resume-r); [plurality.md § associative group](../grammar/plurality.md#associative); [compounds.md § root tails](../grammar/compounds.md#root-tails); [phonology.md § singability constraints](../grammar/phonology.md#singability-constraints); [clause.md § extra nouns](../grammar/clause.md#extra-nouns); [design-decisions.md](../meta/design-decisions.md) D-18.  
**Replaces:** `tail-pointers.md` (rejected), which used the same word shape.

A **kind indefinite** is a standalone join word with two letters added after the role letter: a **knowledge vowel** that says who knows which one or which set is meant, and a **kind letter** that says what kind of thing it is. `zar` is *someone or something*; `zwuyar` is *someone (a person), I don't know who*; `zwoyar` is *someone, I know who but I'm not saying*. Under `yol` the **-r** forms are fill-ask blanks, and the vowel says what kind of question it is: a real one, a quiz, a *remind me*, or a request to choose.

The knowledge vowel is the point of the family. The kind letter is what lets it be spelled ([why the kind letter](#why-the-kind-letter-is-needed)).

The same vowel reaches two slots with no kind choice, through a letter the slot fixes: `/v/` (*do what?*) and `/h/` (*when?*, and the restrictors *always* / *never*). A kind indefinite can also be a hosted `bl-` word, which gives a report's source a knowledge claim. Separately, the proposal adds **-x** after any join **-r**, so plain `zarx` is *some ones* and, under `yol`, *who all?*

## Form

```
role + w + knowledge vowel + kind letter + join vowel(s) + ending (+ x)
```

| Piece | What it is | Example in `zweyual` |
|-------|------------|----------------------|
| role | slot **now** (`/z/` `/d/` `/b/`, plus `/v/` and `/h/` with a fixed letter) | `z` |
| `w` | not-a-root marker, as on [tags](../grammar/pronouns.md#tag-pronouns) | `w` |
| knowledge vowel | who knows which one (or which set) | `e` both of us |
| kind letter | a kind consonant from the [root-tail chart](../grammar/compounds.md#root-tails) | `y` people |
| join vowel(s) + ending | any standalone join, **-r**, **-l** or **-m**, with its usual reading | `ual` everyone |

So `zweyual` is *everyone we both know*.

The teaching cue: take a standalone join you already know (`zar`, `bal`, `zual`), and put `w`, a knowledge vowel and a kind letter after the role letter. The rest keeps its join meaning.

### Why the kind letter is needed

A knowledge vowel right after `w` would spell a tag: `zwuar` is already the tag pair *U and A* ([two tags at once](../grammar/pronouns.md#tag-pairs)). The kind letter is the consonant that keeps the families apart.

Narrowing the slot is a side benefit, and on its own it would not earn a new word: `zeyol zar` and `zar geyol` already ask *which person?*, `zul geyol` already says *no person*, and `zeyolx zar` already says *some people*. The kind letter only makes each of those one word.

The shape stays apart from neighbors by letters alone:

- A tag is `w` + vowel(s) + ending, with no consonant (`zwar`, `zwaer`).
- A role pointer has `x` after the role vowel (`zaxar`).
- A root begins with a vowel, so no lexicon stem or name begins with `w`.

## Kind letter

The kind letter is the second consonant of the root-tail chart, read as a **category**, not as letters to copy. The job vowel and the size vowel are not read.

| Letter | Kind | Typed blank | Plain English |
|--------|------|-------------|---------------|
| `y` | people | `zwuyar` | *who?* / *someone* |
| `z` | creatures | `dwuzar` | *what animal?* |
| `m` | mind and feeling | `dwumar` | *what feeling?* |
| `b` | body, clothes, what you carry | `dwubar` | *what (to wear / carry)?* |
| `v` | doing, playing, moving, vehicles | `dwuvar` | *what activity / vehicle?* |
| `h` | places and fixtures | `ol bwuhar` | *at what place?* |
| `l` | nature and raw stuff | `dwular` | *what material / plant?* |
| `d` | food and drink | `dwudar` | *what food?* |
| `w` | tools | `dwuwar` | *what tool?* |
| `g` | signs and marks | `dwugar` | *what sign?* |
| `r` | counting, time, money | `dwurar` | *what amount / date?* |
| `n` | titles and papers | `dwunar` | *what title / paper?* |

Because the kind is a category, an answer is not checked by its letters. Names are spelled from their sound and country names have no tail, so `uzozen` answers `zwuyar` even though `uzoze` ends in the creature tail.

**Kind borders need no rule.** A borderline thing (is a backpack body `b` or tool `w`?) takes whichever kind the speaker has in mind. An answer of another kind is still just an answer: there is no correction form, and none is needed.

On `/v/` and `/h/` the speaker does not choose the letter: the slot fixes it ([where it may sit](#where-it-may-sit)).

Plain `zar`, `dar`, `bar` stay the default. They make no kind claim and no knowledge claim. A kind indefinite is the marked choice.

## Knowledge vowel

The vowel says who knows **which one** (on **-r**) or **which set** you are counting over (on **-l** / **-m**).

| Vowel | One (**-r**) | Set (**-l** / **-m**) | Cue |
|-------|--------------|------------------------|-----|
| **`a`** | none picked yet | no set picked: any member anywhere | **a** ≈ add: any that fits could be added |
| **`u`** | a particular one; I don't know which | the ones in this situation | **u** ≈ unsaid, as on role pointer `u` |
| **`o`** | a particular one; I know which, not saying | the ones I have in mind | **o** ≈ one: one I hold |
| **`e`** | a particular one we both know | the ones we both know | **e** ≈ echo: what we both already hold, as pointer `e` echoes this sentence |

The cues borrow from two series: `a` and `o` from the [joins](../grammar/joins.md#join-type-vowel-series), `u` and `e` from the [role pointers](../grammar/pronouns.md#role-pointers).

**`e`** is about knowledge shared **from before** this conversation. Something already mentioned in it is resumed with **-r**, a role pointer, or a tag, never with `e`.

On **-r**, `o`, `u` and `a` are the three readings many languages give their indefinites: a specific one the speaker knows, a specific one the speaker doesn't know, and no specific one at all (Russian *-to* vs *-nibud'*). `e` is new.

### Whose knowledge

The vowel reports the knowledge of whoever says the sentence: for `o` the speaker, for `e` the speaker and the listener. A dependent has the same speaker, so the claim is the same. A quote keeps its own speaker and listener, as it keeps its own tags and topic ([quotes](../grammar/pronouns.md#topic-quotes)).

The vowel never states someone else's knowledge. *Uzozen knows who* is its own claim about Uzozen, made through the [holder](../grammar/knowing.md#holder) like any other view that isn't yours.

## Endings

The family takes **-r**, **-l** and **-m**, plus **-x** after **-r**. Each keeps its join meaning ([recap](../grammar/joins.md#join-type-vowel-series)). The kind letter narrows the slot, and the knowledge vowel adds its claim.

### -r: unspecified member, and the fill-ask blank

| Form | Statement | Under `yol` |
|------|-----------|-------------|
| `ol bwuhar` | somewhere, I don't know where | a real question: *where?* |
| `ol bwohar` | a certain place (I know which) | a **quiz**: *where? I know; do you?* |
| `ol bwehar` | that place, you know the one | **remind me**: *where was it again?* |
| `ol bwahar` | some place, none picked yet | asks for a **choice**: *where should it be?* |

The join vowel keeps its fill-ask arity: `…ar` *some*, `…or` *any*, `…er` *the top-ranked*, `…ur` *else*. So `ol bwuhur` is *somewhere else, I don't know where* (*where else?*), and `ol bwahor` is *any place at all, none in mind* (*anywhere?*).

Under `yol`, `u` says what plain `ol bar` already says. It is allowed for symmetry, and plain stays the usual form.

**After `yal yol`.** A [rhetorical question](../grammar/questions.md#rhetorical) already says the speaker holds the answer. So:

- `o` repeats that claim: allowed, and adds nothing.
- `e` says the answer is one we both know: *where was it, as if you didn't know?*
- `a` says the obvious answer is a choice: *where would we eat?* (at home, of course)
- `u` contradicts it (I hold the answer; I don't know which one), so `yal yol` before a `u` blank is not a sentence.

### -l / -m: closed and open, over a set

**-l** says the list is the whole story, and **-m** says *as far as I know*, as on any standalone join. The knowledge vowel picks the set those claims are about.

| Form | Reading |
|------|---------|
| `bwuyal` | nobody (no person, among those in the situation) |
| `bwuyam` | nobody, as far as I know |
| `bweyal` | nobody we know |
| `bweyam` | nobody we know, as far as I know |
| `bwayal` | no person at all, anywhere |
| `zweyual` | everyone we know |
| `zwoyual` | everyone I mean (all of them; I know who) |
| `dwuduol` | any food goes |

`u` is the plain reading. The joins' advice carries over: when unsure, prefer **-m**. It matters most with `u` and `a`, where **-l** claims a closed list over a set you can't fully name.

### -x after -r (plain joins too)

**-x** goes after a join **-r** in `/z/`, `/d/` or `/b/` and makes the unspecified member a **group**, as **-lx** introduces an indefinite group ([associative group](../grammar/plurality.md#associative)). This holds for plain joins as well as kind indefinites, so it adds `zarx` to the current language.

**Plain joins:**

| Form | Statement | Under `yol` |
|------|-----------|-------------|
| `zarx` | some ones (more than one) | *who all? / what all?* |
| `zorx` | any ones | *any at all (several)?* |
| `zurx` | some others | *who else, all of them?* |
| `zerx` | the top-ranked ones | *which rank highest?* |

With items before the join, **-rx** is several of them: `yol zuzozen zolazun zahelan zarx vowurel.` asks *Which of Uzozen, Olazun and Ahelan walk?* and expects more than one. With one kind item, teach `zeyol zarx` (*some people*): the group sits on the blank, as on `zarx` and `zwuyarx`. `zeyolx zar` stays valid and says the same, since it falls out of a group item (`zeyolx`) before a single-item **-r**, but it is not taught.

**Kind indefinites:**

| Form | Statement | Under `yol` |
|------|-----------|-------------|
| `zwuyarx` | some people, I don't know who | *who all?* (expects several) |
| `zweyarx` | some people we both know | *who were they again?* |
| `zwoyarx` | certain people (I know who) | quiz: *who? name them all* |

A fill-all answer to a **-rx** blank lists the members with a join (`zuzozen zolazun zam.`).

**-x** does not go after **-l** / **-m**. A universal or an empty set already covers every member, as the kind word after `ua` takes no **-x**. For a joint act, put **-x** on the verb, as with `zual`.

**-rx** stays on noun slots. On a verb, **-x** is joint doing, so `varx` (*do something together*) would be a different job, and it is not part of this proposal.

### -n is reserved

The family takes no **-n**. `zwuyan`, `zwayuan` and the rest have no reading yet. The kind itself stays `zuan` + adjective. A `w`-shaped word is never a name: names are roots, and every root begins with a vowel (as [`zwan` is never a name](../grammar/pronouns.md#tag-pronouns)).

## Universals and generics

### How they work today

[Joins](../grammar/joins.md#universals-domains-generics) build them from a standalone `ua` / `u` join and a SHARED kind adjective after it:

| Agebon | Covers | English |
|--------|--------|---------|
| `zual gagozol` | each cat in this situation, no exceptions | *every cat* |
| `zuam gagozol` | every cat, exceptions left open | *cats in general* |
| `zul gagozol` | none of that kind | *no cat* |
| `zuan gagozol` | the kind itself, one individual | *the cat* (as a species) |
| `zual gagozol ol bahehal` | every cat, narrowed by a hook | *every cat at the house* |
| `zeyon` | people as a rule | *one*, generic *you* |

The domain is the situation unless a hook narrows it. There is no short way to say *every person we know*, and none to say *every person anywhere, no exceptions* as opposed to *everyone here*.

### With kind indefinites

The kind letter stands in for a broad SHARED kind, and the knowledge vowel names the domain:

| Form | Domain | English | Today |
|------|--------|---------|-------|
| `zwuyual` | the situation | *everyone (here)* | `zual geyol` |
| `zweyual` | the people we both know | *everyone we know* | none |
| `zwoyual` | the people I have in mind | *everyone (I mean)* | none |
| `zwayual` | any person anywhere, no exceptions | *all people*, as a law | none |
| `zwayuam` | any person anywhere, exceptions open | *people in general* | `zuam geyol`, `zeyon` |
| `bwayal` | any person anywhere | *nobody at all, anywhere* | none |

Everything else composes as on `zual`:

- **A SHARED `/ɡ/` still narrows.** `zweyual gaxowurel` is *everyone we know who walks*. When the adjective names a root of the letter's kind, the letter adds nothing, and plain `zual` reads better.
- **A hook still narrows the place.** `zwuyual ol bahehal` is *everyone at the house*.
- **Not every** closes the fence with `zul`: `zweyual zul vezuvol.` is *not everyone we know sleeps*.
- **The kind itself stays `zuan` + adjective** (`zuan geyol`). The family's **-n** is [reserved](#n-is-reserved).

`zwayuam` overlaps `zeyon` and `zuam geyol`. That's allowed: `zeyon` stays the short Beginner form for people, and `zwayuam` extends the same claim to every kind (`dwayuam` *food in general*).

The same domains reach time on `/h/`: *never in the times we both know* is `hweral` ([always and never](#always-and-never-h)).

### Why it helps

Overgeneralization (*everyone hates me*, *nobody ever listens*, *you always do this*) is a common distortion, and English hides its scope. Here the speaker picks a set: `u` everyone here, `e` everyone we know, `o` the ones I mean, `a` all people anywhere. And with **-l** vs **-m** they also pick whether exceptions are ruled out. The sweeping cell, `zwayual` (or `hwaral` for *never*), is audible, and the listener can ask which set was meant.

## Where it may sit

**`/z/`, `/d/`, `/b/`:** the speaker picks the kind letter, as above.

- **On `/b/`, a hook still brings it in.** Without a hook, a plain `/b/` is the recipient (`zuzozen vezuyel bwuyar` *Uzozen tells someone*). The hook says the relation (`ol` at, `ul` from, `oel` toward, `al` in), and the kind letter says what the landmark is: `ol bwuyar` *at someone's*, `al bwudar` *in some food*.
- **No items before it.** The items already name the kind: `udozol dwuzal` repeats it, and `udozol dwuhal` contradicts it. *Which X?* stays `udozol dar`. A SHARED adjective **after** it is fine, as above. (Plain `zarx` does take items.)
- **Plain *where?* stays `ol bar`.** The hook already implies a place, so `ol bwuhar` only earns its length when the knowledge vowel does work (`ol bwehar`, `ol bweyal`) or the landmark is not a place.

**`/v/`:** the letter is always `v` (doing). It takes **-r**, **-l** and **-m**, as plain `var`, `val` and `vual` do. On **-r** it puts the four question kinds on *do what?*:

| Form | Statement | Under `yol` |
|------|-----------|-------------|
| `zuzozen vwuvar` | Uzozen does something, I don't know what | *what does Uzozen do?* |
| `zuzozen vwovar` | Uzozen does something, I know what | quiz: *what did Uzozen do? I know* |
| `zuzozen vwevar` | Uzozen does that thing, you know | remind: *what was it Uzozen does?* |
| `zayan vwavar` | we do something, nothing picked yet | choice: *what shall we do?* |

On **-l** / **-m** the vowel picks the set of acts, as it picks the people in `zweyual`:

| Form | Reading | Today |
|------|---------|-------|
| `zawan vwuval` | you do nothing (in this situation) | `val` |
| `zawan vweval` / `vwevam` | you do nothing we both know of (as far as I know) | none |
| `zawan vwoval` | you do none of the things I mean | none |
| `zawan vwaval` | you do nothing at all, anywhere | none |
| `zuzozen vwovual` | Uzozen does everything I mean (every chore I have in mind) | none |

*You never do anything* is the same overgeneralization as *you never listen*: `vweval` makes it a claim about a shared history the listener can check, and `vwaval` makes the sweeping version audible.

**-x** stays off: on a verb it is joint doing.

**`/h/`:** the letter is always `r` (counting and time), since `/h/` takes times and cases. It takes **-r**, **-l** and **-m**, with the [restrictor](../grammar/restrictors.md) readings ([always and never](#always-and-never-h)). `/h/` still has no place blank: places stay `ol bar` ([where?](../grammar/questions.md#where)).

**Hosted `bl-`:** a `/b/` kind indefinite can be a hosted `bl-` word wherever one is allowed, as a tag can (`blwar`): `hewom blwuyar` *like someone, I don't know who*. The `l` is syllabic before `w`, as on a tag. Its main use is a report's [source](#source-of-a-report).

**No `/ɡ/`, `/w/`, `/th/`, `/x/`, `/y/`.** Adjectives, stances and clauses have no kind, and a call names its person. `gar` (*what kind?*) and `xar` keep their plain forms. On `/w/` the letters would double (`ww`), so limit the clause with the `/h/` form instead.

### Always and never (`/h/`) {#always-and-never-h}

On `/h/` the restrictor sits after `w`, the knowledge vowel and `r`. The vowel names **which times** the claim covers:

| Vowel | Times |
|-------|-------|
| `u` | the times this talk is about |
| `e` | the times we both know of |
| `o` | the times I have in mind |
| `a` | any time at all |

| Form | Reading | Today |
|------|---------|-------|
| `hwural` | never, in the times at hand | `hal` |
| `hweral` / `hweram` | never, in the times we both know (as far as I know) | none |
| `hworal` | never, in the times I mean | none |
| `hwaral` | never, at any time at all | none |
| `hwerual` / `hweruam` | always, in the times we both know (as far as I know) | none |
| `hwaruam` | as a rule, at any time | `huam` |
| `hwurar` | sometime, I don't know when; under `yol`: *when?* | `har` |
| `hworar` | at a certain time (I know when); under `yol`: quiz | none |
| `hwerar` | that time, you know when; under `yol`: *when was it again?* | none |
| `hwarar` | some time, none picked yet; under `yol`: *when shall we?* | none |

> `zawan vebal hal.`
>
> "You never listen."

> `zawan vebal hweram.`
>
> "You never listen, any time we both know of, as far as I know." (the listener can answer with a time from that shared stretch)

No occasion words before it: `herulal hal` (*only when it rains*) stays plain.

### Source of a report

A [source](../grammar/knowing.md#source) is a `bl-` word after the channel. A hosted kind indefinite there says what the speaker knows about who said it:

| Agebon | English |
|--------|---------|
| `zolazun thebam blwoyar velurul.` | *Olazun left, according to someone I won't name.* |
| `zolazun thebam blwuyar velurul.` | *Olazun left, according to someone; I don't know who.* (a rumor) |
| `zolazun thebam blweyar velurul.` | *Olazun left, according to that person, you know the one.* |
| `zolazun thebam blumon velurul.` (today) | *Olazun left, according to someone.* (no claim) |

How far to trust a report depends on whether its source is known, withheld, or lost. The channel already says the claim was reported; the vowel says which of these it is.

## Answers

A typed blank carries a presupposition, and the listener can refuse it with the same family:

> `yol zwuyar dobogal vagowul.` / `zwuyal.`
>
> "Who broke the box?" / "No person did."

> `yol ol bwehar zayan vagedal.` / `ol bweham.`
>
> "Where did we eat, you know the one?" / "Nowhere we both know, as far as I know." (so say which)

A quiz is answered like any fill-ask:

> `yol zwoyar dobogal vagowul.` / `uwon.`
>
> "Who broke the box? I know." / "Me."

## Test dialogues

Absorb step 1, worked. Each row sets a proposed form against the best form today. The proposed forms don't parse yet; the frames were checked with the plain form in the blank's place.

| # | Situation | Proposed | Best today | Verdict |
|---|-----------|----------|------------|---------|
| 1 | A parent already knows who broke the box | `yol zwoyar dobogal vagowul.` *Who broke the box? (I know)* | `yol zar dobogal vagowul.` hides that the asker knows | **New, strong.** A trap question becomes an honest one |
| 2 | Holding back a name | `zwoyar vezuyel buwon.` *A certain someone told me* vs `zwuyar` *…I don't know who* | `zumon vezuyel buwon.` makes no claim | **New, strong** |
| 3 | A particular person vs anyone | `zuwon vunodul dwoyar.` *I'm inviting someone (I have someone in mind)* vs `dwayar` *…nobody picked yet* | `zuwon vunodul deyol.` | **New** |
| 4 | Fact vs choice | `yol ol bwahar zayan vagedal.` *Where shall we eat?* | `yol ol bar zayan thagem vagedal.` (asks about a plan) | Partial overlap. `u` under `yol` = plain `ol bar` |
| 5 | Remind me | `yol ol bwehar zayan vagedal.` | none (MEMORY would claim *I* remember) | New, modest |
| 6 | Taking back an overgeneralization | A: `zwayal duwon vegemal.` *Nobody anywhere cares about me.* B: `yol zweyal.` *Nobody we know?* A: `zweyam duwon vegemal.` *Nobody we know, as far as I know.* | `zal` / `zam`: closed vs open only | **New, strongest** |
| 7 | Nobody we know | `zuzozen vezuyel bweyam.` | `zuzozen vezuyel bam.` (situation only) | New |
| 8 | *You never listen* | `zawan vebal hweram.` | `zawan vebal hal.` | **New, strong** |
| 9 | An anonymous source | `zolazun thebam blwoyar velurul.` | `zolazun thebam blumon velurul.` | **New, strong** |
| 10 | Who, not what | `yol zwuyar dobogal vagowul.` | `yol zeyol zar dobogal vagowul.` | Covered; one word vs two |
| 11 | Who all? | `yol zwuyarx vowurel.`, plain `yol zarx vowurel.` | `yol zeyolx zar vowurel.` (people only) | `zarx` new for a kind-blind group; the kind form is covered |

**Result:** the knowledge vowel earns the family (rows 1–3, 5–9). The kind letter is a carrier and a shortcut (rows 10–11). `u` under `yol` and `e` on a statement **-r** overlap existing forms and stay as allowed second ways.

## Examples (proposed forms)

A trap question made honest.

> `yol zwoyar dobogal vagowul.`
>
> "Who broke the box?" (I know; will you say?)

A fact versus a choice.

> `yol ol bwuhar zuzozen vagedal.`
>
> "Where does Uzozen eat?" (there is an answer; I don't know it)

> `yol ol bwahar zayan vagedal.`
>
> "Where shall we eat?" (nothing picked yet; you choose)

> `yol vwavar zayan.`
>
> "What shall we do?"

A quiz, a rhetorical quiz, and a reminder.

> `yol dwozar zuzozen vawebol.`
>
> "What animal does Uzozen see?" (I know; do you?)

> `yal yol zwoyar dobogal vagowul.`
>
> "Who do you suppose broke the box?" (I know, and so do you)

> `yol ol bwehar zayan vagedal.`
>
> "Where was it we ate, again?"

> `yol hwerar zayan vagedal.`
>
> "When was it we ate, again?"

Withholding made audible.

> `zwoyar vezuyel buwon.`
>
> "A certain someone told me." (I know who)

> `zolazun thebam blwoyar velurul.`
>
> "Olazun left, according to someone I won't name."

A group.

> `yol zarx vowurel.`
>
> "Who all walks?"

Sets and times.

> `zuzozen vezuyel bweyam.`
>
> "Uzozen tells nobody we know, as far as I know."

> `zweyual zul vezuvol.`
>
> "Not everyone we know sleeps."

> `zawan vebal hwaral.`
>
> "You never listen, ever." (the sweeping claim, said out loud)

## Why

Each cell names a common failure the [feature criteria](../meta/feature-criteria.md) ask for, and every choice has a place where it belongs, so none reads as the correct default:

- **Withholding.** *Someone told me* hides whether you know who. `o` vs `u` makes that a choice, and on a [source](#source-of-a-report) it says whether a report's origin is withheld or lost.
- **Trap questions.** Asking what you already know, to catch someone out, is a common move in conflict. `o` under `yol` puts the asker's knowledge on the table.
- **Specific vs any.** `o` / `u` vs `a` says whether a particular one is meant: *I'm looking for someone* (a certain person) vs (anyone suitable).
- **Assumed common ground.** Speakers overrate what the listener shares (curse of knowledge). `e` turns *you know the one* into a claim the listener can answer with *no, which one?* (`ol bweham`).
- **Fact vs choice.** `u` asks for an answer that exists; `a` asks the listener to decide.
- **Overgeneralization.** The set vowel and **-l** / **-m** make the scope of *everyone* / *nobody* / *always* / *never* / *you do nothing* a choice ([universals](#universals-and-generics), [always and never](#always-and-never-h), [`/v/`](#where-it-may-sit)).
- **Agency bias.** People see an agent behind events. Typed blanks already exist (`zeyol zar`); the family makes them one word, and plain `zar` stays kind-blind.

It also gives English splits Agebon lacks as one word today: *nobody* vs *nothing*, *everyone* vs *everything*, *who* vs *what*, *everyone we know*, *who all?*

## Overlaps (allowed)

| Existing | New | Difference |
|----------|-----|------------|
| `zumon` *someone* | `zwuyar` / `zwayar` | `umon` is one individual you can resume; it makes no knowledge claim |
| `zaxur` *whoever did that* | `zwuyar` | `zaxur` is tied to one known event |
| `zeyor` (resume with no antecedent) *the person you both know* | `zweyar` | `zeyor` is one person by the root; `zweyar` an unnamed member of the people we share |
| `uhohor` *the place you both know* | `ol bwehar` | same split, for places |
| `zeyol zar`, `zar geyol` *which person?* | `zwuyar` | the same typed blank in one word |
| `zeyolx zar` *some people* (valid, untaught) | `zeyol zarx`, `zwuyarx` | the same group; `zeyol zarx` is the taught form, and `zarx` alone is kind-blind |
| `val` *do nothing* | `vwuval` | the same claim; the vowel adds nothing at `u` |
| `zeyon`, `zuam geyol` *people in general* | `zwayuam` | `eyon` is people only; the family covers every kind |
| `zual geyol` *everyone* | `zwuyual` | the same claim; the kind letter is shorter |
| `ol bar` *where? / somewhere* | `ol bwuhar` | no kind or knowledge claim; stays the default |
| `yol ol bar zayan thagem vagedal` *where do we plan to eat?* | `yol ol bwahar zayan vagedal` | asks about a plan, which may exist; `a` says none does yet |
| `hal` / `hual` / `har` | `hwural` / `hwurual` / `hwurar` | the same claims; the vowel adds nothing at `u` |
| `thebam blumon` *according to someone* | `thebam blwuyar` | no claim about whether you know who |

## What the grammar would change

- **[compounds.md § root tails](../grammar/compounds.md#root-tails):** "nothing in a sentence reads it" becomes: kind indefinites read the **kind** consonant as a category. The job vowel and size vowel are still only memory aids.
- **D-18:** add that it covers resuming pronouns. A kind indefinite resumes nothing, so the *mechanical matching* reason does not apply. The kind letter does split people (`y`) from creatures (`z`) and other kinds, which is the animacy split D-18 names. That split is in what the speaker claims about an unknown, not in how a pronoun finds its antecedent, and people are one kind, so no gender split arises.
- **[questions.md § fill-ask](../grammar/questions.md#fill-ask):** the length rule ("a join word always has fewer than five letters") becomes: a join word has no stem; a kind indefinite has `w` after its role letter. Typed blanks and the four kinds of question. **[§ fill-all](../grammar/questions.md#fill-all):** the **-rx** blank. **[§ rhetorical](../grammar/questions.md#rhetorical):** no `u` blank after `yal yol`.
- **[joins.md § unspecified member](../grammar/joins.md#unspecified-member-r-phrase):** **-x** after **-r** (`zarx`). **[§ universals](../grammar/joins.md#universals-domains-generics):** the domain table.
- **[plurality.md § associative group](../grammar/plurality.md#associative):** join **-rx** as an indefinite group, beside kind **-lx**.
- **[restrictors.md](../grammar/restrictors.md):** the `/h/` domain forms.
- **[knowing.md § source](../grammar/knowing.md#source):** a hosted kind indefinite as the source.
- **[hooks.md § place indefinites](../grammar/hooks.md#place-indefinites):** typed landmarks.
- **[pronouns.md § tag pronouns](../grammar/pronouns.md#tag-pronouns):** "`w` starts a tag" becomes: `w` starts a tag or a kind indefinite (a consonant after the vowel tells them apart).
- **[phonology.md § singability constraints](../grammar/phonology.md#singability-constraints):** the cluster list's role letter + `w` covers kind indefinites, and adds `vw` and `hw`.

## Parser sketch

After a role letter, `w` starts a tag or a kind indefinite:

- `z` / `d` / `b` + `w` + one or two vowels + ending → tag (unchanged)
- `z` / `d` / `b` + `w` + knowledge vowel + kind consonant (`y z m b v h l d w g r n`) + standalone join vowel(s) + **-r** / **-l** / **-m** (+ **-x** after **-r**) → kind indefinite; also as a hosted `bl-` word
- `v` + `w` + knowledge vowel + `v` + standalone join vowel(s) + **-r** / **-l** / **-m** → `/v/` kind indefinite
- `h` + `w` + knowledge vowel + `r` + restrictor vowel(s) + **-r** / **-l** / **-m** → `/h/` kind indefinite
- plain join **-r** + **-x** on `/z/` `/d/` `/b/` → indefinite group (`zarx`), with or without items

Reject: other role letters; another letter on `/v/` or `/h/`; items before a kind indefinite or occasion words before an `/h/` one; **-x** after **-l** / **-m**, on `/v/` or on `/h/`; **-n** on any kind indefinite; `yal yol` before a `u` blank.

Morph gloss (proposed): `z-wh.person.unknown` / `.withheld` / `.shared` / `.unpicked` under `yol`, `z-something.person.unknown` in a statement, `b-none.person.shared` for `bweyal`, `z-everything.person.anywhere` for `zwayual`, `h-never.shared` for `hweral`, `v-wh.withheld` for `vwovar`, `v-none.shared` for `vweval`, `z-wh.group` / `z-something.group` for `zarx`. The kind label is the chart's kind name; the set label for `a` on **-l** / **-m** is `anywhere`.

## Absorb sketch (if yes)

1. Dialogues: done, [above](#test-dialogues). Every cell has a case except `u` under `yol`, which stays allowed as a second way to write plain.
2. [joins.md](../grammar/joins.md): the form, the kind table and the knowledge table (Intermediate, after standalone inventories), **-rx**, and the domain table under universals. [questions.md](../grammar/questions.md): typed blanks, the four kinds of question, `/v/` and `/h/` blanks, **-rx** in fill-all (teaching `zeyol zarx` for one kind), the rhetorical rule, and refusing a presupposition. [hooks.md](../grammar/hooks.md#place-indefinites): typed landmarks. [restrictors.md](../grammar/restrictors.md): always and never by domain. [knowing.md](../grammar/knowing.md#source): the source row. [plurality.md](../grammar/plurality.md#associative): **-rx**.
3. [compounds.md](../grammar/compounds.md#root-tails), D-18, the fill-ask length rule, the tag intro and the phonology cluster list, as above.
4. [unassigned-reserved.md](../meta/unassigned-reserved.md): closed: other slots, items before a kind indefinite, **-x** after **-l** / **-m**, `/w/` (doubled `w`); open: **-n** on the family, `varx`. [design-decisions.md](../meta/design-decisions.md): `yal yol` before a `u` blank (it contradicts the rhetorical claim).
5. Parser, morph gloss, `--llm-prompt` reader notes, and a cheat-sheet block, in the same change as the grammar pages.
