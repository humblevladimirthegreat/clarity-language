/**
 * Before/after check for a retie: a rewritten sentence or phrase must parse the same way,
 * with only mapped roots changed.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { parseCompoundCsv, retieCompoundRows } from "../lexicon-compounds.js";
import { parseOverlayCsv, parsePublishedCsv } from "../lexicon-search.js";
import { createClassifyTablesFromRows, type ClassifyTables } from "../parse/classify.js";
import { parse } from "../parse/index.js";

import type { RetiedSpan } from "./markdown.js";

export type RetieVerifyLevel = "blocking" | "warning" | "info";

export type RetieVerifyFailure = {
  span: RetiedSpan;
  detail: string;
  /** `warning` is a new resume link. `info` is any other tree change. Neither blocks. */
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

type Shape = { structure: string; roots: string[]; resume: boolean[] };

function shapeOf(value: unknown): Shape {
  const roots: string[] = [];
  const resume: boolean[] = [];
  let ending: unknown;
  const structure = JSON.stringify(value, function (this: Record<string, unknown>, key, v: unknown) {
    if (key === "family") ending = this.ending;
    if (SPELLING_KEYS.has(key)) return undefined;
    if (ROOT_KEYS.has(key) && (Array.isArray(v) || typeof v === "string")) {
      const list = typeof v === "string" ? [v] : (v as string[]);
      for (const root of list) {
        roots.push(root);
        resume.push(ending === "r");
      }
      return list.length;
    }
    return v;
  });
  return { structure, roots, resume };
}

function tryParse(text: string, tables: ClassifyTables): { shape: Shape; value: unknown } | { error: string } {
  try {
    const value = parse(text.trim(), tables);
    return { shape: shapeOf(value), value };
  } catch (error) {
    return { error: (error instanceof Error ? error.message : String(error)).split("\n")[0]! };
  }
}

/** Pronouns the resolve pass bound as resumes. */
function anaphorRaws(value: unknown): string[] {
  const anaphors = (value as { resolve?: { anaphors?: { pronoun?: { raw?: string } }[] } }).resolve?.anaphors ?? [];
  return anaphors.map((anaphor) => anaphor.pronoun?.raw ?? "");
}

/** A short resume stem respelled from its moved antecedent (`aza` → `ulu` after `azawa` → `ululo`). */
function resumeRespelled(before: string, after: string | undefined, map: ReadonlyMap<string, string>): boolean {
  if (!after || after.length !== before.length) return false;
  for (const [oldRoot, newRoot] of map) {
    if (oldRoot.startsWith(before) && newRoot.startsWith(after)) return true;
  }
  return false;
}

/** Whole-parse classes; words, templates and fragments are covered by the lint afterwards. */
const CHECKED = new Set(["sentence", "phrase"]);

/**
 * Lexicon tables that know every root under both its old and its new spelling,
 * so the before and after text classify the same way whether or not
 * `convert-word --lexicon` has already rewritten the CSVs.
 */
export function bridgeTables(map: ReadonlyMap<string, string>, rootDir = defaultRootDir()): ClassifyTables {
  const data = (name: string) => readFileSync(join(rootDir, "data", name), "utf8");
  const published = parsePublishedCsv(data("lexicon-published.csv"));
  const overlays = parseOverlayCsv(data("lexicon-overlays.csv"));
  const compounds = parseCompoundCsv(data("lexicon-compounds.csv"));
  const reverse = new Map([...map].map(([oldRoot, newRoot]) => [newRoot, oldRoot]));

  const roots = new Set(published.map((row) => row.clarity));
  const senseForms = new Set(overlays.map((row) => `${row.pos} ${row.senseForm}`));
  const extraPublished = [];
  const extraOverlays = [];
  for (const pairs of [map, reverse]) {
    for (const [from, to] of pairs) {
      const row = published.find((r) => r.clarity === from);
      if (row && !roots.has(to)) extraPublished.push({ ...row, clarity: to });
      for (const overlay of overlays) {
        if (!overlay.senseForm.startsWith(from)) continue;
        const senseForm = to + overlay.senseForm.slice(from.length);
        if (!senseForms.has(`${overlay.pos} ${senseForm}`)) extraOverlays.push({ ...overlay, senseForm });
      }
    }
  }
  const extraCompounds = [map, reverse].flatMap((pairs) =>
    retieCompoundRows(compounds, pairs).rows.filter((row, i) => row.stem !== compounds[i]!.stem),
  );
  return createClassifyTablesFromRows(
    [...published, ...extraPublished],
    [...overlays, ...extraOverlays],
    [...compounds, ...extraCompounds],
  );
}

function defaultRootDir(): string {
  return join(dirname(fileURLToPath(import.meta.url)), "..", "..");
}

export function verifyRetiedSpans(
  spans: readonly RetiedSpan[],
  map: ReadonlyMap<string, string>,
  tables: ClassifyTables,
): RetieVerifyFailure[] {
  const failures: RetieVerifyFailure[] = [];
  for (const span of spans) {
    if (!CHECKED.has(span.cls)) continue;
    const before = tryParse(span.before, tables);
    if ("error" in before) continue; // already broken before the retie; the lint reports it
    const after = tryParse(span.after, tables);
    if ("error" in after) {
      failures.push({ span, level: "blocking", detail: `parsed before the retie, not after: ${after.error}` });
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
        failures.push({ span, level: "info", detail: "parse structure changed" });
      }
      continue;
    }
    const expected = before.shape.roots.map((root) => map.get(root) ?? root);
    const bad = expected.findIndex(
      (root, i) => {
        const was = before.shape.roots[i]!;
        const now = after.shape.roots[i];
        if (root === now) return false;
        // A short resume follows its antecedent, which may not be the mapped root it happens to spell.
        return !(before.shape.resume[i] && (now === was || resumeRespelled(was, now, map)));
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
