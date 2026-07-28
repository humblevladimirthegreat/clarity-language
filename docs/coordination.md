# Joins

**Joins**, **revisers**, and **restrictors** share the **join series** (vowels + endings). A **join** is a prefixed fence over same-slot material. A **reviser** is a prefix-less form: in-clause repair of a fixed left side, or discourse glue before clause force (*additionally* / …). A **restrictor** is a join-series spelling under `/h/` or `/w/` that limits when the host applies. Joins split into **set joins** (**a** / **o** / **ao** / **u** / **ua** / **uo**) and **rank joins** (**e** / **ae** / **oe** / **ue**). Arity: **bare** (0 conjuncts) / **focus** (1) / **list** (2+).

This page is the source of truth for **phrase-level** (same-slot fence: left preferred, right close allowed), **VP-level**, and **clause-level** joins. **Revisers** (prefix-less **al** / **am** / …): [revisers.md](revisers.md). **Restrictors** (`/h/` `/w/`): [restrictors.md](restrictors.md). There is **no** prefix-less **join** series (lists still need a PoS prefix + ending). Correlatives (*both…and*, *either…or*) come later. Asymmetric discourse glue (*but*, *however*, *therefore*, *meanwhile*, *next*) is `/x/` but **not** the prefixed join series — see [language-reference.md](language-reference.md#discourse-markers-x). [Revisers](revisers.md) (**al** / **am** / **an** / **el** / … — ending required) cover in-clause *including* / *rather* / *instead* / *except* and, before clause force, discourse *additionally* / *in other words* / *instead* / *except*. *Starting with* = **`x#e-l`**, *Finally* = **`x#el`** ([numbers.md](numbers.md#number-as-discourse-marker-by-marker)). [Comparatives / superlatives / equatives](comparatives.md) reuse NP fences with SHARED `/ɡ/` as scale (ranked **`e` / `oe` / `ue`** = *more / …-est*; **`ae`** = *as … as*; set **`a`** distributes SHARED `/ɡ/`). [Number ranges](numbers.md#ranges) (SHARED continuum `/ɡ/` + two number endpoints) and [measure phrases](numbers.md#measure-phrases) live in **numbers.md**. [Generics / *every K*](#universals-domains-generics) reuse invert **ua** with SHARED `/ɡ/` as kind domain (`zual g-catl`); habitual characterizing uses **`hual`**.

PoS prefixes and ordinary word shape: [language-reference.md](language-reference.md). Reference suffixes: [reference-suffix.md](reference-suffix.md). Phonotactics for reserved join roots: [phonology.md](phonology.md#phonotactics). Interrogative readings of these forms: [questions.md](questions.md).

**List shapes:** **Phrase-level**, **VP-level**, and **clause-level** all use a **fence**: prefixed join plus optional shared modifiers **immediately after** that join; conjuncts juxtaposed (no mid-chain continue particle). **-r** on **a** / **o** / **e** / **u** is the [unspecified-member](#unspecified-member-r-phrase) series at every level (*something* / *anything* / *whatever-by-rank* / *something else* — VP: *do something* / …; clause: *something happened* / …). Plain **u** = [negation](#negation-u) (*not* / *none of* / bare *no*). Leading **u** on **a** / **o** / **e** = [invert](#invert-u-stacks) (*everything but* / *anything but* / **rank reversal**). **Left fence** (join before the conjuncts) is preferred; **right close** (join after the conjuncts) is allowed for style or comedy. **Nesting** uses extra fences: left stack = right-associative, right stack = left-associative; **pure infix is illegal** — see [fence nesting](#fence-nesting).

Prefixed forms are **joins** — **set joins** (**a** / **o** / **ao** / **u** / **ua** / **uo**) and **rank joins** (**e** / **ae** / **oe** / **ue**) — except under **`/h/`** and **`/w/`**, where the same forms are [restrictors](restrictors.md) (applicability), not sibling *and* of modifiers. Prefix-less **al** / **am** / **an** / **el** / **em** / **en** / **ol** / **om** / **on** / **ul** / **um** / **un** are a separate **reviser** series — see [revisers.md](revisers.md).

## Join series × ending (shared)
<a id="join-series-ending-shared"></a>
<a id="join-type--ending-shared"></a>

**Vowel(s)** choose set vs rank (plus invert / negation). All joins take an ending (no bare vowel) and a **PoS prefix** matching the slot. For every join vowel (**a** / **o** / **u** / **ao** / **e** / **ae** / **oe** / **ua** / **uo** / **ue**), **-l** / **-m** mark **closure**. Phrase-level **-n** marks a **named / conventional** list on **`/z/` `/d/` `/b/` `/w/`** only. **`/ɡ/`…**-n** and **`/h/`…**-n** are closed [join-relations](special-vocabulary.md#join-relations) (not joins). **Clause-level** **-n** marks **soft packaging** (not named) — see [soft **-n**](#soft-n-clause). **VP-level** has **no** join **-n**: those spellings (`van`, `von`, …) are closed [join-act verbs](special-vocabulary.md#join-act-verbs). **-r** on **a** / **o** / **e** / **u** marks an [unspecified member](#unspecified-member-r-phrase) at **every** level (*something* / *anything* / *whatever-by-rank* / *something else*). Plain **u** is [negation](#negation-u) at all arities.

### Join series (vowels)

Atomic vowels have fixed **names**. Stacked names are derived from those atomics in **spoken order**: leading **a** → *co-…*; leading **u** → *counter-…*; **oe** = **choice** then **rank** → **choicerank**.

| Vowel / writing | Family | Name | Meaning |
|-----------------|--------|------|---------|
| **a** / `a` | **set** | **additive** | inventory *and* |
| **o** / `o` | **set** | **choice** | exclusive *or* — **-ol** / closed: pick **exactly one**; **-om** / open: pick **at most one** (*or none* / empty-allowed; other exclusives may exist) |
| **u** / `u` | **set** | **negation** | focus *not X*; list *none of*; bare *no* |
| **a** + **o** / `ao` | **set** | **cochoice** | inclusive *and/or* (one **or** more) |
| **e** / `e` | **rank** | **rank** | earlier outranks later (*A ≻ B ≻ C*); **directional**; exclusivity **not** claimed |
| **a** + **e** / `ae` | **rank** | **corank** | **equality / tie / equal rank**; with SHARED scale → [equative](comparatives.md#equatives) (*as … as*) |
| **o** + **e** / `oe` | **rank** | **choicerank** | **exclusive ranked** — pick / try **one** (*A else B else C*) |
| **u** + **a** / `ua` | **set** | **counteradditive** | ***everything but*** — domain **except** the listed (invert of **a**) |
| **u** + **o** / `uo` | **set** | **counterchoice** | ***anything but*** — free choice **outside** the listed (invert of **o**) |
| **u** + **e** / `ue` | **rank** | **counterrank** | **rank reversal** — later outranks earlier (*A ≺ B ≺ C*); exclusivity **not** claimed (invert of **e**) |

<a id="invert-u-stacks"></a>
<a id="empty-allowed-om"></a>
<a id="join-type-vowel-series"></a>

**Invert** (`u`-stacks / *counter-…*): leading **u** on **a** / **o** / **e** flips the base join — **counteradditive** (**ua**), **counterchoice** (**uo**), or **counterrank** (**ue**). This is **not** plain **u** ([negation](#negation-u): *not* / *none of* / bare *no*). Domain for **ua** / **uo** comes from context or SHARED `/ɡ/` (kind-as-property): bare `zual g-catl` → *every cat*; with exclusions `zual g-drinkl z-teal z-coffeel` → *every drink but tea and coffee* — see [universals, domains, and generics](#universals-domains-generics). **-m** on vowels other than plain **o** still only marks non-exhaustive listing (other unnamed conjuncts may exist) — it does **not** by itself allow *or none*. Empty-allowed / *or none* is **o**-specific: open **…om** only — see [empty-allowed **-om**](#empty-allowed-om). No **u** on plain **u**, and no **u** on stacked **ao** / **ae** / **oe** (no three-vowel **uao** / **uae** / **uoe** / **aoe**). No **-r** on any stacked form (**ao** / **ae** / **oe** / **ua** / **uo** / **ue**). Rank reversal is **ue** (**counterrank**) only — not an `/h/` adverb.

### Closure ending (all join vowels)

| Ending | Meaning |
|--------|---------|
| **-l** | **Closed** (exhaustive) — the listed conjuncts are treated as the **only** ones in play for this claim (Claritish *eor*-style completeness). |
| **-m** | **Open** (non-exhaustive) — other conjuncts may exist (*among others*, *including but not limited to*; Claritish *ior*-style). On plain **o** only, **-m** also marks [empty-allowed](#empty-allowed-om) (*or none*). |

When unsure whether the list is complete, prefer **-m** (open). Use **-l** when you stand behind completeness (inventories, forced-choice menus, definitions, full ranked ladders). Do **not** read **-m** on **a** / **ao** / **e** / **ae** / **oe** / **u** / **ua** / **uo** / **ue** as *or none* — only **`…om`** carries that bit.

### Named / conventional ending (phrase-level, all join vowels)
<a id="named--conventional-ending-phrase-level-all-join-vowels"></a>

| Ending | Meaning |
|--------|---------|
| **-n** | **Named / conventional list** — the conjuncts are invoked as an established titled, formulaic, or canonical bundle (*the primary colors*, *RGB*, *stop–drop–roll*, a conventional triage order), not as a freshly composed open or closed inventory. |

**-n** is an alternative to **-l** / **-m**, not a third completeness tier and not stackable with them. Completeness is whatever the conventional designation already fixes; you are naming the bundle, not arguing list closure in the moment. Same mnemonic as content-word [proper name **-n**](reference-suffix.md#proper-name--n): definite by established label. Used on **phrase-level** joins under **`/z/` `/d/` `/b/` `/w/`** — **not** on `/ɡ/` or `/h/` (those spellings are [join-relations](special-vocabulary.md#join-relations)), **not** on VP `/v/` ([join-act verbs](special-vocabulary.md#join-act-verbs)), and **not** on clause `/x/` (soft **-n** instead). Stock AP bundles use [mention](quotations.md) spans, not a `/ɡ/` named join. [Revisers](revisers.md) also use this named sense (`an` / `en` / `on` / `un`). Soft packaging (`xan`…, `xen`…) is not a named list — use other `/x/`…**-n** thread labels if you need a titled agenda item. Narrative *and then* between clauses is **`xan`**, not a VP join.

### Unspecified-member ending (phrase-level, **a** / **o** / **e** / **u**)
<a id="unspecified-member-r-phrase"></a>
<a id="unspecified-member-r-phrase-a--o"></a>
<a id="something-anything-r"></a>

Prefixed **-r** on **a** / **o** / **e** / **u** marks an **unspecified member of a domain** — not content-word anaphor **-r**, and not stackable with **-l** / **-m** / **-n**. Same series on **phrase** (`/z/` `/d/` `/b/` `/ɡ/` `/w/` `/h/`), **VP** (`/v/`), and **clause** (`/x/`). Other join vowels (**ao** / **ae** / **oe** / **ua** / **uo** / **ue**) take **no** **-r**.

| Vowel | Form | Series | Domain reading |
|-------|------|--------|----------------|
| **a** | `zar` / `dar` / `bar` / `gar` / `war` / `har` / **`var`** / **`xar`** | ***something*** — existential unspecified member of an inventory frame | bare: unrestricted; focus: kind = the conjunct; list: among the listed conjuncts |
| **o** | `zor` / `dor` / `bor` / `gor` / `wor` / `hor` / **`vor`** / **`xor`** | ***anything*** — free-choice / indifferent pick-one from a menu frame | same arity pattern; free-choice, not epistemic “I don’t know which” |
| **e** | `zer` / `der` / `ber` / `ger` / `wer` / `her` / **`ver`** / **`xer`** | ***whatever-by-rank*** — free choice *by preference* (unnamed top / preferred member) | bare: unrestricted “what matters most”; focus: kind as a priority; multi: whichever ranks highest among the listed |
| **u** | `zur` / `dur` / `bur` / `gur` / `wur` / `hur` / **`vur`** / **`xur`** | ***something else*** / ***someone else*** — existential unspecified member **other than** the listed / salient set | bare: other than the context / SHARED domain; focus: something other than X; multi: some one **other than** the listed |

**VP / clause glosses** (same arity pattern; conjunct = VP or sentence). Under **question** force these are fill-asks — [questions.md](questions.md#fill-ask-r).

| | Bare | Focus | List |
|--|---------|-------|-------|
| **`var` / `xar`** | *do something* / *something happened* | *some (unspecified) X-ing* / *some (unspecified) claim in frame X* | *some one among these actions / claims* |
| **`vor` / `xor`** | *do anything* / *anything (may hold)* | *any X-ing* / *any claim of kind X* | *any of these* |
| **`ver` / `xer`** | *do whatever matters most* / *whatever matters most (as outcome)* | *preferentially some X-ing* / *X as priority claim* | *whichever ranks highest* |
| **`vur` / `xur`** | *do something else* / *something else happened* | *some doing / claim other than X* | *some one other than these actions / claims* |

**Arity** (same length rule as other focus / bare phrase forms):

| Length | **`…ar` (*something*)** | **`…or` (*anything*)** | **`…er` (*whatever-by-rank*)** | **`…ur` (*something else*)** |
|--------|-------------------------|------------------------|--------------------------------|----------------------------------|
| **0** (bare) | *something* / *someone* | *anything* / *anyone* | *whatever’s most important* / *whatever comes first* | *something else* / *someone else* |
| **1** (focus) | *some (unknown) X* / *an unspecified X* | *any X* | *X as a priority* / *preferentially some X* | *something other than X* |
| **2+** (list) | *some one among these* | *any of these* | *whichever of these ranks highest* / *the preferred one among these* | *some one other than these* / *something else besides these* |

Mnemonic: **-r** = member not named; vowel = frame (**a** = inventory existence; **o** = exclusive menu; **e** = ranked preference; **ae** = equality / tie; **u** = other than / else). Positive twins of bare emptiness: `zal` / `zam` → **`zar`**; `zol` / `zom` → **`zor`**; `zel` / `zem` → **`zer`** (*whatever matters*, vs *unspecified ranking* / *I don’t have a ranking*); `zael` / `zaem` → tie / draw frame (not **`zer`**). Among vs other-than: **`zar`** = some *among* these; **`zur`** = some *other than* these; **`zual…`** = *everything but* (universal other-than); bare **`zul` / `zum` / `zun`** = *not* / *none of* / *no* (negation, not an other-than pick). Domain for **`zur`** (like **`zual`**) comes from context or SHARED when not fixed by conjuncts.

**Contrast:**
- Content-word `-l`: `z-personl` = ordinary first-mention indefinite (*a person*). `zar z-personl` / `z-personl zar` = **explicitly non-identified** (*some person, unknown / unspecified who*). Do not use `zar` / `zor` where ordinary `-l` / `-m` introduction is enough.
- `zor A B C` = any of them is fine (**no** order). `zer A B C` = pick / take **by ranking** among them.
- `zar A B` = some one **among** A and B. `zur A B` = some one **other than** A and B. `zual A B` = *everything but* A and B (all other than these). `zul A B` = *none of* A or B.
- Revision **`ul` / `um`**: *except* a named right-hand side. Prefixed **`zur`**: unspecified *something else* / other than the listed, not an *except*-reviser. Prefixed **`zul` / `zum` / `zun`**: [negation](#negation-u) (*not X* / bare *no*), not revision *except*. Not antonymy (*the opposite of X*) — other than the named/listed only.

**Under [question](questions.md#interrogative-force) force:** these forms are **fill-asks** (content questions) — full tables, multi-gap **fill-all**, and answer shape: **[questions.md](questions.md#fill-ask-r)**. Ordinary negation is plain **u** ([negation](#negation-u)), not a separate `/h/` root. NPI-flavored *anything* (if needed later) is still not `zor` / `vor` / `xor` themselves — those are free-choice, not negative-polarity markers. *What’s wrong?* / *something’s amiss* is **not** this series — leftover lexicon (`/h/` or other root) if needed.

**-r** is a **whole-fence** join (`zar` / `var` / `xar` alone, or with conjuncts), same placement rules as `zam` / `vam` / `xam`. Do not write `zam A zar B` or `vam A var B` as a mid-chain extender.

### Rank join (**e** / **ae** / **oe** / **ue**)
<a id="ranked-conjunction-e"></a>
<a id="rank-joins"></a>
<a id="priority-ranking-e"></a>

**Rank joins:** bare **e** / **oe** are **directional** — earlier conjuncts outrank later ones (*A ≻ B ≻ C*). **ae** is **not** a directional ladder: multi **`ae`** = **equal rank / tie** among conjuncts; multi **`ae`** + SHARED scale = [equative](comparatives.md#equatives) (*as … as*). **ue** is [rank reversal](#invert-u-stacks): **later outranks earlier** (*A ≺ B ≺ C*). Built like **ao**: stack **a** or **o** onto **e** — **ae** = equality / tie (**a**+**e**); exclusive ranked is **oe** (**o**+**e**). There is **no** three-vowel **aoe** / **uae** / **uoe**. Reverse order is **ue** only (exclusivity unmarked; for reverse + exclusivity, nest or use `/h/` elsewhere — not a vowel stack). Co-satisfiable *wishlist* ladders (both may hold along the scale) use bare **e** — exclusivity unmarked.

| Vowel | Exclusivity | Direction / equality | Typical use |
|-------|-------------|----------------------|-------------|
| **e** | **not claimed** — ranking only | earlier ≻ later | descriptive / podium order; comparative ladders with SHARED scale |
| **ae** | **equal** — same rank / tie | **no order** among conjuncts; +SHARED scale = equative | tie / draw; *as ADJ as*; equal-priority claims |
| **oe** | **exclusive** — pick / try **one** | earlier ≻ later; bare +SHARED scale = [empty superlative](comparatives.md) | menu fallback (*burger else chicken*); *there is no biggest* at bare + scale |
| **ue** | **not claimed** | later ≻ earlier | ascending preference / build-up lists (*A ≺ B ≺ C*) |

English glosses still vary by frame — *prefer A over B*, or *A, else B* — but that **preference vs contingency** contrast is read from context (or marked elsewhere with `/h/`), **not** by a different ending. **oe** marks exclusive realization along a ladder; **ue** flips spoken order vs preference (not empty-allowed).

**-l** / **-m** / **-n** on **e** / **ae** / **oe** / **ue** are the same closure / named (phrase `/z/` `/d/` `/b/` `/w/`) or soft (**clause** `/x/` only) senses as on **a** / **o** / **u** / **ao** / **ua** / **uo**. VP `/v/`…**-n** spellings are [join-act verbs](special-vocabulary.md#join-act-verbs); `/ɡ/` `/h/`…**-n** are [join-relations](special-vocabulary.md#join-relations) — not soft joins. Fence chains keep ranking from **spoken conjunct order** (`vel A B C` → *A ≻ B ≻ C*, closed; `vuel A B C` → *A ≺ B ≺ C* i.e. *C ≻ B ≻ A*; same with `vael`… / `voel`… / `xel`…).

| Ending | Form | Reading |
|--------|------|---------|
| **-l** | phrase: `zel` / `zael` / `zoel` / `zuel` (and `/d/` `/b/` `/ɡ/` `/w/` `/h/`); VP/clause: `vel` / `vael` / `voel` / `vuel` / `xel` / … | Closed: `zel A B` → *A ≻ B*; `zael A B` → *A tied with B* / equative with scale; `zoel A B C` → *A ≻ B ≻ C* (exclusive); `zuel A B` → *A ≺ B* |
| **-m** | phrase: `zem` / `zaem` / `zoem` / `zuem` / …; VP/clause: `vem` / `vaem` / `voem` / `vuem` / … | Open twin of each closed form — others may exist; soft equative under **`zaem`** + scale |
| **-n** | phrase named: `zen` / `zaen` / `zoen` / `zuen` / … under `/z/` `/d/` `/b/` `/w/`; clause soft: `xen` / `xaen` / `xoen` / `xuen` / …; VP: `ven` / … = [join-act verbs](special-vocabulary.md#join-act-verbs); `/ɡ/` `/h/`: `gen` / `hen` / … = [join-relations](special-vocabulary.md#join-relations) | Phrase: **`zen`** = named **unspecified** ranking; **`zaen`** = named **draw** / tie; **`zoen`** = named exclusive order; clause soft — see [soft **-n**](#soft-n-clause) |

#### Comparatives, superlatives, and equatives
<a id="comparatives"></a>
<a id="superlatives"></a>
<a id="comparative-shared-scale"></a>
<a id="equatives"></a>

Scalar comparison — ranked **`e` / `oe` / `ue`** + SHARED scale (*bigger than* / *the …-est* / bare **`oe`** empty superlative), **`ae`** + SHARED scale (*as … as*), distributive set **`a`** + SHARED `/ɡ/`, [collective](plurality.md#collective-ascription) **`a`** + SHARED `/ɡ/`…**-sh**, and measured differentials — lives in **[comparatives.md](comparatives.md)**. Number spans — **`a` / `e` / `ue` / `ua`** + SHARED **continuum** `/ɡ/` + two number endpoints (*between* / *from…to…* / outside) — live in **[numbers.md § Ranges](numbers.md#ranges)** (bare `zel z+3l z+5l` stays preference, not a span). Fence morphology stays on this page; those pages are the source of truth for the scalar / span readings.

#### Focus and bare phrase-level
<a id="focus-phrase"></a>
<a id="unary-phrase"></a>
<a id="focus-ranked"></a>
<a id="unary-ranked"></a>
<a id="bare-phrase"></a>
<a id="nullary-phrase"></a>

A **one-conjunct** (**focus**) or **zero-conjunct** (**bare**) fence is allowed on phrase-level slots (`/z/` `/d/` `/b/` `/ɡ/` `/w/` `/h/`) for the forms below, and on **VP** / **clause** for **…ar** / **…or** / **…er** / **…ur** (`var` / `vor` / `ver` / `vur` / `xar` / …) **and** for negation **…ul** / **…um** / **…un** where that spelling is still a join (`zul` / `zum` / `zun` / `vul` / `vum` / `xul` / `xum` / `xun` — phrase **-n** named; clause **-n** soft; **`vun`** is a [join-act verb](special-vocabulary.md#join-act-verbs), not a VP join). The join alone (bare), or the join plus one conjunct (focus), fills the slot — optionally with **SHARED** after the join. All other VP/clause joins, and phrase joins outside the focus/bare set, stay **two or more** conjuncts.

**Arity pattern:** length 2+ = ordinary list (or, for **…ar** / **…or** / **…er**, unspecified member among the listed; for **…ur**, unspecified member **other than** the listed; for **…ul** / **…um** / **…un**, *none of* the listed); length 1 = focus / exhaustivity on that singleton, matching unspecified-member focus for **-r**, or [negation](#negation-u) focus *not X* for **…ul** / **…um** / **…un**; length 0 = emptiness in that join frame — except **…ar** / **…or** / **…er** / **…ur** (*something* / *anything* / *whatever-by-rank* / *something else*) and bare **…ual** / **…uol** (*everything* / *anything (goes)*), which are positive readings, not emptiness. Bare **…ul** / **…um** / **…un** are bare denial (*no*), not positive. On other bare forms, **-l** = empty **and claimed complete** for the frame; **-m** = empty **from the speaker’s list** (often epistemic) with residual existence or residual options outside what’s named; **-n** = named/conventional empty label.

**Under [question](questions.md#interrogative-force) force:** yes/no, offer, emptiness check, and fill-ask readings for these forms — **[questions.md](questions.md#yes-no-unary-nullary)** (multi-gap **fill-all**: [questions.md](questions.md#fill-all)).

**Rank — focus**

Under `/h/` / `/w/`, only the [defined core](restrictors.md) uses circumstance glosses (*only when X*, *never*, *always*, …); other focus/bare spellings under those prefixes are undefined here.

| Form | Focus reading | Contrast |
|------|---------------|----------|
| **…el** (`zel` / `del` / …) | *only X matters* / *X, period*; with SHARED scale → **superlative** (*X is the …-est* / *most …* of the domain); **number X** → [threshold *\< X*](numbers.md#numeric-thresholds) | Closed twin of **…em** — nothing else ranks for this claim; see [comparatives](comparatives.md) |
| **…em** (`zem` / `dem` / `bem` / `gem` / `wem` / `hem`) | *X first* / *mainly X*; with SHARED scale → open **superlative** (*X is most … among those that come to mind* / top so far); **number X** → soft *\< ~X* | Open preference — other ranks may exist; see [comparatives](comparatives.md) |
| **…ael** (`zael` / `dael` / …) | *X tied for* / *equal priority to X*; with SHARED scale → **not** equative (needs 2+ comparees) | Closed equal-rank singleton — tie frame on X, not a ladder |
| **…aem** (`zaem` / `daem` / …) | *X about tied for* / soft equal priority | Open twin of **…ael** |
| **…aen** (`zaen` / `daen` / …) | *X tied for* (stock) / conventional draw label on X | Named equal-rank singleton |
| **…oem** (`zoem` / `doem` / …) | *start with X* / *try X first* | Contingency / menu primary — not value ranking |
| **…oel** (`zoel` / `doel` / …) | *only try X* / *X with no listed fallback* | Closed twin of **…oem** — exclusive triage, no listed fallback (singleton already implies empty if X fails) |
| **…uel** (`zuel` / `duel` / …) | *X last, period* / *only X as least*; with SHARED scale → **least** (*X is the least …* of the domain); **number X** → [threshold *\> X*](numbers.md#numeric-thresholds) | Closed reverse-ranked — X is the sole bottom / ascending singleton; see [comparatives](comparatives.md) |
| **…uem** (`zuem` / `duem` / …) | *X last* / *mainly leave X for last*; **number X** → soft *\> ~X* | Open reverse-ranked — X is low on the ladder; other ranks may exist |
| **…en** (`zen` / `den` / …) | *X first* (stock) / *X, as usual* | Named / formulaic top item — **unspecified-ranking** label, not a draw (**…aen** = draw) |
| **…er** (`zer` / `der` / …) | *preferably some X*; **number X** → *some/whatever value \< X* | Unspecified preferred member of kind X — not a closed “only X” (**…el**); see [thresholds](numbers.md#numeric-thresholds) |

**Rank — bare**

| Form | Bare reading | Contrast |
|------|-----------------|----------|
| **…el** (`zel` / `del` / …) | *unspecified ranking* / *no ordered winner asserted*; with SHARED scale → **unspecified who’s top** on the scale (not empty superlative) | Closed — see [comparatives](comparatives.md) |
| **…em** (`zem` / `dem` / …) | *I don’t have a ranking* / *beats me what’s most important*; with SHARED scale → *unspecified who’s top, from me* | Open — same humility pattern as bare **…am** |
| **…ael** (`zael` / `dael` / …) | *it’s a draw* / *tie* / *equal ranking*; with SHARED scale → multi equative lives elsewhere (needs 2+ conjuncts) | Closed equal-rank outcome — no ordered winner |
| **…aem** (`zaem` / `daem` / …) | *probably a tie* / *looks even* | Open equal-rank — soft / speaker-side tie |
| **…aen** (`zaen` / `daen` / …) | *it’s a draw* (stock) / conventional tie label | Named / conventional equal-rank outcome |
| **…oem** (`zoem` / `doem` / …) | *not sure where to start* | Empty exclusive triage, open |
| **…oel** (`zoel` / `doel` / …) | *do nothing* / *don’t bother*; with SHARED scale → **empty superlative** (*there is no biggest*) | Closed empty exclusive triage without scale; empty superlative with scale — see [comparatives](comparatives.md) |
| **…oem** + SHARED scale | *no biggest comes to mind* | Open empty superlative |
| **…uem** (`zuem` / …) | *no ascending ranking from me* | Open empty reverse ladder |
| **…uel** (`zuel` / …) | *unspecified ranking (ascending frame)*; with SHARED scale → *unspecified who’s least* | Not empty reverse superlative — use bare **`oe`** + scale for *no least* if needed |
| **…en** (`zen` / `den` / …) | *unspecified ranking* (stock) / conventional “order not fixed” label | Named **unspecified** ranking — not a draw (**…aen** = draw) |
| **…er** (`zer` / `der` / …) | *whatever’s most important* / *whatever comes first* | Positive twin of **…el** / **…em** — unnamed top priority |

**Set — focus**

| Form | Focus reading | Contrast |
|------|---------------|----------|
| **…al** (`zal` / `dal` / `bal` / `gal` / `wal` / `hal`) | *just X* / *only X* | Closed *and* of one — exhaustive inventory, **not** a priority claim (milder than **…el**) |
| **…am** (`zam` / `dam` / `bam` / `gam` / `wam` / `ham`) | *X, for one* / *X, say* | Open *and* of one — same open bit as multi-item **am** |
| **…ol** (`zol` / `dol` / …) | *has to be X* / *X only* | Closed xor of one — forced exclusive pick, not inventory (**…al**) or priority (**…el**) |
| **…om** (`zom` / `dom` / …) | *say, X* / *X maybe* / *X, or skip* | Open xor of one — at most X (empty OK); other exclusives may exist |
| **…ual** (`zual` / `dual` / …) | *everything but X* | Closed complement of one — all of the domain except X |
| **…uam** (`zuam` / `duam` / …) | *everything but X (among exclusions)* | Open complement — X excluded; other exclusions may exist |
| **…uol** (`zuol` / `duol` / …) | *anything but X* | Closed free choice outside {X} |
| **…uom** (`zuom` / `duom` / …) | *anything but X (open)* | Open free choice outside {X}; other exclusions may exist |
| **…aol** (`zaol` / `daol` / …) | *X is enough* / *X’ll do* | Closed *and/or* of one — inclusive frame, stricter than **…aom** |
| **…aom** (`zaom` / `daom` / …) | *at least X* / *X would work* | Inclusive singleton — X is a sufficient hit; others may count |
| **…ar** (`zar` / `dar` / …) | *some (unknown) X* / *an unspecified X* | Existential unspecified of kind X — not ordinary `-l` first mention |
| **…or** (`zor` / `dor` / …) | *any X* | Free-choice of kind X — menu twin of **…ol** / **…om** |
| **…ul** (`zul` / `dul` / …) | *not X* | Closed negation of one — X fails, and that’s the denial in play |
| **…um** (`zum` / `dum` / …) | *not X (among denials)* / *not X, for one* | Open negation — X denied; other denials may exist |
| **…un** (`zun` / `dun` / …) | *not X* (stock) / *not X, as usual* | Named / conventional denial of one — formulaic *not X* frame |
| **…ur** (`zur` / `dur` / …) | *something other than X* | Existential other-than kind X — not revision *except* (**ul** / **um**), not prefixed **…ul** (*not X*), not antonymy |

**Set — bare**

| Form | Bare reading | Contrast |
|------|-----------------|----------|
| **…al** (`zal` / `dal` / …) | *nothing* / *nobody* / *none* | Closed empty inventory — you stand behind emptiness |
| **…am** (`zam` / `dam` / …) | *nothing comes to mind* / *I got nothing* | Open twin — can’t fill the slot, but don’t claim the world is empty |
| **…an** (`zan` / `dan` / …) | *null* / *void* | Named / conventional empty value (*null*, void marker) |
| **…ol** (`zol` / `dol` / …) | *no options* / *we’re stuck* | Closed empty menu — pick-one with nowhere to land |
| **…om** (`zom` / `dom` / …) | *I got no pick* / *can’t say* / *skipping is fine* | Open empty menu — empty-allowed twin of forced **…ol**; “I don’t have a pick,” not “impossible” |
| **…ual** (`zual` / …) | *everything* / *everyone* | Closed empty exclusion list — complement of nothing = unrestricted universal (positive twin of **…al**) |
| **…uam** (`zuam` / …) | *everything that comes to mind* | Open universal — affirming a full list from the speaker’s side |
| **…uol** (`zuol` / …) | *anything (goes)* | Closed empty exclusion — free choice with nothing barred (near **…or**; complement frame made explicit) |
| **…uom** (`zuom` / …) | *anything from me* | Open empty exclusion — free choice, open |
| **…aol** (`zaol` / `daol` / …) | *all set* / *nothing more needed* | Closed inclusive — null requirement, and that’s the full story |
| **…aom** (`zaom` / `daom` / …) | *nothing I need that I can think of* / *I’m fine for now* | Soft / open null requirement |
| **…ul** (`zul` / `dul` / …) | *no* | Closed bare denial — you stand behind *no* (contrast **…al** *nothing/nobody* as empty inventory) |
| **…um** (`zum` / `dum` / …) | *no from me* / *nothing to deny from me* | Open bare denial — soft / speaker-side *no*, not a full claim that nothing fails in the world |
| **…un** (`zun` / `dun` / …) | *no* (stock) / conventional denial label | Named / conventional bare *no* — formulaic denial, not speaker-side open **…um** |
| **…ar** (`zar` / `dar` / …) | *something* / *someone* | Positive twin of **…al** / **…am** — unspecified member, no kind |
| **…or** (`zor` / `dor` / …) | *anything* / *anyone* | Free-choice twin of **…ol** / **…om** — unrestricted menu |
| **…ur** (`zur` / `dur` / …) | *something else* / *someone else* | Existential other-than — twin of **…ar** / **…am** (*something* among); not bare **…ul** (*no*) |

**…an** is **bare-only** on the phrase fence under **`/z/` `/d/` `/b/` `/w/`** (no defined one-conjunct reading). Under **`/ɡ/` `/h/`**, **`…an`** / **`…en`** / **`…aen`** / other **-n** join-vowel spellings are [join-relations](special-vocabulary.md#join-relations) (unary `/b/`), not named empty/focus joins. **…ul** / **…um** / **…un** are defined at **all** arities where still joins (bare *no*; focus *not X*; multi *none of*) — see [negation](#negation-u): **-l** / **-m** closed/open; phrase named **…un** on `/z/` `/d/` `/b/` `/w/`; clause soft **`xun`**; **`vun`** / **`gun`** / **`hun`** are content (join-act / join-relation), not bare soft *no*. **…en** bare = *unspecified ranking* (stock) under named prefixes; focus **…en** stays *X first* (stock). **…aen** bare = *it’s a draw* / *tie* under named prefixes. **…ar** / **…or** / **…er** / **…ur** are defined at **all** arities (bare / focus / multi) — see [unspecified-member **-r**](#unspecified-member-r-phrase).

Examples (focus): `zem z-truthrl` → *truth first* / *mainly truth*; `zel z-truthrl` → *only truth matters*; `zael z-truthrl` → *truth tied for* / *equal priority to truth*; `zoem z-fixl` → *try a fix first*; `zoel z-fixl` → *only try a fix*; `zuem z-dessertl` → *dessert last*; `zuel z-dessertl` → *dessert last, period*; `zen z-safetyl` → *safety first* (stock / named unspecified ranking); `zer z-safetyl` → *safety as a priority*; `zal z-waterl` → *just water*; `zam z-Samn` → *Sam, for one*; `zol z-waterl` → *has to be water*; `zom z-coffeel` → *say, coffee* / *coffee, or skip*; `zual z-teal` → *everything but tea* (not *every tea* — that is bare `zual g-teal`); `zuol z-coffeel` → *anything but coffee*; `zaol z-waterl` → *water’ll do*; `zaom z-waterl` → *at least water*; `zul z-Samn` → *not Sam*; `gum g-bigl` → *not big (among denials)*; `zun z-Samn` → *not Sam* (stock / conventional denial); `gul g-bigl` → *not big*; `zar z-personl` → *some (unknown) person*; `zor z-personl` → *any person*; `zur z-contractl` → *something other than the contract*.

Examples (bare): `zal` → *nothing* / *nobody*; `zam` → *nothing comes to mind*; `zan` → *null* / *void*; `zol` → *no options* / *we’re stuck*; `zom` → *I got no pick* / *skipping is fine*; `zual` → *everything* / *everyone*; `zual g-catl` → *every cat* ([generics](#universals-domains-generics)); `zuam g-catl` → soft *every cat that comes to mind*; `zuol` → *anything (goes)*; `zaol` → *all set*; `zaom` → *nothing I need*; `zul` → *no*; `zum` → *no from me*; `zun` → *no* (stock / conventional denial label); `zar` → *something* / *someone*; `zor` → *anything* / *anyone*; `zer` → *whatever’s most important*; `zur` → *something else* / *someone else*; `zel` → *unspecified ranking*; `zem` → *I don’t have a ranking*; `zael` → *it’s a draw* / *tie*; `zaem` → *probably a tie*; `zaen` → *it’s a draw* (stock); `zoem` → *not sure where to start*; `zoel` → *do nothing* / *don’t bother*; `zoel g-bigl` → *there is no biggest*; `zoem g-bigl` → *no biggest comes to mind*; `zuel` → *unspecified ranking (ascending)*; `zen` → *unspecified ranking* (stock). Same under `/d/` `/b/` `/ɡ/` (`dal`, `gam`, `zar`, `zor`, `zer`, `zur`, `zul`, `zun`, …). Under `/h/` / `/w/`, only the [defined core](restrictors.md) applies (`hal` → *never*; `hual` → *always*; `har` → *sometime*; `hael` → tied occasions — …) — not these entity/property emptiness readings.

Do not confuse prefixed **…em** / **…el** / **…en** / **…er** / **…al** / **…am** / **…an** / **…ol** / **…om** / **…ual** / **…uam** / **…uol** / **…uom** / **…uel** / **…uem** / **…ul** / **…um** / **…un** / **…ur** / **…ar** / **…or** with reviser **em** / **el** / **en** / **al** / **am** / **an** / **ol** / **om** / **ul** / **um** / **un** (*or rather* / *including* / *instead* / *except*).
### Exclusivity, negation (`u`), and invert
<a id="negation-u"></a>

- **Exclusive (`o`)** — at most one of the conjuncts (never more than one). Ending splits empty-allowed:
  | Ending | Multi reading | Typical use |
  |--------|---------------|-------------|
  | **-l** (`zol` / `vol` / `xol` / …) | pick **exactly one** — empty **not** allowed | forced choice, partitions, instructions |
  | **-m** (`zom` / `vom` / `xom` / …) | pick **at most one** — *or none* / empty-allowed; other exclusives may exist | offers, soft menus, permissions |
  | **-n** | named/conventional (phrase) or soft (clause) exclusive bundle — completeness / softness as usual; **not** an automatic empty-allowed bit (use **-om** when skip must be explicit). Soft **`xon`** = uncertain alternatives. VP **`von`** is a [join-act verb](special-vocabulary.md#join-act-verbs) (*chooses as the one choice*), not a soft join | stock xor labels; soft clause `xon` |
  Phrase/VP/clause same rule. Focus **`zol X`** = *has to be X*; focus **`zom X`** = *say, X* / *X, or skip*. Bare **`zol`** = *no options* / *stuck*; bare **`zom`** = *I got no pick* / skip is fine from the speaker’s side. Circumstance: **`hol`** = exclusive trigger (exactly one occasion); **`hom`** = exclusive trigger **or never** — [restrictors.md](restrictors.md). Nest if you need a rare mix (e.g. closed list but empty OK: `vol zol A B zal`).
- **Inclusive (`ao`)** — one **or** more of the conjuncts may hold (English *and/or*). Built by combining **a** with **o**; bare **o** stays exclusive. **-m** on **ao** does **not** allow empty (still at least one).
- **Negation (`u`)** — the listed conjuncts **fail** (none of them hold). Same vowel at every level (phrase / VP / clause); no separate `/h/` or `/w/` “not” root for ordinary polarity. Under **`/h/`** / **`/w/`**, **u** denies **applicability circumstances** (*not when…*), not manner polarity — see [restrictor use](restrictors.md).
  | Length | Reading |
  |--------|---------|
  | **2+** (list) | *none of* the listed — `zul A B`, `vul A B`, `xul A B`; circumstance: `hul A B` → *not when A or B* |
  | **1** (focus) | *not X* — `zul X`, `vul v-runl` (*didn’t run*), `gul g-bigl` (*not big*), `xul SENT` (*not SENT*); circumstance: `hul h-rainl` → *not when raining* |
  | **0** (bare) | bare *no* — `zul` / `vul` / `xul` (closed); open twin **…um**; phrase named **…un**; soft clause **`xun`**. VP **`vun`** is a [join-act verb](special-vocabulary.md#join-act-verbs) (*denies / refuses*), not bare soft *no*. Contrast bare **…al** (*nothing* / *nobody* as empty inventory) and bare **…oel** (*do nothing* as empty exclusive triage). Circumstance: bare **`hal`** = *never*; bare **`hual`** = *always*; bare **`hul` / `hum`** are **undefined** under `/h/` / `/w/` — use `xul` / `vul` / `zul` for bare *no*. |
  **-l** vs **-m** mark whether the denial is limited to what’s named (**…ul**) or leaves room for further denials (**…um**); phrase **-n** (`zun` / …) names a conventional *none of* / denial bundle (all arities); clause soft **-n** (`xun`) = soft / reconstructed denial. **-r** on **u** is *something else* / *someone else* (other than), not *not* — see [unspecified-member](#unspecified-member-r-phrase). Prefixed **`zul` / `vul` / …** are **not** revision **`ul` / `um`** (*A except B*). Nest fences for scope: `vul val A B` → ¬(A ∧ B); `val vul A vul B` → (¬A) ∧ (¬B).
- **Invert (`ua` / `uo` / `ue`)** — leading **u** on **a** / **o** / **e** flips the base join. Contrast plain **u** (negation) vs **u**-stacks (complement or reverse). **-m** on invert forms does **not** imply empty-allowed / *or none* — only that unlisted conjuncts may exist. Empty-allowed is bare **o** + **-m** only ([above](#empty-allowed-om)).
  - **`ua`** — everything but the listed (domain minus the conjuncts); with SHARED kind → *every K (but …)* — [universals, domains, and generics](#universals-domains-generics).
  - **`uo`** — anything but the listed (free choice from the complement); SHARED kind narrows the menu the same way.
  - **`ue`** — rank reversal (*A ≺ B ≺ C*); exclusivity unmarked.
- **Ranked (`e` / `ae` / `oe` / `ue`)** — **e** / **oe** / **ue** are ordered ranking (not boolean *and* / *or*). **ae** = equality / tie (multi without scale) or [equative](comparatives.md#equatives) (multi + SHARED scale). **e** / **oe**: first listed outranks second, and so on. **ue**: last listed outranks earlier. **e** leaves exclusivity unmarked; **oe** = exclusive ranked (**o**+**e**); bare **oe** + SHARED scale = empty superlative. **-l** / **-m** / **-n** still mark closed / open / named (phrase `/z/` `/d/` `/b/` `/w/`) or soft (**clause**) packaging; VP **-n** = [join-act verbs](special-vocabulary.md#join-act-verbs); `/ɡ/` `/h/` **-n** = [join-relations](special-vocabulary.md#join-relations). **-m** on ranked forms (including **oe**) does **not** add empty-allowed — that bit stays bare **`…om`** only.

**a** is the inventory set join (*and*), not an *or*. Phrase **`/z/` `/d/` `/b/` `/w/`** and clause take **-l**, **-m**, or **-n** (named at those phrase prefixes; soft at clause) on **a** / **o** / **u** / **ao** / **e** / **ae** / **oe** / **ua** / **uo** / **ue**; phrase **`/ɡ/` `/h/`** take **-l** / **-m** (and **-r** where allowed) as joins — their **-n** spellings are join-relations. VP takes **-l** / **-m** (and **-r** where allowed) as joins — VP **-n** spellings are join-act verbs. **a** / **o** / **e** / **u** also take **-r** ([unspecified-member](#unspecified-member-r-phrase)). Stacked forms (**ao** / **ae** / **oe** / **ua** / **uo** / **ue**) never take **-r**.

There are **no** bare (prefix-less) **joins**. Prefixed joins always have a PoS prefix + ending (`zam`, `val`, …). Prefix-less **al** / **am** / **an** / **el** / **em** / **en** / **ol** / **om** / **on** / **ul** / **um** / **un** are [revisers](revisers.md) only — not list joins. Whole-word **a** / **e** / **o** / **u** (no ending) are **illegal**.

### Universals, domains, and generics
<a id="universals-domains-generics"></a>
<a id="generics"></a>
<a id="every-k"></a>

**Kind / domain** for invert **ua** / **uo** (and for open twins **uam** / **uom**) is marked with ordinary **SHARED `/ɡ/`** — the kind as a property (*cat*-y, *drink*-y). There is **no** separate domain particle. Conjuncts under **ua** / **uo** remain **exclusions** from that domain (or from context when SHARED is absent).

| Shape | Reading |
|-------|---------|
| bare **`zual`** | *everything* / *everyone* — unrestricted domain (context) |
| bare **`zual` + SHARED `/ɡ/`** | ***every K*** — closed universal of that kind (`zual g-catl` = *every cat*) |
| bare **`zuam` + SHARED `/ɡ/`** | soft / speaker-side universal of K (`zuam g-catl` = *every cat that comes to mind* / *as far as I know, all cats*) |
| **`zual` + SHARED `/ɡ/` + conjuncts** | *every K but* those exclusions (`zual g-drinkl z-teal z-coffeel` = *every drink but tea and coffee*) |
| focus **`zual X`** (no SHARED kind) | *everything but X* — **not** *every X* |
| bare **`hual`** | *always* — occasion universal; [circumstance](restrictors.md) |

**Generics** (characterizing claims about a kind) use these fences — **not** plural **-sh** ([plurality.md](plurality.md)):

- **Strict / definitional** (*All triangles have three sides*; *Every cat is a mammal*) → closed **`zual` + SHARED kind**.
- **Soft / epistemic** (*As far as I know, all …*) → open **`zuam` + SHARED kind**.
- **Habitual / characterizing** (*Dogs bark*; *Sam drinks coffee* as a standing pattern) → bare **`hual`** (or **`huam`**) on the clause, with an ordinary number-neutral or plural subject as needed — not entity-`zual` unless you mean ∀ of the kind.
- **Free-choice disposition** (*Any cat will do*) → **`zor`** (+ kind conjunct or SHARED as usual for **-r**), not **`zual`**.

Same under `/d/` `/b/` when the universal fills that slot (`dual g-catl` = *every cat* as object). Under `/h/` / `/w/`, **`hual` / `wual`** stay circumstance *always* ([restrictors.md](restrictors.md)); do not read entity-style *every K* under those prefixes.

**Trap:** `zual z-catl` = *everything but the cat*. For *every cat*, put the kind in SHARED: `zual g-catl`.

Examples: `zual g-catl` → *every cat*; `zuam g-studentl` → *every student that comes to mind*; `zual g-drinkl z-teal z-coffeel` → *every drink but tea and coffee*; `zual` → *everything* / *everyone*; `zual z-teal` → *everything but tea*; `hual` → *always* (habitual frame).

---

# Revisers

Moved to **[revisers.md](revisers.md)**.

<a id="in-clause-revision-bare-a--e--o--u"></a>
<a id="bare-revision"></a>
<a id="in-clause-revision"></a>
<a id="revisers"></a>
<a id="revision-chains-parallel-on-a"></a>

Prefix-less **al** / **am** / **an** / **el** / **em** / **en** / **ol** / **om** / **on** / **ul** / **um** / **un** — in-clause repair of a fixed left side, or discourse glue before `/j/`. Full grammar: [revisers.md](revisers.md).

---

# Phrase-level joins (fence)
<a id="np-level-coordination"></a>
<a id="ap-level-coordination"></a>
<a id="phrase-level-coordination"></a>
<a id="left-fence"></a>
<a id="right-close"></a>

Phrase-level joins join **same-slot** conjuncts (single words or multi-word phrases) with a **fence**: prefixed join(s) plus optional **shared** modifiers **immediately after** each join. Same vowel series and endings as above (**-l** / **-m** on all phrase prefixes; **-n** named on **`/z/` `/d/` `/b/` `/w/`** only — `/ɡ/` `/h/` **-n** = [join-relations](special-vocabulary.md#join-relations); **-r** on **a** / **o** / **e** / **u** for [unspecified-member](#unspecified-member-r-phrase); not plural **-sh**). Slots differ only in **which prefix** the join takes and **what counts as a conjunct**. Flat lists use one fence; nested joins use [fence nesting](#fence-nesting). **Pure infix is illegal** (`A zam B zal C`).

**Fence — juxtaposed conjuncts.** No continue particle between conjuncts (`zam A B`, not `zam A zar B` for a flat *and*). `zar` / `zor` / `zer` / `zur` are whole-fence unspecified-member joins, not mid-chain extenders.

**Placement:** **Left fence** (join before the conjuncts) is **preferred**. **Right close** (join after the conjuncts) is allowed for **style or comedy**. Shared modifiers stay **right after the join** in either placement.

## Forms

Word shape: role prefix + vowel root (+ second vowel for inclusive forms) + ending.

| Prefix | What is coordinated |
|--------|---------------------|
| `/z/` | subject NP (single word or multi-word) |
| `/d/` | direct-object NP |
| `/b/` | argument NP (of a complex `/ɡ/` or `/h/`) |
| `/ɡ/` | adjective phrase (one `/ɡ/` stack position on a host) |
| `/w/` | **restrictor use** on the preceding host `/ɡ/` — [restrictors.md](restrictors.md); not sibling adjunct *and* |
| `/h/` | **restrictor use** on the clause (floating) — [restrictors.md](restrictors.md); not sibling adverb *and* |

Writing: `zal` / `zam` / `zan` / `zar` / `zol` / `zom` / `zor` / `zul` / `zum` / `zun` / `zur` / … / `zel` / `zem` / `zen` / `zer`; same under `/d/`, `/b/` (`dal` / `dam` / …), `/w/` (`wal` / `wam` / `wan` / …). Under `/ɡ/` / `/h/`: joins are **-l** / **-m** / **-r** only (`gal` / `gam` / `gar` / `hal` / `ham` / …); **-n** spellings (`gan` / `han` / …) are [join-relations](special-vocabulary.md#join-relations). Stacked vowels glue in writing: inclusive **ao** `zaol` / `zaom` / `zaon`; equality / tie **ae** `zael` / `zaem` / `zaen`; exclusive ranked **oe** `zoel` / `zoem` / `zoen`; invert **ua** `zual` / `zuam` / `zuan`; **uo** `zuol` / `zuom` / `zuon`; **ue** `zuel` / `zuem` / `zuen` (named **-n** stacks under `/z/` `/d/` `/b/` `/w/` only; `/ɡ/` `/h/` stacked **-n** = join-relations `gaon` / `haen` / …). Spoken order is first vowel then next then ending (**a** then **o**; **u** then **a**; **u** then **o**; **o** then **e**; **u** then **e**; …). No three-vowel stacks. Phrase **-r** forms are **`zar`** / **`zor`** / **`zer`** / **`zur`** (and the same under other phrase prefixes) — not `zaor`, `zaer`, `zoer`, `zuar`, `zuor`, `zuer`, ….

The prefix on the join **must match** every conjunct head (`/z/` with `/z/`, `/ɡ/` with `/ɡ/`, and so on).

## Shape

**Left fence** (preferred):

```
P-JOIN ( SHARED )* PHRASE PHRASE ( PHRASE )*  ← two or more
P-JOIN ( SHARED )* PHRASE             ← focus (allowed forms)
P-JOIN ( SHARED )*                 ← bare (allowed forms)
```

**Right close** (style / comedy):

```
PHRASE PHRASE ( PHRASE )* P-JOIN ( SHARED )*  ← two or more
PHRASE P-JOIN ( SHARED )*             ← focus (allowed forms)
P-JOIN ( SHARED )*                 ← bare (same as left when empty)
```

- **P-JOIN** — one of the prefixed forms above (`zam`, `dol`, `bem`, `gam`, `wam`, `ham`, `zar`, `zor`, `zer`, `zur`, …). For a **flat** list, appears **only once**: either **before** all conjuncts (left) or **after** all conjuncts (right) — not between conjuncts. For **nested** lists, multiple fences stack — see [fence nesting](#fence-nesting). **Pure infix** (`A zam B zal C`) is illegal.
- **SHARED** — optional material **immediately after** `P-JOIN` in either placement. **Always** scopes over the **whole coordinated phrase** (NP: ordinary `/ɡ/` / `/w/` / complex `/ɡ/`+`/b/`; AP: `/w/`; `/w/`-slot and `/h/`-slot joins: further same-slot material only if the lexicon allows stacking on the join as a unit). Shared ordinary `/ɡ/` / `/w/` here sit next to the fence (before the heads they grade on the left; after the list on the right) — the fence defines the host unit. Under ranked **`e` / `oe` / `ue`** on an NP slot (`/z/` `/d/` `/b/`), SHARED ordinary `/ɡ/` (+ `/w/`) is the [**comparison scale**](comparatives.md) (*bigger than* / superlative / bare **`oe`** empty superlative); bare **`e`** + scale = unspecified who’s top. Under **`ae`**, SHARED **scale** (gradable) `/ɡ/` is [**equative**](comparatives.md#equatives) (`zael g-bigl z-Samn z-Lean` = *Sam as big as Lea*). Under **`a`**, SHARED singular `/ɡ/` **distributes** over conjuncts (*both ADJ* when gradable) or is whole-phrase **bundle** description when non-scalar (`zam g-ofl b-Samn z-dogl z-catl` = *Sam’s (dog and cat)*); SHARED `/ɡ/`…**-sh** under **`a`** is [**collective**](plurality.md#collective-ascription) (*ADJ together*); SHARED under **`o` / `ao`** stays bundle description. Under invert **ua** / **uo**, SHARED `/ɡ/` is the **kind / domain** (*every K* / *any K but …*), not a descriptive bundle property — [universals, domains, and generics](#universals-domains-generics) (`zual g-catl` = *every cat*; `zual g-drinkl z-teal z-coffeel` = *every drink but tea and coffee*). With **exactly two number-word endpoints** under **`a` / `e` / `ue` / `ua`**, SHARED continuum `/ɡ/` is a [**numeric span**](numbers.md#ranges) (*between* / *from…to…* / outside); bare number pairs without that continuum stay ordinary coordination (e.g. `zel z+3l z+5l` = preference). **Left-bound `gl-`** is **not** SHARED: after a left fence it binds only the **next** conjunct (see [Adjectives](language-reference.md#adjectives-ɡ)).
- **PHRASE** — a conjunct: NP headed by `/z/`, `/d/`, or `/b/` (plus that head’s local `/ɡ/` / `/w/` / `/b/` material — default **after** the head, or [left-bound `gl-`](language-reference.md#adjectives-ɡ) **before** that head); AP headed by `/ɡ/` (plus contiguous `/b/`, further `/ɡ/` on that `/b/`, and local `/w/`); or a single `/w/` / `/h/` word (plus `/h/`’s contiguous `/b/` when complex). Local right-bound modifiers stay **inside** their conjunct, after that conjunct’s head; local `gl-` sits immediately before that head.
- Two conjuncts (left): `P-JOIN PHRASE PHRASE`. Two (right): `PHRASE PHRASE P-JOIN`. Three or more: same pattern with more `PHRASE` items on the conjunct side of `P-JOIN`.
- **Focus phrase** — **…em** / **…el** / **…oem** / **…oel** / **…uem** / **…uel** / **…en** / **…er** / **…al** / **…am** / **…ol** / **…om** / **…ual** / **…uam** / **…uol** / **…uom** / **…aol** / **…aom** / **…ul** / **…um** / **…un** / **…ar** / **…or** / **…ur**: `P-JOIN PHRASE` or `PHRASE P-JOIN` — see [focus and bare](#focus-phrase), [negation](#negation-u), and [unspecified-member **-r**](#unspecified-member-r-phrase).
- **Bare phrase** — those same forms, plus **…an**: `P-JOIN` alone (optional `SHARED`) — the join fills the slot with the [bare reading](#bare-phrase). Left and right placement coincide when there are no conjuncts. A following matching-role head is still absorbed as a conjunct (so bare is only when no conjunct follows / precedes).
- All other phrase joins need **two or more** conjuncts.
- Single-word siblings: `zam z-dogl z-catl` or `z-dogl z-catl zam` (*a dog and a cat* — open).
- Unspecified-member: `zar` → *something*; `zar z-personl` / `z-personl zar` → *some (unknown) person*; `zar z-teal z-coffeel` → *some one among tea and coffee*; `zor` → *anything*; `zor z-personl` → *any person*; `zor z-teal z-coffeel` → *any of tea or coffee*; `zer` → *whatever’s most important*; `zer z-safetyl` → *safety as a priority*; `zer z-teal z-coffeel` → *whichever of tea or coffee ranks higher*; `zur` → *something else*; `zur z-contractl` → *something other than the contract*; `zur z-costl z-riskl` → *something other than cost and risk*.
- Negation: `zul z-Samn` → *not Sam*; `gul g-bigl` → *not big*; `zul z-teal z-coffeel` → *none of tea or coffee*; `zun z-teal z-coffeel` → *none of tea or coffee* (named/conventional denial bundle); `zul` → *no*; `zum` → *no from me*; `zun` → *no* (stock). Circumstance denial: `hul h-rainl` → *not when raining* ([restrictors.md](restrictors.md)).

**Rank joins** (`zel` / `zael` / `zoel` / `zuel`, `zem` / …, `zen` / …): **`e` / `oe` / `ue`** take ranking from **spoken conjunct order** (before a right-close join) — **e** / **oe** earlier≻later; **ue** later≻earlier — see [rank join](#ranked-conjunction-e). **`ae`** = tie / equal rank (no order) or [equative](comparatives.md#equatives) with SHARED scale. SHARED `/ɡ/` on an NP ranked fence = [comparison scale](comparatives.md) under **`e` / `oe` / `ue`** (list = comparative; focus **`e`** = superlative; bare **`oe`** + scale = empty superlative; bare **`e`** + scale = unspecified top). Focus / bare without that scale: [focus and bare](#focus-phrase). Set **`a`** + SHARED `/ɡ/` = distributive / bundle / [collective](plurality.md#collective-ascription) (`…-sh`).
### Scope fence (`P-JOIN`)
<a id="scope-fence-p-coord"></a>
<a id="scope-fence-p-join"></a>

**Rule:** A modifier **immediately after** a phrase-level join (`zam`, `gam`, `dam`, …) modifies the **entire joined phrase** — whether that join is a left fence or a right close — when it uses ordinary (right-bound) `/ɡ/` / `/w/` morphology. **Left-bound `gl-`** in that same position binds only the **next** conjunct.

- Modifiers **after a conjunct head** (and before the next matching-role head) belong to that conjunct only.
- Modifiers in the **SHARED** slot (ordinary `/ɡ/` / `/w/` / complex `/ɡ/`+`/b/`) scope over **all** conjuncts as one unit — as **distributive** property under **`a`** (gradable singular `/ɡ/` on each conjunct host), as [**collective**](plurality.md#collective-ascription) under **`a`** when that SHARED `/ɡ/` takes **-sh** (`zal g-heavylsh z-boxl z-cratel` = *heavy together*), or as bundle description under **`a`** (non-scalar) / **`o` / `ao`**, as [equative scale](comparatives.md#equatives) under **`ae`** when gradable, as **kind / domain** under invert **ua** / **uo** ([universals, domains, and generics](#universals-domains-generics)), as [comparison scale](comparatives.md) under ranked **`e` / `oe` / `ue`** on NP slots, or as [continuum](numbers.md#ranges) under **`a` / `e` / `ue` / `ua`** when the two conjuncts are compatible number endpoints. Comparison scale and continuum `/ɡ/` stay singular (no **-sh**).
- On a **right close**, do **not** put further matching-role conjunct heads after `P-JOIN` / `SHARED`; the list of conjuncts is already complete to the left of `P-JOIN`.

Contrast (left fence):

- `zam z-dogl z-catl g-bigl` → *(dog) and (big cat)* — big follows the last head → last conjunct only
- `zam g-ofl b-Samn z-dogl z-catl` → *Sam’s (dog and cat)* — non-scalar SHARED → whole phrase (bundle)
- `zal g-bigl z-dogl z-catl` → *(big dog) and (big cat)* — scale SHARED under **`a`** → distributive
- `zal g-heavylsh z-boxl z-cratel` → *the box and the crate are heavy together* — SHARED `/ɡ/`…**-sh** under **`a`** → [collective](plurality.md#collective-ascription)
- `zael g-bigl z-dogl z-catl` → *the dog is as big as the cat* — scale SHARED under **`ae`** → [equative](comparatives.md#equatives)
- `zam gl-bigl z-dogl z-catl` → *(big dog) and (cat)* — left-bound `gl-` after the fence → next conjunct only (not SHARED)
- `zam z-dogl g-bigl z-catl` → *(big dog) and (cat)* — big local to dog (right-bound)
- `zam z-dogl gl-redl z-catl` → *(dog) and (red cat)* — left-bound local to the following head
- `gam w-veryl g-happyl g-proudl` → *very (happy and proud)* — `/w/` after `gam` grades the whole AP join
- `gam g-happyl w-veryl g-proudl` → *(very happy) and (proud)* — `/w/` local to first `/ɡ/`

Right close (same SHARED rule after the join):

- `z-dogl z-catl zam` → *a dog and a cat* (open) — join closes the list
- `z-dogl z-catl zam g-ofl b-Samn` → *Sam’s (dog and cat)* — non-scalar shared after right-close `zam`
- `z-dogl z-catl zal g-bigl` → *(big dog) and (big cat)* — distributive SHARED under **`a`** (right close)
- `z-dogl z-catl zael g-bigl` → *dog as big as cat* ([equative](comparatives.md#equatives); right close)
- `z-dogl g-bigl z-catl zam` → *(big dog) and (cat)* — big local to dog; `zam` closes
- `g-happyl g-proudl gam w-veryl` → *very (happy and proud)* — shared `/w/` after right-close `gam`

Complex adjective on an NP bundle: `zam g-ofl b-Samn z-dogl z-catl` or `z-dogl z-catl zam g-ofl b-Samn` → *Sam’s (dog and cat)* — the complex `/ɡ/`+`/b/` in SHARED owns the whole join.

### End of list

- **Left fence — same-prefix absorb** — after `P-JOIN` (and any `SHARED`), every following matching-role head (plus its local modifiers) is a **conjunct** until the list ends. For AP `/ɡ/` on one host, that means you cannot stack an extra non-coordinated `/ɡ/` on the same noun after a `gam`… join; put further description in another sentence, or include it as another conjunct. Same absorb rule for `/w/` and `/h/` left-fence [circumstance](restrictors.md) chains (conjuncts = circumstance units, not co-manner stacks).
- **Right close — lookback absorb** — matching-role heads (plus local modifiers) **immediately before** `P-JOIN` are the conjuncts; clause-level floating `/h/` inside that stretch is transparent (below). After right-close `P-JOIN` / `SHARED`, the coordinated phrase is finished — a later matching-role head is **not** another conjunct of this list.
- **Leaving the role** — a following word with a **different** clause/role prefix that is not local modifier material (and not `SHARED` after the fence) ends the list (e.g. after a `/z/` join, `/d/`, `/v/`, `/h/` as clause adverb, `/j/`, `/x/`, …).
- **Floating `/h/` inside an NP/AP/`/b/` join** — clause-level `/h/` (simple or `/h/`+`/b/`) is **transparent**: it does not end the list and is not a conjunct; a later matching-role head is still a conjunct (left absorb) or still part of the lookback stretch (right close). (VP-chain `/h/` scope is different — see [VP-level](#vp-level-coordination).)

### Examples (schematic)

**NP**

- `zam z-dogl g-bigl z-catl g-redl` — *(big dog) and (red cat)* — open; each color inside its conjunct
- `z-dogl g-bigl z-catl g-redl zam` — same reading with right close
- `zal z-dogl g-bigl z-birdl z-catl g-redl` — *(big dog), (bird), and (red cat)* — closed three-way NP list
- `zam z-bookl g-onl b-tablel z-penl g-onl b-deskl` — *(book on the table) and (pen on the desk)*
- `bam b-tablel b-shelfl` under one complex adjective — *on (the table and the shelf)*
- `dam d-dogl g-bigl d-catl` — *(big dog) and (cat)* as **object** (open)
- `dam g-ofl b-Samn d-dogl d-catl` — *Sam’s (dog and cat)* as object — non-scalar SHARED after the left fence
- `d-dogl d-catl dam g-ofl b-Samn` — same shared bundle reading with right close
- `zal g-bigl d-dogl d-catl` — *(big dog) and (big cat)* as object (distributive **`a`**)
- `zael g-bigl d-dogl d-catl` — *dog as big as cat* as object ([equative](comparatives.md#equatives))
- `zel z-teal z-coffeel z-waterl` — *tea ≻ coffee ≻ water* (closed ranked; exclusivity not claimed; prefer/else from context)
- `zel g-bigl z-Samn z-Lean` — *Sam is bigger than Lea* (closed comparative; SHARED `/ɡ/` = scale — [comparatives](comparatives.md))
- `zael g-bigl z-Samn z-Lean` — *Sam is as big as Lea* ([equative](comparatives.md#equatives))
- `zal g-bigl z-Samn z-Lean` — *Sam and Lea are big* (distributive **`a`** — not equative)
- `zal g-heavylsh z-boxl z-cratel` — *the box and the crate are heavy together* ([collective](plurality.md#collective-ascription))
- `zael z-teal z-coffeel` — *tea tied with coffee* / *equal rank* (no scale)
- `zel z+3l z+5l` — *3 ≻ 5* (preference; bare numbers, no span)
- `zal g-agel z+3l z+5l` / `zar g-spanl z+3l z+5l` — number range / in-span unspecified — [numbers.md § Ranges](numbers.md#ranges)
- `zel g-bigl z-Samn` — *Sam is the biggest (of all)* (focus **superlative** on scale *big*)
- `zel w-muchl g-bigl z-Samn z-Lean` — *Sam is much bigger than Lea*
- `zel g-talll b-inchl g+2l z-Samn z-Lean` — *Sam is two inches taller than Lea* — [measure phrases](numbers.md#measure-phrases)
- `zuel g-bigl z-Samn z-Lean` — *Sam is less big than Lea* (closed reverse on scale)
- `zoel z-burgerl z-chickenl z-hot-dogl` — *burger ≻ chicken ≻ hot dog* (closed **exclusive** ranked — pick one, in that order)
- `zuel z-appetizerl z-mainl z-dessertl` — *appetizer ≺ main ≺ dessert* (closed **rank reversal** — dessert preferred most)
- `zual z-teal z-coffeel` — *everything but tea and coffee* (closed invert-**a**)
- `zual g-catl` — *every cat* (bare **ua** + SHARED kind — [generics](#universals-domains-generics))
- `zuam g-studentl` — *every student that comes to mind* (open soft universal + SHARED kind)
- `zual g-drinkl z-teal z-coffeel` — *every drink but tea and coffee* (SHARED domain + exclusion conjuncts)
- `zuom z-helpl z-moneyl` — *anything but help or money* (open invert-**o**)
- `zem z-journall z-candlesh z-socksh` — *journal ≻ candles ≻ socks* (open ranked wishlist — bare **e**)
- `zael z-journall z-candlesh z-socksh` — *journal, candles, and socks tied* / *equal priority* (no scale)
- `z-teal z-coffeel z-waterl zel` — same neutral ranked ladder with right close
- `zem z-dogl g-bigl z-catl g-redl` — *(big dog) ≻ (red cat)* (open ranked, exclusivity unmarked)
- `zem z-truthrl` — *truth first* (focus open ranked); `zel z-truthrl` — *only truth matters* (focus closed); `zel g-bigl z-Samn` — *Sam is the biggest* (focus superlative + SHARED scale); `zem g-bigl z-Samn` — open superlative (*biggest among those that come to mind*); `zoem z-fixl` — *try a fix first* (focus open exclusive ranked); `zoel z-fixl` — *only try a fix* (focus closed exclusive ranked); `zuem z-dessertl` — *dessert last*; `zuel z-dessertl` — *dessert last, period*; `zen z-safetyl` — *safety first* (focus named ranked)
- `zal z-waterl` — *just water* (focus closed *and*); `zam z-Samn` — *Sam, for one* (focus open *and*); `zol z-waterl` — *has to be water* (focus closed xor); `zom z-coffeel` — *say, coffee* / *coffee, or skip* (focus open xor, empty-allowed); `zual z-teal` — *everything but tea* (**not** *every tea* — use `zual g-teal` for *every tea*); `zuol z-coffeel` — *anything but coffee*; `zaol z-waterl` — *water’ll do* (focus closed *and/or*); `zaom z-waterl` — *at least water* (focus open *and/or*); `zar z-personl` — *some (unknown) person*; `zor z-personl` — *any person*; `zer z-safetyl` — *safety as a priority*; `zul z-Samn` — *not Sam*; `zun z-Samn` — *not Sam* (stock); `zur z-contractl` — *something other than the contract*; `z-personl zar` — same with right close
- `zol z-teal z-coffeel` — *tea or coffee* (exactly one; closed); `zom z-teal z-coffeel` — *tea or coffee, or neither* (at most one; open, empty-allowed)
- `zar z-teal z-coffeel` — *some one among tea and coffee*; `zor z-burgerl z-chickenl` — *any of burger or chicken*; `zer z-teal z-coffeel` — *whichever of tea or coffee ranks higher*; `zul z-teal z-coffeel` — *none of tea or coffee*; `zun z-teal z-coffeel` — *none of tea or coffee* (named denial); `zur z-costl z-riskl` — *something other than cost and risk*
- `zal` — *nothing* / *nobody* (bare closed *and*); `zam` — *nothing comes to mind* (bare open *and*); `zan` — *null* / *void* (bare named); `zar` — *something* / *someone*; `zol` — *no options* / *we’re stuck* (bare closed xor); `zom` — *I got no pick* / *skipping is fine* (bare open xor); `zual` — *everything* / *everyone*; `zual g-catl` — *every cat* ([generics](#universals-domains-generics)); `zuam g-catl` — soft *every cat that comes to mind*; `zuol` — *anything (goes)*; `zor` — *anything* / *anyone*; `zaol` — *all set* (bare closed *and/or*); `zaom` — *nothing I need* (bare open *and/or*); `zul` — *no* (bare closed negation); `zum` — *no from me* (bare open negation); `zun` — *no* (bare named/conventional denial); `zur` — *something else*; `zel` — *unspecified ranking* (bare closed **e**); `zel g-bigl` — *unspecified who’s biggest*; `zem` — *I don’t have a ranking* (bare open **e**); `zer` — *whatever’s most important*; `zer g-bigl` — *whatever ranks highest on big*; `zael` — *it’s a draw* / *tie* (bare **ae**); `zaem` — *probably a tie*; `zaen` — *it’s a draw* (stock); `zoem` — *not sure where to start* (bare open **oe**); `zoel` — *do nothing* (bare closed **oe** without scale); `zoel g-bigl` — *there is no biggest* (bare empty superlative); `zoem g-bigl` — *no biggest comes to mind*; `zuel` — *unspecified ranking (ascending)*; `zen` — *unspecified ranking* (stock / named **e**)
**AP**

- `gam g-happyl w-veryl g-proudl w-slightlyl` — *(very happy) and (slightly proud)* — each degree inside its conjunct
- `gam g-onl b-tablel g-ofl b-Samn` — *(on the table) and (Sam’s)* — two complex APs on one host
- `gal g-redl g-softl g-warml` — *red, soft, and warm* — closed three-way AP list (absorb-all; no further bare `/ɡ/` on that host after this join)
- `g-redl g-softl g-warml gal` — same closed AP list with right close
- `z-cakel gan b-nutl` — *cake including nuts* ([join-relation](special-vocabulary.md#join-relations); not a named AP list — stock labels use [mention](quotations.md))
- `gel w-veryl g-happyl g-proudl` — *very (happy ≻ proud)* — shared degree after the fence; closed ranked on the AP (exclusivity unmarked)
- `gael g-happyl g-proudl` — *equally happy and proud* / *happy tied with proud* — closed **ae** on the AP
- `g-happyl g-proudl gel w-veryl` — same ranked AP with right close
- `g-happyl g-proudl gael w-veryl` — *very (equally happy and proud)* — equative AP with shared degree
- `z-backlogl gen b-bugl` — *bug-first backlog* (join-relation **`gen`**)
- `z-pathl gaen b-altl` — *path on a par with the alternative* (join-relation **`gaen`**)

**`/w/` / `/h/` — restrictor use (not sibling *and*)**

Sibling manner / degree / mood stacking uses **juxtaposition**, not a fence: `h-quicklyl h-quietlyl` → *quickly and quietly*; `w-veryl w-recentl` on a `/ɡ/` → *very* and *recent* on that adjective. Prefixed `/h/` / `/w/` joins are [restrictors](restrictors.md) — e.g. `hal h-rainl` → *only when raining*; `hal` → *never*; `wal w-allegedl` → *only when alleged* (property applies only under that framing).

## Restrictors (`/h/` / `/w/`)

Moved to **[restrictors.md](restrictors.md)**.

<a id="circumstance-restriction-h-w"></a>
<a id="circumstance-h-w"></a>
<a id="restrictors"></a>

Under `/h/` and `/w/`, the join series marks **applicability circumstances** (not sibling *and*). Full grammar: [restrictors.md](restrictors.md).

## Constraints

- **One slot** — the chain is a single subject, object, `/b/` argument, `/ɡ/` stack position, `/w/` restrictor unit, or `/h/` restrictor unit in the clause. Under `/h/` / `/w/`, that slot is a [restrictor](restrictors.md), not a sibling modifier *and*.
- **Matching role prefix** on every conjunct head and on the join.
- **One fence placement per flat list** — left (preferred) or right (style / comedy); never pure infix between conjuncts. Nested joins: [fence nesting](#fence-nesting).
- **Shared modifiers** — only in the slot immediately after each `P-JOIN` (left or right); local modifiers stay after their own heads.
- **Phrase `-r`** — only **`…ar`** / **`…or`** / **`…er`** / **`…ur`** ([unspecified-member](#unspecified-member-r-phrase)); no plural **-sh** on the join. Soft **-n** is clause only; VP **-n** = [join-act verbs](special-vocabulary.md#join-act-verbs); `/ɡ/` `/h/` **-n** = [join-relations](special-vocabulary.md#join-relations).
- **Not** verb+object packages — use [VP-level](#vp-level-coordination); **not** full sentences — those stay `/x/`…
- **Not** mixed-PoS joins; correlatives; `/x/` sentence linkers (*however*, *therefore*), general adversative *but*, [cite / mention / aside fences](quotations.md), or [numbered enumeration](numbers.md#number-as-discourse-marker-by-marker). In-clause *including* / *rather* / *instead* / *except* are [reviser](revisers.md), not this fence series. Phrase-level rank join **is** this series (`zel` / `zael` / `zoel` / `zuel` / `zem` / …); [comparatives / superlatives / equatives](comparatives.md) use SHARED `/ɡ/` as scale on NP fences (**`e` / `oe` / `ue`** = comparative/superlative; **`ae`** = equative; **`a`** distributes). Invert **ua** / **uo** / **ue** **is** this series too. Focus / bare phrase only for the forms in [focus and bare](#focus-phrase) (**…an** bare-only; **…ul** / **…um** / **…un** at all arities = [negation](#negation-u) *not X* / *no* / *none of* — phrase **-n** named; **…ar** / **…or** / **…er** / **…ur** at all arities = *something* / *anything* / *whatever-by-rank* / *something else*; **…aen** bare = *it’s a draw*, **…en** bare = *unspecified ranking* (stock), **…an** bare = *null* / *void*; **…ual** bare = *everything*, **…uol** bare = *anything (goes)*). Under `/h/` / `/w/`, only the [defined circumstance core](restrictors.md) is used (`hal` = *never*, `hual` = *always*, `har` = *sometime*, `hael` = *equally often*, …); other reserved spellings there are undefined.

## Reserved forms
<a id="phrase-reserved-forms"></a>

Under `/z/`, `/d/`, `/b/`, `/ɡ/`, `/w/`, and `/h/`, the join series plus an allowed **join** ending (`zal`, `zam`, `zan`, `zar`, … under `/z/` `/d/` `/b/` `/w/`; `gal`, `gam`, `gar`, … under `/ɡ/`; `hal`, `ham`, `har`, … under `/h/` — **-l** / **-m** / **-r** only on `/ɡ/` `/h/`) are **only** these phrase joins or [restrictors](restrictors.md) (under `/h/` / `/w/`: **core defined**, other **-l** / **-m** / **-r** spellings reserved but **undefined**) — not ordinary open-lexicon content with those vowel roots. **`/ɡ/`…**-n** and **`/h/`…**-n** (`gan`, `han`, `gen`, `hen`, …) are closed [join-relations](special-vocabulary.md#join-relations), not joins. No three-vowel stacks. Other roots under those prefixes are unchanged.

---

# Fence nesting (all levels)
<a id="fence-nesting"></a>
<a id="opener-r-coordination"></a>
<a id="vowels--endings"></a>
<a id="ending-senses-clause-joins"></a>

Flat coordination uses **one** fence (left or right). **Nested** joins use **more than one** fence of the same PoS prefix. Association follows fence side:

| Pattern | Associativity | Example | Reading |
|---------|---------------|---------|---------|
| **Left fence stack** | **Right-associative** | `vol A val B C` | *A ∨ (B ∧ C)* — later fence is one conjunct of the earlier |
| **Right close stack** | **Left-associative** | `A B vol C val` | *(A ∨ B) ∧ C* — each close folds what’s to its left, then that group joins the next |

Flat n-ary (one fence): `vol A B C` / `A B C vol` → *A ∨ B ∨ C*. Nested same-vowel: `vol A vol B C` → *A ∨ (B ∨ C)*; `A B vol C vol` → *(A ∨ B) ∨ C*.

**Pure infix is illegal:** do not write `A vol B val C` (join between every pair with neither a clean left stack nor a clean right stack). Use all-left or all-right nesting, or a flat single fence.

Same rule at phrase, VP, and clause level (`zol A zal B C`, `vol A val B C`, `xol A xal B C`, …). Shared modifiers stay immediately after **each** fence particle they attach to.

---

# Soft **-n** (clause only)
<a id="soft-n-clause"></a>
<a id="soft-n-vp-clause"></a>
<a id="ending-senses"></a>

On **`/x/`** only, join **-n** is **soft packaging** (not phrase named/conventional **-n**). Narrative *and then* between clauses is **`xan`**. Soft lists use the same **fence** shape as **-l** / **-m** (left preferred; right close allowed; nesting per [fence nesting](#fence-nesting)). Soft lists do **not** carry a separate closed/open bit; treat completeness as open-leaning unless you upgrade to a committed **-l** / **-m** fence (optionally with `/h/` evidential hedges). Per vowel:

| Form | Soft reading |
|------|----------------|
| **`xan`** (*and*) | *and then…* (temporal / story sequence, not mere logical *and*) |
| **`xon`** (*xor*) | *or maybe…* — uncertain alternatives (not automatic empty-allowed; use **`xom`** for *or none*) |
| **`xun`** (negation) | soft *not* / *none of… as I recall…* — reconstructed or hedged denial (focus *not X*; multi soft *none of*; bare soft *no*). Contrast phrase named **`zun`** (conventional denial bundle), not empty-allowed / *or none* |
| **`xaon`** (*and/or*) | *and/or maybe…* — soft multi-fit |
| **`xuan`** (*everything but*) | *everything but… maybe* — soft complement inventory |
| **`xuon`** (*anything but*) | *anything but… maybe* — soft complement free choice |
| **`xen`** (*ranked*) | *maybe prefer… / else maybe…* — soft or reconstructed ranking (exclusivity unmarked; earlier ≻ later) |
| **`xaen`** (*co-sat. ranked*) | soft ranked multi-fit |
| **`xoen`** (*excl. ranked*) | soft exclusive ranked fallback |
| **`xuen`** (*rank reversal*) | soft ascending / reverse ranking (*A ≺ B ≺ C*) |

VP `/v/`…**-n** spellings are **not** soft joins — they are closed [join-act verbs](special-vocabulary.md#join-act-verbs) (`van`, `von`, …). `/ɡ/` `/h/`…**-n** are [join-relations](special-vocabulary.md#join-relations) (`gan`, `han`, …). Titled / official discourse labels stay **other** `/x/`…**-n** forms (different roots, not this vowel series) — see [reference-suffix.md](reference-suffix.md#discourse-markers-x).

---

# VP / clause forms (endings)
<a id="vp-clause-forms"></a>

Word shape: prefix + vowel root (+ further vowels for stacked forms) + ending. Writing glues stacked vowels (`vaol`, `vael`, `voel`, `vual`, `vuol`, `vuel`, `xaol`, …). Spoken order is first vowel then next, then the ending — same as phrase-level `zaol` / `zael` / `zoel` / `zual` / `zuol` / `zuel`. No three-vowel stacks.

| | **-l** | **-m** | **-n** | **-r** unspecified |
|---|--------|--------|--------|---------------------|
| **a** (*and*) | `val` / `xal` closed | `vam` / `xam` open | `xan` soft; **`van`** = [join-act](special-vocabulary.md#join-act-verbs) | `var` / `xar` |
| **o** (xor) | `vol` / `xol` closed | `vom` / `xom` open | `xon` soft; **`von`** = join-act | `vor` / `xor` |
| **u** (negation) | `vul` / `xul` closed | `vum` / `xum` open | `xun` soft; **`vun`** = join-act | `vur` / `xur` |
| **ao** (and/or) | `vaol` / `xaol` closed | `vaom` / `xaom` open | `xaon` soft; **`vaon`** = join-act | — |
| **ua** (everything but) | `vual` / `xual` closed | `vuam` / `xuam` open | `xuan` soft; **`vuan`** = join-act | — |
| **uo** (anything but) | `vuol` / `xuol` closed | `vuom` / `xuom` open | `xuon` soft; **`vuon`** = join-act | — |
| **e** (ranked) | `vel` / `xel` closed | `vem` / `xem` open | `xen` soft; **`ven`** = join-act | `ver` / `xer` |
| **ae** (equality / tie) | `vael` / `xael` closed | `vaem` / `xaem` open | `xaen` soft; **`vaen`** = join-act | — |
| **oe** (excl. ranked) | `voel` / `xoel` closed | `voem` / `xoem` open | `xoen` soft; **`voen`** = join-act | — |
| **ue** (rank reversal) | `vuel` / `xuel` closed | `vuem` / `xuem` open | `xuen` soft; **`vuen`** = join-act | — |

Prefix: **`/v/`** for [VP-level](#vp-level-coordination); **`/x/`** for [clause-level](#clause-level-coordination). **-r** only on **a** / **o** / **e** / **u** — see [unspecified-member](#unspecified-member-r-phrase). No stacked-vowel **-r** (`vaor` / `xaor` / `vaer` / `xaer` / `voer` / `xoer` / `vuar` / `vuor` / `vuer` / …).

**-l** / **-m** — committed closed / open lists (same senses as phrase). Soft **-n** — clause only ([above](#soft-n-clause)). VP **-n** — [join-act verbs](special-vocabulary.md#join-act-verbs). **-r** — unspecified-member (under question = fill-ask — [questions.md](questions.md#fill-ask-r)), not list continue.

**Flat fence shape** (same as phrase):

```
COORD ( SHARED )* ITEM ITEM ( ITEM )*   ← left (preferred); two or more when not focus/bare-allowed
ITEM ITEM ( ITEM )* COORD ( SHARED )*   ← right close
COORD ( SHARED )* ITEM            ← focus …ar/…or/…er/…ur or negation …ul/…um (VP) / …un (phrase named / clause soft)
COORD ( SHARED )*               ← bare …ar/…or/…er/…ur or negation …ul/…um (VP) / …un (phrase named / clause soft)
```

Examples (flat): `vam A B` / `A B vam` → *A and B* (open); `val A B C` → closed three-way *and*; `xan A B C` → *A and then B and then C*; `vel A B` → *A ≻ B*; `vol A B` → *A or B* (exactly one); `vom A B` → *A or B or neither* (at most one); `var` → *do something*; `xar` → *something happened*; `vul v-runl` → *didn’t run*; `vul` → *no* / *don’t* (bare denial); `xul SENT` → *not SENT*.

Nesting: [fence nesting](#fence-nesting) — e.g. `vol A val B C` → *A or (B and C)*; `A B vol C val` → *(A or B) and C*.

---

# VP-level joins

VP-level joins join **verb phrases** inside one clause: each conjunct is a verb plus that verb’s own object material (`/d/` NP, including phrase-level structure on the object), unless a shared object sits before a left fence (below). They share one clause subject (`/z/`) and one [clause force](language-reference.md#utterance-markers-j). The join prefix is always **`/v/`**. Forms and endings: [VP / clause forms](#vp-clause-forms) (**-l** / **-m** / **-r** only as joins). Shape and nesting: [fence nesting](#fence-nesting). Soft *and then*: clause **`xan`** ([soft **-n**](#soft-n-clause)). Unspecified **-r**: [unspecified-member](#unspecified-member-r-phrase).

## Conjuncts and scope

- **VP** — one verb (`/v/` content word) plus that verb’s own `/d/` object material when present (simple object or [phrase-level](#phrase-level-coordination) object chain). Object NPs may include their `/ɡ/` / `/w/` / `/b/` stacks. The shared `/z/` subject is **outside** the VP chain.
- **Shared object (verb-only conjuncts)** — when every conjunct is a bare verb (no per-conjunct `/d/`), a `/d/` **immediately before** a left-fence join scopes over **all** verbs alike: `d-applel vam v-washl v-eatl` → *washed and ate an apple*. If any conjunct carries its own `/d/`, do not use a pre-fence shared object; put objects inside each conjunct.
- **`/h/` scope relative to the fence**
 - **`/h/` before a left-fence VP join** (outside the chain) → applies to **every** conjunct (*quickly washed and ate*).
 - **`/h/` inside a conjunct** (after that conjunct begins, before the next conjunct head or end of chain) → applies to **that VP only**.
 - **`/h/` after the whole VP chain** → attaches to the **last** conjunct only. For shared manner/mood over all VPs, put `/h/` before the left fence.
- Other non-VP clause material (subject, clause force) stays outside the chain.

### Examples (schematic)

- `vam d-applel v-eatl d-waterl v-drinkl` → *(ate an apple) and (drank water)* (open); `d-applel v-eatl d-waterl v-drinkl vam` → same with right close
- `val d-applel v-eatl d-waterl v-drinkl d-breadl v-bakel` → closed *and* of three VPs
- `vel d-applel v-eatl d-cakel v-eatl` → *ate an apple ≻ ate a cake* (closed ranked, exclusivity unmarked)
- `vael d-applel v-eatl d-cakel v-eatl` → *ate an apple as much as ate a cake* / *equally* (closed **ae** — equal weight / tie)
- `vael` → *it’s a draw* / *tied outcome* (bare **ae** on VP)
- `voel d-bugl v-fixl d-workaroundl v-addl` → *fix the bug ≻ add a workaround* (closed exclusive ranked)
- `vuel d-appetizerl v-eatl d-dessertl v-eatl` → *ate an appetizer ≺ ate dessert* (closed rank reversal)
- `vual v-liet v-shoutl` → *do everything but lie or shout*
- `vuol v-calll v-emaill` → *do anything but call or email*
- `vem d-applel v-eatl d-waterl v-drinkl` → *ate an apple ≻ drank water* (open ranked, unmarked)
- `h-quicklyl vam d-applel v-eatl d-waterl v-drinkl` → *quickly* *(ate an apple and drank water)*
- `vam d-applel v-eatl h-quicklyl d-waterl v-drinkl` → *(quickly ate an apple) and (drank water)*
- `d-applel vam v-washl v-eatl` → *washed and ate an apple* (shared object before left fence)
- `vol d-applel v-eatl d-waterl v-drinkl` → *ate an apple or drank water* (exactly one); `vom d-applel v-eatl d-waterl v-drinkl` → *ate an apple or drank water or neither*
- `vol d-applel v-eatl val d-waterl v-drinkl d-breadl v-bakel` → *ate an apple, or ((drank water) and (baked bread))* (left nest)
- `d-applel v-eatl d-waterl v-drinkl vol d-breadl v-bakel val` → *((ate an apple) or (drank water)) and (baked bread)* (right nest)
- `var` → *do something*; `var v-runl` → *some (unspecified) running*; `vor v-runl v-jumpl` → *any of running or jumping*
- `vul v-runl` → *didn’t run*; `vul d-applel v-eatl d-waterl v-drinkl` → *neither ate an apple nor drank water*; `vul` → *no* / *don’t* (bare denial; contrast `zoel` *do nothing* as empty triage); `vur` → *do something else*
- Under question: `var` → *What (did they) do?*; `vur` → *What else (did they do)?*; `vul v-runl` → *Didn’t run?* — [questions.md](questions.md#fill-ask-r)
- Join-act verbs (not joins): `jal z-Samn d-pathl von` → *Sam chooses the path (as the one choice)* — [special-vocabulary.md](special-vocabulary.md#join-act-verbs)
- Clause sequence (*and then*): `xan SENT₁ SENT₂` — not a VP `van` join

## Constraints

- **One clause** — one `/j/` force, one shared `/z/` subject (when present).
- **Each conjunct has its own verb**; objects are per-conjunct unless the shared-object-before-left-fence pattern applies.
- **`/h/`** follows the before-fence / inside-conjunct / after-chain rules above.
- **No gapping** of subject or object across VPs (beyond the shared-object pattern).
- **No `-sh`** on the join.
- **Fence** — left preferred, right close allowed; nesting per [fence nesting](#fence-nesting); **no pure infix**.
- **-r** is unspecified-member (`var` / `vor` / `ver` / `vur`), not continue. Focus/bare allowed on **-r** forms and on negation **`vul` / `vum`** among VP joins (not **`vun`** — that is a join-act verb).
- **Not** full sentences — those stay `/x/`…; **not** phrase-level NP/AP joins — those stay [phrase-level](#phrase-level-coordination).

## Reserved forms

Under `/v/`, join endings are **-l** / **-m** / **-r** only on the join vowels (`val`, `vam`, `var`, `vol`, `vom`, `vor`, `vul`, `vum`, `vur`, `vaol`, `vaom`, `vual`, `vuam`, `vuol`, `vuom`, `vel`, `vem`, `ver`, `vael`, `vaem`, `voel`, `voem`, `vuel`, `vuem`). Those spellings are **only** VP joins — not ordinary content verbs with those vowel roots. The parallel **-n** spellings (`van`, `von`, `vun`, `vaon`, `vuan`, `vuon`, `ven`, `vaen`, `voen`, `vuen`) are closed [join-act verbs](special-vocabulary.md#join-act-verbs). No three-vowel stacks. No stacked-vowel **-r** (`vaor`, `vaer`, `voer`, `vuar`, `vuor`, `vuer`, …). Other roots under `/v/` are unchanged.

---

# Clause-level joins

Clause-level joins join **full sentences**. They are **`/x/`** discourse markers whose **root is the same vowel series** as phrase- and VP-level joins. They take a [reference-suffix letter](reference-suffix.md): **-l**, **-m**, **-n**, or **-r**. They do **not** take plural **-sh**. Forms: [VP / clause forms](#vp-clause-forms). Shape and nesting: [fence nesting](#fence-nesting) (same as VP and phrase). Soft **-n**: [soft **-n**](#soft-n-clause) (including *and then* **`xan`**). Unspecified **-r**: [unspecified-member](#unspecified-member-r-phrase).

Endorsement strength and evidentiality stay on each clause’s `/h/` (or `/w/`), not on the join.

## Conjuncts

- **SENT** — a complete sentence beginning with `/j/` (optional vocative(s) / interjection(s), then clause force, then clause body).
- Flat lists: one fence before (preferred) or after the conjunct sentences. Nested lists: [fence nesting](#fence-nesting).

### Examples (schematic)

- `xal A B` → *A and B* (closed); `xam A B` → open; `A B xam` → same open with right close
- `xal A B C` → *A and B and C* (one closed *and*-list)
- `xol A B C` → *A or B or C* (exactly one; closed); `xom A B C` → *A or B or C or none* (at most one; open, empty-allowed)
- `xan A B C` → *A and then B and then C*
- `xel A B` → *A ≻ B* (closed ranked, unmarked); `xem A B` → open; `xen A B C` → soft
- `xael A B` → *A and B equally* / *tied claims* (closed **ae**); `xael` → *it’s a draw* (bare); `xoel A B C` → exclusive closed ranked
- `xual A B` → *everything but A and B*; `xuol A B` → *anything but A or B*; `xuel A B` → *A ≺ B* (rank reversal)
- Nesting: `xol A xol B C` → *A or (B or C)*; `A B xol C xol` → *(A or B) or C*; flat three-way *or* is `xol A B C`
- `xol A xal B C` → *A or (B and C)*; `A B xol C xal` → *(A or B) and C*
- `xar` → *something happened*; under question → *What happened?*; `xur` → *something else happened*; under question → *What else happened?* ([questions.md](questions.md#fill-ask-r)); `xul SENT` → *not SENT*; `xul` → *no* (bare denial)

## Constraints

- **Same clause force** on every conjunct (same `/j/` force form — e.g. all **jal**, all **jol**, all **jel**, …). Mixed force → separate sentences or [subordination](language-reference.md#dependent-clauses), not this join.
- **No gapping / shared arguments** across conjuncts. Repeat material, or use phrase-level (NP / AP / …) or VP-level joins inside one clause.
- **Fence** — left preferred, right close allowed; nesting per [fence nesting](#fence-nesting); **no pure infix**.
- **-r** is unspecified-member (`xar` / `xor` / `xer` / `xur`), not continue / “same linker again”. Focus/bare allowed on **-r** forms and on negation **`xul` / `xum` / `xun`** among clause joins. Resume of a prior non-join `/x/` linker still uses content-word **/x/`…`-r`** per [pronouns.md](pronouns.md).
- **Not subordination:** *because* / *if* / *although* stay `/h/` + `/b/` [next-clause pronoun](pronouns.md#special-pronouns).
- **Not general *but* / *however* / *therefore* / *meanwhile* / *next*:** those are other `/x/` linkers. *Including* / *rather* / *instead* / *except* (in-clause) and *additionally* / *in other words* / claim *instead* / *except* (before `/j/`) are [reviser](revisers.md), not clause joins. *Starting with* = **`x#e-l`**; *Finally* = **`x#el`**. Phrase-, VP-, and clause-level **ranked** and **invert** (**zel** / **zael** / **zoel** / **zuel** / **zual** / **zuol** / **gel** / **vel** / **vael** / **voel** / **vuel** / **vual** / **vuol** / **xel** / **xuel** / …) **are** this series.

## Reserved forms

Under `/x/`, the join series plus an allowed ending (`xal`, `xam`, `xan`, `xar`, `xol`, `xom`, `xon`, `xor`, `xul`, `xum`, `xun`, `xur`, `xaol`, `xaom`, `xaon`, `xual`, `xuam`, `xuan`, `xuol`, `xuom`, `xuon`, `xel`, `xem`, `xen`, `xer`, `xael`, `xaem`, `xaen`, `xoel`, `xoem`, `xoen`, `xuel`, `xuem`, `xuen`) are **only** these clause joins — not other discourse-marker roots with those vowels. No three-vowel stacks. No stacked-vowel **-r** (`xaor`, `xaer`, `xoer`, `xuar`, `xuor`, `xuer`, …). Other `/x/` roots are unchanged.
