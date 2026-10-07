# Proposal: fill the compound dictionary by head root

**Status:** PROPOSED  
**Related:** `ngsl-lexicon-fill.md` (the frequency pass, whose `Compound` rows this pass absorbs), `unicode-pictograph-seeds.md` (seeds for new generic heads)  
**Design authority:** compounds stay in [`data/lexicon-compounds.csv`](../../data/lexicon-compounds.csv) and roots in [`data/lexicon-published.csv`](../../data/lexicon-published.csv). Grammar is unchanged: [lexical compounds](../grammar/x-compounds.md#lexical-compounds). Head choice follows [compound heads](../meta/lexicon.md#compound-heads). This note covers a **systematic data pass** only.

## Motivation

The compound file has about 190 rows, added one gap at a time. Most heads have only one to three compounds. *House* is the exception, with 15. Everyday kinds that English treats as one word (*kitchen*, *sparrow*, *basil*, *slipper*, *cider*) are missing, so learners have to make an `x` compound on the spot or say it with two words.

Going through the dictionary one head root at a time gives each category a complete, consistent set of members. It also shows where a head root is missing before any of its compounds are written.

## How a compound row reads

A dictionary compound is one stem: **left root + boundary letter + head root**. In a sentence, the PoS letter goes in front and the whole-word ending goes at the end, as for any content word.

| Piece | Picks | Values |
|-------|-------|--------|
| **Boundary letter** (between the roots, stored in `join`) | the sense of the **left** root | **-l** everyday kind, **-m** abstract sense, **-n** name, **-r** resume |
| **Whole-word ending** (added at use) | the sense of the **head**, so of the whole entry | **-l** reads the row's `concrete`, **-m** reads the row's `abstract` |

So the `join` column is about the left root only. Write **-l** when the left root's concrete sense specifies the head: *bed* **-l** *house* = *bedroom*. Write **-m** when its abstract sense does: *formality* **-m** *shoe* = *dress shoe*, where 🤵 *tuxedo* is read as *formality*.

The row's `abstract` column is optional. When it is filled, it is the entry's reading with **-m**: *bedroom* **-m** = *sanctum*. Leave it empty unless the head's abstract sense really carries over. Never fill it just because the left root has an abstract.

## When a compound earns a row

Add a row only when **all** of these hold:

1. **It is one thing,** not a list or a thing plus a property. A property uses `/ɡ/`; *a blue dog* is two words.
2. **It is a fixed kind** that English (or most languages) names with one word or a fixed phrase. Pairings made up on the spot stay live `x` compounds.
3. **No root already has the sense.** Check `concrete`, `abstract` and `english_aliases` (`npm run lexicon-search`, `node scripts/find-english.mjs --kind root`). Many specific kinds are seeds already: *garlic*, *rose*, *owl*, *sneaker*. The validator rejects a compound gloss that is already a published sense.
4. **The head is the most specific root that fits.** *Sparrow* goes on 🐦 *bird*, not 𓄛 *animal*. The generic heads (𓄛 *animal*, 🫙 *jar*, 🧺 *basket*) only head a class name that no narrower root covers (*pet*, *livestock*, *luggage*). 𓉐 *room* is an ordinary head: no root names a narrower kind of room, so *attic* and *cellar* go on it directly.
5. **The left root narrows the head in a way a learner can guess,** or the mnemonic makes the link easy to remember.

Prefer frequent words. A category can stop at the first 20–40 members by frequency. A complete taxonomy is not the goal.

## Categories

Each pass takes one domain and its head roots. Rows are named here by seed and English label, never by root spelling, so the list survives respelling. *Already in* lists compounds that already exist, so a pass does not repeat them.

| Domain | Head roots | Sample fills | Already in |
|--------|-----------|--------------|------------|
| Seasoning | 🌿 *herb*, 🍛 *spice*, 🌶️ *pepper*, 🧂 *salt* | basil, mint, parsley, cinnamon, paprika, chili, black pepper | |
| Plants | 🌳 *tree*, 💮 *flower*, 🍃 *leaf*, 🌾 *grain*, 🥬 *greens*, 🍈 *fruit*, 🫐 *berry*, 🌰 *nut*, 🍄 *mushroom* | willow, birch, wheat, oat, barley, lettuce, cabbage, raspberry, walnut, acorn | oak, blueberry |
| Animals | 🐦 *bird*, 🐟 *fish*, 🐛 *bug*, 🐍 *snake*, 🐚 *shell*, 🐕 *dog*, 🐈 *cat*, 🐄 *cow*, 𓄛 *animal* (class names only) | sparrow, crow, trout, salmon, moth, wasp, puppy, kitten, calf, pet, livestock | |
| Dishes | 🍞 *bread*, 🧀 *cheese*, 🍖 *meat*, 🍲 *soup*, 🥗 *salad*, 🍪 *cookie*, 🍜 *noodles*, 🍚 *rice*, 🥚 *egg*, 🍬 *candy* | toast, bun, pork, beef, broth, porridge, omelet, biscuit | cake, cream, sauce |
| Drinks | 🥤 *drink*, 🍵 *tea*, 🍷 *wine*, 🍺 *beer*, 🧃 *juice*, 🥛 *milk*, ☕ *coffee* | lemonade, cider, latte, cocoa, herbal tea | soda |
| Rooms and buildings | 𓉐 *room*, 🏠 *house*, 🏪 *shop*, 🏫 *school*, 🗼 *tower*, 🛖 *hut*, ⛺ *tent* | attic, cellar, hall, garage, bakery, pharmacy, barn, college | bedroom, kitchen, bathroom, library, museum (all on *house*, see [open questions](#open-questions)) |
| People | 🧑 *person*, plus [role compounds](../grammar/roles.md#role-compounds) for doers | sibling, cousin, neighbor, stranger, guest, host | friend, parent, resident, lawyer |
| Groups | 👥 *community*, 🏛️ *institution* | tribe, crew, club, union, ministry, court | army, jury, council, government |
| Clothing | 🧥 *coat*, 👕 *shirt*, 👗 *dress*, 👞 *shoe*, 🧢 *hat*, 🧤 *gloves*, 🧦 *socks* | jacket, sweater, slipper, apron, uniform, helmet-types | raincoat, dress shoe |
| Containers | 🫙 *jar*, 🧺 *basket*, 🪣 *bucket*, 👜 *bag*, 🛢️ *barrel*, 📦 *box* | bottle, can, crate, wallet, envelope-types | lid |
| Tools and devices | ⚙️ *machine*, 🧰 *tool*, 🔪 *knife*, 🔨 *hammer*, 🪔 *lamp*, 🕰️ *clock*, 📱 *phone* | engine, motor, pump, scissors-types, streetlight, headlight | |
| Light | 🔆 *bright* (radiance), 🪔 *lamp* (source) | sunlight, moonlight, candlelight | |
| Games | 🎮 *game*, 🏀 *ball* | board game, card game, chess, tag | videogame |
| Vehicles | 🚗 *car*, 🚤 *boat*, 🚢 *ship*, 🚆 *train*, 🚚 *truck*, ✈️ *airplane* | ferry, tram, cart, sailboat | van |
| Land and water | ⛰️ *mountain*, 🟩 *field*, 🛣️ *road*, 🌊 *ocean*, 🏝️ *island*, 🟫 *ground* | lake, river, pond, path, street, meadow | hill, valley, floor |
| Materials | 🥫 *metal*, 𐂧 *cloth*, 🪵 *wood*, 🪨 *rock*, 🧻 *paper* | iron, steel, silk, cotton, gravel | leather |
| Body | ✋ *hand*, 🦶 *foot*, 🧑‍🦲 *head*, 👁️ *eye*, 👄 *mouth*, 🦴 *bone*, 🩸 *blood* | palm, heel, eyelid, jaw, rib, vein | shoulder |
| Weather and time | 🌧️ *rain*, 🌬️ *wind*, 🌨️ *snow*, ☁️ *cloud*, 🌅 *day*, 🌃 *night* | drizzle, storm, breeze, morning, evening, weekday | afternoon |
| Text and media | 📖 *book*, 📄 *page*, 📜 *tale*, 💬 *speech*, 🎶 *tune*, 🎞️ *film* | diary, poem, letter, song, article | textbook, menu, website, blog |
| Health | 🤒 *sick*, 😷 *illness*, 💊 *pill*, 🩹 *bandage* | flu, fever, vaccine, ointment | |
| Money | 💰 *money*, 🪙 *coin*, 🏦 *bank*, 🧾 *receipt* | salary, fee, rent, loan, fare | mortgage, pension, budget |

Some English labels in the table (*spice*, *fruit*, *shop*, *metal*, *day*) are the sense a row is used for, not its `concrete` label. Before each pass, check every head against the CSV.

## Method

One category per batch. Steps 1–3 are mechanical. Step 4 needs editor review before step 5. `npm run compound-fill` covers each step; roots are named by seed or English label, never by spelling.

0. **Audit the heads.** `npm run compound-fill -- heads` lists heads by compound count. `npm run compound-fill -- heads 🐦 🐟` shows each head's row, its compounds, and whether it is a generic head. A cue that names no root is a [missing head](#when-a-head-is-missing).

1. **Collect candidates.** For each head, take the hyponyms of its WordNet synset. `npm run compound-fill -- synsets herb spice` lists the senses (the culinary ones are *herb.n.02* and *spice.n.02*). `npm run compound-fill -- candidates herb.n.02 spice.n.02` lists their direct hyponyms ranked by word frequency and hides senses already covered (`--all` shows them). A broad head such as *bird.n.01* needs a deep walk with a rank cap: `--depth 8 --max-rank 15000`. `--triage` adds any `Compound` rows still open in `ngsl-lexicon-triage.csv`, ranked by NGSL rank.
2. **Drop covered senses.** `candidates` already hides exact matches. For other words, `npm run compound-fill -- check <word>…` (or `-` for stdin) reports exact hits on a root's `concrete`, `abstract`, English-by-PoS or alias, a compound, or an overlay gloss. For near matches, run `node scripts/find-english.mjs '<word>' --kind root` and `npm run lexicon-search -- <word>`. Drop any word whose sense is already a root's `concrete`, `abstract` or alias, or already a compound.
3. **Drop non-compounds.** Remove words that fail [when a compound earns a row](#when-a-compound-earns-a-row): two things, a property, a name, or a pairing too ad hoc to look up.
4. **Draft rows for review.** For each survivor, pick:
   - the **head**: the most specific fitting root;
   - the **left root**: the published root that narrows it best;
   - the **boundary letter**: **-l** if the left root is in its concrete sense, **-m** if it is in its abstract sense;
   - an optional `abstract`, the whole entry's **-m** reading;
   - a **mnemonic** in the house pattern *"<left> specifying <head> is …"*.

   Write the batch as a draft CSV with the header `english,left,join,head,abstract,mnemonic`, naming `left` and `head` by seed or label. `npm run compound-fill -- draft <file>` prints the review table with each stem spelled from the published CSV, the validator's errors, and warnings the validator does not raise (a gloss that is already an alias or English-by-PoS lemma, a generic head, a mnemonic that does not open with *"<left> specifying <head>"*). Stop for review.
5. **Write approved rows.** `npm run compound-fill -- draft <file> --write` appends the rows to `lexicon-compounds.csv`, and only when no row has an error. Then run `npm run check-compounds`, `npm test`, and `npm run cheat-sheet-blocks -- --write` (the Agazan → English cheat sheet lists compounds).

### What the validator catches

`npm run check-compounds` rejects:

- a stem that is not exactly left + boundary + head
- a boundary letter outside **-l** / **-m** / **-n** / **-r**
- an unpublished or non-content root
- a stem that is already a simple root
- a stem that splits into published roots in more than one way
- the same root on both sides
- a gloss that is already a published sense or another compound's sense
- a missing gloss or mnemonic

If the stem splits in more than one way, pick a different left root. Never respell a root to make the split unique.

## When a head is missing

If a category needs a head that no root covers, stop and add the head first. Retitling a compound's head later means respelling its stems.

1. Prefer **retitling** an existing row whose emoji already pictures the generic sense and which has little to lose (no abstract, or an abstract that still fits). Examples: 🫐 *blueberry* → *berry*, 🧢 *cap* → *hat*. The specific sense it held becomes a compound.
2. Otherwise **add a seed**: an unused emoji, or a non-emoji pictograph under [seeds](../meta/lexicon.md#what-can-be-a-seed). Examples: 𓄛 *animal* (the Egyptian hide sign written with mammal words), 𓉐 *room* (the floor-plan sign).
3. Place or respell the root with `npm run convert-word -- --lexicon --only <seed>`, then retie as in `AGENTS.md`.

## Open questions

- **Re-head rooms onto 𓉐 *room*.** *Bedroom*, *bathroom* and *kitchen* sit on 🏠 *house*, from before *room* existed. Re-heading them respells their stems and needs a retie of the docs that use them. *Library*, *museum*, *prison*, *restaurant* and *firehouse* are whole buildings and stay on *house*.
- **People heads.** *Sibling*, *cousin* and the other family words might be better as [social ties](../grammar/relations.md) than as *person* compounds. Check the owning page before each item in the people pass.
- **Class names on generic heads.** *Pet* (*house* **-l** *animal*?) and *livestock* (*farm* **-l** *animal*?) are the main cases for 𓄛 *animal*. Decide these together so the class-name pattern is consistent.

## Non-goals

- Changing how compounds are spelled or read: no grammar change.
- Mid-word `x` compounds. Those are made live and are not listed.
- A complete taxonomy for any domain.
- Respelling roots so that a compound stem splits uniquely.
