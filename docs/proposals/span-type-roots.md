# Proposal: written-only spans, a spoken mention marker, `{}` for scope islands

**Status:** PROPOSED (not current language). Grammar today: a span has a written form (`d[…]`, `d{…}`, `d<…>`, `th(…)`) and a spoken open (role letter + TYPE vowel + mid-word **`x`** + EDGE vowel + ending), with spoken resumes (`daxur`) and closes (`xuxul`). Scope islands are `^ … ^`.  
**Related:** [spans.md](../grammar/spans.md), [pronouns.md](../grammar/pronouns.md#role-pointers), [clause.md](../grammar/clause.md#left-bound-adjectives), [x-compounds.md](../grammar/x-compounds.md#families-by-shape), [parser-pipeline.md](../meta/parser-pipeline.md#overlay-kinds), `data/lexicon-overlays.csv`  
**Design authority:** none until absorbed.

## Motivation

- **A spoken span form only serves speech-to-text**, which does not exist yet. It costs a whole family of forms: TYPE vowels, EDGE vowels, three close words, spoken resumes, spoken `/y/` spans.
- **Without a spoken form, the written mention `{…}` is the only thing separating a mention from other spans in the spoken language.** A mention needs a marker that can be heard.
- **Scope islands need a bracket.** `^ … ^` has no spoken edge today. `{ … }` is free once mention leaves it, and it would have exactly one job.
- **Removing spoken opens ends the `V x V ending` family collision** between spans and [role pointers](../grammar/pronouns.md#role-pointers), and the ability collision. Neither needs a fix.

## Proposed shape

### Spans are written-only

| Written | Job | Inside |
|---------|-----|--------|
| `d[…]` | span | parsed as Agazan |
| `d<…>` | span | raw (foreign, code, a name) |
| `th(…)` | aside | parsed as Agazan |

- `[…]` and `<…>` are **one span** in every other way: same role letters, same slots, same `~` / `@` marks, same topic and `/y/` rules. The only difference is whether the parser inspects the inside, so either bracket may be used for any content the writer does not want read, or read.
- A span has no spoken form. Read aloud, a writer says the inside and the marks as words. That limit goes in design-decisions.md.
- Removed: TYPE and EDGE vowels, the `x` open, `xuxul` / `xuxur` / `xuxum`, atomic / clause-scoped / empty edges, spoken resume. Editorial close (`#]`) and close-all (`|`) are written marks and are unchanged.

### Span resume is an ordinary pronoun

- A span fills a role slot and anchors [role pointers](../grammar/pronouns.md#role-pointers) for that role like any noun. After `zazawan d[azawan] vezebel.`, `duxar` is *that quote* (the latest thing done to).
- The role-pointer wording widens from *someone* to *someone or something*.
- An aside still adds no anchors. Names inside a cite still do not count toward an anchor or [ordinal](../grammar/pronouns.md#ordinal-pronouns) outside it.
- `d[=]`, `daxur` and the "span resume" row of the topic-resets table go.
- **Verb spans:** a span in a `/v/` slot (`v[vazadal]`) has no resume pronoun. This proposal deliberately defines none for now.

### Mention is a marked span

A mention is a span carrying a `/g/` marker that comes **before** it, as a `gl-` adjective ([adjectives before the noun](../grammar/clause.md#left-bound-adjectives)). A listener learns *this is a word as spelling* before hearing the whole span. Spans are long, so a trailing marker would arrive too late.

| Form | Reading | Today |
|------|---------|-------|
| `gl🔤l z<odoga> gamazam` | *the word “odoga” is small* | `z{odoga} gamazam` |
| `gl🔤n d<onodan> vogozam` | *the name “onodan”* | `d@{onodan}` |
| `gl🔤l x<odoga> zozan gamazam` | topic about the word | `x{odoga}` |

🔤 stands in for the marker stem, which is the overlay on the 🔤 `eleda` (*letters*) row. Its spelling is not yet known ([placeholder policy](../meta/lexicon.md#placeholder-spellings)).

- **Endings:** **-l** is the word or phrase as spelling; **-n** is the name-string, the job `@` did on a mention. There is no **-m**. `@` on the span stays the proper mark for a titled work (`d@[onodan alahen]`).
- **A leading `gl-` word cannot be mistaken for a predicate.** The adjective is bound to the next noun, so the span and a following predicate adjective (`gamazam`) stay apart. The parser already accepts a `gl-` word before a span.
- **Not `/w/`:** `/w/` grades the next `/g/`, `/h/` or `/th/` word and never attaches to a noun.
- **No `/y/` mention:** a `/y/` span takes no marker, as today.

### Marker root

- **Overlay kind** `mention`, with two `/g/` rows (**-l** and **-n**), reading `LexReading` `mention`, anchored to the spans.md teaching section.
- **Anchor row:** the word matching the letters emoji, 🔤 `eleda` (*letters*), carries the overlay. A mention is a word as its letters, which is a better mnemonic than 💬 `ezebe`, whose senses (*tell*, *word*, *language*) are already crowded.
- **Spelling:** run `npm run convert-word -- --lexicon --only 🔤`, never by hand. The row gains a three-letter root, which triggers the retie procedure ([lexicon editing](../meta/lexicon.md)).
- **Reading rule:** the marker reading applies only when the `gl-` word sits directly before a span. Elsewhere the stem is the ordinary adjective *lettered*, the same pattern as sakes, which attach only to `x` + vowel hosts.

### `{}` is scope islands only

- `{ … }` replaces `^ … ^`. It has no role letter and no other use, so it needs no disambiguation rule.
- All existing island rules carry over: one phrase, may close early, hosts keep their `/b/`, one island per clause, no nesting, binder required.
- A [tone mark](../grammar/speech-moves.md#tone-marks) goes right before the opening brace (`!{ hegewem zodogal geredal }`).
- Speech is unchanged: a pause and one tight phrase, with the binder doing the work.

## If accepted, the work is

- **Grammar:** rewrite spans.md around written spans and the marker (drop the spoken map, TYPE / EDGE, nesting by close words, spoken `/y/`). Update pronouns.md role pointers and the topic table, joins.md's scope-island section, say-people-places.md and say-questions.md mention examples, x-compounds.md (family table, decision order) and unassigned-reserved.md:196.
- **Data:** the `mention` overlay kind and its two rows in `lexicon-overlays.csv`; `convert-word` for 🔤 and `retie-docs`.
- **Parser:** island lexing for `{ }` and no `^`; no span opens, closes or resumes; span anchors for role pointers; the `mention` marker reading; `classify` rule for the marker.
- **Glosses:** `MENTION["…"]` becomes the span plus a `g-MENTION` word (glosses.md span interiors).
- **Decisions:** a design-decisions.md entry for written-only spans; close TODO.md:19 and the `/y/` span note at design-decisions.md:132.
- All of it ships in one change, per the repo rule that parser changes land with the grammar edit.
