
redirects settings: https://us-east-2.console.aws.amazon.com/amplify/apps/d2xds94zsgwptg/redirects

my name: obogan (innovation) gazagan (clarity)

discord invite:
https://discord.gg/CAMGw2Akhc

use [skip-cd] for amplify to not deploy. 

# TODO
-consider Promoting common non-nouns and compound-word parts to be three letter. 
-consider removing forward mentions/links (including prose)
-vocab flashcards generator
-site visitor statistics
-contact form / about me
-on a phone-width screen, every page on the site scrolls sideways by about 11 px, because of VitePress's top navigation bar.
-reconsider adjective bars (poor/rich, weak/strong)
-number-respelling.md: re-pick the two number fillers against the root-tails lexicon. With `w` + `y` as fillers, tools and people drop out of the 00–99 mnemonic table, and column 9 is all flags (number-mnemonic.md § lexicon coverage, open question 6)
-redo examples, lint instructions for look_alike_gap should mention that you may need to change the examples to be more coherent
-pronouns based on tails (including word ending)
-reconsider hosting rules for b

-claritish editor phase 3 follow-ups (docs/proposals/partially-implemented/claritish-editor.md, Phase 3 as built): decide on part-of-speech tagging for label cues (measured: word list 34/50 recall, 1/25 false positives; compromise POS 17/50, 5/25, mostly role nouns like nurse/teacher; together 38/50, 6/25); the misses are non-pronoun subjects (my boss, Mark, Dad) and words not in the trait list (ridiculous, sensitive, impossible, clueless, creep, cheap, plurals like idiots, hyphenated two-faced); consider per-emotion-word card presets (confused → understanding). address the vitepress build warning while you're at it (caused by ClaritishCard)

save for near end of limit resets:
-review published-lexicon for consistency - are there conflicts with special forms, or do some words mean the same as another? Revise as needed. Don't modify roots used by lexicon-overlays.
-review published-lexicon for psychology - are there any abstract roots that are prone to cognitive biases that would benefit from special attention such as carefully choosing the concrete

Dictionary entries (open lexicon / concepts, not the closed list above):
-habits: triggered
-unconditional self acceptance
-apology
-Inner why?
-how inner self protects
-planning has importance value, consider numbered alternates
-pleasure now vs glad afterwards
-types of resistance: thoughts, behavior, attention

assertiveness rights: Ground yourself in the idea that you’re allowed to:
-say “no”
-express opinions
-make mistakes
-be treated with basic respect and be heard
-change your mind
-ask for what you need
-feel whatever emotions arise
-take time to decide
-make decisions without explaining yourself
-say “I don’t know” / “I don’t understand”
-end conversations

setback responses:
-not change yet
-not worth it, begin again
-accept
-this is training(difficult)
-be at peace anyway
-curiosity
-defusion
-distancing

git stats:
echo "Commits: $(git rev-list --count main)" && git log main --numstat --format= | awk '$1!="-"{a+=$1;d+=$2} END{print "Added: "a"\nDeleted: "d"\nTotal changed: "a+d"\nCurrent lines (A-D): "a-d}'
