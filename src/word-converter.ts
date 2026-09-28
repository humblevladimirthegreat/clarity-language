import { lookupPronunciation } from "./cmu-dict.ts";
import { echo } from "./echo-metric.ts";
import { PHONEME_MAP } from "./pronunciation-map.ts";
import { CLARITY_CONSONANTS, CLARITY_VOWELS, isClarityRootShape } from "./root-shape.ts";

export { CLARITY_CONSONANTS, CLARITY_VOWELS, isClarityRootShape };

const VOWEL_LETTERS = new Set(["a", "e", "i", "o", "u", "y"]);

const VOWEL_REMAP: Record<string, string> = {
  a: "a",
  e: "e",
  i: "u",
  o: "o",
  u: "u",
  y: "o",
};

const CONSONANT_REMAP: Record<string, string> = {
  b: "b",
  d: "d",
  g: "g",
  v: "v",
  z: "z",
  m: "m",
  n: "n",
  h: "h",
  w: "w",
  j: "y",
  l: "l",
  r: "r",
  p: "b",
  t: "d",
  k: "g",
  c: "g",
  q: "g",
  f: "v",
  s: "z",
  x: "z",
};

const DIGIT_TO_LETTER: Record<string, string> = {
  "0": "o",
  "1": "i",
  "2": "a",
  "3": "e",
  "4": "a",
  "5": "e",
  "6": "o",
  "7": "u",
  "8": "o",
  "9": "u",
};

const MAX_ROOT_LENGTH = 5;

/** Consonants the pronunciation generator may write. */
const GENERATED_CONSONANTS = ["b", "d", "g", "h", "y", "l", "m", "n", "r", "v", "w", "z"] as const;
const SECOND_CONSONANT_BAN = new Set(["l", "m", "n", "r"]);
const STOPS = new Set(["b", "d", "g"]);

function normalizeInput(input: string): string {
  const expanded = input
    .toLowerCase()
    .replace(/[0-9]/g, (digit) => DIGIT_TO_LETTER[digit] ?? digit);
  const letters = expanded.replace(/[^a-z]/g, "");
  if (letters.length === 0) {
    throw new Error("Input must contain at least one letter");
  }
  return letters;
}

function remapVowel(letter: string): string {
  const mapped = VOWEL_REMAP[letter];
  if (!mapped) {
    throw new Error(`Unsupported vowel letter: ${letter}`);
  }
  return mapped;
}

function remapConsonant(letter: string): string {
  const mapped = CONSONANT_REMAP[letter];
  if (!mapped) {
    throw new Error(`Unsupported consonant letter: ${letter}`);
  }
  return mapped;
}

/** Map English letters left to right; collapse runs of the same Agalan letter. */
export function mappedSourceLetters(input: string): string[] {
  const letters = normalizeInput(input);
  const out: string[] = [];
  for (const letter of letters) {
    const mapped = VOWEL_LETTERS.has(letter) ? remapVowel(letter) : remapConsonant(letter);
    if (out[out.length - 1] === mapped) {
      continue;
    }
    out.push(mapped);
  }
  return out;
}

function phonemeWords(cmu: string): string[][] {
  return cmu.split("|").map((word) => word.trim().split(/\s+/).filter(Boolean));
}

function isConsonantPhone(phone: string): boolean {
  return !/\d$/.test(phone);
}

function letterOf(phone: string): string {
  const letter = PHONEME_MAP[phone.replace(/\d$/, "")];
  if (!letter) throw new Error(`unmapped phoneme ${phone}`);
  return letter;
}

function stopCount(root: string): number {
  return [...root].filter((letter) => STOPS.has(letter)).length;
}

/** Rank by the pronunciation metric, then fewer stops, then alphabetical order. */
function rankRoots(roots: string[], cmu: string): string[] {
  return roots
    .map((root) => [root, echo(root, cmu)] as const)
    .sort((a, b) => b[1] - a[1] || stopCount(a[0]) - stopCount(b[0]) || a[0].localeCompare(b[0]))
    .map(([root]) => root);
}

/**
 * Five-letter roots for a CMU pronunciation (`|` between words).
 * First consonant: the first consonant of the label, or of any of its words.
 * Second consonant: any letter except l/m/n/r, and a stop only when the English word has it.
 * Vowels: every combination. Ranked by the pronunciation metric.
 */
export function longRootCandidates(cmu: string): string[] {
  const words = phonemeWords(cmu);
  const phones = words.flat();
  const english = new Set(phones.filter(isConsonantPhone).map(letterOf));
  const firsts = new Set(
    words
      .map((word) => word.find(isConsonantPhone))
      .filter((phone): phone is string => !!phone)
      .map(letterOf),
  );
  const c1s = firsts.size > 0 ? [...firsts] : [...GENERATED_CONSONANTS];
  const c2s = GENERATED_CONSONANTS.filter((consonant) => !SECOND_CONSONANT_BAN.has(consonant) && (!STOPS.has(consonant) || english.has(consonant)));
  const roots: string[] = [];
  for (const c1 of c1s) {
    for (const c2 of c2s) {
      for (const a of CLARITY_VOWELS) {
        for (const b of CLARITY_VOWELS) {
          for (const c of CLARITY_VOWELS) {
            roots.push(a + c1 + b + c2 + c);
          }
        }
      }
    }
  }
  return rankRoots(roots, cmu);
}

/** Every three-letter root, ranked by the pronunciation metric against `cmu`. */
export function shortRootCandidates(cmu: string): string[] {
  const roots: string[] = [];
  for (const consonant of GENERATED_CONSONANTS) {
    for (const a of CLARITY_VOWELS) {
      for (const b of CLARITY_VOWELS) {
        roots.push(a + consonant + b);
      }
    }
  }
  return rankRoots(roots, cmu);
}

/**
 * Pronunciation-ranked roots for an English word: five-letter candidates first, then three-letter.
 * Looks the word up in CMU. No spelling fallback.
 */
export function* clarityRootCandidates(input: string): Generator<string> {
  const cmu = lookupPronunciation(input);
  const seen = new Set<string>();
  for (const root of [...longRootCandidates(cmu), ...shortRootCandidates(cmu)]) {
    if (root.length > MAX_ROOT_LENGTH || seen.has(root)) continue;
    seen.add(root);
    yield root;
  }
}

/** Syllable count for a V(CV)+ root (one syllable per vowel). */
export function clarityRootSyllables(root: string): number {
  if (!isClarityRootShape(root)) {
    throw new Error(`Not a legal Agalan root shape: ${root}`);
  }
  return (root.length + 1) / 2;
}

/**
 * Enumerate every legal ordinary root with the given syllable count (VCV, VCVCV, …).
 */
export function allClarityRoots(syllables: number): string[] {
  if (!Number.isInteger(syllables) || syllables < 1) {
    throw new Error("Syllable count must be a positive integer");
  }

  const out: string[] = [];

  const walk = (prefix: string, syllablesLeft: number): void => {
    if (syllablesLeft === 0) {
      out.push(prefix);
      return;
    }
    if (prefix.length === 0) {
      for (const v of CLARITY_VOWELS) {
        walk(v, syllablesLeft - 1);
      }
      return;
    }
    for (const c of CLARITY_CONSONANTS) {
      for (const v of CLARITY_VOWELS) {
        walk(prefix + c + v, syllablesLeft - 1);
      }
    }
  };

  walk("", syllables);
  return out;
}

export type LetterDistribution = {
  vowels: Record<(typeof CLARITY_VOWELS)[number], number>;
  consonants: Record<(typeof CLARITY_CONSONANTS)[number], number>;
  vowelTokens: number;
  consonantTokens: number;
  letters: number;
  skipped: number;
};

/** Count inventory letters in V(CV)+ roots (every occurrence; skip malformed). */
export function letterDistribution(roots: string[]): LetterDistribution {
  const vowels = Object.fromEntries(CLARITY_VOWELS.map((v) => [v, 0])) as LetterDistribution["vowels"];
  const consonants = Object.fromEntries(CLARITY_CONSONANTS.map((c) => [c, 0])) as LetterDistribution["consonants"];
  let skipped = 0;

  for (const root of roots) {
    if (!isClarityRootShape(root)) {
      skipped += 1;
      continue;
    }
    for (let i = 0; i < root.length; i++) {
      const ch = root[i]!;
      if (i % 2 === 0) {
        vowels[ch as (typeof CLARITY_VOWELS)[number]] += 1;
      } else {
        consonants[ch as (typeof CLARITY_CONSONANTS)[number]] += 1;
      }
    }
  }

  const vowelTokens = CLARITY_VOWELS.reduce((n, v) => n + vowels[v], 0);
  const consonantTokens = CLARITY_CONSONANTS.reduce((n, c) => n + consonants[c], 0);
  return {
    vowels,
    consonants,
    vowelTokens,
    consonantTokens,
    letters: vowelTokens + consonantTokens,
    skipped,
  };
}

/**
 * Best Agalan root for an English word, from its CMU pronunciation.
 * Two syllables → VCV; three syllables → VCVCV.
 */
export function toClarityWord(input: string, syllables: number): string {
  if (syllables !== 2 && syllables !== 3) {
    throw new Error("Syllable count must be 2 or 3");
  }
  const cmu = lookupPronunciation(input);
  const best = (syllables === 2 ? shortRootCandidates(cmu) : longRootCandidates(cmu))[0];
  if (!best) {
    throw new Error(`Could not build an Agalan root for "${input}"`);
  }
  return best;
}

/**
 * Assign a unique Agalan root: the best free pronunciation candidate
 * (five-letter roots before three-letter ones).
 */
export function toUniqueClarityWord(input: string, usedRoots: Set<string>): string {
  for (const candidate of clarityRootCandidates(input)) {
    if (!usedRoots.has(candidate)) {
      usedRoots.add(candidate);
      return candidate;
    }
  }

  throw new Error(
    `Could not assign unique Agalan root for "${input}" within ${MAX_ROOT_LENGTH} letters`,
  );
}
