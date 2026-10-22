# Proposal: named-handle coinage (consonant harvest)

**Status:** PROPOSED (not current language). Grammar today: a handle is one **published** root + **-n** ([named handles](../grammar/say-people-places.md#named-handles)); a long title is a hyphenated name (`ROOT x ROOT` … + **-n**, [multipart names](../grammar/word-endings.md#multipart-names)) or a [titled phrase](../grammar/word-endings.md#titled-phrases).  
**Related:** [place-name roots](../grammar/phonology.md#place-name-roots) (the shape a harvested handle takes), [respell](../grammar/lexicon.md#respell) (the widget that already mints place-name roots), [spans.md](../grammar/spans.md#loans) (foreign acronyms), [resume](../grammar/pronouns.md#resume-r) (whole stem + **-r**)  
**Code:** [`src/place-root.ts`](../../src/place-root.ts) (`finishPlaceLetters`), [`src/root-shape.ts`](../../src/root-shape.ts) (`isPlaceRootShape`)  
**Design authority:** none until absorbed.

## Motivation

English offices often have a **short name** (*FBI*) beside a long title. Agebon already has:

- Long native titles: `ROOT x ROOT` … + **-n** (`zanaxolazun`).
- Short names: a published root picked as the handle (`zanan`).
- Foreign names and acronyms: a span that keeps the letters (`z@<FBI>`), or a [respelled](../grammar/lexicon.md#respell) place-name root that follows the English sound.

Harvest mints the short name **from the long title**, so a hearer who knows the title can recover the handle, and the speaker does not have to pick an unrelated published root.

Speakers already mint roots: the respeller turns any English person or place name into a [place-name root](../grammar/phonology.md#place-name-roots). Harvest reuses that shape for native titles.

## Non-goals

- Changing how **-n**, mention `[…]`, or opaque `<…>` work.
- Putting harvest products in [`lexicon-published.csv`](../../data/lexicon-published.csv) as ordinary senses.
- Harvesting foreign acronyms. A foreign acronym stays a span or takes the respeller's sound-spelling.
- Teaching coinage on learner grammar pages while this stays a proposal.

## Proposed harvest

Take the title's **first and last content roots** (skip joins, revisers, and number words). The handle is a consonant skeleton of the two:

| Step | Do |
|------|----|
| 1 | First root's **first vowel + first consonant** |
| 2 | Last root's **first consonant** |
| 3 | Last root's **last vowel** (its [root tail](../grammar/compounds.md#root-tails) job vowel) |
| 4 | **-n** in use, like any name |

`ana` *book* × `olazu` *lion* (abstract *courage*):

```
`a` + `n` + `l` + `u` → `anlu` → `zanlun`
```

The two consonants meet as a cluster, so `anlu` is a legal place-name root at four letters (`isPlaceRootShape`). An ordinary root never has a cluster, so a handle can never equal a dictionary root, and hearers take it as a name the same way they take `avranzan`.

| Agebon | Use | English |
|--------|-----|---------|
| `zanaxolazun` | long title | *Book-Courage* (full title) |
| `zanlun` | harvested handle | the same office, short |
| `anlun` | citation of the handle | |
| `zanlur` | resume: whole stem + **-r** | the office again |

### When the cluster is not legal

Two clusters break the skeleton:

- **A doubled consonant** (the two consonants are the same letter): a doubled letter is said once, so the cluster disappears.
- **`l` / `m` + `r`**: the closed lexical-join seam, never inside a root.

In both cases take the last root's **next** consonant instead:

```
`ana` × `anumu` → `n` + `n` doubled → `n` + `m` → `anmu` → `zanmun`
`ulobe` × `araye` → `l` + `r` is the seam → `l` + `y` → `ulye` → `zulyen`
```

If the last root has no next consonant (a three-letter root), fall back to the **syllable harvest**: first vowel + next consonant from each root, finished by `finishPlaceLetters` (it adds the last vowel and pads a clusterless result to seven letters ending in `n` + vowel). `ana` × `olazu` that way is `anolono`.

### Collisions

Ordinary roots cannot collide. A harvest that equals a **named** row (a country, another office's handle) uses the syllable harvest instead. If that also collides, the institution picks a published root as the handle, as today.

## Arity

Cap the harvest at **two roots** (first and last). A third root's consonant would make a three-consonant run (`anldu`), which breaks the [singability](../grammar/phonology.md#singability-constraints) goal that clusters stay few and short. A title of three or more roots still harvests from its first and last roots only. Do not teach n-ary harvest.

## Why it is not in grammar yet

- Doc lint checks that Agebon in code spans uses lexicon roots, and harvest products are not lexicon rows. The [respell](../grammar/lexicon.md#respell) section avoids this by showing only published roots and spans in code, and computing the rest in a widget.
- A handle that loses its title (the reader never heard the long form) carries no more meaning than a picked root. Harvest only pays when the long title is also in use.

## Absorb sketch (if yes)

1. Harvest is a new form, so it goes on a stage page, not only the recipe track: Advanced on [word-endings.md](../grammar/word-endings.md#multipart-names) beside hyphenated names, linking [place-name roots](../grammar/phonology.md#place-name-roots) for the shape. Add harvested handles to that section's list of place-name root sources.
2. Add a row to the [named handles](../grammar/say-people-places.md#named-handles) recipe pointing to it.
3. Code: a `harvestHandle(first, last)` beside `finishPlaceLetters`, with tests for the two fallbacks and the named-row collision.
4. Lint: either let a listed set of harvest examples (`anlu`, `anmu`, `ulye`) pass in grammar docs, or add a title → handle mode to the respell widget and keep harvest products out of code spans.
5. Do not add harvest stems to the published lexicon as senses.
