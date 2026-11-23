<!-- read-by (generated: npm run page-readers -- --write; do not edit)
Page shape read by code:
- H1: the journal editor's lesson title (src/claritish-editor/data.ts)
- #forms: the editor's "Learn this" link (src/claritish-editor/data.ts)
- #gap: a level-2 section with id gap; each italic phrase in it raises the lesson's cue or is exempt (scripts/lint-claritish-editor.ts, src/claritish-editor/data.ts)
- tables: each table row's spans are on the Claritish cheat sheet (scripts/lint-cheat-sheets.ts)
- practice: numbered practice items, each a bold number, an italic prompt and an optional note, then the answer in a Show answer details block (src/claritish-editor/data.ts)
Named by data: 7 cues (claritish-triggers.csv), 1 flow (claritish-flows.json).
Inbound links: npm run page-refs -- claritish/how-you-know.md
-->

# How do you know? {#how-you-know}

## The gap {#gap}

English often doesn't say how you know something, and when it does, the words are vague: *I heard* covers both a solid source and a rumor, and *I remember* covers both a vivid memory and a hazy one. *Obviously* or *must have* makes a strong hunch from the clues sound like a proof. In Ageben, a claim can take a word that names its **evidential channel**: how you came to know it.

## The forms {#forms}
<!-- Agent summary: seven channel drop-ins (table), ending `-m` by default. Placement: where English puts *apparently*; covers its clause. No channel fits → `thomam`. Optional; omit when the source doesn't matter. Recording: `thugem` while watching, `thevum` after. Document: `thebam`. -->

Each drop-in below names one channel. To choose, think of what you'd say if someone asked *how do you know?*, and pick the row that matches your answer.

| Drop-in | Channel | You know it because | English often says |
|---------|---------|---------------------|--------------------|
| `thugem` | live | you're seeing, hearing, or feeling it right now | *look*, *listen* |
| `thevum` | memory | you sensed it yourself earlier and remember it | *I remember*, *I saw* |
| `thubom` | pattern | it's what usually happens in cases like this | *usually*, *as always* |
| `theyom` | clues | you worked it out from clues in this case | *must have*, *apparently* |
| `thanam` | deduced | it follows from things you already accept | *so it follows*, *so it must be* |
| `thebam` | reported | someone told you, or you read it | *I heard*, *they say* |
| `thabem` | intuition | you have a gut sense you can't fully explain | *I feel like*, *my gut says* |

Seven drop-ins are a lot to learn at once, so learn them in four groups: things you sensed yourself (live and memory), things you reasoned out (pattern, clues, deduced), things someone told you (reported), and things you sense but can't fully explain (intuition). Once you know which group a claim belongs to, you choose between at most three rows.

The drop-in goes where English would put *apparently*: at the end of the clause, at the start, or next to the word it's about. It applies to the clause it sits in. If you can't name any channel at all, what you have is a guess, so use `thomam`, the word for *could be* from *How sure are you?*, instead.

You don't need to mark every claim. When nobody would ask how you know, such as when everyone in the meeting can see the time on the invite, leave the drop-in out. Use it when the source matters, such as news about a person, a reason you're blaming someone, or a fact someone is about to act on.

Recordings and documents each have a rule. Watching a video counts as seeing for yourself, so it's `thugem` while you watch and `thevum` once you've finished. A document counts as a report, because someone wrote it.

## Telling channels apart {#telling-apart}
<!-- Agent summary: near misses. Hearing a sound = `thugem` / `thevum`; hearing news = `thebam`. Pattern (`thubom`) = other similar cases; clues (`theyom`) = this case. Clues can fail with all clues true; deduction (`thanam`) fails only on a false premise; *obviously* usually = clues. Intuition (`thabem`) is a way of knowing, not a feeling. -->

A few pairs of channels are easily confused, usually because English uses the same phrase for both.

### Hearing it or hearing about it {#hearing}

*I heard* can mean two different things. When you hear the door slam, your evidence is what you heard, so it's `thugem` as it happens and `thevum` afterward. When you hear that your neighbor is moving, your evidence is what someone told you, so it's `thebam`.

### A pattern or clues {#pattern-or-clues}

Both involve reasoning, but they start from different evidence. A pattern comes from other cases like this one: *the bus is late `thubom`* means it's usually late on Mondays, and you could say it before you've even left the house. Clues come from the case in front of you: *the bus is late `theyom`* means the stop is crowded and the arrival board is blank.

### Clues or a deduction {#clues-or-deduction}

Clues make a claim likely, but they can all be true and the claim still be wrong. If the milk is warm and the fridge door was open, the open door is the likely cause, but the fridge could also have broken. A deduction is stronger: if what it starts from is true, the conclusion has to be. If the tickets sold out on Monday, they were gone by Tuesday, and only a mistake about Monday could make that false.

So use `thanam` only when you'd say *it follows* or *so it must be*. When you'd say *obviously*, you usually have clues, so use `theyom`.

### A hunch or a feeling {#hunch-or-feeling}

A gut sense is about how you know something, so it goes on the claim itself. *He's lost `thabem`* says you have a gut sense that he's lost. Feeling worried that he's lost is something else, a feeling about the news, and this drop-in doesn't mean that.

## How strong the evidence is {#strength}
<!-- Agent summary: ending grades evidence strength: `-l` could show it, `-m` (default) could describe it, `-r` could only gesture. What strong / weak means per channel: table. Grades evidence, not likelihood of the event. Same settled-to-passing scale as How sure are you? (`-l` ≈ lasting, `-r` ≈ right now). -->

Two claims can come through the same channel and still deserve different amounts of trust. A notice from the airline and a remark you overheard at the gate are both reports, and a clear view and a quick glimpse are both live. The last letter of the drop-in marks the difference, and you can pick it by imagining how you'd answer if someone asked *how do you know?*

- `-l` (strong): you could show them something they can check for themselves, such as the document, the clues, or the source.
- `-m` (the default): you could describe what you saw, heard, or noticed, and they'd have to take your word for it.
- `-r` (weak): you could only point vaguely in its direction, and a follow-up question would find little more.

If you're not sure which ending fits, use `-m`.

What counts as strong depends on the channel. A strong memory is a vivid one, a strong pattern rests on many cases, and a strong report comes from a reliable source:

| Channel | Strong (`-l`) | Weak (`-r`) |
|---------|---------------|-------------|
| live | `thugel` a clear, full view | `thuger` a glimpse |
| memory | `thevul` a vivid memory | `thevur` a hazy memory |
| pattern | `thubol` a well-established pattern | `thubor` a pattern from a few cases |
| clues | `theyol` strong clues | `theyor` a weak clue |
| deduced | `thanal` a deduction checked step by step | `thanar` a deduction that seems right but is unchecked |
| reported | `thebal` a reliable source, such as an official notice | `thebar` a rumor |
| intuition | `thabel` a hunch whose basis you can name | `thaber` a faint hunch |

The ending rates your evidence, not the news itself. A reliable source can report something surprising (*the CEO resigned `thebal`*), and a rumor can be about something perfectly ordinary.

You've met these three endings before, in *How sure are you?*, where the three form a scale from most settled (`-l`) to most passing (`-r`). The scale runs the same way here. Think of `-l` as *lasting*, because evidence you can show can still be checked tomorrow, and `-r` as *right now*, because a glimpse or a rumor may have nothing behind it once someone asks a follow-up question.

## Examples {#examples}

> The server is down `thugem`.  
> Marco quit `thebar`.  
> The meeting got moved `thebal`.  
> I locked the door `thevur`.  
> This bug is in the parser `theyom`, `thomam`.

The calendar notice behind *the meeting got moved `thebal`* is something you could forward to anyone who doubts it, while *Marco quit `thebar`* is a rumor from the hallway. *I locked the door `thevur`* says the memory is hazy, which is a reason to go back and check. The last example says two separate things: you worked it out from clues (`theyom`), and you're only saying it could be so (`thomam`).

## In a story {#in-a-story}
<!-- Agent summary: a channel carries forward over the speaker's later claims with no channel, until a new channel replaces it. The speaker's own feelings and plans are not claims and stay outside it. -->

When you tell a story, you only need the drop-in on the first sentence. It applies to the sentences that follow, until you name a different channel:

> Marco quit `thebam`. He took the stapler. He didn't say goodbye.

Everything here is something you heard. In plain English, a listener would take the second sentence, *he took the stapler*, as something you saw.

To switch to something you know firsthand, name the new channel:

> Marco quit `thebam`. He took the stapler. His desk is empty `thugem`.

The empty desk is in front of you, but the quitting and the stapler are still things you heard.

Your own feelings and plans aren't claims about what happened, so the story's channel doesn't apply to them. If you add *I'll miss him* after *Marco quit `thebam`*, you aren't passing on something you heard about missing him. The feeling is yours.

## Practice {#practice}

Add the drop-in that fits the note.

**1.** *The bakery closes at six.* (you read it on their official site)

::: details Show answer
The bakery closes at six `thebal`.
:::

**2.** *Dana's engaged.* (a rumor)

::: details Show answer
Dana's engaged `thebar`.
:::

**3.** *The bus is late.* (it usually is at this time of day)

::: details Show answer
The bus is late `thubom`.
:::

**4.** *The bus is late.* (the stop is packed and nobody has boarded)

::: details Show answer
The bus is late `theyom`.
:::

**5.** *Something's wrong.* (a gut feeling)

::: details Show answer
Something's wrong `thabem`.
:::

**6.** *The dryer's done.* (you heard it buzz a few minutes ago)

::: details Show answer
The dryer's done `thevum`.
:::

**7.** *The dryer's done.* (your roommate texted you)

::: details Show answer
The dryer's done `thebam`.
:::

**8.** *The package went to the old address.* (you traced every step: the order still had the old address on it, so it had to go there)

::: details Show answer
The package went to the old address `thanal`.
:::

<!-- Source (editors): knowing.md#live-vs-memory, evidentiality.md#evidentiality, evidentiality.md#evidence-strength, evidentiality.md#carry-forward, evidentiality.md#deduction. -->
