# Proposal: Stacked speech acts

**Status:** PROPOSED. The rhetorical question (`yal yol`) and the emphatic prohibition (`yul yul`) are already taught. Everything else here is new.  
**Related:** [speech act](../grammar/speech-moves.md#speech-act-beginner), [firm and soft](../grammar/speech-moves.md#speech-act), [for now](../grammar/speech-moves.md#act-r), [emphatic prohibition](../grammar/speech-moves.md#emphatic-prohibition), [rhetorical question](../grammar/questions.md#rhetorical), [tags](../grammar/questions.md#tags), [the statement word, written out](../grammar/knowing.md).

## Problem

People often do one speech act while using the shape of another. *Could you pass the salt?* is a request that looks like a question. *We don't hit in this house* is a prohibition that looks like a statement. *Go ahead, try it* is a sarcastic dare that means *don't*. These indirect moves cause misunderstandings: the listener answers the shape and misses the act, or senses pressure without being able to name it. Agebon already marks the act with a single word, so it can also mark the gap between what a turn does and how it looks.

Two pieces already exist:

- `yal yol` is a rhetorical question. You make a statement but give it a question's shape.
- `yul yul` is an emphatic prohibition. The repeat makes the *don't* louder.

This proposal turns them into one system.

## The rule

When two act words open a turn:

1. **Two different act words:** the **first** is the act you are really doing. The **second** is the shape the body takes, and it sets the body's [usual order](../grammar/speech-moves.md#act-word-order).
2. **The same act word twice:** this is emphasis on that act, and the act is unchanged.

The listener can always recover the real act from the first word. The second word only describes the shape.

### Endings

The **outer** (first) word carries the speaker's real stance, so its ending says how firmly the real act is meant. `-l` is firm, `-m` is soft, `-r` is for now. The **inner** (second) word always ends in **-l**, because it only names the shape. A soft or provisional inner word has no reading and should be listed in `unassigned-reserved.md`.

### Limits

- **Two words at most.** A third act word has no reading.
- **No hook between the two act words.** A [hook](../grammar/hooks.md) may still sit before the first one.
- **The written `yal` exemption.** A written `yal` normally says you are back in your own voice ([knowing.md](../grammar/knowing.md)). In a stack, `yal` names an act and has no voice reading, so the exemption the rhetorical question already has applies to every stack.

## Pairs: real act shaped as another act

Read each row as *first word → second word*.

| Stack | Real act → shape | English | Reading |
|-------|------------------|---------|---------|
| `yal yol` | statement → question | *Isn't it obvious?* | **Rhetorical question** (already taught). |
| `yol yal` | question → statement | *So you were at home last night.* (I know; say it) | **Quiz.** You ask something you already know and want the other person to say it. The body has statement order. |
| `yel yol` | command → question | *Could you pass the salt?* | **Request shaped as a question.** It asks for the act, not about the listener's ability. `yem yol` is the softer version. |
| `yel yal` | command → statement | *You'll be home by ten.* / *Passengers remain seated.* | **Directive shaped as a description or policy.** |
| `yul yal` | prohibition → statement | *We don't hit in this house.* | **Prohibition shaped as a norm.** It shows the speaker is forbidding something, not describing a habit. |
| `yul yol` | prohibition → question | *Must you?* / *Do you really have to shout?* | **Discouraging question.** The question is really a *don't*. |
| `yul yel` | prohibition → command | *Go ahead, try it.* | **Sarcastic dare.** It sounds like a command but means *don't*. |
| `yel yul` | command → prohibition | *Don't you dare finish those cookies* (wink) | **Reverse psychology or teasing.** It sounds like a *don't* but means *do*. The mirror of `yul yel`. |
| `yal yel` | statement → command | *Consider that…* / *Note that…* / *Mark my words.* | **Claim framed as an instruction to notice.** |
| `yal yul` | statement → prohibition | *I won't even mention that he lied.* | **Apophasis.** You say something by claiming you won't say it. |
| `yol yel` | question → command | *Tell me where you were.* | **Question demanded as an order.** An answer is required. Compare the quiz: there the asker already knows the answer, and here the asker does not. |
| `yol yul` | question → prohibition | *You're not leaving, are you?* | **Question shaped as a prohibition**, leaning toward *no*. It is close to a [tag](../grammar/questions.md#tags), and the grammar page should contrast the two. A tag asks the listener to confirm a claim. `yol yul` asks a real question while showing which answer the speaker fears. |

### Endings on the outer word

| Example | Reading |
|---------|---------|
| `yam yol` | tentative rhetorical question: *isn't it kind of obvious?* |
| `yar yol` | rhetorical for now: *surely… (as things stand)?* |
| `yom yal` | gentle quiz: *I think you know this one…* |
| `yem yol` | polite request shaped as a question: *would you mind…?* |
| `yer yal` | rule for now: *for now, everyone stays inside.* |
| `yum yal` | soft norm: *we'd rather people didn't…* |
| `yum yol` | gentle discouraging question: *do you really want to…?* |

## Doubling: emphasis

The same act word twice keeps the act and makes it more insistent. This extends `yul yul`.

| Stack | Reading | English |
|-------|---------|---------|
| `yal yal` | insisted statement | *I'm telling you, …* / *I insist: …* |
| `yol yol` | pressing question | *I really need to know: …?* |
| `yel yel` | urgent command | *Do it. Now.* |
| `yul yul` | emphatic prohibition (already taught) | *Don't. I mean it.* |

**Endings on a double:** both words share one ending. `yem yem` is an insistent plea (*please, please…*). `yom yom` is a wondering that keeps coming back. Doubles with mixed endings (`yel yem`) have no reading.

**`yal yal` and the omitted `yal`.** Plain `yal` is usually left out, but `yal yal` has to be written, because it carries the emphasis.

## Examples

These are sketches. Run each through `node scripts/parse.mjs` when the forms are implemented.

> `yol yal zuzozen vowurel.`
>
> y-question | y-statement | z-Uzozen | v-walk
>
> "So Uzozen walks — go on, say it." (quiz)

> `yel yol zar vanuvul dobogal?`
>
> y-command | y-question | z-? | v-punch | d-box
>
> "Could someone punch the box?" (a request)

> `yul yal zayan vanuvul.`
>
> y-prohibition | y-statement | z-interlocutors | v-punch
>
> "We don't punch." (a house rule)

> `yul yel vanuvul dobogal.`
>
> y-prohibition | y-command | v-punch | d-box
>
> "Go ahead, punch the box." (sarcastic: don't)

> `yol yol zuzozen vowurel.`
>
> y-question | y-question | z-Uzozen | v-walk
>
> "Does Uzozen walk? I really need to know."

## Interactions to settle during implementation

- **Typed blanks.** The rhetorical question already limits which [typed blanks](../grammar/questions.md#four-kinds-of-question) may follow it. The quiz (`yol yal`) and the pressing question (`yol yol`) need the same table. An `o` blank, which already reads as a quiz, could be required or banned after `yol yal`, since it repeats the quiz.
- **Tags.** A tag after a stacked turn (`…. yol yael.`) probably keeps its ordinary reading. Check `yul yol` against tags.
- **Act words after the body.** As with `yul yul`, only the opening act words stack. An act word after the body starts a new turn.
- **Order cue.** The inner word sets the usual order, so a missed outer word leaves a well-formed turn of the shape act. That is the intended fallback: the listener hears the surface act, which is what English listeners hear today.

## Where it lands

- [speech-moves.md](../grammar/speech-moves.md): the stacking rule, doubling (generalizing [emphatic prohibition](../grammar/speech-moves.md#emphatic-prohibition)), and the directive and prohibition pairs. Intermediate level.
- [questions.md](../grammar/questions.md): the quiz beside the [rhetorical question](../grammar/questions.md#rhetorical), plus `yol yel`, `yol yul`, and `yol yol`.
- [knowing.md](../grammar/knowing.md): widen the written-`yal` exemption to every stack.
- `unassigned-reserved.md`: inner words ending in `-m` or `-r`, three-word stacks, and doubles with mixed endings.
- Parser and `npm run grammar-check`: accept two opening act words, and add morph gloss labels for each stack.
- Cheat sheet `talking` rows, and recipe rows in `say-questions.md` and the say page for requests.
