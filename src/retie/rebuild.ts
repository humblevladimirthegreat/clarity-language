import { hookCompoundFromMorph } from "../parse/hook-compounds.js";
import { parseWord } from "../parse/word.js";
import { writingSpanEnd } from "../parse/span-scan.js";
import type { MorphWord, MorphWordFamily, WritingBracket } from "../parse/types.js";
import { isClarityRootShape } from "../root-shape.js";
import {
  isContentResume,
  mappedResumeRoots,
  resumeAntecedentRoots,
  type ResumeScope,
} from "./resume.js";

export type { ResumeScope } from "./resume.js";

const SPAN_CLOSE: Record<WritingBracket, string> = {
  "[": "]",
  "{": "}",
  "(": ")",
  "<": ">",
};

const POS_LETTERS = "zdbvgwhxy";

/** Rewrite one orthographic word. Never substitutes inside a larger token. */
export function retieCore(
  core: string,
  map: ReadonlyMap<string, string>,
  scope?: ResumeScope,
): string | null {
  if (!core || map.size === 0) {
    return null;
  }
  const bare = map.get(core);
  if (bare && isClarityRootShape(core)) {
    return bare === core ? null : bare;
  }
  const posLen = core.startsWith("th") ? 2 : POS_LETTERS.includes(core[0]!) ? 1 : 0;
  if (core.length >= 3 + posLen && posLen > 0) {
    const rest = core.slice(posLen);
    const mappedRest = map.get(rest);
    if (mappedRest && isClarityRootShape(rest) && rest.length >= 3) {
      const next = `${core.slice(0, posLen)}${mappedRest}`;
      return next === core ? null : next;
    }
  }
  try {
    const parsed = parseWord(core);
    return rewriteParsedWord(scope?.reshape?.(parsed) ?? parsed, map, scope);
  } catch {
    return null;
  }
}

function posPrefix(word: MorphWord): string {
  if (!word.pos) {
    return "";
  }
  return word.gl ? `${word.pos}l` : word.pos;
}

function endingAndPlural(word: MorphWord): string {
  return `${word.ending ?? ""}${word.plural ? "x" : ""}`;
}

function mapRoots(roots: string[], map: ReadonlyMap<string, string>): string[] {
  return roots.map((root) => map.get(root) ?? root);
}

function rootsChanged(before: string[], after: string[]): boolean {
  return before.length !== after.length || before.some((root, i) => root !== after[i]);
}

export function rewriteParsedWord(
  word: MorphWord,
  map: ReadonlyMap<string, string>,
  scope?: ResumeScope,
): string | null {
  const hooked = rewriteHookCompound(word, map);
  if (hooked !== undefined) {
    return hooked;
  }
  const family = word.family;
  if (family.kind === "writingSpan") {
    return rewriteWritingSpan(word, family, map, scope);
  }
  if (family.kind === "content") {
    const next = contentRootsAfterResume(word, family.roots, map, scope);
    if (!rootsChanged(family.roots, next)) {
      return null;
    }
    return `${posPrefix(word)}${next.join("x")}${endingAndPlural(word)}`;
  }
  if (family.kind !== "x") {
    return null;
  }
  const left = mapRoots(family.leftRoots, map);
  const right = mapRoots(family.rightRoots ?? [], map);
  const leftChanged = rootsChanged(family.leftRoots, left);
  const rightChanged = rootsChanged(family.rightRoots ?? [], right);
  if (!leftChanged && !rightChanged) {
    return null;
  }
  return rebuildX(word, family, left, family.rightRoots ? right : undefined);
}

/**
 * Fused extra-noun hook compound (`awalalul` = `awala` + **-l** + hook `ul`):
 * only the host root moves. `undefined` when the word is not one.
 */
function rewriteHookCompound(word: MorphWord, map: ReadonlyMap<string, string>): string | null | undefined {
  const parts = hookCompoundFromMorph(word);
  if (!parts) {
    return undefined;
  }
  const whole = word.family.kind === "content" ? word.family.roots[0] : undefined;
  if (whole && map.has(whole)) {
    return undefined; // the whole stem is a mapped root, not a hook compound
  }
  const next = map.get(parts.leftRoot);
  if (!next) {
    return null;
  }
  const prefix = posPrefix(word);
  const rest = word.raw.slice(prefix.length);
  if (!rest.startsWith(parts.leftRoot)) {
    return null;
  }
  return `${prefix}${next}${rest.slice(parts.leftRoot.length)}`;
}

function contentRootsAfterResume(
  word: MorphWord,
  roots: string[],
  map: ReadonlyMap<string, string>,
  scope: ResumeScope | undefined,
): string[] {
  if (isContentResume(word) && !scope?.isOverlay?.(word)) {
    const antecedents = resumeAntecedentRoots(roots, scope, word.raw);
    if (antecedents) {
      return mappedResumeRoots(roots, antecedents, map);
    }
  }
  return mapRoots(roots, map);
}

function rewriteWritingSpan(
  word: MorphWord,
  family: Extract<MorphWordFamily, { kind: "writingSpan" }>,
  map: ReadonlyMap<string, string>,
  scope?: ResumeScope,
): string | null {
  if (family.anaphor || family.bracket === "<") {
    return null;
  }
  const nextPayload = rewriteSpanPayload(family.payload, map, scope);
  if (nextPayload === family.payload) {
    return null;
  }
  return replaceSpanPayload(word.raw, family.bracket, nextPayload);
}

function rewriteSpanPayload(
  payload: string,
  map: ReadonlyMap<string, string>,
  scope?: ResumeScope,
): string {
  let out = "";
  let i = 0;
  while (i < payload.length) {
    if (/\s/.test(payload[i]!)) {
      out += payload[i];
      i += 1;
      continue;
    }
    const spanEnd = writingSpanEnd(payload, i);
    let end = spanEnd ?? i;
    if (spanEnd === undefined) {
      while (end < payload.length && !/\s/.test(payload[end]!)) {
        end += 1;
      }
    }
    let chunk = payload.slice(i, end);
    // An editorial close (`#]`, `#|]`) leaves its `#` / `#|` at the end of the payload.
    const editorial = /#\|?$/.exec(chunk)?.[0] ?? "";
    chunk = chunk.slice(0, chunk.length - editorial.length);
    const nested = scope
      ? { stems: scope.stems, boundFor: scope.boundFor, occurrences: scope.occurrences, at: scope.at, isOverlay: scope.isOverlay, reshape: scope.reshape }
      : undefined;
    out += (retieCore(chunk, map, nested) ?? chunk) + editorial;
    i = end;
  }
  return out;
}

function replaceSpanPayload(raw: string, bracket: WritingBracket, payload: string): string {
  const close = SPAN_CLOSE[bracket];
  const openAt = raw.indexOf(bracket);
  const closeAt = raw.lastIndexOf(close);
  if (openAt < 0 || closeAt <= openAt) {
    return raw;
  }
  return `${raw.slice(0, openAt + 1)}${payload}${raw.slice(closeAt)}`;
}

function rebuildX(
  word: MorphWord,
  family: Extract<MorphWordFamily, { kind: "x" }>,
  left: string[],
  right: string[] | undefined,
): string | null {
  if (family.xFamily === "span") {
    return null;
  }
  // Swap each moved root in place, in order, so everything else in the word (role / stance /
  // locus vowels, emotion horizon, landmark `o`, number stem, ending) stays exactly as written.
  const prefix = posPrefix(word);
  const oldRoots = [...family.leftRoots, ...(family.rightRoots ?? [])];
  const newRoots = [...left, ...(right ?? [])];
  let rest = word.raw.slice(prefix.length);
  let out = "";
  for (let i = 0; i < oldRoots.length; i++) {
    const at = rest.indexOf(oldRoots[i]!);
    if (at < 0) {
      return null;
    }
    out += rest.slice(0, at) + newRoots[i]!;
    rest = rest.slice(at + oldRoots[i]!.length);
  }
  return `${prefix}${out}${rest}`;
}
