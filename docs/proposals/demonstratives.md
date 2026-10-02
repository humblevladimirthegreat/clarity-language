# Proposal: demonstratives in the freed `V x V` shape

**Status:** PROPOSED (not current language). Grammar today has no demonstratives (*this one*, *that one*, *here*). [Whole-stem and role-pointer **-r**](../grammar/pronouns.md#resume-r) point back at the discourse history, and the [topic pronoun](../grammar/pronouns.md#topic) names the stretch's topic; nothing points at a thing in the scene.  
**Related:** `span-type-roots.md` (this proposal needs the span TYPE vowel off the `V x V` shape), [pronouns.md](../grammar/pronouns.md), [x-compounds.md](../grammar/x-compounds.md#families-by-shape), [spans.md](../grammar/spans.md#topic-quotes)  
**Design authority:** none until absorbed.

## Motivation

- A demonstrative means the same in any slot. *This one* as subject, object or recipient, and *here* / *like this* as modifiers, differ only in where the word sits, so the role letter alone carries that difference. This is the same property spans have.
- The scene reference (*this cup*, *that one over there*) has no way to be said today.
- It needs no root, so no lexicon or overlay entry.
- Short four- or five-letter words suit the singability goal.

## Dependency

`PoS V x V ending` is currently shared by spans, role pointers and ability-like shapes. Demonstratives need the span TYPE vowel to leave that shape, as in `span-type-roots.md`. Until then `daxal` is a cite open, not *this one*.

## Proposed shape

```text
{PoS}{ANCHOR}x{DISTANCE}{ENDING}
```

Two axes, as in Japanese *ko / so / a*: whose position counts, and how far away.

| ANCHOR (first vowel) | Whose position | Cue |
|----------------------|----------------|-----|
| **a** | speaker | *at me* |
| **e** | listener | *you / ear* |
| **o** | both of us together | a ring around us |
| **u** | neither: the wider world | un-anchored |

| DISTANCE (second vowel) | Where | Cue |
|-------------------------|-------|-----|
| **a** | within reach | *at hand* |
| **e** | in sight | *eye* |
| **o** | far, in view | *over there* |
| **u** | out of view | *unseen* |

## Endings

| Ending | Reading | Example |
|--------|---------|---------|
| **-l** | the scene: the thing physically there | *this cup* |
| **-m** | abstract or psychological distance | *this idea*, *those days* |
| **-n** | **not used**: it stays the ordinary proper-name ending, and a demonstrative is not a name; the parser rejects it | |
| **-r** | **not used**: it stays the discourse resume and role pointer ending | |

The split is **-l** the world, **-m** the mind, **-r** the talk. A learner can hold "**-r** points into the conversation" apart from "**-l** points into the room".

## Slots

- **`z`, `d`, `b`:** *this one / that one* as subject, object, recipient.
- **`g`:** *of this kind, such*.
- **`v`:** a pro-verb, *does this*. It overlaps verb **-r** (*the same action again*), but the scene reading differs from the history reading.
- **`h`:** open question. English *here / now / thus* are three meanings, and `h` covers where, when and how. Options: define `h` as *place* and use the existing restrictors for time and manner; or let context pick, as `hor` does for time.

## Sketch (unvalidated forms)

> `zazawan daxal vahahal.`
>
> z-Azawan | d-this.near-me | v-see
>
> "Azawan sees this one (here by me)."

> `zazawan dexol vahahal.`
>
> z-Azawan | d-that.by-you.far | v-see
>
> "Azawan sees that one (over by you)."

> `zazawan dexam vezebel.`
>
> z-Azawan | d-that.abstract | v-tell
>
> "Azawan tells about that idea."

## Open decisions

1. **Deictic centre inside a cite.** A cite already resets the topic and ordinal count to the quoted speaker's talk. Proposed: anchors inside a cite are the quoted speaker and their listener, so *this* means near the person quoted. The alternative, keeping the outer speaker's scene, makes quotes read oddly.
2. **How much of the grid to assign.** Some cells barely distinguish anything (an anchor of **u** with a distance of **a**). Proposed: assign the useful cells, leave the rest unassigned and rejected by the parser, and record them in `unassigned-reserved.md`.
3. **`/h/` reading** as above.
4. **`x` + a demonstrative** (*now, about this one*): confirm it works as an ordinary noun-phrase topic word.
5. **Fill-ask.** Check that a fill question (*which one?*) and a demonstrative do not collide on the shared shape.

## If accepted, the work is

- a closed vowel table and a `classify` rule for `PoS V x V` with **-l** / **-m**, rejecting **-n** and keeping **-r** with pointers;
- a grammar section (likely in pronouns.md) plus the family-table and decision-order edits in x-compounds.md;
- a recipe entry in the recipe track for *this / that / here*;
- a design-decisions.md entry for the unused cells and for **-n**;
- parser and fixture updates in the same change, per the repo rule that parser changes ship with grammar edits.
