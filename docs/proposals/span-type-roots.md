# Proposal: span types as overlay roots

**Status:** PROPOSED (not current language). Grammar today: a spoken [span open](../grammar/spans.md#shape) is role letter + TYPE vowel (**a** cite, **e** aside, **o** mention, **u** opaque) + mid-word **`x`** + EDGE vowel + ending.  
**Related:** [spans.md](../grammar/spans.md), [x-compounds.md](../grammar/x-compounds.md#families-by-shape), [parser-pipeline.md](../meta/parser-pipeline.md#overlay-kinds), `data/lexicon-overlays.csv`  
**Design authority:** none until absorbed.

## Motivation

- **The TYPE vowels are used up.** Four types fill `a` / `e` / `o` / `u`; a fifth span type has no slot. The cues are also strained (*u ≈ undo*).
- **`V x V ending` is one shape shared by several families.** Spans and [role pointers](../grammar/pronouns.md#role-pointers) both use it, and the "which family" test in x-compounds.md has a dedicated "one vowel `x` one vowel" row to split them. Moving the span type onto a root takes spans out of that shape.
- **A root carries a real mnemonic.** Overlay roots are the repo's mechanism for closed inventories with emoji seeds.
- **The TODO to make scope islands a span** needs a type of its own.

## Proposed shape

```text
{PoS}{TYPE-ROOT}x{EDGE}{ENDING}
```

- TYPE-ROOT is a closed overlay root (new `kind`, for example `span_type`), one per type: cite, aside, mention, opaque, and any later type.
- EDGE (**a** multi · **e** clause · **o** atomic · **u** empty / resume) and the endings (**-l** / **-m** / **-n** / **-r**) keep their current jobs.
- Closes (`xuxul` / `xuxur` / `xuxum`) are whole words with no type and stay as they are.
- Writing brackets (`d[…]`, `th(…)`, `d{…}`, `d<…>`) are unchanged; only the spoken map changes.
- The inventory grid becomes root × edge × ending instead of vowel × edge × ending.

## Collision to settle: ability

Ability is already `longer root + x + vowel` ([x-compounds.md](../grammar/x-compounds.md#families-by-shape)), and conversation length is `name + x + vowel + -n`. A span open `d` + root + `xal` has the ability shape, and the `/v/` slot overlaps directly.

Proposed rule, in the style of the sake overlays (which attach only to `x` + vowel hosts): a span-type root read as `root + x + vowel` is a span open, and **loses its ability reading**. Pick roots whose ability reading is meaningless (a *quote* root, not *tell*). Resume (root + `xur`) follows the same rule.

Open checks:

1. An overlay is meant to attach to an existing published row whose bare spelling is ordinary content. Confirm the closed-root exclusion fits that policy, or allow a span-type kind that is not a plain content row.
2. The aside lives under `/th/`, where mid-word `th` already means sakes and label scope. Check that `th` + type root + `x` + edge stays unambiguous.
3. Opens grow from 5 letters to roughly 8–9. Check the common atomic cite (`daxol azawan`) for speech and singing.

## New span types this makes room for

In rough order of value:

- **Thought cite.** Like a cite, but nobody said it aloud: *Azawan thought "I failed"* versus *said*. It fits the language's bias-awareness and authentic-choice themes.
- **Scope island as a type.** Gives `^ … ^` a spoken open instead of the pause-only exception, and answers the TODO on scope islands.
- **Gloss / translation.** *"Odoga", meaning "dog".* It sits between the cite and the mention.
- **Sic / as-given.** Quoted as the source wrote it, errors included. A rarer fidelity mark than `~` or `@`.
- **Code / formula.** An opaque span that is machine-readable, which suits the "supports computational tools" goal.
- **Sung / lyric cite.** Sung rather than spoken, so a quote can carry melody. A novelty that fits a language meant to be sung.

## Typed span resume

Today `daxur` resumes the latest span of a TYPE. With type roots, *that thought* and *that quote* stay separate even when both are cites by form, and a resume could name a type that has no vowel today.

## If accepted, the work is

- new overlay `kind`(s) and rows in `lexicon-overlays.csv`, each anchored to a teaching row;
- a `classify` rule that reads a span-type root before `x` + edge vowel as a span open;
- grammar edits to spans.md and x-compounds.md (the family table and decision order);
- a design-decisions.md entry for the ability exclusion;
- parser and fixture updates in the same change, per the repo rule that parser changes ship with grammar edits.
