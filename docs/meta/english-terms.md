# English grammar terms (keep-list)

Editor inventory of **locked English names** for constructions, slots, and closed moods in the learner grammar. **Not** learner text. Grammar pages must **not** link here.

This page is the standardized metalanguage after [english-terms-plan.md](english-terms-plan.md). It is **not** a recommendation to rename. Locked names live in that plan; this page restates them for grep and drafting.

**Source of names:** the plan’s Locked names / Combine / Split tables, mapped onto current `docs/grammar/` homes.

## How to read

| Column | Meaning |
|--------|---------|
| **Job** | What the term names |
| **Where** | Primary teaching page |
| **Near** | A *different* remaining job of a similar English string (omit when none) |

Ordinary gloss words and translation-practice item English are out. Agalan forms stay in backticks as exponents, not glossary keys.

## Closed labels (SMALLCAPS and series names)

These stay as inventory tags. The plan does not rename them.

### Mood tags

| Label | Job | Where |
|-------|-----|--------|
| **ABIL** | Hostless *can* / *can’t* fallback **`egera`** | [ability.md](../grammar/ability.md#ability-fallback) |
| **ACT** | Emotion-compose arousal (HIGH / MED / LOW) | [special-vocabulary.md](../grammar/special-vocabulary.md#emotion-compose) |
| **BECAUSE** | Clause-pole **`urugu`** (*because*) | [causation.md](../grammar/causation.md#if-vs-iff) |
| **CAUSE** | Mechanism-framing mood **`egega`** | [causation.md](../grammar/causation.md#cause) |
| **CIRCUM** | Emotion locus: charge on the situation | [special-vocabulary.md](../grammar/special-vocabulary.md#emotion-compose) |
| **COMMENT** | First-person commentary mood **`odoho`** | [commentary.md](../grammar/commentary.md#comment) |
| **COMMON** | Universality: usual, exceptions expected | [special-vocabulary.md](../grammar/special-vocabulary.md#universality) |
| **DECISION** | Pick-firmness mood **`egege`** | [plan-decision.md](../grammar/plan-decision.md#decision) |
| **EXTERNAL** | Emotion locus: charge at other people | [special-vocabulary.md](../grammar/special-vocabulary.md#emotion-compose) |
| **FELT** | Evidential: gut / body knowing | [commentary.md](../grammar/commentary.md#evidentiality) |
| **FORMAL** | Universality: definition / math / proof | [special-vocabulary.md](../grammar/special-vocabulary.md#universality) |
| **HIGH** / **MED** / **LOW** | Emotion ACT roots | [special-vocabulary.md](../grammar/special-vocabulary.md#emotion-compose) |
| **IF** | Clause-pole **`adoro`** (one-way *if*) | [causation.md](../grammar/causation.md#if-vs-iff) |
| **IFF** | Clause-pole **`ezaze`** | [causation.md](../grammar/causation.md#if-vs-iff) |
| **INFERRED** | Evidential: reasoned from clues | [commentary.md](../grammar/commentary.md#evidentiality) |
| **INTERNAL** | Emotion locus: charge held inside | [special-vocabulary.md](../grammar/special-vocabulary.md#emotion-compose) |
| **LOCUS** | Emotion-compose where the charge sits | [special-vocabulary.md](../grammar/special-vocabulary.md#emotion-compose) |
| **NATURAL** | Universality: natural necessity | [special-vocabulary.md](../grammar/special-vocabulary.md#universality) |
| **NOTIONAL** | As-if / pretense mood **`ahade`** | [commentary.md](../grammar/commentary.md#notional) |
| **PATTERN** | Evidential: from regularity | [commentary.md](../grammar/commentary.md#evidentiality) |
| **PLAN** | Intention-framing mood **`owora`** | [plan-decision.md](../grammar/plan-decision.md#plan-predict) |
| **PREDICT** | Forecast-framing mood **`elezo`** | [plan-decision.md](../grammar/plan-decision.md#plan-predict) |
| **RECORDED** | Evidential: documented / playback | [commentary.md](../grammar/commentary.md#evidentiality) |
| **RULE** | Universality: holds inside a named frame | [special-vocabulary.md](../grammar/special-vocabulary.md#universality) |
| **SAME** | Identity copula **`onunu`** | [predication.md](../grammar/predication.md#identity) |
| **STORY** | Evidential: narrative / lore | [commentary.md](../grammar/commentary.md#evidentiality) |
| **TOLD** | Evidential: hearsay | [commentary.md](../grammar/commentary.md#evidentiality) |
| **UNCOUNTERED** | Universality: no counterexample comes to mind | [special-vocabulary.md](../grammar/special-vocabulary.md#universality) |
| **WITNESSED** | Evidential: firsthand | [commentary.md](../grammar/commentary.md#evidentiality) |

**Near:** *mood* (closed `/h/` only). Free-number **imaginary** and derivation **quasi** are not **NOTIONAL**.

### Join-vowel English names

Taught as the **name** column on set / rank joins ([coordination.md](../grammar/coordination.md)):

| Name | Vowel | Job |
|------|-------|-----|
| additive | **a** | *and* (inventory) |
| choice | **o** | exclusive *or* |
| cochoice | **ao** | inclusive *and/or* |
| negation | **u** | *not* / *none of* / standalone *no* |
| counteradditive | **ua** | *everything but* |
| counterchoice | **uo** | *anything but* |
| rank | **e** | earlier outranks later |
| corank | **ae** | equal rank / tie |
| choicerank | **oe** | exclusive ranked menu |
| counterrank | **ue** | rank reversal |

### Span TYPE / EDGE letters

From [spans.md](../grammar/spans.md#shape): **TYPE** **a** cite / **e** aside / **o** mention / **u** opaque; **EDGE** **a** multi / **e** clause-scoped / **o** atomic / **u** empty (exact empty `…axul` / resume `…axur`).

### Number marker identities

From [numbers.md](../grammar/numbers.md#marker-vowel-referential-identity): **scalar** (`+` / `-`), **ordinal** / rank from the start (`#`), **end-relative ordinal** (`#-`), **digit-string** / label (`_`).

---

## Clash leftovers

Same English still names more than one job on purpose. Do not globally replace these.

| String | Keep for | Other job |
|--------|----------|-----------|
| **bare** | no extra piece: compass with no viewpoint; **bare turn**; **bare OoM**; bare host / `hal` | not join arity (that is **standalone**) |
| **empty** | span EDGE **u**; **empty-allowed** (`…om`) | not arity 0 |
| **overlay** | sense-form PoS reading | number as verb / adverb / interjection / discourse; metaphorical **-m** |
| **span** | typed cite / aside / mention / opaque fences | numeric **range**; clock/date **range** |
| **topic** | value need with no `x` | **as-for** (`ahaza`) |
| **host** | ability / values / numeric-derivation base of `x` | measure **unit**; classified noun |
| **notional** | mood **NOTIONAL** | number **imaginary**; derivation **quasi** |
| **mood** | closed psychological `/h/` | ordinary manner `/h/` = **adverb** |
| **open** / **closed** | list / restrictor / speech-act **-m** / **-l** | span **span open**; SAME open **-m** |
| **force** | values **prescription force** | not speech act |
| **stance** | always *value stance* / *ability stance* / **polar stance** | |
| **scale** | comparative **SHARED scale** | number **order of magnitude** / **ambient magnitude** |
| **resume** | content / span / number **-r** | join / restrictor **-r** = **unspecified member** |
| **-n** | content **named** | phrase **named list**; clause **sequence**; number **conventional** |
| **universal** / **every** | join *every K* / **generic** | mood **universality** |

Intentional reuse: **-l / -m** *closed / open* (and *firm / soft* on speech act); **changeability** on `xu` / DECISION / *can’t*; **vowel series**.

---

## Dropped keys (do not revive)

*clause force*, *force word*, *question force*, *interrogative force*, *focus* (arity), *bare* (arity), *unary*, *nullary*, *empty* (arity 0), *argument noun*, *participant compound*, *zero-copula*, *property pattern*, *kind ascription*, *content question*, *gap*, *multi-gap*, *polar question*, *yes/no polarity*, *reaction word*, *jump*, *extend*, *utterance framing*, *discourse marker* (as `/x/` name), *call* (as left-edge slot), *letter pronoun*, *full-root pronoun*, *anaphor* (default), *handle coinage*, *next-clause pronoun*, *subordination*, *adjunct-scope island*, *join scope island*, *associate set*, *collective doing/ascription* (as keys), *when-frame*, *applicability*, *circumstance*, *discourse glue*, *word ending*, *first letter*, *PoS prefix*, *coordination* (learner word), *shared modifier*, *mechanism* (umbrella), *open inclusive*, *warrant*, *exceptionlessness*, *thought balloon*, *commentary*, *savoring* (term), *measure host*, *unit morph*, *stock measure host*, *zero-digit-group*, *compact foreign content word*, *speech-role*, *job map*, *ideation*, *number compound*, *numeric morph*, *x-less kind*, *lexical kind*, *compound joiner*, *ambient scale*, *soft identity*, *soft -n*, *doorway* (except one mnemonic), *packaging* (glossary key).

Mnemonics once: *doorway*, *jump*, *thought balloon*, *savoring*. *How you know* stays purpose language on `why-agelan.md`; the grammar term is **evidentiality**.

---

## A–Z (locked names)

### Ability / incapability

**Job:** Hosted *can* / *can’t* (`xa`/`xe`/`xo`/`xu`) and hostless **ABIL**.  
**Where:** [ability.md](../grammar/ability.md)

### Act word

**Job:** Written `/j/` word (`jal` / `jol` / `jel` / `jul` and soft **-m**).  
**Where:** [core.md](../grammar/core.md#speech-act)  
**Near:** *speech act* (the setting); polar *stance* particles are not act words

### Address set

**Job:** Listener special plus **-sh**: current addressees (no speaker).  
**Where:** [plurality.md](../grammar/plurality.md#person-role-sh)

### Adjective extra (`/w/`)

**Job:** Detail on the previous adjective, not the whole clause.  
**Where:** [core.md](../grammar/core.md)  
**Near:** *restrictor*, *values* (default `/w/` on needs)

### Adverb

**Job:** Ordinary manner `/h/`.  
**Where:** [core.md](../grammar/core.md#adverbs-h)  
**Near:** *mood* (closed psychological `/h/` only)

### Ambient magnitude

**Job:** Casual claim that omitted exponent inherits a discourse OoM; **`Ne0`** asserts OoM 0.  
**Where:** [numbers.md](../grammar/numbers.md#ambient-magnitude)

### Antecedent

**Job:** The word a **-r** form points back to.  
**Where:** [pronouns.md](../grammar/pronouns.md)

### Arity (list / single-item / standalone)

**Job:** How many items sit before a join: **list** (2+), **single-item** (1), **standalone** (0).  
**Where:** [coordination.md](../grammar/coordination.md#single-item-phrase)

### As-for

**Job:** Complex `/h/` + `/b/` (`ahaza`) *as for X*.  
**Where:** [core.md](../grammar/core.md#as-for)  
**Near:** values **topic**

### Aside

**Job:** Span TYPE **e** (`h(…)`).  
**Where:** [spans.md](../grammar/spans.md#asides)

### Associative

**Job:** **-sh** = named **anchor plus associates**.  
**Where:** [plurality.md](../grammar/plurality.md#associative)

### Atomic (span EDGE)

**Job:** Span open that does not nest-push (EDGE **o**).  
**Where:** [spans.md](../grammar/spans.md#edge)

### Bare OoM

**Job:** Digitless exponent naming a magnitude band (`g+e0`, `g+e3`).  
**Where:** [numbers.md](../grammar/numbers.md#bare-oom-bands)

### Binder

**Job:** Inside a scope island: scope-taking `/h/` and/or a join.  
**Where:** [spans.md](../grammar/spans.md#scope-islands)

### Body (utterance)

**Job:** Clause content after the left-edge `/j/` cluster.  
**Where:** [core.md](../grammar/core.md#left-edge-order-and-sentence-boundaries)

### Bound / endorse / invite

**Job:** Prescription-force endings on value **`xo`**.  
**Where:** [values.md](../grammar/values.md#value-force)

### Changeability

**Job:** Endings on unmet **`xu`**, **DECISION**, and ability *can’t*.  
**Where:** [values.md](../grammar/values.md#value-changeability), [plan-decision.md](../grammar/plan-decision.md#decision)

### Citation / prefix-less citation

**Job:** Root + ending with no role letter, outside a sentence.  
**Where:** [core.md](../grammar/core.md#citation-forms)

### Classification

**Job:** Kind / role as predicative `/ɡ/` (no *to-be* verb).  
**Where:** [predication.md](../grammar/predication.md#classification)  
**Near:** *identity* (**SAME**); *equative*

### Clause pole / NP pole

**Job:** Condition vs outcome as NPs vs full sentences after **`adoro`**. Keep **clause pole** on causation.  
**Where:** [causation.md](../grammar/causation.md)

### Clusivity

**Job:** Who counts as *we* / *you* when names are unavailable.  
**Where:** [pronouns.md](../grammar/pronouns.md#clusivity)

### Collective

**Job:** **-sh** on `/v/` (one shared act) vs on `/ɡ/` (property of the group as a unit). Distinguish in the sentence.  
**Where:** [plurality.md](../grammar/plurality.md#verbs-v), [plurality.md](../grammar/plurality.md#adjectives-g)

### Command / request / prohibition

**Job:** Speech act **`jel` / `jem` / `jul` / `jum`**.  
**Where:** [core.md](../grammar/core.md#speech-act)

### Comparative / superlative / equative

**Job:** Rank join + SHARED **scale**; single-item = superlative; **`ae`** = equative.  
**Where:** [comparatives.md](../grammar/comparatives.md)

### Complex adjective / complex adverb

**Job:** `/ɡ/` or `/h/` plus immediately following `/b/`.  
**Where:** [core.md](../grammar/core.md#extra-nouns)

### Confirming a negative

**Job:** Polar patterns that confirm a denied body.  
**Where:** [questions.md](../grammar/questions.md#confirming-a-negative)

### Contact / contact channel

**Job:** Met-value **`xa`** endings (physical / mental / spiritual).  
**Where:** [values.md](../grammar/values.md#value-contact)

### Continue (`/x/`)

**Job:** Same-speech-act forward motion.  
**Where:** [core.md](../grammar/core.md#continue-x)  
**Near:** *sentence linker* (therefore / however subclass)

### Conventional (number **-n**)

**Job:** Number ending **-n**.  
**Where:** [numbers.md](../grammar/numbers.md#number-endings)  
**Near:** content **named**; join **named list** / **sequence**

### Cross-role recast

**Job:** Resume with a different PoS letter than the antecedent.  
**Where:** [pronouns.md](../grammar/pronouns.md)

### Dependent clause / **`adoro`**

**Job:** Full sentence after **`adoro`** (last in the host slot).  
**Where:** [core.md](../grammar/core.md#dependent-clauses)

### Digitless

**Job:** Number word with marker and ending but no digit groups.  
**Where:** [numbers.md](../grammar/numbers.md#digitless)

### Digitless exponent / imaginary / zero × exponent

**Job:** Advanced free-number specials (`+e`, `-e-`, `+0e`, …). **Imaginary** = free `-e-`.  
**Where:** [numbers.md](../grammar/numbers.md#digitless-exponents), [numbers.md](../grammar/numbers.md#imaginary)  
**Near:** *quasi* (derivation); **NOTIONAL** (mood)

### Distributive

**Job:** Set **`a`** + singular SHARED = *both/each are ADJ*.  
**Where:** [comparatives.md](../grammar/comparatives.md#distributive-both)

### Domain / generic / *every K*

**Job:** SHARED kind plus invert / standalone joins.  
**Where:** [coordination.md](../grammar/coordination.md#universals-domains-generics)  
**Near:** *universality* (mood)

### Empty-allowed

**Job:** Plain **o** + **-m**: *or none*.  
**Where:** [coordination.md](../grammar/coordination.md#empty-allowed-om)

### Ending / reference suffix

**Job:** Final **-l / -m / -n / -r** (plus optional **-sh**). **Reference suffix** only for the content-word table.  
**Where:** [reference-suffix.md](../grammar/reference-suffix.md)

### Epistemic *because*

**Job:** Reason for the take (COMMENT), not world **BECAUSE**.  
**Where:** [causation.md](../grammar/causation.md#epistemic-because)

### Equative

**Job:** **`ae`** SHARED scale = *as ADJ as*.  
**Where:** [comparatives.md](../grammar/comparatives.md#equatives)

### Evidentiality

**Job:** Closed `/h/` how-you-know roots.  
**Where:** [commentary.md](../grammar/commentary.md#evidentiality)

### Extra noun (`/b/`)

**Job:** Noun bolted onto a complex `/ɡ/` or `/h/`.  
**Where:** [core.md](../grammar/core.md#extra-nouns)

### Factivity

**Job:** Whether **IF** vs **BECAUSE** treats the dependent as asserted.  
**Where:** [causation.md](../grammar/causation.md#factivity)

### Fill-ask / fill-all

**Job:** Under question, join **-r** is a blank; several **-r** = fill all.  
**Where:** [questions.md](../grammar/questions.md#fill-ask-r)

### Firm / soft

**Job:** Speech-act ending **-l** vs **-m**.  
**Where:** [core.md](../grammar/core.md#speech-act)

### Forecast source

**Job:** Evidentiality stacked on **PREDICT**.  
**Where:** [plan-decision.md](../grammar/plan-decision.md#predict-evidentiality)

### Full-root resume / short resume

**Job:** Whole root + **-r** vs prefix through the second vowel.  
**Where:** [pronouns.md](../grammar/pronouns.md)

### Hold

**Job:** COMMENT / NOTIONAL tightness endings.  
**Where:** [commentary.md](../grammar/commentary.md#comment)

### Host

**Job:** Content root an `x`-stance or numeric derivation attaches to.  
**Where:** [ability.md](../grammar/ability.md), [values.md](../grammar/values.md), [numeric-derivation.md](../grammar/numeric-derivation.md)  
**Near:** measure **unit**

### Identity

**Job:** Closed **SAME** + `/b/`.  
**Where:** [predication.md](../grammar/predication.md#identity)

### Invert

**Job:** Join stacks **`ua` / `uo` / `ue`**.  
**Where:** [coordination.md](../grammar/coordination.md#invert-u-stacks)

### Join / conjunct

**Job:** Right-close list closer; **conjunct** = listed item.  
**Where:** [coordination.md](../grammar/coordination.md)

### Join-act verb / join-relation

**Job:** Content `/v/` or `/ɡ/` `/h/` + join vowel + **-n**.  
**Where:** [join-extras.md](../grammar/join-extras.md)

### Judgment benchmark

**Job:** Advanced *worse than…* bars.  
**Where:** [comparatives.md](../grammar/comparatives.md#judgment-benchmarks)

### Left-bound adjective

**Job:** `/ɡ/` with second letter **l**: adjective before the next noun.  
**Where:** [core.md](../grammar/core.md#left-bound-adjectives)

### Left edge

**Job:** Vocative → polar stance → act word, then body.  
**Where:** [core.md](../grammar/core.md#left-edge-order-and-sentence-boundaries)

### Literal / metaphorical / named / resume

**Job:** Content endings **-l / -m / -n / -r**.  
**Where:** [reference-suffix.md](../grammar/reference-suffix.md)

### Loan / opaque span

**Job:** `PoS<…>ENDING` vs opaque fence with no ending after `>`.  
**Where:** [spans.md](../grammar/spans.md#loans)

### Map resolution

**Job:** PLAN endings: sketch / itinerary / fork.  
**Where:** [plan-decision.md](../grammar/plan-decision.md#plan-map-resolution)

### Measure phrase / unit

**Job:** Amount + lexicon unit noun; titled **`ROOTx+1`**.  
**Where:** [numbers-applied.md](../grammar/numbers-applied.md#measure-phrases)

### Met / unmet / motive / prescription / topic (values)

**Job:** Value stances **`xa` / `xu` / `xe` / `xo`** / topic (no `x`).  
**Where:** [values.md](../grammar/values.md)  
**Near:** **as-for**

### Named handle

**Job:** Short **-n** label for a long title.  
**Where:** [reference-suffix.md](../grammar/reference-suffix.md#named-handles)

### Named list

**Job:** Phrase join **-n**.  
**Where:** [coordination.md](../grammar/coordination.md#named-list)

### Need inventory

**Job:** Six closed psychological needs under `/h/` `/w/`.  
**Where:** [values.md](../grammar/values.md#need-inventory)

### Number as verb / adverb / interjection / discourse

**Job:** Number word under `/v/` `/h/` `/j/` `/x/`.  
**Where:** [numbers.md](../grammar/numbers.md#number-as-roles)

### Numbered alternatives

**Job:** Number problem / solution / goal candidates with free ordinals.  
**Where:** [special-vocabulary.md](../grammar/special-vocabulary.md#numbered-alternatives)

### Numeric derivation / quasi

**Job:** `ROOT x NUM`; **quasi** = `ROOTx-e-`.  
**Where:** [numeric-derivation.md](../grammar/numeric-derivation.md)

### Occasion

**Job:** Listed pieces before a restrictor (when the host applies).  
**Where:** [restrictors.md](../grammar/restrictors.md)

### Offer (question)

**Job:** Single-item **-m** under question (*How about X?*).  
**Where:** [questions.md](../grammar/questions.md#yes-no-single-item-standalone)

### Ordinary compound / lexical compound

**Job:** KIND × FIELD with mid-word **`x`**; closed stem with join letter and no `x`.  
**Where:** [x-compounds.md](../grammar/x-compounds.md)

### Overlay / sense-form

**Job:** Special reading of a published root under a PoS.  
**Where:** [special-vocabulary.md](../grammar/special-vocabulary.md#sense-form)

### Polar stance

**Job:** Closed `/j/` particles **`jael` / `juel` / …**.  
**Where:** [questions.md](../grammar/questions.md#polar-stance)

### Preference standing

**Job:** Motive **`xe`** endings.  
**Where:** [values.md](../grammar/values.md#value-preference)

### Prominence

**Job:** Word-order highlighting (not join arity).  
**Where:** [core.md](../grammar/core.md#as-for)

### Quasi

**Job:** Derivation `ROOTx-e-` (and quasi-N).  
**Where:** [numeric-derivation.md](../grammar/numeric-derivation.md#quasi)

### Range / clock/date range

**Job:** Numeric from–to; clock/date from–to.  
**Where:** [numbers-applied.md](../grammar/numbers-applied.md#ranges), [numbers-applied.md](../grammar/numbers-applied.md#time)

### Rank join / set join / SHARED

**Job:** Material after the join closer; **SHARED scale** vs **SHARED continuum**.  
**Where:** [coordination.md](../grammar/coordination.md), [comparatives.md](../grammar/comparatives.md)

### Restrictor

**Job:** Join-shaped `/h/` `/w/` *when the host applies*.  
**Where:** [restrictors.md](../grammar/restrictors.md)

### Resume

**Job:** Content / span / number **-r** pointing back.  
**Where:** [pronouns.md](../grammar/pronouns.md), [spans.md](../grammar/spans.md), [numbers.md](../grammar/numbers.md#number-endings)

### Reviser

**Job:** Prefix-less *including / rather / instead / except* (in-clause vs discourse by placement).  
**Where:** [revisers.md](../grammar/revisers.md)

### Role compound / agent / patient / reltum

**Job:** `a/u/o x ROOT`.  
**Where:** [roles.md](../grammar/roles.md#role-compounds)

### Role letter

**Job:** Word-initial job letter. Beginner heading may still say *parts of speech*.  
**Where:** [core.md](../grammar/core.md#part-of-speech-prefixes)

### Scope island

**Job:** `^ … ^` with binder inside.  
**Where:** [spans.md](../grammar/spans.md#scope-islands), [coordination.md](../grammar/coordination.md#scope-islands-join)

### Sentence linker

**Job:** `/x/` *therefore / however / meanwhile*.  
**Where:** [core.md](../grammar/core.md#sentence-linkers)

### Sequence

**Job:** Clause join **-n** (`xan` *and then*).  
**Where:** [coordination.md](../grammar/coordination.md#sequence)

### SHARED scale / SHARED continuum

**Job:** After-join `/ɡ/`: comparatives vs ranges.  
**Where:** [comparatives.md](../grammar/comparatives.md), [numbers-applied.md](../grammar/numbers-applied.md#ranges)

### Span / span open

**Job:** Typed fences; spoken opening word.  
**Where:** [spans.md](../grammar/spans.md)

### Special pronoun

**Job:** **`ugobo` / `edone` / `aha` / `enenu` / `adoro`**.  
**Where:** [pronouns.md](../grammar/pronouns.md#special-pronouns)

### Speech act

**Job:** Utterance setting: statement / question / command / prohibition.  
**Where:** [core.md](../grammar/core.md#speech-act)  
**Near:** *prescription force*; polar *stance*

### Sufficient / necessary / unique path

**Job:** Causation jobs (not a fourth *mechanism* umbrella).  
**Where:** [causation.md](../grammar/causation.md)

### Threshold

**Job:** Single-item rank with a number = bound on a line.  
**Where:** [numbers-applied.md](../grammar/numbers-applied.md)

### Turn (`/j/`)

**Job:** New speech move.  
**Where:** [core.md](../grammar/core.md#turn-j)

### Under question

**Job:** Join readings when the speech act is question.  
**Where:** [questions.md](../grammar/questions.md#under-question)

### Unspecified member

**Job:** Join / restrictor **-r** (*something* / *sometime*); fill-ask under question.  
**Where:** [coordination.md](../grammar/coordination.md#unspecified-member-r-phrase)

### Universality

**Job:** Mood how-exceptionless (COMMON … RULE).  
**Where:** [special-vocabulary.md](../grammar/special-vocabulary.md#universality)

### Values

**Job:** Need + optional stance on `/h/` `/w/`.  
**Where:** [values.md](../grammar/values.md)

### Viewpoint laterals

**Job:** DIR × ANCHOR; whose facing is north.  
**Where:** [roles.md](../grammar/roles.md#viewpoint-laterals)

### Vocative

**Job:** Left-edge `/j/` addressing.  
**Where:** [core.md](../grammar/core.md#turn-j)

### Vowel series

**Job:** **`a`** add / **`o`** one / **`e`** order / **`u`** undo; prefix picks the table.  
**Where:** [vowel-series.md](../grammar/vowel-series.md)

### Weak-pause left cue

**Job:** Prefer an audible left `/j/` rather than implied **`jal`**.  
**Where:** [core.md](../grammar/core.md#weak-pause-left-cues)

### Yes/no

**Job:** Question type with no join **-r**.  
**Where:** [questions.md](../grammar/questions.md#question)  
**Near:** **polar stance**

---

## Out of scope

- English in **translation-practice** items
- House-cast person names
- `docs/grammar/public/tts/`
- Parser / TypeScript identifiers
- `docs/proposals/`
