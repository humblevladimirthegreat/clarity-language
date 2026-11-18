/**
 * Step conditions (docs/meta/interpreter.md, matcher rules): when the matcher's `widen` and `infer` switches may take a
 * step beyond the claim as said. Each condition reads one claim, its reading's pairing links, or the lexicon, nothing
 * across readings, so any engine that chains these steps calls the same functions.
 *
 * - `widen`: {@link compoundHeads}, the heads a compound term matches on.
 * - `infer`: {@link claimMemberLists} and {@link memberList} (membership in a stated list, {@link asMember} for the
 *   member as it stands), {@link universalInstance} (closed `zual` + kind to an instance), and {@link collective}, the
 *   verb that blocks both.
 */
import type { ClassifyTables } from "../parse/classify.js";
import type { Claim, Reading, Term } from "./types.js";

/** The lexicon tables the step conditions read: dictionary compound rows and published roots. */
export type StepLexicon = Pick<ClassifyTables, "compounds" | "published">;

export type ListTerm = Extract<Term, { kind: "list" }>;

/** Follow a pronoun to the term it resumes, through a chain of pronouns (reader rule 6: the resolver's binding, never re-derived). */
export function throughAntecedent(term: Term): Term {
  let out = term;
  for (let i = 0; i < 32 && out.kind === "pronoun" && out.antecedent; i++) out = out.antecedent;
  return out;
}

// ── Widening ────────────────────────────────────────────────────────────────

/** The heads of a compound term, nearest first: an `x` compound's last root, then a dictionary compound's right root, in turn. */
export function compoundHeads(term: Term, lexicon: StepLexicon): string[] {
  if (term.kind !== "thing" || term.named) return [];
  const out: string[] = [];
  const family = term.head.family;
  let root: string | undefined = family.kind === "x" && family.xFamily === "compound" ? family.rightRoots?.at(-1) : term.root;
  if (root !== undefined && root !== term.root) out.push(root);
  for (let i = 0; root !== undefined && i < 8; i++) {
    const row = lexicon.compounds.get(root);
    // Only a root on the right is a head: a tail suffix (empty join) or a hook is not a thing of its own.
    root = row && row.join !== "" && lexicon.published.has(row.right) ? row.right : undefined;
    if (root !== undefined) out.push(root);
  }
  return out;
}

// ── Inference ───────────────────────────────────────────────────────────────

/** A list a member may stand for: an `a` (*and*) list, flat, with members, no list frame and no bound. */
export function memberList(term: Term): term is ListTerm {
  return term.kind === "list" && term.values.series === "a" && term.members.length > 0 && term.parts.length === 1 && !term.frames?.length && !term.bound;
}

/** A collective verb (`-x`): the members act together (universals-domains.md#universals-domains-generics, collectives.md). */
export function collective(claim: Claim): boolean {
  return claim.verb?.kind === "thing" && claim.verb.head.plural === true;
}

/**
 * The target lists whose members a query term may match in this claim (see the matcher's `infer` switch): the one list
 * of the claim, or the lists a *respectively* link pairs, each with its pairing group.
 */
export function claimMemberLists(target: Claim, reading: Reading | undefined): Map<Term, object | undefined> {
  const out = new Map<Term, object | undefined>();
  if (collective(target)) return out;
  // A pronoun that resumes a list stands for that list (reader rule 6: the reader points it at the list term).
  const terms = [...Object.values(target.roles), ...target.predicate].filter((t): t is Term => t !== undefined).map(throughAntecedent);
  const lists = terms.filter((t): t is ListTerm => t.kind === "list");
  for (const link of reading?.links ?? []) {
    if (link.kind !== "pairing" || !link.partners?.length) continue;
    const own = lists.find((l) => l.join !== undefined && link.words.includes(l.join));
    const group = [own, ...link.partners].filter((t): t is ListTerm => t !== undefined && lists.includes(t as ListTerm));
    const size = group[0]?.members.length ?? 0;
    if (group.length < 2 || !group.every((l) => memberList(l) && l.members.length === size)) continue;
    const id = {};
    for (const l of group) out.set(l, id);
  }
  if (out.size === 0 && lists.length === 1 && memberList(lists[0]!)) out.set(lists[0]!, undefined);
  return out;
}

/** A list member as it stands in the claim: its own details and the SHARED ones after the join (list-structure.md#shared-after-the-join). */
export function asMember(member: Term, list: ListTerm): Term {
  const shared = list.sharedDetails ?? [];
  if (!shared.length || !("details" in member)) return member;
  return { ...member, details: [...(member.details ?? []), ...shared] } as Term;
}

/** Closed `zual` + kind, no leftovers (universals-domains.md#universals-domains-generics): the instance it stands for. */
export function universalInstance(target: Term): Term | undefined {
  if (target.kind !== "list" || target.values.series !== "ua" || target.values.ending !== "l") return undefined;
  if (target.members.length || target.frames?.length || target.bound) return undefined;
  const shared = target.sharedDetails ?? [];
  const kinds = shared.filter((d) => d.values.role === "kind");
  if (kinds.length !== 1 || kinds[0]!.words.length !== 1) return undefined;
  const word = kinds[0]!.words[0]!;
  if (word.family.kind !== "content" || word.family.roots.length !== 1) return undefined;
  return { kind: "thing", head: word, root: word.family.roots[0]!, named: false, details: shared.filter((d) => d !== kinds[0]) };
}
