# Realizer

<!-- retie: skip -->

**Status:** meaning view and round trip shipped; the realizer writes the bare clause, and the variant corpus is still to come  
**Design authority:** [`docs/grammar/`](../grammar/introduction.md) through the [interpreter's readings](interpreter.md#terms). The realizer writes Ageben for a reading; it never decides what a reading means.

The realizer takes a reading and writes an Ageben text that says the same thing. The round trip checks it: read a doc example, realize each reading, read the result again, and compare the two readings with [equal readings](interpreter.md#equal-readings). A pass shows that the reading holds the whole meaning of the text. A failure shows a place where the meaning still lives only in a word's spelling. This note owns the meaning view, the canonical choices, the round trip, the variant corpus and the list of gaps. The realizer is in `src/realize/`, and the round trip in `src/round-trip/`.

## Meaning view
<a id="meaning-view"></a>

The realizer never reads a reading directly. It reads the **meaning view**: a copy of the reading with its form taken out, made by `project` in `src/realize/meaning.ts`. If the realizer could see the parsed words, it could copy their spellings, and a round trip would pass without the reading holding the meaning. With the words taken out, any meaning missing from the reading shows up as a wrong word in the realized text.

**What the view keeps.** Everything a reading says about meaning:

- the reading's structure: the claim (verb, roles by letter, predicate, details, clause-join members), the frames, the stance lists, the links, and the nested readings of conditions, quotes, islands and asides;
- each frame's `family` and `key`, each detail's `kind` and `key`, and each term's `kind`;
- every `values` map, copied;
- the fields that tie meanings together: `party`, `hosted`, `content`, `inner`, `occasions`, `member` and `holderHost`;
- `order` and `unordered` as indices into the reading's frames, with each unsettled pair in text order. [Reader rule 3](interpreter.md#reader-rules) leaves the order of an unsettled pair open, so the view keeps the order the text gave and the realizer never picks one;
- links by kind and key, with the reading they point to (`to`), the frame they carry, and the terms and details they name;
- a pronoun's bind as the bind's kind, with its antecedent as a meaning-view term;
- the identities: a thing's roots, each named by its lexicon row's concrete sense (a listed compound stem as one root, and a root with no row by its spelling); a name as its root spelling; a plain adjective's, adverb's or degree word's root, as the reader's `values.root`; a literal's payload; and a number's stem. These are spellings by design: a different root or name is a different thing, not a different way to say the same thing.

**What the view drops.** Everything that is form or a pointer into the parse:

- every parsed word (`LexWord`), so no spelling, ending or position reaches the realizer;
- construction ids, grammar anchors and word positions;
- the reading's `source` in the parse tree;
- the `unread` list. A reading with an unread construction is marked `unread`, and the round trip skips it with that reason, since its reading is known to be incomplete;
- in a link's records, the words: an answer keeps which question it fills and how many blanks, and a shared record keeps its role.

A test projects every doc example and fails on any object in the view that has a `raw` field, the mark of a parsed word.

**The import rule.** Files in `src/realize/` other than `meaning.ts` may import only these: `meaning.ts` and other files in the folder; the reading types (`src/interpret/types.ts`, as types only) and `src/interpret/read.ts`; the lexicon tables (`src/parse/classify.ts`, `src/lexicon-search.ts` and `src/lexicon-compounds.ts`, as types only, and `src/closed-roots.ts`); and the spelling path (`src/parse/gloss-inverse.ts`, and `spell` and `checkLine` from `src/interpret/reply.ts`). A test reads every such file's imports and fails on anything else. So `meaning.ts` is the only way from a reading to the realizer. Test files may import anything.

## Canonical choices
<a id="canonical-choices"></a>

Where the grammar allows several forms with the same meaning, the realizer writes one. Each choice is a row here: what the realizer writes, the key of the reading part it writes it for, and the grammar anchor that allows the other forms. A choice must give a text that [equal readings](interpreter.md#equal-readings) finds the same as the original; when none does, the part is a gap.

| Choice | Key | Anchor |
|--------|-----|--------|
| The roles in the default order: subject, direct object, verb, then a plain extra noun (`z`, `d`, `v`, `b`) | `claim` | `clause.md#extra-nouns` |
| Roles whose nouns bring in a new member keep the order their frames cover each other in, the earlier word covering the later | `slot:newMember` | `clause.md#which-covers-which` |
| Adverbs right before the verb, or before the predicate when the clause has no verb | `unit:h` | `clause.md#adverbs-h` |
| The statement act `yal` left out | `edge:force` | `speech-moves.md#speech-act-beginner` |
| A role pointer on `-r` written as the resume of the one it names, and a chain of `-r` resumes as the resume of the first mention | `anaphor:pointer` | `pronouns.md#role-pointers` |
| A new one on `-l` written as the noun it copies, on the new member's ending | `slot:newMember` | `pronouns.md#a-new-one` |

## Round trip
<a id="round-trip"></a>

**The realizer.** `realize(view, tables)` in `src/realize/realize.ts` takes one reading of the meaning view and returns its morph gloss with the Ageben that `spell` writes for it, or a gap. A gap has a kind, the key it is filed under and a detail. The kinds:

- `noRule`: the realizer has no rule for this key yet;
- `missingValue`: the view lacks what the realizer needs to choose a word, a gap in the reader;
- `noSpell`: the gloss does not spell;
- `noParse`: the spelled line does not parse to one tree.

A gap is filed under the key of the reading's first part: its first frame's key, else its first claim detail's, its first stance list's or its first link's. A reading with none of these is the bare clause, filed as `claim`.

**The bare clause.** `src/realize/claim.ts` writes the claim: its verb, its `z`, `d` and `b` roles, its predicate and its plain adverbs, in the order of the [canonical choices](#canonical-choices). A role holds a `thing`, `speaker`, `listener`, `we` or `pronoun` term with its plain adjectives and their degree words (`src/realize/terms.ts`). A pronoun is written as the generic or topic pronoun by its `sort`, as the resume of the thing or special it names on `-r`, or as the noun it copies on `-l`; a role compound, a tag, a share on `-m`, a resume pinned to a sense and a pronoun with no antecedent are still `noRule` gaps, and the pronoun's anaphor link is left to the reader, which binds the written pronoun again. A first-mention noun's new-member frame ([new member in a statement](../grammar/beginner/joins.md#new-member-in-a-statement)) is written by its noun alone, on the ending the frame records; any other frame, a link, a stance list or a word-building stem is still a `noRule` gap. A word's leaf gloss comes from the gloss index for its root, role letter and ending (`src/realize/words.ts`), so the realizer never writes an English label or a spelling itself.

**The walk.** `src/round-trip/round-trip.ts` reads each doc example as one turn of a log (`buildLog`), so links and pronouns cross its sentences. It projects every reading, realizes it, and joins the realized sentences in order. It then gives the example one verdict:

| Verdict | Means |
|---------|-------|
| `ok` | equal readings finds the original and the realized text the same, and realizing the realized text again gives the same gloss |
| `different` | equal readings finds them different; the trip keeps the first path where the two canonical forms differ, or `idempotence` when realizing again gives another gloss |
| `unsettled` | equal readings finds an unordered pair in the other text order |
| `gap:<kind>` | the realizer returned a gap for one of the readings |
| `skipped:<reason>` | not judged: the original does not parse (`noParse`), a reading has an unread construction (`unread`), or its readings did not project (`project`) |

A trip that is not a gap is filed under the key of its first reading, or of the first reading that differs.

**The ratchet.** `src/round-trip/round-trip-ratchet.json` holds the count of `ok` trips and, by key, the count of trips that failed (neither `ok` nor skipped). A failed trip counts once under the key of every part of every one of its readings (a reading with no parts counts as `claim`), not under the key it is filed under. That key moves as the realizer gets further into a trip, while a trip's part keys never change, so a key with no failures gains one only when an `ok` trip fails. Its test fails when the `ok` count falls, or when a key with no failures gains one. When the counts improve, the unit that improved them lowers the file to the new counts, which `npm run round-trip -- --ratchet` prints.

**The script.** `npm run round-trip` prints the counts by verdict, then each verdict's keys, each trip under the key it is filed under. `--save` writes them to the `tmp/` state folder, and `--diff` prints only the counts that changed since the save, as for `npm run sweep`. `--texts KEY …` lists the examples behind a verdict (`gap:noRule`), a key (`edge:force`) or a type that heads keys (`edge`).

## Variants
<a id="variants"></a>

This section will describe the variant corpus: texts made by changing one letter slot of a doc example, which the round trip runs on as well as the doc examples.

## Gaps
<a id="gaps"></a>

This section will list each meaning the grammar pages leave unsaid where the round trip needs one, with a recommendation and its confidence. The realizer skips these until a page settles them.
