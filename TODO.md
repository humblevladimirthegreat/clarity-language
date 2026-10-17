
redirects settings: https://us-east-2.console.aws.amazon.com/amplify/apps/d2xds94zsgwptg/redirects

my name: obogan (innovation) gazagan (clarity)

use [skip-cd] for amplify to not deploy. 

# TODO
-claritish editor
-consider Promoting common non-nouns and compound-word parts to be three letter. 
-consider removing forward links (including prose)
-add "Copy Translation Prompt" button to Inspect page.
-named frames in the gloss: a titled **-n** name built from a published root prints its Agazan spelling (`h-Eveden`, `h-Amaban`, `v-Azehen`), so a gloss reader can't recover the English the docs give (*according to Temperature*, *in Emergency*, *performs Intrusion*; word-endings.md Intermediate practice). House-cast names are built the same way and stay untranslated. Options: gloss **-n** on `v` / `g` / `h` by the root's sense (`h-Temperature`), or keep the spelling in the doc English. Found by the phase 3 eval of the LLM gloss prompt.

save for near end of limit resets:
-final exam
-do rest of ngsl
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
