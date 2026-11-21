/** Translator say words and holders (docs/meta/solver.md): the wrap a say word, a holder or a zone puts on a claim, as functions taking the translator. */
import { CLOSED, namedEnglish } from "../closed-roots.js";
import { isGenericPronoun, isTopicPronoun } from "../parse/resolve.js";
import { throughAntecedent } from "./steps.js";
import type { Frame, Reading, Term } from "./types.js";
import { wrapText, type Ctx, type Frames, type Why, type Wrap } from "./translate-types.js";
import { CONDITIONAL, ZONE_INTENTIONS, claimTerms, isEmptyClaim, isOrList, name, str, termFrames } from "./translate-helpers.js";
import { condition, nounCondition } from "./translate-conditions.js";
import { readingParts, type Translator } from "./translate.js";

// ── Say words and wraps ─────────────────────────────────────────────────────

/**
 * R4a-12 (D1): a say word over a hinge, *because*, MAY or a contrary zone: `holds(say(W, P, R, A, E, D)) :- on(Id).` with
 * `D` the wrapped content as one term, `if(C, O)`, `onlyif(C, O)`, `iff(C, O)`, `because(C, O)`, `may(T)` or
 * `against(T, Z)`. Nothing else: no part holds, no MAY choice, no hinge rule.
 */
export function sayData(tr: Translator, reading: Reading, frames: Frames, inner: Frame): void {
  const combination = { construction: "frameCombination", reason: "noRow" };
  if (frames.holder || frames.mayHost || frames.likely || frames.restrictor || frames.universal || reading.stanceLists?.length) return tr.leave(reading, combination);
  if (reading.links.some((l) => l.kind === "carriedFrame" && l.key === "carry:holder")) return tr.leave(reading, combination);
  if (claimTerms(reading.claim).some((t) => t.kind === "list" || termFrames(t).length)) return tr.leave(reading, combination);
  const out: string[] = [];
  const ctx: Ctx = { reading, id: str(reading.id), subst: new Map(), asserted: false, out };
  const say = sayWrap(tr, reading, frames.say!, ctx);
  if ("reason" in say) return tr.leave(reading, say);
  const bad = { construction: inner.construction, key: inner.key, reason: "noRow" };
  const t = tr.claim(reading.claim, ctx);
  let d: string;
  if (inner === frames.hinge || inner === frames.because) {
    const gloss = inner.values.gloss ?? "";
    const fn = inner === frames.because ? (gloss === "because" ? "because" : undefined) : CONDITIONAL[gloss];
    const noun = nounCondition(tr, inner);
    const cond = noun ? undefined : condition(tr, reading, inner);
    if (!fn || (!noun && (!cond || cond.frames.some((f) => f.key !== "slot:newMember") || tr.unrowed(cond) || claimTerms(cond.claim).some((x) => termFrames(x).length || isOrList(x))))) return tr.leave(reading, bad);
    d = `${fn}(${noun?.text ?? tr.claim(cond!.claim, { ...ctx, reading: cond! })},${t})`;
    tr.use(inner);
  } else if (inner === frames.may) {
    d = `may(${t})`;
    tr.use(inner);
  } else {
    const zone = zoneOf(tr, reading, inner, ctx);
    if ("reason" in zone) return tr.leave(reading, zone);
    d = `against(${t},${zone.term})`;
  }
  tr.rule(ctx, wrapText(say, d), []);
  for (const v of tr.visited) tr.use(...v.frames.filter((f) => f.key === "slot:newMember"));
  const parts = tr.visited.flatMap((v) => readingParts(v, v === reading));
  const unused = parts.filter((p) => !tr.used.has(p.of));
  if (unused.length) return tr.leave(reading, { construction: unused[0]!.key, key: unused[0]!.key, reason: "unused", unused: unused.map((p) => p.text) });
  tr.accounting.set(reading.id, { parts, used: tr.used });
  tr.wraps.set(reading.id, say);
  if (inner === frames.may) tr.notes.push({ reading: reading.id, frame: inner });
  tr.readings.push(reading.id);
  tr.lines.push(`% ${reading.id}`, `on(${ctx.id}).`, ...out);
}

/**
 * R4c decision 6 (evidentiality.md#evidence-clause): a reasoned channel's grounds after `blarl`, a plain clause with
 * no list, claimed as row 1, with the data `grounds(E, C)` (kept apart from `cause`). Checked before the claim is
 * written; the caller writes it. A `bl-` source noun is no grounds: it stays in the notes. Why it has no row: another source, a frame or a list in the grounds, or a list in the
 * claim.
 */
export function groundsOf(tr: Translator, reading: Reading, channel: Frame, ctx: Ctx): { text: string; reading: Reading } | Why {
  const bad = { construction: channel.construction, key: channel.key, reason: "noRow" };
  const hosted = channel.hosted;
  const link = hosted?.kind === "clause" ? reading.links.find((l) => l.kind === "standIn" && l.to === hosted.reading.id) : undefined;
  if (hosted?.kind !== "clause") return bad;
  if (!link || link.words.map((w) => w.raw).join(" ") !== "blarl" || isEmptyClaim(reading.claim)) return bad;
  if (claimTerms(reading.claim).some((t) => t.kind === "list")) return bad;
  const cond = hosted.reading;
  if (cond.frames.some((f) => f.key !== "slot:newMember") || tr.unrowed(cond) || cond.stanceLists?.length || claimTerms(cond.claim).some((t) => t.kind === "list" || termFrames(t).length)) return bad;
  condition(tr, reading, channel);
  return { text: tr.claim(cond.claim, { ...ctx, reading: cond, asserted: false }), reading: cond };
}

/**
 * R2-1 rows 1 to 4: the wrap a holder, a carried holder, or a say word puts on the reading's claim, with its facts
 * (the channel as `via(Id, Channel)`, a first-mention holder's kind) into `ctx.out`. Undefined when it has none.
 */
export function wrapOf(tr: Translator, reading: Reading, frames: Frames, ctx: Ctx): Wrap | Why | undefined {
  // R4a-13: a holder over a say word, stated or carried, nests both wraps, `view(H, say(..))`.
  const inner = frames.say ? sayWrap(tr, reading, frames.say, ctx) : undefined;
  if (inner && "reason" in inner) return inner;
  let holder: string | undefined;
  let channel: Frame | undefined;
  if (frames.holder) {
    if (!frames.channel && !frames.mayHost) return { construction: frames.holder.construction, key: frames.holder.key, reason: "noRow" };
    holder = holderOf(tr, frames.holder, ctx);
    if (!holder) return { construction: frames.holder.construction, key: frames.holder.key, reason: "noRow" };
    tr.use(frames.holder);
    channel = frames.channel;
  } else {
    // Row 2: a carried holder takes the holder of the reading it links to.
    const carried = reading.links.find((l) => l.kind === "carriedFrame" && l.key === "carry:holder");
    if (!carried) return inner;
    const from = carried.to ? tr.wraps.get(carried.to) : undefined;
    if (from?.kind !== "view") return { construction: carried.key, key: carried.key, reason: "noRow" };
    holder = from.holder;
    tr.use(carried);
    const link = reading.links.find((l) => l.kind === "carriedFrame" && l.key === "carry:channel");
    channel = link?.frame;
    if (channel?.values.gloss) tr.use(link);
  }
  const gloss = channel?.values.gloss;
  if (gloss) {
    tr.rule(ctx, `via(${ctx.id},${name(gloss.toLowerCase())})`, [], "via");
    tr.use(channel);
  }
  return { kind: "view", holder, ...(inner?.kind === "say" ? { say: inner } : {}) };
}

/** Row 4 (permission-consent.md#say-words, #permission, #consent, #say-reach): a say word's wrap, or why it has none. */
export function sayWrap(tr: Translator, reading: Reading, say: Frame, ctx: Ctx): Wrap | Why {
  const { reach = "", part = "", answer = "", ending = "" } = say.values;
  const v = { reach, part, answer, ending };
  const bad = { construction: say.construction, key: say.key, reason: "noRow" };
  if (![v.reach, v.part, v.answer, v.ending].every((x) => x && /^[a-z]+$/.test(x))) return bad;
  const hosted = say.hosted ? tr.term(say.hosted, "bl", { ...ctx, asserted: false }) : undefined;
  let who: string | undefined;
  let to: string | undefined;
  if (v.part === "v") who = hosted ?? (v.ending === "m" ? tr.speaker(reading) : v.ending === "l" ? "rules" : v.ending === "r" ? "unsaid" : undefined);
  else if (v.part === "z" || v.part === "d" || v.part === "b") {
    const filler = reading.claim.roles[v.part];
    const fence = reading.frames.find((f) => f.key === "joinSeries:ua" || f.key === "joinSeries:u:kind")?.hosted;
    who = filler && filler === fence ? "X" : filler ? tr.term(filler, v.part, { ...ctx, asserted: false }) : undefined;
    if (hosted) to = v.reach.includes("e") ? `to(${hosted})` : undefined;
    if (hosted && !to) return bad;
  }
  if (!who) return bad;
  tr.use(say);
  return { kind: "say", who, part: v.part, reach: v.reach, answer: v.answer, ending: v.ending, to };
}

/**
 * R2-1 row 9, R2-11 (contrary-to.md#contrary-to-stance): the zone after `uom`, `plan(H)` or `say(Who, Part, Reach,
 * Answer, Ending[, to(X)])` with the say word's wrap. A plan with no holder is the turn speaker's. R4b decision 3: a
 * want or a decision is `want(H)` / `decision(H)`, as a plan. R4a-6, R4b-10, R4b-11 (contrary-to.md#contrary-to-holder,
 * #channel-zone): a holder after `uom` names `H` (Holders row 3), on its channel alone `channel(Gloss, H)`; a channel
 * with no holder is the turn speaker's. The holder's own channel before an intention is used with no term.
 */
export function zoneOf(tr: Translator, reading: Reading, frame: Frame, ctx: Ctx): { term: string; say?: Extract<Wrap, { kind: "say" }> } | Why {
  const bad = { construction: frame.construction, key: frame.key, reason: "noRow" };
  const inner = frame.inner ?? [];
  const holder = inner[0]?.key === "xFamily:holder" ? inner[0] : undefined;
  const rest = holder ? inner.slice(1) : inner;
  if (rest.length > 1 || (!holder && !rest.length)) return bad;
  const f = rest[0];
  const host = holder?.inner?.length === 1 && holder.inner[0]!.key === "overlay:evidential:th" ? holder.inner[0] : undefined;
  const intention = f ? ZONE_INTENTIONS[f.key] : undefined;
  const channel = f ? (f.key === "overlay:evidential:th" && !f.holderHost ? f : undefined) : host;
  const gloss = intention ? undefined : channel?.values.gloss;
  if (holder && (!host || !(intention || (!f && gloss)))) return bad;
  if (intention || gloss) {
    const who = holder ? holderOf(tr, holder, { ...ctx, choice: false }) : tr.speaker(reading);
    if (!who) return bad;
    tr.use(frame, f, holder, host);
    return { term: intention ? `${intention}(${who})` : `channel(${name(gloss!.toLowerCase())},${who})` };
  }
  if (!f || f.key !== "wordFamily:say") return bad;
  const say = sayWrap(tr, reading, f, ctx);
  if ("reason" in say || say.kind !== "say") return bad;
  tr.use(frame);
  return { term: `say(${say.who},${say.part},${say.reach},${say.answer},${say.ending}${say.to ? `,${say.to}` : ""})`, say };
}

/**
 * Row 3, who the holder is (holder.md#naming-a-holder): a name is its root id, `-r` its antecedent's; a kind of person
 * is a first-mention noun, `nm(Id, h)` with its kind; R2-4: `-x` is `grp(H)`; R4a-7: the interlocutors are the turn's `we(..)` term; the generic
 * pronoun is its own holder. R4a-4: the topic pronoun and a `-r` holder resume their antecedent through the
 * anaphor link, which the holder uses, as {@link resume} does in a role (a first mention keeps its constant; a `-r`
 * holder with no antecedent is the name it spells). R4a-5: the listener is the listener term, as `zawan` is in a role.
 * Undefined for a holder with no row: a topic pronoun with no topic, and the speaker.
 */
export function holderOf(tr: Translator, frame: Frame, ctx: Ctx): string | undefined {
  if (!frame.party) return undefined;
  tr.resume(frame.party, ctx);
  const through = throughAntecedent(frame.party);
  const own = frame.party.kind === "pronoun" && through.kind === "pronoun" ? frame.party.word : undefined;
  const party: Term = own && own.ending === "r" && own.family.kind === "x" ? { kind: "thing", head: own, root: own.family.rightRoots!.join(""), named: true, details: [] } : through;
  if (party.kind === "listener") {
    const text = tr.term(party, "h", ctx);
    tr.holders.set(text, "your");
    return text;
  }
  if (party.kind !== "thing") return undefined;
  const known = tr.consts.get(party);
  if (known) {
    tr.holders.set(known, "someone's");
    return known;
  }
  const word = party.head;
  if (isTopicPronoun(word) || party.root === CLOSED.microphone || party.root === CLOSED.headphones) return undefined;
  let text: string;
  let english: string;
  if (isGenericPronoun(word)) [text, english] = ["generic", "the generic"];
  else if (party.root === CLOSED.handshake && party.named) [text, english] = [tr.we(ctx.reading), "our"];
  else if (party.named) [text, english] = [name(party.root), `${namedEnglish(party.root)}'s`];
  else {
    text = `nm(${ctx.id},h)`;
    english = word.plural ? "some people's" : "someone's";
    tr.kinds.set(name(party.root), party);
    tr.witness(ctx, `isa(${text},${name(party.root)})`);
    tr.holders.set(text, english);
    return text;
  }
  if (word.plural) [text, english] = [`grp(${text})`, english.replace(/'s$/, " and co.'s")];
  tr.holders.set(text, english);
  return text;
}
