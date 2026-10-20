import { hookCompoundFromMorph, parseHookCompoundCite } from "../parse/hook-compounds.js";
import { peelWordChunk } from "../parse/peel.js";
import { parseWord } from "../parse/word.js";
import { writingSpanEnd } from "../parse/span-scan.js";
import type { MorphWord, MorphWordFamily, WritingBracket } from "../parse/types.js";
import { isEgabonRootShape } from "../root-shape.js";
import type { ResumeScope } from "./resume.js";

export type { ResumeScope } from "./resume.js";

const SPAN_CLOSE: Record<WritingBracket, string> = {
  "[": "]",
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
  if (bare && isEgabonRootShape(core)) {
    return bare === core ? null : bare;
  }
  const posLen = core.startsWith("th") ? 2 : POS_LETTERS.includes(core[0]!) ? 1 : 0;
  if (core.length >= 3 + posLen && posLen > 0) {
    const rest = core.slice(posLen);
    const mappedRest = map.get(rest);
    if (mappedRest && isEgabonRootShape(rest) && rest.length >= 3) {
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
    const next = family.roots.map((root) => map.get(root) ?? hookResumeStem(word, root, map) ?? root);
    if (!rootsChanged(family.roots, next)) {
      return null;
    }
    // Spliced into the raw word, so fields the rebuild does not list (a resume's -rl / -rm sense) stay.
    return spliceRoots(word, family.roots, next);
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


/** A hook-compound resume spells the whole stem (`vowogalar` of *enter*): its left root moves. */
function hookResumeStem(word: MorphWord, stem: string, map: ReadonlyMap<string, string>): string | undefined {
  if (word.ending !== "r") return undefined;
  const parts = parseHookCompoundCite(`${stem}l`);
  const next = parts && map.get(parts.leftRoot);
  return next ? `${next}${stem.slice(parts.leftRoot.length)}` : undefined;
}

function rewriteWritingSpan(
  word: MorphWord,
  family: Extract<MorphWordFamily, { kind: "writingSpan" }>,
  map: ReadonlyMap<string, string>,
  scope?: ResumeScope,
): string | null {
  // An opaque `<…>` payload is foreign text, never Egabon (spans.md#loans).
  if (family.bracket === "<") {
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
    // A cite can hold several sentences (`d[zolozun vezeyol. zehalon voworel.]`): peel each word's
    // punctuation and tone mark as the page tokenizer does, or a word before a period stays stale.
    const { prefix, core, suffix } = spanEnd === undefined ? peelWordChunk(chunk) : { prefix: "", core: chunk, suffix: "" };
    out += prefix + (retieCore(core, map, scope) ?? core) + suffix + editorial;
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
  return spliceRoots(word, [...family.leftRoots, ...(family.rightRoots ?? [])], [...left, ...(right ?? [])]);
}

/**
 * Swap each moved root in place, in order, so everything else in the word (role / stance /
 * locus vowels, emotion horizon, landmark `o`, number stem, ending, resume sense) stays exactly as written.
 */
function spliceRoots(word: MorphWord, oldRoots: string[], newRoots: string[]): string | null {
  const prefix = posPrefix(word);
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
