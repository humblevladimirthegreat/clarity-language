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
import { name, raws } from "./translate-helpers.js";
import type { Talk } from "./translate-types.js";
import type { Link, ReadingId, Term } from "./types.js";

/** O-2: the discourse hooks that withdraw the claim they point to. */
const WITHDRAW_HOOK = /^(?:e[lm]|ur)$/;
/** O-3: the discourse hooks that state an exception to the claim they point to. */
const EXCEPT_HOOK = /^u[lm]$/;

/** For talk(): whether `l` is a withdrawing or excepting hook that points back; a withdrawal names its reading in `out`. */
export function pointBack(l: Link, out: Talk): boolean {
  if (l.key !== "edge:hook" || l.kind !== "discourse" || !l.to) return false;
  const text = raws(l.words);
  if (WITHDRAW_HOOK.test(text)) out.withdraws = l.to;
  return WITHDRAW_HOOK.test(text) || EXCEPT_HOOK.test(text);
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
    if (!r.links.some((l) => l.key === "edge:hook" && l.to === prior && EXCEPT_HOOK.test(raws(l.words)))) continue;
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
