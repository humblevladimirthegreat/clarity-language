/**
 * The bare clause (docs/meta/realizer.md#canonical-choices): roles, verb, predicate and plain adverbs in the default
 * order of clause.md, the statement act left out, and a first-mention noun's new-member frame written by its noun.
 */
import type { ClassifyTables } from "../parse/classify.js";
import type { MeaningDetail, MeaningFrame, MeaningReading, MeaningTerm } from "./meaning.js";
import { adverb, plainWord, predicateTerm, roleTerm, toneMark, toneOf, verbTerm } from "./terms.js";
import { attempt, PLACEHOLDER, skip, Unrealized } from "./gaps.js";
import { placeDetails, zoneGloss, type DetailWriters } from "./details.js";
import type { Ending } from "./words.js";
import type { ListStyle } from "./lists.js";
import { assignedTags } from "./tags.js";
import { actGloss, actOrder, callGloss, interjectionGloss, polarGloss } from "./acts.js";
import { holderHosts, isStanceWord, isStandaloneJoin, stanceListGloss, stanceOrder, stancePlace, stanceWordGloss, standaloneJoinGloss } from "./frames-stance.js";

const noRule = (detail: string): Unrealized => new Unrealized("noRule", detail);

/** The noun roles in the default order Subject – Direct Object – Verb – Extra noun (clause.md#extra-nouns). */
const ROLES = ["z", "d", "b"] as const;
type Role = (typeof ROLES)[number];

/** The statement act `yal`, which an omitted act word stands for (speech-moves.md#speech-act-statement-question-command). */
const isStatementAct = (frame: MeaningFrame): boolean =>
  frame.key === "edge:force" && frame.values.series === "a" && frame.values.ending === "l" && Object.keys(frame.values).length === 2 && !frame.party && !frame.inner?.length;

/**
 * A plain new member (joins.md#new-member-in-a-statement): the frame a first-mention noun in a role brings, hosting
 * that role's term, which carries the noun's ending.
 */
function newMemberOf(frame: MeaningFrame, roles: Partial<Record<Role, MeaningTerm>>): Role | undefined {
  if (frame.key !== "slot:newMember" || frame.party || frame.content || frame.inner?.length || frame.details?.length) return undefined;
  if (frame.member !== undefined || frame.holderHost || frame.occasions) return undefined;
  const role = ROLES.find((r) => roles[r] === frame.hosted);
  const term = role && roles[role]!;
  // A new one (pronouns.md#a-new-one) brings in a new member, as the noun it copies does; so does an and-list of
  // such nouns, as one phrase where the list stands (joins.md#everything-ua).
  const newOne = term?.kind === "pronoun" && term.values?.ending === "l";
  const andList = term?.kind === "list" && term.values.series === "a";
  return term && (term.kind === "thing" || newOne || andList) ? role : undefined;
}

/** The thing a new-member frame hosts when it is a claim detail's hosted phrase (a hook's landmark), not a role's noun. */
function hostedNewMember(frame: MeaningFrame, details: readonly MeaningDetail[]): MeaningTerm | undefined {
  if (frame.key !== "slot:newMember" || frame.party || frame.content || frame.inner?.length || frame.details?.length) return undefined;
  if (frame.member !== undefined || frame.holderHost || frame.occasions) return undefined;
  const hosted = frame.hosted;
  return hosted?.kind === "thing" && details.some((d) => d.hosted === hosted) ? hosted : undefined;
}

/**
 * A join's own binder frame (joins.md#everything-ua: `zual godozel`, *every dog*), hosting the list it closes in a role:
 * the list's join writes it.
 */
function binderListOf(frame: MeaningFrame, roles: Partial<Record<Role, MeaningTerm>>, details: readonly MeaningDetail[] = []): Role | "landmark" | undefined {
  if (frame.family !== "binder" || !frame.key.startsWith("joinSeries:") || frame.hosted?.kind !== "list") return undefined;
  if (frame.party || frame.content || frame.details?.length || frame.member !== undefined || frame.holderHost || frame.occasions) return undefined;
  // *No K* (`zul godozel`, universals-domains.md#universals-domains-generics) holds its join's own denial, which the
  // join word writes too.
  const list = frame.hosted;
  const ownDenial = (inner: MeaningFrame): boolean =>
    inner.key === `joinSeries:${list.values.series}` && !inner.hosted && !inner.party && !inner.content && !inner.inner?.length && !inner.details?.length;
  if (frame.inner?.length && (frame.key !== "joinSeries:u:kind" || !frame.inner.every(ownDenial))) return undefined;
  if (details.some((d) => d.hosted === frame.hosted)) return "landmark";
  return ROLES.find((r) => roles[r] === frame.hosted);
}

/**
 * Each role's frame rank: how many new-member frames cover it. The earlier word covers the later
 * (clause.md#which-covers-which), so the roles are written in rank order where they carry frames; an unordered pair
 * keeps its text order.
 */
function ranks(view: MeaningReading, framed: Map<number, Role>): Map<Role, number> {
  const over = new Map<number, Set<number>>();
  const cover = (a: number, b: number): void => {
    if (framed.has(a) && framed.has(b)) (over.get(b) ?? over.set(b, new Set()).get(b)!).add(a);
  };
  for (const pair of view.order) cover(pair.over, pair.under);
  for (const [a, b] of view.unordered) cover(a, b);
  return new Map([...framed].map(([index, role]) => [role, over.get(index)?.size ?? 0]));
}

/**
 * The lists that take *respectively* (list-structure.md#respectively): for each pairing link, the one `a` list of the
 * claim other than its partner. The link names only the partner, so a claim with more candidates is a `missingValue`.
 */
function respectivelyLists(view: MeaningReading): Set<MeaningTerm> {
  const out = new Set<MeaningTerm>();
  const claim = view.claim;
  const lists = [...ROLES.map((r) => claim.roles[r]), claim.verb, ...claim.predicate].filter((t): t is MeaningTerm => t?.kind === "list");
  for (const link of view.links) {
    if (link.kind !== "pairing") continue;
    // The reader names the list whose join the word sits before.
    if (link.list && lists.includes(link.list)) {
      out.add(link.list);
      continue;
    }
    const partners = link.partners ?? [];
    const candidates = lists.filter((t) => !partners.includes(t) && t.kind === "list" && t.values.series === "a");
    if (partners.length !== 1 || !lists.includes(partners[0]!) || candidates.length !== 1) {
      throw new Unrealized("missingValue", "a respectively link that does not name which list it closes");
    }
    out.add(candidates[0]!);
  }
  return out;
}

/**
 * The written pieces with each copied tone mark before the first piece that carries it (tone-marks.md#showing-your-tone).
 * Every piece after a copied mark must carry it, or a later one: a mark colors all the words after it.
 */
function withRestMarks(pieces: readonly string[], marks: ReadonlyMap<string, string>): string[] {
  const out: string[] = [];
  let current: string | undefined;
  for (const piece of pieces) {
    const mark = marks.get(piece);
    if (mark && mark !== current) out.push(mark);
    else if (!mark && current) throw noRule("a word after a tone mark that the mark does not color");
    current = mark;
    out.push(piece);
  }
  return out;
}

/** A reading's whole morph gloss (act words, the clause in default order, its details and tags), or throws {@link Unrealized}. */
export function claimGloss(view: MeaningReading, tables: ClassifyTables, style: ListStyle = { standalone: true }): string {
  // A stance list goes last, its join right after its stance words (verb-and-stance-joins.md#stance-joins); a
  // standalone stance join goes there in its place.
  for (const extra of view.stanceLists?.slice(1) ?? []) skip(extra.key, noRule("more than one stance list"));
  const listed = new Set<number>();
  const firstList = view.stanceLists?.[0];
  const stanceList = firstList ? [attempt(firstList.key, () => stanceListGloss(view, firstList, tables, listed), PLACEHOLDER)] : [];
  // A pronoun's anaphor link is the bind its term carries; reading the realized pronoun makes it again.
  // A shared link is the list's shared word (list-structure.md#shared-after-the-join); writing the word makes it again.
  // A pairing link is the *respectively* word its list's join writes (list-structure.md#respectively).
  // An answer link ties a reply to the question before it (questions.md#fill-ask); reading the reply after it ties it again.
  // A discourse hook (hooks.md#discourse-hooks) is its word at the left edge, which ties the sentence to prior talk
  // again when read; its link carries its gloss.
  const front: string[] = [];
  // A point-back hook (in-clause-hooks.md#hook-resume) is its word, an extra noun; reading it finds its landmark again.
  const resumes: string[] = [];
  // A polar word (questions.md#polar-particle) stands after the act words and before the body; its link is the word.
  const polar: string[] = [];
  // An assigning tag is its word right after the term it names (tag-pronouns.md#naming-with-a-tag).
  const { tags, rest } = assignedTags(view.links);
  if (tags.size) style = { ...style, tags };
  const links = rest.filter((link) => {
    if (link.kind === "discourse" && link.values?.gloss && !link.frame && !link.resumed) return void front.push(link.values.gloss);
    if (link.kind === "hookResume" && link.values?.gloss && !link.frame) return void resumes.push(link.values.gloss);
    if (link.kind === "polar") return void polar.push(attempt(link.key, () => polarGloss(link, tables), PLACEHOLDER));
    return link.kind !== "anaphor" && link.kind !== "shared" && link.kind !== "pairing" && link.kind !== "answer";
  });
  for (const link of links) skip(link.key, noRule(`a ${link.kind} link`));
  const pairing = view.links.find((link) => link.kind === "pairing")?.key ?? "claim";
  const respectively = attempt(pairing, () => respectivelyLists(view), new Set<MeaningTerm>());
  if (respectively.size) style = { ...style, respectively };
  const claim = view.claim;
  if (claim.clauses) skip("claim", noRule("clause-join members"));
  const endings = new Map<Role, Ending>();
  const framed = new Map<number, Role>();
  const zones: string[] = [];
  // MAY and the channels (knowing.md#may, evidentiality.md#evidentiality), placed once the framed nouns are known.
  const stances: number[] = [];
  // A holder is written in the stance word it sits on (holder.md#naming-a-holder).
  const holders = holderHosts(view);
  const inWord = new Set(holders.values());
  const hostedEndings = new Map<MeaningTerm, Ending>();
  // The opening `/y/` words (speech-moves.md): calls and reactions, then the act words, in the reading's order. A lone
  // plain statement act is left out (speech-moves.md#speech-act-beginner); a stacked one is written.
  const acts = view.frames.filter((frame) => frame.key === "edge:force");
  // A free-standing mark at the start colors the whole sentence (tone-marks.md#showing-your-tone): its own frame.
  let sentenceMark: string | undefined;
  const opening: string[] = [];
  const actWords: string[] = [];
  const writeFrame = (frame: MeaningFrame, index: number): void => {
    if (frame.key === "edge:force") {
      if (acts.length > 1 || !isStatementAct(frame)) actWords.push(actGloss(frame, tables));
      return;
    }
    const tone = toneOf(frame);
    if (tone) {
      if (tone.scope !== "rest" || sentenceMark) throw noRule("a sentence tone mark that is not one free-standing mark");
      return void (sentenceMark = tone.mark);
    }
    if (frame.key === "edge:vocative") return void opening.push(callGloss(frame, tables));
    if (frame.key === "edge:interjection") return void opening.push(interjectionGloss(frame, tables));
    // A join's binder frame over a hook's landmark (`el bual`, *everywhere*) is written by the landmark's join too.
    const binder = binderListOf(frame, claim.roles, claim.details);
    if (binder === "landmark") return;
    if (binder) {
      framed.set(index, binder);
      return;
    }
    if (inWord.has(index) || listed.has(index)) return;
    if (isStanceWord(frame)) return void stances.push(index);
    if (isStandaloneJoin(frame)) {
      if (stanceList.length) throw noRule("a standalone stance join and a stance list");
      return void stanceList.push(standaloneJoinGloss(view, index));
    }
    const zone = zoneGloss(frame);
    if (zone) return void zones.push(zone);
    const ending = frame.values.ending;
    // A hook's landmark or hosted phrase brings in a new member as a role's noun does (joins.md#new-member-in-a-statement).
    const hosted = hostedNewMember(frame, claim.details);
    if (hosted) {
      if (ending !== "l" && ending !== "m") throw noRule(`a new member on -${ending}`);
      return void hostedEndings.set(hosted, ending);
    }
    const role = newMemberOf(frame, claim.roles);
    if (!role) throw noRule(`frame ${frame.key}`);
    if (ending !== "l" && ending !== "m") throw noRule(`a new member on -${ending}`);
    endings.set(role, ending);
    framed.set(index, role);
  };
  view.frames.forEach((frame, index) => {
    if (!attempt(frame.key, () => (writeFrame(frame, index), true), false)) opening.push(PLACEHOLDER);
  });
  const roles = ROLES.filter((r) => claim.roles[r]);
  // A stance word goes first in the body, or after the framed nouns that cover it (clause.md#which-covers-which).
  const early: string[] = [];
  const late: string[] = [];
  const framedNouns = new Set(framed.keys());
  for (const index of stanceOrder(view, stances)) {
    const write = (): void => void (stancePlace(view, index, framedNouns) === "early" ? early : late).push(stanceWordGloss(view.frames[index]!, tables, view.frames[holders.get(index) ?? -1]));
    if (!attempt(view.frames[index]!.key, () => (write(), true), false)) late.push(PLACEHOLDER);
  }
  // Framed roles keep the default slots, filled in the order their frames cover each other.
  const rank = ranks(view, framed);
  const inFrameOrder = roles.filter((r) => rank.has(r)).sort((a, b) => rank.get(a)! - rank.get(b)!);
  const placed = roles.map((r) => (rank.has(r) ? inFrameOrder.shift()! : r));
  const writers: DetailWriters = {
    phrase: (term, part, ending) => {
      if (part === "z" || part === "d" || part === "b") return roleTerm(term, part, ending, tables, style);
      if (part === "v") return verbTerm(term, tables, style);
      throw noRule(`a hook hosting a /${part}/ phrase`);
    },
    degree: (detail) => plainWord(detail, "w", detail.values.root, tables),
    endingOf: (term) => hostedEndings.get(term),
  };
  // A blank that completes another word comes first together with that word (questions.md#fill-ask: `el bar`, `abam zar`).
  const hostsBlank = (detail: MeaningDetail): boolean => detail.hosted?.kind === "blank";
  const placeAll = (some: readonly MeaningDetail[]) => placeDetails(some, (detail) => adverb(detail, tables), writers);
  const details = placeAll(claim.details.filter((detail) => !hostsBlank(detail)));
  const asked = placeAll(claim.details.filter(hostsBlank));
  const askedFirst = [...asked.lead, ...asked.before, ...[...asked.attached.values()].flat(), ...asked.after];
  // A range or in-clause hook and its second phrase go right after the first (ranges.md#ranges).
  const withAttached = (part: string, piece: string): string[] => {
    const attached = details.attached.get(part) ?? [];
    details.attached.delete(part);
    return [piece, ...attached];
  };
  // A later free-standing mark is copied onto each term after it (tone-marks.md#showing-your-tone); each written term
  // records the mark it carries, and the mark is written once, before the first.
  const restMarks = new Map<string, string>();
  const carrying = (term: MeaningTerm | undefined, piece: string): string => {
    const mark = term && "frames" in term ? toneMark(term.frames, "rest") : undefined;
    if (mark && (restMarks.get(piece) ?? mark) !== mark) throw noRule("two words written alike under different tone marks");
    if (mark) restMarks.set(piece, mark);
    return piece;
  };
  const piece = (r: Role): string[] => withAttached(r, carrying(claim.roles[r], roleTerm(claim.roles[r]!, r, endings.get(r), tables, style)));
  const groups = placed.filter((_, i) => roles[i] !== "b").map(piece);
  const after = placed.filter((_, i) => roles[i] === "b").flatMap(piece);
  const verb = claim.verb ? withAttached("v", carrying(claim.verb, verbTerm(claim.verb, tables, style))) : [];
  // Each act's default order (speech-moves.md#act-word-order): a question puts its verb second, a command first, and
  // the receiver stays right after the verb; a statement or prohibition keeps the verb late.
  const actOrdered = verb.length ? actOrder(acts.filter((act) => acts.length > 1 || !isStatementAct(act))) : "statement";
  // A fill-ask puts its blank first and the rest in statement order (questions.md#fill-ask).
  const blankRole = placed.findIndex((r, i) => roles[i] !== "b" && claim.roles[r]!.kind === "blank");
  const blankFirst = actOrdered !== "command" && (askedFirst.length > 0 || blankRole >= 0 || claim.predicate.some((term) => term.kind === "blank"));
  const order = blankFirst ? "statement" : actOrdered;
  const lead = order === "question" ? (groups.shift() ?? []) : blankRole >= 0 && blankFirst ? groups.splice(blankRole, 1)[0]! : [];
  const verbFirst = order === "statement" ? [] : [...lead, ...verb, ...after];
  const before = groups.flat();
  const predicate = claim.predicate.map((term) => carrying(term, predicateTerm(term, tables, style)));
  const blankPredicate = blankFirst && blankRole < 0 ? predicate.splice(0) : [];
  if (details.attached.size) throw noRule(`a hook after a /${[...details.attached.keys()][0]}/ part the claim does not have`);
  if (tags.size) throw noRule("a tag on a term the claim does not write in a role");
  // Adverbs and hosted relations right before the verb or predicate (clause.md#adverbs-h places them anywhere); extra
  // nouns after it (clause.md#extra-nouns), hooked ones after the plain ones; a discourse hook first, a zone last.
  // The calls and reactions first, a discourse hook right before the first act word (firm-soft.md#firm-or-soft-act).
  const body = verbFirst.length
    ? [...early, ...askedFirst, ...verbFirst, ...before, ...late, ...details.lead, ...details.before, ...predicate, ...details.after, ...resumes, ...zones, ...stanceList]
    : [...early, ...askedFirst, ...lead, ...blankPredicate, ...before, ...late, ...details.lead, ...details.before, ...verb, ...predicate, ...after, ...details.after, ...resumes, ...zones, ...stanceList];
  const pieces = [...opening, ...front, ...actWords, ...polar, ...body];
  if (!pieces.length) throw noRule("an empty claim");
  if (sentenceMark && (opening.length || actWords.length || polar.length)) throw noRule("a sentence tone mark before the opening /y/ words");
  return [...(sentenceMark ? [sentenceMark] : []), ...withRestMarks(pieces, restMarks)].join(" | ");
}
