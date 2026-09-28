# Proposal: lexicon revamp — confusion-aware root spelling

**Status:** PROPOSED — prototype only (2026-09-27); nothing under `data/` or `docs/grammar/` has changed. Revised: 3-letter roots are generated only for overlay-backed and explicitly marked rows, under provable per-group distance floors; pins are optional overrides. Dry run (2026-09-28) of the whole lexicon: see [Dry run findings](#dry-run-findings); it changes several rules below.  
**Related:** `j-to-y.md` (this revamp is its Phase 4 batch), [data/lexicon-published.csv](../../data/lexicon-published.csv), [data/lexicon-overlays.csv](../../data/lexicon-overlays.csv), [phonology.md](../grammar/phonology.md#phonotactics), [src/lexicon-place.ts](../../src/lexicon-place.ts), [src/word-converter.ts](../../src/word-converter.ts)

## Motivation

Published roots are English-derived mnemonics (`olove` *love*, `owolo` *wolf*, `alalu` *laugh*). Spelling was chosen one root at a time, and nothing keeps easily confused roots apart:

- 1,262 VCVCV roots and 87 VCV roots use 4 vowels and 12 consonants.
- 7,322 pairs of roots differ in exactly one letter.
- Within one meaning domain, 665 pairs are close (prototype measure; see [Prototype results](#prototype-results)), and 138 of those are **siblings**: members of the same emoji subgroup, like *tiger* / *leopard* or *grin* / *smile*.

Siblings are the pairs context can't separate and learners mix up most. Cross-domain pairs (*glove* / *onion*) are separated by context almost for free.

A second problem is **who gets the short roots**. There are only 192 legal VCV roots (4 × 12 × 4). The converter hands them out first come, first served: any English word that fits in three letters takes one. So they end up on incidental seeds (*dodo* `ojo`, *yo-yo* `ela`, *Malta* `ebu`, *Nauru* `aru`). The roots speakers use most stay five letters: the roots behind closed overlays (evidentials, interests, phasal, benchmarks, clause poles) and closed complexes such as `onunu`, `egega` and `odoho`. Since every overlay form is built on its root, those five letters repeat in nearly every sentence.

## Options considered

### A. Meaningful letters (rejected)

Each letter, or the first consonant, would name a meaning domain (`n` food, `w` animals, `m` feelings …), so a root's spelling hints at what kind of thing it is.

Rejected for learner impact, as the prototype measured:

- **It spends distinctiveness where it isn't needed.** Cross-domain words become more distinct, but context already separates those. Same-domain words all share a letter, so they become *less* distinct. Close neighbours within a domain went from 665 to 1,801, and siblings sharing a first consonant from 1,404 to 8,230 (all of them).
- **The recall help is small.** "It's an `n`-word" narrows a guess to about 100 candidates; an English sound hook narrows it to one. Vocabulary studies (Tinkham 1993; Waring 1997; Erten & Tekin 2008) find that learning a meaning cluster together causes more mix-ups, and similar spellings make it worse.
- **It misleads for abstract senses.** 968 of 1,350 roots have an abstract sense, which is often the main use (`agala` is mostly *clarity*). A domain letter would label *clarity* as a wearables word.
- **The capacity is too small.** Any code that keeps every pair of roots at least 2 letters apart holds at most 9,216 / 12 = **768** five-letter roots (dropping any one consonant slot must still leave every root distinct). A fixed first consonant caps each subgroup at **64**. The 259 country flags share one subgroup, so they can never fit.

Historical a-priori languages (Wilkins, Solresol, Ro) failed the same way: words in one category became near-identical.

### B. Domains as spacing constraints (proposed)

Keep spelling arbitrary and English-echoing, but use meaning domains to decide **which roots must stay far apart**.

### Short roots: who is eligible, and how they stay apart

Three ways to hand out VCVs were considered:

- **First come, first served (today).** Rejected: the short roots go to whatever fits, not to what gets said.
- **Pinned by hand.** Every VCV chosen by an editor. This puts the judgment in the right place, but it doesn't scale to 67 overlay roots, and nothing *proves* the choices stay distinct.
- **Generated, but only for eligible rows and under grammatical-group constraints (proposed).** Only overlay-backed rows and rows explicitly marked `short` can get a VCV. Inside each **grammatical group** (words that compete for the same position), the generator must meet a distance floor, and the build re-checks that floor. Pins stay available as an override, not a requirement.

The groups are grammatical, not semantic. Two overlays can come from roots in different emoji domains (a concrete object and a feeling), but if both are `/th/` stances, a listener has to tell them apart in the same position with no help from context. Emoji domain says nothing about that; part of speech and overlay kind do.

## Proposal

### Domains

Domains come from Unicode's emoji groups and subgroups, which the lexicon already follows. All 1,350 seeds map without gaps. The prototype uses 12 domains:

| Domain | Seeds from | Roots |
|--------|------------|-------|
| faces & feelings | Smileys & Emotion | 110 |
| people & roles | person-role / fantasy / activity / sport | 78 |
| body & persons | the rest of People & Body | 68 |
| animals | animal-* | 105 |
| plants, land & sky | plant-*, sky & weather, place-geographic | 59 |
| food & drink | Food & Drink | 124 |
| signs, symbols & time | Symbols, time | 143 |
| places & travel | the rest of Travel & Places | 88 |
| games & events | Activities | 76 |
| media, music & office | sound, music, instruments, phone, computer, light & video, paper, money, mail, writing, office | 109 |
| wearables, tools & household | the rest of Objects | 121 |
| countries & flags | Flags | 269 |

The **subgroup** (Unicode's finer tag: `animal-mammal`, `food-fruit`, …) defines siblings.

### Distance

All rules below use one **distance**: the number of positions where two roots of the same length have different letters. So `ada` / `aga` is 1, `ada` / `oga` is 2, and `ada` / `ubo` is 3. Every letter swap counts the same.

### Short roots

VCV roots (3 letters) are **only** generated for eligible rows:

- **Overlay-backed rows:** any published row whose emoji a non-join overlay in `lexicon-overlays.csv` points to (67 today). Eligibility is derived; no hand-tagging.
- **Marked rows:** `short=y` in a new `short` column of `lexicon-published.csv`, for frequent content roots and closed complexes (`onunu`, `egega`, `odoho`, …).
- **Pinned rows:** a `pinned=y` row keeps its current `clarity` exactly (any length; `agala` is a 5-letter pin). Pins are optional overrides for when a generated choice is unwanted. They generalise the prototype's hard-coded `PINNED = {agala}`.

All other rows are generated as VCVCV. An ineligible row that has a VCV today is lengthened in this pass.

- **Reserve:** `data/reserved-roots.csv` (`root,reason`) holds VCVs back for future closed grammar. Nothing may be generated or pinned onto a reserved root.
- **Budget:** there are 192 VCVs. The converter reports `overlay / marked / pinned / reserved / free` on every run and fails if eligible rows exceed what's left.
- **Overlays follow their root:** hosted overlays spell the published root plus an ending, so shortening `adeze` shortens its whole evidential family (`adezel` / `adezem` / `adezer` → three-letter root plus ending). That is the point: the savings go where the words are said most.

#### Grammatical groups

A group is a set of words a listener must tell apart in **the same grammatical position**. Groups are built from grammatical role only, never from emoji domain or from concrete vs. abstract sense.

- **Kind group:** overlays sharing `(pos, kind)`, e.g. every `th/evidential` root (8). A kind that holds two separately taught sets is split by a new **`subkind`** column in `lexicon-overlays.csv`. Today that applies only to benchmarks: the 6 **judgment standards** (`onunan`, `ahaman`, `uroron`, `uluden`, `alaban`, `oloben`) and the 6 **interest benchmarks** (`egen`, `uhuhen`, `onogon`, `olozon`, `alodon`, `aweron`) become separate kind groups in each of `z` / `d` / `b`. The split is explicit, not derived from the `anchor` column, because other kinds (evidentials, clause poles, deontics) also span several anchors without being separate sets. After the split, **no kind group is larger than 8**.
- **Position group:** overlays sharing `pos` across kinds, e.g. every `/th/` overlay (40 roots: evidentials, interests, universality, MAY, CAUSE, …) or every `/w/` overlay (40).
- **Marked rows:** a `slot` column names the position group (`z`, `v`, …, or a finer label). Empty means the row's PoS letters from `english_by_pos`.

A root belongs to every group any of its overlays or its `slot` puts it in.

#### Group floors

| Group | Floor (distance) | Rules out |
|-------|---------------------------|-----------|
| Kind group | ≥ 2, **and** different consonants | one letter apart (`ada` / `aga`, 1); any two roots with the same consonant (`ada` / `ede`) |
| Position group | ≥ 1 (distinct) | identical roots |

Why the position floor can't be 2 is **provable**. With a floor of 2, two roots in a group can't differ only in the consonant, which means no two can share the same vowel frame (V\_V). There are only 4 × 4 = 16 vowel frames, so a group can hold **at most 16 roots**. That fits every kind group but not the 40-root `/th/` and `/w/` position groups. So the hard position floor is just uniqueness (192 shapes for 40 roots); within a position group, separation comes from the [shared-prefix penalty](#early-collisions-cost-more).

The kind-group consonant ban has its own bound: a VCV root has one consonant, and there are 12 consonants, so a kind group holds **at most 12 roots**. The largest kind groups after the [benchmark split](#grammatical-groups) have 8 (the `th/evidential` and `w/evidential` roots, the `g/clause_pole` and `h/clause_pole` roots), leaving 4 spare. A new member of a full kind group can't get a VCV without a group split. The build reports this as capacity, not as a spelling error.

#### Benchmark cross-check

The two benchmark sets are separate kind groups, but they fill the same slot in the same construction (`zadedal zegen zel gral` / `zadedal zuroron zel gral`). The [grammar](../grammar/comparatives.md#interest-benchmarks) contrasts them directly, so a listener must never mistake an interest bar for a standard. Across the two sets:

- no interest benchmark root may share its **opening** (first vowel + consonant) with a judgment-standard root. There are 48 openings for 12 roots;
- distance ≥ 2 on every cross pair, the same floor as inside a kind group.

The consonant ban does not apply across the sets (12 roots would use every consonant, leaving no room to grow), so this check is used instead. It is a named build check (`benchmark-sets`), so it survives if the benchmark kinds are ever renamed.

The generator treats floors as hard constraints and reports the group it couldn't fill. It never relaxes a floor to finish. When a pin breaks a floor, that's a build error naming both roots.

#### Early collisions cost more

Distance says *how much* two roots differ, not *where*. Where matters: listeners narrow a word down from its start and keep every candidate that matches so far. Two roots that share their opening stay confusable until the first difference arrives. A difference in the last letter comes latest, right before an ending that is identical across an overlay family, and it is the part most often clipped in fast speech or held over in song. So `ada` / `adu` (collide until the last vowel) is worse than `ada` / `uda` (split at once), although both are distance 1.

Position is counted from the **start of the root**. The role letter before it is shared by every group member and doesn't count.

Early collisions are handled in two ways, so the floors and their [capacity proof](#group-floors) stay as they are:

1. **Hard, kind groups:** the [consonant ban](#group-floors) means every pair in a kind group differs by the second letter at the latest, often by the first. The [benchmark cross-check](#benchmark-cross-check) gives the two benchmark sets the same early split across the sets.
2. **Soft, everywhere:** a **shared-prefix penalty** in the generator's cost, counting the leading letters two roots share, with the root's first letter weighted most:

   | Shared prefix | VCV penalty | VCVCV penalty |
   |--------------------------|-------------|---------------|
   | first letter | 1 | 1 |
   | first two | 3 | 2 |
   | first three | — (floor already applies) | 4 |
   | first four | — | 7 |

   The penalty is scaled by how tight the relationship is: × 3 in a kind group, × 2 in a position group or between siblings, × 1 within an emoji domain, and 0 otherwise. It is summed over every pair the candidate joins, and weighed against the English-echo cost, so it never overrides a floor and never forces an unrelated change. It only breaks ties toward roots that split early.

The sibling rule for VCVCV roots (different first consonant, or distance ≥ 3) is a coarse version of the same idea. The soft penalty extends it smoothly instead of adding another hard rule. `short-roots groups` reports each group's longest shared prefix beside its closest pair.

#### Surface collisions

Groups compare roots. The build also compares **surface forms**: every eligible root plus each ending (`-l` / `-m` / `-n` / `-r`) and each resume form, with its role letter. None may equal or fall within distance 1 of:

- a hook (`al`, `am`, `aol`, …), a stand-in (`darl` …), a join or x-compound opener, or another closed form in the same role;
- any published VCVCV root plus ending in the same role.

It also warns when an eligible VCV is the first three letters of a VCVCV root in the same group (`ada` vs `adaze`), because a clipped or hurried five-letter root could be heard as the short one.

**Compound split (error).** No VCV root may be the first three letters of any VCVCV root whose fourth letter is a join letter (`l` / `m` / `n` / `r`), in any group. Otherwise a compound or numeric derivation can be split two ways:

```text
adare + l + obo   = adarelobo
ada + r + elobo   = adarelobo
```

The second split needs the leftover (`elobo`) to be a root, but lexicon growth or a new compound can close that gap at any time, so the check bans the prefix outright rather than testing current pairs. The ban depends only on the long root's fourth letter, not on the short root's own consonant. Today's 88 VCVs sit in 434 such prefix pairs (`aga` → `agala`, `agare`, `agame`, …), so the generator treats it as a hard constraint for eligible rows and the VCVCV spacing pass must not create new ones. Pins that break it are build errors naming both roots.

#### Tooling

- **Generator:** eligible rows are placed first, **together**, as one constraint problem per position group. A greedy pass in lexicon order would let the first few overlays take the best shapes and strand the rest. Cost is the same as for long roots (fewest changes, English echo) plus the [shared-prefix penalty](#early-collisions-cost-more), and ties go to shapes that leave the group more room.
- **Build check:** re-derives groups from the CSVs and re-checks every floor and surface collision, so the guarantee holds after hand edits and pins, not just after generation.
- **`npm run short-roots`:** `list` (grid of all 192 VCVs: owner, groups, reserved, free); `groups` (each group's roots with its closest pair and distance); `suggest <emoji>` (free VCVs that meet every floor for that row, ranked by English echo, reusing `mappedSourceLetters` / `repair` in `src/word-converter.ts`), to help pick a pin.

### Spacing rules

These apply to generated VCVCV roots, using the [distance](#distance) above.

1. Every root is unique, including against closed forms, overlay `sense_form`s, compound stems and reserved roots.
2. **Same domain:** distance ≥ 2, so no one-letter differences.
3. **Siblings:** distance ≥ 2, **and** either different first consonants (listeners weight word onsets) or distance ≥ 3.
4. Only [eligible rows](#short-roots) are generated as VCV. Everything else is VCVCV.
5. Pins are fixed. The generator places everything else around them and never moves a pin to satisfy a rule. When a pin breaks a rule or floor, the build reports it for a human to fix.
6. Cost: take the free spelling with the fewest letter changes from the current root, plus the [shared-prefix penalty](#early-collisions-cost-more) against domain-mates and siblings. Remaining ties go to a first consonant few domain-mates use.

Eligible VCV rows also keep their emoji domain and sibling spacing (rules 2–3) against other VCVs. Between a VCV and a VCVCV, only the surface-collision and prefix checks apply.

Requiring all siblings to have different first consonants was tried and fails: there are only 12 onsets, fewer than the 48 mammals. Hence the "or distance ≥ 3" escape.

### Exemptions

- **Pinned roots**, including **`agala`**, which carries the language name ([language-name.md](../meta/language-name.md)).
- **Country / flag roots (270)** keep their current name-echo spelling, except where it is a VCV. The 13 VCV flags (`ogu` *Congo*, `ebu` *Malta*, `uza` *USA*, …) become VCVCV name-echoes unless marked or pinned. They behave as names, and 259 siblings can't satisfy rule 3 (with them included, 191 fail). They still have 266 one-letter sibling pairs; handling those is an [open question](#open-questions).

### Letter `y` replaces `j`

This revamp **is** the batched lexicon retie that `j-to-y.md` Phase 4 waits for. It respells in one `convert-word` / `retie-docs` pass:

- the spacing respellings above;
- the new VCVs for eligible rows, and the VCV → VCVCV lengthening of everything else;
- `j` → `y` in every root, compound stem and overlay `sense_form` (40 published roots today).

The generator's consonant inventory uses `y`, not `j`. Collision checks run on the final `y` spellings, so a `j` → `y` respelling can't land on a word it collides with. Pins and reserved roots are written in `y` from the start. After the pass, `j-to-y.md` Phase 5 (remove `j`) can proceed.

### Order of work

1. Mark `short` rows (with `slot` where needed), fill `reserved-roots.csv`, and pin anything that must not move (`agala`, any existing VCV you want kept).
2. Generate eligible VCVs, one position group at a time, then the VCVCV spacing pass (with lengthening and `j` → `y`).
3. Read `short-roots groups`. Where a generated choice is unwanted, pin a replacement from `short-roots suggest` and rerun.
4. Do one retie ([Open work](#open-work) item 7).

## Prototype results

The earlier domain-letter prototype (`prototype-semantic-roots.ts`, removed) wrote `tmp/semantic-roots-spread.csv` (old → new per root) and a report. Figures cover the 1,079 roots in the scheme, excluding flags and `agala`. They were measured **before** the short-root revision and under an earlier distance that scored some letter pairs as half a letter, so the thresholds below don't map exactly onto the current rules: the prototype still lets any current VCV try length 3 before growing to 5, and has no grammatical groups.

| Close pairs | Now | Option A | Option B |
|------------------|-----|----------|----------|
| Same domain, too close | 665 | 1,801 | **0** |
| Siblings, too close | 138 | 18 | **0** |
| Siblings, distance ≤ 2 | 882 | 1,971 | **400** |
| Siblings sharing the first consonant | 1,404 | 8,230 | **855** |

How much option B changes spellings: 417 roots are unchanged, 606 change one letter, 57 change two, and none were lengthened. Examples: *tiger* `uduge` → `ujuge` (→ `uyuge` after `j` → `y`), *cow* `ogowo` → `agawo`, *smile* `uzumu` → `azumu`.

Other modes: the default run is option A. `--strict-domain` (option A, plus no one-letter difference anywhere in a domain) places only 734 of 1,080 roots. `--flags-in-scheme` shows the flag overflow.

## Dry run findings

The dry-run script (`prototype-lexicon-revamp.ts`, removed) respelled the lexicon into `tmp/lexicon-revamp/`: new `lexicon-published.csv` (with `short` / `pinned` / `slot` / `priority` columns), `lexicon-overlays.csv` (with `subkind`), `lexicon-compounds.csv`, an empty `reserved-roots.csv`, `root-changes.csv` (old → new per root, with the reason) and `report.md` (budget, checks, every short-root group with its closest pair, letter statistics). Nothing under `data/` changes. It was tuned over several runs; what those runs taught:

### Regenerate from English, don't respell

Respelling the current roots (fewest letter changes) keeps every accident of first-come-first-served history. Many roots are 3 letters, or echo English badly, only because their natural spelling was already taken when they were added: *cool* `ogo` because *cold* had `ogolo`, *nerd* `ene` because *nervous-laugh* had `enere`, *salt* `ala` because *salad* had `alada`. The dry run instead **regenerates every long root from its concrete English label** with the converter's own candidate list (`clarityRootCandidates` in `src/word-converter.ts`), and resolves conflicts by priority instead of lexicon order. Lengthened VCVs get the same treatment, so they gain an English echo instead of filler letters. (An earlier "keep the old VCV as a prefix" approach mostly added `-ba` / `-be`: when every tail costs the same, the first consonant and vowel in the alphabet win.)

### Priority

- A root's **priority** is the English frequency rank of its **most frequent sense**: the concrete label, the abstract gloss, or any `english_by_pos` meaning. A multi-word label ranks by its rarest word. The list is OpenSubtitles 2018 (top 50k, hermitdave/FrequencyWords); unlisted words rank last. Agalan usage in the docs is deliberately **not** used: it reflects what the grammar pages happen to teach.
- Lower number = placed earlier = gets its best free spelling. A per-row override can replace the rank.
- **Short roots always outrank long ones.** A long root never constrains a short root's choice; among short roots, frequent ones weigh their English echo up to twice as much, so they win contested shapes.
- Consequence: rare words absorb the conflicts, and a few land deep in their candidate list (*dumpling*, *lightbulb*, some small countries).

### Close-pair spacing off

With the domain / sibling spacing rules ([rules 2–3](#spacing-rules)) and the shared-prefix penalty on, 386 roots moved just to keep neighbours apart, mostly away from their English echo. The dry run turns them off (`IGNORE_CLOSE_PAIRS`) to **prioritise English echo**. The grammatical-group floors for short roots, the benchmark cross-check and uniqueness stay hard. Close pairs are still reported: 402 same-domain one-letter pairs (489 today) and 256 siblings breaking rule 3 (312 today) remain.

### No exemptions

**Flags** are regenerated like every other row (from the country name); **`agala`** is not pinned. Whether *glasses* keeps `agala` then depends on the compound rule (below).

### Compound rule

The [compound-split ban](#surface-collisions) turned out to be the most expensive rule. Three versions were compared (`COMPOUND_RULE`):

| Rule | What it forbids | 1st converter choice | Past 20th choice | 4–5 letters changed |
|---|---|---|---|---|
| `prefix` (this proposal) | a long root = short root + `l`/`m`/`n`/`r` + V | 343 | 25 | 130 |
| `slot4` | any long root with `l`/`m`/`n`/`r` as its **second consonant** | 255 | 68 | 216 |
| `slot4` + swap | same, but such a candidate is retried with its two consonants swapped | 439 | 18 | 170 |
| `listed` | nothing; only listed compounds are checked | 534 | 3 | 81 |

- **`prefix`** only protects against short roots placed so far, so every short root rules out 16 long shapes. Once short roots outrank long ones it costs long roots and gains nothing: DECISION taking `aga` (from *check*) blocks `agala`.
- **`slot4`** makes a two-way split **impossible by construction**: the 4th letter of any stem tells you whether the left root is 3 letters (join letter) or 5 (any other consonant), so root boundaries are audible without knowing the lexicon, and no future root or compound can break it. It costs 1/3 of the long shapes (9,216 → 6,144) and the sonorants in that slot: without the swap, `l`/`m`/`n`/`r` fall from 1,026 uses to 502, and `g` / `d` fill most of the slot (V–C–V–stop–V roots).
- **The swap** recovers most of that: *smile* `uzumu` → `umuzu`, *glasses* `agala` → `alaga`, *cool* → `alogo` keep both English consonants in the other order (354 roots). It can't help when both consonants are sonorants (*laugh* `alalu` → `alaha`). Sonorants recover to 680 uses, all as first consonant; stops still fill about 3/4 of the second slot.
- **`listed`** gives the best echo (*glasses* keeps `agala`, *laugh* `alalu`, *smile* `uzumu`) but leaves 333 long roots that a short root + join letter could start. That is safe only while compounds stay a closed list: the build must reject any new compound that splits two ways.

**`slot4`** is kept as a hard rule (see [Chosen settings](#chosen-settings) for the swap decision).

### Stop consonants

With `slot4` + swap, stops `b` / `d` / `g` fill about 3/4 of the second-consonant slot. Measured: **about 90% of those second consonants come from the English word** (1,155 of 1,279; a consonant counts as English when the label contains it), so a general stop penalty would cost echo. The script (`DEPRIORITIZE_STOPS`) only acts where English didn't choose the letter:

1. A **filler** stop (not in the English word) is first tried as a continuant: the word's own `v` / `z` / `h` / `w` / `y`, else `v`.
2. From the 6th candidate on (echo already weak), remaining candidates are ordered by stop count.

Effect: `b` / `d` / `g` fall from 1,090 to 971 uses (second slot 719 → 648); `v` / `z` / `h` / `w` / `y` rise. Echo does not suffer: 1st-choice roots 439 → 447, roots past their 20th candidate 12 → 2. Most remaining stops are English *t* / *k* / *c* / *p* / *b* / *d* / *g*; lowering them further means remapping English letters, which trades echo for sound.

**Spelling → sound** (`SPELLING_TO_SOUND`): the converter maps English spelling, not sound, so it also invents stops. Before converting, the script drops *-ing* / *-ed* (6+ letters), merges `ng` → *n*, `ph` → *f*, `th` → *s*, `gh` → *f* after *au* / *ou* (*laugh*) else silent, final `mb` → *m*, initial `kn` / `gn` → *n*, and drops a word-final stop after *s* (*desk* → *des*). Effect: stops 971 → 939; 1st-choice roots 447 → 450; none past the 20th candidate. Echo improves where the silent letter used to drive the spelling (*laugh* `alava`, *knife* `eneve`, *phone* `onove`, *elephant* `eleva`); 258 roots shift, mostly through knock-on conflicts.

**Prefer a non-stop second consonant** (`PREFER_CONTINUANT_C2`): the first consonant keeps its echo, stop or not; when a candidate's second consonant is a stop, the script first tries the English word's next consonant after the first one that is neither a stop nor `l`/`m`/`n`/`r` (e.g. *head-shake* `edage` → `edaze`, *crossed-fingers* `orogo` → `orozo`). 168 roots end up using it. Effect: stops 939 → 861 (second slot now led by `z`, 408 uses); 1st-choice roots 450 → 475; 287 roots shift, again partly through knock-on conflicts.

**Look-ahead limit** (`C2_LOOKAHEAD`): with no limit the rule can borrow a consonant from the end of a long word (*hippopotamus* `uhuzo`, *octopus* `ogozo`). Limiting it to the next 1 or 2 consonants after the first:

| Look-ahead | Roots using rule 4 | Stops | 1st choice |
|---|---|---|---|
| unlimited | 168 | 861 | 475 |
| 2 (chosen) | 117 | 887 | 476 |
| 1 | 74 | 907 | 467 |

With 2, *hippopotamus* → `uhubo`, *octopus* → `ogobu` (echo from the word's start), while *speechless* `ezehe`, *woozy* `owozo`, *feather* `eveze` keep a nearby continuant.

### Echo metric

"Which converter candidate a root got" is a poor echo measure: inserted variants (swap, filler, look-ahead) count as 1st choice. The script now scores each root against its **concrete** English label (read as sounds, with the spelling → sound cleanup always on so every run is scored alike), exact matches only:

| Root letter | Points |
|---|---|
| 1st consonant | 3 = the word's first consonant, 2 = its second, 1 = anywhere |
| 2nd consonant | 2 = the next consonant after the one matched, 1 = a later one, 0.5 = an earlier one |
| 1st vowel | 1 = the word's first vowel |
| later vowels | 0.5 each = the vowel after the consonant before it |

divided by the maximum (7 long, 4.5 short). `root-changes.csv` has `echo_old` / `echo_new`; the report has means.

All variants below keep the hard rules (`slot4`, short-root group floors, uniqueness):

| Variant | Echo mean | Roots < 0.4 | Stops | Continuants | Sonorants | Stops in 2nd C |
|---|---|---|---|---|---|---|
| today (breaks `slot4`) | 0.819 | 59 | 34.8% | 26.0% | 39.3% | 33.9% |
| ban, no swap | **0.676** | **218** | 45.0% | 35.9% | 19.1% | 58.2% |
| + swap | 0.645 | 248 | 41.5% | 32.7% | 25.9% | 56.2% |
| + filler / fallback stop rules | 0.634 | 269 | 36.9% | 36.9% | 26.2% | 50.7% |
| + spelling → sound | 0.648 | 254 | 35.7% | 38.6% | 25.7% | 49.6% |
| + non-stop 2nd C, unlimited | 0.651 | 244 | **32.8%** | 41.3% | 26.0% | 43.7% |
| + non-stop 2nd C, look-ahead 2 | 0.652 | 242 | 33.7% | 40.2% | 26.1% | 45.7% |
| + non-stop 2nd C, look-ahead 1 | 0.655 | 248 | 34.5% | 39.4% | 26.1% | 47.2% |

- By this metric **the swap costs echo** (0.676 → 0.645): the swapped root keeps both consonants but in the wrong order, while without the swap the next candidate usually keeps the first consonant exact. The swap's real gain is sound: sonorants 19% → 26%.
- The stop rules cost almost nothing once spelling → sound is on (0.645 → 0.652) and cut stops from 41.5% to 33.7%.
- The median is 0.71 (5 of 7 points) in every variant; the differences are in the tail.

### Chosen settings

Rerun after short roots were switched to echo their concrete word, adding the stop rules **without** the swap:

| Variant (all `slot4`) | Echo mean | Roots < 0.4 | Stops | Continuants | Sonorants |
|---|---|---|---|---|---|
| ban | 0.684 | 208 | 45.2% | 35.9% | 18.8% |
| ban + spelling → sound | **0.697** | 208 | 43.4% | 37.8% | 18.7% |
| ban + all stop rules, look-ahead unlimited | 0.678 | 248 | **31.6%** | 48.8% | 19.6% |
| ban + all stop rules, look-ahead 2 | 0.678 | 247 | 32.8% | 47.6% | 19.6% |
| swap | 0.653 | 238 | 41.7% | 32.8% | 25.6% |
| swap + spelling → sound | 0.664 | 228 | 40.7% | 34.0% | 25.3% |
| swap + all stop rules, unlimited | 0.657 | 235 | 32.9% | 41.3% | 25.8% |
| swap + all stop rules, look-ahead 2 | 0.658 | 233 | 33.9% | 40.2% | 25.9% |

**Preferred: `slot4`, no swap, all stop rules (fillers, fallback order, spelling → sound, non-stop 2nd consonant with unlimited look-ahead)** — echo 0.678, stops 31.6%. Sonorants fall to ~20% of root consonants (39% today), all in the first-consonant slot; that is acceptable because every word already ends in a sonorant (`-l` / `-m` / `-n` / `-r`), so they stay frequent in speech. These are the script's defaults.

### Dry-run defaults

Settings the open questions will replace: marked `short` = the pronoun-adjacent specials `aha` / `enenu` / `ugobo` / `edone` (slot `pronoun`); no reserved VCVs; benchmark `subkind` = `judgment` (`onunan` …) / `interest` (`egen` …). Budget: 67 overlay + 4 marked = 71 of 192 VCVs used. All hard checks pass (group floors, uniqueness, compound rule, every row placed).

### Not yet checked

- Surface collisions against hooks, stand-ins and x-compound openers (needs the parser's closed-form inventory).
- Mnemonics citing old spellings; a retie dry run.
- Short roots are placed to echo their **concrete** word under the [echo metric](#echo-metric) (short-root mean 0.83). The few that score low were pushed off their best shape by a group floor (*ear* `eyu`, *pepper* `enu`, *ledger* `ehu`, *bookmark* `oyo`); these are candidates for pins.

## Open work

1. **Collision check against the full closed inventory.** The prototype only compares published roots. It already reuses `elere` (the *as-of* relation) for *deer*. Load `lexicon-overlays.csv`, `lexicon-compounds.csv`, hooks, stand-ins, reserved roots and other closed forms as taken.
2. **Short roots in the prototype.** Read `pinned` / `short` / `slot` / `reserved-roots.csv` in place of the hard-coded `PINNED` set, derive overlay eligibility and groups from `lexicon-overlays.csv`, and place eligible rows first under the group floors. Report per-group fill and closest pairs. Expect more changed letters than the table shows: up to 87 current VCVs may lengthen, and about 67 overlay roots shrink.
3. **Converter and build:** `src/word-converter.ts` offers 3-letter candidates only when the caller says the row is eligible. `scripts/convert-word.ts` derives eligibility, seeds `used` with pins, reserved roots and (for ineligible rows) every VCV, and skips pins. The build gets the group-floor and surface-collision checks, plus the `short-roots` CLI. Share the distance function between the prototype, the converter and the build check so all three agree.
4. **Sound-pattern penalties.** The cost ignores repeated-vowel patterns (`uzumu` → `azumu` breaks it) and English hooks (*ewe* `ewe` → `eve`). Add penalties for losing a repeated vowel and for changing letters that echo the English gloss. When lengthening a VCV, prefer keeping it as a prefix (`ele` → `eleXa`), provided that doesn't create a prefix clash with an eligible VCV.
5. **Optimise, don't just go greedy.** Placement is in lexicon order. A search that minimises total changes should keep more roots unchanged. For VCV groups this is required, not optional: 40 roots with prefix spreading among 192 shapes is solvable, but a greedy pass can paint itself into a corner. Pins and floors are hard constraints.
6. **Hand review of each moved root's mnemonic,** since the `mnemonic` column may cite the old spelling. This matters most for VCVs: a short root has less English echo, so its mnemonic has to carry more.
7. **Retie:** one `npm run convert-word -- --lexicon` batch with short roots, spacing, lengthening and `j` → `y`, then `npm run retie-docs` (dry run → `--write`), redirects for changed anchors, and regenerated audio / flashcards. Check that `retieSenseForm` handles an overlay whose root shrinks from 5 to 3 letters: it matches `oldRoot` as a prefix, so `adezel` → new VCV + `l` should work, but test it.
8. **Parse-ambiguity check** (`node scripts/parse.mjs --check-ambiguity`) over the docs after the retie. Short overlay forms sit closer to hooks and x-compounds than five-letter ones.

## Open questions

- **Which rows get `short`?** Candidates: the closed complexes (`onunu`, `egega`, `odoho`), pronoun-adjacent specials, and frequent content roots from `scripts/find.mjs` counts. How big should the reserve be?
- **Should every overlay kind get a VCV?** Join overlays are excluded already. One-member kinds (`plan`, `decision`, …) gain length savings but crowd the `/th/` and `/w/` groups. Should a group ever be allowed to leave some members at VCVCV rather than fail?
- **Should existing VCVs be carried over?** Some (`aha`, `ene`, `ure`) already echo well and could be pinned. The rest lengthen unless they turn out eligible.
- **Are the floors right?** Kind ≥ 2 plus different consonants and position ≥ 1 are the strictest that fit (see [group floors](#group-floors)).
- Should country roots be respaced with their own rule, e.g. region subgroups so the 64-per-subgroup cap holds, or stay exempt?
- Should cross-domain one-letter pairs that are **common co-occurring** words (not just same-domain ones) also be spaced? That needs a co-occurrence source from the examples.
- **Are the prefix penalty weights right?** The table is a starting guess. Once the prototype reports it, tune it against how many roots change (more weight = more respelling). Should the first **vowel** count as much as the first consonant, given that sung vowels are long and carry most of the pitch?
