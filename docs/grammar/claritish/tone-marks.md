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

Tone gets lost in text. *You're the worst* could be a joke or a fight, and the reader has to guess. An Ageben tone mark, a symbol written before the words, says how you mean them.

## The marks {#forms}

| Mark | Meaning |
|------|---------|
| `%` | joking, teasing |
| `;` | warm, affectionate |
| `&` | contrast: this one, not another |
| `?` | unsure about this word |
| `!` | strong feeling (the words say which) |

Double a mark for more: `!!` is stronger still, `??` is very unsure. Stack different marks to mix tones, in any order: `?!` is surprised and doubtful, `%;` is teasing but fond. Two of the same mark is the most.

Write the mark before what it colors, so the reader sees the tone before reading the words. Attach it to a word to color that word. Put it at the start of the sentence to color the whole sentence. A `!` at the end of a sentence is still ordinary English punctuation.

When the words already make the tone plain (*just kidding*, *love you*), leave the mark off.

## Examples {#examples}

> %You're the worst.  
> ;Call me when you land.  
> We went &Tuesday.  
> He brought a ?casserole.  
> !We shipped it.  
> %;You and your spreadsheets.

*We went &Tuesday* means Tuesday and not another day. *He brought a ?casserole* means you're not sure *casserole* is the right word for it.

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

**3.** *I asked for the blue one.* (the blue one, not another)

::: details Show answer
I asked for the &blue one.
:::

**4.** *She's moving to Iceland.* (you're surprised and doubtful)

::: details Show answer
?!She's moving to Iceland.
:::

<!-- Source (editors): tone-marks.md#showing-your-tone. Lesson pages never link into the grammar; see docs/meta/grammar-docs.md#claritish-track. -->
