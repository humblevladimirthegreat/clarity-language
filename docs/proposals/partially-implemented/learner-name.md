# Proposal: learner name (`SELF` slot)

**Status:** PARTIALLY IMPLEMENTED — phases 1–3 shipped; phase 4 (rewrite existing first-person examples and drills) remains.  
**Related:** [word-endings.md](../../grammar/word-endings.md#named-n-beginner) (Named **-n**, [greeting](../../grammar/word-endings.md#greeting)), [pronouns.md](../../grammar/pronouns.md) (**`ugobo`** *speaker*), [lexicon](../../grammar/lexicon.md) / [`LexiconSearch.vue`](../../grammar/.vitepress/components/LexiconSearch.vue), [grammar-docs.md](../../meta/grammar-docs.md#house-cast), [translation-exercises.md](../../meta/translation-exercises.md), [drill-generation.md](../../meta/drill-generation.md), [glosses.md](../../meta/glosses.md)  
**Design authority:** none for grammar. Names stay ordinary [proper names](../../grammar/word-endings.md#proper-name--n); this proposal is site tooling plus editor policy for where the learner's own name appears.

## Motivation

Agalan prefers that speakers name themselves (`zululon vawalal.` *I walk*, said by Ululon) over the role word **`ugobon`**. The docs have no speaker to name, so first-person examples either borrow a house-cast person ("Ululon names himself") or fall back on **`ugobon`**, which the house-cast policy discourages as a dummy *I*. Both cost the learner: the first reads as third person, and the second hides the habit the grammar is trying to teach.

If the site knows the learner's own Agalan name, first-person examples and drills can use it. *I walk* then reads exactly as the learner would say it.

## Goals

1. Let each learner pick **one proper Agalan name**, stored in their browser, and show it in marked example slots across the site.
2. Allow **only** valid names: one published lexicon root + **-n**. No free text, no foreign `@<…>` names, no invented stems.
3. Offer a **name helper** where Named **-n** is first taught (word-endings Beginner). It suggests random published roots, showing both the concrete and the abstract sense, and links to the lexicon for choosing by hand.
4. When no name is set, default to the speaker special **`ugobon`**, so every `SELF` example stays grammatical and true (*I* = the speaker).
5. Finish by rewriting existing first-person examples and drills to use the `SELF` slot.

## Non-goals

- Accounts, sync across devices, or any server storage. `localStorage` only.
- Multi-root names (`ROOT x ROOT` phrasal names), [named handles](../../grammar/word-endings.md#named-handles), or nativizing English names.
- A second slot for the listener. Decided against: the reader is already `SELF`, the house cast covers other people, and unset defaults would render dummy `zugobon dedonen`.
- Changing the house cast. Third-person people stay **`azawa`** / **`ulula`** / **`uhubu`**.

## What counts as a proper name

A valid learner name is the **-n** citation of a row in [`data/lexicon-published.csv`](../../../data/lexicon-published.csv): `azawan`, `agalan`, `ugurun`, …

Exclusions:

| Excluded | Why |
|----------|-----|
| Closed specials **`ugobo`** / **`edone`** / **`aha`** / **`enenu`** as a *chosen* name | They are discourse roles, not names. **`ugobon`** appears only as the unset default. |
| House-cast roots **`azawa`** / **`ulula`** / **`uhubu`** | A learner called Azawan would collide with the third-person Azawan in the same example. |
| **`agala`** | It names the language; *Agalan walks* is confusing. |
| Rows whose English is unsuited to a person name (editor-curated deny list, e.g. waste or violence senses) | Only for the random helper; hand-picking from the lexicon can still allow them, unless the deny list turns out to be needed there too. |

Validation is **membership in that set**, computed at build time from the CSV. No in-browser parser is needed, and nothing else can reach storage. When a stored name is no longer in the set (the root was respelled or unpublished), treat it as unset and ask the learner to choose again.

## Rendering model

- **Store:** one module-level Vue `ref` (`learnerRoot: string | null`) backed by `localStorage` (key `agalan.learnerName`), wrapped in `try/catch`. Every slot reads the same ref, so changing the name updates the page at once.
- **Default:** unset → root `ugobo`. Static HTML (SSR) always renders the default. The client swaps in the learner's root after mount, and the slot fades in so the change does not flash.
- **Authoring syntax:** in code spans and `agalan` blocks, the placeholder root `SELF` takes a normal PoS letter and ending: `zSELFn vawalal.`, `jSELFn.`, `dSELFn`. A markdown-it rule rewrites each `SELF` token to a `<LearnerName>` span that renders the chosen root.
- **Morph glosses:** the slot's gloss renders reactively. The default is `z-speaker` (the overlay gloss). A chosen name shows the English name (`z-Ugurun`), per [glosses.md](../../meta/glosses.md) names.
- **Free English:** always *I* / *me* / *my*. That is true either way, because both the default and a chosen name refer to the speaker.
- **Other consumers:** [`AgelanInspect`](../../grammar/.vitepress/components/AgelanInspect.vue), [`GlossViewer`](../../grammar/.vitepress/components/GlossViewer.vue), [`IpaPlay`](../../grammar/.vitepress/components/IpaPlay.vue) and [`SpeakButton`](../../grammar/.vitepress/components/SpeakButton.vue) receive the substituted text, so inspect, IPA and speech all match what is shown.

## Phases

### Phase 1 — store, slot, and build support

1. Build step: emit `learner-names.json` (valid roots → concrete / abstract English) from the published CSV minus the exclusions.
2. `useLearnerName()` composable: the ref, `localStorage` read/write, validation against the JSON, and a `clear()`.
3. `<LearnerName>` component plus the markdown-it rewrite for `SELF`.
4. Lint ([`src/lint`](../../../src/lint)): treat `SELF` as a template placeholder filled with `ugobo`. The span must parse as a whole with that filler, and morph-gloss checks compare against the filled parse. **Roots used here** rows may list the learner name as *your name* with Agalan `SELFn`. Lint accepts that row without a lexicon lookup.
5. Wire the substituted text into the inspect / gloss / IPA / speech components.

The site builds with no visible change: nothing uses `SELF` yet.

### Phase 2 — name helper on word-endings Beginner

Place `<NameHelper />` in [word-endings.md](../../grammar/word-endings.md) Beginner, right after Named **-n**, before [Greeting](../../grammar/word-endings.md#greeting). The greeting section already tells the learner to "offer your own name", so it becomes the first `SELF` example: `jSELFn.` → *(your name).* (hello / goodbye).

Helper behavior:

- **Suggest:** shows one random valid root as its **-n** citation, with both senses, e.g. `ugurun`: *grin* / *delight*. Each has a play button (IPA / speech) and a short line: "as a name, it carries both pictures". The mnemonic appears when the row has one.
- **Another:** rerolls. Keep the last few for back-navigation, and do not repeat within a session.
- **Choose this name:** saves it. The helper then switches to "Your Agalan name is `ugurun`" with **Change** and **Clear**.
- **Pick your own:** links to the [lexicon](../../grammar/lexicon.md). Lexicon rows gain a **Use as my name** button on eligible roots (hidden on excluded rows), so the choice comes straight from the lexicon row.
- **Unset note:** until a name is chosen, the helper says that examples marked as yours use **`ugobon`**, the word for whoever is speaking. This is the learner's first sight of **`ugobo`**. It is framed as a placeholder, not taught as a pronoun; [pronouns.md](../../grammar/pronouns.md) still owns the teaching.

Stored names stay valid across sessions. Nothing else on the site needs the helper to exist.

### Phase 3 — global presence and exercises

1. A small name chip in the site nav (`Layout.vue`): it shows the current name or "Choose a name", and opens the helper in a popover on every page.
2. An unset-state marker on `SELF` slots: a subtle dotted underline with the tooltip "Choose your Agalan name", linking to the helper.
3. Translation checkpoints: `SELF` in both prompts and spoiler answer keys. English prompts use *I* / *me*, and the key shows the learner's actual name.
4. Policy text (editor docs only):
   - [grammar-docs.md](../../meta/grammar-docs.md#house-cast): the house cast stays for other people. First person uses `SELF`, never a house name that "names himself", and never a bare `zugobon` when a name is the point.
   - [translation-exercises.md](../../meta/translation-exercises.md) principle 10 and the English-pronoun rule: *I* is allowed for `SELF` items from word-endings Beginner onward.
   - [drill-generation.md](../../meta/drill-generation.md): add `SELF` to the path allowlist at word-endings Beginner. Dummy *I* stays forbidden for untaught **`ugobo`**, but *I* via `SELF` is fine.
   - [glosses.md](../../meta/glosses.md): the `SELF` gloss rule above.

### Phase 4 — replace existing examples and drills

1. **Inventory script** (dry-run output): list every code span / `agalan` line whose free English or note is first person and whose Agalan uses
   - a house name glossed as the speaker ("Ululon names himself", *I* on a name word), or
   - **`ugobo`** where the page is **not** teaching the speaker special.
2. **Rewrite rules:**
   - House-name self-reference → `SELF` (`zululon vawalal.` "I walk. Ululon names himself" → `zSELFn vawalal.` "I walk.").
   - Dummy **`zugobon`** → `zSELFn`.
   - **Keep `ugobo`** wherever the discourse role is the lesson: [pronouns.md](../../grammar/pronouns.md) specials, person-role **-x** / clusivity in [plurality.md](../../grammar/plurality.md), comparatives performance **`zugobon`**, role anchors in [roles.md](../../grammar/roles.md), and any contrast *name vs role* (which should then show both: `zSELFn` beside `zugobon`).
   - Third-person house-cast lines stay as they are.
3. **Drills:** rerun the affected checkpoints through [drill-generation.md](../../meta/drill-generation.md) execute, one file per agent. Replace first-person items, update the vocab banks (a *your name* row), and keep one escalating setting per checkpoint.
4. `npm run build`. Spot-check each touched page in both states (unset / named) for gloss, IPA, speech and inspect.

## Risks and checks

- **Static text drift:** search indexes, RSS, printouts and no-JS readers all see **`ugobon`**. That is acceptable, because the default is true.
- **Stale names** after a respell: handled by validation-on-read (see above). A respell via `convert-word` could also write a small alias map so stored names migrate silently.
- **Gloss lint:** the filled parse must use the default filler. Otherwise, gloss lines would have to match an arbitrary learner root.

## As built (phases 1–3)

- Eligibility is one rule everywhere (helper and lexicon **Use as my name**): [`eligibleNames`](../../../src/learner-name.ts) requires both a concrete and an abstract sense, and excludes specials, house cast, `agala`, flag (country) rows, roots whose **-n** citation is a closed overlay (`ehegen`, `odohon`, …), and the editor deny list `NAME_DENY`.
- Slot syntax: `SELF` glued to letters inside Agalan (`zSELFn`, `SELFn.`); a free-standing `SELF` in gloss lines (`z-SELF`, or `SELF` for a bare citation). The lint fills the default before every check; the speaker and a name trace the same constructions, so learning order needs no exemption.
- Rendering: [`learner-name-md.ts`](../../grammar/.vitepress/lib/learner-name-md.ts) → `SelfCode` / `SelfGloss`; store [`useLearnerName.ts`](../../grammar/.vitepress/composables/useLearnerName.ts) lazy-loads the lexicon to validate; nav `NameChip` opens `NameHelper`; unset slots are dotted-underline buttons that open it.
- First use: word-endings Beginner helper, greeting example, and one checkpoint item.

## Open questions

- Should the helper group suggestions by theme (nature / feeling / object) for learners who want a meaning first?
