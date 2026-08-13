# Joins

Coordinate same-slot material (NPs, VPs, or clause bodies) with a **right-close fence**: conjuncts, then the join word, then optional shared modifiers.

## Beginner
<a id="beginner"></a>

### What you use joins for

You use joins when English would say *and*, *or*, *not*, *prefer A over B*, *something*, or *everything but*. Agelan spells that job with a **PoS prefix** + **vowel root** (+ stacked vowel when needed) + **ending**.

| Level | Prefix | Example job |
|-------|--------|-------------|
| Phrase | `/z/` `/d/` `/b/` `/ɡ/` `/w/` `/h/` | *Azawan and Ulonun*, *big and red* |
| VP | `/v/` | *ate and drank* |
| Clause | `/x/` | *It rained and then we left* |

**Mnemonic:** the vowel tells you *what kind* of list (inventory, menu, rank, negation, complement); the ending tells you *how closed* the list is.

### Set joins and rank joins

**Set joins** group items as inventory or menu:

| Vowel | Name | English job |
|-------|------|-------------|
| **a** | additive | *and* (inventory) |
| **o** | choice | exclusive *or* |
| **ao** | cochoice | inclusive *and/or* (one or more) |
| **u** | negation | *not* / *none of* / bare *no* |
| **ua** | counteradditive | *everything but* |
| **uo** | counterchoice | *anything but* |

**Rank joins** order items by priority — not boolean *and* / *or*:

| Vowel | Name | English job |
|-------|------|-------------|
| **e** | rank | earlier outranks later (*A ≻ B ≻ C*) |
| **ae** | corank | equal rank / tie |
| **oe** | choicerank | exclusive ranked menu (*A else B*) |
| **ue** | counterrank | rank reversal (*A ≺ B ≺ C*) |

<a id="join-type-vowel-series"></a>
<a id="join-series-ending-shared"></a>
<a id="join-type--ending-shared"></a>

Stacked vowels glue in writing (`zaol`, `zual`, `zoel`, …). Spoken order is first vowel, then next, then ending. There are **no** three-vowel stacks and **no** bare vowel without an ending.

### Right-close fence (flat lists)
<a id="phrase-level-coordination"></a>
<a id="np-level-coordination"></a>
<a id="ap-level-coordination"></a>
<a id="vp-level-coordination"></a>
<a id="clause-level-coordination"></a>
<a id="left-fence"></a>
<a id="right-close"></a>

Put every conjunct **before** the join; put shared modifiers **immediately after** the join. Juxtapose conjuncts — no particle between them.

```
PHRASE PHRASE ( PHRASE )* P-JOIN ( SHARED )*
```

**Mnemonic:** the join **closes** the list on the right — like a closing bracket.

```
`zogodol zagadal zam.`

gloss: `z-dog` · `z-cat` · `zam`

*a dog and a cat.*
```

```
`dabebal vabebal dudural vudural vam.`

gloss: `d-apple` · `v-tempt` · `d-water` · `v-drink` · `vam`

*ate an apple and drank water.*
```

```
`A B xam.`

gloss: `x-…` · `x-…` · `xam`

*A and B.*
```

**Left fences are illegal** — you never put the join before the conjuncts (`zam zogodol zagadal`). **Pure infix is illegal** — you never put a join between every pair (`A zam B zal C`).

### Arity: list, focus, and bare

Most joins need **two or more** conjuncts. A smaller set also works at **focus** (one conjunct) or **bare** (zero conjuncts).

| Arity | Shape | Job |
|-------|-------|-----|
| **List** (2+) | `A B P-JOIN` | ordinary coordination |
| **Focus** (1) | `A P-JOIN` | exhaustivity on that one item (*just X*, *not X*, *X first*, …) |
| **Bare** (0) | `P-JOIN` | emptiness or open frame in that join (*nothing*, *no*, *everything*, …) |

<a id="focus-phrase"></a>
<a id="unary-phrase"></a>
<a id="bare-phrase"></a>
<a id="nullary-phrase"></a>
<a id="focus-ranked"></a>
<a id="unary-ranked"></a>

The join alone (bare), or the join plus one conjunct (focus), can fill the slot when the form is in the starter table below. All other joins stay at list arity.

### Closure endings **`-l`** and **`-m`**

Every join vowel takes an ending. Start with **-l** (closed) and **-m** (open).

| Ending | Job | Mnemonic |
|--------|-----|----------|
| **-l** | closed — the listed conjuncts are the **only** ones in play | *locked list* |
| **-m** | open — other conjuncts may exist (*among others*) | *maybe more* |

When unsure, prefer **-m**. Use **-l** when you stand behind completeness (full inventories, forced-choice menus, definitions).

On plain **o** only, **-m** also marks **empty-allowed** (*or none* / *or skip*). Other vowels do **not** get that bit from **-m** alone.

<a id="empty-allowed-om"></a>

```
`zogevel zom.`

gloss: `z-coffee` · `zom`

*coffee, or skip.*
```

```
`zadedal zogevel zol.`

gloss: `z-tea` · `z-coffee` · `zol`

*tea or coffee — pick exactly one.*
```

### Starter forms (focus and bare)

These are the joins you meet first. Each row is **bare** (0 conjuncts) or **focus** (1 conjunct); list arity uses the same vowel + ending after two or more conjuncts.

| Form | Arity | Reading |
|------|-------|---------|
| `zal` / `zam` | bare | *nothing* / *nobody* · *nothing comes to mind* |
| `zol` / `zom` | bare | *no options* · *I got no pick* / *skipping is fine* |
| `zul` / `zum` / `zun` | bare | *no* (closed · open · named stock label) |
| `zual` / `zuam` | bare | *everything* / *everyone* · soft universal |
| `zuol` / `zuom` | bare | *anything (goes)* · open free choice |
| `zal` + `z<X>l` | focus | *just X* / *only X* |
| `zam` + `z<X>l` | focus | *X, for one* / *X, say* |
| `zol` + `z<X>l` | focus | *has to be X* |
| `zom` + `z<X>l` | focus | *say, X* / *X, or skip* |
| `zul` / `zum` / `zun` + `z<X>l` | focus | *not X* |
| `zual` + `z<X>l` | focus | *everything but X* |
| `zuol` + `z<X>l` | focus | *anything but X* |
| `zel` / `zem` | bare | *unspecified ranking* · *I don't have a ranking* |
| `zel` / `zem` + `z<X>l` | focus | *only X matters* / *X first* |
| `zoel` / `zoem` + `z<X>l` | focus | *only try X* / *try X first* |
| `zael` / `zaem` | bare | *it's a draw* / *tie* · *probably a tie* |

Same pattern under `/d/` `/b/` (`dal`, `dam`, …), `/v/` (`val`, `vam`, `vul`, …), and `/x/` (`xal`, `xam`, `xul`, …). Under `/ɡ/` `/h/` `/w/`, only the [restrictor core](restrictors.md) uses circumstance readings — not entity emptiness.

Do not confuse prefixed **`zem`** / **`zal`** (joins) with reviser **`em`** / **`al`** (slot repair) — [revisers.md](revisers.md).

### Negation (**`u`**)
<a id="negation-u"></a>

Plain **u** means the listed conjuncts **fail** — not invert, not *something else*.

| Arity | Shape | Reading |
|-------|-------|---------|
| list | `A B zul` | *none of A or B* |
| focus | `zazawan zul` | *not Azawan* |
| bare | `zul` / `zum` / `zun` | *no* |

```
`gonudam gul.`

gloss: `g-challenging` · `gul`

*not challenging.*
```

```
`zadedal zogevel zul.`

gloss: `z-tea` · `z-coffee` · `zul`

*none of tea or coffee.*
```

**Mnemonic:** **u** = *under* the claim — what does **not** hold. **-r** on **u** (`zur`) is *something else*, not *not* — see below.

### Unspecified member (**`-r`**)
<a id="unspecified-member-r-phrase"></a>
<a id="unspecified-member-r-phrase-a--o"></a>
<a id="something-anything-r"></a>

**-r** on **a** / **o** / **e** / **u** marks an **unspecified member** — not content-word anaphor **-r**. Same series at phrase, VP, and clause level.

| Vowel | Form | Reading |
|-------|------|---------|
| **a** | `zar` / `var` / `xar` | *something* / *do something* / *something happened* |
| **o** | `zor` / `vor` / `xor` | *anything* / *do anything* |
| **e** | `zer` / `ver` / `xer` | *whatever ranks highest* / *whatever matters most* |
| **u** | `zur` / `vur` / `xur` | *something else* / *someone else* |

Stacked vowels (**ao** / **ae** / **oe** / **ua** / **uo** / **ue**) take **no** **-r**. **-r** does not stack with **-l** / **-m** / **-n**.

```
`zar.`

gloss: `zar`

*something* / *someone.*
```

```
`zeborel zar.`

gloss: `z-person` · `zar`

*some (unknown) person.*
```

```
`zadedal zogevel zar.`

gloss: `z-tea` · `z-coffee` · `zar`

*some one among tea and coffee.*
```

**Trap:** `A B zar` is a whole-fence join — not a mid-chain extender between `A zam B`.

Under [question](questions.md#interrogative-force) force, these forms are **fill-asks** — [questions.md](questions.md#fill-ask-r).

### Phrase prefixes (quick map)

| Prefix | Slot |
|--------|------|
| `/z/` | subject NP |
| `/d/` | direct object NP |
| `/b/` | argument NP (of complex `/ɡ/` or `/h/`) |
| `/ɡ/` | adjective phrase |
| `/w/` | restrictor on preceding `/ɡ/` — [restrictors.md](restrictors.md) |
| `/h/` | clause circumstance restrictor — [restrictors.md](restrictors.md) |

The join prefix **must match** every conjunct head. Under `/ɡ/` `/h/`, joins are **-l** / **-m** / **-r** only; **-n** spellings there are [join-relations](join-extras.md#join-relations).

## Intermediate
<a id="intermediate"></a>

### Full focus and bare inventories

The starter table above covers common cases. Below are the full phrase-level focus and bare readings. VP and clause use the same arity pattern with `/v/` and `/x/` prefixes ([VP / clause forms](#vp-clause-forms)).

**Rank — focus**

| Form | Focus reading |
|------|---------------|
| **…el** (`zel` / …) | *only X matters* / *X, period*; + SHARED scale → superlative — [comparatives.md](comparatives.md) |
| **…em** (`zem` / …) | *X first* / *mainly X*; + SHARED scale → open superlative |
| **…ael** (`zael` / …) | *X tied for* / equal priority to X |
| **…aem** (`zaem` / …) | *X about tied for* / soft equal priority |
| **…aen** (`zaen` / …) | *X tied for* (stock / conventional draw label) |
| **…oem** (`zoem` / …) | *start with X* / *try X first* |
| **…oel** (`zoel` / …) | *only try X* / *X with no listed fallback* |
| **…uel** (`zuel` / …) | *X last, period*; + SHARED scale → least |
| **…uem** (`zuem` / …) | *X last* / mainly leave X for last |
| **…en** (`zen` / …) | *X first* (stock) / *X, as usual* — named unspecified ranking |
| **…er** (`zer` / …) | *preferably some X* / *X as a priority* |

**Rank — bare**

| Form | Bare reading |
|------|--------------|
| **…el** (`zel` / …) | *unspecified ranking*; + SHARED scale → unspecified who's top |
| **…em** (`zem` / …) | *I don't have a ranking* |
| **…ael** (`zael` / …) | *it's a draw* / *tie* |
| **…aem** (`zaem` / …) | *probably a tie* / *looks even* |
| **…aen** (`zaen` / …) | *it's a draw* (stock) |
| **…oem** (`zoem` / …) | *not sure where to start* |
| **…oel** (`zoel` / …) | *do nothing* / *don't bother*; + SHARED scale → empty superlative |
| **…oem** + SHARED scale | *no biggest comes to mind* |
| **…uem** (`zuem` / …) | *no ascending ranking from me* |
| **…uel** (`zuel` / …) | *unspecified ranking (ascending frame)* |
| **…en** (`zen` / …) | *unspecified ranking* (stock) |
| **…er** (`zer` / …) | *whatever's most important* |

**Set — focus**

| Form | Focus reading |
|------|---------------|
| **…al** (`zal` / …) | *just X* / *only X* |
| **…am** (`zam` / …) | *X, for one* / *X, say* |
| **…ol** (`zol` / …) | *has to be X* |
| **…om** (`zom` / …) | *say, X* / *X, or skip* |
| **…ual** (`zual` / …) | *everything but X* |
| **…uam** (`zuam` / …) | *everything but X (among exclusions)* |
| **…uol** (`zuol` / …) | *anything but X* |
| **…uom** (`zuom` / …) | *anything but X (open)* |
| **…aol** (`zaol` / …) | *X is enough* / *X'll do* |
| **…aom** (`zaom` / …) | *at least X* / *X would work* |
| **…ar** (`zar` / …) | *some (unknown) X* |
| **…or** (`zor` / …) | *any X* |
| **…ul** (`zul` / …) | *not X* |
| **…um** (`zum` / …) | *not X (among denials)* |
| **…un** (`zun` / …) | *not X* (stock / conventional) |
| **…ur** (`zur` / …) | *something other than X* |

**Set — bare**

| Form | Bare reading |
|------|--------------|
| **…al** (`zal` / …) | *nothing* / *nobody* |
| **…am** (`zam` / …) | *nothing comes to mind* |
| **…an** (`zan` / …) | *null* / *void* (bare-only under `/z/` `/d/` `/b/` `/w/`) |
| **…ol** (`zol` / …) | *no options* / *we're stuck* |
| **…om** (`zom` / …) | *I got no pick* / *skipping is fine* |
| **…ual** (`zual` / …) | *everything* / *everyone* |
| **…uam** (`zuam` / …) | *everything that comes to mind* |
| **…uan** (`zuan` / …) | *everyone* / *everything* (stock) |
| **…uol** (`zuol` / …) | *anything (goes)* |
| **…uom** (`zuom` / …) | *anything from me* |
| **…aol** (`zaol` / …) | *all set* / *nothing more needed* |
| **…aom** (`zaom` / …) | *nothing I need that I can think of* |
| **…ul** (`zul` / …) | *no* |
| **…um** (`zum` / …) | *no from me* |
| **…un** (`zun` / …) | *no* (stock) |
| **…ar** (`zar` / …) | *something* / *someone* |
| **…or** (`zor` / …) | *anything* / *anyone* |
| **…ur** (`zur` / …) | *something else* / *someone else* |

Focus/bare is also allowed on VP **…ul** / **…um** and clause **…ul** / **…um** / **…un** among joins. **`vun`** is a [join-act verb](join-extras.md#join-act-verbs), not a VP join.

Under [question](questions.md#interrogative-force) force: yes/no, offer, emptiness check, and fill-ask — [questions.md](questions.md#yes-no-unary-nullary).

### Rank joins
<a id="ranked-conjunction-e"></a>
<a id="rank-joins"></a>
<a id="priority-ranking-e"></a>

**e** / **oe** are **directional** — earlier conjuncts outrank later (*A ≻ B ≻ C*). **ae** is **not** directional: multi **ae** = equal rank / tie; multi **ae** + SHARED scale = [equative](comparatives.md#equatives). **ue** is [rank reversal](#invert-u-stacks): later outranks earlier.

| Vowel | Exclusivity | Direction | Typical use |
|-------|-------------|-----------|-------------|
| **e** | not claimed | earlier ≻ later | preference ladders; comparatives with SHARED scale |
| **ae** | equal | no order | tie / draw; *as ADJ as* with scale |
| **oe** | exclusive — pick one | earlier ≻ later | menu fallback; bare + scale = empty superlative |
| **ue** | not claimed | later ≻ earlier | ascending build-up lists |

```
`zadedal zogevel zudural zel.`

gloss: `z-tea` · `z-coffee` · `z-water` · `zel`

*tea ≻ coffee ≻ water.*
```

```
`zazawan zulonun zael gonudam.`

gloss: `z-grace` · `z-courage` · `zael` · `g-challenging`

*Azawan is as challenging as Ulonun.*
```

Fence chains keep ranking from **spoken conjunct order** before the right-close join.

### Comparatives, superlatives, and equatives
<a id="comparatives"></a>
<a id="superlatives"></a>
<a id="comparative-shared-scale"></a>
<a id="equatives"></a>

Scalar comparison — ranked **e** / **oe** / **ue** + SHARED scale, **ae** + SHARED scale, distributive set **a** + SHARED `/ɡ/`, [collective](plurality.md#collective-ascription) **a** + SHARED `/ɡ/`…**-sh**, and measured differentials — lives in **[comparatives.md](comparatives.md)**. Number spans (**a** / **e** / **ue** / **ua** + SHARED continuum `/ɡ/` + two endpoints) live in **[numbers.md § Ranges](numbers.md#ranges)**. Fence morphology stays on this page.

### Invert (**`ua`** / **`uo`** / **`ue`**)
<a id="invert-u-stacks"></a>

Leading **u** on **a** / **o** / **e** flips the base join — **not** plain **u** (negation).

| Form | Reading |
|------|---------|
| **ua** | *everything but* the listed |
| **uo** | *anything but* the listed (free choice outside) |
| **ue** | rank reversal (*A ≺ B ≺ C*) |

Domain for **ua** / **uo** comes from context or SHARED `/ɡ/` as kind — [universals, domains, and generics](#universals-domains-generics). **-m** on invert forms does **not** imply empty-allowed; only **`…om`** carries *or none*.

```
`zadedal zogevel zual.`

gloss: `z-tea` · `z-coffee` · `zual`

*everything but tea and coffee.*
```

**Trap:** `zagadal zual` = *everything but the cat*. For *every cat*, use SHARED kind: `zual gagadal`.

No **u** on plain **u**, and no **u** on stacked **ao** / **ae** / **oe**. No **-r** on any stacked form.

### Exclusivity, negation, and distribution

**Exclusive (`o`)** — at most one conjunct. **-l** = exactly one (empty not allowed); **-m** = at most one (*or none*).

**Inclusive (`ao`)** — one or more may hold. **-m** on **ao** does **not** allow empty.

**Negation distribution (not De Morgan):** negation over a join is **distributive** — it pushes into each conjunct and **keeps the same join vowel**. Agelan does **not** flip *and*↔*or* under negation.

```
`A B val vul.`

*not (A and B) = (¬A) ∧ (¬B).*
```

```
`A B vol vul.`

*not (A or B) = (¬A) ∨ (¬B).*
```

Under **`/h/`** / **`/w/`**, **u** denies **applicability circumstances** (*not when…*), not manner polarity — [restrictors.md](restrictors.md). Polar answer particles (**`juel`**, **`juol`**, …) are `/j/` interjections — [questions.md](questions.md#yes-no-polarity).

### Universals, domains, and generics
<a id="universals-domains-generics"></a>
<a id="generics"></a>
<a id="every-k"></a>

Mark kind / domain with ordinary **SHARED `/ɡ/`** — no separate domain particle. Conjuncts under **ua** / **uo** are **exclusions** from that domain.

| Shape | Reading |
|-------|---------|
| bare `zual` | *everything* / *everyone* |
| `zual` + SHARED `/ɡ/` | *every K* (`zual gagadal` = *every cat*) |
| `zuam` + SHARED `/ɡ/` | soft universal of K |
| `zual` + SHARED `/ɡ/` + conjuncts | *every K but* exclusions |
| focus `zual X` (no SHARED) | *everything but X* — **not** *every X* |
| bare `hual` | *always* (habitual frame) — [restrictors.md](restrictors.md) |

**Generics** use these fences — **not** plural **-sh** ([plurality.md](plurality.md)):

- Strict / definitional → closed `zual` + SHARED kind + [FORMAL](special-vocabulary.md#universality) warrant when needed.
- Soft / epistemic → open `zuam` + SHARED kind.
- Habitual characterizing → bare `hual` on the clause.
- Free-choice disposition (*Any cat will do*) → `zor`, not `zual`.

```
`zual gagadal.`

gloss: `zual` · `g-cat`

*every cat.*
```

### SHARED after the join
<a id="scope-fence-p-coord"></a>
<a id="scope-fence-p-join"></a>

Modifiers **immediately after** a phrase-level join scope over the **whole coordinated phrase** when they use ordinary right-bound `/ɡ/` / `/w/` morphology.

| Join family | SHARED `/ɡ/` role |
|-------------|-------------------|
| **a** | distributive property (*both ADJ*) or bundle description |
| **a** + `/ɡ/`…**-sh** | [collective](plurality.md#collective-ascription) (*ADJ together*) |
| **ae** + gradable `/ɡ/` | [equative](comparatives.md#equatives) scale |
| **e** / **oe** / **ue** on NP | [comparison scale](comparatives.md) |
| **ua** / **uo** | kind / domain for universals |
| **a** / **e** / **ue** / **ua** + two number endpoints | [numeric span](numbers.md#ranges) with continuum `/ɡ/` |

Local modifiers stay **inside** each conjunct (after that conjunct's head, or `gl-` before the head). Do not put further matching-role conjunct heads after `P-JOIN` / `SHARED`.

```
`zogodol zagadal zal gonudam.`

gloss: `z-dog` · `z-cat` · `zal` · `g-challenging`

*(challenging dog) and (challenging cat).*
```

```
`zogodol zagadal zam gogobul bazawan.`

gloss: `z-dog` · `z-cat` · `zam` · `g-ownership` · `b-grace`

*Azawan's (dog and cat).*
```

### Join scope islands
<a id="join-scope-islands"></a>
<a id="join-scope-islands-rules"></a>

When other same-slot material sits nearby, wrap the sub-stretch and its join **inside** a [scope island](spans.md#adjunct-scope-islands) **`^ … ^`**. The join stands **inside** the island and absorbs only matching-role material there.

| Shape | Reading |
|-------|---------|
| `zazawan ^ zudural zal ^ zam` | *Azawan and (just water)* |
| `zazawan ^ zal ^ zam` | *Azawan and nothing* |
| `^ zudural zal ^` | *just water* alone in the slot |
| `^ hadazol z<A> z<B> zam ^` | *maybe (A and B)* |

One island per clause; no nesting of islands. Same-slot material outside an island with no outer join tying it in is illegal.

### Frame echo (two-beat)
<a id="frame-echo"></a>
<a id="frame-echo-two-beat"></a>

When the join frame should be clear **before** the conjuncts (*everything but…*, *all of these…*), use **two beats**: announce with a **bare** join, then list conjuncts under a **second** right-close with the **same** spelling.

| Beat | Shape | Role |
|------|-------|------|
| 1 — announce | bare `P-JOIN` (optional SHARED domain) | sets the frame |
| 2 — seal | `PHRASE… P-JOIN` | exclusions or members under that frame |

```
`zual` · `zonunol zugugel zual`

*everything — (but) onion and cucumber.*
```

```
`zal` · `zegerel zodamol zal`

*the lot — greens and tomato.*
```

Prefer a single right-close when early frame is unnecessary. Frame echo is **style**, not a second grammar.

### Fence nesting
<a id="fence-nesting"></a>
<a id="opener-r-coordination"></a>

Flat coordination uses **one** right-close fence. **Nested** joins stack multiple right closes — **left-associative** only.

| Pattern | Example | Reading |
|---------|---------|---------|
| flat | `A B C vol` | *A ∨ B ∨ C* |
| nested | `A B vol C val` | *(A ∨ B) ∧ C* |

**Pure infix is illegal** (`A vol B val C`). **Left fences are illegal**. Scope islands may wrap an inner join: `A ^ B C val ^ vol` → *A or (B and C)*.

Same rule at phrase, VP, and clause level.

### Soft **`-n`** (clause only)
<a id="soft-n-clause"></a>
<a id="soft-n-vp-clause"></a>
<a id="ending-senses"></a>

On **`/x/`** only, join **-n** is **soft packaging** — not phrase named **-n**. Narrative *and then* is **`xan`**.

| Form | Soft reading |
|------|----------------|
| `xan` | *and then…* |
| `xon` | *or maybe…* — uncertain alternatives |
| `xun` | soft *not* / *none of… as I recall…* |
| `xaon` | *and/or maybe…* |
| `xuan` / `xuon` | soft complement inventory / free choice |
| `xen` / `xaen` / `xoen` / `xuen` | soft ranked / tie / exclusive / reversal |

VP `/v/`…**-n** spellings are [join-act verbs](join-extras.md#join-act-verbs). `/ɡ/` `/h/`…**-n** are [join-relations](join-extras.md#join-relations).

### VP and clause forms
<a id="vp-clause-forms"></a>
<a id="vowels--endings"></a>
<a id="ending-senses-clause-joins"></a>

| | **-l** | **-m** | **-n** | **-r** |
|---|--------|--------|--------|--------|
| **a** | `val` / `xal` | `vam` / `xam` | `xan` soft; **`van`** join-act | `var` / `xar` |
| **o** | `vol` / `xol` | `vom` / `xom` | `xon` soft; **`von`** join-act | `vor` / `xor` |
| **u** | `vul` / `xul` | `vum` / `xum` | `xun` soft; **`vun`** join-act | `vur` / `xur` |
| **ao** | `vaol` / `xaol` | `vaom` / `xaom` | `xaon` soft | — |
| **ua** | `vual` / `xual` | `vuam` / `xuam` | `xuan` soft | — |
| **uo** | `vuol` / `xuol` | `vuom` / `xuom` | `xuon` soft | — |
| **e** | `vel` / `xel` | `vem` / `xem` | `xen` soft; **`ven`** join-act | `ver` / `xer` |
| **ae** | `vael` / `xael` | `vaem` / `xaem` | `xaen` soft | — |
| **oe** | `voel` / `xoel` | `voem` / `xoem` | `xoen` soft | — |
| **ue** | `vuel` / `xuel` | `vuem` / `xuem` | `xuen` soft | — |

**VP-level** — each conjunct is a verb plus its own object material. When every conjunct is a bare verb, a `/d/` **immediately after** the join (SHARED) scopes over all verbs: `vohewo vabebal vam dabebal` → *washed and ate an apple*.

**`/h/` scope relative to VP fence:**

- `/h/` **before** the VP stretch → applies to every conjunct.
- `/h/` in SHARED after the join → shared over every conjunct.
- `/h/` inside a conjunct → that VP only.

**Clause-level** — `/x/` is **same-force continuation**. Non-initial conjuncts **inherit** opener force and omit `/j/` (including recoverable **`jal`**). One speech act for the whole fence; mixed force inside one fence is illegal.

```
`A B C xan.`

*A and then B and then C.*
```

```
`A B xol C xal.`

*(A or B) and C.*
```

Do not read **`xaom`** / **`xaol`** as *SENT₁ is sufficient for SENT₂* — peer coordination only.

## Advanced
<a id="advanced"></a>

### Named phrase **`-n`**
<a id="named--conventional-ending-phrase-level-all-join-vowels"></a>

On **phrase-level** joins under **`/z/` `/d/` `/b/` `/w/`** only, **-n** marks a **named / conventional list** — an established bundle (*the primary colors*, *stop–drop–roll*), not a freshly composed inventory.

**-n** is an alternative to **-l** / **-m**, not a third completeness tier and not stackable with them. Same mnemonic as content-word [proper name **-n**](reference-suffix.md#proper-name--n). **Not** on `/ɡ/` or `/h/` (join-relations), **not** on VP `/v/` (join-act verbs), **not** on clause `/x/` (soft **-n** instead). Stock AP bundles use [mention](spans.md) spans, not a `/ɡ/` named join.

**…an** is **bare-only** on phrase fences under **`/z/` `/d/` `/b/` `/w/`** (no one-conjunct reading). Under `/ɡ/` `/h/`, **…an** / **…en** / other **-n** join-vowel spellings are [join-relations](join-extras.md#join-relations).

### Rare arities and edge readings

- Focus / bare phrase forms listed in Intermediate are the defined set; all other phrase joins need two or more conjuncts.
- **…ul** / **…um** / **…un** are defined at **all** arities where still joins (bare *no*; focus *not X*; multi *none of*).
- **…ar** / **…or** / **…er** / **…ur** at all arities — see [unspecified-member **-r**](#unspecified-member-r-phrase).
- **…aen** bare = *it's a draw*; **…en** bare = *unspecified ranking* (stock); **…an** bare = *null* / *void*.
- **…ual** bare = *everything*; **…uol** bare = *anything (goes)*.
- Content-word `-l`: `zeborel` = ordinary indefinite (*a person*). `zeborel zar` = explicitly non-identified (*some person, unknown who*).
- `A B C zor` = any of them is fine (**no** order). `A B C zer` = pick by ranking.
- `A B zar` = some one **among** A and B. `A B zur` = some one **other than** A and B. `A B zual` = *everything but* A and B.
- Revision **`ul`** / **`um`**: *except* a named right-hand side — [revisers.md](revisers.md). Prefixed **`zur`**: unspecified *something else*, not an *except*-reviser.
- Rank **oe** marks exclusive realization along a ladder; preference vs contingency is read from context, not a different ending.
- Nest if you need a rare mix (e.g. closed list but empty OK: `A B vol zol zal`).
- Causal default on **`…aom`** → [causation.md](causation.md#sufficient).

### Reserved forms
<a id="phrase-reserved-forms"></a>

Under `/z/` `/d/` `/b/` `/ɡ/` `/w/` `/h/`, the join series plus allowed endings are **only** these joins or [restrictors](restrictors.md) (under `/h/` `/w/`: core defined, other spellings reserved but undefined). **`/ɡ/`…**-n** and **`/h/`…**-n** are [join-relations](join-extras.md#join-relations). No three-vowel stacks.

Under `/v/`, join endings are **-l** / **-m** / **-r** only; parallel **-n** spellings are [join-act verbs](join-extras.md#join-act-verbs).

Under `/x/`, the join series plus allowed endings are **only** these clause joins. No stacked-vowel **-r**.

Phonotactics for reserved join roots: [phonology.md](phonology.md#phonotactics).

### Constraints

- **One slot** per chain — single subject, object, `/b/` argument, `/ɡ/` stack position, `/w/` restrictor unit, or `/h/` restrictor unit. Under `/h/` `/w/`, that slot is a restrictor, not sibling modifier *and*.
- **Matching role prefix** on every conjunct head and on the join.
- **One right-close fence per flat list** — never left fence; never pure infix. Nested joins: [fence nesting](#fence-nesting).
- **Shared modifiers** only immediately after each `P-JOIN`; local modifiers stay after their own heads.
- **Phrase -r** — only **…ar** / **…or** / **…er** / **…ur**; no plural **-sh** on the join.
- **Not** verb+object packages at phrase level — use VP-level; **not** full sentences — use `/x/`.
- **Not** mixed-PoS joins; correlatives; `/x/` sentence linkers (*however*, *therefore*); general adversative *but*; [cite / mention / aside fences](spans.md); [numbered enumeration](numbers.md#number-as-discourse-marker-by-marker).
- In-clause *including* / *rather* / *instead* / *except* are [revisers](revisers.md), not this fence series.
- **No** prefix-less joins. Prefixed joins always have PoS prefix + ending. Prefix-less **al** / **am** / … are revisers only. Whole-word **a** / **e** / **o** / **u** (no ending) are illegal.
- Floating `/h/` inside an NP/AP/`/b/` join is **transparent** — it does not end the list. VP-chain `/h/` scope differs — see [VP-level](#vp-level-coordination).
- Clause-level: no gapping across conjuncts; subordination (*because* / *if*) stays `/h/` + `/b/` [next-clause pronoun](pronouns.md#special-pronouns).
- Sibling manner stacking on `/h/` `/w/` uses **juxtaposition**, not a fence (`hadal hemudel`).

### Revisers
<a id="in-clause-revision-bare-a--e--o--u"></a>
<a id="bare-revision"></a>
<a id="in-clause-revision"></a>
<a id="revisers"></a>
<a id="revision-chains-parallel-on-a"></a>

Prefix-less **al** / **am** / **an** / **el** / **em** / **en** / **ol** / **om** / **on** / **ul** / **um** / **un** — in-clause repair of a fixed left side, or discourse glue before force / omitted-default body / [clause `/x/`](#clause-level-coordination) continue / `/x/` linker. Full grammar: **[revisers.md](revisers.md)**.

### Restrictors
<a id="circumstance-restriction-h-w"></a>
<a id="circumstance-h-w"></a>
<a id="restrictors"></a>

Under `/h/` and `/w/`, the join series marks **applicability circumstances** (not sibling *and*). Full grammar: **[restrictors.md](restrictors.md)**.

## See also

- Prefix-less revision (*including* / *rather*): [revisers.md](revisers.md)
- Applicability *when* under `/h/` `/w/`: [restrictors.md](restrictors.md)
- Fill-ask and yes/no on focus/bare joins: [questions.md](questions.md)
- Join-act verbs / join-relations: [join-extras.md](join-extras.md)
