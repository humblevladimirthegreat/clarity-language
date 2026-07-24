# Coordination

This page is the source of truth for **word-level** and **clause-level** coordination. Correlatives (*both…and*, *either…or*) come later. Asymmetric discourse glue (*but*, *however*, *therefore*) is `/x/` but **not** this vowel series — see [language-reference.md](language-reference.md#discourse-markers-x).

PoS prefixes and ordinary word shape: [language-reference.md](language-reference.md). Reference suffixes: [reference-suffix.md](reference-suffix.md). Phonotactic exception for bare vowels: [phonology.md](phonology.md#phonotactics).

## Join type (shared vowel series)

The same vowels encode join type at both levels:

| Vowel / writing | Meaning |
|-----------------|---------|
| **a** / `a` | *and* |
| **e** / `e` | exclusive *or*, **exhaustive** (closed option list) |
| **o** / `o` | exclusive *or*, **non-exhaustive** (other options may exist) |
| **u** / `u` | *nor* (none of the conjuncts) |
| **a** + **e** / `a/e` | inclusive *and/or*, **exhaustive** |
| **a** + **o** / `a/o` | inclusive *and/or*, **non-exhaustive** |

### Exhaustiveness and exclusivity

- **Exhaustive (`e`, `a/e`)** — the listed options are treated as the **only** ones in play (Claritish *eor*). That framing makes false dichotomies easier to notice.
- **Non-exhaustive (`o`, `a/o`)** — other options may exist (Claritish *ior*).
- **Exclusive (`e`, `o`)** — pick **one** of the conjuncts, not more than one.
- **Inclusive (`a/e`, `a/o`)** — one **or** more of the conjuncts may hold (English *and/or*). Built by combining **a** with **e** or **o**; bare **e** / **o** stay exclusive.
- ***Nor* (`u`)** — **none** of the conjuncts hold (*neither…nor…*). The realized set from the list is empty.

**a** alone is ordinary conjunction (*and*), not an *or*.

---

# Word-level coordination

Word-level coordinators join **sibling full words** that share the **same PoS slot**. They are **bare** vowels — **no** PoS prefix and **no** reference suffix.

## Particles

| Form | Writing | Meaning |
|------|---------|---------|
| **a** | `a` | *and* |
| **e** | `e` | exclusive *or*, **exhaustive** |
| **o** | `o` | exclusive *or*, **non-exhaustive** |
| **u** | `u` | *nor* |
| **a** + **e** | `a/e` | inclusive *and/or*, **exhaustive** |
| **a** + **o** | `a/o` | inclusive *and/or*, **non-exhaustive** |

Spoken **a/e** and **a/o** are the two particles in order (**a** then **e**, or **a** then **o**) before the final conjunct. Preferred writing glues them with a slash.

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

**Not word-level:** joining different PoS prefixes; coordinating clauses or sentences (below); correlative pairs; `/x/` sentence linkers (*however*, *therefore*), *but*, quotation fences, or [numbered enumeration](numbers.md#number-as-discourse-marker-by-marker).

## Reserved particles

**a**, **e**, **o**, and **u** as **bare** words (no PoS prefix, no reference suffix) are only these word-level coordinators. They are not lexicon roots and must not appear bare with any other meaning. Ordinary roots remain `V(CV)+` under a PoS prefix and a reference suffix; number-marker vowels after **r** are unchanged — see [numbers.md](numbers.md).

---

# Clause-level coordination

Clause-level coordinators join **full sentences**. They are **`/x/`** discourse markers whose **root is the same vowel series** as word-level coordination. Unlike bare **a** / **e** / **o** / **u**, they take a [reference suffix](reference-suffix.md): **-l**, **-m**, or **-r** only. **-n** is **not** used on this series (use a separate `/x/`…**-n** thread label if you need a titled agenda item, then ordinary clause coordinators between sentences). They do **not** take plural **-sh**.

Word shape: `/x/` + vowel root (+ second vowel for inclusive forms) + reference suffix (**-l** / **-m** / **-r**).

## Vowels × endings

The **vowel** chooses join type; the **ending** chooses discourse status of that join (not a second boolean table). Endorsement strength and evidentiality stay on each clause’s `/h/` (or `/w/`), not on the coordinator.

| | **-l** open a fresh committed join | **-m** soft: sequence / uncertain reconstruction | **-r** continue that same join |
|---|--------------------------------------|--------------------------------------|------------------------------|
| **a** (*and*) | `xal` | `xam` | `xar` |
| **e** (xor, exhaustive) | `xel` | `xem` | `xer` |
| **o** (xor, non-exhaustive) | `xol` | `xom` | `xor` |
| **u** (*nor*) | `xul` | `xum` | `xur` |
| **a/e** (and/or, exhaustive) | `xael` | `xaem` | `xaer` |
| **a/o** (and/or, non-exhaustive) | `xaol` | `xaom` | `xaor` |

Preferred writing for inclusive forms glues the vowels (`xael`, …). Spoken order is **a** then **e**, or **a** then **o**, then the reference suffix — same order as word-level `a/e` / `a/o`.

### Ending senses (clause coordinators)

**-l** and **-m** always **start a new list**. They never extend an open list. **-r** is the **only** way to add another conjunct to the list most recently opened by a matching root.

- **-l** — Opens a **new**, **committed** clause-join list: the speaker stands behind the boolean reading (`xal` = both hold; `xel` = pick exactly one, closed list; and so on).
- **-m** — Opens a **new** list with soft packaging of the same join shape: **narrative sequence** (**a**) or **uncertain reconstruction** (the others) — not a second boolean table, and not dramatic metaphor. Per vowel:
  - **`xam`** (*and*) — *and then…* (temporal / story sequence, not mere logical *and*).
  - **`xem`** (*xor*, exhaustive) — *or maybe it was…* — closed set of uncertain alternatives (one of these guesses).
  - **`xom`** (*xor*, non-exhaustive) — *or maybe it was… (or something else)* — same uncertainty, without claiming those are all the guesses.
  - **`xum`** (*nor*) — *and it wasn’t… either* / *nor, as I recall…* — soft denial chain while reconstructing what did not hold.
  - **`xaem`** (*and/or*, exhaustive) — *and/or maybe…* — closed: one or more of these might be what happened / what’s true.
  - **`xaom`** (*and/or*, non-exhaustive) — *and/or maybe something like…* — soft multi-fit without claiming the list is complete.
- **-n** — **Not used** on clause coordinators. Titled / official discourse labels stay other `/x/`…**-n** forms — see [reference-suffix.md](reference-suffix.md#discourse-markers-x).
- **-r** — **Continues** the most recently opened list whose root matches (`xa…`, `xe…`, …). Required for a flat three-or-more chain. Fits `/x/`…**-r** “same linker again” — see [pronouns.md](pronouns.md).

## Shape (not Oxford style)

Clause-level coordination is **not** Oxford-style. A coordinator appears before every non-initial sentence in a chain. Which ending you use decides **flat list** vs **nesting**.

```
SENT  X-OPEN  SENT  ( X-CONT  SENT )*     ← one flat list
```

- **SENT** — a complete sentence beginning with `/j/` (optional vocative(s) / interjection(s), then clause force, then clause body).
- **X-OPEN** — **-l** or **-m** (`xal`, `xel`, `xam`, …). Always begins a **new** list.
- **X-CONT** — **-r** only (`xar`, `xer`, …). Extends that same open list. Do **not** use another **-l** / **-m** if you mean “one more item in this list.”

**Flat list** (one join, many conjuncts) — open once, then only **-r**:

- Two: `A  xal  B` → *A and B*
- Three+: `A  xal  B  xar  C` → *A and B and C* (one *and*-list)
- Exclusive closed: `A  xel  B  xer  C` → *A or B or C* (one *xor*-list)

**Nesting** — a second **-l** / **-m** starts an inner list; reading is **right-associative** (the new open groups with what follows):

- `A  xel  B  xel  C` → *A or (B or C)* — two lists, not one three-way *or*
- `A  xal  B  xel  C  xer  D` → *A and (B or C or D)* — outer *and*, inner flat *xor*-list

To get a flat three-way *or*, you **must** write `A xel B xer C`, not `A xel B xel C`.

## Constraints

- **Same clause force** on every conjunct (all statements, all polar questions, or all imperatives). Mixed force → separate sentences or [subordination](language-reference.md#dependent-clauses), not this join.
- **No gapping / shared arguments** across conjuncts. Repeat material, or use word-level coordination inside one clause.
- **Not subordination:** *because* / *if* / *although* stay `/h/` + `/b/` [next-clause pronoun](pronouns.md#special-pronouns).
- **Not *but* / *however* / *therefore*:** those are other `/x/` linkers, not this vowel series.
