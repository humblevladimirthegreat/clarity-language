# Coordination

This page is the source of truth for **phrase-level** (same-slot fence: left preferred, right close allowed), **VP-level**, and **clause-level** coordination, plus **in-clause revision** with prefix-less vowels + **-l** / **-m** / **-n**. There is **no** bare word-level **coordinator** series (lists still need a PoS prefix + ending). Correlatives (*both…and*, *either…or*) come later. Asymmetric discourse glue (*but*, *however*, *therefore*) is `/x/` but **not** the prefixed join series — see [language-reference.md](language-reference.md#discourse-markers-x). In-clause *including* / *rather* / *instead* / *except* use [revision](#in-clause-revision-bare-a--e--o--u) (**al** / **am** / **an** / **el** / … — ending required); sentence-level *instead* / *except* (claim-to-claim) stay other `/x/` roots when needed.

PoS prefixes and ordinary word shape: [language-reference.md](language-reference.md). Reference suffixes: [reference-suffix.md](reference-suffix.md). Phonotactics for reserved coordinator roots: [phonology.md](phonology.md#phonotactics).

**List shapes:** **Phrase-level**, **VP-level**, and **clause-level** all use a **fence**: prefixed coordinator plus optional shared modifiers **immediately after** that coordinator; conjuncts juxtaposed (no mid-chain continue particle). **-r** on **a** / **o** / **e** / **u** is the [unspecified-member](#unspecified-member-r-phrase) series at every level (*something* / *anything* / *whatever-by-rank* / *some objection* — VP: *do something* / …; clause: *something happened* / …). **Left fence** (coordinator before the conjuncts) is preferred; **right close** (coordinator after the conjuncts) is allowed for style or comedy. **Nesting** uses extra fences: left stack = right-associative, right stack = left-associative; **pure infix is illegal** — see [fence nesting](#fence-nesting).

Prefixed forms are **joiners** (boolean lists plus directional **ranked conjunction**), not only symmetric conjunctions. Prefix-less **al** / **am** / **an** / **el** / **em** / **en** / **ol** / **om** / **on** / **ul** / **um** / **un** are a separate **revision** series — see [below](#in-clause-revision-bare-a--e--o--u).

## Join type × ending (shared)

**Vowel(s)** choose join type. All coordinators take an ending (no bare vowel) and a **PoS prefix** matching the slot. For every join vowel (**a** / **o** / **u** / **ao** / **e** / **ae** / **oe**), **-l** / **-m** mark **closure**. Phrase-level **-n** marks a **named / conventional** list. **VP-level** and **clause-level** **-n** mark **soft packaging** (not named) — see [soft **-n**](#soft-n-vp-clause). **-r** on **a** / **o** / **e** / **u** marks an [unspecified member](#unspecified-member-r-phrase) at **every** level (*something* / *anything* / *whatever-by-rank* / *some objection*).

### Join type (vowel series)

| Vowel / writing | Meaning |
|-----------------|---------|
| **a** / `a` | *and* |
| **o** / `o` | exclusive *or* (pick **one**) |
| **u** / `u` | *nor* (none of the conjuncts) |
| **a** + **o** / `ao` | inclusive *and/or* (one **or** more) |
| **e** / `e` | **ranked conjunction** — earlier outranks later (*A ≻ B ≻ C*); **directional**; exclusivity of satisfaction **not** claimed |
| **a** + **e** / `ae` | **co-satisfiable ranked** — ranked; **one or more** may hold (*prefer A most, then B, …*) |
| **o** + **e** / `oe` | **exclusive ranked** — ranked; pick / try **one** (*A else B else C*) |

### Closure ending (all join vowels)

| Ending | Meaning |
|--------|---------|
| **-l** | **Closed** (exhaustive) — the listed conjuncts are treated as the **only** ones in play for this claim (Claritish *eor*-style completeness). |
| **-m** | **Open** (non-exhaustive) — other conjuncts may exist (*among others*, *including but not limited to*; Claritish *ior*-style). |

When unsure whether the list is complete, prefer **-m** (open). Use **-l** when you stand behind completeness (inventories, forced-choice menus, definitions, full ranked ladders).

### Named / conventional ending (phrase-level, all join vowels)

| Ending | Meaning |
|--------|---------|
| **-n** | **Named / conventional list** — the conjuncts are invoked as an established titled, formulaic, or canonical bundle (*the primary colors*, *RGB*, *stop–drop–roll*, a conventional triage order), not as a freshly composed open or closed inventory. |

**-n** is an alternative to **-l** / **-m**, not a third completeness tier and not stackable with them. Completeness is whatever the conventional designation already fixes; you are naming the bundle, not arguing list closure in the moment. Same mnemonic as content-word [proper name **-n**](reference-suffix.md#proper-name--n): definite by established label. Used on **phrase-level** coordinators (`/z/` `/d/` `/b/` `/ɡ/` `/w/` `/h/`) — **not** on VP `/v/` or clause `/x/` forms (those use soft **-n** instead). [In-clause revision](#in-clause-revision-bare-a--e--o--u) also uses this named sense (`an` / `en` / `on` / `un`). Soft packaging (`van`…, `ven`…, `xan`…, `xen`…) is not a named list — use other `/x/`…**-n** thread labels if you need a titled agenda item.

### Unspecified-member ending (phrase-level, **a** / **o** / **e** / **u**)
<a id="unspecified-member-r-phrase"></a>
<a id="unspecified-member-r-phrase-a--o"></a>
<a id="something-anything-r"></a>

Prefixed **-r** on **a** / **o** / **e** / **u** marks an **unspecified member of a domain** — not content-word anaphor **-r**, and not stackable with **-l** / **-m** / **-n**. Same series on **phrase** (`/z/` `/d/` `/b/` `/ɡ/` `/w/` `/h/`), **VP** (`/v/`), and **clause** (`/x/`). Other join vowels (**ao** / **ae** / **oe**) take **no** **-r**.

| Vowel | Form | Series | Domain reading |
|-------|------|--------|----------------|
| **a** | `zar` / `dar` / `bar` / `gar` / `war` / `har` / **`var`** / **`xar`** | ***something*** — existential unspecified member of an inventory frame | nullary: unrestricted; unary: kind = the conjunct; multi: among the listed conjuncts |
| **o** | `zor` / `dor` / `bor` / `gor` / `wor` / `hor` / **`vor`** / **`xor`** | ***anything*** — free-choice / indifferent pick-one from a menu frame | same arity pattern; free-choice, not epistemic “I don’t know which” |
| **e** | `zer` / `der` / `ber` / `ger` / `wer` / `her` / **`ver`** / **`xer`** | ***whatever-by-rank*** — free choice *by preference* (unnamed top / preferred member) | nullary: unrestricted “what matters most”; unary: kind as a priority; multi: whichever ranks highest among the listed |
| **u** | `zur` / `dur` / `bur` / `gur` / `wur` / `hur` / **`vur`** / **`xur`** | ***some objection*** — existential unspecified member of a *nor* / denial frame | nullary: some catch / something’s off; unary: some objection involving that kind; multi: objection to some among the listed |

**VP / clause glosses** (same arity pattern; conjunct = VP or sentence):

| | Nullary | Unary | Multi | Under polar Q |
|--|---------|-------|-------|---------------|
| **`var` / `xar`** | *do something* / *something happened* | *some (unspecified) X-ing* / *some (unspecified) claim in frame X* | *some one among these actions / claims* | *What (did they) do?* / *What happened?* / *Which of these?* |
| **`vor` / `xor`** | *do anything* / *anything (may hold)* | *any X-ing* / *any claim of kind X* | *any of these* | *Do anything?* / *Anything?* / *Any of these?* |
| **`ver` / `xer`** | *do whatever matters most* / *whatever matters most (as outcome)* | *preferentially some X-ing* / *X as priority claim* | *whichever ranks highest* | *What’s the priority (to do / as outcome)?* |
| **`vur` / `xur`** | *some catch (re doing)* / *something’s off* | *some objection involving X-ing / claim X* | *objection to some among these* | *What’s the objection?* / *What’s wrong?* |

**Arity** (same length rule as other unary / nullary phrase forms):

| Length | **`…ar` (*something*)** | **`…or` (*anything*)** | **`…er` (*whatever-by-rank*)** | **`…ur` (*some objection*)** |
|--------|-------------------------|------------------------|--------------------------------|------------------------------|
| **0** (nullary) | *something* / *someone* | *anything* / *anyone* | *whatever’s most important* / *whatever comes first* | *some objection* / *there’s a catch* / *something’s off* |
| **1** (unary) | *some (unknown) X* / *an unspecified X* | *any X* | *X as a priority* / *preferentially some X* | *some objection involving X* / *not okay re X (unspecified how)* |
| **2+** (multi) | *some one among these* | *any of these* | *whichever of these ranks highest* / *the preferred one among these* | *objection to some among these* / *nor some (unspecified) of these* |

Mnemonic: **-r** = member not named; vowel = frame (**a** = inventory existence; **o** = exclusive menu; **e** = ranked preference; **u** = denial / *nor*). Positive twins of nullary emptiness: `zal` / `zam` → **`zar`**; `zol` / `zom` → **`zor`**; `zel` / `zem` → **`zer`** (*whatever matters*, vs *don’t care* / *I don’t have a ranking*); `zul` / `zum` → **`zur`** (*some objection*, vs *no objections*).

**Contrast:**
- Content-word `-l`: `z-personl` = ordinary first-mention indefinite (*a person*). `zar z-personl` / `z-personl zar` = **explicitly non-identified** (*some person, unknown / unspecified who*). Do not use `zar` / `zor` where ordinary `-l` / `-m` introduction is enough.
- `zor A B C` = any of them is fine (**no** order). `zer A B C` = pick / take **by ranking** among them.
- Revision **`ul` / `um`**: *except* a named right-hand side. Prefixed **`zur`**: unspecified denial in the slot (*some objection*), not an *except*-revision particle.

**Under [polar question](language-reference.md#utterance-markers-j) force:** these forms are the **content-question** series (ask to name the unspecified member). Nullary `zar` / `zor` / `zer` / `zur` → *Who/what?* / *What (anything)?* / *What’s the priority?* / *What’s the objection?*; nullary `var` / `vor` / `ver` / `vur` → *What (did they) do?* / *Do anything?* / *What’s the priority (to do)?* / *What’s the objection (re doing)?*; nullary `xar` / `xor` / `xer` / `xur` → *What happened?* / *Anything?* / *What’s the priority (as outcome)?* / *What’s wrong?*; unary / multi parallel the phrase pattern in the queried slot. The answer **need not** keep **-r**: a fill may be a bare content word, unary **-l** / **-m** / **-n**, or a longer list with any allowed ending. Unbound *who* / *what* / *where* = nullary phrase **-r** in the queried slot (PoS = role); unbound *what did they do?* / *what happened?* = nullary **`var`** / **`xar`** (etc.) — no separate interrogative pronoun. Negation / NPI-flavored *anything* stays on `/h/` (or similar) when needed — `zor` / `vor` / `xor` themselves are free-choice, not negative-polarity markers.

**-r** is a **whole-fence** coordinator (`zar` / `var` / `xar` alone, or with conjuncts), same placement rules as `zam` / `vam` / `xam`. Do not write `zam A zar B` or `vam A var B` as a mid-chain extender.

### Ranked conjunction (**e** / **ae** / **oe**)
<a id="ranked-conjunction-e"></a>
<a id="priority-ranking-e"></a>

**Ranked joins are directional**: order matters; **earlier conjuncts outrank later ones** (*A ≻ B ≻ C*). Built like **ao**: stack **a** or **o** onto **e** when exclusivity of satisfaction matters. There is **no** three-vowel **aoe** — co-satisfiable ranked is **ae**.

| Vowel | Exclusivity | Typical use |
|-------|-------------|-------------|
| **e** | **not claimed** — ranking only | descriptive / podium order; when exclusivity is irrelevant or left open |
| **ae** | **co-satisfiable** — one **or** more may hold | ranked wishlist; identity / value ranking (*Christian ≻ Conservative ≻ Republican*) |
| **oe** | **exclusive** — pick / try **one** | menu fallback (*burger else chicken*); contingency (*fix else workaround*); triage |

English glosses still vary by frame — *prefer A over B*, or *A, else B* — but that **preference vs contingency** contrast is read from context (or marked elsewhere with `/h/`), **not** by a different ending. **ae** vs **oe** only mark whether several conjuncts may be realized along the ladder.

**-l** / **-m** / **-n** on **e** / **ae** / **oe** are the same closure / named (phrase) or soft (VP/clause) senses as on **a** / **o** / **u** / **ao**. Fence chains keep left-to-right ranking of spoken conjunct order (`vel A B C` → *A ≻ B ≻ C*, closed; same with `vael`… / `voel`… / `xel`…).

| Ending | Form | Reading |
|--------|------|---------|
| **-l** | phrase: `zel` / `zael` / `zoel` (and `/d/` `/b/` `/ɡ/` `/w/` `/h/`); VP/clause: `vel` / `vael` / `voel` / `xel` / `xael` / `xoel` | Closed ranked — these ranks only: `zel A B` → *A ≻ B* (exhaustive); `zoel A B C` → *A ≻ B ≻ C* (exclusive, exhaustive) |
| **-m** | phrase: `zem` / `zaem` / `zoem` …; VP/clause: `vem` / `vaem` / `voem` / `xem` / `xaem` / `xoem` | Open ranked — ranking among these; others may exist |
| **-n** | phrase: `zen` / `zaen` / `zoen` …; VP/clause: `ven` / `vaen` / `voen` / `xen` / `xaen` / `xoen` (soft) | Phrase: named/conventional order; VP/clause soft: tentative / reconstructed ranking — see [soft **-n**](#soft-n-vp-clause) |

#### Unary and nullary phrase-level
<a id="unary-phrase"></a>
<a id="unary-ranked"></a>
<a id="nullary-phrase"></a>

A **one-conjunct** (**unary**) or **zero-conjunct** (**nullary**) fence is allowed on phrase-level slots (`/z/` `/d/` `/b/` `/ɡ/` `/w/` `/h/`) for the forms below, and on **VP** / **clause** for **…ar** / **…or** / **…er** / **…ur** only (`var` / `vor` / `ver` / `vur` / `xar` / …). The coordinator alone (nullary), or the coordinator plus one conjunct (unary), fills the slot — optionally with **SHARED** after the coordinator. All other VP/clause coordinators (**-l** / **-m** / soft **-n**), and phrase coordinators outside the unary/nullary set, stay **two or more** conjuncts.

**Arity pattern:** length 2+ = ordinary list (or, for **…ar** / **…or** / **…er** / **…ur**, unspecified member among the listed); length 1 = focus / exhaustivity on that singleton (or the matching unspecified-member unary for **-r** forms); length 0 = emptiness in that join frame — except **…ar** / **…or** / **…er** / **…ur**, which are positive unspecified-member readings (*something* / *anything* / *whatever-by-rank* / *some objection*), not emptiness. On other nullary forms, **-l** = empty **and claimed complete** for the frame; **-m** = empty **from the speaker’s list** (often epistemic) with residual existence or residual options outside what’s named; **-n** = named/conventional empty label.

**Under [polar question](language-reference.md#utterance-markers-j) force** (phrase-level for entity/property slots; VP/clause for action/claim slots):

- Unary **-l** / **-n** — confirm the singleton frame (*Just X?*, *Has to be X?*, conventional label).
- Unary **-m** — **offer** that singleton (*How about X?*, *Want X?*, *Try X first?*).
- Nullary **-l** — colloquial check on emptiness (*Nothing?*, *No options?*, *Do nothing?*).
- Nullary **-m** — confirm open emptiness / speaker-style gap (*Got nothing?*, *No pick?*, *No ranking?*) — **not** the primary content-question form.
- Nullary **-n** — confirm the conventional empty label (*Null?*, *Draw?*).
- Nullary / unary / multi **…ar** / **…or** / **…er** / **…ur** — **content questions** (ask to name the unspecified member): unbound *who* / *what* / *where*, *what did they do?*, *what happened?*, *any X?*, *which of these?*, *what’s the priority?*, *what’s the objection?* — see [unspecified-member **-r**](#unspecified-member-r-phrase). Answer ending free (need not keep **-r**).

Unbound *who* / *what* / *where* = nullary **…ar** / **…or** / **…er** / **…ur** in the queried slot. **Length 2+** (no separate table): **-l** = pick from this closed menu (esp. **o** / **oe**); **-m** = pick, or name something else — answer ending likewise free; **…ar** / **…or** / **…er** / **…ur** = content Q among the listed (*which of these?* / *any of these?* / *whichever ranks highest?* / *objection to which of these?*).

**Ranked — unary**

| Form | Unary reading | Contrast | Under question |
|------|---------------|----------|----------------|
| **…em** (`zem` / `dem` / `bem` / `gem` / `wem` / `hem`) | *X first* / *mainly X* | Open preference — other ranks may exist | *Is X the top priority?* / *Prefer X?* (offer) |
| **…el** (`zel` / `del` / …) | *only X matters* / *X, period* | Closed twin of **…em** — nothing else ranks for this claim | *Is X the only priority?* |
| **…oem** (`zoem` / `doem` / …) | *start with X* / *try X first* | Contingency / menu primary — not value ranking | *Try X first?* / *Start with X?* (offer) |
| **…oel** (`zoel` / `doel` / …) | *only try X* / *X or nothing* | Closed twin of **…oem** — exclusive triage, no fallback | *Only try X?* |
| **…en** (`zen` / `den` / …) | *X first* (stock) / *X, as usual* | Named / formulaic top item (*safety first* as a stock frame) | *X first, as usual?* |
| **…er** (`zer` / `der` / …) | *preferably some X* | Unspecified preferred member of kind X — not a closed “only X” (**…el**) | *Which X is first?* (content Q) |

**Ranked — nullary**

| Form | Nullary reading | Contrast | Under question |
|------|-----------------|----------|----------------|
| **…el** (`zel` / `del` / …) | *don’t care* / *no preference* | Closed empty ladder | *No preference?* / *Don’t care?* |
| **…em** (`zem` / `dem` / …) | *I don’t have a ranking* / *beats me what’s most important* | Open — same humility pattern as nullary **…am** | *No ranking?* / *Don’t have a priority?* |
| **…oem** (`zoem` / `doem` / …) | *not sure where to start* | Empty exclusive triage, open | *Not sure where to start?* |
| **…oel** (`zoel` / `doel` / …) | *do nothing* / *don’t bother* | Closed empty exclusive triage — no attempt, and that’s the full story | *Do nothing?* / *Skip it?* |
| **…en** (`zen` / `den` / …) | *it’s a draw* / *tie* | Named / conventional empty ranking outcome — no ordered winner | *Draw?* / *Tie?* |
| **…er** (`zer` / `der` / …) | *whatever’s most important* / *whatever comes first* | Positive twin of **…el** / **…em** — unnamed top priority | *What’s the priority?* / *What matters most?* (content Q) |

**Boolean — unary**

| Form | Unary reading | Contrast | Under question |
|------|---------------|----------|----------------|
| **…al** (`zal` / `dal` / `bal` / `gal` / `wal` / `hal`) | *just X* / *only X* | Closed *and* of one — exhaustive inventory, **not** a priority claim (milder than **…el**) | *Just X?* / *Only X?* |
| **…am** (`zam` / `dam` / `bam` / `gam` / `wam` / `ham`) | *X, for one* / *X, say* | Open *and* of one — same open bit as multi-item **am** | *How about X?* / *Want X?* (offer) |
| **…ol** (`zol` / `dol` / …) | *has to be X* / *X only* | Closed xor of one — forced exclusive pick, not inventory (**…al**) or priority (**…el**) | *Has to be X?* |
| **…om** (`zom` / `dom` / …) | *say, X* / *X maybe* | Open xor of one — pick-one frame; X is a candidate; other exclusives may exist | *How about X?* / *X, or something else?* (offer) |
| **…aol** (`zaol` / `daol` / …) | *X is enough* / *X’ll do* | Closed *and/or* of one — inclusive frame, stricter than **…aom** | *Is X enough?* |
| **…aom** (`zaom` / `daom` / …) | *at least X* / *X would work* | Inclusive singleton — X is a sufficient hit; others may count | *Would X do?* / *At least X?* (offer) |
| **…ar** (`zar` / `dar` / …) | *some (unknown) X* / *an unspecified X* | Existential unspecified of kind X — not ordinary `-l` first mention | *What/which (unknown) X?* (content Q) |
| **…or** (`zor` / `dor` / …) | *any X* | Free-choice of kind X — menu twin of **…ol** / **…om** | *Any X?* / *Which X (any is fine)?* (content Q) |
| **…ur** (`zur` / `dur` / …) | *some objection involving X* / *not okay re X (unspecified how)* | Existential denial about kind X — not revision *except* (**ul** / **um**) | *What objection re X?* (content Q) |

**Boolean — nullary**

| Form | Nullary reading | Contrast | Under question |
|------|-----------------|----------|----------------|
| **…al** (`zal` / `dal` / …) | *nothing* / *nobody* / *none* | Closed empty inventory — you stand behind emptiness | *Nothing?* / *Nobody?* / *None?* |
| **…am** (`zam` / `dam` / …) | *nothing comes to mind* / *I got nothing* | Open twin — can’t fill the slot, but don’t claim the world is empty | *Got nothing?* / *Nothing comes to mind?* |
| **…an** (`zan` / `dan` / …) | *null* / *void* | Named / conventional empty value (*null*, void marker) | *Null?* / *Void?* |
| **…ol** (`zol` / `dol` / …) | *no options* / *we’re stuck* | Closed empty menu — pick-one with nowhere to land | *No options?* / *Stuck?* |
| **…om** (`zom` / `dom` / …) | *I got no pick* / *can’t say* | Open empty menu — “I don’t have a pick,” not “impossible” | *No pick?* / *Can’t say?* |
| **…aol** (`zaol` / `daol` / …) | *all set* / *nothing more needed* | Closed inclusive — null requirement, and that’s the full story | *All set?* / *Nothing else needed?* |
| **…aom** (`zaom` / `daom` / …) | *nothing I need that I can think of* / *I’m fine for now* | Soft / open null requirement | *Nothing you need?* / *Fine for now?* |
| **…ul** (`zul` / `dul` / …) | *no objections* | Closed empty *nor*-list — denial set empty on purpose | *No objections?* / *We’re good?* |
| **…um** (`zum` / `dum` / …) | *no objection from me (yet)* | Open empty *nor* — withholding denial, not affirming “nothing exists” | *No objection from you (yet)?* |
| **…ar** (`zar` / `dar` / …) | *something* / *someone* | Positive twin of **…al** / **…am** — unspecified member, no kind | *Who/what?* / *Something?* (content Q) |
| **…or** (`zor` / `dor` / …) | *anything* / *anyone* | Free-choice twin of **…ol** / **…om** — unrestricted menu | *What (anything)?* / *Anything?* (content Q) |
| **…ur** (`zur` / `dur` / …) | *some objection* / *there’s a catch* / *something’s off* | Positive twin of **…ul** / **…um** — unspecified denial | *What’s the objection?* / *What's the catch?* (content Q) |

**…ul** / **…um** / **…an** are **nullary-only** on the phrase fence (no defined one-conjunct reading). **…en** nullary is *it’s a draw* / *tie*; unary **…en** stays *X first* (stock). **…ar** / **…or** / **…er** / **…ur** are defined at **all** arities (nullary / unary / multi) — see [unspecified-member **-r**](#unspecified-member-r-phrase).

Examples (unary): `zem z-truthrl` → *truth first* / *mainly truth*; `zel z-truthrl` → *only truth matters*; `zoem z-fixl` → *try a fix first*; `zoel z-fixl` → *only try a fix*; `zen z-safetyl` → *safety first* (stock); `zer z-safetyl` → *safety as a priority*; `zal z-waterl` → *just water*; `zam z-Samn` → *Sam, for one*; `zol z-waterl` → *has to be water*; `zom z-coffeel` → *say, coffee*; `zaol z-waterl` → *water’ll do*; `zaom z-waterl` → *at least water*; `zar z-personl` → *some (unknown) person*; `zor z-personl` → *any person*; `zur z-contractl` → *some objection involving the contract*.

Examples (nullary): `zal` → *nothing* / *nobody*; `zam` → *nothing comes to mind*; `zan` → *null* / *void*; `zol` → *no options* / *we’re stuck*; `zom` → *I got no pick*; `zaol` → *all set*; `zaom` → *nothing I need*; `zul` → *no objections*; `zum` → *no objection from me (yet)*; `zar` → *something* / *someone*; `zor` → *anything* / *anyone*; `zer` → *whatever’s most important*; `zur` → *some objection* / *there’s a catch*; `zel` → *don’t care*; `zem` → *I don’t have a ranking*; `zoem` → *not sure where to start*; `zoel` → *do nothing* / *don’t bother*; `zen` → *it’s a draw* / *tie*. Same under `/d/` `/b/` `/ɡ/` `/w/` `/h/` (`dal`, `gam`, `zar`, `zor`, `zer`, `zur`, …).

Do not confuse prefixed **…em** / **…el** / **…en** / **…er** / **…al** / **…am** / **…an** / **…ol** / **…om** / **…ul** / **…um** / **…ur** / **…ar** / **…or** with bare revision **em** / **el** / **en** / **al** / **am** / **an** / **ol** / **om** / **ul** / **um** (*or rather* / *including* / *instead* / *except*).
### Exclusivity and *nor*

- **Exclusive (`o`)** — pick **one** of the conjuncts, not more than one.
- **Inclusive (`ao`)** — one **or** more of the conjuncts may hold (English *and/or*). Built by combining **a** with **o**; bare **o** stays exclusive.
- ***Nor* (`u`)** — **none** of the conjuncts hold (*neither…nor…*). The realized set from the list is empty. **-l** vs **-m** still marks whether that denial is limited to the listed items (**…ul**) or leaves room for further denials outside the list (**…um**); **-n** names a conventional denial bundle.
- **Ranked (`e` / `ae` / `oe`)** — ordered ranking, not a boolean *and*/*or*. First listed outranks second, and so on. **e** leaves exclusivity unmarked; **ae** = co-satisfiable ranked (**a**+**e**); **oe** = exclusive ranked (**o**+**e**). **-l** / **-m** / **-n** still mark closed / open / named (phrase) or soft (VP/clause) packaging of that ladder.

**a** is ordinary conjunction (*and*), not an *or*. All levels take **-l**, **-m**, or **-n** (named at phrase; soft at VP/clause) on **a** / **o** / **u** / **ao** / **e** / **ae** / **oe**; **a** / **o** / **e** / **u** also take **-r** ([unspecified-member](#unspecified-member-r-phrase)). **ao** / **ae** / **oe** never take **-r**.

There are **no** bare (prefix-less) **coordinators**. Prefixed joiners always have a PoS prefix + ending (`zam`, `val`, …). Prefix-less **al** / **am** / **an** / **el** / **em** / **en** / **ol** / **om** / **on** / **ul** / **um** / **un** are [in-clause revision](#in-clause-revision-bare-a--e--o--u) only — not list joiners. Whole-word **a** / **e** / **o** / **u** (no ending) are **illegal**.

---

# In-clause revision (**a** / **e** / **o** / **u** + ending)
<a id="in-clause-revision-bare-a--e--o--u"></a>
<a id="bare-revision"></a>
<a id="in-clause-revision"></a>

Prefix-less vowel + **-l** / **-m** / **-n** forms are **revision** operators inside one clause. Each `REV` pairs a fixed left side **A** with one right-hand side. They are **not** coordinators: they do not take **-r**, and they do not join full sentences. An ending is **required**: **-l** / **-m** mark **completeness of that right-hand side**; **-n** marks a **named / conventional** revision (same mnemonic as phrase-level join **-n**, not VP/clause soft **-n**).

### Meanings (vowel)

| Vowel | Gloss | `A REV B` reading |
|-------|--------|-------------------|
| **a** | *including* | A, including B (B is a highlighted member / part of A) |
| **e** | *rather* | A, or rather B (soft correction; B outranks A; A need not be fully denied) |
| **o** | *instead* | not A, but B (exclusive replacement) |
| **u** | *except* / *but not* | A except B / A but not B (subtract B from the A frame) |

Mnemonics track the join series loosely: **a** additive membership, **e** directional soft rank, **o** exclusive swap, **u** subtractive denial — but the job is **revision of a slot**, not boolean listing.

### Endings — required

Every revision word **must** take **-l**, **-m**, or **-n**; unmarked **a** / **e** / **o** / **u** are not legal. **-l** / **-m** answer: *is this right-hand side the full story of this include / except / replace / rephrase?* — not whether A is complete. **-n** is an alternative to **-l** / **-m**, not a third completeness tier and not stackable with them on the same particle.

| Ending | Form | Sense |
|--------|------|--------|
| **-l** | `al` / `el` / `ol` / `ul` | **Closed** — that right-hand side is exhaustive for this revision step: including *only* these · except *only* these · B fully replaces A · B is the precise reading. |
| **-m** | `am` / `em` / `om` / `um` | **Open** — that right-hand side is non-exhaustive: including B *among others* · except B *(and maybe more)* · B is *a* replacement · B is *a* better wording. |
| **-n** | `an` / `en` / `on` / `un` | **Named / conventional** — A (and/or this A–side revision) is invoked as an established titled, formulaic, or canonical frame (*the primary colors, including red*; *RGB except blue*; a stock *tea→coffee* swap; a conventional *happy, or rather content* rephrase). Completeness is whatever that designation already fixes. |

Same mnemonic as phrase-level [named **-n**](#named--conventional-ending-phrase-level-all-join-vowels) and content-word [proper name **-n**](reference-suffix.md#proper-name--n): definite by established label. **Not** VP/clause soft **-n** (*and then…* / tentative reconstruction). No **-r** (multi-side revision uses [parallel chains](#revision-chains-parallel-on-a), not a fence particle). When unsure between closed and open, prefer **-m**; use **-n** when you are naming a conventional frame rather than composing an inventory.

| | **-l** | **-m** | **-n** |
|--|--------|--------|--------|
| **a** (*including*) | `al` — including only B | `am` — including B among others | `an` — including B in a named/conventional A |
| **e** (*rather*) | `el` — B is the precise reading | `em` — B is a better wording | `en` — conventional / formulaic rephrase |
| **o** (*instead*) | `ol` — B fully replaces A | `om` — B is a replacement (not sworn unique) | `on` — stock / conventional swap |
| **u** (*except*) | `ul` — except only B | `um` — except B (and maybe more) | `un` — except B from a named/conventional A |

### Shape and scope

```
A  REV  B
A  REV₁  B  REV₂  C  ( REVᵢ  SIDE )*
```

**REV** is a prefix-less vowel + **-l**, **-m**, or **-n** (`ol`, `om`, `on`, `ul`, …) — never the bare vowel alone.

- **In-clause only** — A and every right-hand side sit in the **same clause**. Do not use revision to link full sentences or to revise a prior sentence’s claim; that stays other `/x/` discourse roots.
- **Same slot** — A and every right-hand side match in role: all subject NPs (`/z/`), all objects (`/d/`), all `/b/` arguments, all `/ɡ/` APs (plus local material), all `/w/` or all `/h/` units, or all VPs (verb ± that verb’s `/d/`). Mixed slots are illegal (`z-… ol d-…`).
- **Fixed A, one or more right-hand sides** — the first side is **A**; each **REV** introduces the next right-hand side. No unary “instead of what was just said”; repeat material or use a pronoun for A, or use a later `/x/` form for cross-sentence repair. No left-fence shared-modifier slot on the particle; no **-r**.
- **Inside a coordinated list** — allowed **inside** a conjunct as local repair, not as a substitute for the coordinator (`zam` / `vam` / …). **Binding:** a revision chain starting at A consumes following same-slot sides paired by **REV** particles, tighter than list absorb — so `zam z-dogl ol z-catl z-birdl` = *(dog instead of cat) and bird*, and `zam z-teaml am z-Samn ul z-Lean z-birdl` = *(team including Sam, except Lea) and bird*.

### Revision chains (parallel on A)
<a id="revision-chains-parallel-on-a"></a>

A chain `A REV₁ B REV₂ C …` is **not** right-associative nesting and **not** successive rewriting of an intermediate result. Every `REVᵢ` applies **in parallel to the same A**, each with its own right-hand side. Vowels and endings may **mix**; each particle keeps its own closed/open/named reading for **its** right-hand side.

| Chain | Reading |
|-------|---------|
| `A am B am C` | A including B and including C (both open) |
| `A al B al C` | A including only B and only C (each closed for its own highlight; together = those exhaustive includes) |
| `A am B ul C` | A including B (open), **and** except only C (closed) |
| `A ul B om C` | A except only B, **and** C as a replacement for A |
| `A an B un C` | named A including B, **and** except C from that named frame |

Not the nested English parse *including (B except C)*. For that, put the inner revision **inside** one side (e.g. the B-side is itself a revised phrase), not as a second **REV** in the chain.

Same-vowel repeats are just the parallel rule with identical particles (`A am B am C` = multi-include under A). There is **no** fence **-r** on revision particles.

### Examples (schematic)

- `z-animalsh am z-dogl` — *animals, including a dog among others* (open)
- `z-animalsh am z-dogl am z-catl` — *animals, including a dog and a cat among others* (parallel multi-include)
- `z-toolsh al z-hammerl` — *tools, including only a hammer* (closed — B exhausts the highlight)
- `z-primary-colorsh an z-redl` — *the primary colors, including red* (named frame)
- `z-teaml ul z-Samn` — *the team except only Sam* (closed sole exception)
- `z-teaml um z-Samn` — *the team except Sam (and maybe others)* (open)
- `z-teaml am z-Samn ul z-Lean` — *the team, including Sam, except only Lea* (mixed parallel)
- `z-RGBn un z-bluel` — *RGB except blue* (named conventional set)
- `z-RGBn un z-redl un z-bluel` — *RGB except red and except blue* (named; parallel multi-except)
- `d-teal ol d-coffeel` — *coffee fully replaces tea* (closed)
- `d-teal om d-coffeel` — *coffee as a replacement for tea* (open)
- `d-teal on d-coffeel` — *the stock tea→coffee swap* (named/conventional)
- `d-teal ol d-coffeel ol d-waterl` — *coffee and water fully replace tea* (parallel multi-instead)
- `g-happyl el g-contentl` — *content* as the precise reading (closed)
- `g-happyl em g-contentl` — *happy, or rather content* as a better wording (open)
- `g-happyl en g-contentl` — conventional *happy → content* rephrase (named)
- `v-runl om v-walkl` — *ran, with walk as a replacement* (VP slot, open)
- `zam z-dogl ol z-catl z-birdl` — *(dog fully instead of cat) and bird* — closed revision inside the first conjunct

### Constraints

- **Not** a list joiner — use prefixed coordination for *and* / *or* / *nor* / *and/or* / ranked conjunction.
- **Not** sentence-level *instead* / *except* / *but* — those remain other `/x/` linkers when claims (not slot-mates) are related.
- **Not** mixed-PoS, not cross-clause, not unary; ending **-l**, **-m**, or **-n** required; no **-r** / plural **-sh** on the particle; no bare **a** / **e** / **o** / **u**; **-n** is named/conventional only (not soft packaging). Chains are **parallel on A**, not nested `A REV (B REV C)`.

### Reserved forms

Prefix-less **al** / **am** / **an** / **el** / **em** / **en** / **ol** / **om** / **on** / **ul** / **um** / **un** are **only** these revision operators. Prefixed + ending forms of the same vowels (`zal`, `zam`, `val`, …) remain [coordinators](#join-type--ending-shared) only. Whole-word **a** / **e** / **o** / **u** are not revision forms and not legal words.

---

# Phrase-level coordination (fence)
<a id="np-level-coordination"></a>
<a id="ap-level-coordination"></a>
<a id="phrase-level-coordination"></a>
<a id="left-fence"></a>
<a id="right-close"></a>

Phrase-level coordinators join **same-slot** conjuncts (single words or multi-word phrases) with a **fence**: prefixed coordinator(s) plus optional **shared** modifiers **immediately after** each coordinator. Same vowel series and endings as above (**-l** / **-m** / **-n** on **a** / **o** / **u** / **ao** / **e** / **ae** / **oe**; **-r** on **a** / **o** / **e** / **u** for [unspecified-member](#unspecified-member-r-phrase); not plural **-sh**). Slots differ only in **which prefix** the coordinator takes and **what counts as a conjunct**. Flat lists use one fence; nested joins use [fence nesting](#fence-nesting). **Pure infix is illegal** (`A zam B zal C`).

**Fence — juxtaposed conjuncts.** No continue particle between conjuncts (`zam A B`, not `zam A zar B` for a flat *and*). `zar` / `zor` / `zer` / `zur` are whole-fence unspecified-member coordinators, not mid-chain extenders.

**Placement:** **Left fence** (coordinator before the conjuncts) is **preferred**. **Right close** (coordinator after the conjuncts) is allowed for **style or comedy**. Shared modifiers stay **right after the coordinator** in either placement.

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

Writing: `zal` / `zam` / `zan` / `zar` / `zol` / `zom` / `zor` / `zul` / `zum` / `zur` / … / `zel` / `zem` / `zen` / `zer`; same under `/d/`, `/b/`, `/ɡ/` (`gal` / `gam` / …), `/w/` (`wal` / `wam` / …), `/h/` (`hal` / `ham` / …). Stacked vowels glue in writing: inclusive **ao** `zaol` / `zaom` / `zaon`; co-satisfiable ranked **ae** `zael` / `zaem` / `zaen`; exclusive ranked **oe** `zoel` / `zoem` / `zoen` (and the same under `/d/` `/b/` `/ɡ/` `/w/` `/h/`). Spoken order is first vowel then second then ending (**a** then **o**; **a** then **e**; **o** then **e**). Phrase **-r** forms are **`zar`** / **`zor`** / **`zer`** / **`zur`** (and the same under other phrase prefixes) — not `zaor`, `zaer`, `zoer`, ….

The prefix on the coordinator **must match** every conjunct head (`/z/` with `/z/`, `/ɡ/` with `/ɡ/`, and so on).

## Shape

**Left fence** (preferred):

```
P-COORD  ( SHARED )*  PHRASE  PHRASE  ( PHRASE )*   ← two or more
P-COORD  ( SHARED )*  PHRASE                         ← unary (allowed forms)
P-COORD  ( SHARED )*                                 ← nullary (allowed forms)
```

**Right close** (style / comedy):

```
PHRASE  PHRASE  ( PHRASE )*  P-COORD  ( SHARED )*   ← two or more
PHRASE  P-COORD  ( SHARED )*                         ← unary (allowed forms)
P-COORD  ( SHARED )*                                 ← nullary (same as left when empty)
```

- **P-COORD** — one of the prefixed forms above (`zam`, `dol`, `bem`, `gam`, `wam`, `ham`, `zar`, `zor`, `zer`, `zur`, …). For a **flat** list, appears **only once**: either **before** all conjuncts (left) or **after** all conjuncts (right) — not between conjuncts. For **nested** lists, multiple fences stack — see [fence nesting](#fence-nesting). **Pure infix** (`A zam B zal C`) is illegal.
- **SHARED** — optional material **immediately after** `P-COORD` in either placement. **Always** scopes over the **whole coordinated phrase** (NP: `/ɡ/` / `/w/` / complex `/ɡ/`+`/b/`; AP: `/w/`; `/w/`-slot and `/h/`-slot joins: further same-slot material only if the lexicon allows stacking on the join as a unit). Shared `/ɡ/` / `/w/` here sit next to the fence (before the heads they grade on the left; after the list on the right) — the fence defines the host unit.
- **PHRASE** — a conjunct: NP headed by `/z/`, `/d/`, or `/b/` (plus that head’s following local `/ɡ/` / `/w/` / `/b/` material); AP headed by `/ɡ/` (plus contiguous `/b/`, further `/ɡ/` on that `/b/`, and local `/w/`); or a single `/w/` / `/h/` word (plus `/h/`’s contiguous `/b/` when complex). Local modifiers stay **inside** their conjunct, after that conjunct’s head.
- Two conjuncts (left): `P-COORD  PHRASE  PHRASE`. Two (right): `PHRASE  PHRASE  P-COORD`. Three or more: same pattern with more `PHRASE` items on the conjunct side of `P-COORD`.
- **Unary phrase** — **…em** / **…el** / **…oem** / **…oel** / **…en** / **…er** / **…al** / **…am** / **…ol** / **…om** / **…aol** / **…aom** / **…ar** / **…or** / **…ur**: `P-COORD  PHRASE` or `PHRASE  P-COORD` — see [unary and nullary](#unary-phrase) and [unspecified-member **-r**](#unspecified-member-r-phrase).
- **Nullary phrase** — those same forms, plus **…an** / **…ul** / **…um**: `P-COORD` alone (optional `SHARED`) — the coordinator fills the slot with the [nullary reading](#nullary-phrase). Left and right placement coincide when there are no conjuncts. A following matching-role head is still absorbed as a conjunct (so nullary is only when no conjunct follows / precedes).
- All other phrase coordinators need **two or more** conjuncts.
- Single-word siblings: `zam z-dogl z-catl` or `z-dogl z-catl zam` (*a dog and a cat* — open).
- Unspecified-member: `zar` → *something*; `zar z-personl` / `z-personl zar` → *some (unknown) person*; `zar z-teal z-coffeel` → *some one among tea and coffee*; `zor` → *anything*; `zor z-personl` → *any person*; `zor z-teal z-coffeel` → *any of tea or coffee*; `zer` → *whatever’s most important*; `zer z-safetyl` → *safety as a priority*; `zer z-teal z-coffeel` → *whichever of tea or coffee ranks higher*; `zur` → *some objection*; `zur z-contractl` → *some objection involving the contract*; `zur z-costl z-riskl` → *objection to some among cost and risk*.

**Ranked** (`zel` / `zael` / `zoel`, `zem` / …, `zen` / …): left-to-right rank of the **spoken conjunct order** (before a right-close coordinator) — see [ranked conjunction](#ranked-conjunction-e). Unary / nullary: [unary and nullary](#unary-phrase).
### Scope fence (`P-COORD`)

**Rule:** A modifier **immediately after** a phrase-level conjunction (`zam`, `gam`, `dam`, …) modifies the **entire coordinated phrase** — whether that conjunction is a left fence or a right close.

- Modifiers **after a conjunct head** (and before the next matching-role head) belong to that conjunct only.
- Modifiers in the **SHARED** slot scope over **all** conjuncts as one unit.
- On a **right close**, do **not** put further matching-role conjunct heads after `P-COORD` / `SHARED`; the list of conjuncts is already complete to the left of `P-COORD`.

Contrast (left fence):

- `zam z-dogl z-catl g-bigl` → *(dog) and (big cat)* — big follows the last head → last conjunct only
- `zam g-bigl z-dogl z-catl` → *a big (dog and cat)* — big immediately after the fence → whole phrase
- `zam z-dogl g-bigl z-catl` → *(big dog) and (cat)* — big local to dog
- `gam w-veryl g-happyl g-proudl` → *very (happy and proud)* — `/w/` after `gam` grades the whole AP join
- `gam g-happyl w-veryl g-proudl` → *(very happy) and (proud)* — `/w/` local to first `/ɡ/`

Right close (same SHARED rule after the coordinator):

- `z-dogl z-catl zam` → *a dog and a cat* (open) — coordinator closes the list
- `z-dogl z-catl zam g-bigl` → *a big (dog and cat)* — shared after right-close `zam`
- `z-dogl g-bigl z-catl zam` → *(big dog) and (cat)* — big local to dog; `zam` closes
- `g-happyl g-proudl gam w-veryl` → *very (happy and proud)* — shared `/w/` after right-close `gam`

Complex adjective on an NP bundle: `zam g-ofl b-Samn z-dogl z-catl` or `z-dogl z-catl zam g-ofl b-Samn` → *Sam’s (dog and cat)* — the complex `/ɡ/`+`/b/` in SHARED owns the whole join.

### End of list

- **Left fence — same-prefix absorb** — after `P-COORD` (and any `SHARED`), every following matching-role head (plus its local modifiers) is a **conjunct** until the list ends. For AP `/ɡ/` on one host, that means you cannot stack an extra non-coordinated `/ɡ/` on the same noun after a `gam`… join; put further description in another sentence, or include it as another conjunct. Same absorb rule for `/w/` and `/h/` left-fence chains.
- **Right close — lookback absorb** — matching-role heads (plus local modifiers) **immediately before** `P-COORD` are the conjuncts; clause-level floating `/h/` inside that stretch is transparent (below). After right-close `P-COORD` / `SHARED`, the coordinated phrase is finished — a later matching-role head is **not** another conjunct of this list.
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
- `dam g-bigl d-dogl d-catl` — *a big (dog and cat)* as object — shared after the left fence
- `d-dogl d-catl dam g-bigl` — same shared reading with right close
- `zel z-teal z-coffeel z-waterl` — *tea ≻ coffee ≻ water* (closed ranked; exclusivity not claimed; prefer/else from context)
- `zoel z-burgerl z-chickenl z-hot-dogl` — *burger ≻ chicken ≻ hot dog* (closed **exclusive** ranked — pick one, in that order)
- `zaem z-journall z-candlesh z-socksh` — *journal ≻ candles ≻ socks* (open **co-satisfiable** ranked — wishlist)
- `z-teal z-coffeel z-waterl zel` — same neutral ranked ladder with right close
- `zem z-dogl g-bigl z-catl g-redl` — *(big dog) ≻ (red cat)* (open ranked, exclusivity unmarked)
- `zem z-truthrl` — *truth first* (unary open ranked); `zel z-truthrl` — *only truth matters* (unary closed); `zoem z-fixl` — *try a fix first* (unary open exclusive ranked); `zoel z-fixl` — *only try a fix* (unary closed exclusive ranked); `zen z-safetyl` — *safety first* (unary named ranked)
- `zal z-waterl` — *just water* (unary closed *and*); `zam z-Samn` — *Sam, for one* (unary open *and*); `zol z-waterl` — *has to be water* (unary closed xor); `zom z-coffeel` — *say, coffee* (unary open xor); `zaol z-waterl` — *water’ll do* (unary closed *and/or*); `zaom z-waterl` — *at least water* (unary open *and/or*); `zar z-personl` — *some (unknown) person*; `zor z-personl` — *any person*; `zer z-safetyl` — *safety as a priority*; `zur z-contractl` — *some objection involving the contract*; `z-personl zar` — same with right close
- `zar z-teal z-coffeel` — *some one among tea and coffee*; `zor z-burgerl z-chickenl` — *any of burger or chicken*; `zer z-teal z-coffeel` — *whichever of tea or coffee ranks higher*; `zur z-costl z-riskl` — *objection to some among cost and risk*
- `zal` — *nothing* / *nobody* (nullary closed *and*); `zam` — *nothing comes to mind* (nullary open *and*); `zan` — *null* / *void* (nullary named); `zar` — *something* / *someone*; `zol` — *no options* / *we’re stuck* (nullary closed xor); `zom` — *I got no pick* (nullary open xor); `zor` — *anything* / *anyone*; `zaol` — *all set* (nullary closed *and/or*); `zaom` — *nothing I need* (nullary open *and/or*); `zul` — *no objections* (nullary closed *nor*); `zum` — *no objection from me (yet)* (nullary open *nor*); `zur` — *some objection* / *there’s a catch*; `zel` — *don’t care* (nullary closed ranked); `zem` — *I don’t have a ranking* (nullary open ranked); `zer` — *whatever’s most important*; `zoem` — *not sure where to start* (nullary open exclusive ranked); `zoel` — *do nothing* (nullary closed exclusive ranked); `zen` — *it’s a draw* / *tie* (nullary named ranked)
**AP**

- `gam g-happyl w-veryl g-proudl w-slightlyl` — *(very happy) and (slightly proud)* — each degree inside its conjunct
- `gam g-onl b-tablel g-ofl b-Samn` — *(on the table) and (Sam’s)* — two complex APs on one host
- `gal g-redl g-softl g-warml` — *red, soft, and warm* — closed three-way AP list (absorb-all; no further bare `/ɡ/` on that host after this join)
- `g-redl g-softl g-warml gal` — same closed AP list with right close
- `gan g-redl g-yellowl g-bluel` — *red, yellow, and blue* as the conventional primary-color bundle (named **-n**)
- `gel w-veryl g-happyl g-proudl` — *very (happy ≻ proud)* — shared degree after the fence; closed ranked on the AP (exclusivity unmarked)
- `g-happyl g-proudl gel w-veryl` — same with right close
- `gen g-redl g-yellowl g-bluel` — conventional display order *red ≻ yellow ≻ blue* (named **-n**)
- `gaen g-Christianl g-Conservativel g-Republicanl` — conventional identity ranking *Christian ≻ Conservative ≻ Republican* (named **-n**, co-satisfiable)

**`/w/` / `/h/`**

- `wam w-veryl w-recentl` on a preceding `/ɡ/` — *very and recently* (open adjunct chain) as one stack on that adjective
- `w-veryl w-recentl wam` — same with right close
- `ham h-quicklyl h-quietlyl` — *quickly and quietly* as one floating adverb unit (open)
- `h-quicklyl h-quietlyl ham` — same with right close

## Constraints

- **One slot** — the chain is a single subject, object, `/b/` argument, `/ɡ/` stack position, `/w/` stack, or `/h/` floating unit in the clause.
- **Matching role prefix** on every conjunct head and on the coordinator.
- **One fence placement per flat list** — left (preferred) or right (style / comedy); never pure infix between conjuncts. Nested joins: [fence nesting](#fence-nesting).
- **Shared modifiers** — only in the slot immediately after each `P-COORD` (left or right); local modifiers stay after their own heads.
- **Phrase `-r`** — only **`…ar`** / **`…or`** / **`…er`** / **`…ur`** ([unspecified-member](#unspecified-member-r-phrase)); no plural **-sh** on the coordinator. Soft **-n** is VP/clause only.
- **Not** verb+object packages — use [VP-level](#vp-level-coordination); **not** full sentences — those stay `/x/`…
- **Not** mixed-PoS joins; correlatives; `/x/` sentence linkers (*however*, *therefore*), general adversative *but*, quotation fences, or [numbered enumeration](numbers.md#number-as-discourse-marker-by-marker). In-clause *including* / *rather* / *instead* / *except* are [bare revision](#in-clause-revision-bare-a--e--o--u), not this fence series. Phrase-level ranked conjunction **is** this series (`zel` / `zael` / `zoel` / `zem` / …). Unary / nullary phrase only for the forms in [unary and nullary](#unary-phrase) (**…ul** / **…um** / **…an** nullary-only; **…ar** / **…or** / **…er** / **…ur** at all arities = *something* / *anything* / *whatever-by-rank* / *some objection*; **…en** nullary = *it’s a draw*, **…an** nullary = *null* / *void*).

## Reserved forms

Under `/z/`, `/d/`, `/b/`, `/ɡ/`, `/w/`, and `/h/`, the coordination vowel series plus an allowed ending (`zal`, `zam`, `zan`, `zar`, `zol`, `zom`, `zor`, `zul`, `zum`, `zur`, … `zel`, `zem`, `zen`, `zer`, `zael`, `zaem`, `zaen`, `zoel`, `zoem`, `zoen`, `dal`, … `gal`, `gam`, … `wal`, … `hal`, `ham`, … `hel`, `hem`, `hen`, `hael`, … `hoel`, …) are **only** these phrase coordinators — not ordinary content words with those vowel roots. Other roots under those prefixes are unchanged.

---

# Fence nesting (all levels)
<a id="fence-nesting"></a>
<a id="opener-r-coordination"></a>
<a id="vowels--endings"></a>
<a id="ending-senses-clause-coordinators"></a>

Flat coordination uses **one** fence (left or right). **Nested** joins use **more than one** fence of the same PoS prefix. Association follows fence side:

| Pattern | Associativity | Example | Reading |
|---------|---------------|---------|---------|
| **Left fence stack** | **Right-associative** | `vol A val B C` | *A ∨ (B ∧ C)* — later fence is one conjunct of the earlier |
| **Right close stack** | **Left-associative** | `A B vol C val` | *(A ∨ B) ∧ C* — each close folds what’s to its left, then that group joins the next |

Flat n-ary (one fence): `vol A B C` / `A B C vol` → *A ∨ B ∨ C*. Nested same-vowel: `vol A vol B C` → *A ∨ (B ∨ C)*; `A B vol C vol` → *(A ∨ B) ∨ C*.

**Pure infix is illegal:** do not write `A vol B val C` (coordinator between every pair with neither a clean left stack nor a clean right stack). Use all-left or all-right nesting, or a flat single fence.

Same rule at phrase, VP, and clause level (`zol A zal B C`, `vol A val B C`, `xol A xal B C`, …). Shared modifiers stay immediately after **each** fence particle they attach to.

---

# Soft **-n** (VP and clause)
<a id="soft-n-vp-clause"></a>
<a id="ending-senses"></a>

On **`/v/`** and **`/x/`** only, **-n** is **soft packaging** (not phrase named/conventional **-n**). Soft lists use the same **fence** shape as **-l** / **-m** (left preferred; right close allowed; nesting per [fence nesting](#fence-nesting)). Soft lists do **not** carry a separate closed/open bit; treat completeness as open-leaning unless you upgrade to a committed **-l** / **-m** fence (optionally with `/h/` evidential hedges). Per vowel:

| Form | Soft reading |
|------|----------------|
| **`van` / `xan`** (*and*) | *and then…* (temporal / story sequence, not mere logical *and*) |
| **`von` / `xon`** (*xor*) | *or maybe…* — uncertain alternatives |
| **`vun` / `xun`** (*nor*) | *and it wasn’t… either* / *nor, as I recall…* — soft denial while reconstructing |
| **`vaon` / `xaon`** (*and/or*) | *and/or maybe…* — soft multi-fit |
| **`ven` / `xen`** (*ranked*) | *maybe prefer… / else maybe…* — soft or reconstructed ranking (exclusivity unmarked) |
| **`vaen` / `xaen`** (*co-sat. ranked*) | soft ranked multi-fit |
| **`voen` / `xoen`** (*excl. ranked*) | soft exclusive ranked fallback |

Titled / official discourse labels stay **other** `/x/`…**-n** forms (different roots, not this vowel series) — see [reference-suffix.md](reference-suffix.md#discourse-markers-x).

---

# VP / clause forms (endings)
<a id="vp-clause-forms"></a>

Word shape: prefix + vowel root (+ second vowel for stacked forms) + ending. Writing glues stacked vowels (`vaol`, `vael`, `voel`, `xaol`, …). Spoken order is first vowel then second, then the ending — same as phrase-level `zaol` / `zael` / `zoel`.

| | **-l** | **-m** | **-n** soft | **-r** unspecified |
|---|--------|--------|-------------|---------------------|
| **a** (*and*) | `val` / `xal` closed | `vam` / `xam` open | `van` / `xan` | `var` / `xar` |
| **o** (xor) | `vol` / `xol` closed | `vom` / `xom` open | `von` / `xon` | `vor` / `xor` |
| **u** (*nor*) | `vul` / `xul` closed | `vum` / `xum` open | `vun` / `xun` | `vur` / `xur` |
| **ao** (and/or) | `vaol` / `xaol` closed | `vaom` / `xaom` open | `vaon` / `xaon` | — |
| **e** (ranked) | `vel` / `xel` closed | `vem` / `xem` open | `ven` / `xen` | `ver` / `xer` |
| **ae** (co-sat. ranked) | `vael` / `xael` closed | `vaem` / `xaem` open | `vaen` / `xaen` | — |
| **oe** (excl. ranked) | `voel` / `xoel` closed | `voem` / `xoem` open | `voen` / `xoen` | — |

Prefix: **`/v/`** for [VP-level](#vp-level-coordination); **`/x/`** for [clause-level](#clause-level-coordination). **-r** only on **a** / **o** / **e** / **u** — see [unspecified-member](#unspecified-member-r-phrase). No `vaor` / `xaor` / `vaer` / `xaer` / `voer` / `xoer`.

**-l** / **-m** — committed closed / open lists (same senses as phrase). Soft **-n** — [above](#soft-n-vp-clause). **-r** — unspecified-member / content Q, not list continue.

**Flat fence shape** (same as phrase):

```
COORD  ( SHARED )*  ITEM  ITEM  ( ITEM )*     ← left (preferred); two or more for -l/-m/-n
ITEM  ITEM  ( ITEM )*  COORD  ( SHARED )*     ← right close
COORD  ( SHARED )*  ITEM                       ← unary …ar/…or/…er/…ur only
COORD  ( SHARED )*                             ← nullary …ar/…or/…er/…ur only
```

Examples (flat): `vam A B` / `A B vam` → *A and B* (open); `val A B C` → closed three-way *and*; `van A B C` → *A and then B and then C*; `vel A B` → *A ≻ B*; `var` → *do something*; `xar` → *something happened*.

Nesting: [fence nesting](#fence-nesting) — e.g. `vol A val B C` → *A or (B and C)*; `A B vol C val` → *(A or B) and C*.

---

# VP-level coordination

VP-level coordinators join **verb phrases** inside one clause: each conjunct is a verb plus that verb’s own object material (`/d/` NP, including phrase-level structure on the object), unless a shared object sits before a left fence (below). They share one clause subject (`/z/`) and one [clause force](language-reference.md#utterance-markers-j). The coordinator prefix is always **`/v/`**. Forms and endings: [VP / clause forms](#vp-clause-forms). Shape and nesting: [fence nesting](#fence-nesting). Soft **-n**: [soft **-n**](#soft-n-vp-clause). Unspecified **-r**: [unspecified-member](#unspecified-member-r-phrase).

## Conjuncts and scope

- **VP** — one verb (`/v/` content word) plus that verb’s own `/d/` object material when present (simple object or [phrase-level](#phrase-level-coordination) object chain). Object NPs may include their `/ɡ/` / `/w/` / `/b/` stacks. The shared `/z/` subject is **outside** the VP chain.
- **Shared object (verb-only conjuncts)** — when every conjunct is a bare verb (no per-conjunct `/d/`), a `/d/` **immediately before** a left-fence coordinator scopes over **all** verbs alike: `d-applel vam v-washl v-eatl` → *washed and ate an apple*. If any conjunct carries its own `/d/`, do not use a pre-fence shared object; put objects inside each conjunct.
- **`/h/` scope relative to the fence**
  - **`/h/` before a left-fence VP coordinator** (outside the chain) → applies to **every** conjunct (*quickly washed and ate*).
  - **`/h/` inside a conjunct** (after that conjunct begins, before the next conjunct head or end of chain) → applies to **that VP only**.
  - **`/h/` after the whole VP chain** → attaches to the **last** conjunct only. For shared manner/mood over all VPs, put `/h/` before the left fence.
- Other non-VP clause material (subject, clause force) stays outside the chain.

### Examples (schematic)

- `vam d-applel v-eatl d-waterl v-drinkl` → *(ate an apple) and (drank water)* (open); `d-applel v-eatl d-waterl v-drinkl vam` → same with right close
- `val d-applel v-eatl d-waterl v-drinkl d-breadl v-bakel` → closed *and* of three VPs
- `van v-runl v-jumpl v-restl` → *ran and then jumped and then rested*
- `vel d-applel v-eatl d-cakel v-eatl` → *ate an apple ≻ ate a cake* (closed ranked, exclusivity unmarked)
- `voel d-bugl v-fixl d-workaroundl v-addl` → *fix the bug ≻ add a workaround* (closed exclusive ranked)
- `voen v-runl v-hidel v-fightl` → soft exclusive triage *run ≻ hide ≻ fight*
- `vem d-applel v-eatl d-waterl v-drinkl` → *ate an apple ≻ drank water* (open ranked, unmarked)
- `h-quicklyl vam d-applel v-eatl d-waterl v-drinkl` → *quickly* *(ate an apple and drank water)*
- `vam d-applel v-eatl h-quicklyl d-waterl v-drinkl` → *(quickly ate an apple) and (drank water)*
- `d-applel vam v-washl v-eatl` → *washed and ate an apple* (shared object before left fence)
- `vol d-applel v-eatl val d-waterl v-drinkl d-breadl v-bakel` → *ate an apple, or ((drank water) and (baked bread))* (left nest)
- `d-applel v-eatl d-waterl v-drinkl vol d-breadl v-bakel val` → *((ate an apple) or (drank water)) and (baked bread)* (right nest)
- `var` → *do something*; `var v-runl` → *some (unspecified) running*; `vor v-runl v-jumpl` → *any of running or jumping*
- Under polar Q: `var` → *What (did they) do?*; `vur` → *What’s the objection (re doing)?*

## Constraints

- **One clause** — one `/j/` force, one shared `/z/` subject (when present).
- **Each conjunct has its own verb**; objects are per-conjunct unless the shared-object-before-left-fence pattern applies.
- **`/h/`** follows the before-fence / inside-conjunct / after-chain rules above.
- **No gapping** of subject or object across VPs (beyond the shared-object pattern).
- **No `-sh`** on the coordinator.
- **Fence** — left preferred, right close allowed; nesting per [fence nesting](#fence-nesting); **no pure infix**.
- **-r** is unspecified-member (`var` / `vor` / `ver` / `vur`), not continue; unary/nullary allowed on those forms only among VP coordinators.
- **Not** full sentences — those stay `/x/`…; **not** phrase-level NP/AP joins — those stay [phrase-level](#phrase-level-coordination).

## Reserved forms

Under `/v/`, the coordination vowel series plus an allowed ending (`val`, `vam`, `van`, `var`, `vol`, `vom`, `von`, `vor`, `vul`, `vum`, `vun`, `vur`, `vaol`, `vaom`, `vaon`, `vel`, `vem`, `ven`, `ver`, `vael`, `vaem`, `vaen`, `voel`, `voem`, `voen`) are **only** these VP coordinators — not ordinary content verbs with those vowel roots. No stacked-vowel **-r** (`vaor`, `vaer`, `voer`). Other roots under `/v/` are unchanged.

---

# Clause-level coordination

Clause-level coordinators join **full sentences**. They are **`/x/`** discourse markers whose **root is the same vowel series** as phrase- and VP-level coordination. They take a [reference-suffix letter](reference-suffix.md): **-l**, **-m**, **-n**, or **-r**. They do **not** take plural **-sh**. Forms: [VP / clause forms](#vp-clause-forms). Shape and nesting: [fence nesting](#fence-nesting) (same as VP and phrase). Soft **-n**: [soft **-n**](#soft-n-vp-clause). Unspecified **-r**: [unspecified-member](#unspecified-member-r-phrase).

Endorsement strength and evidentiality stay on each clause’s `/h/` (or `/w/`), not on the coordinator.

## Conjuncts

- **SENT** — a complete sentence beginning with `/j/` (optional vocative(s) / interjection(s), then clause force, then clause body).
- Flat lists: one fence before (preferred) or after the conjunct sentences. Nested lists: [fence nesting](#fence-nesting).

### Examples (schematic)

- `xal A B` → *A and B* (closed); `xam A B` → open; `A B xam` → same open with right close
- `xal A B C` → *A and B and C* (one closed *and*-list)
- `xol A B C` → *A or B or C* (one closed *xor*-list)
- `xan A B C` → *A and then B and then C*
- `xel A B` → *A ≻ B* (closed ranked, unmarked); `xem A B` → open; `xen A B C` → soft
- `xael A B` → co-satisfiable closed ranked; `xoel A B C` → exclusive closed ranked
- Nesting: `xol A xol B C` → *A or (B or C)*; `A B xol C xol` → *(A or B) or C*; flat three-way *or* is `xol A B C`
- `xol A xal B C` → *A or (B and C)*; `A B xol C xal` → *(A or B) and C*
- `xar` → *something happened*; under polar Q → *What happened?*; `xur` → *some objection* / *something’s off*

## Constraints

- **Same clause force** on every conjunct (all statements, all polar questions, or all imperatives). Mixed force → separate sentences or [subordination](language-reference.md#dependent-clauses), not this join.
- **No gapping / shared arguments** across conjuncts. Repeat material, or use phrase-level (NP / AP / …) or VP-level coordination inside one clause.
- **Fence** — left preferred, right close allowed; nesting per [fence nesting](#fence-nesting); **no pure infix**.
- **-r** is unspecified-member (`xar` / `xor` / `xer` / `xur`), not continue / “same linker again”; unary/nullary allowed on those forms only among clause coordinators. Resume of a prior non-coordinator `/x/` linker still uses content-word **/x/`…`-r`** per [pronouns.md](pronouns.md).
- **Not subordination:** *because* / *if* / *although* stay `/h/` + `/b/` [next-clause pronoun](pronouns.md#special-pronouns).
- **Not general *but* / *however* / *therefore*:** those are other `/x/` linkers. In-clause *including* / *rather* / *instead* / *except* are [bare revision](#in-clause-revision-bare-a--e--o--u), not clause coordination. Sentence-level *instead* / *except* (when needed) stay other `/x/` roots. Phrase-, VP-, and clause-level **ranked** (**zel** / **zael** / **zoel** / **gel** / **vel** / **vael** / **voel** / **xel** / …) **is** this series.

## Reserved forms

Under `/x/`, the coordination vowel series plus an allowed ending (`xal`, `xam`, `xan`, `xar`, `xol`, `xom`, `xon`, `xor`, `xul`, `xum`, `xun`, `xur`, `xaol`, `xaom`, `xaon`, `xel`, `xem`, `xen`, `xer`, `xael`, `xaem`, `xaen`, `xoel`, `xoem`, `xoen`) are **only** these clause coordinators — not other discourse-marker roots with those vowels. No stacked-vowel **-r** (`xaor`, `xaer`, `xoer`). Other `/x/` roots are unchanged.
