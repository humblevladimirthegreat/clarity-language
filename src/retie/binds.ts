/**
 * Content-resume binds before and after a retie: each **-r** must keep pointing at the
 * same antecedent (respelled).
 */
import type { ClassifyTables } from "../parse/classify.js";
import { parse } from "../parse/index.js";

import { contentStemRoots } from "./resume.js";
import { fillSelfFor } from "./tables.js";

export type ContentBind = {
  /** Resume spelling as written (`zazawar`). */
  raw: string;
  /** Resume stem roots (`["azawa"]`). */
  roots: string[];
  /** Antecedent content roots, or `null` when the resume binds nothing. */
  antecedent: string[] | null;
};

/** Content-resume binds in text order, or `null` when the text does not parse. */
export function contentBinds(text: string, tables: ClassifyTables): ContentBind[] | null {
  let resolved;
  try {
    // The learner-name slot is filled as the lint fills it, or a span with `zSELFn` never parses.
    resolved = parse(fillSelfFor(text, tables).trim(), tables).resolve;
  } catch {
    return null;
  }
  if (!resolved) return [];
  const byRaw = new Map<string, string[][]>();
  const out: ContentBind[] = [];
  for (const bind of resolved.anaphors) {
    if (bind.kind !== "content") continue;
    const pronoun = bind.pronoun;
    const roots = pronoun.family.kind === "content" ? pronoun.family.roots : contentStemRoots(pronoun);
    let antecedent: string[] | null = null;
    if (bind.antecedent) {
      // A resume bound to an earlier resume follows that one's antecedent.
      antecedent =
        bind.antecedent.ending === "r"
          ? (byRaw.get(bind.antecedent.raw)?.at(-1) ?? contentStemRoots(bind.antecedent))
          : contentStemRoots(bind.antecedent);
      const list = byRaw.get(pronoun.raw) ?? [];
      list.push(antecedent);
      byRaw.set(pronoun.raw, list);
    }
    out.push({ raw: pronoun.raw, roots, antecedent });
  }
  return out;
}

export type BindDrift = {
  index: number;
  before: ContentBind;
  after: ContentBind;
  /** Antecedent roots the resume should bind after the retie. */
  expected: string[];
};

/** Resumes whose antecedent is no longer the respelled original. */
export function bindDrift(
  before: readonly ContentBind[],
  after: readonly ContentBind[],
  map: ReadonlyMap<string, string>,
): BindDrift[] {
  const drift: BindDrift[] = [];
  const n = Math.min(before.length, after.length);
  for (let i = 0; i < n; i++) {
    const was = before[i]!;
    if (!was.antecedent) continue;
    const expected = was.antecedent.map((root) => map.get(root) ?? root);
    const now = after[i]!.antecedent;
    if (!now || now.join("x") !== expected.join("x")) {
      drift.push({ index: i, before: was, after: after[i]!, expected });
    }
  }
  return drift;
}
