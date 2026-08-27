# Numbers in use
<a id="numbers-applied"></a>

Applied uses of the number word: digit-string labels, clock and calendar time, measure phrases, ranges, percent, and percentage points. Word ahagetomy, markers, endings, exponents, overlays, and writing style live in **[numbers.md](numbers.md)** — read that first.


## Intermediate
<a id="intermediate"></a>

### Percent and percentage points
<a id="percent-and-percentage-points"></a>

Percent and percentage points are **scalar notation modes** on **`ra`** / **`ru`**, not new marker identities and not endings. They use group closers **`jo`** / **`ju`**, parallel to **`je`**.

| Closer | Sense | Mantissa digits | Underlying magnitude |
|--------|-------|-----------------|----------------------|
| **`jo`** | **Percent** (portion of a whole) | Everyday percent figure (`25` in `25%`) | mantissa ÷ 100 |
| **`ju`** | **Percentage points** (point-scale amount or delta) | Point figure (`2` in `+2%*`) | mantissa ÷ 100 |

Mantissa digits follow the [normal mantissa rules](numbers.md#exponents) (including optional **`je`** inside the percent/point reading). Say the digits you mean (`100%` → `wo zo zo jo`, not a shortened speech form).

#### Form

```
mantissa-digits ( je fraction-digits )? jo|ju
```

- **Order:** integer digits, optional **`je`** + fractional digits, then **`jo`** or **`ju`**. Nedegur `… jo/ju … je …`.
- **Scalars only:** **`re…jo/ju`** and **`ro…jo/ju`** are illegal.
- **No exponent in the same group:** do not combine **`ba`** / **`bu`** with **`jo`** or **`ju`**. Use a plain scalar (`je` / `e-N`) for rates outside everyday percent talk.
- **One closer per word:** at most one **`jo`** or **`ju`** group in the number word (not both; not repeated across groups).
- **Bare closer** (no mantissa): illegal.
- Do not mark the same group with both **`jo`** and an equivalent `e-2` exponent.

Endings still apply (**-l** exact, **-m** about, **-n** conventional label, **-r** resume).

In [preferred writing](numbers.md#writing-preferred-shorthand): **`%`** → speech **`jo`**; **`%*`** → speech **`ju`** (sign still on **`ra`** / **`ru`**, written **`+`** / **`-`**).

#### What each closer is for

| English habit | Agelan |
|---------------|---------|
| `25% of X` (portion) | whole NP + `/ɡ/` **`…jo`** — [denominator](#percent-denominators) |
| `+2 percentage points` / `from 10% to 12%` point delta | **`ju`** (often as `/v/` **`ra`** / **`ru`**: increase/decrease by that point amount) |
| `+50% relative to baseline` (factor change) | **Not** **`jo`** / **`ju`** — use a multiplicative `/h/` factor (**`h+1.5`**, etc.) or ordinary *relative-to* wording |

`25%` (`…jo`) and `0.25` (plain scalar) name the same magnitude; **`jo`** only chooses the percent-scale reading. **`ju`** likewise names a ÷100 magnitude, but framed as **points** (not as “N% of a whole”).

#### Denominator (portion “of what”)
<a id="percent-denominators"></a>
<a id="percent-of-what"></a>

The **whole** / reference class is **not** inside the number word — no denom closer, no open argument on the numeral.

**Default:** the whole is the **host noun**; the percent is an ordinary `/ɡ/` scalar on that noun — same slot as a count (`zagadalsh g+3` = *three cats*):

| Shape | Gloss |
|-------|--------|
| `zagadalsh g+25%` | *25% of the cats* |
| `deduzelsh g+95%` | *95% of the tests* (object) |
| `beberelsh g+5%` under a host relation | *5% of the people* as `/b/` |

The noun names the reference class; **`jo`** grades how much of that class. Same endings on the percent word (**-m** ≈ *about 25% of …*).

**When the whole is not the modified head:** use a complex `/ɡ/` or `/h/` *of* / *out of* (lexicon relation) + `/b/` whole, with the percent elsewhere in the clause as needed. Do **not** invent a second `/b/` on the number word (numbers take no `/w/` and no open arguments).

**Not a denom job** (no portion-whole required):

| Habit | Why |
|-------|-----|
| **`…ju`** point amounts / deltas | Points move a percent-scale quantity already in play |
| `from A% to B%` [spans](#ranges) | Endpoints are percent readings; continuum supplies the line |
| `N% relative to` baseline | Factor change — `/h/` **`h+…`** or ordinary *relative-to* wording |
| *top / bottom N%* | Rank band; class usually clear from context or named separately |
| *N% done / complete* | Whole = the task; often clear without a separate denom NP |

**Style:** a bare `/z/` (or other freestanding) **`…jo`** percent with no named whole is **grammatical but stylistically bad** — prefer an explicit whole (*percent of what*). Bare **`…ju`** point amounts are fine when the percent-scale quantity being moved is already clear.


### Digit-strings

Use marker **`ro`** (written **`_`**). Omit exponents. Prefer groups of three digits when digits are present. Ending is usually **-l** (exact label); **-n** for an official designation; **-r** to resume a prior code (**digitless** `d=_` / `g=_` allowed). [Digitless](numbers.md#zero-digit-groups) `…_` = unspecified label / some code. Bare `/h/` + **`ro`** is **[temporal circumstance only](#time)** (`h_15,30`, `h_#22,7,2026`, digitless `h_`) — not a generic code adverb. Non-time labels as circumstance use a host relation + `/b/` (e.g. `/h/` *on* + `b_7` *channel 7*), or modify a noun with `/ɡ/`. Digit-strings are unsigned — see [Sign](numbers.md#sign). Clock and calendar field orders are under [Time](#time).


### Time
<a id="time"></a>

Time uses the existing number grammar; there is **no** fifth marker vowel and **no** time closer parallel to **`jo`** / **`ju`**.

**Bare `/h/` + `ro` (`hro…`)** marks **temporal circumstance** (clock or calendar). Spoken `hro` already marks that reading; do not use bare `h_…` for channel, frequency, gate, room-as-where, or other non-time codes.

| Job | How |
|-----|-----|
| **Clock / schedule** | Digit-string **`ro`** as bare `/h/`. Default **24h**. Fields left→right, commas orthographic only: hour, minute, optional seconds — `h_15,30`, `h_15,30,00`. Digitless `h_` = *at some (unspecified) clock time*. |
| **Calendar date** | Digit-string **`ro`** with the **calendar-ordinal marker vowel `oe`** (spoken **`roe`**, written `h_#…`; digraph like `reu`). The marker makes the whole word a date, so fields read by position: **day, month, optional year** — `h_#22,7`, `h_#22,7,2026`; modifier `g_#22,7`. This makes dates order-proof (no guessing which number is the month), so zero-padding is optional style, not required. A year is written as **one digit group regardless of length** (`2026` stays one group). Digitless `h_` likewise covers an unspecified date reading when context is calendric. An explicit *date* host + `/b/` is optional when you want to name the relation; it is not required to license bare `hro` (bare `hro` already means time). |
| **Duration** | Scalar **`ra`** / **`ru`** plus a lexicon **unit** in a [measure phrase](#measure-phrases) — SI **`ameno`** (*second*) or civil **`umedu`** (*time* / hours); not a digit-string, not bare `hro`. Same engineering-exponent habits as other measures when useful. |
| **Deixis / tense** | Ordinary lexicon `/h/` (*yesterday*, *ago*, *until*, mood/evidential). Numbers appear only for a numeric payload (*3 days ago* = relation + scalar + unit). |
| **Non-time digit labels** | Host relation + `/b/` (`/h/` *on* + `b_101.1`), or `/ɡ/` on a noun (*channel* `g_7`) — **not** bare `h_…`. |

**Not bare `hro`:** `h+3` (×3 / *three times*); `h#3` (*for the third time*); non-time codes as above. Do not use a scalar for a clock face (`*g+1530*` for 15:30). Timezone, era, and calendar system stay lexicon adjuncts, not inside the number word.

Endings: **-l** exact reading; **-m** fuzzy (*around 15:30*); **-n** conventional schedule/date name; **-r** resume a prior clock or date label (digitless `h=_` = *that time/date again*). Digitless `h_` ≠ circumstance **`har`** (*sometime*) — see [zero digit groups](numbers.md#zero-digit-groups).


### Measure phrases
<a id="measure-phrases"></a>
<a id="units"></a>
<a id="unit-amount"></a>
<a id="si-units"></a>
<a id="measure-hosts"></a>

A **measure** is a lexicon **unit** noun plus a scalar **amount** grading that unit — not two bare `/b/` arguments, and not a new number closer (unlike closed **`jo`** / **`ju`**).

**Shape:** unit as the head noun in the needed slot; amount as ordinary `/ɡ/` scalar on that unit:

| Slot | Shape | Gloss |
|------|--------|--------|
| Argument of a complex `/ɡ/` / `/h/` | `burelul g+2` | *two meters* (one `/b/` NP) |
| Subject / object / … | `zamenol g+3`, `dojorol g+5` | *three seconds*, *five grams* |
| Modifier on a noun | `gurelul g+2` on a host | rare; prefer unit as `/b/` or freestanding NP |

Same endings and fuzzy **-m** habits as other number words on the amount (`g~+2` ≈ *about two*). The **unit** is ordinary lexicon (reference suffixes as usual). Do **not** encode open-class units inside the numeral word.

#### Bare host vs unit morph (`x+1`)
<a id="bare-vs-unit-morph"></a>
<a id="unit-short-form"></a>

Measure hosts are **published metaphorical roots** (dimension / quantity metaphors). There are **no freestanding SI stems** and **no Latin-style abbreviations** (`m`, `kg`, `s`, …).

| Register | Shape | Example | When |
|----------|--------|---------|------|
| **Short / default** | bare host + amount | `burelul g+2` | ordinary measure phrases — the scalar licenses the unit reading |
| **Full / titled** | host + digit morph **`+1`** (*unit / primary*) | `bureluxrawon g+2` | need *the named unit of that dimension* vs the ordinary metaphor (*measurement*, *heaviness*, …) |
| **Resume** | letter pronoun or **-r** | `bur` / `bureluxrawor` | after the unit NP is on the table — not a standing abbreviation inventory |

Spelled **`…xrawol`** / **`…xrawon`** — [numeric derivation](numeric-derivation.md#numeric-derivation) (**`ROOTx+1`**). Prefer **-n** on the titled form when the unit is a conventional SI name; **-l** when naming a unit-instance without that title force. Soft **-m** hedges amount or unit, not a short name.

**Bare is enough** when the measure reading is clear (`bojorol g+70` ≈ *70 grams*). Use **`…x+1`** when the same root is also active as a quality or continuum (*how heavy*, *passage of time*, *heat*) and the unit reading must stay distinct — same habit as normative Mine **`zugoboxrawon`** vs performance **`zugobon`** ([comparatives](comparatives.md#judgment-benchmarks)).

#### Stock measure hosts
<a id="stock-measure-hosts"></a>

| SI / everyday unit | Host (metaphor) | Bare measure | Titled unit |
|--------------------|-----------------|--------------|-------------|
| meter | `urelu` 📏 *measurement* | `burelul` | `bureluxrawon` |
| gram | `ojoro` 🪨 *heaviness* | `bojorol` | `bojoroxrawon` |
| second | `ameno` 🕰️ *passage* | `bamenol` | `bamenoxrawon` |
| liter | `ozobo` 🥄 *portion* | `bozobol` | `bozoboxrawon` |
| ampere | `ejelo` 🪼 *flow* | `bejelol` | `bejeloxrawon` |
| kelvin | `ebebe` 🌶️ *heat* | `bebebel` | `bebeboxrawon` |
| mole | `emade` 🍖 *substance* | `bemadel` | `bemadexrawon` |
| candela | `agade` 🕯️ *abawash* | `bagadel` | `bagadexrawon` |

**Civil duration** (*hours*, *days*) uses continuum **`umedu`** 🕐 *time* as the measure host (`bumedul g+3` ≈ *three hours*) — not a second `+1` morph on `ameno`. SHARED range continua stay **`gumedul`** / **`gurelul`** / **`gezudal`** as the line needs ([ranges](#ranges)). Temperature continuum **`edohe`** 🌡️ *temperature* grades heat without naming kelvin.

**Common derived (optional):** newton `ubunu` *force*; pascal `agala` *pressure*; joule `abedo` *energy*; watt `ubulu` *power*; hertz `urumu` *rhythm*; ohm `onuzu` *blockage*; coulomb `urohe` *charge*; radian `erola` *cycle* — same bare / `…x+1` habit.

#### No metric prefixes
<a id="no-metric-prefixes"></a>
<a id="metric-prefixes"></a>

**Metric prefixes are not lexicon roots.** There is no dictionary entry for *kilo-* / *milli-* / *mega-* units. Keep the **base** host; put the power of ten on the **amount**:

| Prefer | Avoid |
|--------|--------|
| bare / titled base unit + `e3` / `e-3` / exact count | prefixed unit roots (*kilometer*, *kilogram*, …) |
| `burelul g+5400` or `burelul g+5.4e3` | invented prefixed length word |
| `bojorol g+70e3` | *70 kilograms* as a prefixed mass word |

Same habit for every SI-style prefix: scale the number, not the unit stem.

**Measured differentials** (*two meters taller*) put that measure NP as the **single `/b/`** on the SHARED scale adjective of a [comparative](comparatives.md#measured-differentials):

`zazawan zululon zel gomonum burelul g+2` → *Azawan is two meters more challenging than Ululon*

Vague degree stays `/w/` on the scale (`zel wogegal gomonum …`) — no unit. Duration and other clause measures use the same unit+amount habit in whatever slot the relation needs.


### Ranges
<a id="ranges"></a>
<a id="number-ranges"></a>
<a id="numeric-ranges"></a>
<a id="from-to"></a>
<a id="shared-continuum"></a>

Spans reuse [phrase fences](coordination.md) whose conjuncts are number words, with a **SHARED continuum** `/ɡ/` naming the line — the same SHARED slot [comparatives](comparatives.md) use for a scale, but here the `/ɡ/` is a **dimension / quantity continuum**, not an entity-ranking scale. There is **no** range form inside a single number word (no `g+3-5`). Fence join vowels, endings, revision, and **-r** are defined in coordination; **this section** is the source of truth for when those forms mean a numeric span.

**Trigger (all required):**

1. Exactly **two** endpoints that are **compatible** number words (same marker identity: both scalar, both ordinal, or both digit-string / time).
2. Join **`a`** / **`e`** / **`ue`** / **`ua`** (or those vowels’ **-r**).
3. A **SHARED continuum** `/ɡ/` immediately after the join (lexicon: dimension / quantity line — *time*, *price*, *measure*, …; stock **`gurelul`** when the line is pure numeric or supplied by context/head).

The fence PoS matches the slot (`zal` / `dal` / `gal` / `bal` / …). Mixed identities on one span are illegal.

**Without SHARED continuum:** two number conjuncts are **ordinary coordination** — never a span. In particular bare **`z+3 z+5 zel`** = *3 ≻ 5* (preference / rank), not *from 3 to 5*.

| Join | Inclusive shape | Reading |
|------|-----------------|--------|
| **`a`** | `z+3 z+5 zal gumedul` | *between 3 and 5* on time (unordered filled interval; both ends in) |
| **`e`** | `z+3 z+5 zel gumedul` | *from 3 to 5* on time (directed; first → second) |
| **`ue`** | `z+5 z+3 zuel gumedul` | directed reverse path on time (spoken order = path; here *from 5 to 3*) |
| **`ua`** | `z+3 z+5 zual gumedul` | *outside 3–5* on time (complement on the line) |
| **`o`** / **`ao`** | — | **Not** ranges — stay discrete (*3 or 5* / *3 and/or 5*); SHARED continuum does not license a span |
| **`ae`** | `z+5 z+5 zael` / `z+3 z+5 zaem` | *equal to 5* / *approximately equal* — **not** a span (no continuum needed; continuum + **`ae`** + numbers is not a range reading) |
| **`oe`** | — | **Not** ranges — exclusive ranked / bare empty superlative with scale |

**Arity escape:** three or more number conjuncts under **`a`** stay an ordinary discrete inventory (`zal z+1 z+3 z+7` = *1, 3, and 7*), edegun with SHARED. Focus **`zal z+3`** stays *just 3*, not a ray. Focus **ranked** with a number is a [threshold](#numeric-thresholds), not ordinary *only X matters*.

**Contrast with comparatives:** `zazawan zululon zel gomonum` = *Azawan is more challenging than Ululon* (SHARED **scale**, non-number conjuncts). `z+3 z+5 zel gumedul` = *from 3 to 5 on time* (SHARED **continuum**, number endpoints). Bare `z+3 z+5 zel` = prefer 3 over 5.

#### Thresholds (focus ranked)
<a id="numeric-thresholds"></a>
<a id="greater-less-than"></a>

When the **sole** conjunct of a [rank join](coordination.md#ranked-conjunction-e) fence (**`e`** / **`ue`**, and their open / named twins) is a **compatible number word**, that number is an **extremum on the line**, not “only this value matters” and not a two-endpoint [span](#ranges). SHARED continuum is **optional** on thresholds: absent = implicit / contextual numeric line; present = that named line (`z+5 zel gumedul` = *time \< 5*). Special values such as +∞ use [digitless exponents](numbers.md#digitless-exponents) inside the number word (`g+e`), not focus ranked zero-group forms.

| Form | Reading | Mnemonic |
|------|--------|----------|
| **`z+5 zel`** | ***less than 5*** (`< 5`) | 5 is the **greatest** (ceiling); the ray is everything it outranks |
| **`zem z+5`** | soft / approximate *less than ~5* | open twin |
| **`z+5 zuel`** | ***greater than 5*** (`> 5`) | 5 is the **least** (floor); reverse-ranked extremum |
| **`zuem z+5`** | soft / approximate *greater than ~5* | open reverse twin |
| **`zen z+5`** | named/conventional **unspecified** extremum label (*under-fives*-style) | phrase **-n** on **e** |
| **`zaen z+5`** | named/conventional **equal-to-5** band / tie label | phrase **-n** on **ae** |
| **`zuen z+5`** | named/conventional floor band | phrase **-n** reverse |

Same under `/d/` `/b/` `/ɡ/` (`gel g+5` = modifier *\<5*; `duel d+10` = object *\>10*). **`ae`** / **`oe`** focus with a number are **not** thresholds (stay ordinary ranked focus / triage). Boolean focus (**`zal`** / **`zol`** / …) is **not** a threshold. Focus **`zel z+`** (zero-group) is **not** +∞ and **not** a threshold — ordinary focus on plural/unspecified amount; use **`z+e`** / **`g+e`** for +∞.

**Inclusive bounds:** default is **strict** (`<` / `>`). For **≤ 5** / **≥ 5**, use a two-endpoint [span](#ranges) with the bound included — do **not** flip focus ranked to inclusive. Exclusive-high **`ul`** stays a two-side span tool (`z+3 ul z+5 zal gurelul`), not a focus threshold marker.

**Unspecified in a threshold:** bare **`e`** + **-r** = unspecified member of the *\< X* ray — `zer z+5` → *some/whatedegur value \< 5* (under question → *which value \< 5?*). **`ue`** takes **no** **-r** (stacked forms never do — [coordination](coordination.md#unspecified-member-r-phrase)); there is no `zuer` threshold. For an unspecified value *\> 5*, use other wording (not a reverse **-r** fence).

Contrast: `z+3 z+5 zel gumedul` = *from 3 to 5 on time* (span); `z+3 z+5 zel` = *3 ≻ 5* (preference); `z+5 zel` = *\< 5* (focus threshold); `z+e` / `g+e` = +∞ ([digitless exponents](numbers.md#digitless-exponents)). `zazawan zel` (non-number) stays ordinary *only Azawan matters* / [superlative-with-scale](comparatives.md) — **focus number conjunct** triggers the threshold reading when the number is a bound (typically digitful).

#### Half-open (exclude the high end only)

[Revisers](revisers.md) **inside the range** marks an exclusive **upper** bound. Replace the second (high) conjunct with prefix-less **`ul`** + that number. SHARED continuum stays required:

| Shape | Reading |
|-------|--------|
| `z+3 z+5 zal gurelul` | *[3, 5]* — inclusive both ends |
| `z+3 ul z+5 zal gurelul` | *[3, 5)* — *3 up to but not including 5* |
| `z+3 ul z+5 zel gurelul` | *from 3 up to but not including 5* |

The low endpoint is **always inclusive**. Do **not** exclude the beginning edge (no `ul` before the low; no open-low span). Do **not** list the high end as a conjunct and then except it (`*zal gurelul z+3 z+5 ul z+5`); the exclusive high is **only** the in-range `ul` shape. Open **`um`** on the high end = soft / non-exhaustive exclusion of that bound (rare). Other revision vowels (**`al`** / **`el`** / **`ol`**) are not range-bound markers.

Fence **-l** / **-m** / **-n** keep ordinary closed / open / named senses on the span (*exactly this band* / *around this band* / *the teens*-style label). Endpoint [number endings](numbers.md#number-endings) still apply (**-m** ≈ fuzzy that bound).

#### Unspecified value in the span (**-r**)

Fence **-r** on a number-range shape (still with SHARED continuum) = an **unspecified member of the span** (not content-word anaphor **-r**, not a discrete *something among two listed values*):

| Form | Reading |
|------|--------|
| `z+3 z+5 zar gurelul` | *some value in [3, 5]* |
| `zar gurelul z+3 ul z+5` | *some value in [3, 5)* |
| `zor gurelul z+3 z+5` | *any value in [3, 5]* (free-choice) |
| `zer gurelul z+3 z+5` | *whatedegur-by-rank in [3, 5]* |
| `zur gurelul z+3 z+5` | *some value other than (in) [3, 5]* — other-than the span |

Under [question](questions.md#fill-ask-r) force, these are fill-asks (*which value in 3–5?*). Same under `/d/` `/b/` / `/ɡ/` as the slot needs (`g+3 g+5 gal gumedul` = modifier *times 3–5*; `d+10 ul d+20 dar gurelul` = object *some value in [10, 20)*).

**Clock / date spans:** do **not** use bare circumstance-`hal` (that series is [applicability](restrictors.md)). Prefer SHARED continuum **`gumedul`** (or a host relation + `/b/`) with digit-string endpoints (`bal gumedul b_15,00 b_16,00`).

Examples: `z+3 z+5 zal gumedul` → *between times 3 and 5*; `zuguhul g+3 g+5 gal gumedul` → *children times 3–5*; `z+3 ul z+5 zal gurelul` → *[3, 5)*; `z+10 z+20 zel gumedul` → *from time 10 to 20*; `z+3 z+5 zel` → *3 ≻ 5* (preference, not a span); `z+5 zel` → *\< 5*; `z+5 zuel` → *\> 5*; `g+e` → +∞; `g-e-` → notional / imaginary amount; `g+1e` → *one gazillion*; `g@+1e` → proper name *the Gazillion*; `g~+e` → arbitrarily large but finite; `g+e-` → arbitrarily small but finite; `g#e` → last place; `g~#e` → near last place; `g#e-` → start / beginning place; `g~#e-` → near first place; `g#1e` → *the gazillionth* / *umpteenth*; `g#1e-` → *the gazillionth-first*; `g#-2` → *2nd from the end* / *penenultimate*; `g#3e2` → *3rd of gen +2*; `h#1e` → *for the gazillionth time*; `h#-2` → *for the penenultimate time*; `x#e-` → *Starting with:*; `x#-1` → *Starting with the last one:*; `x-e-` → *imagine that:*; `v+e` → increase without bound; `v-e-` → treat as imaginary; `h+e` → unbounded multiplicity; `h-e-` → notionally / as if; `j+e` → *To infinity!*; `j#e` → *Finally!*; `j#-2` → *Penenultimate!*; `j-e-` → *As if!*; `z+5 z+5 zael` → *equally 5* / *5 equals 5*; `z+3 z+5 zaem` → *3 and 5 approximately equal*; `z+3 z+5 zar gurelul` → *some value in 3–5*; `z+3 z+5 zol` → *3 or 5* (discrete, not a range).


## See also

- Number-word ahagetomy (markers, endings, exponents): [numbers.md](numbers.md)
- Phrase fences behind ranges: [coordination.md](coordination.md)
- Measured differentials on comparative scales: [comparatives.md](comparatives.md)
