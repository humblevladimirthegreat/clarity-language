# Who knows what: per-party knowledge views over the log

**Status:** IDEA, 2026-11-18. Cut from `ageben-interpreter.md`, where the wizard's host would have supplied who witnessed each turn; here the text supplies it, so every tool that keeps a log can use it.
**Related:** the log and matcher ([interpreter.md](../../meta/interpreter.md), [log.ts](../../../src/interpret/log.ts), [ask.ts](../../../src/interpret/ask.ts)); [holder](/holder), [evidentiality](/evidentiality#evidentiality), [vocative](/speech-moves#vocative), [past a period](/sentence-linkers#past-a-period). Consumers: `wizard-adventure.md` (witnesses, mysteries, characters who push back), `knowledge-store.md`, `argument-map.md`, `ageben-agent.md`, `structural-search.md`.

Not design authority. Tooling, except where an open question names a reading no grammar page states.

## Problem

The matcher answers what a text says: `ask(question, log)` finds the claims that fit and the frames each sits under (*reported by Ana, denied*). It cannot answer who is in a position to know a claim. Questions about a story often turn on that: where will Lee look for the book that Ana moved while Lee was out; could the guard have heard; does Ana know Lee lied. The wizard needs the same for its characters (what the guard can tell you), the agent and the knowledge store need it for whose belief an entry is, and an argument map needs it to tell a disagreement from a gap in what each side was told.

## Sketch

A **knowledge view** is the log as one party has access to it: `view(log, party)` keeps the entries that party said, heard, or was told, each with how they came by it. Asking a party is the matcher run over their view, so nothing new answers questions.

- **Access from the text.** The speaker of a turn has it as their own claim. The addressee, named by a call in the same turn, heard it. A party told later through a say word has it at one more remove, as the say word's frame already records.
- **Mode on each entry:** said, heard, told by whom, at what remove. A mode maps onto the [evidentiality](/evidentiality#evidentiality) channels where they line up, so a view's entry can be spelled back as a line under the matching evidence frame (*I heard that …*), which is what the wizard's witnesses and the familiar's hints need.
- **Stated belief stays apart.** What the text says someone believes ([holder](/holder)) is a claim in the log like any other, not access. The view keeps both, and a holder claim that disagrees with a party's own access is the false-belief case a reader is asked about.
- **A host may add witnesses** where the text says nothing, as a game knows who stands in the room: an optional `witnesses` on a turn, absent meaning the text alone decides.

Worked case, in English:

1. Ana, to Lee: *The book is in the box.*
2. Ana, alone: *I put the book on the shelf.*

`ask` over the whole log answers *where is the book?* with the shelf. Over `view(log, Lee)` it answers the box, with path *heard from Ana*. *Where does Lee think the book is?* has no answer from the text: no holder claim says it, and the view is evidence for one, not a reading of one.

## Open questions

1. **Who hears a turn with no call?** [Past a period](/sentence-linkers#past-a-period) says a call reaches only its own turn and that whether you are still talking to that person *is up to the conversation*. A view needs an answer.
   - (a) Only the speaker, unless a host adds witnesses.
   - (b) The addressee of the nearest earlier call, until another call or a new speaker.
   - (c) Everyone who has spoken in the log.

   **Recommendation:** (medium) (a) for the shared view, since it states nothing the text does not, with (b) as a host switch that says it is on. A grammar sentence settling (b) would let the default change.
2. **Is a plain statement its speaker's belief?** A view of Ana holds *the book is on the shelf* as said by Ana. Whether that means Ana believes it is a reading: a soft statement, a quote, or a pretend may not.
   - (a) A said entry is a claim, never a belief; belief comes only from a holder or a stance.
   - (b) A firm plain statement counts as the speaker's belief.

   **Recommendation:** (medium) (a). It follows the reader's rule that what is not stated stays empty, and keeps *Ana said* apart from *Ana thinks*, which is the distinction the language's bias-awareness theme rests on.
3. **A reported claim: the claim, or the report?** Ana tells Lee *Kim says the door is open.* Lee's view can hold *Kim says …* (one remove deeper) or *the door is open*.

   **Recommendation:** (high) the report, one remove deeper, as the say word's frame already reads; the claim alone would drop the channel the [evidentiality](/evidentiality#evidentiality) pages make the speaker mark.
4. **Presence from what the text says.** Should the view follow locative claims (*Lee left the hall*) to decide who was there?

   **Recommendation:** (medium) not at first. It needs world-state inference over the log, which belongs to the solver (`clingo-solver.md`); a host's witnesses cover the game meanwhile.
5. **Where it lives.** In `src/interpret/` beside `ask.ts`, or per consumer.

   **Recommendation:** (high) shared, beside `ask.ts`: every consumer above asks the same thing, and a second copy would drift.

## Non-goals

- Truth maintenance or retraction: the knowledge store and the solver own those.
- Any new form. Where a question above needs a reading, the grammar page states it first.
