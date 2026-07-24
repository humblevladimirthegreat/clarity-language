# Word-level coordination

Word-level coordinators join **sibling full words** that share the **same PoS slot**. They are bare vowels — **no** PoS prefix and **no** reference suffix. This page is the source of truth for those particles. Clause- and sentence-level coordination is **not** specified yet (future `/x/` or similar). Correlatives (*both…and*, *either…or*) come later.

PoS prefixes and ordinary word shape: [language-reference.md](language-reference.md). Phonotactic exception: [phonology.md](phonology.md#phonotactics).

## Particles

| Form | Writing | Meaning |
|------|---------|---------|
| **a** | `a` | *and* |
| **e** | `e` | exclusive *or*, **exhaustive** (closed option list) |
| **o** | `o` | exclusive *or*, **non-exhaustive** (other options may exist) |
| **u** | `u` | *nor* (none of the conjuncts) |
| **a** + **e** | `a/e` | inclusive *and/or*, **exhaustive** |
| **a** + **o** | `a/o` | inclusive *and/or*, **non-exhaustive** |

Spoken **a/e** and **a/o** are the two particles in order (**a** then **e**, or **a** then **o**) before the final conjunct. Preferred writing glues them with a slash.

### Exhaustiveness and exclusivity

- **Exhaustive (`e`, `a/e`)** — the listed options are treated as the **only** ones in play (Claritish *eor*). That framing makes false dichotomies easier to notice.
- **Non-exhaustive (`o`, `a/o`)** — other options may exist (Claritish *ior*).
- **Exclusive (`e`, `o`)** — pick **one** of the conjuncts, not more than one.
- **Inclusive (`a/e`, `a/o`)** — one **or** more of the conjuncts may hold (English *and/or*). Built by combining **a** with **e** or **o**; bare **e** / **o** stay exclusive.
- ***Nor* (`u`)** — **none** of the conjuncts hold (*neither…nor…*). The realized set from the list is empty.

**a** alone is ordinary conjunction (*and*), not an *or*.

## Shape of a coordinated chain (Oxford style)

Lists are **Oxford-style without commas**: bare juxtaposition of non-final conjuncts, then **one** coordinator immediately before the **last** conjunct.

```
WORD  ( WORD )*  COORD  WORD
```

- **WORD** — a complete content word: PoS prefix + root(s) + reference suffix + optional plural **-sh**.
- **COORD** — one of **a**, **e**, **o**, **u**, **a e** (`a/e`), **a o** (`a/o`).
- Non-final conjuncts are adjacent (no particle between them). The coordinator appears **only once**, before the final item. There is no leading coordinator and no repeated between-item coordinator.

Two conjuncts still look like `WORD COORD WORD`. Three or more: `WORD WORD COORD WORD` (e.g. *dogs cats **a** birds*).

Examples (schematic): `z-dogl a z-catl` (*a dog and a cat*); `z-dogl z-birdl a z-catlsh` (*a dog, a bird, and some cats*); `v-runl e v-jumpl` (*run or jump* — exclusive, closed list); `g-redl a/o g-bluel` (*red and/or blue* — inclusive, open list); `z-dogl z-catl u z-birdl` (*neither a dog nor a cat nor a bird*).

## Same PoS slot, single words only

- Every conjunct takes the **same** PoS prefix (`/z/`, `/d/`, `/b/`, `/v/`, `/ɡ/`, `/w/`, `/h/`, …). The chain occupies **one** occurrence of that role in the clause (one subject, one verb, one adjective stack position, one `/h/` unit, and so on).
- Conjuncts are **single words**, not phrases. Do not treat a multi-word group as one conjunct.
- Each conjunct keeps its own reference suffix and optional **-sh**. Plurality does not need to match across the chain: `z-dogl a z-catlsh` is fine (*a dog and some cats*).
- Allowed on any PoS that takes ordinary content words in that slot — including verbs, adjectives, adjective adjuncts, and adverb (`/h/`) units. A coordinated `/h/` chain is one floating unit and stays contiguous (same as a single `/h/` or `/h/`+`/b/` pair).

**Not in scope here:** joining different PoS prefixes; coordinating clauses or sentences; correlative pairs; `/x/` sentence linkers (*however*, *therefore*), *but*, quotation fences, or [numbered enumeration](numbers.md#number-as-discourse-marker-by-marker).

## Reserved particles

**a**, **e**, **o**, and **u** as **bare** words (no PoS prefix, no reference suffix) are only these coordinators. They are not lexicon roots and must not appear bare with any other meaning. Ordinary roots remain `V(CV)+` under a PoS prefix and a reference suffix; number-marker vowels after **r** are unchanged — see [numbers.md](numbers.md).
