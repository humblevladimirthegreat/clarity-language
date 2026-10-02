# Proposal: generic pronoun

**Status:** PROPOSED (not current language). Grammar today: **`ehodo`** (*listener*) also covers generic *you* ([ordinal pronouns](../grammar/pronouns.md#ordinal-pronouns), *Compare with*); **`unan`** is *someone* ([special pronouns](../grammar/pronouns.md#special-pronouns)); *people in general* is the open every-kind join `zuam` + SHARED kind ([universals](../grammar/joins.md#universals-domains-generics)).  
**Related:** `topic-pronoun.md` (where `ehodo` was settled as the actual listener), [pronouns.md](../grammar/pronouns.md#special-pronouns), [joins.md](../grammar/joins.md#universals-domains-generics), [say-people-places.md](../grammar/say-people-places.md#role-title-address), [design-decisions.md](../meta/design-decisions.md) (D-06, D-13), [lexicon editing](../meta/lexicon.md), [`src/lexicon-place.ts`](../../src/lexicon-place.ts), [`src/closed-roots.ts`](../../src/closed-roots.ts)  
**Design authority:** none until absorbed.

## Motivation

`ehodo` should always mean the person actually listening. A pronoun that is sometimes *you, the person here* and sometimes *anyone at all* cannot be resolved mechanically, and the topic proposal needs `/x/` + `ehodo` to name one real person.

English generic *you* / *one* (*you never know*, *one should rest*) then needs a home. The existing forms do not fit it:

- `unan` *someone* claims that a particular individual exists, without saying who. Generic *one* claims nothing about any individual.
- `zuam gebezal` *people in general* is exact but five syllables, for one of the most frequent pronouns in English.

There is also a reason inside Agazan's purpose. English generic *you* lets a speaker say their own experience as if it were everyone's (*you feel awful when that happens*). With *I*, *you*, and *one* on three separate forms, a speaker has to choose between reporting their own experience and making a general claim, and a listener can tell which one they got.

## Proposed shape

The generic pronoun is the published root **`ebeza`** (🧑 *person*, abstract *humanity*) with **-n**, a marked pronoun row like *someone* (**`una`**) and *speaker* / *listener* (**`amago`** / **`ehodo`**). Marked rows get three-letter roots, so `ebeza` is respelled to three letters and the pronoun is two syllables. The forms below use today's spelling until that respelling runs (`topic-pronoun.md`, *Implementation*):

| Form | Meaning | English |
|------|---------|---------|
| `zebezan` / `debezan` / `bebezan` | any person, as a rule | *one*, generic *you*, *people* |

The pronoun reading is on `/z/`, `/d/`, and `/b/` only. (cue: 🧑 is the emoji for a person in general, and **-n** names that person the way `yebezanx.` already calls on *everyone* ([address](../grammar/say-people-places.md#role-title-address)))

> `zebezan vezebal ol bahazal.`
>
> z-ONE | v-sleep | [at | b-house]
>
> "One sleeps at home." / "You sleep at home."

`ebezal` *a person* and `ebezam` *humanity* keep their senses, and `yebezanx.` keeps its address reading.

## How it differs from its neighbors

| Form | Picks | English |
|------|-------|---------|
| `ehodon` | the person actually listening | *you* |
| `unan` | one unidentified individual who exists | *someone* |
| `ebezan` | nobody in particular; true of people as a rule, with exceptions | *one*, generic *you* |
| `zuam gebezal` | people in general, as far as I know | *people in general* |
| `zual gebezal` | every person, no exceptions | *everyone* |
| `zuan gebezal` | humankind as a kind | *people* (the species) |

`ebezan` is the pronoun-sized form of the open every-kind `zuam gebezal`: a default that tolerates exceptions, not a universal. For *everyone, no exceptions*, use `zual`.

## Rules

- **No ordinal.** Like the other special pronouns, it takes no number.
- **No -x.** It already means people at large; `zebezanx` is invalid.
- **Resume.** `zebezar` picks it up again like any word, and a role pointer may land on it.
- **Topic.** `/x/` + `ebezan` (*now, about people in general*) is a valid topic; the topic pronoun then means *one*.
- **Holder.** As a [holder](../grammar/knowing.md#holder), it is the generic view (*one would think*). The holder seam's warrant rules still apply.

## Root

**Decided: `ebeza`.** The alternative, **`una`** **-m** (`zunam`), would have replaced the noun *impartiality* on `/z/`, `/d/`, `/b/`, and *someone* vs *one* differing only by **-n** / **-m** on one root is easy to mishear.

## On absorb

- [pronouns.md](../grammar/pronouns.md#special-pronouns): add the row to the special pronouns table; remove *generic you* from the `amago` / `ehodo` *Compare with* under ordinals, and say `ehodo` is always the actual listener.
- [joins.md](../grammar/joins.md#universals-domains-generics): cross-reference `ebezan` beside `zuam` + SHARED.
- [english.md](../grammar/english.md) and the recipe pages: *one*, generic *you*, *people* (generic).
- [terminology.md](../grammar/terminology.md): *generic pronoun*.
- 🧑 becomes a marked pronoun row and is respelled to three letters, in the lexicon pass described under *Implementation* in `topic-pronoun.md`. Morph gloss `ONE`. The parser rejects **-x** on it.

## Settled

- Root: `ebeza`, respelled to three letters.
- No generic *they*: English *they say* is [hearsay](../grammar/knowing.md#evidentiality).
