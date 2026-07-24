# Coordination

This page is the source of truth for **word-level** and **clause-level** coordination. Correlatives (*both…and*, *either…or*) come later. Asymmetric discourse glue (*but*, *however*, *therefore*) is `/x/` but **not** this vowel series — see [language-reference.md](language-reference.md#discourse-markers-x). (*But not* / *except* and *instead of* **are** this series — vowel **e** below.)

PoS prefixes and ordinary word shape: [language-reference.md](language-reference.md). Reference suffixes: [reference-suffix.md](reference-suffix.md). Phonotactic exception for coordinator particles: [phonology.md](phonology.md#phonotactics).

## Join type × ending (shared at both levels)

**Vowel(s)** choose join type. **Ending** **-l** / **-m** is required on every word-level coordinator and on committed clause openers. For **a** / **o** / **u** / **ao**, that ending is **closure**. For **e**, that ending picks **exception** vs **replacement** (closure does not apply).

### Join type (vowel series)

| Vowel / writing | Meaning |
|-----------------|---------|
| **a** / `a` | *and* |
| **o** / `o` | exclusive *or* (pick **one**) |
| **u** / `u` | *nor* (none of the conjuncts) |
| **a** + **o** / `ao` (or `a/o`) | inclusive *and/or* (one **or** more) |
| **e** / `e` | exception or replacement (which one = ending; below) |

### Closure ending (**a** / **o** / **u** / **ao** only)

| Ending | Meaning |
|--------|---------|
| **-l** | **Closed** (exhaustive) — the listed conjuncts are treated as the **only** ones in play for this claim (Claritish *eor*-style completeness). |
| **-m** | **Open** (non-exhaustive) — other conjuncts may exist (*among others*, *including but not limited to*; Claritish *ior*-style). |

When unsure whether the list is complete, prefer **-m** (open). Use **-l** when you stand behind completeness (inventories, forced-choice menus, definitions).

### Exception vs replacement (**e** only)

On **e**, **-l** / **-m** do **not** mark closure. They choose the relation (mnemonic: **-l** crisp cut, **-m** stand-in / rewrite):

| Ending | Form | Meaning | Reading order |
|--------|------|---------|----------------|
| **-l** | `el` | **Exception** — base holds **excluding** the last conjunct (*but not* / *except*) | `X el Y` → *X but not Y* |
| **-m** | `em` | **Replacement** — the last conjunct **takes the place of** what precedes (*instead of*) | `X em Y` → *Y instead of X* |

These joins are **directional** (order matters), unlike *and* / *or* / *nor*.

### Exclusivity and *nor*

- **Exclusive (`o`)** — pick **one** of the conjuncts, not more than one.
- **Inclusive (`ao`)** — one **or** more of the conjuncts may hold (English *and/or*). Built by combining **a** with **o**; bare **o** stays exclusive.
- ***Nor* (`u`)** — **none** of the conjuncts hold (*neither…nor…*). The realized set from the list is empty. **-l** vs **-m** still marks whether that denial is limited to the listed items (**ul**) or leaves room for further denials outside the list (**um**).

**a** is ordinary conjunction (*and*), not an *or*. Every word-level coordinator takes **-l** or **-m** (no bare vowel). Clause soft packaging for **a** / **o** / **u** / **ao** uses **-n** — below. Soft **-n** is **not** used on **e**.

---

# Word-level coordination

Word-level coordinators join **sibling full words** that share the **same PoS slot**. They have **no** PoS prefix. They **do** take an ending (**-l** or **-m** only — not **-n** / **-r**, and not plural **-sh**).

## Particles

| Form | Writing | Meaning |
|------|---------|---------|
| **a** + **-l** | `al` | *and*, **closed** |
| **a** + **-m** | `am` | *and*, **open** |
| **o** + **-l** | `ol` | exclusive *or*, **closed** |
| **o** + **-m** | `om` | exclusive *or*, **open** |
| **u** + **-l** | `ul` | *nor*, **closed** |
| **u** + **-m** | `um` | *nor*, **open** |
| **a** + **o** + **-l** | `aol` | inclusive *and/or*, **closed** |
| **a** + **o** + **-m** | `aom` | inclusive *and/or*, **open** |
| **e** + **-l** | `el` | **exception** (*but not* / *except*) |
| **e** + **-m** | `em` | **replacement** (*instead of*) |

Spoken inclusive forms are **a** then **o** then the ending. Preferred writing glues the vowels (`aol`, `aom`); `a/ol` / `a/om` is allowed if a slash helps reading.

## Shape of a coordinated chain (Oxford style)

Lists are **Oxford-style without commas**: bare juxtaposition of non-final conjuncts, then **one** coordinator immediately before the **last** conjunct.

```
WORD  ( WORD )*  COORD  WORD
```

- **WORD** — a complete content word: PoS prefix + root(s) + reference suffix + optional plural **-sh**.
- **COORD** — one of **al**, **am**, **ol**, **om**, **ul**, **um**, **aol**, **aom**, **el**, **em**.
- Non-final conjuncts are adjacent (no particle between them). The coordinator appears **only once**, before the final item. There is no leading coordinator and no repeated between-item coordinator.

Two conjuncts still look like `WORD COORD WORD`. Three or more: `WORD WORD COORD WORD` (e.g. *dogs cats **am** birds*).

**Exception / replacement readings** (final conjunct is special):

- **`el`**: non-final conjuncts are the **base** (as if joined by open *and*); the final conjunct is **excluded**. `A el B` → *A but not B*; `A B el C` → *A and B, except C*.
- **`em`**: non-final conjuncts are what is **replaced**; the final conjunct is the **replacement**. `A em B` → *B instead of A*; `A B em C` → *C instead of A and B*.

Examples (schematic): `z-dogl am z-catl` (*a dog and a cat* — open list); `z-dogl z-birdl al z-catlsh` (*a dog, a bird, and some cats* — closed inventory); `v-runl ol v-jumpl` (*run or jump* — exclusive, closed); `g-redl aom g-bluel` (*red and/or blue* — inclusive, open); `z-dogl z-catl ul z-birdl` (*neither a dog nor a cat nor a bird* — closed denial set); `z-dogl el z-catl` (*a dog but not a cat*); `z-dogl em z-catl` (*a cat instead of a dog*).

## Same PoS slot, single words only

- Every conjunct takes the **same** PoS prefix (`/z/`, `/d/`, `/b/`, `/v/`, `/ɡ/`, `/w/`, `/h/`, …). The chain occupies **one** occurrence of that role in the clause (one subject, one verb, one adjective stack position, one `/h/` unit, and so on).
- Conjuncts are **single words**, not phrases. Do not treat a multi-word group as one conjunct.
- Each conjunct keeps its own reference suffix and optional **-sh**. Plurality does not need to match across the chain: `z-dogl am z-catlsh` is fine (*a dog and some cats*).
- Allowed on any PoS that takes ordinary content words in that slot — including verbs, adjectives, adjective adjuncts, and adverb (`/h/`) units. A coordinated `/h/` chain is one floating unit and stays contiguous (same as a single `/h/` or `/h/`+`/b/` pair).

**Not word-level:** joining different PoS prefixes; coordinating clauses or sentences (below); correlative pairs; `/x/` sentence linkers (*however*, *therefore*), general adversative *but*, quotation fences, or [numbered enumeration](numbers.md#number-as-discourse-marker-by-marker). Word-level *but not* / *except* and *instead of* **are** word-level (**el** / **em**).

## Reserved particles

**al**, **am**, **ol**, **om**, **ul**, **um**, **aol**, **aom**, **el**, and **em** as **bare** words (no PoS prefix) are only these word-level coordinators. They are not lexicon roots and must not appear bare with any other meaning. Bare **a** / **o** / **u** / **e** without **-l** / **-m** are **not** coordinators. Ordinary roots remain `V(CV)+` under a PoS prefix and a reference suffix; number-marker vowels after **r** are unchanged — see [numbers.md](numbers.md).

The letters **-l** / **-m** here are the same inventory as [reference suffixes](reference-suffix.md), but on coordinators they are specialized: **closed** vs **open** for **a** / **o** / **u** / **ao**, and **exception** vs **replacement** for **e** — not ordinary literal vs metaphorical.

---

# Clause-level coordination

Clause-level coordinators join **full sentences**. They are **`/x/`** discourse markers whose **root is the same vowel series** as word-level coordination. They take a [reference-suffix letter](reference-suffix.md): **-l**, **-m**, **-n**, or **-r** (**-n** not on **e**). They do **not** take plural **-sh**.

Word shape: `/x/` + vowel root (+ second vowel for inclusive forms) + ending.

## Vowels × endings

The **vowel** chooses join type. Endorsement strength and evidentiality stay on each clause’s `/h/` (or `/w/`), not on the coordinator.

| | **-l** | **-m** | **-n** soft | **-r** continue |
|---|--------|--------|-------------|-----------------|
| **a** (*and*) | `xal` closed | `xam` open | `xan` | `xar` |
| **o** (xor) | `xol` closed | `xom` open | `xon` | `xor` |
| **u** (*nor*) | `xul` closed | `xum` open | `xun` | `xur` |
| **ao** (and/or) | `xaol` closed | `xaom` open | `xaon` | `xaor` |
| **e** (exception / replacement) | `xel` exception | `xem` replacement | *(not used)* | `xer` |

Preferred writing for inclusive forms glues the vowels (`xaol`, …). Spoken order is **a** then **o**, then the ending — same order as word-level `aol` / `aom`.

### Ending senses (clause coordinators)

**-l**, **-m**, and **-n** always **start a new list** (where that ending is allowed). They never extend an open list. **-r** is the **only** way to add another conjunct to the list most recently opened by a matching root. Continuations inherit the opener’s join type and its **-l** / **-m** reading (closure, or exception vs replacement).

- **-l** / **-m** on **a** / **o** / **u** / **ao** — Open a **new**, **committed** clause-join list with **closed** (**-l**) or **open** (**-m**) completeness (`xal` = both hold, full set; `xom` = pick one, other options may exist; and so on).
- **-l** / **-m** on **e** — Open a **new**, **committed** exception or replacement join (not closure):
  - **`xel`** — *but not* / *except*: prior clause(s) hold, excluding what follows (`A xel B` → *A, but not B*).
  - **`xem`** — *instead*: what follows **replaces** what precedes (`A xem B` → *B instead of A*).
- **-n** — Opens a **new** list with **soft** packaging (**a** / **o** / **u** / **ao** only): **narrative sequence** (**a**) or **uncertain reconstruction** (the others) — not a second boolean table, and not dramatic metaphor. Soft lists do **not** carry a separate closed/open bit; treat completeness as open-leaning unless you upgrade to a committed **-l** / **-m** opener (optionally with `/h/` evidential hedges). Per vowel:
  - **`xan`** (*and*) — *and then…* (temporal / story sequence, not mere logical *and*).
  - **`xon`** (*xor*) — *or maybe it was…* — uncertain alternatives (typically without claiming those are all the guesses).
  - **`xun`** (*nor*) — *and it wasn’t… either* / *nor, as I recall…* — soft denial chain while reconstructing what did not hold.
  - **`xaon`** (*and/or*) — *and/or maybe…* — soft multi-fit without a hard completeness claim.
  - **Not on `e`:** uncertain exception or replacement uses **`xel`** / **`xem`** plus `/h/` evidentiality, not **-n**.
- **-r** — **Continues** the most recently opened list whose root matches (`xa…`, `xo…`, `xe…`, …). Required for a flat three-or-more chain. Fits `/x/`…**-r** “same linker again” — see [pronouns.md](pronouns.md). On **e**: `A xel B xer C` → *A, except B, and except C*; `A xem B xer C` → successive replacement (*C instead of B instead of A*).

Titled / official discourse labels stay **other** `/x/`…**-n** forms (different roots, not this vowel series) — see [reference-suffix.md](reference-suffix.md#discourse-markers-x).

## Shape (not Oxford style)

Clause-level coordination is **not** Oxford-style. A coordinator appears before every non-initial sentence in a chain. Which ending you use decides **flat list** vs **nesting**.

```
SENT  X-OPEN  SENT  ( X-CONT  SENT )*     ← one flat list
```

- **SENT** — a complete sentence beginning with `/j/` (optional vocative(s) / interjection(s), then clause force, then clause body).
- **X-OPEN** — **-l**, **-m**, or **-n** where allowed (`xal`, `xam`, `xan`, `xel`, `xem`, …). Always begins a **new** list.
- **X-CONT** — **-r** only (`xar`, `xor`, `xer`, …). Extends that same open list. Do **not** use another **-l** / **-m** / **-n** if you mean “one more item in this list.”

**Flat list** (one join, many conjuncts) — open once, then only **-r**:

- Two: `A  xal  B` → *A and B* (closed)
- Two open: `A  xam  B` → *A and B* (among others)
- Three+: `A  xal  B  xar  C` → *A and B and C* (one closed *and*-list)
- Exclusive closed: `A  xol  B  xor  C` → *A or B or C* (one closed *xor*-list)
- Sequence: `A  xan  B  xar  C` → *A and then B and then C*
- Exception: `A  xel  B` → *A, but not B*; `A  xel  B  xer  C` → *A, except B and except C*
- Replacement: `A  xem  B` → *B instead of A*

**Nesting** — a second **-l** / **-m** / **-n** starts an inner list; reading is **right-associative** (the new open groups with what follows):

- `A  xol  B  xol  C` → *A or (B or C)* — two lists, not one three-way *or*
- `A  xal  B  xol  C  xor  D` → *A and (B or C or D)* — outer closed *and*, inner flat closed *xor*-list

To get a flat three-way *or*, you **must** write `A xol B xor C`, not `A xol B xol C`.

## Constraints

- **Same clause force** on every conjunct (all statements, all polar questions, or all imperatives). Mixed force → separate sentences or [subordination](language-reference.md#dependent-clauses), not this join.
- **No gapping / shared arguments** across conjuncts. Repeat material, or use word-level coordination inside one clause.
- **Not subordination:** *because* / *if* / *although* stay `/h/` + `/b/` [next-clause pronoun](pronouns.md#special-pronouns).
- **Not general *but* / *however* / *therefore*:** those are other `/x/` linkers. Word- and clause-level *but not* / *except* (**el** / **xel**) and *instead* (**em** / **xem**) **are** this series.
