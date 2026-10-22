# Proposal: Stacked speech acts

**Status:** PROPOSED. The rhetorical question (`yal yol`, `yam yol`, `yal yom`, `yam yom`) and the emphatic prohibition (`yul yul`) are already taught. Everything else here is new.  
**Related:** [speech act](../grammar/speech-moves.md#speech-act-beginner), [firm and soft](../grammar/speech-moves.md#speech-act), [for now](../grammar/speech-moves.md#act-r), [usual order](../grammar/speech-moves.md#act-word-order), [emphatic prohibition](../grammar/speech-moves.md#emphatic-prohibition), [tone marks](../grammar/speech-moves.md#tone-marks), [rhetorical question](../grammar/questions.md#rhetorical), [tags](../grammar/questions.md#tags), [question tone](../grammar/questions.md#question-tone), [answering a command](../grammar/questions.md#answer-command), [what ends a frame](../grammar/knowing.md), [feature criteria](../meta/feature-criteria.md).

## Problem

People often do one speech act while using the shape of another. *Could you pass the salt?* is a request that looks like a question. *We don't hit in this house* is a prohibition that looks like a statement. *Go ahead, try it* is a sarcastic dare that means *don't*. A boss's *would you maybe…?* is an order dressed as a gentle ask. These indirect moves cause misunderstandings: the listener answers the shape and misses the act, or senses pressure without being able to name it. Agebon already marks the act with a single word, so it can also mark the gap between what a turn does and how it sounds.

Two pieces already exist:

- `yal yol` is a rhetorical question: a statement that sounds like a question.
- `yul yul` is an emphatic prohibition. The repeat makes the *don't* louder.

This proposal turns them into one system.

## The rule

When two act words open a turn:

1. **Two different act words:** the **first** (outer) word is the act you are really doing. The **second** (inner) word is how the turn sounds.
2. **The same act word twice:** this is emphasis on that act, and the act is unchanged.

The listener can always recover the real act from the outer word, and a reply answers the outer act.

### Endings

Each word's ending describes its own act. The **outer** ending says how you really mean the act: `-l` firm, `-m` soft, `-r` for now. The **inner** ending says how it sounds. So a stack can show a soft surface over a firm act, or the reverse.

The same vowel with **different** endings is a stack, not a double: `yel yem` is a command that sounds like a request. The same vowel with the same ending is a double (emphasis).

### Word order

The body takes the **outer** act's [usual order](../grammar/speech-moves.md#act-word-order). The inner word only labels how the turn sounds; it never moves the verb. So `yul yel` (a sarcastic dare) keeps the prohibition's verb-late order, and a missed `yul` still never sounds like an order to act.

If a listener misses one word:

- **The inner word:** they hear the real act in its own order. Nothing is lost but the tone.
- **The outer word:** they hear the inner act word over a body in the real act's order. The turn is still well formed, since order is never required, and the listener hears the surface act, which is what English listeners hear today.

### Placement

- **Two act words at most.** A third act word has no reading (closed).
- **Nothing between the two act words.** A call, an interjection, or a [hook](../grammar/hooks.md) goes before the outer word.
- **Question tone.** The free-standing [`?`](../grammar/questions.md#question-tone) shows a raised voice, which belongs to how the turn sounds. It is recommended whenever either word is a question word, and it goes right after the stack: `yel yol ? …`, `yol yal ? …`.
- **Only the opening act words stack.** As with `yul yul`, an act word after the body starts a new turn.
- **The outer `yal` is written.** Leaving it out would leave the inner word as the act.

### Reported frames

A written `yal` / `yam` / `yar` normally says you are back in your own voice and ends a reported frame ([knowing.md](../grammar/knowing.md)). In a stack, an **outer** statement word still does this: the real act is your own claim, so a rhetorical question or an insisted `yal yal` ends the frame. An **inner** statement word only says how the turn sounds and ends nothing.

> `zolazun thebam velurul. yal yol zar vegemal.`
>
> z-Olazun | th-REPORTED | v-departure . y-statement | y-question | z-wh | v-care
>
> "Olazun left, so they say. Who cares?" (your own claim; the report no longer carries)

## Replies and tags

A reply answers the **outer** act. After `yel yol` (a command that sounds like a question), the listener takes it up or turns it down with [`yaol` / `yuol`](../grammar/questions.md#answer-command), not `yael` / `yuel`. After the quiz (`yol yal`), the reply is the answer the asker already knows.

A [tag](../grammar/questions.md#tags) after a stacked turn also responds to the outer act. Asking *okay?* after a soft-sounding command shows that the soft sound was only a surface:

> `yel yom vowurel zawan. yol yaol.`
>
> y-command | y-soft-question | v-walk | z-listener . y-question | y-sure
>
> "Would you maybe walk? Okay?" (it is an order)

Compare `yem vowurel zawan. yol yaol.`: a real request, which the listener is free to turn down.

## Pairs: real act sounding like another act

Read each row as *outer word → inner word*. The table shows `-l` on both words. Other endings follow the [endings rule](#endings).

| Stack | Real act → sound | English | Reading |
|-------|------------------|---------|---------|
| `yal yol` | statement → question | *Isn't it obvious?* | **Rhetorical question** (already taught). |
| `yol yal` | question → statement | *Seven times eight is…* (I know; you say it) | **Quiz.** You ask something you already know the answer to, and want the other person to produce it. A fill-ask blank works as usual: `yol yal zar …` *who…? (I know who)*. |
| `yel yol` | command → question | *Could you pass the salt?* | **Request that sounds like a question.** It asks for the act, not about the listener's ability. |
| `yel yal` | command → statement | *You'll be home by ten.* / *Passengers remain seated.* | **Directive that sounds like a description or policy.** |
| `yul yal` | prohibition → statement | *We don't hit in this house.* | **Prohibition that sounds like a norm.** It shows the speaker is forbidding something, not describing a habit. |
| `yul yol` | prohibition → question | *Must you?* / *Do you really have to shout?* | **Discouraging question.** It is really a *don't*; no answer is owed. |
| `yul yel` | prohibition → command | *Go ahead, try it.* | **Sarcastic dare.** It sounds like a command but means *don't*. |
| `yel yul` | command → prohibition | *Don't you dare finish those cookies* (wink) | **Teasing or reverse psychology.** It sounds like a *don't* but means *do*. The mirror of `yul yel`. |
| `yal yel` | statement → command | *Consider that…* / *Note that…* / *Mark my words.* | **Claim framed as an instruction to notice.** |
| `yal yul` | statement → prohibition | *I won't even mention that he lied.* | **Apophasis.** You say something while claiming you won't say it. Marking it makes the move visible: the listener knows it was said. |
| `yol yel` | question → command | *Tell me where you were.* | **Question demanded as an order.** An answer is required. Compare the quiz: there the asker already knows the answer, and here the asker does not. |
| `yol yul` | question → prohibition | *You're not leaving, are you?* | **Question that hopes for *no*.** You really ask, and you show which answer you want. Compare `yul yol`, which forbids and only sounds like a question. Compare also a [tag](../grammar/questions.md#tags), which asks the listener to confirm a claim you have already made. |

### Endings in a stack

| Example | Reading |
|---------|---------|
| `yam yol` | tentative rhetorical question: *isn't it kind of obvious?* (already taught) |
| `yal yom` | rhetorical question that sounds like idle wondering (already taught) |
| `yar yol` | rhetorical for now: *surely… (as things stand)?* |
| `yal yor` | known claim that sounds like a check: *just checking, it's Tuesday, right?* |
| `yom yal` | gentle quiz: *I think you know this one…* |
| `yem yol` | real soft request that sounds like a question: *would you mind…?* The listener may say no. |
| `yel yom` | firm order that sounds like a gentle ask: a boss's *would you maybe…?* The listener may not say no. |
| `yel yem` | command with a *please* that is not optional |
| `yem yel` | soft offer that sounds like a command: *Have a seat. Go on, take another.* |
| `yer yal` | rule for now: *for now, everyone stays inside.* |
| `yum yal` | soft norm: *we'd rather people didn't…* |
| `yum yol` | gentle discouraging question: *do you really want to…?* |
| `yul yur` | firm *no* that sounds like *not yet*: *let's hold off for now* (meaning never) |

## Doubling: emphasis

The same act word twice, with the same ending, keeps the act and makes it more insistent. This extends `yul yul`.

| Stack | Reading | English |
|-------|---------|---------|
| `yal yal` | insisted statement | *I'm telling you, …* / *I insist: …* |
| `yol yol` | pressing question | *I really need to know: …?* |
| `yel yel` | urgent command | *Do it. Now.* |
| `yul yul` | emphatic prohibition (already taught) | *Don't. I mean it.* |

Soft and provisional doubles work the same way: `yem yem` is an insistent plea (*please, please…*), and `yur yur` is *really, hold off for now*.

**Compare with:** the tone mark `!` makes you sound louder and more stressed. A double makes the act itself more insistent, so it also fits a calm voice. The two can go together.

**`yal yal` and the omitted `yal`.** Plain `yal` is usually left out, but `yal yal` has to be written, because it carries the emphasis. As an outer statement word, it ends a reported frame.

## Examples

These are sketches. Each body parses today without the inner word; run the full stacks through `node scripts/parse.mjs` once the forms are implemented.

> `yol yal ? zar vanuvul dobogal.`
>
> y-question | y-statement | ? | z-wh | v-punch | d-box
>
> "So who punched the box?" (quiz: I know who; you say it)

> `yel yol ? vanuvul dobogal zawan.`
>
> y-command | y-question | ? | v-punch | d-box | z-listener
>
> "Could you punch the box?" (a request)

> `yul yal zayan dobogal vanuvul.`
>
> y-prohibition | y-statement | z-interlocutors | d-box | v-punch
>
> "We don't punch the box." (a house rule)

> `yul yel dobogal vanuvul.`
>
> y-prohibition | y-command | d-box | v-punch
>
> "Go ahead, punch the box." (sarcastic: don't)

> `yol yul ? zawan velurul.`
>
> y-question | y-prohibition | ? | z-listener | v-departure
>
> "You're not leaving, are you?" (a real question; you hope not)

> `yem yel vuhohol.`
>
> y-request | y-command | v-sit
>
> "Sit, sit!" (an offer)

> `yol yol ? zuzozen vowurel.`
>
> y-question | y-question | ? | z-Uzozen | v-walk
>
> "Does Uzozen walk? I really need to know."

## Where it lands

- [speech-moves.md](../grammar/speech-moves.md): the stacking rule, outer order, endings on each word, placement, doubling (generalizing [emphatic prohibition](../grammar/speech-moves.md#emphatic-prohibition), with the `!` contrast), and the directive and prohibition pairs. Intermediate level.
- [questions.md](../grammar/questions.md): the quiz beside the [rhetorical question](../grammar/questions.md#rhetorical), plus `yol yel`, `yol yul`, `yol yol`, and `?` after a stack. Reword the rhetorical question: the body takes statement order, and `yal` / `yam` before `yol` / `yom` becomes one case of the general rule. Answering a command or request: a reply answers the outer act. Tags: a tag responds to the outer act.
- [knowing.md](../grammar/knowing.md): an outer `yal` / `yam` / `yar` ends a reported frame and an inner one does not. This replaces the line that exempts the rhetorical question as a question.
- `unassigned-reserved.md`: three-word stacks (closed), and anything between the two act words.
- `design-decisions.md`: why stacks stop at two words, and why the body follows the outer act (it keeps D-44's rule that a lost `yul` never falls back to an order to act).
- Parser and `npm run grammar-check`: accept two opening act words with any endings, reject a third, and add morph gloss labels for each stack. Update the current stacking error message.
- Cheat sheet `talking` rows, and recipe rows in `say-questions.md` and the say page for requests.
