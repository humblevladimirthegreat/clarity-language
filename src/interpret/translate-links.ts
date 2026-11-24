/**
 * Translator rows for the discourse hooks that act on the claim before them (hooks.md#discourse-hooks):
 *
 * - R4d decision O-2: *instead* (`el`), *never mind* (`em`) and *drop the last point* (`ur`) withdraw the reading their
 *   link points to. The hook is used, its note names that reading, and finish() drops that reading's `on(Id)` fact, so
 *   nothing it claimed holds and a question about it is not answered *yes* from it.
 * - R4d decision O-3: *except* (`ul`, `um`) keeps the general claim before it, minus the members the exception names in
 *   the same role: the prior reading's universal or member rule takes `X != M` for each named member `M`, and its
 *   per-member pool terms skip `M`. An exception with no universal or list in that role (a first mention) skips nothing,
 *   and the two readings never clash through it.
 */
import { throughAntecedent, type ListTerm } from "./steps.js";
import type { Translator } from "./translate.js";
import { pool as poolClaim } from "./translate-conditions.js";
import { answerable, name, str } from "./translate-helpers.js";
import type { Ctx, Talk } from "./translate-types.js";
import type { Claim, Detail, Link, Reading, ReadingId, Term } from "./types.js";

/** R4d-5: the discourse hooks, by gloss, that add (`al`, `aol`, `ael`), reword (`ol`) or return (`ar`, `or`, `er`) and keep the clause. */
const KEPT_HOOKS: ReadonlySet<string> = new Set([
  "additionally",
  "additionally.open",
  "in.fact",
  "in.fact.open",
  "for.example",
  "for.example.open",
  "in.other.words",
  "in.other.words.open",
  "going.back.to.that",
  "as.I.said",
  "anyway",
]);
/** O-2: the discourse hooks, by gloss, that withdraw the claim they point to. */
const WITHDRAW_HOOKS: ReadonlySet<string> = new Set(["instead", "instead.open", "never.mind.that"]);
/** O-3: the discourse hooks, by gloss, that state an exception to the claim they point to. */
const EXCEPT_HOOKS: ReadonlySet<string> = new Set(["except", "except.open"]);

/** For talk(): whether `l` is a withdrawing or excepting hook that points back; a withdrawal names its reading in `out`. */
export function pointBack(l: Link, out: Talk): boolean {
  if (l.key !== "edge:hook" || l.kind !== "discourse" || !l.to) return false;
  const gloss = l.values?.gloss ?? "";
  if (WITHDRAW_HOOKS.has(gloss)) out.withdraws = l.to;
  return WITHDRAW_HOOKS.has(gloss) || EXCEPT_HOOKS.has(gloss);
}

/** O-2: the program's lines with each withdrawn reading's `on(Id).` fact dropped. */
export function withdrawn(lines: readonly string[], ids: ReadonlySet<ReadingId>): string[] {
  const off = new Set([...ids].map((id) => `on(${JSON.stringify(id)}).`));
  return lines.filter((l) => !off.has(l));
}

/**
 * O-3: the members an exception names against `list`, the universal or list term in one of `prior`'s roles: each named
 * individual (through a resume pronoun's antecedent) in the same role of a later reading whose `ul` / `um` points to `prior`.
 */
export function excepted(tr: Translator, prior: ReadingId, list: Term | ListTerm): string[] {
  const claim = tr.byId.get(prior)?.claim;
  if (!claim) return [];
  const roles = (["z", "d", "b"] as const).filter((r) => claim.roles[r] === list);
  const out: string[] = [];
  for (const r of tr.byId.values()) {
    if (!r.links.some((l) => l.key === "edge:hook" && l.to === prior && EXCEPT_HOOKS.has(l.values?.gloss ?? ""))) continue;
    for (const role of roles) {
      const t = r.claim.roles[role];
      for (const m of t?.kind === "list" ? t.members : t ? [t] : []) {
        const x = throughAntecedent(m);
        if (x.kind === "thing" && x.named) out.push(name(x.root));
      }
    }
  }
  return out;
}

// ── What the pool keeps ─────────────────────────────────────────────────────

/**
 * R4d-7 (in-clause-hooks.md#hook-resume): a point-back hook adds the extra-noun detail of the hook it resumes, with this
 * hook's vowels and that hook's ending, on the resumed landmark's own term, so *there* is the same place. The details
 * go in the claim's term and in the claim the pool keeps for it, so a question is matched against them too.
 */
export function resumedDetails(tr: Translator, claim: Claim, reading: Reading): Detail[] {
  // The reading's own claim, or a copy of it with one term put in (a denied verb, a list member).
  if (claim.details !== reading.claim.details) return [];
  return reading.links.flatMap((l) => {
    const own = l.kind === "hookResume" ? l.words[0] : undefined;
    const resumed = l.resumed?.words[0];
    if (!own || !resumed || !l.resumed?.hosted || own.family.kind !== "hook" || resumed.family.kind !== "hook") return [];
    tr.use(l);
    const form = own.family.form.slice(0, -1) + resumed.family.form.slice(-1);
    return [{ ...l.resumed, words: [{ ...resumed, raw: form, family: { kind: "hook", form } }], details: undefined, frames: undefined }];
  });
}

/**
 * The claim the pool keeps for a term, as its term was written, so a question is matched against what was claimed: with
 * R4d-7's resumed hook details, and R4d-8's backward stand-ins as the content they point to.
 */
export function pooled(tr: Translator, claim: Claim, reading: Reading): Claim {
  const resumed = resumedDetails(tr, claim, reading);
  const roles = { ...claim.roles };
  for (const r of ["z", "d", "b"] as const) {
    const t = roles[r];
    const back = t?.kind === "pronoun" ? reading.links.find((l) => l.kind === "standInBack" && l.words.includes(t.word) && l.to) : undefined;
    const content = back?.to ? tr.byId.get(back.to) : undefined;
    if (content && content !== reading) roles[r] = { kind: "clause", reading: content };
  }
  const changed = resumed.length > 0 || (["z", "d", "b"] as const).some((r) => roles[r] !== claim.roles[r]);
  return changed ? { ...claim, roles, details: [...claim.details, ...resumed] } : claim;
}

// ── Links in the claim path ─────────────────────────────────────────────────

/**
 * R4d-1, R4d-3 to R4d-5 (R4d decisions O-4, O-5): the links that add no term. Used: a sentence linker, topic word or
 * agenda number (`unit:linker`), a span topic (`body:topicMarker`), a tag (`slot:tag`; its phrase takes its own row),
 * a discourse hook that adds, rewords or returns (`edge:hook`, {@link KEPT_HOOKS}), and a polar word with no verdict
 * (`ua`, `oe`, `ae`, `ue`, or any polar word on a command or with no reading before it). R4d-2: `ao` / `uo` on any
 * ending (`-r` too, O-4) on a yes / no question or a statement is a verdict on that reading's claim; on a fill question,
 * or a reading with a frame or a list, it stays unused. O-1: *therefore* (`xahom`, gloss `therefore`) names the reading its `cause` starts from.
 */
export function talkOf(tr: Translator, reading: Reading): Talk {
  const out: Talk = { used: [] };
  for (const l of reading.links) {
    if (l.key === "unit:linker" || l.key === "body:topicMarker" || l.key === "slot:tag") {
      out.used.push(l);
      if (l.key === "unit:linker" && l.values?.gloss === "therefore" && l.to) out.therefore = l.to;
    } else if (l.key === "edge:hook" && l.kind === "discourse" && (KEPT_HOOKS.has(l.values?.gloss ?? "") || pointBack(l, out))) out.used.push(l);
    else if (l.key === "edge:polar") {
      const series = l.values?.series;
      if (!series) continue;
      const to = l.to ? tr.byId.get(l.to) : undefined;
      const force = to?.frames.find((f) => f.key === "edge:force");
      const command = force?.values.series === "o" || force?.values.series === "u";
      if (["ua", "oe", "ae", "ue"].includes(series) || ((series === "ao" || series === "uo") && (!to || command))) out.used.push(l);
      else if ((series === "ao" || series === "uo") && to && answerable(to)) {
        out.used.push(l);
        out.answer = { to, sign: series === "ao" ? 1 : -1 };
      }
    }
  }
  return out;
}

/**
 * R4d-2: a verdict takes the claim T of the reading it answers, written at that reading's sites (so its `zawan` stays
 * the one answering): `holds(T) :- on(Id).` for `ao`, row 2's `holds(neg(T)) :- on(Id).` for `uo`. A first mention in
 * T takes the answer's own constants under `ao` (row 14; its witness lines are the answer's) and its kind under `uo`.
 * R4d decision O-1: `xahom` between two plain claims adds row 10's `holds(cause(Prior, Next)) :- on(Id).`
 */
export function talkRules(tr: Translator, reading: Reading, talk: Talk, out: string[]): void {
  if (talk.withdraws) tr.withdrawn.add(talk.withdraws);
  if (talk.answer) {
    const { to, sign } = talk.answer;
    if (sign > 0) for (const f of to.frames) if (f.key === "slot:newMember" && f.hosted) tr.newMembers.add(f.hosted);
    const had = tr.witnesses.get(to.id);
    const ctx: Ctx = { reading: to, id: str(reading.id), subst: new Map(), asserted: sign > 0, out };
    const t = tr.claim(to.claim, ctx);
    tr.rule(ctx, sign > 0 ? t : `neg(${t})`, []);
    poolClaim(tr, reading, t, to.claim, sign);
    const lines = tr.witnesses.get(to.id);
    if (!had && lines) {
      tr.witnesses.delete(to.id);
      tr.witnesses.set(reading.id, new Set([...(tr.witnesses.get(reading.id) ?? []), ...lines]));
    }
  }
  const prior = talk.therefore ? tr.plainTerms.get(talk.therefore) : undefined;
  const next = tr.plainTerms.get(reading.id);
  if (prior && next) tr.rule({ reading, id: str(reading.id), subst: new Map(), asserted: true, out }, `cause(${prior},${next})`, []);
}
