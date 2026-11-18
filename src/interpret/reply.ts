/**
 * Replies (the interpreter plan's replies section): every line the interpreter says starts as a morph-gloss `Draft`, is
 * spelled by gloss-inverse, and is parsed; a draft that does not parse to one tree is dropped, so the interpreter never
 * shows an unparsed line. Code never spells a root: a shape writes series glosses, or leaves glossed from a parsed word.
 *
 * Shared shapes: yes, no, cannot say, a fill answer as a fragment and as a full clause, *which one?*, and *why* (the
 * readings that decided, by id; it carries no line).
 */
import { CLOSED, namedEnglish } from "../closed-roots.js";
import type { ClassifyTables } from "../parse/classify.js";
import { buildGlossIndex, glossToAgeben, type GlossIndex } from "../parse/gloss-inverse.js";
import { morphGlossFor, morphGlossLine } from "../parse/morph-gloss.js";
import { parseWithTables } from "../parse/parse-core.js";
import { throughAntecedent } from "./match.js";
import type { BlankSite } from "./host.js";
import type { Term } from "./types.js";

/** A line before it is spelled: morph gloss and its English. */
export type Draft = { gloss: string; english: string };

export type ReplyShape = "yes" | "no" | "cannotSay" | "fillFragment" | "fillClause" | "whichOne" | "why" | "handler";

/** A line the interpreter shows: spelled and parsed. A *why* reply carries `because` and no line. */
export type Reply = { shape: ReplyShape; english: string; ageben?: string; gloss?: string; because?: string[] };

const indexes = new WeakMap<ClassifyTables, GlossIndex>();

function indexFor(tables: ClassifyTables): GlossIndex {
  let index = indexes.get(tables);
  if (!index) indexes.set(tables, (index = buildGlossIndex(tables)));
  return index;
}

/** Spell a draft and parse it; undefined unless it reads as one tree. */
export function spell(draft: Draft, tables: ClassifyTables): string | undefined {
  let ageben: string;
  try {
    ageben = glossToAgeben(draft.gloss, tables, indexFor(tables));
  } catch {
    return undefined;
  }
  if (!/[.?!]$/.test(ageben)) ageben += ".";
  try {
    const result = parseWithTables(ageben, tables, { checkAmbiguity: true });
    return result.ambiguity?.length ? undefined : ageben;
  } catch {
    return undefined;
  }
}

/** The first draft that spells and parses, as a reply of the given shape. */
export function firstReply(shape: ReplyShape, drafts: readonly Draft[], tables: ClassifyTables): Reply | undefined {
  for (const draft of drafts) {
    const ageben = spell(draft, tables);
    if (ageben) return { shape, english: draft.english, ageben, gloss: draft.gloss };
  }
  return undefined;
}

// ── Shapes ──────────────────────────────────────────────────────────────────

export const yesDraft = (): Draft => ({ gloss: "y-yes", english: "Yes." });
export const noDraft = (): Draft => ({ gloss: "y-no", english: "No." });

/** *I don't know* (evidentiality.md#source): the speaker pronoun, knowledge, denied. */
export function cannotSayDraft(tables: ClassifyTables): Draft {
  return { gloss: `${leafOf(`z${CLOSED.microphone}n`, tables)} | [v-knowledge | v-not]`, english: "I can't say." };
}

/** *Which one?*: a fill-ask blank in the role the ambiguous term fills (fill-ask-roles.md#who-which-and-any). */
export function whichOneDraft(role: "z" | "d" | "b"): Draft {
  return { gloss: `y-question | ${role}-wh`, english: "Which one?" };
}

/** A *why* reply: the readings (and held state) that decided, by id. */
export function whyReply(because: readonly string[]): Reply {
  return { shape: "why", english: `Because of ${because.join(", ") || "nothing said"}.`, because: [...because] };
}

/** The morph gloss of one surface word. */
function leafOf(surface: string, tables: ClassifyTables): string {
  return morphGlossLine(surface, tables).replace(/\.$/, "").trim();
}

/** A where blank in the question's line: its hook's leaf, and which `[<hook> | b-wh]` group of the line it is. */
export type PlaceBlank = { hook: string; nth: number };

const PLACE_GROUP = /\[([^[\]|]+) \| b-wh\]/g;

/**
 * Find a where blank (a blank hosted in a detail, from `blankSites`) in the question's line: the claim's `nth` hosted
 * detail blank is the line's `nth` `[<hook> | b-wh]` group. Undefined for a role blank, or when the counts differ.
 */
export function placeBlank(questionText: string, site: BlankSite, sites: readonly BlankSite[], tables: ClassifyTables): PlaceBlank | undefined {
  if (!site.detail || !site.at.endsWith("/hosted")) return undefined;
  let gloss: string;
  try {
    gloss = morphGlossLine(questionText, tables);
  } catch {
    return undefined;
  }
  const groups = [...gloss.matchAll(PLACE_GROUP)];
  const places = sites.filter((s) => s.detail && s.at.endsWith("/hosted"));
  const nth = places.indexOf(site);
  if (groups.length !== places.length || nth < 0) return undefined;
  return { hook: groups[nth]![1]!.trim(), nth };
}

/**
 * A where answer: the question's own hook and the landmark, `[<hook> | b-<landmark>]` (the game's place fragment). A
 * leaf that is already a bracket stays as it is.
 */
function placeLeaf(landmark: { leaf: string; english: string }, place: PlaceBlank): { leaf: string; english: string } {
  if (landmark.leaf.startsWith("[")) return landmark;
  return { leaf: `[${place.hook} | ${landmark.leaf.replace(/^[a-z]+-/, "b-")}]`, english: `${place.hook} ${landmark.english}` };
}

/**
 * An answer term as a leaf in role `at`, with its English; a pronoun answers with its antecedent. A where blank
 * (`place`) answers with the question's hook and the term as its landmark.
 */
export function answerLeaf(term: Term, at: string, tables: ClassifyTables, place?: PlaceBlank): { leaf: string; english: string } | undefined {
  const t = throughAntecedent(term);
  if (t.kind !== "thing" && t.kind !== "speaker" && t.kind !== "listener") return undefined;
  const word = t.kind === "thing" ? t.head : t.word;
  const leaf = morphGlossFor(word, tables).replace(/^[zdb]-/, `${place ? "b" : at}-`);
  const english = t.kind === "speaker" ? "me" : t.kind === "listener" ? "you" : t.kind === "thing" && t.named ? namedEnglish(t.root) : leaf.replace(/^[a-z]+-[←]?/, "");
  return place ? placeLeaf({ leaf, english }, place) : { leaf, english };
}

/** A held answer for a blank: a where blank's leaf may name the landmark alone (`b-house`); it takes the question's hook. */
export function heldLeaf(answer: { leaf: string; english: string }, place?: PlaceBlank): { leaf: string; english: string } {
  return place ? placeLeaf(answer, place) : answer;
}

/** A fill answer as a fragment: the answer word alone. */
export function fillFragmentDrafts(answers: readonly { leaf: string; english: string }[]): Draft[] {
  if (answers.length === 0) return [];
  if (answers.length === 1) return [{ gloss: answers[0]!.leaf, english: `${answers[0]!.english}.` }];
  const role = answers[0]!.leaf.slice(0, answers[0]!.leaf.indexOf("-"));
  return [{ gloss: `[${answers.map((a) => a.leaf).join(" | ")} | ${role}-and]`, english: `${answers.map((a) => a.english).join(" and ")}.` }];
}

/**
 * A fill answer as a full clause: the question's own gloss with its act word dropped and its blank leaf replaced by
 * the answer. A where blank (`place`) is its `[<hook> | b-wh]` group, replaced by the answer's group. Undefined when the
 * question's gloss has no such blank.
 */
export function fillClauseDraft(
  questionText: string,
  blankAt: string,
  answer: { leaf: string; english: string },
  tables: ClassifyTables,
  place?: PlaceBlank,
): Draft | undefined {
  let gloss: string;
  try {
    gloss = morphGlossLine(questionText, tables).replace(/[.?!]\s*$/, "");
  } catch {
    return undefined;
  }
  if (place) {
    const group = [...gloss.matchAll(PLACE_GROUP)][place.nth];
    if (!group || !answer.leaf.startsWith("[")) return undefined;
    const replaced = gloss.slice(0, group.index) + answer.leaf + gloss.slice(group.index + group[0].length);
    const body = replaced.split(" | ").filter((l) => !/^y-(question|soft-question|working-question)$/.test(l));
    return { gloss: body.join(" | "), english: `${answer.english}.` };
  }
  const leaves = gloss.split(" | ");
  const at = leaves.findIndex((l) => l.replace(/^\[/, "").replace(/\]$/, "") === `${blankAt}-wh`);
  if (at < 0) return undefined;
  leaves[at] = leaves[at]!.replace(`${blankAt}-wh`, answer.leaf);
  const body = leaves.filter((l) => !/^y-(question|soft-question|working-question)$/.test(l));
  return { gloss: body.join(" | "), english: `${answer.english}.` };
}
