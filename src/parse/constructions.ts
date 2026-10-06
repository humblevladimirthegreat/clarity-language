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
import type { AnaphorKind, Ending, LexReading, MorphWordFamily, PointerVowel, Pos, RoleVowel, XFamily } from "./types.js";

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
  "leftEdge.Interjection": { anchor: "speech-moves.md#interjections-reactions", summary: "interjection at the left edge" },
  "leftEdge.Polar": { anchor: "questions.md#polar-stance", summary: "polar stance turn" },
  "leftEdge.W": { anchor: "hooks.md#hook-w", summary: "/w/ on a left-edge hook" },
  "leftEdge.Hook": { anchor: "hooks.md#discourse-hooks", summary: "discourse hook at the left edge" },
  "leftEdge.ForceEcho": { anchor: "speech-moves.md#emphatic-prohibition", summary: "yul yul emphatic prohibition" },
  "leftEdge.ForceAnswer": { anchor: "questions.md#rhetorical", summary: "yal yol rhetorical question" },
  "leftEdge.Force": { anchor: "speech-moves.md#speech-act-statement-question-command", summary: "speech-act word" },

  "bodyClause.Linker": { anchor: "dependents.md#continue-x", summary: "sentence linker before a clause" },
  "bodyClause.topicMarker": { anchor: "spans.md#mention", summary: "mention marker before a topic span" },
  "bodyClause.clause": { anchor: "word-endings.md#greeting", summary: "clause body" },

  "clause.clauseItem": { anchor: "word-endings.md#greeting", summary: "clause, or a stand-in clause join" },
  "clause.midJoin": { anchor: "joins.md#clause-joins", summary: "/x/ join between clauses" },
  "clauseItem.unit": { anchor: "word-endings.md#greeting", summary: "role-lettered unit in a clause" },
  "clauseItem.standIn": { anchor: "joins.md#clause-joins", summary: "standalone /x/ join as a stand-in clause" },
  "bodyClause.crossJoin": { anchor: "joins.md#clause-joins", summary: "/x/ join linking the prior sentence to this one" },

  "unit.islandUnit": { anchor: "spans.md#scope-islands", summary: "scope island" },
  "unit.zCoord": { anchor: "word-endings.md#greeting", summary: "/z/ subject phrase" },
  "unit.dCoord": { anchor: "clause.md#direct-object-d", summary: "/d/ object phrase" },
  "unit.bCoord": { anchor: "clause.md#extra-nouns", summary: "unhosted /b/ phrase" },
  "unit.vpCoord": { anchor: "clause.md#who-acts-and-the-action", summary: "/v/ verb phrase" },
  "unit.gCoord": { anchor: "joins.md#negation-u", summary: "clause-level /ɡ/ (predicate adjective)" },
  "unit.hCoord": { anchor: "clause.md#adverbs-h", summary: "/h/ or stance /th/ unit" },
  "unit.hookUnit": { anchor: "hooks.md#including-am-al", summary: "in-clause hook" },

  "islandUnit.IslandOpen": { anchor: "spans.md#scope-islands", summary: "{ island open" },
  "islandUnit.IslandClose": { anchor: "spans.md#scope-islands", summary: "} island close" },
  "islandUnit.unit": { anchor: "spans.md#scope-islands", summary: "units inside an island" },


  "zCoord.zCoordPart": { anchor: "word-endings.md#greeting", summary: "/z/ phrase parts" },
  "dCoord.dCoordPart": { anchor: "clause.md#direct-object-d", summary: "/d/ phrase parts" },
  "bCoord.bCoordPart": { anchor: "clause.md#extra-nouns", summary: "/b/ phrase parts" },
  "zCoordPart.npConjunct": { anchor: "word-endings.md#greeting", summary: "/z/ conjunct" },
  "zCoordPart.bar": { anchor: "comparatives.md#bars", summary: "/th/ stance word as a rank fence's bar" },
  "zCoordPart.npJoinClose": { anchor: "joins.md#and-lists-a", summary: "/z/ join after its conjuncts" },
  "zCoordPart.standaloneJoin": { anchor: "joins.md#standalone-phrase", summary: "standalone /z/ join" },
  "dCoordPart.npConjunct": { anchor: "clause.md#direct-object-d", summary: "/d/ conjunct" },
  "dCoordPart.bar": { anchor: "comparatives.md#bars", summary: "/th/ stance word as a rank fence's bar" },
  "dCoordPart.npJoinClose": { anchor: "joins.md#right-close", summary: "/d/ join after its conjuncts" },
  "dCoordPart.standaloneJoin": { anchor: "joins.md#standalone-phrase", summary: "standalone /d/ join" },
  "bCoordPart.npConjunct": { anchor: "clause.md#extra-nouns", summary: "/b/ conjunct" },
  "bCoordPart.bar": { anchor: "comparatives.md#bars", summary: "/th/ stance word as a rank fence's bar" },
  "bCoordPart.npJoinClose": { anchor: "joins.md#right-close", summary: "/b/ join after its conjuncts" },
  "bCoordPart.standaloneJoin": { anchor: "joins.md#standalone-phrase", summary: "standalone /b/ join" },
  "npConjunct.npPackage": { anchor: "word-endings.md#greeting", summary: "noun with its adjectives" },
  "npJoinClose.JoinZ": { anchor: "joins.md#and-lists-a", summary: "/z/ join fence" },
  "npJoinClose.JoinD": { anchor: "joins.md#and-lists-a", summary: "/d/ join fence" },
  "npJoinClose.JoinB": { anchor: "joins.md#and-lists-a", summary: "/b/ join fence" },
  "npJoinClose.W": { anchor: "joins.md#respectively", summary: "respectively /w/ before a noun join word" },
  "npJoinClose.factor": { anchor: "comparatives.md#factor", summary: "ratio number after an equative scale" },
  "npJoinClose.sharedAfterJoin": { anchor: "joins.md#right-close", summary: "shared word after a noun join" },

  "vpCoord.vpCoordPart": { anchor: "clause.md#who-acts-and-the-action", summary: "/v/ phrase parts" },
  "vpCoordPart.V": { anchor: "clause.md#who-acts-and-the-action", summary: "verb" },
  "vpCoordPart.B": { anchor: "predication.md#scope-relative", summary: "hosted /b/ after a pair-scope verb" },
  "vpCoordPart.vJoinClose": { anchor: "joins.md#and-lists-a", summary: "/v/ join after its verbs" },
  "vpCoordPart.standaloneJoin": { anchor: "joins.md#standalone-phrase", summary: "standalone /v/ join" },
  "vpCoordPart.vpItemUnit": { anchor: "join-across-roles.md#vp-clause-forms", summary: "words before a later verb of a /v/ list" },
  "vpItemUnit.dCoord": { anchor: "join-across-roles.md#vp-clause-forms", summary: "/d/ phrase inside a verb item" },
  "vpItemUnit.bCoord": { anchor: "join-across-roles.md#vp-clause-forms", summary: "/b/ phrase inside a verb item" },
  "vpItemUnit.hCoord": { anchor: "join-across-roles.md#vp-clause-forms", summary: "/h/ unit inside a verb item" },
  "vJoinClose.W": { anchor: "joins.md#respectively", summary: "respectively /w/ before a verb join word" },
  "vJoinClose.JoinV": { anchor: "joins.md#and-lists-a", summary: "/v/ join fence" },
  "vJoinClose.sharedAfterJoin": { anchor: "join-across-roles.md#vp-clause-forms", summary: "shared /h/ after a verb join (covers every verb)" },

  "gCoord.gCoordPart": { anchor: "joins.md#negation-u", summary: "/ɡ/ phrase parts" },
  "gCoordPart.gPackage": { anchor: "joins.md#negation-u", summary: "clause-level adjective" },
  "gCoordPart.gJoinClose": { anchor: "joins.md#right-close", summary: "/ɡ/ join after its adjectives" },
  "gCoordPart.standaloneJoin": {
    anchor: "predication.md#classification-packaging",
    summary: "/ɡ/ join closing the adjective on the noun before it",
  },
  "gJoinClose.W": { anchor: "joins.md#respectively", summary: "respectively /w/ before an adjective join word" },
  "gJoinClose.JoinG": { anchor: "joins.md#and-lists-a", summary: "/ɡ/ join fence" },

  "hCoord.hCoordPart": { anchor: "clause.md#adverbs-h", summary: "/h/ phrase parts" },
  "hCoordPart.hUnitRule": { anchor: "clause.md#adverbs-h", summary: "adverb or stance word" },
  "hCoordPart.hJoinClose": { anchor: "join-across-roles.md#stance-joins", summary: "/h/ join after its adverbs" },
  "hCoordPart.standaloneJoin": { anchor: "join-across-roles.md#standalone-stance-joins", summary: "standalone stance /th/ join" },
  "hJoinClose.JoinH": { anchor: "join-across-roles.md#stance-joins", summary: "/h/ join fence" },

  "hUnitRule.W": { anchor: "clause.md#adjective-detail-w", summary: "/w/ detail on an adverb" },
  "hUnitRule.H": { anchor: "clause.md#adverbs-h", summary: "/h/ or /th/ word" },
  "hUnitRule.B": { anchor: "clause.md#extra-nouns", summary: "hosted /b/ after /h/" },
  "hUnitRule.G": { anchor: "knowing.md#dated-channel", summary: "amount on a hosted /b/ (signed offset)" },
  "hUnitRule.Odo": { anchor: "dependents.md#dependent-clauses", summary: "stand-in hosted on /h/, or the grounds after a channel's offset" },
  "hUnitRule.gPackage": { anchor: "clause.md#complex-chaining", summary: "adjective on the landmark after an /h/ host" },
  "hookUnit.W": { anchor: "hooks.md#hook-w", summary: "/w/ on an in-clause hook" },
  "hookUnit.Hook": { anchor: "hooks.md#including-am-al", summary: "in-clause hook" },
  "hookUnit.frame": { anchor: "sakes.md#contrary-to-stance", summary: "uem + a /th/ stance: the frame the event goes contrary to" },

  "npPackage.gPackage": { anchor: "clause.md#adjectives-ɡ", summary: "adjective on a noun (gl- before, /ɡ/ after)" },
  "npPackage.itemHook": { anchor: "joins.md#right-close", summary: "hook on one join item, before the join word" },
  "npPackage.itemHookBound": { anchor: "joins.md#right-close", summary: "/b/ of a hook on one join item" },
  "npPackage.Z": { anchor: "word-endings.md#greeting", summary: "/z/ noun" },
  "npPackage.D": { anchor: "clause.md#direct-object-d", summary: "/d/ noun" },
  "npPackage.B": { anchor: "clause.md#extra-nouns", summary: "/b/ noun" },
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
  "gPackage.gPackage": { anchor: "clause.md#complex-chaining", summary: "adjective on the landmark after a /ɡ/ host" },
  "gPackage.B": { anchor: "predication.md#identity-same", summary: "hosted /b/ after /ɡ/" },

  "sharedAfterJoin.gPackage": { anchor: "joins.md#right-close", summary: "shared /ɡ/ after a join" },
  "sharedAfterJoin.hUnitRule": { anchor: "comparatives.md#manner-scale", summary: "shared /h/ after a join" },
  "sharedAfterJoin.scale": { anchor: "comparatives.md#time-scale", summary: "digitless bral after a rank join: how late" },
};

/** Which slot a word may fill (`classifyTokenBranch`). */
export const TOKEN_CONSTRUCTIONS: Record<TokenBranch, ConstructionEntry> = {
  hook: { anchor: "hooks.md#beginner", summary: "prefix-less hook" },
  writingSpanSlot: { anchor: "spans.md#asides-th", summary: "written span in a non-noun slot" },
  writingSpan: { anchor: "spans.md#writing", summary: "written span as a noun" },
  standIn: { anchor: "dependents.md#dependent-clauses", summary: "stand-in (darl / barl / …)" },
  join: { anchor: "joins.md#and-lists-a", summary: "join fence word" },
  joinAct: { anchor: "join-across-roles.md#join-act-verbs", summary: "join-act verb" },
  joinRelationG: { anchor: "join-across-roles.md#join-relations", summary: "join-relation on /ɡ/" },
  joinRelationH: { anchor: "join-across-roles.md#join-relations", summary: "join-relation on /h/ or /th/" },
  greeting: { anchor: "x-compounds.md#conversation-length", summary: "conversation-length bid (citation + x + vowel + -n)" },
  polar: { anchor: "questions.md#polar-stance", summary: "polar stance particle" },
  force: { anchor: "speech-moves.md#speech-act-statement-question-command", summary: "speech-act word" },
  yVocative: { anchor: "speech-moves.md#vocative", summary: "/y/ name (-n), named span, or resume (-r): a vocative" },
  yInterjection: { anchor: "speech-moves.md#interjections-reactions", summary: "/y/ word in -l / -m, or an unnamed span: an interjection" },
  linker: { anchor: "dependents.md#continue-x", summary: "/x/ content word: a sentence linker, or a topic word" },
  content: { anchor: "phonology.md#word-edges", summary: "content word in its role slot" },
  citationFallback: { anchor: "phonology.md#word-edges", summary: "prefix-less citation read as a noun" },
};

type FamilyKind = MorphWordFamily["kind"];

export const WORD_FAMILY_CONSTRUCTIONS: Record<FamilyKind, ConstructionEntry> = {
  content: { anchor: "phonology.md#word-edges", summary: "content word" },
  number: { anchor: "numbers.md#counts", summary: "number word" },
  x: { anchor: "sakes.md#met", summary: "mid-word x compound" },
  hook: { anchor: "hooks.md#beginner", summary: "hook" },
  hookCompound: { anchor: "hooks.md#hook-compounds", summary: "fused extra-noun hook compound" },
  joinMarker: { anchor: "speech-moves.md#speech-act-statement-question-command", summary: "vowel-series join / turn word" },
  writingSpan: { anchor: "spans.md#writing", summary: "written span" },
  foreign: { anchor: "spans.md#loans", summary: "foreign / opaque payload" },
  tag: { anchor: "pronouns.md#tag-pronouns", summary: "tag pronoun (role letter + w + tag vowel)" },
};

export const WORD_XFAMILY_CONSTRUCTIONS: Record<XFamily, ConstructionEntry> = {
  role: { anchor: "roles.md#role-compounds", summary: "role compound" },
  pointer: { anchor: "pronouns.md#role-pointers", summary: "role pointer" },
  sake: { anchor: "sakes.md#met", summary: "sake word" },
  scope: { anchor: "predication.md#label-scope", summary: "label scope" },
  lateral: { anchor: "roles.md#viewpoint-laterals", summary: "viewpoint lateral" },
  holder: { anchor: "knowing.md#holder", summary: "holder seam" },
  ability: { anchor: "x-compounds.md#conversation-length", summary: "ability compound" },
  numeric: { anchor: "numeric-derivation.md#numeric-derivation", summary: "numeric derivation" },
  compound: { anchor: "x-compounds.md#two-roots-one-word", summary: "ordinary x compound" },
};

/** Readings only a closed overlay produces; those words trace `overlay.*` instead. */
type OverlayOnlyReading =
  | "overlay"
  | "mention"
  | "joinAct"
  | "joinRelation";

/** Non-overlay readings (an overlay word traces `overlay.*`, not `word.reading.*`). */
export const WORD_READING_CONSTRUCTIONS: Record<Exclude<LexReading, OverlayOnlyReading>, ConstructionEntry> = {
  ordinary: { anchor: "phonology.md#word-edges", summary: "ordinary content reading" },
  sake: { anchor: "sakes.md#met", summary: "sake reading" },
  ability: { anchor: "intention.md#ability", summary: "ability reading" },
  greeting: { anchor: "x-compounds.md#conversation-length", summary: "conversation-length bid" },
  restrictor: { anchor: "restrictors.md#beginner", summary: "restrictor" },
  join: { anchor: "joins.md#and-lists-a", summary: "join" },
  standIn: { anchor: "dependents.md#dependent-clauses", summary: "stand-in" },
  standInNamed: { anchor: "dependents.md#stand-in-roles", summary: "named stand-in" },
  standInBack: { anchor: "dependents.md#stand-in-back", summary: "backward stand-in" },
  number: { anchor: "numbers.md#counts", summary: "number" },
  unknown: { anchor: "spans.md#writing", summary: "unclassified root" },
};

export const WORD_ENDING_CONSTRUCTIONS: Record<Ending, ConstructionEntry> = {
  l: { anchor: "phonology.md#word-edges", summary: "-l concrete / literal" },
  m: { anchor: "phonology.md#word-edges", summary: "-m abstract / metaphor" },
  n: { anchor: "phonology.md#word-edges", summary: "-n proper name" },
  ln: { anchor: "word-endings.md#name-instance--ln", summary: "-ln one thing the name applies to" },
  r: { anchor: "pronouns.md#resume-r", summary: "-r resume" },
  rl: { anchor: "dependents.md#dependent-clauses", summary: "-rl stand-in" },
  rm: { anchor: "dependents.md#stand-in", summary: "-rm stand-in" },
  rn: { anchor: "dependents.md#stand-in-roles", summary: "-rn named stand-in" },
  rth: { anchor: "dependents.md#stand-in-back", summary: "-rth backward stand-in" },
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

export const RESOLVE_CONSTRUCTIONS: Record<
  Exclude<`${AnaphorKind}.${"bound" | "unbound"}`, "number.unbound" | "tag.unbound" | "pointer.unbound" | "topic.unbound">,
  ConstructionEntry
> = {
  "content.bound": { anchor: "pronouns.md#resume-r", summary: "-r binds an earlier content word" },
  "content.unbound": { anchor: "pronouns.md#resume-r", summary: "-r with no earlier match (the one you both know)" },
  "number.bound": { anchor: "numbers.md#digitless", summary: "number -r binds an earlier number" },
  "tag.bound": { anchor: "pronouns.md#tag-pronouns", summary: "tag pronoun: assigned to a phrase, or recalling or sharing an assigned one" },
  "role.bound": { anchor: "roles.md#role-compounds", summary: "role -r binds an earlier role compound" },
  "role.unbound": { anchor: "roles.md#role-compounds", summary: "role -r with no earlier match" },
  "topic.bound": { anchor: "pronouns.md#topic-pronoun", summary: "topic pronoun: the one the talk is about now" },
  "pointer.bound": { anchor: "pronouns.md#role-pointers", summary: "role pointer binds a participant of an earlier or this predicate" },
};

/** Readings of a whole utterance or clause shape, or of a shared scale (`reading.*`, [construction-trace.ts](./construction-trace.ts)). */
export const READING_CONSTRUCTIONS = {
  existence: { anchor: "predication.md#existence", summary: "verbless /z/ clause: there is …" },
  kind: { anchor: "joins.md#kind-reference", summary: "zuan + kind: the kind itself, not its members" },
  amountScale: { anchor: "comparatives.md#amount-scale", summary: "digitless gral after a rank join: how many" },
  frequencyScale: { anchor: "comparatives.md#frequency-scale", summary: "digitless hral after a rank join: how often" },
  bareQuestion: { anchor: "questions.md#question", summary: "yol. / yom. with no body: Huh? / Hm?" },
  greeting: { anchor: "word-endings.md#greeting", summary: "a named citation said alone: hello / goodbye" },
} satisfies Record<string, ConstructionEntry>;

/** Tone marks: each mark, and each scope it colors (speech-moves.md § tone marks). */
export const TONE_CONSTRUCTIONS = {
  "mark.strong": { anchor: "speech-moves.md#tone-marks", summary: "! strong feeling" },
  "mark.strong2": { anchor: "speech-moves.md#tone-marks", summary: "!! stronger feeling" },
  "mark.unsure": { anchor: "questions.md#question-tone", summary: "? unsure" },
  "mark.unsure2": { anchor: "speech-moves.md#tone-marks", summary: "?? very unsure" },
  "mark.joking": { anchor: "speech-moves.md#tone-marks", summary: "% joking, not literal" },
  "mark.joking2": { anchor: "speech-moves.md#tone-marks", summary: "%% broadly joking" },
  "mark.contrast": { anchor: "speech-moves.md#tone-marks", summary: "& contrastive focus" },
  "mark.contrast2": { anchor: "speech-moves.md#tone-marks", summary: "&& strong contrast" },
  "mark.warm": { anchor: "speech-moves.md#tone-marks", summary: "; warm, affectionate" },
  "mark.warm2": { anchor: "speech-moves.md#tone-marks", summary: ";; very warm" },
  "mark.stack": { anchor: "speech-moves.md#tone-marks", summary: "two or more marks combined (`?!`, `&;`)" },
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
  "marker.scalarPos": { anchor: "numbers.md#counts", summary: "+ count" },
  "marker.scalarNeg": { anchor: "numbers.md#marker-vowel-referential-identity", summary: "- negative" },
  "marker.ordinalFwd": { anchor: "numbers.md#ordinals", summary: "# ordinal" },
  "marker.ordinalEnd": { anchor: "numbers.md#from-the-end-end-relative-ordinal-marker-ue", summary: "#- ordinal from the end" },
  "marker.label": { anchor: "numbers.md#marker-vowel-referential-identity", summary: "_ label / digit string" },
  "marker.negativeLabel": { anchor: "numbers.md#stacked-markers", summary: "#_ negative label" },
  "marker.errorBound": { anchor: "numbers.md#stacked-markers", summary: "+- error bound" },
  digitless: { anchor: "numbers.md#more-than-one", summary: "number with no digits" },
  exponent: { anchor: "numbers.md#exponents", summary: "digitful exponent" },
  "exp.landmark": { anchor: "numbers.md#digitless-exponents", summary: "digitless exponent e / e-" },
  "exp.bareOom": { anchor: "numbers.md#bare-oom", summary: "bare OoM band e0 / e3" },
  "exp.zero": { anchor: "numbers.md#zero-×-exponent", summary: "zero × exponent 0e / ±0e-1" },
  "exp.hyperbole": { anchor: "numbers.md#hyperbole-mantissa-digitless-exponent", summary: "mantissa + digitless exponent (1e)" },
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

/** Label scope: each seam vowel (predication.md#label-scope). */
const SCOPE_FEATURE_CONSTRUCTIONS: Record<string, ConstructionEntry> = {
  "vowel.a": { anchor: "predication.md#label-scope", summary: "this episode tha" },
  "vowel.e": { anchor: "predication.md#label-scope", summary: "practiced role the" },
  "vowel.o": { anchor: "predication.md#label-scope", summary: "this pair tho" },
  "vowel.u": { anchor: "predication.md#label-scope", summary: "type across scenes thu" },
  "vowel.ao": { anchor: "predication.md#scope-stacks", summary: "episode on this pair thao" },
  "vowel.ae": { anchor: "predication.md#scope-stacks", summary: "using the role thae" },
  "vowel.oe": { anchor: "predication.md#scope-stacks", summary: "toward the role thoe" },
  "vowel.ua": { anchor: "predication.md#scope-stacks", summary: "type except this episode thua" },
  "vowel.uo": { anchor: "predication.md#scope-stacks", summary: "type except this pair thuo" },
  "vowel.ue": { anchor: "predication.md#scope-stacks", summary: "not in that capacity thue" },
};

/** Sakes: each stance vowel, and the endings on it (sakes.md). */
export const SAKE_FEATURE_CONSTRUCTIONS: Record<`stance.${Vowel}` | `ending.${Vowel}.${"l" | "m" | "r"}` | "emotion", ConstructionEntry> = {
  "stance.a": { anchor: "sakes.md#met", summary: "met tha" },
  "stance.u": { anchor: "sakes.md#unmet-thu-detracts-from-the-sake", summary: "unmet thu" },
  "stance.e": { anchor: "sakes.md#prescription-the-ought-this-act-for-this-sake", summary: "prescription the" },
  "stance.o": { anchor: "sakes.md#motive-tho-time-horizon", summary: "motive tho" },
  "ending.a.l": { anchor: "sakes.md#time-horizon-endings-on-met", summary: "met time horizon -l" },
  "ending.a.m": { anchor: "sakes.md#met", summary: "met time horizon -m" },
  "ending.a.r": { anchor: "sakes.md#time-horizon-endings-on-met", summary: "met time horizon -r" },
  "ending.u.l": { anchor: "sakes.md#unmet-thu-detracts-from-the-sake", summary: "unmet -l" },
  "ending.u.m": { anchor: "sakes.md#unmet-thu-detracts-from-the-sake", summary: "unmet -m" },
  "ending.u.r": { anchor: "sakes.md#unmet-thu-detracts-from-the-sake", summary: "unmet -r" },
  "ending.e.l": { anchor: "sakes.md#prescription-the-ought-this-act-for-this-sake", summary: "invited prescription" },
  "ending.e.m": { anchor: "sakes.md#prescription-the-ought-this-act-for-this-sake", summary: "offered prescription" },
  "ending.e.r": { anchor: "sakes.md#prescription-the-ought-this-act-for-this-sake", summary: "trial prescription" },
  "ending.o.l": { anchor: "sakes.md#motive-tho-time-horizon", summary: "motive standing -l" },
  "ending.o.m": { anchor: "sakes.md#motive-tho-time-horizon", summary: "motive standing -m" },
  "ending.o.r": { anchor: "sakes.md#motive-tho-time-horizon", summary: "motive standing -r" },
  "emotion": { anchor: "sakes.md#emotion-compose", summary: "emotion tail (locus vowel + motion ending)" },
};

/** Join fence series vowel (joins.md, comparatives.md). */
export type JoinSeries = "a" | "o" | "ao" | "u" | "ua" | "uo" | "e" | "ae" | "oe" | "ue";

export const JOIN_SERIES_CONSTRUCTIONS: Record<JoinSeries, ConstructionEntry> = {
  a: { anchor: "joins.md#and-lists-a", summary: "and" },
  o: { anchor: "joins.md#choice-o", summary: "exclusive or" },
  ao: { anchor: "joins.md#full-single-item-and-standalone-inventories", summary: "and/or" },
  u: { anchor: "joins.md#negation-u", summary: "none of" },
  ua: { anchor: "joins.md#everything-ua", summary: "everything but" },
  uo: { anchor: "joins.md#full-single-item-and-standalone-inventories", summary: "anything but" },
  e: { anchor: "joins.md#rank-e", summary: "rank" },
  ae: { anchor: "joins.md#sequence-ae", summary: "sequence (first = start)" },
  oe: { anchor: "comparatives.md#equatives-oe-shared-scale", summary: "equal rank" },
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
  fuller: { anchor: "questions.md#polar-stance-fuller-inventory", summary: "yuol / yual / yoel" },
} satisfies Record<string, ConstructionEntry>;

/** Polar series → {@link POLAR_CONSTRUCTIONS} key. */
export const POLAR_GROUP: Record<Exclude<JoinSeries, Vowel>, keyof typeof POLAR_CONSTRUCTIONS> = {
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
export const RESTRICTOR_GROUP: Record<JoinSeries, keyof typeof RESTRICTOR_CONSTRUCTIONS> = {
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

export const STAND_IN_BACK_CONSTRUCTIONS: Record<Vowel, ConstructionEntry> = {
  a: { anchor: "dependents.md#stand-in-back", summary: "darth that same claim" },
  o: { anchor: "dependents.md#stand-in-back", summary: "dorth that same question" },
  e: { anchor: "dependents.md#stand-in-back", summary: "derth that same instruction" },
  u: { anchor: "dependents.md#stand-in-back", summary: "durth that same don't" },
};

/** Hook forms (hooks.md). */
export const HOOK_FORM_CONSTRUCTIONS: Record<ExtraNounHook | "ar" | "er" | "or" | "ur" | "aor" | "aer" | "uor", ConstructionEntry> = {
  ar: { anchor: "hooks.md#hook-resume", summary: "ar resume hook" },
  er: { anchor: "hooks.md#hook-resume", summary: "er resume hook" },
  or: { anchor: "hooks.md#hook-resume", summary: "or resume hook" },
  ur: { anchor: "hooks.md#hook-resume", summary: "ur resume hook" },
  aor: { anchor: "hooks.md#hook-resume", summary: "aor resume hook (on it)" },
  aer: { anchor: "hooks.md#hook-resume", summary: "aer resume hook (with it)" },
  uor: { anchor: "hooks.md#hook-resume", summary: "uor resume hook (through there)" },
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

/** Span features: the written fidelity marks (spans.md). */
export const SPAN_FEATURE_CONSTRUCTIONS: Record<`mark.${"^@" | "@" | "~"}`, ConstructionEntry> = {
  "mark.^@": { anchor: "spans.md#one-of-a-title", summary: "^@ one thing the span's name applies to" },
  "mark.@": { anchor: "spans.md#exact-paraphrase-proper", summary: "@ proper span" },
  "mark.~": { anchor: "spans.md#exact-paraphrase-proper", summary: "~ paraphrase span" },
};

/** Role compounds: role vowel and the -r instance (roles.md). */
export const ROLE_FEATURE_CONSTRUCTIONS: Record<`vowel.${RoleVowel}` | "instance", ConstructionEntry> = {
  "vowel.a": { anchor: "roles.md#role-compounds", summary: "agent a" },
  "vowel.u": { anchor: "roles.md#the-undergoer-u", summary: "patient u" },
  "vowel.e": { anchor: "roles.md#the-scene-e", summary: "scene e" },
  "vowel.o": { anchor: "roles.md#the-extra-b-party-o", summary: "recipient o" },
  "vowel.ae": { anchor: "roles.md#instrument", summary: "instrument ae" },
  "vowel.oe": { anchor: "roles.md#goal-source-path", summary: "goal oe" },
  "vowel.ua": { anchor: "roles.md#goal-source-path", summary: "source ua" },
  "vowel.uo": { anchor: "roles.md#goal-source-path", summary: "path uo" },
  "vowel.ao": { anchor: "roles.md#result", summary: "result ao" },
  "vowel.ue": { anchor: "roles.md#bearer", summary: "cost-bearer ue" },
  instance: { anchor: "roles.md#this-instance-r", summary: "-r this instance" },
};

/** Role pointers: which part the role vowel names, and which event the pointer vowel picks (pronouns.md#role-pointers). */
export const POINTER_FEATURE_CONSTRUCTIONS: Record<`vowel.${PointerVowel}` | `role.${RoleVowel}` | "new" | "part", ConstructionEntry> = {
  "role.a": { anchor: "pronouns.md#role-pointers", summary: "pointer to the doer" },
  "role.u": { anchor: "pronouns.md#role-pointers", summary: "pointer to the undergoer" },
  "role.o": { anchor: "pronouns.md#role-pointers", summary: "pointer to the extra party" },
  "role.e": { anchor: "roles.md#role-pointers-family", summary: "pointer to the scene" },
  "role.ae": { anchor: "roles.md#stacked-pointers", summary: "pointer to the instrument" },
  "role.oe": { anchor: "roles.md#stacked-pointers", summary: "pointer to the goal" },
  "role.ua": { anchor: "roles.md#stacked-pointers", summary: "pointer to the source" },
  "role.uo": { anchor: "roles.md#stacked-pointers", summary: "pointer to the path" },
  "role.ao": { anchor: "roles.md#stacked-pointers", summary: "pointer to the result" },
  "role.ue": { anchor: "roles.md#stacked-pointers", summary: "pointer to the one who pays" },
  "vowel.a": { anchor: "pronouns.md#role-pointers", summary: "same: the latest predicate with that role" },
  "vowel.o": { anchor: "pronouns.md#the-other-one", summary: "other: the nearest predicate with someone else in that role" },
  "vowel.e": { anchor: "pronouns.md#themself", summary: "self: this clause's predicate" },
  "vowel.u": { anchor: "pronouns.md#whoever-it-was", summary: "unsaid: the latest predicate that left that role unsaid" },
  new: { anchor: "pronouns.md#a-new-one", summary: "-l a new one of the participant's kind" },
  part: { anchor: "pronouns.md#share", summary: "-m the participant's part in the event" },
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
  ...prefixed("sake", SAKE_FEATURE_CONSTRUCTIONS),
  ...prefixed("scope", SCOPE_FEATURE_CONSTRUCTIONS),
  ...prefixed("join", JOIN_SERIES_CONSTRUCTIONS),
  ...prefixed("force", FORCE_CONSTRUCTIONS),
  ...prefixed("polar", POLAR_CONSTRUCTIONS),
  ...prefixed("restrictor", RESTRICTOR_CONSTRUCTIONS),
  ...prefixed("standIn", STAND_IN_CONSTRUCTIONS),
  ...prefixed("standInBack", STAND_IN_BACK_CONSTRUCTIONS),
  ...prefixed("hook", HOOK_FORM_CONSTRUCTIONS),
  ...prefixed("span", SPAN_FEATURE_CONSTRUCTIONS),
  ...prefixed("role", ROLE_FEATURE_CONSTRUCTIONS),
  ...prefixed("pointer", POINTER_FEATURE_CONSTRUCTIONS),
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
  genitiveHost: { anchor: "hooks.md#genitive", summary: "`em` + `/b/` follows the noun B uses" },
  forcePair: { anchor: "speech-moves.md#emphatic-prohibition", summary: "only `yul yul` and `yal yol` / `yam yol` stack two act words" },
  polarOrder: { anchor: "questions.md#polar-stance", summary: "a polar word is one answer or one tag: not two in a row, and not before an act word (an answer and then a question are two turns)" },
  sentenceEndMark: { anchor: "speech-moves.md#tone-marks", summary: "a sentence ends in `.`; `?` / `!` are tone-mark prefixes" },
  toneStack: { anchor: "speech-moves.md#tone-marks", summary: "a tone mark stack uses ! ? % & ; in any order, each at most twice; a space between marks is not a stack" },
  toneTarget: { anchor: "speech-moves.md#tone-marks", summary: "a tone mark goes before a word, an island open {, or a span" },
  linkerMidSentence: { anchor: "dependents.md#sentence-linkers", summary: "a sentence linker or topic word comes only at the start of a sentence" },
  pluralOnPos: { anchor: "plurality.md#beginner", summary: "-x is unused on /w/, /h/, /th/, and the published /x/ linkers" },
  pluralInterjection: { anchor: "plurality.md#vocatives-y", summary: "-x on /y/ goes on a vocative (-n / -r), not an interjection" },
  sakeSlot: { anchor: "sakes.md#beginner", summary: "a sake form goes on /ɡ/, /th/, or /w/ only" },
  emotionTail: { anchor: "sakes.md#emotion-compose", summary: "the emotion tail goes on tha / tho / thu and ends in -r / -m / -l" },
  sakeEnding: { anchor: "sakes.md#word-shape", summary: "a sake word ends in -l / -m / -r (its stance's ending table), with or without an emotion tail" },
  sakeStackedVowel: { anchor: "sakes.md#word-shape", summary: "a sake stance is one vowel; stacked vowels after th are the emotion locus after the horizon letter" },
  prescriptionSlot: { anchor: "sakes.md#prescription-the-ought-this-act-for-this-sake", summary: "prescription (the) goes on /th/ only: it is about an act, not a noun" },
  feelingLandmark: { anchor: "sakes.md#emotion-compose", summary: "an INTERNAL (a) or UNPLACED (uo) feeling takes no /b/; a landmark goes with a direction or CIRCUM locus" },
  labelScopeSlot: { anchor: "predication.md#label-scope", summary: "label scope goes on /ɡ/, /z/, /d/, /b/, /v/, or /h/ only" },
  labelScopeStem: { anchor: "predication.md#label-scope", summary: "a scope seam labels a content root, not a special pronoun" },
  roleCompoundSlot: { anchor: "roles.md#role-compounds", summary: "a role compound goes on /z/, /d/, /b/, /ɡ/, as a topic under /x/, or as a call under /y/ (-n / -r); not on /v/, /h/, /w/, or /th/" },
  roleCompoundStem: { anchor: "roles.md#role-compounds", summary: "a role compound names a role of an event; a special pronoun is not an event" },
  abilitySlot: { anchor: "intention.md#ability", summary: "ability (x + vowel) goes on /v/ or /ɡ/ only; name + x + vowel + -n is a conversation-length bid only as a citation or a /y/ call" },
  labelScopeArrow: { anchor: "roles.md#landmark-facing", summary: "on a direction root the th seam takes only o (the landmark's own facing)" },
  pluralKindAfterUniversal: { anchor: "joins.md#universals-domains-generics", summary: "the kind word after ua / uo takes no -x" },
  stackedHookResume: { anchor: "hooks.md#spans", summary: "stacked span hook -r (oer / uar / uer) needs same-role words on both sides" },
  hookSameRoleStack: { anchor: "hooks.md#including-am-al", summary: "between same-role words only the plain hooks (al el ol ul) and the span hooks (oel ual uel) have a reading; for such as, use am" },
  hookDiscourseStack: { anchor: "hooks.md#discourse-hooks", summary: "at the front of a sentence only al el ol ul, aol and ael have a reading; for next, by the way, on the contrary use a linker" },
  stackedJoinResume: { anchor: "join-across-roles.md#vp-clause-forms", summary: "stacked join vowels take no -r on /z/ /d/ /b/ /v/ /x/ /ɡ/ (only a / o / e / u do); a stacked -r is the stance fill-ask under /th/" },
  spanSlot: { anchor: "spans.md#pos", summary: "an aside goes only under /th/; a cite, mention or opaque span fills a content slot (/z/ /d/ /b/ /v/ /ɡ/ /h/) or sets the topic under /x/; no span fills /w/" },
  ySpanType: { anchor: "spans.md#y-spans", summary: "a span under /y/ is opaque <…> or a cite […]; a mention or an aside is not a call or a reaction" },
  barKind: {
    anchor: "comparatives.md#bars",
    summary: "a bar is a stance that sets a value: a met sake, a channel, FORMER, NOTIONAL, PLAN, WANT, ability, permission, requirement, consent, or a speaker attitude",
  },
  barCount: { anchor: "comparatives.md#bars", summary: "a rank fence ranks one item against one bar; with a bar there is no second comparee, noun or bar" },
  rankJoinNumberManner: { anchor: "comparatives.md#manner-scale", summary: "the /h/ after a rank join is a manner word; the only number there is digitless h+ (how often)" },
  frameKind: {
    anchor: "sakes.md#contrary-to-stance",
    summary: "the stance after uem says what the event goes against: a channel, PLAN, DECISION, WANT, a ban, a requirement, a refusal, or a speaker attitude",
  },
  hookSameRole: { anchor: "hooks.md#including-am-al", summary: "an in-clause hook goes between two phrases in the same clause role (A HOOK B)" },
  hookStandIn: { anchor: "hooks.md#since", summary: "the only hook that takes a stand-in is ul barl (since); contrary to an event is hezom barl" },
  dependentStanceOnly: {
    anchor: "dependents.md#dependent-clauses",
    summary: "the sentence after a stand-in names an event or a thing; a stance word alone fills it only as a lone feeling, thanks, or sorry",
  },
  predicateAfterVerb: { anchor: "predication.md#classification", summary: "a /ɡ/ word right after the verb has no reading (no depictive or resultative); say the state in its own sentence, with huwem barl, or with the adjective as a verb under thegem" },
  nameInstanceSlot: { anchor: "word-endings.md#name-instance--ln", summary: "-ln (span ^@) is one thing a name applies to: it fills /z/ /d/ /b/ or stands as a citation, never on /ɡ/ /v/ /h/ /w/ /th/ /x/ /y/, and never on a pronoun root" },
  standInRole: { anchor: "dependents.md#stand-in", summary: "stand-ins (-rl -rm -rth -rn) fill /z/ /d/ /b/ only; there is no stand-in on /ɡ/ /h/ /w/ /th/ (such is whole-stem -r, like that is humum barth)" },
  standInHost: { anchor: "dependents.md#dependent-clauses", summary: "a hosted stand-in is barl after a listed pole, a clues / pattern channel, or like (humum)" },
  standInHostUndo: { anchor: "dependents.md#stand-in", summary: "burl follows only the so-that pole holalam or the if pole thadorom" },
  poleStack: { anchor: "causation.md#only-because", summary: "pole stacks are theberom thurugum and hezebam thadorom" },
  objectNeedsVerb: { anchor: "predication.md#existence", summary: "an object /d/ needs a verb" },
  stanceNumber: { anchor: "numbers.md#number-as-stance-by-marker", summary: "a stance number takes + (likelihood), _ (source) or # (Nth-hand); th- with digits and th#- are not used" },
  handDepth: { anchor: "knowing.md#hand-depth", summary: "th#N counts the hands between the event and you, from 2 (th#2 second-hand, a secondary source); first-hand is a channel word" },
  handDepthChannel: { anchor: "knowing.md#hand-depth", summary: "th#N counts hands between the event and you, so LIVE and MEMORY (first-hand channels) cannot take it" },
  degreeNumber: { anchor: "numbers.md#number-as-degree", summary: "a number on /w/ is the how-much blank, barely / almost, or an ordinal place on a scale (wredul); a factor goes on /h/" },
  degreePlaceFrame: { anchor: "comparatives.md#place-on-a-scale", summary: "a place on a scale (w#N) needs one name before zel or zuel, then the shared adjective" },
  numberResumeUnbound: { anchor: "numbers.md#digitless", summary: "a number -r needs an earlier number to match" },
  tagUnbound: { anchor: "pronouns.md#tag-pronouns", summary: "a tag -r or -m needs that tag assigned earlier in the conversation (zodogal zwal, or zwal alone); -m also needs an earlier event it took part in (for a pair, one event both took part in)" },
  tagSlot: { anchor: "pronouns.md#tag-pronouns", summary: "a tag pronoun fills /z/, /d/, or /b/; to call someone or return to them as the topic, use their name" },
  tagEnding: { anchor: "pronouns.md#tag-pronouns", summary: "a tag pronoun takes -l (assign), -r (recall), or -m (share)" },
  tagPronoun: { anchor: "pronouns.md#tag-pronouns", summary: "a tag names a phrase that is not already a fixed pronoun: never a special (amagon, ehodon, ahan, unan), generic, or topic pronoun, or another tag; a resume or role pointer takes one" },
  tagPairAssign: { anchor: "pronouns.md#tag-pairs", summary: "a tag pair (zwaer) recalls or shares two tags already assigned; assign each tag on its own (zodogal zwal zagadul zwel zam)" },
  tagPlural: { anchor: "pronouns.md#tag-pronouns", summary: "a tag takes -x only on -r (zwarx, A and associates); to tag a group, tag its plural phrase (zodogalx zwal)" },
  numberPlural: { anchor: "numbers-applied.md#plural-labels", summary: "a number takes -x only as a plural label (z_90x)" },
  resumeUnbound: { anchor: "pronouns.md#resume-r", summary: "an -r resume spells an earlier word's whole stem, or a lexicon stem" },
  pointerSlot: { anchor: "pronouns.md#role-pointers", summary: "a role pointer fills /z/, /d/, /b/, a holder seam's holder slot, or a viewpoint lateral's facing anchor" },
  pointerOtherRole: { anchor: "pronouns.md#the-other-one", summary: "the other-one pointer (o) takes every role except the scene (dexor, zexol, and zexom are rejected)" },
  pointerUnbound: { anchor: "pronouns.md#role-pointers", summary: "a role pointer needs an earlier predicate with that role filled (o: with someone else in it; u: with that role unsaid)" },
  pointerShareSelf: { anchor: "pronouns.md#share", summary: "a share (-m) never takes the self vowel (e): it would name a part in the very event being described" },
  pointerSharePlural: { anchor: "pronouns.md#share", summary: "a share (-m) is a part, not a group of people, so it takes no -x" },
  pointerNewUnsaid: { anchor: "pronouns.md#a-new-one", summary: "a new one (-l) needs a filler to copy the kind of; an unsaid pointer (u) has none" },
  pointerNewSpecial: { anchor: "pronouns.md#a-new-one", summary: "a new one (-l) copies a kind; a special, topic, or generic pronoun names a role in the talk, not a kind" },
  topicUnbound: { anchor: "pronouns.md#topic-pronoun", summary: "the topic pronoun needs a topic set by an /x/ word in the current talk" },
  genericPlural: { anchor: "pronouns.md#generic-pronoun", summary: "the generic pronoun already means people at large, so it takes no -x" },
  nonspecificPlural: { anchor: "plurality.md#person-role-x", summary: "someone (unan) names no group to add associates to; some people is obelx" },
  topicNonspecific: { anchor: "pronouns.md#topic-participants", summary: "a topic is someone or something in particular; a nonspecific someone cannot be it" },
  topicOfTopic: { anchor: "pronouns.md#topic-pronoun", summary: "the topic pronoun is the topic itself: it is never its own topic word or a resume (zozan, never xozan or zozar)" },
  pointerOwnSlot: { anchor: "pronouns.md#themself", summary: "a self pointer (e) names another slot of its own clause, not the one it fills" },
  clauseSingleItem: { anchor: "joins.md#clause-joins", summary: "a clause join goes between two clauses; to deny or focus one clause, put the join on its verb or noun (vul, zal)" },
  leftFence: { anchor: "joins.md#right-close", summary: "a join word closes its conjuncts; it never comes before them" },
  emptyIsland: { anchor: "spans.md#scope-islands", summary: "a scope island needs words between its edges" },
  islandOneSlot: { anchor: "spans.md#scope-islands", summary: "a scope island holds at most one phrase: /z/, /d/, /b/, /v/, or a /ɡ/ stack" },
  islandSlotRole: { anchor: "spans.md#scope-islands", summary: "a scope island needs one /z/, /d/, /b/, /v/, or /ɡ/ phrase after its binder, and never splits a host from its /b/" },
  islandBinder: { anchor: "spans.md#scope-islands", summary: "a scope island needs a binder inside: an /h/ word or a join" },
  landmarkLateralBound: { anchor: "roles.md#landmark-facing", summary: "a landmark lateral (DIR th o) needs its landmark in hosted /b/" },
  asOfIntroduceBound: { anchor: "relations.md#as-of", summary: "an as-of word introduces its bound with a /b/ word" },
  asOfResumeBound: { anchor: "relations.md#as-of", summary: "an as-of resume (-r) takes no /b/" },
  hookResumeNoun: { anchor: "hooks.md#hook-resume", summary: "a resume hook (-r) points back and takes no noun on its right" },
  asOfPerHost: { anchor: "relations.md#as-of", summary: "a clause takes at most one /h/ and one /th/ as-of pair" },
  asOfOffset: { anchor: "relations.md#as-of", summary: "a signed offset in as-of /b/ goes only on stance as-of (/th/); an event or adjective past needs a channel" },
  channelOffsetSign: { anchor: "knowing.md#dated-channel", summary: "MEMORY takes only an earlier offset, LIVE none, and PLAN only a later one" },
  retiredChannelRoot: { anchor: "knowing.md#evidentiality", summary: "/th/ on the record or scroll root is not a channel: a record or document is REPORTED with the source in /b/, footage is LIVE or MEMORY with the device in /b/, a schedule is PLAN, and a tale is NOTIONAL" },
  poleOffsetWarrant: { anchor: "knowing.md#dated-channel", summary: "a signed offset on a time pole needs a command, request, PLAN, or channel in its clause" },
  joinDetail: { anchor: "joins.md#respectively", summary: "the only /w/ before a join word is respectively (wazem), and it goes only there, on a closed (-l) or open (-m) and-list" },
  respectivePartner: { anchor: "joins.md#respectively", summary: "a respectively list pairs with another and-list of the same length in its clause" },
} satisfies Record<string, ConstructionEntry>;

export type RejectionId = keyof typeof REJECTIONS;
