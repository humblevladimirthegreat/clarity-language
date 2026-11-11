# Ageben Spec: software specifications written in Ageben

**Status:** ready to implement, 2026-11-11. No phase started. Decided 2026-11-11: requirements may be say words or stacked acts, and the IR normalizes both; software vocabulary is added per concept from the pilot's counts; conventions stay in a meta note, not a published page; tooling lives in `src/spec/`, with spec files named `*.spec.ab`. Deferred to the pilot: the form for SHOULD.

**Related:** [parse.mjs](../../scripts/parse.mjs) (`--json`, `--llm-prompt`), [ast-walk.ts](../../src/parse/ast-walk.ts), [llm-passage.ts](../../src/parse/llm-passage.ts), the agent parser bundle [ageben.ts](../../src/agent/ageben.ts), [read-ageben.md](../meta/procedures/read-ageben.md), [lexicon.md](../meta/procedures/lexicon.md), [feature-criteria.md](../meta/feature-criteria.md). Neighbouring ideas: `syntax-highlighting.md` (fence underlines matter most in a spec), `speed-reading-view.md`.

**Depends on:** none. **Order:** none.

**Design authority:** *none* for phases 1 to 3 (a genre, its conventions, and tooling built on the current grammar). Phase 4 changes only the forms the user accepts under [Open decisions](#open-decisions), each through its owning grammar page.

## Problem

AI coding agents now write most of the code from a written request. The request is the weak link. English specs fail in the same places every time, and most of those places are the thinking traps Ageben was built to expose:

- **A guess reads like a fact.** *Currency is USD* may be a measurement, a stakeholder's say-so, or a placeholder. The implementer can't tell, so it builds on all three equally.
- **A rumour reads like data.** *Peak load is 2k rps* hides whether someone measured it, read it in a ticket, or inferred it.
- **Strength and source blur.** *must* / *should* / *can* don't say whether a rule comes from law, from one stakeholder, or from habit. So the implementer can't tell which rules it may question.
- **Consent is assumed.** *Users can share their location* doesn't say whether the user agreed, agreed once, or was assumed fine with it.
- **A temporary choice reads as permanent**, and a permanent one as revisable. *Use Postgres* says nothing about how settled that is.
- **Scope is ambiguous.** In *admins and users with 2FA*, does *with 2FA* cover the admins too? *Every order has an owner* doesn't say whether exceptions are allowed. *Notify on failure or timeout* doesn't say whether the list is closed. *Retry if the call fails* doesn't say whether failure is the only trigger.
- **How much is left to the implementer goes unstated.** *Add retries* may be a full design or a direction.

Ageben already has grammar for each of these, and its parser gives one reading per sentence. A spec written in Ageben can therefore be checked as a structure before any AI reads it, and the implementing AI reads that structure, not a guess at the author's intent.

## Goals

1. **A spec genre**: conventions for writing a software spec in ordinary Ageben, using only forms the grammar already teaches. One sentence per requirement, fact, assumption, decision, or task.
2. **A spec structure (IR)** built from the parser's tree. Each sentence becomes a record of its speech act, say word, stances, conditions, quantifiers, occasions, comparisons, and literal identifiers.
3. **Static checks** that run on the structure before implementation: open questions, contradictions, unbounded guesses, non-exhaustive lists, and missing sources.
4. **An implementation prompt** that hands the structure plus glosses to an AI. Each generated test traces back to a sentence id.
5. **Read-back**: the AI describes what it built, in Ageben. Comparing that description's structure with the spec's structure surfaces drift.
6. **Readability for people who don't speak Ageben**: every sentence is shown with its morph gloss and free English, so a reviewer can check the spec without fluency.
7. **A pilot spec** that finds the real gaps, so grammar decisions rest on evidence.

## Non-goals

- **No programming language.** Ageben Spec says *what* and *why*; the AI writes the *how* in an ordinary language. No control flow, no types, no execution.
- **No grammar added for software's sake.** Any gap the pilot finds goes to Open decisions and must pass [feature-criteria.md](../meta/feature-criteria.md) as a general feature of the language, or be resolved by a convention.
- **No learner-facing pages.** Spec conventions live in the meta note `docs/meta/ageben-spec.md`. A published page teaches no new form, so it can be added later if the genre proves out.
- **No English-host hybrid.** This is full Ageben, not Claritish.

## Why Ageben fits

Three properties do the work:

- **One parse.** Fences close lists explicitly ([joins](/joins#join-type-vowel-series)). [SHARED](/list-structure#shared-after-the-join) says when an adjective covers every item. [Scope islands](/scope-islands#scope-islands) limit a binder. The parser reports any reading no rule picks between (`--check-ambiguity`).
- **Ending and vowel scales carry meaning a spec needs.** On a list, a restrictor, or a universal fence, closed **-l** vs open **-m** is exhaustive vs non-exhaustive. On a say word it is the source: **-l** a rule, **-m** a person, **-r** nobody, i.e. custom. On a stance it is how settled the thing is.
- **The parse tree already exists.** `parse.mjs --json` gives the tree, `--constructions` names every rule used, `--llm-prompt` builds an AI-facing translation prompt, and [ageben.ts](../../src/agent/ageben.ts) bundles the parser for an agent with no repo.

## Design

### The mapping

Every row uses forms the grammar teaches today. *Spec job* is what an English spec tries to say.

| Spec job | Ageben | Owning section |
|----------|--------|----------------|
| Standing requirement, from a rule (law, policy) | say word, standing reach, **-l**: `hwovol` | [say words](/permission-consent#say-words), [reach](/permission-consent#say-reach) |
| Standing requirement, from a named stakeholder | **-m**, who has the say as a `bl-` word: `hwovom blalazun` | [someone over the act](/permission-consent#permission) |
| Convention, nobody's word | **-r**: `hwovor` | [say words](/permission-consent#say-words) |
| Forbidden / allowed, by the same three sources | `hwovul` …, `hwoval` … | [say words](/permission-consent#say-words) |
| User's choice, configurable | the doer's call: `hwozem` | [say words](/permission-consent#say-words) |
| Consent of the affected person: per act, standing, or assumed | `hwudam`, `hwodam`, `hwudar` | [consent](/permission-consent#consent) |
| A norm phrased as a description (*passengers remain seated*) | `yol yal`; a soft norm with a softer first act word | [stacked acts](/more-turn-words#stacked-acts) |
| A norm only for now | `yor yal` | [stacked acts](/more-turn-words#stacked-acts) |
| A one-off task for the implementer | command `yol` | [speech acts](/speech-moves#act-word-order), [firm and soft](/firm-soft#speech-act) |
| Fact or assumption about the world, with its source | statement + channel: `thugem` measured live, `thebam` reported, `thubom` from the pattern, `theyom` inferred, `thanam` deduced | [evidentiality](/evidentiality#evidentiality), [strength](/evidentiality#evidence-strength), [deduction](/evidentiality#deduction) |
| Whose claim it is | holder | [holder](/holder#holder) |
| A guess to verify before building / one that may stay open | `thomal` / `thomar` | [MAY follow-ups](/knowing#follow-up-endings-may) |
| Working assumption, for now | `theyur` | [notional](/notional#follow-up-endings-notional) |
| Test scenario, rehearsed | `theyul` | [notional](/notional#follow-up-endings-notional) |
| Open question the implementer must ask, not answer | fill-ask question | [fill ask](/questions#fill-ask), [which blank](/fill-ask-jobs#what-kind) |
| Guard: if / only if / if and only if / unless / even if | `thohem`, `thebem`, `thehom`, `thohem blurl`, `hezem thohem` | [if](/causation#if), [only if](/causation#only-if), [iff and only because](/because-and-iff#only-because) |
| Rationale | because `thahum`; whose need it serves: a sake | [because](/because-and-iff#only-because), [for a sake](/for-a-sake#whose-stake) |
| Invariant over every member, no exceptions / with exceptions | `zual` / `zuam` fence, bound tag for *each one* | [universals](/universals-domains#universals-domains-generics), [bound tags](/universals-domains#bound-tags) |
| Never / none | `zul`, `hal` | [universals](/universals-domains#universals-domains-generics), [never](/restrictors#only-when-never-hal) |
| How the invariant is known (proved, tested, observed) | channel on the generalization | [usually vs must](/usually-vs-must#generalization) |
| Trigger cases, exhaustive or not | occasions + restrictor, **-l** closed / **-m** open | [restrictors](/restrictors#only-when-never-hal), [more occasions](/more-occasions#more-occasions) |
| Preference order, last resort | `hol`, `huol` | [ranked](/more-occasions#ranked-with-listed-occasions) |
| State guards (*while not yet shipped*) | `helom`, `hawum`, `havem`, `huvum` | [phasal](/already-still-yet#phasal) |
| Ordered steps | clause sequence | [clause sequence](/clause-sequence#clause-sequence) |
| Fallback chain | try + `xen` | [fallback](/try#fallback) |
| How much design is left to the implementer | plan resolution: `thagor` sketch, `thagom` itinerary, `thagol` with backups | [plan](/intention#plan) |
| Decision record: final / revisable / for now | `thogel` / `thogem` / `thoger` | [decision](/want-and-decide#decision-revisability) |
| Nice to have | want: `thalom` | [want](/want-and-decide#want) |
| Spike or prototype | try, trial run: `howar` | [try](/try#try) |
| Scope by release: can / not yet / blocked for now / never | ability `xa` / `xe` / `xo` / `xu` | [ability](/can-and-cant#ability-stance) |
| Budgets and limits (*at most*, *up to code*, *over the limit*) | bars on a say word: `hwuvol zoel`, `hwuval zol` | [stance bars](/stance-bars#stance-bars), [bars](/bars#bars) |
| Quantities, ranges, percentages, times | numerals, ranges, measures | [number ranges](/ranges#number-ranges), [measures](/measures-and-percent#measure-phrases), [percent](/measures-and-percent#percent-and-percentage-points), [time](/digit-strings#time) |
| Includes / excludes / prioritizes | list verbs | [list verbs](/list-verbs#list-verbs) |
| Exclusive choice, whole-list denial | set joins | [set joins](/set-joins#exclusivity-and-denying-a-whole-list) |
| Effective from a version or date | as-of | [as-of](/as-of#as-of) |
| Legacy behaviour, still in effect after a change | `helam`, `haram` | [residue and former](/residue-and-former#residue-and-former-climate) |
| Definitions and glossary | identity and classification | [identity](/predication#identity), [classification](/predication#classification) |
| Project entities (a service, a screen) | proper names, **-n** | [proper names](/proper-names#proper-name--n) |
| Code identifiers, paths, regexes | opaque span `<…>` | [loans](/spans#loans) |
| Module or section scope | topic | [topic](/topic#topic) |

Shape check: each of these parses today. They use house-cast stand-ins, not software vocabulary.

> `zazozon vowurol hwovum blalazun.`
>
> z-Azozon | v-walk | [h-role-event-FORBID-said | bl-Alazun]
>
> "Azozon may not walk, as a standing rule; Alazun says so."

> `zual gogozel zwal vezuvel hual thubor.`
>
> [[z-everything | g-cat] | z-tag.A] | v-sleep | h-always | th-PATTERN.weak
>
> "Every cat always sleeps, from the few cases I have seen."

> `zazozon howar vowurol xen zazozor vozuyel.`
>
> [z-Azozon | h-ATTEMPT-trial | v-walk | x-or-else | z-←Azozon | v-sing]
>
> "Azozon gives walking a try; failing that, Azozon sings."

### Spec documents

- **File:** `*.spec.ab`: plain Ageben text, one sentence per line, an optional sentence id in a leading comment line.
- **Sections** are topics (`x…`), one per module or feature. A topic change resets what it governs, so section scope is visible to the parser.
- **Glossary first:** each project entity is introduced once as an **-n** name with an identity or classification sentence. Identifiers that must survive verbatim go in `<…>`.
- **Statement kinds** (from the act word and say word in the IR): *requirement* (say word or `yol yal`; both are allowed and the IR gives them one record, with the say word as house style in examples because it carries source and holder), *task* (`yol`), *fact or assumption* (statement + channel), *decision* (decision stance), *wish* (want), *question* (fill-ask or polar), *scenario* (notional rehearsal).

### The IR

`src/spec/ir.ts` walks the parser's JSON with [ast-walk.ts](../../src/parse/ast-walk.ts) and emits one record per sentence:

| Field | From |
|-------|------|
| `id`, `topic` | leading comment; current topic |
| `kind` | act words + say word + stances (above) |
| `act` | act word(s), firmness ending |
| `say` | reach, whose say, answer, source ending, `bl-` holder |
| `stances` | channel + strength + holder, MAY, plan, decision, want, ability, notional |
| `conditions` | hinge type, condition clause, `blurl` negation |
| `binders` | universal fences and bound tags, with closed / open |
| `occasions` | occasion list, restrictor vowel, closed / open / unspecified |
| `phase` | phasal word |
| `bars` | rank join, bar stance, numeric value |
| `literals` | opaque spans, names, numerals |
| `gloss` | morph gloss line; free English from `--llm-prompt` |

The IR never re-derives a reading. It copies what the tree says, so a parser fix reaches the spec tools with no change.

### Checks

| Check | Fails / warns |
|-------|---------------|
| Unparsed sentence, or one with an ambiguity the grammar doesn't resolve | fail |
| Open fill-ask or `thomal` | fail for *ready to implement*; listed as questions |
| Two requirements with the same act and answers that clash (require vs forbid) under overlapping conditions and binders | fail, both ids |
| Closed universal or `hual` backed by only a weak channel | warn: no exceptions claimed on thin evidence ([usually vs must](/usually-vs-must#generalization)) |
| Open list (**-m**) on occasions or a fence | note to the implementer: cases are not exhaustive; handle the rest |
| Fact with no channel | warn: source unknown |
| `thoger` decision | note: isolate behind an interface |
| `thagor` plan | note: implementer designs the details and reports them |
| Consent `-r` on a personal-data act | warn: assumed consent |
| Name used before its glossary sentence | fail |

### Implementation and read-back

1. `npm run spec -- check FILE` runs the parser, the IR, and the checks.
2. `npm run spec -- prompt FILE` writes an implementation prompt: the IR as JSON, each sentence with morph gloss and free English, the notes from the checks, and a rule to cite sentence ids in every test name and in a trace table.
3. `npm run spec -- readback FILE SUMMARY` takes the implementer's own Ageben summary of what it built (written with the agent parser bundle), builds its IR, and diffs it against the spec's IR by id: missing, extra, or changed say words, conditions, and binders.
4. `npm run spec -- render FILE` writes glossed HTML for reviewers: sentence, morph gloss, free English, and check notes inline.

### Vocabulary

Specs need words like *request*, *account*, *error*, and *retry*. The lexicon already has concrete roots for several nearby things (laptop, keyboard, folder, envelope, email, inbox, key, receipt, ledger, calendar, clock, link, ID, wastebasket, credit card, cloud). Three layers, in order of preference:

1. **Lexicon roots and compounds** where the gloss matches ([lexicon.md](../meta/procedures/lexicon.md)).
2. **Project -n names** defined in the glossary, for entities specific to one system.
3. **Opaque spans** for code identifiers that must be copied exactly.

The pilot counts how often each layer is needed. Vocabulary grows per concept from those counts: a general concept with no root that the pilot needs repeatedly becomes a proposed lexicon row with a concrete seed (most software concepts have a picture: an envelope for a request, a broken chain for an error). The user approves the list before phase 4 adds it.

### Gaps the pilot should test

Each is a guess, to confirm or rule out. None is a decision yet.

- **Data shape and cardinality** (*an order has one to five items*): of-relations + number ranges. Is that natural?
- **Defaults** (*by default, X; the user may change it*): a requirement plus `hwozem`, or a missing form.
- **Event triggers** (*when payment fails, notify*): a hinge, an occasion, or an occasion clause (`blarl`). Which one does the grammar intend?
- **Rationale that is not a human need** (cost, latency): `thahum` with an ordinary clause should cover it. Confirm.
- **SHOULD**: candidates are a prescription stance for a named sake (*ought, for this person's need*), a soft act (`yom yal`), and an open restrictor (`huam`, *as a rule*). The pilot records which one each SHOULD sentence reached for. The expected outcome is the prescription where a human need is the reason and the soft act otherwise.

## Implementation plan

If the user says to stop partway, the orchestrator [consolidates this proposal](../meta/procedures/proposals.md#consolidate) before the session ends.

Run with subagents: the pilot needs a fresh audit context, and the tooling units share little with the pilot.

### Units

| ID | Items | Agent | Model / effort | May edit |
|----|-------|-------|----------------|----------|
| **P1** | Pilot spec: write a small reference system in English (book lending: members, loans, due dates, fines, consent to reminders, a payment fallback, about 40 statements covering every row of [the mapping](#the-mapping)), then in Ageben, sentence by sentence, checking each with `parse.mjs` per [read-ageben.md](../meta/procedures/read-ageben.md). Log every workaround with its sentence. | `proposal-worker` | `opus` / `high` | `src/spec/fixtures/lending.spec.ab`, `src/spec/fixtures/lending.en.md`, this proposal (findings only) |
| **P2** | Independent gap audit of P1: classify each workaround as parser bug, grammar gap, or convention. Write each grammar gap as an open decision with options and a recommendation. Settle SHOULD as a recommendation from P1's sentences. List the vocabulary counts by layer, and propose lexicon rows (English concept, concrete seed, uses in the pilot) for concepts needed more than once. | `proposal-worker` (fresh) | `opus` / `high` | this proposal |
| **T1** | IR: `src/spec/ir.ts`, `src/spec/types.ts`, tests on the P1 fixture | `proposal-worker` | `opus` / `medium` | `src/spec/` |
| **T2** | Checks: `src/spec/check.ts` + tests, one fixture per check | `proposal-worker` | `opus` / `medium` | `src/spec/` |
| **T3** | CLI: `scripts/spec.mjs` (`check`, `prompt`, `render`), `spec` script in `package.json` | `proposal-worker` | `sonnet` / `medium` | `scripts/spec.mjs`, `src/spec/`, `package.json` |
| **T4** | Read-back: `readback` subcommand, IR diff by id, tests | `proposal-worker` | `opus` / `medium` | `src/spec/`, `scripts/spec.mjs` |
| **C1** | Conventions note `docs/meta/ageben-spec.md`: the mapping, document shape, statement kinds, vocabulary layers, and the tool commands. Report an `AGENTS.md` row (Editor notes: owns the spec genre). | `proposal-worker` | `opus` / `medium` | `docs/meta/ageben-spec.md` |
| **G\*** | Phase 4: one unit per accepted grammar decision, plus one unit for the approved lexicon rows, following that change's own procedure (lexicon, retie, read-ageben). Parser and grammar edit land together. | `proposal-worker` | `opus` / `high` | set per decision |

**Order:** P1 → P2 → **stop for the user's decisions on P2's open decisions** → T1 → T2 → T3 → T4 → C1 → G\*. T1 to C1 don't wait for grammar decisions unless one changes the IR's fields. If a decision does, stop and alert.

### Rule digest (pasted into every brief)

```
- Work only on your unit's items and files. Read AGENTS.md; never trust a form from memory.
- Ageben forms come from grammar pages and the parser; spellings of roots from npm run convert-word.
- Work out what a sentence means with node scripts/parse.mjs (--llm-prompt for meaning), never by reading pages.
- No new grammar. A sentence that needs a form the grammar lacks is logged with the sentence, the English,
  and the nearest workaround; then move on.
- Never link to a file under docs/proposals/; name it in backticks.
- Read slices: grep -n '^#' first, then the line ranges you need.
- Code: TypeScript, Node >= 24, tests with tsx --test beside the source (*.test.ts). Reuse src/parse/;
  never reimplement a parser reading.
- Edits that repeat go in a script file under tmp/, never inline.
- Verify with npm run verify -- --allow-generate (--fast inside an item); never paste raw build output.
- Do not commit; the orchestrator commits.
- Stop and report instead of working around: a premise no longer holds, later units would need a
  different design, or skipping would leave a broken state.
- At about 25 tool calls, check what is left. If it is small, finish the item, even past 25 calls.
  If a significant amount is left (more than a few edits, or pages you have not read yet), stop at a
  clean point, leave the tree green, and report: done, left (as steps), files touched.
- Report: done; files touched (count); gaps logged (ids); verify line; skips with reasons; left;
  AGENTS.md lines to change; inefficient.
```

### Gates and commits

- `npm run verify -- --baseline` at the start of each phase. `npm run verify -- --allow-generate` after each unit.
- Final gate: a clean `npm run build` and `npm test`.
- One commit per unit, about 7 for phases 1 to 3, plus one per G unit. Message: `ageben-spec <ID>: … [skip-cd]` with the co-author line. The orchestrator applies the `AGENTS.md` row after C1 and commits it with C1.

## Open decisions

None open. The decisions of 2026-11-11 are on the Status line. P2 adds the grammar gaps the pilot finds, its SHOULD recommendation, and the proposed lexicon rows here, each with options and a **Recommendation:**.

## Findings

*(P1 and P2 write here: each workaround with its sentence id, English, the Ageben used, and its class.)*
