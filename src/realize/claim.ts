/**
 * The bare clause (docs/meta/realizer.md#canonical-choices): roles, verb, predicate and plain adverbs in the default
 * order of clause.md, the statement act left out, and a first-mention noun's new-member frame written by its noun.
 */
import type { ClassifyTables } from "../parse/classify.js";
import type { MeaningFrame, MeaningReading, MeaningTerm } from "./meaning.js";
import { adverb, predicateTerm, roleTerm, Unrealized, verbTerm } from "./terms.js";
import type { Ending } from "./words.js";

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
  // A new one (pronouns.md#a-new-one) brings in a new member, as the noun it copies does.
  const newOne = term?.kind === "pronoun" && term.values?.ending === "l";
  return term && (term.kind === "thing" || newOne) ? role : undefined;
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

/** The bare clause's morph gloss, or throws {@link Unrealized}. */
export function claimGloss(view: MeaningReading, tables: ClassifyTables): string {
  if (view.stanceLists?.length) throw noRule("a stance list");
  // A pronoun's anaphor link is the bind its term carries; reading the realized pronoun makes it again.
  const links = view.links.filter((link) => link.kind !== "anaphor");
  if (links.length) throw noRule(`a ${links[0]!.kind} link`);
  const claim = view.claim;
  if (claim.clauses) throw noRule("clause-join members");
  const endings = new Map<Role, Ending>();
  const framed = new Map<number, Role>();
  view.frames.forEach((frame, index) => {
    if (isStatementAct(frame)) return;
    const role = newMemberOf(frame, claim.roles);
    if (!role) throw noRule(`frame ${frame.key}`);
    const ending = frame.values.ending;
    if (ending !== "l" && ending !== "m") throw noRule(`a new member on -${ending}`);
    endings.set(role, ending);
    framed.set(index, role);
  });
  const roles = ROLES.filter((r) => claim.roles[r]);
  // Framed roles keep the default slots, filled in the order their frames cover each other.
  const rank = ranks(view, framed);
  const inFrameOrder = roles.filter((r) => rank.has(r)).sort((a, b) => rank.get(a)! - rank.get(b)!);
  const placed = roles.map((r) => (rank.has(r) ? inFrameOrder.shift()! : r));
  const piece = (r: Role): string => roleTerm(claim.roles[r]!, r, endings.get(r), tables);
  const before = placed.filter((_, i) => roles[i] !== "b").map(piece);
  const after = placed.filter((_, i) => roles[i] === "b").map(piece);
  const adverbs = claim.details.map((detail) => adverb(detail, tables));
  const verb = claim.verb ? [verbTerm(claim.verb, tables)] : [];
  const predicate = claim.predicate.map((term) => predicateTerm(term, tables));
  // Adverbs right before the verb or predicate (clause.md#adverbs-h places them anywhere).
  const pieces = [...before, ...adverbs, ...verb, ...predicate, ...after];
  if (!pieces.length) throw noRule("an empty claim");
  return pieces.join(" | ");
}
