/**
 * Morph-reading equivalence for checkpoint **Also correct:** variants
 * (docs/meta/translation-exercises.md#principles, principle 14). Two sentences have the same
 * reading when their parses match after three normalizations:
 * - clause units compare as a set, so a legal reordering matches;
 * - an explicit speech act (`yal`) matches the implied one, so an omitted recoverable `yal` matches;
 * - a bound pronoun (resume **-r**, role pointer, tag, topic) stands for its antecedent in its own slot.
 * Positions (`at`) are dropped.
 */
import type { ClassifyTables } from "../parse/classify.js";
import { parseWithTables } from "../parse/parse-core.js";
import type { LexWord, ParseResult } from "../parse/types.js";

/** The canonical reading of a sentence; throws when it does not parse. */
export function canonicalReading(text: string, tables: ClassifyTables): string {
  const result = parseWithTables(text.normalize("NFC").trim(), tables);
  return canonical(result);
}

export type ReadingCompare = { same: boolean; error?: string };

/** Whether two sentences have the same reading. A parse failure on either side is `same: false` with the error. */
export function compareReadings(a: string, b: string, tables: ClassifyTables): ReadingCompare {
  let left: string;
  let right: string;
  try {
    left = canonicalReading(a, tables);
  } catch (error) {
    return { same: false, error: `${a}: ${firstLine(error)}` };
  }
  try {
    right = canonicalReading(b, tables);
  } catch (error) {
    return { same: false, error: `${b}: ${firstLine(error)}` };
  }
  return { same: left === right };
}

export function sameReading(a: string, b: string, tables: ClassifyTables): boolean {
  return compareReadings(a, b, tables).same;
}

function firstLine(error: unknown): string {
  return (error instanceof Error ? error.message : String(error)).split("\n")[0]!;
}

function canonical(result: ParseResult): string {
  const stands = new Map<object, LexWord>();
  for (const bind of result.resolve?.anaphors ?? []) {
    if (bind.antecedent) stands.set(bind.pronoun, standIn(bind.pronoun, bind.antecedent));
  }
  return key(result.utterances, stands);
}

/** The antecedent written in the pronoun's slot (`dazawar` → `dazawan`). */
function standIn(pronoun: LexWord, antecedent: LexWord): LexWord {
  const from = antecedent.pos ?? "";
  const to = pronoun.pos ?? "";
  const raw = antecedent.raw.startsWith(from) ? to + antecedent.raw.slice(from.length) : antecedent.raw;
  return { ...antecedent, pos: pronoun.pos, raw };
}

function key(value: unknown, stands: ReadonlyMap<object, LexWord>): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value) ?? "null";
  const stood = stands.get(value);
  if (stood) return key(stood, new Map());
  if (Array.isArray(value)) return `[${value.map((v) => key(v, stands)).join(",")}]`;
  const record = { ...(value as Record<string, unknown>) };
  // An explicit force word and the implied one are the same speech act.
  if (isWord(record.force) && record.impliedForce === undefined) {
    record.impliedForce = record.force.raw;
    delete record.force;
  }
  const parts: string[] = [];
  for (const name of Object.keys(record).sort()) {
    if (name === "at" || record[name] === undefined) continue;
    let body: string;
    if (name === "units" && Array.isArray(record[name])) {
      body = `[${(record[name] as unknown[]).map((u) => key(u, stands)).sort().join(",")}]`;
    } else {
      body = key(record[name], stands);
    }
    parts.push(`${JSON.stringify(name)}:${body}`);
  }
  return `{${parts.join(",")}}`;
}

function isWord(value: unknown): value is LexWord {
  return typeof value === "object" && value !== null && typeof (value as LexWord).raw === "string";
}
