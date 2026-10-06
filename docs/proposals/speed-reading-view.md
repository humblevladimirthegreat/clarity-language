# Topic pictures in the margin

Status: idea. Not design authority; fold into grammar / meta docs, then drop. Builds on `syntax-highlighting.md` and needs its topic stretch.

## Problem

A reader looking for one passage on a long page (*where did they talk about the dog?*) has to read line by line. Agazan words are hard to tell apart at a glance: almost every root is five letters with alternating vowels and consonants, so `zodogal` and `zazawal` have the same outline. Nothing on the page stands out except the text itself.

The fix aims at **scannability** (finding a passage), not reading speed.

## Dropped: the emoji speed-reading view

An earlier sketch replaced every word with its root's emoji, with the part-of-speech letter and ending as small letters above and below it, no spaces, one clause per line, and columns. It is dropped, for these reasons:

- **The space saved is small.** Example words average 6.4 letters, about 3.6 em with the space. An emoji with its small letters takes about 1.55 em, so lines get roughly 2.3× shorter at the same size. Emoji need a larger size to be told apart, and the lines need more height, so a page shrinks only about 1.3 to 1.8×. These are estimates from typical font sizes; nothing was built to measure it.
- **Less space does not mean faster reading.** Readers can only use dense text quickly after years of learning thousands of signs, as Chinese readers do. A learner who knows only some of the pictures may read them slower than spelled words.
- **When everything is a picture, nothing stands out.** A picture is easy to find among words, but hard to find among a page of other pictures, and many emoji look alike (yellow faces, brown food, flags).
- **Abstract senses do not match their picture.** `azawam` *grace* would show 🦢, so a reader looking for *grace* has to know the picture first.
- **It replaces the text.** Searching the page, copying and pasting, and learning the spellings would all break.
- **It shows no structure.** It does not show where a topic starts or which list a word belongs to.

## Proposal

Use pictures only where they make a passage easy to find: one per **topic stretch**.

`syntax-highlighting.md` draws a left rule beside each topic stretch: the sentences from a topic-setting `/x/` word ([topic](../grammar/pronouns.md#topic)) until the topic changes or clears. This proposal puts the topic's emoji at the top of that rule. Down the left edge of a page, the reader sees a short column of pictures, one per stretch, which works like a table of contents. There are few pictures, so each one still stands out. The text itself does not change.

| Topic event | Margin |
|-------------|--------|
| Introduce (`xodogal`) | the root's emoji at the top of a new rule |
| Return (`xazawar`) | the same emoji with a return mark, so a reader can see the talk came back |
| Clear (`xevavem`, `xavazem`) | the rule ends; nothing until the next topic |
| No topic | no rule, no picture |

A name made from a root has that root's picture: `xazawan` *now, about Azawan* shows 🦢. So people and places get pictures too, not only things.

### When there is no picture

Some topics have no single emoji: a foreign name in a [span](../grammar/spans.md#topic-quotes), a root with no emoji, or a compound whose parts do not combine well into one picture. For these, write the topic word itself in small text at the top of the rule. The reader still has a heading to scan for; it is just text.

Same rule as `syntax-highlighting.md`: where the parser cannot resolve the topic, show nothing.

### Pairs well with

Muting grammar words (hooks, linkers, subordinators) against content roots. It is listed as later work in `syntax-highlighting.md`. With pictures marking where each stretch starts and content words standing out inside it, a reader can find the stretch first and then the line.

## Lexicon impact

Only roots likely to be a topic need a picture. Those are mostly concrete nouns and the roots used for names. A root with no picture (an abstract word like *wait* or *enough*) still works here, because it falls back to text. So this view does not need every published row to have an emoji. The `emoji` column can become optional without losing anything this view needs. That change is a lexicon policy decision ([lexicon editing](../meta/lexicon.md)), separate from this proposal.

## Data source

- Topic state comes from `resolve.anaphors` ([resolve.ts](../../src/parse/resolve.ts)). The resolver already follows introduce, return, and clear across sentences.
- The emoji comes from the topic root's published row in [`lexicon-published.csv`](../../data/lexicon-published.csv).
- The build-time transform, eligibility of code spans, and word-to-text mapping are shared with `syntax-highlighting.md`.

## Design constraints

- The picture is decoration. It is not part of the copied text, and screen readers read it as *topic: dog* (the root's concrete English), not as the emoji's Unicode name.
- On hover, the picture shows the topic word and its English.
- Return and introduce must differ by shape as well as colour (a return mark, not only a tint).
- Size about 1.25 em, so the picture is recognizable but does not crowd the text.
- Emoji look different on each platform. The view must not depend on details of one emoji font.

## Where it helps

Topic stretches matter on long text: dialogues, readings, and multi-paragraph passages. Most grammar-page examples are one or two sentences with no topic, so they would show nothing. That is fine. The view is mainly for longer reading pages, if and when those exist.

## Open questions

- **Abstract topics.** `xazawam` (*grace* as topic) would show 🦢. Show it anyway, show it with a mark for *abstract sense*, or fall back to text?
- **Compound topics.** A noun pair (`xebeyaxabodel` *peanut butter*), a multipart name, or a [role compound](../grammar/roles.md#role-compounds) (`xaxedehol` *people who teach*): show each part's picture (up to two), only the head's, or text?
- **Repeated introductions.** When the same root is introduced again (not returned), should the picture be the same, or marked as a new stretch about a new one of that kind?
- **Long stretches.** Should a stretch that runs past one screen repeat its picture at the top of each screen while scrolling?

## Plan

1. Ship the topic stretch rule from `syntax-highlighting.md` first.
2. Prototype pictures on one long example passage; check by eye that the pictures follow the topic correctly and are easy to scan.
3. Settle the open questions from the prototype.
4. If it holds, fold the display into the same build transform and drop this proposal.
