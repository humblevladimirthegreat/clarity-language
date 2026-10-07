/**
 * Morph-reading equivalence for checkpoint **Also correct:** variants
 * (docs/meta/translation-exercises.md#principles, principle 14), and the "reads differently" check on
 * **Pick one** and **Fix it**. Two sentences have the same reading when their parses match after three
 * normalizations:
 * - clause units compare as a set of segments, so a legal reordering matches. A hook stays glued to the
 *   `/b/` it introduces (and, for an in-clause or range hook, to the word on its left), and `/h/` words,
 *   linkers and free-standing hooks keep their relative order;
 * - an explicit speech act (`yal`) matches the implied one, so an omitted recoverable `yal` matches;
 * - a bound pronoun names its referent: a resume, role pointer, tag or topic in **-r** reads as *the one
 *   first mentioned there*, so a pointer and a resume to the same one match, but a fresh noun does not.
 *   **-l** reads as the antecedent written out (pronouns.md#a-new-one); **-m** as a share of the referent;
 *   a role compound keeps its role vowel.
 * Positions (`at`) are dropped.
 */
import type { ClassifyTables } from "../parse/classify.js";
import { parseWithTables } from "../parse/parse-core.js";
import type { AnaphorBind, LexWord, ParseResult, Unit } from "../parse/types.js";

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
  const binds = new Map<object, AnaphorBind>();
  for (const bind of result.resolve?.anaphors ?? []) {
    if (bind.antecedent) binds.set(bind.pronoun, bind);
  }
  const utteranceOf = new Map<object, number>();
  result.utterances.forEach((utterance, index) => collectWords(utterance, (word) => utteranceOf.set(word, index)));
  const stands = new Map<object, unknown>();
  const referent = (word: LexWord): string => {
    const bind = binds.get(word);
    if (bind && word.ending === "r") return referent(bind.antecedent!);
    return `${utteranceOf.get(word) ?? "?"}:${key(stands.get(word) ?? word, stands)}`;
  };
  for (const bind of binds.values()) stands.set(bind.pronoun, standIn(bind, referent));
  return key(result.utterances, stands);
}

/** What a bound pronoun stands for in its own slot. */
function standIn(bind: AnaphorBind, referent: (word: LexWord) => string): unknown {
  const { pronoun, antecedent } = bind as AnaphorBind & { antecedent: LexWord };
  // A new one of the kind the pointer reaches is the noun written out (`duxal` = `dugugol`).
  if (pronoun.ending === "l" && bind.kind !== "role") {
    const from = antecedent.pos ?? "";
    const raw = antecedent.raw.startsWith(from) ? (pronoun.pos ?? "") + antecedent.raw.slice(from.length) : antecedent.raw;
    return { ...antecedent, pos: pronoun.pos, raw };
  }
  const refs = (bind.antecedents ?? [antecedent]).map(referent);
  return {
    standIn: pronoun.pos ?? "",
    ending: pronoun.ending === "r" ? undefined : pronoun.ending,
    sense: pronoun.resumeSense,
    plural: pronoun.plural,
    // A role compound names one part of the event; a role pointer already reaches the participant.
    role: bind.kind === "role" || pronoun.ending === "m" ? bind.roleVowel : undefined,
    refs,
  };
}

function collectWords(value: unknown, add: (word: LexWord) => void): void {
  if (value === null || typeof value !== "object") return;
  if (Array.isArray(value)) return value.forEach((v) => collectWords(v, add));
  if (isWord(value)) add(value);
  for (const child of Object.values(value)) collectWords(child, add);
}

function key(value: unknown, stands: ReadonlyMap<object, unknown>): string {
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
    const body = name === "units" && Array.isArray(record[name]) ? unitsKey(record[name] as Unit[], stands) : key(record[name], stands);
    parts.push(`${JSON.stringify(name)}:${body}`);
  }
  return `{${parts.join(",")}}`;
}

/** Hook jobs whose hook belongs with the word after it, and with the word before it. */
const GLUE_RIGHT = new Set(["extraNoun", "genitive", "stray", "span", "clause"]);
const GLUE_LEFT = new Set(["genitive", "span", "clause"]);

/**
 * Clause units as segments: free segments compare as a set (legal reordering), ordered ones
 * (`/h/` words, linkers, free-standing hooks) in sequence, since their order can carry meaning
 * (restrictors.md, `huel`).
 */
function unitsKey(units: readonly Unit[], stands: ReadonlyMap<object, unknown>): string {
  const segments: Unit[][] = [];
  let glueNext = false;
  for (const unit of units) {
    const hook = unit.kind === "hook" ? unit : undefined;
    const glueLeft = hook !== undefined && (hook.onLeft === true || GLUE_LEFT.has(hook.job ?? ""));
    if ((glueNext || glueLeft) && segments.length > 0) segments.at(-1)!.push(unit);
    else segments.push([unit]);
    glueNext = hook !== undefined && GLUE_RIGHT.has(hook.job ?? "");
  }
  const free: string[] = [];
  const ordered: string[] = [];
  for (const segment of segments) {
    const body = `[${segment.map((u) => key(u, stands)).join(",")}]`;
    if (segment.length === 1 && isOrdered(segment[0]!)) ordered.push(body);
    else free.push(body);
  }
  return `{"free":[${free.sort().join(",")}],"ordered":[${ordered.join(",")}]}`;
}

function isOrdered(unit: Unit): boolean {
  return unit.kind === "h" || unit.kind === "linker" || unit.kind === "hook";
}

function isWord(value: unknown): value is LexWord {
  return typeof value === "object" && value !== null && typeof (value as LexWord).raw === "string";
}
