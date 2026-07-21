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
  j: "j",
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

function normalizeInput(input: string): string {
  const letters = input.toLowerCase().replace(/[^a-z]/g, "");
  if (letters.length === 0) {
    throw new Error("Input must contain at least one letter");
  }
  return letters;
}

function splitTracks(letters: string): { vowels: string[]; consonants: string[] } {
  const vowels: string[] = [];
  const consonants: string[] = [];

  for (const letter of letters) {
    if (VOWEL_LETTERS.has(letter)) {
      vowels.push(letter);
    } else {
      consonants.push(letter);
    }
  }

  return { vowels, consonants };
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

function atWithWrap<T>(items: T[], index: number): T {
  return items[index % items.length]!;
}

/**
 * Convert an alphabetical string into a Clarity-compatible root of form V(CV)+.
 * Vowel and consonant tracks are zipped with wraparound to fill the requested syllable count.
 */
export function toClarityWord(input: string, syllables: number): string {
  if (syllables < 1) {
    throw new Error("Syllable count must be at least 1");
  }

  const letters = normalizeInput(input);
  const { vowels, consonants } = splitTracks(letters);

  // Vowelless inputs (e.g. "nfl", "dvd") fall back to "a".
  const remappedVowels =
    vowels.length === 0 ? ["a"] : vowels.map(remapVowel);
  const remappedConsonants =
    consonants.length === 0 ? ["j"] : consonants.map(remapConsonant);

  let root = atWithWrap(remappedVowels, 0);

  for (let i = 1; i < syllables; i++) {
    root += atWithWrap(remappedConsonants, i - 1);
    root += atWithWrap(remappedVowels, i);
  }

  return root;
}

const DEFAULT_MIN_SYLLABLES = 2;
const DEFAULT_MAX_SYLLABLES = 4;

/**
 * Assign a unique Clarity root by growing syllable count from min to max on collision.
 */
export function toUniqueClarityWord(
  input: string,
  usedRoots: Set<string>,
  minSyllables = DEFAULT_MIN_SYLLABLES,
  maxSyllables = DEFAULT_MAX_SYLLABLES,
): string {
  if (minSyllables < 1 || maxSyllables < minSyllables) {
    throw new Error("Invalid syllable range");
  }

  for (let syllables = minSyllables; syllables <= maxSyllables; syllables++) {
    const root = toClarityWord(input, syllables);
    if (!usedRoots.has(root)) {
      usedRoots.add(root);
      return root;
    }
  }

  throw new Error(
    `Could not assign unique Clarity root for "${input}" within ${maxSyllables} syllables`,
  );
}
