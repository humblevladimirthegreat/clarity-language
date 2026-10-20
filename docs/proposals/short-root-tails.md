# Proposal: tails on three-letter roots

<!-- retie: skip -->

**Status:** PROPOSED. Not built. Every spelling on this page is `convert-word` output against the lexicon at commit `9d7b975b`, from a dry run in a scratch worktree. A later respelling makes the tables stale, so regenerate them before building ([build](#build)).
**Since:** only a five-letter root fuses with a hook (D-50, [hooks.md § hook compounds](../grammar/hooks.md#hook-compounds)), so the hook check is gone. The tables below are from the run at `9d7b975b`, which still had it: the 59 five-letter moves it forced are struck from [five-letter roots that move](#five-letter-roots), and the three-letter spellings and counts may change when the run is repeated.
**Related:** `root-tails.md` (tails on five-letter roots); [lexicon.md § root tails](../meta/lexicon.md#root-tails), [§ root length](../meta/lexicon.md#root-length), [§ onset](../meta/lexicon.md#onset), [§ seams](../meta/lexicon.md#seams); [compounds.md § root tails](../grammar/compounds.md#root-tails); [`src/lexicon-place.ts`](../../src/lexicon-place.ts) (`annealShortRoots`, `pairHard`, `shortRootGuards`); [`src/root-tails.ts`](../../src/root-tails.ts) (`validateRootTails`); [`data/lexicon-overlays.csv`](../../data/lexicon-overlays.csv).
**Design authority:** none until absorbed.

## Summary

- A three-letter root `V C V` ends in a tail, as a five-letter root does: the consonant names the **kind** of its concrete sense, and the final vowel its **job** (shape). Only the first vowel is left free.
- Kind and shape follow the five-letter rules ([kind](../meta/lexicon.md#kind), [shape](../meta/lexicon.md#shape)). Size doesn't apply, since a three-letter root has no middle vowel.
- **Spacing inside an overlay group changes.** Today two roots in one group (one overlay kind on one PoS) must differ in at least two letters and in their consonant. With tails the consonant is the kind, and the `/g/` clause-pole group has 13 members against 11 kinds, so that rule can't hold. The new rule: **two roots in one group never share their first two letters.** Roots of different kinds already differ in the second letter; roots of the same kind must differ in the first vowel.
- **Each kind + shape holds at most four three-letter roots** (`a e o u` first).
- In the dry run, 67 of the 69 three-letter roots change, and 67 five-letter roots moved to clear the hook and holder checks. With the hook check gone, only the 8 holder moves remain. Everything else that spells them followed: 196 overlay sense forms, 687 compound fields, and 6,757 doc reties in 97 files, counts that fall when the 59 hook moves drop out.
- **The same respelling re-places every nature and mind root** ([nature and mind pass](#nature-mind-pass)). The hook check kept those roots off three-letter onsets; without it, `convert-word` spreads them closer to their floor.

## Motivation

One rule for every root: the last two letters of any root say what kind of thing it names and what that thing does. The phonology page loses its exception ("Three-letter roots have no tail"), and an unfamiliar overlay host in a text gives the reader the same hint any other root does.

## What it costs

These are learner costs. Retie and test-fixture work is not.

- **English echo almost disappears.** With one free letter there's little left to tune: the mean echo of the three-letter roots falls from 0.74 to 0.21 (per row in the [table](#three-letter-roots)). Today these roots are placed echo-first (`ezo` zebra, `aza` sandwich).
- **Roots of the same overlay kind can differ by one letter.** Two members of one kind and one shape can only differ in their first vowel. Today no pair in a group is one letter apart; the dry run has 12 pairs within one overlay kind:

- clause-pole: `aba` backpack / `ala` sand
- clause-pole: `ahu` wall / `aru` timer
- clause-pole: `ebo` paper-roll / `ezo` zebra
- clause-pole: `ehe` east-west / `ere` gemini
- clause-pole: `ehe` east-west / `ohe` east
- clause-pole: `oho` door / `ohe` east
- of-relation: `ada` jar / `aha` country
- sake: `awa` tool / `ewa` present
- sake: `ewa` present / `eda` egg
- sake: `oga` ballot / `oba` lungs
- sake: `owo` knot / `odo` strawberry
- sake: `owo` knot / `uwo` lightbulb

  The sake group has five, and its forms are learned together. No placement fixes this while the seeds stay the same: present and tool are both tool + `holds`.
- **Some tails are already full.** These kind + shape pairs hold four roots each: sign + one, body + holds, nature + order, food + holds, sign + order, tool + holds, tool + one, sign + holds. A future overlay seeded in one of them can't get a three-letter root, so it needs another seed or a five-letter root. One cell overflowed before placement: sign + `holds` had five candidates (book, ledger, ballot, memo, record), so record is called `one` (a round button) here ([open questions](#open-questions)).

## Rules

### Kind and shape

A three-letter row fills `kind` and `shape` in [`lexicon-published.csv`](../../data/lexicon-published.csv), using the same calls as a five-letter row. `size` stays empty. `npm test` fails on a three-letter row whose root doesn't end in its tail. Changing a three-letter row's kind or shape is a respelling, as it is for any root.

### Spacing

Inside one overlay group (`kind:<pos>/<overlay kind>`), no two three-letter roots share their first two letters. Roots on the same PoS stay distinct, as today. Under this rule east (`/h/` only) and door (`/g/`, `/th/`) may both start `oh`: they share an overlay kind but no group.

### What stays the same

Placement still keeps a new holder host off the start of a kept root, never gives a listed compound a second split, and never spells an English word the doc lint reads as English. These are the existing guards in `shortRootGuards`. Five-letter rows re-placed in the same run are checked against the new three-letter spellings.

## The roots {#the-roots}

### Three-letter roots {#three-letter-roots}

*Overlays* lists the overlay kinds the row hosts; *pronoun* marks a row forced short as a pronoun. Echo is the [`echo-metric`](../../src/echo-metric.ts) score of the root against the concrete label. The last column is the reason for each kind and shape call, naming a five-letter row that makes the same call where there is one. These calls are editorial and should be reviewed before building.

| Seed | Concrete | Overlays | Kind | Shape | Now | Proposed | Echo now → proposed | Why this kind and shape |
|---|---|---|---|---|---|---|---|---|
| 😐 | neutral | pronoun | mind | one | `una` | `umo` | 0.88 → 0.13 | neutral face, like deadpan |
| 😮 | surprise | mirative | mind | one | `ezu` | `emo` | 0.93 → 0.07 | surprised face, like speechless |
| ❤️ | heart | evidential | body | one | `aho` | `abo` | 0.88 → 0.13 | organ, like organ/brain |
| 👁️‍🗨️ | attest | evidential | sign | one | `odo` | `ugo` | 0.80 → 0.00 | a symbol mark |
| 💭 | thought | may | mind | holds | `ovu` | `oma` | 0.88 → 0.13 | thought balloon: hollow outline |
| ☝️ | point | stimulus | person | order | `obu` | `oye` | 0.88 → 0.13 | gesture only a person makes; a heading |
| 🤝 | handshake | pronoun | person | holds | `aha` | `aya` | 1.00 → 0.13 | gesture with others |
| 👂 | ear | evidential | body | holds | `ewa` | `eba` | 0.40 → 0.40 | takes in sound |
| 🫁 | lungs | sake | body | holds | `oyu` | `oba` | 0.00 → 0.00 | holds air |
| 🦴 | bone | of-relation | body | order | `obo` | `obe` | 1.00 → 0.88 | no job; long outline |
| 🧑 | person | pronoun | person | one | `obe` | `eyo` | 0.88 → 0.13 | like silhouette |
| 🕵️ | investigate | evidential | person | order | `une` | `eye` | 0.45 → 0.09 | follows clues along a course |
| 🦓 | zebra | clause-pole | creature | one | `ezo` | `ezo` (kept) | 0.88 → 0.88 | no job; compact |
| 🐾 | paw-prints | evidential | body | order | `oba` | `ube` | 0.88 → 0.88 | a trail you follow |
| 🐣 | hatch | phasal | doing | one | `oha` | `avo` | 0.88 → 0.13 | any creature's action; once on the spot |
| 🥀 | wilt | phasal | doing | takes-away | `ewe` | `ovu` | 1.00 → 0.00 | any creature's action; ends/withers |
| 🌱 | seedling | phasal | nature | order | `uze` | `ele` | 0.88 → 0.44 | a life stage |
| 🪹 | empty-nest | former-climate | nature | holds | `eno` | `ela` | 0.88 → 0.29 | nest holds, like nest |
| 🍓 | strawberry | sake | food | one | `ozo` | `odo` | 1.00 → 0.50 | like cherry |
| 🥪 | sandwich | locative | food | holds | `aza` | `uda` | 1.00 → 0.25 | bun holds its filling |
| 🥚 | egg | sake | food | holds | `ega` | `eda` | 1.00 → 0.40 | shell holds yolk |
| 🥣 | bowl | ability | food | holds | `ubo` | `oda` | 0.88 → 0.13 | dishware; holds |
| 🫙 | jar | of-relation | food | holds | `ahe` | `ada` | 0.88 → 0.13 | kitchen; like amphora |
| 🗺️ | map | plan | sign | order | `ama` | `age` | 1.00 → 0.13 | charts a route |
| 🗾 | country | of-relation | place | holds | `agu` | `aha` | 0.88 → 0.13 | label is country: an open space |
| 🧭 | compass | sake | counting | order | `ame` | `ure` | 0.31 → 0.00 | instrument; a heading |
| 🧱 | wall | clause-pole | place | takes-away | `ave` | `ahu` | 0.00 → 0.00 | fixture; wards off |
| 🪵 | wood | of-relation | nature | order | `uwu` | `ule` | 1.00 → 0.13 | no job; long log |
| 🌉 | bridge | locative | place | order | `ebu` | `ahe` | 0.88 → 0.19 | a path you travel |
| 🎠 | carousel | locative | doing | holds | `uge` | `eva` | 0.88 → 0.13 | play; holds riders, like ferris-wheel |
| ⚓ | anchor | phasal | tool | takes-away | `age` | `awu` | 1.00 → 0.29 | stops the ship |
| ⌛ | sand | clause-pole | nature | holds | `ano` | `ala` | 0.31 → 0.13 | label is sand: a mass |
| ⏲️ | timer | clause-pole | counting | takes-away | `oma` | `aru` | 0.25 → 0.13 | counts down, ends, like hourglass |
| ⭐ | star | pronoun | nature | one | `oza` | `alo` | 0.88 → 0.13 | sun/moon/stars are nature |
| 🌠 | shooting-star | want | nature | order | `ohu` | `ale` | 0.88 → 0.13 | travels a course |
| 🎁 | present | sake | tool | holds | `ebe` | `ewa` | 1.00 → 0.13 | a box holds |
| 🥅 | goal | clause-pole | doing | holds | `ogo` | `ova` | 1.00 → 0.13 | sports; net holds |
| 🎣 | fishing | evidential | doing | takes-away | `evo` | `evu` | 0.88 → 0.88 | removes fish from water |
| 🎭 | theater | notional | person | takes-away | `avo` | `eyu` | 0.75 → 0.13 | performing; masks hide |
| 🪢 | knot | sake | tool | one | `ana` | `owo` | 1.00 → 0.00 | no job; compact |
| 🧦 | socks | pairing | body | holds | `aze` | `uba` | 0.88 → 0.00 | holds the foot |
| 🎒 | backpack | clause-pole | body | holds | `aba` | `aba` (kept) | 1.00 → 1.00 | like bag |
| 🎤 | microphone | pronoun | tool | one | `amu` | `awo` | 0.88 → 0.13 | like studio-mic |
| 🎧 | headphones | pronoun | tool | holds | `eho` | `owa` | 0.88 → 0.00 | holds the head, like a hat; like sound |
| 💡 | lightbulb | sake | tool | one | `ado` | `uwo` | 0.31 → 0.00 | round bulb |
| 📖 | book | evidential | sign | holds | `ugu` | `aga` | 0.31 → 0.19 | like notebook |
| 📒 | ledger | clause-pole | sign | holds | `uhu` | `ega` | 0.25 → 0.13 | like notebook |
| 📜 | scroll | pronoun | sign | order | `oze` | `oge` | 0.88 → 0.38 | a told sequence, like page |
| 🔖 | bookmark | clause-pole | sign | order | `ura` | `uge` | 0.31 → 0.31 | a place in a sequence |
| 🪙 | coin | identity | counting | one | `ugo` | `oro` | 0.88 → 0.13 | like dollar |
| 💰 | money | residue | counting | holds | `amo` | `ara` | 0.88 → 0.13 | bag holds money |
| 🗳️ | ballot | sake | sign | holds | `ahu` | `oga` | 0.13 → 0.00 | ballot box holds votes |
| 📝 | memo | deontic | sign | holds | `ume` | `uga` | 0.88 → 0.00 | like notepad |
| ⚙️ | machine | cause | tool | order | `ege` | `ewe` | 0.00 → 0.00 | a cycle |
| 🧰 | tool | sake | tool | holds | `ulo` | `awa` | 0.31 → 0.00 | toolbox holds |
| 🧪 | tube | attempt | tool | holds | `udu` | `uwa` | 1.00 → 0.13 | like petri-dish |
| 🚪 | door | clause-pole | place | one | `oye` | `oho` | 0.13 → 0.13 | fixture, like window |
| 🪞 | mirror | similative | tool | one | `umu` | `ewo` | 0.75 → 0.13 | no job; compact |
| 🧻 | paper-roll | clause-pole | body | one | `olu` | `ebo` | 0.31 → 0.88 | put on the body (like soap); compact roll |
| 🪪 | id | proxy | sign | one | `ade` | `ago` | 1.00 → 0.17 | like label |
| ⛔ | no-entry | deontic | sign | takes-away | `ede` | `agu` | 1.00 → 0.00 | forbids, like prohibited |
| ➡️ | east | clause-pole | place | order | `odu` | `ohe` | 0.60 → 0.00 | a heading, like west |
| ↔️ | east-west | clause-pole | place | order | `eda` | `ehe` | 1.00 → 0.40 | a heading, like vertical |
| ♊ | gemini | clause-pole | counting | order | `uwe` | `ere` | 0.00 → 0.13 | zodiac, like aries |
| ⏺️ | record | pronoun | sign | one | `ere` | `ego` | 1.00 → 0.38 | FORCED: sign/holds overflow; round button |
| 💱 | currency-exchange | exchange | place | holds | `ehe` | `eha` | 1.00 → 0.82 | facility pictograph, like atm |
| ✅ | check | decision | sign | one | `ehu` | `ogo` | 0.88 → 0.19 | a mark |
| 🔤 | letters | mention | sign | order | `ele` | `ege` | 1.00 → 0.13 | like upper-case |
| 🟢 | green | deontic | nature | order | `ego` | `ole` | 0.88 → 0.00 | colors are nature; like red/yellow (light sequence) |

### Five-letter roots that move {#five-letter-roots}

Each of these clashes with a new three-letter root and is re-placed with its own kind, shape and size. *Holder*: a root that starts with a `/th/` holder host reads as a holder seam ([seams](../meta/lexicon.md#seams)). In the dry run the set was a fixed point: re-placing exactly these rows produced no other clash.

The run also moved 59 **l / m**-second roots whose first three letters were a new three-letter root (`ogema` grin, `adale` tree, …). Those no longer clash, since a three-letter root never fuses with a hook (D-50), and the [nature and mind pass](#nature-mind-pass) re-places them anyway.

| Seed | Concrete | Kind | Now | Proposed | Why it moves |
|---|---|---|---|---|---|
| 🛬 | arrival | counting | `evure` | `evore` | holder: starts with host `evur` |
| 🔔 | bell | counting | `abora` | `ebora` | holder: starts with host `abor` |
| 🪗 | accordion | counting | `ugora` | `ugara` | holder: starts with host `ugor` |
| 🎹 | piano | counting | `ebare` | `abare` | holder: starts with host `ebar` |
| 🧮 | abacus | counting | `abore` | `abure` | holder: starts with host `abor` |
| 💴 | yen | counting | `eyero` | `eyoro` | holder: starts with host `eyer` |
| 📅 | calendar | counting | `ugore` | `ugare` | holder: starts with host `ugor` |
| 📳 | vibrate | counting | `evuro` | `avuro` | holder: starts with host `evur` |

## Dry run

In a scratch worktree on `9d7b975b`:

- **Placement:** one `convert-word --lexicon --only` pass over the 69 three-letter rows and 67 five-letter rows, with no manual fixes. Run with the three-letter rows alone, placement stopped inside the short anneal, because the hook check let kept five-letter roots block too many tail spellings. That check is gone, so a rerun may place the three-letter rows with fewer five-letter moves.
- **Retie:** 6,757 reties in 97 files, 57 to review, nothing blocking.
- **`grammar-check`:** all 2,720 doc sentences have exactly one tree.
- **Agebon doc lint:** passes.
- **`npm test`:** 20 failing tests and suites, none of them a parser collision.
  - Literals the retie can't follow in tests: `hamom`, `gobom`, the `vawalal` TTS fixtures.
  - Unbound-resume examples that became real words: `zadar` now resumes jar (`ada`) and `zalar` sand (`ala`).
  - The Claritish editor near-miss fixture (`thunder`).
  - The tests of the rule this replaces: the overlay-group spacing test, and "a tail on a three-letter row".
  - Two artifacts of the dry-run patch, not the proposal: the size-field fixture, and the English-word test, which now hits the patch's empty-tail error first.

## Nature and mind pass {#nature-mind-pass}

Every five-letter **nature** (`l`) and **mind** (`m`) row is re-placed in the same `convert-word` run. Their tail consonant is **l / m**, so the old hook check kept each one's first three letters off every three-letter root. With hook compounds on five-letter roots only (D-50), any onset is free, and the placer can spread these rows closer to the floor of their kind. Only their onset and middle vowel change: kind, shape and size stay.

**Dry run** on today's lexicon (`35fc3555` plus the D-50 change, three-letter roots as they are now), in a scratch copy: `convert-word --lexicon --only` over all 169 rows (85 nature, 84 mind).

| | Before | After |
|---|---|---|
| Roots changed | | 120 of 169 |
| Confusing pairs, mind (floor 36) | 52 | 45 |
| Confusing pairs, nature (floor 37) | 55 | 50 |
| Confusing pairs, all kinds | 828 | 816 |
| Middle vowel is the size's (sized rows) | 96.9% | 97.9% |
| First consonant is the label's | 91.0% | 91.1% |
| Compound fields retied | | 347 |
| Doc reties | | 865 in 55 files, 1 to review, 0 blocking |

Run alone, this pass trades a retie for 12 fewer confusing pairs. Run with the three-letter tails, it adds no retie of its own, and the five-letter placer checks listed compounds against the new three-letter spellings. Build it with the tails, or alone if the tails are dropped. The 120 changes in that run (they move again when the pass runs beside the tails):

<details>
<summary>Roots changed</summary>

| Seed | Concrete | Kind | Now | Proposed |
|---|---|---|---|---|
| 🙃 | upside-down | mind | `abemo` | `ubamo` |
| 🫠 | melt | mind | `omemu` | `ememu` |
| 😉 | wink | mind | `ewuma` | `ewema` |
| 😊 | smile | mind | `azuma` | `azama` |
| 😍 | crush | mind | `agoma` | `agama` |
| 🤩 | starstruck | mind | `azome` | `azame` |
| 😘 | air-kiss | mind | `uruma` | `erema` |
| 😋 | yummy | mind | `ayama` | `oyama` |
| 😛 | tongue-out | mind | `adamu` | `adomu` |
| 😜 | tease | mind | `edoma` | `edema` |
| 🤑 | greed | mind | `ugama` | `ugema` |
| 🫣 | peek | mind | `ebome` | `ebeme` |
| 🤫 | hush | mind | `ohomu` | `ahemu` |
| 🫡 | salute | mind | `ozume` | `uzome` |
| 🤐 | secret | mind | `ezamu` | `ozemu` |
| 🤨 | skeptical | mind | `uzomu` | `eyumu` |
| 😑 | deadpan | mind | `odemo` | `edemo` |
| 😶 | speechless | mind | `ezamo` | `ozemo` |
| 🫥 | invisible | mind | `onemu` | `enemu` |
| 😏 | smirk | mind | `uzume` | `ezeme` |
| 😒 | unimpressed | mind | `unumu` | `unomu` |
| 🙄 | eye-roll | mind | `aromu` | `ayomu` |
| 😬 | grimace | mind | `egumu` | `egemu` |
| 😮‍💨 | sigh | mind | `uzamo` | `azamo` |
| 🙂‍↔️ | head-shake | mind | `uhemu` | `ehemu` |
| 🙂‍↕️ | nod | mind | `ename` | `uname` |
| 😌 | relief | mind | `erumo` | `uremo` |
| 😔 | pensive | mind | `ebamu` | `ebemu` |
| 😪 | sleepy | mind | `ozumo` | `uzemo` |
| 🤤 | drool | mind | `aduma` | `oduma` |
| 🫩 | bleary | mind | `ebamo` | `ubemo` |
| 🤕 | injured | mind | `enemu` | `enamu` |
| 🤢 | nauseated | mind | `onamu` | `onomu` |
| 🤧 | sneeze | mind | `ozumu` | `ozomu` |
| 🥵 | hot | mind | `ehamu` | `uhamu` |
| 🥶 | cold | mind | `ogemu` | `ogomu` |
| 🥴 | woozy | mind | `uwamu` | `uwumu` |
| 🤯 | mind-blown | mind | `umamo` | `amamo` |
| 😎 | cool | mind | `egumo` | `ugamo` |
| 😕 | confused | mind | `ugamu` | `ogemu` |
| 🫤 | meh | mind | `ememo` | `omemo` |
| 😟 | worried | mind | `owemu` | `ewemu` |
| ☹️ | frown | mind | `uvamu` | `ovamu` |
| 😳 | blush | mind | `ubame` | `obome` |
| 🥺 | plead | mind | `ubeme` | `obeme` |
| 😨 | fear | mind | `evumu` | `avemu` |
| 😰 | anxious | mind | `anumu` | `anamu` |
| 😱 | scream | mind | `uyomu` | `aremu` |
| 😓 | stressed | mind | `eyomu` | `uzemu` |
| 🥱 | yawn | mind | `oyomo` | `uyomo` |
| 😤 | huff | mind | `uhamu` | `ahamu` |
| 😠 | angry | mind | `unomu` | `onemu` |
| 💔 | heartbreak | mind | `uhomu` | `ohamu` |
| ❤️‍🔥 | passion | mind | `aboma` | `abama` |
| 🩷 | pink | nature | `ebolo` | `ebulo` |
| 💫 | dizzy | mind | `edumu` | `edemu` |
| 🙌 | hooray | mind | `ehama` | `uhuma` |
| 🫶 | care | mind | `eguma` | `egema` |
| 🫦 | lip-bite | mind | `eloma` | `elema` |
| 🙎 | pout | mind | `abomu` | `abamu` |
| 💁 | sass | mind | `azumu` | `azamu` |
| 🤦 | face-palm | mind | `ovemu` | `evemu` |
| 🧘 | meditation | mind | `emamo` | `umemo` |
| 🕸️ | cobweb | nature | `agola` | `ugola` |
| 💐 | bouquet | nature | `oyola` | `abola` |
| 🌸 | cherry-blossom | nature | `ohela` | `ehela` |
| 🌻 | sunflower | nature | `ezala` | `azala` |
| 🌼 | blossom | nature | `abela` | `obela` |
| 🪻 | hyacinth | nature | `ohele` | `ahele` |
| 🪴 | plant | nature | `abolo` | `uyolo` |
| 🌳 | tree | nature | `adale` | `edale` |
| 🌴 | palm | nature | `ebale` | `abale` |
| 🌵 | cactus | nature | `agolu` | `egolu` |
| 🌾 | grain | nature | `ogela` | `ugela` |
| 🌿 | herb | nature | `ubela` | `ebela` |
| 🍀 | clover | nature | `ogelo` | `agelo` |
| 🍂 | fallen-leaf | nature | `ovelu` | `avelu` |
| 🪺 | nest | nature | `enela` | `onola` |
| 🍄 | mushroom | nature | `omelo` | `umelo` |
| 🪾 | dead-tree | nature | `adalu` | `edalu` |
| 🥫 | metal | nature | `emulo` | `amulo` |
| 🧊 | ice | nature | `ozulo` | `ezulo` |
| 🌍 | earth | nature | `evala` | `ovala` |
| 🌑 | new-moon | nature | `onalu` | `enalu` |
| 🌖 | waning-moon | nature | `owalu` | `uwalu` |
| 🌙 | moon | nature | `umale` | `omale` |
| ☀️ | sun | nature | `uzale` | `ezale` |
| 🌌 | galaxy | nature | `agala` | `ugala` |
| ☁️ | cloud | nature | `ugala` | `ogala` |
| ⛈️ | thunderstorm | nature | `evulu` | `unulu` |
| 🌦️ | showers | nature | `uhala` | `ahula` |
| 🌪️ | tornado | nature | `edulu` | `odulu` |
| 🌫️ | fog | nature | `avalu` | `evulu` |
| 🌀 | cyclone | nature | `azulu` | `uzulu` |
| 🌈 | rainbow | nature | `urule` | `arule` |
| ❄️ | snowflake | nature | `ezelu` | `ozelu` |
| ☃️ | snowman | nature | `uzolo` | `ozalo` |
| ☄️ | comet | nature | `ugale` | `ogale` |
| 💧 | droplet | nature | `udelo` | `odelo` |
| 🌊 | ocean | nature | `ehala` | `ohala` |
| ✨ | sparkles | nature | `ezela` | `ezula` |
| 🎗️ | awareness | mind | `awema` | `owema` |
| 🥇 | gold | nature | `egule` | `agule` |
| 🥈 | silver | nature | `ozule` | `azule` |
| 🥉 | bronze | nature | `abule` | `obule` |
| 🧶 | yarn | nature | `uyula` | `ayula` |
| 💎 | gemstone | nature | `ehalo` | `ohelo` |
| 🫧 | bubbles | nature | `anela` | `abela` |
| 🚰 | water | nature | `uwola` | `owula` |
| ⚛️ | atom | nature | `odelo` | `adelo` |
| 🔆 | bright | nature | `ebalo` | `obulo` |
| 🟡 | yellow | nature | `ayule` | `eyule` |
| 🟣 | purple | nature | `eyule` | `ebule` |
| 🟤 | brown | nature | `unulo` | `anulo` |
| ⚫ | black | nature | `abulo` | `ubulo` |
| 🟫 | ground | nature | `egula` | `agula` |
| 🩶 | gray | nature | `ugalo` | `egulo` |
| 𐂝 | wool | nature | `ewula` | `uwula` |
|  | chip | nature | `ohelo` | `ehelo` |
|  | strip | nature | `azole` | `uzole` |

</details>

## Build {#build}

1. **Code.**
   - `annealShortRoots` gives each tailed row the four forms `V` + its tail.
   - `pairHard` checks the first two letters instead of distance and consonant.
   - `validateRootTails` checks three-letter tails.
   - Raise a clear error when a kind + shape has more rows than free forms.
   - Update the tests listed above.
2. **Data.** Fill `kind` and `shape` on the 69 rows as in the [table](#three-letter-roots), after review.
3. **Placement.** Run `npm run convert-word -- --lexicon --only <the three-letter rows>,<every nature and mind row>,<the clashing five-letter rows>`. The clashing set is the other roots that start with a new holder host; recompute it from the new three-letter spellings, and repeat until it stops changing (it did after one round at `9d7b975b`).
4. **Retie.** Run `npm run retie-docs`, then `-- --write`, then `npm run build`, `npm test` and `npm run grammar-check`. Read the review list.
5. **Docs.**
   - [compounds.md § root tails](../grammar/compounds.md#root-tails): the tail applies to every root.
   - [lexicon.md](../meta/lexicon.md): [root tails](../meta/lexicon.md#root-tails) and [size](../meta/lexicon.md#size), where three-letter rows now carry kind and shape; the spacing rule in [root length](../meta/lexicon.md#root-length).
   - The `annealShortRoots` doc comment.

## Open questions

- **Whether to build it at all.** The dry run shows it's feasible, but the learner gain (one uniform tail rule) costs most of the echo on the most frequent roots, and adds 12 one-letter pairs inside overlay kinds. The [nature and mind pass](#nature-mind-pass) stands on its own if the tails are dropped.
- **Rerun.** Repeat the dry run without the hook check: the three-letter spellings, the one-letter pairs and the five-letter moves may all come out differently.
- **Record.** Its honest shape is `holds` (it stores), but sign + `holds` is full. The options: keep `one`, move another sign row out of `holds`, or give record a five-letter root.
- **The sake group.** Its one-letter pairs could be broken by re-seeding a member to a different kind or shape, rather than by placement.
