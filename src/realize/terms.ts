/**
 * Terms and their plain details for the realizer (docs/meta/realizer.md#canonical-choices): a `thing`, `speaker`,
 * `listener` or `we` term under a role letter, with its plain adjectives (clause.md#adjectives-ɡ) and their degree
 * words (clause.md#adjective-detail-w); a plain adverb (clause.md#adverbs-h). Each part is a morph-gloss piece; a part
 * with no rule yet throws a {@link Unrealized}.
 */
import type { ClassifyTables } from "../parse/classify.js";
import { CLOSED } from "../closed-roots.js";
import { fillAskGloss } from "../parse/gloss-inverse.js";
import type { MeaningDetail, MeaningFrame, MeaningTerm } from "./meaning.js";
import { fractionLeaf, hNumberLeaf, isPlainCount, measureLeaf, numberDetailLeaf, numberTermLeaf, resumedNumberLabel, sharedNumberLeaf } from "./numbers.js";
import { leaf, listedLeaf, rootOf, type Ending } from "./words.js";
import { builtLeaf, ROLE_REACH } from "./built.js";
import { hookFront, joinLeaf, listGloss, type ListStyle, type ListWriters, type MemberWriter } from "./lists.js";
import { tagLabel } from "./tags.js";
import { attempt, PLACEHOLDER, skip, Unrealized } from "./gaps.js";

/** Lists written with a join that has no items as the standalone join (joins.md#standalone-phrase). */
const STANDALONE: ListStyle = { standalone: true };

const noRule = (detail: string): Unrealized => new Unrealized("noRule", detail);

// ── Tone marks ──

/** A tone mark (tone-marks.md#showing-your-tone): a frame the reader copies onto the words it colors, not their own part. */
export function toneOf(frame: MeaningFrame): { mark: string; scope: "word" | "rest" } | undefined {
  if (frame.key !== "edge:tone") return undefined;
  const { mark, names, scope, ...rest } = frame.values;
  void names;
  if (!mark || (scope !== "word" && scope !== "rest") || Object.keys(rest).length || frame.party || frame.content || frame.hosted || frame.inner?.length || frame.details?.length) {
    throw noRule("a tone mark with its own parts");
  }
  return { mark, scope };
}

/** A term's or frame's own frames: all but its tone marks. */
export const ownFrames = (frames: readonly MeaningFrame[] | undefined): MeaningFrame[] => (frames ?? []).filter((frame) => !toneOf(frame));

/** The one tone mark of a scope among `frames`, if any; two of one scope are a gap. */
export function toneMark(frames: readonly MeaningFrame[] | undefined, scope: "word" | "rest"): string | undefined {
  const marks = (frames ?? []).map(toneOf).filter((tone) => tone?.scope === scope);
  if (marks.length > 1) throw noRule(`two ${scope} tone marks on one word`);
  return marks[0]?.mark;
}

/**
 * A word-scope mark written in front of its word (tone-marks.md#showing-your-tone: `?z-wh`), inside the unit's bracket
 * when the word heads one (`[?d-dog | g-big]`).
 */
export function marked(frames: readonly MeaningFrame[] | undefined, gloss: string): string {
  const mark = toneMark(frames, "word");
  if (!mark) return gloss;
  const at = gloss.search(/[^[]/);
  return `${gloss.slice(0, at)}${mark}${gloss.slice(at)}`;
}

// ── Terms ──

/** The discourse specials by term kind (speech-roles: the microphone, headphones and handshake roots on **-n**). */
const SPECIAL_ROOT = { speaker: CLOSED.microphone, listener: CLOSED.headphones, we: CLOSED.handshake } as const;

const isEnding = (value: string | undefined): value is Ending => value === "l" || value === "m" || value === "n";

/** A morph-gloss unit: one piece alone, several in brackets (glosses.md#phrase-brackets). */
export const unit = (pieces: string[]): string => (pieces.length === 1 ? pieces[0]! : `[${pieces.join(" | ")}]`);

/** A word's leaf with its own plural `-x`, which glosses as `-x` after the label (plurality.md#associative). */
export const withPlural = (gloss: string, values: Record<string, string> | undefined): string => (values?.plural ? `${gloss}-x` : gloss);

/** A bare citation's leaf, with no role letter (word-endings.md#citation-forms: `azozol`, glossed `swan`). */
const cited = (gloss: string, values: Record<string, string> | undefined): string => (values?.citation ? gloss.slice(gloss.indexOf("-") + 1) : gloss);

/** The leaf for a root, or a `noSpell` part when the gloss index has no such form. */
export function leafOf(pos: string, root: string, ending: Ending, tables: ClassifyTables): string {
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
 * A thing's head word under `pos`, without its plural. A name is its own root on **-n**
 * (proper-names.md#proper-name--n), and an instance of it on **-ln** its label marked `.instance`
 * (proper-names.md#name-instance--ln); a thing on **-r**, a verb's resume or a `-r` that reaches no antecedent, is the
 * resume of its root (pronouns.md#resume-r). An unnamed thing takes `ending` when the caller knows it from a frame (its
 * new-member frame), else its own ending (word-endings.md).
 */
export function thingLeaf(term: Extract<MeaningTerm, { kind: "thing" }>, pos: string, ending: Ending | undefined, tables: ClassifyTables): string {
  const own = term.values.ending;
  // A resume glosses as `←` and the label of the word it resumes (glosses.md#round-trip).
  if (own === "r" && !ending) {
    const resumed = stemLeaf(term, pos, "l", tables);
    return `${pos}-←${resumed.slice(pos.length + 1)}`;
  }
  if (term.named) {
    if (!term.name || term.stem.length !== 1) throw noRule("a name of several parts");
    // A name with no lexicon row: its gloss is the name itself (glosses.md#word-shape).
    const named = leaf(pos, term.name, "n", tables) ?? `${pos}-${term.name.charAt(0).toUpperCase()}${term.name.slice(1)}n`;
    return own === "ln" ? `${named}.instance` : named;
  }
  // A standalone join as a term (`blual`, hooked-joins.md#hooked-joins-endings) is the widest bound its series names.
  if (term.values.series) return joinLeaf({ series: term.values.series, ...(own ? { ending: own } : {}) }, pos, true);
  ending ??= isEnding(own) ? own : undefined;
  if (!ending) throw new Unrealized("missingValue", "an unnamed thing with no ending in the view");
  return stemLeaf(term, pos, ending, tables);
}

/**
 * A thing's word on `ending`: its one root, or a built word (built.ts) from how the reader records it was built and
 * its stem's label; a stem of several parts with no record is a mid-word compound.
 */
function stemLeaf(term: Extract<MeaningTerm, { kind: "thing" }>, pos: string, ending: Ending, tables: ClassifyTables): string {
  const built = term.values.built ?? (term.stem.length > 1 ? "compound" : undefined);
  if (!built) return leafOf(pos, oneRoot(term, tables), ending, tables);
  if (term.stem.some((part) => part.length !== 1)) throw noRule("a stem of several roots");
  const roots = term.stem.map((part) => rootOf(part[0]!, tables));
  if (!roots.length || roots.some((root) => !root)) throw new Unrealized("missingValue", "a built word's stem with no root");
  return builtLeaf({ ...term.values, built }, pos, stemLabel(roots as string[], built, pos, ending, tables));
}

/**
 * A built word's stem label on `ending`, without its role letter: a listed hook compound by its own row (`leave`); one
 * root by its form; several as a mid-word compound (compounds.md § Two roots, one word: `zuwedaxubudal`, *peanut
 * butter*), each part's root by its sense, joined at the mid-word `x`, the last part a kind of the first, on the word's
 * one ending.
 */
function stemLabel(roots: string[], built: string, pos: string, ending: Ending, tables: ClassifyTables): string {
  const strip = (gloss: string): string => gloss.slice(pos.length + 1);
  if (built === "hookCompound") {
    const listed = roots.length === 1 ? listedLeaf(pos, roots[0]!, tables) : undefined;
    if (!listed) throw noRule("an unlisted hook compound");
    return strip(listed);
  }
  if (roots.length === 1) return strip(leafOf(pos, roots[0]!, ending, tables));
  const labels = roots.map((root) => strip(leafOf(pos, root, "l", tables)));
  const last = strip(leafOf(pos, roots.at(-1)!, ending, tables));
  if (!last.startsWith(labels.at(-1)!)) throw noRule("a compound whose last part's ending changes its label");
  return `${labels.join("-x-")}${last.slice(labels.at(-1)!.length)}`;
}

/** A plain content word's detail (`slot:adj`, `unit:h`, `slot:w`) as one leaf under `pos`, its degree words before it. */
export function plainWord(detail: MeaningDetail, pos: string, root: string | undefined, tables: ClassifyTables): string {
  const ending = detail.values.ending;
  if (!root || !isEnding(ending) || ending === "n") throw noRule(`${detail.key} that is not a plain content word`);
  if (detail.content || (detail.hosted && !detail.values.built)) throw noRule(`${detail.key} with a hosted word or frame`);
  const moods = (detail.frames ?? []).map(moodWord);
  if (moods.length && (pos !== "g" || detail.details?.length)) throw noRule(`${detail.key} with a mood word that is not alone before a /ɡ/ word`);
  const degrees = (detail.details ?? []).map((d) => {
    if (d.key !== "slot:w") throw noRule(`${d.key} on ${detail.key}`);
    if (d.details?.length) throw noRule(`a degree word with its own detail`);
    return plainWord(d, "w", d.values.root, tables);
  });
  // A built word (built.ts) is its front and its stem, which the reader records as `root`, parts joined at `x`.
  const built = detail.values.built;
  const head = built ? builtLeaf(detail.values, pos, stemLabel(root.split("x"), built, pos, ending, tables)) : leafOf(pos, root, ending, tables);
  // A built word's hosted party (label-seams.md: `gonumuthael blerulal`) is its `bl-` word, right after it.
  return unit([...moods, ...degrees, withPlural(head, detail.values), ...(detail.hosted ? [landmarkOf(detail.hosted, tables)] : [])]);
}

/**
 * A mood word on one adjective (universality.md#mood-on-adjective): the stance on `/w/` right before the `/ɡ/` word it
 * covers, glossed by the reader's gloss of its sense (`w-MEMORY`), which holds its ending's meaning.
 */
function moodWord(frame: MeaningFrame): string {
  const gloss = frame.values.gloss;
  const plain = !frame.party && !frame.content && !frame.inner?.length && !frame.details?.length && !frame.hosted && !frame.holderHost;
  if (!gloss || !plain || toneOf(frame) || !Object.keys(frame.values).every((key) => key === "gloss" || key === "ending")) {
    throw noRule(`a ${frame.key} frame on an adjective`);
  }
  return `w-${gloss}`;
}

/** A hosted party as a `bl-` word (hooked-joins.md#hooked-joins, label-seams.md): a `b` term on the letter `bl`. */
export function landmarkOf(term: MeaningTerm, tables: ClassifyTables, style: ListStyle = STANDALONE): string {
  return roleTerm(term, "b", undefined, tables, style).replace(/^(\[?)b-/, "$1bl-");
}

/** A plain adverb (`unit:h`) with its degree words. */
export function adverb(detail: MeaningDetail, tables: ClassifyTables): string {
  // A number adverb (number-roles.md#number-as-adverb-by-marker: `hragel`, *three times*).
  if (detail.key === "lexReading:number") return hNumberLeaf(detail);
  if (detail.key !== "unit:h") throw noRule(`claim detail ${detail.key}`);
  return plainWord(detail, "h", detail.values.root, tables);
}

/** A term's plain adjectives, each with its degree words, after the head (clause.md#adjectives-ɡ). */
function adjectives(details: readonly MeaningDetail[] | undefined, tables: ClassifyTables, plainNoun = false): string[] {
  return (details ?? []).map((detail, i, all) =>
    attempt(detail.key, () => adjective(detail, all[i - 1], plainNoun, tables), PLACEHOLDER),
  );
}

/** One of a term's adjectives, after `prev`, the one before it. */
function adjective(detail: MeaningDetail, prev: MeaningDetail | undefined, plainNoun: boolean, tables: ClassifyTables): string {
  // A minus number right after a plain noun, or after a count anywhere, is a fraction (measures-and-percent.md#fractions).
  const fraction = (prev ? isPlainCount(prev) : plainNoun) ? fractionLeaf(detail) : undefined;
  if (fraction) return fraction;
  // A numeric prefix (numeric-derivation.md) is a built word, written from its stem.
  if (detail.values.built) return plainWord(detail, "g", detail.values.root, tables);
  // A count or rank sits with the adjectives (numbers.md#counts).
  if (detail.key === "lexReading:number") return numberDetailLeaf(detail);
  // A time noun's signed count, which dates a channel (dated-channel.md#counting-from-now).
  if (detail.key === "slot:hosted" && detail.kind === "amount") return measureLeaf(detail);
  if (detail.key !== "slot:adj") throw noRule(`term detail ${detail.key}`);
  return plainWord(detail, "g", detail.values.root, tables);
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
      if (detail.key === "lexReading:number" && !detail.values.built) return sharedNumberLeaf(detail);
      const factors = (detail.details ?? []).filter((d) => d.kind === "amount" && d.key === "lexReading:number");
      const word = factors.length ? { ...detail, details: detail.details!.filter((d) => !factors.includes(d)) } : detail;
      return [plainWord(word, detail.key === "unit:h" ? "h" : "g", detail.values.root, tables), ...factors.map(hNumberLeaf)].join(" | ");
    },
    landmark: (term) => landmarkOf(term, tables, style),
  };
}

/**
 * A rank fence's bar (bars.md#bars): the `/th/` stance word or `/h/` intention adverb that stands where the second name
 * would go, on the ending its `slot:bar` frame records. The frame's gloss names the stance; its word is whichever of the
 * two letters the gloss index has a form of that gloss for. A bar that hosts a `/b/` party or holds a frame is a gap.
 */
function barLeaf(term: Extract<MeaningTerm, { kind: "thing" }>, tables: ClassifyTables): string | undefined {
  const [frame, ...rest] = ownFrames(term.frames);
  if (frame?.key !== "slot:bar" || rest.length) return undefined;
  if (frame.party || frame.content || frame.inner?.length || frame.details?.length || term.details.length) {
    throw noRule("a bar with a party or its own detail");
  }
  const { gloss, ending } = frame.values;
  if (!isEnding(ending)) throw new Unrealized("missingValue", "a bar with no ending in the view");
  const root = oneRoot(term, tables);
  // An ability or say adverb's frame has no host-row gloss; its root alone picks the form.
  const found = ["th", "h"].map((pos) => leaf(pos, root, ending, tables)).filter((l): l is string => !!l && (!gloss || l.slice(l.indexOf("-") + 1).startsWith(gloss)));
  if (found.length !== 1) throw noRule(`a bar that is a built word (${gloss ?? root} on -${ending})`);
  // A bar that hosts a party (stance-bars.md: `thobatham blalazun`) has its `bl-` word right after it.
  return frame.hosted ? unit([found[0]!, landmarkOf(frame.hosted, tables)]) : found[0];
}

/** A term in a role (`z`, `d`, `b`): its head, then its adjectives, as one unit; while collecting, a gap files under `term:KIND`. */
export function roleTerm(term: MeaningTerm, pos: "z" | "d" | "b", ending: Ending | undefined, tables: ClassifyTables, style: ListStyle = STANDALONE): string {
  return attempt(`term:${term.kind}`, () => roleUnit(term, pos, ending, tables, style), PLACEHOLDER);
}

/** A role term's unit, its tag after it. */
function roleUnit(term: MeaningTerm, pos: "z" | "d" | "b", ending: Ending | undefined, tables: ClassifyTables, style: ListStyle = STANDALONE): string {
  // A tag that names this term goes right after it, in the same role (tag-pronouns.md#naming-with-a-tag).
  const tag = style.tags?.get(term);
  if (tag) {
    style.tags!.delete(term);
    return `[${roleTerm(term, pos, ending, tables, style)} | ${pos}-${tag}]`;
  }
  const gloss = roleWord(term, pos, ending, tables, style);
  // A list's frames are its join's; a blank writes its own mark.
  return term.kind === "list" || term.kind === "blank" || !("frames" in term) ? gloss : marked(term.frames, gloss);
}

/** A role term's words, its word-scope tone mark aside. */
function roleWord(term: MeaningTerm, pos: "z" | "d" | "b", ending: Ending | undefined, tables: ClassifyTables, style: ListStyle): string {
  const bar = term.kind === "thing" ? barLeaf(term, tables) : undefined;
  if (bar) return bar;
  if (term.kind !== "list" && "frames" in term) for (const frame of ownFrames(term.frames)) skip(frame.key, noRule(`a ${term.kind} term with its own frame`));
  switch (term.kind) {
    case "list":
      return listGloss(term, pos, ending, listWriters((m, own) => roleTerm(m, pos, own, tables, style), tables, style), style);
    case "thing":
      return unit([
        cited(withPlural(thingLeaf(term, pos, ending, tables), term.values), term.values),
        ...adjectives(term.details, tables, !term.named && ending === "l" && term.stem.length === 1 && !term.values.built),
      ]);
    case "speaker":
    case "listener":
    case "we":
      return unit([withPlural(leafOf(pos, SPECIAL_ROOT[term.kind], "n", tables), term.values), ...adjectives(term.details, tables)]);
    case "pronoun":
      return unit([withPlural(pronounLeaf(term, pos, ending, tables), term.values), ...adjectives(term.details, tables)]);
    case "number":
      return unit([cited(numberTermLeaf(term, pos), term.values), ...adjectives(term.details, tables)]);
    case "blank":
      return blankTerm(term, pos, tables, style);
    default:
      throw noRule(`a ${term.kind} term`);
  }
}

/**
 * A fill-ask blank (questions.md#fill-ask, fill-ask-roles.md#fill-ask-arity): its join word under `pos`, glossed as the
 * blank it asks for; a hooked one (`[d-for-x-wh | bl-speaker]`, hooked-joins.md#hooked-joins) has its landmark right
 * after it, then any adjectives.
 */
export function blankTerm(term: Extract<MeaningTerm, { kind: "blank" }>, pos: string, tables: ClassifyTables, style: ListStyle = STANDALONE): string {
  const { series, ending, hook, plural, ...rest } = term.values ?? {};
  void plural;
  if (Object.keys(rest).length || ownFrames(term.frames).length) throw noRule("a blank with its own frame");
  // A number blank (`grar`, digitless-exponents.md#how-many) keeps its number word, not a join.
  if (!series || ending !== "r") throw noRule("a number blank");
  const plain = fillAskGloss(`${pos}${series}${ending}`, tables);
  if (!plain?.startsWith(`${pos}-`)) throw noRule(`a blank of series ${series} under /${pos}/`);
  const head = marked(term.frames, withPlural(`${hookFront(pos, hook)}-${plain.slice(pos.length + 1)}`, term.values));
  const details = [...(term.details ?? [])];
  const landmark: string[] = [];
  if (hook !== undefined) {
    const bound = details.shift();
    if (bound?.kind !== "bound" || !bound.hosted || bound.details?.length || bound.frames?.length || bound.content) throw noRule("a hooked blank with no landmark");
    landmark.push(landmarkOf(bound.hosted, tables, style));
  }
  return unit([head, ...landmark, ...adjectives(details, tables)]);
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
  // A tag pronoun is its tag vowels and ending (tag-pronouns.md#naming-with-a-tag); reading it binds it again.
  if (values.tag) return `${pos}-${tagLabel(values)}`;
  // A `-r` that reaches nothing earlier, the one you both already know (pronouns.md#resume-r), by its own root.
  if (!term.antecedent && values.ending === "r" && values.root && !values.sense) {
    const known = leafOf(pos, values.root, "l", tables);
    return `${pos}-←${known.slice(pos.length + 1)}`;
  }
  if (!term.antecedent) throw noRule("a pronoun with no antecedent");
  if (term.bind === "role") return roleResumeLeaf(term, values, pos, tables);
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

/** The verb: a thing on `/v/`, named or on **-l**, with no frame or detail of its own; while collecting, a gap files under `term:KIND`. */
export function verbTerm(term: MeaningTerm, tables: ClassifyTables, style: ListStyle = STANDALONE): string {
  return attempt(`term:${term.kind}`, () => verbWord(term, tables, style), PLACEHOLDER);
}

/** The verb's words. */
function verbWord(term: MeaningTerm, tables: ClassifyTables, style: ListStyle): string {
  // A verb list (joins.md#and-lists-a): each verb, then the `/v/` join.
  if (term.kind === "list") return listGloss(term, "v", undefined, listWriters((m) => verbTerm(m, tables), tables, style), { ...style, standalone: true });
  if (term.kind === "blank") return blankTerm(term, "v", tables, style);
  if (term.kind !== "thing") throw noRule(`a ${term.kind} verb`);
  // A built verb's hosted party (label-seams.md: `venumuthel blalazun`) is its `bl-` word, right after it.
  const [hosted, ...rest] = term.details;
  const party = hosted?.key === "slot:hosted" && hosted.hosted && term.values.built && !rest.length ? hosted.hosted : undefined;
  for (const part of [...ownFrames(term.frames), ...(party ? [] : term.details)]) skip(part.key, noRule("a verb with its own frame or detail"));
  const own = term.values.ending;
  const verb = marked(term.frames, withPlural(thingLeaf(term, "v", own === "m" ? "m" : own === "r" ? undefined : "l", tables), term.values));
  return party ? unit([verb, landmarkOf(party, tables, style)]) : verb;
}

/**
 * A predicate adjective (predication.md#classification-property): a thing whose one detail is the `/ɡ/` word itself,
 * which holds its ending and degree words.
 */
export function predicateTerm(term: MeaningTerm, tables: ClassifyTables, style: ListStyle = STANDALONE): string {
  return attempt(`term:${term.kind}`, () => predicateUnit(term, tables, style), PLACEHOLDER);
}

/** A predicate term's words. */
function predicateUnit(term: MeaningTerm, tables: ClassifyTables, style: ListStyle): string {
  // A predicate list (joins.md#negation-u: `gamahum gul`): each predicate word, then the `/ɡ/` join.
  if (term.kind === "list") return listGloss(term, "g", undefined, listWriters((m) => predicateTerm(m, tables), tables, style), { ...style, standalone: true });
  if (term.kind === "blank") return blankTerm(term, "g", tables, style);
  if (term.kind !== "thing") throw noRule(`a ${term.kind} predicate`);
  for (const frame of ownFrames(term.frames)) skip(frame.key, noRule("a thing predicate"));
  return marked(term.frames, predicateWord(term, tables));
}

/** A predicate thing's word, its word-scope tone mark aside. */
function predicateWord(term: Extract<MeaningTerm, { kind: "thing" }>, tables: ClassifyTables): string {
  const [self, ...rest] = term.details;
  // A built word (built.ts: a role word, a numeric prefix, a label seam) is its own detail, its stem as `root`.
  if (self?.values.built && !rest.length) return plainWord(self, "g", self.values.root, tables);
  // A number predicate (numbers.md#counts: *there are three cats*): the number word is its own detail.
  if (self?.key === "lexReading:number" && !rest.length) return numberDetailLeaf(self);
  if (term.named) throw noRule("a thing predicate");
  if (!self || rest.length || self.key !== "slot:adj") throw noRule("a predicate that is not one plain adjective");
  const root = oneRoot(term, tables);
  if (self.values.root !== root) throw noRule("a predicate whose word is not its own root");
  return plainWord(self, "g", root, tables);
}
