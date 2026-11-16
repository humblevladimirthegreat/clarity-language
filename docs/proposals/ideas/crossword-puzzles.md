# Crossword puzzles: solver-made grids, clue sets by difficulty

**Status:** IDEA, 2026-11-16. User decisions, 2026-11-16: grid entries are citations (root + ending); the first version has no role letter in the grid; a later version may clue an entry with a sentence that has a blank.  
**Related:** [citations](/word-endings#citation-forms); [phonology](/phonology) (`th` is one letter); [`data/lexicon-published.csv`](../../../data/lexicon-published.csv) and [`data/lexicon-compounds.csv`](../../../data/lexicon-compounds.csv) (words, seeds, senses, `core` order); [`src/flashcards.ts`](../../../src/flashcards.ts) (card data a clue can reuse); `clingo-solver.md` (the solver this uses); `vocab-flashcards.md` (the other vocabulary tool).

Not design authority. Tooling only: adds no form and no word.

## Problem

A learner's vocabulary practice is the checkpoint word banks and flashcards. Both ask for one word at a time, and neither makes the learner spell a word letter by letter with another word checking the result. A crossword does, and its ending cell asks a question flashcards skip: is this the root's concrete sense or its abstract one?

Grids cannot be made by hand at any volume, and a hand-made grid cannot be shown to have one solution.

## Sketch

### What the lexicon does to the grid

Of the 1,419 published roots, 1,088 are five letters, vowel and consonant in turn, starting with a vowel. Nearly all the rest alternate the same way at other lengths. A citation adds one consonant, so the usual entry is six cells: `agebel`, `ugomam`.

- **One letter, one cell.** `th` fills a single cell.
- **The grid is a checkerboard.** Each cell is fixed as a vowel cell or a consonant cell. Every entry starts on a vowel cell and ends on a consonant cell.
- **No dense grids.** A row beside a full row would have to start on a consonant. Layouts are free-form: words cross, and parallel words never touch.
- **Two strengths of crossing.** A vowel crossing leaves many candidates; a consonant crossing leaves few.
- **The last cell is the sense.** It holds the ending, so the clue decides it: a picture clue asks for the concrete citation, an abstract-sense clue for the abstract one. The same root can enter one grid twice.

A two-word grid, crossing on a consonant:

```
. a . . . .        1 down    👓
u g o m a m        2 across  delight
. e . . . .
. b . . . .
. e . . . .
. l . . . .
```

### What the solver does

Clingo gets the candidate words as facts (`word(W)`, `letter(W, I, L)`) and the grid size. Three jobs:

1. **Arrange.** A choice rule places each chosen word at a cell and a direction. Constraints forbid two letters in one cell, forbid parallel words that touch, and require one connected puzzle. Optimisation prefers more crossings, consonant crossings over vowel ones, and a small bounding box.
2. **Prove one solution.** Each slot gets the set of words its clue could mean (a seed emoji may fit several roots, an English gloss may fit a root and its alias). The solver looks for a second fill. When one exists, it names the slots that differ, and the generator sharpens those clues or adds a given letter.
3. **Meet a profile.** Targets such as *eight words*, *three from this unit*, or *at least 40% of cells crossed* are constraints, so a difficulty profile shapes the grid as well as the clues.

The generator samples a few dozen candidates from the allowed vocabulary before solving, seeded by date, so the program stays small and a daily puzzle is repeatable.

### Clue sets by difficulty

One arrangement carries several clue sets, so the same grid can be solved at each level. A profile sets these:

| Setting | Easy end | Hard end |
|---------|----------|----------|
| Vocabulary | the first rows of `core` order | all roots, then compounds |
| Clue kind | seed emoji | concrete English, abstract sense, mnemonic with the word removed, a compound's two parts |
| Word bank | shown | hidden |
| Given letters | consonants filled in | none |
| Crossings | many, on consonants | few, on vowels |
| Candidates per clue | one | several; the crossings decide |

*Candidates per clue* is measured, not guessed: the solver counts the words that fit a slot from its clue alone, and how many crossing letters settle it.

**Later: sentence clues.** The clue is an Ageben sentence with one word blanked, drawn from parsed grammar examples. This is the hardest clue kind and the first that needs grammar, since the learner reads the sentence to find the word.

## Open questions

1. **Where does the role letter go in a sentence clue?** (a) The clue prints the role letter in front of the blank, and the grid holds the citation, as in every other clue set. (b) The grid holds the whole word, role letter included; the entry then starts on a consonant cell, and the grid must be made for that clue set alone. **Recommendation:** (a). One arrangement keeps serving every difficulty, and the learner still has to read the role to choose the sense.
2. **Named citations in the grid?** (a) Leave them out. (b) Allow them, clued by the root's meaning as the word-endings checkpoint does. **Recommendation:** (a) at first. A meaning clue for a name reads the same as a clue for the concrete or abstract citation, so the ending cell would have no fair answer.
3. **Made ahead or made on request?** (a) Puzzles are generated at build time and shipped as data: a daily puzzle, fixed sets per unit. (b) The solver runs in the browser, so a learner can ask for a puzzle from their own due flashcards or a chosen unit. **Recommendation:** none yet. (b) serves the learner better, but nobody has measured solve time in a browser.
4. **Does the typing surface accept `th` as one keystroke or two?** (a) Typing `t` then `h` fills one cell. (b) An on-screen key per letter. **Recommendation:** both; (a) for a keyboard, (b) for a phone.
5. **How much of `clingo-solver.md` is shared?** That idea translates interpreter readings; this one needs only Clingo and a way to load it. **Recommendation:** share the dependency and loader, nothing else, so neither waits on the other.

## Non-goals

- No new clue language. Every clue comes from a lexicon column or a grammar example that already exists.
- No dense, newspaper-style grids.
- No replacement for checkpoints or flashcards; this is extra practice.

## Not checked

- Shape counts cover published roots only. Compound shapes and lengths are not counted.
- How many roots have an abstract sense, and so how often a root can enter twice.
- Solve time for any grid size, and whether Clingo's WASM build is already a dependency.
- Whether the alternating shape holds at every seam of a compound.
