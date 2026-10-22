# Proposal: Numeric prefixes (*quasi-*, *proto-*, *tri-*)

**Status:** PROPOSED. Nothing here is implemented. It replaces the root-first shape of [numeric derivation](../grammar/numeric-derivation.md) with a number-first shape on the **`x`** seam. It needs nothing from other proposals: the left of the seam starts with **`r`**, which no role compound, pointer, or root does. It shares the **`mx`** seam with `hook-prefixes.md`; if both land, they land on one phonology edit.  
**Related:** [numeric derivation](../grammar/numeric-derivation.md), [numbers](../grammar/numbers.md), [lexical compounds](../grammar/compounds.md#lexical-compounds), [compound order](../grammar/compounds.md#ordinary-compound-order), [left and right of `x`](../grammar/compounds.md#families-by-shape), [singability constraints](../grammar/phonology.md#singability-constraints).

## Problem

A numeric derivation names a kind of thing by a number idea: *essence of love*, *a quasi-friend*, *a three-part dialogue*. Today the root comes first, then a lexical join (**-l** / **-m**), then the number stem: `zolamalrawal`, `zahuyayolruwul`, `zezuyelragel`. That shape has three costs.

- **The head comes first.** Every other compound in Agebon puts the kind last: *doorbell* is a bell, and in an **`x`** compound "the last root is the kind" ([compound order](../grammar/compounds.md#ordinary-compound-order)). A derived word is a kind of its root, yet the root comes first, so it is the one compound a learner reads backward.
- **English puts these pieces first.** Nearly every English equivalent is a prefix: *quasi-*, *proto-*, *multi-*, *de-*, *uni-*, *bi-*, *tri-*, *null-*, *mega-*. A learner who reaches for *quasi-friend* has to flip it.
- **It closes a syllable mid-word.** The lexical join before **`r`** is "the only syllable-final consonant inside an ordinary word" ([phonology](../grammar/phonology.md#singability-constraints)): `zo-la-mal-ra-wal`. A closed syllable breaks a held note.

## The shape

Role letter + number body + seam + stem + ending. The number body is a free number word with its role letter and ending taken off (`grawal` → **`rawa`**). The seam is **`x`** when the number is exact, and **`mx`** when it is approximate.

> `zrawaxolamal.`
>
> z-infinity-x-love
>
> "There is an essence of love."

> `zuzozen dragemxezuyel vawebol.`
>
> z-Uzozen | d-three.about-x-discourse | v-see
>
> "Uzozen sees a roughly three-part dialogue."

The number names the kind of thing, the seam joins it, and the stem is the kind. The word is a kind of the stem, as in any **`x`** compound: `zruwuxahuyayol` is a friend-shaped someone, read *quasi-friend*.

```text
PoS + NUM + {x|mx} + STEM + {-l|-m|-n|-r}
```

| Piece | Use | Today |
|-------|-----|-------|
| **PoS** | the derived word's slot, as now | same |
| **NUM** | number body: marker vowel, then any digitless exponent or one digit, as the tables on [numeric derivation](../grammar/numeric-derivation.md) allow. No role letter, no ending | same body, after the root |
| **seam** | **`x`** the number is exact; **`mx`** approximately that number | whole-word **-m** |
| **STEM** | any root, or an ordinary **`x`** compound | same |
| **Ending** | the stem's sense: **-l** everyday, **-m** abstract; or **-n** a name, **-r** a resume | the join letter (**-l** / **-m**) picked the sense |

Each piece of meaning keeps one letter. It only moves:

| Meaning | Today | Proposed |
|---------|-------|----------|
| root's sense (everyday / abstract) | join letter, mid-word | final ending, as in every **`x`** compound |
| exact / approximate number | final **-l** / **-m** | seam **`x`** / **`mx`** |
| name / resume | final **-n** / **-r** | final **-n** / **-r** |

The **`mx`** seam picks approximate the way **-m** does on a free number (`gragem` *about three*). It matches the **`mx`** seam in `hook-prefixes.md`, where **`m`** before the seam also carries the hook's **-m**. There is no **`lx`** seam: plain **`x`** already spells exact. Other consonants before the seam (**`nx`**, **`rx`**) have no reading.

## The readings do not change

Every row on [numeric derivation](../grammar/numeric-derivation.md) keeps its reading and its number body. Only the order changes. These are the page's own examples, respelled.

### Limit / polarity / stage (digitless)

| Body | Use | Today | Proposed | English |
|------|-----|-------|----------|---------|
| **`rawa`** `+e` | essence | `zolamalrawal` | `zrawaxolamal` | *essence of love* |
| **`rawu`** `+e-` | grain | `zolamalrawul` | `zrawuxolamal` | *grain of love* |
| **`ruwa`** `-e` | void of | `zevemulruwal` | `zruwaxevemul` | *void of fear* |
| **`ruwu`** `-e-` | quasi- | `zahuyayolruwul` | `zruwuxahuyayol` | *quasi-friend* |
| **`rewu`** `#e-` | origin, proto- | `zolamalrewul` | `zrewuxolamal` | *love in its beginning form* |
| **`rewa`** `#e` | telos | `zonemrewal` | `zrewaxonem` | *the story's final form* |
| **`ra`** `+` | poly-, multi- | `zehohamral` | `zraxehoham` | *multi-faith* |
| **`ru`** `-` | de-, un- | `vonemrul` | `vruxonem` | *to de-tale* |

### Scalar and ordinal digits (`+N` / `-N` / `#N`)

| Body | Use | Today | Proposed | English |
|------|-----|-------|----------|---------|
| **`raba`** `+1` | uni-, primary | `zadowomrabal` | `zrabaxadowom` | *a single / primary voice* |
| **`rado`** `+2` | bi-, mutual | `gabewemradol` | `gradoxabewem` | *mutual commitment* |
| **`rudo`** `-2` | one-sided | `gabewemrudol` | `grudoxabewem` | *one-sided commitment* |
| **`rage`** `+3` | tri- | `zezuyelragel` | `zragexezuyel` | *a three-part dialogue* |
| **`ramo`** `+0` | null, reset | `vodoramramol` | `vramoxodoram` | *to null the score* |
| **`rumo`** `-0` | anti-null | `zaramrumol` | `zrumoxaram` | *a debt that won't zero* |
| **`ruwudo`** `-e-2` | quasi-dual | `zehemruwudol` | `zruwudoxehem` | *a quasi-pair* |
| **`reba`** `#1` | first-class | `debewemrebal` | `drebaxebewem` | *a first draft* |
| **`redo`** `#2` | secondary | `gamunemredol` | `gredoxamunem` | *secondary* (adventure) |
| **`remo`** `#0` | zeroth-order | `zuboremremol` | `zremoxuborem` | *a zeroth-order calculation* |

### Zero × exponent, labels, hyperbole

| Body | Use | Today | Proposed | English |
|------|-----|-------|----------|---------|
| **`ramowa`** `+0e` | total null | `vodoramramowal` | `vramowaxodoram` | *annihilate the score* |
| **`rumowa`** `-0e` | absolute residue | `zaramrumowal` | `zrumowaxaram` | *debt as absolute residue* |
| **`remowa`** `#0e` | disqualified | `zamahumremowal` | `zremowaxamahum` | *a disqualified challenge* |
| **`roba`** `_1` | specimen #1 | `zudewalrobal` | `zrobaxudewal` | *specimen #1* |
| **`robado`** `_12` | coded kind | `zahehalrobadol` | `zrobadoxahehal` | *room-12* |
| **`rowa`** `_e` | open catalog | `zudenelrowal` | `zrowaxudenel` | *open-ended ticket ID* |
| **`rabawa`** `+1e` | gazillion- | `zezulamrabawal` | `zrabawaxezulam` | *a gazillion-mess* |
| **`rebawa`** `#1e` | umpteenth | `zuguvelrebawal` | `zrebawaxuguvel` | *an umpteenth attempt* |

The label rows read backward against *specimen #1* and *room 12*, but English puts a code first inside a compound too (*a 747 jet*, *a level-3 problem*), and plain `zahehal g_12` still says *the room numbered 12*. They stay, in the new order like every other row.

### Role letters

Role letters work as now: `/v/` *to quasi-befriend* `vruwuxahuyayol`, `/ɡ/` *quasi-official* `gruwuxezazom`, `/h/` *quasi-officially* `hruwuxezazom`, `/w/` `wruwuxobemum gobemum`, `/y/` `yruwuxahuyayol`. A derived noun takes plural **-x** at the end as usual: `zragexezuyelx`.

## Why number first

- **One compound order.** The kind is last in an **`x`** compound, in a dictionary compound, and now in a numeric word. The [left and right of `x`](../grammar/compounds.md#families-by-shape) test grows one row: a number body left of the first **`x`** is a numeric prefix.
- **One prefix family.** With `hook-prefixes.md`, the left of the seam says what kind of prefix it is: hook vowels name a relation to the stem (*anti-war* is not a war), a number body names what kind of stem it is (*a tri-dialogue* is a dialogue). Both use **`x`**, and both use **`mx`** for their **-m**.
- **English order.** *Quasi-friend*, *proto-love*, *multi-faith*, *tri-dialogue*, *de-tale* keep their English order.
- **Open syllables.** With **`x`**, every syllable is open: `zra-ge-xe-zu-yel`. The lexical join before **`r`** leaves the cluster list. Only **`mx`** closes a syllable (`zra-gem-xe-zu-yel`), and only for the rare approximate number, the same closed **`m`** the hook-prefix **`mx`** needs.
- **The same length.** `zezuyelragel` and `zragexezuyel` are both twelve letters. The join letter and the seam trade places.

## Spelling and parsing

- **Left of the seam:** role letter, then **`r`** and a marker vowel. No root, role vowel, or hook vowel starts with **`r`**, so the first **`x`** after a number body is always this seam. Number words never contain **`x`** (digits sit side by side, and groups use **`th`**), so the seam cannot fall inside the body.
- **Right of the seam:** a root of at least three letters, or an ordinary **`x`** compound (the number then covers the whole compound, and its last root is still the kind). A single vowel and an ending after the seam (`zragexal`) has no reading; list it as open in `unassigned-reserved.md`.
- **Not the plural:** word-final **-mx** is the [indefinite group](../grammar/plurality.md) on a free number (`zragemx`). The seam always has a stem after it.
- **Hosted:** in a `bl-` slot, `blragexezuyel`, the same syllabic **`l`** before **`r`** as a hosted number.
- **Stress:** a numeric prefix word is a content word, so it stresses its first syllable. The number-word rule (stress the last digit of each group) is for free numbers.
- **Still one digit.** **`+N`** / **`-N`** / **`#N`** keep one digit, and **`_`** keeps any digits, as now. The seam would delimit a longer body, but no reading asks for one: *twelve-step* counts steps, not parts of the stem.
- **Left open:** a numeric prefix inside a hook prefix or the other way round (`guexragexezuyel`), and **`nx`** / **`rx`** after a number body. Both go in `unassigned-reserved.md` as open.
- **Old spellings:** `zolamalrawal` and every root + **-l** / **-m** + **`r`** word stop parsing. Add the shape to `unassigned-reserved.md` as closed, with the reason in `design-decisions.md` (the kind goes last, and the join closed a syllable).

## What changes

- **Grammar, [numeric-derivation.md](../grammar/numeric-derivation.md):** rewrite the intro, the shape block, and the piece table for number + seam + stem; respell every example (about 135 words) and the practice items; the cue becomes *number, then **`x`**, then the root*. Glosses read `z-infinity-x-love`, and approximate bodies show `.about` (`d-three.about-x-discourse`), which today's derived glosses drop.
- **Grammar, elsewhere:** the [left and right of `x`](../grammar/compounds.md#families-by-shape) table gets a numeric-prefix row; [phonology.md](../grammar/phonology.md#singability-constraints) drops the lexical join before **`r`** and adds mid-word **`mx`** (shared with hook prefixes); [review.md](../grammar/review.md) respells `gogowulrawal` → `grawaxogowul`; shorthand `ROOTlNUM` on [numbers.md](../grammar/numbers.md), [numbers-applied.md](../grammar/numbers-applied.md), [say-amounts.md](../grammar/say-amounts.md), and [relations.md](../grammar/relations.md) becomes `NUMxROOT`; [terminology.md](../grammar/terminology.md) entries that name the join; the *spelled (required)* row on [numbers.md](../grammar/numbers.md#style-numeric-vs-spelled).
- **Design notes:** `unassigned-reserved.md` (old shape closed; single vowel after the seam, **`nx`** / **`rx`**, and stacked prefixes open; the existing numeric-derivation rows respelled); `design-decisions.md` (why number first, why no **`lx`**); `parser-pipeline.md`, `drill-generation.md`, `cool-features.md` where they spell the old shape.
- **Code:** the derivation rule in [`src/parse/word.peggy`](../../src/parse/word.peggy) and its types, glosses ([`morph-gloss`](../../src/parse/morph-gloss.test.ts)), [`constructions.ts`](../../src/parse/constructions.ts) reader notes, [`linkers.ts`](../../src/parse/linkers.ts), [`inspect.ts`](../../src/parse/inspect.ts); TTS number handling in [`src/tts/numbers.ts`](../../src/tts/numbers.ts); [`src/place-root.ts`](../../src/place-root.ts), which splits the old seam; the lint checks that read derived words ([`number-speech-docs.ts`](../../src/lint/number-speech-docs.ts), [`word-bank-docs.ts`](../../src/lint/word-bank-docs.ts), [`template-trace.ts`](../../src/lint/template-trace.ts)); english-helper cues for *quasi-*, *proto-*, *multi-*, *de-*, *uni-*, *bi-*, *tri-*. Then `npm run grammar-check`.
- **Data:** the three lexicon rows that cite `numeric-derivation.md#advanced-practice` keep their anchor; no root changes.
