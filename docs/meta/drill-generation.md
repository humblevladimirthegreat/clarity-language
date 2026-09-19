# Generate translation drills

Executable editor policy: add end-of-stage Eng ↔ Agalan checkpoints to learner grammar pages without using **morphology** the learner has not been taught. Checkpoint **content** roots follow the [setting](translation-exercises.md#checkpoint-setting).

**How to invoke.** Point here and name a grammar file (or one stage). No extra prompt is required:

- *Execute [drill-generation.md](drill-generation.md) to generate the drills for `joins.md`.*
- *… for `docs/grammar/questions.md` Intermediate.*
- *… for core Beginner* (already exists — skip unless asked to replace).

This page owns **path allowlist**, **[settings](#settings) inventory**, **example root bank**, and **generation procedure**. Drill *shape* (spoiler template, house names, [checkpoint setting](translation-exercises.md#checkpoint-setting), item counts) stays in [translation-exercises.md](translation-exercises.md). Stages: [learning-levels.md](learning-levels.md#cross-doc-path). Example prose: [grammar-docs.md](grammar-docs.md). Grammar pages must **not** link here.

## Execute
<a id="execute"></a>

Run these steps in order. Stop if a step says stop.

### 1. Resolve the target

Parse the user’s file/stage from their message. Accept `joins`, `joins.md`, `docs/grammar/joins.md`. Optional stage word: **Beginner** / **Intermediate** / **Advanced**.

| Target | Action |
|--------|--------|
| One grammar file, no stage | Generate **every missing** checkpoint for that file (table below), **Beginner then Intermediate then Advanced** |
| One file + one stage | Generate **only** that stage’s checkpoint |
| Several files, “all pages”, or no file | **Do not start.** Reply with: process **one file per invocation**; list remaining [generate](#allowlist) files that still lack a checkpoint. Stop |
| A file whose [allowlist](#allowlist) rows are all **skip** | Say it is skipped and why. Stop |

Edit **only** `docs/grammar/<file>.md` **and** that file’s **Setting** cell(s) in [settings](#settings). Do not edit other policy, other grammar pages, `AGENTS.md`, or other meta unless the user asked to change the policy.

If two agents might share a file: **one file → one agent**. Do not start a second job on a file that already has a drill job in flight.

### 2. Look up the checkpoint

Find the row(s) in the [allowlist](#allowlist).

| Status | Action |
|--------|--------|
| **skip** | Do not add a checkpoint. Continue to the next stage if the target was the whole file |
| **exists** | Leave it unless the user said **replace**. Continue |
| **generate** | Add the checkpoint if the heading is missing. If `### Translation practice` already sits at the end of that stage, treat as **exists** |

### 3. What you may read

**Allowed**

- This file (procedure, allowlist row, [settings](#settings) inventory, example root bank, leak index)
- [translation-exercises.md](translation-exercises.md) (principles, [checkpoint setting](translation-exercises.md#checkpoint-setting), template)
- [grammar-docs.md](grammar-docs.md#house-cast) (house people)
- [glosses.md](glosses.md#house-cast) (name glosses — not needed inside spoilers)
- **This stage only** of the target file (`## Beginner` *or* `## Intermediate` *or* `## Advanced`) plus the page title / **Needs:** line
- Worked examples **inside that stage** (gold corpus for **morph** packaging, not for checkpoint verbs)
- `data/lexicon-published.csv` (and overlays / compounds CSVs) **only** to certify a setting English gloss has a published stem

**Do not open** later path files, later stages of this file, or `docs/examples/` for item ideas. Do not browse the lexicon for roots the items will not use.

If this stage’s own examples leak a later form (e.g. MAY + **`jom`** before core Intermediate), **do not copy the leak**. Use a legal recycle form instead.

### 4. Recycle vs introduce

Every **morph** (role letter, ending, closed special, join vowel, speech act, …) in every spoiler must be one of:

1. This row’s **Introduces** (most items must *test* these)
2. This row’s **Recycle** set ([how recycle is computed](#recycle))
3. A closed punctuation / speech act already in recycle (`jol`, omitted **`jal`**, `.`)

Every **content** root must be:

1. A house-cast name, **or**
2. A published stem (lexicon / overlay / compound lemma) whose English in the item matches that row, listed in **Roots used here**, **or**
3. A root that already appears in this stage’s worked examples (optional; do not prefer example-bank *walk* / *sleep* as the checkpoint action)

If you cannot certify a token, drop the item. Do not guess from English. Do not invent stems.

**Must not use** (unless the row lists it under Introduces or Sibling OK):

- Any **morph** whose [first-taught](#leak-index) checkpoint is **later** than this one
- Same-slot **sibling** Introduces ([slots](#slots))
- Dummy *I* / *you* (`zugobon` / `zedonen`) unless this page is teaching those specials
- Foreign `PoS<…>ENDING` unless this stage is teaching loans / spans
- Intermediate / Advanced speech-act twins (`jam` / `jom` / `jem` / `jum`), **`gl-`**, sentence linkers, nested **`barl`**, unless recycle includes **core Intermediate**

### 5. Write the checkpoint

Place **`### Translation practice`** at the **end of the stage**, immediately before the next `## Intermediate` / `## Advanced` / `## See also` / end of file. Do not insert after every H3. Do not add a second checkpoint in the same stage unless the allowlist row says **split**.

Anchors:

| Band | Anchor |
|------|--------|
| Beginner | `<a id="translation-practice"></a>` |
| Intermediate | `<a id="translation-practice-intermediate"></a>` |
| Advanced | `<a id="translation-practice-advanced"></a>` |

Follow the [template](translation-exercises.md#template). Lead: *Short drills for Beginner/Intermediate/Advanced. Try each item before opening **Show answer**.* Next line: **Setting:** one place or occasion. Put **Roots used here** once as the English / Agalan table for **this setting** (house names + setting content), using that template’s caption (later banks do not repeat the How-to-learn column legend; **Same root as** warning only when that column is present). Learner **Agalan** cells are [citations](translation-exercises.md#template) by default (`odogol`, not a bank stem `odogo`), or the inflected form the row teaches (`vejel` *see*). House-person **English** is *Azawan* / *Ululon* / *Uhubun*, not `*grace* (name **Azawan**)`. Pick a setting **not already named** in [settings](#settings) ([unique globally](translation-exercises.md#checkpoint-setting)); write the same phrase into this file’s cell when you replace. Teaching examples stay on the [example root bank](#root-bank); do not rewrite them to match the drill. Numbered items in each direction **climb in tension**.

| Band kind | Items per direction |
|-----------|---------------------|
| Beginner, productive | **6–8** |
| Intermediate, productive | **6–8** |
| Advanced, or a thin generate row | **4–6** |

Both directions. Spoilers = Agalan or **loose** free English plus a visible morph line in the spoiler ([translation-exercises.md](translation-exercises.md#template)). Omit recoverable **`jal`**. House names in English prompts (*Azawan waits*). Test the decision this stage taught; package it in the setting, not as a clone of the walk/sleep teach line ([principles](translation-exercises.md#principles)).

### 6. Self-check, then lint

Run the [review checklist](#review) on your own spoilers. Then `npm run docs:build` **only when this invocation is a parent editor finishing a batch** — file-scoped rewrite agents **do not** run the build. If it fails, fix it in the same file (usually slash-joined emphasis: write `*a* / *b*`, not `*a*/*b*`).

Reply with: which checkpoints you added or skipped, and any item you dropped because a form was not in recycle.

## Recycle
<a id="recycle"></a>

Drills depend on **what has been taught**, not on other files’ drill text. Parallel file-agents are fine once this allowlist exists.

| This checkpoint | Recycle |
|-----------------|--------|
| **Beginner** at path *N* | All **Introduces** from **Beginner** rows with a **smaller** path number — except [same-slot siblings](#slots) |
| **Intermediate** at path *N* | All **Beginner** Introduces on the beginner path (productive pages), **plus** **Intermediate** Introduces with a **smaller** path number, except [same-slot siblings](#slots) |
| **Advanced** at path *N* | That Intermediate recycle, **plus** this file’s Intermediate Introduces, **plus** Advanced Introduces with a **smaller** path number, except siblings |

**Needs:** lines on the grammar page always add those forms to Recycle (comparatives Beginner → joins Beginner rank joins; causation Beginner → core extra nouns + **`darl`**).

Honor [teach now; don’t preview later](grammar-docs.md#teach-now-dont-preview-later) inside Beginner: a Beginner checkpoint must not use that file’s Intermediate / Advanced, or a later peer’s Beginner.

### Same-slot siblings
<a id="slots"></a>

Path items joined with `·` are **co-located**, not ordered. Do **not** recycle a sibling’s **Introduces** unless the row’s **Sibling OK** column lists it (the page already teaches that contrast).

| Slot | Files |
|------|--------|
| 7 | `pronouns.md` · `plurality.md` |
| 12 | `hooks.md` · `restrictors.md` |
| 15 | `numbers.md` · `numbers-applied.md` · `comparatives.md` · `causation.md` |
| 16 | `values.md` · `ability.md` · `knowing.md` · `roles.md` · `x-compounds.md` · `intention.md` |

Later path numbers **may** recycle both siblings (e.g. joins Beginner may use pronouns **and** plurality Beginner).

## Settings
<a id="settings"></a>
<a id="skip"></a>

Inventory of **Setting:** phrases. Uniqueness is **global**: no two checkpoint rows may share a named setting (same occasion under a different article or synonym counts). **unset** = checkpoint exists, not yet replaced onto the setting policy. **—** = allowlist **skip** (no checkpoint; does not occupy a name).

When you **replace** a checkpoint, pick a phrase unused in the **Setting** column, put it on the grammar page, and update that cell here. House names are not a setting.

Which stages get a checkpoint at all is the [allowlist](#allowlist) (**skip** / **exists** / **generate**), not this table. Thin **Advanced** that is only Design notes / Constraints / Out of scope / Boundaries stays **skip** on the allowlist.

| File | Band | Setting |
|------|------|---------|
| `why-agelan.md` | — | — |
| `introduction.md` | — | — |
| `index.md` | — | — |
| `lexicon.md` | — | — |
| `phonology.md` | — | — |
| `reference-suffix.md` | Beginner | a classroom |
| `reference-suffix.md` | Intermediate | a hospital ward |
| `clause.md` | Beginner | a bank |
| `clause.md` | Intermediate | a waiting room |
| `clause.md` | Advanced | a circus |
| `dependents.md` | Beginner | a guard post |
| `dependents.md` | Intermediate | a departure board |
| `relations.md` | Beginner | a tool crib |
| `relations.md` | Intermediate | a train platform |
| `relations.md` | Advanced | a records room |
| `pronouns.md` | Beginner | a kitchen |
| `pronouns.md` | Intermediate | a rooftop garden |
| `pronouns.md` | Advanced | a radio booth |
| `plurality.md` | Beginner | a picnic |
| `plurality.md` | Intermediate | a choir loft |
| `predication.md` | Beginner | a passport office |
| `predication.md` | Intermediate | a museum gallery |
| `vowel-series.md` | — | — |
| `joins.md` | Beginner | a market stall |
| `joins.md` | Intermediate | a wedding |
| `joins.md` | Advanced | a treaty table |
| `questions.md` | Beginner | a lost-and-found |
| `questions.md` | Intermediate | a detective interview |
| `questions.md` | Advanced | a quiz show |
| `hooks.md` | Beginner | a restaurant pass |
| `hooks.md` | Intermediate | a newsroom |
| `hooks.md` | Advanced | a ferry slip |
| `restrictors.md` | Beginner | a swimming pool |
| `restrictors.md` | Intermediate | a mountain trail |
| `spans.md` | Beginner | a rehearsal |
| `spans.md` | Intermediate | a courtroom |
| `spans.md` | Advanced | a code review |
| `numbers.md` | Beginner | a bakery |
| `numbers.md` | Intermediate | a sports stadium |
| `numbers.md` | Advanced | an observatory |
| `numbers-applied.md` | Intermediate | a pharmacy |
| `comparatives.md` | Beginner | a racetrack |
| `comparatives.md` | Intermediate | a weighing room |
| `comparatives.md` | Advanced | a talent contest |
| `causation.md` | Beginner | a greenhouse |
| `causation.md` | Intermediate | a dam control room |
| `causation.md` | Advanced | a chemistry lab |
| `values.md` | Beginner | a shelter tent |
| `values.md` | Intermediate | a monastery |
| `values.md` | Advanced | unset |
| `ability.md` | Beginner | a climbing wall |
| `ability.md` | Intermediate | a locked vault |
| `knowing.md` | Beginner | a café patio |
| `knowing.md` | Intermediate | a press conference |
| `knowing.md` | Advanced | a film archive |
| `roles.md` | Beginner | a construction site |
| `roles.md` | Intermediate | a harbor |
| `x-compounds.md` | Beginner | a hardware store |
| `x-compounds.md` | Intermediate | a front porch |
| `x-compounds.md` | Advanced | unset |
| `intention.md` | Beginner | a chess club |
| `intention.md` | Intermediate | a board meeting |
| `intention.md` | Advanced | a delayed departure board |
| `join-extras.md` | Intermediate | a relay race |
| `special-vocabulary.md` | Intermediate | a festival |
| `special-vocabulary.md` | Advanced | a philosophy seminar |
| `numeric-derivation.md` | Advanced | a foundry |

## Example root bank
<a id="root-bank"></a>

Default people: [house cast](grammar-docs.md#house-cast) — `zazawan` / `zululon` / `zuhubun` (`azawa` / `ululo` / `uhubu` + **-n**). Morph: `z-Azawan` / `z-Ululon` / `z-Uhubun`.

**This table is for worked examples** on grammar pages (and for morph leak checks when a teach line uses these stems). **Checkpoints do not default to it.** Checkpoint content comes from the [setting](translation-exercises.md#checkpoint-setting) plus house names.

Tokens here are **stems for matching** (path allowlist / leak checks). Learner **Roots used here** cells on a checkpoint use [citations or the inflected form the row teaches](grammar-docs.md#citation-in-tables). Do not copy `(**-m**)` from this **Sense** column into learner **English**. Checkpoint **English** is the uninflected published lemma for that cell (literal, metaphor, or packed role English); inflected drill prompts (*running*) are fine. When English is not the citation kind, the Agalan cell is the in-clause word: *see* → `vejel` / `` `ejel` *eye* ``; *sit* → `vajul` / `` `ajul` *chair* ``; *tell* → `vezehel` / `` `ezehel` *speech* ``; *therefore* → `xezazal` / `` `ezazal` *east* ``; *however* → `xezebal`; *although* → `hezebam` (NP *despite* is the same `/h/` word + `/b/` noun); *so-that* → `holalam` (NP intended *for* is the same `/h/` word + `/b/` noun); *meanwhile* → `xanelol`; *haste* → `hadazam` / `` `adazal` *dash* ``; *quietude* → `howom`; *volume* → `wegelom`; *topic* → `hozal`. *because* / *inside* already list the `/h/` word (`hurugum`, `hogorem`). Do not inflect a row whose English is still the citation kind (`*dog*` stays `odogol`; *next clause* stays `adorol`).

| Root | Sense in examples |
|------|-------------------|
| `azawa` / `ululo` / `uhubu` | names **Azawan** / **Ululon** / **Uhubun** |
| `odogo` | *dog* |
| `agada` | *cat* |
| `abogo` | *book* |
| `ohohu` | *house* |
| `ogore` | *inclusion* / *inside* (**-m**) |
| `elulu` | *blue* |
| `arede` | *red* |
| `ele` | *size* / *big* |
| `uzumu` | smile → *happy* (**-m**) |
| `awala` | *walk* |
| `urunu` | *run* |
| `elebe` | *sleep* |
| `ezehe` | *tell* (`vezehel`; citation *speech*) |
| `uwuru` | *write* |
| `uzunu` | *sing* |
| `eje` | *see* (`vejel`; citation *eye*) |
| `aju` | *sit* (`vajul`; citation *chair*) |
| `adaza` | *haste* (`hadazam`; citation *dash*) |
| `darl` | *that-clause* |
| `urugu` | *because* (**-m** on `/h/` `/ɡ/`) |
| `ebero` | *only if* (**-m** on `/h/` `/ɡ/`) |

A teach line may add roots that already appear in that stage’s worked examples (e.g. `abele` *apple*, `adeda` *tea*, `ogove` *coffee`, `omonu` *challenging*, `onunu` **SAME**). Checkpoint tables list **setting** roots instead, even when a teach line used *walk*.

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
| 3 | `phonology.md` | skip | — | not translation |
| 4 | `reference-suffix.md` | **exists** | Choose **-l** vs **-m** vs **-n** on a **citation** (prefix-less); named person vs kind vs metaphor; **greeting** named citation with period (`azawan.`) | No sentences with role letters. No **-r**. Pointers to **-x** / **`gl-`**: do **not** make those the item. No vocative `/j/` |
| 5 | `clause.md` | **exists** | PoS letters; SVO; `/ɡ/` after noun; `/w/`; `/h/`; hosted `/ɡ|h/`+`/b/` (*like*); unhosted `/b/` recipient/addressee; omit **`jal`**; **`jol` / `jel` / `jul`**; **vocative** `/j/` + house name (`jululon`); house names; **-l** / **-m** / **-n** as used in examples | Do not use **`gl-`**, **`jam`/`jom`/`jem`/`jum`**, **`darl`**, `/x/`, nested **`barl`**, letter **-r** mechanism, **-x**, joins. Polar **`jael` / `juel`** is questions, not this stage. Greeting citations are reference-suffix, not this stage. No greeting-bid **`x`** vowel |
| 6 | `dependents.md` | **exists** | Two-sentence *who / that / which*; **`darl` last**; adverbial subordinators (`hurugum` / `hadorom` / `hezazem` / `hezebam` / `hegemum` / `hudumem` / `hababam` / `helabam` / `holalam` **`barl`**; *despite* = **`hezebam`** + `/b/` noun); `/x/` continue vs `/j/` turn; `/x/` linker may start the next written sentence after `.` | Do not use nested **`barl`**, letter **-r** mechanism. Recycle clause speech-act **`jol`/`jel`/`jul`** |
| 13 | `relations.md` | **exists** | Hosted pair for simile **`hurorom`**, exchange **`huhanem`**, proxy **`hudagam`** | Recycle clause hosted `/b/` and hooks extra-noun. No *between*, no of-relations, no **`barl`**. Not **`hahanam`** |
| 7 | `pronouns.md` | **exists** | Letter vs full-root **-r**; specials **`ugobo` / `edone` / `aha` / `enenu`** (when the *role* is the point); inclusive *we* **`aha`** | Do **not** test associative **-x** here (plurality Beginner). Default people still house names; specials only when testing specials |
| 7 | `plurality.md` | **exists** | Associative **-x** (`-lx` / `-nx` / `-rx`); not agreement; person-role **-x** (address set vs name…**-x**) | **`aha`** as the *not this* for inclusive *we*. **`ugobo`/`edone`** only on person-role items |
| 8 | `predication.md` | **exists** | Classification `z… g…` vs kind *noun* `zodogol`; identity **`gonunul` + `/b/`** | No general *to-be* `/v/`. Prefer house names + **SAME**; page-example roots (`odava` / `uzuba`) OK if already taught in this stage |
| 9 | `vowel-series.md` | skip | — | mnemonic only |
| 10 | `joins.md` | **exists** | Right-close fence; set vs rank vowels; **-l** vs **-m**; list / single-item / standalone starter forms; negation **`u`**; unspecified **-r** as *something* (not fill-ask) | No hooks, no restrictor `/h/` join readings, no comparatives SHARED scale as the point (that is comparatives) |
| 11 | `questions.md` | **exists** | **`jol`/`jom`** yes/no vs fill-ask (join **-r**); fill-all; polar **`jael` / `juel` / `jaol`** vs **`jul`** vs join **`zul`** | **`jom`** is taught here as soft *ask* — allowed on this page even though full speech-act twins are core Intermediate. Circumstance *when?* **`har`** is Intermediate on this page — do not use |
| 12 | `hooks.md` | **exists** | Prefix-less **hooks** (**`al`/`am`/`ol`/`ul`/`el`**); in-clause `A HOOK B`; discourse **`al`** *additionally*; extra-noun **`al`/`ol`/`ul`/`el`** + `/b/` (**in** / **at** / **from** / **for**) | Not a join (`zam` vs `am`). Not stacked extra-noun (`aol` / `ael`). Not **`x#e-` / `x#e`**
| 12 | `restrictors.md` | **exists** | **`hal`/`ham`/`hual`/`huam`/`har`/`hor`/`hur`** (and `/w/` twins); *only when* vs co-manner *and*; bare *never* / *always* | Not sibling hooks. Not join **`zam`** as a restrictor |
| 14 | `spans.md` | **exists** | Writing fences `[ ]` `{ }` `( )` `< >`; **`~`/`@`**; resume `d[=]`; PoS = outer slot; **aside** = `h(…)`; interior fragment or same-speech-act clause; when a span is required vs nativized word | `<>` loans **allowed** (this stage teaches them). Prefer atomic one-token cites |
| 15 | `numbers.md` | **exists** | `g+N` count; `g#N` ordinal; digitless **`g+`** (*more than one*) with **-x** on the noun | No `/v/` `/h/` `/j/` `/x/` number uses, exponents, ranges, percent, measures (later). **-x** from plurality is recycle |
| 15 | `comparatives.md` | **exists** | Rank fence **`e`/`oe`/`ue`** + SHARED scale `/ɡ/`; single-item superlative; equative **`ae`** | **Needs:** joins Beginner rank joins. No measure phrases (Intermediate). No numbers Intermediate |
| 15 | `causation.md` | **exists** | Two-place poles: outcome host + `/b/` condition; `/h/` event vs `/ɡ/` noun; *if* **`adoro`** vs *only if* **`ebero`**; no cause-arrow word | **Needs:** core extra nouns + dependents **`darl`**. *Because* / **`IFF`** / **CAUSE** are Intermediate — do not use |
| 16 | `values.md` | **exists** | Six needs; `/ɡ/` on a belonging vs `/h/` on the clause; **`xa`** met + contact **-l / -m / -r**; **`xu`** unmet changeability; unowned **`gobobum`** + `/w/` need | **Not** prescription **`xe`** or motive **`xo`** (Intermediate). Not ability (non-need + `x` vowel). Not MAY. Not bare need-as-topic |
| 16 | `ability.md` | **exists** | Host (non-need) + **`xa`/`xe`/`xo`/`xu`**; *can’t* grains vs *won’t* | Not values (need roots). Not role compounds (vowel *left* of `x`). Not greeting bid (named citation or `/j/`) |
| 16 | `knowing.md` | **exists** | **MAY** **`odoho`** + 2a holds (**`hodohom`** default; **-l** find out; **-r** who knows) | Not evidentiality / NOTIONAL (Intermediate). Not **`jom`** (core Intermediate) unless you only recycle **`jol`** from core/questions Beginner |
| 16 | `roles.md` | **exists** | Role compounds **`a`/`e`/`u`/`o` x ROOT`** (agent / place / patient / recipient; **`o`** = reltum on a relation); endings on the role word | Not viewpoint laterals (Intermediate). Not values/ability (vowel *right* of `x`). Not join-relations |
| 16 | `x-compounds.md` | **exists** | Productive **`x`** vs two words vs dictionary compound; look up listed stems (`abedelohohu` / `onogolebere`); do not coin them. Live **`x`** from parts (not a pre-joined bank row) | Not parser-family inventory as drills; not coining new dictionary compounds. Greeting bid is Intermediate |
| 16 | `intention.md` | **exists** | **PLAN** **`emaba`** map-resolution endings vs **PREDICT** **`elezo`** (bare) | Not **DECISION** (Intermediate). Not evidentiality stacked on PREDICT (Intermediate). Sibling MAY / values / ability unused unless the page contrast needs them |

### Intermediate then Advanced
<a id="allowlist-later"></a>

Read **all** Beginner first, then Intermediate in the same file order, then Advanced ([path](learning-levels.md#cross-doc-path)). Pages with **no Beginner** slot start here.

| Path | File | Band | Status | Introduces (test these) | Notes |
|------|------|------|--------|-------------------------|-------|
| 5 | `clause.md` | Intermediate | **exists** | **`jam`/`jom`/`jem`/`jum`**; **`gl-`**; adverb topic `/h/`+`/b/`; complex chaining; number-as-interjection pointer only if the stage’s examples already show it | Do not require numbers Intermediate readings |
| 5 | `clause.md` | Advanced | **exists** | Leftmost content-word prominence; English cleft / *what*-cleft / fronted adverb | 4–6 items. Weak-pause cues are recognition, not the drill |
| 6 | `dependents.md` | Intermediate | **exists** | `/x/` linkers (`xezazal`, `xezebal`, …); nested **`barl`**; stand-in vowels; which-noun with resume | Recycle Beginner **`darl`/`barl`** |
| 13 | `relations.md` | Intermediate | **exists** | *between* **`hazanum`**; of-relations (`gobonem`, `gajaram`, `gowodom`, `gugunom`); recycle extra-noun hooks for other place talk | *Between* recycles joins Beginner `/b/` join |
| 13 | `relations.md` | Advanced | **exists** | Hosted *as-of* **`helerem` / `hobomam`**; `/h/` `/ɡ/` `/w/`; resume **-r**; date in `/b/` | Recycle RESIDUE, PREDICT, calendar `b_#…`. Not persist hooks |
| 4 | `reference-suffix.md` | Intermediate | **exists** | **-n** on any PoS (titled verb/adjective/adverb); phrasal proper names `ROOTxROOT`+**-n**; office **handles** as first-mention **-n** | Not value/ability/plan ending tables |
| 4 | `reference-suffix.md` | Advanced | skip | — | no Advanced stage |
| 9 | `pronouns.md` | Intermediate | **exists** | English approximations of **-r**; `/x/`…`-r` thread resume vs `/h/` aboutness; **`aha`** vs name join vs name…**-x** | |
| 9 | `pronouns.md` | Advanced | **exists** | Cross-role recast (one or two PoS flips, not the whole grid) | 4–6 items |
| 9 | `plurality.md` | Intermediate | **exists** | Associate resolution; verb collective; collective `/ɡ/`…**-x**; vocative **-x** | |
| 9 | `plurality.md` | Advanced | — | no Advanced stage | |
| 10 | `predication.md` | Intermediate | **exists** | Classification packaging; **SAME** endings / open **-m** | |
| 10 | `predication.md` | Advanced | skip | boundaries | |
| 11 | `joins.md` | Intermediate | **exists** | Full single-item/standalone; rank joins as *the* stack if not already fluent; invert **`ua`/`uo`/`ue`**; universals/domains; SHARED after join; `^` islands; fence nesting; clause **sequence** (`xan`); VP/clause forms | Sample **decisions**, not every H3. 6–8 items |
| 11 | `joins.md` | Advanced | **exists** | Named phrase **-n**; one rare-arity or reserved contrast from this stage | 4–6 items |
| 12 | `questions.md` | Intermediate | **exists** | Fuller polar inventory; confirming a negative; fill-ask arity; occasion **`har`**; yes/no with single-item/standalone; fill-ask answers | |
| 12 | `questions.md` | Advanced | **exists** | Polar contrasts; single-item/standalone inventory under question | 4–6 items |
| 12 | `hooks.md` | Intermediate | **exists** | Ending grids; parallel chains; discourse placements; extra-noun stacks (`aol` / `oel` / `ual` / `uol` / `ael` / `uel`) and extra-noun **-m** | |
| 12 | `hooks.md` | Advanced | **exists** | Extra-noun **hook compounds** (citation keeps **-l** / **-m**, then the extra-noun hook; lemma is the citation; `/d/` landmark) | Recycle extra-noun grid. Not same-role *including*. Not two-word `vawalal ul …` |
| 13 | `restrictors.md` | Intermediate | **exists** | Defined core (full); conjuncts; dependent *when* | |
| 13 | `restrictors.md` | Advanced | — | no Advanced stage | |
| 14 | `spans.md` | Intermediate | **exists** | Spoken open shape; TYPE; EDGE; endings; nesting; **`^ … ^`** scope islands; mention of a handle **form** vs office **-n** | |
| 14 | `spans.md` | Advanced | **exists** | Close forms (`xuxul` / editorial / close-all) | 4–6 items |
| 15 | `numbers.md` | Intermediate | **exists** | PoS on numbers; markers; endings; digitless; number as verb / adverb / interjection / discourse as taught in this stage; **one of** measure / range / percent / time if you can keep the item to that decision (those topics live in **`numbers-applied.md`**) | Do not dump the whole Intermediate. 6–8 items |
| 15 | `numbers-applied.md` | Intermediate | **exists** | Digit-string labels; clock / calendar time; percent vs points; measure phrases; ranges — as taught in this stage | One topic per item. 4–8 items |
| 15 | `numbers.md` | Advanced | **exists** | Digitless exponents / hyperbole / zero×exp **as used in the stage’s teach examples** — not unassigned cells | 4–6 items |
| 15 | `comparatives.md` | Intermediate | **exists** | Full comparative arity; manner `/h/` immediately after the join; distributive **`a`** + SHARED `/ɡ/`; measured differentials | Measured items **Sibling OK:** numbers Intermediate **measure phrases** only |
| 15 | `comparatives.md` | Advanced | **exists** | Judgment benchmarks (`zonunan`, `zahaman`, **`zuroron`** Mine vs performance **`zugobon`**, **`zoloben`** Everyone, …); `/w/` *as-of* on a shared scale | **`ugobo`** allowed on performance items. Recycle relations Advanced *as-of* |
| 15 | `causation.md` | Intermediate | **exists** | Following-sentence **`barl`**; **`urugu`** *because* / **`ezaze`** *iff*; asserted necessary **`heberom hurugum`**; **CAUSE** **`egega`** **-m** | Recycle Beginner *if* / *only if* and `/h/` vs `/ɡ/` |
| 15 | `causation.md` | Advanced | **exists** | Factivity; `hadorom` vs bookmark *as-of* `hobomam`; evidential / CAUSE / habit stacks as taught in this stage | MAY/evidentiality and relations Advanced *as-of* are recycle |
| 16 | `values.md` | Intermediate | **exists** | Prescription **`xe`** + force; motive **`xo`** + preference standing; which ending table; attachment sites | |
| 16 | `values.md` | Advanced | **exists** | Combined matrices; one boundary trap | 4–6 items |
| 16 | `ability.md` | Intermediate | **exists** | Hostless fallback **`egera`** (**ABIL**) | |
| 16 | `ability.md` | Advanced | — | no Advanced stage | |
| 16 | `knowing.md` | Intermediate | **exists** | Evidentiality channels; **NOTIONAL** **`adade`** + play holds; **RESIDUE** / **FORMER**; MAY vs nearby jobs | |
| 16 | `knowing.md` | Advanced | **exists** | RESIDUE / FORMER / LIVE / WITNESSED against *as-of*; MAY unshifted | Recycle relations Advanced |
| 16 | `roles.md` | Intermediate | **exists** | Viewpoint laterals **`DIR x ANCHOR`**; bare arrow roots = compass; gravity **`uba`/`odowo`**; name/listener anchor | Prefer `…xazawan` over silent speaker default. **`edone`/`ugobo`** only when testing role-anchor. Include at least one bare cardinal and one gravity item |
| 16 | `x-compounds.md` | Intermediate | **exists** | Greeting bid name **`x`** **`a`/`o`/`e`/`u`** + **-n** on a citation or vocative (presence / one ask / *a few minutes* / passing) | Recycle [greeting](../grammar/reference-suffix.md#greeting) and [vocative](../grammar/clause.md#vocative). Not ability (`vuzunuxel`). Not values |
| 16 | `roles.md` | Advanced | — | no Advanced stage | |
| 17 | `join-extras.md` | Intermediate | **exists** | Join-act verbs `van` / `von` / …; join-relations `gan` / `han` / … (unary `/b/`) | No Beginner slot. Recycle = all Beginner + earlier Intermediate (path before 17) |
| 17 | `intention.md` | Intermediate | **exists** | **DECISION** **`ehege`** changeability; evidentiality stacked on **PREDICT**; PLAN + DECISION stack | Recycle Beginner PLAN / PREDICT. Stack evidentiality on PREDICT only as this stage shows. Join-act **`von`** only if already taught in this stage |
| 17 | `intention.md` | Advanced | **exists** | PLAN / PREDICT against *as-of*; DECISION speech-now | Recycle relations Advanced |
| 17 | `special-vocabulary.md` | Intermediate | **exists** | Emotion compose (ACT + LOCUS + a value); numbered alternatives `uzebum`/`agegom`/`olalal` + `g#N` | Overlay *inventory* is not a drill. **Needs** values Beginner (recycle). Not universality (Advanced) |
| 17 | `special-vocabulary.md` | Advanced | **exists** | Universality (`ugudo` / `abulu` / …) as taught in this stage | 4–6 items |
| 18 | `numeric-derivation.md` | Advanced | **exists** | `ROOT x NUM` as the stage teaches (essence / `+N` / `#N` / quasi / …) — only assigned readings | No unassigned cells from [unassigned-reserved.md](unassigned-reserved.md). 4–6 items |

## Leak index
<a id="leak-index"></a>

First-taught checkpoint for **morphology** agents leak most often. If this checkpoint’s path/stage is **earlier**, the form is illegal. Content roots for a [setting](translation-exercises.md#checkpoint-setting) are not in this table.

| Form | First taught |
|------|----------------|
| House names, SVO, omit **`jal`**, **`jol`/`jel`/`jul`**, vocative (`jululon`) | `clause.md` Beginner |
| Means / simile / exchange / proxy hosted pairs | `relations.md` Beginner |
| **`darl`**, *because* **`hurugum barl`**, `/x/` linker after `.` | `dependents.md` Beginner |
| Named citation greeting (`azawan.`) | `reference-suffix.md` Beginner |
| Greeting bid **`…xan` / `…xon` / `…xen` / `…xun`** on a citation or vocative | `x-compounds.md` Intermediate |
| **`gl-`**, **`jam`/`jom`/`jem`/`jum`** as a *speech-act* system | `clause.md` Intermediate |
| Locative relations; of-relations (`gobonem` / `gajaram` / `gowodom` / `gugunom`) | `relations.md` Intermediate |
| Hosted *as-of* (`helerem` / `hobomam`) | `relations.md` Advanced |
| Remaining `/x/` linkers, nested **`barl`**, stand-in vowels | `dependents.md` Intermediate |
| **-l** / **-m** / **-n** as a *choice* on a citation | `reference-suffix.md` Beginner |
| Letter/full-root **-r** algorithm; **`ugobo`/`edone`/`aha`/`enenu`** | `pronouns.md` Beginner |
| Associative **-x** | `plurality.md` Beginner |
| **SAME** `gonunul` | `predication.md` Beginner |
| Phrase/VP/clause joins, **`zal`/`zam`/`zel`**, negation **`u`** | `joins.md` Beginner |
| Fill-ask join **-r** (`zar` / `var` / `xar`); polar **`juel`/`jaol`** as the *system* | `questions.md` Beginner |
| Extra-noun hook compounds (`awalalul`) | `hooks.md` Advanced |
| **`hal`/`hual`/`har`** | `restrictors.md` Beginner |
| Span brackets / `<>` | `spans.md` Beginner |
| `g+N` / `g#N` / `g+` | `numbers.md` Beginner |
| SHARED scale comparatives | `comparatives.md` Beginner |
| Causal poles *if* / *only if* (`hadorom` / `heberom`) | `causation.md` Beginner |
| **CAUSE** **`egega`** / **`hegegam`** | `causation.md` Intermediate |
| Value **`xa`/`xu`** on **need** roots | `values.md` Beginner |
| Ability **`xa`/`xe`/`xo`/`xu`** on **non-need** hosts | `ability.md` Beginner |
| **MAY** **`hodohom`** | `knowing.md` Beginner |
| Role **`ax`/`ux`/`ox` ROOT** | `roles.md` Beginner |
| Prescription **`xe`** / motive **`xo`** (values) | `values.md` Intermediate |
| Evidentiality / NOTIONAL / RESIDUE / FORMER | `knowing.md` Intermediate |
| Viewpoint laterals | `roles.md` Intermediate |
| Measure phrases / ranges / percent | `numbers-applied.md` Intermediate |
| Join-act **`van`** / join-relation **`gan`** | `join-extras.md` Intermediate |
| **PLAN** / **PREDICT** | `intention.md` Beginner |
| **DECISION** | `intention.md` Intermediate |
| Emotion compose; numbered alternatives | `special-vocabulary.md` Intermediate |
| Judgment **Mine** **`zuroron`** | `comparatives.md` Advanced |
| `ROOT x NUM` derivation | `numeric-derivation.md` Advanced |
| Universality overlays | `special-vocabulary.md` Advanced |

**`jol`** yes/no with a house-name subject is core Beginner. **`jol zar …`** fill-ask is questions Beginner (needs joins unspecified **-r**).

## Review
<a id="review"></a>

Use this after generating, or when asked only to review a file’s drills.

For each spoiler token family:

1. **Morph** tokens: **Introduces**, **Recycle**, or this stage’s examples. Content tokens: house names, published setting roots in **Roots used here**, or this stage’s examples. Else **fail**. Missing from the [example root bank](#root-bank) is **not** a fail for checkpoint content.
2. Check [leak index](#leak-index) for **morphology**: first-taught later than this checkpoint → **fail**. Content roots are not leak-indexed.
3. Same-slot sibling novelty not in **Sibling OK** → **fail**.
4. English *I* / *you* as dummy people → **fail** (unless this stage teaches **`ugobo`/`edone`**).
5. Most items test **this** stage’s decision, not a prior quiz → else rewrite.
6. Missing morph in a translation item, or morph that only repeats loose English when it should have been omitted → **fail**.
7. Unassigned cells from [unassigned-reserved.md](unassigned-reserved.md) → **fail**.
8. No **Setting** line, the phrase matches any **other** named cell in [settings](#settings) (including synonym / article variants), the inventory cell was not updated, or the numbered list does not climb in tension → **fail** (when replacing or generating; do not fail a pre-policy checkpoint until replace).

## Related meta

| Page | Owns |
|------|------|
| [translation-exercises.md](translation-exercises.md) | Placement, principles, [checkpoint setting](translation-exercises.md#checkpoint-setting) (global unique setting), spoiler template |
| [learning-levels.md](learning-levels.md) | Bands and cross-doc path |
| [grammar-docs.md](grammar-docs.md) | Learner prose, house cast |
| [glosses.md](glosses.md) | Morph / free English (teaching lines, not spoilers) |
| [unassigned-reserved.md](unassigned-reserved.md) | Unused-slot inventory — do not drill |
| [grammar-gaps.md](grammar-gaps.md) | Untaught helper jobs — do not drill open rows as if taught |
