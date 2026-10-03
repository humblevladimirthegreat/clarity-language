# Proposal: demonstratives in the freed `V x V` shape

**Status:** PROPOSED (not current language). Grammar today has no demonstratives (*this one*, *that one*, *here*). [Whole-stem and role-pointer **-r**](../grammar/pronouns.md#resume-r) point back at the discourse history, and the [topic pronoun](../grammar/pronouns.md#topic) names the stretch's topic; nothing points at a thing in the scene.  
**Related:** [roles.md](../grammar/roles.md), [pronouns.md](../grammar/pronouns.md#role-pointers), [x-compounds.md](../grammar/x-compounds.md#families-by-shape), [spans.md](../grammar/spans.md#topic-quotes)  
**Design authority:** none until absorbed.

## Motivation

- A demonstrative means the same in any slot. *This one* as subject, object or recipient, and *here* / *like this* as modifiers, differ only in where the word sits, so the role letter alone carries that difference. This is the same property spans have.
- The scene reference (*this cup*, *that one over there*) has no way to be said today.
- It needs no root, so no lexicon or overlay entry.
- Short four- or five-letter words suit the singability goal.
- It reuses a vowel set the learner already knows: the [role vowels](../grammar/roles.md), applied to the speech event.

## Dependency

`PoS V x V ending` was shared by spoken span opens, [role pointers](../grammar/pronouns.md#role-pointers) and ability-like shapes. Spans are now written-only ([spans.md](../grammar/spans.md#written-only)), so the span use of the shape is gone and `daxal` is an unassigned vowel-letter compound. The ending alone separates the two remaining uses: **-r** is a role pointer, **-l** / **-m** is a demonstrative.

## Proposed shape

```text
{PoS}{ANCHOR}x{DISTANCE}{ENDING}
```

Two axes, as in Japanese *ko / so / a*: whose position counts, and how far away.

### Anchor: the role vowels of the speech event

The anchor vowel is a [role vowel](../grammar/roles.md) read on the act of speaking, so `…axezebel` (*teller*) and the demonstrative anchor are the same vowel on the same participant.

| ANCHOR (first vowel) | Role in the speech event | Whose position | Role compound of *tell* |
|----------------------|--------------------------|----------------|-------------------------|
| **a** | the doer | speaker (*near me*) | `zaxezebel` the teller |
| **o** | the extra `/b/` party | listener (*near you*) | `zoxezebel` the addressee |
| **e** | the scene | the shared scene around us | `zexezebel` the telling-place |
| **u** | not a participant | neither: the wider world | |

- **Cues** are the existing ones: **a** ≈ add (a doer), **o** ≈ one (that extra one, the one told), **e** ≈ order (the scene the act is ordered in).
- **`u` is the exception.** The undergoer of speech is the utterance, which **-r** and the topic pronoun already point at. So **u** is not parsed as a role here: it means *un-anchored*, a position belonging to neither speaker nor listener (cue: **u** ≈ un-anchored). It is the only anchor without a role-compound twin.
- **Cites need no rule.** The anchors are the roles of the *current* speech event, so inside a cite they are the quoted speaker and their listener, as for any role.

### Distance: second vowel

| DISTANCE (second vowel) | Where | Cue |
|-------------------------|-------|-----|
| **a** | within reach | *at hand* |
| **e** | in sight | *eye* |
| **o** | far, in view | *over there* |
| **u** | out of view | *unseen* |

The distance vowel is independent of the pointer vowels (**a** again, **e** echo, **o** other) and the ability vowels. A vowel right of **`x`** already has a family-specific meaning, and the ending says which family.

## Endings

| Ending | Reading | Example |
|--------|---------|---------|
| **-l** | the scene: the thing physically there | *this cup* |
| **-m** | abstract or psychological distance | *this idea*, *those days* |
| **-n** | **not used**: it stays the ordinary proper-name ending, and a demonstrative is not a name; the parser rejects it | |
| **-r** | **not used here**: `V x V -r` is the [role pointer](../grammar/pronouns.md#role-pointers) | |

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

> `zazawan doxol vahahal.`
>
> z-Azawan | d-that.by-you.far | v-see
>
> "Azawan sees that one (over by you)."

> `zazawan dexal vahahal.`
>
> z-Azawan | d-this.shared.near | v-see
>
> "Azawan sees this one (right here between us)."

> `zazawan duxol vahahal.`
>
> z-Azawan | d-that.neither.far | v-see
>
> "Azawan sees that one (over there, far from us both)."

> `zazawan doxam vezebel.`
>
> z-Azawan | d-that.abstract | v-tell
>
> "Azawan tells about that idea."

## Open decisions

1. **Which anchor-distance cells to assign.** Some cells barely distinguish anything (anchor **u** with distance **a**, since nothing out in the wider world is within reach). Proposed: assign the useful cells, leave the rest unassigned and rejected by the parser, and record them in `unassigned-reserved.md`.
2. **`/h/` reading** as above.
3. **`x` + a demonstrative** (*now, about this one*): confirm it works as an ordinary noun-phrase topic word.
4. **Fill-ask.** Check that a fill question (*which one?*) and a demonstrative do not collide on the shared shape.
5. **Ending-only split.** After spoken spans go, parser classification of `PoS V x V` depends on the ending alone (**-r** pointer, **-l** / **-m** demonstrative, **-n** rejected). Confirm no remaining shape needs the old span reading, and that pointer vowel **u** (not a pointer vowel) stays rejected with **-r**.

## If accepted, the work is

- a closed vowel table and a `classify` rule for `PoS V x V` with **-l** / **-m**, rejecting **-n** and keeping **-r** with pointers;
- a grammar section (likely in pronouns.md, tied to the role-vowel teaching in roles.md) plus the family-table and decision-order edits in x-compounds.md, including removal of the span rule;
- a recipe entry in the recipe track for *this / that / here*;
- a design-decisions.md entry for the unused cells, for **-n**, and for **u** as un-anchored rather than a role;
- parser and fixture updates in the same change, per the repo rule that parser changes ship with grammar edits.
