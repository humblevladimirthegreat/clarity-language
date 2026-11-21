/** Translator types and the wrap helpers (docs/meta/solver.md): what `translate` takes and returns. */
import { match, type TermSite } from "./match.js";
import { type StepLexicon } from "./steps.js";
import type { Claim, Detail, Frame, Link, Reading, ReadingId, Term } from "./types.js";

export type TranslateOptions = {
  /** The parser's lexicon tables: compound heads (`head/2` facts) come from them. Without them no `head` facts. */
  lexicon?: StepLexicon;
  /** Host switches written as `switch(Name).` facts: `widen` (compound to head), `defaults` (everyday defaults), `closed` (closed world). */
  switches?: Partial<Record<"widen" | "defaults" | "closed", boolean>>;
};

/**
 * A reading left out of the program, as an `unread` part is: the turn is `beyond` for a solver job. Reason `noRow`: a
 * frame or combination with no row; `unused`: every frame has a row, but the rows that ran left a part of the reading
 * unused (the accounting guard), listed in `unused`; `fragment` (R4c decision 5): a verbless list (`zobudal zuel.`), an offer or
 * a name rather than a claim, with no claim term (`construction` `fragment`, `key` the list's join frame).
 */
export type LeftOut = { reading: ReadingId; construction: string; key?: string; reason: string; unused?: string[] };

/**
 * A part of a reading a row must use, or the reading is left out (the accounting guard): a frame (with the frames held
 * inside it), a link, a SHARED detail after a join, a blank, and a list the matcher reads members of (`claimMemberLists`).
 */
export type Part = { kind: "frame" | "link" | "shared" | "blank" | "list"; of: object; reading: ReadingId; key: string; text: string };

/**
 * A frame the program does not encode but a reply may mention (R1-9: standalone `thul` leaves the claim untouched), a
 * detail (R4c-1: a `/w/` degree on a superlative's scale), or a link that adds no term (R4d: a sentence linker, a topic
 * word, a tag, a discourse hook, a polar word); a linker's note is `linker(Word, To)`, its words and the reading it points to.
 */
export type Note = { reading: ReadingId; frame: Frame | Detail | LinkNote };

/** A link as a note: its classification key doubles as the construction a reply names. */
export type LinkNote = Link & { construction: string };

/**
 * R4d: the links a reading's rows used with no term of their own, a polar word's verdict, *therefore*'s prior reading, and
 * the reading a withdrawing hook takes back (O-2).
 */
export type Talk = { used: Link[]; answer?: { to: Reading; sign: 1 | -1 }; therefore?: ReadingId; withdraws?: ReadingId };

/** R4d-5: a discourse hook that adds (`a`, `ao`, `ae`), rewords (`o`) or returns (`er`) keeps the clause. */
export const KEPT_HOOK = /^(?:(?:a|o)[lmr]|(?:ao|ae)[lm]|er)$/;

/** A term in the program and the claim it stands for: the matcher's input for a question asked of the answer set. */
export type TermSource = { reading: ReadingId; claim: Claim };

/**
 * What a group (b) reading's claim is wrapped in (docs/meta/solver.md): a holder's view, `view(H, T)`, or a say word,
 * `say(Who, Part, Reach, Answer, Ending, T)` with `to(X)` as a seventh argument for pair reach `e` on `z` / `d` / `b`.
 */
export type Wrap =
  | { kind: "view"; holder: string; may?: boolean; say?: SayWrap }
  | SayWrap;

/** A say word's wrap. */
export type SayWrap = { kind: "say"; who: string; part: string; reach: string; answer: string; ending: string; to?: string };

/** The say word in a wrap: the wrap itself, or one a holder's view holds (R4a-13). */
export function sayOf(wrap: Wrap | undefined): SayWrap | undefined {
  return wrap?.kind === "say" ? wrap : wrap?.say;
}

/** A claim term inside its wrap, as the program writes it. */
export function wrapText(wrap: Wrap | undefined, inner: string): string {
  if (!wrap) return inner;
  // R3-6: the holder's own MAY is a term inside the view.
  if (wrap.kind === "view") return `view(${wrap.holder},${wrap.may ? `may(${inner})` : wrapText(wrap.say, inner)})`;
  return `say(${wrap.who},${wrap.part},${wrap.reach},${wrap.answer},${wrap.ending},${inner}${wrap.to ? `,${wrap.to}` : ""})`;
}

/** The claim term inside an atom with this wrap, or undefined when the atom has another wrap or none. */
export function unwrapText(wrap: Wrap, atom: string): string | undefined {
  const [before, after] = wrapText(wrap, "\u0000").split("\u0000") as [string, string];
  return atom.length > before.length + after.length && atom.startsWith(before) && atom.endsWith(after) ? atom.slice(before.length, atom.length - after.length) : undefined;
}

/**
 * R4e-1: a conditional term, `if(c(Id), o(Id))`, `onlyif(..)` or `iff(..)` (`neg(o(Id))` for a denied outcome), keyed by
 * its bare text. `denied`: the reading claims `neg(T)` (R4e-3). `may` (R4e-6): MAY on the condition, `if(may(c(Id)), o(Id))`,
 * or under the hinge, `if(c(Id), may(o(Id)))`; a conditional meets only one with the same wrapper.
 */
export type Conditional = { reading: ReadingId; name: "if" | "onlyif" | "iff"; id: string; negOut: boolean; denied: boolean; may?: "cond" | "out" };

export type Translation = {
  program: string;
  /** The readings switched by `on(Id)`, in log order. `Id` is the reading id as a Clingo string. */
  readings: ReadingId[];
  /** Ground claim terms (stated, derived through a list or a universal, and nested) and their claims. */
  terms: Map<string, TermSource>;
  /** `c(Id)` (a hinge's condition), `o(Id)` (its outcome), `i(Id, K)` (an item of a whole-list denial) and their claims. */
  slots: Map<string, TermSource>;
  left: LeftOut[];
  notes: Note[];
  /** Each wrapped reading's wrap (a holder's view, a say word), so a question with the same wrap is matched inside it. */
  wraps: Map<ReadingId, Wrap>;
  /**
   * Each reading's witness lines: the facts its first-mention nouns bring (kind, count, details) and a first-mention
   * holder's kind, never its claim. A question keeps only these on (solver.md#jobs).
   */
  witnesses: Map<ReadingId, Set<string>>;
  /** Each holder term and its English possessive (*Azozon's*), for a reply that names whose view clashes. */
  holders: Map<string, string>;
  /** Each reading in the program: its parts and the ones its rows used (all of them, or it would be in `left`). */
  accounting: Map<ReadingId, { parts: Part[]; used: ReadonlySet<object> }>;
  /** A reading's turn persons as the program writes them (`sp("a")`, `listener(0)`), for {@link match}'s sites. */
  site: (reading: ReadingId) => TermSite;
  /** R4e-1: each conditional term, bare, with its reading. */
  conditionals: Map<string, Conditional>;
  /** R4e-2: for each conditional term B, the conditional terms A that say at least B (`fits(B, A)`). */
  conditionalFits: Map<string, Set<string>>;
};

export type Literal = { atom: string; premise?: string };
export type Subst = Map<Term, { text: string; term?: Term }>;
/**
 * `choice`: each `holds` rule is a choice (R3-1 rows 1, 4, 6, 8; R3-7). `gate`: a literal every rule of the content takes
 * beside `on(Id)` (R3-1 row 5, `maybe(Id)`). `deny`: the claim is denied (R3-7, no chance).
 */
export type Ctx = { reading: Reading; id: string; subst: Subst; asserted: boolean; out: string[]; wrap?: Wrap; choice?: boolean; gate?: string; deny?: boolean; every?: { list: Term; kind: string } };
/** R4b-16, R4b-17: a hinge on a closed universal, whose slots `c(Id, M)` / `o(Id, M)` are built per stated member M. */
export type EveryHinge = { reading: Reading; condSite: Reading; ctx: Ctx; cond: Claim; bound: Term[]; out: Claim; list: Term; kind: string; member: string; conditional: Omit<Conditional, "id"> };
export type Why = { construction: string; key?: string; reason: string };
/** Where MAY sits against a hinge: over it (a gate), under it (the outcome), or right before *because* (only the link). */
export type MayOver = "gate" | "outcome" | "link";
export type Frames = { hinge?: Frame; universal?: Frame; restrictor?: Frame; holder?: Frame; channel?: Frame; say?: Frame; may?: Frame; mayHost?: Frame; likely?: Frame; because?: Frame; zone?: Frame; standalone: Frame[]; other?: Frame };
