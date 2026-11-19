/**
 * Text the retie cannot read. A rejected or reserved form (`gorxahehal`) does not parse, so no
 * rewrite reaches it; when it spells an old root as a letter run it is listed for review, never
 * rewritten (the map's new roots are often other rows' old roots, so a substring rewrite could hit
 * the wrong boundary). Solver encoding (`holds(isa(X, oboza))`) is not Ageben either: there a token
 * that is exactly an old root is a root id and moves.
 */
import { isAgebenLintCandidate } from "../lint/ageben-docs.js";
import { parseWord } from "../parse/word.js";
import { isAgebenRootShape } from "../root-shape.js";

import { retieCore } from "./rebuild.js";
import { forEachPlainChunk, peelChunk, type RetieChange } from "./tokens.js";

export type UnreadableHit = { word: string; index: number; oldRoot: string; newRoot: string };

const OLD_ROOTS = new WeakMap<ReadonlyMap<string, string>, string[]>();

/** The map's old spellings, longest first, so a hit names the longest root a word holds. */
function oldRootsOf(map: ReadonlyMap<string, string>): string[] {
  let olds = OLD_ROOTS.get(map);
  if (!olds) {
    olds = [...map.keys()].filter((root) => /^[a-z]+$/.test(root)).sort((a, b) => b.length - a.length || a.localeCompare(b));
    OLD_ROOTS.set(map, olds);
  }
  return olds;
}

/** The old root a word that looks like Ageben but does not parse spells as a letter run. */
export function unreadableOldRoot(core: string, map: ReadonlyMap<string, string>): string | undefined {
  if (!/[a-z]{3,}/.test(core) || !isAgebenLintCandidate(core)) return undefined;
  // A bare root or dictionary stem (`ebaheha`) moves with the map's own pairs; a PoS letter on a root is rewritten without a parse.
  if (isAgebenRootShape(core) || retieCore(core, map) != null) return undefined;
  try {
    parseWord(core);
    return undefined;
  } catch {
    // a form the word grammar rejects: the retie cannot split it
  }
  return oldRootsOf(map).find((root) => core.includes(root));
}

/** Words in `text` (one code span, line or literal) that spell an old root in a form that does not parse. */
export function unreadableHits(text: string, map: ReadonlyMap<string, string>, baseIndex = 0): UnreadableHit[] {
  const hits: UnreadableHit[] = [];
  forEachPlainChunk(text, baseIndex, (chunk, index) => {
    const { prefix, core } = peelChunk(chunk);
    const oldRoot = core ? unreadableOldRoot(core, map) : undefined;
    if (oldRoot) hits.push({ word: core, index: index + prefix.length, oldRoot, newRoot: map.get(oldRoot)! });
    return chunk;
  });
  return hits;
}

export function unreadableReason(hit: UnreadableHit): string {
  return `spells old root ${hit.oldRoot} (now ${hit.newRoot}) in a form that does not parse`;
}

/** Solver encoding in a code span: a rule (`:-`) or a claim term (`holds(`, `isa(`). */
export function isSolverEncoding(text: string): boolean {
  return /holds\(|isa\(|:-/.test(text);
}

/** Rewrite each lowercase token of solver encoding that is exactly an old root; a root inside a longer token stays. */
export function rewriteEncodingAtoms(
  text: string,
  map: ReadonlyMap<string, string>,
  baseIndex: number,
  changes: RetieChange[],
): string {
  return text.replace(/(?<![A-Za-z0-9_])[a-z]+(?![A-Za-z0-9_])/g, (token: string, offset: number) => {
    const next = map.get(token);
    if (next === undefined || next === token) return token;
    changes.push({ from: token, to: next, index: baseIndex + offset });
    return next;
  });
}
