/**
 * The closed set of `/x/` sentence linkers ([dependents.md § Sentence linkers](../../docs/grammar/dependents.md#sentence-linkers)).
 * Keyed by root + ending: **-m** is the default link (the root's abstract sense), **-l** a firm link
 * where one is taught. **-r** is the ordinary resume and **-n** an agenda label, so neither is listed.
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
