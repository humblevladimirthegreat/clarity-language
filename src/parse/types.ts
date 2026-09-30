import type { OverlayKind } from "../lexicon-search.js";

/** Role compound vowel (roles.md): simplex or stacked. */
export type RoleVowel = "a" | "e" | "u" | "o" | "ae" | "ao" | "oe" | "ua" | "ue" | "uo";

/** Part-of-speech prefix letters (role stamps). */
export type Pos = "z" | "d" | "b" | "v" | "g" | "w" | "h" | "th" | "x" | "y";

/** Word endings, plus stand-in clusters `-rl` / `-rm` / lexicalized `-rn`. */
export type Ending = "l" | "m" | "n" | "r" | "rl" | "rm" | "rn" | "rth";

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

export type XFamily = "span" | "role" | "sake" | "scope" | "lateral" | "holder" | "ability" | "numeric" | "compound";

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
      /** Viewpoint lateral `DIR th o`: the hosted `/b/` landmark's own facing (roles.md#landmark-facing). */
      landmark?: boolean;
      /** Span TYPE vowel (span open). */
      typeVowel?: "a" | "e" | "o" | "u";
      /** Span EDGE vowel (span open). */
      edgeVowel?: "a" | "e" | "o" | "u";
      /** Role vowel (role compound). */
      roleVowel?: RoleVowel;
      /** Values / label-scope / ability stance vowel (also role + ability on `/ɡ/`). */
      stanceVowel?: "a" | "e" | "o" | "u";
      /** Emotion compose: sake horizon letter moved mid-word (sakes.md#emotion-compose). */
      horizon?: "l" | "m" | "r";
      /** Emotion compose locus: hook vowel(s) for placement or direction (sakes.md#emotion-compose). */
      locus?: "a" | "e" | "o" | "u" | "ao" | "ae" | "oe" | "ua" | "uo" | "ue";
      /** Nested number stem (numeric derivation). */
      numberStem?: NumberStem;
      /** Lexical join before a numeric stem (`l` everyday host, `m` abstract). */
      join?: "l" | "m";
      /** Holder seam: the host's own grade letter before the holder (knowing.md#holder). */
      grade?: "l" | "m" | "r";
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
  | "sake"
  | "ability"
  | "greeting"
  | "restrictor"
  /** Any closed overlay row that is not a join-series form, sake or ability; read `word.overlay.kind`. */
  | "overlay"
  | "join"
  | "standIn"
  | "standInNamed"
  | "standInBack"
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
  /** Position among the words of the parsed text (surface order). Set by `classifyAll`. */
  at?: number;
  overlay?: LexOverlay;
  /** Sake / hostless-ability row whose host this `x` sake or ability word spells (`thonogothem`). */
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

import type { HookJob } from "./hook-jobs.js";

export type ImpliedForce = "yal" | "yam";

export type PunctKind = "period" | "qmark" | "bang";

/** Left-edge cluster before a clause body. */
export type LeftEdge = {
  vocatives: LexWord[];
  polars: LexWord[];
  hook?: LexWord;
  /** `/w/` immediately before a left-edge hook. */
  hookModifiers?: LexWord[];
  /** Act word leading `force`: an emphatic **`yul`** repeat, or the asserted **`yal`** / **`yam`** of a rhetorical question ([FORCE_PAIRS](./series.ts)). */
  leadForce?: LexWord;
  force?: LexWord;
  impliedForce?: ImpliedForce;
};

/** The hosted `/b/` slot filled by a join: later members and the closing `/b/` join word. */
export type BoundJoin = { members: LexWord[]; join: LexWord };

/**
 * The hosted `/b/` slot of a host word (`/ɡ/`, `/h/`, a `tho` verb, a hook on a join item):
 * the `/b/` itself, a join filling the slot, a measure amount, and the adjectives that describe
 * the landmark (clause.md § Complex chaining).
 */
export type Hosted = {
  bound: LexWord;
  boundJoin?: BoundJoin;
  /** Number word right after the hosted `/b/` (measure amount, e.g. a signed time offset). */
  amount?: LexWord;
  /** Plain adjectives after the hosted pair describe the landmark, not the host's noun. */
  adjs?: GPackage[];
  /** `barl` after an evidential's offset: the next sentence is the grounds (knowing.md#evidence-clause). */
  grounds?: LexWord;
};

export type GPackage = {
  word: LexWord;
  hosted?: Hosted;
  modifiers: LexWord[];
  /** `/w/` *as-of* pair immediately before this `/ɡ/` adjective. */
  asOf?: { word: LexWord; bound?: LexWord };
};

export type NpHead = LexWord;

export type NpPackage = {
  glAdj?: GPackage;
  head: NpHead;
  /** Every adjective on the head, flat (including those inside `adjCoord` islands). */
  adjs: GPackage[];
  /** Present when the adjectives form a joined list (`garedel gumuzem gul gelem gal`): order and fences. */
  adjCoord?: GCoord;
};

export type GItem = { kind: "adj"; adj: GPackage } | { kind: "island"; island: IslandUnit };

/** A `/ɡ/` list with right-close fences, attributive (on a noun package) or predicate (its own unit). */
export type GCoord = {
  parts: { items: GItem[]; join?: LexWord; shared: CoordShared[] }[];
};

export type HUnit = {
  word: LexWord;
  modifiers: LexWord[];
  hosted?: Hosted;
};

/**
 * A digitless `+` number right after a rank join: the scale of the comparison, and what it ranks by
 * its PoS: how many `/ɡ/`, how often `/h/`, how late `/b/` (comparatives.md § amount / frequency / time scale).
 * The ordinary `/ɡ/` or `/h/` shape, tagged; a `/b/` scale has no hosted slot.
 */
export type ScaleShared = (GPackage | HUnit) & { kind: "scale" };

export type CoordShared = GPackage | HUnit | ScaleShared;

export type NpItem =
  | { kind: "package"; package: NpPackage }
  | { kind: "island"; island: IslandUnit };

export type NpCoord = {
  level: "z" | "d" | "b";
  /** `joinModifiers`: `/w/` words right before the join word (respectively `wazagum`). */
  /** `factor`: digit `/h/` number after an equative's shared scale (*twice as … as*). */
  parts: { items: NpItem[]; join?: LexWord; shared: CoordShared[]; joinModifiers?: LexWord[]; factor?: LexWord }[];
};

export type VpCoord = {
  parts: {
    items: LexWord[];
    join?: LexWord;
    shared: CoordShared[];
    /** Hosted `/b/` right after a label-scope `tho` verb (predication.md#label-scope). */
    hostedVerbs?: { verb: LexWord; hosted: Hosted }[];
  }[];
};

/**
 * Clause chain: `/x/` joins go **between** clauses (joins.md § clause joins).
 * `first` absent + one link without a clause = standalone (`xal.`, or a stand-in item).
 * A repeated join word keeps one flat list; a new join word closes everything before it as one group.
 */
export type ClauseCoord = {
  first?: Clause;
  links: { join: LexWord; clause?: Clause }[];
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
  | { kind: "hook"; word: LexWord; modifiers: LexWord[]; job?: HookJob; /** Its `/b/` pair describes the noun or landmark on its left, not the clause. */ onLeft?: true }
  | { kind: "span"; span: SpanUnit }
  | { kind: "writingSpan"; word: LexWord }
  | { kind: "island"; island: IslandUnit }
  | { kind: "clauseCoord"; coord: ClauseCoord }
  | { kind: "gCoord"; coord: GCoord };

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
  /** Role compound vowel (roles.md#role-compounds). */
  roleVowel?: RoleVowel;
  /** Absent when no prior match. */
  antecedent?: LexWord;
};

export type AskKind = "yesNo" | "fillAsk" | "rhetorical" | "none";

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
  | "kind"
  | "ordinary";

export type SharedRecord = {
  join: LexWord;
  role: SharedRole;
  shared: GPackage | HUnit | ScaleShared;
};

export type ResolveInfo = {
  anaphors: AnaphorBind[];
  asks: AskRecord[];
  shared: SharedRecord[];
};
