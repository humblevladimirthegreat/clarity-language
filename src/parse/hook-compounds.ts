import { isAgazanRootShape } from "../root-shape.js";

import type { MorphWord } from "./types.js";

/** Extra-noun hook spellings (stacked vowels before simplex). */
export const EXTRA_NOUN_HOOKS = [
  "aol",
  "aom",
  "ael",
  "aem",
  "oel",
  "oem",
  "ual",
  "uam",
  "uol",
  "uom",
  "uel",
  "uem",
  "al",
  "am",
  "ol",
  "om",
  "el",
  "em",
  "ul",
  "um",
] as const;

export type ExtraNounHook = (typeof EXTRA_NOUN_HOOKS)[number];

const HOOK_SET = new Set<string>(EXTRA_NOUN_HOOKS);

/** Derived event kind for a fused extra-noun hook (**-l** exact / **-m** frame). */
export const HOOK_DERIVED_GLOSS: Record<ExtraNounHook, string> = {
  al: "enter",
  am: "mill-amid",
  aol: "mount",
  aom: "cover",
  ol: "attend",
  om: "adjoin",
  oel: "head-for",
  oem: "orient",
  ul: "leave",
  um: "recede",
  ual: "exit",
  uam: "pick-out",
  uol: "traverse",
  uom: "relay",
  el: "serve",
  em: "have-in-use",
  ael: "wield",
  aem: "channel",
  uel: "oppose",
  uem: "defy",
};

export type HookCompoundParts = {
  leftRoot: string;
  leftEnding: "l" | "m";
  hook: ExtraNounHook;
  /** Citation stem: left root + left ending + hook (no role letter). */
  stem: string;
};

export function isExtraNounHook(form: string): form is ExtraNounHook {
  return HOOK_SET.has(form);
}

export function derivedHookGloss(hook: ExtraNounHook): string {
  return HOOK_DERIVED_GLOSS[hook];
}

/**
 * Split a prefix-less citation (`awalalul`) into published-shaped left + extra-noun hook, by shape alone.
 * A five-letter root with **l** / **m** second spells the same letters, so a reading goes through
 * {@link readHookCompound}, which asks the lexicon.
 */
export function parseHookCompoundCite(cite: string): HookCompoundParts | null {
  if (cite.endsWith("x")) {
    cite = cite.slice(0, -1);
  }
  for (const hook of EXTRA_NOUN_HOOKS) {
    if (!cite.endsWith(hook) || cite.length < hook.length + 4) continue;
    const leftCite = cite.slice(0, -hook.length);
    const leftEnding = leftCite.at(-1);
    if (leftEnding !== "l" && leftEnding !== "m") continue;
    const leftRoot = leftCite.slice(0, -1);
    if (!isAgazanRootShape(leftRoot) || leftRoot.length < 3) continue;
    return { leftRoot, leftEnding, hook, stem: `${leftRoot}${leftEnding}${hook}` };
  }
  return null;
}

export function hookCompoundFromMorph(word: MorphWord): HookCompoundParts | null {
  if (word.family.kind === "hookCompound") {
    const hook = word.family.hook;
    if (!isExtraNounHook(hook)) return null;
    return {
      leftRoot: word.family.leftRoot,
      leftEnding: word.family.leftEnding,
      hook,
      stem: `${word.family.leftRoot}${word.family.leftEnding}${hook}`,
    };
  }
  if (word.family.kind !== "content" || word.family.roots.length !== 1) return null;
  const ending = word.ending;
  if (ending !== "l" && ending !== "m") return null;
  const root = word.family.roots[0]!;
  return parseHookCompoundCite(root + ending);
}

/**
 * A hook compound as the lexicon reads it (hooks.md#hook-compounds): the left piece is a dictionary root,
 * and the whole stem is not one. `VCV l Vl` is either a five-letter root + ending or a three-letter root +
 * hook, and placement keeps only one of them in the lexicon.
 */
export function readHookCompound(word: MorphWord, isRoot: (root: string) => boolean): HookCompoundParts | null {
  const parts = hookCompoundFromMorph(word);
  if (!parts || !isRoot(parts.leftRoot)) return null;
  if (word.family.kind === "content" && isRoot(word.family.roots[0]!)) return null;
  return parts;
}
