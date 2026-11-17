/**
 * The reading: what one clause says (docs/meta/interpreter.md#terms). These types are the contract every consumer
 * reads; no consumer adds its own fields.
 */
import type { FrameFamily, PairKind } from "../parse/scope.js";
import type { AnaphorBind, AnswerRecord, Clause, LexWord, NumberStem, SharedRecord } from "../parse/types.js";

export type { FrameFamily, PairKind };

/** `<text>:<utterance>.<body>` plus a clause path: `/m<i>` a clause-join member, `/d` a dependent, `/i<at>` an island, `/q<at>.<i>` a quote's reading. */
export type ReadingId = string;

export type Reading = {
  id: ReadingId;
  /** Into the ParseResult; never a copy. A quote's readings point into the quote's own parse. */
  source: { utterance: number; body: number; clause: Clause };
  /** Frames on the clause, in text order: whole-clause frames (with the turn's edge frames) first as the resolve stage gives them, then the rest as met. */
  frames: Frame[];
  /** Which frame covers which, copied from `ParseResult.resolve.scope`. */
  order: FrameOrder[];
  /** Pairs that do not commute and that no rule orders; no reader, consumer, or host picks. */
  unordered: [Frame, Frame][];
  claim: Claim;
  links: Link[];
  /** Constructions the reader could not place. */
  unread: Unread[];
};

export type FrameOrder = { over: Frame; under: Frame; kind: PairKind; anchors: string[] };

export type Claim = {
  verb?: Term;
  roles: Partial<Record<"z" | "d" | "b", Term>>;
  /** Clause-level `/ɡ/`: what the subject is. */
  predicate: Term[];
  details: Detail[];
  /** A clause join: one reading per member, held by a list term (reader rule 1). */
  clauses?: Term;
};

export type Frame = {
  family: FrameFamily;
  /** The construction id the word carries for this row, or the table key when no id names it. */
  construction: string;
  /** Its classification-table key. */
  key: string;
  /** The owning grammar section. */
  anchor: string;
  words: LexWord[];
  /** The word's own typed fields, copied (a say word: reach, part, answer, ending; a question: ask). */
  values: Record<string, string>;
  /** Whose it is: a holder, the one with the say, the addressee. */
  party?: Term;
  /** The clause it embeds: a condition, a quote. */
  content?: Reading[];
  /** The hosted `/b/`: a hinge's condition noun, a channel's source, a sake's stake holder. */
  hosted?: Term;
  /** Frames held inside this one: the stance or intention a contrary zone holds (contrary-to.md#contrary-to-stance). */
  inner?: Frame[];
  /** The resolve stage's member tag, where a pair row tells members apart. */
  member?: string;
  /** A holder's host stance, NOTIONAL or intention. */
  holderHost?: true;
};

export type Detail = {
  /** `detail:<kind>` without the prefix: adverb, place, time, degree, adjective, relation, likeness, range, hook, aside, island, bound (a hooked join's landmark). */
  kind: string;
  construction: string;
  key: string;
  anchor: string;
  words: LexWord[];
  values: Record<string, string>;
  /** A nested reading: a scope island's chunk, an aside. */
  content?: Reading[];
  /** The landmark or content of a hosted `/b/`. */
  hosted?: Term;
  /** Details of this detail (`/w/` on an adverb or adjective). */
  details?: Detail[];
  /** Frames that reach only this word (adjective reach), nested here by rule 2. */
  frames?: Frame[];
};

export type Term =
  | { kind: "thing"; head: LexWord; root: string; named: boolean; details: Detail[]; frames?: Frame[] }
  | { kind: "speaker" | "listener"; word: LexWord; details?: Detail[] }
  | { kind: "pronoun"; word: LexWord; bind?: AnaphorBind; antecedent?: Term; details?: Detail[] }
  | { kind: "blank"; word: LexWord; details?: Detail[] }
  | { kind: "literal"; word: LexWord; payload: string; details?: Detail[] }
  | { kind: "number"; word: LexWord; stem: NumberStem; details?: Detail[] }
  | {
      kind: "list";
      /** The join that closes the list (its last part's join). */
      join?: LexWord;
      members: Term[];
      shared: SharedRecord[];
      values: Record<string, string>;
      /** The tree's parts: each part's members and the join that closes it. */
      parts: { members: Term[]; join?: LexWord }[];
      /** List-reach frames (a `u` list join denies only its items, rule 2). */
      frames?: Frame[];
      /** A hooked join's bound: which members count (hooked-joins.md#hooked-joins). Its hook is in `values.hook`, its landmark is `hosted`. */
      bound?: Detail;
    }
  | { kind: "clause"; reading: Reading }
  /** A cite span: its words are readings with their own act word and frames. */
  | { kind: "quote"; word: LexWord; readings: Reading[] };

export type LinkKind =
  | "anaphor"
  | "linker"
  | "discourse"
  | "hookResume"
  | "standIn"
  | "standInBack"
  | "shared"
  | "verbShared"
  | "pairing"
  | "answer"
  | "polar"
  | "tag"
  | "topic"
  /** A hinge's condition or a channel's grounds in the next sentence (`blarl`, `barl`). */
  | "grounds"
  /** A channel, holder, NOTIONAL or dated offset carried over a later bare sentence: points to the reading that set it. */
  | "carriedFrame";

export type Link = {
  kind: LinkKind;
  key: string;
  anchor: string;
  words: LexWord[];
  /** The reading it points to, where the tree or the resolve stage names one. */
  to?: ReadingId;
  bind?: AnaphorBind;
  shared?: SharedRecord;
  answer?: AnswerRecord;
  /** grounds: the frame whose content the next sentence is; carriedFrame: the frame carried. */
  frame?: Frame;
};

export type Unread = {
  /** The construction id, or the table key when no id names it. */
  construction: string;
  key?: string;
  word?: LexWord;
  reason: "noRow" | "unknownWord" | "unscoped" | "unplaced" | "quoteParse";
};
