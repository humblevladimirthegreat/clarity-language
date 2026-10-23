# Lexicon editing

Editors only. How root spellings are made and changed in the lexicon CSVs. What each CSV owns is in the `AGENTS.md` routing table; overlay kinds are in [parser pipeline](parser-pipeline.md#overlay-kinds).

## Root spellings come from `convert-word`

Never make up a root spelling by hand, whether for a new row, a respelling, or a shorter root for a row that gains an overlay. Generate it with:

```
npm run convert-word -- --lexicon --only LITERAL
```

`--only` takes a concrete literal, emoji, or root (repeatable or comma-separated) and limits the run to those published rows; every other row keeps its root. `--lexicon` alone is refused; `--lexicon --all` re-places the whole lexicon.

`--all` re-places every five-letter row and keeps the three-letter roots.

A hand-picked spelling bypasses the checks that placement runs. Placement:

- keeps a row's root length, and gives a new row three letters only when it is overlay-backed ([root length](#root-length))
- builds a root's last two letters from the row's `kind` and `shape` ([root tails](#root-tails)); a five-letter root's first three letters keep same-kind roots apart ([onset](#onset)), and a three-letter root's first vowel is chosen so overlay-group members never share their first two letters ([root length](#root-length))
- skips roots already held by other rows and stems used in [`lexicon-compounds.csv`](../../data/lexicon-compounds.csv), and any root that would give a listed or hook compound a second split ([seams](#seams)). A new three-letter root also clears the holder check against the five-letter roots that stay put; five-letter rows placed in the same run are checked against the new three-letter spellings.
- never spells a root with an English word the doc lint reads as English in code (*are*), since the retie refuses one
- rewrites the overlay and compound rows that spell the old root, and writes `tmp/lexicon-retie-map.json` for `retie-docs`
- prints the root-tails report (`npm run convert-word -- --report` prints it alone)

`npm run convert-word -- <english>` (no `--lexicon`) only prints a candidate: a three-letter root by English echo, or with `--kind` and `--shape` the five-letter root that word would take beside the lexicon. Use it to explore, not as a source for a hand edit.

## Seeds: concrete senses and pictographs

Every published row needs a **concrete** sense: a thing you can picture, from which the abstract sense is reached. The `emoji` column holds the row's **seed** pictograph, which is optional. A row may have none, but overlays name their host row by its seed, and [`src/closed-roots.ts`](../../src/closed-roots.ts) names rows by seed too. So a row without a seed cannot host an overlay or be a closed root until that tooling keys rows another way.

Prefer an emoji seed, and prefer emoji-seeded roots as the head and left root of a compound. When a needed concrete sense has no free seed and no existing row can take it as an alias without strain, add a row with a non-emoji pictograph seed or, failing that, no seed (*oven*, *vinegar*, *whistle*). Seedless rows go at the end of the CSV, after the non-emoji seeds, and tooling names them by their concrete label.

### What can be a seed

1. **An RGI emoji.** This is the default.
2. **A non-emoji Unicode pictograph** that pictures the concrete sense and renders in a plain CSV without installing a font. The sets in use are Musical Symbols (`U+1D100`), Linear B Ideograms (`U+10080`) and Alchemical Symbols (`U+1F700`, only the signs shaped like an object: crucible, scepter, caduceus). Egyptian Hieroglyphs also render and may be added, sign by sign, using a sign list for the meaning, since Unicode names them only by code (`R001`).

Never a seed:

- **Phaistos Disc signs.** They show as tofu without an installed font, and the script is undeciphered, so the sign names are guesses.
- **CJK characters.** Most learners can't read them as pictures, and they suggest a link to Chinese or Japanese.
- **Abstract marks.** This covers alchemical metal and substance signs, geometric shapes, arrows, math operators, and ♯ ♭ ♮ (which read as `#` and `b`).
- **Pictographs with words in them.** This covers 🆕, 🆒, 🔙, 🆗, keycaps and the Japanese buttons, since a seed carries no English or other text.

### Which emoji to skip

- **Gendered person and profession variants** (man-X, woman-X). Use the neutral person form.
- **Visual variants of an existing seed:** an animal's face next to its body (🐴 next to 🐎), near-identical faces (🤣 next to 😂), the globe regions, colored hearts, books and squares, clock times, skin tones, and left- or right-facing versions.
- One seed per row, one row per seed.
- **No good emoji:** flag the sense for human review rather than seeding it loosely.

### Labels and senses

- **Concrete label:** the English word people use for the thing, not the Unicode name (*cupid*, not *heart with arrow*; *villain*, not *angry face with horns*). Flag rows follow [flag rows](#flag-rows). `convert-word` needs a CMU pronunciation for the label. Add a missing one to `CMU_OVERRIDES` in [`src/cmu-dict.ts`](../../src/cmu-dict.ts) rather than bending the label.
- **Multiword labels and glosses:** join the words with hyphens, never spaces: *gas-pump*, *black-pepper*, *wedding-dress*. This holds for concrete labels, compound glosses and aliases alike.
- **Units:** a unit (*mile*, *foot*, *pound*), imperial ones included, is an abstract sense on an existing root (*mile* on `unoba`), not a new row.
- **Kin pairs:** a gendered kin pair (*mother* / *father*) is allowed, unlike gendered profession variants.
- **Abstract senses:** never repeat another row's concrete or abstract. When a new row takes over a sense, move it off the old row.
- **Aliases may repeat:** an `english_aliases` cue may also be another row's alias or sense. A cue that fits several roots lists all of them, so lexicon search finds each one. Within a row, an alias still never repeats that row's own concrete or abstract.

### No English puns

A link from seed to abstract sense, from a compound's left root to its meaning, or in a mnemonic must not depend on how an English word sounds or is spelled: no *thyme* from *time*, no *sage* from *wisdom*. Learners who don't speak English get nothing from the pun. Use a link through the thing itself, such as its use, look, or what it goes with (*dill* from *pickle*). A fixed English idiom whose image works in other languages is fine (*a grain of salt*).

### Row order

Rows follow Unicode emoji order (the `emoji-test.txt` / CLDR order), with 👓 pinned first. Non-emoji seeds come after the flags, in code point order. Add a new row at its place, not at the bottom.

## Flag rows

A row whose emoji is a country or territory flag labels its concrete sense `<place>-flag` (`japan-flag`): **-l** is the flag, **-n** names the place, and the abstract is the demonym ([countries and traditions](../grammar/proper-names.md#countries-traditions)). Placement ignores the `-flag` suffix when it looks up the pronunciation, so a root is spelled from the place name. Use `stripFlagSuffix` from [`src/flag-label.ts`](../../src/flag-label.ts) rather than matching the suffix by hand.

Tradition and religion rows follow the same split (**-n** the tradition, **-m** an adherent or quality, **-l** the symbol), so each needs an abstract column that names the adherent.

## Placeholder spellings

When a root's spelling is not yet known (a proposal, a draft page, a planned overlay), write the row's **emoji** where the spelling would go, with any affixes around it (`gl🔤l`). Never invent a provisional spelling, even a plausible one: it would look real and could be copied. The emoji is replaced by the generated root when `convert-word` places the row, and the retie procedure below covers any page that already holds it.

## Root length

- **Three letters:** rows backed by an overlay, plus the marked pronouns. These are annealed so short roots stay apart from each other. Inside one overlay group (one overlay kind on one PoS), no two share their first two letters. Roots of different kinds already differ in the second letter; roots of the same kind must differ in the first vowel. Each kind + shape holds at most four three-letter roots (`a e o u` first).
- **Five letters:** every other row, spelled by its [root tail](#root-tails).

A sense being common in English (a high word-frequency rank) does not earn a three-letter root.

A placed row keeps its length. So a row that gains its first overlay keeps its five-letter root, and one that loses its last overlay keeps its short root, until an editor decides to change it: clear the row's root (and fill or clear `kind` and `shape`), then run `convert-word --only` on it.

## Root tails {#root-tails}

A root ends in a **tail**: its last consonant names the **kind** of thing its concrete sense is, and its final vowel the thing's **job**. A five-letter root is `V C V | C V`; a three-letter root is `V | C V`. The learner-facing letter map, with each letter's anchor in the grammar, is in [compounds.md § root tails](../grammar/root-tails.md#root-tails).

The `kind` and `shape` columns of [`lexicon-published.csv`](../../data/lexicon-published.csv) record the call for each three- or five-letter row, as a word (`creature`, `takes-away`), never as a letter; the letter map lives once in [`src/root-tails.ts`](../../src/root-tails.ts). `shape` is empty on a `named` row, whose final vowel is free. The `size` column steers a five-letter row's middle vowel ([size](#size)) and stays empty on a three-letter row. `npm test` fails on a row with no kind or shape, a missing or misplaced size, or a root that doesn't end in its tail. **Changing a row's kind, shape or size is a respelling:** rerun `convert-word --lexicon --only` on it, then the retie.

### Kind {#kind}

The kind follows the row's **concrete** sense, as its label names it. The abstract sense takes the tail of its seed: *compassion* is a body root because it is reached through *heart*. Edge rules:

- **People vs doing:** an action only a person could do (teach, judge, cook, pray) is `person`. An action any creature could do (run, climb, fall) is `doing`.
- **People vs creatures:** a being you address as someone (ogre, vampire, alien) is `person`. An animal or animal-shaped monster (dragon, unicorn) is `creature`.
- **On the body:** what is worn, carried or put on the body (ring, bag, lipstick, soap, bandage, pill) is `body`, not `tool`. Parts of creatures (wing, horn, paw prints) are `body` too.
- **Play vs title:** toys, game pieces, sport gear and vehicles (ball, dice, kite, skis, bicycle) are `doing`. A named sport or scored game (soccer, golf, boxing, horse-race) is `title`.
- **Kitchen:** dishware and cooking gear (plate, spoon, pan, teapot) are `food`.
- **Fixtures vs tools:** a thing built into a place (door, window, bed, toilet) is `place`. A thing you pick up and use (broom, key) is `tool`. Speakers and screens are `tool`; measuring tools and instruments are `counting`.
- **Marks vs where:** a thing whose job is a mark on a surface (a writing-system sign, a symbol, a UI button, a prohibition icon, a religion mark) is `sign`. A thing that occupies or names a location (street furniture, a facility pictograph, a compass heading) is `place`. Buildings of worship stay `place`; worship and pray are `person`.
- **Paper vs marks vs tools:** a thing that carries wording (book, envelope, label, ticket, newspaper) is `title`. A mark on a surface is `sign`. A thing that makes marks (pen, brush) is `tool`.
- **Faces** are `mind` unless the label names a thing (*mask* is `body`). Gestures only a person makes (wave, clap) are `person`; bare hands are `body`.
- **Colors, metals and gems** are `nature`. **Numbers, charts, clocks, times of day and the zodiac** are `counting`; sun, moon and stars are `nature`. Country and territory flags are `named`; other flags take the kind their label names.
- **Compounds** need no kind: a stem ends in its head root, so it keeps the head's tail.

### Shape {#shape}

The shape is the thing's job, from the vowel series: `holds` (**a**: containers, groups, masses, open spaces, what comes many at once, what stores, what you go inside), `one` (**o**: one whole, compact thing), `order` (**e**: ranked, sequenced, a stage or cycle, a path you travel or are led along, a heading), `takes-away` (**u**: cuts, removes, hides, ends, forbids, harms, stings, sickens, wards off). **Tie rule:** test `takes-away`, then `holds`, then `order`, and take the first that fits. Read `holds` literally (a building holds people, a hat holds the head, a bun holds its filling) and `order` broadly (ranked sets, life stages, cycles, what carries or leads you along a way).

When no job fits, `one` is **not** the default. Use the fallback: for a thing you can see, its outline (hollow or open `holds`, long `order`, sharp or spiky `takes-away`, round or compact `one`); for a feeling or face, its direction (toward others `holds`, toward a standing or what comes next `order`, against `takes-away`, inward `one`); for an action, how it unfolds (with others `holds`, along a course `order`, stops or hurts `takes-away`, once on the spot `one`). Symbols of a faith or a gender stay `one`.

### Size {#size}

The size is how big the concrete sense is against a person, and it steers the root's **middle vowel**: `big` (**a**: about your size or bigger), `medium` (**o**: between your hand and you), `small` (**e**: no bigger than your hand), `none` (**u**: nothing you could measure: a substance, liquid, color, weather or direction; an act or gesture; a symbol, which works at any size; a time, number or notation). Judge the typical member (a dog is `medium`, an adult `big`); when unsure between two sizes, take `medium`. Religious symbols are all `none`.

Every five-letter row needs a size except in `mind`, where every row would be `none`; `mind`, `named` and three-letter rows stay empty, and a `mind` row's middle vowel goes to the echo. A three-letter root has no middle vowel, so size does not apply. In the mixed kinds, things get a measured size and the rest `none`: in `doing` a vehicle or toy versus an action, in `person` a being versus an act, in `sign` an object versus a symbol, in `title` a paper or mail object versus a sport or a legal-name mark, in `counting` a clock or instrument versus a time or number.

It's a placement preference, not a check: the placer gives up the size vowel only in a crowded cell, and the tails report (`convert-word --report`) prints the share that match.

### Onset {#onset}

The first two letters keep roots apart, and the middle vowel follows the [size](#size). A **confusing pair** is two roots of the same kind whose first two letters match; placement adds 1 for each. Roots of different kinds cost nothing, since the tail tells them apart, and learning order plays no part. A first consonant that is not the English label's first consonant (p/b, t/d, k/g, s/z, f/v merged) costs 2, so a root gives it up only to avoid two or more confusing pairs. A middle vowel that isn't the size's costs 0.01. Ties go to the closer full English echo, then to fewer stops (`b d g`). A label CMU doesn't know only loses the English cost and the tie-breaks.

Rows are placed greedily in CSV order, then annealed; the run is seeded, so the same data gives the same roots. Each kind has 48 first-two-letter prefixes, so past 48 rows some confusing pairs are unavoidable; the report prints each kind beside that floor.

### Seams {#seams}

A five-letter root may have any consonant second, so two seams read by knowing the roots rather than by letter position. Placement keeps each to one reading, and `npm test` and `check-compounds` check both:

- **Nine-letter dictionary words.** A stem is 3 + join + 5 or 5 + join + 3, and with **l / m / n / r** second both can fit. `validateCompoundRows` rejects a listed stem with two published-root splits, and placement skips a root that would make one.
- **Holder hosts.** A five-letter root whose first four letters are a `/th/` holder host form (`anar`) would read on `/th/` as that host + grade + a holder. Placement never gives a root such an onset.

Hook compounds are not a seam: only a five-letter root fuses with a hook (D-50), so a five-letter root with **l** or **m** second, plus **-l** or **-m**, never reads as a three-letter root + ending + hook, and its onset may be any three-letter root.

## Respelling a row

After `convert-word`, run the retie procedure in `AGENTS.md` (`retie-docs` dry run, then `--write`, then build and test). A retie changes the spelling of the same sense everywhere, and code never spells a root as a string literal; use [`src/closed-roots.ts`](../../src/closed-roots.ts). What the retie still leaves to a person (the language name, skipped pages, tests it cannot follow): [retie known issues](retie.md).

## Moving an overlay to another row

Moving a sense (an overlay) from one published row to another is a **replacement**, not a retie. `retie-docs` follows a row's own respelling, so it never moves forms from the old row's root to the new one.

1. In [`lexicon-overlays.csv`](../../data/lexicon-overlays.csv), change each moved row's `emoji` to the target row and its `sense_form` to spell the target row's **current** root. Update `gloss`, `definition` and `mnemonic` to match.
2. Run `npm run convert-word -- --lexicon --only <target>`. If the target now needs a three-letter root, this respells it and rewrites the overlay `sense_form`s to match.
3. Run `retie-docs` for the target's respelling, as for any respelling.
4. By hand, replace every doc use of the **old** root in the moved sense with the new root, and fix the morph glosses and English wording. Leave uses of the old row's ordinary sense alone. Check with `node scripts/find.mjs` or grep for the old sense forms.
5. `npm run build` and `npm test`.

## Dictionary compounds

A row in [`lexicon-compounds.csv`](../../data/lexicon-compounds.csv) is one stem: **left root + boundary letter + head root** ([lexical compounds](../grammar/compounds.md#lexical-compounds)). The `join` column is the boundary letter, and it picks the sense of the **left** root only: **-l** when its concrete sense narrows the head (*door* **-l** *bell* = *doorbell*), **-m** when its abstract sense does (*formality* **-m** *shoe* = *dress shoe*), **-n** / **-r** for a name or a resume. The whole-word ending added at use picks the sense of the entry: **-l** reads the row's `concrete`, **-m** its `abstract`. Fill `abstract` only when the head's abstract sense really carries over (*bedroom* **-m** = *sanctum*), never because the left root has one.

A **tail-suffix** row has an empty `join` and a two-letter `right`: a five-letter left root + a kind consonant + a job vowel ([tail suffixes](../grammar/root-tails.md#tail-suffixes)). The consonant is one of `z y b v h d w g n`, never `l` / `m` (a five-letter root + `lV` / `mV` + **-l** / **-m** spells a hook compound) or `r` (counting wants a specific head). The vowel follows the same job rules and tie order as a root's [shape](#shape). Use a suffix when the head **is** the kind (*friend* = *hug* + person `yo`); when the head is a more specific kind than its tail, list two full roots (*doorbell* ends in *bell*).

**No 3 + join + 3.** That seven-letter stem is also the shape of five letters + a suffix, so two three-letter roots never make a listed compound. Use a five-letter member on either side, or a suffix on a five-letter left. A three-letter root never takes a suffix: `VCV` + `CV` is a five-letter root.

### When a compound earns a row

Add a row only when all of these hold:

1. **It is one thing**, not a list or a thing plus a property (*a blue dog* is two words).
2. **It is a fixed kind** that English or most languages name with one word or a fixed phrase. Pairings made on the spot stay live `x` compounds.
3. **No root already has the sense** as `concrete`, `abstract` or alias. Many specific kinds are seeds already (*garlic*, *owl*).
4. **The head is the most specific root that fits**, and the entry is a *kind of* the head's concrete.
5. **The left root narrows the head in a way a learner can guess**, or the mnemonic makes the link easy to remember, never through an English pun ([no English puns](#no-english-puns)).

Some English words stay out by design: kin terms are [kin generations](../grammar/numbers-applied.md#kin-generations), doers are [role compounds](../grammar/roles.md#role-compounds), and a tie between people is a [social relation](../grammar/of-relations.md#social-relations) unless English has a fixed noun for the person (*friend*). Young and sexed animals are the animal's root plus a `/ɡ/` adjective: `gahoyel` *young*, `geboyel` *newborn*, `gevugol` *female*, `gemugol` *male* ([young, male and female animals](../grammar/say-people-places.md#young-animals)). There are two exceptions. A seed that already pictures one stays a root (🐤 *chick*, 🐓 *rooster*). A young animal that looks like a different creature gets its own row (*caterpillar*, *tadpole*), because a learner can't picture it from *young* plus the adult animal. Why not compounds: [design decisions](design-decisions.md#young-and-sexed-animals).

### Compound heads

A compound takes the most specific head root that fits: *sparrow* is built on 🐦 *bird*, not 𓄛 *animal*; *basil* on 🌿 *herb*. A generic head (𓄛 *animal*, 🫙 *jar*, 🧺 *basket*) heads a compound only when no narrower root covers the whole class (*pet*, *livestock*). A head's `concrete` label should name the whole category (🍈 *fruit*, 🥫 *metal*, 🥢 *stick*, 🧪 *tube*), so learners read the stem as a kind of it.

A compound cannot head another compound. *Cup*, *roof*, *fence*, *river* and the other compounds stay leaves; a kind of cup goes on 🥣 *bowl* directly or stays a live `x` compound.

When a needed head is missing, add it before writing its compounds, since moving compounds onto a new head later respells their stems. Prefer **retitling** a row whose emoji already pictures the generic sense and which has little to lose (🫐 *blueberry* → *berry*, 🥢 *chopsticks* → *stick*); the old specific sense becomes a compound. A retitle keeps the row's spelling. Otherwise add a seed ([what can be a seed](#what-can-be-a-seed)) and place it with `convert-word`.

### Adding compounds

`npm run compound-fill` drafts compounds one head at a time, naming roots by seed or English label, never by spelling:

1. `heads` lists heads by compound count; `heads 🐦 🐟` shows each head's row and compounds.
2. `synsets <word>` lists WordNet noun senses; `candidates <synset> [--depth N --max-rank N]` lists hyponyms by frequency and hides covered senses.
3. `check <word>…` reports exact hits on a root, alias, compound or overlay gloss. For near matches use `find-english --kind root` and `lexicon-search`.
4. Write a draft CSV with the header `english,left,join,head,abstract,mnemonic`. The mnemonic opens *"<left> specifying <head> is …"*. `draft <file>` prints each stem, the validator's errors and extra warnings.
5. `draft <file> --write` appends the rows, only when no row has an error. `compound-fill` drafts two-root rows only; write a tail-suffix row by hand. Then run `npm run check-compounds`, `npm test`, and `npm run cheat-sheet-blocks -- --write`.

`check-compounds` rejects a stem that is not left + boundary + head, a bad boundary letter, a 3 + join + 3 stem (which would read as five letters + a suffix), a tail suffix that is not a legal kind + job or sits on a three-letter left, an unpublished or non-content root, a stem that is already a root or splits into published roots more than one way, the same root on both sides, a gloss that is already a published or compound sense, and a missing gloss or mnemonic. It does not catch an ending-plus-stem form that also reads as an overlay plus a root; the morph-gloss lint in `npm test` does. If a stem splits two ways, pick a different left root; never respell a root to make the split unique.

## Core vocabulary column

The `core` column in [`lexicon-published.csv`](../../data/lexicon-published.csv) and [`lexicon-compounds.csv`](../../data/lexicon-compounds.csv) names the stage checkpoint that introduces a core learner root, as `page.md#id` of its checkpoint heading: `### Practice` (`clause.md#beginner-practice`), or a legacy `### Translation practice` (`clause.md#beginner-translation-practice`). Replacing a legacy checkpoint retargets its cells by hand; `retie-docs` does not see a hand-renamed heading. An empty cell means the root is not core. The order of the core list is the path order of those checkpoints. House names, the `SELF` root, discourse-role specials, topic and generic pronouns, the nine [sake](../grammar/sakes.md#sake-inventory) roots, and closed overlay words are never core.

- `npm run core-vocabulary` prints, for each checkpoint, the roots it introduces and how many bank roots are review, and flags checkpoints over the cap of 5 new roots.
- `npm run core-vocabulary -- --for <page>.md:<band>` (or `--for page.md#id`) lists, for one checkpoint, the roots whose cell names it, the next later core roots, and the earlier core roots ranked by checkpoints since a bank last used them (`--limit` sets how many).
- `npm run core-vocabulary -- --look-alikes` lists core roots that differ only in the middle vowel and are introduced too close together, with fix options ([look-alikes](translation-exercises.md#look-alikes)).
- `npm run core-vocabulary -- --write` seeded the column once from the stage banks: each root got the first checkpoint whose **Roots used here** table uses it. After that the column is edited by hand, and `--write` refuses to overwrite it unless `--force` is passed.
- `retie-docs` retargets `core` anchors when a heading id changes, as it does for overlay `anchor` cells. `npm test` fails when a `core` cell names no stage checkpoint.
