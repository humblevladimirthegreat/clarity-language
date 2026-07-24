# Coordination

This page is the source of truth for **phrase-level** (same-slot left fence), **VP-level**, and **clause-level** coordination. There is **no** bare word-level coordinator series. Correlatives (*both…and*, *either…or*) come later. Asymmetric discourse glue (*but*, *however*, *therefore*) is `/x/` but **not** this vowel series — see [language-reference.md](language-reference.md#discourse-markers-x). (*But not* / *except* and *instead of* **are** this series — vowel **e** below.)

PoS prefixes and ordinary word shape: [language-reference.md](language-reference.md). Reference suffixes: [reference-suffix.md](reference-suffix.md). Phonotactics for reserved coordinator roots: [phonology.md](phonology.md#phonotactics).

**List shapes:** **Phrase-level** (NP / AP / `/b/` / `/w/` / `/h/`, and single-word siblings in those slots) uses a **left fence**: one prefixed coordinator, then optional shared modifiers, then juxtaposed conjuncts — **no** `-r`. **VP-level** and **clause-level** share **left-open opener / `-r` continue** — see [opener / `-r`](#opener-r-coordination). Do not borrow `-r` nesting into phrase-level chains.

These forms are **joiners** (boolean lists plus directional exclusion/replacement), not only symmetric conjunctions.

## Join type × ending (shared)

**Vowel(s)** choose join type. All coordinators take an ending (no bare vowel) and a **PoS prefix** matching the slot. For **a** / **o** / **u** / **ao**, **-l** / **-m** mark **closure**. Phrase-level **-n** marks a **named / conventional** list. **VP-level** and **clause-level** **-n** mark **soft packaging** (not named); **-r** continues an open list — see [opener / `-r`](#opener-r-coordination). For **e**, **-l** / **-m** pick **exception** vs **replacement** (no **-n** on **e** at any level).

### Join type (vowel series)

| Vowel / writing | Meaning |
|-----------------|---------|
| **a** / `a` | *and* |
| **o** / `o` | exclusive *or* (pick **one**) |
| **u** / `u` | *nor* (none of the conjuncts) |
| **a** + **o** / `ao` | inclusive *and/or* (one **or** more) |
| **e** / `e` | exception or replacement (which one = ending; below) — **directional**, not a symmetric *and*/*or* |

### Closure ending (**a** / **o** / **u** / **ao** only)

| Ending | Meaning |
|--------|---------|
| **-l** | **Closed** (exhaustive) — the listed conjuncts are treated as the **only** ones in play for this claim (Claritish *eor*-style completeness). |
| **-m** | **Open** (non-exhaustive) — other conjuncts may exist (*among others*, *including but not limited to*; Claritish *ior*-style). |

When unsure whether the list is complete, prefer **-m** (open). Use **-l** when you stand behind completeness (inventories, forced-choice menus, definitions).

### Named / conventional ending (phrase-level **a** / **o** / **u** / **ao** only)

| Ending | Meaning |
|--------|---------|
| **-n** | **Named / conventional list** — the conjuncts are invoked as an established titled, formulaic, or canonical bundle (*the primary colors*, *RGB*, *stop–drop–roll*), not as a freshly composed open or closed inventory. |

**-n** is an alternative to **-l** / **-m**, not a third completeness tier and not stackable with them. Completeness is whatever the conventional designation already fixes; you are naming the bundle, not arguing list closure in the moment. Same mnemonic as content-word [proper name **-n**](reference-suffix.md#proper-name--n): definite by established label. Used on **phrase-level** coordinators (`/z/` `/d/` `/b/` `/ɡ/` `/w/` `/h/`) — **not** on VP `/v/` or clause `/x/` forms (those use soft **-n** instead).

**Not on phrase-level `e`:** exception / replacement stay `zel` / `zem`, `del` / `dem`, `bel` / `bem`, `gel` / `gem`, `wel` / `wem`, `hel` / `hem` only. **Not on VP/clause `e`:** **vel** / **vem** / **ver** and **xel** / **xem** / **xer** only (no soft **-n**). Soft packaging (`van`…, `xan`…) is not a named list — use other `/x/`…**-n** thread labels if you need a titled agenda item.

### Exception vs replacement (**e** only)

On **e**, **-l** / **-m** do **not** mark closure. They choose the relation (mnemonic: **-l** crisp cut, **-m** stand-in / rewrite). **`e` is a directional list operator**, not a boolean conjunction: order matters; the **last** conjunct is the pivot.

| Ending | Form | Meaning | Reading |
|--------|------|---------|---------|
| **-l** | phrase: `zel` / `del` / `bel` / `gel` / `wel` / `hel`; opener: `vel` / `xel` | **Exception** — base holds **excluding** the last conjunct (*but not* / *except*) | `zel A B` → *A but not B*; `zel A B C` → *A and B, except C* |
| **-m** | phrase: `zem` / `dem` / `bem` / `gem` / `wem` / `hem`; opener: `vem` / `xem` | **Replacement** — the last conjunct **takes the place of** what precedes (*instead of*) | `zem A B` → *B instead of A*; `zem A B C` → *C instead of A and B* |

Non-final conjuncts are the **base** (as if joined by open *and*). The **last** conjunct is the exception or the replacement. Opener/`-r` chains use the same pivot rule; `-r` extends the pivot set (`vel A ver B ver C` → *A, except B, and except C*).

### Exclusivity and *nor*

- **Exclusive (`o`)** — pick **one** of the conjuncts, not more than one.
- **Inclusive (`ao`)** — one **or** more of the conjuncts may hold (English *and/or*). Built by combining **a** with **o**; bare **o** stays exclusive.
- ***Nor* (`u`)** — **none** of the conjuncts hold (*neither…nor…*). The realized set from the list is empty. **-l** vs **-m** still marks whether that denial is limited to the listed items (**…ul**) or leaves room for further denials outside the list (**…um**); **-n** names a conventional denial bundle.

**a** is ordinary conjunction (*and*), not an *or*. Phrase-level **a** / **o** / **u** / **ao** take **-l**, **-m**, or **-n** (named); **e** takes **-l** or **-m** only; those forms never take **-r**. VP-level and clause-level **a** / **o** / **u** / **ao** take **-l**, **-m**, soft **-n**, or continue **-r**; **e** takes **-l**, **-m**, or **-r** only. Soft **-n** is **not** used on **e**.

There are **no** bare (prefix-less) coordinators. Forms like `am`, `al`, `el` without a PoS prefix are **not** legal joiners.

---

# Phrase-level coordination (left fence)
<a id="np-level-coordination"></a>
<a id="ap-level-coordination"></a>
<a id="phrase-level-coordination"></a>

Phrase-level coordinators join **same-slot** conjuncts (single words or multi-word phrases) with a **left fence**: the prefixed coordinator comes **first**, then optional **shared** modifiers next to the fence, then the juxtaposed conjuncts. Same vowel series and endings as above (**-l** / **-m** / **-n** on **a** / **o** / **u** / **ao**; **-l** / **-m** on **e** — **not** `-r`, and not plural **-sh**). Slots differ only in **which prefix** the coordinator takes and **what counts as a conjunct**.

**Left fence — not VP/clause opener/`-r`.** One prefixed coordinator opens the list. No mid-chain particle, no `-r` continue. Do not write `zam A zar B` or `A zam B` for a flat phrase list — use `zam A B` (and `zam SHARED A B` when sharing modifiers).

## Forms

Word shape: role prefix + vowel root (+ second vowel for inclusive forms) + ending.

| Prefix | What is coordinated |
|--------|---------------------|
| `/z/` | subject NP (single word or multi-word) |
| `/d/` | direct-object NP |
| `/b/` | argument NP (of a complex `/ɡ/` or `/h/`) |
| `/ɡ/` | adjective phrase (one `/ɡ/` stack position on a host) |
| `/w/` | adjective-adjunct chain on one host `/ɡ/` |
| `/h/` | adverb unit chain (one floating contiguous unit) |

Writing: `zal` / `zam` / `zan` / … / `zel` / `zem`; same under `/d/`, `/b/`, `/ɡ/` (`gal` / `gam` / …), `/w/` (`wal` / `wam` / …), `/h/` (`hal` / `ham` / …). Inclusive: `zaol` / `zaom` / `zaon`, `daol`…, `gaol`…, `waol`…, `haol`… (spoken **a** then **o** then ending).

The prefix on the coordinator **must match** every conjunct head (`/z/` with `/z/`, `/ɡ/` with `/ɡ/`, and so on).

## Shape (left fence)

```
P-COORD  ( SHARED )*  PHRASE  PHRASE  ( PHRASE )*
```

- **P-COORD** — one of the prefixed forms above (`zam`, `dol`, `bem`, `gam`, `wam`, `ham`, …). Appears **only once**, **before** the conjuncts (and before any shared modifiers).
- **SHARED** — optional material **immediately after** `P-COORD`, **before** the first conjunct. **Always** scopes over the **whole coordinated phrase** (NP: `/ɡ/` / `/w/` / complex `/ɡ/`+`/b/`; AP: `/w/`; `/w/`-slot and `/h/`-slot joins: further same-slot material only if the lexicon allows stacking on the join as a unit). Shared `/ɡ/` / `/w/` here sit **before** the heads they grade — the fence defines the host unit.
- **PHRASE** — a conjunct: NP headed by `/z/`, `/d/`, or `/b/` (plus that head’s following local `/ɡ/` / `/w/` / `/b/` material); AP headed by `/ɡ/` (plus contiguous `/b/`, further `/ɡ/` on that `/b/`, and local `/w/`); or a single `/w/` / `/h/` word (plus `/h/`’s contiguous `/b/` when complex). Local modifiers stay **inside** their conjunct, after that conjunct’s head.
- Two conjuncts: `P-COORD  PHRASE  PHRASE`. Three or more: `P-COORD  PHRASE  PHRASE  PHRASE`.
- Single-word siblings use the same shape: `zam z-dogl z-catl` (*a dog and a cat* — open).

**Exception / replacement** (`zel` / `zem`, …): last phrase is the pivot — see [exception vs replacement](#exception-vs-replacement-e-only).

### Scope fence (`P-COORD`)

**Rule:** A modifier **immediately after** a phrase-level conjunction (`zam`, `gam`, `dam`, …), **before** the first conjunct, modifies the **entire coordinated phrase**.

- Modifiers **after a conjunct head** (and before the next matching-role head) belong to that conjunct only.
- Modifiers in the **SHARED** slot scope over **all** conjuncts as one unit.

Contrast:

- `zam z-dogl z-catl g-bigl` → *(dog) and (big cat)* — big follows the last head → last conjunct only
- `zam g-bigl z-dogl z-catl` → *a big (dog and cat)* — big immediately after the fence → whole phrase
- `zam z-dogl g-bigl z-catl` → *(big dog) and (cat)* — big local to dog
- `gam w-veryl g-happyl g-proudl` → *very (happy and proud)* — `/w/` after `gam` grades the whole AP join
- `gam g-happyl w-veryl g-proudl` → *(very happy) and (proud)* — `/w/` local to first `/ɡ/`

Complex adjective on an NP bundle: `zam g-ofl b-Samn z-dogl z-catl` → *Sam’s (dog and cat)* — the complex `/ɡ/`+`/b/` in SHARED owns the whole join.

### End of list

- **Leaving the role** — a following word with a **different** clause/role prefix that is not local modifier material ends the list (e.g. after a `/z/` join, `/d/`, `/v/`, `/h/` as clause adverb, `/j/`, `/x/`, …).
- **Same-prefix absorb** — after `P-COORD`, every following matching-role head (plus its local modifiers) is a **conjunct** until the list ends. For AP `/ɡ/` on one host, that means you cannot stack an extra non-coordinated `/ɡ/` on the same noun after a `gam`… join; put further description in another sentence, or include it as another conjunct. Same absorb rule for `/w/` and `/h/` left-fence chains.
- **Floating `/h/` inside an NP/AP/`/b/` join** — clause-level `/h/` (simple or `/h/`+`/b/`) is **transparent**: it does not end the list and is not a conjunct; a later matching-role head is still a conjunct. (VP-chain `/h/` scope is different — see [VP-level](#vp-level-coordination).)

### Examples (schematic)

**NP**

- `zam z-dogl g-bigl z-catl g-redl` — *(big dog) and (red cat)* — open; each color inside its conjunct
- `zal z-dogl g-bigl z-birdl z-catl g-redl` — *(big dog), (bird), and (red cat)* — closed three-way NP list
- `zam z-bookl g-onl b-tablel z-penl g-onl b-deskl` — *(book on the table) and (pen on the desk)*
- `bam b-tablel b-shelfl` under one complex adjective — *on (the table and the shelf)*
- `dam d-dogl g-bigl d-catl` — *(big dog) and (cat)* as **object** (open)
- `dam g-bigl d-dogl d-catl` — *a big (dog and cat)* as object — shared after the fence
- `zel z-dogl g-redl z-catl g-bluel` — *(red dog) but not (blue cat)*
- `zem z-dogl g-bigl z-catl g-redl` — *(red cat) instead of (big dog)*

**AP**

- `gam g-happyl w-veryl g-proudl w-slightlyl` — *(very happy) and (slightly proud)* — each degree inside its conjunct
- `gam g-onl b-tablel g-ofl b-Samn` — *(on the table) and (Sam’s)* — two complex APs on one host
- `gal g-redl g-softl g-warml` — *red, soft, and warm* — closed three-way AP list (absorb-all; no further bare `/ɡ/` on that host after this join)
- `gan g-redl g-yellowl g-bluel` — *red, yellow, and blue* as the conventional primary-color bundle (named **-n**)
- `gel w-veryl g-happyl g-angryl` — *very (happy but not angry)* — shared degree after the fence

**`/w/` / `/h/`**

- `wam w-veryl w-recentl` on a preceding `/ɡ/` — *very and recently* (open adjunct chain) as one stack on that adjective
- `ham h-quicklyl h-quietlyl` — *quickly and quietly* as one floating adverb unit (open)

## Constraints

- **One slot** — the chain is a single subject, object, `/b/` argument, `/ɡ/` stack position, `/w/` stack, or `/h/` floating unit in the clause.
- **Matching role prefix** on every conjunct head and on the coordinator.
- **Coordinator first** — never after the last conjunct; never mid-chain before the last phrase.
- **Shared modifiers** — only in the slot immediately after `P-COORD`; local modifiers stay after their own heads.
- **No `-r`**, no clause soft **-n**, no plural **-sh** on the coordinator.
- **Not** verb+object packages — use [VP-level](#vp-level-coordination); **not** full sentences — those stay `/x/`…
- **Not** mixed-PoS joins; correlatives; `/x/` sentence linkers (*however*, *therefore*), general adversative *but*, quotation fences, or [numbered enumeration](numbers.md#number-as-discourse-marker-by-marker). Phrase-level *but not* / *except* and *instead of* **are** this series (`zel` / `zem`, …).

## Reserved forms

Under `/z/`, `/d/`, `/b/`, `/ɡ/`, `/w/`, and `/h/`, the coordination vowel series plus an allowed ending (`zal`, `zam`, `zan`, … `zel`, `zem`, `dal`, … `gal`, `gam`, … `wal`, … `hal`, `ham`, … `hel`, `hem`) are **only** these phrase coordinators — not ordinary content words with those vowel roots. Other roots under those prefixes are unchanged.

---

# Opener / `-r` coordination (VP and clause)
<a id="opener-r-coordination"></a>
<a id="vowels--endings"></a>
<a id="ending-senses-clause-coordinators"></a>

**VP-level** (`/v/`) and **clause-level** (`/x/`) share one **left-open** list shape: the opener comes **first**, then the first conjunct, then **-r** before **every** further conjunct (including the second). **-l** / **-m** / soft **-n** open a new list; **-r** continues it. This is **not** [phrase-level left fence](#phrase-level-coordination) (phrase juxtaposes after the fence with no `-r`). Do not write `vam A B` without `var`, and do not put a conjunct before the opener.

Join-type vowels are the same as elsewhere. Endings use soft **-n** and continue **-r**, not phrase named **-n**.

## Forms

Word shape: prefix + vowel root (+ second vowel for inclusive forms) + ending. Writing glues inclusive vowels (`vaol`, `xaol`, …). Spoken order is **a** then **o**, then the ending — same as phrase-level `zaol` / `gaol`.

| | **-l** | **-m** | **-n** soft | **-r** continue |
|---|--------|--------|-------------|-----------------|
| **a** (*and*) | `val` / `xal` closed | `vam` / `xam` open | `van` / `xan` | `var` / `xar` |
| **o** (xor) | `vol` / `xol` closed | `vom` / `xom` open | `von` / `xon` | `vor` / `xor` |
| **u** (*nor*) | `vul` / `xul` closed | `vum` / `xum` open | `vun` / `xun` | `vur` / `xur` |
| **ao** (and/or) | `vaol` / `xaol` closed | `vaom` / `xaom` open | `vaon` / `xaon` | `vaor` / `xaor` |
| **e** (exception / replacement) | `vel` / `xel` exception | `vem` / `xem` replacement | *(not used)* | `ver` / `xer` |

Prefix: **`/v/`** for [VP-level](#vp-level-coordination); **`/x/`** for [clause-level](#clause-level-coordination).

## Ending senses

**-l**, **-m**, and **-n** always **start a new list** (where that ending is allowed). They never extend an open list. **-r** is the **only** way to add another conjunct to the list most recently opened by a matching root. Continuations inherit the opener’s join type and its **-l** / **-m** reading (closure, or exception vs replacement). A second **-l** / **-m** / **-n** nests (right-associative).

- **-l** / **-m** on **a** / **o** / **u** / **ao** — Open a **new**, **committed** list with **closed** (**-l**) or **open** (**-m**) completeness (`val` / `xal` = both hold, full set; `vom` / `xom` = pick one, other options may exist; and so on).
- **-l** / **-m** on **e** — Open a **new**, **committed** exception or replacement join (not closure). Non-final items are the **base**; **-r** items are pivots (same [pivot rule](#exception-vs-replacement-e-only) as phrase-level):
  - **`vel` / `xel`** — *but not* / *except*: `vel A var B` → *A, but not B*; `vel A var B var C` → *A, except B, and except C*.
  - **`vem` / `xem`** — *instead*: `vem A var B` → *B instead of A*; further `-r` pivots continue successive replacement.
- **-n** — Opens a **new** list with **soft** packaging (**a** / **o** / **u** / **ao** only): **narrative sequence** (**a**) or **uncertain reconstruction** (the others) — not a second boolean table, and not dramatic metaphor. **Different from phrase `-n`:** soft packaging, not named/conventional list (phrase-level **zan** / **gan** / …). Soft lists do **not** carry a separate closed/open bit; treat completeness as open-leaning unless you upgrade to a committed **-l** / **-m** opener (optionally with `/h/` evidential hedges). Per vowel:
  - **`van` / `xan`** (*and*) — *and then…* (temporal / story sequence, not mere logical *and*).
  - **`von` / `xon`** (*xor*) — *or maybe…* — uncertain alternatives (typically without claiming those are all the guesses).
  - **`vun` / `xun`** (*nor*) — *and it wasn’t… either* / *nor, as I recall…* — soft denial chain while reconstructing what did not hold.
  - **`vaon` / `xaon`** (*and/or*) — *and/or maybe…* — soft multi-fit without a hard completeness claim.
  - **Not on `e`:** uncertain exception or replacement uses **`vel` / `xel`** or **`vem` / `xem`** plus `/h/` evidentiality, not **-n**.
- **-r** — **Continues** the most recently opened list whose root matches (`va…` / `xa…`, `vo…` / `xo…`, `ve…` / `xe…`, …). Required before **every** non-initial conjunct (the second item and beyond). On `/x/`, fits “same linker again” — see [pronouns.md](pronouns.md).

Titled / official discourse labels stay **other** `/x/`…**-n** forms (different roots, not this vowel series) — see [reference-suffix.md](reference-suffix.md#discourse-markers-x).

## Shape

```
OPEN  ITEM  ( CONT  ITEM )+     ← one flat list (left-open; at least two conjuncts)
```

- **OPEN** — **-l**, **-m**, or **-n** where allowed (`val` / `xal`, `vam` / `xam`, `van` / `xan`, `vel` / `xel`, …). Always begins a **new** list. There is **no** conjunct before the opener.
- **ITEM** — a [VP](#vp-level-coordination) or a full [sentence](#clause-level-coordination), depending on level.
- **CONT** — **-r** only (`var` / `xar`, `vor` / `xor`, `ver` / `xer`, …). Required before each non-initial item. Do **not** use another **-l** / **-m** / **-n** if you mean “one more item in this list.”

**Flat list** — open once, then only **-r**:

- Two: `vam A var B` / `xam A xar B` → *A and B* (open)
- Two closed: `val A var B` / `xal A xar B` → *A and B* (closed)
- Three+: `val A var B var C` / `xal A xar B xar C` → one closed *and*-list of three
- Soft sequence: `van A var B var C` / `xan A xar B xar C` → *A and then B and then C*
- Exception: `vel A var B` / `xel A xar B` → *A, but not B*; with continue: `xel A xar B xar C`
- Replacement: `vem A var B` / `xem A xar B` → *B instead of A*

**Nesting** — a second **-l** / **-m** / **-n** starts an inner list; reading is **right-associative**:

- `vol A vol B var C` / `xol A xol B xor C` → *A or (B or C)* — two lists, not one three-way *or*
- `val A vol B var C var D` / `xal A xol B xor C xor D` → *A and (B or C or D)*

To get a flat three-way *or*, write `vol A vor B vor C` / `xol A xor B xor C`, not `vol A vol B var C` / `xol A xol B xor C`.

---

# VP-level coordination

VP-level coordinators join **verb phrases** inside one clause: each conjunct is a verb plus that verb’s own object material (`/d/` NP, including phrase-level structure on the object), unless a shared object sits before the opener (below). They share one clause subject (`/z/`) and one [clause force](language-reference.md#utterance-markers-j). The coordinator prefix is always **`/v/`**. Forms, ending senses, and flat/nested shape: [opener / `-r`](#opener-r-coordination).

## Conjuncts and scope

- **VP** — one verb (`/v/` content word) plus that verb’s own `/d/` object material when present (simple object or [phrase-level](#phrase-level-coordination) object chain). Object NPs may include their `/ɡ/` / `/w/` / `/b/` stacks. The shared `/z/` subject is **outside** the VP chain.
- **Shared object (verb-only conjuncts)** — when every conjunct is a bare verb (no per-conjunct `/d/`), a `/d/` **immediately before** the opener scopes over **all** verbs alike: `d-applel vam v-washl var v-eatl` → *washed and ate an apple*. If any conjunct carries its own `/d/`, do not use a pre-opener shared object; put objects inside each conjunct.
- **`/h/` scope relative to the opener**
  - **`/h/` before the VP opener** (outside the chain) → applies to **every** conjunct (*quickly washed and ate*).
  - **`/h/` inside a conjunct** (after that conjunct begins, before the next `var` / … or end of chain) → applies to **that VP only**.
  - **`/h/` after the whole VP chain** → attaches to the **last** conjunct only. For shared manner/mood over all VPs, put `/h/` before the opener.
- Other non-VP clause material (subject, clause force) stays outside the chain.

### Examples (schematic)

- `vam d-applel v-eatl var d-waterl v-drinkl` → *(ate an apple) and (drank water)* (open)
- `val d-applel v-eatl var d-waterl v-drinkl var d-breadl v-bakel` → closed *and* of three VPs
- `van v-runl var v-jumpl var v-restl` → *ran and then jumped and then rested*
- `vel d-applel v-eatl var d-cakel v-eatl` → *ate an apple, but not ate a cake*
- `vem d-applel v-eatl var d-waterl v-drinkl` → *drank water instead of ate an apple*
- `h-quicklyl vam d-applel v-eatl var d-waterl v-drinkl` → *quickly* *(ate an apple and drank water)*
- `vam d-applel v-eatl h-quicklyl var d-waterl v-drinkl` → *(quickly ate an apple) and (drank water)*
- `d-applel vam v-washl var v-eatl` → *washed and ate an apple* (shared object before opener)

## Constraints

- **One clause** — one `/j/` force, one shared `/z/` subject (when present).
- **Each conjunct has its own verb**; objects are per-conjunct unless the shared-object-before-opener pattern applies.
- **`/h/`** follows the before-opener / inside-conjunct / after-chain rules above.
- **No gapping** of subject or object across VPs (beyond the shared-object pattern).
- **No `-sh`** on the coordinator.
- **Left-open** — opener first; `-r` before every non-initial VP.
- **Not** full sentences — those stay `/x/`…; **not** phrase-level NP/AP joins — those stay [phrase-level](#phrase-level-coordination).

## Reserved forms

Under `/v/`, the coordination vowel series plus an allowed ending (`val`, `vam`, `van`, `var`, … `vel`, `vem`, `ver`) are **only** these VP coordinators — not ordinary content verbs with those vowel roots. Other roots under `/v/` are unchanged.

---

# Clause-level coordination

Clause-level coordinators join **full sentences**. They are **`/x/`** discourse markers whose **root is the same vowel series** as phrase- and VP-level coordination. They take a [reference-suffix letter](reference-suffix.md): **-l**, **-m**, **-n**, or **-r** (**-n** not on **e**). They do **not** take plural **-sh**. Forms, ending senses, and flat/nested shape: [opener / `-r`](#opener-r-coordination) (**left-open**, same as VP).

Endorsement strength and evidentiality stay on each clause’s `/h/` (or `/w/`), not on the coordinator.

## Conjuncts

- **SENT** — a complete sentence beginning with `/j/` (optional vocative(s) / interjection(s), then clause force, then clause body).
- The opener appears **before the first sentence**; **-r** appears before every further sentence in the chain.

### Examples (schematic)

- `xal A xar B` → *A and B* (closed); `xam A xar B` → open
- `xal A xar B xar C` → *A and B and C* (one closed *and*-list)
- `xol A xor B xor C` → *A or B or C* (one closed *xor*-list)
- `xan A xar B xar C` → *A and then B and then C*
- `xel A xar B` → *A, but not B*; `xem A xar B` → *B instead of A*
- Nesting: `xol A xol B xor C` → *A or (B or C)*; flat three-way *or* needs `xol A xor B xor C`

## Constraints

- **Same clause force** on every conjunct (all statements, all polar questions, or all imperatives). Mixed force → separate sentences or [subordination](language-reference.md#dependent-clauses), not this join.
- **No gapping / shared arguments** across conjuncts. Repeat material, or use phrase-level (NP / AP / …) or VP-level coordination inside one clause.
- **Not subordination:** *because* / *if* / *although* stay `/h/` + `/b/` [next-clause pronoun](pronouns.md#special-pronouns).
- **Not general *but* / *however* / *therefore*:** those are other `/x/` linkers. Phrase-, VP-, and clause-level *but not* / *except* (**zel** / **gel** / **vel** / **xel**, …) and *instead* (**zem** / **gem** / **vem** / **xem**, …) **are** this series.

## Reserved forms

Under `/x/`, the coordination vowel series plus an allowed ending (`xal`, `xam`, `xan`, `xar`, … `xel`, `xem`, `xer`) are **only** these clause coordinators — not other discourse-marker roots with those vowels. Other `/x/` roots are unchanged.
