# Phonology and phonotactics
<a id="phonology"></a>

How Agelan **sounds** and how syllables are built. Goals: easy to sing, spelling that shows pronunciation, and clear word boundaries (including inside compounds). This is the only grammar page that uses **IPA**. Grammar-design framing: [introduction.md](introduction.md#grammar-design). Fuller singability checklist: [Advanced](#singability-constraints).

## Beginner
<a id="beginner"></a>

### Why these sounds

Agelan uses vowels that are not fully closed, so you can sing high and low without heavy vowel modification. Consonants prefer the **voiced** version so you can sustain a note across letters (voiceless stops the airflow briefly). You may still use unvoiced variants for style. Word shape keeps consonants at **onsets** and at the **word edge**, so held notes and quick singing do not fight mid-syllable stops — and the ending still marks where each word stops when rhythm eats pauses.

**Mnemonic:** singable vowels + clear edges — spelling shows the sound.

### Vowels

Cue words are Standard American English:

| Letter | IPA | English cue |
|--------|-----|-------------|
| **e** | /e̞/ | *bet* |
| **u** | /ʌ/ | *but* |
| **o** | /o/ | *boat* (no glide — like Spanish *no*) |
| **a** | /ɑ/ | *father* |

These four sit in a mid-to-open range that stays singable at the top of an untrained range. Stacked vowels are separate syllables — not a glide: `juon` = *ju'on*. Hold each vowel; do not slide them into a diphthong.

### Consonants (syllable onsets)

There is no phonemic voiced / unvoiced contrast; voiced is preferred so the vocal cords can stay engaged through the letter. Unvoiced variants are fine for style.

| Letter | IPA | English cue |
|--------|-----|-------------|
| **h** | /ɦ/ | *ahead* |
| **w** | /w/ | *we* |
| **g** | /ɡ/ | *go* |
| **d** | /d/ | *do* |
| **j** | /j/ | *yes* (Germanic *j* as in *ja*) |
| **b** | /b/ | *be* |
| **z** | /z/ | *zoo* |
| **m** | /m/ | *me* |
| **n** | /n/ | *no* |
| **v** | /v/ | *vie* |
| **l** | /l/ | *lie* |
| **r** | /ɹ/ | *red* |
| **x** | /ʒ/ | *vision* (the *si*) |
[TODO: columns for unvoiced variant. Leave cell blank if unused in SAE]

[TODO: add examples with IPA; use component that allows tts]

### Phonotactics (word shape)
<a id="phonotactics"></a>

[TODO: move this section to intermediate, beginners don't need this]
A content word has these parts, written as **one unbroken token**:

1. Part-of-speech prefix
2. Optional mid-word **l** after `/ɡ/` only — **left-bound** adjectives (`gl-`)
3. The root(s) — more than one if compounded
4. The [reference suffix](reference-suffix.md) (**-l**, **-m**, **-n**, or **-r**)
5. Optional plural **-sh** after the reference suffix — [plurality.md](plurality.md)
[TODO: mention numbers]

**Writing:** write **role letter + root + ending** as one word (`zazawan`); native Agelan is **lowercase** only ([capitalization](core.md#capitalization)). Full orthography: [core.md § Orthography](core.md#orthography).

**Roots** have form **V(CV)+** (vowel-initial; mid consonants are ordinary onsets). Compound roots are separated by mid-word **`x`**. A root does **not** end in a consonant — the only word-final consonants are the reference suffix (and optional plural **sh**). That keeps held notes on vowels inside the word.

**Clear syllables:** a content root almost always starts with a vowel. Ending and beginning consonants are chosen so you never confuse which syllable a consonant belongs to (`vaban` = *va'ban*, not *vab'an*; `zalul` = *z-alu-l* — mid **l** onset in the root, final **-l** the ending) — syllables do not end with a consonant except at the **end of the word**. Spelling therefore has one pronunciation path; lexical stress is not part of the system (musical rhythm may place emphasis).

**Word edges:** all **content** words end with a reference suffix (**-l** / **-m** / **-n** / **-r**), optionally followed by plural **-sh** (/ʃ/). Allowed word-final clusters: **-lsh**, **-msh**, **-nsh**, **-rsh**. Digraph **sh** is only this plural marker (word-final, after a reference suffix) — not an ordinary root consonant. Those endings are the audible stop when song compresses pauses. 

**No clash with endings / numbers:** mid-root **l** / **r** are always followed by a vowel inside the root, so they are not mistaken for a final suffix. Ordinary content after a PoS letter begins with a **vowel**, so **`PoS+r…`** stays [number-only](#number-word-exception).

**Compounds:** mid-word **`x`** separates halves. Mid-word **`x`** is only the compound joiner (never part of a root); word-initial **`x`** is the discourse-marker prefix. Family map: [x-compounds.md](x-compounds.md).

## Intermediate
<a id="intermediate"></a>

### Number-word exception
<a id="number-word-exception"></a>

After a PoS prefix, a following **r** (start of the number marker) may form a cluster that ordinary content words never use (e.g. `/ɡ/`+`r`, `/z/`+`r`, `/v/`+`r`, `/h/`+`r`, `/j/`+`r`, `/x/`+`r`) — content roots are **vowel-initial**, so **`r` as a root onset** only appears **after a vowel** inside the root (`uru`), never immediately after the PoS letter. That **`PoS+r`** cluster is legal **only** in [number words](numbers.md). Number-marker **V** is usually a single vowel (`ra` / `ru` / `re` / `ro`); end-relative ordinals use digraph **`eu`** (`reu…`, writing **`#-`**) — stacked vowels as elsewhere, not join **`ue`**. Number stems are a closed formal grammar and must not be assigned as ordinary lexicon roots. Ordinary vs number-specific endings: [reference-suffix.md](reference-suffix.md#number-word-exception).


## Advanced
<a id="advanced"></a>

### Singability constraints
<a id="singability-constraints"></a>

The Beginner rules above are the usable inventory. This checklist is the design filter behind them — what Agelan avoids so ordinary singing stays easy:

TODO: replace the vowel letters below with the actual IPA

| Constraint | Why it helps | How Agelan keeps it |
|------------|--------------|---------------------|
| No fully closed vowels | Closed vowels shrink comfortable high range | Four mid-to-open vowels (**e u o a**) |
| No diphthongs | Glides force tract changes mid-note | Stacked letters = separate syllables (`juon` = *ju'on*) |
| Few consonant clusters | Clusters are harder to pronounce quickly | Ordinary shape is onset + vowel; limited exceptions below |
| No voice contrast | Voiceless stops cut the note; singers often voice them anyway | Voiced preferred; unvoiced allowed as style only |
| No mid-word coda | Ending a syllable on a consonant breaks a held note | Roots are **V(CV)+**; coda only at the **word edge** |
| No lexical stress | Music already places emphasis | Rhythm may stress a beat; spelling does not encode stress |
| Spelling = pronunciation | Singer need not memorize special readings | One path from letters to sound |
| Audible word edges | Song often removes speech pauses | Content words end in **-l** / **-m** / **-n** / **-r** (optional **-sh**) |

**Limited clusters (still legal):** left-bound **`gl-`**; number-word **`PoS+r`**; word-final **-lsh** / **-msh** / **-nsh** / **-rsh**. 

**Try it:** sing a short Agelan line quickly at a high comfortable pitch, then compare a line that piles closed vowels, clusters, and mid-word stops:

`zazawan guzem.`

/ za.za.wan ɡu.zem /

Versus (not Agelan — built to violate the constraints):

/ seiɹ ˈʈʂuɹt tis ˈheb.ɡiɹn fuofts /

The first should stay easier to sustain even when the second is only a little harder to speak.

### Design notes

- Unused potential onset clusters (not part of the language): *gw*, *vw*, *xw*, *bl* (should not mean left-aligned *b*).

## See also

- Writing words / orthography: [core.md](core.md#orthography)
- Numbers (PoS+`r` exception): [numbers.md](numbers.md)
- Mid-word **`x`**: [x-compounds.md](x-compounds.md)
