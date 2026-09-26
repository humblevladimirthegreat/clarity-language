/**
 * Construction registry: every production the parser can apply, mapped to the
 * grammar-doc section that teaches it (docs/proposals/parser-strictness.md).
 *
 * The inventory is the parser's own structure, not a hand-kept list:
 * - `sentence.*` — Chevrotain `(rule, childKey)` pairs; completeness is tested
 *   against `sentenceGrammar()`.
 * - `token.*` — `classifyTokenBranch` branches (which slot a word may fill).
 * - `word.*` — typed morph / lexicon fields (`Record<>` keeps them complete).
 * - `resolve.*` — anaphor kind × bound / unbound.
 * - `overlay.*` — one per closed overlay row; the anchor lives in
 *   data/lexicon-overlays.csv ({@link constructionRegistry}).
 *
 * Anchors are `page.md#id` under docs/grammar/ and must resolve.
 */
import { overlayConstructionId } from "./construction-trace.js";
import type { TokenBranch } from "./tokens.js";
import type { ExtraNounHook } from "./hook-compounds.js";
import type { AnaphorKind, Ending, LexReading, MorphWordFamily, Pos, SpanCloseFlavor, XFamily } from "./types.js";

export type ConstructionEntry = { anchor: string; summary: string };

/** Sentence grammar: `rule.childKey` (sub-rule, token type, or LABEL). */
export const SENTENCE_CONSTRUCTIONS: Record<string, ConstructionEntry> = {
  "document.utterance": { anchor: "word-endings.md#greeting", summary: "a text is one or more utterances" },
  "document.EOF": { anchor: "word-endings.md#greeting", summary: "end of text" },

  "utterance.leftEdge": { anchor: "speech-moves.md#vocative", summary: "turn cluster before the body" },
  "utterance.edgeBody": { anchor: "speech-moves.md#speech-act-statement-question-command", summary: "body after a turn cluster" },
  "utterance.bodyClause": { anchor: "word-endings.md#greeting", summary: "body with no turn cluster (implied yal)" },
  "utterance.Period": { anchor: "word-endings.md#greeting", summary: "sentence end" },
  "utterance.nextBody": { anchor: "dependents.md#which-person-or-thing-who-that-which", summary: "next sentence in the same turn" },

  "leftEdge.Vocative": { anchor: "speech-moves.md#vocative", summary: "vocative / greeting at the left edge" },
  "leftEdge.Polar": { anchor: "questions.md#polar-stance", summary: "polar stance turn" },
  "leftEdge.W": { anchor: "hooks.md#hook-w", summary: "/w/ on a left-edge hook" },
  "leftEdge.Hook": { anchor: "hooks.md#discourse-hooks", summary: "discourse hook at the left edge" },
  "leftEdge.ForceEcho": { anchor: "speech-moves.md#emphatic-prohibition", summary: "yul yul emphatic prohibition" },
  "leftEdge.Force": { anchor: "speech-moves.md#speech-act-statement-question-command", summary: "speech-act word" },

  "bodyClause.Linker": { anchor: "dependents.md#continue-x", summary: "sentence linker before a clause" },
  "bodyClause.clause": { anchor: "word-endings.md#greeting", summary: "clause body" },
  "clause.clausePart": { anchor: "word-endings.md#greeting", summary: "clause is a run of units" },

  "clausePart.unit": { anchor: "word-endings.md#greeting", summary: "role-lettered unit in a clause" },
  "clausePart.xJoinClose": { anchor: "joins.md#right-close", summary: "clause join after its clause" },
  "clausePart.standaloneJoin": { anchor: "join-across-roles.md#vp-clause-forms", summary: "clause join with no clause before it" },
  "xJoinClose.JoinX": { anchor: "joins.md#right-close", summary: "/x/ join fence" },

  "unit.islandUnit": { anchor: "spans.md#scope-islands", summary: "scope island" },
  "unit.spanUnit": { anchor: "spans.md#shape", summary: "spoken span" },
  "unit.zCoord": { anchor: "word-endings.md#greeting", summary: "/z/ subject phrase" },
  "unit.dCoord": { anchor: "clause.md#direct-object-d", summary: "/d/ object phrase" },
  "unit.bCoord": { anchor: "clause.md#unhosted-b", summary: "unhosted /b/ phrase" },
  "unit.vpCoord": { anchor: "clause.md#who-acts-and-the-action", summary: "/v/ verb phrase" },
  "unit.gCoord": { anchor: "joins.md#negation-u", summary: "clause-level /ɡ/ (predicate adjective)" },
  "unit.hCoord": { anchor: "clause.md#adverbs-h", summary: "/h/ or stance /th/ unit" },
  "unit.hookUnit": { anchor: "hooks.md#including-am-al", summary: "in-clause hook" },

  "islandUnit.IslandEdge": { anchor: "spans.md#scope-islands", summary: "^ island edge" },
  "islandUnit.unit": { anchor: "spans.md#scope-islands", summary: "units inside an island" },

  "spanUnit.SpanOpen": { anchor: "spans.md#shape", summary: "span open word" },
  "spanUnit.atom": { anchor: "spans.md#shape", summary: "atomic span interior (EDGE o)" },
  "spanUnit.scopedUnit": { anchor: "spans.md#edge", summary: "clause-scoped span interior (EDGE e)" },
  "spanUnit.clause": { anchor: "spans.md#edge", summary: "multi-clause span interior (EDGE a)" },
  "spanUnit.SpanClose": { anchor: "spans.md#shape", summary: "span close word" },
  "spanUnit.closeAll": { anchor: "spans.md#close-forms-complete-editorial-close-all", summary: "editorial close then close-all" },

  "zCoord.zCoordPart": { anchor: "word-endings.md#greeting", summary: "/z/ phrase parts" },
  "dCoord.dCoordPart": { anchor: "clause.md#direct-object-d", summary: "/d/ phrase parts" },
  "bCoord.bCoordPart": { anchor: "clause.md#unhosted-b", summary: "/b/ phrase parts" },
  "zCoordPart.npConjunct": { anchor: "word-endings.md#greeting", summary: "/z/ conjunct" },
  "zCoordPart.npJoinClose": { anchor: "joins.md#and-lists-a", summary: "/z/ join after its conjuncts" },
  "zCoordPart.standaloneJoin": { anchor: "joins.md#standalone-phrase", summary: "standalone /z/ join" },
  "dCoordPart.npConjunct": { anchor: "clause.md#direct-object-d", summary: "/d/ conjunct" },
  "dCoordPart.npJoinClose": { anchor: "joins.md#right-close", summary: "/d/ join after its conjuncts" },
  "dCoordPart.standaloneJoin": { anchor: "joins.md#standalone-phrase", summary: "standalone /d/ join" },
  "bCoordPart.npConjunct": { anchor: "clause.md#unhosted-b", summary: "/b/ conjunct" },
  "bCoordPart.npJoinClose": { anchor: "joins.md#right-close", summary: "/b/ join after its conjuncts" },
  "bCoordPart.standaloneJoin": { anchor: "joins.md#standalone-phrase", summary: "standalone /b/ join" },
  "npConjunct.npPackage": { anchor: "word-endings.md#greeting", summary: "noun with its adjectives" },
  "npJoinClose.JoinZ": { anchor: "joins.md#and-lists-a", summary: "/z/ join fence" },
  "npJoinClose.JoinD": { anchor: "joins.md#and-lists-a", summary: "/d/ join fence" },
  "npJoinClose.JoinB": { anchor: "joins.md#and-lists-a", summary: "/b/ join fence" },
  "npJoinClose.sharedAfterJoin": { anchor: "joins.md#right-close", summary: "shared word after a noun join" },

  "vpCoord.vpCoordPart": { anchor: "clause.md#who-acts-and-the-action", summary: "/v/ phrase parts" },
  "vpCoordPart.V": { anchor: "clause.md#who-acts-and-the-action", summary: "verb" },
  "vpCoordPart.vJoinClose": { anchor: "joins.md#and-lists-a", summary: "/v/ join after its verbs" },
  "vpCoordPart.standaloneJoin": { anchor: "joins.md#standalone-phrase", summary: "standalone /v/ join" },
  "vJoinClose.JoinV": { anchor: "joins.md#and-lists-a", summary: "/v/ join fence" },
  "vJoinClose.sharedAfterJoin": { anchor: "join-across-roles.md#vp-clause-forms", summary: "shared /h/ after a verb join (covers every verb)" },

  "gCoord.gCoordPart": { anchor: "joins.md#negation-u", summary: "/ɡ/ phrase parts" },
  "gCoordPart.gPackage": { anchor: "joins.md#negation-u", summary: "clause-level adjective" },
  "gCoordPart.gJoinClose": { anchor: "joins.md#right-close", summary: "/ɡ/ join after its adjectives" },
  "gCoordPart.standaloneJoin": {
    anchor: "predication.md#classification-packaging",
    summary: "/ɡ/ join closing the adjective on the noun before it",
  },
  "gJoinClose.JoinG": { anchor: "joins.md#and-lists-a", summary: "/ɡ/ join fence" },
  "gJoinClose.sharedAfterJoin": { anchor: "numbers-applied.md#ranges", summary: "continuum /ɡ/ after a join of number endpoints" },

  "hCoord.hCoordPart": { anchor: "clause.md#adverbs-h", summary: "/h/ phrase parts" },
  "hCoordPart.hUnitRule": { anchor: "clause.md#adverbs-h", summary: "adverb or stance word" },
  "hCoordPart.hJoinClose": { anchor: "join-across-roles.md#stance-joins", summary: "/h/ join after its adverbs" },
  "hCoordPart.standaloneJoin": { anchor: "join-across-roles.md#standalone-stance-joins", summary: "standalone stance /th/ join" },
  "hJoinClose.JoinH": { anchor: "join-across-roles.md#stance-joins", summary: "/h/ join fence" },

  "hUnitRule.W": { anchor: "clause.md#adjective-detail-w", summary: "/w/ detail on an adverb" },
  "hUnitRule.H": { anchor: "clause.md#adverbs-h", summary: "/h/ or /th/ word" },
  "hUnitRule.B": { anchor: "clause.md#unhosted-b", summary: "hosted /b/ after /h/" },
  "hUnitRule.G": { anchor: "knowing.md#dated-channel", summary: "amount on a hosted /b/ (signed offset)" },
  "hUnitRule.Odo": { anchor: "dependents.md#dependent-clauses", summary: "stand-in hosted on /h/" },
  "hookUnit.W": { anchor: "hooks.md#hook-w", summary: "/w/ on an in-clause hook" },
  "hookUnit.Hook": { anchor: "hooks.md#including-am-al", summary: "in-clause hook" },

  "npPackage.gPackage": { anchor: "clause.md#adjectives-ɡ", summary: "adjective on a noun (gl- before, /ɡ/ after)" },
  "npPackage.Z": { anchor: "word-endings.md#greeting", summary: "/z/ noun" },
  "npPackage.D": { anchor: "clause.md#direct-object-d", summary: "/d/ noun" },
  "npPackage.B": { anchor: "clause.md#unhosted-b", summary: "/b/ noun" },
  "npPackage.Odo": { anchor: "dependents.md#dependent-clauses", summary: "stand-in as a noun" },
  "npPackage.WritingSpan": { anchor: "spans.md#writing", summary: "written span as a noun" },

  "hUnitRule.boundJoinTail": { anchor: "relations.md#locative-relations", summary: "hosted /b/ slot filled by a join" },
  "gPackage.boundJoinTail": { anchor: "relations.md#locative-relations", summary: "hosted /b/ slot on /ɡ/ filled by a join" },
  "boundJoinTail.B": { anchor: "relations.md#locative-relations", summary: "later member of a hosted /b/ join" },
  "boundJoinTail.JoinB": { anchor: "relations.md#locative-relations", summary: "join word closing a hosted /b/ slot" },
  "asOfWPair.W": { anchor: "relations.md#as-of", summary: "as-of /w/" },
  "asOfWPair.B": { anchor: "relations.md#as-of", summary: "as-of /b/ bound" },
  "gPackage.W": { anchor: "clause.md#adjective-detail-w", summary: "/w/ detail on an adjective" },
  "gPackage.asOfWPair": { anchor: "relations.md#as-of", summary: "as-of pair before an adjective" },
  "gPackage.G": { anchor: "clause.md#adjectives-ɡ", summary: "/ɡ/ adjective" },
  "gPackage.B": { anchor: "predication.md#identity-same", summary: "hosted /b/ after /ɡ/" },

  "sharedAfterJoin.gPackage": { anchor: "joins.md#right-close", summary: "shared /ɡ/ after a join" },
  "sharedAfterJoin.hUnitRule": { anchor: "comparatives.md#manner-scale", summary: "shared /h/ after a join" },
};

/** Which slot a word may fill (`classifyTokenBranch`). */
export const TOKEN_CONSTRUCTIONS: Record<TokenBranch, ConstructionEntry> = {
  hook: { anchor: "hooks.md#beginner", summary: "prefix-less hook" },
  spanClose: { anchor: "spans.md#shape", summary: "span close word" },
  writingSpanSlot: { anchor: "spans.md#asides-th", summary: "written span in a non-noun slot" },
  writingSpan: { anchor: "spans.md#writing", summary: "written span as a noun" },
  spanOpen: { anchor: "spans.md#shape", summary: "spoken span open" },
  standIn: { anchor: "dependents.md#dependent-clauses", summary: "stand-in (darl / barl / …)" },
  join: { anchor: "joins.md#and-lists-a", summary: "join fence word" },
  joinAct: { anchor: "join-across-roles.md#join-act-verbs", summary: "join-act verb" },
  joinRelationG: { anchor: "join-across-roles.md#join-relations", summary: "join-relation on /ɡ/" },
  joinRelationH: { anchor: "join-across-roles.md#join-relations", summary: "join-relation on /h/ or /th/" },
  greeting: { anchor: "x-compounds.md#conversation-length", summary: "conversation-length bid (citation + x + vowel + -n)" },
  polar: { anchor: "questions.md#polar-stance", summary: "polar stance particle" },
  force: { anchor: "speech-moves.md#speech-act-statement-question-command", summary: "speech-act word" },
  yFallbackVocative: { anchor: "speech-moves.md#vocative", summary: "any other /y/ word read as a vocative" },
  linker: { anchor: "dependents.md#continue-x", summary: "/x/ content word as a sentence linker" },
  content: { anchor: "phonology.md#word-edges", summary: "content word in its role slot" },
  citationFallback: { anchor: "phonology.md#word-edges", summary: "prefix-less citation read as a noun" },
};

type FamilyKind = MorphWordFamily["kind"];

export const WORD_FAMILY_CONSTRUCTIONS: Record<FamilyKind, ConstructionEntry> = {
  content: { anchor: "phonology.md#word-edges", summary: "content word" },
  number: { anchor: "numbers.md#counts-g-n", summary: "number word" },
  x: { anchor: "interests.md#how-it-is-appreciated-endings-on-met", summary: "mid-word x compound" },
  spanClose: { anchor: "spans.md#shape", summary: "span close" },
  hook: { anchor: "hooks.md#beginner", summary: "hook" },
  hookCompound: { anchor: "hooks.md#hook-compounds", summary: "fused extra-noun hook compound" },
  joinMarker: { anchor: "speech-moves.md#speech-act-statement-question-command", summary: "vowel-series join / turn word" },
  writingSpan: { anchor: "spans.md#writing", summary: "written span" },
  foreign: { anchor: "spans.md#loans", summary: "foreign / opaque payload" },
};

export const WORD_XFAMILY_CONSTRUCTIONS: Record<XFamily, ConstructionEntry> = {
  span: { anchor: "spans.md#shape", summary: "span open" },
  role: { anchor: "roles.md#role-compounds", summary: "role compound" },
  interest: { anchor: "interests.md#how-it-is-appreciated-endings-on-met", summary: "interest word" },
  lateral: { anchor: "roles.md#viewpoint-laterals", summary: "viewpoint lateral" },
  ability: { anchor: "x-compounds.md#conversation-length", summary: "ability compound" },
  numeric: { anchor: "numeric-derivation.md#numeric-derivation", summary: "numeric derivation" },
  compound: { anchor: "x-compounds.md#two-roots-one-word", summary: "ordinary x compound" },
};

/** Readings only a closed overlay produces; those words trace `overlay.*` instead. */
type OverlayOnlyReading =
  | "mood"
  | "locative"
  | "similative"
  | "ofRelation"
  | "exchange"
  | "proxy"
  | "stimulus"
  | "joinAct"
  | "joinRelation";

/** Non-overlay readings (an overlay word traces `overlay.*`, not `word.reading.*`). */
export const WORD_READING_CONSTRUCTIONS: Record<Exclude<LexReading, OverlayOnlyReading>, ConstructionEntry> = {
  ordinary: { anchor: "phonology.md#word-edges", summary: "ordinary content reading" },
  interest: { anchor: "interests.md#how-it-is-appreciated-endings-on-met", summary: "interest reading" },
  ability: { anchor: "intention.md#ability", summary: "ability reading" },
  greeting: { anchor: "x-compounds.md#conversation-length", summary: "conversation-length bid" },
  restrictor: { anchor: "restrictors.md#beginner", summary: "restrictor" },
  join: { anchor: "joins.md#and-lists-a", summary: "join" },
  standIn: { anchor: "dependents.md#dependent-clauses", summary: "stand-in" },
  standInNamed: { anchor: "dependents.md#stand-in-roles", summary: "named stand-in" },
  number: { anchor: "numbers.md#counts-g-n", summary: "number" },
  unknown: { anchor: "spans.md#writing", summary: "unclassified root" },
};

export const WORD_ENDING_CONSTRUCTIONS: Record<Ending, ConstructionEntry> = {
  l: { anchor: "phonology.md#word-edges", summary: "-l concrete / literal" },
  m: { anchor: "phonology.md#word-edges", summary: "-m abstract / metaphor" },
  n: { anchor: "phonology.md#word-edges", summary: "-n proper name" },
  r: { anchor: "pronouns.md#resume-r", summary: "-r resume" },
  rl: { anchor: "dependents.md#dependent-clauses", summary: "-rl stand-in" },
  rm: { anchor: "dependents.md#stand-in", summary: "-rm stand-in" },
  rn: { anchor: "dependents.md#stand-in-roles", summary: "-rn named stand-in" },
};

export const WORD_PLURAL_CONSTRUCTIONS: Record<Exclude<Pos, "w" | "h" | "th" | "x">, ConstructionEntry> = {
  z: { anchor: "plurality.md#associative", summary: "-x on /z/" },
  d: { anchor: "plurality.md#associative", summary: "-x on /d/" },
  b: { anchor: "plurality.md#associative", summary: "-x on /b/" },
  y: { anchor: "plurality.md#vocatives-y", summary: "-x on a vocative" },
  v: { anchor: "plurality.md#verbs-v", summary: "collective -x on /v/" },
  g: { anchor: "plurality.md#adjectives-g", summary: "collective -x on /ɡ/" },
};

export const WORD_MISC_CONSTRUCTIONS = {
  gl: { anchor: "clause.md#left-bound-adjectives", summary: "gl- left-bound adjective" },
} satisfies Record<string, ConstructionEntry>;

export const RESOLVE_CONSTRUCTIONS: Record<Exclude<`${AnaphorKind}.${"bound" | "unbound"}`, "number.unbound">, ConstructionEntry> = {
  "content.bound": { anchor: "pronouns.md#resume-r", summary: "-r binds an earlier content word" },
  "content.unbound": { anchor: "pronouns.md#resume-r", summary: "full-root -r with no earlier match (the one you both know)" },
  "span.bound": { anchor: "spans.md#resume", summary: "span resume binds an earlier span" },
  "span.unbound": { anchor: "spans.md#resume", summary: "span resume with no earlier span" },
  "number.bound": { anchor: "numbers.md#digitless", summary: "number -r binds an earlier number" },
  "role.bound": { anchor: "roles.md#role-compounds", summary: "role -r binds an earlier role compound" },
  "role.unbound": { anchor: "roles.md#role-compounds", summary: "role -r with no earlier match" },
};

/** Readings of a whole utterance or clause shape (`reading.*`, [construction-trace.ts](./construction-trace.ts)). */
export const READING_CONSTRUCTIONS = {
  existence: { anchor: "predication.md#existence", summary: "verbless /z/ clause: there is …" },
  bareQuestion: { anchor: "questions.md#question", summary: "yol. / yom. with no body: Huh? / Hm?" },
  greeting: { anchor: "word-endings.md#greeting", summary: "a named citation said alone: hello / goodbye" },
} satisfies Record<string, ConstructionEntry>;

/** Tone marks: each mark, and each scope it colors (speech-moves.md § tone marks). */
export const TONE_CONSTRUCTIONS = {
  "mark.strong": { anchor: "speech-moves.md#tone-marks", summary: "! strong feeling" },
  "mark.stronger": { anchor: "speech-moves.md#tone-marks", summary: "!! stronger feeling" },
  "mark.unsure": { anchor: "questions.md#question-tone", summary: "? unsure" },
  "mark.surprised": { anchor: "speech-moves.md#tone-marks", summary: "?! surprised and doubtful" },
  "mark.joking": { anchor: "speech-moves.md#tone-marks", summary: "% joking, not literal" },
  "mark.contrast": { anchor: "speech-moves.md#tone-marks", summary: "& contrastive focus" },
  "mark.warm": { anchor: "speech-moves.md#tone-marks", summary: "; warm, affectionate" },
  "scope.word": { anchor: "questions.md#question-tone", summary: "mark attached to a word" },
  "scope.island": { anchor: "spans.md#scope-islands", summary: "mark attached to a scope island" },
  "scope.span": { anchor: "speech-moves.md#tone-marks", summary: "mark attached to a span" },
  "scope.rest": { anchor: "questions.md#question-tone", summary: "free-standing mark: rest of the sentence" },
} satisfies Record<string, ConstructionEntry>;

/**
 * Number-stem features (`number.*`), one per lesson: marker identity, digitless,
 * exponents, digitless-exponent classes, percent, decimal, groups, writing marks,
 * and the non-referential PoS a number takes. Traced on free numbers and on the
 * stem inside a numeric derivation.
 */
export const NUMBER_FEATURE_CONSTRUCTIONS = {
  "marker.scalarPos": { anchor: "numbers.md#counts-g-n", summary: "+ count" },
  "marker.scalarNeg": { anchor: "numbers.md#marker-vowel-referential-identity", summary: "- negative" },
  "marker.ordinalFwd": { anchor: "numbers.md#ordinals-g-n", summary: "# ordinal" },
  "marker.ordinalEnd": { anchor: "numbers.md#from-the-end-—-end-relative-ordinal-marker-ue", summary: "#- ordinal from the end" },
  "marker.label": { anchor: "numbers.md#marker-vowel-referential-identity", summary: "_ label / digit string" },
  "marker.negativeLabel": { anchor: "numbers.md#stacked-markers", summary: "#_ negative label" },
  "marker.errorBound": { anchor: "numbers.md#stacked-markers", summary: "+- error bound" },
  digitless: { anchor: "numbers.md#more-than-one-g", summary: "number with no digits" },
  exponent: { anchor: "numbers.md#exponents", summary: "digitful exponent" },
  "exp.landmark": { anchor: "numbers.md#digitless-exponents", summary: "digitless exponent e / e-" },
  "exp.bareOom": { anchor: "numbers.md#bare-oom", summary: "bare OoM band e0 / e3" },
  "exp.zero": { anchor: "numbers.md#zero-×-exponent", summary: "zero × exponent 0e / ±0e-1" },
  "exp.hyperbole": { anchor: "numbers.md#hyperbole-—-mantissa-digitless-exponent", summary: "mantissa + digitless exponent (1e)" },
  "exp.shortfall": { anchor: "numbers.md#special-referential", summary: "just-short -e-" },
  percent: { anchor: "numbers-applied.md#percent-and-percentage-points", summary: "percent / percentage points" },
  decimal: { anchor: "numbers.md#exponents", summary: "decimal point" },
  groups: { anchor: "numbers.md#group-separator", summary: "more than one digit group" },
  calendar: { anchor: "numbers-applied.md#time", summary: "calendar ordinal (date)" },
  "writingMark.~": { anchor: "numbers.md#number-endings", summary: "~ = -m in writing" },
  "writingMark.@": { anchor: "numbers.md#number-endings", summary: "@ = -n in writing" },
  "writingMark.=": { anchor: "numbers.md#number-endings", summary: "= = -r in writing" },
  "pos.v": { anchor: "numbers.md#number-as-verb-by-marker", summary: "number as verb" },
  "pos.h": { anchor: "numbers.md#number-as-adverb-by-marker", summary: "number as adverb" },
  "pos.th": { anchor: "numbers.md#number-as-stance-by-marker", summary: "number as stance" },
  "pos.y": { anchor: "numbers.md#number-as-interjection-by-marker", summary: "number as interjection" },
  "pos.x": { anchor: "numbers.md#number-as-discourse-marker-by-marker", summary: "number as discourse marker" },
} satisfies Record<string, ConstructionEntry>;

type Vowel = "a" | "e" | "o" | "u";

/** Interests: each stance vowel, and the endings on it (interests.md). */
export const INTEREST_FEATURE_CONSTRUCTIONS: Record<`stance.${Vowel}` | `ending.${Vowel}.${"l" | "m" | "r"}`, ConstructionEntry> = {
  "stance.a": { anchor: "interests.md#how-it-is-appreciated-endings-on-met", summary: "met tha" },
  "stance.u": { anchor: "interests.md#unmet-thu-detracts-from-the-interest", summary: "unmet thu" },
  "stance.e": { anchor: "interests.md#prescription-the-ought-this-act-for-this-interest", summary: "prescription the" },
  "stance.o": { anchor: "interests.md#motive-tho-preference-standing", summary: "motive tho" },
  "ending.a.l": { anchor: "interests.md#how-it-is-appreciated-endings-on-met", summary: "met contact channel -l" },
  "ending.a.m": { anchor: "interests.md#how-it-is-appreciated-endings-on-met", summary: "met contact channel -m" },
  "ending.a.r": { anchor: "interests.md#how-it-is-appreciated-endings-on-met", summary: "met contact channel -r" },
  "ending.u.l": { anchor: "interests.md#unmet-thu-detracts-from-the-interest", summary: "unmet -l" },
  "ending.u.m": { anchor: "interests.md#unmet-thu-detracts-from-the-interest", summary: "unmet -m" },
  "ending.u.r": { anchor: "interests.md#unmet-thu-detracts-from-the-interest", summary: "unmet -r" },
  "ending.e.l": { anchor: "interests.md#prescription-the-ought-this-act-for-this-interest", summary: "invited prescription" },
  "ending.e.m": { anchor: "interests.md#prescription-the-ought-this-act-for-this-interest", summary: "offered prescription" },
  "ending.e.r": { anchor: "interests.md#prescription-the-ought-this-act-for-this-interest", summary: "protective prescription" },
  "ending.o.l": { anchor: "interests.md#motive-tho-preference-standing", summary: "motive standing -l" },
  "ending.o.m": { anchor: "interests.md#motive-tho-preference-standing", summary: "motive standing -m" },
  "ending.o.r": { anchor: "interests.md#motive-tho-preference-standing", summary: "motive standing -r" },
};

/** Join fence series vowel (joins.md, comparatives.md). */
export type JoinSeries = "a" | "o" | "ao" | "u" | "ua" | "uo" | "e" | "ae" | "oe" | "eo" | "ue";

export const JOIN_SERIES_CONSTRUCTIONS: Record<JoinSeries, ConstructionEntry> = {
  a: { anchor: "joins.md#and-lists-a", summary: "and" },
  o: { anchor: "joins.md#choice-o", summary: "exclusive or" },
  ao: { anchor: "joins.md#full-single-item-and-standalone-inventories", summary: "and/or" },
  u: { anchor: "joins.md#negation-u", summary: "none of" },
  ua: { anchor: "joins.md#everything-ua", summary: "everything but" },
  uo: { anchor: "joins.md#full-single-item-and-standalone-inventories", summary: "anything but" },
  e: { anchor: "joins.md#rank-e", summary: "rank" },
  ae: { anchor: "comparatives.md#equatives-ae-shared-scale", summary: "equal rank" },
  oe: { anchor: "joins.md#sequence-oe", summary: "sequence (first = start)" },
  eo: { anchor: "joins.md#reversed-sequence-eo", summary: "reversed sequence (first = end)" },
  ue: { anchor: "joins.md#invert-ua-uo-ue", summary: "rank reversal" },
};

/** Speech-act words: vowel, and the soft (-m) form (speech-moves.md). */
export const FORCE_CONSTRUCTIONS: Record<Vowel | "soft", ConstructionEntry> = {
  a: { anchor: "speech-moves.md#speech-act-statement-question-command", summary: "yal statement" },
  o: { anchor: "speech-moves.md#speech-act-statement-question-command", summary: "yol question" },
  e: { anchor: "speech-moves.md#speech-act-statement-question-command", summary: "jel command" },
  u: { anchor: "speech-moves.md#speech-act-statement-question-command", summary: "yul prohibition" },
  soft: { anchor: "questions.md#question", summary: "soft speech act (-m)" },
};

/** Polar stance particles, grouped by the section that teaches them (questions.md). */
export const POLAR_CONSTRUCTIONS = {
  starter: { anchor: "questions.md#polar-stance", summary: "yael yes / yuel no / yaol sure" },
  fuller: { anchor: "questions.md#polar-stance-fuller-inventory", summary: "juol / jual / joel" },
} satisfies Record<string, ConstructionEntry>;

/** Polar series → {@link POLAR_CONSTRUCTIONS} key. */
export const POLAR_GROUP: Record<Exclude<JoinSeries, Vowel | "eo">, keyof typeof POLAR_CONSTRUCTIONS> = {
  ae: "starter",
  ue: "starter",
  ao: "starter",
  uo: "fuller",
  ua: "fuller",
  oe: "fuller",
};

/** Restrictors, grouped by the section that teaches them (restrictors.md). */
export const RESTRICTOR_CONSTRUCTIONS = {
  onlyWhen: { anchor: "restrictors.md#only-when-never-hal", summary: "hal only when / never" },
  always: { anchor: "restrictors.md#always-hual", summary: "hual always" },
  sometimes: { anchor: "restrictors.md#sometimes-anytime-some-other-time", summary: "sometimes / anytime / some other time" },
  set: { anchor: "restrictors.md#sometimes-anytime-some-other-time", summary: "set / invert / inclusive restrictor" },
  ranked: { anchor: "restrictors.md#ranked-with-listed-occasions", summary: "ranked restrictor" },
} satisfies Record<string, ConstructionEntry>;

/** Restrictor series → {@link RESTRICTOR_CONSTRUCTIONS} key. */
export const RESTRICTOR_GROUP: Record<Exclude<JoinSeries, "eo">, keyof typeof RESTRICTOR_CONSTRUCTIONS> = {
  a: "onlyWhen",
  ua: "always",
  u: "sometimes",
  o: "set",
  ao: "set",
  uo: "set",
  e: "ranked",
  ae: "ranked",
  oe: "ranked",
  ue: "ranked",
};

/** Stand-in vowels (dependents.md). */
export const STAND_IN_CONSTRUCTIONS: Record<Vowel, ConstructionEntry> = {
  a: { anchor: "dependents.md#dependent-clauses", summary: "darl / barl that" },
  o: { anchor: "dependents.md#dependent-clauses", summary: "dorl whether" },
  e: { anchor: "dependents.md#stand-in", summary: "derl to" },
  u: { anchor: "dependents.md#stand-in", summary: "durl lest" },
};

/** Hook forms (hooks.md). */
export const HOOK_FORM_CONSTRUCTIONS: Record<ExtraNounHook, ConstructionEntry> = {
  al: { anchor: "hooks.md#including-am-al", summary: "al including" },
  am: { anchor: "hooks.md#including-am-al", summary: "am including" },
  el: { anchor: "hooks.md#rather-el", summary: "el rather" },
  em: { anchor: "hooks.md#closed-and-open-endings", summary: "em rather" },
  ol: { anchor: "hooks.md#instead-ol", summary: "ol instead" },
  om: { anchor: "hooks.md#closed-and-open-endings", summary: "om instead" },
  ul: { anchor: "hooks.md#except-ul", summary: "ul except" },
  um: { anchor: "hooks.md#closed-and-open-endings", summary: "um except" },
  aol: { anchor: "hooks.md#extra-noun-stacked-vowels-and-loose-m", summary: "aol" },
  aom: { anchor: "hooks.md#extra-noun-stacked-vowels-and-loose-m", summary: "aom" },
  ael: { anchor: "hooks.md#extra-noun-stacked-vowels-and-loose-m", summary: "ael" },
  aem: { anchor: "hooks.md#extra-noun-stacked-vowels-and-loose-m", summary: "aem" },
  oel: { anchor: "hooks.md#extra-noun-stacked-vowels-and-loose-m", summary: "oel" },
  oem: { anchor: "hooks.md#extra-noun-stacked-vowels-and-loose-m", summary: "oem" },
  ual: { anchor: "hooks.md#extra-noun-stacked-vowels-and-loose-m", summary: "ual" },
  uam: { anchor: "hooks.md#extra-noun-stacked-vowels-and-loose-m", summary: "uam" },
  uol: { anchor: "hooks.md#extra-noun-stacked-vowels-and-loose-m", summary: "uol" },
  uom: { anchor: "hooks.md#extra-noun-stacked-vowels-and-loose-m", summary: "uom" },
  uel: { anchor: "hooks.md#extra-noun-stacked-vowels-and-loose-m", summary: "uel" },
  uem: { anchor: "hooks.md#extra-noun-stacked-vowels-and-loose-m", summary: "uem" },
};

/**
 * Span features: spoken TYPE / EDGE / ending, written marks, close flavor (spans.md).
 * TYPE / EDGE / ending are homed at the spoken word shape, whose table introduces all three.
 */
export const SPAN_FEATURE_CONSTRUCTIONS: Record<
  `type.${Vowel}` | `edge.${Vowel}` | `ending.${"l" | "m" | "n" | "r"}` | `mark.${"@" | "~"}` | `close.${SpanCloseFlavor}`,
  ConstructionEntry
> = {
  "type.a": { anchor: "spans.md#shape", summary: "TYPE a cite" },
  "type.e": { anchor: "spans.md#shape", summary: "TYPE e aside" },
  "type.o": { anchor: "spans.md#shape", summary: "TYPE o mention" },
  "type.u": { anchor: "spans.md#shape", summary: "TYPE u opaque" },
  "edge.a": { anchor: "spans.md#shape", summary: "EDGE a multi-clause" },
  "edge.e": { anchor: "spans.md#shape", summary: "EDGE e clause-scoped" },
  "edge.o": { anchor: "spans.md#shape", summary: "EDGE o atomic" },
  "edge.u": { anchor: "spans.md#shape", summary: "EDGE u empty" },
  "ending.l": { anchor: "spans.md#shape", summary: "exact span" },
  "ending.m": { anchor: "spans.md#shape", summary: "paraphrase span" },
  "ending.n": { anchor: "spans.md#shape", summary: "proper span" },
  "ending.r": { anchor: "spans.md#shape", summary: "span resume" },
  "mark.@": { anchor: "spans.md#exact-paraphrase-proper", summary: "@ proper span" },
  "mark.~": { anchor: "spans.md#exact-paraphrase-proper", summary: "~ paraphrase span" },
  "close.complete": { anchor: "spans.md#shape", summary: "span close" },
  "close.editorial": { anchor: "spans.md#close-forms-complete-editorial-close-all", summary: "editorial close" },
  "close.closeAll": { anchor: "spans.md#close-forms-complete-editorial-close-all", summary: "close-all" },
};

/** Role compounds: role vowel and the -r instance (roles.md). */
export const ROLE_FEATURE_CONSTRUCTIONS: Record<`vowel.${Vowel}` | "instance", ConstructionEntry> = {
  "vowel.a": { anchor: "roles.md#role-compounds", summary: "agent a" },
  "vowel.u": { anchor: "roles.md#the-undergoer-u", summary: "patient u" },
  "vowel.e": { anchor: "roles.md#the-place-e", summary: "place e" },
  "vowel.o": { anchor: "roles.md#the-extra-b-party-o", summary: "recipient o" },
  instance: { anchor: "roles.md#this-instance-r", summary: "-r this instance" },
};

function prefixed(prefix: string, entries: Record<string, ConstructionEntry>): [string, ConstructionEntry][] {
  return Object.entries(entries).map(([key, entry]) => [`${prefix}.${key}`, entry]);
}

/** Every construction ID → entry, except `overlay.*` ({@link constructionRegistry}). */
export const CONSTRUCTIONS: ReadonlyMap<string, ConstructionEntry> = new Map([
  ...prefixed("sentence", SENTENCE_CONSTRUCTIONS),
  ...prefixed("token", TOKEN_CONSTRUCTIONS),
  ...prefixed("word.family", WORD_FAMILY_CONSTRUCTIONS),
  ...prefixed("word.xFamily", WORD_XFAMILY_CONSTRUCTIONS),
  ...prefixed("word.reading", WORD_READING_CONSTRUCTIONS),
  ...prefixed("word.ending", WORD_ENDING_CONSTRUCTIONS),
  ...prefixed("word.plural", WORD_PLURAL_CONSTRUCTIONS),
  ...prefixed("word", WORD_MISC_CONSTRUCTIONS),
  ...prefixed("resolve", RESOLVE_CONSTRUCTIONS),
  ...prefixed("reading", READING_CONSTRUCTIONS),
  ...prefixed("tone", TONE_CONSTRUCTIONS),
  ...prefixed("number", NUMBER_FEATURE_CONSTRUCTIONS),
  ...prefixed("interest", INTEREST_FEATURE_CONSTRUCTIONS),
  ...prefixed("join", JOIN_SERIES_CONSTRUCTIONS),
  ...prefixed("force", FORCE_CONSTRUCTIONS),
  ...prefixed("polar", POLAR_CONSTRUCTIONS),
  ...prefixed("restrictor", RESTRICTOR_CONSTRUCTIONS),
  ...prefixed("standIn", STAND_IN_CONSTRUCTIONS),
  ...prefixed("hook", HOOK_FORM_CONSTRUCTIONS),
  ...prefixed("span", SPAN_FEATURE_CONSTRUCTIONS),
  ...prefixed("role", ROLE_FEATURE_CONSTRUCTIONS),
]);

type OverlayEntrySource = { senseForm: string; pos: string; anchor: string; kind: string; gloss: string };

/** Every construction ID → entry, including one `overlay.*` entry per closed overlay row. */
export function constructionRegistry(overlays: Iterable<OverlayEntrySource>): Map<string, ConstructionEntry> {
  const registry = new Map(CONSTRUCTIONS);
  for (const o of overlays) {
    registry.set(overlayConstructionId(o), { anchor: o.anchor, summary: `${o.kind} overlay ${o.gloss}` });
  }
  return registry;
}

/**
 * Shapes the grammar docs rule out, checked in [enforce.ts](./enforce.ts). Each
 * anchor is the section that states the rule, so an error sends the reader there.
 */
export const REJECTIONS = {
  sentenceEndMark: { anchor: "speech-moves.md#tone-marks", summary: "a sentence ends in `.`; `?` / `!` are tone-mark prefixes" },
  toneStack: { anchor: "speech-moves.md#tone-marks", summary: "only ! !! ? ?! % & ; are tone marks; other stacks are not" },
  toneTarget: { anchor: "speech-moves.md#tone-marks", summary: "a tone mark goes before a word, an island open ^, or a span" },
  linkerMidSentence: { anchor: "dependents.md#sentence-linkers", summary: "a sentence linker comes only at the start of a sentence" },
  pluralOnPos: { anchor: "plurality.md#beginner", summary: "-x is unused on /w/, /h/, /th/, and /x/" },
  interestSlot: { anchor: "interests.md#beginner", summary: "an interest form goes on /ɡ/, /th/, or /w/ only" },
  interestRoot: { anchor: "interests.md#interest-inventory", summary: "only the six interest roots take the interest form" },
  pluralKindAfterUniversal: { anchor: "joins.md#universals-domains-generics", summary: "the kind word after ua / uo takes no -x" },
  rankJoinNumberManner: { anchor: "comparatives.md#manner-scale", summary: "the /h/ after a rank join is a manner word; the only number there is digitless h+ (how often)" },
  reversedSequenceSlot: { anchor: "joins.md#reversed-sequence-eo", summary: "eo is a phrase join only (/z/ /d/ /b/ /ɡ/)" },
  standInHost: { anchor: "dependents.md#dependent-clauses", summary: "a hosted stand-in is barl after a listed pole" },
  standInHostUndo: { anchor: "dependents.md#stand-in", summary: "burl follows only the so-that pole holalam or the if pole thadorom" },
  poleStack: { anchor: "causation.md#only-because", summary: "pole stacks are theberom thurugum and hezebam thadorom" },
  objectNeedsVerb: { anchor: "predication.md#existence", summary: "an object /d/ needs a verb" },
  numberResumeUnbound: { anchor: "numbers.md#digitless", summary: "a number -r needs an earlier number to match" },
  shortResumeUnbound: { anchor: "pronouns.md#resume-r", summary: "a short -r resume needs an earlier word to match" },
  leftFence: { anchor: "joins.md#right-close", summary: "a join word closes its conjuncts; it never comes before them" },
  emptyIsland: { anchor: "spans.md#scope-islands", summary: "a scope island needs words between its edges" },
  islandBinder: { anchor: "spans.md#scope-islands", summary: "a scope island needs a binder inside: an /h/ word or a join" },
  asOfIntroduceBound: { anchor: "relations.md#as-of", summary: "an as-of word introduces its bound with a /b/ word" },
  asOfResumeBound: { anchor: "relations.md#as-of", summary: "an as-of resume (-r) takes no /b/" },
  asOfPerHost: { anchor: "relations.md#as-of", summary: "one /h/ host takes at most one as-of pair" },
} satisfies Record<string, ConstructionEntry>;

export type RejectionId = keyof typeof REJECTIONS;
