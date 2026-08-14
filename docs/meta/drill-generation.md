# Generate translation drills

Executable editor policy: add end-of-band Eng ↔ Agelan checkpoints to learner grammar pages without using forms the learner has not been taught.

**How to invoke.** Point here and name a grammar file (or one band). No extra prompt is required:

- *Execute [drill-generation.md](drill-generation.md) to generate the drills for `coordination.md`.*
- *… for `docs/grammar/questions.md` Intermediate.*
- *… for core Beginner* (already exists — skip unless asked to replace).

This page owns **path allowlist**, **root bank**, and **generation procedure**. Drill *shape* (spoiler template, house names, item counts) stays in [translation-exercises.md](translation-exercises.md). Banding: [learning-levels.md](learning-levels.md#cross-doc-path). Example prose: [grammar-docs.md](grammar-docs.md). Grammar pages must **not** link here.

## Execute
<a id="execute"></a>

Run these steps in order. Stop if a step says stop.

### 1. Resolve the target

Parse the user’s file/band from their message. Accept `coordination`, `coordination.md`, `docs/grammar/coordination.md`. Optional band word: **Beginner** / **Intermediate** / **Advanced**.

| Target | Action |
|--------|--------|
| One grammar file, no band | Generate **every missing** checkpoint for that file (table below), **Beginner then Intermediate then Advanced** |
| One file + one band | Generate **only** that band’s checkpoint |
| Several files, “all pages”, or no file | **Do not start.** Reply with: process **one file per invocation**; list remaining [generate](#allowlist) files that still lack a checkpoint. Stop |
| A [skip](#skip) file | Say it is skipped and why. Stop |

Edit **only** `docs/grammar/<file>.md`. Do not edit this policy, other grammar pages, `AGENTS.md`, or other meta unless the user asked to change the policy.

If two agents might share a file: **one file → one agent**. Do not start a second job on a file that already has a drill job in flight.

### 2. Look up the checkpoint

Find the row(s) in the [allowlist](#allowlist).

| Status | Action |
|--------|--------|
| **skip** | Do not add a checkpoint. Continue to the next band if the target was the whole file |
| **exists** | Leave it unless the user said **replace**. Continue |
| **generate** | Add the checkpoint if the heading is missing. If `### Translation practice` already sits at the end of that band, treat as **exists** |

### 3. What you may read

**Allowed**

- This file (procedure, allowlist row, root bank, leak index)
- [translation-exercises.md](translation-exercises.md) (principles + template)
- [grammar-docs.md](grammar-docs.md#house-cast) (house people)
- [glosses.md](glosses.md#house-cast) (name glosses — not needed inside spoilers)
- **This band only** of the target file (`## Beginner` *or* `## Intermediate` *or* `## Advanced`) plus the page title / **Needs:** line
- Worked examples **inside that band** (they are the gold corpus)

**Do not open** later path files, later bands of this file, `data/lexicon-published.csv` for tourism, or `docs/examples/` for item ideas.

If this band’s own examples leak a later form (e.g. COMMENT + **`jom`** before core Intermediate), **do not copy the leak**. Use a legal recycle form instead.

### 4. Recycle vs introduce

Every word in every spoiler must be one of:

1. This row’s **Introduces** (most items must *test* these)
2. This row’s **Recycle** set ([how recycle is computed](#recycle))
3. A root from the [shared bank](#root-bank) **or** a root that already appears in this band’s worked examples
4. Closed punctuation / force already in recycle (`jol`, omitted **`jal`**, `.`)

If you cannot certify a token, drop the item. Do not guess from English.

**Must not use** (unless the row lists it under Introduces or Sibling OK):

- Any form whose [first-taught](#leak-index) checkpoint is **later** than this one
- Same-slot **sibling** Introduces ([slots](#slots))
- Optional-track forms (numbers Intermediate / Advanced, numeric-derivation) unless this row is on that track or lists them
- Dummy *I* / *you* (`zumogon` / `zehadon`) unless this page is teaching those specials
- Foreign `PoS<…>ENDING` unless this band is teaching loans / spans
- Intermediate / Advanced clause-force twins (`jam` / `jom` / `jem` / `jum`), **`gl-`**, sentence linkers, nested **`odo`**, unless recycle includes **core Intermediate**

### 5. Write the checkpoint

Place **`### Translation practice`** at the **end of the band**, immediately before the next `## Intermediate` / `## Advanced` / `## See also` / end of file. Do not insert after every H3. Do not add a second checkpoint in the same band unless the allowlist row says **split**.

Anchors:

| Band | Anchor |
|------|--------|
| Beginner | `<a id="translation-practice"></a>` |
| Intermediate | `<a id="translation-practice-intermediate"></a>` |
| Advanced | `<a id="translation-practice-advanced"></a>` |

Follow the [template](translation-exercises.md#template). Lead: *Short drills on this Beginner/Intermediate/Advanced band. Try each item before opening **Show answer**.* List **Roots used here** once (shared bank subset + this band’s extra roots).

| Band kind | Items per direction |
|-----------|---------------------|
| Beginner, productive | **6–8** |
| Intermediate, productive | **6–8** |
| Advanced, or a thin generate row | **4–6** |

Both directions. Spoilers = Agelan sentence or **loose** free English only — no morph-gloss lecture. Omit recoverable **`jal`**. House names in English prompts (*Azawan walks*). Close variants of **this band’s worked examples**; test the decision the band taught ([principles](translation-exercises.md#principles)).

### 6. Self-check, then lint

Run the [review checklist](#review) on your own spoilers. Then `npm run lint:md`. If lint fails, fix it in the same file (usually slash-joined emphasis: write `*a* / *b*`, not `*a*/*b*`).

Reply with: which checkpoints you added or skipped, and any item you dropped because a form was not in recycle.

## Recycle
<a id="recycle"></a>

Drills depend on **what has been taught**, not on other files’ drill text. Parallel file-agents are fine once this allowlist exists.

| This checkpoint | Recycle |
|-----------------|--------|
| **Beginner** at path *N* | All **Introduces** from **Beginner** rows with a **smaller** path number — except [same-slot siblings](#slots) |
| **Intermediate** at path *N* | All **Beginner** Introduces on the beginner path (productive pages), **plus** **Intermediate** Introduces with a **smaller** path number, except siblings and [optional tracks](#optional) |
| **Advanced** at path *N* | That Intermediate recycle, **plus** this file’s Intermediate Introduces, **plus** Advanced Introduces with a **smaller** path number, except siblings and optional tracks |

**Needs:** lines on the grammar page always add those forms to Recycle (comparatives Beginner → coordination Beginner rank joins; causation Beginner → coordination Beginner + core **`odo`**).

Honor [teach now; don’t preview later](grammar-docs.md#teach-now-dont-preview-later) inside Beginner: a Beginner checkpoint must not use that file’s Intermediate / Advanced, or a later peer’s Beginner.

### Same-slot siblings
<a id="slots"></a>

Path items joined with `·` are **co-located**, not ordered. Do **not** recycle a sibling’s **Introduces** unless the row’s **Sibling OK** column lists it (the page already teaches that contrast).

| Slot | Files |
|------|--------|
| 7 | `pronouns.md` · `plurality.md` |
| 11 | `revisers.md` · `restrictors.md` |
| 13 | `numbers.md` · `comparatives.md` · `causation.md` |
| 14 | `values.md` · `ability.md` · `commentary.md` · `roles.md` · `x-compounds.md` |

Later path numbers **may** recycle both siblings (e.g. coordination Beginner may use pronouns **and** plurality Beginner).

### Optional tracks
<a id="optional"></a>

Not required for a first dialogue corpus. Recycle them only on that track, or when **Needs:** / **Sibling OK** says so.

- `numbers.md` Intermediate / Advanced
- `numeric-derivation.md` (Advanced only)

## Skip
<a id="skip"></a>

No translation checkpoint (recognition, orientation, or no new productive stack):

| File | Why |
|------|-----|
| `why-agelan.md` | Orientation, not a learning band |
| `introduction.md` | Orientation |
| `index.md` | Site include of why-agelan |
| `lexicon.md` | Search UI, not syntax |
| `vowel-series.md` | Mnemonic map, not a new morph |
| `phonology.md` | Letter charts / singability — not Eng ↔ Agelan |
| `x-compounds.md` | Parser map of families taught on other pages |
| Advanced bands whose only H3s are **Design notes**, **Constraints**, **Out of scope**, **Boundaries**, or pointer inventories | Nothing to produce; see allowlist **skip** |

Do **not** skip productive syntax pages (core, coordination, questions, values, …). Thin **Advanced** on an otherwise productive page is skip; that page’s Beginner / Intermediate still generate.

## Shared root bank
<a id="root-bank"></a>

Default people: [house cast](grammar-docs.md#house-cast) — `zazawan` / `zulonun` / `zubuzun` (`azawa` / `ulonu` / `ubuzu` + **-n**). Morph: `z-grace` / `z-courage` / `z-beauty`.

Reuse this bank unless the band already taught a different published root. Do not mine the lexicon for variety.

| Root | Sense in drills |
|------|-----------------|
| `azawa` / `ulonu` / `ubuzu` | names **Azawan** / **Ulonun** / **Ubuzun** |
| `edage` | *teacher* |
| `uzedu` | *student* |
| `ogodo` | *dog* |
| `agada` | *cat* |
| `ogobo` | *book* |
| `ohuze` | *house* |
| `ulebu` | *blue* |
| `edeje` | *red* |
| `eleba` | *size* / *big* |
| `uze` | smile → *happy* (**-m**) |
| `awu` | *walk* |
| `urunu` | *run* |
| `ezele` | *sleep* |
| `ezabu` | *tell* |
| `uwa` | *write* |
| `egu` | *sing* |
| `ejo` | *see* |
| `ahura` | *sit* |
| `ada` | *haste* |
| `odo` | *next clause* |
| `urugu` | *because* (**-m** on `/h/`) |

A page may add roots that **already appear in that band’s worked examples** (e.g. `abeba` *apple*, `odeda` *tea*, `ogeve` *coffee*, `onuda` *challenging*, `oguno` **SAME**). List them under **Roots used here**.

## Allowlist
<a id="allowlist"></a>

Path numbers match [learning-levels.md](learning-levels.md#cross-doc-path). **Introduces** = what this checkpoint may *test*. Recycle is computed from path + slots, plus **Sibling OK**.

Status: **exists** = do not overwrite; **generate** = add if missing; **skip** = no checkpoint.

### Beginner path
<a id="allowlist-beginner"></a>

| Path | File | Status | Introduces (test these) | Sibling OK / notes |
|------|------|--------|-------------------------|--------------------|
| — | `why-agelan.md` | skip | — | orientation |
| — | `introduction.md` | skip | — | orientation |
| 3 | `core.md` | **exists** | PoS letters; SVO; `/ɡ/` after noun; `/w/`; `/h/`; complex `/ɡ|h/`+`/b/`; omit **`jal`**; **`jol` / `jel` / `jul`**; vocatives; **`jael`** as confirm tag; `/x/` continue vs `/j/` turn; **`odo` last**; adverbial subordinators (`hurugum` / `horodom` / `heluvem` / `hezabem` / `hegumum` / `hudemum` / `hagagam` / `hohuram` **`bodol`**); house names; **-l** / **-m** / **-n** as used in examples | Do not use **`gl-`**, **`jam`/`jom`/`jem`/`jum`**, nested **`odo`**, `/x/` linkers, letter **-r** mechanism, **-sh**, joins |
| 4 | `vowel-series.md` | skip | — | mnemonic only |
| 5 | `phonology.md` | skip | — | not translation |
| 6 | `reference-suffix.md` | generate | Choose **-l** vs **-m** vs **-n** vs **-r** on a content word; named person vs kind; citation prefix-less **…n** | Pointers to **-sh** / **`gl-`** / full **-r** algorithm: do **not** make those the item. One two-sentence resume item is enough if it matches the page example |
| 7 | `pronouns.md` | generate | Letter vs full-root **-r**; specials **`umogo` / `ehado` / `ana` / `enu`** (when the *role* is the point); **`odo`** recap; clusivity **`ana`** vs speaker **-sh** | **-sh** on specials / names for clusivity only. Default people still house names; specials only when testing specials |
| 7 | `plurality.md` | generate | Associative **-sh** (`-lsh` / `-nsh` / `-rsh`); not agreement; person-role **-sh** (address set vs name…**-sh**) | **`ana`** as the *not this* for inclusive *we*. **`umogo`/`ehado`** only on person-role items |
| 8 | `predication.md` | generate | Zero-copula property; classification `z… g…` vs role *noun* `zedagel`; identity **`gogunol` + `/b/`** | No general *to-be* `/v/`. Prefer house names + **SAME**; page-example roots (`odava` / `uzuba`) OK if already on the band |
| 9 | `coordination.md` | generate | Right-close fence; set vs rank vowels; **-l** vs **-m**; list / focus / bare starter forms; negation **`u`**; unspecified **-r** as *something* (not fill-ask) | No revisers, no restrictor `/h/` join readings, no comparatives SHARED scale as the point (that is comparatives) |
| 10 | `questions.md` | generate | **`jol`/`jom`** yes/no vs fill-ask (join **-r**); fill-all; polar **`jael` / `juel` / `jaol`** vs **`jul`** vs join **`zul`** | **`jom`** is taught here as soft *ask* — allowed on this page even though full force twins are core Intermediate. Circumstance *when?* **`har`** is Intermediate on this page — do not use |
| 11 | `revisers.md` | generate | Prefix-less **`al`/`am`/`ol`/`ul`** (and **e** / **n** as on the band); in-clause `A REV B`; discourse **`al`** *additionally* before a body | Not a join (`zam` vs `am`). Not **`x#e-` / `x#e`** (numbers discourse) |
| 11 | `restrictors.md` | generate | **`hal`/`ham`/`hual`/`huam`/`har`/`hor`/`hur`** (and `/w/` twins); *only when* vs co-manner *and*; bare *never* / *always* | Not sibling revisers. Not coordination **`zam`** as circumstance |
| 12 | `spans.md` | generate | Writing fences `[ ]` `{ }` `( )` `< >`; **`~`/`@`**; anaphor `d[=]`; PoS = outer slot; when a span is required vs nativized word | `<>` loans **allowed** (this band teaches them). Prefer atomic one-token cites |
| 13 | `numbers.md` | generate | `g+N` count; `g#N` ordinal; digitless **`g+`** (*more than one*) with **-sh** on the noun | No overlays, exponents, ranges, percent, measures (later). **-sh** from plurality is recycle |
| 13 | `comparatives.md` | generate | Rank fence **`e`/`oe`/`ue`** + SHARED scale `/ɡ/`; focus superlative; equative **`ae`** | **Needs:** coordination Beginner rank joins. No measure phrases (Intermediate). No numbers Intermediate |
| 13 | `causation.md` | generate | Sufficient = open inclusive (`…aom` / default pole habit); no cause-arrow word; outcome as host | **Needs:** coordination Beginner inclusive/exclusion + core **`odo`**. Necessary / **`IF` vs `IFF`** are Intermediate — do not use |
| 14 | `values.md` | generate | Six needs; `/h/` vs `/w/`; topic (bare); **`xa`** met + contact endings; **`xo`** prescription force; **`xu`** unmet changeability | **Not** motive **`xe`** (Intermediate). Not ability (non-need + `x` vowel). Not COMMENT |
| 14 | `ability.md` | generate | Host (non-need) + **`xa`/`xe`/`xo`/`xu`**; *can’t* grains vs *won’t* | Not values (need roots). Not role compounds (vowel *left* of `x`) |
| 14 | `commentary.md` | generate | **COMMENT** **`uho`** + hold endings (**`huhom`** default); not a world warrant | Not evidentiality / NOTIONAL (Intermediate). Not **`jom`** (core Intermediate) unless you only recycle **`jol`** from core/questions Beginner |
| 14 | `roles.md` | generate | Role compounds **`a`/`u`/`o` x ROOT`** (agent / patient / reltum); endings on the role word | Not viewpoint laterals (Intermediate). Not values/ability (vowel *right* of `x`). Not join-relations |
| 14 | `x-compounds.md` | skip | — | map only |

### Intermediate then Advanced
<a id="allowlist-later"></a>

Read **all** Beginner first, then Intermediate in the same file order, then Advanced ([path](learning-levels.md#cross-doc-path)). Pages with **no Beginner** slot start here.

| Path | File | Band | Status | Introduces (test these) | Notes |
|------|------|------|--------|-------------------------|-------|
| 3 | `core.md` | Intermediate | generate | **`jam`/`jom`/`jem`/`jum`**; **`gl-`**; adverb topic `/h/`+`/b/`; complex chaining; `/x/` linkers (`xamalal`, `xezabel`, …); nested **`odo`**; number-as-interjection pointer only if the band’s examples already show it | Do not require numbers Intermediate readings |
| 3 | `core.md` | Advanced | skip | weak-pause cues | recognition |
| 6 | `reference-suffix.md` | Intermediate | generate | **-n** on any PoS (titled verb/adjective/adverb); phrasal proper names `ROOTxROOT`+**-n** | Not value/ability/plan ending tables (Advanced pointers) |
| 6 | `reference-suffix.md` | Advanced | skip | ending tables owned by other pages | pointer inventory |
| 7 | `pronouns.md` | Intermediate | generate | English approximations of **-r**; `/x/`…`-r` thread resume vs `/h/` aboutness; **`ana`** vs name join vs name…**-sh** | |
| 7 | `pronouns.md` | Advanced | generate | Cross-role recast (one or two PoS flips, not the whole grid) | 4–6 items |
| 7 | `plurality.md` | Intermediate | generate | Associate-set resolution; verb event-sets; collective `/ɡ/`…**-sh**; vocative **-sh** | |
| 7 | `plurality.md` | Advanced | skip | unused / summary | |
| 8 | `predication.md` | Intermediate | generate | Classification packaging; **SAME** endings / soft identity | |
| 8 | `predication.md` | Advanced | skip | boundaries | |
| 9 | `coordination.md` | Intermediate | generate | Full focus/bare; rank joins as *the* stack if not already fluent; invert **`ua`/`uo`/`ue`**; universals/domains; SHARED after join; `^` islands; frame echo; fence nesting; clause soft **-n** (`xan`); VP/clause forms | Sample **decisions**, not every H3. 6–8 items |
| 9 | `coordination.md` | Advanced | generate | Named phrase **-n**; one rare-arity or reserved contrast from the band | 4–6 items |
| 10 | `questions.md` | Intermediate | generate | Fuller polar inventory; confirming a negative; fill-ask arity; circumstance **`har`**; yes/no with focus/bare; fill-ask answers | |
| 10 | `questions.md` | Advanced | generate | Polar contrasts; focus/bare inventory under question | 4–6 items |
| 11 | `revisers.md` | Intermediate | generate | Ending grids; parallel chains; discourse placements (before force, `/x/` continue/linker) | |
| 11 | `revisers.md` | Advanced | skip | more examples / reserved | |
| 11 | `restrictors.md` | Intermediate | generate | Defined core (full); conjuncts; next-clause *when* | |
| 11 | `restrictors.md` | Advanced | skip | undefined reserved cells | |
| 12 | `spans.md` | Intermediate | generate | Spoken open shape; TYPE; EDGE; endings; nesting; **`^ … ^`** adjunct islands | |
| 12 | `spans.md` | Advanced | generate | Close forms (`xuxul` / truncated / sic / close-all) | 4–6 items |
| 13 | `numbers.md` | Intermediate | generate | PoS on numbers; markers; endings; digitless; overlays `/v/` `/h/` `/j/` `/x/` as on the band; **one of** measure / range / percent / time if you can keep the item to that decision | **Optional track.** Do not dump the whole Intermediate. 6–8 items |
| 13 | `numbers.md` | Advanced | generate | Digitless exponents / hyperbole / zero×exp **as used in the band’s teach examples** — not unassigned TODO cells | Optional track. 4–6 items |
| 13 | `comparatives.md` | Intermediate | generate | Full comparative arity; distributive **`a`** + SHARED `/ɡ/`; measured differentials | Measured items **Sibling OK:** numbers Intermediate **measure phrases** only |
| 13 | `comparatives.md` | Advanced | generate | Judgment benchmarks (`zonugon`, `zaheman`, **`zumogoxrawon`** Mine vs performance **`zumogon`**, …) | **`umogo`** allowed on Mine/performance items |
| 13 | `causation.md` | Intermediate | generate | Necessary (marked); unique path; clause poles **`orodo` / `eluve` / `urugu`**; preference vs law (values stack if values Beginner is recycle — it is) | |
| 13 | `causation.md` | Advanced | generate | Factivity; evidential / mechanism / habit stacks as on the band | COMMENT/evidentiality are Beginner/Intermediate recycle by the time Advanced is read |
| 14 | `values.md` | Intermediate | generate | Motive **`xe`** + preference standing; which ending table; attachment sites | |
| 14 | `values.md` | Advanced | generate | Combined matrices; one boundary trap | 4–6 items |
| 14 | `ability.md` | Intermediate | generate | Hostless fallback **`egera`** (**ABIL**) | |
| 14 | `ability.md` | Advanced | skip | design notes | |
| 14 | `commentary.md` | Intermediate | generate | Evidentiality channels; **NOTIONAL** **`edahe`** + hold map; COMMENT vs nearby jobs | |
| 14 | `commentary.md` | Advanced | skip | design notes | |
| 14 | `roles.md` | Intermediate | generate | Viewpoint laterals **`DIR x ANCHOR`**; name/listener anchor; bare spatial illegal | Prefer `…xazawan` over silent speaker default. **`ehado`/`umogo`** only when testing role-anchor |
| 14 | `roles.md` | Advanced | skip | design notes | |
| 15 | `join-extras.md` | Intermediate | generate | Join-act verbs `van` / `von` / …; join-relations `gan` / `han` / … (unary `/b/`) | No Beginner slot. Recycle = all Beginner + earlier Intermediate (path before 15), except optional numbers unless needed |
| 15 | `plan-decision.md` | Intermediate | generate | **PLAN** **`owaro`** map-resolution endings vs **PREDICT** **`edelo`**; **DECISION** **`ehege`** changeability | Stack evidentiality on PREDICT only as the band shows |
| 15 | `plan-decision.md` | Advanced | skip | design notes | |
| 15 | `special-vocabulary.md` | Intermediate | generate | Emotion compose (ACT + LOCUS + a value); **CAUSE** **`erage`** **-m**; numbered alternatives `ubezu`/`egoge`/`ogalo` + `g#N` | Overlay *inventory* is not a drill. **Needs** values Beginner (recycle). Not universality (Advanced) |
| 15 | `special-vocabulary.md` | Advanced | generate | Universality warrant (`ewono` / `ululu` / …) as on the band | 4–6 items |
| 16 | `numeric-derivation.md` | Advanced | generate | `ROOT x NUM` as the band teaches (essence / `+N` / `#N` / quasi / …) — only assigned readings | **Optional track.** No **`ROOTx+e0`** / unassigned TODO cells. 4–6 items |

## Leak index
<a id="leak-index"></a>

First-taught checkpoint for forms agents leak most often. If this checkpoint’s path/band is **earlier**, the form is illegal.

| Form | First taught |
|------|----------------|
| House names, SVO, omit **`jal`**, **`jol`/`jel`/`jul`**, **`odo`**, *because* **`hurugum bodol`** | `core.md` Beginner |
| **`gl-`**, **`jam`/`jom`/`jem`/`jum`** as a *force* system, `/x/` linkers, nested **`odo`** | `core.md` Intermediate |
| **-l** / **-m** / **-n** / **-r** as a *choice* | `reference-suffix.md` Beginner (core already *uses* them) |
| Letter/full-root **-r** algorithm; **`umogo`/`ehado`/`ana`/`enu`** | `pronouns.md` Beginner |
| Associative **-sh** | `plurality.md` Beginner |
| **SAME** `gogunol` | `predication.md` Beginner |
| Phrase/VP/clause joins, **`zal`/`zam`/`zel`**, negation **`u`** | `coordination.md` Beginner |
| Fill-ask join **-r** (`zar` / `var` / `xar`); polar **`juel`/`jaol`** as the *system* | `questions.md` Beginner |
| Revisers **`al`/`ol`/`ul`** | `revisers.md` Beginner |
| **`hal`/`hual`/`har`** | `restrictors.md` Beginner |
| Span brackets / `<>` | `spans.md` Beginner |
| `g+N` / `g#N` / `g+` | `numbers.md` Beginner |
| SHARED scale comparatives | `comparatives.md` Beginner |
| Sufficient open-inclusive causation | `causation.md` Beginner |
| Value **`xa`/`xo`/`xu`** on **need** roots | `values.md` Beginner |
| Ability **`xa`/`xe`/`xo`/`xu`** on **non-need** hosts | `ability.md` Beginner |
| **COMMENT** **`huhom`** | `commentary.md` Beginner |
| Role **`ax`/`ux`/`ox` ROOT** | `roles.md` Beginner |
| Motive **`xe`** (values) | `values.md` Intermediate |
| Evidentiality / NOTIONAL | `commentary.md` Intermediate |
| Viewpoint laterals | `roles.md` Intermediate |
| Measure phrases / ranges / percent | `numbers.md` Intermediate |
| Join-act **`van`** / join-relation **`gan`** | `join-extras.md` Intermediate |
| **PLAN** / **PREDICT** / **DECISION** | `plan-decision.md` Intermediate |
| Emotion compose; **CAUSE** **`erage`**; numbered alternatives | `special-vocabulary.md` Intermediate |
| Judgment **Mine** **`zumogoxrawon`** | `comparatives.md` Advanced |
| `ROOT x NUM` derivation | `numeric-derivation.md` Advanced |
| Universality overlays | `special-vocabulary.md` Advanced |

**`jol`** yes/no with a house-name subject is core Beginner. **`jol zar …`** fill-ask is questions Beginner (needs coordination unspecified **-r**).

## Review
<a id="review"></a>

Use this after generating, or when asked only to review a file’s drills.

For each spoiler token family:

1. Find it in **Introduces**, **Recycle**, [root bank](#root-bank), or this band’s examples. Else **fail**.
2. Check [leak index](#leak-index): first-taught later than this checkpoint → **fail**.
3. Same-slot sibling novelty not in **Sibling OK** → **fail**.
4. English *I* / *you* as dummy people → **fail** (unless this band teaches **`umogo`/`ehado`**).
5. Most items test **this** band’s decision, not a prior quiz → else rewrite.
6. Morph-gloss wall inside the spoiler → **fail**.
7. Unassigned number/derivation cells from `TODO.md` → **fail**.

## Related meta

| Page | Owns |
|------|------|
| [translation-exercises.md](translation-exercises.md) | Placement, principles, spoiler template |
| [learning-levels.md](learning-levels.md) | Bands and cross-doc path |
| [grammar-docs.md](grammar-docs.md) | Learner prose, house cast |
| [glosses.md](glosses.md) | Morph / free English (teaching lines, not spoilers) |
