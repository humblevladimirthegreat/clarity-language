# Claritish editor data

The file formats behind the [journal editor](grammar-docs.md#claritish-track): its cues, word lists, and question flows. All three are hand-written; the forms they produce are not, because every answer names a place on the [cheat sheet](../grammar/claritish/cheat-sheet.md).

What counts as a cue and how a card is worded: [editor cues and cards](claritish-style.md#editor-cards). The checks live in `src/claritish-editor/data.ts` and run in the build through `scripts/lint-claritish-editor.ts`.

## Cues
<a id="cues"></a>

`data/claritish-triggers.csv` has one row per English habit.

| Column | Holds |
|--------|-------|
| `cue` | The patterns that raise the cue, separated by ` \| ` ([pattern syntax](#pattern-syntax)) |
| `exclude` | Patterns for the common uses that are not the trap (*I think so*, *thanks to the rain*, *sorry to hear*). An exclusion that overlaps a cue silences it |
| `flow` | The question flow the card opens |
| `defaults` | Any answer the cue already implies (`channel=reported` for *I heard*) |
| `placement` | Where the drop-in goes ([placement](#placement)) |
| `join` | What sits between the English and the drop-in: `space`, `comma`, or `sentence` for a drop-in that follows the sentence, as the thanks and sorry examples do |
| `drop_cue` | `yes` when the lesson's examples leave the English cue out, otherwise `no` |
| `gap_sentence` | Which sentence of the lesson's `## The gap` the card shows, so the trap is never written twice. The sentence appears alone, so it must [read alone](claritish-style.md#the-gap) |
| `mirror` | The mirror panel's name for the habit, one and many, split by `/` (`unmarked guess/unmarked guesses`). Rows for the same habit share it. Wording: [mirror names](claritish-style.md#editor-cards) |
| `exempt` | A reason, for an italic gap phrase that is not a cue (the drop-in's own meaning). Such a row raises nothing |

Every italic phrase in a cued lesson's gap must raise one of that lesson's cues or match an exempt row; the build checks it.

### Pattern syntax
<a id="pattern-syntax"></a>

| Write | Matches |
|-------|---------|
| Words separated by spaces | Those words in a row |
| `a/b` | A choice of words |
| `(…)` | An optional word |
| `*` | Any letters inside a word (`*ing`) |
| `@list` | Any word of a [word list](#word-lists) (`@trait`, `(@degree)`) |
| Punctuation | Its own word (`sorry ?`, `; )`, `can't ./,/!`) |

A contraction is one word, so write `I'm sorry | I am sorry`, not `I'm/I am sorry`.

### Placement
<a id="placement"></a>

| Value | The drop-in goes |
|-------|------------------|
| `after-clause` | After the English clause |
| `after-noun` | After the noun |
| `suffix` | As a hyphen suffix on the English verb after the cue, which replaces the cue: *I can't sing* → `sing-xu` |
| `on-cue` | As a hyphen suffix on the cue's last word, which stays: *he's a liar* → `liar-the` |
| `before-word` | As a tone mark at the start of the sentence |

## Word lists
<a id="word-lists"></a>

`data/claritish-words.csv` has one `list,word` row per word. The lists hold the open sets a cue cannot spell out.

| List | Holds | Examples |
|------|-------|----------|
| `trait` | The negative trait words a label names, plural nouns included | *liar*, *lazy*, *idiots* |
| `emotion-unmet`, `emotion-met` | The emotion words a feeling names | *anxious*, *proud* |
| `degree` | The words between a subject and the label | *so*, *such*, *a bit* |
| `person` | The people a label can be about besides a pronoun | *boss*, *dad*, *friends* |

Each word is one lowercase word and sits in one list; the build checks both. Which words belong in a list: [what counts as a cue](claritish-style.md#what-counts-as-a-cue).

An optional third column, `preset`, on an emotion word names the feelings composer's starting answer (`sake=understanding` for *confused*). It names a choice of the feeling flow, never a spelling, and only where the need is clear.

## Flows
<a id="flows"></a>

In `data/claritish-flows.json`, each question's answers name a place on the cheat sheet, never a spelling:

- a row label,
- a column header (`-l`),
- a cell by its English (`autonomy`) or by the meaning in the cell beside it (`can never` for `-xu`),
- or a prose line (the `Sake word:` formula).

`{question}` in a reference is filled with the answer. A choice with no `label` takes the sheet's own English; a question's `labelFrom` reads labels that depend on an earlier answer (*tolerated* for allowed, *by custom* for required).

| Key | Does |
|-----|------|
| `commands` | The slash commands that open the flow with no English cue (`/sure`), each with any answers it presets (`"plan": { "kind": "planned" }`). A command puts its drop-in where it was typed: a suffix joins the word before it, a tone mark the word after it |
| `"oneWord": true` on a form | Joins its parts with nothing (a feeling: sake word + locus + motion), not a space (`thawethum blawan`) |
| `"breakdown": true` on a form | Shows the word part by part, each part over the answer that chose it, as the cheat sheet's feelings table does |
| `item` on a reference | Reads a prose line that lists endings (`Motion ending: **-l** still, …`) one entry at a time (`"item": "{motion}"`) |
| `"requires": "command"` on a choice | Offers the choice only from a command (*can*, which no English cue asks for) |
| `none` on a choice | Ends in no drop-in: the card shows its line and offers only *Leave it in English*, for a lesson that says when to leave the word off |

## Reading back
<a id="reading-back"></a>

Reading back needs no data of its own. Hover glosses and near misses (`thovom` → `thomam`) come from the forms the flows produce. English words that come close to a form (*thunder*, *than*) are found at build from the English helper's WordNet index and compromise's lexicon, so they are never flagged and never open autocomplete; a new form brings its own.
