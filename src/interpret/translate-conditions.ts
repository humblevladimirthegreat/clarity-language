/** Translator conditions (docs/meta/solver.md): hinges, *because*, noun conditions, *or* lists and the fits pool, as functions taking the translator. */
import { throughAntecedent, type ListTerm } from "./steps.js";
import type { Claim, Frame, Reading, Term } from "./types.js";
import { wrapText, type Conditional, type Ctx, type Frames, type Literal, type MayOver, type Why } from "./translate-types.js";
import { CONDITIONAL, becauseDenied, claimTerms, denied, held, hingeDenied, isOrList, name, orRow, plainView, str, termFrames, type NounHinge } from "./translate-helpers.js";
import { pooled } from "./translate-links.js";
import { wrapOf } from "./translate-say.js";
import { readingParts, type Translator } from "./translate.js";

/**
 * A hinge's condition: its hosted clause, the sentence a backward stand-in (`blarth`, stand-in-vowels.md#stand-in-back)
 * resumes, or the next sentence (`grounds`). A noun condition (`gahum blugalal`) has none, so it has no row here yet.
 */
export function condition(tr: Translator, reading: Reading, frame: Frame): Reading | undefined {
  const hosted = frame.hosted && throughAntecedent(frame.hosted);
  const back = hosted?.kind === "pronoun" ? reading.links.find((l) => l.kind === "standInBack" && l.words.includes(hosted.word))?.to : undefined;
  const cond = hosted?.kind === "clause" ? hosted.reading : back ? tr.byId.get(back) : frame.content?.[0];
  if (cond) {
    for (const l of reading.links) if ((l.kind === "standIn" || l.kind === "standInBack" || l.kind === "grounds") && (l.to === cond.id || l.frame === frame)) tr.use(l);
    if (!tr.visited.includes(cond)) tr.visited.push(cond);
  }
  return cond;
}

/**
 * R2-1 rows 5 to 8, R2-10 (because-and-iff.md#choosing-a-hinge, fault.md#fault, verb-and-stance-joins.md#stance-joins):
 * *because* claims its outcome, its condition, and the link `cause(C, O)`; `-l` adds `fault(C, O)` and `-r`
 * `share(C, O)`. *Not because* (`thul` on the hinge) claims the outcome and denies the link, leaving the condition
 * unstated. *Only because* (`thebem` over `thahum`) adds row 6 on the same condition. On a closed universal each rule
 * takes row 8's body, as a hinge does.
 *
 * R4b-2: inside a holder's view each term is wrapped. R4b-4 (D2): a condition with its own MAY, holder or say word is
 * that clause's own term, `may(T)` (with row 15's choice on T), `view(H, T)` or `say(.., T)`. R4b-5 (D3): MAY right
 * before the hinge gates only the link and its marker, and claims `may(cause(C, O))`. R4b-6 (D11): the hinge over MAY
 * makes the outcome a choice, `may(O)`, and links `cause(C, may(O))`. R4b-7 (D12): under `hual` every atom also takes
 * the marker `always(..)`; under `huam` one gate covers all three (held with `switch(defaults)`); an *or* list in the
 * condition or the outcome is row 20's choice per item, each item linked in the worlds where it holds.
 */
export function because(tr: Translator, reading: Reading, frames: Frames, claim: Claim, heads: { text: string; claim: Claim; sign: 1 | -1 }[], body: Literal[], ctx: Ctx, mayOver?: MayOver): true | Why {
  const frame = frames.because!;
  const bad = { construction: frame.construction, key: frame.key, reason: "noRow" };
  const gloss = frame.values.gloss;
  if (gloss !== "because" && gloss !== "because.fault" && gloss !== "because.share") return bad;
  const denied = !!becauseDenied(reading);
  const noun = nounCondition(tr, frame);
  // The hinge's hosted list keeps no parts of its own.
  const hosted = frame.hosted;
  const orCond = !noun && hosted?.kind === "list" && hosted.parts.length <= 1 && isOrList({ ...hosted, parts: [hosted.parts[0] ?? { members: hosted.members }] as ListTerm["parts"] }) ? hosted : undefined;
  const cond = noun || orCond ? undefined : condition(tr, reading, frame);
  const condFrames = cond?.frames.filter((f) => f.key !== "slot:newMember") ?? [];
  if (heads.length !== 1 || (!noun && !orCond && (!cond || tr.unrowed(cond) || claimTerms(cond.claim).some((t) => termFrames(t).length || isOrList(t))))) return bad;
  const orOut = claimTerms(heads[0]!.claim, false).find(isOrList);
  const restrictor = frames.restrictor?.values;
  const always = restrictor?.series === "ua" && restrictor.ending === "l";
  const often = restrictor?.series === "ua" && restrictor.ending === "m";
  if (frames.restrictor && (!(always || often) || frames.restrictor.occasions?.length || denied)) return bad;
  if ((orCond || orOut) && (!orRow((orCond ?? orOut)!) || denied || frames.hinge || frames.restrictor || mayOver || ctx.wrap || body.length)) return bad;
  if (mayOver && (denied || frames.hinge || body.length)) return bad;
  // R4b-4 (D2): the condition's own frame makes it that clause's own term.
  let condText: string;
  let condInner: string | undefined;
  if (condFrames.length) {
    if (denied || mayOver || frames.restrictor || frames.hinge || ctx.wrap || body.length || cond!.stanceLists?.length) return bad;
    const cf = tr.readingFrames(cond!);
    const own = [cf.may, cf.holder, cf.say].filter(Boolean).length;
    if (own !== 1 || cf.other || cf.hinge || cf.because || cf.universal || cf.restrictor || cf.zone || cf.likely || cf.mayHost || cf.standalone.length) return bad;
    condInner = tr.claim(cond!.claim, { ...ctx, reading: cond!, asserted: false });
    if (cf.may) {
      condText = `may(${condInner})`;
      tr.rule({ ...ctx, choice: true }, condInner, []);
    } else {
      const wrap = wrapOf(tr, cond!, cf, { ...ctx, reading: cond! });
      if (!wrap || "reason" in wrap) return bad;
      condText = wrapText(wrap, condInner);
    }
    tr.use(...condFrames);
  } else {
    condText = noun?.text ?? (orCond ? "" : tr.claim(cond!.claim, { ...ctx, reading: cond!, asserted: false }));
  }
  if (/\bX\b/.test(condText)) return bad;
  const h = heads[0]!;
  const out = h.sign < 0 ? `neg(${h.text})` : h.text;
  const w = (t: string): string => tr.w(ctx, t);
  const marker = (c: string, o: string): string | undefined => (gloss === "because.fault" ? `fault(${c},${o})` : gloss === "because.share" ? `share(${c},${o})` : undefined);
  tr.use(frame, frames.restrictor);
  if (denied) tr.useDenied(reading, becauseDenied(reading)!);

  // R4b-7: an *or* list in the condition or the outcome: row 20 on the list, the link per item where it holds.
  if (orCond || orOut) {
    const list = (orCond ?? orOut)!;
    const items = orCond
      ? orCond.members.map((m, i) => {
          if (m.kind !== "thing" || m.named || m.details.length) return undefined;
          const text = name(m.root);
          const slot = `i(${ctx.id},${i + 1})`;
          const mClaim: Claim = { roles: { z: m }, predicate: [], details: [] };
          tr.kinds.set(text, m);
          tr.slots.set(slot, { reading: reading.id, claim: mClaim });
          pool(tr, reading, text, mClaim, 1);
          return { text, slot };
        })
      : listItems(tr, reading, h.claim, list, ctx);
    if (items.some((it) => !it)) return bad;
    const its = items as { text: string; slot: string }[];
    orBounds(tr, list, its, ctx);
    tr.use(list);
    if (orCond) {
      pool(tr, reading, h.text, h.claim, h.sign);
      tr.rule(ctx, out, []);
    } else {
      pool(tr, cond ?? reading, condText, noun?.claim ?? cond!.claim, 1);
      tr.rule(ctx, condText, []);
    }
    for (const it of its) {
      const [c, o] = orCond ? [it.text, out] : [condText, it.text];
      const lit: Literal[] = [{ atom: `holds(${it.text})`, premise: it.text }];
      tr.rule(ctx, `cause(${c},${o})`, lit);
      const m = marker(c, o);
      if (m) tr.rule(ctx, m, lit);
    }
    return true;
  }

  pool(tr, cond ?? reading, condInner ?? condText, noun?.claim ?? cond!.claim, 1);
  if (!body.length) pool(tr, reading, h.text, h.claim, h.sign);
  if (mayOver === "outcome") {
    // R4b-6 (D11): a world cause of a possible outcome.
    const may = `may(${out})`;
    tr.rule(ctx, condText, []);
    tr.rule({ ...ctx, choice: true }, out, []);
    tr.rule(ctx, may, []);
    tr.rule(ctx, `cause(${condText},${may})`, []);
    const m = marker(condText, may);
    if (m) tr.rule(ctx, m, []);
    return true;
  }
  if (often) {
    // R4b-7 (D12): under `huam` the outcome, the condition and the link are one choice together.
    tr.rule(ctx, `maybe(${ctx.id})`, [], "gate");
    tr.rule(ctx, `maybe(${ctx.id})`, [{ atom: "switch(defaults)" }], "some");
    ctx.gate = `maybe(${ctx.id})`;
  }
  const link = `cause(${condText},${out})`;
  const atoms: string[] = [out];
  tr.rule(ctx, w(out), body);
  if (!denied) {
    tr.rule(ctx, w(condText), body);
    atoms.push(condText);
  }
  if (mayOver === "link") {
    // R4b-5 (D3): MAY right before the hinge hedges only the link; the outcome and the condition stay claimed.
    tr.rule(ctx, `may(${link})`, []);
    tr.rule(ctx, `maybe(${ctx.id})`, [], "gate");
    ctx.gate = `maybe(${ctx.id})`;
  }
  tr.rule(ctx, w(denied ? `neg(${link})` : link), body);
  if (!denied) atoms.push(link);
  const m = marker(condText, out);
  if (m) tr.rule(ctx, w(m), body);
  // R4b-7 (D12): under `hual` each atom also takes the marker `always(..)`.
  if (always) for (const a of atoms) tr.rule(ctx, a, body, "always");
  return frames.hinge ? hinge(tr, reading, frames.hinge, heads, body, ctx, undefined, true) : true;
}

/**
 * Rows 5–7 and R1-5: a condition hinge; neither its condition nor its outcome is claimed. R4e-1: the reading claims
 * the conditional, `if(c(Id), o(Id))`, `onlyif(..)` or `iff(..)` (`neg(o(Id))` for a denied outcome), and each rule
 * takes it in its body. R4e-3: a denied conditional (`thohem thul blarl`) claims `neg(T)` and runs no rule. A hinge on
 * a universal keeps its rules with no term. R4e-6: MAY over the hinge makes the term a choice; MAY on the condition or
 * under the hinge wraps that slot of the term in `may(..)`. R4b-1: a `bl-` noun
 * condition reads as its kind.
 */
export function hinge(tr: Translator, reading: Reading, frame: Frame, heads: { text: string; claim: Claim; sign: 1 | -1 }[], body: Literal[], ctx: Ctx, mayOver?: MayOver, because = false, zone?: { term: string; first: boolean }): true | Why {
  const bad = { construction: frame.construction, key: frame.key, reason: "noRow" };
  const noun = nounCondition(tr, frame);
  const cond = noun ? undefined : condition(tr, reading, frame);
  // R4e finding 1: a first mention in the condition is written as its kind (R1-3), so its frame is no bar.
  const condFrames = cond?.frames.filter((f) => f.key !== "slot:newMember") ?? [];
  // R3-5: MAY inside the condition makes the condition a chance (causation.md#if).
  const mayCond = condFrames.length === 1 && condFrames[0]!.key === "overlay:may:th" && !condFrames[0]!.holderHost;
  if (heads.length !== 1 || (!noun && (!cond || (condFrames.length && !mayCond) || tr.unrowed(cond) || claimTerms(cond.claim).some((t) => termFrames(t).length || isOrList(t))))) return bad;
  if (claimTerms(heads[0]!.claim, false).some(isOrList)) return bad;
  const gloss = frame.values.gloss ?? "";
  const termName = CONDITIONAL[gloss];
  if (!termName) return bad;
  // R4e-6: MAY first (`thomam … thohem blarl`) makes the conditional a choice; the hinge first (`blarth` over MAY) makes the
  // outcome possible.
  const mayGate = mayOver === "gate";
  const mayOutcome = mayOver === "outcome";
  // R4a-9: a hinge over a say word (`thohem blarth` first): the outcome is the say term, the condition your own claim.
  const sayOut = ctx.wrap?.kind === "say";
  if (sayOut && (mayCond || mayOutcome || mayGate || because)) return bad;
  const condClaim = noun?.claim ?? cond!.claim;
  const condSite = cond ?? reading;
  const universal = body.length > 0;
  const every = universal ? ctx.every : undefined;
  if (universal && !every) return bad;
  // R4b-16 (usually-vs-must.md#how-things-work): a resume pronoun in the condition whose antecedent the universal binds
  // is the member, `X`.
  const bound = every && cond ? claimTerms(cond.claim).filter((t) => t.kind === "pronoun" && boundBy(tr, t)) : [];
  const condSubst = new Map(ctx.subst);
  bound.forEach((t) => condSubst.set(t, { text: "X" }));
  const condText = noun?.text ?? tr.claim(cond!.claim, { ...ctx, reading: cond!, asserted: false, subst: condSubst });
  if (!bound.length && /\bX\b/.test(condText)) return bad;
  const denied = hingeDenied(reading) === frame;
  // A denied conditional on a universal (R4e open decision 2), with MAY, in a wrap or beside *because* has no row.
  // R4e-5: a holder's denied conditional is the holder's view, `view(H, neg(if(..)))`.
  if (denied && (universal || mayCond || mayOutcome || mayGate || (ctx.wrap && !plainView(ctx.wrap)) || because)) return bad;
  // R4b-15 (D14): a hinge over a zone marks the outcome its *if* rule gives; *only if* gives no outcome to mark. R4e
  // decision 3: a zone over a hinge marks the conditional, which needs its term.
  if (zone && (denied || universal || mayCond || mayOutcome || mayGate || sayOut || (!zone.first && gloss === "only-if"))) return bad;
  const h = heads[0]!;
  // R4b-16: on a universal the rules run over the member's slots, `c(Id, X)` / `o(Id, X)`, built per stated member.
  const c = universal ? `c(${ctx.id},X)` : `c(${ctx.id})`;
  const o = universal ? `o(${ctx.id},X)` : `o(${ctx.id})`;
  if (!universal) tr.slots.set(c, { reading: condSite.id, claim: condClaim });
  pool(tr, condSite, condText, condClaim, 1);
  // R2-5: inside a view, the holder's own rule runs on the holder's views.
  const w = (t: string): string => tr.w(ctx, t);
  // R4a-9: under a say word the condition is unwrapped, and the outcome's denial is the say term's (a ban's `neg(say(..))`).
  const wc = (t: string): string => (sayOut ? t : w(t));
  const wneg = (slot: string, n: string): string => (slot === o && sayOut ? `neg(${w(n)})` : slot === o ? w(`neg(${n})`) : wc(`neg(${n})`));
  const truth = (slot: string, n: string): Literal[] => [{ atom: `fits(${slot},${n})` }, { atom: `holds(${slot === o ? w(n) : wc(n)})`, premise: slot === o ? w(n) : wc(n) }];
  const falsity = (slot: string, n: string): Literal[] => [{ atom: `fits(${n},${slot})` }, { atom: `holds(${wneg(slot, n)})`, premise: wneg(slot, n) }];
  const out = w(h.sign < 0 ? `neg(${h.text})` : h.text);
  const notOut = sayOut && h.sign > 0 ? `neg(${w(h.text)})` : w(h.sign < 0 ? h.text : `neg(${h.text})`);
  const outTrue = (n: string): Literal[] => (h.sign < 0 ? falsity(o, n) : truth(o, n));
  const outFalse = (n: string): Literal[] => (h.sign < 0 ? truth(o, n) : falsity(o, n));
  if (!universal) {
    tr.slots.set(o, { reading: reading.id, claim: h.claim });
    pool(tr, reading, h.text, h.claim, 1);
  }
  // R4e-1: the conditional as a claim term over the reading's own slots. R4e-6: MAY on the condition is
  // `if(may(c(Id)), o(Id))`, MAY under the hinge `if(c(Id), may(o(Id)))`; MAY over the hinge keeps the plain term.
  // R4e decision 2 (c): on a universal, the template term over `c(Id)` / `o(Id)`, claimed once, gives a member term over
  // `c(Id, X)` / `o(Id, X)` for each member; the rules take the member term.
  const termed = !sayOut;
  const shape = (cs: string, os: string): string => {
    const oSlot = h.sign < 0 ? `neg(${os})` : os;
    return `${termName}(${mayCond ? `may(${cs})` : cs},${mayOutcome ? `may(${oSlot})` : oSlot})`;
  };
  const term = shape(`c(${ctx.id})`, `o(${ctx.id})`);
  const member = shape(c, o);
  const may: Conditional["may"] = mayCond ? "cond" : mayOutcome ? "out" : undefined;
  const conditional = { reading: reading.id, name: termName, negOut: h.sign < 0, denied, ...(may ? { may } : {}) };
  if (termed && !universal) tr.conditionals.set(term, { ...conditional, id: ctx.id });
  if (universal) tr.everyHinges.push({ reading, condSite, ctx, cond: condClaim, bound, out: h.claim, list: every!.list, kind: every!.kind, member, conditional });
  if (denied) {
    // R4e-3 (say-reasons.md#arguments: "only that the link fails"): the link denied, nothing else claimed.
    tr.rule(ctx, w(`neg(${term})`), []);
    tr.useDenied(reading, frame);
    return true;
  }
  const gate: Literal[] = termed ? [{ atom: `holds(${w(member)})`, premise: w(member) }] : [];
  if (termed && mayGate) {
    // R4e-6: row 15 on the term, `{ holds(T) }` and `holds(may(T))`.
    tr.rule({ ...ctx, choice: true }, w(term), []);
    tr.rule(ctx, w(`may(${term})`), []);
  } else if (termed) tr.rule(ctx, w(term), []);
  if (termed && universal) tr.rule(ctx, w(member), [{ atom: `holds(${w(term)})`, premise: w(term) }, ...body]);
  if (zone?.first) tr.rule(ctx, `against(${term},${zone.term})`, []);
  const enough = gloss === "if" || gloss === "iff";
  const needs = gloss === "only-if" || gloss === "iff";
  if (mayCond) {
    // R3-5: the body reads `may(P)`; a stated condition gives it too. No backward rule for *if*. R4b-25 (D5): *only if*
    // and *iff* add row 6 on `may(P)`, and its back rule gives the condition as MAY on a claim (row 15).
    tr.rule(ctx, w("may(P)"), [...body, { atom: `fits(${c},P)` }, { atom: `holds(${w("P")})`, premise: w("P") }]);
    if (enough) tr.rule(ctx, out, [...gate, ...body, { atom: `fits(${c},P)` }, { atom: `holds(${w("may(P)")})`, premise: w("may(P)") }]);
    if (needs) {
      tr.rule(ctx, notOut, [...gate, ...body, { atom: `fits(P,${c})` }, { atom: `holds(${w("neg(may(P))")})`, premise: w("neg(may(P))") }]);
      if (!universal) {
        tr.rule({ ...ctx, choice: true }, w(condText), [...gate, ...outTrue("P")]);
        tr.rule(ctx, w(`may(${condText})`), [...gate, ...outTrue("P")]);
      }
    }
  } else if (mayOutcome) {
    // R3-1 row 6: a hinge over MAY makes the outcome only possible: a choice, and no backward rule. R4b-26 (D5, R4b
    // decision 1): the *only if* half stays plain, without the condition the outcome is not even possible. D19: with
    // the condition held, every hinge over MAY gives the choice on the outcome (MAY gives a choice wherever it is held).
    tr.rule({ ...ctx, choice: true }, out, [...gate, ...body, ...truth(c, "P")]);
    if (needs) tr.rule(ctx, notOut, [...gate, ...body, ...falsity(c, "P")]);
  } else {
    if (enough) {
      tr.rule(ctx, out, [...gate, ...body, ...truth(c, "P")]);
      if (zone && !zone.first) tr.rule(ctx, `against(${out},${zone.term})`, [...gate, ...body, ...truth(c, "P")]);
      // R4b-16: on a universal, back per member; R4b-17: a definition (*iff*) both ways.
      tr.rule(ctx, wc(`neg(${condText})`), [...gate, ...body, ...outFalse("P")]);
    }
    if (needs) {
      tr.rule(ctx, notOut, [...gate, ...body, ...falsity(c, "P")]);
      tr.rule(ctx, wc(condText), [...gate, ...body, ...outTrue("P")]);
    }
  }
  tr.use(frame, mayCond ? condFrames[0] : undefined);
  for (const l of cond?.links ?? []) if (l.kind === "anaphor" && bound.some((t) => t.kind === "pronoun" && l.words.includes(t.word))) tr.used.add(l);
  return true;
}

/** A pronoun whose antecedent the current reading's universal binds (its kind word). */
export function boundBy(tr: Translator, term: Term): boolean {
  const t = throughAntecedent(term);
  return t.kind === "thing" && tr.bound.has(t.head);
}

/** R4b-1: a `bl-` common noun as a hinge's condition (`thahum blerulal`) reads as its kind K, matched as *there is K*. */
export function nounCondition(tr: Translator, frame: Frame): { text: string; claim: Claim } | undefined {
  const t = frame.hosted;
  if (t?.kind !== "thing" || t.named || t.details.length) return undefined;
  tr.kinds.set(name(t.root), t);
  return { text: name(t.root), claim: { roles: { z: t }, predicate: [], details: [] } };
}

/**
 * R4e-7 (causation.md#if: "a noun outcome says *there is X if there is Y*"): a `/ɡ/` hinge on a common noun. The
 * outcome is the existence claim `isa(nm(Id, z), K)`, the condition `isa(nm(Id, bl), K2)`, each matched as *there is
 * K*. *If* claims the conditional and its forward rule; *only if* its back rule; *iff* both (no denied existence term,
 * so no rule from a denial). *Because* (row 10) claims both sides and `cause(C, O)`, `-l` / `-r` adding row 12's marker.
 */
export function nounHinge(tr: Translator, reading: Reading, g: NounHinge): void {
  const gloss = g.detail.values.gloss ?? "";
  const termName = CONDITIONAL[gloss];
  if (!termName && !["because", "because.fault", "because.share"].includes(gloss)) return tr.leave(reading, { construction: g.frame.construction, key: g.frame.key, reason: "noRow" });
  const id = str(reading.id);
  const out: string[] = [];
  const ctx: Ctx = { reading, id, subst: new Map(), asserted: false, out };
  const k = name(g.outcome.root);
  const k2 = name(g.cond.root);
  tr.kinds.set(k, g.outcome);
  tr.kinds.set(k2, g.cond);
  const o = `isa(nm(${id},z),${k})`;
  const c = `isa(nm(${id},bl),${k2})`;
  const oClaim: Claim = { roles: { z: g.outcome }, predicate: [], details: [] };
  const cClaim: Claim = { roles: { z: g.cond }, predicate: [], details: [] };
  pool(tr, reading, o, oClaim, 1);
  pool(tr, reading, c, cClaim, 1);
  // R4b-3: the stacked `gebem` adds row 6 on the same condition (row 13), as *only if* does here.
  const conditional = termName ?? (g.stack ? "onlyif" : undefined);
  if (!termName) {
    tr.rule(ctx, o, []);
    tr.rule(ctx, c, []);
    tr.rule(ctx, `cause(${c},${o})`, []);
    if (gloss === "because.fault") tr.rule(ctx, `fault(${c},${o})`, []);
    if (gloss === "because.share") tr.rule(ctx, `share(${c},${o})`, []);
  }
  if (conditional) {
    const termName = conditional;
    const cs = `c(${id})`;
    const os = `o(${id})`;
    tr.slots.set(cs, { reading: reading.id, claim: cClaim });
    tr.slots.set(os, { reading: reading.id, claim: oClaim });
    const term = `${termName}(${cs},${os})`;
    tr.conditionals.set(term, { reading: reading.id, name: termName, id, negOut: false, denied: false });
    tr.rule(ctx, term, []);
    const gate: Literal = { atom: `holds(${term})`, premise: term };
    if (termName !== "onlyif") tr.rule(ctx, o, [gate, { atom: `fits(${cs},P)` }, { atom: "holds(P)", premise: "P" }]);
    if (termName !== "if") tr.rule(ctx, c, [gate, { atom: `fits(${os},P)` }, { atom: "holds(P)", premise: "P" }]);
  }
  tr.use(g.frame, g.detail, g.stack?.frame, g.stack?.detail, ...reading.frames);
  const parts = readingParts(reading);
  const unused = parts.filter((p) => !tr.used.has(p.of));
  if (unused.length) return tr.leave(reading, { construction: unused[0]!.key, key: unused[0]!.key, reason: "unused", unused: unused.map((p) => p.text) });
  tr.accounting.set(reading.id, { parts, used: tr.used });
  tr.readings.push(reading.id);
  tr.lines.push(`% ${reading.id}`, `on(${id}).`, ...out);
}
/**
 * R3-1 row 8 and R3-3: an *or* list (joins.md#choice-e, set-joins.md#exclusivity-and-denying-a-whole-list). Each item
 * is a choice; `el`, `ael` and `aem` need at least one (`clash(noneof(Id))`, and the last item when the rest are
 * denied: "even `-m` still needs at least one of the listed items"); `el` and `em` allow at most one (one held denies
 * the rest). Joined on `fits(i(Id, K), P)`.
 */
export function orList(tr: Translator, reading: Reading, claim: Claim, list: ListTerm, ctx: Ctx): true | Why {
  const { series } = list.values;
  if (!orRow(list)) return { construction: `join.${series}`, key: `joinSeries:${series}`, reason: "noRow" };
  orBounds(tr, list, listItems(tr, reading, claim, list, ctx), ctx);
  return true;
}

/** R3-1 row 8: each item a choice, with the list's bounds (a list {@link orRow} accepts). */
export function orBounds(tr: Translator, list: ListTerm, items: { text: string; slot: string }[], ctx: Ctx): void {
  const { series, ending } = list.values;
  const atLeast = ending === "l" || series === "ae";
  const atMost = series === "e";
  for (const it of items) tr.rule({ ...ctx, choice: true }, it.text, []);
  if (atLeast) {
    items.forEach((_, k) => tr.rule(ctx, `some(${ctx.id})`, held(items, k), "some"));
    tr.rule(ctx, `noneof(${ctx.id})`, [{ atom: `not some(${ctx.id})` }], "clash");
    if (items.length > 1) items.forEach((it, k) => tr.rule(ctx, it.text, items.flatMap((_, j) => (j === k ? [] : denied(items, j)))));
  }
  if (atMost) items.forEach((_, k) => items.forEach((jt, j) => j !== k && tr.rule(ctx, `neg(${jt.text})`, held(items, k))));
}

/**
 * R3-1 row 7: *not exactly one* (`vel vul`): one item held with every other denied clashes, `clash(notone(Id))`; with
 * two items each holds or is denied with the other. *Not at most one* (`vem vul`) adds the clash with no item held.
 */
export function notOne(tr: Translator, reading: Reading, claim: Claim, list: ListTerm, ctx: Ctx, none: boolean): true {
  const items = listItems(tr, reading, claim, list, ctx);
  // R4a-2: inside a holder's view, row 21 runs on the holder's views.
  const w = (t: string): string => tr.w(ctx, t);
  const rest = (k: number): Literal[] => items.flatMap((_, j) => (j === k ? [] : denied(items, j, w)));
  items.forEach((_, k) => tr.rule(ctx, w(`notone(${ctx.id})`), [...held(items, k, w), ...rest(k)], "clash"));
  if (none) tr.rule(ctx, w(`notone(${ctx.id})`), items.flatMap((_, j) => denied(items, j, w)), "clash");
  if (items.length === 2) {
    for (const [k, j] of [[0, 1], [1, 0]] as const) {
      tr.rule(ctx, w(items[j]!.text), held(items, k, w));
      tr.rule(ctx, w(`neg(${items[j]!.text})`), denied(items, k, w));
    }
  }
  return true;
}

/** Each item of a list as the claim with that item, its slot `i(Id, K)`, and its term in the pool. */
export function listItems(tr: Translator, reading: Reading, claim: Claim, list: ListTerm, ctx: Ctx): { text: string; slot: string }[] {
  return list.members.map((m, i) => {
    const item = tr.substituted(claim, list, m, { ...ctx, asserted: false });
    const slot = `i(${ctx.id},${i + 1})`;
    tr.slots.set(slot, { reading: reading.id, claim: item.claim });
    pool(tr, reading, item.text, item.claim, 1);
    return { text: item.text, slot };
  });
}

export function pool(tr: Translator, reading: Reading, text: string, claim: Claim, sign: number): void {
  if (/\bX\d*\b/.test(text)) return;
  if (!tr.terms.has(text)) tr.terms.set(text, { reading: reading.id, claim: pooled(tr, claim, reading) });
  if (sign < 0) tr.denied.add(text);
}
