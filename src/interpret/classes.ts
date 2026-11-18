/**
 * The classification table (docs/meta/interpreter.md#classification-table), one typed const the reader switches on.
 *
 * Frame rows are not copied here: they come from {@link FRAME_KEYS} in `src/parse/scope.ts`, the same rows the resolve
 * stage reads. The other rows are transcribed from the note; `classes.test.ts` checks the note and this table agree,
 * and that every id in `constructionRegistry()` maps to a row (interpreter.md#construction-ids).
 */
import { FRAME_KEYS, type FrameFamily, type FrameReach } from "../parse/scope.js";

/** `frame:<family>`, `detail:<kind>`, `label`, `link`, or `structure`. */
export type ClassName = `frame:${FrameFamily}` | `detail:${string}` | "label" | "link" | "structure";

export type ClassRow = {
  cls: ClassName;
  /** The owning grammar section (`page.md#heading`); empty only for `lexReading:unknown`. */
  anchor: string;
  /** Frame rows only: how far the form reaches; only `clause` forms pair. */
  reach?: FrameReach;
};

/** Rows that are not frames, transcribed from the note. */
const OTHER_ROWS: Record<string, ClassRow> = {
  "unit:np": { cls: "structure", anchor: "clause.md#who-acts-and-the-action" },
  "unit:vp": { cls: "structure", anchor: "clause.md#who-acts-and-the-action" },
  "unit:predicate": { cls: "structure", anchor: "predication.md#identity" },
  "unit:h": { cls: "detail:adverb", anchor: "clause.md#adverbs-h" },
  "unit:linker": { cls: "link", anchor: "sentence-linkers.md#sentence-linkers" },
  "unit:hook": { cls: "structure", anchor: "hooks.md#including-am-al" },
  "unit:island": { cls: "structure", anchor: "scope-islands.md#scope-islands" },
  "unit:clauseCoord": { cls: "structure", anchor: "joins.md#clause-joins" },
  "unit:gCoord": { cls: "structure", anchor: "joins.md#right-close" },
  "hookJob:discourse": { cls: "link", anchor: "hooks.md#discourse-hooks" },
  "hookJob:clause": { cls: "detail:hook", anchor: "in-clause-hooks.md#in-clause" },
  "hookJob:extraNoun": { cls: "detail:place", anchor: "extra-noun-hooks.md#extra-noun-stacked-vowels-and-loose-m" },
  "hookJob:genitive": { cls: "detail:relation", anchor: "social-ties.md#genitive" },
  "hookJob:stray": { cls: "structure", anchor: "social-ties.md#genitive" },
  "hookJob:span": { cls: "detail:range", anchor: "ranges.md#ranges" },
  "hookJob:resume": { cls: "link", anchor: "in-clause-hooks.md#hook-resume" },
  "lexReading:ordinary": { cls: "structure", anchor: "clause.md#who-acts-and-the-action" },
  "lexReading:overlay": { cls: "structure", anchor: "parser-pipeline.md#overlay-kinds" },
  "lexReading:mention": { cls: "structure", anchor: "spans-as-words.md#mention" },
  "lexReading:sameRole": { cls: "detail:time", anchor: "same-role-words.md#before-and-after" },
  "lexReading:join": { cls: "structure", anchor: "joins.md#right-close" },
  "lexReading:standIn": { cls: "link", anchor: "dependents.md#dependent-clauses" },
  "lexReading:standInNamed": { cls: "link", anchor: "stand-in-roles.md#stand-in-roles" },
  "lexReading:standInBack": { cls: "link", anchor: "stand-in-vowels.md#stand-in-back" },
  "lexReading:listVerb": { cls: "structure", anchor: "list-verbs.md#list-verbs" },
  "lexReading:joinRelation": { cls: "detail:relation", anchor: "join-relations.md#join-relations" },
  "lexReading:number": { cls: "structure", anchor: "number-roles.md#number-as-verb-by-marker" },
  "wordFamily:content": { cls: "structure", anchor: "phonology.md#word-edges" },
  "wordFamily:number": { cls: "structure", anchor: "numbers.md#counts" },
  "wordFamily:x": { cls: "structure", anchor: "compounds.md#two-roots-one-word" },
  "wordFamily:hook": { cls: "structure", anchor: "hooks.md#including-am-al" },
  "wordFamily:hookCompound": { cls: "label", anchor: "hook-compounds.md#hook-compounds" },
  "wordFamily:joinMarker": { cls: "structure", anchor: "joins.md#right-close" },
  "wordFamily:writingSpan": { cls: "structure", anchor: "spans.md#writing" },
  "wordFamily:foreign": { cls: "label", anchor: "spans.md#loans" },
  "wordFamily:tag": { cls: "link", anchor: "tag-pronouns.md#tag-pronouns" },
  "xFamily:role": { cls: "label", anchor: "roles.md#role-compounds" },
  "xFamily:pointer": { cls: "link", anchor: "pronouns.md#role-pointers" },
  "xFamily:hookPrefix": { cls: "label", anchor: "hook-compounds.md#hook-prefixes" },
  "xFamily:scope": { cls: "label", anchor: "label-seams.md#reach-vowels" },
  "xFamily:lateral": { cls: "label", anchor: "viewpoint.md#viewpoint-laterals" },
  "xFamily:numeric": { cls: "label", anchor: "numeric-derivation.md" },
  "xFamily:compound": { cls: "label", anchor: "compounds.md#two-roots-one-word" },
  "overlay:identity:g": { cls: "structure", anchor: "predication.md#identity" },
  "overlay:clause_hinge:*:while": { cls: "detail:time", anchor: "dependents.md#hinges" },
  "overlay:clause_hinge:*:until": { cls: "detail:time", anchor: "dependents.md#hinges" },
  "overlay:clause_hinge:*:by": { cls: "detail:time", anchor: "dependents.md#hinges" },
  "overlay:clause_hinge:*:before": { cls: "detail:time", anchor: "dependents.md#hinges" },
  "overlay:clause_hinge:*:after": { cls: "detail:time", anchor: "dependents.md#hinges" },
  "overlay:clause_hinge:*:as-of.ledger": { cls: "detail:time", anchor: "as-of.md#as-of" },
  "overlay:clause_hinge:*:as-of.bookmark": { cls: "detail:time", anchor: "as-of.md#as-of" },
  "overlay:list_verb:v": { cls: "structure", anchor: "list-verbs.md#list-verbs" },
  "overlay:join_relation:g": { cls: "detail:relation", anchor: "join-relations.md#join-relations" },
  "overlay:join_relation:h": { cls: "detail:relation", anchor: "join-relations.md#join-relations" },
  "overlay:locative:h": { cls: "detail:place", anchor: "locative-relations.md#locative-relations" },
  "overlay:locative:g": { cls: "detail:place", anchor: "locative-relations.md#locative-relations" },
  "overlay:likeness:h": { cls: "detail:likeness", anchor: "clause.md#extra-nouns" },
  "overlay:likeness:g": { cls: "detail:likeness", anchor: "relations.md#likeness" },
  "overlay:exchange:h": { cls: "detail:relation", anchor: "relations.md#exchange" },
  "overlay:exchange:g": { cls: "detail:relation", anchor: "relations.md#exchange" },
  "overlay:proxy:h": { cls: "detail:relation", anchor: "relations.md#proxy" },
  "overlay:proxy:g": { cls: "detail:relation", anchor: "relations.md#proxy" },
  "overlay:of_relation:h": { cls: "detail:relation", anchor: "of-relations.md#of-relations" },
  "overlay:of_relation:g": { cls: "detail:relation", anchor: "of-relations.md#of-relations" },
  "overlay:pairing:w": { cls: "link", anchor: "list-structure.md#respectively" },
  "overlay:mention:g": { cls: "structure", anchor: "spans-as-words.md#mention" },
  "overlay:likeness:cite": { cls: "detail:likeness", anchor: "same-role-words.md#same-role-like" },
  "joinSeries:a": { cls: "structure", anchor: "joins.md#and-lists-a" },
  "joinSeries:o": { cls: "structure", anchor: "joins.md#rank-o" },
  "joinSeries:ao": { cls: "structure", anchor: "rank-joins.md#route-ao" },
  "joinSeries:e": { cls: "structure", anchor: "joins.md#choice-e" },
  "joinSeries:ae": { cls: "structure", anchor: "set-joins.md#full-single-item-and-standalone-inventories" },
  "joinSeries:oe": { cls: "structure", anchor: "set-joins.md#full-single-item-and-standalone-inventories" },
  "anaphor:content": { cls: "link", anchor: "pronouns.md#resume-r" },
  "anaphor:number": { cls: "link", anchor: "pronouns.md#resume-r" },
  "anaphor:role": { cls: "link", anchor: "pronouns.md#resume-r" },
  "anaphor:pointer": { cls: "link", anchor: "pronouns.md#role-pointers" },
  "anaphor:tag": { cls: "link", anchor: "tag-pronouns.md#tag-pronouns" },
  "anaphor:topic": { cls: "link", anchor: "topic.md#topic-pronoun" },
  "anaphor:landmark": { cls: "link", anchor: "hooked-joins.md#hooked-joins" },
  "ask:none": { cls: "structure", anchor: "questions.md#question" },
  "answer:answer": { cls: "link", anchor: "questions.md#fill-ask" },
  "shared:distribute": { cls: "link", anchor: "list-structure.md#shared-after-the-join" },
  "shared:collective": { cls: "link", anchor: "collectives.md#verbs-v" },
  "shared:scale": { cls: "link", anchor: "list-structure.md#shared-after-the-join" },
  "shared:equative": { cls: "link", anchor: "list-structure.md#shared-after-the-join" },
  "shared:kind": { cls: "link", anchor: "universals-domains.md#universals-domains-generics" },
  "shared:ordinary": { cls: "link", anchor: "list-structure.md#shared-after-the-join" },
  "ending:l": { cls: "label", anchor: "phonology.md#word-edges" },
  "ending:m": { cls: "label", anchor: "word-endings.md#abstract-m" },
  "ending:n": { cls: "label", anchor: "proper-names.md#name-instance--ln" },
  "ending:ln": { cls: "label", anchor: "proper-names.md#name-instance--ln" },
  "ending:r": { cls: "link", anchor: "pronouns.md#resume-r" },
  "ending:rl": { cls: "link", anchor: "dependents.md#dependent-clauses" },
  "ending:rm": { cls: "link", anchor: "stand-in-vowels.md#stand-in" },
  "ending:rn": { cls: "link", anchor: "stand-in-roles.md#stand-in-roles" },
  "ending:rth": { cls: "link", anchor: "stand-in-vowels.md#stand-in-back" },
  "slot:adj": { cls: "detail:adjective", anchor: "clause.md#adjectives-ɡ" },
  "slot:w": { cls: "detail:degree", anchor: "clause.md#adjective-detail-w" },
  "slot:hosted": { cls: "structure", anchor: "clause.md#extra-nouns" },
  "slot:gl": { cls: "detail:adjective", anchor: "left-bound-adjectives.md#left-bound-adjectives" },
  "slot:asOf": { cls: "detail:time", anchor: "as-of.md#as-of" },
  "slot:grounds": { cls: "link", anchor: "evidentiality.md#evidence-clause" },
  "slot:boundJoin": { cls: "structure", anchor: "joins.md#standalone-phrase" },
  "slot:tag": { cls: "link", anchor: "tag-pronouns.md#tag-pronouns" },
  "slot:dependent": { cls: "structure", anchor: "dependents.md#dependent-clauses" },
  "edge:polar": { cls: "link", anchor: "questions.md#polar-particle" },
  "edge:hook": { cls: "link", anchor: "hooks.md#discourse-hooks" },
  "body:sentence": { cls: "structure", anchor: "clause.md#who-acts-and-the-action" },
  "body:fragment": { cls: "structure", anchor: "spans.md#asides-th" },
  "body:topicMarker": { cls: "link", anchor: "topic.md#topic" },
  "reading:existence": { cls: "structure", anchor: "predication.md#existence" },
  "reading:unsaidEvent": { cls: "structure", anchor: "predication.md#unsaid-event" },
  "reading:kind": { cls: "structure", anchor: "universals-domains.md#kind-reference" },
  "reading:amountScale": { cls: "detail:degree", anchor: "vague-amounts.md" },
  "reading:frequencyScale": { cls: "detail:degree", anchor: "comparative-arity.md#frequency-scale" },
  "reading:verbFirstItem": { cls: "structure", anchor: "verb-and-stance-joins.md#vp-clause-forms" },
  "reading:verbSharedNoun": { cls: "link", anchor: "verb-and-stance-joins.md#vp-clause-forms" },
  "reading:fromTo": { cls: "detail:range", anchor: "ranges.md#ranges" },
  "reading:feelingLandmark": { cls: "structure", anchor: "feelings.md#feeling-whose-stake" },
  "reading:feelingStake": { cls: "structure", anchor: "feelings.md#feeling-whose-stake" },
  "word:plural": { cls: "label", anchor: "plurality.md#associative" },
  "word:hookedJoin": { cls: "detail:bound", anchor: "hooked-joins.md#hooked-joins" },
  "word:rangeMember": { cls: "detail:range", anchor: "ranges.md#ranges" },
};

/** Every key of the classification table, frame rows from scope.ts. */
export const CLASSES: Readonly<Record<string, ClassRow>> = {
  ...OTHER_ROWS,
  ...Object.fromEntries(
    Object.entries(FRAME_KEYS).map(([key, row]) => [key, { cls: `frame:${row.family}` as ClassName, anchor: row.anchor, reach: row.reach }]),
  ),
};

/** The row for a key, if the table has one. */
export function classOf(key: string): ClassRow | undefined {
  return CLASSES[key];
}

// ── Construction ids → table keys (interpreter.md#construction-ids) ─────────

/** Overlay rows a construction id names: `overlay.<senseForm>.<pos>` → its kind, PoS and gloss. */
export type OverlayRef = { senseForm: string; pos: string; kind: string; gloss: string };

/** The overlay key: a gloss override (`clause_hinge:*:while`) where the table has one, else `kind:pos`. */
export function overlayClassKey(overlay: { kind: string; pos: string; gloss: string }): string {
  const override = `overlay:${overlay.kind}:*:${overlay.gloss}`;
  return CLASSES[override] ? override : `overlay:${overlay.kind}:${overlay.pos}`;
}

const SENTENCE: [RegExp, string][] = [
  [/^document\./, "body:sentence"],
  [/^sentence\.(leftEdge|edgeBody|bodyClause)$/, "body:sentence"],
  [/^sentence\.fragment$/, "body:fragment"],
  [/^(leftEdge\.turnWord|turnWord\.(Vocative|gPackage|glAdj|W))$/, "edge:vocative"],
  [/^turnWord\.Interjection$/, "edge:interjection"],
  [/^leftEdge\.Polar$/, "edge:polar"],
  [/^leftEdge\.(W|Hook)$/, "edge:hook"],
  [/^leftEdge\.Force/, "edge:force"],
  [/^bodyClause\.Linker$/, "unit:linker"],
  [/^bodyClause\.topicMarker$/, "body:topicMarker"],
  [/^(bodyClause\.clause|clause\.clauseItem|clauseItem\.unit|unit\.unit)$/, "body:sentence"],
  [/^(clause\.midJoin|clauseItem\.standIn|bodyClause\.crossJoin)$/, "unit:clauseCoord"],
  [/^(unit\.islandUnit|islandUnit\.)/, "unit:island"],
  [/^(unit\.[zdb]Coord|[zdb]Coord\.|[zdb]CoordPart\.npConjunct|npPackage\.[ZDB])$/, "unit:np"],
  [/^(unit\.[zdb]Coord|[zdb]Coord\.[zdb]CoordPart)$/, "unit:np"],
  [/^[zdb]CoordPart\.bar$/, "slot:bar"],
  [/^([zdb]CoordPart\.(npJoinClose|standaloneJoin)|npJoinClose\.(Join[ZDB]|W)|[vg]JoinClose\.(W|Join[VG])|(vpCoordPart|gCoordPart|hCoordPart)\.(vJoinClose|gJoinClose|hJoinClose|standaloneJoin)|hJoinClose\.JoinH)$/, "wordFamily:joinMarker"],
  [/^npJoinClose\.(factor)$/, "shared:scale"],
  [/^sharedAfterJoin\.scale$/, "shared:scale"],
  [/^npJoinClose\.sharedAfterJoin$/, "shared:ordinary"],
  [/^npJoinClose\.joinLandmark$/, "word:hookedJoin"],
  [/^(unit\.vpCoord|vpCoord\.|vpCoordPart\.(V|B|vpItemUnit)|vpItemUnit\.|vJoinClose\.sharedAfterJoin)/, "unit:vp"],
  [/^(unit\.gCoord|gCoord\.|gCoordPart\.gPackage)/, "unit:gCoord"],
  [/^(unit\.hCoord|hCoord\.hCoordPart|hCoordPart\.(hUnitRule|lateBound)|hUnitRule\.H|sharedAfterJoin\.hUnitRule)$/, "unit:h"],
  [/^(hUnitRule|gPackage|turnWord)\.W$/, "slot:w"],
  [/^(hUnitRule|gPackage)\.[BG]$/, "slot:hosted"],
  [/^hUnitRule\.Held$/, "hookJob:zone"],
  [/^hookUnit\.zone$/, "hookJob:zone"],
  [/^(hUnitRule|npPackage)\.Odo$/, "slot:dependent"],
  [/^(hUnitRule|npPackage|gPackage|sharedAfterJoin)\.gPackage$/, "slot:adj"],
  [/^(unit\.hookUnit|hookUnit\.(W|Hook)|npCoordPart\.itemHook(Bound)?)$/, "unit:hook"],
  [/^(unit\.sameRolePair|sameRolePair\.)/, "lexReading:sameRole"],
  [/^npPackage\.WritingSpan$/, "wordFamily:writingSpan"],
  [/^npPackage\.Citation$/, "ending:n"],
  [/^(npCoordPart\.groupTag|npPackage\.tag)$/, "slot:tag"],
  [/^(hUnitRule|gPackage)\.boundJoinTail$|^boundJoinTail\./, "slot:boundJoin"],
  [/^(asOfWPair\.|gPackage\.asOfWPair$)/, "slot:asOf"],
];

const TOKEN: Record<string, string> = {
  hook: "wordFamily:hook",
  writingSpanSlot: "wordFamily:writingSpan",
  writingSpan: "wordFamily:writingSpan",
  standIn: "lexReading:standIn",
  join: "wordFamily:joinMarker",
  listVerb: "lexReading:listVerb",
  joinRelationG: "lexReading:joinRelation",
  joinRelationH: "lexReading:joinRelation",
  greeting: "lexReading:greeting",
  polar: "edge:polar",
  force: "edge:force",
  yVocative: "edge:vocative",
  yInterjection: "edge:interjection",
  linker: "unit:linker",
  clauseAdverb: "overlay:ability:h",
  tagAssign: "wordFamily:tag",
  content: "lexReading:ordinary",
  sameRole: "lexReading:sameRole",
  citationFallback: "lexReading:ordinary",
};

/**
 * The table key a construction id maps to (interpreter.md#construction-ids), or undefined when none does.
 * `overlays` names each overlay id's row (`loadDefaultTables().overlays.values()`).
 */
export function constructionKey(id: string, overlays: Iterable<OverlayRef>): string | undefined {
  const [head, ...rest] = id.split(".");
  const tail = rest.join(".");
  switch (head) {
    case "overlay": {
      for (const o of overlays) if (`overlay.${o.senseForm}.${o.pos}` === id) return overlayClassKey(o);
      return undefined;
    }
    case "sentence":
      return SENTENCE.find(([re]) => re.test(tail))?.[1];
    case "token":
      return TOKEN[tail];
    case "word": {
      if (tail.startsWith("family.")) return `wordFamily:${rest[1]}`;
      if (tail.startsWith("xFamily.")) return `xFamily:${rest[1]}`;
      if (tail.startsWith("reading.")) return `lexReading:${rest[1]}`;
      if (tail.startsWith("ending.")) return `ending:${rest[1]}`;
      if (tail.startsWith("plural.")) return "word:plural";
      if (tail === "gl") return "slot:gl";
      if (tail === "bl") return "slot:hosted";
      if (tail === "hookedJoin") return "word:hookedJoin";
      return undefined;
    }
    case "resolve":
      return `anaphor:${rest[0]}`;
    case "reading":
      return `reading:${tail}`;
    case "tone":
      return "edge:tone";
    case "number":
      return "wordFamily:number";
    case "sake":
      return "lexReading:sake";
    case "scope":
      return "xFamily:scope";
    case "join":
      return tail === "plural" ? "wordFamily:joinMarker" : `joinSeries:${tail}`;
    case "force":
      return "edge:force";
    case "polar":
      return "edge:polar";
    case "restrictor":
      return "lexReading:restrictor";
    case "standIn":
      return "lexReading:standIn";
    case "standInBack":
      return "lexReading:standInBack";
    case "hook":
      return "wordFamily:hook";
    case "rangeMember":
      return "word:rangeMember";
    case "span":
      return "wordFamily:writingSpan";
    case "role":
      return tail === "ability" ? "xFamily:ability" : "xFamily:role";
    case "pointer":
      return "xFamily:pointer";
    default:
      return undefined;
  }
}
