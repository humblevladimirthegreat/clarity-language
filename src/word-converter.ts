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
const CLARITY_VOWELS = ["a", "e", "o", "u"] as const;
const CLARITY_CONSONANTS = ["b", "d", "g", "v", "z", "m", "n", "h", "w", "j", "l", "r"] as const;

type Tracks = {
  remappedVowels: string[];
  remappedConsonants: string[];
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

function getTracks(letters: string, reverse = false): Tracks {
  let { vowels, consonants } = splitTracks(letters);
  if (reverse) {
    vowels = [...vowels].reverse();
    consonants = [...consonants].reverse();
  }

  return {
    remappedVowels: vowels.length === 0 ? ["a"] : vowels.map(remapVowel),
    remappedConsonants: consonants.length === 0 ? ["j"] : consonants.map(remapConsonant),
  };
}

function buildWord(
  tracks: Tracks,
  syllables: number,
  vowelStart: number,
  consonantStart: number,
): string {
  const { remappedVowels, remappedConsonants } = tracks;
  let root = atWithWrap(remappedVowels, vowelStart);

  for (let i = 1; i < syllables; i++) {
    root += atWithWrap(remappedConsonants, consonantStart + i - 1);
    root += atWithWrap(remappedVowels, vowelStart + i);
  }

  return root;
}

function collectTrackOffsetCandidates(tracks: Tracks, syllables: number): string[] {
  const seen = new Set<string>();
  const out: string[] = [];

  for (let sum = 0; sum <= 20; sum++) {
    for (let vowelStart = 0; vowelStart <= sum; vowelStart++) {
      for (let consonantStart = 0; consonantStart <= sum - vowelStart; consonantStart++) {
        const word = buildWord(tracks, syllables, vowelStart, consonantStart);
        if (word.length > MAX_ROOT_LENGTH || seen.has(word)) {
          continue;
        }
        seen.add(word);
        out.push(word);
      }
    }
  }

  return out;
}

function collectHyphenSegmentCandidates(input: string): string[] {
  const segments = input
    .toLowerCase()
    .split("-")
    .map((segment) => segment.replace(/[^a-z0-9]/g, ""))
    .filter((segment) => segment.length > 0);

  if (segments.length <= 1) {
    return [];
  }

  const seen = new Set<string>();
  const out: string[] = [];

  for (const segment of segments) {
    let letters: string;
    try {
      letters = normalizeInput(segment);
    } catch {
      continue;
    }

    for (const word of collectTrackOffsetCandidates(getTracks(letters), 2)) {
      if (seen.has(word)) {
        continue;
      }
      seen.add(word);
      out.push(word);
    }
  }

  return out;
}

function collectFillerCandidates(tracks: Tracks): string[] {
  const fillerConsonants = [...new Set([...tracks.remappedConsonants, "j"])];
  const fillerTracks: Tracks = {
    remappedVowels: tracks.remappedVowels,
    remappedConsonants: fillerConsonants,
  };
  const seen = new Set<string>();
  const out: string[] = [];

  for (const syllables of [2, 3]) {
    for (const word of collectTrackOffsetCandidates(fillerTracks, syllables)) {
      if (seen.has(word)) {
        continue;
      }
      seen.add(word);
      out.push(word);
    }
  }

  return out;
}

function collectHashFallbackCandidates(input: string): string[] {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (Math.imul(31, hash) + input.charCodeAt(i)) >>> 0;
  }

  const seen = new Set<string>();
  const out: string[] = [];

  for (let attempt = 0; attempt < 500; attempt++) {
    const h = (hash + Math.imul(attempt, 997)) >>> 0;

    for (const syllables of [2, 3]) {
      let word = CLARITY_VOWELS[h % CLARITY_VOWELS.length]!;
      for (let syllable = 1; syllable < syllables; syllable++) {
        const shift = syllable * 4;
        word +=
          CLARITY_CONSONANTS[(h >>> shift) % CLARITY_CONSONANTS.length]! +
          CLARITY_VOWELS[(h >>> (shift + 2)) % CLARITY_VOWELS.length]!;
      }

      if (word.length > MAX_ROOT_LENGTH || seen.has(word)) {
        continue;
      }
      seen.add(word);
      out.push(word);
    }
  }

  return out;
}

function* clarityRootCandidates(input: string): Generator<string> {
  const letters = normalizeInput(input);
  const forwardTracks = getTracks(letters);
  const seen = new Set<string>();

  const push = (word: string): string | null => {
    if (word.length > MAX_ROOT_LENGTH || seen.has(word)) {
      return null;
    }
    seen.add(word);
    return word;
  };

  const yieldWords = function* (words: string[]): Generator<string> {
    for (const word of words) {
      const pushed = push(word);
      if (pushed) {
        yield pushed;
      }
    }
  };

  const defaultWord = buildWord(forwardTracks, 2, 0, 0);
  const pushedDefault = push(defaultWord);
  if (pushedDefault) {
    yield pushedDefault;
  }

  yield* yieldWords(collectTrackOffsetCandidates(forwardTracks, 2));
  yield* yieldWords(collectHyphenSegmentCandidates(input));
  yield* yieldWords(collectTrackOffsetCandidates(getTracks(letters, true), 2));
  yield* yieldWords(collectTrackOffsetCandidates(forwardTracks, 3));
  yield* yieldWords(collectFillerCandidates(forwardTracks));
  yield* yieldWords(collectTrackOffsetCandidates(getTracks(letters, true), 3));
  yield* yieldWords(collectHashFallbackCandidates(input));
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
  return buildWord(getTracks(letters), syllables, 0, 0);
}

/**
 * Assign a unique Clarity root using tiered collision resolution.
 * Tries 2-syllable track variants first, then hyphen segments, reverse tracks,
 * a single 3-syllable expansion (5 letters max), filler consonants, and hash fallback.
 */
export function toUniqueClarityWord(input: string, usedRoots: Set<string>): string {
  for (const candidate of clarityRootCandidates(input)) {
    if (!usedRoots.has(candidate)) {
      usedRoots.add(candidate);
      return candidate;
    }
  }

  throw new Error(
    `Could not assign unique Clarity root for "${input}" within ${MAX_ROOT_LENGTH} letters`,
  );
}
