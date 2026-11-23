# Idea: a relation for *a photo of X*

**Status:** IDEA 2026-11-23. Came out of the consent question settled as [D-78](../../meta/design-decisions.md) (a participant's say word names only that role's holder).

**Related:** [of relations](../../grammar/intermediate/of-relations.md#of-relations), [consent](../../grammar/intermediate/permission-consent.md#consent), [evidentiality](../../grammar/intermediate/evidentiality.md) (a camera as a channel), [`data/lexicon-published.csv`](../../../data/lexicon-published.csv).

## Problem

Ageben has no way to say who or what a picture shows. *A photo of us*, *her portrait*, *a drawing of the house*, *a video of the match* all lack a form. The only place a camera appears is as an evidence channel (`thevum blugewel`, *remembered from a photo*), which says how you know a scene, not what an object depicts.

The gap shows most in consent. *I posted the photo of us* (the other person said yes) is `zuwen dugewel vobohal hwevam blalazun`: the yes is Alazun's, but nothing in the clause says Alazun is in the photo, so a listener does not hear why Alazun's yes matters. English *her photo* is also ambiguous between the photo she keeps (`om`) and the photo that shows her.

## Sketch

A sixth of-relation, hosted like the other five: a relation word on `/ɡ/` right after the noun, and the depicted thing in a `bl-` word.

> `zuwen dugewel gREL blayan vobohal hwevam blalazun.`
>
> "I posted the photo of us, and Alazun said yes."

- It needs a published root whose abstract sense is *likeness of / depiction*, with a concrete seed (a portrait frame, a mirror, a statue). `ugewe` (camera) is the obvious family, but its abstract slot is empty and a camera seed fits *recording* better than *depicting*.
- On `/h/` it would name what an act depicts: *Azozon paints, depicting Alazun*.
- It stays a noun relation; it does not change who a say word names. A depicted person is a `bl-` word inside the photo's phrase, so under D-78 their yes is still `hwevam bl-X`.

## Open questions

1. **Root.** A new root, the empty abstract of an existing one, or `gewem` (likeness)? `gewem` is *like X*, a comparison of two things; *a photo of X* is not like X in that sense. **Recommendation:** a dedicated root, medium.
2. **Placement.** An of-relation (intermediate, with *part of* and *made of*), or a hook? The of-relation shape already carries a `bl-` noun and works on `/h/`. **Recommendation:** of-relation, medium.
3. **Topic or subject matter** (*a book about Alazun*, *a song about rain*). Same relation, or a separate one? A picture shows its subject; a book discusses it. No basis to choose yet.
