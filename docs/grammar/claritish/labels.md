<!-- read-by (generated: npm run page-readers -- --write; do not edit)
Page shape read by code:
- H1: the journal editor's lesson title (src/claritish-editor/data.ts)
- #forms: the editor's "Learn this" link (src/claritish-editor/data.ts)
- #gap: a level-2 section with id gap; each italic phrase in it raises the lesson's cue or is exempt (scripts/lint-claritish-editor.ts, src/claritish-editor/data.ts)
- tables: each table row's spans are on the Claritish cheat sheet (scripts/lint-cheat-sheets.ts)
- practice: numbered practice items, each a bold number, an italic prompt and an optional note, then the answer in a Show answer details block (src/claritish-editor/data.ts)
Named by data: 3 cues (claritish-triggers.csv), 1 flow (claritish-flows.json), 1 cheat-sheet row.
Inbound links: npm run page-refs -- claritish/labels.md
-->

# Labels {#labels}

## The gap {#gap}

*He's a liar* turns one act into someone's nature. English needs a whole extra clause to take a label back (*well, he lied this one time*). Ageben puts the **label reach**, how far a label applies, inside the word itself.

## The forms {#forms}
<!-- Agent summary: label reach = English word + hyphen + `th` + reach vowel (table): `-thu` this episode, `-the` one relationship, `-tho` a practiced role, `-tha` a type across scenes; vowels small → big: `u`, `e`, `o`, `a`. Goes on the word that carries the label: verb for an act, adjective for a quality, noun for a role. Hyphen only marks the English host; letters after it as in Ageben; no `-l` / `-m` / `-r` ending. Omit when the reach doesn't matter (a bare label says nothing about reach). Unsure → the reach you've actually seen; one episode → `-thu`. -->

To mark the label reach, add a hyphen to the English word, then `th` and the **reach vowel**, which says how far the label reaches:

| Suffix | Reach | English often says |
|--------|-------|--------------------|
| `-thu` | this episode: this stretch of doing | *this time*, *just this once* |
| `-the` | this pair: true in one relationship | *with him*, *to her at least* |
| `-tho` | a practiced role: the position they hold | *as her job*, *a nurse* |
| `-tha` | a type across scenes | *an anxious type*, *that kind of person* |

The rows run from the smallest reach to the biggest, so the vowel says how big the claim is. With `u`, the label covers a short span of time, one stretch of doing. With `e`, it covers one person: how someone is toward that one other person. With `o`, it covers a role they practice, such as a job or a part they play. With `a`, it covers their scenes in general, because the quality shows across their scenes.

The suffix goes directly onto the word that carries the label. For an act, that's the verb, as in *he `lied-thu`*. For a quality it's the adjective (*I was `lazy-thu`*), and for a role it's the noun (*she's a `nurse-tho`*). The hyphen only shows that the word in front is English. The letters after it are spelled exactly as in Ageben.

You met the endings `-l`, `-m`, and `-r` in *How sure are you?*, where they run from settled to passing, with `-l` as *lasting* and `-r` as *right now*. A reach suffix takes none of them. It ends at its vowel, because the vowel makes the whole choice and an ending would have nothing to add.

You don't need a suffix on every label. When the reach doesn't matter, as in *I'm tired* after a long flight, leave it off, since a bare word makes no claim about how far it reaches. Add the suffix when the reach does matter: when you would otherwise add *this time* or *a teacher*, for example, or when one act could be taken as a whole nature.

When you can't tell which reach fits, choose the reach you have seen. If all you have seen is one episode, use `-thu`, which claims that one episode and nothing more.

## One label, four reaches {#four-reaches}
<!-- Agent summary: any label takes any reach vowel; the English word stays, the claim's size changes. `strict-thu` one occasion; `strict-the` toward one person (name them in English after it, or leave them unstated); `strict-tho` the role they practice, which stays in its scenes; `strict-tha` a type, the quality holds across scenes. On a verb, `-tho` = the act as their practice (`lies-tho`), vs one act `lied-thu`. -->

Any label can take any of the four vowels, and the English word stays the same. What changes is how much of the person you're making a claim about. Picture a soccer coach and four people who each want to say *she's strict*:

> She's `strict-thu`.  
> She's `strict-the` with her son.  
> She's `strict-tho`.  
> She's `strict-tha`.

The first is about one occasion. Today at practice she made the whole team run laps for being late, and the sentence says nothing about tomorrow. The second limits the label to one relationship: with her son she's strict, and with everyone else she might be easygoing. You name the other person in English, the way you normally would. If you leave them out (*she's `strict-the`*), the label still holds toward one person, but you don't say who.

The third is about the role she practices. Strictness is part of how she coaches, so it applies at the field, and at home it may not show at all. The fourth calls her a strict type, someone whose strictness shows from scene to scene: at the field, with friends, and at dinner.

A verb works the same way. *He `lied-thu`* is one lie. *He `lies-tho`* says lying is his practice, as it is for a con artist, so it claims much more than one lie.

## Telling reaches apart {#telling-apart}
<!-- Agent summary: near misses. `-thu` = one occasion vs `-the` = one relationship, both may take *to him*. `-tho` = a role, kept to the scenes where it's practiced, vs `-tha` = a type, across scenes. *always* / *often* / *only at work* stay English and say on which occasions; the reach vowel says what kind of claim; `-tha` allows exceptions, *always* claims every time; *often* is not `-tho`; *always* + `-tha` makes both claims. -->

A few reaches get confused with each other, usually because the English around them sounds alike.

### One time or one person {#time-or-person}

Both reaches are small, and both can come with *to him*. *She was `rude-thu` to him* is about one occasion, such as the meeting where she snapped at him. *She's `rude-the` to him* is about the relationship. It's how she is with him, meeting after meeting, while with other people she's polite. So ask whether the label applies to one moment or to one pair of people.

### A role or a type {#role-or-type}

A role applies only in the scenes where someone practices it. A salesman who is `pushy-tho` presses hard on the sales floor, because pressing is part of the job he practices, and he may be mild at home. A salesman who is `pushy-tha` is a pushy type. He presses on the sales floor, at dinner, and in line at the bank.

### A type or every time {#type-or-always}

English words like *always*, *often*, and *only at work* say on which occasions something holds, and they stay in English. The reach vowel says what kind of claim the label is. For example, *he's always late* claims every single time, while *he's `late-tha`* treats him as a late type and still allows for the morning he showed up early.

In the same way, *often* is a count of occasions and isn't what `-tho` means. *He often lies* says it happens a lot, and *he `lies-tho`* names a practice. You can also use both kinds of word at once: *he's always `late-tha`* says both that he is a late type and that he is late every time.

## Examples {#examples}

> He `lied-thu`. He's not a `liar-tho`.  
> I was `lazy-thu` this morning.  
> She's `rude-the`, to him at least.  
> We were `careless-thu` on that release.  
> He's `anxious-tha`.

The first line says one act happened, and denies that lying is his practice. *She's `rude-the`, to him at least* limits the label to one relationship, so it says nothing about how she treats anyone else. *He's `anxious-tha`* does call him a type. The suffix states that claim, while a bare *he's anxious* says nothing about how far the label reaches.

## Practice {#practice}

Add the suffix that fits the note.

**1.** *I was impatient with you.* (just this once)

::: details Show answer
I was `impatient-thu` with you.
:::

**2.** *She's a nurse.* (her role)

::: details Show answer
She's a `nurse-tho`.
:::

**3.** *He's bossy.* (only with his brother)

::: details Show answer
He's `bossy-the` with his brother.
:::

**4.** *He's bossy.* (with everyone, wherever he goes)

::: details Show answer
He's `bossy-tha`.
:::

**5.** *He's grumpy.* (only this morning, before his coffee)

::: details Show answer
He's `grumpy-thu`.
:::

**6.** *He's grumpy.* (that's just the kind of person he is)

::: details Show answer
He's `grumpy-tha`.
:::

**7.** *She's tough.* (it's how she works as a negotiator, and she's gentle at home)

::: details Show answer
She's `tough-tho`.
:::

**8.** *She's tough.* (at work, with friends, everywhere)

::: details Show answer
She's `tough-tha`.
:::

<!-- Source (editors): label-seams.md#reach-vowels. -->
