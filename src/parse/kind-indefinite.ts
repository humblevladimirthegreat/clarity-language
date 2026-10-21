/**
 * Kind indefinites ([joins.md § Kind indefinites](../../docs/grammar/joins.md#kind-indefinites)): role letter + `w` +
 * knowledge vowel + kind letter + a standalone join's vowel(s) + ending (`zwuyar`, `zweyual`, `vwovar`, `hweral`).
 * The facts enforce, resolve, and the morph gloss read, written once.
 */
import { KIND_LETTERS } from "../root-tails.js";
import type { KnowledgeVowel, MorphWord } from "./types.js";

export type KindIndefiniteFamily = { kind: "kindIndefinite"; knowledge: KnowledgeVowel; kindLetter: string; series: string };

export function kindIndefiniteFamily(word: MorphWord): KindIndefiniteFamily | undefined {
  return word.family.kind === "kindIndefinite" ? word.family : undefined;
}

/** Slots a kind indefinite fills: the noun slots, where the speaker picks the kind, and `/v/` / `/h/`, where the slot fixes it. */
export const KIND_INDEFINITE_POS = new Set(["z", "d", "b", "v", "h"]);

/** The kind letter `/v/` and `/h/` fix: doing on `/v/`, counting and time on `/h/`. */
export const FIXED_KIND_LETTER: Readonly<Record<string, string>> = { v: "v", h: "r" };

/** The join vowels **-r** takes: one vowel, as on a join **-r** (`…ar` / `…or` / `…er` / `…ur`). */
export const ONE_SERIES = new Set(["a", "o", "e", "u"]);

/** On `/h/`, the bare restrictors: *never*, *always*, and the unspecified occasions (restrictors.md#always-and-never-h). */
export const H_SHAPES = new Set(["al", "am", "ual", "uam", "ar", "or", "ur", "er"]);

/** Kind letter → kind name (`y` → `person`), from the root-tail chart (compounds.md#root-tails). Built lazily: root-tails.ts imports classify.ts. */
let kindNames: Map<string, string> | undefined;

export function kindName(letter: string): string {
  kindNames ??= new Map(Object.entries(KIND_LETTERS).map(([kind, kindLetter]) => [kindLetter, kind]));
  return kindNames.get(letter) ?? letter;
}

/** **-r**: who knows which one. */
const ONE_KNOWLEDGE: Record<KnowledgeVowel, string> = { a: "unpicked", u: "unknown", o: "withheld", e: "shared" };
/** **-l** / **-m**: which set the claim covers. */
const SET_KNOWLEDGE: Record<KnowledgeVowel, string> = { a: "anywhere", u: "here", o: "meant", e: "shared" };

/** The knowledge vowel's gloss label: who knows which one on **-r**, which set on **-l** / **-m**. */
export function knowledgeLabel(knowledge: KnowledgeVowel, ending: string | undefined): string {
  return ending === "r" ? ONE_KNOWLEDGE[knowledge] : SET_KNOWLEDGE[knowledge];
}
