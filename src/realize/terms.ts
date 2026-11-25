/**
 * Terms and their plain details for the realizer (docs/meta/realizer.md#canonical-choices): a `thing`, `speaker`,
 * `listener` or `we` term under a role letter, with its plain adjectives (clause.md#adjectives-ɡ) and their degree
 * words (clause.md#adjective-detail-w); a plain adverb (clause.md#adverbs-h). Each part is a morph-gloss piece; a part
 * with no rule yet throws a {@link Unrealized}.
 */
import type { ClassifyTables } from "../parse/classify.js";
import { CLOSED } from "../closed-roots.js";
import type { MeaningDetail, MeaningTerm } from "./meaning.js";
import { hNumberLeaf, numberDetailLeaf, numberTermLeaf, resumedNumberLabel, sharedNumberLeaf } from "./numbers.js";
import { leaf, rootOf, type Ending } from "./words.js";
import type { GapKind } from "./realize.js";
import { listGloss, type ListStyle, type ListWriters, type MemberWriter } from "./lists.js";

/** Lists written with a join that has no items as the standalone join (joins.md#standalone-phrase). */
const STANDALONE: ListStyle = { standalone: true };

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
  if (term.stem.length > 1 && term.stem.every((part) => part.length === 1)) return compoundLeaf(term, pos, ending, tables);
  return leafOf(pos, oneRoot(term, tables), ending, tables);
}

/**
 * A two-root compound (compounds.md § Two roots, one word: `zuwedaxubudal`, *peanut butter*): each part's root by its sense, joined
 * at the mid-word `x`, the last part a kind of the first, on the word's one ending.
 */
function compoundLeaf(term: Extract<MeaningTerm, { kind: "thing" }>, pos: string, ending: Ending, tables: ClassifyTables): string {
  const roots = term.stem.map((part) => rootOf(part[0]!, tables));
  if (roots.some((root) => !root)) throw new Unrealized("missingValue", "a compound part with no root");
  const labels = roots.map((root) => leafOf(pos, root!, "l", tables).slice(pos.length + 1));
  const last = leafOf(pos, roots.at(-1)!, ending, tables).slice(pos.length + 1);
  if (!last.startsWith(labels.at(-1)!)) throw noRule("a compound whose last part's ending changes its label");
  return `${pos}-${labels.join("-x-")}${last.slice(labels.at(-1)!.length)}`;
}

/** A plain content word's detail (`slot:adj`, `unit:h`, `slot:w`) as one leaf under `pos`, its degree words before it. */
export function plainWord(detail: MeaningDetail, pos: string, root: string | undefined, tables: ClassifyTables): string {
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
  // A number adverb (number-roles.md#number-as-adverb-by-marker: `hragel`, *three times*).
  if (detail.key === "lexReading:number") return hNumberLeaf(detail);
  if (detail.key !== "unit:h") throw noRule(`claim detail ${detail.key}`);
  return plainWord(detail, "h", detail.values.root, tables);
}

/** A term's plain adjectives, each with its degree words, after the head (clause.md#adjectives-ɡ). */
function adjectives(details: readonly MeaningDetail[] | undefined, tables: ClassifyTables): string[] {
  return (details ?? []).map((detail) => {
    // A count or rank sits with the adjectives (numbers.md#counts).
    if (detail.key === "lexReading:number") return numberDetailLeaf(detail);
    if (detail.key !== "slot:adj") throw noRule(`term detail ${detail.key}`);
    return plainWord(detail, "g", detail.values.root, tables);
  });
}

/**
 * A list's writers (lists.ts): its members by `member`; a SHARED word on its own letter, an `/h/` adverb or a `/ɡ/`
 * word (list-structure.md#shared-after-the-join); a hooked join's landmark as a `b` term on `bl-`, the letter of a
 * word that completes the one before it (hooked-joins.md#hooked-joins).
 */
function listWriters(member: MemberWriter, tables: ClassifyTables, style: ListStyle): ListWriters {
  return {
    member,
    // A vague amount on a scale (vague-amounts.md: `zol gral`, *more*) is a number word; a factor on the scale word
    // (comparative-arity.md#factor) is an `/h/` number right after it.
    shared: (detail) => {
      if (detail.key === "lexReading:number") return sharedNumberLeaf(detail);
      const factors = (detail.details ?? []).filter((d) => d.kind === "amount" && d.key === "lexReading:number");
      const word = factors.length ? { ...detail, details: detail.details!.filter((d) => !factors.includes(d)) } : detail;
      return [plainWord(word, detail.key === "unit:h" ? "h" : "g", detail.values.root, tables), ...factors.map(hNumberLeaf)].join(" | ");
    },
    landmark: (term) => roleTerm(term, "b", undefined, tables, style).replace(/^(\[?)b-/, "$1bl-"),
  };
}

/**
 * A rank fence's bar (bars.md#bars): the `/th/` stance word or `/h/` intention adverb that stands where the second name
 * would go, on the ending its `slot:bar` frame records. The frame's gloss names the stance; its word is whichever of the
 * two letters the gloss index has a form of that gloss for. A bar that hosts a `/b/` party or holds a frame is a gap.
 */
function barLeaf(term: Extract<MeaningTerm, { kind: "thing" }>, tables: ClassifyTables): string | undefined {
  const [frame, ...rest] = term.frames ?? [];
  if (frame?.key !== "slot:bar" || rest.length) return undefined;
  if (frame.hosted || frame.party || frame.content || frame.inner?.length || frame.details?.length || term.details.length) {
    throw noRule("a bar with a hosted party or its own detail");
  }
  const { gloss, ending } = frame.values;
  if (!isEnding(ending)) throw new Unrealized("missingValue", "a bar with no ending in the view");
  const root = oneRoot(term, tables);
  // An ability or say adverb's frame has no host-row gloss; its root alone picks the form.
  const found = ["th", "h"].map((pos) => leaf(pos, root, ending, tables)).filter((l): l is string => !!l && (!gloss || l.slice(l.indexOf("-") + 1).startsWith(gloss)));
  if (found.length !== 1) throw noRule(`a bar that is a built word (${gloss ?? root} on -${ending})`);
  return found[0];
}

/** A term in a role (`z`, `d`, `b`): its head, then its adjectives, as one unit. */
export function roleTerm(term: MeaningTerm, pos: "z" | "d" | "b", ending: Ending | undefined, tables: ClassifyTables, style: ListStyle = STANDALONE): string {
  const bar = term.kind === "thing" ? barLeaf(term, tables) : undefined;
  if (bar) return bar;
  if (term.kind !== "list" && "frames" in term && term.frames?.length) throw noRule(`a ${term.kind} term with its own frame`);
  switch (term.kind) {
    case "list":
      return listGloss(term, pos, ending, listWriters((m, own) => roleTerm(m, pos, own, tables, style), tables, style), style);
    case "thing":
      return unit([thingLeaf(term, pos, ending, tables), ...adjectives(term.details, tables)]);
    case "speaker":
    case "listener":
    case "we":
      return unit([leafOf(pos, SPECIAL_ROOT[term.kind], "n", tables), ...adjectives(term.details, tables)]);
    case "pronoun":
      return unit([pronounLeaf(term, pos, ending, tables), ...adjectives(term.details, tables)]);
    case "number":
      return unit([numberTermLeaf(term, pos), ...adjectives(term.details, tables)]);
    default:
      throw noRule(`a ${term.kind} term`);
  }
}

type Thing = Extract<MeaningTerm, { kind: "thing" }>;

type Resumable = Thing | { kind: keyof typeof SPECIAL_ROOT };

/** The one a `-r` pronoun names, through a chain of plain `-r` resumes and pointers, when it is a thing or a special. */
function referent(term: MeaningTerm): Resumable | undefined {
  if (term.kind === "thing" || term.kind === "speaker" || term.kind === "listener" || term.kind === "we") return term as Resumable;
  const plain = term.kind === "pronoun" && term.values?.ending === "r" && !term.values.sense && term.bind !== "role" && term.bind !== "tag";
  return plain && term.antecedent ? referent(term.antecedent) : undefined;
}

/** A role pointer's part consonant and pointer vowel, as the glosser labels them (pronouns.md#role-pointers). */
const POINTER_PART: Record<string, string> = { z: "agent", d: "patient", b: "recipient" };
const POINTER_VOWEL: Record<string, string> = { e: "same", a: "other", o: "self", u: "unsaid" };

/** A role pointer on **-r** (`zwuzer`, *the latest doer*): this episode's part, how far back, as the reader records them. */
function pointerLeaf(values: Record<string, string>, pos: string): string {
  const part = POINTER_PART[values.part ?? ""];
  const reach = POINTER_VOWEL[values.pointer ?? ""];
  if (!part || !reach) throw new Unrealized("missingValue", "a role pointer with no part or pointer vowel in the view");
  return `${pos}-←episode-${part}.${reach}`;
}

/** A role compound's reach vowel, as the glosser labels it (role-parts.md#reach). */
const ROLE_REACH: Record<string, string> = {
  a: "type",
  e: "pair",
  o: "role",
  u: "episode",
  ae: "situation",
  ao: "using",
  oe: "toward-role",
  ua: "except-episode",
  ue: "except-pair",
  uo: "outside-role",
};

/**
 * A role compound on **-r** (roles.md#role-compounds: `zwuzeduyor`, *the one teaching*): the party its part names, in
 * the capacity its reach vowel says, of the event it resumes, which is the verb it names.
 */
function roleResumeLeaf(term: Extract<MeaningTerm, { kind: "pronoun" }>, values: Record<string, string>, pos: string, tables: ClassifyTables): string {
  const part = POINTER_PART[values.part ?? ""];
  const reach = ROLE_REACH[values.reach ?? ""];
  if (!part || !reach) throw new Unrealized("missingValue", "a role compound with no part or reach vowel in the view");
  if (values.ending !== "r") throw noRule(`a role compound on -${values.ending ?? "?"}`);
  const event = term.antecedent;
  if (event?.kind !== "thing" || event.named || event.details.length || event.frames?.length) throw noRule("a role compound after an event that is not a plain verb");
  const verb = thingLeaf(event, "v", "l", tables);
  return `${pos}-←${reach}-${part}-${verb.slice(verb.indexOf("-") + 1)}`;
}

/**
 * A pronoun's head word under `pos`: the generic (pronouns.md#generic-pronoun) and the topic pronoun
 * (topic.md#topic-pronoun) by their roots on **-n**; a bound `-r` pronoun, resume or role pointer, as the resume of
 * the thing it names (pronouns.md#resume-r); a new one on **-l** as the noun it copies, written out on `ending`
 * (pronouns.md#a-new-one).
 */
function pronounLeaf(term: Extract<MeaningTerm, { kind: "pronoun" }>, pos: string, ending: Ending | undefined, tables: ClassifyTables): string {
  if (term.sort === "generic") return leafOf(pos, CLOSED.person, "n", tables);
  if (term.sort === "topic") return leafOf(pos, CLOSED.star, "n", tables);
  const values = term.values ?? {};
  if (!term.antecedent) throw noRule("a pronoun with no antecedent");
  if (term.bind === "role") return roleResumeLeaf(term, values, pos, tables);
  if (term.bind === "tag") throw noRule(`a ${term.bind} pronoun`);
  if (values.sense) throw noRule("a resume pinned to a sense");
  if (values.ending === "l") {
    const copied = term.antecedent;
    if (copied.kind !== "thing" || copied.named) throw noRule(`a new one after a ${copied.kind === "thing" ? "name" : `${copied.kind} term`}`);
    return thingLeaf(copied, pos, ending, tables);
  }
  if (values.ending !== "r") throw noRule(`a pronoun on -${values.ending ?? "?"}`);
  // A number resumed on -r glosses as `←` and the number's label (number-markers.md#number-endings). It parses only
  // after the number it resumes, so it spells only in a line that holds that number.
  if (term.antecedent.kind === "number") return `${pos}-←${resumedNumberLabel(term.antecedent)}`;
  const thing = referent(term.antecedent);
  // A list has no resume (joins.md#and-lists-a): "A role pointer back to that role picks up the whole group."
  if (!thing && term.antecedent.kind === "list" && term.bind === "pointer") return pointerLeaf(values, pos);
  if (!thing) throw noRule(`a resume of a ${term.antecedent.kind} term`);
  // A resume glosses as `←` and the label of the word it resumes (glosses.md#round-trip).
  const named =
    thing.kind === "thing" ? thingLeaf(thing, pos, thing.named ? undefined : "l", tables) : leafOf(pos, SPECIAL_ROOT[thing.kind], "n", tables);
  return `${pos}-←${named.slice(named.indexOf("-") + 1)}`;
}

/** The verb: a thing on `/v/`, named or on **-l**, with no frame or detail of its own. */
export function verbTerm(term: MeaningTerm, tables: ClassifyTables, style: ListStyle = STANDALONE): string {
  // A verb list (joins.md#and-lists-a): each verb, then the `/v/` join.
  if (term.kind === "list") return listGloss(term, "v", undefined, listWriters((m) => verbTerm(m, tables), tables, style), { ...style, standalone: true });
  if (term.kind !== "thing") throw noRule(`a ${term.kind} verb`);
  if (term.frames?.length || term.details.length) throw noRule("a verb with its own frame or detail");
  return thingLeaf(term, "v", "l", tables);
}

/**
 * A predicate adjective (predication.md#classification-property): a thing whose one detail is the `/ɡ/` word itself,
 * which holds its ending and degree words.
 */
export function predicateTerm(term: MeaningTerm, tables: ClassifyTables, style: ListStyle = STANDALONE): string {
  // A predicate list (joins.md#negation-u: `gamahum gul`): each predicate word, then the `/ɡ/` join.
  if (term.kind === "list") return listGloss(term, "g", undefined, listWriters((m) => predicateTerm(m, tables), tables, style), { ...style, standalone: true });
  if (term.kind !== "thing" || term.frames?.length) throw noRule(`a ${term.kind} predicate`);
  const [self, ...rest] = term.details;
  // A number predicate (numbers.md#counts: *there are three cats*): the number word is its own detail.
  if (self?.key === "lexReading:number" && !rest.length) return numberDetailLeaf(self);
  if (term.named) throw noRule("a thing predicate");
  if (!self || rest.length || self.key !== "slot:adj") throw noRule("a predicate that is not one plain adjective");
  // A built word (a hook compound, a role word, a label seam) has no plain root on its detail: word-building, phase 2.
  const root = oneRoot(term, tables);
  if (self.values.root !== root) throw noRule("a predicate that is a built word");
  return plainWord(self, "g", root, tables);
}
