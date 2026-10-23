/**
 * Letter-slot maps for find `--map` / `--write`: splice series / form / marker /
 * scope / answer / stance / pointer / locus in a parsed word's `raw`, from the original parse.
 */
import type { ClassifyTables } from "../parse/classify.js";
import { unfillSelfChange } from "../learner-name.js";
import { peelWordChunk } from "../parse/peel.js";
import type { LexWord, MorphWord } from "../parse/types.js";
import { reglossMarkdown } from "../regloss.js";
import { reparseSpan, type Example } from "./examples.js";
import {
  formValues,
  locusValue,
  numberStem,
  pointerValue,
  scopeValue,
  seriesValue,
  stanceValue,
} from "./query.js";

export const MAP_FIELDS = ["series", "form", "marker", "scope", "answer", "stance", "pointer", "locus"] as const;
export type MapField = (typeof MAP_FIELDS)[number];

export type FieldMaps = Partial<Record<MapField, Map<string, string>>>;

const MAP_FIELD_SET = new Set<string>(MAP_FIELDS);
const MAP_FIELD_SPLIT = new RegExp(`,(?=(?:${MAP_FIELDS.join("|")})=)`);
const WRITING_MARKER_KEYS = new Set(["#", "_", "+", "-", "#-", "#_", "+-"]);
const SPEECH_MARKERS = ["rue", "ruo", "rua", "roe", "ra", "ru", "re", "ro"] as const;
const WRITING_MARKERS = ["#_", "+-", "#-", "#", "+", "-"] as const;

export type SpliceOutcome =
  | { kind: "same"; raw: string }
  | { kind: "changed"; raw: string }
  | { kind: "fail"; raw: string };

type SlotEdit = { at: number; old: string; next: string };

/** Parse `field=from:to,from:to` (one field, or several fields split on `,field=`). */
export function parseMap(text: string): FieldMaps {
  const maps: FieldMaps = {};
  for (const part of text.split(MAP_FIELD_SPLIT)) {
    const eq = part.indexOf("=");
    if (eq < 0) throw new Error(`bad --map "${part}": expected field=from:to`);
    const field = part.slice(0, eq);
    if (!MAP_FIELD_SET.has(field)) {
      throw new Error(`bad --map field "${field}": expected one of ${MAP_FIELDS.join(", ")}`);
    }
    const pairs = part.slice(eq + 1);
    if (!pairs) throw new Error(`bad --map "${part}": missing from:to`);
    const table = maps[field as MapField] ?? new Map<string, string>();
    for (const pair of pairs.split(",")) {
      const colon = pair.indexOf(":");
      if (colon < 1 || colon === pair.length - 1) {
        throw new Error(`bad --map pair "${pair}": expected from:to`);
      }
      const from = pair.slice(0, colon);
      const to = pair.slice(colon + 1);
      if (field === "marker" && (WRITING_MARKER_KEYS.has(from) || WRITING_MARKER_KEYS.has(to))) {
        throw new Error(`bad --map marker ${from}:${to}: writing glyphs stay on the job; map speech (re, ro, …)`);
      }
      table.set(from, to);
    }
    maps[field as MapField] = table;
  }
  return maps;
}

export function mergeMaps(into: FieldMaps, add: FieldMaps): FieldMaps {
  for (const field of MAP_FIELDS) {
    const extra = add[field];
    if (!extra) continue;
    const table = into[field] ?? new Map<string, string>();
    for (const [from, to] of extra) table.set(from, to);
    into[field] = table;
  }
  return into;
}

function posPrefix(word: MorphWord): string {
  if (!word.pos) return "";
  return word.gl || word.bl ? `${word.pos}l` : word.pos;
}

/** Written extra-noun hook: **-l** is the `x` seam; **-m** / **-r** are letters. */
export function writtenHookForm(hook: string): string {
  const last = hook.at(-1);
  return last === "m" || last === "r" ? hook : hook.slice(0, -1);
}

function mapped(maps: FieldMaps, field: MapField, value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  return maps[field]?.get(value);
}

function partLength(part: string | undefined): number {
  return part === "th" ? 2 : part ? 1 : 0;
}

function readSurfaceMarker(raw: string, at: number, calendar: boolean | undefined): string | undefined {
  const rest = raw.slice(at);
  if (calendar) {
    if (rest.startsWith("_#")) return "_#";
    if (rest.startsWith("roe")) return "roe";
  }
  for (const marker of WRITING_MARKERS) {
    if (rest.startsWith(marker)) return marker;
  }
  for (const marker of SPEECH_MARKERS) {
    if (rest.startsWith(marker)) return marker;
  }
  return undefined;
}

function applyEdits(raw: string, edits: SlotEdit[]): string | null {
  const ordered = [...edits].sort((a, b) => b.at - a.at);
  let out = raw;
  for (const edit of ordered) {
    if (out.slice(edit.at, edit.at + edit.old.length) !== edit.old) return null;
    out = `${out.slice(0, edit.at)}${edit.next}${out.slice(edit.at + edit.old.length)}`;
  }
  return out;
}

function pushMapped(
  edits: SlotEdit[],
  maps: FieldMaps,
  field: MapField,
  value: string | undefined,
  at: number,
  written: string = value ?? "",
): "fail" | "ok" {
  const next = mapped(maps, field, value);
  if (next === undefined || next === value) return "ok";
  if (at < 0) return "fail";
  const nextWritten = field === "form" && value && written !== value ? writtenHookForm(next) : next;
  if (written.length === 0) return "fail";
  edits.push({ at, old: written, next: nextWritten });
  return "ok";
}

function markerStart(word: LexWord): number {
  let at = posPrefix(word).length;
  const { family } = word;
  if (family.kind === "number" && family.writingEndingMark && word.raw[at] === family.writingEndingMark) {
    at += 1;
  }
  return at;
}

function surfaceMarkerOf(word: LexWord): string | undefined {
  const stem = numberStem(word);
  if (!stem) return undefined;
  return readSurfaceMarker(word.raw, markerStart(word), stem.calendarOrdinal);
}

/**
 * Replace mapped letter slots in `word.raw`. Unmapped fields stay. `fail` when a
 * mapped slot is present but cannot be found in `raw`.
 */
export function spliceWord(word: LexWord, maps: FieldMaps): SpliceOutcome {
  const raw = word.raw;
  const { family } = word;
  const edits: SlotEdit[] = [];
  const prefix = posPrefix(word);
  let failed = false;
  const need = (field: MapField, value: string | undefined, at: number, written?: string) => {
    if (pushMapped(edits, maps, field, value, at, written) === "fail") failed = true;
  };

  if (family.kind === "joinMarker") {
    let at = prefix.length;
    if (family.hook) {
      const written = writtenHookForm(family.hook);
      if (raw.slice(at, at + written.length) !== written || raw[at + written.length] !== "x") {
        if (mapped(maps, "series", family.series) && mapped(maps, "series", family.series) !== family.series) {
          failed = true;
        }
        if (mapped(maps, "form", family.hook) && mapped(maps, "form", family.hook) !== family.hook) {
          failed = true;
        }
      } else {
        need("form", family.hook, at, written);
        at += written.length + 1;
      }
    }
    if (raw.slice(at, at + family.series.length) === family.series) {
      need("series", family.series, at);
    } else if (mapped(maps, "series", family.series) && mapped(maps, "series", family.series) !== family.series) {
      failed = true;
    }
  }

  if (family.kind === "hook") {
    const at = raw.indexOf(family.form);
    need("form", family.form, at, family.form);
  }

  if (family.kind === "hookCompound") {
    const at = prefix.length + family.leftRoot.length + family.leftEnding.length;
    if (raw.slice(at, at + family.hook.length) === family.hook) {
      need("form", family.hook, at, family.hook);
    } else if (mapped(maps, "form", family.hook) && mapped(maps, "form", family.hook) !== family.hook) {
      failed = true;
    }
  }

  if (family.kind === "x" && family.hook) {
    const written = writtenHookForm(family.hook);
    const at = prefix.length;
    if (raw.slice(at, at + written.length) === written) {
      need("form", family.hook, at, written);
    } else if (mapped(maps, "form", family.hook) && mapped(maps, "form", family.hook) !== family.hook) {
      failed = true;
    }
  }

  if (word.hookCompound && family.kind !== "hookCompound") {
    const hook = word.hookCompound.hook;
    const at = raw.lastIndexOf(hook);
    if (at >= 0) need("form", hook, at, hook);
  }

  if (family.kind === "say") {
    const at = prefix.length;
    if (raw[at] === "w") {
      const scopeAt = at + 1;
      if (raw.slice(scopeAt, scopeAt + family.scope.length) === family.scope) {
        need("scope", family.scope, scopeAt);
      } else if (mapped(maps, "scope", family.scope) && mapped(maps, "scope", family.scope) !== family.scope) {
        failed = true;
      }
      const answerAt = scopeAt + family.scope.length + 1;
      if (raw.slice(answerAt, answerAt + family.answer.length) === family.answer) {
        need("answer", family.answer, answerAt);
      } else if (mapped(maps, "answer", family.answer) && mapped(maps, "answer", family.answer) !== family.answer) {
        failed = true;
      }
    } else {
      failed = Boolean(
        (mapped(maps, "scope", family.scope) && mapped(maps, "scope", family.scope) !== family.scope) ||
          (mapped(maps, "answer", family.answer) && mapped(maps, "answer", family.answer) !== family.answer),
      );
    }
  }

  if (family.kind === "x") {
    const scope = scopeValue(word);
    const stance = stanceValue(word);
    const pointer = pointerValue(word);
    if ((family.xFamily === "pointer" || family.xFamily === "role") && raw[prefix.length] === "w" && scope) {
      const scopeAt = prefix.length + 1;
      if (raw.slice(scopeAt, scopeAt + scope.length) === scope) need("scope", scope, scopeAt);
      else if (mapped(maps, "scope", scope) && mapped(maps, "scope", scope) !== scope) failed = true;
      if (pointer) {
        const pointerAt = scopeAt + scope.length + partLength(family.part);
        if (raw.slice(pointerAt, pointerAt + pointer.length) === pointer) need("pointer", pointer, pointerAt);
        else if (mapped(maps, "pointer", pointer) && mapped(maps, "pointer", pointer) !== pointer) failed = true;
      }
    }
    if ((family.xFamily === "ability" || family.xFamily === "role") && stance) {
      const seam = raw.lastIndexOf(`x${stance}`);
      if (seam >= 0) need("stance", stance, seam + 1);
      else if (mapped(maps, "stance", stance) && mapped(maps, "stance", stance) !== stance) failed = true;
    }
    if (family.xFamily === "sake" && stance) {
      const at = raw.lastIndexOf(`th${stance}`);
      if (at >= 0) need("stance", stance, at + 2);
      else if (mapped(maps, "stance", stance) && mapped(maps, "stance", stance) !== stance) failed = true;
      const locus = family.locus;
      if (locus && family.horizon) {
        const locusAt = at >= 0 ? at + 2 + stance.length + 1 : -1;
        if (locusAt >= 0 && raw.slice(locusAt, locusAt + locus.length) === locus) need("locus", locus, locusAt);
        else if (mapped(maps, "locus", locus) && mapped(maps, "locus", locus) !== locus) failed = true;
      }
    }
    if (
      (family.xFamily === "scope" || family.xFamily === "hookPrefix" || (family.xFamily === "lateral" && family.landmark)) &&
      scope
    ) {
      const at = raw.lastIndexOf(`th${scope}`);
      if (at >= 0) need("scope", scope, at + 2);
      else if (mapped(maps, "scope", scope) && mapped(maps, "scope", scope) !== scope) failed = true;
    }
    if (family.xFamily === "numeric") {
      const surface = surfaceMarkerOf(word);
      const at = markerStart(word);
      if (surface && raw.slice(at, at + surface.length) === surface) need("marker", surface, at, surface);
      else if (mapped(maps, "marker", surface) && mapped(maps, "marker", surface) !== surface) failed = true;
    }
  }

  if (family.kind === "number") {
    const surface = surfaceMarkerOf(word);
    const at = markerStart(word);
    if (surface && raw.slice(at, at + surface.length) === surface) need("marker", surface, at, surface);
    else if (mapped(maps, "marker", surface) && mapped(maps, "marker", surface) !== surface) failed = true;
  }

  if (failed) return { kind: "fail", raw };
  if (edits.length === 0) return { kind: "same", raw };
  const next = applyEdits(raw, edits);
  if (next === null) return { kind: "fail", raw };
  if (next === raw) return { kind: "same", raw };
  return { kind: "changed", raw: next };
}

export type WordReplacement = { from: string; to: string; position: number };

export function replacePositionCore(text: string, position: number, from: string, to: string): string | null {
  const parts = text.split(/(\s+)/);
  let wordI = 0;
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]!;
    if (part.length === 0 || /^\s+$/.test(part)) continue;
    if (wordI === position) {
      const peeled = peelWordChunk(part);
      const dest = peeled.core === from ? to : unfillSelfChange(peeled.core, from, to);
      if (dest === null) return null;
      parts[i] = `${peeled.prefix}${dest}${peeled.suffix}`;
      return parts.join("");
    }
    wordI += 1;
  }
  return null;
}

export function applySpanPatches(markdown: string, patches: { index: number; length: number; next: string }[]): string {
  const ordered = [...patches].sort((a, b) => b.index - a.index);
  let out = markdown;
  for (const patch of ordered) {
    out = `${out.slice(0, patch.index)}${patch.next}${out.slice(patch.index + patch.length)}`;
  }
  return out;
}

/** Lookup key for a marker map: speech (or calendar) letters in `raw`, not the stored glyph. */
export function markerSurface(word: LexWord): string | undefined {
  return surfaceMarkerOf(word);
}

export type ExampleRewrite = {
  nextSource: string;
  replacements: WordReplacement[];
  reviews: { raw: string; message: string }[];
};

/** Apply maps to highlighted words in one example. Patches `source` (the stored span). */
export function rewriteExample(example: Example, hitIndexes: number[], maps: FieldMaps): ExampleRewrite {
  const reviews: { raw: string; message: string }[] = [];
  const planned: WordReplacement[] = [];
  for (const i of [...new Set(hitIndexes)].sort((a, b) => a - b)) {
    const item = example.words[i];
    if (!item) continue;
    const raw = item.word.raw;
    const outcome = spliceWord(item.word, maps);
    if (item.position < 0) {
      if (outcome.kind !== "same") reviews.push({ raw, message: "word not placed in the span" });
      continue;
    }
    if (outcome.kind === "fail") {
      reviews.push({ raw, message: "could not splice" });
      continue;
    }
    if (outcome.kind === "same") continue;
    planned.push({ from: raw, to: outcome.raw, position: item.position });
  }
  let nextSource = example.source;
  const replacements: WordReplacement[] = [];
  for (const change of [...planned].sort((a, b) => b.position - a.position)) {
    const patched = replacePositionCore(nextSource, change.position, change.from, change.to);
    if (patched === null) {
      reviews.push({ raw: change.from, message: "span text does not hold the parsed word" });
      continue;
    }
    nextSource = patched;
    replacements.push(change);
  }
  return { nextSource, replacements: replacements.sort((a, b) => a.position - b.position), reviews };
}

export type FileRewrite = {
  text: string;
  replacements: WordReplacement[];
  reviews: { raw: string; message: string; line: number }[];
  parseErrors: { span: string; line: number; reason: string }[];
  unplacedGloss: { from: string; to: string; line: number }[];
};

/**
 * Patch spans (from the end of the file), reparse, then regenerate morph lines
 * whose Agebon is one of the new span texts. A span that does not reparse is
 * left as written; other spans in the file still apply.
 */
export function rewriteMarkdownSpans(
  markdown: string,
  patches: { example: Example; nextSource: string }[],
  tables: ClassifyTables,
  checkAmbiguity = false,
): FileRewrite {
  const parseErrors: FileRewrite["parseErrors"] = [];
  const lineOf = (index: number) => markdown.slice(0, index).split("\n").length;
  const applied: { example: Example; nextSource: string }[] = [];
  for (const patch of patches) {
    if (patch.nextSource === patch.example.source) continue;
    const reason = reparseSpan(patch.nextSource, patch.example.cls, tables, checkAmbiguity);
    if (reason) {
      parseErrors.push({ span: patch.nextSource, line: lineOf(patch.example.index), reason });
      continue;
    }
    applied.push(patch);
  }
  const nextTexts = new Set(applied.map((p) => p.nextSource.trim()));
  const text = applySpanPatches(
    markdown,
    applied.map((p) => ({ index: p.example.index, length: p.example.source.length, next: p.nextSource })),
  );
  const regloss = applied.length
    ? reglossMarkdown(text, tables, (pair) => nextTexts.has(pair.agebon.trim()))
    : { text, edits: [], unplaced: [] };
  return {
    text: regloss.text,
    replacements: [],
    reviews: [],
    parseErrors,
    unplacedGloss: regloss.unplaced.map((edit) => ({ from: edit.from, to: edit.to, line: edit.line })),
  };
}

/** Patch literal / TSV bodies in place. No morph follow (that is Markdown-only). */
export function rewritePlainSpans(
  source: string,
  patches: { example: Example; nextSource: string }[],
  tables: ClassifyTables,
  checkAmbiguity = false,
): FileRewrite {
  const parseErrors: FileRewrite["parseErrors"] = [];
  const lineOf = (index: number) => source.slice(0, index).split("\n").length;
  const applied: { example: Example; nextSource: string }[] = [];
  for (const patch of patches) {
    if (patch.nextSource === patch.example.source) continue;
    const reason = reparseSpan(patch.nextSource, patch.example.cls, tables, checkAmbiguity);
    if (reason) {
      parseErrors.push({ span: patch.nextSource, line: lineOf(patch.example.index), reason });
      continue;
    }
    applied.push(patch);
  }
  const text = applySpanPatches(
    source,
    applied.map((p) => ({ index: p.example.index, length: p.example.source.length, next: p.nextSource })),
  );
  return { text, replacements: [], reviews: [], parseErrors, unplacedGloss: [] };
}

/** Current map-field values on a word (marker is the surface spelling). */
export function mapSlot(word: LexWord, field: MapField): string | undefined {
  switch (field) {
    case "series":
      return seriesValue(word);
    case "form":
      return formValues(word)[0];
    case "marker":
      return surfaceMarkerOf(word);
    case "scope":
      return scopeValue(word);
    case "answer":
      return word.family.kind === "say" ? word.family.answer : undefined;
    case "stance":
      return stanceValue(word);
    case "pointer":
      return pointerValue(word);
    case "locus":
      return locusValue(word);
  }
}
