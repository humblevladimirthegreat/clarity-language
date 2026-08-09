# Phonology and Phonotactics

Clarity has the following goals for its phonology:

1. Easy to sing (explained below).  
2. Unambiguous pronunciation \- it should always be clear how to pronounce it from the spelling.  
3. Clear word boundaries (even within a compound word).

### Vowels

I chose vowels that aren't fully open or fully closed so you don't have to do [vowel modification](https://www.singwise.com/articles/vowels-formants-modifications) (see section "VOWEL MODIFICATION ('COPERTURA')") to sing them in your high/low range.

Cue words are Standard American English:

| Letter | IPA | English cue |
|--------|-----|-------------|
| **e** | /e̞/ | *bet* |
| **u** | /ʌ/ | *but* |
| **o** | /o/ | *boat* (don't glide, like Spanish *no*) |
| **a** | /ɑ/ | *father* |

Stacked vowels are pronounced as separate syllables:
juon = ju'on

### Consonants at beginning of syllables

The language has no distinction between voiced/unvoiced, but the voiced version is preferred because you can sustain notes across letters (voiceless requires briefly stopping the airflow). You can still use the unvoiced for stylistic reasons.

| Letter | IPA | English cue |
|--------|-----|-------------|
| **h** | /ɦ/ | *ahead* |
| **w** | /w/ | *we* |
| **g** | /ɡ/ | *go* |
| **d** | /d/ | *do* |
| **j** | /j/ | *yes* (Germanic j as in "ja") |
| **b** | /b/ | *be* |
| **z** | /z/ | *zoo* |
| **m** | /m/ | *me* |
| **n** | /n/ | *no* |
| **v** | /v/ | *vie* |
| **x** | /ʒ/ | *vision* (the *si*) |

Word-final only (not ordinary onsets): reference suffixes **-l** / **-m** / **-n** / **-r**, and plural digraph **sh** /ʃ/ (*ship*) — see Phonotactics below.

unused potential beginning clusters:
gw, vw, xw, bl (should not mean left aligned b)

### Phonotactics

A word contains these parts:
1. the part of speech prefix
2. optional mid-word **l** after the PoS prefix — **left-bound** on adjectives (`gl-`) only; see below
3. the root(s) - multiple if compound word
4. the [reference suffix](reference-suffix.md) (**-l**, **-m**, **-n**, or **-r**)
5. optional plural **-sh** (associative group / address-set on listener / collective `/ɡ/`), after the reference suffix — see [plurality.md](plurality.md)

**Writing:** these pieces are one unbroken token — **no hyphen** after the PoS letter (`zumogon`, not `z-umogo`). Foreign roots use `PoS<…>ENDING` (e.g. `d<english>l`). Opaque span brackets take **no** ending on the closer (`d<sushi>`). Full orthography note: **[core.md § Orthography](core.md#orthography)**.

roots have form V(CV)+
if a compound root, then **x** separates them

a) A word root almost always starts with a vowel. The ending and beginning consonants were carefully chosen so that you can never confuse which syllable a consonant belongs to (vaban must be pronounced va'ban and not vab'an because syllables never end with a consonant unless it's the end of the word).

b) All **content** words end with a [reference suffix](reference-suffix.md) (**-l**, **-m**, **-n**, or **-r**), optionally followed by plural **-sh** (/ʃ/). No other syllables end with a consonant, so word boundaries stay clear even when pauses are unreliable (as in singing). Allowed word-final clusters are those suffixes plus **-sh** (**-lsh**, **-msh**, **-nsh**, **-rsh**). The digraph **sh** is used only as this plural marker (word-final, after a reference suffix); it is not an ordinary root consonant. **Utterance** boundaries (period, **`/j/`** turn reset vs **`/x/`** continue dip) are [orthography and prosody](core.md#orthography-and-prosody-periods) — discourse pauses, not word-edge phonotactics.

c) Easy to tell the components of a compound word because **x** separates them. Mid-word **x** is only the compound joiner (never part of a root); word-initial **x** is the discourse-marker prefix. Ordinary compounds include lexicon sense-compounds, [values](values.md), [ability](special-vocabulary.md#ability), [role compounds](special-vocabulary.md#role-compounds) (**`a`/`u`/`o` x ROOT**), [numeric derivation](special-vocabulary.md#numeric-derivation) (**`ROOT x NUM`**), and compact **[phrasal proper names](reference-suffix.md#phrasal-proper-names)** (foreign `z<Mary Smith>n`; nativized root₁`x`root₂`n` e.g. `zuzuzuxogeven`; not adjacent `z<Mary>n z<Smith>n`; long work titles prefer [cite](spans.md) instead). Closed [span fences](spans.md) also use mid-word **`x`**: **open** `{PoS}{TYPE}x{EDGE}{ENDING}` (TYPE **a** cite / **e** aside / **o** mention / **u** opaque; EDGE **a** multi / **e** clause-scoped / **o** atomic / **u** empty; e.g. `daxal`, `daxol`, `daxan`, `daxar`, `daxul`); **close** **`xuxul`** (pop one, complete) / **`xuxur`** (truncated) / **`xuxun`** (sic) / **`xuxum`** (pop all). Full mid-word **`x`** family table: **[x-compounds.md](x-compounds.md)** (span = vowel×vowel; role = vowel×root; values/ability = root×vowel; numeric derivation = root×number stem; sense/name = root×root).

d) **Number-word exception:** After a PoS prefix, a following **r** (start of the number marker) may form a cluster that is not otherwise allowed (e.g. `/ɡ/`+`r`, `/z/`+`r`, `/v/`+`r`, `/h/`+`r`, `/j/`+`r`, `/x/`+`r`). That cluster is legal **only** in [number words](numbers.md); it is not a global expansion of the onset-cluster list above. Number-marker **V** is usually a single vowel (`ra` / `ru` / `re` / `ro`); end-relative ordinals use digraph **`eu`** (`reu…`, writing **`#-`**) — stacked vowels as elsewhere, not join **`ue`**. Number stems are a closed formal grammar and must not be assigned as ordinary lexicon roots. Ordinary vs number-specific meanings of **-l** / **-m** / **-n** / **-r** are in [reference-suffix.md](reference-suffix.md#number-word-exception).

e) **Left-bound adjective (`gl-`):** After adjective prefix `/ɡ/`, an **l** may sit before the root, forming onset **`gl-`** (already on the cluster list above). That marks [left-bound attachment](core.md#left-bound-adjectives): the adjective precedes its host and binds the next eligible noun (`gl<big>l zogodol`). Default right-bound adjectives are `/ɡ/` + vowel after the host (`zogodol g<big>l`). This mid-word **l** is **not** the word-final reference suffix **-l**, and it is **not** available on other PoS prefixes as left-bound attachment (no `zl-`, `wl-`, `hl-`, …). Complex `/b/` and adjunct `/w/` stay after the `/ɡ/` word in either order.

f) **Join and reviser vowels:** [Phrase-level](coordination.md#phrase-level-coordination) (`/z/` `/d/` `/b/` `/ɡ/` `/w/` `/h/`: `zal`, `zam`, `zar`, `zor`, `zer`, `zur`, `gal`, `gam`, `ham`, …), [VP-level](coordination.md#vp-level-coordination) (`/v/`: `val`, `vam`, `var`, …), and [clause-level](coordination.md#clause-level-coordination) (`/x/`: `xal`, `xam`, `xar`, …) joins use the same vowel series under an ordinary PoS+root+ending shape; those vowel roots are reserved (**-l** / **-m** = closed / open; **-n** = named at phrase `/z/` `/d/` `/b/` `/w/` only; soft **-n** at clause only (`xan` = *and then*); VP `-n` = [join-act verbs](special-vocabulary.md#join-act-verbs); `/ɡ/` `/h/` `-n` = [join-relations](special-vocabulary.md#join-relations); **-r** on **a** / **o** / **e** / **u** at all levels = [unspecified-member](coordination.md#unspecified-member-r-phrase) (*something* / *anything* / *whatever-by-rank* / *something else* — VP *do something*, clause *something happened*; plain **u** = [negation](coordination.md#negation-u)); **e** / **oe** = **rank joins** — unmarked / exclusive; **ae** = equality / tie; leading **u** on **a** / **o** / **e** = [invert](coordination.md#invert-u-stacks) (*everything but* / *anything but* / **rank reversal**; no three-vowel stacks; empty-allowed on plain **o** + **-m** only) — not ordinary reference-suffix senses). All levels use a **fence** (optional shared modifiers immediately after the join; juxtaposed conjuncts; **left** preferred, **right close** allowed for style/comedy; [fence nesting](coordination.md#fence-nesting); pure infix illegal). There are **no** bare (prefix-less) **join** particles. Prefix-less revisers **al** / **am** / **an** / **el** / **em** / **en** / **ol** / **om** / **on** / **ul** / **um** / **un** (**-l** / **-m** / named **-n** required; no **-r**; bare **a** / **e** / **o** / **u** illegal) are reserved as [revisers](revisers.md) (in-clause *including* / *rather* / *instead* / *except*; discourse before force / omitted-default body / `/x/` continue / linker; *Finally* = **`x#e`**; **-l** / **-m** = closed / open; **-n** = named/conventional frame, phrase-style not soft; parallel chains on fixed A, mixed REV allowed).

g) **Span fences (cite / aside / mention / opaque):** [Opens](spans.md) are ordinary PoS + TYPE vowel (**a** / **e** / **o** / **u**) + mid-word **`x`** + EDGE vowel (**a** / **e** / **o** / **u**) + ending (**-l** exact / **-m** paraphrase / **-n** proper / **-r** anaphor). EDGE **`o`** = atomic (one token). **Closes** are only **`xuxul`** / **`xuxur`** / **`xuxun`** / **`xuxum`** (not clause joins `xul` / `xum`, not left-bound `l`, not a global `xl` cluster; not empty open `daxul`). No stacked vowels on TYPE or EDGE. Discourse-only opens use PoS `/x/` (`xaxal`, `xuxal`, …).