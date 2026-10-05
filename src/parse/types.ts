import type { OverlayKind } from "../lexicon-search.js";

/** Role compound vowel (roles.md): simplex or stacked. */
export type RoleVowel = "a" | "e" | "u" | "o" | "ae" | "ao" | "oe" | "ua" | "ue" | "uo";

/** Role pointer vowel: `a` same, `o` other, `e` self, `u` unsaid (pronouns.md#role-pointers). */
export type PointerVowel = "a" | "e" | "o" | "u";

/** Label-scope seam: simplex or the six stacks (predication.md#label-scope). */
export type ScopeVowel = "a" | "e" | "o" | "u" | "ae" | "ao" | "oe" | "ua" | "ue" | "uo";

/** Part-of-speech prefix letters (role stamps). */
export type Pos = "z" | "d" | "b" | "v" | "g" | "w" | "h" | "th" | "x" | "y";

/** Word endings, plus the name instance `-ln` and stand-in clusters `-rl` / `-rm` / lexicalized `-rn`. */
export type Ending = "l" | "m" | "n" | "ln" | "r" | "rl" | "rm" | "rn" | "rth";

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

export type XFamily = "role" | "pointer" | "sake" | "scope" | "lateral" | "holder" | "ability" | "numeric" | "compound";

export type WritingBracket = "[" | "(" | "<";

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
      /** Role vowel (role compound or role pointer). */
      roleVowel?: RoleVowel;
      /** Role pointer: which event (`a` same, `o` other, `e` self, `u` unsaid; pronouns.md#role-pointers). */
      pointerVowel?: PointerVowel;
      /** Values / label-scope / ability stance vowel (also role + ability on `/ɡ/`). */
      stanceVowel?: ScopeVowel;
      /** Role compound + label scope (`gaxedehothal`): the scope vowel; predication.md#label-scope. */
      scopeVowel?: ScopeVowel;
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
      marks: ("^@" | "@" | "~")[];
    }
  | { kind: "foreign"; payload: string }
  /**
   * Tag pronoun: role letter + `w` + tag vowel (A, E, O, U) + ending (`zwal`, `zwar`, `zwam`; pronouns.md#tag-pronouns).
   * A stacked vowel is two tags at once (`zwaer` *A and E*), in written order.
   */
  | { kind: "tag"; vowels: TagVowel[] };

/** Tag pronoun vowel, named by its letter name: A, E, O, U (pronouns.md#tag-pronouns). */
export type TagVowel = "a" | "e" | "o" | "u";

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
  /** A content resume pinned to one sense of the stem: **-rl** concrete, **-rm** abstract (`ending` is then `r`; pronouns.md#resume-sense). */
  resumeSense?: "l" | "m";
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
  /** The mention marker: a `gl-` word right before a written span (spans.md#mention). */
  | "mention"
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
  /** Calls: `/y/` names (-n), named spans (`y@<…>`), and `/y/` resumes (-r, read through their antecedent). */
  vocatives: LexWord[];
  /** Reactions: `/y/` words in -l / -m (numbers included) and unnamed spans (`y<…>`). */
  interjections: LexWord[];
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
  /** Tag pronoun **-l** right after the phrase in the same role: names it (`zodogal zwal`, pronouns.md#tag-pronouns). */
  tag?: LexWord;
};

export type GItem = { kind: "adj"; adj: GPackage } | { kind: "island"; island: IslandUnit };

/** A `/ɡ/` list with right-close fences, attributive (on a noun package) or predicate (its own unit). */
export type GCoord = {
  parts: { items: GItem[]; join?: LexWord; shared: CoordShared[]; joinModifiers?: LexWord[] }[];
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
  | { kind: "island"; island: IslandUnit }
  /** A `/th/` stance word as the comparee of a rank fence: the bar (comparatives.md § bars). */
  | { kind: "bar"; bar: HUnit };

export type NpCoord = {
  level: "z" | "d" | "b";
  /** `joinModifiers`: `/w/` words right before the join word (respectively `wazem`). */
  /** `factor`: digit `/h/` number after an equative's shared scale (*twice as … as*). */
  /** `tag`: a tag **-l** right after the fence closed by this part's join names the whole group (pronouns.md#tag-pronouns). */
  parts: { items: NpItem[]; join?: LexWord; shared: CoordShared[]; joinModifiers?: LexWord[]; factor?: LexWord; tag?: LexWord }[];
};

export type VpCoord = {
  parts: {
    items: LexWord[];
    join?: LexWord;
    shared: CoordShared[];
    joinModifiers?: LexWord[];
    /** Hosted `/b/` right after a label-scope `tho` verb (predication.md#label-scope). */
    hostedVerbs?: { verb: LexWord; hosted: Hosted }[];
    /**
     * Words between two verbs of a joined list belong to the later verb's item (join-across-roles.md#vp-clause-forms):
     * `/h/` units and `/d/` `/b/` phrases, in spoken order before `verb`.
     */
    itemUnits?: { verb: LexWord; units: Unit[] }[];
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
  | {
      kind: "hook";
      word: LexWord;
      modifiers: LexWord[];
      job?: HookJob;
      /** Its `/b/` pair describes the noun or landmark on its left, not the clause. */
      onLeft?: true;
      /** `uem` + a `/th/` stance: the opposing frame the event goes contrary to (sakes.md#contrary-to-stance). */
      frame?: HUnit;
    }
  | { kind: "writingSpan"; word: LexWord }
  | { kind: "island"; island: IslandUnit }
  | { kind: "clauseCoord"; coord: ClauseCoord }
  | { kind: "gCoord"; coord: GCoord };

export type Clause = {
  units: Unit[];
  dependent?: OdoDependent;
};

export type BodyClause = {
  /** The mention marker before a topic span (`glelel x<odoga>`, spans.md#mention). */
  topicMarker?: LexWord;
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

export type AnaphorKind = "content" | "number" | "role" | "pointer" | "tag" | "topic";

export type AnaphorBind = {
  pronoun: LexWord;
  kind: AnaphorKind;
  /** Role compound or role pointer vowel (roles.md#role-compounds). */
  roleVowel?: RoleVowel;
  /** Role pointer: which event it reads (pronouns.md#role-pointers). */
  pointerVowel?: PointerVowel;
  /** A self pointer (`e`) that would name its own slot (`zaxer` in `/z/`): never a sentence. */
  ownSlot?: true;
  /** Absent when no prior match. */
  antecedent?: LexWord;
  /** A tag pair (`zwaer`): each tag's antecedent, in written order; `antecedent` is the first. */
  antecedents?: LexWord[];
};

export type AskKind = "yesNo" | "fillAsk" | "rhetorical" | "none";

export type AskRecord = {
  utteranceIndex: number;
  kind: AskKind;
  /** Join `-r` gaps in spoken order (fill-all). */
  gaps: LexWord[];
  /** Blanks inside a `dorl` dependent under a question: the dependent's own question, not the outer ask (questions.md#embedded-whether). */
  inner?: LexWord[];
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
