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
import type { AnaphorKind, Ending, LexReading, MorphWordFamily, PointerVowel, Pos, RolePart, ReachVowel, XFamily } from "./types.js";

/**
 * `summary` is for maintainers (Ageben terms allowed). `reader`, when set, explains the
 * construction in gloss notation to someone who knows only the translation prompt's fixed
 * core ([llm-prompt.ts](./llm-prompt.ts)); only constructions a careful reader still misreads get one.
 */
export type ConstructionEntry = { anchor: string; summary: string; reader?: string };

/** Shared by the three rank-fence bar productions (bars.md#bars). */
const BAR_READER =
  "A `th-` word (or an intention `h-` word) inside a ranking bracket, right before the rank word, is what the item is ranked against: `[z-X | th-plan-itinerary | z-rank/more | b-later] | v-departure` = X leaves later than planned; a pattern there = than usual (`rank/less | g-strength` = less strong than usual); a permission there = than allowed. The same word outside the bracket covers the whole sentence.";

/** Shared by every label-reach seam vowel (label-seams.md#label-reach). */
const REACH_WORDS =
  "`episode` this time only, `role` as their practiced role, `pair` true in one relationship (with the `b-` party), `type` the kind of person they are, `situation` the label belongs to the circumstances, not the person (a `b-` word after it is that situation; no cause is claimed), `using` playing the role for a purpose, `toward-role` becoming one (not wanting to be), `except-episode` / `except-pair` that type except this time / with that party, `outside-role` as themselves, not in that role (never a refusal of the role)";

const REACH_READER = `\`-th-\` plus a reach word after a label says how far the label reaches: ${REACH_WORDS}.`;

const ROLE_READER =
  `A role word \`REACH-PART-verb\` names one part of the verb's event: \`agent\` the one who does it, \`patient\` what it acts on or makes, \`recipient\` the one it is given or told to, or the other party of a relation; or a quality of that event: \`manner\` how, \`state\` what it left, \`stance\` the reason or feeling, \`extent\` how much, \`move\` the remark, \`outcome\` what followed. The reach word first says how far the label reaches: ${REACH_WORDS}. \`z-episode-agent-teach\` = someone who teaches (this time), \`z-role-agent-teach\` = a teacher, \`g-role-agent-teach\` = is a teacher, \`h-role-agent-teach\` = as a teacher (the role the act is done in), \`d-episode-manner-walk\` = a way of walking.`;

/** A same-role relation word (same-role-words.md): the gloss names the relation, `.open` / `.closed` the ending. */
const SAME_ROLE_READER =
  "A word with no prefix glossed `before`, `after`, `while` or `like` (`.open` or `.closed`) between two phrases of the same prefix relates them: both fill that role in the same event, and the right one is the background. `z-X | before.open | z-Y | v-walk` = X walks before (ahead of) Y, and Y walks too; `z-X | v-walk | before.open | v-swim` = X walks before swimming; `after` = after or behind; `while` = at the same time; `z-X | like.open | z-Y | v-walk` = X, like Y, walks. The left phrase is the nearest one with the same prefix. `.open` leaves room for others (*and maybe others*); `.closed` says the right one is the whole of it: `while.closed` = only while, `like.closed` = like that one alone (not *exactly like*).";

/** The fronted pair: the blank comes first, and A is the same-role phrase after it. */
const SAME_ROLE_PAIR_READER =
  "A prefix-less `before`, `after`, `while` or `like` word right before a blank (`before.open | z-wh`) at the start of a question asks for the right-hand member, and the left one is the phrase with the blank's prefix after the pair: `y-question | before.open | z-wh | z-X | v-walk` = Before whom does X walk? (X walks ahead of someone, who walks too).";

/** Sentence grammar: `rule.childKey` (sub-rule, token type, or LABEL). */
export const SENTENCE_CONSTRUCTIONS: Record<string, ConstructionEntry> = {
  "document.sentence": { anchor: "word-endings.md#greeting", summary: "a text is one or more sentences" },
  "document.Period": { anchor: "word-endings.md#greeting", summary: "sentence end" },
  "document.EOF": { anchor: "word-endings.md#greeting", summary: "end of text" },

  "sentence.leftEdge": { anchor: "speech-moves.md#vocative", summary: "turn cluster before the body" },
  "sentence.edgeBody": { anchor: "speech-moves.md#speech-act-statement-question-command", summary: "body after a turn cluster" },
  "sentence.bodyClause": { anchor: "word-endings.md#greeting", summary: "body with no turn cluster (implied yal, or the turn's earlier act)" },
  "sentence.fragment": { anchor: "word-endings.md#greeting", summary: "one citation phrase as the whole body: a greeting, a name, a fill answer" },

  "leftEdge.turnWord": { anchor: "speech-moves.md#vocative", summary: "call, greeting, or reaction at the left edge" },
  "turnWord.Vocative": { anchor: "speech-moves.md#vocative", summary: "the call or greeting name" },
  "turnWord.Interjection": { anchor: "speech-moves.md#interjections-reactions", summary: "interjection at the left edge" },
  "turnWord.gPackage": { anchor: "speech-moves.md#vocative", summary: "/ɡ/ after a call or reaction describes it (family name, *big surprise*)" },
  "turnWord.glAdj": { anchor: "left-bound-adjectives.md#left-bound-adjectives", summary: "gl- adjective before a call or reaction" },
  "turnWord.W": { anchor: "more-turn-words.md#describe-turn-word", summary: "/w/ degree right before a reaction" },
  "leftEdge.Polar": { anchor: "questions.md#polar-particle", summary: "polar particle turn" },
  "leftEdge.W": { anchor: "in-clause-hooks.md#hook-w", summary: "/w/ on a left-edge hook" },
  "leftEdge.Hook": { anchor: "hooks.md#discourse-hooks", summary: "discourse hook at the left edge" },
  "leftEdge.ForceEcho": {
    anchor: "more-turn-words.md#doubled-act",
    summary: "the same act word twice: emphasis (yul yul)",
    reader: "The same `y-` act twice is one act said more insistently: `y-prohibition | y-prohibition` = *Don't. I mean it.*; `y-question | y-question` = *I really need to know: …?*",
  },
  "leftEdge.ForceAnswer": {
    anchor: "more-turn-words.md#rhetorical",
    summary: "yal yel rhetorical question",
    reader: "`y-statement | y-question` before a body is a rhetorical question: the speaker asserts the obvious answer and asks for no reply (`y-statement | y-question | z-wh | v-care` = *Who cares?*, nobody does).",
  },
  "leftEdge.ForceQuiz": {
    anchor: "more-turn-words.md#quiz",
    summary: "yel yal quiz",
    reader: "`y-question | y-statement` is a quiz: the asker already knows the answer and wants the listener to say it (*So who punched the box? You tell me.*).",
  },
  "leftEdge.ForceStack": {
    anchor: "more-turn-words.md#stacked-acts",
    summary: "two different act words: the outer is the real act, the inner how it sounds",
    reader: "Two different `y-` acts in a row: the first is what the turn really does, the second only how it sounds. `y-command | y-question` = a request phrased as a question (*Could you…?*); `y-prohibition | y-command` = a sarcastic dare (*Go ahead, try it*, meaning don't); `y-command | y-soft-question` = an order dressed as a gentle ask.",
  },
  "leftEdge.Force": { anchor: "speech-moves.md#speech-act-statement-question-command", summary: "speech-act word" },

  "bodyClause.Linker": { anchor: "speech-moves.md#continue-x", summary: "sentence linker before a clause" },
  "bodyClause.topicMarker": { anchor: "spans-as-words.md#mention", summary: "mention marker before a topic span" },
  "bodyClause.clause": { anchor: "word-endings.md#greeting", summary: "clause body" },

  "clause.clauseItem": { anchor: "word-endings.md#greeting", summary: "clause, or a stand-in clause join" },
  "clause.midJoin": { anchor: "joins.md#clause-joins", summary: "/x/ join between clauses" },
  "unit.unit": { anchor: "clause.md#who-acts-and-the-action", summary: "the next unit of the clause" },
  "clauseItem.unit": { anchor: "word-endings.md#greeting", summary: "role-lettered unit in a clause" },
  "clauseItem.standIn": { anchor: "joins.md#clause-joins", summary: "standalone /x/ join as a stand-in clause" },
  "bodyClause.crossJoin": { anchor: "joins.md#clause-joins", summary: "/x/ join linking the prior sentence to this one" },

  "unit.islandUnit": { anchor: "scope-islands.md#scope-islands", summary: "scope island" },
  "unit.zCoord": { anchor: "word-endings.md#greeting", summary: "/z/ subject phrase" },
  "unit.dCoord": { anchor: "clause.md#direct-object-d", summary: "/d/ object phrase" },
  "unit.bCoord": { anchor: "clause.md#extra-nouns", summary: "unhosted /b/ phrase" },
  "unit.vpCoord": { anchor: "clause.md#who-acts-and-the-action", summary: "/v/ verb phrase" },
  "unit.gCoord": { anchor: "joins.md#negation-u", summary: "clause-level /ɡ/ (predicate adjective)" },
  "unit.hCoord": { anchor: "clause.md#adverbs-h", summary: "/h/ or stance /th/ unit" },
  "unit.hookUnit": { anchor: "hooks.md#including-am-al", summary: "in-clause hook" },
  "unit.sameRolePair": {
    anchor: "same-role-words.md#before-and-after",
    summary: "same-role word + fill-ask blank as one unit (`abam zar`); fronted, it takes A from the same-role phrase after it",
    reader: SAME_ROLE_PAIR_READER,
  },

  "islandUnit.IslandOpen": { anchor: "scope-islands.md#scope-islands", summary: "{ island open" },
  "islandUnit.IslandClose": { anchor: "scope-islands.md#scope-islands", summary: "} island close" },
  "islandUnit.unit": { anchor: "scope-islands.md#scope-islands", summary: "units inside an island" },


  "zCoord.zCoordPart": { anchor: "joins.md#and-lists-a", summary: "/z/ phrase parts" },
  "dCoord.dCoordPart": { anchor: "joins.md#right-close", summary: "/d/ phrase parts" },
  "bCoord.bCoordPart": { anchor: "joins.md#right-close", summary: "/b/ phrase parts" },
  "zCoordPart.npConjunct": { anchor: "joins.md#and-lists-a", summary: "/z/ conjunct" },
  "zCoordPart.bar": {
    anchor: "bars.md#bars",
    summary: "/th/ stance word as a rank fence's bar",
    reader: BAR_READER,
  },
  "zCoordPart.npJoinClose": { anchor: "joins.md#and-lists-a", summary: "/z/ join after its conjuncts" },
  "zCoordPart.standaloneJoin": { anchor: "joins.md#standalone-phrase", summary: "standalone /z/ join" },
  "dCoordPart.npConjunct": { anchor: "joins.md#right-close", summary: "/d/ conjunct" },
  "dCoordPart.bar": {
    anchor: "bars.md#bars",
    summary: "/th/ stance word as a rank fence's bar",
    reader: BAR_READER,
  },
  "dCoordPart.npJoinClose": { anchor: "joins.md#right-close", summary: "/d/ join after its conjuncts" },
  "dCoordPart.standaloneJoin": { anchor: "joins.md#standalone-phrase", summary: "standalone /d/ join" },
  "bCoordPart.npConjunct": { anchor: "joins.md#right-close", summary: "/b/ conjunct" },
  "bCoordPart.bar": {
    anchor: "bars.md#bars",
    summary: "/th/ stance word as a rank fence's bar",
    reader: BAR_READER,
  },
  "bCoordPart.npJoinClose": { anchor: "joins.md#right-close", summary: "/b/ join after its conjuncts" },
  "bCoordPart.standaloneJoin": { anchor: "joins.md#standalone-phrase", summary: "standalone /b/ join" },
  "npJoinClose.JoinZ": { anchor: "joins.md#and-lists-a", summary: "/z/ join fence" },
  "npJoinClose.JoinD": { anchor: "joins.md#and-lists-a", summary: "/d/ join fence" },
  "npJoinClose.JoinB": { anchor: "joins.md#and-lists-a", summary: "/b/ join fence" },
  "npJoinClose.W": { anchor: "list-structure.md#respectively", summary: "respectively /w/ before a noun join word" },
  "npJoinClose.factor": { anchor: "comparative-arity.md#factor", summary: "ratio number after an equative scale" },
  "npJoinClose.sharedAfterJoin": { anchor: "joins.md#right-close", summary: "shared word after a noun join" },
  "npJoinClose.joinLandmark": { anchor: "hooked-joins.md#hooked-joins", summary: "a hooked join's bl- landmark" },

  "vpCoord.vpCoordPart": { anchor: "joins.md#and-lists-a", summary: "/v/ phrase parts" },
  "vpCoordPart.V": { anchor: "clause.md#who-acts-and-the-action", summary: "verb" },
  "vpCoordPart.B": { anchor: "label-seams.md#reach-relative", summary: "hosted /b/ after a pair-reach verb" },
  "vpCoordPart.vJoinClose": { anchor: "joins.md#and-lists-a", summary: "/v/ join after its verbs" },
  "vpCoordPart.standaloneJoin": { anchor: "joins.md#standalone-phrase", summary: "standalone /v/ join" },
  "vpCoordPart.vpItemUnit": { anchor: "verb-and-stance-joins.md#vp-clause-forms", summary: "words before a later verb of a /v/ list" },
  "vpItemUnit.dCoord": { anchor: "verb-and-stance-joins.md#vp-clause-forms", summary: "/d/ phrase inside a verb item" },
  "vpItemUnit.bCoord": { anchor: "verb-and-stance-joins.md#vp-clause-forms", summary: "/b/ phrase inside a verb item" },
  "vpItemUnit.hCoord": { anchor: "verb-and-stance-joins.md#vp-clause-forms", summary: "/h/ unit inside a verb item" },
  "vpItemUnit.hookUnit": { anchor: "verb-and-stance-joins.md#vp-clause-forms", summary: "extra-noun hook inside a verb item" },
  "vJoinClose.W": { anchor: "list-structure.md#respectively", summary: "respectively /w/ before a verb join word" },
  "vJoinClose.JoinV": { anchor: "joins.md#and-lists-a", summary: "/v/ join fence" },
  "vJoinClose.sharedAfterJoin": { anchor: "verb-and-stance-joins.md#vp-clause-forms", summary: "shared /h/ after a verb join (covers every verb)" },

  "gCoord.gCoordPart": { anchor: "joins.md#negation-u", summary: "/ɡ/ phrase parts" },
  "gCoordPart.gPackage": { anchor: "joins.md#negation-u", summary: "clause-level adjective" },
  "gCoordPart.gJoinClose": { anchor: "joins.md#right-close", summary: "/ɡ/ join after its adjectives" },
  "gCoordPart.standaloneJoin": {
    anchor: "fill-ask-jobs.md#what-kind",
    summary: "/ɡ/ join closing the adjective on the noun before it",
  },
  "gJoinClose.W": { anchor: "list-structure.md#respectively", summary: "respectively /w/ before an adjective join word" },
  "gJoinClose.JoinG": { anchor: "joins.md#and-lists-a", summary: "/ɡ/ join fence" },

  "hCoord.hCoordPart": { anchor: "verb-and-stance-joins.md#stance-joins", summary: "/h/ phrase parts" },
  "hCoordPart.hUnitRule": { anchor: "clause.md#adverbs-h", summary: "adverb or stance word" },
  "hCoordPart.hJoinClose": { anchor: "verb-and-stance-joins.md#stance-joins", summary: "/h/ join after its adverbs" },
  "hCoordPart.standaloneJoin": { anchor: "verb-and-stance-joins.md#standalone-stance-joins", summary: "standalone stance /th/ join" },
  "hCoordPart.lateBound": { anchor: "verb-and-stance-joins.md#stance-join-before-barl", summary: "stance join between a hinge and its blarl" },
  "hJoinClose.JoinH": { anchor: "verb-and-stance-joins.md#stance-joins", summary: "/h/ join fence" },

  "hUnitRule.W": { anchor: "clause.md#adjective-detail-w", summary: "/w/ detail on an adverb" },
  "hUnitRule.H": { anchor: "clause.md#adverbs-h", summary: "/h/ or /th/ word" },
  "hUnitRule.Held": { anchor: "contrary-to.md#contrary-to-holder", summary: "WANT, PLAN, or DECISION after a holder zone of uom: the holder's intention the event goes against" },
  "hUnitRule.B": { anchor: "clause.md#extra-nouns", summary: "hosted /b/ after /h/" },
  "hUnitRule.G": { anchor: "dated-channel.md#dated-channel", summary: "amount on a hosted /b/ (signed offset)" },
  "hUnitRule.Odo": { anchor: "dependents.md#dependent-clauses", summary: "stand-in hosted on /h/, or the grounds after a channel's offset" },
  "hUnitRule.gPackage": { anchor: "longer-chains.md#complex-chaining", summary: "adjective on the landmark after an /h/ host" },
  "hookUnit.W": { anchor: "in-clause-hooks.md#hook-w", summary: "/w/ on an in-clause hook" },
  "hookUnit.Hook": { anchor: "hooks.md#including-am-al", summary: "in-clause hook" },
  "sameRolePair.Hook": { anchor: "same-role-words.md#before-and-after", summary: "the same-role word of a pair" },
  "sameRolePair.Blank": { anchor: "same-role-words.md#before-and-after", summary: "the fill-ask blank a same-role word relates" },
  "hookUnit.zone": { anchor: "contrary-to.md#contrary-to-stance", summary: "uom + a /th/ stance: the zone the event goes contrary to" },

  "npPackage.gPackage": { anchor: "clause.md#adjectives-ɡ", summary: "adjective on a noun (gl- before, /ɡ/ after)" },
  "npPackage.Z": { anchor: "clause.md#who-acts-and-the-action", summary: "/z/ noun" },
  "npPackage.D": { anchor: "clause.md#direct-object-d", summary: "/d/ noun" },
  "npPackage.B": { anchor: "clause.md#extra-nouns", summary: "/b/ noun" },
  "npPackage.Odo": { anchor: "dependents.md#dependent-clauses", summary: "stand-in as a noun" },
  "npPackage.WritingSpan": { anchor: "spans.md#writing", summary: "written span as a noun" },
  "npCoordPart.itemHook": { anchor: "list-structure.md#shared-after-the-join", summary: "hook on the last join item, before the join word" },
  "npCoordPart.itemHookBound": { anchor: "list-structure.md#shared-after-the-join", summary: "/b/ of a hook on the last join item" },
  "npCoordPart.groupTag": { anchor: "tag-pronouns.md#tag-pronouns", summary: "tag -l naming a closed list" },
  "npPackage.Citation": { anchor: "word-endings.md#greeting", summary: "word with no role letter, with what describes it" },
  "npPackage.tag": { anchor: "tag-pronouns.md#tag-pronouns", summary: "tag -l, or a pseudonym -n, naming the noun before it" },

  "hUnitRule.boundJoinTail": { anchor: "join-relations.md#join-relations", summary: "hosted /b/ slot filled by a join" },
  "gPackage.boundJoinTail": { anchor: "join-relations.md#join-relations", summary: "hosted /b/ slot on /ɡ/ filled by a join" },
  "boundJoinTail.B": { anchor: "join-relations.md#join-relations", summary: "later member of a hosted /b/ join" },
  "boundJoinTail.JoinB": { anchor: "join-relations.md#join-relations", summary: "join word closing a hosted /b/ slot" },
  "asOfWPair.W": { anchor: "as-of.md#as-of", summary: "as-of /w/" },
  "asOfWPair.B": { anchor: "as-of.md#as-of", summary: "as-of /b/ bound" },
  "gPackage.W": { anchor: "clause.md#adjective-detail-w", summary: "/w/ detail on an adjective" },
  "gPackage.asOfWPair": { anchor: "as-of.md#as-of", summary: "as-of pair before an adjective" },
  "gPackage.G": { anchor: "clause.md#adjectives-ɡ", summary: "/ɡ/ adjective" },
  "gPackage.gPackage": { anchor: "longer-chains.md#complex-chaining", summary: "adjective on the landmark after a /ɡ/ host" },
  "gPackage.B": { anchor: "predication.md#identity", summary: "hosted /b/ after /ɡ/" },

  "sharedAfterJoin.gPackage": { anchor: "joins.md#right-close", summary: "shared /ɡ/ after a join" },
  "sharedAfterJoin.hUnitRule": { anchor: "verb-and-stance-joins.md#vp-clause-forms", summary: "shared /h/ after a join" },
  "sharedAfterJoin.scale": { anchor: "comparative-arity.md#time-scale", summary: "digitless bral after a rank join: how late" },
};

/** Which slot a word may fill (`classifyTokenBranch`). */
export const TOKEN_CONSTRUCTIONS: Record<TokenBranch, ConstructionEntry> = {
  hook: { anchor: "hooks.md#including-am-al", summary: "prefix-less hook" },
  writingSpanSlot: { anchor: "spans.md#asides-th", summary: "written span in a non-noun slot" },
  writingSpan: { anchor: "spans.md#writing", summary: "written span as a noun" },
  standIn: { anchor: "dependents.md#dependent-clauses", summary: "stand-in (darl / barl / …)" },
  join: { anchor: "joins.md#and-lists-a", summary: "join fence word" },
  listVerb: { anchor: "list-verbs.md#list-verbs", summary: "list verb" },
  joinRelationG: { anchor: "join-relations.md#join-relations", summary: "join-relation on /ɡ/" },
  joinRelationH: { anchor: "join-relations.md#join-relations", summary: "join-relation on /h/ or /th/" },
  greeting: { anchor: "conversation-length.md#conversation-length", summary: "conversation-length bid (citation + x + vowel + -n)" },
  polar: { anchor: "questions.md#polar-particle", summary: "polar particle" },
  force: { anchor: "speech-moves.md#speech-act-statement-question-command", summary: "speech-act word" },
  yVocative: { anchor: "speech-moves.md#vocative", summary: "/y/ name (-n), named span, or resume (-r): a vocative" },
  yInterjection: { anchor: "speech-moves.md#interjections-reactions", summary: "/y/ word in -l / -m, or an unnamed span: an interjection" },
  linker: { anchor: "speech-moves.md#continue-x", summary: "/x/ content word: a sentence linker, or a topic word" },
  clauseAdverb: { anchor: "can-and-cant.md#ability-fallback", summary: "intention adverb on /h/ (hostless ability, try, a say word, RESIDUE, FORMER): covers the whole clause like a /th/ word" },
  tagAssign: { anchor: "tag-pronouns.md#tag-pronouns", summary: "bare tag -l or -n: names the phrase before it, or a new referent" },
  content: { anchor: "phonology.md#word-edges", summary: "content word in its role slot" },
  sameRole: {
    anchor: "same-role-words.md#before-and-after",
    summary: "listed citation between two phrases of one role (`zazozon abam zahelan vowurol.`): a same-role relation word",
    reader: SAME_ROLE_READER,
  },
  citationFallback: { anchor: "phonology.md#word-edges", summary: "word with no role letter: names, filling no slot" },
};

type FamilyKind = MorphWordFamily["kind"];

export const WORD_FAMILY_CONSTRUCTIONS: Record<FamilyKind, ConstructionEntry> = {
  content: { anchor: "phonology.md#word-edges", summary: "content word" },
  number: { anchor: "numbers.md#counts", summary: "number word" },
  x: { anchor: "sakes.md#met", summary: "mid-word x compound" },
  hook: { anchor: "hooks.md#including-am-al", summary: "hook" },
  hookCompound: { anchor: "hook-compounds.md#hook-compounds", summary: "fused extra-noun hook compound" },
  joinMarker: { anchor: "speech-moves.md#speech-act-statement-question-command", summary: "vowel-series join / turn word" },
  writingSpan: { anchor: "spans.md#writing", summary: "written span" },
  foreign: { anchor: "spans.md#loans", summary: "foreign / opaque payload" },
  tag: { anchor: "tag-pronouns.md#tag-pronouns", summary: "tag pronoun (role letter + w + tag vowel)" },
  say: { anchor: "permission-consent.md#say-words", summary: "say word (h + w + reach + whose say + answer + ending): permission, a ban, a requirement, consent" },
};

export const WORD_XFAMILY_CONSTRUCTIONS: Record<XFamily, ConstructionEntry> = {
  role: { anchor: "roles.md#role-compounds", summary: "role compound", reader: ROLE_READER },
  pointer: {
    anchor: "pronouns.md#role-pointers",
    summary: "role pointer",
    reader:
      "`←REACH-PART.WHICH` is a pointer: the participant or quality who had that part in an earlier event. `.same` the latest event with that part filled, `.other` the nearest one with someone else in it, `.self` this sentence's own, `.unsaid` the one whose filler was left unsaid. `.new` is a new one of that participant's kind, `.part` that participant's part in the event (what they did or had done to them). `z-←episode-agent.same` = they (the latest doer); `d-←episode-agent.self` = themself; `d-←episode-manner.same` = the way it was done; `d-←episode-event.same` = that event.",
  },
  sake: {
    anchor: "sakes.md#met",
    summary: "sake word",
    reader:
      "A sake word `SAKE-STANCE-ending` (competence, relatedness, pleasure, purpose, …) says how something stands toward that payoff, for the speaker unless a holder, or a `b-` right after it, says whose (after a feeling whose urge moves you, that `b-` is instead what the urge is about). `met` = it serves it, `unmet` = it costs it, `motive` = done for that payoff, `ought` = advice that the act would serve it (`-unasked` not asked for, `-invited` asked for, `-tryout` worth a try); with `ought` the verb is what ought to happen, not what happens. On `g-` after a noun it is about that thing of mine; on `th-` it is about the whole event: `z-X | v-sing | th-pleasure-met-any-term` = X sings, and I enjoy it. With a capital tail (`-STAYING-FLEETING`, `-AIMED-OPEN`) it is the speaker's feeling about it, said piece by piece: the sake part says what happened to the payoff, the urge says which way the feeling pulls (STAYING stay with it, AIMED act on someone, TOWARD turn to someone, GIVING do something for someone, RESISTING push back, AWAY get away, RELEASING let go, PLACATING keep the peace, HELD frozen or holding it in, UNPLACED no clear pull), and the last part how long the feeling lasts (SETTLED it has set in, OPEN unsaid, FLEETING a passing wave). An English emotion word may sum it up (`th-competence-met-any-term-TOWARD-OPEN` = proud, and I want to show someone), but keep the pull it names. `[w-FEELING | g-stimulus]` after a noun = that feeling about the noun.",
  },
  scope: { anchor: "label-seams.md#label-reach", summary: "label reach" },
  hookPrefix: {
    anchor: "hook-compounds.md#hook-prefixes",
    summary: "hook prefix",
    reader:
      "`HOOK-x-STEM` is a hook prefix, one word like English *anti-*, *pro-*, *in-*, *trans-*, *-ward*: something that stands in that hook's relation to the stem. On `g-` it is a property, on `z-` `d-` `b-` someone or something with it, on `h-` how the clause stands to the stem. `g-against-x-fight` = anti-fighting; `z-against-x-fight` = an opponent of fighting; `g-in-x-house` = indoor; `g-through-x-ocean` = transoceanic; `g-using-x-water` = water-powered; `h-toward-x-house` = toward the house. A zone hook (`amid`, `near`, `contrary-to`, `over`, …) makes the stem the setting: `g-amid-x-catastrophe` = crisis-era; `g-contrary-to-x-memo` = off-policy. An abstract stem keeps the hook's picture: `in` a state, `on` a plan, `out-of` a condition (`g-out-of-x-debt` = debt-free).",
  },
  lateral: {
    anchor: "viewpoint.md#viewpoint-laterals",
    summary: "viewpoint lateral",
    reader:
      "A direction joined by `-th-` to a person (or `←X`, one already named) is a side of that one's facing, not a compass point: north-th = ahead of them, south-th = behind, west-th = on their left, east-th = on their right (`h-west-th-X` = on X's left). `-th-landmark` with a `bl-` noun is that thing's own front: `[g-north-th-landmark | bl-car]` = in front of the car. A bare direction is the compass point.",
  },
  holder: {
    anchor: "holder.md#holder",
    summary: "holder seam",
    reader:
      "`th-TAG-X` (a stance tag joined to a person X, or `←X`, one already named): the sentence gives that person's view, and the tag says how the speaker knows it. `th-CLUES-X` = I gather X thinks …; `th-MAY-X` = maybe X thinks …. Every other `th-` word in that sentence (a want, plan, decision, or feeling) is then X's, not the speaker's: `th-WANT-unstated | th-CLUES-X` = I gather X wants …; a feeling word with `th-CLUES-listener` = it sounds like you feel that. With `th-CLUES-interlocutors` the view is one the speaker claims you both share: `z-interlocutors | th-CLUES-interlocutors | th-WANT-unstated | v-walk` = I gather we both want to walk. In a question, the holder asks how the listener can tell: `y-question | z-X | v-walk | th-CLUES-X | th-WANT-unstated` = can you tell whether X wants to walk? A speaker attitude (`th-hope`) stays the speaker's after a holder.",
  },
  ability: { anchor: "can-and-cant.md#ability", summary: "ability (x + vowel); conversation-length bids reuse the same shape on a citation" },
  numeric: {
    anchor: "numeric-derivation.md#numeric-derivation",
    summary: "numeric prefix",
    reader:
      "`NUM-x-STEM` is a numeric prefix, one word like English *quasi-*, *proto-*, *multi-*, *tri-*: the number says what kind of stem it is, and the word is a kind of the stem, never a count of things in the sentence. `z-infinity-x-love` = the essence of love; `z-grain-x-love` = a grain of love; `z-void-x-fear` = a void of fear; `z-quasi-x-friend` = a quasi-friend; `z-origin-x-love` = love in its beginning form; `z-telos-x-story` = the story's final form; `z-poly-x-faith` = multi-faith; `v-de-x-tale` = to de-tale; `z-three-x-discourse` = a three-part dialogue; `d-1st-x-pencil` = a first draft. `.about` on the number is approximate: `d-three.about-x-discourse` = a roughly three-part dialogue.",
  },
  compound: { anchor: "compounds.md#two-roots-one-word", summary: "ordinary x compound" },
};

/** Readings only a closed overlay produces; those words trace `overlay.*` instead. */
type OverlayOnlyReading =
  | "overlay"
  | "mention"
  | "sameRole"
  | "listVerb"
  | "joinRelation";

/** Non-overlay readings (an overlay word traces `overlay.*`, not `word.reading.*`). */
export const WORD_READING_CONSTRUCTIONS: Record<Exclude<LexReading, OverlayOnlyReading>, ConstructionEntry> = {
  ordinary: { anchor: "phonology.md#word-edges", summary: "ordinary content reading" },
  sake: { anchor: "sakes.md#met", summary: "sake reading" },
  ability: { anchor: "can-and-cant.md#ability", summary: "ability reading" },
  greeting: {
    anchor: "conversation-length.md#conversation-length",
    summary: "conversation-length bid",
    reader:
      "A name joined to `-presence`, `-minutes`, `-ask`, or `-passing` is a hello (`SELF-…`) or a call (`y-X-…`) that also says how long the speaker can talk: `-presence` = I have time, we can stay; `-minutes` = I have a few minutes; `-ask` = I have one question or comment; `-passing` = just saying hi, not starting a talk. At a goodbye: leaving soon, about to leave, leaving now. It is the speaker's own time, a statement, never a question to the other person.",
  },
  restrictor: { anchor: "restrictors.md#only-when-never-hal", summary: "restrictor" },
  join: { anchor: "joins.md#and-lists-a", summary: "join" },
  standIn: { anchor: "dependents.md#dependent-clauses", summary: "stand-in" },
  standInNamed: { anchor: "stand-in-roles.md#stand-in-roles", summary: "named stand-in" },
  standInBack: { anchor: "stand-in-vowels.md#stand-in-back", summary: "backward stand-in" },
  number: { anchor: "numbers.md#counts", summary: "number" },
  unknown: { anchor: "spans.md#writing", summary: "unclassified root" },
};

export const WORD_ENDING_CONSTRUCTIONS: Record<Ending, ConstructionEntry> = {
  l: { anchor: "phonology.md#word-edges", summary: "-l concrete / literal" },
  m: { anchor: "word-endings.md#abstract-m", summary: "-m abstract / metaphor" },
  n: { anchor: "phonology.md#word-edges", summary: "-n proper name" },
  ln: { anchor: "proper-names.md#name-instance--ln", summary: "-ln one thing the name applies to" },
  r: { anchor: "pronouns.md#resume-r", summary: "-r resume" },
  rl: { anchor: "dependents.md#dependent-clauses", summary: "-rl stand-in" },
  rm: { anchor: "stand-in-vowels.md#stand-in", summary: "-rm stand-in" },
  rn: { anchor: "stand-in-roles.md#stand-in-roles", summary: "-rn named stand-in" },
  rth: { anchor: "stand-in-vowels.md#stand-in-back", summary: "-rth backward stand-in" },
};

export const WORD_PLURAL_CONSTRUCTIONS: Record<Exclude<Pos, "w" | "h" | "th" | "x">, ConstructionEntry> = {
  z: { anchor: "plurality.md#associative", summary: "-x on /z/" },
  d: { anchor: "plurality.md#associative", summary: "-x on /d/" },
  b: { anchor: "plurality.md#associative", summary: "-x on /b/" },
  y: { anchor: "collectives.md#vocatives-y", summary: "-x on a vocative" },
  v: { anchor: "collectives.md#verbs-v", summary: "collective -x on /v/" },
  g: { anchor: "collectives.md#adjectives-g", summary: "collective -x on /ɡ/" },
};

export const WORD_MISC_CONSTRUCTIONS = {
  gl: { anchor: "left-bound-adjectives.md#left-bound-adjectives", summary: "gl- left-bound adjective" },
  bl: { anchor: "clause.md#extra-nouns", summary: "bl- hosted extra noun: completes the /ɡ/ /h/ or /th/ word right before it" },
  hookedJoin: {
    anchor: "hooked-joins.md#hooked-joins",
    summary: "hooked join: role letter + hook + x + join, bounded by the bl- landmark after it",
    reader:
      "`z-HOOK-x-JOIN | bl-LANDMARK` is one join whose set is bounded by the landmark: the members that stand in that hook's relation to it, not where the event happens. `[z-at-x-everything | bl-house] | v-sleep` = everyone at the house sleeps; `[z-near-x-everything | bl-speaker]` = everyone here; `[d-for-x-wh | bl-speaker]` under a question = what is there for me?; `[z-against-x-everything | bl-speaker]` = everyone against me. Items before it are the whole list within that set: `[z-X | z-at-x-and | bl-house]` = of everyone at the house, only X. `.open` on the join = as far as I know. A point-back hook (`thero`, `from.there`, `on.it`) has no `bl-` word: the landmark is the place already named (`z-there-x-everything` = everyone there). On `h-` it bounds a time word: `[h-from-x-never | bl-thunderstorm]` = never since the thunderstorm, `[h-toward-x-always | bl-…]` = always, until …, `[h-near-x-always | bl-…]` = always around the time of …, `[h-in-x-always | bl-…]` = always, during …; `h-since.then-x-never` = never since then; with `bl-that-clause` the next sentence names the time.",
  },
} satisfies Record<string, ConstructionEntry>;

export const RESOLVE_CONSTRUCTIONS: Record<
  Exclude<`${AnaphorKind}.${"bound" | "unbound"}`, "number.unbound" | "tag.unbound" | "pointer.unbound" | "topic.unbound" | "landmark.unbound"> | "tag.each",
  ConstructionEntry
> = {
  "content.bound": { anchor: "pronouns.md#resume-r", summary: "-r binds an earlier content word" },
  "content.unbound": { anchor: "pronouns.md#resume-r", summary: "-r with no earlier match (the one you both know)" },
  "number.bound": { anchor: "number-markers.md#number-endings", summary: "number -r binds an earlier number" },
  "tag.bound": { anchor: "tag-pronouns.md#tag-pronouns", summary: "tag pronoun: assigned to a phrase, or recalling or sharing an assigned one" },
  "tag.each": {
    anchor: "universals-domains.md#bound-tags",
    summary: "a tag right after a `zual` / `zuam` / `zul` fence binds: each member in turn, to the end of its sentence and the sentences its stand-ins point to",
    reader:
      "A tag letter right after a bracket closed by `everything` or `not` (`[[z-everything | g-cat] | z-tag.A]`) is a variable over the members, each one in turn, not a name for the group: *every cat, each one A*; `[[z-no | g-cat] | z-tag.A]` = *no cat A*. It lasts to the end of its sentence, plus any sentence a `bl-that-clause` / `d-that-clause` in that stretch points to; a tag set later in that stretch is inside it (`[[z-everything | g-dog] | z-tag.A] | [d-cat | d-tag.O]` = each dog may see a different cat). After that, the letter means what it meant before, or nothing.",
  },
  "role.bound": { anchor: "roles.md#role-compounds", summary: "role -r binds an earlier role compound" },
  "role.unbound": { anchor: "roles.md#role-compounds", summary: "role -r with no earlier match" },
  "topic.bound": { anchor: "topic.md#topic-pronoun", summary: "topic pronoun: the one the talk is about now" },
  "pointer.bound": { anchor: "pronouns.md#role-pointers", summary: "role pointer binds a participant of an earlier or this predicate" },
  "landmark.bound": { anchor: "hooked-joins.md#hooked-joins", summary: "a hooked join's point-back binds the landmark already in play" },
};

/** Readings of a whole utterance or clause shape, or of a shared scale (`reading.*`, [construction-trace.ts](./construction-trace.ts)). */
export const READING_CONSTRUCTIONS = {
  existence: { anchor: "predication.md#existence", summary: "verbless /z/ clause: there is …" },
  unsaidEvent: {
    anchor: "predication.md#unsaid-event",
    summary: "verbless clause with a /d/: something happened to it (with a /z/, the /z/ did it), the event unsaid",
    reader:
      "A sentence with a `d-` noun and no `v-` verb leaves the event unsaid: `d-dog` = *Something happened to a dog*; `z-X | d-Y` = *X did something to Y*. Right after a question with a `d-wh` blank, it simply names the answer.",
  },
  kind: { anchor: "universals-domains.md#kind-reference", summary: "zuan + kind: the kind itself, not its members" },
  amountScale: { anchor: "comparative-arity.md#amount-scale", summary: "digitless gral after a rank join: how many" },
  frequencyScale: { anchor: "comparative-arity.md#frequency-scale", summary: "digitless hral after a rank join: how often" },
  bareQuestion: { anchor: "questions.md#question", summary: "yol. / yom. with no body: Huh? / Hm?" },
  greeting: { anchor: "word-endings.md#greeting", summary: "a named citation said alone: hello / goodbye" },
  verbFirstItem: { anchor: "verb-and-stance-joins.md#vp-clause-forms", summary: "words between the subject and the first joined verb: that verb's own" },
  verbSharedNoun: { anchor: "verb-and-stance-joins.md#vp-clause-forms", summary: "/d/ or /b/ right after a verb join: every verb's" },
  fromTo: { anchor: "digit-strings.md#time", summary: "ul + /b/ + oel + /b/: one from … to unit" },
  feelingLandmark: {
    anchor: "how-you-feel.md#urge-landmark",
    summary: "a bl- word after a feeling whose urge moves you: what the urge moves you toward, at, or away from",
    reader:
      "After a feeling with the urge AIMED, TOWARD, GIVING, RESISTING, AWAY, RELEASING, or PLACATING, a `bl-` word names who or what the pull is about: `th-relatedness-unmet-modifiable-AIMED-SETTLED | bl-X` = I resent X. With no `bl-` it is about the `g-stimulus` noun, if there is one.",
  },
  feelingStake: {
    anchor: "feelings.md#feeling-whose-stake",
    summary: "a bl- word after a STAYING, HELD, or UNPLACED feeling: whose stake it is",
    reader:
      "After a feeling with the urge STAYING, HELD, or UNPLACED, a `bl-` word says whose stake it is: the payoff is that person's, and the feeling is still the speaker's. `th-autonomy-unmet-irreversible-STAYING-OPEN | bl-X` = X lost their say for good, and I'm sitting with that.",
  },
} satisfies Record<string, ConstructionEntry>;

/** Tone marks: each mark, and each scope it colors (speech-moves.md § tone marks). */
export const TONE_CONSTRUCTIONS = {
  "mark.strong": { anchor: "tone-marks.md#tone-marks", summary: "! strong feeling" },
  "mark.strong2": { anchor: "tone-marks.md#tone-marks", summary: "!! stronger feeling" },
  "mark.unsure": { anchor: "questions.md#question-tone", summary: "? unsure" },
  "mark.unsure2": { anchor: "tone-marks.md#tone-marks", summary: "?? very unsure" },
  "mark.joking": { anchor: "tone-marks.md#tone-marks", summary: "% joking, not literal" },
  "mark.joking2": { anchor: "tone-marks.md#tone-marks", summary: "%% broadly joking" },
  "mark.contrast": { anchor: "tone-marks.md#tone-marks", summary: "& contrastive focus" },
  "mark.contrast2": { anchor: "tone-marks.md#tone-marks", summary: "&& strong contrast" },
  "mark.warm": { anchor: "tone-marks.md#tone-marks", summary: "; warm, affectionate" },
  "mark.warm2": { anchor: "tone-marks.md#tone-marks", summary: ";; very warm" },
  "mark.stack": { anchor: "tone-marks.md#tone-marks", summary: "two or more marks combined (`?!`, `&;`)" },
  "scope.word": { anchor: "questions.md#question-tone", summary: "mark attached to a word" },
  "scope.island": { anchor: "scope-islands.md#scope-islands", summary: "mark attached to a scope island" },
  "scope.span": { anchor: "tone-marks.md#tone-marks", summary: "mark attached to a span" },
  "scope.rest": { anchor: "questions.md#question-tone", summary: "free-standing mark: rest of the sentence" },
} satisfies Record<string, ConstructionEntry>;

/**
 * Number-stem features (`number.*`), one per lesson: marker identity, digitless,
 * exponents, digitless-exponent classes, percent, decimal, groups, writing marks,
 * and the non-referential PoS a number takes. Traced on free numbers and on the
 * body of a numeric prefix.
 */
export const NUMBER_FEATURE_CONSTRUCTIONS = {
  "marker.scalarPos": { anchor: "numbers.md#counts", summary: "+ count" },
  "marker.scalarNeg": { anchor: "number-markers.md#marker-vowel-referential-identity", summary: "- negative" },
  "marker.ordinalFwd": { anchor: "numbers.md#ordinals", summary: "# ordinal" },
  "marker.ordinalEnd": { anchor: "stacked-markers.md#from-the-end-end-relative-ordinal-marker-uo", summary: "#- ordinal from the end" },
  "marker.label": { anchor: "digit-strings.md#digit-strings", summary: "_ label / digit string" },
  "marker.negativeLabel": { anchor: "stacked-markers.md#stacked-markers", summary: "#_ negative label" },
  "marker.errorBound": { anchor: "stacked-markers.md#stacked-markers", summary: "+- error bound" },
  digitless: { anchor: "numbers.md#more-than-one", summary: "number with no digits" },
  exponent: { anchor: "digitless-exponents.md#exponents", summary: "digitful exponent" },
  "exp.landmark": { anchor: "special-values.md#special-values", summary: "digitless exponent e / e-" },
  "exp.bareOom": { anchor: "digitless-exponents.md#bare-oom", summary: "bare OoM band e0 / e3" },
  "exp.zero": { anchor: "special-values.md#zero-exponent", summary: "zero × exponent 0e / ±0e-1" },
  "exp.hyperbole": { anchor: "special-values.md#hyperbole", summary: "mantissa + digitless exponent (1e)" },
  "exp.shortfall": { anchor: "special-values.md#special-referential", summary: "just-short -e-" },
  percent: { anchor: "measures-and-percent.md#percent-and-percentage-points", summary: "percent / percentage points" },
  decimal: { anchor: "digitless-exponents.md#exponents", summary: "decimal point" },
  groups: { anchor: "digit-strings.md#digit-strings", summary: "more than one digit group" },
  code: {
    anchor: "number-markers.md#letter-codes",
    summary: "code with letters",
    reader:
      "A `_` code may hold letters as well as digits, read as the letters themselves: `_b12` = B12, `_4b` = 4B, `_v16` = F-16 (Ageben `v`, `b`, `d`, `g`, `z` stand for English f, p, t, k, s). With `@` (`.named`) and only letters it is usually a title's initials (`@_nl` = the NL, short for a long two-root title).",
  },
  calendar: {
    anchor: "digit-strings.md#time",
    summary: "calendar ordinal (date)",
    reader: "A date: `_22,7` is day 22 of month 7 (22 July); a third field is the year (`_22,7,2026`).",
  },
  "writingMark.~": { anchor: "number-markers.md#number-endings", summary: "~ = -m in writing" },
  "writingMark.@": { anchor: "number-markers.md#number-endings", summary: "@ = -n in writing" },
  "writingMark.=": { anchor: "number-markers.md#number-endings", summary: "= = -r in writing" },
  "pos.v": { anchor: "number-roles.md#number-as-verb-by-marker", summary: "number as verb" },
  "pos.h": { anchor: "digit-strings.md#time", summary: "number as adverb" },
  "pos.th": { anchor: "number-roles.md#number-as-stance-by-marker", summary: "number as stance" },
  "pos.y": { anchor: "number-roles.md#number-as-interjection-by-marker", summary: "number as interjection" },
  "pos.x": { anchor: "number-roles.md#number-as-discourse-marker-by-marker", summary: "number as discourse marker" },
} satisfies Record<string, ConstructionEntry>;

type Vowel = "a" | "e" | "o" | "u";

/** Label reach: each seam vowel (label-seams.md#label-reach). */
const SCOPE_FEATURE_CONSTRUCTIONS: Record<string, ConstructionEntry> = {
  "vowel.a": { anchor: "label-seams.md#label-reach", summary: "type across scenes tha", reader: REACH_READER },
  "vowel.e": { anchor: "label-seams.md#label-reach", summary: "this pair the", reader: REACH_READER },
  "vowel.o": { anchor: "label-seams.md#label-reach", summary: "practiced role tho", reader: REACH_READER },
  "vowel.u": { anchor: "label-seams.md#label-reach", summary: "this episode thu", reader: REACH_READER },
  "vowel.ae": { anchor: "label-seams.md#reach-stacks", summary: "the situation thae", reader: REACH_READER },
  "vowel.ao": { anchor: "label-seams.md#reach-stacks", summary: "using the role thao", reader: REACH_READER },
  "vowel.oe": { anchor: "label-seams.md#reach-stacks", summary: "toward the role thoe", reader: REACH_READER },
  "vowel.ua": { anchor: "label-seams.md#reach-stacks", summary: "type except this episode thua", reader: REACH_READER },
  "vowel.ue": { anchor: "label-seams.md#reach-stacks", summary: "type except this pair thue", reader: REACH_READER },
  "vowel.uo": { anchor: "label-seams.md#reach-stacks", summary: "not in that role thuo", reader: REACH_READER },
};

/** Sakes: each stance vowel, and the endings on it (sakes.md). */
export const SAKE_FEATURE_CONSTRUCTIONS: Record<`stance.${Vowel}` | `ending.${Vowel}.${"l" | "m" | "r"}` | "emotion", ConstructionEntry> = {
  "stance.a": { anchor: "sakes.md#met", summary: "met tha" },
  "stance.u": { anchor: "sakes.md#unmet-thu-detracts-from-the-sake", summary: "unmet thu" },
  "stance.e": { anchor: "ought-for-a-sake.md#prescription-the-ought-this-act-for-this-sake", summary: "prescription the" },
  "stance.o": { anchor: "for-a-sake.md#motive-tho-time-horizon", summary: "motive tho" },
  "ending.a.l": { anchor: "sakes.md#time-horizon-endings-on-met", summary: "met time horizon -l" },
  "ending.a.m": { anchor: "sakes.md#met", summary: "met time horizon -m" },
  "ending.a.r": { anchor: "sakes.md#time-horizon-endings-on-met", summary: "met time horizon -r" },
  "ending.u.l": { anchor: "sakes.md#unmet-thu-detracts-from-the-sake", summary: "unmet -l" },
  "ending.u.m": { anchor: "sakes.md#unmet-thu-detracts-from-the-sake", summary: "unmet -m" },
  "ending.u.r": { anchor: "sakes.md#unmet-thu-detracts-from-the-sake", summary: "unmet -r" },
  "ending.e.l": { anchor: "ought-for-a-sake.md#prescription-the-ought-this-act-for-this-sake", summary: "invited prescription" },
  "ending.e.m": { anchor: "ought-for-a-sake.md#prescription-the-ought-this-act-for-this-sake", summary: "unasked prescription" },
  "ending.e.r": { anchor: "ought-for-a-sake.md#prescription-the-ought-this-act-for-this-sake", summary: "tryout prescription" },
  "ending.o.l": { anchor: "for-a-sake.md#motive-tho-time-horizon", summary: "motive standing -l" },
  "ending.o.m": { anchor: "for-a-sake.md#motive-tho-time-horizon", summary: "motive standing -m" },
  "ending.o.r": { anchor: "for-a-sake.md#motive-tho-time-horizon", summary: "motive standing -r" },
  "emotion": { anchor: "how-you-feel.md#feeling-word", summary: "emotion tail (urge vowel + duration ending)" },
};

/** Join fence series vowel (joins.md, comparatives.md). */
export type JoinSeries = "a" | "o" | "ao" | "u" | "ua" | "uo" | "e" | "ae" | "oe" | "ue";

export const JOIN_SERIES_CONSTRUCTIONS: Record<JoinSeries, ConstructionEntry> = {
  a: { anchor: "joins.md#and-lists-a", summary: "and" },
  o: {
    anchor: "joins.md#rank-o",
    summary: "rank",
    reader:
      "`rank/more` closes a bracket that ranks its items on the word after it, earlier above later: `[z-X | z-Y | z-rank/more | g-tall]` = X is taller than Y. With one item, it is the top of all (the biggest).",
  },
  ao: { anchor: "rank-joins.md#route-ao", summary: "route (first = start)" },
  u: { anchor: "joins.md#negation-u", summary: "none of" },
  ua: {
    anchor: "joins.md#everything-ua",
    summary: "everything but",
    reader:
      "Word order sets which of two quantities covers the other: a bracket closed by `everything` or `not`, or a noun that brings in a new one (*a cat*), covers whatever comes after it in its sentence, and any sentence a stand-in in that stretch points to. `[z-everything | g-dog] | d-cat | v-see` = every dog sees a cat (each may see a different cat); `d-cat | [z-everything | g-dog] | v-see` = there is one cat that every dog sees. `v-not` after the verb is inside them: `[z-everything | g-cat] | [v-sleep | v-not]` = each cat does not sleep. Who does what never changes.",
  },
  uo: { anchor: "rank-joins.md#invert-u-stacks", summary: "rank reversal" },
  e: { anchor: "joins.md#choice-e", summary: "choice" },
  ae: { anchor: "set-joins.md#exclusivity-and-denying-a-whole-list", summary: "and/or" },
  oe: { anchor: "comparatives.md#equatives-oe-shared-scale", summary: "equal rank" },
  ue: { anchor: "rank-joins.md#invert-u-stacks", summary: "anything but" },
};

/** **-x** on a join **-r**: an unspecified group (`zarx`, joins.md#unspecified-member-r-phrase). */
export const JOIN_PLURAL_CONSTRUCTIONS = {
  plural: { anchor: "joins.md#unspecified-member-r-phrase", summary: "-x after a join -r: some ones (zarx)" },
} satisfies Record<string, ConstructionEntry>;

/** Speech-act words: vowel, and the soft (-m) form (speech-moves.md). */
export const FORCE_CONSTRUCTIONS: Record<Vowel | "soft", ConstructionEntry> = {
  a: { anchor: "speech-moves.md#speech-act-statement-question-command", summary: "yal statement" },
  o: { anchor: "speech-moves.md#speech-act-statement-question-command", summary: "yol command" },
  e: { anchor: "speech-moves.md#speech-act-statement-question-command", summary: "yel question" },
  u: { anchor: "speech-moves.md#speech-act-statement-question-command", summary: "yul prohibition" },
  soft: { anchor: "questions.md#question", summary: "soft speech act (-m)" },
};

/** Polar particles, grouped by the section that teaches them (questions.md). */
export const POLAR_CONSTRUCTIONS = {
  starter: { anchor: "questions.md#polar-particle", summary: "yaol yes / yuol no / yael sure" },
  fuller: { anchor: "polar-inventory.md#polar-particle-fuller-inventory", summary: "yuel / yual / yoel" },
} satisfies Record<string, ConstructionEntry>;

/** Polar series → {@link POLAR_CONSTRUCTIONS} key. */
export const POLAR_GROUP: Record<Exclude<JoinSeries, Vowel>, keyof typeof POLAR_CONSTRUCTIONS> = {
  ae: "starter",
  ue: "fuller",
  ao: "starter",
  uo: "starter",
  ua: "fuller",
  oe: "fuller",
};

/** Restrictors, grouped by the section that teaches them (restrictors.md). */
export const RESTRICTOR_CONSTRUCTIONS = {
  onlyWhen: { anchor: "restrictors.md#only-when-never-hal", summary: "hal only when / never" },
  always: { anchor: "restrictors.md#always-hual", summary: "hual always" },
  sometimes: { anchor: "restrictors.md#sometimes-anytime-some-other-time", summary: "sometimes / anytime / some other time" },
  set: { anchor: "restrictors.md#sometimes-anytime-some-other-time", summary: "set / invert / inclusive restrictor" },
  ranked: { anchor: "more-occasions.md#ranked-with-listed-occasions", summary: "ranked restrictor" },
} satisfies Record<string, ConstructionEntry>;

/** Restrictor series → {@link RESTRICTOR_CONSTRUCTIONS} key. */
export const RESTRICTOR_GROUP: Record<JoinSeries, keyof typeof RESTRICTOR_CONSTRUCTIONS> = {
  a: "onlyWhen",
  ua: "always",
  u: "sometimes",
  e: "set",
  ae: "set",
  ue: "set",
  o: "ranked",
  ao: "ranked",
  oe: "ranked",
  uo: "ranked",
};

/** Stand-in vowels (dependents.md). */
export const STAND_IN_CONSTRUCTIONS: Record<Vowel, ConstructionEntry> = {
  a: { anchor: "dependents.md#dependent-clauses", summary: "darl / barl that" },
  o: { anchor: "stand-in-vowels.md#stand-in", summary: "dorl to" },
  e: { anchor: "dependents.md#dependent-clauses", summary: "derl whether" },
  u: { anchor: "stand-in-vowels.md#stand-in", summary: "durl lest" },
};

export const STAND_IN_BACK_CONSTRUCTIONS: Record<Vowel, ConstructionEntry> = {
  a: { anchor: "stand-in-vowels.md#stand-in-back", summary: "darth that same claim" },
  o: { anchor: "stand-in-vowels.md#stand-in-back", summary: "dorth that same instruction" },
  e: { anchor: "stand-in-vowels.md#stand-in-back", summary: "derth that same question" },
  u: { anchor: "stand-in-vowels.md#stand-in-back", summary: "durth that same don't" },
};

/** Hook forms (hooks.md, discourse-hooks.md). */
export const HOOK_FORM_CONSTRUCTIONS: Record<ExtraNounHook | "ar" | "or" | "er" | "ur" | "aor" | "aer" | "uer", ConstructionEntry> = {
  ar: { anchor: "in-clause-hooks.md#hook-resume", summary: "ar resume hook" },
  er: { anchor: "in-clause-hooks.md#hook-resume", summary: "er resume hook" },
  or: { anchor: "in-clause-hooks.md#hook-resume", summary: "or resume hook" },
  ur: { anchor: "in-clause-hooks.md#hook-resume", summary: "ur resume hook" },
  aor: { anchor: "in-clause-hooks.md#hook-resume", summary: "aor resume hook (with it)" },
  aer: { anchor: "in-clause-hooks.md#hook-resume", summary: "aer resume hook (on it)" },
  uer: { anchor: "in-clause-hooks.md#hook-resume", summary: "uer resume hook (through there)" },
  al: {
    anchor: "hooks.md#including-am-al",
    summary: "al including",
    reader: "`A | including | B` keeps its reading between two numbers (`z-3 | including | z-5` = 3, including 5); a range of numbers uses the range hooks (through, through-excluding, outside, strictly-between, taking-turns).",
  },
  am: { anchor: "hooks.md#including-am-al", summary: "am including" },
  el: { anchor: "hooks.md#instead-el", summary: "el instead" },
  em: { anchor: "hooks.md#closed-and-open-endings", summary: "em instead" },
  ol: { anchor: "hooks.md#rather-ol", summary: "ol rather" },
  om: { anchor: "hooks.md#closed-and-open-endings", summary: "om rather" },
  ul: {
    anchor: "hooks.md#except-ul",
    summary: "ul except",
    reader: "`A | except | B` keeps its reading between two numbers (A, except B); it is never a range. *From X to Y* on the clause is `from | b-X | toward | b-Y`.",
  },
  um: { anchor: "hooks.md#closed-and-open-endings", summary: "um except" },
  aol: {
    anchor: "extra-noun-hooks.md#extra-noun-stacked-vowels-and-loose-m",
    summary: "aol using / taking-turns",
    reader:
      "`A | taking-turns | B` between two same-role words = A through B, one after another, in the order said (a walk, not a set: `through` names the set).",
  },
  aom: { anchor: "extra-noun-hooks.md#extra-noun-stacked-vowels-and-loose-m", summary: "aom by" },
  ael: { anchor: "extra-noun-hooks.md#extra-noun-stacked-vowels-and-loose-m", summary: "ael on" },
  aem: { anchor: "extra-noun-hooks.md#extra-noun-stacked-vowels-and-loose-m", summary: "aem over" },
  oel: {
    anchor: "extra-noun-hooks.md#extra-noun-stacked-vowels-and-loose-m",
    summary: "oel toward / through",
    reader:
      "Range hooks between two same-role words: `through` A, B and all between; `through-excluding` A up to B, B (the end said second) left out; `outside` only what lies beyond the A–B band; `strictly-between` only what lies between; `taking-turns` A through B one after another. `.approx` softens the ends, `.named` names the band, `some.` is one unnamed member. A hook + `b-` right after a landmark always describes that landmark, never a range.",
  },
  oem: { anchor: "extra-noun-hooks.md#extra-noun-stacked-vowels-and-loose-m", summary: "oem" },
  ual: {
    anchor: "extra-noun-hooks.md#extra-noun-stacked-vowels-and-loose-m",
    summary: "ual out of / outside",
    reader: "`A | outside | B` between two values is everything beyond the band: `z-two | outside | z-nine` = below 2 or above 9.",
  },
  uam: { anchor: "extra-noun-hooks.md#extra-noun-stacked-vowels-and-loose-m", summary: "uam" },
  uol: {
    anchor: "extra-noun-hooks.md#extra-noun-stacked-vowels-and-loose-m",
    summary: "uol against / strictly-between",
    reader: "`A | strictly-between | B` is only what lies between the ends, both ends left out: `z-two | strictly-between | z-nine` = above 2 and below 9.",
  },
  uom: {
    anchor: "extra-noun-hooks.md#extra-noun-stacked-vowels-and-loose-m",
    summary: "uom contrary-to",
    reader:
      "`[contrary-to | th-…]` = against that one stance (my plan, my wishes). A holder first makes it that person's, as one stance: `[contrary-to | th-CLUES-X | th-plan-itinerary]` = against X's plan, as far as I can tell.",
  },
  uel: {
    anchor: "extra-noun-hooks.md#extra-noun-stacked-vowels-and-loose-m",
    summary: "uel through / through-excluding",
    reader: "`A | through-excluding | B` = from A up to B, the end said second left out: `z-3 | through-excluding | z-5` = 3 up to but not including 5; `z-5 | through-excluding | z-3` leaves 3 out.",
  },
  uem: { anchor: "extra-noun-hooks.md#extra-noun-stacked-vowels-and-loose-m", summary: "uem by-way-of" },
};

/** Range hooks on **-r** between two same-role words: one unnamed member of the range (ranges.md#ranges). */
export const RANGE_MEMBER_CONSTRUCTIONS: Record<"oer" | "uer" | "uar" | "uor" | "aor", ConstructionEntry> = {
  oer: { anchor: "ranges.md#ranges", summary: "oer some member, A through B" },
  uer: {
    anchor: "ranges.md#ranges",
    summary: "uer some member, A up to B, B left out",
    reader: "`A | some.through-excluding | B` = some one member from A up to B, B left out.",
  },
  uar: { anchor: "ranges.md#ranges", summary: "uar some member outside A–B" },
  uor: { anchor: "ranges.md#ranges", summary: "uor some member strictly between A and B" },
  aor: {
    anchor: "ranges.md#ranges",
    summary: "aor the current one, whose turn it is",
    reader:
      "`A | some.taking-turns | B` = the current one, whose turn it is, on the walk from A through B (the ones before it have had their turn); under a question it asks which one now (whose turn? which chapter are you on?).",
  },
};

/** Span features: the written fidelity marks (spans.md). */
export const SPAN_FEATURE_CONSTRUCTIONS: Record<`mark.${"^@" | "@" | "~"}`, ConstructionEntry> = {
  "mark.^@": { anchor: "spans-as-words.md#one-of-a-title", summary: "^@ one thing the span's name applies to" },
  "mark.@": { anchor: "spans.md#exact-paraphrase-proper", summary: "@ proper span" },
  "mark.~": { anchor: "spans.md#exact-paraphrase-proper", summary: "~ paraphrase span" },
};

/** Role words: the part consonant, the label reach after `w`, ability, the -r instance, and acting as (`/h/`) (roles.md). */
export const ROLE_FEATURE_CONSTRUCTIONS: Record<
  `part.${Exclude<RolePart, "v">}` | `scope.${ReachVowel}` | "ability" | "instance" | "actingAs",
  ConstructionEntry
> = {
  "part.z": { anchor: "roles.md#role-compounds", summary: "agent z" },
  "part.d": { anchor: "roles.md#the-undergoer-d", summary: "patient d" },
  "part.b": { anchor: "roles.md#the-extra-b-party-b", summary: "recipient b" },
  "part.h": { anchor: "role-parts.md#content-of-the-event", summary: "manner h" },
  "part.g": { anchor: "role-parts.md#content-of-the-event", summary: "state g" },
  "part.th": { anchor: "role-parts.md#content-of-the-event", summary: "stance th" },
  "part.w": { anchor: "role-parts.md#content-of-the-event", summary: "extent w" },
  "part.y": { anchor: "role-parts.md#content-of-the-event", summary: "speech move y" },
  "part.x": { anchor: "role-parts.md#content-of-the-event", summary: "outcome x" },
  "scope.a": { anchor: "label-seams.md#reach-type", summary: "type across scenes a" },
  "scope.e": { anchor: "label-seams.md#reach-relative", summary: "this pair e" },
  "scope.o": { anchor: "roles.md#one-time-or-a-practice", summary: "practiced role o" },
  "scope.u": { anchor: "roles.md#role-compounds", summary: "this episode u" },
  "scope.ae": { anchor: "label-seams.md#reach-stacks", summary: "the situation ae" },
  "scope.ao": { anchor: "label-seams.md#reach-stacks", summary: "using the role ao" },
  "scope.oe": { anchor: "label-seams.md#reach-stacks", summary: "toward the role oe" },
  "scope.ua": { anchor: "label-seams.md#reach-stacks", summary: "type except this episode ua" },
  "scope.ue": { anchor: "label-seams.md#reach-stacks", summary: "type except this pair ue" },
  "scope.uo": { anchor: "label-seams.md#reach-stacks", summary: "not in that role uo" },
  ability: { anchor: "can-and-cant.md#can-be-role-ability", summary: "role + ability: can be that role" },
  instance: { anchor: "roles.md#this-instance-r", summary: "-r this instance" },
  actingAs: { anchor: "role-parts.md#acting-as", summary: "slot-part role compound on /h/: the role the act is done in" },
};

/** Role pointers: which part the consonant names, and which event the pointer vowel picks (pronouns.md#role-pointers). */
export const POINTER_FEATURE_CONSTRUCTIONS: Record<
  `vowel.${PointerVowel}` | `part.${RolePart}` | "scope.u" | "new" | "share",
  ConstructionEntry
> = {
  "scope.u": { anchor: "pronouns.md#role-pointers", summary: "this episode u" },
  "part.z": { anchor: "pronouns.md#role-pointers", summary: "pointer to the doer" },
  "part.d": { anchor: "pronouns.md#role-pointers", summary: "pointer to the undergoer" },
  "part.b": { anchor: "pronouns.md#role-pointers", summary: "pointer to the extra party" },
  "part.h": { anchor: "role-parts.md#content-of-the-event", summary: "pointer to the manner" },
  "part.g": { anchor: "role-parts.md#content-of-the-event", summary: "pointer to the resulting state" },
  "part.th": { anchor: "role-parts.md#content-of-the-event", summary: "pointer to the stance" },
  "part.w": { anchor: "role-parts.md#content-of-the-event", summary: "pointer to the extent" },
  "part.y": { anchor: "role-parts.md#content-of-the-event", summary: "pointer to the speech move" },
  "part.x": { anchor: "role-parts.md#content-of-the-event", summary: "pointer to the outcome" },
  "part.v": { anchor: "role-parts.md#content-of-the-event", summary: "pointer to the event" },
  "vowel.e": { anchor: "pronouns.md#role-pointers", summary: "same: the latest predicate with that role" },
  "vowel.a": { anchor: "pronouns.md#the-other-one", summary: "other: the nearest predicate with someone else in that role" },
  "vowel.o": { anchor: "pronouns.md#themself", summary: "self: this clause's predicate" },
  "vowel.u": { anchor: "pronouns.md#whoever-it-was", summary: "unsaid: the latest predicate that left that role unsaid" },
  new: { anchor: "pronouns.md#a-new-one", summary: "-l a new one of the participant's kind" },
  share: { anchor: "pronouns.md#share", summary: "-m the participant's part in the event" },
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
  ...prefixed("join", JOIN_PLURAL_CONSTRUCTIONS),
  ...prefixed("force", FORCE_CONSTRUCTIONS),
  ...prefixed("polar", POLAR_CONSTRUCTIONS),
  ...prefixed("restrictor", RESTRICTOR_CONSTRUCTIONS),
  ...prefixed("standIn", STAND_IN_CONSTRUCTIONS),
  ...prefixed("standInBack", STAND_IN_BACK_CONSTRUCTIONS),
  ...prefixed("hook", HOOK_FORM_CONSTRUCTIONS),
  ...prefixed("rangeMember", RANGE_MEMBER_CONSTRUCTIONS),
  ...prefixed("span", SPAN_FEATURE_CONSTRUCTIONS),
  ...prefixed("role", ROLE_FEATURE_CONSTRUCTIONS),
  ...prefixed("pointer", POINTER_FEATURE_CONSTRUCTIONS),
]);

type OverlayEntrySource = { senseForm: string; pos: string; anchor: string; kind: string; gloss: string };

const PURPOSE_READER =
  "`th-so-that` is the speaker's own aim, never the subject's: `z-X | v-walk | [th-so-that | bl-that-clause] | z-Y | v-sit` = X walks, and my aim is for Y to sit (with *I* or *we* as subject, plain *so that* / *in order to*). In a question it is the listener's aim: `y-question | [th-so-that | bl-wh] | z-listener | v-walk` = What do you walk for? With another subject, *What is your aim for X's walk?* Never *X wants* or *X intends*.";

/** Reader notes for overlay rows, keyed by `overlay.<sense_form>.<pos>`. */
const OVERLAY_READERS: Readonly<Record<string, string>> = {
  "overlay.ovam.th": PURPOSE_READER,
  "overlay.ovam.g": PURPOSE_READER,
};

/** Every construction ID → entry, including one `overlay.*` entry per closed overlay row. */
export function constructionRegistry(overlays: Iterable<OverlayEntrySource>): Map<string, ConstructionEntry> {
  const registry = new Map(CONSTRUCTIONS);
  for (const o of overlays) {
    const id = overlayConstructionId(o);
    const reader = OVERLAY_READERS[id];
    registry.set(id, { anchor: o.anchor, summary: `${o.kind} overlay ${o.gloss}`, ...(reader ? { reader } : {}) });
  }
  return registry;
}

/**
 * Shapes the grammar docs rule out, checked in [enforce.ts](./enforce.ts). Each
 * anchor is the section that states the rule, so an error sends the reader there.
 */
export const REJECTIONS = {
  verbSharedOwn: { anchor: "verb-and-stance-joins.md#vp-clause-forms", summary: "a joined verb with its own object or recipient takes no shared one: say it in that verb's item, or share it and drop the item's own" },
  genitiveHost: { anchor: "social-ties.md#genitive", summary: "`om` + `/b/` follows the noun B uses" },
  turnSeriesCall: { anchor: "speech-moves.md#vocative", summary: "an act or polar series word takes -l / -m / -r, never the call ending -n (`yan`, `yaen`)" },
  polarOrder: { anchor: "questions.md#polar-particle", summary: "a polar word is one answer or one check-back: not two in a row, and not before an act word (an answer and then a question are two turns)" },
  checkBackBody: { anchor: "polar-inventory.md#check-backs", summary: "a check-back (`yel` and a polar word) is a turn of its own: end it with a period (`zazozon vowurol. yol yael.`)" },
  sentenceEndMark: { anchor: "tone-marks.md#tone-marks", summary: "a sentence ends in `.`; `?` / `!` are tone-mark prefixes" },
  toneStack: { anchor: "tone-marks.md#tone-marks", summary: "a tone mark stack uses ! ? % & ; in any order, each at most twice; a space between marks is not a stack" },
  toneTarget: { anchor: "tone-marks.md#tone-marks", summary: "a tone mark goes before a word, an island open {, or a span" },
  linkerAlone: { anchor: "sentence-linkers.md#sentence-linkers", summary: "a sentence linker joins the last sentence to the one it starts, so a clause follows it (`xezem zalazun veruvol.`)" },
  linkerMidSentence: { anchor: "sentence-linkers.md#sentence-linkers", summary: "a sentence linker or topic word comes only at the start of a sentence" },
  pluralOnPos: { anchor: "plurality.md#associative", summary: "-x is unused on /w/, /h/, /th/, and the published /x/ linkers" },
  pluralInterjection: { anchor: "collectives.md#vocatives-y", summary: "-x on /y/ goes on a vocative (-n / -r), not an interjection" },
  sakeSlot: { anchor: "sakes.md#sake-inventory", summary: "a sake form goes on /ɡ/, /th/, or /w/ only" },
  emotionTail: { anchor: "how-you-feel.md#feeling-word", summary: "the emotion tail goes on tha / tho / thu and ends in -r / -m / -l" },
  sakeEnding: { anchor: "sakes.md#word-shape", summary: "a sake word ends in -l / -m / -r (its stance's ending table), with or without an emotion tail" },
  sakeStackedVowel: { anchor: "sakes.md#word-shape", summary: "a sake stance is one vowel; stacked vowels after th are the emotion urge after the horizon letter" },
  prescriptionSlot: { anchor: "ought-for-a-sake.md#prescription-the-ought-this-act-for-this-sake", summary: "prescription (the) goes on /th/ only: it is about an act, not a noun" },
  labelReachSlot: { anchor: "label-seams.md#label-reach", summary: "label reach goes on /ɡ/, /z/, /d/, /b/, /v/, or /h/ only" },
  labelReachStem: { anchor: "label-seams.md#label-reach", summary: "a reach seam labels a content root, not a special pronoun" },
  roleCompoundSlot: { anchor: "roles.md#role-compounds", summary: "a role compound goes on /z/, /d/, /b/, /ɡ/, as a topic under /x/, as a call under /y/ (-n / -r), or under /h/ with a slot part (acting as); not on /v/, /w/, or /th/, and not a content part on /h/" },
  hookPrefixSlot: { anchor: "hook-compounds.md#hook-prefixes", summary: "a hook prefix goes on /ɡ/, /z/, /d/, /b/, or /h/; not on /v/, /w/, /th/, /x/, or /y/" },
  hookedJoinSlot: { anchor: "hooked-joins.md#hooked-joins", summary: "a hooked join goes on /z/, /d/, /b/, or /h/; not on /ɡ/, /v/, /w/, /th/, /x/, or /y/, and never as a hosted bl- word" },
  hookedJoinLandmark: { anchor: "hooked-joins.md#hooked-joins", summary: "a hooked join on hook -l or -m takes its landmark: the bl- word right after it" },
  hookedJoinPointBack: { anchor: "hooked-joins.md#hooked-joins-point-back", summary: "r before the seam is a hook that points back on its own (`ar` `aor` `or` `ur` `uer` `er` `aer`)" },
  hookedJoinPointBackLandmark: { anchor: "hooked-joins.md#hooked-joins-point-back", summary: "a hooked join on hook -r points back to the landmark in play, so no bl- word follows it" },
  hookedJoinUnbound: { anchor: "hooked-joins.md#hooked-joins-point-back", summary: "a hooked join on hook -r needs a landmark in play (on /h/, a time landmark)" },
  hookedJoinClause: { anchor: "hooked-joins.md#hooked-joins-clause", summary: "only an /h/ hooked join takes blarl: the time the next sentence names" },
  hookedJoinRestrictor: { anchor: "hooked-joins.md#hooked-joins-time", summary: "an /h/ hooked join's join is a bare restrictor (`al` `am` `ual` `uam` `ar` `or` `ur` `er`)" },
  hookedJoinTime: { anchor: "hooked-joins.md#hooked-joins-time", summary: "an /h/ hooked join takes a hook with a time reading: `a` `e` `u` `oe`, the zone `em`, or point-back `ar` `er` `ur`" },
  roleCompoundStem: { anchor: "roles.md#role-compounds", summary: "a role compound names a role of an event; a special pronoun is not an event" },
  abilitySlot: { anchor: "can-and-cant.md#ability", summary: "ability (x + vowel) goes on /v/ or /ɡ/ only; name + x + vowel + -n is a conversation-length bid only as a citation or a /y/ call" },
  labelReachArrow: { anchor: "viewpoint.md#landmark-facing", summary: "on a direction root the th seam takes only e (the landmark's own facing)" },
  pluralKindAfterUniversal: { anchor: "universals-domains.md#universals-domains-generics", summary: "the kind word after ua / uo takes no -x" },
  stackedHookResume: { anchor: "ranges.md#ranges", summary: "stacked range hook -r (oer / uar / uor) needs same-role words on both sides" },
  hookSameRoleStack: { anchor: "hooks.md#including-am-al", summary: "between same-role words only the plain hooks (al el ol ul) and the range hooks (oel uel ual uol aol) have a reading; for such as, use am" },
  rangeEndpointKind: { anchor: "ranges.md#ranges", summary: "two number ends of a range share one line: amounts (and ±∞), ranks (and first / last place), or labels; an amount through a rank has no reading" },
  hookDiscourseStack: { anchor: "hooks.md#discourse-hooks", summary: "at the front of a sentence only al el ol ul, aol and ael have a reading; for next, by the way, on the contrary use a linker" },
  stackedJoinResume: { anchor: "verb-and-stance-joins.md#vp-clause-forms", summary: "stacked join vowels take no -r on /z/ /d/ /b/ /v/ /x/ /ɡ/ (only a / o / e / u do); a stacked -r is the stance fill-ask under /th/" },
  spanSlot: { anchor: "spans.md#pos", summary: "an aside goes only under /th/ /ɡ/ /w/ /h/; a cite, mention or opaque span fills a content slot (/z/ /d/ /b/ /v/ /ɡ/ /h/) or /w/, or sets the topic under /x/" },
  turnWordModifier: {
    anchor: "more-turn-words.md#describe-turn-word",
    summary: "/w/ goes before a reaction, not a call; a number cheer or a span under /y/ takes no gl-, /ɡ/, or /w/",
  },
  ySpanType: { anchor: "spans.md#y-spans", summary: "a span under /y/ is opaque <…> or a cite […]; a mention or an aside is not a call or a reaction" },
  barKind: {
    anchor: "bars.md#bars",
    summary: "a bar is a stance that sets a value: a met sake, a channel, FORMER, NOTIONAL, PLAN, WANT, ability, permission, requirement, consent, or a speaker attitude",
  },
  barCount: { anchor: "bars.md#bars", summary: "a rank fence ranks one item against one bar; with a bar there is no second comparee, noun or bar" },
  rankJoinNumberManner: { anchor: "comparative-arity.md#manner-scale", summary: "the /h/ after a rank join is a manner word; the only number there is digitless h+ (how often)" },
  zoneKind: {
    anchor: "contrary-to.md#contrary-to-stance",
    summary: "the stance after uom says what the event goes against: a channel, PLAN, DECISION, WANT, a ban, a requirement, a refusal, or a speaker attitude",
  },
  hookSameRole: { anchor: "hooks.md#including-am-al", summary: "an in-clause hook goes between two phrases in the same clause role (A HOOK B)" },
  hookStandIn: { anchor: "hooks.md#since", summary: "the only hook that takes a stand-in is `ul barl` (since); contrary to an event is `hezem blarl`" },
  dependentStanceOnly: {
    anchor: "dependents.md#dependent-clauses",
    summary: "the sentence after a stand-in names an event or a thing; a stance word alone fills it only as a lone feeling, thanks, or sorry",
  },
  predicateAfterVerb: { anchor: "predication.md#classification", summary: "a /ɡ/ word right after the verb has no reading (no depictive or resultative); say the state in its own sentence, with `herom blarl`, or with the adjective as a verb under `thewom`" },
  blNoHost: { anchor: "clause.md#extra-nouns", summary: "a bl- word completes the /ɡ/ /h/ or /th/ word right before it, so it needs one there (`hewem blazozon`); a recipient is a plain /b/ (`balazun`)" },
  blListItem: { anchor: "clause.md#extra-nouns", summary: "in a hosted list every /b/ item takes bl- (`hazam bludehal bluzedel bal`); the join word does not" },
  glNoNoun: { anchor: "left-bound-adjectives.md#left-bound-adjectives", summary: "a gl- adjective describes the next noun, so a noun must follow it (`globulol zodozel`); with no noun after it, use a plain /ɡ/ word" },
  nameInstanceSlot: { anchor: "proper-names.md#name-instance--ln", summary: "-ln (span ^@) is one thing a name applies to: it fills /z/ /d/ /b/ or stands as a citation, never on /ɡ/ /v/ /h/ /w/ /th/ /x/ /y/, and never on a pronoun root" },
  standInRole: { anchor: "stand-in-vowels.md#stand-in", summary: "stand-ins (-rl -rm -rth -rn) fill /z/ /d/ /b/ only; there is no stand-in on /ɡ/ /h/ /w/ /th/ (such is whole-stem -r, like that is `hewem blarth`)" },
  standInHost: { anchor: "dependents.md#dependent-clauses", summary: "a hosted stand-in is `blarl` after a listed hinge, a clues / pattern channel, like (`hewem`), or an /h/ hooked join" },
  standInHostUndo: { anchor: "stand-in-vowels.md#stand-in", summary: "burl follows only the so-that hinge thovam or the if hinge thohem" },
  hingeStack: { anchor: "because-and-iff.md#only-because", summary: "hinge stacks are `theboram thurugum` and `hezuvem thadoram`" },
  citationInClause: { anchor: "questions.md#fill-ask", summary: "a word with no role letter fills no slot, so it is never part of a clause; it stands only as a sentence of its own (`azozon.`)" },
  citationTurn: { anchor: "questions.md#fill-ask", summary: "a reply turn of one citation opens with the statement act only (`yal azozon.`)" },
  sameRoleSides: { anchor: "same-role-words.md#before-and-after", summary: "a same-role word goes between two phrases of one role (`zazozon abam zahelan vowurol.`); at the start of a body only with the blank it asks for (`yel abam zar zazozon vowurol.`), and never as glue" },
  sameRoleExtraNoun: { anchor: "same-role-words.md#before-and-after", summary: "a same-role word takes no /b/ after it: B keeps A's /z/, /d/ or /v/; a landmark goes on the /h/ relation with bl- (`habam blohehal`)" },
  sameRoleEnding: { anchor: "same-role-words.md#before-and-after", summary: "a same-role word ends in -m (open) or -l (closed); -n and -r have no reading" },
  citationFragmentOnePhrase: { anchor: "questions.md#fill-ask", summary: "a bare answer or fragment is one noun phrase (`azozon.`, `alon golowon.`); for more, keep the letters (`zazozon zahelan zal.`)" },
  stanceNumber: { anchor: "number-roles.md#number-as-stance-by-marker", summary: "a stance number takes + (likelihood), _ (source) or # (Nth-hand); th- with digits and th#- are not used" },
  handDepth: { anchor: "evidentiality.md#hand-depth", summary: "th#N counts the hands between the event and you, from 2 (th#2 second-hand, a secondary source); first-hand is a channel word" },
  handDepthChannel: { anchor: "evidentiality.md#hand-depth", summary: "th#N counts hands between the event and you, so LIVE and MEMORY (first-hand channels) cannot take it" },
  degreeNumber: { anchor: "number-roles.md#number-as-degree", summary: "a number on /w/ is the how-much blank, barely / almost, or an ordinal place on a scale (wrodol); a factor goes on /h/" },
  degreePlaceShape: { anchor: "comparative-arity.md#place-on-a-scale", summary: "a place on a scale (w#N) needs one name before zol or zuol, then the shared adjective" },
  numberResumeUnbound: { anchor: "number-markers.md#number-endings", summary: "a number -r needs an earlier number to match" },
  tagUnbound: { anchor: "tag-pronouns.md#tag-pronouns", summary: "a tag -r or -m needs that tag assigned earlier in the conversation (`zodozel zwal`, or `zwal` alone); -m also needs an earlier event it took part in (for a pair, one event both took part in)" },
  tagConstantBound: { anchor: "universals-domains.md#bound-tags", summary: "a tag -n after a `zual` / `zuam` / `zul` fence (`zual gogozel zwan`) has no reading: a pseudonym is one real person, a constant, and a tag on such a fence binds each member in turn; use -l (`zual gogozel zwal`)" },
  tagBoundExpired: { anchor: "universals-domains.md#bound-tags", summary: "a tag bound by a `zual` / `zuam` / `zul` fence, or assigned inside its reach, expires at the end of that sentence (plus the sentences its stand-ins point to); a recall after that with no earlier holder is out of scope (`zual gogozel zwal vezuvel. zwar guzemel.`), tags never fall back; keep the recall inside the reach (`… thohem blarl zwar guzemel.`) or tag a plain phrase" },
  tagBoundRebind: { anchor: "universals-domains.md#bound-tags", summary: "a tag bound by a `zual` / `zuam` / `zul` fence is not assigned again while it is live, which would end the variable early; use another tag (`zwol`)" },
  tagNegatedEvery: { anchor: "universals-domains.md#bound-tags", summary: "a tag on the `zul` that denies a `zual` fence (`zual gogozel zul zwal`, not every cat) has no member to name; *some cat A does not …* is `zogozel zwal … vul`" },
  tagNameHeld: { anchor: "tag-pronouns.md#tag-pronouns", summary: "a bare tag -n (`zwan`, and `zwaon`, `zwanx`) introduces a pseudonym on a free tag and recalls one a `zwan` holds, so it cannot stand where a -l assignment holds the tag; to move the tag to a real person, assign with a phrase (`zeyel zwan`), or recall with -r" },
  tagPairMixed: { anchor: "tag-pronouns.md#tag-pairs", summary: "a pair on -n (`zwaon`) introduces two people when both tags are free and recalls two when a `zwan` holds each; with one tag held and one free the listener cannot tell which, so name the new person alone (`zeyel zwon`) and recall the other (`zwan`)" },
  tagSlot: { anchor: "tag-pronouns.md#tag-pronouns", summary: "a tag pronoun fills /z/, /d/, or /b/; to call someone or return to them as the topic, use their name" },
  tagEnding: { anchor: "tag-pronouns.md#tag-pronouns", summary: "a tag pronoun takes -l (assign), -r (recall), -m (share), or -n (a pseudonym)" },
  tagPronoun: { anchor: "tag-pronouns.md#tag-pronouns", summary: "a tag names a phrase that is not already a fixed pronoun: never a special (uwen, awan, ayan), generic, or topic pronoun, or another tag; a resume or role pointer takes one" },
  tagPairAssign: { anchor: "tag-pronouns.md#tag-pairs", summary: "a tag pair never names a phrase: on -r or -m it recalls or shares two tags already assigned (`zwaor`), and on -n it brings in or recalls two pseudonyms (`zwaon`); assign each tag on its own (`zodozel zwal zogozel zwol zam`)" },
  tagPlural: { anchor: "tag-pronouns.md#tag-pronouns", summary: "a tag takes -x only on -r or -n (`zwarx`, `zwanx`, A and associates); to tag a group, tag its plural phrase (`zodozelx zwal`)" },
  joinPlural: { anchor: "joins.md#unspecified-member-r-phrase", summary: "a join takes -x after -r on /z/ /d/ /b/ (`zarx`, some ones), or on /v/ for one shared act (`varx`)" },
  holderSeamSpeaker: { anchor: "holder.md#holder", summary: "the speaker is never a holder: your own view needs no seam (D-68); for exclusive *we*, make the group the subject (`zuwenx thalom`), and name others as holder (`theyomazozonx`)" },
  holderSeamW: { anchor: "holder.md#holder", summary: "a tag is never a holder: the seam letter before `w` would end a syllable mid-word (D-56); for a holder you don't name, name the kind of person (`theyomeyel`)" },
  numberPlural: { anchor: "digit-strings.md#plural-labels", summary: "a number takes -x only as a plural label (z_90x)" },
  resumeUnbound: { anchor: "pronouns.md#resume-r", summary: "an -r resume spells an earlier word's whole stem, or a lexicon stem" },
  pointerSlot: { anchor: "pronouns.md#role-pointers", summary: "a role pointer fills /z/, /d/, or /b/; in a holder seam or a viewpoint lateral, resume the person instead" },
  pointerUnbound: { anchor: "pronouns.md#role-pointers", summary: "a role pointer needs an earlier predicate with that role filled (a: with someone else in it; u: with that role unsaid)" },
  pointerOtherState: { anchor: "role-parts.md#content-of-the-event", summary: "a state pointer takes no other vowel (a): no clause names a resulting state for the other to differ from" },
  pointerOtherExtent: { anchor: "role-parts.md#content-of-the-event", summary: "an extent pointer takes no other vowel (a): no clause names an amount for the other to differ from" },
  pointerShareSelf: { anchor: "pronouns.md#share", summary: "a share (-m) never takes the self vowel (o): it would name a part in the very event being described" },
  pointerSharePlural: { anchor: "pronouns.md#share", summary: "a share (-m) is a part, not a group of people, so it takes no -x" },
  pointerNewUnsaid: { anchor: "pronouns.md#a-new-one", summary: "a new one (-l) needs a filler to copy the kind of; an unsaid pointer (u) has none" },
  pointerNewSpecial: { anchor: "pronouns.md#a-new-one", summary: "a new one (-l) copies a kind; a special, topic, or generic pronoun names a role in the talk, not a kind" },
  topicUnbound: { anchor: "topic.md#topic-pronoun", summary: "the topic pronoun needs a topic set by an /x/ word in the current talk" },
  genericPlural: { anchor: "pronouns.md#generic-pronoun", summary: "the generic pronoun already means people at large, so it takes no -x" },
  retiredSomeone: { anchor: "joins.md#unspecified-member-r-phrase", summary: "-n on the neutral root (umen, zumen) has no reading: someone is zeyel zar, or zwal when you will return to them (D-69)" },
  topicOfTopic: { anchor: "topic.md#topic-pronoun", summary: "the topic pronoun is the topic itself: it is never its own topic word or a resume (`zalen`, never `xalen` or `zaler`)" },
  pointerOwnSlot: { anchor: "pronouns.md#themself", summary: "a self pointer (o) names another slot of its own clause, not the one it fills" },
  clauseSingleItem: { anchor: "joins.md#clause-joins", summary: "a clause join goes between two clauses; to deny or focus one clause, put the join on its verb or noun (vul, zal)" },
  leftFence: { anchor: "joins.md#right-close", summary: "a join word closes its conjuncts; it never comes before them" },
  slotlessHost: { anchor: "measures-and-percent.md#measure-phrases", summary: "a measure amount or an equative's factor takes no bl- word after it; a plain /b/ there is the recipient" },
  joinlessRun: { anchor: "joins.md#right-close", summary: "two nouns of one role side by side, or two verbs in one clause, close with a join word (`zazozon zalazun zal`)" },
  emptyIsland: { anchor: "scope-islands.md#scope-islands", summary: "a scope island needs words between its edges" },
  islandOneSlot: { anchor: "scope-islands.md#scope-islands", summary: "a scope island holds at most one phrase: /z/, /d/, /b/, /v/, or a /ɡ/ stack" },
  islandSlotRole: { anchor: "scope-islands.md#scope-islands", summary: "a scope island needs one /z/, /d/, /b/, /v/, or /ɡ/ phrase after its binder" },
  islandBinder: { anchor: "scope-islands.md#scope-islands", summary: "a scope island needs a binder inside: an /h/ word or a join" },
  landmarkLateralBound: { anchor: "viewpoint.md#landmark-facing", summary: "a landmark lateral (DIR th e) needs its landmark in hosted /b/" },
  asOfIntroduceBound: { anchor: "as-of.md#as-of", summary: "an as-of word introduces its bound with a /b/ word" },
  asOfResumeBound: { anchor: "as-of.md#as-of", summary: "an as-of resume (-r) takes no /b/" },
  hookResumeNoun: { anchor: "in-clause-hooks.md#hook-resume", summary: "a resume hook (-r) points back and takes no noun on its right" },
  asOfPerHost: { anchor: "as-of.md#as-of", summary: "a clause takes at most one /h/ and one /th/ as-of pair" },
  asOfOffset: { anchor: "as-of.md#as-of", summary: "a signed offset in as-of /b/ goes only on stance as-of (/th/); an event or adjective past needs a channel" },
  intentionHost: { anchor: "want-and-decide.md#whose-intention", summary: "WANT and PLAN take no /b/ person and DECISION no /b/ at all: with no holder it is your own; someone else's goes through a holder seam (`theyomazozon thagom`)" },
  retiredIntentionRoot: { anchor: "intention.md#plan", summary: "/h/ on the map or check root is not an intention: PLAN and DECISION are /th/ stances (`thagom`, `thogem`), someone else's through a holder" },
  channelOffsetSign: { anchor: "dated-channel.md#dated-channel", summary: "MEMORY takes only an earlier offset, LIVE none, and PLAN only a later one" },
  retiredPurposeHinge: { anchor: "dependents.md#so-that", summary: "/h/ on the goal root is not the purpose hinge: an aim is in a mind, so so-that is `thovam`, the speaker's aim; someone else's aim goes through a holder" },
  retiredChannelRoot: { anchor: "evidentiality.md#evidentiality", summary: "/th/ on the record or scroll root is not a channel: a record or document is REPORTED with the source in /b/, footage is LIVE or MEMORY with the device in /b/, a schedule is PLAN, and a tale is NOTIONAL" },
  retiredDeonticRoot: { anchor: "permission-consent.md#say-words", summary: "/th/ on the green, no-entry, or memo root is no stance: permission, a ban, and a requirement are say words on /h/ (`hwuvam`, `hwuvul`, `hwuvom`)" },
  sayHost: { anchor: "permission-consent.md#permission", summary: "a bl- word after a say word names someone over the act (v), or the one party under pair reach e; a participant's say needs no bl- word" },
  saySpeaker: { anchor: "permission-consent.md#permission", summary: "a bare v say word on -m is the speaker saying so, so in a statement where the speaker is a participant name whose say it is: the rules (hwuvol), a person (hwuvom bl-), custom (hwuvor), or the speaker's own part (hwuzom)" },
  hingeOffsetWarrant: { anchor: "dated-channel.md#dated-channel", summary: "a signed offset on a time hinge needs a command, request, PLAN, or channel in its clause" },
  joinDetail: { anchor: "list-structure.md#respectively", summary: "the only /w/ before a join word is respectively (`wubam`), and it goes only there, on a closed (-l) or open (-m) and-list" },
  respectivePartner: { anchor: "list-structure.md#respectively", summary: "a respectively list pairs with another and-list of the same length in its clause" },
  wNoHost: {
    anchor: "clause.md#adjective-detail-w",
    summary: "a /w/ word grades the word right after it, such as an adjective; a noun or a verb takes none: describe a noun with /ɡ/ and the action with /h/",
  },
  turnMidSentence: { anchor: "speech-moves.md#turn-y", summary: "a /y/ word starts a turn, before its body; end the sentence before it with a period" },
  islandUnclosed: { anchor: "scope-islands.md#scope-islands", summary: "a scope island opened with { closes with } in the same sentence" },
  islandStrayClose: { anchor: "scope-islands.md#scope-islands", summary: "} closes a scope island, so a { must come before it" },
} satisfies Record<string, ConstructionEntry>;

export type RejectionId = keyof typeof REJECTIONS;
