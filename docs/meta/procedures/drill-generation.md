# Generate translation drills

Executable editor policy: add or replace end-of-stage checkpoints on learner grammar pages without using **morphology** the learner has not been taught. Checkpoint **content** roots follow the [core vocabulary](../translation-exercises.md#core-vocabulary) and the [setting](../translation-exercises.md#checkpoint-setting).

**How to invoke.** Point here and name a grammar file (or one stage). No extra prompt is required:

- *Execute [drill-generation.md](drill-generation.md) to generate the drills for `joins.md`.*
- *… for `docs/grammar/questions.md` Intermediate.*
- *… for core Beginner* (already exists — skip unless asked to replace).

This page owns **path allowlist** (with each checkpoint's [setting](#settings)), **example root bank**, item counts, **generation procedure**, and the [level review](#level-review) procedure. Drill *shape* (spoiler template, decision items, bank, house names, [checkpoint setting](../translation-exercises.md#checkpoint-setting)) stays in [translation-exercises.md](../translation-exercises.md). Stages: [learning-levels.md](../learning-levels.md#cross-doc-path). Example prose: [grammar-docs.md](../grammar-docs.md). Grammar pages must **not** link here.

## Execute
<a id="execute"></a>

Run these steps in order. Stop if a step says stop.

### 1. Resolve the target

Parse the user’s file/stage from their message. Accept `joins`, `joins.md`, `docs/grammar/joins.md`. Optional stage word: **Beginner** / **Intermediate** / **Advanced**.

| Target | Action |
|--------|--------|
| One grammar file, no stage | Generate **every missing** checkpoint for that file (table below), **Beginner then Intermediate then Advanced** |
| One file + one stage | Generate **only** that stage’s checkpoint |
| Several files or “all pages” | Work through them in [path](../learning-levels.md#cross-doc-path) order, one file at a time |
| No file | List the [generate](#allowlist) files that still lack a checkpoint, and the drill-coverage findings from the lint. Stop |
| Drill-coverage lint findings | Add 1–3 items to the existing checkpoint that use the named family; keep its setting and bank. On a [legacy](../translation-exercises.md#legacy-checkpoints) checkpoint, add translation items in its existing format |
| **Replace** a checkpoint | Convert it whole to the current [template](../translation-exercises.md#template) (`### Practice`), following steps 3–6 |
| A file whose [allowlist](#allowlist) rows are all **skip** | Say it is skipped and why. Stop |

Edit **only** the target `docs/grammar/<file>.md` page(s), their allowlist row(s) (status and **Setting** cell, [settings](#settings)), the `core` cells of the lexicon CSVs for roots this checkpoint introduces, and links to a renamed checkpoint anchor. Do not edit other policy, other grammar pages, `AGENTS.md`, or other meta unless the user asked to change the policy.

### 2. Look up the checkpoint

Find the row(s) in the [allowlist](#allowlist).

| Status | Action |
|--------|--------|
| **skip** | Do not add a checkpoint. Continue to the next stage if the target was the whole file |
| **exists** | Leave it unless the user said **replace**. Continue |
| **generate** | Add the checkpoint if the heading is missing. If `### Practice` or a legacy `### Translation practice` already sits at the end of that stage, treat as **exists** |

### 3. What you may read

**Allowed**

- This file (procedure, allowlist row and its [setting](#settings), example root bank, leak index)
- [translation-exercises.md](../translation-exercises.md) (principles, [checkpoint setting](../translation-exercises.md#checkpoint-setting), template)
- [grammar-docs.md](../grammar-docs.md#house-cast) (house people)
- [glosses.md](../glosses.md#house-cast) (name glosses — not needed inside spoilers)
- **This sitting only** of the target file (`band:` on the file) plus the page title / **Needs:** line
- Worked examples **inside that stage** (gold corpus for **morph** packaging, not for checkpoint verbs)
- `data/lexicon-published.csv` (and overlays / compounds CSVs) to certify a setting English gloss has a published stem
- `npm run core-vocabulary -- --for <page>.md:<band>`, to pick **New words** and **Review**. It lists the core roots this checkpoint may introduce, the next later core roots a setting could pull forward, and the earlier core roots ranked by how many checkpoints have passed since a bank last used them. Take review roots from the top of that list unless the setting needs others

**Do not open** later path files, later stages of this file, or `docs/examples/` for item ideas. Do not browse the lexicon for roots the items will not use, beyond the core column.

If this stage’s own examples leak a later form (e.g. MAY + **`yem`** before core Intermediate), **do not copy the leak**. Use a legal recycle form instead.

### 4. Recycle vs introduce

Every **morph** (role letter, ending, closed special, join vowel, speech act, …) in every spoiler must be one of:

1. This row’s **Introduces** (most items must *test* these)
2. This row’s **Recycle** set ([how recycle is computed](#recycle))
3. A closed punctuation / speech act already in recycle (`yel`, omitted **`yal`**, `.`)

Every **content** root (published lexicon or compound lemma, house names included) must be a row in this checkpoint’s **New words** or **Review**, and its English in the item must match that row. A root in this stage’s worked examples still needs a row. Overlay words need a row only when the drill English is that word.

Count content roots against the [core vocabulary](../translation-exercises.md#core-vocabulary): at most **5** whose `core` cell names this checkpoint (**New words**), at least **3** introduced earlier (**Review**). House names, `SELF`, specials, the nine sake roots, and overlay words do not count. Take new roots from the core list in order. To pull a later core root forward, or to bring in a root with an empty `core` cell, set its `core` cell to this checkpoint's anchor; it then counts as new. A core root that this checkpoint no longer uses but still names in `core` moves to the next checkpoint that uses it. A new root must also be at least 3 checkpoints of its level from any core root that differs from it only in the middle vowel ([look-alikes](../translation-exercises.md#look-alikes)); `npm run core-vocabulary -- --look-alikes` suggests fixes. A swapped word must still make sense in each item, so rewrite any item it turns false or odd.

Every bank row must be used by at least one item. `build` checks both directions by root, not spelling: a row covers other roles, full-root resumes, role compounds, and viewpoint-lateral anchors on the same root, and a short resume counts through its antecedent.

If you cannot certify a token, drop the item. Do not guess from English. Do not invent stems.

**Must not use** (unless the row lists it under Introduces or Sibling OK):

- Any **morph** whose [first-taught](#leak-index) checkpoint is **later** than this one
- Same-slot **sibling** Introduces ([slots](#slots))
- *I* / *you* (`zuwen` / `zawan`) before pronouns.md Beginner. From there on they are fine. Before it, *I* only as a greeting with the **`SELF`** name slot ([first person](../grammar-docs.md#house-cast))
- Foreign `PoS<…>ENDING` unless this stage is teaching loans / spans
- Intermediate / Advanced speech-act twins (`yam` / `yem` / `yom` / `yum`), **`gl-`**, sentence linkers, nested **`blarl`**, unless recycle includes **core Intermediate**

### 5. Write the checkpoint

Place **`### Practice {#<band>-practice}`** at the **end of the sitting**, immediately before `## See also` / end of file. Do not insert after every H3. Do not add a second checkpoint in the same sitting unless the allowlist row says **split**.

Follow the [template](../translation-exercises.md#template). Lead: *Short drills for Beginner/Intermediate/Advanced. Try each item before opening **Show answer**.* Next line: **Setting:** one place or occasion. Then the **New words** and **Review** tables ([vocab table](../translation-exercises.md#vocab-table)): house names and `SELF` sit in New words on their first checkpoint and in Review after. House-person **English** is *Azozon* / *Alazun* / *Ahelan*, not `*grace* (name **Azozon**)`. Pick a setting **not already named** in a **Setting** cell ([settings](#settings), [unique globally](../translation-exercises.md#checkpoint-setting)); write the same phrase into this page's allowlist row when you replace, and mark the row **exists**. At least half the items in each translation direction use a root or situation of the setting. Teaching examples stay on the [example root bank](#root-bank); do not rewrite them to match the drill.

*S* is the number of `###` headings in the band above the checkpoint, not counting Practice. Count every such heading, including a short recap, a Compare-with, and a section that only adds overlay or vocabulary rows. Do not count only sections that home a construction. Sitting length is headings: a new `###` is a new bite, whether it is a large table or a recap. The cap is **room**, not a target ([principle 6](../translation-exercises.md#principles)): write only as many items as the band needs. Coverage already requires each family once; extra headings do not require extra items.

<a id="sitting-length"></a>
A sitting past **10** taught sections is too long. Split that **job** onto a sibling grammar page, each a full sitting with its own checkpoint. One band per file (peel with `npm run peel-band`); sibling splits by job when *S* > 10 still apply. Do not add an allowlist **split** row (a second checkpoint on the same sitting) unless one page must stay together. Do not add an H3 to a sitting already at 10 without splitting first. Which headings may share a sitting at all: [what one sitting holds](../grammar-docs.md#one-sitting). Count lines and each H3’s span with `npm run page-lines` (`--sittings`, `--headings`): headings are the split rule; line counts show whether a few long H3s are carrying the sitting.

| Band kind | Per translation direction | Decision items |
|-----------|---------------------------|----------------|
| Beginner or Intermediate | 3 to **max(6, ⌈S / 2⌉ + 2)**, at most 10 | 2 to **max(3, ⌈S / 4⌉)**, at most 5 |
| Advanced, or a thin generate row | 3 to **max(4, ⌈S / 2⌉ + 1)**, at most 8 | 2 to **max(2, ⌈S / 4⌉)**, at most 4 |

Small and median bands stay at 3–6 / 2–3. Level reviews keep their own rule.

Both directions. Spoilers = Ageben or **loose** free English plus a visible morph line in the spoiler ([translation-exercises.md](../translation-exercises.md#template)). Add **Also correct:** where a learner is likely to write a legal variant. Omit recoverable **`yal`**. House names in English prompts (*Azozon waits*). Test the decision this stage taught; package it in the setting, not as a clone of the walk/sleep teach line ([principles](../translation-exercises.md#principles)). Aim the [decision items](../translation-exercises.md#item-types) at the stage's main decision. Every construction family taught in the band, parser-built or data, needs at least one item in this checkpoint (either direction), unless the allowlist row is **skip**.

When replacing a legacy checkpoint, retarget its `core` cells and any links to `#<band>-translation-practice` (such as the ones on [translation-exercises.md](../translation-exercises.md)) to `#<band>-practice`.

### 6. Self-check, then lint

Run the [review checklist](#review) on your own spoilers, and `npm run core-vocabulary` for this checkpoint's new and review counts. Parse each **Pick one** form, **Fix it** correction, **What changes** sentence, and **Also correct:** variant with `node scripts/parse.mjs`, and compare each variant's morph reading to the main answer. Then run `npm test` (it checks `core` cells) and `npm run build`. The build fails when a family taught in a page band (parser-built or data) is not used by that band’s checkpoint. If it fails, fix it in the same file (usually slash-joined emphasis: write `*a* / *b*`, not `*a*/*b*`).

Reply with: which checkpoints you added, replaced, or skipped, the new and review root counts, and any item you dropped because a form was not in recycle.

## Level review
<a id="level-review"></a>

One level per agent, once every stage checkpoint of that level is a `### Practice`. Shape and rules: [level reviews](../translation-exercises.md#level-reviews).

1. **Target.** The level's review file ([review.md](/review), `review-intermediate.md`, `review-advanced.md`): `### Practice {#<band>-practice}`, last in that sidebar group. Add the file to that group in `docs/grammar/.vitepress/lib/reading-order.ts`, and to the review sentence in [introduction.md How to learn](../../grammar/introduction.md#how-to-learn).
2. **Read.** Each stage checkpoint of the level in path order (`npm run core-vocabulary` lists them), its allowlist **Introduces** cell, and the teaching section that owns its main decision. Do not open later levels.
3. **Vocabulary.** `npm run core-vocabulary -- --for review.md:beginner` (or `review-intermediate.md:intermediate` / `review-advanced.md:advanced`); prefer the roots unused longest. Every root goes under **Review**.
4. **Write.** One item per checkpoint, in path order within each H4, aimed at the page's main decision with words and packaging its checkpoint did not use. Choose the item type per page to meet the mix; end every answer with its **Rule:** link.
5. **Check.** Parse every form as in [step 6](#6-self-check-then-lint), then `npm test` and `npm run build`. The build fails on a missing or wrong **Rule:** link, an uncovered page, the counts, a **New words** row, and any form taught after the level.

## Recycle
<a id="recycle"></a>

Drills depend on **what has been taught**, not on other files’ drill text.

| This checkpoint | Recycle |
|-----------------|--------|
| **Beginner** at path *N* | All **Introduces** from **Beginner** rows with a **smaller** path number — except [same-slot siblings](#slots) |
| **Intermediate** at path *N* | All **Beginner** Introduces on the beginner path (productive pages), **plus** **Intermediate** Introduces with a **smaller** path number, except [same-slot siblings](#slots) |
| **Advanced** at path *N* | That Intermediate recycle, **plus** this file’s Intermediate Introduces, **plus** Advanced Introduces with a **smaller** path number, except siblings |

**Needs:** lines on the grammar page always add those forms to Recycle (comparatives Beginner → joins Beginner rank joins; causation Beginner → core extra nouns + **`darl`**).

Honor [teach now; don’t preview later](../grammar-docs.md#teach-now-dont-preview-later) inside Beginner: a Beginner checkpoint must not use that file’s Intermediate / Advanced, or a later peer’s Beginner.

### Same-slot siblings
<a id="slots"></a>

Path items joined with `·` are **co-located**, not ordered. Do **not** recycle a sibling’s **Introduces** unless the row’s **Sibling OK** column lists it (the page already teaches that contrast).

| Slot | Files |
|------|--------|
| 8 | `pronouns.md` · `plurality.md` |
| 12 | `hooks.md` · `restrictors.md` |
| 15 | `numbers.md` · `digitless-exponents.md` · `measures-and-percent.md` · `comparatives.md` · `causation.md` |
| 16 | `sakes.md` · `feelings-permission.md` · `intention.md` · `knowing.md` · `roles.md` · `compounds.md` |

Later path numbers **may** recycle both siblings (e.g. joins Beginner may use pronouns **and** plurality Beginner).

## Settings
<a id="settings"></a>
<a id="skip"></a>

Every stage checkpoint's **Setting:** phrase is the **Setting** cell of its [allowlist](#allowlist) row. Uniqueness is **global**: no two checkpoints may share a named setting (same occasion under a different article or synonym counts). A **skip** row has **—** and does not occupy a name.

When you **replace** a checkpoint, pick a phrase no Setting cell uses, put it on the grammar page, and update that row's cell. House names are not a setting.

[Level reviews](../translation-exercises.md#level-reviews) have no setting and no row.

The build checks this (`checkpoint-inventory` in `npm run lint:ageben`): every sidebar sitting has exactly one allowlist row, by file, whose **Band** matches the page; an **exists** row's Setting cell matches the page; **skip** has no `### Practice` and gives a reason in the notes cell; **generate** fails until the checkpoint is written; and no two checkpoints share a setting (a leading *a* / *an* / *the* and case do not count; synonyms are yours to catch).

### Recipe track
<a id="recipe-track-settings"></a>

Practice blocks on `say-*.md` pages are recipe-track blocks, not stage checkpoints. **Practice** is the block's H3 id. A block that holds items moved out of a stage checkpoint keeps that checkpoint's setting and names the stage file in **From**; any other block needs a setting no checkpoint or block uses. New track practice follows the same drill principles; its allowlist is the recipe's **Needs:** sections.

| File | Practice | Setting | From |
|------|----------|---------|------|
| `say-amounts.md` | `#amounts-comparing-practice` | a weighing room | `comparative-arity.md` |
| `say-amounts.md` | `#amounts-snapshot-practice` | a talent contest | `stance-bars.md` |
| `say-people-places.md` | `#people-pointing-back-practice` | a radio booth | — |
| `say-people-places.md` | `#people-as-for-practice` | a waiting room | `longer-chains.md` |
| `say-people-places.md` | `#people-handles-practice` | a hospital ward | `proper-names.md` |
| `say-people-places.md` | `#people-literal-practice` | a code review | `span-nesting.md` |
| `say-questions.md` | `#questions-joins-practice` | a quiz show | — |
| `say-reasons.md` | `#reasons-causation-practice` | a chemistry lab | — |
| `say-reasons.md` | `#reasons-plans-practice` | a delayed departure board | — |
| `say-reasons.md` | `#reasons-knowing-practice` | a film archive | `universality.md` |
| `say-reasons.md` | `#reasons-feelings-practice` | a harbor office | — |
| `say-tense.md` | `#tense-practice` | a train station | — |

## Example root bank
<a id="root-bank"></a>

Default people: [house cast](../grammar-docs.md#house-cast) — `zazozon` / `zalazun` / `zahelan` (`azozo` / `alazu` / `ahela` + **-n**). Morph: `z-Azozon` / `z-Alazun` / `z-Ahelan`.

**This table is for worked examples** on grammar pages (and for morph leak checks when a teach line uses these stems). **Checkpoints do not default to it.** Checkpoint content comes from the [setting](../translation-exercises.md#checkpoint-setting) plus house names.

Tokens here are **stems for matching** (path allowlist / leak checks). Learner bank cells on a checkpoint use [citations or the inflected form the row teaches](../grammar-docs.md#citation-in-tables). Do not copy `(**-m**)` from this **Sense** column into learner **English**. Checkpoint **English** is the uninflected published lemma for that cell (literal, metaphor, or packed role English); inflected drill prompts (*running*) are fine. When English is not the citation kind, the Ageben cell is the in-clause word and the **New words** cue names the citation sense: *see* → `vayebel` / `` `ayebel` *eye* ``; *sit* → `vehohel` / `` `ehohel` *chair* ``; *tell* → `vezuyol` / `` `ezuyol` *speech* ``; *therefore* → `xahom` / `` `ahol` *east* ``; *however* → `xezem`; *although* → `hezem` (NP *despite* is the same `/h/` word + `/b/` noun); *so-that* → `thovam` (NP intended *for* is the same `/th/` word + `/b/` noun); *meanwhile* → `xugorom`; *haste* → `hadurom` / `` `adurol` *dash* ``; *quietude* → `halozum`; *volume* → `wugowum`; *topic* → `hehugol`. *because* / *inside* already list the `/h/` word (`thahum`, `hegugem`). Do not inflect a row whose English is still the citation kind (`*dog*` stays `odozel`; *next clause* stays `ohel`).

| Root | Sense in examples |
|------|-------------------|
| `azozo` / `alazu` / `ahela` | names **Azozon** / **Alazun** / **Ahelan** |
| `odoze` | *dog* |
| `ogoze` | *cat* |
| `ana` | *book* |
| `oheha` | *house* |
| `eguge` | *inclusion* / *inside* (**-m**) |
| `obulo` | *blue* |
| `erulo` | *red* |
| `elaze` | *size* / *big* |
| `ugowu` | quiet → *volume* (**-m**) |
| `owuro` | *walk* |
| `eruvo` | *run* |
| `ezuve` | *sleep* |
| `ezuyo` | *tell* (`vezuyol`; citation *speech*) |
| `aruyo` | *write* |
| `ozuye` | *sing* |
| `ayebe` | *see* (`vayebel`; citation *eye*) |
| `ehohe` | *sit* (`vehohel`; citation *chair*) |
| `aduro` | *haste* (`hadurom`; citation *dash*) |
| `darl` | *that-clause* |
| `ahu` | *because* (**-m** on `/th/` `/ɡ/`) |
| `ebe` | *only if* (**-m** on `/th/` `/ɡ/`) |

A teach line may add roots that already appear in that stage’s worked examples (e.g. `alede` *apple*, `eduda` *tea*, `oguda` *coffee`, `amahu` *challenging*, `ugo` **IDENTITY**). Checkpoint tables list **setting** roots instead, even when a teach line used *walk*.

## Allowlist
<a id="allowlist"></a>

Path numbers match [learning-levels.md](../learning-levels.md#cross-doc-path). **Introduces** = what this checkpoint may *test*. Recycle is computed from path + slots, plus **Sibling OK**.

Status: **exists** = do not overwrite; **generate** = to write (the build fails until it exists); **skip** = no checkpoint, with the reason in the notes cell. **Setting** is the checkpoint's [setting](#settings). One row per sidebar sitting, by file.

### Beginner path
<a id="allowlist-beginner"></a>

| Path | File | Status | Setting | Introduces (test these) | Sibling OK / notes |
|------|------|--------|---------|-------------------------|--------------------|
| — | `purpose.md` | skip | — | — | orientation |
| — | `introduction.md` | skip | — | — | orientation |
| 3 | `phonology.md` | skip | — | — | not translation |
| 4 | `word-endings.md` | **exists** | a classroom | Choose **-l** vs **-m** vs **-n** on a **citation** (prefix-less); named person vs kind vs metaphor; **greeting** named citation with period (`azozon.`) | No sentences with role letters. No **-r**. Pointers to **-x** / **`gl-`**: do **not** make those the item. No vocative `/y/` |
| 5 | `clause.md` | **exists** | a bank | PoS letters; SVO; `/ɡ/` after noun; `/w/`; `/h/`; hosted `/ɡ | h/`+`/b/` (*like*); unhosted `/b/` recipient/addressee; house names; **-l** / **-m** / **-n** as used in examples |
| 5 | `no-subject.md` | **exists** | a staff room | Leave out the `/z/` word: the sentence names no doer (English passive: *was seen*, *got found*) | Split off `longer-chains.md` (Intermediate) as a Beginner sitting: pick a new setting (a short *who did it?* scene). Its waiting-room items were dropped with the split. Recycle `clause.md` only: no pronouns, specials, or topic |
| 6 | `speech-moves.md` | **exists** | a theater foyer | Turn start; call a person; conventional interjection; statement / question / command / prohibition; omit recoverable **`yal`**; `/x/` continue vs `/y/` turn; `/x/` linker may start the next written sentence after `.` (thinking sounds are spoken only: no item) | Top up the existing checkpoint with a `/x/` continue item: it moved here from `dependents.md`, and `xahom`'s core cell now names this checkpoint, so list it under **New words**. Recycle clause bodies and house names; no hooks, polar particle, soft forms, or numbers |
| 7 | `dependents.md` | **exists** | a guard post | Two-sentence *who / that / which*; **`darl` last**; adverbial subordinators (`thahum` / `thohem` / `thehom` / `hezem` / `herom` / `harum` / `habam` / `halam` / `thovam` **`blarl`**; *despite* = **`hezem`** + `/b/` noun) | Do not use nested **`blarl`**, letter **-r** mechanism. Recycle speech-moves **`yel`/`yol`/`yul`** and `/x/` linkers |
| 13 | `relations.md` | **exists** | a tool crib | Hosted pair for likeness **`hewem`**, exchange **`heham`**, proxy **`hanem`** | Recycle clause hosted `/b/` and hooks extra-noun. No *between*, no of-relations, no **`blarl`**. Not **`hahebam`** |
| 8 | `pronouns.md` | **exists** | a kitchen | Whole-stem **-r**; role pointers (`zwuzer`, `dwuder`, `dwuzor`, `zwuzar`); specials **`uwe` / `awa` / `aya` / `ume`** (when the *role* is the point); inclusive *we* **`aya`** | Do **not** test associative **-x** here (plurality Beginner). Default people still house names; specials only when testing specials |
| 8 | `plurality.md` | **exists** | a picnic | Associative **-x** (`-lx` / `-nx` / `-rx`); not agreement; person-role **-x** (address set vs name…**-x**) | **`aya`** as the *not this* for inclusive *we*. **`uwe`/`awa`** only on person-role items |
| 9 | `predication.md` | **exists** | a passport office | Classification `z… g…` vs kind *noun* `zodozel`; identity **`gorel` + `/b/`** | No general *to-be* `/v/`. Prefer house names + **IDENTITY**; page-example roots (`azawdavraga` / `uzuda`) OK if already taught in this stage |
| 10 | `joins.md` | **exists** | a market stall | Right-close fence; set vs rank vowels; **-l** vs **-m**; list / single-item / standalone starter forms; negation **`u`**; unspecified **-r** as *something* (not fill-ask), and **-rx** as *some of them* | No hooks, no restrictor `/h/` join readings, no comparatives SHARED scale as the point (that is comparatives) |
| 11 | `questions.md` | **exists** | a lost-and-found | **`yel`/`yem`** yes/no vs fill-ask (join **-r**); fill-all; polar **`yaol` / `yuol` / `yael`** vs **`yul`** vs join **`zul`** | **`yem`** is taught here as soft *ask* — allowed on this page even though full speech-act twins live later on `firm-soft.md`. Circumstance *when?* **`har`** is later Beginner on fill-ask-jobs.md — do not use |
| 12 | `hooks.md` | **exists** | a restaurant pass | Prefix-less **hooks** (**`al`/`am`/`el`/`ul`/`ol`**); in-clause `A HOOK B`; discourse **`al`** *additionally*; extra-noun **`al`/`el`/`ul`/`ol`** + `/b/` (**in** / **at** / **from** / **for**) | Not a join (`zam` vs `am`). Not stacked extra-noun (`ael` / `aol`). Not **`xrowul` / `xrowal`** |
| 12 | `restrictors.md` | **exists** | a swimming pool | **`hal`/`ham`/`hual`/`huam`/`har`/`her`/`hur`** (and `/w/` twins); *only when* vs co-manner *and*; bare *never* / *always* | Not sibling hooks. Not join **`zam`** as a restrictor |
| 14 | `spans.md` | **exists** | a rehearsal | Writing fences `[ ]` `( )` `< >`; **`~`/`@`**; PoS = outer slot; **aside** = `th(…)`; interior fragment or same-speech-act clause; when a span is required vs nativized word | `<>` loans **allowed** (this stage teaches them). Prefer one-token cites. The mention marker (`glegol`) is Intermediate |
| 15 | `numbers.md` | **exists** | a bakery | spelled counts (**`gragel`**) and ordinals (**`grodol`**) with the digit syllables; digitless **`gral`** (*more than one*); no shorthand (Intermediate) with **-x** on the noun | No `/v/` `/h/` `/y/` `/x/` number uses, exponents, ranges, percent, measures (later). **-x** from plurality is recycle |
| 15 | `comparatives.md` | **exists** | a racetrack | Rank **`o`** (**`zol`**) + SHARED scale `/ɡ/`; single-item superlative; equative **`oe`** | **Needs:** joins Beginner rank joins. No measure phrases (Intermediate). No numbers Intermediate |
| 15 | `causation.md` | **exists** | a greenhouse | Two-place hinges: outcome host + `/b/` condition; `/th/` event vs `/ɡ/` noun; *if* **`ohe`** vs *only if* **`ebe`**; no cause-arrow word | **Needs:** core extra nouns + dependents **`darl`**. *Because* / **`IFF`** / **CAUSE** are Intermediate — do not use |
| 16 | `sakes.md` | **exists** | a shelter tent | Six needs; `/ɡ/` on a belonging vs `/th/` on the clause; **`tha`** met + contact **-l / -m / -r**; **`thu`** unmet changeability; unowned **`goyom`** + `/w/` need | **Not** prescription **`the`** or motive **`tho`** (Intermediate). Not ability (non-sake + `x` vowel). Not MAY. Not bare need-as-topic |
| 16 | `intention.md` | **exists** | a chess club | PLAN **`thago`**; map-resolution endings | Not values (sake roots). Not role compounds (vowel *left* of `x`). Not conversation length (named citation or `/y/`). Ability **`xa`/`xe`/`xo`/`xu`** is later Beginner on `can-and-cant.md`. Not **DECISION** (Intermediate). Not evidentiality stacked on PREDICT (Intermediate). Sibling MAY / values unused unless the page contrast needs them |
| 16 | `knowing.md` | **exists** | a café patio | **MAY** **`oma`** + 2a follow-up endings (**`thomam`** default; **-l** find out; **-r** who knows) | LIVE/MEMORY is later Beginner on `live-and-memory.md`. Not other evidentiality / NOTIONAL (Intermediate). Not **`yem`** (core Intermediate) unless you only recycle **`yel`** from core/questions Beginner |
| 16 | `roles.md` | **exists** | a construction site | Role compounds **`w` + reach `u` / `o` + part `z`/`d`/`b` + ROOT**; endings on the role word | Not viewpoint laterals (Intermediate). Not values/try (vowel *right* of `x`). Not join-relations. Not label reach seams (`label-seams.md` Beginner) |
| 16 | `compounds.md` | **exists** | a hardware store | Productive **`x`** vs two words vs dictionary compound; look up listed stems (`oyaheha` / `ohelebora`); do not coin them. Live **`x`** from parts (not a pre-joined bank row) | Not parser-family inventory as drills; not coining new dictionary compounds. Greeting bid is Intermediate |
| 16 | `firm-soft.md` | **exists** | a concert warmup | **`yam`/`yem`/`yom`/`yum`**; **-r** acts **`yar`/`yer`/`yor`/`yur`**; *let's* with **`aya`** | Sidebar currently last Beginner (Phase 5 will cluster). Recycle = all earlier Beginner sittings. Not tone marks, stacking, or manner |
| 16 | `left-bound-adjectives.md` | **exists** | a depot yard | **`gl-`** adjective before the noun | Recycle = all earlier Beginner. Not chaining / degree / missing subject |
| 16 | `extra-noun-hooks.md` | **exists** | a camera shop | Extra-noun stacks (`ael` / `oel` / `ual` / `uel` / `aol` / `uol`) and extra-noun **-m**; whose (`om`) | Recycle = all earlier Beginner. Not abstract landmarks, `/w/` on the hook, or ranges |
| 16 | `fill-ask-jobs.md` | **exists** | a visitor desk | *what kind* / *when* / *where* / *whose* / *how* / *why* | Recycle = all earlier Beginner including extra-noun **`om`**. Not arity or blank-in-dependent |
| 16 | `here-there.md` | **exists** | a hostel desk | somewhere / nowhere / everywhere; here and there (`em buwen` / `em bawan` / `um bayan`) | Recycle = all earlier Beginner. Not stacked discourse, hook resume, or parallel chains |
| 16 | `social-ties.md` | **exists** | a neighborhood stoop | Social ties (`gamayam`, `gegobom`, `gabolem`) | Recycle = all earlier Beginner. Not locative / of-relations |
| 16 | `clause-sequence.md` | **exists** | a stairwell | Clause sequence **`xan`** / **`xen`** / **`xun`** | Recycle = all earlier Beginner. Not VP / stance / list verb; rank **`xuon`** stays Intermediate |
| 16 | `digit-strings.md` | **exists** | a clinic clock | Digit-string labels; clock / calendar time | Recycle = all earlier Beginner. Not letter codes, measures, ranges, or percent |
| 16 | `can-and-cant.md` | **exists** | a workshop | Ability **`xa`/`xe`/`xo`/`xu`** on a verb or adjective; hostless **`oda`**; role + ability | Recycle = all earlier Beginner. Not DECISION / try / want |
| 16 | `live-and-memory.md` | **exists** | a lookout | LIVE **`thugem`** / MEMORY **`thevum`** channel pick | Recycle = all earlier Beginner. Not strength, source, forecast, holder, or the other channels |
| 16 | `label-seams.md` | **exists** | a costume shop | Label reach seams (`tha` / `the` / `tho` / `thu` and stacks) | Recycle = all earlier Beginner. Not packaging, commands to be ADJ, or IDENTITY endings |
| 16 | `thanks-and-sorry.md` | **exists** | a gift table | Thanks (lone `/th/` met) and sorry (`thu` + `bl-` whose) | Recycle = all earlier Beginner. Not emotion compose, speaker attitude, or say words |
| 16 | `ought-for-a-sake.md` | **exists** | a yoga studio | Prescription **`the`** + invited / unasked / tryout endings; `/b/` whose stake on advice | Recycle = all earlier Beginner. Not motive **`tho`**, attachment sites, contrary, or sake bars |
| 16 | `already-still-yet.md` | **exists** | a train platform | already / still / not yet / no longer (`havem` / `hawum` / `helom` / `huvum`); ever / never with **`har`** / **`hal`** | Recycle = all earlier Beginner. Not MIRATIVE / RESIDUE / FORMER / NOTIONAL |
| 16 | `fault.md` | **exists** | a bike rack | Fault endings on *because* (`thahul` / `thahum` / `thahur`); act in `bl-`, not the person | Recycle = all earlier Beginner. Not iff, only-because, following-sentence **`blarl`** inventory, or CAUSE |

### Intermediate then Advanced
<a id="allowlist-later"></a>

Read **all** Beginner first, then Intermediate in the same file order, then Advanced ([path](../learning-levels.md#cross-doc-path)). Pages with **no Beginner** slot start here.

| Path | File | Band | Status | Setting | Introduces (test these) | Notes |
|------|------|------|--------|---------|-------------------------|-------|
| 5 | `longer-chains.md` | Intermediate | **exists** | a waiting room | Complex chaining | Top up the existing checkpoint: its degree-word, *again*, and no-subject items moved off with their H3s to `very-and-slightly.md` and Beginner `no-subject.md`, so it is short of English → Ageben, Ageben → English, and decision items. **`gl-`** is Beginner on `left-bound-adjectives.md` |
| 5 | `very-and-slightly.md` | Intermediate | **exists** | a wine tasting | Degree words on `/w/` (**`welazem`**, **`wohalal`**, **`wamezem`**, **`wadowem`**, **`wahuram`**) before an adjective or adverb; `/h/` **`hayurom`** *kind of* and **`herugom`** *again* | Split off `longer-chains.md`: pick a new setting. Its waiting-room items were dropped with the split. List **`herugom`** under **New words** and set its `core` cell to this checkpoint (cleared when it left `longer-chains.md`). Recycle Beginner **`welazem`** and comparatives |
| 5 | `emphasis.md` | Advanced | **exists** | a circus | Leftmost content-word prominence; English cleft / *what*-cleft / fronted adverb | Weak-pause cues are recognition, not the drill |
| 6 | `more-turn-words.md` | Intermediate | **exists** | a music rehearsal | Doubled and stacked act words; commands to be ADJ (**`yol`** / **`yul`** + `/ɡ/`); describing a call or reaction (**`gl-`** before it) | Speech manner is Intermediate on `speech-manner.md`. Soft/firm twins and **-r** acts are Beginner on `firm-soft.md`. Tone marks are Intermediate on `tone-marks.md`. Do not require numbers Intermediate readings |
| 6 | `speech-manner.md` | Intermediate | **exists** | a podcast studio | Speech manner: stance **`thagebem`** *to be clear* / **`thavewom`** *frankly* vs `/h/` on the same root | Recycle doubled and stacked act words from `more-turn-words.md` |
| 6 | `tone-marks.md` | Intermediate | **exists** | a poetry slam | Tone marks (`!` / `?` / `%` / `&` / `;`, stacks, word vs sentence scope) | Doubled / stacked act words and speech manner are Intermediate on `more-turn-words.md` |
| 7 | `sentence-linkers.md` | Intermediate | **exists** | a departure board | `/x/` continue endings (linker, topic introduce / return, sequence); what carries past a period; `/x/` linkers (`xahom`, `xezem`, …) | Top up the existing checkpoint: result and noun time-hinge items moved off with `more-hinges.md`, so it is short of English → Ageben and decision items, and **New words** `vozuyul` has no item. Stand-in vowels and pointing back are Intermediate on `stand-in-vowels.md`. Recycle Beginner **`darl`/`barl`** |
| 7 | `more-hinges.md` | Intermediate | **exists** | a nightclub | Result **`hahom blarl`** (vs **`thovam blarl`** *so that*); time hinges on a noun (`/ɡ/` **`gerom`** / **`gabam`** / **`galam`** / **`garum`** / **`guvahum`** + `/b/`) | Split off `sentence-linkers.md`: pick a new setting. Recycle `/x/` linkers from `sentence-linkers.md` and Beginner hinges from `dependents.md` |
| 7 | `stand-in-vowels.md` | Intermediate | **exists** | a dance class | Stand-in vowels (`dorl` / `durl` / `derl`, **-rl** vs **-rm**); pointing back **-rth** | Linkers are Intermediate on `sentence-linkers.md`. Recycle Beginner **`darl`/`barl`** |
| 7 | `stand-in-roles.md` | Advanced | **exists** | a complaint desk | Lexicalized stand-ins in other roles (`varn` / `vaen` / `vuon` / `darn` / …) | Recycle Beginner **`darl`/`barl`** and Intermediate stand-ins |
| 7 | `nested-dependents.md` | Advanced | **exists** | a laundromat | Nested **`blarl`**: a dependent clause that ends in its own stand-in, with the further sentence on the right | Recycle Beginner hinges and **`darl`/`barl`** |
| 13 | `of-relations.md` | Intermediate | **exists** | a station café | of-relations (`gobom`, `gadam`, `gulom`, `gaham`, `gozowum`) | *Between* / across / around are Intermediate on `locative-relations.md`. Exactly like is Intermediate on `exactly-like.md`. Recycle extra-noun hooks. Social ties are Beginner on `social-ties.md` |
| 13 | `exactly-like.md` | Intermediate | **exists** | a copy shop | exactly like **`hewel` / `gewel`** | Likeness **-m** is Beginner on `relations.md` |
| 13 | `locative-relations.md` | Intermediate | **exists** | a river crossing | *between* **`hedam`**; *across* **`hohom`**; *around* **`hevam`**; recycle extra-noun hooks for *from* / *to* | *Between* recycles joins Beginner `/b/` join. Of-relations are Intermediate on `of-relations.md` |
| 13 | `same-role-words.md` | Intermediate | **exists** | a parade | Same-role words `A WORD B`: *before* / *after* **`abam`** / **`alam`**, *while* **`erom`**, *like* **`ewem`**, each on **-m** and **-l**; the fronted word + blank in a fill-ask; the lone-role answer | Recycle the time hinges and likeness from Beginner. Ranges are Intermediate on `ranges.md`; landmark facing is Intermediate on `viewpoint.md` |
| 13 | `as-of.md` | Advanced | **exists** | a records room | Hosted *as-of* **`henam` / `hunom`**; `/h/` `/ɡ/` `/w/`; resume **-r**; date in `/b/` | Recycle RESIDUE, forecast, calendar `b_#…`. Not persist hooks |
| 4 | `proper-names.md` | Intermediate | **exists** | a hospital ward | **-n** on any PoS (titled verb/adjective/adverb); one of a name **-ln**; countries and traditions; full names (given + `/ɡ/` family **-n**) and hyphenated names `ROOTxROOT`+**-n**; [titled phrases](/proper-names#titled-phrases) (hook / join / span **-n**, inner **-l** / **-m**) | Not value/ability/plan ending tables |
| 4 | `place-name-roots.md` | Intermediate | **exists** | a stamp album | Place-name roots (cluster vs seven-letter `n`+vowel) | Country **-n** / **-m** / **-l** are Intermediate on `proper-names.md` |
| 3 | `phonotactics.md` | Intermediate | skip | — | — | Not translation: word shape, like `phonology.md` |
| 3 | `letter-names.md` | Intermediate | skip | — | — | Not translation: letter names, like `phonology.md` |
| 3 | `singability.md` | Advanced | skip | — | — | Not translation: singing and speech edges, like `phonology.md` |
| 9 | `resume-sense.md` | Intermediate | **exists** | a tea ceremony | English approximations of whole-stem **-r** by slot (*does too*, *so is*, *that way*); resume one sense **-rl** / **-rm**; cross-role recast (`vazozor`, `dar` + `/ɡ/` resume for *one*) | Split off `tag-pronouns.md`: pick a new setting. Its rooftop-garden items (*does too*, *so is*, *that way*, *does the same with*) were dropped with the split; none covered **-rl** / **-rm**, so cover it too. `review-intermediate.md` already has an item for this page (*How English approximates -r*). Recycle Beginner whole-stem **-r** and role pointers, and Intermediate stand-in vowels |
| 9 | `tag-pronouns.md` | Intermediate | **exists** | a rooftop garden | Tags: assign **-l**, recall **-r**, named recall **-n**, share **-m**; tag pairs | Top up the existing checkpoint: its resume, recast, *each other*, and *you all* items moved off with their H3s to `resume-sense.md` and `collectives.md`, so it has no Ageben → English items and is short of English → Ageben items, and **New words** *red* has no item. `review-intermediate.md` has no item for this page (its *How English approximates -r* item now links `resume-sense.md`): add one for tags |
| 9 | `topic.md` | Intermediate | **exists** | a book club | `/x/` introduce / return / clear; topic pronoun **`alen`**; what a topic change resets; groups as topic; asking about the topic | No Beginner slot. Recycle = all Beginner + `tag-pronouns.md` (tags) and pronouns Beginner (role pointers) |
| 9 | `collectives.md` | Intermediate | **exists** | a choir loft | Associate resolution; verb collective; each other **`hehom`**; collective `/ɡ/`…**-x**; addressing several people **`awanx`**; vocative **-x** | Top up the existing checkpoint: *Each other* and *Addressing several people* moved here from `tag-pronouns.md`. The *each other* item came with them; the *you all* items did not fit a choir loft, so add at least one `zawanx` item (not the vocative `yawanx`). English → Ageben now has 7 items: trim it to 6 |
| 10 | `label-reach.md` | Intermediate | **exists** | a museum gallery | Classification packaging; **IDENTITY** endings / open **-m** | Top up the existing checkpoint: its *be ADJ!* items moved with the H3 to `more-turn-words.md`, so it is short of English → Ageben and Ageben → English items. Label reach seams are Beginner on `label-seams.md` |
| 11 | `list-structure.md` | Intermediate | **exists** | a sweet shop | SHARED after the join (adjective, `/h/`, hook on the last item, `gegunum` + `/b/`); respectively **`wubam`**; fence nesting | Split off `rank-joins.md`: pick a new setting. Its wedding items (*both in a dress*, *either wine or beer, and a ring*, the *respectively* items) were dropped with the split. List **`wubam`** under **New words** (its overlay anchor now names this page). `review-intermediate.md` already has an item for this page (*SHARED after the join*). Recycle Beginner joins and comparatives (shared scale) |
| 11 | `rank-joins.md` | Intermediate | **exists** | a wedding | Rank joins (tie **`oe`**); invert **`ua`/`uo`/`ue`**; route **`ao`**; rank with one item or none (`zol`, `zoel`, `zaol`, `zuol`, `zor`, …) | Top up the existing checkpoint: its SHARED, fence-nesting, *respectively*, *and/or*, and whole-list denial items moved off with their H3s to `list-structure.md` and `set-joins.md` and were dropped, so it is short of English → Ageben, Ageben → English, and decision items. **New words** *ring* and *dress* have no item, and Review *wine*, *beer*, *walk*, *punch*, *see* are unused. `review-intermediate.md` has no item for this page (its *SHARED after the join* item now links `list-structure.md`): add one. Universals/domains are Intermediate on `universals-domains.md`. Sample **decisions**, not every H3 |
| 11 | `set-joins.md` | Intermediate | **exists** | a garden party | *and/or* **`ae`**; denying a whole list (`val vul`) vs each item (`vul`); set joins with one item or none (`zael` *X is enough*, `zaem` *at least X*, `zuel` *anything but X*, `zun`, `zar` / `zer` / `zur`, …) | Split off `rank-joins.md`: pick a new setting. Its wedding items (*not both kiss and walk*, `zahelan zaem`, *neither kiss nor punch*) were dropped with the split. Recycle Beginner joins and negation, `rank-joins.md` invert **`ue`** |
| 11 | `universals-domains.md` | Intermediate | **exists** | a catalog counter | Universals/domains (every and none, by set); kind-reference; not-every | Rank joins are Intermediate on `rank-joins.md`; SHARED after the join on `list-structure.md` |
| 11 | `join-limits.md` | Advanced | **exists** | a treaty table | Named phrase **-n**; one rare-arity or reserved contrast from this stage | — |
| 12 | `polar-inventory.md` | Intermediate | **exists** | a detective interview | Fuller polar inventory; confirming a negative; yes/no with single-item/standalone; check-backs | Rhetorical questions, quizzes, and stacked questions are Intermediate on `rhetorical-questions.md` |
| 12 | `rhetorical-questions.md` | Intermediate | **exists** | a debate club | Rhetorical **`yal yel`**; quiz **`yel yal`**; stacked questions **`yel yol`** / **`yel yul`** | Recycle stacked act words from `more-turn-words.md` and polar words from `polar-inventory.md` |
| 12 | `fill-ask-roles.md` | Intermediate | **exists** | an information booth | Fill-ask arity; a blank inside a dependent | Kind / when / where / whose / how / why are Beginner on `fill-ask-jobs.md`. Recycle = all Beginner + `polar-inventory.md` (polar, check-backs, `derl` / `darl`) |
| 12 | `in-clause-hooks.md` | Intermediate | **exists** | a newsroom | In-clause **-l** / **-m** grid; parallel chains; detail on the hook (`/w/`); point back (`er` / `ar` / `ur` / `or`, stacked `aer` / `aor` / `uer`) | Top up the existing checkpoint: parallel chains and point back moved here from `discourse-hooks.md` (one item each came with them), and the discourse items left with the *Discourse* H3, so it is one decision item short and has no stacked **-r** item. `review-intermediate.md` has no item for this page (both hook items now link `discourse-hooks.md`): add one. Abstract landmarks are Intermediate on `abstract-landmarks.md`; ranges on `ranges.md`. Extra-noun stacks and whose (`om`) are Beginner on `extra-noun-hooks.md` |
| 12 | `discourse-hooks.md` | Intermediate | **exists** | a hotel lobby | Discourse **-l** / **-m** / **-r** at the front (`am` *Among other things*, `er` *Anyway*); stacked discourse (`aol` / `ael` at the front); discourse placements | Top up the existing checkpoint: its point-back and parallel-chain items moved to `in-clause-hooks.md`, and two discourse items came here from it, so it is short of English → Ageben items and **New words** *elevator* has no item. Somewhere / here and there are Beginner on `here-there.md`. Recycle = all Beginner + hooks Intermediate (`in-clause-hooks.md`, abstract landmarks) |
| 12 | `abstract-landmarks.md` | Intermediate | **exists** | a town council meeting | Extra-noun hook + abstract **-m** landmark (`ual baram`, `al babowum`, `uol bonam`) | Recycle extra-noun hooks from `hooks.md` Beginner |
| 12 | `ranges.md` | Intermediate | **exists** | a print shop | Ranges **`oel`** / **`uel`** / **`ual`** / **`uol`** / **`aol`**; **-m** soft ends; range **-r** (`oer` / `uer` / `uar` / `uor` / `aor`, *whose turn?*); ranges of numbers (counted noun, `uel` with numbers) | Number ends of one kind (counts, ordinals, or labels) |
| 12 | `hook-compounds.md` | Advanced | **exists** | a ferry slip | Extra-noun **hook compounds** (citation keeps **-l** / **-m**, then the extra-noun hook; lemma is the citation; `/d/` landmark); **hook prefixes** (hook vowels + **`x`** / **`mx`** + stem, on `/ɡ/` `/z/` `/d/` `/b/` `/h/`) | Recycle extra-noun grid and abstract landmarks. Not same-role *including*. Not two-word `vowurol ul …`. Hooked joins are Advanced on `hooked-joins.md` |
| 12 | `hooked-joins.md` | Advanced | **exists** | a lockgate | **Hooked joins** (hook vowels + **`x`** + a join, `bl-` landmark; `/h/` time bounds) | Recycle extra-noun grid and abstract landmarks. Hooked join vs a free hook after the verb (who counts vs where) |
| 13 | `more-occasions.md` | Intermediate | **exists** | a mountain trail | Defined core (full); conjuncts; dependent *when* |  |
| 14 | `spans-as-words.md` | Intermediate | **exists** | a courtroom | Written spans; mention marker **`glegol`** / **`glegon`**; a span as a noun (`dwuder` points back at it); spans before the noun (`gl`); one of a title **`^@`** | Top up the existing checkpoint: its quoted-question, topic-span, and act-word Fix it items moved off with their H3s to `quote-contents.md` and were dropped, so it is one decision item short, and Review *topic*, *lie*, and *walk* are unused. Scope islands are Intermediate on `scope-islands.md` |
| 14 | `quote-contents.md` | Intermediate | **exists** | a hair salon | Act words in a quote (`d[yel …]`); topics in a quote (a cite starts with no topic; a span as an `/x/` topic word, `x@[…]`, `glegol x[…]`) | Split off `spans-as-words.md`: pick a new setting. Its courtroom items (*Does Alazun lie?*, *about the word “alede”*, `x@[onuren alazun]`, the act-word Fix it) were dropped with the split. Recycle `spans-as-words.md` (mention marker, `@`) and `topic.md` |
| 14 | `scope-islands.md` | Intermediate | **exists** | a news ticker | **`{ … }`** scope islands | Mention is Intermediate on `spans-as-words.md` |
| 14 | `span-nesting.md` | Advanced | **exists** | a code review | Close forms (editorial `#]` / close-all `\|]`); nesting | ]`) |
| 15 | `number-markers.md` | Intermediate | **exists** | a sports stadium | PoS on numbers; markers; endings; letter codes (`_` with letters); **one of** measure / range / percent / time if you can keep the item to that decision (ranges live on **`ranges.md`**, clock / calendar time on Beginner **`digit-strings.md`**, measures and percent on **`measures-and-percent.md`**) | Do not dump the whole Intermediate. Digitless, exponents, bare OoM, and the spoken comma live on **`digitless-exponents.md`** |
| 15 | `digitless-exponents.md` | Intermediate | **exists** | a grain elevator | Digitless amounts (`gram` / `gral` / `grar`); *how many?* / *how big?*; exponents; bare OoM; group separator | No Beginner slot. Recycle = all Beginner + numbers Intermediate (markers, endings, PoS, number as verb) |
| 15 | `measures-and-percent.md` | Intermediate | **exists** | a pharmacy | Percent vs points; fractions; measure phrases — as taught in this stage | Top up the existing checkpoint: its letter-code and range items moved off, so it is short of Ageben → English and decision items and of review roots. Digit-string labels and clock / calendar time are Beginner on `digit-strings.md`. One topic per item |
| 15 | `number-roles.md` | Intermediate | **exists** | a boxing gym | Number on `/v/` / `/h/` / `/y/` / `/x/` / `/w/` / `/th/` by marker (add / remove, *N times*, *Nth time*, shouts, list points, likelihood) | Recycle markers and endings from `number-markers.md` |
| 15 | `initials.md` | Advanced | **exists** | a city hall | Initials: first consonant of each root of a hyphenated title as a **`@_`** code; spoken letter names; resume **`=_`** | Recycle letter codes from `number-markers.md` and hyphenated names from `proper-names.md` |
| 15 | `open-ranges.md` | Advanced | **exists** | a toll booth | Rays with **`zrawal`** / **`zruwal`** (**`oel`** vs **`uel`**, soft **`oem`**); rank ends **`growal`** / **`growul`**; named **-n** and some-value **-r** range hooks, including a fill-ask | Recycle ranges from `ranges.md` and ±∞ from `special-values.md` |
| 15 | `generations.md` | Advanced | **exists** | a family reunion | Ordinal generations: digitful exponent **`eK`** / **`e-K`** on **`#`** / **`#-`**; kin cohorts (parents, siblings, children) with a `bl-` anchor; nested anchor for a side branch | Recycle end-relative **`#-`** from `stacked-markers.md` |
| 15 | `stacked-markers.md` | Advanced | **exists** | a parking garage | From the end (`#-` / `uo`); stacked markers (`#_` / `+-`); ambient magnitude **as used in the stage’s teach examples** | — |
| 15 | `special-values.md` | Advanced | **exists** | an observatory | Digitless exponents / hyperbole / zero×exp / special stance **as used in the stage’s teach examples** — not unassigned cells | Recycle sibling Intermediate |
| 15 | `comparative-arity.md` | Intermediate | **exists** | a weighing room | Ranking on any scale: full comparative arity; place (`w#N`), manner `/h/`, amount `gral`, frequency `hral`, and time `bral` scales; covarying clauses; factor (*twice as … as*) | The PLAN bar is Intermediate on `bars.md` |
| 15 | `stance-bars.md` | Advanced | **exists** | a talent contest | Every bar (channels, FORMER, ABIL, REQUIRE, attitudes); bar inside vs stance after the fence | Vague amounts are Intermediate on `vague-amounts.md` |
| 15 | `vague-amounts.md` | Intermediate | **exists** | an open mic | Vague *many* / *few* / *often* / *late* with a named PATTERN bar | Recycle = all Beginner + comparative-arity + evidentiality + sake-bars (PLAN, channel, and sake bars). Not ABIL / FORMER as bars |
| 15 | `iff-fault.md` | Intermediate | **exists** | a dam control room | **`ahu`** *because* / **`eho`** *iff*; asserted necessary **`thebem thahum`**; *unless* **`thohem blurl`**; *even if* | Fault endings are Beginner on `fault.md`. CAUSE is Intermediate on `cause.md`. Recycle Beginner *if* / *only if*, following-sentence **`blarl`**, and `/h/` vs `/ɡ/` |
| 15 | `cause.md` | Intermediate | **exists** | a water mill | **CAUSE** **`ewo`** **-m** before a hinge; *make* (causer in `/b/` after **`thewom`**) | Recycle *because* / *if* hinges from `iff-fault.md` |
| 16 | `for-a-sake.md` | Intermediate | **exists** | a monastery | Motive **`tho`** + time horizon; which ending table; attachment sites; whose stake | Top up the existing checkpoint: its contrary **`uom`** item moved off with the H3 to `contrary-to.md` (dropped there: no setting yet), so it is short of Ageben → English items, and Review lost *sleep* and PLAN, so check the review count. Contrary to a stance is Intermediate on `contrary-to.md`, after this sitting. Prescription **`the`** is Beginner on `ought-for-a-sake.md`. Sake bars are Intermediate on `bars.md` |
| 16 | `bars.md` | Intermediate | **exists** | a candle shop | PLAN bar right before the rank join (vs a stance after the fence); a channel as the bar (*than usual*, *than it looks*), with a holder; met sake bar before a rank join: **`zoel`** *enough*, **`zol`** *too*, **`zuol`** *not enough*; bar ending **-l** / **-m** / **-r**; `bl-` whose stake | Top up the existing checkpoint: the PLAN bar (from `comparative-arity.md`) and channel bars (from `residue-and-former.md`) joined this sitting, and their items did not fit a candle shop, so add at least one item for each. Recycle sakes Beginner, rank joins, comparative-arity scales, channels, holder, and FORMER |
| 16 | `feelings-permission.md` | Intermediate | **exists** | a support group | Emotion compose; feeling with no object; speaker attitude | Thanks and sorry are Beginner on `thanks-and-sorry.md`. Recycle = all Beginner + `for-a-sake.md` (whose stake, prescription contrast). Say words are Intermediate on `permission-consent.md` |
| 16 | `permission-consent.md` | Intermediate | **exists** | a locker room | Say words (permission, consent, reach) | Emotion compose is Intermediate on `feelings-permission.md`. Say words after **`uom`** are Intermediate on `contrary-to.md`, after this sitting. Recycle = all Beginner + `for-a-sake.md` (whose stake, prescription contrast) |
| 16 | `evidentiality.md` | Intermediate | **exists** | a press conference | Channels after LIVE / MEMORY; evidence strength; hand depth (`th#N`); source `bl-`; forecasts (`blral`); the evidence clause (`blarl`); carrying a channel forward; deduction (`thanam`) | LIVE/MEMORY are Beginner on `live-and-memory.md`. Holder is Intermediate on `holder.md` |
| 16 | `holder.md` | Intermediate | **exists** | a witness stand | **Holder** seam (someone else's view) | Channels are Intermediate on `evidentiality.md` |
| 16 | `contrary-to.md` | Intermediate | **exists** | a zoo | **`uom`** + the stance the event goes against: a plan; a say word (a ban, a requirement, a refusal; never a yes or *their call*); a channel; a holder for whose plan or view | New sitting: *Contrary to a stance* from `for-a-sake.md`, say words after **`uom`** from `permission-consent.md`, the holder's plan from `holder.md`, and *Channels after `uom`* from `residue-and-former.md`. Their items were dropped (no setting yet): pick a new setting. A noun after **`uom`** (*despite the rain*) is Beginner on `extra-noun-hooks.md`. WANT and DECISION after **`uom`** are Intermediate on `want-and-decide.md`, after this sitting. Recycle = all Beginner + earlier Intermediate (PLAN, say words, channels, holder) |
| 16 | `universality.md` | Advanced | **exists** | a film archive | Mood on one adjective (`/w/` channel) | Dated channel is Advanced on `dated-channel.md`. Channels on a generalization are Advanced on `usually-vs-must.md` |
| 16 | `dated-channel.md` | Advanced | **exists** | a night desk | Dated channel; signed offset; *just* / *recently* | Mood on one adjective is Advanced on `universality.md` |
| 16 | `usually-vs-must.md` | Advanced | **exists** | a lecture hall | Channel on a generalization; fence vs warrant | Mood on one adjective is Advanced on `universality.md` |
| 16 | `viewpoint.md` | Intermediate | **exists** | a harbor | Viewpoint laterals **`DIR th ANCHOR`**; bare arrow roots = compass; gravity **`abuho`/`oduho`**; name/listener anchor; landmark facing | Prefer `…thazawan` over silent speaker default. **`awa`/`uwe`** only when testing role-anchor. Include at least one bare cardinal and one gravity item |
| 16 | `role-parts.md` | Intermediate | **exists** | a film set | Reach vowels on role words; acting as on `/h/` (slot-part compound); places, tools, and times as landmarks; content-rule parts (manner **`h`** pointer or compound) | Viewpoint laterals are Intermediate on `viewpoint.md`. Include at least one content part and one acting-as item |
| 16 | `compound-families.md` | Intermediate | **exists** | a front porch | Which family: both sides of the first **`x`**; adding another piece (modifier first) | Conversation length is Intermediate on `conversation-length.md`. Not ability (`vozuyexol`) |
| 16 | `conversation-length.md` | Intermediate | **exists** | a street corner | Greeting bid name **`x`** **`a`/`o`/`e`/`u`** + **-n** on a citation or vocative (presence / minutes / one ask / passing) | Recycle [greeting](/word-endings#greeting) and [vocative](/speech-moves#vocative). Not ability (`vozuyexol`). Not values |
| 16 | `root-tails.md` | Advanced | skip | — | — | Root tails are a memory aid and tail-suffix words are dictionary entries: nothing to build or choose |
| 17 | `verb-and-stance-joins.md` | Intermediate | **exists** | a baton pass | Verb-phrase and clause joins (`vam`, `xam`); stance joins (`thahum … thul`, before `blarl`, standalone `thul` / `thar`) | Stance joins merged here from `join-across-roles.md` with their relay-race items, which fit a baton pass: trim the decision items to 3 (Pick one, Fix it, and What changes now hold 4). Sequence `xan` is Beginner on `clause-sequence.md`. List verbs are Intermediate on `list-verbs.md`. Join-relations are Intermediate on `join-relations.md`. Recycle = all Beginner + earlier Intermediate (path before 17) |
| 17 | `list-verbs.md` | Intermediate | **exists** | a roster desk | List verbs `van` / `ven` / … | Stance joins are Intermediate on `verb-and-stance-joins.md` |
| 17 | `join-relations.md` | Intermediate | **exists** | a team bench | Join-relations `gan` / `han` / … (unary `/b/`) | Stance joins are Intermediate on `verb-and-stance-joins.md`. List verbs are Intermediate on `list-verbs.md` |
| 17 | `residue-and-former.md` | Intermediate | **exists** | a magic show | **RESIDUE** / **FORMER** | Top up the existing checkpoint: its channel-bar items moved off with the H3 to `bars.md`, and its channels-after-**`uom`** items with the H3 to `contrary-to.md` (both dropped: the setting did not fit), so it is short of English → Ageben, Ageben → English, and decision items, and Review lost *Ahelan* and *walk*. Channels after **`uom`** are Intermediate on `contrary-to.md`. Channel bars are Intermediate on `bars.md`, after this sitting. already / still / not yet / no longer are Beginner on `already-still-yet.md`. Recycle = all Beginner + earlier Intermediate including knowing Intermediate (channels, holder). MIRATIVE is Intermediate on `mirative.md`. NOTIONAL is Intermediate on `notional.md` |
| 17 | `mirative.md` | Intermediate | **exists** | a card table | **MIRATIVE** | Recycle = all Beginner + earlier Intermediate including knowing Intermediate (channels, holder) |
| 17 | `notional.md` | Intermediate | **exists** | an acting class | **NOTIONAL** **`eyu`** + play follow-up endings | Recycle = all Beginner + earlier Intermediate including knowing Intermediate (channels, holder) |
| 17 | `try.md` | Intermediate | **exists** | a board meeting | **ATTEMPT** **`owa`** commitment; fallback **`xen`** | Top up the existing checkpoint: its DECISION items moved with the H3 to `want-and-decide.md`, so it is short of English → Ageben, Ageben → English, and decision items, and `review-intermediate.md` has no item for this page (its DECISION item now links `want-and-decide.md`): add one for ATTEMPT. Ability **`xa`/`xe`/`xo`/`xu`** is Beginner on `can-and-cant.md`. Recycle Beginner PLAN. WANT and DECISION are Intermediate on `want-and-decide.md`, after this sitting. List verb **`ven`** only if already taught in this stage |
| 17 | `want-and-decide.md` | Intermediate | **exists** | a birthday party | **WANT** **`alo`** lastingness; **DECISION** **`oge`** changeability; WANT + PLAN + DECISION stack; holder on WANT / PLAN / DECISION | ATTEMPT is Intermediate on `try.md`. Recycle Beginner PLAN and Intermediate holder |
| 18 | `numeric-derivation.md` | Advanced | **exists** | a foundry | `NUM x ROOT` as the stage teaches (essence / `+N` / `#N` / quasi / …; `mx` approximate) — only assigned readings | No unassigned cells from [unassigned-reserved.md](../unassigned-reserved.md) |

## Leak index
<a id="leak-index"></a>

First-taught checkpoint for **morphology** agents leak most often. If this checkpoint’s path/stage is **earlier**, the form is illegal. Content roots for a [setting](../translation-exercises.md#checkpoint-setting) are not in this table.

| Form | First taught |
|------|----------------|
| House names, SVO, omit **`yal`**, **`yel`/`yol`/`yul`**, vocative (`yalazun`) | `clause.md` Beginner |
| Means / likeness / exchange / proxy hosted pairs | `relations.md` Beginner |
| `/x/` linker after `.` | `speech-moves.md` Beginner |
| **`darl`**, *because* **`thahum blarl`** | `dependents.md` Beginner |
| Named citation greeting (`azozon.`) | `word-endings.md` Beginner |
| Conversation-length bid **`…xan` / `…xon` / `…xen` / `…xun`** on a citation or vocative | `conversation-length.md` Intermediate |
| **`gl-`** | `left-bound-adjectives.md` Beginner |
| **`yam`/`yem`/`yom`/`yum`** as a *speech-act* system | `firm-soft.md` Beginner |
| Locative relations | `locative-relations.md` Intermediate |
| Of-relations (`gobom` / `gadam` / `gulom` / `gaham`) | `of-relations.md` Intermediate |
| Hosted *as-of* (`henam` / `hunom`) | `as-of.md` Advanced |
| Remaining `/x/` linkers | `sentence-linkers.md` Intermediate |
| Result **`hahom blarl`**; time hinges on a noun | `more-hinges.md` Intermediate |
| Stand-in vowels, pointing back **-rth** | `stand-in-vowels.md` Intermediate |
| Lexicalized stand-ins (`varn` / `vaen`) | `stand-in-roles.md` Advanced |
| Nested **`blarl`** | `nested-dependents.md` Advanced |
| **-l** / **-m** / **-n** as a *choice* on a citation | `word-endings.md` Beginner |
| Whole-stem **-r** and role pointers; **`uwe`/`awa`/`aya`/`ume`** | `pronouns.md` Beginner |
| Associative **-x** | `plurality.md` Beginner |
| **IDENTITY** `gorel` | `predication.md` Beginner |
| Phrase joins, **`zal`/`zam`/`zol`**, negation **`u`** | `joins.md` Beginner |
| Fill-ask join **-r** (`zar` / `var` / `xar`); polar **`yuol`/`yael`** as the *system* | `questions.md` Beginner |
| Fill-ask role blanks (`gar`, `har`, `el bar`, `om bar`, `hewem blar`, `thahum blar`) | `fill-ask-jobs.md` Beginner |
| Blank in a dependent | `fill-ask-roles.md` Intermediate |
| Topic pronoun **`alen`**; `/x/` introduce / return / clear | `topic.md` Intermediate |
| `el bar` *somewhere*; `em buwen` *here* | `here-there.md` Beginner |
| Resume hooks (`er` / `ar` / `aor`) | `in-clause-hooks.md` Intermediate |
| Front **-m** / **-r** (`am`, `er` *Anyway*); stacked discourse (`aol` / `ael` at the front) | `discourse-hooks.md` Intermediate |
| Extra-noun stacks (`ael` / `aol` / `om` whose) | `extra-noun-hooks.md` Beginner |
| Social ties (`gamayam`) | `social-ties.md` Beginner |
| Extra-noun hook compounds (`owurolul`) | `hook-compounds.md` Advanced |
| Hook prefixes (`guoxuvuvul`, `gamxohalal`) | `hook-compounds.md` Advanced |
| Hooked joins (`zexual blohehal`, `huxal blanulul`) | `hooked-joins.md` Advanced |
| **`hal`/`hual`/`har`** | `restrictors.md` Beginner |
| Span brackets / `<>` | `spans.md` Beginner |
| spelled counts / ordinals / `gral` (no shorthand) | `numbers.md` Beginner |
| Digitless blanks (`grar`); exponents; bare OoM; group separator | `digitless-exponents.md` Intermediate |
| Digitless exponents / hyperbole / zero×exp | `special-values.md` Advanced |
| From the end (`#-`); stacked markers | `stacked-markers.md` Advanced |
| SHARED scale comparatives | `comparatives.md` Beginner |
| Causal hinges *if* / *only if* (`thohem` / `thebem`) | `causation.md` Beginner |
| Fault endings on *because* (`thahul` / `thahur`) | `fault.md` Beginner |
| **CAUSE** **`ewo`** / **`thewom`** | `cause.md` Intermediate |
| Value **`tha`/`thu`** on **sake** roots | `sakes.md` Beginner |
| Ability **`xa`/`xe`/`xo`/`xu`** on **non-need** hosts | `can-and-cant.md` Beginner |
| **MAY** **`thomam`** | `knowing.md` Beginner |
| Role **`waz`/`wad`/`wab` ROOT** | `roles.md` Beginner |
| Prescription **`the`** (values) | `ought-for-a-sake.md` Beginner |
| Motive **`tho`** (values) | `for-a-sake.md` Intermediate |
| LIVE / MEMORY | `live-and-memory.md` Beginner |
| Label reach seams | `label-seams.md` Beginner |
| Evidentiality | `evidentiality.md` Intermediate |
| Holder | `holder.md` Intermediate |
| Contrary to **`uom`** + a stance | `contrary-to.md` Intermediate |
| already / still / not yet / no longer | `already-still-yet.md` Beginner |
| RESIDUE / FORMER | `residue-and-former.md` Intermediate |
| MIRATIVE | `mirative.md` Intermediate |
| NOTIONAL | `notional.md` Intermediate |
| Viewpoint laterals | `viewpoint.md` Intermediate |
| Acting as on `/h/` | `role-parts.md` Intermediate |
| Digit-string labels / clock / calendar time | `digit-strings.md` Beginner |
| Measure phrases / percent | `measures-and-percent.md` Intermediate |
| Ranges (people, days, numbers) | `ranges.md` Intermediate |
| Clause sequence **`xan`** | `clause-sequence.md` Beginner |
| List verb **`van`** | `list-verbs.md` Intermediate |
| Join-relation **`gan`** | `join-relations.md` Intermediate |
| **PLAN** | `intention.md` Beginner |
| **DECISION** | `want-and-decide.md` Intermediate |
| Emotion compose | `feelings-permission.md` Intermediate |
| Thanks / sorry (lone `/th/` met; unmet + `bl-`) | `thanks-and-sorry.md` Beginner |
| Say words (`hwuvam`, consent) | `permission-consent.md` Intermediate |
| Numbered alternatives | `measures-and-percent.md` Intermediate |
| PLAN bar (`thagom zol`) | `bars.md` Intermediate |
| Sake bars (`thudatham zoel`) | `bars.md` Intermediate |
| Channel, FORMER, ABIL, REQUIRE, attitude bars | `stance-bars.md` Advanced |
| `NUM x ROOT` numeric prefix (`zrawaxolamal`, `zragexezuyol`) | `numeric-derivation.md` Advanced |
| Channels on a generalization | `usually-vs-must.md` Advanced |

**`yel`** yes/no with a house-name subject is core Beginner. **`yel zar …`** fill-ask is questions Beginner (needs joins unspecified **-r**).

## Review
<a id="review"></a>

Use this after generating, or when asked only to review a file’s drills.

For each spoiler token family:

1. **Morph** tokens: **Introduces**, **Recycle**, or this stage’s examples. Content tokens: a row in **New words** or **Review** (legacy: **Roots used here**). Else **fail**. A bank row no item uses → **fail**. Missing from the [example root bank](#root-bank) is **not** a fail for checkpoint content.
2. Check [leak index](#leak-index) for **morphology**: first-taught later than this checkpoint → **fail**. Content roots are not leak-indexed.
3. Same-slot sibling novelty not in **Sibling OK** → **fail**.
4. English *I* / *you* (`uwen` / `awan`) on a page earlier in the path than pronouns.md → **fail**. A greeting or bid with the **`SELF`** slot is fine anywhere from word-endings Beginner on.
5. Most items test **this** stage’s decision, not a prior quiz → else rewrite.
6. Missing morph in a translation item, or morph that only repeats loose English when it should have been omitted → **fail**.
7. Unassigned cells from [unassigned-reserved.md](../unassigned-reserved.md) → **fail**.
8. No **Setting** line, the phrase matches any **other** **Setting** cell ([settings](#settings), including synonym / article variants), or the allowlist row's cell was not updated → **fail** (when replacing or generating; do not fail a pre-policy checkpoint until replace).

Converted (`### Practice`) checkpoints only:

9. More than **5** new core roots, or fewer than **3** review roots, or a new root out of core order without its `core` cell moved → **fail**.
10. A **New words** row with no **Cue**, a **Review** row with one, a **Same root as** column, or a non-citation **Ageben** cell whose cue does not name the citation sense → **fail**.
11. Fewer than half the items in a translation direction use a root or situation of the setting → **fail**.
12. A **Pick one** form or **Fix it** correction that does not parse, a **Pick one** pair that differs in more than this stage's decision, a **Fix it** error no learner would make (or a rejected spelling with a reading in [unassigned-reserved.md](../unassigned-reserved.md)), or a **What changes** pair with an untaught morph → **fail**.
13. An **Also correct:** variant whose morph reading differs from the main answer → **fail**. A likely variant (reordering, omitted recoverable word, resume form) that is missing → rewrite.
14. A decision item with the same proposition as a translation item → **fail**.

[Level reviews](../translation-exercises.md#level-reviews) only:

15. An item that misses its page's main decision, or repeats a proposition from that page's checkpoint → rewrite.
16. A **Rule:** link to a section that does not teach the decision the item tests → **fail**.

## Related meta

| Page | Owns |
|------|------|
| [translation-exercises.md](../translation-exercises.md) | Placement, principles, decision items, [core vocabulary](../translation-exercises.md#core-vocabulary) rules, [checkpoint setting](../translation-exercises.md#checkpoint-setting) (global unique setting), template and bank |
| [learning-levels.md](../learning-levels.md) | Bands and cross-doc path |
| [grammar-docs.md](../grammar-docs.md) | Learner prose, house cast |
| [glosses.md](../glosses.md) | Morph / free English (teaching lines, not spoilers) |
| [unassigned-reserved.md](../unassigned-reserved.md) | Unused-slot inventory — do not drill |
| [grammar-gaps.md](../grammar-gaps.md) | Untaught helper jobs — do not drill open rows as if taught |
