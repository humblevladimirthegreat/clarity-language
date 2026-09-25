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
 *
 * Anchors are `page.md#id` under docs/grammar/ and must resolve.
 */
import type { TokenBranch } from "./tokens.js";
import type { AnaphorKind, Ending, LexReading, MorphWordFamily, Pos, XFamily } from "./types.js";

export type ConstructionEntry = { anchor: string; summary: string };

/** Sentence grammar: `rule.childKey` (sub-rule, token type, or LABEL). */
export const SENTENCE_CONSTRUCTIONS: Record<string, ConstructionEntry> = {
  "document.utterance": { anchor: "clause.md#beginner", summary: "a text is one or more utterances" },
  "document.EOF": { anchor: "clause.md#beginner", summary: "end of text" },

  "utterance.leftEdge": { anchor: "speech-moves.md#turn-j", summary: "turn cluster before the body" },
  "utterance.edgeBody": { anchor: "speech-moves.md#turn-j", summary: "body after a turn cluster" },
  "utterance.bodyClause": { anchor: "clause.md#beginner", summary: "body with no turn cluster (implied jal)" },
  "utterance.Period": { anchor: "dependents.md#orthography-and-prosody-periods", summary: "sentence end" },
  "utterance.nextBody": { anchor: "dependents.md#continue-x", summary: "next sentence in the same turn" },

  "leftEdge.Vocative": { anchor: "speech-moves.md#vocative", summary: "vocative / greeting at the left edge" },
  "leftEdge.Polar": { anchor: "questions.md#polar-stance", summary: "polar stance turn" },
  "leftEdge.W": { anchor: "hooks.md#hook-w", summary: "/w/ on a left-edge hook" },
  "leftEdge.Hook": { anchor: "hooks.md#discourse-hooks", summary: "discourse hook at the left edge" },
  "leftEdge.ForceEcho": { anchor: "speech-moves.md#emphatic-prohibition", summary: "jul jul emphatic prohibition" },
  "leftEdge.Force": { anchor: "speech-moves.md#speech-act", summary: "speech-act word" },

  "bodyClause.Linker": { anchor: "dependents.md#sentence-linkers", summary: "sentence linker before a clause" },
  "bodyClause.clause": { anchor: "clause.md#beginner", summary: "clause body" },
  "clause.clausePart": { anchor: "clause.md#beginner", summary: "clause is a run of units" },

  "clausePart.unit": { anchor: "clause.md#role-letters", summary: "role-lettered unit in a clause" },
  "clausePart.xJoinClose": { anchor: "join-across-roles.md#clause-sequence", summary: "clause join after its clause" },
  "clausePart.standaloneJoin": { anchor: "join-across-roles.md#vp-clause-forms", summary: "clause join with no clause before it" },
  "xJoinClose.JoinX": { anchor: "join-across-roles.md#clause-sequence", summary: "/x/ join fence" },

  "unit.islandUnit": { anchor: "joins.md#scope-islands-join", summary: "scope island" },
  "unit.spanUnit": { anchor: "spans.md#shape", summary: "spoken span" },
  "unit.zCoord": { anchor: "clause.md#role-letters", summary: "/z/ subject phrase" },
  "unit.dCoord": { anchor: "clause.md#role-letters", summary: "/d/ object phrase" },
  "unit.bCoord": { anchor: "clause.md#unhosted-b", summary: "unhosted /b/ phrase" },
  "unit.vpCoord": { anchor: "clause.md#role-letters", summary: "/v/ verb phrase" },
  "unit.gCoord": { anchor: "predication.md#classification", summary: "clause-level /ɡ/ (predicate adjective)" },
  "unit.hCoord": { anchor: "clause.md#adverbs-h", summary: "/h/ or stance /th/ unit" },
  "unit.hookUnit": { anchor: "hooks.md#extra-noun", summary: "in-clause hook" },

  "islandUnit.IslandEdge": { anchor: "spans.md#scope-islands", summary: "^ island edge" },
  "islandUnit.unit": { anchor: "spans.md#scope-islands", summary: "units inside an island" },

  "spanUnit.SpanOpen": { anchor: "spans.md#shape", summary: "span open word" },
  "spanUnit.atom": { anchor: "spans.md#edge", summary: "atomic span interior (EDGE o)" },
  "spanUnit.scopedUnit": { anchor: "spans.md#edge", summary: "clause-scoped span interior (EDGE e)" },
  "spanUnit.clause": { anchor: "spans.md#edge", summary: "multi-clause span interior (EDGE a)" },
  "spanUnit.SpanClose": { anchor: "spans.md#shape", summary: "span close word" },
  "spanUnit.closeAll": { anchor: "spans.md#nesting", summary: "editorial close then close-all" },

  "zCoord.zCoordPart": { anchor: "joins.md#right-close", summary: "/z/ phrase parts" },
  "dCoord.dCoordPart": { anchor: "joins.md#right-close", summary: "/d/ phrase parts" },
  "bCoord.bCoordPart": { anchor: "clause.md#unhosted-b", summary: "/b/ phrase parts" },
  "zCoordPart.npConjunct": { anchor: "joins.md#right-close", summary: "/z/ conjunct" },
  "zCoordPart.npJoinClose": { anchor: "joins.md#right-close", summary: "/z/ join after its conjuncts" },
  "zCoordPart.standaloneJoin": { anchor: "joins.md#standalone-phrase", summary: "standalone /z/ join" },
  "dCoordPart.npConjunct": { anchor: "joins.md#right-close", summary: "/d/ conjunct" },
  "dCoordPart.npJoinClose": { anchor: "joins.md#right-close", summary: "/d/ join after its conjuncts" },
  "dCoordPart.standaloneJoin": { anchor: "joins.md#standalone-phrase", summary: "standalone /d/ join" },
  "bCoordPart.npConjunct": { anchor: "clause.md#unhosted-b", summary: "/b/ conjunct" },
  "bCoordPart.npJoinClose": { anchor: "joins.md#right-close", summary: "/b/ join after its conjuncts" },
  "bCoordPart.standaloneJoin": { anchor: "joins.md#standalone-phrase", summary: "standalone /b/ join" },
  "npConjunct.npPackage": { anchor: "clause.md#role-letters", summary: "noun with its adjectives" },
  "npJoinClose.JoinZ": { anchor: "joins.md#join-type-vowel-series", summary: "/z/ join fence" },
  "npJoinClose.JoinD": { anchor: "joins.md#join-type-vowel-series", summary: "/d/ join fence" },
  "npJoinClose.JoinB": { anchor: "joins.md#join-type-vowel-series", summary: "/b/ join fence" },
  "npJoinClose.sharedAfterJoin": { anchor: "joins.md#join-series-ending-shared", summary: "shared word after a noun join" },

  "vpCoord.vpCoordPart": { anchor: "join-across-roles.md#vp-clause-forms", summary: "/v/ phrase parts" },
  "vpCoordPart.V": { anchor: "clause.md#role-letters", summary: "verb" },
  "vpCoordPart.vJoinClose": { anchor: "join-across-roles.md#vp-clause-forms", summary: "/v/ join after its verbs" },
  "vpCoordPart.standaloneJoin": { anchor: "joins.md#standalone-phrase", summary: "standalone /v/ join" },
  "vJoinClose.JoinV": { anchor: "join-across-roles.md#vp-clause-forms", summary: "/v/ join fence" },
  "vJoinClose.sharedAfterJoin": { anchor: "join-across-roles.md#vp-clause-forms", summary: "shared /h/ after a verb join (covers every verb)" },

  "gCoord.gCoordPart": { anchor: "predication.md#classification", summary: "/ɡ/ phrase parts" },
  "gCoordPart.gPackage": { anchor: "predication.md#classification", summary: "clause-level adjective" },
  "gCoordPart.gJoinClose": { anchor: "joins.md#right-close", summary: "/ɡ/ join after its adjectives" },
  "gCoordPart.standaloneJoin": {
    anchor: "predication.md#classification-packaging",
    summary: "/ɡ/ join closing the adjective on the noun before it",
  },
  "gJoinClose.JoinG": { anchor: "joins.md#join-type-vowel-series", summary: "/ɡ/ join fence" },
  "gJoinClose.sharedAfterJoin": { anchor: "numbers-applied.md#ranges", summary: "continuum /ɡ/ after a join of number endpoints" },

  "hCoord.hCoordPart": { anchor: "clause.md#adverbs-h", summary: "/h/ phrase parts" },
  "hCoordPart.hUnitRule": { anchor: "clause.md#adverbs-h", summary: "adverb or stance word" },
  "hCoordPart.hJoinClose": { anchor: "join-across-roles.md#stance-joins", summary: "/h/ join after its adverbs" },
  "hCoordPart.standaloneJoin": { anchor: "join-across-roles.md#standalone-stance-joins", summary: "standalone stance /th/ join" },
  "hJoinClose.JoinH": { anchor: "join-across-roles.md#stance-joins", summary: "/h/ join fence" },

  "hUnitRule.W": { anchor: "clause.md#adjective-detail-w", summary: "/w/ detail on an adverb" },
  "hUnitRule.H": { anchor: "clause.md#adverbs-h", summary: "/h/ or /th/ word" },
  "hUnitRule.B": { anchor: "relations.md#beginner", summary: "hosted /b/ after /h/" },
  "hUnitRule.Odo": { anchor: "dependents.md#dependent-clauses", summary: "stand-in hosted on /h/" },
  "hookUnit.W": { anchor: "hooks.md#hook-w", summary: "/w/ on an in-clause hook" },
  "hookUnit.Hook": { anchor: "hooks.md#extra-noun", summary: "in-clause hook" },

  "npPackage.gPackage": { anchor: "clause.md#adjectives-ɡ", summary: "adjective on a noun (gl- before, /ɡ/ after)" },
  "npPackage.Z": { anchor: "clause.md#role-letters", summary: "/z/ noun" },
  "npPackage.D": { anchor: "clause.md#role-letters", summary: "/d/ noun" },
  "npPackage.B": { anchor: "clause.md#unhosted-b", summary: "/b/ noun" },
  "npPackage.Odo": { anchor: "dependents.md#stand-in", summary: "stand-in as a noun" },
  "npPackage.WritingSpan": { anchor: "spans.md#writing", summary: "written span as a noun" },

  "asOfWPair.W": { anchor: "relations.md#as-of", summary: "as-of /w/" },
  "asOfWPair.B": { anchor: "relations.md#as-of", summary: "as-of /b/ bound" },
  "gPackage.W": { anchor: "clause.md#adjective-detail-w", summary: "/w/ detail on an adjective" },
  "gPackage.asOfWPair": { anchor: "relations.md#as-of", summary: "as-of pair before an adjective" },
  "gPackage.G": { anchor: "clause.md#adjectives-ɡ", summary: "/ɡ/ adjective" },
  "gPackage.B": { anchor: "relations.md#beginner", summary: "hosted /b/ after /ɡ/" },

  "sharedAfterJoin.gPackage": { anchor: "joins.md#join-series-ending-shared", summary: "shared /ɡ/ after a join" },
  "sharedAfterJoin.hUnitRule": { anchor: "comparatives.md#manner-scale", summary: "shared /h/ after a join" },
};

/** Which slot a word may fill (`classifyTokenBranch`). */
export const TOKEN_CONSTRUCTIONS: Record<TokenBranch, ConstructionEntry> = {
  hook: { anchor: "hooks.md#hooks", summary: "prefix-less hook" },
  spanClose: { anchor: "spans.md#shape", summary: "span close word" },
  writingSpanSlot: { anchor: "spans.md#pos", summary: "written span in a non-noun slot" },
  writingSpan: { anchor: "spans.md#writing", summary: "written span as a noun" },
  spanOpen: { anchor: "spans.md#shape", summary: "spoken span open" },
  standIn: { anchor: "dependents.md#stand-in", summary: "stand-in (darl / barl / …)" },
  join: { anchor: "joins.md#join-type-vowel-series", summary: "join fence word" },
  joinAct: { anchor: "join-across-roles.md#join-act-verbs", summary: "join-act verb" },
  joinRelationG: { anchor: "join-across-roles.md#join-relations", summary: "join-relation on /ɡ/" },
  joinRelationH: { anchor: "join-across-roles.md#join-relations", summary: "join-relation on /h/ or /th/" },
  greeting: { anchor: "x-compounds.md#conversation-length", summary: "conversation-length bid (citation + x + vowel + -n)" },
  polar: { anchor: "questions.md#polar-stance", summary: "polar stance particle" },
  force: { anchor: "speech-moves.md#speech-act", summary: "speech-act word" },
  jFallbackVocative: { anchor: "speech-moves.md#vocative", summary: "any other /j/ word read as a vocative" },
  linker: { anchor: "dependents.md#sentence-linkers", summary: "/x/ content word as a sentence linker" },
  content: { anchor: "clause.md#role-letters", summary: "content word in its role slot" },
  citationFallback: { anchor: "word-endings.md#citation-forms", summary: "prefix-less citation read as a noun" },
};

type FamilyKind = MorphWordFamily["kind"];

export const WORD_FAMILY_CONSTRUCTIONS: Record<FamilyKind, ConstructionEntry> = {
  content: { anchor: "clause.md#role-letters", summary: "content word" },
  number: { anchor: "numbers.md#digits", summary: "number word" },
  x: { anchor: "x-compounds.md#families-by-shape", summary: "mid-word x compound" },
  spanClose: { anchor: "spans.md#shape", summary: "span close" },
  hook: { anchor: "hooks.md#hooks", summary: "hook" },
  hookCompound: { anchor: "hooks.md#hook-compounds", summary: "fused extra-noun hook compound" },
  joinMarker: { anchor: "joins.md#join-type-vowel-series", summary: "vowel-series join / turn word" },
  writingSpan: { anchor: "spans.md#writing", summary: "written span" },
  foreign: { anchor: "spans.md#loans", summary: "foreign / opaque payload" },
};

export const WORD_XFAMILY_CONSTRUCTIONS: Record<XFamily, ConstructionEntry> = {
  span: { anchor: "spans.md#shape", summary: "span open" },
  role: { anchor: "roles.md#role-compounds", summary: "role compound" },
  value: { anchor: "values.md#word-shape", summary: "value need word" },
  lateral: { anchor: "roles.md#viewpoint-laterals", summary: "viewpoint lateral" },
  ability: { anchor: "intention.md#ability", summary: "ability compound" },
  numeric: { anchor: "numeric-derivation.md#numeric-derivation", summary: "numeric derivation" },
  compound: { anchor: "x-compounds.md#ordinary-compound-order", summary: "ordinary x compound" },
};

export const WORD_READING_CONSTRUCTIONS: Record<LexReading, ConstructionEntry> = {
  ordinary: { anchor: "clause.md#role-letters", summary: "ordinary content reading" },
  value: { anchor: "values.md#need-inventory", summary: "need reading" },
  ability: { anchor: "intention.md#ability", summary: "ability reading" },
  greeting: { anchor: "x-compounds.md#conversation-length", summary: "conversation-length bid" },
  restrictor: { anchor: "restrictors.md#restrictors", summary: "restrictor" },
  mood: { anchor: "knowing.md#may", summary: "closed stance mood" },
  locative: { anchor: "relations.md#locative-relations", summary: "locative relation" },
  similative: { anchor: "relations.md#similative", summary: "similative" },
  ofRelation: { anchor: "relations.md#of-relations", summary: "of-relation" },
  exchange: { anchor: "relations.md#exchange", summary: "exchange" },
  proxy: { anchor: "relations.md#proxy", summary: "proxy" },
  stimulus: { anchor: "values.md#stimulus", summary: "stimulus" },
  join: { anchor: "joins.md#join-type-vowel-series", summary: "join" },
  standIn: { anchor: "dependents.md#stand-in", summary: "stand-in" },
  standInNamed: { anchor: "dependents.md#stand-in-roles", summary: "named stand-in" },
  joinAct: { anchor: "join-across-roles.md#join-act-verbs", summary: "join-act verb" },
  joinRelation: { anchor: "join-across-roles.md#join-relations", summary: "join-relation" },
  number: { anchor: "numbers.md#digits", summary: "number" },
  unknown: { anchor: "word-endings.md#citation-forms", summary: "unclassified root" },
};

export const WORD_ENDING_CONSTRUCTIONS: Record<Ending, ConstructionEntry> = {
  l: { anchor: "word-endings.md#concrete-l", summary: "-l concrete / literal" },
  m: { anchor: "word-endings.md#abstract-m", summary: "-m abstract / metaphor" },
  n: { anchor: "word-endings.md#proper-name--n", summary: "-n proper name" },
  r: { anchor: "pronouns.md#resume-r", summary: "-r resume" },
  rl: { anchor: "dependents.md#stand-in", summary: "-rl stand-in" },
  rm: { anchor: "dependents.md#stand-in", summary: "-rm stand-in" },
  rn: { anchor: "dependents.md#stand-in-roles", summary: "-rn named stand-in" },
};

export const WORD_PLURAL_CONSTRUCTIONS: Record<Exclude<Pos, "w" | "h" | "th" | "x">, ConstructionEntry> = {
  z: { anchor: "plurality.md#associative", summary: "-x on /z/" },
  d: { anchor: "plurality.md#associative", summary: "-x on /d/" },
  b: { anchor: "plurality.md#associative", summary: "-x on /b/" },
  j: { anchor: "plurality.md#person-role-x", summary: "-x on a vocative" },
  v: { anchor: "plurality.md#verbs-v", summary: "collective -x on /v/" },
  g: { anchor: "plurality.md#adjectives-g", summary: "collective -x on /ɡ/" },
};

export const WORD_MISC_CONSTRUCTIONS = {
  gl: { anchor: "clause.md#left-bound-adjectives", summary: "gl- left-bound adjective" },
} satisfies Record<string, ConstructionEntry>;

export const RESOLVE_CONSTRUCTIONS: Record<Exclude<`${AnaphorKind}.${"bound" | "unbound"}`, "number.unbound">, ConstructionEntry> = {
  "content.bound": { anchor: "pronouns.md#resume-r", summary: "-r binds an earlier content word" },
  "content.unbound": { anchor: "pronouns.md#resume-r", summary: "full-root -r with no earlier match (the one you both know)" },
  "span.bound": { anchor: "spans.md#endings", summary: "span resume binds an earlier span" },
  "span.unbound": { anchor: "spans.md#endings", summary: "span resume with no earlier span" },
  "number.bound": { anchor: "numbers.md#digitless", summary: "number -r binds an earlier number" },
  "role.bound": { anchor: "roles.md#role-compounds", summary: "role -r binds an earlier role compound" },
  "role.unbound": { anchor: "roles.md#role-compounds", summary: "role -r with no earlier match" },
};

/** Readings of a whole utterance or clause shape (`reading.*`, [construction-trace.ts](./construction-trace.ts)). */
export const READING_CONSTRUCTIONS = {
  existence: { anchor: "predication.md#existence", summary: "verbless /z/ clause: there is …" },
  bareQuestion: { anchor: "questions.md#question", summary: "jol. / jom. with no body: Huh? / Hm?" },
  greeting: { anchor: "word-endings.md#greeting", summary: "a named citation said alone: hello / goodbye" },
} satisfies Record<string, ConstructionEntry>;

function prefixed(prefix: string, entries: Record<string, ConstructionEntry>): [string, ConstructionEntry][] {
  return Object.entries(entries).map(([key, entry]) => [`${prefix}.${key}`, entry]);
}

/** Every construction ID → entry. */
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
]);

/**
 * Shapes the grammar docs rule out, checked in [enforce.ts](./enforce.ts). Each
 * anchor is the section that states the rule, so an error sends the reader there.
 */
export const REJECTIONS = {
  sentenceEndMark: { anchor: "speech-moves.md#tone-marks", summary: "a sentence ends in `.`; `?` / `!` are tone-mark prefixes" },
  linkerMidSentence: { anchor: "dependents.md#sentence-linkers", summary: "a sentence linker comes only at the start of a sentence" },
  pluralOnPos: { anchor: "plurality.md#beginner", summary: "-x is unused on /w/, /h/, /th/, and /x/" },
  valueSlot: { anchor: "values.md#values", summary: "a need form goes on /ɡ/, /th/, or /w/ only" },
  valueRoot: { anchor: "values.md#need-inventory", summary: "only the six need roots take the need form" },
  pluralKindAfterUniversal: { anchor: "joins.md#universals-domains-generics", summary: "the kind word after ua / uo takes no -x" },
  rankJoinNumberManner: { anchor: "comparatives.md#manner-scale", summary: "the /h/ after a rank join is a manner word, not a number" },
  standInHost: { anchor: "dependents.md#dependent-clauses", summary: "a hosted stand-in is barl after a listed pole" },
  standInHostUndo: { anchor: "dependents.md#stand-in", summary: "burl follows only the so-that pole holalam" },
  poleStack: { anchor: "causation.md#only-because", summary: "the only pole stack is theberom thurugum" },
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
