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

/** Agelan root vowels (phonology inventory). */
export const CLARITY_VOWELS = ["a", "e", "o", "u"] as const;

/** Agelan root onset consonants (phonology inventory; mid-word `x` is never a root letter). */
export const CLARITY_CONSONANTS = [
  "b",
  "d",
  "g",
  "v",
  "z",
  "m",
  "n",
  "h",
  "w",
  "j",
  "l",
  "r",
] as const;

const VOWEL_SET = new Set<string>(CLARITY_VOWELS);

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

function isVowel(ch: string): boolean {
  return VOWEL_SET.has(ch);
}

/** Map English letters left to right; collapse runs of the same Agelan letter. */
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

function nearestMatch(
  tokens: string[],
  insertAt: number,
  pred: (ch: string) => boolean,
  fallback: string,
): string {
  let best: string | null = null;
  let bestScore = Infinity;
  for (let j = 0; j < tokens.length; j++) {
    const ch = tokens[j]!;
    if (!pred(ch)) {
      continue;
    }
    const dist = j >= insertAt ? j - insertAt : insertAt - j;
    const score = dist + (j >= insertAt ? -0.5 : 0);
    if (score < bestScore) {
      bestScore = score;
      best = ch;
    }
  }
  return best ?? fallback;
}

type Repair = {
  word: string;
  fillerAt: boolean[];
};

function repair(tokens: string[]): Repair {
  if (tokens.length === 0) {
    return { word: "", fillerAt: [] };
  }

  const parts: string[] = [];
  const fillerAt: boolean[] = [];

  const append = (ch: string, filler: boolean): void => {
    parts.push(ch);
    fillerAt.push(filler);
  };

  for (let i = 0; i < tokens.length; i++) {
    const ch = tokens[i]!;
    if (parts.length === 0) {
      if (!isVowel(ch)) {
        append(nearestMatch(tokens, i, isVowel, "a"), true);
      }
      append(ch, false);
      continue;
    }
    const last = parts[parts.length - 1]!;
    if (isVowel(last) === isVowel(ch)) {
      if (isVowel(ch)) {
        append(nearestMatch(tokens, i, (c) => !isVowel(c), "j"), true);
      } else {
        append(nearestMatch(tokens, i, isVowel, "a"), true);
      }
    }
    append(ch, false);
  }

  if (!isVowel(parts[parts.length - 1]!)) {
    append(nearestMatch(tokens, tokens.length, isVowel, "a"), true);
  }

  return { word: parts.join(""), fillerAt };
}

function firstVowel(tokens: string[]): string {
  return tokens.find(isVowel) ?? nearestMatch(tokens, 0, isVowel, "a");
}

function fitTokens(tokens: string[], maxLetters: number): string {
  if (maxLetters < 1) {
    return "";
  }
  if (maxLetters === 1) {
    return firstVowel(tokens);
  }

  let kept = [...tokens];
  while (kept.length > 0) {
    const word = repair(kept).word;
    if (word.length <= maxLetters) {
      return word;
    }
    kept.pop();
  }
  return firstVowel(tokens);
}

function padToSyllables(word: string, tokens: string[], syllables: number): string {
  let root = word;
  const v = firstVowel(tokens);
  const c = tokens.find((ch) => !isVowel(ch)) ?? "j";
  while (clarityRootSyllables(root) < syllables && root.length + 2 <= MAX_ROOT_LENGTH) {
    root += c + v;
  }
  return root;
}

function tokenSubsequences(tokens: string[]): string[][] {
  const n = tokens.length;
  if (n === 0) {
    return [];
  }
  if (n > 16) {
    const out: string[][] = [];
    for (let len = n; len >= 1; len--) {
      out.push(tokens.slice(0, len));
    }
    for (let i = 0; i < n; i++) {
      out.push(tokens.filter((_, j) => j !== i));
    }
    return out;
  }

  const out: string[][] = [];
  const total = 1 << n;
  for (let mask = 1; mask < total; mask++) {
    const sub: string[] = [];
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) {
        sub.push(tokens[i]!);
      }
    }
    out.push(sub);
  }
  return out;
}

function subsequenceKey(tokens: string[], source: string[]): string {
  let i = 0;
  const indices: number[] = [];
  for (const ch of tokens) {
    while (i < source.length && source[i] !== ch) {
      i++;
    }
    indices.push(i < source.length ? i : source.length);
    i++;
  }
  return `${tokens.length}:${indices.join(",")}`;
}

function collectOrderPreservingCandidates(tokens: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  const push = (word: string): void => {
    if (!isClarityRootShape(word) || word.length > MAX_ROOT_LENGTH || seen.has(word)) {
      return;
    }
    seen.add(word);
    out.push(word);
  };

  push(fitTokens(tokens, MAX_ROOT_LENGTH));
  push(fitTokens(tokens, 3));

  const scored: Array<{ word: string; kept: number; length: number; key: string }> = [];
  for (const sub of tokenSubsequences(tokens)) {
    const word = repair(sub).word;
    if (!isClarityRootShape(word) || word.length > MAX_ROOT_LENGTH) {
      continue;
    }
    scored.push({
      word,
      kept: sub.length,
      length: word.length,
      key: subsequenceKey(sub, tokens),
    });
  }
  scored.sort((a, b) => b.kept - a.kept || a.length - b.length || a.key.localeCompare(b.key));
  for (const item of scored) {
    push(item.word);
  }

  return out;
}

function collectFillerVariants(tokens: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  const { word, fillerAt } = repair(tokens);
  const push = (next: string): void => {
    if (!isClarityRootShape(next) || next.length > MAX_ROOT_LENGTH || seen.has(next)) {
      return;
    }
    seen.add(next);
    out.push(next);
  };
  push(word);

  const sourceConsonants = [...new Set(tokens.filter((ch) => !isVowel(ch)))];
  if (!sourceConsonants.includes("j")) {
    sourceConsonants.push("j");
  }

  for (let i = 0; i < fillerAt.length; i++) {
    if (!fillerAt[i]) {
      continue;
    }
    const current = word[i]!;
    const alphabet = isVowel(current) ? CLARITY_VOWELS : sourceConsonants;
    for (const ch of alphabet) {
      if (ch === current) {
        continue;
      }
      push(word.slice(0, i) + ch + word.slice(i + 1));
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
    let tokens: string[];
    try {
      tokens = mappedSourceLetters(segment);
    } catch {
      continue;
    }
    for (const word of collectOrderPreservingCandidates(tokens)) {
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
  const tokens = mappedSourceLetters(input);
  const seen = new Set<string>();

  const push = (word: string): string | null => {
    if (!isClarityRootShape(word) || word.length > MAX_ROOT_LENGTH || seen.has(word)) {
      return null;
    }
    seen.add(word);
    return word;
  };

  const yieldWords = function* (words: string[], minLetters = 3): Generator<string> {
    for (const word of words) {
      if (word.length < minLetters) {
        continue;
      }
      const pushed = push(word);
      if (pushed) {
        yield pushed;
      }
    }
  };

  yield* yieldWords(collectOrderPreservingCandidates(tokens));
  yield* yieldWords(collectFillerVariants(tokens));
  yield* yieldWords(collectHyphenSegmentCandidates(input));
  yield* yieldWords(collectOrderPreservingCandidates([...tokens].reverse()));
  yield* yieldWords(collectHashFallbackCandidates(input));
  yield* yieldWords(collectOrderPreservingCandidates(tokens), 1);
}

/**
 * Whether `root` is a legal ordinary content root: V(CV)+ using the phonology letter inventory.
 */
export function isClarityRootShape(root: string): boolean {
  if (root.length === 0 || root.length % 2 === 0) {
    return false;
  }
  for (let i = 0; i < root.length; i++) {
    const ch = root[i]!;
    if (i % 2 === 0) {
      if (!(CLARITY_VOWELS as readonly string[]).includes(ch)) {
        return false;
      }
    } else if (!(CLARITY_CONSONANTS as readonly string[]).includes(ch)) {
      return false;
    }
  }
  return true;
}

/** Syllable count for a V(CV)+ root (one syllable per vowel). */
export function clarityRootSyllables(root: string): number {
  if (!isClarityRootShape(root)) {
    throw new Error(`Not a legal Agelan root shape: ${root}`);
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
 * Convert an alphabetical string into an Agelan-compatible root of form V(CV)+.
 * Source letters stay in English order; fillers only repair V(CV)+ shape.
 */
export function toClarityWord(input: string, syllables: number): string {
  if (syllables < 1) {
    throw new Error("Syllable count must be at least 1");
  }

  const tokens = mappedSourceLetters(input);
  const maxLetters = Math.min(MAX_ROOT_LENGTH, syllables * 2 - 1);
  const fitted = fitTokens(tokens, maxLetters);
  return padToSyllables(fitted, tokens, Math.min(syllables, 3));
}

/**
 * Assign a unique Agelan root using tiered collision resolution.
 * Order-preserving fits first, then filler variants, hyphen segments, reverse, hash.
 */
export function toUniqueClarityWord(input: string, usedRoots: Set<string>): string {
  for (const candidate of clarityRootCandidates(input)) {
    if (!usedRoots.has(candidate)) {
      usedRoots.add(candidate);
      return candidate;
    }
  }

  throw new Error(
    `Could not assign unique Agelan root for "${input}" within ${MAX_ROOT_LENGTH} letters`,
  );
}
