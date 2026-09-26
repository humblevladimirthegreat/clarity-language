import type { OverlayKind } from "../lexicon-search.js";

/** Part-of-speech prefix letters (role stamps). */
export type Pos = "z" | "d" | "b" | "v" | "g" | "w" | "h" | "th" | "x" | "y";

/** Word endings, plus stand-in clusters `-rl` / `-rm` / lexicalized `-rn`. */
export type Ending = "l" | "m" | "n" | "r" | "rl" | "rm" | "rn";

/** Writing-style number marker symbols. */
export type WritingMarker = "+" | "-" | "#" | "#-" | "_" | "+-" | "#_";

/** Speech-style number marker (r + V, including digraphs). */
export type SpeechMarker = "ra" | "ru" | "re" | "rue" | "ro" | "roe" | "rua" | "ruo";

export type NumberMarker = WritingMarker | SpeechMarker;

/** One digit group inside a number stem (mantissa ± exponent, percent closers). */
export type NumberGroup = {
  /** Speech exponent prefix: `ba` positive, `bu` negative. */
  exponentSign?: "ba" | "bu";
  /** Exponent digits (Arabic in writing, CV syllables in speech). */
  exponentDigits?: string;
  /** Mantissa digits (Arabic or CV syllables). */
  mantissa?: string;
  /** Speech `ya` between exponent and mantissa. */
  hasJa?: boolean;
  /** Decimal point (speech `ye` / writing `.`). */
  decimal?: boolean;
  /** Percent (`yo` / `%`) or percentage-point (`yu` / `%*`) closer. */
  percent?: "yo" | "yu";
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
   * Calendar-ordinal reading (dates): written `_` + `#`, spoken `roe`.
   * Fields then read positionally day, month, optional year
   * ([numbers.md § Time](../../docs/grammar/numbers.md#time)).
   */
  calendarOrdinal?: boolean;
  /**
   * Digitless exponent shorthand not folded into groups
   * (e.g. `e`, `e-`, `+0e`, `+1e`, speech `raba`…).
   */
  digitlessExp?: string;
};

export type XFamily = "span" | "role" | "value" | "lateral" | "ability" | "numeric" | "compound";

export type SpanCloseFlavor = "complete" | "editorial" | "closeAll";

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
      roleVowel?: "a" | "e" | "u" | "o";
      /** Values / ability stance vowel (also role + ability on `/ɡ/`). */
      stanceVowel?: "a" | "e" | "o" | "u";
      /** Nested number stem (numeric derivation). */
      numberStem?: NumberStem;
      /** Lexical join before a numeric stem (`l` everyday host, `m` abstract). */
      join?: "l" | "m";
    }
  | { kind: "spanClose"; flavor: SpanCloseFlavor }
  | { kind: "hook"; form: string }
  | {
      kind: "hookCompound";
      leftRoot: string;
      leftEnding: "l" | "m";
      hook: string;
    }
  | { kind: "joinMarker"; series: string }
  | {
      kind: "writingSpan";
      bracket: WritingBracket;
      payload: string;
      marks: ("@" | "~")[];
      anaphor: boolean;
      /** `d[…` with no close: the interior runs to the clause end (EDGE **e**). */
      clauseScoped?: true;
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
  | "greeting"
  | "restrictor"
  | "mood"
  | "locative"
  | "similative"
  | "ofRelation"
  | "exchange"
  | "proxy"
  | "stimulus"
  | "join"
  | "standIn"
  | "standInNamed"
  | "joinAct"
  | "joinRelation"
  | "number"
  | "unknown";

export type LexOverlay = {
  senseForm: string;
  pos: string;
  kind: OverlayKind;
  gloss: string;
  definition: string;
  mnemonic: string;
  /** Home section (`page.md#heading-id`) that teaches this overlay. */
  anchor: string;
};

export type RootGloss = {
  concrete?: string;
  abstract?: string;
};

/**
 * Stage-2 classified word (morph structure + lexicon readings).
 */
export type LexWord = MorphWord & {
  overlay?: LexOverlay;
  /** Need / hostless-ability row whose host this `x` value or ability word spells (`thonogothem`). */
  hostOverlay?: LexOverlay;
  rootGloss?: RootGloss;
  reading: LexReading;
  /** Lexicon-only x-less compound lemma from lexicon-compounds.csv. */
  lexicalCompound?: boolean;
  /** Unlisted stem that splits into published `left + join + right` (display only). */
  potentialCompounds?: {
    left: string;
    join: "l" | "m" | "n" | "r";
    right: string;
    gloss: string;
  }[];
  /** Extra-noun hook fused after a cited left word (`awalalul`). */
  hookCompound?: {
    leftRoot: string;
    leftEnding: "l" | "m";
    hook: string;
    stem: string;
  };
};

// ── Stage 3 sentence AST ────────────────────────────────────────────────────

export type ImpliedForce = "yal" | "yam";

export type ClauseForce =
  | "yal"
  | "yam"
  | "yol"
  | "yom"
  | "yel"
  | "yem"
  | "yul"
  | "yum";

export type PunctKind = "period" | "qmark" | "bang";

/** Left-edge cluster before a clause body. */
export type LeftEdge = {
  vocatives: LexWord[];
  polars: LexWord[];
  hook?: LexWord;
  /** `/w/` immediately before a left-edge hook. */
  hookModifiers?: LexWord[];
  /** Emphatic repeat of **`yul`** before the act word. */
  forceEcho?: LexWord;
  force?: LexWord;
  impliedForce?: ImpliedForce;
};

/** The hosted `/b/` slot filled by a join: later members and the closing `/b/` join word. */
export type BoundJoin = { members: LexWord[]; join: LexWord };

export type GPackage = {
  word: LexWord;
  bound?: LexWord;
  boundJoin?: BoundJoin;
  /** Adjectives after the hosted pair describe the extra noun (clause.md § Complex chaining). */
  boundAdjs?: GPackage[];
  modifiers: LexWord[];
  /** `/w/` *as-of* pair immediately before this `/ɡ/` adjective. */
  asOf?: { word: LexWord; bound?: LexWord };
};

export type NpHead = LexWord;

export type NpPackage = {
  glAdj?: GPackage;
  head: NpHead;
  adjs: GPackage[];
};

export type HUnit = {
  word: LexWord;
  modifiers: LexWord[];
  bound?: LexWord;
  boundJoin?: BoundJoin;
  /** Number word on the hosted `/b/` (measure amount, e.g. a signed time offset). */
  boundAmount?: LexWord;
};

export type CoordShared = GPackage | HUnit | LexWord;

export type NpItem =
  | { kind: "package"; package: NpPackage }
  | { kind: "island"; island: IslandUnit };

export type NpCoord = {
  level: "z" | "d" | "b";
  parts: { items: NpItem[]; join?: LexWord; shared: CoordShared[] }[];
};

export type VpCoord = {
  parts: { items: LexWord[]; join?: LexWord; shared: CoordShared[] }[];
};

export type ClauseCoord = {
  parts: { clauses: Clause[]; join: LexWord }[];
};

export type SpanUnit = {
  open: LexWord;
  content: Clause[];
  /** Atomic (EDGE **o**) interior: exactly one token. */
  atom?: LexWord;
  /** Explicit close; absent for atomic / clause-scoped / empty opens. */
  close?: LexWord;
};

export type IslandUnit = {
  units: Unit[];
};

export type OdoDependent = {
  orodo: LexWord;
  clause: Clause;
};

export type Unit =
  | { kind: "np"; coord: NpCoord }
  | { kind: "vp"; coord: VpCoord }
  | { kind: "predicate"; adj: GPackage }
  | { kind: "h"; unit: HUnit }
  | { kind: "linker"; word: LexWord }
  | { kind: "hook"; word: LexWord; modifiers: LexWord[] }
  | { kind: "span"; span: SpanUnit }
  | { kind: "writingSpan"; word: LexWord }
  | { kind: "island"; island: IslandUnit }
  | { kind: "clauseCoord"; coord: ClauseCoord };

export type Clause = {
  units: Unit[];
  dependent?: OdoDependent;
};

export type BodyClause = {
  linker?: LexWord;
  clause: Clause;
  punct?: PunctKind;
};

export type Utterance = {
  left: LeftEdge;
  bodies: BodyClause[];
};

/** Competing readings with no grammar rule that picks one (anaphors excluded). */
export type AmbiguityConflict = {
  surface: string;
  stage: "morph" | "classify";
  sources: string[];
  detail: string;
};

export type ParseOptions = {
  /** When set, collect first-match collisions that the grammar does not resolve. */
  checkAmbiguity?: boolean;
  /** When set, report the construction IDs the parse used ([constructions.ts](./constructions.ts)). */
  constructions?: boolean;
};

export type ParseResult = {
  utterances: Utterance[];
  /** Stage 4 discourse annotations. Present after `parse()` / `resolve()`. */
  resolve?: ResolveInfo;
  /** Present only when `checkAmbiguity` is on. */
  ambiguity?: AmbiguityConflict[];
  /** Construction IDs the parse used (sorted). Present only when `constructions` is on. */
  constructions?: string[];
};

// ── Stage 4 resolve ─────────────────────────────────────────────────────────

export type ContentMatch = "letter" | "fullRoot";

export type AnaphorKind = "content" | "span" | "number" | "role";

export type AnaphorBind = {
  pronoun: LexWord;
  kind: AnaphorKind;
  /** Content letter vs full-root match. */
  match?: ContentMatch;
  /** Span TYPE vowel (cite / aside / mention / opaque). */
  typeVowel?: "a" | "e" | "o" | "u";
  /** Role compound vowel (agent / place / patient / recipient). */
  roleVowel?: "a" | "e" | "u" | "o";
  /** Absent when no prior match. */
  antecedent?: LexWord;
};

export type AskKind = "yesNo" | "fillAsk" | "none";

export type AskRecord = {
  utteranceIndex: number;
  kind: AskKind;
  /** Join `-r` gaps in spoken order (fill-all). */
  gaps: LexWord[];
};

export type SharedRole =
  | "distribute"
  | "collective"
  | "scale"
  | "equative"
  | "continuum"
  | "kind"
  | "ordinary";

export type SharedRecord = {
  join: LexWord;
  role: SharedRole;
  shared: GPackage | HUnit;
};

export type ResolveInfo = {
  anaphors: AnaphorBind[];
  asks: AskRecord[];
  shared: SharedRecord[];
};
