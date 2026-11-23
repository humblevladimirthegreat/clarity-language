<!-- read-by (generated: npm run page-readers -- --write; do not edit)
Page shape read by code:
- H1: the journal editor's lesson title (src/claritish-editor/data.ts)
- #forms: the editor's "Learn this" link (src/claritish-editor/data.ts)
- #gap: a level-2 section with id gap; each italic phrase in it raises the lesson's cue or is exempt (scripts/lint-claritish-editor.ts, src/claritish-editor/data.ts)
- tables: each table row's spans are on the Claritish cheat sheet (scripts/lint-cheat-sheets.ts)
- practice: numbered practice items, each a bold number, an italic prompt and an optional note, then the answer in a Show answer details block (src/claritish-editor/data.ts)
Named by data: 3 cues (claritish-triggers.csv), 1 flow (claritish-flows.json).
Inbound links: npm run page-refs -- claritish/tone-marks.md
-->

# Bonus: Tone marks {#tone-marks}

## The gap {#gap}

In writing, the reader cannot hear the voice that shows how you mean your words. A text that says *You're the worst* could be a joke or a fight, and the reader has to guess which. An Ageben tone mark, a symbol written before the words, says how you mean them.

## The marks {#forms}
<!-- Agent summary: five tone marks (table), written bare, no space, right before the English they apply to: `%` joking, teasing (not meant literally); `;` warm, affectionate; `&` contrast, this one not another; `?` unsure; `!` strong feeling, the words say which. Each stands for a change of voice in speech. Changes the tone only: the sentence says the same and does the same job (statement, request). No default mark; a mark is never required, and without one the sentence means the same with its tone unwritten. -->

A **tone mark** is a symbol written in front of words to say how you mean them: as a joke, warmly, in contrast to something else, unsure, or with strong feeling. In speech, your voice shows these tones, and each mark stands for one change in your voice. Write the mark bare, with no space between it and the word after it.

| Mark | Meaning | Your voice in speech |
|------|---------|----------------------|
| `%` | joking, teasing | light, smiling |
| `;` | warm, affectionate | soft, gentle |
| `&` | contrast: this one, not another | stressed and slowed |
| `?` | unsure about it | raised, tentative |
| `!` | strong feeling (the words say which) | louder, stressed |

The `%` mark says that you are teasing and do not mean the words literally. For example, *You're the worst* with no mark leaves the reader to tell a joke from a fight, while *%You're the worst* says it is teasing. Without a mark the sentence means the same thing, and its tone is not written down, so a mark is never required. None of the five is a default, because each says a different tone. Choose the one that matches how you mean the words, or write none.

A mark changes only the tone of the words. The sentence still says the same thing and does the same job, so *;Call me when you land* is still a request, made warmly. The `!` mark says the feeling is strong but not which feeling it is, because the words show that. For example, *!We shipped it* is strong excitement and *!They cancelled it* is strong upset, with the same mark on both.

## What the mark applies to {#placement}
<!-- Agent summary: the mark applies to what follows it. Attached to a word inside the sentence → that word only; attached to the first word → the whole sentence. A final `!` or `?` is English punctuation, not a tone mark. -->

A mark applies to the words after it, so the reader sees the tone before reading the words. Attached to a word inside the sentence, it applies to that word only. Attached to the first word, it applies to the whole sentence. Here is the same sentence both ways:

> He brought a ?casserole.  
> ?He brought a casserole.

The first sentence marks only *casserole*: you are not sure that *casserole* is the right word for what he brought. The second marks the whole sentence as something you are unsure of.

A `!` or `?` at the end of a sentence is not a tone mark. It is English punctuation and means what it means in English, so *We shipped it!* is an ordinary English sentence. A tone mark always comes before the words it applies to.

## Stronger and mixed tones {#stacking}
<!-- Agent summary: double a mark for a stronger tone (`!!` stronger, `??` very unsure); two of one mark is the most, so `!!!` is not a mark. Stack different marks to mix their tones: no space between them, any order, same meaning (`?!` = `!?` surprised and doubtful; `%;` teasing but fond). -->

Doubling a mark makes its tone stronger. For example, `!!` is a stronger feeling than `!`, and `??` means very unsure. Two copies of one mark is the most, so `!!!` is not a tone mark. Compare:

> !We shipped it.  
> !!We shipped it.

Different marks combine to mix their tones. Write them together with no space, in any order, because the order does not change the meaning: `?!` and `!?` mean the same. For example, `?!` means surprised and doubtful, and `%;` means teasing but fond:

> ?!She's moving to Iceland.  
> %;You and your spreadsheets.

## Examples {#examples}

> %You're the worst.  
> ;Call me when you land.  
> We went &Tuesday.  
> The meeting starts at ?six.  
> !!We got the apartment.  
> %;You and your spreadsheets.

*We went &Tuesday* means Tuesday and not another day. *The meeting starts at ?six* marks only the time as something you are unsure of. *%;You and your spreadsheets* is teasing, and it is fond.

## Telling a mark apart {#telling-apart}
<!-- Agent summary: near misses. `?` mark = unsure; the sentence stays a statement, and a question is written as an English question. `&` only sets one thing against others; a word that is only the new part (an answer to a question) takes no mark. -->

A question and a stressed new word are easily confused with a tone mark, and neither takes one.

### Unsure or asking {#unsure-or-asking}

The `?` mark means you are unsure, and it does not make the sentence a question. *?She's moving to Iceland* is still a statement: you are saying that she is moving, and that you are not sure of it. To ask, write an English question, such as *Is she moving to Iceland?*, which ends in English punctuation.

### Contrast or new information {#contrast-or-new}

Use `&` when you set one thing against the others it could have been. For example, if a friend thinks you went on Monday, *We went &Tuesday* sets Tuesday against Monday.

English often stresses the new part of a sentence too, and that stress takes no mark. When a friend asks *When did you go?*, the answer *We went Tuesday* needs no `&`, because the question already shows which part is new. So leave `&` off a word that is only new, and put it on a word that is chosen over something else.

## Practice {#practice}

Add a tone mark so the sentence says what the note asks for.

**1.** *I love Mondays.* (you're joking)

::: details Show answer
%I love Mondays.
:::

**2.** *Sleep well.* (warmly)

::: details Show answer
;Sleep well.
:::

**3.** *Sleep well.* (teasing, but fondly)

::: details Show answer
%;Sleep well.
:::

**4.** *I asked for the blue one.* (the blue one, not another)

::: details Show answer
I asked for the &blue one.
:::

**5.** *She's moving to Iceland.* (you're surprised and doubtful)

::: details Show answer
?!She's moving to Iceland.
:::

**6.** *She's moving to Iceland.* (you're not sure *Iceland* is the right place)

::: details Show answer
She's moving to ?Iceland.
:::

**7.** *We won.* (you feel strongly about it)

::: details Show answer
!We won.
:::

**8.** *We won.* (the strongest feeling you can mark)

::: details Show answer
!!We won.
:::

<!-- Source (editors): tone-marks.md#showing-your-tone, tone-marks.md#emphasis-and-clefts. Lesson pages never link into the grammar; see docs/meta/grammar-docs.md#claritish-track. -->
