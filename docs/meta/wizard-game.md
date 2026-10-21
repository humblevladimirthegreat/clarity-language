# Wizard sandbox (editors)

Editors only. How the wizard game's engine reads the docs, and how to add game content without breaking the build. The design and its later milestones are in the proposal `wizard-adventure.md`; this note covers what exists.

The sandbox page is [`wizard.md`](../grammar/wizard.md), outside the sidebar and site search. Nothing links to it until the game ships.

## What the engine reads from the docs

Built in Node by [`src/game/build.ts`](../../src/game/build.ts), for the page's data loader, the content lint, and the tests:

- **Gate data**: every banded section of the learning order ([cross-doc path](learning-levels.md#cross-doc-path)), each construction's home section from the registry ([`constructions.ts`](../../src/parse/constructions.ts)), and each core root's checkpoint ([core vocabulary](lexicon.md#core-vocabulary-column)). A line the game shows is within reach when all its constructions and roots are at or before the player's position.
- **Error table**: one row per **Fix it** drill whose slip reduces to a role-letter swap, an ending swap, one word for another, or a turn word moved to the front, keyed by the parser's error for the wrong form. The seed rows (orthography, typed glosses, endings, `/b/` and `/d/`) are in [`recast.ts`](../../src/game/recast.ts).
- **Fixed lines**: the glosses in `FIXED` ([`generate.ts`](../../src/game/generate.ts)), spelled with the full gloss index, including the docs' own mid-word `x` words.

## Writing game content

- **Name a row by its concrete sense** (`door`, `magnify`), never by its spelling. Code never spells a root ([closed roots](../../src/closed-roots.ts)).
- **Write Agebon as morph gloss.** Gloss-inverse spells it, so a respelling reaches the game with no retie pass. A name is a `{concrete}` slot: `y-{guard}` calls the guard by title, `b-{hibiscus}` is the teacher by name.
- **A verb handler belongs to a root.** Add it to `HANDLERS` ([`verbs.ts`](../../src/game/verbs.ts)) under the root's concrete sense. A verb with no handler gets the *beyond your power yet* message.
- **A tail default that is odd in play** gets a row in `OVERRIDES` ([`objects.ts`](../../src/game/objects.ts)). The lexicon is never edited for the game.
- **A quest** ([`quests.ts`](../../src/game/quests.ts)) names the constructions it is about in `needs`, and its area is the furthest one's section. It also needs a goal over world state, an abstract model for the reachability check, and at least one walkthrough. A thing the quest cannot lose gets the quest's id in `critical` ([`scene.ts`](../../src/game/scene.ts)).

## Checks

- **`npm run build`** runs [`scripts/lint-game.ts`](../../scripts/lint-game.ts): every authored gloss spells, parses one way, and uses lexicon roots; no walkthrough line uses grammar past its quest's area; every quest's goal is reachable from every reachable state; every concrete sense the game names is a published row.
- **`npm test`** plays every walkthrough to its goal and checks that the three failures (did not parse, beyond the game, refused) stay distinct.

When a doc edit restages a section, quests and narration re-gate with it. If the lint then reports a walkthrough past its quest's area, either the quest's `needs` or its script changes; a person decides which.
