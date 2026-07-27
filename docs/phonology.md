# Phonology and Phonotactics

Clarity has the following goals for its phonology:

1. Easy to sing (explained below).  
2. Unambiguous pronunciation \- it should always be clear how to pronounce it from the spelling.  
3. Clear word boundaries (even within a compound word).

### Vowels

I chose vowels that aren't fully open or fully closed so you don't have to do [vowel modification](https://www.singwise.com/articles/vowels-formants-modifications) (see section "VOWEL MODIFICATION ('COPERTURA')") to sing them in your high/low range.

e /e̞/ \- o /o̞/ \- u /ɶ/ \- a /ɑ/  (roundedness is non-contrastive)

### Consonants at beginning of syllables

The language has no distinction between voiced/unvoiced, but the voiced version is preferred because you can sustain notes across letters (voiceless requires briefly stopping the airflow). You can still use the unvoiced for stylistic reasons.

h /ɣ/, w /w/, g /ɡ/, d /d/, j /dʑ/, b /b/, z /z/, m /m/, n /n/, v /v/, x /ʒ/

possible clusters:
gr, gl, dr, br, bl

### Consonants at end of syllables (except end of word)

g /ɡ/, d /d/, j /dʑ/, b /b/, z /z/, m /m/, v /v/  (cannot double with the second beginning consonant)

(**x** /ʒ/ is not used as a syllable coda or as an ordinary root consonant; see compounds below.)

### Phonotactics

A word contains these parts:
1. the part of speech prefix
2. optional mid-word **l** after the PoS prefix — **left-bound** on adjectives (`gl-`) only; see below
3. the root(s) - multiple if compound word
4. the [reference suffix](reference-suffix.md) (**-l**, **-m**, **-n**, or **-r**)
5. optional plural **-sh** (group referent / collective `/ɡ/`), after the reference suffix — see [plurality.md](plurality.md)

roots have form V(CV)+
if a compound root, then **x** separates them

a) A word root almost always starts with a vowel. The ending and beginning consonants were carefully chosen so that you can never confuse which syllable a consonant belongs to (vaban must be pronounced va'ban and not vab'an because syllables never end with a consonant unless it's the end of the word).

b) All **content** words end with a [reference suffix](reference-suffix.md) (**-l**, **-m**, **-n**, or **-r**), optionally followed by plural **-sh** (/ʃ/). No other syllables end with a consonant, so word boundaries stay clear even when pauses are unreliable (as in singing). Allowed word-final clusters are those suffixes plus **-sh** (**-lsh**, **-msh**, **-nsh**, **-rsh**). The digraph **sh** is used only as this plural marker (word-final, after a reference suffix); it is not an ordinary root consonant.

c) Easy to tell the components of a compound word because **x** separates them. Mid-word **x** is only the compound joiner (never part of a root); word-initial **x** is the discourse-marker prefix. Closed [quote / mention / aside](quotations.md) fences also use mid-word **`x`**: shape `{PoS}{TYPE}x{EDGE}{ENDING}` (e.g. `daxal` = open exact quote as object). Parser cue: after PoS, a single TYPE vowel (**a** / **e** / **o**) then `x` then EDGE (**a** / **u**) + ending → span fence; a longer root before `x` → ordinary compound (lexicon, [values](values.md), [ability](special-vocabulary.md#ability)).

d) **Number-word exception:** After a PoS prefix, a following **r** (start of the number marker) may form a cluster that is not otherwise allowed (e.g. `/ɡ/`+`r`, `/z/`+`r`, `/v/`+`r`, `/h/`+`r`, `/j/`+`r`, `/x/`+`r`). That cluster is legal **only** in [number words](numbers.md); it is not a global expansion of the onset-cluster list above. Number stems are a closed formal grammar and must not be assigned as ordinary lexicon roots. Ordinary vs number-specific meanings of **-l** / **-m** / **-n** / **-r** are in [reference-suffix.md](reference-suffix.md#number-word-exception).

e) **Left-bound adjective (`gl-`):** After adjective prefix `/ɡ/`, an **l** may sit before the root, forming onset **`gl-`** (already on the cluster list above). That marks [left-bound attachment](language-reference.md#adjectives-ɡ): the adjective precedes its host and binds the next eligible noun (`gl-bigl z-dogl`). Default right-bound adjectives are `/ɡ/` + vowel after the host (`z-dogl g-bigl`). This mid-word **l** is **not** the word-final reference suffix **-l**, and it is **not** available on other PoS prefixes as left-bound attachment (no `zl-`, `wl-`, `hl-`, …). Complex `/b/` and adjunct `/w/` stay after the `/ɡ/` word in either order.

f) **Join and reviser vowels:** [Phrase-level](coordination.md#phrase-level-coordination) (`/z/` `/d/` `/b/` `/ɡ/` `/w/` `/h/`: `zal`, `zam`, `zar`, `zor`, `zer`, `zur`, `gal`, `gam`, `ham`, …), [VP-level](coordination.md#vp-level-coordination) (`/v/`: `val`, `vam`, `var`, …), and [clause-level](coordination.md#clause-level-coordination) (`/x/`: `xal`, `xam`, `xar`, …) joins use the same vowel series under an ordinary PoS+root+ending shape; those vowel roots are reserved as joins only (**-l** / **-m** / **-n** on **a** / **o** / **u** / **ao** / **e** / **ae** / **oe** / **ua** / **uo** / **ue** = closed / open / named at phrase level; soft **-n** at VP/clause; **-r** on **a** / **o** / **e** / **u** at all levels = [unspecified-member](coordination.md#unspecified-member-r-phrase) (*something* / *anything* / *whatever-by-rank* / *something else* — VP *do something*, clause *something happened*; plain **u** = [negation](coordination.md#negation-u)); **e** / **oe** = **rank joins** — unmarked / exclusive; **ae** = equality / tie; leading **u** on **a** / **o** / **e** = [invert](coordination.md#invert-u-stacks) (*everything but* / *anything but* / **rank reversal**; no three-vowel stacks; empty-allowed on plain **o** + **-m** only) — not ordinary reference-suffix senses). All levels use a **fence** (optional shared modifiers immediately after the join; juxtaposed conjuncts; **left** preferred, **right close** allowed for style/comedy; [fence nesting](coordination.md#fence-nesting); pure infix illegal). There are **no** bare (prefix-less) **join** particles. Prefix-less revisers **al** / **am** / **an** / **el** / **em** / **en** / **ol** / **om** / **on** / **ul** / **um** / **un** (**-l** / **-m** / named **-n** required; no **-r**; bare **a** / **e** / **o** / **u** illegal) are reserved as [revisers](revisers.md) (*including* / *rather* / *instead* / *except*; **-l** / **-m** = closed / open right-hand side; **-n** = named/conventional frame, phrase-style not soft; parallel chains on fixed A, mixed REV allowed).

g) **Quote / mention / aside fences:** [Span markers](quotations.md) are ordinary PoS + two single-vowel roots joined by mid-word **`x`** + ending (**-l** / **-m** only). They are **not** left-bound `l`, **not** a global `xl` cluster, and **not** clause joins (`xal` / `xam` / … — joins have no mid `x` on that series). No stacked vowels on TYPE or EDGE. Discourse-only citations use PoS `/x/` (`xaxal` … `xaxul`).