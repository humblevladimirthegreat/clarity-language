/**
 * Before/after check for a retie: a rewritten sentence or phrase must parse the same way,
 * with only mapped roots changed.
 */
import type { ClassifyTables } from "../parse/classify.js";
import { ConstructionError } from "../parse/enforce.js";
import { parse } from "../parse/index.js";

import { bindDrift, contentBinds } from "./binds.js";
import type { RetiedSpan } from "./markdown.js";
import { asRetieTables, fillSelfFor, selfRootIn, type RetieTables } from "./tables.js";

export type RetieVerifyLevel = "blocking" | "warning" | "info";

export type RetieVerifyFailure = {
  span: RetiedSpan;
  detail: string;
  /** `warning` is a new resume link (does not block). Any other tree change blocks. */
  level: RetieVerifyLevel;
};

/** Keys that carry spelling or lexicon text, not structure. */
const SPELLING_KEYS = new Set([
  "raw",
  "text",
  "input",
  "payload",
  "rootGloss",
  "gloss",
  "definition",
  "mnemonic",
  "anchor",
  "senseForm",
  "emoji",
  "english",
  "stem",
]);

const ROOT_KEYS = new Set(["roots", "leftRoots", "rightRoots", "leftRoot"]);

type Shape = { structure: string; roots: string[] };

function shapeOf(value: unknown): Shape {
  const roots: string[] = [];
  const structure = JSON.stringify(value, function (this: Record<string, unknown>, key, v: unknown) {
    if (SPELLING_KEYS.has(key)) return undefined;
    if (ROOT_KEYS.has(key) && (Array.isArray(v) || typeof v === "string")) {
      const list = typeof v === "string" ? [v] : (v as string[]);
      for (const root of list) {
        roots.push(root);
      }
      return list.length;
    }
    return v;
  });
  return { structure, roots };
}


function tryParse(
  text: string,
  tables: ClassifyTables,
): { shape: Shape; value: unknown } | { error: string; rejection?: string } {
  try {
    const value = parse(fillSelfFor(text, tables).trim(), tables);
    return { shape: shapeOf(value), value };
  } catch (error) {
    const rejection = error instanceof ConstructionError ? error.rejection : undefined;
    return { error: (error instanceof Error ? error.message : String(error)).split("\n")[0]!, rejection };
  }
}

/** A content resume the parser read with no antecedent in the span (it fell back to its stem's lexicon root). */
function hasUnboundResume(value: unknown): boolean {
  const anaphors = (value as { resolve?: { anaphors?: { kind?: string; antecedent?: unknown }[] } }).resolve?.anaphors ?? [];
  return anaphors.some((anaphor) => anaphor.kind === "content" && !anaphor.antecedent);
}

/** Pronouns the resolve pass bound as resumes. */
function anaphorRaws(value: unknown): string[] {
  const anaphors = (value as { resolve?: { anaphors?: { pronoun?: { raw?: string } }[] } }).resolve?.anaphors ?? [];
  return anaphors.map((anaphor) => anaphor.pronoun?.raw ?? "");
}


/** Whole-parse classes; words, templates and fragments are covered by the lint afterwards. */
const CHECKED = new Set(["sentence", "phrase"]);

export function verifyRetiedSpans(
  spans: readonly RetiedSpan[],
  map: ReadonlyMap<string, string>,
  tables: ClassifyTables | RetieTables,
): RetieVerifyFailure[] {
  const { old, current } = asRetieTables(tables);
  const failures: RetieVerifyFailure[] = [];
  for (const span of spans) {
    if (!CHECKED.has(span.cls)) continue;
    const before = tryParse(span.before, old);
    if ("error" in before) continue; // already broken before the retie; the lint reports it
    if (span.after === span.before) {
      // Left as is: fine unless the old reading holds a moved root (not the speaker root filled in
      // for `SELF`, which the site fills from the current lexicon).
      const self = span.before.includes("SELF") ? selfRootIn(old) : undefined;
      const stale = before.shape.roots.find(
        (root) => root !== self && map.has(root) && map.get(root) !== root,
      );
      if (stale) {
        failures.push({ span, level: "blocking", detail: `left unretied, but it reads root ${stale} (now ${map.get(stale)})` });
      }
      continue;
    }
    const after = tryParse(span.after, current);
    if ("error" in after) {
      // A fragment whose resume had no antecedent before either (it cites a word from elsewhere):
      // the respelling follows that word, and the old reading only parsed by matching a lexicon root.
      const unbound = after.rejection === "shortResumeUnbound" && hasUnboundResume(before.value);
      failures.push({
        span,
        level: unbound ? "warning" : "blocking",
        detail: unbound
          ? `resume with no antecedent in the span no longer matches a lexicon root: ${after.error}`
          : `parsed before the retie, not after: ${after.error}`,
      });
      continue;
    }
    const beforeBinds = contentBinds(span.before, old) ?? [];
    const afterBinds = contentBinds(span.after, current) ?? [];
    const drift = bindDrift(beforeBinds, afterBinds, map)[0];
    if (drift) {
      failures.push({
        span,
        level: "blocking",
        detail: `resume ${drift.after.raw} binds ${drift.after.antecedent?.join("x") ?? "nothing"}, expected ${drift.expected.join("x")}`,
      });
      continue;
    }
    if (before.shape.structure !== after.shape.structure) {
      const beforeLinks = anaphorRaws(before.value);
      const afterLinks = anaphorRaws(after.value);
      if (afterLinks.length > beforeLinks.length) {
        failures.push({
          span,
          level: "warning",
          detail: `resume link appeared (${beforeLinks.length} → ${afterLinks.length}: ${afterLinks.join(", ")}); the example may need a different antecedent`,
        });
      } else {
        // With exact old / current lexicons, only mapped roots should differ: any other tree
        // change is a word the retie rebuilt wrong (a dropped emotion tail, a new lateral).
        failures.push({ span, level: "blocking", detail: "parse structure changed beyond the mapped roots" });
      }
      continue;
    }
    const expected = before.shape.roots.map((root) => map.get(root) ?? root);
    const bad = expected.findIndex(
      (root, i) => {
        const was = before.shape.roots[i]!;
        const now = after.shape.roots[i];
        return root !== now;
      },
    );
    if (bad >= 0 || expected.length !== after.shape.roots.length) {
      const i = bad >= 0 ? bad : expected.length;
      failures.push({
        span,
        level: "blocking",
        detail: `root ${before.shape.roots[i] ?? "∅"} became ${after.shape.roots[i] ?? "∅"}, expected ${expected[i] ?? "∅"}`,
      });
    }
  }
  return failures;
}

