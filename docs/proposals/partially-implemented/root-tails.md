# Proposal: root tails (kind and shape), with the second-consonant ban lifted

<!-- retie: skip -->

**Status:** PARTIALLY IMPLEMENTED. Phases 1 and 2 are built: every five-letter root is placed by its tail, the language name is **Egabon** (`egabo` + **-n**), and the docs are retied ([phase 2 as built](#phase-2-as-built)). Phase 3 is built too: the checkpoint look-alike lint runs in `npm run build` ([phase 3 as built](#phase-3-as-built)). Still open: the [`--all` failure](#prerequisite). Spellings in this page are phase 1 output; the live ones are in [`lexicon-published.csv`](../../../data/lexicon-published.csv).  
**Related:** `tail-suffix.md`; [lexicon editing](../../meta/lexicon.md) ([§ root spellings](../../meta/lexicon.md#root-spellings-come-from-convert-word), [§ root length](../../meta/lexicon.md#root-length), [§ root tails](../../meta/lexicon.md#root-tails), [§ seeds](../../meta/lexicon.md#seeds-concrete-senses-and-pictographs), [§ core vocabulary](../../meta/lexicon.md#core-vocabulary-column)); [clause.md § role letters](../../grammar/clause.md#role-letters); [speech-moves.md § speech act](../../grammar/speech-moves.md#speech-act-beginner) (the vowel series); [word-endings.md](../../grammar/word-endings.md); [x-compounds.md § lexical compounds](../../grammar/x-compounds.md#lexical-compounds); [hooks.md § hook compounds](../../grammar/hooks.md#hook-compounds); [numeric-derivation.md](../../grammar/numeric-derivation.md); [language-name.md](../../meta/language-name.md); [`src/word-converter.ts`](../../../src/word-converter.ts) (`SECOND_CONSONANT_BAN`, `longRootCandidates`, `rankRoots`); [`src/echo-metric.ts`](../../../src/echo-metric.ts); [`src/lexicon-place.ts`](../../../src/lexicon-place.ts); [`src/lexicon-compounds.ts`](../../../src/lexicon-compounds.ts) (`factorizationsForStem`, `validateCompoundRows`); [`src/parse/hook-compounds.ts`](../../../src/parse/hook-compounds.ts) (`parseHookCompoundCite`); [`src/closed-roots.ts`](../../../src/closed-roots.ts); `number-mnemonic.md` and `number-respelling.md` ([interactions](#interactions)).  
**Design authority:** none until absorbed. One grammar line changes: a hook compound's left piece must be a dictionary root ([hook compounds](#hook-compounds)). The grammar pages don't teach root spellings, so the tails reach learners through a new section in Advanced [phonology](../../grammar/phonology.md#advanced), which dictionary views link to ([phase 2](#phase-2)).

## Summary

- A five-letter root `V C V C V` has two parts. The **onset** (the first three letters) keeps roots apart: its first two letters are what distinctiveness scores, and its middle vowel hints at size. The **tail** (the second consonant and the final vowel) carries meaning.
- The **second consonant** says what **kind** of thing the root's concrete sense is: a creature, a person, a feeling, a food, a tool, and so on. There are twelve kinds, one per root consonant, and each is anchored to a job that letter already has in the grammar.
- The **final vowel** says the thing's **job**, reusing the vowel series: **a** holds, **o** one, **e** order, **u** takes away. Kind-specific pictures (a bowl, a road, a knife, a ball) are how that job shows up, not a second code; when no job fits, the row's outline (or, for feelings and actions, its direction) picks the picture ([fallback](#vowel-fallback)). The same extra is what a tail suffix would add (`tail-suffix.md`).
- The **middle vowel** says the thing's **size** where it has one: **a** bigger than a person, **o** between a hand and a person, **e** fits in a closed hand, **u** no size of its own (a substance, color, weather). It's a placement preference, not part of the tail ([middle vowel](#middle-vowel)).
- The onset is chosen so that few roots of the **same kind** share its **first two letters**, and for a **first consonant that matches the English word's**. Roots of different kinds are told apart by the tail and cost nothing. Learning order plays no part; the [phase 3](#phase-3) lint covers teaching. The full English echo becomes a tie-break.
- The **second-consonant ban is lifted**. The tail needs all twelve consonants second. Two checks replace the ban ([ban lift](#ban-lift)).
- Three-letter roots and the final vowel of named (flag) rows are exempt.
- [Phase 1](#phase-1) builds the whole new lexicon in a separate file and reports on it, without touching the live lexicon. [Phase 2](#phase-2) replaces the live roots and reties the docs. [Phase 3](#phase-3) lints the checkpoints so look-alike words aren't taught close together. Nothing is pinned, 👓 included; the language name is chosen at the end of phase 1, once the new 👓 root is known.

## Motivation

### The English echo carries less than it seems

Today `convert-word` ranks candidates by how closely they echo the English label. Measured on the 1351 five-letter roots (2026-10-19):

- 95% start with the English word's first consonant, and 75% have a second consonant found somewhere in the English word.
- But the mapping merges p/b, t/d, k/c/q/g, s/x/z and f/v. Only `b`, `g` and `z` start 44% of all roots, so a root's first consonant narrows it to about one root in ten.
- Inside a root the vowels carry about half its information, and the echo weights them lightly. They're close to arbitrary, and they're what a learner has to memorize.
- In use, a role letter and an ending surround the root (`zubuhel`), which muffles the echo.
- The echo helps only English speakers. [No English puns](../../meta/lexicon.md#no-english-puns) already rules out English sound links for seeds and mnemonics; a root spelling built on an English sound link has the same flaw.

### What the echo costs

**1349 of 1351** five-letter roots are one letter from another root. The 171 core roots form **253 one-letter pairs among themselves**. 👓 *glasses* is one letter from *house*, *mouse*, *clock*, *calendar*, *quiet*, *climb* and *croissant*. Most of these pairs differ only in a vowel, the part the echo doesn't cue. Words that look alike and are learned close together are a well-documented source of confusion in vocabulary learning.

These counts take every one-letter pair. Counted the way the placer now counts them, as same-kind pairs that share their first two letters ([scoring](#onset-scoring)), the live lexicon has 3402. The [phase 1 run](#phase-1-run) compares the two on that measure.

### What a tail gives instead

- **Production:** a learner who knows what a thing is knows two of its five letters. A creature ends in `z`; a gathering creature ends in `za`. What's left to memorize is the onset.
- **Recognition:** an unknown word in a text still says what kind of thing it names.
- **Neighbors that make sense:** some one-letter neighbors are unavoidable ([capacity](#capacity)). When two roots differ only in the tail, the differing letter has a meaning, and that difference is a cue, not noise.
- **One system:** each tail letter reuses a meaning the learner already met in the grammar (role letters, endings, the turn letter, the vowel series), so it adds no new code to learn.

## Root shape {#root-shape}

```
V  C  V  |  C  V
onset      tail
```

| Part | Letters | Chosen by |
|------|---------|-----------|
| Onset | first vowel, first consonant | [distinctiveness](#onset) |
| Size | middle vowel | the row's [size](#middle-vowel), where its kind has one; otherwise the English echo |
| Kind | second consonant | the row's [kind](#kinds) |
| Job | final vowel | the row's [job](#shapes) |

Why the tail is two letters, not three: the onset needs room. With two tail letters, each tail cell has 192 onsets to choose from. With three, it would have 48, and the nearest neighbor of almost every root would be a root of the same kind and shape. That's the classic failure of category-based languages: a slip produces a plausible wrong meaning. The onset is also the most salient part of a word, which is where distinctiveness counts most.

Examples below write roots as patterns (`VCVza`), never as spellings ([placeholder spellings](../../meta/lexicon.md#placeholder-spellings)).

## Second consonant: kind {#kinds}

The kind follows the row's **concrete sense**, as its label names it. The abstract sense takes the tail of its concrete seed: *compassion* sounds like a body part because it's reached through *heart*.

Row counts are from the phase 1 draft of `lexicon-tails.csv` (2026-10-19).

| Letter | Kind | Anchor in the grammar | Examples | Rows |
|--------|------|------------------------|----------|--------|
| `z` | **creatures**: animals, animal-shaped monsters, microbes | `/z/` is *who acts* | cat, ant, owl, snake, lion, dragon | 105 |
| `y` | **people**: persons, kin, roles, folklore beings you address as someone, and actions only a person could do | `y` + name calls someone | baby, elder, police, villain, ogre, teach, judge | 93 |
| `m` | **mind and feeling**: faces, emotions, mental states | **-m** is the abstract ending | grin, pensive, angry, starstruck, thought | 84 |
| `b` | **the body and what goes on it**: body parts, clothing, jewelry, what you carry, body care, medicine | `/b/` is the *bolted-on* piece | hand, nose, glove, crown, bag, soap, bandage | 114 |
| `v` | **doing, playing and moving**: actions any creature could do, sports, scored games, toys, vehicles | `/v/` is the action | run, fall, soccer, golf, dice, ski, kite, party, train | 113 |
| `h` | **places and fixtures**: buildings, landscapes, rooms, what's built in, street furniture, headings | `/h/` is *where* | house, mountain, bed, traffic-light, north | 94 |
| `l` | **nature and raw stuff**: plants, weather, sky, materials, colors | **-l** is the concrete ending | tree, flower, fire, cloud, gold, red | 85 |
| `d` | **food and drink**, with dishware and kitchen gear | `/d/` is *done to* (eaten) | bread, apple, tea, plate, spoon, pan | 116 |
| `w` | **tools and things you use** | `/w/` is *with* (the instrument) | knife, hammer, broom, lamp, key, phone | 94 |
| `g` | **signs, marks and writing**: symbols, paper, letters, religion marks | `/ɡ/` is *grade*, a mark on something | warning, circle, book, envelope, star-of-david | 102 |
| `r` | **counting, time, money and rhythm**: numbers, charts, clocks, coins, music, dance, dated events, zodiac | `r` after a role letter starts a number | clock, coin, calendar, bar-chart, drum, music note, dance, birthday, aries | 89 |
| `n` | **named places**: countries | **-n** is the name ending | country flags | 262 |

Edge rules:

- **People vs doing:** an action only a person could do (teach, judge, cook, pray) is `y`. An action any creature could do (run, climb, fall) is `v`.
- **People vs creatures:** a being you address as someone (ogre, vampire, alien) is `y`. An animal or animal-shaped monster (dragon, unicorn) is `z`.
- **On the body:** what is worn, carried or put on the body (ring, bag, lipstick, soap, bandage, pill) is `b`, not `w`.
- **Play:** toys, game pieces, sports and scored games (ball, dice, kite, skis, golf, baseball) are `v`, with the play.
- **Kitchen:** dishware and cooking gear (plate, spoon, pan, teapot) are `d`, with the food.
- **Fixtures vs tools:** a thing built into a place (door, window, bed, toilet) is `h`. A thing you pick up and use (broom, key) is `w`.
- **Marks vs where:** a thing whose job is a mark on a surface (writing, paper, a symbol, a UI button, a prohibition icon, a religion mark) is `g`. A thing whose job is to occupy or name a location (street furniture, a facility pictograph, a compass heading) is `h`. Buildings of worship stay `h`.
- **Paper vs tools:** a thing that carries marks (book, envelope, label) is `g`. A thing that makes them (pen, brush) is `w`.
- **Colors** are `l`, a raw quality of stuff. **Numbers and charts** are `r`.
- **Parts of creatures** (wing, horn, feather, paw-prints) are body (`b`), like a person's parts.
- **Times of day** (night, sunrise, dusk) and the **zodiac** belt are `r`. The sky things (sun, moon, star) are `l`. Country flags stay `n`. A religion mark (star of David, crucifix, menorah) is `g`; worship and pray stay `y`.
- **Compounds** need no tag. A stem ends in its head root, so a kind of bird keeps the bird's tail.

## Final vowel: job {#shapes}

The vowel series is reused unchanged: **a** add / hold, **o** one, **e** order, **u** undo. The extra is the same on every kind, so a tail suffix (`tail-suffix.md`) can compose: the consonant names the kind, the vowel says what that kind does with (or how it stands to) the left root.

On a simple root there is no left piece. Read the vowel as the thing's own job.

| Vowel | Job | Picture (fallback) | Rows | Things | People | Feelings | Doing | Places | Signs | Counting |
|-------|-----|--------------------|------|--------|--------|----------|-------|--------|-------|----------|
| `a` | **holds or gathers**: containers, groups, masses, open spaces, what comes many at once, what stores, what you go inside; as a suffix, the new thing holds the left | a bowl: hollow or open | 353 (32%) | bowl, bag, rice, berries, hat, lamp, flower, coconut, hamburger | parent, host, family, bellhop, kiss | joy, love, gratitude, wink | party, team sports, balloon | field, sea, house, school, church | folder, chart, paper | money, bell, drum |
| `o` | **one of the kind**: whole, compact, one lump; as a suffix, a kind characterized by the left | a ball: round or compact | 227 (21%) | ball, egg, apple, ring, rock | a person, nerd, angel | calm, surprise, thought | jump, stand, dice | island, statue, chair | circle, dot, question mark | coin, die, guitar |
| `e` | **order**: ranked, sequenced, a stage or cycle, a path you travel or are led along, a heading; as a suffix, arranged or in sequence from the left | a road: long | 264 (24%) | ladder, clock, road, gold / silver / bronze, pen, tree, banana, giraffe, leg, wing | baby, child, king, judge, learn | salute, nod, awe, blush | race, walk, swim, bicycle, golf | road, north, tower, station | arrow, loop, page, exclamation | clock, calendar, sunrise, flute |
| `u` | **takes away or works against**: cuts, removes, hides, ends, forbids, stings, sickens, wards off; as a suffix, undoes the left | a blade: sharp or spiky | 245 (22%) | knife, scissors, poison, lemon, helmet, umbrella, pill, tooth, cactus, pineapple | thief, villain, ghost, heal | fear, sadness, disgust, dizzy, mockery | fight, fall, escape, pinch | cave, cemetery, castle, customs | warning, no-entry, cross, asterisk | minus, hourglass, whistle, night |

Rows per kind (five-letter rows by `shape` in the lexicon; named rows excluded, their vowel is free):

| Kind | `a` | `o` | `e` | `u` | Total |
|------|-----|-----|-----|-----|-------|
| `z` creature | 30 | 22 | 15 | 38 | 105 |
| `y` person | 24 | 21 | 28 | 20 | 93 |
| `m` mind | 18 | 18 | 7 | 41 | 84 |
| `b` body | 49 | 16 | 21 | 28 | 114 |
| `v` doing | 49 | 16 | 37 | 11 | 113 |
| `h` place | 42 | 15 | 24 | 13 | 94 |
| `l` nature | 30 | 20 | 20 | 15 | 85 |
| `d` food | 58 | 35 | 11 | 12 | 116 |
| `w` tool | 22 | 26 | 20 | 26 | 94 |
| `g` sign | 18 | 24 | 33 | 27 | 102 |
| `r` counting | 13 | 14 | 48 | 14 | 89 |
| **All** | 353 | 227 | 264 | 245 | 1089 |

**Tie rule:** test the jobs **u → a → e**, and use the first that fits. A knife is also a tool you could call one of its kind, but it cuts, so `u`. A basket is one object, but it holds, so `a`. A road is a place, but it is a path, so `e`. When no job fits, the [fallback](#vowel-fallback) picks the vowel; `o` is never chosen just because nothing else was tested.

**Holds is literal.** A building holds the people inside it (house, school, hospital, church, cinema), headwear holds the head (hat, turban), a lamp holds its flame, a balloon holds air, a bun holds its filling (hamburger, hotdog), a shell holds its animal (turtle, snail). A category gathers its members (animal, fruit). Something that protects tests `u` first: a helmet, armor, an umbrella and a castle ward off, so `u`.

**Order is broad.** `e` is not only for paths and clocks. Test it in every kind:

- **Ranked sets:** gold, silver and bronze (and a medal) rank; the rainbow colors (red, orange, yellow, blue, purple) are a series.
- **Stages and cycles:** a chick, a frog, a butterfly and a phoenix are stages in a life, and so are baby, child, boy, girl, man and woman; the moon goes through phases and the sun through its day; cooking, learning and building are steps in order; loop, reload, repeat and shuffle run or rearrange a sequence.
- **Led along a path:** a horse, a donkey and a guide dog carry or lead you along a way, and so do a bicycle, a wheelchair and a foot; a cane, a lantern and a chain link do the same as tools. A comet is its path; golf is played over a course.
- **Rank among people and creatures:** a nod, a bow or a plea addresses someone by standing; awe looks up; a gorilla leads its troop.

### Fallback {#vowel-fallback}

When no job fits, the vowel comes from a question every row of the kind can answer. Each answer is the picture of a job, so the fallback adds no second code: the bowl holds, the road leads, the blade cuts, the ball is one.

- **Things you can see** (creatures, body, nature, food, tools, places, signs, counting): the **outline**. Hollow or open (a cup, a bloom, a bun) is `a`; long (a pen, a tree, a carrot, a giraffe, a flute) is `e`; sharp or spiky (horns, a cactus, a triangle, an asterisk) is `u`; round or compact (an apple, a ring, a mouse, a coin) is `o`.
- **Feelings and faces** (`m`): which way the feeling points. Toward others (wink, tease, solidarity) is `a`; toward a standing or what comes next (peek, smugness, embarrassment) is `e`; against (mockery, sass) is `u`; turned inward (calm, sleepy, think, shrug) is `o`.
- **Actions** (`v`, and person rows that name an action or gesture): how it unfolds. Done with others (team sports, wave, kiss, massage) is `a`; along a course or through steps (swim, ride, learn, worship) is `e`; stops, hurts or knocks over (pinch) is `u`; done once on the spot (stand, kneel, sleep, thumbs-up) is `o`.
- **Beings** (`y` people who aren't an action): a life stage or rank is `e`; one who carries or gives to others (santa, bellhop) is `a`; otherwise `o` (nerd, angel, fairy).

Symbols of a faith or a gender stay `o` whatever their outline, so `u` never reads as *against* a group.

So *ant* is `VCVza` (a creature that lives in a colony), *snake* is `VCVzu`, *wolf* is `VCVzu`, *knife* is `VCVwu`, *giraffe* is `VCVze` (long), and *apple* is `VCVdo` (round).

`o` is now the smallest vowel overall. It reads as "one whole lump": round, compact, or turned inward.

## Middle vowel: size {#middle-vowel}

Confusing pairs are scored on the first two letters only, so the middle vowel costs nothing to give a meaning. Before this it fell to the echo tie-break and was the arbitrary letter a learner had to memorize ([motivation](#motivation)). It now says how big the thing is, using the most robust vowel symbolism across languages (big ↔ open, small ↔ front):

| Middle vowel | Size | Test | Examples |
|--------------|------|------|----------|
| `a` | `big` | bigger than a person | whale, ship, mountain, tree, house |
| `o` | `medium` | between a hand and a person | cat, apple, chair, guitar, shoe |
| `e` | `small` | you could hide it in your fist | ant, pea, key, tooth, ring |
| `u` | `none` | no size of its own: you can't point at one and say how big it is | rice, water, blood, metal, wool, fog, red |

The series reading is a memory aid: **a** add (more than you), **o** one ordinary thing, **u** undo (size taken away). `e` = small rests on the symbolism alone. When unsure between two sizes, take `medium`, so `a` and `e` stay rare enough to mean something.

**Which rows.** A `size` is required on every five-letter row of the six kinds that name physical things: creature, body, nature, food, tool, place. In `doing`, an object row (a vehicle, a toy, a piece of gear) takes one and an action (run, sleep, a sport) doesn't. Mind, person, sign and counting take none; their middle vowel stays free for the echo. A feeling has no size, but marking every one `u` would tell the reader nothing the consonant hasn't, and would cost the echo.

**Not "unknown".** The second medium vowel could have meant *varies* or *unknown size*. Every row names a known thing, and the learner remembers its typical size (a dog is medium), so *varies* is a line taggers and learners would draw differently. *No size of its own* is crisp, and it splits the final `a`: a middle `u` says a stuff (rice, soup), not a container (bowl, bag).

**A preference, not a check.** The placer charges a root whose middle vowel isn't its size vowel a small cost, above the echo tie-break and below the first-consonant cost. Two rows of one kind, shape and size that share their first two letters can't share a middle vowel, so in a crowded cell one gives way. `npm test` checks the `size` value, not the root's middle vowel; the tails report shows the share that match.

**Measured** (full `--all` placement, rough tags, before the column was drafted in full):

| | No size | Big / small only | Big / small, medium → `o` or `u` | All four sizes |
|---|---|---|---|---|
| Big / small (/ none) rows on their vowel | 42% | 98% | 96% | 98% |
| Medium rows on their vowel | — | — | 99% | 95.5% |
| Confusing pairs (non-flag) | 846 | 838 | 837 | 813 |
| Mean English echo | 0.715 | 0.713 | 0.685 | 0.680 |
| First consonant is the label's | 90.5% | 90.2% | 90.1% | 89.3% |

Confusing pairs move only by run-to-run noise. The cost is about 5% of the echo, nearly all in the vowels; the first consonant, which carries most of the echo's recall value, barely moves.

The drafted column: 668 rows, 338 `medium`, 127 `big`, 118 `small`, 85 `none`.

## Exceptions {#exceptions}

- **Named rows (`n`):** the final vowel is free. Job means nothing for a country, and the free letter gives 262 rows four times the room.
- **Three-letter roots:** exempt. These 69 rows back the closed grammar overlays. Their single consonant is also their onset, and they need every letter to stay apart ([root length](../../meta/lexicon.md#root-length)).
- **No pins.** 👓 is placed like any row (worn, so `b`), and its spelling changes. The language name comes from this root ([language name](../../meta/language-name.md)), so the name is settled once the re-placement shows the new root.
- **Closed roots** ([`src/closed-roots.ts`](../../../src/closed-roots.ts)) are respelled like any row; code names them by seed. The house cast's names follow their roots: *swan* and *lion* become `z` creatures and *hibiscus* an `l` plant, so all three names still differ in their onsets.

## Onset: distinctiveness {#onset}

### Capacity {#capacity}

With the ban lifted, there are 4 × 12 × 4 × 12 × 4 = **9216** five-letter roots. A set in which every two roots differ in at least two letters holds at most **768** of them (9216 ÷ 12: drop one consonant and the rest must still be unique). With about 1350 five-letter rows, **at least 43% of roots will have a one-letter neighbor**, under any placement. The goal is to make those neighbors harmless, not to remove them.

The 43% bound counts every pair. Only [confusing pairs](#onset-scoring) are scored: two roots of the same kind that share their first two letters. Each kind has **48** such prefixes (4 first vowels × 12 first consonants), whatever its shapes, so a kind of up to 48 rows can have none. Past 48, some are unavoidable. Spread evenly, a kind of *n* rows has at least *r*·C(*q*+1, 2) + (48 − *r*)·C(*q*, 2) confusing pairs, where *q* = ⌊*n* / 48⌋ and *r* = *n* mod 48. That floor is 36 to 88 pairs for the eleven shaped kinds and 590 for the 262 named rows: **1221** in all.

### Scoring {#onset-scoring}

A confusing pair is one where a slip lands on a word that fits the same context. Context catches a slip that changes the kind (a creature where a tool was meant), not one inside the kind. So **a pair is confusing if and only if the two roots are the same kind and their first two letters match exactly**. Placement adds 1 for each confusing pair. Nothing else counts: not the letters that differ, not how alike they sound, not how close the meanings are, and not roots two letters apart.

Roots of different kinds cost nothing, whatever letters they share: the tail tells them apart. **Learning order isn't a factor.** A checkpoint can always pick other words, so teaching choices shouldn't decide spellings. The [phase 3](#phase-3) lint keeps look-alike roots out of nearby checkpoints instead, for learners who don't know the tails yet.

A candidate whose first consonant isn't the English label's first consonant (mapped as the echo maps it: p/b, t/d, k/g, s/z, f/v merge) also costs a fixed amount, equal to two confusing pairs, so a root gives up its English first consonant only to avoid two or more. The onset is the only part of the root that can echo English, since the tail is fixed, and the first consonant is the strongest cue. Scoring the full echo instead would pull the onset vowels toward English, but distinctiveness needs those letters most.

**Placement order:** CSV order, then an annealing pass, like the one that already separates three-letter roots. The objective is global, so after annealing the order matters only for ties.

### Tie-breaks {#tie-breaks}

The [size](#middle-vowel) preference comes first, as a small cost on a middle vowel that isn't the row's size vowel. Then, when candidates score the same:

1. **English echo:** the whole label, scored by [`echo`](../../../src/echo-metric.ts), so the onset vowels echo when nothing else decides.
2. **Ease of singing:** fewer stops (`b d g`), among candidates whose echo is about equal.

A missing CMU pronunciation no longer blocks a row; it only loses the first-consonant cost and the echo tie-break.

## Lifting the second-consonant ban {#ban-lift}

The tail needs all twelve consonants in second place, so `SECOND_CONSONANT_BAN` goes. Under root tails, an `l` or `m` second means a nature or a mind root (169 rows). An `n` or `r` second means a named or a counting root (351 rows).

### What the ban protects today

A review of every place that reads root letters found two jobs.

**1. Seams in nine-letter dictionary words.** Lexicon editing stated this one before phase 2 ([two seams](../../meta/lexicon.md#two-seams)). A nine-letter stem is 3 + join + 5 or 5 + join + 3. With the ban, a reader finds the join without knowing the lexicon: letter 4 is the join if it's **l / m / n / r**, otherwise letter 6 is. Without the ban, `VCV l VlV CV` splits both ways.

**2. Hook compounds read by shape.** No doc states this one. A [hook compound](../../grammar/hooks.md#hook-compounds) is a citation (root + **-l** / **-m**) plus an extra-noun hook. Every vowel + **l** / **m** is a hook (`al`, `am`, `ol`, `om`, `el`, `em`, `ul`, `um`), and `parseHookCompoundCite` splits by shape alone. So a five-letter root with **l** or **m** second, plus an **-l** or **-m** ending, spells the same letters as a three-letter root + join + two-letter hook:

> `v` + `VCVlV` + `l` = `v` + `VCV` + `l` + `Vl`

Under the ban, no five-letter root has that shape. Without it, every such root would parse two ways whenever it takes **-l** or **-m**. **n** and **r** second are safe, since no hook ends in either.

**Spots checked and safe:**

- **Seven- and eleven-letter stems** (3 + join + 3, 5 + join + 5) split one way at any second consonant.
- **[Numeric derivation](../../grammar/numeric-derivation.md)** writes join + `r` (`lr` / `mr`). No root has two consonants in a row, so no root can supply that sequence.
- **Codas** (`-ln`, `-rl`, `-rm`, `-rth`) and left-hanging **`gl-`** sit outside the root.
- **Longer hooks** (`aol`, `uel`, …): three-letter root + join + three-letter hook spells a vowel sequence, which no root has.

`npm run grammar-check` is the final gate for every doc sentence.

### Listed compounds {#listed-compounds}

The lint exists: `validateCompoundRows` rejects a listed stem with more than one published-root factorization, and `convert-word --lexicon` runs it after placing and refuses to write.

**Change:** treat a clash as a placement constraint. When a candidate root would give a listed stem a second split, skip to the next candidate. Today the run stops instead.

**Learner effect:** in a nine-letter dictionary word, you find the seam by knowing the roots. Dictionary words are already taught as listed words you look up ([lexical compounds](../../grammar/x-compounds.md#lexical-compounds)), and the check guarantees exactly one split. The tail also helps here: a compound ends in its head's tail, so the last two letters before the ending name the compound's kind whichever way it splits.

### Hook compounds {#hook-compounds}

Hook compounds are made on the spot, so a lint over listed stems can't cover them. The check runs over **pairs of published roots**:

- **Parser:** `parseHookCompoundCite` reads a hook compound only when its left piece is a published content root. Today it accepts any root shape. A hook compound is always built on a dictionary root, so this changes no reading of a real word. It ships in [phase 2](#phase-2), together with the grammar line.
- **Placement:** the onset (`VCV`) of a five-letter root with **l** or **m** second is never a published three-letter content root. A new three-letter root is never the onset of such a five-letter root. This removes up to 69 of the 192 onsets in each `l` and `m` cell, which those cells can afford.
- **Lint:** the same check, run by `check-compounds` and `npm test`: over `lexicon-tails.csv` in phase 1, and over `lexicon-published.csv` from phase 2 on.

**Learner effect:** a six-letter citation shaped `VCV l Vl` is either a five-letter root + ending or a three-letter root + hook. Knowing which roots exist tells you which, and the check guarantees only one does. Hook compounds on five-letter roots (`owogalul` *leave*) still read by shape.

### Evidence from the echo-placement simulation

A simulation run on 2026-10-19 lifted the ban under today's English-echo placement (scratch worktree, overlay-group check bypassed, hook rule approximated):

| | Ban kept | Ban lifted | Ban lifted + hook rule |
|---|---|---|---|
| Five-letter roots with l / m / n / r second | 0 | 606 | 546 |
| Listed compound clashes | 0 | 5 | 1 |
| Hook-compound clashes | 0 | 128 | 0 |

The hook rule removes every hook clash with no visible loss of fit. Each listed compound clash was a nine-letter stem that also split 5 + join + 3; the placement constraint would skip those candidates. Root tails change which roots have l / m / n / r second, so these counts need a rerun, but the checks are the same.

## Phases {#phases}

The work comes in three phases. The first two let the whole new lexicon be reviewed and rerun freely before anything learners or docs see changes. The third keeps teaching choices from undoing the distinctiveness that placement no longer weighs by learning order.

### Phase 1: build the new lexicon {#phase-1}

Phase 1 changes nothing that exists: not [`lexicon-published.csv`](../../../data/lexicon-published.csv), the compound or overlay CSVs, the parser, nor any doc outside `docs/proposals/`. The live placement path keeps the ban and the echo ranking, so rows added during phase 1 are placed as they are today.

1. **`data/lexicon-tails.csv`:** a new file with one row per published five-letter row. Its columns are `emoji` and `concrete` (the key, matching the published row), `kind`, `shape` and `root`.
   - `kind` (*creature*, *person*, *mind*, …) and `shape` (*holds*, *one*, *order*, *takes-away*) store the meaning, not the letter, so the letter map lives in one place in code.
   - `shape` is empty for named rows.
   - Three-letter rows aren't listed. They keep their roots in both phases.
2. **First fill:** emoji subgroup as the default kind, overridden by label and the [edge rules](#kinds), then reviewed by hand. The emoji group only seeds the draft; the label decides. Shape is filled per row with the [tie rule](#shapes). An LLM draft with human review is fine, since every value is a short closed choice.
3. **Placer:** `npm run convert-word -- --tails` places every row's root and writes only the `root` column of `lexicon-tails.csv`.
   - The tail comes from `kind` and `shape`. The onset comes from [distinctiveness](#onset), in [placement order](#onset-scoring), with the [tie-breaks](#tie-breaks).
   - The second-consonant ban is off in this path only. `SECOND_CONSONANT_BAN` stays in force for the live path.
   - It applies the [hook-compound check](#hook-compounds) against today's three-letter roots, and the [listed-compound constraint](#listed-compounds) against compound stems spelled with the new roots.
4. **Report:** the same run prints, for the live roots and the new ones:
   - the share of non-flag roots whose first consonant is the English label's;
   - confusing pairs, in total and per kind beside the even-spread floor ([capacity](#capacity));
   - any check it couldn't satisfy;
   - the new 👓 root.
5. **`npm test`:** fails when:
   - a published five-letter row has no row in `lexicon-tails.csv`, or the reverse;
   - a `kind` or `shape` is outside its values;
   - a `root` breaks its tail, the hook check or the compound check.

   So a row added during phase 1 gets its tail when it's added.
6. **Review and rerun:** adjust kinds, shapes and edge rules, then rerun `--tails`. Nothing depends on the file, so a rerun costs nothing.

Phase 1 ends when the report is accepted and the language name is chosen from the new 👓 root.

### Phase 1 run (2026-10-19) {#phase-1-run}

Built: `data/lexicon-tails.csv` (removed in phase 2), [`src/root-tails.ts`](../../../src/root-tails.ts) (letter map, checks, metrics), [`src/root-tails-place.ts`](../../../src/root-tails-place.ts) (placer), `scripts/lib/convert-tails.ts` (`npm run convert-word -- --tails`, replaced in phase 2), and [`src/root-tails.test.ts`](../../../src/root-tails.test.ts). `check-compounds` also runs the tails checks. The run is seeded, so a rerun with the same data gives the same roots. Only confusing pairs (same kind, same first two letters) are scored, the first consonant is scored against the English label's ([onset scoring](#onset-scoring)), and the tie-breaks run full echo first, then stops ([tie-breaks](#tie-breaks)). Live roots are counted with the kind their row has in `lexicon-tails.csv`, so both columns count the same pairs. The report splits confusing pairs into flags (`*-flag` labels), all other pairs, and mixed pairs (one flag and one other same-kind root). Each rate is confusing pairs over the same-kind pairs that could share a prefix; flags and non-flags use their own bases.

**Current report:**

| | Live | Tails |
|---|---|---|
| First consonant is the label's, excluding flags | 96.0% | 91.4% |
| Confusing pairs / same-kind pairs | 3402 (3.9%) | 1448 (1.6%) |
| Flags | 1206 (3.5%) | 609 (1.8%) |
| Excluding flags | 2189 (4.1%) | 837 (1.6%) |
| Mixed flag / other same-kind | 7 (6.9%) | 2 (2.0%) |

| Kind | Rows | Live pairs | Tails pairs | Floor ([capacity](#capacity)) |
|---|---|---|---|---|
| creature `z` | 105 | 238 (4.4%) | 90 (1.6%) | 66 |
| person `y` | 93 | 153 (3.6%) | 60 (1.4%) | 45 |
| mind `m` | 84 | 133 (3.8%) | 52 (1.5%) | 36 |
| body `b` | 114 | 238 (3.7%) | 102 (1.6%) | 84 |
| doing `v` | 113 | 244 (3.9%) | 103 (1.6%) | 82 |
| place `h` | 94 | 187 (4.3%) | 66 (1.5%) | 46 |
| nature `l` | 85 | 112 (3.1%) | 54 (1.5%) | 37 |
| food `d` | 116 | 351 (5.3%) | 101 (1.5%) | 88 |
| tool `w` | 94 | 172 (3.9%) | 68 (1.6%) | 46 |
| sign `g` | 102 | 216 (4.2%) | 79 (1.5%) | 60 |
| counting `r` | 89 | 152 (3.9%) | 64 (1.6%) | 41 |
| named `n` | 262 | 1206 (3.5%) | 609 (1.8%) | 590 |

Every check is met: tails, the hook check, the holder check, and listed compounds. The new 👓 root is `egabo` (*body*, *one*). The house cast gets *swan* `uzazo`, *lion* `olozu` and *hibiscus* `ehalo`, all with different onsets. These spellings are phase 1 output only. Nothing outside `docs/proposals/` and the files above uses them.

**Tuning to review:**

- **Tails cut the confusing pairs by more than half.** The live lexicon has 3402 and the tails lexicon 1448, against a floor of 1221. The 227 pairs above the floor are the price of the first-consonant cost: English first consonants are skewed toward `b`, `g` and `z`, so matching them crowds those prefixes.
- **Flags confuse 1.8% of flag–flag pairs** (609 of 34191; live 3.5%). Non-flags confuse 1.6% of their same-kind pairs (837 of 53941; live 4.1%). The flag base is one crowded kind; the rest are eleven smaller ones. Mixed pairs (one flag and one other same-kind root) are 2 of 101 (2.0%), from *transgender-flag* (*sign*) sharing a prefix with other signs. Flags are rarely core, and a learner looks them up.
- **First-consonant weight, measured.** Each step up trades confusing pairs for matches. With the weight at 0 the run lands 6 pairs above the floor, so the annealer finds close to the best spread. The table is from the first fill, before the marks-vs-where move, the job retune, and the religion-marks move; the [current report](#phase-1-run) is the rerun after those:

  | First-consonant weight (`FIRST_W`) | Matches | Confusing pairs |
  |---|---|---|
  | 0 (tie-break only) | 67.8% | 1316 |
  | 0.5 | 77.5% | 1316 |
  | 1 | 84.1% | 1395 |
  | 2 (current) | 89.8% | 1536 |
  | 3 | 93.5% | 1661 |
  | 4 | 96.4% | 1812 |

  At 0.5 the matches are free: ties between equally spread onsets go to the English first consonant. Above that each point of matches costs more: 79 pairs from 0.5 to 1, then 125 to 150 per point from 1 to 4. At 4 the tails match more first consonants than live does, with about half its confusing pairs.

**Kind and shape calls in the first fill** (the emoji subgroup seeded the draft; the label decided). Calls beyond the [edge rules](#kinds), for review:

- **Jobs were spread under an earlier in-cell rule.** The `o` defaults first overfilled several cells. Scoring counts pairs across a kind's jobs, so the spread no longer affects it. A later pass dropped length-only `e` (long, tall, pointed) in favour of order, path, and rank.
- **Holds (`a`):** herd, flock, school and colony animals (*sheep*, *cow*, *fish*, *penguin*, *ant*, *bee*). Garments that wrap the body, shoes and gloves. Vehicles that carry passengers (*car*, *bus*, *ship*, *airplane*), team sports (*soccer*, *rugby*), drinks and uncountable foods (*rice*, *butter*, *candy*). *Menorah* (a candelabra).
- **Takes away (`u`):** predators and pests (*wolf*, *eagle*, *rat*, *fly*). Cleaning things that remove dirt (*soap*, *broom*, *toothbrush*). Foods that hide a filling (*dumpling*, *burrito*). Sour or burning foods (*vinegar*, *pepper*). Every prohibition sign.
- **Order (`e`):** ranked roles (*judge*, *teach*, *elder*), paths and headings (*road*, *north*), clocks and the zodiac belt, skip marks, the *dharma-wheel* (a path), and doing that runs in sequence (*race*, *train*). Not merely long or tall: those default to `o` (*horse*, *banana*, *tower*, *pen*). Noodles and wrap-garments that used to sit here for length are `a` (a mass or a wrap). *Snake* is `u`. The other religion marks default to `o`.
- **Kinds:** faces are *mind* unless the label names a thing (*mask*, *disguise* → *body*; *ranch* → *place*; *party* → *doing*). Gestures only a person makes are *person* (*wave*, *clap*, *thumbs-up*); bare hands are *body*. A being you address as someone is *person* (*ogre*, *vampire*, *alien*); an animal-shaped monster stays *creature* (*dragon*, *unicorn*). Measuring tools (*ruler*, *scale*, *thermometer*) and instruments are *counting*. Speakers and screens are *tool*. Colors, metals and gems are *nature*. The religion subgroup is *sign*, except *atom* (*nature*) and *worship* (*person*). *Peace* was already *sign*. Buildings of worship stay *place*. Zodiac signs are *counting* (a dated belt), not *sign*. The flag subgroup's non-country flags are *sign*, *doing* or *person* by label. Facility pictographs and compass headings that name a *where* (*traffic-light*, *north*, *accessible*) are *place*, same as *bus-stop* and *restroom*; a prohibition icon (*no-smoking*) stays *sign*. Scored games and races (*golf*, *baseball*, *dice*, *horse-race*) sit with *doing*, not *counting*.

### Phase 2: replace and retie {#phase-2}

1. **Refresh:** rerun `--tails`, so the file covers every current row.
2. **Move the data:**
   - Copy `kind` and `shape` into `lexicon-published.csv` as two new columns, and replace each `root` with its `lexicon-tails.csv` root.
   - Rewrite the overlay and compound rows that spell an old root, and write `tmp/lexicon-retie-map.json`, as `convert-word --lexicon` does today.
   - Delete `lexicon-tails.csv`.
3. **Switch the placer:**
   - `convert-word --lexicon` uses the tails placer. Drop `SECOND_CONSONANT_BAN`, and keep the echo only as the first-consonant cost and a tie-break.
   - `--only` places one row's onset against the rest. `--all` re-places every five-letter row and keeps the three-letter roots.
   - `npm run convert-word -- <english>` without `--lexicon` needs `--kind` and `--shape`, since a word alone no longer fixes the tail.
   - A missing CMU pronunciation no longer blocks a row.
   - From here on, changing a row's kind or shape is a respelling and goes through `retie-docs`.
   - The hook-compound and listed-compound lints run over `lexicon-published.csv`.
4. **Parser and grammar, in one change:** `parseHookCompoundCite` reads a hook compound only when its left piece is a published root. [hooks.md § hook compounds](../../grammar/hooks.md#hook-compounds) gains one sentence saying the left piece is a dictionary root.
5. **Retie:** run the [respelling procedure](../../meta/lexicon.md#respelling-a-row): `retie-docs` dry run, then `--write`, then `npm run build` and `npm test`. Read the review list and warnings.
6. **Regenerate:** run `npm run grammar-check`, `npm run english-helper-wordnet` and `npm run cheat-sheet-blocks -- --write`.
7. **Docs:**
   - [Lexicon editing](../../meta/lexicon.md): replace [root spellings](../../meta/lexicon.md#root-spellings-come-from-convert-word) (the echo bullet) and [second consonant](../../meta/lexicon.md#second-consonant) with the tail, the onset scoring and the two checks. Add the `kind` and `shape` columns and the edge rules.
   - [phonology.md](../../grammar/phonology.md#advanced) Advanced: a new section on root tails. It covers the twelve kinds with their anchors, the four jobs with the tie rule, and the free final vowel of named rows. It's taught as a memory aid, not a rule of grammar, and every dictionary view of a root links to it.
   - [language-name.md](../../meta/language-name.md) and every use of the name: the name chosen at the end of phase 1.
8. **Measure:** rerun the report. It should match the accepted phase 1 report.
9. **Follow-ups:** rerun the coverage tables in `number-mnemonic.md`. `number-respelling.md` re-picks its fillers.

Nearly every five-letter row changes spelling in phase 2. That is effort, not a learner cost.

### Phase 2 as built (2026-10-20) {#phase-2-as-built}

- **Data:** `lexicon-published.csv` gained `kind` and `shape` after `root`. `convert-word --lexicon --all` with the tails placer reproduced every accepted phase 1 root (0 of 1351 differ); the three-letter roots were kept. 1345 roots changed spelling.
- **Placer:** `placePublishedRoots` keeps a row's root length (a new row is three letters only when overlay-backed) and places five-letter rows with `placeTailRoots`. `--only` holds every other root fixed (a `fixed` row in the placer); `--all` keeps the three-letter roots, which also sidesteps the [`--all` failure](#prerequisite). Join-overlay sense forms are blocked. A missing CMU pronunciation no longer blocks a row.
- **CLI:** `--tails` became `--report` (current metrics only, no live column). `convert-word -- <english>` prints a three-letter echo root, or with `--kind` / `--shape` the five-letter root that word would take. `SECOND_CONSONANT_BAN` and the echo-ranked five-letter candidates are gone.
- **Checks:** `validateRootTails` runs over the published lexicon in `npm test` and `check-compounds`; listed compounds stay with `validateCompoundRows`.
- **Parser:** the classifier already read a hook compound only on a published left root. `readHookCompound` now holds that rule, and the word-bank lint uses it too. [hooks.md](../../grammar/hooks.md#hook-compounds) gained the sentence. `grammar-check` passed with one tree per doc sentence.
- **Retie:** 0 blocking, 1 warning, 7 review items; 17 test failures of the kinds in [retie § tests](../../meta/retie.md#tests). IPA lines, syllable hints and words in multi-sentence cites were fixed by hand, and the retie now does all three ([retie § docs](../../meta/retie.md#docs)).
- **Docs:** [lexicon editing](../../meta/lexicon.md#root-tails) holds the edge rules, onset scoring and the two seams; [phonology.md § root tails](../../grammar/phonology.md#root-tails) teaches the letter map as a memory aid, and the [lexicon search](../../grammar/lexicon.md) links each root's tail there. The language is **Egabon** everywhere, with redirects for the renamed pages.
- **Report** (`npm run convert-word -- --report`): identical to the [phase 1 run](#phase-1-run).
- **Follow-ups:** `number-mnemonic.md` coverage is rerun on the live lexicon. `number-respelling.md`'s filler re-pick is logged in `TODO.md`.

### Phase 3: look-alike lint for checkpoints {#phase-3}

Placement doesn't weigh learning order, and cross-kind pairs cost it nothing. A learner who meets core words before the tails are taught sees two roots one letter apart as look-alikes, whatever their kinds. So the vocabulary choice in each checkpoint, not the spelling, keeps them apart.

1. **Lint:** two roots one letter apart, of any kind, can't both be new words in the same checkpoint or within N checkpoints of each other. It runs in the docs lint beside the core-count check (`lintCoreCounts`), over the live roots and the `core` column, so `npm run build` fails on it.
2. **Fix:** pick another word for the checkpoint, or move one root's introduction (its `core` cell).
3. **Policy:** N is a teaching choice, set in [translation exercises § core vocabulary](../../meta/translation-exercises.md#core-vocabulary).
4. **When:** after phase 2, once the new roots are live. The `--tails` report could preview the conflicts against today's banks, to size the rework.

With this lint, when the tails are taught doesn't affect placement.

### Phase 3 as built (2026-10-20) {#phase-3-as-built}

- **Lint:** `lintLookAlikes` in [`src/core-vocabulary.ts`](../../../src/core-vocabulary.ts) runs in `lint:egabon` beside `lintCoreCounts`. A look-alike pair is two roots of the same odd length whose only difference is the center letter, a vowel in both. It reads only the `core` cells, so review use is free.
- **N:** `LOOK_ALIKE_GAP` is 3: two look-alikes introduced in one band are at least 3 of that band's checkpoints apart; different bands are not compared ([translation exercises § look-alikes](../../meta/translation-exercises.md#look-alikes)). Against the banks after phase 2 the count was 2 conflicts at a gap of 1, 8 at 3, 13 at 5 and 27 at 8.
- **Helper:** `npm run core-vocabulary -- --look-alikes` lists each pair with its fix options: where each root is used, the first later checkpoint that could introduce it instead (with new count and clashes), and clash-free substitutes of the same kind.
- **Fixes (13 pairs):**
  - *pencil* became *eraser* in the first four beginner checkpoints, and *pencil* is now introduced at hooks intermediate;
  - *sneak* became *peek* through the beginner level, and *sneak* is now introduced at dependents intermediate;
  - *pour* became *drink* at pronouns and plurality, and *pour* is now introduced at hooks beginner;
  - hooks beginner and the beginner review swapped *salad* for *cookie*, and *salad* is now introduced at x-compounds intermediate;
  - *pie* became *cake* at numbers, and *pie* is now introduced at comparatives intermediate;
  - spans beginner swapped *sing* for *dance*, and the song *Onoron* for *Ugoron* (from *guitar*); *sing* is now introduced at causation, and *Onoron* at spans intermediate;
  - *window* left the core list (causation now uses *rain*, the intermediate review *fog*);
  - *tuxedo* became *dress*, *ship* became *island* at roles intermediate (*ship* is now introduced at hooks advanced), *medal* became *trophy*, and *hat* became *dress*.
  - *window*, *tuxedo*, *medal* and *hat* no longer have a `core` cell.

### The `--all` failure on main {#prerequisite}

On main today, `convert-word --lexicon --all` stops with `short roots too close within an overlay group: elo ~ ala`, because the annealer can't separate two three-letter roots in one overlay group. Neither phase re-places three-letter roots, so this failure isn't on this proposal's path. It still needs a fix of its own.

## Interactions with other proposals {#interactions}

- **`number-mnemonic.md`:** a peg's second digit is now its root's **kind**. Under the respelled digits, every animal peg ends in 5 (`z`), every food peg in 2 (`d`), every flag peg in 9 (`n`), and so on. Every column of the 00–99 table fills from one kind. The mnemonic still never steers a spelling. Its coverage tables come from the echo-placement simulation and need a rerun.
- **`number-respelling.md`:** its filler letters were picked by how rare each letter was as a root consonant under English-echo placement. Root tails set those frequencies by kind, so that proposal re-picks its fillers to fit the kind sizes settled here. This proposal doesn't adjust to it.
- **`tail-suffix.md`:** listed compounds whose head is only the tail (`CV`). Depends on this letter map, on banning 3 + join + 3 compounds, and on banning `l` / `m` / `n` / `r` as suffix heads. Nature, mind, named, and counting stay on those letters. Not started here.

## Costs

1. **Kinds and jobs are judgment calls at the edges.** Is a basket a tool or a container? Is a lamp a tool or a fixture? The edge rules and the tie rule settle most cases; the columns record the call so it's made once.
2. **Same-kind neighbors share a tail.** *Cat* and *dog* end the same and differ only in the onset. The [onset scoring](#onset-scoring) keeps same-kind roots from sharing their first two letters where it can. Past 48 rows a kind must have some such pairs: 1221 at the floor, and 1448 in the [phase 1 run](#phase-1-run), against 3402 in the live lexicon.
3. **The same letter has two jobs by position.** At the start of a word `z` marks the subject; in a tail it means creature. The parser isn't affected, since positions differ, and the role letters are already the anchors. Teach the tails as a memory aid, never as a rule of grammar.
4. **Named rows are crowded.** 262 rows share one kind, so some flags will be one letter apart. Flags are rarely core, and a learner looks them up.
5. **Two seams read by knowing the roots.** Nine-letter dictionary words and six-letter hook compounds on three-letter roots no longer read by letter position. The lints keep each to one reading.

## Alternatives considered

| Alternative | Why not |
|-------------|---------|
| **Keep English echo as the main criterion** | It helps English speakers produce a half-remembered word, and little else; it gives nothing to other learners and leaves the vowels arbitrary ([motivation](#motivation)). Kept as a first-consonant cost, which carries most of its recall value, and a tie-break. |
| **Cross-language sound symbolism** (round ↔ `m l o`, small ↔ `e u`, body parts naming themselves: lips `m`, nose `n`, tongue `l`) | Egabon's letters cover it poorly: voicing is free, there's no /i/, and `r` isn't trilled. It applies strongly to only about a quarter of rows, and it rests on outside intuitions, not on anything the learner learns in Egabon. The tail's job vowels and their [outline fallback](#vowel-fallback) already capture its main contrasts (round `o`, hollow `a`, long `e`, sharp `u`), learned inside Egabon. |
| **Per-kind subcategory vowels** (`a` = mammal on creatures, room on places, …) | A suffix needs the vowel to compose with any kind. Forty-eight cell meanings drop the vowel series and recreate a Wilkins taxonomy inside each kind (`tail-suffix.md`). |
| **Sound symbolism on the onset** | The onset is where distinctiveness lives. Symbolism on the first two letters would pull related meanings toward the same prefixes, where confusion costs most. The middle vowel is outside the scored prefix, so it carries [size](#middle-vowel) instead. |
| **Shape symbolism on the middle vowel** (bouba / kiki) | Repeats the final vowel's outline fallback, and contradicts it in the same word: symbolism reads `u` as round, the tail reads it as sharp. |
| **Size on tagged rows only** (others free) | Untagged rows take `a` and `e` by echo, so a middle `a` means nothing to a reader: the hint works for recall only. Requiring a size in the sized kinds makes it read both ways. |
| **Middle `u` = unknown or varying size** | Size is remembered by the typical member; *varies* has no line two taggers would draw alike. *No size of its own* is crisp and splits stuff from containers. |
| **`o` as the default job** (anything with no job is `o`) | `o` was 43–55% of most kinds, so the vowel told a learner little and `e` was nearly empty for creatures, feelings, food and nature. The [fallback](#vowel-fallback) gives every row a positive answer instead. |
| **A different default vowel per kind** | Learners know the kind from the consonant, so balance within a kind is what matters, and a per-kind default leaves it unchanged. |
| **A three-letter tail** (middle vowel too) | Leaves 48 onsets per cell, so most roots' nearest neighbor shares their kind and shape ([root shape](#root-shape)). |
| **Kind at the start of the root** (the order of Wilkins-style philosophical languages) | Related words would share their most salient letters, and a slip would land on a sister meaning. |
| **Perceptual features in the consonant** (size, hardness) instead of kind | Features are graded and often both apply (a coconut is round *and* hard). Kind is closer to a fact about the thing, so a learner can predict it. |
| **Keep the second-consonant ban** | The tail needs twelve consonants second; with the ban, four kinds would have no letter. |
| **Lift for n and r only** | No hook clash at all, but `l` and `m` (nature, mind) would still have no tail letter. |

## Non-criteria

The number of respellings and the retie effort aren't reasons to reject this. The learner-facing tests:

- every word has one parse (`grammar-check`);
- every listed compound and every possible hook compound has one split;
- a learner who knows a thing's kind and job can predict its tail;
- roots one letter apart aren't taught close together (the [phase 3](#phase-3) lint).

The language name changing with its root isn't a reason to pin 👓.
