/**
 * Map English letters onto the Ageben inventory. No file access: the name widget
 * uses this when CMU has no pronunciation.
 */

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

/** Map English letters left to right; collapse runs of the same Ageben letter. */
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
