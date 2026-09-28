/**
 * Content-resume binds before and after a retie: each **-r** must keep pointing at the
 * same antecedent (respelled), and a short resume that now collides becomes a full-root resume.
 */
import type { ClassifyTables } from "../parse/classify.js";
import { parse } from "../parse/index.js";
import { letterPrefix } from "../parse/resolve.js";

import { contentStemRoots } from "./resume.js";

export type ContentBind = {
  /** Resume spelling as written (`zazar`). */
  raw: string;
  /** Resume stem roots (`["aza"]`). */
  roots: string[];
  /** Antecedent content roots, or `null` when the resume binds nothing. */
  antecedent: string[] | null;
};

/** Content-resume binds in text order, or `null` when the text does not parse. */
export function contentBinds(text: string, tables: ClassifyTables): ContentBind[] | null {
  let resolved;
  try {
    resolved = parse(text.trim(), tables).resolve;
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

/** Full-root respelling of a single-root content resume (`zazar` + `azawa` → `zazawar`). */
export function fullResumeSpelling(word: { raw: string; prefix: string }, stem: string, root: string): string | null {
  const { prefix } = word;
  if (!word.raw.startsWith(`${prefix}${stem}r`)) return null;
  return `${prefix}${root}${word.raw.slice(prefix.length + stem.length)}`;
}

/** Replace the `nth` whole-word occurrence of `word` in `text`. */
export function replaceNthWord(text: string, word: string, nth: number, next: string): string | null {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  let seen = 0;
  for (const match of text.matchAll(new RegExp(`(?<![a-z])${escaped}(?![a-z])`, "g"))) {
    if (seen++ === nth) {
      return text.slice(0, match.index!) + next + text.slice(match.index! + word.length);
    }
  }
  return null;
}

/**
 * After a retie, lengthen each short resume whose new short cut binds the wrong word
 * (`zazar` now matches *stand* `azado` as well as `azawa`) to a full-root resume.
 * Returns the fixed text and the resumes it lengthened.
 */
export function lengthenCollidingResumes(
  beforeText: string,
  afterText: string,
  map: ReadonlyMap<string, string>,
  tables: ClassifyTables,
): { text: string; lengthened: { from: string; to: string }[] } {
  const before = contentBinds(beforeText, tables);
  let text = afterText;
  const lengthened: { from: string; to: string }[] = [];
  if (!before) return { text, lengthened };
  for (let attempt = 0; attempt < 8; attempt++) {
    const after = contentBinds(text, tables);
    if (!after || after.length !== before.length) break;
    const drift = bindDrift(before, after, map).find(
      (d) => d.after.roots.length === 1 && d.expected.length === 1 && d.after.roots[0] === letterPrefix(d.expected[0]!),
    );
    if (!drift) break;
    const nth = after.slice(0, drift.index).filter((b) => b.raw === drift.after.raw).length;
    const word = { raw: drift.after.raw, prefix: posOf(drift.after.raw) };
    const full = fullResumeSpelling(word, drift.after.roots[0]!, drift.expected[0]!);
    const next = full ? replaceNthWord(text, drift.after.raw, nth, full) : null;
    if (!full || !next) break;
    const check = contentBinds(next, tables);
    if (!check || bindDrift(before, check, map).some((d) => d.index === drift.index)) break;
    lengthened.push({ from: drift.after.raw, to: full });
    text = next;
  }
  return { text, lengthened };
}

function posOf(raw: string): string {
  if (raw.startsWith("th")) return "th";
  return "zdbvgwhxy".includes(raw[0]!) ? raw[0]! : "";
}
