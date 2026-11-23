<!-- read-by (generated: npm run page-readers -- --write; do not edit)
Page shape read by code:
- H1: the journal editor's lesson title (src/claritish-editor/data.ts)
- #forms: the editor's "Learn this" link (src/claritish-editor/data.ts)
- #gap: a level-2 section with id gap; each italic phrase in it raises the lesson's cue or is exempt (scripts/lint-claritish-editor.ts, src/claritish-editor/data.ts)
- tables: each table row's spans are on the Claritish cheat sheet (scripts/lint-cheat-sheets.ts)
- practice: numbered practice items, each a bold number, an italic prompt and an optional note, then the answer in a Show answer details block (src/claritish-editor/data.ts)
Named by data: 6 cues (claritish-triggers.csv), 2 flows (claritish-flows.json).
Inbound links: npm run page-refs -- claritish/allowed-required-agreed.md
-->

# Allowed and required {#allowed-required-agreed}

## The gap {#gap}

English *can*, *may*, *should*, and *OK* do not say who allowed something, or whether the person it's done to agreed or was only assumed to agree. When nobody says whose yes it is, a habit everyone follows can be mistaken for a rule, and a guess that a friend won't mind can be mistaken for their actual yes. Ageben has separate words for **permission** (someone allowing or forbidding an act), **requirement** (someone demanding it), and **consent** (the yes of the person the act is done to), and the ending of each word says where the yes or no comes from.

## The forms {#forms}
<!-- Agent summary: four drop-ins (table), ending `-m` by default: `hwuvam` allowed, `hwuvum` forbidden, `hwuvom` required (someone with authority over the act); `hwudam` agreed (consent of the person it's done to). Placement: after the clause, before it, or beside the word it's about; covers the whole clause. `-m` with no one named: the person with the say is the speaker. Unsure of the source → `-m`. Leave out when the English already says whose say it is. -->

Each drop-in below says what someone said about an act. The first three come from someone outside the act, such as a rule or a person with the standing to decide, and they say it's allowed, forbidden, or required. The fourth is consent, which comes from the person the act is done to. It says that this person said yes: the one examined, hugged, photographed, or signed up.

| Drop-in | What was said | English often says |
|---------|---------------|--------------------|
| `hwuvam` | someone allows the act | *you may*, *I'm letting you* |
| `hwuvum` | someone forbids the act | *you may not* |
| `hwuvom` | someone requires the act | *you have to* |
| `hwudam` | the person it's done to agreed | *they agreed* |

The drop-in goes where English would put an adverb: after the clause, before it, or beside the word it's about. Wherever it goes, it applies to the whole clause, so *you can leave early `hwuvam`* gives permission for the leaving, not only for the word next to it.

All four are shown with `-m`, the default ending, which means a person said so. When nobody else is named, that person is you, the speaker. So *you can leave early `hwuvam`* means you're the one letting them go, and *no phones at dinner `hwuvum`* means you're the one saying no. The next section shows how the ending changes to name a rule or no one at all. If you can't tell where the yes or no comes from, keep `-m`.

You don't need a drop-in when the English already says whose say it is. *The rules say we can park here* and *she said it's fine* already name the source, so leave them as they are. Use the drop-in when the English leaves the source out, as in a bare *you can*, *you have to*, or *it's OK* that someone may later act on.

## Where the yes or no comes from {#source}
<!-- Agent summary: ending grades the source, not the settled-to-passing scale: `-l` a rule or binding agreement (≈ law), `-m` (default) a person said so (≈ mouth), `-r` nobody said: tolerated, disapproved of, customary, or assumed (≈ read the room). All twelve: table (rows = what was said, columns = source). Consent endings = how binding the yes is: `hwudal` agreed in advance, binding; `hwudam` a yes they can take back; `hwudar` nobody asked, taken as given (allowed; says *I assumed* openly). Different sources never clash: `hwuval` beside `hwuvur`. -->

You met three endings in *How sure are you?*, where they formed a scale from settled to passing: think of `-l` as *lasting* and `-r` as *right now*. These drop-ins use the same three letters for something else, so here the ending says where the yes or no comes from, not how settled anything is.

`-l` is a rule (think *law*). `-m` is a person's word, and it's the default (think *mouth*). `-r` is no one's word at all, only what people tolerate, disapprove of, or expect without anyone saying so (think *read the room*). Take one requirement, said three ways:

> Guests take their shoes off `hwuvol`.  
> Guests take their shoes off `hwuvom`.  
> Guests take their shoes off `hwuvor`.

With `hwuvol`, a rule requires it, such as a sign by the door or the building's policy. With `hwuvom`, you're the one asking them to, perhaps because it's your home. With `hwuvor`, nobody has asked anyone: it's what guests here do.

Each row of the table below is one thing that can be said about an act, and each column is one source. So once you know the four rows and the three sources, you can find all twelve words, and every word in a column ends in the same letter.

| What was said | `-l` a rule | `-m` a person's word | `-r` no one's word |
|---------------|-------------|----------------------|--------------------|
| allowed | `hwuval` *the rules allow it* | `hwuvam` *I'm letting you* | `hwuvar` *no one's stopping it* |
| forbidden | `hwuvul` *the rules forbid it* | `hwuvum` *you may not* | `hwuvur` *people won't like it* |
| required | `hwuvol` *the rules require it* | `hwuvom` *you have to* | `hwuvor` *it's customary* |
| agreed | `hwudal` *they signed on in advance* | `hwudam` *they said yes* | `hwudar` *they're probably OK with it* |

Because each ending names a different source, two of them can be true of the same act without contradicting each other. Jeans at the office can be allowed by the rules (`hwuval`) and still disapproved of (`hwuvur`), so a new hire who asks whether jeans are OK may need both answers.

### How binding a yes is {#binding}

On the consent word, the ending says how firmly the person agreed. Take one photo, said three ways:

> The newsletter photographed her `hwudal`.  
> The newsletter photographed her `hwudam`.  
> The newsletter photographed her `hwudar`.

With `hwudal`, she signed on in advance, perhaps with a release form, and withdrawing now has conditions. With `hwudam`, she said yes, and she can take it back at any time. With `hwudar`, nobody asked her, and the newsletter took her yes as given.

You may use `hwudar`, but it marks a weaker yes than the other two. It states *I assumed* in the sentence, while English *she was fine with it* leaves the assumption unsaid.

## Telling them apart {#telling-apart}
<!-- Agent summary: near misses. Rule (`-l`) vs custom (`-r`): `hwuvol` / `hwuvor`, `hwuvul` / `hwuvur`. Permission (`hwuvam`, someone with authority over the act) vs consent (`hwudam`, the person it's done to); both can hold. Act done to someone's things or time (*your car*, *a photo of us*): `hwudam` would be the thing's yes → say the owner's yes in English and leave the drop-in out; recast when it's really done to them (*I tagged her*). `-m` on `hwuvam` / `hwuvum` / `hwuvom` = the speaker's say, so no reading on a sentence about the speaker (*I have to …*): use `hwuvol`, `hwuvor`, or name the person in English and leave the drop-in out. *can* = able (*I can swim*) involves no one's yes → no drop-in. -->

A few pairs get confused, usually because English uses the same words for both.

### A rule or a custom {#rule-or-custom}

*Have to* sounds the same whether a rule demands something or everyone does it by custom. *Phones go off during the meeting `hwuvol`* points to a rule someone could show you. *Phones go off during the meeting `hwuvor`* says nobody asked for it, though everyone in the room expects it.

The same distinction applies to a ban. *No smoking on the balcony `hwuvul`* means the rules forbid it, while *no smoking on the balcony `hwuvur`* means nobody has said no, but the neighbors won't like it. A newcomer who takes a custom for a rule may worry about breaking something that was never written down.

### Someone allowing it or the person agreeing {#permission-or-consent}

Permission comes from someone with authority over the act, while consent comes from the person the act is done to, and either can hold without the other. *The doctor examined my son `hwuvam`* says you, the parent, allowed it. *The doctor examined my son `hwudam`* says your son agreed himself. Both can be true, and saying which yes you mean keeps the parent's yes from being mistaken for the child's.

### Their things or their time {#things-or-time}

The consent drop-in is only ever the yes of the one the act is done to. In *I borrowed your car* or *I posted a photo of us*, the act is done to the car or the photo, so `hwudam` would say the car or the photo agreed. When an act uses someone's things or time, say their yes in English (*you said I could take the car*, *she said I could post it*) and leave the drop-in out. When the act is really done to them, say it that way and the drop-in applies again: *I tagged her in the photo `hwudam`*.

### A sentence about yourself {#about-yourself}

Because `-m` with nobody named means the say is yours, `hwuvam`, `hwuvum`, and `hwuvom` don't fit a sentence about what you yourself do. *I have to work late `hwuvom`* would make you the outside person demanding it of yourself, and that sentence makes no sense. When something is required of you, name where the demand comes from instead. Use `hwuvol` when a rule requires it and `hwuvor` when it's custom, or name the person in English (*my manager says I have to work late*) and leave the drop-in out.

### Allowed or able {#allowed-or-able}

In *Can and can't*, the *can* that means someone is able to do something got its own suffix on the verb. That *can* involves no one's yes. *I can swim* is about a skill, not a permission, so none of these drop-ins fits it. They're for the other *can*, the one that means someone allows it, as in *you can park here* when the rules allow it (`hwuval`).

## Examples {#examples}

> I signed you up for the 10k `hwudar`.  
> You can leave early `hwuvam`.  
> We wear ties `hwuvor`, not `hwuvol`.  
> Visitors sign in at the desk `hwuvol`.  
> No phones at dinner `hwuvum`.  
> People smoke on the balcony `hwuvar`.

*I signed you up for the 10k `hwudar`* states the assumption openly: you didn't ask first, and you're saying so. *We wear ties `hwuvor`, not `hwuvol`* tells a new colleague that ties are a custom, so nobody will point to a rule if they skip one. *People smoke on the balcony `hwuvar`* doesn't say anyone approved, only that nobody is stopping them.

## Practice {#practice}

Add the drop-in that fits the note.

**1.** *You can park here.* (the rules allow it)

::: details Show answer
You can park here `hwuval`.
:::

**2.** *You can park here.* (you're the one saying it's fine)

::: details Show answer
You can park here `hwuvam`.
:::

**3.** *I tagged her in the photo.* (she said yes)

::: details Show answer
I tagged her in the photo `hwudam`.
:::

**4.** *I tagged her in the photo.* (you didn't ask her; you figured she wouldn't mind)

::: details Show answer
I tagged her in the photo `hwudar`.
:::

**5.** *People bring a dish.* (custom expects it)

::: details Show answer
People bring a dish `hwuvor`.
:::

**6.** *People bring a dish.* (the club's rules say everyone must)

::: details Show answer
People bring a dish `hwuvol`.
:::

**7.** *Talking during the film.* (frowned on)

::: details Show answer
Talking during the film `hwuvur`.
:::

**8.** *Talking during the film.* (the cinema's rules ban it)

::: details Show answer
Talking during the film `hwuvul`.
:::

<!-- Source (editors): permission-consent.md#say-words, permission-consent.md#permission (speaker on `-m`, ability), permission-consent.md#consent (consent endings; the role letter never passes to an owner), permission-consent.md#say-reach (different sources never clash). -->
