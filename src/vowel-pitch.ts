/**
 * Vowel pitch (docs/grammar/phonology.md#vowels): each vowel has its own pitch, counted in semitones
 * above the speaker's own `a`. The piano reference keys are the finger code's vowel keys.
 * Shared by the pitch drill component and their tests. No Node imports (the grammar site bundles this).
 */
import { CONSONANT_LETTERS, DIGIT_LETTERS, VOWEL_LETTERS, vowelKey } from "./finger-code.ts";

/** Vowels lowest pitch first: the finger code's count order. */
export const PITCH_ORDER: readonly string[] = VOWEL_LETTERS;
/** Vowels in alphabet order (phonology.md#letter-names); a stack puts its two vowels in this order. */
export const ALPHABET_VOWELS: readonly string[] = ["u", "a", "o", "e"];

/** Semitones above the home note, the note `a` is sung on (phonology.md#vowel-pitch-values). */
export const VOWEL_PITCH: Readonly<Record<string, number>> = { a: 0, o: 3, e: 5, u: 7 };

/** The default home note: its finger-code piano key (D♯3). */
export const PITCH_BASE = vowelKey("a");

/** A vowel's pitch as a MIDI note, from the home note. */
export const pitchOf = (vowel: string, base = PITCH_BASE): number => base + VOWEL_PITCH[vowel]!;

/** The six vowel stacks, each in alphabet order. */
export const STACKS: readonly string[] = ALPHABET_VOWELS.flatMap((v, i) => ALPHABET_VOWELS.slice(i + 1).map((w) => v + w));

// ---- Drill ----

export type DrillMode = "up" | "down" | "pairs" | "contours";

export type DrillTempo = "slow" | "normal" | "quick";

/** Seconds per beat at each tempo. */
export const DRILL_TEMPOS: readonly { id: DrillTempo; label: string; beat: number }[] = [
  { id: "slow", label: "Slow", beat: 1 },
  { id: "normal", label: "Normal", beat: 0.7 },
  { id: "quick", label: "Quick", beat: 0.45 },
];

/**
 * The levels whose drill offers the mode. Past beginner the scales run through the consonants, named for the order
 * they say (`consonantLabel`), and the stacks join them.
 */
export const DRILL_MODES: readonly { id: DrillMode; label: string; consonantLabel?: string; beginner: boolean; intermediate: boolean }[] = [
  { id: "up", label: "Scale up", consonantLabel: "Digits", beginner: true, intermediate: true },
  { id: "down", label: "Scale down", consonantLabel: "Alphabet", beginner: true, intermediate: true },
  { id: "pairs", label: "Pairs", beginner: true, intermediate: false },
  { id: "contours", label: "Stacks", beginner: false, intermediate: true },
];

/** One step of a phrase. `ref` is the opening `a` the other vowels are heard against; `onset`, a consonant said before the vowel. */
export type DrillStep = { vowel: string; kind: "ref" | "note"; beats: number; onset?: string };
/** A phrase: an optional word or caption, then its steps. `tied`: the next phrase follows with no rest. */
export type DrillPhrase = { caption: string; word?: string; steps: DrillStep[]; tied?: boolean };

const note = (vowel: string): DrillStep => ({ vowel, kind: "note", beats: 1 });
const REF: DrillStep = { vowel: "a", kind: "ref", beats: 1 };
const vowelsOf = (word: string): string[] => [...word].filter((c) => PITCH_ORDER.includes(c));

/**
 * The phrases a mode plays. With `consonants`, the scale runs through consonants in alphabet order
 * (phonology.md#letter-names), one per note, its vowels repeating; each phrase is one run of the scale, tied to the next.
 * The scale up then counts, so it stops at the ten digit letters; the scale down says every letter name.
 * Pairs and stacks have no consonants: a consonant between two stacked vowels would split the stack.
 */
export function drillPhrases(mode: DrillMode, consonants = false): DrillPhrase[] {
  const phrases = vowelPhrases(mode);
  if (!consonants || (mode !== "up" && mode !== "down")) return phrases;
  const scale = phrases[0]!.steps;
  const letters = mode === "up" ? DIGIT_LETTERS : CONSONANT_LETTERS;
  const out: DrillPhrase[] = [];
  for (let i = 0; i < letters.length; i += scale.length) {
    out.push({
      caption: i ? "" : `${phrases[0]!.caption}, ${mode === "up" ? "digit" : "alphabet"} order`,
      steps: letters.slice(i, i + scale.length).map((onset, j) => ({ ...scale[j]!, onset })),
      tied: i + scale.length < letters.length,
    });
  }
  return out;
}

function vowelPhrases(mode: DrillMode): DrillPhrase[] {
  switch (mode) {
    case "up":
      return [{ caption: "low to high", steps: PITCH_ORDER.map(note) }];
    case "down":
      return [{ caption: "high to low", steps: [...PITCH_ORDER].reverse().map(note) }];
    case "pairs":
      // Only the first pair opens on `a`; the later pairs lean on it.
      return [
        { caption: "opposites, the widest gap", steps: ["a", "u"].map(note) },
        { caption: "opposites, one step", steps: ["o", "e"].map(note) },
        { caption: "the closest pair by ear", steps: ["u", "o"].map(note) },
      ];
    case "contours":
      return STACKS.map((word) => {
        const [from, to] = vowelsOf(word).map((v) => PITCH_ORDER.indexOf(v));
        return { caption: to! > from! ? "rises" : "falls", word, steps: [REF, ...vowelsOf(word).map(note)] };
      });
  }
}
