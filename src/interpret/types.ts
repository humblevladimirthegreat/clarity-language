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
  /**
   * Stance words a `/th/` join closes, as one list each, in text order (verb-and-stance-joins.md#stance-joins). Absent
   * when the clause has none.
   */
  stanceLists?: StanceList[];
  claim: Claim;
  links: Link[];
  /** Constructions the reader could not place. */
  unread: Unread[];
};

/**
 * A `/th/` join that closes stance words: the joined stance frames as one list, with the join's own frame (if its series
 * row is a frame) over the list, not over the clause (verb-and-stance-joins.md#stance-joins,
 * verb-and-stance-joins.md#stance-join-reach). One stance word closed is a list of one. What denying or ranking the list
 * means is the consumer's, from set-joins.md and rank-joins.md; the reader only copies the tree.
 */
export type StanceList = {
  kind: "stanceList";
  /** The join's classification-table key (`joinSeries:<series>`). */
  key: string;
  construction: string;
  /** verb-and-stance-joins.md#stance-joins. */
  anchor: string;
  /** The join word that closes the list. */
  join: LexWord;
  /** The join word's own values: `series`, as on a list term. */
  values: Record<string, string>;
  /**
   * What the join closes, in text order (`HUnit.closes`): stance frames, the same objects as in the reading's frames,
   * and an earlier stance list in the run, which stands for its whole fence. Pointers, never copies.
   */
  members: (Frame | StanceList)[];
  /** The join's frame where its series row is a frame: polarity (`u`, `ue`), binder (`ua`, `uo`). Absent for a structure series. */
  inner?: Frame[];
  /** `/w/` words right before the join: a detail that covers the whole list. */
  details?: Detail[];
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
  /** The word's own typed fields, copied (a say word: reach, part, answer, ending, and on `v` with no party its `source`; a question: ask). */
  values: Record<string, string>;
  /** Whose it is: a holder, the one with the say, the addressee. */
  party?: Term;
  /** The clause it embeds: a condition, a quote. */
  content?: Reading[];
  /** The hosted `/b/`: a hinge's condition noun, a channel's source, a sake's stake holder. */
  hosted?: Term;
  /**
   * Frames held inside this one: the stance or intention a contrary zone holds (contrary-to.md#contrary-to-stance), or
   * a tone mark on the frame's own word (tone-marks.md#showing-your-tone: "A mark may go on any word, including act words").
   */
  inner?: Frame[];
  /** Words that describe the frame's own word: a call's or a reaction's `gl-`, `/w/` and `/ɡ/` words (speech-moves.md#vocative, more-turn-words.md#describe-turn-word). */
  details?: Detail[];
  /**
   * A `/h/` restrictor's occasions, in text order (restrictors.md#only-when-never-hal): the claim's details for the
   * `/h/` words its list holds. The details stay on the claim; the frame points at them.
   */
  occasions?: Detail[];
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
  /** Frames that reach only this word (adjective reach), nested here by rule 2, and a tone mark on the word. */
  frames?: Frame[];
};

/**
 * A term's `frames` reach only its word: an adjective-reach stance (rule 2), or a tone mark on the word or span
 * (tone-marks.md#showing-your-tone).
 */
export type Term =
  | { kind: "thing"; head: LexWord; root: string; named: boolean; details: Detail[]; frames?: Frame[] }
  | { kind: "speaker" | "listener" | "we"; word: LexWord; details?: Detail[]; frames?: Frame[] }
  | {
      kind: "pronoun";
      word: LexWord;
      /** The topic or the generic pronoun, as the resolve stage tells them apart (topic.md#topic-pronoun, pronouns.md#generic-pronoun). */
      sort?: "generic" | "topic";
      bind?: AnaphorBind;
      antecedent?: Term;
      details?: Detail[];
      frames?: Frame[];
    }
  | { kind: "blank"; word: LexWord; details?: Detail[]; frames?: Frame[] }
  | { kind: "literal"; word: LexWord; payload: string; details?: Detail[]; frames?: Frame[] }
  | { kind: "number"; word: LexWord; stem: NumberStem; details?: Detail[]; frames?: Frame[] }
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
      /**
       * The words after a join that every member shares (list-structure.md#shared-after-the-join): one detail per shared
       * word, read by its class (a frame-class word nests in `frames`, rule 2), with its own hosted words and modifiers.
       * `values.role` is the resolve stage's shared role where `shared` has a record for it; an equative's factor
       * (`npJoinClose.factor`) sits in its scale's `details`.
       */
      sharedDetails?: Detail[];
    }
  | { kind: "clause"; reading: Reading }
  /** A cite span: its words are readings with their own act word and frames. */
  | { kind: "quote"; word: LexWord; readings: Reading[]; frames?: Frame[] };

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
  | "carriedFrame"
  /** A question's NOTIONAL frame to the supposition it asks inside: the latest stated NOTIONAL reading in the log. */
  | "supposition";

export type Link = {
  kind: LinkKind;
  key: string;
  anchor: string;
  words: LexWord[];
  /**
   * linker, discourse, polar, standIn, standInBack: the word's `gloss` (`therefore`, `instead`, `yes`, `that-clause`),
   * plus `series` and `ending` where the word is a vowel series and an ending (a hook, a polar word, a stand-in).
   */
  values?: Record<string, string>;
  /** The reading it points to, where the tree or the resolve stage names one. */
  to?: ReadingId;
  bind?: AnaphorBind;
  shared?: SharedRecord;
  answer?: AnswerRecord;
  /** grounds: the frame whose content the next sentence is; carriedFrame: the frame carried; supposition: the supposed reading's NOTIONAL frame. */
  frame?: Frame;
  /**
   * carriedFrame: the reading's own speaker attitudes and feeling words, which sit over the carried frame
   * (evidentiality.md#carry-forward). The carried frame covers the claim, never your own stance. Absent when there are none.
   */
  coveredBy?: Frame[];
  /** pairing: the list terms the *respectively* list pairs with, from the resolve stage's `PairingRecord` (one in every doc example; never picked between). */
  partners?: Term[];
  /**
   * hookResume: the extra-noun hook it points back to (in-clause-hooks.md#hook-resume), in the reading `to` names; its
   * `hosted` is the landmark. Absent when no earlier sentence names one.
   */
  resumed?: Detail;
};

export type Unread = {
  /** The construction id, or the table key when no id names it. */
  construction: string;
  key?: string;
  word?: LexWord;
  reason: "noRow" | "unknownWord" | "unplaced" | "quoteParse";
};
