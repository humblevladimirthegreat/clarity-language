/**
 * Finger code: Agebon produced with the fingers instead of the voice (docs/grammar/finger-code.md).
 * Every letter is a shape on one of two hands: vowels on the non-dominant hand, consonants on the
 * dominant hand. A shape counts on the fingers, so the digit letters are their own counts, and the
 * vowels count up their pitches from the pinky (phonology.md#vowels). The piano
 * forms derive from the shapes; guitar has its own string table that follows them.
 * Shared by the Finger Code page (FingerCode.vue) and its tests. No Node imports (the grammar site bundles this).
 */
import { NUMBER_SYLLABLES } from "./tts/numbers.ts";
import { isNativeSurface, toPhonemeWord } from "./tts/phonemes.ts";

/** 1 is the thumb, 5 the pinky. */
export type Finger = 1 | 2 | 3 | 4 | 5;

export type Shape = {
  /** Raised (or pressed) fingers. */
  fingers: Finger[];
  /** Raised fingers keep the base knuckle straight and curl the two outer joints. */
  hooked: boolean;
  name: string;
};

/** The ten digit letters in count order (1–9, then 0), read off the digit syllables (numbers.md#counts). */
export const DIGIT_LETTERS: readonly string[] = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].map(
  (digit) => NUMBER_SYLLABLES.digits[digit]![0]!,
);
/** The consonants after the digit letters, in alphabet order (phonology.md#letter-names): hooked runs 1–4. */
export const HOOKED_LETTERS: readonly string[] = ["w", "y", "th", "x"];
/** Vowels in count order, lowest pitch first (phonology.md#vowels): runs 1–4 from the pinky on the vowel hand. */
export const VOWEL_LETTERS: readonly string[] = ["a", "o", "e", "u"];
export const CONSONANT_LETTERS: readonly string[] = [...DIGIT_LETTERS, ...HOOKED_LETTERS];

const VOWEL_SET = new Set(VOWEL_LETTERS);
export const isVowel = (letter: string): boolean => VOWEL_SET.has(letter);

/** A run of 1–4 fingers starting at the index finger. */
const run = (count: number): Finger[] => ([2, 3, 4, 5] as Finger[]).slice(0, count);
/** A run of 1–4 fingers starting at the pinky, listed from the pinky in. */
const pinkyRun = (count: number): Finger[] => ([5, 4, 3, 2] as Finger[]).slice(0, count);

const RUN_NAMES = ["index", "V", "three fingers", "four fingers"];
const VOWEL_NAMES = ["pinky", "pinky + ring", "pinky + ring + middle", "four fingers"];
const COUNT_NAMES: Record<number, string> = {
  4: "flat hand",
  5: "thumb",
  6: "L",
  7: "thumb + two",
  8: "thumb + three",
  9: "open hand",
  0: "horns",
};
const HOOKED_NAMES = ["hooked index", "hooked V", "hooked three", "claw"];

/** A count's shape: runs for 1–4, the thumb adds five, zero is index + pinky. */
function countShape(count: number): Shape {
  const name = COUNT_NAMES[count] ?? RUN_NAMES[count - 1]!;
  if (count === 0) return { fingers: [2, 5], hooked: false, name };
  if (count <= 4) return { fingers: run(count), hooked: false, name };
  return { fingers: [1, ...run(count - 5)], hooked: false, name };
}

export const SHAPES: ReadonlyMap<string, Shape> = new Map([
  ...VOWEL_LETTERS.map((letter, i): [string, Shape] => [letter, { fingers: pinkyRun(i + 1), hooked: false, name: VOWEL_NAMES[i]! }]),
  ...DIGIT_LETTERS.map((letter, i): [string, Shape] => [letter, countShape((i + 1) % 10)]),
  ...HOOKED_LETTERS.map((letter, i): [string, Shape] => [letter, { fingers: run(i + 1), hooked: true, name: HOOKED_NAMES[i]! }]),
]);

export function shapeOf(letter: string): Shape {
  const shape = SHAPES.get(letter);
  if (!shape) throw new Error(`No finger-code shape for ${letter}`);
  return shape;
}

/** Shapes left over on the consonant hand. */
export const CONSONANT_SPARES = ["pinky alone", "middle + ring + pinky", "thumb + index + pinky", "thumb + any hooked run"];

// ---- Piano ----

/** Piano form: the fingers that strike, plus the vowel hand's thumb as the hook mark. */
export type PianoForm = { fingers: Finger[]; hook: boolean };

/**
 * A run strikes only its last finger (the innermost one for a run from the pinky), plus the thumb when
 * the thumb is in the count; other shapes (horns) strike exactly what is raised. A hooked run is its straight form plus the hook mark.
 * No piano form presses two neighboring fingers, so `v` (thumb + index) is `z` plus the hook mark.
 */
export function pianoForm(letter: string): PianoForm {
  const { fingers, hooked } = shapeOf(letter);
  const thumb = fingers.includes(1);
  const rest = fingers.filter((f) => f !== 1);
  const isRun = rest.every((f, i) => f === i + 2) || rest.every((f, i) => f === 5 - i);
  const struck: Finger[] = [...(thumb ? [1 as Finger] : []), ...(isRun ? rest.slice(-1) : rest)];
  if (struck.some((f, i) => i > 0 && f - struck[i - 1]! === 1)) return { fingers: [1], hook: true };
  return { fingers: struck, hook: hooked };
}

/** Right hand (consonants): thumb on F♯5, fingers 2–5 on G♯5 A♯5 C♯6 D♯6. */
export const PIANO_RIGHT_KEYS: Readonly<Record<Finger, number>> = { 1: 78, 2: 80, 3: 82, 4: 85, 5: 87 };
/** Left hand (vowels), mirrored: pinky on D♯3, thumb (the hook mark) on C♯4. A vowel's key is its pitch. */
export const PIANO_LEFT_KEYS: Readonly<Record<Finger, number>> = { 1: 61, 2: 58, 3: 56, 4: 54, 5: 51 };

export type Hand = "cons" | "vow";
export type Note = { hand: Hand; midi: number };

export function pianoNotes(letter: string): Note[] {
  if (isVowel(letter)) return pianoForm(letter).fingers.map((f) => ({ hand: "vow", midi: PIANO_LEFT_KEYS[f] }));
  const { fingers, hook } = pianoForm(letter);
  const notes: Note[] = fingers.map((f) => ({ hand: "cons", midi: PIANO_RIGHT_KEYS[f] }));
  if (hook) notes.push({ hand: "vow", midi: PIANO_LEFT_KEYS[1] });
  return notes;
}

/** A vowel's piano key, the reference for its pitch (phonology.md#vowels). */
export const vowelKey = (vowel: string): number => pianoNotes(vowel)[0]!.midi;

/** Right-hand piano spares. */
export const PIANO_SPARES: Finger[][] = [
  [2, 4],
  [3, 5],
];

// ---- Guitar ----

/** Open G tuning. The picking hand plucks the four open treble strings: thumb (p) on D3, i m a on G3 B3 D4. */
export const GUITAR_STRINGS = {
  D3: { midi: 50, finger: "p" },
  G3: { midi: 55, finger: "i" },
  B3: { midi: 59, finger: "m" },
  D4: { midi: 62, finger: "a" },
} as const;
export type GuitarString = keyof typeof GUITAR_STRINGS;

/** Each consonant follows its piano form: thumb on D3, index / middle / ring as the run ends. */
export const GUITAR_CONSONANTS: Readonly<Record<string, { strings: GuitarString[]; why: string }>> = {
  b: { strings: ["G3"], why: "1: index, the run end" },
  d: { strings: ["B3"], why: "2: middle, the run end" },
  g: { strings: ["D4"], why: "3: ring, the run end" },
  h: { strings: ["G3", "B3", "D4"], why: "4: all fingers, thumb tucked" },
  z: { strings: ["D3"], why: "5: thumb alone" },
  v: { strings: ["D3", "G3"], why: "6: thumb + index" },
  r: { strings: ["D3", "B3"], why: "7: thumb + middle" },
  l: { strings: ["D3", "D4"], why: "8: thumb + ring" },
  n: { strings: ["D3", "G3", "B3", "D4"], why: "9: open hand" },
  m: { strings: ["G3", "D4"], why: "0: horns" },
  w: { strings: ["G3", "B3"], why: "hooked 1: b + the next string up" },
  y: { strings: ["B3", "D4"], why: "hooked 2: d + the next string up" },
  th: { strings: ["D3", "G3", "B3"], why: "hooked 3: thumb + w" },
  x: { strings: ["D3", "B3", "D4"], why: "hooked 4: thumb + y" },
};
export const GUITAR_SPARE: GuitarString[] = ["D3", "G3", "D4"];

/**
 * Vowels are hammered by the fretting hand on the two low strings (D2, G2): E2 G2 B2 D3, in count order.
 * A2 would match the piano's intervals but sounds a ninth under the B string.
 */
export const GUITAR_VOWELS: Readonly<Record<string, { midi: number; string: "D2" | "G2"; fret: number }>> = {
  a: { midi: 40, string: "D2", fret: 2 },
  o: { midi: 43, string: "D2", fret: 5 },
  e: { midi: 47, string: "G2", fret: 4 },
  u: { midi: 50, string: "G2", fret: 7 },
};

export function guitarNotes(letter: string): Note[] {
  if (isVowel(letter)) return [{ hand: "vow", midi: GUITAR_VOWELS[letter]!.midi }];
  return GUITAR_CONSONANTS[letter]!.strings.map((s) => ({ hand: "cons", midi: GUITAR_STRINGS[s].midi }));
}

// ---- Beats ----

/** One beat of the code. Times are in beats from the start. */
export type Beat = {
  /** The syllable's onset and vowel, or `-` + the coda letter. */
  text: string;
  /** Onset cluster: quick shapes on the consonant hand before the beat. */
  grace: string[];
  cons: string | null;
  vowel: string | null;
  coda: boolean;
  /** The last coda letter of a word: its shape is held. */
  held: boolean;
  /** First syllable of a word. */
  stress: boolean;
  at: number;
  dur: number;
};

export type CodeWord = { raw: string; beats: Beat[]; period: boolean };
export type CodeScore = { words: CodeWord[]; beats: Beat[]; skipped: string[]; end: number };

/** Beats of rest after each word, and added after a sentence. */
export const WORD_REST = 1;
export const PERIOD_REST = 2;
const LEAD_IN = 0.5;

/**
 * Splits plain native Agebon into beats: one per syllable (both hands together, or the vowel hand alone
 * with no onset), then one per coda letter (consonant hand alone). Words that are not plain native
 * letters (numerals, spans, foreign text) are skipped.
 */
export function fingerCodeScore(text: string): CodeScore {
  const words: CodeWord[] = [];
  const beats: Beat[] = [];
  const skipped: string[] = [];
  let t = LEAD_IN;
  for (const token of text.split(/\s+/).filter(Boolean)) {
    const period = /[.!?]$/.test(token);
    const raw = token.replace(/[.,!?;:]+$/, "");
    if (raw && !isNativeSurface(raw)) skipped.push(token);
    else if (raw) {
      const wordBeats: Beat[] = [];
      toPhonemeWord(raw).syllables.forEach((syllable, si) => {
        const letters = syllable.phones.map((p) => p.letter);
        const vi = letters.findIndex(isVowel);
        const onset = vi < 0 ? letters : letters.slice(0, vi);
        const vowel = vi < 0 ? null : letters[vi]!;
        const beat: Beat = {
          text: onset.join("") + (vowel ?? ""),
          grace: onset.slice(0, -1),
          cons: onset.at(-1) ?? null,
          vowel,
          coda: false,
          held: false,
          stress: si === 0,
          at: t,
          dur: 1,
        };
        wordBeats.push(beat);
        t += 1;
        const coda = vi < 0 ? [] : letters.slice(vi + 1);
        coda.forEach((letter, i) => {
          wordBeats.push({ text: `-${letter}`, grace: [], cons: letter, vowel: null, coda: true, held: i === coda.length - 1, stress: false, at: t, dur: 1 });
          t += 1;
        });
      });
      words.push({ raw, beats: wordBeats, period: false });
      beats.push(...wordBeats);
      t += WORD_REST;
    }
    if (period) {
      t += PERIOD_REST;
      const last = words.at(-1);
      if (last) last.period = true;
    }
  }
  return { words, beats, skipped, end: t };
}
