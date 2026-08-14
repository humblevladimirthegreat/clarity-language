/** Part-of-speech prefix letters (role stamps). */
export type Pos = "z" | "d" | "b" | "v" | "g" | "w" | "h" | "x" | "j";

/** Reference suffix endings. */
export type Ending = "l" | "m" | "n" | "r";

/** Writing-style number marker symbols. */
export type WritingMarker = "+" | "-" | "#" | "#-" | "_";

/** Speech-style number marker (r + V). */
export type SpeechMarker = "ra" | "ru" | "re" | "reu" | "ro";

export type NumberMarker = WritingMarker | SpeechMarker;

/** One digit group inside a number stem (mantissa ± exponent, percent closers). */
export type NumberGroup = {
  /** Speech exponent prefix: `ba` positive, `bu` negative. */
  exponentSign?: "ba" | "bu";
  /** Exponent digits (Arabic in writing, CV syllables in speech). */
  exponentDigits?: string;
  /** Mantissa digits (Arabic or CV syllables). */
  mantissa?: string;
  /** Speech `ja` between exponent and mantissa. */
  hasJa?: boolean;
  /** Decimal point (speech `je` / writing `.`). */
  decimal?: boolean;
  /** Percent (`jo` / `%`) or percentage-point (`ju` / `%*`) closer. */
  percent?: "jo" | "ju";
};

/**
 * PoS-less number stem (used inside free number words and numeric derivation).
 * Writing and speech surface forms normalize to this structure.
 */
export type NumberStem = {
  marker: NumberMarker;
  /** Digit groups after the marker (empty = digitless). */
  groups: NumberGroup[];
  /**
   * Digitless exponent shorthand not folded into groups
   * (e.g. `e`, `e-`, `+0e`, `+1e`, speech `raba`…).
   */
  digitlessExp?: string;
};

export type XFamily = "span" | "role" | "valueAbility" | "numeric" | "compound";

export type SpanCloseFlavor = "complete" | "truncated" | "sic" | "closeAll";

export type WritingBracket = "[" | "{" | "(" | "<";

export type MorphWordFamily =
  | { kind: "content"; roots: string[] }
  | { kind: "number"; stem: NumberStem; writingEndingMark?: "~" | "@" | "=" }
  | {
      kind: "x";
      xFamily: XFamily;
      /** Host root(s) left of the first mid-word `x`. */
      leftRoots: string[];
      /** Roots right of `x` for compound family only. */
      rightRoots?: string[];
      /** Span TYPE vowel (span open). */
      typeVowel?: "a" | "e" | "o" | "u";
      /** Span EDGE vowel (span open). */
      edgeVowel?: "a" | "e" | "o" | "u";
      /** Role vowel (role compound). */
      roleVowel?: "a" | "u" | "o";
      /** Values / ability stance vowel. */
      stanceVowel?: "a" | "e" | "o" | "u";
      /** Nested number stem (numeric derivation). */
      numberStem?: NumberStem;
    }
  | { kind: "spanClose"; flavor: SpanCloseFlavor }
  | { kind: "reviser"; form: string }
  | { kind: "joinMarker"; series: string }
  | {
      kind: "writingSpan";
      bracket: WritingBracket;
      payload: string;
      marks: ("@" | "~")[];
      anaphor: boolean;
    }
  | { kind: "foreign"; payload: string; opaque: boolean };

/**
 * Stage-1 morphological word (characters → structure).
 * No lexicon classification — that is Stage 2.
 */
export type MorphWord = {
  raw: string;
  pos?: Pos;
  /** Left-bound `/ɡ/` only (`gl-`). */
  gl?: boolean;
  ending?: Ending;
  plural?: boolean;
  family: MorphWordFamily;
};

/** Stage-2 lexicon reading (tables + thin PoS/ending branches). */
export type LexReading =
  | "ordinary"
  | "value"
  | "ability"
  | "restrictor"
  | "mood"
  | "joinAct"
  | "joinRelation"
  | "number"
  | "unknown";

export type LexOverlay = {
  senseForm: string;
  pos: string;
  definition: string;
  mnemonic: string;
};

export type RootGloss = {
  literal?: string;
  metaphorical?: string;
};

/**
 * Stage-2 classified word (morph structure + lexicon readings).
 */
export type LexWord = MorphWord & {
  overlay?: LexOverlay;
  rootGloss?: RootGloss;
  reading: LexReading;
};
