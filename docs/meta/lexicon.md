# Lexicon editing

Editors only. How root spellings are made and changed in the lexicon CSVs. What each CSV owns is in the `AGENTS.md` routing table; overlay kinds are in [parser pipeline](parser-pipeline.md#overlay-kinds).

## Root spellings come from `convert-word`

Never make up a root spelling by hand, whether for a new row, a respelling, or a shorter root for a row that gains an overlay. Generate it with:

```
npm run convert-word -- --lexicon --only LITERAL
```

`--only` takes a concrete literal, emoji, or root (repeatable or comma-separated) and limits the run to those published rows; every other row keeps its root. `--lexicon` alone is refused; `--lexicon --all` re-places the whole lexicon.

A hand-picked spelling bypasses the checks that placement runs. Placement:

- derives the root from the English pronunciation (CMU dictionary), so it sounds like its cue
- skips roots already held by other rows and stems used in [`lexicon-compounds.csv`](../../data/lexicon-compounds.csv)
- picks the root's length from the row's role (below)
- rewrites the overlay and compound rows that spell the old root, and writes `tmp/lexicon-retie-map.json` for `retie-docs`

`npm run convert-word -- <english>` (no `--lexicon`) only prints a candidate. Use it to explore, not as a source for a hand edit.

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

### Labels and senses

- **Concrete label:** the English word people use for the thing, not the Unicode name (*cupid*, not *heart with arrow*; *villain*, not *angry face with horns*). Flag rows follow [flag rows](#flag-rows). `convert-word` needs a CMU pronunciation for the label. Add a missing one to `CMU_OVERRIDES` in [`src/cmu-dict.ts`](../../src/cmu-dict.ts) rather than bending the label.
- **Multiword labels and glosses:** join the words with hyphens, never spaces: *gas-pump*, *black-pepper*, *wedding-dress*. This holds for concrete labels, compound glosses and aliases alike.
- **Abstract and aliases:** never repeat another row's concrete, abstract or `english_aliases` entry. When a new row takes over a sense, move the alias off the old row (🌍 *earth* took *world* and *earth* from 🌐).

### No English puns

A link from seed to abstract sense, from a compound's left root to its meaning, or in a mnemonic must not depend on how an English word sounds or is spelled: no *thyme* from *time*, no *sage* from *wisdom*. Learners who don't speak English get nothing from the pun. Use a link through the thing itself, such as its use, look, or what it goes with (*dill* from *pickle*). A fixed English idiom whose image works in other languages is fine (*a grain of salt*).

### Row order

Rows follow Unicode emoji order (the `emoji-test.txt` / CLDR order), with 👓 pinned first. Non-emoji seeds come after the flags, in code point order. Add a new row at its place, not at the bottom.

## Flag rows

A row whose emoji is a country or territory flag labels its concrete sense `<place>-flag` (`japan-flag`): **-l** is the flag, **-n** names the place, and the abstract is the demonym ([countries and traditions](../grammar/word-endings.md#countries-traditions)). Placement ignores the `-flag` suffix when it looks up the pronunciation, so a root is spelled from the place name. Use `stripFlagSuffix` from [`src/flag-label.ts`](../../src/flag-label.ts) rather than matching the suffix by hand.

Tradition and religion rows follow the same split (**-n** the tradition, **-m** an adherent or quality, **-l** the symbol), so each needs an abstract column that names the adherent.

## Placeholder spellings

When a root's spelling is not yet known (a proposal, a draft page, a planned overlay), write the row's **emoji** where the spelling would go, with any affixes around it (`gl🔤l`). Never invent a provisional spelling, even a plausible one: it would look real and could be copied. The emoji is replaced by the generated root when `convert-word` places the row, and the retie procedure below covers any page that already holds it.

## Root length

- **Three letters:** rows backed by an overlay, plus the marked pronouns. These are annealed so short roots stay apart from each other.
- **Five letters:** every other row, frequent senses first.

So a row that gains its first overlay needs a `convert-word --only` run to get a three-letter root. A row that loses its last overlay keeps its short root until the next full `--lexicon` run, which may lengthen it.

## Respelling a row

After `convert-word`, run the retie procedure in `AGENTS.md` (`retie-docs` dry run, then `--write`, then build and test). A retie changes the spelling of the same sense everywhere, and code never spells a root as a string literal; use [`src/closed-roots.ts`](../../src/closed-roots.ts).

## Moving an overlay to another row

Moving a sense (an overlay) from one published row to another is a **replacement**, not a retie. `retie-docs` follows a row's own respelling, so it never moves forms from the old row's root to the new one.

1. In [`lexicon-overlays.csv`](../../data/lexicon-overlays.csv), change each moved row's `emoji` to the target row and its `sense_form` to spell the target row's **current** root. Update `gloss`, `definition` and `mnemonic` to match.
2. Run `npm run convert-word -- --lexicon --only <target>`. If the target now needs a three-letter root, this respells it and rewrites the overlay `sense_form`s to match.
3. Run `retie-docs` for the target's respelling, as for any respelling.
4. By hand, replace every doc use of the **old** root in the moved sense with the new root, and fix the morph glosses and English wording. Leave uses of the old row's ordinary sense alone. Check with `node scripts/find.mjs` or grep for the old sense forms.
5. `npm run build` and `npm test`.

## Dictionary compounds

A row in [`lexicon-compounds.csv`](../../data/lexicon-compounds.csv) is one stem: **left root + boundary letter + head root** ([lexical compounds](../grammar/x-compounds.md#lexical-compounds)). The `join` column is the boundary letter, and it picks the sense of the **left** root only: **-l** when its concrete sense narrows the head (*bed* **-l** *room* = *bedroom*), **-m** when its abstract sense does (*formality* **-m** *shoe* = *dress shoe*), **-n** / **-r** for a name or a resume. The whole-word ending added at use picks the sense of the entry: **-l** reads the row's `concrete`, **-m** its `abstract`. Fill `abstract` only when the head's abstract sense really carries over (*bedroom* **-m** = *sanctum*), never because the left root has one.

### When a compound earns a row

Add a row only when all of these hold:

1. **It is one thing**, not a list or a thing plus a property (*a blue dog* is two words).
2. **It is a fixed kind** that English or most languages name with one word or a fixed phrase. Pairings made on the spot stay live `x` compounds.
3. **No root already has the sense** as `concrete`, `abstract` or alias. Many specific kinds are seeds already (*garlic*, *owl*).
4. **The head is the most specific root that fits**, and the entry is a *kind of* the head's concrete.
5. **The left root narrows the head in a way a learner can guess**, or the mnemonic makes the link easy to remember, never through an English pun ([no English puns](#no-english-puns)).

Some English words stay out by design: kin terms are [kin generations](../grammar/numbers-applied.md#kin-generations), doers are [role compounds](../grammar/roles.md#role-compounds), young and sexed animals use `/ɡ/`, and a tie between people is a [social relation](../grammar/relations.md#social-relations) unless English has a fixed noun for the person (*friend*).

### Compound heads

A compound takes the most specific head root that fits: *sparrow* is built on 🐦 *bird*, not 𓄛 *animal*; *basil* on 🌿 *herb*. A generic head (𓄛 *animal*, 🫙 *jar*, 🧺 *basket*) heads a compound only when no narrower root covers the whole class (*pet*, *livestock*). A head's `concrete` label should name the whole category (🍈 *fruit*, 🥫 *metal*, 🥢 *stick*, 🧪 *tube*), so learners read the stem as a kind of it.

A compound cannot head another compound. *Cup*, *roof*, *fence*, *river* and the other compounds stay leaves; a kind of cup goes on 🥣 *bowl* directly or stays a live `x` compound.

When a needed head is missing, add it before writing its compounds, since moving compounds onto a new head later respells their stems. Prefer **retitling** a row whose emoji already pictures the generic sense and which has little to lose (🫐 *blueberry* → *berry*, 🥢 *chopsticks* → *stick*); the old specific sense becomes a compound. A retitle keeps the row's spelling. Otherwise add a seed ([what can be a seed](#what-can-be-a-seed)) and place it with `convert-word`.

### Adding compounds

`npm run compound-fill` drafts compounds one head at a time, naming roots by seed or English label, never by spelling:

1. `heads` lists heads by compound count; `heads 🐦 🐟` shows each head's row and compounds.
2. `synsets <word>` lists WordNet noun senses; `candidates <synset> [--depth N --max-rank N] [--triage]` lists hyponyms by frequency and hides covered senses.
3. `check <word>…` reports exact hits on a root, alias, compound or overlay gloss. For near matches use `find-english --kind root` and `lexicon-search`.
4. Write a draft CSV with the header `english,left,join,head,abstract,mnemonic`. The mnemonic opens *"<left> specifying <head> is …"*. `draft <file>` prints each stem, the validator's errors and extra warnings.
5. `draft <file> --write` appends the rows, only when no row has an error. Then run `npm run check-compounds`, `npm test`, and `npm run cheat-sheet-blocks -- --write`.

`check-compounds` rejects a stem that is not left + boundary + head, a bad boundary letter, an unpublished or non-content root, a stem that is already a root or splits into published roots more than one way, the same root on both sides, a gloss that is already a published or compound sense, and a missing gloss or mnemonic. It does not catch an ending-plus-stem form that also reads as an overlay plus a root; the morph-gloss lint in `npm test` does. If a stem splits two ways, pick a different left root; never respell a root to make the split unique.

## Core vocabulary column

The `core` column in [`lexicon-published.csv`](../../data/lexicon-published.csv) and [`lexicon-compounds.csv`](../../data/lexicon-compounds.csv) names the stage checkpoint that introduces a core learner root, as `page.md#id` of its checkpoint heading: `### Practice` (`clause.md#beginner-practice`), or a legacy `### Translation practice` (`clause.md#beginner-translation-practice`). Replacing a legacy checkpoint retargets its cells by hand; `retie-docs` does not see a hand-renamed heading. An empty cell means the root is not core. The order of the core list is the path order of those checkpoints. House names, the `SELF` root, discourse-role specials, topic and generic pronouns, the nine [sake](../grammar/sakes.md#sake-inventory) roots, and closed overlay words are never core.

- `npm run core-vocabulary` prints, for each checkpoint, the roots it introduces and how many bank roots are review, and flags checkpoints over the cap of 5 new roots.
- `npm run core-vocabulary -- --for <page>.md:<band>` (or `--for page.md#id`) lists, for one checkpoint, the roots whose cell names it, the next later core roots, and the earlier core roots ranked by checkpoints since a bank last used them (`--limit` sets how many).
- `npm run core-vocabulary -- --write` seeded the column once from the stage banks: each root got the first checkpoint whose **Roots used here** table uses it. After that the column is edited by hand, and `--write` refuses to overwrite it unless `--force` is passed.
- `retie-docs` retargets `core` anchors when a heading id changes, as it does for overlay `anchor` cells. `npm test` fails when a `core` cell names no stage checkpoint.
