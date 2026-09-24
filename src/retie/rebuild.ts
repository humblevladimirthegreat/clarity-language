import { parseWord } from "../parse/word.js";
import { writingSpanEnd } from "../parse/span-scan.js";
import type { MorphWord, MorphWordFamily, WritingBracket } from "../parse/types.js";
import { isClarityRootShape } from "../word-converter.js";
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

const POS_LETTERS = "zdbvgwhxj";

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
    return rewriteParsedWord(parseWord(core), map, scope);
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

function contentRootsAfterResume(
  word: MorphWord,
  roots: string[],
  map: ReadonlyMap<string, string>,
  scope: ResumeScope | undefined,
): string[] {
  if (isContentResume(word)) {
    const antecedents = resumeAntecedentRoots(roots, scope);
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
    const chunk = payload.slice(i, end);
    const nested = scope ? { stems: scope.stems } : undefined;
    out += retieCore(chunk, map, nested) ?? chunk;
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
  const prefix = posPrefix(word);
  const tail = endingAndPlural(word);
  switch (family.xFamily) {
    case "span":
      return null;
    case "role": {
      const host = right?.[0] ?? "";
      if (!family.roleVowel || !host) {
        return null;
      }
      return `${prefix}${family.roleVowel}x${host}${tail}`;
    }
    case "value":
    case "ability": {
      if (!family.stanceVowel || left.length === 0) {
        return null;
      }
      const hinge = family.xFamily === "value" ? "th" : "x";
      return `${prefix}${left.join("x")}${hinge}${family.stanceVowel}${tail}`;
    }
    case "lateral": {
      const rightParts = right ?? [];
      if (left.length !== 1 || rightParts.length === 0) {
        return null;
      }
      return `${prefix}${left[0]}th${rightParts.join("x")}${tail}`;
    }
    case "numeric": {
      const oldHost = family.leftRoots[0] ?? "";
      const newHost = left[0] ?? "";
      if (!oldHost || !newHost) {
        return null;
      }
      const afterPrefix = word.raw.slice(prefix.length);
      if (!afterPrefix.startsWith(oldHost)) {
        return null;
      }
      return `${prefix}${newHost}${afterPrefix.slice(oldHost.length)}`;
    }
    case "compound": {
      const rightParts = right ?? [];
      if (left.length === 0 || rightParts.length === 0) {
        return null;
      }
      return `${prefix}${left.join("x")}x${rightParts.join("x")}${tail}`;
    }
    default:
      return null;
  }
}
