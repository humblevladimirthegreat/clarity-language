/**
 * Family profiles (interpreter.md#family-profiles): what each frame family is, from which the pair table is derived.
 *
 * Each family that pairs has a profile: where it sits (`seat`), how it orders against the rest of its clause (`order`),
 * what it stays outside of (`escapes`), the extra anchors a text-order row with it cites (`text`), and its members that
 * a row tells apart (`members`). {@link derivePairRows} builds every row of the pair table from the profiles by a fixed
 * rule order; a pair the rules cannot derive is in {@link EXCEPTIONS}, with its reason. {@link explainPair} names the
 * rule that decided a pair. `scope.ts` orders frames by the derived rows; `carry.ts` reads which members a carried
 * frame sits under and which claim nothing.
 */
import type { FrameFamily, FrameMember } from "./scope.js";

/** The decided rule: the earlier in the text covers the later. */
export const TEXT_ORDER = "clause.md#which-covers-which";
/** MAY right before the `/th/` word it covers. */
export const MAY_BEFORE = "already-still-yet.md#stage-of-change";
/** The holder covers its clause and any dependent sentence inside it. */
export const HOLDER = "holder.md#what-the-holder-covers";
const ACT_EDGE = "speech-moves.md#speech-act-statement-question-command";
const CALL = "speech-moves.md#vocative";
const HINGES = "dependents.md#hinges";
const STAND_IN_BACK = "stand-in-vowels.md#stand-in-back";
const STANDALONE = "verb-and-stance-joins.md#standalone-stance-joins";
/** A `/th/` word right before a `/th/` join is its item; with words between, it is a frame of its own. */
const REACH = "verb-and-stance-joins.md#stance-join-reach";
/** A channel follows text order: first, how you know the whole generalization; after a fence or restrictor, each case. */
const GENERALIZATION = "usually-vs-must.md#general-claims";
const CONTRARY = "contrary-to.md#contrary-to-stance";
/**
 * A channel is not part of what you claim, only what backs it: it is not under your feeling, your surprise or a cause
 * (attitude and mirative commute with it; it covers a hinge wherever it sits). MAY is part of the claim: text order.
 */
const BACKING = "evidentiality.md#evidence-clause";
const WHOSE_INTENTION = "want-and-decide.md#whose-intention";

type When = Partial<Record<FrameFamily, FrameMember[]>>;

/** One case of a pair row: `over` names the family that covers, `textOrder` the earlier over the later. */
export type PairCase =
  | { order: "textOrder"; anchors: string[]; when?: When }
  | { order: "over"; over: FrameFamily; anchors: string[]; when?: When }
  | { order: "commutes"; anchors: string[]; when?: When }
  | { order: "unsettled"; anchors: string[]; when?: When };

export type PairRow = { pair: [FrameFamily, FrameFamily]; kind: "rule" | "wordShape" | "commutes" | "unsettled"; cases: PairCase[] };

/** `edge`: outside the body, on the turn's left edge; `body`: in the body. */
export type Seat = "edge" | "body";

/** `text`: the earlier covers the later; `covers`: over everything in its clause, wherever it sits; `commutes`: with every frame. */
export type FamilyOrder = "text" | "covers" | "commutes";

/**
 * What a family or member stays outside of because it stays the speaker's: a holder's view (`holder`), a frame carried
 * from an earlier statement (`carried`). A remark's escape from the act is {@link FamilyProfile.remark}.
 */
export type Escape = "holder" | "carried";

/** Extra anchors a text-order row cites: against `with` (default: every family), never against `except`. */
type TextAnchor = { anchors: string[]; with?: FrameFamily[]; except?: FrameFamily[] };

/** A member's own case against one family, before the row's text order: it commutes, or its family covers. */
type MemberCase = { with: FrameFamily; order: "commutes" | "over"; anchors: string[] };

/** A member of a family that a row or a reader tells apart. */
export type MemberProfile = {
  id: string;
  /** The resolve stage's member tag, where pair rows match on it. */
  member?: FrameMember;
  /** The classification-table keys that are this member, where a reader matches on the key. */
  keys?: string[];
  /** A feeling word: a sake word with its horizon moved mid-word (how-you-feel.md#feeling-word). */
  feeling?: true;
  escapes?: Escape[];
  /** `false`: its content is not asserted, so the clause claims nothing. */
  claims?: false;
  cases?: MemberCase[];
  anchor: string;
};

export type FamilyProfile = {
  family: FrameFamily;
  seat: Seat;
  order: FamilyOrder;
  /** The anchor of `order` where it is not `text`. */
  orderAnchor?: string;
  /**
   * A remark of the speaker's on the claim: it escapes `force` (it stays yours and outside what is asked) and commutes
   * with another remark. The anchor is the page that says it stays outside a question.
   */
  remark?: string;
  /** What else it stays outside of, each with the anchor that says so. */
  escapes?: Partial<Record<Exclude<Escape, "carried">, string>>;
  /** The anchor a row with the act word over it cites, where its page states the pair (default: the act edge). */
  underForce?: string;
  /** A holder seam sits on its word: the holder over it is fixed by word shape, citing this. */
  holderSeam?: string;
  text?: TextAnchor[];
  members?: MemberProfile[];
  /** Two frames of the family have a row of their own. */
  self?: true;
};

/** Families with a `/th/` whole-clause frame that MAY right before covers, or a `/th/` join right after takes as its item. */
const MAY_FAMILIES: FrameFamily[] = ["stance", "intention", "phase", "notional", "mirative", "sake", "attitude", "hinge"];
const REACH_FAMILIES: FrameFamily[] = ["stance", "intention", "hinge", "sake", "attitude", "notional", "mirative", "contrary"];

/**
 * The profiles. Their order is the order a text-order row lists its extra anchors in, and the order of the remarks'
 * anchors on the rows where two remarks commute.
 */
export const PROFILES: readonly FamilyProfile[] = [
  {
    family: "force",
    seat: "edge",
    order: "text",
    self: true,
    members: [{ id: "repeat", member: "repeat", anchor: "more-turn-words.md#doubled-act" }],
  },
  { family: "call", seat: "edge", order: "commutes", orderAnchor: CALL, self: true },
  {
    family: "stance",
    seat: "body",
    order: "text",
    underForce: WHOSE_INTENTION,
    holderSeam: HOLDER,
    self: true,
    text: [
      { anchors: [MAY_BEFORE], with: MAY_FAMILIES },
      { anchors: [GENERALIZATION], with: ["binder", "occasion"] },
    ],
    members: [
      {
        id: "channel",
        member: "channel",
        anchor: "evidentiality.md#evidence-clause",
        cases: [
          { with: "attitude", order: "commutes", anchors: [BACKING] },
          { with: "mirative", order: "commutes", anchors: [BACKING] },
          { with: "hinge", order: "over", anchors: [BACKING, "usually-vs-must.md#how-things-work"] },
        ],
      },
    ],
  },
  {
    family: "hinge",
    seat: "body",
    order: "text",
    underForce: "causation.md#if",
    text: [{ anchors: [HINGES] }, { anchors: [STAND_IN_BACK], except: ["binder"] }],
  },
  {
    family: "polarity",
    seat: "body",
    order: "text",
    text: [
      { anchors: [STANDALONE], except: ["binder"] },
      { anchors: [REACH], with: REACH_FAMILIES },
    ],
  },
  { family: "mirative", seat: "body", order: "text", remark: "mirative.md#mirative" },
  {
    family: "attitude",
    seat: "body",
    order: "text",
    remark: "feelings.md#speaker-attitude",
    escapes: { holder: HOLDER },
    members: [
      { id: "speaker-attitude", keys: ["slot:th"], escapes: ["carried"], anchor: "evidentiality.md#carry-forward" },
    ],
  },
  {
    family: "sake",
    seat: "body",
    order: "text",
    remark: "for-a-sake.md#whose-stake",
    members: [{ id: "feeling", feeling: true, escapes: ["carried"], anchor: "how-you-feel.md#feeling-word" }],
  },
  { family: "contrary", seat: "body", order: "text", remark: CONTRARY },
  { family: "say", seat: "body", order: "text" },
  { family: "holder", seat: "body", order: "covers", orderAnchor: HOLDER, underForce: HOLDER },
  {
    family: "intention",
    seat: "body",
    order: "text",
    underForce: WHOSE_INTENTION,
    holderSeam: WHOSE_INTENTION,
    self: true,
    text: [{ anchors: ["intention.md#plan"], with: ["intention"] }],
    members: [
      { id: "aim", keys: ["overlay:want:th", "overlay:plan:th", "overlay:decision:th"], claims: false, anchor: "evidentiality.md#carry-forward" },
    ],
  },
  { family: "ability", seat: "body", order: "text" },
  { family: "phase", seat: "body", order: "text" },
  {
    family: "residue",
    seat: "body",
    order: "text",
    members: [
      {
        id: "former",
        member: "former",
        anchor: "residue-and-former.md#former-climate",
        cases: [{ with: "occasion", order: "over", anchors: ["residue-and-former.md#former-climate"] }],
      },
    ],
  },
  { family: "notional", seat: "body", order: "text", holderSeam: "notional.md#follow-up-endings-notional" },
  { family: "occasion", seat: "body", order: "text" },
  {
    family: "binder",
    seat: "body",
    order: "text",
    self: true,
    text: [{ anchors: ["joins.md#everything-ua"], with: ["binder"] }],
  },
];

const over = (family: FrameFamily, ...anchors: string[]): PairCase => ({ order: "over", over: family, anchors });
const commutes = (...anchors: string[]): PairCase => ({ order: "commutes", anchors });

/** A pair the rules cannot derive: its row, and why. */
export type PairException = { id: string; pair: [FrameFamily, FrameFamily]; kind: PairRow["kind"]; cases: PairCase[]; reason: string };

/** The pairs the rules cannot derive (interpreter.md#family-profiles). */
export const EXCEPTIONS: readonly PairException[] = [
  {
    id: "hinge-occasion",
    pair: ["hinge", "occasion"],
    kind: "rule",
    cases: [over("occasion", "usually-vs-must.md#how-things-work")],
    reason: "the hinge holds for each occasion, wherever it sits",
  },
  {
    id: "contrary-stance",
    pair: ["stance", "contrary"],
    kind: "commutes",
    cases: [commutes(CONTRARY)],
    reason: "only the word after `uom` is what the event goes against; a stance anywhere else still applies to the claim",
  },
  {
    id: "contrary-intention",
    pair: ["intention", "contrary"],
    kind: "commutes",
    cases: [commutes(CONTRARY)],
    reason: "as with a stance: only the word after `uom` is what the event goes against",
  },
  {
    id: "stacked-acts",
    pair: ["force", "force"],
    kind: "rule",
    cases: [
      { ...commutes("more-turn-words.md#doubled-act"), when: { force: ["repeat"] } },
      { order: "textOrder", anchors: ["more-turn-words.md#stacked-acts"] },
    ],
    reason: "two act words are both on the edge: a doubled one commutes, else the first is the act and covers the second, as the act pages state it",
  },
];

/** One side of a pair: a family, and the member the resolve stage tagged, if any. */
export type PairSide = { family: FrameFamily; member?: string };

/** Whether a case's member condition holds for the two frames. */
export function caseMatches(when: When | undefined, a: PairSide, b: PairSide): boolean {
  if (!when) return true;
  return Object.entries(when).every(([family, members]) =>
    [a, b].some((side) => side.family === family && side.member !== undefined && (members as string[]).includes(side.member)),
  );
}

type Derived = { rule: string; row: PairRow };

const PROFILE = new Map(PROFILES.map((p) => [p.family, p]));

function textAnchors(a: FamilyProfile, b: FamilyProfile): string[] {
  const anchors: string[] = [];
  for (const profile of PROFILES) {
    if (profile !== a && profile !== b) continue;
    const other = profile === a ? b : a;
    for (const t of profile.text ?? []) {
      if (t.with && !t.with.includes(other.family)) continue;
      if (t.except?.includes(other.family)) continue;
      for (const anchor of t.anchors) if (!anchors.includes(anchor)) anchors.push(anchor);
    }
  }
  return anchors;
}

function memberCases(a: FamilyProfile, b: FamilyProfile): PairCase[] {
  const cases: PairCase[] = [];
  for (const [self, other] of [
    [a, b],
    [b, a],
  ] as const) {
    for (const m of self.members ?? []) {
      for (const c of m.cases ?? []) {
        if (c.with !== other.family || !m.member) continue;
        const when: When = { [self.family]: [m.member] };
        cases.push(c.order === "over" ? { ...over(self.family, ...c.anchors), when } : { ...commutes(...c.anchors), when });
      }
    }
    if (a === b) break;
  }
  return cases;
}

/** The rule order: call, edge, both escape each other, escape, covers, member case, text. Exceptions come first. */
function derive(a: FamilyProfile, b: FamilyProfile): Derived {
  const pair: [FrameFamily, FrameFamily] = [a.family, b.family];
  const exception = EXCEPTIONS.find((e) => (e.pair[0] === a.family && e.pair[1] === b.family) || (e.pair[0] === b.family && e.pair[1] === a.family));
  if (exception) return { rule: `exception:${exception.id}`, row: { pair, kind: exception.kind, cases: exception.cases } };
  const commuting = [a, b].find((p) => p.order === "commutes");
  if (commuting) return { rule: commuting.family, row: { pair, kind: "commutes", cases: [commutes(commuting.orderAnchor ?? "")] } };
  for (const [x, y] of [
    [a, b],
    [b, a],
  ] as const) {
    if (x.seat === "edge" && y.seat === "body" && !y.remark) {
      return { rule: "edge", row: { pair, kind: "rule", cases: [over(x.family, y.underForce ?? ACT_EDGE)] } };
    }
  }
  if (a !== b && a.remark && b.remark) {
    const anchors = PROFILES.flatMap((p) => (p.remark ? [p.remark] : []));
    return { rule: "escape:each-other", row: { pair, kind: "commutes", cases: [commutes(...anchors)] } };
  }
  for (const [x, y] of [
    [a, b],
    [b, a],
  ] as const) {
    const escapes: Partial<Record<"force" | "holder", string>> = { force: x.remark, holder: x.escapes?.holder };
    for (const escape of ["force", "holder"] as const) {
      const anchor = escapes[escape];
      if (y.family === escape && anchor) return { rule: `escape:${escape}`, row: { pair, kind: "rule", cases: [over(x.family, anchor)] } };
    }
  }
  for (const [x, y] of [
    [a, b],
    [b, a],
  ] as const) {
    if (x.order !== "covers" || x === y) continue;
    if (y.holderSeam) return { rule: `seam:${x.family}`, row: { pair, kind: "wordShape", cases: [over(x.family, y.holderSeam)] } };
    return { rule: `covers:${x.family}`, row: { pair, kind: "rule", cases: [over(x.family, x.orderAnchor ?? "")] } };
  }
  const text: PairCase = { order: "textOrder", anchors: [TEXT_ORDER, ...textAnchors(a, b)] };
  return { rule: "text", row: { pair, kind: "rule", cases: [...memberCases(a, b), text] } };
}

function pairKey(a: FrameFamily, b: FrameFamily): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

function deriveAll(): Map<string, Derived> {
  const out = new Map<string, Derived>();
  PROFILES.forEach((a, i) => {
    for (const b of PROFILES.slice(i + 1)) out.set(pairKey(a.family, b.family), derive(a, b));
  });
  for (const p of PROFILES) if (p.self) out.set(pairKey(p.family, p.family), derive(p, p));
  return out;
}

const DERIVED = deriveAll();

/** The pair table (interpreter.md#pair-table): one row per pair of families that pair, and per family with a same-family row. */
export function derivePairRows(): PairRow[] {
  return [...DERIVED.values()].map((d) => d.row);
}

/**
 * The rule that decided a pair: `call`, `edge`, `escape:each-other`, `escape:force`, `escape:holder`, `seam:holder`,
 * `covers:holder`, `member:<id>` (a member case that matches the two sides), `exception:<id>`, `text`, or `never` for
 * a family that never pairs.
 */
export function explainPair(a: FrameFamily | PairSide, b: FrameFamily | PairSide): string {
  const [x, y] = [a, b].map((s) => (typeof s === "string" ? { family: s } : s)) as [PairSide, PairSide];
  if (!PROFILE.has(x.family) || !PROFILE.has(y.family)) return "never";
  const derived = DERIVED.get(pairKey(x.family, y.family));
  if (!derived) return "text";
  if (derived.rule.startsWith("exception:")) return derived.rule;
  const found = derived.row.cases.find((c) => caseMatches(c.when, x, y));
  if (found?.when) {
    const [family, members] = Object.entries(found.when)[0] ?? [];
    const member = PROFILE.get(family as FrameFamily)?.members?.find((m) => m.member && members?.includes(m.member));
    return `member:${member?.id ?? "?"}`;
  }
  return derived.rule;
}

/** The members of each family that satisfy `test`. */
export function membersWhere(test: (member: MemberProfile) => boolean): { family: FrameFamily; member: MemberProfile }[] {
  return PROFILES.flatMap((p) => (p.members ?? []).filter(test).map((member) => ({ family: p.family, member })));
}
