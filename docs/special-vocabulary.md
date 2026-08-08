# Special vocabulary
<a id="special-vocabulary"></a>

This page is the source of truth for **special morphology and closed roots** that are **not** [values](values.md) (needs) and **not** [restrictors](restrictors.md) (applicability joins). They reuse mid-word **`x`** where useful ([ability](#ability): host + stance vowel; [role compounds](#role-compounds): ROLE vowel + event/relation root; [numeric derivation](#numeric-derivation): host + number stem), but keep their own inventories; some entries are closed mood roots with **no** `x`-addition (plan / predict, [evidentiality](#evidentiality) including [memory / record](#memory-record) past framing, [universality](#universality), emotion activation / locus, **comment** / mindfulness noting); **join-act verbs** and **join-relations** reuse join-vowel spellings under `/v/` `/ɡ/` `/h/`…**-n**. Parser families for mid-word **`x`**: **[x-compounds.md](x-compounds.md)**.

Ordinary `/h/` / `/w/` content still defaults to values unless the form is already in a clearer closed subcategory (restrictors, special vocabulary here, evidentiality/mood, degree, adjuncts, numbers) — see [values.md](values.md#default-reading-of-h-and-w).

**Not here:** *worse than Average|…* benchmarks are NP comparees on comparative fences — [comparatives.md § Judgment benchmarks](comparatives.md#judgment-benchmarks) (lexicon **-n** comparees; **Everyone** = bare **`zuan`**; normative **Mine** = **`zumogoxrawon`** under [numeric derivation](#numeric-derivation) below). **Classification** (kind as predicative `/ɡ/`) and closed **`SAME`** **identity** (`goguno` 🪙 + `/b/`) live in **[predication.md](predication.md)** — not a general *to-be* verb and not `x`-compounds. **Causation** / necessary–sufficient reuses joins and these join-relations — **[causation.md](causation.md)** — not a new mood or `x`-compound on this page (optional **`CAUSE`** mood = lexicon **`erage`** ⚙️ *mechanism*; do not reuse for NATURAL). **Numbered alternatives** (ideation *problem1* / *solution2* / *goal3*) is style + lexicon on free ordinals — [numbered alternatives](#numbered-alternatives) below — **not** new morphology.

## Sense-form overlays
<a id="sense-form"></a>

**Sense-form** = published Clarity root + [reference ending](reference-suffix.md) that **is** the closed overlay reading for that PoS — no PoS prefix. Example: **`uhunum`** under `/h/` = evidential *memory / witnessed*; **`huhunul`** = ordinary literal *in a fishing manner* — not the evidential. Mood overlays **generally** use **-m** (figurative published sense); other endings when that is how the overlay is defined (benchmark **-n**, universality **-l**, join-act / join-relation defective **-n**, …). Join-act / join-relation stems are the vowel + **-n** only (`an` / `on` / …); written words are **`pos` + sense-form** (`van` / `gan` / `han`).

Closed overlay inventory: **[lexicon-overlays.csv](../data/lexicon-overlays.csv)** — one row per **`(sense_form, pos)`** with **`definition`** and **`mnemonic`** columns; ordinary content PoS on the same root is **not** listed. Published roots: [lexicon-published.csv](../data/lexicon-published.csv).

## Join-act verbs (`v*n`)
<a id="join-act-verbs"></a>
<a id="verb-join-n"></a>

Closed `/v/` verbs that **perform the join-series act** on an object. Spellings match the join vowel + **-n** (`van`, `von`, …). They are **not** VP soft-packaging joins — soft packaging (including *and then*) lives on clause `/x/`…**-n** only (`xan`, …) — [coordination.md § Soft **-n**](coordination.md#soft-n-clause).

### Pattern

- **One `/d/` object** (singular or group). Group objects use ordinary noun **-sh** (`d-…lsh`); verb **-sh** is only for an event-set referent ([plurality](plurality.md)).
- **Defective**: only the **-n** exponent exists as a content verb. Parallel `-l` / `-m` / `-r` spellings stay VP **joins** (`val` / `vam` / `var`, …). Resume a prior join-act with a letter pronoun or a full paraphrase — not `var` (that is *do something*).
- Vowel = which coordination move you enact; **-n** = that move as a titled/conventional doing ([reference-suffix](reference-suffix.md#proper-name--n) verb sense).

### Inventory

| Form | Gloss | Example |
|------|--------|---------|
| **`van`** | *includes / adds* | `jal z<Sam>n dabebal van` — *Sam includes/adds an apple* |
| **`von`** | *chooses (as the one choice)* | `jal z<Sam>n dadedal von` — *Sam chooses tea (as the one choice)* |
| **`vaon`** | *picks (with potentially more picks coming)* | `jal z<Sam>n d<topping>l vaon` — *Sam picks a topping (more picks may follow)* |
| **`vun`** | *denies / refuses* | `jal z<Sam>n dulel vun` — *Sam denies/refuses the lie* |
| **`vuan`** | *excludes* | `jal z<Sam>n d<nut>l vuan` — *Sam excludes nuts* |
| **`vuon`** | *bars (anything but)* | `jal z<Sam>n dogevel vuon` — *Sam bars coffee (anything else is fine)* |
| **`ven`** | *prioritizes* | `jal z<Sam>n dugujul ven` — *Sam prioritizes the bug* |
| **`vaen`** | *equates / ties* | `jal z<Sam>n d<candidate>lsh vaen` — *Sam equates the candidates* |
| **`voen`** | *tries* | `jal z<Sam>n d<fix>l voen` — *Sam tries the fix* |
| **`vuen`** | *deprioritizes* | `jal z<Sam>n d<dessert>l vuen` — *Sam deprioritizes dessert* |

### Contrasts

| | Clarity | Gloss |
|--|---------|--------|
| refuse vs exclude | `jal zumogon demadel vun` vs `jal zumogon demadel vuan` | *I refuse meat* vs *I exclude meat* |
| exclude vs anything but | `jal zumogon d<nut>l vuan` vs `jal zumogon d<nut>l vuon` | *I exclude nuts* vs *I bar nuts (anything else is fine)* |
| one choice vs open picks | `jal zumogon d<path>l von` vs `jal zumogon d<path>l vaon` | *I choose that path (only)* vs *I pick that path (more may come)* |
| prioritize vs try | `jal zumogon d<fix>l ven` vs `jal zumogon d<fix>l voen` | *I prioritize the fix* vs *I try the fix* |
| *and then* (clauses) | `SENT₁ SENT₂ xan` | *SENT₁ and then SENT₂* — **not** `van` |

### Constraints

- Not VP joins and not soft packaging.
- Not revisers (`an` / `on` / …) and not phrase named-list **-n** (those stay on `/z/` `/d/` `/b/` `/w/`).
- Do **not** invent `-l` / `-m` content readings for these roots under `/v/` — those spellings are joins.

## Join-relations (`g*n` / `h*n`)
<a id="join-relations"></a>
<a id="join-relation-gh"></a>

Closed **complex** `/ɡ/` adjectives and `/h/` adverbs that **frame a host via the join-series move** toward one `/b/` argument. Same vowel map as [join-act verbs](#join-act-verbs). They are **not** phrase named-list joins and **not** [restrictors](restrictors.md) — stock AP bundles use [mention](spans.md) spans instead of old `A B gan` lists.

### Pattern

- **One `/b/` argument** (singular or group). Group arguments use ordinary noun **-sh** (`b-…lsh`). Multi-member or empty domains: put a [phrase join](coordination.md) **inside** the `/b/` phrase (`gan bal b<nut>l b<seed>l`), or use a [nullary / bare](coordination.md#focus-phrase) `/b/` join as the sole argument (`gan bar` = *including something*; `guan bal` = *excluding nothing* / stripped frame).
- **Defective**: only the **-n** exponent is content. Parallel `-l` / `-m` / `-r` under `/ɡ/` stay AP **joins**; under `/h/` they stay [restrictors](restrictors.md) (defined core) or reserved.
- Contiguous unit: `g*n b-…` on a noun; `h*n b-…` floats as one complex adverb.
- Vowel = which coordination move; **-n** = that move as a titled/conventional relation ([reference-suffix](reference-suffix.md#proper-name--n)).

### Inventory

| Form | `/ɡ/` (*N … b-X*) | `/h/` (*event … b-X*) | Example |
|------|-------------------|------------------------|---------|
| **`gan` / `han`** | *including / with* | *with / including* | `z<cake>l gan b<nut>l`; `jal z<Sam>n han b<Lea>n v<go>l` |
| **`gon` / `hon`** | *exclusive for* (X is N’s sole pick) | *exclusively for / as the one* | `z<menu>l gon badedal`; `jal … hon badedal vebonem` |
| **`gaon` / `haon`** | *open to* (X admitted; more may follow) | *among options* | `zubazul gaon b<topping>l`; `jal … haon b<topping>l vebonem` |
| **`gun` / `hun`** | *against / anti-* (refuses X) | *refusing* | `z<policy>l gun bulel`; `jal … hun bemadel v<eat>l` |
| **`guan` / `huan`** | *without / excluding* | *excluding* | `z<cake>l guan b<nut>l`; `jal … huan b<nut>l v<bake>l` |
| **`guon` / `huon`** | *open to anything but* (X barred; rest free) | *barring / anything but* | `z<menu>l guon b<nut>l`; `jal … huon b<nut>l vebonem` |
| **`gen` / `hen`** | *prioritizing / headed by* | *prioritizing* | `z<backlog>l gen bugujul`; `jal … hen bugujul v<fix>l` |
| **`gaen` / `haen`** | *on a par with* | *equating / tying* | `z<path>l gaen b<alt>l`; `jal … haen b<candidate>lsh v<rate>l` |
| **`goen` / `hoen`** | *for trying / trial of* | *trying* | `z<path>l goen b<fix>l`; `jal … hoen b<fix>l v<deploy>l` |
| **`guen` / `huen`** | *deprioritizing / trailing* | *deprioritizing* | `z<menu>l guen b<dessert>l`; `jal … huen b<dessert>l v<eat>l` |

### Contrasts

| | Clarity | Gloss |
|--|---------|--------|
| refuse vs exclude | `bemadel gun` vs `bemadel guan` | *anti-meat* vs *without meat* |
| exclude vs anything but | `b<nut>l guan` vs `b<nut>l guon` | *without nuts* vs *open to anything but nuts* |
| sole vs open pick | `b<path>l gon` vs `b<path>l gaon` | *path-only* vs *path among options* |
| prioritize vs try | `b<fix>l gen` vs `b<fix>l goen` | *fix-first* vs *try-the-fix* |
| relation vs reviser | `z<team>l gan b<Sam>n` vs `z<team>l al z<Sam>n` | PP-like *team including Sam* vs slot-repair *team, including Sam* |
| stock AP label | `g{primary colors}` / mention span | **not** `gan gedejel gulebul` (that spelling is content *including*, needs `/b/`) |
| open vs without (causal) | `haon bazem` vs `huan bogulol` | sufficient hit vs necessary-style exclusion — [causation](causation.md) |

### Constraints

- Not AP joins, not restrictors, not named-list **-n** (named lists remain on `/z/` `/d/` `/b/` `/w/` only).
- Unary `/b/` only — restore list/empty arity on the **argument**, not by stacking bare `g*n` / `h*n` as fences.
- Do **not** invent `-l` / `-m` content readings for these roots under `/ɡ/` / `/h/`.

## Comment (mindfulness noting)
<a id="comment"></a>
<a id="mindfulness-noting"></a>

First-person **cognitive** attitude verbs often mark **mental commentary** — the mind storying experience rather than contacting it. Clarity does **not** keep *think* / *assume* / *imagine* / *wonder* as separate moods. One closed mood root covers that class: **COMMENT**.

**Affect is not COMMENT.** *Fear* / *worry* / *dread* / *regret* / hope-as-feeling go to [emotion compose](#emotion-compose) (value + ACT + LOCUS) — do **not** stack COMMENT on those clauses. Hope-as-intention uses motive (`xe`) and/or [**PLAN**](#plan-predict), still without COMMENT. *Believe* (world-claim + warrant) waits on **evidentiality** — not this root.

### Mood sense

| Concept | Gloss | Lexicon root |
|---------|--------|--------------|
| **COMMENT** | Mental commentary / rumination-like overlay — mind labeling or storying experience instead of bare contact | **`uho`** 💭 *thought* → *commentary* |

**Conceptual metaphor:** a **thought balloon** floats a take over the scene (voiceover / caption on experience). Bare contact = watching without narration. Ordinary content still available (`zuhol` *a thought*; `vuhol` *to think* as deliberate event). The special reading is the floating mood use, especially `/h/`.

Not evidentiality (*how I know*), not [contact channel](values.md#value-contact) on met values, not [emotion compose](#emotion-compose), and not perception-as-event (*she hears the door* — ordinary lexicon `/v/` if needed).

Optional `/w/` only when COMMENT frames a preceding `/ɡ/` (rare). Prefer floating `/h/`.

**Not `x`-compounds:** COMMENT is a **root choice**, not `xa`/`xu` polarity and not endings on attitude hosts. Do **not** compound COMMENT onto the content verb the way ability does.

### When it fires

Use COMMENT when the clause is doing **first-person cognitive commentary** — *I think*, *I'm assuming*, *I imagine*, *I wonder*, *I suppose*, rumination / overthinking, …. Third-person *thinks* / other-minds claims stay **evidentiality** (and ordinary content), not COMMENT.

Content verbs stay ordinary. COMMENT **frames** the clause; it does not replace the predicate with a sense verb.

### Cognitive attitudes vs affect

English attitude verbs smuggle COMMENT **or** affect. Split them:

| English bundle | Prefer |
|----------------|--------|
| *think / assume / suppose / imagine …* | **COMMENT** (`huhom`); add evidentiality only if asserting a world-claim |
| *wonder …* | **COMMENT** + soft question (**jom**) / ask — not a wonder-mood |
| *fear / worry / dread / regret …* | [emotion compose](#emotion-compose): unmet [value](values.md) (`xu`) + **ACT** + **LOCUS** — **no** COMMENT |
| *hope / wish …* (feeling) | emotion compose (value + ACT + LOCUS) — **no** COMMENT |
| *hope / wish …* (intention) | motive (`xe`) and/or [**PLAN**](#plan-predict) / soft force — **no** COMMENT; not a hope-mood |
| *believe …* | [evidentiality](#evidentiality) (`huhunum`, `herarem`, …) — **not** COMMENT |

| Clarity | Reading |
|---------|---------|
| `… huhom …` | *I think …* — commentary overlay |
| `… huhom … jom …` | *I wonder …* — commentary + soft ask |
| `z<meeting>l wodoloxul hogenal hagenal` | *I fear the meeting* — unmet competence; flood; room awash — **no** COMMENT |
| `… howarom …` | *I hope to …* (intention) — soft plan; **no** COMMENT |

### Do not overload other tables

| Dimension | Stays | COMMENT is *not* |
|-----------|--------|------------------|
| Need met / unmet / motive / ought | [values](values.md) | a seventh need or attitude-value series |
| Contact channel | `xa` endings (physical / mental / social / spiritual) | the COMMENT root |
| Emotion ACT / LOCUS | [emotion compose](#emotion-compose) | a co-stack on fear/worry/regret (affect uses compose alone) |
| Plan / predict | [plan / predict](#plan-predict) | *hope* / *expect* as future moods |
| Memory / record | [evidentiality](#evidentiality) **WITNESSED** / **RECORDED** | generic *past* / *I remember* without source fork |
| Evidentiality | [evidentiality](#evidentiality) | *believe* / warrant / how you know |
| Perception events | ordinary `/v/` lexicon | COMMENT `/h/` (*hearing* as commentary ≠ *hear the door*) |
| Clause force | `/j/` (`jal`, `jam`, …) | a noting speech-act force |

**Raw contact:** sensation without judgment/explanation may stay unlabeled — see [emotion compose](#emotion-compose) raw feeling. Do **not** reach for COMMENT just because the content is affective.

### Out of scope (for now)

- Whether sense-channel noting (looking / hearing / feeling / …) returns as practice color on **`uho`** or stays English-only pedagogy.
- Whether a dedicated bare `/j/` interjection reuses the same root.
- Forced COMMENT on every first-person clause (only cognitive commentary environments).

### Constraints

- **COMMENT** is one mood root: **`uho`** (*commentary*).
- Prefer floating `/h/`; do not use mid-word **`x` + {a\|e\|o\|u}** for COMMENT.
- Do **not** invent separate moods for *think* / *assume* / *imagine* / *wonder*.
- Do **not** stack COMMENT on [emotion compose](#emotion-compose) clauses (*fear* / *worry* / *regret* / hope-as-feeling).
- Do **not** reuse [value contact-channel](values.md#value-contact) endings as COMMENT.
- Do **not** treat COMMENT as evidentiality (*believe* / how you know).
- **ACT** / **LOCUS** / **PLAN** / **PREDICT** / [evidentiality](#evidentiality) / [universality](#universality) / values remain separate `/h/` (or `/w/`) stacks when needed.
- Plural **-sh** stays unused on `/h/` `/w/` ([plurality](plurality.md)).

## Emotion compose
<a id="emotion-compose"></a>

Opaque emotion words (*anxious*, *resentful*, *proud*, …) smuggle **activation**, **locus**, **need**, and **met/unmet** into one label. When that word is doing **judgment or explanation** work, Clarity **drops the emotion label** and **composes** from pieces — it does **not** invent a parallel emotion `x`-system.

| Piece | Clarity |
|-------|---------|
| Situation / judged host | ordinary NP / clause content |
| Need + met / unmet (+ changeability) | ordinary [value](values.md) word on that host (`wodoloxul`, `wodoloxam`, …) |
| Activation (arousal) | closed mood roots **HIGH** / **MED** / **LOW** under `/h/` (optional `/w/` on a preceding `/ɡ/`) — water **tide** metaphors below |
| Locus (where the charge is attributed) | closed mood roots **INTERNAL** / **EXTERNAL** / **CIRCUMSTANTIAL** under `/h/` (same `/w/` option) — water **vessel** metaphors below |

**Conceptual metaphor (one fluid story):** affect is **water**. **ACT** = how much / how fast it moves (**tide** dynamics). **LOCUS** = where that water is held or directed (**vessel** / transfer / ambient field). Same substance on both axes — stack ACT + LOCUS; do not invent separate physics per cell.

### Activation roots (ACT)

| Slot | Lexicon root | Metaphor |
|------|--------------|----------|
| **HIGH** | **`ogena`** 🌊 *ocean-wave* → *flood* | high arousal — water in flood / surge |
| **MED** | **`oju`** 🪼 *jellyfish* → *flow* | mid arousal — drifts with the current |
| **LOW** | **`ozono`** 🌨️ *snow* → *stillness* | low arousal — calm / slack water |

### Locus roots (LOCUS)

| Slot | Lexicon root | Metaphor |
|------|--------------|----------|
| **INTERNAL** | **`abobo`** 🍼 *baby-bottle* → *bottle* | charge held inside the speaker (in-vessel) |
| **EXTERNAL** | **`oburo`** 🫗 *pour* → *pour* | charge directed at / attributed to other people |
| **CIRCUM** | **`agena`** 🕯️ *candle* → *awash* | charge on the situation / ambient field — not owned by a person |

**Ordinary content still available:** these roots remain normal lexicon words under other PoS (`zogenal` *an ocean wave*; `voburol` *to pour*; …). The special reading is the floating mood use, especially `/h/`.

**EXTERNAL is one root** (`oburo` = other-directed transfer). Teaching idioms **scale the transfer with ACT** (composition, not three EXTERNAL roots):

| ACT × EXTERNAL | Idiom | Reading |
|----------------|-------|---------|
| **`ogena`** + **`oburo`** | *poured / surged onto them* | high other-directed charge |
| **`oju`** + **`oburo`** | *flowing toward them* | mid other-directed charge |
| **`ozono`** + **`oburo`** | *pooling at them* | low other-directed charge — settled water at their locus |

Parallel INTERNAL / CIRCUM cues: *flood bottled* / *flow held* / *still in the vessel*; *room awash* / *undercurrent in the air* / *slack shared water*. Keep CIRCUM as **shared / ambient field** (candle-light filling the room), not a second vessel.

**Recipe (judgment / explanation):** neutral description + **one value ascription** + **one ACT** + **one LOCUS**. Stack as free `/h/` / `/w/` units — do not pack activation × locus × need into one host tag.

| Clarity | Reading |
|---------|---------|
| `z<talk>l wodoloxul hogenal hagenal` | *anxious about the talk* → talk costs competence (temporary); flood; room awash (circumstantial) |
| `z<split>l wogonoxum hogenal hoburol` | *resentful about the split* → unmet relatedness; flood poured onto them |
| `zebunem wodoloxam hogenal habobol` | *proud of the draft* → met competence (mental channel); flood bottled (internal) |
| `z<note>l wogonoxum hozonol hoburol` | soft leftover blame → unmet relatedness; stillness pooling at them |

**Raw feeling:** contacting a sensation without judgment/explanation may leave it unlabeled. Full compose is required when an emotion word would have done evaluative work — same nudge as neutral praise / criticism. Do **not** add [COMMENT](#comment) on affect clauses.

**Not `x`-compounds:** activation and locus are **root choices** (three-way mood inventories), not `xa`/`xu` polarity and not endings on need or ability compounds. Do **not** compound ACT/LOCUS onto the content verb the way ability does.

**Do not overload other tables:**

| Dimension | Stays | Emotion locus / activation is *not* |
|-----------|--------|--------------------------------------|
| Need met / unmet / motive / ought | [values](values.md) `xa` / `xe` / `xo` / `xu` | a second need inventory |
| Contact channel | `xa` endings | locus (how you savor ≠ where charge sits) |
| Preference standing | `xe` endings | locus (motive source ≠ felt-charge attribution) |
| Ordinary degree | *very* / *slightly* | activation (intensity of *arousal*, not scalar property degree) |
| Mental commentary | [COMMENT](#comment) (`uho`; cognitive attitudes only) | emotion-label compose (no COMMENT co-stack on affect) |

### Out of scope (for now)

- Whether MED (`oju`) shares a form with another soft default.
- Whether ACT/LOCUS may bind as `/w/` on the judged `/ɡ/` vs only floating `/h/`.
- Emotion lexicon retained only for non-judgmental sensation naming (if any).

### Constraints

- Emotion compose **reuses** [value](values.md) ascription; it is **not** a parallel tag system on the host.
- **ACT** (`ogena` / `oju` / `ozono`) and **LOCUS** (`abobo` / `oburo` / `agena`) are mood roots in the non-value `/h/` / `/w/` subcategory — not needs, not ability, not restrictors.
- **EXTERNAL** stays one root (`oburo`); *pool at them* is the **`ozono` + `oburo`** idiom, not a seventh mood.
- Do **not** reuse mid-word **`x` + {a\|e\|o\|u}** for activation or locus.
- Do **not** encode activation × locus × need in one word’s endings.
- Opaque emotion words used for judgment / explanation are replaced by the compose recipe, not merely tagged.

## Plan / predict
<a id="plan-predict"></a>

English future cues (*will*, *going to*, *tomorrow*, …) smuggle whether you mean **intention** or **forecast**. Clarity keeps that fork as **two closed mood roots**, not value-style **`x`-compounds**.

| Claim | Prefer | Lexicon root |
|-------|--------|--------------|
| Intention / commitment about what *you* will do | closed **`PLAN`** under `/h/` (optional `/w/` if scoped only to a preceding `/ɡ/`) | **`owaro`** 🗺️ *world-map* → *plan* |
| Forecast about what will happen | closed **`PREDICT`** under `/h/` (same `/w/` option) | **`edelo`** 🔭 *telescope* → *forecast* |
| How detailed the intention is | endings (or a tiny closed set) on **`PLAN`** — none / vague / detail / contingency; **-l / -m / -n / -r** is the natural four-way fit once assigned | same **`owaro`** |
| How you know the forecast | ordinary **[evidentiality](#evidentiality)** `/h/` stacked with **`PREDICT`** — same inventory as other claims (*caused by…*, *thinks*, …; causal hosts also use [causation](causation.md) join shapes), not a predict-only compound series | same **`edelo`** |

**Conceptual metaphors:** a **map** charts a course you mean to take; a **telescope** looks ahead at a distance (provisional resolution — not dice, not crystal-ball certainty). Past / source framing uses [evidentiality](#evidentiality) (e.g. **WITNESSED** / **RECORDED**).

**Not `x`-compounds:** plan vs predict is a **root choice** (speech-act type), not `xa`/`xu` polarity on a host. Ability compounds onto an activity (`v<sing>xun`); plan/predict **frame the clause** — content verbs stay bare. Do **not** map plan grain onto contact / preference standing / prescription force / changeability, and do **not** invent `xe`/`xo` (or any `x`+vowel) for future framing.

Schematic: `howarom … vegeham` (*detail plan: I finish*) vs `hedelom hawam … varunal` (*forecast from pattern: it rains*).

### Out of scope (for now)

- Exact ending ↔ None / Vague / Detail / Contingency assignment on **`PLAN`**.

### Constraints

- **`PLAN`** (`owaro`) and **`PREDICT`** (`edelo`) are mood roots in the non-value `/h/` / `/w/` subcategory — not needs, not ability hosts, not restrictors.
- Do **not** reuse mid-word **`x` + {a\|e\|o\|u}** for plan/predict.
- Prefer floating `/h/`; do not compound plan/predict onto the content verb the way ability does.

## Evidentiality
<a id="evidentiality"></a>
<a id="evidential"></a>

Claims about the world — what happened, what caused what, what someone else thinks, what will happen — often smuggle **how you know**. Clarity marks that as closed `/h/` mood roots (optional `/w/` when scoped only to a preceding `/ɡ/`) — same non-value mood subcategory as [plan / predict](#plan-predict).

**Not COMMENT:** first-person *I think* / rumination is [**COMMENT**](#comment) (`uho`). *Believe* / other-minds *thinks* / causal warrant / forecast warrant use **this** inventory. Do **not** treat COMMENT / mindfulness noting on first-person attitude verbs as evidentiality.

### Mood inventory (source-channel family)

**Conceptual metaphor:** each root is a **channel** you got the claim through — memory catch, playback, trail of cases, detective work, listening, gut, tale. Content PoS stays ordinary (*an ear*, *a heart*, *a scroll*); under `/h/` / `/w/` mood use, the figurative channel reading wins.

| Mood | Lexicon root | Metaphor | Gloss |
|------|--------------|----------|-------|
| **WITNESSED** | **`uhunu`** | 🎣 *fishing* → *memory* | firsthand / reconstructive — you (think you) caught it yourself; may pull a **boot** |
| **RECORDED** | **`eroge`** | ⏺️ *record* → *record* | documented / captured — playback of what was preserved |
| **PATTERN** | **`awa`** | 🐾 *paw-prints* → *trail* → *pattern* | from regularity / similar cases left behind |
| **INFERRED** | **`eve`** | 🕵️ *detective* → *investigation* → *inference* | reasoned from clues — not direct channel |
| **TOLD** | **`erare`** | 👂 *ear* → *listening* → *hearsay* | reportative — under `/h/`, *listening* = hearsay |
| **FELT** | **`ahe`** | ❤️ *heart* → *gut-felt* | proprioceptive / affective knowing — not [emotion compose](#emotion-compose) |
| **STORY** | **`orolo`** | 📜 *scroll* → *tale* | narrative / lore / anecdotal framing |

**Not `x`-compounds:** channel is a **root choice**, not `xa`/`xu` on the claim host. Stack with **PREDICT**, causation shapes, [universality](#universality) **NATURAL**, other-minds content, ….

| Clarity (schematic) | Reading |
|---------------------|---------|
| `… huhunum …` | *per memory / witnessed* (reconstructive) |
| `… herogem …` | *on record / recorded* |
| `… hawam …` | *from the pattern / trail of cases* |
| `… hevem …` | *inferred / from investigation* |
| `… herarem …` | *told / hearsay* |
| `… hahem …` | *felt / gut-known* |
| `… horolom …` | *per the tale / story* |
| `hedelom hawam … varunal` | *forecast from pattern: it rains* |
| `… haon b-…` + `hevem` | *sufficient-cause claim, inferred* |

### Memory / record (past framing)
<a id="memory-record"></a>
<a id="memory"></a>
<a id="record-past"></a>

**WITNESSED** (`uhunu`) and **RECORDED** (`eroge`) **are** the evidential roots — not a separate past-only mood pair. Past *I remember* / *according to…* / *on record* readings are the same channels applied to past claims.

| Framing | Evidential mood | Lexicon root | Metaphor cue |
|---------|-----------------|--------------|--------------|
| Reconstructive / recalled past | **WITNESSED** | **`uhunu`** | Casting into opaque water — fish or **boot** |
| Documented / captured past | **RECORDED** | **`eroge`** | Preserving now for later playback |

Dedicated observation vs imagination **tense** remains TBD — [TODO](../TODO.md); it stacks with these channels, it does not replace them.

**Ordinary content still available:** `zuhunul` *a memory*; `verogel` *to record*; `duhunuxruzol` *that memory that won’t blank* — [null / anti-null](#null-anti-null). Same for the other channel roots (`zerarer` *that ear*, `zorolol` *a scroll*, …).

Idiom cue (teaching): *fish a boot* = retrieve the wrong past (🥾 `obodo` *boot* stays free for the punchline).

### English → Clarity

| English cue | Clarity |
|-------------|---------|
| *caused / predicted, inferred* | claim shape + **`hevem`** |
| *caused / predicted from pattern*; *always by nature* + pattern | claim shape (+ **`hafafal`** if natural) + **`hawam`** |
| *thinks / was told* (hearsay) | content + **`herarem`** |
| *knew / felt* (gut channel) | content + **`hahem`** |
| memory-sourced claim | **`huhunum`** |
| on-record claim | **`herogem`** |
| story / lore channel | **`horolom`** |

### Contrasts

| | Prefer | Avoid |
|--|--------|-------|
| COMMENT vs warrant | `huhom` = first-person commentary; evidential = how the **world-claim** is sourced | using COMMENT for *believe* / *thinks* |
| Felt vs emotion | **`ahe`** = channel of knowing; emotion = value + ACT + LOCUS | stacking **FELT** as a seventh emotion ACT |
| Told vs listening-event | `/h/` **`erare`** = hearsay; *hear the door* = ordinary `/v/` | collapsing both |
| Pattern vs COMMON | **`awa`** = evidential trail; **`ewono`** = exceptionlessness warrant | encoding PATTERN as universality |
| Witnessed vs Recorded | fishing retrieval vs playback archive | one generic *past* adverb |

### Out of scope (for now)

- Ending tables on these roots (grain of confidence, whose memory, soft vs committed channel, …).
- Full tense inventory (observation vs imagination) and how it stacks with channels.

### Constraints

- Named channel roots (**`uhunu`**, **`eroge`**, **`awa`**, **`eve`**, **`erare`**, **`ahe`**, **`orolo`**) are mood roots in the non-value `/h/` / `/w/` subcategory — not needs, not restrictors.
- Prefer floating `/h/`; content PoS uses stay ordinary.
- Do **not** reuse mid-word **`x` + {a\|e\|o\|u}** for evidentiality.
- Do **not** invent a predict-only or cause-only evidential series — one shared inventory.
- Do **not** treat **FELT** as [emotion compose](#emotion-compose) or **TOLD** as perception-as-event.
- **ACT** / **LOCUS** / **PLAN** / **PREDICT** / **COMMENT** / [universality](#universality) / values remain separate stacks when needed.

## Universality
<a id="universality"></a>
<a id="universality-mood"></a>

English *always* / *every* / *never* / *everyone* smuggle **how exceptionless** the claim is. Clarity keeps **domain** on the [universal fences](coordination.md#universals-domains-generics) (`zual` / `hual` / …) and puts the **warrant** on closed `/h/` mood roots (optional `/w/` when scoped only to a preceding `/ɡ/`) — same non-value mood subcategory as [plan / predict](#plan-predict) and [evidentiality](#evidentiality).

**Three axes stay distinct:**

| Axis | Clarity | Not the warrant mood |
|------|---------|----------------------|
| Domain (*who / when*) | `zual` / `hual` / SHARED kind — [universals](coordination.md#universals-domains-generics) | — |
| Inventory softness | join **-l** / **-m** (`zual` vs `zuam`, `hual` vs `huam`) | — |
| Exceptionlessness warrant | this section’s mood roots | do **not** strengthen joins or invent a cause-arrow |

### Mood inventory (weather / sky family)

**Conceptual metaphor:** universal claims are **weather reports**. Default climate is usual weather — not a law. Stronger warrants name a different sky story.

| Mood | Lexicon root | Metaphor | Gloss |
|------|--------------|----------|-------|
| **COMMON** (default) | **`ewono`** | ⛅ *weather* → *usual* | statistically / experientially usual — exceptions expected |
| **UNCOUNTERED** | **`ululu`** | 🌤️ *clear sky* → *uncountered* | no counterexample comes to mind — search, not proof |
| **FORMAL** | **`idido`** | ⭐ *star chart* → *formal* | definition / math / proof — fixed constellation |
| **NATURAL** | **`afafa`** | 🍎 *apple* → *natural* | natural necessity (unsupported objects fall); stack ordinary [evidential](#evidentiality) `/h/` |
| **RULE** | **`ebebe`** | ♟️ *board* → *rule-frame* | holds inside a named frame; take `/b/` scope (`hebebel b<chess>l`) |

**Default:** when a universal / habitual claim needs a warrant and none of FORMAL / NATURAL / RULE / UNCOUNTERED fits, use **COMMON** (`hewonol`). Do not treat FORMAL as socially preferred.

**Not `x`-compounds:** warrant is a **root choice**, not `xa`/`xu` on the quantifier host. Domain stays `zual` / `hual`; the mood **frames the claim**.

| Clarity (schematic) | Reading |
|---------------------|---------|
| `… hual … hewonol` | *always, usually* (default warrant) |
| `… hual … hululul` | *always, as far as I’ve checked* (no counterexample comes to mind) |
| `zual g<square>l … hididol` | *every square, by definition* |
| `… hual … hafafal` + evidential `/h/` | *always, by natural necessity* (how you know stacked separately — e.g. `hawam`) |
| `… hual … hebebel b<chess>l` | *always, under chess* |
| `zuam gagadal … hewonol` | soft domain *every cat that comes to mind* + usual warrant |

### English → Clarity

| English cue | Clarity |
|-------------|---------|
| *always / everyone / never, usually* | domain fence (`hual` / `zual` / `hal` / …) + **`hewonol`** |
| *always / never, as far as I’ve checked* | domain fence + **`hululul`** |
| definitional *every* / *all* | domain fence + **`hididol`** |
| *always by nature* (+ how you know) | domain fence + **`hafafal`** + evidential `/h/` (e.g. **`hawam`**) |
| *always under [frame]* (e.g. chess) | domain fence + **`hebebel b-…`** (scope NP) |

### Contrasts

| | Prefer | Avoid |
|--|--------|-------|
| Domain vs warrant | `zual gagadal` + `hewonol` | encoding COMMON as `zuam` alone |
| Soft list vs uncountered | `zuam` = open inventory; **`ululu`** = no counterexample found | collapsing both into **-m** |
| Formal vs natural | **`idido`** = definition/proof; **`afafa`** = nature’s force + evidential | using either for “I can’t think of exceptions” |
| Pattern vs COMMON | [evidential](#evidentiality) **`awa`** = trail of cases; **`ewono`** = usual warrant | encoding PATTERN as universality |
| Natural vs CAUSE | **`afafa`** for exceptionlessness; condition type stays [joins](causation.md); optional **`CAUSE`** mood keeps **`erage`** ⚙️ *gear* → *mechanism* | reusing **`erage`** as NATURAL |
| Preference as law | values **`xo` / `xe`** — [causation](causation.md#preference-vs-law) | stronger universality mood instead of naming the need |

### Out of scope (for now)

- Ending tables on these roots (committed vs soft warrant, anaphor, …).
- Whether bare unmarked `hual` / `zual` **implies** COMMON or leaves warrant unspoken (pedagogy may still nudge **COMMON**).

### Constraints

- **COMMON** (`ewono`), **UNCOUNTERED** (`ululu`), **FORMAL** (`idido`), **NATURAL** (`afafa`), and **RULE** (`ebebe`) are mood roots in the non-value `/h/` / `/w/` subcategory — not needs, not restrictors, not domain joins.
- Prefer floating `/h/`; **RULE** is complex `/h/` + `/b/` scope when the frame is named.
- Do **not** reuse mid-word **`x` + {a\|e\|o\|u}** for universality.
- Do **not** assign **`erage`** (optional **CAUSE**) to NATURAL.
- Domain / habitual morphology stays [coordination](coordination.md#universals-domains-generics) / [restrictors](restrictors.md); this section only warrants exceptionlessness.
- **ACT** / **LOCUS** / **PLAN** / **PREDICT** / [evidentiality](#evidentiality) / **COMMENT** / values remain separate stacks when needed.

## Ability
<a id="ability"></a>
<a id="incapability"></a>

Capability denials often smuggle permanence; tag **changeability** on the denial. Restrictors (`hal` = *never*, …) stay **when the host applies**, not ability speech acts — do not redefine them as *can’t*.

### Primary: host + `xa` / `xu`

When the denied (or claimed) capability **is** a single content root, compound ability onto that root — same mid-word **`x`** joiner as [values](values.md#word-shape):

```
PoS + HOST + x + {a|u} + {-l|-m|-n|-r}
```

| Piece | Role |
|-------|------|
| **PoS** | Prefer the host’s usual role — `/v/` (event), `/ɡ/` (property), etc. |
| **HOST** | Any **non-need** content root (*sing*, *lift*, *lead*, …) |
| **`xa` / `xu`** | Capable / incapable |
| **Ending** | [Changeability](#ability-changeability) only |

**Parser cue:** root ∈ [six needs](values.md#need-inventory) + `x…` → **value** tables. Other roots + **`xa` / `xu`** → **ability**. **`xe` / `xo`** on non-need hosts stay **undefined** (do not borrow motive / prescription). After PoS, single ROLE vowel **a** / **u** / **o** then `x` then a **longer** root → [role compound](#role-compounds), not ability. After PoS, single TYPE vowel **a** / **e** / **o** / **u** then `x` then a single EDGE vowel + ending → [span form](spans.md) (`daxal`, `daxol`, `daxan`, `daxar`, …); **`xuxul`** / **`xuxur`** / **`xuxun`** / **`xuxum`** → span close — not ability. Full map: **[x-compounds.md](x-compounds.md)**.

**Ship first:** **`xu`** (incapability). **`xa`** when you want tagged *can*.

| Form | Reading |
|------|---------|
| `v<sing>xul` / `g<sing>xul` | can’t sing **right now** (usually able) |
| `…singxum` | can’t sing yet / may learn (or unknown) |
| `…singxun` | can’t sing — fixed / impossible as far as you can tell |
| `…singxur` | won’t sing (choice) — not can’t |
| `…singxam` | can sing; capability open to change |
| `…singxan` | can sing; claim treated as fixed |

### Fallback: closed `ABIL` root (`egera`)

When there is **no single host root** (complex VP, hostless *I can’t*, or ability as a floating adverb), use closed **`ABIL`** = lexicon **`egera`** 🥣 *cereal* → *capacity*:

```
[h|w] + egera + x + {a|u} + {-l|-m|-n|-r}
```

| Prefix | Scope |
|--------|--------|
| `/h/` | clause-level capability claim (floats like other `/h/`) |
| `/w/` | capability framed on the preceding `/ɡ/` |

**Conceptual metaphor:** a bowl holds **what it can** — hostless ability names that capacity without naming one activity root. Ordinary content still available (`zegeral` *cereal* / *a capacity*). Prefer **host+`xu`/`xa`** whenever the activity fits one root.

Bare `hegeral` / `wegeral` = ability **topic** only (ordinary [reference-suffix](reference-suffix.md) for now).

### Stances

| Form | Stance | Gloss |
|------|--------|--------|
| bare host (no `x`) | ordinary word | no ability claim |
| bare **`egera`** (no `x`) | **Topic** | Ability named only |
| **`xa`** | **Capable** | Capability present / claimed |
| **`xu`** | **Incapable** | Capability denied — ship this first |

### Endings — changeability only
<a id="ability-changeability"></a>

On ability **`xa`** and **`xu`** (host-attached or **`egera`**), **-l / -m / -n / -r** are **changeability** — the same table as unmet values ([values.md § Changeability](values.md#value-changeability)). Not contact channel, preference standing, or prescription force.

| Ending | Changeability | Mnemonic |
|--------|---------------|----------|
| **-l** | **temporary** — usually able; not this moment | closed *right-now* snapshot |
| **-m** | **modifiable** — effort or circumstance may change it (also soft default if unknown) | open to change |
| **-n** | **irreversible** — fixed / impossible as far as you can tell | settled / named-as-fixed |
| **-r** | **won't-now** — choice or deferral, not inability | not updating this *now* |

**Can't vs won't:** **-n** (irreversible) vs **-r** (won't-now). Do not collapse them. Always pick an ending on **`xa`** / **`xu`**; unknown → **-m**.

| Form | Reading |
|------|---------|
| `…xal` | capable, **temporary** standing of that claim |
| `…xam` | capable, **modifiable** (or unknown) |
| `…xan` | capable, **irreversible** / fixed as far as you can tell |
| `…xar` | capable, **won't-claim-now** (defer saying you can) |
| `…xul` | incapable, **temporary** |
| `…xum` | incapable, **modifiable** (or unknown) |
| `…xun` | incapable, **irreversible** |
| `…xur` | incapable, **won't-now** (choice) |

### English → Clarity (schematic)

| English | Clarity |
|---------|---------|
| *can’t* (usually able; not this moment) swim / sing | `v<swim>xul` / `v<sing>xul` (host primary) |
| *can’t* (may learn / unknown) … | `v<HOST>xum` |
| *impossible* / *can’t* (fixed) … | `v<HOST>xun` |
| *won’t* (choice, not inability) … | `v<HOST>xur` |
| hostless / clause-wide *can’t* (temporary) | `hegeraxul` |

Hosts *can't* / *cannot* / *unable* / *incapable* / *impossible* collapse to **`xu` + changeability** on the activity root when there is one; otherwise on **`egera`**.

### Ability vs values vs restrictors

| Claim | Prefer |
|-------|--------|
| Can’t / can **this** activity or property | **host + `xu` / `xa`** (this page) |
| Clause-wide / hostless capability | **`hegeraxu…`** / **`wegeraxu…`** |
| Need unmet + changeability | need **`xu…`** — [values](values.md) (`hodoloxun` ≠ “can’t competence”) |
| When / never / sometime the host applies | [restrictors](restrictors.md) (`hal`, `har`, …) |

Stack when useful: e.g. can’t-sing plus unmet competence (`v<sing>xum` + `hodoloxum`). Do **not** use bare **`hal`** (*never*) as a substitute for tagged incapability. Do **not** read need-root **`xu`** as ability. Do **not** reuse unspecified need **`egege`** 🥚 (*potential*) as **`ABIL`**.

### Examples

| Clarity (schematic) | Reading |
|---------------------|---------|
| `v<sing>xul` | can’t sing **right now** |
| `v<sing>xum` | can’t sing yet / may become able |
| `v<sing>xun` | can’t sing (fixed / impossible as far as you can tell) |
| `v<sing>xur` | won’t sing (choice), not can’t |
| `g<lead>xam` | can lead; capability open to change |
| `v<sing>xum hodoloxum` | can’t sing (modifiable) **and** unmet competence |
| `… hegeraxul` | can’t **right now** (no single host / clause-wide) |
| `hegeral` | ability (**topic** only) |

### Out of scope (for now)

- **`xe`** / **`xo`** on ability hosts (motive / prescription stay on [needs](values.md)).
- Whose-ability / evidentiality on the denial (use ordinary mood `/h/` later if needed).
- Positive *can* forced on every clause (optional **`xa`** only).

### Constraints

- Ability is **not** a need; do **not** apply contact / preference-standing / prescription-force tables to it.
- Defined ability stances are **`xa`** and **`xu`** only; endings on those compounds = **changeability** only.
- Need roots + `x…` stay [values](values.md); never reinterpret as host-ability.
- Fallback **`ABIL`** is **`egera`** (*capacity*); prefer host-attached forms; use **`egera`** only when there is no suitable single host.
- Do **not** overload [restrictors](restrictors.md) as ability morphology.
- Plural **-sh** stays unused on `/h/` `/w/` ([plurality](plurality.md)); host **`/v/`** / **`/ɡ/`** ability compounds follow ordinary plurality rules for that PoS.

## Role compounds (`a` / `u` / `o` × root)
<a id="role-compounds"></a>
<a id="participant-compounds"></a>
<a id="agent-patient-reltum"></a>

Derive **event/relation participants** without open lexicon role nouns (*attacker*, *victim*, …). Shape is **ROLE vowel left of `x`**, opposite order from [values](values.md) / [ability](#ability) (those put the stance vowel **right** of `x`). Mid-word **`x`** family map: **[x-compounds.md](x-compounds.md)**.

### Pattern

```
PoS + {a|u|o} + x + ROOT + {-l|-m|-n|-r}
```

| Piece | Role |
|-------|------|
| **PoS** | Slot **now** — prefer `/z/` `/d/` `/b/` (entity participant). `/ɡ/` optional as classifying property; `/v/` `/h/` `/w/` **undefined** for now |
| **ROLE** | Single vowel **`a`** / **`u`** / **`o`** (not a content root — no open root is a bare vowel) |
| **`x`** | Ordinary [compound joiner](phonology.md#phonotactics) |
| **ROOT** | Event stem (**`a`/`u`**) or relation stem (**`o`**) — `V(CV)+` |
| **Ending** | Ordinary [reference-suffix](reference-suffix.md) senses — **not** value/ability ending tables |

**Parser cue:** after PoS, a single vowel then `x` then a **longer** root + ending → role compound. Same shape with a **single** vowel after `x` → [span](spans.md), not role. **`e x …`** is **reserved** (undefined) — not a fourth ROLE.

### Inventory

| ROLE | Form | ROOT type | Referent |
|------|------|-----------|----------|
| **`a`** | `…axROOT…` | **event** (verb / event noun stem) | **agent** — doer / subject-like participant of that event |
| **`u`** | `…uxROOT…` | **event** | **patient** — undergoer / object-like participant of that event |
| **`o`** | `…oxROOT…` | **relation** (complex `/ɡ/` / `/h/` / [join-relation](#join-relations) root, …) | **reltum** — the `/b/` argument pole of that relation |

Recipients, beneficiaries, topic NPs, and other adjunct `/b/`s stay ordinary resume of that `/b/` noun (or the `/h/`+`/b/` unit) — do **not** invent more ROLE vowels for them.

Mnemonic (loose only; parallels [values](values.md) **`xa`/`xu`** and join **a** / **u**): **`a`** ≈ additive / doer; **`u`** ≈ subtractive / undergoer (inverse of agent); **`o`** ≈ oblique / `/b/` — **not** reviser or join readings.

### Endings

| Ending | Reading |
|--------|---------|
| **-l** | Indefinite / kind — *an attacker*, *attackers as a type* (`zax<attack>l`) |
| **-m** | Soft / hedged role |
| **-n** | Titled / epithet role label (rare) |
| **-r** | Definite — participant of the **most recent matching** event (**`a`/`u`**) or relation (**`o`**) for that ROOT |

**-r** resolution: match ROOT to the most recent verb, event noun, or relation word with that stem (including a ROOT half inside a prior role compound). ROLE picks that frame’s agent, patient, or `/b/` pole — including when the participant was only introduced as [unspecified-member](coordination.md#unspecified-member-r-phrase) **`zar`** / **`dar`** / ….

Bare event noun stays the event: `z<attack>l` / `z<attack>r` = *an / that attack*, not a participant. Cross-PoS content **-r** from a verb still resumes the [event](pronouns.md), not the agent — use **`ax`/`ux`** for participants.

### Examples (schematic roots)

| Clarity | Gloss |
|---------|--------|
| `jal zar dumogon v<attack>l` | *Someone attacked me* |
| `jal zax<attack>r v<flee>l` | *The attacker fled* |
| `zax<attack>l` | *an attacker* (kind; no discourse event required) |
| `dux<attack>r` | *the one attacked* (as object now) |
| `zox<of>r` | *that of-argument* (reltum of salient `…ofl b-…`) |
| `z<attack>r` | *that attack* (event — not agent) |

### Contrasts

| | Use |
|--|-----|
| Role compound | Participant derived from event/relation root — no *attacker* lexicon entry |
| Content **-r** on event | The event / doing itself ([pronouns](pronouns.md)) |
| **`zar`** / **`dar`** | Unspecified member introduce; weak resume target — prefer role **-r** once the event is named |
| Ability `v<attack>xun` | Can’t attack — **ROOT x vowel**, not ROLE vowel left of `x` |
| Span `daxal` / `duxal` | Quote / opaque open — **vowel x vowel**, not ROLE x root |

### Out of scope (for now)

- ROLE **`e`** (reserved).
- Instrument / beneficiary / recipient as extra ROLE vowels.
- Role compounds under `/v/` `/h/` `/w/`.
- Stacking role + ability (`axattackxu…`) — ban; put ability on the bare event verb.
- *Act done by entity* as a ROLE — resume verbs with ordinary **-r**, or use **`var`** for unnamed doing.

### Constraints

- ROLE is **`a`/`u`/`o`** only; wrong ROOT type for a ROLE is illegal (not metaphorical).
- Endings stay **ordinary** reference-suffix senses on role compounds.
- Do **not** read ROLE vowels as value stances, ability polarity, or span TYPE/EDGE.
- Plural **-sh** on noun-slot role compounds follows ordinary [plurality](plurality.md) for that PoS.

## Numeric derivation (`ROOT` × number stem)
<a id="numeric-derivation"></a>
<a id="number-compounds"></a>
<a id="numeric-morphs"></a>

Derive **new senses from a content root** by compounding a PoS-less [number](numbers.md) stem after mid-word **`x`**. Free number words stay the closed numeral subsystem; this family is **derivation**, not a count / rank / label in a clause slot. Mid-word **`x`** family map: **[x-compounds.md](x-compounds.md)**.

### Pattern

```
PoS + ROOT + x + NUM + {-l|-m|-n|-r}
```

| Piece | Role |
|-------|------|
| **PoS** | Ordinary slot for the derived word |
| **ROOT** | Open content host (`V(CV)+`) |
| **`x`** | Ordinary [compound joiner](phonology.md#phonotactics) |
| **NUM** | Number stem **without PoS and without its own ending** — same marker / digits / digitless-exp body as [numbers.md](numbers.md); inventory tables use [shorthand](numbers.md#writing-preferred-shorthand) (`+e`, `_12`, `+1e`, …); **running-text / citation examples prefer spelled CV** (`raba`, `ro…`, `rawoba`, …) — [writing style](numbers.md#writing-style-numeric-vs-spelled) |
| **Ending** | Ordinary [reference-suffix](reference-suffix.md) on the **whole derived stem** (host ROOT) — **not** [number endings](numbers.md#number-endings) |

**Writing style:** free numbers stay shorthand by default; derived words prefer **spelled CV** so the compound looks like an ordinary word (`zolexrabal`, not `zolex+el`). Shape columns below keep shorthand as schematic (`ROOTx+e`); example cells use spelled forms. Do **not** hybridize shorthand `NUM` + host letter ending.

**Ending rule:** because **-l / -m / -n / -r** attaches to the compound (the ROOT), there is **no** number soft / named / resume on `NUM`. Do **not** write `ROOTx~+e`, `ROOTx@+1e`, or `ROOTx=+` (and do not spell those hybrids either). Approximate, proper-designation, and resume use ordinary reference endings on the derived word, or free number words / ordinary syntax outside this family.

**Parser cue:** longer material before `x`, then a right half that matches number-stem grammar (writing **`+` / `-` / `#` / `#-` / `_`**, speech **`r`+V…** including digraph **`reu`**, digitless exp, hyperbole mantissa+`e`/`e-`, [zero × exp](numbers.md#zero-exponent) **`+0e` / `±0e-1`**, ordinal rank-annihilated **`#0e`**, [quasi-N](#quasi-n) **`-e-1` / `-e-2`**, label digits under `_`, scalar digit morph **`+N` / `-N`**, or ordinal digit morph **`#N`**) + ordinary ending → this family. Bare **`ROOTxe`** is **not** essence (that shape is stance **`xe`**). Essence is **`ROOTx+e`**. Bare digit with no marker (`ROOTx1`) is **illegal** — digit morphs need a pronounceable marker vowel (**`ra`** / **`ru`** / **`re`**). End-relative free ranks (**`#-N`**), [ordinal generation](numbers.md#ordinal-generation) (**`#e0`** / **`#NeK`**), and free scale assert (**`Ne0`**) stay free-number only in this pass (no **`ROOTx#-N`** / **`ROOTx#NeK`** / **`ROOTx+Ne0`** morphs; **`ROOTx+e0`** / **`ROOTx+0e0`** **TBD**).

### Inventory

#### Limit / polarity / stage (digitless)

| Shape | Reading | Example |
|-------|---------|---------|
| **`ROOTx+e`** | **essence / absolute / pure type** of ROOT | `zolexrabal` — *essence of love* |
| **`ROOTx+e-`** | **grain / seed / infinitesimal** of ROOT | `z<truth>xrabul` — *grain of truth* |
| **`ROOTx-e`** | **void of / absolute anti-ROOT** | `zevaxrubal` — *void of fear* |
| **`ROOTx-e-`** | **quasi-ROOT** — has the shape of ROOT without full real-axis status (English **`quasi-`**); **`ROOTx-e-1`** / **`ROOTx-e-2`** = [quasi-N](#quasi-n) | `z<friend>xrubul` — *quasi-friend*; `z<friend>xrubudul` — *quasi-pair* |
| **`ROOTx#e-`** | **origin / prototype / onset-form** of ROOT | `zolexrebul` — *love in its beginning form* |
| **`ROOTx#e`** | **telos / culmination / final form** of ROOT | `z<story>xrebal` — *story’s final form* |
| **`ROOTx+`** | **poly- / multi-ROOT** (unspecified >1) | `zurujuxram` — *multi-faith* |
| **`ROOTx-`** | **de- / un- / deficit-ROOT** | `v<myth>xrul` — *to de-myth* |

Digitless **`+` / `-` / `#`** on ROOT = **metaphysics of the kind** — **not** free special values. `ROOTx+e` is **not** free +∞ (`g+e`), and **not** comic hugeness (`ROOTx+1e`). Free twins: `g+e` = +∞; `g+e-` = arbitrarily small; `g-e` = −∞; `g-e-` = [notional / imaginary amount](numbers.md#imaginary); `g#e-` / `g#e` = start / last place (origin / telos poles); free [generation](numbers.md#ordinal-generation) (`g#3e2`, `g#e0`, `g#e-2`) and end-relative **`g#-N`** are series-relative, not kind morphs; [zero × exponent](numbers.md#zero-exponent) free forms (`g+0e`, `v+0el`, …) parallel [derivation zero-exp](#zero-exponent-derivation). Free bare **`g+e0`** / **`g+Ne0`** = [ones band / OoM-0 assert](numbers.md#bare-oom-bands) — **not** kind morphs (**`ROOTx+e0`** **TBD**). **`ROOTx-e-`** = [quasi-ROOT](#quasi) (kind); free **`g-e-`** = notional amount — same stem shape, different job. For *∞ as a property of the kind*, prefer hyperbole `ROOTx+1e` or ordinary wording — don’t overload essence. Digitless **`_`** = [catalog topology](#infinite-labels) (below).

##### Quasi-ROOT (`-e-` / `-e-1` / `-e-2`)
<a id="quasi"></a>
<a id="quasi-root"></a>
<a id="quasi-n"></a>

**`ROOTx-e-`** = ROOT in **quasi-** form: the shape / role of ROOT without committing it on the real ledger. Closest English affix: **`quasi-`** (*quasi-friend*, *quasi-official*). **Not** free notional amount (`g-e-`); **not** void of ROOT (`ROOTx-e`); **not** soft/approximate (`-m` on the host); **not** falsehood. Former “anti-grain / coarse” reading of this cell is **removed** — use ordinary wording for *coarse / non-seed*.

| PoS | `…x-e-` | Examples |
|-----|---------|----------|
| **`/z/` `/d/` `/b/`** (noun) | a quasi-entity | `z<friend>xrubul` — *a quasi-friend*; `d<contract>xrubul` — *a quasi-contract* |
| **`/v/`** (verb) | to treat as quasi- / as-if that kind | `v<friend>xrubul` — *to quasi-befriend* / treat as friend-shaped |
| **`/ɡ/`** (adjective) | *quasi-* (ascribed) | `g<official>xrubul` — *quasi-official* |
| **`/h/`** (adverb) | under quasi- framing | `h<official>xrubul` — *quasi-officially* |
| **`/w/`** (adjunct) | host graded as quasi- | `g<deal>l w<contract>xrubul` — *quasi-contractual* |
| **`/j/`** (interjection) | *Quasi-!* / *As if that kind!* | `j<friend>xrubul` |

**Free vs derived:** **`g-e-`** / **`v-e-`** / **`h-e-`** / **`j-e-`** / **`x-e-`** = hostless notional amount / overlay ([numbers.md § Imaginary](numbers.md#imaginary)); **`ROOTx-e-`** = quasi-*kind*.

###### Quasi-N (`-e-1` / `-e-2`)

Stem shape **`ru` + `bu` + exponent digit `N`** (writing **`-e-N`**; bare-OoM anatomy, no mantissa). On ROOT = **quasi-** + the same strong digit reading as **`+N`** — as-if N-structure without real-axis commitment. **Derivation only** — free **`g-e-1`** / **`g-e-2`** stay real bare OoM (−10⁻¹ / −10⁻²).

| Shape | Reading | Twin | Example |
|-------|---------|------|---------|
| **`ROOTx-e-1`** | **quasi-unit / as-if singleton** — unit-shaped without being a real one | **`ROOTx+1`** unit | `z<voice>xrubuwol` — *a quasi-single voice* / as-if primary voice |
| **`ROOTx-e-2`** | **quasi-dual / imaginary duality** — pair/mutual *as if*, not real reciprocity | **`ROOTx+2`** dual/mutual | `g<duty>xrubudul` — *quasi-mutual duty*; `z<friend>xrubudul` — *quasi-pair / as-if partnership* |

**Contrast:**

| Form | Job |
|------|-----|
| **`ROOTx+2`** | real dual / mutual structure |
| **`ROOTx-2`** | privative — non-reciprocal / one-sided |
| **`ROOTx-e-2`** | quasi-dual — mutuality *as if* / imaginary duality |
| **`ROOTx-e-`** | general quasi (N unnamed) |
| **`g-e-2`** | free real −10⁻² (bare OoM) — **not** quasi-dual |

**Not defined:** **`ROOTx-e-0`** — use **`ROOTx-0`** (anti-null) or **`ROOTx-0e-`** (micro-residue); **`ROOTx-e-3`…`-e-9`** — out of scope (prefer bare **`ROOTx-e-`** or ordinary wording). Same PoS framing as bare quasi.
#### Scalar digit morphs (`+N` / `-N`)

Single-digit scalars only. Inventory / metalanguage writing uses the marker (**`+N`** / **`-N`**); bare **`ROOTxN`** is illegal (no marker vowel to pronounce). Speech is marker + digit (`ra`+`wo` for `+1`, `ru`+`wo` for `-1`, …). **Running-text examples prefer spelled CV** (`…xrawol`, not `…x+1l`) — [writing style](numbers.md#writing-style-numeric-vs-spelled). Writing **`+0`…`+9`** uses the strong readings below; **`-N`** (including **`-0`**) is the **privative** of that reading (lacks / undoes / inverse of the `+N` structure).

| `+N` | Strong reading | Example | `-N` privative | Example |
|------|----------------|---------|----------------|---------|
| **`ROOTx+1`** | unit / primary / singleton | `z<voice>xrawol` — *a single / primary voice*; **`zumogoxrawon`** — [personal standard](comparatives.md#mine-vs-speaker) (normative Mine; host = [speaker](pronouns.md#special-pronouns) **`umogo`**) | non-unitary / indistinct / not-a-one | `z<voice>xruwol` — *an indistinct / non-singular voice* |
| **`ROOTx+2`** | dual / mutual / reciprocal / pair | `g<duty>xradul` — *mutual duty* | non-reciprocal / one-sided / unpaired | `g<duty>xrudul` — *one-sided duty* |
| **`ROOTx+3`** | triad / triplet / 3-part / ternary | `z<dialog>xrarel` — *a three-part dialogue* | non-tripartite / collapsed-from-three | `z<government>xrurel` — *non-tripartite government* |
| **`ROOTx+4`** | quad / 4-part / square / frame | `z<court>xramol` — *a four-part / framed court* | unframed / out-of-box / unbound | `z<idea>xrumol` — *an unframed idea* |
| **`ROOTx+5`** | hand / pentad / agency-set | `z<tool>xraval` — *a handy / five-fold toolkit* | handless / without practical grasp | `zowaroxruval` — *a plan without practical grasp* |
| **`ROOTx+6`** | hex / 6-part / honeycomb / pack | `z<cell>xragul` — *a hexagonal / six-pack cell* | unpacked / non-hex / broken pack | `z<team>xrugul` — *an unpacked team* |
| **`ROOTx+7`** | heptad / week-cycle / complete series | `zazegaxralem` — *a seven-fold / week-cycle ritual* | incomplete series / broken cycle | `zazegaxrulem` — *a broken-cycle ritual* |
| **`ROOTx+8`** | octet / 8-part / doubled-quad | `z<block>xrahal` — *an octet / eight-part block* | non-octet / incomplete eight | `z<block>xruhal` — *a non-octet block* |
| **`ROOTx+9`** | ennead / near-full / almost-ten | `z<choir>xranal` — *a nine-part / near-full choir* | far-from-full / short-of-complete | `z<choir>xrunal` — *a far-from-full choir* |
| **`ROOTx+0`** | null / reset / emptied | `v<score>xrazol` — *to zero-score / null the score* | **anti-null** / non-emptyable / insistent residue | `g<score>xruzol` — *a score that won’t null* / *stubborn residual score* |

##### Null / anti-null by PoS (`+0` / `-0`)
<a id="null-anti-null"></a>

**`+0`** = treat ROOT as **resettable / emptied**; **`-0`** = ROOT **resists emptying** (insistent residue). PoS says *what kind of thing* is being emptied or refusing. This is **modality of emptiness**, not quantity: not “negative zero amount,” and not absence of the kind (**`ROOTx-e`** = *void of ROOT*). Stronger wipe = [total null](#zero-exponent-derivation) **`ROOTx+0e`** (free **`v+0el`** *annihilate*). Orthogonal to free counts, essence (`+e`), void (`-e`), and [ability](#ability) (`…xun` *can’t* ≠ *won’t null*).

| PoS | `…x+0` | `…x-0` | Examples |
|-----|--------|--------|----------|
| **`/z/` `/d/` `/b/`** (noun) | emptied / wiped instance | entity that won’t zero / stubborn residue | `z<debt>xrazol` — *a wiped debt*; `z<debt>xruzol` — *a debt that won’t zero*; `duhunuxruzol` — *that memory that won’t blank*; `b<score>xruzol` — non-null residue as argument |
| **`/v/`** (verb) | act of nulling / resetting | act that refuses null / keeps residual | `v<score>xrazol` — *to null the score*; `v<score>xruzol` — *to anti-null / refuse to zero the score*; `v<pain>xrazol` — *to extinguish pain*; `v<pain>xruzol` — *to leave pain unextinguishable* |
| **`/ɡ/`** (adjective) | null / reset (ascribed) | non-emptyable / residual (ascribed) | `g<score>xrazol` — *null / reset*; `g<score>xruzol` — *won’t-null / residual*; `gorexruzom` — *hope that won’t go to zero* (vs `gorexrubam` *void of hope*) |
| **`/h/`** (adverb) | clause framed as reset / zeroed | clause framed as irreducible residue | `hazexrazom` — *with effort zeroed*; `hazexruzom` — *with irreducible effort* / *despite any zeroing* |
| **`/w/`** (adjunct) | host `/ɡ/` graded toward null | host `/ɡ/` graded toward anti-null | `g<debt>l w<balanc>xrazol` — *debt (ascribed) zeroed*; `g<debt>l w<balanc>xruzol` — *debt whose balance is anti-null* — non-value overlay; do not collide with value **`xu`** [changeability](values.md#value-changeability) |
| **`/j/`** (interjection) | discourse *Zero it!* / *Null!* | discourse *Won’t zero!* / *Residue stands!* | `j<score>xrazol`; `j<score>xruzol` |

**Not** free counts: `zagadalsh g+3` = *three cats*; `z<dialog>xrarel` = *triadic dialogue* (structure of the kind). Multi-digit scalars (`ROOTx+12`) stay out of this morph set — use free numbers or label **`_`**.

#### Zero × exponent (`+0e` / `±0e-1` / …)
<a id="zero-exponent-derivation"></a>
<a id="total-null"></a>
<a id="engineering-null-morph"></a>

Same anatomy as free [zero × exponent](numbers.md#zero-exponent); on ROOT = **metaphysics of the kind**. Free **`v+0el`** = hostless *annihilate*; **`v<score>xrazobal`** = annihilate-*score* (kind). Soft / named / resume stay on the **host ending** (no number `~`/`@`/`=` on `NUM`).

| Shape | Reading | Example |
|-------|---------|---------|
| **`ROOTx+0e`** | **total null** / absolute wipe of the kind | `v<score>xrazobal` — *annihilate the score* (kind); `z<debt>xrazobal` — *a totally wiped debt-kind* |
| **`ROOTx+0e-`** | **sterile / null grain** of ROOT | `zorexrazobum` — *sterile hope*; `z<truth>xrazobul` — *truth with no seed* |
| **`ROOTx+0e-1`** | **engineering null at OoM −1** of ROOT — kind wiped at scale 10⁻¹ | `z<error>xrabuwojazol` — *deci-null error*; `v<score>xrabuwojazol` — *null the score at deci scale* |
| **`ROOTx-0e`** | **absolute residue** of ROOT | `z<debt>xruzobal` — *debt as absolute residue*; `v<pain>xruzobal` — *leave pain as absolute residue* |
| **`ROOTx-0e-`** | **micro-residue** of ROOT | `zuhunuxruzobul` — *memory as micro-residue* |
| **`ROOTx-0e-1`** | **engineering residue at OoM −1** of ROOT | `z<debt>xrubuwojazol` — *debt as deci-scale residue* |

**Emptiness chain (kinds):** **`ROOTx-e`** (void of kind) ≠ **`ROOTx+0`** (resettable null) ≠ **`ROOTx+0e`** (total null) ≠ **`ROOTx+0e-`** (sterile grain) ≠ **`ROOTx+0e-1`** (engineering null at 10⁻¹). Free bare **`g+e0`** / **`Ne0`** are [ones-band / OoM-0 assert](numbers.md#bare-oom-bands) on free numbers — **not** kind morphs here.

**`±0e-1` is scalar anatomy only** on free numbers; on ROOT the same stems are kind-scale wipe / residue. Other **`±0eN`** stay out of scope.

**TBD:** **`ROOTx+e0`**, **`ROOTx+0e0`** (and free **`…0e0`**) — no defined derivation readings yet (old *ROOT⁰* / `0⁰` glosses **removed**; `e` is always order of magnitude).

##### Zero-exp derivation by PoS

| PoS | `…x+0e` | Examples |
|-----|---------|----------|
| **`/z/` `/d/` `/b/`** | totally wiped / annihilated kind | `z<debt>xrazobal` |
| **`/v/`** | annihilate that kind | `v<score>xrazobal` |
| **`/ɡ/`** | ascribed total-null | `gorexrazobam` |
| **`/h/`** | clause framed as total wipe | `hazexrazobam` |
| **`/w/`** | host graded toward total null | `g<debt>l w<balanc>xrazobal` |
| **`/j/`** | *Annihilate that kind!* | `j<score>xrazobal` |

**`-0e` / `-0e-` / `±0e-1`** inherit the same PoS framing (absolute residue / micro-residue / engineering null·residue at OoM −1). Free twins: **`v+0el`** *annihilate*; **`g+0e`** absolute-zero amount; **`g+0e-1`** / **`g-0e-1`** engineering null / residue — [numbers.md § Zero × exponent](numbers.md#zero-exponent).

**Out of scope / TBD here:** scale-specific **`ROOTx±0eN`** for **`N≠1`** (and positive **`…0eN`**); **`ROOTx+e0`** / **`ROOTx+0e0`** / ordinal **`#0e0`**; **`ROOTx+Ne0`** (free **`Ne0`** is scale assert — [numbers.md](numbers.md#ambient-scale); kind morph TBD). Free ordinal **`#e0`** = current generation — free-number only in this pass. Defined ordinal zero-exp morph: **`ROOTx#0e`** below.

##### Rank-annihilated morph (`#0e`)
<a id="rank-annihilated-morph"></a>

| Shape | Reading | Example |
|-------|---------|---------|
| **`ROOTx#0e`** | **rank-annihilated / disqualified form** of ROOT — place wiped as a kind property | `z<contestant>xrezobal` — *a disqualified contestant (as type)*; `v<entry>xrezobal` — *to disqualify that entry-kind*; vs free **`g#0e`** *disqualified place in this series* |

**`#0e` ≠ `#0`:** annihilated place vs zeroth-order rung. **`#0e` ≠ `+0e`:** rank wipe vs kind total-null. **`#0e` ≠ free `#e0`:** rank annihilated vs [current generation](numbers.md#ordinal-generation) (free only). **`#0e0`:** **TBD**. Same PoS framing as other ordinal morphs (`/z/` disqualified kind, `/v/` disqualify-as-kind, `/j/` *Disqualified!*, …).

#### Ordinal digit morphs (`#N`)
<a id="ordinal-digit-morphs"></a>

Single-digit ordinals only. Inventory writing uses marker **`#`** (**`ROOTx#N`**); speech is **`re`** + digit; **running-text examples prefer spelled CV** (`…xrewol`, not `…x#1l`). **`ROOTx#N`** types ROOT as a **rank-N / Nth-order form** — place is part of the **kind**, not “the Nth token in a contextual series” (that stays free **`… g#N`**). Forward **`#N`** only — no end-relative morph (**`ROOTx#-2`** illegal; free **`g#-2`** covers penultimate tokens) and no generation morph (**`ROOTx#3e2`** / **`ROOTx#e0`** illegal; free **`g#e0`** = current gen). No privative twin of `#N`; scalar **`-N`** already covers “lacks N-structure.” Landmarks stay digitless: **`#e-`** origin, **`#e`** telos; **`#0e`** = [rank annihilated](#rank-annihilated-morph); **`#N`** = intermediate ranked stage of the kind. **`#0e0`:** **TBD**. Multi-digit `ROOTx#12` → prefer free `g#12` or label **`_`** if it’s an ID.

| `#N` | Strong reading | Example |
|------|----------------|---------|
| **`ROOTx#1`** | first-class / premiere / first-order | `z<edition>xrewol` — *a first-edition* (kind); vs `z<edition>l g#1` *the first edition (in this stack)* |
| **`ROOTx#2`** | secondary / second-order / backup | `g<effect>xredul` — *a secondary effect* |
| **`ROOTx#3`** | tertiary / third-order | `z<cause>xrerel` — *a third-order cause* |
| **`ROOTx#4`** … **`#9`** | Nth-order / Nth-place form | `z<harmonics>xreval` — *fifth-order harmonic* (as a kind) |
| **`ROOTx#0`** | zeroth-order / pre-rank / unranked form | `z<approxim>xrezol` — *a zeroth-order approximation* |

**`#1` ≠ `+1`:** premiere-place vs singleton/unit. **`#2` ≠ `+2`:** secondary vs dual/mutual. **`#0` ≠ `#0e`:** zeroth rung vs rank annihilated / disqualified.

##### Ordinal morph by PoS

| PoS | `…x#N` | Examples |
|-----|--------|----------|
| **`/z/` `/d/` `/b/`** (noun) | a rank-N kind | `zebunexredum` — *a second-draft (as type)*; `z<edition>xrewol` — *a first-edition* |
| **`/v/`** (verb) | treat as / assign that order (kind-act) | `v<rank>xrewol` — *to first-class / premiere it* (not free `v#1` *take 1st place*) |
| **`/ɡ/`** (adjective) | *Nth-order* (ascribed) | `g<effect>xredul` — *secondary* |
| **`/h/`** (adverb) | *at Nth-order framing* | `h<approxim>xrezol` — *zeroth-order* |
| **`/w/`** (adjunct) | host `/ɡ/` graded as Nth-order | `g<harm>l w<term>xrerel` — *third-order (term)* |
| **`/j/`** (interjection) | discourse call of that order-kind | `j<edition>xrewol` — *First-edition!* (kind cheer, not free `j#1` *First!* place cheer) |

**One-line rule:** `+N` = *how many parts*; `#N` = *which order/place in a hierarchy*; `_N` = *which code*; free `g#N` = *which token in the current series*.

#### Label / code sense (`_`)
<a id="label-code-sense"></a>

Marker **`_`** = ROOT identified by a **catalog / specimen / ID code**, not by count or rank. Digits (when present) are the **label payload** (*specimen #1*), not “first” and not “one-part.” Digitless exp under **`_`** is **undefined** on free number words ([numbers.md](numbers.md#digitless-exponents)); derivation opens it as **[catalog topology](#infinite-labels)** below.

| Shape | Reading | Example |
|-------|---------|---------|
| **`ROOTx_`** | ROOT as something that **bears a code** (taggable unit; code unnamed) | `z<specimen>xrol` — *a coded specimen* / *a specimen-as-ID* |
| **`ROOTx_N`** | **specimen / item #N** — the code is part of the kind | `z<specimen>xrowol` — *specimen #1*; `z<room>xrowodul` — *room-12* as a coded kind; `z<vitamin>xrowodul` — *B-12*-style kind |

##### Infinite / landmark labels (`_e` / `_e-` / `_1e`)
<a id="infinite-labels"></a>

Digitless **`_`** = **metaphysics of the catalog**, not magnitude. Label ∞ means *the naming system has no bound*, not *the count is infinite*. **Not** free dialing (`d_…`); **not** free amount +∞ (`g+e`).

| Shape | Reading | Example |
|-------|---------|---------|
| **`ROOTx_e`** | **open / unbounded catalog** — ∞-tagged, open ID space, any code in an unbounded ledger | `z<ticket>xrobal` — *open-ended ticket ID* / *∞-catalogued ticket* |
| **`ROOTx_e-`** | **proto-label / unassigned slot** — pre-code, atomic empty tag | `z<ticket>xrobul` — *unassigned ticket slot* |
| **`ROOTx_1e`** | comic **gazillion-coded** / umpteen-SKU | `z<product>xrowobal` — *a gazillion-SKU product* |
| **`ROOTx_1e-`** | comic **gazillionth-of-a-code** / vanishing ID | `z<clue>xrowobul` — *a vanishingly coded clue* |

###### Infinite label by PoS

| PoS | `…x_e` | `…x_e-` | Examples |
|-----|--------|--------|----------|
| **`/z/` `/d/` `/b/`** (noun) | open-catalog entity | pre-labeled / slot entity | `z<ticket>xrobal`; `z<ticket>xrobul` |
| **`/v/`** (verb) | to ∞-tag / put on an open ledger | to reserve an empty code slot | `v<ticket>xrobal`; `v<ticket>xrobul` |
| **`/ɡ/`** (adjective) | open-endedly coded | proto-coded / unassigned | `g<ticket>xrobal`; `g<ticket>xrobul` |
| **`/h/`** (adverb) | under open-catalog framing | under pre-label framing | `h<ticket>xrobal`; `h<ticket>xrobul` |
| **`/w/`** (adjunct) | host graded as open-catalog | host graded as proto-label | `g<item>l w<code>xrobal` |
| **`/j/`** (interjection) | *Open catalog!* / *∞-tagged!* | *Unassigned!* / *Empty slot!* | `j<ticket>xrobal`; `j<ticket>xrobul` |

**Crucial contrast — label vs free ordinal vs ordinal morph vs unit morph vs catalog ∞:**

| Form | Job |
|------|-----|
| `z<specimen>xrowol` | *specimen #1* (ID / catalog label) |
| `z<specimen>l g#1` | *the first specimen* (rank / order in context) |
| `z<specimen>xrewol` | *a first-class / premiere specimen* (ordinal digit morph) |
| `z<specimen>xrawol` | *a unitary / singleton specimen* (scalar digit morph) |
| `z<specimen>lsh g+1` | *one specimen* (count) |
| `zedugel g+e` | infinitely many tickets (count) |
| `zedugexrabal` | essence of ticket |
| `zedugexrawobal` | gazillion-ticket (rhetoric size) |
| `z<ticket>xrowodul` | ticket-12 (SKU) |
| `z<ticket>xrobal` | open-ended / ∞-catalogued ticket (kind) |
| `z<ticket>xrobul` | unassigned ticket slot (kind) |

**Prefer ordinary syntax** when the number is only an argument of an ordinary noun: `z<room>l g_12` = *the room numbered 12*. Use **`ROOTx_N`** when the code is part of the **concept** (specimen ID, SKU, protocol code). Discourse item cites stay free **`x_…`**; dial/input stays free **`v_…`**.

**Rule of thumb:** digitless **`+`/`-`/`#`** on ROOT = *metaphysics of the kind*; digitless **`_`** = *metaphysics of the catalog*.

#### Hyperbole sense (`+1e` / `#1e` / `_1e`)

Mantissa + digitless exp = **comic / rhetorical intensification**, same spirit as free [hyperbole](numbers.md#hyperbole-gazillion). Default mantissas **`1`**; other mantissas only when the joke needs them. Label hyperbole (`_1e` / `_1e-`) is catalog comedy — see [infinite labels](#infinite-labels).

| Shape | Reading | Example |
|-------|---------|---------|
| **`ROOTx+1e`** | *gazillion-ROOT* (comic huge) | `zebalexrawobam` — *a gazillion-mess* |
| **`ROOTx+1e-`** | *gazillionth-ROOT* (comic tiny) | `zagemuxrawobum` — *a gazillionth-of-a-chance* |
| **`ROOTx#1e`** | *umpteenth-ROOT* (comic late rank) | `z<try>xrewobal` — *an umpteenth try* (as a kind) |
| **`ROOTx_1e`** | *gazillion-coded ROOT* (comic SKU sprawl) | `z<product>xrowobal` — *a gazillion-SKU product* |
| **`ROOTx_1e-`** | *gazillionth-of-a-code ROOT* (vanishing ID) | `z<clue>xrowobul` — *a vanishingly coded clue* |

Free **`h#1e`** = *for the gazillionth time* (clause adverb). Derived **`z<meeting>xrewobal`** = *an umpteenth-meeting* (noun kind).

### Contrasts

| Form | Job |
|------|-----|
| `zebalem g+e` | mess of size **+∞** (free number) |
| `zebalexrabam` | **essence** of mess |
| `zebalexrawobam` | **gazillion-mess** (rhetoric) |
| `zebalemsh g+1e` | **one gazillion messes** (hyperbolic count) |
| `z<truth>xrabul` | *grain of truth* |
| `z<friend>xrubul` | *quasi-friend* (quasi-ROOT) |
| `z<voice>xrubuwol` | *quasi-single / as-if primary voice* |
| `z<friend>xrubudul` | *quasi-pair / imaginary duality* |
| `g<duty>xrubudul` | *quasi-mutual duty* |
| `g<duty>xradul` | *mutual duty* (real dual) |
| `g<duty>xrudul` | *one-sided duty* (privative) |
| `g-e-` | notional / imaginary amount (free — [imaginary](numbers.md#imaginary)) |
| `v-e-` | *treat as imaginary* (free overlay) |
| `zevaxrubal` | *void of fear* |
| `zagadalsh g+3` | three cats (count) |
| `zagadal g#3` | the third cat (rank) |
| `z<dialog>xrarel` | three-part / triadic dialogue (scalar digit morph) |
| `z<dialog>xrurel` | non-tripartite dialogue (privative) |
| `z<cause>xrerel` | third-order cause (ordinal digit morph) |
| `z<specimen>xrowol` | *specimen #1* (catalog label) |
| `z<specimen>l g#1` | *the first specimen* (free rank) |
| `z<specimen>xrewol` | *a premiere / first-class specimen* (ordinal morph) |
| `z<specimen>xrawol` | *a unitary specimen* (scalar digit morph) |
| `z<edition>xrewol` | *a first-edition* (kind) |
| `z<edition>l g#1` | *the first edition* (in this stack) |
| `g<effect>xredul` | *a secondary effect* |
| `z<approxim>xrezol` | *a zeroth-order approximation* |
| `zedugel g+e` | infinitely many tickets (count) |
| `zedugexrabal` | essence of ticket |
| `z<ticket>xrowodul` | ticket-12 (SKU) |
| `z<ticket>xrobal` | open-ended / ∞-catalogued ticket |
| `z<ticket>xrobul` | unassigned ticket slot |
| `z<product>xrowobal` | gazillion-SKU product (label hyperbole) |
| `v<score>xrazol` | *to null the score* |
| `v<score>xrazobal` | *to annihilate the score* (total-null kind) |
| `v+0el` | *annihilate* (free hostless — [zero × exponent](numbers.md#zero-exponent)) |
| `g+e0` | ones band 1–9 (free bare OoM — [numbers.md](numbers.md#bare-oom-bands)) |
| `g+3e0` | *three at asserted OoM 0* (free — [ambient](numbers.md#ambient-scale)) |
| `g#e0` | current generation cohort (free) |
| `zorexrazobum` | *sterile hope* |
| `z<error>xrabuwojazol` | *deci-null error* (engineering null at OoM −1) |
| `z<debt>xrubuwojazol` | *debt as deci-scale residue* |
| `g+0e-1` | engineering null amount at OoM −1 (free) |
| `g#0e` | rank annihilated / disqualified place (free) |
| `z<contestant>xrezobal` | *a disqualified contestant* (kind) |
| `v<score>xruzol` | *to anti-null / refuse to zero the score* |
| `g<score>xruzol` | *non-emptyable / residual score* (anti-null) |
| `z<debt>xruzol` | *a debt that won’t zero* (anti-null noun) |
| `z<debt>xruzobal` | *debt as absolute residue* |
| `zevaxrubal` | *void of fear* (no fear-kind) |
| `zevaxruzol` | *fear that won’t go to zero* |
| `hazexruzom` | *with irreducible effort* (anti-null adverb) |
| `j<score>xruzol` | *Won’t zero!* / *Residue stands!* (anti-null interjection) |
| `j+0el` | *Annihilate!* (free) |
| `z<room>l g_12` | room numbered 12 (ordinary) |
| `z<room>xrowodul` | room-12 as coded kind |
| Ability `v<sing>xun` | can’t sing — stance vowel, not NUM |
| Role `zax<attack>r` | the attacker — ROLE left of `x` |
| Stance `…xe…` | motive (needs) / undefined (ability) — **not** essence |

### Out of scope (for now)

- Number endings / writing **`~` / `@` / `=`** on `NUM` (impossible under the ending rule).
- Productive multi-digit **scalar** or **ordinal** morphs (`ROOTx+27`, `ROOTx#12`) — use free numbers; label codes under **`_`** are the exception.
- Bare digit morphs (`ROOTx1`) — illegal; use **`ROOTx+1`** / **`ROOTx#1`**.
- Signed / end-relative ordinal morphs (`ROOTx#-2`) — illegal; use free **`g#-N`**.
- Ordinal generation morphs (`ROOTx#3e2`) — illegal; use free [generation](numbers.md#ordinal-generation).
- Privative twin of ordinal **`#N`** — use scalar **`-N`** for “lacks N-structure,” or free wording.
- Bare **`ROOTxe`** as essence.
- Role **`e x ROOT`** (stays reserved).
- Percent / percentage-point closers (**`jo` / `ju`**) as derivation morphs.
- Digit-string morphs as phone-dial or discourse-list substitutes.
- Scale-specific **`ROOTx±0eN`** / **`ROOTx±0e-N`** for **`N≠1`** (and positive **`…0eN`**) — only **`±0e-1`** defined; **`ROOTx+e0`** / **`ROOTx+0e0`** / **`#0e0`** / **`ROOTx+Ne0`** — **TBD**; free **`#e0`** / **`Ne0`** are free-number only ([generation](numbers.md#ordinal-generation) / [ambient](numbers.md#ambient-scale)). **`ROOTx#0e`** is defined ([rank annihilated](#rank-annihilated-morph)).
- Quasi-N beyond **`ROOTx-e-1`** / **`ROOTx-e-2`** (**`ROOTx-e-0`**, **`ROOTx-e-3`…`-e-9`**) — use bare **`ROOTx-e-`**, **`ROOTx-0`** / **`ROOTx-0e-`**, or ordinary wording.

### Constraints

- `NUM` has **no** PoS and **no** number ending; the compound’s ending is ordinary reference-suffix on ROOT.
- Digit morphs are single-digit **`+N` / `-N`** (scalar) or **`#N`** (ordinal); markers supply the pronounceable vowel (**`ra`** / **`ru`** / **`re`**). Free end-relative **`reu`** / **`#-`** is not a derivation morph.
- Do **not** read numeric morphs as free clause-slot numbers (use a free number word for count / rank / time / list item).
- Do **not** confuse **`ROOTx+e`** (essence) with **`g+e`** (+∞) or **`ROOTx+1e`** (hyperbole), **`ROOTx-e-`** (quasi-ROOT) with free **`g-e-`** (notional amount) or **`ROOTx-e`** (void), **`ROOTx-e-2`** (quasi-dual) with free **`g-e-2`** (real −10⁻²) or **`ROOTx+2`** / **`ROOTx-2`**, **`ROOTx+0e`** (total null) with **`ROOTx+0`** (resettable null) or free **`v+0el`** (*annihilate*), **`ROOTx+0e-1`** (engineering null at OoM −1) with digitless sterile **`ROOTx+0e-`** or free bare OoM **`g+e-1`**, **`ROOTx#0e`** (rank annihilated) with **`ROOTx#0`** (zeroth-order) or **`ROOTx+0e`**, free **`g+e0`** (ones band) with **`ROOTx+1`** (singleton) or free **`g+1`**, **`ROOTx+1`** (unit morph) with **`ROOTx#1`** (premiere-order) or **`ROOTx+1e`** (gazillion), **`ROOTx#1`** with free **`g#1`** / label **`ROOTx_1`**, or **`ROOTx_e`** (open catalog) with **`g+e`** (amount +∞) / free digitless **`_`** (undefined).
- Digitless **`+`/`-`/`#`** = kind metaphysics; digitless **`_`** = catalog metaphysics ([infinite labels](#infinite-labels)); zero×exp morphs = [zero-exponent derivation](#zero-exponent-derivation) (including **`±0e-1`** / **`#0e`**; **`ROOTx+e0`** / **`+0e0`** TBD).
- Plural **-sh** on noun-slot numeric derivatives follows ordinary [plurality](plurality.md) for that PoS.

## Numbered alternatives (problem / solution / goal)
<a id="numbered-alternatives"></a>
<a id="ideation"></a>

Port of Claritish **Numbered alternatives** (`problem1`, `solution2`, `goal3` instead of *the problem* / *the solution* / *the goal*). Fixating on a single frame hurts creativity; numbering candidates reminds speaker and listener to look for more.

**No new morphology.** Use ordinary lexicon nouns + free [ordinals](numbers.md) (`g#N`). Same style pressure as bare [percent denominators](numbers.md#percent-denominators): unique bare *the problem* (etc.) when framing ideation is **grammatical but stylistically bad**.

### Preferred roots

Published lexicon triad (puzzle → key → goal-net):

| Sense | Root | Emoji / literal | Metaphor |
|-------|------|-----------------|----------|
| **problem** | **`ubezu`** | 🧩 *puzzle-piece* | something to fit / solve |
| **solution** | **`egoge`** | 🔑 *key* | what unlocks it |
| **goal** | **`ogalo`** | 🥅 *goal* | net you aim at / objective |

Ordinary PoS still available (`zubezul` *a puzzle piece*; `vegogel` *to unlock*; …). The figurative jobs above are the ideation readings.

### Recipe

`zubezul g#1` / `zegogel g#2` / `zogalol g#1`

| Piece | Role |
|-------|------|
| **`ubezu` / `egoge` / `ogalo`** | candidate kind (problem / solution / goal) |
| free **`g#N`** | rank in **this** ideation series (*candidate N*) |
| soft **`g~#N`** | tentative ranking |

Prefer at least **`g#1`**; often name a second candidate. Soft **-m** on the number when the order is tentative.

### Claritish → Clarity

| Claritish / English cue | Clarity |
|-------------------------|---------|
| `problem1` / `solution2` / `goal3` | `zubezul g#1` / `zegogel g#2` / `zogalol g#3` |
| *the problem* / *the solution* / *the goal* (ideation) | stylistically bad — number candidates |
| discourse *point N:* | free **`x#N`** — [discourse marker](numbers.md#number-as-discourse-marker-by-marker); not a problem NP |

### Not this

| Form | Job | Why not for ideation numbering |
|------|-----|--------------------------------|
| **`ROOTx#N`** (`zubezuxrewol`) | ordinal **kind-order** (*premiere* / *secondary*) — [ordinal digit morphs](#ordinal-digit-morphs) | not “token #N in this brainstorm” |
| **`ROOTx_N`** (`z<ubezu>xrowol`) | catalog / ID — [label-code](#label-code-sense) | specimen code, not candidate rank |
| **`owaro`** | [PLAN](#plan-predict) mood | intention framing, not goal-as-noun (`ogalo`) |
| **`onuzu`** | *blockage* | obstacle in the way, not problem-as-to-solve |
| **`ululu`** | *remedy*; also [UNCOUNTERED](#universality) | medical fix / warrant mood, not solution proposal |
| **`obawo` / `ubelo`** | *aim* / *precision* | how you direct, not the goal itself |
| **`egeha` / `edale`** | *finish* / *achievement* | outcome markers, not the aimed-at objective |

### Reframe vs number (separate jobs)

Numbering = **multiple candidates**. Reframing the **same** situation = different wording of one frame — **not** a second digit:

| Job | Prefer |
|-----|--------|
| Exact framing | ordinary **-l** (or exact [cite](spans.md)) |
| Restatement / rephrase | metaphorical **-m**, discourse reviser **`el` / `em`** (*in other words* — [revisers](revisers.md#discourse-revisers)), or paraphrase span **`…~[…]`** |
| Origin / telos of a **kind** | **`ROOTx#e-` / `ROOTx#e`** — [numeric derivation](#numeric-derivation); not “first wording vs rewrite” |

### Constraints

- Do **not** invent fused `problem1`-style roots or a dedicated ideation mood.
- Do **not** require digits on every occurrence of these roots (*the problem of free will* as a philosophical topic is fine without `g#N`).
- Numbering is not “more virtuous” than leaving candidates unranked — the nudge is against treating the first frame as unique when generating options.
