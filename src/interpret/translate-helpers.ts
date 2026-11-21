/** Translator atoms, ranges and claim helpers (docs/meta/solver.md): the pure functions the Translator calls. */
import type { LexWord } from "../parse/types.js";
import { type ListTerm } from "./steps.js";
import type { Claim, Detail, Frame, Reading, Term } from "./types.js";
import { compareValues, detailNumber, wordStem, wordValue, type NumberValue } from "./value.js";
import { type Conditional, type Ctx, type Frames, type Literal, type Why, type Wrap } from "./translate-types.js";

// ── Atoms ───────────────────────────────────────────────────────────────────

/** Function names the encoding uses; a root with one of these names is written through `act/N`. */
export const RESERVED = new Set([
  "holds", "neg", "isa", "be", "on", "fired", "used", "fits", "clash", "member", "head", "switch", "candidate", "nm", "ls",
  "z", "d", "b", "g", "w", "dt", "v", "pct", "pts", "rk", "rke", "cd", "inf", "ninf", "rng", "count", "detail", "within",
  "less", "same", "always", "never", "notall", "none", "more", "c", "o", "i", "act", "lit", "pro", "cl", "quote", "speaker",
  "listener", "blank", "not", "view", "say", "via", "to", "grp", "sp", "rules", "unsaid", "interlocutors", "generic", "against",
  "requires", "may", "maybe", "some", "noneof", "notone", "likely", "bans", "cause", "fault", "share", "plan", "channel",
  "if", "onlyif", "iff", "we", "every", "because", "want", "decision", "grounds", "place",
]);

/** R4b decision 3: the intention adverbs after `uom` and their zone terms (contrary-to.md#contrary-to-stance). */
export const ZONE_INTENTIONS: Record<string, string> = { "overlay:plan:th": "plan", "overlay:want:th": "want", "overlay:decision:th": "decision" };

export const str = (s: string): string => JSON.stringify(s);
export const name = (s: string): string => (/^[a-z][a-z0-9_]*$/.test(s) && !RESERVED.has(s) ? s : str(s));
export const raws = (words: readonly { raw: string }[]): string => words.map((w) => w.raw).join(" ");

export function numberText(n: number): string {
  return Number.isInteger(n) && Math.abs(n) < 2 ** 30 ? String(n) : str(String(n));
}

/** A number word: its value as a term, `inf` / `ninf` for a ray's end, or the word itself when it has no value. */
export function valueTerm(word: LexWord): string {
  const value = wordValue(word);
  if (value) return valueText(value);
  const end = infinity(word);
  if (end) return end > 0 ? "inf" : "ninf";
  return `w(${str(word.raw)})`;
}

export function valueText(value: NumberValue): string {
  if (value.kind === "scalar") return `${value.percent === "percent" ? "pct" : value.percent === "points" ? "pts" : "v"}(${numberText(value.value)})`;
  if (value.kind === "rank") return `${value.fromEnd ? "rke" : "rk"}(${value.ranks.map(numberText).join(",")})`;
  return `cd(${value.fields.map(str).join(",")})`;
}

/** ±∞, a ray's open end (open-ranges.md#rays): a digitless `e` on an amount marker. */
export function infinity(word: LexWord): 1 | -1 | undefined {
  const stem = wordStem(word);
  if (!stem || stem.groups.length || stem.digitlessExp !== "e") return undefined;
  if (stem.marker === "+" || stem.marker === "ra") return 1;
  if (stem.marker === "-" || stem.marker === "ru") return -1;
  return undefined;
}

// ── Ranges ──────────────────────────────────────────────────────────────────

/** A stated range on a counted noun (ranges.md#number-ranges, open-ranges.md#rays): its ends in the order said, and its hook. */
export type Range = { first: End; second: End; hook: string };
export type End = { value?: NumberValue; infinite?: 1 | -1 };

/** The range a number detail carries in its nested `range` detail (R1-7): the ends as said, the range, and its term. */
export function detailRange(detail: Detail): { ends: [LexWord, LexWord]; range: Range; text: string } | undefined {
  const first = detailNumber(detail);
  const span = detail.details?.find((d) => d.kind === "range");
  const second = span?.hosted?.kind === "number" ? span.hosted.word : undefined;
  if (!first || !span || !second || span.words.length !== 1) return undefined;
  const hook = span.words[0]!.raw;
  const end = (w: LexWord): End => ({ value: wordValue(w), infinite: infinity(w) });
  return { ends: [first, second], range: { first: end(first), second: end(second), hook }, text: `rng(${valueTerm(first)},${valueTerm(second)},${name(hook)})` };
}

/** Where a value sits against one end: negative below, zero at, positive above; undefined when they do not order. */
export function against(value: NumberValue, end: End): number | undefined {
  if (end.infinite) return -end.infinite;
  return end.value ? compareValues(value, end.value) : undefined;
}

/**
 * Whether a value lies in a range (ranges.md#ranges): `oel` / `aol` keep both ends, `uel` leaves out the end said second,
 * `uol` both ends, `ual` keeps only what lies outside. A fuzzy or question ending reads as its hook. Undefined when an end
 * has no value or the kinds do not order. A question's fit to a `within` fact is decided here too.
 */
export function inRange(value: NumberValue, range: Range): boolean | undefined {
  const hook = range.hook.replace(/[lmr]$/, "");
  if (!["oe", "ao", "ue", "uo", "ua"].includes(hook)) return undefined;
  const { first, second } = range;
  // An end with no value (`growal`, open-ranges.md) does not order.
  const ends = first.infinite ? first.infinite : second.infinite ? -second.infinite : first.value && second.value ? compareValues(first.value, second.value) : undefined;
  const a = against(value, first);
  const b = against(value, second);
  if (ends === undefined || a === undefined || b === undefined) return undefined;
  const firstIn = hook !== "uo";
  const secondIn = hook === "oe" || hook === "ao" || hook === "ua";
  const [lo, loIn, hi, hiIn] = ends <= 0 ? [a, firstIn, b, secondIn] : [b, secondIn, a, firstIn];
  const between = (lo > 0 || (lo === 0 && loIn)) && (hi < 0 || (hi === 0 && hiIn));
  return hook === "ua" ? !between : between;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

/** R3-1 row 8: an *or* list with a row: `e` or `ae`, ending `-l` or `-m`. */
export function orRow(list: ListTerm): boolean {
  const { series, ending } = list.values;
  return (series === "e" || series === "ae") && (ending === "l" || ending === "m");
}

/** Item k held: a claim that says at least the item (row 4's join). */
export function held(items: readonly { slot: string }[], k: number, w: (t: string) => string = (t) => t): Literal[] {
  return [{ atom: `fits(${items[k]!.slot},P${k + 1})` }, { atom: `holds(${w(`P${k + 1}`)})`, premise: w(`P${k + 1}`) }];
}

/** R4a-2: a holder's own view, with no MAY and no say word inside it, where the holder's rules run as stated. */
export function plainView(wrap: Wrap): boolean {
  return wrap.kind === "view" && !wrap.may && !wrap.say;
}

/** Item j denied: a denial the item says at least (row 6's join). */
export function denied(items: readonly { slot: string }[], j: number, w: (t: string) => string = (t) => t): Literal[] {
  return [{ atom: `fits(N${j + 1},${items[j]!.slot})` }, { atom: `holds(${w(`neg(N${j + 1})`)})`, premise: w(`neg(N${j + 1})`) }];
}

/** A claim with no role, predicate, verb, detail or clause (a call alone, `yazozon.`). */
/**
 * R4d-2: a reading a verdict can answer: a statement or a yes / no question with no frame but its act word and first
 * mentions, and a claim with no list, blank, clause or quote.
 */
export function answerable(reading: Reading): boolean {
  const force = reading.frames.find((f) => f.key === "edge:force");
  if (force && !(force.values.series === "a" || force.values.ask === "yesNo")) return false;
  if (reading.unread.length || reading.claim.clauses || isEmptyClaim(reading.claim)) return false;
  if (!reading.frames.every((f) => f.key === "edge:force" || f.key === "slot:newMember" || f.key === "edge:vocative")) return false;
  return !claimTerms(reading.claim).some((t) => t.kind === "list" || t.kind === "blank" || t.kind === "clause" || t.kind === "quote");
}

export function isEmptyClaim(claim: Claim): boolean {
  return !claim.verb && !claim.predicate.length && !Object.keys(claim.roles).length && !claim.details.length && !claim.clauses;
}

/** Does frame `a` cover frame `b`? */
export function over(reading: Reading, a: Frame, b: Frame): boolean {
  return reading.order.some((o) => o.over === a && o.under === b);
}

/** R3-1 row 3: the MAY frame a `thul` stance list denies (`thomam thul`), when that is the reading's one stance list. */
export function mayDenied(reading: Reading): Frame | undefined {
  const lists = reading.stanceLists ?? [];
  const only = lists.length === 1 ? lists[0]! : undefined;
  const member = only?.key === "joinSeries:u" && only.values.ending === "l" && !only.details?.length && only.members.length === 1 ? only.members[0] : undefined;
  return member && !("kind" in member && member.kind === "stanceList") && (member as Frame).key === "overlay:may:th" ? (member as Frame) : undefined;
}

/** R2-1 row 6: the *because* hinge a `thul` stance list denies (*not because*), when that is the reading's one stance list. */
export function becauseDenied(reading: Reading): Frame | undefined {
  const lists = reading.stanceLists ?? [];
  const only = lists.length === 1 ? lists[0]! : undefined;
  const member = only?.key === "joinSeries:u" && only.values.ending === "l" && !only.details?.length && only.members.length === 1 ? only.members[0] : undefined;
  if (!member || ("kind" in member && member.kind === "stanceList")) return undefined;
  const f = member as Frame;
  return HINGE_KEYS.has(f.key) && /^because(\.|$)/.test(f.values.gloss ?? "") ? f : undefined;
}

/** R4e-3: the condition hinge a `thul` stance list denies (`thohem thul blarl`), when that is the reading's one stance list. */
export function hingeDenied(reading: Reading): Frame | undefined {
  const lists = reading.stanceLists ?? [];
  const only = lists.length === 1 ? lists[0]! : undefined;
  const member = only?.key === "joinSeries:u" && only.values.ending === "l" && !only.details?.length && only.members.length === 1 ? only.members[0] : undefined;
  if (!member || ("kind" in member && member.kind === "stanceList")) return undefined;
  const f = member as Frame;
  return HINGE_KEYS.has(f.key) && CONDITIONAL[f.values.gloss ?? ""] ? f : undefined;
}

/**
 * R4e-7: a `/ɡ/` hinge on a common noun with no verb (`zerulal gohem blugalal.`): the outcome noun, the hinge's detail
 * and frame, and its `bl-` noun. Undefined for any other shape, or when the reading has any other frame or part.
 */
export type NounHinge = { outcome: Extract<Term, { kind: "thing" }>; detail: Detail; frame: Frame; cond: Extract<Term, { kind: "thing" }>; stack?: { detail: Detail; frame: Frame } };
export function nounHinge(reading: Reading): NounHinge | undefined {
  const c = reading.claim;
  const z = c.roles.z;
  const pred = c.predicate[0];
  if (c.verb || c.roles.d || c.roles.b || c.details.length || c.clauses || z?.kind !== "thing") return undefined;
  if (reading.unread.length || reading.stanceLists?.length || reading.frames.some((f) => f.key !== "slot:newMember")) return undefined;
  if (!c.predicate.length) return stackedNounHinge(z);
  if (c.predicate.length !== 1 || pred?.kind !== "thing") return undefined;
  const detail = pred.details.length === 1 ? pred.details[0]! : undefined;
  const frame = detail?.frames?.length === 1 ? detail.frames[0]! : undefined;
  const cond = detail?.hosted;
  if (!detail || !frame || detail.key !== "overlay:clause_hinge:g" || frame.key !== detail.key || detail.content?.length || cond?.kind !== "thing") return undefined;
  if (z.named || z.details.length || cond.named || cond.details.length) return undefined;
  return { outcome: z, detail, frame, cond };
}

/**
 * R4b-3 (because-and-iff.md#choosing-a-hinge): *only because* on a noun, `zerulal gebem gahum blugalal.`: the outcome
 * noun's two details, `gebem` then `gahum`, sharing one `hosted` noun (the reader's stacked hinge).
 */
export function stackedNounHinge(z: Extract<Term, { kind: "thing" }>): NounHinge | undefined {
  const [needs, fact] = z.details;
  const hinge = (d: Detail | undefined, gloss: string): Frame | undefined =>
    d?.key === "overlay:clause_hinge:g" && d.values.gloss === gloss && d.frames?.length === 1 && d.frames[0]!.key === d.key && !d.content?.length ? d.frames[0] : undefined;
  if (z.details.length !== 2 || z.named || !needs || !fact) return undefined;
  const needsFrame = hinge(needs, "only-if");
  const frame = hinge(fact, "because");
  const cond = fact.hosted;
  if (!needsFrame || !frame || cond?.kind !== "thing" || needs.hosted !== cond || cond.named || cond.details.length) return undefined;
  return { outcome: { ...z, details: [] }, detail: fact, frame, cond, stack: { detail: needs, frame: needsFrame } };
}

/** A join word's series and ending. */
/**
 * R4c-8 (D8): the channel on your own claim (no holder) and any stance numbers beside it (`th_N`, `th#N`, `th@+95`,
 * `th-e-`), when they are the reading's only frames; undefined otherwise.
 */
export function ownChannel(reading: Reading): { channel: Frame; frames: Set<Frame> } | undefined {
  if (reading.frames.some((f) => f.key === "xFamily:holder")) return undefined;
  const channels = reading.frames.filter((f) => f.key === "overlay:evidential:th" && !f.holderHost);
  const channel = channels[0];
  if (channels.length !== 1 || !channel || channel.inner?.length) return undefined;
  const rest = reading.frames.filter((f) => f !== channel && f.key !== "slot:newMember" && f.key !== "edge:vocative");
  if (!rest.every((f) => f.key === "lexReading:number:th" && !f.inner?.length)) return undefined;
  return { channel, frames: new Set([channel, ...rest]) };
}

/**
 * R4c decision 5: a verbless claim whose one role is a list with a join frame (`zobudal zuel.`, `zobonol zabewol zen.`).
 * B6b: a table fragment, a verbless reading with no link that points anywhere: a stand-in with nothing after it
 * (`herom blarl`, `huxal blarl`, `ul barl`), a discourse hook alone (`ul ul`), or a point-back hook with no verb to follow
 * (`zarx ar`). No row can use a link that reaches nothing.
 */
export function fragment(reading: Reading): Why | undefined {
  const c = reading.claim;
  if (c.verb || c.predicate.length || c.roles.d || c.roles.b || c.clauses) return undefined;
  const dangling = reading.links.some((l) => l.to) ? undefined : reading.links.find((l) => l.kind === "standIn" || l.kind === "hookResume" || (l.key === "edge:hook" && !c.roles.z && !c.details.length));
  if (dangling) return { construction: "fragment", key: dangling.key, reason: "fragment" };
  if (c.details.length) return undefined;
  const f = c.roles.z?.kind === "list" ? termFrames(c.roles.z).find((x) => x.key.startsWith("joinSeries:") && x.key !== "joinSeries:u") : undefined;
  return f ? { construction: "fragment", key: f.key, reason: "fragment" } : undefined;
}

/** No frame on the reading but the ones every row reads, no wrap and no denial: the shape the list rows R1-8 and R4c take. */
export function bareFrames(frames: Frames, ctx: Ctx): boolean {
  return !ctx.deny && !ctx.wrap && Object.entries(frames).every(([k, v]) => (k === "standalone" ? !(v as Frame[]).length : !v));
}

export function joinOf(word: LexWord | undefined): { series: string; ending: string } | undefined {
  return word?.family.kind === "joinMarker" ? { series: word.family.series, ending: word.ending ?? "" } : undefined;
}

/** An *or* list (R3-1 row 8): one `e` or `ae` part, no frame on it. */
/** A list's SHARED `/ɡ/` adjectives that reach each member (`slot:adj`, role `distribute`), when every SHARED detail is one. */
export function sharedAdjectives(list: ListTerm): Detail[] | undefined {
  const shared = list.sharedDetails ?? [];
  return shared.length && shared.every((d) => d.key === "slot:adj" && d.values.role === "distribute" && !d.hosted && !d.details?.length) ? shared : undefined;
}

export function isOrList(term: Term): term is ListTerm {
  return term.kind === "list" && (term.values.series === "e" || term.values.series === "ae") && term.parts.length === 1 && !term.frames?.length && !term.bound;
}

export function termFrames(term: Term): Frame[] {
  return "frames" in term && term.frames ? term.frames : [];
}

export function termDetails(term: Term): Detail[] {
  return "details" in term && term.details ? term.details : [];
}

/** The claim's own terms: verb, roles, predicate, and (with `deep`) list members. */
export function claimTerms(claim: Claim, deep = true): Term[] {
  const top = [claim.verb, claim.roles.z, claim.roles.d, claim.roles.b, ...claim.predicate].filter((t): t is Term => t !== undefined);
  if (!deep) return top;
  const out: Term[] = [];
  const visit = (t: Term): void => {
    out.push(t);
    if (t.kind === "list") t.members.forEach(visit);
  };
  top.forEach(visit);
  return out;
}

export function placeOf(claim: Claim, term: Term): string {
  if (claim.verb === term) return "v";
  for (const r of ["z", "d", "b"] as const) if (claim.roles[r] === term) return r;
  const i = claim.predicate.indexOf(term);
  return claim.predicate.length > 1 ? `g${i + 1}` : "g";
}

export function replaceTerm(claim: Claim, from: Term, to: Term): Claim {
  const swap = (t: Term | undefined): Term | undefined => (t === from ? to : t);
  const roles: Claim["roles"] = {};
  for (const r of ["z", "d", "b"] as const) if (claim.roles[r]) roles[r] = swap(claim.roles[r]);
  return { ...claim, verb: swap(claim.verb), roles, predicate: claim.predicate.map((p) => swap(p)!) };
}

export const HINGE_KEYS = new Set(["overlay:clause_hinge:th", "overlay:clause_hinge:g"]);
/** R4e-1: a condition hinge's gloss and its conditional term's name. */
export const CONDITIONAL: Record<string, Conditional["name"]> = { if: "if", "only-if": "onlyif", iff: "iff" };
