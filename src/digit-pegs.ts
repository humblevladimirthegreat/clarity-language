/**
 * Digit pegs: a published root's consonants spell digits with the same onsets as the spoken digit
 * syllables (`b d g v z h l r n m` = 1–9, 0). Vowels and the fillers `w` / `y` are silent, and so is
 * everything outside the root (role letter, ending, codas, seams). Shared by the CLI
 * (src/pegs/cli.ts) and the Number Pegs page (docs/grammar/pegs.md).
 */
import type { PublishedRow } from "./lexicon-search.ts";
import type { LexWord } from "./parse/types.ts";
import { PLACE_KIND } from "./root-tails.ts";
import { NUMBER_SYLLABLES } from "./tts/numbers.ts";

/** Onset → digit, read off the digit syllables (numbers.md#counts). */
export const ONSET_DIGITS: ReadonlyMap<string, string> = new Map(
  Object.entries(NUMBER_SYLLABLES.digits).map(([digit, syllable]) => [syllable[0]!, digit]),
);

/** The digits a root stem spells: its onset letters in order. Empty when the root carries no digit. */
export function rootPayload(root: string): string {
  let digits = "";
  for (const letter of root) digits += ONSET_DIGITS.get(letter) ?? "";
  return digits;
}

export type Peg = { root: string; emoji: string; concrete: string; core: boolean };

/** Payload (one or two digits) → roots, best first. */
export type PegBank = Map<string, Peg[]>;

function pegRank(peg: Peg): number {
  if (peg.core) return 0;
  return peg.root.length === 5 ? 1 : 2;
}

/** Every one- and two-digit cell from the published three- and five-letter roots; place-name roots stay out. */
export function pegBank(rows: readonly PublishedRow[]): PegBank {
  const bank: PegBank = new Map();
  for (const row of rows) {
    if (row.kind === PLACE_KIND || (row.root.length !== 3 && row.root.length !== 5)) continue;
    const payload = rootPayload(row.root);
    if (payload.length < 1 || payload.length > 2) continue;
    const cell = bank.get(payload) ?? [];
    cell.push({ root: row.root, emoji: row.emoji, concrete: row.concrete, core: Boolean(row.core) });
    bank.set(payload, cell);
  }
  for (const cell of bank.values()) cell.sort((a, b) => pegRank(a) - pegRank(b) || a.concrete.localeCompare(b.concrete));
  return bank;
}

/** All 0–9 and 00–99 cells. */
export function pegCells(): string[] {
  const digits = [..."1234567890"];
  return [...digits, ...digits.flatMap((first) => digits.map((second) => first + second))];
}

/** Cells with no root: a respelling that empties one should be caught. */
export function emptyCells(bank: PegBank): string[] {
  return pegCells().filter((cell) => !bank.get(cell)?.length);
}

/**
 * Cut a digit string into peg chunks: each separator group (`,` space `-` `.` …) into twos,
 * so an odd group ends in a one-digit chunk (`555` → `55 5`).
 */
export function chunkDigits(input: string): string[] {
  return input
    .split(/\D+/)
    .filter(Boolean)
    .flatMap((group) => group.match(/\d\d?/g) ?? []);
}

/** True when the input is only digits and separators. */
export function isDigitInput(input: string): boolean {
  return /\d/.test(input) && !/[a-z]/i.test(input);
}

export type ChunkPegs = { chunk: string; pegs: Peg[] };

export function suggestPegs(input: string, bank: PegBank): ChunkPegs[] {
  return chunkDigits(input).map((chunk) => ({ chunk, pegs: bank.get(chunk) ?? [] }));
}

export type WordDigits =
  | { raw: string; roots: string[]; digits: string }
  | { raw: string; notPeg: string };

/**
 * The digits one classified word spells. Only ordinary content words and `x` compounds are pegs:
 * the parser has already dropped the role letter, the ending and the codas, and a compound's
 * parts are read left to right. Number words, pronouns and other grammar words are not pegs.
 */
export function wordDigits(word: LexWord): WordDigits {
  const { raw, family } = word;
  if (word.reading === "number" || family.kind === "number") return { raw, notPeg: "number word: read it as a number" };
  if (word.reading === "unknown") return { raw, notPeg: "not a lexicon word" };
  let roots: string[] | undefined;
  if (word.reading === "ordinary" && family.kind === "content") roots = family.roots;
  else if (word.reading === "ordinary" && family.kind === "x" && family.xFamily === "compound") roots = [...family.leftRoots, ...(family.rightRoots ?? [])];
  if (!roots) return { raw, notPeg: "grammar word: read it as grammar" };
  const digits = roots.map(rootPayload).join("");
  if (!digits) return { raw, notPeg: "carries no digit (only fillers)" };
  return { raw, roots, digits };
}
