/**
 * The closed set of `/x/` sentence linkers ([dependents.md § Sentence linkers](../../docs/grammar/dependents.md#sentence-linkers)).
 * Keyed by root + ending: **-m** is the default link (the root's abstract sense), **-l** a firm link
 * where one is taught. Every other `/x/` content word sets the topic (pronouns.md#topic): **-l** / **-m** / **-n**
 * introduce it and **-r** returns to it, so none of those is listed.
 */
import { CLOSED } from "../closed-roots.js";
import type { LexWord } from "./types.js";

export const LINKER_ENGLISH: Record<string, string> = {
  [`${CLOSED.east}m`]: "therefore",
  [`${CLOSED.east}l`]: "it-follows",
  [`${CLOSED.zebra}m`]: "however",
  [`${CLOSED.zebra}l`]: "nevertheless",
  [`${CLOSED.clock}m`]: "meanwhile",
  [`${CLOSED.film}m`]: "next",
  [`${CLOSED.construction}m`]: "but",
  [`${CLOSED.construction}l`]: "on-the-contrary",
  [`${CLOSED.fries}m`]: "by-the-way",
};

/** English tag of a published linker, or undefined when this `/x/` word is not one. */
export function linkerEnglish(word: LexWord): string | undefined {
  if (word.pos !== "x" || word.family.kind !== "content" || word.family.roots.length !== 1) return undefined;
  return LINKER_ENGLISH[word.family.roots[0]! + word.ending];
}

/** The two published linkers that clear the topic (*next*, *by the way*): each opens a new frame (pronouns.md#topic). */
export const CLEARING_LINKERS: ReadonlySet<string> = new Set([`${CLOSED.film}m`, `${CLOSED.fries}m`]);

/** What a `/x/` content word does to the topic (pronouns.md#topic); `none` for the other published linkers. */
export type TopicEffect = "introduce" | "return" | "clear" | "none";

/**
 * The topic effect of a `/x/` content word read on its own. A **-r** word is `return` here; the resolver
 * downgrades it to `none` when it resumes a published linker (`xodur` after `xodum`: *likewise*).
 */
export function topicEffect(word: LexWord): TopicEffect {
  if (word.pos !== "x" || word.family.kind !== "content") return "none";
  const root = word.family.roots.length === 1 ? word.family.roots[0]! : undefined;
  if (root !== undefined && CLEARING_LINKERS.has(root + word.ending)) return "clear";
  if (linkerEnglish(word)) return "none";
  return word.ending === "r" ? "return" : "introduce";
}
