/**
 * Terms and their plain details for the realizer (docs/meta/realizer.md#canonical-choices): a `thing`, `speaker`,
 * `listener` or `we` term under a role letter, with its plain adjectives (clause.md#adjectives-ɡ) and their degree
 * words (clause.md#adjective-detail-w); a plain adverb (clause.md#adverbs-h). Each part is a morph-gloss piece; a part
 * with no rule yet throws a {@link Unrealized}.
 */
import type { ClassifyTables } from "../parse/classify.js";
import { CLOSED } from "../closed-roots.js";
import type { MeaningDetail, MeaningTerm } from "./meaning.js";
import { leaf, rootOf, type Ending } from "./words.js";
import type { GapKind } from "./realize.js";

/** A part the realizer cannot write yet: why, and what. The caller files it under the reading's key. */
export class Unrealized extends Error {
  constructor(
    readonly kind: GapKind,
    detail: string,
  ) {
    super(detail);
  }
}

const noRule = (detail: string): Unrealized => new Unrealized("noRule", detail);

/** The discourse specials by term kind (speech-roles: the microphone, headphones and handshake roots on **-n**). */
const SPECIAL_ROOT = { speaker: CLOSED.microphone, listener: CLOSED.headphones, we: CLOSED.handshake } as const;

const isEnding = (value: string | undefined): value is Ending => value === "l" || value === "m" || value === "n";

/** A morph-gloss unit: one piece alone, several in brackets (glosses.md#phrase-brackets). */
const unit = (pieces: string[]): string => (pieces.length === 1 ? pieces[0]! : `[${pieces.join(" | ")}]`);

/** The leaf for a root, or a `noSpell` part when the gloss index has no such form. */
function leafOf(pos: string, root: string, ending: Ending, tables: ClassifyTables): string {
  const out = leaf(pos, root, ending, tables);
  if (!out) throw new Unrealized("noSpell", `no ${pos} form of ${root} on -${ending}`);
  return out;
}

/** A thing's one root, as a root spelling; a stem of several roots or parts is word-building (phase 2). */
function oneRoot(term: Extract<MeaningTerm, { kind: "thing" }>, tables: ClassifyTables): string {
  const [part, ...rest] = term.stem;
  if (!part || rest.length || part.length !== 1) throw noRule("a stem of several roots");
  const root = rootOf(part[0]!, tables);
  if (!root) throw new Unrealized("missingValue", `no root for ${JSON.stringify(part[0])}`);
  return root;
}

/**
 * A thing's head word under `pos`. A name is its own root on **-n** (proper-names.md#proper-name-n); an unnamed thing
 * takes `ending`, which the caller knows from the term's new-member frame (word-endings.md).
 */
export function thingLeaf(term: Extract<MeaningTerm, { kind: "thing" }>, pos: string, ending: Ending | undefined, tables: ClassifyTables): string {
  if (term.named) {
    if (!term.name || term.stem.length !== 1) throw noRule("a name of several parts");
    const named = leaf(pos, term.name, "n", tables);
    if (named) return named;
    // A name with no lexicon row: its gloss is the name itself (glosses.md#word-shape).
    return `${pos}-${term.name.charAt(0).toUpperCase()}${term.name.slice(1)}n`;
  }
  if (!ending) throw new Unrealized("missingValue", "an unnamed thing with no ending in the view");
  return leafOf(pos, oneRoot(term, tables), ending, tables);
}

/** A plain content word's detail (`slot:adj`, `unit:h`, `slot:w`) as one leaf under `pos`, its degree words before it. */
function plainWord(detail: MeaningDetail, pos: string, root: string | undefined, tables: ClassifyTables): string {
  const ending = detail.values.ending;
  if (!root || !isEnding(ending) || ending === "n") throw noRule(`${detail.key} that is not a plain content word`);
  if (detail.content || detail.hosted || detail.frames?.length) throw noRule(`${detail.key} with a hosted word or frame`);
  const degrees = (detail.details ?? []).map((d) => {
    if (d.key !== "slot:w") throw noRule(`${d.key} on ${detail.key}`);
    if (d.details?.length) throw noRule(`a degree word with its own detail`);
    return plainWord(d, "w", d.values.root, tables);
  });
  return unit([...degrees, leafOf(pos, root, ending, tables)]);
}

/** A plain adverb (`unit:h`) with its degree words. */
export function adverb(detail: MeaningDetail, tables: ClassifyTables): string {
  if (detail.key !== "unit:h") throw noRule(`claim detail ${detail.key}`);
  return plainWord(detail, "h", detail.values.root, tables);
}

/** A term's plain adjectives, each with its degree words, after the head (clause.md#adjectives-ɡ). */
function adjectives(details: readonly MeaningDetail[] | undefined, tables: ClassifyTables): string[] {
  return (details ?? []).map((detail) => {
    if (detail.key !== "slot:adj") throw noRule(`term detail ${detail.key}`);
    return plainWord(detail, "g", detail.values.root, tables);
  });
}

/** A term in a role (`z`, `d`, `b`): its head, then its adjectives, as one unit. */
export function roleTerm(term: MeaningTerm, pos: "z" | "d" | "b", ending: Ending | undefined, tables: ClassifyTables): string {
  if ("frames" in term && term.frames?.length) throw noRule(`a ${term.kind} term with its own frame`);
  switch (term.kind) {
    case "thing":
      return unit([thingLeaf(term, pos, ending, tables), ...adjectives(term.details, tables)]);
    case "speaker":
    case "listener":
    case "we":
      return unit([leafOf(pos, SPECIAL_ROOT[term.kind], "n", tables), ...adjectives(term.details, tables)]);
    default:
      throw noRule(`a ${term.kind} term`);
  }
}

/** The verb: a thing on `/v/`, named or on **-l**, with no frame or detail of its own. */
export function verbTerm(term: MeaningTerm, tables: ClassifyTables): string {
  if (term.kind !== "thing") throw noRule(`a ${term.kind} verb`);
  if (term.frames?.length || term.details.length) throw noRule("a verb with its own frame or detail");
  return thingLeaf(term, "v", "l", tables);
}

/**
 * A predicate adjective (predication.md#classification-property): a thing whose one detail is the `/ɡ/` word itself,
 * which holds its ending and degree words.
 */
export function predicateTerm(term: MeaningTerm, tables: ClassifyTables): string {
  if (term.kind !== "thing" || term.named || term.frames?.length) throw noRule(`a ${term.kind} predicate`);
  const [self, ...rest] = term.details;
  if (!self || rest.length || self.key !== "slot:adj") throw noRule("a predicate that is not one plain adjective");
  // A built word (a hook compound, a role word, a label seam) has no plain root on its detail: word-building, phase 2.
  const root = oneRoot(term, tables);
  if (self.values.root !== root) throw noRule("a predicate that is a built word");
  return plainWord(self, "g", root, tables);
}
