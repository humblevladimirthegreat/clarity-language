
redirects settings: https://us-east-2.console.aws.amazon.com/amplify/apps/d2xds94zsgwptg/redirects

my name: obuyen (innovation) gagebon (clarity)

discord invite:
https://discord.gg/CAMGw2Akhc

use [skip-cd] for amplify to not deploy. 

# TODO
-vocab flashcards generator
-contact form / about me
-proposals
-cheat sheet for vowels?
-cheat sheet for reading a word?
Conversation length based on vowel pitch
Cheat sheet letters

Finger code (experimental, docs/grammar/finger-code.md; remove the warning once tested):
-piano on a real instrument, with a player controlling the timing: do the held coda and the one-beat word rest read at speed, is the hook mark easy to hear, do `n` (a sixth) and `e` + hook (a seventh) sound smooth
-guitar on a real instrument: can `z` / `g` (D3 / D4) be told apart by ear, are hammered vowels loud enough under plucked strings
-signed legibility: film real sentences at a normal syllable rate. Check one-finger pairs (`b` / `d`, `u` / `a`, `o` / `e`), hooked vs straight (a hooked index can pass for pointing; hooked fingers look shorter from the front), the claw (`x`) vs a fist, and hooked `th` with the pinky folded. If the claw fails, `x` falls back to thumb + middle + ring + pinky
-touch legibility: palm press and tapping at a normal syllable rate; knuckle vs fingertip with light fast presses; the many-dot shapes (`v`, `e`, `n`); whether the lift-off word gap is clear. If hooked runs fail by touch, a brush across the palm marks `b y th x`
-the `r` shape (thumb + three, pinky folded) is the one awkward run; fallback is the thumb touching the pinky tip with the other three raised
-sideways vowel hand: comfortable over a long conversation? Fallback: fingers diagonal
-gesture meanings: the raised thumb (`z`) and horns (`m`) are rude in some regions; check before teaching widely
-spares and free layers: vowel-hand thumb; consonant-hand pinky alone, middle + ring + pinky, thumb + index + pinky, thumb + a hooked run; piano 2 + 4 and 3 + 5; white keys; hand location, wrist movement, the face. Candidates: the period, `/y/` turns, tone marks, span fences
-speech edges (phonology.md#speech-edges): the finger code has its word and sentence rests, but no channel renders the scope-island break (the next beat half a beat late, before and after the island)
-render parsed doc examples through the finger code (the site player covers typed text only)

save for near end of limit resets:
-review published-lexicon for consistency - are there conflicts with special forms, or do some words mean the same as another? Revise as needed. Don't modify roots used by lexicon-overlays.
-review published-lexicon for psychology - are there any abstract roots that are prone to cognitive biases that would benefit from special attention such as carefully choosing the concrete or promoting to grammar?

Dictionary entries (open lexicon / concepts, not the closed list above):
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
echo "Commits: $(git rev-list --count main)" && git log main --numstat --format= | awk '$1!="-"{a+=$1;d+=$2} END{print "Added: "a"\nDeleted: "d"\nTotal changed: "a+d"\nCurrent lines: "a-d}'
