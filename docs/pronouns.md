# Pronouns

Anaphoric pronouns use the **-r** [reference suffix](reference-suffix.md). Pronouns replace definite articles: once something has been introduced, you refer back with a **-r** form (or an alternate construct below), not with a separate “the X” form.

## Letter-based and full-root anaphoric pronouns

An anaphoric pronoun can refer back to **any prior word** (noun, verb, adjective, adverb, and so on — not only arguments). It takes the usual part-of-speech prefix and the **-r** reference suffix. The pronoun’s PoS prefix is whatever role you need **now**; it need not match the antecedent’s original PoS.

Two lengths of stem:

1. **Letter pronoun** — a **fixed prefix of that word’s root**, cut **up to and including the 2nd vowel**. (Roots are `V(CV)+`, so the stem is typically the opening `VCV`.) Prefer this when it already picks the intended antecedent.
2. **Full-root pronoun** — the **entire root** of the antecedent, still ending in **-r**. Use this when the letter pronoun’s most recent match is **not** what you intend. The **-r** ending is obligatory: this is still a reference, not a new indefinite (`-l` / `-m`) mention.

Resolution is always unambiguous for the listener and for a parser: a **-r** pronoun refers to the **most recently mentioned matching** antecedent — the most recent word whose root begins with that stem (letter length or full root, depending on which form was used). There is no guesswork about which match was meant.

**Mention = any word use in the discourse** (any part of speech), including pronoun uses themselves. Resolving a pronoun counts as a new mention of that referent and makes it the most recent again.

It is the **speaker’s** job to ensure the intended referent is the most recent match. Use the letter pronoun when that is already true. If the most recent match is **not** what you intend, use the **full-root `-r` form**. If even that isn't distinct, add an **adjective / ordinal** to disambiguate. That mention becomes most recent, so later pronouns can refer to it again.

Add **-sh** after the reference suffix to mark a **group referent**: the **group containing** the referent (on nouns / event-sets), or [collective ascription](plurality.md#collective-ascription) on `/ɡ/`. Example: `…r` refers to one noun; `…rsh` refers to the group that includes that noun. The same **-sh** works on full words (`…lsh`, `…nsh`, etc.) where plurality allows it. See [plurality.md](plurality.md).

There are no English-style 3rd-person pronouns (*he* / *she* / *it* / *they*) and no impersonal *one*.

## English translation guide (antecedent PoS × pronoun PoS)

Clarity has one anaphoric mechanism (`-r`); English does not. Approximate by crossing **what was mentioned** (antecedent’s PoS) with **what role you need now** (pronoun’s PoS). The referent stays the same discourse entity; only the English wording changes with the type shift.

**How to use the tables**

1. Find the **antecedent’s PoS** (the prior mention you are pointing at) — same-role table, or the matching cross-role subsection.
2. Find the **pronoun’s PoS** (the slot you are filling).
3. Use that English gloss as a reading aid — not as a claim that Clarity has separate pronoun lexemes.

Noun prefixes `/z/`, `/d/`, and `/b/` share the same “entity” reading; English case and preposition choice follow the pronoun column. Group **-sh** → *they* / *those* / *that group* (the group containing the referent).

**Pronoun `/x/` vs `/h/`:** `/x/`…`-r` is **discourse navigation** — *going back to subject X* / *returning to that thread* (removing it does not change the following claim). Clause **aboutness** (*regarding X*, as part of what the claim is about) stays `/h/` + `/b/` X — see [Adverbs](language-reference.md#adverbs-h) and [Discourse markers](language-reference.md#discourse-markers-x).

### Same-role resume (antecedent PoS ≈ pronoun PoS)

| Antecedent → pronoun | English approximation |
|----------------------|------------------------|
| `/z/` → `/z/` | *he / she / it / they* (subject); *that one* |
| `/d/` → `/d/` | *him / her / it / them* (object); *that one* |
| `/b/` → `/b/` | *him / her / it / them* as the relation’s argument (*of/to/for/with that*, per the host) |
| `/v/` → `/v/` | *do so* / *do that* / verb again |
| `/ɡ/` → `/ɡ/` | *such* / *that* / *so* (same property again) |
| `/w/` → `/w/` | *that* degree / frame / criterion again (*likewise very / alleged / …*) |
| `/h/` → `/h/` | *thus* / *so* / *that way* / *then* (same clause framing) |
| `/j/` vocative → `/j/` vocative | calling the same addressee again (*you there* / the name again) |
| `/j/` interjection → `/j/` interjection | repeating that exclamation / formula |
| `/x/` → `/x/` | *and so* / *likewise* / the same linker or fence again |

Clause-force `/j/` is not resumed with `-r` (closed force set; see [utterance markers](language-reference.md#utterance-markers-j)).

### Cross-role recast (antecedent PoS ≠ pronoun PoS)

Each subsection is an **antecedent** PoS; the table rows are the **pronoun** PoS. Same referent, new role — English just needs a longer paraphrase.

#### Antecedent was a noun (`/z/`, `/d/`, or `/b/`)

| Pronoun PoS | English approximation |
|-------------|------------------------|
| `/z/` `/d/` `/b/` | Ordinary 3rd-person or *that (one)* — see same-role table; `/b/` follows the host relation |
| `/v/` | Treat that entity as the action: *do that (to/with it)* / *X it* (English noun→verb) |
| `/ɡ/` | *that one’s* / *of that kind* / property tied to that entity |
| `/w/` | Degree or frame scoped to a property of that entity (*that* standard of grading) |
| `/h/` | Circumstance framed by that entity (*with/by that*); clause aboutness is `/h/` + `/b/` …`-r` (*regarding that*), not bare `/h/`…`-r` |
| `/j/` vocative | Address that entity (*hey, you* / the name) |
| `/x/` | *Going back to subject X* / *returning to that thread* (discourse resume; not clause aboutness) |

#### Antecedent was a verb (`/v/`)

| Pronoun PoS | English approximation |
|-------------|------------------------|
| `/z/` `/d/` `/b/` | *that action / event / doing*; *the (act of) …-ing*; English *it* for the event — **not** the agent/patient; use [role compounds](special-vocabulary.md#role-compounds) (`zax<attack>r`, `dux<attack>r`) |
| `/v/` | *do so* / *do that* |
| `/ɡ/` | *such* (done that way); property of having done that |
| `/w/` | Frame on an adjective about that doing (*allegedly that*, *former that*) |
| `/h/` | *by doing so* / *thereby* / *in that manner of acting* |
| `/j/` | Vocative/interjection built on that named act (rare) |
| `/x/` | *Going back to that (doing / event)* — resume that thread |

#### Antecedent was an adjective (`/ɡ/`)

| Pronoun PoS | English approximation |
|-------------|------------------------|
| `/z/` `/d/` `/b/` | *the … one*; *that quality / property*; *those who are …* |
| `/v/` | *be/do that* (act characterized by the property) |
| `/ɡ/` | *such* / *that* (same property) |
| `/w/` | *that* degree of the property (*very much so*) |
| `/h/` | *in that way* / *so* (manner from the property) |
| `/j/` | Rare; named category used as call |
| `/x/` | *Going back to that (property / category)* — resume that thread |

#### Antecedent was an adjective adjunct (`/w/`)

| Pronoun PoS | English approximation |
|-------------|------------------------|
| `/z/` `/d/` `/b/` | *that degree / scale / criterion* (as a thing) |
| `/ɡ/` | Host property under *that* frame again |
| `/w/` | Same adjunct again |
| `/v/` `/h/` | Act or clause framed by that degree/criterion |
| `/j/` | Rare |
| `/x/` | *Going back to that (scale / criterion)* — resume that thread |

#### Antecedent was an adverb (`/h/`)

| Pronoun PoS | English approximation |
|-------------|------------------------|
| `/z/` `/d/` `/b/` | *that time / place / manner / reason / recipient-slot* (the adjunct as a noun) |
| `/v/` | Act under that circumstance |
| `/ɡ/` | Property *as of* that circumstance |
| `/w/` | Adjective-level echo of that frame |
| `/h/` | *thus* / *so* / *then* / *that way* |
| `/j/` | Rare |
| `/x/` | *Going back to that (circumstance / framing)* — resume that thread |

#### Antecedent was an utterance marker (`/j/`) or discourse marker (`/x/`)

| Pronoun PoS | English approximation |
|-------------|------------------------|
| Same class (`/j/` or `/x/`) | Repeat that vocative, interjection, or linker (see same-role table) |
| `/x/` from a content antecedent | *Going back to subject X* (see cross-role `/x/` rows above) |
| Noun / verb / adjective / adverb | Recast the *named formula or discourse label* as an ordinary referent (*that greeting*, *that agenda item*, *that cite-fence*) — common for `-n` titles, rare for ordinary *and* / *wow* |

### Quick English cheat sheet

| You want English… | Typical Clarity shape |
|-------------------|------------------------|
| *he / she / it / they* (entity again) | Noun antecedent → `/z/` `/d/` or `/b/` …`-r` |
| *do so* / *do that* | Verb antecedent → `/v/` …`-r` |
| *such* / *that kind* | Adjective antecedent → `/ɡ/` …`-r` |
| *thus* / *that way* | Adverb antecedent → `/h/` …`-r` |
| *regarding that* (clause aboutness) | `/h/` *regarding* + `/b/` …`-r` |
| *going back to subject X* (thread resume) | Any antecedent → `/x/` …`-r` |
| *the doing of it* / *that action* | Verb antecedent → noun …`-r` |
| *the red one* / *that quality* | Adjective antecedent → noun …`-r` |
| *by doing so* / *thereby* | Verb antecedent → `/h/` …`-r` |
| *that one’s* / *of that kind* | Noun antecedent → `/ɡ/` …`-r` |
| *that* (prior cite / mention / aside / opaque) | [Span anaphor](spans.md#endings) → `daxar` / `doxar` / `dexar` / `duxar` / … (TYPE selects antecedent kind; PoS = role now; writing `d[=]`) |

**Span anaphors** are closed forms in the [span-fence](spans.md) series (`{PoS}{TYPE}xa{r}`, EDGE **a**), not letter/full-root content pronouns. They resolve to the **most recent span of that TYPE** and treat it as a referent in the new slot (*he said **that**?!*) — they do **not** re-open a cite. Ordinary content **-r** still resumes words *inside* a non-opaque span when those words were introduced as ordinary lexicon.

Special pronouns (**`ivo`** / **`ile`** / **`enu`** / **`odo`**) are **not** covered here — they are separate forms (below), not `-r` stems from ordinary antecedents. Content questions (*who* / *what* / *where* / *what did they do?* / *what happened?*) use [unspecified-member **-r** under **question** force](questions.md#fill-ask-r) (`zar` / `zor` / `zer` / `zur` / `var` / `vor` / `ver` / `vur` / `xar` / …), not a special pronoun.

## Special pronouns
<a id="special-pronouns"></a>

Closed discourse-role roots (not letter/full-root **-r** from ordinary antecedents). They take the usual PoS prefix for the slot they fill.

| Role | Root | Image → sense | Default ending | Example |
|------|------|---------------|----------------|---------|
| **Speaker** | **`ivo`** | 🎤 *mic* → *producer-role* | **-n** | `zivon` *I* (this utterance’s producer) |
| **Listener** | **`ile`** | 🎧 *headphones* → *addressee-role* | **-n** | `dilen` *you* (this utterance’s addressee) |
| **Generic person** | **`enu`** | 👤 *silhouette* → *a person* | **-n** | `zenun` *someone* (a nonspecific individual) |
| **Next clause** | **`odo`** | 🚪 *doorway* → *what follows* | **-l** | `bodol` / `dodol` — placeholder for the dependent that follows |

**Medium-neutral.** **Speaker** and **listener** name the **producer** and **addressee** of the current utterance — speech, writing, signing, or any other channel. They are not restricted to oral talk (*speaker* ≠ “person vocalizing”; *listener* ≠ “person hearing”). Same roots in a letter, chat, book, or recording.

**Endings.** Person roles default to **-n** (definite discourse roles, parallel to proper names). Soft **-m** is available when the role framing is hedged. **Next clause** defaults to **-l** (exact forward slot). Soft **-m** on **`odo`** hedges the subordination edge. Do **not** treat these roots as ordinary indefinite kinds (**-l** on person roles) or as content anaphors built from a prior lexicon stem.

**Speaker / listener.** 1st / 2nd person only when a name is unavailable or undesired. They label **roles in this discourse**, not identity essence. On [judgment benchmarks](comparatives.md#judgment-benchmarks): bare **`zivon`** = *less … than where I sit* (performance); normative personal standard = **`zivox+1n`** ([digit morph **`+1`**](special-vocabulary.md#numeric-derivation) on **`ivo`**). Do **not** reuse **`ile`** for [evidential](special-vocabulary.md#evidentiality) hearsay (**`erare`** stays *told*).

**Generic person (`enu`).** A nonspecific **individual** — not English impersonal *one*, not [unspecified-member](coordination.md#unspecified-member-r-phrase) **`zar`** / **`dar`** (those are join gaps / indefinites of any kind), and not a 3rd-person anaphor (use content **-r** once someone is introduced).

**Next clause (`odo`).** Placeholder for the material that **immediately follows** it ([dependent clauses](language-reference.md#dependent-clauses)). **Matrix-final in its clause:** **`odo`** is the last word of that host (for `/h/`+`/b/` subordination, the contiguous unit ends with **`odo`**); the dependent follows with no intervening host words. **Chaining** allowed: a dependent may itself end in **`odo`**. Takes the PoS prefix of the slot it fills (`/d/` complement, `/b/` under `/h/` *because* / *if*, etc.).

| Clarity | Reading |
|---------|---------|
| `jal zivon v<go>l` | *I go* |
| `jal zivon v<write>l dilen` | *I write you* (letter / message — same roots) |
| `jal zenun v<arrived>l` | *Someone (a person) arrived* |
| `jal zivon v<told>l d<Sam>n dodol jal z<Lea>n v<left>l` | *I told Sam that Lea left* |
| `… hurugul bodol jal …` | *… because [dependent]* |
| `… horodol bodol jal …` | *… if [dependent]* (one-way) |
| `… heluvel bodol jal …` | *… iff [dependent]* (both ways) |

**Group containing** a referent is not a separate special pronoun: append **-sh** where [plurality](plurality.md) allows it (`zivonsh` = the group containing the speaker; inclusive *we* = join of speaker + listener, not a fifth root).

**Prefer names.** When a proper name is available, use it (`-n`) and/or its pronoun (`-r` from the name’s root) — including for self-address — rather than **`ivo`** / **`ile`**. Proper names are definite; the special pronouns are for the narrow cases where a name is unavailable or undesired. See [Proper name (`-n`)](reference-suffix.md#proper-name--n).
