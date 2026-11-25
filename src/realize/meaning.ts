/**
 * The meaning view (docs/meta/realizer.md#meaning-view): a reading with its form taken out. The realizer reads only
 * this view, so a text it writes can differ from the original only where the view lacks a meaning. `project` is the one
 * door from a reading to the view: no `Meaning*` type holds a `LexWord`, a construction id, an anchor, a word position
 * or a pointer into the parse.
 */
import type { ClassifyTables } from "../parse/classify.js";
import type { AnaphorKind, NumberStem, SharedRole } from "../parse/types.js";
import type { Detail, Frame, FrameFamily, Link, LinkKind, PairKind, Reading, ReadingId, StanceList, Term } from "../interpret/types.js";

/** The field types the view names, so a realizer file needs no import from the parser's types. */
export type { AnaphorKind, FrameFamily, LinkKind, NumberStem, PairKind, ReadingId, SharedRole };

/** One root of a thing's stem: its lexicon row's concrete sense, or its spelling when no row gives one. */
export type MeaningRoot = { sense: string } | { spelling: string };

export type MeaningReading = {
  id: ReadingId;
  /** The reading's frames, in the reading's order. */
  frames: MeaningFrame[];
  /** Which frame covers which, as indices into `frames`. */
  order: { over: number; under: number; kind: PairKind }[];
  /** Pairs no rule orders, as indices into `frames`, each pair in text order. */
  unordered: [number, number][];
  stanceLists?: MeaningStanceList[];
  claim: MeaningClaim;
  links: MeaningLink[];
  /** The reader left a construction unplaced: the round trip skips the reading, with the reason `unread`. */
  unread?: true;
};

export type MeaningClaim = {
  verb?: MeaningTerm;
  roles: Partial<Record<"z" | "d" | "b", MeaningTerm>>;
  predicate: MeaningTerm[];
  details: MeaningDetail[];
  clauses?: MeaningTerm;
};

export type MeaningFrame = {
  family: FrameFamily;
  key: string;
  values: Record<string, string>;
  party?: MeaningTerm;
  content?: MeaningReading[];
  hosted?: MeaningTerm;
  inner?: MeaningFrame[];
  details?: MeaningDetail[];
  /** The claim details the restrictor covers: the same objects as in the claim's `details`. */
  occasions?: MeaningDetail[];
  member?: string;
  holderHost?: true;
};

export type MeaningDetail = {
  kind: string;
  key: string;
  values: Record<string, string>;
  content?: MeaningReading[];
  hosted?: MeaningTerm;
  details?: MeaningDetail[];
  frames?: MeaningFrame[];
};

export type MeaningStanceList = {
  key: string;
  values: Record<string, string>;
  /** Stance frames and earlier lists, the same objects as in the reading's `frames` and `stanceLists`. */
  members: (MeaningFrame | MeaningStanceList)[];
  inner?: MeaningFrame[];
  details?: MeaningDetail[];
};

type Attached = { details?: MeaningDetail[]; frames?: MeaningFrame[] };

export type MeaningTerm =
  | {
      kind: "thing";
      /** The stem: parts joined by `x`, each a run of roots. */
      stem: MeaningRoot[][];
      named: boolean;
      /** A name is an identity: its root spelling, as written. */
      name?: string;
      details: MeaningDetail[];
      frames?: MeaningFrame[];
    }
  | ({ kind: "speaker" | "listener" | "we" | "blank" } & Attached)
  | ({ kind: "pronoun"; sort?: "generic" | "topic"; bind?: AnaphorKind; antecedent?: MeaningTerm; values?: Record<string, string> } & Attached)
  | ({ kind: "literal"; payload: string } & Attached)
  | ({ kind: "number"; stem: NumberStem; values?: Record<string, string> } & Attached)
  | {
      kind: "list";
      members: MeaningTerm[];
      /** The tree's parts, each with its members (the same objects as in `members`). */
      parts: { members: MeaningTerm[] }[];
      shared: { role: SharedRole }[];
      values: Record<string, string>;
      frames?: MeaningFrame[];
      bound?: MeaningDetail;
      sharedDetails?: MeaningDetail[];
    }
  | { kind: "clause"; reading: MeaningReading }
  | { kind: "quote"; readings: MeaningReading[]; frames?: MeaningFrame[] };

export type MeaningLink = {
  kind: LinkKind;
  key: string;
  values?: Record<string, string>;
  to?: ReadingId;
  bind?: AnaphorKind;
  shared?: { role: SharedRole };
  /** Which question the answer fills and how many blanks; the blank words are dropped. */
  answer?: { utteranceIndex: number; askIndex: number; form: "citation" | "sameRole"; blanks: number };
  frame?: MeaningFrame;
  coveredBy?: MeaningFrame[];
  partners?: MeaningTerm[];
  resumed?: MeaningDetail;
};

/** Every reading of a text, projected. One `Projector` per call, so an object met twice projects to one object. */
export function project(readings: readonly Reading[], tables: ClassifyTables): MeaningReading[] {
  const projector = new Projector(tables);
  return readings.map((reading) => projector.reading(reading));
}

const opt = <T, U>(value: T | undefined, fn: (value: T) => U): U | undefined => (value === undefined ? undefined : fn(value));

/** Drops the keys whose value is `undefined`, so an absent field stays absent. */
function defined<T extends object>(out: T): T {
  for (const key of Object.keys(out) as (keyof T)[]) if (out[key] === undefined) delete out[key];
  return out;
}

/**
 * Projects readings and their parts. A shared object (a frame both in `frames` and a stance list, an occasion both on
 * the claim and its restrictor, a pronoun's antecedent) projects to one shared object, and a cycle closes on itself.
 */
export class Projector {
  private memo = new Map<object, object>();

  constructor(private tables: ClassifyTables) {}

  private once<S extends object, T extends object>(source: S, fill: (out: T) => T): T {
    const seen = this.memo.get(source);
    if (seen) return seen as T;
    const out = {} as T;
    this.memo.set(source, out);
    return Object.assign(out, defined(fill(out)));
  }

  reading(reading: Reading): MeaningReading {
    return this.once(reading, () => {
      const index = (frame: Frame): number => {
        const at = reading.frames.indexOf(frame);
        if (at < 0) throw new Error(`${reading.id}: a frame in order or unordered is not among the reading's frames (${frame.key})`);
        return at;
      };
      const textAt = (frame: Frame): number => frame.words[0]?.at ?? Number.MAX_SAFE_INTEGER;
      return {
        id: reading.id,
        frames: reading.frames.map((frame) => this.frame(frame)),
        order: reading.order.map((pair) => ({ over: index(pair.over), under: index(pair.under), kind: pair.kind })),
        unordered: reading.unordered.map(([a, b]): [number, number] => {
          const pair: [number, number] = [index(a), index(b)];
          const later = textAt(a) > textAt(b) || (textAt(a) === textAt(b) && pair[0] > pair[1]);
          return later ? [pair[1], pair[0]] : pair;
        }),
        stanceLists: opt(reading.stanceLists, (lists) => lists.map((list) => this.stanceList(list))),
        claim: defined({
          verb: opt(reading.claim.verb, (term) => this.term(term)),
          roles: Object.fromEntries(Object.entries(reading.claim.roles).map(([letter, term]) => [letter, this.term(term)])),
          predicate: reading.claim.predicate.map((term) => this.term(term)),
          details: this.details(reading.claim.details),
          clauses: opt(reading.claim.clauses, (term) => this.term(term)),
        }),
        links: reading.links.map((link) => this.link(link)),
        unread: reading.unread.length ? true : undefined,
      } as MeaningReading;
    });
  }

  frame(frame: Frame): MeaningFrame {
    return this.once(frame, () => ({
      family: frame.family,
      key: frame.key,
      values: { ...frame.values },
      party: opt(frame.party, (term) => this.term(term)),
      content: opt(frame.content, (readings) => readings.map((reading) => this.reading(reading))),
      hosted: opt(frame.hosted, (term) => this.term(term)),
      inner: opt(frame.inner, (frames) => this.frames(frames)),
      details: opt(frame.details, (details) => this.details(details)),
      occasions: opt(frame.occasions, (details) => this.details(details)),
      member: frame.member,
      holderHost: frame.holderHost,
    }));
  }

  detail(detail: Detail): MeaningDetail {
    return this.once(detail, () => ({
      kind: detail.kind,
      key: detail.key,
      values: { ...detail.values },
      content: opt(detail.content, (readings) => readings.map((reading) => this.reading(reading))),
      hosted: opt(detail.hosted, (term) => this.term(term)),
      details: opt(detail.details, (details) => this.details(details)),
      frames: opt(detail.frames, (frames) => this.frames(frames)),
    }));
  }

  stanceList(list: StanceList): MeaningStanceList {
    return this.once(list, () => ({
      key: list.key,
      values: { ...list.values },
      members: list.members.map((member) => ("members" in member ? this.stanceList(member) : this.frame(member))),
      inner: opt(list.inner, (frames) => this.frames(frames)),
      details: opt(list.details, (details) => this.details(details)),
    }));
  }

  term(term: Term): MeaningTerm {
    return this.once(term, () => {
      const attached = (t: { details?: Detail[]; frames?: Frame[] }): Attached => ({
        details: opt(t.details, (details) => this.details(details)),
        frames: opt(t.frames, (frames) => this.frames(frames)),
      });
      switch (term.kind) {
        case "thing":
          return {
            kind: "thing",
            stem: this.stem(term),
            named: term.named,
            name: term.named ? term.root : undefined,
            details: this.details(term.details),
            frames: opt(term.frames, (frames) => this.frames(frames)),
          };
        case "speaker":
        case "listener":
        case "we":
        case "blank":
          return { kind: term.kind, ...attached(term) };
        case "pronoun":
          return {
            kind: "pronoun",
            sort: term.sort,
            bind: term.bind?.kind,
            antecedent: opt(term.antecedent, (antecedent) => this.term(antecedent)),
            values: opt(term.values, (values) => ({ ...values })),
            ...attached(term),
          };
        case "literal":
          return { kind: "literal", payload: term.payload, ...attached(term) };
        case "number":
          return { kind: "number", stem: structuredClone(term.stem), values: opt(term.values, (values) => ({ ...values })), ...attached(term) };
        case "list":
          return {
            kind: "list",
            members: term.members.map((member) => this.term(member)),
            parts: term.parts.map((part) => ({ members: part.members.map((member) => this.term(member)) })),
            shared: term.shared.map((record) => ({ role: record.role })),
            values: { ...term.values },
            frames: opt(term.frames, (frames) => this.frames(frames)),
            bound: opt(term.bound, (bound) => this.detail(bound)),
            sharedDetails: opt(term.sharedDetails, (details) => this.details(details)),
          };
        case "clause":
          return { kind: "clause", reading: this.reading(term.reading) };
        case "quote":
          return { kind: "quote", readings: term.readings.map((reading) => this.reading(reading)), frames: opt(term.frames, (frames) => this.frames(frames)) };
      }
    });
  }

  link(link: Link): MeaningLink {
    return this.once(link, () => ({
      kind: link.kind,
      key: link.key,
      values: opt(link.values, (values) => ({ ...values })),
      to: link.to,
      bind: link.bind?.kind,
      shared: opt(link.shared, (record) => ({ role: record.role })),
      answer: opt(link.answer, (answer) => ({ utteranceIndex: answer.utteranceIndex, askIndex: answer.askIndex, form: answer.form, blanks: answer.blanks.length })),
      frame: opt(link.frame, (frame) => this.frame(frame)),
      coveredBy: opt(link.coveredBy, (frames) => this.frames(frames)),
      partners: opt(link.partners, (terms) => terms.map((term) => this.term(term))),
      resumed: opt(link.resumed, (detail) => this.detail(detail)),
    }));
  }

  private frames(frames: Frame[]): MeaningFrame[] {
    return frames.map((frame) => this.frame(frame));
  }

  private details(details: Detail[]): MeaningDetail[] {
    return details.map((detail) => this.detail(detail));
  }

  /**
   * A thing's stem from its head word's roots: the run the reader joined into `root`, split back into roots and named by
   * concrete sense (a listed compound stem as one root). A stem the head's roots do not spell stays one spelling.
   */
  private stem(term: Extract<Term, { kind: "thing" }>): MeaningRoot[][] {
    const family = term.head.family;
    const parts: string[][] | undefined =
      family.kind === "content" && family.roots.join("") === term.root
        ? [family.roots]
        : family.kind === "x" && family.rightRoots?.join("") === term.root
          ? [family.rightRoots]
          : family.kind === "x" && [...family.leftRoots, ...(family.rightRoots ?? [])].join("x") === term.root
            ? [...family.leftRoots, ...(family.rightRoots ?? [])].map((root) => [root])
            : undefined;
    if (!parts) return [[{ spelling: term.root }]];
    return parts.map((roots) => {
      const compound = roots.length > 1 ? this.tables.compounds.get(roots.join(""))?.concrete : undefined;
      return compound ? [{ sense: compound }] : roots.map((root) => this.root(root));
    });
  }

  private root(root: string): MeaningRoot {
    const sense = this.tables.published.get(root)?.concrete || this.tables.compounds.get(root)?.concrete;
    return sense ? { sense } : { spelling: root };
  }
}
