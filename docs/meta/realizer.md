# Realizer

<!-- retie: skip -->

**Status:** meaning view shipped; the realizer, the round trip and the variant corpus are still to come  
**Design authority:** [`docs/grammar/`](../grammar/introduction.md) through the [interpreter's readings](interpreter.md#terms). The realizer writes Ageben for a reading; it never decides what a reading means.

The realizer takes a reading and writes an Ageben text that says the same thing. The round trip checks it: read a doc example, realize each reading, read the result again, and compare the two readings with [equal readings](interpreter.md#equal-readings). A pass shows that the reading holds the whole meaning of the text. A failure shows a place where the meaning still lives only in a word's spelling. This note owns the meaning view, the canonical choices, the round trip, the variant corpus and the list of gaps. The code is in `src/realize/`.

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
- the identities: a thing's roots, each named by its lexicon row's concrete sense (a listed compound stem as one root, and a root with no row by its spelling); a name as its root spelling; a literal's payload; and a number's stem. These are spellings by design: a different root or name is a different thing, not a different way to say the same thing.

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

Where the grammar allows several forms with the same meaning, the realizer writes one. This section will hold a table of those choices, one row per choice, with the grammar anchor that allows the other forms.

## Round trip
<a id="round-trip"></a>

This section will describe the round trip: how each doc example is read, realized and read again, how the two readings are compared, what each outcome counts as, and the ratchet that keeps the count of passes from falling.

## Variants
<a id="variants"></a>

This section will describe the variant corpus: texts made by changing one letter slot of a doc example, which the round trip runs on as well as the doc examples.

## Gaps
<a id="gaps"></a>

This section will list each meaning the grammar pages leave unsaid where the round trip needs one, with a recommendation and its confidence. The realizer skips these until a page settles them.
