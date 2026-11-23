<!-- read-by (generated: npm run page-readers -- --write; do not edit)
Page shape read by code:
- H1: the journal editor's lesson title (src/claritish-editor/data.ts)
- #forms: the editor's "Learn this" link (src/claritish-editor/data.ts)
- #gap: a level-2 section with id gap; each italic phrase in it raises the lesson's cue or is exempt (scripts/lint-claritish-editor.ts, src/claritish-editor/data.ts)
- tables: each table row's spans are on the Claritish cheat sheet (scripts/lint-cheat-sheets.ts)
- practice: numbered practice items, each a bold number, an italic prompt and an optional note, then the answer in a Show answer details block (src/claritish-editor/data.ts)
Named by data: 2 cues (claritish-triggers.csv), 1 flow (claritish-flows.json), 1 cheat-sheet row.
Inbound links: npm run page-refs -- claritish/can-and-cant.md
-->

# Can and can't {#can-and-cant}

## The gap {#gap}

*I can't* can mean three different things: *not right now*, *not yet*, and *never*. Heard back later, *I can't sing* could mean a sore throat or a lifelong fact, so a friend who picks the wrong meaning will either stop asking you or keep asking. Ageben marks a limit on what you can do as one of three: for now, not yet, or never.

## The forms {#forms}
<!-- Agent summary: ability suffix = English verb + hyphen + `x` + ability vowel (table): `-xa` can, `-xo` can't just for now (usually can), `-xe` can't yet, `-xu` can never (impossible). Replaces the English *can* / *can't*; goes on the verb. Three can'ts differ by how lasting: `o` a temporary lapse, `e` not yet, `u` never; `a` fully able. Unsure how lasting → `-xe`. Hyphen marks the English host; no `-l` / `-m` / `-r` ending. `x` = the *si* in *vision*. Omit when *can* asks leave or makes a request. -->

English puts *can* and *can't* in front of the verb. Here the meaning goes onto the verb itself: drop the English *can* or *can't*, then add a hyphen, `x`, and the **ability vowel**, which says whether you can, or which kind of *can't* you mean.

| Suffix | Meaning |
|--------|---------|
| `-xa` | can: able |
| `-xo` | can't, just for now (usually can) |
| `-xe` | can't yet (the default when you are not sure) |
| `-xu` | can never: impossible |

So *I can swim* becomes *I `swim-xa`*. The *I can't sing* from the gap becomes two different sentences, because you now have to say which one you mean: *I `sing-xo`* is the sore throat, and *I `sing-xu`* is the lifelong fact.

There's one way to say *can* and three ways to say *can't*, and the three differ in how lasting the limit is. With `o`, the limit is for now: you usually can, and something is in your way. With `e`, it's not yet, so you can't do it so far, and that could still change. With `u`, it's never. The fourth vowel, `a`, means you can, with no limit at all.

When you can't tell how lasting the limit is, use `-xe`. It claims only *not yet*, so it never says a limit is permanent when it might still change.

The hyphen works the way it does in *Labels*, where a suffix like `-thu` goes on an English word: the hyphen only shows that the word in front is English, and the letters after it are spelled exactly as in Ageben. As there, no ending follows, because the vowel already makes the whole choice. The new letter is `x`, which sounds like the *si* in *vision*.

Not every English *can* is about what someone is able to do. When *can* asks for permission, as in *can I sit here?*, or makes a request, as in *can you pass the salt?*, leave it as it is. The suffix has nothing to add there, because nobody is asking whether you're able.

## Telling the can'ts apart {#telling-apart}
<!-- Agent summary: near misses. `-xo` = usually can, blocked for now; `-xe` = not able so far, may change. `-xe` leaves it open; `-xu` = never, impossible; unsure → `-xe`. Plain verb = does it; `-xa` = is able to. *can't* for a ban (able, but not allowed) is not ability → no suffix. -->

Most mix-ups here happen because English uses one word, *can't*, for all three limits, and *can* for more than ability.

### For now or not yet {#now-or-yet}

Both of these say the limit might end, so the question to ask is whether you usually can. With your arm in a cast, *I `drive-xo`* fits, because you drive most days and the cast is in the way for now. If you've never had a driving lesson, it's *I `drive-xe`*: you can't drive yet, and that could change once you learn.

### Not yet or never {#yet-or-never}

*My grandmother `text-xe`* says she can't text yet, perhaps because her grandson is still teaching her. *My grandmother `text-xu`* says she never will be able to, which is a much bigger claim. A listener who hears the second one no longer expects a message from her.

That's why `-xe` is the default. If you aren't sure the limit is permanent, `-xu` claims more than you know, while `-xe` allows for either outcome.

### Doing it or able to {#doing-or-able}

*I swim*, with no suffix, says you do it, perhaps every morning before work. *I `swim-xa`* says you're able to, which is a different claim. You can say *I `swim-xa`* truthfully and still not have been in a pool for years.

### Able or allowed {#able-or-allowed}

English *can't* also covers what someone isn't allowed to do. *She `drive-xe`* says she hasn't learned to drive yet. If she knows how, and her parents have said no, then *she can't drive* is about permission. She is able, so the ability suffix doesn't fit, and *can't* stays as it is.

## Examples {#examples}

> I `swim-xa`, but I `drive-xo` with this cast on.  
> She `code-xe`. She starts the course in May.  
> I `sing-xu` in front of people.  
> He `lift-xo` today, because his back is out.  
> The kids `read-xe`, but they're learning.

*I `drive-xo`* names the cast as the cause, and the cast will come off. *She `code-xe`* says the limit could change, without saying how soon, which plain *can't* never says. *I `sing-xu`* is the only one of the five that says the limit is permanent, so use it only when you mean never.

## Practice {#practice}

Add the suffix that fits the note.

**1.** *I can't run.* (my ankle is sprained; it will heal)

::: details Show answer
I `run-xo`.
:::

**2.** *I can't run.* (my knee is hurt, and the doctor can't say yet whether it will recover)

::: details Show answer
I `run-xe`.
:::

**3.** *He can't read music.* (he hasn't learned it yet)

::: details Show answer
He `read-xe` music.
:::

**4.** *He can't read music.* (he usually can, but he left his glasses at home)

::: details Show answer
He `read-xo` music.
:::

**5.** *I can't sing.* (I have a sore throat)

::: details Show answer
I `sing-xo`.
:::

**6.** *I can't sing.* (I've never been able to hold a tune, and that won't change)

::: details Show answer
I `sing-xu`.
:::

**7.** *I can't drink milk.* (an allergy that will not change)

::: details Show answer
I `drink-xu` milk.
:::

**8.** *She can drive.* (she has her license)

::: details Show answer
She `drive-xa`.
:::

<!-- Source (editors): can-and-cant.md#ability-changeability (can, can't); can-and-cant.md#can (plain verb vs ability); permission-consent.md#permission (asking leave is not ability); more-turn-words.md#stacked-acts (a *could you* request); x sound from phonology.md. -->
