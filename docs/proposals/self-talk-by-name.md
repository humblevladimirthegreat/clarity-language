# Proposal: self-talk by name

**Status:** PROPOSED. Nothing here is built.  
**Related:** `claritish-editor.md` (the editor this would ride on: its matcher, help cards, and mirror panel), [Claritish track](../meta/grammar-docs.md#claritish-track), the [Labels](../grammar/claritish/labels.md) and [Feelings](../grammar/claritish/feelings.md) lessons.  
**Design authority:** none. This changes English words, not Ageben, and adds no form.

## Idea

When people reflect on a hard moment, talking to themselves by their own name or as *you* (*Jordan, that meeting was rough*) instead of *I* seems to lower emotional reactivity and make the problem feel more manageable. This is **distanced self-talk** (Kross et al. 2014, *Journal of Personality and Social Psychology*; Moser et al. 2017, *Scientific Reports*). Most of the evidence comes from lab studies of private reflection, so the editor should offer it as something to try, not as a proven fix.

It fits the Claritish editor because that editor is for private journaling: every draft is the writer talking to themselves, which is exactly where the evidence applies. No separate journal mode is needed.

This is not a Claritish drop-in, so it sits apart from the lesson cards.

## User experience

- **Cues:** harsh self-talk in the first person: *why do I always*, *I can't believe I*, *I'm so stupid*, *I ruined*, *what's wrong with me*. A self-label (*I'm an idiot*) is already a [Labels](../grammar/claritish/labels.md) cue; self-talk joins it under *Also here* rather than adding a second mark.
- **Card:** one line on the idea, then a preview that rewrites the sentence to address the writer by name: *I can't believe I said that* → *Jordan, you said something you regret. What would you tell a friend who did that?* The name is the one from the site's name helper ([`useLearnerName`](../grammar/.vitepress/composables/useLearnerName.ts)), in its English form; with no name chosen, the card offers *you*. **Keep *I*** is as prominent as *Try it*.
- **No count.** The mirror panel does not count self-talk cues. It is an offer, not a habit to score.

## Card copy needs a source

Claritish adds no content of its own, so the card's wording must come from somewhere:

- **(a)** A short note in the Claritish [Feelings](../grammar/claritish/feelings.md) or [Labels](../grammar/claritish/labels.md) lesson teaches the idea, and the card quotes it. This keeps the editor's "no copy written twice" goal, but makes it the one Claritish idea that is not an Ageben drop-in, which the [track rules](../meta/grammar-docs.md#claritish-track) would need to allow.
- **(b)** An editor-only tip, with its wording in the editor's trigger data.
- **(c)** Leave it out.

(a) is the most consistent with the track.

## Plan

It needs nothing from the editor except the matcher and the help cards, so it can follow the editor's first usable phase: the self-talk cue list in the trigger data, the card, and a false-positive check (*I can't believe it's Friday* raises nothing).
